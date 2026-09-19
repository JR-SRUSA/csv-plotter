// Sessions data model: entity shapes, ID generation, normalisation and validation.
//
// Pure data helpers only -- no DOM, no IndexedDB, no browser-only APIs at module scope --
// so this file loads unchanged inside a Node `vm` sandbox for unit tests as well as in the
// browser and the concatenated ESP32 bundle.
//
// Types are expressed as JSDoc typedefs rather than TypeScript: the whole app is plain
// browser-global scripts stitched together by scripts/build-production.js, with no
// transpile step. JSDoc gives editors the same completion/checking without adding a
// toolchain the ESP32 build would have to carry.

(() => {
  // Bumped whenever a stored entity shape changes in a way that needs a migration in
  // sessions-storage.js. Mirrored into appMetadata and every export bundle.
  const SCHEMA_VERSION = '1.0';

  // Prefixes keep raw IDs readable in exported JSON and in devtools ("session_3f2a..."
  // beats a bare UUID when eyeballing a bundle).
  const ID_PREFIXES = {
    users: 'user',
    riders: 'rider',
    vehicles: 'vehicle',
    setups: 'setup',
    events: 'event',
    sessions: 'session',
    notes: 'note',
    files: 'file',
    mediaIndex: 'media'
  };

  const NOTE_TYPES = ['pre', 'during', 'post'];

  // A single, monochrome (stroke: currentColor, no fill) "note" glyph shared by every
  // place a note appears as an icon -- the Add Note button, the pinned-note marker on
  // the track map, and (as plain fill-color text, since a Plotly annotation can't embed
  // markup) the pinned-note marker on the graph -- so all three read as the same concept
  // rather than three different pictures, and none of them is a colour emoji.
  const NOTE_ICON_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
    + 'stroke-linecap="round" stroke-linejoin="round">'
    + '<path d="M4 4h13l3 3v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/>'
    + '<path d="M14 4v4a1 1 0 0 0 1 1h4"/>'
    + '<line x1="7" y1="12" x2="15" y2="12"/>'
    + '<line x1="7" y1="16" x2="13" y2="16"/>'
    + '</svg>';

  // Shared with app.js's full-screen map note card as well as sessions-ui.js's note
  // composer, so both places offer the same Take/Attach Photo affordance with the same
  // monochrome glyphs rather than each keeping its own copy.
  const CAMERA_ICON_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
    + 'stroke-linecap="round" stroke-linejoin="round">'
    + '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>'
    + '<circle cx="12" cy="13" r="4"/>'
    + '</svg>';
  const PAPERCLIP_ICON_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
    + 'stroke-linecap="round" stroke-linejoin="round">'
    + '<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.19 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>'
    + '</svg>';
  // Camera-preview controls: a shutter ring for Capture, two chasing arrows for Switch
  // Camera, and an X for Cancel -- icon-only, with the meaning carried by title/aria-label.
  const SHUTTER_ICON_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
    + 'stroke-linecap="round" stroke-linejoin="round">'
    + '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="5" fill="currentColor"/>'
    + '</svg>';
  const SWITCH_CAMERA_ICON_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
    + 'stroke-linecap="round" stroke-linejoin="round">'
    + '<path d="M20 7h-9a5 5 0 0 0-5 5"/><path d="M17 4l3 3-3 3"/>'
    + '<path d="M4 17h9a5 5 0 0 0 5-5"/><path d="M7 20l-3-3 3-3"/>'
    + '</svg>';
  const CLOSE_ICON_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
    + 'stroke-linecap="round" stroke-linejoin="round">'
    + '<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>'
    + '</svg>';

  /**
   * @typedef {Object} User
   * @property {string} id            "user_local_<uuid>" for device-local, "user_<uuid>" once claimed
   * @property {string} name
   * @property {string} [role]        "local" | "engineer" | "rider" | ...
   * @property {string} [auth_provider]
   * @property {string} created_at    ISO 8601 UTC
   * @property {string} updated_at    ISO 8601 UTC
   */

  /**
   * cda_tucked_m2/cda_braking_m2/cda_cornering_m2 are DELTAS added to the vehicle's own
   * cda_m2 to estimate the rider's aerodynamic effect in that position -- not standalone
   * drag areas -- and may be negative (e.g. leaning into a corner can reduce frontal area
   * versus sitting upright).
   *
   * @typedef {Object} Rider
   * @property {string} id
   * @property {string} name
   * @property {string} [license]
   * @property {number} [weight_kg]
   * @property {string} [experience]
   * @property {number} [cda_tucked_m2]    additive to Vehicle.cda_m2
   * @property {number} [cda_braking_m2]   additive to Vehicle.cda_m2
   * @property {number} [cda_cornering_m2] additive to Vehicle.cda_m2
   * @property {string[]} [tags]
   * @property {string} created_at
   * @property {string} updated_at
   */

  /**
   * mass_kg/cda_m2/avg_power_kw/power_curve/gearing are all optional physics inputs for
   * later performance calculations (not computed or used anywhere yet). avg_power_kw and
   * power_curve are alternative ways to describe the same thing -- a flat average, or an
   * RPM-indexed curve -- and either, both, or neither may be present.
   *
   * power_curve.power_kw is always the canonical stored form, in kW (not W -- engine
   * output is conventionally quoted in kW/hp, and a raw-watts figure reads oddly at
   * these magnitudes). The UI additionally accepts a torque curve (RPM, Nm) as an
   * alternate way to TYPE the same information in; torque_nm on a point is kept
   * alongside power_kw purely so the edit form can show back whichever unit the value
   * was actually entered in, but power_kw is what every point is required to have and
   * what any consumer should read -- torque converts losslessly to power at a given RPM
   * (power_kw = torque_nm * rpm / 9548.8) so nothing is lost by not treating torque as
   * equally canonical.
   *
   * @typedef {Object} PowerCurvePoint
   * @property {number} rpm
   * @property {number} power_kw
   * @property {number} [torque_nm] present only when this point was entered as torque
   *
   * @typedef {Object} Gearing
   * @property {number} [primary_ratio]
   * @property {number} [final_ratio]
   * @property {number} [shift_time_ms] time off power per gear change; omitted = 0
   * @property {number[]} [gear_ratios]
   * @property {string} [tire_size]            metric size like "140/70R17"; when it parses, wheel_circumference_m is derived from it
   * @property {number} [wheel_circumference_m]
   *
   * @typedef {Object} Vehicle
   * @property {string} id
   * @property {string} type          "motorcycle" | "car" | "kart" | ...
   * @property {string} [make]
   * @property {string} [model]
   * @property {number} [year]
   * @property {number} [mass_kg]
   * @property {number} [cda_m2]            drag area, in m²
   * @property {number} [avg_power_kw]
   * @property {PowerCurvePoint[]} [power_curve]
   * @property {Gearing} [gearing]
   * @property {string[]} [tags]
   * @property {Record<string, any>} [metadata]
   * @property {string} created_at
   * @property {string} updated_at
   */

  /**
   * Append-only setup record. A "change" to a vehicle's setup is a NEW Setup whose
   * supersedes_id points at the one it replaces; historical records are never mutated,
   * so a File or Session referencing an old setup keeps reading the same values.
   *
   * `values.mass_kg` is a recognised (but not required) key: it's how a vehicle's
   * Vehicle.mass_kg baseline is overridden for one specific outing -- fuel load makes
   * raced weight vary session to session, so "the bike's mass right now" is a setup
   * fact, not a fixed vehicle fact. See SetupService.getEffectiveMass, which reads it
   * off the most relevant Setup and falls back to Vehicle.mass_kg when absent.
   *
   * @typedef {Object} Setup
   * @property {string} id
   * @property {string} vehicle_id
   * @property {string} [session_id]    set when the setup was recorded during a session
   * @property {string} [name]          "Baseline", "Soft Rear"
   * @property {string} [author_id]     User.id
   * @property {string} [supersedes_id] previous Setup.id this one revises
   * @property {string} timestamp       when the setup was recorded (ISO 8601 UTC)
   * @property {Record<string, any>} values  tyre pressures, suspension clicks, gearing, ...
   * @property {string} [notes]
   * @property {string[]} [tags]
   * @property {string} created_at
   * @property {string} updated_at
   */

  /**
   * @typedef {Object} KPI
   * @property {string} type           "best_lap", "avg_speed", ...
   * @property {number|string} kpi
   */

  /**
   * The parent of a group of Sessions at one meeting -- e.g. "MotoAmerica VIR 2026".
   * Session.name stays freeform for the session itself (P1, Q2, Race1, ... -- there is
   * deliberately no fixed enum, a race org's naming varies) while Event carries the
   * shared context (where, when) so sessions can be listed and sorted grouped by meeting.
   *
   * @typedef {Object} Event
   * @property {string} id
   * @property {string} name
   * @property {string} [location]
   * @property {string} [start_date]   ISO 8601 UTC; the meeting's overall date range
   * @property {string} [end_date]
   * @property {string[]} [tags]
   * @property {Record<string, any>} [metadata]
   * @property {string} created_at
   * @property {string} updated_at
   */

  /**
   * vehicle_ids/rider_ids/file_ids/note_ids are convenience lists kept in sync with the
   * owning side (File.session_ids, Note.session_ids) by SessionService.
   *
   * rider_weight_overrides_kg answers "what did this rider actually weigh at THIS
   * session" -- Rider.weight_kg is just a baseline default; a rider can be 96kg one day
   * and 99kg the next, so the session (not the rider record) is where the day-of figure
   * belongs. The equivalent for a vehicle is Setup.values.mass_kg (see Setup) -- fuel
   * load makes a bike's raced weight vary session to session (e.g. lighter for
   * qualifying), and Setup is already the versioned, session-scoped place vehicle
   * configuration lives, so vehicle mass reuses it rather than gaining a parallel
   * mechanism. See SessionService.getEffectiveRiderWeight / SetupService.getEffectiveMass.
   *
   * @typedef {Object} Session
   * @property {string} id
   * @property {string} name
   * @property {string} [event_id]     the Event (race meeting) this session belongs to
   * @property {string} [location]
   * @property {string} [start_time]
   * @property {string} [end_time]
   * @property {string[]} vehicle_ids
   * @property {string[]} rider_ids
   * @property {string[]} file_ids
   * @property {string[]} note_ids
   * @property {KPI[]} [kpis]
   * @property {Record<string, number>} [rider_weight_overrides_kg] rider_id -> kg
   * @property {string[]} [tags]
   * @property {Record<string, any>} [metadata]
   * @property {string} created_at
   * @property {string} updated_at
   */

  /**
   * @typedef {Object} MediaRef
   * @property {string} [id]           MediaIndex.id when the blob is stored locally
   * @property {"photo"|"video"} type
   * @property {string} [url]          object URL or external URL
   * @property {string} [filename]
   * @property {string} [mimeType]
   */

  /**
   * A location a Note is pinned to: either a point on a plotted log, or a GPS point on
   * the track map. See normalizeNoteLocation for why 'plot' requires file_id+x and 'map'
   * requires lat+lon -- a location missing those is dropped rather than stored partial.
   *
   * time_value/distance_value are captured alongside x at pin time (the same row always
   * has both, regardless of which axis was active when the point was clicked) so the
   * marker keeps its position after switching the plot between Time and Distance x-axis
   * modes -- x/x_axis alone would only ever match the one mode it was pinned in.
   *
   * @typedef {Object} NoteLocation
   * @property {"plot"|"map"} kind
   * @property {string} [file_id]   'plot' only: the sessions File.id, not the in-memory plot id
   * @property {number} [lap]       'plot' only
   * @property {number} [x]         'plot' only: the x-axis value at the pinned point
   * @property {string} [x_axis]    'plot' only: "time" | "distance" | "custom"
   * @property {string} [x_channel] 'plot' only: set when x_axis === "custom"
   * @property {number} [time_value]     'plot' only: the same point's Time-axis value
   * @property {number} [distance_value] 'plot' only: the same point's Distance-axis value
   * @property {string} [channel]   'plot' only: the y-channel that was clicked, for context
   * @property {number} [value]     'plot' only: that channel's value at the point
   * @property {number} [lat]       'map' only
   * @property {number} [lon]       'map' only
   */

  /**
   * session_ids is an array: a single note ("track went green, grip up") can be relevant
   * to several sessions at once. timestamp is always when the note was entered -- it is
   * independent of the Session's own start_time/end_time.
   *
   * @typedef {Object} Note
   * @property {string} id
   * @property {string[]} session_ids
   * @property {string[]} [file_ids]
   * @property {string} [vehicle_id]
   * @property {string} [rider_id]
   * @property {string} [author_id]
   * @property {string} type           "pre" | "during" | "post"
   * @property {string} timestamp
   * @property {string} content
   * @property {MediaRef[]} [media]
   * @property {NoteLocation} [location]
   * @property {string[]} [tags]
   * @property {string} created_at
   * @property {string} updated_at
   */

  /**
   * One record per stored log file. `name` is the on-disk filename and `text` the raw
   * file contents; both predate the sessions feature. The id is a UUID so renaming a
   * file (or storing two files with the same name) cannot break session links.
   *
   * @typedef {Object} LogFileRecord
   * @property {string} id
   * @property {string} name           filename, e.g. "brands-r3.csv"
   * @property {string} [text]         raw file contents (omitted from export metadata)
   * @property {string} [filetype]     derived from the extension: csv, tcx, res, ...
   * @property {string} [storedAt]     ISO 8601 UTC; exported as uploaded_at
   * @property {string} [hash]
   * @property {Record<string, any>} [fileMeta]        track/rider/vehicle sniffed from the file
   * @property {Record<string, any>} [importerConfig]  channel mapping + filters
   * @property {string[]} [session_ids]
   * @property {string} [vehicle_id]
   * @property {string} [rider_id]
   * @property {string} [setup_id]
   * @property {string[]} [tags]
   * @property {string} [created_at]
   * @property {string} [updated_at]
   */

  /**
   * @typedef {Object} MediaEntry
   * @property {string} id
   * @property {string} filename
   * @property {string} [mimeType]
   * @property {Blob} [blob]           present only in the local store, never in an export
   * @property {string} [url]          external URL, when the media is not stored locally
   * @property {number} [size]
   * @property {string} created_at
   * @property {string} updated_at
   */

  /**
   * @typedef {Object} ExportBundle
   * @property {string} schemaVersion
   * @property {string} exportedAt
   * @property {User[]} users
   * @property {Rider[]} riders
   * @property {Vehicle[]} vehicles
   * @property {Setup[]} setups
   * @property {Session[]} sessions
   * @property {Note[]} notes
   * @property {Object[]} files        file metadata + links (never raw text)
   * @property {Object[]} mediaIndex
   * @property {Object} appMetadata
   */

  function nowIso() {
    return new Date().toISOString();
  }

  // crypto.randomUUID() and crypto.subtle both require a secure context, which the ESP32
  // build (plain HTTP) does not have. getRandomValues() has no such requirement, so use it
  // directly and fall back to Math.random only where even that is missing.
  function randomUuid() {
    const bytes = new Uint8Array(16);
    const cryptoObj = (typeof crypto !== 'undefined') ? crypto : null;
    if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
      cryptoObj.getRandomValues(bytes);
    } else {
      for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
    }
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10x
    let hex = '';
    for (let i = 0; i < 16; i++) hex += bytes[i].toString(16).padStart(2, '0');
    return hex.slice(0, 8) + '-' + hex.slice(8, 12) + '-' + hex.slice(12, 16) + '-'
      + hex.slice(16, 20) + '-' + hex.slice(20);
  }

  /**
   * @param {string} store one of ID_PREFIXES' keys, or a bare prefix string
   * @returns {string} e.g. "session_9f8c7d6e-..."
   */
  function newId(store) {
    const prefix = ID_PREFIXES[store] || store || 'obj';
    return prefix + '_' + randomUuid();
  }

  function newLocalUserId() {
    return 'user_local_' + randomUuid();
  }

  function isLocalUserId(id) {
    return typeof id === 'string' && id.indexOf('user_local_') === 0;
  }

  function asArray(value) {
    if (Array.isArray(value)) return value.filter((v) => v != null && v !== '');
    if (value == null || value === '') return [];
    return [value];
  }

  // Order-preserving de-dupe, used for every *_ids list so repeated "add" calls are
  // idempotent (clicking Add to Session twice must not list the file twice).
  function uniqueStrings(values) {
    const seen = new Set();
    const out = [];
    asArray(values).forEach((v) => {
      const s = String(v);
      if (seen.has(s)) return;
      seen.add(s);
      out.push(s);
    });
    return out;
  }

  function cleanTags(tags) {
    return uniqueStrings(asArray(tags).map((t) => String(t).trim()).filter(Boolean));
  }

  function filetypeFromName(name) {
    const match = /\.([A-Za-z0-9]+)$/.exec(String(name || ''));
    return match ? match[1].toLowerCase() : '';
  }

  // Coerces a KPI to { type, kpi }, keeping numeric strings as numbers so a KPI typed
  // into a text input still sorts and compares numerically.
  function normalizeKpi(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const type = String(raw.type == null ? '' : raw.type).trim();
    if (!type) return null;
    let kpi = raw.kpi;
    if (typeof kpi === 'string') {
      const trimmed = kpi.trim();
      const num = Number(trimmed);
      kpi = (trimmed !== '' && Number.isFinite(num)) ? num : trimmed;
    } else if (typeof kpi !== 'number') {
      kpi = kpi == null ? '' : String(kpi);
    }
    return { type, kpi };
  }

  function normalizeKpis(list) {
    return asArray(list).map(normalizeKpi).filter(Boolean);
  }

  function normalizeMediaRef(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const type = raw.type === 'video' ? 'video' : 'photo';
    const ref = { type };
    if (raw.id) ref.id = String(raw.id);
    if (raw.url) ref.url = String(raw.url);
    if (raw.filename) ref.filename = String(raw.filename);
    if (raw.mimeType) ref.mimeType = String(raw.mimeType);
    if (!ref.id && !ref.url) return null; // a media ref with neither is unresolvable
    return ref;
  }

  // A location a Note is pinned to: a point on a plotted log ('plot'), or a GPS point on
  // the track map ('map'). Optional on every Note -- most notes have no location at all.
  //
  // 'plot' locations always carry file_id (the sessions File.id, not the transient
  // in-memory plot id) and x (the x-axis value at the clicked point) -- without both,
  // there is nothing to place a marker at, so the location is dropped entirely rather
  // than stored half-populated. lap/channel/value are optional context used only to
  // describe the pin to a person, never to re-derive its position.
  //
  // 'map' locations always carry lat/lon and are deliberately NOT tied to a file: a
  // physical track location (e.g. "the bump before the fast kink") is a fact about the
  // place, not about any one log.
  function normalizeNoteLocation(raw) {
    if (!raw || typeof raw !== 'object') return undefined;
    if (raw.kind === 'map') {
      const lat = Number(raw.lat);
      const lon = Number(raw.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return undefined;
      return { kind: 'map', lat, lon };
    }
    if (raw.kind === 'plot') {
      const fileId = raw.file_id ? String(raw.file_id) : '';
      const x = Number(raw.x);
      if (!fileId || !Number.isFinite(x)) return undefined; // nothing to place a marker at
      const loc = { kind: 'plot', file_id: fileId, x };
      if (raw.lap != null && raw.lap !== '') {
        const lap = Number(raw.lap);
        if (Number.isFinite(lap)) loc.lap = lap;
      }
      if (raw.x_axis) loc.x_axis = String(raw.x_axis);
      if (raw.x_channel) loc.x_channel = String(raw.x_channel);
      if (raw.time_value != null && raw.time_value !== '') {
        const timeValue = Number(raw.time_value);
        if (Number.isFinite(timeValue)) loc.time_value = timeValue;
      }
      if (raw.distance_value != null && raw.distance_value !== '') {
        const distanceValue = Number(raw.distance_value);
        if (Number.isFinite(distanceValue)) loc.distance_value = distanceValue;
      }
      if (raw.channel) loc.channel = String(raw.channel);
      if (raw.value != null && raw.value !== '') {
        const value = Number(raw.value);
        if (Number.isFinite(value)) loc.value = value;
      }
      return loc;
    }
    return undefined;
  }

  // Strictly-positive numeric fields (mass, drag area, power, gear ratios): a zero or
  // negative value isn't physically meaningful, so it's dropped rather than stored.
  function toPositiveNumberOrUndefined(value) {
    if (value == null || value === '') return undefined;
    const n = Number(value);
    return (Number.isFinite(n) && n > 0) ? n : undefined;
  }

  // Signed numeric fields: a rider's additive CdA for a given position (tucked/braking/
  // cornering) is a delta from the vehicle's own CdA, and deltas can legitimately be
  // negative (e.g. leaning into a corner can reduce frontal area versus upright).
  function toFiniteNumberOrUndefined(value) {
    if (value == null || value === '') return undefined;
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  }

  // power(kW) = torque(Nm) x angular velocity(rad/s) / 1000, and angular velocity at N
  // RPM is N x 2*PI/60 -- so 1 Nm at this many RPM is exactly 1 kW.
  const RPM_NM_TO_KW = (2 * Math.PI) / 60000;

  function torqueNmToKw(torqueNm, rpm) {
    return torqueNm * rpm * RPM_NM_TO_KW;
  }

  function kwToTorqueNm(powerKw, rpm) {
    return rpm > 0 ? powerKw / (rpm * RPM_NM_TO_KW) : undefined;
  }

  // An engine power curve: RPM -> power at the wheel/crank, used as the alternative to a
  // single average-power figure. power_kw is always the canonical, required value --
  // accepts a point entered as either power (power_kw, or the legacy power_w in watts)
  // or torque (torque_nm), converting torque to its equivalent power_kw so every stored
  // point has one regardless of which unit it was typed in as. Sorted by RPM so a
  // consumer can assume ascending order.
  function normalizePowerCurve(raw) {
    if (!Array.isArray(raw)) return [];
    return raw
      .map((point) => {
        if (!point || typeof point !== 'object') return null;
        const rpm = toPositiveNumberOrUndefined(point.rpm);
        if (rpm === undefined) return null;

        let power_kw = toPositiveNumberOrUndefined(point.power_kw);
        if (power_kw === undefined && point.power_w != null) {
          const legacyWatts = toPositiveNumberOrUndefined(point.power_w);
          if (legacyWatts !== undefined) power_kw = legacyWatts / 1000;
        }
        const torque_nm = toPositiveNumberOrUndefined(point.torque_nm);
        if (power_kw === undefined && torque_nm !== undefined) {
          power_kw = torqueNmToKw(torque_nm, rpm);
        }
        if (power_kw === undefined) return null;

        const out = { rpm, power_kw };
        if (torque_nm !== undefined) out.torque_nm = torque_nm;
        return out;
      })
      .filter(Boolean)
      .sort((a, b) => a.rpm - b.rpm);
  }

  // Parses a metric tire size -- "140/70R17", "190/55 ZR17", "140/70-17", optionally
  // followed by a load/speed rating ("140/70R17 66H") -- into its parts plus the overall
  // diameter: 2 x sidewall (width x aspect ratio) + rim. Returns null when it isn't a
  // plausible tire size, so callers can tell "not a size" from "a size".
  function parseTireSize(text) {
    const m = /^(\d{2,3})\s*\/\s*(\d{2,3})\s*[- ]?\s*(?:Z?R|-)?\s*(\d{2})(?:\D.*)?$/
      .exec(String(text == null ? '' : text).trim().toUpperCase());
    if (!m) return null;
    const width = Number(m[1]);
    const aspect = Number(m[2]);
    const rim = Number(m[3]);
    if (width < 50 || width > 400 || aspect < 20 || aspect > 100 || rim < 8 || rim > 24) return null;
    return {
      width_mm: width,
      aspect_pct: aspect,
      rim_in: rim,
      diameter_mm: 2 * width * aspect / 100 + rim * 25.4,
      label: `${width}/${aspect}R${rim}`
    };
  }

  // Overall wheel diameter in mm for a gearing record: from its tire size when that parses,
  // otherwise back-calculated from a stored circumference (older vehicles have only that).
  function wheelDiameterMm(gearing) {
    if (!gearing) return null;
    const tire = parseTireSize(gearing.tire_size);
    if (tire) return tire.diameter_mm;
    const circ = Number(gearing.wheel_circumference_m);
    return circ > 0 ? (circ / Math.PI) * 1000 : null;
  }

  // Enough to translate an RPM (from a power curve) into road speed: gear ratios are
  // optional per-gear multipliers on top of the fixed primary/final reduction. The wheel
  // is described by its tire size; wheel_circumference_m (what the simulator turns road
  // speed into RPM with) is always derived from it when it parses, and only kept as
  // given for older records that have a circumference and no tire size.
  function normalizeGearing(raw) {
    if (!raw || typeof raw !== 'object') return undefined;
    const gearing = {};
    const primary = toPositiveNumberOrUndefined(raw.primary_ratio);
    const final = toPositiveNumberOrUndefined(raw.final_ratio);
    const wheel = toPositiveNumberOrUndefined(raw.wheel_circumference_m);
    const tire = parseTireSize(raw.tire_size);
    if (primary !== undefined) gearing.primary_ratio = primary;
    if (final !== undefined) gearing.final_ratio = final;
    if (tire) {
      gearing.tire_size = tire.label;
      gearing.wheel_circumference_m = Math.PI * tire.diameter_mm / 1000;
    } else if (wheel !== undefined) {
      gearing.wheel_circumference_m = wheel;
    }
    const gearRatios = asArray(raw.gear_ratios)
      .map(toPositiveNumberOrUndefined)
      .filter((n) => n !== undefined);
    if (gearRatios.length) gearing.gear_ratios = gearRatios;
    // Optional; blank/0 means an instantaneous shift.
    const shiftMs = toPositiveNumberOrUndefined(raw.shift_time_ms);
    if (shiftMs !== undefined) gearing.shift_time_ms = shiftMs;
    return Object.keys(gearing).length ? gearing : undefined;
  }

  // Per-store normalisers. Each takes a partial object and returns a complete, storable
  // entity: required lists defaulted to [], timestamps filled, ids minted. Unknown keys
  // are preserved so a newer bundle round-trips through an older build.
  const NORMALIZERS = {
    users(raw) {
      const obj = Object.assign({}, raw);
      obj.id = obj.id || newId('users');
      obj.name = String(obj.name == null ? '' : obj.name).trim() || 'Unnamed user';
      if (obj.role != null) obj.role = String(obj.role);
      return obj;
    },
    riders(raw) {
      const obj = Object.assign({}, raw);
      obj.id = obj.id || newId('riders');
      obj.name = String(obj.name == null ? '' : obj.name).trim() || 'Unnamed rider';
      if (obj.weight_kg != null && obj.weight_kg !== '') {
        const w = Number(obj.weight_kg);
        if (Number.isFinite(w)) obj.weight_kg = w; else delete obj.weight_kg;
      } else {
        delete obj.weight_kg;
      }
      obj.tags = cleanTags(obj.tags);

      // Additive CdA deltas for specific riding positions, layered on top of the
      // vehicle's own cda_m2 -- see toFiniteNumberOrUndefined for why these may be
      // negative. Each is independently optional.
      ['cda_tucked_m2', 'cda_braking_m2', 'cda_cornering_m2'].forEach((field) => {
        const value = toFiniteNumberOrUndefined(obj[field]);
        if (value === undefined) delete obj[field]; else obj[field] = value;
      });
      return obj;
    },
    vehicles(raw) {
      const obj = Object.assign({}, raw);
      obj.id = obj.id || newId('vehicles');
      obj.type = String(obj.type == null ? '' : obj.type).trim() || 'motorcycle';
      if (obj.year != null && obj.year !== '') {
        const y = Number(obj.year);
        if (Number.isFinite(y)) obj.year = y; else delete obj.year;
      } else {
        delete obj.year;
      }
      obj.tags = cleanTags(obj.tags);
      if (obj.metadata != null && typeof obj.metadata !== 'object') delete obj.metadata;

      // Optional physics inputs for later performance/drag calculations. mass_kg and
      // cda_m2 are the vehicle's own values; a rider's cda_*_m2 fields (above) are
      // deltas added on top of cda_m2, not replacements for it.
      const mass = toPositiveNumberOrUndefined(obj.mass_kg);
      if (mass === undefined) delete obj.mass_kg; else obj.mass_kg = mass;
      const cda = toPositiveNumberOrUndefined(obj.cda_m2);
      if (cda === undefined) delete obj.cda_m2; else obj.cda_m2 = cda;
      // avg_power_kw takes a direct kW value, or falls back to a legacy avg_power_w
      // (watts) so a vehicle saved before this field was renamed still reads correctly.
      let avgPower = toPositiveNumberOrUndefined(obj.avg_power_kw);
      if (avgPower === undefined && obj.avg_power_w != null) {
        const legacyWatts = toPositiveNumberOrUndefined(obj.avg_power_w);
        if (legacyWatts !== undefined) avgPower = legacyWatts / 1000;
      }
      delete obj.avg_power_w;
      if (avgPower === undefined) delete obj.avg_power_kw; else obj.avg_power_kw = avgPower;

      // avg_power_kw and power_curve are alternatives (a single figure vs. an RPM curve),
      // not mutually exclusive in storage -- whichever the user filled in is kept.
      const powerCurve = normalizePowerCurve(obj.power_curve);
      if (powerCurve.length) obj.power_curve = powerCurve; else delete obj.power_curve;

      const gearing = normalizeGearing(obj.gearing);
      if (gearing) obj.gearing = gearing; else delete obj.gearing;
      return obj;
    },
    setups(raw) {
      const obj = Object.assign({}, raw);
      obj.id = obj.id || newId('setups');
      obj.vehicle_id = String(obj.vehicle_id == null ? '' : obj.vehicle_id);
      obj.timestamp = obj.timestamp || obj.created_at || nowIso();
      obj.values = (obj.values && typeof obj.values === 'object') ? obj.values : {};
      obj.tags = cleanTags(obj.tags);
      return obj;
    },
    sessions(raw) {
      const obj = Object.assign({}, raw);
      obj.id = obj.id || newId('sessions');
      obj.name = String(obj.name == null ? '' : obj.name).trim() || 'Untitled session';
      if (obj.event_id) obj.event_id = String(obj.event_id); else delete obj.event_id;
      obj.vehicle_ids = uniqueStrings(obj.vehicle_ids);
      obj.rider_ids = uniqueStrings(obj.rider_ids);
      obj.file_ids = uniqueStrings(obj.file_ids);
      obj.note_ids = uniqueStrings(obj.note_ids);
      obj.kpis = normalizeKpis(obj.kpis);
      obj.tags = cleanTags(obj.tags);
      if (obj.metadata != null && typeof obj.metadata !== 'object') delete obj.metadata;

      // Per-session actual rider weight (see the Session typedef for why this lives
      // here rather than on Rider). Kept only for riders actually attached to this
      // session, and only when the value is a genuine positive number.
      if (obj.rider_weight_overrides_kg && typeof obj.rider_weight_overrides_kg === 'object') {
        const overrides = {};
        Object.keys(obj.rider_weight_overrides_kg).forEach((riderId) => {
          const kg = toPositiveNumberOrUndefined(obj.rider_weight_overrides_kg[riderId]);
          if (kg !== undefined && obj.rider_ids.indexOf(riderId) !== -1) overrides[riderId] = kg;
        });
        if (Object.keys(overrides).length) obj.rider_weight_overrides_kg = overrides;
        else delete obj.rider_weight_overrides_kg;
      } else {
        delete obj.rider_weight_overrides_kg;
      }
      return obj;
    },
    events(raw) {
      const obj = Object.assign({}, raw);
      obj.id = obj.id || newId('events');
      obj.name = String(obj.name == null ? '' : obj.name).trim() || 'Untitled event';
      obj.tags = cleanTags(obj.tags);
      if (obj.metadata != null && typeof obj.metadata !== 'object') delete obj.metadata;
      return obj;
    },
    notes(raw) {
      const obj = Object.assign({}, raw);
      obj.id = obj.id || newId('notes');
      // Accept the singular session_id spelling too: it appears in hand-written bundles
      // and in the first draft of this feature's spec.
      if (obj.session_id != null) {
        obj.session_ids = uniqueStrings(asArray(obj.session_ids).concat([obj.session_id]));
        delete obj.session_id;
      } else {
        obj.session_ids = uniqueStrings(obj.session_ids);
      }
      obj.file_ids = uniqueStrings(obj.file_ids);
      obj.type = NOTE_TYPES.indexOf(obj.type) === -1 ? 'during' : obj.type;
      obj.timestamp = obj.timestamp || obj.created_at || nowIso();
      obj.content = String(obj.content == null ? '' : obj.content);
      obj.media = asArray(obj.media).map(normalizeMediaRef).filter(Boolean);
      obj.tags = cleanTags(obj.tags);
      if (obj.location !== undefined) {
        const location = normalizeNoteLocation(obj.location);
        if (location) obj.location = location; else delete obj.location;
      }
      return obj;
    },
    files(raw) {
      const obj = Object.assign({}, raw);
      obj.id = obj.id || newId('files');
      obj.name = String(obj.name == null ? (obj.filename == null ? '' : obj.filename) : obj.name);
      delete obj.filename; // `name` is the stored spelling; filename is an export alias
      obj.filetype = obj.filetype || filetypeFromName(obj.name);
      obj.storedAt = obj.storedAt || obj.uploaded_at || obj.created_at || nowIso();
      delete obj.uploaded_at;
      if (obj.session_id != null) {
        obj.session_ids = uniqueStrings(asArray(obj.session_ids).concat([obj.session_id]));
        delete obj.session_id;
      } else {
        obj.session_ids = uniqueStrings(obj.session_ids);
      }
      obj.tags = cleanTags(obj.tags);
      return obj;
    },
    mediaIndex(raw) {
      const obj = Object.assign({}, raw);
      obj.id = obj.id || newId('mediaIndex');
      obj.filename = String(obj.filename == null ? '' : obj.filename);
      if (obj.size != null) {
        const s = Number(obj.size);
        if (Number.isFinite(s)) obj.size = s; else delete obj.size;
      }
      return obj;
    }
  };

  /**
   * Normalises `raw` for `store` and stamps created_at/updated_at.
   * @param {string} store
   * @param {Object} raw
   * @param {{ preserveTimestamps?: boolean }} [options] keep incoming timestamps (import path)
   */
  function normalize(store, raw, options) {
    const opts = options || {};
    const normalizer = NORMALIZERS[store];
    const obj = normalizer ? normalizer(raw || {}) : Object.assign({ id: newId(store) }, raw);
    const stamp = nowIso();
    obj.created_at = obj.created_at || stamp;
    obj.updated_at = (opts.preserveTimestamps && obj.updated_at) ? obj.updated_at : stamp;
    return obj;
  }

  // Minimum viable record check, used to reject junk on the import path rather than
  // writing an unusable row. Returns an array of human-readable problems.
  const REQUIRED_FIELDS = {
    users: ['id', 'name'],
    riders: ['id', 'name'],
    vehicles: ['id', 'type'],
    setups: ['id', 'vehicle_id'],
    events: ['id', 'name'],
    sessions: ['id', 'name'],
    notes: ['id'],
    files: ['id', 'name'],
    mediaIndex: ['id', 'filename']
  };

  function validate(store, obj) {
    const problems = [];
    const required = REQUIRED_FIELDS[store] || ['id'];
    if (!obj || typeof obj !== 'object') {
      problems.push(store + ': record is not an object');
      return problems;
    }
    required.forEach((field) => {
      const value = obj[field];
      if (value == null || String(value).trim() === '') {
        problems.push(store + ': missing required field "' + field + '"');
      }
    });
    if (store === 'notes' && obj.type && NOTE_TYPES.indexOf(obj.type) === -1) {
      problems.push('notes: unknown type "' + obj.type + '"');
    }
    if (store === 'setups' && obj.values && typeof obj.values !== 'object') {
      problems.push('setups: values must be an object');
    }
    return problems;
  }

  const api = {
    SCHEMA_VERSION,
    ID_PREFIXES,
    NOTE_TYPES,
    NOTE_ICON_SVG,
    CAMERA_ICON_SVG,
    PAPERCLIP_ICON_SVG,
    SHUTTER_ICON_SVG,
    SWITCH_CAMERA_ICON_SVG,
    CLOSE_ICON_SVG,
    REQUIRED_FIELDS,
    nowIso,
    randomUuid,
    newId,
    newLocalUserId,
    isLocalUserId,
    asArray,
    uniqueStrings,
    cleanTags,
    filetypeFromName,
    normalizeKpi,
    normalizeKpis,
    normalizeMediaRef,
    normalizeNoteLocation,
    normalizePowerCurve,
    parseTireSize,
    wheelDiameterMm,
    torqueNmToKw,
    kwToTorqueNm,
    normalizeGearing,
    toPositiveNumberOrUndefined,
    toFiniteNumberOrUndefined,
    normalize,
    validate
  };

  if (typeof window !== 'undefined') window.SessionsModel = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
