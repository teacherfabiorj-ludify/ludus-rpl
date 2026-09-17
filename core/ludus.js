// ============================================================================
// LUDUS — THE FRAME
//
// The hall, the Doors, the ritual of a session, the four-arc skeleton every
// campaign is built on, and what a Door Book must contain.
//
// This is setting-independent. A Door's own contents live in core/doors/.
// ============================================================================

// ---------------------------------------------------------------------------
// THE HALL
// ---------------------------------------------------------------------------
const theLudus = {
  what:
    "The hall the characters live in between worlds. Its doors open onto other worlds, and " +
    "each Door is a campaign. When a story ends, everyone comes back here.",
  why:
    "It gives the table a permanent home that survives a change of setting, a place for a new " +
    "student to arrive into, and a reason the same four people keep meeting. It is also the " +
    "name of the system, and in Latin it means both school and game.",
};

// The ritual. Locked 06/09/2026. It costs nothing and it does the work that a
// "right, let's begin" never does.
const sessionRitual = [
  ["Joining the call", "is entering the Ludus. You are yourself, in the hall, in English."],
  ["Crossing the Door", "is taking on your character. Everything after this is in the fiction."],
  ["Leaving through the Door", "is the end of the session. You are in the hall again."],
  ["The other Doors", "stay sealed, and need not even be mentioned at the start."],
];

// Character creation happens ON THE CROSSING, in Session Zero — not before it.
const creationMoment =
  "Characters are made at the Door, in Session Zero, as the table crosses for the first time. " +
  "Not in advance and not by homework: the crossing is what turns a sheet into somebody.";

// The five permanent residents. One per family of language Actions, which is
// why a GM who needs a Narrate scene knows whose door to knock on.
// Full portraits live in the Master's Guide; this book prints the map only.
const ludusCast = [
  ["Halden", "The Present", "Identify · Describe · Quantify · Ability & Progress"],
  ["Sable", "The Past", "Narrate · Report"],
  ["Piro", "The Future", "Plan"],
  ["Quill", "The Modals", "Regulate · Speculate · Suppose"],
  ["The Tenant", "The Functional", "Argue · React · Register & Nuance"],
];

// ---------------------------------------------------------------------------
// THE FOUR RELICS
// One whole campaign earns one relic. Four campaigns, four relics, four skills.
// ---------------------------------------------------------------------------
const relics = {
  four: ["Listening", "Speaking", "Reading", "Writing"],
  when: "Handed over at the end of Arc 3, on the defeat of the campaign's antagonist. Never earlier.",
  nature:
    "Purely narrative. A relic carries weight of history, memory and standing. It does not touch " +
    "the dice, and it never will — the same law as everything else a character can hold.",
  oneEach: "One campaign, one relic. The conversation about changing Door happens after that.",
};

// ---------------------------------------------------------------------------
// THE FOUR-ARC SKELETON — locked 06/09/2026, replacing an earlier three-arc
// spine that was specific to one setting. This one fits any Door.
// ---------------------------------------------------------------------------
const arcs = [
  ["Arc 1", "Introduce the world",
   "Places, people, friendships and enmities, local problems. The table ends the arc as local " +
   "heroes — with something larger approaching that they have only heard rumours of."],
  ["Arc 2", "The consequences, and the journey",
   "What they did in Arc 1 comes back. The threat arrives in force and breaks the local balance. " +
   "They travel after a resource the story needs, and they come back with it."],
  ["Arc 3", "The broken world, and the confrontation",
   "Repair the damage before the fight — this is where Arc 1's friendships pay out or come " +
   "collecting. Ends in the great confrontation, and in the handing over of the relic."],
  ["Arc 4", "Epilogue, with no deadline",
   "Unfinished personal business, consequences, farewells. It exists because a table that has " +
   "played for a year does not want to be told the story is over on a Tuesday."],
];

const arcResourceRule =
  "What the table goes after in Arc 2 is a NARRATIVE resource, specific to that campaign, and " +
  "it is not the relic. If the antagonist is a despot who conquered by military superiority, the " +
  "resource is the thing that cancels that superiority inside the story — and it has no mechanical " +
  "effect whatsoever.";

const arcLength =
  "About ten to twelve weeks an arc, measured in weeks rather than sessions — 'twelve sessions' " +
  "means two different things in a group that meets once and a group that meets twice. There is " +
  "not enough data yet to be more precise than that, and a Door Book that pretends otherwise is " +
  "inventing a number.";

// ---------------------------------------------------------------------------
// WHAT A DOOR BOOK MUST CONTAIN
// The assembly sheet. Every Door Book carries these, in this order, so a GM who
// has run one can open another and already know where things are.
// ---------------------------------------------------------------------------
const doorBookParts = [
  ["How to use this book", "What is locked, what is a choice, what the students may invent, what must never be said out loud."],
  ["The secret", "The one thing that is true about this world that the table does not know yet. GM only, always."],
  ["The cast in three states", "Every recurring NPC written three times: before the table meets them, after they are an ally, after they are an enemy."],
  ["The arcs", "Four, following the skeleton. Each arc is a handful of adventures, written as suggestions."],
  ["Each adventure", "Pitch · what must be true at the end · what to read aloud · three ways in · who is in it · the pressure ladder · what the table will probably try · the Action tags · the lantern · the omen · short version · long version · one line for the Codex."],
  ["The session grid", "A page that maps adventures onto weeks, for a GM who wants a default path."],
  ["Setting quick reference", "Peoples, places, money, distance, oaths — everything a student might ask mid-scene."],
];

const doorBookPrinciple =
  "Suggestions, never a script. The GM sets the pace of the campaign, not the book. A Door Book " +
  "is written for the week the teacher is tired or blocked: a safe path that works, clearly " +
  "marked as one option among many.";

// ---------------------------------------------------------------------------
// CHANGING A DOOR
// ---------------------------------------------------------------------------
const settingChange = {
  when: "The semester conversation, about twenty minutes in the last session of a semester.",
  what: "Are you happy? Do you want a different setting? Or keep this world and play a new campaign in it?",
  itIsAConversation:
    "Not a voting apparatus. Most tables answer it in five minutes and go back to playing.",
  voting:
    "A vote only happens once the table has decided to change world AND there are options on the " +
    "table. Then it is APPROVAL VOTING: each student marks every setting they would happily play. " +
    "Never one-vote-each, which produces a winner three people did not want.",
  whatTravels:
    "Same setting, the character travels whole. Different setting, the character is rebuilt at the " +
    "same Growth Level — about ten minutes — and the old one becomes an NPC at the table they left.",
  whatNever: "The trail. A student's coursebook position has never depended on the setting and never will.",
};

module.exports = {
  theLudus, sessionRitual, creationMoment, ludusCast,
  relics, arcs, arcResourceRule, arcLength,
  doorBookParts, doorBookPrinciple, settingChange,
};
