// ================= РАСШИРЕННЫЙ ЛОР (5 ПРЕДЛОЖЕНИЙ) =================
const BUILD_LORE = {
    'build': "СТРОИТЬ: Возводите тёмные сооружения, чтобы укрепить свою власть в захваченных землях. Каждое здание тратит 1 Очко Действия (AP) и требует золота. Стройте Казармы, чтобы пополнять армию, и Храмы, чтобы призывать Лордов. Возводите Стены и Замки для защиты провинций от вражеских вторжений. Тщательно планируйте цепочку построек, так как они открывают доступ к элитным юнитам.",
    'recruit': "ПРИЗВАТЬ: Найдите подходящих солдат и слуг среди покорённого населения или с помощью древних ритуалов. Каждый призыв тратит 1 Очко Действия (AP) и требует золота, а также наличия необходимых зданий. Базовые подразделения, такие как пехота и лучники, набираются в провинциях с Казармами Lv1. Элитные бойцы, вроде Рыцарей Тьмы и Сборщиков душ, требуют более продвинутых построек.",
    'garrison': "ГАРНИЗОН: Управляйте распределением войск между вашей мобильной армией и гарнизоном провинции. Оставленные в гарнизоне бойцы защищают территорию от вражеских набегов и дают вам время на перегруппировку. Призванные из гарнизона солдаты моментально пополняют вашу походную армию. Эта механика позволяет гибко реагировать на угрозы и не тратить золото на новый найм. Перемещение 10 бойцов стоит 1 Очко Действия (AP).",
    'assault': "ШТУРМ: Атакуйте вражескую провинцию, которая находится под вашей осадой. Штурм доступен исключительно в ночное время суток, когда силы тьмы наиболее могущественны. Наличие хотя бы одного Лорда в армии критически важно для успешного штурма. Каждая атака стоит 1 Очко Действия (AP) и наносит урон как вашим войскам, так и гарнизону противника. Результат битвы зависит от общей мощи вашей армии и боевого опыта ваших Лордов.",
    'cancelsiege': "СНЯТЬ ОСАДУ: Откажитесь от осады текущей провинции и отведите армию на соседнюю дружественную территорию. Это действие полезно, если вы переоценили свои силы или противник подтянул подкрепление. Снятие осады стоит 1 Очко Действия (AP) и позволяет перебросить армию в безопасное место. Помните, что вражеская провинция также снимает осадное положение и может начать контратаку. Используйте эту команду, чтобы сохранить армию и перегруппироваться.",
    'endturn': "СЛЕД. ХОД: Завершите текущий ход и передайте инициативу противникам. В начале вашего следующего хода будет автоматически собран доход со всех подконтрольных провинций. У вас восстановятся все Очки Действий (AP) до максимума. Переключение между днём и ночью влияет на доступность штурмов. Будьте внимательны: враги тоже делают свои ходы и могут атаковать вас!",
    'newgame': "НОВАЯ ИГРА: Начните новое завоевание Европы с чистого листа. Все текущие успехи и сохранения будут стерты, карта вернётся в изначальное состояние. Вы начнёте с базовой армией, 2 Очками Действий и начальным запасом золота и крови. Это единственный способ полностью обнулить партию и опробовать новую стратегию завоевания.",
    'load': "ЗАГРУЗИТЬ: Загрузить ранее сохранённую партию из локального хранилища вашего браузера. Это позволяет продолжить игру с того места, где вы остановились. Если сохранения нет, игра начнётся заново. Используйте сохранение, чтобы не потерять прогресс в большой кампании.",
    'menu': "МЕНЮ: Выйдите из текущей игры в главное меню. Прогресс текущего хода не будет сохранён, и вам предложат подтвердить это действие. В главном меню вы сможете начать новую игру или загрузить старую партию. Убедитесь, что вы сохранились через кнопку 'СОХРАНИТЬ' перед выходом.",
    'music': "ЗВУК: Включите или выключите фоновое музыкальное сопровождение. Музыка помогает погрузиться в мрачную атмосферу завоеваний и сражений. Если звук пропал, проверьте, не заблокировал ли его браузер. Нажатие на кнопку переключает состояние громкости.",
    'clearlog': "ОЧИСТИТЬ: Стереть все записи в боковой панели 'Хроники Тьмы'. Это сделает лог чистым и позволит сосредоточиться на новых событиях. Исторические записи не влияют на игровой процесс и служат только для информации.",
    'cemetery': "Кладбище: Дарует +5 крови каждый ход за счёт энергии мёртвых. Это пассивный источник ресурса, который крайне важен для найма элитных юнитов. Вампиры черпают силу в смерти, и кладбище — идеальное место для пополнения запасов крови. Стройте его на своих первых землях для быстрой экономики.",
    'barracks': "Казармы Lv1: Открывает возможность найма обычных войск (5 Пехоты, 5 Лучников, 3 Кавалерии). Без этого здания вы не сможете пополнять ряды своей мобильной армии. Это первый шаг к созданию боеспособного отряда для захвата нейтральных территорий. Казармы — сердце любой военной провинции.",
    'barracks_lv2': "Казармы Lv2: Улучшенные казармы, которые позволяют призывать Рыцарей Тьмы. Для постройки Lv2 необходимо, чтобы в провинции уже были обычные Казармы Lv1. Рыцари Тьмы — это элитные тяжёлые бойцы, способные переломить ход битвы. Инвестируйте в это здание, чтобы получить доступ к сильнейшей пехоте.",
    'ritual': "Храм Тьмы: Священное место для тёмных ритуалов, открывающее найм Верховных Лордов. Лорды — ключевые генералы, дающие бонус к мощи армии и позволяющие штурмовать провинции. Наличие Храма обязательно для успешного завоевания сложных территорий. Только самые преданные Тьме строят этот храм.",
    'dungeon': "Тюрьма: Постройка, которая увеличивает поддержку Тьмы на 10%, но снижает лояльность населения на 5%. В тюрьмах содержатся те, кто не желает принимать власть Дракулы. Это отличный способ сломить дух сопротивления в новых провинциях. Злоупотребление тюрьмами может вызвать бунты.",
    'executions': "Казни: Жестокое, но эффективное средство. Даёт +15% к поддержке Тьмы, снижает лояльность на 10% и уменьшает население провинции. Устрашение — основной метод управления в империи Тьмы. Казни деморализуют врагов, но могут оставить провинцию без рабочей силы.",
    'ball': "Бал Вампиров: Пышное мероприятие для высшей знати, увеличивающее поддержку Тьмы на 20% и лояльность на 5%. Бал позволяет отвлечь элиту и заручиться их поддержкой. Это хороший способ стабилизировать провинцию и поднять её ресурсный потенциал.",
    'center': "Центр Обращения: Место, где пленники превращаются в новых слуг тьмы. Даёт +10% поддержки Тьмы, +5% лояльности и +100 населения. Обращение позволяет быстро восстановить численность населения в провинциях после войн. Это идеальное здание для экономического роста.",
    'citadel': "Цитадель: Мощнейшее оборонительное сооружение, открывающее найм Сборщиков душ. Постройка Цитадели значительно укрепляет вашу военную и экономическую мощь. Сборщики душ приносят 50 золота каждый ход, что окупает затраты на строительство. Цитадель — символ вашего владычества.",
    'wall': "Стены: Укрепляет провинцию на +1 уровень. Стены — простой и дешёвый способ защитить свои границы от набегов врага. Возведение стен станет серьёзным препятствием для армий Ватикана и Оборотней. Не пренебрегайте обороной.",
    'castle': "Замок: Мощное оборонительное сооружение, дающее +2 к укреплениям и +20 к гарнизону. Замки автоматически пополняют войска и делают провинцию неприступной крепостью. Это ваш главный оплот на линии фронта. Инвестируйте в замки на стратегически важных территориях.",
    'market': "Рынок: Позволяет обменивать золото и кровь по курсу 10 к 8. Рынок — единственный способ быстро перебросить ресурсы в нужное русло. Он критически важен в экстренных ситуациях, когда вам срочно нужно золото или кровь. Помните, что им можно пользоваться только 1 раз за ход.",
    'infantry': "5 Пехоты: Надёжные щиты вашей армии. Требуют наличия Казарм Lv1 в выбранной провинции. Пехота — это основа вашей армии, которая примет на себя основной удар. Дешёвые в найме и быстро восполнимые. Держите баланс между пехотой и кавалерией.",
    'archer': "5 Лучников: Меткие стрелки, которые наносят урон врагу ещё до того, как он вступит в ближний бой. Требуют Казарм Lv1. Лучники эффективны против пехоты и кавалерии. Используйте их в обороне и поддержке.",
    'cavalry': "3 Кавалерии: Быстрые и манёвренные всадники, идеально подходящие для прорыва и преследования. Требуют Казарм Lv1. Кавалерия особенно эффективна в атаке и может быстро перемещаться между провинциями. Создайте ударный кулак из кавалерии.",
    'knights': "Рыцари Тьмы: Элитные бойцы в тяжёлой броне, которые наносят сокрушительный удар. Требуются Казармы Lv2. Рыцари Тьмы — элита вашей армии, способная в одиночку переломить ход битвы. Инвестируйте в них на поздних этапах игры.",
    'lord': "Призвать Лорда: Верховный генерал, дающий 10% бонус к мощи армии. Требуется наличие Храма Тьмы в провинции. Лорды — бессмертные существа, которые набирают опыт с каждым сражением. С каждым новым Лордом ваша армия становится сильнее. Они — ваши ключевые полководцы.",
    'soul_collector': "Сборщик душ: Таинственный посредник, который приносит 50 золота каждый ход. Требуется наличие Цитадели. Сборщик душ окупает себя всего за несколько ходов и является лучшей инвестицией в экономику. Используйте его для быстрого накопления ресурсов на войну.",
    'diplomacy': "ДИПЛОМАТИЯ: Заключайте перемирия или союзы с другими фракциями. Перемирие на 2 хода с Ватиканом или Оборотнями стоит 30 золота и даёт передышку в войне. Союз против Оборотней за 50 золота заставит Ватикан атаковать их вместо вас. Тщательно выбирайте, с кем говорить, чтобы выиграть время.",
    'market': "РЫНОК: Обменивайте ресурсы в любой момент своего хода. 10 золота дают 8 крови, и наоборот. Эта операция доступна только 1 раз за ход. Иногда у вас может быть переизбыток одного ресурса и нехватка другого. Рынок решает эту проблему.",
    'tech': "ТЕХНОЛОГИИ: Исследуйте древние тёмные технологии за 30 золота каждая. Военная реформа увеличивает общую мощь армии. Некромантия позволяет получать кровь за каждую смерть врага. Торговые пути удваивают использование Рынка. Выбирайте технологии под свою стратегию.",
    'garrison_add': "ОСТАВИТЬ: Переместите 10 пехотинцев из вашей мобильной армии в гарнизон текущей провинции. Оставшиеся в гарнизоне войска будут защищать провинцию. Это действие стоит 1 Очко Действия (AP). Используйте, чтобы закрепиться на только что захваченных территориях.",
    'garrison_take': "ПРИЗВАТЬ: Возьмите 10 пехотинцев из гарнизона провинции в вашу мобильную армию. Это позволит быстро восстановить численность армии без траты золота. Действие стоит 1 Очко Действия (AP). Призывайте солдат, готовясь к крупной наступательной операции."
};

// ================= ИНИЦИАЛИЗАЦИЯ PIXIJS =================
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
const app = new PIXI.Application({
    width: 910, height: 580, 
    backgroundColor: 0x0a0a0e, transparent: false, resolution: window.devicePixelRatio || 1,
});
document.getElementById('game-canvas').style.display = 'none';
const pixiContainer = document.createElement('div');
pixiContainer.id = 'pixi-container';
pixiContainer.style.cssText = 'position: absolute; top: 20px; left: 0; z-index: 1; width: 910px; height: 580px;';
document.getElementById('main-area').insertBefore(pixiContainer, document.getElementById('ui-panel'));
pixiContainer.appendChild(app.view);

const hexContainer = new PIXI.Container();
app.stage.addChild(hexContainer);
const armyContainer = new PIXI.Container();
app.stage.addChild(armyContainer);

// ================= ЗАГРУЗКА СПРАЙТОВ (С ВАШИМИ НОВЫМИ ФАЙЛАМИ) =================
let spritePlayer = null, spriteAI = null, spriteWerewolf = null;
let spriteLord = null, spriteAIGeneral = null, spriteWolfGeneral = null;

async function loadSprites() {
    try {
        // Основные армии
        spritePlayer = await PIXI.Assets.load('./assets/Vampire Army.png').catch(()=>null);
        spriteAI = await PIXI.Assets.load('./assets/Knight Vatican.jpg').catch(()=>null);
        spriteWerewolf = await PIXI.Assets.load('./assets/Werewolf Army.webp').catch(()=>null);
        
        // Дополнительные спрайты (Генералы и Лорды)
        spriteLord = await PIXI.Assets.load('./assets/Lord Vampire.jpg').catch(()=>null);
        spriteAIGeneral = await PIXI.Assets.load('./assets/Knigt Vatican General.gif').catch(()=>null);
        spriteWolfGeneral = await PIXI.Assets.load('./assets/Werewolf general.jpg').catch(()=>null);

        if (!spritePlayer) console.warn('Не найден спрайт Vampire Army.png');
    } catch (e) {}
}
loadSprites();

// ================= ДАННЫЕ ИГРЫ =================
const LORD_NAMES = ["Граф Дракулос", "Леди Сильвана", "Барон Ноктюрн", "Принц Теней", "Леди Вэйн"];
const HEX_SIZE = 50; 
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
    return { x: x + 360, y: y + 260 };
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
            hasCitadel: false,
            allianceWithAI: false, truceTurnsAI: 0, truceTurnsWolf: 0,
            techs: { militaryReform: false, necromancy: false, tradeRoutes: false }
        },
        ai: { gold: 100, mobileArmy: { infantry: 50, archer: 10, cavalry: 10, hexId: '4,-2' } },
        werewolf: { gold: 50, mobileArmy: { infantry: 30, archer: 5, cavalry: 10, hexId: '-4,2' } },
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
        let support = { player: 20, ai: 70, werewolf: 10 };
        if (d.owner === 'player') support = { player: 80, ai: 10, werewolf: 10 };
        else if (d.owner === 'ai') support = { player: 10, ai: 85, werewolf: 5 };
        else if (d.owner === 'werewolf') support = { player: 5, ai: 15, werewolf: 80 };

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
    game.hexGrid.forEach(hex => {
        const container = new PIXI.Container();
        container.x = hex.x;
        container.y = hex.y;

        const g = new PIXI.Graphics();
        let color = 0x222222;
        if (hex.owner === 'player') color = 0x7a1111;
        else if (hex.owner === 'ai') color = 0xe0e0c0;
        else if (hex.owner === 'werewolf') color = 0x2d4a2d;

        g.beginFill(color); 
        g.lineStyle(2, 0x333333, 0.7); 
        g.drawPolygon(...getHexCorners(0, 0));
        g.endFill();

        g.interactive = true; g.cursor = 'pointer'; g.hexData = hex;
        g.on('mouseover', (e) => {
            g.tint = 0x88aadd;
            const t = document.getElementById('tooltip');
            const o = hex.owner ? (hex.owner === 'player' ? 'Дракула' : (hex.owner === 'ai' ? 'Ватикан' : 'Оборотни')) : 'Ничейная';
            let r = '';
            if (hex.owner === null) r = `<br>⚔️ Добыча: 🪙${hex.resources.gold} | 🩸${hex.resources.blood}`;
            t.innerHTML = `
                <b style="font-size:14px;">${hex.name}</b><br>
                Владелец: ${o}<br>
                🧛 Поддержка Тьмы: ${hex.support.player}%<br>
                ⛪ Поддержка Ватикана: ${hex.support.ai}%<br>
                🐺 Поддержка Оборотней: ${hex.support.werewolf}%<br>
                🛡️ Гарнизон: ${getTotalTroops(hex.owner === 'player' ? hex.playerGarrison : hex.aiGarrison)}<br>
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
            const nT = new PIXI.Text(hex.name, { fontFamily: 'Cinzel, serif', fontSize: 10, fill: 0xffffff, align: 'center', dropShadow: true, dropShadowColor: 0x000000 });
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
    armyContainer.removeChildren();
    const pPos = game.hexGrid.find(h => `${h.q},${h.r}` === game.player.mobileArmy.hexId);
    const aPos = game.hexGrid.find(h => `${h.q},${h.r}` === game.ai.mobileArmy.hexId);
    const wPos = game.hexGrid.find(h => `${h.q},${h.r}` === game.werewolf.mobileArmy.hexId);

    function renderFallback(x, y, count, color) {
        const c = new PIXI.Graphics();
        c.beginFill(color);
        c.drawCircle(0, 0, 14);
        c.endFill();
        const t = new PIXI.Text(`${count}`, { fontFamily: 'Cinzel', fontSize: 10, fill: 0xffffff });
        t.anchor.set(0.5);
        c.addChild(t);
        c.x = x; c.y = y;
        armyContainer.addChild(c);
    }

    // Отрисовка армий с увеличенным масштабом
    if (pPos) {
        let count = getTotalTroops(game.player.mobileArmy);
        if (spritePlayer) { 
            const s = new PIXI.Sprite(spritePlayer); 
            s.anchor.set(0.5); 
            s.scale.set(0.22); 
            s.x = pPos.x; 
            s.y = pPos.y; 
            armyContainer.addChild(s); 
            // Если есть Лорды и есть спрайт лорда, рисуем его рядом
            if(game.player.lords.length > 0 && spriteLord) {
                const l = new PIXI.Sprite(spriteLord);
                l.anchor.set(0.5);
                l.scale.set(0.12);
                l.x = pPos.x + 30;
                l.y = pPos.y - 25;
                armyContainer.addChild(l);
            }
        } else renderFallback(pPos.x, pPos.y, count, 0x7a1111);
    }
    if (aPos) {
        if (spriteAI) { 
            const s = new PIXI.Sprite(spriteAI); 
            s.anchor.set(0.5); 
            s.scale.set(0.26); 
            s.x = aPos.x; 
            s.y = aPos.y; 
            armyContainer.addChild(s);
            // Для AI используем генерала
            if(spriteAIGeneral) {
                const g = new PIXI.Sprite(spriteAIGeneral);
                g.anchor.set(0.5);
                g.scale.set(0.10);
                g.x = aPos.x + 25;
                g.y = aPos.y - 25;
                armyContainer.addChild(g);
            }
        } else renderFallback(aPos.x, aPos.y, getTotalTroops(game.ai.mobileArmy), 0xe0e0c0);
    }
    if (wPos) {
        if (spriteWerewolf) { 
            const s = new PIXI.Sprite(spriteWerewolf); 
            s.anchor.set(0.5); 
            s.scale.set(0.22); 
            s.x = wPos.x; 
            s.y = wPos.y; 
            armyContainer.addChild(s);
            if(spriteWolfGeneral) {
                const g = new PIXI.Sprite(spriteWolfGeneral);
                g.anchor.set(0.5);
                g.scale.set(0.12);
                g.x = wPos.x + 25;
                g.y = wPos.y - 25;
                armyContainer.addChild(g);
            }
        } else renderFallback(wPos.x, wPos.y, getTotalTroops(game.werewolf.mobileArmy), 0x2d4a2d);
    }
}

function updateUI() {
    document.getElementById('turn-counter').textContent = game.turn;
    document.getElementById('day-counter').textContent = game.day;
    document.getElementById('ap-counter').textContent = `${game.player.ap}/${game.player.maxAp}`;
    document.getElementById('blood-counter').textContent = game.player.blood;
    document.getElementById('gold-counter').textContent = game.player.gold;
    document.getElementById('elite-counter').textContent = game.player.lords.length;
    
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

// ================= ЭКОНОМИКА И ИИ =================
function collectIncome() {
    let bloodBonus = 0;
    let goldBonus = 0;
    let slaveGold = 0;
    let isNecro = game.player.techs.necromancy;

    game.hexGrid.forEach(h => {
        if (h.owner === 'player') {
            goldBonus += 2 + (h.resources?.gold || 0);
            bloodBonus += 1 + (h.resources?.blood || 0);
            
            h.buildings.forEach(b => {
                if (b.type === 'cemetery') bloodBonus += 5;
                if (b.type === 'citadel' && game.player.hasCitadel) goldBonus += 50;
            });
        } else if (h.owner === 'ai') {
            game.ai.gold += 2;
        } else if (h.owner === 'werewolf') {
            game.werewolf.gold += 3;
        }
    });

    game.player.blood += bloodBonus;
    game.player.gold += goldBonus;
    if (isNecro) log('Некромантия активирована.', 'system');
}

function aiTurn() {
    const aH = game.hexGrid.find(h => `${h.q},${h.r}` === game.ai.mobileArmy.hexId);
    if (game.ai.gold > 10 && aH && aH.owner === 'ai') {
        game.ai.mobileArmy.infantry += 5; game.ai.gold -= 10;
        log('Ватикан пополнил армию.', 'ai');
    }
    const enemy = game.hexGrid.find(h => getNeighbors(aH.q, aH.r).some(n => n.q === h.q && n.r === h.r) && h.owner === 'player');
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

function initGame() {
    document.getElementById('start-menu').style.display = 'none';
    document.getElementById('game-container').style.display = 'flex';
    if (!loadGame()) {
        game = getDefaultGame(); 
        game.hexGrid = initHexGrid();
        game.player.lords.push({ name: LORD_NAMES[0], battles: 0 });
    }
    document.getElementById('btn-end-turn').disabled = false;
    attachLoreListeners();
    updateUI(); log('Дракула пробудился! Завоюйте Европу.', 'system');
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadSprites();
    document.getElementById('start-menu').style.display = 'flex';
    document.getElementById('game-container').style.display = 'none';

    // === ВЫПАДАЮЩИЕ СПИСКИ ===
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

    // === ОСНОВНЫЕ КНОПКИ ===
    document.getElementById('btn-new-game').addEventListener('click', () => { localStorage.removeItem('DraculaHexFinal'); game = getDefaultGame(); game.hexGrid = initHexGrid(); initGame(); });
    document.getElementById('btn-load-game').addEventListener('click', initGame);
    
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
        if (bgm.paused) { bgm.volume = 0.4; bgm.play().catch(()=>{}); document.getElementById('btn-music-toggle').textContent = "ЗВУК"; } 
        else { bgm.pause(); document.getElementById('btn-music-toggle').textContent = "ЗВУК"; }
    });
    document.getElementById('btn-clear-log').addEventListener('click', () => document.getElementById('log-container').innerHTML = '');
    document.getElementById('btn-end-turn').addEventListener('click', endPlayerTurn);

    // === ДИПЛОМАТИЯ, РЫНОК, ТЕХНОЛОГИИ (ОТКРЫТИЕ) ===
    document.getElementById('btn-open-diplomacy').addEventListener('click', () => { 
        document.getElementById('dip-gold').textContent = game.player.gold;
        document.getElementById('diplomacy-modal').style.display = 'flex'; 
    });
    document.getElementById('btn-open-market').addEventListener('click', () => { 
        document.getElementById('mkt-gold').textContent = game.player.gold;
        document.getElementById('mkt-blood').textContent = game.player.blood;
        document.getElementById('market-modal').style.display = 'flex'; 
    });
    document.getElementById('btn-open-tech').addEventListener('click', () => { 
        document.getElementById('tech-gold').textContent = game.player.gold;
        document.getElementById('tech-modal').style.display = 'flex'; 
    });

    // ===== ДИПЛОМАТИЯ (ЛОГИКА) =====
    document.getElementById('dip-truce-ai').addEventListener('click', () => {
        if (game.player.gold < 30) return log('Не хватает золота для перемирия.', 'system');
        if (game.player.truceTurnsAI > 0) return log('Перемирие с Ватиканом уже активно.', 'system');
        game.player.gold -= 30; game.player.truceTurnsAI = 2;
        log('Заключено перемирие с Ватиканом на 2 хода!', 'player');
        document.getElementById('diplomacy-modal').style.display = 'none'; updateUI();
    });
    document.getElementById('dip-truce-wolf').addEventListener('click', () => {
        if (game.player.gold < 30) return log('Не хватает золота для перемирия.', 'system');
        if (game.player.truceTurnsWolf > 0) return log('Перемирие с Оборотнями уже активно.', 'system');
        game.player.gold -= 30; game.player.truceTurnsWolf = 2;
        log('Заключено перемирие с Оборотнями на 2 хода!', 'player');
        document.getElementById('diplomacy-modal').style.display = 'none'; updateUI();
    });
    document.getElementById('dip-alliance').addEventListener('click', () => {
        if (game.player.gold < 50) return log('Не хватает золота для союза.', 'system');
        if (game.player.allianceWithAI) return log('Союз против Оборотней уже активен.', 'system');
        game.player.gold -= 50; game.player.allianceWithAI = true;
        log('Заключен союз с Ватиканом против Оборотней!', 'player');
        document.getElementById('diplomacy-modal').style.display = 'none'; updateUI();
    });

    // ===== РЫНОК (ЛОГИКА) =====
    document.getElementById('mkt-gold-to-blood').addEventListener('click', () => {
        if(game.player.gold >= 10) { game.player.gold -= 10; game.player.blood += 8; log('Обмен: 10🪙 -> 8🩸', 'player'); document.getElementById('market-modal').style.display = 'none'; updateUI(); }
        else log('Недостаточно золота!', 'system');
    });
    document.getElementById('mkt-blood-to-gold').addEventListener('click', () => {
        if(game.player.blood >= 10) { game.player.blood -= 10; game.player.gold += 8; log('Обмен: 10🩸 -> 8🪙', 'player'); document.getElementById('market-modal').style.display = 'none'; updateUI(); }
        else log('Недостаточно крови!', 'system');
    });

    // ===== ТЕХНОЛОГИИ (ЛОГИКА) =====
    document.getElementById('tech-reform').addEventListener('click', () => {
        if (game.player.gold < 30) return log('Не хватает золота для Военной реформы.', 'system');
        if (game.player.techs.militaryReform) return log('Военная реформа уже изучена.', 'system');
        game.player.gold -= 30; game.player.techs.militaryReform = true;
        log('Изучена Военная реформа! Мощь армии увеличена на 10%.', 'player');
        document.getElementById('tech-modal').style.display = 'none'; updateUI();
    });
    document.getElementById('tech-necro').addEventListener('click', () => {
        if (game.player.gold < 30) return log('Не хватает золота для Некромантии.', 'system');
        if (game.player.techs.necromancy) return log('Некромантия уже изучена.', 'system');
        game.player.gold -= 30; game.player.techs.necromancy = true;
        log('Изучена Некромантия! Убитые враги приносят дополнительную кровь.', 'player');
        document.getElementById('tech-modal').style.display = 'none'; updateUI();
    });
    document.getElementById('tech-trade').addEventListener('click', () => {
        if (game.player.gold < 30) return log('Не хватает золота для Торговых путей.', 'system');
        if (game.player.techs.tradeRoutes) return log('Торговые пути уже изучены.', 'system');
        game.player.gold -= 30; game.player.techs.tradeRoutes = true;
        log('Изучены Торговые пути! Рынком можно пользоваться 2 раза за ход.', 'player');
        document.getElementById('tech-modal').style.display = 'none'; updateUI();
    });

    // ===== СТРОИТЕЛЬСТВО =====
    const builds = { 
        'build-cemetery': 'cemetery', 'build-barracks': 'barracks', 'build-barracks-2': 'barracks_lv2',
        'build-ritual': 'dark_temple', 'build-dungeon': 'dungeon', 'build-executions': 'executions',
        'build-ball': 'ball', 'build-center': 'center', 'build-citadel': 'citadel',
        'build-wall': 'wall', 'build-castle': 'castle', 'build-market': 'market' 
    };
    Object.keys(builds).forEach(id => {
        document.getElementById(id).addEventListener('click', () => {
            if (game.player.ap <= 0) return log('Нет очков действий.', 'system');
            if (!game.selectedHexId) return log('Кликните по своему гексу на карте, чтобы выбрать его.', 'system');
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

    // ===== ПРИЗЫВ =====
    const recruits = { 
        'recruit-inf': 'infantry', 'recruit-arch': 'archer', 'recruit-cav': 'cavalry', 
        'recruit-knights': 'knights', 'recruit-lord': 'lord', 'recruit-soul': 'soul_collector' 
    };
    Object.keys(recruits).forEach(id => {
        document.getElementById(id).addEventListener('click', () => {
            if (game.player.ap <= 0) return log('Нет очков действий.', 'system');
            if (!game.selectedHexId) return log('Кликните по своему гексу на карте, чтобы выбрать его.', 'system');
            const h = game.hexGrid.find(x => `${x.q},${x.r}` === game.selectedHexId);
            if (!h || h.owner !== 'player') return log('Не ваша территория.', 'system');

            if (recruits[id] === 'lord') {
                if (!h.buildings.find(b => b.type === 'dark_temple')) return log('Нужен Храм Тьмы.', 'system');
                if (game.player.gold < 10) return log('Нужно 10 золота.', 'system');
                game.player.gold -= 10; game.player.lords.push({ name: LORD_NAMES[game.player.lords.length % LORD_NAMES.length], battles: 0 });
                log(`Лорд "${LORD_NAMES[game.player.lords.length - 1]}" примкнул к армии!`, 'player');
                game.player.ap -= 1; updateUI(); return;
            }
            if (recruits[id] === 'soul_collector') {
                if (!game.player.hasCitadel) return log('Сначала постройте Цитадель.', 'system');
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

    // ===== ГАРНИЗОН =====
    document.getElementById('btn-garrison-add').addEventListener('click', () => {
        if (game.player.ap <= 0) return log('Нет очков действий.', 'system');
        const h = game.hexGrid.find(x => `${x.q},${x.r}` === game.player.mobileArmy.hexId);
        if (!h || h.owner !== 'player' || getTotalTroops(game.player.mobileArmy) < 10) return log('Нет армии для перевода.', 'system');
        game.player.mobileArmy.infantry -= 10; h.playerGarrison.infantry += 10;
        log('10 бойцов оставлены в гарнизоне.', 'player');
        game.player.ap -= 1; updateUI();
    });
    document.getElementById('btn-garrison-take').addEventListener('click', () => {
        if (game.player.ap <= 0) return log('Нет очков действий.', 'system');
        const h = game.hexGrid.find(x => `${x.q},${x.r}` === game.player.mobileArmy.hexId);
        if (!h || h.owner !== 'player' || getTotalTroops(h.playerGarrison) < 10) return log('Нет гарнизона для призыва.', 'system');
        h.playerGarrison.infantry -= 10; game.player.mobileArmy.infantry += 10;
        log('10 бойцов призваны из гарнизона.', 'player');
        game.player.ap -= 1; updateUI();
    });

    // ===== ОСАДЫ И БИТВЫ =====
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

    // ===== МОДАЛКА ПОРАБОЩЕНИЯ =====
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
