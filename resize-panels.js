// Drag-to-resize panel handles — desktop only (min-width: 981px).
// Self-contained: injects its own CSS, no coupling to app internals.
// Dispatches window 'resize' on drag-end so Plotly/Leaflet redraw.
(function () {
  'use strict';

  var mq = window.matchMedia('(min-width: 981px)');
  var ready = false;

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

  function makeDrag(el, cursor, onStart, onMove) {
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
      }
      document.addEventListener('mousemove', mv);
      document.addEventListener('mouseup', up);
    });
  }

  function init() {
    if (ready) return;

    var controls = document.querySelector('.controls');
    var plotSec  = document.querySelector('section.plot');
    var plotDiv  = document.getElementById('plotDiv');
    var mapsEl   = document.querySelector('.maps-container');
    if (!controls || !plotSec || !plotDiv || !mapsEl) return;

    ready = true;
    injectStyles();

    // 1. Sidebar width — drag right edge of .controls
    controls.style.position = 'relative';
    var sw = document.createElement('div');
    sw.className = 'rs-h rs-col';
    controls.appendChild(sw);
    makeDrag(sw, 'col-resize',
      function () { return controls.getBoundingClientRect().width; },
      function (dx, _, w0) { controls.style.width = clamp(w0 + dx, 200, 600) + 'px'; }
    );

    // 2. Plot/Maps column split — insert a drag handle between the two grid cells
    var gapDiv = document.createElement('div');
    gapDiv.className = 'rs-gap';
    gapDiv.style.cssText = 'grid-area:resizer;width:8px;min-width:8px';
    plotSec.insertBefore(gapDiv, mapsEl);

    function setMapsCols(w) {
      plotSec.style.gridTemplateColumns = 'minmax(0,1fr) 8px ' + w + 'px';
      plotSec.style.gridTemplateAreas   = '"plot resizer maps"';
      plotSec.style.columnGap           = '0';
    }
    setMapsCols(Math.round(mapsEl.getBoundingClientRect().width) || 280);

    makeDrag(gapDiv, 'col-resize',
      function () { return Math.round(mapsEl.getBoundingClientRect().width); },
      function (dx, _, w0) { setMapsCols(clamp(w0 - dx, 180, 700)); }
    );

    // 3. Plot height — drag bottom edge of #plotDiv
    plotDiv.style.position = 'relative';
    var ph = document.createElement('div');
    ph.className = 'rs-h rs-row';
    plotDiv.appendChild(ph);
    makeDrag(ph, 'row-resize',
      function () { return plotDiv.getBoundingClientRect().height; },
      function (_, dy, h0) { plotDiv.style.height = Math.max(200, h0 + dy) + 'px'; }
    );
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
