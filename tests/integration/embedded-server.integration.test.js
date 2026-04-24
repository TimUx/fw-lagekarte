const WebSocket = require('ws');

const server = require('../../embedded-server');

function waitForOpen(ws) {
  return new Promise((resolve, reject) => {
    ws.once('open', resolve);
    ws.once('error', reject);
  });
}

function waitForMessage(ws) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Timed out waiting for message')), 5000);
    ws.once('message', (msg) => {
      clearTimeout(timeout);
      resolve(JSON.parse(msg.toString()));
    });
    ws.once('error', reject);
    ws.once('close', () => clearTimeout(timeout));
  });
}

describe('Embedded server integration', () => {
  const port = 18990;

  beforeEach(async () => {
    await server.stop();
  });

  afterEach(async () => {
    await server.stop();
  });

  it('accepts authenticated clients and rejects clients without token', async () => {
    await server.start(port, 'secret-token');

    const closeCode = await new Promise((resolve) => {
      const unauthorized = new WebSocket(`ws://127.0.0.1:${port}`);
      unauthorized.once('close', (code) => resolve(code));
    });
    expect(closeCode).toBe(1008);

    const authorized = new WebSocket(`ws://127.0.0.1:${port}?token=secret-token`);
    await waitForOpen(authorized);
    authorized.send(JSON.stringify({ type: 'sync_request' }));
    const initial = await waitForMessage(authorized);
    expect(initial.type).toBe('sync_data');
    authorized.close();
  });

  it('broadcasts incremental updates to other connected clients', async () => {
    await server.start(port, 'sync-token');

    const sender = new WebSocket(`ws://127.0.0.1:${port}?token=sync-token`);
    const receiver = new WebSocket(`ws://127.0.0.1:${port}?token=sync-token`);
    await waitForOpen(sender);
    await waitForOpen(receiver);

    sender.send(
      JSON.stringify({
        type: 'station_update',
        station: { id: 's1', name: 'Feuerwache Test', lat: 1, lng: 1 },
      }),
    );

    const msg = await waitForMessage(receiver);
    expect(msg.type).toBe('station_update');
    expect(msg.station.name).toBe('Feuerwache Test');

    sender.close();
    receiver.close();
  });
});
