/* =========================================================
   "The test" – find the AI-generated item as fast as you can.
   Content and settings live in game-data.js.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('game');
  if (!root) return;

  const config = GAME_CONFIG;
  const demoMode = GAME_ROUNDS.length === 0;
  const roundsPerGame = demoMode
    ? config.roundsPerGame
    : Math.min(config.roundsPerGame, GAME_ROUNDS.length);
  const limitMs = config.timeLimitSeconds * 1000;
  const FEEDBACK_PAUSE_MS = 1100;

  // Elements
  const screens = {
    start: root.querySelector('[data-screen="start"]'),
    play: root.querySelector('[data-screen="play"]'),
    results: root.querySelector('[data-screen="results"]')
  };
  const el = {
    roundCount: document.getElementById('game-round-count'),
    start: document.getElementById('game-start'),
    again: document.getElementById('game-again'),
    quit: document.getElementById('game-quit'),
    progress: document.getElementById('game-progress'),
    timer: document.getElementById('game-timer'),
    timebar: document.getElementById('game-timebar'),
    prompt: document.getElementById('game-prompt'),
    tiles: document.getElementById('game-tiles'),
    feedback: document.getElementById('game-feedback'),
    headline: document.getElementById('results-headline'),
    compare: document.getElementById('results-compare'),
    summary: document.getElementById('results-summary'),
    note: document.getElementById('results-note')
  };

  el.roundCount.textContent = roundsPerGame;

  // State
  let rounds = [];
  let current = 0;
  let results = [];        // { correct: bool, timeMs: number }
  let roundStart = 0;
  let accepting = false;   // true while the player can answer
  let rafId = null;
  let timeoutId = null;     // round time limit
  let nextRoundId = null;   // pause between rounds
  let gameId = 0;           // increases on start/quit so stale async steps stop

  el.start.addEventListener('click', startGame);
  el.again.addEventListener('click', startGame);
  el.quit.addEventListener('click', quitGame);
  document.addEventListener('keydown', onKey);

  /* ---------- Flow ---------- */

  function startGame() {
    stopTimers();
    gameId += 1;
    rounds = demoMode ? makeDemoRounds(roundsPerGame) : shuffle([...GAME_ROUNDS]).slice(0, roundsPerGame);
    current = 0;
    results = [];
    show('play');
    playRound();
  }

  async function playRound() {
    const thisGame = gameId;
    const round = rounds[current];
    accepting = false;
    el.feedback.textContent = '';
    el.progress.textContent = `Round ${current + 1} of ${rounds.length}`;
    el.prompt.textContent = round.prompt ||
      (round.type === 'text' ? 'Which passage was written by AI?' : 'Which image was made by AI?');
    el.timer.textContent = '0.0 s';
    el.timebar.style.transform = 'scaleX(0)';

    const buttons = round.items.map((item, i) => makeTile(round, item, i));
    el.tiles.replaceChildren(...buttons);

    // Wait for images to load so slow connections don't count against the player.
    await Promise.all(
      [...el.tiles.querySelectorAll('img')].map(img => img.decode().catch(() => {}))
    );
    if (thisGame !== gameId) return;   // player quit while images were loading

    roundStart = performance.now();
    accepting = true;
    tick();
    timeoutId = setTimeout(() => answer(-1), limitMs);
  }

  function answer(choice) {
    if (!accepting) return;
    accepting = false;
    cancelAnimationFrame(rafId);
    clearTimeout(timeoutId);

    const round = rounds[current];
    const timedOut = choice === -1;
    const timeMs = timedOut ? limitMs : performance.now() - roundStart;
    const correct = choice === round.aiIndex;
    results.push({ correct, timeMs });

    // Show the answer
    const tiles = [...el.tiles.children];
    tiles.forEach(t => (t.disabled = true));
    if (!timedOut) tiles[choice].classList.add(correct ? 'is-correct' : 'is-wrong');
    if (!correct) tiles[round.aiIndex].classList.add('is-answer');

    const seconds = (timeMs / 1000).toFixed(1);
    let message = timedOut
      ? `Time’s up. The AI one was number ${round.aiIndex + 1}.`
      : correct
        ? `Correct, in ${seconds} s.`
        : `Not this one. The AI one was number ${round.aiIndex + 1}.`;
    if (round.explain) message += ' ' + round.explain;
    el.feedback.textContent = message;

    // Longer pause if there's an explanation to read
    const pause = round.explain ? FEEDBACK_PAUSE_MS + 2200 : FEEDBACK_PAUSE_MS;
    nextRoundId = setTimeout(() => {
      current += 1;
      if (current < rounds.length) playRound();
      else showResults();
    }, pause);
  }

  /* ---------- Quit ----------
     Stops the current game and returns to the start screen.
     Nothing from an unfinished game is scored. */
  function quitGame() {
    stopTimers();
    gameId += 1;
    accepting = false;
    el.tiles.replaceChildren();
    el.feedback.textContent = '';
    show('start');
    el.start.focus();
  }

  function stopTimers() {
    cancelAnimationFrame(rafId);
    clearTimeout(timeoutId);
    clearTimeout(nextRoundId);
  }

  function tick() {
    const elapsed = performance.now() - roundStart;
    el.timer.textContent = `${(elapsed / 1000).toFixed(1)} s`;
    el.timebar.style.transform = `scaleX(${Math.min(1, elapsed / limitMs)})`;
    if (accepting) rafId = requestAnimationFrame(tick);
  }

  function onKey(e) {
    if (screens.play.hidden) return;
    if (e.key === 'Escape') { quitGame(); return; }
    if (!accepting) return;
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= rounds[current].items.length) {
      e.preventDefault();
      answer(n - 1);
    }
  }

  /* ---------- Tiles ---------- */

  function makeTile(round, item, index) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tile';

    if (round.type === 'text') {
      const p = document.createElement('p');
      p.className = 'tile__text';
      p.textContent = item;
      btn.appendChild(p);
      btn.setAttribute('aria-label', `Passage ${index + 1}`);
    } else {
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.alt || `Image ${index + 1}`;
      img.draggable = false;
      btn.appendChild(img);
    }

    const key = document.createElement('span');
    key.className = 'tile__key';
    key.textContent = index + 1;
    key.setAttribute('aria-hidden', 'true');
    btn.appendChild(key);

    btn.addEventListener('click', () => answer(index));
    return btn;
  }

  /* ---------- Results ---------- */

  function showResults() {
    const b = config.baseline;
    const correctCount = results.filter(r => r.correct).length;
    const accuracy = correctCount / results.length;
    const avgTime = results.reduce((sum, r) => sum + r.timeMs, 0) / results.length / 1000;

    // Share of average players you were faster than (assumes a bell-curve spread)
    const fasterThan = Math.round(
      (1 - normalCdf((avgTime - b.avgTimeSeconds) / b.timeSpreadSeconds)) * 100
    );

    // Exposed for playtesting: collect these to calculate a real baseline.
    window.__lastResults = { accuracy, avgTimeSeconds: avgTime, rounds: results.length };

    el.headline.textContent = `You found ${correctCount} of ${results.length}`;

    const maxTime = Math.max(avgTime, b.avgTimeSeconds) * 1.15;
    el.compare.replaceChildren(
      compareBlock('Accuracy', [
        ['You', accuracy, `${Math.round(accuracy * 100)}%`, 'you'],
        ['Average', b.accuracy, `${Math.round(b.accuracy * 100)}%`, 'avg']
      ]),
      compareBlock('Average time per round (shorter is faster)', [
        ['You', avgTime / maxTime, `${avgTime.toFixed(1)} s`, 'you'],
        ['Average', b.avgTimeSeconds / maxTime, `${b.avgTimeSeconds.toFixed(1)} s`, 'avg']
      ])
    );

    // Animate bars after they're on screen
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.compare.querySelectorAll('.compare__fill').forEach(f => {
        f.style.width = `${Math.round(Number(f.dataset.ratio) * 100)}%`;
      });
    }));

    el.summary.textContent = summaryText(accuracy, avgTime, fasterThan, b);

    const notes = [];
    if (b.isPlaceholder) notes.push('The average figures are placeholders until real data is added.');
    if (demoMode) notes.push('Demo mode: these are practice patterns, not real AI images. Add rounds in game-data.js.');
    el.note.textContent = notes.join(' ');

    show('results');
    el.headline.focus?.();
  }

  function compareBlock(label, rows) {
    const wrap = document.createElement('div');
    const title = document.createElement('div');
    title.className = 'compare__label';
    title.textContent = label;
    wrap.appendChild(title);

    rows.forEach(([name, ratio, valueText, kind]) => {
      const row = document.createElement('div');
      row.className = 'compare__row';
      row.innerHTML =
        `<span>${name}</span>` +
        `<span class="compare__track"><span class="compare__fill compare__fill--${kind}"></span></span>` +
        `<span class="compare__value">${valueText}</span>`;
      row.querySelector('.compare__fill').dataset.ratio = Math.max(0, Math.min(1, ratio));
      wrap.appendChild(row);
    });
    return wrap;
  }

  function summaryText(accuracy, avgTime, fasterThan, b) {
    const accDiff = Math.round((accuracy - b.accuracy) * 100);
    const timeDiff = Math.abs(avgTime - b.avgTimeSeconds).toFixed(1);

    const accPart = accDiff > 0
      ? `${accDiff} points more accurate than average`
      : accDiff < 0
        ? `${Math.abs(accDiff)} points less accurate than average`
        : 'exactly as accurate as average';

    const speedPart = avgTime < b.avgTimeSeconds
      ? `${timeDiff} s faster per round`
      : avgTime > b.avgTimeSeconds
        ? `${timeDiff} s slower per round`
        : 'right on the average pace';

    let text = `You were ${accPart}, and ${speedPart}. That’s quicker than about ${fasterThan}% of players.`;
    if (avgTime < b.avgTimeSeconds && accuracy < b.accuracy - 0.15) {
      text += ' Speed only counts if you’re right, though. Try slowing down and looking for the signs.';
    }
    return text;
  }

  /* ---------- Helpers ---------- */

  function show(name) {
    Object.entries(screens).forEach(([key, screen]) => (screen.hidden = key !== name));
    if (name !== 'start') {
      root.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    }
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Standard normal cumulative distribution (Abramowitz–Stegun approximation)
  function normalCdf(z) {
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp(-z * z / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z > 0 ? 1 - p : p;
  }

  /* ---------- Demo rounds (used only while GAME_ROUNDS is empty) ----------
     Each tile is a grid of dots. In the "AI" tile one dot is a ring.
     This lets you test timing and results before real content exists. */

  function makeDemoRounds(count) {
    const list = [];
    for (let r = 0; r < count; r++) {
      const n = 3 + (r % 2);            // alternate 3 and 4 tiles
      const aiIndex = Math.floor(Math.random() * n);
      const items = [];
      for (let i = 0; i < n; i++) {
        items.push({ src: demoSvg(i === aiIndex), alt: `Pattern ${i + 1}` });
      }
      list.push({ type: 'image', prompt: 'Demo: find the tile with one ring among the dots.', items, aiIndex });
    }
    return list;
  }

  function demoSvg(isOdd) {
    const size = 6, step = 100 / size;
    const oddCell = Math.floor(Math.random() * size * size);
    let shapes = '';
    for (let c = 0; c < size * size; c++) {
      const x = (c % size) * step + step / 2;
      const y = Math.floor(c / size) * step + step / 2;
      const rad = 4.5 + Math.random() * 1.5;
      shapes += (isOdd && c === oddCell)
        ? `<circle cx="${x}" cy="${y}" r="${rad}" fill="none" stroke="#1C2541" stroke-width="2"/>`
        : `<circle cx="${x}" cy="${y}" r="${rad}" fill="#1C2541"/>`;
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#DDE3EA"/>${shapes}</svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
});
