# D&D DM Toolkit - Desktop Application Guide

## 🖥️ Desktop Edition (Electron)

Your D&D DM Toolkit is now available as a **standalone desktop application**! No browser required.

---

## ✨ Desktop Features

### Native Desktop Integration
- **Standalone Window**: Runs independently without browser tabs
- **System Tray**: Minimize to tray and quick access via tray icon
- **Keyboard Shortcuts**: Global shortcuts for quick access
- **Always on Top**: Keep the toolkit visible during game sessions
- **Native Menus**: File, View, Window, and Help menus

### Data Management
- **Automatic Data Location**: Campaign data stored in your system's AppData folder
- **Persistent Storage**: Data survives app updates
- **Portable Option**: Available as portable .exe (no installation needed)

### Performance
- **Faster Startup**: No browser overhead
- **Better Resource Management**: Dedicated app process
- **Optimized Memory Usage**: Single-purpose application

---

## 🚀 Running the Desktop App

### Development Mode
Run the app in development (with hot-reload):
```bash
npm run electron
```

### Production Build
Create distributable packages:

**Windows Installer & Portable:**
```bash
npm run dist:win
```

**All Platforms:**
```bash
npm run dist
```

Output will be in the `dist/` folder.

---

## ⌨️ Keyboard Shortcuts

### Navigation
- `Ctrl+1` - Dashboard
- `Ctrl+2` - NPCs
- `Ctrl+3` - Enemies
- `Ctrl+4` - Initiative Tracker
- `Ctrl+5` - Dice Roller

### File Operations
- `Ctrl+E` - Export Campaign
- `Ctrl+I` - Import Campaign
- `Alt+F4` - Exit Application

### View
- `Ctrl+R` - Reload Page
- `Ctrl+Shift+I` - Toggle Developer Tools
- `Ctrl+M` - Minimize Window

---

## 📁 Data Storage Locations

### Windows
```
C:\Users\<YourName>\AppData\Roaming\dnd-dm-toolkit\data\
```

### macOS
```
~/Library/Application Support/dnd-dm-toolkit/data/
```

### Linux
```
~/.config/dnd-dm-toolkit/data/
```

Your campaign data is stored in these system-standard locations, ensuring:
- ✅ Data persists across app updates
- ✅ Proper permissions and security
- ✅ Backed up by system backup tools
- ✅ Separate from application code

---

## 🎯 System Tray Features

### Tray Icon Actions
- **Single Click**: Show/Hide main window
- **Right Click**: Access tray menu

### Tray Menu
- Show App
- Dashboard (quick access)
- Quit

### Minimize to Tray
- Click "X" button → App hides to tray (still running)
- File → Minimize to Tray
- Notification shows when minimized to tray

---

## 📦 Building for Distribution

### Windows

**NSIS Installer** (Recommended)
```bash
npm run dist:win
```

Creates:
- `D&D DM Toolkit-2.0.0-Setup.exe` - Full installer with uninstaller
- User can choose installation directory
- Creates desktop and start menu shortcuts

**Portable .exe**
```bash
npm run dist:win
```

Creates:
- `D&D DM Toolkit-2.0.0-Portable.exe` - No installation needed
- Run directly from USB drive or any folder
- Self-contained with all dependencies

### macOS

```bash
npm run dist:mac
```

Creates:
- `.dmg` - Drag-and-drop installer
- `.zip` - Zipped application bundle

### Linux

```bash
npm run dist:linux
```

Creates:
- `.AppImage` - Universal Linux app (no installation)
- `.deb` - Debian/Ubuntu package

---

## 🔄 Migration from Web Version

### If You're Upgrading
1. **Your data is safe**: The desktop app uses a different data location
2. **Migrate your campaigns**:
   ```bash
   npm run migrate
   ```
3. **Export from web version**: Use the export feature
4. **Import to desktop app**: Use File → Import Campaign

### Running Both Versions
You can run both the web and desktop versions:
- **Web Version**: `npm start` (http://localhost:3000)
- **Desktop Version**: `npm run electron`

They use different data directories, so campaigns won't overlap.

---

## 🛠️ Development

### Project Structure (Electron)
```
dnd-toolkit/
├── main.js              # Electron main process (app lifecycle)
├── preload.js           # Preload script (security bridge)
├── server.js            # Express backend (runs in main process)
├── package.json         # Updated with Electron config
├── views/              # HTML pages (unchanged)
└── public/             # Static assets (unchanged)
```

### Main Process vs Renderer Process
- **Main Process** (`main.js`): Node.js environment, starts server, manages windows
- **Renderer Process** (web pages): Browser environment, displays UI
- **Preload Script** (`preload.js`): Bridge between main and renderer (security)

### Environment Variables
The desktop app sets these automatically:
- `ELECTRON_MODE=true` - Indicates running in Electron
- `DATA_DIR` - Path to user data directory
- `PORT` - Dynamic port (chosen automatically)

---

## 🎨 Customization

### Changing the Window Size
Edit `main.js`:
```javascript
mainWindow = new BrowserWindow({
    width: 1400,  // Change this
    height: 900,  // And this
    // ...
});
```

### Adding More Keyboard Shortcuts
Edit the menu template in `main.js`:
```javascript
{
    label: 'My Shortcut',
    accelerator: 'CmdOrCtrl+K',
    click: () => { /* your action */ }
}
```

### Disabling System Tray
Comment out this line in `main.js`:
```javascript
// createTray();
```

---

## 🐛 Troubleshooting

### App Won't Start
**Problem**: "Error: listen EADDRINUSE"
- **Solution**: Another instance is running. Close it first.

**Problem**: Black screen on launch
- **Solution**: Press `Ctrl+Shift+I` to open DevTools and check console

### Data Not Saving
**Problem**: Changes don't persist
- **Solution**: Check data folder permissions
- **Location**: See "Data Storage Locations" above

### Port Already in Use
**Problem**: Server can't start
- **Solution**: The app automatically finds an available port
- **Check**: Look at console logs for the actual port being used

### System Tray Icon Missing
**Problem**: No tray icon appears
- **Solution**: Add icon files to `public/` directory (see `ICON_PLACEHOLDER.md`)

### Can't Build for Distribution
**Problem**: `npm run dist:win` fails
- **Solution**: 
  1. Ensure you have Node.js 14+ installed
  2. Run `npm install` to reinstall dependencies
  3. Check that `electron-builder` is in devDependencies

---

## 📝 Build Configuration

The build configuration is in `package.json` under the `"build"` key:

```json
{
  "build": {
    "appId": "com.dndtoolkit.app",
    "productName": "D&D DM Toolkit",
    // ... more config
  }
}
```

### Key Configuration Options

- **appId**: Unique identifier for the app
- **productName**: Display name
- **files**: What to include in the build
- **win/mac/linux**: Platform-specific options
- **nsis**: Windows installer settings

---

## 🔒 Security Features

### Context Isolation
- Renderer process can't directly access Node.js APIs
- Prevents security vulnerabilities
- Communication via preload script only

### No Remote Module
- Remote module is disabled for security
- IPC (Inter-Process Communication) is the safe way

### Secure Preload Script
- Exposes only necessary APIs to renderer
- Uses `contextBridge` for safe exposure

---

## 🚀 Performance Tips

### Startup Time
- First launch is slower (creates data directories)
- Subsequent launches are faster (< 3 seconds)

### Memory Usage
- Typical: 150-200 MB RAM
- Includes Chromium rendering engine
- Comparable to a browser tab

### Disk Space
- App: ~150 MB (includes Electron runtime)
- User Data: Depends on campaign size (typically < 50 MB)

---

## 📊 Comparing Versions

| Feature | Web Version | Desktop Version |
|---------|-------------|-----------------|
| **Installation** | None (just run) | Required (or portable) |
| **File Size** | Minimal | ~150 MB |
| **Startup** | Instant | 2-3 seconds |
| **Browser Needed** | Yes | No |
| **System Tray** | ❌ | ✅ |
| **Keyboard Shortcuts** | Limited | Full |
| **Always on Top** | ❌ | ✅ |
| **Updates** | Pull from Git | Manual/Auto-updater |
| **Data Location** | `./data/` | AppData folder |
| **Professional Feel** | Good | Excellent |

---

## 🎯 Best Use Cases

### Desktop App is Best For:
- ✅ Running during live game sessions
- ✅ Quick access via system tray
- ✅ Always-on-top reference
- ✅ Professional DM setup
- ✅ Multiple campaigns, frequent use
- ✅ Sharing with other DMs (via installer)

### Web Version is Best For:
- ✅ Quick testing/development
- ✅ Temporary use
- ✅ Server deployment (for online access)
- ✅ No installation needed
- ✅ Development and debugging

---

## 🔮 Future Enhancements

Potential desktop-specific features:
- **Auto-updater**: Automatic updates without reinstalling
- **Multiple Windows**: Open different sections simultaneously
- **Global Hotkeys**: Access from any application
- **Native Notifications**: Turn alerts, session reminders
- **Touch Bar**: Mac-specific features
- **File Associations**: Open .dnd files directly

---

## 📚 Additional Resources

- **Electron Documentation**: https://www.electronjs.org/docs
- **electron-builder**: https://www.electron.build/
- **Node.js**: https://nodejs.org/

---

## 🤝 Contributing

To improve the desktop app:
1. Fork the repository
2. Make changes to `main.js`, `preload.js`, or build config
3. Test with `npm run electron`
4. Submit a pull request

---

## 📄 License

This desktop application inherits the same license as the main project (MIT).

---

**Enjoy your professional D&D DM desktop toolkit!** 🎲⚔️🐉

For questions or issues, please check the main [README.md](README.md) or open an issue on GitHub.

