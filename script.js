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
        refBooks: {
            chinese: false,
            english: false,
            math: false,
            science: false
        },
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

// Update UI based on state
function updateUI() {
    // Time
    uiDay.textContent = `第 ${gameState.day} 天`;
    uiWeekday.textContent = WEEKDAYS[gameState.dayOfWeek];
    uiTime.textContent = TIME_PERIODS[gameState.timePeriod];

    // Money
    uiMoney.textContent = gameState.money;

    // Stats
    getEl('val-fatigue').textContent = gameState.stats.fatigue;
    getEl('val-stress').textContent = gameState.stats.stress;
    getEl('val-trauma').textContent = gameState.stats.trauma;

    getEl('val-chinese').textContent = gameState.stats.learning.chinese;
    getEl('val-english').textContent = gameState.stats.learning.english;
    getEl('val-math').textContent = gameState.stats.learning.math;
    getEl('val-science').textContent = gameState.stats.learning.science;

    getEl('val-piano').textContent = gameState.stats.talent.piano;
    getEl('val-physical').textContent = gameState.stats.talent.physical;
    getEl('val-chess').textContent = gameState.stats.talent.chess;
    getEl('val-swimming').textContent = gameState.stats.talent.swimming;

    getEl('val-charm').textContent = gameState.stats.personality.charm;
    getEl('val-eloquence').textContent = gameState.stats.personality.eloquence;
    getEl('val-deception').textContent = gameState.stats.personality.deception;
    getEl('val-home_economics').textContent = gameState.stats.personality.home_economics;
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
function performAction(action, subject = null) {
    let message = "";
    let success = true;
    let costTime = true;

    const subjectNames = {
        chinese: "國文",
        english: "英文",
        math: "數學",
        science: "理化"
    };

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
        if (!subject || !subjectNames[subject]) {
            success = false;
            message = "請選擇要讀的科目！";
        } else if (!gameState.inventory.refBooks[subject]) {
            success = false;
            message = `你沒有${subjectNames[subject]}參考書，無法在家自習！請去書店購買。`;
        } else {
            let gain = 15; // Base gain with book
            gameState.stats.learning[subject] = Math.min(100, gameState.stats.learning[subject] + gain);
            gameState.stats.fatigue = Math.min(100, gameState.stats.fatigue + 10);
            message = `你在家研讀${subjectNames[subject]}。(${subjectNames[subject]}+${gain}, 疲勞+10)`;
        }
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
        
        if (!validDay || !validTime) {
            success = false;
            message = "補習班現在沒開！(開放時間: 一、三、五 的 下午/晚上)";
        } else if (!subject || !subjectNames[subject]) {
            success = false;
            message = "請選擇要補習的科目！";
        } else {
            gameState.stats.learning[subject] = Math.min(100, gameState.stats.learning[subject] + 25);
            gameState.stats.fatigue = Math.min(100, gameState.stats.fatigue + 20);
            message = `你在補習班專心聽${subjectNames[subject]}課。(${subjectNames[subject]}+25, 疲勞+20)`;
        }
    }
    else if (action === 'buy_refbook') {
        costTime = false;
        if (!subject || !subjectNames[subject]) {
            message = "請選擇要購買的參考書科目！";
        } else if (gameState.inventory.refBooks[subject]) {
            message = `你已經有${subjectNames[subject]}參考書了！`;
        } else if (gameState.money >= 50) {
            gameState.money -= 50;
            gameState.inventory.refBooks[subject] = true;
            message = `購買了${subjectNames[subject]}參考書！現在可以在家自習該科目了。`;
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
