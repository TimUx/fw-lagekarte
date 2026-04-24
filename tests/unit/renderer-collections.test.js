const { JSDOM } = require('jsdom');
const { loadBrowserScript } = require('../helpers/load-browser-script');

describe('RendererCollections', () => {
  let helpers;

  beforeEach(() => {
    const dom = new JSDOM('<!doctype html><html><body></body></html>');
    const context = loadBrowserScript('renderer/collections.js', {
      window: dom.window,
      document: dom.window.document,
    });
    helpers = context.window.RendererCollections;
  });

  it('sortByLocale sorts by german locale case-insensitive', () => {
    const items = [{ name: 'zeta' }, { name: 'Ähre' }, { name: 'alpha' }];
    const sorted = helpers.sortByLocale(items, (item) => item.name);
    expect(sorted.map((v) => v.name)).toEqual(['Ähre', 'alpha', 'zeta']);
  });

  it('splitVehiclesByDeployment separates deployed and available', () => {
    const input = [{ id: 1, deployed: false }, { id: 2, deployed: true }];
    const result = helpers.splitVehiclesByDeployment(input);
    expect(result.deployed).toHaveLength(1);
    expect(result.available).toHaveLength(1);
    expect(result.deployed[0].id).toBe(2);
  });

  it('groupAvailableVehiclesByStation groups by station and unassigned', () => {
    const result = helpers.groupAvailableVehiclesByStation([
      { id: 'v1', stationId: 's1' },
      { id: 'v2', stationId: 's1' },
      { id: 'v3', stationId: null },
    ]);

    expect(result.byStation.s1).toHaveLength(2);
    expect(result.unassigned).toHaveLength(1);
    expect(result.unassigned[0].id).toBe('v3');
  });
});
