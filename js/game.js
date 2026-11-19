/* =========================================================
   Spot the AI image – find the AI-generated item in each round.
   Two modes:
     - Normal: a time limit per round, with your average time in the results.
     - Practice: no timer, no time limit and no speed result.
   After each answer the player reads the explanation and moves on with
   the "Next round" button (no automatic advance, WCAG 2.2.1).
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

  // Elements
  const screens = {
    start: root.querySelector('[data-screen="start"]'),
    play: root.querySelector('[data-screen="play"]'),
    results: root.querySelector('[data-screen="results"]')
  };
  const el = {
    roundCount: document.getElementById('game-round-count'),
    start: document.getElementById('game-start'),
    practice: document.getElementById('game-practice'),
    again: document.getElementById('game-again'),
    againPractice: document.getElementById('game-again-practice'),
    next: document.getElementById('game-next'),
    quit: document.getElementById('game-quit'),
    progress: document.getElementById('game-progress'),
    timer: document.getElementById('game-timer'),
    timebar: document.getElementById('game-timebar'),
    timebarTrack: document.getElementById('game-timebar-track'),
    prompt: document.getElementById('game-prompt'),
    tiles: document.getElementById('game-tiles'),
    feedback: document.getElementById('game-feedback'),
    headline: document.getElementById('results-headline'),
    stats: document.getElementById('results-stats'),
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
  let gameId = 0;           // increases on start/quit so stale async steps stop
  let practice = false;     // practice mode: no timer, no speed result

  el.start.addEventListener('click', () => startGame(false));
  el.practice.addEventListener('click', () => startGame(true));
  el.again.addEventListener('click', () => startGame(false));
  el.againPractice.addEventListener('click', () => startGame(true));
  el.next.addEventListener('click', nextRound);
  el.quit.addEventListener('click', quitGame);
  document.addEventListener('keydown', onKey);

  /* ---------- Flow ---------- */

  function startGame(isPractice) {
    stopTimers();
    gameId += 1;
    practice = isPractice;
    el.timer.hidden = practice;
    el.timebarTrack.hidden = practice;
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
    el.next.hidden = true;
    el.progress.textContent = practice
      ? `Practice round ${current + 1} of ${rounds.length}`
      : `Round ${current + 1} of ${rounds.length}`;
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
    if (!practice) {
      tick();
      timeoutId = setTimeout(() => answer(-1), limitMs);
    }
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
        ? (practice ? 'Correct.' : `Correct, in ${seconds} s.`)
        : `Not this one. The AI one was number ${round.aiIndex + 1}.`;
    if (round.explain) message += ' ' + round.explain;
    el.feedback.textContent = message;

    // The player moves on when ready, so there is time to read the explanation.
    el.next.textContent = current + 1 < rounds.length ? 'Next round' : 'See your results';
    el.next.hidden = false;
    el.next.focus({ preventScroll: true });
  }

  function nextRound() {
    if (accepting || screens.play.hidden) return;
    current += 1;
    if (current < rounds.length) playRound();
    else showResults();
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
    el.next.hidden = true;
    show('start');
    el.start.focus();
  }

  function stopTimers() {
    cancelAnimationFrame(rafId);
    clearTimeout(timeoutId);
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
    const correctCount = results.filter(r => r.correct).length;
    const accuracy = correctCount / results.length;
    const avgTime = results.reduce((sum, r) => sum + r.timeMs, 0) / results.length / 1000;

    el.headline.textContent = `You found ${correctCount} of ${results.length}`;

    // Only the player's own score. Practice mode has no speed result.
    const stats = [
      ['Correct answers', `${correctCount} of ${results.length}`],
      ['Accuracy', `${Math.round(accuracy * 100)}%`]
    ];
    if (!practice) stats.push(['Average time per round', `${avgTime.toFixed(1)} s`]);
    el.stats.replaceChildren(...stats.map(([label, value]) => {
      const wrap = document.createElement('div');
      const dt = document.createElement('dt');
      const dd = document.createElement('dd');
      dt.textContent = label;
      dd.textContent = value;
      wrap.append(dt, dd);
      return wrap;
    }));

    el.summary.textContent = accuracy >= 0.7
      ? 'Nice work. Keep using the same habits when you scroll: pause, zoom in and check the source.'
      : 'These are hard to spot, and that’s the point: no single clue proves an image was made by AI. ' +
        (practice ? 'Read the clue after each round, then try again.' : 'Try practice mode and read the clue after each round.');

    el.note.textContent = demoMode
      ? 'Demo mode: these are practice patterns, not real AI images. Add rounds in game-data.js.'
      : '';

    show('results');
    el.headline.focus?.();
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
      list.push({
        type: 'image',
        prompt: 'Demo: find the tile with one ring among the dots.',
        items,
        aiIndex,
        explain: 'Look closely at every dot: in the odd tile, one dot is an empty ring.'
      });
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
        ? `<circle cx="${x}" cy="${y}" r="${rad}" fill="none" stroke="#221B4B" stroke-width="2"/>`
        : `<circle cx="${x}" cy="${y}" r="${rad}" fill="#221B4B"/>`;
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#C8D1D9"/>${shapes}</svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
});
