<p align="center">
  <img src="docs/assets/banner-ru.png" alt="Blably" width="830">
</p>

<p align="center">
  <a href="README.md"><img src="https://img.shields.io/badge/English-E4ECFF?style=for-the-badge&labelColor=E4ECFF" alt="English"></a>
  <a href="README.uk.md"><img src="https://img.shields.io/badge/%D0%A3%D0%BA%D1%80%D0%B0%D1%97%D0%BD%D1%81%D1%8C%D0%BA%D0%B0-E4ECFF?style=for-the-badge&labelColor=E4ECFF" alt="Українська"></a>
  <a href="README.ru.md"><img src="https://img.shields.io/badge/%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9-2F6BFF?style=for-the-badge" alt="Русский"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/T%C3%BCrk%C3%A7e%20%E2%87%84%20%D0%A3%D0%BA%D1%80%D0%B0%D1%97%D0%BD%D1%81%D1%8C%D0%BA%D0%B0%20%C2%B7%20%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9-2F6BFF?style=for-the-badge" alt="Türkçe ⇄ Українська · Русский">
  <a href="docs/design-review/"><img src="https://img.shields.io/badge/%D0%94%D0%B8%D0%B7%D0%B0%D0%B9%D0%BD--%D1%80%D0%B5%D0%B2%D1%8C%D1%8E-before%20%C2%B7%20after-0E1B3D?style=for-the-badge" alt="Дизайн-ревью"></a>
  <br>
  <img src="https://img.shields.io/badge/HTML-CSS-2F6BFF?style=flat-square" alt="HTML CSS">
  <img src="https://img.shields.io/badge/JavaScript-vanilla-2F6BFF?style=flat-square&logo=javascript&logoColor=white" alt="Vanilla JS">
  <img src="https://img.shields.io/badge/%D0%B1%D0%B5%D0%B7%20%D1%81%D0%B1%D0%BE%D1%80%D0%BA%D0%B8-5FA2FF?style=flat-square" alt="без сборки">
  <a href="LICENSE"><img src="https://img.shields.io/badge/code-AGPL--3.0-0E1B3D?style=flat-square" alt="AGPL-3.0"></a>
  <a href="LICENSE-CONTENT.md"><img src="https://img.shields.io/badge/content-CC%20BY--NC--SA%204.0-0E1B3D?style=flat-square" alt="CC BY-NC-SA 4.0"></a>
  <img src="https://img.shields.io/github/last-commit/Anton-Babaskin/Settlingo?style=flat-square&color=7F8BA8" alt="last commit">
</p>

**Blably** — бесплатное приложение для изучения языков в обе стороны: турецкий для русско- и украиноязычных, русский и украинский для турков, позже английский ↔ русский. Для тех, кто живёт рядом с языком и хочет начать на нём *говорить*: слова, уверенность и ежедневная привычка. Десять минут в день, прямо в браузере, без регистрации.

> Сейчас работает турецкий для русскоязычных. Интерфейс переводится на русский, украинский и английский, остальные курсы — по плану.

<p align="center"><img src="docs/assets/screens.png" alt="Blably screens" width="830"></p>

## Что внутри

<table>
<tr><td width="50%" valign="top"><img src="docs/assets/icons/path.svg" width="44" alt=""><br><b>Два трека</b><br>Разговорный: 20 уроков готовых фраз для жизни. Грамматика: 14 уроков о том, как устроены турецкие слова.</td><td width="50%" valign="top"><img src="docs/assets/icons/repeat.svg" width="44" alt=""><br><b>Повторение по интервалам</b><br>Каждая выученная фраза возвращается через 1, 3, 7, 16, 35 и 90 дней. Ошибка возвращает её на завтра.</td></tr><tr><td width="50%" valign="top"><img src="docs/assets/icons/headphones.svg" width="44" alt=""><br><b>Аудирование</b><br>Около 4 000 записанных фраз и форм слов, медленное воспроизведение и диктант.</td><td width="50%" valign="top"><img src="docs/assets/icons/mic.svg" width="44" alt=""><br><b>Скажи вслух</b><br>Видишь русскую фразу, говоришь её по-турецки и сверяешься с записью.</td></tr><tr><td width="50%" valign="top"><img src="docs/assets/icons/grammar.svg" width="44" alt=""><br><b>Грамматический движок</b><br>Задания собираются заново каждый раз, каждый суффикс объяснён: гармония гласных, чередования, времена.</td><td width="50%" valign="top"><img src="docs/assets/icons/book.svg" width="44" alt=""><br><b>403 слова</b><br>Основа, быт в Стамбуле (аренда, банк, врач, транспорт) и живая речь.</td></tr>
</table>

## Как выглядит день

```mermaid
flowchart LR
  A["Повторить то, что пора"] --> B["Новый урок"] --> C["Аудирование"] --> D["Скажи вслух"]
  D -. "Фразы вернутся через 1–90 дней" .-> A
  style A fill:#EEF3FF,stroke:#2F6BFF,color:#0E1B3D
  style B fill:#EEF3FF,stroke:#2F6BFF,color:#0E1B3D
  style C fill:#EEF3FF,stroke:#2F6BFF,color:#0E1B3D
  style D fill:#2F6BFF,stroke:#2452E6,color:#FFFFFF
```

## Курсы

| Курс | Для тех, кто говорит на | Статус | Что внутри |
|---|---|---|---|
| **Турецкий** | русский | <img src="https://img.shields.io/badge/%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D0%B0%D0%B5%D1%82-16A061?style=flat-square" alt="работает"> | 34 урока · 403 слова · озвучка |
| **Турецкий** | украинский | <img src="https://img.shields.io/badge/%D0%B2%20%D0%BF%D0%BB%D0%B0%D0%BD%D0%B0%D1%85-5FA2FF?style=flat-square" alt="в планах"> | те же уроки с объяснениями на украинском |
| **Русский** | турецкий | <img src="https://img.shields.io/badge/%D0%B2%20%D0%BF%D0%BB%D0%B0%D0%BD%D0%B0%D1%85-5FA2FF?style=flat-square" alt="в планах"> | кириллица, фразы на каждый день, падежи через турецкие |
| **Украинский** | турецкий | <img src="https://img.shields.io/badge/%D0%B2%20%D0%BF%D0%BB%D0%B0%D0%BD%D0%B0%D1%85-5FA2FF?style=flat-square" alt="в планах"> | кириллица, фразы на каждый день, грамматика через турецкий |
| **Английский** | русский | <img src="https://img.shields.io/badge/%D0%BF%D0%BE%D0%B7%D0%B6%D0%B5-B7C1D6?style=flat-square" alt="позже"> | A1–A2, работа, переезд, путешествия |
| **Русский** | английский | <img src="https://img.shields.io/badge/%D0%BF%D0%BE%D0%B7%D0%B6%D0%B5-B7C1D6?style=flat-square" alt="позже"> | на основе курса для турков |

## План развития

| Этап | Что |
|---|---|
| 1. **Фундамент** | интерфейс на русском, украинском и английском, курсы в обе стороны, офлайн, тесты |
| 2. **Турецкий для украинцев** | курс турецкого с объяснениями на украинском |
| 3. **Русский для турков** | кириллица, фразы и грамматика, турецкий интерфейс |
| 4. **Украинский для турков** | то же для украинского |
| 5. **Английский ↔ русский** | последним из курсов |
| 6. **Качество обучения** | тест уровня, проверка произношения, диалоги |
| 7. **Синхронизация** | прогресс на всех устройствах, языковой тандем с друзьями |
| 8. **Мобильные приложения** | App Store и Google Play |

[Подробный план →](ROADMAP.md)

## Запуск у себя

Это статический сайт без сборки. Подойдёт любой статический сервер:

```bash
git clone https://github.com/Anton-Babaskin/Settlingo.git
cd Settlingo
python3 -m http.server 8000
# http://localhost:8000
```

Если открыть `index.html` прямо с диска, страница будет пустой: браузер не загружает модули JavaScript с `file://`.

<details>
<summary><b>Структура проекта</b></summary>

| | |
|---|---|
| `index.html` | Каркас страницы и нижняя панель |
| `app.css` | Дизайн-токены, компоненты, анимации |
| `core/` | Правила без страницы: прогресс, повторение, турецкая морфология, занятия, проверка ответов |
| `ui/` | Экраны, плеер уроков, звук, хранение |
| `i18n/` | Тексты интерфейса на русском, украинском и английском |
| `data.js` | Содержание курса и словарь |
| `audio/ · audio-index.js` | Аудио-пакеты и их указатель |
| `tests/` | Тесты: node --test |
| `brand/ · fonts/` | Логотип, иконки, Nunito |
| `docs/design-review/` | Аудит дизайна, было и стало |
| `tools/` | Скрипты сборки звука и логотипа |

</details>

## Лицензия

Код: [AGPL-3.0-or-later](LICENSE). Уроки, словарь и звук: [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/), только некоммерческое использование с указанием источника. Турецкий голос: [Piper](https://github.com/rhasspy/piper) `tr_TR-dfki-medium`, обучен на [dfki-ot-data](https://github.com/marytts/dfki-ot-data/). Шрифт: Nunito, SIL OFL 1.1. Подробно: [LICENSE-CONTENT.md](LICENSE-CONTENT.md).

<p align="center"><br><img src="brand/blably-icon.svg" width="40" alt=""><br><sub>Сделано в Стамбуле</sub></p>
