# D2R Lobby Design — v1.55

A standalone, browser-based Diablo II: Resurrected lobby UI/UX prototype. This project is a visual and interaction demonstration, not a Battle.net integration.

## Preview locally

Open `index.html` in Chrome or Edge. No dependencies or build tools are required.

## Publish using GitHub Pages

1. Create a public GitHub repository.
2. Upload `index.html`, `style.css`, `script.js`, `README.md`, and the `assets/` and `img/` folders (Git does not track empty directories; the folder includes a `.gitkeep` file).
3. Open repository **Settings → Pages**.
4. Choose **Deploy from a branch**, select `main` and `/(root)`, then save.
5. Visit `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/` after deployment.

## File structure

- `index.html` — Page structure and existing project-rule comments.
- `style.css` — All styling, extracted without redesign.
- `script.js` — All sample data and interactive behavior, extracted without feature changes.
- `assets/ui/` — Original lobby screenshot crops used for stone textures, borders, buttons, side carvings, and the center ornament. See its README for source crop coordinates.

## Development rules

- Preserve all existing functionality and layout unless explicitly requested otherwise.
- Continue project versioning from **v1.55** (next revision: **v1.56**).
- Keep the historical project-rule comments in `index.html` and update them for future changes.
- Keep the three core files (`index.html`, `style.css`, `script.js`) unless a future change warrants further organization.
- Use relative file paths so the site works on GitHub Pages and locally.
- All sample data and prototype changes are local; there is no live game or account integration.

## Credits

Unofficial fan-made UI/UX concept for Diablo II: Resurrected. Not affiliated with or endorsed by Blizzard Entertainment.

## Market concept

Open the Market tab to browse items, visit a seller's shop, and buy from their trade stash using sample runes. Your purchased items and rune balance update for this session. Expand List an item from your stash to list or withdraw a sample item. Reload resets the demo.

Visit Shop now enters the supplied Rogue Encampment screenshot. Click Seller’s Shop to open the shop and inventory pictures, select a highlighted item to see its supplied statistics image, and buy it with sample runes. Purchases appear in the inventory grid. Back to Camp closes the panels; Return to Lobby returns to the market. The img/ folder contains the supplied screenshots and must be included when publishing.

Shop prices appear with the item statistics rather than on the item icons. Ist and Mal rune pictures occupy inventory cells and disappear as payment is spent; numeric rune balances are hidden. The background scene stays unchanged when the shop panels open.

Hover previews item statistics. Click an item to lock its tooltip; hovering other items will not change it until you click another item or the surrounding scene. Tooltip and purchase controls keep the active selection.

Hover previews display item details and price only. Selected Item and purchase controls appear after clicking an item and disappear when the selection is cleared.

Trading games advertise the eight shop items and their rune prices. Select one and click Join Game (or type its game name) to enter the same shop scene used by Visit Shop. Purchases and available runes are shared between both entry points.

The lobby now uses textures cropped from the supplied original lobby screenshot. Carved frames and gold button borders use CSS border-image without their screenshot centers; live interface text remains separate. The shop scene retains its existing artwork.

The center display uses the original screenshot's Diablo title, character frame, Barbarian preview, and full bottom ornament. Its selected-character name, level, and class remain live. The Barbarian artwork is a static placeholder shared by all selections.
