// Encounters-only JavaScript

// Encounter Management
function loadEncounters() {
    const encountersList = document.getElementById('encounters-list');
    
    if (currentData.encounters.length === 0) {
        encountersList.innerHTML = '<p>No encounters created yet. Click "New Encounter" to get started!</p>';
        return;
    }
    
    // Sort encounters by session, then by name
    const sortedEncounters = currentData.encounters.slice().sort((a, b) => {
        const sessionA = getSessionName(a.sessionId);
        const sessionB = getSessionName(b.sessionId);
        
        if (sessionA !== sessionB) {
            return sessionA.localeCompare(sessionB);
        }
        
        return a.name.localeCompare(b.name);
    });
    
    let currentSession = null;
    let html = '';
    
    sortedEncounters.forEach(encounter => {
        const sessionName = getSessionName(encounter.sessionId);
        
        // Add session header when session changes
        if (sessionName !== currentSession) {
            currentSession = sessionName;
            html += `<div class="encounter-session-header"><h3>${sessionName}</h3></div>`;
        }
        
        const participants = encounter.participants || [];
        const participantCount = participants.length;
        
        // Get type-specific styling
        const typeClass = (encounter.type || 'Combat').toLowerCase().replace(/\s+/g, '-');
        const typeIcon = getEncounterTypeIcon(encounter.type || 'Combat');
        const difficultyClass = (encounter.difficulty || 'Medium').toLowerCase();
        
        html += `
        <div class="encounter-card ${typeClass} ${difficultyClass}" onclick="showEncounterDetails('${encounter.id}')">
            <div class="encounter-card-header">
                <div class="encounter-type">
                    <span class="type-icon">${typeIcon}</span>
                    <span class="type-text">${encounter.type || 'Combat'}</span>
                </div>
                <div class="encounter-difficulty difficulty-${difficultyClass}">
                    ${encounter.difficulty || 'Medium'}
                </div>
            </div>
            
            <div class="encounter-title">
                <h3>${encounter.name}</h3>
            </div>
            
            <div class="encounter-details">
                <div class="encounter-participants">
                    <span class="detail-icon">👥</span>
                    <span>${participantCount} participant${participantCount !== 1 ? 's' : ''}</span>
                </div>
                <div class="encounter-session">
                    <span class="detail-icon">📖</span>
                    <span>${sessionName}</span>
                </div>
            </div>
            
            
            <div class="encounter-actions">
                <button class="btn-small" onclick="event.stopPropagation(); showEncounterDetails('${encounter.id}')">
                    View Details
                </button>
                <button class="btn-small" onclick="event.stopPropagation(); editEncounter('${encounter.id}')">
                    Edit
                </button>
            </div>
        </div>
        `;
    });
    
    encountersList.innerHTML = html;
}

function showEncounterDetails(encounterId) {
    const encounter = currentData.encounters.find(e => e.id === encounterId);
    if (!encounter) return;
    
    const sessionName = getSessionName(encounter.sessionId);
    const participants = encounter.participants || [];
    
    const modalContent = `
        <div class="modal-encounter-details">
            <div class="modal-encounter-header">
                <div class="modal-encounter-title-section">
                    <div class="modal-encounter-type-badge">
                        <span class="type-icon">${getEncounterTypeIcon(encounter.type || 'Combat')}</span>
                        <span class="type-text">${encounter.type || 'Combat'}</span>
                    </div>
                    <h2 class="modal-encounter-title">${encounter.name}</h2>
                    <div class="modal-encounter-session">📖 ${sessionName}</div>
                </div>
                <div class="modal-encounter-meta">
                    <div class="modal-meta-item">
                        <span class="meta-icon">👥</span>
                        <span class="meta-text">${participants.length} participant${participants.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div class="modal-meta-item">
                        <span class="meta-icon">⚡</span>
                        <span class="meta-text difficulty-${(encounter.difficulty || 'Medium').toLowerCase()}">${encounter.difficulty || 'Medium'}</span>
                    </div>
                </div>
            </div>
            
            <div class="modal-encounter-content">
                ${encounter.description ? `
                    <div class="modal-content-card">
                        <div class="modal-card-header">
                            <h3 class="modal-card-title">
                                <span class="card-icon">📝</span>
                                Description
                            </h3>
                        </div>
                        <div class="modal-card-content">
                            <p class="modal-description">${encounter.description}</p>
                        </div>
                    </div>
                ` : ''}
                
                ${participants.length > 0 ? `
                    <div class="modal-content-card">
                        <div class="modal-card-header">
                            <h3 class="modal-card-title">
                                <span class="card-icon">👥</span>
                                Participants
                            </h3>
                        </div>
                        <div class="modal-card-content">
                            <div class="modal-participants-grid">
                                ${participants.map(p => `
                                    <div class="modal-participant-item">
                                        <div class="participant-type-badge ${p.type.toLowerCase()}">
                                            ${p.type === 'NPC' ? '👤' : '👹'}
                                        </div>
                                        <div class="participant-info">
                                            <div class="participant-name">${p.name}</div>
                                            <div class="participant-type">${p.type}</div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                ` : ''}
                
                ${encounter.notes ? `
                    <div class="modal-content-card">
                        <div class="modal-card-header">
                            <h3 class="modal-card-title">
                                <span class="card-icon">📋</span>
                                Encounter Notes
                            </h3>
                        </div>
                        <div class="modal-card-content">
                            <div class="modal-notes">${encounter.notes.replace(/\n/g, '<br>')}</div>
                        </div>
                    </div>
                ` : ''}
            </div>
            
            <div class="modal-encounter-actions">
                <button class="btn btn-primary" onclick="document.getElementById('encounter-modal').style.display='none'; setTimeout(() => editEncounter('${encounter.id}'), 100)">
                    <span class="btn-icon">✏️</span>
                    Edit Encounter
                </button>
                <button class="btn btn-secondary" onclick="addToInitiativeFromEncounter('${encounter.id}')">
                    <span class="btn-icon">🎲</span>
                    Add to Initiative
                </button>
                <button class="btn btn-danger" onclick="document.getElementById('encounter-modal').style.display='none'; setTimeout(() => deleteEncounter('${encounter.id}'), 100)">
                    <span class="btn-icon">🗑️</span>
                    Delete Encounter
                </button>
            </div>
        </div>
    `;
    
    // Update the existing encounter modal instead of using showModal
    const modal = document.getElementById('encounter-modal');
    const title = document.getElementById('encounter-modal-title');
    const body = document.getElementById('encounter-modal-body');
    
    if (modal && title && body) {
        title.textContent = encounter.name;
        body.innerHTML = modalContent;
        modal.style.display = 'flex';
    } else {
        console.error('Encounter modal elements not found');
    }
}

function showEncounterModal(encounterId = null) {
    const isEdit = encounterId !== null;
    const encounter = isEdit ? currentData.encounters.find(e => e.id === encounterId) : null;
    
    const content = `
        <form onsubmit="saveEncounter(event, ${encounterId ? `'${encounterId}'` : 'null'})">
            <div class="form-row">
                <div class="form-group">
                    <label>Name *</label>
                    <input type="text" name="name" value="${encounter ? encounter.name : ''}" required>
                </div>
                <div class="form-group">
                    <label>Session *</label>
                    <select name="sessionId" required>
                        <option value="">Select a session</option>
                        ${currentData.sessions.map(session => `
                            <option value="${session.id}" ${encounter && encounter.sessionId === session.id ? 'selected' : ''}>
                                ${session.title}
                            </option>
                        `).join('')}
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Type</label>
                    <select name="type">
                        <option value="Combat" ${encounter && encounter.type === 'Combat' ? 'selected' : ''}>Combat</option>
                        <option value="Social" ${encounter && encounter.type === 'Social' ? 'selected' : ''}>Social</option>
                        <option value="Exploration" ${encounter && encounter.type === 'Exploration' ? 'selected' : ''}>Exploration</option>
                        <option value="Puzzle" ${encounter && encounter.type === 'Puzzle' ? 'selected' : ''}>Puzzle</option>
                        <option value="Other" ${encounter && encounter.type === 'Other' ? 'selected' : ''}>Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Difficulty</label>
                    <select name="difficulty">
                        <option value="Easy" ${encounter && encounter.difficulty === 'Easy' ? 'selected' : ''}>Easy</option>
                        <option value="Medium" ${encounter && encounter.difficulty === 'Medium' ? 'selected' : ''}>Medium</option>
                        <option value="Hard" ${encounter && encounter.difficulty === 'Hard' ? 'selected' : ''}>Hard</option>
                        <option value="Deadly" ${encounter && encounter.difficulty === 'Deadly' ? 'selected' : ''}>Deadly</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea name="description" rows="3" placeholder="Brief description of the encounter">${encounter ? encounter.description : ''}</textarea>
            </div>
            <div class="form-group">
                <label>Encounter Notes</label>
                <textarea name="notes" rows="4" placeholder="Preparation notes, tactics, outcomes...">${encounter ? encounter.notes : ''}</textarea>
            </div>
            <div class="form-group">
                <label>Add Participants</label>
                <div class="participant-selection">
                    <div class="form-row">
                        <div class="form-group">
                            <label>NPCs</label>
                            <select id="npc-select" multiple>
                                ${currentData.npcs.map(npc => `
                                    <option value="npc-${npc.id}">${npc.name}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Enemies</label>
                            <select id="enemy-select" multiple>
                                ${currentData.enemies.map(enemy => `
                                    <option value="enemy-${enemy.id}">${enemy.name}</option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                    <button type="button" class="btn-small" onclick="addSelectedParticipants()">Add Selected</button>
                </div>
                <div id="current-participants">
                    ${encounter ? encounter.participants.map(p => `
                        <div class="participant-item">
                            <span>${p.name} (${p.type})</span>
                            <button type="button" onclick="removeParticipant('${p.id}')" class="btn-small danger">Remove</button>
                        </div>
                    `).join('') : ''}
                </div>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn">${isEdit ? 'Update' : 'Create'} Encounter</button>
                <button type="button" class="btn-secondary" onclick="document.getElementById('encounter-modal').style.display='none'">Cancel</button>
            </div>
        </form>
    `;
    
    // Update the existing encounter modal instead of using showModal
    const modal = document.getElementById('encounter-modal');
    const title = document.getElementById('encounter-modal-title');
    const body = document.getElementById('encounter-modal-body');
    
    if (modal && title && body) {
        title.textContent = isEdit ? 'Edit Encounter' : 'New Encounter';
        body.innerHTML = content;
        modal.style.display = 'flex';
    } else {
        console.error('Encounter modal elements not found');
    }
}

function saveEncounter(event, encounterId) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    const encounterData = {
        name: formData.get('name'),
        sessionId: formData.get('sessionId'),
        type: formData.get('type') || 'Combat',
        difficulty: formData.get('difficulty') || 'Medium',
        description: formData.get('description'),
        notes: formData.get('notes'),
        participants: getCurrentParticipants(),
        created: encounterId ? currentData.encounters.find(e => e.id === encounterId).created : new Date().toISOString(),
        updated: new Date().toISOString()
    };
    
    if (encounterId) {
        // Update existing encounter
        const index = currentData.encounters.findIndex(e => e.id === encounterId);
        if (index !== -1) {
            currentData.encounters[index] = { ...currentData.encounters[index], ...encounterData };
        }
    } else {
        // Create new encounter
        encounterData.id = generateId();
        currentData.encounters.push(encounterData);
    }
    
    saveData();
    document.getElementById('encounter-modal').style.display = 'none';
    loadEncounters();
}

function editEncounter(encounterId) {
    showEncounterModal(encounterId);
}

function deleteEncounter(encounterId) {
    if (confirm('Are you sure you want to delete this encounter?')) {
        currentData.encounters = currentData.encounters.filter(e => e.id !== encounterId);
        saveData();
        loadEncounters();
    }
}

// Helper functions
function getSessionName(sessionId) {
    const session = currentData.sessions.find(s => s.id === sessionId);
    return session ? session.title : 'Unknown Session';
}

function getEncounterTypeIcon(type) {
    const icons = {
        'Combat': '⚔️',
        'Social': '💬',
        'Exploration': '🗺️',
        'Puzzle': '🧩',
        'Other': '❓'
    };
    return icons[type] || '⚔️';
}

function addSelectedParticipants() {
    const npcSelect = document.getElementById('npc-select');
    const enemySelect = document.getElementById('enemy-select');
    const participantsDiv = document.getElementById('current-participants');
    
    const selectedNpcs = Array.from(npcSelect.selectedOptions).map(option => ({
        id: generateId(),
        name: option.textContent,
        type: 'NPC',
        sourceId: option.value.replace('npc-', '')
    }));
    
    const selectedEnemies = Array.from(enemySelect.selectedOptions).map(option => ({
        id: generateId(),
        name: option.textContent,
        type: 'Enemy',
        sourceId: option.value.replace('enemy-', '')
    }));
    
    const newParticipants = [...selectedNpcs, ...selectedEnemies];
    
    newParticipants.forEach(participant => {
        const participantDiv = document.createElement('div');
        participantDiv.className = 'participant-item';
        participantDiv.innerHTML = `
            <span>${participant.name} (${participant.type})</span>
            <button type="button" onclick="removeParticipant('${participant.id}')" class="btn-small danger">Remove</button>
        `;
        participantsDiv.appendChild(participantDiv);
    });
    
    // Clear selections
    npcSelect.selectedIndex = -1;
    enemySelect.selectedIndex = -1;
}

function removeParticipant(participantId) {
    const participantDiv = document.querySelector(`[onclick="removeParticipant('${participantId}')"]`);
    if (participantDiv) {
        participantDiv.parentElement.remove();
    }
}

function getCurrentParticipants() {
    const participantItems = document.querySelectorAll('.participant-item');
    return Array.from(participantItems).map(item => {
        const text = item.querySelector('span').textContent;
        const [name, typeWithParens] = text.split(' (');
        const type = typeWithParens.replace(')', '');
        return {
            id: generateId(),
            name,
            type,
            sourceId: null // We'll need to track this better in a real implementation
        };
    });
}

function addToInitiativeFromEncounter(encounterId) {
    const encounter = currentData.encounters.find(e => e.id === encounterId);
    if (!encounter || !encounter.participants) return;
    
    encounter.participants.forEach(participant => {
        if (participant.type === 'NPC') {
            addToInitiative(participant.sourceId, 'npc');
        } else if (participant.type === 'Enemy') {
            addToInitiative(participant.sourceId, 'enemy');
        }
    });
    
    document.getElementById('encounter-modal').style.display = 'none';
    // Redirect to initiative page
    window.location.href = '/initiative';
}

// Initialize data structure if needed
function initializeEncountersData() {
    if (!currentData.sessions) {
        currentData.sessions = [];
    }
    if (!currentData.encounters) {
        currentData.encounters = [];
    }
}

// Load data when page loads
// Remove duplicate DOMContentLoaded - let shared.js handle initialization
// This function is called by shared.js initializePage() after data is loaded
