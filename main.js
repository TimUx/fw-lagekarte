const { app, BrowserWindow, ipcMain, Menu, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const embeddedServer = require('./embedded-server');
const MarkdownIt = require('markdown-it');

let mainWindow;

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
