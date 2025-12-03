// Network synchronization module for multi-user support
// This module provides real-time synchronization of stations and vehicles across multiple clients

const Sync = {
    ws: null,
    enabled: false,
    serverUrl: '',
    reconnectInterval: null,
    reconnectDelay: 5000,
    isConnecting: false,
    listeners: [],

    // Initialize sync module
    init: async function() {
        const config = await this.getConfig();
        this.enabled = config.enabled || false;
        this.serverUrl = config.serverUrl || '';
        
        if (this.enabled && this.serverUrl) {
            this.connect();
        }
    },

    // Get sync configuration from storage
    getConfig: async function() {
        const config = await localforage.getItem('syncConfig');
        return config || {
            enabled: false,
            serverUrl: '',
            clientId: this.generateClientId()
        };
    },

    // Save sync configuration
    saveConfig: async function(config) {
        await localforage.setItem('syncConfig', config);
        this.enabled = config.enabled;
        this.serverUrl = config.serverUrl;
        
        if (this.enabled && this.serverUrl) {
            this.connect();
        } else {
            this.disconnect();
        }
    },

    // Generate unique client ID
    generateClientId: function() {
        return 'client_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
    },

    // Connect to WebSocket server
    connect: function() {
        if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
            return;
        }

        this.isConnecting = true;
        this.updateConnectionStatus('connecting');

        try {
            this.ws = new WebSocket(this.serverUrl);

            this.ws.onopen = () => {
                console.log('[Sync] Connected to server');
                this.isConnecting = false;
                this.updateConnectionStatus('connected');
                this.stopReconnectTimer();
                
                // Request initial sync
                this.send({
                    type: 'sync_request',
                    timestamp: Date.now()
                });
            };

            this.ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    this.handleMessage(message);
                } catch (error) {
                    console.error('[Sync] Failed to parse message:', error);
                }
            };

            this.ws.onerror = (error) => {
                console.error('[Sync] WebSocket error:', error);
                this.isConnecting = false;
            };

            this.ws.onclose = () => {
                console.log('[Sync] Disconnected from server');
                this.isConnecting = false;
                this.updateConnectionStatus('disconnected');
                this.startReconnectTimer();
            };
        } catch (error) {
            console.error('[Sync] Failed to connect:', error);
            this.isConnecting = false;
            this.updateConnectionStatus('error');
            this.startReconnectTimer();
        }
    },

    // Disconnect from server
    disconnect: function() {
        this.stopReconnectTimer();
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.updateConnectionStatus('disconnected');
    },

    // Send message to server
    send: function(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
            return true;
        }
        return false;
    },

    // Handle incoming messages
    handleMessage: async function(message) {
        switch (message.type) {
            case 'sync_data':
                // Full data sync from server
                await this.applySyncData(message.data);
                break;
            
            case 'station_update':
                // Single station update
                await Storage.saveStation(message.station);
                this.notifyListeners('station_update', message.station);
                break;
            
            case 'station_delete':
                // Station deletion
                await Storage.deleteStation(message.stationId);
                this.notifyListeners('station_delete', message.stationId);
                break;
            
            case 'vehicle_update':
                // Single vehicle update
                await Storage.saveVehicle(message.vehicle);
                this.notifyListeners('vehicle_update', message.vehicle);
                break;
            
            case 'vehicle_delete':
                // Vehicle deletion
                await Storage.deleteVehicle(message.vehicleId);
                this.notifyListeners('vehicle_delete', message.vehicleId);
                break;
            
            case 'vehicle_position':
                // Vehicle position update
                await Storage.updateVehiclePosition(message.vehicleId, message.position);
                this.notifyListeners('vehicle_position', { vehicleId: message.vehicleId, position: message.position });
                break;
            
            default:
                console.log('[Sync] Unknown message type:', message.type);
        }
    },

    // Apply full sync data
    applySyncData: async function(data) {
        if (data.stations) {
            for (const station of data.stations) {
                await Storage.saveStation(station);
            }
        }
        if (data.vehicles) {
            for (const vehicle of data.vehicles) {
                await Storage.saveVehicle(vehicle);
            }
        }
        this.notifyListeners('full_sync', data);
    },

    // Broadcast station update
    broadcastStationUpdate: function(station) {
        if (!this.enabled) return;
        this.send({
            type: 'station_update',
            station: station,
            timestamp: Date.now()
        });
    },

    // Broadcast station deletion
    broadcastStationDelete: function(stationId) {
        if (!this.enabled) return;
        this.send({
            type: 'station_delete',
            stationId: stationId,
            timestamp: Date.now()
        });
    },

    // Broadcast vehicle update
    broadcastVehicleUpdate: function(vehicle) {
        if (!this.enabled) return;
        this.send({
            type: 'vehicle_update',
            vehicle: vehicle,
            timestamp: Date.now()
        });
    },

    // Broadcast vehicle deletion
    broadcastVehicleDelete: function(vehicleId) {
        if (!this.enabled) return;
        this.send({
            type: 'vehicle_delete',
            vehicleId: vehicleId,
            timestamp: Date.now()
        });
    },

    // Broadcast vehicle position update
    broadcastVehiclePosition: function(vehicleId, position) {
        if (!this.enabled) return;
        this.send({
            type: 'vehicle_position',
            vehicleId: vehicleId,
            position: position,
            timestamp: Date.now()
        });
    },

    // Add event listener
    addListener: function(callback) {
        this.listeners.push(callback);
    },

    // Remove event listener
    removeListener: function(callback) {
        this.listeners = this.listeners.filter(l => l !== callback);
    },

    // Notify all listeners
    notifyListeners: function(eventType, data) {
        this.listeners.forEach(callback => {
            try {
                callback(eventType, data);
            } catch (error) {
                console.error('[Sync] Error in listener:', error);
            }
        });
    },

    // Update connection status in UI
    updateConnectionStatus: function(status) {
        const statusElement = document.getElementById('syncStatus');
        if (statusElement) {
            statusElement.className = 'sync-status sync-status-' + status;
            
            const statusTexts = {
                'connected': '🟢 Synchronisation aktiv',
                'connecting': '🟡 Verbinde...',
                'disconnected': '⚫ Nicht verbunden',
                'error': '🔴 Verbindungsfehler'
            };
            
            statusElement.textContent = statusTexts[status] || '⚫ Unbekannt';
        }
    },

    // Start reconnect timer
    startReconnectTimer: function() {
        if (!this.enabled || !this.serverUrl) return;
        
        this.stopReconnectTimer();
        this.reconnectInterval = setInterval(() => {
            console.log('[Sync] Attempting to reconnect...');
            this.connect();
        }, this.reconnectDelay);
    },

    // Stop reconnect timer
    stopReconnectTimer: function() {
        if (this.reconnectInterval) {
            clearInterval(this.reconnectInterval);
            this.reconnectInterval = null;
        }
    },

    // Get connection status
    getStatus: function() {
        if (!this.enabled) return 'disabled';
        if (!this.ws) return 'disconnected';
        
        switch (this.ws.readyState) {
            case WebSocket.CONNECTING: return 'connecting';
            case WebSocket.OPEN: return 'connected';
            case WebSocket.CLOSING: return 'disconnecting';
            case WebSocket.CLOSED: return 'disconnected';
            default: return 'unknown';
        }
    }
};

// Initialize sync module when page loads
if (typeof localforage !== 'undefined') {
    Sync.init();
}
