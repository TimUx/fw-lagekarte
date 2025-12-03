// Storage module using LocalForage for persistent storage
const Storage = {
    // Initialize storage
    init: async function() {
        localforage.config({
            driver: localforage.INDEXEDDB,
            name: 'fw-lagekarte',
            version: 1.0,
            storeName: 'fw_data'
        });
    },

    // Stations
    getStations: async function() {
        const stations = await localforage.getItem('stations');
        return stations || [];
    },

    saveStation: async function(station) {
        const stations = await this.getStations();
        
        if (station.id) {
            // Update existing
            const index = stations.findIndex(s => s.id === station.id);
            if (index !== -1) {
                stations[index] = station;
            }
        } else {
            // Add new
            station.id = 'station_' + Date.now();
            stations.push(station);
        }
        
        await localforage.setItem('stations', stations);
        return station;
    },

    deleteStation: async function(stationId) {
        const stations = await this.getStations();
        const filtered = stations.filter(s => s.id !== stationId);
        await localforage.setItem('stations', filtered);
    },

    // Vehicles
    getVehicles: async function() {
        const vehicles = await localforage.getItem('vehicles');
        return vehicles || [];
    },

    saveVehicle: async function(vehicle) {
        const vehicles = await this.getVehicles();
        
        if (vehicle.id) {
            // Update existing
            const index = vehicles.findIndex(v => v.id === vehicle.id);
            if (index !== -1) {
                vehicles[index] = vehicle;
            }
        } else {
            // Add new
            vehicle.id = 'vehicle_' + Date.now();
            vehicles.push(vehicle);
        }
        
        await localforage.setItem('vehicles', vehicles);
        return vehicle;
    },

    deleteVehicle: async function(vehicleId) {
        const vehicles = await this.getVehicles();
        const filtered = vehicles.filter(v => v.id !== vehicleId);
        await localforage.setItem('vehicles', filtered);
    },

    updateVehiclePosition: async function(vehicleId, position) {
        const vehicles = await this.getVehicles();
        const vehicle = vehicles.find(v => v.id === vehicleId);
        
        if (vehicle) {
            vehicle.position = position;
            vehicle.deployed = !!position;
            await localforage.setItem('vehicles', vehicles);
        }
        
        return vehicle;
    },

    // Map View
    getMapView: async function() {
        const mapView = await localforage.getItem('mapView');
        return mapView || {
            center: [51.1657, 10.4515], // Germany center
            zoom: 6
        };
    },

    saveMapView: async function(center, zoom) {
        const mapView = { center, zoom };
        await localforage.setItem('mapView', mapView);
        return mapView;
    }
};

// Initialize storage on load
Storage.init();
