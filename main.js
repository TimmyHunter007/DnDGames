const { app, BrowserWindow, Menu, Tray, shell, ipcMain } = require('electron');
const path = require('path');
const net = require('net');

let mainWindow = null;
let tray = null;
let serverPort = null;
let characterWindows = new Map(); // Track character windows

// Get user data path for campaign storage
const userDataPath = app.getPath('userData');
const dataPath = path.join(userDataPath, 'data');

console.log('📁 User Data Path:', userDataPath);
console.log('📁 Campaign Data Path:', dataPath);

// Find an available port
function findAvailablePort(startPort = 3000) {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        
        server.listen(startPort, () => {
            const port = server.address().port;
            server.close(() => resolve(port));
        });
        
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                resolve(findAvailablePort(startPort + 1));
            } else {
                reject(err);
            }
        });
    });
}

// Start Express server (runs directly in main process - no spawning needed)
async function startServer() {
    return new Promise(async (resolve, reject) => {
        try {
            // Find available port
            serverPort = await findAvailablePort(3000);
            console.log(`🚀 Starting server on port ${serverPort}`);
            
            // Set environment variables for the server
            process.env.PORT = serverPort.toString();
            process.env.DATA_DIR = dataPath;
            process.env.ELECTRON_MODE = 'true';
            
            // Run the server directly in this process (not as a child process)
            // This works because Electron has Node.js built-in
            try {
                // Dynamically require and start the server
                require(path.join(__dirname, 'server.js'));
                
                // Wait a bit for server to start
                setTimeout(() => {
                    console.log('✅ Server started successfully');
                    resolve();
                }, 2000);
                
            } catch (error) {
                console.error('Failed to start server:', error);
                reject(error);
            }
            
        } catch (error) {
            console.error('Error starting server:', error);
            reject(error);
        }
    });
}

// Create main window
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 700,
        icon: path.join(__dirname, 'public', 'icon.png'),
        backgroundColor: '#1a1a2e',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js')
        },
        show: false, // Don't show until ready
        title: 'D&D DM Toolkit'
    });
    
    // Create application menu
    const menuTemplate = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Campaigns',
                    click: () => mainWindow.loadURL(`http://localhost:${serverPort}/campaigns`)
                },
                { type: 'separator' },
                {
                    label: 'Export Campaign',
                    accelerator: 'CmdOrCtrl+E',
                    click: () => mainWindow.webContents.executeJavaScript('exportData()')
                },
                {
                    label: 'Import Campaign',
                    accelerator: 'CmdOrCtrl+I',
                    click: () => mainWindow.webContents.executeJavaScript('importData()')
                },
                { type: 'separator' },
                {
                    label: 'Exit',
                    accelerator: 'Alt+F4',
                    click: () => app.quit()
                }
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Dashboard',
                    accelerator: 'CmdOrCtrl+1',
                    click: () => mainWindow.loadURL(`http://localhost:${serverPort}/dashboard`)
                },
                {
                    label: 'NPCs',
                    accelerator: 'CmdOrCtrl+2',
                    click: () => mainWindow.loadURL(`http://localhost:${serverPort}/npcs`)
                },
                {
                    label: 'Enemies',
                    accelerator: 'CmdOrCtrl+3',
                    click: () => mainWindow.loadURL(`http://localhost:${serverPort}/enemies`)
                },
                {
                    label: 'Initiative',
                    accelerator: 'CmdOrCtrl+4',
                    click: () => mainWindow.loadURL(`http://localhost:${serverPort}/initiative`)
                },
                {
                    label: 'Dice Roller',
                    accelerator: 'CmdOrCtrl+5',
                    click: () => mainWindow.loadURL(`http://localhost:${serverPort}/dice`)
                },
                { type: 'separator' },
                {
                    label: 'Reload',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => mainWindow.reload()
                },
                {
                    label: 'Toggle Developer Tools',
                    accelerator: 'CmdOrCtrl+Shift+I',
                    click: () => mainWindow.webContents.toggleDevTools()
                },
                { type: 'separator' },
                {
                    label: 'Always on Top',
                    type: 'checkbox',
                    click: (menuItem) => mainWindow.setAlwaysOnTop(menuItem.checked)
                }
            ]
        },
        {
            label: 'Window',
            submenu: [
                {
                    label: 'Minimize',
                    accelerator: 'CmdOrCtrl+M',
                    click: () => mainWindow.minimize()
                },
                {
                    label: 'Maximize',
                    click: () => {
                        if (mainWindow.isMaximized()) {
                            mainWindow.unmaximize();
                        } else {
                            mainWindow.maximize();
                        }
                    }
                },
                { type: 'separator' },
                {
                    label: 'Minimize to Tray',
                    click: () => {
                        mainWindow.hide();
                        if (tray) {
                            tray.displayBalloon({
                                title: 'D&D DM Toolkit',
                                content: 'App is running in the system tray'
                            });
                        }
                    }
                }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'Documentation',
                    click: () => shell.openExternal('https://github.com/yourusername/dnd-toolkit')
                },
                { type: 'separator' },
                {
                    label: 'About',
                    click: () => {
                        const aboutWindow = new BrowserWindow({
                            width: 400,
                            height: 300,
                            parent: mainWindow,
                            modal: true,
                            show: false,
                            backgroundColor: '#1a1a2e'
                        });
                        
                        aboutWindow.loadURL(`data:text/html;charset=utf-8,
                            <html>
                            <head>
                                <style>
                                    body { 
                                        background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #2d1b4e 100%);
                                        color: #e8e8e8;
                                        font-family: Arial, sans-serif;
                                        text-align: center;
                                        padding: 50px;
                                        margin: 0;
                                    }
                                    h1 { color: #a78bfa; }
                                    p { margin: 10px 0; }
                                </style>
                            </head>
                            <body>
                                <h1>🎲 D&D DM Toolkit</h1>
                                <p><strong>Version:</strong> 2.0.0</p>
                                <p><strong>Multi-Campaign Support</strong></p>
                                <p>Manage all your D&D campaigns in one place</p>
                                <p style="margin-top: 30px; font-size: 0.9em; opacity: 0.7;">
                                    Data Location:<br>${dataPath}
                                </p>
                            </body>
                            </html>
                        `);
                        
                        aboutWindow.once('ready-to-show', () => {
                            aboutWindow.show();
                        });
                        
                        aboutWindow.setMenu(null);
                    }
                }
            ]
        }
    ];
    
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
    
    // Load the app
    mainWindow.loadURL(`http://localhost:${serverPort}`);
    
    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        console.log('✅ Window loaded successfully');
    });
    
    // Prevent external links from opening in the app
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
    
    // Handle window close
    mainWindow.on('close', (event) => {
        if (!app.isQuitting) {
            event.preventDefault();
            mainWindow.hide();
            if (tray) {
                tray.displayBalloon({
                    title: 'D&D DM Toolkit',
                    content: 'App is still running in the system tray'
                });
            }
        }
    });
    
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Create system tray
function createTray() {
    // Try to load tray icon, fallback if not found
    let trayIconPath = path.join(__dirname, 'public', 'icon.png');
    
    try {
        tray = new Tray(trayIconPath);
    } catch (error) {
        console.log('⚠️  Tray icon not found, skipping tray creation');
        return;
    }
    
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show App',
            click: () => {
                if (mainWindow) {
                    mainWindow.show();
                }
            }
        },
        {
            label: 'Dashboard',
            click: () => {
                if (mainWindow) {
                    mainWindow.show();
                    mainWindow.loadURL(`http://localhost:${serverPort}/dashboard`);
                }
            }
        },
        { type: 'separator' },
        {
            label: 'Quit',
            click: () => {
                app.isQuitting = true;
                app.quit();
            }
        }
    ]);
    
    tray.setToolTip('D&D DM Toolkit');
    tray.setContextMenu(contextMenu);
    
    tray.on('click', () => {
        if (mainWindow) {
            if (mainWindow.isVisible()) {
                mainWindow.hide();
            } else {
                mainWindow.show();
            }
        }
    });
}

// App lifecycle
// Create character window function
function createCharacterWindow(characterId, campaignId) {
    
    const characterWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        icon: path.join(__dirname, 'public', 'icon.png'),
        backgroundColor: '#1a1a2e',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js'),
            devTools: true
        },
        show: false,
        title: `Character Sheet - ${characterId}`,
        parent: mainWindow, // Make it a child window
        modal: false // Allow multiple character windows
    });
    
    
    // Load the character window page
    const characterUrl = `http://localhost:${serverPort}/character-window?characterId=${characterId}&campaignId=${campaignId}`;
    characterWindow.loadURL(characterUrl);
    
    // Show window when ready
    characterWindow.once('ready-to-show', () => {
        characterWindow.show();
    });
    
    // Handle load errors
    characterWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
        console.error('❌ Failed to load character window:', errorCode, errorDescription, validatedURL);
    });
    
    // Handle successful load
    characterWindow.webContents.on('did-finish-load', () => {
        
        // Add keyboard shortcut for dev tools (F12)
        characterWindow.webContents.on('before-input-event', (event, input) => {
            if (input.type === 'keyDown' && input.key === 'F12') {
                if (characterWindow.webContents.isDevToolsOpened()) {
                    characterWindow.webContents.closeDevTools();
                } else {
                    characterWindow.webContents.openDevTools();
                }
            }
        });
    });
    
    // Clean up when window is closed
    characterWindow.on('closed', () => {
        characterWindows.delete(characterId);
    });
    
    // Store reference to the window
    characterWindows.set(characterId, characterWindow);
    
    return characterWindow;
}

// IPC handler for opening character windows
ipcMain.on('open-character-window', (event, data) => {
    const { characterId, campaignId } = data;
    
    // Check if window already exists for this character
    if (characterWindows.has(characterId)) {
        const existingWindow = characterWindows.get(characterId);
        if (!existingWindow.isDestroyed()) {
            existingWindow.focus();
            return;
        } else {
            characterWindows.delete(characterId);
        }
    }
    
    // Create new character window
    createCharacterWindow(characterId, campaignId);
});

app.whenReady().then(async () => {
    try {
        console.log('🎲 Starting D&D DM Toolkit...');
        
        // Start Express server
        await startServer();
        
        // Create window
        createWindow();
        
        // Create system tray
        createTray();
        
        console.log('✅ Application ready!');
        console.log(`📍 Server running at: http://localhost:${serverPort}`);
        console.log(`📁 Data stored at: ${dataPath}`);
        
    } catch (error) {
        console.error('❌ Failed to start application:', error);
        app.quit();
    }
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Re-create window on macOS when dock icon is clicked
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Clean up on quit
app.on('before-quit', () => {
    app.isQuitting = true;
});

app.on('will-quit', () => {
    // Server will stop automatically when the process exits
    console.log('🛑 Application shutting down...');
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

