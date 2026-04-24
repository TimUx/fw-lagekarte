const { spawnSync } = require('child_process');

const isLinux = process.platform === 'linux';
const command = isLinux ? 'xvfb-run' : 'npx';
const args = isLinux ? ['-a', 'npx', 'playwright', 'test'] : ['playwright', 'test'];

const result = spawnSync(command, args, { stdio: 'inherit' });
process.exit(result.status ?? 1);
