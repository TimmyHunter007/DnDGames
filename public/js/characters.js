// Player Characters JavaScript

function loadCharactersPage() {
    displayCharacters();
}

function displayCharacters() {
    const container = document.getElementById('characters-list');
    if (!container) return;
    
    
    if (currentData.characters && currentData.characters.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No Characters Yet</h3>
                <p>Add your first player character to get started!</p>
                <button class="action-btn" onclick="showCreateCharacterModal()">
                    <span>👤</span> Add Character
                </button>
            </div>
        `;
        return;
    }
    
    const characters = currentData.characters || [];
    container.innerHTML = characters.map(character => {
        const hasPortrait = character.portraitUrl && character.portraitUrl.trim() !== '';
        const avatarDisplay = hasPortrait 
            ? `<img src="${character.portraitUrl}" class="character-portrait" alt="${character.name}">`
            : `<span class="avatar-icon">${character.race ? getRaceEmoji(character.race) : '👤'}</span>`;
        
        return `
            <div class="character-card">
                <div class="character-header">
                    <div class="character-avatar ${hasPortrait ? 'has-portrait' : ''}">
                        ${avatarDisplay}
                    </div>
                    <div class="character-info">
                        <h3>${character.name}</h3>
                        <p class="character-subtitle">${character.class || 'Unknown Class'} • Level ${character.level || 1}</p>
                        <p class="character-race">${character.race || 'Unknown Race'} ${character.subrace ? `(${character.subrace})` : ''}</p>
                    </div>
                    <div class="character-status">
                        <span class="level-badge">${character.level || 1}</span>
                    </div>
                </div>
                
                <div class="character-stats">
                    <div class="stat-item">
                        <span class="stat-label">AC</span>
                        <span class="stat-value">${character.ac || '--'}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">HP</span>
                        <span class="stat-value">${character.hp || '--'}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Speed</span>
                        <span class="stat-value">${character.speed || '--'}</span>
                    </div>
                </div>
                
                <div class="character-abilities">
                    <div class="ability-scores">
                        ${renderAbilityScores(character)}
                    </div>
                </div>
                
                <div class="character-saving-throws">
                    <h4>Saving Throws</h4>
                    <div class="saving-throws-list">
                        ${renderAllSavingThrows(character)}
                    </div>
                </div>
                
                ${character.skills && character.skills.length > 0 ? `
                <div class="character-skills">
                    <h4>Proficient Skills</h4>
                    <div class="skills-list">
                        ${character.skills.map(skill => {
                            const skillData = getSkillData(skill);
                            const modifier = calculateSkillModifier(
                                character[skillData.ability.toLowerCase()] || 10,
                                character.level || 1,
                                true
                            );
                            return `<span class="skill-badge">${skill} +${modifier}</span>`;
                        }).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${character.status ? `
                <div class="character-status">
                    <h4>Status Effects</h4>
                    <p class="status-text">${character.status}</p>
                </div>
                ` : ''}
                
                <div class="character-description">
                    <p>${character.description || 'No description available'}</p>
                </div>
                
                <div class="character-notes">
                    <h4>Notes</h4>
                    <div class="notes-counter">
                        <span class="notes-count">${character.notes ? character.notes.length : 0} note${character.notes && character.notes.length !== 1 ? 's' : ''}</span>
                        ${character.notes && character.notes.length > 0 ? `
                            <span class="notes-preview">Latest: ${character.notes[character.notes.length - 1].content.substring(0, 50)}${character.notes[character.notes.length - 1].content.length > 50 ? '...' : ''}</span>
                        ` : ''}
                    </div>
                </div>
                
                <div class="character-actions">
                    <button class="action-btn btn-small" onclick="showEditCharacterModal('${character.id}')">
                        <span>✏️</span> Edit
                    </button>
                    <button class="action-btn btn-small" onclick="showCharacterNotesModal('${character.id}')">
                        <span>📝</span> Notes
                    </button>
                    <button class="action-btn btn-small" onclick="exportCharacter('${character.id}')">
                        <span>📤</span> Export
                    </button>
                    <button class="action-btn btn-small btn-danger" onclick="deleteCharacter('${character.id}')">
                        <span>🗑️</span> Delete
                    </button>
                </div>
                
                <div class="character-popup-action">
                    <button class="popup-btn character-window-btn" data-character-id="${character.id}">
                        <span>🪟</span> Pop-up Window
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    
    // Add event listeners for character window buttons
    const windowButtons = container.querySelectorAll('.character-window-btn');
    windowButtons.forEach(button => {
        button.addEventListener('click', function() {
            const characterId = this.getAttribute('data-character-id');
            openCharacterWindow(characterId);
        });
    });
}


function getRaceEmoji(race) {
    const raceEmojis = {
        'human': '👤',
        'elf': '🧝',
        'dwarf': '🧔',
        'halfling': '🧙',
        'dragonborn': '🐲',
        'gnome': '🧚',
        'half-elf': '🧝‍♀️',
        'half-orc': '👹',
        'tiefling': '👹',
        'orc': '👹',
        'goblin': '👺',
        'aasimar': '👼',
        'genasi': '🌪️',
        'goliath': '🗿',
        'triton': '🧜',
        'yuan-ti': '🐍',
        'firbolg': '🌲',
        'kenku': '🐦',
        'tabaxi': '🐱',
        'tortle': '🐢',
        'aarakocra': '🦅',
        'lizardfolk': '🦎',
        'bugbear': '🐻',
        'hobgoblin': '👺',
        'kobold': '🐉',
        'centaur': '🐎',
        'minotaur': '🐂',
        'satyr': '🐐',
        'simic hybrid': '🧬',
        'vedalken': '🔮',
        'loxodon': '🐘',
        'viashino': '🦎',
        'gith': '👽'
    };
    return raceEmojis[race.toLowerCase()] || '👤';
}

function showCreateCharacterModal() {
    const modalContent = `
        <form id="character-form" onsubmit="createCharacter(event)">
            <div class="form-section">
                <h3>Basic Information</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="character-name">Character Name *</label>
                        <input type="text" id="character-name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="character-level">Level</label>
                        <input type="number" id="character-level" name="level" min="1" max="20" value="1">
                    </div>
                    <div class="form-group">
                        <label for="character-class">Class</label>
                        <input type="text" id="character-class" name="class" placeholder="e.g., Fighter, Wizard">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="character-race">Race</label>
                        <input type="text" id="character-race" name="race" placeholder="e.g., Human, Elf">
                    </div>
                    <div class="form-group">
                        <label for="character-subrace">Subrace</label>
                        <input type="text" id="character-subrace" name="subrace" placeholder="e.g., High Elf, Mountain Dwarf">
                    </div>
                    <div class="form-group">
                        <label for="character-portrait">Character Portrait</label>
                        <input type="file" id="character-portrait" name="portrait" accept="image/*" onchange="previewCharacterImage(this, 'create-preview')">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <div id="create-preview" class="portrait-preview" style="margin-top: 0.5rem;"></div>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <div id="create-preview" class="portrait-preview" style="margin-top: 0.5rem;"></div>
                    </div>
                </div>
            
            <div class="form-section">
                <h3>Combat Stats</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="character-ac">Armor Class</label>
                        <input type="number" id="character-ac" name="ac" min="0" max="30">
                    </div>
                    <div class="form-group">
                        <label for="character-hp">Hit Points</label>
                        <input type="number" id="character-hp" name="hp" min="0">
                    </div>
                    <div class="form-group">
                        <label for="character-speed">Speed</label>
                        <input type="number" id="character-speed" name="speed" min="0" placeholder="30">
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <h3>Ability Scores</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="character-str">Strength</label>
                        <input type="number" id="character-str" name="str" min="1" max="30" value="10">
                    </div>
                    <div class="form-group">
                        <label for="character-dex">Dexterity</label>
                        <input type="number" id="character-dex" name="dex" min="1" max="30" value="10">
                    </div>
                    <div class="form-group">
                        <label for="character-con">Constitution</label>
                        <input type="number" id="character-con" name="con" min="1" max="30" value="10">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="character-int">Intelligence</label>
                        <input type="number" id="character-int" name="int" min="1" max="30" value="10">
                    </div>
                    <div class="form-group">
                        <label for="character-wis">Wisdom</label>
                        <input type="number" id="character-wis" name="wis" min="1" max="30" value="10">
                    </div>
                    <div class="form-group">
                        <label for="character-cha">Charisma</label>
                        <input type="number" id="character-cha" name="cha" min="1" max="30" value="10">
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <h3>Saving Throws</h3>
                <div class="form-group">
                    <label for="character-saving-throws">Proficient Saving Throws</label>
                    <div id="saving-throws-container" class="saving-throws-grid">
                        ${generateSavingThrowsCheckboxes()}
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <h3>Skills & Status</h3>
                <div class="form-group">
                    <label for="character-skills">Proficient Skills</label>
                    <div id="skills-container" class="skills-grid">
                        ${generateSkillsCheckboxes()}
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="character-status">Status Effects</label>
                    <textarea id="character-status" name="status" rows="2" placeholder="e.g., Blessed, Cursed, Poisoned, etc."></textarea>
                </div>
                
                <div class="form-group">
                    <label for="character-description">Description</label>
                    <textarea id="character-description" name="description" rows="3" placeholder="Character background, personality, etc."></textarea>
                </div>
            </div>
            
            <div class="modal-actions">
                <button type="submit" class="action-btn">Create Character</button>
                <button type="button" class="action-btn btn-secondary" onclick="closeModal(this)">Cancel</button>
            </div>
        </form>
    `;
    
    showModal('Create New Character', modalContent);
    
}

async function createCharacter(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Handle portrait image
    const portraitFile = formData.get('portrait');
    let portraitData = null;
    
    if (portraitFile && portraitFile.size > 0) {
        portraitData = await fileToBase64(portraitFile);
    }
    
    // Get selected skills and saving throws
    const selectedSkills = Array.from(form.querySelectorAll('input[name="skills"]:checked'))
        .map(checkbox => checkbox.value);
    const selectedSavingThrows = Array.from(form.querySelectorAll('input[name="savingThrows"]:checked'))
        .map(checkbox => checkbox.value);
    
    const characterData = {
        id: generateId(),
        name: formData.get('name'),
        level: parseInt(formData.get('level')) || 1,
        class: formData.get('class') || '',
        race: formData.get('race') || '',
        subrace: formData.get('subrace') || '',
        ac: formData.get('ac') ? parseInt(formData.get('ac')) : null,
        hp: formData.get('hp') ? parseInt(formData.get('hp')) : null,
        speed: formData.get('speed') ? parseInt(formData.get('speed')) : null,
        str: parseInt(formData.get('str')) || 10,
        dex: parseInt(formData.get('dex')) || 10,
        con: parseInt(formData.get('con')) || 10,
        int: parseInt(formData.get('int')) || 10,
        wis: parseInt(formData.get('wis')) || 10,
        cha: parseInt(formData.get('cha')) || 10,
        skills: selectedSkills,
        savingThrows: selectedSavingThrows,
        status: formData.get('status') || '',
        description: formData.get('description') || '',
        portraitUrl: portraitData || '',
        notes: [],
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString()
    };
    
    try {
        const response = await fetch(`/api/characters?campaignId=${activeCampaign?.id || ''}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(characterData)
        });
        
        if (response.ok) {
            await loadData();
            displayCharacters();
            
            // Close modal
            const modal = document.querySelector('.modal-overlay');
            if (modal) modal.remove();
            
            alert('Character created successfully!');
        } else {
            alert('Error creating character');
        }
    } catch (error) {
        console.error('Error creating character:', error);
        alert('Error creating character: ' + error.message);
    }
}

function showEditCharacterModal(characterId) {
    const character = currentData.characters.find(c => c.id === characterId);
    if (!character) {
        console.error('Character not found:', characterId);
        return;
    }
    
    const modalContent = `
        <form id="edit-character-form" onsubmit="updateCharacter(event, '${characterId}')">
            <div class="form-section">
                <h3>Basic Information</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="edit-character-name">Character Name *</label>
                        <input type="text" id="edit-character-name" name="name" value="${character.name}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-character-level">Level</label>
                        <input type="number" id="edit-character-level" name="level" min="1" max="20" value="${character.level || 1}">
                    </div>
                    <div class="form-group">
                        <label for="edit-character-class">Class</label>
                        <input type="text" id="edit-character-class" name="class" value="${character.class || ''}" placeholder="e.g., Fighter, Wizard">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="edit-character-race">Race</label>
                        <input type="text" id="edit-character-race" name="race" value="${character.race || ''}" placeholder="e.g., Human, Elf">
                    </div>
                    <div class="form-group">
                        <label for="edit-character-subrace">Subrace</label>
                        <input type="text" id="edit-character-subrace" name="subrace" value="${character.subrace || ''}" placeholder="e.g., High Elf, Mountain Dwarf">
                    </div>
                    <div class="form-group">
                        <label for="edit-character-portrait">Character Portrait</label>
                        <input type="file" id="edit-character-portrait" name="portrait" accept="image/*" onchange="previewCharacterImage(this, 'edit-preview')">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                    </div>
                    <div class="form-group">
                        <div id="edit-preview" class="portrait-preview" style="margin-top: 0.5rem;">
                            ${character.portraitUrl ? `<img src="${character.portraitUrl}" style="max-width: 200px; max-height: 200px; border-radius: 8px;">` : ''}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <h3>Combat Stats</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="edit-character-ac">Armor Class</label>
                        <input type="number" id="edit-character-ac" name="ac" min="0" max="30" value="${character.ac || ''}">
                    </div>
                    <div class="form-group">
                        <label for="edit-character-hp">Hit Points</label>
                        <input type="number" id="edit-character-hp" name="hp" min="0" value="${character.hp || ''}">
                    </div>
                    <div class="form-group">
                        <label for="edit-character-speed">Speed</label>
                        <input type="number" id="edit-character-speed" name="speed" min="0" value="${character.speed || ''}" placeholder="30">
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <h3>Ability Scores</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="edit-character-str">Strength</label>
                        <input type="number" id="edit-character-str" name="str" min="1" max="30" value="${character.str || 10}">
                    </div>
                    <div class="form-group">
                        <label for="edit-character-dex">Dexterity</label>
                        <input type="number" id="edit-character-dex" name="dex" min="1" max="30" value="${character.dex || 10}">
                    </div>
                    <div class="form-group">
                        <label for="edit-character-con">Constitution</label>
                        <input type="number" id="edit-character-con" name="con" min="1" max="30" value="${character.con || 10}">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="edit-character-int">Intelligence</label>
                        <input type="number" id="edit-character-int" name="int" min="1" max="30" value="${character.int || 10}">
                    </div>
                    <div class="form-group">
                        <label for="edit-character-wis">Wisdom</label>
                        <input type="number" id="edit-character-wis" name="wis" min="1" max="30" value="${character.wis || 10}">
                    </div>
                    <div class="form-group">
                        <label for="edit-character-cha">Charisma</label>
                        <input type="number" id="edit-character-cha" name="cha" min="1" max="30" value="${character.cha || 10}">
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <h3>Saving Throws</h3>
                <div class="form-group">
                    <label for="edit-character-saving-throws">Proficient Saving Throws</label>
                    <div id="edit-saving-throws-container" class="saving-throws-grid">
                        ${generateSavingThrowsCheckboxes(character.savingThrows || [])}
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <h3>Skills & Status</h3>
                <div class="form-group">
                    <label for="edit-character-skills">Proficient Skills</label>
                    <div id="edit-skills-container" class="skills-grid">
                        ${generateSkillsCheckboxes(character.skills || [])}
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="edit-character-status">Status Effects</label>
                    <textarea id="edit-character-status" name="status" rows="2" placeholder="e.g., Blessed, Cursed, Poisoned, etc.">${character.status || ''}</textarea>
                </div>
                
                <div class="form-group">
                    <label for="edit-character-description">Description</label>
                    <textarea id="edit-character-description" name="description" rows="3" placeholder="Character background, personality, etc.">${character.description || ''}</textarea>
                </div>
            </div>
            
            <div class="modal-actions">
                <button type="submit" class="action-btn">Update Character</button>
                <button type="button" class="action-btn btn-secondary" onclick="closeModal(this)">Cancel</button>
            </div>
        </form>
    `;
    
    showModal('Edit Character', modalContent);
}

async function updateCharacter(event, characterId) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Get existing character to preserve portrait if not updating
    const character = currentData.characters.find(c => c.id === characterId);
    
    // Handle portrait image
    const portraitFile = formData.get('portrait');
    let portraitData = character?.portraitUrl || '';
    
    if (portraitFile && portraitFile.size > 0) {
        portraitData = await fileToBase64(portraitFile);
    }
    
    // Get selected skills and saving throws
    const selectedSkills = Array.from(form.querySelectorAll('input[name="skills"]:checked'))
        .map(checkbox => checkbox.value);
    const selectedSavingThrows = Array.from(form.querySelectorAll('input[name="savingThrows"]:checked'))
        .map(checkbox => checkbox.value);
    
    const updateData = {
        name: formData.get('name'),
        level: parseInt(formData.get('level')) || 1,
        class: formData.get('class') || '',
        race: formData.get('race') || '',
        subrace: formData.get('subrace') || '',
        ac: formData.get('ac') ? parseInt(formData.get('ac')) : null,
        hp: formData.get('hp') ? parseInt(formData.get('hp')) : null,
        speed: formData.get('speed') ? parseInt(formData.get('speed')) : null,
        str: parseInt(formData.get('str')) || 10,
        dex: parseInt(formData.get('dex')) || 10,
        con: parseInt(formData.get('con')) || 10,
        int: parseInt(formData.get('int')) || 10,
        wis: parseInt(formData.get('wis')) || 10,
        cha: parseInt(formData.get('cha')) || 10,
        skills: selectedSkills,
        savingThrows: selectedSavingThrows,
        status: formData.get('status') || '',
        description: formData.get('description') || '',
        portraitUrl: portraitData,
        lastModified: new Date().toISOString()
    };
    
    try {
        const response = await fetch(`/api/characters/${characterId}?campaignId=${activeCampaign?.id || ''}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
        });
        
        if (response.ok) {
            await loadData();
            displayCharacters();
            
            // Close modal
            const modal = document.querySelector('.modal-overlay');
            if (modal) modal.remove();
            
            alert('Character updated successfully!');
        } else {
            alert('Error updating character');
        }
    } catch (error) {
        console.error('Error updating character:', error);
        alert('Error updating character: ' + error.message);
    }
}

function showCharacterNotesModal(characterId) {
    const character = currentData.characters.find(c => c.id === characterId);
    if (!character) return;
    
    const modalContent = `
        <div class="character-notes-modal">
            <h4>Notes for ${character.name}</h4>
            <div class="notes-list">
                ${character.notes ? character.notes.map(note => `
                    <div class="note-item">
                        <div class="note-header">
                            <span class="note-date">${formatDate(note.date)}</span>
                            <button class="btn-small btn-danger" onclick="deleteNote('${characterId}', '${note.id}')">Delete</button>
                        </div>
                        <p>${note.content}</p>
                    </div>
                `).join('') : '<p class="no-notes">No notes yet</p>'}
            </div>
            <form id="add-note-form" onsubmit="addNote(event, '${characterId}')">
                <div class="form-group">
                    <label for="new-note">Add New Note</label>
                    <textarea id="new-note" name="content" rows="3" required></textarea>
                </div>
                <button type="submit" class="action-btn">Add Note</button>
            </form>
        </div>
    `;
    
    showModal(`Notes - ${character.name}`, modalContent);
}

async function addNote(event, characterId) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const noteData = {
        id: generateId(),
        content: formData.get('content'),
        date: new Date().toISOString()
    };
    
    try {
        const response = await fetch(`/api/characters/${characterId}/notes?campaignId=${activeCampaign?.id || ''}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(noteData)
        });
        
        if (response.ok) {
            await loadData();
            displayCharacters();
            
            // Refresh the notes modal
            showCharacterNotesModal(characterId);
            
            alert('Note added successfully!');
        } else {
            alert('Error adding note');
        }
    } catch (error) {
        console.error('Error adding note:', error);
        alert('Error adding note: ' + error.message);
    }
}

async function deleteNote(characterId, noteId) {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
        const response = await fetch(`/api/characters/${characterId}/notes/${noteId}?campaignId=${activeCampaign?.id || ''}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await loadData();
            displayCharacters();
            
            // Refresh the notes modal
            showCharacterNotesModal(characterId);
            
            alert('Note deleted successfully!');
        } else {
            alert('Error deleting note');
        }
    } catch (error) {
        console.error('Error deleting note:', error);
        alert('Error deleting note: ' + error.message);
    }
}

async function deleteCharacter(characterId) {
    const character = currentData.characters.find(c => c.id === characterId);
    if (!character) return;
    
    if (!confirm(`Are you sure you want to delete the character "${character.name}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/characters/${characterId}?campaignId=${activeCampaign?.id || ''}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await loadData();
            displayCharacters();
            alert('Character deleted successfully!');
        } else {
            alert('Error deleting character');
        }
    } catch (error) {
        console.error('Error deleting character:', error);
        alert('Error deleting character: ' + error.message);
    }
}

async function exportCharacter(characterId) {
    try {
        const response = await fetch(`/api/characters/${characterId}/export?campaignId=${activeCampaign?.id || ''}`);
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const character = currentData.characters.find(c => c.id === characterId);
            const characterName = character ? character.name.replace(/\s+/g, '-') : characterId;
            a.download = `character-${characterName}-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } else {
            alert('Error exporting character data');
        }
    } catch (error) {
        console.error('Export error:', error);
        alert('Error exporting character data');
    }
}

function openCharacterWindow(characterId) {
    
    // Check if we're running in Electron
    if (window.electron && window.electron.ipcRenderer) {
        try {
            window.electron.ipcRenderer.send('open-character-window', {
                characterId: characterId,
                campaignId: activeCampaign?.id || ''
            });
        } catch (error) {
            console.error('Error opening character window:', error);
            // Fallback: open in new browser tab
            const url = `/character-window?characterId=${characterId}&campaignId=${activeCampaign?.id || ''}`;
            window.open(url, '_blank');
        }
    } else {
        // Fallback for web version: open in new tab
        const url = `/character-window?characterId=${characterId}&campaignId=${activeCampaign?.id || ''}`;
        window.open(url, '_blank');
    }
}

// Image handling functions
function previewCharacterImage(input, previewId) {
    const preview = document.getElementById(previewId);
    if (!preview) return;
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" style="max-width: 200px; max-height: 200px; border-radius: 8px; border: 2px solid #a78bfa;">`;
        };
        
        reader.readAsDataURL(input.files[0]);
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

function generateSavingThrowsCheckboxes(selectedSavingThrows = []) {
    const savingThrows = [
        { name: 'STR', fullName: 'Strength' },
        { name: 'DEX', fullName: 'Dexterity' },
        { name: 'CON', fullName: 'Constitution' },
        { name: 'INT', fullName: 'Intelligence' },
        { name: 'WIS', fullName: 'Wisdom' },
        { name: 'CHA', fullName: 'Charisma' }
    ];
    
    return savingThrows.map(savingThrow => {
        const isSelected = selectedSavingThrows.includes(savingThrow.name);
        return `
            <label class="skill-checkbox">
                <input type="checkbox" name="savingThrows" value="${savingThrow.name}" ${isSelected ? 'checked' : ''}>
                <span class="skill-name">${savingThrow.fullName}</span>
                <span class="skill-ability">(${savingThrow.name})</span>
            </label>
        `;
    }).join('');
}

function generateSkillsCheckboxes(selectedSkills = []) {
    const skills = [
        { name: 'Acrobatics', ability: 'DEX' },
        { name: 'Animal Handling', ability: 'WIS' },
        { name: 'Arcana', ability: 'INT' },
        { name: 'Athletics', ability: 'STR' },
        { name: 'Deception', ability: 'CHA' },
        { name: 'History', ability: 'INT' },
        { name: 'Insight', ability: 'WIS' },
        { name: 'Intimidation', ability: 'CHA' },
        { name: 'Investigation', ability: 'INT' },
        { name: 'Medicine', ability: 'WIS' },
        { name: 'Nature', ability: 'INT' },
        { name: 'Perception', ability: 'WIS' },
        { name: 'Performance', ability: 'CHA' },
        { name: 'Persuasion', ability: 'CHA' },
        { name: 'Religion', ability: 'INT' },
        { name: 'Sleight of Hand', ability: 'DEX' },
        { name: 'Stealth', ability: 'DEX' },
        { name: 'Survival', ability: 'WIS' }
    ];
    
    return skills.map(skill => {
        const isSelected = selectedSkills.includes(skill.name);
        return `
            <label class="skill-checkbox">
                <input type="checkbox" name="skills" value="${skill.name}" data-ability="${skill.ability}" ${isSelected ? 'checked' : ''}>
                <span class="skill-name">${skill.name}</span>
                <span class="skill-ability">(${skill.ability})</span>
            </label>
        `;
    }).join('');
}

function calculateAbilityModifier(score) {
    return Math.floor((score - 10) / 2);
}

function calculateProficiencyBonus(level) {
    // D&D 5e proficiency bonus: +2 at levels 1-4, +3 at 5-8, +4 at 9-12, +5 at 13-16, +6 at 17-20
    if (level >= 17) return 6;
    if (level >= 13) return 5;
    if (level >= 9) return 4;
    if (level >= 5) return 3;
    return 2;
}

function calculateSkillModifier(abilityScore, level, isProficient) {
    const abilityMod = calculateAbilityModifier(abilityScore);
    const profBonus = isProficient ? calculateProficiencyBonus(level) : 0;
    return abilityMod + profBonus;
}

function calculateSavingThrowModifier(abilityScore, level, isProficient) {
    const abilityMod = calculateAbilityModifier(abilityScore);
    const profBonus = isProficient ? calculateProficiencyBonus(level) : 0;
    return abilityMod + profBonus;
}

function renderAbilityScores(character) {
    const abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    const abilityNames = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
    
    return abilities.map((ability, index) => {
        const score = character[ability] || 10;
        const modifier = calculateAbilityModifier(score);
        const modifierText = modifier >= 0 ? `+${modifier}` : `${modifier}`;
        
        return `
            <div class="ability-score">
                <span class="ability-name">${abilityNames[index]}</span>
                <span class="ability-value">${score}</span>
                <span class="ability-modifier">${modifierText}</span>
            </div>
        `;
    }).join('');
}

function getSkillData(skillName) {
    const skills = [
        { name: 'Acrobatics', ability: 'DEX' },
        { name: 'Animal Handling', ability: 'WIS' },
        { name: 'Arcana', ability: 'INT' },
        { name: 'Athletics', ability: 'STR' },
        { name: 'Deception', ability: 'CHA' },
        { name: 'History', ability: 'INT' },
        { name: 'Insight', ability: 'WIS' },
        { name: 'Intimidation', ability: 'CHA' },
        { name: 'Investigation', ability: 'INT' },
        { name: 'Medicine', ability: 'WIS' },
        { name: 'Nature', ability: 'INT' },
        { name: 'Perception', ability: 'WIS' },
        { name: 'Performance', ability: 'CHA' },
        { name: 'Persuasion', ability: 'CHA' },
        { name: 'Religion', ability: 'INT' },
        { name: 'Sleight of Hand', ability: 'DEX' },
        { name: 'Stealth', ability: 'DEX' },
        { name: 'Survival', ability: 'WIS' }
    ];
    
    return skills.find(skill => skill.name === skillName) || { ability: 'STR' };
}

function renderAllSavingThrows(character) {
    const savingThrows = [
        { name: 'STR', fullName: 'Strength' },
        { name: 'DEX', fullName: 'Dexterity' },
        { name: 'CON', fullName: 'Constitution' },
        { name: 'INT', fullName: 'Intelligence' },
        { name: 'WIS', fullName: 'Wisdom' },
        { name: 'CHA', fullName: 'Charisma' }
    ];
    
    const proficientSavingThrows = character.savingThrows || [];
    
    return savingThrows.map(savingThrow => {
        const abilityScore = character[savingThrow.name.toLowerCase()] || 10;
        const isProficient = proficientSavingThrows.includes(savingThrow.name);
        const modifier = calculateSavingThrowModifier(
            abilityScore,
            character.level || 1,
            isProficient
        );
        
        const badgeClass = isProficient ? 'saving-throw-badge' : 'saving-throw-badge non-proficient';
        return `<span class="${badgeClass}">${savingThrow.name} ${modifier >= 0 ? '+' : ''}${modifier}</span>`;
    }).join('');
}

function renderAllSkills(character) {
    const skills = [
        { name: 'Acrobatics', ability: 'DEX' },
        { name: 'Animal Handling', ability: 'WIS' },
        { name: 'Arcana', ability: 'INT' },
        { name: 'Athletics', ability: 'STR' },
        { name: 'Deception', ability: 'CHA' },
        { name: 'History', ability: 'INT' },
        { name: 'Insight', ability: 'WIS' },
        { name: 'Intimidation', ability: 'CHA' },
        { name: 'Investigation', ability: 'INT' },
        { name: 'Medicine', ability: 'WIS' },
        { name: 'Nature', ability: 'INT' },
        { name: 'Perception', ability: 'WIS' },
        { name: 'Performance', ability: 'CHA' },
        { name: 'Persuasion', ability: 'CHA' },
        { name: 'Religion', ability: 'INT' },
        { name: 'Sleight of Hand', ability: 'DEX' },
        { name: 'Stealth', ability: 'DEX' },
        { name: 'Survival', ability: 'WIS' }
    ];
    
    const proficientSkills = character.skills || [];
    
    return skills.map(skill => {
        const abilityScore = character[skill.ability.toLowerCase()] || 10;
        const isProficient = proficientSkills.includes(skill.name);
        const modifier = calculateSkillModifier(
            abilityScore,
            character.level || 1,
            isProficient
        );
        
        const badgeClass = isProficient ? 'skill-badge' : 'skill-badge non-proficient';
        return `<span class="${badgeClass}">${skill.name} ${modifier >= 0 ? '+' : ''}${modifier}</span>`;
    }).join('');
}


