# Для разработчиков

## Как устроено

| Файл | Что делает |
|---|---|
| `docs/sunic.js` | Загрузчик — его адрес человек вставляет в Lampa (GitHub Pages: `https://sunic007.github.io/lampa-android/sunic.js`). При каждом запуске читает `version.json` пакета lampa-samsung (ветка `main`) и грузит модули **последнего выпуска .wgt** по его тегу, затем `src/android.js` по тегу плагина; проверяет обновления плагина. |
| `src/android.js` | Вместо `loader.js` пакета Samsung: раздел настроек «Sunic Apps» (раскладка — из `loader.js` того же выпуска), раздел «Обновление» плагина, запуск модулей. |
| `version.json` | Выпуск: версия плагина, запасная версия Lampa для Samsung (`samsung`) и её модули — на случай, когда GitHub недоступен и ничего не запомнено, «что нового». Пишет `tools/bump.py`. |
| модули `bs*.js`, `skazauto.js`, `playerguard.js` | Не здесь — в [sunic007/lampa-samsung](https://github.com/sunic007/lampa-samsung) (`src/`), грузятся по тегу последнего выпуска без правок. Править — там. |

Плагин повторяет выпуски .wgt сам: вышел `vX.Y.Z` в lampa-samsung — при следующем запуске Lampa на Android те же модули,
те же пункты настроек (раскладка, скрытые пункты, зависимости, PIN-разделы, что прятать в Lampa и порядок запуска модулей
разбираются из `loader.js` этого выпуска; в памяти — только разобранное, `sa_layout`). Выпуск плагина для этого не нужен. Новый выпуск не поднял Lampa два запуска подряд — он плохой на сутки
(`sa_sam_bad`), грузится прошлый удачный (`sa_sam`); нет сети — тоже прошлый удачный. Модули Samsung без правок работают на Android, потому что сами проверяют платформу (`Platform.is('tizen')`)
и прячут вызовы Tizen в `try`. Что плагин делает за них:
- `bs_noads = true` — модуль не трогает `personal1.lampa` приложения (рекламу решает Lampa BS);
- `bs_sleep_hint = 1` — без подсказки про меню телевизора Samsung;
- не грузит `loader.js` (он загрузил бы ядро Lampa второй раз), `bshub.js` (Smart Hub), `bsvolume.js` (громкость ТВ);
- прячет пункты только для AVPlay («Автовыбор плеера», «Буфер плеера ТВ») и «Пропускать рекламу» (рекламу решает приложение).

В `src/android.js` есть встроенная копия раскладки — на случай, когда `loader.js` не пришёл. `tests/run.cjs` разбирает
`loader.js` последнего выпуска так же, как плагин, и пишет предупреждение, если встроенная копия отстала (обновить её при следующем выпуске плагина).

## Проверка

```
node tests/run.cjs                 # модули Samsung — с GitHub; без сети: SAMSUNG_DIR=../lampa-samsung/src node tests/run.cjs
npx -y acorn@8.14.0 --ecma5 --silent docs/sunic.js src/android.js
```

Весь JavaScript — ES5 (старые Android TV со старым WebView).

## Выпуск

Номер версии плагина — всегда тот же, что у Lampa для Samsung: тег `vX.Y.Z` один и тот же в обоих репозиториях.

**Обычно — само.** Вышел тег `vX.Y.Z` в lampa-samsung — в течение часа `.github/workflows/follow-samsung.yml` делает здесь
то же: `python tools/bump.py --samsung X.Y.Z` (version.json, PIN, раздел CHANGELOG из «что нового» выпуска для Samsung,
если своего нет), тесты, коммит, тег `vX.Y.Z`. Запустить сразу — Actions → Follow Lampa for Samsung → Run workflow.

**Правки самого плагина** (`src/android.js`, `docs/sunic.js`) — в `main`, с разделом `## X.Y.Z — …` в `.github/CHANGELOG.md`
под номер следующего выпуска для Samsung. Выходят вместе с ним: тег ставится на `main` со всеми правками.
`docs/sunic.js` — исключение: он на GitHub Pages и у людей обновляется сразу после push в `main`.

Вручную (тег в lampa-samsung уже есть):
1. `python tools/bump.py --samsung X.Y.Z` — пишет `version.json` и `PIN` в `docs/sunic.js`, запускает тесты.
2. Коммит, `git tag vX.Y.Z`, `git push origin main vX.Y.Z`.
3. Проверить, что отвечают 200: `https://cdn.jsdelivr.net/gh/sunic007/lampa-android@vX.Y.Z/src/android.js` и
   `https://sunic007.github.io/lampa-android/sunic.js`. Lampa подхватит новую версию сама (проверка через 20 с после запуска).

GitHub выключает расписание в репозитории, где 60 дней не было коммитов; коммиты выпусков держат его включённым.
Выключилось — Actions → Follow Lampa for Samsung → Enable workflow.

Настройки репозитория: GitHub Pages — из ветки `main`, папка `/docs`. Поста в канал о выпуске плагина нет: в канале — пост о выпуске для Samsung, плагин выходит тем же номером.
