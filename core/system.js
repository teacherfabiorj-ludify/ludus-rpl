// ============================================================================
// LUDUS — SYSTEM DATA
//
// The ONE source of truth for every rule, number and ladder that appears in
// more than one document. Imported by:
//
//   core-book/src/build.js          → prints ALL of it
//   players-guide/src/build.js      → the student's book
//   players-guide/src/quickref.js   → the table sheet
//   players-guide/src/howitworks.js → the welcome sheet
//   masters-guide/src/build.js      → the GM's book
//
// THE LAW OF THIS REPOSITORY: no build.js may define a rule, a term or a
// number. Books hold prose, examples and layout. This file holds the truth.
// A definition found inside a build script is a defect.
// ============================================================================

const moves = [
  {
    name: "Act Under Pressure",
    focus: "Instinct",
    trigger: "when you have to act fast, with no time to think it through.",
    strong: "You do exactly what you meant to do.",
    mixed: "You do it — but pick one: you hesitate, you're off-balance, or you reveal more than you wanted to.",
    miss: "You freeze, panic, or act on the wrong instinct. The GM decides what happens next.",
  },
  {
    name: "Face Danger",
    focus: "Courage",
    trigger: "when you step into harm's way, on purpose, to get something done.",
    strong: "You handle it — clean, no cost.",
    mixed: "You handle it — but pick one: you get hurt, you lose something, or you have to make a hard choice right now.",
    miss: "The danger wins this round. The GM makes a move against you.",
  },
  {
    name: "Read the Scene",
    focus: "Instinct",
    trigger: "when you stop and look closely at a person, place, or situation before acting.",
    strong: "Ask the GM two questions from the list below. They must answer honestly.",
    mixed: "Ask one question from the list.",
    miss: "The GM asks you a question instead — and you have to answer it out loud, in English.",
    note: "Questions: What's really going on here? What should I watch out for? Who's really in control here? What here isn't what it looks like?",
  },
  {
    name: "Persuade or Manipulate",
    focus: "Wit",
    trigger: "when you work an angle on someone — flattery, logic, a clever half-truth.",
    strong: "They buy it. They do what you want.",
    mixed: "They're close — but they want something from you first.",
    miss: "They catch on. Now they trust you less.",
  },
  {
    name: "Parley",
    focus: "Empathy",
    trigger: "when you make a direct request, backed by something they actually want or need from you.",
    strong: "They give you what you asked for — or a fair trade.",
    mixed: "They'll do it, but there's a catch: a smaller ask, a delay, a condition.",
    miss: "No deal. And they remember you tried.",
  },
  {
    name: "Help or Interfere",
    focus: "Empathy",
    trigger: "when you jump in to support — or block — another player's Move, before the dice are rolled.",
    strong: "They roll with +1. Nothing bad happens to you.",
    mixed: "They roll with +1 — but now you're caught up in it too.",
    miss: "You get in the way instead. They roll with −1.",
  },
];

const priceExamples = [
  ["A hot meal, a bed for the night", "a coin"],
  ["A good rope, a lantern, a warm coat", "a coin"],
  ["A decent weapon, a week of lodging", "a handful"],
  ["A horse, a forged document, a bribe that works", "a bag"],
  ["A house, a ship, a name that opens doors", "a chest"],
];

const distanceLadder = [
  ["Within reach", "Close enough to touch. You can hand something over, or grab it."],
  ["Nearby", "Same room, a few steps away. You can speak normally and be heard."],
  ["Far away", "Across the hall, the street, the clearing. You have to move to get there."],
  ["Out of sight", "Behind a door, around the corner, gone. You cannot act on it at all."],
];

// The four Focuses. NOTE: assets/make_figures.py draws the same four names and
// subtitles into focus_cards.png. Python cannot require a JS file, so if a
// Focus subtitle ever changes it must change in both places — they are listed
// here so at least the two are side by side in one commit.
const focuses = [
  ["Courage",  "Direct action, physical, confrontation",
   "You step toward danger instead of away from it."],
  ["Empathy",  "Social connection, persuasion, reading people",
   "You deal with another person directly."],
  ["Wit",      "Problem-solving, cleverness, investigation",
   "You outthink the situation."],
  ["Instinct", "Perception, reaction, reflex",
   "You have to trust your gut, right now."],
];

// The three outcome bands, in the colours they carry everywhere in this system.
const outcomeBands = [
  ["10+", "good",  "Strong Hit",   "You get what you wanted. No cost."],
  ["7–9", "warn",  "Mixed Result", "You get it, but it costs you something — the Move says what."],
  ["6−",  "crit",  "Miss",         "It does not work. The GM makes a move against you."],
];

// ---------------------------------------------------------------------------
// MONEY — the four rungs. Locked 15/09/2026.
//
// The ladder is DESCRIPTIVE, not arithmetic. It answers "what does this rung
// buy", never "how much do I have". Ten of each makes one of the next, and
// that conversion is a fallback the table should almost never need to say out
// loud: arithmetic is the one moment at the table when nobody is speaking
// English. Prices are spoken in steps. Nothing costs one hundred and
// thirty-seven of anything.
// ---------------------------------------------------------------------------
const moneyLadder = [
  ["A coin",    "A meal, a bed for the night, a good rope."],
  ["A handful", "Ten coins. A decent weapon, a week of lodging. Enough to matter for a week."],
  ["A bag",     "Ten handfuls. A horse, a forged document, a bribe that works."],
  ["A chest",   "Ten bags. A house, a ship, a name that opens doors. The ceiling."],
];

// Everyone starts the same. Locked 15/09/2026, for the same reason everyone
// starts at Growth 1: nothing at the start may advantage one student over
// another. Rolling for it would plant a grievance in the exact session where
// buy-in is being built, and buy nothing.
const startingMoney = {
  amount: "three handfuls",
  equalForAll: true,
  // Asked of every player in Session Zero, answered in English. It costs
  // nothing and gives identical money a personal history.
  question: "Where did this money come from?",
};

// ---------------------------------------------------------------------------
// WHAT YOU CARRY
// ---------------------------------------------------------------------------
const carryRows = [
  ["Kit",   "Four or five items from your Archetype and setting. Always with you. Never tracked, never counted. Does not use slots."],
  ["Pack",  "Six slots for everything you have gathered since the story began. One thing per slot, whatever its size."],
  ["Boons", "Earned at Growth Moments only. No slots. Narratively strong. They follow you into new worlds."],
  ["Money", "A coin, a handful, a bag, a chest. Ten of each makes one of the next. You start with three handfuls."],
];

const PACK_SLOTS = 6;

// The rule that is the entire reason slots exist in a language class.
const packFullRule =
  "When your Pack is full and you want something new, say out loud — in English — " +
  "what you are leaving behind and where you are leaving it. Then take the new thing.";

// ---------------------------------------------------------------------------
// THE TABLE ECONOMY — Language Points and Spotlight Tokens
// Locked 15/09/2026. This replaces the earlier design in which Language Points
// were awarded on the spot and spent in the same session, and in which a
// separate "Homework Bonus" added a flat +1 to a roll. Both are retired.
// ---------------------------------------------------------------------------

const languagePoints = {
  // Counted once, out loud, in the closing block of the session. What you earn
  // tonight is what you carry into NEXT week's table. Nothing banks further
  // than that: unspent points are gone when that session ends.
  countedAt: "the closing block of the session",
  spendableAt: "the next session",
  carriesForward: false,

  earn: [
    ["Homework done before the session",            "1 point"],
    ["You used your Language Focus in a scene",     "1 point"],
    ["You gave your one-minute presentation",       "1 point — only in a B or D session"],
  ],

  // THE LAW OF THE ATTEMPT. Without this rule the strongest English earns the
  // most rerolls and the system quietly punishes the beginner — which breaks
  // the law that nothing about your English level touches your dice.
  lawOfTheAttempt:
    "The point is paid for the attempt, never for the result. If you reached for the " +
    "structure you are working on and it came out crooked, you earned it. Getting it " +
    "right is better. It is not what is being paid for.",

  spend: "Reroll one 2d6 you have already rolled for a Move. Re-add your Focus and read the new total, even if it is worse. One point, one reroll.",
  maxPerSession: 3,
};

const spotlightTokens = {
  start: 3,
  resetsEverySession: true,
  carriesForward: false,
  maxPerScene: 1,        // locked 15/09/2026 — without this the brake is spent in scene one
  transferable: true,    // locked 15/09/2026

  spend: "Claim an extended turn — a bigger beat that is fully yours, for as long as it takes to play it out. The GM slows down and gives you the scene.",

  transferRule:
    "You may hand a token to another player, saying in English why you want to hear from them. " +
    "A given token is spent by its new owner in the same session.",

  outOfTokensRule:
    "Running out never means silence. You lose the right to claim a scene, not the right to play. " +
    "You speak whenever the GM turns to you, like everybody else.",

  // Why it exists, in one line, for the GM.
  purpose:
    "The GM distributes the invitation, not the minutes. Tokens are the brake on the player " +
    "who would take every scene, and the invitation the quiet player can hand across the table.",
};

// ---------------------------------------------------------------------------
// THE LAWS — the non-negotiables, numbered. Printed in the Core Book, quoted
// in the Player's Guide and the Master's Guide.
// ---------------------------------------------------------------------------
const laws = [
  ["Nothing changes the dice.",
   "Not your Kit, not a Boon, not a chest full of gold, not your Growth Level, not your English. " +
   "There is no flat +1 anywhere in this system and there never will be."],
  ["Two clocks, never synchronised.",
   "The campaign runs on the table's clock. The coursebook trail runs on each student's own. " +
   "Four players on four different units is the normal state of a healthy table."],
  ["Everyone starts at Growth 1.",
   "Growth Level is time at the table, not proficiency. A C1 speaker and an A1 speaker sit down " +
   "at the same level. There is no formula converting one into the other."],
  ["Distribute the invitation, not the minutes.",
   "The GM's job is to make sure everyone is asked, not to hold a stopwatch. Spotlight Tokens " +
   "are what the table uses to correct itself when someone takes more than their share."],
  ["The point is paid for the attempt.",
   "A student who reaches for the target structure and mangles it has done the thing the system " +
   "is built to reward. Accuracy is better. It is not the price of entry."],
  ["English at the table, with two conscious exceptions.",
   "Safety, and a word nobody can find. Everything else is played in English, including the " +
   "arguing, the joking and the complaining."],
  ["Nothing above 13+.",
   "Tone ceiling for every Door, every arc and every NPC. It is a design constraint, not a warning label."],
];

module.exports = {
  moves, priceExamples, distanceLadder, focuses, outcomeBands,
  moneyLadder, startingMoney, carryRows, PACK_SLOTS, packFullRule,
  languagePoints, spotlightTokens, laws,
};
