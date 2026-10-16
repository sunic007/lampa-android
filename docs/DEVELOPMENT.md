# Для разработчиков

## Как устроено

| Файл | Что делает |
|---|---|
| `docs/sunic.js` | Загрузчик — его адрес человек вставляет в Lampa (GitHub Pages: `https://sunic007.github.io/lampa-android/sunic.js`). Читает `version.json`, грузит модули и `src/android.js` с jsDelivr по тегам, проверяет обновления. Почти не меняется. |
| `src/android.js` | Вместо `loader.js` пакета Samsung: раздел настроек «Sunic Apps» (та же раскладка), раздел «Обновление» плагина, запуск модулей. |
| `version.json` | Выпуск: версия плагина, версия Lampa для Samsung, чьи модули берём (`samsung`), список модулей, «что нового». Пишет `tools/bump.py`. |
| модули `bs*.js`, `skazauto.js`, `playerguard.js` | Не здесь — в [sunic007/lampa-samsung](https://github.com/sunic007/lampa-samsung) (`src/`), грузятся по тегу `v<samsung>` без правок. Править — там. |

Плагин от выпусков .wgt не зависит: на новые модули он переходит, только когда в его `version.json` записана новая
версия `samsung`. Модули Samsung без правок работают на Android, потому что сами проверяют платформу (`Platform.is('tizen')`)
и прячут вызовы Tizen в `try`. Что плагин делает за них:
- `bs_noads = true` — модуль не трогает `personal1.lampa` приложения (рекламу решает Lampa BS);
- `bs_sleep_hint = 1` — без подсказки про меню телевизора Samsung;
- не грузит `loader.js` (он загрузил бы ядро Lampa второй раз), `bshub.js` (Smart Hub), `bsvolume.js` (громкость ТВ);
- прячет пункты только для AVPlay: «Автовыбор плеера», «Буфер плеера ТВ», «Пропускать рекламу».

Раскладка настроек в `src/android.js` должна совпадать с `loader.js` пакета — `tests/run.cjs` сверяет её и порядок
запуска модулей с `loader.js` по тегу `v<samsung>`.

## Проверка

```
node tests/run.cjs                 # модули Samsung — с GitHub; без сети: SAMSUNG_DIR=../lampa-samsung/src node tests/run.cjs
npx -y acorn@8.14.0 --ecma5 --silent docs/sunic.js src/android.js
```

Весь JavaScript — ES5 (старые Android TV со старым WebView).

## Выпуск

1. Раздел в `.github/CHANGELOG.md`: `## 1.0.1 — коротко` и пункты. Русский текст — это окно «Вышло обновление» в Lampa и пост в канал.
2. `python tools/bump.py patch` (или `minor`; `--samsung 2.1.2` — перейти на модули другой **выпущенной** версии Lampa для Samsung).
   Пишет `version.json` и `PIN` в `docs/sunic.js`, запускает тесты.
3. Коммит, `git tag v1.0.1`, `git push origin main v1.0.1`.
4. `gh release create v1.0.1 --title "Sunic Apps для Android 1.0.1 — …" --notes-file notes.md` — в заметках разделы `**RU**` и `**EN**`.
   Файлов к релизу не нужно: плагин — это адрес. `telegram-post.yml` сам отправит пост в канал (секрет `TELEGRAM_BOT_TOKEN`).
5. Проверить, что отвечают 200: `https://cdn.jsdelivr.net/gh/sunic007/lampa-android@v1.0.1/src/android.js` и
   `https://sunic007.github.io/lampa-android/sunic.js`. Lampa подхватит новую версию сама (проверка через 20 с после запуска).
6. Прошлый релиз удалить (тег оставить): хранится только последний.

Настройки репозитория: GitHub Pages — из ветки `main`, папка `/docs`; секрет `TELEGRAM_BOT_TOKEN` — тот же бот-публикатор, что в lampa-samsung.
