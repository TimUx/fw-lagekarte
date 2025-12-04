// Network synchronization module for multi-user support
// This module provides real-time synchronization of stations and vehicles across multiple clients

const Sync = {
    ws: null,
    mode: 'standalone', // 'standalone', 'server', 'client'
    serverUrl: '',
    serverPort: 8080,
    reconnectInterval: null,
    reconnectDelay: 5000,
    isConnecting: false,
    listeners: [],
    localServer: null,

    // Initialize sync module
    init: async function() {
        const config = await this.getConfig();
        this.mode = config.mode || 'standalone';
        this.serverUrl = config.serverUrl || '';
        this.serverPort = config.serverPort || 8080;
        
        if (this.mode === 'client' && this.serverUrl) {
            this.connect();
        } else if (this.mode === 'server') {
            // Start embedded server
            await this.startEmbeddedServer();
        }
    },

    // Get sync configuration from storage
    getConfig: async function() {
        const config = await localforage.getItem('syncConfig');
        return config || {
            mode: 'standalone',
            serverUrl: '',
            serverPort: 8080,
            clientId: this.generateClientId()
        };
    },

    // Save sync configuration
    saveConfig: async function(config) {
        await localforage.setItem('syncConfig', config);
        this.mode = config.mode;
        this.serverUrl = config.serverUrl;
        this.serverPort = config.serverPort;
        
        // Disconnect existing connection
        this.disconnect();
        
        // Stop embedded server if it was running
        if (window.embeddedServer) {
            await this.stopEmbeddedServer();
        }
        
        // Connect based on mode
        if (this.mode === 'client' && this.serverUrl) {
            this.connect();
        } else if (this.mode === 'server') {
            await this.startEmbeddedServer();
        }
    },

    // Discover servers in LAN
    discoverServers: async function(callback) {
        // This is a simplified discovery mechanism
        // In a real implementation, you would use mDNS/Bonjour or broadcast UDP packets
        
        const commonPorts = [8080, 8081, 8082, 3000, 3001];
        const discovered = [];
        
        // Get local IP range (simplified)
        const baseIP = '192.168.1.'; // This should be detected from network interface
        
        callback('Suche nach Servern im LAN...', false);
        
        // Try common IPs in the network
        for (let i = 1; i <= 254; i++) {
            for (const port of commonPorts) {
                const url = `ws://${baseIP}${i}:${port}`;
                
                try {
                    // Try to connect with short timeout
                    const testWs = new WebSocket(url);
                    
                    await new Promise((resolve, reject) => {
                        const timeout = setTimeout(() => {
                            testWs.close();
                            resolve();
                        }, 100); // Very short timeout for discovery
                        
                        testWs.onopen = () => {
                            clearTimeout(timeout);
                            discovered.push(url);
                            testWs.close();
                            callback(`Server gefunden: ${url}`, false);
                            resolve();
                        };
                        
                        testWs.onerror = () => {
                            clearTimeout(timeout);
                            resolve();
                        };
                    });
                } catch (e) {
                    // Ignore errors during discovery
                }
            }
        }
        
        if (discovered.length > 0) {
            callback(`${discovered.length} Server gefunden!`, true, discovered);
        } else {
            callback('Kein Server im LAN gefunden. Bitte URL manuell eingeben.', true, []);
        }
        
        return discovered;
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
        // Set flag to prevent re-broadcasting received updates
        this._isReceivingUpdate = true;
        
        try {
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
                    await Storage.updateVehiclePosition(message.vehicleId, message.position, message.deploymentInfo);
                    this.notifyListeners('vehicle_position', { vehicleId: message.vehicleId, position: message.position, deploymentInfo: message.deploymentInfo });
                    break;
                
                default:
                    console.log('[Sync] Unknown message type:', message.type);
            }
        } finally {
            this._isReceivingUpdate = false;
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

    // Helper to send broadcast if enabled and not receiving
    _broadcast: function(message) {
        if (this.mode === 'standalone' || this._isReceivingUpdate) return false;
        
        if (this.mode === 'client' && !this.serverUrl) return false;
        
        if (this.mode === 'server') {
            // In server mode, we need to sync the state periodically
            // The embedded server will handle broadcasting to clients
            // We'll sync state after a short delay to batch updates
            clearTimeout(this._serverSyncTimeout);
            this._serverSyncTimeout = setTimeout(() => {
                this.syncServerState();
            }, 250); // Batch updates for 250ms to reduce sync calls
            return true;
        }
        
        return this.send(message);
    },

    // Broadcast station update
    broadcastStationUpdate: function(station) {
        this._broadcast({
            type: 'station_update',
            station: station,
            timestamp: Date.now()
        });
    },

    // Broadcast station deletion
    broadcastStationDelete: function(stationId) {
        this._broadcast({
            type: 'station_delete',
            stationId: stationId,
            timestamp: Date.now()
        });
    },

    // Broadcast vehicle update
    broadcastVehicleUpdate: function(vehicle) {
        this._broadcast({
            type: 'vehicle_update',
            vehicle: vehicle,
            timestamp: Date.now()
        });
    },

    // Broadcast vehicle deletion
    broadcastVehicleDelete: function(vehicleId) {
        this._broadcast({
            type: 'vehicle_delete',
            vehicleId: vehicleId,
            timestamp: Date.now()
        });
    },

    // Broadcast vehicle position update
    broadcastVehiclePosition: function(vehicleId, position, deploymentInfo = null) {
        this._broadcast({
            type: 'vehicle_position',
            vehicleId: vehicleId,
            position: position,
            deploymentInfo: deploymentInfo,
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
                'error': '🔴 Verbindungsfehler',
                'server-mode': '🟢 Server-Modus aktiv',
                'standalone': '⚫ Standalone-Modus'
            };
            
            statusElement.textContent = statusTexts[status] || '⚫ Unbekannt';
        }
    },

    // Start reconnect timer
    startReconnectTimer: function() {
        if (this.mode !== 'client' || !this.serverUrl) return;
        
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

    // Start embedded server (server mode)
    startEmbeddedServer: async function() {
        if (!window.embeddedServer) {
            console.error('[Sync] Embedded server API not available');
            this.updateConnectionStatus('error');
            return;
        }

        try {
            console.log('[Sync] Starting embedded server on port', this.serverPort);
            const result = await window.embeddedServer.start(this.serverPort);
            
            if (result.success) {
                console.log('[Sync] Embedded server started:', result);
                this.updateConnectionStatus('server-mode');
                
                // Update server state with current data
                await this.syncServerState();
                
                // Show server info to user
                this.showServerInfo(result);
            } else {
                console.error('[Sync] Failed to start embedded server:', result.message);
                this.updateConnectionStatus('error');
            }
        } catch (error) {
            console.error('[Sync] Error starting embedded server:', error);
            this.updateConnectionStatus('error');
        }
    },

    // Stop embedded server
    stopEmbeddedServer: async function() {
        if (!window.embeddedServer) {
            return;
        }

        try {
            const result = await window.embeddedServer.stop();
            console.log('[Sync] Embedded server stopped:', result);
            this.updateConnectionStatus('standalone');
            this._serverInfo = null;
        } catch (error) {
            console.error('[Sync] Error stopping embedded server:', error);
        }
    },

    // Sync current local state to embedded server
    syncServerState: async function() {
        if (!window.embeddedServer || this.mode !== 'server') {
            return;
        }

        try {
            const stations = await Storage.getStations();
            const vehicles = await Storage.getVehicles();
            await window.embeddedServer.updateState(stations, vehicles);
            console.log('[Sync] Server state synchronized');
        } catch (error) {
            console.error('[Sync] Error syncing server state:', error);
        }
    },

    // Show server connection info to user
    showServerInfo: async function(serverResult) {
        if (!window.embeddedServer) {
            return;
        }

        try {
            // Get fresh server status
            const serverStatus = await window.embeddedServer.getStatus();
            const networkInfo = await window.embeddedServer.getNetworkInfo();
            
            // Use provided result or current status
            const port = serverResult ? serverResult.port : serverStatus.port;
            const wsUrl = serverResult ? serverResult.wsUrl : serverStatus.wsUrl;
            const httpUrl = serverResult ? serverResult.httpUrl : serverStatus.httpUrl;
            
            let infoHtml = `<div style="padding: 10px; background: #e7f5ff; border-radius: 5px; margin-top: 5px; font-size: 13px; line-height: 1.6;">`;
            infoHtml += `<strong>🟢 Server läuft auf Port ${port}</strong><br>`;
            infoHtml += `<strong>Verbundene Clients:</strong> ${serverStatus.clientCount}<br><br>`;
            infoHtml += `<strong>Lokale Verbindungen:</strong><br>`;
            infoHtml += `• WebSocket: <code>${wsUrl}</code><br>`;
            infoHtml += `• Web Viewer: <code>${httpUrl}</code><br>`;
            
            if (networkInfo && networkInfo.length > 0) {
                infoHtml += `<br><strong>Netzwerk-Adressen (andere Geräte):</strong><br>`;
                networkInfo.forEach(info => {
                    infoHtml += `<strong>${info.name} (${info.address}):</strong><br>`;
                    infoHtml += `• WS: <code>${info.wsUrl}</code><br>`;
                    infoHtml += `• HTTP: <code>${info.httpUrl}</code><br>`;
                });
            }
            
            infoHtml += `</div>`;
            
            // Store info for display in modal
            this._serverInfo = infoHtml;
            
            // Note: Status refresh is handled by the renderer.js modal interval
            // to avoid redundant updates
            
        } catch (error) {
            console.error('[Sync] Error getting server info:', error);
        }
    },

    // Get connection status
    getStatus: function() {
        if (this.mode === 'standalone') return 'standalone';
        if (this.mode === 'server') return 'server-mode';
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
