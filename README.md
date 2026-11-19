# Digital Trust website

Static site (HTML, CSS, JavaScript, no build step) for https://digitaltrust.nerudaarts.ca, hosted on Cloudflare Pages.

## Files

```
index.html          Page content and structure
css/style.css       All styling (colours and fonts are at the top, in :root)
js/animations.js    Scroll reveal, reading progress bar, active nav link
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

## Translate menu

The Translate menu links to Google Translate's copy of the **live** site at https://digitaltrust.nerudaarts.ca. Until the toolkit is published at that address, the links show whatever page is there now (for example an "under development" page), not the toolkit. To test earlier, temporarily change the address after `u=` in each link to the beta address.

## Footer

The footer shows the Neruda Arts credit and the Government of Canada funding acknowledgement (`assets/images/funding/`, with a white version for dark mode). The Neruda Arts logo goes next to it, in the `.footer-logos` block in `index.html`, once it is shared: save it in `assets/images/` (not loaded from another website, so `_headers` doesn't need changing).

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

- **Rounds:** add objects to `GAME_ROUNDS` (the file shows the format for image and text rounds). Each round has 2 to 4 items and one AI-generated item, marked by `aiIndex` (counting from 0). While the list is empty, the game runs in demo mode with practice patterns.
- **Explanations:** give every round an `explain` sentence about the clue (for example "Look at the hands: the fingers merge together."). It is shown after the player answers, and they move on with the Next round button when they're ready, so nothing advances automatically.
- **Practice mode:** the "Practice (no timer)" button starts a game with no time limit, no timer on screen and no speed result. The normal game has a time limit per round (`timeLimitSeconds`) and shows the player's average time.
- **Results:** players see only their own score (correct answers, accuracy and, outside practice mode, average time). There is no comparison with other players, since we don't have real data for one.
- **AI-use note:** the note under the game, and the AI-use line in About › Sources and credits, should name the AI tool used to make the game images.
- **Images:** put them in `assets/game/`, around 600 × 600 px and under 150 KB each.
- **Quitting:** players can leave a game at any time with the Quit button or the Esc key. This returns them to the start screen and nothing from the unfinished game is scored.
- **Rounds per game:** if you add more rounds than `roundsPerGame`, players get a random selection each time.

## Security headers

`_headers` sets a Content-Security-Policy allowing only what the site uses: Google Fonts, YouTube and Vimeo players, and YouTube thumbnails. If you add another service, add its domain or it will be blocked. For example, Cloudflare Web Analytics needs `https://static.cloudflareinsights.com` added to `script-src` and `https://cloudflareinsights.com` added to `connect-src`.
