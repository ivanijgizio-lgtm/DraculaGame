// ================= РАСШИРЕННЫЙ ЛОР =================
const BUILD_LORE = {
    'build': "СТРОИТЬ: Возводите тёмные сооружения. Каждое здание тратит 1 Очко Действия (AP) и требует золота. Стройте Казармы для пополнения легионов и Замки для обороны.",
    'recruit': "ПРИЗВАТЬ: Соберите армию. Каждый призыв тратит 1 AP и требует золота. Базовые подразделения обучаются в Казармах.",
    'garrison': "ГАРНИЗОН: Перераспределите силы между мобильной группой Дракулы и охраной замка. Перемещение 10 пехотинцев стоит 1 AP.",
    'cancelsiege': "СНЯТЬ ОСАДУ: Прекратить окружение текущей провинции. Стоит 1 AP.",
    'endturn': "СЛЕД. ХОД: Собрать налоги и передать инициативу врагам. Переключает время суток День/Ночь.",
    'factions': "ФРАКЦИИ: Изучите расстановку враждующих сил.",
    'diplomacy': "ДИПЛОМАТИЯ: Заключайте временные пакты о ненападении, чтобы обезопасить фланги.",
    'market': "РЫНОК: Обменивайте кровь на золото по динамическому курсу (1 раз за ход).",
    'tech': "ТЕХНОЛОГИИ: Инвестируйте золото в темные знания для открытия элитных существ.",
    'cemetery': "Кладбище (30🪙): Дарует +5 крови каждый ход.",
    'barracks': "Казармы Lv1 (20🪙): Открывает призыв обычных войск.",
    'barracks_lv2': "Казармы Lv2 (50🪙): Позволяет нанимать Рыцарей Тьмы.",
    'ritual': "Храм Тьмы (20🪙): Необходим для призыва Лордов и Вампиров-Аристократов.",
    'citadel': "Цитадель (40🪙): Генерирует +50 золота каждый ход.",
    'wall': "Стены (10🪙): Добавляет +1 к уровню укрепления провинции.",
    'castle': "Замок (40🪙): +2 к укреплениям и мгновенно призывает 20 пехотинцев в гарнизон.",
    'infantry': "5 Пехотинцев. Базовое пушечное мясо. Нужны Казармы.",
    'archer': "5 Лучников. Поддержка задней линии. Нужны Казармы.",
    'cavalry': "3 Кавалерии. Мощный урон. Штраф атаки на горных уступах.",
    'knights': "Рыцари Тьмы. Элитная тяжелая конница Тьмы.",
    'lord': "Призвать Лорда (+10% мощи легиона). Требует Храм Тьмы.",
    'gargoyle': "ГАРГУЛЬИ: Каменные стражи. Игнорируют любые штрафы ландшафта (в лесах и горах бьются на полную мощь). Нужна Военная реформа.",
    'noble': "АРИСТОКРАТЫ: Древние чистокровные вампиры. Каждый выживший аристократ возвращает +2 к Человечности после выигранного сражения. Нужна Некромантия.",
    'garrison_add': "ОСТАВИТЬ: Переместить 10 пехотинцев в гарнизон текущего региона.",
    'garrison_take': "ПРИЗВАТЬ: Забрать 10 пехотинцев из гарнизона в мобильный отряд."
};

// ================= ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ PIXI =================
let app = null, hexContainer = null, armyContainer = null;
let spritePlayer = null, spriteAI = null, spriteWerewolf = null;
let spriteLord = null, spriteAIGeneral = null, spriteWolfGeneral = null;

// ================= ВЕБ-АУДИО СИНТЕЗАТОР =================
const SoundEngine = {
    ctx: null,
    init() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); },
    playCoin() {
        this.init(); const now = this.ctx.currentTime; const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
        osc.type = 'sine'; osc.frequency.setValueAtTime(987.77, now); osc.frequency.setValueAtTime(1318.51, now + 0.08);
        gain.gain.setValueAtTime(0.2, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.connect(gain); gain.connect(this.ctx.destination); osc.start(now); osc.stop(now + 0.3);
    },
    playCurse() {
        this.init(); const now = this.ctx.currentTime; const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(300, now); osc.frequency.linearRampToValueAtTime(60, now + 0.5);
        gain.gain.setValueAtTime(0.2, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.connect(gain); gain.connect(this.ctx.destination); osc.start(now); osc.stop(now + 0.5);
    },
    playBattle() {
        this.init(); const now = this.ctx.currentTime;
        for (let i = 0; i < 3; i++) {
            const offset = now + (i * 0.15); const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
            osc.type = 'triangle'; osc.frequency.setValueAtTime(140 + Math.random() * 100, offset); osc.frequency.setValueAtTime(40, offset + 0.1);
            gain.gain.setValueAtTime(0.2, offset); gain.gain.exponentialRampToValueAtTime(0.01, offset + 0.12);
            osc.connect(gain); gain.connect(this.ctx.destination); osc.start(offset); osc.stop(offset + 0.12);
        }
    },
    playWolfHowl() {
        this.init(); const now = this.ctx.currentTime; const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
        osc.type = 'sine'; osc.frequency.setValueAtTime(220, now); osc.frequency.linearRampToValueAtTime(420, now + 0.3); osc.frequency.linearRampToValueAtTime(360, now + 0.7);
        gain.gain.setValueAtTime(0.12, now); gain.gain.linearRampToValueAtTime(0.18, now + 0.3); gain.gain.exponentialRampToValueAtTime(0.01, now + 1.1);
        osc.connect(gain); gain.connect(this.ctx.destination); osc.start(now); osc.stop(now + 1.1);
    },
    playBuild() {
        this.init(); const now = this.ctx.currentTime; const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
        osc.type = 'square'; osc.frequency.setValueAtTime(110, now); osc.frequency.setValueAtTime(170, now + 0.08);
        gain.gain.setValueAtTime(0.12, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc.connect(gain); gain.connect(this.ctx.destination); osc.start(now); osc.stop(now + 0.22);
    }
};

// ================= ИНИЦИАЛИЗАЦИЯ PIXI =================
function initPixi() {
    const pixiContainer = document.getElementById('pixi-container');
    if (!pixiContainer) return;
    app = new PIXI.Application({
        width: pixiContainer.clientWidth || 1100,
        height: pixiContainer.clientHeight || 650,
        backgroundColor: 0x0a0a0a,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true
    });
    pixiContainer.appendChild(app.view);
    hexContainer = new PIXI.Container();
    armyContainer = new PIXI.Container();
    app.stage.addChild(hexContainer);
    app.stage.addChild(armyContainer);
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    window.addEventListener('resize', resizeMap);
}

async function loadSprites() {
    try {
        spritePlayer = await PIXI.Assets.load('./assets/Vampire Army.png').catch(()=>null);
        spriteAI = await PIXI.Assets.load('./assets/Knight Vatican.jpg').catch(()=>null);
        spriteWerewolf = await PIXI.Assets.load('./assets/Werewolf Army.webp').catch(()=>null);
        spriteLord = await PIXI.Assets.load('./assets/Lord Vampire.jpg').catch(()=>null);
        spriteAIGeneral = await PIXI.Assets.load('./assets/Vatican Inquisitor.png').catch(()=>null);
        spriteWolfGeneral = await PIXI.Assets.load('./assets/Werewolf general.jpg').catch(()=>null);
    } catch (e) {}
}

// ================= ДАННЫЕ ИГРЫ =================
const LORD_NAMES = ["Граф Дракулос", "Леди Сильвана", "Барон Ноктюрн", "Принц Теней", "Леди Вэйн"];

function hexToPixel(q, r, size) {
    return { x: size * (Math.sqrt(3) * q + Math.sqrt(3)/2 * r), y: size * (3/2 * r) };
}
function getHexCorners(cx, cy, size) {
    const corners = [];
    for (let i = 0; i < 6; i++) {
        const angle = (60 * i - 30) * Math.PI / 180;
        corners.push(cx + size * Math.cos(angle), cy + size * Math.sin(angle));
    }
    return corners;
}
function getNeighbors(q, r) {
    return [[1,0],[-1,0],[0,1],[0,-1],[1,-1],[-1,1]].map(d => ({ q: Number(q) + d[0], r: Number(r) + d[1] }));
}

function getDefaultGame() {
    return {
        turn: 1, day: 1, gameOver: false, battleActive: false,
        selectedHexId: null, pendingActionHexId: null,
        humanity: 80, cassaldiaTrust: 50,
        marketRates: { goldToBlood: 1.0, bloodToGold: 0.8 }, marketTradedThisTurn: false,
        player: {
            ap: 2, maxAp: 2, gold: 100, blood: 10, lords: [],
            mobileArmy: { infantry: 50, archer: 10, cavalry: 10, gargoyle: 0, noble: 0, hexId: '0,0' },
            hasCitadel: false, allianceWithAI: false, truceTurnsAI: 0, truceTurnsWolf: 0,
            techs: { militaryReform: false, necromancy: false, tradeRoutes: false }
        },
        ai: { gold: 100, mobileArmy: { infantry: 55, archer: 15, cavalry: 10, gargoyle: 0, noble: 0, hexId: '5,-3' } },
        werewolf: { gold: 50, mobileArmy: { infantry: 35, archer: 5, cavalry: 10, gargoyle: 0, noble: 0, hexId: '-5,4' } },
        hexGrid: []
    };
}

let game = getDefaultGame();

function initHexGrid() {
    const grid = [];
    const mapData = [
        { q: 0, r: 0, name: 'Transilvania', terrain: 'plains', owner: 'player', fort: 1, pop: 2000 },
        { q: 1, r: 0, name: 'Wallachia', terrain: 'plains', owner: 'player', fort: 0, pop: 1500 },
        { q: -1, r: 0, name: 'Moldavia', terrain: 'forest', owner: 'player', fort: 0, pop: 1500 },
        { q: 0, r: -1, name: 'Pannonia', terrain: 'plains', owner: 'player', fort: 0, pop: 1200 },
        { q: 2, r: -1, name: 'Tatra Peaks', terrain: 'mountain', owner: 'player', fort: 1, pop: 1000 },
        { q: -2, r: 0, name: 'Bukovina', terrain: 'forest', owner: 'player', fort: 0, pop: 800 },
        { q: 1, r: -1, name: 'Bessarabia', terrain: 'swamp', owner: 'player', fort: 0, pop: 800 },
        { q: 5, r: -3, name: 'Vaticanum', terrain: 'mountain', owner: 'ai', fort: 3, pop: 5000 },
        { q: 6, r: -3, name: 'Roma', terrain: 'plains', owner: 'ai', fort: 2, pop: 4000 },
        { q: 6, r: -4, name: 'Florentia', terrain: 'plains', owner: 'ai', fort: 1, pop: 3000 },
        { q: 7, r: -4, name: 'Parma', terrain: 'plains', owner: 'ai', fort: 1, pop: 2500 },
        { q: 7, r: -3, name: 'Ancona', terrain: 'plains', owner: 'ai', fort: 1, pop: 2000 },
        { q: 5, r: -4, name: 'Perugia', terrain: 'forest', owner: 'ai', fort: 0, pop: 2000 },
        { q: 6, r: -2, name: 'Ravenna', terrain: 'swamp', owner: 'ai', fort: 0, pop: 1500 },
        { q: -5, r: 4, name: 'Carpathia', terrain: 'mountain', owner: 'werewolf', fort: 0, pop: 2500 },
        { q: -4, r: 4, name: 'Dacia', terrain: 'forest', owner: 'werewolf', fort: 0, pop: 2000 },
        { q: -3, r: 4, name: 'Moesia', terrain: 'forest', owner: 'werewolf', fort: 0, pop: 1500 },
        { q: -4, r: 5, name: 'Iron Gate', terrain: 'mountain', owner: 'werewolf', fort: 0, pop: 1500 },
        { q: -3, r: 3, name: 'Crimson Peak', terrain: 'mountain', owner: 'werewolf', fort: 1, pop: 2000 },
        { q: -2, r: 3, name: 'Whispering Woods', terrain: 'forest', owner: 'werewolf', fort: 0, pop: 1200 },
        { q: -2, r: -1, name: 'Silver Mines', terrain: 'mountain', owner: null, res: { gold: 15, blood: 0 }, fort: 0, pop: 0 },
        { q: -3, r: 2, name: 'Blood Marshes', terrain: 'swamp', owner: null, res: { gold: 0, blood: 20 }, fort: 0, pop: 0 },
        { q: 1, r: 2, name: 'Drowning Bog', terrain: 'swamp', owner: null, res: { gold: 0, blood: 15 }, fort: 0, pop: 0 },
        { q: 3, r: 1, name: 'Ruins', terrain: 'plains', owner: null, res: { gold: 10, blood: 0 }, fort: 0, pop: 0 },
        { q: -4, r: -2, name: 'Cursed Forge', terrain: 'mountain', owner: null, res: { gold: 5, blood: 10 }, fort: 0, pop: 0 }
    ];

    mapData.forEach(d => {
        let support = { player: 20, ai: 70, werewolf: 10 };
        if (d.owner === 'player') support = { player: 80, ai: 10, werewolf: 10 };
        else if (d.owner === 'ai') support = { player: 10, ai: 85, werewolf: 5 };
        else if (d.owner === 'werewolf') support = { player: 5, ai: 15, werewolf: 80 };
        grid.push({
            q: d.q, r: d.r, name: d.name, owner: d.owner, terrain: d.terrain || 'plains',
            resources: d.res || { gold: 0, blood: 0 },
            fortification: d.fort || 0, population: d.pop || 0, support: support,
            playerGarrison: { infantry: d.owner === 'player' ? 20 : 0, archer: 0, cavalry: 0, gargoyle: 0, noble: 0 },
            aiGarrison: { infantry: d.owner === 'ai' ? 20 : 0, archer: 0, cavalry: 0, gargoyle: 0, noble: 0 },
            buildings: [], siegeBy: null
        });
    });
    return grid;
}

// ================= ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =================
function getTotalTroops(army) {
    return (army?.infantry || 0) + (army?.archer || 0) + (army?.cavalry || 0) + (army?.gargoyle || 0) + (army?.noble || 0);
}
function isNightTime() { return game.turn % 2 !== 0; }
function log(msg, type = 'system') {
    const c = document.getElementById('log-container'); if (!c) return;
    const e = document.createElement('div'); e.className = `log-entry ${type}`; e.textContent = msg;
    c.appendChild(e); c.scrollTop = c.scrollHeight;
}
function getLordBonus() {
    let b = 0; game.player.lords.forEach(l => { b += (l.battles >= 5) ? 0.2 : (l.battles >= 2 ? 0.1 : 0); });
    return b;
}
function saveGame() { localStorage.setItem('DraculaHexFinal', JSON.stringify(game)); }
function loadGame() {
    const saved = localStorage.getItem('DraculaHexFinal');
    if (saved) { game = JSON.parse(saved); return true; }
    return false;
}
function checkGameConditions() {
    if (game.gameOver) return;
    if (game.hexGrid.filter(h => h.owner === 'player').length === 0) gameOver('ai');
    else if (game.hexGrid.filter(h => h.owner === 'ai').length === 0 && game.hexGrid.filter(h => h.owner === 'werewolf').length === 0) gameOver('player');
}
function gameOver(winner) {
    if (game.gameOver) return; game.gameOver = true;
    document.getElementById('btn-end-turn').disabled = true;
    document.getElementById('btn-assault').disabled = true;
    if (winner === 'player') {
        if (game.cassaldiaTrust >= 70) {
            document.getElementById('gameover-title').textContent = "ВЕЧНЫЙ СОЮЗ РАЗУМА";
            document.getElementById('gameover-desc').textContent = "Ватикан пал. Дракула освободил Кассальдию, сохранив в себе человека. Она приняла бессмертие. Вместе они создали справедливую империю.";
        } else {
            document.getElementById('gameover-title').textContent = "ТИРАНИЯ ТЬМЫ";
            document.getElementById('gameover-desc').textContent = "Священный Престол сокрушен, но ваша запредельная жестокость испугала Кассальдию. Она заперлась в башне. Вы правите всей Европой, обреченный на вечное холодное одиночество.";
        }
    } else {
        document.getElementById('gameover-title').textContent = "ТЬМА ОТСТУПИЛА!";
        document.getElementById('gameover-desc').textContent = "Защитники человечества оказались слишком непреклонны. Силы Дракулы иссякли, а его замок стерт с лица земли.";
    }
    document.getElementById('gameover-modal').style.display = 'flex';
}
function checkStoryConditions() {
    if (game.humanity <= 0) {
        game.gameOver = true;
        document.getElementById('gameover-title').textContent = "БЕЗУМИЕ ЗВЕРЯ!";
        document.getElementById('gameover-desc').textContent = "Человечность угасла. Жажда крови поглотила разум. Ворвавшись в Рим, Дракула уже не узнал Кассальдию и растерзал ее в порыве безумия. Тьма победила, но любви больше нет.";
        document.getElementById('gameover-modal').style.display = 'flex';
    }
}

// ================= ОТРИСОВКА КАРТЫ =================
function resizeMap() {
    const mapArea = document.getElementById('map-area');
    if (mapArea && app) {
        app.renderer.resize(mapArea.clientWidth, mapArea.clientHeight);
        drawHexes(); drawArmies();
    }
}

function drawHexes() {
    if (!app) return; hexContainer.removeChildren(); if (!game.hexGrid.length) return;
    const w = app.renderer.view.width, h = app.renderer.view.height;
    let minQ = Infinity, maxQ = -Infinity, minR = Infinity, maxR = -Infinity;
    game.hexGrid.forEach(hex => {
        minQ = Math.min(minQ, hex.q); maxQ = Math.max(maxQ, hex.q);
        minR = Math.min(minR, hex.r); maxR = Math.max(maxR, hex.r);
    });
    let HEX_SIZE = Math.min(w / ((maxQ - minQ + 1) * 1.8), h / ((maxR - minR + 1) * 1.6), 80) * 0.85;
    if (HEX_SIZE < 12) HEX_SIZE = 12;
    let rawPositions = game.hexGrid.map(hex => {
        const p = hexToPixel(hex.q, hex.r, HEX_SIZE); return { ...hex, rawX: p.x, rawY: p.y };
    });
    let avgX = 0, avgY = 0; rawPositions.forEach(p => { avgX += p.rawX; avgY += p.rawY; });
    avgX /= rawPositions.length; avgY /= rawPositions.length;
    let shiftX = (w / 2) - avgX, shiftY = (h / 2) - avgY;

    const currentHex = game.hexGrid.find(h => `${h.q},${h.r}` === game.player.mobileArmy.hexId);
    let movableHexIds = (currentHex && game.player.ap > 0 && getTotalTroops(game.player.mobileArmy) > 0) ?
        getNeighbors(currentHex.q, currentHex.r).map(n => `${n.q},${n.r}`) : [];

    rawPositions.forEach(hex => {
        const container = new PIXI.Container();
        container.x = hex.rawX + shiftX; container.y = hex.rawY + shiftY;
        const g = new PIXI.Graphics();

        // Цвет фона (черный с оттенками)
        let terrainColor = 0x1a1a1a;
        if (hex.terrain === 'mountain') terrainColor = 0x2a2a2a;
        else if (hex.terrain === 'forest') terrainColor = 0x0d1f0d;
        else if (hex.terrain === 'swamp') terrainColor = 0x1a1f0d;
        g.beginFill(terrainColor);

        // Границы (фиолетовый для акцентов)
        let borderColor = 0x333333, borderWidth = 1, hasTruceGlow = false;
        if (hex.owner === 'player') { borderColor = 0x8a2be2; borderWidth = 3; }
        else if (hex.owner === 'ai') {
            if (game.player.allianceWithAI || game.player.truceTurnsAI > 0) { borderColor = 0x6a0dad; borderWidth = 4; hasTruceGlow = true; }
            else { borderColor = 0xd4af37; borderWidth = 3; }
        } else if (hex.owner === 'werewolf') {
            if (game.player.truceTurnsWolf > 0) { borderColor = 0x6a0dad; borderWidth = 4; hasTruceGlow = true; }
            else { borderColor = 0x2b7a2b; borderWidth = 3; }
        }
        g.lineStyle(borderWidth, borderColor, 0.9);
        g.drawPolygon(...getHexCorners(0, 0, HEX_SIZE));
        g.endFill();

        if (hasTruceGlow) { g.lineStyle(borderWidth + 4, 0x8a2be2, 0.35); g.drawPolygon(...getHexCorners(0, 0, HEX_SIZE)); }
        if (movableHexIds.includes(`${hex.q},${hex.r}`) && hex.owner !== 'player') {
            g.lineStyle(2, 0x8a2be2, 0.8); g.drawPolygon(...getHexCorners(0, 0, HEX_SIZE));
        }

        g.interactive = true; g.cursor = 'pointer'; g.hexData = hex;
        g.on('mouseover', (e) => {
            g.tint = 0x8a2be2;
            const t = document.getElementById('tooltip');
            const o = hex.owner ? (hex.owner === 'player' ? 'Дракула' : (hex.owner === 'ai' ? 'Ватикан' : 'Оборотни')) : 'Ничейная';
            const terrMap = { plains: "Равнины", mountain: "Горы ⛰️", forest: "Густой Лес 🌲", swamp: "Гнилые Болота ☣️" };
            t.innerHTML = `<b>${hex.name}</b> (${terrMap[hex.terrain]})<br>Владелец: ${o}<br>🛡️ Защита: ${getTotalTroops(hex.owner==='player'?hex.playerGarrison:(hex.owner==='ai'?hex.aiGarrison:0))}<br>🏰 Укрепы: ${hex.fortification}`;
            t.style.display = 'block'; t.style.left = (e.data.originalEvent.clientX + 15) + 'px'; t.style.top = (e.data.originalEvent.clientY + 15) + 'px';
        });
        g.on('mouseout', () => { g.tint = 0xFFFFFF; document.getElementById('tooltip').style.display = 'none'; });
        g.on('click', () => handleHexClick(hex));

        try {
            const nT = new PIXI.Text(hex.name, { fontFamily: 'Cinzel', fontSize: 10, fill: 0xe0e5f0, dropShadow: true, dropShadowColor: 0x000000 });
            nT.anchor.set(0.5); nT.y = -HEX_SIZE * 0.35; container.addChild(nT);

            let terrIcon = hex.terrain === 'mountain' ? "⛰️" : (hex.terrain === 'forest' ? "🌲" : (hex.terrain === 'swamp' ? "☣️" : ""));
            if (terrIcon) {
                const iT = new PIXI.Text(terrIcon, { fontSize: Math.floor(HEX_SIZE * 0.35), dropShadow: true, dropShadowColor: 0x000000 });
                iT.anchor.set(0.5); iT.y = HEX_SIZE * 0.12; container.addChild(iT);
            }

            if (hex.owner === 'player' && hex.buildings.length > 0) {
                let bIcon = (hex.buildings.some(b=>b.type==='cemetery')?"⚰️":"") + (hex.buildings.some(b=>b.type==='barracks')?"⚔️":"") + (hex.buildings.some(b=>b.type==='castle')?"🏰":"");
                if (bIcon) {
                    const bT = new PIXI.Text(bIcon, { fontSize: Math.floor(HEX_SIZE * 0.25), fill: 0xffd700 });
                    bT.anchor.set(0.5); bT.y = HEX_SIZE * 0.55; container.addChild(bT);
                }
            }
            container.addChild(g); container.setChildIndex(g, 0);
        } catch (e) { container.addChild(g); }
        hexContainer.addChild(container);
    });
}

function drawArmies() {
    if (!app) return; armyContainer.removeChildren();
    const w = app.renderer.view.width, h = app.renderer.view.height;
    let minQ = Infinity, maxQ = -Infinity, minR = Infinity, maxR = -Infinity;
    game.hexGrid.forEach(hex => { minQ = Math.min(minQ, hex.q); maxQ = Math.max(maxQ, hex.q); minR = Math.min(minR, hex.r); maxR = Math.max(maxR, hex.r); });
    let HEX_SIZE = Math.min(w / ((maxQ - minQ + 1) * 1.8), h / ((maxR - minR + 1) * 1.6), 80) * 0.85;
    if (HEX_SIZE < 12) HEX_SIZE = 12;
    let rawPositions = game.hexGrid.map(hex => { const p = hexToPixel(hex.q, hex.r, HEX_SIZE); return { ...hex, rawX: p.x, rawY: p.y }; });
    let avgX = 0, avgY = 0; rawPositions.forEach(p => { avgX += p.rawX; avgY += p.rawY; });
    avgX /= rawPositions.length; avgY /= rawPositions.length;
    let shiftX = (w / 2) - avgX, shiftY = (h / 2) - avgY;

    function placeSprite(sprite, x, y, scale = 0.12, fallbackColor, fallbackSymbol) {
        if (sprite) {
            const s = new PIXI.Sprite(sprite); s.anchor.set(0.5); s.scale.set(scale); s.x = x; s.y = y; armyContainer.addChild(s);
        } else {
            const c = new PIXI.Graphics(); c.beginFill(fallbackColor); c.drawCircle(0, 0, 16); c.endFill();
            c.lineStyle(2, 0x000000, 0.5); c.drawCircle(0, 0, 16);
            const t = new PIXI.Text(fallbackSymbol, { fontFamily: 'Cinzel', fontSize: 12, fill: 0xffffff, fontWeight: 'bold' });
            t.anchor.set(0.5); c.addChild(t);
            const countText = new PIXI.Text(`${getTotalTroops(game.player.mobileArmy)}`, { fontFamily: 'Arial', fontSize: 8, fill: 0xffffff });
            countText.anchor.set(0.5); countText.y = 14; c.addChild(countText);
            c.x = x; c.y = y; armyContainer.addChild(c);
        }
    }

    // Армия игрока
    const pPos = game.hexGrid.find(h => `${h.q},${h.r}` === game.player.mobileArmy.hexId);
    if (pPos) {
        let p = hexToPixel(pPos.q, pPos.r, HEX_SIZE), x = p.x + shiftX, y = p.y + shiftY;
        placeSprite(spritePlayer, x, y, 0.12, 0x7a1111, '🦇');
        if (game.player.lords.length > 0 && spriteLord) {
            const l = new PIXI.Sprite(spriteLord); l.anchor.set(0.5); l.scale.set(0.07); l.x = x + 25; l.y = y - 20; armyContainer.addChild(l);
        }
        if (game.player.mobileArmy.gargoyle > 0) {
            const gT = new PIXI.Text(`🪨${game.player.mobileArmy.gargoyle}`, { fontSize: 10, fill: 0x8888ff, dropShadow: true });
            gT.anchor.set(0.5); gT.x = x - 20; gT.y = y + 20; armyContainer.addChild(gT);
        }
        if (game.player.mobileArmy.noble > 0) {
            const nT = new PIXI.Text(`🧛${game.player.mobileArmy.noble}`, { fontSize: 10, fill: 0xff88aa, dropShadow: true });
            nT.anchor.set(0.5); nT.x = x + 20; nT.y = y + 20; armyContainer.addChild(nT);
        }
    }

    // Армия ИИ
    const aPos = game.hexGrid.find(h => `${h.q},${h.r}` === game.ai.mobileArmy.hexId);
    if (aPos) {
        let p = hexToPixel(aPos.q, aPos.r, HEX_SIZE), x = p.x + shiftX, y = p.y + shiftY;
        placeSprite(spriteAI, x, y, 0.14, 0xe0e0c0, '✝');
        if (spriteAIGeneral) {
            const g = new PIXI.Sprite(spriteAIGeneral); g.anchor.set(0.5); g.scale.set(0.07); g.x = x + 25; g.y = y - 20; armyContainer.addChild(g);
        }
    }

    // Армия оборотней
    const wPos = game.hexGrid.find(h => `${h.q},${h.r}` === game.werewolf.mobileArmy.hexId);
    if (wPos) {
        let p = hexToPixel(wPos.q, wPos.r, HEX_SIZE), x = p.x + shiftX, y = p.y + shiftY;
        placeSprite(spriteWerewolf, x, y, 0.12, 0x2d4a2d, '👹');
        if (spriteWolfGeneral) {
            const g = new PIXI.Sprite(spriteWolfGeneral); g.anchor.set(0.5); g.scale.set(0.07); g.x = x + 25; g.y = y - 20; armyContainer.addChild(g);
        }
    }
}

function updateUI() {
    document.getElementById('turn-counter').textContent = game.turn;
    document.getElementById('day-counter').textContent = game.day;
    const icon = document.getElementById('day-night-icon');
    if (icon) icon.textContent = isNightTime() ? '🌙' : '☀️';
    document.getElementById('blood-counter').textContent = game.player.blood;
    document.getElementById('gold-counter').textContent = game.player.gold;
    document.getElementById('elite-counter').textContent = game.player.lords.length;
    document.getElementById('humanity-text').textContent = `${game.humanity}/100`;
    document.getElementById('humanity-bar-fill').style.width = Math.min(100, game.humanity) + '%';
    document.getElementById('trust-text').textContent = `${game.cassaldiaTrust}/100`;
    document.getElementById('trust-bar-fill').style.width = Math.min(100, game.cassaldiaTrust) + '%';

    const cH = game.hexGrid.find(h => `${h.q},${h.r}` === game.player.mobileArmy.hexId);
    const isReadyToAssault = (cH && cH.siegeBy === 'player' && game.player.ap > 0 && isNightTime() && !game.gameOver);
    document.getElementById('btn-assault').disabled = !isReadyToAssault;

    document.getElementById('recruit-gargoyle').disabled = !game.player.techs.militaryReform;
    document.getElementById('recruit-noble').disabled = !game.player.techs.necromancy;

    drawHexes(); drawArmies();
}

// ================= ЛОГИКА ИГРЫ =================
function handleHexClick(hex) {
    if (game.gameOver || game.player.ap <= 0) return log('Нет очков действий.', 'system');
    const cH = game.hexGrid.find(h => `${h.q},${h.r}` === game.player.mobileArmy.hexId);
    if (!cH) return;

    if (hex.owner === 'player') {
        game.selectedHexId = `${hex.q},${hex.r}`;
        log(`Выбрана ${hex.name} для стройки.`, 'system'); updateUI(); return;
    }

    const currentHexId = `${cH.q},${cH.r}`;
    const clickedHexId = `${hex.q},${hex.r}`;
    const neighbors = getNeighbors(Number(cH.q), Number(cH.r));
    const isNeighbor = neighbors.some(n => `${n.q},${n.r}` === clickedHexId);

    if (!isNeighbor) {
        log('Слишком далеко! Кликайте только по соседним гексам.', 'system');
        return;
    }

    if (hex.owner === null) {
        game.player.mobileArmy.hexId = clickedHexId;
        if (getTotalTroops(game.player.mobileArmy) > 0) {
            hex.owner = 'player';
            if (hex.resources.gold > 0 || hex.resources.blood > 0) {
                game.player.gold += hex.resources.gold * 2;
                game.player.blood += hex.resources.blood * 2;
                log(`Захвачены ресурсы: +${hex.resources.gold*2}🪙, +${hex.resources.blood*2}🩸`, 'player');
            }
            hex.playerGarrison.infantry += 5;
            log(`${hex.name} захвачена!`, 'player');
        } else {
            log(`Армия переместилась в ${hex.name}.`, 'player');
        }
        game.player.ap -= 1; updateUI(); return;
    }
    if (hex.owner === 'ai' || hex.owner === 'werewolf') {
        if (!isNightTime()) return log('День! Нельзя атаковать.', 'player');
        if (getTotalTroops(game.player.mobileArmy) === 0) return log('Нет войск.', 'system');
        game.pendingActionHexId = clickedHexId;
        document.getElementById('action-desc').textContent = `Ваша армия вошла в «${hex.name}».`;
        document.getElementById('action-modal').style.display = 'flex';
    }
}

// === БОЕВЫЕ ДЕЙСТВИЯ ===
function executeCurse(targetHex) {
    if (game.battleActive) return; game.battleActive = true;
    let defGar = targetHex.owner === 'player' ? targetHex.playerGarrison : targetHex.aiGarrison;
    let totalDef = getTotalTroops(defGar) + targetHex.fortification * 5;
    let defLoss = 30 + Math.floor(Math.random() * 10);
    if (defLoss > totalDef) defLoss = totalDef;
    const types = ['infantry', 'archer', 'cavalry', 'gargoyle', 'noble'];
    types.forEach(t => {
        if (defGar[t] > 0) defGar[t] = Math.max(0, defGar[t] - Math.floor(defLoss * (defGar[t] / (totalDef + 1))));
    });
    log(`Проклятие на ${targetHex.name}! Урон: ${defLoss}.`, 'system');
    SoundEngine.playCurse();
    if (getTotalTroops(defGar) <= 0) {
        log(`Провинция ${targetHex.name} захвачена магией!`, 'player');
        targetHex.owner = 'player'; targetHex.siegeBy = null; targetHex.aiGarrison = { infantry:0, archer:0, cavalry:0, gargoyle:0, noble:0 };
        game.player.mobileArmy.hexId = `${targetHex.q},${targetHex.r}`;
        document.getElementById('surrender-modal').style.display = 'flex';
    } else {
        log(`Проклятие отбито!`, 'system');
        const fb = game.hexGrid.find(h => h.owner === 'player');
        if (fb) game.player.mobileArmy.hexId = `${fb.q},${fb.r}`;
    }
    game.battleActive = false; updateUI();
}

function executeBribe(targetHex) {
    if (game.player.gold < 100) { log('Недостаточно золота!', 'system'); return; }
    game.player.gold -= 100;
    log(`${targetHex.name} подкуплена!`, 'player');
    targetHex.owner = 'player'; targetHex.siegeBy = null; targetHex.aiGarrison = { infantry:0, archer:0, cavalry:0, gargoyle:0, noble:0 };
    game.player.mobileArmy.hexId = `${targetHex.q},${targetHex.r}`;
    document.getElementById('surrender-modal').style.display = 'flex';
    updateUI();
}

function executeBattle(targetHex) {
    if (game.battleActive) return; game.battleActive = true;
    let attArmy = game.player.mobileArmy;
    let defGar = targetHex.owner === 'player' ? targetHex.playerGarrison : targetHex.aiGarrison;
    let totalAtt = getTotalTroops(attArmy);
    let totalDef = getTotalTroops(defGar) + targetHex.fortification * 5;
    if (totalAtt === 0) { game.battleActive = false; return log('Армия пуста.', 'system'); }

    let terrainPenalty = 0;
    if (targetHex.terrain === 'mountain') terrainPenalty = 0.15;
    else if (targetHex.terrain === 'forest') terrainPenalty = 0.1;
    else if (targetHex.terrain === 'swamp') terrainPenalty = 0.05;
    let effectiveAtt = totalAtt * (1 + getLordBonus() - terrainPenalty);
    let gargoyleCount = attArmy.gargoyle || 0;
    let nobleCount = attArmy.noble || 0;
    effectiveAtt += gargoyleCount * 1.2 + nobleCount * 1.5;

    let attLoss = Math.floor(Math.random() * 0.2 * effectiveAtt);
    let defLoss = Math.floor(Math.random() * 0.2 * totalDef);
    if (attLoss > totalAtt) attLoss = totalAtt - 1;
    if (defLoss > totalDef) defLoss = totalDef - 1;

    const types = ['infantry', 'archer', 'cavalry', 'gargoyle', 'noble'];
    types.forEach(t => {
        if (attArmy[t] > 0) attArmy[t] = Math.max(0, attArmy[t] - Math.floor(attLoss * (attArmy[t] / (totalAtt + 1))));
        if (defGar[t] > 0) defGar[t] = Math.max(0, defGar[t] - Math.floor(defLoss * (defGar[t] / (totalDef + 1))));
    });

    log(`Бой за ${targetHex.name}! Потери: Вы ${attLoss}, Враг ${defLoss}.`, 'system');
    SoundEngine.playBattle();

    if (getTotalTroops(defGar) <= 0) {
        log(`Провинция ${targetHex.name} захвачена!`, 'player');
        targetHex.owner = 'player'; targetHex.siegeBy = null; targetHex.aiGarrison = { infantry:0, archer:0, cavalry:0, gargoyle:0, noble:0 };
        game.player.mobileArmy.hexId = `${targetHex.q},${targetHex.r}`;
        if (nobleCount > 0) {
            let gain = nobleCount * 2;
            game.humanity = Math.min(100, game.humanity + gain);
            log(`Аристократы вдохновили войско, +${gain} Человечности.`, 'player');
        }
        document.getElementById('surrender-modal').style.display = 'flex';
    } else {
        log(`Штурм отбит!`, 'system');
        const fb = game.hexGrid.find(h => h.owner === 'player');
        if (fb) game.player.mobileArmy.hexId = `${fb.q},${fb.r}`;
    }
    game.battleActive = false; updateUI();
}

// ================= ЭКОНОМИКА, ИИ И СОБЫТИЯ =================
function collectIncome() {
    let bloodBonus = 0, goldBonus = 0;
    game.hexGrid.forEach(h => {
        if (h.owner === 'player') {
            goldBonus += 2 + (h.resources?.gold || 0);
            bloodBonus += 1 + (h.resources?.blood || 0);
            h.buildings.forEach(b => {
                if (b.type === 'cemetery') bloodBonus += 5;
                if (b.type === 'citadel' && game.player.hasCitadel) goldBonus += 50;
            });
        } else if (h.owner === 'ai') game.ai.gold += 2;
        else if (h.owner === 'werewolf') game.werewolf.gold += 3;
    });
    game.player.blood += bloodBonus;
    game.player.gold += goldBonus;
}

function triggerRandomEvent() {
    const events = [
        { msg: "Налет волков! -10 населения в случайной провинции.", effect: () => {
            const candidates = game.hexGrid.filter(h => h.owner === 'player' && h.population > 0);
            if (candidates.length) {
                const h = candidates[Math.floor(Math.random() * candidates.length)];
                h.population = Math.max(0, h.population - 10);
                log(`Волки разорили ${h.name}.`, 'system');
            }
        }},
        { msg: "Чума в провинции! -15 населения и -5 крови.", effect: () => {
            const candidates = game.hexGrid.filter(h => h.owner === 'player');
            if (candidates.length) {
                const h = candidates[Math.floor(Math.random() * candidates.length)];
                h.population = Math.max(0, h.population - 15);
                game.player.blood = Math.max(0, game.player.blood - 5);
                log(`Эпидемия в ${h.name}.`, 'system');
            }
        }},
        { msg: "Праздник урожая! +30 золота и +5 крови.", effect: () => {
            game.player.gold += 30; game.player.blood += 5;
            log('Крестьяне принесли дары. +30🪙 +5🩸', 'player');
        }},
        { msg: "Охотники на вампиров! -15 пехоты.", effect: () => {
            if (game.player.mobileArmy.infantry > 0) {
                let loss = Math.min(15, game.player.mobileArmy.infantry);
                game.player.mobileArmy.infantry -= loss;
                log(`Охотники убили ${loss} пехотинцев.`, 'system');
            }
        }}
    ];
    if (Math.random() < 0.3) {
        const ev = events[Math.floor(Math.random() * events.length)];
        log(ev.msg, 'system');
        ev.effect();
    }
}

function aiTurn() {
    // Пополнение
    if (game.ai.gold > 20 && game.ai.mobileArmy.infantry < 80) {
        game.ai.gold -= 10; game.ai.mobileArmy.infantry += 5;
    }
    if (game.ai.gold > 30 && game.ai.mobileArmy.archer < 30) {
        game.ai.gold -= 15; game.ai.mobileArmy.archer += 3;
    }
    // Строительство
    const aiHexes = game.hexGrid.filter(h => h.owner === 'ai');
    for (let h of aiHexes) {
        if (game.ai.gold > 20 && !h.buildings.some(b => b.type === 'barracks') && Math.random() < 0.2) {
            game.ai.gold -= 20; h.buildings.push({ type: 'barracks', lvl: 1 });
            log('Ватикан построил Казармы в ' + h.name, 'ai');
        }
        if (game.ai.gold > 40 && !h.buildings.some(b => b.type === 'castle') && Math.random() < 0.15) {
            game.ai.gold -= 40; h.buildings.push({ type: 'castle', lvl: 1 }); h.fortification += 2;
            log('Ватикан построил Замок в ' + h.name, 'ai');
        }
    }
    // Дипломатия
    const playerPower = getTotalTroops(game.player.mobileArmy);
    const aiPower = getTotalTroops(game.ai.mobileArmy);
    if (playerPower > aiPower * 1.5 && game.player.truceTurnsAI === 0 && game.player.truceTurnsWolf === 0) {
        if (Math.random() < 0.3) {
            log('Ватикан предлагает перемирие на 2 хода.', 'ai');
            game.player.truceTurnsAI = 2;
        }
    }
    // Атака ИИ
    const aiHex = game.hexGrid.find(h => `${h.q},${h.r}` === game.ai.mobileArmy.hexId);
    if (aiHex && game.player.truceTurnsAI === 0) {
        const neighbors = getNeighbors(aiHex.q, aiHex.r);
        for (let n of neighbors) {
            const target = game.hexGrid.find(h => h.q === n.q && h.r === n.r);
            if (target && target.owner === 'player') {
                if (getTotalTroops(game.ai.mobileArmy) > getTotalTroops(target.playerGarrison) + target.fortification * 3) {
                    if (isNightTime()) {
                        log(`Ватикан атакует ${target.name}!`, 'ai');
                        executeAIBattle(target);
                        break;
                    } else {
                        if (target.siegeBy !== 'ai') {
                            target.siegeBy = 'ai';
                            log(`Ватикан осаждает ${target.name}.`, 'ai');
                            break;
                        }
                    }
                }
            }
        }
    }
    // Оборотни
    if (game.player.truceTurnsWolf === 0) {
        const wolfHex = game.hexGrid.find(h => `${h.q},${h.r}` === game.werewolf.mobileArmy.hexId);
        if (wolfHex) {
            const neighbors = getNeighbors(wolfHex.q, wolfHex.r);
            for (let n of neighbors) {
                const target = game.hexGrid.find(h => h.q === n.q && h.r === n.r);
                if (target && target.owner === 'player') {
                    if (getTotalTroops(game.werewolf.mobileArmy) > getTotalTroops(target.playerGarrison) + target.fortification * 2) {
                        if (isNightTime()) {
                            log(`Стая оборотней атакует ${target.name}!`, 'ai');
                            executeWolfBattle(target);
                            break;
                        } else {
                            if (target.siegeBy !== 'werewolf') {
                                target.siegeBy = 'werewolf';
                                log(`Стая осаждает ${target.name}.`, 'ai');
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
    if (game.player.truceTurnsAI > 0) game.player.truceTurnsAI--;
    if (game.player.truceTurnsWolf > 0) game.player.truceTurnsWolf--;
}

function executeAIBattle(targetHex) {
    let attArmy = game.ai.mobileArmy;
    let defGar = targetHex.playerGarrison;
    let totalAtt = getTotalTroops(attArmy);
    let totalDef = getTotalTroops(defGar) + targetHex.fortification * 5;
    let attLoss = Math.floor(Math.random() * 0.2 * totalAtt);
    let defLoss = Math.floor(Math.random() * 0.2 * totalDef);
    const types = ['infantry', 'archer', 'cavalry', 'gargoyle', 'noble'];
    types.forEach(t => {
        if (attArmy[t] > 0) attArmy[t] = Math.max(0, attArmy[t] - Math.floor(attLoss * (attArmy[t] / (totalAtt + 1))));
        if (defGar[t] > 0) defGar[t] = Math.max(0, defGar[t] - Math.floor(defLoss * (defGar[t] / (totalDef + 1))));
    });
    if (getTotalTroops(defGar) <= 0) {
        targetHex.owner = 'ai';
        targetHex.playerGarrison = { infantry:0, archer:0, cavalry:0, gargoyle:0, noble:0 };
        game.ai.mobileArmy.hexId = `${targetHex.q},${targetHex.r}`;
        log(`${targetHex.name} захвачена Ватиканом!`, 'ai');
    } else {
        log(`Ватикан отбит от ${targetHex.name}.`, 'ai');
    }
}

function executeWolfBattle(targetHex) {
    let attArmy = game.werewolf.mobileArmy;
    let defGar = targetHex.playerGarrison;
    let totalAtt = getTotalTroops(attArmy);
    let totalDef = getTotalTroops(defGar) + targetHex.fortification * 5;
    let attLoss = Math.floor(Math.random() * 0.2 * totalAtt);
    let defLoss = Math.floor(Math.random() * 0.2 * totalDef);
    const types = ['infantry', 'archer', 'cavalry', 'gargoyle', 'noble'];
    types.forEach(t => {
        if (attArmy[t] > 0) attArmy[t] = Math.max(0, attArmy[t] - Math.floor(attLoss * (attArmy[t] / (totalAtt + 1))));
        if (defGar[t] > 0) defGar[t] = Math.max(0, defGar[t] - Math.floor(defLoss * (defGar[t] / (totalDef + 1))));
    });
    if (getTotalTroops(defGar) <= 0) {
        targetHex.owner = 'werewolf';
        targetHex.playerGarrison = { infantry:0, archer:0, cavalry:0, gargoyle:0, noble:0 };
        game.werewolf.mobileArmy.hexId = `${targetHex.q},${targetHex.r}`;
        log(`${targetHex.name} захвачена оборотнями!`, 'ai');
    } else {
        log(`Оборотни отбиты от ${targetHex.name}.`, 'ai');
    }
}

function endPlayerTurn() {
    if (game.gameOver || game.battleActive) return;
    collectIncome();
    game.player.ap = game.player.maxAp;
    game.turn++;
    if (game.turn % 2 === 1) game.day++;
    game.marketRates.goldToBlood = 0.6 + Math.random() * 0.8;
    game.marketRates.bloodToGold = 0.5 + Math.random() * 0.7;
    game.marketTradedThisTurn = false;
    log(`ХОД ${game.turn}. ${isNightTime() ? '🌙 НОЧЬ' : '☀️ ДЕНЬ'}.`, 'system');
    triggerRandomEvent();
    aiTurn();
    checkGameConditions();
    checkStoryConditions();
    saveGame();
    updateUI();
}

// ================= ЛОР-ПОДСКАЗКИ =================
function attachLoreListeners() {
    document.querySelectorAll('[data-lore]').forEach(btn => {
        btn.addEventListener('mouseenter', (e) => {
            const loreKey = btn.getAttribute('data-lore');
            const loreText = BUILD_LORE[loreKey];
            if (loreText) {
                const t = document.getElementById('lore-tooltip');
                if(t) {
                    t.textContent = loreText;
                    t.style.display = 'block';
                    t.style.left = (e.pageX + 10) + 'px';
                    t.style.top = (e.pageY + 10) + 'px';
                }
            }
        });
        btn.addEventListener('mouseleave', () => {
            const t = document.getElementById('lore-tooltip');
            if(t) t.style.display = 'none';
        });
    });
}

// ================= ПРОЛОГ И ЗАПУСК =================
let isTypingComplete = false;

function startTypeWriter() {
    const container = document.getElementById('prologue-text-container');
    const btnWrapper = document.getElementById('prologue-btn-wrapper');
    if (!container) return;
    container.innerHTML = '';

    const storyText = `Граф Дракула, последний из древнего рода, пробуждается спустя столетия. Им движет не только жажда крови, но и пылающая, неутолимая любовь к прекрасной Кассальдии — дочери его самого могущественного врага. Он хочет подарить ей мир, где она будет в безопасности, но его собственная вампирская сущность жаждет власти и хаоса. Святой Престол во главе с Папой Эмиретиусом Клавдием II объявил крестовый поход против вампиров. Эмиретиус держит свою дочь Кассальдию в строгой изоляции, используя её как пешку для укрепления своей власти. Дракула должен объединить и завоевать все земли Европы, чтобы сокрушить Ватикан и освободить её. Каждое убийство делает Дракулу сильнее, но оно же отдаляет его от человечности, которую он пытается сохранить ради Кассальдии. Он боится, что, достигнув цели, он станет чудовищем, которое она не сможет полюбить. Ватикан не остановится ни перед чем. Им противостоят дикие Оборотни, жаждущие крови. Но даже объединившись, они не смогут противостоять Армии Тьмы, которую ведёт Дракула. Европа — это поле боя, а судьба Кассальдии — главный приз. Сделайте правильный выбор, Повелитель Тьмы!`;

    const paragraphs = storyText.split('\n').filter(p => p.trim() !== '');
    let paragraphIndex = 0, charIndex = 0;
    let currentParagraphElement = null;

    function typeNextChar() {
        if (paragraphIndex >= paragraphs.length) {
            isTypingComplete = true;
            btnWrapper.style.display = 'flex';
            return;
        }
        if (charIndex === 0) {
            currentParagraphElement = document.createElement('p');
            container.appendChild(currentParagraphElement);
        }
        const paragraphText = paragraphs[paragraphIndex].trim();
        if (charIndex < paragraphText.length) {
            currentParagraphElement.textContent += paragraphText.charAt(charIndex);
            charIndex++;
            setTimeout(typeNextChar, 6);
        } else {
            charIndex = 0;
            paragraphIndex++;
            setTimeout(typeNextChar, 500);
        }
    }
    typeNextChar();
}

function startGameMap() {
    document.getElementById('prologue-modal').style.display = 'none';
    document.getElementById('start-menu').style.display = 'none';
    document.getElementById('game-container').style.display = 'flex';
    if (!loadGame()) {
        game = getDefaultGame();
        game.hexGrid = initHexGrid();
        game.player.lords.push({ name: LORD_NAMES[0], battles: 0 });
        log('Новая игра началась.', 'system');
    } else {
        log('Загружена сохранённая игра.', 'system');
    }
    document.getElementById('btn-end-turn').disabled = false;
    attachLoreListeners();
    resizeMap();
    updateUI();
    log('Дракула пробудился! Завоюйте Европу.', 'system');
    log('💡 Кликните на соседний гекс для перемещения. Для атаки выберите вражеский гекс ночью.', 'system');
}

function initGame(isNewGame = false) {
    if (isNewGame) {
        document.getElementById('loading-modal').style.display = 'flex';
        setTimeout(() => {
            document.getElementById('start-menu').style.display = 'none';
            document.getElementById('loading-modal').style.display = 'none';
            document.getElementById('prologue-modal').style.display = 'flex';
            isTypingComplete = false;
            document.getElementById('prologue-btn-wrapper').style.display = 'none';
            startTypeWriter();
        }, 500);
    } else {
        startGameMap();
    }
}

// ================= ИНИЦИАЛИЗАЦИЯ И ОБРАБОТЧИКИ =================
document.addEventListener('DOMContentLoaded', async () => {
    await loadSprites();
    initPixi();

    document.getElementById('start-menu').style.display = 'flex';
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('loading-modal').style.display = 'none';
    document.getElementById('prologue-modal').style.display = 'none';

    document.getElementById('btn-prologue-start').addEventListener('click', startGameMap);
    document.getElementById('btn-new-game').addEventListener('click', () => { localStorage.removeItem('DraculaHexFinal'); initGame(true); });
    document.getElementById('btn-load-game').addEventListener('click', () => { initGame(false); });
    document.getElementById('btn-gameover-restart').addEventListener('click', () => {
        document.getElementById('gameover-modal').style.display = 'none';
        localStorage.removeItem('DraculaHexFinal');
        initGame(true);
    });

    document.getElementById('btn-music-toggle').addEventListener('click', () => {
        const bgm = document.getElementById('bgm');
        if (bgm.paused) { bgm.volume = 0.4; bgm.play().catch(()=>{}); document.getElementById('btn-music-toggle').textContent = "ЗВУК"; }
        else { bgm.pause(); document.getElementById('btn-music-toggle').textContent = "ЗВУК"; }
    });
    document.getElementById('btn-mnu-restart').addEventListener('click', () => {
        if(confirm('Выйти в главное меню? Прогресс будет потерян.')) {
            document.getElementById('start-menu').style.display = 'flex';
            document.getElementById('game-container').style.display = 'none';
            game.gameOver = false;
            document.getElementById('gameover-modal').style.display = 'none';
        }
    });
    document.getElementById('btn-end-turn').addEventListener('click', endPlayerTurn);

    document.getElementById('btn-toggle-log').addEventListener('click', () => { document.getElementById('log-overlay').style.display = 'flex'; });
    document.getElementById('btn-close-log').addEventListener('click', () => { document.getElementById('log-overlay').style.display = 'none'; });
    document.getElementById('btn-clear-log').addEventListener('click', () => document.getElementById('log-container').innerHTML = '');

    // Выпадающие меню
    document.querySelectorAll('.dropdown-toggle').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const content = this.parentElement.querySelector('.dropdown-content');
            document.querySelectorAll('.dropdown-content.open').forEach(el => {
                if (el !== content) el.classList.remove('open');
            });
            content.classList.toggle('open');
        });
    });
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-content.open').forEach(el => el.classList.remove('open'));
        }
    });

    // ===== ОТКРЫТИЕ МОДАЛЬНЫХ ОКОН =====
    const openModal = (id) => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'flex';
        else console.warn('Modal not found:', id);
    };
    const closeModal = (id) => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    };

    document.getElementById('btn-open-diplomacy').addEventListener('click', () => openModal('diplomacy-modal'));
    document.getElementById('btn-diplomacy-close').addEventListener('click', () => closeModal('diplomacy-modal'));

    document.getElementById('btn-open-market').addEventListener('click', () => openModal('market-modal'));
    document.getElementById('btn-market-close').addEventListener('click', () => closeModal('market-modal'));

    document.getElementById('btn-open-tech').addEventListener('click', () => openModal('tech-modal'));
    document.getElementById('btn-tech-close').addEventListener('click', () => closeModal('tech-modal'));

    document.getElementById('btn-open-factions').addEventListener('click', () => openModal('factions-modal'));
    document.getElementById('btn-factions-close').addEventListener('click', () => closeModal('factions-modal'));

    // Закрытие модалок по клику на фон
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
    });

    // ===== ОСТАЛЬНЫЕ ОБРАБОТЧИКИ =====
    document.getElementById('btn-action-close').addEventListener('click', () => document.getElementById('action-modal').style.display = 'none');

    document.getElementById('btn-siege').addEventListener('click', () => {
        if (!game.pendingActionHexId || game.player.ap <= 0) return;
        const h = game.hexGrid.find(x => `${x.q},${x.r}` === game.pendingActionHexId);
        h.siegeBy = 'player'; game.player.mobileArmy.hexId = `${h.q},${h.r}`; game.player.ap -= 1;
        log(`${h.name} взята в осаду!`, 'player');
        document.getElementById('action-modal').style.display = 'none'; updateUI();
    });
    document.getElementById('btn-assault-now').addEventListener('click', () => {
        if (!game.pendingActionHexId) return;
        const h = game.hexGrid.find(x => `${x.q},${x.r}` === game.pendingActionHexId);
        game.player.mobileArmy.hexId = `${h.q},${h.r}`; game.player.ap -= 1;
        document.getElementById('action-modal').style.display = 'none'; executeBattle(h);
    });
    document.getElementById('btn-curse').addEventListener('click', () => {
        if (!game.pendingActionHexId || game.player.ap <= 0) return;
        if (game.player.blood < 15) return log('Недостаточно крови!', 'system');
        const h = game.hexGrid.find(x => `${x.q},${x.r}` === game.pendingActionHexId);
        game.player.mobileArmy.hexId = `${h.q},${h.r}`; game.player.ap -= 1; game.player.blood -= 15;
        document.getElementById('action-modal').style.display = 'none';
        executeCurse(h);
    });
    document.getElementById('btn-bribe').addEventListener('click', () => {
        if (!game.pendingActionHexId || game.player.ap <= 0) return;
        if (game.player.gold < 100) return log('Недостаточно золота!', 'system');
        const h = game.hexGrid.find(x => `${x.q},${x.r}` === game.pendingActionHexId);
        game.player.mobileArmy.hexId = `${h.q},${h.r}`; game.player.ap -= 1;
        document.getElementById('action-modal').style.display = 'none';
        executeBribe(h);
    });
    document.getElementById('btn-assault').addEventListener('click', () => {
        if (!isNightTime()) return log('День! Штурм отменяется.', 'player');
        if (game.player.ap <= 0) return log('Нет очков действий.', 'system');
        const h = game.hexGrid.find(x => `${x.q},${x.r}` === game.player.mobileArmy.hexId);
        if (h && h.siegeBy === 'player') { game.player.ap -= 1; executeBattle(h); }
    });
    document.getElementById('btn-cancel-siege').addEventListener('click', () => {
        const h = game.hexGrid.find(x => `${x.q},${x.r}` === game.player.mobileArmy.hexId);
        if (h && h.siegeBy === 'player') { h.siegeBy = null; log(`Осада снята с ${h.name}.`, 'player'); updateUI(); }
    });

    // Дипломатия
    document.getElementById('dip-truce-ai').addEventListener('click', () => {
        if (game.player.gold < 30) return log('Не хватает золота.', 'system');
        if (game.player.truceTurnsAI > 0) return log('Перемирие уже активно.', 'system');
        game.player.gold -= 30; game.player.truceTurnsAI = 2;
        log('Перемирие с Ватиканом на 2 хода!', 'player');
        document.getElementById('diplomacy-modal').style.display = 'none'; updateUI();
    });
    document.getElementById('dip-truce-wolf').addEventListener('click', () => {
        if (game.player.gold < 30) return log('Не хватает золота.', 'system');
        if (game.player.truceTurnsWolf > 0) return log('Перемирие уже активно.', 'system');
        game.player.gold -= 30; game.player.truceTurnsWolf = 2;
        log('Перемирие с Оборотнями на 2 хода!', 'player');
        document.getElementById('diplomacy-modal').style.display = 'none'; updateUI();
    });
    document.getElementById('dip-alliance').addEventListener('click', () => {
        if (game.player.gold < 50) return log('Не хватает золота.', 'system');
        if (game.player.allianceWithAI) return log('Союз уже активен.', 'system');
        game.player.gold -= 50; game.player.allianceWithAI = true;
        log('Союз с Ватиканом против Оборотней!', 'player');
        document.getElementById('diplomacy-modal').style.display = 'none'; updateUI();
    });

    // Рынок
    document.getElementById('mkt-gold-to-blood').addEventListener('click', () => {
        if (game.marketTradedThisTurn && !game.player.techs.tradeRoutes) return log('Рынок уже использован.', 'system');
        if (game.player.gold < 10) return log('Недостаточно золота.', 'system');
        let rate = game.marketRates.goldToBlood;
        let blood = Math.floor(10 * rate);
        game.player.gold -= 10; game.player.blood += blood;
        game.marketTradedThisTurn = true;
        log(`Обмен: 10🪙 -> ${blood}🩸`, 'player');
        document.getElementById('market-modal').style.display = 'none'; updateUI();
    });
    document.getElementById('mkt-blood-to-gold').addEventListener('click', () => {
        if (game.marketTradedThisTurn && !game.player.techs.tradeRoutes) return log('Рынок уже использован.', 'system');
        if (game.player.blood < 10) return log('Недостаточно крови.', 'system');
        let rate = game.marketRates.bloodToGold;
        let gold = Math.floor(10 * rate);
        game.player.blood -= 10; game.player.gold += gold;
        game.marketTradedThisTurn = true;
        log(`Обмен: 10🩸 -> ${gold}🪙`, 'player');
        document.getElementById('market-modal').style.display = 'none'; updateUI();
    });
    // Обновление курса в модалке
    document.getElementById('mkt-rate-gtb').textContent = Math.floor(game.marketRates.goldToBlood * 10) / 10;
    document.getElementById('mkt-rate-btg').textContent = Math.floor(game.marketRates.bloodToGold * 10) / 10;

    // Технологии
    document.getElementById('tech-reform').addEventListener('click', () => {
        if (game.player.gold < 30) return log('Не хватает золота.', 'system');
        if (game.player.techs.militaryReform) return log('Уже изучено.', 'system');
        game.player.gold -= 30; game.player.techs.militaryReform = true;
        log('Изучена Военная реформа! Открыты Гаргульи.', 'player');
        document.getElementById('tech-modal').style.display = 'none'; updateUI();
    });
    document.getElementById('tech-necro').addEventListener('click', () => {
        if (game.player.gold < 30) return log('Не хватает золота.', 'system');
        if (game.player.techs.necromancy) return log('Уже изучено.', 'system');
        game.player.gold -= 30; game.player.techs.necromancy = true;
        log('Изучена Некромантия! Открыты Аристократы.', 'player');
        document.getElementById('tech-modal').style.display = 'none'; updateUI();
    });
    document.getElementById('tech-trade').addEventListener('click', () => {
        if (game.player.gold < 30) return log('Не хватает золота.', 'system');
        if (game.player.techs.tradeRoutes) return log('Уже изучено.', 'system');
        game.player.gold -= 30; game.player.techs.tradeRoutes = true;
        log('Изучены Торговые пути! Рынок без ограничений.', 'player');
        document.getElementById('tech-modal').style.display = 'none'; updateUI();
    });

    // Постройки
    const builds = {
        'build-cemetery': 'cemetery', 'build-barracks': 'barracks', 'build-barracks-2': 'barracks_lv2',
        'build-ritual': 'dark_temple', 'build-dungeon': 'dungeon', 'build-executions': 'executions',
        'build-ball': 'ball', 'build-center': 'center', 'build-citadel': 'citadel',
        'build-wall': 'wall', 'build-castle': 'castle', 'build-market': 'market'
    };
    const buildCosts = { 'cemetery': 30, 'barracks': 20, 'barracks_lv2': 50, 'dark_temple': 20, 'dungeon': 15, 'executions': 10, 'ball': 30, 'center': 25, 'citadel': 40, 'wall': 10, 'castle': 40, 'market': 20 };
    Object.keys(builds).forEach(id => {
        document.getElementById(id).addEventListener('click', () => {
            if (game.player.ap <= 0) return log('Нет очков действий.', 'system');
            if (!game.selectedHexId) return log('Выберите свой гекс на карте.', 'system');
            const h = game.hexGrid.find(x => `${x.q},${x.r}` === game.selectedHexId);
            if (!h || h.owner !== 'player') return log('Не ваша территория.', 'system');
            const type = builds[id];
            if (game.player.gold < buildCosts[type]) return log('Не хватает золота.', 'system');
            if (h.buildings.find(b => b.type === type)) return log('Уже построено.', 'system');
            game.player.gold -= buildCosts[type]; h.buildings.push({ type: type, lvl: 1 });
            if (type === 'wall') h.fortification += 1;
            else if (type === 'castle') { h.fortification += 2; h.playerGarrison.infantry += 20; }
            else if (type === 'citadel') game.player.hasCitadel = true;
            log(`Построено: ${type} в ${h.name}.`, 'player');
            SoundEngine.playBuild();
            game.player.ap -= 1; updateUI();
        });
    });

    // Призыв
    const recruitTypes = ['infantry', 'archer', 'cavalry', 'knights', 'lord', 'soul_collector', 'gargoyle', 'noble'];
    const recruitCosts = { 'infantry': 10, 'archer': 15, 'cavalry': 20, 'knights': 30, 'lord': 10, 'soul_collector': 25, 'gargoyle': 25, 'noble': 40 };
    const recruitFunc = {
        'infantry': (h) => { if (!h.buildings.some(b=>b.type==='barracks')) return 'Нужны Казармы.'; addTroops(h, 'infantry', 5); return 'ok'; },
        'archer': (h) => { if (!h.buildings.some(b=>b.type==='barracks')) return 'Нужны Казармы.'; addTroops(h, 'archer', 5); return 'ok'; },
        'cavalry': (h) => { if (!h.buildings.some(b=>b.type==='barracks')) return 'Нужны Казармы.'; addTroops(h, 'cavalry', 3); return 'ok'; },
        'knights': (h) => { if (!h.buildings.some(b=>b.type==='barracks' && b.lvl===2)) return 'Нужны Казармы Lv2.'; addTroops(h, 'cavalry', 2); return 'ok'; },
        'lord': (h) => { if (!h.buildings.some(b=>b.type==='dark_temple')) return 'Нужен Храм Тьмы.'; if (game.player.gold<10) return 'Нужно 10 золота.'; game.player.gold-=10; game.player.lords.push({name: LORD_NAMES[game.player.lords.length % LORD_NAMES.length], battles:0}); log(`Лорд "${LORD_NAMES[game.player.lords.length-1]}" примкнул!`,'player'); return 'ok'; },
        'soul_collector': (h) => { if (!game.player.hasCitadel) return 'Постройте Цитадель.'; if (game.player.gold<25) return 'Нужно 25 золота.'; game.player.gold-=25; log('Сборщик душ нанят!','player'); return 'ok'; },
        'gargoyle': (h) => { if (!game.player.techs.militaryReform) return 'Нужна Военная реформа.'; if (game.player.gold<25) return 'Нужно 25 золота.'; game.player.gold-=25; addTroops(h, 'gargoyle', 3); return 'ok'; },
        'noble': (h) => { if (!game.player.techs.necromancy) return 'Нужна Некромантия.'; if (game.player.gold<40) return 'Нужно 40 золота.'; game.player.gold-=40; addTroops(h, 'noble', 1); return 'ok'; }
    };
    function addTroops(h, type, count) {
        if (game.player.mobileArmy.hexId === `${h.q},${h.r}`) game.player.mobileArmy[type] = (game.player.mobileArmy[type] || 0) + count;
        else h.playerGarrison[type] = (h.playerGarrison[type] || 0) + count;
        log(`+${count} ${type} призвано в ${h.name}.`, 'player');
    }
    recruitTypes.forEach(type => {
        const id = `recruit-${type}`;
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => {
                if (game.player.ap <= 0) return log('Нет очков действий.', 'system');
                if (!game.selectedHexId) return log('Выберите свой гекс на карте.', 'system');
                const h = game.hexGrid.find(x => `${x.q},${x.r}` === game.selectedHexId);
                if (!h || h.owner !== 'player') return log('Не ваша территория.', 'system');
                if (game.player.gold < recruitCosts[type]) return log('Не хватает золота.', 'system');
                const result = recruitFunc[type](h);
                if (result !== 'ok') return log(result, 'system');
                game.player.ap -= 1; updateUI();
            });
        }
    });

    // Гарнизон
    document.getElementById('btn-garrison-add').addEventListener('click', () => {
        if (game.player.ap <= 0) return log('Нет очков действий.', 'system');
        const h = game.hexGrid.find(x => `${x.q},${x.r}` === game.player.mobileArmy.hexId);
        if (!h || h.owner !== 'player' || getTotalTroops(game.player.mobileArmy) < 10) return log('Нет армии.', 'system');
        game.player.mobileArmy.infantry -= 10; h.playerGarrison.infantry += 10;
        log('10 бойцов оставлены в гарнизоне.', 'player');
        game.player.ap -= 1; updateUI();
    });
    document.getElementById('btn-garrison-take').addEventListener('click', () => {
        if (game.player.ap <= 0) return log('Нет очков действий.', 'system');
        const h = game.hexGrid.find(x => `${x.q},${x.r}` === game.player.mobileArmy.hexId);
        if (!h || h.owner !== 'player' || getTotalTroops(h.playerGarrison) < 10) return log('Нет гарнизона.', 'system');
        h.playerGarrison.infantry -= 10; game.player.mobileArmy.infantry += 10;
        log('10 бойцов призваны из гарнизона.', 'player');
        game.player.ap -= 1; updateUI();
    });

    // Сдача провинции
    document.getElementById('btn-exterminate').addEventListener('click', () => {
        const h = game.hexGrid.find(x => `${x.q},${x.r}` === game.player.mobileArmy.hexId);
        if (h) { game.player.gold += 150; game.player.blood += 80; game.humanity = Math.max(0, game.humanity - 20); log('Истребление!', 'player'); document.getElementById('surrender-modal').style.display = 'none'; updateUI(); }
    });
    document.getElementById('btn-enslave').addEventListener('click', () => {
        const h = game.hexGrid.find(x => `${x.q},${x.r}` === game.player.mobileArmy.hexId);
        if (h) { game.player.gold += 50; game.player.blood += 20; h.playerGarrison.infantry += 10; log('Порабощение!', 'player'); document.getElementById('surrender-modal').style.display = 'none'; updateUI(); }
    });
    document.getElementById('btn-convert').addEventListener('click', () => {
        const h = game.hexGrid.find(x => `${x.q},${x.r}` === game.player.mobileArmy.hexId);
        if (h) { h.playerGarrison.infantry += 10; game.humanity = Math.min(100, game.humanity + 10); log('Обращение!', 'player'); document.getElementById('surrender-modal').style.display = 'none'; updateUI(); }
    });
});
