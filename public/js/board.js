// Board functionality for D&D DM Toolkit
// This file contains additional board-specific JavaScript functions

// Board state management
let boardState = {
    width: 20,
    height: 15,
    tokens: [],
    tokenCounter: 1,
    isInitialized: false
};

// Initialize board functionality
function initializeBoardFeatures() {
    console.log('🎲 Initializing board features...');
    
    // Set up keyboard shortcuts
    document.addEventListener('keydown', handleBoardKeyboard);
    
    // Set up auto-save
    setInterval(autoSaveBoard, 30000); // Auto-save every 30 seconds
    
    boardState.isInitialized = true;
    console.log('✅ Board features initialized');
}

// Handle keyboard shortcuts
function handleBoardKeyboard(event) {
    if (!boardState.isInitialized) return;
    
    switch(event.key) {
        case 'Delete':
        case 'Backspace':
            if (event.target.classList.contains('token')) {
                const tokenId = event.target.dataset.tokenId;
                removeTokenById(tokenId);
            }
            break;
        case 's':
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                saveBoard();
            }
            break;
        case 'l':
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                loadBoard();
            }
            break;
        case 'c':
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                clearBoard();
            }
            break;
    }
}

// Remove token by ID
function removeTokenById(tokenId) {
    const tokenIndex = boardState.tokens.findIndex(token => token.id == tokenId);
    if (tokenIndex !== -1) {
        const token = boardState.tokens[tokenIndex];
        const cell = document.querySelector(`[data-x="${token.x}"][data-y="${token.y}"]`);
        const tokenElement = cell.querySelector('.token');
        
        if (tokenElement) {
            tokenElement.remove();
        }
        
        boardState.tokens.splice(tokenIndex, 1);
        cell.classList.remove('occupied');
        
        console.log(`🗑️ Removed token ${tokenId}`);
    }
}

// Auto-save board state
function autoSaveBoard() {
    if (boardState.tokens.length > 0) {
        const boardData = {
            width: boardState.width,
            height: boardState.height,
            tokens: boardState.tokens,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('dnd-board-autosave', JSON.stringify(boardData));
        console.log('💾 Board auto-saved');
    }
}

// Load auto-saved board
function loadAutoSavedBoard() {
    const autoSaveData = localStorage.getItem('dnd-board-autosave');
    if (autoSaveData) {
        try {
            const boardData = JSON.parse(autoSaveData);
            const timeDiff = Date.now() - new Date(boardData.timestamp).getTime();
            const hoursDiff = timeDiff / (1000 * 60 * 60);
            
            if (hoursDiff < 24) { // Only load if less than 24 hours old
                console.log('🔄 Found recent auto-save, loading...');
                return boardData;
            }
        } catch (error) {
            console.error('❌ Error loading auto-save:', error);
        }
    }
    return null;
}

// Export board as image
function exportBoardAsImage() {
    const boardGrid = document.getElementById('board-grid');
    if (!boardGrid) return;
    
    // Create a canvas to render the board
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const cellSize = 40;
    canvas.width = boardState.width * cellSize;
    canvas.height = boardState.height * cellSize;
    
    // Fill background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    
    for (let x = 0; x <= boardState.width; x++) {
        ctx.beginPath();
        ctx.moveTo(x * cellSize, 0);
        ctx.lineTo(x * cellSize, canvas.height);
        ctx.stroke();
    }
    
    for (let y = 0; y <= boardState.height; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * cellSize);
        ctx.lineTo(canvas.width, y * cellSize);
        ctx.stroke();
    }
    
    // Draw tokens
    boardState.tokens.forEach(token => {
        const x = token.x * cellSize + cellSize / 2;
        const y = token.y * cellSize + cellSize / 2;
        const radius = cellSize / 3;
        
        // Set token color based on type
        let color;
        switch(token.type) {
            case 'player': color = '#3b82f6'; break;
            case 'npc': color = '#10b981'; break;
            case 'enemy': color = '#ef4444'; break;
            case 'monster': color = '#8b5cf6'; break;
            case 'numbered': color = '#f59e0b'; break;
            default: color = '#6b7280';
        }
        
        // Draw token circle
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw token border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw token text
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const text = token.type === 'numbered' ? token.number : 
                   (token.assignment ? token.assignment.charAt(0).toUpperCase() : 
                    token.type.charAt(0).toUpperCase());
        ctx.fillText(text, x, y);
    });
    
    // Convert canvas to image and download
    canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dnd-board-${new Date().toISOString().split('T')[0]}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
    
    console.log('📸 Board exported as image');
}

// Import board from JSON
function importBoardFromJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const boardData = JSON.parse(e.target.result);
                    loadBoardData(boardData);
                    console.log('📥 Board imported from JSON');
                } catch (error) {
                    console.error('❌ Error importing board:', error);
                    alert('Error importing board. Please check the file format.');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

// Export board to JSON
function exportBoardToJSON() {
    const boardData = {
        width: boardState.width,
        height: boardState.height,
        tokens: boardState.tokens,
        timestamp: new Date().toISOString(),
        version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(boardData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dnd-board-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('📤 Board exported to JSON');
}

// Load board data
function loadBoardData(boardData) {
    boardState.width = boardData.width;
    boardState.height = boardData.height;
    boardState.tokens = boardData.tokens || [];
    
    document.getElementById('board-width').value = boardState.width;
    document.getElementById('board-height').value = boardState.height;
    
    createBoard();
    boardState.tokens.forEach(token => renderToken(token));
    
    console.log('📂 Board data loaded');
}

// Get board statistics
function getBoardStatistics() {
    const stats = {
        totalTokens: boardState.tokens.length,
        players: boardState.tokens.filter(t => t.type === 'player').length,
        npcs: boardState.tokens.filter(t => t.type === 'npc').length,
        enemies: boardState.tokens.filter(t => t.type === 'enemy').length,
        monsters: boardState.tokens.filter(t => t.type === 'monster').length,
        numbered: boardState.tokens.filter(t => t.type === 'numbered').length,
        boardSize: `${boardState.width}x${boardState.height}`
    };
    
    return stats;
}

// Show board statistics
function showBoardStatistics() {
    const stats = getBoardStatistics();
    const message = `
Board Statistics:
• Total Tokens: ${stats.totalTokens}
• Players: ${stats.players}
• NPCs: ${stats.npcs}
• Enemies: ${stats.enemies}
• Monsters: ${stats.monsters}
• Numbered: ${stats.numbered}
• Board Size: ${stats.boardSize}
    `;
    
    alert(message);
}

// Initialize board features when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeBoardFeatures, 1000); // Delay to ensure board is created first
});

