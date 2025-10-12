// Dashboard-specific JavaScript

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
