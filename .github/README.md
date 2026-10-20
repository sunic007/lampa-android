<picture><img src="../docs/logo.png" width="210" align="left" alt="Lampa"></picture>

<p align="center"><b>Sunic Apps</b> features for <b>Lampa on Android</b> — phone, tablet, Android TV and boxes.<br>Telegram bot, «continue where you left off», player watchdog and automatic source choice — as a plugin, no separate app.</p>

<p align="center">
<a href="https://github.com/sunic007/lampa-android/tags"><img src="https://img.shields.io/github/v/tag/sunic007/lampa-android?style=flat-square&label=version&color=2f81f7" alt="version"></a>
<picture><img src="https://img.shields.io/badge/Lampa-plugin-3ddc84?style=flat-square&logo=android&logoColor=white" alt="Lampa plugin"></picture>
<picture><img src="https://img.shields.io/badge/Telegram-bot-26a5e4?style=flat-square&logo=telegram&logoColor=white" alt="Telegram bot"></picture>
<a href="https://t.me/sunicapps"><img src="https://img.shields.io/badge/Telegram-help-26a5e4?style=flat-square&logo=telegram&logoColor=white" alt="Telegram"></a>
</p>

<p align="center"><picture><img src="https://flagcdn.com/h60/gb.png" height="30" align="middle" alt=""></picture> <b>English</b>&nbsp;&nbsp;&nbsp;<a href="README.ru.md"><img src="https://flagcdn.com/h60/ru.png" height="30" align="middle" alt=""> Русский</a>&nbsp;&nbsp;&nbsp;<a href="README.uz.md"><img src="https://flagcdn.com/h60/uz.png" height="30" align="middle" alt=""> O'zbekcha</a></p>

<p align="center"><sub>Free · <a href="https://sunic.stream">sunic.stream</a> · Android 6+ · <a href="CHANGELOG.md">What's new</a> (RU) · <a href="../docs/DEVELOPMENT.md">For developers</a> (RU)</sub></p>

<br clear="left">

## Connect

<div align="justify">

1. Open Lampa on Android — for example, <b>Lampa BS</b>.
2. <b>Настройки → Расширения → Добавить плагин</b> (Settings → Extensions → Add plugin).
3. Paste the address and confirm:

</div>

```
https://sunic.stream/sunic.js
```

<div align="justify">

The old address <code>https://sunic007.github.io/lampa-android/sunic.js</code> still works.

4. Restart Lampa. Settings get a <b>«Sunic Apps»</b> section, right under «Синхронизация» (Sync).

From then on the plugin updates itself from GitHub: a new version is installed on the next Lampa start. To update right away — Settings → Sunic Apps → «Обновление» → «Проверить и обновить».

</div>

<p align="center">
  <picture><img src="../docs/screenshots/01.webp" width="24.4%" alt="Sunic Apps section in Lampa settings"></picture>
  <picture><img src="../docs/screenshots/02.webp" width="24.4%" alt="Sunic Apps subsections: player, sources, Telegram bot, interface, updates"></picture>
  <picture><img src="../docs/screenshots/03.webp" width="24.4%" alt="Player settings: watchdog, quality for your connection speed"></picture>
  <picture><img src="../docs/screenshots/04.webp" width="24.4%" alt="Connecting the Telegram bot"></picture>
</p>

## Where it works

<div align="justify">

The same Lampa with Sunic Apps works on any platform — <a href="https://sunic.stream">sunic.stream</a>:

- <b>Android</b> — TV, boxes, phones: this plugin, <code>https://sunic.stream/sunic.js</code> (above).
- <b>Any Smart TV</b> — Samsung, LG, Android TV and others — through the <b>Media Station X</b> app: <b>Settings → Start Parameter → Setup</b> → <code>sunic.stream</code>. No developer mode.
- <b>Browser</b> — <a href="https://sunic.stream/lampa/">sunic.stream/lampa</a>. Skaz sources don't open in a browser (Skaz servers are http only, the page is https); Online Mod and Z01 work.
- <b>Samsung Smart TV</b> — the most complete version: the <a href="https://github.com/sunic007/lampa-samsung">Lampa for Samsung</a> app (TV volume memory, the Smart Hub panel, sleep that closes the app, the TV player AVPlay).

</div>

## Features

<div align="justify">

The same features as <a href="https://github.com/sunic007/lampa-samsung">Lampa for Samsung</a> — it is the same code:

- <b>Telegram bot</b>: search from your phone, «▶️ Смотреть» (Watch) starts the movie in Lampa, new episodes and «out in good quality» alerts. One bot for several devices — the «Подключить через бота» (Connect via bot) code.
- <b>Continue where you left off</b>: one OK — the same episode, source and voice-over.
- <b>Player watchdog</b>: a stuck video is restarted, switched to another quality or another source.
- <b>While watching</b>: skip intro and credits, «Next episode» countdown, «Are you still watching?», sleep timer, remembered audio track.
- <b>Sources</b>: automatic source choice, checking sources in advance, Skaz server choice, other online sources to pick from.
- <b>Interface</b>: one «Смотреть» (Watch) button on the card, «Турецкие сериалы» (Turkish series) and «Мультики» (Cartoons) in the menu, «Новые серии» (New episodes) on start.

When a new Lampa for Samsung release comes out, the same features and the same settings appear here on the next start, by themselves.

</div>

## Differences from Lampa for Samsung

<div align="justify">

- <b>The player, ads and Lampa updates</b> are up to the app — the plugin does not touch them. The «while watching» features work in Lampa's built-in player.
- <b>The bot answers while Lampa is open</b> (on a Samsung TV it also works with Lampa closed — there it is a service of the package).
- <b>No Samsung-only features</b>: the Smart Hub panel and TV volume.
- <b>«Парсер» (Parser) and «TorrServer»</b> are visible right away (on the TV they are hidden until needed).

</div>

## FAQ

<details>
<summary><b>Extensions show 404 or «Не удалось проверить» (could not check)</b></summary>
<br>
<div align="justify">Check the address — it must be exactly <code>https://sunic.stream/sunic.js</code> (or the old <code>https://sunic007.github.io/lampa-android/sunic.js</code>). «Could not check» happens on a slow network: restart Lampa — the «Sunic Apps» section appears if the plugin loaded.</div>
</details>

<details>
<summary><b>How to use the same bot as on the TV</b></summary>
<br>
<div align="justify">On Android: <b>Настройки → Sunic Apps → Telegram-бот → «Подключить через бота»</b> — a code appears on the screen. Send it in Telegram to the bot that already works on the TV. No need to enter the token again.</div>
</details>

<details>
<summary><b>Which apps work</b></summary>
<br>
<div align="justify">Lampa for Android with the app bridge — for example, <b>Lampa BS</b>. Tested on Lampa BS 0.1.0.935 (Lampa 3.3.2). Write to the <a href="https://t.me/sunicapps">group</a> if something is wrong in another app.</div>
</details>

<details>
<summary><b>How to remove</b></summary>
<br>
<div align="justify"><b>Настройки → Расширения</b> (Settings → Extensions) → the «Sunic Apps» plugin → remove, then restart Lampa.</div>
</details>

## Data and privacy

<div align="justify">

The plugin adds no ads or analytics, and the developer receives none of your data. The Telegram bot runs in Lampa on your device: its token, the people you approved and your lists are stored only there. Phone pairing goes through ntfy.sh, encrypted. Movie data comes from TMDB. AI search sends a description or a screenshot only to the AI service whose key you added. Third-party online sources you enable in Lampa run inside the app — enable only the ones you trust.

</div>

## Using this project

<div align="justify">

Want to use the plugin in your project, build, article or video? Go ahead — just <b>link to this repository</b>. I'll be glad if you <b>let me know</b> (optional): write to the <a href="https://t.me/sunicapps">Telegram group</a> or open an <a href="https://github.com/sunic007/lampa-android/issues/new/choose">issue</a>. The code is MIT-licensed.

</div>

## Support the project

<div align="justify">

Sunic Apps is free. If the plugin helped you, you can support its development on <a href="https://github.com/sponsors/sunic007"><b>GitHub Sponsors</b></a> (in Lampa: «Настройки → Sunic Apps → Обновление → Поддержать проект»).

</div>

---

<div align="justify"><sub>The project does not store, host or distribute movies, series or other content and is not affiliated with the content services it may be used with. Android is a trademark of Google LLC; the project is not affiliated with Google. Telegram is a trademark of Telegram FZ-LLC; the project is not affiliated with Telegram. Movie data — <a href="https://www.themoviedb.org">TMDB</a>: this product uses the TMDB API but is not endorsed or certified by TMDB. Lampa is the <a href="https://github.com/yumata/lampa">yumata/lampa</a> project; the Lampa BS app, plugins and server are by <a href="https://lampabs.com">byskaz</a>; the plugin does not modify them and is not part of them. Third-party components — <a href="../licenses/THIRD_PARTY_NOTICES.md">THIRD_PARTY_NOTICES.md</a>.</sub></div>
