/* =========================================================
   GAME CONTENT AND SETTINGS
   This is the only file you need to edit to change the game.
   ========================================================= */

const GAME_CONFIG = {
  // How many rounds per game. If you have more rounds than this,
  // a random selection is used each time, so replays feel different.
  roundsPerGame: 7,

  // Seconds before a round times out (counts as a miss).
  // Practice mode has no time limit.
  timeLimitSeconds: 15
};

/* ---------------------------------------------------------
   ROUNDS
   Each round shows 2 to 4 items. Exactly one is AI-generated.

   Image round:
   {
     type: 'image',
     prompt: 'Which photo was made by AI?',        // optional
     items: [
       { src: 'assets/game/round1-a.jpg', alt: 'A street market at dusk' },
       { src: 'assets/game/round1-b.jpg', alt: 'A street market in the rain' },
       { src: 'assets/game/round1-c.jpg', alt: 'A crowded street market' }
     ],
     aiIndex: 2,          // position of the AI item, counting from 0
     explain: 'Look at the shop signs: the lettering is nonsense.'
   }

   Text round:
   {
     type: 'text',
     prompt: 'Which passage was written by AI?',
     items: [ 'First passage…', 'Second passage…' ],
     aiIndex: 0,
     explain: 'One sentence about the clue that gives it away.'
   }

   Every round needs an "explain" sentence: it is shown after the player
   answers, so they learn the clue (for example "Look at the hands: the
   fingers merge together."). Audio rounds are not supported yet.

   Keep images small (around 600 x 600 px, under 150 KB, JPG or WebP)
   and put them in assets/game/.

   While this list is empty, the game runs in demo mode with
   generated pattern tiles so you can test how it works.
   --------------------------------------------------------- */

const GAME_ROUNDS = [
  // Add rounds here.
];
