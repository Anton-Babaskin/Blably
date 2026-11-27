<p align="center">
  <img src="docs/assets/banner-en.png" alt="Blably" width="830">
</p>

<p align="center">
  <a href="README.md"><img src="https://img.shields.io/badge/English-2F6BFF?style=for-the-badge" alt="English"></a>
  <a href="README.uk.md"><img src="https://img.shields.io/badge/%D0%A3%D0%BA%D1%80%D0%B0%D1%97%D0%BD%D1%81%D1%8C%D0%BA%D0%B0-E4ECFF?style=for-the-badge&labelColor=E4ECFF" alt="Українська"></a>
  <a href="README.ru.md"><img src="https://img.shields.io/badge/%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9-E4ECFF?style=for-the-badge&labelColor=E4ECFF" alt="Русский"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/T%C3%BCrk%C3%A7e%20%E2%87%84%20%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9-2F6BFF?style=for-the-badge" alt="Türkçe ⇄ Русский">
  <a href="docs/design-review/"><img src="https://img.shields.io/badge/Design%20review-before%20%C2%B7%20after-0E1B3D?style=for-the-badge" alt="Design review"></a>
  <br>
  <img src="https://img.shields.io/badge/HTML-CSS-2F6BFF?style=flat-square" alt="HTML CSS">
  <img src="https://img.shields.io/badge/JavaScript-vanilla-2F6BFF?style=flat-square&logo=javascript&logoColor=white" alt="Vanilla JS">
  <img src="https://img.shields.io/badge/no%20build%20step-5FA2FF?style=flat-square" alt="no build step">
  <a href="LICENSE"><img src="https://img.shields.io/badge/code-AGPL--3.0-0E1B3D?style=flat-square" alt="AGPL-3.0"></a>
  <a href="LICENSE-CONTENT.md"><img src="https://img.shields.io/badge/content-CC%20BY--NC--SA%204.0-0E1B3D?style=flat-square" alt="CC BY-NC-SA 4.0"></a>
  <img src="https://img.shields.io/github/last-commit/Anton-Babaskin/Settlingo?style=flat-square&color=7F8BA8" alt="last commit">
</p>

**Blably** is a free app for learning languages both ways: **Turkish for Russian speakers** and **Russian for Turkish speakers**. It is built for people who live next to the language and want to start *speaking* it: words, confidence and a daily habit. Ten minutes a day, right in the browser, without sign-up.

> Live now: Turkish for Russian speakers, interface in Russian. Russian for Turkish speakers, an English course and interfaces in Ukrainian, English and Turkish are on the roadmap.

<p align="center"><img src="docs/assets/screens.png" alt="Blably screens" width="830"></p>

## What’s inside

<table>
<tr><td width="50%" valign="top"><img src="docs/assets/icons/path.svg" width="44" alt=""><br><b>Two tracks</b><br>Conversation: 20 lessons of ready-made phrases for real life. Grammar: 14 lessons on how Turkish words are built.</td><td width="50%" valign="top"><img src="docs/assets/icons/repeat.svg" width="44" alt=""><br><b>Spaced repetition</b><br>Every learned phrase comes back after 1, 3, 7, 16, 35 and 90 days. A mistake brings it back tomorrow.</td></tr><tr><td width="50%" valign="top"><img src="docs/assets/icons/headphones.svg" width="44" alt=""><br><b>Listening</b><br>About 4,000 recorded phrases and word forms, slow playback and dictation.</td><td width="50%" valign="top"><img src="docs/assets/icons/mic.svg" width="44" alt=""><br><b>Say it aloud</b><br>You see a Russian phrase, say it in Turkish, then compare with the recording.</td></tr><tr><td width="50%" valign="top"><img src="docs/assets/icons/grammar.svg" width="44" alt=""><br><b>Grammar engine</b><br>Exercises are generated fresh each time and every suffix is explained: vowel harmony, consonant changes, tenses.</td><td width="50%" valign="top"><img src="docs/assets/icons/book.svg" width="44" alt=""><br><b>403 words</b><br>Basics, daily life in Istanbul (rent, bank, doctor, transport) and live speech.</td></tr>
</table>

## How a day looks

```mermaid
flowchart LR
  A["Review what is due"] --> B["New lesson"] --> C["Listening"] --> D["Say it aloud"]
  D -. "Phrases return in 1–90 days" .-> A
  style A fill:#EEF3FF,stroke:#2F6BFF,color:#0E1B3D
  style B fill:#EEF3FF,stroke:#2F6BFF,color:#0E1B3D
  style C fill:#EEF3FF,stroke:#2F6BFF,color:#0E1B3D
  style D fill:#2F6BFF,stroke:#2452E6,color:#FFFFFF
```

## Courses

| Course | For speakers of | Status | Contents |
|---|---|---|---|
| **Turkish** | Russian | <img src="https://img.shields.io/badge/live-16A061?style=flat-square" alt="live"> | 34 lessons · 403 words · audio |
| **Russian** | Turkish | <img src="https://img.shields.io/badge/planned-B7C1D6?style=flat-square" alt="planned"> | Cyrillic, everyday phrases, cases explained through Turkish |
| **English** | Russian, Ukrainian | <img src="https://img.shields.io/badge/planned-B7C1D6?style=flat-square" alt="planned"> | A1–A2, work, moving and travel |

## Roadmap

| Stage | What |
|---|---|
| 1. **Foundation** | offline mode, interface in 4 languages, tests, two-way course packs |
| 2. **English course** | English for Russian and Ukrainian speakers |
| 3. **Russian for Turks** | Cyrillic, phrases and grammar with a Turkish interface |
| 4. **Better learning** | placement test, pronunciation check, dialogues |
| 5. **Sync and sharing** | progress on all devices, share with friends |
| 6. **Mobile apps** | App Store and Google Play |

[Full plan with details →](ROADMAP.md)

## Run locally

It is a static site with no build step. Any static server will do:

```bash
git clone https://github.com/Anton-Babaskin/Settlingo.git
cd Settlingo
python3 -m http.server 8000
# http://localhost:8000
```

Opening `index.html` directly from disk will not play audio: browsers block it on `file://`.

<details>
<summary><b>Project structure</b></summary>

| | |
|---|---|
| `index.html` | Page shell and tab bar |
| `app.css` | Design tokens, components, animations |
| `app.js` | State, spaced repetition, lesson player, screens |
| `data.js` | Course content and vocabulary |
| `morph.js` | Turkish morphology and exercise generator |
| `audio.js · audio/` | Audio packs and playback |
| `brand/ · fonts/` | Logo, icons, Nunito |
| `docs/design-review/` | Design audit, before and after |
| `tools/` | Scripts that build the audio and the logo |

</details>

## License

Code: [AGPL-3.0-or-later](LICENSE). Lessons, vocabulary and audio: [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/), non-commercial use with attribution. Turkish voice: [Piper](https://github.com/rhasspy/piper) `tr_TR-dfki-medium`, trained on [dfki-ot-data](https://github.com/marytts/dfki-ot-data/). Font: Nunito, SIL OFL 1.1. Details: [LICENSE-CONTENT.md](LICENSE-CONTENT.md).

<p align="center"><br><img src="brand/blably-icon.svg" width="40" alt=""><br><sub>Made in Istanbul</sub></p>
