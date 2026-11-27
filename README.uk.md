<p align="center">
  <img src="docs/assets/banner-uk.png" alt="Blably" width="830">
</p>

<p align="center">
  <a href="README.md"><img src="https://img.shields.io/badge/English-E4ECFF?style=for-the-badge&labelColor=E4ECFF" alt="English"></a>
  <a href="README.uk.md"><img src="https://img.shields.io/badge/%D0%A3%D0%BA%D1%80%D0%B0%D1%97%D0%BD%D1%81%D1%8C%D0%BA%D0%B0-2F6BFF?style=for-the-badge" alt="Українська"></a>
  <a href="README.ru.md"><img src="https://img.shields.io/badge/%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9-E4ECFF?style=for-the-badge&labelColor=E4ECFF" alt="Русский"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/T%C3%BCrk%C3%A7e%20%E2%87%84%20%D0%A3%D0%BA%D1%80%D0%B0%D1%97%D0%BD%D1%81%D1%8C%D0%BA%D0%B0%20%C2%B7%20%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9-2F6BFF?style=for-the-badge" alt="Türkçe ⇄ Українська · Русский">
  <a href="docs/design-review/"><img src="https://img.shields.io/badge/%D0%94%D0%B8%D0%B7%D0%B0%D0%B9%D0%BD--%D1%80%D0%B5%D0%B2%E2%80%99%D1%8E-before%20%C2%B7%20after-0E1B3D?style=for-the-badge" alt="Дизайн-рев’ю"></a>
  <br>
  <img src="https://img.shields.io/badge/HTML-CSS-2F6BFF?style=flat-square" alt="HTML CSS">
  <img src="https://img.shields.io/badge/JavaScript-vanilla-2F6BFF?style=flat-square&logo=javascript&logoColor=white" alt="Vanilla JS">
  <img src="https://img.shields.io/badge/%D0%B1%D0%B5%D0%B7%20%D0%B7%D0%B1%D1%96%D1%80%D0%BA%D0%B8-5FA2FF?style=flat-square" alt="без збірки">
  <a href="LICENSE"><img src="https://img.shields.io/badge/code-AGPL--3.0-0E1B3D?style=flat-square" alt="AGPL-3.0"></a>
  <a href="LICENSE-CONTENT.md"><img src="https://img.shields.io/badge/content-CC%20BY--NC--SA%204.0-0E1B3D?style=flat-square" alt="CC BY-NC-SA 4.0"></a>
  <img src="https://img.shields.io/github/last-commit/Anton-Babaskin/Settlingo?style=flat-square&color=7F8BA8" alt="last commit">
</p>

**Blably** — безкоштовний застосунок для вивчення мов в обидва боки: турецька для україно- та російськомовних, українська й російська для турків, згодом англійська ↔ російська. Для тих, хто живе поруч із мовою і хоче почати нею *говорити*: слова, впевненість і щоденна звичка. Десять хвилин на день, просто в браузері, без реєстрації.

> Зараз працює турецька для російськомовних. Інтерфейс перекладається українською, російською та англійською, інші курси — за планом.

<p align="center"><img src="docs/assets/screens.png" alt="Blably screens" width="830"></p>

## Що всередині

<table>
<tr><td width="50%" valign="top"><img src="docs/assets/icons/path.svg" width="44" alt=""><br><b>Два треки</b><br>Розмовний: 20 уроків готових фраз для життя. Граматика: 14 уроків про те, як побудовані турецькі слова.</td><td width="50%" valign="top"><img src="docs/assets/icons/repeat.svg" width="44" alt=""><br><b>Інтервальне повторення</b><br>Кожна вивчена фраза повертається через 1, 3, 7, 16, 35 і 90 днів. Помилка повертає її на завтра.</td></tr><tr><td width="50%" valign="top"><img src="docs/assets/icons/headphones.svg" width="44" alt=""><br><b>Аудіювання</b><br>Близько 4 000 записаних фраз і форм слів, повільне відтворення та диктант.</td><td width="50%" valign="top"><img src="docs/assets/icons/mic.svg" width="44" alt=""><br><b>Скажи вголос</b><br>Бачиш фразу російською, кажеш її турецькою і звіряєшся із записом.</td></tr><tr><td width="50%" valign="top"><img src="docs/assets/icons/grammar.svg" width="44" alt=""><br><b>Граматичний рушій</b><br>Завдання щоразу генеруються наново, кожен суфікс пояснено: гармонія голосних, чергування, часи.</td><td width="50%" valign="top"><img src="docs/assets/icons/book.svg" width="44" alt=""><br><b>403 слова</b><br>Основа, побут у Стамбулі (оренда, банк, лікар, транспорт) і жива мова.</td></tr>
</table>

## Як виглядає день

```mermaid
flowchart LR
  A["Повторити те, що час"] --> B["Новий урок"] --> C["Аудіювання"] --> D["Скажи вголос"]
  D -. "Фрази повернуться через 1–90 днів" .-> A
  style A fill:#EEF3FF,stroke:#2F6BFF,color:#0E1B3D
  style B fill:#EEF3FF,stroke:#2F6BFF,color:#0E1B3D
  style C fill:#EEF3FF,stroke:#2F6BFF,color:#0E1B3D
  style D fill:#2F6BFF,stroke:#2452E6,color:#FFFFFF
```

## Курси

| Курс | Для тих, хто говорить | Статус | Що всередині |
|---|---|---|---|
| **Турецька** | російська | <img src="https://img.shields.io/badge/%D0%BF%D1%80%D0%B0%D1%86%D1%8E%D1%94-16A061?style=flat-square" alt="працює"> | 34 уроки · 403 слова · озвучення |
| **Турецька** | українська | <img src="https://img.shields.io/badge/%D1%83%20%D0%BF%D0%BB%D0%B0%D0%BD%D0%B0%D1%85-5FA2FF?style=flat-square" alt="у планах"> | ті самі уроки з поясненнями українською |
| **Російська** | турецька | <img src="https://img.shields.io/badge/%D1%83%20%D0%BF%D0%BB%D0%B0%D0%BD%D0%B0%D1%85-5FA2FF?style=flat-square" alt="у планах"> | кирилиця, фрази на кожен день, відмінки через турецькі |
| **Українська** | турецька | <img src="https://img.shields.io/badge/%D1%83%20%D0%BF%D0%BB%D0%B0%D0%BD%D0%B0%D1%85-5FA2FF?style=flat-square" alt="у планах"> | кирилиця, фрази на кожен день, граматика через турецьку |
| **Англійська** | російська | <img src="https://img.shields.io/badge/%D0%B7%D0%B3%D0%BE%D0%B4%D0%BE%D0%BC-B7C1D6?style=flat-square" alt="згодом"> | A1–A2, робота, переїзд, подорожі |
| **Російська** | англійська | <img src="https://img.shields.io/badge/%D0%B7%D0%B3%D0%BE%D0%B4%D0%BE%D0%BC-B7C1D6?style=flat-square" alt="згодом"> | на основі курсу для турків |

## План розвитку

| Етап | Що |
|---|---|
| 1. **Фундамент** | інтерфейс українською, російською та англійською, курси в обидва боки, офлайн, тести |
| 2. **Турецька для українців** | курс турецької з поясненнями українською |
| 3. **Російська для турків** | кирилиця, фрази й граматика, турецький інтерфейс |
| 4. **Українська для турків** | те саме для української |
| 5. **Англійська ↔ російська** | останнім із курсів |
| 6. **Якість навчання** | тест рівня, перевірка вимови, діалоги |
| 7. **Синхронізація** | прогрес на всіх пристроях, мовний тандем із друзями |
| 8. **Мобільні застосунки** | App Store і Google Play |

[Детальний план →](ROADMAP.md)

## Запуск локально

Це статичний сайт без збірки. Підійде будь-який статичний сервер:

```bash
git clone https://github.com/Anton-Babaskin/Settlingo.git
cd Settlingo
python3 -m http.server 8000
# http://localhost:8000
```

Якщо відкрити `index.html` просто з диска, сторінка буде порожньою: браузер не завантажує модулі JavaScript з `file://`.

<details>
<summary><b>Структура проєкту</b></summary>

| | |
|---|---|
| `index.html` | Каркас сторінки та нижня панель |
| `app.css` | Дизайн-токени, компоненти, анімації |
| `core/` | Правила без сторінки: прогрес, повторення, турецька морфологія, заняття, перевірка відповідей |
| `ui/` | Екрани, плеєр уроків, звук, зберігання |
| `i18n/` | Тексти інтерфейсу російською, українською та англійською |
| `data.js` | Зміст курсу та словник |
| `audio/ · audio-index.js` | Аудіопакети та їхній покажчик |
| `tests/` | Тести: node --test |
| `brand/ · fonts/` | Логотип, іконки, Nunito |
| `docs/design-review/` | Аудит дизайну, було і стало |
| `tools/` | Скрипти збірки звуку та логотипа |

</details>

## Ліцензія

Код: [AGPL-3.0-or-later](LICENSE). Уроки, словник і звук: [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/), лише некомерційне використання із зазначенням джерела. Турецький голос: [Piper](https://github.com/rhasspy/piper) `tr_TR-dfki-medium`, навчений на [dfki-ot-data](https://github.com/marytts/dfki-ot-data/). Шрифт: Nunito, SIL OFL 1.1. Детально: [LICENSE-CONTENT.md](LICENSE-CONTENT.md).

<p align="center"><br><img src="brand/blably-icon.svg" width="40" alt=""><br><sub>Зроблено в Стамбулі</sub></p>
