const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

try {
  ensureDir('build');
  ensureDir('lib');
  // Minify Plotly's browser-ready basic distribution bundle.
  const sourceBundle = require.resolve('plotly.js-basic-dist');
  const tempOutput = path.join('build', 'plotly-custom.min.js');
  const finalOutput = path.join('lib', 'plotly-custom.min.js');
  execSync(`npx terser ${sourceBundle} -c -m -o ${tempOutput}`, { stdio: 'inherit' });
  console.log(`Minified ${sourceBundle} -> ${tempOutput}`);
  fs.copyFileSync(tempOutput, finalOutput);
  console.log(`Copied ${tempOutput} -> ${finalOutput}`);
  console.log('Built lib/plotly-custom.min.js');
} catch (err) {
  console.error('Custom build failed:', err.message);
  process.exit(1);
}
