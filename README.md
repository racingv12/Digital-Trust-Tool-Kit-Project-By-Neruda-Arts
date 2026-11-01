# Digital Trust website

Static site (HTML, CSS, JavaScript, no build step) for https://digitaltrust.nerudaarts.ca, hosted on Cloudflare Pages.

## Files

```
index.html          Page content and structure
css/style.css       All styling (colours and fonts are at the top, in :root)
js/animations.js    Scroll reveal, reading progress bar, active nav link
js/video.js         YouTube / Vimeo embeds that load on click
js/checklist.js     Print and clear buttons for the Before-you-post checklist
js/game-data.js     Game rounds and "average human" figures  ← edit this for the game
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

The page follows the Digital Trust Toolkit brief: What this toolkit is for, Trust and fact-checking, Creativity and ownership, Credit, permission and honesty (with sample captions), AI and the environment, Before you post (checklist), Learning activities, the spot-the-AI-image game, Student voices, Videos and infographics, Download and share, and About the team.

Text marked `<!-- DRAFT -->` in `index.html` is starter wording for the team to review and rewrite. Grey italic lines are placeholders for content still to come.

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
- **Images:** put them in `assets/game/`, around 600 × 600 px and under 150 KB each.
- **Quitting:** players can leave a game at any time with the Quit button or the Esc key. This returns them to the start screen and nothing from the unfinished game is scored.
- **Rounds per game:** if you add more rounds than `roundsPerGame`, players get a random selection each time.

### The "average human" figures

`GAME_CONFIG.baseline` holds the numbers players are compared against. They are placeholders now. Two ways to replace them:

1. **Use a published study** on how well people detect AI-generated images or text, and cite it in the About section.
2. **Collect your own:** have 15 or more people play the finished game. After each game, note their accuracy and average time from the results screen (or, in the browser console, run `copy(JSON.stringify(window.__lastResults))` to copy the exact numbers). Average them, and use the spread of their times for `timeSpreadSeconds`.

Then set `isPlaceholder: false` to remove the note on the results screen.

Collecting your own data is usually the better fit, since it measures your actual rounds rather than a different test.

## Security headers

`_headers` sets a Content-Security-Policy allowing only what the site uses: Google Fonts, YouTube and Vimeo players, and YouTube thumbnails. If you add another service, add its domain or it will be blocked. For example, Cloudflare Web Analytics needs `https://static.cloudflareinsights.com` added to `script-src` and `https://cloudflareinsights.com` added to `connect-src`.
