// ============================================================================
// LUDUS — METHOD DATA  ★ TRAIL LAYER
//
// Everything about how the language course runs through the game. This file
// and this file only knows that the coursebook exists.
//
// ★ Content marked TRAIL in the books is printed in purple with the ★ mark, so
//   a reader can see at a glance what depends on the coursebook. Swapping the
//   coursebook one day means rewriting THIS FILE and nothing else.
//
// Same law as system.js: no build script may retype any of this.
// ============================================================================

// The coursebook in use. One constant, so that the day it changes there is a
// single place to change it.
const COURSEBOOK = "Evolve";           // ★ Cambridge Evolve, levels 1–6
const COURSEBOOK_PLATFORM = "Cambridge One";
const TEST_NAME = "Unit Progress Test"; // ★
const PASS_MARK = 75;                   // ★ percent
const MAX_ATTEMPTS = 2;                 // ★ platform limit, not our choice

// ---------------------------------------------------------------------------
// THE TWO CLOCKS
// ---------------------------------------------------------------------------
const twoClocks = [
  ["The table's clock",
   "The campaign. Arcs, scenes, the story everyone shares. It moves once a week for everybody at the same rate."],
  ["Each student's clock",
   "The coursebook trail. Units, lessons, tests. It moves at the speed of one person's studying, and it is normal for four players to be in four different places."],
];

// ---------------------------------------------------------------------------
// THE LESSON CYCLE — A · B · C · D · X
// One coursebook unit has two lessons with different grammar. The cycle walks
// a student through both, twice each, and ends in the test.
// ---------------------------------------------------------------------------
const lessonCycle = [
  ["A", "Lesson 1 debuts", "The student meets the first topic in a scene for the first time.", "no"],
  ["B", "Lesson 1 again",  "Same topic. The student opens the session with a one-minute presentation of it.", "yes — 1 min"],
  ["C", "Lesson 2 debuts", "The second topic of the unit enters a scene for the first time.", "no"],
  ["D", "Lesson 2 again",  "Same topic, with a presentation. At the end of this session the GM releases the test.", "yes — 1 min"],
  ["X", "Extra session",   "Only if the pass mark was not reached. Revisits both topics of the unit.", "no"],
];

const cycleNotes = [
  "Nothing blocks the walk from A to D except the student missing a session.",
  "The cycle runs on each student's own clock. Misalignment across the table is the design, not a fault.",
  "After a pass, the student returns to A on the next unit.",
];


// ---------------------------------------------------------------------------
// SESSION FORMATS — how a group's timetable maps onto the cycle.
// Locked 16/09/2026.
//
// THE DISTINCTION THAT MATTERS: the cycle counts LESSONS, not meetings.
// A unit is always A · B · C · D (+ X), whatever the timetable says. What
// changes between groups is how many of those lessons fit into one meeting.
//
// A SESSION means one meeting. Language Points and Spotlight Tokens run per
// session — per meeting — never per lesson.
// ---------------------------------------------------------------------------
const sessionFormats = [
  ["One meeting a week",
   "About two hours in one sitting",
   "The meeting covers TWO lessons of the cycle, back to back.",
   "The pilot group."],
  ["Two meetings a week",
   "About an hour each, on separate days",
   "Each meeting covers ONE lesson of the cycle — A on Tuesday, B on Thursday.",
   "The default as new groups open."],
];

// Both formats move at the same speed: two lessons a week either way, so a
// unit takes two weeks in both. Nothing in the system needs to know which
// format a group is on — which is why no document should ever name a weekday.
const formatNeutrality =
  "No student-facing document names a day, a time or a number of meetings. " +
  "The timetable lives in the group's Classroom, under Start Here, and nowhere else. " +
  "Documents speak of 'your next session' and 'the next lesson of the cycle', never of Saturday.";

// ---------------------------------------------------------------------------
// THE TEST  ★
// ---------------------------------------------------------------------------
const testRule = {
  released: "at the end of the D session, as an individual assignment",
  passMark: PASS_MARK,
  attempts: MAX_ATTEMPTS,
  onPass: "Advance to the next unit and return to stage A.",
  onExhausted:
    "Extra session, an individual conversation, and the teacher decides — based on what the student " +
    "actually does in scenes — whether to move them on. The test is a signal, not a gatekeeper.",
  watchpoint:
    "A second extra session in a row (about three weeks stalled) is a fixed trigger for a " +
    "fifteen-minute one-to-one outside the session. The Panel flags it on its own.",
};

// ---------------------------------------------------------------------------
// GROWTH — the trigger, and the thing it is not
// ---------------------------------------------------------------------------
const growthRule = {
  startsAt: 1,
  levels: 12,
  trigger: "Passing the test of the sixth unit in a block of six — one half-book.",
  neverTouchesDice: true,
  notTheSameAs:
    "Growth Level is not the coursebook level. It is time at the table, not proficiency. " +
    "No formula converts one into the other. Everybody starts at 1.",
};

// ---------------------------------------------------------------------------
// THE SHAPE OF A TWO-HOUR SESSION
// ---------------------------------------------------------------------------
const sessionShape = [
  ["0–10",    "Opening",       "Recap in English. Announcements: Growth Moments, tests released, who is in an extra session. Hand out the Language Points earned last week."],
  ["10–20",   "Presentations", "Every student in a B or D session, about a minute each."],
  ["20–60",   "Act I",         "Two or three scenes."],
  ["60–65",   "Breath",        "Five minutes off."],
  ["65–105",  "Act II",        "Two or three scenes and the night's climax."],
  ["105–115", "Debrief",       "Count the Language Points out loud, one short comment per student."],
  ["115–120", "Close",         "Release tests, one-sentence hook for next week."],
];

// Where the Language Points of a session are counted, and where last week's
// are handed over. Kept here so the book and the Panel cannot disagree.
const pointsRhythm = {
  countedIn: "Debrief",
  handedOutIn: "Opening",
  sentence: "What you earn tonight is what you spend next week.",
};

module.exports = {
  sessionFormats, formatNeutrality,
  COURSEBOOK, COURSEBOOK_PLATFORM, TEST_NAME, PASS_MARK, MAX_ATTEMPTS,
  twoClocks, lessonCycle, cycleNotes, testRule, growthRule,
  sessionShape, pointsRhythm,
};
