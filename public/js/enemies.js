// Enemies-specific JavaScript

function loadEnemies() {
    const enemiesList = document.getElementById('enemies-list');
    
    if (currentData.enemies.length === 0) {
        enemiesList.innerHTML = '<p>No enemies created yet. Click "Add New Enemy" to get started!</p>';
        return;
    }
    
    // Group enemies by CR
    const enemiesByCR = {};
    
    currentData.enemies.forEach(enemy => {
        const cr = enemy.cr || 'Unknown';
        if (!enemiesByCR[cr]) {
            enemiesByCR[cr] = [];
        }
        enemiesByCR[cr].push(enemy);
    });
    
    // Sort CR groups (handle fractions and numbers)
    const crOrder = Object.keys(enemiesByCR).sort((a, b) => {
        // Handle special cases
        if (a === 'Unknown') return 1;
        if (b === 'Unknown') return -1;
        
        // Handle fractions (1/4, 1/2, etc.)
        const aNum = a.includes('/') ? parseFloat(a.split('/')[0]) / parseFloat(a.split('/')[1]) : parseFloat(a);
        const bNum = b.includes('/') ? parseFloat(b.split('/')[0]) / parseFloat(b.split('/')[1]) : parseFloat(b);
        
        return aNum - bNum;
    });
    
    // Build HTML with CR headers
    let html = '';
    
    crOrder.forEach(cr => {
        // Sort enemies within each CR group alphabetically
        const sortedEnemies = enemiesByCR[cr].sort((a, b) => {
            return a.name.localeCompare(b.name);
        });
        
        // Add CR header
        html += `
        <div class="cr-level-header">
            <h3>Challenge Rating ${cr}</h3>
        </div>
        `;
        
        // Add enemies for this CR
        html += sortedEnemies.map(enemy => {
            const typeText = enemy.type || 'Unknown';
            const tags = enemy.tags || [];
            const tagsHtml = tags.length > 0 ? 
                `<div class="enemy-tags">${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : '';
            
            return `
            <div class="spell-item" onclick="showEnemyDetails('${enemy.id}')" data-tags="${tags.join(',')}">
                <h3>${enemy.name}</h3>
                <p><strong>CR ${cr}</strong> • ${typeText}</p>
                ${tagsHtml}
            </div>
            `;
        }).join('');
    });
    
    enemiesList.innerHTML = html;
    loadTagFilters();
}

function loadTagFilters() {
    const tagButtons = document.getElementById('tag-filter-buttons');
    const allTags = new Set();
    
    // Collect all unique tags from enemies
    currentData.enemies.forEach(enemy => {
        if (enemy.tags) {
            enemy.tags.forEach(tag => allTags.add(tag));
        }
    });
    
    // Create filter buttons
    const sortedTags = Array.from(allTags).sort();
    tagButtons.innerHTML = sortedTags.map(tag => 
        `<button class="tag-filter-btn" onclick="toggleTagFilter('${tag}')">${tag}</button>`
    ).join('');
}

function toggleTagFilter(tag) {
    const button = document.querySelector(`[onclick="toggleTagFilter('${tag}')"]`);
    button.classList.toggle('active');
    
    // Filter enemies based on active tags
    const activeTags = Array.from(document.querySelectorAll('.tag-filter-btn.active'))
        .map(btn => btn.textContent);
    
    filterEnemiesByTags(activeTags);
}

function filterEnemiesByTags(activeTags) {
    const enemyItems = document.querySelectorAll('.spell-item[data-tags]');
    
    enemyItems.forEach(item => {
        const itemTags = item.getAttribute('data-tags').split(',');
        
        if (activeTags.length === 0 || activeTags.some(tag => itemTags.includes(tag))) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
    
    // Also hide CR headers if no enemies are visible in that section
    const crHeaders = document.querySelectorAll('.cr-level-header');
    crHeaders.forEach(header => {
        const nextSiblings = Array.from(header.parentNode.children)
            .slice(header.parentNode.children.indexOf(header) + 1);
        
        const hasVisibleEnemies = nextSiblings.some(sibling => {
            if (sibling.classList.contains('cr-level-header')) return false;
            return sibling.style.display !== 'none';
        });
        
        header.style.display = hasVisibleEnemies ? 'block' : 'none';
    });
}

function clearTagFilters() {
    document.querySelectorAll('.tag-filter-btn.active').forEach(btn => {
        btn.classList.remove('active');
    });
    
    filterEnemiesByTags([]);
}

function showEnemyDetails(enemyId) {
    const enemy = currentData.enemies.find(e => e.id === enemyId);
    if (!enemy) return;
    
    const modalContent = `
        <div class="enemy-details">
            <div class="enemy-header">
                <div class="enemy-title">${enemy.name}</div>
                <div class="enemy-meta">
                    <span class="meta-item size-${(enemy.size || 'medium').toLowerCase()}">${enemy.size || 'Medium'}</span>
                    <span class="meta-item type-${(enemy.type || 'unknown').toLowerCase()}">${enemy.type || 'Unknown'}</span>
                    <span class="meta-item cr-${(enemy.cr || 'unknown').toString().replace('/', '-')}">CR ${enemy.cr || 'Unknown'}</span>
                    <span class="meta-item alignment">${enemy.alignment || 'Unaligned'}</span>
                </div>
            </div>
            
            <div class="enemy-stats">
                <div class="stat-item">
                    <span class="stat-label">AC</span>
                    <span class="stat-value">${enemy.ac || 'Unknown'}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">HP</span>
                    <span class="stat-value">${enemy.hp || 'Unknown'}${enemy.hitDice ? ` (${enemy.hitDice})` : ''}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Speed</span>
                    <span class="stat-value">${enemy.speed || 'Unknown'}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">XP</span>
                    <span class="stat-value">${enemy.xp || 'Unknown'}</span>
                </div>
            </div>
            
            ${enemy.stats ? `
                <div class="enemy-abilities">
                    <h4>Ability Scores</h4>
                    <div class="ability-grid">
                        <div class="ability-item"><span class="ability-label">STR</span><span class="ability-value">${enemy.stats.str || enemy.str || 10}</span></div>
                        <div class="ability-item"><span class="ability-label">DEX</span><span class="ability-value">${enemy.stats.dex || enemy.dex || 10}</span></div>
                        <div class="ability-item"><span class="ability-label">CON</span><span class="ability-value">${enemy.stats.con || enemy.con || 10}</span></div>
                        <div class="ability-item"><span class="ability-label">INT</span><span class="ability-value">${enemy.stats.int || enemy.int || 10}</span></div>
                        <div class="ability-item"><span class="ability-label">WIS</span><span class="ability-value">${enemy.stats.wis || enemy.wis || 10}</span></div>
                        <div class="ability-item"><span class="ability-label">CHA</span><span class="ability-value">${enemy.stats.cha || enemy.cha || 10}</span></div>
                    </div>
                </div>
            ` : ''}
            
            ${enemy.saves && Object.keys(enemy.saves).length > 0 ? `
                <div class="enemy-section">
                    <h4>Saving Throws</h4>
                    <div class="section-content">${Object.entries(enemy.saves).map(([key, val]) => `${key.toUpperCase()} +${val}`).join(', ')}</div>
                </div>
            ` : ''}
            
            ${enemy.skills ? `
                <div class="enemy-section">
                    <h4>Skills</h4>
                    <div class="section-content">${enemy.skills}</div>
                </div>
            ` : ''}
            
            ${enemy.vulnerabilities ? `
                <div class="enemy-section">
                    <h4>Damage Vulnerabilities</h4>
                    <div class="section-content">${enemy.vulnerabilities}</div>
                </div>
            ` : ''}
            
            ${enemy.resistances ? `
                <div class="enemy-section">
                    <h4>Damage Resistances</h4>
                    <div class="section-content">${enemy.resistances}</div>
                </div>
            ` : ''}
            
            ${enemy.immunities ? `
                <div class="enemy-section">
                    <h4>Damage Immunities</h4>
                    <div class="section-content">${enemy.immunities}</div>
                </div>
            ` : ''}
            
            ${enemy.senses ? `
                <div class="enemy-section">
                    <h4>Senses</h4>
                    <div class="section-content">${enemy.senses}</div>
                </div>
            ` : ''}
            
            ${enemy.languages ? `
                <div class="enemy-section">
                    <h4>Languages</h4>
                    <div class="section-content">${enemy.languages}</div>
                </div>
            ` : ''}
            
            ${enemy.traits ? `
                <div class="enemy-section">
                    <h4>Traits</h4>
                    <div class="section-content">${(enemy.traits.replace ? enemy.traits : '').replace(/\n/g, '<br>')}</div>
                </div>
            ` : ''}
            
            ${enemy.actions ? `
                <div class="enemy-section">
                    <h4>Actions</h4>
                    <div class="section-content">${(enemy.actions.replace ? enemy.actions : '').replace(/\n/g, '<br>')}</div>
                </div>
            ` : ''}
            
            ${enemy.attacks ? `
                <div class="enemy-section">
                    <h4>Attacks</h4>
                    <div class="section-content">${(enemy.attacks.replace ? enemy.attacks : '').replace(/\n/g, '<br>')}</div>
                </div>
            ` : ''}
            
            ${enemy.bonusActions ? `
                <div class="enemy-section">
                    <h4>Bonus Actions</h4>
                    <div class="section-content">${(enemy.bonusActions.replace ? enemy.bonusActions : '').replace(/\n/g, '<br>')}</div>
                </div>
            ` : ''}
            
            ${enemy.reactions ? `
                <div class="enemy-section">
                    <h4>Reactions</h4>
                    <div class="section-content">${(enemy.reactions.replace ? enemy.reactions : '').replace(/\n/g, '<br>')}</div>
                </div>
            ` : ''}
            
            ${enemy.legendaryActions ? `
                <div class="enemy-section">
                    <h4>Legendary Actions</h4>
                    <div class="section-content">${(enemy.legendaryActions.replace ? enemy.legendaryActions : '').replace(/\n/g, '<br>')}</div>
                </div>
            ` : ''}
            
            ${enemy.abilities ? `
                <div class="enemy-section">
                    <h4>Special Abilities</h4>
                    <div class="section-content">${(enemy.abilities.replace ? enemy.abilities : '').replace(/\n/g, '<br>')}</div>
                </div>
            ` : ''}
            
            ${enemy.tags && enemy.tags.length > 0 ? `
                <div class="enemy-section">
                    <h4>Tags</h4>
                    <div class="enemy-tags">
                        ${enemy.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${enemy.description ? `
                <div class="enemy-section">
                    <h4>Description:</h4>
                    <p>${(enemy.description.replace ? enemy.description : '').replace(/\n/g, '<br>')}</p>
                </div>
            ` : ''}
            
            ${enemy.habitat ? `
                <div class="enemy-section">
                    <h4>Habitat</h4>
                    <div class="section-content">${enemy.habitat}</div>
                </div>
            ` : ''}
            
            <div class="enemy-actions">
                <button class="btn btn-primary" onclick="closeModal(document.querySelector('.modal-close')); setTimeout(() => editEnemy('${enemy.id}'), 100)">
                    <span>✏️</span> Edit
                </button>
                <button class="btn btn-secondary" onclick="closeModal(document.querySelector('.modal-close')); addToInitiative('${enemy.id}', 'enemy')">
                    <span>⚔️</span> Add to Initiative
                </button>
                <button class="btn btn-danger" onclick="closeModal(document.querySelector('.modal-close')); setTimeout(() => deleteEnemy('${enemy.id}'), 100)">
                    <span>🗑️</span> Delete
                </button>
            </div>
        </div>
    `;
    
    showModal(enemy.name, modalContent);
}

function showEnemyModal(enemyId = null) {
    const isEdit = enemyId !== null;
    const enemy = isEdit ? currentData.enemies.find(e => e.id === enemyId) : null;
    
    const content = `
        <form onsubmit="saveEnemy(event, ${enemyId ? `'${enemyId}'` : 'null'})">
            <div class="form-row">
                <div class="form-group">
                    <label>Name *</label>
                    <input type="text" name="name" value="${enemy ? enemy.name : ''}" required>
                </div>
                <div class="form-group">
                    <label>Type</label>
                    <input type="text" name="type" value="${enemy ? enemy.type : ''}" placeholder="e.g., Dragon, Goblin">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Challenge Rating (CR)</label>
                    <input type="text" name="cr" value="${enemy ? enemy.cr : ''}" placeholder="e.g., 1/2, 1, 5">
                </div>
                <div class="form-group">
                    <label>Armor Class (AC)</label>
                    <input type="number" name="ac" value="${enemy ? enemy.ac : ''}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Hit Points</label>
                    <input type="number" name="hp" value="${enemy ? enemy.hp : ''}">
                </div>
                <div class="form-group">
                    <label>Speed</label>
                    <input type="text" name="speed" value="${enemy ? enemy.speed : ''}" placeholder="e.g., 30 ft., fly 60 ft.">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>STR</label>
                    <input type="number" name="str" value="${enemy ? enemy.str : ''}">
                </div>
                <div class="form-group">
                    <label>DEX</label>
                    <input type="number" name="dex" value="${enemy ? enemy.dex : ''}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>CON</label>
                    <input type="number" name="con" value="${enemy ? enemy.con : ''}">
                </div>
                <div class="form-group">
                    <label>INT</label>
                    <input type="number" name="int" value="${enemy ? enemy.int : ''}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>WIS</label>
                    <input type="number" name="wis" value="${enemy ? enemy.wis : ''}">
                </div>
                <div class="form-group">
                    <label>CHA</label>
                    <input type="number" name="cha" value="${enemy ? enemy.cha : ''}">
                </div>
            </div>
            <div class="form-group">
                <label>Attacks</label>
                <textarea name="attacks" rows="3" placeholder="Describe attacks, damage, and effects">${enemy ? enemy.attacks : ''}</textarea>
            </div>
            <div class="form-group">
                <label>Special Abilities</label>
                <textarea name="abilities" rows="3" placeholder="Describe special abilities, spells, etc.">${enemy ? enemy.abilities : ''}</textarea>
            </div>
            <div class="form-group">
                <label>Tags</label>
                <input type="text" name="tags" value="${enemy ? (enemy.tags ? enemy.tags.join(', ') : '') : ''}" placeholder="e.g., undead, boss, dungeon, forest">
                <small style="color: #b8b8b8; font-size: 0.8rem;">Separate multiple tags with commas</small>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea name="description" rows="3">${enemy ? enemy.description : ''}</textarea>
            </div>
            <div class="form-group">
                <button type="submit" class="btn-primary">${isEdit ? 'Update' : 'Create'} Enemy</button>
            </div>
        </form>
    `;
    
    showModal(isEdit ? 'Edit Enemy' : 'Create New Enemy', content);
}

async function saveEnemy(event, enemyId) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const enemyData = Object.fromEntries(formData.entries());
    
    // Process tags - convert comma-separated string to array
    if (enemyData.tags) {
        enemyData.tags = enemyData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    } else {
        enemyData.tags = [];
    }
    
    if (enemyId) {
        const index = currentData.enemies.findIndex(e => e.id === enemyId);
        if (index !== -1) {
            currentData.enemies[index] = { ...currentData.enemies[index], ...enemyData };
        }
    } else {
        enemyData.id = generateId();
        currentData.enemies.push(enemyData);
    }
    
    await saveData();
    closeModal(event.target.closest('.modal-overlay').querySelector('.modal-close'));
    loadEnemies();
}

function editEnemy(enemyId) {
    showEnemyModal(enemyId);
}

function deleteEnemy(enemyId) {
    confirmDelete('Are you sure you want to delete this enemy?', async () => {
        currentData.enemies = currentData.enemies.filter(e => e.id !== enemyId);
        await saveData();
        loadEnemies();
    });
}

// Random Enemy Generator
function showRandomGeneratorModal() {
    const content = `
        <div class="random-generator-section">
            <h4>Random Enemy Generator</h4>
            <p>Generate a random enemy following D&D 5e rules and realistic stats.</p>
            
            <div class="generator-options">
                <div class="form-row">
                    <div class="form-group">
                        <label>Challenge Rating:</label>
                        <select id="generator-cr">
                            <option value="1/8">CR 1/8</option>
                            <option value="1/4" selected>CR 1/4</option>
                            <option value="1/2">CR 1/2</option>
                            <option value="1">CR 1</option>
                            <option value="2">CR 2</option>
                            <option value="3">CR 3</option>
                            <option value="4">CR 4</option>
                            <option value="5">CR 5</option>
                            <option value="6">CR 6</option>
                            <option value="7">CR 7</option>
                            <option value="8">CR 8</option>
                            <option value="9">CR 9</option>
                            <option value="10">CR 10</option>
                            <option value="11">CR 11</option>
                            <option value="12">CR 12</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Enemy Type:</label>
                        <select id="generator-type">
                            <option value="random">Random Type</option>
                            <option value="beast">Beast</option>
                            <option value="humanoid">Humanoid</option>
                            <option value="undead">Undead</option>
                            <option value="fiend">Fiend</option>
                            <option value="celestial">Celestial</option>
                            <option value="elemental">Elemental</option>
                            <option value="dragon">Dragon</option>
                            <option value="aberration">Aberration</option>
                            <option value="construct">Construct</option>
                            <option value="fey">Fey</option>
                            <option value="giant">Giant</option>
                            <option value="monstrosity">Monstrosity</option>
                            <option value="ooze">Ooze</option>
                            <option value="plant">Plant</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Environment:</label>
                        <select id="generator-environment">
                            <option value="any">Any Environment</option>
                            <option value="arctic">Arctic</option>
                            <option value="coastal">Coastal</option>
                            <option value="desert">Desert</option>
                            <option value="forest">Forest</option>
                            <option value="grassland">Grassland</option>
                            <option value="hill">Hill</option>
                            <option value="mountain">Mountain</option>
                            <option value="swamp">Swamp</option>
                            <option value="underdark">Underdark</option>
                            <option value="underwater">Underwater</option>
                            <option value="urban">Urban</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Difficulty:</label>
                        <select id="generator-difficulty">
                            <option value="easy">Easy</option>
                            <option value="normal" selected>Normal</option>
                            <option value="hard">Hard</option>
                            <option value="deadly">Deadly</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="include-abilities" checked> Include Special Abilities
                    </label>
                    <label>
                        <input type="checkbox" id="force-caster"> Force Spellcaster (overrides type-based decision)
                    </label>
                    <label>
                        <input type="checkbox" id="include-equipment" checked> Include Equipment
                    </label>
                </div>
            </div>
            
            <div class="form-actions">
                <button class="btn-primary" onclick="generateRandomEnemy()">🎲 Generate Enemy</button>
                <button class="btn-secondary" onclick="closeModal(document.querySelector('.modal-close'))">Cancel</button>
            </div>
            
            <div id="generated-enemy-preview" style="display: none; margin-top: 2rem;">
                <!-- Generated enemy will be displayed here -->
            </div>
        </div>
    `;
    
    showModal('Random Enemy Generator', content);
}

function generateRandomEnemy() {
    const crValue = document.getElementById('generator-cr').value;
    const cr = convertCRToNumber(crValue);
    const type = document.getElementById('generator-type').value;
    const environment = document.getElementById('generator-environment').value;
    const difficulty = document.getElementById('generator-difficulty').value;
    const includeAbilities = document.getElementById('include-abilities').checked;
    const forceCaster = document.getElementById('force-caster').checked;
    const includeEquipment = document.getElementById('include-equipment').checked;
    
    const generatedEnemy = createRandomEnemy(crValue, cr, type, environment, difficulty, includeAbilities, forceCaster, includeEquipment);
    
    displayGeneratedEnemy(generatedEnemy);
}

function convertCRToNumber(crString) {
    if (crString.includes('/')) {
        const parts = crString.split('/');
        return parseFloat(parts[0]) / parseFloat(parts[1]);
    }
    return parseFloat(crString);
}

function createRandomEnemy(crString, crNumber, type, environment, difficulty, includeAbilities, forceCaster, includeEquipment) {
    // Determine enemy type
    const finalType = type === 'random' ? getRandomEnemyType() : type;
    
    // Determine if this enemy will be a spellcaster
    const isSpellcaster = forceCaster || shouldHaveSpells(finalType, crNumber);
    
    // Generate name based on type and environment
    const name = generateEnemyName(finalType, environment);
    
    // Calculate stats based on CR and D&D 5e guidelines
    const stats = calculateStatsByCR(crNumber, finalType, difficulty);
    
    // Generate special abilities
    const abilities = includeAbilities ? generateSpecialAbilities(crNumber, finalType, isSpellcaster) : '';
    
    // Generate attacks
    const attacks = generateAttacks(crNumber, finalType, stats, includeEquipment, isSpellcaster);
    
    // Generate spells if appropriate
    const spells = isSpellcaster ? generateSpellsFromDatabase(crNumber, finalType) : '';
    
    // Debug logging
    if (isSpellcaster) {
        console.log(`Generating spells for ${name} (${finalType}, CR ${crNumber})`);
        console.log('Generated spells:', spells);
    }
    
    // Generate tags
    const tags = generateTags(finalType, environment, crNumber, isSpellcaster);
    
    return {
        id: generateId(),
        name: name,
        type: finalType,
        cr: crString,
        ac: stats.ac,
        hp: stats.hp,
        speed: stats.speed,
        str: stats.str,
        dex: stats.dex,
        con: stats.con,
        int: stats.int,
        wis: stats.wis,
        cha: stats.cha,
        attacks: attacks,
        abilities: abilities,
        spells: spells,
        isSpellcaster: isSpellcaster,
        description: generateDescription(finalType, environment, crNumber, isSpellcaster),
        tags: tags
    };
}

function getRandomEnemyType() {
    const types = ['beast', 'humanoid', 'undead', 'fiend', 'celestial', 'elemental', 'dragon', 'aberration', 'construct', 'fey', 'giant', 'monstrosity', 'ooze', 'plant'];
    return types[Math.floor(Math.random() * types.length)];
}

function generateEnemyName(type, environment) {
    const prefixes = {
        'beast': ['Dire', 'Giant', 'Shadow', 'Ancient', 'Blood', 'Iron', 'Frost', 'Flame'],
        'humanoid': ['Dark', 'Cursed', 'Fallen', 'Shadow', 'Iron', 'Blood', 'Death', 'Black'],
        'undead': ['Wight', 'Wraith', 'Specter', 'Banshee', 'Lich', 'Vampire', 'Ghoul', 'Zombie'],
        'fiend': ['Demon', 'Devil', 'Imp', 'Hell', 'Infernal', 'Abyssal', 'Fiendish', 'Balor'],
        'celestial': ['Angel', 'Deva', 'Solar', 'Planetar', 'Celestial', 'Divine', 'Holy', 'Seraph'],
        'elemental': ['Fire', 'Water', 'Earth', 'Air', 'Storm', 'Ice', 'Lightning', 'Crystal'],
        'dragon': ['Red', 'Blue', 'Green', 'Black', 'White', 'Gold', 'Silver', 'Bronze'],
        'aberration': ['Mind', 'Void', 'Cosmic', 'Elder', 'Star', 'Deep', 'Aboleth', 'Beholder'],
        'construct': ['Iron', 'Stone', 'Crystal', 'Clockwork', 'Golem', 'Animated', 'Mechanical', 'Steel'],
        'fey': ['Forest', 'Moon', 'Star', 'Shadow', 'Wild', 'Ancient', 'Trickster', 'Noble'],
        'giant': ['Hill', 'Stone', 'Frost', 'Fire', 'Cloud', 'Storm', 'Mountain', 'Thunder'],
        'monstrosity': ['Dire', 'Giant', 'Shadow', 'Beast', 'Hybrid', 'Mutated', 'Twisted', 'Primeval'],
        'ooze': ['Gelatinous', 'Black', 'Gray', 'Green', 'Ochre', 'Corrosive', 'Acidic', 'Slime'],
        'plant': ['Treant', 'Vine', 'Thorn', 'Petal', 'Root', 'Bark', 'Sap', 'Spore']
    };
    
    const suffixes = {
        'beast': ['Wolf', 'Bear', 'Tiger', 'Lion', 'Hawk', 'Snake', 'Spider', 'Scorpion'],
        'humanoid': ['Knight', 'Warrior', 'Mage', 'Assassin', 'Guard', 'Cultist', 'Priest', 'Noble'],
        'undead': ['Lord', 'Knight', 'Mage', 'Priest', 'Warrior', 'King', 'Queen', 'Master'],
        'fiend': ['Lord', 'Prince', 'Duke', 'Knight', 'Warrior', 'Mage', 'Priest', 'Master'],
        'celestial': ['Guardian', 'Herald', 'Champion', 'Protector', 'Watcher', 'Sentry', 'Defender', 'Avenger'],
        'elemental': ['Elemental', 'Spirit', 'Avatar', 'Guardian', 'Lord', 'Prince', 'Master', 'Ancient'],
        'dragon': ['Dragon', 'Wyrm', 'Drake', 'Wyvern', 'Serpent', 'Worm', 'Beast', 'Ancient'],
        'aberration': ['Horror', 'Abomination', 'Thing', 'Entity', 'Creature', 'Being', 'Presence', 'Force'],
        'construct': ['Golem', 'Guardian', 'Sentinel', 'Defender', 'Warrior', 'Knight', 'Guard', 'Protector'],
        'fey': ['Sprite', 'Pixie', 'Dryad', 'Nymph', 'Sylph', 'Satyr', 'Noble', 'Lord'],
        'giant': ['Giant', 'Lord', 'King', 'Queen', 'Chieftain', 'Warrior', 'Mage', 'Priest'],
        'monstrosity': ['Beast', 'Creature', 'Monster', 'Abomination', 'Horror', 'Thing', 'Entity', 'Beast'],
        'ooze': ['Cube', 'Blob', 'Puddle', 'Mass', 'Pool', 'Slime', 'Gel', 'Ooze'],
        'plant': ['Treant', 'Dryad', 'Vine', 'Thorn', 'Root', 'Spore', 'Petal', 'Bloom']
    };
    
    const typePrefixes = prefixes[type] || ['Ancient', 'Dark', 'Shadow'];
    const typeSuffixes = suffixes[type] || ['Creature', 'Beast', 'Monster'];
    
    const prefix = typePrefixes[Math.floor(Math.random() * typePrefixes.length)];
    const suffix = typeSuffixes[Math.floor(Math.random() * typeSuffixes.length)];
    
    return `${prefix} ${suffix}`;
}

function calculateStatsByCR(cr, type, difficulty) {
    // Base HP by CR (following D&D 5e guidelines)
    const hpByCR = {
        0.125: { min: 1, max: 10 },   // 1/8
        0.25: { min: 3, max: 15 },    // 1/4
        0.5: { min: 6, max: 25 },     // 1/2
        1: { min: 8, max: 35 },
        2: { min: 15, max: 50 },
        3: { min: 25, max: 75 },
        4: { min: 35, max: 100 },
        5: { min: 50, max: 125 },
        6: { min: 75, max: 150 },
        7: { min: 100, max: 175 },
        8: { min: 125, max: 200 },
        9: { min: 150, max: 225 },
        10: { min: 175, max: 250 },
        11: { min: 200, max: 275 },
        12: { min: 225, max: 300 }
    };
    
    const hpRange = hpByCR[cr] || hpByCR[12];
    const baseHP = Math.floor(Math.random() * (hpRange.max - hpRange.min + 1)) + hpRange.min;
    
    // Difficulty modifier
    const difficultyModifier = {
        'easy': 0.8,
        'normal': 1.0,
        'hard': 1.2,
        'deadly': 1.5
    };
    
    const modifier = difficultyModifier[difficulty] || 1.0;
    const hp = Math.floor(baseHP * modifier);
    
    // AC by CR
    const acByCR = {
        0.125: { min: 8, max: 12 },   // 1/8
        0.25: { min: 10, max: 13 },   // 1/4
        0.5: { min: 11, max: 14 },    // 1/2
        1: { min: 12, max: 15 },
        2: { min: 13, max: 16 },
        3: { min: 14, max: 17 },
        4: { min: 15, max: 18 },
        5: { min: 16, max: 19 },
        6: { min: 17, max: 20 },
        7: { min: 18, max: 21 },
        8: { min: 19, max: 22 },
        9: { min: 20, max: 23 },
        10: { min: 21, max: 24 },
        11: { min: 22, max: 25 },
        12: { min: 23, max: 26 }
    };
    
    const acRange = acByCR[cr] || acByCR[12];
    const ac = Math.floor(Math.random() * (acRange.max - acRange.min + 1)) + acRange.min;
    
    // Ability scores based on type and CR
    const abilityScores = generateAbilityScores(cr, type);
    
    // Speed based on type
    const speed = generateSpeed(type);
    
    return {
        hp: hp,
        ac: ac,
        str: abilityScores.str,
        dex: abilityScores.dex,
        con: abilityScores.con,
        int: abilityScores.int,
        wis: abilityScores.wis,
        cha: abilityScores.cha,
        speed: speed
    };
}

function generateAbilityScores(cr, type) {
    // Base ability score arrays by type
    const typeBonuses = {
        'beast': { str: 2, dex: 1, con: 1, int: -2, wis: 0, cha: -2 },
        'humanoid': { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
        'undead': { str: 1, dex: 0, con: 2, int: -1, wis: 0, cha: 1 },
        'fiend': { str: 1, dex: 1, con: 1, int: 1, wis: 0, cha: 2 },
        'celestial': { str: 1, dex: 1, con: 1, int: 0, wis: 2, cha: 2 },
        'elemental': { str: 3, dex: 0, con: 2, int: -3, wis: 1, cha: -2 },
        'dragon': { str: 2, dex: 0, con: 2, int: 1, wis: 1, cha: 2 },
        'aberration': { str: 0, dex: 0, con: 0, int: 3, wis: 1, cha: 0 },
        'construct': { str: 2, dex: -1, con: 2, int: -4, wis: -2, cha: -4 },
        'fey': { str: -1, dex: 2, con: 0, int: 1, wis: 1, cha: 2 },
        'giant': { str: 4, dex: -1, con: 2, int: -1, wis: 0, cha: 0 },
        'monstrosity': { str: 2, dex: 0, con: 1, int: -1, wis: 0, cha: -1 },
        'ooze': { str: 1, dex: -3, con: 2, int: -4, wis: -2, cha: -4 },
        'plant': { str: 2, dex: -1, con: 1, int: -3, wis: 1, cha: -2 }
    };
    
    const bonuses = typeBonuses[type] || typeBonuses['humanoid'];
    
    // Base scores for CR
    const baseScore = Math.min(Math.floor(10 + cr), 20);
    
    return {
        str: Math.max(1, Math.min(30, Math.floor(baseScore + bonuses.str + Math.floor(Math.random() * 3) - 1))),
        dex: Math.max(1, Math.min(30, Math.floor(baseScore + bonuses.dex + Math.floor(Math.random() * 3) - 1))),
        con: Math.max(1, Math.min(30, Math.floor(baseScore + bonuses.con + Math.floor(Math.random() * 3) - 1))),
        int: Math.max(1, Math.min(30, Math.floor(baseScore + bonuses.int + Math.floor(Math.random() * 3) - 1))),
        wis: Math.max(1, Math.min(30, Math.floor(baseScore + bonuses.wis + Math.floor(Math.random() * 3) - 1))),
        cha: Math.max(1, Math.min(30, Math.floor(baseScore + bonuses.cha + Math.floor(Math.random() * 3) - 1)))
    };
}

function generateSpeed(type) {
    const speeds = {
        'beast': ['30 ft.', '40 ft.', '50 ft.', '60 ft.'],
        'humanoid': ['25 ft.', '30 ft.', '35 ft.'],
        'undead': ['20 ft.', '30 ft.'],
        'fiend': ['30 ft.', '40 ft.'],
        'celestial': ['30 ft.', '40 ft.', '60 ft. (fly)'],
        'elemental': ['30 ft.', '40 ft.', '50 ft.'],
        'dragon': ['30 ft.', '40 ft.', 'fly 60 ft.', 'fly 80 ft.'],
        'aberration': ['20 ft.', '30 ft.', '40 ft.'],
        'construct': ['20 ft.', '30 ft.'],
        'fey': ['30 ft.', '40 ft.'],
        'giant': ['30 ft.', '40 ft.'],
        'monstrosity': ['30 ft.', '40 ft.', '50 ft.'],
        'ooze': ['10 ft.', '20 ft.'],
        'plant': ['20 ft.', '30 ft.']
    };
    
    const typeSpeeds = speeds[type] || speeds['humanoid'];
    return typeSpeeds[Math.floor(Math.random() * typeSpeeds.length)];
}

function generateSpecialAbilities(cr, type, isSpellcaster) {
    const abilities = [];
    
    // CR-based abilities
    if (cr >= 3) {
        abilities.push('Multiattack. The creature can make multiple attacks on its turn.');
    }
    
    if (cr >= 5) {
        abilities.push('Legendary Resistance (3/Day). If the creature fails a saving throw, it can choose to succeed instead.');
    }
    
    // Spellcasting ability
    if (isSpellcaster) {
        const castingAbility = getCastingAbility(type);
        abilities.push(`Spellcasting. The creature is a ${getSpellcasterLevel(cr)}-level spellcaster. Its spellcasting ability is ${castingAbility} (spell save DC ${calculateSpellSaveDC(cr)}, +${calculateSpellAttackBonus(cr)} to hit with spell attacks).`);
    }
    
    // Type-specific abilities
    const typeAbilities = {
        'undead': [
            'Undead Fortitude. If damage reduces the creature to 0 hit points, it must make a Constitution saving throw with a DC of 5 + the damage taken, unless the damage is radiant or from a critical hit. On a success, the creature drops to 1 hit point instead.',
            'Turn Resistance. The creature has advantage on saving throws against any effect that turns undead.'
        ],
        'fiend': [
            'Magic Resistance. The creature has advantage on saving throws against spells and other magical effects.',
            'Infernal Legacy. The creature knows the thaumaturgy cantrip.'
        ],
        'dragon': [
            'Legendary Actions. The creature can take 3 legendary actions, choosing from the options below.',
            'Breath Weapon (Recharge 5-6). The creature exhales elemental energy in a 30-foot cone.'
        ],
        'elemental': [
            'Elemental Nature. The creature doesn\'t require air, food, drink, or sleep.',
            'Elemental Absorption. When the creature takes damage of its element type, it instead regains hit points equal to the damage dealt.'
        ]
    };
    
    const typeSpecific = typeAbilities[type] || [];
    if (typeSpecific.length > 0 && Math.random() < 0.7) {
        abilities.push(typeSpecific[Math.floor(Math.random() * typeSpecific.length)]);
    }
    
    return abilities.join('\n\n');
}

function getCastingAbility(type) {
    const castingAbilities = {
        'fiend': 'Charisma',
        'celestial': 'Wisdom',
        'dragon': 'Charisma',
        'aberration': 'Intelligence',
        'fey': 'Charisma',
        'undead': 'Intelligence'
    };
    return castingAbilities[type] || 'Intelligence';
}

function getSpellcasterLevel(cr) {
    return Math.min(Math.floor(cr * 2), 20);
}

function calculateSpellSaveDC(cr) {
    return 8 + Math.floor(cr / 2) + 3;
}

function calculateSpellAttackBonus(cr) {
    return Math.floor(cr / 2) + 3;
}

function generateAttacks(cr, type, stats, includeEquipment, isSpellcaster) {
    const attacks = [];
    const attackBonus = Math.floor(stats.str / 2 - 5) + Math.floor(cr / 4) + 3;
    const damageBonus = Math.floor(stats.str / 2 - 5);
    
    // Primary attack
    const primaryDamage = Math.max(1, Math.floor(cr * 2) + 2);
    const totalDamage = Math.max(1, primaryDamage + damageBonus);
    const primaryAttack = `${totalDamage} (${primaryDamage} + ${damageBonus})`;
    
    if (type === 'dragon') {
        const clawDamage = Math.max(1, Math.floor(totalDamage * 0.8));
        attacks.push(`Bite. Melee Weapon Attack: +${attackBonus} to hit, reach 5 ft., one target. Hit: ${primaryAttack} piercing damage.`);
        attacks.push(`Claw. Melee Weapon Attack: +${attackBonus} to hit, reach 5 ft., one target. Hit: ${clawDamage} slashing damage.`);
    } else if (type === 'beast') {
        attacks.push(`Bite. Melee Weapon Attack: +${attackBonus} to hit, reach 5 ft., one target. Hit: ${primaryAttack} piercing damage.`);
    } else if (type === 'humanoid') {
        if (includeEquipment) {
            attacks.push(`Longsword. Melee Weapon Attack: +${attackBonus} to hit, reach 5 ft., one target. Hit: ${primaryAttack} slashing damage.`);
            const bowDamage = Math.max(1, Math.floor(totalDamage * 0.8));
            attacks.push(`Longbow. Ranged Weapon Attack: +${attackBonus} to hit, range 150/600 ft., one target. Hit: ${bowDamage} piercing damage.`);
        } else {
            const unarmedDamage = Math.max(1, Math.floor(totalDamage * 0.8));
            attacks.push(`Unarmed Strike. Melee Weapon Attack: +${attackBonus} to hit, reach 5 ft., one target. Hit: ${unarmedDamage} bludgeoning damage.`);
        }
    } else {
        attacks.push(`Natural Weapon. Melee Weapon Attack: +${attackBonus} to hit, reach 5 ft., one target. Hit: ${primaryAttack} damage.`);
    }
    
    // Add spell attacks if caster
    if (isSpellcaster) {
        const spellAttackBonus = calculateSpellAttackBonus(cr);
        attacks.push(`Spell Attack. +${spellAttackBonus} to hit with spell attacks.`);
    }
    
    return attacks.join('\n\n');
}

function shouldHaveSpells(type, cr) {
    // Types that are commonly spellcasters
    const commonSpellcasterTypes = ['fiend', 'celestial', 'aberration', 'fey', 'dragon', 'humanoid'];
    
    // Types that can sometimes be spellcasters
    const occasionalSpellcasterTypes = ['undead', 'elemental', 'construct', 'monstrosity'];
    
    // Higher CR creatures are more likely to be spellcasters
    if (cr >= 5) {
        // High CR creatures have higher chance of being spellcasters
        if (commonSpellcasterTypes.includes(type)) {
            return Math.random() < 0.8; // 80% chance
        } else if (occasionalSpellcasterTypes.includes(type)) {
            return Math.random() < 0.4; // 40% chance
        }
    } else if (cr >= 2) {
        // Medium CR creatures
        if (commonSpellcasterTypes.includes(type)) {
            return Math.random() < 0.6; // 60% chance
        } else if (occasionalSpellcasterTypes.includes(type)) {
            return Math.random() < 0.2; // 20% chance
        }
    }
    
    // Low CR creatures rarely have spells
    return false;
}

function generateSpellsFromDatabase(cr, type) {
    console.log('generateSpellsFromDatabase called with CR:', cr, 'Type:', type);
    console.log('currentData.spells:', currentData.spells ? currentData.spells.length : 'undefined');
    
    if (!currentData.spells || currentData.spells.length === 0) {
        console.log('No spells in database, using fallback');
        return generateFallbackSpells(cr, type);
    }
    
    const maxSpellLevel = Math.min(Math.floor(cr / 2) + 1, 9);
    const spells = [];
    
    // Get cantrips (level 0)
    const cantrips = currentData.spells.filter(spell => 
        spell.level === '0' || spell.level === 0
    );
    
    if (cantrips.length > 0) {
        const selectedCantrips = getRandomSpells(cantrips, Math.min(3, Math.floor(cr) + 2));
        if (selectedCantrips.length > 0) {
            spells.push(`Cantrips (at will): ${selectedCantrips.map(s => s.name).join(', ')}`);
        }
    }
    
    // Get leveled spells
    const leveledSpells = [];
    for (let level = 1; level <= Math.min(maxSpellLevel, 6); level++) {
        const spellsOfLevel = currentData.spells.filter(spell => 
            spell.level === level.toString() || spell.level === level
        );
        
        if (spellsOfLevel.length > 0) {
            const slots = calculateSpellSlots(level, cr);
            const selectedSpells = getRandomSpells(spellsOfLevel, Math.min(slots, spellsOfLevel.length));
            
            if (selectedSpells.length > 0) {
                const levelText = level === 1 ? '1st' : level === 2 ? '2nd' : level === 3 ? '3rd' : `${level}th`;
                spells.push(`${levelText} level (${slots} slots): ${selectedSpells.map(s => s.name).join(', ')}`);
            }
        }
    }
    
    return spells.join('\n') || generateFallbackSpells(cr, type);
}

function getRandomSpells(spellList, count) {
    const shuffled = [...spellList].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function calculateSpellSlots(level, cr) {
    // Based on D&D 5e spellcasting progression
    const slotsByCR = {
        1: { 1: 2, 2: 0, 3: 0, 4: 0, 5: 0 },
        2: { 1: 3, 2: 0, 3: 0, 4: 0, 5: 0 },
        3: { 1: 4, 2: 2, 3: 0, 4: 0, 5: 0 },
        4: { 1: 4, 2: 3, 3: 0, 4: 0, 5: 0 },
        5: { 1: 4, 2: 3, 3: 2, 4: 0, 5: 0 },
        6: { 1: 4, 2: 3, 3: 3, 4: 0, 5: 0 },
        7: { 1: 4, 2: 3, 3: 3, 4: 1, 5: 0 },
        8: { 1: 4, 2: 3, 3: 3, 4: 2, 5: 0 },
        9: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
        10: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 }
    };
    
    const crLevel = Math.min(Math.floor(cr), 10);
    const slots = slotsByCR[crLevel] || { 1: 2, 2: 0, 3: 0, 4: 0, 5: 0 };
    return slots[level] || 0;
}

function generateFallbackSpells(cr, type) {
    // Fallback if no spells in database
    const spellLevel = Math.min(Math.floor(cr / 2) + 1, 9);
    const spells = [];
    
    const cantrips = ['Eldritch Blast', 'Mage Hand', 'Prestidigitation', 'Minor Illusion', 'Thaumaturgy'];
    spells.push(`Cantrips (at will): ${cantrips.slice(0, Math.min(3, Math.floor(cr) + 2)).join(', ')}`);
    
    for (let level = 1; level <= Math.min(spellLevel, 3); level++) {
        const slots = calculateSpellSlots(level, cr);
        if (slots > 0) {
            const levelText = level === 1 ? '1st' : level === 2 ? '2nd' : '3rd';
            spells.push(`${levelText} level (${slots} slots)`);
        }
    }
    
    return spells.join('\n');
}

function generateTags(type, environment, cr, isSpellcaster) {
    const tags = [type];
    
    if (environment !== 'any') {
        tags.push(environment);
    }
    
    if (isSpellcaster) {
        tags.push('spellcaster');
    }
    
    if (cr >= 10) {
        tags.push('boss');
    } else if (cr >= 5) {
        tags.push('elite');
    } else {
        tags.push('minion');
    }
    
    tags.push('random-generated');
    
    return tags;
}

function generateDescription(type, environment, cr, isSpellcaster) {
    const environments = {
        'arctic': 'This creature thrives in the frozen wastes and bitter cold.',
        'coastal': 'This creature makes its home along coastlines and in maritime environments.',
        'desert': 'This creature has adapted to survive in harsh desert conditions.',
        'forest': 'This creature is at home among the trees and woodland creatures.',
        'grassland': 'This creature roams the open plains and grasslands.',
        'hill': 'This creature prefers the rolling hills and elevated terrain.',
        'mountain': 'This creature dwells in the high peaks and rocky crags.',
        'swamp': 'This creature lurks in the murky waters and boggy marshes.',
        'underdark': 'This creature has adapted to life in the lightless depths below.',
        'underwater': 'This creature is perfectly at home beneath the waves.',
        'urban': 'This creature has learned to survive in cities and towns.'
    };
    
    const envDesc = environments[environment] || 'This creature can be found in various environments.';
    const crDesc = cr >= 10 ? 'A formidable opponent that should not be underestimated.' : 
                   cr >= 5 ? 'A dangerous creature that poses a significant threat.' :
                   cr >= 2 ? 'A moderate threat that requires caution.' :
                   'A relatively weak creature that can still be dangerous in numbers.';
    
    const casterDesc = isSpellcaster ? ' This creature possesses magical abilities and can cast spells.' : '';
    
    return `${envDesc} ${crDesc}${casterDesc}`;
}

function displayGeneratedEnemy(enemy) {
    const previewDiv = document.getElementById('generated-enemy-preview');
    
    const casterIndicator = enemy.isSpellcaster ? '<span style="color: #a78bfa; font-weight: bold;"> ✨ SPELLCASTER</span>' : '';
    
    previewDiv.innerHTML = `
        <div class="generated-enemy-card">
            <h4>Generated Enemy: ${enemy.name}${casterIndicator}</h4>
            <div class="enemy-stats-preview">
                <div class="stat-row">
                    <span><strong>Type:</strong> ${enemy.type}</span>
                    <span><strong>CR:</strong> ${enemy.cr}</span>
                    <span><strong>AC:</strong> ${enemy.ac}</span>
                    <span><strong>HP:</strong> ${enemy.hp}</span>
                </div>
                <div class="stat-row">
                    <span><strong>STR:</strong> ${enemy.str}</span>
                    <span><strong>DEX:</strong> ${enemy.dex}</span>
                    <span><strong>CON:</strong> ${enemy.con}</span>
                    <span><strong>INT:</strong> ${enemy.int}</span>
                    <span><strong>WIS:</strong> ${enemy.wis}</span>
                    <span><strong>CHA:</strong> ${enemy.cha}</span>
                </div>
                <div class="stat-row">
                    <span><strong>Speed:</strong> ${enemy.speed}</span>
                    <span><strong>Tags:</strong> ${enemy.tags.join(', ')}</span>
                </div>
                ${enemy.isSpellcaster && enemy.spells ? `
                <div class="stat-row">
                    <span><strong>Spells:</strong> <em>See full details when saved</em></span>
                </div>
                ` : ''}
            </div>
            <div class="form-actions">
                <button class="btn-primary" onclick="saveGeneratedEnemy()">Save This Enemy</button>
                <button class="btn-secondary" onclick="generateRandomEnemy()">Generate Another</button>
            </div>
        </div>
    `;
    
    // Store the current generated enemy for saving
    window.currentGeneratedEnemy = enemy;
    
    previewDiv.style.display = 'block';
}

function saveGeneratedEnemy() {
    if (window.currentGeneratedEnemy) {
        currentData.enemies.push(window.currentGeneratedEnemy);
        saveData().then(() => {
            alert('Enemy saved successfully!');
            closeModal(document.querySelector('.modal-close'));
            loadEnemies();
        });
    }
}
