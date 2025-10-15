// Sessions-specific JavaScript

// Session Management
function loadSessions() {
    const sessionsList = document.getElementById('sessions-list');
    
    // Ensure data is initialized
    if (typeof currentData === 'undefined' || !currentData.sessions) {
        initializeSessionsData();
    }
    
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
        const chapterText = session.chapter ? `Chapter ${session.chapter}` : '';
        const encounters = getSessionEncounters(session.id);
        const encounterCount = encounters.length;
        
        // Determine session status based on date
        let sessionDateOnly = null;
        if (session.date) {
            // Handle ISO date strings (YYYY-MM-DD) properly to avoid timezone issues
            if (/^\d{4}-\d{2}-\d{2}$/.test(session.date)) {
                const [year, month, day] = session.date.split('-').map(Number);
                sessionDateOnly = new Date(year, month - 1, day); // month is 0-indexed
            } else {
                const sessionDate = new Date(session.date);
                sessionDateOnly = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate());
            }
        }
        
        const today = new Date();
        const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        const isUpcoming = sessionDateOnly && sessionDateOnly > todayDateOnly;
        const isCompleted = sessionDateOnly && sessionDateOnly <= todayDateOnly;
        
        let statusClass = '';
        let statusIcon = '📖';
        let statusText = 'Planned';
        
        if (isCompleted) {
            statusClass = 'session-completed';
            statusIcon = '✅';
            statusText = 'Completed';
        } else if (isUpcoming) {
            statusClass = 'session-upcoming';
            statusIcon = '📅';
            statusText = 'Upcoming';
        }
        
        return `
        <div class="session-card ${statusClass}" onclick="showSessionDetails('${session.id}')">
            <div class="session-card-header">
                <div class="session-status">
                    <span class="status-icon">${statusIcon}</span>
                    <span class="status-text">${statusText}</span>
                </div>
                <div class="session-meta">
                    ${session.sessionNumber ? `<span class="session-number">#${session.sessionNumber}</span>` : ''}
                </div>
            </div>
            
            <div class="session-title">
                ${chapterText ? `<div class="chapter-badge">${chapterText}</div>` : ''}
                <h3>${session.title}</h3>
            </div>
            
            <div class="session-details">
                <div class="session-date">
                    <span class="detail-icon">📅</span>
                    <span>${dateText}</span>
                </div>
                <div class="session-encounters">
                    <span class="detail-icon">⚔️</span>
                    <span>${encounterCount} encounter${encounterCount !== 1 ? 's' : ''}</span>
                </div>
            </div>
            
            ${session.description ? `
                <div class="session-description">
                    <p>${session.description}</p>
                </div>
            ` : ''}
            
            <div class="session-actions">
                <button class="btn-small" onclick="event.stopPropagation(); showSessionDetails('${session.id}')">
                    View Details
                </button>
                <button class="btn-small" onclick="event.stopPropagation(); editSession('${session.id}')">
                    Edit
                </button>
            </div>
        </div>
        `;
    }).join('');
}

function showSessionDetails(sessionId) {
    const session = currentData.sessions.find(s => s.id === sessionId);
    if (!session) return;
    
    const dateText = session.date ? formatDate(session.date) : 'No date';
    const chapterText = session.chapter ? `Chapter ${session.chapter}` : 'No chapter';
    const encounters = getSessionEncounters(session.id);
    
    const modalContent = `
        <div class="modal-session-details">
            <div class="modal-session-header">
                <div class="modal-session-title-section">
                    ${chapterText ? `<div class="modal-chapter-badge">${chapterText}</div>` : ''}
                    <h2 class="modal-session-title">${session.title}</h2>
                    ${session.sessionNumber ? `<div class="modal-session-number">Session #${session.sessionNumber}</div>` : ''}
                </div>
                <div class="modal-session-meta">
                    <div class="modal-meta-item">
                        <span class="meta-icon">📅</span>
                        <span class="meta-text">${dateText}</span>
                    </div>
                    <div class="modal-meta-item">
                        <span class="meta-icon">⚔️</span>
                        <span class="meta-text">${encounters.length} encounter${encounters.length !== 1 ? 's' : ''}</span>
                    </div>
                </div>
            </div>
            
            <div class="modal-session-content">
                ${session.description ? `
                    <div class="modal-content-card">
                        <div class="modal-card-header">
                            <h3 class="modal-card-title">
                                <span class="card-icon">📝</span>
                                Description
                            </h3>
                        </div>
                        <div class="modal-card-content">
                            <p class="modal-description">${session.description}</p>
                        </div>
                    </div>
                ` : ''}
                
                ${session.notes ? `
                    <div class="modal-content-card">
                        <div class="modal-card-header">
                            <h3 class="modal-card-title">
                                <span class="card-icon">📋</span>
                                Session Notes
                            </h3>
                        </div>
                        <div class="modal-card-content">
                            <div class="modal-notes">${session.notes.replace(/\n/g, '<br>')}</div>
                        </div>
                    </div>
                ` : ''}
                
                ${encounters.length > 0 ? `
                    <div class="modal-content-card">
                        <div class="modal-card-header">
                            <h3 class="modal-card-title">
                                <span class="card-icon">⚔️</span>
                                Encounters in this Session
                            </h3>
                        </div>
                        <div class="modal-card-content">
                            <div class="modal-encounters-grid">
                                ${encounters.map(e => {
                                    const typeIcon = getEncounterTypeIcon(e.type || 'Combat');
                                    const difficultyClass = (e.difficulty || 'Medium').toLowerCase();
                                    const participantCount = (e.participants || []).length;
                                    
                                    return `
                                    <div class="modal-encounter-item">
                                        <div class="modal-encounter-header">
                                            <div class="modal-encounter-type">
                                                <span class="type-icon">${typeIcon}</span>
                                                <span class="type-text">${e.type || 'Combat'}</span>
                                            </div>
                                            <div class="modal-encounter-difficulty difficulty-${difficultyClass}">
                                                ${e.difficulty || 'Medium'}
                                            </div>
                                        </div>
                                        <div class="modal-encounter-name">${e.name}</div>
                                        <div class="modal-encounter-meta">
                                            <span class="participant-count">👥 ${participantCount} participant${participantCount !== 1 ? 's' : ''}</span>
                                        </div>
                                        ${e.description ? `
                                            <div class="modal-encounter-description">
                                                ${e.description}
                                            </div>
                                        ` : ''}
                                    </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
            
            <div class="modal-session-actions">
                <button class="btn btn-primary" onclick="document.getElementById('session-modal').style.display='none'; setTimeout(() => editSession('${session.id}'), 100)">
                    <span class="btn-icon">✏️</span>
                    Edit Session
                </button>
                <button class="btn btn-secondary" onclick="window.location.href='/encounters?session=${session.id}'">
                    <span class="btn-icon">⚔️</span>
                    View Encounters
                </button>
                <button class="btn btn-danger" onclick="document.getElementById('session-modal').style.display='none'; setTimeout(() => deleteSession('${session.id}'), 100)">
                    <span class="btn-icon">🗑️</span>
                    Delete Session
                </button>
            </div>
        </div>
    `;
    
    // Update modal title and body
    document.getElementById('session-modal-title').textContent = session.title;
    document.getElementById('session-modal-body').innerHTML = modalContent;
    
    // Show the modal
    document.getElementById('session-modal').style.display = 'flex';
}

function saveSession(event, sessionId) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    const sessionData = {
        title: formData.get('title'),
        chapter: formData.get('chapter') ? parseFloat(formData.get('chapter')) : null,
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
    document.getElementById('session-modal').style.display = 'none';
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
    }
}

// Helper functions
function getSessionEncounters(sessionId) {
    return currentData.encounters.filter(e => e.sessionId === sessionId);
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

// Initialize data structure if needed
function initializeSessionsData() {
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

// Also try to initialize when the function is called directly
function showSessionModal(sessionId = null) {
    // Ensure data is initialized
    if (typeof currentData === 'undefined' || !currentData.sessions) {
        initializeSessionsData();
    }
    
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
                    <input type="number" name="chapter" value="${session ? session.chapter : ''}" min="0" step="0.1" placeholder="e.g., 1, 1.5, 2.5">
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
                <button type="button" class="btn-secondary" onclick="document.getElementById('session-modal').style.display='none'">Cancel</button>
            </div>
        </form>
    `;
    
    // Update modal title and body
    const modal = document.getElementById('session-modal');
    const title = document.getElementById('session-modal-title');
    const body = document.getElementById('session-modal-body');
    
    if (!modal || !title || !body) {
        console.error('Modal elements not found');
        return;
    }
    
    title.textContent = isEdit ? 'Edit Session' : 'New Session';
    body.innerHTML = content;
    
    // Show the modal
    modal.style.display = 'flex';
    console.log('Modal should be visible now');
}
