// Preload script for secure context bridge
// This file runs before the renderer process loads
// It has access to Node.js APIs but runs in the context of the web page

const { contextBridge, ipcRenderer } = require('electron');

// Expose embedded server API to renderer process
contextBridge.exposeInMainWorld('embeddedServer', {
    start: (port) => ipcRenderer.invoke('server:start', port),
    stop: () => ipcRenderer.invoke('server:stop'),
    getStatus: () => ipcRenderer.invoke('server:status'),
    getNetworkInfo: () => ipcRenderer.invoke('server:networkInfo'),
    updateState: (stations, vehicles) => ipcRenderer.invoke('server:updateState', stations, vehicles),
    updateStation: (station) => ipcRenderer.invoke('server:updateStation', station),
    deleteStation: (stationId) => ipcRenderer.invoke('server:deleteStation', stationId),
    updateVehicle: (vehicle) => ipcRenderer.invoke('server:updateVehicle', vehicle),
    deleteVehicle: (vehicleId) => ipcRenderer.invoke('server:deleteVehicle', vehicleId),
    updateVehiclePosition: (vehicleId, position, deploymentInfo) => ipcRenderer.invoke('server:updateVehiclePosition', vehicleId, position, deploymentInfo)
});

// Expose proxy API to renderer process
contextBridge.exposeInMainWorld('proxyAPI', {
    getSettings: () => ipcRenderer.invoke('proxy:getSettings'),
    saveSettings: (settings) => ipcRenderer.invoke('proxy:saveSettings', settings)
});

window.addEventListener('DOMContentLoaded', () => {
    console.log('FW Lagekarte loaded successfully');
});
