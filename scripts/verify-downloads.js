const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

function filesUnder(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    assert.ok(!entry.isSymbolicLink(), `Unexpected symlink: ${file}`);
    return entry.isDirectory() ? filesUnder(file) : [file];
  });
}

function sha256(file) {
  return createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function verifyDownloads(originalDirectory, downloadDirectory) {
  const originals = filesUnder(originalDirectory);
  const downloads = filesUnder(downloadDirectory);
  assert.equal(originals.length, 4, 'Expected exactly four original installers');
  assert.equal(downloads.length, 4, 'Expected exactly four downloaded installers');
  const assetName = file => path.basename(file).replace(/ /g, '.');
  const names = originals.map(assetName);
  assert.equal(new Set(names).size, 4, 'Ambiguous normalized original filenames');
  const actualNames = downloads.map(file => path.basename(file));
  assert.equal(new Set(actualNames).size, 4, 'Duplicate downloaded filenames');
  assert.deepEqual([...actualNames].sort(), [...names].sort(), 'Download names do not match original installers');
  return originals.map(original => {
    const name = assetName(original);
    const download = downloads.find(file => path.basename(file) === name);
    const digest = sha256(original);
    assert.equal(sha256(download), digest, `SHA256 mismatch: ${name}`);
    assert.ok(fs.readFileSync(original).equals(fs.readFileSync(download)), `Byte mismatch: ${name}`);
    console.log(`Verified download ${name}: SHA256 ${digest}`);
    return { original: path.basename(original), asset: name, sha256: digest };
  });
}

if (require.main === module) {
  assert.ok(process.argv[2] && process.argv[3], 'Usage: verify-downloads <originals> <downloads>');
  verifyDownloads(process.argv[2], process.argv[3]);
}

module.exports = { verifyDownloads };
