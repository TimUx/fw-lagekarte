const fs = require('node:fs');
const path = require('node:path');

function validateVersion(version) {
  const number = '(0|[1-9][0-9]*)';
  const identifier = '(?:0|[1-9][0-9]*|[0-9]*[a-zA-Z-][0-9a-zA-Z-]*)';
  const pattern = new RegExp(`^${number}\\.${number}\\.${number}(?:-${identifier}(?:\\.${identifier})*)?$`);
  if (typeof version !== 'string' || version.trim() !== version || !pattern.test(version)) {
    throw new Error(`Invalid release version: ${version}`);
  }
  return version;
}

function resolveVersion({ tag, selected, fallback }) {
  if (tag && !tag.startsWith('v')) {
    throw new Error(`Invalid release tag: ${tag}`);
  }
  const version = validateVersion(tag ? tag.slice(1) : selected || fallback);
  if (tag && selected && version !== selected) {
    throw new Error(`Tag ${tag} does not match selected version ${selected}`);
  }
  return version;
}

function prepareVersion(directory, options) {
  const packagePath = path.join(directory, 'package.json');
  const lockPath = path.join(directory, 'package-lock.json');
  const manifest = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
  const version = resolveVersion({ ...options, fallback: manifest.version });
  manifest.version = version;
  lock.version = version;
  lock.packages[''].version = version;
  fs.writeFileSync(packagePath, `${JSON.stringify(manifest, null, 2)}\n`);
  fs.writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
  return version;
}

if (require.main === module) {
  const version = prepareVersion(process.cwd(), {
    tag: process.env.RELEASE_TAG,
    selected: process.env.BUILD_VERSION,
  });
  console.log(`Building embedded package version ${version}`);
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `version=${version}\n`);
  }
}

module.exports = { validateVersion, resolveVersion, prepareVersion };
