const { loadBrowserScript } = require('../helpers/load-browser-script');
const { stationFixtures, vehicleFixtures } = require('../fixtures/entities');

function createLocalForageMock() {
  const db = new Map();
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

describe('Storage module', () => {
  let context;
  let Sync;

  beforeEach(() => {
    Sync = {
      broadcastStationUpdate: () => {},
      broadcastStationDelete: () => {},
      broadcastVehicleUpdate: () => {},
      broadcastVehicleDelete: () => {},
    };

    context = loadBrowserScript('storage.js', {
      localforage: createLocalForageMock(),
      Sync,
      structuredClone,
    }, ['Storage']);
  });

  it('creates and updates stations', async () => {
    const { Storage } = context.__exports;
    const created = await Storage.saveStation({ ...stationFixtures[0], id: null });
    expect(created.id).toMatch(/^station_/);

    created.name = 'Feuerwache Zentrum Neu';
    await Storage.saveStation(created);
    const stations = await Storage.getStations();
    expect(stations).toHaveLength(1);
    expect(stations[0].name).toBe('Feuerwache Zentrum Neu');
  });

  it('creates and updates vehicles with position and deployment state', async () => {
    const { Storage } = context.__exports;
    const vehicle = await Storage.saveVehicle({ ...vehicleFixtures[0], id: null });
    expect(vehicle.id).toMatch(/^vehicle_/);

    await Storage.updateVehiclePosition(vehicle.id, { lat: 1, lng: 2 }, { missionNumber: 'E-1' });
    const all = await Storage.getVehicles();
    expect(all[0].deployed).toBe(true);
    expect(all[0].deploymentInfo.missionNumber).toBe('E-1');

    await Storage.updateVehiclePosition(vehicle.id, null);
    const recalled = await Storage.getVehicles();
    expect(recalled[0].deployed).toBe(false);
    expect(recalled[0].deploymentInfo).toBeNull();
  });

  it('importData validates schema and stores entities', async () => {
    const { Storage } = context.__exports;
    await expect(Storage.importData({ stations: [], vehicles: [] })).resolves.toBe(true);
    await expect(Storage.importData({ stations: 'invalid', vehicles: [] })).rejects.toThrow(
      'stations must be an array',
    );
  });
});
