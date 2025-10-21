// NPCs-specific JavaScript

function sortNPCsByFaction(npcs) {
    // Sort NPCs by faction (alphabetically), then by faction leader status, then by name
    // NPCs without a faction go to "Unaffiliated" group
    return npcs.slice().sort((a, b) => {
        const factionA = (a.faction || 'Unaffiliated').toLowerCase();
        const factionB = (b.faction || 'Unaffiliated').toLowerCase();
        
        // First, sort by faction
        if (factionA !== factionB) {
            return factionA.localeCompare(factionB);
        }
        
        // Within same faction, faction leaders come first
        const isLeaderA = a.factionLeader === 'true' || a.factionLeader === true;
        const isLeaderB = b.factionLeader === 'true' || b.factionLeader === true;
        
        if (isLeaderA && !isLeaderB) return -1;
        if (!isLeaderA && isLeaderB) return 1;
        
        // Finally, sort by name
        return a.name.localeCompare(b.name);
    });
}

function loadNPCs() {
    const npcsList = document.getElementById('npcs-list');
    
    if (currentData.npcs.length === 0) {
        npcsList.innerHTML = '<p>No NPCs created yet. Click "Add New NPC" to get started!</p>';
        return;
    }
    
    const sortedNPCs = sortNPCsByFaction(currentData.npcs);
    let currentFaction = null;
    let html = '';
    
    sortedNPCs.forEach(npc => {
        const faction = npc.faction || 'Unaffiliated';
        
        // Add faction header when faction changes
        if (faction !== currentFaction) {
            currentFaction = faction;
            html += `<div class="spell-level-header"><h3>${faction}</h3></div>`;
        }
        
        const raceText = npc.race || 'Unknown';
        const classText = npc.class || 'Unknown';
        const isLeader = npc.factionLeader === 'true' || npc.factionLeader === true;
        const tags = npc.tags || [];
        const tagsHtml = tags.length > 0 ? 
            `<div class="enemy-tags">${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : '';
        
        html += `
        <div class="spell-item" onclick="showNPCDetails('${npc.id}')" data-tags="${tags.join(',')}">
            <h3>${isLeader ? '👑 ' : ''}${npc.name}</h3>
            <p><strong>${raceText}</strong> • ${classText}</p>
            ${tagsHtml}
        </div>
        `;
    });
    
    npcsList.innerHTML = html;
    loadNPCTagFilters();
}

function loadNPCTagFilters() {
    const tagButtons = document.getElementById('npc-tag-filter-buttons');
    if (!tagButtons) return;
    
    const allTags = new Set();
    
    // Collect all unique tags from NPCs
    currentData.npcs.forEach(npc => {
        if (npc.tags) {
            npc.tags.forEach(tag => allTags.add(tag));
        }
    });
    
    // Create filter buttons
    const sortedTags = Array.from(allTags).sort();
    tagButtons.innerHTML = sortedTags.map(tag => 
        `<button class="tag-filter-btn" onclick="toggleNPCTagFilter('${tag}')">${tag}</button>`
    ).join('');
}

function toggleNPCTagFilter(tag) {
    const button = document.querySelector(`[onclick="toggleNPCTagFilter('${tag}')"]`);
    button.classList.toggle('active');
    
    // Filter NPCs based on active tags
    const activeTags = Array.from(document.querySelectorAll('#npc-tag-filter-buttons .tag-filter-btn.active'))
        .map(btn => btn.textContent);
    
    filterNPCsByTags(activeTags);
}

function filterNPCsByTags(activeTags) {
    const npcItems = document.querySelectorAll('#npcs-list .spell-item[data-tags]');
    
    npcItems.forEach(item => {
        const itemTags = item.getAttribute('data-tags').split(',');
        
        if (activeTags.length === 0 || activeTags.some(tag => itemTags.includes(tag))) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
    
    // Also hide faction headers if no NPCs are visible in that section
    const factionHeaders = document.querySelectorAll('#npcs-list .spell-level-header');
    factionHeaders.forEach(header => {
        const nextSiblings = Array.from(header.parentNode.children)
            .slice(header.parentNode.children.indexOf(header) + 1);
        
        const hasVisibleNPCs = nextSiblings.some(sibling => {
            if (sibling.classList.contains('spell-level-header')) return false;
            return sibling.style.display !== 'none';
        });
        
        header.style.display = hasVisibleNPCs ? 'block' : 'none';
    });
}

function clearNPCTagFilters() {
    document.querySelectorAll('#npc-tag-filter-buttons .tag-filter-btn.active').forEach(btn => {
        btn.classList.remove('active');
    });
    
    filterNPCsByTags([]);
}

function showNPCDetails(npcId) {
    const npc = currentData.npcs.find(n => n.id === npcId);
    if (!npc) return;
    
    const isLeader = npc.factionLeader === 'true' || npc.factionLeader === true;
    
    const modalContent = `
        <div class="npc-details">
            <div class="npc-header">
                <div class="npc-title">${isLeader ? '👑 ' : ''}${npc.name}</div>
                <div class="npc-meta">
                    <span class="meta-item">${npc.race || 'Unknown Race'}</span>
                    <span class="meta-item">${npc.class || 'Unknown Class'}</span>
                    <span class="meta-item">Level ${npc.level || '1'}</span>
                    ${npc.faction ? `<span class="meta-item faction">${npc.faction}</span>` : ''}
                </div>
            </div>
            
            <div class="npc-stats">
                <div class="stat-item">
                    <span class="stat-label">AC</span>
                    <span class="stat-value">${npc.ac || 'Unknown'}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">HP</span>
                    <span class="stat-value">${npc.hp || 'Unknown'}</span>
                </div>
            </div>
            
            ${npc.str || npc.dex || npc.con || npc.int || npc.wis || npc.cha ? `
                <div class="npc-abilities">
                    <h4>Ability Scores</h4>
                    <div class="ability-grid">
                        ${npc.str ? `<div class="ability-item"><span class="ability-label">STR</span><span class="ability-value">${npc.str}</span></div>` : ''}
                        ${npc.dex ? `<div class="ability-item"><span class="ability-label">DEX</span><span class="ability-value">${npc.dex}</span></div>` : ''}
                        ${npc.con ? `<div class="ability-item"><span class="ability-label">CON</span><span class="ability-value">${npc.con}</span></div>` : ''}
                        ${npc.int ? `<div class="ability-item"><span class="ability-label">INT</span><span class="ability-value">${npc.int}</span></div>` : ''}
                        ${npc.wis ? `<div class="ability-item"><span class="ability-label">WIS</span><span class="ability-value">${npc.wis}</span></div>` : ''}
                        ${npc.cha ? `<div class="ability-item"><span class="ability-label">CHA</span><span class="ability-value">${npc.cha}</span></div>` : ''}
                    </div>
                </div>
            ` : ''}
            
            ${npc.description ? `
                <div class="npc-section">
                    <h4>Description</h4>
                    <div class="section-content">${(npc.description.replace ? npc.description : '').replace(/\n/g, '<br>')}</div>
                </div>
            ` : ''}
            
            ${npc.notes ? `
                <div class="npc-section">
                    <h4>Notes</h4>
                    <div class="section-content">${(npc.notes.replace ? npc.notes : '').replace(/\n/g, '<br>')}</div>
                </div>
            ` : ''}
            
            ${npc.tags && npc.tags.length > 0 ? `
                <div class="npc-section">
                    <h4>Tags</h4>
                    <div class="enemy-tags">
                        ${npc.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="npc-actions">
                <button class="btn btn-primary" onclick="closeModal(document.querySelector('.modal-close')); setTimeout(() => editNPC('${npc.id}'), 100)">
                    <span>✏️</span> Edit
                </button>
                <button class="btn btn-secondary" onclick="closeModal(document.querySelector('.modal-close')); addToInitiative('${npc.id}', 'npc')">
                    <span>⚔️</span> Add to Initiative
                </button>
                <button class="btn btn-danger" onclick="closeModal(document.querySelector('.modal-close')); setTimeout(() => deleteNPC('${npc.id}'), 100)">
                    <span>🗑️</span> Delete
                </button>
            </div>
        </div>
    `;
    
    showModal(npc.name, modalContent);
}

function showNPCModal(npcId = null) {
    const isEdit = npcId !== null;
    const npc = isEdit ? currentData.npcs.find(n => n.id === npcId) : null;
    
    const content = `
        <form onsubmit="saveNPC(event, ${npcId ? `'${npcId}'` : 'null'})">
            <div class="form-section">
                <h3>Basic Information</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label>Name *</label>
                        <input type="text" name="name" value="${npc ? npc.name : ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Race *</label>
                        <input type="text" name="race" value="${npc ? npc.race : ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Class</label>
                        <input type="text" name="class" value="${npc ? npc.class : ''}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Level</label>
                        <input type="number" name="level" value="${npc ? npc.level : 1}" min="1" max="20">
                    </div>
                    <div class="form-group" style="flex: 2;">
                        <label>Faction</label>
                        <input type="text" name="faction" value="${npc ? npc.faction : ''}" placeholder="e.g., Zhentarim, Harpers, City Watch">
                    </div>
                    <div class="form-group" style="flex: 1; display: flex; align-items: center; padding-top: 1.5rem;">
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; white-space: nowrap;">
                            <input type="checkbox" name="factionLeader" ${npc && npc.factionLeader === 'true' ? 'checked' : ''} value="true" style="accent-color: #d4af37;">
                            Faction Leader
                        </label>
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <h3>Combat Stats</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label>AC</label>
                        <input type="number" name="ac" value="${npc ? npc.ac : ''}">
                    </div>
                    <div class="form-group">
                        <label>HP</label>
                        <input type="number" name="hp" value="${npc ? npc.hp : ''}">
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <h3>Ability Scores</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label>STR</label>
                        <input type="number" name="str" value="${npc ? npc.str : ''}">
                    </div>
                    <div class="form-group">
                        <label>DEX</label>
                        <input type="number" name="dex" value="${npc ? npc.dex : ''}">
                    </div>
                    <div class="form-group">
                        <label>CON</label>
                        <input type="number" name="con" value="${npc ? npc.con : ''}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>INT</label>
                        <input type="number" name="int" value="${npc ? npc.int : ''}">
                    </div>
                    <div class="form-group">
                        <label>WIS</label>
                        <input type="number" name="wis" value="${npc ? npc.wis : ''}">
                    </div>
                    <div class="form-group">
                        <label>CHA</label>
                        <input type="number" name="cha" value="${npc ? npc.cha : ''}">
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <h3>Description & Notes</h3>
                <div class="form-group">
                    <label>Description</label>
                    <textarea name="description" rows="3">${npc ? npc.description : ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Notes</label>
                    <textarea name="notes" rows="3">${npc ? npc.notes : ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Tags</label>
                    <input type="text" name="tags" value="${npc ? (npc.tags ? npc.tags.join(', ') : '') : ''}" placeholder="e.g., merchant, noble, quest giver, tavern">
                    <small style="color: #b8b8b8; font-size: 0.8rem;">Separate multiple tags with commas</small>
                </div>
            </div>
            
            <div class="modal-actions">
                <button type="submit" class="action-btn">${isEdit ? 'Update' : 'Create'} NPC</button>
                <button type="button" class="action-btn btn-secondary" onclick="closeModal(this)">Cancel</button>
            </div>
        </form>
    `;
    
    showModal(isEdit ? 'Edit NPC' : 'Create New NPC', content);
}

async function saveNPC(event, npcId) {
    event.preventDefault();
    console.log('saveNPC called with npcId:', npcId);
    
    const formData = new FormData(event.target);
    const npcData = Object.fromEntries(formData.entries());
    console.log('Form data:', npcData);
    
    // Process tags - convert comma-separated string to array
    if (npcData.tags) {
        npcData.tags = npcData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    } else {
        npcData.tags = [];
    }
    
    if (npcId && npcId !== 'null') {
        // Edit existing NPC
        console.log('Editing existing NPC');
        const index = currentData.npcs.findIndex(n => n.id === npcId);
        if (index !== -1) {
            currentData.npcs[index] = { ...currentData.npcs[index], ...npcData };
        }
    } else {
        // Create new NPC
        console.log('Creating new NPC');
        npcData.id = generateId();
        currentData.npcs.push(npcData);
        console.log('New NPC added:', npcData);
    }
    
    console.log('Current NPCs:', currentData.npcs);
    await saveData();
    closeModal(event.target.closest('.modal-overlay').querySelector('.modal-close'));
    loadNPCs();
}

function editNPC(npcId) {
    showNPCModal(npcId);
}

function deleteNPC(npcId) {
    confirmDelete('Are you sure you want to delete this NPC?', async () => {
        currentData.npcs = currentData.npcs.filter(n => n.id !== npcId);
        await saveData();
        loadNPCs();
    });
}
