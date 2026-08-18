const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

try {
  ensureDir('build');
  ensureDir('lib');
  ensureDir(path.join('lib', 'images'));
  // Minify Plotly's browser-ready basic distribution bundle.
  const sourceBundle = require.resolve('plotly.js-basic-dist');
  const tempOutput = path.join('build', 'plotly-custom.min.js');
  const finalOutput = path.join('lib', 'plotly-custom.min.js');
  execSync(`npx terser ${sourceBundle} -c -m -o ${tempOutput}`, { stdio: 'inherit' });
  console.log(`Minified ${sourceBundle} -> ${tempOutput}`);
  fs.copyFileSync(tempOutput, finalOutput);
  console.log(`Copied ${tempOutput} -> ${finalOutput}`);
  console.log('Built lib/plotly-custom.min.js');

  // Copy PapaParse and Leaflet bundles so the app works without CDN access.
  const papaParseSrc = require.resolve('papaparse/papaparse.min.js');
  fs.copyFileSync(papaParseSrc, path.join('lib', 'papaparse.min.js'));
  console.log('Copied papaparse.min.js -> lib/papaparse.min.js');

  const leafletDist = path.dirname(require.resolve('leaflet/dist/leaflet.js'));
  fs.copyFileSync(path.join(leafletDist, 'leaflet.js'), path.join('lib', 'leaflet.min.js'));
  fs.copyFileSync(path.join(leafletDist, 'leaflet.css'), path.join('lib', 'leaflet.min.css'));
  console.log('Copied leaflet -> lib/leaflet.min.{js,css}');
  const leafletImages = path.join(leafletDist, 'images');
  if (fs.existsSync(leafletImages)) {
    fs.readdirSync(leafletImages).forEach(f => {
      fs.copyFileSync(path.join(leafletImages, f), path.join('lib', 'images', f));
    });
    console.log('Copied leaflet/images -> lib/images/');
  }
} catch (err) {
  console.error('Custom build failed:', err.message);
  process.exit(1);
}
