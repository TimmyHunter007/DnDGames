# Campaign Data Directory

This directory stores all your campaign data. Each campaign has its own subdirectory with separate JSON files.

## Structure

```
data/
├── campaigns.json          # List of all your campaigns
└── campaigns/
    └── [campaign-id]/      # One folder per campaign
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

## Important Notes

- **This directory is ignored by Git** - Your campaign data is personal and won't be committed to version control
- **First Run**: If no campaigns exist, you'll be prompted to create your first campaign
- **Migration**: If you're upgrading from v1.0, run `npm run migrate` to move your data into campaign structure
- **Backups**: Use the Export feature in the app to create backups of your campaigns
- **Manual Editing**: You can edit these JSON files directly in a text editor if needed

## Data Files

Each campaign directory contains:

- **npcs.json** - Non-player characters
- **enemies.json** - Monsters and enemies
- **items.json** - Magic items and equipment
- **spells.json** - Spell lists and custom spells
- **sessions.json** - Session history and notes
- **encounters.json** - Planned encounters
- **notes.json** - General campaign notes
- **initiative.json** - Current combat initiative order
- **diceHistory.json** - Recent dice rolls

## Getting Started

1. Start the server: `npm start`
2. Visit http://localhost:3000
3. Create your first campaign
4. Start adding your D&D content!

For more information, see the main [README.md](../README.md) and [CAMPAIGN_MIGRATION_GUIDE.md](../CAMPAIGN_MIGRATION_GUIDE.md).

