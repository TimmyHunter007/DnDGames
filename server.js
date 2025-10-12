const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// Use Electron userData path if running in Electron, otherwise use local data folder
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const CAMPAIGNS_DIR = path.join(DATA_DIR, 'campaigns');
const CAMPAIGNS_FILE = path.join(DATA_DIR, 'campaigns.json');

// Flag to check if running in Electron
const IS_ELECTRON = process.env.ELECTRON_MODE === 'true';

// Ensure data directories exist
const ensureDataDir = async () => {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
    try {
        await fs.access(CAMPAIGNS_DIR);
    } catch {
        await fs.mkdir(CAMPAIGNS_DIR, { recursive: true });
    }
};

// Get campaign directory path
const getCampaignDir = (campaignId) => {
    return path.join(CAMPAIGNS_DIR, campaignId);
};

// Ensure campaign directory exists
const ensureCampaignDir = async (campaignId) => {
    const campaignDir = getCampaignDir(campaignId);
    try {
        await fs.access(campaignDir);
    } catch {
        await fs.mkdir(campaignDir, { recursive: true });
    }
    return campaignDir;
};

// Middleware - Increased limit to handle large spell data
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Routes for each page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

app.get('/npcs', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'npcs.html'));
});

app.get('/enemies', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'enemies.html'));
});

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'notes.html'));
});

app.get('/dice', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dice.html'));
});

app.get('/initiative', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'initiative.html'));
});

app.get('/spells', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'spells.html'));
});

app.get('/items', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'items.html'));
});

app.get('/sessions', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'sessions.html'));
});

app.get('/encounters', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'encounters.html'));
});

// Campaign Management Routes
app.get('/campaigns', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'campaigns.html'));
});

// API routes for campaign management
app.get('/api/campaigns', async (req, res) => {
    try {
        let campaigns = [];
        try {
            const content = await fs.readFile(CAMPAIGNS_FILE, 'utf8');
            campaigns = JSON.parse(content);
        } catch {
            // No campaigns file yet, return empty array
        }
        res.json(campaigns);
    } catch (error) {
        console.error('Error reading campaigns:', error);
        res.status(500).json({ error: 'Failed to read campaigns' });
    }
});

app.post('/api/campaigns', async (req, res) => {
    try {
        const campaign = req.body;
        
        // Read existing campaigns
        let campaigns = [];
        try {
            const content = await fs.readFile(CAMPAIGNS_FILE, 'utf8');
            campaigns = JSON.parse(content);
        } catch {
            // No campaigns file yet
        }
        
        // Add new campaign
        campaigns.push(campaign);
        
        // Save campaigns
        await fs.writeFile(CAMPAIGNS_FILE, JSON.stringify(campaigns, null, 2), 'utf8');
        
        // Create campaign directory
        await ensureCampaignDir(campaign.id);
        
        res.json({ success: true, campaign });
    } catch (error) {
        console.error('Error creating campaign:', error);
        res.status(500).json({ error: 'Failed to create campaign' });
    }
});

app.put('/api/campaigns/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedCampaign = req.body;
        
        // Read existing campaigns
        let campaigns = [];
        try {
            const content = await fs.readFile(CAMPAIGNS_FILE, 'utf8');
            campaigns = JSON.parse(content);
        } catch {
            return res.status(404).json({ error: 'No campaigns found' });
        }
        
        // Update campaign
        const index = campaigns.findIndex(c => c.id === id);
        if (index === -1) {
            return res.status(404).json({ error: 'Campaign not found' });
        }
        
        campaigns[index] = { ...campaigns[index], ...updatedCampaign };
        
        // Save campaigns
        await fs.writeFile(CAMPAIGNS_FILE, JSON.stringify(campaigns, null, 2), 'utf8');
        
        res.json({ success: true, campaign: campaigns[index] });
    } catch (error) {
        console.error('Error updating campaign:', error);
        res.status(500).json({ error: 'Failed to update campaign' });
    }
});

app.delete('/api/campaigns/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Read existing campaigns
        let campaigns = [];
        try {
            const content = await fs.readFile(CAMPAIGNS_FILE, 'utf8');
            campaigns = JSON.parse(content);
        } catch {
            return res.status(404).json({ error: 'No campaigns found' });
        }
        
        // Remove campaign
        campaigns = campaigns.filter(c => c.id !== id);
        
        // Save campaigns
        await fs.writeFile(CAMPAIGNS_FILE, JSON.stringify(campaigns, null, 2), 'utf8');
        
        // Optionally delete campaign directory
        // (commented out for safety - you can uncomment if you want auto-deletion)
        // const campaignDir = getCampaignDir(id);
        // await fs.rm(campaignDir, { recursive: true, force: true });
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting campaign:', error);
        res.status(500).json({ error: 'Failed to delete campaign' });
    }
});

// Import data from another campaign
app.post('/api/campaigns/:targetId/import/:sourceId', async (req, res) => {
    try {
        const { targetId, sourceId } = req.params;
        const { types } = req.body; // Array of data types to import (e.g., ['npcs', 'items'])
        
        const sourceDir = getCampaignDir(sourceId);
        const targetDir = await ensureCampaignDir(targetId);
        
        const imported = {};
        
        for (const type of types) {
            const fileName = `${type}.json`;
            const sourceFile = path.join(sourceDir, fileName);
            const targetFile = path.join(targetDir, fileName);
            
            try {
                // Read source data
                const sourceContent = await fs.readFile(sourceFile, 'utf8');
                const sourceData = JSON.parse(sourceContent);
                
                // Read target data
                let targetData = [];
                try {
                    const targetContent = await fs.readFile(targetFile, 'utf8');
                    targetData = JSON.parse(targetContent);
                } catch {
                    // Target file doesn't exist yet
                }
                
                // Merge data (append source to target)
                const mergedData = [...targetData, ...sourceData];
                
                // Save merged data
                await fs.writeFile(targetFile, JSON.stringify(mergedData, null, 2), 'utf8');
                
                imported[type] = sourceData.length;
            } catch (error) {
                console.error(`Error importing ${type}:`, error);
                imported[type] = 0;
            }
        }
        
        res.json({ success: true, imported });
    } catch (error) {
        console.error('Error importing campaign data:', error);
        res.status(500).json({ error: 'Failed to import campaign data' });
    }
});

// API routes for campaign-specific data management
app.get('/api/campaigns/:campaignId/data', async (req, res) => {
    try {
        const { campaignId } = req.params;
        const campaignDir = await ensureCampaignDir(campaignId);
        const data = {};
        const files = ['npcs.json', 'enemies.json', 'notes.json', 'items.json', 'initiative.json', 'diceHistory.json', 'spells.json', 'sessions.json', 'encounters.json'];
        
        for (const file of files) {
            const filePath = path.join(campaignDir, file);
            try {
                const content = await fs.readFile(filePath, 'utf8');
                const key = file.replace('.json', '');
                data[key] = JSON.parse(content);
            } catch {
                // File doesn't exist, use empty array
                const key = file.replace('.json', '');
                data[key] = [];
            }
        }
        
        res.json(data);
    } catch (error) {
        console.error('Error reading campaign data:', error);
        res.status(500).json({ error: 'Failed to read campaign data' });
    }
});

app.post('/api/campaigns/:campaignId/data', async (req, res) => {
    try {
        const { campaignId } = req.params;
        const { type, data } = req.body;
        const campaignDir = await ensureCampaignDir(campaignId);
        const fileName = `${type}.json`;
        const filePath = path.join(campaignDir, fileName);
        
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving campaign data:', error);
        res.status(500).json({ error: 'Failed to save campaign data' });
    }
});

app.delete('/api/campaigns/:campaignId/data/:type', async (req, res) => {
    try {
        const { campaignId, type } = req.params;
        const campaignDir = getCampaignDir(campaignId);
        const fileName = `${type}.json`;
        const filePath = path.join(campaignDir, fileName);
        
        await fs.unlink(filePath);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting campaign data:', error);
        res.status(500).json({ error: 'Failed to delete campaign data' });
    }
});

// Legacy API routes for backward compatibility (will use active campaign from session)
app.get('/api/data', async (req, res) => {
    try {
        // Try to get active campaign from query param or use first available campaign
        let campaignId = req.query.campaignId;
        
        if (!campaignId) {
            try {
                const content = await fs.readFile(CAMPAIGNS_FILE, 'utf8');
                const campaigns = JSON.parse(content);
                if (campaigns.length > 0) {
                    campaignId = campaigns[0].id;
                }
            } catch {
                // No campaigns yet, return empty data
                return res.json({
                    npcs: [],
                    enemies: [],
                    notes: [],
                    items: [],
                    initiative: [],
                    diceHistory: [],
                    spells: [],
                    sessions: [],
                    encounters: []
                });
            }
        }
        
        if (!campaignId) {
            return res.json({
                npcs: [],
                enemies: [],
                notes: [],
                items: [],
                initiative: [],
                diceHistory: [],
                spells: [],
                sessions: [],
                encounters: []
            });
        }
        
        // Redirect to campaign-specific endpoint
        const campaignDir = await ensureCampaignDir(campaignId);
        const data = {};
        const files = ['npcs.json', 'enemies.json', 'notes.json', 'items.json', 'initiative.json', 'diceHistory.json', 'spells.json', 'sessions.json', 'encounters.json'];
        
        for (const file of files) {
            const filePath = path.join(campaignDir, file);
            try {
                const content = await fs.readFile(filePath, 'utf8');
                const key = file.replace('.json', '');
                data[key] = JSON.parse(content);
            } catch {
                const key = file.replace('.json', '');
                data[key] = [];
            }
        }
        
        res.json(data);
    } catch (error) {
        console.error('Error reading data:', error);
        res.status(500).json({ error: 'Failed to read data' });
    }
});

app.post('/api/data', async (req, res) => {
    try {
        const { type, data, campaignId } = req.body;
        
        if (!campaignId) {
            return res.status(400).json({ error: 'Campaign ID required' });
        }
        
        const campaignDir = await ensureCampaignDir(campaignId);
        const fileName = `${type}.json`;
        const filePath = path.join(campaignDir, fileName);
        
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.delete('/api/data/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const { campaignId } = req.query;
        
        if (!campaignId) {
            return res.status(400).json({ error: 'Campaign ID required' });
        }
        
        const campaignDir = getCampaignDir(campaignId);
        const fileName = `${type}.json`;
        const filePath = path.join(campaignDir, fileName);
        
        await fs.unlink(filePath);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting data:', error);
        res.status(500).json({ error: 'Failed to delete data' });
    }
});

// Campaign-specific export
app.get('/api/campaigns/:campaignId/export', async (req, res) => {
    try {
        const { campaignId } = req.params;
        const campaignDir = getCampaignDir(campaignId);
        const allData = {};
        const files = ['npcs.json', 'enemies.json', 'notes.json', 'items.json', 'initiative.json', 'diceHistory.json', 'spells.json', 'sessions.json', 'encounters.json'];
        
        // Get campaign info
        let campaignName = campaignId;
        try {
            const content = await fs.readFile(CAMPAIGNS_FILE, 'utf8');
            const campaigns = JSON.parse(content);
            const campaign = campaigns.find(c => c.id === campaignId);
            if (campaign) {
                campaignName = campaign.name;
            }
        } catch {
            // Ignore
        }
        
        for (const file of files) {
            const filePath = path.join(campaignDir, file);
            try {
                const content = await fs.readFile(filePath, 'utf8');
                const key = file.replace('.json', '');
                allData[key] = JSON.parse(content);
            } catch {
                // File doesn't exist, use empty array
                const key = file.replace('.json', '');
                allData[key] = [];
            }
        }
        
        const exportData = {
            exportDate: new Date().toISOString(),
            version: '2.0',
            campaignId: campaignId,
            campaignName: campaignName,
            data: allData
        };
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="dnd-toolkit-${campaignName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json"`);
        res.json(exportData);
    } catch (error) {
        console.error('Error exporting campaign data:', error);
        res.status(500).json({ error: 'Failed to export campaign data' });
    }
});

// Campaign-specific import
app.post('/api/campaigns/:campaignId/import', async (req, res) => {
    try {
        const { campaignId } = req.params;
        const { data } = req.body;
        const campaignDir = await ensureCampaignDir(campaignId);
        
        for (const [type, items] of Object.entries(data)) {
            const fileName = `${type}.json`;
            const filePath = path.join(campaignDir, fileName);
            await fs.writeFile(filePath, JSON.stringify(items, null, 2), 'utf8');
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error importing campaign data:', error);
        res.status(500).json({ error: 'Failed to import campaign data' });
    }
});

// Legacy export (exports first campaign for backward compatibility)
app.get('/api/export', async (req, res) => {
    try {
        const campaignId = req.query.campaignId;
        
        if (!campaignId) {
            // Try to get first campaign
            try {
                const content = await fs.readFile(CAMPAIGNS_FILE, 'utf8');
                const campaigns = JSON.parse(content);
                if (campaigns.length > 0) {
                    return res.redirect(`/api/campaigns/${campaigns[0].id}/export`);
                }
            } catch {
                // No campaigns
            }
        } else {
            return res.redirect(`/api/campaigns/${campaignId}/export`);
        }
        
        // No campaigns, return empty export
        const exportData = {
            exportDate: new Date().toISOString(),
            version: '2.0',
            data: {
                npcs: [],
                enemies: [],
                notes: [],
                items: [],
                initiative: [],
                diceHistory: [],
                spells: [],
                sessions: [],
                encounters: []
            }
        };
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="dnd-toolkit-backup-${new Date().toISOString().split('T')[0]}.json"`);
        res.json(exportData);
    } catch (error) {
        console.error('Error exporting data:', error);
        res.status(500).json({ error: 'Failed to export data' });
    }
});

// Legacy import
app.post('/api/import', async (req, res) => {
    try {
        const { data, campaignId } = req.body;
        
        if (!campaignId) {
            return res.status(400).json({ error: 'Campaign ID required' });
        }
        
        const campaignDir = await ensureCampaignDir(campaignId);
        
        for (const [type, items] of Object.entries(data)) {
            const fileName = `${type}.json`;
            const filePath = path.join(campaignDir, fileName);
            await fs.writeFile(filePath, JSON.stringify(items, null, 2), 'utf8');
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error importing data:', error);
        res.status(500).json({ error: 'Failed to import data' });
    }
});

// Start server
const startServer = async () => {
    await ensureDataDir();
    console.log(`📁 Data directory: ${DATA_DIR}`);
    console.log(`🗺️  Campaigns directory: ${CAMPAIGNS_DIR}`);
    
    if (IS_ELECTRON) {
        console.log(`🖥️  Running in Electron mode`);
    }
    
    const server = app.listen(PORT, () => {
        console.log(`🎲 D&D DM Toolkit running on http://localhost:${PORT}`);
        
        if (!IS_ELECTRON) {
            // Only show all URLs when running standalone
            console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
            console.log(`🗺️  Campaigns: http://localhost:${PORT}/campaigns`);
            console.log(`👥 NPCs: http://localhost:${PORT}/npcs`);
            console.log(`⚔️ Enemies: http://localhost:${PORT}/enemies`);
            console.log(`📝 Notes: http://localhost:${PORT}/notes`);
            console.log(`🎲 Dice: http://localhost:${PORT}/dice`);
            console.log(`⚡ Initiative: http://localhost:${PORT}/initiative`);
            console.log(`🔮 Spells: http://localhost:${PORT}/spells`);
            console.log(`🏆 Items: http://localhost:${PORT}/items`);
        }
        
        console.log(`💾 Campaign data will be saved to: ${CAMPAIGNS_DIR}`);
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('🛑 SIGTERM received, closing server...');
        server.close(() => {
            console.log('✅ Server closed');
            process.exit(0);
        });
    });
    
    process.on('SIGINT', () => {
        console.log('🛑 SIGINT received, closing server...');
        server.close(() => {
            console.log('✅ Server closed');
            process.exit(0);
        });
    });
    
    return server;
};

startServer().catch(console.error);
