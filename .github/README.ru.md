<picture><img src="../docs/logo.png" width="210" align="left" alt="Lampa"></picture>

<p align="center">Функции <b>Sunic Apps</b> для <b>Lampa на Android</b> — телефон, планшет, Android TV и приставки.<br>Telegram-бот, «Продолжить с места», сторож плеера и автоподбор источников — плагином, без отдельного приложения.</p>

<p align="center">
<a href="https://github.com/sunic007/lampa-android/releases/latest"><img src="https://img.shields.io/github/v/release/sunic007/lampa-android?style=flat-square&label=release&color=2f81f7" alt="release"></a>
<picture><img src="https://img.shields.io/badge/Lampa-plugin-3ddc84?style=flat-square&logo=android&logoColor=white" alt="Lampa plugin"></picture>
<picture><img src="https://img.shields.io/badge/Telegram-bot-26a5e4?style=flat-square&logo=telegram&logoColor=white" alt="Telegram bot"></picture>
<a href="https://t.me/sunicapps"><img src="https://img.shields.io/badge/Telegram-help-26a5e4?style=flat-square&logo=telegram&logoColor=white" alt="Telegram"></a>
</p>

<p align="center"><a href="README.md"><img src="https://flagcdn.com/h60/gb.png" height="30" align="middle" alt=""> English</a>&nbsp;&nbsp;&nbsp;<picture><img src="https://flagcdn.com/h60/ru.png" height="30" align="middle" alt=""></picture> <b>Русский</b>&nbsp;&nbsp;&nbsp;<a href="README.uz.md"><img src="https://flagcdn.com/h60/uz.png" height="30" align="middle" alt=""> O'zbekcha</a></p>

<p align="center"><sub>Бесплатно · Android 6+ · <a href="CHANGELOG.md">Что нового</a> · <a href="../docs/DEVELOPMENT.md">Для разработчиков</a></sub></p>

<br clear="left">

## Как подключить

<div align="justify">

1. Откройте Lampa на Android — например, <b>Lampa BS</b>.
2. <b>Настройки → Расширения → Добавить плагин</b>.
3. Вставьте адрес и нажмите «Готово»:

</div>

```
https://sunic007.github.io/lampa-android/sunic.js
```

<div align="justify">

4. Перезапустите Lampa. В настройках появится раздел <b>«Sunic Apps»</b> — сразу под «Синхронизацией».

Дальше плагин обновляется сам с GitHub. Когда выходит новая версия, Lampa показывает окно «Вышло обновление» и ставит её при следующем запуске.

</div>

<p align="center">
  <picture><img src="../docs/screenshots/01.webp" width="24.4%" alt="Раздел «Sunic Apps» в настройках Lampa"></picture>
  <picture><img src="../docs/screenshots/02.webp" width="24.4%" alt="Подразделы Sunic Apps: плеер, источники, Telegram-бот, интерфейс, обновление"></picture>
  <picture><img src="../docs/screenshots/03.webp" width="24.4%" alt="Настройки плеера: сторож, качество под скорость интернета"></picture>
  <picture><img src="../docs/screenshots/04.webp" width="24.4%" alt="Подключение Telegram-бота"></picture>
</p>


## Возможности

<div align="justify">

Те же функции, что в <a href="https://github.com/sunic007/lampa-samsung">Lampa для Samsung</a>, — это один и тот же код:

- <b>Telegram-бот</b>: поиск с телефона, «▶️ Смотреть» — и фильм идёт в Lampa, новые серии и «вышло в хорошем качестве». Один бот на несколько устройств — код «Подключить через бота».
- <b>«Продолжить с места»</b>: один ОК — та же серия, тот же источник, та же озвучка.
- <b>Сторож плеера</b>: видео зависло — перезапуск, другое качество или другой источник.
- <b>Во время просмотра</b>: метки пропуска заставки и титров, отсчёт «Следующая серия», «Вы ещё смотрите?», таймер сна, память звуковой дорожки.
- <b>Источники</b>: автоподбор источника, проверка заранее, выбор серверов Skaz, другие онлайн-источники на выбор.
- <b>Интерфейс</b>: одна кнопка «Смотреть» на карточке, «Турецкие сериалы» и «Мультики» в меню, «Новые серии» при запуске.

Вышел новый выпуск Lampa для Samsung — при следующем запуске те же функции и те же пункты настроек появляются и здесь, сами.

</div>

## Чем отличается от Lampa для Samsung

<div align="justify">

- <b>Плеер, реклама и обновление самой Lampa</b> — за приложением, плагин их не трогает. Функции «Во время просмотра» работают во встроенном плеере Lampa.
- <b>Бот отвечает, пока Lampa открыта</b> (на телевизоре Samsung он работает и при закрытой Lampa — там это служба пакета).
- <b>Нет того, что есть только у Samsung</b>: панели Smart Hub и громкости телевизора.
- <b>«Парсер» и «TorrServer»</b> видны сразу (на ТВ они спрятаны, пока не нужны).

</div>

## Частые вопросы

<details>
<summary><b>В «Расширениях» ошибка 404 или «Не удалось проверить»</b></summary>
<br>
<div align="justify">Проверьте адрес — он должен быть ровно <code>https://sunic007.github.io/lampa-android/sunic.js</code>. «Не удалось проверить» бывает, когда сеть медленная: перезапустите Lampa — раздел «Sunic Apps» появится, если плагин загрузился.</div>
</details>

<details>
<summary><b>Как подключить тот же бот, что на телевизоре</b></summary>
<br>
<div align="justify">На Android: <b>Настройки → Sunic Apps → Telegram-бот → «Подключить через бота»</b> — на экране появится код. Отправьте его боту в Telegram, тому, что уже работает на телевизоре. Токен второй раз вводить не нужно.</div>
</details>

<details>
<summary><b>Какие приложения подходят</b></summary>
<br>
<div align="justify">Lampa для Android с мостом приложения — например, <b>Lampa BS</b>. Проверено на Lampa BS 0.1.0.935 (Lampa 3.3.2). Пишите в <a href="https://t.me/sunicapps">группу</a>, если в другом приложении что-то не так.</div>
</details>

<details>
<summary><b>Как удалить</b></summary>
<br>
<div align="justify"><b>Настройки → Расширения</b> → плагин «Sunic Apps» → удалить, потом перезапустите Lampa.</div>
</details>

## Данные и приватность

<div align="justify">

Плагин не добавляет рекламы и аналитики, разработчик не получает ваших данных. Telegram-бот работает в Lampa на вашем устройстве: его токен, одобренные вами люди и ваши списки хранятся только там. Подключение телефона идёт через сервис ntfy.sh в зашифрованном виде. Данные о фильмах — из TMDB. ИИ-поиск отправляет описание или скриншот только в тот ИИ-сервис, чей ключ вы добавили. Сторонние онлайн-источники, которые вы включаете в Lampa, работают внутри приложения — включайте только те, которым доверяете.

</div>

## Использование проекта

<div align="justify">

Хотите использовать плагин в своём проекте, сборке, статье или видео? Пожалуйста, — только <b>оставьте ссылку на этот репозиторий</b>. Буду рад, если <b>сообщите мне</b> (по желанию): напишите в <a href="https://t.me/sunicapps">группу в Telegram</a> или откройте <a href="https://github.com/sunic007/lampa-android/issues/new/choose">issue</a>. Код — по лицензии MIT.

</div>

## Поддержать проект

<div align="justify">

Sunic Apps — бесплатно. Если плагин вам помог, поддержать развитие можно на <a href="https://github.com/sponsors/sunic007"><b>GitHub Sponsors</b></a> (в Lampa: «Настройки → Sunic Apps → Обновление → Поддержать проект»).

</div>

---

<div align="justify"><sub>Проект не хранит, не размещает и не распространяет фильмы, сериалы и другие материалы и не связан с сервисами контента, с которыми может использоваться. Android — товарный знак Google LLC; проект не связан с Google. Telegram — товарный знак Telegram FZ-LLC; проект не связан с Telegram. Данные о фильмах — <a href="https://www.themoviedb.org">TMDB</a>: этот продукт использует API TMDB, но не одобрен и не сертифицирован TMDB. Lampa — проект <a href="https://github.com/yumata/lampa">yumata/lampa</a>, приложение Lampa BS, плагины и сервер — <a href="https://lampabs.com">byskaz</a>; плагин их не изменяет и в них не входит. Сторонние компоненты — <a href="../licenses/THIRD_PARTY_NOTICES.md">THIRD_PARTY_NOTICES.md</a>.</sub></div>
