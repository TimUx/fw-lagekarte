const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { verifyDownloads } = require('../../scripts/verify-downloads');

describe('release download identity', () => {
  let directory;
  let originals;
  let downloads;
  const names = ['Lagekarte Setup 0.2.4.exe', 'Lagekarte-0.2.4.AppImage', 'Lagekarte-0.2.4-arm64.dmg', 'fw-lagekarte_0.2.4_amd64.deb'];

  beforeEach(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lagekarte-downloads-'));
    originals = path.join(directory, 'originals');
    downloads = path.join(directory, 'downloads');
    fs.mkdirSync(originals);
    fs.mkdirSync(downloads);
    for (const name of names) {
      fs.writeFileSync(path.join(originals, name), name);
      fs.writeFileSync(path.join(downloads, name.replace(/ /g, '.')), name);
    }
  });
  afterEach(() => fs.rmSync(directory, { recursive: true, force: true }));

  it('maps the actual GitHub-normalized NSIS name and verifies every hash', () => {
    const results = verifyDownloads(originals, downloads);
    expect(results).toHaveLength(4);
    expect(results.find(result => result.asset.endsWith('.exe'))).toMatchObject({
      original: 'Lagekarte Setup 0.2.4.exe',
      asset: 'Lagekarte.Setup.0.2.4.exe',
      sha256: expect.stringMatching(/^[0-9a-f]{64}$/),
    });
  });

  it('rejects a modified download', () => {
    fs.writeFileSync(path.join(downloads, 'Lagekarte.Setup.0.2.4.exe'), 'modified');
    expect(() => verifyDownloads(originals, downloads)).toThrow('SHA256 mismatch');
  });

  it('rejects missing or additional downloads', () => {
    fs.rmSync(path.join(downloads, 'Lagekarte.Setup.0.2.4.exe'));
    expect(() => verifyDownloads(originals, downloads)).toThrow('exactly four downloaded');
    fs.writeFileSync(path.join(downloads, 'wrong.exe'), '');
    expect(() => verifyDownloads(originals, downloads)).toThrow('Download names do not match');
    fs.writeFileSync(path.join(downloads, 'extra.exe'), '');
    expect(() => verifyDownloads(originals, downloads)).toThrow('exactly four downloaded');
  });

  it('rejects ambiguous normalized source names', () => {
    fs.renameSync(path.join(originals, names[1]), path.join(originals, 'Lagekarte.Setup.0.2.4.exe'));
    expect(() => verifyDownloads(originals, downloads)).toThrow('Ambiguous normalized');
  });
});
