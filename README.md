# D&D DM Toolkit - Node.js Version

A comprehensive web application designed specifically for Dungeon Masters to manage their D&D campaigns. Each feature has its own dedicated page for better organization and user experience.

## Features

### 🏠 Dashboard (`/dashboard`)
- Quick access to common actions
- Recent notes display
- Active initiative tracking
- Quick stats overview

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

## Installation & Setup

### Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```

3. **Access the Application**
   Open your web browser and go to: `http://localhost:3000`

### Development Mode (Optional)
If you want to use auto-restart during development:
```bash
npm install -g nodemon
npm run dev
```

## Project Structure

```
dnd-toolkit/
├── server.js              # Express server and routing
├── package.json           # Node.js dependencies and scripts
├── README.md             # This file
├── views/                # HTML pages
│   ├── dashboard.html    # Main dashboard
│   ├── npcs.html        # NPC management
│   ├── enemies.html     # Enemy management
│   ├── notes.html       # Session notes
│   ├── dice.html        # Dice roller
│   ├── initiative.html  # Initiative tracker
│   ├── spells.html      # Spell reference
│   └── items.html       # Magic items
└── public/              # Static assets
    ├── css/
    │   └── styles.css   # Shared styling
    └── js/
        ├── shared.js    # Common functionality
        ├── dashboard.js # Dashboard-specific code
        ├── npcs.js      # NPC management
        ├── enemies.js   # Enemy management
        ├── notes.js     # Notes management
        ├── dice.js      # Dice rolling
        ├── initiative.js # Initiative tracking
        ├── spells.js    # Spell reference
        └── items.js     # Item management
```

## Technical Details

### Data Storage
- **File-Based Storage**: All data is saved as JSON text files in the `./data/` directory
- **Editable Files**: You can directly edit the JSON files in any text editor
- **No Database Required**: Everything runs with simple file storage
- **Data Persistence**: Your data persists between sessions and server restarts
- **Export/Import**: Built-in backup and restore functionality
- **File Structure**:
  - `npcs.json` - All NPCs
  - `enemies.json` - All enemies/monsters  
  - `notes.json` - All session notes
  - `items.json` - All magic items
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
3. Start creating NPCs, enemies, and notes
4. All data is automatically saved to your browser's local storage

### Navigation
- Use the navigation bar to switch between different sections
- Each page is dedicated to a specific function
- The dashboard provides quick access to common tasks

### Data Management
- All data is automatically saved to JSON files when you make changes
- Data persists between browser sessions and server restarts
- Files are stored in the `./data/` directory
- You can edit the JSON files directly in any text editor
- Use the "Export Data" button to create backup files
- Use the "Import Data" button to restore from backup files
- Use the "Clear All Data" button to reset everything

### Keyboard Shortcuts
- **Escape**: Close any open modal
- **Enter**: Submit forms (when focused on input fields)

## API Endpoints

The server provides the following routes:

### Page Routes
- `GET /` - Redirects to dashboard
- `GET /dashboard` - Dashboard page
- `GET /npcs` - NPCs management page
- `GET /enemies` - Enemies management page
- `GET /notes` - Notes management page
- `GET /dice` - Dice roller page
- `GET /initiative` - Initiative tracker page
- `GET /spells` - Spell reference page
- `GET /items` - Items management page

### Data API Routes
- `GET /api/data` - Get all data from files
- `POST /api/data` - Save data to specific file (body: `{type: "npcs", data: [...]}`)
- `DELETE /api/data/:type` - Delete specific data file
- `GET /api/export` - Export all data as downloadable backup file
- `POST /api/import` - Import data from backup file

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

### Session Preparation
1. Create NPCs your players will meet
2. Set up potential enemies for encounters
3. Write session notes with key plot points
4. Prepare magic items as rewards

### During Sessions
1. Use the dashboard for quick dice rolls
2. Track initiative for combat encounters
3. Reference spells and items quickly
4. Take notes on player actions and decisions

### Between Sessions
1. Review and update notes
2. Plan future encounters and NPCs
3. Create new magic items and rewards
4. Update NPC motivations and goals

## Troubleshooting

### Server Won't Start
- Make sure Node.js is installed: `node --version`
- Check if port 3000 is available
- Try a different port by setting `PORT` environment variable

### Data Not Saving
- Check that your browser supports localStorage
- Ensure you're not in private/incognito mode
- Clear browser cache if issues persist

### Performance Issues
- Clear old dice roll history if it gets too long
- Remove unused NPCs/enemies to keep lists manageable
- Refresh the page if the interface becomes sluggish

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
- Database integration for team sharing

---

**Happy DMing!** 🎲⚔️🐉

This toolkit is designed to make your D&D sessions smoother and more organized. Each feature has its own dedicated page for better focus and usability during gameplay.