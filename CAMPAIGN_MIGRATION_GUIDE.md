# Campaign System Migration Guide

## Overview

The D&D DM Toolkit has been upgraded to support **multiple campaigns**! This allows you to manage multiple separate game sessions, each with their own NPCs, enemies, items, sessions, and more.

## What's New

### Multi-Campaign Support
- **Separate Data**: Each campaign has its own isolated data (NPCs, enemies, items, spells, sessions, encounters, notes, etc.)
- **Easy Switching**: Switch between campaigns using the dropdown selector in the navigation bar
- **Campaign Management**: Full CRUD (Create, Read, Update, Delete) operations for campaigns
- **Import/Export**: Export individual campaigns or import data between campaigns

### New Features
1. **Campaign Selector** - Dropdown in the navigation bar to quickly switch campaigns
2. **Campaign Manager** - Dedicated page (`/campaigns`) for managing all your campaigns
3. **Import Between Campaigns** - Copy NPCs, enemies, and other data from one campaign to another
4. **Campaign-Specific Exports** - Export backups for individual campaigns
5. **Active Campaign Indicator** - Visual indicator showing which campaign is currently active

## Migration Instructions

### For Existing Users

If you already have data in your D&D Toolkit, you'll need to migrate it to the new campaign structure:

#### Step 1: Stop the Server
Make sure the server is not running before migrating.

#### Step 2: Run the Migration Script
```bash
npm run migrate
```

This script will:
- Create a default campaign called "My First Campaign"
- Move all your existing data files into the new campaign structure
- Preserve all your existing NPCs, enemies, items, etc.

#### Step 3: Verify Migration
Start the server:
```bash
npm start
```

Navigate to http://localhost:3000/campaigns to verify your campaign was created successfully.

### For New Users

No migration needed! Just:
1. Start the server: `npm start`
2. Navigate to http://localhost:3000
3. Click "Create Your First Campaign"
4. Start adding your data!

## Using the Campaign System

### Creating a Campaign
1. Navigate to the **Campaigns** page (`/campaigns`)
2. Click **"Create New Campaign"**
3. Enter a name and optional description
4. Click **"Create Campaign"**

### Switching Campaigns
Use the dropdown selector in the navigation bar to switch between campaigns. The page will automatically reload with the selected campaign's data.

### Managing Campaigns
On the Campaigns page, you can:
- **Switch**: Make a campaign active
- **Edit**: Update campaign name and description
- **Import Data**: Import from another campaign or from a backup file
- **Export**: Create a backup of the campaign
- **Delete**: Remove a campaign from the list (data files are preserved)

### Importing Data Between Campaigns
1. Go to the **Campaigns** page
2. Click **"Import Data"** on the target campaign
3. Choose **"Import from Another Campaign"**
4. Select the source campaign
5. Select which data types to import (NPCs, enemies, etc.)
6. Click **"Import"**

Note: Importing will **append** data to the target campaign, not replace it.

### Exporting Campaign Data
1. Go to the **Campaigns** page
2. Click **"Export"** on the campaign you want to backup
3. A JSON file will be downloaded with all campaign data

You can also export from the Dashboard using the **"Export Backup"** button.

## File Structure

The new file structure looks like this:

```
data/
├── campaigns.json              # List of all campaigns
└── campaigns/
    ├── campaign-id-1/
    │   ├── npcs.json
    │   ├── enemies.json
    │   ├── items.json
    │   ├── spells.json
    │   ├── sessions.json
    │   ├── encounters.json
    │   ├── notes.json
    │   ├── initiative.json
    │   └── diceHistory.json
    └── campaign-id-2/
        ├── npcs.json
        └── ...
```

## API Changes

### New Endpoints

#### Campaign Management
- `GET /api/campaigns` - List all campaigns
- `POST /api/campaigns` - Create a new campaign
- `PUT /api/campaigns/:id` - Update a campaign
- `DELETE /api/campaigns/:id` - Delete a campaign

#### Campaign Data
- `GET /api/campaigns/:campaignId/data` - Get all data for a campaign
- `POST /api/campaigns/:campaignId/data` - Save data for a campaign
- `DELETE /api/campaigns/:campaignId/data/:type` - Delete data type for a campaign

#### Import/Export
- `GET /api/campaigns/:campaignId/export` - Export campaign data
- `POST /api/campaigns/:campaignId/import` - Import data to a campaign
- `POST /api/campaigns/:targetId/import/:sourceId` - Import from another campaign

### Legacy Endpoints
The old API endpoints (`/api/data`, `/api/export`, `/api/import`) are still available for backward compatibility but now require a `campaignId` parameter.

## Troubleshooting

### My data disappeared after updating
Run the migration script: `npm run migrate`

### I can't see the campaign selector
The campaign selector is automatically added by `shared.js`. Make sure all your pages include:
```html
<script src="/js/shared.js"></script>
```

### I deleted a campaign by mistake
Campaign deletion only removes the campaign from the list. Your data files are still in `data/campaigns/campaign-id/`. You can manually add the campaign back to `campaigns.json`.

### Import isn't working
Make sure:
1. Both campaigns exist
2. The source campaign has data to import
3. You selected at least one data type to import

## Best Practices

1. **Regular Backups**: Export your campaigns regularly using the Export feature
2. **Descriptive Names**: Use clear, descriptive names for your campaigns
3. **One Campaign Per Game**: Create a separate campaign for each D&D game you DM
4. **Import Strategically**: Use the import feature to reuse NPCs, enemies, or items across campaigns
5. **Clean Up**: Delete old campaigns you're no longer using to keep things organized

## Support

If you encounter any issues or have questions about the campaign system, please check the main README or create an issue on the project repository.

---

**Version**: 2.0  
**Last Updated**: October 2025

