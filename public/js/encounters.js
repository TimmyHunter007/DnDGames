// Encounters and Sessions JavaScript

// Session Management
function loadSessions() {
    const sessionsList = document.getElementById('sessions-list');
    
    if (currentData.sessions.length === 0) {
        sessionsList.innerHTML = '<p>No sessions created yet. Click "New Session" to get started!</p>';
        return;
    }
    
    // Sort sessions by date (newest first)
    const sortedSessions = currentData.sessions.slice().sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
    
    sessionsList.innerHTML = sortedSessions.map(session => {
        const dateText = session.date ? formatDate(session.date) : 'No date';
        const chapterText = session.chapter ? `Chapter ${session.chapter}: ` : '';
        
        return `
        <div class="spell-item" onclick="showSessionDetails('${session.id}')">
            <h3>${chapterText}${session.title}</h3>
            <p><strong>${dateText}</strong> • ${session.description || 'No description'}</p>
        </div>
        `;
    }).join('');
}

function showSessionDetails(sessionId) {
    const session = currentData.sessions.find(s => s.id === sessionId);
    if (!session) return;
    
    const dateText = session.date ? formatDate(session.date) : 'No date';
    const chapterText = session.chapter ? `Chapter ${session.chapter}` : 'No chapter';
    
    const modalContent = `
        <div class="spell-details">
            <div class="spell-info-item">
                <strong>Title:</strong> ${session.title}
            </div>
            <div class="spell-info-item">
                <strong>Chapter:</strong> ${chapterText}
            </div>
            <div class="spell-info-item">
                <strong>Date:</strong> ${dateText}
            </div>
            <div class="spell-info-item">
                <strong>Description:</strong> ${session.description || 'No description'}
            </div>
            ${session.notes ? `
                <div class="spell-description">
                    <h4>Session Notes:</h4>
                    <p>${session.notes.replace(/\n/g, '<br>')}</p>
                </div>
            ` : ''}
            <div class="spell-info-item">
                <strong>Encounters:</strong> ${getSessionEncounters(session.id).length}
            </div>
            
            <div class="item-actions" style="margin-top: 1.5rem;">
                <button class="btn-small" onclick="closeModal(document.querySelector('.modal-close')); setTimeout(() => editSession('${session.id}'), 100)">Edit</button>
                <button class="btn-small danger" onclick="closeModal(document.querySelector('.modal-close')); setTimeout(() => deleteSession('${session.id}'), 100)">Delete</button>
            </div>
        </div>
    `;
    
    showModal(session.title, modalContent);
}

function showSessionModal(sessionId = null) {
    const isEdit = sessionId !== null;
    const session = isEdit ? currentData.sessions.find(s => s.id === sessionId) : null;
    
    const content = `
        <form onsubmit="saveSession(event, ${sessionId ? `'${sessionId}'` : 'null'})">
            <div class="form-row">
                <div class="form-group">
                    <label>Title *</label>
                    <input type="text" name="title" value="${session ? session.title : ''}" required>
                </div>
                <div class="form-group">
                    <label>Chapter</label>
                    <input type="number" name="chapter" value="${session ? session.chapter : ''}" min="1">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Date</label>
                    <input type="date" name="date" value="${session ? session.date : ''}">
                </div>
                <div class="form-group">
                    <label>Session Number</label>
                    <input type="number" name="sessionNumber" value="${session ? session.sessionNumber : ''}" min="1">
                </div>
            </div>
            <div class="form-group">
                <label>Description</label>
                <input type="text" name="description" value="${session ? session.description : ''}" placeholder="Brief description of the session">
            </div>
            <div class="form-group">
                <label>Session Notes</label>
                <textarea name="notes" rows="4" placeholder="Session notes, events, outcomes...">${session ? session.notes : ''}</textarea>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn">${isEdit ? 'Update' : 'Create'} Session</button>
                <button type="button" class="btn-secondary" onclick="closeModal(document.querySelector('.modal-close'))">Cancel</button>
            </div>
        </form>
    `;
    
    showModal(isEdit ? 'Edit Session' : 'New Session', content);
}

function saveSession(event, sessionId) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    const sessionData = {
        title: formData.get('title'),
        chapter: formData.get('chapter') ? parseInt(formData.get('chapter')) : null,
        date: formData.get('date') || new Date().toISOString().split('T')[0],
        sessionNumber: formData.get('sessionNumber') ? parseInt(formData.get('sessionNumber')) : null,
        description: formData.get('description'),
        notes: formData.get('notes'),
        created: sessionId ? currentData.sessions.find(s => s.id === sessionId).created : new Date().toISOString(),
        updated: new Date().toISOString()
    };
    
    if (sessionId) {
        // Update existing session
        const index = currentData.sessions.findIndex(s => s.id === sessionId);
        if (index !== -1) {
            currentData.sessions[index] = { ...currentData.sessions[index], ...sessionData };
        }
    } else {
        // Create new session
        sessionData.id = generateId();
        currentData.sessions.push(sessionData);
    }
    
    saveData();
    closeModal(document.querySelector('.modal-close'));
    loadSessions();
}

function editSession(sessionId) {
    showSessionModal(sessionId);
}

function deleteSession(sessionId) {
    if (confirm('Are you sure you want to delete this session? This will also delete all associated encounters.')) {
        // Delete associated encounters
        currentData.encounters = currentData.encounters.filter(e => e.sessionId !== sessionId);
        
        // Delete session
        currentData.sessions = currentData.sessions.filter(s => s.id !== sessionId);
        
        saveData();
        loadSessions();
        loadEncounters();
    }
}

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
            html += `<div class="spell-level-header"><h3>${sessionName}</h3></div>`;
        }
        
        const participants = encounter.participants || [];
        const participantCount = participants.length;
        
        html += `
        <div class="spell-item" onclick="showEncounterDetails('${encounter.id}')">
            <h3>${encounter.name}</h3>
            <p><strong>${participantCount} participants</strong> • ${encounter.type || 'Combat'}</p>
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
        <div class="spell-details">
            <div class="spell-info-item">
                <strong>Name:</strong> ${encounter.name}
            </div>
            <div class="spell-info-item">
                <strong>Session:</strong> ${sessionName}
            </div>
            <div class="spell-info-item">
                <strong>Type:</strong> ${encounter.type || 'Combat'}
            </div>
            <div class="spell-info-item">
                <strong>Participants:</strong> ${participants.length}
            </div>
            ${encounter.description ? `
                <div class="spell-description">
                    <h4>Description:</h4>
                    <p>${encounter.description.replace(/\n/g, '<br>')}</p>
                </div>
            ` : ''}
            ${participants.length > 0 ? `
                <div class="spell-description">
                    <h4>Participants:</h4>
                    <ul>
                        ${participants.map(p => `<li>${p.name} (${p.type})</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            ${encounter.notes ? `
                <div class="spell-description">
                    <h4>Encounter Notes:</h4>
                    <p>${encounter.notes.replace(/\n/g, '<br>')}</p>
                </div>
            ` : ''}
            
            <div class="item-actions" style="margin-top: 1.5rem;">
                <button class="btn-small" onclick="closeModal(document.querySelector('.modal-close')); setTimeout(() => editEncounter('${encounter.id}'), 100)">Edit</button>
                <button class="btn-small" onclick="addToInitiativeFromEncounter('${encounter.id}')">Add to Initiative</button>
                <button class="btn-small danger" onclick="closeModal(document.querySelector('.modal-close')); setTimeout(() => deleteEncounter('${encounter.id}'), 100)">Delete</button>
            </div>
        </div>
    `;
    
    showModal(encounter.name, modalContent);
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
                <button type="button" class="btn-secondary" onclick="closeModal(document.querySelector('.modal-close'))">Cancel</button>
            </div>
        </form>
    `;
    
    showModal(isEdit ? 'Edit Encounter' : 'New Encounter', content);
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
    closeModal(document.querySelector('.modal-close'));
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

function getSessionEncounters(sessionId) {
    return currentData.encounters.filter(e => e.sessionId === sessionId);
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
    
    closeModal(document.querySelector('.modal-close'));
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
document.addEventListener('DOMContentLoaded', function() {
    initializeEncountersData();
    loadSessions();
    loadEncounters();
});
