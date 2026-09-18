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
//
// ⚠ 16/09/2026 — the DIGITAL-ONLY edition was dropped. Evolve Digital has been
// off sale on the Cambridge site for about two months and the one reseller
// found was asking nearly R$400 for a six-unit half-book. We use the ordinary
// printed Evolve WITH DIGITAL PACK instead: the student buys the book, gets the
// book, and activates the code against the class on Cambridge One. The printed
// pages are barely used at the table; the activation is what matters, because
// it opens the homework.
const COURSEBOOK = "Evolve";                    // ★ Cambridge, levels 1–6
const COURSEBOOK_EDITION = "Student's Book with Digital Pack";
const COURSEBOOK_PLATFORM = "Cambridge One";    // ★ homework only
const HOMEWORK_LOAD =
  "Ten to fifteen minutes a set. Marked and fed back by the platform, and the student " +
  "may redo any set as many times as they like.";

// ⚠ The quiz is OURS, not the platform's. The Cambridge Unit Progress Test was
// the plan until 16/09/2026; it capped a student at two attempts and a third
// needed an administrator reset, which was unworkable as a weekly routine.
// Ludify writes the unit quizzes as Google Forms, so that limit is gone.
const TEST_NAME = "Unit Quiz";                  // ★
const TEST_TOOL = "Google Forms, written by Ludify";
const PASS_MARK = 75;                           // ★ percent

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
  ["D", "Lesson 2 again",  "Same topic, with a presentation. At the end of this lesson the GM releases the quiz.", "yes — 1 min"],
  ["X", "Extra lesson",    "Only if the student has not passed the quiz yet. Revisits both topics of the unit.", "no"],
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
// THE UNIT OF THE CYCLE IS ONE HOUR OF CLASS, NOT ONE MEETING.
// One class-hour = one lesson of the cycle. Every group does two hours a week,
// so every group does two lessons a week, so a unit (A·B·C·D) takes two weeks
// in every group. There is no fast format and no slow format.
//
// A SESSION means one meeting. Language Points and Spotlight Tokens run per
// session — per meeting — never per lesson. A two-hour meeting is one session
// that happens to cover two lessons.
// ---------------------------------------------------------------------------
const sessionFormats = [
  ["One meeting a week",
   "Two hours in one sitting",
   "Two lessons of the cycle, back to back — A in the first hour, B in the second.",
   "The pilot group."],
  ["Two meetings a week",
   "One hour each, on separate days",
   "One lesson of the cycle per meeting — A on Tuesday, B on Thursday.",
   "The default as new groups open."],
];

// The arithmetic both formats share. Printed in the Core Book so nobody ever
// re-derives it from a timetable again.
const trailPace = {
  lessonsPerWeek: 2,
  lessonsPerUnit: 4,          // A · B · C · D — X is the exception, not the plan
  weeksPerUnit: 2,
  teachingWeeksPerYear: 44,   // 52 minus holidays
  classHoursPerYear: 88,
  unitsPerYear: 22,           // 88 class-hours ÷ 4 hours per unit
  growthMomentsPerYear: 3.7,  // one every 6 units
  note:
    "Identical in both formats. A group that meets once for two hours and a group that " +
    "meets twice for one hour cover the same four lessons a fortnight.",
};

const formatNeutrality =
  "No student-facing document names a day, a time or a number of meetings. " +
  "The timetable lives in the group's Classroom, under Start Here, and nowhere else. " +
  "Documents speak of 'your next session' and 'the next lesson of the cycle', never of Saturday.";

// ---------------------------------------------------------------------------
// THE TEST  ★
// ---------------------------------------------------------------------------
const testRule = {
  released: "at the end of the D lesson, to that student alone",
  passMark: PASS_MARK,
  hardLimit: null,             // the quiz is ours; the platform imposes nothing
  softCap: 2,
  softCapReason:
    "Not a wall — a conversation. A student who sits the same quiz five times is learning the " +
    "answer key, not the language. At the third attempt the teacher talks to them first.",
  onPass: "Advance to the next unit and return to lesson A.",
  onStall:
    "Extra lesson, and the teacher decides — based on what the student actually does in scenes — " +
    "whether to move them on. The quiz is a signal, not a gatekeeper.",
  watchpoint:
    "A second extra lesson in a row is a fixed trigger for a fifteen-minute one-to-one outside " +
    "the session. The Panel flags it on its own.",
};

// ---------------------------------------------------------------------------
// WHO SETS THE PACE  ★
// The schedule below is the FASTEST a student can go, not a quota. The brake is
// in the student's own hand and it is a single, simple action.
// ---------------------------------------------------------------------------
const pacing = {
  theBrake:
    "A student who does not feel ready simply does not sit the quiz yet. The unit stays open, " +
    "the topic keeps coming back in scenes, and the homework can be redone as often as they like.",
  why:
    "Because the brake is individual, nobody is dragged along and nobody is held back by a slower " +
    "classmate. The table moves at the table's pace; the trail moves at each student's.",
  soThePlanIsACeiling:
    "Two lessons a week is the ceiling, not the requirement. Read every number in this chapter " +
    "as the fastest lawful speed.",
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
// THE THIRTEEN ACTIONS
//
// The axis a GM designs a scene on. An Action is something a CHARACTER DOES;
// a grammar topic is not, which is why a scene built on "past simple" comes
// out as an exercise and a scene built on "narrate what happened" does not.
//
// NOT ★. The thirteen are ours and would survive a change of coursebook.
// What is ★ is the mapping of units onto them, which lives in units.json.
//
// The NPC column is not decoration: the five permanent NPCs of the Ludus each
// embody one family, so a GM who needs a Narrate scene knows whose door to
// knock on.
// ---------------------------------------------------------------------------
// ★ WHERE A LANGUAGE FOCUS COMES FROM AND HOW OFTEN IT MOVES.
// Was hardcoded in core-book/src/build.js ch.15 until 17/09/2026, which is why
// the Player's Guide was able to say "every time you finish a unit" and nothing
// caught it.
const languageFocusRule = {
  what:
    "One line on the sheet, belonging to one student: the structure they are studying right now, " +
    "and the thing the GM will build a pressure point around tonight.",
  changesWhen:
    "The Focus changes when the student changes lesson, which is to say every hour of class.",
  whoTypesIt:
    "Nobody types it. The Panel reads it from the trail table, the Class Board shows it, and the " +
    "student's own sheet shows theirs. The teacher types the lesson letter and the Focus follows.",
  notTiedToGrowth:
    "It has nothing to do with Growth Level. Growth moves every six units; the Focus moves every " +
    "hour of class, and the two are not synchronised.",
};

const actions = [
  ["IDENT", "Identify", "Say who or what something is. Introduce yourself, name a thing, state origin, function or ownership.",
   "be · possessives · articles · question words · this/these · agreement", "Halden — the Present"],
  ["DESCR", "Describe", "Attach quality. Say how things are, how they look, how they usually happen.",
   "adjectives · comparatives and superlatives · adverbs of frequency · present simple and continuous · relative clauses", "Halden — the Present"],
  ["QUANT", "Quantify", "Say how much and how many. Measure, estimate, compare quantity and availability.",
   "there is/are · count and non-count · some/any/much/many · quantifiers · too/enough", "Halden — the Present"],
  ["ABIL", "Ability & Progress", "Declare what you can do, how well, and how far you have come since before.",
   "can/can't · well · present perfect continuous · adverbs of manner", "Halden — the Present"],
  ["NARR", "Narrate", "Tell what happened. Sequence, background, what had already happened before.",
   "past simple and continuous · present perfect · past perfect · used to / would", "Sable — the Past"],
  ["REPOR", "Report", "Relay what somebody else said. Testimony, rumour, news, third-hand record.",
   "reported speech · indirect questions · reported modals · indefinite pronouns", "Sable — the Past"],
  ["PLAN", "Plan", "Arrange, predict, promise, schedule. Everything that throws the scene forward.",
   "be going to · will · present continuous for future · when/before/until/after · first conditional", "Piro — the Future"],
  ["REGUL", "Regulate", "Permit, forbid, oblige, advise. The language of the rule, the licence and the authority.",
   "can/must/have to/need to · mustn't · should · permission and prohibition in the past · causatives", "Quill — the Modals"],
  ["SPEC", "Speculate", "Say how sure you are. Deduce, suppose, risk an explanation.",
   "may/might/could · modals of speculation · past modals of probability · real conditionals", "Quill — the Modals"],
  ["SUPP", "Suppose", "Talk about what did not happen. Unreal hypothesis, regret, the road not taken.",
   "unreal conditionals · I wish · was/were going to · was/were supposed to", "Quill — the Modals"],
  ["ARGUE", "Argue", "State an opinion, evaluate, justify, disagree. Defend a position in front of somebody.",
   "opinion phrases · giving reasons with to/for · gerund and infinitive · evaluative structures", "The Tenant — Functional"],
  ["REACT", "React", "Respond with feeling. Emotion, empathy, surprise, willingness and refusal.",
   "emotion adjectives · exclamatives · wishes and regrets · reflexive pronouns", "The Tenant — Functional"],
  ["REGIS", "Register & Nuance", "Choose the tone. Politeness, indirectness, emphasis, idiom — the same thing said another way.",
   "indirect questions · so…that / such…that · clefts · fronting · phrasal verbs and idiom", "The Tenant — Functional"],
];

const actionPrinciple =
  "Design the scene around the Action, never around the grammar. A scene built on 'past simple' " +
  "is an exercise wearing a costume; a scene built on 'somebody has to tell the magistrate what " +
  "they saw' is a scene, and the past simple arrives on its own.";

// ---------------------------------------------------------------------------
// THE PRESENTATION  ★
// ---------------------------------------------------------------------------
const presentationRule = {
  when: "B and D lessons only",
  length: "about one minute",
  what: "The student explains, in English, the topic they are on — in their own words, to the table.",
  notAssessed:
    "Nobody is marked on it. It is worth a Language Point for happening at all, which is the " +
    "same law as everywhere else in this system: paid for the attempt.",
  why:
    "Explaining a structure out loud is a harder language task than using it, and it is the one " +
    "moment in the week when a student has the floor with nobody interrupting.",
};

// ---------------------------------------------------------------------------
// INTRODUCING THE CONCEPTS — the Session Zero module.
//
// This exists because it was missing. In the pilot's first session the GM
// reached for the Lantern and realised nobody had been told what it was, and
// the same was true of Language Points and Spotlight Tokens. A concept that
// has not been introduced is a concept that produces confusion at the exact
// moment it is supposed to produce speech.
//
// EVERY ENTRY HAS THE SAME THREE PARTS, and the third is the one that gets
// skipped: say it, show it, and then make them use it once, immediately.
// ---------------------------------------------------------------------------
const conceptsToIntroduce = [
  {
    name: "What a roleplaying game is",
    say: "I describe a world. You tell me what your character does. When it is not certain, we roll two dice. Nobody wins. We find out what happens.",
    show: "Describe a closed door and a sound behind it. Ask one student what their character does. Take whatever they say seriously.",
    use: "Every student says one sentence about what their character does with that door.",
  },
  {
    name: "The Ludus",
    say: "This hall is the Ludus. You all live here. The doors in this hall open onto other worlds, and each door is a story. When a story ends, we come back here.",
    show: "Name the hall out loud. Point at the door this campaign goes through and name the world.",
    use: "Each student says one thing their character does in the Ludus when they are not working.",
  },
  {
    name: "The roll and the three bands",
    say: "Two dice, plus one number from your sheet. Ten or more: you get it. Seven to nine: you get it, but it costs you something. Six or less: it does not work and I make something happen.",
    show: "Roll 2d6 in front of them, out loud, and read the band.",
    use: "Every student rolls once, for anything, and reads their own band aloud.",
  },
  {
    name: "Your Language Focus",
    say: "This line on your sheet is only yours. It is what you are studying this week. When the scene fits it, I will ask you to say it that way.",
    show: "Read one student's Focus aloud and ask them a question that can only be answered with it.",
    use: "Each student uses their own Focus in one sentence, however badly.",
  },
  {
    name: "Language Points",
    say: "A Language Point is a second chance at the dice. You get one for homework, one for using your Focus in a scene, one for your presentation. I count them at the end. You spend them next time.",
    show: "Show a bad roll and spend a point on it, out loud: 'I am spending a Language Point.'",
    use: "Everyone writes zero on their sheet, and hears what they can earn tonight.",
  },
  {
    name: "Spotlight Tokens",
    say: "Three tokens, every session, everybody. Spend one and the scene is yours for a bigger moment. One per scene. You can give one away if you want to hear from somebody.",
    show: "Spend one yourself, as a player would, and take a longer beat so they see what it buys.",
    use: "Each student says what they would spend one on tonight.",
  },
  {
    name: "Passing the Lantern",
    say: "Sometimes I will ask you what something looks like, or what happened here before you arrived. Whatever you say is true. I will not overrule it.",
    show: "Ask one student what the room smells like, and then use their answer in the next sentence you say.",
    use: "Every student invents one detail of the first location.",
  },
  {
    name: "Say It Again",
    say: "If a sentence comes out wrong and you want it again, just say it again. Nobody will stop you and nobody needs to ask.",
    show: "Do it yourself, on purpose, on one of your own lines.",
    use: "Nothing. This one only needs permission to exist.",
  },
  {
    name: "The cycle, and the presentation",
    say: "Each unit of your book takes four lessons. On two of them you open the session by explaining your topic to us, for about a minute. It is not a test.",
    show: "Show the Class Board and point at the reminder line on one student's row.",
    use: "Each student reads their own next-lesson reminder aloud from the Board.",
  },
];

const conceptIntroductionRule =
  "Thirty to sixty seconds each, in English a beginner can follow, and then the demonstration. " +
  "Nine of them is about twenty minutes and it is the best-spent twenty minutes of the term. " +
  "A concept introduced late arrives as an interruption; a concept introduced here arrives as " +
  "a tool the student already knows they own.";

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
  languageFocusRule,
  sessionFormats, trailPace, formatNeutrality,
  COURSEBOOK, COURSEBOOK_EDITION, COURSEBOOK_PLATFORM, HOMEWORK_LOAD,
  TEST_NAME, TEST_TOOL, PASS_MARK, pacing,
  twoClocks, lessonCycle, cycleNotes, testRule, growthRule,
  sessionShape, pointsRhythm,
  actions, actionPrinciple, presentationRule,
  conceptsToIntroduce, conceptIntroductionRule,
};
