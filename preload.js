/**
 * Preload script for Electron
 * Runs in a secure context before the web page loads
 * Provides a bridge between the main process and renderer process
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
    // Example: Add any Electron-specific APIs you want to expose
    platform: process.platform,
    versions: {
        node: process.versions.node,
        chrome: process.versions.chrome,
        electron: process.versions.electron
    },
    
    // IPC communication for character windows
    ipcRenderer: {
        send: (channel, data) => {
            // Whitelist channels
            const validChannels = ['open-character-window'];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
        }
    }
});

// Log that preload script has loaded
console.log('🔒 Preload script loaded successfully');

