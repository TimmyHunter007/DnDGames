// D&D DM Toolkit Shared JavaScript

// Global state
let currentData = {
    npcs: [],
    enemies: [],
    notes: [],
    items: [],
    initiative: [],
    diceHistory: [],
    spells: [],
    sessions: [],
    encounters: [],
    characters: []
};

// Campaign state
let campaigns = [];
let activeCampaign = null;

// Initialize app
document.addEventListener('DOMContentLoaded', async function() {
    await loadCampaigns();
    await loadData();
    initializeCampaignSelector();
    initializeNavigation();
    initializeReturnToTop();
    initializePage();
});

// Campaign Management
async function loadCampaigns() {
    try {
        const response = await fetch('/api/campaigns');
        if (response.ok) {
            campaigns = await response.json();
            console.log('Campaigns loaded:', campaigns);
            
            // Get active campaign from localStorage or use first one
            const savedCampaignId = localStorage.getItem('activeCampaignId');
            if (savedCampaignId && campaigns.find(c => c.id === savedCampaignId)) {
                activeCampaign = campaigns.find(c => c.id === savedCampaignId);
            } else if (campaigns.length > 0) {
                activeCampaign = campaigns[0];
                localStorage.setItem('activeCampaignId', activeCampaign.id);
            }
        }
    } catch (error) {
        console.error('Error loading campaigns:', error);
    }
}

async function setActiveCampaign(campaignId) {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (campaign) {
        activeCampaign = campaign;
        localStorage.setItem('activeCampaignId', campaignId);
        
        // Reload data for new campaign
        await loadData();
        
        // Refresh the current page
        initializePage();
        
        // Update campaign selector
        updateCampaignSelector();
        
        console.log('Active campaign changed to:', activeCampaign.name);
    }
}

function getActiveCampaign() {
    return activeCampaign;
}

function initializeCampaignSelector() {
    const navBar = document.querySelector('.navbar');
    if (!navBar) return;
    
    // Check if selector already exists
    if (document.getElementById('campaign-selector-container')) return;
    
    const selectorContainer = document.createElement('div');
    selectorContainer.id = 'campaign-selector-container';
    selectorContainer.className = 'campaign-selector-container';
    selectorContainer.innerHTML = `
        <select id="campaign-selector" class="campaign-selector" onchange="handleCampaignChange(this.value)">
            <option value="">Select Campaign...</option>
            ${campaigns.map(c => `<option value="${c.id}" ${activeCampaign && c.id === activeCampaign.id ? 'selected' : ''}>${c.name}</option>`).join('')}
        </select>
        <a href="/campaigns" class="nav-link campaign-manage-btn" title="Manage Campaigns">⚙️</a>
    `;
    
    // Insert after the nav-brand
    const navBrand = navBar.querySelector('.nav-brand');
    if (navBrand) {
        navBrand.insertAdjacentElement('afterend', selectorContainer);
    }
}

function updateCampaignSelector() {
    const selector = document.getElementById('campaign-selector');
    if (!selector) return;
    
    selector.innerHTML = `
        <option value="">Select Campaign...</option>
        ${campaigns.map(c => `<option value="${c.id}" ${activeCampaign && c.id === activeCampaign.id ? 'selected' : ''}>${c.name}</option>`).join('')}
    `;
}

async function handleCampaignChange(campaignId) {
    if (campaignId) {
        await setActiveCampaign(campaignId);
    }
}

// Data Persistence - Campaign-based
async function saveData() {
    if (!activeCampaign) {
        console.warn('No active campaign, data not saved');
        return;
    }
    
    try {
        // Save each data type to campaign-specific file
        const dataTypes = ['npcs', 'enemies', 'notes', 'items', 'initiative', 'diceHistory', 'spells', 'sessions', 'encounters'];
        
        for (const type of dataTypes) {
            if (currentData[type]) {
                const response = await fetch(`/api/campaigns/${activeCampaign.id}/data`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        type: type,
                        data: currentData[type]
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`Failed to save ${type}: ${response.status}`);
                }
            }
        }
        console.log('Data saved successfully to campaign:', activeCampaign.name);
    } catch (error) {
        console.error('Error saving campaign data:', error);
        alert('Error saving data: ' + error.message);
        // Fallback to localStorage if server is not available
        const storageKey = `dnd-toolkit-data-${activeCampaign.id}`;
        localStorage.setItem(storageKey, JSON.stringify(currentData));
    }
}

async function loadData() {
    if (!activeCampaign) {
        console.warn('No active campaign selected, using empty data');
        // Reset to empty data
        currentData = {
            npcs: [],
            enemies: [],
            notes: [],
            items: [],
            initiative: [],
            diceHistory: [],
            spells: [],
            sessions: [],
            encounters: [],
            characters: []
        };
        return;
    }
    
    try {
        const response = await fetch(`/api/campaigns/${activeCampaign.id}/data`);
        if (response.ok) {
            const serverData = await response.json();
            currentData = { ...currentData, ...serverData };
            console.log('Data loaded successfully from campaign:', activeCampaign.name, currentData);
        } else {
            throw new Error(`Server responded with status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error loading campaign data from server:', error);
        // Fallback to localStorage if server is not available
        const storageKey = `dnd-toolkit-data-${activeCampaign.id}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            currentData = { ...currentData, ...JSON.parse(saved) };
            console.log('Data loaded from localStorage fallback:', currentData);
        } else {
            console.log('No data found for campaign, starting with empty data');
            currentData = {
                npcs: [],
                enemies: [],
                notes: [],
                items: [],
                initiative: [],
                diceHistory: [],
                spells: [],
                sessions: [],
                encounters: []
            };
        }
    }
}

// Navigation
function initializeNavigation() {
    // Get current page from URL
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard';
    
    // Update active nav link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `/${currentPage}` || 
            (currentPage === '' && link.getAttribute('href') === '/')) {
            link.classList.add('active');
        }
    });

    // Initialize dropdown toggle
    const dropdownToggle = document.getElementById('navDropdownToggle');
    const dropdownMenu = document.getElementById('navDropdownMenu');
    
    if (dropdownToggle && dropdownMenu) {
        // Toggle dropdown on button click
        dropdownToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownToggle.classList.toggle('active');
            dropdownMenu.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!dropdownToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownToggle.classList.remove('active');
                dropdownMenu.classList.remove('active');
            }
        });
        
        // Close dropdown when clicking a link
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                dropdownToggle.classList.remove('active');
                dropdownMenu.classList.remove('active');
            });
        });
    }
}

// Return to Top Button
function initializeReturnToTop() {
    const returnToTopBtn = document.getElementById('returnToTop');
    
    if (!returnToTopBtn) return;
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            returnToTopBtn.classList.add('visible');
        } else {
            returnToTopBtn.classList.remove('visible');
        }
    });
    
    // Scroll to top when clicked
    returnToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Page-specific initialization
async function initializePage() {
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard';
    
    switch(currentPage) {
        case 'dashboard':
            await loadDashboard();
            break;
        case 'campaigns':
            if (typeof loadCampaignsPage === 'function') {
                loadCampaignsPage();
            }
            break;
        case 'characters':
            if (typeof loadCharactersPage === 'function') {
                loadCharactersPage();
            }
            break;
        case 'npcs':
            if (typeof loadNPCs === 'function') {
                loadNPCs();
            }
            break;
        case 'enemies':
            if (typeof loadEnemies === 'function') {
                loadEnemies();
            }
            break;
        case 'notes':
            if (typeof loadNotes === 'function') {
                loadNotes();
            }
            break;
        case 'dice':
            loadDiceHistory();
            break;
        case 'initiative':
            loadInitiative();
            break;
        case 'spells':
            loadSpells();
            break;
        case 'items':
            if (typeof loadItems === 'function') {
                loadItems();
            }
            break;
        case 'sessions':
            if (typeof loadSessions === 'function') {
                loadSessions();
            }
            break;
        case 'encounters':
            if (typeof loadEncounters === 'function') {
                loadEncounters();
            }
            break;
    }
}

// Modal Management
function showModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-content">
                ${content}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on escape key
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal(modal.querySelector('.modal-close'));
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
    
    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.querySelector('.modal-close'));
        }
    });
}

function closeModal(closeBtn) {
    if (!closeBtn) {
        console.error('closeModal called with null closeBtn');
        return;
    }
    
    // Try to find modal-overlay first (new modal style)
    let modal = closeBtn.closest('.modal-overlay');
    
    // If not found, try to find modal (old modal style)
    if (!modal) {
        modal = closeBtn.closest('.modal');
    }
    
    // If still not found, try to find by ID patterns
    if (!modal) {
        const modalIds = ['session-modal', 'encounter-modal'];
        for (const id of modalIds) {
            const element = document.getElementById(id);
            if (element && element.style.display !== 'none') {
                element.style.display = 'none';
                return;
            }
        }
    }
    
    if (modal) {
        modal.remove();
    } else {
        console.error('Could not find modal to close');
    }
}

// Utility functions
function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function formatDate(dateString) {
    // Handle date strings properly to avoid timezone issues
    if (!dateString) return 'No date';
    
    // If it's an ISO date string (YYYY-MM-DD), parse it as local date
    if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day); // month is 0-indexed
        return date.toLocaleDateString();
    }
    
    // For other date formats, use the original method
    return new Date(dateString).toLocaleDateString();
}

function formatTime(dateString) {
    return new Date(dateString).toLocaleTimeString();
}

// Common form handling
function handleFormSubmit(event, callback) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    callback(data);
}

// Common delete confirmation
function confirmDelete(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// Common item display functions
function createItemCard(item, type, actions) {
    return `
        <div class="content-item">
            <h3>${item.name}</h3>
            ${item.description ? `<p><strong>Description:</strong> ${item.description}</p>` : ''}
            ${actions ? `<div class="item-actions">${actions}</div>` : ''}
        </div>
    `;
}

// Dashboard functions
async function loadDashboard() {
    updateRecentNotes();
    updateActiveInitiative();
    // Update quick stats if on dashboard page
    if (typeof updateQuickStats === 'function') {
        updateQuickStats();
    }
}

function updateRecentNotes() {
    const container = document.getElementById('recent-notes');
    if (!container) return;
    
    const recentNotes = currentData.notes.slice(-3).reverse();
    
    if (recentNotes.length === 0) {
        container.innerHTML = '<p>No recent notes</p>';
        return;
    }
    
    container.innerHTML = recentNotes.map(note => 
        `<div class="recent-note" style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(167, 139, 250, 0.2);">
            <div style="font-weight: bold; color: #a78bfa; margin-bottom: 0.5rem;">${note.title}</div>
            <div style="color: #b8b8b8; line-height: 1.4;">${note.content.substring(0, 100)}${note.content.length > 100 ? '...' : ''}</div>
        </div>`
    ).join('');
}

function updateActiveInitiative() {
    const container = document.getElementById('active-initiative');
    if (!container) return;
    
    if (currentData.initiative.length === 0) {
        container.innerHTML = '<p>No active initiative</p>';
        return;
    }
    
    const currentTurn = currentData.initiative.find(item => item.current);
    if (currentTurn) {
        container.innerHTML = `
            <div class="current-turn">
                <strong>Current Turn: ${currentTurn.name}</strong>
                <p>Initiative: ${currentTurn.initiative}</p>
            </div>
        `;
    } else {
        container.innerHTML = '<p>No current turn</p>';
    }
}

// Dice rolling functions
async function rollDice(diceType) {
    const result = Math.floor(Math.random() * parseInt(diceType.substring(1)) + 1);
    const historyItem = {
        id: generateId(),
        dice: diceType,
        result: result,
        timestamp: new Date().toISOString()
    };
    
    currentData.diceHistory.unshift(historyItem);
    await saveData();
    
    const resultsContainer = document.getElementById('dice-results');
    if (resultsContainer) {
        resultsContainer.innerHTML = `
            <div class="dice-result">
                <div>${diceType}</div>
                <div style="font-size: 3rem; margin: 0.5rem 0;">${result}</div>
            </div>
        `;
    }
    
    loadDiceHistory();
}

async function rollCustomDice() {
    const count = parseInt(document.getElementById('dice-count')?.value) || 1;
    const sides = parseInt(document.getElementById('dice-type')?.value);
    const modifier = parseInt(document.getElementById('dice-modifier')?.value) || 0;
    
    const rolls = [];
    let total = 0;
    
    for (let i = 0; i < count; i++) {
        const roll = Math.floor(Math.random() * sides + 1);
        rolls.push(roll);
        total += roll;
    }
    
    total += modifier;
    
    const historyItem = {
        id: generateId(),
        dice: `${count}d${sides}${modifier ? (modifier > 0 ? '+' : '') + modifier : ''}`,
        result: total,
        rolls: rolls,
        modifier: modifier,
        timestamp: new Date().toISOString()
    };
    
    currentData.diceHistory.unshift(historyItem);
    await saveData();
    
    const resultsContainer = document.getElementById('dice-results');
    if (resultsContainer) {
        resultsContainer.innerHTML = `
            <div class="dice-result">
                <div>${historyItem.dice}</div>
                <div style="font-size: 2rem; margin: 0.5rem 0;">
                    ${rolls.join(', ')} ${modifier ? (modifier > 0 ? '+' : '') + modifier : ''}
                </div>
                <div style="font-size: 3rem; margin: 0.5rem 0;">${total}</div>
            </div>
        `;
    }
    
    loadDiceHistory();
}

function loadDiceHistory() {
    const container = document.getElementById('dice-history');
    if (!container) return;
    
    const recentHistory = currentData.diceHistory.slice(0, 10);
    
    if (recentHistory.length === 0) {
        container.innerHTML = '<p>No dice rolls yet</p>';
        return;
    }
    
    container.innerHTML = recentHistory.map(item => `
        <div class="dice-history-item">
            <strong>${item.dice}:</strong> ${item.result} 
            ${item.rolls ? `(${item.rolls.join(', ')})` : ''}
            <span style="float: right; font-size: 0.8em; opacity: 0.7;">
                ${formatTime(item.timestamp)}
            </span>
        </div>
    `).join('');
}

// Initiative functions
function loadInitiative() {
    const container = document.getElementById('initiative-list');
    if (!container) return;
    
    if (currentData.initiative.length === 0) {
        container.innerHTML = '<p>No creatures in initiative order. Add NPCs or enemies to get started!</p>';
        return;
    }
    
    // Sort by initiative (highest first)
    const sortedInitiative = [...currentData.initiative].sort((a, b) => b.initiative - a.initiative);
    
    container.innerHTML = sortedInitiative.map((item, index) => {
        const statsHtml = (item.hp || item.ac) ? `
            <div class="initiative-stats">
                ${item.hp ? `<span class="stat-badge hp-badge">HP: ${item.hp}</span>` : ''}
                ${item.ac ? `<span class="stat-badge ac-badge">AC: ${item.ac}</span>` : ''}
                <span class="initiative-number">${item.initiative}</span>
            </div>
        ` : '';
        
        // Death save tracking for Player Characters
        const deathSaveHtml = item.type === 'PC' ? `
            <div class="death-saves" id="death-saves-${item.id}">
                <div class="death-save-label">Death Saves:</div>
                <div class="death-save-tracker">
                    <div class="death-save-successes">
                        <span class="death-save-label-small">Successes:</span>
                        <div class="death-save-dots">
                            ${renderDeathSaveDots(item.deathSaves?.successes || 0, 'success')}
                        </div>
                    </div>
                    <div class="death-save-failures">
                        <span class="death-save-label-small">Failures:</span>
                        <div class="death-save-dots">
                            ${renderDeathSaveDots(item.deathSaves?.failures || 0, 'failure')}
                        </div>
                    </div>
                    <div class="death-save-actions">
                        <button class="btn-death-save btn-success" onclick="addDeathSave('${item.id}', 'success')" title="Add Success">✓</button>
                        <button class="btn-death-save btn-failure" onclick="addDeathSave('${item.id}', 'failure')" title="Add Failure">✗</button>
                        <button class="btn-death-save btn-reset" onclick="resetDeathSaves('${item.id}')" title="Reset">↻</button>
                    </div>
                </div>
            </div>
        ` : '';
        
        return `
        <div class="initiative-item ${item.current ? 'current' : ''}">
            <div class="initiative-info">
                <h4>${item.name}</h4>
                <p class="initiative-type">${item.type}</p>
                ${statsHtml}
                ${deathSaveHtml}
            </div>
            <div class="initiative-actions">
                <button class="btn-small" onclick="removeFromInitiative('${item.id}')">Remove</button>
                <button class="btn-small ${item.current ? 'btn-current' : ''}" onclick="toggleCurrentTurn('${item.id}')">
                    ${item.current ? 'Current' : 'Set Current'}
                </button>
            </div>
        </div>
        `;
    }).join('');
}

// Death save helper functions
function renderDeathSaveDots(count, type) {
    const dots = [];
    for (let i = 0; i < 3; i++) {
        const filled = i < count;
        const dotClass = filled ? `death-save-dot filled ${type}` : 'death-save-dot empty';
        dots.push(`<span class="${dotClass}"></span>`);
    }
    return dots.join('');
}

async function addDeathSave(characterId, type) {
    const initiativeItem = currentData.initiative.find(item => item.id === characterId);
    if (!initiativeItem) return;
    
    // Initialize death saves if not exists
    if (!initiativeItem.deathSaves) {
        initiativeItem.deathSaves = { successes: 0, failures: 0 };
    }
    
    if (type === 'success') {
        initiativeItem.deathSaves.successes++;
    } else if (type === 'failure') {
        initiativeItem.deathSaves.failures++;
    }
    
    // Check for death save results
    if (initiativeItem.deathSaves.successes >= 3) {
        alert(`${initiativeItem.name} has stabilized! (3 successes)`);
        initiativeItem.deathSaves = { successes: 0, failures: 0 };
    } else if (initiativeItem.deathSaves.failures >= 3) {
        alert(`${initiativeItem.name} has died! (3 failures)`);
        initiativeItem.deathSaves = { successes: 0, failures: 0 };
    }
    
    await saveData();
    loadInitiative();
}

async function resetDeathSaves(characterId) {
    const initiativeItem = currentData.initiative.find(item => item.id === characterId);
    if (!initiativeItem) return;
    
    if (confirm(`Reset death saves for ${initiativeItem.name}?`)) {
        initiativeItem.deathSaves = { successes: 0, failures: 0 };
        await saveData();
        loadInitiative();
    }
}

async function addToInitiative(id, type) {
    let source = '';
    let name = '';
    
    if (type === 'npc') {
        const npc = currentData.npcs.find(n => n.id === id);
        if (npc) {
            name = npc.name;
            source = `NPC - ${npc.race} ${npc.class || ''}`.trim();
        }
    } else if (type === 'enemy') {
        const enemy = currentData.enemies.find(e => e.id === id);
        if (enemy) {
            name = enemy.name;
            source = `Enemy - ${enemy.type || ''} (CR ${enemy.cr || '?'})`.trim();
        }
    }
    
    if (name) {
        const initiative = prompt(`Enter initiative for ${name}:`);
        if (initiative && !isNaN(initiative)) {
            const initiativeData = {
                id: generateId(),
                name: name,
                initiative: parseInt(initiative),
                type: type === 'npc' ? 'NPC' : 'Enemy',
                source: source,
                current: false
            };
            
            currentData.initiative.push(initiativeData);
            await saveData();
            loadInitiative();
            updateActiveInitiative();
        }
    }
}

async function removeFromInitiative(id) {
    currentData.initiative = currentData.initiative.filter(item => item.id !== id);
    await saveData();
    loadInitiative();
    updateActiveInitiative();
}

async function toggleCurrentTurn(id) {
    // Clear all current flags
    currentData.initiative.forEach(item => item.current = false);
    
    // Set current
    const item = currentData.initiative.find(i => i.id === id);
    if (item) {
        item.current = true;
    }
    
    await saveData();
    loadInitiative();
    updateActiveInitiative();
}

async function sortInitiative() {
    // Sort by initiative (highest first)
    currentData.initiative.sort((a, b) => b.initiative - a.initiative);
    await saveData();
    loadInitiative();
}

async function nextTurn() {
    if (currentData.initiative.length === 0) return;
    
    // Sort by initiative first
    await sortInitiative();
    
    // Find current turn
    const currentIndex = currentData.initiative.findIndex(item => item.current);
    let nextIndex;
    
    if (currentIndex === -1) {
        // No current turn, start with first
        nextIndex = 0;
    } else {
        // Move to next
        nextIndex = (currentIndex + 1) % currentData.initiative.length;
    }
    
    // Clear all current flags
    currentData.initiative.forEach(item => item.current = false);
    
    // Set new current
    if (currentData.initiative[nextIndex]) {
        currentData.initiative[nextIndex].current = true;
    }
    
    await saveData();
    loadInitiative();
    updateActiveInitiative();
}

function clearInitiative() {
    confirmDelete('Are you sure you want to clear all initiative?', async () => {
        currentData.initiative = [];
        await saveData();
        loadInitiative();
        updateActiveInitiative();
    });
}

// Spell functions
function sortSpells(spells) {
    // Sort by level first (0-9), then alphabetically by name
    return [...spells].sort((a, b) => {
        if (a.level !== b.level) {
            return a.level - b.level;
        }
        return a.name.localeCompare(b.name);
    });
}

function loadSpells() {
    const container = document.getElementById('spells-list');
    if (!container) return;
    
    if (currentData.spells.length === 0) {
        container.innerHTML = '<p>No spells available. Spells will be loaded from the data file.</p>';
        return;
    }
    
    const sortedSpells = sortSpells(currentData.spells);
    displaySpells(sortedSpells, container);
}

function displaySpells(spells, container) {
    let currentLevel = -1;
    let html = '';
    
    spells.forEach(spell => {
        // Add level header when level changes
        if (spell.level !== currentLevel) {
            currentLevel = spell.level;
            const levelHeader = spell.level === 0 ? 'Cantrips' : `Level ${spell.level}`;
            html += `<div class="spell-level-header"><h3>${levelHeader}</h3></div>`;
        }
        
        const levelText = spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`;
        const classesText = spell.classes ? spell.classes.join(', ') : '';
        
        html += `
        <div class="spell-item" onclick="showSpellDetails('${spell.id}')">
            <h3>${spell.name}</h3>
            <p><strong>${spell.school}</strong> ${classesText ? `• ${classesText}` : ''}</p>
        </div>
        `;
    });
    
    container.innerHTML = html;
}

function showSpellDetails(spellId) {
    const spell = currentData.spells.find(s => s.id === spellId);
    if (!spell) return;
    
    const levelText = spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`;
    const classesText = spell.classes ? spell.classes.join(', ') : '';
    
    const modalContent = `
        <div class="spell-details-new">
            <div class="spell-header">
                <div class="spell-title">${spell.name}</div>
                <div class="spell-meta">
                    <span class="meta-item level-${spell.level}">${levelText}</span>
                    <span class="meta-item school-${(spell.school || 'unknown').toLowerCase()}">${spell.school || 'Unknown'}</span>
                    ${classesText ? `<span class="meta-item classes">${classesText}</span>` : ''}
                </div>
            </div>
            
            <div class="spell-stats">
                <div class="stat-item">
                    <span class="stat-label">Casting Time</span>
                    <span class="stat-value">${spell.castingTime || 'Unknown'}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Range</span>
                    <span class="stat-value">${spell.range || 'Unknown'}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Components</span>
                    <span class="stat-value">${spell.components || 'Unknown'}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Duration</span>
                    <span class="stat-value">${spell.duration || 'Unknown'}</span>
                </div>
            </div>
            
            <div class="spell-section">
                <h4>Description</h4>
                <div class="section-content">${spell.description.replace(/\n/g, '<br>')}</div>
            </div>
            
            ${spell.upgrade ? `
                <div class="spell-section">
                    <h4>At Higher Levels</h4>
                    <div class="section-content">${spell.upgrade}</div>
                </div>
            ` : ''}
        </div>
    `;
    
    showModal(spell.name, modalContent);
}

function filterSpells() {
    const searchTerm = document.getElementById('spell-search')?.value.toLowerCase() || '';
    const container = document.getElementById('spells-list');
    
    if (!container) return;
    
    let filteredSpells = currentData.spells;
    
    // Apply search filter
    if (searchTerm) {
        filteredSpells = filteredSpells.filter(spell => {
            const searchableText = [
                spell.name,
                spell.school,
                spell.classes ? spell.classes.join(' ') : '',
                spell.description,
                spell.level === 0 ? 'cantrip' : `level ${spell.level}`
            ].join(' ').toLowerCase();
            
            return searchableText.includes(searchTerm);
        });
    }
    
    // Apply class filter (multiple selection)
    const selectedClasses = getSelectedClasses();
    if (selectedClasses.length > 0) {
        filteredSpells = filteredSpells.filter(spell => {
            // Check if the spell has any of the selected classes
            return spell.classes && spell.classes.some(spellClass => selectedClasses.includes(spellClass));
        });
    }
    
    if (filteredSpells.length === 0) {
        container.innerHTML = '<p>No spells found matching your filters.</p>';
        return;
    }
    
    const sortedSpells = sortSpells(filteredSpells);
    displaySpells(sortedSpells, container);
}

function getSelectedClasses() {
    const checkboxes = document.querySelectorAll('.class-filter-checkbox:checked');
    return Array.from(checkboxes).map(checkbox => checkbox.value);
}

function clearFilters() {
    // Clear search input
    const searchInput = document.getElementById('spell-search');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Clear all checkboxes
    const checkboxes = document.querySelectorAll('.class-filter-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Reload all spells
    loadSpells();
}

// Keep searchSpells for backwards compatibility
function searchSpells() {
    filterSpells();
}
