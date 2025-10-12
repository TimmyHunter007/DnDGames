// Campaign Management JavaScript

function loadCampaignsPage() {
    displayCampaigns();
}

function displayCampaigns() {
    const container = document.getElementById('campaigns-list');
    if (!container) return;
    
    if (campaigns.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No Campaigns Yet</h3>
                <p>Create your first campaign to get started!</p>
                <button class="action-btn" onclick="showCreateCampaignModal()">
                    <span>➕</span> Create Campaign
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = campaigns.map(campaign => {
        const isActive = activeCampaign && activeCampaign.id === campaign.id;
        return `
            <div class="campaign-card ${isActive ? 'active' : ''}">
                <div class="campaign-header">
                    <h3>${campaign.name}</h3>
                    ${isActive ? '<span class="active-badge">Active</span>' : ''}
                </div>
                <p class="campaign-description">${campaign.description || 'No description'}</p>
                <div class="campaign-meta">
                    <span>Created: ${formatDate(campaign.createdDate)}</span>
                </div>
                <div class="campaign-actions">
                    ${!isActive ? `<button class="action-btn btn-small" onclick="switchToCampaign('${campaign.id}')">Switch To</button>` : ''}
                    <button class="action-btn btn-small" onclick="showEditCampaignModal('${campaign.id}')">Edit</button>
                    <button class="action-btn btn-small" onclick="showImportModal('${campaign.id}')">Import Data</button>
                    <button class="action-btn btn-small" onclick="exportCampaign('${campaign.id}')">Export</button>
                    <button class="action-btn btn-small btn-danger" onclick="deleteCampaign('${campaign.id}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

async function switchToCampaign(campaignId) {
    await setActiveCampaign(campaignId);
    displayCampaigns();
}

function showCreateCampaignModal() {
    const modalContent = `
        <form id="campaign-form" onsubmit="createCampaign(event)">
            <div class="form-group">
                <label for="campaign-name">Campaign Name *</label>
                <input type="text" id="campaign-name" name="name" required>
            </div>
            <div class="form-group">
                <label for="campaign-description">Description</label>
                <textarea id="campaign-description" name="description" rows="4"></textarea>
            </div>
            <div class="modal-actions">
                <button type="submit" class="action-btn">Create Campaign</button>
                <button type="button" class="action-btn btn-secondary" onclick="closeModal(this)">Cancel</button>
            </div>
        </form>
    `;
    
    showModal('Create New Campaign', modalContent);
}

async function createCampaign(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const campaignData = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString()
    };
    
    try {
        const response = await fetch('/api/campaigns', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(campaignData)
        });
        
        if (response.ok) {
            // Reload campaigns
            await loadCampaigns();
            
            // Close modal
            const modal = document.querySelector('.modal-overlay');
            if (modal) modal.remove();
            
            // Display updated list
            displayCampaigns();
            
            // Update campaign selector
            updateCampaignSelector();
            
            // If this is the first campaign, make it active
            if (campaigns.length === 1) {
                await setActiveCampaign(campaignData.id);
            }
            
            alert('Campaign created successfully!');
        } else {
            alert('Error creating campaign');
        }
    } catch (error) {
        console.error('Error creating campaign:', error);
        alert('Error creating campaign: ' + error.message);
    }
}

function showEditCampaignModal(campaignId) {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;
    
    const modalContent = `
        <form id="edit-campaign-form" onsubmit="updateCampaign(event, '${campaignId}')">
            <div class="form-group">
                <label for="edit-campaign-name">Campaign Name *</label>
                <input type="text" id="edit-campaign-name" name="name" value="${campaign.name}" required>
            </div>
            <div class="form-group">
                <label for="edit-campaign-description">Description</label>
                <textarea id="edit-campaign-description" name="description" rows="4">${campaign.description || ''}</textarea>
            </div>
            <div class="modal-actions">
                <button type="submit" class="action-btn">Update Campaign</button>
                <button type="button" class="action-btn btn-secondary" onclick="closeModal(this)">Cancel</button>
            </div>
        </form>
    `;
    
    showModal('Edit Campaign', modalContent);
}

async function updateCampaign(event, campaignId) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const updateData = {
        name: formData.get('name'),
        description: formData.get('description') || '',
        lastModified: new Date().toISOString()
    };
    
    try {
        const response = await fetch(`/api/campaigns/${campaignId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
        });
        
        if (response.ok) {
            // Reload campaigns
            await loadCampaigns();
            
            // Close modal
            const modal = document.querySelector('.modal-overlay');
            if (modal) modal.remove();
            
            // Display updated list
            displayCampaigns();
            
            // Update campaign selector
            updateCampaignSelector();
            
            alert('Campaign updated successfully!');
        } else {
            alert('Error updating campaign');
        }
    } catch (error) {
        console.error('Error updating campaign:', error);
        alert('Error updating campaign: ' + error.message);
    }
}

async function deleteCampaign(campaignId) {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;
    
    if (!confirm(`Are you sure you want to delete the campaign "${campaign.name}"? This will not delete the campaign's data files, but will remove it from the campaign list.`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/campaigns/${campaignId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            // If deleting active campaign, switch to another or clear
            if (activeCampaign && activeCampaign.id === campaignId) {
                // Reload campaigns first
                await loadCampaigns();
                
                if (campaigns.length > 0) {
                    await setActiveCampaign(campaigns[0].id);
                } else {
                    activeCampaign = null;
                    localStorage.removeItem('activeCampaignId');
                }
            } else {
                await loadCampaigns();
            }
            
            // Display updated list
            displayCampaigns();
            
            // Update campaign selector
            updateCampaignSelector();
            
            alert('Campaign deleted successfully!');
        } else {
            alert('Error deleting campaign');
        }
    } catch (error) {
        console.error('Error deleting campaign:', error);
        alert('Error deleting campaign: ' + error.message);
    }
}

async function exportCampaign(campaignId) {
    try {
        const response = await fetch(`/api/campaigns/${campaignId}/export`);
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const campaign = campaigns.find(c => c.id === campaignId);
            const campaignName = campaign ? campaign.name.replace(/\s+/g, '-') : campaignId;
            a.download = `dnd-toolkit-${campaignName}-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } else {
            alert('Error exporting campaign data');
        }
    } catch (error) {
        console.error('Export error:', error);
        alert('Error exporting campaign data');
    }
}

function showImportModal(campaignId) {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;
    
    const otherCampaigns = campaigns.filter(c => c.id !== campaignId);
    
    const modalContent = `
        <div class="import-options">
            <div class="import-section">
                <h4>Import from Another Campaign</h4>
                <p>Select a campaign to import data from:</p>
                ${otherCampaigns.length > 0 ? `
                    <select id="source-campaign" class="form-control">
                        <option value="">Select campaign...</option>
                        ${otherCampaigns.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                    </select>
                    <div class="form-group" style="margin-top: 1rem;">
                        <label>Select data types to import:</label>
                        <div class="checkbox-group">
                            <label><input type="checkbox" class="import-type" value="npcs" checked> NPCs</label>
                            <label><input type="checkbox" class="import-type" value="enemies" checked> Enemies</label>
                            <label><input type="checkbox" class="import-type" value="items" checked> Items</label>
                            <label><input type="checkbox" class="import-type" value="spells" checked> Spells</label>
                            <label><input type="checkbox" class="import-type" value="sessions" checked> Sessions</label>
                            <label><input type="checkbox" class="import-type" value="encounters" checked> Encounters</label>
                            <label><input type="checkbox" class="import-type" value="notes" checked> Notes</label>
                        </div>
                    </div>
                    <button class="action-btn" onclick="importFromCampaign('${campaignId}')">Import</button>
                ` : '<p>No other campaigns available to import from.</p>'}
            </div>
            <div class="import-section" style="margin-top: 2rem;">
                <h4>Import from File</h4>
                <p>Import data from a backup file:</p>
                <input type="file" id="import-file" accept=".json" style="margin: 1rem 0;">
                <button class="action-btn" onclick="importFromFile('${campaignId}')">Import from File</button>
            </div>
        </div>
    `;
    
    showModal(`Import Data to ${campaign.name}`, modalContent);
}

async function importFromCampaign(targetId) {
    const sourceId = document.getElementById('source-campaign')?.value;
    if (!sourceId) {
        alert('Please select a campaign to import from');
        return;
    }
    
    const checkboxes = document.querySelectorAll('.import-type:checked');
    const types = Array.from(checkboxes).map(cb => cb.value);
    
    if (types.length === 0) {
        alert('Please select at least one data type to import');
        return;
    }
    
    try {
        const response = await fetch(`/api/campaigns/${targetId}/import/${sourceId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ types })
        });
        
        if (response.ok) {
            const result = await response.json();
            
            // Close modal
            const modal = document.querySelector('.modal-overlay');
            if (modal) modal.remove();
            
            // Show summary
            const summary = Object.entries(result.imported)
                .map(([type, count]) => `${type}: ${count} items`)
                .join('\n');
            
            alert(`Import successful!\n\n${summary}`);
            
            // Reload data if this is the active campaign
            if (activeCampaign && activeCampaign.id === targetId) {
                await loadData();
                initializePage();
            }
        } else {
            alert('Error importing data from campaign');
        }
    } catch (error) {
        console.error('Import error:', error);
        alert('Error importing data: ' + error.message);
    }
}

async function importFromFile(campaignId) {
    const fileInput = document.getElementById('import-file');
    const file = fileInput?.files[0];
    
    if (!file) {
        alert('Please select a file to import');
        return;
    }
    
    try {
        const text = await file.text();
        const importData = JSON.parse(text);
        
        if (!importData.data) {
            alert('Invalid backup file format');
            return;
        }
        
        const response = await fetch(`/api/campaigns/${campaignId}/import`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: importData.data })
        });
        
        if (response.ok) {
            // Close modal
            const modal = document.querySelector('.modal-overlay');
            if (modal) modal.remove();
            
            alert('Data imported successfully from file!');
            
            // Reload data if this is the active campaign
            if (activeCampaign && activeCampaign.id === campaignId) {
                await loadData();
                initializePage();
            }
        } else {
            alert('Error importing data from file');
        }
    } catch (error) {
        console.error('Import error:', error);
        alert('Error importing data: ' + error.message);
    }
}

