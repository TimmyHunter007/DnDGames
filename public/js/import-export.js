// Import/Export functionality

// PDF Export using jsPDF
function exportToPDF() {
    const { jsPDF } = window.jspdf;
    
    if (!jsPDF) {
        // Load jsPDF if not already loaded
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', () => {
            exportToPDF();
        });
        return;
    }
    
    const doc = new jsPDF();
    let yPosition = 20;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    
    // Title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('D&D DM Toolkit - Campaign Data', margin, yPosition);
    yPosition += 15;
    
    // NPCs Section
    if (currentData.npcs.length > 0) {
        yPosition = addSectionToPDF(doc, 'NPCs', currentData.npcs, yPosition, pageHeight, margin, (npc) => {
            return `${npc.name} - ${npc.race || 'Unknown'} ${npc.class || 'Unknown'}${npc.faction ? ` (${npc.faction})` : ''}`;
        });
    }
    
    // Enemies Section
    if (currentData.enemies.length > 0) {
        yPosition = addSectionToPDF(doc, 'Enemies & Monsters', currentData.enemies, yPosition, pageHeight, margin, (enemy) => {
            return `${enemy.name} - CR ${enemy.cr || 'Unknown'} (${enemy.type || 'Unknown'})`;
        });
    }
    
    // Items Section
    if (currentData.items.length > 0) {
        yPosition = addSectionToPDF(doc, 'Magic Items & Equipment', currentData.items, yPosition, pageHeight, margin, (item) => {
            return `${item.name} - ${item.rarity || 'Unknown'} ${item.type || 'Unknown'}`;
        });
    }
    
    // Sessions Section
    if (currentData.sessions.length > 0) {
        yPosition = addSectionToPDF(doc, 'Sessions', currentData.sessions, yPosition, pageHeight, margin, (session) => {
            return `${session.title} - ${session.date || 'No Date'}`;
        });
    }
    
    // Encounters Section
    if (currentData.encounters.length > 0) {
        yPosition = addSectionToPDF(doc, 'Encounters', currentData.encounters, yPosition, pageHeight, margin, (encounter) => {
            return `${encounter.name} - ${encounter.location || 'Unknown Location'}`;
        });
    }
    
    // Notes Section
    if (currentData.notes.length > 0) {
        yPosition = addSectionToPDF(doc, 'Notes', currentData.notes, yPosition, pageHeight, margin, (note) => {
            return `${note.title} - ${note.category || 'General'}`;
        });
    }
    
    // Save the PDF
    const timestamp = new Date().toISOString().split('T')[0];
    doc.save(`dnd-campaign-data-${timestamp}.pdf`);
}

function addSectionToPDF(doc, sectionTitle, items, yPosition, pageHeight, margin, itemFormatter) {
    // Check if we need a new page
    if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
    }
    
    // Section header
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(sectionTitle, margin, yPosition);
    yPosition += 10;
    
    // Items
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    items.forEach(item => {
        if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
        }
        
        const itemText = itemFormatter(item);
        doc.text(`• ${itemText}`, margin + 5, yPosition);
        yPosition += 7;
    });
    
    yPosition += 10;
    return yPosition;
}

// JSON Export/Import
function exportToJSON() {
    const dataStr = JSON.stringify(currentData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    const timestamp = new Date().toISOString().split('T')[0];
    link.download = `dnd-campaign-backup-${timestamp}.json`;
    link.click();
}

function showImportModal() {
    const content = `
        <div class="import-export-section">
            <h4>Import Campaign Data</h4>
            <p>Select a JSON backup file to restore your campaign data.</p>
            <div class="form-group">
                <label>Select Backup File:</label>
                <input type="file" id="import-file" accept=".json" style="margin-bottom: 1rem;">
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="merge-data" checked> Merge with existing data (recommended)
                </label>
                <small style="color: #b8b8b8; display: block; margin-top: 0.5rem;">
                    If unchecked, this will replace all existing data
                </small>
            </div>
            <div class="form-actions">
                <button class="btn-primary" onclick="importFromJSON()">Import Data</button>
                <button class="btn-secondary" onclick="closeModal(document.querySelector('.modal-close'))">Cancel</button>
            </div>
        </div>
    `;
    
    showModal('Import Campaign Data', content);
}

function importFromJSON() {
    const fileInput = document.getElementById('import-file');
    const mergeData = document.getElementById('merge-data').checked;
    
    if (!fileInput.files[0]) {
        alert('Please select a file to import.');
        return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            if (mergeData) {
                // Merge data, keeping existing IDs and adding new ones
                Object.keys(importedData).forEach(key => {
                    if (currentData[key] && Array.isArray(currentData[key])) {
                        // Merge arrays, avoiding duplicates by ID
                        const existingIds = new Set(currentData[key].map(item => item.id));
                        const newItems = importedData[key].filter(item => !existingIds.has(item.id));
                        currentData[key] = [...currentData[key], ...newItems];
                    }
                });
            } else {
                // Replace all data
                currentData = importedData;
            }
            
            saveData().then(() => {
                alert('Data imported successfully!');
                closeModal(document.querySelector('.modal-close'));
                // Reload the page to refresh all data
                window.location.reload();
            });
            
        } catch (error) {
            alert('Error importing data: ' + error.message);
        }
    };
    
    reader.readAsText(file);
}

// D&D Beyond Import
function showDNDBeyondModal() {
    const content = `
        <div class="import-export-section">
            <h4>D&D Beyond Import</h4>
            <p>Import monsters and spells from D&D Beyond.</p>
            
            <div class="dnd-beyond-options">
                <div class="form-group">
                    <label>Import Type:</label>
                    <select id="dnd-import-type" onchange="updateDNDImportOptions()">
                        <option value="monsters">Monsters</option>
                        <option value="spells">Spells</option>
                        <option value="items">Magic Items</option>
                    </select>
                </div>
                
                <div id="dnd-import-options">
                    <div class="form-group">
                        <label>Monster Search:</label>
                        <input type="text" id="monster-search" placeholder="Enter monster name (e.g., 'Adult Red Dragon')">
                        <button class="btn-secondary" onclick="searchDNDBeyond('monsters')">Search</button>
                    </div>
                </div>
                
                <div id="dnd-search-results" style="display: none;">
                    <h5>Search Results:</h5>
                    <div id="search-results-list"></div>
                </div>
            </div>
            
            <div class="form-actions">
                <button class="btn-secondary" onclick="closeModal(document.querySelector('.modal-close'))">Close</button>
            </div>
        </div>
    `;
    
    showModal('D&D Beyond Import', content);
}

function updateDNDImportOptions() {
    const importType = document.getElementById('dnd-import-type').value;
    const optionsDiv = document.getElementById('dnd-import-options');
    
    let optionsHTML = '';
    
    switch(importType) {
        case 'monsters':
            optionsHTML = `
                <div class="form-group">
                    <label>Monster Search:</label>
                    <input type="text" id="monster-search" placeholder="Enter monster name (e.g., 'Adult Red Dragon')">
                    <button class="btn-secondary" onclick="searchDNDBeyond('monsters')">Search</button>
                </div>
            `;
            break;
        case 'spells':
            optionsHTML = `
                <div class="form-group">
                    <label>Spell Search:</label>
                    <input type="text" id="spell-search" placeholder="Enter spell name (e.g., 'Fireball')">
                    <button class="btn-secondary" onclick="searchDNDBeyond('spells')">Search</button>
                </div>
            `;
            break;
        case 'items':
            optionsHTML = `
                <div class="form-group">
                    <label>Item Search:</label>
                    <input type="text" id="item-search" placeholder="Enter item name (e.g., 'Flame Tongue')">
                    <button class="btn-secondary" onclick="searchDNDBeyond('items')">Search</button>
                </div>
            `;
            break;
    }
    
    optionsDiv.innerHTML = optionsHTML;
    document.getElementById('dnd-search-results').style.display = 'none';
}

async function searchDNDBeyond(type) {
    const searchInput = document.getElementById(`${type === 'monsters' ? 'monster' : type === 'spells' ? 'spell' : 'item'}-search`);
    const query = searchInput.value.trim();
    
    if (!query) {
        alert('Please enter a search term.');
        return;
    }
    
    try {
        // Use D&D 5e API (open5e.com) for monster data
        let apiUrl = '';
        switch(type) {
            case 'monsters':
                apiUrl = `https://api.open5e.com/monsters/?search=${encodeURIComponent(query)}`;
                break;
            case 'spells':
                apiUrl = `https://api.open5e.com/spells/?search=${encodeURIComponent(query)}`;
                break;
            case 'items':
                apiUrl = `https://api.open5e.com/magicitems/?search=${encodeURIComponent(query)}`;
                break;
            default:
                alert('Import type not yet supported.');
                return;
        }
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        displaySearchResults(data.results, type);
        
    } catch (error) {
        alert('Error searching D&D Beyond: ' + error.message);
    }
}

function displaySearchResults(results, type) {
    const resultsDiv = document.getElementById('search-results-list');
    const resultsContainer = document.getElementById('dnd-search-results');
    
    if (results.length === 0) {
        resultsDiv.innerHTML = '<p>No results found.</p>';
    } else {
        resultsDiv.innerHTML = results.slice(0, 10).map(item => `
            <div class="search-result-item" onclick="previewDNDItem('${item.slug}', '${type}')">
                <h6>${item.name}</h6>
                <p>${type === 'monsters' ? `CR ${item.challenge_rating || 'Unknown'}` : 
                   type === 'spells' ? `Level ${item.level || 'Unknown'} ${item.school || ''}` : 
                   type === 'items' ? `${item.rarity || 'Unknown Rarity'} ${item.type || 'Magic Item'}` :
                   item.type || 'Unknown Type'}</p>
            </div>
        `).join('');
    }
    
    resultsContainer.style.display = 'block';
}

async function previewDNDItem(slug, type) {
    try {
        let apiUrl = '';
        switch(type) {
            case 'monsters':
                apiUrl = `https://api.open5e.com/monsters/${slug}/`;
                break;
            case 'spells':
                apiUrl = `https://api.open5e.com/spells/${slug}/`;
                break;
            case 'items':
                apiUrl = `https://api.open5e.com/magicitems/${slug}/`;
                break;
            default:
                alert('Preview type not yet supported.');
                return;
        }
        
        const response = await fetch(apiUrl);
        const item = await response.json();
        
        showItemPreviewModal(item, type);
        
    } catch (error) {
        alert('Error loading item preview: ' + error.message);
    }
}

async function importDNDItem(slug, type) {
    try {
        let apiUrl = '';
        switch(type) {
            case 'monsters':
                apiUrl = `https://api.open5e.com/monsters/${slug}/`;
                break;
            case 'spells':
                apiUrl = `https://api.open5e.com/spells/${slug}/`;
                break;
            case 'items':
                apiUrl = `https://api.open5e.com/magicitems/${slug}/`;
                break;
            default:
                alert('Import type not yet supported.');
                return;
        }
        
        const response = await fetch(apiUrl);
        const item = await response.json();
        
        if (type === 'monsters') {
            importMonsterFromDNDBeyond(item);
        } else if (type === 'spells') {
            importSpellFromDNDBeyond(item);
        } else if (type === 'items') {
            importMagicItemFromDNDBeyond(item);
        }
        
        alert(`${item.name} imported successfully!`);
        closeModal(document.querySelector('.modal-close'));
        
    } catch (error) {
        alert('Error importing item: ' + error.message);
    }
}

function importMonsterFromDNDBeyond(monster) {
    const newEnemy = {
        id: generateId(),
        name: monster.name,
        type: monster.type || 'Unknown',
        cr: monster.challenge_rating?.toString() || 'Unknown',
        ac: monster.armor_class?.toString() || 'Unknown',
        hp: monster.hit_points?.toString() || 'Unknown',
        speed: monster.speed || 'Unknown',
        str: monster.strength?.toString() || '10',
        dex: monster.dexterity?.toString() || '10',
        con: monster.constitution?.toString() || '10',
        int: monster.intelligence?.toString() || '10',
        wis: monster.wisdom?.toString() || '10',
        cha: monster.charisma?.toString() || '10',
        attacks: monster.actions?.map(action => `${action.name}: ${action.desc}`).join('\n\n') || '',
        abilities: monster.special_abilities?.map(ability => `${ability.name}: ${ability.desc}`).join('\n\n') || '',
        description: monster.desc || '',
        tags: ['dnd-beyond', 'imported']
    };
    
    currentData.enemies.push(newEnemy);
    saveData();
}

function importSpellFromDNDBeyond(spell) {
    const newSpell = {
        id: generateId(),
        name: spell.name,
        level: spell.level?.toString() || '0',
        school: spell.school || 'Unknown',
        castingTime: spell.casting_time || 'Unknown',
        range: spell.range || 'Unknown',
        components: spell.components || 'Unknown',
        duration: spell.duration || 'Unknown',
        classes: spell.dnd_class || 'Unknown',
        description: spell.desc || '',
        higherLevels: spell.higher_level || '',
        tags: ['dnd-beyond', 'imported']
    };
    
    currentData.spells.push(newSpell);
    saveData();
}

function importMagicItemFromDNDBeyond(item) {
    const newItem = {
        id: generateId(),
        name: item.name,
        type: item.type || 'Magic Item',
        rarity: item.rarity || 'Unknown',
        attunement: item.attunement || 'No',
        description: item.desc || '',
        properties: item.properties || '',
        value: item.value || 'Unknown',
        weight: item.weight || 'Unknown',
        tags: ['dnd-beyond', 'imported', 'magic-item']
    };
    
    currentData.items.push(newItem);
    saveData();
}

function showItemPreviewModal(item, type) {
    let content = '';
    
    switch(type) {
        case 'monsters':
            content = `
                <div class="item-preview-content">
                    <div class="preview-header">
                        <h3>${item.name}</h3>
                        <div class="preview-badges">
                            <span class="badge-cr">CR ${item.challenge_rating || 'Unknown'}</span>
                            <span class="badge-type">${item.type || 'Unknown'}</span>
                        </div>
                    </div>
                    
                    <div class="preview-section">
                        <h4>Statistics</h4>
                        <div class="preview-stats">
                            <div class="stat-item">
                                <span class="stat-label">Armor Class:</span>
                                <span class="stat-value">${item.armor_class || 'Unknown'}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Hit Points:</span>
                                <span class="stat-value">${item.hit_points || 'Unknown'}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Speed:</span>
                                <span class="stat-value">${item.speed || 'Unknown'}</span>
                            </div>
                        </div>
                    </div>
                    
                    ${item.actions ? `
                        <div class="preview-section">
                            <h4>Actions</h4>
                            <div class="preview-text">${item.actions.map(action => `<strong>${action.name}:</strong> ${action.desc}`).join('<br><br>')}</div>
                        </div>
                    ` : ''}
                    
                    ${item.desc ? `
                        <div class="preview-section">
                            <h4>Description</h4>
                            <div class="preview-text">${item.desc}</div>
                        </div>
                    ` : ''}
                </div>
            `;
            break;
            
        case 'spells':
            content = `
                <div class="item-preview-content">
                    <div class="preview-header">
                        <h3>${item.name}</h3>
                        <div class="preview-badges">
                            <span class="badge-level">Level ${item.level || 'Unknown'}</span>
                            <span class="badge-school">${item.school || 'Unknown'}</span>
                        </div>
                    </div>
                    
                    <div class="preview-section">
                        <h4>Spell Details</h4>
                        <div class="preview-stats">
                            <div class="stat-item">
                                <span class="stat-label">Casting Time:</span>
                                <span class="stat-value">${item.casting_time || 'Unknown'}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Range:</span>
                                <span class="stat-value">${item.range || 'Unknown'}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Duration:</span>
                                <span class="stat-value">${item.duration || 'Unknown'}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Components:</span>
                                <span class="stat-value">${item.components || 'Unknown'}</span>
                            </div>
                        </div>
                    </div>
                    
                    ${item.desc ? `
                        <div class="preview-section">
                            <h4>Description</h4>
                            <div class="preview-text">${item.desc}</div>
                        </div>
                    ` : ''}
                    
                    ${item.higher_level ? `
                        <div class="preview-section">
                            <h4>At Higher Levels</h4>
                            <div class="preview-text">${item.higher_level}</div>
                        </div>
                    ` : ''}
                </div>
            `;
            break;
            
        case 'items':
            content = `
                <div class="item-preview-content">
                    <div class="preview-header">
                        <h3>${item.name}</h3>
                        <div class="preview-badges">
                            <span class="badge-rarity rarity-${(item.rarity || 'unknown').toLowerCase()}">${item.rarity || 'Unknown'}</span>
                            <span class="badge-type">${item.type || 'Magic Item'}</span>
                        </div>
                    </div>
                    
                    <div class="preview-section">
                        <h4>Item Details</h4>
                        <div class="preview-stats">
                            ${item.attunement ? `
                                <div class="stat-item">
                                    <span class="stat-label">Attunement:</span>
                                    <span class="stat-value">${item.attunement}</span>
                                </div>
                            ` : ''}
                            ${item.value ? `
                                <div class="stat-item">
                                    <span class="stat-label">Value:</span>
                                    <span class="stat-value">${item.value}</span>
                                </div>
                            ` : ''}
                            ${item.weight ? `
                                <div class="stat-item">
                                    <span class="stat-label">Weight:</span>
                                    <span class="stat-value">${item.weight}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    ${item.desc ? `
                        <div class="preview-section">
                            <h4>Description</h4>
                            <div class="preview-text">${item.desc}</div>
                        </div>
                    ` : ''}
                    
                    ${item.properties ? `
                        <div class="preview-section">
                            <h4>Properties</h4>
                            <div class="preview-text">${item.properties}</div>
                        </div>
                    ` : ''}
                </div>
            `;
            break;
    }
    
    const modalContent = `
        <div class="item-preview-modal">
            ${content}
            <div class="preview-actions">
                <button class="btn-primary" onclick="importDNDItem('${item.slug}', '${type}')">
                    <span class="btn-icon">📥</span>
                    Import Item
                </button>
                <button class="btn-secondary" onclick="closeModal(document.querySelector('.modal-close'))">
                    Cancel
                </button>
            </div>
        </div>
    `;
    
    showModal(`Preview: ${item.name}`, modalContent);
}

// Utility function to load external scripts
function loadScript(src, callback) {
    const script = document.createElement('script');
    script.src = src;
    script.onload = callback;
    document.head.appendChild(script);
}

// Add search result and preview styling
const searchResultCSS = `
.search-result-item {
    background: rgba(139, 92, 246, 0.1);
    border: 1px solid rgba(139, 92, 246, 0.2);
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.search-result-item:hover {
    background: rgba(139, 92, 246, 0.2);
    border-color: rgba(139, 92, 246, 0.4);
}

.search-result-item h6 {
    color: #a78bfa;
    margin: 0 0 0.5rem 0;
    font-family: 'Cinzel', serif;
}

.search-result-item p {
    color: #b8b8b8;
    margin: 0;
    font-size: 0.9rem;
}

/* Item Preview Modal Styling */
.item-preview-modal {
    max-width: 600px;
    margin: 0 auto;
}

.item-preview-content {
    max-height: 70vh;
    overflow-y: auto;
    padding-right: 1rem;
}

.preview-header {
    text-align: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid rgba(139, 92, 246, 0.3);
}

.preview-header h3 {
    color: #e8e8e8;
    margin: 0 0 1rem 0;
    font-family: 'Cinzel', serif;
    font-size: 1.8rem;
    text-shadow: 0 0 10px rgba(167, 139, 250, 0.3);
}

.preview-badges {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    flex-wrap: wrap;
}

.preview-badges .badge-cr,
.preview-badges .badge-level,
.preview-badges .badge-school,
.preview-badges .badge-type {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(167, 139, 250, 0.1));
    color: #a78bfa;
    padding: 0.5rem 1rem;
    border-radius: 12px;
    font-size: 0.9rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border: 1px solid rgba(139, 92, 246, 0.3);
}

.preview-badges .badge-rarity.rarity-common {
    background: linear-gradient(135deg, rgba(156, 163, 175, 0.3), rgba(209, 213, 219, 0.1));
    color: #d1d5db;
    border-color: rgba(156, 163, 175, 0.3);
}

.preview-badges .badge-rarity.rarity-uncommon {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.4), rgba(74, 222, 128, 0.2));
    color: #22c55e;
    border-color: rgba(34, 197, 94, 0.5);
    box-shadow: 0 0 15px rgba(34, 197, 94, 0.3);
    text-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
}

.preview-badges .badge-rarity.rarity-rare {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(96, 165, 250, 0.1));
    color: #60a5fa;
    border-color: rgba(59, 130, 246, 0.3);
}

.preview-badges .badge-rarity.rarity-very-rare {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(167, 139, 250, 0.1));
    color: #a78bfa;
    border-color: rgba(139, 92, 246, 0.3);
}

.preview-badges .badge-rarity.rarity-legendary {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(251, 191, 36, 0.1));
    color: #fbbf24;
    border-color: rgba(245, 158, 11, 0.3);
}

.preview-badges .badge-rarity.rarity-artifact {
    background: linear-gradient(135deg, rgba(220, 38, 38, 0.3), rgba(248, 113, 113, 0.1));
    color: #f87171;
    border-color: rgba(220, 38, 38, 0.3);
}

.preview-section {
    margin-bottom: 2rem;
}

.preview-section h4 {
    color: #a78bfa;
    margin: 0 0 1rem 0;
    font-family: 'Cinzel', serif;
    font-size: 1.2rem;
    text-shadow: 0 0 10px rgba(167, 139, 250, 0.3);
    border-bottom: 1px solid rgba(139, 92, 246, 0.2);
    padding-bottom: 0.5rem;
}

.preview-stats {
    display: grid;
    gap: 0.75rem;
}

.preview-stats .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: rgba(139, 92, 246, 0.05);
    border: 1px solid rgba(139, 92, 246, 0.2);
    border-radius: 8px;
}

.preview-stats .stat-label {
    color: #a78bfa;
    font-weight: 600;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.preview-stats .stat-value {
    color: #e8e8e8;
    font-weight: 500;
}

.preview-text {
    color: #c7c7c7;
    line-height: 1.6;
    background: rgba(139, 92, 246, 0.05);
    border: 1px solid rgba(139, 92, 246, 0.2);
    border-radius: 8px;
    padding: 1rem;
}

.preview-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    padding-top: 1.5rem;
    border-top: 2px solid rgba(139, 92, 246, 0.3);
    margin-top: 2rem;
}

.preview-actions .btn {
    min-width: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

@media (max-width: 768px) {
    .item-preview-modal {
        max-width: 95%;
    }
    
    .preview-badges {
        flex-direction: column;
        align-items: center;
    }
    
    .preview-stats .stat-item {
        flex-direction: column;
        text-align: center;
        gap: 0.5rem;
    }
    
    .preview-actions {
        flex-direction: column;
    }
    
    .preview-actions .btn {
        min-width: auto;
        width: 100%;
    }
}
`;

// Inject CSS
const style = document.createElement('style');
style.textContent = searchResultCSS;
document.head.appendChild(style);

