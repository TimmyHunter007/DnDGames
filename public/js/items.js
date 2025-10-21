// Items-specific JavaScript

function loadItems() {
    const itemsList = document.getElementById('items-list');
    
    if (currentData.items.length === 0) {
        itemsList.innerHTML = '<p>No items created yet. Click "Add New Item" to get started!</p>';
        return;
    }
    
    // Sort items alphabetically by name
    const sortedItems = currentData.items.slice().sort((a, b) => {
        return a.name.localeCompare(b.name);
    });
    
    itemsList.innerHTML = sortedItems.map(item => {
        const typeText = item.type || 'Unknown';
        const rarityText = item.rarity || 'Unknown';
        
        const tags = item.tags || [];
        const tagsHtml = tags.length > 0 ? 
            `<div class="enemy-tags">${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : '';
        
        return `
        <div class="spell-item" onclick="showItemDetails('${item.id}')" data-tags="${tags.join(',')}">
            <h3>${item.name}</h3>
            <p><strong>${rarityText}</strong> • ${typeText}</p>
            ${tagsHtml}
        </div>
        `;
    }).join('');
    
    loadItemTagFilters();
}

function loadItemTagFilters() {
    const tagButtons = document.getElementById('item-tag-filter-buttons');
    if (!tagButtons) return;
    
    const allTags = new Set();
    
    // Collect all unique tags from items
    currentData.items.forEach(item => {
        if (item.tags) {
            item.tags.forEach(tag => allTags.add(tag));
        }
    });
    
    // Create filter buttons
    const sortedTags = Array.from(allTags).sort();
    tagButtons.innerHTML = sortedTags.map(tag => 
        `<button class="tag-filter-btn" onclick="toggleItemTagFilter('${tag}')">${tag}</button>`
    ).join('');
}

function toggleItemTagFilter(tag) {
    const button = document.querySelector(`[onclick="toggleItemTagFilter('${tag}')"]`);
    button.classList.toggle('active');
    
    // Filter items based on active tags
    const activeTags = Array.from(document.querySelectorAll('#item-tag-filter-buttons .tag-filter-btn.active'))
        .map(btn => btn.textContent);
    
    filterItemsByTags(activeTags);
}

function filterItemsByTags(activeTags) {
    const itemItems = document.querySelectorAll('#items-list .spell-item[data-tags]');
    
    itemItems.forEach(item => {
        const itemTags = item.getAttribute('data-tags').split(',');
        
        if (activeTags.length === 0 || activeTags.some(tag => itemTags.includes(tag))) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function clearItemTagFilters() {
    document.querySelectorAll('#item-tag-filter-buttons .tag-filter-btn.active').forEach(btn => {
        btn.classList.remove('active');
    });
    
    filterItemsByTags([]);
}

function showItemDetails(itemId) {
    const item = currentData.items.find(i => i.id === itemId);
    if (!item) return;
    
    const modalContent = `
        <div class="item-details">
            <div class="item-header">
                <div class="item-title">${item.name}</div>
                <div class="item-meta">
                    <span class="meta-item type-${(item.type || 'unknown').toLowerCase()}">${item.type || 'Unknown Type'}</span>
                    <span class="meta-item rarity-${(item.rarity || 'unknown').toLowerCase()}">${item.rarity || 'Unknown Rarity'}</span>
                    ${item.attunement ? `<span class="meta-item attunement">${item.attunement}</span>` : ''}
                </div>
            </div>
            
            ${item.description ? `
                <div class="item-section">
                    <h4>Description</h4>
                    <div class="section-content">${(item.description.replace ? item.description : '').replace(/\n/g, '<br>')}</div>
                </div>
            ` : ''}
            
            ${item.effects ? `
                <div class="item-section">
                    <h4>Effects</h4>
                    <div class="section-content">${(item.effects.replace ? item.effects : '').replace(/\n/g, '<br>')}</div>
                </div>
            ` : ''}
            
            ${item.tags && item.tags.length > 0 ? `
                <div class="item-section">
                    <h4>Tags</h4>
                    <div class="enemy-tags">
                        ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="item-actions">
                <button class="btn btn-primary" onclick="closeModal(document.querySelector('.modal-close')); setTimeout(() => editItem('${item.id}'), 100)">
                    <span>✏️</span> Edit
                </button>
                <button class="btn btn-danger" onclick="closeModal(document.querySelector('.modal-close')); setTimeout(() => deleteItem('${item.id}'), 100)">
                    <span>🗑️</span> Delete
                </button>
            </div>
        </div>
    `;
    
    showModal(item.name, modalContent);
}

function showItemModal(itemId = null) {
    const isEdit = itemId !== null;
    const item = isEdit ? currentData.items.find(i => i.id === itemId) : null;
    
    const content = `
        <form onsubmit="saveItem(event, ${itemId ? `'${itemId}'` : 'null'})">
            <div class="form-section">
                <h3>Basic Information</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label>Name *</label>
                        <input type="text" name="name" value="${item ? item.name : ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Type</label>
                        <select name="type">
                            <option value="Weapon" ${item && item.type === 'Weapon' ? 'selected' : ''}>Weapon</option>
                            <option value="Armor" ${item && item.type === 'Armor' ? 'selected' : ''}>Armor</option>
                            <option value="Potion" ${item && item.type === 'Potion' ? 'selected' : ''}>Potion</option>
                            <option value="Ring" ${item && item.type === 'Ring' ? 'selected' : ''}>Ring</option>
                            <option value="Wand" ${item && item.type === 'Wand' ? 'selected' : ''}>Wand</option>
                            <option value="Staff" ${item && item.type === 'Staff' ? 'selected' : ''}>Staff</option>
                            <option value="Scroll" ${item && item.type === 'Scroll' ? 'selected' : ''}>Scroll</option>
                            <option value="Other" ${item && item.type === 'Other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Rarity</label>
                        <select name="rarity">
                            <option value="Common" ${item && item.rarity === 'Common' ? 'selected' : ''}>Common</option>
                            <option value="Uncommon" ${item && item.rarity === 'Uncommon' ? 'selected' : ''}>Uncommon</option>
                            <option value="Rare" ${item && item.rarity === 'Rare' ? 'selected' : ''}>Rare</option>
                            <option value="Very Rare" ${item && item.rarity === 'Very Rare' ? 'selected' : ''}>Very Rare</option>
                            <option value="Legendary" ${item && item.rarity === 'Legendary' ? 'selected' : ''}>Legendary</option>
                            <option value="Artifact" ${item && item.rarity === 'Artifact' ? 'selected' : ''}>Artifact</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Attunement</label>
                        <select name="attunement">
                            <option value="" ${!item || !item.attunement ? 'selected' : ''}>None Required</option>
                            <option value="Yes" ${item && item.attunement === 'Yes' ? 'selected' : ''}>Yes</option>
                            <option value="By Spellcaster" ${item && item.attunement === 'By Spellcaster' ? 'selected' : ''}>By Spellcaster</option>
                            <option value="By Specific Class" ${item && item.attunement === 'By Specific Class' ? 'selected' : ''}>By Specific Class</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <h3>Details & Effects</h3>
                <div class="form-group">
                    <label>Description</label>
                    <textarea name="description" rows="4">${item ? item.description : ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Effects</label>
                    <textarea name="effects" rows="4" placeholder="Describe magical effects, bonuses, or special abilities">${item ? item.effects : ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Tags</label>
                    <input type="text" name="tags" value="${item ? (item.tags ? item.tags.join(', ') : '') : ''}" placeholder="e.g., magic, combat, utility, cursed">
                    <small style="color: #b8b8b8; font-size: 0.8rem;">Separate multiple tags with commas</small>
                </div>
            </div>
            
            <div class="modal-actions">
                <button type="submit" class="action-btn">${isEdit ? 'Update' : 'Create'} Item</button>
                <button type="button" class="action-btn btn-secondary" onclick="closeModal(this)">Cancel</button>
            </div>
        </form>
    `;
    
    showModal(isEdit ? 'Edit Item' : 'Create New Item', content);
}

async function saveItem(event, itemId) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const itemData = Object.fromEntries(formData.entries());
    
    // Process tags - convert comma-separated string to array
    if (itemData.tags) {
        itemData.tags = itemData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    } else {
        itemData.tags = [];
    }
    
    if (itemId) {
        const index = currentData.items.findIndex(i => i.id === itemId);
        if (index !== -1) {
            currentData.items[index] = { ...currentData.items[index], ...itemData };
        }
    } else {
        itemData.id = generateId();
        currentData.items.push(itemData);
    }
    
    await saveData();
    closeModal(event.target.closest('.modal-overlay').querySelector('.modal-close'));
    loadItems();
}

function editItem(itemId) {
    showItemModal(itemId);
}

function deleteItem(itemId) {
    confirmDelete('Are you sure you want to delete this item?', async () => {
        currentData.items = currentData.items.filter(i => i.id !== itemId);
        await saveData();
        loadItems();
    });
}
