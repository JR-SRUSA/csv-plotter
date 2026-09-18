// Sessions UI: the Add to Session modal and the collapsible session panel.
//
// Kept out of app.js so the sessions feature is one reviewable unit, and so app.js only
// needs two entry points: SessionsUI.openAddToSession(files) from a file row, and
// SessionsUI.renderPanel() to refresh the dock.
//
// All user-supplied strings go in via textContent / value, never innerHTML, so a session
// or rider named with angle brackets cannot inject markup.

(() => {
  const Model = (typeof window !== 'undefined' && window.SessionsModel) || null;

  function el(tag, props, children) {
    const node = document.createElement(tag);
    Object.keys(props || {}).forEach((key) => {
      const value = props[key];
      if (value == null) return;
      if (key === 'class') node.className = value;
      else if (key === 'text') node.textContent = value;
      else if (key === 'dataset') Object.keys(value).forEach((d) => { node.dataset[d] = value[d]; });
      else if (key.indexOf('on') === 0 && typeof value === 'function') {
        node.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (key in node) node[key] = value;
      else node.setAttribute(key, value);
    });
    (children || []).forEach((child) => {
      if (child == null) return;
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    });
    return node;
  }

  function option(value, label, selected) {
    return el('option', { value, text: label, selected: !!selected });
  }

  // Icon-only Take Photo / Attach Photo buttons, matching the plain stroked style used
  // elsewhere (see sessions-model.js's NOTE_ICON_SVG) rather than a colour emoji. Defined
  // once in sessions-model.js (shared with app.js's full-screen map note card) rather
  // than duplicated here.
  const CAMERA_ICON_SVG = Model && Model.CAMERA_ICON_SVG;
  const PAPERCLIP_ICON_SVG = Model && Model.PAPERCLIP_ICON_SVG;

  // Builds a button whose visible content is just an icon (title/aria-label carry the
  // meaning for a mouse-hover tooltip and for screen readers, respectively).
  function buildIconButton(props, svg) {
    const icon = document.createElement('span');
    icon.className = 'icon-btn-glyph';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = svg;
    return el('button', Object.assign({ type: 'button' }, props), [icon]);
  }

  // ISO timestamps are stored UTC; the UI always shows local time.
  function formatLocal(iso) {
    if (!iso) return '';
    const date = new Date(iso);
    if (isNaN(date.getTime())) return String(iso);
    return date.toLocaleString();
  }

  function describeVehicle(vehicle) {
    if (!vehicle) return '';
    const parts = [vehicle.year, vehicle.make, vehicle.model].filter(Boolean);
    return parts.length ? parts.join(' ') : (vehicle.type || 'Vehicle');
  }

  function parseTagInput(value) {
    return String(value || '').split(',').map((t) => t.trim()).filter(Boolean);
  }

  function createUI(options) {
    const opts = options || {};
    const services = opts.services;
    if (!services) throw new Error('SessionsUI.init requires { services }.');

    const SessionService = services.SessionService;
    const NoteService = services.NoteService;
    const FileService = services.FileService;
    const VehicleService = services.VehicleService;
    const EventService = services.EventService;
    const RiderService = services.RiderService;
    const SetupService = services.SetupService;
    const MediaService = services.MediaService;
    const UserService = services.UserService;

    // Called after any change so the host app can re-render whatever else shows
    // session state (the stored-files list, the picker).
    const onChanged = typeof opts.onChanged === 'function' ? opts.onChanged : () => {};

    // Called when the user arms/disarms "pin a note on the graph/map" from the panel
    // toolbar, so app.js can attach the matching click handler on the plot or the
    // Leaflet map. Passed null to disarm.
    const onPickModeChange = typeof opts.onPickModeChange === 'function' ? opts.onPickModeChange : () => {};

    let selectedSessionId = null;
    // '__all__' shows every session; '' shows only sessions with no event; anything else
    // is an Event.id. Purely a display filter -- it never reassigns a session's event_id.
    let eventFilterId = '__all__';
    let modal = null;
    let modalState = { files: [] };

    // Set while the user has armed "Pin on Graph"/"Pin on Map" from the panel toolbar,
    // cleared as soon as a location comes back (success or cancel) or the toggle is
    // clicked again.
    let armedPickKind = null;
    // The location captured from a plot/map click, waiting for the note composer (which
    // only exists once a session is selected) to actually save it.
    let pendingNoteLocation = null;
    // Notes currently showing their inline edit form instead of their read-only display,
    // by id. A Set (not a single id) so re-rendering after any change doesn't need to
    // know or guess which note, if any, was mid-edit.
    let editingNoteIds = new Set();
    // Object URLs created for saved-note photo thumbnails in the panel's own notes list
    // (see renderNoteMediaThumbnails) -- revoked in bulk at the top of every renderPanel()
    // call, since that already wipes and rebuilds every thumbnail <img> it fed.
    let panelThumbnailUrls = [];

    // ── Add to Session modal ────────────────────────────────────────────────

    function buildModal() {
      const sessionSelect = el('select', { id: 'addToSessionSelect', class: 'session-modal-select' });
      const newNameInput = el('input', {
        type: 'text', id: 'addToSessionNewName', class: 'session-modal-input',
        placeholder: 'e.g. Brands Hatch FP1'
      });
      const newLocationInput = el('input', {
        type: 'text', id: 'addToSessionNewLocation', class: 'session-modal-input',
        placeholder: 'Location (optional)'
      });
      const newSessionFields = el('div', { class: 'session-modal-new-fields', hidden: true }, [
        newNameInput, newLocationInput
      ]);

      // Creating a new session is the same control, not a separate mode: picking the
      // "New session" option reveals the name/location fields inline.
      sessionSelect.addEventListener('change', () => {
        newSessionFields.hidden = sessionSelect.value !== '__new__';
        if (sessionSelect.value === '__new__') newNameInput.focus();
      });

      const vehicleSelect = el('select', { id: 'addToSessionVehicle', class: 'session-modal-select' });
      const riderSelect = el('select', { id: 'addToSessionRider', class: 'session-modal-select' });

      // Picking "+ Add new vehicle…"/"+ Add new rider…" opens the full creation modal
      // (with the physics fields) rather than cramming those into this compact dialog;
      // the new record is inserted into this select and selected once created, or the
      // select falls back to its previous value if the user cancels.
      vehicleSelect.addEventListener('change', () => {
        if (vehicleSelect.value !== '__new_vehicle__') return;
        const previousValue = vehicleSelect.dataset.previousValue || '';
        vehicleSelect.value = previousValue;
        openAddVehicleModal((vehicle) => {
          const opt = option(vehicle.id, describeVehicle(vehicle));
          vehicleSelect.insertBefore(opt, vehicleSelect.lastChild);
          vehicleSelect.value = vehicle.id;
        });
      });
      vehicleSelect.addEventListener('focus', () => { vehicleSelect.dataset.previousValue = vehicleSelect.value; });

      riderSelect.addEventListener('change', () => {
        if (riderSelect.value !== '__new_rider__') return;
        const previousValue = riderSelect.dataset.previousValue || '';
        riderSelect.value = previousValue;
        openAddRiderModal((rider) => {
          const opt = option(rider.id, rider.name);
          riderSelect.insertBefore(opt, riderSelect.lastChild);
          riderSelect.value = rider.id;
        });
      });
      riderSelect.addEventListener('focus', () => { riderSelect.dataset.previousValue = riderSelect.value; });

      const tagsInput = el('input', {
        type: 'text', id: 'addToSessionTags', class: 'session-modal-input',
        placeholder: 'Tags, comma separated'
      });
      const noteInput = el('textarea', {
        id: 'addToSessionNote', class: 'session-modal-textarea', rows: 3,
        placeholder: 'Quick note (optional)'
      });
      const fileListEl = el('div', { class: 'session-modal-files' });
      const statusEl = el('div', { class: 'session-modal-status', 'aria-live': 'polite' });

      const saveBtn = el('button', { type: 'button', class: 'session-modal-save', text: 'Add to Session' });
      const cancelBtn = el('button', { type: 'button', class: 'session-modal-cancel', text: 'Cancel' });

      const backdrop = el('div', { class: 'session-modal-backdrop' });
      const dialog = el('div', {
        class: 'session-modal-dialog', role: 'dialog', 'aria-modal': 'true',
        'aria-label': 'Add to session'
      }, [
        el('div', { class: 'session-modal-header' }, [
          el('h3', { class: 'session-modal-title', text: 'Add to Session' }),
          el('button', { type: 'button', class: 'session-modal-close', text: '✕', 'aria-label': 'Close' })
        ]),
        fileListEl,
        el('label', { class: 'session-modal-label', text: 'Session' }),
        sessionSelect,
        newSessionFields,
        el('label', { class: 'session-modal-label', text: 'Vehicle' }),
        vehicleSelect,
        el('label', { class: 'session-modal-label', text: 'Rider' }),
        riderSelect,
        el('label', { class: 'session-modal-label', text: 'Tags' }),
        tagsInput,
        el('label', { class: 'session-modal-label', text: 'Note' }),
        noteInput,
        statusEl,
        el('div', { class: 'session-modal-actions' }, [cancelBtn, saveBtn])
      ]);

      const root = el('div', { class: 'session-modal', hidden: true }, [backdrop, dialog]);

      backdrop.addEventListener('click', closeModal);
      cancelBtn.addEventListener('click', closeModal);
      dialog.querySelector('.session-modal-close').addEventListener('click', closeModal);
      saveBtn.addEventListener('click', submitModal);
      root.addEventListener('keydown', (ev) => {
        if (ev.key === 'Escape') closeModal();
      });

      document.body.appendChild(root);
      return {
        root, sessionSelect, newSessionFields, newNameInput, newLocationInput,
        vehicleSelect, riderSelect, tagsInput, noteInput, fileListEl, statusEl, saveBtn
      };
    }

    function ensureModal() {
      if (!modal) modal = buildModal();
      return modal;
    }

    function setModalStatus(message, isError) {
      if (!modal) return;
      modal.statusEl.textContent = message || '';
      modal.statusEl.classList.toggle('is-error', !!isError);
    }

    function closeModal() {
      if (!modal) return;
      modal.root.hidden = true;
      modalState = { files: [] };
    }

    /**
     * Opens the compact attach modal.
     * @param {Array<{id?: string, name: string}>} files one or more files to attach;
     *   passing several is the bulk path. Entries without an id are resolved by name.
     */
    function openAddToSession(files) {
      const list = (Array.isArray(files) ? files : [files]).filter(Boolean);
      if (!list.length) return Promise.resolve(null);
      const ui = ensureModal();
      modalState = { files: list };

      ui.fileListEl.innerHTML = '';
      ui.fileListEl.appendChild(el('div', {
        class: 'session-modal-files-label',
        text: list.length === 1 ? 'File' : list.length + ' files'
      }));
      list.forEach((file) => {
        ui.fileListEl.appendChild(el('div', { class: 'session-modal-file-name', text: file.name }));
      });

      ui.newSessionFields.hidden = true;
      ui.newNameInput.value = '';
      ui.newLocationInput.value = '';
      ui.tagsInput.value = '';
      ui.noteInput.value = '';
      setModalStatus('');

      return Promise.all([
        SessionService.listSessions(),
        VehicleService.listVehicles({ sortBy: 'make' }),
        RiderService.listRiders({ sortBy: 'name' })
      ]).then((results) => {
        const sessions = results[0] || [];
        const vehicles = results[1] || [];
        const riders = results[2] || [];

        ui.sessionSelect.innerHTML = '';
        sessions.forEach((session) => {
          const when = session.start_time ? ' · ' + formatLocal(session.start_time) : '';
          ui.sessionSelect.appendChild(option(session.id, session.name + when, session.id === selectedSessionId));
        });
        ui.sessionSelect.appendChild(option('__new__', sessions.length ? 'New session…' : 'New session…', !sessions.length));
        // With no sessions yet, land straight on the create fields.
        ui.newSessionFields.hidden = ui.sessionSelect.value !== '__new__';

        ui.vehicleSelect.innerHTML = '';
        ui.vehicleSelect.appendChild(option('', 'No vehicle', true));
        vehicles.forEach((v) => ui.vehicleSelect.appendChild(option(v.id, describeVehicle(v))));
        ui.vehicleSelect.appendChild(option('__new_vehicle__', '+ Add new vehicle…'));

        ui.riderSelect.innerHTML = '';
        ui.riderSelect.appendChild(option('', 'No rider', true));
        riders.forEach((r) => ui.riderSelect.appendChild(option(r.id, r.name)));
        ui.riderSelect.appendChild(option('__new_rider__', '+ Add new rider…'));

        // Prefill vehicle/rider from what the log's own header said, when it matches
        // something already on file -- saves re-picking for every file from an event.
        return prefillFromFileMeta(list, vehicles, riders, ui);
      }).then(() => {
        ui.root.hidden = false;
        if (ui.sessionSelect.value === '__new__') ui.newNameInput.focus();
        else ui.sessionSelect.focus();
        return null;
      });
    }

    function prefillFromFileMeta(list, vehicles, riders, ui) {
      const first = list[0];
      const recordPromise = first.id
        ? FileService.getFile(first.id)
        : FileService.getFileByName(first.name);
      return recordPromise.then((record) => {
        const meta = (record && record.fileMeta) || {};
        if (meta.vehicle) {
          const match = vehicles.find((v) => describeVehicle(v).toLowerCase().indexOf(String(meta.vehicle).toLowerCase()) !== -1);
          if (match) ui.vehicleSelect.value = match.id;
        }
        if (meta.rider) {
          const match = riders.find((r) => r.name.toLowerCase() === String(meta.rider).toLowerCase());
          if (match) ui.riderSelect.value = match.id;
        }
        // Suggest a session name from the log header for the create path.
        if (!ui.newNameInput.value) {
          const suggested = [meta.track, meta.session].filter(Boolean).join(' ');
          if (suggested) ui.newNameInput.value = suggested;
        }
      }).catch(() => null);
    }

    function submitModal() {
      const ui = ensureModal();
      const files = modalState.files || [];
      if (!files.length) return closeModal();

      ui.saveBtn.disabled = true;
      setModalStatus('Saving…');

      const vehicleId = ui.vehicleSelect.value || '';
      const riderId = ui.riderSelect.value || '';
      const tags = parseTagInput(ui.tagsInput.value);
      const noteText = String(ui.noteInput.value || '').trim();

      resolveTargetSession(ui)
        .then((session) => {
          if (!session) return Promise.reject(new Error('Give the new session a name.'));
          // Resolve every file to its stored record; a file that was plotted but never
          // stored (or was cleared) is reported rather than silently skipped.
          return Promise.all(files.map((file) => (file.id
            ? FileService.getFile(file.id)
            : FileService.getFileByName(file.name)).then((record) => ({ file, record }))))
            .then((resolved) => {
              const missing = resolved.filter((r) => !r.record).map((r) => r.file.name);
              const found = resolved.filter((r) => r.record);

              let chain = Promise.resolve();
              if (vehicleId) chain = chain.then(() => SessionService.addVehicleToSession(session.id, vehicleId));
              if (riderId) chain = chain.then(() => SessionService.addRiderToSession(session.id, riderId));

              found.forEach((entry) => {
                chain = chain
                  .then(() => SessionService.addFileToSession(session.id, entry.record.id))
                  .then(() => FileService.updateFileLinks(entry.record.id, {
                    vehicle_id: vehicleId || entry.record.vehicle_id,
                    rider_id: riderId || entry.record.rider_id,
                    tags: Model.cleanTags((entry.record.tags || []).concat(tags))
                  }));
              });

              if (noteText) {
                chain = chain.then(() => NoteService.createNote({
                  session_ids: [session.id],
                  file_ids: found.map((entry) => entry.record.id),
                  vehicle_id: vehicleId || undefined,
                  rider_id: riderId || undefined,
                  type: 'during',
                  content: noteText,
                  tags
                }));
              }

              return chain.then(() => ({ session, attached: found.length, missing }));
            });
        })
        .then((result) => {
          selectedSessionId = result.session.id;
          ui.saveBtn.disabled = false;
          const summary = result.attached === 1
            ? '1 file attached to "' + result.session.name + '".'
            : result.attached + ' files attached to "' + result.session.name + '".';
          if (result.missing.length) {
            setModalStatus(summary + ' Not stored in this browser: ' + result.missing.join(', '), true);
          } else {
            closeModal();
          }
          renderPanel();
          onChanged();
          return result;
        })
        .catch((err) => {
          ui.saveBtn.disabled = false;
          setModalStatus(err && err.message ? err.message : 'Could not attach the file.', true);
        });
    }

    function resolveTargetSession(ui) {
      if (ui.sessionSelect.value !== '__new__') {
        return SessionService.getSession(ui.sessionSelect.value);
      }
      const name = String(ui.newNameInput.value || '').trim();
      if (!name) return Promise.resolve(null);
      return SessionService.createSession({
        name,
        location: String(ui.newLocationInput.value || '').trim() || undefined,
        start_time: Model.nowIso()
      });
    }

    // ── Add Vehicle / Add Rider modals ──────────────────────────────────────
    // Built fresh on each open (unlike the Add to Session modal) since they carry no
    // state worth preserving between uses -- a disposable overlay, same as viewNote.

    function numberField(placeholder, step) {
      return el('input', { type: 'number', class: 'session-modal-input', placeholder, step: step || 'any' });
    }

    function readNumber(input) {
      const raw = String(input.value || '').trim();
      return raw === '' ? undefined : raw;
    }

    // Parses "rpm,value" lines (one point per line; blank lines and a header row of
    // non-numeric text are ignored) into the raw shape Model.normalizePowerCurve expects
    // -- `mode` says whether the second column is power (kW) or torque (Nm); either way
    // normalizePowerCurve converts it to the canonical power_kw.
    function parsePowerCurveText(text, mode) {
      const valueKey = mode === 'torque' ? 'torque_nm' : 'power_kw';
      return String(text || '')
        .split(/\r?\n/)
        .map((line) => line.split(',').map((s) => s.trim()))
        .filter((parts) => parts.length >= 2 && parts[0] !== '' && parts[1] !== '')
        .map((parts) => ({ rpm: parts[0], [valueKey]: parts[1] }));
    }

    // Renders a small Power(kW)/Torque(Nm) vs RPM chart into `chartDiv` from whatever is
    // currently typed into the power curve textarea, showing both curves regardless of
    // which unit was actually entered (power converts losslessly to torque at a given
    // RPM and back). Hidden -- rather than shown empty -- until there are at least 2
    // valid points, since a single point can't usefully be called a "curve".
    function renderPowerCurveChart(chartDiv, textarea, getMode) {
      const points = Model.normalizePowerCurve(parsePowerCurveText(textarea.value, getMode()));
      if (points.length < 2) {
        chartDiv.hidden = true;
        if (chartDiv.dataset.plotted && window.Plotly) Plotly.purge(chartDiv);
        delete chartDiv.dataset.plotted;
        return;
      }
      chartDiv.hidden = false;
      const rpm = points.map((p) => p.rpm);
      const powerKw = points.map((p) => p.power_kw);
      const torqueNm = points.map((p) => Model.kwToTorqueNm(p.power_kw, p.rpm));
      // Power and torque share a single Y-axis, matching the typical dyno-chart
      // convention (rather than two separately-scaled axes).
      const traces = [
        { x: rpm, y: powerKw, name: 'Power (kW)', mode: 'lines+markers', yaxis: 'y', line: { color: '#12386b' } },
        { x: rpm, y: torqueNm, name: 'Torque (Nm)', mode: 'lines+markers', yaxis: 'y', line: { color: '#c07000' } }
      ];
      const layout = {
        margin: { t: 8, r: 16, b: 34, l: 44 },
        height: 280,
        showlegend: true,
        legend: { orientation: 'h', y: 1.14 },
        xaxis: { title: { text: 'RPM' } },
        yaxis: { title: { text: 'kW / Nm' }, rangemode: 'tozero' }
      };
      Plotly.react(chartDiv, traces, layout, { displayModeBar: false, responsive: true });
      chartDiv.dataset.plotted = '1';
    }

    /**
     * @param {Function} onSaved called with the created/updated vehicle
     * @param {Object} [existingVehicle] when given, edits this vehicle instead of
     *   creating a new one (prefilled fields, "Save Changes" instead of "Add Vehicle").
     */
    function openAddVehicleModal(onSaved, existingVehicle) {
      const isEdit = !!existingVehicle;
      const v = existingVehicle || {};
      const gearing = v.gearing || {};

      const typeSelect = el('select', { class: 'session-modal-select' }, [
        option('motorcycle', 'Motorcycle', v.type === 'motorcycle' || !isEdit),
        option('car', 'Car', v.type === 'car'),
        option('kart', 'Kart', v.type === 'kart'),
        option('other', 'Other', v.type === 'other')
      ]);
      const makeInput = el('input', { type: 'text', class: 'session-modal-input', placeholder: 'Make (optional)', value: v.make || '' });
      const modelInput = el('input', { type: 'text', class: 'session-modal-input', placeholder: 'Model (optional)', value: v.model || '' });
      const yearInput = numberField('Year (optional)', '1');
      if (v.year != null) yearInput.value = v.year;
      const massInput = numberField('Mass, kg (optional)');
      if (v.mass_kg != null) massInput.value = v.mass_kg;
      const cdaInput = numberField('CdA, m² (optional)');
      if (v.cda_m2 != null) cdaInput.value = v.cda_m2;
      const avgPowerInput = numberField('Average power, kW (optional)');
      if (v.avg_power_kw != null) avgPowerInput.value = v.avg_power_kw;

      // Defaults to whichever unit the existing curve was actually entered in (if every
      // point carries a torque_nm, it was typed as torque), so re-opening a vehicle for
      // editing shows the numbers back the way they were entered rather than always
      // converting to kW.
      const hasExistingCurve = Array.isArray(v.power_curve) && v.power_curve.length > 0;
      let curveMode = hasExistingCurve && v.power_curve.every((p) => p.torque_nm != null) ? 'torque' : 'power';
      const curveModeName = 'curveMode_' + (v.id || 'new');
      const curveModePowerRadio = el('input', { type: 'radio', name: curveModeName, checked: curveMode === 'power' });
      const curveModeTorqueRadio = el('input', { type: 'radio', name: curveModeName, checked: curveMode === 'torque' });
      const curveModeRow = el('div', { class: 'session-modal-radio-row' }, [
        el('label', {}, [curveModePowerRadio, ' Power (kW)']),
        el('label', {}, [curveModeTorqueRadio, ' Torque (Nm)'])
      ]);
      const powerCurveInput = el('textarea', {
        class: 'session-modal-textarea', rows: 3,
        value: hasExistingCurve
          ? v.power_curve.map((p) => p.rpm + ', ' + (curveMode === 'torque' ? p.torque_nm : p.power_kw)).join('\n')
          : ''
      });
      const powerCurveChart = el('div', { class: 'vehicle-power-chart', hidden: true });

      // Plotly needs real layout to size into, so the chart itself is only rendered
      // once this modal is actually attached to the document (see the appendChild
      // below) -- rendering into a still-detached element would size it to zero.
      function updateCurvePlaceholder() {
        powerCurveInput.placeholder = curveMode === 'torque'
          ? 'Power curve as torque instead of an average (optional): one "rpm, Nm" pair per line, e.g.\n3000, 65\n9000, 80'
          : 'Power curve instead of an average (optional): one "rpm, kW" pair per line, e.g.\n3000, 20\n9000, 80';
      }
      function updateCurveChart() {
        renderPowerCurveChart(powerCurveChart, powerCurveInput, () => curveMode);
      }
      curveModePowerRadio.addEventListener('change', () => { curveMode = 'power'; updateCurvePlaceholder(); updateCurveChart(); });
      curveModeTorqueRadio.addEventListener('change', () => { curveMode = 'torque'; updateCurvePlaceholder(); updateCurveChart(); });
      powerCurveInput.addEventListener('input', updateCurveChart);
      updateCurvePlaceholder();
      const primaryRatioInput = numberField('Primary ratio');
      if (gearing.primary_ratio != null) primaryRatioInput.value = gearing.primary_ratio;
      const finalRatioInput = numberField('Final ratio');
      if (gearing.final_ratio != null) finalRatioInput.value = gearing.final_ratio;
      const gearRatiosInput = el('input', {
        type: 'text', class: 'session-modal-input', placeholder: 'Gear ratios, comma separated',
        value: Array.isArray(gearing.gear_ratios) ? gearing.gear_ratios.join(', ') : ''
      });
      const wheelCircInput = numberField('Wheel circumference, m');
      if (gearing.wheel_circumference_m != null) wheelCircInput.value = gearing.wheel_circumference_m;
      const statusEl = el('div', { class: 'session-modal-status' });

      const saveBtn = el('button', {
        type: 'button', class: 'session-modal-save', text: isEdit ? 'Save Changes' : 'Add Vehicle',
        onclick: () => {
          saveBtn.disabled = true;
          statusEl.textContent = '';
          const payload = {
            type: typeSelect.value,
            make: makeInput.value.trim() || undefined,
            model: modelInput.value.trim() || undefined,
            year: readNumber(yearInput),
            mass_kg: readNumber(massInput),
            cda_m2: readNumber(cdaInput),
            avg_power_kw: readNumber(avgPowerInput),
            power_curve: parsePowerCurveText(powerCurveInput.value, curveMode),
            gearing: {
              primary_ratio: readNumber(primaryRatioInput),
              final_ratio: readNumber(finalRatioInput),
              gear_ratios: gearRatiosInput.value.split(',').map((s) => s.trim()).filter(Boolean),
              wheel_circumference_m: readNumber(wheelCircInput)
            }
          };
          const save = isEdit ? VehicleService.updateVehicle(v.id, payload) : VehicleService.createVehicle(payload);
          save.then((vehicle) => {
            overlay.remove();
            onSaved(vehicle);
          }).catch((err) => {
            saveBtn.disabled = false;
            statusEl.textContent = err && err.message ? err.message : 'Could not save the vehicle.';
            statusEl.classList.add('is-error');
          });
        }
      });

      const overlay = el('div', { class: 'session-modal' }, [
        el('div', { class: 'session-modal-backdrop', onclick: () => overlay.remove() }),
        el('div', { class: 'session-modal-dialog', role: 'dialog', 'aria-modal': 'true', 'aria-label': isEdit ? 'Edit vehicle' : 'Add vehicle' }, [
          el('div', { class: 'session-modal-header' }, [
            el('h3', { class: 'session-modal-title', text: isEdit ? 'Edit Vehicle' : 'Add Vehicle' }),
            el('button', { type: 'button', class: 'session-modal-close', text: '✕', onclick: () => overlay.remove() })
          ]),
          el('label', { class: 'session-modal-label', text: 'Type' }), typeSelect,
          el('div', { class: 'session-modal-new-fields' }, [makeInput, modelInput, yearInput]),
          el('div', { class: 'session-modal-subheading', text: 'Physics (all optional)' }),
          el('div', { class: 'session-modal-hint', text: 'Used for later performance/drag estimates -- leave blank if unknown.' }),
          el('div', { class: 'session-modal-new-fields' }, [massInput, cdaInput, avgPowerInput]),
          curveModeRow,
          powerCurveInput,
          powerCurveChart,
          el('div', { class: 'session-modal-subheading', text: 'Gearing (optional)' }),
          el('div', { class: 'session-modal-new-fields' }, [primaryRatioInput, finalRatioInput, gearRatiosInput, wheelCircInput]),
          statusEl,
          el('div', { class: 'session-modal-actions' }, [
            el('button', { type: 'button', class: 'session-modal-cancel', text: 'Cancel', onclick: () => overlay.remove() }),
            saveBtn
          ])
        ])
      ]);
      document.body.appendChild(overlay);
      updateCurveChart(); // only meaningful now that powerCurveChart has real layout
      makeInput.focus();
    }

    /**
     * @param {Function} onSaved called with the created/updated rider
     * @param {Object} [existingRider] when given, edits this rider instead of creating a
     *   new one (prefilled fields, "Save Changes" instead of "Add Rider").
     */
    function openAddRiderModal(onSaved, existingRider) {
      const isEdit = !!existingRider;
      const r = existingRider || {};

      const nameInput = el('input', { type: 'text', class: 'session-modal-input', placeholder: 'Name', value: r.name || '' });
      const licenseInput = el('input', { type: 'text', class: 'session-modal-input', placeholder: 'Licence (optional)', value: r.license || '' });
      const weightInput = numberField('Weight, kg (optional)');
      if (r.weight_kg != null) weightInput.value = r.weight_kg;
      const experienceInput = el('input', { type: 'text', class: 'session-modal-input', placeholder: 'Experience (optional)', value: r.experience || '' });
      const cdaTuckedInput = numberField('Tucked ΔCdA, m²');
      if (r.cda_tucked_m2 != null) cdaTuckedInput.value = r.cda_tucked_m2;
      const cdaBrakingInput = numberField('Braking ΔCdA, m²');
      if (r.cda_braking_m2 != null) cdaBrakingInput.value = r.cda_braking_m2;
      const cdaCorneringInput = numberField('Cornering ΔCdA, m²');
      if (r.cda_cornering_m2 != null) cdaCorneringInput.value = r.cda_cornering_m2;
      const statusEl = el('div', { class: 'session-modal-status' });

      const saveBtn = el('button', {
        type: 'button', class: 'session-modal-save', text: isEdit ? 'Save Changes' : 'Add Rider',
        onclick: () => {
          const name = nameInput.value.trim();
          if (!name) { statusEl.textContent = 'Give the rider a name.'; statusEl.classList.add('is-error'); return; }
          saveBtn.disabled = true;
          statusEl.textContent = '';
          const payload = {
            name,
            license: licenseInput.value.trim() || undefined,
            weight_kg: readNumber(weightInput),
            experience: experienceInput.value.trim() || undefined,
            cda_tucked_m2: readNumber(cdaTuckedInput),
            cda_braking_m2: readNumber(cdaBrakingInput),
            cda_cornering_m2: readNumber(cdaCorneringInput)
          };
          const save = isEdit ? RiderService.updateRider(r.id, payload) : RiderService.createRider(payload);
          save.then((rider) => {
            overlay.remove();
            onSaved(rider);
          }).catch((err) => {
            saveBtn.disabled = false;
            statusEl.textContent = err && err.message ? err.message : 'Could not save the rider.';
            statusEl.classList.add('is-error');
          });
        }
      });

      const overlay = el('div', { class: 'session-modal' }, [
        el('div', { class: 'session-modal-backdrop', onclick: () => overlay.remove() }),
        el('div', { class: 'session-modal-dialog', role: 'dialog', 'aria-modal': 'true', 'aria-label': isEdit ? 'Edit rider' : 'Add rider' }, [
          el('div', { class: 'session-modal-header' }, [
            el('h3', { class: 'session-modal-title', text: isEdit ? 'Edit Rider' : 'Add Rider' }),
            el('button', { type: 'button', class: 'session-modal-close', text: '✕', onclick: () => overlay.remove() })
          ]),
          el('div', { class: 'session-modal-new-fields' }, [nameInput, licenseInput, weightInput, experienceInput]),
          el('div', { class: 'session-modal-subheading', text: 'Aerodynamics (all optional)' }),
          el('div', {
            class: 'session-modal-hint',
            text: 'Each value is ADDED to the vehicle’s own CdA to estimate the rider’s effect on drag in that '
              + 'position (e.g. sitting up under braking increases frontal area). A value can be negative -- '
              + 'e.g. leaning into a corner can reduce frontal area versus sitting upright. Leave blank if unknown.'
          }),
          el('div', { class: 'session-modal-new-fields' }, [cdaTuckedInput, cdaBrakingInput, cdaCorneringInput]),
          statusEl,
          el('div', { class: 'session-modal-actions' }, [
            el('button', { type: 'button', class: 'session-modal-cancel', text: 'Cancel', onclick: () => overlay.remove() }),
            saveBtn
          ])
        ])
      ]);
      document.body.appendChild(overlay);
      nameInput.focus();
    }

    // ── Location pinning & note viewer ──────────────────────────────────────
    // "Pin on Graph"/"Pin on Map" (toolbar buttons in the panel, below) arm a pick mode;
    // app.js attaches the actual plot/map click listener and, on a successful click,
    // calls beginNoteAtLocation with the captured location. From here it's just state
    // the note composer reads when it builds the note to save.

    // Defaults a new note's type to where "now" falls relative to the session's own
    // start/end time -- independent of the note's own timestamp, which is always just
    // "now" (see NoteService.createNote). Falls back to 'during' whenever the session
    // has no times set, or "now" can't be shown to be outside them, matching the
    // previous fixed default.
    function defaultNoteTypeForSession(session) {
      const now = Date.now();
      const startMs = session && session.start_time ? new Date(session.start_time).getTime() : NaN;
      const endMs = session && session.end_time ? new Date(session.end_time).getTime() : NaN;
      if (Number.isFinite(startMs) && now < startMs) return 'pre';
      if (Number.isFinite(endMs) && now > endMs) return 'post';
      return 'during';
    }

    function formatLocationNumber(n) {
      if (!Number.isFinite(n)) return '';
      return Math.abs(n) >= 100 ? String(Math.round(n)) : String(Math.round(n * 100) / 100);
    }

    function describeLocation(location) {
      if (!location) return '';
      if (location.kind === 'map') {
        return '📍 Map location (' + location.lat.toFixed(5) + ', ' + location.lon.toFixed(5) + ')';
      }
      const parts = [];
      if (location.file_name) parts.push(location.file_name);
      if (location.lap != null) parts.push('Lap ' + location.lap);
      // Show Time and Distance together when both are known (captured at pin time
      // regardless of which was the active axis) -- the marker follows either axis, so
      // the description does too, rather than only naming whichever was active when it
      // was pinned.
      if (Number.isFinite(location.time_value)) parts.push('Time ' + formatLocationNumber(location.time_value));
      if (Number.isFinite(location.distance_value)) parts.push('Distance ' + formatLocationNumber(location.distance_value));
      if (location.x_axis === 'custom' && Number.isFinite(location.x)) {
        parts.push((location.x_channel || 'X') + ' ' + formatLocationNumber(location.x));
      } else if (!Number.isFinite(location.time_value) && !Number.isFinite(location.distance_value) && Number.isFinite(location.x)) {
        // Older notes pinned before time_value/distance_value existed: fall back to
        // whichever single axis value they have.
        const axisLabel = location.x_axis === 'time' ? 'Time' : location.x_axis === 'distance' ? 'Distance' : 'X';
        parts.push(axisLabel + ' ' + formatLocationNumber(location.x));
      }
      if (location.channel && Number.isFinite(location.value)) {
        parts.push(location.channel + ' ' + formatLocationNumber(location.value));
      }
      return '📍 ' + (parts.length ? parts.join(' · ') : 'Pinned point');
    }

    // Builds a row of small photo thumbnails for a saved note's media array. Each <img>
    // starts blank and fills in once MediaService resolves the stored blob to an object
    // URL -- fetched fresh every call (getMediaUrl always mints a new URL), so callers
    // pass in the array they want those URLs collected into for later revocation (see
    // panelThumbnailUrls for the panel's own notes list, or viewNote's own local array).
    function renderNoteMediaThumbnails(mediaArr, urlCollector) {
      const photos = (mediaArr || []).filter((m) => m && m.type === 'photo' && m.id);
      if (!photos.length) return null;
      const row = el('div', { class: 'session-note-media-thumbs' });
      photos.forEach((m) => {
        const img = el('img', { class: 'session-note-media-thumb', alt: m.filename || 'Photo' });
        row.appendChild(img);
        MediaService.getMediaUrl(m.id).then((url) => {
          if (!url) return;
          urlCollector.push(url);
          img.src = url;
          img.addEventListener('click', () => window.open(url, '_blank'));
        }).catch(() => {});
      });
      return row;
    }

    /** Toggles "pin a note here" mode for the plot ('plot') or the map ('map'). */
    function toggleLocationPick(kind) {
      if (armedPickKind === kind) {
        disarmLocationPick();
        return;
      }
      SessionService.listSessions().then((sessions) => {
        if (!sessions.length) {
          window.alert('Create a session first, then pin a note to the graph or map.');
          return;
        }
        armedPickKind = kind;
        onPickModeChange(kind);
        renderPanel();
      });
    }

    function disarmLocationPick() {
      if (!armedPickKind) return;
      armedPickKind = null;
      onPickModeChange(null);
      renderPanel();
    }

    /** app.js calls this when an armed pick could not be completed (e.g. no point hit). */
    function notifyPickCancelled(kind, message) {
      armedPickKind = null;
      renderPanel();
      if (message) window.alert(message);
    }

    /**
     * app.js calls this once the user has clicked a point on the plot or the map while a
     * pick was armed. Opens (and scrolls to) the note composer with the location attached,
     * on whichever session is currently selected.
     * @param {Object} location see sessions-model.js's NoteLocation typedef
     */
    function beginNoteAtLocation(location) {
      armedPickKind = null;
      onPickModeChange(null);
      SessionService.listSessions().then((sessions) => {
        if (!sessions.length) {
          window.alert('Create a session first, then pin a note to the graph or map.');
          return;
        }
        if (!selectedSessionId || !sessions.some((s) => s.id === selectedSessionId)) {
          selectedSessionId = sessions[0].id;
        }
        pendingNoteLocation = location;
        const panelDetails = document.getElementById('sessionsPanel');
        if (panelDetails && !panelDetails.open) panelDetails.open = true;
        renderPanel().then(() => {
          const input = document.querySelector('.session-note-input');
          if (input) input.focus();
        });
      });
    }

    /**
     * Creates a note directly, bypassing the panel composer entirely -- used by the
     * full-screen map's floating "add note" card (see app.js's openFullscreenNoteCard),
     * which has nowhere to show the panel's own type/author selects since the panel is
     * hidden behind the full-screen map. Falls back to the app's currently-selected
     * session, or the first session if none is selected, and defaults author/type the
     * same way the panel composer would.
     * @param {Object} location see sessions-model.js's NoteLocation typedef
     * @param {string} content
     * @param {Array} [media] already-saved MediaIndex references, e.g. from the
     *   full-screen card's own Take/Attach Photo buttons (see app.js)
     * @returns {Promise<Object>} the created note
     */
    function quickCreateNoteAtLocation(location, content, media) {
      return SessionService.listSessions().then((sessions) => {
        if (!sessions.length) {
          throw new Error('Create a session first, then pin a note to the map.');
        }
        const session = (selectedSessionId && sessions.find((s) => s.id === selectedSessionId)) || sessions[0];
        return NoteService.createNote({
          session_ids: [session.id],
          type: defaultNoteTypeForSession(session),
          content: String(content || '').trim(),
          location,
          media: media || undefined
        });
      }).then((note) => {
        renderPanel();
        onChanged();
        return note;
      });
    }

    /** Small read-only popover for a note, reachable from a map marker. */
    function viewNote(noteId) {
      NoteService.getNote(noteId).then((note) => {
        if (!note) return;
        // This popup's own thumbnail object URLs -- separate from panelThumbnailUrls
        // (the Sessions panel's notes list) since each getMediaUrl call mints a distinct
        // URL; revoked together when this specific popup closes, not on every re-render.
        const viewNoteThumbnailUrls = [];
        const closeIt = () => {
          viewNoteThumbnailUrls.forEach((url) => { try { URL.revokeObjectURL(url); } catch (e) { /* ignore */ } });
          overlay.remove();
        };

        const mediaThumbs = el('div', { class: 'session-note-media-thumbs' });
        function appendMediaThumbnails(mediaArr) {
          (mediaArr || []).filter((m) => m && m.type === 'photo' && m.id).forEach((m) => {
            const img = el('img', { class: 'session-note-media-thumb', alt: m.filename || 'Photo' });
            mediaThumbs.appendChild(img);
            MediaService.getMediaUrl(m.id).then((url) => {
              if (!url) return;
              viewNoteThumbnailUrls.push(url);
              img.src = url;
              img.addEventListener('click', () => window.open(url, '_blank'));
            }).catch(() => {});
          });
        }
        appendMediaThumbnails(note.media);

        // Lets a photo be added to a note reachable only from its map/graph marker,
        // without needing to go find it again in the Sessions panel's note list. Saves
        // straight to the note (there's no separate "Save" step in this popup, unlike
        // the composer, which stages media until the note itself is first created).
        const mediaStatus = el('span', { class: 'session-note-media-status' });
        const initialMediaCount = (note.media && note.media.length) || 0;
        if (initialMediaCount) {
          mediaStatus.textContent = initialMediaCount + (initialMediaCount === 1 ? ' photo attached' : ' photos attached');
        }
        const fileInput = el('input', { type: 'file', accept: 'image/*', hidden: true });

        function addMediaToNote(blob, filename) {
          const mediaEntry = {};
          return MediaService.saveMediaBlob(blob, filename, blob.type).then((entry) => {
            mediaEntry.id = entry.id;
            mediaEntry.type = 'photo';
            mediaEntry.filename = entry.filename;
            mediaEntry.mimeType = entry.mimeType;
            const nextMedia = (note.media || []).concat([mediaEntry]);
            return NoteService.updateNote(note.id, { media: nextMedia });
          }).then((updated) => {
            note.media = (updated && updated.media) || [];
            mediaStatus.textContent = note.media.length + (note.media.length === 1 ? ' photo attached' : ' photos attached');
            appendMediaThumbnails([mediaEntry]);
            // Refreshes the Sessions panel's own notes list (a separate DOM tree from
            // this popup) so its thumbnail shows up without needing some unrelated
            // change to trigger a re-render first.
            renderPanel();
            onChanged();
          });
        }

        fileInput.addEventListener('change', () => {
          const picked = fileInput.files && fileInput.files[0];
          fileInput.value = '';
          if (picked) addMediaToNote(picked, picked.name);
        });

        const takePhotoBtn = buildIconButton({
          class: 'session-note-photo-btn', title: 'Take Photo', 'aria-label': 'Take Photo',
          onclick: () => {
            mediaStatus.textContent = 'Requesting camera…';
            MediaService.requestCamera().then((result) => {
              if (!result.ok) {
                mediaStatus.textContent = result.reason === 'denied'
                  ? 'Camera blocked — pick a file instead.'
                  : 'No camera available — pick a file instead.';
                fileInput.click();
                return null;
              }
              return captureFromStream(result.stream).then((blob) => {
                MediaService.stopCamera(result.stream);
                if (blob) return addMediaToNote(blob, 'capture.png');
                mediaStatus.textContent = 'Capture cancelled.';
                return null;
              });
            });
          }
        }, CAMERA_ICON_SVG);

        const attachPhotoBtn = buildIconButton({
          class: 'session-note-attach-btn', title: 'Attach Photo', 'aria-label': 'Attach Photo',
          onclick: () => fileInput.click()
        }, PAPERCLIP_ICON_SVG);

        const overlay = el('div', { class: 'session-note-view-overlay' }, [
          el('div', { class: 'session-note-view-dialog' }, [
            el('div', { class: 'session-note-view-header' }, [
              el('span', { class: 'session-note-type', text: note.type }),
              el('span', { class: 'session-note-time', text: formatLocal(note.timestamp) }),
              el('button', {
                type: 'button', class: 'session-note-view-close', text: '✕',
                'aria-label': 'Close', onclick: closeIt
              })
            ]),
            note.location ? el('div', { class: 'session-note-view-location', text: describeLocation(note.location) }) : null,
            el('div', { class: 'session-note-view-content', text: note.content }),
            (note.tags && note.tags.length)
              ? el('div', { class: 'session-note-tags', text: note.tags.join(' · ') })
              : null,
            mediaThumbs,
            el('div', { class: 'session-note-composer-row session-note-photo-actions' }, [
              takePhotoBtn, attachPhotoBtn, mediaStatus
            ]),
            el('div', { class: 'session-note-view-actions' }, [
              el('button', {
                type: 'button', class: 'session-delete-btn', text: 'Delete Note',
                onclick: () => {
                  if (!window.confirm('Delete this note?')) return;
                  NoteService.deleteNote(note.id).then(() => {
                    closeIt();
                    renderPanel();
                    onChanged();
                  });
                }
              })
            ]),
            fileInput
          ])
        ]);
        overlay.addEventListener('click', (ev) => { if (ev.target === overlay) closeIt(); });
        document.body.appendChild(overlay);
      });
    }

    // ── Session panel ───────────────────────────────────────────────────────

    function panelBody() {
      return document.getElementById('sessionsPanelBody');
    }

    function renderPanel() {
      const body = panelBody();
      if (!body) return Promise.resolve();

      return SessionService.listSessionsGroupedByEvent().then((groups) => {
        panelThumbnailUrls.forEach((url) => { try { URL.revokeObjectURL(url); } catch (e) { /* ignore */ } });
        panelThumbnailUrls = [];
        body.innerHTML = '';

        // Event first, then Session within it -- a pure display filter (see
        // eventFilterId's declaration): picking an event here never reassigns any
        // session's event_id, that still only happens via the Event field in the
        // session detail below.
        const eventRow = el('div', { class: 'sessions-toolbar sessions-event-filter-row' });
        const eventSelect = el('select', { class: 'sessions-select', 'aria-label': 'Filter sessions by event' });
        eventSelect.appendChild(option('__all__', 'All Events', eventFilterId === '__all__'));
        groups.filter((g) => g.event).forEach((g) => {
          eventSelect.appendChild(option(g.event.id, g.event.name, eventFilterId === g.event.id));
        });
        if (groups.some((g) => !g.event)) {
          eventSelect.appendChild(option('', 'No Event', eventFilterId === ''));
        }
        eventSelect.addEventListener('change', () => {
          eventFilterId = eventSelect.value;
          renderPanel();
        });
        eventRow.appendChild(el('label', { class: 'session-field-label', text: 'Event' }));
        eventRow.appendChild(eventSelect);
        body.appendChild(eventRow);

        const visibleGroups = eventFilterId === '__all__' ? groups
          : groups.filter((g) => (eventFilterId === '' ? !g.event : g.event && g.event.id === eventFilterId));
        const sessions = visibleGroups.reduce((all, g) => all.concat(g.sessions), []);

        const toolbar = el('div', { class: 'sessions-toolbar' });
        const select = el('select', { class: 'sessions-select', id: 'sessionsPanelSelect' });
        if (!sessions.length) {
          select.appendChild(option('', 'No sessions yet', true));
          select.disabled = true;
        } else {
          if (!selectedSessionId || !sessions.some((s) => s.id === selectedSessionId)) {
            selectedSessionId = sessions[0].id;
          }
          // Still grouped by event even when the filter is "All Events", so browsing by
          // event remains the picker's shape rather than just a flat list.
          visibleGroups.forEach((group) => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = group.event ? group.event.name : 'No Event';
            group.sessions.forEach((s) => optgroup.appendChild(option(s.id, s.name, s.id === selectedSessionId)));
            select.appendChild(optgroup);
          });
          select.addEventListener('change', () => {
            selectedSessionId = select.value;
            renderPanel();
          });
        }
        toolbar.appendChild(select);
        toolbar.appendChild(el('button', {
          type: 'button', class: 'sessions-new-btn', text: 'New Session',
          onclick: createSessionInline
        }));
        body.appendChild(toolbar);

        if (!sessions.length) {
          const anySessionsAtAll = groups.some((g) => g.sessions.length);
          body.appendChild(el('p', {
            class: 'settings-io-hint',
            text: anySessionsAtAll
              ? 'No sessions under this event filter.'
              : 'Plot a CSV, then use Add to Session on the file to start building a session.'
          }));
          return null;
        }

        return SessionService.getSessionDetail(selectedSessionId).then((detail) => {
          if (!detail) return null;
          return renderSessionDetail(detail).then((node) => { body.appendChild(node); return null; });
        });
      }).catch(() => null);
    }

    function createSessionInline() {
      const name = window.prompt('Session name');
      if (name == null) return;
      const trimmed = String(name).trim();
      if (!trimmed) return;
      SessionService.createSession({ name: trimmed, start_time: Model.nowIso() })
        .then((session) => {
          selectedSessionId = session.id;
          renderPanel();
          onChanged();
        });
    }

    // Async because the Vehicles/Riders sections need each one's effective mass/weight
    // for THIS session (a Setup lookup and a Session lookup respectively) resolved
    // before they can render -- see renderVehiclesSection/renderRidersSection.
    function renderSessionDetail(detail) {
      const session = detail.session;
      return Promise.all([
        Promise.all(detail.vehicles.map((v) => SetupService.getEffectiveMass(v.id, session.id))),
        Promise.all(detail.riders.map((r) => SessionService.getEffectiveRiderWeight(session.id, r.id)))
      ]).then(([vehicleMasses, riderWeights]) => {
        const wrap = el('div', { class: 'session-detail' });

        // Name / event / location / times, editable in place.
        wrap.appendChild(renderEditableRow('Name', session.name, (value) => {
          if (!value.trim()) return Promise.resolve();
          return SessionService.updateSession(session.id, { name: value.trim() });
        }));
        wrap.appendChild(renderEventRow(session));
        wrap.appendChild(renderEditableRow('Location', session.location || '', (value) => (
          SessionService.updateSession(session.id, { location: value.trim() })
        )));
        // The session's own start/end time -- when the track session actually ran -- is
        // independent of when any note attached to it was written (each note keeps its
        // own timestamp, stamped at creation; see NoteService.createNote).
        wrap.appendChild(renderDateTimeRow('Start Time', session.start_time, (iso) => (
          SessionService.updateSession(session.id, { start_time: iso })
        )));
        wrap.appendChild(renderDateTimeRow('End Time', session.end_time, (iso) => (
          SessionService.updateSession(session.id, { end_time: iso })
        )));

        wrap.appendChild(renderKpiSection(session));
        wrap.appendChild(renderVehiclesSection(session, detail.vehicles, vehicleMasses));
        wrap.appendChild(renderRidersSection(session, detail.riders, riderWeights));
        wrap.appendChild(renderLinkedSection('Files', detail.files.map((f) => ({
          id: f.id, label: f.name
        })), (id) => SessionService.removeFileFromSession(session.id, id)));
        wrap.appendChild(renderNotesSection(session, detail.notes));

        wrap.appendChild(el('div', { class: 'session-detail-actions' }, [
          el('button', {
            type: 'button', class: 'session-delete-btn', text: 'Delete Session',
            onclick: () => {
              if (!window.confirm('Delete "' + session.name + '"? Files and notes are kept, just unlinked.')) return;
              SessionService.deleteSession(session.id).then(() => {
                selectedSessionId = null;
                renderPanel();
                onChanged();
              });
            }
          })
        ]));

        return wrap;
      });
    }

    // The race meeting this session belongs to (e.g. "MotoAmerica VIR 2026"). A select
    // rather than free text -- Event is a real linked entity, not a label -- with
    // "+ New Event..." inline, same pattern as the Add to Session modal's session picker.
    function renderEventRow(session) {
      const select = el('select', { class: 'session-field-input', 'aria-label': 'Event' });
      select.appendChild(option('', 'Loading…', true));
      select.disabled = true;

      select.addEventListener('focus', () => { select.dataset.previousValue = select.value; });
      select.addEventListener('change', () => {
        if (select.value === '__new_event__') {
          const previousValue = select.dataset.previousValue || '';
          select.value = previousValue;
          const name = window.prompt('Event name (e.g. "MotoAmerica VIR 2026")');
          if (name == null) return;
          const trimmed = String(name).trim();
          if (!trimmed) return;
          EventService.createEvent({ name: trimmed })
            .then((event) => SessionService.setEvent(session.id, event.id))
            .then(() => { renderPanel(); onChanged(); });
          return;
        }
        SessionService.setEvent(session.id, select.value || null).then(() => { renderPanel(); onChanged(); });
      });

      EventService.listEvents().then((events) => {
        select.innerHTML = '';
        select.disabled = false;
        select.appendChild(option('', 'No event', !session.event_id));
        events.forEach((e) => select.appendChild(option(e.id, e.name, e.id === session.event_id)));
        select.appendChild(option('__new_event__', '+ New event…'));
      }).catch(() => {});

      return el('div', { class: 'session-field-row' }, [
        el('label', { class: 'session-field-label', text: 'Event' }), select
      ]);
    }

    // Blur-to-save text row. Saving on blur (rather than a per-field Save button) keeps
    // the panel compact, which is the point of a docked panel.
    function renderEditableRow(label, value, save) {
      const input = el('input', { type: 'text', class: 'session-field-input', value: value || '' });
      let lastSaved = value || '';
      const commit = () => {
        if (input.value === lastSaved) return;
        lastSaved = input.value;
        Promise.resolve(save(input.value)).then(() => {
          renderPanel();
          onChanged();
        });
      };
      input.addEventListener('blur', commit);
      input.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') { ev.preventDefault(); input.blur(); }
      });
      return el('div', { class: 'session-field-row' }, [
        el('label', { class: 'session-field-label', text: label }), input
      ]);
    }

    // datetime-local reads/writes local wall-clock time with no timezone; Session
    // stores UTC ISO strings, so the conversion happens right here at the edges.
    function isoToDatetimeLocalValue(iso) {
      if (!iso) return '';
      const date = new Date(iso);
      if (isNaN(date.getTime())) return '';
      const pad = (n) => String(n).padStart(2, '0');
      return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate())
        + 'T' + pad(date.getHours()) + ':' + pad(date.getMinutes());
    }

    function datetimeLocalValueToIso(value) {
      if (!value) return null;
      const date = new Date(value); // 'YYYY-MM-DDTHH:mm' parses as local time
      return isNaN(date.getTime()) ? null : date.toISOString();
    }

    // Same blur-to-save pattern as renderEditableRow, but for the session's own
    // start/end time -- an empty value clears the field (stored as null).
    function renderDateTimeRow(label, isoValue, save) {
      const input = el('input', { type: 'datetime-local', class: 'session-field-input', value: isoToDatetimeLocalValue(isoValue) });
      let lastSaved = input.value;
      const commit = () => {
        if (input.value === lastSaved) return;
        lastSaved = input.value;
        Promise.resolve(save(datetimeLocalValueToIso(input.value))).then(() => {
          renderPanel();
          onChanged();
        });
      };
      input.addEventListener('change', commit);
      input.addEventListener('blur', commit);
      return el('div', { class: 'session-field-row' }, [
        el('label', { class: 'session-field-label', text: label }), input
      ]);
    }

    function renderKpiSection(session) {
      const section = el('div', { class: 'session-section' }, [
        el('div', { class: 'session-section-title', text: 'KPIs' })
      ]);
      const list = el('div', { class: 'session-kpi-list' });

      (session.kpis || []).forEach((kpi) => {
        const valueInput = el('input', {
          type: 'text', class: 'session-kpi-value', value: String(kpi.kpi),
          'aria-label': kpi.type + ' value'
        });
        const commit = () => {
          if (String(valueInput.value) === String(kpi.kpi)) return;
          SessionService.updateKPI(session.id, kpi.type, valueInput.value)
            .then(() => { renderPanel(); onChanged(); });
        };
        valueInput.addEventListener('blur', commit);
        valueInput.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter') { ev.preventDefault(); valueInput.blur(); }
        });
        list.appendChild(el('div', { class: 'session-kpi-row' }, [
          el('span', { class: 'session-kpi-type', text: kpi.type }),
          valueInput,
          el('button', {
            type: 'button', class: 'session-kpi-remove', text: '✕',
            'aria-label': 'Remove ' + kpi.type,
            onclick: () => SessionService.removeKPI(session.id, kpi.type)
              .then(() => { renderPanel(); onChanged(); })
          })
        ]));
      });

      if (!(session.kpis || []).length) {
        list.appendChild(el('div', { class: 'session-empty', text: 'No KPIs yet.' }));
      }

      const typeInput = el('input', { type: 'text', class: 'session-kpi-new-type', placeholder: 'KPI, e.g. best_lap' });
      const valueInput = el('input', { type: 'text', class: 'session-kpi-new-value', placeholder: 'Value' });
      const addKpi = () => {
        const type = String(typeInput.value || '').trim();
        if (!type) return;
        SessionService.addKPI(session.id, { type, kpi: valueInput.value })
          .then(() => { typeInput.value = ''; valueInput.value = ''; renderPanel(); onChanged(); });
      };
      valueInput.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') { ev.preventDefault(); addKpi(); }
      });

      section.appendChild(list);
      section.appendChild(el('div', { class: 'session-kpi-add' }, [
        typeInput, valueInput,
        el('button', { type: 'button', class: 'session-kpi-add-btn', text: 'Add', onclick: addKpi })
      ]));
      return section;
    }

    /**
     * @param {{addLabel?: string, onAdd?: Function}} [addOptions] when given, renders a
     *   small "+ ..." button in the section header (e.g. "+ Vehicle") that opens a
     *   creation flow and attaches the result to the current session.
     */
    function renderLinkedSection(title, items, unlink, addOptions) {
      const header = el('div', { class: 'session-section-header' }, [
        el('div', { class: 'session-section-title', text: title })
      ]);
      if (addOptions && addOptions.onAdd) {
        header.appendChild(el('button', {
          type: 'button', class: 'session-section-add-btn', text: addOptions.addLabel || '+ Add',
          onclick: addOptions.onAdd
        }));
      }
      const section = el('div', { class: 'session-section' }, [header]);
      if (!items.length) {
        section.appendChild(el('div', { class: 'session-empty', text: 'None.' }));
        return section;
      }
      items.forEach((item) => {
        section.appendChild(el('div', { class: 'session-linked-row' }, [
          el('span', { class: 'session-linked-label', text: item.label, title: item.label }),
          el('button', {
            type: 'button', class: 'session-linked-remove', text: '✕',
            'aria-label': 'Unlink ' + item.label,
            onclick: () => Promise.resolve(unlink(item.id)).then(() => { renderPanel(); onChanged(); })
          })
        ]));
      });
      return section;
    }

    // Blur-to-save number input used by both the vehicle-mass and rider-weight rows
    // below: empty keeps the current value rather than clearing it (there is no "remove
    // the override, go back to the baseline" affordance yet -- typing over the number is
    // the only edit path for now).
    function renderOverrideNumberInput(currentValue, placeholder, title, onCommit) {
      const input = el('input', {
        type: 'number', step: 'any', class: 'session-linked-override-input',
        placeholder, title, value: currentValue != null ? currentValue : ''
      });
      let lastSaved = input.value;
      const commit = () => {
        if (input.value === lastSaved) return;
        const trimmed = input.value.trim();
        if (!trimmed) { input.value = lastSaved; return; }
        const num = Number(trimmed);
        if (!Number.isFinite(num)) { input.value = lastSaved; return; }
        lastSaved = input.value;
        Promise.resolve(onCommit(num)).then(() => { renderPanel(); onChanged(); });
      };
      input.addEventListener('blur', commit);
      input.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); input.blur(); } });
      return input;
    }

    /**
     * Vehicles attached to the session, each with its effective mass for THIS session
     * (a Setup override if one exists, else Vehicle.mass_kg -- see
     * SetupService.getEffectiveMass) shown as an editable number that writes a session
     * setup override on change (SetupService.setSessionMass), plus Edit (the full
     * Add Vehicle form, prefilled) and Unlink.
     *
     * Vehicle mass varies session to session (fuel load, mainly) in a way the vehicle's
     * own baseline can't capture -- see the Setup typedef in sessions-model.js for why
     * this lives on Setup rather than being a second field on Vehicle.
     */
    function renderVehiclesSection(session, vehicles, masses) {
      const header = el('div', { class: 'session-section-header' }, [
        el('div', { class: 'session-section-title', text: 'Vehicles' })
      ]);
      header.appendChild(el('button', {
        type: 'button', class: 'session-section-add-btn', text: '+ Vehicle',
        onclick: () => openAddVehicleModal((vehicle) => SessionService.addVehicleToSession(session.id, vehicle.id)
          .then(() => { renderPanel(); onChanged(); }))
      }));
      const section = el('div', { class: 'session-section' }, [header]);
      if (!vehicles.length) {
        section.appendChild(el('div', { class: 'session-empty', text: 'None.' }));
        return section;
      }
      vehicles.forEach((vehicle, i) => {
        const massInfo = masses[i] || { mass_kg: null, source: null };
        const label = describeVehicle(vehicle);
        const massTitle = massInfo.source === 'setup' ? 'Mass for this session (overridden)'
          : massInfo.source === 'vehicle' ? 'Vehicle baseline mass'
          : 'Mass, kg';
        const massInput = renderOverrideNumberInput(massInfo.mass_kg, 'Mass kg', massTitle, (num) => (
          SetupService.setSessionMass(vehicle.id, session.id, num)
        ));
        section.appendChild(el('div', { class: 'session-linked-row' }, [
          el('span', { class: 'session-linked-label', text: label, title: label }),
          massInput,
          el('button', {
            type: 'button', class: 'session-linked-edit', text: '✎',
            'aria-label': 'Edit ' + label, title: 'Edit ' + label,
            onclick: () => openAddVehicleModal(() => { renderPanel(); onChanged(); }, vehicle)
          }),
          el('button', {
            type: 'button', class: 'session-linked-remove', text: '✕',
            'aria-label': 'Unlink ' + label,
            onclick: () => SessionService.removeVehicleFromSession(session.id, vehicle.id)
              .then(() => { renderPanel(); onChanged(); })
          })
        ]));
      });
      return section;
    }

    /**
     * Riders attached to the session, each with their actual weight for THIS session
     * (a per-session override if set, else Rider.weight_kg -- see
     * SessionService.getEffectiveRiderWeight) shown editable, writing the override on
     * change (SessionService.setRiderWeightOverride). A rider can weigh 96kg one day and
     * 99kg the next; the session (not the rider record) is where that day's figure goes.
     */
    function renderRidersSection(session, riders, weights) {
      const header = el('div', { class: 'session-section-header' }, [
        el('div', { class: 'session-section-title', text: 'Riders' })
      ]);
      header.appendChild(el('button', {
        type: 'button', class: 'session-section-add-btn', text: '+ Rider',
        onclick: () => openAddRiderModal((rider) => SessionService.addRiderToSession(session.id, rider.id)
          .then(() => { renderPanel(); onChanged(); }))
      }));
      const section = el('div', { class: 'session-section' }, [header]);
      if (!riders.length) {
        section.appendChild(el('div', { class: 'session-empty', text: 'None.' }));
        return section;
      }
      riders.forEach((rider, i) => {
        const weightInfo = weights[i] || { weight_kg: null, source: null };
        const weightTitle = weightInfo.source === 'override' ? 'Weight for this session (overridden)'
          : weightInfo.source === 'rider' ? 'Rider baseline weight'
          : 'Weight, kg';
        const weightInput = renderOverrideNumberInput(weightInfo.weight_kg, 'Weight kg', weightTitle, (num) => (
          SessionService.setRiderWeightOverride(session.id, rider.id, num)
        ));
        section.appendChild(el('div', { class: 'session-linked-row' }, [
          el('span', { class: 'session-linked-label', text: rider.name, title: rider.name }),
          weightInput,
          el('button', {
            type: 'button', class: 'session-linked-edit', text: '✎',
            'aria-label': 'Edit ' + rider.name, title: 'Edit ' + rider.name,
            onclick: () => openAddRiderModal(() => { renderPanel(); onChanged(); }, rider)
          }),
          el('button', {
            type: 'button', class: 'session-linked-remove', text: '✕',
            'aria-label': 'Unlink ' + rider.name,
            onclick: () => SessionService.removeRiderFromSession(session.id, rider.id)
              .then(() => { renderPanel(); onChanged(); })
          })
        ]));
      });
      return section;
    }

    function renderNotesSection(session, notes) {
      const section = el('div', { class: 'session-section' }, [
        el('div', { class: 'session-section-title', text: 'Notes' })
      ]);

      if (!notes.length) {
        section.appendChild(el('div', { class: 'session-empty', text: 'No notes yet.' }));
      }
      notes.forEach((note) => {
        if (editingNoteIds.has(note.id)) {
          section.appendChild(renderNoteEditForm(note));
          return;
        }
        const header = el('div', { class: 'session-note-header' }, [
          el('span', { class: 'session-note-type', text: note.type }),
          el('span', { class: 'session-note-time', text: formatLocal(note.timestamp) }),
          el('button', {
            type: 'button', class: 'session-note-edit', text: '✎',
            'aria-label': 'Edit note', title: 'Edit note',
            onclick: () => { editingNoteIds.add(note.id); renderPanel(); }
          }),
          el('button', {
            type: 'button', class: 'session-note-remove', text: '✕',
            'aria-label': 'Delete note',
            onclick: () => {
              if (!window.confirm('Delete this note?')) return;
              NoteService.deleteNote(note.id).then(() => { renderPanel(); onChanged(); });
            }
          })
        ]);
        const row = el('div', { class: 'session-note' }, [
          header,
          el('div', { class: 'session-note-content', text: note.content })
        ]);
        if (note.location) {
          row.appendChild(el('div', { class: 'session-note-view-location', text: describeLocation(note.location) }));
        }
        if (note.tags && note.tags.length) {
          row.appendChild(el('div', { class: 'session-note-tags', text: note.tags.join(' · ') }));
        }
        const noteThumbs = renderNoteMediaThumbnails(note.media, panelThumbnailUrls);
        if (noteThumbs) row.appendChild(noteThumbs);
        // A note can span sessions; show the others so it is clear this is shared.
        const otherSessions = (note.session_ids || []).filter((id) => id !== session.id);
        if (otherSessions.length) {
          row.appendChild(el('div', {
            class: 'session-note-shared',
            text: 'Also linked to ' + otherSessions.length + ' other session'
              + (otherSessions.length === 1 ? '' : 's')
          }));
        }
        section.appendChild(row);
      });

      section.appendChild(renderNoteComposer(session));
      return section;
    }

    // Inline replacement for a note's read-only display while it's being edited (see
    // editingNoteIds). Deliberately does not touch the note's location or media -- just
    // the fields a correction typically needs: type, content, tags.
    function renderNoteEditForm(note) {
      const typeSelect = el('select', { class: 'session-note-type-select', 'aria-label': 'Note type' }, [
        option('pre', 'Pre', note.type === 'pre'),
        option('during', 'During', note.type === 'during'),
        option('post', 'Post', note.type === 'post')
      ]);
      const contentInput = el('textarea', {
        class: 'session-note-input', rows: 2, value: note.content || ''
      });
      const tagsInput = el('input', {
        type: 'text', class: 'session-note-tags-input', placeholder: 'Tags',
        value: (note.tags || []).join(', ')
      });
      const statusEl = el('div', { class: 'session-modal-status' });

      const cancel = () => { editingNoteIds.delete(note.id); renderPanel(); };
      const saveBtn = el('button', {
        type: 'button', class: 'session-note-save-btn',
        onclick: () => {
          NoteService.updateNote(note.id, {
            type: typeSelect.value,
            content: contentInput.value.trim(),
            tags: parseTagInput(tagsInput.value)
          }).then(() => {
            editingNoteIds.delete(note.id);
            renderPanel();
            onChanged();
          }).catch((err) => {
            statusEl.textContent = err && err.message ? err.message : 'Could not save the note.';
            statusEl.classList.add('is-error');
          });
        }
      }, ['Save']);

      return el('div', { class: 'session-note session-note-editing' }, [
        el('div', { class: 'session-note-composer-row' }, [typeSelect]),
        contentInput,
        el('div', { class: 'session-note-composer-row' }, [tagsInput]),
        renderNoteMediaThumbnails(note.media, panelThumbnailUrls),
        statusEl,
        el('div', { class: 'session-note-composer-row' }, [
          saveBtn,
          el('button', { type: 'button', class: 'session-note-cancel-btn', text: 'Cancel', onclick: cancel })
        ])
      ]);
    }

    function renderNoteComposer(session) {
      const defaultType = defaultNoteTypeForSession(session);
      const typeSelect = el('select', { class: 'session-note-type-select', 'aria-label': 'Note type' }, [
        option('pre', 'Pre', defaultType === 'pre'),
        option('during', 'During', defaultType === 'during'),
        option('post', 'Post', defaultType === 'post')
      ]);
      const authorSelect = el('select', { class: 'session-note-author-select', 'aria-label': 'Note author' });
      const contentInput = el('textarea', {
        class: 'session-note-input', rows: 2, placeholder: 'Add a note…'
      });
      const tagsInput = el('input', { type: 'text', class: 'session-note-tags-input', placeholder: 'Tags' });
      const mediaStatus = el('span', { class: 'session-note-media-status' });
      const mediaThumbs = el('div', { class: 'session-note-media-thumbs' });
      const fileInput = el('input', { type: 'file', accept: 'image/*', hidden: true });

      // A location captured by "Pin on Graph"/"Pin on Map" (see beginNoteAtLocation)
      // waits here until this composer saves or the chip is dismissed. Captured once at
      // render time so clearing it doesn't require rebuilding the whole composer.
      let noteLocation = pendingNoteLocation;
      pendingNoteLocation = null;
      const locationChip = noteLocation
        ? el('div', { class: 'session-note-location-chip' }, [
          el('span', { class: 'session-note-location-text', text: describeLocation(noteLocation) }),
          el('button', {
            type: 'button', class: 'session-note-location-clear', text: '✕',
            'aria-label': 'Remove pinned location',
            onclick: () => { noteLocation = null; locationChip.remove(); }
          })
        ])
        : null;

      // Media picked before the note exists is held here and attached on save.
      let pendingMedia = [];

      function noteMediaPicked(blob, filename) {
        return MediaService.saveMediaBlob(blob, filename, blob.type).then((entry) => {
          pendingMedia.push({ id: entry.id, type: 'photo', filename: entry.filename, mimeType: entry.mimeType });
          mediaStatus.textContent = pendingMedia.length
            + (pendingMedia.length === 1 ? ' photo attached' : ' photos attached');
          // Straight from the local blob (not MediaService.getMediaUrl) since it's
          // already in hand -- no need for the extra IndexedDB round trip. Tracked in
          // panelThumbnailUrls so it's revoked the same way as any other panel
          // thumbnail, the next time renderPanel() rebuilds (e.g. right after Save).
          const url = URL.createObjectURL(blob);
          panelThumbnailUrls.push(url);
          mediaThumbs.appendChild(el('img', {
            class: 'session-note-media-thumb', src: url, alt: filename || 'Photo',
            onclick: () => window.open(url, '_blank')
          }));
        });
      }

      fileInput.addEventListener('change', () => {
        const picked = fileInput.files && fileInput.files[0];
        fileInput.value = '';
        if (picked) noteMediaPicked(picked, picked.name);
      });

      // Camera is only touched on this explicit click, and a denial falls straight
      // through to the file picker rather than dead-ending.
      const takePhotoBtn = buildIconButton({
        class: 'session-note-photo-btn', title: 'Take Photo', 'aria-label': 'Take Photo',
        onclick: () => {
          mediaStatus.textContent = 'Requesting camera…';
          MediaService.requestCamera().then((result) => {
            if (!result.ok) {
              mediaStatus.textContent = result.reason === 'denied'
                ? 'Camera blocked — pick a file instead.'
                : 'No camera available — pick a file instead.';
              fileInput.click();
              return null;
            }
            return captureFromStream(result.stream).then((blob) => {
              MediaService.stopCamera(result.stream);
              if (blob) return noteMediaPicked(blob, 'capture.png');
              mediaStatus.textContent = 'Capture cancelled.';
              return null;
            });
          });
        }
      }, CAMERA_ICON_SVG);

      // The SAME note glyph used for the pinned-note markers on the map and the graph
      // (see sessions-model.js's NOTE_ICON_SVG), not a separate emoji, so all three read
      // as the one concept. Model.NOTE_ICON_SVG is a static, developer-authored constant
      // -- never user input -- so innerHTML is safe here specifically.
      const saveIcon = document.createElement('span');
      saveIcon.className = 'session-note-save-icon';
      saveIcon.setAttribute('aria-hidden', 'true');
      saveIcon.innerHTML = Model.NOTE_ICON_SVG;

      // The primary call to action: bigger, filled, with an icon, so it reads as "the
      // button that does the thing" next to the smaller outline photo buttons below.
      const saveBtn = el('button', {
        type: 'button', class: 'session-note-save-btn',
        onclick: () => {
          const content = String(contentInput.value || '').trim();
          if (!content && !pendingMedia.length && !noteLocation) return;
          NoteService.createNote({
            session_ids: [session.id],
            author_id: authorSelect.value || undefined,
            type: typeSelect.value,
            content,
            tags: parseTagInput(tagsInput.value),
            media: pendingMedia,
            location: noteLocation || undefined
          }).then(() => {
            pendingMedia = [];
            renderPanel();
            onChanged();
          });
        }
      }, [saveIcon, ' Add Note']);

      // Pin-a-location toggles live right where the note is actually written, not up in
      // the panel's toolbar -- arm one, then click a point on the graph or the map, and
      // this same composer re-renders with the location chip below filled in.
      const pinRow = el('div', { class: 'sessions-pin-row' }, [
        el('button', {
          type: 'button',
          class: 'sessions-pin-btn' + (armedPickKind === 'plot' ? ' is-armed' : ''),
          text: '📍 Pin on Graph',
          title: 'Click a point on the graph to attach a note to it',
          onclick: () => toggleLocationPick('plot')
        }),
        el('button', {
          type: 'button',
          class: 'sessions-pin-btn' + (armedPickKind === 'map' ? ' is-armed' : ''),
          text: '📍 Pin on Map',
          title: 'Click a point on the track map to attach a note to it',
          onclick: () => toggleLocationPick('map')
        })
      ]);

      const composerChildren = [
        el('div', { class: 'session-note-composer-row' }, [typeSelect, authorSelect]),
        pinRow
      ];
      if (armedPickKind) {
        composerChildren.push(el('div', {
          class: 'sessions-pin-hint',
          text: 'Click a point on the ' + (armedPickKind === 'plot' ? 'graph' : 'map') + '… (click the button again to cancel)'
        }));
      }
      if (locationChip) composerChildren.push(locationChip);
      composerChildren.push(
        contentInput,
        el('div', { class: 'session-note-composer-row' }, [tagsInput]),
        // Media attachment is a secondary, utility action -- kept visually quieter than
        // the Add Note button so the primary action is unambiguous at a glance.
        el('div', { class: 'session-note-composer-row session-note-photo-actions' }, [
          takePhotoBtn,
          buildIconButton({
            class: 'session-note-attach-btn', title: 'Attach Photo', 'aria-label': 'Attach Photo',
            onclick: () => fileInput.click()
          }, PAPERCLIP_ICON_SVG),
          mediaStatus
        ]),
        mediaThumbs,
        el('div', { class: 'session-note-composer-row session-note-save-row' }, [saveBtn]),
        fileInput
      );
      const composer = el('div', { class: 'session-note-composer' }, composerChildren);

      // Author list: default to the current local user, but allow picking another.
      Promise.all([UserService.listUsers({ sortBy: 'name' }), UserService.ensureLocalUser()])
        .then((results) => {
          const users = results[0] || [];
          const current = results[1];
          authorSelect.innerHTML = '';
          users.forEach((u) => authorSelect.appendChild(
            option(u.id, u.name, current && u.id === current.id)
          ));
          if (!users.length && current) authorSelect.appendChild(option(current.id, current.name, true));
        })
        .catch(() => null);

      return composer;
    }

    // Shows a live preview and resolves with a PNG blob when the user clicks Capture,
    // or null if they cancel. Built on demand so no camera markup exists until used.
    // `container` defaults to document.body, but the caller can pass a specific element
    // instead -- needed when the browser's real Fullscreen API is active elsewhere (e.g.
    // app.js's full-screen map), since only the fullscreened element's OWN subtree is
    // ever painted; anything appended to document.body would silently not render at all
    // until fullscreen exits, not just sit behind it z-index-wise.
    function captureFromStream(stream, container) {
      return new Promise((resolve) => {
        const video = el('video', { class: 'session-capture-video', autoplay: true, playsInline: true, muted: true });
        video.srcObject = stream;

        // Streams opened here by the Switch button (the caller only knows about the one it
        // passed in, and stops that itself) -- stopped on close so no camera stays lit.
        let currentStream = stream;
        // Start from what the browser actually gave us (the rear camera was only requested
        // as a preference), so the first Switch press really does change camera.
        const firstTrack = stream && stream.getVideoTracks && stream.getVideoTracks()[0];
        const startFacing = firstTrack && firstTrack.getSettings ? firstTrack.getSettings().facingMode : null;
        let usingRear = startFacing !== 'user';
        let settled = false;
        function finish(value) {
          if (settled) return;
          settled = true;
          if (currentStream !== stream) MediaService.stopCamera(currentStream);
          overlay.remove();
          resolve(value);
        }

        // Only offered when the device actually reports more than one camera (device
        // labels/lists are only populated once permission has been granted, which it
        // has by the time this preview exists).
        const switchBtn = buildIconButton({
          class: 'session-capture-switch', title: 'Switch camera', 'aria-label': 'Switch camera', hidden: true,
          onclick: () => {
            usingRear = !usingRear;
            MediaService.requestCamera({
              video: { facingMode: { exact: usingRear ? 'environment' : 'user' } }
            }).then((result) => {
              if (!result.ok) { usingRear = !usingRear; return; }
              if (currentStream !== stream) MediaService.stopCamera(currentStream);
              else MediaService.stopCamera(stream);
              currentStream = result.stream;
              video.srcObject = result.stream;
            });
          }
        }, Model && Model.SWITCH_CAMERA_ICON_SVG);
        if (navigator.mediaDevices && typeof navigator.mediaDevices.enumerateDevices === 'function') {
          navigator.mediaDevices.enumerateDevices().then((devices) => {
            if (devices.filter((d) => d.kind === 'videoinput').length > 1) switchBtn.hidden = false;
          }).catch(() => {});
        }

        const captureBtn = buildIconButton({
          class: 'session-capture-btn', title: 'Take photo', 'aria-label': 'Take photo',
          onclick: () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            if (canvas.toBlob) canvas.toBlob((blob) => finish(blob), 'image/png');
            else finish(null);
          }
        }, Model && Model.SHUTTER_ICON_SVG);

        const cancelBtn = buildIconButton({
          class: 'session-capture-cancel', title: 'Cancel', 'aria-label': 'Cancel',
          onclick: () => finish(null)
        }, Model && Model.CLOSE_ICON_SVG);

        // Switch on the left, shutter centred, cancel on the right -- the familiar camera
        // layout, all icon-only so nothing wraps on a narrow phone screen.
        const overlay = el('div', { class: 'session-capture-overlay' }, [
          el('div', { class: 'session-capture-dialog' }, [
            video,
            el('div', { class: 'session-capture-actions' }, [switchBtn, captureBtn, cancelBtn])
          ])
        ]);
        const target = container || document.body;
        // When hosted inside the fullscreened map element (a Leaflet map container),
        // clicks/drags on this overlay must not fall through to Leaflet's own drag/zoom
        // handling underneath -- same reasoning as app.js's FAB and note card.
        if (target !== document.body && typeof L !== 'undefined' && L.DomEvent) {
          L.DomEvent.disableClickPropagation(overlay);
          L.DomEvent.disableScrollPropagation(overlay);
        }
        target.appendChild(overlay);
      });
    }

    return {
      openAddToSession,
      renderPanel,
      closeModal,
      beginNoteAtLocation,
      quickCreateNoteAtLocation,
      viewNote,
      notifyPickCancelled,
      captureFromStream,
      getSelectedSessionId: () => selectedSessionId,
      setSelectedSessionId: (id) => { selectedSessionId = id; }
    };
  }

  let instance = null;

  const api = {
    /** Called once by app.js after the services exist. */
    init(options) {
      instance = createUI(options);
      return instance;
    },
    openAddToSession(files) {
      return instance ? instance.openAddToSession(files) : Promise.resolve(null);
    },
    renderPanel() {
      return instance ? instance.renderPanel() : Promise.resolve();
    },
    // Called by app.js once the user clicks a point on the plot/map while "Pin on
    // Graph"/"Pin on Map" is armed. See sessions-model.js's NoteLocation typedef.
    beginNoteAtLocation(location) {
      return instance ? instance.beginNoteAtLocation(location) : Promise.resolve(null);
    },
    // Called by app.js's full-screen map FAB flow: creates the note directly (no panel
    // composer involved) once a location has been picked and the floating card's text
    // has been entered. Rejects if there's no session to attach it to.
    quickCreateNoteAtLocation(location, content, media) {
      return instance
        ? instance.quickCreateNoteAtLocation(location, content, media)
        : Promise.reject(new Error('Sessions are not ready yet.'));
    },
    // Opens a small read-only viewer for a note, reachable from a map marker click.
    viewNote(noteId) {
      return instance ? instance.viewNote(noteId) : Promise.resolve(null);
    },
    // Called by app.js when an armed pick could not be completed (e.g. the click missed
    // every plotted trace, or the map isn't in GPS mode).
    notifyPickCancelled(kind, message) {
      if (instance) instance.notifyPickCancelled(kind, message);
    },
    // Shared camera-capture overlay (video preview + Capture/Cancel), reused by app.js's
    // full-screen map note card so it doesn't need its own copy of that flow. `container`
    // lets a caller in a real browser-fullscreen context (see app.js) host the overlay
    // inside the fullscreened element itself, since content outside it isn't painted.
    captureFromStream(stream, container) {
      return instance ? instance.captureFromStream(stream, container) : Promise.resolve(null);
    },
    getInstance: () => instance,
    // Exposed for tests.
    _internals: { formatLocal, describeVehicle, parseTagInput }
  };

  if (typeof window !== 'undefined') window.SessionsUI = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
