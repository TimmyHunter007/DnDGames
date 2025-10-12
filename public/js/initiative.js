// Initiative-specific JavaScript

function showInitiativeModal() {
    const content = `
        <form onsubmit="addToInitiativeFromForm(event)">
            <div class="form-group">
                <label>Name *</label>
                <input type="text" name="name" required>
            </div>
            <div class="form-group">
                <label>Initiative *</label>
                <input type="number" name="initiative" required>
            </div>
            <div class="form-group">
                <label>Type</label>
                <select name="type">
                    <option value="PC">Player Character</option>
                    <option value="NPC">NPC</option>
                    <option value="Enemy">Enemy</option>
                </select>
            </div>
            <div class="form-group">
                <label>Source</label>
                <input type="text" name="source" placeholder="e.g., Character name, Monster name">
            </div>
            <div class="form-group">
                <button type="submit" class="btn-primary">Add to Initiative</button>
            </div>
        </form>
    `;
    
    showModal('Add to Initiative', content);
}

async function addToInitiativeFromForm(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const initiativeData = Object.fromEntries(formData.entries());
    
    initiativeData.id = generateId();
    initiativeData.current = false;
    
    currentData.initiative.push(initiativeData);
    await saveData();
    closeModal(event.target.closest('.modal-overlay').querySelector('.modal-close'));
    loadInitiative();
    updateActiveInitiative();
}
