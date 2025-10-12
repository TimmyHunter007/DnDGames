# Building the Desktop App - Windows Workaround

## ⚠️ Issue: Symbolic Link Permission Error

When running `npm run dist:win`, you may encounter this error:
```
ERROR: Cannot create symbolic link : A required privilege is not held by the client
```

This is a **Windows permissions issue** with electron-builder trying to extract code signing tools.

---

## ✅ Solution 1: Use the Unpacked Build (Easiest)

**Good news:** The build actually SUCCEEDS before the error occurs! The executable is created successfully.

### The Build is Already Done!

Your app is located at:
```
dist\win-unpacked\D&D DM Toolkit.exe
```

### Running the App

**Option A: Double-click the executable**
1. Navigate to `dist\win-unpacked\`
2. Double-click `D&D DM Toolkit.exe`

**Option B: Use the convenience script**
```cmd
run-desktop-app.bat
```

**Option C: From PowerShell**
```powershell
& ".\dist\win-unpacked\D&D DM Toolkit.exe"
```

### This is a Full, Working Desktop App!
- ✅ Completely functional
- ✅ No installation needed (portable)
- ✅ Can be copied to any folder
- ✅ Can be copied to USB drive
- ✅ Can be zipped and shared

**The only difference:** No fancy installer wizard. You just run the .exe directly.

---

## ✅ Solution 2: Enable Developer Mode (Permanent Fix)

This allows symbolic links without admin privileges.

### Windows 10/11:
1. Open **Settings** (`Win + I`)
2. Go to **Update & Security** → **For developers**
3. Turn on **Developer Mode**
4. Restart your terminal
5. Run `npm run dist:win` again

---

## ✅ Solution 3: Run as Administrator

Build the installer with elevated permissions:

1. **Open PowerShell as Administrator**
   - Right-click PowerShell
   - Select "Run as Administrator"

2. **Navigate to project**
   ```powershell
   cd D:\DnDGames
   ```

3. **Run the build**
   ```powershell
   npm run dist:win
   ```

This will create:
- `dist/D&D DM Toolkit-2.0.0-Setup.exe` - Full installer
- `dist/D&D DM Toolkit-2.0.0-Portable.exe` - Portable version

---

## ✅ Solution 4: Manual Packaging (If Needed)

If you really need an installer, you can manually create one:

### Option A: Zip the Unpacked Folder
```powershell
Compress-Archive -Path "dist\win-unpacked\*" -DestinationPath "D&D-DM-Toolkit-Portable.zip"
```

Share the zip file - recipients just extract and run the .exe!

### Option B: Use a Free Installer Tool
- **Inno Setup** (https://jrsoftware.org/isinfo.php)
- **NSIS** (https://nsis.sourceforge.io/)

---

## 📝 Summary

| Solution | Pros | Cons |
|----------|------|------|
| **Use Unpacked Build** | ✅ Already done!<br>✅ Works immediately<br>✅ Portable | ⚠️ No fancy installer<br>⚠️ Manual file management |
| **Developer Mode** | ✅ Permanent fix<br>✅ Creates installers | ⚠️ Requires Windows setting change |
| **Run as Admin** | ✅ Creates installers<br>✅ No setting changes | ⚠️ Must remember to use admin |
| **Manual Zip** | ✅ Easy to share<br>✅ Widely compatible | ⚠️ Manual process |

---

## 🎯 Recommended Approach

For personal use:
→ **Just use the unpacked build!** It's in `dist\win-unpacked\`

For distribution to others:
→ **Enable Developer Mode** and rebuild with `npm run dist:win`

For quick sharing:
→ **Zip the unpacked folder** and send it

---

## 🔍 Why Does This Happen?

The error occurs because:
1. electron-builder downloads code signing tools
2. These tools contain macOS symbolic links (`.dylib` files)
3. Windows requires admin privileges to create symbolic links by default
4. The code signing tools are needed to create installers
5. BUT they're not needed for the app itself!

**The app builds successfully BEFORE this error occurs.**

---

## ✅ Verification

Check that your build succeeded:

```powershell
Test-Path "dist\win-unpacked\D&D DM Toolkit.exe"
```

If it returns `True`, your app is ready to use!

---

## 🚀 Next Steps

1. **Try running the app:**
   ```cmd
   run-desktop-app.bat
   ```

2. **If you like it:**
   - Copy `dist\win-unpacked\` folder anywhere you want
   - Create a desktop shortcut to the .exe
   - Or enable Developer Mode and rebuild for a proper installer

3. **Share with friends:**
   - Zip the `dist\win-unpacked\` folder
   - Share the zip file
   - They extract and run - that's it!

---

**Your desktop app is fully functional right now!** 🎉

The "error" is just about packaging, not the app itself.

