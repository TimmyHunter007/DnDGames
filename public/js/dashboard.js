// Dashboard-specific JavaScript

// Open board window
function openBoardWindow() {
    if (window.electron && window.electron.openBoardWindow) {
        window.electron.openBoardWindow();
    } else {
        // Fallback for web version
        window.open('/board', '_blank', 'width=1200,height=900,resizable=yes,scrollbars=yes');
    }
}

// Update quick stats
function updateQuickStats() {
    // Check if we have an active campaign
    if (!activeCampaign) {
        showNoCampaignMessage();
        return;
    }
    
    document.getElementById('npc-count').textContent = currentData.npcs.length;
    document.getElementById('enemy-count').textContent = currentData.enemies.length;
    document.getElementById('note-count').textContent = currentData.notes.length;
    document.getElementById('item-count').textContent = currentData.items.length;
    
    // Update player character stats
    updatePlayerStats();
}

// Update player character statistics
function updatePlayerStats() {
    const playerStatsDiv = document.getElementById('player-stats');
    if (!playerStatsDiv) return;
    
    const characters = currentData.characters || [];
    
    if (characters.length === 0) {
        playerStatsDiv.innerHTML = '<p style="color: #b8b8b8; text-align: center; padding: 1rem;">No player characters created yet.</p>';
        return;
    }
    
    // Calculate stats
    const totalCharacters = characters.length;
    const averageLevel = characters.length > 0 ? 
        Math.round(characters.reduce((sum, char) => sum + (parseInt(char.level) || 1), 0) / characters.length * 10) / 10 : 0;
    
    const levelRange = characters.length > 0 ? {
        min: Math.min(...characters.map(char => parseInt(char.level) || 1)),
        max: Math.max(...characters.map(char => parseInt(char.level) || 1))
    } : { min: 0, max: 0 };
    
    const classes = [...new Set(characters.map(char => char.class).filter(Boolean))];
    const races = [...new Set(characters.map(char => char.race).filter(Boolean))];
    
    // Create stats display
    playerStatsDiv.innerHTML = `
        <div class="player-stats-grid">
            <div class="player-stat-item">
                <div class="player-stat-number">${totalCharacters}</div>
                <div class="player-stat-label">Total Characters</div>
            </div>
            <div class="player-stat-item">
                <div class="player-stat-number">${averageLevel}</div>
                <div class="player-stat-label">Average Level</div>
            </div>
            <div class="player-stat-item">
                <div class="player-stat-number">${levelRange.min}-${levelRange.max}</div>
                <div class="player-stat-label">Level Range</div>
            </div>
            <div class="player-stat-item">
                <div class="player-stat-number">${classes.length}</div>
                <div class="player-stat-label">Unique Classes</div>
            </div>
            <div class="player-stat-item">
                <div class="player-stat-number">${races.length}</div>
                <div class="player-stat-label">Unique Races</div>
            </div>
        </div>
        
        <div class="player-details">
            <div class="player-classes">
                <strong>Classes:</strong> ${classes.length > 0 ? classes.join(', ') : 'None'}
            </div>
            <div class="player-races">
                <strong>Races:</strong> ${races.length > 0 ? races.join(', ') : 'None'}
            </div>
        </div>
    `;
}

function showNoCampaignMessage() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <div class="empty-state" style="padding: 4rem 2rem; text-align: center;">
            <h2 style="color: #a78bfa; margin-bottom: 1rem;">Welcome to D&D DM Toolkit!</h2>
            <p style="color: #b8b8b8; margin-bottom: 2rem; font-size: 1.2rem;">
                Get started by creating your first campaign.
            </p>
            <a href="/campaigns" class="action-btn" style="text-decoration: none; display: inline-block;">
                <span>🗺️</span> Create Your First Campaign
            </a>
        </div>
    `;
}

// File management functions
async function exportData() {
    if (!activeCampaign) {
        alert('Please select a campaign first');
        return;
    }
    
    try {
        const response = await fetch(`/api/campaigns/${activeCampaign.id}/export`);
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const campaignName = activeCampaign.name.replace(/\s+/g, '-');
            a.download = `dnd-toolkit-${campaignName}-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } else {
            alert('Error exporting data');
        }
    } catch (error) {
        console.error('Export error:', error);
        alert('Error exporting data');
    }
}

function importData() {
    if (!activeCampaign) {
        alert('Please select a campaign first');
        return;
    }
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const text = await file.text();
                const importData = JSON.parse(text);
                
                if (importData.data) {
                    const response = await fetch(`/api/campaigns/${activeCampaign.id}/import`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ data: importData.data })
                    });
                    
                    if (response.ok) {
                        alert('Data imported successfully!');
                        location.reload(); // Refresh to load new data
                    } else {
                        alert('Error importing data');
                    }
                } else {
                    alert('Invalid backup file format');
                }
            } catch (error) {
                console.error('Import error:', error);
                alert('Error reading file');
            }
        }
    };
    input.click();
}

function viewDataFiles() {
    const content = `
        <h4>Data Files Location</h4>
        <p>Your data is saved in the following files in the <code>./data/</code> directory:</p>
        <ul style="text-align: left; margin: 1rem 0;">
            <li><code>npcs.json</code> - All NPCs</li>
            <li><code>enemies.json</code> - All enemies/monsters</li>
            <li><code>notes.json</code> - All session notes</li>
            <li><code>items.json</code> - All magic items</li>
            <li><code>initiative.json</code> - Current initiative order</li>
            <li><code>diceHistory.json</code> - Dice roll history</li>
        </ul>
        <p><strong>Note:</strong> These are JSON text files that you can edit directly in any text editor if needed.</p>
    `;
    showModal('Data Files Information', content);
}

async function clearAllData() {
    if (confirm('Are you sure you want to clear ALL data? This cannot be undone!')) {
        try {
            const dataTypes = ['npcs', 'enemies', 'notes', 'items', 'initiative', 'diceHistory'];
            
            for (const type of dataTypes) {
                await fetch(`/api/data/${type}`, {
                    method: 'DELETE'
                });
            }
            
            // Clear local data
            currentData = {
                npcs: [],
                enemies: [],
                notes: [],
                items: [],
                initiative: [],
                diceHistory: []
            };
            
            alert('All data cleared successfully!');
            location.reload(); // Refresh to show empty state
        } catch (error) {
            console.error('Clear data error:', error);
            alert('Error clearing data');
        }
    }
}

// Dashboard-specific initialization will be handled by shared.js
// This file just contains dashboard-specific functions
