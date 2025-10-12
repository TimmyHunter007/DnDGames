// Notes-specific JavaScript

function loadNotes() {
    const notesList = document.getElementById('notes-list');
    
    if (currentData.notes.length === 0) {
        notesList.innerHTML = '<p>No notes created yet. Click "Add New Note" to get started!</p>';
        return;
    }
    
    // Sort notes alphabetically by title
    const sortedNotes = currentData.notes.slice().sort((a, b) => {
        return a.title.localeCompare(b.title);
    });
    
    notesList.innerHTML = sortedNotes.map(note => {
        const dateText = note.created ? formatDate(note.created) : 'Unknown date';
        const preview = note.content ? (note.content.substring(0, 100) + (note.content.length > 100 ? '...' : '')) : '';
        
        return `
        <div class="spell-item" onclick="showNoteDetails('${note.id}')">
            <h3>${note.title}</h3>
            <p><strong>${dateText}</strong>${preview ? ' • ' + preview : ''}</p>
        </div>
        `;
    }).join('');
}

function showNoteDetails(noteId) {
    const note = currentData.notes.find(n => n.id === noteId);
    if (!note) return;
    
    const modalContent = `
        <div class="note-details">
            <div class="note-header">
                <div class="note-title">${note.title}</div>
                <div class="note-meta">
                    <span class="meta-item created">Created: ${note.created ? formatDate(note.created) : 'Unknown'}</span>
                </div>
            </div>
            
            ${note.content ? `
                <div class="note-section">
                    <h4>Content</h4>
                    <div class="section-content">${(note.content.replace ? note.content : '').replace(/\n/g, '<br>')}</div>
                </div>
            ` : ''}
            
            <div class="note-actions">
                <button class="btn btn-primary" onclick="closeModal(document.querySelector('.modal-close')); setTimeout(() => editNote('${note.id}'), 100)">
                    <span>✏️</span> Edit
                </button>
                <button class="btn btn-danger" onclick="closeModal(document.querySelector('.modal-close')); setTimeout(() => deleteNote('${note.id}'), 100)">
                    <span>🗑️</span> Delete
                </button>
            </div>
        </div>
    `;
    
    showModal(note.title, modalContent);
}

function showNoteModal(noteId = null) {
    const isEdit = noteId !== null;
    const note = isEdit ? currentData.notes.find(n => n.id === noteId) : null;
    
    const content = `
        <form onsubmit="saveNote(event, ${noteId ? `'${noteId}'` : 'null'})">
            <div class="form-group">
                <label>Title *</label>
                <input type="text" name="title" value="${note ? note.title : ''}" required>
            </div>
            <div class="form-group">
                <label>Content</label>
                <textarea name="content" rows="10" placeholder="Write your notes here...">${note ? note.content : ''}</textarea>
            </div>
            <div class="form-group">
                <button type="submit" class="btn-primary">${isEdit ? 'Update' : 'Create'} Note</button>
            </div>
        </form>
    `;
    
    showModal(isEdit ? 'Edit Note' : 'Create New Note', content);
}

async function saveNote(event, noteId) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const noteData = Object.fromEntries(formData.entries());
    
    if (noteId) {
        const index = currentData.notes.findIndex(n => n.id === noteId);
        if (index !== -1) {
            currentData.notes[index] = { ...currentData.notes[index], ...noteData };
        }
    } else {
        noteData.id = generateId();
        noteData.created = new Date().toISOString();
        currentData.notes.push(noteData);
    }
    
    await saveData();
    closeModal(event.target.closest('.modal-overlay').querySelector('.modal-close'));
    loadNotes();
    updateRecentNotes();
}

function editNote(noteId) {
    showNoteModal(noteId);
}

function deleteNote(noteId) {
    confirmDelete('Are you sure you want to delete this note?', async () => {
        currentData.notes = currentData.notes.filter(n => n.id !== noteId);
        await saveData();
        loadNotes();
        updateRecentNotes();
    });
}
