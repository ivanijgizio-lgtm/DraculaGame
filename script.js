// ================= РАСШИРЕННЫЙ ЛОР =================
const BUILD_LORE = {
    'cemetery': 'Кладбище: +5 крови/ход',
    'barracks': 'Казармы Lv1: открывает пехоту/лучников',
    'barracks_lv2': 'Казармы Lv2: открывает Рыцарей Тьмы',
    'ritual': 'Храм Тьмы: нужен для Лордов и Аристократов',
    'dungeon': 'Тюрьма: +10 поддержки Тьмы',
    'executions': 'Казни: +15 поддержки Тьмы',
    'ball': 'Бал Вампиров: +20 поддержки Тьмы',
    'center': 'Центр Обращения: +10 поддержки, +5 лояльности',
    'citadel': 'Цитадель: +50 золота/ход',
    'wall': 'Стены: +1 укрепление',
    'castle': 'Замок: +2 укрепления, +20 гарнизона',
    'market': 'Рынок: позволяет обмен ресурсов',
    'altar': 'Алтарь крови: +10 крови каждый ход.',
    'tower': 'Башня магов: +2 к укреплениям провинции.',
    'dungeon2': 'Темница: +15 гарнизона (пехота).',
    'infantry': '5 Пехоты. Нужны Казармы',
    'archer': '5 Лучников. Нужны Казармы',
    'cavalry': '3 Кавалерии. Нужны Казармы',
    'knights': 'Рыцари Тьмы. Нужны Казармы Lv2',
    'lord': 'Призвать Лорда (+10% силы). Нужен Храм Тьмы',
    'soul_collector': 'Сборщик душ (+50 золота/ход). Нужна Цитадель',
    'gargoyle': 'Гаргульи (игнорируют штрафы). Нужна Военная реформа',
    'noble': 'Аристократы (+Человечность после побед). Нужна Некромантия',
    'vampire': 'Вампиры – элитная пехота. Удваивают урон в ночных атаках.',
    'necromancer': 'Некроманты – воскрешают 10% павших после боя.',
    'berserker': 'Берсерки – +50% к атаке, но теряют 10% здоровья после боя.',
    'garrison_add': 'Оставить 10 пехотинцев в гарнизоне',
    'garrison_take': 'Призвать 10 пехотинцев из гарнизона',
    'cancelsiege': 'Снять осаду (1 AP)',
    'endturn': 'Закончить ход',
    'diplomacy': 'Дипломатия – пакты о ненападении',
    'market': 'Рынок – обмен ресурсов',
    'tech': 'Технологии – открывают элитные юниты',
    'factions': 'Фракции – силы Европы'
};

// ================= PIXI ИНИЦИАЛИЗАЦИЯ =================
let app = null, hexContainer = null, armyContainer = null;
let spritePlayer = null, spriteAI = null, spriteWerewolf = null;
let spriteLord = null, spriteAIGeneral = null, spriteWolfGeneral = null;

const SoundEngine = {
    ctx: null,
    init(){ if(!this.ctx) this.ctx = new (window.AudioContext||window.webkitAudioContext)(); },
    playCoin(){},
    playCurse(){},
    playBattle(){},
    playWolfHowl(){},
    playBuild(){}
};

function initPixi() {
    const container = document.getElementById('pixi-container');
    if (!container) return;
    app = new PIXI.Application({
        width: container.clientWidth || 1100,
        height: container.clientHeight || 650,
        backgroundColor: 0x0a0a0a,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true
    });
    container.appendChild(app.view);
    hexContainer = new PIXI.Container();
    armyContainer = new PIXI.Container();
    app.stage.addChild(hexContainer);
    app.stage.addChild(armyContainer);
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    window.addEventListener('resize', resizeMap);
}

function loadSprites() {
    return new Promise((resolve) => {
        const loader = PIXI.Loader.shared;
        loader.add('player', './assets/Vampire Army.png')
              .add('ai', './assets/Knight Vatican.jpg')
              .add('werewolf', './assets/Werewolf Army.webp')
              .add('lord', './assets/Lord Vampire.jpg')
              .add('aiGeneral', './assets/Vatican Inquisitor.png')
              .add('wolfGeneral', './assets/Werewolf general.jpg');

        loader.load((loader, resources) => {
            spritePlayer = resources.player?.texture || null;
            spriteAI = resources.ai?.texture || null;
            spriteWerewolf = resources.werewolf?.texture || null;
            spriteLord = resources.lord?.texture || null;
            spriteAIGeneral = resources.aiGeneral?.texture || null;
            spriteWolfGeneral = resources.wolfGeneral?.texture || null;
            resolve();
        });
    });
}

// ================= ДАННЫЕ ИГРЫ =================
const LORD_NAMES = ["Граф Дракулос","Леди Сильвана","Барон Ноктюрн","Принц Теней","Леди Вэйн"];

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
            mobileArmy: { infantry: 50, archer: 10, cavalry: 10, gargoyle: 0, noble: 0, vampire: 0, necromancer: 0, berserker: 0, hexId: '0,0' },
            hasCitadel: false, allianceWithAI: false, truceTurnsAI: 0, truceTurnsWolf: 0,
            techs: { militaryReform: false, necromancy: false, tradeRoutes: false }
        },
        ai: { gold: 100, mobileArmy: { infantry: 55, archer: 15, cavalry: 10, gargoyle: 0, noble: 0, vampire: 0, necromancer: 0, berserker: 0, hexId: '6,-4' } },
        werewolf: { gold: 50, mobileArmy: { infantry: 35, archer: 5, cavalry: 10, gargoyle: 0, noble: 0, vampire: 0, necromancer: 0, berserker: 0, hexId: '-5,4' } },
        hexGrid: []
    };
}

let game = getDefaultGame();

// ================= НОВАЯ КАРТА НА 100 ГЕКСОВ =================
function initHexGrid() {
    const grid = [];
    
    // 100 регионов с лором
    const regionalMap = [
        // === ФРАКЦИЯ 1: ЛЕГИОН ТЬМЫ (ИГРОК) – 30 гексов ===
        { q: 0, r: 0, name: 'Трансильвания', terrain: 'mountain', owner: 'player', fort: 2, pop: 2500, lore: 'Древняя родина графа Дракулы, где каменные замки впиваются в облака.' },
        { q: 1, r: 0, name: 'Валахия', terrain: 'plains', owner: 'player', fort: 1, pop: 1800, lore: 'Бескрайние степи, где пасутся табуны диких лошадей.' },
        { q: -1, r: 0, name: 'Молдавия', terrain: 'forest', owner: 'player', fort: 0, pop: 1500, lore: 'Дремучие леса, полные волков и древних тайн.' },
        { q: 0, r: -1, name: 'Паннония', terrain: 'plains', owner: 'player', fort: 0, pop: 1200, lore: 'Золотые поля, дающие обильный урожай.' },
        { q: -1, r: 1, name: 'Банат', terrain: 'plains', owner: 'player', fort: 0, pop: 1100, lore: 'Перекрёсток торговых путей, всегда шумный и пёстрый.' },
        { q: 1, r: -1, name: 'Бессарабия', terrain: 'swamp', owner: 'player', fort: 0, pop: 900, lore: 'Топкие болота, где блуждают огни и гибнут путники.' },
        { q: -2, r: 1, name: 'Буковина', terrain: 'forest', owner: 'player', fort: 1, pop: 1000, lore: 'Буковые леса, хранящие память о древних кельтских племенах.' },
        { q: 0, r: 1, name: 'Олтения', terrain: 'plains', owner: 'player', fort: 0, pop: 1300, lore: 'Богатые пастбища, где разводят лучших коней.' },
        { q: 2, r: -2, name: 'Высокие Татры', terrain: 'mountain', owner: 'player', fort: 1, pop: 800, lore: 'Острые пики, уходящие в небо, — обитель орлов и драконов.' },
        { q: -2, r: 2, name: 'Марамуреш', terrain: 'forest', owner: 'player', fort: 0, pop: 950, lore: 'Деревянные церкви и древние обряды, нетронутые временем.' },
        { q: -1, r: -1, name: 'Добруджа', terrain: 'swamp', owner: 'player', fort: 0, pop: 700, lore: 'Тростниковые заросли у Чёрного моря, приют контрабандистов.' },
        { q: 1, r: -2, name: 'Мунтения', terrain: 'plains', owner: 'player', fort: 0, pop: 1400, lore: 'Центр торговли и ремёсел, житница Валахии.' },
        { q: -2, r: 0, name: 'Кришана', terrain: 'plains', owner: 'player', fort: 0, pop: 1250, lore: 'Речные долины, где каждый камень дышит историей.' },
        { q: 2, r: -1, name: 'Буджак', terrain: 'swamp', owner: 'player', fort: 0, pop: 600, lore: 'Низинные луга, часто заливаемые водами Дуная.' },
        { q: 0, r: -2, name: 'Карпатский Рубеж', terrain: 'mountain', owner: 'player', fort: 2, pop: 1100, lore: 'Неприступная стена, за которой скрываются самые тёмные тайны.' },
        { q: -3, r: 2, name: 'Ужгород', terrain: 'forest', owner: 'player', fort: 0, pop: 850, lore: 'Город на реке Уж, где переплелись славянские и венгерские легенды.' },
        { q: 2, r: 1, name: 'Брашов', terrain: 'mountain', owner: 'player', fort: 1, pop: 1300, lore: 'Средневековый город, окружённый зубчатыми стенами.' },
        { q: -3, r: 1, name: 'Сибиу', terrain: 'plains', owner: 'player', fort: 0, pop: 1100, lore: 'Город семи башен, где время течёт иначе.' },
        { q: 3, r: -2, name: 'Плоешти', terrain: 'plains', owner: 'player', fort: 0, pop: 1400, lore: 'Жемчужина нефтяных полей, стратегическая цель.' },
        { q: -1, r: 2, name: 'Клуж-Напока', terrain: 'plains', owner: 'player', fort: 0, pop: 1200, lore: 'Университетский город, где магия встречается с наукой.' },
        { q: 3, r: -1, name: 'Бухарест', terrain: 'plains', owner: 'player', fort: 1, pop: 2000, lore: 'Столица, шумный и гордый город, сердце Валахии.' },
        { q: -3, r: 0, name: 'Тимишоара', terrain: 'plains', owner: 'player', fort: 0, pop: 1300, lore: 'Город на каналах, где барокко соседствует с модерном.' },
        { q: 4, r: -3, name: 'Констанца', terrain: 'swamp', owner: 'player', fort: 0, pop: 950, lore: 'Портовый город на Чёрном море, ворота на Восток.' },
        { q: -4, r: 2, name: 'Орадя', terrain: 'plains', owner: 'player', fort: 0, pop: 1000, lore: 'Город с крепостью, пережившей множество осад.' },
        { q: 2, r: -3, name: 'Галац', terrain: 'swamp', owner: 'player', fort: 0, pop: 800, lore: 'Крупный речной порт на Дунае.' },
        { q: -2, r: -1, name: 'Яссы', terrain: 'plains', owner: 'player', fort: 0, pop: 1100, lore: 'Культурная столица Молдавии, родина поэтов.' },
        { q: 5, r: -4, name: 'Кишинёв', terrain: 'forest', owner: 'player', fort: 0, pop: 900, lore: 'Город на холмах, где зелёные улицы полны жизни.' },
        { q: -1, r: -2, name: 'Измаил', terrain: 'swamp', owner: 'player', fort: 0, pop: 600, lore: 'Крепость на берегу озера, ключ к нижнему Дунаю.' },
        { q: 1, r: 2, name: 'Сигишоара', terrain: 'mountain', owner: 'player', fort: 1, pop: 900, lore: 'Средневековая цитадель, где родился Влад Цепеш.' },
        { q: -3, r: -1, name: 'Черновцы', terrain: 'forest', owner: 'player', fort: 0, pop: 950, lore: 'Город на границе, впитавший влияния многих империй.' },
        { q: 4, r: -2, name: 'Брэила', terrain: 'swamp', owner: 'player', fort: 0, pop: 700, lore: 'Порт на Дунае, известный своими рыбными рынками.' },

        // === ФРАКЦИЯ 2: СВЯЩЕННЫЙ ПРЕСТОЛ (AI) – 30 гексов ===
        { q: 6, r: -4, name: 'Ватикан', terrain: 'mountain', owner: 'ai', fort: 3, pop: 5000, lore: 'Сердце христианского мира, где власть Папы незыблема.' },
        { q: 5, r: -3, name: 'Рим', terrain: 'plains', owner: 'ai', fort: 2, pop: 4500, lore: 'Вечный город, где древность встречается с величием.' },
        { q: 6, r: -3, name: 'Флоренция', terrain: 'plains', owner: 'ai', fort: 1, pop: 3000, lore: 'Колыбель Ренессанса, город искусств и интриг.' },
        { q: 7, r: -4, name: 'Перуджа', terrain: 'forest', owner: 'ai', fort: 0, pop: 2100, lore: 'Этрусский город на холме, хранящий древние тайны.' },
        { q: 5, r: -4, name: 'Сиена', terrain: 'plains', owner: 'ai', fort: 0, pop: 1600, lore: 'Соперник Флоренции, славящийся своей площадью.' },
        { q: 7, r: -5, name: 'Анкона', terrain: 'plains', owner: 'ai', fort: 1, pop: 2200, lore: 'Портовый город, ворота на Адриатику.' },
        { q: 4, r: -3, name: 'Пиза', terrain: 'plains', owner: 'ai', fort: 0, pop: 1900, lore: 'Город с падающей башней, символом гордыни.' },
        { q: 6, r: -5, name: 'Равенна', terrain: 'swamp', owner: 'ai', fort: 0, pop: 1400, lore: 'Византийская мозаика и древние мавзолеи.' },
        { q: 8, r: -5, name: 'Неаполь', terrain: 'plains', owner: 'ai', fort: 1, pop: 3500, lore: 'Шумный город у подножия вулкана, где жизнь кипит.' },
        { q: 5, r: -2, name: 'Болонья', terrain: 'plains', owner: 'ai', fort: 0, pop: 2400, lore: 'Город науки и башен, старейший университет.' },
        { q: 7, r: -3, name: 'Венеция', terrain: 'swamp', owner: 'ai', fort: 1, pop: 4000, lore: 'Город на воде, где гондолы скользят по каналам.' },
        { q: 4, r: -4, name: 'Генуя', terrain: 'mountain', owner: 'ai', fort: 2, pop: 3200, lore: 'Морская республика, соперница Венеции.' },
        { q: 6, r: -2, name: 'Милан', terrain: 'plains', owner: 'ai', fort: 1, pop: 3800, lore: 'Столица моды и промышленности, сердце Ломбардии.' },
        { q: 8, r: -4, name: 'Калабрия', terrain: 'forest', owner: 'ai', fort: 0, pop: 1300, lore: 'Южный край, где горы встречаются с морем.' },
        { q: 3, r: -3, name: 'Ломбардия', terrain: 'plains', owner: 'ai', fort: 0, pop: 2800, lore: 'Богатые равнины, орошаемые реками.' },
        { q: 5, r: -5, name: 'Сан-Марино', terrain: 'mountain', owner: 'ai', fort: 1, pop: 800, lore: 'Республика-легенда, сохранившая свободу.' },
        { q: 4, r: -5, name: 'Турин', terrain: 'plains', owner: 'ai', fort: 0, pop: 2200, lore: 'Город у подножия Альп, ворота во Францию.' },
        { q: 7, r: -2, name: 'Триест', terrain: 'plains', owner: 'ai', fort: 0, pop: 1800, lore: 'Порт на границе славянского мира.' },
        { q: 6, r: -1, name: 'Падуя', terrain: 'plains', owner: 'ai', fort: 0, pop: 2000, lore: 'Город святого Антония, благочестивый и учёный.' },
        { q: 5, r: -1, name: 'Верона', terrain: 'plains', owner: 'ai', fort: 0, pop: 2100, lore: 'Город Ромео и Джульетты, вечная любовь.' },
        { q: 3, r: -4, name: 'Модена', terrain: 'plains', owner: 'ai', fort: 0, pop: 1700, lore: 'Известна бальзамическим уксусом и герцогскими дворцами.' },
        { q: 8, r: -3, name: 'Римини', terrain: 'plains', owner: 'ai', fort: 0, pop: 1500, lore: 'Курортный город на Адриатике, место отдыха.' },
        { q: 2, r: -4, name: 'Парма', terrain: 'plains', owner: 'ai', fort: 0, pop: 1900, lore: 'Город музыки и сыра, изысканный вкус.' },
        { q: 7, r: -6, name: 'Бари', terrain: 'swamp', owner: 'ai', fort: 0, pop: 1000, lore: 'Портовый город в Апулии, ворота на Балканы.' },
        { q: 8, r: -2, name: 'Феррара', terrain: 'plains', owner: 'ai', fort: 0, pop: 1400, lore: 'Город герцогов, покровителей искусств.' },
        { q: 9, r: -4, name: 'Лечче', terrain: 'plains', owner: 'ai', fort: 0, pop: 1100, lore: 'Барочная жемчужина Юга.' },
        { q: 4, r: -1, name: 'Кремона', terrain: 'plains', owner: 'ai', fort: 0, pop: 1200, lore: 'Город скрипичных мастеров, где рождается музыка.' },
        { q: 9, r: -5, name: 'Таранто', terrain: 'swamp', owner: 'ai', fort: 0, pop: 900, lore: 'Военная гавань, защищающая южное побережье.' },
        { q: 2, r: -5, name: 'Савона', terrain: 'mountain', owner: 'ai', fort: 0, pop: 1200, lore: 'Лигурийский порт с богатой морской историей.' },
        { q: 5, r: -6, name: 'Пескара', terrain: 'plains', owner: 'ai', fort: 0, pop: 1400, lore: 'Город на берегу Адриатики, центр региона Абруццо.' },

        // === ФРАКЦИЯ 3: СТАЯ КЛЫКА (WEREWOLF) – 25 гексов ===
        { q: -4, r: 4, name: 'Карпатия', terrain: 'mountain', owner: 'werewolf', fort: 1, pop: 2000, lore: 'Дикие горы, где волки воют на луну.' },
        { q: -3, r: 3, name: 'Мёзия', terrain: 'forest', owner: 'werewolf', fort: 0, pop: 1600, lore: 'Леса, населённые тенями и древними духами.' },
        { q: -4, r: 3, name: 'Дакия', terrain: 'forest', owner: 'werewolf', fort: 0, pop: 1800, lore: 'Земля предков, где кровь смешалась с землёй.' },
        { q: -5, r: 4, name: 'Железные Ворота', terrain: 'mountain', owner: 'werewolf', fort: 2, pop: 1200, lore: 'Ущелье, где река пробивает горы, — непреодолимый барьер.' },
        { q: -3, r: 4, name: 'Багряный Пик', terrain: 'mountain', owner: 'werewolf', fort: 1, pop: 1400, lore: 'Скала, залитая кровью, место кровавых ритуалов.' },
        { q: -2, r: 3, name: 'Шепчущий Лес', terrain: 'forest', owner: 'werewolf', fort: 0, pop: 1100, lore: 'Листва шепчет имена погибших, здесь небезопасно.' },
        { q: -4, r: 5, name: 'Кровавые Топи', terrain: 'swamp', owner: 'werewolf', fort: 0, pop: 850, lore: 'Болота, в которых тонут враги и друзья.' },
        { q: -5, r: 5, name: 'Воющий Водораздел', terrain: 'mountain', owner: 'werewolf', fort: 0, pop: 900, lore: 'Гребень гор, где ветер приносит вой стаи.' },
        { q: -3, r: 2, name: 'Иллирия', terrain: 'plains', owner: 'werewolf', fort: 0, pop: 1500, lore: 'Древняя земля, где кочуют дикие племена.' },
        { q: -4, r: 2, name: 'Древняя Фракия', terrain: 'forest', owner: 'werewolf', fort: 0, pop: 1300, lore: 'Таинственный лес, где обитают призраки прошлого.' },
        { q: -5, r: 3, name: 'Туманная Долина', terrain: 'forest', owner: 'werewolf', fort: 0, pop: 1050, lore: 'Долина, вечно окутанная туманом, где легко заблудиться.' },
        { q: -2, r: 4, name: 'Дикое Поле', terrain: 'plains', owner: 'werewolf', fort: 0, pop: 1200, lore: 'Бескрайние степи, где стаи охотятся на одиночек.' },
        { q: -6, r: 4, name: 'Трансильванские Альпы', terrain: 'mountain', owner: 'werewolf', fort: 1, pop: 1100, lore: 'Южный хребет Карпат, где прячутся драконы.' },
        { q: -5, r: 2, name: 'Нижняя Далмация', terrain: 'plains', owner: 'werewolf', fort: 0, pop: 1400, lore: 'Прибрежные равнины, где ветер солёный и острый.' },
        { q: -6, r: 3, name: 'Верхняя Мёзия', terrain: 'mountain', owner: 'werewolf', fort: 0, pop: 900, lore: 'Горные рудники, где добывают железо и серебро.' },
        { q: -7, r: 4, name: 'Боснийские горы', terrain: 'mountain', owner: 'werewolf', fort: 1, pop: 1300, lore: 'Непроходимые чащи, приют мятежников и зверей.' },
        { q: -6, r: 5, name: 'Сербское Поморье', terrain: 'swamp', owner: 'werewolf', fort: 0, pop: 800, lore: 'Болотистые берега, где реки впадают в море.' },
        { q: -7, r: 3, name: 'Черногорские скалы', terrain: 'mountain', owner: 'werewolf', fort: 1, pop: 1200, lore: 'Чёрные горы, о которые разбиваются волны.' },
        { q: -5, r: 6, name: 'Дунайские плавни', terrain: 'swamp', owner: 'werewolf', fort: 0, pop: 700, lore: 'Заросли камыша, где скрываются враги.' },
        { q: -6, r: 2, name: 'Истрия', terrain: 'plains', owner: 'werewolf', fort: 0, pop: 1300, lore: 'Полуостров, где переплелись культуры.' },
        { q: -7, r: 5, name: 'Банатские холмы', terrain: 'plains', owner: 'werewolf', fort: 0, pop: 1100, lore: 'Холмистые равнины, где зреют виноградники.' },
        { q: -8, r: 4, name: 'Срем', terrain: 'forest', owner: 'werewolf', fort: 0, pop: 1000, lore: 'Лесная область между реками, место засад.' },
        { q: -7, r: 2, name: 'Лика', terrain: 'forest', owner: 'werewolf', fort: 0, pop: 950, lore: 'Карстовые поля, где вода исчезает под землёй.' },
        { q: -8, r: 5, name: 'Бачка', terrain: 'plains', owner: 'werewolf', fort: 0, pop: 1200, lore: 'Плодородные равнины, спорная территория.' },
        { q: -6, r: 6, name: 'Добруджа Северная', terrain: 'swamp', owner: 'werewolf', fort: 0, pop: 800, lore: 'Северная часть болот, богатая рыбой и птицей.' },

        // === НЕЙТРАЛЬНЫЕ ЗЕМЛИ И БОГАТСТВА – 15 гексов ===
        { q: 2, r: 0, name: 'Серебряные Шахты', terrain: 'mountain', owner: null, res: { gold: 30, blood: 0 }, fort: 0, pop: 0, lore: 'Древние выработки, где добывали серебро для короны.' },
        { q: 3, r: -1, name: 'Проклятая Кузница', terrain: 'mountain', owner: null, res: { gold: 10, blood: 15 }, fort: 0, pop: 0, lore: 'Место, где ковали оружие для тёмных ритуалов.' },
        { q: 1, r: 1, name: 'Чумной Стык', terrain: 'swamp', owner: null, res: { gold: 0, blood: 25 }, fort: 0, pop: 0, lore: 'Болото, где болезнь и смерть — частые гости.' },
        { q: -1, r: 2, name: 'Священные Руины', terrain: 'plains', owner: null, res: { gold: 20, blood: 5 }, fort: 0, pop: 0, lore: 'Останки храма, где молились древним богам.' },
        { q: 0, r: 2, name: 'Вековая Роща', terrain: 'forest', owner: null, res: { gold: 15, blood: 15 }, fort: 0, pop: 0, lore: 'Дубы, помнящие времена язычества.' },
        { q: 2, r: -3, name: 'Моравский Коридор', terrain: 'plains', owner: null, res: { gold: 15, blood: 0 }, fort: 0, pop: 0, lore: 'Путь между Востоком и Западом, всегда наводнённый путниками.' },
        { q: -3, r: 1, name: 'Опустошенные Земли', terrain: 'plains', owner: null, res: { gold: 5, blood: 5 }, fort: 0, pop: 0, lore: 'Сожжённая войнами пустошь, где ничего не растёт.' },
        { q: 1, r: 2, name: 'Гиблое Захолустье', terrain: 'swamp', owner: null, res: { gold: 5, blood: 20 }, fort: 0, pop: 0, lore: 'Место, где люди исчезают без следа.' },
        { q: 3, r: 0, name: 'Забытый Базар', terrain: 'plains', owner: null, res: { gold: 25, blood: 0 }, fort: 0, pop: 0, lore: 'Некогда шумный рынок, ныне пустынный и тихий.' },
        { q: -2, r: -2, name: 'Стеклянные Горы', terrain: 'mountain', owner: null, res: { gold: 20, blood: 10 }, fort: 0, pop: 0, lore: 'Скалы, сверкающие кварцем, как лёд.' },
        { q: 4, r: 0, name: 'Ущелье Ветров', terrain: 'mountain', owner: null, res: { gold: 10, blood: 10 }, fort: 0, pop: 0, lore: 'Теснина, где ветер воет подобно волку.' },
        { q: -4, r: 0, name: 'Хрустальный Овраг', terrain: 'mountain', owner: null, res: { gold: 25, blood: 0 }, fort: 0, pop: 0, lore: 'Овраг, усеянный кристаллами горного хрусталя.' },
        { q: 0, r: 3, name: 'Термальные Источники', terrain: 'forest', owner: null, res: { gold: 0, blood: 30 }, fort: 0, pop: 0, lore: 'Горячие источники, обладающие целебной силой.' },
        { q: 5, r: 0, name: 'Мёртвое Озеро', terrain: 'swamp', owner: null, res: { gold: 5, blood: 25 }, fort: 0, pop: 0, lore: 'Озеро, где вода чёрная и смертоносная.' },
        { q: -5, r: 1, name: 'Пепельная Пустошь', terrain: 'plains', owner: null, res: { gold: 10, blood: 10 }, fort: 0, pop: 0, lore: 'Земля, покрытая вулканическим пеплом, бесплодная.' },
    ];

    regionalMap.forEach(d => {
        let support = { player: 15, ai: 15, werewolf: 15 };
        if (d.owner === 'player') support = { player: 80, ai: 10, werewolf: 10 };
        else if (d.owner === 'ai') support = { player: 5, ai: 85, werewolf: 10 };
        else if (d.owner === 'werewolf') support = { player: 10, ai: 5, werewolf: 85 };

        grid.push({
            q: d.q, r: d.r, name: d.name, owner: d.owner, terrain: d.terrain,
            resources: d.res || { gold: 0, blood: 0 },
            fortification: d.fort || 0, population: d.pop || 0, support: support,
            lore: d.lore || 'Неисследованная земля.',
            playerGarrison: { infantry: d.owner === 'player' ? 20 : 0, archer: 0, cavalry: 0, gargoyle: 0, noble: 0, vampire: 0, necromancer: 0, berserker: 0 },
            aiGarrison: { infantry: d.owner === 'ai' ? 20 : 0, archer: 0, cavalry: 0, gargoyle: 0, noble: 0, vampire: 0, necromancer: 0, berserker: 0 },
            buildings: [], siegeBy: null
        });
    });
    return grid;
}

// ================= ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =================
function getTotalTroops(army) {
    return (army?.infantry || 0) + (army?.archer || 0) + (army?.cavalry || 0) +
           (army?.gargoyle || 0) + (army?.noble || 0) + (army?.vampire || 0) +
           (army?.necromancer || 0) + (army?.berserker || 0);
}
function isNightTime() { return game.turn % 2 !== 0; }
function log(msg, type = 'system') {
    const c = document.getElementById('log-container');
    if (!c) return;
    const e = document.createElement('div');
    e.className = `log-entry ${type}`;
    e.textContent = msg;
    c.appendChild(e);
    c.scrollTop = c.scrollHeight;
}
function getLordBonus() {
    let b = 0;
    game.player.lords.forEach(l => { b += (l.battles >= 5) ? 0.2 : (l.battles >= 2 ? 0.1 : 0); });
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
    if (game.gameOver) return;
    game.gameOver = true;
    document.getElementById('btn-end-turn').disabled = true;
    document.getElementById('btn-assault').disabled = true;
    if (winner === 'player') {
        if (game.cassaldiaTrust >= 70) {
            document.getElementById('gameover-title').textContent = "ВЕЧНЫЙ СОЮЗ РАЗУМА";
            document.getElementById('gameover-desc').textContent = "Ватикан пал. Дракула освободил Кассальдию, сохранив человечность. Она приняла бессмертие. Вместе они создали справедливую империю.";
        } else {
            document.getElementById('gameover-title').textContent = "ТИРАНИЯ ТЬМЫ";
            document.getElementById('gameover-desc').textContent = "Священный Престол сокрушен, но жестокость испугала Кассальдию. Она заперлась в башне. Вы правите в одиночестве.";
        }
    } else {
        document.getElementById('gameover-title').textContent = "ТЬМА ОТСТУПИЛА!";
        document.getElementById('gameover-desc').textContent = "Защитники человечества оказались сильнее. Замок Дракулы стерт с лица земли.";
    }
    document.getElementById('gameover-modal').style.display = 'flex';
}
function checkStoryConditions() {
    if (game.humanity <= 0) {
        game.gameOver = true;
        document.getElementById('gameover-title').textContent = "БЕЗУМИЕ ЗВЕРЯ!";
        document.getElementById('gameover-desc').textContent = "Человечность угасла. Ворвавшись в Рим, Дракула растерзал Кассальдию. Тьма победила, но любви больше нет.";
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
    if (!app) return;
    hexContainer.removeChildren();
    if (!game.hexGrid.length) return;
    const w = app.renderer.view.width, h = app.renderer.view.height;
    let minQ = Infinity, maxQ = -Infinity, minR = Infinity, maxR = -Infinity;
    game.hexGrid.forEach(hex => {
        minQ = Math.min(minQ, hex.q); maxQ = Math.max(maxQ, hex.q);
        minR = Math.min(minR, hex.r); maxR = Math.max(maxR, hex.r);
    });
    let HEX_SIZE = Math.min(w / ((maxQ - minQ + 1) * 1.8), h / ((maxR - minR + 1) * 1.6), 80) * 0.85;
    if (HEX_SIZE < 12) HEX_SIZE = 12;
    let rawPositions = game.hexGrid.map(hex => {
        const p = hexToPixel(hex.q, hex.r, HEX_SIZE);
        return { ...hex, rawX: p.x, rawY: p.y };
    });
    let avgX = 0, avgY = 0;
    rawPositions.forEach(p => { avgX += p.rawX; avgY += p.rawY; });
    avgX /= rawPositions.length; avgY /= rawPositions.length;
    let shiftX = (w / 2) - avgX, shiftY = (h / 2) - avgY;

    const currentHex = game.hexGrid.find(h => `${h.q},${h.r}` === game.player.mobileArmy.hexId);
    let movableHexIds = (currentHex && game.player.ap > 0 && getTotalTroops(game.player.mobileArmy) > 0) ?
        getNeighbors(currentHex.q, currentHex.r).map(n => `${n.q},${n.r}`) : [];

    rawPositions.forEach(hex => {
        const container = new PIXI.Container();
        container.x = hex.rawX + shiftX; container.y = hex.rawY + shiftY;
        const g = new PIXI.Graphics();

        let terrainColor = 0x1a1a1a;
        if (hex.terrain === 'mountain') terrainColor = 0x2a2a2a;
        else if (hex.terrain === 'forest') terrainColor = 0x0d1f0d;
        else if (hex.terrain === 'swamp') terrainColor = 0x1a1f0d;
        g.beginFill(terrainColor);

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
        g.on('click', () => handleHexClick(hex));
        g.on('contextmenu', (e) => {
            e.data.originalEvent.preventDefault();
            showArmyComposition(hex);
        });
        g.on('mouseover', (e) => {
            g.tint = 0x8a2be2;
            const t = document.getElementById('tooltip');
            const o = hex.owner ? (hex.owner === 'player' ? 'Дракула' : (hex.owner === 'ai' ? 'Ватикан' : 'Оборотни')) : 'Ничейная';
            const terrMap = { plains: 'Равнины', mountain: 'Горы ⛰️', forest: 'Густой Лес 🌲', swamp: 'Гнилые Болота ☣️' };
            let supportText = '';
            if (hex.support) {
                supportText = `<br>🧛 Тьма: ${hex.support.player}% | ⛪ Ватикан: ${hex.support.ai}% | 🐺 Оборотни: ${hex.support.werewolf}%`;
            }
            let garrison = (hex.owner === 'player') ? hex.playerGarrison : (hex.owner === 'ai' ? hex.aiGarrison : {});
            let loreText = hex.lore ? `<br><i style="font-size:11px; color:#a0b0d0;">${hex.lore}</i>` : '';
            t.innerHTML = `<b>${hex.name}</b> (${terrMap[hex.terrain]})<br>Владелец: ${o}<br>🛡️ Защита: ${getTotalTroops(garrison)}<br>🏰 Укрепы: ${hex.fortification}${supportText}${loreText}`;
            t.style.display = 'block';
            t.style.left = (e.data.originalEvent.clientX + 15) + 'px';
            t.style.top = (e.data.originalEvent.clientY + 15) + 'px';
        });
        g.on('mouseout', () => { g.tint = 0xFFFFFF; document.getElementById('tooltip').style.display = 'none'; });

        try {
            const nT = new PIXI.Text(hex.name, { fontFamily: 'Cinzel', fontSize: 10, fill: 0xe0e5f0, dropShadow: true, dropShadowColor: 0x000000 });
            nT.anchor.set(0.5); nT.y = -HEX_SIZE * 0.35; container.addChild(nT);

            let terrIcon = hex.terrain === 'mountain' ? '⛰️' : (hex.terrain === 'forest' ? '🌲' : (hex.terrain === 'swamp' ? '☣️' : ''));
            if (terrIcon) {
                const iT = new PIXI.Text(terrIcon, { fontSize: Math.floor(HEX_SIZE * 0.35), dropShadow: true, dropShadowColor: 0x000000 });
                iT.anchor.set(0.5); iT.y = HEX_SIZE * 0.12; container.addChild(iT);
            }

            if (hex.owner === 'player' && hex.buildings.length > 0) {
                let bIcon = (hex.buildings.some(b => b.type === 'cemetery') ? '⚰️' : '') +
                            (hex.buildings.some(b => b.type === 'barracks') ? '⚔️' : '') +
                            (hex.buildings.some(b => b.type === 'castle') ? '🏰' : '');
                if (bIcon) {
                    const bT = new PIXI.Text(bIcon, { fontSize: Math.floor(HEX_SIZE * 0.25), fill: 0xffd700 });
                    bT.anchor.set(0.5); bT.y = HEX_SIZE * 0.55; container.addChild(bT);
                }
            }
            container.addChild(g);
            container.setChildIndex(g, 0);
        } catch(e) { container.addChild(g); }
        hexContainer.addChild(container);
    });
}

function showArmyComposition(hex) {
    let army = null, ownerName = '';
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
    if (!army) { log('В этом гексе нет армии.', 'system'); return; }
    let text = `🧛 Состав армии ${ownerName}:\n`;
    text += `Пехота: ${army.infantry || 0}\n`;
    text += `Лучники: ${army.archer || 0}\n`;
    text += `Кавалерия: ${army.cavalry || 0}\n`;
    if (army.gargoyle !== undefined) text += `Гаргульи: ${army.gargoyle || 0}\n`;
    if (army.noble !== undefined) text += `Аристократы: ${army.noble || 0}\n`;
    if (army.vampire !== undefined) text += `Вампиры: ${army.vampire || 0}\n`;
    if (army.necromancer !== undefined) text += `Некроманты: ${army.necromancer || 0}\n`;
    if (army.berserker !== undefined) text += `Берсерки: ${army.berserker || 0}\n`;
    alert(text);
}

function drawArmies() {
    if (!app) return;
    armyContainer.removeChildren();
    const w = app.renderer.view.width, h = app.renderer.view.height;
    let minQ = Infinity, maxQ = -Infinity, minR = Infinity, maxR = -Infinity;
    game.hexGrid.forEach(hex => {
        minQ = Math.min(minQ, hex.q); maxQ = Math.max(maxQ, hex.q);
        minR = Math.min(minR, hex.r); maxR = Math.max(maxR, hex.r);
    });
    let HEX_SIZE = Math.min(w / ((maxQ - minQ + 1) * 1.8), h / ((maxR - minR + 1) * 1.6), 80) * 0.85;
    if (HEX_SIZE < 12) HEX_SIZE = 12;
    let rawPositions = game.hexGrid.map(hex => {
        const p = hexToPixel(hex.q, hex.r, HEX_SIZE);
        return { ...hex, rawX: p.x, rawY: p.y };
    });
    let avgX = 0, avgY = 0;
    rawPositions.forEach(p => { avgX += p.rawX; avgY += p.rawY; });
    avgX /= rawPositions.length; avgY /= rawPositions.length;
    let shiftX = (w / 2) - avgX, shiftY = (h / 2) - avgY;

    function placeSprite(texture, x, y, scale = 0.12, fallbackColor, fallbackSymbol) {
        if (texture) {
            const s = new PIXI.Sprite(texture);
            s.anchor.set(0.5);
            s.scale.set(scale);
            s.x = x; s.y = y;
            armyContainer.addChild(s);
        } else {
            const c = new PIXI.Graphics();
            c.beginFill(fallbackColor);
            c.drawCircle(0, 0, 16);
            c.endFill();
            c.lineStyle(2, 0x000000, 0.5);
            c.drawCircle(0, 0, 16);
            const t = new PIXI.Text(fallbackSymbol, { fontFamily: 'Cinzel', fontSize: 12, fill: 0xffffff, fontWeight: 'bold' });
            t.anchor.set(0.5);
            c.addChild(t);
            const countText = new PIXI.Text(`${getTotalTroops(game.player.mobileArmy)}`, { fontFamily: 'Arial', fontSize: 8, fill: 0xffffff });
            countText.anchor.set(0.5);
            countText.y = 14;
            c.addChild(countText);
            c.x = x; c.y = y;
            armyContainer.addChild(c);
        }
    }

    const pPos = game.hexGrid.find(h => `${h.q},${h.r}` === game.player.mobileArmy.hexId);
    if (pPos) {
        let p = hexToPixel(pPos.q, pPos.r, HEX_SIZE);
        let x = p.x + shiftX, y = p.y + shiftY;
        placeSprite(spritePlayer, x, y, 0.12, 0x7a1111, '🦇');
        if (game.player.lords.length > 0 && spriteLord) {
            const l = new PIXI.Sprite(spriteLord);
            l.anchor.set(0.5);
            l.scale.set(0.07);
            l.x = x + 25; l.y = y - 20;
            armyContainer.addChild(l);
        }
        if (game.player.mobileArmy.gargoyle > 0) {
            const gT = new PIXI.Text(`🪨${game.player.mobileArmy.gargoyle}`, { fontSize: 10, fill: 0x8888ff, dropShadow: true });
            gT.anchor.set(0.5); gT.x = x - 20; gT.y = y + 20;
            armyContainer.addChild(gT);
        }
        if (game.player.mobileArmy.noble > 0) {
            const nT = new PIXI.Text(`🧛${game.player.mobileArmy.noble}`, { fontSize: 10, fill: 0xff88aa, dropShadow: true });
            nT.anchor.set(0.5); nT.x = x + 20; nT.y = y + 20;
            armyContainer.addChild(nT);
        }
        if (game.player.mobileArmy.vampire > 0) {
            const vT = new PIXI.Text(`🧛‍♂️${game.player.mobileArmy.vampire}`, { fontSize: 10, fill: 0xff0044, dropShadow: true });
            vT.anchor.set(0.5); vT.x = x - 30; vT.y = y + 20;
            armyContainer.addChild(vT);
        }
        if (game.player.mobileArmy.necromancer > 0) {
            const nT = new PIXI.Text(`💀${game.player.mobileArmy.necromancer}`, { fontSize: 10, fill: 0x44ff44, dropShadow: true });
            nT.anchor.set(0.5); nT.x = x + 30; nT.y = y + 20;
            armyContainer.addChild(nT);
        }
        if (game.player.mobileArmy.berserker > 0) {
            const bT = new PIXI.Text(`⚔️${game.player.mobileArmy.berserker}`, { fontSize: 10, fill: 0xffaa44, dropShadow: true });
            bT.anchor.set(0.5); bT.x = x - 10; bT.y = y + 30;
            armyContainer.addChild(bT);
        }
    }

    const aPos = game.hexGrid.find(h => `${h.q},${h.r}` === game.ai.mobileArmy.hexId);
    if (aPos) {
        let p = hexToPixel(aPos.q, aPos.r, HEX_SIZE);
        let x = p.x + shiftX, y = p.y + shiftY;
        placeSprite(spriteAI, x, y, 0.14, 0xe0e0c0, '✝');
        if (spriteAIGeneral) {
            const g = new PIXI.Sprite(spriteAIGeneral);
            g.anchor.set(0.5);
            g.scale.set(0.07);
            g.x = x + 25; g.y = y - 20;
            armyContainer.addChild(g);
        }
    }

    const wPos = game.hexGrid.find(h => `${h.q},${h.r}` === game.werewolf.mobileArmy.hexId);
    if (wPos) {
        let p = hexToPixel(wPos.q, wPos.r, HEX_SIZE);
        let x = p.x + shiftX, y = p.y + shiftY;
        placeSprite(spriteWerewolf, x, y, 0.12, 0x2d4a2d, '👹');
        if (spriteWolfGeneral) {
            const g = new PIXI.Sprite(spriteWolfGeneral);
            g.anchor.set(0.5);
            g.scale.set(0.07);
            g.x = x + 25; g.y = y - 20;
            armyContainer.addChild(g);
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
        log(`Выбрана ${hex.name} для стройки.`, 'system');
        updateUI(); return;
    }

    const currentHexId = `${cH.q},${cH.r}`;
    const clickedHexId = `${hex.q},${hex.r}`;
    const neighbors = getNeighbors(Number(cH.q), Number(cH.r));
    const isNeighbor = neighbors.some(n => `${n.q},${n.r}` === clickedHexId);
    if (!isNeighbor) { log('Слишком далеко! Кликайте только по соседним гексам.', 'system'); return; }

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
        } else { log(`Армия переместилась в ${hex.name}.`, 'player'); }
        game.player.ap -= 1;
        updateUI(); return;
    }

    if (hex.owner === 'ai' || hex.owner === 'werewolf') {
        if (!isNightTime()) {
            log('🌞 День! Атака возможна только ночью. Завершите ход, чтобы наступила ночь.', 'player');
            return;
        }
        if (game.player.ap <= 0) {
            log('Нет очков действий. Завершите ход.', 'system');
            return;
        }
        if (getTotalTroops(game.player.mobileArmy) === 0) { log('Нет войск для атаки.', 'system'); return; }
        game.pendingActionHexId = clickedHexId;
        document.getElementById('action-desc').textContent = `Ваша армия вошла в «${hex.name}». Выберите действие.`;
        document.getElementById('action-modal').style.display = 'flex';
    }
}

// === БОЕВЫЕ ДЕЙСТВИЯ (без изменений) ===
function executeCurse(targetHex) {
    if (game.battleActive) return;
    game.battleActive = true;
    let defGar = targetHex.owner === 'player' ? targetHex.playerGarrison : targetHex.aiGarrison;
    let totalDef = getTotalTroops(defGar) + targetHex.fortification * 5;
    let defLoss = 30 + Math.floor(Math.random() * 10);
    if (defLoss > totalDef) defLoss = totalDef;
    const types = ['infantry', 'archer', 'cavalry', 'gargoyle', 'noble', 'vampire', 'necromancer', 'berserker'];
    types.forEach(t => {
        if (defGar[t] > 0) defGar[t] = Math.max(0, defGar[t] - Math.floor(defLoss * (defGar[t] / (totalDef + 1))));
    });
    log(`Проклятие на ${targetHex.name}! Урон: ${defLoss}.`, 'system');
    SoundEngine.playCurse();
    if (getTotalTroops(defGar) <= 0) {
        log(`Провинция ${targetHex.name} захвачена магией!`, 'player');
        targetHex.owner = 'player'; targetHex.siegeBy = null;
        targetHex.aiGarrison = { infantry: 0, archer: 0, cavalry: 0, gargoyle: 0, noble: 0, vampire: 0, necromancer: 0, berserker: 0 };
        game.player.mobileArmy.hexId = `${targetHex.q},${targetHex.r}`;
        document.getElementById('surrender-modal').style.display = 'flex';
    } else {
        log('Проклятие отбито!', 'system');
        const fb = game.hexGrid.find(h => h.owner === 'player');
        if (fb) game.player.mobileArmy.hexId = `${fb.q},${fb.r}`;
    }
    game.battleActive = false; updateUI();
}

function executeBribe(targetHex) {
    if (game.player.gold < 100) { log('Недостаточно золота!', 'system'); return; }
    game.player.gold -= 100;
    log(`${targetHex.name} подкуплена!`, 'player');
    targetHex.owner = 'player'; targetHex.siegeBy = null;
    targetHex.aiGarrison = { infantry: 0, archer: 0, cavalry: 0, gargoyle: 0, noble: 0, vampire: 0, necromancer: 0, berserker: 0 };
    game.player.mobileArmy.hexId = `${targetHex.q},${targetHex.r}`;
    document.getElementById('surrender-modal').style.display = 'flex';
    updateUI();
}

function executeBattle(targetHex) {
    if (game.battleActive) return;
    game.battleActive = true;
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
    let vampireCount = attArmy.vampire || 0;
    let berserkerCount = attArmy.berserker || 0;
    let necromancerCount = attArmy.necromancer || 0;
    effectiveAtt += vampireCount * 2.0;
    effectiveAtt += berserkerCount * 1.5;
    effectiveAtt += (attArmy.gargoyle || 0) * 1.2 + (attArmy.noble || 0) * 1.5;

    let attLoss = Math.floor(Math.random() * 0.2 * effectiveAtt);
    let defLoss = Math.floor(Math.random() * 0.2 * totalDef);
    if (attLoss > totalAtt) attLoss = totalAtt - 1;
    if (defLoss > totalDef) defLoss = totalDef - 1;

    const types = ['infantry', 'archer', 'cavalry', 'gargoyle', 'noble', 'vampire', 'necromancer', 'berserker'];
    types.forEach(t => {
        if (attArmy[t] > 0) attArmy[t] = Math.max(0, attArmy[t] - Math.floor(attLoss * (attArmy[t] / (totalAtt + 1))));
        if (defGar[t] > 0) defGar[t] = Math.max(0, defGar[t] - Math.floor(defLoss * (defGar[t] / (totalDef + 1))));
    });

    if (necromancerCount > 0) {
        let resurrect = Math.floor(attLoss * 0.1);
        attArmy.infantry = (attArmy.infantry || 0) + resurrect;
        log(`Некроманты воскресили ${resurrect} пехотинцев.`, 'player');
    }

    log(`Бой за ${targetHex.name}! Потери: Вы ${attLoss}, Враг ${defLoss}.`, 'system');
    SoundEngine.playBattle();

    if (getTotalTroops(defGar) <= 0) {
        log(`Провинция ${targetHex.name} захвачена!`, 'player');
        targetHex.owner = 'player'; targetHex.siegeBy = null;
        targetHex.aiGarrison = { infantry: 0, archer: 0, cavalry: 0, gargoyle: 0, noble: 0, vampire: 0, necromancer: 0, berserker: 0 };
        game.player.mobileArmy.hexId = `${targetHex.q},${targetHex.r}`;
        if ((attArmy.noble || 0) > 0) {
            let gain = (attArmy.noble || 0) * 2;
            game.humanity = Math.min(100, game.humanity + gain);
            log(`Аристократы вдохновили войско, +${gain} Человечности.`, 'player');
        }
        document.getElementById('surrender-modal').style.display = 'flex';
    } else {
        log('Штурм отбит!', 'system');
        const fb = game.hexGrid.find(h => h.owner === 'player');
        if (fb) game.player.mobileArmy.hexId = `${fb.q},${fb.r}`;
    }
    game.battleActive = false; updateUI();
}

// === ЭКОНОМИКА, ИИ, СОБЫТИЯ (без изменений) ===
function collectIncome() {
    let bloodBonus = 0, goldBonus = 0;
    game.hexGrid.forEach(h => {
        if (h.owner === 'player') {
            goldBonus += 2 + (h.resources?.gold || 0);
            bloodBonus += 1 + (h.resources?.blood || 0);
            h.buildings.forEach(b => {
                if (b.type === 'cemetery') bloodBonus += 5;
                if (b.type === 'altar') bloodBonus += 10;
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
    if (game.ai.gold > 20 && game.ai.mobileArmy.infantry < 80) {
        game.ai.gold -= 10; game.ai.mobileArmy.infantry += 5;
    }
    if (game.ai.gold > 30 && game.ai.mobileArmy.archer < 30) {
        game.ai.gold -= 15; game.ai.mobileArmy.archer += 3;
    }
    const aiHexes = game.hexGrid.filter(h => h.owner === 'ai');
    for (let h of aiHexes) {
        if (game.ai.gold > 20 && !h.buildings.some(b => b.type === 'barracks') && Math.random() < 0.2) {
            game.ai.gold -= 20; h.buildings.push({ type: 'barracks', lvl: 1 });
            log('Ватикан построил Казармы в ' + h.name, 'ai');
        }
        if (game.ai.gold > 40 && !h.buildings.some(b => b.type === 'castle') && Math.random() < 0.15) {
            game.ai.gold -= 40; h.buildings.push({ type: 'castle', lvl: 1 });
            h.fortification += 2;
            log('Ватикан построил Замок в ' + h.name, 'ai');
        }
        if (game.ai.gold > 50 && !h.buildings.some(b => b.type === 'altar') && Math.random() < 0.1) {
            game.ai.gold -= 25; h.buildings.push({ type: 'altar', lvl: 1 });
            log('Ватикан построил Алтарь в ' + h.name, 'ai');
        }
    }
    const playerPower = getTotalTroops(game.player.mobileArmy);
    const aiPower = getTotalTroops(game.ai.mobileArmy);
    if (playerPower > aiPower * 1.5 && game.player.truceTurnsAI === 0 && game.player.truceTurnsWolf === 0) {
        if (Math.random() < 0.3) {
            log('Ватикан предлагает перемирие на 2 хода.', 'ai');
            game.player.truceTurnsAI = 2;
        }
    }
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
    const types = ['infantry', 'archer', 'cavalry', 'gargoyle', 'noble', 'vampire', 'necromancer', 'berserker'];
    types.forEach(t => {
        if (attArmy[t] > 0) attArmy[t] = Math.max(0, attArmy[t] - Math.floor(attLoss * (attArmy[t] / (totalAtt + 1))));
        if (defGar[t] > 0) defGar[t] = Math.max(0, defGar[t] - Math.floor(defLoss * (defGar[t] / (totalDef + 1))));
    });
    if (getTotalTroops(defGar) <= 0) {
        targetHex.owner = 'ai';
        targetHex.playerGarrison = { infantry: 0, archer: 0, cavalry: 0, gargoyle: 0, noble: 0, vampire: 0, necromancer: 0, berserker: 0 };
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
    const types = ['infantry', 'archer', 'cavalry', 'gargoyle', 'noble', 'vampire', 'necromancer', 'berserker'];
    types.forEach(t => {
        if (attArmy[t] > 0) attArmy[t] = Math.max(0, attArmy[t] - Math.floor(attLoss * (attArmy[t] / (totalAtt + 1))));
        if (defGar[t] > 0) defGar[t] = Math.max(0, defGar[t] - Math.floor(defLoss * (defGar[t] / (totalDef + 1))));
    });
    if (getTotalTroops(defGar) <= 0) {
        targetHex.owner = 'werewolf';
        targetHex.playerGarrison = { infantry: 0, archer: 0, cavalry: 0, gargoyle: 0, noble: 0, vampire: 0, necromancer: 0, berserker: 0 };
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
            const key = btn.getAttribute('data-lore');
            const text = BUILD_LORE[key];
            if (text) {
                const t = document.getElementById('lore-tooltip');
                if (t) {
                    t.textContent = text;
                    t.style.display = 'block';
                    t.style.left = (e.pageX + 10) + 'px';
                    t.style.top = (e.pageY + 10) + 'px';
                }
            }
        });
        btn.addEventListener('mouseleave', () => {
            const t = document.getElementById('lore-tooltip');
            if (t) t.style.display = 'none';
        });
    });
}

// ================= ПРОЛОГ =================
let isTypingComplete = false;

function startTypeWriter() {
    const container = document.getElementById('prologue-text-container');
    const btnWrapper = document.getElementById('prologue-btn-wrapper');
    if (!container) return;
    container.innerHTML = '';

    const storyText = `Граф Дракула, последний из древнего рода, пробуждается спустя столетия. Им движет не только жажда крови, но и пылающая, неутолимая любовь к прекрасной Кассальдии — дочери его самого могущественного врага. Он хочет подарить ей мир, где она будет в безопасности, но его собственная вампирская сущность жаждет власти и хаоса. Святой Престол во главе с Папой Эмиретиусом Клавдием II объявил крестовый поход против вампиров. Эмиретиус держит свою дочь Кассальдию в строгой изоляции, используя её как пешку для укрепления своей власти. Дракула должен объединить и завоевать все земли Европы, чтобы сокрушить Ватикан и освободить её. Каждое убийство делает Дракулу сильнее, но оно же отдаляет его от человечности, которую он пытается сохранить ради Кассальдии. Он боится, что, достигнув цели, он станет чудовищем, которое она не сможет полюбить. Ватикан не остановится ни перед чем. Им противостоят дикие Оборотни, жаждущие крови. Но даже объединившись, они не смогут противостоять Армии Тьмы, которую ведёт Дракула. Европа — это поле боя, а судьба Кассальдии — главный приз. Сделайте правильный выбор, Повелитель Тьмы!`;

    const paragraphs = storyText.split('\n').filter(p => p.trim() !== '');
    let pIdx = 0, cIdx = 0, currentP = null;

    function typeNext() {
        if (pIdx >= paragraphs.length) {
            isTypingComplete = true;
            btnWrapper.style.display = 'flex';
            return;
        }
        if (cIdx === 0) {
            currentP = document.createElement('p');
            container.appendChild(currentP);
        }
        const text = paragraphs[pIdx].trim();
        if (cIdx < text.length) {
            currentP.textContent += text.charAt(cIdx);
            cIdx++;
            setTimeout(typeNext, 6);
        } else {
            cIdx = 0;
            pIdx++;
            setTimeout(typeNext, 500);
        }
    }
    typeNext();
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
    document.getElementById('btn-new-game').addEventListener('click', () => {
        localStorage.removeItem('DraculaHexFinal');
        initGame(true);
    });
    document.getElementById('btn-load-game').addEventListener('click', () => {
        initGame(false);
    });
    document.getElementById('btn-gameover-restart').addEventListener('click', () => {
        document.getElementById('gameover-modal').style.display = 'none';
        localStorage.removeItem('DraculaHexFinal');
        initGame(true);
    });

    document.getElementById('btn-music-toggle').addEventListener('click', () => {
        const bgm = document.getElementById('bgm');
        if (bgm.paused) {
            bgm.volume = 0.4;
            bgm.play().catch(() => {});
            document.getElementById('btn-music-toggle').textContent = 'ЗВУК';
        } else {
            bgm.pause();
            document.getElementById('btn-music-toggle').textContent = 'ЗВУК';
        }
    });

    document.getElementById('btn-mnu-restart').addEventListener('click', () => {
        if (confirm('Выйти в главное меню? Прогресс будет потерян.')) {
            document.getElementById('start-menu').style.display = 'flex';
            document.getElementById('game-container').style.display = 'none';
            game.gameOver = false;
            document.getElementById('gameover-modal').style.display = 'none';
        }
    });

    document.getElementById('btn-end-turn').addEventListener('click', endPlayerTurn);

    document.getElementById('btn-toggle-log').addEventListener('click', () => {
        document.getElementById('log-overlay').style.display = 'flex';
    });
    document.getElementById('btn-close-log').addEventListener('click', () => {
        document.getElementById('log-overlay').style.display = 'none';
    });
    document.getElementById('btn-clear-log').addEventListener('click', () => {
        document.getElementById('log-container').innerHTML = '';
    });

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

    const openModal = (id) => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'flex';
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

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
    });

    document.getElementById('btn-action-close').addEventListener('click', () => {
        document.getElementById('action-modal').style.display = 'none';
    });

    document.getElementById('btn-siege').addEventListener('click', () => {
        if (!game.pendingActionHexId || game.player.ap <= 0) return;
        const h = game.hexGrid.find(x => `${x.q},${x.r}` === game.pendingActionHexId);
        h.siegeBy = 'player';
        game.player.mobileArmy.hexId = `${h.q},${h.r}`;
        game.player.ap -= 1;
        log(`${h.name} взята в осаду!`, 'player');
        document.getElementById('action-modal').style.display = 'none';
        updateUI();
    });

    document.getElementById('btn-assault-now').addEventListener('click', () => {
        if (!game.pendingActionHexId) return;
        const h = game.hexGrid.find(x => `${x.q},${x.r}` === game.pendingActionHexId);
        game.player.mobileArmy.hexId = `${h.q},${h.r}`;
        game.player.ap -= 1;
        document.getElementById('action-modal').style.display = 'none';
        executeBattle(h);
    });

    document.getElementById('btn-curse').addEventListener('click', () => {
        if (!game.pendingActionHexId || game.player.ap <= 0) return;
        if (game.player.blood < 15) return log('Недостаточно крови!', 'system');
        const h = game.hexGrid.find(x => `${x.q},${x.r}` === game.pendingActionHexId);
        game.player.mobileArmy.hexId = `${h.q},${h.r}`;
        game.player.ap -= 1;
        game.player.blood -= 15;
        document.getElementById('action-modal').style.display = 'none';
        executeCurse(h);
    });

    document.getElementById('btn-bribe').addEventListener('click', () => {
        if (!game.pendingActionHexId || game.player.ap <= 0) return;
        if (game.player.gold < 100) return log('Недостаточно золота!', 'system');
        const h = game.hexGrid.find(x => `${x.q},${x.r}` === game.pendingActionHexId);
        game.player.mobileArmy.hexId = `${h.q},${h.r}`;
        game.player.ap -= 1;
        document.getElementById('action-modal').style.display = 'none';
        executeBribe(h);
    });

    document.getElementById('btn-assault').addEventListener('click', () => {
        if (!isNightTime()) return log('День! Штурм отменяется.', 'player');
        if (game.player.ap <= 0) return log('Нет очков действий.', 'system');
        const h = game.hexGrid.find(x => `${x.q},${x.r}` === game.player.mobileArmy.hexId);
        if (h && h.siegeBy === 'player') {
            game.player.ap -= 1;
            executeBattle(h);
        }
    });

    document.getElementById('btn-cancel-siege').addEventListener('click', () => {
        const h = game.hexGrid.find(x => `${x.q},${x.r}` === game.player.mobileArmy.hexId);
        if (h && h.siegeBy === 'player') {
            h.siegeBy = null;
            log(`Осада снята с ${h.name}.`, 'player');
            updateUI();
        }
    });

    document.getElementById('dip-truce-ai').addEventListener('click', () => {
        if (game.player.gold < 30) return log('Не хватает золота.', 'system');
        if (game.player.truceTurnsAI > 0) return log('Перемирие уже активно.', 'system');
        game.player.gold -= 30;
        game.player.truceTurnsAI = 2;
        log('Перемирие с Ватиканом на 2 хода!', 'player');
        document.getElementById('diplomacy-modal').style.display = 'none';
        updateUI();
    });

    document.getElementById('dip-truce-wolf').addEventListener('click', () => {
        if (game.player.gold < 30) return log('Не хватает золота.', 'system');
        if (game.player.truceTurnsWolf > 0) return log('Перемирие уже активно.', 'system');
        game.player.gold -= 30;
        game.player.truceTurnsWolf = 2;
        log('Перемирие с Оборотнями на 2 хода!', 'player');
        document.getElementById('diplomacy-modal').style.display = 'none';
        updateUI();
    });

    document.getElementById('dip-alliance').addEventListener('click', () => {
        if (game.player.gold < 50) return log('Не хватает золота.', 'system');
        if (game.player.allianceWithAI) return log('Союз уже активен.', 'system');
        game.player.gold -= 50;
        game.player.allianceWithAI = true;
        log('Союз с Ватиканом против Оборотней!', 'player');
        document.getElementById('diplomacy-modal').style.display = 'none';
        updateUI();
    });

    document.getElementById('mkt-gold-to-blood').addEventListener('click', () => {
        if (game.marketTradedThisTurn && !game.player.techs.tradeRoutes) {
            return log('Рынок уже использован в этом ходу.', 'system');
        }
        if (game.player.gold < 10) return log('Недостаточно золота.', 'system');
        const rate = game.marketRates.goldToBlood;
        const blood = Math.floor(10 * rate);
        game.player.gold -= 10;
        game.player.blood += blood;
        game.marketTradedThisTurn = true;
        log(`Обмен: 10🪙 -> ${blood}🩸`, 'player');
        document.getElementById('market-modal').style.display = 'none';
        updateUI();
    });

    document.getElementById('mkt-blood-to-gold').addEventListener('click', () => {
        if (game.marketTradedThisTurn && !game.player.techs.tradeRoutes) {
            return log('Рынок уже использован в этом ходу.', 'system');
        }
        if (game.player.blood < 10) return log('Недостаточно крови.', 'system');
        const rate = game.marketRates.bloodToGold;
        const gold = Math.floor(10 * rate);
        game.player.blood -= 10;
        game.player.gold += gold;
        game.marketTradedThisTurn = true;
        log(`Обмен: 10🩸 -> ${gold}🪙`, 'player');
        document.getElementById('market-modal').style.display = 'none';
        updateUI();
    });

    document.getElementById('mkt-rate-gtb').textContent = Math.floor(game.marketRates.goldToBlood * 10) / 10;
    document.getElementById('mkt-rate-btg').textContent = Math.floor(game.marketRates.bloodToGold * 10) / 10;

    document.getElementById('tech-reform').addEventListener('click', () => {
        if (game.player.gold < 30) return log('Не хватает золота.', 'system');
        if (game.player.techs.militaryReform) return log('Уже изучено.', 'system');
        game.player.gold -= 30;
        game.player.techs.militaryReform = true;
        log('Изучена Военная реформа! Открыты Гаргульи.', 'player');
        document.getElementById('tech-modal').style.display = 'none';
        updateUI();
    });

    document.getElementById('tech-necro').addEventListener('click', () => {
        if (game.player.gold < 30) return log('Не хватает золота.', 'system');
        if (game.player.techs.necromancy) return log('Уже изучено.', 'system');
        game.player.gold -= 30;
        game.player.techs.necromancy = true;
        log('Изучена Некромантия! Открыты Аристократы.', 'player');
        document.getElementById('tech-modal').style.display = 'none';
        updateUI();
    });

    document.getElementById('tech-trade').addEventListener('click', () => {
        if (game.player.gold < 30) return log('Не хватает золота.', 'system');
        if (game.player.techs.tradeRoutes) return log('Уже изучено.', 'system');
        game.player.gold -= 30;
        game.player.techs.tradeRoutes = true;
        log('Изучены Торговые пути! Рынок без ограничений.', 'player');
        document.getElementById('tech-modal').style.display = 'none';
        updateUI();
    });

    // ===== ПОСТРОЙКИ (старые) =====
    const builds = {
        'build-cemetery': 'cemetery',
        'build-barracks': 'barracks',
        'build-barracks-2': 'barracks_lv2',
        'build-ritual': 'dark_temple',
        'build-dungeon': 'dungeon',
        'build-executions': 'executions',
        'build-ball': 'ball',
        'build-center': 'center',
        'build-citadel': 'citadel',
        'build-wall': 'wall',
        'build-castle': 'castle',
        'build-market': 'market'
    };
    const buildCosts = {
        'cemetery': 30, 'barracks': 20, 'barracks_lv2': 50, 'dark_temple': 20,
        'dungeon': 15, 'executions': 10, 'ball': 30, 'center': 25,
        'citadel': 40, 'wall': 10, 'castle': 40, 'market': 20
    };
    Object.keys(builds).forEach(id => {
        document.getElementById(id).addEventListener('click', () => {
            if (game.player.ap <= 0) return log('Нет очков действий.', 'system');
            if (!game.selectedHexId) return log('Выберите свой гекс на карте.', 'system');
            const h = game.hexGrid.find(x => `${x.q},${x.r}` === game.selectedHexId);
            if (!h || h.owner !== 'player') return log('Не ваша территория.', 'system');
            const type = builds[id];
            if (game.player.gold < buildCosts[type]) return log('Не хватает золота.', 'system');
            if (h.buildings.find(b => b.type === type)) return log('Уже построено.', 'system');
            game.player.gold -= buildCosts[type];
            h.buildings.push({ type: type, lvl: 1 });
            if (type === 'wall') h.fortification += 1;
            else if (type === 'castle') { h.fortification += 2; h.playerGarrison.infantry += 20; }
            else if (type === 'citadel') game.player.hasCitadel = true;
            log(`Построено: ${type} в ${h.name}.`, 'player');
            SoundEngine.playBuild();
            game.player.ap -= 1;
            updateUI();
        });
    });

    // ===== НОВЫЕ ПОСТРОЙКИ =====
    const newBuilds = {
        'build-altar': 'altar',
        'build-tower': 'tower',
        'build-dungeon2': 'dungeon2'
    };
    const newBuildCosts = { 'altar': 25, 'tower': 30, 'dungeon2': 20 };
    Object.keys(newBuilds).forEach(id => {
        document.getElementById(id).addEventListener('click', () => {
            if (game.player.ap <= 0) return log('Нет очков действий.', 'system');
            if (!game.selectedHexId) return log('Выберите свой гекс на карте.', 'system');
            const h = game.hexGrid.find(x => `${x.q},${x.r}` === game.selectedHexId);
            if (!h || h.owner !== 'player') return log('Не ваша территория.', 'system');
            const type = newBuilds[id];
            if (game.player.gold < newBuildCosts[type]) return log('Не хватает золота.', 'system');
            if (h.buildings.find(b => b.type === type)) return log('Уже построено.', 'system');
            game.player.gold -= newBuildCosts[type];
            h.buildings.push({ type: type, lvl: 1 });
            if (type === 'tower') h.fortification += 2;
            else if (type === 'dungeon2') h.playerGarrison.infantry = (h.playerGarrison.infantry || 0) + 15;
            log(`Построено: ${type} в ${h.name}.`, 'player');
            SoundEngine.playBuild();
            game.player.ap -= 1;
            updateUI();
        });
    });

    // ===== ПРИЗЫВ (старые) =====
    const recruitTypes = ['infantry', 'archer', 'cavalry', 'knights', 'lord', 'soul_collector', 'gargoyle', 'noble'];
    const recruitCosts = {
        'infantry': 10, 'archer': 15, 'cavalry': 20, 'knights': 30,
        'lord': 10, 'soul_collector': 25, 'gargoyle': 25, 'noble': 40
    };
    const recruitFunc = {
        'infantry': (h) => { if (!h.buildings.some(b => b.type === 'barracks')) return 'Нужны Казармы.'; addTroops(h, 'infantry', 5); return 'ok'; },
        'archer': (h) => { if (!h.buildings.some(b => b.type === 'barracks')) return 'Нужны Казармы.'; addTroops(h, 'archer', 5); return 'ok'; },
        'cavalry': (h) => { if (!h.buildings.some(b => b.type === 'barracks')) return 'Нужны Казармы.'; addTroops(h, 'cavalry', 3); return 'ok'; },
        'knights': (h) => { if (!h.buildings.some(b => b.type === 'barracks' && b.lvl === 2)) return 'Нужны Казармы Lv2.'; addTroops(h, 'cavalry', 2); return 'ok'; },
        'lord': (h) => {
            if (!h.buildings.some(b => b.type === 'dark_temple')) return 'Нужен Храм Тьмы.';
            if (game.player.gold < 10) return 'Нужно 10 золота.';
            game.player.gold -= 10;
            game.player.lords.push({ name: LORD_NAMES[game.player.lords.length % LORD_NAMES.length], battles: 0 });
            log(`Лорд "${LORD_NAMES[game.player.lords.length - 1]}" примкнул!`, 'player');
            return 'ok';
        },
        'soul_collector': (h) => {
            if (!game.player.hasCitadel) return 'Постройте Цитадель.';
            if (game.player.gold < 25) return 'Нужно 25 золота.';
            game.player.gold -= 25;
            log('Сборщик душ нанят!', 'player');
            return 'ok';
        },
        'gargoyle': (h) => {
            if (!game.player.techs.militaryReform) return 'Нужна Военная реформа.';
            if (game.player.gold < 25) return 'Нужно 25 золота.';
            game.player.gold -= 25;
            addTroops(h, 'gargoyle', 3);
            return 'ok';
        },
        'noble': (h) => {
            if (!game.player.techs.necromancy) return 'Нужна Некромантия.';
            if (game.player.gold < 40) return 'Нужно 40 золота.';
            game.player.gold -= 40;
            addTroops(h, 'noble', 1);
            return 'ok';
        }
    };

    function addTroops(h, type, count) {
        if (game.player.mobileArmy.hexId === `${h.q},${h.r}`) {
            game.player.mobileArmy[type] = (game.player.mobileArmy[type] || 0) + count;
        } else {
            h.playerGarrison[type] = (h.playerGarrison[type] || 0) + count;
        }
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
                game.player.ap -= 1;
                updateUI();
            });
        }
    });

    // ===== НОВЫЕ ЮНИТЫ =====
    const newRecruitTypes = ['vampire', 'necromancer', 'berserker'];
    const newRecruitCosts = { 'vampire': 35, 'necromancer': 25, 'berserker': 15 };
    const newRecruitFunc = {
        'vampire': (h) => {
            if (game.player.gold < 35) return 'Нужно 35 золота.';
            game.player.gold -= 35;
            addTroops(h, 'vampire', 2);
            return 'ok';
        },
        'necromancer': (h) => {
            if (game.player.gold < 25) return 'Нужно 25 золота.';
            game.player.gold -= 25;
            addTroops(h, 'necromancer', 1);
            return 'ok';
        },
        'berserker': (h) => {
            if (game.player.gold < 15) return 'Нужно 15 золота.';
            game.player.gold -= 15;
            addTroops(h, 'berserker', 3);
            return 'ok';
        }
    };

    newRecruitTypes.forEach(type => {
        const id = `recruit-${type}`;
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => {
                if (game.player.ap <= 0) return log('Нет очков действий.', 'system');
                if (!game.selectedHexId) return log('Выберите свой гекс на карте.', 'system');
                const h = game.hexGrid.find(x => `${x.q},${x.r}` === game.selectedHexId);
                if (!h || h.owner !== 'player') return log('Не ваша территория.', 'system');
                if (game.player.gold < newRecruitCosts[type]) return log('Не хватает золота.', 'system');
                const result = newRecruitFunc[type](h);
                if (result !== 'ok') return log(result, 'system');
                game.player.ap -= 1;
                updateUI();
            });
        }
    });

    // ===== ГАРНИЗОН =====
    document.getElementById('btn-garrison-add').addEventListener('click', () => {
        if (game.player.ap <= 0) return log('Нет очков действий.', 'system');
        const h = game.hexGrid.find(x => `${x.q},${x.r}` === game.player.mobileArmy.hexId);
        if (!h || h.owner !== 'player' || getTotalTroops(game.player.mobileArmy) < 10) return log('Нет армии.', 'system');
        game.player.mobileArmy.infantry -= 10;
        h.playerGarrison.infantry += 10;
        log('10 бойцов оставлены в гарнизоне.', 'player');
        game.player.ap -= 1;
        updateUI();
    });

    document.getElementById('btn-garrison-take').addEventListener('click', () => {
        if (game.player.ap <= 0) return log('Нет очков действий.', 'system');
        const h = game.hexGrid.find(x => `${x.q},${x.r}` === game.player.mobileArmy.hexId);
        if (!h || h.owner !== 'player' || getTotalTroops(h.playerGarrison) < 10) return log('Нет гарнизона.', 'system');
        h.playerGarrison.infantry -= 10;
        game.player.mobileArmy.infantry += 10;
        log('10 бойцов призваны из гарнизона.', 'player');
        game.player.ap -= 1;
        updateUI();
    });

    // ===== СДАЧА ПРОВИНЦИИ =====
    document.getElementById('btn-exterminate').addEventListener('click', () => {
        const h = game.hexGrid.find(x => `${x.q},${x.r}` === game.player.mobileArmy.hexId);
        if (h) {
            game.player.gold += 150;
            game.player.blood += 80;
            game.humanity = Math.max(0, game.humanity - 20);
            game.cassaldiaTrust = Math.max(0, game.cassaldiaTrust - 10);
            log('Истребление! Кассальдия в ужасе.', 'player');
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
            log('Порабощение!', 'player');
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
            log('Обращение! Кассальдия довольна.', 'player');
            document.getElementById('surrender-modal').style.display = 'none';
            updateUI();
        }
    });

    attachLoreListeners();
});
