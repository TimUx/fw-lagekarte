// Embedded WebSocket + HTTP server for FW Lagekarte
// This module provides an integrated sync server that runs within the Electron app

const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const path = require('path');

class EmbeddedServer {
    constructor() {
        this.app = null;
        this.server = null;
        this.wss = null;
        this.port = 8080;
        this.clients = new Set();
        this.currentState = {
            stations: [],
            vehicles: []
        };
        this.isRunning = false;
    }

    // Start the server
    start(port = 8080) {
        return new Promise((resolve, reject) => {
            if (this.isRunning) {
                resolve({ success: true, message: 'Server is already running', port: this.port });
                return;
            }

            this.port = port;

            try {
                // Create Express app for HTTP server
                this.app = express();
                this.server = http.createServer(this.app);

                // Create WebSocket server on the same HTTP server
                this.wss = new WebSocket.Server({ server: this.server });

                // Serve static files from the app directory
                this.app.use(express.static(__dirname));

                // Serve readonly viewer at root
                this.app.get('/', (req, res) => {
                    res.sendFile(path.join(__dirname, 'readonly-viewer.html'));
                });

                // Setup WebSocket handlers
                this.setupWebSocketHandlers();

                // Start listening
                this.server.listen(this.port, () => {
                    this.isRunning = true;
                    console.log(`[EmbeddedServer] Server running on http://localhost:${this.port}`);
                    console.log(`[EmbeddedServer] WebSocket endpoint: ws://localhost:${this.port}`);
                    console.log(`[EmbeddedServer] Read-Only Web Viewer: http://localhost:${this.port}`);
                    resolve({ 
                        success: true, 
                        message: `Server started on port ${this.port}`,
                        port: this.port,
                        wsUrl: `ws://localhost:${this.port}`,
                        httpUrl: `http://localhost:${this.port}`
                    });
                });

                this.server.on('error', (error) => {
                    console.error('[EmbeddedServer] Server error:', error);
                    this.isRunning = false;
                    reject({ success: false, message: error.message, error });
                });

            } catch (error) {
                console.error('[EmbeddedServer] Failed to start server:', error);
                reject({ success: false, message: error.message, error });
            }
        });
    }

    // Setup WebSocket connection handlers
    setupWebSocketHandlers() {
        this.wss.on('connection', (ws) => {
            console.log('[EmbeddedServer] New client connected');
            this.clients.add(ws);

            // Send current state to new client
            ws.send(JSON.stringify({
                type: 'sync_data',
                data: this.currentState
            }));

            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message);
                    
                    // Update state based on message type
                    switch (data.type) {
                        case 'station_update':
                            this.updateStation(data.station);
                            break;
                        case 'station_delete':
                            this.deleteStation(data.stationId);
                            break;
                        case 'vehicle_update':
                            this.updateVehicle(data.vehicle);
                            break;
                        case 'vehicle_delete':
                            this.deleteVehicle(data.vehicleId);
                            break;
                        case 'vehicle_position':
                            this.updateVehiclePosition(data.vehicleId, data.position);
                            break;
                        case 'sync_request':
                            // Client requests full sync
                            ws.send(JSON.stringify({
                                type: 'sync_data',
                                data: this.currentState
                            }));
                            return;
                    }

                    // Broadcast to all other clients
                    this.broadcast(data, ws);
                } catch (error) {
                    console.error('[EmbeddedServer] Error processing message:', error);
                }
            });

            ws.on('close', () => {
                console.log('[EmbeddedServer] Client disconnected');
                this.clients.delete(ws);
            });

            ws.on('error', (error) => {
                console.error('[EmbeddedServer] WebSocket error:', error);
                this.clients.delete(ws);
            });
        });
    }

    // Broadcast message to all clients except sender
    broadcast(data, sender) {
        this.clients.forEach((client) => {
            if (client !== sender && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    }

    // Update station in state
    updateStation(station) {
        const index = this.currentState.stations.findIndex(s => s.id === station.id);
        if (index !== -1) {
            this.currentState.stations[index] = station;
        } else {
            this.currentState.stations.push(station);
        }
    }

    // Delete station from state
    deleteStation(stationId) {
        this.currentState.stations = this.currentState.stations.filter(s => s.id !== stationId);
    }

    // Update vehicle in state
    updateVehicle(vehicle) {
        const index = this.currentState.vehicles.findIndex(v => v.id === vehicle.id);
        if (index !== -1) {
            this.currentState.vehicles[index] = vehicle;
        } else {
            this.currentState.vehicles.push(vehicle);
        }
    }

    // Delete vehicle from state
    deleteVehicle(vehicleId) {
        this.currentState.vehicles = this.currentState.vehicles.filter(v => v.id !== vehicleId);
    }

    // Update vehicle position
    updateVehiclePosition(vehicleId, position) {
        const vehicle = this.currentState.vehicles.find(v => v.id === vehicleId);
        if (vehicle) {
            vehicle.position = position;
            vehicle.deployed = !!position;
        }
    }

    // Update server state from local data
    updateState(stations, vehicles) {
        this.currentState = {
            stations: stations || [],
            vehicles: vehicles || []
        };
        
        // Broadcast updated state to all connected clients
        this.broadcast({
            type: 'sync_data',
            data: this.currentState
        }, null);
    }

    // Stop the server
    stop() {
        return new Promise((resolve) => {
            if (!this.isRunning) {
                resolve({ success: true, message: 'Server is not running' });
                return;
            }

            console.log('[EmbeddedServer] Stopping server...');

            // Close all WebSocket connections
            this.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.close();
                }
            });
            this.clients.clear();

            // Close WebSocket server
            if (this.wss) {
                this.wss.close(() => {
                    console.log('[EmbeddedServer] WebSocket server closed');
                });
            }

            // Close HTTP server
            if (this.server) {
                this.server.close(() => {
                    console.log('[EmbeddedServer] HTTP server closed');
                    this.isRunning = false;
                    this.app = null;
                    this.server = null;
                    this.wss = null;
                    resolve({ success: true, message: 'Server stopped successfully' });
                });
            } else {
                this.isRunning = false;
                resolve({ success: true, message: 'Server stopped successfully' });
            }
        });
    }

    // Get server status
    getStatus() {
        return {
            isRunning: this.isRunning,
            port: this.port,
            clientCount: this.clients.size,
            wsUrl: this.isRunning ? `ws://localhost:${this.port}` : null,
            httpUrl: this.isRunning ? `http://localhost:${this.port}` : null
        };
    }

    // Get network interfaces for displaying local IPs
    getNetworkInfo() {
        const os = require('os');
        const interfaces = os.networkInterfaces();
        const addresses = [];

        for (const name of Object.keys(interfaces)) {
            for (const iface of interfaces[name]) {
                // Skip internal and non-IPv4 addresses
                if (iface.family === 'IPv4' && !iface.internal) {
                    addresses.push({
                        name: name,
                        address: iface.address,
                        wsUrl: `ws://${iface.address}:${this.port}`,
                        httpUrl: `http://${iface.address}:${this.port}`
                    });
                }
            }
        }

        return addresses;
    }
}

// Export singleton instance
module.exports = new EmbeddedServer();
