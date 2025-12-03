// Main application logic
let map;
let stations = [];
let vehicles = [];
let stationMarkers = {};
let vehicleMarkers = {};
let tempMarker = null;

// Constants
const CONTEXT_MENU_CLOSE_DELAY = 10; // ms delay to avoid immediate closing
const PRINT_CLEANUP_DELAY = 1000; // ms delay before removing print legend

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
    setupSyncListeners();
}

// Setup sync event listeners
function setupSyncListeners() {
    if (typeof Sync !== 'undefined') {
        Sync.addListener(async (eventType, data) => {
            // Reload data when sync events occur
            if (['station_update', 'station_delete', 'vehicle_update', 'vehicle_delete', 'vehicle_position', 'full_sync'].includes(eventType)) {
                await loadData();
            }
        });
    }
}

// Initialize Leaflet map
async function initMap() {
    const mapView = await Storage.getMapView();
    
    map = L.map('map').setView(mapView.center, mapView.zoom);
    
    // Define base layers
    const baseLayers = {
        'OpenStreetMap': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }),
        'Satellit (Esri)': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '© Esri, Earthstar Geographics',
            maxZoom: 19
        }),
        'Topographisch (OpenTopoMap)': L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenTopoMap contributors',
            maxZoom: 17
        }),
        'Hybrid (Satellit mit Beschriftung)': L.layerGroup([
            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: '© Esri, Earthstar Geographics',
                maxZoom: 19
            }),
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19,
                opacity: 0.3
            })
        ])
    };
    
    // Get saved layer preference or default to OpenStreetMap
    const savedLayer = await Storage.getSelectedLayer();
    const defaultLayer = baseLayers[savedLayer] || baseLayers['OpenStreetMap'];
    defaultLayer.addTo(map);
    
    // Add layer control to map
    const layerControl = L.control.layers(baseLayers, null, {
        position: 'topright',
        collapsed: true
    }).addTo(map);
    
    // Save layer preference when changed
    map.on('baselayerchange', async (e) => {
        await Storage.saveSelectedLayer(e.name);
    });

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
        // Use tactical symbol for station
        const symbolPath = getStationSymbolPath();
        
        // If no symbol path is available, skip this station or use fallback
        if (!symbolPath) {
            console.error('Station symbol path not found');
            return;
        }
        
        const icon = L.divIcon({
            className: 'station-marker-icon',
            html: `<img src="${escapeHtml(symbolPath)}" alt="Station" class="station-icon-img" />`,
            iconSize: [50, 50],
            iconAnchor: [25, 25]
        });
        
        const marker = L.marker([station.lat, station.lng], { icon })
            .addTo(map);
        
        // Tooltip for hover with station name
        marker.bindTooltip(escapeHtml(station.name), {
            permanent: false,
            direction: 'top',
            className: 'station-tooltip'
        });
        
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
    
    // Group vehicles by station
    const vehiclesByStation = {};
    const unassignedVehicles = [];
    
    vehicles.forEach(vehicle => {
        if (vehicle.stationId) {
            if (!vehiclesByStation[vehicle.stationId]) {
                vehiclesByStation[vehicle.stationId] = [];
            }
            vehiclesByStation[vehicle.stationId].push(vehicle);
        } else {
            unassignedVehicles.push(vehicle);
        }
    });
    
    // Sort stations alphabetically by name
    const sortedStations = stations
        .filter(station => vehiclesByStation[station.id])
        .sort((a, b) => a.name.localeCompare(b.name, 'de'));
    
    // Render grouped vehicles
    sortedStations.forEach(station => {
        // Create station header
        const stationHeader = document.createElement('div');
        stationHeader.className = 'station-group-header';
        stationHeader.innerHTML = `
            <div class="station-group-name">📍 ${escapeHtml(station.name)}</div>
        `;
        vehicleList.appendChild(stationHeader);
        
        // Sort vehicles by callsign within station
        const stationVehicles = vehiclesByStation[station.id]
            .sort((a, b) => a.callsign.localeCompare(b.callsign, 'de'));
        
        // Render vehicles for this station
        stationVehicles.forEach(vehicle => {
            vehicleList.appendChild(createVehicleCard(vehicle));
        });
    });
    
    // Render unassigned vehicles if any
    if (unassignedVehicles.length > 0) {
        const unassignedHeader = document.createElement('div');
        unassignedHeader.className = 'station-group-header';
        unassignedHeader.innerHTML = `
            <div class="station-group-name">📋 Nicht zugeordnet</div>
        `;
        vehicleList.appendChild(unassignedHeader);
        
        // Sort unassigned vehicles by callsign
        unassignedVehicles
            .sort((a, b) => a.callsign.localeCompare(b.callsign, 'de'))
            .forEach(vehicle => {
                vehicleList.appendChild(createVehicleCard(vehicle));
            });
    }
    
    // Update stats
    updateStats();
    
    // Render deployed vehicles on map
    renderDeployedVehicles();
}

// Create vehicle card element
function createVehicleCard(vehicle) {
    const card = document.createElement('div');
    card.className = 'vehicle-card' + (vehicle.deployed ? ' deployed' : '');
    card.draggable = true;
    card.dataset.vehicleId = vehicle.id;
    
    // Get tactical symbol path
    const symbolPath = getTacticalSymbolPath(vehicle.type);
    
    // Fallback if no symbol is found
    const symbolHtml = symbolPath 
        ? `<img src="${escapeHtml(symbolPath)}" alt="${escapeHtml(vehicle.type)}" class="vehicle-card-icon" />`
        : `<div class="vehicle-card-icon-fallback">${escapeHtml(vehicle.type)}</div>`;
    
    // Build deployment info section for vehicle card
    let deploymentInfoHtml = '';
    if (vehicle.deployed && vehicle.deploymentInfo) {
        if (vehicle.deploymentInfo.missionNumber) {
            deploymentInfoHtml += `<div class="vehicle-mission">📋 ${escapeHtml(vehicle.deploymentInfo.missionNumber)}</div>`;
        }
        if (vehicle.deploymentInfo.missionKeyword) {
            deploymentInfoHtml += `<div class="vehicle-mission">🚨 ${escapeHtml(vehicle.deploymentInfo.missionKeyword)}</div>`;
        }
    }
    
    card.innerHTML = `
        <div class="vehicle-actions">
            <button class="btn-icon" onclick="editVehicle('${escapeHtml(vehicle.id)}'); event.stopPropagation();">✏️</button>
            <button class="btn-icon" onclick="deleteVehicle('${escapeHtml(vehicle.id)}'); event.stopPropagation();">🗑️</button>
        </div>
        <div class="vehicle-card-content">
            ${symbolHtml}
            <div class="vehicle-card-info">
                <div class="vehicle-callsign">${escapeHtml(vehicle.callsign)}</div>
                <div class="vehicle-type">Typ: ${escapeHtml(vehicle.type)}</div>
                ${vehicle.crew ? `<div class="vehicle-crew">Besatzung: ${escapeHtml(vehicle.crew)}</div>` : ''}
                ${deploymentInfoHtml}
            </div>
        </div>
    `;
    
    // Drag event listeners
    card.addEventListener('dragstart', onVehicleDragStart);
    card.addEventListener('dragend', onVehicleDragEnd);
    
    return card;
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
        // Use tactical symbol for vehicle with callsign overlay
        const symbolPath = getTacticalSymbolPath(vehicle.type);
        
        // Fallback if no symbol is found
        const iconHtml = symbolPath 
            ? `<div class="vehicle-marker-container">
                    <img src="${escapeHtml(symbolPath)}" alt="${escapeHtml(vehicle.type)}" class="vehicle-icon-img" />
                    <div class="vehicle-callsign-overlay">${escapeHtml(vehicle.callsign)}</div>
               </div>`
            : `<div class="vehicle-marker-fallback">
                    <div class="vehicle-type-fallback">${escapeHtml(vehicle.type)}</div>
                    <div class="vehicle-callsign-overlay">${escapeHtml(vehicle.callsign)}</div>
               </div>`;
        
        const icon = L.divIcon({
            className: 'vehicle-marker-icon',
            html: iconHtml,
            iconSize: [80, 80],
            iconAnchor: [40, 40]
        });
        
        const marker = L.marker([vehicle.position.lat, vehicle.position.lng], {
            icon,
            draggable: true
        }).addTo(map);
        
        // Build deployment info section
        let deploymentInfoHtml = '';
        if (vehicle.deploymentInfo) {
            if (vehicle.deploymentInfo.missionNumber) {
                deploymentInfoHtml += `<div class="popup-info"><strong>Einsatznummer:</strong> ${escapeHtml(vehicle.deploymentInfo.missionNumber)}</div>`;
            }
            if (vehicle.deploymentInfo.missionKeyword) {
                deploymentInfoHtml += `<div class="popup-info"><strong>Einsatzstichwort:</strong> ${escapeHtml(vehicle.deploymentInfo.missionKeyword)}</div>`;
            }
            if (vehicle.deploymentInfo.remarks) {
                deploymentInfoHtml += `<div class="popup-info"><strong>Bemerkungen:</strong> ${escapeHtml(vehicle.deploymentInfo.remarks)}</div>`;
            }
        }
        
        const popupContent = `
            <div class="popup-title">${escapeHtml(vehicle.callsign)}</div>
            <div class="popup-info"><strong>Typ:</strong> ${escapeHtml(vehicle.type)}</div>
            ${vehicle.crew ? `<div class="popup-info"><strong>Besatzung:</strong> ${escapeHtml(vehicle.crew)}</div>` : ''}
            ${deploymentInfoHtml}
            ${vehicle.notes ? `<div class="popup-info"><strong>Notizen:</strong> ${escapeHtml(vehicle.notes)}</div>` : ''}
            <div class="popup-actions">
                <button class="btn btn-edit" onclick="editDeploymentInfo('${escapeHtml(vehicle.id)}')">✏️ Einsatzinfo</button>
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
    
    // Temporarily position off-screen to get dimensions
    menu.style.position = 'absolute';
    menu.style.left = '-9999px';
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
    }, CONTEXT_MENU_CLOSE_DELAY);
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
        
        // Open deployment info modal
        openDeploymentModal(vehicleId, latlng);
    });
}

// Open deployment modal
function openDeploymentModal(vehicleId, latlng) {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;
    
    const modal = document.getElementById('deploymentModal');
    const form = document.getElementById('deploymentForm');
    
    form.reset();
    document.getElementById('deploymentVehicleId').value = vehicleId;
    document.getElementById('deploymentLat').value = latlng.lat;
    document.getElementById('deploymentLng').value = latlng.lng;
    document.getElementById('deploymentVehicleName').textContent = vehicle.callsign;
    
    // Pre-fill with existing deployment info if already deployed
    if (vehicle.deploymentInfo) {
        document.getElementById('deploymentMissionNumber').value = vehicle.deploymentInfo.missionNumber || '';
        document.getElementById('deploymentMissionKeyword').value = vehicle.deploymentInfo.missionKeyword || '';
        document.getElementById('deploymentRemarks').value = vehicle.deploymentInfo.remarks || '';
    }
    
    modal.classList.add('show');
}

// Recall vehicle from map
async function recallVehicle(vehicleId) {
    await Storage.updateVehiclePosition(vehicleId, null);
    await loadData();
}

// Edit deployment info for already deployed vehicle
function editDeploymentInfo(vehicleId) {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle || !vehicle.position) return;
    
    openDeploymentModal(vehicleId, vehicle.position);
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

// Print map
async function printMap() {
    // Create print legend
    const printLegend = document.createElement('div');
    printLegend.id = 'printLegend';
    printLegend.className = 'print-legend';
    
    const deployedVehicles = vehicles.filter(v => v.deployed);
    const availableVehicles = vehicles.filter(v => !v.deployed);
    
    printLegend.innerHTML = `
        <div class="print-legend-header">
            <h1>🚒 FW Lagekarte - Einsatzübersicht</h1>
            <div class="print-timestamp">Gedruckt am: ${new Date().toLocaleString('de-DE')}</div>
        </div>
        <div class="print-legend-content">
            <div class="print-section">
                <h3>Im Einsatz (${deployedVehicles.length})</h3>
                <ul>
                    ${deployedVehicles.map(v => `<li><strong>${escapeHtml(v.callsign)}</strong> - ${escapeHtml(v.type)}${v.crew ? ` (${escapeHtml(v.crew)})` : ''}</li>`).join('')}
                </ul>
            </div>
            <div class="print-section">
                <h3>Verfügbar (${availableVehicles.length})</h3>
                <ul>
                    ${availableVehicles.map(v => `<li><strong>${escapeHtml(v.callsign)}</strong> - ${escapeHtml(v.type)}${v.crew ? ` (${escapeHtml(v.crew)})` : ''}</li>`).join('')}
                </ul>
            </div>
            <div class="print-section">
                <h3>Standorte (${stations.length})</h3>
                <ul>
                    ${stations.map(s => `<li><strong>${escapeHtml(s.name)}</strong>${s.address ? ` - ${escapeHtml(s.address)}` : ''}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
    
    document.body.appendChild(printLegend);
    
    // Trigger browser print dialog
    window.print();
    
    // Remove legend after print
    setTimeout(() => {
        document.body.removeChild(printLegend);
    }, PRINT_CLEANUP_DELAY);
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

// Open sync settings modal
async function openSyncModal() {
    const modal = document.getElementById('syncModal');
    const config = await Sync.getConfig();
    
    document.getElementById('syncMode').value = config.mode || 'standalone';
    document.getElementById('syncServerUrl').value = config.serverUrl || '';
    document.getElementById('syncServerPort').value = config.serverPort || 8080;
    
    // Show/hide fields based on mode
    updateSyncModalFields();
    updateSyncModalStatus();
    
    modal.classList.add('show');
}

// Update sync modal fields based on selected mode
function updateSyncModalFields() {
    const mode = document.getElementById('syncMode').value;
    const serverUrlGroup = document.getElementById('syncServerUrlGroup');
    const serverPortGroup = document.getElementById('syncServerPortGroup');
    
    if (mode === 'client') {
        serverUrlGroup.style.display = 'block';
        serverPortGroup.style.display = 'none';
    } else if (mode === 'server') {
        serverUrlGroup.style.display = 'none';
        serverPortGroup.style.display = 'block';
    } else {
        serverUrlGroup.style.display = 'none';
        serverPortGroup.style.display = 'none';
    }
}

// Update sync status in modal
function updateSyncModalStatus() {
    const statusElement = document.getElementById('syncModalStatus');
    const status = Sync.getStatus();
    
    const statusTexts = {
        'connected': '🟢 Verbunden',
        'connecting': '🟡 Verbinde...',
        'disconnected': '⚫ Nicht verbunden',
        'standalone': '⚫ Standalone',
        'server-mode': '🟢 Server aktiv',
        'error': '🔴 Fehler'
    };
    
    statusElement.textContent = statusTexts[status] || '⚫ Unbekannt';
}

// Discover servers in LAN
async function discoverServers() {
    const btn = document.getElementById('syncDiscoverBtn');
    const statusDiv = document.getElementById('syncDiscoveryStatus');
    
    btn.disabled = true;
    btn.textContent = '🔍 Suche läuft...';
    
    await Sync.discoverServers((message, done, servers) => {
        statusDiv.textContent = message;
        
        if (done && servers && servers.length > 0) {
            // Use first found server
            document.getElementById('syncServerUrl').value = servers[0];
        }
        
        btn.disabled = false;
        btn.textContent = '🔍 Server im LAN suchen';
    });
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
    
    // Print map button
    document.getElementById('printMapBtn').addEventListener('click', printMap);
    
    // Save map view button
    document.getElementById('saveMapViewBtn').addEventListener('click', async () => {
        const center = map.getCenter();
        const zoom = map.getZoom();
        await Storage.saveMapView([center.lat, center.lng], zoom);
        alert('Kartenansicht gespeichert!');
    });
    
    // Sync settings button
    document.getElementById('syncSettingsBtn').addEventListener('click', openSyncModal);
    
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
            position: existingVehicle ? existingVehicle.position : null,
            deploymentInfo: existingVehicle ? existingVehicle.deploymentInfo : null
        };
        
        await Storage.saveVehicle(vehicle);
        await loadData();
        closeModal('vehicleModal');
    });
    
    // Sync form submit
    document.getElementById('syncForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const mode = document.getElementById('syncMode').value;
        const config = {
            mode: mode,
            serverUrl: document.getElementById('syncServerUrl').value,
            serverPort: parseInt(document.getElementById('syncServerPort').value),
            clientId: (await Sync.getConfig()).clientId
        };
        
        await Sync.saveConfig(config);
        updateSyncModalStatus();
        
        alert('Synchronisations-Einstellungen gespeichert!');
    });
    
    // Sync mode change handler
    document.getElementById('syncMode').addEventListener('change', updateSyncModalFields);
    
    // Sync discovery button
    document.getElementById('syncDiscoverBtn').addEventListener('click', discoverServers);
    
    // Deployment form submit
    document.getElementById('deploymentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const vehicleId = document.getElementById('deploymentVehicleId').value;
        const lat = parseFloat(document.getElementById('deploymentLat').value);
        const lng = parseFloat(document.getElementById('deploymentLng').value);
        
        const deploymentInfo = {
            missionNumber: document.getElementById('deploymentMissionNumber').value || null,
            missionKeyword: document.getElementById('deploymentMissionKeyword').value || null,
            remarks: document.getElementById('deploymentRemarks').value || null
        };
        
        await Storage.updateVehiclePosition(vehicleId, { lat, lng }, deploymentInfo);
        await loadData();
        closeModal('deploymentModal');
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
