// Preload script for secure context bridge
// This file runs before the renderer process loads
// It has access to Node.js APIs but runs in the context of the web page

// Since we're using browser-compatible libraries (Leaflet, LocalForage),
// we don't need to expose any Node.js APIs to the renderer
// This keeps the security boundary intact

window.addEventListener('DOMContentLoaded', () => {
    console.log('FW Lagekarte loaded successfully');
});
