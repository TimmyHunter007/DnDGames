# 🚀 Quick Start Guide

## Desktop App (Recommended)

### 1. Install Dependencies
```bash
npm install
```

### 2. Launch Desktop App
```bash
npm run electron
```

That's it! The desktop app will open automatically.

---

## What to Do First

### First Time Setup
1. **Create Your First Campaign**
   - The app will prompt you on first launch
   - Or click the ⚙️ icon next to the campaign selector
   - Or navigate to "Campaigns" in the menu

2. **Add Your First NPC**
   - Click "NPCs" in the navigation
   - Click "Add NPC"
   - Fill in the details
   - Click "Save"

3. **Try the Dice Roller**
   - Press `Ctrl+5` or click "Dice Roller"
   - Click on any die (d4, d6, d8, d10, d12, d20, d100)
   - Or enter a custom roll (e.g., 2d6+3)

---

## Common Tasks

### During a Game Session

**Roll Dice**
- `Ctrl+5` → Dice Roller
- Click any die or enter custom formula

**Track Initiative**
- `Ctrl+4` → Initiative Tracker
- Add NPCs/enemies from their respective pages
- Click "Next Turn" to advance

**Quick Reference**
- Search spells, check NPC stats, look up items
- Use keyboard shortcuts to switch pages quickly

**Take Notes**
- Navigate to "Notes"
- Add session notes as you play
- Automatically timestamped

### Between Sessions

**Plan Encounters**
- Navigate to "Encounters"
- Create and plan your next combat
- Add enemies and NPCs

**Track Sessions**
- Navigate to "Sessions"
- Record session summaries
- Track session dates and highlights

**Manage Campaigns**
- Click the ⚙️ icon in navigation
- Switch between campaigns
- Export backups regularly

---

## Keyboard Shortcuts Cheat Sheet

| Shortcut | Action |
|----------|--------|
| `Ctrl+1` | Dashboard |
| `Ctrl+2` | NPCs |
| `Ctrl+3` | Enemies |
| `Ctrl+4` | Initiative |
| `Ctrl+5` | Dice Roller |
| `Ctrl+E` | Export Campaign |
| `Ctrl+I` | Import Campaign |
| `Ctrl+R` | Reload |
| `Alt+F4` | Exit |

---

## System Tray

**Minimize to Tray**
- Click the X button (app stays running)
- Or: File → Minimize to Tray

**Show from Tray**
- Click the tray icon
- Or: Right-click → Show App

**Quit Completely**
- Right-click tray icon → Quit
- Or: File → Exit

---

## Data Location

Your campaign data is stored at:

**Windows**: `C:\Users\<YourName>\AppData\Roaming\dnd-dm-toolkit\data\`

**macOS**: `~/Library/Application Support/dnd-dm-toolkit/data/`

**Linux**: `~/.config/dnd-dm-toolkit/data/`

---

## Migrating from v1.0?

If you have existing data from the web version:

```bash
npm run migrate
```

This moves your data to a default campaign automatically.

---

## Building an Installer

Want to create a distributable .exe for other DMs?

```bash
npm run dist:win
```

Output will be in the `dist/` folder:
- **Setup.exe** - Full installer
- **Portable.exe** - No installation needed

---

## Web Version (Alternative)

Prefer to use in a browser?

```bash
npm start
```

Then open: http://localhost:3000

---

## Need Help?

- **[📖 Full README](README.md)** - Complete documentation
- **[🖥️ Desktop App Guide](ELECTRON_GUIDE.md)** - Desktop-specific features
- **[🗺️ Campaign Guide](CAMPAIGN_MIGRATION_GUIDE.md)** - Campaign management details

---

## Tips for New DMs

1. **Start Small**: Create one campaign, add a few NPCs
2. **Use Tags**: Tag NPCs with "Ally", "Enemy", "Quest Giver", etc.
3. **Export Often**: Backup your campaigns regularly (Ctrl+E)
4. **Try All Features**: Explore each page to see what's available
5. **Keyboard Shortcuts**: Learn them for faster navigation during sessions

---

**Ready to start your adventure!** 🎲

Have fun DMing with your new toolkit!

