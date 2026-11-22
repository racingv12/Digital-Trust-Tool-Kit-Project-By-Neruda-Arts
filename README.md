# Digital Trust website

Static site (HTML, CSS, JavaScript, no build step) for https://digitaltrust.nerudaarts.ca, hosted on Cloudflare Pages.

## Files

```
index.html          Page content and structure
css/style.css       All styling (colours and fonts are at the top, in :root)
js/animations.js    Scroll reveal, reading progress bar, active nav link
js/menu.js          Phone menu: the ☰ button opens a sidebar with every section
js/carousel.js      "Meet the team" carousel in About (arrows, dots, arrow keys, swipe)
js/video.js         YouTube / Vimeo embeds that load on click
js/checklist.js     Print and clear buttons for the Before-you-post checklist
js/game-data.js     Game rounds and settings  ← edit this for the game
js/game.js          Game logic (normally no need to edit)
assets/images/      Images used on the page
assets/game/        Images used in the game
_headers            Cloudflare Pages security and caching headers
favicon.svg         Browser tab icon
```

## Deploying to Cloudflare Pages

**Using Git (recommended):** put this folder in a GitHub repository, connect it in Cloudflare Pages, and set the framework preset to "None", the build command to empty, and the output directory to `/`. Every push publishes a new version.

**Direct upload:** in Cloudflare Pages, create a project with "Upload assets" and drag in the contents of this folder (index.html must be at the top level, not inside a subfolder).

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

One page, in this order (from Anum's website audit, November 2026):

1. Intro (hero)
2. What this toolkit is for (`#purpose`)
3. Game: Spot the AI image! (`#test`)
4. Trust and fact-checking (`#trust`)
5. Creativity and ownership (`#creativity`)
6. Credit, permission and honesty (`#credit`)
7. Before you post or upload, with the checklist (`#checklist`)
8. Feeling overwhelmed? You're not alone (`#voices`)
9. Learning activities (`#activities`)
10. Videos and infographics (`#watch`)
11. AI and the environment, kept short (`#environment`)
12. Download and share (`#share`)
13. About the team (`#about`)

The menu links only to the main topics: Fact-checking, Creativity and credit, Before you post, You're not alone, Activities, and the yellow Play the game button. The other sections are reached by scrolling.

Don't leave placeholder text on the page: until content is ready, hide or remove an empty section rather than showing "will be added here".

## Brand colours and fonts

Colours and fonts follow the team's brand palette ("Tech Tones", in Google Drive › Social Media › Brand Pallette) and are set at the top of `css/style.css`. All fonts load from Google Fonts. The body text uses the brand's Poppins. The brand's title and subtitle fonts, PHATT and Zing Rust Base, aren't on Google Fonts, so similar-looking free fonts stand in for them: Orbitron for titles and Barlow Condensed (bold italic) for subtitles.

## Meet the team

The About section has a "Meet the team" carousel of the team's "Meet our team" posts, saved in `assets/images/team/`. Each image's alt text repeats the words in the post, so screen-reader users get the same introduction. To add someone, add their image (square WebP or JPG, around 1200 px) to that folder and copy one `<figure class="carousel__slide">` block in `index.html`, updating the "1 of 5" numbers in every slide's `aria-label`. The carousel never moves on its own.

## Phone menu

On phones (720px wide or less) the top menu only has room for "Play the game", so a ☰ button opens a sidebar with links to every section. The list is in the `<div class="drawer" id="site-menu">` block near the top of `index.html`: when you add, remove or rename a section, update it there too. The sidebar closes when a link is tapped, with the ✕ button, by tapping outside it or with Esc.

## Translate menu

The Translate menu links to Google Translate's copy of the **live** site at https://digitaltrust.nerudaarts.ca. Until the toolkit is published at that address, the links show whatever page is there now (for example an "under development" page), not the toolkit. To test earlier, temporarily change the address after `u=` in each link to the beta address.

## Footer

The footer shows the Neruda Arts credit, the Neruda Arts logo and the Government of Canada funding acknowledgement, each with a white version for the dark theme. The Neruda Arts logo files are `assets/images/neruda-arts-logo.png` (black) and `neruda-arts-logo-white.png`, from Google Drive › Neruda Arts – Brand Assets › Neruda PNG (15.png and 11.png, with the empty margins trimmed).

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

## Security headers

`_headers` sets a Content-Security-Policy allowing only what the site uses: Google Fonts, YouTube and Vimeo players, and YouTube thumbnails. If you add another service, add its domain or it will be blocked. For example, Cloudflare Web Analytics needs `https://static.cloudflareinsights.com` added to `script-src` and `https://cloudflareinsights.com` added to `connect-src`.
