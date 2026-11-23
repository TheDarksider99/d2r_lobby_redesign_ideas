# D2R Lobby Design — v1.93

A standalone, browser-based Diablo II: Resurrected lobby UI/UX prototype. This project is a visual and interaction demonstration, not a Battle.net integration.

## Preview locally

Open `index.html` in Chrome or Edge. No dependencies or build tools are required.

## Publish using GitHub Pages

1. Create a public GitHub repository.
2. Upload `index.html`, `style.css`, `script.js`, `README.md`, and the `assets/`, `img/`, and `sound/` folders.
3. Open repository **Settings → Pages**.
4. Choose **Deploy from a branch**, select `main` and `/(root)`, then save.
5. Visit `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/` after deployment.

## File structure

- `index.html` — Page structure and existing project-rule comments.
- `style.css` — Lobby, camp, shop, inventory, and Inspect layouts.
- `script.js` — Demo data and interactive behavior.
- `assets/ui/` — Original lobby screenshot crops used for stone textures, borders, buttons, side carvings, and the center ornament. See its README for source crop coordinates.
- `img/class/` — Class portraits, center artwork, and camp sprites.
- `img/items/` — Item tooltips, base artwork, and rune icons.
- `sound/` — Intro videos and interface audio.

## Development rules

- Preserve all existing functionality and layout unless explicitly requested otherwise.
- Continue project versioning from **v1.93** (next revision: **v1.94**).
- Keep the historical project-rule comments in `index.html` and update them for future changes.
- Keep the three core files (`index.html`, `style.css`, `script.js`) unless a future change warrants further organization.
- Use relative file paths so the site works on GitHub Pages and locally.
- All sample data and prototype changes are local; there is no live game or account integration.

## Credits

Unofficial fan-made UI/UX concept for Diablo II: Resurrected. Not affiliated with or endorsed by Blizzard Entertainment.

## Put this in Credit button
- There are too many new features to list, you just have to discover them yourself.
- **Inspect player builds** to see equipped items and their stats in the lobby or in game. Share your build through in-game chat for feedback.
- **Clan** includes a ranked roster, news and announcements, join requests, and a cooperative quest to pool materials and summon the Cinder Warden.
- **Communities** lets players browse and join interest-based groups, view searchable member rosters and announcements, and chat with the communities they join.
- **Item Market and seller shops** let players browse listings, visit shops through Trade rooms, and buy items with runes or gold where accepted.
- **Character management** includes online and offline rosters, list and grid views, custom ordering, and recovery for recently deleted characters.
- **Game creation and browsing** supports activity-based rooms, difficulty and age filters, Terror Zone filtering, and sorting by occupancy or elapsed time.
- **Friends** brings together favorites, online status, friend requests, recently played players, and blocked accounts.
- **Lobby and in-game chat** share message history across public channels, clan and community chat, and private whispers. Players can manage unread messages and filter chat text.
- **Open game invitations** let players post a Join Me button in chat so others can enter the room directly.
- **Server selection** in the gear menu switches between America, Europe, and Asia. Each server keeps its own game list and chat history.
- **Character-specific game lists** match the selected character by Softcore or Hardcore, Ladder or Non-Ladder, and expansion mode, including Classic and Lord of Destruction.
- **Game browser controls** include a friends-only filter, an age filter, a Terror Zone toggle, a refresh button, and a count of matching games.
- **Chat controls** let players hide system notices, filter messages by word, and adjust in-game text size. Channel counts and unread badges show chat activity.
- **Quick chat replies** let players Ctrl-click a message to target its channel or use Whisper from a player menu to start a private conversation.
- **Camp shortcuts** use **I** to toggle inventory and **Esc** to dismiss open panels or open the game menu.
- **Shop tabs and page arrows** let players browse seller stock. Rune stacks show quantities, and both the shop and inventory display gold balances.
- **Character previews** show bottom-strip players in the center panel while keeping your selected character visible as a small portrait.
-...
## Market concept

The lobby Market shows the item, its stats, the seller, server, and accepted prices. Search by item or seller and use **Sort** to order listings by name, price, or seller. Price sorting uses the primary asking price and the demo’s rune values. Click an item name to view its tooltip.

**Visit Shop** and Trade rooms both take you to camp. Click the seller’s chest to open their shop. The **10 × 10** grid uses each item’s equipment footprint. Shop 1 holds most stock, some sellers have extra stock in Shop 2, and Shops 3–5 are empty. The tabs and bottom page arrows stay in sync.

Hover over an item to preview its stats and prices. Click it to choose a payment option and buy it. Most items have one or two options. Magefist, Frostburn, and Laying of Hands also accept gold at the demo rate of **1 Mal = 30 million gold**. Your inventory starts with 90 million gold and a set of rune stacks.

On purchase, the item goes into your inventory and its shop cell becomes empty. The remaining stock keeps its placement. Gold goes to the shop’s bottom counter, and paid runes appear in its grid with quantity badges. Sold listings disappear from the Market and Trade room list. Click outside the shop and inventory panels to return to camp.

Use **List an item from your stash** to create a demo Market listing at a rune price or withdraw it with **Unlist**. Purchases and listing changes reset when the page reloads.

## Inspect 

Double-click the character artwork in the center panel to open Inspect. Click a bottom-strip player to preview them in the center, or right-click them and choose **Inspect**.
Inspect shows the character’s name, level, class, and equipped items.
Right-click a player and choose **Inspect** to see their gear on the left.

## Action button in game

Open in-game chat and choose **Action → Share Build** to attach your equipped items. The composer displays an **Inspect** tag. Send the attachment by itself or add your own message. Readers can choose **View Build** to inspect the shared equipment. Sample build posts appear in the starting chat history and rotating message pool.

**Action → Invite to Game** adds a **Join Me** tag to the draft. The sent invitation displays the room name. The in-game composer wraps to two visible lines and scrolls for longer messages. Press **Enter** to send.

## Lobby UI concept

The lobby brings character selection, friends, chat, game browsing, and trading into one interface. Character selection and social features sit on the left, the selected character appears in the center, and game creation and browsing share the right panel. Players can manage their character and find a game without leaving the lobby.

A server selector is available inside the lobby for America, Europe, and Asia. Changing server updates the game browser and chat for that region, keeping regional conversations separate.

Options, Cinematics, Credits, and the server selector are accessible from a centered gear menu. The gear button sits at the left edge of the Characters tab's Delete/Convert row. America is selected by default. Exit Diablo II opens a Yes/No confirmation before returning to the intro.

The character list supports sorting by name, level, or class, plus a custom order that players can arrange by dragging. Recently deleted characters can be restored before the 24-hour permanent-deletion deadline.

Roster numbers follow the displayed order after sorting or dragging, and sort direction can be reversed.

Character deletion requires typing DELETE before confirmation, reducing accidental deletion. Recent Delete shows how many characters are recoverable, provides a Restore action for each one, and explains the 24-hour recovery window.

Create Game and Join Game share one Game tab, so players can browse existing games and prepare a new one without switching screens. Normal, Nightmare, and Hell are directly selectable buttons. The Game Name field receives focus when entering the lobby, making it quicker to type the next run's name.

Game creation details grouped in an expandable Game Settings section. New game activity tags.

Quest, Farm, PvP, and Trade are explicit game activities chosen by the host. Activity filter tabs provide direct access to All and each activity without opening a dropdown. Activity, difficulty, search, Terror Zone, and age filters work together to narrow the list.

The game list now exposes elapsed time. Players can compare these details without selecting each game. Occupancy is shown as current/max, such as 3/8 or 2/4, making each game's actual player limit clear. Now, show game with full room.

Every game-list column supports sorting: game name, activity, player count, time, Terror Zone status, and connection quality. The Players column adds a third sorting mode that puts full games at the bottom while keeping them visible, making available games easier to find.

Game age appears directly in each row, including seconds for games less than a minute old. Selecting a game shows its elapsed time down to the second alongside the host's description and player roster. Players can check whether a run is fresh and who is in it without switching between Settings and Players tabs.

A narrower Game Details panel combines elapsed time, level restrictions, description, and players, reducing the need to switch tabs. Players can search game names, filter by difficulty and activity, and sort the list to find a suitable game. The age filter hides games that have been open for a chosen number of minutes or hours.

Friends have a dedicated tab with collapsible Favorites and Friends groups. Entries show availability and, when a friend is in a game, their character level, act, and difficulty. Players can keep frequent teammates together and collapse groups they are not using.

Chat has direct tabs for All, Lobby, Communities, Clan, Trade, PvP, Farm, Quest, and Private. All combines the conversations while retaining each message's channel indicator, and timestamps make the timing of messages clear.

Incoming private messages have a sound notification as well as unread counts, so players can notice a reply while browsing games or using another lobby tab.

The chat word filter accepts multiple comma-separated terms. Players can suppress recurring advertisements or unwanted phrases. A separate system-notification toggle hides announcements, including Terror Zone starting, fading.

Players can post an open game invitation to a chat channel. Each invitation includes the game name, difficulty, activity, and a Join Me button, letting readers enter directly without copying a name or requesting a separate invitation. Full games and incompatible character modes cannot be joined through an open invite.

Regular games, open invitations, and trading visits enter camp. **Save and Exit** returns to game browsing and chat. **Return to Game** closes the game menu.

In a game, **Esc** dismisses open panels before opening the game menu. Press **Esc** again to resume the game.

Opening Chat or selecting a channel lands on its latest messages and clears the unread count for that view. Incoming messages still preserve the reading position.

In-game chat shares the lobby channels, message history, filters, and unread counts. Its Game tab combines current-game messages, in-game whispers, and game notices while excluding public-channel chatter. Invite to Game posts the current public game to a chosen channel.

In-game tabs begin with All, then Game. Game includes current-game player connection notices and Terror Zone announcements.

Attachments use the composer destination. Players can remove an attachment or send it with **Send** or **Enter**. Sending is disabled while the destination is All.

The viewed channel and composer destination are independent. All is a read-only destination: Send is disabled when the composer shows [All]. While viewing All, Ctrl-clicking a message targets its channel without switching the viewed tab, preserving any drafted text or game invitation.

Private is also a read-only composer destination until a player is selected. Ctrl-click a private message in All or Private, or choose Whisper from a player menu, to show that player?s name as the composer tag. The tag routes the message directly; no /w command is needed.

Chat follows new messages while the reader is at the bottom. Scrolling up pauses this behavior and preserves the reading position; returning to the bottom resumes it. This applies to lobby and in-game channels.

In-game chat tabs use the same channel colors and active-channel highlight as lobby chat.


