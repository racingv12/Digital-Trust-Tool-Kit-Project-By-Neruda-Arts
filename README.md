# Digital Trust website

Static site (HTML, CSS, JavaScript, no build step) for https://digitaltrust.nerudaarts.ca, hosted on Cloudflare (Neruda Arts' account, Worker named `digitaltrust`). Subscription emails go to a Google Sheet through a small Google Apps Script (see "Email subscription").

## Files

```
index.html          Page content and structure
css/style.css       All styling (colours and fonts are at the top, in :root)
js/animations.js    Scroll reveal, reading progress bar, active nav link
js/menu.js          Phone menu: the ☰ button opens a sidebar with every section
js/video.js         YouTube / Vimeo embeds that load on click
js/checklist.js     Print and clear buttons for the Before-you-post checklist
js/game-data.js     Game rounds and settings  ← edit this for the game
js/game.js          Game logic (normally no need to edit)
js/subscribe.js     Sends the Subscription form to the Google Apps Script web app
google-apps-script/ The script pasted into the "Subscribers" Google Sheet (a copy for reference)
assets/images/      Images used on the page
assets/game/        Images used in the game
_headers            Cloudflare Pages security and caching headers
favicon.svg         Browser tab icon
```

## Deploying to Cloudflare

The GitHub repository is connected to the `digitaltrust` Worker in Neruda Arts' Cloudflare account: every push publishes a new version of these files.

To preview locally, run `python3 -m http.server` in this folder and open http://localhost:8000.

## Adding videos

1. Upload the video to YouTube or Vimeo.
2. In `index.html`, find the `#watch` section and set `data-id` on a `.video` element:
   - YouTube: `youtube.com/watch?v=`**`abc123XYZ`** → `data-provider="youtube" data-id="abc123XYZ"`
   - Vimeo: `vimeo.com/`**`123456789`** → `data-provider="vimeo" data-id="123456789"`
   - Unlisted Vimeo (`vimeo.com/123456789/a1b2c3d4e5`) → `data-id="123456789/a1b2c3d4e5"`
3. Update `data-title` and the `<figcaption>` text.
4. Optional: add `data-poster="assets/images/your-poster.jpg"` for a custom preview image. Recommended for Vimeo, which otherwise shows a plain dark box with a play button.

To add more videos, copy a whole `<figure class="video-card">…</figure>` block.

Check the platform settings: on YouTube, "Allow embedding" must be on. On Vimeo, under Privacy → Embed, either allow anywhere or add `digitaltrust.nerudaarts.ca` as an allowed domain.

The player only loads after a visitor presses play, which keeps the page fast and avoids loading YouTube/Vimeo tracking for people who don't watch. YouTube uses its privacy-enhanced domain (youtube-nocookie.com) and Vimeo uses `dnt=1`.

## Page sections

One page, in this order (from Anum's website audit and the redesign mockup and style guide, November 2026):

1. Intro (hero)
2. What this toolkit is for (`#purpose`)
3. Game: Spot the AI image! (`#test`)
4. Trust and fact-checking (`#trust`)
5. Creativity and ownership (`#creativity`)
6. Credit, permission and honesty (`#credit`)
7. Before you post or upload, with the checklist (`#checklist`)
8. Feeling overwhelmed? You're not alone (`#voices`)
9. Videos and infographics (`#watch`)
10. For educators: discussion questions and exercises (`#activities`)
11. AI and the environment, kept short (`#environment`)
12. Share the toolkit (`#share`)
13. Subscribe (`#subscribe`)
14. About the team (`#about`)

The menu links only to five main topics: Fact-checking, Creativity & credit, Before you post, You're not alone and About, plus the light blue Play the game button. The other sections are reached by scrolling or from the phone sidebar.

Most content sits in cards (`.card`) with a coloured top edge that alternates blue and purple; `.grid.g2` / `.grid.g3` lay them out two or three across, and one across on narrow screens. Example cards use `.card--ex`, short labels use `.label`, and small icons use `.ic`.

Don't leave placeholder text on the page: until content is ready, hide or remove an empty section rather than showing "will be added here".

## Brand colours and fonts

Colours and fonts follow the team's brand palette ("Tech Tones", in Google Drive › Social Media › Brand Pallette) and are set at the top of `css/style.css`. All fonts load from Google Fonts. The body text uses the brand's Poppins. The brand's title and subtitle fonts, PHATT and Zing Rust Base, aren't on Google Fonts, so similar-looking free fonts stand in for them until the real font files are added: Audiowide for titles and Barlow Condensed (bold italic) for short labels. Colours, sizes, spacing and corner radius follow the team's style guide.

## Logo and tools

The header shows the shield logo and the text-only logo (wordmark) together (the wordmark alone on very narrow phones). The hero title is text, as in the mockup, with the toolbox illustration beside it on wide screens, and the other five tools from the brand's "tool variations" are placed down the right side of the page, one per section. All are in `assets/images/brand/`:

- `logo-shield.png`, `logo-wordmark.png`: for the light colours. In the wordmark, the light blue "DIGITAL" was darkened to the brand blue `#0393bf` so it reads on the light background.
- `logo-shield-dark.png`, `logo-wordmark-dark.png`: the black-background versions, for the dark colours.
- `tool-toolbox.png`, `tool-wrench.png`, `tool-saw.png`, `tool-screwdriver.png`, `tool-drill.png`, `tool-hammer.png`.

They were cut out of the brand sheets (the white/black backgrounds made transparent), so they are fairly small. For sharper images, export each one from the original design (e.g. Canva) as a PNG with a transparent background at 2–3× size and replace the file with the same name.

Each tool only appears where there's empty space to the right of its section's content, so it never covers text: they're hidden when the phone menu (☰) appears and on narrow screens. To move one, change its `--top`, `--turn` (rotation) or `--size` in `css/style.css` (`.deco-tool--hammer` etc.), or move its `<img class="deco-tool …">` line to another section in `index.html`.

## Meet the team

The About section shows one card per team member: photo, name, role and bio as real text. The photos are in `assets/images/team/` (JPG, about 440 × 410 px, cropped from the team's "Meet our team" posts). To add someone, add their photo there and copy one `<li class="card team__card">` block in `index.html`.

The footer links to the project's Instagram, TikTok, Facebook and LinkedIn (`ul.social`). A contact email is left as a comment in `index.html`, ready to fill in. Links to other websites open in a new tab (`target="_blank" rel="noopener"`); give any new outside link the same two attributes. The Translate links are the exception: they open the translated page in the same tab.

## Phone menu

On phones and small tablets (880px wide or less) the top menu only has room for "Play the game", so a ☰ button opens a sidebar with links to every section. The list is in the `<div class="drawer" id="site-menu">` block near the top of `index.html`: when you add, remove or rename a section, update it there too. The sidebar closes when a link is tapped, with the ✕ button, by tapping outside it or with Esc.

## Translate menu

The Translate menu links to Google Translate's copy of the **live** site at https://digitaltrust.nerudaarts.ca. Until the toolkit is published at that address, the links show whatever page is there now (for example an "under development" page), not the toolkit. To test earlier, temporarily change the address after `u=` in each link to the beta address.

## Footer

The footer shows the Neruda Arts credit, the Neruda Arts logo and the Government of Canada funding acknowledgement, each with a version for the dark theme. The Neruda Arts logo is in colour in both themes: `assets/images/neruda-arts-logo-colour.png` (colour emblem, black lettering, empty margins trimmed) and `neruda-arts-logo-colour-on-dark.png` (the same with white lettering, for the dark theme). It is sized to the same height as the Canada graphic. Browsers keep files in `assets/` for a week (see `_headers`), so when you replace an image, save it under a new filename and update the HTML, or visitors may keep seeing the old one.

The printed checklist ("Print the checklist") has the Neruda Arts logo and the toolkit name at the top, and the footer logos at the bottom.

"Print the checklist" prints only the checklist, on one page. Printing the page normally prints the whole toolkit without the navigation, videos or game.

## Adding in-depth content

Each topic section has a short summary plus a "Read more" area:

```html
<details class="deep-dive">
  <summary>Read more</summary>
  <div class="deep-dive__body">
    <!-- ADD IN-DEPTH CONTENT HERE -->
  </div>
</details>
```

Replace the placeholder paragraph with your content. Paragraphs, lists, images and headings (`<h3>`) all work inside.

To add a new topic, copy a full `<section class="section reveal" id="…">` block, give it a new `id`, and add a matching link in the nav at the top of `index.html`.

## The game

Open `js/game-data.js`:

- **Rounds:** one round per photo pack from Google Drive › Real:AI (lake, sky, food, living room, dolls, portraits). Each pack has two real photos and one AI photo, marked by `aiIndex` (counting from 0). The game shuffles the order of the rounds and where the photos appear, so the AI one isn't always in the same spot. To add a pack, add an object to `GAME_ROUNDS` (the file shows the format). With `roundsPerGame: 'all'`, the number of rounds always matches the number of packs. If the list is empty, the game runs in demo mode with practice patterns.
- **Photo files:** `assets/game/`, named by pack and number (`lake-1.jpg`…). Never put "ai" or "real" in a file name: anyone can see it in the browser. Resize photos to about 1000 px on the longest side and under 200 KB, and re-save them so hidden data such as location is removed. The Drive file "Gemini_Generated_Image…" (a second AI lake photo) isn't used, because each pack can only have one AI photo.
- **Fits every screen:** before each round the game measures the screen and picks the tile size and layout (3 in a row, 2 + 1, or stacked) so all the photos, the explanation and the Next button are visible without scrolling. A magnifying-glass button on each photo opens it full size, and the player can choose it from there.
- **Explanations:** give every round an `explain` sentence about the clue (for example "Look at the hands: the fingers merge together."). It is shown after the player answers, and they move on with the Next round button when they're ready, so nothing advances automatically.
- **Practice mode:** the "Practice (no timer)" button starts a game with no time limit, no timer on screen and no speed result. The normal game has a time limit per round (`timeLimitSeconds`) and shows the player's average time.
- **Results:** players see only their own score (correct answers, accuracy and, outside practice mode, average time). There is no comparison with other players, since we don't have real data for one.
- **AI-use note:** the note under the game, and the AI-use line in About › Sources and credits, should name the AI tool used to make the game images.
- **Quitting:** players can leave a game at any time with the Quit button or the Esc key. This returns them to the start screen and nothing from the unfinished game is scored.
- **Rounds per game:** `roundsPerGame: 'all'` plays every pack. Set a number instead to play a random selection of that many.

## Email subscription

The **Subscription** section has an email box. When someone subscribes, `js/subscribe.js` sends the address to a **Google Apps Script** web app, which adds it to the **"Subscribers" Google Sheet** (Digital Trust folder in Google Drive, owned by the Digital Trust Team account). The sheet updates the moment someone subscribes.

- **No duplicates:** the script checks the sheet first and only adds an address that isn't already there (upper/lower case doesn't matter). Two people subscribing at the same moment can't create a duplicate either.
- **Privacy:** the form gives the same "You're on the list" answer whether or not the address was already there, so nobody can use it to check who is subscribed. Keep the sheet private: it holds personal information.
- **Consent and spam:** visitors must tick the consent box (needed under Canada's anti-spam law, CASL), and a hidden spam-trap field catches simple bots.
- **Excel:** in the sheet, *File › Download › Microsoft Excel (.xlsx)* gives an Excel copy of the current list at any time.
- **Unsubscribes:** delete that person's row in the sheet.

### One-time setup (signed in as the Digital Trust Team Google account)

1. Open the **Subscribers** Google Sheet › *Extensions › Apps Script*.
2. Delete what's in `Code.gs`, paste the whole of `google-apps-script/subscribe.gs`, and click **Save**.
3. Click **Deploy › New deployment** › gear icon › **Web app**. Set *Execute as* **Me** and *Who has access* **Anyone**, then **Deploy**. Google asks you to allow access to your spreadsheets: choose the Digital Trust Team account › *Advanced* › *Go to … (unsafe)* › *Allow*. (The warning appears because the script is new and unreviewed; it only touches this spreadsheet.)
4. Copy the **Web app URL** (it starts with `https://script.google.com/macros/s/` and ends with `/exec`).
5. In `index.html`, paste the URL into `data-endpoint="…"` on the subscribe form (already done for the current deployment). Commit and push.
6. Test: subscribe with your own address on the live site. A row should appear in the sheet (the first sign-up also adds the Email / Subscribed header row). Subscribe again with the same address: no second row.

If you change the script later, use **Deploy › Manage deployments › Edit (pencil) › Version: New version › Deploy**, so the same URL keeps working.

## Security headers

`_headers` sets a Content-Security-Policy allowing only what the site uses: Google Fonts, YouTube and Vimeo players, and YouTube thumbnails. If you add another service, add its domain or it will be blocked. For example, Cloudflare Web Analytics needs `https://static.cloudflareinsights.com` added to `script-src` and `https://cloudflareinsights.com` added to `connect-src`.
