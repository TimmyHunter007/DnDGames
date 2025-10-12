# Web Interface Guide

## Complete Web-Based Management

Your D&D DM Toolkit now provides **complete web-based management** of all your campaign data. You can create, edit, and delete everything directly from the web interface without ever needing to manually edit files.

## What You Can Do From the Web Interface

### 🏠 Dashboard
- **View Quick Stats** - See counts of NPCs, enemies, notes, and items
- **Export Data** - Download complete backup files
- **Import Data** - Restore from backup files
- **Clear All Data** - Reset everything with confirmation
- **View Recent Activity** - See recent notes and active initiative

### 👥 NPCs Page
- **Create New NPCs** - Click "Add New NPC" button
- **Edit Existing NPCs** - Click "Edit" button on any NPC
- **Delete NPCs** - Click "Delete" button with confirmation
- **Add to Initiative** - Click "Add to Initiative" button

### ⚔️ Enemies Page
- **Create New Enemies** - Click "Add New Enemy" button
- **Edit Existing Enemies** - Click "Edit" button on any enemy
- **Delete Enemies** - Click "Delete" button with confirmation
- **Add to Initiative** - Click "Add to Initiative" button

### 📝 Notes Page
- **Create New Notes** - Click "Add New Note" button
- **Edit Existing Notes** - Click "Edit" button on any note
- **Delete Notes** - Click "Delete" button with confirmation
- **View All Notes** - Browse all your session notes

### 🎲 Dice Roller Page
- **Roll Any Dice** - Use the custom dice roller
- **View Roll History** - See all previous rolls
- **Quick Rolls** - Use dashboard quick action buttons

### ⚡ Initiative Tracker Page
- **Add Creatures** - Click "Add to Initiative" button
- **Edit Initiative** - Add NPCs/enemies directly from their pages
- **Manage Combat** - Sort, next turn, clear all
- **Track Current Turn** - Visual indicators for current turn

### 🔮 Spells Page
- **Search Spells** - Use the search box to find spells
- **Reference Information** - View spell details and descriptions

### 🏆 Items Page
- **Create New Items** - Click "Add New Item" button
- **Edit Existing Items** - Click "Edit" button on any item
- **Delete Items** - Click "Delete" button with confirmation
- **Organize by Type** - Filter by weapon, armor, potion, etc.

## How Everything Works

### Automatic Saving
- **No Manual Save Required** - Everything saves automatically when you make changes
- **File-Based Storage** - Data is saved to JSON files in the `./data/` directory
- **Real-Time Updates** - Changes appear immediately in the interface
- **Persistent Data** - Everything survives server restarts and browser sessions

### Data Flow
1. **You make changes** in the web interface
2. **JavaScript updates** the local data structure
3. **Automatic API call** saves data to JSON files
4. **Files are updated** on the server
5. **Changes are visible** immediately

### No File Editing Required
- **Everything is web-based** - No need to manually edit JSON files
- **User-friendly forms** - Easy-to-use forms for all data types
- **Validation** - Required fields are enforced
- **Error handling** - Graceful error handling for network issues

## Getting Started

### 1. Start the Server
```bash
npm start
```

### 2. Open Your Browser
Go to: `http://localhost:3000`

### 3. Start Creating Content
- Click "Add New NPC" to create your first NPC
- Click "Add New Enemy" to create your first monster
- Click "Add New Note" to write your first session note
- Click "Add New Item" to create your first magic item

### 4. Everything Saves Automatically
- No need to manually save anything
- Data is automatically saved to files
- You can continue working without worrying about losing data

## Backup and Restore

### Automatic Backup
- Use the "Export Data" button on the dashboard
- Downloads a complete backup file
- Includes all NPCs, enemies, notes, items, initiative, and dice history

### Restore from Backup
- Use the "Import Data" button on the dashboard
- Select a backup file to restore
- All data will be replaced with the backup data

### Manual Backup (Optional)
- Copy the `./data/` directory
- All JSON files contain your complete campaign data
- Can be restored by copying files back

## Tips for Best Experience

### Creating Content
- **Fill out all fields** for complete character/enemy information
- **Use descriptive names** for easy identification
- **Add notes** for additional context and reminders

### Managing Combat
- **Add NPCs to initiative** before combat starts
- **Use "Sort by Initiative"** to organize turn order
- **Use "Next Turn"** to advance through combat
- **Clear initiative** when combat ends

### Organizing Notes
- **Use descriptive titles** for easy searching
- **Date your sessions** in note titles
- **Include important NPCs** and plot points
- **Reference other content** by name

### Managing Items
- **Specify item types** for better organization
- **Include rarity** for campaign balance
- **Describe effects clearly** for player understanding
- **Note attunement requirements**

## Troubleshooting

### Data Not Saving
- Check that the server is running
- Refresh the page and try again
- Check browser console for error messages

### Changes Not Appearing
- Refresh the page to reload data from server
- Check that the server is running
- Verify network connection

### Can't Create New Items
- Make sure required fields are filled
- Check browser console for validation errors
- Try refreshing the page

---

**Everything is designed to be web-based and user-friendly!** You never need to manually edit files or worry about data storage. Just use the web interface and everything will be automatically saved and managed for you.
