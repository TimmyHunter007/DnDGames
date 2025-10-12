# Data Storage Guide

## Overview
Your D&D DM Toolkit now uses file-based storage instead of browser localStorage. All your campaign data is saved as JSON text files in the `./data/` directory.

## File Structure
```
data/
├── npcs.json         # All NPCs and characters
├── enemies.json      # All enemies and monsters
├── notes.json        # All session notes
├── items.json        # All magic items and equipment
├── initiative.json   # Current initiative order
├── diceHistory.json  # Dice roll history
└── spells.json       # All spells reference
```

## File Formats

### NPCs (npcs.json)
```json
[
  {
    "id": "unique-id",
    "name": "Character Name",
    "race": "Human",
    "class": "Wizard",
    "level": 5,
    "ac": "12",
    "hp": "32",
    "str": "8",
    "dex": "14",
    "con": "13",
    "int": "18",
    "wis": "15",
    "cha": "12",
    "description": "Character description",
    "notes": "Additional notes"
  }
]
```

### Enemies (enemies.json)
```json
[
  {
    "id": "unique-id",
    "name": "Monster Name",
    "type": "Humanoid",
    "cr": "1/2",
    "ac": "13",
    "hp": "30",
    "speed": "30 ft.",
    "str": "16",
    "dex": "12",
    "con": "16",
    "int": "7",
    "wis": "11",
    "cha": "10",
    "attacks": "Attack descriptions",
    "abilities": "Special abilities",
    "description": "Monster description"
  }
]
```

### Notes (notes.json)
```json
[
  {
    "id": "unique-id",
    "title": "Note Title",
    "content": "Note content",
    "created": "2024-01-15T10:30:00.000Z"
  }
]
```

### Items (items.json)
```json
[
  {
    "id": "unique-id",
    "name": "Item Name",
    "type": "Weapon",
    "rarity": "Rare",
    "attunement": "Yes",
    "description": "Item description",
    "effects": "Magical effects"
  }
]
```

### Initiative (initiative.json)
```json
[
  {
    "id": "unique-id",
    "name": "Character Name",
    "initiative": 15,
    "type": "PC",
    "source": "Character class",
    "current": false
  }
]
```

### Dice History (diceHistory.json)
```json
[
  {
    "id": "unique-id",
    "dice": "1d20",
    "result": 15,
    "rolls": [15],
    "modifier": 0,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
]
```

### Spells (spells.json)
```json
[
  {
    "id": "unique-id",
    "name": "Spell Name",
    "level": 1,
    "school": "Evocation",
    "classes": ["Wizard", "Sorcerer"],
    "castingTime": "1 action",
    "range": "60 feet",
    "components": "V, S, M",
    "duration": "Instantaneous",
    "description": "Spell description",
    "upgrade": "At higher levels description (optional)"
  }
]
```

## Manual Editing

You can edit these JSON files directly in any text editor:

1. **Stop the server** (Ctrl+C)
2. **Edit the JSON files** in the `./data/` directory
3. **Restart the server** (`npm start`)
4. **Refresh your browser**

## Backup and Restore

### Automatic Backup
- Use the "Export Data" button on the dashboard
- Downloads a complete backup file with all your data
- Includes timestamp and version information

### Manual Backup
- Copy the entire `./data/` directory
- All JSON files contain your complete campaign data

### Restore from Backup
- Use the "Import Data" button on the dashboard
- Select a backup JSON file
- All data will be restored

## Data Management

### Adding Data Manually
1. Edit the appropriate JSON file
2. Add new entries following the format above
3. Each entry needs a unique `id` field
4. Use timestamps for `created` fields: `new Date().toISOString()`

### Removing Data
- Delete entries from the JSON files
- Or use the delete buttons in the web interface

### Editing Data
- Modify any field in the JSON files
- Save the file and restart the server
- Changes will appear in the web interface

## Troubleshooting

### File Format Errors
- Use a JSON validator to check your syntax
- Ensure all quotes are properly escaped
- Make sure arrays and objects are properly formatted

### Data Not Loading
- Check that the server is running
- Verify file permissions on the `./data/` directory
- Check server console for error messages

### Server Won't Start
- Ensure the `./data/` directory exists
- Check that JSON files are valid
- Verify Node.js and dependencies are installed

## Advanced Usage

### Bulk Import
- Create JSON files with your data
- Copy them to the `./data/` directory
- Restart the server

### Scripting
- Write scripts to generate NPCs, enemies, or items
- Output valid JSON format
- Save directly to the appropriate files

### Version Control
- Add the `./data/` directory to your version control
- Track changes to your campaign data
- Collaborate with other DMs by sharing data files

---

**Note**: Always backup your data before making manual changes to the JSON files. The web interface is the safest way to edit data, but manual editing gives you complete control over your campaign information.
