# US–China Olympic Rivalry

Interactive CSC316 final project exploring the Olympic rivalry between the United States and China through multiple D3-based visualizations.

## Links

- **Live Website:** https://heidiyf.github.io/CSC316_project/
- **Screencast Video:** https://youtu.be/8eHo6aj_Fkw?si=FvosIFUOsrerbGN7

## Project Structure

All JavaScript source files stay in the repository root.

```text
CSC316_project/
├── data/
│   ├── olympics_dataset.csv
│   └── olympics_dataset_cleaned.csv
├── image/
│   ├── China-USA_Easy-Resize.com_.jpg
│   ├── bullet.png
│   ├── diving.gif
│   ├── diving_underwater.gif
│   ├── gun.png
│   ├── sports-park.png
│   ├── swimmer_CHN_.gif
│   └── swimmer_USA_.gif
├── sound/
│   ├── gunshot.mov
│   ├── Lose sound effects.mp3
│   ├── Tie Game Horns Sound Effect.mp3
│   └── Victory Sound Effect.mp3
├── index.html
├── shared.js
├── sportpark.js
├── viz1_dominance.js
├── viz2_swimming.js
├── viz3_diving.js
├── viz4_goldrace.js
├── viz5_forgottenSports.js
├── viz6_trivia.js
└── viz7_shooting.js
```

## Visualizations

- `viz1_dominance.js`: overall medal dominance comparison
- `viz2_swimming.js`: swimming medals and Paris 2024 finals
- `viz3_diving.js`: diving flow / cursor interaction
- `viz4_goldrace.js`: medal race / timeline comparison
- `viz5_forgottenSports.js`: lesser-known or overlooked rivalry sports
- `viz6_trivia.js`: trivia interaction
- `viz7_shooting.js`: shooting replay plus perspective duel game
- `sportpark.js`: Olympic sports park overview map
- `shared.js`: shared utilities, theme wiring, data loading, and viz bootstrapping

## Asset Conventions

- Put CSV data files in `data/`
- Put image and GIF assets in `image/`
- Put audio assets in `sound/`
- Keep visualization `.js` files in the repo root

## Run Locally

Because the project loads CSV files and media assets with relative paths, run it through a local server instead of opening `index.html` directly.

Example options:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

You can also use VS Code Live Server if you prefer.

## Libraries and External Resources

**Our code** (all JavaScript visualization files and HTML/CSS):
- `index.html` — page structure, layout, and all inline styles
- `shared.js`, `sportpark.js`, `viz1_dominance.js` through `viz7_shooting.js` — all visualization logic written by the team

**Third-party libraries** (loaded via CDN, not modified):
- [D3.js v7](https://d3js.org/) — data-driven DOM manipulation and SVG rendering used across all visualizations
- [Twemoji v14](https://github.com/twitter/twemoji) — renders flag and other emoji as images for cross-platform compatibility (Windows)
- [Google Fonts](https://fonts.google.com/) — Bebas Neue, Playfair Display, Lora, and DM Sans typefaces

**Data:**
- `data/olympics_dataset.csv` — primary dataset (Olympic medal records, sourced externally and used as-is)
- `data/olympics_dataset_cleaned.csv` — cleaned version kept for reference

## Notes

- Main entry point: `index.html`
- Shared dataset used by the page: `data/olympics_dataset.csv`
- Extra cleaned dataset kept for analysis/reference: `data/olympics_dataset_cleaned.csv`
