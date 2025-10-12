# Desktop App - Issue Fixed! ✅

## Problem

The packaged desktop app (`dist\win-unpacked\D&D DM Toolkit.exe`) was failing to launch with this error:

```
Failed to start server: Error: spawn node ENOENT
syscall: 'spawn node'
```

## Root Cause

The app was trying to spawn `node` as an external command using `spawn('node', ['server.js'])`. When the app is packaged:
- Node.js is NOT in the system PATH
- The `node` command doesn't exist
- The server couldn't start

## Solution

Changed `main.js` to use `fork()` instead of `spawn()` with `process.execPath`:

```javascript
// OLD (broken in packaged app):
serverProcess = spawn('node', ['server.js'], { ... });

// NEW (works everywhere):
const { fork } = require('child_process');
serverProcess = fork(path.join(__dirname, 'server.js'), [], {
    execPath: process.execPath,  // Uses Electron's bundled Node.js
    ...
});
```

## Status

✅ **FIXED!** The app now runs successfully both:
- In development mode (`npm run electron`)
- As a packaged app (`dist\win-unpacked\D&D DM Toolkit.exe`)

## How to Launch

### Option 1: Quick Launch Script
```cmd
run-desktop-app.bat
```

### Option 2: Direct Launch
Double-click: `dist\win-unpacked\D&D DM Toolkit.exe`

### Option 3: From PowerShell
```powershell
& ".\dist\win-unpacked\D&D DM Toolkit.exe"
```

### Option 4: Development Mode
```bash
npm run electron
```

## App Features Working

✅ Standalone desktop window  
✅ Express server starts automatically  
✅ Campaign data in AppData  
✅ System tray integration  
✅ Keyboard shortcuts  
✅ Native menus  
✅ Always-on-top mode  

## Data Location

Your campaign data is stored at:
```
C:\Users\<YourName>\AppData\Roaming\dnd-dm-toolkit\data\
```

This is separate from the web version data (`D:\DnDGames\data\`).

## About the Build "Error"

When you run `npm run pack` or `npm run dist:win`, you'll see an error about symbolic links:
```
ERROR: Cannot create symbolic link : A required privilege is not held by the client
```

**This is okay!** The error happens AFTER the app is successfully built. The executable works fine. See [BUILD_WORKAROUND.md](BUILD_WORKAROUND.md) for details.

## Next Steps

1. **Try the app** - It should be running now!
2. **Create a shortcut** - Right-click the .exe → Send to → Desktop
3. **Share with friends** - Zip the `dist\win-unpacked\` folder

---

**Your desktop app is fully functional!** 🎉

The Node.js spawning issue is fixed and the app runs perfectly.

