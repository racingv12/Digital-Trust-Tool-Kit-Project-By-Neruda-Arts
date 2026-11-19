/* =========================================================
   GAME CONTENT AND SETTINGS
   This is the only file you need to edit to change the game.
   ========================================================= */

const GAME_CONFIG = {
  // How many rounds per game. 'all' plays every round below (one per
  // photo pack). A number plays a random selection of that many.
  roundsPerGame: 'all',

  // Seconds before a round times out (counts as a miss).
  // Practice mode has no time limit.
  timeLimitSeconds: 15
};

/* ---------------------------------------------------------
   ROUNDS
   One round per photo pack. Each round shows 2 to 4 items and exactly
   one is AI-generated. The game shuffles the order of the rounds and the
   position of the photos each time, so the AI one isn't always in the
   same place.

   Image round:
   {
     type: 'image',
     prompt: 'Lake: which photo was made by AI?',   // optional
     items: [
       { src: 'assets/game/lake-1.jpg', alt: 'Short description' },
       ...
     ],
     aiIndex: 1,          // which item is the AI one, counting from 0
     explain: 'One sentence about the clue that gives it away.'
   }

   Text rounds are also supported (type: 'text', items are strings).
   Audio rounds are not supported yet.

   Photos: Google Drive › Real:AI, resized to 1000 px and saved in
   assets/game/ (metadata such as location removed). Name files by pack
   and number (lake-1, lake-2…), never "ai" or "real", because the file
   name can be seen in the browser.

   The "explain" sentences are drafts: check that each clue is right
   before publishing.
   --------------------------------------------------------- */

const GAME_ROUNDS = [
  {
    type: 'image',
    prompt: 'Lake: which photo was made by AI?',
    items: [
      { src: 'assets/game/lake-1.jpg', alt: 'A dock on a sandy lake shore under a cloudy sky' },
      { src: 'assets/game/lake-2.jpg', alt: 'A wooden dock on a lake shore with forest and canoes' },
      { src: 'assets/game/lake-3.jpg', alt: 'Close-up of rippling lake water' }
    ],
    aiIndex: 1,
    explain: 'Look at the dock: some posts stand alone in the water without holding anything up, and the frame underneath doesn’t quite line up.'
  },
  {
    type: 'image',
    prompt: 'Sky: which photo was made by AI?',
    items: [
      { src: 'assets/game/sky-1.jpg', alt: 'White and grey clouds in a blue sky' },
      { src: 'assets/game/sky-2.jpg', alt: 'A sunset over a lake with a city skyline in the distance' },
      { src: 'assets/game/sky-3.webp', alt: 'Pink and grey clouds at sunset above a line of trees' }
    ],
    aiIndex: 2,
    explain: 'AI is very good at skies, so this one is hard. Zoom in: the cloud edges look soft and painted, and the trees and poles along the bottom have little real detail.'
  },
  {
    type: 'image',
    prompt: 'Food: which photo was made by AI?',
    items: [
      { src: 'assets/game/food-1.webp', alt: 'A broken chocolate chip cookie on baking paper' },
      { src: 'assets/game/food-2.jpg', alt: 'Close-up of strawberries on a wooden board' },
      { src: 'assets/game/food-3.jpg', alt: 'A bowl of ice cream next to a slice of chocolate cake' }
    ],
    aiIndex: 0,
    explain: 'Everything looks a little too perfect: glossy melted chocolate, evenly scattered crumbs and a smooth, dreamy blur. AI food photos often look like an ad.'
  },
  {
    type: 'image',
    prompt: 'Living room: which photo was made by AI?',
    items: [
      { src: 'assets/game/room-1.jpg', alt: 'A dim room with a blanket on a sofa, a framed picture and a window' },
      { src: 'assets/game/room-2.jpg', alt: 'A striped sofa below a large framed tapestry' },
      { src: 'assets/game/room-3.jpg', alt: 'An armchair with a blanket beside a table of books and a lamp' }
    ],
    aiIndex: 2,
    explain: 'Zoom in on the book spines: the titles are made-up letters that don’t spell real words.'
  },
  {
    type: 'image',
    prompt: 'Dolls: which photo was made by AI?',
    items: [
      { src: 'assets/game/dolls-1.jpg', alt: 'A doll with red hair sitting on a wooden box beside coins' },
      { src: 'assets/game/dolls-2.jpg', alt: 'A row of dolls around a table covered in coins' },
      { src: 'assets/game/dolls-3.jpg', alt: 'A doll in a cardigan, lit with warm yellow light' }
    ],
    aiIndex: 0,
    explain: 'Look at the background: the half-hidden doll peeking over the box and the small objects on the table don’t quite make sense up close.'
  },
  {
    type: 'image',
    prompt: 'Portraits: which photo was made by AI?',
    items: [
      { src: 'assets/game/people-1.jpg', alt: 'A smiling man in a white shirt in front of a stone wall' },
      { src: 'assets/game/people-2.webp', alt: 'A smiling man in a dark blazer in front of a blue background' },
      { src: 'assets/game/people-3.jpg', alt: 'A smiling woman in a yellow cardigan in front of a grey wall' }
    ],
    aiIndex: 1,
    explain: 'The skin is flawless, the lighting is perfectly even and the background is a generic studio blur. AI portraits often look like perfect stock photos, with no small imperfections.'
  }
];
