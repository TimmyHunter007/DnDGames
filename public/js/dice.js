// Enhanced Dice Roller JavaScript

// Session statistics
let sessionStats = {
    totalRolls: 0,
    nat20s: 0,
    nat1s: 0,
    totalValue: 0
};

// Quick roll function for single dice
async function quickRoll(sides) {
    const result = Math.floor(Math.random() * sides) + 1;
    const description = `d${sides} Quick Roll`;
    
    const historyItem = {
        id: generateId(),
        dice: `d${sides}`,
        result: result,
        description: description,
        timestamp: new Date().toISOString(),
        isQuick: true
    };
    
    // Update statistics
    updateStats(result, sides);
    
    // Add to history
    currentData.diceHistory.unshift(historyItem);
    await saveData();
    
    // Display result with animation
    displayDiceResult(historyItem);
    
    // Update history
    loadDiceHistory();
    updateStatistics();
}

// Roll with advantage (roll twice, take higher)
async function rollWithAdvantage() {
    const sides = parseInt(document.getElementById('dice-type')?.value) || 20;
    const modifier = parseInt(document.getElementById('dice-modifier')?.value) || 0;
    const description = document.getElementById('roll-description')?.value || 'Advantage Roll';
    
    const roll1 = Math.floor(Math.random() * sides) + 1;
    const roll2 = Math.floor(Math.random() * sides) + 1;
    const higher = Math.max(roll1, roll2);
    const total = higher + modifier;
    
    const historyItem = {
        id: generateId(),
        dice: `2d${sides} (Advantage)`,
        result: total,
        rolls: [roll1, roll2],
        modifier: modifier,
        description: description,
        advantage: true,
        timestamp: new Date().toISOString()
    };
    
    // Update statistics (use the higher roll)
    updateStats(higher, sides);
    
    currentData.diceHistory.unshift(historyItem);
    await saveData();
    
    displayDiceResult(historyItem);
    loadDiceHistory();
    updateStatistics();
}

// Roll with disadvantage (roll twice, take lower)
async function rollWithDisadvantage() {
    const sides = parseInt(document.getElementById('dice-type')?.value) || 20;
    const modifier = parseInt(document.getElementById('dice-modifier')?.value) || 0;
    const description = document.getElementById('roll-description')?.value || 'Disadvantage Roll';
    
    const roll1 = Math.floor(Math.random() * sides) + 1;
    const roll2 = Math.floor(Math.random() * sides) + 1;
    const lower = Math.min(roll1, roll2);
    const total = lower + modifier;
    
    const historyItem = {
        id: generateId(),
        dice: `2d${sides} (Disadvantage)`,
        result: total,
        rolls: [roll1, roll2],
        modifier: modifier,
        description: description,
        disadvantage: true,
        timestamp: new Date().toISOString()
    };
    
    // Update statistics (use the lower roll)
    updateStats(lower, sides);
    
    currentData.diceHistory.unshift(historyItem);
    await saveData();
    
    displayDiceResult(historyItem);
    loadDiceHistory();
    updateStatistics();
}

// Enhanced custom dice roll function
async function rollCustomDice() {
    const count = parseInt(document.getElementById('dice-count')?.value) || 1;
    const sides = parseInt(document.getElementById('dice-type')?.value);
    const modifier = parseInt(document.getElementById('dice-modifier')?.value) || 0;
    const description = document.getElementById('roll-description')?.value || '';
    
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
        description: description,
        timestamp: new Date().toISOString()
    };
    
    // Update statistics (for single die rolls)
    if (count === 1) {
        updateStats(rolls[0], sides);
    }
    
    currentData.diceHistory.unshift(historyItem);
    await saveData();
    
    displayDiceResult(historyItem);
    loadDiceHistory();
    updateStatistics();
}

// Display dice result with enhanced styling
function displayDiceResult(historyItem) {
    const resultsContainer = document.getElementById('dice-results');
    if (!resultsContainer) return;
    
    const isNat20 = historyItem.rolls && historyItem.rolls[0] === 20 && historyItem.rolls.length === 1;
    const isNat1 = historyItem.rolls && historyItem.rolls[0] === 1 && historyItem.rolls.length === 1;
    const isCritical = isNat20 || (historyItem.advantage && historyItem.rolls && Math.max(...historyItem.rolls) === 20);
    const isFumble = isNat1 || (historyItem.disadvantage && historyItem.rolls && Math.min(...historyItem.rolls) === 1);
    
    let resultClass = 'dice-result';
    if (isCritical) resultClass += ' critical';
    if (isFumble) resultClass += ' fumble';
    
    let rollDisplay = '';
    if (historyItem.rolls) {
        if (historyItem.advantage) {
            rollDisplay = `(${historyItem.rolls[0]}, ${historyItem.rolls[1]}) → ${Math.max(...historyItem.rolls)}`;
        } else if (historyItem.disadvantage) {
            rollDisplay = `(${historyItem.rolls[0]}, ${historyItem.rolls[1]}) → ${Math.min(...historyItem.rolls)}`;
        } else if (historyItem.rolls.length > 1) {
            rollDisplay = `(${historyItem.rolls.join(', ')})`;
        }
    }
    
    const modifierText = historyItem.modifier ? 
        (historyItem.modifier > 0 ? ` + ${historyItem.modifier}` : ` ${historyItem.modifier}`) : '';
    
    resultsContainer.innerHTML = `
        <div class="${resultClass}">
            ${historyItem.description ? `<div class="roll-description">${historyItem.description}</div>` : ''}
            <div class="dice-type">${historyItem.dice}</div>
            ${rollDisplay ? `<div class="roll-breakdown">${rollDisplay}${modifierText}</div>` : ''}
            <div class="roll-total">${historyItem.result}</div>
            ${isCritical ? '<div class="critical-text">CRITICAL!</div>' : ''}
            ${isFumble ? '<div class="fumble-text">FUMBLE!</div>' : ''}
        </div>
    `;
    
    // Add animation class
    resultsContainer.classList.add('result-animate');
    setTimeout(() => {
        resultsContainer.classList.remove('result-animate');
    }, 1000);
}

// Update session statistics
function updateStats(roll, sides) {
    sessionStats.totalRolls++;
    sessionStats.totalValue += roll;
    
    if (roll === sides) {
        sessionStats.nat20s++;
    }
    if (roll === 1) {
        sessionStats.nat1s++;
    }
}

// Update statistics display
function updateStatistics() {
    document.getElementById('total-rolls').textContent = sessionStats.totalRolls;
    document.getElementById('nat20-count').textContent = sessionStats.nat20s;
    document.getElementById('nat1-count').textContent = sessionStats.nat1s;
    document.getElementById('avg-roll').textContent = sessionStats.totalRolls > 0 ? 
        (sessionStats.totalValue / sessionStats.totalRolls).toFixed(1) : '0';
}

// Enhanced dice history loading
function loadDiceHistory() {
    const container = document.querySelector('.history-content');
    if (!container) return;
    
    const recentHistory = currentData.diceHistory.slice(0, 20);
    
    if (recentHistory.length === 0) {
        container.innerHTML = '<p class="no-history">No dice rolls yet</p>';
        return;
    }
    
    container.innerHTML = recentHistory.map(item => {
        const isNat20 = item.rolls && item.rolls[0] === 20 && item.rolls.length === 1;
        const isNat1 = item.rolls && item.rolls[0] === 1 && item.rolls.length === 1;
        
        let itemClass = 'dice-history-item';
        if (isNat20) itemClass += ' nat20';
        if (isNat1) itemClass += ' nat1';
        
        return `
            <div class="${itemClass}">
                <div class="history-main">
                    <strong>${item.dice}:</strong> 
                    <span class="result">${item.result}</span>
                    ${item.rolls && item.rolls.length > 1 ? 
                        `<span class="breakdown">(${item.rolls.join(', ')})</span>` : ''}
                    ${item.description ? `<span class="description">- ${item.description}</span>` : ''}
                </div>
                <span class="timestamp">${formatTime(item.timestamp)}</span>
            </div>
        `;
    }).join('');
}

// Clear dice history
async function clearDiceHistory() {
    if (confirm('Are you sure you want to clear all dice history?')) {
        currentData.diceHistory = [];
        sessionStats = { totalRolls: 0, nat20s: 0, nat1s: 0, totalValue: 0 };
        await saveData();
        loadDiceHistory();
        updateStatistics();
        
        // Reset results display
        const resultsContainer = document.getElementById('dice-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="results-placeholder">
                    <div class="dice-icon-large">🎲</div>
                    <p>Click a dice button or use the advanced roller to start rolling!</p>
                </div>
            `;
        }
    }
}

// Initialize dice page
document.addEventListener('DOMContentLoaded', function() {
    // Load existing history and update statistics
    if (currentData.diceHistory) {
        // Calculate session stats from history
        sessionStats = { totalRolls: 0, nat20s: 0, nat1s: 0, totalValue: 0 };
        currentData.diceHistory.forEach(item => {
            if (item.rolls && item.rolls.length === 1) {
                sessionStats.totalRolls++;
                sessionStats.totalValue += item.rolls[0];
                if (item.rolls[0] === 20) sessionStats.nat20s++;
                if (item.rolls[0] === 1) sessionStats.nat1s++;
            }
        });
    }
    
    updateStatistics();
});
