// Sessions storage: IndexedDB adapter, localStorage fallback shim, query/list support,
// and the export/import bundle logic.
//
// Two separate IndexedDB databases are involved, deliberately:
//
//   motorsports_app_v1  -- the sessions domain: users, riders, vehicles, setups,
//                          events, sessions, notes, mediaIndex, appMetadata.
//   csvPlotterFiles     -- log files (raw text + hash + importer config). This store
//                          predates the sessions feature and is the single source of
//                          truth for files, so the sessions domain deliberately has NO
//                          `files` store of its own: duplicating file rows across two
//                          databases would let them drift. Session links (session_ids,
//                          vehicle_id, rider_id, setup_id, tags) are extra fields on the
//                          existing records, and the export bundle's `files` array is
//                          projected from them.
//
// csvPlotterFiles is re-keyed from `name` to a UUID `id` at DB version 3 (see
// FILE_DB_VERSION) so renaming a file, or storing two files that share a name, cannot
// break a session link. app.js delegates all of its file-store access here rather than
// opening the same database at a different version.
//
// The storage service takes a pluggable backend so the same code under test in Node
// (memory backend) is the code that runs in the browser (IndexedDB backend).

(() => {
  const Model = (typeof window !== 'undefined' && window.SessionsModel)
    || (typeof require === 'function' ? require('./sessions-model.js') : null);

  const DB_NAME = 'motorsports_app_v1';
  // v2 adds the `events` store (a Session's parent race meeting, e.g. "MotoAmerica VIR
  // 2026") -- the onupgradeneeded handler below creates any store that's missing
  // regardless of the version jump, so existing databases just gain the new store.
  const DB_VERSION = 2;

  // The sessions domain stores. `files` is intentionally absent -- see the header note.
  const STORES = ['users', 'riders', 'vehicles', 'setups', 'events', 'sessions', 'notes', 'mediaIndex', 'appMetadata'];

  // Every store is keyed by `id`. Indexes mirror the access patterns the UI actually has:
  // list sessions newest-first, pull a vehicle's setup history, find notes for a session.
  // `multiEntry` indexes let a single note/file be found via any of its session_ids.
  const STORE_INDEXES = {
    sessions: [
      { name: 'by_start_time', keyPath: 'start_time' },
      { name: 'by_location', keyPath: 'location' },
      { name: 'by_event_id', keyPath: 'event_id' },
      { name: 'by_tags', keyPath: 'tags', options: { multiEntry: true } }
    ],
    events: [
      { name: 'by_start_date', keyPath: 'start_date' },
      { name: 'by_name', keyPath: 'name' }
    ],
    notes: [
      { name: 'by_timestamp', keyPath: 'timestamp' },
      { name: 'by_type', keyPath: 'type' },
      { name: 'by_author_id', keyPath: 'author_id' },
      { name: 'by_session_ids', keyPath: 'session_ids', options: { multiEntry: true } },
      { name: 'by_tags', keyPath: 'tags', options: { multiEntry: true } }
    ],
    setups: [
      { name: 'by_vehicle_id', keyPath: 'vehicle_id' },
      { name: 'by_timestamp', keyPath: 'timestamp' }
    ],
    users: [{ name: 'by_name', keyPath: 'name' }],
    riders: [{ name: 'by_name', keyPath: 'name' }],
    vehicles: [{ name: 'by_type', keyPath: 'type' }],
    mediaIndex: [{ name: 'by_created_at', keyPath: 'created_at' }]
  };

  const APP_METADATA_ID = 'app';

  // ── Log file store (csvPlotterFiles) ──────────────────────────────────────
  const FILE_DB_NAME = 'csvPlotterFiles';
  // v3 re-keys the store from `name` to a UUID `id`.
  const FILE_DB_VERSION = 3;
  const FILE_STORE = 'files';

  const FILE_STORE_INDEXES = [
    { name: 'by_name', keyPath: 'name' },
    { name: 'by_hash', keyPath: 'hash' },
    { name: 'by_storedAt', keyPath: 'storedAt' },
    { name: 'by_session_ids', keyPath: 'session_ids', options: { multiEntry: true } },
    { name: 'by_vehicle_id', keyPath: 'vehicle_id' }
  ];

  function hasIndexedDb() {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  }

  function promisifyRequest(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  function promisifyTransaction(tx) {
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onabort = () => reject(tx.error);
      tx.onerror = () => reject(tx.error);
    });
  }

  // ── Backends ──────────────────────────────────────────────────────────────
  // A backend implements: init, get, getAll, put, putMany, del, clear.
  // Everything above this line is storage-engine specific; StorageService below is not.

  function createIndexedDbBackend(options) {
    const opts = options || {};
    const dbName = opts.dbName || DB_NAME;
    const dbVersion = opts.dbVersion || DB_VERSION;
    const stores = opts.stores || STORES;
    const indexes = opts.indexes || STORE_INDEXES;
    let dbPromise = null;

    function open() {
      if (dbPromise) return dbPromise;
      dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(dbName, dbVersion);
        req.onupgradeneeded = () => {
          const db = req.result;
          stores.forEach((store) => {
            let objectStore;
            if (!db.objectStoreNames.contains(store)) {
              objectStore = db.createObjectStore(store, { keyPath: 'id' });
            } else {
              objectStore = req.transaction.objectStore(store);
            }
            (indexes[store] || []).forEach((idx) => {
              if (!objectStore.indexNames.contains(idx.name)) {
                objectStore.createIndex(idx.name, idx.keyPath, idx.options || {});
              }
            });
          });
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        req.onblocked = () => reject(new Error('IndexedDB upgrade blocked by another open tab'));
      }).catch((err) => {
        dbPromise = null; // allow a later retry rather than caching the failure forever
        throw err;
      });
      return dbPromise;
    }

    function withStore(store, mode, fn) {
      return open().then((db) => {
        const tx = db.transaction(store, mode);
        const result = fn(tx.objectStore(store), tx);
        return promisifyTransaction(tx).then(() => result);
      });
    }

    return {
      kind: 'indexeddb',
      init: () => open().then(() => undefined),
      get: (store, id) => withStore(store, 'readonly', (os) => promisifyRequest(os.get(id))).then((p) => p),
      getAll: (store) => withStore(store, 'readonly', (os) => promisifyRequest(os.getAll())).then((p) => p),
      put: (store, obj) => withStore(store, 'readwrite', (os) => { os.put(obj); return obj; }),
      putMany: (store, objs) => withStore(store, 'readwrite', (os) => { objs.forEach((o) => os.put(o)); return objs.length; }),
      del: (store, id) => withStore(store, 'readwrite', (os) => { os.delete(id); }),
      clear: (store) => withStore(store, 'readwrite', (os) => { os.clear(); })
    };
  }

  // In-memory backend. Used by the Node unit tests, and as the last-resort backend when
  // neither IndexedDB nor localStorage is usable (private-mode lockdowns), in which case
  // data simply does not survive a reload.
  function createMemoryBackend(options) {
    const opts = options || {};
    const stores = opts.stores || STORES;
    const data = new Map();
    stores.forEach((s) => data.set(s, new Map()));

    function bucket(store) {
      if (!data.has(store)) data.set(store, new Map());
      return data.get(store);
    }
    // Structured-clone-ish copy so callers cannot mutate stored rows by holding a
    // reference, matching IndexedDB's value semantics. Blobs are passed through.
    function clone(obj) {
      if (obj == null || typeof obj !== 'object') return obj;
      if (typeof Blob !== 'undefined' && obj instanceof Blob) return obj;
      if (Array.isArray(obj)) return obj.map(clone);
      const out = {};
      Object.keys(obj).forEach((k) => { out[k] = clone(obj[k]); });
      return out;
    }

    return {
      kind: 'memory',
      init: () => Promise.resolve(),
      get: (store, id) => Promise.resolve(clone(bucket(store).get(id))),
      getAll: (store) => Promise.resolve(Array.from(bucket(store).values()).map(clone)),
      put: (store, obj) => { bucket(store).set(obj.id, clone(obj)); return Promise.resolve(obj); },
      putMany: (store, objs) => { objs.forEach((o) => bucket(store).set(o.id, clone(o))); return Promise.resolve(objs.length); },
      del: (store, id) => { bucket(store).delete(id); return Promise.resolve(); },
      clear: (store) => { bucket(store).clear(); return Promise.resolve(); }
    };
  }

  // Minimal localStorage shim: one JSON array per store. Only for browsers without
  // IndexedDB -- no indexes, no blobs, and subject to the ~5 MB quota, so no feature is
  // designed around it.
  function createLocalStorageBackend(options) {
    const opts = options || {};
    const prefix = (opts.dbName || DB_NAME) + ':';

    function read(store) {
      try {
        const raw = localStorage.getItem(prefix + store);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    function write(store, rows) {
      try {
        localStorage.setItem(prefix + store, JSON.stringify(rows));
        return true;
      } catch {
        return false; // quota exceeded, private mode, etc.
      }
    }
    function upsert(store, obj) {
      const rows = read(store);
      const idx = rows.findIndex((r) => r && r.id === obj.id);
      if (idx === -1) rows.push(obj); else rows[idx] = obj;
      write(store, rows);
    }

    return {
      kind: 'localstorage',
      init: () => Promise.resolve(),
      get: (store, id) => Promise.resolve(read(store).find((r) => r && r.id === id)),
      getAll: (store) => Promise.resolve(read(store)),
      put: (store, obj) => { upsert(store, obj); return Promise.resolve(obj); },
      putMany: (store, objs) => { objs.forEach((o) => upsert(store, o)); return Promise.resolve(objs.length); },
      del: (store, id) => { write(store, read(store).filter((r) => !r || r.id !== id)); return Promise.resolve(); },
      clear: (store) => { write(store, []); return Promise.resolve(); }
    };
  }

  // Picks the best available backend: IndexedDB, else the localStorage shim, else memory.
  function createAutoBackend(options) {
    if (hasIndexedDb()) return createIndexedDbBackend(options);
    if (typeof localStorage !== 'undefined' && localStorage) return createLocalStorageBackend(options);
    return createMemoryBackend(options);
  }

  // ── Log file store API ────────────────────────────────────────────────────
  // Owns csvPlotterFiles, including the v2 (keyPath 'name') -> v3 (keyPath 'id')
  // migration. Returns an API app.js delegates to, or a memory-backed stand-in for tests.

  function migrateFileRecordToUuid(record) {
    const storedAt = record.storedAt || Model.nowIso();
    return Object.assign({}, record, {
      id: Model.newId('files'),
      name: record.name,
      filetype: record.filetype || Model.filetypeFromName(record.name),
      storedAt,
      session_ids: Model.uniqueStrings(record.session_ids),
      tags: Model.cleanTags(record.tags),
      created_at: record.created_at || storedAt,
      updated_at: Model.nowIso()
    });
  }

  function createIndexedDbFileStore() {
    let dbPromise = null;

    function open() {
      if (dbPromise) return dbPromise;
      dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(FILE_DB_NAME, FILE_DB_VERSION);
        req.onupgradeneeded = (event) => {
          const db = req.result;
          const tx = req.transaction;

          if (!db.objectStoreNames.contains(FILE_STORE)) {
            const store = db.createObjectStore(FILE_STORE, { keyPath: 'id' });
            FILE_STORE_INDEXES.forEach((idx) => store.createIndex(idx.name, idx.keyPath, idx.options || {}));
            return;
          }

          // IndexedDB cannot change an existing store's keyPath, so the v2 store (keyed
          // by `name`) is read out, dropped, and recreated keyed by `id`. All of this runs
          // inside the versionchange transaction, so it either lands completely or not at
          // all -- a failure mid-way leaves the old v2 store intact.
          if (event.oldVersion < 3) {
            const oldStore = tx.objectStore(FILE_STORE);
            const getAllReq = oldStore.getAll();
            getAllReq.onsuccess = () => {
              const existing = getAllReq.result || [];
              db.deleteObjectStore(FILE_STORE);
              const store = db.createObjectStore(FILE_STORE, { keyPath: 'id' });
              FILE_STORE_INDEXES.forEach((idx) => store.createIndex(idx.name, idx.keyPath, idx.options || {}));
              existing.forEach((record) => {
                if (record && record.name) store.put(migrateFileRecordToUuid(record));
              });
            };
            return;
          }

          const store = tx.objectStore(FILE_STORE);
          FILE_STORE_INDEXES.forEach((idx) => {
            if (!store.indexNames.contains(idx.name)) {
              store.createIndex(idx.name, idx.keyPath, idx.options || {});
            }
          });
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        req.onblocked = () => reject(new Error('csvPlotterFiles upgrade blocked by another open tab'));
      }).catch((err) => {
        dbPromise = null;
        throw err;
      });
      return dbPromise;
    }

    function withStore(mode, fn) {
      return open().then((db) => {
        const tx = db.transaction(FILE_STORE, mode);
        const result = fn(tx.objectStore(FILE_STORE), tx);
        return promisifyTransaction(tx).then(() => result);
      });
    }

    return {
      kind: 'indexeddb',
      open,
      getAll: () => withStore('readonly', (os) => promisifyRequest(os.getAll())).then((r) => r),
      get: (id) => withStore('readonly', (os) => promisifyRequest(os.get(id))).then((r) => r),
      getByName: (name) => withStore('readonly', (os) => promisifyRequest(os.index('by_name').get(name))).then((r) => r),
      put: (record) => withStore('readwrite', (os) => { os.put(record); return record; }),
      del: (id) => withStore('readwrite', (os) => { os.delete(id); }),
      clear: () => withStore('readwrite', (os) => { os.clear(); })
    };
  }

  function createMemoryFileStore() {
    const rows = new Map();
    return {
      kind: 'memory',
      open: () => Promise.resolve(null),
      getAll: () => Promise.resolve(Array.from(rows.values()).map((r) => Object.assign({}, r))),
      get: (id) => Promise.resolve(rows.has(id) ? Object.assign({}, rows.get(id)) : undefined),
      getByName: (name) => Promise.resolve(
        Array.from(rows.values()).filter((r) => r.name === name).map((r) => Object.assign({}, r))[0]
      ),
      put: (record) => { rows.set(record.id, Object.assign({}, record)); return Promise.resolve(record); },
      del: (id) => { rows.delete(id); return Promise.resolve(); },
      clear: () => { rows.clear(); return Promise.resolve(); }
    };
  }

  // ── Query helpers ─────────────────────────────────────────────────────────

  function matchesWhere(row, where) {
    return Object.keys(where || {}).every((field) => {
      const expected = where[field];
      const actual = row[field];
      if (expected == null) return true;
      // Array expectation = "any of these", against a scalar or an array field.
      if (Array.isArray(expected)) {
        if (expected.length === 0) return true;
        if (Array.isArray(actual)) return expected.some((e) => actual.indexOf(e) !== -1);
        return expected.indexOf(actual) !== -1;
      }
      if (Array.isArray(actual)) return actual.indexOf(expected) !== -1;
      return actual === expected;
    });
  }

  function matchesDateRange(row, dateRange) {
    if (!dateRange) return true;
    const field = dateRange.field || 'timestamp';
    const value = row[field];
    if (!value) return false;
    if (dateRange.from && String(value) < String(dateRange.from)) return false;
    if (dateRange.to && String(value) > String(dateRange.to)) return false;
    return true;
  }

  // Whitespace tokenisation, lowercased. Every token must appear somewhere in the
  // searched fields (AND semantics), which is what a user typing two words expects.
  function tokenize(text) {
    return String(text == null ? '' : text)
      .toLowerCase()
      .split(/[^a-z0-9_]+/i)
      .filter(Boolean);
  }

  function matchesText(row, text, fields) {
    const tokens = tokenize(text);
    if (tokens.length === 0) return true;
    const haystack = (fields || ['content'])
      .map((f) => {
        const v = row[f];
        return Array.isArray(v) ? v.join(' ') : (v == null ? '' : String(v));
      })
      .join(' ')
      .toLowerCase();
    return tokens.every((t) => haystack.indexOf(t) !== -1);
  }

  function compareBy(field, dir) {
    const sign = dir === 'desc' ? -1 : 1;
    return (a, b) => {
      const av = a[field];
      const bv = b[field];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;  // missing values sort last regardless of direction
      if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * sign;
      return String(av).localeCompare(String(bv)) * sign;
    };
  }

  /**
   * @typedef {Object} Query
   * @property {Record<string, any>} [where]  field equality; array value means "any of"
   * @property {string} [text]                free-text query
   * @property {string[]} [textFields]        fields the text query searches (default ['content'])
   * @property {{field?: string, from?: string, to?: string}} [dateRange]
   * @property {string} [sortBy]
   * @property {"asc"|"desc"} [sortDir]
   * @property {number} [limit]
   * @property {number} [offset]
   */
  function applyQuery(rows, query) {
    const q = query || {};
    let out = rows.filter((row) => row
      && matchesWhere(row, q.where)
      && matchesDateRange(row, q.dateRange)
      && matchesText(row, q.text, q.textFields));
    if (q.sortBy) out = out.slice().sort(compareBy(q.sortBy, q.sortDir));
    const offset = Number(q.offset) > 0 ? Number(q.offset) : 0;
    if (offset) out = out.slice(offset);
    const limit = Number(q.limit);
    if (Number.isFinite(limit) && limit >= 0) out = out.slice(0, limit);
    return out;
  }

  // ── Bundle projection helpers ─────────────────────────────────────────────

  // Export shape for a log file: the spec's File fields, without the raw `text` (which
  // travels as its own ZIP entry in a csv-plotter-backup) and without importerConfig.
  function fileRecordToBundleEntry(record) {
    const entry = {
      id: record.id,
      filename: record.name,
      filetype: record.filetype || Model.filetypeFromName(record.name),
      uploaded_at: record.storedAt || record.created_at || null,
      session_ids: Model.uniqueStrings(record.session_ids),
      created_at: record.created_at || record.storedAt || null,
      updated_at: record.updated_at || record.storedAt || null
    };
    if (record.vehicle_id) entry.vehicle_id = record.vehicle_id;
    if (record.rider_id) entry.rider_id = record.rider_id;
    if (record.setup_id) entry.setup_id = record.setup_id;
    if (record.tags && record.tags.length) entry.tags = record.tags.slice();
    if (record.hash) entry.hash = record.hash;
    // fileMeta (track/rider/vehicle sniffed out of the log header) is the useful part of
    // the file's metadata, so surface it under the spec's `metadata` key.
    const metadata = Object.assign({}, record.metadata, record.fileMeta ? { fileMeta: record.fileMeta } : null);
    if (Object.keys(metadata).length) entry.metadata = metadata;
    return entry;
  }

  // Which fields on each store point at which other store. Drives ID remapping on import.
  // Only top-level fields are listed here -- notes.location.file_id is a nested reference
  // and is remapped separately, right after this loop runs (see the importAll pass below).
  const REFERENCE_FIELDS = {
    sessions: {
      event_id: 'events',
      vehicle_ids: 'vehicles',
      rider_ids: 'riders',
      file_ids: 'files',
      note_ids: 'notes'
    },
    notes: {
      session_ids: 'sessions',
      file_ids: 'files',
      vehicle_id: 'vehicles',
      rider_id: 'riders',
      author_id: 'users'
    },
    setups: {
      vehicle_id: 'vehicles',
      session_id: 'sessions',
      author_id: 'users',
      created_by: 'users',
      supersedes_id: 'setups'
    },
    files: {
      session_ids: 'sessions',
      vehicle_id: 'vehicles',
      rider_id: 'riders',
      setup_id: 'setups'
    }
  };

  const BUNDLE_STORES = ['users', 'riders', 'vehicles', 'setups', 'events', 'sessions', 'notes', 'files', 'mediaIndex'];

  function blobToBase64(blob) {
    if (typeof FileReader === 'undefined') return Promise.resolve(null);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || '');
        const comma = result.indexOf(',');
        resolve(comma === -1 ? result : result.slice(comma + 1));
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  }

  function base64ToBlob(base64, mimeType) {
    if (typeof atob !== 'function' || typeof Blob === 'undefined') return null;
    try {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return new Blob([bytes], { type: mimeType || 'application/octet-stream' });
    } catch {
      return null;
    }
  }

  // ── StorageService ────────────────────────────────────────────────────────

  function createStorageService(options) {
    const opts = options || {};
    const backend = opts.backend || createAutoBackend(opts);
    const fileStore = opts.fileStore
      || (hasIndexedDb() ? createIndexedDbFileStore() : createMemoryFileStore());
    let initPromise = null;

    function initDB() {
      if (initPromise) return initPromise;
      initPromise = backend.init()
        .then(() => backend.get('appMetadata', APP_METADATA_ID))
        .then((existing) => {
          if (existing && existing.schemaVersion === Model.SCHEMA_VERSION) return existing;
          return runMigrations(existing);
        })
        // Touch the file store so its v2 -> v3 UUID migration runs at startup rather
        // than lazily on the first file write.
        .then(() => fileStore.open().catch(() => null))
        .then(() => undefined)
        .catch((err) => {
          initPromise = null;
          throw err;
        });
      return initPromise;
    }

    // Data-level migrations, keyed by the schemaVersion they upgrade FROM. Each entry is
    // { to, run } so the chain knows which version it lands on and can step forward again.
    // The store/index layout itself is handled by IndexedDB's own onupgradeneeded above.
    // Empty today (1.0 is the first released schema); the runner exists so adding one
    // later is a data change rather than a control-flow change.
    const MIGRATIONS = {
      // '1.0': { to: '1.1', run: (metadata, ctx) => ctx.backend.getAll('notes').then(...) }
    };

    function runMigrations(existing) {
      let chain = Promise.resolve(existing);
      let current = (existing && existing.schemaVersion) || null;
      const visited = new Set();
      while (current && MIGRATIONS[current] && !visited.has(current)) {
        visited.add(current); // a mis-specified migration must not loop forever
        const step = MIGRATIONS[current];
        chain = chain.then((meta) => step.run(meta, { backend }));
        current = step.to;
      }
      return chain.then(() => {
        const stamp = Model.nowIso();
        const metadata = Object.assign({}, existing, {
          id: APP_METADATA_ID,
          schemaVersion: Model.SCHEMA_VERSION,
          created_at: (existing && existing.created_at) || stamp,
          updated_at: stamp
        });
        return backend.put('appMetadata', metadata).then(() => metadata);
      });
    }

    function get(store, id) {
      if (!id) return Promise.resolve(undefined);
      return initDB().then(() => backend.get(store, id));
    }

    function list(store, query) {
      return initDB().then(() => backend.getAll(store)).then((rows) => applyQuery(rows || [], query));
    }

    function create(store, obj) {
      return initDB().then(() => {
        const record = Model.normalize(store, obj);
        const problems = Model.validate(store, record);
        if (problems.length) return Promise.reject(new Error(problems.join('; ')));
        return backend.put(store, record).then(() => record);
      });
    }

    // Shallow merge. `updated_at` is always refreshed; `id` and `created_at` cannot be
    // patched away. Returns the stored record, or null when the id does not exist.
    function update(store, id, patch) {
      return initDB().then(() => backend.get(store, id)).then((existing) => {
        if (!existing) return null;
        const merged = Object.assign({}, existing, patch || {}, {
          id: existing.id,
          created_at: existing.created_at
        });
        const record = Model.normalize(store, merged, { preserveTimestamps: false });
        const problems = Model.validate(store, record);
        if (problems.length) return Promise.reject(new Error(problems.join('; ')));
        return backend.put(store, record).then(() => record);
      });
    }

    function remove(store, id) {
      return initDB().then(() => backend.del(store, id));
    }

    function clear(store) {
      return initDB().then(() => backend.clear(store));
    }

    function getAppMetadata() {
      return get('appMetadata', APP_METADATA_ID);
    }

    // ── Export ──────────────────────────────────────────────────────────────

    /**
     * Builds the single JSON bundle. Media travels as references by default; passing
     * includeMediaBlobs base64-inlines the blobs, which can make the bundle very large.
     * @param {boolean} [includeMediaBlobs]
     * @returns {Promise<Object>} ExportBundle
     */
    function exportAll(includeMediaBlobs) {
      return initDB().then(() => Promise.all([
        backend.getAll('users'),
        backend.getAll('riders'),
        backend.getAll('vehicles'),
        backend.getAll('setups'),
        backend.getAll('sessions'),
        backend.getAll('notes'),
        backend.getAll('mediaIndex'),
        getAppMetadata(),
        fileStore.getAll().catch(() => [])
      ])).then((results) => {
        const users = results[0] || [];
        const mediaRows = results[6] || [];
        const appMetadata = results[7] || {};
        const fileRows = results[8] || [];

        const mediaPromise = includeMediaBlobs
          ? Promise.all(mediaRows.map((row) => {
            if (!row.blob) return Object.assign({}, stripBlob(row));
            return blobToBase64(row.blob).then((base64) => {
              const entry = stripBlob(row);
              if (base64) {
                entry.blobBase64 = base64;
                entry.mimeType = row.mimeType || 'application/octet-stream';
              }
              return entry;
            });
          }))
          : Promise.resolve(mediaRows.map(stripBlob));

        return mediaPromise.then((mediaIndex) => ({
          schemaVersion: Model.SCHEMA_VERSION,
          exportedAt: Model.nowIso(),
          users,
          riders: results[1] || [],
          vehicles: results[2] || [],
          setups: results[3] || [],
          sessions: results[4] || [],
          notes: results[5] || [],
          files: fileRows.map(fileRecordToBundleEntry),
          mediaIndex,
          appMetadata: {
            schemaVersion: Model.SCHEMA_VERSION,
            created_at: appMetadata.created_at || null,
            updated_at: appMetadata.updated_at || null,
            exportSettings: Object.assign({}, appMetadata.exportSettings, { includeMediaBlobs: !!includeMediaBlobs })
          }
        }));
      });
    }

    // A stored media row holds the Blob itself; an exported one never does.
    function stripBlob(row) {
      const copy = Object.assign({}, row);
      delete copy.blob;
      return copy;
    }

    // ── Import ──────────────────────────────────────────────────────────────

    /**
     * @typedef {Object} ImportOptions
     * @property {boolean} [replaceExisting]  wipe local data first (ids are then kept as-is)
     * @property {boolean} [dryRun]           validate and report without writing
     * @property {boolean} [overwriteMatchingIds] treat a colliding id as the SAME record and
     *   overwrite it, instead of minting a new id. Used by the backup-restore path, where
     *   re-importing your own backup should reinstate your sessions rather than duplicate
     *   every one of them. Left off for importing a bundle from elsewhere.
     * @property {Record<string,string>} [migrateLocalUsers]  { "user_local_x": "user_123" }
     *
     * @typedef {Object} ImportResult
     * @property {boolean} ok
     * @property {boolean} dryRun
     * @property {string} schemaVersion
     * @property {Record<string, number>} counts     records that would be / were written
     * @property {Record<string, string>} idMap      { oldId: newId } for collisions
     * @property {string[]} problems                 blocking validation failures
     * @property {string[]} warnings                 non-blocking oddities
     */
    function importAll(bundle, options) {
      const opts = options || {};
      const replaceExisting = !!opts.replaceExisting;
      const dryRun = !!opts.dryRun;
      const overwriteMatchingIds = !!opts.overwriteMatchingIds;
      const userMigration = opts.migrateLocalUsers || {};

      const result = {
        ok: false,
        dryRun,
        schemaVersion: bundle && bundle.schemaVersion ? String(bundle.schemaVersion) : '',
        counts: {},
        idMap: {},
        problems: [],
        warnings: []
      };

      if (!bundle || typeof bundle !== 'object') {
        result.problems.push('Bundle is not an object.');
        return Promise.resolve(result);
      }
      if (!result.schemaVersion) {
        result.problems.push('Bundle is missing schemaVersion.');
        return Promise.resolve(result);
      }
      // Major-version mismatch is refused; a newer minor is imported with a warning,
      // since unknown keys are preserved rather than dropped.
      const bundleMajor = result.schemaVersion.split('.')[0];
      const localMajor = Model.SCHEMA_VERSION.split('.')[0];
      if (bundleMajor !== localMajor) {
        result.problems.push(
          'Bundle schemaVersion ' + result.schemaVersion + ' is not compatible with '
          + Model.SCHEMA_VERSION + '.'
        );
        return Promise.resolve(result);
      }
      if (result.schemaVersion !== Model.SCHEMA_VERSION) {
        result.warnings.push(
          'Bundle schemaVersion ' + result.schemaVersion + ' differs from local '
          + Model.SCHEMA_VERSION + '; importing on a best-effort basis.'
        );
      }

      return initDB()
        .then(() => Promise.all([
          Promise.all(['users', 'riders', 'vehicles', 'setups', 'events', 'sessions', 'notes', 'mediaIndex']
            .map((store) => backend.getAll(store).then((rows) => [store, rows || []]))),
          fileStore.getAll().catch(() => [])
        ]))
        .then((existingResults) => {
          const existingByStore = {};
          existingResults[0].forEach((pair) => { existingByStore[pair[0]] = pair[1]; });
          existingByStore.files = existingResults[1];

          // Pass 1: decide the final id of every incoming record and record collisions.
          // Done for all stores before any reference rewriting, so a reference can be
          // resolved no matter which store it points into.
          const idMap = {};
          const staged = {};

          BUNDLE_STORES.forEach((store) => {
            const incoming = Array.isArray(bundle[store]) ? bundle[store] : [];
            const existingIds = new Set(
              replaceExisting ? [] : (existingByStore[store] || []).map((r) => r && r.id).filter(Boolean)
            );
            const takenIds = new Set(existingIds);
            staged[store] = incoming.map((raw) => {
              if (!raw || typeof raw !== 'object') {
                result.warnings.push(store + ': skipped a non-object record.');
                return null;
              }
              const record = Object.assign({}, raw);
              const originalId = record.id ? String(record.id) : '';
              let finalId = originalId;
              if (!finalId) {
                finalId = Model.newId(store);
                result.warnings.push(store + ': record had no id; assigned ' + finalId + '.');
              } else if (takenIds.has(finalId) && !overwriteMatchingIds) {
                finalId = Model.newId(store);
                idMap[originalId] = finalId;
              }
              takenIds.add(finalId);
              record.id = finalId;
              return { originalId, record };
            }).filter(Boolean);
          });

          // user_local_* -> user_* claiming. Folded into the same map so author_id and
          // every other user reference is rewritten by the single pass below.
          Object.keys(userMigration).forEach((localId) => {
            const cloudId = userMigration[localId];
            if (!cloudId) return;
            idMap[localId] = String(cloudId);
          });

          function remapId(value) {
            if (value == null) return value;
            const key = String(value);
            return Object.prototype.hasOwnProperty.call(idMap, key) ? idMap[key] : value;
          }

          // Pass 2: rewrite cross-store references, then normalise and validate.
          const prepared = {};
          BUNDLE_STORES.forEach((store) => {
            const refFields = REFERENCE_FIELDS[store] || {};
            prepared[store] = staged[store].map((entry) => {
              const record = entry.record;
              Object.keys(refFields).forEach((field) => {
                if (!(field in record)) return;
                const value = record[field];
                if (Array.isArray(value)) {
                  record[field] = Model.uniqueStrings(value.map(remapId));
                } else if (value != null) {
                  record[field] = remapId(value);
                }
              });
              if (store === 'users') {
                // A claimed local user becomes the cloud user: adopt the mapped id.
                record.id = remapId(record.id);
              }
              if (store === 'notes' && Array.isArray(record.media)) {
                record.media = record.media.map((m) => {
                  if (!m || typeof m !== 'object') return m;
                  const copy = Object.assign({}, m);
                  if (copy.id) copy.id = remapId(copy.id);
                  return copy;
                });
              }
              // location.file_id is a nested reference REFERENCE_FIELDS' flat-field loop
              // above does not reach; a note pinned to a point on a log must still point
              // at the right file after that file's id gets remapped.
              if (store === 'notes' && record.location && record.location.file_id) {
                record.location = Object.assign({}, record.location, {
                  file_id: remapId(record.location.file_id)
                });
              }
              // rider_weight_overrides_kg is keyed BY rider_id (a map, not a list), which
              // the flat-field loop above only rewrites the field's referenced ids in, not
              // its own keys -- remap those keys too so an override stays attached to the
              // right rider after a colliding rider_ids gets a new id.
              if (store === 'sessions' && record.rider_weight_overrides_kg
                && typeof record.rider_weight_overrides_kg === 'object') {
                const remapped = {};
                Object.keys(record.rider_weight_overrides_kg).forEach((riderId) => {
                  remapped[remapId(riderId)] = record.rider_weight_overrides_kg[riderId];
                });
                record.rider_weight_overrides_kg = remapped;
              }

              const normalizedStore = store === 'files' ? 'files' : store;
              const normalized = Model.normalize(normalizedStore, record, { preserveTimestamps: true });
              const problems = Model.validate(normalizedStore, normalized);
              if (problems.length) {
                result.problems.push(problems.join('; '));
                return null;
              }
              return normalized;
            }).filter(Boolean);
            result.counts[store] = prepared[store].length;
          });

          Object.keys(idMap).forEach((oldId) => { result.idMap[oldId] = idMap[oldId]; });

          if (result.problems.length) return result;
          if (dryRun) {
            result.ok = true;
            return result;
          }

          let chain = Promise.resolve();
          if (replaceExisting) {
            chain = chain
              .then(() => Promise.all(['users', 'riders', 'vehicles', 'setups', 'events', 'sessions', 'notes', 'mediaIndex']
                .map((store) => backend.clear(store))))
              .then(() => fileStore.clear().catch(() => null));
          }

          chain = chain.then(() => Promise.all(['users', 'riders', 'vehicles', 'setups', 'events', 'sessions', 'notes']
            .map((store) => (prepared[store].length ? backend.putMany(store, prepared[store]) : null))));

          // Media: rebuild a Blob from base64 when the bundle carried one, otherwise keep
          // the row as a plain reference.
          chain = chain.then(() => {
            const rows = prepared.mediaIndex.map((row) => {
              const copy = Object.assign({}, row);
              if (copy.blobBase64) {
                const blob = base64ToBlob(copy.blobBase64, copy.mimeType);
                delete copy.blobBase64;
                if (blob) {
                  copy.blob = blob;
                  copy.size = blob.size;
                } else {
                  result.warnings.push('mediaIndex ' + copy.id + ': embedded blob could not be decoded.');
                }
              }
              return copy;
            });
            return rows.length ? backend.putMany('mediaIndex', rows) : null;
          });

          // Files: the bundle carries link metadata only. Match an existing record by id,
          // else by filename, so importing a bundle alongside already-stored CSVs attaches
          // the session links to the file the user already has rather than creating a
          // textless ghost row.
          chain = chain.then(() => {
            if (!prepared.files.length) return null;
            return fileStore.getAll().catch(() => []).then((currentFiles) => {
              const byId = new Map();
              const byName = new Map();
              (currentFiles || []).forEach((row) => {
                if (!row) return;
                byId.set(row.id, row);
                if (!byName.has(row.name)) byName.set(row.name, row);
              });

              const writes = prepared.files.map((incoming) => {
                const existing = byId.get(incoming.id) || byName.get(incoming.name);
                if (!existing) {
                  result.warnings.push(
                    'files: "' + incoming.name + '" is referenced by the bundle but its '
                    + 'contents are not stored locally; imported as metadata only.'
                  );
                  return fileStore.put(incoming);
                }
                // Keep the local record's id and text; merge the bundle's links into it.
                const merged = Object.assign({}, existing, {
                  session_ids: Model.uniqueStrings((existing.session_ids || []).concat(incoming.session_ids || [])),
                  tags: Model.cleanTags((existing.tags || []).concat(incoming.tags || [])),
                  vehicle_id: incoming.vehicle_id || existing.vehicle_id,
                  rider_id: incoming.rider_id || existing.rider_id,
                  setup_id: incoming.setup_id || existing.setup_id,
                  updated_at: Model.nowIso()
                });
                if (existing.id !== incoming.id) result.idMap[incoming.id] = existing.id;
                return fileStore.put(merged);
              });
              return Promise.all(writes);
            });
          });

          // Sessions and notes reference files by id too; if a file id was remapped onto
          // an existing local record above (matched by filename, above, rather than a
          // plain id collision), fix those references up rather than leaving them
          // pointing at a file id that only ever existed inside the bundle.
          chain = chain.then(() => {
            const fileRemaps = result.idMap;
            if (!Object.keys(fileRemaps).length) return null;
            const remapFileId = (id) => (
              Object.prototype.hasOwnProperty.call(fileRemaps, id) ? fileRemaps[id] : id
            );

            const fixedSessions = prepared.sessions
              .map((session) => {
                const nextFileIds = Model.uniqueStrings((session.file_ids || []).map(remapFileId));
                if (nextFileIds.join(' ') === (session.file_ids || []).join(' ')) return null;
                return Object.assign({}, session, { file_ids: nextFileIds });
              })
              .filter(Boolean);

            const fixedNotes = prepared.notes
              .map((note) => {
                const nextFileIds = Model.uniqueStrings((note.file_ids || []).map(remapFileId));
                const fileIdsChanged = nextFileIds.join(' ') !== (note.file_ids || []).join(' ');

                let nextLocation = null;
                if (note.location && note.location.kind === 'plot' && note.location.file_id) {
                  const remapped = remapFileId(note.location.file_id);
                  if (remapped !== note.location.file_id) {
                    nextLocation = Object.assign({}, note.location, { file_id: remapped });
                  }
                }
                if (!fileIdsChanged && !nextLocation) return null;

                const patch = Object.assign({}, note);
                if (fileIdsChanged) patch.file_ids = nextFileIds;
                if (nextLocation) patch.location = nextLocation;
                return patch;
              })
              .filter(Boolean);

            return Promise.all([
              fixedSessions.length ? backend.putMany('sessions', fixedSessions) : null,
              fixedNotes.length ? backend.putMany('notes', fixedNotes) : null
            ]);
          });

          return chain
            .then(() => runMigrations(null))
            .then(() => {
              result.ok = true;
              return result;
            });
        })
        .catch((err) => {
          result.problems.push(err && err.message ? err.message : String(err));
          return result;
        });
    }

    return {
      backendKind: backend.kind,
      fileStoreKind: fileStore.kind,
      initDB,
      get,
      list,
      create,
      update,
      delete: remove,
      remove,
      clear,
      getAppMetadata,
      exportAll,
      importAll,
      files: fileStore,
      STORES,
      BUNDLE_STORES
    };
  }

  const api = {
    DB_NAME,
    DB_VERSION,
    STORES,
    STORE_INDEXES,
    BUNDLE_STORES,
    REFERENCE_FIELDS,
    FILE_DB_NAME,
    FILE_DB_VERSION,
    FILE_STORE,
    FILE_STORE_INDEXES,
    APP_METADATA_ID,
    hasIndexedDb,
    createStorageService,
    createIndexedDbBackend,
    createMemoryBackend,
    createLocalStorageBackend,
    createAutoBackend,
    createIndexedDbFileStore,
    createMemoryFileStore,
    migrateFileRecordToUuid,
    fileRecordToBundleEntry,
    applyQuery,
    tokenize,
    blobToBase64,
    base64ToBlob
  };

  if (typeof window !== 'undefined') window.SessionsStorage = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
