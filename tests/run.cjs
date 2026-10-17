// Автотесты плагина: node tests/run.cjs
// Модули Samsung для сверки раскладки настроек берутся из SAMSUNG_DIR (папка src/ пакета lampa-samsung), иначе — с GitHub
// по тегу version.json.samsung. Нет ни того, ни другого (нет сети) — эти проверки пропускаются с пометкой.
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path'), https = require('https');
const ROOT = path.join(__dirname, '..');
const LOADER = path.join(ROOT, 'docs', 'sunic.js'), ANDROID = path.join(ROOT, 'src', 'android.js');
let pass = 0, fail = 0, skipped = 0;
function t(name, cond) { if (cond) pass++; else { fail++; console.log('FAIL', name); } }

/* ---------- окружение для docs/sunic.js ---------- */
function env(opt) {
    opt = opt || {};
    const store = Object.assign({}, opt.store || {}), added = [], xhrs = [], notes = [];
    const el = tag => ({ tag, parentNode: null });
    const node = list => ({ appendChild(n) { n.parentNode = this; list.push(n); }, removeChild(n) { n.parentNode = null; } });
    function XHR() { this.status = 0; this.responseText = ''; xhrs.push(this); }
    XHR.prototype.open = function (m, u) { this.method = m; this.url = u; };
    // по умолчанию сети нет: version.json Lampa для Samsung не пришёл
    XHR.prototype.send = function () { (opt.net || (x => { x.status = 0; x.onerror(); }))(this); };
    const lampaStore = { plugins: opt.plugins || [] };
    const ctx = { console: { log() {} }, Date, Math, JSON, String, Object, Array, parseInt, XMLHttpRequest: XHR,
        setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
        localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } },
        Lampa: { Noty: { show: x => notes.push(x) }, Storage: { get: k => lampaStore[k], set: (k, v) => { lampaStore[k] = v; } } } };
    ctx.document = { createElement: el, head: node(added), body: node(added), addEventListener() {} };
    ctx.window = ctx; vm.createContext(ctx);
    const code = fs.readFileSync(LOADER, 'utf8');
    vm.runInContext(code, ctx);
    const scripts = () => added.filter(n => n.tag === 'script');
    function drive(failIf) {
        for (let k = 0; k < 200; k++) {
            const s = scripts().filter(n => n.parentNode && !n.__done).pop();
            if (!s) return;
            s.__done = 1;
            if (failIf && failIf(s.src)) s.onerror(); else s.onload();
        }
    }
    return { ctx, store, added, scripts, drive, xhrs, notes, code, lampaStore };
}
const PIN = (() => { const m = /var PIN = (\{[^\n]*\});/.exec(fs.readFileSync(LOADER, 'utf8')); return vm.runInNewContext('(' + m[1] + ')'); })();
const VERSION = JSON.parse(fs.readFileSync(path.join(ROOT, 'version.json'), 'utf8'));

t('PIN загрузчика = version.json (tools/bump.py)', PIN.version === VERSION.version && PIN.samsung === VERSION.samsung && PIN.modules.join() === VERSION.modules.join());
t('version.json: модули без loader.js и модулей только для Samsung', !VERSION.modules.some(f => /^(loader|update|polyfills|bshub|bsvolume)\.js$/.test(f)));
t('version.json: «что нового» для окна обновления', VERSION.notes && VERSION.notes.title && VERSION.notes.items.length > 0);

const SAM_URL = /raw\.githubusercontent\.com\/sunic007\/lampa-samsung\/main\/version\.json/;
const REL = { version: '7.3.0', files: ['loader.js', 'update.js', 'polyfills.js', 'skazauto.js', 'bsfix.js', 'bshub.js', 'bsmenu.js', 'bsvolume.js', '../evil.js', 'bstg.js'],
    notes: { title: 'Мультики', items: ['x'] } };
const samNet = (rel, rest) => x => {
    if (SAM_URL.test(x.url)) { x.status = 200; x.responseText = JSON.stringify(rel); return x.onload(); }
    if (rest) return rest(x);
    x.status = 0; x.onerror();
};
const mods = A => A.scripts().map(s => s.src).filter(u => /lampa-samsung/.test(u));
{
    const A = env();
    A.drive();
    const src = A.scripts().map(s => s.src);
    const sam = 'https://cdn.jsdelivr.net/gh/sunic007/lampa-samsung@v' + PIN.samsung + '/src/';
    t('нет сети и ничего не запомнено — модули встроенной версии', src.slice(0, -1).every(u => u.indexOf(sam) === 0) && src.length === PIN.modules.length + 1);
    t('загрузка: android.js — последним, из lampa-android по тегу плагина', src[src.length - 1] === 'https://cdn.jsdelivr.net/gh/sunic007/lampa-android@v' + PIN.version + '/src/android.js');
    t('загрузка: порядок модулей — как в version.json', src.slice(0, -1).map(u => u.split('/').pop()).join() === PIN.modules.join());
    t('загрузка: bs.css модулей подключён', A.added.some(n => n.tag === 'link' && n.href === sam + 'bs.css'));
    t('загрузка: модули без правок — реклама за приложением (bs_noads), без подсказки про меню Samsung', A.store.bs_noads === 'true' && A.store.bs_sleep_hint === '1');
    t('загрузка: версия модулей — для бота (сравнение с ТВ)', A.ctx.BS_REMOTE_VERSION === PIN.samsung && A.ctx.SunicAndroid.samsung === PIN.samsung && A.ctx.SunicAndroid.version === PIN.version);
    t('загрузка: метка «пробую версии» стоит, пока Lampa не поднялась', A.store.sa_try === PIN.version + '/' + PIN.samsung + '|1');
    const n = A.scripts().length; vm.runInContext(A.code, A.ctx);
    t('плагин добавлен дважды — второй раз ничего не грузит', A.scripts().length === n);
}
{
    const A = env({ net: samNet(REL) });
    A.drive();
    const m = mods(A);
    t('новый выпуск .wgt — сразу его модули (по тегу), как на ТВ', A.ctx.BS_REMOTE_VERSION === '7.3.0' && m.every(u => /lampa-samsung@v7\.3\.0\/src\//.test(u)));
    t('из выпуска не берутся loader/update/polyfills, Smart Hub, громкость Tizen и чужие имена; порядок — как в version.json',
        m.map(u => u.split('/').pop()).join() === 'skazauto.js,bsfix.js,bsmenu.js,bstg.js');
    const old = { version: '0.0.1', files: ['bstg.js'] };
    const B = env({ net: samNet(old) });
    t('выпуск старее встроенного — не откатываемся', B.ctx.BS_REMOTE_VERSION === PIN.samsung);
    const C = env({ store: { sa_sam: JSON.stringify({ v: '7.2.0', modules: ['bsfix.js', 'bstg.js'] }) } });
    C.drive();
    t('нет сети — модули последней удачной версии', C.ctx.BS_REMOTE_VERSION === '7.2.0' && mods(C).length === 2);
    const D1 = env({ store: { sa_try: PIN.version + '/7.3.0|1' }, net: samNet(REL) });
    t('на новом выпуске один запуск не дошёл до готовности (могли закрыть) — пробуем ещё раз', !D1.store.sa_sam_bad &&
        D1.ctx.BS_REMOTE_VERSION === '7.3.0' && D1.store.sa_try === PIN.version + '/7.3.0|2');
    const D = env({ store: { sa_try: PIN.version + '/7.3.0|2' }, net: samNet(REL) });
    t('два запуска подряд не поднялись — выпуск плохой на сутки, грузится прошлый', /^7\.3\.0\|/.test(D.store.sa_sam_bad) && D.ctx.BS_REMOTE_VERSION === PIN.samsung);
    const E = env({ store: { sa_sam_bad: '7.3.0|' + Date.now() }, net: samNet(REL) });
    t('плохой выпуск не берётся', E.ctx.BS_REMOTE_VERSION === PIN.samsung);
    const F = env({ net: samNet(REL) });
    F.drive(u => /lampa-samsung@v7\.3\.0/.test(u));
    t('нового выпуска ещё нет на CDN — грузится прошлый, без ошибки', F.ctx.BS_REMOTE_VERSION === PIN.samsung && !F.store.sa_sam_bad &&
        F.scripts().some(s => s.src.indexOf('lampa-samsung@v' + PIN.samsung) > 0) && !F.notes.length);
    const G = env({ store: { sa_gh_update: 'false' } });
    t('«Обновлять с GitHub» выключено — без запросов', G.xhrs.length === 0);
}
{
    const upd = { version: '9.0.0', samsung: PIN.samsung, m: 1, ok: 1 };
    const A = env({ store: { sa_upd: JSON.stringify(upd) } });
    A.drive();
    const src = A.scripts().map(s => s.src);
    t('проверенная новая версия плагина — с её зеркала', src.every(u => /^https:\/\/fastly\.jsdelivr\.net\/gh\//.test(u)) &&
        /lampa-android@v9\.0\.0\/src\/android\.js$/.test(src[src.length - 1]));
    const B = env({ store: { sa_upd: JSON.stringify(upd), sa_try: '9.0.0/' + PIN.samsung + '|2' } });
    t('на версии плагина прошлый запуск не поднялся — плохая на сутки, грузится PIN', /^9\.0\.0\|/.test(B.store.sa_upd_bad) && B.ctx.SunicAndroid.version === PIN.version);
}
{
    const A = env();
    let first = '';
    A.drive(u => { if (!first && /bsfix\.js$/.test(u)) { first = u; return true; } return false; });
    const fix = A.scripts().filter(s => /bsfix\.js$/.test(s.src)).map(s => s.src);
    t('файл не пришёл — тот же со следующего зеркала, дальше по порядку', fix.length === 2 && /fastly/.test(fix[1]) && A.scripts().some(s => /android\.js$/.test(s.src)));
    const B = env();
    B.drive(() => true);
    t('ни одно зеркало не ответило — стоп, сбой сети (версия не плохая), человеку сказано',
        !('sa_try' in B.store) && !('sa_upd_bad' in B.store) && !('sa_sam_bad' in B.store) && B.notes.some(n => /нет связи с GitHub/.test(n)));
}
{
    const heads = [];
    const R = { version: '99.0.0', samsung: PIN.samsung, modules: [], notes: { title: 'Новое', items: ['x'] } };
    const A = env({ net: samNet({ version: '0.0.1', files: [] }, x => {
        if (x.method === 'GET') { x.status = 200; x.responseText = JSON.stringify(R); return x.onload(); }
        heads.push(x.url); x.status = /fastly/.test(x.url) ? 200 : 503; x.onload();
    }) });
    let got = null, rel = null;
    A.ctx.SunicAndroid.check((v, r) => { got = v; rel = r; });
    const u = JSON.parse(A.store.sa_upd || 'null');
    t('новая версия плагина: готова, когда её android.js и модули есть на одном зеркале', got === '99.0.0' && u && u.ok === 1 && u.m === 1 &&
        heads.some(h => /lampa-android@v99\.0\.0\/src\/android\.js$/.test(h)) && heads.some(h => /bs\.css$/.test(h)));
    t('новая версия: «что нового» — в окно обновления', rel && rel.notes && rel.notes.title === 'Новое' && u.notes.title === 'Новое');
    const B = env({ store: { sa_gh_update: 'false' }, net: x => { x.status = 200; x.responseText = '{}'; x.onload(); } });
    let gb = 'x'; B.ctx.SunicAndroid.check(v => { gb = v; });
    t('«Обновлять с GitHub» выключено — не проверяет', gb === '' && B.xhrs.length === 0);
    const C = env({ net: x => { x.status = 200; x.responseText = JSON.stringify({ version: PIN.version, samsung: '2.1.1' }); x.onload(); } });
    let gc = 'x'; C.ctx.SunicAndroid.check(v => { gc = v; });
    t('та же версия — обновлений нет', gc === '');
}
{
    const A = env({ plugins: [{ url: 'https://sunic007.github.io/lampa-android/sunic.js', status: 1 }, { url: 'http://skaz.tv/tv.js', name: 'ТВ by Skaz' }] });
    // имя ставится после запуска модулей — вызываем то же, что делает таймер
    A.ctx.SunicAndroid.started = true; A.ctx.appready = true;
    const code = fs.readFileSync(LOADER, 'utf8');
    const nameMe = /function nameMe\(\) \{[\s\S]*?\n    \}/.exec(code)[0];
    vm.runInContext('var PLUGIN_URL = "https://sunic007.github.io/lampa-android/sunic.js";' + nameMe + ';nameMe();', A.ctx);
    const list = A.lampaStore.plugins;
    t('«Расширения»: имя Sunic Apps и автор вместо «Без названия», чужие плагины не тронуты',
        list[0].name === 'Sunic Apps' && list[0].author === '@sunic007' && list[1].name === 'ТВ by Skaz' && !list[1].author);
}

/* ---------- src/android.js ---------- */
function androidEnv(store, opt) {
    store = Object.assign({}, store || {}); opt = opt || {};
    const urls = [];
    function XHR() { this.status = 0; }
    XHR.prototype.open = function (m, u) { this.url = u; urls.push(u); };
    XHR.prototype.send = function () { const r = opt.loader ? opt.loader(this.url) : null; if (r == null) return this.onerror(); this.status = 200; this.responseText = r; this.onload(); };
    const params = [], comps = [], timers = [];
    const api = { addParam(d) { params.push(d); }, addComponent(c) { comps.push(c); } };
    const started = [];
    const mod = name => ({ start() { started.push(name); } });
    const ctx = { console: { log() {} }, Date, Math, JSON, String, Object, Array, parseInt, RegExp,
        setTimeout: (fn, ms) => { if (!(ms >= 8000)) fn(); return 0; }, XMLHttpRequest: XHR, clearTimeout() {}, setInterval: fn => { timers.push(fn); return timers.length; }, clearInterval() {},
        localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; }, length: 0, key: () => null },
        Storage: function () {}, appready: true,
        SunicAndroid: { version: '1.2.3', samsung: '2.1.1', check: cb => cb(''), allow() {} },
        Lampa: { SettingsApi: api, Template: { add() {} }, Settings: { listener: { follow() {} }, create() {} }, Storage: { listener: { follow() {} } }, Noty: { show() {} } },
        $: () => ({ find: () => ({ toggleClass() {} }), toggleClass() {} }) };
    ctx.Storage.prototype = { clear() {} };
    ['BSSkaz', 'BSGuard', 'BSFeatures', 'BSPlayer', 'BSRch', 'BSFix', 'BSSources', 'BSMenu', 'BSContinue', 'BSWatch', 'BSTelegram', 'BSHub', 'BSVolume'].forEach(n => { ctx[n] = mod(n); });
    ctx.BSSkaz.prepare = cb => { started.push('prepare'); cb(); };
    // модуль регистрирует свои пункты в 'bs_update' при start()
    ctx.BSGuard.start = () => { started.push('BSGuard'); ctx.Lampa.SettingsApi.addParam({ component: 'bs_update', param: { name: 'bs_guard', type: 'trigger' }, field: { name: 'Сторож' } });
        ctx.Lampa.SettingsApi.addParam({ component: 'bs_update', param: { name: 'bs_player_auto', type: 'trigger' }, field: { name: 'Автовыбор' } }); };
    ctx.window = ctx; vm.createContext(ctx);
    vm.runInContext(fs.readFileSync(ANDROID, 'utf8'), ctx);
    timers.forEach(fn => fn());
    return { ctx, store, params, comps, started, urls, _t: ctx.SunicAndroid._test.get() };
}
{
    const A = androidEnv();
    const order = A.started.filter(n => n !== 'prepare');
    t('android.js: модули запускаются по порядку loader.js, без BSHub и BSVolume', order.join() === 'BSSkaz,BSGuard,BSFeatures,BSPlayer,BSRch,BSFix,BSSources,BSMenu,BSContinue,BSWatch,BSTelegram');
    t('android.js: серверы Skaz — быстрый замер (prepare) до запуска модулей', A.started[0] === 'prepare');
    t('android.js: один раздел «Sunic Apps»', A.comps.length === 1 && A.comps[0].component === 'bs_apps' && A.comps[0].name === 'Sunic Apps');
    const guard = A.params.find(p => p.param.name === 'bs_guard');
    t('android.js: пункт модуля — в своём подразделе («Плеер»), с заголовком группы', guard && guard.component === 'bs_player' &&
        A.params.some(p => p.param.type === 'title' && p.component === 'bs_player' && p.field.name === 'Надёжность воспроизведения'));
    t('android.js: «Автовыбор плеера» (только для AVPlay Samsung) не показывается', !A.params.some(p => p.param.name === 'bs_player_auto'));
    t('android.js: «Обновление» — версия плагина и модулей', A.params.some(p => p.param.name === 'sa_info_version' && /1\.2\.3/.test(p.field.name) && /2\.1\.1/.test(p.field.description)));
    t('android.js: торренты по умолчанию видны', A.params.some(p => p.param.name === 'bs_torrents' && p.param['default'] === true) &&
        !A.ctx.SunicAndroid._test.HIDE_IF[0].when());
    t('android.js: готовность — для загрузчика (метка «пробую версию» снимается)', A.ctx.SunicAndroid.started === true);
}

/* ---------- ES5: старые Android TV ---------- */
function stripJs(src) {
    let out = '', i = 0, n = src.length, prev = '';
    while (i < n) {
        const c = src[i], d = src[i + 1];
        if (c === '/' && d === '/') { while (i < n && src[i] !== '\n') i++; continue; }
        if (c === '/' && d === '*') { i = src.indexOf('*/', i + 2); i = i < 0 ? n : i + 2; out += ' '; continue; }
        if (c === '"' || c === "'" || c === '`') {
            if (c === '`') out += '`';
            const q = c; i++;
            while (i < n && src[i] !== q) { if (src[i] === '\\') i++; i++; }
            i++; out += '""'; prev = '"'; continue;
        }
        if (c === '/' && !/[\w$)\]"]/.test(prev)) {
            i++; let cls = false;
            while (i < n && (src[i] !== '/' || cls)) { if (src[i] === '\\') i++; else if (src[i] === '[') cls = true; else if (src[i] === ']') cls = false; i++; }
            i++; while (/[a-z]/.test(src[i] || '')) i++; out += '/r/'; prev = ')'; continue;
        }
        out += c; if (!/\s/.test(c)) prev = c; i++;
    }
    return out;
}
const ES6 = [[/=>/, '=>'], [/\blet\s+[\w$[{]/, 'let'], [/\bconst\s+[\w$[{]/, 'const'], [/`/, 'шаблонная строка'], [/\?\.[^\d]/, '?.'], [/\?\?/, '??'],
    [/\bclass\s+[\w$]+\s*[{e]/, 'class'], [/\.\.\.[\w$[(]/, '...']];
[LOADER, ANDROID].forEach(f => {
    const bad = ES6.filter(r => r[0].test(stripJs(fs.readFileSync(f, 'utf8')))).map(r => r[1]);
    t('ES5: ' + path.relative(ROOT, f) + (bad.length ? ' — ' + bad.join(', ') : ''), !bad.length);
});

/* ---------- сверка с модулями Lampa для Samsung (раскладка настроек) ---------- */
function fetchText(url) {
    return new Promise((ok, no) => https.get(url, r => {
        if (r.statusCode !== 200) { r.resume(); return no(new Error(url + ' → ' + r.statusCode)); }
        let s = ''; r.setEncoding('utf8'); r.on('data', c => { s += c; }); r.on('end', () => ok(s));
    }).on('error', no));
}
// последний выпуск Lampa для Samsung (его плагин и загрузит) или SAMSUNG_DIR — папка src/ пакета
let SAM_VER = process.env.SAMSUNG_DIR ? 'SAMSUNG_DIR' : 'main';
async function samsungText(f) {   // файл корня пакета (version.json)
    if (process.env.SAMSUNG_DIR) return fs.readFileSync(path.join(process.env.SAMSUNG_DIR, '..', f), 'utf8');
    return fetchText('https://raw.githubusercontent.com/sunic007/lampa-samsung/main/' + f);
}
async function samsungFile(f) {
    if (SAM_VER === 'main') SAM_VER = JSON.parse(await samsungText('version.json')).version;
    if (process.env.SAMSUNG_DIR) return fs.readFileSync(path.join(process.env.SAMSUNG_DIR, f), 'utf8');
    return fetchText('https://raw.githubusercontent.com/sunic007/lampa-samsung/v' + SAM_VER + '/src/' + f);
}
async function samsungChecks() {
    let loader;
    try { loader = await samsungFile('loader.js'); } catch (e) { skipped++; console.log('ПРОПУСК сверки с Lampa для Samsung:', e.message); return; }
    const ver = (/^\d/.test(SAM_VER) ? SAM_VER : '?');
    const lay = vm.runInNewContext('(' + /var BS_SETTINGS_LAYOUT = (\[[\s\S]*?\n\]);/.exec(loader)[1] + ')');
    const hid = vm.runInNewContext('(' + /var BS_SETTINGS_HIDDEN = (\[[^\n]*\]);/.exec(loader)[1] + ')');
    const order = /BSSkaz\.start\(\)[\s\S]*?BSVolume\.start\(\)/.exec(loader)[0].match(/(BS[A-Za-z]+)\.start\(\)/g).map(x => x.replace('.start()', ''))
        .filter(n => n !== 'BSHub' && n !== 'BSVolume');
    // раскладку плагин берёт из loader.js той же версии: сначала с CDN, потом — из памяти (sa_layout)
    let fetched = 0;
    const A = androidEnv({}, { loader: u => (/lampa-samsung@v2\.1\.1\/src\/loader\.js$/.test(u) ? (fetched++, loader) : null) }), T = A.ctx.SunicAndroid._test, G = T.get();
    t('loader.js — с CDN по тегу загруженных модулей', fetched === 1);
    const saved = A.store.sa_layout || '';
    t('в памяти — разобранное (не весь loader.js: ' + saved.length + ' байт)', saved.length > 100 && saved.length < 20000 && saved.indexOf('function bsLsOn') < 0);
    const A2 = androidEnv({ sa_layout: saved }), G2 = A2._t;
    t('следующий запуск — из памяти, без сети, то же самое', A2.urls.length === 0 && JSON.stringify(G2.LAYOUT) === JSON.stringify(G.LAYOUT) &&
        A2.ctx.SunicAndroid.layoutFrom === '2.1.1' && G2.HIDE_IF.length === G.HIDE_IF.length);
    const pin = vm.runInNewContext('(' + /var BS_SECTIONS_PIN = (\{[^\n]*\});/.exec(loader)[1] + ')');
    t('закреплённые разделы (PIN) = loader.js', JSON.stringify(G.PIN) === JSON.stringify(pin));
    const hide = G.HIDE_IF, sels = hide.map(h => h.sel).join(' ');
    t('прятать в Lampa — правила телевизора, кроме «Тип плеера» (на Android плеер выбирают)', hide.length >= 2 && sels.indexOf('[data-name="player"]') < 0 &&
        sels.indexOf('sisi_pin_manage') >= 0);
    const tor = hide.find(h => h.sel.indexOf('player_torrent') >= 0);
    t('торренты на Android по умолчанию видны', tor && tor.when() === false);
    A.store.bs_torrents = 'false';
    t('выключили «Торренты» — «Парсер» и «TorrServer» прячутся', tor.when() === true);
    t('loader.js ' + ver + ' разобран: раскладка «Sunic Apps» = loader.js', JSON.stringify(lay) === JSON.stringify(G.LAYOUT) && A.ctx.SunicAndroid.layoutFrom === '2.1.1');
    t('скрытые пункты = loader.js + только для Samsung (AVPlay, реклама)', hid.every(n => G.HIDDEN.indexOf(n) >= 0) &&
        ['bs_player_auto', 'bs_buffer', 'bs_noads'].every(n => G.HIDDEN.indexOf(n) >= 0));
    t('порядок запуска модулей = loader.js (без BSHub, BSVolume)', order.join() === G.MODULES.join() &&
        A.started.filter(n => n !== 'prepare').join() === order.join());
    const sec = vm.runInNewContext('(' + /var BS_SECTIONS = (\[[\s\S]*?\n\]);/.exec(loader)[1] + ')');
    t('разделы = loader.js', JSON.stringify(sec) === JSON.stringify(G.SECTIONS));
    // встроенная копия нужна только без сети — отстала после выпуска для Samsung: предупреждение, а не ошибка
    if (JSON.stringify(lay) !== JSON.stringify(androidEnv()._t.LAYOUT)) console.log('ВНИМАНИЕ: встроенная раскладка в src/android.js отстала от loader.js ' + ver + ' (нужна только без сети) — обновить при следующем выпуске');
    const files = JSON.parse(await samsungText('version.json')).files.filter(f => !/^(loader|update|polyfills|bshub|bsvolume)\.js$/.test(f));
    const lost = [];
    for (const f of files) {
        const s = await samsungFile(f), re = /component:\s*'bs_update',\s*param:\s*\{\s*name:\s*'([a-z_0-9]+)'/g;
        let m;
        while ((m = re.exec(s))) if (!G.LAYOUT.some(l => l[1].indexOf(m[1]) >= 0) && G.HIDDEN.indexOf(m[1]) < 0) lost.push(f + ':' + m[1]);
    }
    t('все пункты модулей ' + ver + ' разложены по разделам' + (lost.length ? ' (вне раскладки: ' + lost.join(', ') + ')' : ''), lost.length === 0);
    t('битый loader.js — встроенная раскладка', T.parseLoader('var BS_SECTIONS = [;') === null && T.parseLoader('') === null);
}

samsungChecks().catch(e => { fail++; console.log('FAIL сверка: исключение', e && e.stack); }).then(() => {
    console.log(pass + ' passed, ' + fail + ' failed' + (skipped ? ', ' + skipped + ' skipped' : ''));
    process.exit(fail ? 1 : 0);
});
