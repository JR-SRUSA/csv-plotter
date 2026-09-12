// Cross-platform replacement for `cp -r ./dist/. ./docs`, which npm on Windows can't run
// (npm scripts execute via cmd.exe there, not a POSIX shell) -- fs.cpSync works everywhere
// Node does.
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const docsDir = path.join(rootDir, 'docs');

fs.cpSync(distDir, docsDir, { recursive: true });
console.log(`Copied ${distDir} -> ${docsDir}`);
