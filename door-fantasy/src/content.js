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

module.exports = {
  coastPlaces,
  burnLadder,
  peopleQuickRef,
  humanLineages,
  lineageNote,
  bloodlines,
  theSix,
  castPublic,
};
