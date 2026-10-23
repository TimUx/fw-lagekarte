const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { resolveVersion, prepareVersion } = require('../../scripts/release-version');
const asar = require('@electron/asar');
const { verifyRelease, verifyEmbeddedVersion } = require('../../scripts/verify-release');

describe('release version selection', () => {
  it.each(['0.2.4', '1.2.3-beta.1', '1.2.3-alpha', '0.0.0', '1.2.3-rc.0'])(
    'uses the tag as embedded version: %s',
    version => {
      expect(resolveVersion({ tag: `v${version}`, fallback: '0.2.1' })).toBe(version);
    },
  );

  it.each(['main', 'v1', 'v1.2', 'v01.2.3', 'v1.2.3-01', 'v1.2.3+build', 'v1.2.3\n', 'v1.2.3/evil'])(
    'rejects malformed release tag %j',
    tag => {
      expect(() => resolveVersion({ tag, fallback: '0.2.1' })).toThrow();
    },
  );

  it('uses an explicit manual version or the manifest for PR builds', () => {
    expect(resolveVersion({ selected: '0.2.4', fallback: '0.2.1' })).toBe('0.2.4');
    expect(resolveVersion({ fallback: '0.2.4' })).toBe('0.2.4');
    expect(() => resolveVersion({ selected: 'main', fallback: '0.2.1' })).toThrow();
    expect(() => resolveVersion({ tag: 'v0.2.4', selected: '0.2.3' })).toThrow();
  });

  it('updates package and both lockfile versions, preserving dependencies', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lagekarte-version-test-'));
    try {
      fs.writeFileSync(path.join(directory, 'package.json'), JSON.stringify({
        version: '0.2.1', dependencies: { leaflet: '^1.9.4' },
      }));
      fs.writeFileSync(path.join(directory, 'package-lock.json'), JSON.stringify({
        version: '0.2.1', packages: { '': { version: '0.2.1' }, dependency: { version: '9.8.7' } },
      }));
      expect(prepareVersion(directory, { tag: 'v0.2.4' })).toBe('0.2.4');
      const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'package.json')));
      const lock = JSON.parse(fs.readFileSync(path.join(directory, 'package-lock.json')));
      expect(manifest.version).toBe('0.2.4');
      expect(lock.version).toBe('0.2.4');
      expect(lock.packages[''].version).toBe('0.2.4');
      expect(manifest.dependencies).toEqual({ leaflet: '^1.9.4' });
      expect(lock.packages.dependency.version).toBe('9.8.7');
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });
});

describe('release artifact gates', () => {
  let directory;
  beforeEach(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lagekarte-artifact-test-'));
  });
  afterEach(() => fs.rmSync(directory, { recursive: true, force: true }));

  it('rejects a release with missing installers', () => {
    expect(() => verifyRelease(directory, '0.2.4')).toThrow('Expected exactly one .deb');
  });

  it('rejects duplicate installers', () => {
    fs.writeFileSync(path.join(directory, 'one.deb'), '');
    fs.writeFileSync(path.join(directory, 'two.deb'), '');
    expect(() => verifyRelease(directory, '0.2.4')).toThrow('Expected exactly one .deb');
  });

  it('rejects an old filename before inspecting its payload', () => {
    fs.writeFileSync(path.join(directory, 'fw-lagekarte_0.2.1_amd64.deb'), '');
    expect(() => verifyRelease(directory, '0.2.4')).toThrow('Wrong filename');
  });

  it('rejects a renamed old payload and accepts the actual embedded version', async () => {
    const source = path.join(directory, 'source');
    fs.mkdirSync(source);
    fs.writeFileSync(path.join(source, 'package.json'), JSON.stringify({ version: '0.2.1' }));
    const archive = path.join(directory, 'app-0.2.4.asar');
    await asar.createPackage(source, archive);
    expect(() => verifyEmbeddedVersion(archive, '0.2.4')).toThrow('Embedded app version');
    expect(() => verifyEmbeddedVersion(archive, '0.2.1')).not.toThrow();
  });
});
