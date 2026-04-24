const WebSocket = require('ws');
const { loadBrowserScript } = require('../helpers/load-browser-script');

function createLocalForageMock(initial = {}) {
  const db = new Map(Object.entries(initial));
  return {
    INDEXEDDB: 'indexeddb',
    config: () => {},
    async getItem(key) {
      return db.has(key) ? structuredClone(db.get(key)) : null;
    },
    async setItem(key, value) {
      db.set(key, structuredClone(value));
      return value;
    },
  };
}

describe('Sync + Storage integration', () => {
  let embeddedCalls;
  let localforage;
  let context;
  let storageContext;

  beforeEach(() => {
    embeddedCalls = [];
    localforage = createLocalForageMock({
      syncConfig: {
        mode: 'server',
        serverUrl: '',
        serverPort: 19000,
        authToken: 'test-token',
        clientId: 'client_1',
      },
      stations: [],
      vehicles: [],
    });

    context = loadBrowserScript('sync.js', {
      localforage,
      window: {
        embeddedServer: {
          startWithAuth: async () => ({ success: true, port: 19000, wsUrl: 'ws://127.0.0.1:19000' }),
          stop: async () => ({ success: true }),
          updateState: async () => ({ success: true }),
          updateStation: (station) => embeddedCalls.push(['station', station]),
          deleteStation: (id) => embeddedCalls.push(['station_delete', id]),
          updateVehicle: (vehicle) => embeddedCalls.push(['vehicle', vehicle]),
          deleteVehicle: (id) => embeddedCalls.push(['vehicle_delete', id]),
          updateVehiclePosition: (id, position, info) =>
            embeddedCalls.push(['vehicle_position', { id, position, info }]),
          getStatus: async () => ({ port: 19000, clientCount: 0, wsUrl: 'ws://127.0.0.1:19000', httpUrl: 'http://127.0.0.1:19000' }),
          getNetworkInfo: async () => [],
        },
      },
      document: { getElementById: () => null },
      WebSocket,
      setInterval,
      clearInterval,
      URL,
      Storage: {
        getStations: async () => [],
        getVehicles: async () => [],
      },
      structuredClone,
    }, ['Sync']);

    storageContext = loadBrowserScript('storage.js', {
      localforage,
      Sync: context.__exports.Sync,
      structuredClone,
    }, ['Storage']);
  });

  it('forwards storage station changes to embedded server in server mode', async () => {
    context.__exports.Sync.mode = 'server';

    const station = await storageContext.__exports.Storage.saveStation({
      id: 'station_test',
      name: 'Feuerwache Integration',
      lat: 10,
      lng: 10,
    });

    expect(station.id).toBe('station_test');
    expect(embeddedCalls.some(([type]) => type === 'station')).toBe(true);
  });

  it('appends token in client mode connection URL builder', () => {
    const url = context.__exports.Sync.buildAuthenticatedServerUrl('ws://127.0.0.1:8080', 'abc123');
    expect(url).toContain('token=abc123');
  });
});
