/*
 * Sunic Apps для Lampa на Android — плагин для Lampa BS и других сборок Lampa для Android.
 *
 * Подключение: Lampa → Настройки → Расширения → Добавить плагин → https://sunic007.github.io/lampa-android/sunic.js
 *
 * Этот файл — только загрузчик, он почти не меняется. Функции — те же, что в Lampa для Samsung, и ВСЕГДА её последней
 * выпущенной версии: при каждом запуске плагин смотрит version.json пакета (sunic007/lampa-samsung) и берёт модули с
 * jsDelivr по тегу этой версии (бот, сторож плеера, «Продолжить с места», источники, меню). Вышла новая Lampa для Samsung —
 * на Android она приходит сама, отдельно выпускать плагин не нужно.
 *  - src/android.js этого репозитория — запуск модулей и раздел «Sunic Apps»; раскладку настроек он берёт из loader.js
 *    той же версии пакета, поэтому новые пункты встают на свои места сами;
 *  - модули только для Samsung (bshub — Smart Hub, bsvolume — громкость ТВ) и loader.js (грузит ядро Lampa) не грузятся.
 *
 * Защита: Lampa не поднялась на новой версии модулей два запуска подряд — версия плохая на сутки, работает прошлая. GitHub недоступен —
 * последняя проверенная (или записанная здесь, PIN). Плагин грузится после страницы — теги вставляются по одному, по порядку.
 * ES5: старые Android TV со старым WebView.
 */
(function () {
    'use strict';
    if (window.SunicAndroid) return;                            // плагин добавили дважды

    var PLUGIN_URL = 'https://sunic007.github.io/lampa-android/sunic.js';
    var MANIFEST = 'https://raw.githubusercontent.com/sunic007/lampa-android/main/version.json';
    var SAMSUNG = 'https://raw.githubusercontent.com/sunic007/lampa-samsung/main/version.json';
    var MIRRORS = ['https://cdn.jsdelivr.net/gh/', 'https://fastly.jsdelivr.net/gh/', 'https://gcore.jsdelivr.net/gh/'];
    // на случай, когда GitHub недоступен и ничего не запомнено; tools/bump.py вписывает сюда выпуск из version.json
    var PIN = { version: '2.3.2', samsung: '2.3.2', modules: ['bsreport.js', 'skazauto.js', 'playerguard.js', 'bsfeatures.js', 'bsplayer.js', 'bsrch.js', 'bsprobe.js', 'bsfix.js', 'bssources.js', 'bsmenu.js', 'bscontinue.js', 'bswatch.js', 'bstg.js'] };
    // не для Android: loader.js грузит ядро Lampa (его заменяет src/android.js), update.js/polyfills.js — для Tizen,
    // bshub.js — панель Smart Hub, bsvolume.js — громкость через tizen.tvaudiocontrol
    var SAMSUNG_ONLY = { 'loader.js': 1, 'update.js': 1, 'polyfills.js': 1, 'bshub.js': 1, 'bsvolume.js': 1 };

    function get(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
    function set(k, v) { try { if (v === null) window.localStorage.removeItem(k); else window.localStorage.setItem(k, v); } catch (e) {} }
    function json(k) { try { return JSON.parse(get(k) || 'null'); } catch (e) { return null; } }
    function num(v) { var m = /^(\d+)\.(\d+)\.(\d+)$/.exec(String(v || '')); return m ? +m[1] * 1e6 + +m[2] * 1e3 + +m[3] : 0; }
    function isArr(a) { return Object.prototype.toString.call(a) === '[object Array]'; }
    function okName(f) { return /^[\w.-]+\.js$/.test(f) && !SAMSUNG_ONLY[f]; }
    function okMods(l) { return isArr(l) && l.length > 0 && l.every(okName); }
    function onlyAndroid(files) { return isArr(files) ? files.filter(function (f) { return /^[\w.-]+\.js$/.test(f) && !SAMSUNG_ONLY[f]; }) : []; }
    function log() { try { console.log.apply(console, ['Sunic Apps'].concat([].slice.call(arguments))); } catch (e) {} }
    function noty(text, time) { try { Lampa.Noty.show(text, { time: time || 5000 }); } catch (e) { log(text); } }
    /** Версия, на которой Lampa не поднялась (ключ sa_upd_bad или sa_sam_bad: «версия|время»), — плохая сутки. */
    function bad(key) {
        var raw = String(get(key) || ''), at = +(raw.split('|')[1] || 0);
        return raw && (!at || Date.now() - at < 86400000) ? raw.split('|')[0] : '';
    }
    function xhr(url, timeout, cb) {
        var done = false, fin = function (st, text) { if (!done) { done = true; cb(st, text); } };
        try {
            var x = new XMLHttpRequest();
            x.open('GET', url, true);
            x.timeout = timeout;
            x.onload = function () { fin(x.status, x.responseText); };
            x.onerror = x.ontimeout = function () { fin(0, ''); };
            x.send();
        } catch (e) { fin(0, ''); }
        setTimeout(function () { fin(0, ''); }, timeout + 500);
    }

    /* ---------- какие версии грузить ---------- */

    /** Версия плагина (src/android.js): проверенная новая (sa_upd) или PIN. */
    function pickPlugin() {
        var upd = json('sa_upd');
        if (upd && upd.ok && num(upd.version) > num(PIN.version) && upd.version !== bad('sa_upd_bad')) {
            var m = +upd.m;
            return { version: upd.version, notes: upd.notes || null, mirror: m >= 0 && m < MIRRORS.length ? m : 0, min: upd.samsung };
        }
        return { version: PIN.version, mirror: 0, min: PIN.samsung };
    }
    /** Модули Samsung, на которые можно откатиться без сети: последняя удачная версия (sa_sam) или PIN. */
    function savedSamsung(min) {
        var s = json('sa_sam');
        if (s && num(s.v) >= num(min) && okMods(s.modules) && s.v !== bad('sa_sam_bad')) return { v: s.v, modules: s.modules };
        return { v: PIN.samsung, modules: PIN.modules };
    }
    /** Последняя выпущенная Lampa для Samsung (version.json пакета) — сразу при запуске, до 4 с; нет ответа — сохранённая. */
    function pickSamsung(min, cb) {
        var keep = savedSamsung(min);
        if (get('sa_gh_update') === 'false') return cb(keep, keep);
        xhr(SAMSUNG + '?t=' + Date.now(), 4000, function (st, text) {
            var m = null;
            try { m = JSON.parse(text); } catch (e) {}
            var mods = m ? onlyAndroid(m.files) : [];
            if (st !== 200 || !m || !num(m.version) || !mods.length || m.version === bad('sa_sam_bad') || num(m.version) < num(keep.v)) return cb(keep, keep);
            cb({ v: m.version, modules: mods, notes: m.notes || null }, keep);
        });
    }

    /** Все адреса по порядку: модули Samsung, android.js последним; css отдельно. */
    function urls(r, mirror) {
        var sam = MIRRORS[mirror] + 'sunic007/lampa-samsung@v' + r.samsung + '/src/';
        var list = r.modules.map(function (f) { return sam + f; });
        list.push(MIRRORS[mirror] + 'sunic007/lampa-android@v' + r.version + '/src/android.js');
        return { css: sam + 'bs.css', js: list };
    }

    /* ---------- загрузка ---------- */

    /** Файлы по одному, по порядку. Файл не пришёл с зеркала — тот же со следующего; ни с одного — cb(false, на чём). */
    function loadAll(r, cb) {
        var i = 0, all0 = urls(r, 0).js;
        function one(m, tries) {
            var all = urls(r, m).js;
            if (i >= all.length) return cb(true);
            var s = document.createElement('script'), done = false;
            var timer = setTimeout(function () { fail(); }, 30000);
            function fail() {
                if (done) return;
                done = true;
                clearTimeout(timer);
                if (s.parentNode) s.parentNode.removeChild(s);
                if (tries + 1 >= MIRRORS.length) return cb(false, i < all0.length - 1 ? 'samsung' : 'plugin');
                one((m + 1) % MIRRORS.length, tries + 1);
            }
            s.type = 'text/javascript';
            s.async = false;
            s.onerror = fail;
            s.onload = function () {
                if (done) return;
                done = true;
                clearTimeout(timer);
                i++;
                one(m, 0);
            };
            s.src = all[i];
            document.body.appendChild(s);
        }
        try {
            var l = document.createElement('link');
            l.rel = 'stylesheet';
            l.href = urls(r, r.mirror).css;
            document.head.appendChild(l);
        } catch (e) {}
        one(r.mirror, 0);
    }

    /* ---------- проверка новой версии плагина (src/android.js) ---------- */

    var running = null;

    function verifyOn(m, r, cb) {
        var u = urls(r, m), names = u.js.concat([u.css]), left = names.length, done = false;
        var fin = function (ok) { if (done) return; if (!ok) { done = true; return cb(false); } if (--left === 0) { done = true; cb(true); } };
        for (var n = 0; n < names.length; n++) (function (url) {
            try {
                var x = new XMLHttpRequest();
                x.open('HEAD', url, true);
                x.timeout = 15000;
                x.onload = function () { fin(x.status === 200); };
                x.onerror = x.ontimeout = function () { fin(false); };
                x.send();
            } catch (e) { fin(false); }
        })(names[n]);
    }
    function verify(r, cb) {
        (function next(m) {
            if (m >= MIRRORS.length) return cb(-1);
            verifyOn(m, r, function (ok) { if (ok) cb(m); else next(m + 1); });
        })(0);
    }

    /** cb(версия | '', выпуск): новая версия плагина — только если она новее запущенной и её файлы уже есть на CDN.
     *  Модули Samsung проверять не нужно: их последняя версия берётся при каждом запуске. */
    function check(cb) {
        var fin = function (v, r) { if (!cb) return; var c = cb; cb = null; c(v || '', r || null); };
        if (get('sa_gh_update') === 'false') return fin('');
        xhr(MANIFEST + '?t=' + Date.now(), 15000, function (st, text) {
            var r = null;
            try { r = JSON.parse(text); } catch (e) {}
            if (st !== 200 || !r || !num(r.version)) return fin('');
            if (num(r.version) <= num(running && running.version) || r.version === bad('sa_upd_bad')) return fin('');
            var upd = json('sa_upd');
            if (upd && upd.version === r.version && upd.ok) return fin(r.version, r);   // уже проверена
            var probe = { version: r.version, samsung: running.samsung, modules: running.modules };
            verify(probe, function (m) {
                if (m < 0) return fin('');                                            // CDN ещё не готов — в следующий раз
                set('sa_upd', JSON.stringify({ version: r.version, samsung: r.samsung, notes: r.notes || null, m: m, ok: 1 }));
                fin(r.version, r);
            });
        });
    }

    /** Согласились обновить: версия, на которой раньше не поднялась, получает ещё шанс. */
    function allow(v) { if (String(get('sa_upd_bad') || '').split('|')[0] === v) set('sa_upd_bad', null); }

    /* ---------- имя в «Расширениях» ---------- */

    /** Lampa показывает имя и автора из своей записи плагина; без них — «Без названия». */
    function nameMe() {
        try {
            var S = Lampa.Storage, list = S.get('plugins', '[]'), changed = false;
            if (Object.prototype.toString.call(list) !== '[object Array]') return;
            for (var i = 0; i < list.length; i++) {
                var p = list[i], u = p && String(p.url || p.link || '').split('?')[0];
                if (u !== PLUGIN_URL) continue;
                if (p.name !== 'Sunic Apps') { p.name = 'Sunic Apps'; changed = true; }
                if (p.author !== '@sunic007') { p.author = '@sunic007'; changed = true; }
            }
            if (changed) S.set('plugins', list);
        } catch (e) {}
    }

    /* ---------- запуск ---------- */

    function start() {
        var plug = pickPlugin();
        window.BS_ANDROID = true;
        window.SunicAndroid = { version: plug.version, samsung: '', check: check, allow: allow, _num: num };
        // Модули пакета Samsung без правок: «Пропускать рекламу» (personal1.lampa) на Android решает само приложение,
        // поэтому для модуля она включена (он тогда не трогает файл приложения); подсказка про меню Samsung — не нужна.
        set('bs_noads', 'true');
        set('bs_sleep_hint', '1');
        set('sa_upd_try', null);                                // метка 1.0.0, теперь sa_try
        pickSamsung(plug.min, function (sam, keep) { go(plug, sam, keep); });
    }

    function go(plug, sam, keep) {
        running = { version: plug.version, samsung: sam.v, modules: sam.modules, mirror: plug.mirror };
        window.SunicAndroid.samsung = sam.v;
        window.BS_REMOTE_VERSION = sam.v;                       // бот сравнивает версии модулей с другими ТВ
        // «пробую версии»: метка «версии|сколько запусков подряд не дошли до готовности Lampa». Одна неудача — ещё не
        // приговор (Lampa могли закрыть в первые секунды); две подряд — виновата новая: модули Samsung, иначе плагин
        var tryKey = plug.version + '/' + sam.v, prev = String(get('sa_try') || '').split('|');
        var fails = prev[0] === tryKey ? (+prev[1] || 1) : 0;
        if (fails >= 2) {
            if (sam.v !== keep.v) { set('sa_sam_bad', sam.v + '|' + Date.now()); return go(plug, keep, keep); }
            if (plug.version !== PIN.version) { set('sa_upd_bad', plug.version + '|' + Date.now()); set('sa_try', null); return start(); }
        }
        set('sa_try', tryKey + '|' + (fails + 1));
        log('загружаю', plug.version, '· модули Lampa для Samsung ' + sam.v);
        loadAll(running, function (ok, where) {
            if (!ok) {
                set('sa_try', null);                            // сбой сети, а не плохая версия
                if (where === 'samsung' && sam.v !== keep.v) return go(plug, keep, keep);   // новой версии ещё нет на CDN
                noty('Sunic Apps: нет связи с GitHub — функции загрузятся при следующем запуске', 7000);
                return;
            }
            var waits = 0, t = setInterval(function () {
                if (window.appready && window.SunicAndroid.started) {
                    clearInterval(t);
                    set('sa_try', null);
                    var was = json('sa_sam');
                    set('sa_sam', JSON.stringify({ v: sam.v, modules: sam.modules }));
                    if (was && was.v && num(sam.v) > num(was.v)) {
                        var n = sam.notes && sam.notes.title ? ' — ' + sam.notes.title : '';
                        noty('Sunic Apps: функции обновлены до ' + sam.v + n, 7000);
                    }
                    nameMe();
                    setTimeout(function () { check(); }, 20000);
                } else if (++waits > 90) clearInterval(t);          // 3 минуты — try остаётся, следующий запуск — прошлая версия
            }, 2000);
        });
    }

    if (document.body) start();
    else document.addEventListener('DOMContentLoaded', start);
})();
