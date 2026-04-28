# ECTS Fixer

Kleine browserextensie (Chrome / Edge / Brave) die enkele ergernissen op
[ects.ap.be](https://ects.ap.be) wegwerkt. De extensie is enkel actief op die
domeinnaam.

## Wat doet ze?

- **Academiejaar automatisch instellen.** Bij het openen van de site wordt de
  academiejaar-dropdown standaard op het ingestelde jaar gezet (default
  `2025-2026`). Handig zolang de site bij elke load weer naar het lopende
  academiejaar springt.
- **"Open in achtergrondtab"-knop bij elk vak.** Op een programma-pagina (bv.
  `/ects/opleiding/<jaar>/<code>/<id>`) verschijnt naast elke vak-rij een klein
  knopje. Een klik opent dat vak in een nieuwe tab op de achtergrond — de
  focus blijft op de huidige tab. De open accordions en scrollpositie worden
  via een snapshot/restore zoveel mogelijk behouden (er zit een korte flicker
  tussen omdat Angular Router intern toch een view-swap forceert).

Beide gedragingen zijn afzonderlijk uit te schakelen via de opties-pagina van
de extensie.

## Installeren

De extensie wordt niet via een store verdeeld; je laadt ze als "unpacked
extension":

1. Clone of download deze map lokaal.
2. Ga in je browser naar `chrome://extensions` (of `edge://extensions`,
   `brave://extensions`).
3. Zet **Developer mode** / **Ontwikkelaarsmodus** aan (toggle rechtsboven).
4. Klik **Load unpacked** / **Uitgepakte extensie laden** en selecteer de map
   `ECTSFixer`.
5. Surf naar [ects.ap.be](https://ects.ap.be) en de extensie is actief.

## Instellingen

Klik op het puzzelstuk-icoon in de toolbar → ECTS Fixer → **Opties** (of vanaf
`chrome://extensions` → Details → Extension options).

- **Academiejaar automatisch instellen bij laden** — aan/uit.
- **Doel-academiejaar** — formaat `JJJJ-JJJJ`, bv. `2025-2026`.
- **"Open in nieuwe tab"-knop bij elk vak** — aan/uit.
- **Debug-logging in console** — schrijft `[ECTSFixer]`-regels in de DevTools-
  console; handig om te zien waar het misgaat als iets niet werkt.

## Updaten

Na het wijzigen van bestanden in deze map: ga naar `chrome://extensions` en
klik op het reload-icoontje (🔄) bij ECTS Fixer. Een harde page-reload op
ects.ap.be is daarna ook aangewezen.

## Bestanden

- [manifest.json](manifest.json) — extensie-manifest (MV3).
- [content.js](content.js) — content script (isolated world): zet het
  academiejaar en plaatst de "open in nieuwe tab"-knoppen.
- [page-hook.js](page-hook.js) — content script (main world): patcht
  `history.pushState` zodat een geknopt vak in een nieuwe tab opent zonder dat
  de huidige tab navigeert.
- [options.html](options.html) / [options.js](options.js) — opties-pagina.
