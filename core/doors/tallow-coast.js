// ============================================================================
// LUDIFY RPL — THE TALLOW COAST — SHARED SETTING DATA
//
// This file is the ONE source of truth for every reference TABLE about the
// Tallow Coast that appears in more than one book.
//
//   players-guide/src/build.js  requires it -> renders it in the Door Section
//                                 the STUDENTS read
//   door-fantasy/src/build.js   requires it -> renders it in Appendix B, the
//                                 GM's quick reference
//
// WHY THIS FILE EXISTS
// Prose is not duplicated between the two books — the Player's Guide describes
// the world, and the Door Book explicitly refuses to describe it again. But
// the TABLES are needed in both, and a table that disagrees with itself across
// two books is the exact failure this project cannot afford: the student is
// the one who finds it.
//
// RULE: never retype one of these tables into a build script. Import it.
// If a people, a lineage, a rung or a god changes, it changes HERE, once, and
// both books are rebuilt.
//
// EVERYTHING IN THIS FILE IS PUBLIC. Students read all of it. Secrets live in
// door-fantasy/src/build.js and never enter this file — that way it is
// impossible to leak a secret into the students' book by accident.
// ============================================================================

// ---------------------------------------------------------------------------
// THE COAST — the three cities, the road, and what is past the road
// ---------------------------------------------------------------------------
const coastPlaces = [
  ["Ashlight", "A walled city on the coast road",
   "Trade, a gate that checks papers, and a guild that will vouch for you if it likes you. Everyone knows everyone, which is either comfortable or unbearable depending on the week."],
  ["Bellmoor", "The middle of the road, and the largest",
   "Richer, louder, and the seat of the Concord in this region. If a decision is being made about the coast, it is being made here."],
  ["Saltgate", "The last city before the road ends",
   "A port. Ships, salt, and a great deal of cargo nobody asks about. People who want to stop being asked questions come here."],
  ["The road", "Days, not hours, between cities",
   "Patrolled badly. Villages, farms and shrines line it, and none of them are on any map you can buy."],
  ["Inland", "Where the road gives up",
   "Nobody goes. This is where the Hush is."],
];

// ---------------------------------------------------------------------------
// THE BURN LADDER — four rungs, same shape as the money and distance ladders
//
// NOT a dice modifier. It says what is possible and what is permitted, never
// what is likely. Zero +1, ever.
// ---------------------------------------------------------------------------
const burnLadder = [
  ["a spark", "No paper at all", "Light it, warm it, find something you dropped. Anyone may."],
  ["a taper", "A plain Warrant", "Set a broken bone. Lock a door so that it stays locked."],
  ["a lantern", "A sealed Warrant", "Turn the weather. Bring down a wall. Somebody signs to answer for you."],
  ["a pyre", "Nobody is licensed", "There is no Warrant for this, and there has not been for eighty years."],
];

// ---------------------------------------------------------------------------
// THE FIVE PLAYABLE PEOPLES
//
// LAW: no inner characteristic touches the dice. Every one of them grants
// PERCEPTION or NARRATIVE PERMISSION — that is, it gives the student something
// to SAY. Nothing you are changes the dice.
// ---------------------------------------------------------------------------
const peopleQuickRef = [
  ["Human", "Kinship Everywhere",
   "Name one distant relation or old acquaintance wherever you go. They are not obliged to help. Once per arc."],
  ["Wickborn", "The Old Sense",
   "You feel that burning has happened nearby, and roughly how much. Never who, never why, never what it did."],
  ["Greenkept", "Green Memory",
   "You can tell how long a place has been as it is — older, younger, about the same. Never a date."],
  ["Duskborn", "Nightsight",
   "You see in poor light as others see at dusk. Full daylight tires your eyes within the hour."],
  ["Hybrid", "The Animal's Gift",
   "One sense or one fact of your body, taken from your animal and written by you in a single sentence."],
];

// ---------------------------------------------------------------------------
// HUMAN LINEAGES — where the family came from and what it did.
// NEVER appearance. The printed note below travels with the table.
// ---------------------------------------------------------------------------
const humanLineages = [
  ["Emberkin", "The foundry towns of the inland hills",
   "Endurance and metal. They judge a blade by looking at it and a wall by putting a hand on it. Half the smiths on the coast learned from an Emberkin, and all of them will tell you so."],
  ["Tidebound", "The Tallow Coast itself",
   "Sailors, traders, harbour clerks, gatekeepers. They read weather and water, and they are the people most likely to have an opinion about the Concord."],
  ["Roadborn", "Caravan families, no fixed city",
   "They have heard most dialects on the coast and know which roads flood. Welcome everywhere for a week, and suspected everywhere by the third."],
  ["Stonewake", "Descended from those who left the fourth city before it stopped",
   "Eighty years of being asked about it. They are uneasy in places that are too quiet, and they do not think that is superstition."],
  ["Fenfolk", "The inland wetlands",
   "Herbalists, midwives, bone-setters. Where the Concord has licensed nobody, a Fenfolk healer is what stands between a village and the burying ground."],
];

const lineageNote =
  "Lineage is where your family came from and what it did — it is not what you look like. " +
  "Skin, hair, height and features vary inside every lineage on this coast. Decide how your " +
  "character looks because that is the character you want to play, not because a table told you to.";

// ---------------------------------------------------------------------------
// BLOODLINES — a line on the sheet, not a people
// ---------------------------------------------------------------------------
const bloodlines = [
  ["Elf-touched", "An elven ancestor two or three generations back. Eyes that catch light, a slightly longer life, or one thinned-out thread of an elven sense. Elves consider you human."],
  ["Orc-blooded", "Broader shoulders, fast recovery, and a temper that arrives before you do. In a crowded room people make way without deciding to. Useful now and then, tiring the rest of the time."],
];

// ---------------------------------------------------------------------------
// THE SIX — gods who made the world and left
//
// They answer no prayers and send no signs. Nobody has ever had to choose
// between them. What they generate is not miracle: it is IDIOM, repeated at
// the table every week.
// ---------------------------------------------------------------------------
const theSix = [
  ["The Wright", "Making, craft, building, repair",
   "Said of anything well made, and of anyone you hope will last. “Wright's hands on it.” · “May the Wright hold this roof.”"],
  ["The Ferryman", "Roads, sea, travel — and death, which is only the last of these",
   "Said to someone leaving and said at a graveside, in the same words. Nobody finds that strange. “Ferryman keep you.” · “He's gone to the water.”"],
  ["The Ledger", "Trade, debt, oath, law",
   "The god of the Concord's world, whether the Concord admits it or not. “On the Ledger.” · “That's written, then.”"],
  ["The Green Mother", "Growth, harvest, birth, healing",
   "Said over food, over children, and over anyone who is ill. “Mother's luck to you.” · “Green on your table.”"],
  ["The Watcher", "Knowledge, memory, records, secrets",
   "Said when a truth is hidden, and said pointedly when someone is lying to your face. “The Watcher knows.” · “Well — someone remembers.”"],
  ["The Stranger", "Chance, change, luck, whatever was not planned",
   "Said when something unexpected happens, good or bad. The only one of the Six people speak to casually. “Stranger's turn.”"],
];

// ---------------------------------------------------------------------------
// THE CAST — the six recurring NPCs, PUBLIC face only.
//
// What each one is like to MEET. Their three states, what they know and what
// they are hiding lives in the Door Book, Chapter 3, and never here.
// ---------------------------------------------------------------------------
const castPublic = [
  ["Oren", "Gatekeeper of Ashlight",
   "Tired and correct. Asks for papers, and asks again. Speaks in facts and rules."],
  ["Factor Bram Locke", "Guild agent",
   "Friendly and timed. Deadlines, commissions, promises. He is where work comes from."],
  ["Keeper Marrow", "The roadside shrine",
   "Old and patient. Keeps the stone with the names on it. Always marks what she saw against what she was told."],
  ["Warden Alder", "Concord inspector",
   "Polite, inflexible, and not a villain. He believes the licence is what stands between the coast and another Hush."],
  ["Envoy Calla Wren", "Speaks for the coast cities",
   "Never says no. Says “that would be difficult.” Every sentence has two readings."],
  ["Hesper Vane", "Burns without a licence",
   "Keeps a village alive on unlicensed tapers. Knows exactly what she is risking and does it anyway."],
];


// ---------------------------------------------------------------------------
// STARTING KITS — four or five things your Archetype always carries on THIS
// coast. Specific to the Door, which is why they live here and not in the
// rules chapters: a Scout behind the Cyberpunk Door carries a grapple line
// and a grey hoodie instead.
//
// LAW: a Kit never touches the dice. It never runs out, is never counted, and
// is never tracked. It exists so nobody has to wonder whether they have the
// obvious thing — and because an item already written in English is a sentence
// the student already knows how to start.
//
// Two of these were already printed in the Player's Guide (Diplomat in ch. 7,
// Scout in ch. 6) and are reproduced here verbatim. Do not reword them.
// ---------------------------------------------------------------------------
const archetypeKits = [
  ["Vanguard",
   "A shield · a heavy coat, mended more than once · a whistle that carries further than a shout · a name written down, in case you do not come back"],
  ["Diplomat",
   "A sealed letter · a silver ring · a warm cloak · a small mirror"],
  ["Strategist",
   "A folding map of the coast road · chalk and a length of string · a notebook and pencil · a key you have not explained to anyone"],
  ["Scout",
   "A rope · a knife · a lantern · a water bottle"],
];


// ---------------------------------------------------------------------------
// THE FOUR FLAMES  —  canon as of 20/09/2026
//
// Every person on this coast is BORN with one flame, and it never changes. It
// is not an object and not a possession; it is the shape a person's burning
// takes. It is invisible to everybody except a green flame, who can look at
// one person and see it.
//
// THE LAW OF COMPOSITION, and the reason this system exists:
//
//     THE COLOUR DECIDES WHAT KIND OF THING YOU CAN DO.
//     THE RUNG DECIDES HOW MUCH OF IT.
//
// Red always holds. At spark it holds what is in your hand for a moment; at
// taper it holds your own body or a patch you are touching; at lantern it
// holds a wall. That is one idea at three scales, not three powers — which is
// exactly the rung rule (core/doors/tallow-coast-world.js -> theRungRule)
// applied to a person instead of to an act.
//
// ⚠ FLAME IS NOT LINEAGE. A Wickborn can be any colour; so can a Greenkept.
// The two systems are orthogonal and must never be printed as one table.
//
// ⚠ FLAME IS NOT ARCHETYPE. The pairing below is a suggestion for a first
// character, nothing more. Any colour with any Archetype is legal.
//
// ⚠ FLAME IS NOT THE LANGUAGE FOCUS. The Language Focus rotates every lesson
// (core/method.js -> languageFocusRule). A flame never rotates.
//
// ⚠ THE NATIVE TAPER. The taper of your colour is the ONE taper a flame
// reaches with no trade behind it. Setting a bone, sealing a lock and reading
// the weather are still LEARNED tapers — ten years in a shop on Taper Row
// (see world.js -> learning). Same rung, different training. Do not collapse
// the two.
// ---------------------------------------------------------------------------
const flameLaw =
  "The colour decides what kind of thing you can do. The rung decides how much of it.";

const flames = [
  ["Red flame", "Courage",
   "Burning that HOLDS. Matter, endurance, the refusal of a thing to give way."],
  ["Yellow flame", "Empathy",
   "Burning that CARRIES. A feeling, a voice, a sentence — reaching a person who is not here."],
  ["Blue flame", "Wit",
   "Burning that READS WHAT WAS MADE. Objects, mechanisms, and the history left in them."],
  ["Green flame", "Instinct",
   "Burning that READS WHAT IS ALIVE. Bodies, weather, ground, and the flames inside people."],
];

// The floor everybody stands on, whatever their colour. This is the texture of
// the coast — the cook, the carter, the mother at three in the morning — and
// it must never be taken away from a player, or the world stops being the
// world the books describe.
const sparkFloor =
  "Whatever your colour, you can light it, warm it and find the small thing you "
  + "dropped. Everyone on this coast can. It is not worth a sentence at the table "
  + "unless it is worth a sentence in English.";

const flameSparks = [
  ["Red flame", "Steady",
   "Something you are touching stops shaking, stops slipping or stops moving for a "
   + "moment: a knot, a ladder, a cup on a moving cart, your own hand."],
  ["Yellow flame", "Reach",
   "One wordless feeling reaches one person you can see — wait, run, calm, not now. "
   + "No words, and they cannot answer."],
  ["Blue flame", "Last Hand",
   "Touch something somebody made and know the last thing that was done to it: "
   + "opened, mended, cleaned, forced, dropped."],
  ["Green flame", "Read",
   "Look at one living thing and know one plain fact about its state — hurt, afraid, "
   + "hungry, lying still. If it is a person, you also see the colour of their flame."],
];

const flameTapers = [
  ["Red flame", "Reinforce",
   "Part of your own body, or a small area of an inanimate object you are touching, "
   + "becomes far harder to break, cut, burn or bend. It ends the moment you stop touching it."],
  ["Yellow flame", "Message",
   "One sentence reaches one person you have met, wherever they are. They hear your "
   + "voice. They cannot answer, and you get one sentence."],
  ["Blue flame", "Imprint",
   "Touch something somebody made and learn one true fact about who made it, who has "
   + "carried it, or how it came apart. The GM chooses the fact, and it is always true."],
  ["Green flame", "Senses",
   "For a few seconds everything around you arrives at once and in full detail: the "
   + "sky turning, the set of the wind, the worn ground that says people pass here — "
   + "and the flame colour of every person in your field of vision."],
];

// Not reachable in Arc 1, and not reachable without a sealed Warrant and a
// named person who has signed to answer for you. Printed so the table can see
// what the ladder is FOR.
const flameLanterns = [
  ["Red flame", "Bulwark",
   "A whole structure holds — a gate, a hull, a bridge, a wall — with nobody touching it."],
  ["Yellow flame", "Assembly",
   "Your voice reaches everyone in one named place at once, and every one of them understands it."],
  ["Blue flame", "Testimony",
   "A room or an object replays what happened around it, in light and sound, for everyone present to watch."],
  ["Green flame", "Farsight",
   "A whole district or valley arrives at once: everything alive in it, and every flame in it."],
];

// The one-sheet version. Same four things, written short enough to sit on a
// Quick Reference a student holds during a scene. It is a SHORTENING of the
// tables above and must never say anything they do not; when one of them
// changes, this changes with it.
const flameQuickRef = [
  ["Red flame", "Courage",
   "Steady — what you touch stops shaking or slipping",
   "Reinforce — your body, or a patch you touch, becomes very hard to break"],
  ["Yellow flame", "Empathy",
   "Reach — one wordless feeling to one person you can see",
   "Message — one sentence to one person you have met, anywhere"],
  ["Blue flame", "Wit",
   "Last Hand — the last thing done to a made thing",
   "Imprint — one true fact about who made it, carried it, or broke it"],
  ["Green flame", "Instinct",
   "Read — one fact about one living thing, and a person's flame colour",
   "Senses — everything around you at once, and every flame in sight"],
];

// A first character only. Print it as help, never as a rule.
const flameSuggested = [
  ["Vanguard", "Red flame", "Courage +2"],
  ["Diplomat", "Yellow flame", "Empathy +2"],
  ["Strategist", "Blue flame", "Wit +2"],
  ["Scout", "Green flame", "Instinct +2"],
];
const flameSuggestedNote =
  "This is the easy first character, not a rule. A red-flame Scout and a green-flame "
  + "Diplomat are both legal, and both are more interesting. Take the suggestion for "
  + "your first character and break it for your second.";

// ---------------------------------------------------------------------------
// BURNING AT THE TABLE — the only rule in this file that touches dice.
//
// ⚠ This is NOT one of the six Moves and must never be printed as one. The six
// Moves are untouched. This is its own roll, and it is the only other 2d6 in
// the game.
// ---------------------------------------------------------------------------
const burningRoll = {
  spark:
    "A spark is never rolled. It is narrated, it is small, it cannot solve the scene, "
    + "and it costs nothing but a sentence in English.",
  taper: "Roll 2d6 and add the Focus that matches your flame.",
  bands: [
    ["10+", "Strong hit",
     "It happens exactly as you said it would."],
    ["7–9", "Mixed",
     "It happens, and the place pays more than you meant to spend, or something you "
     + "did not want comes with it. The GM says which."],
    ["6 or less", "Miss",
     "The burn fails — and the kindling is spent anyway. The place paid for nothing."],
  ],
  missNote:
    "The kindling is spent on a miss. That is not a punishment: it is the single most "
    + "important fact about burning on this coast, and it is how the table learns it.",
  languagePoints:
    "A Language Point may be spent to reroll a burning roll, exactly as it may be spent "
    + "to reroll a Move. Both dice are rerolled, never one.",
  charge:
    "One taper per SCENE, not per session. A scene can run for most of a session or "
    + "across two or three of them; the GM says when one ends, out loud, and your taper "
    + "comes back with the new scene.",
  warrant:
    "A taper is above a spark, so a taper without a Warrant is Burning Unanswered. It "
    + "works. Somebody will ask who answers for it.",
};

module.exports = {
  coastPlaces,
  burnLadder,
  peopleQuickRef,
  humanLineages,
  lineageNote,
  bloodlines,
  theSix,
  castPublic,
  archetypeKits,
  flameLaw,
  flames,
  sparkFloor,
  flameSparks,
  flameTapers,
  flameLanterns,
  flameQuickRef,
  flameSuggested,
  flameSuggestedNote,
  burningRoll,
};
