// Game State
const gameState = {
    day: 1,
    dayOfWeek: 1, // 1: Mon, 7: Sun
    timePeriod: 0, // 0: Morning, 1: Noon, 2: Afternoon, 3: Evening, 4: Late Night
    money: 200,
    stats: {
        stress: 30,
        academic: 10,
        piano: 5
    },
    inventory: {
        refBook: false,
        comic: 0
    }
};

const TIME_PERIODS = ["早晨", "中午", "下午", "晚上", "深夜"];
const WEEKDAYS = ["", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"];

// DOM Elements
const uiDay = document.getElementById('day-count');
const uiWeekday = document.getElementById('weekday-display');
const uiTime = document.getElementById('time-period');
const uiMoney = document.getElementById('val-money');
const uiStress = document.getElementById('stat-stress');
const uiAcademic = document.getElementById('stat-academic');
const uiPiano = document.getElementById('stat-piano');
const valStress = document.getElementById('val-stress');
const valAcademic = document.getElementById('val-academic');
const valPiano = document.getElementById('val-piano');

const panelOverlay = document.getElementById('panel-overlay');
const panelTitle = document.getElementById('panel-title');
const panelContent = document.getElementById('panel-content');

// Initialization
function initGame() {
    updateUI();
}

// Update UI based on state
function updateUI() {
    // Time
    uiDay.textContent = `第 ${gameState.day} 天`;
    uiWeekday.textContent = WEEKDAYS[gameState.dayOfWeek];
    uiTime.textContent = TIME_PERIODS[gameState.timePeriod];

    // Money
    uiMoney.textContent = gameState.money;

    // Stats
    uiStress.value = gameState.stats.stress;
    valStress.textContent = gameState.stats.stress;

    uiAcademic.value = gameState.stats.academic;
    valAcademic.textContent = gameState.stats.academic;

    uiPiano.value = gameState.stats.piano;
    valPiano.textContent = gameState.stats.piano;
}

// Time System
function advanceTime() {
    gameState.timePeriod++;
    if (gameState.timePeriod >= TIME_PERIODS.length) {
        gameState.timePeriod = 0;
        gameState.day++;
        gameState.dayOfWeek++;
        if (gameState.dayOfWeek > 7) {
            gameState.dayOfWeek = 1;
        }
    }
    updateUI();
}

// Interaction System
function openLocation(location) {
    panelContent.innerHTML = "";
    
    if (location === 'home') {
        panelTitle.textContent = "家";
        const template = document.getElementById('tpl-home');
        panelContent.appendChild(template.content.cloneNode(true));
        
        // Show comic button if owned
        if (gameState.inventory.comic > 0) {
            const btn = panelContent.querySelector('#btn-read-comic');
            if(btn) btn.style.display = 'block';
        }
        
        panelOverlay.classList.remove('hidden');
    } else if (location === 'street') {
        panelTitle.textContent = "補習街";
        const template = document.getElementById('tpl-street');
        panelContent.appendChild(template.content.cloneNode(true));
        panelOverlay.classList.remove('hidden');
    } else {
        alert("此區域尚未開放！");
    }
}

function openShop() {
    panelTitle.textContent = "書店";
    const template = document.getElementById('tpl-shop');
    panelContent.innerHTML = "";
    panelContent.appendChild(template.content.cloneNode(true));
}

function closePanel() {
    panelOverlay.classList.add('hidden');
}

// Actions
function performAction(action) {
    let message = "";
    let success = true;
    let costTime = true;

    if (action === 'sleep') {
        const oldStress = gameState.stats.stress;
        gameState.stats.stress = Math.max(0, gameState.stats.stress - 30);
        const change = oldStress - gameState.stats.stress;
        message = `你睡了一覺，壓力減少了 ${change} 點。`;
    } 
    else if (action === 'piano_easy') {
        gameState.stats.piano = Math.min(100, gameState.stats.piano + 10);
        gameState.stats.stress = Math.min(100, gameState.stats.stress + 5);
        message = `你輕鬆地練習了鋼琴。(鋼琴+10, 壓力+5)`;
    }
    else if (action === 'piano_hard') {
        gameState.stats.piano = Math.min(100, gameState.stats.piano + 25);
        gameState.stats.stress = Math.min(100, gameState.stats.stress + 15);
        message = `你刻苦地練習了鋼琴！(鋼琴+25, 壓力+15)`;
    }
    else if (action === 'study') {
        let gain = 10;
        let extraMsg = "";
        if (gameState.inventory.refBook) {
            gain += 10;
            gameState.inventory.refBook = false; // Consume buff
            extraMsg = " (參考書加成!)";
        }
        gameState.stats.academic = Math.min(100, gameState.stats.academic + gain);
        gameState.stats.stress = Math.min(100, gameState.stats.stress + 10);
        message = `你在家唸書。${extraMsg} (學力+${gain}, 壓力+10)`;
    }
    else if (action === 'read_comic') {
        if (gameState.inventory.comic > 0) {
            gameState.inventory.comic--;
            const oldStress = gameState.stats.stress;
            gameState.stats.stress = Math.max(0, gameState.stats.stress - 20);
            const change = oldStress - gameState.stats.stress;
            message = `你看了一本漫畫，心情變好了。(壓力-${change})`;
        } else {
            success = false;
            message = "你沒有漫畫書！";
        }
    }
    else if (action === 'cram_school') {
        // Check time: Mon(1), Wed(3), Fri(5). Afternoon(2), Evening(3).
        const validDay = [1, 3, 5].includes(gameState.dayOfWeek);
        const validTime = [2, 3].includes(gameState.timePeriod);
        
        if (validDay && validTime) {
            gameState.stats.academic = Math.min(100, gameState.stats.academic + 25);
            gameState.stats.stress = Math.min(100, gameState.stats.stress + 20);
            message = `你在補習班認真聽課。(學力+25, 壓力+20)`;
        } else {
            success = false;
            message = "補習班現在沒開！(開放時間: 一、三、五 的 下午/晚上)";
        }
    }
    else if (action === 'buy_refbook') {
        costTime = false;
        if (gameState.money >= 50) {
            gameState.money -= 50;
            gameState.inventory.refBook = true;
            message = "購買了參考書！下次居家學習效果提升。";
        } else {
            message = "金錢不足！";
        }
    }
    else if (action === 'buy_comic') {
        costTime = false;
        if (gameState.money >= 30) {
            gameState.money -= 30;
            gameState.inventory.comic++;
            message = "購買了漫畫書！可以在家閱讀。";
        } else {
            message = "金錢不足！";
        }
    }

    alert(message);
    
    if (success) {
        if (costTime) {
            closePanel();
            advanceTime();
        } else {
            // Update UI for money changes without closing panel or advancing time
            updateUI();
        }
    }
}

// Start
initGame();
