/*
 * Sunic Apps для Lampa на Android — плагин для Lampa BS и других сборок Lampa для Android.
 *
 * Подключение: Lampa → Настройки → Расширения → Добавить плагин → https://sunic007.github.io/lampa-android/sunic.js
 *
 * Этот файл — только загрузчик, он почти не меняется. Что грузить, говорит version.json этого репозитория:
 *  - модули Sunic Apps — те же файлы, что в Lampa для Samsung (бот, сторож плеера, «Продолжить с места», источники,
 *    меню) — с jsDelivr из sunic007/lampa-samsung по тегу ВЫПУЩЕННОЙ версии (samsung). Пакет .wgt и ТВ плагин не
 *    трогает и от их выпусков не зависит: на новую версию модулей он переходит, только когда она записана здесь;
 *  - src/android.js этого репозитория (sunic007/lampa-android по тегу версии плагина) — настройки «Sunic Apps» и запуск
 *    модулей. Он — вместо loader.js пакета: ядро Lampa уже загрузило само приложение.
 *
 * Обновление: version.json на GitHub новее — проверяем, что все файлы уже есть на CDN, запоминаем (sa_upd); ставится
 * при следующем запуске Lampa (окно «Вышло обновление» — в android.js). Lampa на какой-то версии не поднялась —
 * версия плохая на сутки, работает прошлая. Плагин грузится после страницы — теги вставляются по одному, по порядку.
 * ES5: старые Android TV со старым WebView.
 */
(function () {
    'use strict';
    if (window.SunicAndroid) return;                            // плагин добавили дважды

    var PLUGIN_URL = 'https://sunic007.github.io/lampa-android/sunic.js';
    var MANIFEST = 'https://raw.githubusercontent.com/sunic007/lampa-android/main/version.json';
    var MIRRORS = ['https://cdn.jsdelivr.net/gh/', 'https://fastly.jsdelivr.net/gh/', 'https://gcore.jsdelivr.net/gh/'];
    // что грузить, если GitHub недоступен и ничего не запомнено; tools/bump.py вписывает сюда выпуск из version.json
    var PIN = { version: '1.0.0', samsung: '2.1.1', modules: ['skazauto.js', 'playerguard.js', 'bsfeatures.js', 'bsplayer.js', 'bsrch.js', 'bsprobe.js', 'bsfix.js', 'bssources.js', 'bsmenu.js', 'bscontinue.js', 'bswatch.js', 'bstg.js'] };

    function get(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
    function set(k, v) { try { if (v === null) window.localStorage.removeItem(k); else window.localStorage.setItem(k, v); } catch (e) {} }
    function num(v) { var m = /^(\d+)\.(\d+)\.(\d+)$/.exec(String(v || '')); return m ? +m[1] * 1e6 + +m[2] * 1e3 + +m[3] : 0; }
    function okName(f) { return /^[\w.-]+\.js$/.test(f) && f !== 'loader.js' && f !== 'update.js'; }
    /** Выпуск из version.json или памяти: версии в порядке, модули — только имена файлов. */
    function okRelease(r) {
        return !!r && num(r.version) > 0 && num(r.samsung) > 0 && Object.prototype.toString.call(r.modules) === '[object Array]' &&
            r.modules.length > 0 && r.modules.every(okName);
    }
    function log() { try { console.log.apply(console, ['Sunic Apps'].concat([].slice.call(arguments))); } catch (e) {} }
    function noty(text, time) { try { Lampa.Noty.show(text, { time: time || 5000 }); } catch (e) { log(text); } }
    function bad() {
        var raw = String(get('sa_upd_bad') || ''), at = +(raw.split('|')[1] || 0);
        return raw && (!at || Date.now() - at < 86400000) ? raw.split('|')[0] : '';
    }

    /* ---------- какой выпуск грузить ---------- */

    function pick() {
        var upd = null;
        try { upd = JSON.parse(get('sa_upd') || 'null'); } catch (e) {}
        var good = okRelease(upd) && upd.ok;
        // прошлый запуск с этой версией до готовности Lampa не дошёл — версия плохая на сутки
        if (good && get('sa_upd_try') === upd.version) set('sa_upd_bad', upd.version + '|' + Date.now());
        if (good && upd.version !== bad() && num(upd.version) >= num(PIN.version)) {
            var m = +upd.m;
            return { version: upd.version, samsung: upd.samsung, modules: upd.modules, mirror: m >= 0 && m < MIRRORS.length ? m : 0 };
        }
        return { version: PIN.version, samsung: PIN.samsung, modules: PIN.modules, mirror: 0 };
    }

    /** Все адреса выпуска по порядку: модули Samsung, android.js последним; css отдельно. */
    function urls(r, mirror) {
        var sam = MIRRORS[mirror] + 'sunic007/lampa-samsung@v' + r.samsung + '/src/';
        var list = r.modules.map(function (f) { return sam + f; });
        list.push(MIRRORS[mirror] + 'sunic007/lampa-android@v' + r.version + '/src/android.js');
        return { css: sam + 'bs.css', js: list };
    }

    /* ---------- загрузка ---------- */

    /** Файлы по одному, по порядку. Файл не пришёл с зеркала — тот же со следующего; ни с одного — cb(false). */
    function loadAll(r, cb) {
        var i = 0;
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
                if (tries + 1 >= MIRRORS.length) return cb(false);
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

    /* ---------- проверка новой версии ---------- */

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

    /** cb(версия | '', выпуск): версия — только если она новее запущенной и все её файлы уже есть на CDN. */
    function check(cb) {
        var fin = function (v, r) { if (!cb) return; var c = cb; cb = null; c(v || '', r || null); };
        if (get('sa_gh_update') === 'false') return fin('');
        try {
            var x = new XMLHttpRequest();
            x.open('GET', MANIFEST + '?t=' + Date.now(), true);
            x.timeout = 15000;
            x.onload = function () {
                var r = null;
                try { r = JSON.parse(x.responseText); } catch (e) {}
                if (x.status !== 200 || !okRelease(r)) return fin('');
                if (num(r.version) <= num(running && running.version) || r.version === bad()) return fin('');
                var upd = null;
                try { upd = JSON.parse(get('sa_upd') || 'null'); } catch (e) {}
                if (upd && upd.version === r.version && upd.ok) return fin(r.version, r);   // уже проверена
                verify(r, function (m) {
                    if (m < 0) return fin('');                                            // CDN ещё не готов — в следующий раз
                    set('sa_upd', JSON.stringify({ version: r.version, samsung: r.samsung, modules: r.modules, notes: r.notes || null, m: m, ok: 1 }));
                    fin(r.version, r);
                });
            };
            x.onerror = x.ontimeout = function () { fin(''); };
            x.send();
        } catch (e) { fin(''); }
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
        running = pick();
        window.SunicAndroid = { version: running.version, samsung: running.samsung, check: check, allow: allow, _pick: pick, _num: num };
        window.BS_ANDROID = true;
        window.BS_REMOTE_VERSION = running.samsung;             // бот сравнивает версии модулей с другими ТВ
        // Модули пакета Samsung без правок: «Пропускать рекламу» (personal1.lampa) на Android решает само приложение,
        // поэтому для модуля она включена (он тогда не трогает файл приложения); подсказка про меню Samsung — не нужна.
        set('bs_noads', 'true');
        set('bs_sleep_hint', '1');
        set('sa_upd_try', running.version);
        log('загружаю', running.version, '· модули ' + running.samsung);
        loadAll(running, function (ok) {
            if (!ok) {
                set('sa_upd_try', null);                        // сбой сети, а не плохая версия
                noty('Sunic Apps: нет связи с GitHub — функции загрузятся при следующем запуске', 7000);
                return;
            }
            var waits = 0, t = setInterval(function () {
                if (window.appready && window.SunicAndroid.started) {
                    clearInterval(t);
                    set('sa_upd_try', null);
                    nameMe();
                    setTimeout(function () { check(); }, 20000);
                } else if (++waits > 90) clearInterval(t);          // 3 минуты — try остаётся, следующий запуск — прошлая версия
            }, 2000);
        });
    }

    if (document.body) start();
    else document.addEventListener('DOMContentLoaded', start);
})();
