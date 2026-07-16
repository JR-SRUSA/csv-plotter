// Drag-to-resize panel handles — desktop only (min-width: 981px).
// Self-contained: injects its own CSS, no coupling to app internals except the
// window.__csvPlotterSetMapVisible(visible) hook app.js calls synchronously when
// it toggles the "no-map-column" class (see note by setMapVisible below).
// Dispatches window 'resize' on drag-end so Plotly/Leaflet redraw.
(function () {
  'use strict';

  var STORAGE_KEY = 'csv-plotter-panel-sizes';
  var mq = window.matchMedia('(min-width: 981px)');
  var ready = false;
  var savedMapsWidth = null;

  // Populated once init() runs.
  var plotSec = null;
  var mapsEl = null;
  var gapDiv = null;

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  function injectStyles() {
    var s = document.createElement('style');
    s.textContent =
      '.rs-h{position:absolute;z-index:300;user-select:none;-webkit-user-select:none;touch-action:none;transition:background 80ms}' +
      '.rs-h:hover,.rs-h.rs-dragging{background:rgba(99,143,232,.2)}' +
      '.rs-col{top:0;bottom:0;width:8px;cursor:col-resize;right:-4px}' +
      '.rs-row{left:0;right:0;height:8px;cursor:row-resize;bottom:-4px}' +
      '.rs-gap{cursor:col-resize;align-self:stretch;position:relative;z-index:100;transition:background 80ms}' +
      '.rs-gap:hover,.rs-gap.rs-dragging{background:rgba(99,143,232,.2)}';
    document.head.appendChild(s);
  }

  function makeDrag(el, cursor, onStart, onMove, onEnd) {
    el.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return;
      e.preventDefault();
      var x0 = e.clientX, y0 = e.clientY;
      var state = onStart();
      el.classList.add('rs-dragging');
      document.body.style.cursor = cursor;

      function mv(e) { onMove(e.clientX - x0, e.clientY - y0, state); }
      function up() {
        document.removeEventListener('mousemove', mv);
        document.removeEventListener('mouseup', up);
        el.classList.remove('rs-dragging');
        document.body.style.cursor = '';
        window.dispatchEvent(new Event('resize'));
        if (onEnd) onEnd();
      }
      document.addEventListener('mousemove', mv);
      document.addEventListener('mouseup', up);
    });
  }

  function setMapsCols(w) {
    plotSec.style.gridTemplateColumns = 'minmax(0,1fr) 8px ' + w + 'px';
    plotSec.style.gridTemplateAreas   = '"plot resizer maps"';
    plotSec.style.columnGap           = '0';
  }

  // Exposed so app.js can call it synchronously, in the same tick it toggles the
  // "no-map-column" class. This MUST be synchronous (not a MutationObserver reacting
  // to the class change): app.js measures/creates the Leaflet map right after toggling
  // visibility, and if the grid columns haven't been restored yet at that moment,
  // Leaflet bakes in a wrong container size (map overlaps the plot, wrong zoom level),
  // which persists until another manual resize.
  function setMapVisible(visible) {
    if (!ready) return;
    if (!visible) {
      // Capture the current (pre-hide) width so we can restore it later — but only if
      // the map column is actually currently showing, otherwise we'd overwrite the
      // saved width with 0/garbage from an already-collapsed layout.
      if (gapDiv.style.display !== 'none') {
        var w = Math.round(mapsEl.getBoundingClientRect().width);
        if (w) savedMapsWidth = w;
      }
      gapDiv.style.display = 'none';
      plotSec.style.gridTemplateColumns = 'minmax(0,1fr)';
      plotSec.style.gridTemplateAreas = '"plot"';
    } else {
      gapDiv.style.display = '';
      setMapsCols(savedMapsWidth || 280);
    }
  }
  window.__csvPlotterSetMapVisible = setMapVisible;

  function init() {
    if (ready) return;

    var controls = document.querySelector('.controls');
    var plotDiv  = document.getElementById('plotDiv');
    plotSec = document.querySelector('section.plot');
    mapsEl  = document.querySelector('.maps-container');
    if (!controls || !plotSec || !plotDiv || !mapsEl) { plotSec = null; mapsEl = null; return; }

    ready = true;
    injectStyles();

    function saveSizes() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          sidebarWidth: parseInt(controls.style.width) || null,
          mapsWidth: Math.round(mapsEl.getBoundingClientRect().width) || null,
          plotHeight: parseInt(plotDiv.style.height) || null
        }));
      } catch (e) {}
    }

    // 1. Sidebar width — drag right edge of .controls
    controls.style.position = 'relative';
    var sw = document.createElement('div');
    sw.className = 'rs-h rs-col';
    controls.appendChild(sw);
    makeDrag(sw, 'col-resize',
      function () { return controls.getBoundingClientRect().width; },
      function (dx, _, w0) { controls.style.width = clamp(w0 + dx, 200, 600) + 'px'; },
      saveSizes
    );

    // 2. Plot/Maps column split — insert a drag handle between the two grid cells
    gapDiv = document.createElement('div');
    gapDiv.className = 'rs-gap';
    gapDiv.style.cssText = 'grid-area:resizer;width:8px;min-width:8px';
    plotSec.insertBefore(gapDiv, mapsEl);

    setMapsCols(Math.round(mapsEl.getBoundingClientRect().width) || 280);

    makeDrag(gapDiv, 'col-resize',
      function () { return Math.round(mapsEl.getBoundingClientRect().width); },
      function (dx, _, w0) {
        setMapsCols(clamp(w0 - dx, 180, 700));
        savedMapsWidth = Math.round(mapsEl.getBoundingClientRect().width) || savedMapsWidth;
      },
      saveSizes
    );

    // 3. Plot height — drag bottom edge of #plotDiv
    plotDiv.style.position = 'relative';
    var ph = document.createElement('div');
    ph.className = 'rs-h rs-row';
    plotDiv.appendChild(ph);
    makeDrag(ph, 'row-resize',
      function () { return plotDiv.getBoundingClientRect().height; },
      function (_, dy, h0) { plotDiv.style.height = Math.max(200, h0 + dy) + 'px'; },
      saveSizes
    );

    // Restore saved sizes
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var sizes = JSON.parse(raw);
        if (sizes.sidebarWidth) controls.style.width = sizes.sidebarWidth + 'px';
        if (sizes.mapsWidth) setMapsCols(sizes.mapsWidth);
        if (sizes.plotHeight) plotDiv.style.height = sizes.plotHeight + 'px';
      }
    } catch (e) {}
    savedMapsWidth = Math.round(mapsEl.getBoundingClientRect().width) || 280;

    // Sync to whatever visibility state app.js already applied to .plot before we
    // finished initializing (e.g. map hidden by default before this script's
    // DOMContentLoaded handler ran).
    setMapVisible(!plotSec.classList.contains('no-map-column'));
  }

  function teardown() {
    // Clear inline dimension overrides so mobile CSS takes back control.
    // The inserted DOM nodes and grid-area styles are harmless on mobile
    // because the media query switches .plot to display:flex there.
    var controls = document.querySelector('.controls');
    if (controls) controls.style.width = '';
    var plotDiv = document.getElementById('plotDiv');
    if (plotDiv) plotDiv.style.height = '';
  }

  mq.addEventListener('change', function (e) {
    if (e.matches) init(); else teardown();
  });

  if (mq.matches) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }
}());
