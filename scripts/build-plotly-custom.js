const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');
try {
  fs.mkdirSync('build', { recursive: true });
  // Create a minimal entry that registers only scatter-type traces (adjust as needed)
  const entry = `
var Plotly = require('plotly.js/lib/core');
// register traces you need (scatter is typical for lines/markers)
Plotly.register(require('plotly.js/lib/traces/scatter'));
// Uncomment and add other traces you need, e.g.:
// Plotly.register(require('plotly.js/lib/traces/box'));
// Plotly.register(require('plotly.js/lib/traces/bar'));
module.exports = Plotly;
`;
  fs.writeFileSync(path.join('build', 'custom-plotly.js'), entry);

  // Bundle and minify to plotter/lib
  fs.mkdirSync(path.join('plotter','lib'), { recursive: true });
  console.log('Bundling custom Plotly (this may take a moment)...');
  // Browserify the custom entry and pipe through terser to minify
  execSync('npx browserify build/custom-plotly.js -s Plotly | npx terser -c -m -o plotter/lib/plotly-custom.min.js', { stdio: 'inherit' });
  console.log('Built plotter/lib/plotly-custom.min.js');
} catch (err) {
  console.error('Custom build failed:', err.message);
  process.exit(1);
}
