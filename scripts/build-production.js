const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { execSync } = require('child_process');

const gzipOnly = process.argv.includes('--gzip-only');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function resetDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
  ensureDir(dirPath);
}

function minifyFile(inputFile, outputFile) {
  execSync(`npx terser ${inputFile} -c -m -o ${outputFile}`, { stdio: 'inherit' });
}

function writeMaybeCompressed(filePath, content, compressedOnly) {
  if (compressedOnly) {
    fs.writeFileSync(`${filePath}.gz`, zlib.gzipSync(content, { level: 9 }));
    return;
  }

  fs.writeFileSync(filePath, content);
  fs.writeFileSync(`${filePath}.gz`, zlib.gzipSync(content, { level: 9 }));
}

try {
  const rootDir = path.join(__dirname, '..');
  const buildDir = path.join(rootDir, 'build');
  const distDir = path.join(rootDir, 'dist');
  const appSource = path.join(rootDir, 'app.js');
  const processorSource = path.join(rootDir, 'file-processors.js');
  const appMinified = path.join(buildDir, 'app.min.js');
  const bundleSource = path.join(buildDir, 'gpbikes-plotter.bundle.js');
  const bundleMinified = path.join(buildDir, 'gpbikes-plotter.bundle.min.js');
  const bundleFile = path.join(distDir, 'gpbikes-plotter.bundle.min.js');
  const gzipFile = `${bundleFile}.gz`;
  const distHtml = path.join(distDir, 'index.html');
  const distCss = path.join(distDir, 'style.css');
  const distChannelMap = path.join(distDir, 'channel-map.json');
  const sourceChannelMap = path.join(rootDir, 'channel-map.json');
  const plotlySource = require.resolve('plotly.js-basic-dist');
  const papaSource = require.resolve('papaparse/papaparse.min.js');

  ensureDir(buildDir);
  resetDir(distDir);

  minifyFile(appSource, appMinified);

  const bundleParts = [
    fs.readFileSync(plotlySource, 'utf8'),
    fs.readFileSync(papaSource, 'utf8'),
    fs.readFileSync(processorSource, 'utf8'),
    fs.readFileSync(appMinified, 'utf8')
  ];

  fs.writeFileSync(bundleSource, `${bundleParts.join('\n;\n')}\n`);
  minifyFile(bundleSource, bundleMinified);
  writeMaybeCompressed(bundleFile, fs.readFileSync(bundleMinified), gzipOnly);

  const sourceHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  const productionHtml = sourceHtml
    .replace(/\s*<!-- <script src="https:\/\/cdn\.plot\.ly\/plotly-2\.20\.0\.min\.js"><\/script> -->\n?/g, '\n')
    .replace(/\s*<script src="lib\/plotly-custom\.min\.js"><\/script>\n?/g, '\n')
    .replace(/\s*<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/papaparse@5\.4\.1\/papaparse\.min\.js"><\/script>\n?/g, '\n')
    .replace(/\s*<script src="file-processors\.js"><\/script>\n?/g, '\n')
    .replace('<script src="app.js"></script>', '<script src="gpbikes-plotter.bundle.min.js"></script>');

  writeMaybeCompressed(distHtml, Buffer.from(productionHtml, 'utf8'), gzipOnly);
  writeMaybeCompressed(distCss, fs.readFileSync(path.join(rootDir, 'style.css')), gzipOnly);
  writeMaybeCompressed(distChannelMap, fs.readFileSync(sourceChannelMap), gzipOnly);

  if (gzipOnly) {
    console.log(`Built ${bundleFile}.gz`);
    console.log(`Built ${distHtml}.gz`);
    console.log(`Built ${distCss}.gz`);
    console.log(`Built ${distChannelMap}.gz`);
    console.log('Created gzip-only dist for ESP32-style hosting');
  } else {
    console.log(`Built ${bundleFile}`);
    console.log(`Built ${gzipFile}`);
    console.log(`Built ${distHtml}`);
    console.log(`Built ${distCss}`);
    console.log(`Built ${distChannelMap}`);
  }
} catch (err) {
  console.error('Production build failed:', err.message);
  process.exit(1);
}