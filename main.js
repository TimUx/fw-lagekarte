const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron');
const path = require('path');
const embeddedServer = require('./embedded-server');

let mainWindow;

function createMenu() {
    const template = [
        {
            label: 'Datei',
            submenu: [
                {
                    label: 'Beenden',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+F4',
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
                    click: () => {
                        shell.openPath(path.join(__dirname, 'BENUTZERHANDBUCH.md'));
                    }
                },
                {
                    label: 'README',
                    click: () => {
                        shell.openPath(path.join(__dirname, 'README.md'));
                    }
                },
                {
                    label: 'Quickstart',
                    click: () => {
                        shell.openPath(path.join(__dirname, 'QUICKSTART.md'));
                    }
                },
                {
                    label: 'Features',
                    click: () => {
                        shell.openPath(path.join(__dirname, 'FEATURES.md'));
                    }
                },
                { type: 'separator' },
                {
                    label: 'Readonly Viewer Dokumentation',
                    click: () => {
                        shell.openPath(path.join(__dirname, 'READONLY_VIEWER.md'));
                    }
                },
                {
                    label: 'Sync Server Setup',
                    click: () => {
                        shell.openPath(path.join(__dirname, 'SYNC_SERVER_SETUP.md'));
                    }
                },
                {
                    label: 'Embedded Server Dokumentation',
                    click: () => {
                        shell.openPath(path.join(__dirname, 'EMBEDDED_SERVER.md'));
                    }
                },
                {
                    label: 'Taktische Zeichen Implementierung',
                    click: () => {
                        shell.openPath(path.join(__dirname, 'TACTICAL_SYMBOLS_IMPLEMENTATION.md'));
                    }
                }
            ]
        }
    ];

    // On macOS, add the app menu
    if (process.platform === 'darwin') {
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
