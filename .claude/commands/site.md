# /site — скилл работы с сайтом Артефакт

Контекст и правила для работы над сайтом. Читать перед любой задачей по сайту.

## Архитектура синка

index.html → localStorage → admin.html → GitHub Pages

- **index.html** пишет SITE_DATA в localStorage при каждой загрузке
- **admin.html** читает из localStorage, редактирует, публикует на GitHub
- Открыть/обновить index.html = синк с admin автоматически

## Приоритет источников правды

1. `index.html` на диске — единственный источник правды для кода и данных
2. localStorage — рабочая копия для admin
3. GitHub — публичная версия (не трогать без публикации)

## Правила редактирования

- Все данные между маркерами `/* __SITE_DATA_START__ */` и `/* __SITE_DATA_END__ */`
- После маркера END: `localStorage.setItem('artefact-site', JSON.stringify(SITE_DATA))` — не удалять!
- CSS media overrides для мобилки — ставить ПОСЛЕ базовых правил, иначе не работают
- `parseSiteData` использует `new Function()`, не `JSON.parse` (SITE_DATA — JS не JSON)

## Когда использовать сабагентов

| Задача | Агент |
|--------|-------|
| Аудит admin↔index синка | `general-purpose` — читает оба файла |
| Массовая конвертация фото (>5 файлов) | `general-purpose` — запускает sips |
| Проверка безопасности | `general-purpose` — обходит весь JS |
| Рефакторинг большого блока CSS | `general-purpose` — изолированный контекст |
| Поиск по кодовой базе | `Explore` — быстрый поиск |

Для простых правок CSS/текста сабагенты не нужны — делать напрямую.

## Фото

- Формат: JPEG, макс 1600px по длинной стороне, quality 75
- Конвертация PNG/HEIC: `sips -s format jpeg -s formatOptions 75 -Z 1600 file.png --out dir/name.jpg`
- Путь экспонатов: `photos/название-папки/1-cover.jpg`, `2.jpg`, `3.jpg`…
- Путь фото авторов: `photos/hudozhniki/имя-фамилия.jpg` (латиница, строчные, дефис)
- aspect-ratio везде: `4/3` (галерея, слайдер экспоната, портрет автора)
- Папки: латинский транслит, строчные, дефис вместо пробела

## Публикация

Только через кнопку «↑ Опубликовать» в admin.html.
Фото публикуются отдельно через git push (admin умеет пушить только index.html).

## CSS-переменные и базовая сетка

```
--black: #000; --white: #fff; --border: rgba(0,0,0,0.1);
--edge: 48px (24px на ≤960px, 16px на ≤540px);
--nav-h: 76px;
```

| Страница | Layout | Колонок | gap |
|---|---|---|---|
| Галерея (главная) | полная ширина | 4 | column 24px / row 44px |
| Авторы (список) | 1 колонка | — | — |
| Работы автора | 4 колонки | 4 | column 24px / row 44px |
| Экспонат | 1fr 1fr (фото+текст) | 2 | — |
| Автор (страница) | 1fr 1fr (фото+контент) | 2 | — |
| О музее | 1fr 1fr | 2 | — |

## Типографика

- Заголовки страниц (au-name, al-name, ab-name): `clamp(52px, 9vw, 114px)` / weight 900 / line-height .88
- Заголовок раздела работ (au-col-title): `clamp(18px, 2vw, 30px)` / weight 700 — совпадает с `.al-row-name`
- Лиды (gallery-intro-lead, al-lead, au-quote, ab-lead): `clamp(20px, 2.3vw, 32px)` / weight 700
- Тело (artifact-desc, au-bio, ab-manifest p): `1.05rem` / weight 300 / line-height 1.82 / color rgba(0,0,0,.68)
- Экспликация ключи: `0.68rem` / uppercase / opacity .38
- Экспликация значения (au-expl-val): `16px` / weight 400

## Экспликация (au-expl)

- Грид `repeat(4, 1fr)`, border-top/bottom: 1px solid var(--border)
- Экспонат: Автор | Год | Статус | Материал
- Автор (страница): Техника | Город | Работ | В музее с
- «Работ» — кликабельная кнопка `.expl-anchor-btn`, скроллит к `#author-collection`
- «Автор» в экспоненте — `.meta-author-link` с hover background #efefef

**Паттерн inline hover-кнопки (обязательно!):**
```css
.btn {
  padding: 3px 7px;
  margin: -3px 0 -3px -7px; /* ВСЕГДА компенсировать padding чтобы не сдвигать baseline */
  border-radius: 7px;
  transition: background 0.15s;
}
.btn:hover { background: #efefef; }
```

## Навигация

`navigate(view, id)` — переключает представления:
- `view-main` — галерея + hero
- `view-about` — о музее
- `view-artifact` — экспонат
- `view-authors` — список авторов
- `view-author` — страница автора
- `view-map` — общая карта (MapLibre)

`navigateToGallery()` — якорный скролл к списку экспонатов (минуя hero).
`navigateToMapArtifact(id)` — navigate('map') + setTimeout(() => zoomTo(id), 150ms).

## Страница экспоната (art-page)

- `.art-page { padding: 0 var(--edge) }` — обёртка, даёт горизонтальные отступы
- Внутри: `.au-crumb` → `.au-name-row` → `#art-expl` → `.artifact-body` → `.artifact-next`
- `.artifact-body`: `grid-template-columns: 1fr 1fr`, `padding-top: 52px`
- Фото-колонка: `aspect-ratio: 4/3`, `border-radius: 16px`, без sticky
- Контент-колонка: `artifact-desc` + `artifact-addr` (кнопка-ссылка на карту)
- `artifact-next` — внутри `.art-page`, `padding: clamp(28px,4vw,52px) 0`, border-top
- Footer border через `::before` с `left/right: var(--edge)` — не border-top напрямую

## Страница автора (au-page)

- Имя рендерится через `nameEl.textContent = a.name` — естественный перенос, без `au-ln`
- `au-ln { display: block }` используется только для О музее (hardcoded HTML)
- `#author-collection` — id на блоке работ для якорного скролла
- `.au-collection { padding-top: clamp(8px,1vw,16px) }` — минимальный отступ сверху

## Hero-анимация

JS-параллакс управляет `.hero-layer` через `style.transform`. CSS-анимация — только на inner-SVG, не на `.hero-layer`. На мобайле (≤768px): hero скрыт.

## MapLibre

- Координаты: `[lng, lat]` (не путать с Leaflet `[lat, lng]`)
- `flyTo` с `padding: { top: 40, bottom: 360, left: 40, right: 40 }` чтобы popup не уходил за экран
- Язык подписей переключать в обработчике события `load`

## Подзаголовки (лиды) — без точки в конце

Точки убраны из лидов на главной и на странице авторов. На О музее точка остаётся (там ниже продолжение).

## Частые баги

- Hero высота не меняется на мобиле → проверить что override стоит ПОСЛЕ `height: 100vh`
- Admin показывает старые данные → открыть/обновить index.html в браузере
- `::before` dot исчезает → не переопределять `display` у `.card-status`, только `margin`
- MapLibre popup уходит за экран → `flyTo` с `padding: { bottom: 360 }`
- @media override не работает → базовое правило не должно стоять ПОСЛЕ @media блока
- Inline-кнопка смещает текст → добавить `margin: -topPad 0 -botPad -leftPad`

## Протокол после каждого блока работы — ОБЯЗАТЕЛЬНО

1. Обновить этот файл если изменилась архитектура, CSS-паттерны или структура страниц
2. Добавить нетривиальные баги в `.claude/rules/learned.md`
3. Не ждать напоминания пользователя — делать сразу по завершении задачи
