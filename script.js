// Game State
const gameState = {
    day: 1,
    dayOfWeek: 1, // 1: Mon, 7: Sun
    timePeriod: 0, // 0: Morning, 1: Noon, 2: Afternoon, 3: Evening, 4: Late Night
    money: 200,
    stats: {
        // Player Status
        fatigue: 0,
        stress: 0,
        trauma: 0,
        // Learning
        learning: {
            chinese: 0,
            english: 0,
            math: 0,
            science: 0
        },
        // Talent
        talent: {
            piano: 0,
            physical: 0,
            chess: 0,
            swimming: 0
        },
        // Personality
        personality: {
            charm: 0,
            eloquence: 0,
            deception: 0,
            home_economics: 0
        }
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

// Helper to get stat element by ID
const getEl = (id) => document.getElementById(id);

const panelOverlay = document.getElementById('panel-overlay');
const panelTitle = document.getElementById('panel-title');
const panelContent = document.getElementById('panel-content');

// Initialization
function initGame() {
    updateUI();
}

// Render a horizontal bar for a stat (0-100)
function renderBar(id, value) {
    const bar = document.getElementById(id);
    if (bar) {
        bar.style.width = Math.max(0, Math.min(100, value)) + '%';
        bar.title = value;
    }
}

// Update UI based on state
function updateUI() {
    // Time
    uiDay.textContent = `第 ${gameState.day} 天`;
    uiWeekday.textContent = WEEKDAYS[gameState.dayOfWeek];
    uiTime.textContent = TIME_PERIODS[gameState.timePeriod];

    // Money
    uiMoney.textContent = gameState.money;

    // Stats (bars)
    renderBar('bar-fatigue', gameState.stats.fatigue);
    renderBar('bar-stress', gameState.stats.stress);
    renderBar('bar-trauma', gameState.stats.trauma);

    renderBar('bar-chinese', gameState.stats.learning.chinese);
    renderBar('bar-english', gameState.stats.learning.english);
    renderBar('bar-math', gameState.stats.learning.math);
    renderBar('bar-science', gameState.stats.learning.science);

    renderBar('bar-piano', gameState.stats.talent.piano);
    renderBar('bar-physical', gameState.stats.talent.physical);
    renderBar('bar-chess', gameState.stats.talent.chess);
    renderBar('bar-swimming', gameState.stats.talent.swimming);

    renderBar('bar-charm', gameState.stats.personality.charm);
    renderBar('bar-eloquence', gameState.stats.personality.eloquence);
    renderBar('bar-deception', gameState.stats.personality.deception);
    renderBar('bar-home_economics', gameState.stats.personality.home_economics);
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
        const oldFatigue = gameState.stats.fatigue;
        gameState.stats.fatigue = Math.max(0, gameState.stats.fatigue - 30);
        const change = oldFatigue - gameState.stats.fatigue;
        message = `你睡了一覺，疲勞減少了 ${change} 點。`;
    } 
    else if (action === 'piano_easy') {
        gameState.stats.talent.piano = Math.min(100, gameState.stats.talent.piano + 10);
        gameState.stats.fatigue = Math.min(100, gameState.stats.fatigue + 5);
        message = `你輕鬆地練習了鋼琴。(鋼琴+10, 疲勞+5)`;
    }
    else if (action === 'piano_hard') {
        gameState.stats.talent.piano = Math.min(100, gameState.stats.talent.piano + 25);
        gameState.stats.fatigue = Math.min(100, gameState.stats.fatigue + 15);
        message = `你刻苦地練習了鋼琴！(鋼琴+25, 疲勞+15)`;
    }
    else if (action === 'study') {
        let gain = 10;
        let extraMsg = "";
        if (gameState.inventory.refBook) {
            gain += 10;
            gameState.inventory.refBook = false; // Consume buff
            extraMsg = " (參考書加成!)";
        }
        // Defaulting to Math for general study for now
        gameState.stats.learning.math = Math.min(100, gameState.stats.learning.math + gain);
        gameState.stats.fatigue = Math.min(100, gameState.stats.fatigue + 10);
        message = `你在家唸書。${extraMsg} (數學+${gain}, 疲勞+10)`;
    }
    else if (action === 'read_comic') {
        if (gameState.inventory.comic > 0) {
            gameState.inventory.comic--;
            const oldFatigue = gameState.stats.fatigue;
            gameState.stats.fatigue = Math.max(0, gameState.stats.fatigue - 20);
            const change = oldFatigue - gameState.stats.fatigue;
            message = `你看了一本漫畫，心情變好了。(疲勞-${change})`;
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
            gameState.stats.learning.math = Math.min(100, gameState.stats.learning.math + 25);
            gameState.stats.fatigue = Math.min(100, gameState.stats.fatigue + 20);
            message = `你在補習班認真聽課。(數學+25, 疲勞+20)`;
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
