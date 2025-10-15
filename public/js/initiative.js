// Initiative-specific JavaScript

function showInitiativeModal() {
    const content = `
        <form onsubmit="addToInitiativeFromForm(event)" id="initiative-form">
            <div class="form-group">
                <label>Type *</label>
                <select name="type" id="entity-type" onchange="updateEntityList()" required>
                    <option value="">-- Select Type --</option>
                    <option value="PC">Player Character</option>
                    <option value="NPC">NPC</option>
                    <option value="Enemy">Enemy</option>
                    <option value="Custom">Custom Entry</option>
                </select>
            </div>
            
            <div class="form-group" id="entity-select-group" style="display: none;">
                <label>Select Entity *</label>
                <select name="entityId" id="entity-select" onchange="populateEntityData()">
                    <option value="">-- Select --</option>
                </select>
            </div>
            
            <div class="form-group" id="name-input-group" style="display: none;">
                <label>Name *</label>
                <input type="text" name="name" id="entity-name">
            </div>
            
            <div class="form-group">
                <label>Initiative Roll *</label>
                <input type="number" name="initiative" id="initiative-value" required>
            </div>
            
            <div class="form-group" id="hp-group" style="display: none;">
                <label>HP (optional)</label>
                <input type="number" name="hp" id="entity-hp" placeholder="Current HP">
            </div>
            
            <div class="form-group" id="ac-group" style="display: none;">
                <label>AC (optional)</label>
                <input type="number" name="ac" id="entity-ac" placeholder="Armor Class">
            </div>
            
            <div class="form-group">
                <button type="submit" class="btn-primary">Add to Initiative</button>
            </div>
        </form>
    `;
    
    showModal('Add to Initiative', content);
}

function updateEntityList() {
    const typeSelect = document.getElementById('entity-type');
    const entitySelectGroup = document.getElementById('entity-select-group');
    const nameInputGroup = document.getElementById('name-input-group');
    const entitySelect = document.getElementById('entity-select');
    const hpGroup = document.getElementById('hp-group');
    const acGroup = document.getElementById('ac-group');
    
    const selectedType = typeSelect.value;
    
    // Clear previous options
    entitySelect.innerHTML = '<option value="">-- Select --</option>';
    
    if (selectedType === 'Custom') {
        // Show manual name input for custom entries
        entitySelectGroup.style.display = 'none';
        nameInputGroup.style.display = 'block';
        hpGroup.style.display = 'none';
        acGroup.style.display = 'none';
        document.getElementById('entity-name').required = true;
    } else if (selectedType) {
        // Show entity dropdown
        entitySelectGroup.style.display = 'block';
        nameInputGroup.style.display = 'none';
        hpGroup.style.display = 'block';
        acGroup.style.display = 'block';
        
        let entities = [];
        
        if (selectedType === 'PC') {
            entities = currentData.characters || [];
        } else if (selectedType === 'NPC') {
            entities = currentData.npcs || [];
        } else if (selectedType === 'Enemy') {
            entities = currentData.enemies || [];
        }
        
        // Populate dropdown
        entities.forEach(entity => {
            const option = document.createElement('option');
            option.value = entity.id;
            option.textContent = entity.name;
            entitySelect.appendChild(option);
        });
        
        if (entities.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = `No ${selectedType === 'PC' ? 'Characters' : selectedType === 'NPC' ? 'NPCs' : 'Enemies'} available`;
            entitySelect.appendChild(option);
        }
    } else {
        // Hide all
        entitySelectGroup.style.display = 'none';
        nameInputGroup.style.display = 'none';
        hpGroup.style.display = 'none';
        acGroup.style.display = 'none';
    }
}

function populateEntityData() {
    const typeSelect = document.getElementById('entity-type');
    const entitySelect = document.getElementById('entity-select');
    const hpInput = document.getElementById('entity-hp');
    const acInput = document.getElementById('entity-ac');
    const initiativeInput = document.getElementById('initiative-value');
    
    const selectedType = typeSelect.value;
    const selectedEntityId = entitySelect.value;
    
    if (!selectedEntityId) return;
    
    let entity = null;
    
    if (selectedType === 'PC') {
        entity = currentData.characters?.find(c => c.id === selectedEntityId);
    } else if (selectedType === 'NPC') {
        entity = currentData.npcs?.find(n => n.id === selectedEntityId);
    } else if (selectedType === 'Enemy') {
        entity = currentData.enemies?.find(e => e.id === selectedEntityId);
    }
    
    if (entity) {
        // Populate HP and AC if available
        if (entity.hp) hpInput.value = entity.hp;
        if (entity.ac) acInput.value = entity.ac;
        
        // Calculate initiative modifier from DEX if available
        if (entity.dex) {
            const dexMod = Math.floor((entity.dex - 10) / 2);
            const roll = Math.floor(Math.random() * 20) + 1; // d20 roll
            initiativeInput.value = roll + dexMod;
            
            // Show suggestion
            initiativeInput.placeholder = `Suggested: ${roll} (d20) + ${dexMod} (DEX mod) = ${roll + dexMod}`;
        } else {
            // Just roll d20
            const roll = Math.floor(Math.random() * 20) + 1;
            initiativeInput.value = roll;
            initiativeInput.placeholder = `Rolled: ${roll}`;
        }
    }
}

async function addToInitiativeFromForm(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const type = formData.get('type');
    
    let initiativeData = {
        id: generateId(),
        current: false,
        type: type,
        initiative: parseInt(formData.get('initiative'))
    };
    
    if (type === 'Custom') {
        // Manual entry
        initiativeData.name = formData.get('name');
    } else {
        // Entity selection
        const entityId = formData.get('entityId');
        const selectedType = type;
        
        let entity = null;
        if (selectedType === 'PC') {
            entity = currentData.characters?.find(c => c.id === entityId);
        } else if (selectedType === 'NPC') {
            entity = currentData.npcs?.find(n => n.id === entityId);
        } else if (selectedType === 'Enemy') {
            entity = currentData.enemies?.find(e => e.id === entityId);
        }
        
        if (entity) {
            initiativeData.name = entity.name;
            initiativeData.entityId = entityId;
            
            // Add HP and AC if provided
            const hp = formData.get('hp');
            const ac = formData.get('ac');
            
            if (hp) initiativeData.hp = parseInt(hp);
            if (ac) initiativeData.ac = parseInt(ac);
        }
    }
    
    currentData.initiative.push(initiativeData);
    await saveData();
    closeModal(event.target.closest('.modal-overlay').querySelector('.modal-close'));
    loadInitiative();
    updateActiveInitiative();
}
