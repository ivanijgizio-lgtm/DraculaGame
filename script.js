// ================= ЗАГРУЗКА АССЕТОВ (ПУТИ ОБНОВЛЕНЫ ПО ЗАПРОСУ) =================
const sprites = {
    player: new Image(), ai: new Image(), werewolf: new Image(),
    highVampire: new Image(), inquisitor: new Image(),
    aiGeneral: new Image(), wolfGeneral: new Image()
};
sprites.player.src = './assets/Vampire Army.png';
sprites.ai.src = './assets/Knight Vatican.jpg';
sprites.aiGeneral.src = './assets/Knigt Vatican General.gif'; 
sprites.inquisitor.src = './assets/Vatican Inquisitor.png';
sprites.highVampire.src = './assets/Lord Vampire.jpg';
sprites.werewolf.src = './assets/Werewolf Army.webp';
sprites.wolfGeneral.src = './assets/Werewolf general.jpg';

// ================= ЛОР И ЭНЦИКЛОПЕДИЯ =================
const BUILD_LORE = {
    'build': "🏗️ СТРОИТЬ: Возводите тёмные сооружения, усиливающие вашу мощь и влияние на население.",
    'recruit': "🧛 ПРИЗВАТЬ: Найдите подходящих солдат и слуг для своей армии Тьмы. Каждое подразделение требует казарм.",
    'garrison': "🛡️ ГАРНИЗОН: Перемещайте войска между активной армией и гарнизоном провинции для её защиты.",
    'cemetery': "🪦 Кладбище: Некрополь, куда стекаются неупокоенные души. Дарует +5 крови за ход.",
    'barracks': "⚔️ Казармы Lv1: Сердце военной машины. Без них обычные войска не могут быть призваны.",
    'barracks_lv2': "⚔️⬆️ Казармы Lv2: Тренировочный полигон для элиты. Открывает призыв Рыцарей Тьмы.",
    'ritual': "🕯️ Храм Тьмы: Святилище, притягивающее тёмные силы. Укрепляет веру населения во мрак (+5 поддержки Тьмы, +3 лояльности). Открывает найм Лордов.",
    'dungeon': "⛓️ Тюрьма: Темницы, где стонут враги Тьмы. Страх заставляет население подчиняться, но ожесточает сердца (+10 поддержки Тьмы, -5 лояльности).",
    'executions': "🪓 Казни: Эшафоты и дыбы на главной площади. Ужас и повиновение — вот плоды этих зрелищ (+15 поддержки Тьмы, -10 лояльности, -200 населения).",
    'ball': "🎭 Бал Вампиров: Роскошный пир для знати Тьмы. Жители мечтают попасть в высшее общество, но угощение для гостей стоит крови (+20 поддержки Тьмы, +5 лояльности, -200 населения).",
    'center': "🧛 Центр Обращения: Центр, где жители превращаются в покорных слуг тьмы (+10 поддержки Тьмы, +5 лояльности, +100 населения, +5 крови/ход).",
    'citadel': "🏰 Цитадель: Оплот налоговой системы и тёмной бюрократии. Дарует право нанимать Сборщиков душ.",
    'wall': "🧱 Стены: Защита от вторжений. +1 к укреплениям провинции.",
    'castle': "🏰 Замок: Оплот власти. +2 укрепления, +20 гарнизона и повышает поддержку Тьмы.",
    'market': "🏪 Рынок: Торговая площадь. Позволяет обменивать ресурсы 1 раз в ход.",
    'infantry': "🗡️ Пехота: Основа любой армии. Надёжные щиты и копья, готовые стоять насмерть.",
    'archer': "🏹 Лучники: Меткие стрелки, сеющие хаос на расстоянии.",
    'cavalry': "🐴 Кавалерия: Быстрые и маневренные всадники, идеально подходят для фланговых атак.",
    'knights': "⚔️ Рыцари Тьмы: Элитные бойцы в тяжёлой броне. Молот Тьмы, сокрушающий вражеские строй.",
    'lord': "👑 Верховный Лорд: Бессмертный генерал. Без него армия не может штурмовать провинции.",
    'soul_collector': "💀 Сборщик душ: Таинственный посредник, выбивающий долги и души. Приносит 50 золота каждый ход."
};

const LORD_NAMES = [
    "Граф Дракулос", "Леди Сильвана", "Барон Ноктюрн", "Графиня Морвен", 
    "Владыка Варгос", "Лорд Мортис", "Принц Теней", "Леди Вэйн", 
    "Генерал Кровавый Клык", "Некромант Зерет"
];

// ================= ДАННЫЕ ИГРЫ =================
function getDefaultGame() {
    return {
        turn: 1, day: 1, gameOver: false, battleActive: false, surrenderActive: false, armyBattleActive: false,
        tutorialStep: 0,
        fogOfWar: true, 
        selectedProvinceId: null,
        pendingActionProvId: null,
        enemyArmyTarget: null,
        weather: { lightning: false, rain: false, sunset: false },
        player: {
            ap: 2, maxAp: 2, gold: 100, blood: 10, lords: [], 
            mobileArmy: { infantry: 50, archer: 10, cavalry: 10, location: 4 },
            techs: { militaryReform: false, necromancy: false, tradeRoutes: false },
            marketUsed: false, allianceWithAI: false, truceTurnsAI: 0, truceTurnsWolf: 0,
            hasCitadel: false, hasSoulCollector: false,
        },
        ai: { gold: 100, blood: 5, generals: { inquisitor: 5 }, mobileArmy: { infantry: 50, archer: 10, cavalry: 10, location: 40 }, faith: 0 },
        werewolf: { gold: 50, blood: 10, generals: { alpha: 3 }, mobileArmy: { infantry: 30, archer: 5, cavalry: 10, location: 45 } },
        provinces: [
            { id: 1, name: 'Ватикан', owner: 'ai', x: 235, y: 170, aiGarrison: { infantry: 20, archer: 5, cavalry: 5 }, siegeBy: null, neighbors: [17, 19], buildings: [{type:'church', lvl:1}], income: 3, support: { player: 5, ai: 90, werewolf: 5 }, population: 5000, slaveIncome: 0, fortification: 3, terrain: 'plains', terrainBonus: 0, loyalty: 100 },
            { id: 2, name: 'Австрия', owner: 'ai', x: 400, y: 180, aiGarrison: { infantry: 10, archer: 2, cavalry: 3 }, siegeBy: null, neighbors: [3, 4, 16, 24], buildings: [], income: 2, support: { player: 15, ai: 75, werewolf: 10 }, population: 3000, slaveIncome: 0, fortification: 1, terrain: 'plains', terrainBonus: 0, loyalty: 80 },
            { id: 3, name: 'Венгрия', owner: 'ai', x: 480, y: 190, aiGarrison: { infantry: 15, archer: 3, cavalry: 2 }, siegeBy: null, neighbors: [2, 4, 5, 27, 28], buildings: [{type:'church', lvl:1}], income: 3, support: { player: 20, ai: 70, werewolf: 10 }, population: 4000, slaveIncome: 0, fortification: 1, terrain: 'plains', terrainBonus: 0, loyalty: 80 },
            { id: 4, name: 'Трансильвания', owner: 'player', x: 510, y: 260, playerGarrison: { infantry: 20, archer: 5, cavalry: 5 }, siegeBy: null, neighbors: [2, 3, 5, 8, 25], buildings: [{type:'dark_temple', lvl:1}], income: 3, support: { player: 80, ai: 5, werewolf: 15 }, population: 4500, slaveIncome: 0, fortification: 2, terrain: 'plains', terrainBonus: 0, loyalty: 100 },
            { id: 5, name: 'Валахия', owner: 'ai', x: 580, y: 290, aiGarrison: { infantry: 10, archer: 2, cavalry: 3 }, siegeBy: null, neighbors: [3, 4, 6, 7, 26], buildings: [], income: 2, support: { player: 30, ai: 45, werewolf: 25 }, population: 2000, slaveIncome: 0, fortification: 0, terrain: 'plains', terrainBonus: 0, loyalty: 70 },
            { id: 6, name: 'Молдавия', owner: 'ai', x: 630, y: 260, aiGarrison: { infantry: 5 }, siegeBy: null, neighbors: [3, 5, 7, 12, 13], buildings: [], income: 2, support: { player: 40, ai: 40, werewolf: 20 }, population: 2000, slaveIncome: 0, fortification: 0, terrain: 'forest', terrainBonus: 2, loyalty: 70 },
            { id: 7, name: 'Одесса', owner: 'ai', x: 660, y: 340, aiGarrison: { infantry: 5, archer: 3 }, siegeBy: null, neighbors: [5, 6, 12, 13], buildings: [], income: 1, support: { player: 45, ai: 30, werewolf: 25 }, population: 1500, slaveIncome: 0, fortification: 0, terrain: 'plains', terrainBonus: 0, loyalty: 60 },
            { id: 8, name: 'Богемия', owner: 'ai', x: 430, y: 250, aiGarrison: { infantry: 10 }, siegeBy: null, neighbors: [3, 4, 9, 24], buildings: [{type:'church', lvl:1}], income: 2, support: { player: 20, ai: 70, werewolf: 10 }, population: 2500, slaveIncome: 0, fortification: 1, terrain: 'plains', terrainBonus: 0, loyalty: 70 },
            { id: 9, name: 'Саксония', owner: 'ai', x: 320, y: 210, aiGarrison: { infantry: 5 }, siegeBy: null, neighbors: [1, 2, 8, 14], buildings: [], income: 2, support: { player: 30, ai: 60, werewolf: 10 }, population: 2000, slaveIncome: 0, fortification: 0, terrain: 'plains', terrainBonus: 0, loyalty: 60 },
            { id: 10, name: 'Сербия', owner: 'ai', x: 520, y: 370, aiGarrison: { infantry: 5, cavalry: 5 }, siegeBy: null, neighbors: [4, 11, 25], buildings: [], income: 1, support: { player: 50, ai: 30, werewolf: 20 }, population: 1000, slaveIncome: 0, fortification: 0, terrain: 'plains', terrainBonus: 0, loyalty: 50 },
            { id: 11, name: 'Болгария', owner: 'ai', x: 580, y: 420, aiGarrison: { infantry: 10, archer: 5 }, siegeBy: null, neighbors: [5, 10, 13, 15, 29], buildings: [], income: 1, support: { player: 40, ai: 40, werewolf: 20 }, population: 1500, slaveIncome: 0, fortification: 0, terrain: 'mountains', terrainBonus: 5, loyalty: 50 },
            { id: 12, name: 'Киевская Русь', owner: 'ai', x: 720, y: 180, aiGarrison: { infantry: 10 }, siegeBy: null, neighbors: [6, 7, 13, 35], buildings: [], income: 1, support: { player: 15, ai: 80, werewolf: 5 }, population: 1800, slaveIncome: 0, fortification: 0, terrain: 'plains', terrainBonus: 0, loyalty: 60 },
            { id: 13, name: 'Крым', owner: 'ai', x: 700, y: 430, aiGarrison: { infantry: 5, archer: 3, cavalry: 2 }, siegeBy: null, neighbors: [6, 7, 11, 12], buildings: [], income: 1, support: { player: 35, ai: 50, werewolf: 15 }, population: 1200, slaveIncome: 0, fortification: 0, terrain: 'plains', terrainBonus: 0, loyalty: 60 },
            { id: 14, name: 'Польша', owner: 'ai', x: 370, y: 110, aiGarrison: { infantry: 10, cavalry: 5 }, siegeBy: null, neighbors: [8, 9, 39, 16], buildings: [{type:'church', lvl:1}], income: 2, support: { player: 10, ai: 80, werewolf: 10 }, population: 2500, slaveIncome: 0, fortification: 1, terrain: 'plains', terrainBonus: 0, loyalty: 70 },
            { id: 15, name: 'Византия', owner: 'ai', x: 640, y: 530, aiGarrison: { infantry: 20, archer: 10, cavalry: 5 }, siegeBy: null, neighbors: [11, 29], buildings: [{type:'church', lvl:1}, {type:'fortress', lvl:1}], income: 5, support: { player: 5, ai: 90, werewolf: 5 }, population: 6000, slaveIncome: 0, fortification: 3, terrain: 'plains', terrainBonus: 0, loyalty: 80 },
            { id: 16, name: 'Венеция', owner: 'ai', x: 290, y: 190, aiGarrison: { infantry: 15, archer: 5, cavalry: 5 }, siegeBy: null, neighbors: [1, 9, 14, 17, 24], buildings: [], income: 3, support: { player: 15, ai: 80, werewolf: 5 }, population: 3500, slaveIncome: 0, fortification: 1, terrain: 'plains', terrainBonus: 0, loyalty: 90 },
            { id: 17, name: 'Хорватия', owner: 'ai', x: 390, y: 290, aiGarrison: { infantry: 10, archer: 3, cavalry: 2 }, siegeBy: null, neighbors: [1, 16, 18, 25], buildings: [], income: 2, support: { player: 20, ai: 70, werewolf: 10 }, population: 2500, slaveIncome: 0, fortification: 0, terrain: 'river', terrainBonus: 1, loyalty: 80 },
            { id: 18, name: 'Босния', owner: 'ai', x: 450, y: 310, aiGarrison: { infantry: 10 }, siegeBy: null, neighbors: [17, 21, 25, 27], buildings: [], income: 2, support: { player: 25, ai: 35, werewolf: 40 }, population: 2000, slaveIncome: 0, fortification: 0, terrain: 'plains', terrainBonus: 0, loyalty: 70 },
            { id: 19, name: 'Ломбардия', owner: 'werewolf', x: 220, y: 130, aiGarrison: { infantry: 10, archer: 2 }, siegeBy: null, neighbors: [1, 20, 16], buildings: [], income: 1, support: { player: 10, ai: 20, werewolf: 70 }, population: 2000, slaveIncome: 0, fortification: 0, terrain: 'mountains', terrainBonus: 5, loyalty: 60 },
            { id: 20, name: 'Карпаты', owner: 'werewolf', x: 480, y: 150, aiGarrison: { infantry: 15 }, siegeBy: null, neighbors: [21, 22, 3], buildings: [], income: 1, support: { player: 10, ai: 10, werewolf: 80 }, population: 3000, slaveIncome: 0, fortification: 0, terrain: 'forest', terrainBonus: 2, loyalty: 70 },
            { id: 21, name: 'Дикая пуща', owner: 'werewolf', x: 560, y: 170, aiGarrison: { infantry: 10, cavalry: 5 }, siegeBy: null, neighbors: [20, 22, 5, 18, 27], buildings: [], income: 1, support: { player: 10, ai: 10, werewolf: 80 }, population: 2500, slaveIncome: 0, fortification: 0, terrain: 'forest', terrainBonus: 2, loyalty: 60 },
            { id: 22, name: 'Пруссия', owner: 'ai', x: 560, y: 90, aiGarrison: { infantry: 10 }, siegeBy: null, neighbors: [20, 21, 39], buildings: [], income: 2, support: { player: 15, ai: 75, werewolf: 10 }, population: 2000, slaveIncome: 0, fortification: 0, terrain: 'plains', terrainBonus: 0, loyalty: 60 },
            { id: 23, name: 'Германия', owner: 'ai', x: 310, y: 100, aiGarrison: { infantry: 15 }, siegeBy: null, neighbors: [14, 38, 22], buildings: [], income: 2, support: { player: 20, ai: 70, werewolf: 10 }, population: 2500, slaveIncome: 0, fortification: 1, terrain: 'plains', terrainBonus: 0, loyalty: 70 },
            { id: 24, name: 'Бавария', owner: 'ai', x: 370, y: 220, aiGarrison: { infantry: 12 }, siegeBy: null, neighbors: [2, 9, 16, 8], buildings: [], income: 2, support: { player: 20, ai: 70, werewolf: 10 }, population: 2500, slaveIncome: 0, fortification: 1, terrain: 'plains', terrainBonus: 0, loyalty: 70 },
            { id: 25, name: 'Греция', owner: 'ai', x: 540, y: 440, aiGarrison: { infantry: 10, archer: 5 }, siegeBy: null, neighbors: [10, 11, 4, 18], buildings: [], income: 2, support: { player: 30, ai: 50, werewolf: 20 }, population: 2000, slaveIncome: 0, fortification: 0, terrain: 'mountains', terrainBonus: 5, loyalty: 50 },
            { id: 26, name: 'Балканы', owner: 'ai', x: 600, y: 380, aiGarrison: { infantry: 8 }, siegeBy: null, neighbors: [5, 11, 25], buildings: [], income: 2, support: { player: 40, ai: 40, werewolf: 20 }, population: 1500, slaveIncome: 0, fortification: 0, terrain: 'plains', terrainBonus: 0, loyalty: 60 },
            { id: 27, name: 'Трансильвания-Восток', owner: 'ai', x: 490, y: 230, aiGarrison: { infantry: 8 }, siegeBy: null, neighbors: [3, 18, 21, 8], buildings: [], income: 1, support: { player: 30, ai: 60, werewolf: 10 }, population: 1500, slaveIncome: 0, fortification: 0, terrain: 'plains', terrainBonus: 0, loyalty: 60 },
            { id: 28, name: 'Словакия', owner: 'ai', x: 450, y: 150, aiGarrison: { infantry: 8 }, siegeBy: null, neighbors: [3, 14, 20, 27], buildings: [], income: 1, support: { player: 20, ai: 70, werewolf: 10 }, population: 1500, slaveIncome: 0, fortification: 0, terrain: 'plains', terrainBonus: 0, loyalty: 70 },
            { id: 30, name: 'Франция', owner: 'ai', x: 170, y: 180, aiGarrison: { infantry: 20 }, siegeBy: null, neighbors: [31, 32, 1, 33, 34], buildings: [{type:'church', lvl:1}], income: 4, support: { player: 10, ai: 80, werewolf: 10 }, population: 3000, slaveIncome: 0, fortification: 2, terrain: 'plains', terrainBonus: 0, loyalty: 80 },
            { id: 31, name: 'Бретань', owner: 'ai', x: 110, y: 160, aiGarrison: { infantry: 10 }, siegeBy: null, neighbors: [30, 33, 36], buildings: [], income: 2, support: { player: 15, ai: 75, werewolf: 10 }, population: 2000, slaveIncome: 0, fortification: 0, terrain: 'plains', terrainBonus: 0, loyalty: 60 },
            { id: 32, name: 'Бургундия', owner: 'ai', x: 220, y: 210, aiGarrison: { infantry: 12 }, siegeBy: null, neighbors: [30, 16, 1], buildings: [], income: 2, support: { player: 20, ai: 70, werewolf: 10 }, population: 2000, slaveIncome: 0, fortification: 1, terrain: 'plains', terrainBonus: 0, loyalty: 70 },
            { id: 33, name: 'Аквитания', owner: 'ai', x: 150, y: 250, aiGarrison: { infantry: 12 }, siegeBy: null, neighbors: [30, 31, 34], buildings: [], income: 2, support: { player: 20, ai: 70, werewolf: 10 }, population: 2000, slaveIncome: 0, fortification: 1, terrain: 'plains', terrainBonus: 0, loyalty: 70 },
            { id: 34, name: 'Испания', owner: 'ai', x: 130, y: 330, aiGarrison: { infantry: 15, cavalry: 5 }, siegeBy: null, neighbors: [30, 33, 36, 37], buildings: [{type:'church', lvl:1}], income: 3, support: { player: 10, ai: 80, werewolf: 10 }, population: 2500, slaveIncome: 0, fortification: 2, terrain: 'plains', terrainBonus: 0, loyalty: 80 },
            { id: 36, name: 'Португалия', owner: 'ai', x: 80, y: 300, aiGarrison: { infantry: 10 }, siegeBy: null, neighbors: [31, 34, 37], buildings: [], income: 2, support: { player: 20, ai: 70, werewolf: 10 }, population: 1500, slaveIncome: 0, fortification: 0, terrain: 'plains', terrainBonus: 0, loyalty: 70 },
            { id: 37, name: 'Англия', owner: 'ai', x: 70, y: 130, aiGarrison: { infantry: 15, archer: 5 }, siegeBy: null, neighbors: [36, 40], buildings: [{type:'church', lvl:1}], income: 4, support: { player: 10, ai: 80, werewolf: 10 }, population: 3000, slaveIncome: 0, fortification: 2, terrain: 'plains', terrainBonus: 0, loyalty: 80 },
            { id: 38, name: 'Шотландия', owner: 'ai', x: 60, y: 70, aiGarrison: { infantry: 10 }, siegeBy: null, neighbors: [37], buildings: [], income: 2, support: { player: 15, ai: 75, werewolf: 10 }, population: 2000, slaveIncome: 0, fortification: 1, terrain: 'plains', terrainBonus: 0, loyalty: 70 },
            { id: 39, name: 'Ирландия', owner: 'ai', x: 20, y: 110, aiGarrison: { infantry: 8 }, siegeBy: null, neighbors: [37], buildings: [], income: 1, support: { player: 20, ai: 70, werewolf: 10 }, population: 1500, slaveIncome: 0, fortification: 0, terrain: 'plains', terrainBonus: 0, loyalty: 60 },
            { id: 40, name: 'Дания', owner: 'ai', x: 270, y: 30, aiGarrison: { infantry: 10 }, siegeBy: null, neighbors: [39, 41, 14, 23], buildings: [], income: 2, support: { player: 15, ai: 75, werewolf: 10 }, population: 2000, slaveIncome: 0, fortification: 0, terrain: 'plains', terrainBonus: 0, loyalty: 70 },
            { id: 41, name: 'Швеция', owner: 'ai', x: 260, y: -10, aiGarrison: { infantry: 15 }, siegeBy: null, neighbors: [40, 42], buildings: [], income: 2, support: { player: 15, ai: 75, werewolf: 10 }, population: 2000, slaveIncome: 0, fortification: 0, terrain: 'plains', terrainBonus: 0, loyalty: 70 },
            { id: 42, name: 'Норвегия', owner: 'ai', x: 180, y: -20, aiGarrison: { infantry: 10 }, siegeBy: null, neighbors: [41, 39], buildings: [], income: 2, support: { player: 15, ai: 75, werewolf: 10 }, population: 1500, slaveIncome: 0, fortification: 0, terrain: 'plains', terrainBonus: 0, loyalty: 70 },
            { id: 43, name: 'Финляндия', owner: 'ai', x: 410, y: -10, aiGarrison: { infantry: 5 }, siegeBy: null, neighbors: [41, 35], buildings: [], income: 1, support: { player: 20, ai: 70, werewolf: 10 }, population: 1000, slaveIncome: 0, fortification: 0, terrain: 'plains', terrainBonus: 0, loyalty: 60 },
            { id: 44, name: 'Прибалтика', owner: 'ai', x: 460, y: 40, aiGarrison: { infantry: 8 }, siegeBy: null, neighbors: [35, 14, 23], buildings: [], income: 1, support: { player: 20, ai: 70, werewolf: 10 }, population: 1500, slaveIncome: 0, fortification: 0, terrain: 'plains', terrainBonus: 0, loyalty: 70 },
            { id: 45, name: 'Северные земли', owner: 'werewolf', x: 560, y: -20, aiGarrison: { infantry: 10, cavalry: 3 }, siegeBy: null, neighbors: [22, 41, 35], buildings: [], income: 1, support: { player: 10, ai: 10, werewolf: 80 }, population: 1500, slaveIncome: 0, fortification: 0, terrain: 'forest', terrainBonus: 2, loyalty: 60 },
        ]
    };
}
let game = getDefaultGame();
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const fogCanvas = document.getElementById('fog-canvas');
const fogCtx = fogCanvas.getContext('2d');

// ================= ТУМАН ВОЙНЫ =================
let fogParticles = [];
for(let i=0; i<35; i++) {
    fogParticles.push({
        x: Math.random() * 680, y: Math.random() * 550,
        r: 40 + Math.random() * 80,
        dx: (Math.random() - 0.5) * 0.4, dy: (Math.random() - 0.5) * 0.4
    });
}
function drawFog() {
    fogCtx.clearRect(0, 0, 680, 550);
    fogParticles.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if(p.x < -100) p.x = 780; if(p.x > 780) p.x = -100;
        if(p.y < -100) p.y = 650; if(p.y > 650) p.y = -100;
        let gradient = fogCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        gradient.addColorStop(0, 'rgba(20, 25, 40, 0.5)');
        gradient.addColorStop(0.6, 'rgba(5, 6, 8, 0.7)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        fogCtx.fillStyle = gradient;
        fogCtx.beginPath();
        fogCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        fogCtx.fill();
    });
    requestAnimationFrame(drawFog);
}
drawFog();

// ================= ФУНКЦИЯ ЗАПУСКА МУЗЫКИ =================
function playBackgroundMusic() {
    const bgm = document.getElementById('bgm');
    if (bgm) { bgm.volume = 0.4; bgm.load(); bgm.play().catch(e => { console.warn("⚠️ Браузер заблокировал фоновую музыку:", e.message); }); }
}

// ================= ТУТОРИАЛ =================
function advanceTutorial(step) {
    if (step === 0 && game.tutorialStep === 0) {
        game.tutorialStep = 1;
        setTimeout(() => showTutorialStep(1), 100);
    } else if (step === 1 && game.tutorialStep === 1) {
        game.tutorialStep = 2;
        setTimeout(() => showTutorialStep(2), 100);
    } else if (step === 2 && game.tutorialStep === 2) {
        game.tutorialStep = 3;
        setTimeout(() => showTutorialStep(3), 100);
    } else if (step === 3 && game.tutorialStep === 3) {
        game.tutorialStep = 4;
        showTutorialStep(4);
    }
}
function showTutorialStep(step) {
    const modal = document.getElementById('tutorial-modal');
    const title = document.getElementById('tutorial-title');
    const desc = document.getElementById('tutorial-desc');
    const btn = document.getElementById('btn-tutorial-next');
    btn.style.display = 'block';

    if (step === 0) {
        title.textContent = "🦇 ДОБРО ПОЖАЛОВАТЬ, КНЯЗЬ ТЬМЫ!";
        desc.innerHTML = "Ваша цель — захватить Европу. Но для начала вам нужно усилить армию.<br><br>1. Откройте меню <b>«СТРОИТЬ»</b>.<br>2. Нажмите <b>«Храм Тьмы»</b> в Трансильвании.<br>Храм откроет вам доступ к найму Верховных Лордов.";
        btn.onclick = () => { modal.style.display = 'none'; };
        modal.style.display = 'flex';
    } else if (step === 1) {
        title.textContent = "🕯️ ХРАМ ВОЗВЕДЕН!";
        desc.innerHTML = "Отлично! Лорды — ваша ключевая сила для командования армией.<br><br>Теперь откройте меню <b>«ПРИЗВАТЬ»</b> и наймите первого <b>Лорда</b> за 10 золота.";
        btn.onclick = () => { modal.style.display = 'none'; };
        modal.style.display = 'flex';
    } else if (step === 2) {
        title.textContent = "🧛 ЛОРД ПРИЗВАН!";
        desc.innerHTML = "Ваш Лорд готов к битве!<br><br>Сейчас <b>НОЧЬ</b>. Кликните на соседнюю вражескую провинцию и выберите <b>«АТАКОВАТЬ»</b>.";
        btn.onclick = () => { modal.style.display = 'none'; };
        modal.style.display = 'flex';
    } else if (step === 3) {
        title.textContent = "⚔️ ПЕРВАЯ ПОБЕДА БЛИЗКО!";
        desc.innerHTML = "Помните: <b>ночью</b> вы сильны, а <b>днем</b> вампиры не могут атаковать.<br><br>Стройте Замки для обороны и обращайте жителей в слуг тьмы.";
        btn.onclick = () => {
            modal.style.display = 'none';
            game.tutorialStep = 4;
            btn.style.display = 'none';
        };
        modal.style.display = 'flex';
    } else if (step === 4) {
        modal.style.display = 'none';
        document.getElementById('btn-tutorial-next').style.display = 'none';
    }
}

// ================= СТАРТОВОЕ МЕНЮ =================
function initGame() {
    document.getElementById('start-menu').style.display = 'none';
    document.getElementById('game-container').style.display = 'flex';
    if (!loadGame()) { 
        game = getDefaultGame(); 
        for(let i=0; i<5; i++) { addNewLordToPlayer(); }
        setTimeout(() => showTutorialStep(0), 500);
    } else {
        if (game.tutorialStep < 4) game.tutorialStep = 4;
    }
    playBackgroundMusic();
    updateUI(); log('🦇 Дракула пробудился! Европа ждёт завоевателя.', 'system');
}
function restartGame() {
    const bgm = document.getElementById('bgm');
    if (bgm) { bgm.pause(); bgm.currentTime = 0; }
    localStorage.removeItem('VampireWarSave');
    game = getDefaultGame(); 
    game.gameOver = false; 
    document.getElementById('gameover-modal').style.display = 'none';
    document.querySelectorAll('.action-btn, .sub-btn').forEach(btn => btn.disabled = false);
    document.getElementById('start-menu').style.display = 'flex';
    document.getElementById('game-container').style.display = 'none';
    log('🔄 Дракула возвращается в тень. Перерождение...', 'system');
    updateUI();
}
function saveGame() { try { localStorage.setItem('VampireWarSave', JSON.stringify(game)); } catch (e) {} }
function loadGame() {
    try {
        const saved = localStorage.getItem('VampireWarSave');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.provinces && parsed.provinces.length === game.provinces.length) {
                game = parsed; return true;
            } else { localStorage.removeItem('VampireWarSave'); }
        }
    } catch (e) { console.error("Ошибка загрузки сохранения:", e); }
    return false;
}
function getTotalTroops(armyObj) { return (armyObj.infantry || 0) + (armyObj.archer || 0) + (armyObj.cavalry || 0); }
function log(msg, type = 'system') {
    const container = document.getElementById('log-container');
    if (!container) return;
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    if (type === 'ai') { const d = ["Ватикан: Еретики сгорят!", "Ватикан: Господь с нами!"]; msg = d[Math.floor(Math.random() * d.length)] + " " + msg; } 
    else if (type === 'werewolf') { const d = ["Оборотни: Полнолуние близко!", "Оборотни: Кровь зовёт!"]; msg = d[Math.floor(Math.random() * d.length)] + " " + msg; }
    entry.textContent = msg;
    container.appendChild(entry); container.scrollTop = container.scrollHeight;
}
function ensureArmyLocation() {
    let locProv = game.provinces.find(p => p.id === game.player.mobileArmy.location);
    if (!locProv || locProv.owner !== 'player') {
        let fallback = game.provinces.find(p => p.owner === 'player');
        if (fallback) { game.player.mobileArmy.location = fallback.id; } 
    }
}
function isNightTime() { return game.turn % 2 !== 0; }
function getRandomLordName() { return LORD_NAMES[Math.floor(Math.random() * LORD_NAMES.length)]; }
function addNewLordToPlayer() {
    const name = getRandomLordName();
    game.player.lords.push({ name: name, battles: 0 });
    log(`🧛 Лорд "${name}" примкнул к вашей армии!`, 'player');
}
function getLordBonus() {
    let attackBonus = 0;
    game.player.lords.forEach(l => {
        if (l.battles >= 2 && l.battles < 5) attackBonus += 0.1;
        else if (l.battles >= 5) attackBonus += 0.2;
    });
    return attackBonus;
}
function processLordsAfterBattle(isVictory, isAttacker) {
    if (!isAttacker) return;
    let aliveLords = [];
    game.player.lords.forEach(l => {
        if (isVictory) {
            l.battles += 1;
            aliveLords.push(l);
        } else {
            log(`💀 Лорд "${l.name}" погиб в бою!`, 'player');
        }
    });
    game.player.lords = aliveLords;
}
function calcArmyPower(army, isPlayer) {
    let inf = army.infantry || 0, arch = army.archer || 0, cav = army.cavalry || 0;
    let totalPower = (inf * 5) + (arch * 8) + (cav * 10);
    let generalBonus = 1;
    if (isPlayer) {
        if (game.player.techs.militaryReform) generalBonus += 0.1;
        generalBonus += getLordBonus();
    } else if (!isPlayer) {
        generalBonus = 1.2;
    }
    return Math.floor(totalPower * generalBonus);
}

// ================= СБОР ДОХОДОВ =================
function collectIncome() {
    game.provinces.forEach(prov => {
        if (prov.owner === 'player') {
            let gBonus = 1, bBonus = 1, slaveBonus = (prov.slaveIncome || 0);
            prov.buildings.forEach(b => {
                if (b.type === 'feast_hall' && b.lvl === 1) bBonus += 3; if (b.type === 'feast_hall' && b.lvl === 2) bBonus += 6;
                if (b.type === 'dark_temple' && b.lvl === 1) gBonus += 2; if (b.type === 'dark_temple' && b.lvl === 2) gBonus += 5;
                if (b.type === 'dungeon') gBonus += 2; 
                if (b.type === 'wall') gBonus += 1; if (b.type === 'castle') gBonus += 3;
                if (b.type === 'cemetery' && b.lvl === 1) bBonus += 5; 
                if (b.type === 'center') bBonus += 5;
            });
            game.player.gold += prov.income + gBonus + slaveBonus; game.player.blood += 1 + bBonus;
        } else if (prov.owner === 'ai') {
            let aiGold = 1; prov.buildings.forEach(b => { if (b.type === 'church' && b.lvl === 1) aiGold += 2; if (b.type === 'church' && b.lvl === 2) aiGold += 5; if (b.type === 'fortress' && b.lvl === 1) aiGold += 3; if (b.type === 'fortress' && b.lvl === 2) aiGold += 6; if (b.type === 'wall') aiGold += 1; if (b.type === 'castle') aiGold += 3; });
            game.ai.gold += prov.income + aiGold; game.ai.faith += Math.floor(prov.population / 1000);
        } else if (prov.owner === 'werewolf') { game.werewolf.gold += prov.income + 2; }
    });
    if (game.player.hasSoulCollector) {
        game.player.gold += 50;
        log(`💀 Сборщик душ принес 50 золота.`, 'player');
    }
    updateUI();
}
function updateSupport() {
    game.provinces.forEach(p => {
        if (!p.owner) return;
        let owner = p.owner;
        if (owner === 'player') p.support.player = Math.min(100, p.support.player + 1);
        else if (owner === 'ai') p.support.ai = Math.min(100, p.support.ai + 1);
        else if (owner === 'werewolf') p.support.werewolf = Math.min(100, p.support.werewolf + 1);
        let ownerSupport = p.support[owner] || 0;
        if (ownerSupport < 20 && Math.random() < 0.2) { p.owner = null; p.playerGarrison = {}; p.aiGarrison = {}; log(`💥 Бунт в ${p.name}!`, 'system'); checkGameConditions(); }
    });
}
function executeArmyBattle(attackerSide, targetSide) {
    if (game.armyBattleActive) return; game.armyBattleActive = true;
    let attIsPlayer = attackerSide === 'player'; let targetIsAI = targetSide === 'ai';
    let attackerArmy = game.player.mobileArmy; let targetArmy = targetIsAI ? game.ai.mobileArmy : game.werewolf.mobileArmy;
    let attackerLosses = Math.floor(Math.random() * 16) + 10; let defenderLosses = Math.floor(Math.random() * 11) + 5;
    let totalAtt = getTotalTroops(attackerArmy); let totalDef = getTotalTroops(targetArmy);
    let units = ['infantry', 'archer', 'cavalry'];
    if (totalAtt > 0) { let attLeft = attackerLosses; units.forEach(type => { let count = attackerArmy[type] || 0; let take = Math.floor(attackerLosses * (count / totalAtt)); take = Math.min(take, count); attackerArmy[type] = Math.max(0, count - take); attLeft -= take; }); if (attLeft > 0 && totalAtt > 0) { let inf = attackerArmy.infantry || 0; attackerArmy.infantry = Math.max(0, inf - attLeft); } }
    if (totalDef > 0) { let defLeft = defenderLosses; units.forEach(type => { let count = targetArmy[type] || 0; let take = Math.floor(defenderLosses * (count / totalDef)); take = Math.min(take, count); targetArmy[type] = Math.max(0, count - take); defLeft -= take; }); if (defLeft > 0 && totalDef > 0) { let inf = targetArmy.infantry || 0; targetArmy.infantry = Math.max(0, inf - defLeft); } }
    let isVictory = getTotalTroops(targetArmy) <= 0; processLordsAfterBattle(isVictory, true);
    if (isVictory) { targetArmy.infantry = 0; targetArmy.archer = 0; targetArmy.cavalry = 0; if (targetIsAI) game.ai.generals.inquisitor = 0; else game.werewolf.generals.alpha = 0; let fallback = game.provinces.find(p => p.owner === targetSide); if (fallback) { targetArmy.location = fallback.id; } else { targetArmy.location = -1; } } 
    else { let fallback = game.provinces.find(p => p.owner === 'player'); if (fallback) { game.player.mobileArmy.location = fallback.id; } else { gameOver('ai'); } }
    document.getElementById('army-battle-result').textContent = isVictory ? "🏆 Победа! Вражеская армия уничтожена!" : "⛔ Вы отступили.";
    document.getElementById('btn-attack-army').disabled = true; document.getElementById('btn-retreat-army').disabled = true;
    game.armyBattleActive = false; checkGameConditions(); updateUI();
}
function checkCaptureRequirements(attackerSide, targetProv) {
    let attIsPlayer = attackerSide === 'player'; 
    let army = attIsPlayer ? game.player.mobileArmy : (attackerSide === 'ai' ? game.ai.mobileArmy : game.werewolf.mobileArmy);
    let totalTroops = getTotalTroops(army);
    let elites = attIsPlayer ? game.player.lords.length : (attackerSide === 'ai' ? game.ai.generals.inquisitor : game.werewolf.generals.alpha);
    if (totalTroops < 1) return log('❌ В армии нет войск!', 'system') && false;
    if (elites < 1) {
        log(`❌ У вас нет Лордов для командования штурмом! Постройте Храм Тьмы или наймите Лорда за 10 золота.`, attIsPlayer ? 'player' : 'system');
        return false;
    }
    return true;
}
function executeBattle(attackerSide, targetProv) {
    if (game.battleActive) return;
    if (!isNightTime() && (attackerSide === 'player' || attackerSide === 'werewolf')) { log('☀️ Сейчас день! Вампиры и Оборотни не могут атаковать.', attackerSide === 'player' ? 'player' : 'werewolf'); return; }
    if (!checkCaptureRequirements(attackerSide, targetProv)) { if (attackerSide === 'player') { let fallback = game.provinces.find(p => p.owner === 'player'); if (fallback) { game.player.mobileArmy.location = fallback.id; log(`🧛 Армия отступила в ${fallback.name}.`, 'player'); } updateUI(); return; } }
    game.battleActive = true; let attIsPlayer = attackerSide === 'player'; let attIsAI = attackerSide === 'ai';
    let attackerArmy = attIsPlayer ? game.player.mobileArmy : (attIsAI ? game.ai.mobileArmy : game.werewolf.mobileArmy);
    let attackerLosses = Math.floor(Math.random() * 16) + 10; let defenderLosses = Math.floor(Math.random() * 11) + 5;
    let totalAtt = getTotalTroops(attackerArmy); let defenderGarrison = targetProv.owner === 'player' ? targetProv.playerGarrison : (targetProv.owner === 'ai' ? targetProv.aiGarrison : null);
    let totalDef = getTotalTroops(defenderGarrison || {}) + targetProv.fortification * 5 + (targetProv.terrainBonus || 0);
    let units = ['infantry', 'archer', 'cavalry'];
    if (totalAtt > 0) { let attLeft = attackerLosses; units.forEach(type => { let count = attackerArmy[type] || 0; let take = Math.floor(attackerLosses * (count / totalAtt)); take = Math.min(take, count); attackerArmy[type] = Math.max(0, count - take); attLeft -= take; }); if (attLeft > 0 && totalAtt > 0) { let inf = attackerArmy.infantry || 0; attackerArmy.infantry = Math.max(0, inf - attLeft); } }
    if (defenderGarrison && totalDef > 0) { let defLeft = defenderLosses; units.forEach(type => { let count = defenderGarrison[type] || 0; let take = Math.floor(defenderLosses * (count / totalDef)); take = Math.min(take, count); defenderGarrison[type] = Math.max(0, count - take); defLeft -= take; }); if (defLeft > 0 && totalDef > 0) { let inf = defenderGarrison.infantry || 0; defenderGarrison.infantry = Math.max(0, inf - defLeft); } }
    let newDefTotal = getTotalTroops(defenderGarrison || {});
    if (attIsPlayer && game.player.techs.necromancy && defenderLosses > 0) { game.player.blood += Math.floor(defenderLosses / 2); log(`💀 Некромантия: +${Math.floor(defenderLosses / 2)} крови от павших врагов.`, 'player'); }
    let isVictory = newDefTotal <= 0; processLordsAfterBattle(isVictory, attIsPlayer);
    if (isVictory) { log(`🏰 Провинция ${targetProv.name} захвачена!`, attIsPlayer ? 'player' : (attIsAI ? 'ai' : 'werewolf')); targetProv.owner = attackerSide; targetProv.siegeBy = null; targetProv.aiGarrison = {}; targetProv.playerGarrison = {}; let remainingTroops = getTotalTroops(attackerArmy); let transfer = Math.floor(remainingTroops / 2); let tempGarrison = { infantry: transfer, archer: 0, cavalry: 0 }; if (attIsPlayer) { targetProv.playerGarrison = tempGarrison; game.player.mobileArmy.infantry = Math.max(0, game.player.mobileArmy.infantry - transfer); game.player.mobileArmy.location = targetProv.id; } else if (attIsAI) { targetProv.aiGarrison = tempGarrison; game.ai.mobileArmy.infantry = Math.max(0, game.ai.mobileArmy.infantry - transfer); game.ai.mobileArmy.location = targetProv.id; } else { targetProv.aiGarrison = tempGarrison; game.werewolf.mobileArmy.infantry = Math.max(0, game.werewolf.mobileArmy.infantry - transfer); game.werewolf.mobileArmy.location = targetProv.id; } game.battleActive = false; if (attIsPlayer) showSurrenderModal(targetProv); else { checkGameConditions(); updateUI(); } } 
    else { log(`🛡️ Атака отбита!`, 'system'); game.battleActive = false; checkGameConditions(); updateUI(); if (attIsPlayer && getTotalTroops(game.player.mobileArmy) === 0) { let fallback = game.provinces.find(p => p.owner === 'player'); if (fallback) { game.player.mobileArmy.location = fallback.id; log(`🧟 Армия уничтожена! Вернулись в ${fallback.name}.`, 'player'); } else { gameOver('ai'); } } }
}
function showSurrenderModal(prov) {
    if (game.surrenderActive) return;
    game.surrenderActive = true;
    document.getElementById('surrender-modal').style.display = 'flex';
    const r = document.getElementById('surrender-result');
    r.textContent = "";
    document.getElementById('btn-exterminate').onclick = () => { 
        game.player.gold += 1500; game.player.blood += 800; 
        prov.loyalty = 5; prov.population -= 2000; 
        log(`💀 Истребление! +1500 золота, +800 крови. Население сократилось, лояльность упала.`, 'player'); 
        r.textContent = "Кровь и пепел! Ресурсы получены, но земля опустела."; closeSurrenderModal(); 
    };
    document.getElementById('btn-enslave').onclick = () => { 
        game.player.gold += 500; game.player.blood += 200; 
        prov.loyalty = 50; prov.slaveIncome = 2; 
        if (!prov.playerGarrison) prov.playerGarrison = { infantry:0, archer:0, cavalry:0 }; 
        prov.playerGarrison.infantry += 10; 
        log(`⛓️ Порабощение! +500 золота, +200 крови. Гарнизон пополнен +10, лояльность высокая.`, 'player'); 
        r.textContent = "Рабы пополнили ряды гарнизона. Лояльность сохранена."; closeSurrenderModal(); 
    };
    document.getElementById('btn-convert').onclick = () => { 
        prov.loyalty += 20; 
        if (!prov.playerGarrison) prov.playerGarrison = { infantry:0, archer:0, cavalry:0 }; 
        prov.playerGarrison.infantry += 10; prov.population = Math.floor(prov.population * 1.2); 
        log(`🧛 Обращение! +20 лояльности, +10 гарнизона.`, 'player'); 
        r.textContent = "Новые слуги тьмы!"; closeSurrenderModal(); 
    }; updateUI();
}
function closeSurrenderModal() { document.getElementById('surrender-modal').style.display = 'none'; game.surrenderActive = false; checkGameConditions(); updateUI(); }
function getTargetProvForAction() {
    let prov = game.provinces.find(p => p.id === game.selectedProvinceId);
    if (prov && prov.owner === 'player') return prov;
    prov = game.provinces.find(p => p.id === game.player.mobileArmy.location);
    if (prov && prov.owner === 'player') return prov;
    return null;
}

// ================= НОВЫЕ СТРОЙКИ И ЮНИТЫ =================
function buildStructure(type) {
    if (!canAct()) return; const prov = getTargetProvForAction(); if (!prov) return log('❌ Кликните на свою провинцию на карте, чтобы выбрать её.', 'system'); let cost = 0, name = "", lvl = 1;
    if (type === 'dark_temple') { cost = 20; name = 'Храм Тьмы'; } else if (type === 'barracks') { cost = 20; name = 'Казармы Lv1'; } else if (type === 'barracks_lv2') { cost = 50; name = 'Казармы Lv2'; lvl = 2; } else if (type === 'cemetery') { cost = 30; name = 'Кладбище'; } else if (type === 'dungeon') { cost = 15; name = 'Тюрьма'; } else if (type === 'executions') { cost = 10; name = 'Казни'; } else if (type === 'ball') { cost = 30; name = 'Бал Вампиров'; } else if (type === 'center') { cost = 25; name = 'Центр Обращения'; } else if (type === 'citadel') { cost = 40; name = 'Цитадель'; } else if (type === 'wall') { cost = 10; name = 'Стены'; } else if (type === 'castle') { cost = 40; name = 'Замок'; } else if (type === 'market') { cost = 20; name = 'Рынок'; } else { return log(`❌ Неизвестная постройка.`, 'system'); }
    if (game.player.gold < cost) return log(`❌ Нужно ${cost} золота.`, 'system');
    if (type === 'wall') { if (prov.buildings.find(b => b.type === 'wall')) return log(`❌ Стены уже построены.`, 'system'); }
    else if (type === 'castle') { if (prov.buildings.find(b => b.type === 'castle')) return log(`❌ Замок уже построен.`, 'system'); }
    else if (type === 'citadel') { if (prov.buildings.find(b => b.type === 'citadel')) return log(`❌ Цитадель уже построена.`, 'system'); }
    else if (type === 'barracks_lv2') { 
        const existing = prov.buildings.find(b => b.type === 'barracks'); 
        if (!existing) return log(`❌ Сначала постройте Казармы Lv1!`, 'system'); 
        if (existing.lvl === 2) return log(`❌ Уже есть Lv2.`, 'system'); 
        existing.lvl = 2; 
        game.player.gold -= cost; log(`⚔️ Казармы улучшены до Lv2 в ${prov.name}!`, 'player'); 
        game.player.ap -= 1; updateUI(); return; 
    } 
    else if (type === 'barracks') { if (prov.buildings.find(b => b.type === 'barracks')) return log(`❌ Уже есть.`, 'system'); }
    else { if (prov.buildings.find(b => b.type === type)) return log(`❌ Уже есть.`, 'system'); }
    game.player.gold -= cost;
    prov.buildings.push({ type, lvl: 1 });
    if (type === 'dark_temple') { prov.loyalty = Math.min(100, prov.loyalty + 3); prov.support.player = Math.min(100, prov.support.player + 5); log(`🕯️ Храм Тьмы возведен! +5 поддержки, +3 лояльности.`, 'player'); } 
    else if (type === 'dungeon') { prov.loyalty = Math.max(0, prov.loyalty - 5); prov.support.player = Math.min(100, prov.support.player + 10); log(`⛓️ Тюрьма возведена! +10 поддержки, -5 лояльности.`, 'player'); } 
    else if (type === 'executions') { prov.loyalty = Math.max(0, prov.loyalty - 10); prov.support.player = Math.min(100, prov.support.player + 15); prov.population = Math.max(100, prov.population - 200); log(`🪓 Казни начались! +15 поддержки, -10 лояльности, -200 населения.`, 'player'); } 
    else if (type === 'ball') { prov.loyalty = Math.min(100, prov.loyalty + 5); prov.support.player = Math.min(100, prov.support.player + 20); prov.population = Math.max(100, prov.population - 200); log(`🎭 Бал Вампиров в разгаре! +20 поддержки, +5 лояльности, -200 населения.`, 'player'); } 
    else if (type === 'center') { prov.loyalty = Math.min(100, prov.loyalty + 5); prov.support.player = Math.min(100, prov.support.player + 10); prov.population = Math.min(10000, prov.population + 100); log(`🧛 Центр Обращения построен! +10 поддержки, +5 лояльности, +100 населения.`, 'player'); } 
    else if (type === 'citadel') { game.player.hasCitadel = true; log(`🏰 Цитадель построена в ${prov.name}! Открыт найм Сборщиков душ.`, 'player'); } 
    else if (type === 'wall') { prov.fortification += 1; log(`🧱 Построены Стены в ${prov.name}! Укрепления +1.`, 'player'); } 
    else if (type === 'castle') { prov.fortification += 2; prov.playerGarrison = (prov.playerGarrison || { infantry:0, archer:0, cavalry:0 }); prov.playerGarrison.infantry += 20; prov.support.player += 5; log(`🏰 Построен Замок в ${prov.name}! Укрепления +2, Гарнизон +20.`, 'player'); } 
    else if (type === 'market') { log(`🏪 Рынок построен в ${prov.name}!`, 'player'); } 
    else if (type === 'cemetery') { log(`🪦 Кладбище открыто! Даёт +5 крови в ход.`, 'player'); } 
    else if (type === 'barracks') { log(`🏗️ Построены Казармы Lv1 в ${prov.name}!`, 'player'); }
    if (type === 'dark_temple' && game.tutorialStep === 0) { advanceTutorial(0); }
    game.player.ap -= 1; updateUI();
}
function recruitTroops(type) {
    if (!canAct()) return; const prov = getTargetProvForAction(); if (!prov) return log('❌ Кликните на провинцию, чтобы выбрать место найма.', 'system');
    if (type === 'lord') {
        let hasDarkTemple = game.provinces.some(p => p.owner === 'player' && p.buildings.find(b => b.type === 'dark_temple'));
        if (!hasDarkTemple) return log('❌ Постройте Храм Тьмы (20🪙), чтобы призывать Лордов!', 'system');
        if (game.player.gold < 10) return log('❌ Нужно 10 золота для призыва Лорда.', 'system');
        game.player.gold -= 10; addNewLordToPlayer(); game.player.ap -= 1; 
        if (game.tutorialStep === 1) { advanceTutorial(1); }
        updateUI(); return;
    }
    if (type === 'soul_collector') {
        if (!game.player.hasCitadel) return log('❌ Сначала постройте Цитадель (40🪙)!', 'system');
        if (game.player.hasSoulCollector) return log('❌ Сборщик душ уже нанят.', 'system');
        if (game.player.gold < 25) return log('❌ Нужно 25 золота.', 'system');
        game.player.gold -= 25;
        game.player.hasSoulCollector = true;
        log(`💀 Сборщик душ нанят! Будет приносить 50 золота каждый ход.`, 'player');
        game.player.ap -= 1; updateUI(); return;
    }
    if (type === 'infantry' || type === 'archer' || type === 'cavalry') { let hasBarracks = prov.buildings.find(b => b.type === 'barracks'); if (!hasBarracks) return log('❌ Постройте Казармы Lv1 (20🪙) в этой провинции для найма!', 'system'); }
    if (type === 'knights') { let hasBarracksLv2 = prov.buildings.find(b => b.type === 'barracks' && b.lvl === 2); if (!hasBarracksLv2) return log('❌ Требуются Казармы Lv2 (50🪙) для призыва Рыцарей Тьмы!', 'system'); if (game.player.gold < 30) return log('❌ Нужно 30 золота для Рыцарей Тьмы.', 'system'); game.player.gold -= 30; game.player.mobileArmy.cavalry = (game.player.mobileArmy.cavalry || 0) + 2; log(`⚔️ 2 Рыцаря Тьмы призваны в армию!`, 'player'); game.player.ap -= 1; updateUI(); return; }
    const u = { infantry: { cost: 10, count: 5 }, archer: { cost: 15, count: 5 }, cavalry: { cost: 20, count: 3 } }[type]; if (game.player.gold < u.cost) return log(`❌ Нужно ${u.cost} золота.`, 'system'); game.player.gold -= u.cost;
    if (getTotalTroops(game.player.mobileArmy) === 0) { game.player.mobileArmy.location = prov.id; game.player.mobileArmy[type] = (game.player.mobileArmy[type] || 0) + u.count; log(`🧟 Возрождение армии! +${u.count} (${prov.name}).`, 'player'); } else if (prov.id === game.player.mobileArmy.location) { game.player.mobileArmy[type] = (game.player.mobileArmy[type] || 0) + u.count; log(`🧛 +${u.count} в мобильную армию (${prov.name}).`, 'player'); } else { if (!prov.playerGarrison) prov.playerGarrison = { infantry:0, archer:0, cavalry:0 }; prov.playerGarrison[type] = (prov.playerGarrison[type] || 0) + u.count; log(`🛡️ +${u.count} в гарнизон провинции ${prov.name}.`, 'player'); }
    game.player.ap -= 1; updateUI();
}
function moveTroops(amount, toGarrison = true) {
    if (!canAct()) return; const prov = game.provinces.find(p => p.id === game.player.mobileArmy.location); if (!prov || prov.owner !== 'player') return log('❌ Гарнизон управляется только там, где стоит армия.', 'system'); if (!prov.playerGarrison) prov.playerGarrison = { infantry:0, archer:0, cavalry:0 }; let mobile = game.player.mobileArmy; let garrison = prov.playerGarrison; const unitTypes = ['infantry', 'archer', 'cavalry']; let totalMobile = getTotalTroops(mobile); if (totalMobile === 0 && toGarrison) return log('❌ В армии нет войск.', 'system'); if (getTotalTroops(garrison) === 0 && !toGarrison) return log('❌ В гарнизоне нет войск.', 'system'); let remaining = amount; let srcTotal = toGarrison ? totalMobile : getTotalTroops(garrison); if (srcTotal === 0) { log('❌ Ошибка перемещения.', 'system'); return; } unitTypes.forEach(type => { let srcCount = toGarrison ? (mobile[type] || 0) : (garrison[type] || 0); let take = Math.floor(amount * (srcCount / srcTotal)); take = Math.min(take, srcCount); take = Math.min(take, remaining); if (toGarrison) { mobile[type] = Math.max(0, (mobile[type] || 0) - take); garrison[type] = (garrison[type] || 0) + take; } else { garrison[type] = Math.max(0, (garrison[type] || 0) - take); mobile[type] = (mobile[type] || 0) + take; } remaining -= take; }); log(`${toGarrison ? '⬆️' : '⬇️'} ${amount} бойцов.`, 'player'); game.player.ap -= 1; updateUI();
}
function cancelSiege() { if (!canAct()) return; const prov = game.provinces.find(p => p.id === game.player.mobileArmy.location); if (!prov || prov.siegeBy !== 'player') return log('❌ Армия не осаждает.', 'system'); prov.siegeBy = null; const pProvs = game.provinces.filter(p => p.owner === 'player'); game.player.mobileArmy.location = pProvs.length > 0 ? pProvs[0].id : 4; log(`🚩 Осада снята.`, 'player'); game.player.ap -= 1; updateUI(); }
function openDiplomacy() { if (game.gameOver) return; document.getElementById('diplomacy-info').textContent = `Золото: ${game.player.gold}`; document.getElementById('diplomacy-modal').style.display = 'flex'; }
function openMarket() { if (game.gameOver) return; document.getElementById('market-info').textContent = `Золото: ${game.player.gold}, Кровь: ${game.player.blood} | ${game.player.marketUsed ? "(Использовано)" : "(Готово)"}`; document.getElementById('market-modal').style.display = 'flex'; }
function openTech() { if (game.gameOver) return; document.getElementById('tech-info').textContent = `Золото: ${game.player.gold}`; document.getElementById('tech-modal').style.display = 'flex'; }
function closeDiplomacy() { document.getElementById('diplomacy-modal').style.display = 'none'; }
function closeMarket() { document.getElementById('market-modal').style.display = 'none'; }
function closeTech() { document.getElementById('tech-modal').style.display = 'none'; }
function endPlayerTurn() {
    if (game.gameOver || game.battleActive || game.surrenderActive || game.armyBattleActive) return;
    if (game.provinces.filter(p => p.owner === 'player').length === 0) return gameOver('ai');
    game.player.marketUsed = false;
    collectIncome(); updateSupport(); game.player.ap = game.player.maxAp;
    game.turn++; if (game.turn % 2 === 1) game.day++;
    log(`⏩ ХОД ${game.turn}. ${isNightTime() ? '🌙 НОЧЬ' : '☀️ ДЕНЬ'}.`, 'system');
    checkWeather();
    aiTurn(); saveGame(); updateUI();
}
function checkGameConditions() { if (game.gameOver) return; const pCount = game.provinces.filter(p => p.owner === 'player').length; const aiCount = game.provinces.filter(p => p.owner === 'ai').length; const wCount = game.provinces.filter(p => p.owner === 'werewolf').length; if (pCount === 0) return gameOver('ai'); if (aiCount === 0 && wCount === 0) return gameOver('player'); }
function gameOver(winner) { if (game.gameOver) return; game.gameOver = true; document.querySelectorAll('.action-btn, .sub-btn').forEach(btn => btn.disabled = true); document.getElementById('bg-layer').style.opacity = '0.8'; const modal = document.getElementById('gameover-modal'); const title = document.getElementById('gameover-title'); const desc = document.getElementById('gameover-desc'); if (winner === 'player') { title.textContent = '🏆 ДРАКУЛА ВОЦАРИЛСЯ!'; desc.textContent = 'Европа навсегда погрузилась в вечную ночь.'; } else { title.textContent = '💀 ТЬМА ОТСТУПИЛА!'; desc.textContent = 'Враги оказались слишком сильны. Попробуйте изменить тактику.'; } modal.style.display = 'flex'; saveGame(); }
function canAct() { return !game.gameOver && game.player.ap > 0 && !game.battleActive && !game.surrenderActive && !game.armyBattleActive; }

// ================= ПОГОДА =================
function checkWeather() {
    if (game.turn % 20 === 0) { startSunset(); }
    if (game.turn % 10 === 0) { game.weather.rain = true; setTimeout(() => { game.weather.rain = false; }, 8000); }
    if (game.turn % 5 === 0) { game.weather.lightning = true; setTimeout(() => { game.weather.lightning = false; }, 6000); }
}
function startSunset() {
    const overlay = document.getElementById('sunset-overlay');
    if (!overlay) return;
    overlay.style.display = 'block';
    overlay.style.opacity = '0';
    setTimeout(() => { overlay.style.opacity = '1'; }, 100);
    setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => { overlay.style.display = 'none'; }, 2000);
    }, 15000);
}
function drawWeather() {
    if (game.weather.rain) {
        ctx.strokeStyle = 'rgba(150, 180, 200, 0.3)';
        ctx.lineWidth = 1;
        for(let i=0; i<100; i++) {
            let x = Math.random() * canvas.width;
            let y = Math.random() * canvas.height;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x+4, y+15);
            ctx.stroke();
        }
    }
    if (game.weather.lightning) {
        for(let i=0; i<3; i++) {
            let startX = 100 + Math.random() * 500;
            let startY = 20;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            let prevX = startX, prevY = startY;
            for(let j=0; j<6; j++) {
                let nextX = prevX + (Math.random() - 0.5) * 70;
                let nextY = prevY + 20 + Math.random() * 40;
                ctx.lineTo(nextX, nextY);
                prevX = nextX; prevY = nextY;
            }
            ctx.stroke();
        }
    }
}

// ================= ИИ =================
function aiTurn() {
    log('⛪ Ход Ватикана...', 'ai');
    game.ai.gold += game.provinces.filter(p => p.owner === 'ai').length * 1; 
    const aiProv = game.provinces.find(p => p.id === game.ai.mobileArmy.location);
    if (game.ai.gold >= 10 && aiProv && aiProv.owner === 'ai') {
        let c = aiProv.buildings.find(b => b.type === 'church');
        if (!c) { aiProv.buildings.push({type:'church', lvl:1}); game.ai.gold-=10; game.ai.generals.inquisitor+=2; log('⛪ Церковь построена!', 'ai'); }
        else if (c.lvl === 1 && game.ai.gold >= 20) { c.lvl = 2; game.ai.gold-=20; game.ai.generals.inquisitor+=5; log('⛪ Собор построен!', 'ai'); }
    }
    let aiRecruits = 0;
    if (game.turn > 3 && aiRecruits < 2 && aiProv && aiProv.buildings.find(b => b.type === 'church')) {
        if (game.ai.gold >= 20 && aiRecruits < 2) { game.ai.mobileArmy.cavalry += 3; game.ai.gold -= 20; aiRecruits++; }
        if (game.ai.gold >= 15 && aiRecruits < 2) { game.ai.mobileArmy.archer += 5; game.ai.gold -= 15; aiRecruits++; }
        while (game.ai.gold >= 15 && aiRecruits < 2) { game.ai.mobileArmy.infantry += 5; game.ai.gold -= 10; aiRecruits++; }
    }
    log('🐺 Ход Оборотней...', 'werewolf');
    game.werewolf.gold += game.provinces.filter(p => p.owner === 'werewolf').length * 2; 
    const wProv = game.provinces.find(p => p.id === game.werewolf.mobileArmy.location);
    if (game.werewolf.gold >= 15 && wProv && wProv.owner === 'werewolf') {
        let l = wProv.buildings.find(b => b.type === 'lair');
        if (!l) { wProv.buildings.push({type:'lair', lvl:1}); game.werewolf.gold-=15; log('🐺 Логово построено!', 'werewolf'); }
        else if (l.lvl === 1 && game.werewolf.gold >= 30) { l.lvl = 2; game.werewolf.gold-=30; log('🐺 Логово улучшено!', 'werewolf'); }
    }
    let werewolfRecruits = 0;
    if (game.turn > 2 && werewolfRecruits < 2 && wProv && wProv.buildings.find(b => b.type === 'lair')) {
        if (game.werewolf.gold >= 10 && werewolfRecruits < 2) { game.werewolf.mobileArmy.infantry += 5; game.werewolf.gold -= 10; werewolfRecruits++; }
        if (game.werewolf.gold >= 15 && werewolfRecruits < 2) { game.werewolf.mobileArmy.archer += 5; game.werewolf.gold -= 15; werewolfRecruits++; }
        if (game.werewolf.gold >= 20 && werewolfRecruits < 2) { game.werewolf.mobileArmy.cavalry += 3; game.werewolf.gold -= 20; werewolfRecruits++; }
    }
    [ { obj: game.ai, name: 'Ватикан', ownerType: 'ai', prov: aiProv }, { obj: game.werewolf, name: 'Оборотни', ownerType: 'werewolf', prov: wProv } ].forEach(f => {
        if (f.prov && f.prov.owner === f.ownerType) {
            let enemies = game.provinces.filter(p => f.prov.neighbors.includes(p.id) && p.owner !== null && p.owner !== f.ownerType && (f.ownerType === 'ai' ? (p.owner === 'player' || p.owner === 'werewolf') : (p.owner === 'player' || p.owner === 'ai')));
            if (enemies.length > 0) {
                let target = enemies[0];
                if (f.ownerType === 'werewolf' && !isNightTime()) { } else {
                    if (target.siegeBy === null && getTotalTroops(f.obj.mobileArmy) > 0) {
                        target.siegeBy = f.ownerType; log(`🏰 ${f.name} начал осаду ${target.name}.`, f.ownerType === 'ai' ? 'ai' : 'werewolf');
                    } else if (target.siegeBy === f.ownerType && getTotalTroops(f.obj.mobileArmy) > 5) {
                        let aLoss = Math.floor(Math.random() * 16) + 10; let dLoss = Math.floor(Math.random() * 11) + 5;
                        let attArmy = f.obj.mobileArmy; let defGar = target.owner === 'player' ? target.playerGarrison : (target.owner === 'ai' ? target.aiGarrison : null);
                        let totalAtt = getTotalTroops(attArmy); let units = ['infantry', 'archer', 'cavalry'];
                        units.forEach(type => { let c = attArmy[type] || 0; let take = Math.floor(aLoss * (c / (totalAtt + 1))); take = Math.min(take, c); attArmy[type] = Math.max(0, c - take); });
                        let totalDef = getTotalTroops(defGar || {}) + target.fortification * 5 + (target.terrainBonus || 0);
                        units.forEach(type => { let c = defGar && defGar[type] || 0; let take = Math.floor(dLoss * (c / (totalDef + 1))); take = Math.min(take, c); if (defGar) defGar[type] = Math.max(0, c - take); });
                        if (getTotalTroops(defGar || {}) <= 0) {
                            target.owner = f.ownerType;
                            if (game.player.mobileArmy.location === target.id) { let fallback = game.provinces.find(p => p.owner === 'player'); if (fallback) { game.player.mobileArmy.location = fallback.id; log(`🧛 Ваша армия отступила из ${target.name} в ${fallback.name}.`, 'player'); } else { gameOver('ai'); } }
                            target.aiGarrison = { infantry: Math.floor(getTotalTroops(attArmy)/2), archer: 0, cavalry: 0 }; target.siegeBy = null; f.obj.mobileArmy.infantry = Math.floor(f.obj.mobileArmy.infantry / 2); f.obj.mobileArmy.location = target.id;
                            log(`🏰 ${f.name} захватил ${target.name}!`, f.ownerType === 'ai' ? 'ai' : 'werewolf');
                        } else { if (f.ownerType === 'ai' && game.ai.generals.inquisitor > 0) game.ai.generals.inquisitor -= 1; else if (f.ownerType === 'werewolf' && game.werewolf.generals.alpha > 0) game.werewolf.generals.alpha -= 1; log(`🛡️ ${f.name} отбит!`, f.ownerType === 'ai' ? 'ai' : 'werewolf'); }
                    }
                }
            } else {
                let frontier = game.provinces.find(p => p.owner !== f.ownerType && p.owner !== null && p.neighbors.some(id => game.provinces.find(pr => pr.id === id && pr.owner === f.ownerType)));
                if (frontier) { let moveToId = frontier.neighbors.find(id => game.provinces.find(p => p.id === id && p.owner === f.ownerType)); if (moveToId) f.obj.mobileArmy.location = moveToId; }
            }
        }
    });
    game.ai.faith += 3; checkGameConditions(); updateUI();
}

// ================= ОТРИСОВКА КАРТЫ =================
function drawMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let isNight = isNightTime();
    
    const playerVisible = []; game.provinces.forEach(p => { if (p.owner === 'player') { playerVisible.push(p.id); p.neighbors.forEach(n => playerVisible.push(n)); } });
    const currArmyProv = game.provinces.find(p => p.id === game.player.mobileArmy.location);

    game.provinces.forEach(p => {
        const isVis = !game.fogOfWar || playerVisible.includes(p.id) || p.owner === 'player';
        ctx.beginPath(); const s = 45;
        for (let i=0; i<6; i++) { let a = Math.PI/3 * i - Math.PI/6; let x = p.x + s * Math.cos(a), y = p.y + s * Math.sin(a); if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); }
        ctx.closePath(); 
        if (!isVis) { ctx.fillStyle='#050508'; ctx.strokeStyle='#050508'; ctx.fill(); ctx.stroke(); return; }

        let baseColor = p.owner === 'player' ? (isNight ? '#101728' : '#1a2440') : (p.owner === 'ai' ? (isNight ? '#0f0f12' : '#1a1a20') : (p.owner === 'werewolf' ? (isNight ? '#0a1a10' : '#0f2015') : '#08080a'));
        let gradient = ctx.createRadialGradient(p.x, p.y, 5, p.x, p.y, s);
        gradient.addColorStop(0, '#4a5b9a30'); gradient.addColorStop(1, baseColor);
        ctx.fillStyle = gradient;
        ctx.strokeStyle = p.owner === 'player' ? '#4a5b9a' : (p.owner === 'ai' ? '#808ca0' : (p.owner === 'werewolf' ? '#3d4d3d' : '#2a2a2a'));
        ctx.fill(); ctx.stroke();

        if (currArmyProv && currArmyProv.neighbors.includes(p.id) && p.id !== game.player.mobileArmy.location) { ctx.fillStyle = '#4a5b9a40'; ctx.fill(); ctx.strokeStyle = '#8da3d4'; ctx.lineWidth = 3; ctx.setLineDash([5, 5]); ctx.stroke(); ctx.lineWidth = 1; ctx.setLineDash([]); }

        ctx.fillStyle = '#b8c0d0'; ctx.font = 'bold 11px Cinzel'; ctx.textAlign = 'center'; ctx.fillText(p.name, p.x, p.y-20);
        ctx.fillStyle = '#808ca0'; ctx.font = '9px Cinzel'; ctx.fillText(`🧛${Math.round(p.support.player)}% ⛪${Math.round(p.support.ai)}%`, p.x, p.y-5); ctx.fillText(`🐺${Math.round(p.support.werewolf)}%`, p.x, p.y+7);
        let g = p.owner === 'player' ? p.playerGarrison : p.aiGarrison; let gCount = getTotalTroops(g || {}); if (gCount > 0) ctx.fillText(`🛡️Гарн:${gCount}`, p.x, p.y+20);
        if (p.fortification > 0) { ctx.fillStyle = '#4a5b9a'; ctx.font = '8px monospace'; ctx.fillText("▓".repeat(Math.min(p.fortification, 5)), p.x - 15, p.y+30); }
        if (p.id === game.selectedProvinceId && p.owner === 'player') { ctx.strokeStyle = '#4a5b9a'; ctx.lineWidth = 4; ctx.setLineDash([3, 3]); ctx.strokeRect(p.x - 45, p.y - 45, 90, 90); ctx.setLineDash([]); ctx.lineWidth = 1; }
        if (p.siegeBy === 'player') { ctx.strokeStyle='#4a5b9a'; ctx.lineWidth=3; ctx.setLineDash([5,5]); ctx.strokeRect(p.x-40,p.y-40,80,80); ctx.setLineDash([]); ctx.lineWidth=1; }
        else if (p.siegeBy === 'ai') { ctx.strokeStyle='#808ca0'; ctx.lineWidth=3; ctx.setLineDash([5,5]); ctx.strokeRect(p.x-40,p.y-40,80,80); ctx.setLineDash([]); ctx.lineWidth=1; }
        else if (p.siegeBy === 'werewolf') { ctx.strokeStyle='#3d4d3d'; ctx.lineWidth=3; ctx.setLineDash([5,5]); ctx.strokeRect(p.x-40,p.y-40,80,80); ctx.setLineDash([]); ctx.lineWidth=1; }
    });

    const pProv = game.provinces.find(p => p.id === game.player.mobileArmy.location);
    const aProv = game.provinces.find(p => p.id === game.ai.mobileArmy.location);
    const wProv = game.provinces.find(p => p.id === game.werewolf.mobileArmy.location);
    let pOff = 0, aOff = 0, wOff = 0;
    if (pProv && aProv && pProv.id === aProv.id) { pOff = -20; aOff = 20; }
    if (pProv && wProv && pProv.id === wProv.id) { pOff = -20; wOff = 20; }
    if (aProv && wProv && aProv.id === wProv.id) { aOff = -20; wOff = 20; }
    
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'; ctx.shadowBlur = 10;
    if (pProv && getTotalTroops(game.player.mobileArmy) > 0) {
        if (sprites.player.complete && sprites.player.naturalWidth > 0) { ctx.save(); ctx.beginPath(); ctx.arc(pProv.x + pOff, pProv.y - 15, 20, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(sprites.player, pProv.x + pOff - 20, pProv.y - 45, 40, 60); ctx.restore(); } else { ctx.fillStyle='#1a2440'; ctx.beginPath(); ctx.arc(pProv.x + pOff, pProv.y, 15, 0, Math.PI*2); ctx.fill(); }
        ctx.fillStyle='#b8c0d0'; ctx.font='bold 10px Cinzel'; ctx.fillText(`🧛 ${getTotalTroops(game.player.mobileArmy)}`, pProv.x + pOff, pProv.y-48);
        if (game.player.lords.length > 0) {
            if (sprites.highVampire.complete && sprites.highVampire.naturalWidth > 0) { ctx.save(); ctx.beginPath(); ctx.arc(pProv.x + pOff, pProv.y - 55, 10, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(sprites.highVampire, pProv.x + pOff - 15, pProv.y - 65, 30, 30); ctx.restore(); } else ctx.fillText(`🧛🌟 ${game.player.lords.length}`, pProv.x + pOff - 30, pProv.y - 60);
        }
    }
    if (aProv && getTotalTroops(game.ai.mobileArmy) > 0) {
        if (sprites.ai.complete && sprites.ai.naturalWidth > 0) { ctx.save(); ctx.beginPath(); ctx.arc(aProv.x + aOff, aProv.y - 15, 20, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(sprites.ai, aProv.x + aOff - 20, aProv.y - 45, 40, 60); ctx.restore(); } else { ctx.fillStyle='#808ca0'; ctx.beginPath(); ctx.arc(aProv.x + aOff, aProv.y, 15, 0, Math.PI*2); ctx.fill(); }
        ctx.fillStyle='#d0d5e0'; ctx.font='bold 10px Cinzel'; ctx.fillText(`⛪ ${getTotalTroops(game.ai.mobileArmy)}`, aProv.x + aOff, aProv.y-48);
        if (game.ai.generals.inquisitor > 0) {
            if (sprites.inquisitor.complete && sprites.inquisitor.naturalWidth > 0) { ctx.save(); ctx.beginPath(); ctx.arc(aProv.x + aOff, aProv.y - 55, 10, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(sprites.inquisitor, aProv.x + aOff - 15, aProv.y - 65, 30, 30); ctx.restore(); } else ctx.fillText(`⚜️ ${game.ai.generals.inquisitor}`, aProv.x + aOff - 30, aProv.y - 60);
        }
    }
    if (wProv && getTotalTroops(game.werewolf.mobileArmy) > 0) {
        if (sprites.werewolf.complete && sprites.werewolf.naturalWidth > 0) { ctx.save(); ctx.beginPath(); ctx.arc(wProv.x + wOff, wProv.y - 15, 20, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(sprites.werewolf, wProv.x + wOff - 20, wProv.y - 45, 40, 60); ctx.restore(); } else { ctx.fillStyle='#3d4d3d'; ctx.beginPath(); ctx.arc(wProv.x + wOff, wProv.y, 15, 0, Math.PI*2); ctx.fill(); }
        ctx.fillStyle='#b8c0d0'; ctx.font='bold 10px Cinzel'; ctx.fillText(`🐺 ${getTotalTroops(game.werewolf.mobileArmy)}`, wProv.x + wOff, wProv.y-48);
        if (game.werewolf.generals.alpha > 0) { ctx.fillText(`⚡${game.werewolf.generals.alpha}`, wProv.x + wOff - 30, wProv.y - 60); }
    }
    ctx.shadowBlur = 0;

    // ВЫЗОВ ПОГОДЫ
    drawWeather();
}

function updateUI() {
    ensureArmyLocation();
    document.getElementById('turn-counter').textContent = game.turn;
    document.getElementById('day-counter').textContent = game.day;
    document.getElementById('ap-counter').textContent = `${game.player.ap}/${game.player.maxAp}`;
    document.getElementById('blood-counter').textContent = game.player.blood;
    document.getElementById('gold-counter').textContent = game.player.gold;
    document.getElementById('elite-counter').textContent = game.player.lords.length;
    const faithFill = document.getElementById('faith-bar-fill'); let faithPct = Math.min(100, game.ai.faith);
    faithFill.style.width = faithPct + '%'; if (faithPct >= 80) faithFill.style.background = '#4a5b9a'; else faithFill.style.background = '#808ca0';
    document.getElementById('faith-text').textContent = `${game.ai.faith} / 100`;

    const prov = game.provinces.find(p => p.id === game.player.mobileArmy.location);
    const assaultBtn = document.getElementById('btn-assault');
    if (prov && prov.siegeBy === 'player' && game.player.ap > 0 && game.player.lords.length > 0 && !game.gameOver) { assaultBtn.disabled = false; } else { assaultBtn.disabled = true; }
    drawMap();
}

// ================= ОБРАБОТЧИКИ =================
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('start-menu').style.display = 'flex';
    document.getElementById('game-container').style.display = 'none';

    document.getElementById('btn-new-game').addEventListener('click', () => { localStorage.removeItem('VampireWarSave'); game = getDefaultGame(); initGame(); });
    document.getElementById('btn-load-game').addEventListener('click', initGame);
    document.getElementById('btn-restart').addEventListener('click', () => { document.getElementById('gameover-modal').style.display = 'none'; restartGame(); });
    document.getElementById('btn-gameover-restart').addEventListener('click', restartGame);

    document.querySelectorAll('.dropdown-toggle').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const content = this.parentElement.querySelector('.dropdown-content');
            document.querySelectorAll('.dropdown-content.open').forEach(el => { if (el !== content) el.classList.remove('open'); });
            content.classList.toggle('open');
        });
    });
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-content.open').forEach(el => el.classList.remove('open'));
        }
    });

    document.getElementById('btn-music-toggle').addEventListener('click', () => {
        const bgm = document.getElementById('bgm');
        if (bgm.paused) {
            bgm.volume = 0.4;
            bgm.play();
            document.getElementById('btn-music-toggle').textContent = "🎵 ВЫКЛ";
        } else {
            bgm.pause();
            document.getElementById('btn-music-toggle').textContent = "🎵 ВКЛ";
        }
    });

    document.getElementById('btn-cancel-siege').addEventListener('click', cancelSiege);
    document.getElementById('btn-end-turn').addEventListener('click', endPlayerTurn);
    document.getElementById('btn-garrison-add').addEventListener('click', () => moveTroops(10, true));
    document.getElementById('btn-garrison-take').addEventListener('click', () => moveTroops(10, false));
    document.getElementById('recruit-inf').addEventListener('click', () => recruitTroops('infantry'));
    document.getElementById('recruit-arch').addEventListener('click', () => recruitTroops('archer'));
    document.getElementById('recruit-cav').addEventListener('click', () => recruitTroops('cavalry'));
    document.getElementById('recruit-knights').addEventListener('click', () => recruitTroops('knights'));
    document.getElementById('recruit-lord').addEventListener('click', () => recruitTroops('lord'));
    document.getElementById('recruit-soul').addEventListener('click', () => recruitTroops('soul_collector'));

    document.getElementById('build-cemetery').addEventListener('click', () => buildStructure('cemetery'));
    document.getElementById('build-barracks').addEventListener('click', () => buildStructure('barracks'));
    document.getElementById('build-barracks-2').addEventListener('click', () => buildStructure('barracks_lv2'));
    document.getElementById('build-ritual').addEventListener('click', () => buildStructure('dark_temple'));
    document.getElementById('build-dungeon').addEventListener('click', () => buildStructure('dungeon'));
    document.getElementById('build-executions').addEventListener('click', () => buildStructure('executions'));
    document.getElementById('build-ball').addEventListener('click', () => buildStructure('ball'));
    document.getElementById('build-center').addEventListener('click', () => buildStructure('center'));
    document.getElementById('build-citadel').addEventListener('click', () => buildStructure('citadel'));
    document.getElementById('build-wall').addEventListener('click', () => buildStructure('wall'));
    document.getElementById('build-castle').addEventListener('click', () => buildStructure('castle'));
    document.getElementById('build-market').addEventListener('click', () => buildStructure('market'));
    document.getElementById('army-close-btn').addEventListener('click', () => { document.getElementById('army-details-modal').style.display = 'none'; });

    document.getElementById('btn-open-diplomacy').addEventListener('click', openDiplomacy);
    document.getElementById('btn-open-market').addEventListener('click', openMarket);
    document.getElementById('btn-open-tech').addEventListener('click', openTech);
    document.getElementById('btn-clear-log').addEventListener('click', () => { document.getElementById('log-container').innerHTML = ''; });

    document.getElementById('btn-siege').addEventListener('click', () => { if (!game.pendingActionProvId) return; let prov = game.provinces.find(p => p.id === game.pendingActionProvId); if (!prov || game.player.ap === 0) return; game.player.mobileArmy.location = prov.id; prov.siegeBy = 'player'; game.player.ap -= 1; game.pendingActionProvId = null; document.getElementById('action-modal').style.display = 'none'; log(`🚩 Провинция ${prov.name} взята в осаду.`, 'player'); updateUI(); });
    document.getElementById('btn-assault-now').addEventListener('click', () => { if (!game.pendingActionProvId) return; let prov = game.provinces.find(p => p.id === game.pendingActionProvId); if (!prov || game.player.ap === 0) return; game.player.mobileArmy.location = prov.id; game.player.ap -= 1; game.pendingActionProvId = null; document.getElementById('action-modal').style.display = 'none'; executeBattle('player', prov); });
    document.getElementById('btn-assault').addEventListener('click', () => { if (!canAct()) return; const prov = game.provinces.find(p => p.id === game.player.mobileArmy.location); if (!prov || prov.siegeBy !== 'player') return log('❌ Не осаждена.', 'system'); if (game.player.lords.length < 1) return log('❌ Нужен хотя бы 1 Лорд для штурма!', 'player'); game.player.ap -= 1; executeBattle('player', prov); });

    document.getElementById('dip-truce-ai').addEventListener('click', () => {
        if (game.player.gold < 30) return log('❌ Не хватает золота для перемирия.', 'system');
        if (game.player.truceTurnsAI > 0) return log('⛔ Перемирие с Ватиканом уже активно.', 'system');
        game.player.gold -= 30; game.player.truceTurnsAI = 2;
        log(`🕊️ Перемирие с Ватиканом на 2 хода!`, 'player');
        document.getElementById('diplomacy-result').textContent = "Перемирие заключено!";
        setTimeout(closeDiplomacy, 1000); updateUI();
    });
    document.getElementById('dip-truce-wolf').addEventListener('click', () => {
        if (game.player.gold < 30) return log('❌ Не хватает золота для перемирия.', 'system');
        if (game.player.truceTurnsWolf > 0) return log('⛔ Перемирие с Оборотнями уже активно.', 'system');
        game.player.gold -= 30; game.player.truceTurnsWolf = 2;
        log(`🕊️ Перемирие с Оборотнями на 2 хода!`, 'player');
        document.getElementById('diplomacy-result').textContent = "Перемирие заключено!";
        setTimeout(closeDiplomacy, 1000); updateUI();
    });
    document.getElementById('dip-alliance').addEventListener('click', () => {
        if (game.player.gold < 50) return log('❌ Не хватает золота для союза.', 'system');
        if (game.player.allianceWithAI) return log('⛔ Союз против Оборотней уже активен.', 'system');
        game.player.gold -= 50; game.player.allianceWithAI = true;
        log(`⚔️ Заключен союз с Ватиканом против Оборотней!`, 'player');
        document.getElementById('diplomacy-result').textContent = "Союз заключен!";
        setTimeout(closeDiplomacy, 1000); updateUI();
    });

    document.getElementById('mkt-gold-to-blood').addEventListener('click', () => {
        if (game.player.marketUsed) return log('⛔ Рынок уже использован в этот ход.', 'system');
        if (game.player.gold < 10) return log('❌ Нужно 10 золота для обмена.', 'system');
        game.player.gold -= 10; game.player.blood += 8; game.player.marketUsed = true;
        log(`⚖️ Обмен: 10 Золота → 8 Крови.`, 'player');
        document.getElementById('market-result').textContent = "Обмен успешен!";
        setTimeout(closeMarket, 1000); updateUI();
    });
    document.getElementById('mkt-blood-to-gold').addEventListener('click', () => {
        if (game.player.marketUsed) return log('⛔ Рынок уже использован в этот ход.', 'system');
        if (game.player.blood < 10) return log('❌ Нужно 10 крови для обмена.', 'system');
        game.player.blood -= 10; game.player.gold += 8; game.player.marketUsed = true;
        log(`⚖️ Обмен: 10 Крови → 8 Золота.`, 'player');
        document.getElementById('market-result').textContent = "Обмен успешен!";
        setTimeout(closeMarket, 1000); updateUI();
    });

    document.getElementById('tech-reform').addEventListener('click', () => {
        if (game.player.techs.militaryReform) return log('⛔ Технология уже изучена.', 'system');
        if (game.player.gold < 30) return log('❌ Нужно 30 золота.', 'system');
        game.player.gold -= 30; game.player.techs.militaryReform = true;
        log(`⚔️ Исследована "Военная реформа"! +10% к мощи армии.`, 'player');
        document.getElementById('tech-result').textContent = "Технология изучена!";
        setTimeout(closeTech, 1000); updateUI();
    });
    document.getElementById('tech-necro').addEventListener('click', () => {
        if (game.player.techs.necromancy) return log('⛔ Технология уже изучена.', 'system');
        if (game.player.gold < 30) return log('❌ Нужно 30 золота.', 'system');
        game.player.gold -= 30; game.player.techs.necromancy = true;
        log(`💀 Исследована "Некромантия"! Убитые враги дают кровь.`, 'player');
        document.getElementById('tech-result').textContent = "Технология изучена!";
        setTimeout(closeTech, 1000); updateUI();
    });
    document.getElementById('tech-trade').addEventListener('click', () => {
        if (game.player.techs.tradeRoutes) return log('⛔ Технология уже изучена.', 'system');
        if (game.player.gold < 30) return log('❌ Нужно 30 золота.', 'system');
        game.player.gold -= 30; game.player.techs.tradeRoutes = true;
        log(`📜 Исследованы "Торговые пути"! Рынок можно использовать 2 раза.`, 'player');
        document.getElementById('tech-result').textContent = "Технология изучена!";
        setTimeout(closeTech, 1000); updateUI();
    });

    document.getElementById('diplomacy-modal').addEventListener('click', function(e) { if(e.target === this) closeDiplomacy(); });
    document.getElementById('market-modal').addEventListener('click', function(e) { if(e.target === this) closeMarket(); });
    document.getElementById('tech-modal').addEventListener('click', function(e) { if(e.target === this) closeTech(); });

    document.getElementById('btn-attack-army').addEventListener('click', () => {
        if (!game.enemyArmyTarget) return;
        game.armyBattleActive = false;
        let enemyArmyObj = game.enemyArmyTarget === 'ai' ? game.ai.mobileArmy : game.werewolf.mobileArmy;
        let targetProv = game.provinces.find(p => p.id === enemyArmyObj.location);
        if(targetProv && targetProv.owner !== 'player') {
            game.player.mobileArmy.location = targetProv.id;
            log(`🧛 Ваша армия выдвинулась на перехват врага в ${targetProv.name}.`, 'player');
        }
        game.player.ap -= 1; executeArmyBattle('player', game.enemyArmyTarget);
        game.enemyArmyTarget = null; document.getElementById('army-battle-modal').style.display = 'none'; updateUI();
    });
    document.getElementById('btn-retreat-army').addEventListener('click', () => {
        game.armyBattleActive = false;
        log(`🚩 Вы отступили, не вступая в бой (потрачено 1 AP).`, 'system');
        game.player.ap -= 1; game.enemyArmyTarget = null; document.getElementById('army-battle-modal').style.display = 'none'; updateUI();
    });

    document.querySelectorAll('[data-lore]').forEach(btn => {
        btn.addEventListener('mouseenter', (e) => {
            const loreKey = btn.getAttribute('data-lore');
            const loreText = BUILD_LORE[loreKey];
            if (loreText) {
                const loreTooltip = document.getElementById('lore-tooltip');
                loreTooltip.textContent = loreText;
                loreTooltip.style.display = 'block';
                loreTooltip.style.left = (e.pageX + 10) + 'px';
                loreTooltip.style.top = (e.pageY + 10) + 'px';
            }
        });
        btn.addEventListener('mouseleave', () => {
            document.getElementById('lore-tooltip').style.display = 'none';
        });
    });

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect(); const x = e.clientX - rect.left, y = e.clientY - rect.top;
        const tooltip = document.getElementById('tooltip');
        if (!tooltip) return; 

        const pProv = game.provinces.find(p => p.id === game.player.mobileArmy.location);
        const aProv = game.provinces.find(p => p.id === game.ai.mobileArmy.location);
        const wProv = game.provinces.find(p => p.id === game.werewolf.mobileArmy.location);
        let pOff = 0, aOff = 0, wOff = 0;
        if (pProv && aProv && pProv.id === aProv.id) { pOff = -20; aOff = 20; }
        if (pProv && wProv && pProv.id === wProv.id) { pOff = -20; wOff = 20; }
        if (aProv && wProv && aProv.id === wProv.id) { aOff = -20; wOff = 20; }

        if (pProv && getTotalTroops(game.player.mobileArmy) > 0) {
            let dx = x - (pProv.x + pOff); let dy = y - (pProv.y - 15);
            if (dx*dx + dy*dy < 2500) {
                tooltip.style.display = 'block'; tooltip.style.left = (e.clientX + 15) + 'px'; tooltip.style.top = (e.clientY - 20) + 'px';
                tooltip.innerHTML = `<b style="color:#b8c0d0;">🧛 Армия Тьмы</b><br>Войск: ${getTotalTroops(game.player.mobileArmy)}<br>Лорды: ${game.player.lords.length}<br>Мощь: ${calcArmyPower(game.player.mobileArmy, true)}`;
                return;
            }
        }
        if (aProv && getTotalTroops(game.ai.mobileArmy) > 0) {
            let dx = x - (aProv.x + aOff); let dy = y - (aProv.y - 15);
            if (dx*dx + dy*dy < 2500) {
                tooltip.style.display = 'block'; tooltip.style.left = (e.clientX + 15) + 'px'; tooltip.style.top = (e.clientY - 20) + 'px';
                tooltip.innerHTML = `<b style="color:#808ca0;">⛪ Армия Ватикана</b><br>Войск: ${getTotalTroops(game.ai.mobileArmy)}<br>Инквизиторы: ${game.ai.generals.inquisitor}<br>Мощь: ${calcArmyPower(game.ai.mobileArmy, false)}`;
                return;
            }
        }
        if (wProv && getTotalTroops(game.werewolf.mobileArmy) > 0) {
            let dx = x - (wProv.x + wOff); let dy = y - (wProv.y - 15);
            if (dx*dx + dy*dy < 2500) {
                tooltip.style.display = 'block'; tooltip.style.left = (e.clientX + 15) + 'px'; tooltip.style.top = (e.clientY - 20) + 'px';
                tooltip.innerHTML = `<b style="color:#606a78;">🐺 Армия Оборотней</b><br>Войск: ${getTotalTroops(game.werewolf.mobileArmy)}<br>Альфы: ${game.werewolf.generals.alpha}<br>Мощь: ${calcArmyPower(game.werewolf.mobileArmy, false)}`;
                return;
            }
        }

        let found = null;
        for (let p of game.provinces) { if ((x-p.x)*(x-p.x) + (y-p.y)*(y-p.y) < 2500) { found = p; break; } }
        if (found) {
            tooltip.style.display = 'block'; tooltip.style.left = (e.clientX + 15) + 'px'; tooltip.style.top = (e.clientY - 20) + 'px';
            let gCount = found.owner === 'player' ? getTotalTroops(found.playerGarrison||{}) : getTotalTroops(found.aiGarrison||{});
            tooltip.innerHTML = `<b style="color:#b8c0d0;">${found.name}</b><br>
            🧛 Поддержка Тьмы: ${Math.round(found.support.player)}%<br>
            ⛪ Поддержка Ватикана: ${Math.round(found.support.ai)}%<br>
            🐺 Поддержка Оборотней: ${Math.round(found.support.werewolf)}%<br>
            🛡️ Гарнизон: ${gCount}<br>
            👥 Население: ${found.population}<br>
            🏰 Укрепления: ${found.fortification}<br>
            🏔️ Местность: ${found.terrain === 'plains' ? 'Равнина' : (found.terrain === 'mountains' ? 'Горы (+5 к защите)' : (found.terrain === 'forest' ? 'Лес (+2 к защите)' : 'Река (+1 к защите)'))}`;
        } else tooltip.style.display = 'none';
    });

    canvas.addEventListener('click', (e) => {
        if (game.gameOver || game.battleActive || game.surrenderActive || game.armyBattleActive) return;
        if (game.player.ap === 0) return log('❌ У вас нет очков действий.', 'system');
        const rect = canvas.getBoundingClientRect(); const x = e.clientX - rect.left, y = e.clientY - rect.top;
        const pProv = game.provinces.find(p => p.id === game.player.mobileArmy.location); const aProv = game.provinces.find(p => p.id === game.ai.mobileArmy.location); const wProv = game.provinces.find(p => p.id === game.werewolf.mobileArmy.location);
        let pOff = 0, aOff = 0, wOff = 0;
        if (pProv && aProv && pProv.id === aProv.id) { pOff = -20; aOff = 20; }
        if (pProv && wProv && pProv.id === wProv.id) { pOff = -20; wOff = 20; }
        if (aProv && wProv && aProv.id === wProv.id) { aOff = -20; wOff = 20; }

        if (aProv && getTotalTroops(game.ai.mobileArmy) > 0) {
            let dx = x - (aProv.x + aOff); let dy = y - (aProv.y - 15);
            if (dx*dx + dy*dy < 2500) { if (!isNightTime()) { log('☀️ Сейчас день! Вы не можете атаковать.', 'player'); return; } game.enemyArmyTarget = 'ai'; document.getElementById('army-battle-desc').textContent = `Вы встретили армию Ватикана в провинции "${aProv.name}"!`; document.getElementById('army-battle-modal').style.display = 'flex'; document.getElementById('army-battle-result').textContent = ""; document.getElementById('btn-attack-army').disabled = false; document.getElementById('btn-retreat-army').disabled = false; return; } }
        if (wProv && getTotalTroops(game.werewolf.mobileArmy) > 0) {
            let dx = x - (wProv.x + wOff); let dy = y - (wProv.y - 15);
            if (dx*dx + dy*dy < 2500) { if (!isNightTime()) { log('☀️ Сейчас день! Вы не можете атаковать.', 'player'); return; } game.enemyArmyTarget = 'werewolf'; document.getElementById('army-battle-desc').textContent = `Вы встретили армию Оборотней в провинции "${wProv.name}"!`; document.getElementById('army-battle-modal').style.display = 'flex'; document.getElementById('army-battle-result').textContent = ""; document.getElementById('btn-attack-army').disabled = false; document.getElementById('btn-retreat-army').disabled = false; return; } }
        for (let p of game.provinces) { if ((x-p.x)*(x-p.x) + (y-p.y)*(y-p.y) < 2500) { const curr = game.provinces.find(pr => pr.id === game.player.mobileArmy.location); if (p.owner === 'player' && p.id === curr.id) { game.selectedProvinceId = p.id; log(`📍 Выбрана ${p.name} для стройки.`, 'system'); updateUI(); break; } if (p.owner === 'player' && p.id !== curr.id) { game.player.mobileArmy.location = p.id; game.player.ap -= 1; log(`🏰 Армия передислоцировалась в ${p.name}.`, 'player'); updateUI(); break; } if ((p.owner === 'ai' || p.owner === 'werewolf' || p.owner === null) && game.player.ap > 0) { if (!curr.neighbors.includes(p.id)) return log('❌ Слишком далеко! Вторгаться можно только в соседние провинции.', 'system'); if (getTotalTroops(game.player.mobileArmy) === 0) return log('❌ Нет войск.', 'system'); if (!isNightTime()) return log('☀️ Сейчас день! Вампиры не могут атаковать.', 'player'); game.pendingActionProvId = p.id; document.getElementById('action-desc').textContent = `Ваша армия вошла в провинцию «${p.name}».`; document.getElementById('action-modal').style.display = 'flex'; break; } } }
    });

    gameLoop();
});

function gameLoop() { if (!game.gameOver) drawMap(); requestAnimationFrame(gameLoop); }
