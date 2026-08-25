// ================= РАСШИРЕННЫЙ ЛОР =================
const BUILD_LORE = { /* (без изменений, см. предыдущий ответ) */ };

// ================= ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ PIXI =================
let app = null, hexContainer = null, armyContainer = null;
let spritePlayer = null, spriteAI = null, spriteWerewolf = null;
let spriteLord = null, spriteAIGeneral = null, spriteWolfGeneral = null;

// ================= ВЕБ-АУДИО СИНТЕЗАТОР =================
const SoundEngine = { /* (без изменений) */ };

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

        // Цвет фона (чёрный с оттенками)
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

        // Левый клик – перемещение/атака
        g.on('click', () => handleHexClick(hex));

        // Правый клик – состав армии
        g.on('contextmenu', (e) => {
            e.data.originalEvent.preventDefault();
            showArmyComposition(hex);
        });

        // Наведение – тултип с поддержкой фракций
        g.on('mouseover', (e) => {
            g.tint = 0x8a2be2;
            const t = document.getElementById('tooltip');
            const o = hex.owner ? (hex.owner === 'player' ? 'Дракула' : (hex.owner === 'ai' ? 'Ватикан' : 'Оборотни')) : 'Ничейная';
            const terrMap = { plains: "Равнины", mountain: "Горы ⛰️", forest: "Густой Лес 🌲", swamp: "Гнилые Болота ☣️" };
            let supportText = '';
            if (hex.support) {
                supportText = `<br>🧛 Тьма: ${hex.support.player}% | ⛪ Ватикан: ${hex.support.ai}% | 🐺 Оборотни: ${hex.support.werewolf}%`;
            }
            t.innerHTML = `<b>${hex.name}</b> (${terrMap[hex.terrain]})<br>Владелец: ${o}<br>🛡️ Защита: ${getTotalTroops(hex.owner==='player'?hex.playerGarrison:(hex.owner==='ai'?hex.aiGarrison:0))}<br>🏰 Укрепы: ${hex.fortification}${supportText}`;
            t.style.display = 'block'; t.style.left = (e.data.originalEvent.clientX + 15) + 'px'; t.style.top = (e.data.originalEvent.clientY + 15) + 'px';
        });
        g.on('mouseout', () => { g.tint = 0xFFFFFF; document.getElementById('tooltip').style.display = 'none'; });

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

// ===== ПОКАЗАТЬ СОСТАВ АРМИИ (правый клик) =====
function showArmyComposition(hex) {
    let army = null;
    let ownerName = '';
    if (hex.owner === 'player') {
        if (hex.playerGarrison && getTotalTroops(hex.playerGarrison) > 0) army = hex.playerGarrison;
        else if (game.player.mobileArmy.hexId === `${hex.q},${hex.r}`) army = game.player.mobileArmy;
        ownerName = 'Дракула';
    } else if (hex.owner === 'ai') {
        if (hex.aiGarrison && getTotalTroops(hex.aiGarrison) > 0) army = hex.aiGarrison;
        else if (game.ai.mobileArmy.hexId === `${hex.q},${hex.r}`) army = game.ai.mobileArmy;
        ownerName = 'Ватикан';
    } else if (hex.owner === 'werewolf') {
        if (game.werewolf.mobileArmy.hexId === `${hex.q},${hex.r}`) army = game.werewolf.mobileArmy;
        ownerName = 'Оборотни';
    }
    if (!army) {
        log('В этом гексе нет армии.', 'system');
        return;
    }
    let text = `🧛 Состав армии ${ownerName}:\n`;
    text += `Пехота: ${army.infantry || 0}\n`;
    text += `Лучники: ${army.archer || 0}\n`;
    text += `Кавалерия: ${army.cavalry || 0}\n`;
    if (army.gargoyle !== undefined) text += `Гаргульи: ${army.gargoyle || 0}\n`;
    if (army.noble !== undefined) text += `Аристократы: ${army.noble || 0}\n`;
    alert(text); // временное решение, можно заменить на красивое модальное окно
}

function drawArmies() { /* (без изменений) */ }

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

    // Если клик по своему гексу – выбрать для стройки/призыва
    if (hex.owner === 'player') {
        game.selectedHexId = `${hex.q},${hex.r}`;
        log(`Выбрана ${hex.name} для стройки.`, 'system');
        updateUI();
        return;
    }

    const currentHexId = `${cH.q},${cH.r}`;
    const clickedHexId = `${hex.q},${hex.r}`;
    const neighbors = getNeighbors(Number(cH.q), Number(cH.r));
    const isNeighbor = neighbors.some(n => `${n.q},${n.r}` === clickedHexId);

    if (!isNeighbor) {
        log('Слишком далеко! Кликайте только по соседним гексам.', 'system');
        return;
    }

    // Пустой гекс – перемещение
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
        game.player.ap -= 1;
        updateUI();
        return;
    }

    // Вражеский гекс – только ночью
    if (hex.owner === 'ai' || hex.owner === 'werewolf') {
        if (!isNightTime()) {
            log('День! Нельзя атаковать. Дождитесь ночи.', 'player');
            return;
        }
        if (getTotalTroops(game.player.mobileArmy) === 0) {
            log('Нет войск для атаки.', 'system');
            return;
        }
        game.pendingActionHexId = clickedHexId;
        document.getElementById('action-desc').textContent = `Ваша армия вошла в «${hex.name}». Выберите действие.`;
        document.getElementById('action-modal').style.display = 'flex';
    }
}

// === БОЕВЫЕ ДЕЙСТВИЯ ===
function executeCurse(targetHex) { /* (без изменений) */ }
function executeBribe(targetHex) { /* (без изменений) */ }
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
        targetHex.owner = 'player';
        targetHex.siegeBy = null;
        targetHex.aiGarrison = { infantry:0, archer:0, cavalry:0, gargoyle:0, noble:0 };
        game.player.mobileArmy.hexId = `${targetHex.q},${targetHex.r}`;
        if (nobleCount > 0) {
            let gain = nobleCount * 2;
            game.humanity = Math.min(100, game.humanity + gain);
            log(`Аристократы вдохновили войско, +${gain} Человечности.`, 'player');
        }
        // Открываем окно выбора судьбы провинции
        document.getElementById('surrender-modal').style.display = 'flex';
    } else {
        log(`Штурм отбит!`, 'system');
        const fb = game.hexGrid.find(h => h.owner === 'player');
        if (fb) game.player.mobileArmy.hexId = `${fb.q},${fb.r}`;
    }
    game.battleActive = false;
    updateUI();
}

// ===== ОБРАБОТЧИКИ ДЛЯ SURRENDER (влияние на доверие) =====
document.getElementById('btn-exterminate').addEventListener('click', () => {
    const h = game.hexGrid.find(x => `${x.q},${x.r}` === game.player.mobileArmy.hexId);
    if (h) {
        game.player.gold += 150;
        game.player.blood += 80;
        game.humanity = Math.max(0, game.humanity - 20);
        game.cassaldiaTrust = Math.max(0, game.cassaldiaTrust - 10);
        log('Истребление! Ресурсы добыты, но Кассальдия в ужасе.', 'player');
        document.getElementById('surrender-modal').style.display = 'none';
        updateUI();
    }
});
document.getElementById('btn-enslave').addEventListener('click', () => {
    const h = game.hexGrid.find(x => `${x.q},${x.r}` === game.player.mobileArmy.hexId);
    if (h) {
        game.player.gold += 50;
        game.player.blood += 20;
        h.playerGarrison.infantry += 10;
        // без изменения доверия
        log('Порабощение! Гарнизон пополнен.', 'player');
        document.getElementById('surrender-modal').style.display = 'none';
        updateUI();
    }
});
document.getElementById('btn-convert').addEventListener('click', () => {
    const h = game.hexGrid.find(x => `${x.q},${x.r}` === game.player.mobileArmy.hexId);
    if (h) {
        h.playerGarrison.infantry += 10;
        game.humanity = Math.min(100, game.humanity + 10);
        game.cassaldiaTrust = Math.min(100, game.cassaldiaTrust + 10);
        log('Обращение! Новые слуги тьмы, Кассальдия довольна.', 'player');
        document.getElementById('surrender-modal').style.display = 'none';
        updateUI();
    }
});

// ... остальные функции (collectIncome, triggerRandomEvent, aiTurn, endPlayerTurn, attachLoreListeners, startTypeWriter, startGameMap, initGame) остаются без изменений, они уже были рабочие.

// ================= ИНИЦИАЛИЗАЦИЯ И ОБРАБОТЧИКИ =================
document.addEventListener('DOMContentLoaded', async () => {
    await loadSprites();
    initPixi();

    // ... (все обработчики, что были, включая кнопки дипломатии, рынка, технологий, построек, призыва и т.д.)
    // Они уже есть в предыдущем полном коде, поэтому не дублирую для краткости.
    // Главное, что мы добавили:
    // - отображение поддержки в тултипе
    // - правый клик для состава армии
    // - влияние на доверие при выборе судьбы провинции
    // - уменьшенные кнопки в логе
    // - проверку ночного времени для атаки

    // Убедитесь, что все обработчики из предыдущего ответа сохранены.
    // Я приведу только изменения, но в финальном коде они должны быть интегрированы.
});
