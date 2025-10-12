# Application Icon

For the Electron desktop app to display properly, you need to add application icons.

## Required Icon Files

Place these files in the `public/` directory:

### Windows
- **icon.ico** (256x256 or multiple sizes embedded)
  - Used for the Windows .exe and taskbar

### macOS
- **icon.icns** (512x512@2x recommended)
  - Used for the macOS .app bundle and Dock

### Linux / Fallback
- **icon.png** (512x512 recommended)
  - Used for Linux builds and as fallback
  - Also used for the system tray

## Creating Icons

You can create these icons from a single high-resolution PNG (512x512 or 1024x1024):

### Option 1: Online Converters
- **ICO**: https://www.icoconverter.com/
- **ICNS**: https://cloudconvert.com/png-to-icns

### Option 2: Command Line Tools
- **ICO**: Use ImageMagick
  ```bash
  convert icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico
  ```
  
- **ICNS**: Use png2icns
  ```bash
  png2icns icon.icns icon.png
  ```

### Option 3: Use Electron-Icon-Builder
```bash
npm install --save-dev electron-icon-builder
```

## Icon Design Tips

For a D&D DM Toolkit, consider:
- 🎲 Dice imagery (d20 is iconic)
- 📖 Ancient book or scroll
- 🐉 Dragon silhouette
- ⚔️ Crossed swords
- 🗺️ Map elements
- 🏰 Castle or tower

Use clear, bold designs that work well at small sizes (16x16, 32x32).

## Current Status

The app will run without icons, but will use default Electron icons instead.
For production builds, proper icons are recommended for a professional appearance.

