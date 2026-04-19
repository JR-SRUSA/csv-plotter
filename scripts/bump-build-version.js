const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const htmlPath = path.join(rootDir, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

function formatToday() {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function normalizeDate(dateText) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateText)) return dateText;
  if (/^\d{8}$/.test(dateText)) {
    return `${dateText.slice(0, 4)}-${dateText.slice(4, 6)}-${dateText.slice(6, 8)}`;
  }
  return null;
}

function incrementSuffix(suffix) {
  const chars = (suffix || 'a').split('');
  let index = chars.length - 1;

  while (index >= 0 && chars[index] === 'z') {
    chars[index] = 'a';
    index -= 1;
  }

  if (index < 0) {
    chars.unshift('a');
    return chars.join('');
  }

  chars[index] = String.fromCharCode(chars[index].charCodeAt(0) + 1);
  return chars.join('');
}

const versionPattern = /(<div class="controls-version" aria-label="Application version">)Version\s+(\d{4}-\d{2}-\d{2}|\d{8})([a-z]+)(<\/div>)/;
const match = html.match(versionPattern);

if (!match) {
  console.error('Could not find application version tag in index.html');
  process.exit(1);
}

const currentDate = normalizeDate(match[2]);
const today = formatToday();
const nextSuffix = currentDate === today ? incrementSuffix(match[3]) : 'a';
const nextVersion = `Version ${today}${nextSuffix}`;

const updatedHtml = html.replace(versionPattern, `$1${nextVersion}$4`);
fs.writeFileSync(htmlPath, updatedHtml);

console.log(`Updated build version to ${today}${nextSuffix}`);