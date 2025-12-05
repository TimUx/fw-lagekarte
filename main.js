const { app, BrowserWindow, ipcMain, Menu, shell, dialog, session } = require('electron');
const path = require('path');
const fs = require('fs');
const embeddedServer = require('./embedded-server');
const MarkdownIt = require('markdown-it');
const localforage = require('localforage');
const { DEFAULT_PROXY_SETTINGS } = require('./constants');

let mainWindow;

// Initialize localforage for main process
localforage.config({
    driver: localforage.INDEXEDDB,
    name: 'fw-lagekarte',
    version: 1.0,
    storeName: 'fw_data'
});

// Get proxy settings from storage
async function getProxySettings() {
    try {
        const settings = await localforage.getItem('proxySettings');
        return settings || DEFAULT_PROXY_SETTINGS;
    } catch (error) {
        console.error('Error loading proxy settings:', error);
        return DEFAULT_PROXY_SETTINGS;
    }
}

// Apply proxy settings to Electron session
async function applyProxySettings(settings) {
    try {
        const ses = session.defaultSession;
        
        if (settings.mode === 'direct') {
            // Direct connection (no proxy)
            await ses.setProxy({
                mode: 'direct'
            });
            console.log('[Proxy] Direct connection mode enabled (no proxy)');
        } else if (settings.mode === 'manual' && settings.proxyUrl) {
            // Manual proxy configuration
            const proxyConfig = {
                mode: 'fixed_servers',
                proxyRules: settings.proxyUrl,
                proxyBypassRules: settings.proxyBypassRules || 'localhost,127.0.0.1'
            };
            await ses.setProxy(proxyConfig);
            console.log('[Proxy] Manual proxy configured:', settings.proxyUrl);
        } else {
            // System proxy (default)
            await ses.setProxy({
                mode: 'system'
            });
            console.log('[Proxy] Using system proxy settings');
        }
        
        return { success: true };
    } catch (error) {
        console.error('[Proxy] Error applying proxy settings:', error);
        return { success: false, error: error.message };
    }
}

function openProxySettings() {
    // Create a new window for proxy settings
    const hasValidMainWindow = mainWindow && !mainWindow.isDestroyed();
    
    const proxyWindow = new BrowserWindow({
        width: 700,
        height: 600,
        modal: hasValidMainWindow,
        parent: hasValidMainWindow ? mainWindow : undefined,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        title: 'Proxy-Einstellungen',
        icon: path.join(__dirname, 'assets', 'icon.png'),
        resizable: false
    });
    
    proxyWindow.loadFile('proxy-settings.html');
    proxyWindow.setMenuBarVisibility(false);
}

function openDocumentation(filename) {
    // In packaged apps, extraResources are in process.resourcesPath
    // In development, they're in __dirname
    const basePath = app.isPackaged ? process.resourcesPath : __dirname;
    const filePath = path.join(basePath, filename);
    
    try {
        // Read the markdown file
        const markdownContent = fs.readFileSync(filePath, 'utf-8');
        
        // Convert markdown to HTML
        const md = new MarkdownIt({
            html: false,  // Disable raw HTML for security
            linkify: true,
            typographer: true
        });
        const htmlContent = md.render(markdownContent);
        
        // Get a nice title from filename
        const docTitle = filename.replace('.md', '').replace(/_/g, ' ');
        
        // Create a new window to display the documentation
        const docWindow = new BrowserWindow({
            width: 1000,
            height: 800,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true
            },
            title: docTitle,
            icon: path.join(__dirname, 'assets', 'icon.png')
        });
        
        // Load the doc viewer HTML
        docWindow.loadFile('doc-viewer.html');
        
        // Inject the converted HTML content and title once the page is ready
        docWindow.webContents.on('did-finish-load', () => {
            // Note: innerHTML is safe here because markdown-it is configured with html: false,
            // which escapes all HTML tags in the markdown content
            docWindow.webContents.executeJavaScript(`
                window.docContent = ${JSON.stringify(htmlContent)};
                window.docTitle = ${JSON.stringify(docTitle)};
                document.title = window.docTitle;
                document.getElementById('content').innerHTML = window.docContent;
            `);
        });
        
    } catch (error) {
        console.error(`Failed to open documentation: ${filename}`, error);
        dialog.showErrorBox(
            'Dokumentation konnte nicht geöffnet werden',
            `Die Datei ${filename} konnte nicht geöffnet werden.\n\nFehler: ${error.message}`
        );
    }
}

function createMenu() {
    const isMac = process.platform === 'darwin';
    
    const template = [
        {
            label: 'Datei',
            submenu: [
                {
                    label: 'Proxy-Einstellungen...',
                    click: () => openProxySettings()
                },
                { type: 'separator' },
                {
                    label: 'Beenden',
                    accelerator: isMac ? 'Cmd+Q' : 'Alt+F4',
                    visible: !isMac, // Hide on macOS since quit is in app menu
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Ansicht',
            submenu: [
                {
                    label: 'Neu laden',
                    accelerator: 'CmdOrCtrl+R',
                    click: (item, focusedWindow) => {
                        if (focusedWindow) focusedWindow.reload();
                    }
                },
                {
                    label: 'Erzwungenes Neuladen',
                    accelerator: 'CmdOrCtrl+Shift+R',
                    click: (item, focusedWindow) => {
                        if (focusedWindow) focusedWindow.webContents.reloadIgnoringCache();
                    }
                },
                { type: 'separator' },
                {
                    label: 'Vergrößern',
                    accelerator: 'CmdOrCtrl+=',
                    click: (item, focusedWindow) => {
                        if (focusedWindow) {
                            const currentZoom = focusedWindow.webContents.getZoomLevel();
                            focusedWindow.webContents.setZoomLevel(currentZoom + 1);
                        }
                    }
                },
                {
                    label: 'Verkleinern',
                    accelerator: 'CmdOrCtrl+-',
                    click: (item, focusedWindow) => {
                        if (focusedWindow) {
                            const currentZoom = focusedWindow.webContents.getZoomLevel();
                            focusedWindow.webContents.setZoomLevel(currentZoom - 1);
                        }
                    }
                },
                {
                    label: 'Tatsächliche Größe',
                    accelerator: 'CmdOrCtrl+0',
                    click: (item, focusedWindow) => {
                        if (focusedWindow) focusedWindow.webContents.setZoomLevel(0);
                    }
                },
                { type: 'separator' },
                {
                    label: 'Vollbild',
                    accelerator: isMac ? 'Ctrl+Cmd+F' : 'F11',
                    click: (item, focusedWindow) => {
                        if (focusedWindow) {
                            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
                        }
                    }
                },
                { type: 'separator' },
                {
                    label: 'Entwicklertools',
                    accelerator: isMac ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
                    click: (item, focusedWindow) => {
                        if (focusedWindow) focusedWindow.webContents.toggleDevTools();
                    }
                }
            ]
        },
        {
            label: 'Hilfe',
            submenu: [
                {
                    label: 'Benutzerhandbuch',
                    click: () => openDocumentation('BENUTZERHANDBUCH.md')
                }
            ]
        }
    ];

    // On macOS, add the app menu
    if (isMac) {
        template.unshift({
            label: app.getName(),
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        });
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'assets', 'icon.png')
    });

    mainWindow.loadFile('index.html');
    
    // Open DevTools in development
    // mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// IPC handlers for embedded server control
ipcMain.handle('server:start', async (event, port) => {
    try {
        const result = await embeddedServer.start(port);
        return result;
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('server:stop', async () => {
    try {
        const result = await embeddedServer.stop();
        return result;
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('server:status', async () => {
    return embeddedServer.getStatus();
});

ipcMain.handle('server:networkInfo', async () => {
    return embeddedServer.getNetworkInfo();
});

ipcMain.handle('server:updateState', async (event, stations, vehicles) => {
    embeddedServer.updateState(stations, vehicles);
    return { success: true };
});

ipcMain.handle('server:updateStation', async (event, station) => {
    embeddedServer.updateStation(station);
    return { success: true };
});

ipcMain.handle('server:deleteStation', async (event, stationId) => {
    embeddedServer.deleteStation(stationId);
    return { success: true };
});

ipcMain.handle('server:updateVehicle', async (event, vehicle) => {
    embeddedServer.updateVehicle(vehicle);
    return { success: true };
});

ipcMain.handle('server:deleteVehicle', async (event, vehicleId) => {
    embeddedServer.deleteVehicle(vehicleId);
    return { success: true };
});

ipcMain.handle('server:updateVehiclePosition', async (event, vehicleId, position, deploymentInfo) => {
    embeddedServer.updateVehiclePosition(vehicleId, position, deploymentInfo);
    return { success: true };
});

// IPC handlers for proxy settings
ipcMain.handle('proxy:getSettings', async () => {
    return await getProxySettings();
});

ipcMain.handle('proxy:saveSettings', async (event, settings) => {
    try {
        await localforage.setItem('proxySettings', settings);
        await applyProxySettings(settings);
        
        // Show info dialog that restart may be needed
        if (mainWindow && !mainWindow.isDestroyed()) {
            dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'Proxy-Einstellungen gespeichert',
                message: 'Die Proxy-Einstellungen wurden gespeichert.',
                detail: 'Die neuen Einstellungen werden sofort angewendet. Wenn Sie weiterhin Probleme beim Laden der Karte haben, versuchen Sie die Anwendung neu zu starten.',
                buttons: ['OK']
            });
        }
        
        return { success: true };
    } catch (error) {
        console.error('Error saving proxy settings:', error);
        return { success: false, error: error.message };
    }
});

app.whenReady().then(async () => {
    // Load and apply proxy settings before creating window
    const proxySettings = await getProxySettings();
    await applyProxySettings(proxySettings);
    
    createMenu();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Stop server when app is quitting (with proper async handling)
let quitting = false;
app.on('will-quit', (event) => {
    if (!quitting && embeddedServer.getStatus().isRunning) {
        event.preventDefault();
        quitting = true;
        
        embeddedServer.stop().then(() => {
            app.quit();
        }).catch((error) => {
            console.error('Error stopping server:', error);
            app.quit();
        });
    }
});
