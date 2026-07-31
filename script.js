// ================= БАЗА ЛОРА ДЛЯ КНОПОК =================
const BUILD_LORE = {
    'build': "СТРОИТЬ: Возводите тёмные сооружения, усиливающие вашу мощь.",
    'recruit': "ПРИЗВАТЬ: Найдите подходящих солдат и слуг для своей армии.",
    'assault': "ШТУРМ: Атакуйте осажденную вражескую провинцию (Ночью).",
    'cancelsiege': "СНЯТЬ ОСАДУ: Снимите осаду с текущей вражеской провинции.",
    'endturn': "СЛЕД. ХОД: Завершите текущий ход и перейдите к следующему (Ночь/День).",
    'newgame': "НОВАЯ ИГРА: Начать новое завоевание.",
    'save': "СОХРАНИТЬ: Сохранить текущую партию (Локально).",
    'load': "ЗАГРУЗИТЬ: Загрузить сохраненную партию.",
    'menu': "МЕНЮ: Перезапустить и вернуться в главное меню.",
    'music': "МУЗЫКА: Включить/Выключить саундтрек.",
    'clearlog': "ОЧИСТИТЬ: Стереть все записи в Хрониках Тьмы.",
    'cemetery': "Кладбище: Дарует +5 крови за ход.",
    'barracks': "Казармы Lv1: Без них обычные войска не могут быть призваны.",
    'ritual': "Храм Тьмы: Открывает найм Верховных Лордов.",
    'wall': "Стены: +1 к укреплениям провинции.",
    'castle': "Замок: +2 укрепления, +20 гарнизона.",
    'citadel': "Цитадель: Дарует право нанимать Сборщиков душ.",
    'infantry': "Пехота: Основа любой армии. Надёжные щиты.",
    'archer': "Лучники: Меткие стрелки, сеющие хаос на расстоянии.",
    'cavalry': "Кавалерия: Быстрые и маневренные всадники.",
    'lord': "Верховный Лорд: Бессмертный генерал. +10% к атаке за каждого нанятого.",
    'siege': "ОСАДИТЬ: Окружить провинцию. Позволит штурмовать на следующем ходу.",
    'assault_now': "АТАКОВАТЬ: Немедленно штурмовать провинцию."
};

// ================= ИНИЦИАЛИЗАЦИЯ PIXIJS =================
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
const app = new PIXI.Application({
    width: 690, height: 490,
    backgroundColor: 0x0a0a0e, transparent: false, resolution: window.devicePixelRatio || 1,
});
document.getElementById('pixi-container').appendChild(app.view);

const hexContainer = new PIXI.Container();
app.stage.addChild(hexContainer);
const armyContainer = new PIXI.Container();
app.stage.addChild(armyContainer);

// ================= ЗАГРУЗКА СПРАЙТОВ (С ФОЛЛБЭКОМ) =================
let spritePlayer = null, spriteAI = null, spriteWerewolf = null;
async function loadSprites() {
    try {
        // Если картинки лежат в папке assets - загрузятся. Если нет - не упадут.
        spritePlayer = await PIXI.Assets.load('./assets/Vampire Army.png').catch(()=>null);
        spriteAI = await PIXI.Assets.load('./assets/Knight Vatican.jpg').catch(()=>null);
        spriteWerewolf = await PIXI.Assets.load('./assets/Werewolf Army.webp').catch(()=>null);
        if(!spritePlayer) console.warn('Иконка армии Дракулы не найдена. Будет отрисован текстовый маркер.');
    } catch (e) {}
}
loadSprites();

// ================= ДАННЫЕ ИГРЫ =================
const LORD_NAMES = ["Граф Дракулос", "Леди Сильвана", "Барон Ноктюрн", "Принц Теней", "Леди Вэйн"];

const HEX_SIZE = 38;
function getHexCorners(cx, cy) {
    const corners = [];
    for (let i = 0; i < 6; i++) {
        const angle = (60 * i - 30) * Math.PI / 180;
        corners.push(cx + HEX_SIZE * Math.cos(angle), cy + HEX_SIZE * Math.sin(angle));
    }
    return corners;
}

function hexToPixel(q, r) {
    const x = HEX_SIZE * (Math.sqrt(3) * q + Math.sqrt(3)/2 * r);
    const y = HEX_SIZE * (3/2 * r);
    return { x: x + 300, y: y + 200 };
}
function getNeighbors(q, r) {
    const dirs = [[1,0],[-1,0],[0,1],[0,-1],[1,-1],[-1,1]];
    return dirs.map(d => ({ q: q + d[0], r: r + d[1] }));
}

function getDefaultGame() {
    return {
        turn: 1, day: 1, gameOver: false, battleActive: false, surrenderActive: false,
        selectedHexId: null, pendingActionHexId: null,
        player: {
            ap: 2, maxAp: 2, gold: 100, blood: 10, lords: [],
            mobileArmy: { infantry: 50, archer: 10, cavalry: 10, hexId: '0,0' },
            hasCitadel: false
        },
        ai: { gold: 100, mobileArmy: { infantry: 50, archer: 10, cavalry: 10, hexId: '2,-1' } },
        werewolf: { gold: 50, mobileArmy: { infantry: 30, archer: 5, cavalry: 10, hexId: '0,1' } },
        hexGrid: []
    };
}

let game = getDefaultGame();

function initHexGrid() {
    const grid = [];
    const mapData = [
        { q: 0, r: 0, name: 'Transilvania', owner: 'player', fort: 1, pop: 2000 },
        { q: 1, r: 0, name: 'Wallachia', owner: 'player', fort: 0, pop: 1500 },
        { q: -1, r: 0, name: 'Moldavia', owner: 'player', fort: 0, pop: 1500 },
        { q: 0, r: 1, name: 'Carpathia', owner: 'werewolf', fort: 0, pop: 2500 },
        { q: 2, r: -1, name: 'Vaticanum', owner: 'ai', fort: 3, pop: 5000 },
        { q: 2, r: 0, name: 'Roma', owner: 'ai', fort: 2, pop: 4000 },
        { q: 3, r: -1, name: 'Florentia', owner: 'ai', fort: 1, pop: 3000 },
        { q: -2, r: 0, name: 'Dacia', owner: 'werewolf', fort: 0, pop: 2000 },
        { q: 1, r: 1, name: 'Moesia', owner: 'werewolf', fort: 0, pop: 1500 },
        { q: 3, r: 0, name: 'Ruins', owner: null, res: { gold: 10, blood: 0 }, fort: 0, pop: 0 },
        { q: -3, r: 1, name: 'Silver Mines', owner: null, res: { gold: 15, blood: 0 }, fort: 0, pop: 0 },
        { q: -2, r: 2, name: 'Blood Marshes', owner: null, res: { gold: 0, blood: 20 }, fort: 0, pop: 0 },
    ];
    mapData.forEach(d => {
        const pos = hexToPixel(d.q, d.r);
        grid.push({
            q: d.q, r: d.r, x: pos.x, y: pos.y, name: d.name, owner: d.owner, resources: d.res || { gold: 0, blood: 0 },
            fortification: d.fort || 0, population: d.pop || 0,
            playerGarrison: { infantry: d.owner === 'player' ? 20 : 0, archer: 0, cavalry: 0 },
            aiGarrison: { infantry: d.owner === 'ai' ? 20 : 0, archer: 0, cavalry: 0 },
            buildings: [], siegeBy: null
        });
    });
    return grid;
}

// ================= ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =================
function getTotalTroops(army) { return (army?.infantry || 0) + (army?.archer || 0) + (army?.cavalry || 0); }
function isNightTime() { return game.turn % 2 !== 0; }
function log(msg, type = 'system') {
    const c = document.getElementById('log-container');
    if (!c) return;
    const e = document.createElement('div');
    e.className = `log-entry ${type}`;
    e.textContent = msg;
    c.appendChild(e); c.scrollTop = c.scrollHeight;
}
function getLordBonus() {
    let bonus = 0;
    game.player.lords.forEach(l => {
        if (l.battles >= 2 && l.battles < 5) bonus += 0.1;
        else if (l.battles >= 5) bonus += 0.2;
    });
    return bonus;
}
function saveGame() { localStorage.setItem('DraculaHexFinal', JSON.stringify(game)); }
function loadGame() {
    const saved = localStorage.getItem('DraculaHexFinal');
    if (saved) { game = JSON.parse(saved); return true; }
    return false;
}
function checkGameConditions() {
    if (game.gameOver) return;
    const pCount = game.hexGrid.filter(h => h.owner === 'player').length;
    if (pCount === 0) gameOver('ai');
    else if (game.hexGrid.filter(h => h.owner === 'ai').length === 0 && game.hexGrid.filter(h => h.owner === 'werewolf').length === 0) gameOver('player');
}
function gameOver(winner) {
    if (game.gameOver) return;
    game.gameOver = true;
    document.getElementById('btn-end-turn').disabled = true;
    document.getElementById('btn-assault').disabled = true;
    document.getElementById('gameover-title').textContent = winner === 'player' ? 'ДРАКУЛА ВОЦАРИЛСЯ!' : 'ТЬМА ОТСТУПИЛА!';
    document.getElementById('gameover-desc').textContent = winner === 'player' ? 'Европа навсегда погрузилась в вечную ночь.' : 'Враги оказались слишком сильны.';
    document.getElementById('gameover-modal').style.display = 'flex';
}

// ================= ОТРИСОВКА ГЕКСОВ, ТЕКСТА И АРМИЙ =================
function drawHexes() {
    hexContainer.removeChildren();
    game.hexGrid.forEach(hex => {
        const container = new PIXI.Container();
        container.x = hex.x;
        container.y = hex.y;

        const g = new PIXI.Graphics();
        // ИСПРАВЛЕНИЕ: drawPolygon работает во всех версиях PixiJS
        g.drawPolygon(...getHexCorners(0, 0)); 
        
        let color = 0x222222;
        if (hex.owner === 'player') color = 0x7a1111;
        else if (hex.owner === 'ai') color = 0xe0e0c0;
        else if (hex.owner === 'werewolf') color = 0x2d4a2d;
        g.fill(color);
        g.stroke({ width: 2, color: 0x333333, alpha: 0.7 });
        g.closePath();

        g.interactive = true; 
        g.cursor = 'pointer'; 
        g.hexData = hex;
        g.on('mouseover', (e) => {
            g.tint = 0x88aadd;
            const t = document.getElementById('tooltip');
            const o = hex.owner ? (hex.owner === 'player' ? 'Дракула' : (hex.owner === 'ai' ? 'Ватикан' : 'Оборотни')) : 'Ничейная';
            let r = '';
            if (hex.owner === null) r = `<br>⚔️ Добыча: 🪙${hex.resources.gold} | 🩸${hex.resources.blood}`;
            t.innerHTML = `<b>${hex.name}</b><br>Владелец: ${o}<br>🛡️ Гарн: ${getTotalTroops(hex.owner === 'player' ? hex.playerGarrison : hex.aiGarrison)}<br>🏰 Укр: ${hex.fortification}${r}`;
            t.style.display = 'block';
            t.style.left = (e.data.originalEvent.clientX + 20) + 'px';
            t.style.top = (e.data.originalEvent.clientY + 20) + 'px';
        });
        g.on('mouseout', () => { g.tint = 0xFFFFFF; document.getElementById('tooltip').style.display = 'none'; });
        g.on('click', () => handleHexClick(hex));

        const nT = new PIXI.Text(hex.name, { fontFamily: 'Cinzel', fontSize: 9, fill: 0xffffff, align: 'center', dropShadow: true, dropShadowColor: 0x000000 });
        nT.anchor.set(0.5);
        nT.x = 0; nT.y = -12;

        container.addChild(g);
        container.addChild(nT);
        hexContainer.addChild(container);
    });
}

function drawArmies() {
    armyContainer.removeChildren();
    const pPos = game.hexGrid.find(h => `${h.q},${h.r}` === game.player.mobileArmy.hexId);
    const aPos = game.hexGrid.find(h => `${h.q},${h.r}` === game.ai.mobileArmy.hexId);
    const wPos = game.hexGrid.find(h => `${h.q},${h.r}` === game.werewolf.mobileArmy.hexId);

    // Фоллбэк: Если картинка загружена - показываем её. Если нет - рисуем цветной кружок с числом войск.
    function renderFallback(x, y, count, color) {
        const c = new PIXI.Graphics();
        c.beginFill(color);
        c.drawCircle(0, 0, 15);
        c.endFill();
        const t = new PIXI.Text(`${count}`, { fontFamily: 'Cinzel', fontSize: 10, fill: 0xffffff });
        t.anchor.set(0.5);
        c.addChild(t);
        c.x = x; c.y = y;
        armyContainer.addChild(c);
    }

    if (pPos) {
        if (spritePlayer) { const s = new PIXI.Sprite(spritePlayer); s.anchor.set(0.5); s.scale.set(0.1); s.x = pPos.x; s.y = pPos.y; armyContainer.addChild(s); }
        else renderFallback(pPos.x, pPos.y, getTotalTroops(game.player.mobileArmy), 0x7a1111);
    }
    if (aPos) {
        if (spriteAI) { const s = new PIXI.Sprite(spriteAI); s.anchor.set(0.5); s.scale.set(0.12); s.x = aPos.x; s.y = aPos.y; armyContainer.addChild(s); }
        else renderFallback(aPos.x, aPos.y, getTotalTroops(game.ai.mobileArmy), 0xe0e0c0);
    }
    if (wPos) {
        if (spriteWerewolf) { const s = new PIXI.Sprite(spriteWerewolf); s.anchor.set(0.5); s.scale.set(0.1); s.x = wPos.x; s.y = wPos.y; armyContainer.addChild(s); }
        else renderFallback(wPos.x, wPos.y, getTotalTroops(game.werewolf.mobileArmy), 0x2d4a2d);
    }
}

function updateUI() {
    document.getElementById('turn-counter').textContent = game.turn;
    document.getElementById('day-counter').textContent = game.day;
    document.getElementById('ap-counter').textContent = `${game.player.ap}/${game.player.maxAp}`;
    document.getElementById('blood-counter').textContent = game.player.blood;
    document.getElementById('gold-counter').textContent = game.player.gold;
    
    const cH = game.hexGrid.find(h => `${h.q},${h.r}` === game.player.mobileArmy.hexId);
    const isReadyToAssault = (cH && cH.siegeBy === 'player' && game.player.ap > 0 && isNightTime() && !game.gameOver);
    document.getElementById('btn-assault').disabled = !isReadyToAssault;
    
    drawHexes(); drawArmies();
}

// ================= ИГРОВАЯ ЛОГИКА =================
function handleHexClick(hex) {
    if (game.gameOver || game.player.ap <= 0) return log('Нет очков действий.', 'system');
    const cH = game.hexGrid.find(h => `${h.q},${h.r}` === game.player.mobileArmy.hexId);
    if (!cH) return;
    if (!getNeighbors(cH.q, cH.r).some(n => n.q === hex.q && n.r === hex.r)) return log('Слишком далеко! Только соседи.', 'system');

    if (hex.owner === 'player') {
        game.selectedHexId = `${hex.q},${hex.r}`;
        log(`Выбрана ${hex.name} для стройки.`, 'system'); updateUI(); return;
    }
    if (hex.owner === null) {
        game.player.mobileArmy.hexId = `${hex.q},${hex.r}`;
        if (getTotalTroops(game.player.mobileArmy) > 0) { hex.owner = 'player'; hex.playerGarrison.infantry += 5; log(`${hex.name} захвачена!`, 'player'); } 
        else log(`Армия переместилась в ${hex.name}.`, 'player');
        game.player.ap -= 1; updateUI(); return;
    }
    if (hex.owner === 'ai' || hex.owner === 'werewolf') {
        if (!isNightTime()) return log('День! Нельзя атаковать.', 'player');
        if (getTotalTroops(game.player.mobileArmy) === 0) return log('Нет войск.', 'system');
        game.pendingActionHexId = `${hex.q},${hex.r}`;
        document.getElementById('action-desc').textContent = `Ваша армия вошла в «${hex.name}».`;
        document.getElementById('action-modal').style.display = 'flex';
    }
}

function executeBattle(targetHex) {
    if (game.battleActive) return; game.battleActive = true;
    let attArmy = game.player.mobileArmy;
    let defGar = targetHex.owner === 'player' ? targetHex.playerGarrison : targetHex.aiGarrison;
    let totalAtt = getTotalTroops(attArmy);
    let totalDef = getTotalTroops(defGar) + targetHex.fortification * 5;
    if (totalAtt === 0) { game.battleActive = false; return log('Армия пуста.', 'system'); }

    let attLoss = Math.floor(Math.random() * 0.2 * totalAtt * (1 + getLordBonus()));
    let defLoss = Math.floor(Math.random() * 0.2 * totalDef);
    if (attLoss > totalAtt) attLoss = totalAtt - 1;
    if (defLoss > totalDef) defLoss = totalDef - 1;

    const types = ['infantry', 'archer', 'cavalry'];
    types.forEach(t => {
        if (attArmy[t] > 0) attArmy[t] = Math.max(0, attArmy[t] - Math.floor(attLoss * (attArmy[t] / (totalAtt + 1))));
        if (defGar[t] > 0) defGar[t] = Math.max(0, defGar[t] - Math.floor(defLoss * (defGar[t] / (totalDef + 1))));
    });

    log(`Бой за ${targetHex.name}! Потери: Вы ${attLoss}, Враг ${defLoss}.`, 'system');

    if (getTotalTroops(defGar) <= 0) {
        log(`Провинция ${targetHex.name} захвачена!`, 'player');
        targetHex.owner = 'player'; targetHex.siegeBy = null; targetHex.aiGarrison = {};
        game.player.mobileArmy.hexId = `${targetHex.q},${targetHex.r}`;
        document.getElementById('surrender-modal').style.display = 'flex';
    } else {
        log(`Штурм отбит!`, 'system');
        const fb = game.hexGrid.find(h => h.owner === 'player');
        if (fb) game.player.mobileArmy.hexId = `${fb.q},${fb.r}`;
    }
    game.battleActive = false; updateUI();
}

// ================= ЭКОНОМИКА И ХОД =================
function collectIncome() {
    game.hexGrid.forEach(h => {
        if (h.owner === 'player') {
            game.player.gold += 2 + (h.resources?.gold || 0);
            game.player.blood += 1 + (h.resources?.blood || 0);
        } else if (h.owner === 'ai') game.ai.gold += 2;
        else if (h.owner === 'werewolf') game.werewolf.gold += 3;
    });
}

function aiTurn() {
    const aH = game.hexGrid.find(h => `${h.q},${h.r}` === game.ai.mobileArmy.hexId);
    if (game.ai.gold > 10 && aH && aH.owner === 'ai') {
        game.ai.mobileArmy.infantry += 5; game.ai.gold -= 10;
        log('Ватикан пополнил армию.', 'ai');
    }
    const enemy = game.hexGrid.find(h => getNeighbors(aH.q, aH.r).some(n => n.q === h.q && n.r === h.r) && h.owner === 'player');
    if (enemy && getTotalTroops(game.ai.mobileArmy) > 30) {
        enemy.owner = 'ai';
        enemy.playerGarrison = { infantry:0, archer:0, cavalry:0 };
        enemy.aiGarrison = { infantry: 10, archer: 0, cavalry: 0 };
        game.ai.mobileArmy.hexId = `${enemy.q},${enemy.r}`;
        log('Ватикан отвоевал вашу территорию!', 'ai');
    }
}

function endPlayerTurn() {
    if (game.gameOver || game.battleActive) return;
    collectIncome();
    game.player.ap = game.player.maxAp;
    game.turn++;
    if (game.turn % 2 === 1) game.day++;
    log(`ХОД ${game.turn}. ${isNightTime() ? '🌙 НОЧЬ' : '☀️ ДЕНЬ'}.`, 'system');
    aiTurn();
    checkGameConditions();
    saveGame(); updateUI();
}

// ================= СИСТЕМА ЛОРА (ЭНЦИКЛОПЕДИЯ НА ВСЕ КНОПКИ) =================
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

// ================= ИНИЦИАЛИЗАЦИЯ =================
function initGame() {
    document.getElementById('start-menu').style.display = 'none';
    document.getElementById('game-container').style.display = 'flex';
    if (!loadGame()) {
        game = getDefaultGame(); 
        game.hexGrid = initHexGrid();
        game.player.lords.push({ name: LORD_NAMES[0], battles: 0 });
    }
    document.getElementById('btn-end-turn').disabled = false;
    attachLoreListeners(); // Привязываем ЛОР к кнопкам после прогрузки
    updateUI(); log('Дракула пробудился! Завоюйте Европу.', 'system');
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadSprites();
    document.getElementById('start-menu').style.display = 'flex';
    document.getElementById('game-container').style.display = 'none';

    document.getElementById('btn-new-game').addEventListener('click', () => { localStorage.removeItem('DraculaHexFinal'); game = getDefaultGame(); game.hexGrid = initHexGrid(); initGame(); });
    document.getElementById('btn-load-game').addEventListener('click', initGame);
    document.getElementById('btn-mnu-save').addEventListener('click', saveGame);
    document.getElementById('btn-mnu-load').addEventListener('click', initGame);
    document.getElementById('btn-end-turn').addEventListener('click', endPlayerTurn);

    document.getElementById('btn-mnu-restart').addEventListener('click', () => {
        if(confirm('Выйти в главное меню? Прогресс этого хода будет потерян.')) {
            document.getElementById('start-menu').style.display = 'flex';
            document.getElementById('game-container').style.display = 'none';
            game.gameOver = false;
            document.getElementById('gameover-modal').style.display = 'none';
        }
    });
    document.getElementById('btn-music-toggle').addEventListener('click', () => {
        const bgm = document.getElementById('bgm');
        if (bgm.paused) { bgm.volume = 0.4; bgm.play().catch(()=>{}); document.getElementById('btn-music-toggle').textContent = "🔊"; } 
        else { bgm.pause(); document.getElementById('btn-music-toggle').textContent = "🔇"; }
    });

    // Строительство
    const builds = { 'build-cemetery': 'cemetery', 'build-barracks': 'barracks', 'build-ritual': 'dark_temple', 'build-wall': 'wall', 'build-castle': 'castle', 'build-citadel': 'citadel' };
    Object.keys(builds).forEach(id => {
        document.getElementById(id).addEventListener('click', () => {
            if (game.player.ap <= 0) return log('Нет очков действий.', 'system');
            if (!game.selectedHexId) return log('Кликните по своему гексу на карте, чтобы выбрать его.', 'system');
            const h = game.hexGrid.find(x => `${x.q},${x.r}` === game.selectedHexId);
            if (!h || h.owner !== 'player') return log('Не ваша территория.', 'system');
            const costs = { 'cemetery': 30, 'barracks': 20, 'dark_temple': 20, 'wall': 10, 'castle': 40, 'citadel': 40 };
            if (game.player.gold < costs[builds[id]]) return log('Не хватает золота.', 'system');
            if (h.buildings.find(b => b.type === builds[id])) return log('Уже построено.', 'system');
            game.player.gold -= costs[builds[id]]; h.buildings.push({ type: builds[id], lvl: 1 });
            if (builds[id] === 'wall') h.fortification += 1;
            else if (builds[id] === 'castle') { h.fortification += 2; h.playerGarrison.infantry += 20; }
            else if (builds[id] === 'citadel') game.player.hasCitadel = true;
            log(`Построено: ${builds[id]} в ${h.name}.`, 'player');
            game.player.ap -= 1; updateUI();
        });
    });

    // Найм
    const recruits = { 'recruit-inf': 'infantry', 'recruit-arch': 'archer', 'recruit-cav': 'cavalry', 'recruit-lord': 'lord' };
    Object.keys(recruits).forEach(id => {
        document.getElementById(id).addEventListener('click', () => {
            if (game.player.ap <= 0) return log('Нет очков действий.', 'system');
            if (!game.selectedHexId) return log('Кликните по своему гексу на карте, чтобы выбрать его.', 'system');
            const h = game.hexGrid.find(x => `${x.q},${x.r}` === game.selectedHexId);
            if (!h || h.owner !== 'player') return log('Не ваша территория.', 'system');

            if (recruits[id] === 'lord') {
                if (!h.buildings.find(b => b.type === 'dark_temple')) return log('Нужен Храм Тьмы.', 'system');
                if (game.player.gold < 10) return log('Нужно 10 золота.', 'system');
                game.player.gold -= 10;
                game.player.lords.push({ name: LORD_NAMES[game.player.lords.length % LORD_NAMES.length], battles: 0 });
                log(`Лорд "${LORD_NAMES[game.player.lords.length - 1]}" примкнул к армии!`, 'player');
                game.player.ap -= 1; updateUI(); return;
            }
            const costs = { 'infantry': 10, 'archer': 15, 'cavalry': 20 };
            if (game.player.gold < costs[recruits[id]]) return log('Не хватает золота.', 'system');
            if (!h.buildings.find(b => b.type === 'barracks')) return log('Нужны Казармы.', 'system');
            game.player.gold -= costs[recruits[id]];
            const cnt = { 'infantry': 5, 'archer': 5, 'cavalry': 3 };
            if (game.player.mobileArmy.hexId === `${h.q},${h.r}`) game.player.mobileArmy[recruits[id]] += cnt[recruits[id]];
            else h.playerGarrison[recruits[id]] += cnt[recruits[id]];
            log(`+${cnt[recruits[id]]} нанято в ${h.name}.`, 'player');
            game.player.ap -= 1; updateUI();
        });
    });

    // Осады и битвы
    document.getElementById('btn-siege').addEventListener('click', () => {
        if (!game.pendingActionHexId || game.player.ap <= 0) return;
        const h = game.hexGrid.find(x => `${x.q},${x.r}` === game.pendingActionHexId);
        h.siegeBy = 'player'; game.player.mobileArmy.hexId = `${h.q},${h.r}`;
        game.player.ap -= 1; log(`${h.name} взята в осаду!`, 'player');
        document.getElementById('action-modal').style.display = 'none'; updateUI();
    });
    document.getElementById('btn-assault-now').addEventListener('click', () => {
        if (!game.pendingActionHexId) return;
        const h = game.hexGrid.find(x => `${x.q},${x.r}` === game.pendingActionHexId);
        game.player.mobileArmy.hexId = `${h.q},${h.r}`;
        game.player.ap -= 1; document.getElementById('action-modal').style.display = 'none';
        executeBattle(h);
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

    document.getElementById('btn-exterminate').addEventListener('click', () => {
        const h = game.hexGrid.find(x => `${x.q},${x.r}` === game.player.mobileArmy.hexId);
        if (h) { game.player.gold += 150; game.player.blood += 80; log('Истребление! Ресурсы добыты.', 'player'); document.getElementById('surrender-modal').style.display = 'none'; updateUI(); }
    });
    document.getElementById('btn-enslave').addEventListener('click', () => {
        const h = game.hexGrid.find(x => `${x.q},${x.r}` === game.player.mobileArmy.hexId);
        if (h) { game.player.gold += 50; game.player.blood += 20; h.playerGarrison.infantry += 10; log('Порабощение! Гарнизон пополнен.', 'player'); document.getElementById('surrender-modal').style.display = 'none'; updateUI(); }
    });
    document.getElementById('btn-convert').addEventListener('click', () => {
        const h = game.hexGrid.find(x => `${x.q},${x.r}` === game.player.mobileArmy.hexId);
        if (h) { h.playerGarrison.infantry += 10; log('Обращение! Новые слуги тьмы.', 'player'); document.getElementById('surrender-modal').style.display = 'none'; updateUI(); }
    });
});
