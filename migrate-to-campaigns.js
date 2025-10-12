/**
 * Migration Script: Move existing data to a default campaign
 * 
 * This script will:
 * 1. Check if campaigns.json exists
 * 2. Create a default campaign if no campaigns exist
 * 3. Move existing data files to the default campaign directory
 */

const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const CAMPAIGNS_DIR = path.join(DATA_DIR, 'campaigns');
const CAMPAIGNS_FILE = path.join(DATA_DIR, 'campaigns.json');
const DEFAULT_CAMPAIGN_ID = 'default-campaign-' + Date.now();

const DATA_FILES = [
    'npcs.json',
    'enemies.json',
    'notes.json',
    'items.json',
    'initiative.json',
    'diceHistory.json',
    'spells.json',
    'sessions.json',
    'encounters.json'
];

async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

async function migrate() {
    console.log('🔄 Starting migration to campaign-based structure...\n');
    
    // 1. Ensure campaigns directory exists
    try {
        await fs.mkdir(CAMPAIGNS_DIR, { recursive: true });
        console.log('✓ Campaigns directory created/verified');
    } catch (error) {
        console.error('✗ Error creating campaigns directory:', error);
        return;
    }
    
    // 2. Check if campaigns.json exists
    const campaignsExist = await fileExists(CAMPAIGNS_FILE);
    let campaigns = [];
    let defaultCampaign = null;
    
    if (campaignsExist) {
        try {
            const content = await fs.readFile(CAMPAIGNS_FILE, 'utf8');
            campaigns = JSON.parse(content);
            console.log(`✓ Found ${campaigns.length} existing campaign(s)`);
            
            if (campaigns.length > 0) {
                console.log('\n⚠️  Campaigns already exist. Migration may have already been run.');
                console.log('   Existing campaigns:');
                campaigns.forEach(c => console.log(`   - ${c.name} (${c.id})`));
                
                const readline = require('readline').createInterface({
                    input: process.stdin,
                    output: process.stdout
                });
                
                return new Promise((resolve) => {
                    readline.question('\n   Continue anyway? (yes/no): ', async (answer) => {
                        readline.close();
                        if (answer.toLowerCase() !== 'yes') {
                            console.log('\n✗ Migration cancelled by user');
                            resolve();
                            return;
                        }
                        await continueWithMigration();
                        resolve();
                    });
                });
            }
        } catch (error) {
            console.log('⚠️  Error reading campaigns.json, will create new one');
        }
    }
    
    await continueWithMigration();
}

async function continueWithMigration() {
    let campaigns = [];
    
    // Check if campaigns file exists and read it
    const campaignsExist = await fileExists(CAMPAIGNS_FILE);
    if (campaignsExist) {
        try {
            const content = await fs.readFile(CAMPAIGNS_FILE, 'utf8');
            campaigns = JSON.parse(content);
        } catch (error) {
            console.log('⚠️  Error reading existing campaigns');
        }
    }
    
    // 3. Create default campaign if no campaigns exist
    let defaultCampaign;
    if (campaigns.length === 0) {
        defaultCampaign = {
            id: DEFAULT_CAMPAIGN_ID,
            name: 'My First Campaign',
            description: 'Default campaign created from existing data',
            createdDate: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };
        
        campaigns.push(defaultCampaign);
        
        await fs.writeFile(CAMPAIGNS_FILE, JSON.stringify(campaigns, null, 2), 'utf8');
        console.log('✓ Created default campaign: "My First Campaign"');
    } else {
        defaultCampaign = campaigns[0];
        console.log(`✓ Using existing campaign: "${defaultCampaign.name}"`);
    }
    
    // 4. Create campaign directory
    const campaignDir = path.join(CAMPAIGNS_DIR, defaultCampaign.id);
    try {
        await fs.mkdir(campaignDir, { recursive: true });
        console.log(`✓ Created campaign directory: ${defaultCampaign.id}`);
    } catch (error) {
        console.error('✗ Error creating campaign directory:', error);
        return;
    }
    
    // 5. Move existing data files to campaign directory
    console.log('\n📦 Moving data files to campaign directory...');
    let movedCount = 0;
    let skippedCount = 0;
    
    for (const fileName of DATA_FILES) {
        const oldPath = path.join(DATA_DIR, fileName);
        const newPath = path.join(campaignDir, fileName);
        
        if (await fileExists(oldPath)) {
            try {
                // Check if file already exists in new location
                if (await fileExists(newPath)) {
                    console.log(`⚠️  ${fileName} already exists in campaign directory, skipping`);
                    skippedCount++;
                } else {
                    // Copy file to new location
                    const content = await fs.readFile(oldPath, 'utf8');
                    await fs.writeFile(newPath, content, 'utf8');
                    console.log(`✓ Moved ${fileName}`);
                    movedCount++;
                    
                    // Delete old file
                    await fs.unlink(oldPath);
                }
            } catch (error) {
                console.error(`✗ Error moving ${fileName}:`, error.message);
            }
        } else {
            console.log(`⚠️  ${fileName} not found in old location, skipping`);
        }
    }
    
    // 6. Summary
    console.log('\n' + '='.repeat(50));
    console.log('✨ Migration Complete!');
    console.log('='.repeat(50));
    console.log(`Campaign: ${defaultCampaign.name}`);
    console.log(`Campaign ID: ${defaultCampaign.id}`);
    console.log(`Files moved: ${movedCount}`);
    console.log(`Files skipped: ${skippedCount}`);
    console.log(`\nYour data is now organized under campaigns!`);
    console.log(`Start the server to access your campaign data.`);
    console.log('='.repeat(50));
}

// Run migration
migrate().catch(error => {
    console.error('\n✗ Migration failed:', error);
    process.exit(1);
});

