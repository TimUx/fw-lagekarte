const stationFixtures = [
  {
    id: 'station_hbf_1',
    name: 'Feuerwache Zentrum',
    address: 'Hauptstrasse 1, 20095 Hamburg',
    lat: 53.5511,
    lng: 9.9937,
  },
  {
    id: 'station_nord_2',
    name: 'Feuerwache Nord',
    address: 'Nordring 7, 22301 Hamburg',
    lat: 53.6123,
    lng: 10.0123,
  },
];

const vehicleFixtures = [
  {
    id: 'vehicle_1',
    callsign: 'Florian HH 1/46/1',
    type: 'HLF',
    crew: '1/8',
    stationId: 'station_hbf_1',
    notes: 'Wasserfuehrend',
    deployed: false,
    position: null,
    deploymentInfo: null,
  },
  {
    id: 'vehicle_2',
    callsign: 'Florian HH 2/11/1',
    type: 'ELW',
    crew: '1/2',
    stationId: 'station_nord_2',
    notes: 'Fuehrungsdienst',
    deployed: true,
    position: { lat: 53.56, lng: 10.01 },
    deploymentInfo: {
      missionNumber: 'E-2026-1001',
      missionKeyword: 'TH VU',
      remarks: '2 PKW beteiligt',
    },
  },
];

module.exports = {
  stationFixtures,
  vehicleFixtures,
};
