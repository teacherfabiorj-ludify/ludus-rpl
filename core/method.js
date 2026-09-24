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

// ---------------------------------------------------------------------------
// CORRECTION — 23/09/2026
//
// ⚠ THE NUMBERS BELOW ARE FROM THE PRIMARY SOURCE AND WERE VERIFIED AGAINST IT.
// An earlier draft of the Master's Guide printed a different set (recast ~45%,
// repetition ~69%, clarification ~67%, elicitation ~60%) which matched no
// metric in the study. Those were wrong and are gone. If anybody ever wants to
// change a figure here, they change it against the paper, not against memory.
//
// Lyster, R. & Ranta, L. (1997). "Corrective Feedback and Learner Uptake:
// Negotiation of Form in Communicative Classrooms." Studies in Second Language
// Acquisition 19(1), 37–66. 686 feedback turns, French immersion, grades 4–5.
//
// THE THREE METRICS, because they are constantly confused:
//   UPTAKE  — the student said something back. Anything at all.
//   REPAIR  — what they said back was correct.
//   STUDENT-GENERATED REPAIR — they produced the correct form THEMSELVES,
//             rather than repeating one the teacher had already supplied.
// The third column is the one this course cares about, and it is the column
// where the recast scores zero — not badly, zero, by definition.
// ---------------------------------------------------------------------------
const CORRECTION_SOURCE =
  "Lyster & Ranta (1997), Studies in Second Language Acquisition 19(1), 37–66 — "
  + "686 feedback turns in communicative classrooms.";

const RECAST_SHARE = 55;   // % of all teacher feedback moves that were recasts

const feedbackResearch = [
  // type, uptake, repair, student-generated repair, family
  ["Elicitation",           "100%", "46%", "46%", "prompt"],
  ["Metalinguistic clue",    "86%", "45%", "45%", "prompt"],
  ["Explicit correction",    "50%", "36%",  "0%", "supplies the form"],
  ["Repetition",             "78%", "31%", "31%", "prompt"],
  ["Clarification request",  "88%", "27%", "27%", "prompt"],
  ["Recast",                 "31%", "18%",  "0%", "supplies the form"],
];

const feedbackFinding =
  "Two families, and the line between them is not politeness — it is who produces the "
  + "correct form. A PROMPT hands the problem back and the student fixes it. The other two "
  + "hand over the answer, and score zero on student-generated repair because there is "
  + "nothing left for the student to generate. The recast is simultaneously the most used "
  + "move in the room and the weakest one in the table.";

// How each type is done at this table. The middle column is what it looks like
// in an ordinary classroom; the right column is the same move performed by a
// character, which is the only version allowed during a scene.
const feedbackInPlay = [
  ["Elicitation", "in a scene",
   "Start the sentence and stop.",
   "Halden: “So yesterday you…” — and then nothing. He has never finished anybody's sentence and he is not going to start."],
  ["Metalinguistic clue", "in a scene, carefully",
   "Name the rule the error broke.",
   "A clerk who will not write it down until it is put the right way: “Was. If it already happened, it is was.” Once, flat, and back to the scene."],
  ["Repetition", "in a scene",
   "Repeat the error back with a rising intonation.",
   "The Tenant raises an eyebrow and repeats the sentence back, politely, as though he is not quite sure he heard it."],
  ["Clarification request", "in a scene",
   "“Sorry? I don't follow.”",
   "Quill looks up from the ledger. “I'm sorry — say that again? I have to write it down exactly.”"],
  ["Recast", "in a scene, for anything minor",
   "Say the correct version back inside your narration.",
   "Your default for an error that is not this student's Focus. Cheap, invisible, weak — and weak is fine for something not worth stopping for."],
  ["Explicit correction", "debrief only",
   "Name the error and give the right form.",
   "Never during a scene. It is the one move that cannot be performed by a character, because the character would have to know what a tense is."],
];

// ⚠ 23/09/2026 — the metalinguistic clue moved INTO the scene. It was banned
// from play in an earlier draft, on the reasoning that naming a rule breaks
// the fiction. That was right about classroom metalanguage and wrong about
// this world: a licensed coast runs on people who insist on exact wording, and
// a clerk refusing a form IS a metalinguistic clue. It is the second strongest
// move in the study and it was being thrown away.
const metalinguisticLimits = [
  ["A clue, never a lesson",
   "One clause. No explanation, no second sentence, no checking that they understood. You say the thing and the scene carries on."],
  ["Only from somebody who would care",
   "A clerk, a scribe, a judge, a pedant \u2014 anybody writing something down and unwilling to write it down wrong. On a coast that runs on licences and exact wording, that person is on nearly every street."],
  ["Never the word for the rule",
   "\u201cIf it already happened, it is was\u201d is a person being exact. \u201cThat is the past simple\u201d is a classroom walking into the room."],
  ["Once a scene, once a student",
   "One metalinguistic clue per scene, and never twice to the same student in one session. Past that it stops being a character and starts being a test."],
];

// ---------------------------------------------------------------------------
// THE PRIORITY RULE — 23/09/2026, Fábio's, and it outranks everything else in
// this section.
//
// The six techniques above say WHICH correction works. This says WHEN you are
// allowed to reach for one at all, and the answer is: only when it does not
// cost you the fiction. Breaking the narrative is a last resort — available,
// because sometimes something is getting badly in the way, but last.
//
// The order of preference is not about politeness or about the research. It is
// about the fact that an interrupted student stops producing, and production
// is the only thing this course is measuring.
// ---------------------------------------------------------------------------
const correctionPriority = [
  ["1", "Wait for the beat",
   "The best correction is the one that arrives at a moment a character would have spoken anyway. Hold the error. Let the scene reach the point where an NPC naturally responds, and do it there. A prompt at the right beat is invisible; the same prompt two seconds earlier is an interruption."],
  ["2", "Correct inside the fiction",
   "Elicitation, repetition, a clarification request, a metalinguistic clue from somebody exact. All four are things a person does in a conversation, so none of them costs the scene anything."],
  ["3", "Recast and move on",
   "For anything small, anything outside that student's Focus, anything the scene does not have room for. It is the weakest technique in the study and it is still the right call most of the time, because most errors are not worth a beat."],
  ["4", "Write it down and say nothing",
   "For a serious error, a repeated pattern, or anything you cannot fix without stopping. This is a real option and it is the one teachers forget they have. The note goes in your book; the student's turn is not touched."],
  ["5", "Stop the scene",
   "Last. Only when something is getting so badly in the way that the table has stopped understanding each other. It works, and it costs you the immersion that every other thing in this book depends on. If you do it twice in a session, something upstream is wrong — the scene, the pairing, or the level of the ask."],
];

const correctionJudgement =
  "None of this is a flowchart and you should not run it as one. You have twenty years of "
  + "reading a room and this is exactly where to spend them: you are choosing, in about a "
  + "second, whether this error is worth a beat, and if it is, which beat. The rule the "
  + "judgement serves is fixed even though the choice is not — KEEP THE IMMERSION, AVOID "
  + "INTERRUPTING PRODUCTION. Everything else is yours.";

// ---------------------------------------------------------------------------
// TAKING NOTES & FEEDBACK — the other half of correction, and the half that
// makes the priority rule affordable. You can decline to correct in the moment
// precisely because there is somewhere for the error to go.
// ---------------------------------------------------------------------------
const takingNotes = {
  what:
    "A running note, during play, of errors worth keeping. Not every error — the ones that "
    + "touch the structure that student is actually studying, and the ones that repeat.",
  how:
    "One line, their name, and what they said. Write what they SAID, not what was wrong with "
    + "it: “Ana — if she will come”. Three words, mid-scene, without looking down for long. "
    + "You are not building a record; you are buying back the correction you chose not to make.",
  what_not:
    "Do not note errors above the student's level, errors in structures nobody has taught them, "
    + "or errors you already prompted in the scene. Those are noise, and a long list at the end "
    + "of the night is worse than no list at all.",
  why:
    "This is what makes the priority rule payable. A teacher who has nowhere to put an error "
    + "will interrupt to deal with it. A teacher with a notebook can let it go, because it is "
    + "not lost — it is just not now.",
};

const feedbackRules = [
  ["Never name who said it",
   "“Twice tonight I heard if she will come” — not “Ana, you said”. Everybody who made that error hears it and nobody is standing in front of the table while it happens. If it only came from one student, the room usually does not know that, and it does not need to."],
  ["Aim for reflection, not for the fix",
   "The point is not that they walk out with the rule. It is that they notice something about their own English. “What happens to the IF half of that sentence?” does more than “the if half never takes will”, because the second one is yours and the first one becomes theirs."],
  ["One point per student, and not every student every week",
   "Five corrections at the end of a session communicate one message, and it is not about grammar. Some weeks a student gets nothing, and that is a correct outcome, not a gap."],
  ["Tie it to a moment you both remember",
   "“When you were talking to the clerk” costs nothing and doubles what lands. An abstract rule at the end of a two-hour session is a rule nobody attaches to anything."],
  ["The fiction is closed before any of this starts",
   "Say so out loud, the same way every week, so the register change is audible. Characters do not receive feedback; students do, and the boundary between those two is the thing that makes it safe to be wrong for the previous hundred and ten minutes."],
  ["End on what they reached for",
   "The last thing said about a student's English should be something they attempted, not something they missed. This is not softening — it is the same law as Language Points, which pay for the attempt and never for the accuracy."],
];

const feedbackNever =
  "Never point a finger, and never let a student leave a session feeling caught. The purpose of "
  + "the whole debrief is to produce a thought, not a correction, and a student who feels exposed "
  + "produces silence for three weeks afterwards.";

const correctionLadder = [
  ["An error that does not block understanding and is not that student's Language Focus.",
   "Recast, and keep going. It is not worth the friction, and you will get another chance next week."],
  ["An error in the exact structure that student is working on right now.",
   "Prompt, in character. Ask them to say it again, repeat it back, stop halfway and wait, or let a clerk refuse the wording. They reformulate, and this time they notice."],
  ["A pattern you have watched the same student repeat for weeks.",
   "Name it explicitly — in the debrief, with the fiction already closed. This is the one place where saying “here is the rule” is the right move."],
];

const correctionNever = [
  ["Stopping a scene to explain a rule.",
   "It converts a game back into a class, and the students feel the switch instantly. Whatever you were about to teach costs more than it is worth."],
  ["Correcting a student in front of the table by naming their error.",
   "Principle 6 and Principle 7 both die in that sentence. Everything after it is spoken more carefully and less often."],
  ["Prompting the same student twice in one scene.",
   "Once is a character reacting. Twice is an interrogation, and they will hear the difference."],
  ["Prompting an error the student cannot yet fix.",
   "If the structure is above where they are, they will reformulate it wrong twice and learn only that speaking is risky. Recast that one and move on."],
  ["Saving up corrections for a list at the end.",
   "A student who receives five corrections in the debrief hears one message, and it is not about grammar. One point per student, maximum, tied to a moment you both remember."],
];

// ---------------------------------------------------------------------------
// BEFORE THE SESSION — 23/09/2026
//
// The whole preparation routine, in order, with the time it actually takes.
// It is built so that the Panel does the reading and the teacher does the
// deciding: every step that could be a lookup IS a lookup, and the only step
// that needs a human is the one that chooses the scene.
// ---------------------------------------------------------------------------
const PREP_MINUTES = 20;

const preparation = [
  ["1", "Update the Panel", "2 min",
   "Type each student's Evolve level, unit and lesson letter. That is the only typing in the whole routine. Everything else on the Panel calculates itself: the Focus, who presents, the actions, the reminder, and whether a quiz is due."],
  ["2", "Read the four Focuses", "1 min",
   "Four lines, one per student. This is the entire pedagogical content of the session and it takes a minute to read. If you skip one step in this list, do not let it be this one."],
  ["3", "Read who presents tonight", "30 sec",
   "The Panel says it, because it knows who is on a B or a D lesson. Presenters go first, in the second block of the session, and they need to know before they arrive — not when you call on them."],
  ["4", "Find the action that covers the most people", "2 min",
   "The Panel maps each student's unit to the Actions it pulls. Pick the one that reaches the most of the table tonight and build the scene on that Action, not on a grammar point."],
  ["5", "Write down who the scene does NOT reach", "1 min",
   "There is almost always one. You do not redesign the scene for them — you add one line of NPC dialogue that asks for their Action. One line, prepared in advance, is the difference between a student being included and a student being remembered too late."],
  ["6", "Plan situations, never outcomes", "8 min",
   "For each scene: who wants what, what is at stake, and what happens if nobody does anything. Never what the players will do. A scene that only works one way will have you steering, and steering is the fastest way to stop students talking."],
  ["7", "Check last week's Codex lines", "2 min",
   "What did the table invent last week? Use one of those things tonight, by name. Nothing makes a student own the world faster than hearing their own invention come back with somebody else's hands on it."],
  ["8", "Check the flags", "1 min",
   "The Panel raises them on its own: a second extra lesson in a row, a third quiz attempt, a student who has not moved in a month. A flag is not an action tonight — it is a fifteen-minute conversation to schedule outside the session."],
  ["9", "Open the three files", "2 min",
   "Panel, Class Board, Door Book. Board shared with the group. Dice room open. Do it before the first student joins, not while they watch."],
];

const preparationLaw =
  "If you have five minutes instead of twenty, do steps 1, 2, 4 and 5 and improvise the rest. "
  + "Those four are what make it a lesson. The other five are what make it a good one.";

const preparationNever = [
  "Do not prepare a plot. Prepare a situation and let the table supply the plot.",
  "Do not prepare the language a student will produce. Prepare the pressure that requires it.",
  "Do not prepare more than you can lose. Half of what you write will be thrown away in the first twenty minutes, and that is the system working.",
];

// ---------------------------------------------------------------------------
// AT THE TABLE — the conduct rules, as things you can be observed doing.
// ---------------------------------------------------------------------------
const conduct = [
  ["Talk less than you want to",
   "No single stretch of your narration runs past forty-five seconds. Time it once with a recording and you will discover you are wrong about how long you talk."],
  ["Ask, then wait",
   "After a question, count to five in your head before filling the silence. Beginners need the five seconds and almost never get them, because somebody always rescues the pause."],
  ["Never finish anybody's sentence",
   "Not the student's, not another player's, not to be kind. This is the hardest habit for an experienced teacher to break and the one students notice most."],
  ["Address students by character name in the fiction",
   "It keeps the fiction load-bearing, and it makes the one moment you use their real name — the debrief — land as a change of register everybody hears."],
  ["Keep a tally, not an impression",
   "A mark next to a name every time that student speaks in a scene. Your memory of who spoke is reliably wrong, and the tally costs nothing."],
  ["Take every answer seriously",
   "Including the wrong one, the strange one and the one that wrecks your plan. A table learns in two sessions whether contributions are actually accepted."],
  ["Let the dice decide, out loud",
   "Never quietly soften a result. The bands are the contract, and a table that suspects you are protecting them stops taking risks, which is the one thing you need them to do."],
];

// How a group of four, at four different points on the trail, is run as one
// table. This is the question every new teacher asks first.
const groupRules = [
  ["Four students, four different units — is that a problem?",
   "No, and it is not an accident either. The shared fiction is the same for everybody; only the Focus is personal. You are not teaching four lessons at once. You are running one scene and aiming four different questions inside it."],
  ["So how do I aim four things in one scene?",
   "You do not, in one scene. Across a session you run five or six scenes, and each one is pointed at one or two students. Over two hours everybody is hit at least once. Over a month everybody is hit every week."],
  ["What about the gap between the strongest and the weakest?",
   "Use the Second Look. The same object, twice: the small size first, for whoever has less language, then the large size, for whoever has more. The beginner's ten seconds become the foundation the advanced student has to build on, and nobody was given an easier question — they were given an earlier one."],
  ["How many students is too many?",
   "Four is the design. Five works and costs you scene count. Six does not: somebody goes a whole session without being asked, and that is the one failure this system has no mechanism to absorb."],
  ["What if one student dominates?",
   "Do not shut them down in front of the table — that costs you the most willing speaker you have. Give them a job that requires listening: ask them for the Second Look on somebody else's description, which cannot be done without having listened to it."],
  ["What if a student refuses to speak at all?",
   "Lower the size of the ask, never the expectation. One word is a turn. Then ask the same student a question that can be answered with the word they just used. Three sessions of that is usually enough."],
];

// ---------------------------------------------------------------------------
// AFTER THE SESSION — what actually gets written down, and where.
// ---------------------------------------------------------------------------
const AFTER_MINUTES = 10;

const afterTheSession = [
  ["Language Points", "Panel, during the debrief",
   "Counted out loud at the table, one student at a time, with the reason said in English. Typed into the Panel the same night. They are handed over at the OPENING of the next session — what you earn tonight is what you spend next week."],
  ["Homework set", "The platform marks it, you do not",
   "Ten to fifteen minutes a set, marked and fed back by the platform, and the student may redo any set as often as they like. You never mark homework in this course. What you record is whether it was DONE, because that is the number that predicts whether somebody is about to stall."],
  ["Quiz released", "Panel, at the end of a D lesson",
   "Released to that student alone. Write the date. The quiz is written by us, in Google Forms — it is not the publisher's test, and it does not come from the platform."],
  ["Quiz attempts", "Panel, one column",
   "Record every attempt, passed or not. The Panel flags the third one on its own, and a third attempt is a conversation before it is another attempt."],
  ["Lesson letter", "Panel, one cell per student",
   "Move each student along A → B → C → D, or to X if they have not passed. Everything else on the Panel — the Focus, who presents, the actions, the reminder — is calculated from this one letter. It is the single most important cell in the file."],
  ["Growth Moment", "The Ledger, not the character sheet",
   "When a student passes the quiz of the sixth unit in a block of six. Growth Level up by one, a Boon every time, and the tier or Cross-Training if the rung carries one. It goes in the permanent Ledger because character sheets get retired and the Ledger does not."],
  ["Codex line", "One line, written the same night",
   "One sentence per lantern passed: what the student invented and what they called it. Four lines a week, thirty seconds. After a year it is roughly a hundred and fifty lines of world written by your own students, in English, at exactly their level."],
  ["One note per student", "Wherever you keep notes",
   "Not a grade. One observation: what they tried, what they avoided, what they said that surprised you. A month of these is the only document that will tell you what is actually happening to somebody's English."],
];

const afterTheSessionLaw =
  "All of it is ten minutes, the same night, while you still remember the session. Done the "
  + "next morning it takes twenty and is worse. Left for the weekend it does not get done, and "
  + "a Panel that is two weeks stale is a Panel that aims every scene at where your students "
  + "used to be.";

const homeworkWatchpoints = [
  ["Two sets missed in a row", "Ask, privately, once, outside the session. The reason is almost never laziness and you will not guess it."],
  ["Quiz not attempted two weeks after release", "The student does not feel ready. That is the brake working — leave the unit open and keep the topic coming back in scenes."],
  ["Third attempt at the same quiz", "Talk first, then let them sit it. A student on their fifth attempt is learning the answer key, not the language."],
  ["A second extra lesson in a row", "Fifteen minutes one-to-one outside the session. The Panel flags this one for you."],
  ["No movement in a month", "This is the only one that is not about the quiz. Something outside the course is happening. Ask about that instead."],
];

// ---------------------------------------------------------------------------
// SESSION ZERO — 23/09/2026
//
// Written because of what happened on 12/09/2026, the first real session, and
// the note Fábio made afterwards: "mesmo eu sendo o idealizador do projeto, me
// senti muito perdido." If the person who designed the thing felt lost, the
// students were worse off, and a confused student on week one does not decide
// the game is confusing. They decide THEY could not follow it, and they leave.
//
// The earlier Session Zero script was a CLOCK — what to do at 10:35. It was
// not a teaching module. The difference is the whole reason this exists: a
// clock tells you when to introduce Language Points; it does not tell you how
// to introduce a concept to somebody who has never heard of it.
//
// ⚠ NOTHING HERE IS DISCOVERED. Every concept in conceptsToIntroduce is SAID,
// then SHOWN, then USED by every student, in that order, before the game
// starts. A concept a student discovers by being caught out by it is a concept
// that taught them the game has rules they were not told.
// ---------------------------------------------------------------------------
const SESSION_ZERO_MINUTES = 120;

const sessionZero = [
  ["0–5", "The welcome, in English",
   "Short. You are setting the language of the room, not explaining anything yet. Say what tonight is: we are going to build characters, learn how this works, and play a little at the end."],
  ["5–8", "Read the opening aloud",
   "The Door's opening passage, slowly, before anybody has a character. Ninety seconds. It tells the table what kind of place they are in before they have to make any decision inside it."],
  ["8–30", "Introduce the nine concepts",
   "The module below: say it, show it, every student uses it once. Twenty minutes, and it is the best-spent twenty minutes of the term."],
  ["30–60", "Build characters, together, out loud",
   "Not in silence off a sheet. One decision at a time, all four at once, so that every choice is heard by the table and every student hears the vocabulary three more times than they would alone."],
  ["60–70", "The table rules, read by the students",
   "You do not read them. Hand one rule to each student and have them read it aloud and say what they think it means. A rule you explained is a rule they were told; a rule they said is a rule they agreed to."],
  ["70–80", "The three files",
   "Open the Class Board in front of them. Show them their own row. Open one character sheet and show where their name goes and where the blue block comes from. Nobody should meet these files alone, at home, for the first time."],
  ["80–110", "Play one short scene",
   "Thirty minutes, low stakes, no plot. The point is that every student rolls once, says something in character once, and holds the lantern once, while you are still in the room to make it easy."],
  ["110–120", "First debrief, and the first homework",
   "Run the real debrief, exactly as you will every week, so the shape is familiar from week one. Count the Language Points out loud. Say what the homework is and where it lives."],
];

const sessionZeroLaws = [
  ["Nothing is discovered.",
   "Every concept is said, shown and used before it matters. The first time a student meets Passing the Lantern must not be the moment you point at them and ask them to describe a gate."],
  ["Confusion is read as personal failure.",
   "This is the reason the whole chapter exists. A student who cannot follow week one does not conclude that the explanation was bad. They conclude they are not able to keep up, and that conclusion is very hard to reverse. Over-explain in Session Zero and you will never have to again."],
  ["Everything is in English, and that is survivable here.",
   "Session Zero is the one session where you are explaining rather than playing, so it is the one where the English is heaviest and the stakes are lowest. Use short sentences, write key words down where everyone can see them, and let students ask you how to say things."],
  ["Everybody does everything once.",
   "Every student rolls, speaks in character, holds the lantern and reads a rule aloud, in the first two hours. A student who got through Session Zero without doing one of those will avoid it for a month."],
  ["Do not play a real adventure tonight.",
   "The scene at the end is a rehearsal, not Adventure 1. If the plot starts tonight, the concepts get squeezed, and the concepts are the entire reason this session exists."],
];

const sessionZeroChecklist = [
  "Every student rolled 2d6 at least once and read their own band aloud.",
  "Every student said one sentence in character.",
  "Every student held the lantern once.",
  "Every student read one table rule aloud and said what it meant.",
  "Every student has their character sheet open, with their own name typed into it.",
  "Every student can say what their Language Focus is this week.",
  "Every student knows where the homework is and when the next session is.",
];

module.exports = {
  languageFocusRule,
  sessionFormats, trailPace, formatNeutrality,
  COURSEBOOK, COURSEBOOK_EDITION, COURSEBOOK_PLATFORM, HOMEWORK_LOAD,
  TEST_NAME, TEST_TOOL, PASS_MARK, pacing,
  twoClocks, lessonCycle, cycleNotes, testRule, growthRule,
  sessionShape, pointsRhythm,
  actions, actionPrinciple, presentationRule,
  conceptsToIntroduce, conceptIntroductionRule,
  SESSION_ZERO_MINUTES, sessionZero, sessionZeroLaws, sessionZeroChecklist,
  CORRECTION_SOURCE, RECAST_SHARE, feedbackResearch, feedbackFinding,
  feedbackInPlay, metalinguisticLimits, correctionLadder, correctionNever,
  correctionPriority, correctionJudgement, takingNotes, feedbackRules, feedbackNever,
  PREP_MINUTES, preparation, preparationLaw, preparationNever,
  conduct, groupRules,
  AFTER_MINUTES, afterTheSession, afterTheSessionLaw, homeworkWatchpoints,
};
