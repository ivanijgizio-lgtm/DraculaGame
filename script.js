// ================= РАСШИРЕННЫЙ ЛОР =================
const BUILD_LORE = {
    'build': "СТРОИТЬ: Возводите тёмные сооружения, чтобы укрепить свою власть в захваченных землях. Каждое здание тратит 1 Очко Действия (AP) и требует золота. Стройте Казармы, чтобы пополнять армию, и Храмы, чтобы призывать Лордов. Возводите Стены и Замки для защиты провинций от вражеских вторжений.",
    'recruit': "ПРИЗВАТЬ: Найдите подходящих солдат и слуг среди покорённого населения. Каждый призыв тратит 1 AP и требует золота, а также наличия необходимых зданий. Базовые подразделения набираются в провинциях с Казармами Lv1. Элитные бойцы, вроде Рыцарей Тьмы, требуют более продвинутых построек.",
    'garrison': "ГАРНИЗОН: Управляйте распределением войск между вашей мобильной армией и гарнизоном. Оставленные в гарнизоне бойцы защищают территорию. Перемещение 10 бойцов стоит 1 AP.",
    'assault': "ШТУРМ: Атакуйте вражескую провинцию, находящуюся под вашей осадой. Штурм доступен исключительно в НОЧНОЕ время суток. Каждая атака стоит 1 AP.",
    'cancelsiege': "СНЯТЬ ОСАДУ: Откажитесь от осады текущей провинции. Снятие осады стоит 1 AP.",
    'endturn': "СЛЕД. ХОД: Завершите текущий ход, соберите доходы и передайте инициативу врагу. День/Ночь переключаются.",
    'factions': "ФРАКЦИИ: Изучите конфликтующие силы Европы.",
    'newgame': "НОВАЯ ИГРА: Начните новое завоевание.",
    'load': "ЗАГРУЗИТЬ: Загрузить сохранённую партию.",
    'menu': "МЕНЮ: Выйдите в главное меню.",
    'music': "ЗВУК: Включить/выключить саундтрек.",
    'clearlog': "ОЧИСТИТЬ: Стереть все записи в Хрониках Тьмы.",
    'cemetery': "Кладбище: Дарует +5 крови каждый ход.",
    'barracks': "Казармы Lv1: Открывает призыв обычных войск.",
    'barracks_lv2': "Казармы Lv2: Открывает призыв Рыцарей Тьмы.",
    'ritual': "Храм Тьмы: Открывает найм Верховных Лордов.",
    'dungeon': "Тюрьма: +10 поддержки Тьмы, -5 лояльности.",
    'executions': "Казни: +15 поддержки Тьмы, -10 лояльности.",
    'ball': "Бал Вампиров: +20 поддержки Тьмы, +5 лояльности.",
    'center': "Центр Обращения: +10 поддержки Тьмы, +5 лояльности, +100 населения.",
    'citadel': "Цитадель: Открывает найм Сборщиков душ.",
    'wall': "Стены: +1 к укреплениям.",
    'castle': "Замок: +2 укрепления, +20 гарнизона.",
    'market': "Рынок: Позволяет обменивать ресурсы.",
    'infantry': "5 Пехоты. Требуют Казарм Lv1.",
    'archer': "5 Лучников. Требуют Казарм Lv1.",
    'cavalry': "3 Кавалерии. Требуют Казарм Lv1.",
    'knights': "Рыцари Тьмы. Требуют Казармы Lv2.",
    'lord': "Призвать Лорда (+10% мощи). Требует Храм Тьмы.",
    'soul_collector': "Сборщик душ (50 золота/ход). Требует Цитадель.",
    'diplomacy': "ДИПЛОМАТИЯ: Заключайте перемирия или союзы.",
    'market': "РЫНОК: Обменивайте ресурсы 1 раз за ход.",
    'tech': "ТЕХНОЛОГИИ: Изучайте технологии.",
    'garrison_add': "ОСТАВИТЬ: Переместить 10 пехотинцев в гарнизон.",
    'garrison_take': "ПРИЗВАТЬ: Призвать 10 пехотинцев из гарнизона."
};

// ================= ИНИЦИАЛИЗАЦИЯ PIXIJS =================
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
const app = new PIXI.Application({
    width: 1100, height: 650, 
    backgroundColor: 0x0a0a0e, transparent: false, resolution: window.devicePixelRatio || 1,
});

const pixiContainer = document.getElementById('pixi-container');
pixiContainer.appendChild(app.view);

// Функция подстройки размера
function resizeMap() {
    const mapArea = document.getElementById('map-area');
    if (mapArea) {
        const rect = mapArea.getBoundingClientRect();
        app.renderer.resize(rect.width, rect.height);
    }
}
window.addEventListener('resize', resizeMap);

const hexContainer = new PIXI.Container();
app.stage.addChild(hexContainer);
const armyContainer = new PIXI.Container();
app.stage.addChild(armyContainer);

// ================= ЗАГРУЗКА СПРАЙТОВ =================
let spritePlayer = null, spriteAI = null, spriteWerewolf = null;
let spriteLord = null, spriteAIGeneral = null, spriteWolfGeneral = null;

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
loadSprites();

// ================= ДАННЫЕ ИГРЫ =================
const LORD_NAMES = ["Граф Дракулос", "Леди Сильвана", "Барон Ноктюрн", "Принц Теней", "Леди Вэйн"];
let HEX_SIZE = 50; // Будет пересчитано динамически в initHexGrid

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
    return { x, y };
}
function getNeighbors(q, r) {
    const dirs = [[1,0],[-1,0],[0,1],[0,-1],[1,-1],[-1,1]];
    // Явно приводим к числу для безопасности
    return dirs.map(d => ({ q: Number(q) + d[0], r: Number(r) + d[1] }));
}

function getDefaultGame() {
    return {
        turn: 1, day: 1, gameOver: false, battleActive: false, surrenderActive: false,
        selectedHexId: null, pendingActionHexId: null,
        player: {
            ap: 2, maxAp: 2, gold: 100, blood: 10, lords: [],
            mobileArmy: { infantry: 50, archer: 10, cavalry: 10, hexId: '0,0' },
            hasCitadel: false,
            allianceWithAI: false, truceTurnsAI: 0, truceTurnsWolf: 0,
            techs: { militaryReform: false, necromancy: false, tradeRoutes: false }
        },
        ai: { gold: 100, mobileArmy: { infantry: 50, archer: 10, cavalry: 10, hexId: '5,-3' } },
        werewolf: { gold: 50, mobileArmy: { infantry: 30, archer: 5, cavalry: 10, hexId: '-5,4' } },
        occultist: { gold: 0 },
        hexGrid: []
    };
}

let game = getDefaultGame();

function initHexGrid() {
    const grid = [];
    
    // Расширенные данные карты с пропорциональными фракциями и нейтральными ресурсами
    const mapData = [
        // Вампиры (Красные)
        { q: 0, r: 0, name: 'Transilvania', owner: 'player', fort: 1, pop: 2000 },
        { q: 1, r: 0, name: 'Wallachia', owner: 'player', fort: 0, pop: 1500 },
        { q: -1, r: 0, name: 'Moldavia', owner: 'player', fort: 0, pop: 1500 },
        { q: 0, r: -1, name: 'Pannonia', owner: 'player', fort: 0, pop: 1200 },
        { q: 2, r: -1, name: 'Tatra Peaks', owner: 'player', fort: 1, pop: 1000 },
        { q: -2, r: 0, name: 'Bukovina', owner: 'player', fort: 0, pop: 800 },
        { q: 1, r: -1, name: 'Bessarabia', owner: 'player', fort: 0, pop: 800 },
        
        // Ватикан (Бело-золотые)
        { q: 5, r: -3, name: 'Vaticanum', owner: 'ai', fort: 3, pop: 5000 },
        { q: 6, r: -3, name: 'Roma', owner: 'ai', fort: 2, pop: 4000 },
        { q: 6, r: -4, name: 'Florentia', owner: 'ai', fort: 1, pop: 3000 },
        { q: 7, r: -4, name: 'Parma', owner: 'ai', fort: 1, pop: 2500 },
        { q: 7, r: -3, name: 'Ancona', owner: 'ai', fort: 1, pop: 2000 },
        { q: 5, r: -4, name: 'Perugia', owner: 'ai', fort: 0, pop: 2000 },
        { q: 4, r: -3, name: 'Siena', owner: 'ai', fort: 0, pop: 1500 },
        { q: 6, r: -2, name: 'Ravenna', owner: 'ai', fort: 0, pop: 1500 },
        { q: 8, r: -3, name: 'Dalmatian Coast', owner: 'ai', fort: 0, pop: 1000 },
        { q: 8, r: -2, name: 'Zadar', owner: 'ai', fort: 0, pop: 1000 },
        { q: 4, r: -4, name: 'Orvieto', owner: 'ai', fort: 0, pop: 800 },

        // Оборотни (Зелёные)
        { q: -5, r: 4, name: 'Carpathia', owner: 'werewolf', fort: 0, pop: 2500 },
        { q: -4, r: 4, name: 'Dacia', owner: 'werewolf', fort: 0, pop: 2000 },
        { q: -3, r: 4, name: 'Moesia', owner: 'werewolf', fort: 0, pop: 1500 },
        { q: -4, r: 5, name: 'Iron Gate', owner: 'werewolf', fort: 0, pop: 1500 },
        { q: -3, r: 3, name: 'Crimson Peak', owner: 'werewolf', fort: 1, pop: 2000 },
        { q: -2, r: 3, name: 'Whispering Woods', owner: 'werewolf', fort: 0, pop: 1200 },
        { q: -6, r: 3, name: 'Ashen Steppes', owner: 'werewolf', fort: 0, pop: 1000 },
        { q: -6, r: 4, name: 'Misty Valley', owner: 'werewolf', fort: 0, pop: 1000 },
        { q: -2, r: 4, name: 'Amber Pass', owner: 'werewolf', fort: 0, pop: 1000 },
        { q: -5, r: 5, name: 'Mournful Plains', owner: 'werewolf', fort: 0, pop: 1000 },
        { q: -7, r: 3, name: 'Dark Woods', owner: 'werewolf', fort: 0, pop: 800 },

        // Оккультисты (Фиолетовые)
        { q: 3, r: 2, name: 'The Black Citadel', owner: 'occultist', fort: 2, pop: 1000 },
        { q: 4, r: 2, name: 'Temple of Old Ones', owner: 'occultist', fort: 1, pop: 800 },
        { q: 2, r: 3, name: 'Sunken Spire', owner: 'occultist', fort: 1, pop: 500 },
        { q: -2, r: -3, name: 'Obsidian Fortress', owner: 'occultist', fort: 2, pop: 800 },
        { q: -3, r: -2, name: 'The Pyre of Saints', owner: 'occultist', fort: 1, pop: 500 },
        { q: 4, r: 1, name: 'Veridia Forest', owner: 'occultist', fort: 0, pop: 400 },
        { q: 5, r: 2, name: 'Gilded Harbor', owner: 'occultist', fort: 0, pop: 400 },
        { q: -1, r: -4, name: 'Chasm of Echoes', owner: 'occultist', fort: 1, pop: 400 },
        { q: 2, r: 4, name: 'Lost Catacombs', owner: 'occultist', fort: 0, pop: 300 },

        // Нейтральные земли с ресурсами (При захвате дают бонус)
        { q: -2, r: -1, name: 'Silver Mines', owner: null, res: { gold: 15, blood: 0 }, fort: 0, pop: 0 },
        { q: -3, r: 2, name: 'Blood Marshes', owner: null, res: { gold: 0, blood: 20 }, fort: 0, pop: 0 },
        { q: 3, r: 1, name: 'Ruins', owner: null, res: { gold: 10, blood: 0 }, fort: 0, pop: 0 },
        { q: 4, r: 0, name: 'Moravian Corridor', owner: null, res: { gold: 10, blood: 5 }, fort: 0, pop: 0 },
        { q: -4, r: -2, name: 'Cursed Forge', owner: null, res: { gold: 5, blood: 10 }, fort: 0, pop: 0 },
        { q: -3, r: 0, name: 'Tattered Shore', owner: null, res: { gold: 10, blood: 5 }, fort: 0, pop: 0 },
        { q: 1, r: 2, name: 'Drowning Bog', owner: null, res: { gold: 0, blood: 15 }, fort: 0, pop: 0 },
        { q: -1, r: 2, name: 'Forgotten Tundra', owner: null, res: { gold: 5, blood: 5 }, fort: 0, pop: 0 },
        { q: 2, r: -2, name: 'Eternal Glen', owner: null, res: { gold: 10, blood: 0 }, fort: 0, pop: 0 },
        { q: -2, r: -2, name: 'Starfall Fields', owner: null, res: { gold: 15, blood: 5 }, fort: 0, pop: 0 },
        { q: 3, r: -2, name: 'Thornwood', owner: null, res: { gold: 5, blood: 0 }, fort: 0, pop: 0 },
        { q: 5, r: 0, name: 'Empty Lands', owner: null, res: { gold: 0, blood: 0 }, fort: 0, pop: 0 },
        { q: -5, r: -1, name: 'Bleak Expanse', owner: null, res: { gold: 0, blood: 0 }, fort: 0, pop: 0 },
        { q: -4, r: -1, name: 'Silent Depths', owner: null, res: { gold: 0, blood: 0 }, fort: 0, pop: 0 },
        { q: 3, r: -3, name: 'Lonely Plateau', owner: null, res: { gold: 0, blood: 0 }, fort: 0, pop: 0 },
    ];

    // 1. Сначала рассчитываем "сырые" координаты, используя временную константу (например 50) для покрытия
    const tempSize = 50;
    let rawPositions = mapData.map(d => {
        const pos = hexToPixelTemp(d.q, d.r, tempSize);
        return { ...d, rawX: pos.x, rawY: pos.y };
    });

    // 2. Находим границы (bounding box) с учетом размера гекса
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    rawPositions.forEach(p => {
        minX = Math.min(minX, p.rawX - tempSize);
        maxX = Math.max(maxX, p.rawX + tempSize);
        minY = Math.min(minY, p.rawY - tempSize);
        maxY = Math.max(maxY, p.rawY + tempSize);
    });

    // 3. Получаем размеры bounding box
    let rawWidth = maxX - minX;
    let rawHeight = maxY - minY;
    
    // Получаем реальные размеры контейнера Pixi
    let containerWidth = app.renderer.width;
    let containerHeight = app.renderer.height;

    // 4. Вычисляем динамический размер гекса (с небольшим отступом 15%)
    let scaleX = containerWidth / (rawWidth + tempSize);
    let scaleY = containerHeight / (rawHeight + tempSize);
    HEX_SIZE = Math.min(scaleX, scaleY) * tempSize * 0.8; // 0.8 для небольшого отступа

    // 5. Пересчитываем реальные координаты на основе нового HEX_SIZE
    let actualPositions = mapData.map(d => {
        const pos = hexToPixel(d.q, d.r);
        return { ...d, rawX: pos.x, rawY: pos.y };
    });

    // 6. Находим новые границы с новым HEX_SIZE
    minX = Infinity; maxX = -Infinity; minY = Infinity; maxY = -Infinity;
    actualPositions.forEach(p => {
        minX = Math.min(minX, p.rawX - HEX_SIZE);
        maxX = Math.max(maxX, p.rawX + HEX_SIZE);
        minY = Math.min(minY, p.rawY - HEX_SIZE);
        maxY = Math.max(maxY, p.rawY + HEX_SIZE);
    });

    // 7. Вычисляем смещение (shift) для центрирования по контейнеру
    let centerX = (minX + maxX) / 2;
    let centerY = (minY + maxY) / 2;
    let shiftX = (containerWidth / 2) - centerX;
    let shiftY = (containerHeight / 2) - centerY;

    // 8. Сборка финальной сетки
    actualPositions.forEach(d => {
        const pos = { x: d.rawX + shiftX, y: d.rawY + shiftY };
        let support = { player: 20, ai: 70, werewolf: 10, occultist: 0 };
        if (d.owner === 'player') support = { player: 80, ai: 10, werewolf: 10, occultist: 0 };
        else if (d.owner === 'ai') support = { player: 10, ai: 85, werewolf: 5, occultist: 0 };
        else if (d.owner === 'werewolf') support = { player: 5, ai: 15, werewolf: 80, occultist: 0 };
        else if (d.owner === 'occultist') support = { player: 0, ai: 0, werewolf: 0, occultist: 100 };

        grid.push({
            q: d.q, r: d.r, x: pos.x, y: pos.y, name: d.name, owner: d.owner, resources: d.res || { gold: 0, blood: 0 },
            fortification: d.fort || 0, population: d.pop || 0, support: support,
            playerGarrison: { infantry: d.owner === 'player' ? 20 : 0, archer: 0, cavalry: 0 },
            aiGarrison: { infantry: d.owner === 'ai' ? 20 : 0, archer: 0, cavalry: 0 },
            buildings: [], siegeBy: null
        });
    });
    return grid;
}

// Вспомогательная функция для начального расчета
function hexToPixelTemp(q, r, size) {
    const x = size * (Math.sqrt(3) * q + Math.sqrt(3)/2 * r);
    const y = size * (3/2 * r);
    return { x, y };
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

// ================= ОТРИСОВКА ГЕКСОВ И АРМИЙ =================
function drawHexes() {
    hexContainer.removeChildren();
    
    const currentHex = game.hexGrid.find(h => `${h.q},${h.r}` === game.player.mobileArmy.hexId);
    let movableHexIds = [];
    if (currentHex && game.player.ap > 0 && getTotalTroops(game.player.mobileArmy) > 0) {
        const neighbors = getNeighbors(Number(currentHex.q), Number(currentHex.r));
        movableHexIds = neighbors.map(n => `${n.q},${n.r}`);
    }

    game.hexGrid.forEach(hex => {
        const container = new PIXI.Container();
        container.x = hex.x;
        container.y = hex.y;

        const g = new PIXI.Graphics();
        let color = 0x1c1c24; // Нейтральный
        if (hex.owner === 'player') color = 0x7a1111;
        else if (hex.owner === 'ai') color = 0xe0e0c0;
        else if (hex.owner === 'werewolf') color = 0x2d4a2d;
        else if (hex.owner === 'occultist') color = 0x4a2e59;

        g.beginFill(color); 
        g.lineStyle(2, 0x333333, 0.7); 
        g.drawPolygon(...getHexCorners(0, 0));
        g.endFill();

        // Подсветка соседних доступных гексов
        const hexId = `${hex.q},${hex.r}`;
        if (movableHexIds.includes(hexId) && hex.owner !== 'player') {
            g.lineStyle(2, 0x88aadd, 0.8); 
            g.drawPolygon(...getHexCorners(0, 0));
        }

        g.interactive = true; g.cursor = 'pointer'; g.hexData = hex;
        g.on('mouseover', (e) => {
            g.tint = 0x88aadd;
            const t = document.getElementById('tooltip');
            const o = hex.owner ? (hex.owner === 'player' ? 'Дракула' : (hex.owner === 'ai' ? 'Ватикан' : (hex.owner === 'werewolf' ? 'Оборотни' : 'Оккультисты'))) : 'Ничейная';
            let r = '';
            if (hex.owner === null) r = `<br>⚔️ Добыча: 🪙${hex.resources.gold} | 🩸${hex.resources.blood}`;
            t.innerHTML = `
                <b style="font-size:14px;">${hex.name}</b><br>
                Владелец: ${o}<br>
                🧛 Тьма: ${hex.support.player}%<br>
                ⛪ Ватикан: ${hex.support.ai}%<br>
                🐺 Оборотни: ${hex.support.werewolf}%<br>
                🔮 Оккультисты: ${hex.support.occultist}%<br>
                🛡️ Гарнизон: ${getTotalTroops(hex.owner === 'player' ? hex.playerGarrison : (hex.owner === 'ai' ? hex.aiGarrison : 0))}<br>
                👥 Население: ${hex.population}<br>
                🏰 Укрепления: ${hex.fortification}${r}
            `;
            t.style.display = 'block';
            t.style.left = (e.data.originalEvent.clientX + 20) + 'px';
            t.style.top = (e.data.originalEvent.clientY + 20) + 'px';
        });
        g.on('mouseout', () => { g.tint = 0xFFFFFF; document.getElementById('tooltip').style.display = 'none'; });
        g.on('click', () => handleHexClick(hex));

        try {
            const nT = new PIXI.Text(hex.name, { fontFamily: 'Cinzel, serif', fontSize: 9, fill: 0xffffff, align: 'center', dropShadow: true, dropShadowColor: 0x000000 });
            nT.anchor.set(0.5);
            nT.x = 0; nT.y = -20;
            container.addChild(g);
            container.addChild(nT);
        } catch (e) {
            container.addChild(g);
        }
        hexContainer.addChild(container);
    });
}

function drawArmies() {
    try {
        armyContainer.removeChildren();
        const pPos = game.hexGrid.find(h => `${h.q},${h.r}` === game.player.mobileArmy.hexId);
        const aPos = game.hexGrid.find(h => `${h.q},${h.r}` === game.ai.mobileArmy.hexId);
        const wPos = game.hexGrid.find(h => `${h.q},${h.r}` === game.werewolf.mobileArmy.hexId);

        function renderFallbackArmy(x, y, count, color, symbol, symbolColor) {
            try {
                const c = new PIXI.Graphics();
                c.beginFill(color);
                c.drawCircle(0, 0, 16);
                c.endFill();
                c.lineStyle(2, 0x000000, 0.5);
                c.drawCircle(0, 0, 16);
                const t = new PIXI.Text(symbol, { fontFamily: 'Cinzel', fontSize: 12, fill: symbolColor || 0xffffff, fontWeight: 'bold' });
                t.anchor.set(0.5);
                c.addChild(t);
                const countText = new PIXI.Text(`${count}`, { fontFamily: 'Arial', fontSize: 8, fill: 0xffffff });
                countText.anchor.set(0.5);
                countText.y = 14;
                c.addChild(countText);
                c.x = x; c.y = y;
                armyContainer.addChild(c);
            } catch (e) {}
        }

        if (pPos) {
            if (spritePlayer) {
                const s = new PIXI.Sprite(spritePlayer);
                s.anchor.set(0.5); s.scale.set(0.12);
                s.x = pPos.x; s.y = pPos.y;
                armyContainer.addChild(s);
                if(game.player.lords.length > 0 && spriteLord) {
                    const l = new PIXI.Sprite(spriteLord);
                    l.anchor.set(0.5); l.scale.set(0.07);
                    l.x = pPos.x + 25; l.y = pPos.y - 20;
                    armyContainer.addChild(l);
                }
            } else {
                renderFallbackArmy(pPos.x, pPos.y, getTotalTroops(game.player.mobileArmy), 0x7a1111, '🦇', 0xffffff);
            }
        }

        if (aPos) {
            if (spriteAI) {
                const s = new PIXI.Sprite(spriteAI);
                s.anchor.set(0.5); s.scale.set(0.14);
                s.x = aPos.x; s.y = aPos.y;
                armyContainer.addChild(s);
                if(spriteAIGeneral) {
                    const g = new PIXI.Sprite(spriteAIGeneral);
                    g.anchor.set(0.5); g.scale.set(0.07);
                    g.x = aPos.x + 25; g.y = aPos.y - 20;
                    armyContainer.addChild(g);
                }
            } else {
                renderFallbackArmy(aPos.x, aPos.y, getTotalTroops(game.ai.mobileArmy), 0xe0e0c0, '✝', 0x000000);
            }
        }

        if (wPos) {
            if (spriteWerewolf) {
                const s = new PIXI.Sprite(spriteWerewolf);
                s.anchor.set(0.5); s.scale.set(0.12);
                s.x = wPos.x; s.y = wPos.y;
                armyContainer.addChild(s);
                if(spriteWolfGeneral) {
                    const g = new PIXI.Sprite(spriteWolfGeneral);
                    g.anchor.set(0.5); g.scale.set(0.07);
                    g.x = wPos.x + 25; g.y = wPos.y - 20;
                    armyContainer.addChild(g);
                }
            } else {
                renderFallbackArmy(wPos.x, wPos.y, getTotalTroops(game.werewolf.mobileArmy), 0x2d4a2d, '👹', 0xffffff);
            }
        }
    } catch (e) {
        console.error("Ошибка в drawArmies:", e);
    }
}

function updateUI() {
    try {
        document.getElementById('turn-counter').textContent = game.turn;
        document.getElementById('day-counter').textContent = game.day;
        document.getElementById('ap-counter').textContent = `${game.player.ap}/${game.player.maxAp}`;
        document.getElementById('blood-counter').textContent = game.player.blood;
        document.getElementById('gold-counter').textContent = game.player.gold;
        document.getElementById('elite-counter').textContent = game.player.lords.length;
        document.getElementById('faith-bar-fill').style.width = '0%';
        document.getElementById('faith-text').textContent = '0 / 100';
    } catch (e) {}
    
    const cH = game.hexGrid.find(h => `${h.q},${h.r}` === game.player.mobileArmy.hexId);
    const isReadyToAssault = (cH && cH.siegeBy === 'player' && game.player.ap > 0 && isNightTime() && !game.gameOver);
    document.getElementById('btn-assault').disabled = !isReadyToAssault;
    
    drawHexes(); drawArmies();
}

// ================= ИГРОВАЯ ЛОГИКА И МЕХАНИКА АТАКИ =================
function handleHexClick(hex) {
    if (game.gameOver || game.player.ap <= 0) return log('Нет очков действий.', 'system');
    const cH = game.hexGrid.find(h => `${h.q},${h.r}` === game.player.mobileArmy.hexId);
    if (!cH) return;

    if (hex.owner === 'player') {
        game.selectedHexId = `${hex.q},${hex.r}`;
        log(`Выбрана ${hex.name} для стройки.`, 'system'); updateUI(); return;
    }

    // ИСПРАВЛЕНИЕ: Строгое сравнение строковых ID для проверки соседей
    const currentHexId = `${cH.q},${cH.r}`;
    const clickedHexId = `${hex.q},${hex.r}`;
    
    const neighbors = getNeighbors(Number(cH.q), Number(cH.r));
    const isNeighbor = neighbors.some(n => `${n.q},${n.r}` === clickedHexId);

    if (!isNeighbor) {
        log('Слишком далеко! Чтобы атаковать или двигаться, кликайте только по соседним гексам.', 'system');
        return;
    }

    if (hex.owner === null || hex.owner === 'occultist') {
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
        if (!isNightTime()) return log('День! Нельзя атаковать. Чтобы начать осаду, нужна ночь.', 'player');
        if (getTotalTroops(game.player.mobileArmy) === 0) return log('Нет войск.', 'system');
        game.pendingActionHexId = clickedHexId;
        document.getElementById('action-desc').textContent = `Ваша армия вошла в «${hex.name}».`;
        document.getElementById('action-modal').style.display = 'flex';
    }
}

function executeCurse(targetHex) {
    if (game.battleActive) return; game.battleActive = true;
    let defGar = targetHex.owner === 'player' ? targetHex.playerGarrison : targetHex.aiGarrison;
    let totalDef = getTotalTroops(defGar) + targetHex.fortification * 5;
    let defLoss = 30 + Math.floor(Math.random() * 10);
    if (defLoss > totalDef) defLoss = totalDef;

    const types = ['infantry', 'archer', 'cavalry'];
    types.forEach(t => {
        if (defGar[t] > 0) defGar[t] = Math.max(0, defGar[t] - Math.floor(defLoss * (defGar[t] / (totalDef + 1))));
    });

    log(`Проклятие на ${targetHex.name}! Магический урон: ${defLoss}.`, 'system');

    if (getTotalTroops(defGar) <= 0) {
        log(`Провинция ${targetHex.name} захвачена магией!`, 'player');
        targetHex.owner = 'player'; targetHex.siegeBy = null; targetHex.aiGarrison = {};
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
    if (game.player.gold < 100) {
        log('Недостаточно золота для подкупа!', 'system');
        return;
    }
    game.player.gold -= 100;
    log(`${targetHex.name} подкуплена!`, 'player');
    targetHex.owner = 'player';
    targetHex.siegeBy = null;
    targetHex.aiGarrison = {};
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

// ================= ЭКОНОМИКА И ИИ =================
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

function aiTurn() {
    const aH = game.hexGrid.find(h => `${h.q},${h.r}` === game.ai.mobileArmy.hexId);
    if (game.ai.gold > 10 && aH && aH.owner === 'ai') {
        game.ai.mobileArmy.infantry += 5; game.ai.gold -= 10;
        log('Ватикан пополнил армию.', 'ai');
    }
    const enemy = game.hexGrid.find(h => getNeighbors(aH.q, aH.r).some(n => `${n.q},${n.r}` === `${h.q},${h.r}`) && h.owner === 'player');
    if (enemy && getTotalTroops(game.ai.mobileArmy) > 30) {
        enemy.owner = 'ai'; enemy.playerGarrison = { infantry:0, archer:0, cavalry:0 }; enemy.aiGarrison = { infantry: 10, archer: 0, cavalry: 0 };
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

// ================= ЛОР И КНОПКИ ИНТЕРФЕЙСА =================
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
    try {
        const container = document.getElementById('prologue-text-container');
        const btnWrapper = document.getElementById('prologue-btn-wrapper');
        if (!container) return;
        container.innerHTML = '';

        const storyText = `
            Граф Дракула, последний из древнего рода, пробуждается спустя столетия. Им движет не только жажда крови, но и пылающая, неутолимая любовь к прекрасной Кассальдии — дочери его самого могущественного врага. Он хочет подарить ей мир, где она будет в безопасности, но его собственная вампирская сущность жаждет власти и хаоса.
            
            Святой Престол во главе с Папой Эмиретиусом Клавдием II объявил крестовый поход против вампиров. Эмиретиус держит свою дочь Кассальдию в строгой изоляции, используя её как пешку для укрепления своей власти. Дракула должен объединить и завоевать все земли Европы, чтобы сокрушить Ватикан и освободить её.
            
            Каждое убийство делает Дракулу сильнее, но оно же отдаляет его от человечности, которую он пытается сохранить ради Кассальдии. Он боится, что, достигнув цели, он станет чудовищем, которое она не сможет полюбить.
            
            Ватикан не остановится ни перед чем. Им противостоят дикие Оборотни, жаждущие крови. Но даже объединившись, они не смогут противостоять Армии Тьмы, которую ведёт Дракула. Европа — это поле боя, а судьба Кассальдии — главный приз. Сделайте правильный выбор, Повелитель Тьмы!
        `;

        const paragraphs = storyText.split('\n').filter(p => p.trim() !== '');
        let paragraphIndex = 0;
        let charIndex = 0;
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
    } catch (e) { console.error("Ошибка в прологе:", e); }
}

function startGameMap() {
    document.getElementById('prologue-modal').style.display = 'none';
    document.getElementById('start-menu').style.display = 'none';
    document.getElementById('game-container').style.display = 'flex';
    if (!loadGame()) {
        game = getDefaultGame(); 
        game.hexGrid = initHexGrid();
        game.player.lords.push({ name: LORD_NAMES[0], battles: 0 });
    } else {
        log('Загружена сохраненная игра.', 'system');
    }
    document.getElementById('btn-end-turn').disabled = false;
    attachLoreListeners();
    resizeMap();
    updateUI();
    log('Дракула пробудился! Завоюйте Европу.', 'system');
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

document.addEventListener('DOMContentLoaded', async () => {
    await loadSprites();
    document.getElementById('start-menu').style.display = 'flex';
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('loading-modal').style.display = 'none';
    document.getElementById('prologue-modal').style.display = 'none';

    document.getElementById('btn-prologue-start').addEventListener('click', startGameMap);
    document.getElementById('btn-new-game').addEventListener('click', () => { localStorage.removeItem('DraculaHexFinal'); initGame(true); });
    document.getElementById('btn-load-game').addEventListener('click', () => { initGame(false); });
    
    document.getElementById('btn-mnu-restart').addEventListener('click', () => {
        if(confirm('Выйти в главное меню? Прогресс этого хода будет потерян.')) {
            document.getElementById('start-menu').style.display = 'flex';
            document.getElementById('game-container').style.display = 'none';
            document.getElementById('prologue-modal').style.display = 'none';
            game.gameOver = false;
            document.getElementById('gameover-modal').style.display = 'none';
        }
    });
    document.getElementById('btn-music-toggle').addEventListener('click', () => {
        const bgm = document.getElementById('bgm');
        if (bgm.paused) { bgm.volume = 0.4; bgm.play().catch(()=>{}); document.getElementById('btn-music-toggle').textContent = "ЗВУК"; } 
        else { bgm.pause(); document.getElementById('btn-music-toggle').textContent = "ЗВУК"; }
    });
    document.getElementById('btn-end-turn').addEventListener('click', endPlayerTurn);

    document.getElementById('btn-toggle-log').addEventListener('click', () => {
        document.getElementById('log-overlay').style.display = 'flex';
    });
    document.getElementById('btn-close-log').addEventListener('click', () => {
        document.getElementById('log-overlay').style.display = 'none';
    });
    document.getElementById('btn-clear-log').addEventListener('click', () => document.getElementById('log-container').innerHTML = '');

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

    document.getElementById('btn-open-diplomacy').addEventListener('click', () => document.getElementById('diplomacy-modal').style.display = 'flex');
    document.getElementById('btn-open-market').addEventListener('click', () => document.getElementById('market-modal').style.display = 'flex');
    document.getElementById('btn-open-tech').addEventListener('click', () => document.getElementById('tech-modal').style.display = 'flex');
    document.getElementById('btn-open-factions').addEventListener('click', () => document.getElementById('factions-modal').style.display = 'flex');
    document.getElementById('btn-factions-close').addEventListener('click', () => document.getElementById('factions-modal').style.display = 'none');

    document.getElementById('btn-action-close').addEventListener('click', () => document.getElementById('action-modal').style.display = 'none');
    document.getElementById('btn-surrender-close').addEventListener('click', () => document.getElementById('surrender-modal').style.display = 'none');
    document.getElementById('btn-diplomacy-close').addEventListener('click', () => document.getElementById('diplomacy-modal').style.display = 'none');
    document.getElementById('btn-market-close').addEventListener('click', () => document.getElementById('market-modal').style.display = 'none');
    document.getElementById('btn-tech-close').addEventListener('click', () => document.getElementById('tech-modal').style.display = 'none');

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

    document.getElementById('dip-truce-ai').addEventListener('click', () => {
        if (game.player.gold < 30) return log('Не хватает золота для перемирия.', 'system');
        if (game.player.truceTurnsAI > 0) return log('Перемирие уже активно.', 'system');
        game.player.gold -= 30; game.player.truceTurnsAI = 2;
        log('Перемирие с Ватиканом на 2 хода!', 'player');
        document.getElementById('diplomacy-modal').style.display = 'none'; updateUI();
    });
    document.getElementById('dip-truce-wolf').addEventListener('click', () => {
        if (game.player.gold < 30) return log('Не хватает золота для перемирия.', 'system');
        if (game.player.truceTurnsWolf > 0) return log('Перемирие уже активно.', 'system');
        game.player.gold -= 30; game.player.truceTurnsWolf = 2;
        log('Перемирие с Оборотнями на 2 хода!', 'player');
        document.getElementById('diplomacy-modal').style.display = 'none'; updateUI();
    });
    document.getElementById('dip-alliance').addEventListener('click', () => {
        if (game.player.gold < 50) return log('Не хватает золота для союза.', 'system');
        if (game.player.allianceWithAI) return log('Союз уже активен.', 'system');
        game.player.gold -= 50; game.player.allianceWithAI = true;
        log('Союз с Ватиканом против Оборотней!', 'player');
        document.getElementById('diplomacy-modal').style.display = 'none'; updateUI();
    });

    document.getElementById('mkt-gold-to-blood').addEventListener('click', () => {
        if(game.player.gold >= 10) { game.player.gold -= 10; game.player.blood += 8; log('Обмен: 10🪙 -> 8🩸', 'player'); document.getElementById('market-modal').style.display = 'none'; updateUI(); }
        else log('Недостаточно золота!', 'system');
    });
    document.getElementById('mkt-blood-to-gold').addEventListener('click', () => {
        if(game.player.blood >= 10) { game.player.blood -= 10; game.player.gold += 8; log('Обмен: 10🩸 -> 8🪙', 'player'); document.getElementById('market-modal').style.display = 'none'; updateUI(); }
        else log('Недостаточно крови!', 'system');
    });

    document.getElementById('tech-reform').addEventListener('click', () => {
        if (game.player.gold < 30) return log('Не хватает золота для Военной реформы.', 'system');
        if (game.player.techs.militaryReform) return log('Военная реформа уже изучена.', 'system');
        game.player.gold -= 30; game.player.techs.militaryReform = true;
        log('Изучена Военная реформа! +10% к мощи армии.', 'player');
        document.getElementById('tech-modal').style.display = 'none'; updateUI();
    });
    document.getElementById('tech-necro').addEventListener('click', () => {
        if (game.player.gold < 30) return log('Не хватает золота для Некромантии.', 'system');
        if (game.player.techs.necromancy) return log('Некромантия уже изучена.', 'system');
        game.player.gold -= 30; game.player.techs.necromancy = true;
        log('Изучена Некромантия! Убитые враги дают кровь.', 'player');
        document.getElementById('tech-modal').style.display = 'none'; updateUI();
    });
    document.getElementById('tech-trade').addEventListener('click', () => {
        if (game.player.gold < 30) return log('Не хватает золота для Торговых путей.', 'system');
        if (game.player.techs.tradeRoutes) return log('Торговые пути уже изучены.', 'system');
        game.player.gold -= 30; game.player.techs.tradeRoutes = true;
        log('Изучены Торговые пути! Рынок 2 раза за ход.', 'player');
        document.getElementById('tech-modal').style.display = 'none'; updateUI();
    });

    const builds = { 
        'build-cemetery': 'cemetery', 'build-barracks': 'barracks', 'build-barracks-2': 'barracks_lv2',
        'build-ritual': 'dark_temple', 'build-dungeon': 'dungeon', 'build-executions': 'executions',
        'build-ball': 'ball', 'build-center': 'center', 'build-citadel': 'citadel',
        'build-wall': 'wall', 'build-castle': 'castle', 'build-market': 'market' 
    };
    Object.keys(builds).forEach(id => {
        document.getElementById(id).addEventListener('click', () => {
            if (game.player.ap <= 0) return log('Нет очков действий.', 'system');
            if (!game.selectedHexId) return log('Выберите свой гекс на карте.', 'system');
            const h = game.hexGrid.find(x => `${x.q},${x.r}` === game.selectedHexId);
            if (!h || h.owner !== 'player') return log('Не ваша территория.', 'system');
            const costs = { 'cemetery': 30, 'barracks': 20, 'barracks_lv2': 50, 'dark_temple': 20, 'dungeon': 15, 'executions': 10, 'ball': 30, 'center': 25, 'citadel': 40, 'wall': 10, 'castle': 40, 'market': 20 };
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

    const recruits = { 
        'recruit-inf': 'infantry', 'recruit-arch': 'archer', 'recruit-cav': 'cavalry', 
        'recruit-knights': 'knights', 'recruit-lord': 'lord', 'recruit-soul': 'soul_collector' 
    };
    Object.keys(recruits).forEach(id => {
        document.getElementById(id).addEventListener('click', () => {
            if (game.player.ap <= 0) return log('Нет очков действий.', 'system');
            if (!game.selectedHexId) return log('Выберите свой гекс на карте.', 'system');
            const h = game.hexGrid.find(x => `${x.q},${x.r}` === game.selectedHexId);
            if (!h || h.owner !== 'player') return log('Не ваша территория.', 'system');

            if (recruits[id] === 'lord') {
                if (!h.buildings.find(b => b.type === 'dark_temple')) return log('Нужен Храм Тьмы.', 'system');
                if (game.player.gold < 10) return log('Нужно 10 золота.', 'system');
                game.player.gold -= 10; game.player.lords.push({ name: LORD_NAMES[game.player.lords.length % LORD_NAMES.length], battles: 0 });
                log(`Лорд "${LORD_NAMES[game.player.lords.length - 1]}" примкнул!`, 'player');
                game.player.ap -= 1; updateUI(); return;
            }
            if (recruits[id] === 'soul_collector') {
                if (!game.player.hasCitadel) return log('Постройте Цитадель.', 'system');
                if (game.player.gold < 25) return log('Нужно 25 золота.', 'system');
                game.player.gold -= 25; game.player.hasCitadel = true;
                log('Сборщик душ нанят!', 'player');
                game.player.ap -= 1; updateUI(); return;
            }
            if (recruits[id] === 'knights') {
                if (!h.buildings.find(b => b.type === 'barracks' && b.lvl === 2)) return log('Нужны Казармы Lv2.', 'system');
                if (game.player.gold < 30) return log('Нужно 30 золота.', 'system');
                game.player.gold -= 30; 
                if (game.player.mobileArmy.hexId === `${h.q},${h.r}`) game.player.mobileArmy.cavalry += 2;
                else h.playerGarrison.cavalry += 2;
                log('2 Рыцаря Тьмы призваны.', 'player');
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

    document.getElementById('btn-siege').addEventListener('click', () => {
        if (!game.pendingActionHexId || game.player.ap <= 0) return;
        const h = game.hexGrid.find(x => `${x.q},${x.r}` === game.pendingActionHexId);
        h.siegeBy = 'player'; game.player.mobileArmy.hexId = `${h.q},${h.r}`; game.player.ap -= 1;
        log(`${h.name} взята в осаду! Штурм ночью.`, 'player');
        document.getElementById('action-modal').style.display = 'none'; updateUI();
    });
    document.getElementById('btn-assault-now').addEventListener('click', () => {
        if (!game.pendingActionHexId) return;
        const h = game.hexGrid.find(x => `${x.q},${x.r}` === game.pendingActionHexId);
        game.player.mobileArmy.hexId = `${h.q},${h.r}`; game.player.ap -= 1; document.getElementById('action-modal').style.display = 'none'; executeBattle(h);
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
