// Sessions services: the domain API the UI talks to.
//
// Everything here is storage-engine agnostic -- it goes through the StorageService handed
// in by createServices(), so the Node unit tests exercise exactly the code the browser
// runs, just over a memory backend.
//
// Two invariants the services are responsible for:
//
//   1. Bidirectional links stay in sync. A file belongs to a session via
//      file.session_ids, and the session lists it in session.file_ids; both sides are
//      written together. Same for notes. Deleting an entity scrubs its id from everything
//      that referenced it.
//   2. Setups are append-only. "Editing" a setup writes a NEW record whose supersedes_id
//      points at the old one, so a file or session that referenced the old setup keeps
//      reading the values that were actually on the bike at the time.

(() => {
  const Model = (typeof window !== 'undefined' && window.SessionsModel)
    || (typeof require === 'function' ? require('./sessions-model.js') : null);
  const Storage = (typeof window !== 'undefined' && window.SessionsStorage)
    || (typeof require === 'function' ? require('./sessions-storage.js') : null);

  function createServices(options) {
    const opts = options || {};
    const storage = opts.storage || Storage.createStorageService(opts);
    const files = storage.files;

    function initDB() {
      return storage.initDB();
    }

    // ── UserService ─────────────────────────────────────────────────────────
    // Notes need an author, but the app has no login, so the first run mints a
    // device-local user (user_local_*). If a cloud login is added later,
    // migrateLocalUserToCloud rewrites every reference to the claimed id.

    let currentUserPromise = null;

    const UserService = {
      listUsers(query) {
        return storage.list('users', query);
      },

      getUser(id) {
        return storage.get('users', id);
      },

      updateUser(id, patch) {
        return storage.update('users', id, patch);
      },

      /**
       * Renames the current author (the local user, creating one first if this is the
       * very first run) -- what the User tab's "Author Name" field writes to. Notes
       * already written keep pointing at the same user id, so their author display name
       * updates retroactively along with this one.
       */
      setLocalUserName(name) {
        const trimmed = String(name == null ? '' : name).trim();
        return UserService.ensureLocalUser().then((user) => (
          UserService.updateUser(user.id, { name: trimmed || 'This device' })
        ));
      },

      createLocalUser(name, role) {
        return storage.create('users', {
          id: Model.newLocalUserId(),
          name: name || 'This device',
          role: role || 'local'
        });
      },

      /**
       * Resolves the current author, creating the device-local user on first run.
       * The chosen id is remembered in appMetadata so the same author is picked up
       * after a reload.
       * @returns {Promise<Object>} User
       */
      ensureLocalUser() {
        if (currentUserPromise) return currentUserPromise;
        currentUserPromise = initDB()
          .then(() => storage.getAppMetadata())
          .then((metadata) => {
            const currentId = metadata && metadata.currentUserId;
            if (!currentId) return null;
            return storage.get('users', currentId);
          })
          .then((existing) => {
            if (existing) return existing;
            // No remembered user: adopt an existing local user if one is lying around
            // (e.g. restored from a backup), else mint one.
            return storage.list('users', { where: { role: 'local' } }).then((locals) => {
              if (locals && locals.length) return locals[0];
              return UserService.createLocalUser('This device', 'local');
            }).then((user) => UserService.setCurrentUser(user.id).then(() => user));
          })
          .catch((err) => {
            currentUserPromise = null;
            throw err;
          });
        return currentUserPromise;
      },

      setCurrentUser(userId) {
        currentUserPromise = null; // re-resolve on next ensureLocalUser()
        return storage.update('appMetadata', Storage.APP_METADATA_ID, { currentUserId: userId })
          .then(() => userId);
      },

      /**
       * Reassigns everything authored by a device-local user to a cloud user: the
       * "claim all" path after a login. Rewrites note.author_id and setup author fields,
       * then removes the now-redundant local user record unless keepLocalUser is set.
       * @param {string} localUserId
       * @param {string} cloudUserId
       * @param {{ keepLocalUser?: boolean, cloudUser?: Object }} [migrateOptions]
       */
      migrateLocalUserToCloud(localUserId, cloudUserId, migrateOptions) {
        const migrateOpts = migrateOptions || {};
        if (!localUserId || !cloudUserId) {
          return Promise.reject(new Error('migrateLocalUserToCloud requires both ids.'));
        }
        const counts = { notes: 0, setups: 0 };

        return initDB()
          .then(() => storage.get('users', cloudUserId))
          .then((existingCloud) => {
            if (existingCloud) return existingCloud;
            const seed = Object.assign({ name: 'Claimed account' }, migrateOpts.cloudUser, { id: cloudUserId });
            return storage.create('users', seed);
          })
          .then(() => storage.list('notes', { where: { author_id: localUserId } }))
          .then((notes) => Promise.all((notes || []).map((note) => {
            counts.notes += 1;
            return storage.update('notes', note.id, { author_id: cloudUserId });
          })))
          .then(() => storage.list('setups'))
          .then((setups) => Promise.all((setups || [])
            .filter((s) => s.author_id === localUserId || s.created_by === localUserId)
            .map((setup) => {
              counts.setups += 1;
              const patch = {};
              if (setup.author_id === localUserId) patch.author_id = cloudUserId;
              if (setup.created_by === localUserId) patch.created_by = cloudUserId;
              return storage.update('setups', setup.id, patch);
            })))
          .then(() => (migrateOpts.keepLocalUser ? null : storage.delete('users', localUserId)))
          .then(() => UserService.setCurrentUser(cloudUserId))
          .then(() => ({ localUserId, cloudUserId, counts }));
      }
    };

    // ── RiderService / VehicleService ───────────────────────────────────────

    const RiderService = {
      createRider: (data) => storage.create('riders', data),
      updateRider: (id, patch) => storage.update('riders', id, patch),
      getRider: (id) => storage.get('riders', id),
      listRiders: (query) => storage.list('riders', query),
      deleteRider: (id) => cascadeDelete('riders', id)
    };

    const VehicleService = {
      createVehicle: (data) => storage.create('vehicles', data),
      // Note this never touches setups: the vehicle is the identity, setups are the
      // time-versioned records hanging off it.
      updateVehicle: (id, patch) => storage.update('vehicles', id, patch),
      getVehicle: (id) => storage.get('vehicles', id),
      listVehicles: (query) => storage.list('vehicles', query),
      deleteVehicle: (id) => cascadeDelete('vehicles', id)
    };

    // ── SetupService ────────────────────────────────────────────────────────

    const SetupService = {
      /**
       * @param {{vehicle_id: string, session_id?: string, author_id?: string,
       *          name?: string, values: Object, notes?: string, tags?: string[],
       *          timestamp?: string, supersedes_id?: string}} data
       */
      createSetup(data) {
        const payload = Object.assign({}, data);
        if (!payload.vehicle_id) return Promise.reject(new Error('createSetup requires vehicle_id.'));
        payload.timestamp = payload.timestamp || Model.nowIso();
        return storage.create('setups', payload);
      },

      /**
       * The "edit a setup" entry point. Deliberately does NOT mutate `setupId`: it reads
       * that record, overlays the changed values, and writes a new one pointing back at
       * it, so history is preserved. Use getSetupsByVehicle to see the chain.
       * @param {string} setupId the setup being revised
       * @param {{values?: Object, name?: string, notes?: string, tags?: string[], author_id?: string}} changes
       */
      reviseSetup(setupId, changes) {
        const edit = changes || {};
        return storage.get('setups', setupId).then((previous) => {
          if (!previous) return Promise.reject(new Error('No setup with id ' + setupId));
          return storage.create('setups', {
            vehicle_id: previous.vehicle_id,
            session_id: ('session_id' in edit) ? edit.session_id : previous.session_id,
            author_id: edit.author_id || previous.author_id,
            name: ('name' in edit) ? edit.name : previous.name,
            // Values merge onto the previous setup so a revision can change one clicker
            // without restating the whole sheet.
            values: Object.assign({}, previous.values, edit.values || {}),
            notes: ('notes' in edit) ? edit.notes : previous.notes,
            tags: ('tags' in edit) ? edit.tags : previous.tags,
            supersedes_id: previous.id,
            timestamp: edit.timestamp || Model.nowIso()
          });
        });
      },

      getSetup: (id) => storage.get('setups', id),

      getSetupsByVehicle(vehicleId, query) {
        return storage.list('setups', Object.assign(
          { where: { vehicle_id: vehicleId }, sortBy: 'timestamp', sortDir: 'desc' },
          query
        ));
      },

      /**
       * Most relevant setup for a vehicle: the newest one recorded during `sessionId`
       * when given, otherwise the newest overall. Returns null when the vehicle has none.
       *
       * Sorted by timestamp desc, but timestamp alone is not a reliable tiebreaker: two
       * revisions made in the same millisecond (setSessionMass called twice in a row is
       * enough to hit this) tie, and a plain sort can then hand back the one that was
       * actually superseded. The supersedes_id chain is unambiguous, so any setup that
       * some OTHER setup names as its supersedes_id is filtered out first; only after
       * that does timestamp break remaining ties.
       */
      getLatestSetup(vehicleId, sessionId) {
        return SetupService.getSetupsByVehicle(vehicleId).then((setups) => {
          if (!setups || !setups.length) return null;
          const supersededIds = new Set(setups.map((s) => s.supersedes_id).filter(Boolean));
          const preferNotSuperseded = (list) => {
            const tip = list.filter((s) => !supersededIds.has(s.id));
            return tip.length ? tip[0] : list[0];
          };
          if (sessionId) {
            const scoped = setups.filter((s) => s.session_id === sessionId);
            if (scoped.length) return preferNotSuperseded(scoped);
          }
          return preferNotSuperseded(setups);
        });
      },

      /** Links a setup to a stored log file (which setup the bike ran for that log). */
      applySetupToFile(fileId, setupId) {
        return FileService.updateFileLinks(fileId, { setup_id: setupId });
      },

      /**
       * The vehicle's mass right now: its most relevant Setup's values.mass_kg override
       * (session-scoped first, else the newest one for the vehicle at all) when present,
       * else Vehicle.mass_kg. Returns { mass_kg, source, setup } so a caller can show
       * where the number came from -- `source` is 'setup' or 'vehicle', or null if
       * neither has a mass on file. `setup` is the Setup the override came from, if any.
       */
      getEffectiveMass(vehicleId, sessionId) {
        return Promise.all([
          SetupService.getLatestSetup(vehicleId, sessionId),
          VehicleService.getVehicle(vehicleId)
        ]).then((results) => {
          const setup = results[0];
          const vehicle = results[1];
          if (setup && Number.isFinite(setup.values && setup.values.mass_kg)) {
            return { mass_kg: setup.values.mass_kg, source: 'setup', setup };
          }
          if (vehicle && Number.isFinite(vehicle.mass_kg)) {
            return { mass_kg: vehicle.mass_kg, source: 'vehicle', setup: null };
          }
          return { mass_kg: null, source: null, setup: null };
        });
      },

      /**
       * Sets the vehicle's mass for one specific session: revises the session's existing
       * setup for this vehicle if there is one, else starts a new one. Kept separate from
       * a general-purpose setup editor (there isn't one yet) so this one common case --
       * "the bike weighed X today because of fuel load" -- works without needing to build
       * a full values editor first.
       */
      setSessionMass(vehicleId, sessionId, massKg, authorId) {
        return SetupService.getSetupsByVehicle(vehicleId).then((setups) => {
          const existing = setups.find((s) => s.session_id === sessionId);
          if (existing) {
            return SetupService.reviseSetup(existing.id, { values: { mass_kg: massKg }, author_id: authorId });
          }
          return SetupService.createSetup({
            vehicle_id: vehicleId, session_id: sessionId, author_id: authorId,
            name: 'Session mass', values: { mass_kg: massKg }
          });
        });
      },

      deleteSetup: (id) => cascadeDelete('setups', id)
    };

    // ── EventService ────────────────────────────────────────────────────────
    // A meeting a Session belongs to (e.g. "MotoAmerica VIR 2026"). See the Event/Session
    // typedefs in sessions-model.js for why Session.name stays freeform (P1, Q2, Race1,
    // ...) rather than Event owning a fixed list of session types.

    const EventService = {
      createEvent: (data) => storage.create('events', data),
      updateEvent: (id, patch) => storage.update('events', id, patch),
      getEvent: (id) => storage.get('events', id),
      listEvents(query) {
        return storage.list('events', Object.assign({ sortBy: 'start_date', sortDir: 'desc' }, query));
      },
      /** Unlinks every session from this event (they are kept), then deletes it. */
      deleteEvent: (id) => cascadeDelete('events', id)
    };

    // ── SessionService ──────────────────────────────────────────────────────

    // Adds `id` to a session's list field, writing only when it is actually new so
    // repeated calls are cheap and idempotent.
    function addIdToSession(sessionId, field, id) {
      return storage.get('sessions', sessionId).then((session) => {
        if (!session) return null;
        const next = Model.uniqueStrings((session[field] || []).concat([id]));
        if (next.length === (session[field] || []).length) return session;
        const patch = {};
        patch[field] = next;
        return storage.update('sessions', sessionId, patch);
      });
    }

    function removeIdFromSession(sessionId, field, id) {
      return storage.get('sessions', sessionId).then((session) => {
        if (!session) return null;
        const current = session[field] || [];
        const next = current.filter((v) => v !== id);
        if (next.length === current.length) return session;
        const patch = {};
        patch[field] = next;
        return storage.update('sessions', sessionId, patch);
      });
    }

    const SessionService = {
      createSession: (data) => storage.create('sessions', data),
      updateSession: (id, patch) => storage.update('sessions', id, patch),
      getSession: (id) => storage.get('sessions', id),

      listSessions(query) {
        return storage.list('sessions', Object.assign(
          { sortBy: 'start_time', sortDir: 'desc' },
          query
        )).then((rows) => {
          // start_time is optional; fall back to created_at so a session without one
          // still lands in a sensible spot rather than at the very end.
          if (query && query.sortBy) return rows;
          return rows.slice().sort((a, b) => {
            const av = a.start_time || a.created_at || '';
            const bv = b.start_time || b.created_at || '';
            return String(bv).localeCompare(String(av));
          });
        });
      },

      /** Removes the session and scrubs its id from every file and note that referenced it. */
      deleteSession: (id) => cascadeDelete('sessions', id),

      setEvent: (sessionId, eventId) => storage.update('sessions', sessionId, { event_id: eventId || null }),

      /**
       * List sessions grouped by event -- newest event first, sessions within an event
       * newest first -- for a UI that wants to render an event-grouped picker rather
       * than a flat list. Sessions with no event_id come back as their own
       * { event: null, sessions } group, last.
       */
      listSessionsGroupedByEvent(query) {
        return Promise.all([SessionService.listSessions(query), storage.list('events')]).then((results) => {
          const sessions = results[0];
          const eventById = new Map(results[1].map((e) => [e.id, e]));
          const groups = new Map(); // event id (or '' for none) -> { event, sessions }
          sessions.forEach((session) => {
            const key = session.event_id || '';
            if (!groups.has(key)) {
              groups.set(key, { event: key ? (eventById.get(key) || null) : null, sessions: [] });
            }
            groups.get(key).sessions.push(session);
          });
          const withEvent = Array.from(groups.values()).filter((g) => g.event);
          const withoutEvent = Array.from(groups.values()).filter((g) => !g.event);
          withEvent.sort((a, b) => String(b.event.start_date || '').localeCompare(String(a.event.start_date || '')));
          return withEvent.concat(withoutEvent);
        });
      },

      /** The rider's actual weight for this session: its override if set, else Rider.weight_kg. */
      getEffectiveRiderWeight(sessionId, riderId) {
        return storage.get('sessions', sessionId).then((session) => {
          const override = session && session.rider_weight_overrides_kg && session.rider_weight_overrides_kg[riderId];
          if (Number.isFinite(override)) return { weight_kg: override, source: 'override' };
          return storage.get('riders', riderId).then((rider) => {
            if (rider && Number.isFinite(rider.weight_kg)) return { weight_kg: rider.weight_kg, source: 'rider' };
            return { weight_kg: null, source: null };
          });
        });
      },

      /** Records what a rider actually weighed for this one session. Pass null/undefined to clear it. */
      setRiderWeightOverride(sessionId, riderId, weightKg) {
        return storage.get('sessions', sessionId).then((session) => {
          if (!session) return null;
          const overrides = Object.assign({}, session.rider_weight_overrides_kg);
          if (weightKg == null || weightKg === '') delete overrides[riderId];
          else overrides[riderId] = weightKg;
          return storage.update('sessions', sessionId, { rider_weight_overrides_kg: overrides });
        });
      },

      addFileToSession(sessionId, fileId) {
        return Promise.all([
          addIdToSession(sessionId, 'file_ids', fileId),
          FileService.attachFileToSession(fileId, sessionId)
        ]).then((results) => results[0]);
      },

      removeFileFromSession(sessionId, fileId) {
        return Promise.all([
          removeIdFromSession(sessionId, 'file_ids', fileId),
          FileService.detachFileFromSession(fileId, sessionId)
        ]).then((results) => results[0]);
      },

      addVehicleToSession: (sessionId, vehicleId) => addIdToSession(sessionId, 'vehicle_ids', vehicleId),
      removeVehicleFromSession: (sessionId, vehicleId) => removeIdFromSession(sessionId, 'vehicle_ids', vehicleId),
      addRiderToSession: (sessionId, riderId) => addIdToSession(sessionId, 'rider_ids', riderId),
      removeRiderFromSession: (sessionId, riderId) => removeIdFromSession(sessionId, 'rider_ids', riderId),

      addNoteToSession(sessionId, noteId) {
        return Promise.all([
          addIdToSession(sessionId, 'note_ids', noteId),
          NoteService.linkNoteToSessions(noteId, [sessionId])
        ]).then((results) => results[0]);
      },

      // ── KPIs ──────────────────────────────────────────────────────────────
      // Stored inline on the session (a short, always-displayed list), keyed by `type`:
      // adding an existing type replaces its value rather than appending a duplicate.

      addKPI(sessionId, kpi) {
        const normalized = Model.normalizeKpi(kpi);
        if (!normalized) return Promise.reject(new Error('A KPI needs a non-empty type.'));
        return storage.get('sessions', sessionId).then((session) => {
          if (!session) return null;
          const kpis = (session.kpis || []).slice();
          const idx = kpis.findIndex((k) => k.type === normalized.type);
          if (idx === -1) kpis.push(normalized); else kpis[idx] = normalized;
          return storage.update('sessions', sessionId, { kpis });
        });
      },

      updateKPI(sessionId, type, kpiValue) {
        return SessionService.addKPI(sessionId, { type, kpi: kpiValue });
      },

      removeKPI(sessionId, type) {
        return storage.get('sessions', sessionId).then((session) => {
          if (!session) return null;
          const kpis = (session.kpis || []).filter((k) => k.type !== type);
          return storage.update('sessions', sessionId, { kpis });
        });
      },

      getKPIs(sessionId) {
        return storage.get('sessions', sessionId).then((session) => (session && session.kpis) || []);
      },

      /**
       * Everything attached to a session, resolved in one pass -- what the session panel
       * renders from.
       */
      getSessionDetail(sessionId) {
        return storage.get('sessions', sessionId).then((session) => {
          if (!session) return null;
          return Promise.all([
            Promise.all((session.vehicle_ids || []).map((id) => storage.get('vehicles', id))),
            Promise.all((session.rider_ids || []).map((id) => storage.get('riders', id))),
            FileService.listFilesForSession(sessionId),
            NoteService.listNotes({ session_id: sessionId })
          ]).then((parts) => ({
            session,
            vehicles: parts[0].filter(Boolean),
            riders: parts[1].filter(Boolean),
            files: parts[2],
            notes: parts[3]
          }));
        });
      }
    };

    // ── NoteService ─────────────────────────────────────────────────────────

    const NoteService = {
      /**
       * Creates a note, defaulting timestamp and author to now / the current local user.
       * Also appends the note id to every session it links to.
       */
      createNote(noteData) {
        const data = Object.assign({}, noteData);
        const authorPromise = data.author_id
          ? Promise.resolve({ id: data.author_id })
          : UserService.ensureLocalUser().catch(() => null);

        return authorPromise.then((author) => {
          if (author && author.id) data.author_id = author.id;
          data.timestamp = data.timestamp || Model.nowIso();
          return storage.create('notes', data);
        }).then((note) => syncSessionBackrefs('note_ids', note.id, note.session_ids)
          .then(() => note));
      },

      updateNote(noteId, patch) {
        return storage.get('notes', noteId).then((existing) => {
          if (!existing) return null;
          return storage.update('notes', noteId, patch).then((updated) => {
            if (!updated || !patch || !('session_ids' in patch)) return updated;
            return syncSessionBackrefs('note_ids', noteId, updated.session_ids, existing.session_ids)
              .then(() => updated);
          });
        });
      },

      getNote: (id) => storage.get('notes', id),

      /** Adds sessions to a note's links without dropping the ones already there. */
      linkNoteToSessions(noteId, sessionIds) {
        return storage.get('notes', noteId).then((note) => {
          if (!note) return null;
          const next = Model.uniqueStrings((note.session_ids || []).concat(Model.asArray(sessionIds)));
          if (next.length === (note.session_ids || []).length) return note;
          return storage.update('notes', noteId, { session_ids: next })
            .then((updated) => syncSessionBackrefs('note_ids', noteId, next, note.session_ids)
              .then(() => updated));
        });
      },

      unlinkNoteFromSession(noteId, sessionId) {
        return storage.get('notes', noteId).then((note) => {
          if (!note) return null;
          const next = (note.session_ids || []).filter((id) => id !== sessionId);
          return storage.update('notes', noteId, { session_ids: next })
            .then((updated) => removeIdFromSession(sessionId, 'note_ids', noteId).then(() => updated));
        });
      },

      /**
       * @param {{session_id?: string, session_ids?: string[], file_id?: string,
       *          vehicle_id?: string, rider_id?: string, author_id?: string, type?: string,
       *          tags?: string[], text?: string, dateRange?: Object, limit?: number}} [filter]
       */
      listNotes(filter) {
        const f = filter || {};
        const where = {};
        if (f.session_id) where.session_ids = [f.session_id];
        if (f.session_ids) where.session_ids = Model.asArray(f.session_ids);
        if (f.file_id) where.file_ids = [f.file_id];
        if (f.vehicle_id) where.vehicle_id = f.vehicle_id;
        if (f.rider_id) where.rider_id = f.rider_id;
        if (f.author_id) where.author_id = f.author_id;
        if (f.type) where.type = f.type;
        if (f.tags) where.tags = Model.asArray(f.tags);

        return storage.list('notes', {
          where,
          text: f.text,
          textFields: ['content', 'tags'],
          dateRange: f.dateRange,
          sortBy: f.sortBy || 'timestamp',
          sortDir: f.sortDir || 'desc',
          limit: f.limit,
          offset: f.offset
        });
      },

      /**
       * Free-text note search. Tokenises the query and requires every token to appear in
       * the note's content or tags. A linear scan rather than a maintained inverted
       * index: at realistic note counts it is well under a frame, and it cannot go stale.
       */
      searchNotes(criteria) {
        return NoteService.listNotes(criteria || {});
      },

      deleteNote: (id) => cascadeDelete('notes', id),

      attachMediaToNote(noteId, mediaRef) {
        const ref = Model.normalizeMediaRef(mediaRef);
        if (!ref) return Promise.reject(new Error('Media needs an id or a url.'));
        return storage.get('notes', noteId).then((note) => {
          if (!note) return null;
          return storage.update('notes', noteId, { media: (note.media || []).concat([ref]) });
        });
      }
    };

    // ── FileService ─────────────────────────────────────────────────────────
    // Files live in the csvPlotterFiles store (raw text + hash + importer config), which
    // predates sessions; the session link fields are extra columns on those same records.

    function touchFile(record) {
      return Object.assign({}, record, { updated_at: Model.nowIso() });
    }

    const FileService = {
      listFiles(query) {
        return files.getAll().then((rows) => Storage.applyQuery(rows || [], query));
      },

      getFile: (id) => files.get(id),
      getFileByName: (name) => files.getByName(name),

      listFilesForSession(sessionId) {
        return files.getAll().then((rows) => (rows || [])
          .filter((row) => row && (row.session_ids || []).indexOf(sessionId) !== -1));
      },

      /**
       * Upserts a stored log file, keyed by filename. An existing record keeps its id and
       * its session links, so re-opening (or re-uploading) a file never orphans it from
       * the sessions it was attached to -- it just refreshes the text and metadata.
       * This is the function app.js's quick-plot path calls, and its behaviour for a
       * first-time file is unchanged from the pre-sessions version.
       */
      storeFile(name, text, hash, fileMeta) {
        return files.getByName(name).then((existing) => {
          const stamp = Model.nowIso();
          if (existing) {
            return files.put(Object.assign({}, existing, {
              text,
              storedAt: stamp,
              hash: hash || existing.hash,
              fileMeta: fileMeta || existing.fileMeta,
              filetype: existing.filetype || Model.filetypeFromName(name),
              updated_at: stamp
            }));
          }
          return files.put(Model.normalize('files', {
            name,
            text,
            hash,
            fileMeta,
            storedAt: stamp
          }));
        });
      },

      /**
       * Creates/updates the File record for a parsed log and returns it. `parsed` is the
       * plotter's in-memory log object, used only to derive metadata (columns, row count).
       */
      ingestCSV(name, text, parsed, ingestOptions) {
        const ingestOpts = ingestOptions || {};
        const metadata = Object.assign({}, ingestOpts.metadata);
        if (parsed) {
          if (Array.isArray(parsed.columns)) metadata.columns = parsed.columns.slice();
          else if (Array.isArray(parsed.channels)) metadata.columns = parsed.channels.slice();
          if (Array.isArray(parsed.rows)) metadata.row_count = parsed.rows.length;
          if (parsed.lapCount != null) metadata.lap_count = parsed.lapCount;
          if (parsed.duration != null) metadata.duration = parsed.duration;
        }
        return FileService.storeFile(name, text, ingestOpts.hash, ingestOpts.fileMeta)
          .then((record) => {
            const patch = { metadata: Object.assign({}, record.metadata, metadata) };
            if (ingestOpts.session_id) {
              patch.session_ids = Model.uniqueStrings((record.session_ids || []).concat([ingestOpts.session_id]));
            }
            return files.put(touchFile(Object.assign({}, record, patch)));
          })
          .then((record) => {
            if (!ingestOpts.session_id) return record;
            return addIdToSession(ingestOpts.session_id, 'file_ids', record.id).then(() => record);
          });
      },

      attachFileToSession(fileId, sessionId) {
        return files.get(fileId).then((record) => {
          if (!record) return null;
          const next = Model.uniqueStrings((record.session_ids || []).concat([sessionId]));
          if (next.length === (record.session_ids || []).length) return record;
          return files.put(touchFile(Object.assign({}, record, { session_ids: next })));
        }).then((record) => {
          if (!record) return null;
          return addIdToSession(sessionId, 'file_ids', fileId).then(() => record);
        });
      },

      detachFileFromSession(fileId, sessionId) {
        return files.get(fileId).then((record) => {
          if (!record) return null;
          const next = (record.session_ids || []).filter((id) => id !== sessionId);
          return files.put(touchFile(Object.assign({}, record, { session_ids: next })));
        }).then((record) => {
          if (!record) return null;
          return removeIdFromSession(sessionId, 'file_ids', fileId).then(() => record);
        });
      },

      /** Sets the vehicle/rider/setup/tags a file is associated with. */
      updateFileLinks(fileId, patch) {
        return files.get(fileId).then((record) => {
          if (!record) return null;
          const next = Object.assign({}, record, patch || {});
          if (patch && 'tags' in patch) next.tags = Model.cleanTags(patch.tags);
          if (patch && 'session_ids' in patch) next.session_ids = Model.uniqueStrings(patch.session_ids);
          return files.put(touchFile(next));
        });
      },

      deleteFile(fileId) {
        return files.get(fileId).then((record) => {
          if (!record) return null;
          return Promise.all((record.session_ids || [])
            .map((sessionId) => removeIdFromSession(sessionId, 'file_ids', fileId)))
            .then(() => files.del(fileId))
            .then(() => record);
        });
      },

      /** Saves (or clears, when config is null) a file's custom importer configuration. */
      saveImporterConfig(fileId, decoderName, config) {
        return files.get(fileId).then((record) => {
          if (!record) return null;
          const next = Object.assign({}, record);
          if (config) {
            next.importerConfig = {
              decoder: decoderName,
              channels: config.channels,
              filters: config.filters,
              downsampleHz: config.downsampleHz
            };
          } else {
            delete next.importerConfig;
          }
          return files.put(touchFile(next));
        });
      }
    };

    // ── MediaService ────────────────────────────────────────────────────────

    const MediaService = {
      /**
       * Stores a captured or picked blob and returns its MediaIndex record. Blobs stay in
       * IndexedDB; exports carry references unless includeMediaBlobs is set.
       */
      saveMediaBlob(blob, filename, mimeType) {
        if (!blob) return Promise.reject(new Error('saveMediaBlob needs a blob.'));
        return storage.create('mediaIndex', {
          filename: filename || 'capture',
          mimeType: mimeType || blob.type || 'application/octet-stream',
          size: blob.size,
          blob
        });
      },

      /** Registers media that lives at an external URL rather than as a local blob. */
      saveMediaReference(url, filename, mimeType) {
        return storage.create('mediaIndex', { url, filename: filename || url, mimeType });
      },

      getMedia: (id) => storage.get('mediaIndex', id),
      listMedia: (query) => storage.list('mediaIndex', query),

      /**
       * Object URL for displaying stored media. Callers own the returned URL and should
       * revokeObjectURL it when the element goes away.
       */
      getMediaUrl(mediaId) {
        return storage.get('mediaIndex', mediaId).then((entry) => {
          if (!entry) return null;
          if (entry.blob && typeof URL !== 'undefined' && URL.createObjectURL) {
            return URL.createObjectURL(entry.blob);
          }
          return entry.url || null;
        });
      },

      exportMedia(mediaId, includeBlob) {
        return storage.get('mediaIndex', mediaId).then((entry) => {
          if (!entry) return null;
          const copy = Object.assign({}, entry);
          delete copy.blob;
          if (!includeBlob || !entry.blob) return copy;
          return Storage.blobToBase64(entry.blob).then((base64) => {
            if (base64) copy.blobBase64 = base64;
            return copy;
          });
        });
      },

      deleteMedia(mediaId) {
        // Scrub the reference out of any note that embedded it, so the composer does not
        // render a dead thumbnail.
        return storage.list('notes').then((notes) => Promise.all((notes || [])
          .filter((note) => (note.media || []).some((m) => m && m.id === mediaId))
          .map((note) => storage.update('notes', note.id, {
            media: (note.media || []).filter((m) => !m || m.id !== mediaId)
          }))))
          .then(() => storage.delete('mediaIndex', mediaId));
      },

      /**
       * Camera permission flow. Called ONLY from an explicit user action (a Take Photo
       * click) -- never on load -- so the browser prompt is always tied to an intent the
       * user just expressed. Resolves { ok: true, stream } or { ok: false, reason },
       * where 'denied' / 'unavailable' both mean the caller should fall back to the file
       * picker rather than showing an error.
       */
      requestCamera(constraints) {
        const nav = (typeof navigator !== 'undefined') ? navigator : null;
        if (!nav || !nav.mediaDevices || typeof nav.mediaDevices.getUserMedia !== 'function') {
          return Promise.resolve({ ok: false, reason: 'unavailable' });
        }
        // Default to the rear camera: a bare { video: true } leaves the choice to the
        // browser, which picks the front camera on many phones with no way to reach the
        // other one. "ideal" (not "exact") so a single-camera device still works.
        return nav.mediaDevices.getUserMedia(constraints || { video: { facingMode: { ideal: 'environment' } } })
          .then((stream) => ({ ok: true, stream }))
          .catch((err) => {
            const name = err && err.name ? err.name : '';
            const denied = name === 'NotAllowedError' || name === 'SecurityError' || name === 'PermissionDeniedError';
            return { ok: false, reason: denied ? 'denied' : 'unavailable', error: err };
          });
      },

      /** Stops every track on a stream returned by requestCamera. */
      stopCamera(stream) {
        if (!stream || typeof stream.getTracks !== 'function') return;
        stream.getTracks().forEach((track) => {
          if (track && typeof track.stop === 'function') track.stop();
        });
      }
    };

    // ── ExportService ───────────────────────────────────────────────────────

    const ExportService = {
      exportAll: (includeMediaBlobs) => storage.exportAll(includeMediaBlobs),
      importAll: (bundle, importOptions) => storage.importAll(bundle, importOptions),

      /** True when there is anything worth putting in a backup. */
      hasData() {
        return Promise.all(['sessions', 'notes', 'vehicles', 'riders', 'setups']
          .map((store) => storage.list(store, { limit: 1 })))
          .then((results) => results.some((rows) => rows && rows.length > 0));
      }
    };

    // ── Shared relationship helpers ─────────────────────────────────────────

    // Keeps a session's convenience list (note_ids/file_ids) in step with the owning
    // record's own session_ids after it changes.
    function syncSessionBackrefs(field, recordId, nextSessionIds, previousSessionIds) {
      const next = Model.uniqueStrings(nextSessionIds);
      const previous = Model.uniqueStrings(previousSessionIds);
      const added = next.filter((id) => previous.indexOf(id) === -1);
      const removed = previous.filter((id) => next.indexOf(id) === -1);
      return Promise.all([]
        .concat(added.map((sessionId) => addIdToSession(sessionId, field, recordId)))
        .concat(removed.map((sessionId) => removeIdFromSession(sessionId, field, recordId))));
    }

    // Which fields elsewhere point at a record of a given store. Deleting a record scrubs
    // its id from all of them so nothing is left holding a dangling reference.
    //
    // 'array'   -- remove the id from a list field.
    // 'scalar'  -- clear the field.
    // 'map-key' -- delete the entry keyed by the id from an object field (e.g. a
    //              rider's weight override, keyed by rider_id).
    // 'owned'   -- the referencing record cannot exist without the target, so delete it
    //              too. Only setups-of-a-vehicle: a setup sheet is meaningless without the
    //              bike it describes, and vehicle_id is a required field, so clearing it
    //              would fail validation anyway. Files and notes are never 'owned': those
    //              are independent artefacts that outlive the links between them.
    const INBOUND_REFERENCES = {
      sessions: [
        { store: 'notes', field: 'session_ids', kind: 'array' },
        { store: 'setups', field: 'session_id', kind: 'scalar' },
        { store: 'files', field: 'session_ids', kind: 'array' }
      ],
      vehicles: [
        { store: 'sessions', field: 'vehicle_ids', kind: 'array' },
        { store: 'notes', field: 'vehicle_id', kind: 'scalar' },
        { store: 'setups', field: 'vehicle_id', kind: 'owned' },
        { store: 'files', field: 'vehicle_id', kind: 'scalar' }
      ],
      riders: [
        { store: 'sessions', field: 'rider_ids', kind: 'array' },
        { store: 'sessions', field: 'rider_weight_overrides_kg', kind: 'map-key' },
        { store: 'notes', field: 'rider_id', kind: 'scalar' },
        { store: 'files', field: 'rider_id', kind: 'scalar' }
      ],
      notes: [
        { store: 'sessions', field: 'note_ids', kind: 'array' }
      ],
      setups: [
        { store: 'files', field: 'setup_id', kind: 'scalar' },
        { store: 'setups', field: 'supersedes_id', kind: 'scalar' }
      ],
      events: [
        { store: 'sessions', field: 'event_id', kind: 'scalar' }
      ]
    };

    function cascadeDelete(store, id) {
      const inbound = INBOUND_REFERENCES[store] || [];

      // Grouped by target store, not iterated ref-by-ref: riders (for example) has TWO
      // refs pointing at sessions (rider_ids, rider_weight_overrides_kg). Two independent
      // storage.update calls on the SAME row racing each other is a lost-update bug --
      // each reads the row before either write lands, so whichever finishes last wins
      // and silently drops the other's change. One combined patch per row, one write per
      // row, sidesteps that entirely.
      const refsByStore = new Map();
      inbound.forEach((ref) => {
        if (!refsByStore.has(ref.store)) refsByStore.set(ref.store, []);
        refsByStore.get(ref.store).push(ref);
      });

      return initDB()
        .then(() => Promise.all(Array.from(refsByStore.entries()).map(([targetStore, refs]) => {
          const isFileStore = targetStore === 'files';
          const readAll = isFileStore ? files.getAll().catch(() => []) : storage.list(targetStore);
          return readAll.then((rows) => {
            const ownedIds = [];
            const writes = (rows || []).map((row) => {
              if (!row) return null;
              const patch = {};
              const clearedKeys = []; // file records: an explicit null isn't dropped by Model.normalize
              let changed = false;

              refs.forEach((ref) => {
                const value = row[ref.field];
                if (ref.kind === 'array') {
                  const current = value || [];
                  if (current.indexOf(id) === -1) return;
                  patch[ref.field] = current.filter((v) => v !== id);
                  changed = true;
                } else if (ref.kind === 'map-key') {
                  if (!value || typeof value !== 'object' || !(id in value)) return;
                  const next = Object.assign({}, value);
                  delete next[id];
                  patch[ref.field] = next;
                  changed = true;
                } else if (ref.kind === 'owned') {
                  // An owned child has no meaning once its parent is gone: recurse (after
                  // this store's other writes below) so its own inbound references (a
                  // file's setup_id, say) get scrubbed as well.
                  if (value === id) ownedIds.push(row.id);
                } else { // scalar
                  if (value !== id) return;
                  if (isFileStore) clearedKeys.push(ref.field); else patch[ref.field] = null;
                  changed = true;
                }
              });

              if (!changed) return null;
              if (isFileStore) {
                const next = Object.assign({}, row, patch);
                clearedKeys.forEach((key) => delete next[key]);
                return files.put(touchFile(next));
              }
              return storage.update(targetStore, row.id, patch);
            }).filter(Boolean);

            return Promise.all(writes)
              .then(() => Promise.all(ownedIds.map((ownedId) => cascadeDelete(targetStore, ownedId))));
          });
        })))
        .then(() => (store === 'files' ? files.del(id) : storage.delete(store, id)))
        .then(() => id);
    }

    return {
      storage,
      initDB,
      UserService,
      RiderService,
      VehicleService,
      SetupService,
      EventService,
      SessionService,
      NoteService,
      FileService,
      MediaService,
      ExportService,
      cascadeDelete
    };
  }

  const api = { createServices };

  if (typeof window !== 'undefined') window.SessionsServices = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
