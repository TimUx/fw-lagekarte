// Storage module using LocalForage for persistent storage

// Default proxy settings (must match DEFAULT_PROXY_SETTINGS in constants.js)
const DEFAULT_PROXY_SETTINGS = {
    mode: 'system',
    proxyUrl: '',
    proxyBypassRules: 'localhost,127.0.0.1'
};

const Storage = {
    // Generate unique ID (UUID v4-like)
    generateId: function(prefix) {
        return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
    },

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
            station.id = this.generateId('station');
            stations.push(station);
        }
        
        await localforage.setItem('stations', stations);
        
        // Broadcast to sync if available
        if (typeof Sync !== 'undefined') {
            Sync.broadcastStationUpdate(station);
        }
        
        return station;
    },

    deleteStation: async function(stationId) {
        const stations = await this.getStations();
        const filtered = stations.filter(s => s.id !== stationId);
        await localforage.setItem('stations', filtered);
        
        // Broadcast to sync if available
        if (typeof Sync !== 'undefined') {
            Sync.broadcastStationDelete(stationId);
        }
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
            vehicle.id = this.generateId('vehicle');
            vehicles.push(vehicle);
        }
        
        await localforage.setItem('vehicles', vehicles);
        
        // Broadcast to sync if available
        if (typeof Sync !== 'undefined') {
            Sync.broadcastVehicleUpdate(vehicle);
        }
        
        return vehicle;
    },

    deleteVehicle: async function(vehicleId) {
        const vehicles = await this.getVehicles();
        const filtered = vehicles.filter(v => v.id !== vehicleId);
        await localforage.setItem('vehicles', filtered);
        
        // Broadcast to sync if available
        if (typeof Sync !== 'undefined') {
            Sync.broadcastVehicleDelete(vehicleId);
        }
    },

    updateVehiclePosition: async function(vehicleId, position, deploymentInfo = null) {
        const vehicles = await this.getVehicles();
        const vehicle = vehicles.find(v => v.id === vehicleId);
        
        if (vehicle) {
            vehicle.position = position;
            vehicle.deployed = !!position;
            
            // Update deployment info if provided
            if (deploymentInfo !== null) {
                vehicle.deploymentInfo = deploymentInfo;
            }
            
            // Clear deployment info when recalling vehicle
            if (!position) {
                vehicle.deploymentInfo = null;
            }
            
            await localforage.setItem('vehicles', vehicles);
            
            // Broadcast to sync if available
            if (typeof Sync !== 'undefined') {
                // Broadcast full vehicle update to include deploymentInfo
                Sync.broadcastVehicleUpdate(vehicle);
            }
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
    },

    // Selected Layer
    getSelectedLayer: async function() {
        const layer = await localforage.getItem('selectedLayer');
        return layer || 'OpenStreetMap';
    },

    saveSelectedLayer: async function(layerName) {
        await localforage.setItem('selectedLayer', layerName);
        return layerName;
    },

    // Import data (replaces all existing data)
    importData: async function(data) {
        if (!data.stations || !Array.isArray(data.stations)) {
            throw new Error('Invalid data format: stations must be an array');
        }
        if (!data.vehicles || !Array.isArray(data.vehicles)) {
            throw new Error('Invalid data format: vehicles must be an array');
        }

        await localforage.setItem('stations', data.stations);
        await localforage.setItem('vehicles', data.vehicles);
        
        if (data.mapView) {
            await localforage.setItem('mapView', data.mapView);
        }
        
        return true;
    },

    // Proxy settings
    getProxySettings: async function() {
        const settings = await localforage.getItem('proxySettings');
        return settings || DEFAULT_PROXY_SETTINGS;
    },

    saveProxySettings: async function(settings) {
        await localforage.setItem('proxySettings', settings);
        return settings;
    }
};

// Initialize storage on load
Storage.init();
