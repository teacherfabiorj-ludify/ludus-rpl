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

  // WHO KEEPS THE COUNT. The GM announces the total at the debrief; the STUDENT
  // writes it on their own sheet and crosses one off each time they spend it.
  // The sheet field is the student's, not a mirror of the Panel — managing your
  // own resource out loud, in English, is part of the point.
  keptBy: "the student, on their own sheet",
  announcedBy: "the GM, once, at the debrief",
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

  keptBy: "the student, on their own sheet. It resets to three at the start of every session.",
};


// ---------------------------------------------------------------------------
// SIGNATURE MOVES — how many a character can have. Answering a real question:
// the sheet must have room for three, not one.
// ---------------------------------------------------------------------------
const signatureMoves = {
  perCharacter: 3,
  main:
    "One, and it comes with your Archetype. It upgrades in tiers at Growth Levels 3, 7 and 12.",
  crossTrainingAt: [5, 11],
  crossTrainingRule:
    "At Growth Level 5, and again at Growth Level 11, you may take the Tier 1 Signature Move of a " +
    "DIFFERENT Archetype and add it to your sheet permanently. It stays at Tier 1 forever — it never " +
    "upgrades. Twice in a career, and never from the same Archetype twice.",
  why:
    "Borrowed Moves give you range, not depth. The one that grows is the one you started with.",
};


// ---------------------------------------------------------------------------
// CHARACTER CREATION — the order, and who decides what.
// The Player's Guide walks one character through this; the Core Book prints
// the steps; the Master's Guide runs them at the table. One list, three views.
// ---------------------------------------------------------------------------
const characterCreationSteps = [
  ["1", "Name and world",
   "The student names the character. The Door decides the world, the peoples and the lineages available.",
   "student"],
  ["2", "People and lineage",
   "From the Door Section of the Player's Guide. This is setting, not mechanics — nothing here touches a die.",
   "student"],
  ["3", "Archetype",
   "Vanguard, Diplomat, Strategist or Scout. It sets the Kit and the Signature Move and nothing else.",
   "student"],
  ["4", "The Focus array",
   "Place +2, +1, +0 and −1, one in each Focus, in any order. This never changes again.",
   "student"],
  ["5", "Signature Move",
   "Comes with the Archetype, at Tier 1. The student does not choose it.",
   "given"],
  ["6", "Kit",
   "Comes with the Archetype and the Door, already written. The student does not choose it and never counts it.",
   "given"],
  ["7", "Money",
   "The same for everyone. Then one question, answered in English: where did it come from?",
   "given"],
  ["8", "Growth Level 1, and the sheet is done",
   "Three Spotlight Tokens, zero Language Points, an empty Pack and an empty Growth Ledger.",
   "given"],
];

const creationPrinciple =
  "Four decisions, four things handed over. A character is finished in about ten minutes, and " +
  "the ten minutes are spent on who the person is rather than on what the numbers do — because " +
  "there is nothing for the numbers to do.";


// ---------------------------------------------------------------------------
// PASSING THE LANTERN — the signature mechanic.
//
// The GM hands a piece of the world to a player to invent. What the player says
// becomes true. The name comes from the line that opens the Player's Guide:
// whoever holds the lantern decides what everybody else can see.
//
// The diegetic justification matters, because without it this reads as an
// exercise: the world on the far side of a Door is only fully formed where a
// traveller has already looked. Describing is not inventing. It is revealing.
// ---------------------------------------------------------------------------
const lanternSizes = [
  ["One Line",  "A sentence or two, answering a closed or multiple-choice question.", "10–20 seconds", "A1–A2"],
  ["One Place", "A full description of a place, a person or an object.",              "30–60 seconds", "A2–B1"],
  ["One Story", "Narrating a stretch of what happened, not only describing it.",      "1–3 minutes",   "B1 and up"],
];

const lanternRules = [
  ["Warn them first",
   "In the opening, say who will be holding the lantern tonight. Nobody is ambushed. A student " +
   "who was told in advance arrives with words ready, and that is rehearsal, not cheating."],
  ["Opportunity, not a stopwatch",
   "Every student gets the lantern at least once a session, and nobody gets it twice before " +
   "everybody has had it once. What is distributed is the invitation, never the minutes."],
  ["It becomes canon",
   "What was said is true and cannot be contradicted afterwards — not by another player and not " +
   "by the GM."],
  ["The GM adds, never erases",
   "There is no veto. You may ask ONE complicating question about what was said. Complicating is " +
   "accepting; correcting is taking the authorship back."],
];

const lanternScope = {
  may: [
    "Sensory detail of any place",
    "Minor NPCs and how they behave",
    "Their own character's past — home town, family, trade",
    "Local custom, food, festival, superstition",
  ],
  mayNot: [
    "Contradict the lore, or what another player created",
    "Remove a threat, solve the problem on the spot, or produce a resource that resolves it",
    "Say what another player's character did, thought or felt",
    "Create or alter an important NPC the adventure already has",
  ],
};

// ⚠ NAME COLLISION RESOLVED 17/09/2026. Until today "The Second Look" named two
// different rules: this one (the lantern passing twice) and the permission to
// redo your own sentence. The lantern keeps the name; the other is SAY IT AGAIN,
// below. See decisions.js.
const secondLook = {
  what:
    "Two lanterns over the same object: first the small size, to the student with less language; " +
    "then the large size, to the student with more.",
  rule:
    "The Second Look never contradicts the first. It deepens, explains, gives history. If it " +
    "contradicts, the GM cuts it off and points back at what is already true.",
  why:
    "Giving ten seconds to an A1 student in a scene of their own is kindness. Making those ten " +
    "seconds decide what the B2 student has to build on is structure. The beginner's sentence " +
    "becomes load-bearing.",
  example: [
    'GM: "There is a merchant behind the last stall. Lu, take the lantern. What does he look like?"',
    'Lu: "He is old. He is very tired and his clothes are dirty."',
    'GM: "An old man, tired, dirty clothes. Diego, second look. What does he regret?"',
    'Diego: "I think he used to have a bigger shop… he lost it… and he has been carrying that ever since."',
  ],
};

// THE FIVE RULES OF THE TABLE. Lifted into core 17/09/2026: two of them
// ("One Scene, One Voice" and "Yes, And") existed only inside the Player's
// Guide, the Quick Reference and the welcome sheet, which meant the Core Book
// printed three rules and the student's table sheet printed five. One list now,
// printed by every book that prints any of them.
const tableRules = [
  ["Mistakes Are How We Play",
   "Nobody is corrected in the middle of a scene. The correct form comes back inside the GM's " +
   "next line, in character, and you either pick it up or you do not."],
  ["One Scene, One Voice",
   "Let a player finish their thought before adding yours, even when your English comes out " +
   "faster than theirs. Joining someone's Move through Help or Interfere is the game; talking " +
   "over them mid-sentence is not."],
  ["Yes, And",
   "Build on what another player put into the story instead of shutting it down. If somebody " +
   "says there is a hidden door behind the bookshelf, find a way to make that true and add " +
   "something on top of it."],
  ["In Character, In English",
   "Everything you say as your character is in English, including the arguing, the joking and " +
   "the complaining — with the two permanent exceptions: stopping a scene, and asking for a word."],
  ["Say It Again",
   "Redo your own last line, better, whenever you want. No permission, no cost, no apology."],
];

// SAY IT AGAIN — the table's permission to redo your own last line. Named
// "The Second Look" until 17/09/2026, when that name went to the lantern rule
// above. This is a rule of the table, not of the lantern: it applies to any
// sentence, in any scene, whether or not a lantern is in play.
const sayItAgain = {
  what:
    "Any player may rewind their own last line and say it again, better, in English.",
  rule:
    "It costs nothing, it needs no permission and it is never refused. Nobody at the table " +
    "may treat it as a correction, and the player does not have to explain why.",
  why:
    "So that the instinct to fix a sentence has somewhere to go that is not an apology. A " +
    "student who cannot redo a line either leaves it wrong or stops to apologise for it, and " +
    "both of those cost more than the second attempt would have.",
  gmLine:
    "If a sentence comes out wrong and you want it again, just say it again. Nobody will stop " +
    "you and nobody needs to ask.",
};

// Where the lantern goes in a session, and who gets which size.
const lanternRhythm = {
  perSession: "Two to four passes, one every twenty to twenty-five minutes. Three to five minutes in total.",
  always: "The opening of Act I is ALWAYS a lantern. The place where the night begins is never described by the GM.",
  whoGetsWhichSize:
    "It comes from the preparation, not from instinct. A student on a Describe unit gets One Place; " +
    "on a Narrate unit, One Story; on a Regulate unit, the lantern is about local law — what is " +
    "forbidden here, and who enforces it.",
  codex:
    "One line per lantern, written by the GM right after the session. Four lines a week, thirty " +
    "seconds. After a year that is about a hundred and fifty lines of world written by the " +
    "students themselves, in English, about something they care about, at exactly their level.",
};


// ---------------------------------------------------------------------------
// ARCHETYPES AND THE GROWTH LADDER
//
// Lifted out of players-guide/src/build.js on 17/09/2026. It had been living
// inside the student's book, which made the Player's Guide a definer rather
// than a printer and left the Core Book unable to print the same tables
// without retyping them. Same law as everything else here.
// ---------------------------------------------------------------------------
const archetypes = [
  {
    name: "The Vanguard",
    concept: "Steps into danger first, shields the people behind them, acts when talk runs out.",
    array: [["Courage", "+2"], ["Instinct", "+1"], ["Empathy", "+0"], ["Wit", "−1"]],
    moveName: "Shield the Line",
    tiers: [
      ["Tier 1 — Level 1", "Shield the Line", "When you Face Danger to protect another character, on a 7–9 you choose the complication yourself instead of the GM."],
      ["Tier 2 — Level 3", "Shield the Line", "As Tier 1, and on a 10+ the character you protected may immediately take an action of their own before the scene moves on."],
      ["Tier 3 — Level 7", "Hold the Door", "As Tier 2, and once per session, when an ally would suffer a consequence from a Miss, you may take it in their place instead."],
      ["Tier 4 — Level 12", "Nothing Gets Past Me", "As Tier 3, and whenever you take a consequence in an ally's place, describe what it cost you out loud, in character, in English. What you describe becomes true of your character, and the GM writes it into the Codex — it will come back."],
    ],
  },
  {
    name: "The Diplomat",
    concept: "Reads what people actually want, negotiates instead of confronting, turns enemies into leverage.",
    array: [["Empathy", "+2"], ["Wit", "+1"], ["Instinct", "+0"], ["Courage", "−1"]],
    moveName: "Read the Room",
    tiers: [
      ["Tier 1 — Level 1", "Read the Room", "Before you decide what to offer in a Parley, you may ask your GM what the other party actually wants — they answer honestly."],
      ["Tier 2 — Level 3", "Read the Room", "As Tier 1, and you may instead ask what the other party is afraid of. Your choice, one question, answered honestly before you commit."],
      ["Tier 3 — Level 7", "Everyone Has a Price", "As Tier 2, and once per session you may reroll a Parley — the whole 2d6, re-adding your Focus, exactly as a Language Point would."],
      ["Tier 4 — Level 12", "Speak for the Table", "As Tier 3, and you may Parley on behalf of another player's character instead of your own, provided they narrate their half of the offer in English. Whatever you win, you win for both of you."],
    ],
  },
  {
    name: "The Strategist",
    concept: "Outthinks the problem before it becomes a fight — always three steps ahead, the clever one at the table.",
    array: [["Wit", "+2"], ["Instinct", "+1"], ["Empathy", "+0"], ["Courage", "−1"]],
    moveName: "Angles and Openings",
    tiers: [
      ["Tier 1 — Level 1", "Angles and Openings", "Once per session, after you roll Persuade or Manipulate, you may reroll the whole 2d6 and re-add your Focus."],
      ["Tier 2 — Level 3", "Angles and Openings", "As Tier 1, but twice per session instead of once."],
      ["Tier 3 — Level 7", "Already Knew That", "As Tier 2, and once per session you may ask your GM one question about the current scene without rolling Read the Scene. They answer honestly, at no cost."],
      ["Tier 4 — Level 12", "I Planned for This", "As Tier 3, and at the start of a session you may name one thing you expect to go wrong. If it does, every player at the table may reroll one 2d6 during that scene."],
    ],
  },
  {
    name: "The Scout",
    concept: "Notices danger before anyone else does, moves quiet, trusts their gut over their plan.",
    array: [["Instinct", "+2"], ["Courage", "+1"], ["Wit", "+0"], ["Empathy", "−1"]],
    moveName: "Nothing Slips By",
    tiers: [
      ["Tier 1 — Level 1", "Nothing Slips By", "Even on a Miss, Read the Scene still lets you ask one question — the GM just answers it in a way that costs you something."],
      ["Tier 2 — Level 3", "Nothing Slips By", "As Tier 1, and on a 10+ you may aim one of your questions at a scene that hasn't happened yet — somewhere your character is headed."],
      ["Tier 3 — Level 7", "One Step Ahead", "As Tier 2, and once per session, when a scene opens, you may say what your character was already doing there before anyone else arrived. The GM works it into the opening."],
      ["Tier 4 — Level 12", "Follow Me", "As Tier 3, and you may bring one other player's character with you — they were there too. They describe what they saw, in English, before the scene moves on."],
    ],
  },
];

// What an Archetype does and does not decide. The `array` above is a suggestion
// the student may ignore: the Archetype itself sets the Kit and the Signature
// Move and nothing else, and the student places +2/+1/+0/−1 wherever they like.
const archetypePrinciple =
  "An Archetype sets two things: the Kit the character always carries, and the Signature Move " +
  "they start with. It does not set a Focus. The array printed beside each one is a suggestion " +
  "that fits the concept — the student is free to place the four numbers anywhere, and nothing " +
  "in the system penalises them for it.";

// The full career ladder. 12 Growth Levels, 11 Growth Moments between them.
//
// ⚠ REWRITTEN 17/09/2026 to match Core Book ch.10, which is the authority.
// The version that stood here until today came out of an old Player's Guide and
// said three things the Core Book does not: a Boon only on even levels, a FOCUS
// SHIFT at Level 9, and a CAPSTONE with a LEGACY BOON at 72 units. The Core Book
// says a Boon at EVERY Growth Moment, and "Never: a Focus, a die, a flat bonus
// of any kind." The ladder runs 1 to 12 and stops there. See decisions.js.
const growthLadder = [
  ["Level 1",  "the day you sit down", "Archetype, Focus array, Signature Move at Tier 1."],
  ["Level 2",  "6 units",  "A Boon."],
  ["Level 3",  "12 units", "A Boon — and your Signature Move steps up to Tier 2."],
  ["Level 4",  "18 units", "A Boon."],
  ["Level 5",  "24 units", "A Boon — and Cross-Training."],
  ["Level 6",  "30 units", "A Boon."],
  ["Level 7",  "36 units", "A Boon — and your Signature Move steps up to Tier 3."],
  ["Level 8",  "42 units", "A Boon."],
  ["Level 9",  "48 units", "A Boon."],
  ["Level 10", "54 units", "A Boon."],
  ["Level 11", "60 units", "A Boon — and Cross-Training."],
  ["Level 12", "66 units", "A Boon — and your Signature Move steps up to Tier 4."],
];

const growthKinds = [
  ["Boon", "A narrative gain, defined by you and your GM out of what has already happened in your story: an item, an ally, a place that will open its door to you, a reputation that precedes you. A Boon can open a door, change a fact, or give your GM a reason to say yes. It never adds a number to a roll. One at every Growth Moment, without exception."],
  ["Signature Move tier", "Your Archetype's Signature Move, rewritten sharper. The new tier replaces the old text on your sheet. You always have exactly one Archetype Signature Move, at every level, from Level 1 to Level 12."],
  ["Cross-Training", "Take the Tier 1 Signature Move of a different Archetype and add it to your sheet permanently. It stays at Tier 1 forever — it never upgrades. You may do this twice in a career, and never from the same Archetype twice."],
];

const guardrails = [
  ["You start at Level 1. Everybody does.", "Your Growth Level does not come from how good your English already is. A student who joins at a high level and a student who joins from zero both sit down at Level 1, with no Boons. What you knew before you got here is not something this table gets to reward — only what you do after."],
  ["Your Focus array never changes.", "You place +2, +1, +0 and −1 once, at character creation, and that is where they stay for the life of the character. Nothing on the ladder moves them, raises them or swaps them. A Level 12 character and a Level 1 character roll against exactly the same odds. This is the promise from Chapter 2, kept all the way to the end of the track."],
  ["You only ever have one Archetype Signature Move.", "Tiers replace each other. Your sheet at Level 12 is not four Moves deep — it is one Move, four times sharper."],
  ["Cross-Training stays at Tier 1, twice, forever.", "Borrowed Moves give you range, not depth. Two of them, from two different Archetypes, and neither one ever upgrades."],
  ["Nothing may add a flat bonus to a roll.", "No growth in this game ever hands you a +1, and neither does anything else. There is no exception anywhere in this book. What effort buys you is a reroll — a second chance at the same dice — never better dice."],
  ["One session is still one session.", "Almost every Signature Move is once per session. A Level 12 character holding three once-per-session tools still only gets three moments of leverage in a two-hour game. What grows is the number of interesting choices, not the size of the numbers."],
];


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
  languagePoints, spotlightTokens, signatureMoves,
  characterCreationSteps, creationPrinciple,
  lanternSizes, lanternRules, lanternScope, secondLook, sayItAgain, lanternRhythm,
  tableRules,
  archetypes, archetypePrinciple, growthLadder, growthKinds, guardrails,
  laws,
};
