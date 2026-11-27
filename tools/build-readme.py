"""Generate the Blably README.md (English), README.uk.md and README.ru.md from one template.

Usage: python3 tools/build-readme.py
Edit the texts in T below, never the generated README files by hand.
"""
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
from urllib.parse import quote
REPO='https://github.com/Anton-Babaskin/Settlingo'
def badge(label,msg,color,logo=None,style='for-the-badge'):
    e=lambda s: quote(s.replace('-','--').replace('_','__'),safe='')
    u=f'https://img.shields.io/badge/{e(label)}-{e(msg)}-{color}?style={style}'
    if logo: u+=f'&logo={logo}&logoColor=white'
    return u
FILES={'en':'README.md','ru':'README.ru.md','uk':'README.uk.md'}
NAMES={'en':'English','ru':'Русский','uk':'Українська'}
def switcher(cur):
    out=[]
    for l in ['en','uk','ru']:
        col='2F6BFF' if l==cur else 'E4ECFF'
        st=f'https://img.shields.io/badge/{quote(NAMES[l])}-{col}?style=for-the-badge'
        if l!=cur: st+='&labelColor=E4ECFF'
        out.append(f'<a href="{FILES[l]}"><img src="{st}" alt="{NAMES[l]}"></a>')
    return '\n  '.join(out)
T={
'en':dict(
 demo='Open the app',reviewlbl='Design review',live='live',nobuild='no build step',
 intro='**Blably** is a free app for learning languages both ways: Turkish for Russian and Ukrainian speakers, Russian and Ukrainian for Turkish speakers, and later English ↔ Russian. It is built for people who live next to a language and want to start *speaking* it: words, confidence and a daily habit. Ten minutes a day, right in the browser, without sign-up.',
 ui_note='Live now: Turkish for Russian speakers. The interface is getting Russian, Ukrainian and English versions; the other courses follow the roadmap.',
 h_feat='What’s inside',
 feats=[('path','Two tracks','Conversation: 20 lessons of ready-made phrases for real life. Grammar: 14 lessons on how Turkish words are built.'),
        ('repeat','Spaced repetition','Every learned phrase comes back after 1, 3, 7, 16, 35 and 90 days. A mistake brings it back tomorrow.'),
        ('headphones','Listening','About 4,000 recorded phrases and word forms, slow playback and dictation.'),
        ('mic','Say it aloud','You see a Russian phrase, say it in Turkish, then compare with the recording.'),
        ('grammar','Grammar engine','Exercises are generated fresh each time and every suffix is explained: vowel harmony, consonant changes, tenses.'),
        ('book','403 words','Basics, daily life in Istanbul (rent, bank, doctor, transport) and live speech.')],
 h_how='How a day looks',
 flow=['Review what is due','New lesson','Listening','Say it aloud','Phrases return in 1–90 days'],
 h_courses='Courses',
 courses=[('Turkish','Russian','live','34 lessons · 403 words · audio'),('Turkish','Ukrainian','planned','same lessons, explained in Ukrainian'),('Russian','Turkish','planned','Cyrillic, everyday phrases, cases explained through Turkish'),('Ukrainian','Turkish','planned','Cyrillic, everyday phrases, grammar through Turkish'),('English','Russian','later','A1–A2, work, moving and travel'),('Russian','English','later','built on the course for Turkish speakers')],
 c_head=('Course','For speakers of','Status','Contents'),
 h_run='Run locally',run_note='It is a static site with no build step. Any static server will do:',run_warn='Opening `index.html` directly from disk will not play audio: browsers block it on `file://`.',
 h_struct='Project structure',
 struct=[('index.html','Page shell and tab bar'),('app.css','Design tokens, components, animations'),('app.js','State, spaced repetition, lesson player, screens'),('data.js','Course content and vocabulary'),('morph.js','Turkish morphology and exercise generator'),('audio.js · audio/','Audio packs and playback'),('brand/ · fonts/','Logo, icons, Nunito'),('docs/design-review/','Design audit, before and after'),('tools/','Scripts that build the audio and the logo')],
 h_road='Roadmap',road_more='Full plan with details',
 road=[('Foundation','interface in Russian, Ukrainian and English, two-way course packs, offline mode, tests'),('Turkish for Ukrainians','the Turkish course explained in Ukrainian'),('Russian for Turks','Cyrillic, phrases and grammar, Turkish interface'),('Ukrainian for Turks','the same for Ukrainian'),('English ↔ Russian','last of the courses'),('Better learning','placement test, pronunciation check, dialogues'),('Sync and sharing','progress on all devices, language tandem with friends'),('Mobile apps','App Store and Google Play')],
 r_head=('Stage','What'),
 h_credits='License',
 credits='Code: [AGPL-3.0-or-later](LICENSE). Lessons, vocabulary and audio: [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/), non-commercial use with attribution. Turkish voice: [Piper](https://github.com/rhasspy/piper) `tr_TR-dfki-medium`, trained on [dfki-ot-data](https://github.com/marytts/dfki-ot-data/). Font: Nunito, SIL OFL 1.1. Details: [LICENSE-CONTENT.md](LICENSE-CONTENT.md).',
 footer='Made in Istanbul'),
'ru':dict(
 demo='Открыть приложение',reviewlbl='Дизайн-ревью',live='работает',nobuild='без сборки',
 intro='**Blably** — бесплатное приложение для изучения языков в обе стороны: турецкий для русско- и украиноязычных, русский и украинский для турков, позже английский ↔ русский. Для тех, кто живёт рядом с языком и хочет начать на нём *говорить*: слова, уверенность и ежедневная привычка. Десять минут в день, прямо в браузере, без регистрации.',
 ui_note='Сейчас работает турецкий для русскоязычных. Интерфейс переводится на русский, украинский и английский, остальные курсы — по плану.',
 h_feat='Что внутри',
 feats=[('path','Два трека','Разговорный: 20 уроков готовых фраз для жизни. Грамматика: 14 уроков о том, как устроены турецкие слова.'),
        ('repeat','Повторение по интервалам','Каждая выученная фраза возвращается через 1, 3, 7, 16, 35 и 90 дней. Ошибка возвращает её на завтра.'),
        ('headphones','Аудирование','Около 4 000 записанных фраз и форм слов, медленное воспроизведение и диктант.'),
        ('mic','Скажи вслух','Видишь русскую фразу, говоришь её по-турецки и сверяешься с записью.'),
        ('grammar','Грамматический движок','Задания собираются заново каждый раз, каждый суффикс объяснён: гармония гласных, чередования, времена.'),
        ('book','403 слова','Основа, быт в Стамбуле (аренда, банк, врач, транспорт) и живая речь.')],
 h_how='Как выглядит день',
 flow=['Повторить то, что пора','Новый урок','Аудирование','Скажи вслух','Фразы вернутся через 1–90 дней'],
 h_courses='Курсы',
 courses=[('Турецкий','русский','работает','34 урока · 403 слова · озвучка'),('Турецкий','украинский','в планах','те же уроки с объяснениями на украинском'),('Русский','турецкий','в планах','кириллица, фразы на каждый день, падежи через турецкие'),('Украинский','турецкий','в планах','кириллица, фразы на каждый день, грамматика через турецкий'),('Английский','русский','позже','A1–A2, работа, переезд, путешествия'),('Русский','английский','позже','на основе курса для турков')],
 c_head=('Курс','Для тех, кто говорит на','Статус','Что внутри'),
 h_run='Запуск у себя',run_note='Это статический сайт без сборки. Подойдёт любой статический сервер:',run_warn='Если открыть `index.html` прямо с диска, звук не заиграет: браузер блокирует его на `file://`.',
 h_struct='Структура проекта',
 struct=[('index.html','Каркас страницы и нижняя панель'),('app.css','Дизайн-токены, компоненты, анимации'),('app.js','Состояние, повторение по интервалам, плеер уроков, экраны'),('data.js','Содержание курса и словарь'),('morph.js','Турецкая морфология и генератор заданий'),('audio.js · audio/','Аудио-пакеты и воспроизведение'),('brand/ · fonts/','Логотип, иконки, Nunito'),('docs/design-review/','Аудит дизайна, было и стало'),('tools/','Скрипты сборки звука и логотипа')],
 h_road='План развития',road_more='Подробный план',
 road=[('Фундамент','интерфейс на русском, украинском и английском, курсы в обе стороны, офлайн, тесты'),('Турецкий для украинцев','курс турецкого с объяснениями на украинском'),('Русский для турков','кириллица, фразы и грамматика, турецкий интерфейс'),('Украинский для турков','то же для украинского'),('Английский ↔ русский','последним из курсов'),('Качество обучения','тест уровня, проверка произношения, диалоги'),('Синхронизация','прогресс на всех устройствах, языковой тандем с друзьями'),('Мобильные приложения','App Store и Google Play')],
 r_head=('Этап','Что'),
 h_credits='Лицензия',
 credits='Код: [AGPL-3.0-or-later](LICENSE). Уроки, словарь и звук: [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/), только некоммерческое использование с указанием источника. Турецкий голос: [Piper](https://github.com/rhasspy/piper) `tr_TR-dfki-medium`, обучен на [dfki-ot-data](https://github.com/marytts/dfki-ot-data/). Шрифт: Nunito, SIL OFL 1.1. Подробно: [LICENSE-CONTENT.md](LICENSE-CONTENT.md).',
 footer='Сделано в Стамбуле'),
'uk':dict(
 demo='Відкрити застосунок',reviewlbl='Дизайн-рев’ю',live='працює',nobuild='без збірки',
 intro='**Blably** — безкоштовний застосунок для вивчення мов в обидва боки: турецька для україно- та російськомовних, українська й російська для турків, згодом англійська ↔ російська. Для тих, хто живе поруч із мовою і хоче почати нею *говорити*: слова, впевненість і щоденна звичка. Десять хвилин на день, просто в браузері, без реєстрації.',
 ui_note='Зараз працює турецька для російськомовних. Інтерфейс перекладається українською, російською та англійською, інші курси — за планом.',
 h_feat='Що всередині',
 feats=[('path','Два треки','Розмовний: 20 уроків готових фраз для життя. Граматика: 14 уроків про те, як побудовані турецькі слова.'),
        ('repeat','Інтервальне повторення','Кожна вивчена фраза повертається через 1, 3, 7, 16, 35 і 90 днів. Помилка повертає її на завтра.'),
        ('headphones','Аудіювання','Близько 4 000 записаних фраз і форм слів, повільне відтворення та диктант.'),
        ('mic','Скажи вголос','Бачиш фразу російською, кажеш її турецькою і звіряєшся із записом.'),
        ('grammar','Граматичний рушій','Завдання щоразу генеруються наново, кожен суфікс пояснено: гармонія голосних, чергування, часи.'),
        ('book','403 слова','Основа, побут у Стамбулі (оренда, банк, лікар, транспорт) і жива мова.')],
 h_how='Як виглядає день',
 flow=['Повторити те, що час','Новий урок','Аудіювання','Скажи вголос','Фрази повернуться через 1–90 днів'],
 h_courses='Курси',
 courses=[('Турецька','російська','працює','34 уроки · 403 слова · озвучення'),('Турецька','українська','у планах','ті самі уроки з поясненнями українською'),('Російська','турецька','у планах','кирилиця, фрази на кожен день, відмінки через турецькі'),('Українська','турецька','у планах','кирилиця, фрази на кожен день, граматика через турецьку'),('Англійська','російська','згодом','A1–A2, робота, переїзд, подорожі'),('Російська','англійська','згодом','на основі курсу для турків')],
 c_head=('Курс','Для тих, хто говорить','Статус','Що всередині'),
 h_run='Запуск локально',run_note='Це статичний сайт без збірки. Підійде будь-який статичний сервер:',run_warn='Якщо відкрити `index.html` просто з диска, звук не запрацює: браузер блокує його на `file://`.',
 h_struct='Структура проєкту',
 struct=[('index.html','Каркас сторінки та нижня панель'),('app.css','Дизайн-токени, компоненти, анімації'),('app.js','Стан, інтервальне повторення, плеєр уроків, екрани'),('data.js','Зміст курсу та словник'),('morph.js','Турецька морфологія та генератор завдань'),('audio.js · audio/','Аудіопакети та відтворення'),('brand/ · fonts/','Логотип, іконки, Nunito'),('docs/design-review/','Аудит дизайну, було і стало'),('tools/','Скрипти збірки звуку та логотипа')],
 h_road='План розвитку',road_more='Детальний план',
 road=[('Фундамент','інтерфейс українською, російською та англійською, курси в обидва боки, офлайн, тести'),('Турецька для українців','курс турецької з поясненнями українською'),('Російська для турків','кирилиця, фрази й граматика, турецький інтерфейс'),('Українська для турків','те саме для української'),('Англійська ↔ російська','останнім із курсів'),('Якість навчання','тест рівня, перевірка вимови, діалоги'),('Синхронізація','прогрес на всіх пристроях, мовний тандем із друзями'),('Мобільні застосунки','App Store і Google Play')],
 r_head=('Етап','Що'),
 h_credits='Ліцензія',
 credits='Код: [AGPL-3.0-or-later](LICENSE). Уроки, словник і звук: [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/), лише некомерційне використання із зазначенням джерела. Турецький голос: [Piper](https://github.com/rhasspy/piper) `tr_TR-dfki-medium`, навчений на [dfki-ot-data](https://github.com/marytts/dfki-ot-data/). Шрифт: Nunito, SIL OFL 1.1. Детально: [LICENSE-CONTENT.md](LICENSE-CONTENT.md).',
 footer='Зроблено в Стамбулі'),
}
for l,t in T.items():
    feats=''.join(
        ('<tr>' if i%2==0 else '')+f'<td width="50%" valign="top"><img src="docs/assets/icons/{ic}.svg" width="44" alt=""><br><b>{h}</b><br>{d}</td>'+('</tr>' if i%2 else '')
        for i,(ic,h,d) in enumerate(t['feats']))
    f=t['flow']
    mer=f'''```mermaid
flowchart LR
  A["{f[0]}"] --> B["{f[1]}"] --> C["{f[2]}"] --> D["{f[3]}"]
  D -. "{f[4]}" .-> A
  style A fill:#EEF3FF,stroke:#2F6BFF,color:#0E1B3D
  style B fill:#EEF3FF,stroke:#2F6BFF,color:#0E1B3D
  style C fill:#EEF3FF,stroke:#2F6BFF,color:#0E1B3D
  style D fill:#2F6BFF,stroke:#2452E6,color:#FFFFFF
```'''
    st={'live':'2F6BFF','planned':'7F8BA8'}
    courses='\n'.join(f'| **{c}** | {s} | ![]({badge(stat,"", "16A061" if i==0 else "B7C1D6",style="flat-square").replace("--?","?")}) | {d} |' for i,(c,s,stat,d) in enumerate(t['courses']))
    # simpler status badge: label only
    courses='\n'.join(f'| **{c}** | {s} | <img src="https://img.shields.io/badge/{quote(stat)}-{'16A061' if i==0 else ('5FA2FF' if i<4 else 'B7C1D6')}?style=flat-square" alt="{stat}"> | {d} |' for i,(c,s,stat,d) in enumerate(t['courses']))
    struct='\n'.join(f'| `{a}` | {b} |' for a,b in t['struct'])
    road='\n'.join(f'| {i+1}. **{a}** | {b} |' for i,(a,b) in enumerate(t['road']))
    md=f'''<p align="center">
  <img src="docs/assets/banner-{l}.png" alt="Blably" width="830">
</p>

<p align="center">
  {switcher(l)}
</p>

<p align="center">
  <img src="https://img.shields.io/badge/{quote("Türkçe ⇄ Українська · Русский")}-2F6BFF?style=for-the-badge" alt="Türkçe ⇄ Українська · Русский">
  <a href="docs/design-review/"><img src="{badge(t['reviewlbl'],'before · after','0E1B3D')}" alt="{t['reviewlbl']}"></a>
  <br>
  <img src="https://img.shields.io/badge/HTML-CSS-2F6BFF?style=flat-square" alt="HTML CSS">
  <img src="https://img.shields.io/badge/JavaScript-vanilla-2F6BFF?style=flat-square&logo=javascript&logoColor=white" alt="Vanilla JS">
  <img src="https://img.shields.io/badge/{quote(t['nobuild'])}-5FA2FF?style=flat-square" alt="{t['nobuild']}">
  <a href="LICENSE"><img src="https://img.shields.io/badge/code-AGPL--3.0-0E1B3D?style=flat-square" alt="AGPL-3.0"></a>
  <a href="LICENSE-CONTENT.md"><img src="https://img.shields.io/badge/content-CC%20BY--NC--SA%204.0-0E1B3D?style=flat-square" alt="CC BY-NC-SA 4.0"></a>
  <img src="https://img.shields.io/github/last-commit/Anton-Babaskin/Settlingo?style=flat-square&color=7F8BA8" alt="last commit">
</p>

{t['intro']}

> {t['ui_note']}

<p align="center"><img src="docs/assets/screens.png" alt="Blably screens" width="830"></p>

## {t['h_feat']}

<table>
{feats}
</table>

## {t['h_how']}

{mer}

## {t['h_courses']}

| {' | '.join(t['c_head'])} |
|---|---|---|---|
{courses}

## {t['h_road']}

| {' | '.join(t['r_head'])} |
|---|---|
{road}

[{t['road_more']} →](ROADMAP.md)

## {t['h_run']}

{t['run_note']}

```bash
git clone https://github.com/Anton-Babaskin/Settlingo.git
cd Settlingo
python3 -m http.server 8000
# http://localhost:8000
```

{t['run_warn']}

<details>
<summary><b>{t['h_struct']}</b></summary>

| | |
|---|---|
{struct}

</details>

## {t['h_credits']}

{t['credits']}

<p align="center"><br><img src="brand/blably-icon.svg" width="40" alt=""><br><sub>{t['footer']}</sub></p>
'''
    (ROOT / FILES[l]).write_text(md, encoding='utf8')
print('ok')
