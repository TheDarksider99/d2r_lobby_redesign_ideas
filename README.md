# D2R Lobby Design — v1.74

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
- Continue project versioning from **v1.74** (next revision: **v1.75**).
- Keep the historical project-rule comments in `index.html` and update them for future changes.
- Keep the three core files (`index.html`, `style.css`, `script.js`) unless a future change warrants further organization.
- Use relative file paths so the site works on GitHub Pages and locally.
- All sample data and prototype changes are local; there is no live game or account integration.

## Credits

Unofficial fan-made UI/UX concept for Diablo II: Resurrected. Not affiliated with or endorsed by Blizzard Entertainment.

## Market concept

The Market is an in-game trading hub where players can browse items, find sellers, and visit their shops directly from the lobby. It connects item discovery with trading inside a game, while keeping runes as the currency.

Listings show the item, its properties, the seller, server, and asking price in runes. Players can search by item or seller name and inspect an item's statistics before visiting the shop.

Players list items from their trade stash and set a price in runes. Sellers can withdraw listings when they no longer want to sell an item. The trade stash gives buyers a dedicated place to browse the seller's available items.

Visit Shop takes the buyer into the seller's dedicated shop camp. From camp, the buyer opens the seller's shop and browses their trade stash alongside their own inventory. Trading games can also advertise items and rune prices in the game list, giving players another way to discover and join a seller's game.

Hovering over an item shows its statistics and rune price. Clicking selects the item and keeps its details visible while the buyer reviews the purchase. Buying transfers the item into the buyer's inventory and pays the seller with the required runes from the buyer's inventory.

Purchases complete automatically at the seller's listed rune price, without requiring the seller's attention or a manual trade-window exchange. Buyers can shop while the seller continues playing.

## Lobby UI concept

The lobby brings character selection, friends, chat, game browsing, and trading into one interface. Character selection and social features sit on the left, the selected character appears in the center, and game creation and browsing share the right panel. Players can manage their character and find a game without leaving the lobby.

A server selector is available inside the lobby for America, Europe, and Asia. Changing server updates the game browser and chat for that region, keeping regional conversations separate.

Options, Cinematics, and Credits are accessible from the lobby toolbar. Exit Diablo II is available directly from the lobby.

The character list supports sorting by name, level, or class, plus a custom order that players can arrange by dragging. Recently deleted characters can be restored before the 24-hour permanent-deletion deadline.

Roster numbers follow the displayed order after sorting or dragging, and sort direction can be reversed.

Character deletion requires typing DELETE before confirmation, reducing accidental deletion. Recent Delete shows how many characters are recoverable, provides a Restore action for each one, and explains the 24-hour recovery window.

Create Game and Join Game share one Game tab, so players can browse existing games and prepare a new one without switching screens. Normal, Nightmare, and Hell are directly selectable buttons. The Game Name field receives focus when entering the lobby, making it quicker to type the next run's name.

Game creation details grouped in an expandable Game Settings section. New game activity tags.

Quest, Farming, PvP, and Trading are explicit game activities chosen by the host. Activity filter tabs provide direct access to All and each activity without opening a dropdown. Players can filter by purpose rather than relying entirely on abbreviations in game names. Activity, difficulty, search, Terror Zone, and age filters work together to narrow the list.

The game list now exposes elapsed time. Players can compare these details without selecting each game. Occupancy is shown as current/max, such as 3/8 or 2/4, making each game's actual player limit clear. Now, show game with full room.

Every game-list column supports sorting: game name, activity, player count, time, Terror Zone status, and connection quality. The Players column adds a third sorting mode that puts full games at the bottom while keeping them visible, making available games easier to find.

Game age appears directly in each row, including seconds for games less than a minute old. Selecting a game shows its elapsed time down to the second alongside the host's description and player roster. Players can check whether a run is fresh and who is in it without switching between Settings and Players tabs.

A narrower Game Details panel combines elapsed time, level restrictions, description, and players, reducing the need to switch tabs. Players can search game names, filter by difficulty and activity, and sort the list to find a suitable game. The age filter hides games that have been open for a chosen number of minutes or hours.

Friends have a dedicated tab with collapsible Favorites and Friends groups. Entries show availability and, when a friend is in a game, their character level, act, and difficulty. Players can keep frequent teammates together and collapse groups they are not using.

Chat has direct tabs for All, Lobby, Clan, Trading, PvP, Farming, Quest, and Private. All combines the conversations while retaining each message's channel indicator, and timestamps make the timing of messages clear.

Unread badges appear even on the active channel. Manually scrolling to the bottom clears the current channel's count; doing so in All clears every channel. Private messages also have an unread indicator on the Chat tab. Players can hide system notifications or filter messages containing unwanted words.

Incoming private messages have a sound notification as well as unread counts, so players can notice a reply while browsing games or using another lobby tab.

The chat word filter accepts multiple comma-separated terms. Players can suppress recurring advertisements or unwanted phrases. A separate system-notification toggle hides announcements, including Terror Zone starting, fading.
