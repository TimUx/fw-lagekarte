const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const embeddedServer = require('./embedded-server');

let mainWindow;

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
