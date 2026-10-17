# Third-party notices / Сторонние компоненты

This repository contains only the plugin's own code (MIT — see [LICENSE](../LICENSE)): the loader `docs/sunic.js`,
`src/android.js`, tools and tests. It does **not** include Lampa or any app.

- **Sunic Apps modules** (`bs*.js`, `skazauto.js`, `playerguard.js`) are loaded at runtime from
  [sunic007/lampa-samsung](https://github.com/sunic007/lampa-samsung) (MIT) from its latest release (`main/version.json` of lampa-samsung); the copy in our `version.json` is only a fallback.
- **Lampa** (yumata, GPL-2.0, https://github.com/yumata/lampa-source) and the Android app that runs it (for example,
  **Lampa BS** by byskaz) belong to their authors. The plugin runs inside the app the user installed and does not ship or change it.
- **Skaz** plugins and servers belong to their authors; the subscription is Skaz TV's service (https://skaz.tv).
- Movie data comes from **TMDB**: this product uses the TMDB API but is not endorsed or certified by TMDB.

В репозитории — только собственный код плагина (MIT). Lampa и приложение Lampa BS сюда не входят и плагином не
меняются; модули Sunic Apps загружаются из sunic007/lampa-samsung (MIT) из последнего выпуска (`version.json` ветки `main` lampa-samsung); запись в нашем `version.json` — только запасная.
