const fs = require('fs');
const path = require('path');
try {
  const src = require.resolve('plotly.js-basic-dist/dist/plotly-basic.min.js');
  const destDir = path.join(__dirname, '..', 'plotter', 'lib');
  fs.mkdirSync(destDir, { recursive: true });
  const dest = path.join(destDir, 'plotly-basic.min.js');
  fs.copyFileSync(src, dest);
  console.log('Copied', src, '->', dest);
} catch (err) {
  console.error('Failed to copy plotly-basic. Did npm install succeed?', err.message);
  process.exit(1);
}
