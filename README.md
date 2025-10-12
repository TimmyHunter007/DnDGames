# D&D DM Toolkit

A comprehensive application designed specifically for Dungeon Masters to manage multiple D&D campaigns. Available as both a **web application** and a **standalone desktop app**.

## 🖥️ Desktop Edition Available!

This toolkit is now available as a **native desktop application** using Electron! Features include:
- ✅ No browser required - standalone app window
- ✅ System tray integration for quick access
- ✅ Keyboard shortcuts for all major functions
- ✅ Always-on-top mode for reference during games
- ✅ Native menus and desktop feel
- ✅ Portable .exe available (no installation needed)

**[📖 Desktop App Guide](ELECTRON_GUIDE.md)** | **[🌐 Web Version Guide](README.md#installation--setup)**

---

## Overview

A comprehensive toolkit designed specifically for Dungeon Masters to manage multiple D&D campaigns. Each campaign has its own isolated data, and each feature has its own dedicated page for better organization and user experience.

## ✨ New: Multi-Campaign Support!

Manage multiple D&D campaigns simultaneously! Each campaign maintains completely separate data:
- **Campaign Selector**: Quick dropdown in the navigation bar to switch between campaigns
- **Campaign Manager**: Dedicated page to create, edit, and manage campaigns
- **Data Isolation**: Each campaign has its own NPCs, enemies, items, sessions, and more
- **Import/Export**: Share data between campaigns or create backups
- **Easy Migration**: Automatic migration of existing data to campaign structure

## Features

### 🏠 Dashboard (`/dashboard`)
- Quick access to common actions
- Recent notes display
- Active initiative tracking
- Quick stats overview
- Campaign-specific data display

### 🗺️ Campaign Manager (`/campaigns`)
- Create and manage multiple campaigns
- Switch between campaigns instantly
- Import data from other campaigns
- Export campaign backups
- Edit campaign details

### 👥 NPCs (`/npcs`)
- Create and manage NPCs with full stat blocks
- Store race, class, level, abilities, and descriptions
- Add custom notes for each NPC
- Quick access to add NPCs to initiative

### ⚔️ Enemies (`/enemies`)
- Create custom enemies and monsters
- Store challenge rating, AC, HP, and abilities
- Track attacks and special abilities
- Easy integration with initiative tracker

### 📝 Notes (`/notes`)
- Create and organize session notes
- Timestamp tracking for all notes
- Quick access to recent notes on dashboard
- Rich text support for detailed descriptions

### 🎲 Dice Roller (`/dice`)
- Roll any dice combination (1-10 dice of any type)
- Support for d4, d6, d8, d10, d12, d20, d100
- Add modifiers to rolls
- Complete roll history with timestamps
- Quick roll buttons for common dice

### ⚡ Initiative Tracker (`/initiative`)
- Add NPCs, enemies, and PCs to combat
- Automatic sorting by initiative score
- Current turn highlighting
- Next turn functionality
- Easy removal and management

### 🔮 Spells (`/spells`)
- Built-in spell database with common spells
- Search functionality to find spells quickly
- Detailed spell information including:
  - Level and school
  - Casting time and range
  - Duration and effects
  - Full descriptions

### 🏆 Magic Items (`/items`)
- Create and manage magic items
- Track item types, rarity, and attunement
- Store detailed descriptions and effects
- Organize by category (weapon, armor, potion, etc.)

### 📅 Session Tracker (`/sessions`)
- Track session dates and durations
- Record session summaries and highlights
- Link sessions to specific campaigns

### 🎯 Encounter Manager (`/encounters`)
- Create and manage combat encounters
- Track monsters and NPCs in encounters
- Plan difficulty levels and rewards

## Installation & Setup

### Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Migrate Existing Data (if upgrading from v1.0)**
   ```bash
   npm run migrate
   ```
   This will move your existing data into a default campaign.

### Running the Application

#### Option 1: Desktop App (Recommended) 🖥️
```bash
npm run electron
```
Launches as a standalone desktop application with system tray and keyboard shortcuts.

**[📖 See Desktop App Guide for more details](ELECTRON_GUIDE.md)**

#### Option 2: Web Version 🌐
```bash
npm start
```
Then open your web browser and go to: `http://localhost:3000`

### Building Desktop Installers

**Windows Installer & Portable .exe:**
```bash
npm run dist:win
```
Creates installable `.exe` and portable `.exe` in the `dist/` folder.

**All Platforms:**
```bash
npm run dist
```

### Development Mode (Optional)
If you want to use auto-restart during development:
```bash
npm install -g nodemon
npm run dev
```

## Project Structure

```
dnd-toolkit/
├── server.js                    # Express server and routing
├── package.json                 # Node.js dependencies and scripts
├── migrate-to-campaigns.js      # Data migration script
├── README.md                    # This file
├── CAMPAIGN_MIGRATION_GUIDE.md  # Campaign system documentation
├── views/                       # HTML pages
│   ├── dashboard.html           # Main dashboard
│   ├── campaigns.html           # Campaign manager
│   ├── npcs.html               # NPC management
│   ├── enemies.html            # Enemy management
│   ├── notes.html              # Session notes
│   ├── dice.html               # Dice roller
│   ├── initiative.html         # Initiative tracker
│   ├── spells.html             # Spell reference
│   ├── items.html              # Magic items
│   ├── sessions.html           # Session tracker
│   └── encounters.html         # Encounter manager
├── public/                     # Static assets
│   ├── css/
│   │   └── styles.css          # Shared styling
│   └── js/
│       ├── shared.js           # Common functionality + campaign management
│       ├── campaigns.js        # Campaign management
│       ├── dashboard.js        # Dashboard-specific code
│       ├── npcs.js             # NPC management
│       ├── enemies.js          # Enemy management
│       ├── notes.js            # Notes management
│       ├── dice.js             # Dice rolling
│       ├── initiative.js       # Initiative tracking
│       ├── spells.js           # Spell reference
│       ├── items.js            # Item management
│       ├── sessions.js         # Session tracking
│       └── encounters.js       # Encounter management
└── data/                       # Data storage
    ├── campaigns.json          # Campaign list
    └── campaigns/              # Campaign-specific data
        └── [campaign-id]/
            ├── npcs.json
            ├── enemies.json
            ├── items.json
            ├── spells.json
            ├── sessions.json
            ├── encounters.json
            ├── notes.json
            ├── initiative.json
            └── diceHistory.json
```

## Technical Details

### Data Storage
- **Campaign-Based Storage**: All data is organized by campaign in `./data/campaigns/`
- **File-Based Storage**: Each campaign stores data as JSON text files
- **Editable Files**: You can directly edit the JSON files in any text editor
- **No Database Required**: Everything runs with simple file storage
- **Data Persistence**: Your data persists between sessions and server restarts
- **Complete Isolation**: Each campaign has completely separate data
- **Export/Import**: Built-in backup and restore functionality per campaign
- **Campaign Structure**:
  - `campaigns.json` - List of all campaigns
  - `campaigns/[campaign-id]/` - Individual campaign data folders
    - `npcs.json` - Campaign NPCs
    - `enemies.json` - Campaign enemies/monsters  
    - `notes.json` - Session notes
    - `items.json` - Magic items
    - `spells.json` - Spell lists
    - `sessions.json` - Session history
    - `encounters.json` - Planned encounters
    - `initiative.json` - Current initiative order
    - `diceHistory.json` - Dice roll history

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design works on desktop and mobile
- JavaScript must be enabled

### Server Information
- **Port**: 3000 (default)
- **Framework**: Express.js
- **Static Files**: Served from `/public` directory
- **Routes**: Each page has its own route (e.g., `/npcs`, `/enemies`)

## Usage Instructions

### Getting Started
1. Run `npm start` to start the server
2. Open `http://localhost:3000` in your browser
3. Create your first campaign (or migrate existing data with `npm run migrate`)
4. Start adding NPCs, enemies, and notes
5. All data is automatically saved to campaign-specific JSON files

### Managing Campaigns
1. **Switch Campaigns**: Use the dropdown selector in the navigation bar
2. **Create New Campaign**: Go to `/campaigns` and click "Create New Campaign"
3. **Edit Campaign**: Click "Edit" on any campaign card
4. **Import Data**: Share NPCs, enemies, and items between campaigns
5. **Export Campaign**: Download complete campaign backups as JSON files

### Navigation
- Use the navigation bar to switch between different sections
- Each page is dedicated to a specific function
- The dashboard provides quick access to common tasks

### Data Management
- All data is automatically saved to campaign-specific JSON files
- Data persists between browser sessions and server restarts
- Files are stored in `./data/campaigns/[campaign-id]/` directories
- You can edit the JSON files directly in any text editor
- Each campaign can be exported individually as a backup file
- Import data from backup files or copy between campaigns
- Campaign selector remembers your last active campaign
- Safe deletion: removing a campaign doesn't delete its data files

### Keyboard Shortcuts

#### Web Version
- **Escape**: Close any open modal
- **Enter**: Submit forms (when focused on input fields)

#### Desktop App (Additional Shortcuts)
- **Ctrl+1-5**: Quick navigation (Dashboard, NPCs, Enemies, Initiative, Dice)
- **Ctrl+E**: Export campaign
- **Ctrl+I**: Import campaign
- **Ctrl+R**: Reload
- **Ctrl+Shift+I**: Developer tools
- **Ctrl+M**: Minimize window
- **Alt+F4**: Exit

**[See full keyboard shortcuts list](ELECTRON_GUIDE.md#keyboard-shortcuts)**

## API Endpoints

The server provides the following routes:

### Page Routes
- `GET /` - Redirects to dashboard
- `GET /dashboard` - Dashboard page
- `GET /campaigns` - Campaign manager page
- `GET /npcs` - NPCs management page
- `GET /enemies` - Enemies management page
- `GET /notes` - Notes management page
- `GET /dice` - Dice roller page
- `GET /initiative` - Initiative tracker page
- `GET /spells` - Spell reference page
- `GET /items` - Items management page
- `GET /sessions` - Session tracker page
- `GET /encounters` - Encounter manager page

### Campaign API Routes
- `GET /api/campaigns` - List all campaigns
- `POST /api/campaigns` - Create new campaign
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign
- `GET /api/campaigns/:campaignId/data` - Get campaign data
- `POST /api/campaigns/:campaignId/data` - Save campaign data
- `GET /api/campaigns/:campaignId/export` - Export campaign
- `POST /api/campaigns/:campaignId/import` - Import to campaign
- `POST /api/campaigns/:targetId/import/:sourceId` - Copy between campaigns

## Customization

### Adding More Spells
Edit the `loadSpells()` function in `public/js/shared.js` to add more spells to the reference database.

### Modifying the Theme
Edit `public/css/styles.css` to customize colors, fonts, and layout:
- Primary colors: `#8b4513` (brown), `#d4af37` (gold)
- Background: Dark gradient from `#1a1a2e` to `#0f3460`
- Fonts: Cinzel (headings), Crimson Text (body)

### Adding New Pages
1. Create new HTML file in `views/` directory
2. Add route in `server.js`
3. Create corresponding JavaScript file in `public/js/`
4. Add navigation link to all pages

## Tips for DMs

### Campaign Organization
1. Create separate campaigns for each game you run
2. Use descriptive campaign names (e.g., "Curse of Strahd - Fall 2025")
3. Export campaign backups regularly
4. Import common NPCs/enemies between campaigns to save time

### Session Preparation
1. Switch to the correct campaign before starting
2. Create NPCs your players will meet
3. Set up potential enemies for encounters
4. Write session notes with key plot points
5. Prepare magic items as rewards
6. Log the session in the session tracker

### During Sessions
1. Use the dashboard for quick dice rolls
2. Track initiative for combat encounters
3. Reference spells and items quickly
4. Take notes on player actions and decisions
5. Update session notes in real-time

### Between Sessions
1. Review and update session summaries
2. Plan future encounters and NPCs
3. Create new magic items and rewards
4. Update NPC motivations and goals
5. Keep campaign data backed up

## Troubleshooting

### Server Won't Start
- Make sure Node.js is installed: `node --version`
- Check if port 3000 is available
- Try a different port by setting `PORT` environment variable

### Data Not Saving
- Ensure you have an active campaign selected
- Check that the `data/campaigns/` directory is writable
- Verify campaign files exist in the correct directory
- Check browser console for error messages

### Performance Issues
- Clear old dice roll history if it gets too long
- Remove unused NPCs/enemies to keep lists manageable
- Refresh the page if the interface becomes sluggish

## Version History

### v2.0 - Multi-Campaign Support & Desktop Edition
- **🖥️ Desktop Application**: Electron-based standalone app for Windows, Mac, and Linux
- **System Tray Integration**: Minimize to tray, quick access
- **Keyboard Shortcuts**: Full desktop shortcuts for all functions
- **Campaign Management**: Create and manage multiple campaigns
- **Campaign-based Data Isolation**: Each campaign has separate data
- **Import/Export**: Per-campaign or between campaigns
- **Campaign Selector**: Quick dropdown in navigation
- **Data Migration Tool**: Automated migration from v1.0
- **Portable .exe**: No-installation option for Windows

### v1.0 - Initial Release
- Basic NPC, enemy, and item management
- Dice roller and initiative tracker
- Session notes
- Spell reference
- File-based storage
- Web-only version

## Future Enhancements

Potential features that could be added:
- Character sheet integration
- Campaign timeline tracking
- Random encounter generators
- Weather and environment tracking
- Player character management
- Experience point tracking
- Loot generators
- Map integration
- Multi-user support with authentication
- Campaign sharing between DMs

## Additional Documentation

- **[🖥️ Desktop App Guide](ELECTRON_GUIDE.md)** - Complete guide for the Electron desktop edition
- **[Campaign Migration Guide](CAMPAIGN_MIGRATION_GUIDE.md)** - Detailed guide for upgrading to v2.0
- **[Data Storage Guide](DATA_STORAGE.md)** - Information about data structure
- **[Web Interface Guide](WEB_INTERFACE_GUIDE.md)** - Detailed UI usage instructions

---

**Happy DMing!** 🎲⚔️🐉

This toolkit is designed to make your D&D sessions smoother and more organized. With multi-campaign support, you can now manage all your games in one place while keeping data completely separate. Each feature has its own dedicated page for better focus and usability during gameplay.