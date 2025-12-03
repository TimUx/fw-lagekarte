// Main application logic
let map;
let stations = [];
let vehicles = [];
let stationMarkers = {};
let vehicleMarkers = {};
let tempMarker = null;

// Sanitize HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize the application
async function init() {
    await initMap();
    await loadData();
    setupEventListeners();
}

// Initialize Leaflet map
async function initMap() {
    const mapView = await Storage.getMapView();
    
    map = L.map('map').setView(mapView.center, mapView.zoom);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Map context menu handler for adding stations
    map.on('contextmenu', onMapContextMenu);
}

// Load data from storage
async function loadData() {
    stations = await Storage.getStations();
    vehicles = await Storage.getVehicles();
    
    renderStations();
    renderVehicles();
}

// Render stations on map
function renderStations() {
    // Clear existing markers
    Object.values(stationMarkers).forEach(marker => map.removeLayer(marker));
    stationMarkers = {};
    
    // Update vehicle station dropdown
    updateStationDropdown();
    
    stations.forEach(station => {
        const icon = L.divIcon({
            className: 'station-marker',
            html: `🏢 ${escapeHtml(station.name)}`,
            iconSize: null
        });
        
        const marker = L.marker([station.lat, station.lng], { icon })
            .addTo(map);
        
        const popupContent = `
            <div class="popup-title">${escapeHtml(station.name)}</div>
            <div class="popup-info"><strong>Adresse:</strong> ${escapeHtml(station.address || 'N/A')}</div>
            <div class="popup-info"><strong>Position:</strong> ${station.lat.toFixed(5)}, ${station.lng.toFixed(5)}</div>
            <div class="popup-actions">
                <button class="btn btn-edit" onclick="editStation('${escapeHtml(station.id)}')">✏️ Bearbeiten</button>
                <button class="btn btn-danger" onclick="deleteStation('${escapeHtml(station.id)}')">🗑️ Löschen</button>
            </div>
        `;
        
        marker.bindPopup(popupContent);
        stationMarkers[station.id] = marker;
    });
}

// Render vehicles in sidebar
function renderVehicles() {
    const vehicleList = document.getElementById('vehicleList');
    vehicleList.innerHTML = '';
    
    vehicles.forEach(vehicle => {
        const card = document.createElement('div');
        card.className = 'vehicle-card' + (vehicle.deployed ? ' deployed' : '');
        card.draggable = true;
        card.dataset.vehicleId = vehicle.id;
        
        card.innerHTML = `
            <div class="vehicle-actions">
                <button class="btn-icon" onclick="editVehicle('${escapeHtml(vehicle.id)}'); event.stopPropagation();">✏️</button>
                <button class="btn-icon" onclick="deleteVehicle('${escapeHtml(vehicle.id)}'); event.stopPropagation();">🗑️</button>
            </div>
            <div class="vehicle-callsign">${escapeHtml(vehicle.callsign)}</div>
            <div class="vehicle-type">Typ: ${escapeHtml(vehicle.type)}</div>
            ${vehicle.crew ? `<div class="vehicle-crew">Besatzung: ${escapeHtml(vehicle.crew)}</div>` : ''}
        `;
        
        // Drag event listeners
        card.addEventListener('dragstart', onVehicleDragStart);
        card.addEventListener('dragend', onVehicleDragEnd);
        
        vehicleList.appendChild(card);
    });
    
    // Update stats
    updateStats();
    
    // Render deployed vehicles on map
    renderDeployedVehicles();
}

// Update statistics bar
function updateStats() {
    const totalVehicles = vehicles.length;
    const deployedVehicles = vehicles.filter(v => v.deployed).length;
    
    document.getElementById('statsTotal').textContent = `${totalVehicles} Fahrzeuge`;
    document.getElementById('statsDeployed').textContent = `${deployedVehicles} im Einsatz`;
}

// Render deployed vehicles on map
function renderDeployedVehicles() {
    // Clear existing vehicle markers
    Object.values(vehicleMarkers).forEach(marker => map.removeLayer(marker));
    vehicleMarkers = {};
    
    vehicles.filter(v => v.deployed && v.position).forEach(vehicle => {
        const icon = L.divIcon({
            className: 'vehicle-marker',
            html: escapeHtml(vehicle.type),
            iconSize: [40, 40]
        });
        
        const marker = L.marker([vehicle.position.lat, vehicle.position.lng], {
            icon,
            draggable: true
        }).addTo(map);
        
        const popupContent = `
            <div class="popup-title">${escapeHtml(vehicle.callsign)}</div>
            <div class="popup-info"><strong>Typ:</strong> ${escapeHtml(vehicle.type)}</div>
            ${vehicle.crew ? `<div class="popup-info"><strong>Besatzung:</strong> ${escapeHtml(vehicle.crew)}</div>` : ''}
            ${vehicle.notes ? `<div class="popup-info"><strong>Notizen:</strong> ${escapeHtml(vehicle.notes)}</div>` : ''}
            <div class="popup-actions">
                <button class="btn btn-recall" onclick="recallVehicle('${escapeHtml(vehicle.id)}')">↩️ Zurückrufen</button>
            </div>
        `;
        
        marker.bindPopup(popupContent);
        
        // Allow dragging on map
        marker.on('dragend', async (e) => {
            const pos = e.target.getLatLng();
            await Storage.updateVehiclePosition(vehicle.id, { lat: pos.lat, lng: pos.lng });
            await loadData();
        });
        
        vehicleMarkers[vehicle.id] = marker;
    });
}

// Update station dropdown in vehicle form
function updateStationDropdown() {
    const select = document.getElementById('vehicleStation');
    select.innerHTML = '<option value="">Keine Station zugeordnet</option>';
    
    stations.forEach(station => {
        const option = document.createElement('option');
        option.value = station.id;
        option.textContent = station.name;
        select.appendChild(option);
    });
}

// Map context menu handler (right-click)
function onMapContextMenu(e) {
    // Prevent default browser context menu
    L.DomEvent.preventDefault(e);
    L.DomEvent.stopPropagation(e);
    
    // Show a custom context menu
    showContextMenu(e.latlng, e.originalEvent);
}

// Show custom context menu
let contextMenuInstance = null;
let contextMenuCloseHandler = null;

function closeContextMenu() {
    if (contextMenuInstance) {
        contextMenuInstance.remove();
        contextMenuInstance = null;
    }
    if (contextMenuCloseHandler) {
        document.removeEventListener('click', contextMenuCloseHandler);
        contextMenuCloseHandler = null;
    }
}

function showContextMenu(latlng, event) {
    // Remove any existing context menu
    closeContextMenu();
    
    // Create context menu
    const menu = document.createElement('div');
    menu.id = 'customContextMenu';
    menu.className = 'context-menu';
    
    // Position menu with boundary checks to keep it in viewport
    let menuX = event.pageX;
    let menuY = event.pageY;
    
    // Temporarily append to get dimensions
    menu.style.visibility = 'hidden';
    document.body.appendChild(menu);
    const menuRect = menu.getBoundingClientRect();
    
    // Check right boundary
    if (menuX + menuRect.width > window.innerWidth) {
        menuX = window.innerWidth - menuRect.width - 5;
    }
    
    // Check bottom boundary
    if (menuY + menuRect.height > window.innerHeight) {
        menuY = window.innerHeight - menuRect.height - 5;
    }
    
    menu.style.left = menuX + 'px';
    menu.style.top = menuY + 'px';
    menu.style.visibility = 'visible';
    
    menu.innerHTML = `
        <div class="context-menu-item" data-action="add-station">
            🏢 Standort hier hinzufügen
        </div>
    `;
    
    contextMenuInstance = menu;
    
    // Handle menu item clicks
    menu.querySelector('[data-action="add-station"]').addEventListener('click', (e) => {
        e.stopPropagation();
        openStationModalAtLocation(latlng);
        closeContextMenu();
    });
    
    // Close menu when clicking elsewhere
    contextMenuCloseHandler = (e) => {
        // Check if menu still exists in DOM and click was outside
        if (contextMenuInstance && document.body.contains(contextMenuInstance) && !contextMenuInstance.contains(e.target)) {
            closeContextMenu();
        }
    };
    
    // Use setTimeout to avoid immediate closing from the same event
    setTimeout(() => {
        document.addEventListener('click', contextMenuCloseHandler);
    }, 10);
}

// Vehicle drag handlers
function onVehicleDragStart(e) {
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('vehicleId', e.target.dataset.vehicleId);
}

function onVehicleDragEnd(e) {
    e.target.classList.remove('dragging');
}

// Setup map drop zone
function setupMapDrop() {
    const mapContainer = document.getElementById('map');
    
    mapContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    });
    
    mapContainer.addEventListener('drop', async (e) => {
        e.preventDefault();
        
        const vehicleId = e.dataTransfer.getData('vehicleId');
        if (!vehicleId) return;
        
        // Get map coordinates from mouse position
        const mapRect = mapContainer.getBoundingClientRect();
        const point = {
            x: e.clientX - mapRect.left,
            y: e.clientY - mapRect.top
        };
        
        const latlng = map.containerPointToLatLng([point.x, point.y]);
        
        await Storage.updateVehiclePosition(vehicleId, {
            lat: latlng.lat,
            lng: latlng.lng
        });
        
        await loadData();
    });
}

// Recall vehicle from map
async function recallVehicle(vehicleId) {
    await Storage.updateVehiclePosition(vehicleId, null);
    await loadData();
}

// Station CRUD operations
function openStationModal(station = null) {
    const modal = document.getElementById('stationModal');
    const title = document.getElementById('stationModalTitle');
    const form = document.getElementById('stationForm');
    
    form.reset();
    
    if (station) {
        title.textContent = 'Standort bearbeiten';
        document.getElementById('stationId').value = station.id;
        document.getElementById('stationName').value = station.name;
        document.getElementById('stationAddress').value = station.address || '';
        document.getElementById('stationLat').value = station.lat;
        document.getElementById('stationLng').value = station.lng;
    } else {
        title.textContent = 'Standort hinzufügen';
    }
    
    modal.classList.add('show');
}

// Open station modal with pre-filled location
function openStationModalAtLocation(latlng) {
    openStationModal();
    
    // Pre-fill coordinates (using 5 decimal places for consistency)
    document.getElementById('stationLat').value = latlng.lat.toFixed(5);
    document.getElementById('stationLng').value = latlng.lng.toFixed(5);
    
    // Show temporary marker
    if (tempMarker) {
        map.removeLayer(tempMarker);
    }
    tempMarker = L.marker(latlng).addTo(map);
}

async function editStation(stationId) {
    const station = stations.find(s => s.id === stationId);
    if (station) {
        openStationModal(station);
    }
}

async function deleteStation(stationId) {
    if (confirm('Möchten Sie diesen Standort wirklich löschen?')) {
        await Storage.deleteStation(stationId);
        await loadData();
    }
}

// Vehicle CRUD operations
function openVehicleModal(vehicle = null) {
    const modal = document.getElementById('vehicleModal');
    const title = document.getElementById('vehicleModalTitle');
    const form = document.getElementById('vehicleForm');
    
    form.reset();
    
    if (vehicle) {
        title.textContent = 'Fahrzeug bearbeiten';
        document.getElementById('vehicleId').value = vehicle.id;
        document.getElementById('vehicleCallsign').value = vehicle.callsign;
        document.getElementById('vehicleType').value = vehicle.type;
        document.getElementById('vehicleCrew').value = vehicle.crew || '';
        document.getElementById('vehicleStation').value = vehicle.stationId || '';
        document.getElementById('vehicleNotes').value = vehicle.notes || '';
    } else {
        title.textContent = 'Fahrzeug hinzufügen';
    }
    
    modal.classList.add('show');
}

async function editVehicle(vehicleId) {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
        openVehicleModal(vehicle);
    }
}

async function deleteVehicle(vehicleId) {
    if (confirm('Möchten Sie dieses Fahrzeug wirklich löschen?')) {
        await Storage.deleteVehicle(vehicleId);
        await loadData();
    }
}

// Export data
async function exportData() {
    const data = {
        stations: await Storage.getStations(),
        vehicles: await Storage.getVehicles(),
        mapView: await Storage.getMapView(),
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `fw-lagekarte-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Daten wurden exportiert!');
}

// Import data
async function importData(file) {
    try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        if (confirm('Warnung: Dies überschreibt alle aktuellen Daten. Möchten Sie fortfahren?')) {
            // Save data using Storage module
            await Storage.importData(data);
            
            // Reload
            await loadData();
            
            // Update map view if available
            if (data.mapView) {
                map.setView(data.mapView.center, data.mapView.zoom);
            }
            
            alert('Daten wurden erfolgreich importiert!');
        }
    } catch (error) {
        alert('Fehler beim Importieren der Daten: ' + error.message);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Station button
    document.getElementById('addStationBtn').addEventListener('click', () => {
        openStationModal();
    });
    
    // Vehicle button
    document.getElementById('addVehicleBtn').addEventListener('click', () => {
        openVehicleModal();
    });
    
    // Save map view button
    document.getElementById('saveMapViewBtn').addEventListener('click', async () => {
        const center = map.getCenter();
        const zoom = map.getZoom();
        await Storage.saveMapView([center.lat, center.lng], zoom);
        alert('Kartenansicht gespeichert!');
    });
    
    // Export data button
    document.getElementById('exportDataBtn').addEventListener('click', exportData);
    
    // Import data button
    document.getElementById('importDataBtn').addEventListener('click', () => {
        document.getElementById('importFileInput').click();
    });
    
    document.getElementById('importFileInput').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            importData(file);
        }
        e.target.value = ''; // Reset input
    });
    
    // Station form submit
    document.getElementById('stationForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const station = {
            id: document.getElementById('stationId').value || null,
            name: document.getElementById('stationName').value,
            address: document.getElementById('stationAddress').value,
            lat: parseFloat(document.getElementById('stationLat').value),
            lng: parseFloat(document.getElementById('stationLng').value)
        };
        
        await Storage.saveStation(station);
        await loadData();
        closeModal('stationModal');
        
        if (tempMarker) {
            map.removeLayer(tempMarker);
            tempMarker = null;
        }
    });
    
    // Vehicle form submit
    document.getElementById('vehicleForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const vehicleId = document.getElementById('vehicleId').value || null;
        const existingVehicle = vehicleId ? vehicles.find(v => v.id === vehicleId) : null;
        
        const vehicle = {
            id: vehicleId,
            callsign: document.getElementById('vehicleCallsign').value,
            type: document.getElementById('vehicleType').value,
            crew: document.getElementById('vehicleCrew').value,
            stationId: document.getElementById('vehicleStation').value || null,
            notes: document.getElementById('vehicleNotes').value,
            deployed: existingVehicle ? existingVehicle.deployed : false,
            position: existingVehicle ? existingVehicle.position : null
        };
        
        await Storage.saveVehicle(vehicle);
        await loadData();
        closeModal('vehicleModal');
    });
    
    // Modal close buttons
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.dataset.modal;
            closeModal(modalId);
            if (modalId === 'stationModal') {
                if (tempMarker) {
                    map.removeLayer(tempMarker);
                    tempMarker = null;
                }
            }
        });
    });
    
    document.querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.dataset.close;
            closeModal(modalId);
            if (modalId === 'stationModal') {
                if (tempMarker) {
                    map.removeLayer(tempMarker);
                    tempMarker = null;
                }
            }
        });
    });
    
    // Close modal on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
                if (modal.id === 'stationModal') {
                    if (tempMarker) {
                        map.removeLayer(tempMarker);
                        tempMarker = null;
                    }
                }
            }
        });
    });
    
    // Setup map drop zone
    setupMapDrop();
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // ESC key closes modals
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal.show');
            if (openModal) {
                closeModal(openModal.id);
                if (openModal.id === 'stationModal') {
                    if (tempMarker) {
                        map.removeLayer(tempMarker);
                        tempMarker = null;
                    }
                }
            }
        }
    });
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

// Start the application
document.addEventListener('DOMContentLoaded', init);
