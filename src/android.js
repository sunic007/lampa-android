/*
 * Sunic Apps для Lampa на Android: настройки «Sunic Apps» и запуск модулей. Грузится последним (docs/sunic.js), после
 * модулей из sunic007/lampa-samsung — вместо их loader.js: ядро Lampa уже загрузило само приложение (Lampa BS и другие
 * сборки с AndroidJS), и обновляет его тоже оно.
 *
 * Раскладка настроек — та же, что в loader.js пакета для Samsung (раздел «Sunic Apps», подразделы, заголовки групп,
 * зависимые пункты, ПИН родительского контроля), чтобы на ТВ и на телефоне всё лежало на одних местах. Раскладка
 * разбирается из loader.js выпуска во время работы; копия здесь — запасная (tests/run.cjs предупреждает, если отстала).
 *
 * Отличия от ТВ:
 *  - нет модулей только для Samsung: bshub (панель Smart Hub) и bsvolume (громкость через tizen.tvaudiocontrol);
 *  - пункты только для плеера Samsung (AVPlay) не показываются: «Автовыбор плеера», «Буфер плеера ТВ»; «Пропускать
 *    рекламу» — решает само приложение;
 *  - выбор плеера Lampa не прячем (встроенный или плеер приложения — решает человек); «Парсер» и «TorrServer» видны;
 *  - «Обновление» — только версия плагина: Lampa и плагины Skaz обновляет приложение.
 * ES5: старые Android TV со старым WebView.
 */
(function () {
    'use strict';
    var SA = window.SunicAndroid || { version: '?', samsung: '?', check: function (cb) { cb(''); }, allow: function () {} };

    function lsGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
    function lsSet(k, v) { try { if (v === null) window.localStorage.removeItem(k); else window.localStorage.setItem(k, v); } catch (e) {} }
    function lsOn(k, def) { var v = lsGet(k); return v === null ? def : v === 'true'; }
    function noty(text, time) { try { Lampa.Noty.show(text, { time: time || 6000 }); } catch (e) { console.log('Sunic Apps', text); } }
    function esc(s) {
        return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
    }

    /* ---------- «Очистить кеш и данные» не стирает бота и обновление плагина (как loader.js) ---------- */

    var KEEP_ON_CLEAR = /^(bs_(tg_|subs$|gemini_|ai_|tv_name$|tv_id$)|sa_)/;
    function keepOnClear(S) {
        var clear = S && S.clear;
        if (!clear || clear.__bs) return;
        S.clear = function () {
            var keep = {}, k, i;
            try { for (i = 0; i < this.length; i++) { k = this.key(i); if (k && KEEP_ON_CLEAR.test(k)) keep[k] = this.getItem(k); } } catch (e) {}
            var r = clear.apply(this, arguments);
            for (k in keep) if (keep.hasOwnProperty(k)) { try { this.setItem(k, keep[k]); } catch (e) {} }
            return r;
        };
        S.clear.__bs = true;
    }
    try { keepOnClear(window.Storage && window.Storage.prototype); } catch (e) {}

    /** «Очистить кеш» пишет '' в ключи с 'online_' и т. п. — наши bs_* так тихо выключались; возвращаем их. */
    function keepOursOnCacheClear(S) {
        if (!S || !S.listener || !S.listener.follow) return;
        S.listener.follow('clear', function (e) {
            if (e && e.full) return;
            var ls = window.localStorage, keep = {}, k, i;
            try { for (i = 0; i < ls.length; i++) { k = ls.key(i); if (k && k.indexOf('bs_') === 0) keep[k] = ls.getItem(k); } } catch (x) {}
            setTimeout(function () {
                for (var n in keep) if (keep.hasOwnProperty(n) && keep[n] !== '') { try { if (ls.getItem(n) === '') ls.setItem(n, keep[n]); } catch (x) {} }
            }, 0);
        });
    }

    /* ---------- раздел «Sunic Apps» (раскладка — как loader.js lampa-samsung) ---------- */

    var ROOT = 'bs_apps';
    var SECTIONS = [                                              // [раздел, название, подсказка]
        ['bs_player', 'Плеер', 'Надёжность воспроизведения, продолжение, сон, громкость'],
        ['bs_online', 'Онлайн-источники', 'Источники фильмов и серверы Skaz'],
        ['bs_telegram', 'Telegram-бот', 'Управление Lampa с телефона'],
        ['bs_iface', 'Интерфейс', 'Кнопки на карточке, строки и меню'],
        ['bs_update', 'Обновление', 'Версии и автообновление']
    ];
    var LAYOUT = [
        ['bs_player', ['#Надёжность воспроизведения', 'bs_player_auto', 'bs_guard', 'bs_bw_quality', 'bs_buffer',
            '#Во время просмотра', 'bs_pbtn', 'bs_resume_ask', 'bs_noads', 'bs_segments', 'bs_track_memory', 'bs_next_countdown', 'bs_next_season', 'bs_still', 'bs_sleep', 'bs_vol_memory', 'bs_vol_night']],
        ['bs_iface', ['bs_watch_btn', 'bs_online_resume', 'bs_ru_auto', 'bs_menu_turk', 'bs_menu_kids', 'bs_continue_row', 'bs_iptv_lists']],
        ['bs_telegram', ['#Общий бот — без токена', 'bs_sb_link', 'bs_sb_off',
            '#Свой бот (бесплатно)', 'bs_tg_phone', 'bs_tg_join', 'bs_tg_help', 'bs_tg_token', 'bs_tg_link', 'bs_tv_name', 'bs_tg_off',
            '#Бот', 'bs_tg_on', 'bs_tg_shots', 'bs_search_qr', 'bs_tg_check',
            '#Люди и доступ', 'bs_tg_approve', 'bs_tg_guest_play', 'bs_tg_invite_reset']],
        ['bs_online', ['#Источники', 'bs_auto_source', 'bs_race', 'bs_torrents', 'bs_srv_title', 'bs_srv_now', 'bs_srv_auto', 'bs_srv_pick',
            '#Источники на выбор', 'bs_src_main', 'bs_src_z01', 'bs_src_online_mod', 'bs_src_vod_llpp', 'bs_src_showy', 'bs_src_arkmv']]
    ];
    // как на ТВ (служебное и отладка) + только для Samsung: AVPlay, реклама (решает приложение)
    var HIDDEN = ['bs_feat_title', 'bs_cont_title', 'bs_keys_info', 'bs_fast_start', 'bs_diag', 'bs_src_badge', 'bs_sleep', 'bs_srv_now',
        'bs_player_auto', 'bs_buffer', 'bs_noads'];
    var NEEDS = { bs_player_auto: { on: 'bs_guard' }, bs_race: { on: 'bs_auto_source' } };
    // только для Samsung: AVPlay (запасной плеер, буфер), реклама (решает приложение)
    var ANDROID_HIDDEN = ['bs_player_auto', 'bs_buffer', 'bs_noads'];
    var HIDE_IF = [
        // торренты на Android — обычное дело: по умолчанию видны; выключили — прячем, как на ТВ
        { sel: '[data-name="player_torrent"], .settings-folder[data-component="parser"], .settings-folder[data-component="server"]',
            when: function () { return !lsOn('bs_torrents', true); } },
        // «Родительский контроль» Клубнички: PIN хранит сервер Skaz, он отвечает ошибкой — пункт ничего не делает
        { sel: '[data-name="sisi_pin_manage"]', when: function () { return true; } }
    ];

    function hideLampa(body) {
        var root = body && body.find ? body : $('body');
        for (var i = 0; i < HIDE_IF.length; i++) {
            try { root.find(HIDE_IF[i].sel).toggleClass('hide', !!HIDE_IF[i].when()); } catch (e) {}
        }
    }

    var pending = {}, flushed = false;

    function place(name) {
        for (var i = 0; i < LAYOUT.length; i++) if (LAYOUT[i][1].indexOf(name) >= 0) return LAYOUT[i][0];
        return '';
    }
    function needOk(name) {
        var n = NEEDS[name];
        if (!n) return true;
        return lsGet(n.on) !== 'false';
    }
    function refresh() {
        for (var name in NEEDS) if (NEEDS.hasOwnProperty(name)) {
            try { $('.settings-param[data-name="' + name + '"]').toggleClass('hide', !needOk(name)); } catch (e) {}
        }
        hideLampa(null);
    }
    function addTo(add, api, data, to) {
        var copy = {}, k, name = data.param.name;
        for (k in data) if (data.hasOwnProperty(k)) copy[k] = data[k];
        copy.component = to;
        var render = data.onRender, change = data.onChange;
        copy.onRender = function (item) {
            if (render) render.apply(this, arguments);
            if (NEEDS[name] && !needOk(name)) item.addClass('hide');
        };
        copy.onChange = function () {
            var r = change ? change.apply(this, arguments) : undefined;
            setTimeout(refresh, 0);
            return r;
        };
        return add.call(api, copy);
    }

    var PIN_SECTIONS = { bs_telegram: 'Telegram-бот (Sunic Apps)', bs_online: 'Онлайн-источники (Sunic Apps)' };
    function pinApi() {
        var P = window.Lampa && Lampa.ParentalControl;
        return P && typeof P.add === 'function' && typeof P.personal === 'function' ? P : null;
    }
    function pinRegister() {
        var P = pinApi();
        if (!P) return;
        for (var name in PIN_SECTIONS) if (PIN_SECTIONS.hasOwnProperty(name)) {
            var once = 'bs_pin_init_' + name, first = lsGet(once) !== '1';
            try {
                P.add('bs_pin_' + name, { title: PIN_SECTIONS[name], 'default': first });
                if (first) lsSet(once, '1');
            } catch (e) {}
        }
    }
    function openSection(name) {
        var P = PIN_SECTIONS.hasOwnProperty(name) ? pinApi() : null;
        if (P) {
            try { P.personal('bs_pin_' + name, function () { Lampa.Settings.create(name); }, false, true); return; } catch (e) {}
        }
        Lampa.Settings.create(name);
    }
    /** «Sunic Apps» — сразу под «Синхронизацией»; нет её — первым. */
    function rootUp(body) {
        try {
            var me = body.find('.settings-folder[data-component="' + ROOT + '"]');
            if (!me.length) return;
            var sync = body.find('.settings-folder[data-component="account"]');
            if (sync.length) { if (sync.next()[0] !== me[0]) me.insertAfter(sync); }
            else { var first = body.find('.settings-folder').first(); if (first[0] !== me[0]) me.insertBefore(first); }
        } catch (e) {}
    }
    /** «Назад» из подраздела — в «Sunic Apps» на ту же кнопку. */
    function sectionBack(e) {
        if (!e || !e.params || e.params.onBack) return;
        for (var i = 0; i < SECTIONS.length; i++) {
            if (SECTIONS[i][0] !== e.name) continue;
            e.params.onBack = (function (idx) { return function () { Lampa.Settings.create(ROOT, { last_index: idx }); }; })(i);
            return;
        }
    }

    function route() {
        var api = Lampa.SettingsApi, add = api.addParam;
        if (!add || add.__bsRoute) return;
        api.addComponent({
            component: ROOT,
            name: 'Sunic Apps',
            icon: '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '<rect x="4" y="4" width="12" height="12" rx="3" stroke="currentColor" stroke-width="3"/>' +
                '<rect x="20" y="4" width="12" height="12" rx="3" stroke="currentColor" stroke-width="3"/>' +
                '<rect x="4" y="20" width="12" height="12" rx="3" stroke="currentColor" stroke-width="3"/>' +
                '<rect x="20" y="20" width="12" height="12" rx="3" fill="currentColor"/></svg>'
        });
        SECTIONS.forEach(function (s) {
            Lampa.Template.add('settings_' + s[0], '<div></div>');
            add.call(api, { component: ROOT, param: { name: 'bs_go_' + s[0], type: 'button' }, field: { name: s[1], description: s[2] },
                onChange: function () { openSection(s[0]); } });
        });
        try { pinRegister(); } catch (e) {}
        // модули регистрируют пункты в 'bs_update' — раскладываем по разделам; не из раскладки — остаются в «Обновлении»
        api.addParam = function (data) {
            var name = data && data.component === 'bs_update' && data.param ? data.param.name : '';
            if (name && HIDDEN.indexOf(name) >= 0) return;
            var to = name ? place(name) : '';
            if (!to) return add.apply(api, arguments);
            if (flushed) return addTo(add, api, data, to);
            pending[name] = data;
        };
        api.addParam.__bsRoute = true;
        api.addParam.__bsOrig = add;
        try {
            Lampa.Settings.listener.follow('open', function (e) {
                if (e && e.body && e.body.find) hideLampa(e.body);
                if (e && e.name === 'main' && e.body && e.body.find) rootUp(e.body);
                sectionBack(e);
            });
        } catch (e) {}
    }

    function flush() {
        var api = Lampa.SettingsApi, add = api.addParam && api.addParam.__bsOrig;
        if (!add || flushed) return;
        flushed = true;
        for (var i = 0; i < LAYOUT.length; i++) {
            var to = LAYOUT[i][0], list = LAYOUT[i][1], title = '';
            for (var j = 0; j < list.length; j++) {
                var name = list[j];
                if (name.charAt(0) === '#') { title = name.slice(1); continue; }
                var data = pending[name];
                if (!data) continue;
                if (title) {
                    add.call(api, { component: to, param: { name: 'bs_hdr_' + to + '_' + j, type: 'title' }, field: { name: title } });
                    title = '';
                }
                addTo(add, api, data, to);
                delete pending[name];
            }
        }
    }

    /* ---------- «Обновление» ---------- */

    function notes(n) {
        if (!n || typeof n !== 'object') return null;
        var items = (Object.prototype.toString.call(n.items) === '[object Array]' ? n.items : []).slice(0, 6).map(function (i) { return String(i).slice(0, 240); });
        return { title: String(n.title || '').slice(0, 120), items: items };
    }
    function updateDialog(v, r, onYes) {
        var n = notes(r && r.notes), html = '<div style="line-height:1.5"><p><b>Sunic Apps: ' + esc(SA.version) + ' → ' + esc(v) + '</b>' +
            (n && n.title ? ' — ' + esc(n.title) : '') + '</p>';
        if (n && n.items.length) {
            html += '<ul style="margin:.3em 0 .8em 1.2em;padding:0">' + n.items.map(function (i) {
                return '<li style="margin-bottom:.4em">' + esc(i) + '</li>';
            }).join('') + '</ul>';
        }
        html += '<p style="opacity:.7">После обновления Lampa перезапустится — это несколько секунд.</p></div>';
        var ctrl = 'settings_component';
        try { ctrl = Lampa.Controller.enabled().name; } catch (e) {}
        var close = function () { try { Lampa.Modal.close(); Lampa.Controller.toggle(ctrl); } catch (e) {} };
        Lampa.Modal.open({
            title: 'Вышло обновление',
            html: $(html),
            size: 'medium',
            buttons_position: 'outside',
            buttons: [
                { name: 'Обновить сейчас', onSelect: function () { close(); onYes(); } },
                { name: 'Позже', onSelect: function () { close(); noty('Обновится при следующем запуске', 4000); } }
            ],
            onBack: close
        });
    }

    var SPONSORS = 'https://github.com/sponsors/sunic007';
    function supportQr() {
        var body = $('<div style="display:flex;align-items:center;padding:.5em 0">' +
            '<div class="bs-support__qr" style="width:12em;height:12em;background:#fff;padding:.6em;border-radius:.6em;flex:none;margin-right:1.5em"></div>' +
            '<div style="line-height:1.5"><p>Sunic Apps — бесплатно. Если функции вам полезны, поддержать развитие можно на GitHub Sponsors.</p>' +
            '<p>Наведите камеру телефона на QR-код.</p><p style="opacity:.7">' + SPONSORS + '</p></div></div>');
        try { Lampa.Utils.qrcode(SPONSORS, body.find('.bs-support__qr')[0]); } catch (e) {}
        var ctrl = 'settings_component';
        try { ctrl = Lampa.Controller.enabled().name; } catch (e) {}
        Lampa.Modal.open({ title: 'Поддержать проект', html: body, size: 'medium',
            onBack: function () { try { Lampa.Modal.close(); Lampa.Controller.toggle(ctrl); } catch (e) {} } });
    }

    function addSettings() {
        if (!window.Lampa || !Lampa.SettingsApi) return;
        route();
        var C = 'bs_update', api = Lampa.SettingsApi;
        var title = function (name, text) { api.addParam({ component: C, param: { name: name, type: 'title' }, field: { name: text } }); };
        api.addParam({
            component: C,
            param: { name: 'bs_torrents', type: 'trigger', 'default': true },
            field: { name: 'Торренты', description: 'Показать настройки «Парсер» и «TorrServer».' },
            onChange: function (v) { lsSet('bs_torrents', String(v === true || v === 'true')); }
        });
        title('sa_t_ver', 'Sunic Apps для Android');
        api.addParam({
            component: C,
            param: { name: 'sa_info_version', type: 'static' },
            field: { name: 'Версия ' + SA.version, description: 'Плагин с GitHub (sunic007/lampa-android), функции — как в Lampa для Samsung ' +
                SA.samsung + '. Саму Lampa обновляет приложение.' }
        });
        api.addParam({
            component: C,
            param: { name: 'sa_gh_update', type: 'trigger', 'default': true },
            field: { name: 'Обновлять с GitHub', description: 'Новая версия ставится сама при следующем запуске Lampa.' },
            onChange: function (v) { lsSet('sa_gh_update', String(v === true || v === 'true')); }
        });
        api.addParam({
            component: C,
            param: { name: 'sa_check_now', type: 'button' },
            field: { name: 'Проверить и обновить', description: 'Есть новая версия — покажет, что нового, и обновит, если согласитесь.' },
            onChange: function () {
                noty('Проверяю обновление…', 3000);
                SA.check(function (v, r) {
                    if (!v) return noty('Обновлений нет · Sunic Apps ' + SA.version, 5000);
                    updateDialog(v, r, function () {
                        SA.allow(v);
                        noty('Обновляю — Lampa перезапустится', 3000);
                        setTimeout(function () { location.reload(); }, 2000);
                    });
                });
            }
        });
        title('sa_t_support', 'Проект');
        api.addParam({
            component: C,
            param: { name: 'sa_support', type: 'button' },
            field: { name: 'Поддержать проект', description: 'Плагин бесплатный. Помочь развитию можно на GitHub Sponsors — QR-код для телефона.' },
            onChange: supportQr
        });
        // условие API TMDB: указать источник данных о фильмах (бот и строки Sunic Apps берут их у TMDB)
        api.addParam({
            component: C,
            param: { name: 'sa_info_tmdb', type: 'static' },
            field: { name: 'Данные о фильмах — TMDB', description: 'Этот продукт использует API TMDB, но не одобрен и не сертифицирован TMDB.' }
        });
    }

    /* ---------- запуск модулей ---------- */

    // Порядок — как в loader.js пакета; BSHub и BSVolume — только для Samsung, сюда не грузятся
    var MODULES = ['BSSkaz', 'BSGuard', 'BSFeatures', 'BSPlayer', 'BSRch', 'BSFix', 'BSSources', 'BSMenu', 'BSContinue', 'BSWatch', 'BSTelegram', 'BSBot'];
    var SAMSUNG_ONLY_MODULES = { BSHub: 1, BSVolume: 1 };

    /* ---------- раскладка из loader.js той же версии Lampa для Samsung ----------
     * Выше — встроенная копия на случай, когда loader.js не пришёл. Обычно раздел, порядок пунктов, скрытые пункты,
     * зависимости и порядок запуска модулей берутся из loader.js выпуска, модули которого сейчас загружены, —
     * поэтому новая настройка в .wgt появляется и здесь без выпуска плагина. */

    /** Литерал после «var NAME =» — до парной скобки (строки и комментарии пропускаются). */
    function literal(src, name) {
        var m = new RegExp('\\bvar\\s+' + name + '\\s*=\\s*').exec(src);
        if (!m) return null;
        var i = m.index + m[0].length, open = src.charAt(i), close = open === '[' ? ']' : open === '{' ? '}' : '';
        if (!close) return null;
        var depth = 0, q = '';
        for (var j = i; j < src.length; j++) {
            var c = src.charAt(j);
            if (q) { if (c === '\\') j++; else if (c === q) q = ''; continue; }
            if (c === '"' || c === "'") { q = c; continue; }
            if (c === '/' && src.charAt(j + 1) === '/') { var nl = src.indexOf('\n', j); if (nl < 0) return null; j = nl; continue; }
            if (c === '/' && src.charAt(j + 1) === '*') { var e = src.indexOf('*/', j + 2); if (e < 0) return null; j = e + 1; continue; }
            if (c === open) depth++;
            else if (c === close && --depth === 0) return src.slice(i, j + 1);
        }
        return null;
    }
    function value(src, name) {
        var lit = literal(src, name);
        if (!lit) return null;
        try { return new Function('return ' + lit)(); } catch (e) { return null; }    // eslint-disable-line no-new-func
    }
    function isArr(a) { return Object.prototype.toString.call(a) === '[object Array]'; }
    function strs(a) { return isArr(a) && a.every(function (x) { return typeof x === 'string'; }); }

    /** Разбор loader.js: всё, что повторяем, — в виде, который можно сохранить (JSON), или null, если что-то не так.
     *  Правила «что из Lampa прятать» (BS_SETTINGS_HIDE_IF) содержат функции — их храним текстом. */
    function parseLoader(src) {
        src = String(src || '');
        var order = [], re = /\btry\s*\{\s*(BS\w+)\.start\(\)/g, m;
        while ((m = re.exec(src))) if (!SAMSUNG_ONLY_MODULES[m[1]] && order.indexOf(m[1]) < 0) order.push(m[1]);
        var p = { sections: value(src, 'BS_SECTIONS'), layout: value(src, 'BS_SETTINGS_LAYOUT'), hidden: value(src, 'BS_SETTINGS_HIDDEN'),
            needs: value(src, 'BS_SETTINGS_NEEDS'), pin: value(src, 'BS_SECTIONS_PIN'), hideIf: literal(src, 'BS_SETTINGS_HIDE_IF'), modules: order };
        return checkParsed(p) ? p : null;
    }
    function checkParsed(p) {
        if (!p || typeof p !== 'object') return false;
        if (!isArr(p.sections) || !p.sections.length || !p.sections.every(function (s) { return strs(s) && s.length >= 2; })) return false;
        if (!isArr(p.layout) || !p.layout.length || !p.layout.every(function (l) { return isArr(l) && typeof l[0] === 'string' && strs(l[1]); })) return false;
        if (!strs(p.hidden) || !strs(p.modules)) return false;
        if (!p.needs || typeof p.needs !== 'object' || isArr(p.needs)) p.needs = {};
        if (!p.pin || typeof p.pin !== 'object' || isArr(p.pin)) p.pin = null;
        if (typeof p.hideIf !== 'string') p.hideIf = null;
        return true;
    }
    /** Правила «что из Lampa прятать» с телевизора — с поправками для Android:
     *  «Тип плеера» на ТВ прячет автовыбор AVPlay — здесь плеер выбирает человек, не прячем;
     *  торренты на Android — обычное дело: «Парсер» и «TorrServer» видны, пока «Торренты» не выключены. */
    function androidHideIf(text) {
        var list = null;
        try { list = new Function('bsLsOn', 'return ' + text)(lsOn); } catch (e) { return null; }    // eslint-disable-line no-new-func
        if (!isArr(list)) return null;
        var out = [];
        for (var i = 0; i < list.length; i++) {
            var it = list[i];
            if (!it || typeof it.sel !== 'string' || typeof it.when !== 'function') return null;
            if (it.sel.indexOf('[data-name="player"]') >= 0) continue;
            if (it.sel.indexOf('player_torrent') >= 0) it = { sel: it.sel, when: function () { return !lsOn('bs_torrents', true); } };
            out.push(it);
        }
        return out;
    }
    /** Подставить разобранное вместо встроенной копии. Раздел «Обновление» — свой (у плагина своя версия). */
    function applyLoader(p) {
        if (!checkParsed(p)) return false;
        var hide = p.hideIf ? androidHideIf(p.hideIf) : null;
        SECTIONS = p.sections;
        LAYOUT = p.layout;
        HIDDEN = p.hidden.concat(ANDROID_HIDDEN.filter(function (n) { return p.hidden.indexOf(n) < 0; }));
        NEEDS = p.needs;
        if (p.modules.length >= 3) MODULES = p.modules;
        if (p.pin) PIN_SECTIONS = p.pin;
        if (hide) HIDE_IF = hide;
        SA.layoutFrom = SA.samsung;
        return true;
    }
    /** cb() — когда раскладка готова: из памяти той же версии, из loader.js (до 8 с) или встроенная.
     *  В памяти — только разобранное (несколько КБ), не весь loader.js. */
    function loadLayout(cb) {
        var v = SA.samsung, key = 'sa_layout', done = false;
        var fin = function () { if (!done) { done = true; cb(); } };
        if (!/^\d+\.\d+\.\d+$/.test(String(v || ''))) return fin();
        try {
            var c = JSON.parse(lsGet(key) || 'null');
            if (c && c.v === v && applyLoader(c.p)) return fin();
        } catch (e) {}
        var mirrors = ['https://cdn.jsdelivr.net/gh/', 'https://fastly.jsdelivr.net/gh/', 'https://gcore.jsdelivr.net/gh/', 'https://sunic.stream/gh/'];
        setTimeout(fin, 8000);
        (function next(i) {
            if (i >= mirrors.length || done) return fin();
            try {
                var x = new XMLHttpRequest();
                x.open('GET', mirrors[i] + 'sunic007/lampa-samsung@v' + v + '/src/loader.js', true);
                x.timeout = 6000;
                x.onload = function () {
                    if (done) return;
                    var p = x.status === 200 ? parseLoader(x.responseText) : null;
                    if (!p) return next(i + 1);
                    lsSet(key, JSON.stringify({ v: v, p: p }));
                    applyLoader(p);
                    fin();
                };
                x.onerror = x.ontimeout = function () { next(i + 1); };
                x.send();
            } catch (e) { next(i + 1); }
        })(0);
    }

    function startAll() {
        try { keepOursOnCacheClear(Lampa.Storage); } catch (e) {}
        try { addSettings(); } catch (e) { console.log('Sunic Apps settings', e); }
        for (var i = 0; i < MODULES.length; i++) {
            var M = window[MODULES[i]];
            if (M && typeof M.start === 'function') { try { M.start(); } catch (e) { console.log('Sunic Apps', MODULES[i], e); } }
        }
        try { flush(); } catch (e) { console.log('Sunic Apps settings flush', e); }
        SA.started = true;
    }

    // серверы Skaz: на ТВ быстрый замер идёт до запуска Lampa; здесь Lampa уже идёт — замер и сразу дальше
    try { if (window.BSSkaz && BSSkaz.prepare) BSSkaz.prepare(function () {}); } catch (e) {}
    var layoutReady = false;
    loadLayout(function () { layoutReady = true; });
    var timer = setInterval(function () {
        if (!layoutReady || !window.appready || !window.Lampa) return;
        clearInterval(timer);
        startAll();
    }, 300);

    SA._test = {
        get: function () { return { LAYOUT: LAYOUT, HIDDEN: HIDDEN, NEEDS: NEEDS, SECTIONS: SECTIONS, MODULES: MODULES, PIN: PIN_SECTIONS, HIDE_IF: HIDE_IF }; },
        LAYOUT: LAYOUT, HIDDEN: HIDDEN, HIDE_IF: HIDE_IF, SECTIONS: SECTIONS, MODULES: MODULES, place: place,
        parseLoader: parseLoader, applyLoader: applyLoader, hide: function () { return HIDE_IF; }, pin: function () { return PIN_SECTIONS; }
    };
})();
