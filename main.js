const { app, BrowserWindow, ipcMain, Menu, shell, dialog } = require('electron');
const path = require('path');
const embeddedServer = require('./embedded-server');

let mainWindow;

function openDocumentation(filename) {
    const filePath = path.join(__dirname, filename);
    shell.openPath(filePath).catch(error => {
        console.error(`Failed to open documentation: ${filename}`, error);
        // Show error dialog to user
        dialog.showErrorBox(
            'Dokumentation konnte nicht geöffnet werden',
            `Die Datei ${filename} konnte nicht geöffnet werden.\n\nStellen Sie sicher, dass ein Markdown-Viewer installiert ist.`
        );
    });
}

function createMenu() {
    const isMac = process.platform === 'darwin';
    
    const template = [
        {
            label: 'Datei',
            submenu: [
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
            label: 'Hilfe',
            submenu: [
                {
                    label: 'Benutzerhandbuch',
                    click: () => openDocumentation('BENUTZERHANDBUCH.md')
                },
                {
                    label: 'README',
                    click: () => openDocumentation('README.md')
                },
                {
                    label: 'Quickstart',
                    click: () => openDocumentation('QUICKSTART.md')
                },
                {
                    label: 'Features',
                    click: () => openDocumentation('FEATURES.md')
                },
                { type: 'separator' },
                {
                    label: 'Readonly Viewer Dokumentation',
                    click: () => openDocumentation('READONLY_VIEWER.md')
                },
                {
                    label: 'Sync Server Setup',
                    click: () => openDocumentation('SYNC_SERVER_SETUP.md')
                },
                {
                    label: 'Embedded Server Dokumentation',
                    click: () => openDocumentation('EMBEDDED_SERVER.md')
                },
                {
                    label: 'Taktische Zeichen Implementierung',
                    click: () => openDocumentation('TACTICAL_SYMBOLS_IMPLEMENTATION.md')
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

app.whenReady().then(() => {
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
