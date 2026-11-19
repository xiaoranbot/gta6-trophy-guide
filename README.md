# gta6-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/xiaoranbot/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/xiaoranbot/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all 55 Grand Theft Auto VI PlayStation 5 trophies: official names, descriptions and grades, a six-stage roadmap to the platinum, a confirmed-missable warning (no mission replay — save at every chapter), and a checklist saved in the browser with export/import, kind and grade filters, search, and a spoiler-free mode. Pure static files; works with the network off.

## What is inside

- **55 trophies, all of them** — 1 platinum, 2 gold, 6 silver, 46 bronze, with the official name, description and grade of each, plus a guide written for this entry.
- **Roadmap** — six stages from story-first to the 100% cleanup, with trophy counts per stage.
- **Missable warning** — Positive Mental Attitude is the one confirmed missable: Lucia's balcony meditation in Chapter 1 disappears after that chapter. Seven more trophies had no confirmed unlock method at launch, and their guides say so plainly instead of guessing.
- **Tracker** — tick trophies off, stored in localStorage; export to JSON, import it back, filter by kind, grade, earned-only, or search by name and keyword.
- **Spoiler-free mode** (on by default) — the 18 story trophies stay hidden behind lock cards until you earn them.

## Run it

```sh
node serve.ts  # then open http://localhost:8080
```

Or open `app/index.html` from any static file server with `app/` at its root.

## How the tracker works

- **Checklist** — tick a trophy and it is saved in localStorage under `gta6-trophy-earned`; reload the page and your ticks are still there. Export writes them to `gta6-trophy-progress.json`; import reads that file (or a plain JSON array of names) back in, skipping names the list does not know.
- **Spoiler-free mode** (on by default) — the 18 story trophies render as lock cards with no name or guide until you tick them earned. Turn it off to see everything.
- **Filters** — kind chips (Story / Missable / Collectibles / Activities / Crime / Online), a grade dropdown, an earned-only checkbox, and a search box that matches names, descriptions and guides.
- **Roadmap** — six stages with trophy counts, rendered from `app/app.js`, so the page and the guide never drift apart.

## Build the entry

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts  # copies app/ + screenshots/ to out/, writes out/dossier.json
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=3gk6xaeb&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
