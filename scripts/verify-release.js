const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const asar = require('@electron/asar');
const { validateVersion } = require('./release-version');

function filesUnder(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(file) : [file];
  });
}

function run(command, args) {
  return execFileSync(command, args, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trim();
}

function verifyEmbeddedVersion(archive, version) {
  const embedded = JSON.parse(asar.extractFile(archive, 'package.json').toString());
  assert.equal(embedded.version, version, `Embedded app version in ${archive}`);
}

function verifyRelease(directory, version) {
  validateVersion(version);
  const files = filesUnder(directory);
  const installers = ['.deb', '.AppImage', '.exe', '.dmg'].map(extension => {
    const matches = files.filter(file => file.endsWith(extension));
    assert.equal(matches.length, 1, `Expected exactly one ${extension} installer`);
    assert.ok(path.basename(matches[0]).includes(version), `Wrong filename: ${matches[0]}`);
    return matches[0];
  });

  for (const installer of installers) {
    const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'lagekarte-release-'));
    try {
      const extracted = path.join(temporary, 'extracted');
      if (installer.endsWith('.deb')) {
        assert.equal(run('dpkg-deb', ['-f', installer, 'Version']), version, 'DEB control version');
        run('dpkg-deb', ['-x', installer, extracted]);
      } else {
        run('7z', ['x', '-y', `-o${extracted}`, installer, '-r', '*.asar', '*.7z', 'Info.plist']);
        if (installer.endsWith('.exe')) {
          const payloads = filesUnder(extracted).filter(file => file.endsWith('.7z'));
          assert.equal(payloads.length, 1, 'Expected one NSIS application payload');
          run('7z', ['x', '-y', `-o${extracted}/payload`, payloads[0], '-r', '*.asar']);
        }
      }
      const archives = filesUnder(extracted).filter(file => path.basename(file) === 'app.asar');
      assert.equal(archives.length, 1, `Expected one embedded app.asar in ${installer}`);
      verifyEmbeddedVersion(archives[0], version);
      if (installer.endsWith('.dmg')) {
        const plist = fs.readFileSync(path.resolve(path.dirname(archives[0]), '../Info.plist'), 'utf8');
        const bundleVersion = plist.match(/<key>CFBundleShortVersionString<\/key>\s*<string>([^<]+)<\/string>/);
        assert.equal(bundleVersion?.[1], version, 'macOS bundle version');
      }
      if (installer.endsWith('.exe')) {
        assert.equal(run('exiftool', ['-s3', '-ProductVersion', installer]), version, 'NSIS product version');
      }
      console.log(`Verified ${path.basename(installer)}: embedded version ${version}`);
    } finally {
      fs.rmSync(temporary, { recursive: true, force: true });
    }
  }
}

if (require.main === module) {
  verifyRelease(path.resolve(process.argv[2] || 'artifacts'), process.argv[3] || require('../package.json').version);
}

module.exports = { verifyRelease, verifyEmbeddedVersion };
