// ============================================================================
// LUDUS — CORE BOOK
//
//   node core-book/src/build.js   →  core-book/CoreBook.docx
//
// COMPLETE: Parts 0, I, II, III, IV, V, VI and VII.
//
// THE LAW: this file holds prose, examples and layout. It holds NO rule, NO
// term and NO number. Everything factual is imported from core/ and printed.
// If you find yourself typing a number here, it belongs in core/.
// ============================================================================

const {
  Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  Header, Footer, PageNumber, PageBreak, VerticalAlign,
} = require("docx");
const { writeFileSync } = require("fs");
const path = require("path");

const { HOUSE, GAME_NAME, METHOD, VERSION, BOOK_SUBTITLE } = require("../../core/brand.js");
const S = require("../../core/system.js");
const M = require("../../core/method.js");
const { glossary } = require("../../core/glossary.js");
const U = require("../../core/units.js");
const L = require("../../core/ludus.js");
const { decisions } = require("../../core/decisions.js");

const BOOK_NAME = "Core Book";

// ---- palette: identical to the other four books --------------------------
const INK = "14130F";
const INK2 = "6E6A61";
const ACCENT = "2A78D6";
const BRAND = "D2691E";
const GOOD = "1F7A4D";
const WARN = "C98510";
const CRIT = "C4372F";
const TRAIL = "7A4FB5";          // ★ the trail layer — everything Evolve-dependent
const BOX_BG = "F7F6F3";
const TRAIL_BG = "F1EBFA";
const LINE = "D8D6D0";

const W = 10080;                  // usable width in DXA (US Letter, 1" margins)

// ---------------------------------------------------------------------------
// LAYOUT KIT
// ---------------------------------------------------------------------------
const nb = () => ({ style: BorderStyle.NONE, size: 0, color: "FFFFFF" });

function spacer(h = 120) {
  return new Paragraph({ spacing: { after: h }, children: [] });
}
function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function body(text, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after ?? 140, line: 276 },
    alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
    pageBreakBefore: !!opts.breakBefore,
    children: [new TextRun({
      text, size: opts.size ?? 21, color: opts.color ?? INK,
      italics: !!opts.italics, bold: !!opts.bold,
    })],
  });
}

function lead(text) {
  return new Paragraph({
    spacing: { after: 200, line: 300 },
    children: [new TextRun({ text, size: 24, color: INK2, italics: true })],
  });
}

function h2(text, color = INK) {
  return new Paragraph({
    spacing: { before: 300, after: 120 },
    keepNext: true,
    children: [new TextRun({ text, bold: true, size: 25, color })],
  });
}

function h3(text) {
  return new Paragraph({
    spacing: { before: 200, after: 90 },
    keepNext: true,
    children: [new TextRun({ text, bold: true, size: 21, color: INK2,
                            characterSpacing: 16, allCaps: true })],
  });
}

function partOpener(label, title, blurb) {
  return [
    spacer(2600),
    new Paragraph({
      spacing: { after: 100 },
      children: [new TextRun({ text: label, bold: true, size: 20, color: BRAND,
                              characterSpacing: 90, allCaps: true })],
    }),
    new Paragraph({
      spacing: { after: 220 },
      children: [new TextRun({ text: title, bold: true, size: 64, color: INK })],
    }),
    new Paragraph({
      spacing: { after: 0 },
      border: { top: { style: BorderStyle.SINGLE, size: 12, color: ACCENT, space: 10 } },
      children: [new TextRun({ text: blurb, size: 23, color: INK2, italics: true })],
    }),
  ];
}

function chapterOpener(eyebrow, title) {
  return [
    new Paragraph({
      pageBreakBefore: true,
      spacing: { after: 60 },
      children: [new TextRun({ text: eyebrow, bold: true, size: 17, color: ACCENT,
                              characterSpacing: 60, allCaps: true })],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [new TextRun({ text: title, bold: true, size: 44, color: INK })],
    }),
  ];
}

function cellPara(text, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after ?? 0, line: 264 },
    children: [new TextRun({
      text: String(text), size: opts.size ?? 19,
      bold: !!opts.bold, italics: !!opts.italics,
      color: opts.color ?? INK, allCaps: !!opts.caps,
      characterSpacing: opts.caps ? 16 : 0,
    })],
  });
}

function dataTable(headers, rows, widths, opts = {}) {
  const headFill = opts.headFill ?? INK;
  const make = (cells, isHead) => new TableRow({
    cantSplit: true,
    children: cells.map((c, i) => new TableCell({
      width: { size: widths[i], type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, color: "auto",
                 fill: isHead ? headFill : "FFFFFF" },
      margins: { top: 90, bottom: 90, left: 120, right: 120 },
      verticalAlign: VerticalAlign.TOP,
      children: [cellPara(c, isHead
        ? { bold: true, size: 15, color: "FFFFFF", caps: true }
        : { bold: i === 0 && !opts.plainFirst })],
    })),
  });
  const trs = [];
  if (headers) trs.push(make(headers, true));
  rows.forEach((r) => trs.push(make(r, false)));
  return new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: widths,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: LINE },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: LINE },
      left: nb(), right: nb(),
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: LINE },
      insideVertical: nb(),
    },
    rows: trs,
  });
}

function box(label, text, color = ACCENT, fill = BOX_BG) {
  const lines = Array.isArray(text) ? text : [text];
  return new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: [W],
    borders: {
      top: nb(), bottom: nb(), right: nb(),
      left: { style: BorderStyle.SINGLE, size: 18, color },
      insideHorizontal: nb(), insideVertical: nb(),
    },
    rows: [new TableRow({
      cantSplit: true,
      children: [new TableCell({
        width: { size: W, type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, color: "auto", fill },
        margins: { top: 150, bottom: 150, left: 220, right: 200 },
        children: [
          cellPara(label, { bold: true, size: 15, color, caps: true, after: 70 }),
          ...lines.map((l, i) => cellPara(l, { after: i === lines.length - 1 ? 0 : 100 })),
        ],
      })],
    })],
  });
}

// ★ every block that depends on the coursebook wears this.
function trailBox(label, text) {
  return box("★ trail layer — " + label, text, TRAIL, TRAIL_BG);
}

function lawBlock(n, title, text) {
  return new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: [900, W - 900],
    borders: {
      top: nb(), bottom: { style: BorderStyle.SINGLE, size: 4, color: LINE },
      left: nb(), right: nb(), insideHorizontal: nb(), insideVertical: nb(),
    },
    rows: [new TableRow({
      cantSplit: true,
      children: [
        new TableCell({
          width: { size: 900, type: WidthType.DXA },
          margins: { top: 140, bottom: 160, left: 0, right: 80 },
          children: [cellPara(String(n), { bold: true, size: 40, color: BRAND })],
        }),
        new TableCell({
          width: { size: W - 900, type: WidthType.DXA },
          margins: { top: 150, bottom: 160, left: 0, right: 0 },
          children: [
            cellPara(title, { bold: true, size: 23, after: 80 }),
            cellPara(text, { color: INK2 }),
          ],
        }),
      ],
    })],
  });
}

function runningHeader(partLabel, chapterLabel) {
  return new Header({
    children: [new Paragraph({
      spacing: { after: 240 },
      tabStops: [{ type: "right", position: W }],
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: LINE, space: 6 } },
      children: [
        new TextRun({ text: partLabel, size: 15, color: INK2,
                      characterSpacing: 24, allCaps: true }),
        new TextRun({ text: "\t" }),
        new TextRun({ text: chapterLabel, size: 15, color: INK2, characterSpacing: 24 }),
      ],
    })],
  });
}

const footer = new Footer({
  children: [new Paragraph({
    spacing: { before: 240 },
    tabStops: [{ type: "right", position: W }],
    border: { top: { style: BorderStyle.SINGLE, size: 4, color: LINE, space: 8 } },
    children: [
      new TextRun({ text: `${GAME_NAME} · ${BOOK_NAME} · ${VERSION}`, size: 15, color: INK2 }),
      new TextRun({ text: "\t" }),
      new TextRun({ children: [PageNumber.CURRENT], size: 16, color: INK2, bold: true }),
    ],
  })],
});

// ---------------------------------------------------------------------------
// FRONT MATTER
// ---------------------------------------------------------------------------
function titlePage() {
  return [
    spacer(2200),
    new Paragraph({
      spacing: { after: 90 },
      children: [new TextRun({ text: GAME_NAME.toUpperCase(), bold: true, size: 96,
                               color: BRAND, characterSpacing: 60 })],
    }),
    new Paragraph({
      spacing: { after: 400 },
      children: [new TextRun({ text: BOOK_SUBTITLE, size: 26, color: INK2 })],
    }),
    new Paragraph({
      spacing: { after: 60 },
      children: [new TextRun({ text: BOOK_NAME.toUpperCase(), bold: true, size: 30,
                               color: ACCENT, characterSpacing: 80 })],
    }),
    new Paragraph({
      spacing: { after: 600 },
      children: [new TextRun({ text: VERSION, size: 19, color: INK2 })],
    }),
    body("This is the reference. Everything the system knows is written down once, here, and " +
         "every other book we publish is a view onto it. Where another document disagrees with " +
         "this one, this one is right and the other one is a defect.", { italics: true }),
    spacer(400),
    body("Complete. Parts 0 to VII.", { size: 18, color: INK2 }),
  ];
}

function contents() {
  const rows = [
    ["Part 0", "This Book", "What is canon, and how to read the marks"],
    ["Part I", "The Project", "What Ludus is, the Laws, the whole thing on one page, who does what"],
    ["Part II", "The System", "The roll, the Focuses, the Moves, the Archetypes, Growth, the table economy"],
    ["Part III", "The Method ★", "Two clocks, the lesson cycle, the thirteen Actions, all 72 units, the quiz, Growth Moments"],
    ["Part IV", "Running the Table", "The session, preparation, Session Zero, creation, the scene, the debrief, the lantern"],
    ["Part V", "The Doors", "The hall and the ritual, the four-arc skeleton, the anatomy of a Door Book, changing world"],
    ["Part VI", "Operations", "The six tools, the Panel field by field, student movement, opening a class, a partner teacher"],
    ["Part VII", "Reference", "The Glossary, the index of tables, and the decision log"],
  ];
  return [
    pageBreak(),
    h2("What is in this book"),
    spacer(80),
    dataTable(["", "PART", "WHAT IS IN IT"], rows, [1200, 2400, W - 3600]),
  ];
}

// ---------------------------------------------------------------------------
// PART 0 — THIS BOOK
// ---------------------------------------------------------------------------
function ch01() {
  const c = [];
  c.push(...chapterOpener("Chapter 0.1", "How to Use This Book"));
  c.push(lead("You are not meant to read this cover to cover. You are meant to be able to settle " +
              "an argument with it in under a minute."));

  c.push(h2("What this book is for"));
  c.push(body(
    `${GAME_NAME} is an English course delivered as a tabletop roleplaying game. That sentence ` +
    `implies two whole professions — teaching and game mastering — and a great many small ` +
    `decisions where the two pull in different directions. This book is where those decisions live.`));
  c.push(body(
    "Every other document is a view onto this one. The Player's Guide is the student's view, the " +
    "Master's Guide the teacher's, a Door Book one setting's. None of them may invent anything."));

  c.push(box("The rule that makes this work",
    ["A rule, a term or a number exists in exactly one place. When another document disagrees " +
     "with this book, that document is wrong — not debatable, wrong — and the fix is to correct " +
     "the source and rebuild it, never to argue about which one to believe.",
     "This is not tidiness. It is the only thing that stops four books drifting apart over a year " +
     "of small edits, which is exactly what happened before this book existed."], CRIT, "FBEDEC"));

  c.push(h2("How to find something"));
  c.push(body(
    "A word defined: the Glossary. A rule: the part header on every page tells you which half of " +
    "the book you are in — Part II is the system, Part III is the method. And why a rule is the " +
    "way it is: printed next to the rule, never hidden in a designer's notebook."));

  c.push(h2("Who it is for"));
  c.push(body(
    `Three readers. ${HOUSE}, when nobody remembers what was decided last time. A partner ` +
    `teacher, on the week they take their first table. And whoever writes the next Door.`));
  c.push(body(
    "It is in English, like every book here — everything used at the table is in English, and a " +
    "teacher who cannot read a technical manual in English cannot run one of these rooms.",
    { italics: true }));

  c.push(h2("What is not in here"));
  c.push(dataTable(["NOT HERE", "WHERE IT IS"], [
    ["The story of any one setting", "The Door Book for that setting. This book says what a Door must contain, not what is in one."],
    ["How to run a scene well", "The Master's Guide. Craft belongs there; rules belong here."],
    ["What a student reads first", "The Player's Guide, and the two one-page sheets that go with it."],
    ["Any group's timetable", "That group's Classroom. No book names a day."],
  ], [3400, W - 3400]));
  return c;
}

function ch02() {
  const c = [];
  c.push(...chapterOpener("Chapter 0.2", "Reading the Marks"));
  c.push(lead("Four marks, and they mean the same thing in every book we publish."));

  c.push(body(
    "The system and the coursebook are two different things, and one of them may be replaced one " +
    "day while the other stays. So everything that depends on the coursebook is marked in purple, " +
    "with a star — visible on the page without being read."));

  c.push(spacer(100));
  c.push(trailBox("what the mark means",
    [`A block like this one depends on ${M.COURSEBOOK}. Swap the coursebook and this block has to ` +
     `be rewritten; nothing outside the marked blocks has to change.`,
     "In the source, every one of these lives in a single file — which is what makes the mark a " +
     "promise rather than an intention."]));
  c.push(spacer(140));

  c.push(h2("The other three"));
  c.push(spacer(60));
  c.push(box("a rule", "A blue block is a rule you may not bend. It is the same rule in every " +
    "Door, at every table, for every teacher.", ACCENT));
  c.push(spacer(100));
  c.push(box("a warning", "An amber block is a place where tables reliably go wrong. It is not " +
    "a rule — it is experience, written down so you do not have to buy it twice.", WARN));
  c.push(spacer(100));
  c.push(box("never", "A red block is a thing that must not happen. There are very few of these, " +
    "and each one is load-bearing: break it and something else in the system quietly stops working.",
    CRIT, "FBEDEC"));

  c.push(h2("Three words that are not interchangeable"));
  c.push(body("Used precisely everywhere in these books, and confused constantly in conversation."));
  c.push(dataTable(["WORD", "MEANS"], [
    ["A session", "One meeting. Whatever its length, however many lessons it covers. Language Points and Spotlight Tokens run per session."],
    ["A lesson", "One hour of class, and one step of the cycle. A two-hour session is one session containing two lessons."],
    ["A unit", `One unit of ${M.COURSEBOOK}: four lessons, two topics, one quiz at the end.`],
  ], [2200, W - 2200]));
  return c;
}

// ---------------------------------------------------------------------------
// PART I — THE PROJECT
// ---------------------------------------------------------------------------
function ch1() {
  const c = [];
  c.push(...chapterOpener("Chapter 1", `What ${GAME_NAME} Is`));
  c.push(lead("An English course that happens to be a roleplaying game, and a roleplaying game " +
              "that happens to be an English course. Both halves are real."));

  c.push(body(
    "A group of up to four students meets for two hours a week and plays a story in English. " +
    "Each of them has a character. The teacher runs the world. Nobody is asked to produce a " +
    "sentence they would never say, because the sentences are demanded by the fiction: a locked " +
    "door, a suspicious guard, a promise somebody has to talk their way out of."));
  c.push(body(
    "Underneath that, each student is walking their own path through a coursebook — their own " +
    "unit, their own grammar, their own quiz — and the teacher steers scenes so that the thing " +
    "each of them is studying this week is the thing their character needs to say."));

  c.push(box("The claim, stated plainly",
    "Production is the bottleneck in adult language learning, not input. Students understand far " +
    "more than they say, and the reason they do not say it is that ordinary classes are low-stakes " +
    "and low-consequence. A scene with something at stake fixes that, and it fixes it without " +
    "anybody being put on the spot, because the pressure is on the character."));

  c.push(h2("Why it runs at four"));
  c.push(body(
    "Four is the largest table where nobody can hide and nobody has to wait long. At five, the " +
    "quiet student is silent for twenty minutes at a stretch. At three, a single absence changes " +
    "the shape of the evening. Four also happens to be the number of Archetypes, which is not a " +
    "coincidence — the roles were built to fill a table of four without overlapping."));

  c.push(h2("What it is not"));
  c.push(dataTable(["IT IS NOT", "BECAUSE"], [
    ["A conversation club", "There is a syllabus, a test and a record. A parent can see the unit, the mark and the date."],
    ["A game with vocabulary bolted on", "The language target is chosen per student, per week, from their own coursebook position — not from the story."],
    ["A class where the teacher performs", `The teacher's job is to distribute the invitation. The measure of a session is how much English the students produced, not how good the story was.`],
    ["Free-form improvisation", "There is a system. It is small, but it is a system, and it is the same one behind every Door."],
  ], [3200, W - 3200]));

  c.push(h2("The shape of the product"));
  c.push(body(
    `${HOUSE} is the school. ${GAME_NAME} is the system — what is printed on the cover of every ` +
    `book. ${METHOD} is the internal shorthand for the method, and it appears in the repository, ` +
    `in spreadsheets and in notes like this one, and never on anything a student sees.`));
  c.push(body(
    "Latin ludus means both school and game. The double meaning is the entire thesis of the " +
    "product in one word, and it is also, in the fiction, the name of the hall the players return " +
    "to between worlds.", { italics: true }));
  return c;
}

function ch2() {
  const c = [];
  c.push(...chapterOpener("Chapter 2", "The Laws"));
  c.push(lead("Seven. They are not style, they are load-bearing: each one is holding something up, " +
              "and the note under each says what."));
  c.push(body(
    "A rule can be revised. A Law can be revised too, but only deliberately and only here — and " +
    "anything built on top of it has to be re-examined at the same time. That is what makes them " +
    "different from the rest of the book."));
  c.push(spacer(120));

  S.laws.forEach(([title, text], i) => {
    c.push(lawBlock(i + 1, title, text));
  });

  c.push(spacer(200));
  c.push(box("How to use a Law",
    "When a new rule is proposed, hold it against all seven. Most bad ideas in this system die " +
    "against Law 1 — they want to give somebody a bonus for being good, and the moment the dice " +
    "reward proficiency, the beginner at the table is playing a worse game than the advanced " +
    "student sitting next to them."));
  return c;
}

function ch3() {
  const c = [];
  c.push(...chapterOpener("Chapter 3", "The Whole Thing on One Page"));
  c.push(lead("Five moving parts. If you understand how they connect, everything else in this " +
              "book is detail."));

  c.push(h2("The two clocks"));
  c.push(body(
    "This is the idea everything else hangs from, and it is the one newcomers get wrong first. " +
    "There are two independent clocks and they are never synchronised."));
  c.push(dataTable(["CLOCK", "WHAT RUNS ON IT"], M.twoClocks, [2600, W - 2600]));
  c.push(spacer(120));
  c.push(box("Why they must stay separate",
    "If the campaign waited for the slowest student, the table would crawl. If the trail waited " +
    "for the campaign, a fast student would be held back by a story beat. Keeping them apart is " +
    "what lets four people at four different levels of English sit at one table without anybody " +
    "being dragged or stalled."));

  c.push(pageBreak());
  c.push(h2("The five parts"));
  c.push(dataTable(["PART", "WHAT IT DOES", "WHERE IT IS WRITTEN"], [
    ["The student", "Plays a character, walks their own coursebook trail, manages their own resources at the table.", "Player's Guide"],
    ["The table", "Four students and a teacher, two hours a week, one continuing story.", "Master's Guide"],
    ["The system", "2d6 plus a Focus, six Moves, four Archetypes, twelve Growth Levels. Identical behind every Door.", "This book, Part II"],
    ["The trail ★", `Each student's own path through ${M.COURSEBOOK}: unit, lesson, quiz.`, "This book, Part III"],
    ["The Door", "The world this table is playing in, and the campaign inside it.", "That Door's book"],
  ], [2000, 4600, W - 6600]));

  c.push(h2("How a week actually goes"));
  c.push(dataTable(["WHEN", "WHAT HAPPENS"], [
    ["Between sessions", `The student does their coursebook homework — ${M.HOMEWORK_LOAD.toLowerCase()}`],
    ["Ten minutes before", "The teacher opens the Panel and types three things per student: level, unit, lesson of the cycle. Everything else is calculated."],
    ["The session", "The story runs. Each student's own language target is steered into a scene where their character needs it."],
    ["The debrief", "Language Points are counted out loud. The teacher announces each student's total for next time; the student writes it on their own sheet."],
    ["After", "The teacher advances the lesson column and, at the end of a D lesson, releases that student's quiz."],
  ], [2400, W - 2400]));

  c.push(spacer(140));
  c.push(trailBox("what depends on the coursebook",
    `Of those five parts, exactly one — the trail — knows that ${M.COURSEBOOK} exists. ` +
    `The system does not. The Door does not. The table does not. That separation is the reason ` +
    `changing coursebook one day is a rewrite of one chapter and not of the product.`));
  return c;
}

function ch4() {
  const c = [];
  c.push(...chapterOpener("Chapter 4", "Who Does What"));
  c.push(lead("Three roles, one sentence each, and then the detail."));

  c.push(h2("The teacher"));
  c.push(body(
    "Runs the world, and distributes the invitation. Not the minutes — the invitation. The " +
    "difference matters: counting talk time makes a teacher into a stopwatch, while making sure " +
    "every student is asked something they cannot answer in three words does the same job and " +
    "leaves the scene intact."));
  c.push(dataTable(["THE TEACHER", "IN PRACTICE"], [
    ["Prepares", "Ten minutes with the Panel. Reads four rows and knows what each student needs to say tonight."],
    ["Steers", "Aims scenes so each student's own language target becomes the thing their character needs."],
    ["Never corrects mid-scene", "The correct form comes back inside the teacher's next line, in character. Nobody is told they were wrong out loud."],
    ["Counts, once", "At the debrief. Announces each student's Language Points for next session."],
    ["Decides", "Whether a stalled student moves on. The quiz is a signal, not a gate."],
  ], [2800, W - 2800]));

  c.push(h2("The student"));
  c.push(body(
    "Plays a character, does the homework, and manages their own resources. That last one is " +
    "deliberate and it is not administrative laziness: a student who tracks their own Language " +
    "Points has to say out loud, in English, that they are spending one."));
  c.push(dataTable(["THE STUDENT", "IN PRACTICE"], [
    ["Turns up", "The story continues from where it stopped, with the same people."],
    ["Does the homework", `${M.HOMEWORK_LOAD} It is worth a Language Point.`],
    ["Speaks badly on purpose", "A wrong sentence that moves the scene is worth more than a right one that was never said."],
    ["Keeps their own count", "Language Points and Spotlight Tokens live on their sheet, in their hand."],
    ["Holds their own pace", M.pacing.theBrake],
  ], [2800, W - 2800]));

  c.push(pageBreak());
  c.push(h2("The school"));
  c.push(body(
    `${HOUSE} owns the trail and the record. It sets the class up, ties the coursebook purchase ` +
    `to enrolment, keeps the Panel, and can show a parent a unit, a mark and a date on any day ` +
    `of the year. It also owns the thing nobody else can: the promise that a student who moves ` +
    `between groups keeps everything.`));

  c.push(spacer(120));
  c.push(box("The division that keeps the data honest",
    ["The platform is the student's territory: their homework, their marks, their progress. " +
     "The Panel is the teacher's: which lesson of the cycle each student is on — information " +
     "that only exists because somebody ran the sessions.",
     "Neither one copies the other. The moment the same fact lives in two places, one of them " +
     "starts being wrong and nobody can tell which."], WARN, "FDF4E4"));

  c.push(h2("And the partner teacher"));
  c.push(body(
    `This method is not meant to stay with one person. A partner teacher reads the Player's ` +
    `Guide, then this book, then the Master's Guide, then the Door Book for the world they are ` +
    `taking on — in that order, because each one assumes the one before it. What they need from ` +
    `${HOUSE} is a Panel, a Classroom and a Door. What ${HOUSE} needs from them is a session run ` +
    `in front of somebody before they run one alone.`));
  return c;
}

// ---------------------------------------------------------------------------
// PART II — THE SYSTEM
// ---------------------------------------------------------------------------
function ch5() {
  const c = [];
  c.push(...chapterOpener("Chapter 5", "The Roll"));
  c.push(lead("Two dice, one number added, three possible outcomes. That is the whole engine, " +
              "and it never grows."));

  c.push(body(
    "Roll 2d6. Add them together. Add the Focus the Move asks for. Read the total against three " +
    "bands. There is no other resolution mechanic anywhere in this system."));
  c.push(spacer(100));
  c.push(dataTable(["TOTAL", "BAND", "WHAT IT MEANS"],
    S.outcomeBands.map(([n, , label, meaning]) => [n, label, meaning]),
    [1400, 2400, W - 3800]));

  c.push(h2("Why 2d6 and not a d20"));
  c.push(body(
    "Two six-sided dice produce a hump, not a flat line: sevens are common, twelves and twos are " +
    "rare. That means the middle band — the one where you get what you wanted but it costs you " +
    "something — is the band you land in most often. The system is built so that the usual " +
    "outcome is interesting rather than clean, because a complication is a reason to keep talking " +
    "and a clean success is a reason to stop."));

  c.push(h2("The band that does the work"));
  c.push(body(
    "Strong Hits end a problem. Misses hand the scene to the teacher. The Mixed Result is where " +
    "the language lives: the student got what they wanted and now has to negotiate the price, in " +
    "English, right now, with somebody who wants something back."));

  c.push(spacer(120));
  c.push(box("Never modify the dice",
    ["Nothing in this system adds a flat bonus to a roll. Not your Kit, not a Boon, not a chest " +
     "full of gold, not your Growth Level, not your English. There is no +1 anywhere in this book " +
     "and there is no exception.",
     "What effort buys is a reroll — a second chance at the same dice. That is the only currency " +
     "the engine accepts, and it is why a beginner and a fluent speaker sit down with mathematically " +
     "identical odds."], CRIT, "FBEDEC"));

  c.push(h2("One roll, all the way through"));
  c.push(body("A worked example, so the parts are visible in motion.", { italics: true }));
  c.push(spacer(80));
  c.push(box("at the table", [
    `Teacher: "The quartermaster crosses his arms. 'I've heard every sob story in this camp. Why should your lot get the last of the draughts?'"`,
    `Student: "Because when the wounded arrive tonight, you'll have wished you gave them to us."`,
    `Teacher: "That's Persuade or Manipulate. Roll it."`,
    `The dice come up 3. The student's Wit is +2. Total 5 — a Miss. They spend a Language Point, reroll, and get 6: total 8, a Mixed Result.`,
    `Teacher: "Fine. Take two. But the healer is watching you both now, and she is not the forgiving type."`,
  ], GOOD, "E8F4EE"));
  return c;
}

function ch6() {
  const c = [];
  c.push(...chapterOpener("Chapter 6", "The Four Focuses"));
  c.push(lead("Four numbers, fixed at creation, and they never go up."));

  c.push(body(
    "Every character holds a +2, a +1, a +0 and a −1, one in each Focus, in whatever order the " +
    "student chooses. That array never changes. Where you are strong is your decision; how strong " +
    "you get is nobody's, because nothing in twelve levels of Growth raises a Focus."));
  c.push(spacer(100));
  c.push(dataTable(["FOCUS", "COVERS", "YOU ROLL IT WHEN"],
    S.focuses, [1800, 3600, W - 5400]));

  c.push(h2("Why they are frozen"));
  c.push(body(
    "A rising number is the most natural reward in games and the worst possible one here. If " +
    "Focuses grew, a student who had been at the table for a year would have better odds than a " +
    "student who joined last month — and since the long-standing student is usually also the " +
    "stronger speaker, the game would be handing an advantage to the person who least needs one."));
  c.push(body(
    "So the reward is elsewhere: in what your character can do in the fiction, in what the world " +
    "owes you, in Boons and Signature Move tiers. Never in the arithmetic.", { italics: true }));

  c.push(h2("Choosing the array"));
  c.push(body(
    "Students pick fast and they pick by personality, which is correct. The only advice worth " +
    "giving at Session Zero is this: the −1 is where the interesting scenes come from, so put it " +
    "somewhere you want to be tested rather than somewhere you plan to avoid."));
  return c;
}

function ch7() {
  const c = [];
  c.push(...chapterOpener("Chapter 7", "The Six Moves"));
  c.push(lead("Six things a character can do that need dice. Everything else just happens."));

  c.push(body(
    "A Move is triggered by fiction, not chosen from a menu. The student describes what their " +
    "character does; if it matches a trigger below, it is that Move, and the teacher says so."));
  c.push(spacer(100));
  c.push(dataTable(["MOVE", "FOCUS", "TRIGGERS WHEN…"],
    S.moves.map((m) => [m.name, m.focus, m.trigger]),
    [2600, 1400, W - 4000]));

  c.push(pageBreak());
  c.push(h2("The three bands, Move by Move"));
  S.moves.forEach((m, i) => {
    if (i === 3) c.push(pageBreak());   // 3 e 3: nenhum Move parte no meio
    c.push(h3(`${m.name}  ·  ${m.focus}`));
    c.push(dataTable(null, [
      ["10+", m.strong],
      ["7–9", m.mixed],
      ["6−", m.miss],
    ], [1200, W - 1200], { plainFirst: false }));
    if (m.note) {
      c.push(spacer(60));
      c.push(body(m.note, { size: 18, italics: true, color: INK2 }));
    }
    c.push(spacer(120));
  });

  c.push(box("Two of these are language machines",
    ["Read the Scene on a Miss makes the TEACHER ask the question, and the student has to answer " +
     "it out loud, in English. A failed roll produces more speech than a successful one.",
     "Help or Interfere only exists between two players. It is the Move that forces the table to " +
     "talk to each other rather than to the teacher, and it is the one to point a dominant speaker " +
     "at when they are taking every scene."], GOOD, "E8F4EE"));
  return c;
}

function ch8() {
  const c = [];
  c.push(...chapterOpener("Chapter 8", "Archetypes, Kits and Money"));
  c.push(lead("Four roles, what each always carries, and a money system with no arithmetic in it."));

  c.push(h2("The four Archetypes"));
  c.push(body(
    "An Archetype is a role, not a class. It sets two things and nothing else: the Kit your " +
    "character always has, and the Signature Move they start with. It does not touch a Focus and " +
    "it does not touch a die."));
  c.push(body(
    "There are four, and a table of four can hold one of each without any two students competing " +
    "for the same job — which is the whole design brief. Vanguard stands in front. Diplomat " +
    "talks. Strategist plans. Scout goes and looks."));

  c.push(h2("Signature Moves"));
  c.push(body(
    `Each character has one Signature Move from their Archetype. ${S.signatureMoves.main}`));
  c.push(spacer(80));
  c.push(box("Cross-Training", [
    S.signatureMoves.crossTrainingRule,
    S.signatureMoves.why,
  ], ACCENT));
  c.push(spacer(80));
  c.push(body(
    `So a character can end a long career holding ${S.signatureMoves.perCharacter} Signature ` +
    `Moves: one that grew with them, and two borrowed ones that never will.`, { italics: true }));

  c.push(pageBreak());
  c.push(h2("What you carry"));
  c.push(dataTable(["", "WHAT IT IS"], S.carryRows, [2000, W - 2000]));
  c.push(spacer(120));
  c.push(box("The rule that justifies counting anything at all", [
    S.packFullRule,
    "That sentence is the entire reason Pack slots exist in a language class. A full pack in " +
    "front of an open vault is the most reliable argument this system knows how to start, and " +
    "every word of it happens in English.",
  ], GOOD, "E8F4EE"));

  c.push(h2("Money"));
  c.push(body(
    "Four rungs, and you will never do arithmetic with them. The ladder answers what a rung buys, " +
    "not how much you have."));
  c.push(spacer(100));
  c.push(dataTable(["RUNG", "WHAT IT BUYS"], S.moneyLadder, [2000, W - 2000]));
  c.push(spacer(140));
  c.push(body(
    "Ten of each makes one of the next, and that conversion is a fallback the table should almost " +
    "never need to say out loud. Prices are spoken in steps. Nothing costs one hundred and " +
    "thirty-seven of anything. A merchant says two handfuls; the student says that is too much; " +
    "the two of them find out who is more stubborn — and that conversation is the point of having " +
    "money in the game at all."));

  c.push(spacer(120));
  c.push(box("What everyone starts with", [
    `${S.startingMoney.amount.charAt(0).toUpperCase() + S.startingMoney.amount.slice(1)}. The same ` +
    `amount for every character, whatever their Archetype — for the same reason everybody starts ` +
    `at Growth 1: nothing at the start may advantage one student over another.`,
    `Enough that nobody worries about a meal or a bed, and nowhere near the bag a horse or a ` +
    `working bribe costs. You cannot buy your way out of your first real problem.`,
    `At Session Zero every student answers one question in English: "${S.startingMoney.question}" ` +
    `It takes eight seconds and it turns identical money into a personal history.`,
  ], ACCENT));
  return c;
}

function ch9() {
  const c = [];
  c.push(...chapterOpener("Chapter 9", "Boons and the Ladders"));
  c.push(lead("How the world pays you, and the two scales this system uses instead of numbers."));

  c.push(h2("Boons"));
  c.push(body(
    "A Boon is earned only at a Growth Moment, and it is always narratively strong and " +
    "mechanically silent: a door that opens for you, a person who owes you and knows it, an " +
    "object that does one impossible thing once."));
  c.push(body(
    "Boons take no Pack slot, are not lost in an ordinary scene, and never add to a roll. They " +
    "follow a character into a new world: when a table changes Door, a Boon is reimagined, not lost."));

  c.push(h2("Distance"));
  c.push(body(
    "Four words instead of metres, so that the answer to \"can I reach it?\" is a word everyone at " +
    "the table already knows."));
  c.push(spacer(100));
  c.push(dataTable(["HOW FAR", "MEANS"], S.distanceLadder, [2200, W - 2200]));

  c.push(h2("Price"));
  c.push(body("The same idea applied to money: a ladder of what things cost, in steps."));
  c.push(spacer(100));
  c.push(dataTable(["THIS COSTS", "ABOUT"], S.priceExamples, [W - 2400, 2400], { plainFirst: true }));

  c.push(spacer(140));
  c.push(box("Why ladders instead of numbers",
    "Every number in a game is a moment when somebody stops speaking and starts calculating. " +
    "Ladders keep the table in language: a rung is a word, a word can be argued with, and an " +
    "argument is production. This is the same instinct behind the outcome bands and behind the " +
    "money system, and it is worth defending whenever a new rule proposes a number."));
  return c;
}

function ch10() {
  const c = [];
  c.push(...chapterOpener("Chapter 10", "Growth"));
  c.push(lead("Twelve levels, and the most misunderstood number in the system."));

  c.push(body(
    `Growth Level is how far a character has travelled. It runs from ${M.growthRule.startsAt} to ` +
    `${M.growthRule.levels}, it rises at a Growth Moment, and it never touches a die.`));

  c.push(spacer(100));
  c.push(box("Growth Level is not the coursebook level", [
    M.growthRule.notTheSameAs,
    `The only connection between them is the trigger: ${M.growthRule.trigger} That is a trigger, ` +
    `not an equivalence. Two students at completely different coursebook levels gain Growth in ` +
    `exactly the same way, each on their own clock.`,
  ], CRIT, "FBEDEC"));

  c.push(h2("Everybody starts at one"));
  c.push(body(
    "A C1 speaker and an A1 speaker sit down at the same Growth Level on their first day. The " +
    "advanced student's English is already the advantage they have; the system does not stack a " +
    "second one on top of it. And the beginner does not start the game marked as the weakest " +
    "person in the room in the one place where the game could have made them equal."));
  c.push(body(
    "There is no formula converting one number into the other. A formula of that shape once " +
    "circulated in our own operational notes and reached a real classroom before it was caught. " +
    "It is wrong, and it is retired.", { italics: true }));

  c.push(h2("What a level actually gives you"));
  c.push(spacer(80));
  c.push(dataTable(["LEVEL", "UNITS DONE HERE", "WHAT YOU GAIN"],
    S.growthLadder, [1600, 2600, W - 4200]));
  c.push(spacer(140));
  c.push(dataTable(["THE KIND OF GROWTH", "WHAT IT IS"], S.growthKinds, [2600, W - 2600]));
  c.push(spacer(140));
  c.push(box("And never, at any level",
    "A Focus. A die. A flat bonus of any kind. The array a student places at creation is the " +
    "array they roll with at Level 12.", CRIT, "FBEDEC"));

  c.push(spacer(140));
  c.push(trailBox("when a Growth Moment happens",
    `${M.growthRule.trigger} Six units is one half-book, so the purchase the student makes and ` +
    `the reward the game gives land on the same rhythm — which is an accident of the coursebook's ` +
    `structure, and a convenient one.`));
  return c;
}

function ch11() {
  const c = [];
  c.push(...chapterOpener("Chapter 11", "The Table Economy"));
  c.push(lead("Two small currencies. One buys dice, the other buys airtime, and both belong to " +
              "the student."));

  c.push(h2("Language Points"));
  c.push(body(
    `A Language Point is a reroll. ${S.languagePoints.spend}`));
  c.push(spacer(100));
  c.push(dataTable(["EARNED FOR", "HOW MUCH"], S.languagePoints.earn, [W - 3000, 3000]));

  c.push(spacer(140));
  c.push(box("Paid for the attempt", S.languagePoints.lawOfTheAttempt, CRIT, "FBEDEC"));

  c.push(h2("Counted at the close, spent next time"));
  c.push(body(
    `Points are counted out loud in the debrief — ${M.pointsRhythm.sentence} The teacher announces ` +
    `each student's total; the student writes it on their own sheet. They are not handed out ` +
    `mid-scene and spent two minutes later.`));
  c.push(body(
    "Three reasons. The count is calm instead of constant. The teacher is not interrupting scenes " +
    "to award things. And a student sits down each week already holding something they earned by " +
    "being present the week before, which is a better reason to turn up than a register."));
  c.push(body(
    `Points go no further than that: whatever is not spent in the following session is gone. ` +
    `Nothing banks.`, { italics: true }));

  c.push(pageBreak());
  c.push(h2("Spotlight Tokens"));
  c.push(body(
    `${S.spotlightTokens.start} at the start of every session, the same ${S.spotlightTokens.start} ` +
    `for everybody, whatever their Archetype and whatever their English. ${S.spotlightTokens.spend}`));
  c.push(spacer(100));
  c.push(dataTable(["RULE", "WHY"], [
    [`At most ${S.spotlightTokens.maxPerScene} per scene`,
     "Three tokens are meant to last a session, not an opening. Without this, the brake gets spent in the first ten minutes — which is exactly when it is needed."],
    ["Transferable", S.spotlightTokens.transferRule],
    ["Running out is not silence", S.spotlightTokens.outOfTokensRule],
    ["They never bank", `Back to ${S.spotlightTokens.start} next session, whatever is left.`],
  ], [2800, W - 2800]));

  c.push(spacer(140));
  c.push(box("What the tokens are really for", S.spotlightTokens.purpose, WARN, "FDF4E4"));
  c.push(spacer(120));
  c.push(body(
    "The transfer rule is the half that people miss. Without it, tokens brake the loud student " +
    "and do nothing for the quiet one, whose three expire unused every week. With it, the quiet " +
    "student holds something worth having, and the student who has spent all three can only get " +
    "another by being given one — by the people he has been talking over. The loop corrects itself " +
    "without the teacher having to say anything."));

  c.push(h2("Who keeps the count"));
  c.push(dataTable(["", "WHO"], [
    ["Announces", S.languagePoints.announcedBy],
    ["Keeps the running total", S.languagePoints.keptBy],
    ["Spotlight Tokens", S.spotlightTokens.keptBy],
  ], [2600, W - 2600]));
  c.push(spacer(120));
  c.push(body(
    "This is not administrative convenience. A student who tracks their own points has to say out " +
    "loud, in English, that they are spending one — and that sentence is a small piece of " +
    "production the teacher would otherwise have performed for them.", { italics: true }));
  return c;
}

function ch12() {
  const c = [];
  c.push(...chapterOpener("Chapter 12", "Safety, Tone and the Ceiling"));
  c.push(lead("A design constraint, not a warning label."));

  c.push(body(
    "Everything published for this system — every Door, every arc, every NPC — sits at 13 and up. " +
    "Tension, danger, loss and moral weight are all in. Graphic violence, sexual content and " +
    "cruelty as entertainment are all out."));
  c.push(body(
    "This is a constraint on the designer, not a filter applied afterwards. A Door that needs a " +
    "reader to look away has been designed wrong, and the fix is in the writing rather than in a " +
    "content warning."));

  c.push(h2("English at the table, with two exceptions"));
  c.push(body(
    "Everything said in character is in English, including the arguing, the joking and the " +
    "complaining. Two things are always allowed in the student's own language, and neither one is " +
    "a failure: saying you are uncomfortable, and asking for a word you do not have."));
  c.push(spacer(100));
  c.push(dataTable(["ALWAYS ALLOWED", "AND THEN"], [
    ["Stopping a scene because it went somewhere you did not want", "The scene stops. No explanation is owed, and nobody asks for one."],
    ["Asking for a word — how do I say ___?", "Somebody gives it, and the student says the whole sentence again, in English, with the word in it."],
  ], [4200, W - 4200]));

  c.push(h2("Mistakes are how we play"));
  c.push(body(
    "Nobody is corrected in the middle of a scene. The correct form comes back inside the " +
    "teacher's next line, in character, and the student either picks it up or does not. A student " +
    "who is interrupted to be corrected stops producing and starts monitoring, and a room full of " +
    "people monitoring their own grammar is a silent room."));

  c.push(h2("The five rules of the table"));
  c.push(body(
    "These are printed on the student's table sheet and read aloud in Session Zero. They are the " +
    "whole of the table's etiquette; there is no sixth."));
  c.push(spacer(80));
  c.push(dataTable(["RULE", "WHAT IT MEANS"], S.tableRules, [3000, W - 3000]));

  c.push(spacer(140));
  c.push(box("Say It Again",
    `${S.sayItAgain.what} ${S.sayItAgain.rule} ${S.sayItAgain.why}`, GOOD, "E8F4EE"));
  return c;
}


// ---------------------------------------------------------------------------
// PART III — THE METHOD  ★
// ---------------------------------------------------------------------------
function ch13() {
  const c = [];
  c.push(...chapterOpener("Chapter 13", "Two Clocks"));
  c.push(lead("The idea the whole method hangs from, and the one newcomers get wrong first."));

  c.push(body(
    "There are two clocks in this system and they are never synchronised. Trying to synchronise " +
    "them is the single most common instinct a new teacher has, and it breaks the thing that " +
    "makes a mixed-level table possible."));
  c.push(spacer(100));
  c.push(dataTable(["CLOCK", "WHAT RUNS ON IT"], M.twoClocks, [2600, W - 2600]));

  c.push(h2("Why they must stay apart"));
  c.push(body(
    "If the campaign waited for the slowest student, the table would crawl and the story would " +
    "lose its shape. If the trail waited for the campaign, a student who studies hard would be " +
    "held at a unit by a story beat that has nothing to do with them."));
  c.push(body(
    "Kept apart, four people at four different levels of English sit at one table and none of " +
    "them is dragged or stalled. Four players on four different units of three different levels " +
    "is not a problem to be managed. It is the normal, healthy state of a table."));

  c.push(spacer(120));
  c.push(box("What this costs the teacher",
    "One thing, and it is real: you cannot prepare a single lesson for the room. You prepare a " +
    "scene for the room and four language targets for four people. That is what the Panel is for, " +
    "and it is why the Panel calculates rather than asks."));

  c.push(h2("Who holds the brake"));
  c.push(body(M.pacing.theBrake));
  c.push(body(M.pacing.why));
  c.push(spacer(100));
  c.push(trailBox("read every number as a ceiling", M.pacing.soThePlanIsACeiling));
  return c;
}

function ch14() {
  const c = [];
  c.push(...chapterOpener("Chapter 14", "The Lesson Cycle"));
  c.push(lead("Four lessons per unit, two topics, one quiz. The same five letters behind every " +
              "Door and in every group."));

  c.push(body(
    `One unit of ${M.COURSEBOOK} carries two lessons with different grammar. The cycle walks a ` +
    `student through both of them twice — once to meet the topic, once to own it — and ends in ` +
    `the quiz.`));
  c.push(spacer(100));
  c.push(dataTable(["", "WHAT IT IS", "WHAT HAPPENS", "PRESENTS?"],
    M.lessonCycle, [700, 2100, W - 4600, 1800]));

  c.push(spacer(140));
  c.push(box("Three things that are always true", M.cycleNotes, ACCENT));

  c.push(h2("One lesson is one hour"));
  c.push(body(
    "This is the sentence that stops the arithmetic going wrong. A lesson of the cycle is one " +
    "hour of class. A session is one meeting. A two-hour meeting is one session containing two " +
    "lessons, and an hour-long meeting is one session containing one."));
  c.push(spacer(100));
  c.push(dataTable(["FORMAT", "LENGTH", "HOW IT MAPS", "WHO"],
    M.sessionFormats, [2000, 1900, W - 5300, 1400]));
  c.push(spacer(140));
  c.push(body(M.trailPace.note, { italics: true }));

  c.push(h2("The arithmetic, once, so nobody re-derives it"));
  c.push(spacer(80));
  c.push(dataTable(["", "IS"], [
    ["Lessons a week", String(M.trailPace.lessonsPerWeek)],
    ["Lessons per unit", `${M.trailPace.lessonsPerUnit} — A, B, C and D. X is the exception, not the plan`],
    ["Weeks per unit", String(M.trailPace.weeksPerUnit)],
    ["Teaching weeks a year", String(M.trailPace.teachingWeeksPerYear)],
    ["Hours of class a year", String(M.trailPace.classHoursPerYear)],
    ["Units a year", `about ${M.trailPace.unitsPerYear}`],
    ["Growth Moments a year", `about ${M.trailPace.growthMomentsPerYear}`],
  ], [3200, W - 3200]));
  c.push(spacer(120));
  c.push(trailBox("and remember whose ceiling this is",
    "Every figure above is the fastest a student can lawfully go, not a quota any of them owes. " +
    "A student who is not ready holds the unit open by not sitting the quiz, and the table does " +
    "not notice."));
  return c;
}

function ch15() {
  const c = [];
  c.push(...chapterOpener("Chapter 15", "The Language Focus"));
  c.push(lead("One line on the sheet that is different for every player at the table."));

  c.push(body(
    "A student's Language Focus is the structure they are working on this week, taken from their " +
    "own position on the trail. The teacher writes it; the student does not choose it. It is the " +
    "only field in the entire system that is personal rather than shared."));

  c.push(h2("How it reaches a scene"));
  c.push(body(
    "Not by announcement. A teacher who says \"Juan, use the past simple\" has turned a scene into " +
    "an exercise, and the student can feel it happen. The Focus reaches the scene through the " +
    "fiction: the teacher builds a moment where the character has no way forward except the " +
    "structure the student happens to be studying."));
  c.push(spacer(100));
  c.push(dataTable(["INSTEAD OF", "DO THIS"], [
    ["\"Use the past simple.\"", "A magistrate who needs to know exactly what happened last night, and who interrupts anything that is not a sequence of events."],
    ["\"Try a comparative.\"", "Two horses, one purse, and a seller who asks which one and why."],
    ["\"Make a conditional.\"", "A guard who will let them through only if they can tell him what happens to him if he does."],
  ], [3200, W - 3200]));

  c.push(spacer(140));
  c.push(box("The teacher's actual job",
    "To know four language targets and build scenes whose pressure points land on them. That is " +
    "the craft of this method, and it is the reason the Master's Guide exists. This book only " +
    "says what a Focus is and where it comes from."));

  c.push(h2("It updates itself"));
  c.push(body(`${M.languageFocusRule.changesWhen} ${M.languageFocusRule.whoTypesIt}`));
  c.push(spacer(100));
  c.push(box("Not on the Growth clock", M.languageFocusRule.notTiedToGrowth, CRIT, "FBEDEC"));
  return c;
}

function ch16() {
  const c = [];
  c.push(...chapterOpener("Chapter 16", "The Thirteen Actions"));
  c.push(lead("What a speaker does with language, as opposed to what a grammar book calls it."));

  c.push(body(M.actionPrinciple));
  c.push(body(
    "So every unit of the trail is tagged with the Actions it pulls on, and a teacher designing " +
    "a scene works from the Action, not from the grammar. The thirteen below are ours — they " +
    "would survive a change of coursebook untouched."));

  c.push(spacer(100));
  c.push(dataTable(["", "ACTION", "WHAT IT IS"],
    M.actions.map((a) => [a[0], a[1], a[2]]), [900, 2100, W - 3000]));

  c.push(pageBreak());
  c.push(h2("What each one pulls on, and who embodies it"));
  c.push(body(
    "The last column is not decoration. The five permanent residents of the Ludus were built one " +
    "per family, so a teacher who needs a Narrate scene knows whose door to knock on.",
    { italics: true }));
  c.push(spacer(100));
  c.push(dataTable(["ACTION", "GRAMMAR IT USUALLY PULLS", "WHO IN THE LUDUS"],
    M.actions.map((a) => [a[1], a[3], a[4]]), [2000, W - 4600, 2600]));
  return c;
}

function ch17() {
  const c = [];
  c.push(...chapterOpener("Chapter 17", "★ The Official Language Focus Table"));
  c.push(lead(`All ${U.units.length} units of ${U.coursebook}, tagged. This is the table the ` +
              `Panel reads and the one every scene is ultimately built from.`));

  c.push(trailBox("this whole chapter",
    [`Everything from here to the end of the chapter depends on ${U.coursebook}. It is generated ` +
     `from one file, and swapping coursebook one day means regenerating that file from another ` +
     `catalogue — not rewriting this book.`,
     "Nothing in Parts I or II changes when that happens."]));

  c.push(h2("How to read it"));
  c.push(body(
    "Each unit gives two topics: lesson 1 drives the A and B lessons of the cycle, lesson 2 " +
    "drives C and D. The Actions column says what a speaker is actually doing with that grammar, " +
    "and it is the column a teacher builds a scene from."));

  if (U.unitsToCheck.length) {
    c.push(spacer(120));
    c.push(box("⚠ " + U.unitsToCheck.length + " units still need checking against the printed book",
      ["The catalogue records grammar per UNIT, not per lesson. The split into lesson 1 and " +
       "lesson 2 is inferred by cutting at the first semicolon, and in these units the catalogue " +
       "gives only one topic, so the second half could not be inferred at all:",
       U.unitsToCheck.map((u) => `${u.key} ${u.title}`).join("  ·  "),
       "Correcting one is a single cell in the catalogue. Every document that prints this table " +
       "then picks the new value up on the next build."], WARN, "FDF4E4"));
  }

  for (let lvl = 1; lvl <= 6; lvl += 1) {
    const rows = U.unitsOfLevel(lvl);
    if (!rows.length) continue;
    c.push(pageBreak());
    c.push(h2(`${U.coursebook} ${lvl}  ·  ${rows[0].cefr}`, TRAIL));
    c.push(spacer(60));
    c.push(dataTable(["UNIT", "TITLE", "LESSON 1 — A and B", "LESSON 2 — C and D", "ACTIONS"],
      rows.map((u) => [
        String(u.unit), u.title, u.lesson1, u.lesson2,
        u.action2 === "—" ? u.action1 : `${u.action1} / ${u.action2}`,
      ]),
      [700, 1700, 2900, 2900, W - 8200], { headFill: TRAIL }));
  }
  return c;
}

function ch18() {
  const c = [];
  c.push(...chapterOpener("Chapter 18", "★ The Quiz"));
  c.push(lead("One mark, released to one student, at the end of one lesson."));

  c.push(trailBox("what the quiz is now",
    [`The ${M.TEST_NAME} is ours: ${M.TEST_TOOL}. It is released ${M.testRule.released}, and the ` +
     `pass mark is ${M.testRule.passMark}%.`,
     `The coursebook platform is not involved in it at all. ${M.COURSEBOOK_PLATFORM} carries the ` +
     `homework — ${M.HOMEWORK_LOAD.toLowerCase()} — and marks it automatically. The teacher ` +
     `records nothing from there.`]));

  c.push(h2("Why we write it ourselves"));
  c.push(body(
    "The coursebook's own test was the plan until it wasn't. It capped a student at two attempts " +
    "and a third needed an administrator to reset the class, which is not something a teacher can " +
    "do on a Tuesday. Writing the quizzes ourselves removes the cap and the dependency in one move."));

  c.push(h2("Attempts"));
  c.push(body(
    `There is no hard limit. There is a soft one of ${M.testRule.softCap}, and it is a ` +
    `conversation rather than a wall.`));
  c.push(spacer(100));
  c.push(box("The soft cap", M.testRule.softCapReason, WARN, "FDF4E4"));

  c.push(h2("What happens after"));
  c.push(spacer(80));
  c.push(dataTable(["OUTCOME", "WHAT HAPPENS"], [
    [`${M.testRule.passMark}% or more`, M.testRule.onPass],
    ["Not yet passed", M.testRule.onStall],
    ["Stalled twice", M.testRule.watchpoint],
  ], [2600, W - 2600]));

  c.push(spacer(140));
  c.push(box("A signal, not a gate",
    "A quiz mark says something about a student's week. It does not say whether they can hold a " +
    "conversation, and the teacher has watched them try for two hours. When the two disagree, the " +
    "two hours win — that is why the decision to move a stalled student on belongs to the teacher " +
    "and not to the percentage."));
  return c;
}

function ch19() {
  const c = [];
  c.push(...chapterOpener("Chapter 19", "Growth Moments"));
  c.push(lead("The long clock. It ticks about four times a year and everybody at the table knows " +
              "when it does."));

  c.push(trailBox("the trigger", M.growthRule.trigger));
  c.push(spacer(140));

  c.push(body(
    "Six units is one half-book, so the moment a student buys the next half of their coursebook " +
    "is roughly the moment the game gives them something. That alignment is an accident of how " +
    "the coursebook is sold, and a convenient one."));

  c.push(h2("What happens at the table"));
  c.push(body(
    "It is announced in the opening, out loud, by name. The character gains a level and a Boon, " +
    "and at levels 3, 7 and 12 their Signature Move moves up a tier. The whole thing takes two " +
    "minutes and it is the only moment in the week that is purely ceremonial."));
  c.push(body(
    "Keep it ceremonial. The temptation is to fold it into a scene, and the reason not to is that " +
    "a student who has just finished six units of study deserves thirty seconds where the table " +
    "stops and looks at them.", { italics: true }));

  c.push(h2("Three clocks of reward, not one"));
  c.push(body(
    "A Growth Moment about every twelve weeks would be far too slow on its own. It is the long " +
    "hand of a three-clock system, and the other two exist precisely because it is slow."));
  c.push(spacer(100));
  c.push(dataTable(["CLOCK", "HOW OFTEN", "WHAT IT PAYS"], [
    ["Short", "Every session", "Language Points. Earned tonight, spent next time."],
    ["Middle", "Every ten to twelve weeks", "The climax of an arc, and a story that actually resolves."],
    ["Long", `About ${M.trailPace.growthMomentsPerYear} times a year`, "A Growth Level and a Boon."],
  ], [1600, 3000, W - 4600]));

  c.push(spacer(140));
  c.push(box("Something that used to be a risk and is not any more",
    "Under the old arithmetic a new student would not reach their first Growth Moment inside " +
    "their first semester, and that was listed as a real danger to retention. With the pace " +
    "corrected, the first one lands around week twelve. The short clock still carries the weekly " +
    "load, but the long one is no longer out of sight.", GOOD, "E8F4EE"));
  return c;
}

// ---------------------------------------------------------------------------
// PART IV — RUNNING THE TABLE
// ---------------------------------------------------------------------------
function ch20() {
  const c = [];
  c.push(...chapterOpener("Chapter 20", "Anatomy of a Session"));
  c.push(lead("Seven blocks, with the minutes. Two hours in one sitting; halve it for a group " +
              "that meets twice."));

  c.push(spacer(80));
  c.push(dataTable(["MIN", "BLOCK", "WHAT HAPPENS"], M.sessionShape, [1100, 1900, W - 3000]));

  c.push(h2("What the shape protects"));
  c.push(body(
    "Presentations take at most ten of the hundred and twenty minutes even when all four students " +
    "present. The debrief takes ten. Everything else is story. If a session ever runs out of time, " +
    "it is the second act that gets shortened — never the debrief, because the debrief is where " +
    "the Language Points are counted and the points are what the student carries into next week."));

  c.push(h2("Cut in half"));
  c.push(body(
    "A group that meets twice a week for an hour runs the same shape across two days: opening, " +
    "presentations and one act on the first day; one act, the debrief and the close on the second. " +
    "The Language Points of each meeting are counted at the end of that meeting — a session is a " +
    "meeting, whatever it contains."));

  c.push(spacer(140));
  c.push(box("The measure of a session",
    "Not how good the story was. How much English the students produced. A teacher who leaves a " +
    "session pleased with their own worldbuilding and unable to say which student spoke least has " +
    "measured the wrong thing.", WARN, "FDF4E4"));
  return c;
}

function ch21() {
  const c = [];
  c.push(...chapterOpener("Chapter 21", "Ten Minutes of Preparation"));
  c.push(lead("Open one file. Type three things per student. Close it."));

  c.push(body(
    "The Panel exists to make preparation finite. Before it, preparing meant remembering where " +
    "four students were, looking four topics up, and deciding what each of them needed — every " +
    "week, from memory. Now the remembering is written down and the looking-up is calculated."));

  c.push(h2("What you type"));
  c.push(spacer(80));
  c.push(dataTable(["YOU TYPE", "WHAT IT IS"], [
    ["Level", `Which ${M.COURSEBOOK} level the student is on.`],
    ["Unit", "Which unit of it."],
    ["Lesson", "A, B, C, D or X — where they are in the cycle."],
  ], [2000, W - 2000]));

  c.push(h2("What comes back"));
  c.push(spacer(80));
  c.push(dataTable(["CALCULATED", "FROM"], [
    ["The unit title", "The trail table"],
    ["Both topics of the unit", "The trail table"],
    ["Today's Language Focus", "The lesson letter: A and B give lesson 1, C and D give lesson 2, X gives both"],
    ["Whether they present", "The lesson letter: B and D, one minute"],
    ["The Actions in play", "The trail table"],
    ["The next lesson, and the reminder sentence", "The lesson letter"],
  ], [3400, W - 3400]));

  c.push(spacer(140));
  c.push(box("Three cells a student, twelve for the table",
    "That is the whole preparation, and everything the table sees downstream — the Class Board, " +
    "every student's own sheet — is calculated from those twelve cells. You never type the same " +
    "fact twice, which is the only reason two documents cannot disagree about it."));

  c.push(h2("Then, and only then, the scene"));
  c.push(body(
    "With four Language Focuses and four Action tags in front of you, the question for the week " +
    "becomes a small one: what is one situation where all four of those have to be used by " +
    "somebody? That question has answers. \"What should happen next week?\" does not."));
  return c;
}

function ch22() {
  const c = [];
  c.push(...chapterOpener("Chapter 22", "Session Zero: Introducing the Concepts"));
  c.push(lead("Nine concepts, about twenty minutes, and the best-spent twenty minutes of the term."));

  c.push(box("Why this chapter exists",
    ["It was missing, and the cost was paid in a real classroom. In the pilot's first session the " +
     "teacher reached for Passing the Lantern and realised, mid-sentence, that nobody had been " +
     "told what it was. The same was true of Language Points and Spotlight Tokens.",
     "A concept that has not been introduced produces confusion at the exact moment it was " +
     "supposed to produce speech."], CRIT, "FBEDEC"));

  c.push(h2("The shape of an introduction"));
  c.push(body(M.conceptIntroductionRule));
  c.push(spacer(100));
  c.push(dataTable(["", "WHAT IT IS"], [
    ["Say it", "Thirty to sixty seconds, in English a beginner can follow. The script is printed below and it is meant to be said, not paraphrased."],
    ["Show it", "Do the thing once, in front of them, yourself."],
    ["Use it", "Every student uses it once, immediately. This is the part that gets skipped and it is the part that makes it stick."],
  ], [1800, W - 1800]));

  c.push(pageBreak());
  c.push(h2("The nine"));
  M.conceptsToIntroduce.forEach((k, i) => {
    c.push(h3(`${i + 1}. ${k.name}`));
    c.push(dataTable(null, [
      ["Say", k.say],
      ["Show", k.show],
      ["Use", k.use],
    ], [1100, W - 1100]));
    c.push(spacer(140));
    if (i === 3 || i === 6) c.push(pageBreak());
  });

  c.push(spacer(100));
  c.push(box("Do not do all nine and then start playing",
    "Interleave them. The roll comes in when the first roll is needed; the Lantern comes in the " +
    "first time you want a detail invented. A twenty-minute lecture at the top of Session Zero is " +
    "twenty minutes of nobody speaking English, which is the opposite of the point.", WARN, "FDF4E4"));
  return c;
}

function ch23() {
  const c = [];
  c.push(...chapterOpener("Chapter 23", "Character Creation, Step by Step"));
  c.push(lead("Four decisions and four things handed over. About ten minutes."));

  c.push(body(S.creationPrinciple));
  c.push(spacer(100));
  c.push(box("When it happens", L.creationMoment, ACCENT));
  c.push(spacer(100));
  c.push(spacer(100));
  c.push(dataTable(["", "STEP", "WHAT HAPPENS", "WHO"],
    S.characterCreationSteps, [600, 2400, W - 4800, 1800]));

  c.push(h2("What to say while they choose"));
  c.push(spacer(80));
  c.push(dataTable(["AT", "SAY"], [
    ["The Focus array", "Put the −1 somewhere you want to be tested. That is where the interesting scenes come from."],
    ["The Archetype", "It does not change your dice. It changes what you always have and what you are known for."],
    ["The Kit", "You do not choose this and you never count it. Ask a question about one of the items instead — the campaign now owes you an answer."],
    ["The money", "Everyone has the same. So: where did yours come from?"],
  ], [2600, W - 2600]));

  c.push(spacer(140));
  c.push(box("What a good creation looks like",
    "Ten minutes, four sheets, and four questions the teacher cannot yet answer. A student who " +
    "asks who the sealed letter is addressed to has just handed you three sessions of campaign, " +
    "and they did it before the first scene started.", GOOD, "E8F4EE"));

  c.push(h2("What not to allow"));
  c.push(dataTable(["NOT THIS", "WHY"], [
    ["Reading all four Archetypes twice to find the strongest", "They are not ranked. Say so, out loud, before they start."],
    ["A written backstory", "One sentence. The rest is discovered in play, in English, out loud — which is the whole point."],
    ["Waiting for permission to be finished", "The sheet is done when the eight steps are done. Say that too."],
  ], [4000, W - 4000]));
  return c;
}

function ch24() {
  const c = [];
  c.push(...chapterOpener("Chapter 24", "Running a Scene"));
  c.push(lead("How the target language arrives without anybody feeling tested."));

  c.push(body(
    "This chapter states the rules of the craft. The craft itself — how to keep three people busy " +
    "while a fourth talks, what to do when the table freezes, where to find a scene when you have " +
    "not prepared one — is the Master's Guide's job."));

  c.push(h2("Build on the Action, never on the grammar"));
  c.push(body(M.actionPrinciple));

  c.push(h2("Aim the pressure, not the instruction"));
  c.push(body(
    "A scene has a pressure point: the thing the characters must get past. Put each student's own " +
    "Focus on a different pressure point and all four of them produce the structure they are " +
    "studying without any of them being told to."));

  c.push(h2("Never correct inside the scene"));
  c.push(body(
    "The correct form comes back inside your next line, in character, and the student either picks " +
    "it up or does not. A student interrupted to be corrected stops producing and starts " +
    "monitoring, and a room full of people monitoring their own grammar is a silent room."));
  c.push(spacer(100));
  c.push(box("Recasting, in one exchange", [
    `Student: "Yesterday I go to the harbour and I see the ship."`,
    `Teacher, in character: "You went to the harbour? And you saw it yourself — the ship, at the " +
     "quay, with your own eyes?"`,
    `No lesson, no pause, no apology. The past simple has been said back to them twice and the ` +
    `scene did not stop.`,
  ], GOOD, "E8F4EE"));

  c.push(h2("Pass the Lantern often"));
  c.push(body(
    "Handing a piece of the world to a student to invent does three things at once: it produces a " +
    "sentence nobody scripted, it commits that student to a place they now part-own, and it saves " +
    "you the preparation. What they say is true. Do not overrule it — use it in your next line so " +
    "they can hear that it was real."));

  c.push(h2("Distribute the invitation"));
  c.push(body(
    "Not the minutes. Make sure everyone is asked something they cannot answer in three words. " +
    "When somebody takes more than their share, the table has a tool for it and you do not have " +
    "to be the one who says so — that is what Spotlight Tokens are, and they work better coming " +
    "from a classmate than from you."));
  return c;
}

function ch25() {
  const c = [];
  c.push(...chapterOpener("Chapter 25", "The Debrief"));
  c.push(lead("Ten minutes at the end, and the only moment in the week when the teacher counts " +
              "anything out loud."));

  c.push(body(
    `${M.pointsRhythm.sentence} The debrief is where that happens: one student at a time, by ` +
    `name, with the reason said aloud.`));

  c.push(h2("How to count"));
  c.push(spacer(80));
  c.push(dataTable(["SAY", "FOR"], S.languagePoints.earn.map(([why, how]) => [how, why]),
    [2000, W - 2000]));
  c.push(spacer(140));
  c.push(box("Paid for the attempt", S.languagePoints.lawOfTheAttempt, CRIT, "FBEDEC"));

  c.push(h2("And then the student writes it down"));
  c.push(body(
    `You announce; they record. ${S.languagePoints.keptBy.charAt(0).toUpperCase()}` +
    `${S.languagePoints.keptBy.slice(1)} — and during the next session it is the student who says ` +
    `out loud that they are spending one, and crosses it off themselves.`));
  c.push(body(
    "That is a deliberate transfer of work. A student who tracks their own resource has to " +
    "announce it in English, and the sentence is a small piece of production that would otherwise " +
    "have been performed by the teacher.", { italics: true }));

  c.push(h2("One comment each"));
  c.push(body(
    "After the counting, one short sentence per student about something they did tonight — " +
    "something specific, in the fiction, that you actually noticed. Not an assessment. A student " +
    "who hears their own character's action described back to them has a reason to come back " +
    "next week, and it is a better reason than a mark."));

  c.push(spacer(140));
  c.push(box("What to watch for over a month",
    "Who finished the session with all three Spotlight Tokens unspent? A student who does that " +
    "three sessions running is not being modest — the scenes are not reaching them, and that is " +
    "the teacher's problem to fix rather than theirs.", WARN, "FDF4E4"));
  return c;
}

function ch26() {
  const c = [];
  c.push(...chapterOpener("Chapter 26", "What to Record When the Session Ends"));
  c.push(lead("Five things, in one file, in about two minutes."));

  c.push(body(
    "Recording is not admin. It is the only reason next week's preparation takes ten minutes " +
    "instead of an hour, and it is the only reason a student who moves between groups keeps " +
    "everything they earned."));

  c.push(spacer(80));
  c.push(dataTable(["RECORD", "WHERE", "WHEN"], [
    ["The lesson each student is now on", "Panel — the lesson column", "Right after the session. Advance it once per hour of class."],
    ["The three debrief boxes", "Panel — homework, Focus used, presented", "At the debrief, as you announce them."],
    ["The quiz released", `${M.TEST_NAME}, to that student alone`, "At the end of a D lesson."],
    ["Quiz marks and attempts", "Panel — from the form responses", "Once a week."],
    ["What the table invented", "The Codex, in the Classroom", "Whenever a player made something true."],
  ], [3000, 3000, W - 6000]));

  c.push(h2("What not to record"));
  c.push(body(
    "Anything the platform already knows. The homework lives on the coursebook platform, it is " +
    "marked automatically, and copying those marks into the Panel would create a second version " +
    "of a fact that is already true somewhere else. The moment the same fact lives in two places, " +
    "one of them starts being wrong and nobody can tell which."));

  c.push(spacer(140));
  c.push(box("The division, one more time",
    "The platform is the student's territory: homework, marks, progress. The Panel is the " +
    "teacher's: which lesson of the cycle each student is on — information that exists only " +
    "because somebody ran the sessions. Neither one copies the other."));

  c.push(h2("And the Codex"));
  c.push(body(
    "When a player invents something — a person, a place, a rule of the world — it goes in the " +
    "Codex before it is forgotten, in their words. It is the table's shared memory, it is written " +
    "in English, and reading last week's entry aloud is how the opening recap writes itself."));
  return c;
}


function ch27() {
  const c = [];
  c.push(...chapterOpener("Chapter 27", "Passing the Lantern"));
  c.push(lead("The GM hands a piece of the world to a player to invent, and what they say " +
              "becomes true. This is the signature mechanic of the system."));

  c.push(body(
    "The name comes from the line that opens the Player's Guide: whoever holds the lantern " +
    "decides what everybody else can see. Passing the lantern is passing the authorship."));

  c.push(spacer(100));
  c.push(box("Why it is not an exercise",
    "The world on the far side of a Door is only fully formed where a traveller has already " +
    "looked. Describing is not inventing — it is revealing. Say that once, early, and the " +
    "mechanic stops feeling like a task and starts feeling like a privilege.", ACCENT));

  c.push(h2("Three sizes"));
  c.push(body(
    "The size is chosen for the student, not for the moment. A closed question to a beginner " +
    "produces a sentence; an open one produces silence."));
  c.push(spacer(100));
  c.push(dataTable(["SIZE", "WHAT IT IS", "HOW LONG", "LEVEL"],
    S.lanternSizes, [1700, W - 5000, 1700, 1600]));

  c.push(h2("Four rules"));
  c.push(spacer(80));
  c.push(dataTable(["RULE", "WHAT IT MEANS"], S.lanternRules, [2600, W - 2600]));

  c.push(pageBreak());
  c.push(h2("What a player may invent, and what they may not"));
  c.push(body(
    "The scope exists to protect the prepared adventure without making the invitation feel " +
    "fenced. In practice students never test the edges; the list is here for the GM."));
  c.push(spacer(100));
  c.push(dataTable(["MAY", "MAY NOT"],
    S.lanternScope.may.map((m, i) => [m, S.lanternScope.mayNot[i] || ""]),
    [W / 2, W / 2], { plainFirst: true }));

  c.push(h2("The Second Look"));
  c.push(body(S.secondLook.what));
  c.push(spacer(100));
  c.push(box("at the table", S.secondLook.example, GOOD, "E8F4EE"));
  c.push(spacer(120));
  c.push(body(S.secondLook.why));
  c.push(spacer(80));
  c.push(box("and it never contradicts", S.secondLook.rule, CRIT, "FBEDEC"));

  c.push(h2("Where it goes in a session"));
  c.push(spacer(80));
  c.push(dataTable(["", ""], [
    ["How often", S.lanternRhythm.perSession],
    ["Always", S.lanternRhythm.always],
    ["Who gets which size", S.lanternRhythm.whoGetsWhichSize],
    ["Afterwards", S.lanternRhythm.codex],
  ], [2400, W - 2400]));

  c.push(spacer(140));
  c.push(box("The unexpected return",
    "A hundred and fifty lines of world a year, written by the students, in English, about " +
    "something they are invested in, at exactly their own level. No coursebook produces reading " +
    "material like that, and it costs the GM thirty seconds a week.", GOOD, "E8F4EE"));
  return c;
}

// ---------------------------------------------------------------------------
// PART V — THE DOORS
// ---------------------------------------------------------------------------
function ch28() {
  const c = [];
  c.push(...chapterOpener("Chapter 28", "What a Door Is"));
  c.push(lead("The hall, the doors out of it, and the ritual that costs nothing."));

  c.push(h2("The Ludus"));
  c.push(body(L.theLudus.what));
  c.push(body(L.theLudus.why));

  c.push(h2("The ritual of a session"));
  c.push(body(
    "Four moments, and they are worth keeping because they do the work that \"right, let's " +
    "begin\" never does: they mark where the English starts and where the character starts, " +
    "and they give a session a shape a student can feel."));
  c.push(spacer(100));
  c.push(dataTable(null, L.sessionRitual, [3000, W - 3000]));
  c.push(spacer(140));
  c.push(box("And characters are made at the Door", L.creationMoment, ACCENT));

  c.push(pageBreak());
  c.push(h2("Who lives in the hall"));
  c.push(body(
    "Five permanent residents, one per family of language Actions. That is not decoration: a GM " +
    "who needs a scene that pulls on Narrate knows whose door to knock on."));
  c.push(spacer(100));
  c.push(dataTable(["WHO", "DOMAIN", "THE ACTIONS THEY CARRY"], L.ludusCast, [2000, 2200, W - 4200]));
  c.push(spacer(120));
  c.push(body(
    "Their portraits — how they speak, what they want, what they will not do — are in the " +
    "Master's Guide. This book prints the map only.", { italics: true }));

  c.push(h2("The four relics"));
  c.push(body(
    `One campaign earns one relic, and there are four: ${L.relics.four.join(", ")}. ` +
    `${L.relics.oneEach}`));
  c.push(spacer(100));
  c.push(dataTable(["", ""], [
    ["When it is handed over", L.relics.when],
    ["What it is", L.relics.nature],
  ], [2800, W - 2800]));
  c.push(spacer(140));
  c.push(box("A relic never touches the dice",
    "It is weight of history, memory and standing — a door that opens, a name that is known, a " +
    "debt that is remembered. It obeys the same law as a Boon and a chest of gold, and for the " +
    "same reason.", CRIT, "FBEDEC"));
  return c;
}

function ch29() {
  const c = [];
  c.push(...chapterOpener("Chapter 29", "The Four-Arc Skeleton"));
  c.push(lead("The shape of a campaign. It fits any Door, and it is the reason a long story " +
              "keeps its form."));

  c.push(body(
    "What kills a long campaign is not people leaving. It is the story losing its shape — a run " +
    "of sessions where things happen and nothing resolves. Arcs are the cure: each one has a " +
    "climax and an actual resolution, and the boundary between two arcs is the natural place for " +
    "a student to join or to leave."));

  c.push(spacer(120));
  L.arcs.forEach(([label, title, text], i) => {
    c.push(lawBlock(i + 1, `${label} — ${title}`, text));
  });

  c.push(spacer(200));
  c.push(box("What they chase in Arc 2 is not the relic", L.arcResourceRule, WARN, "FDF4E4"));

  c.push(h2("How long an arc takes"));
  c.push(body(L.arcLength));

  c.push(h2("Why Arc 4 exists"));
  c.push(body(
    "Because the confrontation is not the end of anything for the people at the table. A group " +
    "that has played together for a year has unfinished business — a promise, a family, a debt, " +
    "somebody they never said the thing to. Arc 4 has no deadline and no antagonist, and it is " +
    "where the campaign is actually paid off."));
  c.push(body(
    "It is also the arc with the most speech in it, because everything in it is a conversation.",
    { italics: true }));
  return c;
}

function ch30() {
  const c = [];
  c.push(...chapterOpener("Chapter 30", "Anatomy of a Door Book"));
  c.push(lead("What every Door Book contains, in the same order, so that a GM who has run one " +
              "can open another and already know where things are."));

  c.push(body(L.doorBookPrinciple));
  c.push(spacer(120));
  c.push(dataTable(["PART", "WHAT IS IN IT"], L.doorBookParts, [2800, W - 2800]));

  c.push(pageBreak());
  c.push(h2("Every adventure has the same twelve slots"));
  c.push(body(
    "The slot list is the reason a Door Book can be skimmed at speed. A GM opening an adventure " +
    "ten minutes before a session knows that the pitch is first, the lock is second, and the " +
    "line to read aloud is third — in every adventure, in every Door, forever."));
  c.push(body(
    "It is also a writing discipline. An adventure that cannot fill the twelve slots is not " +
    "finished, and an adventure that needs a thirteenth is trying to be a novel.", { italics: true }));

  c.push(h2("The two marks a Door Book carries"));
  c.push(spacer(80));
  c.push(dataTable(["MARK", "MEANS"], [
    ["Locked", "This is true in this world and the GM may not change it. Usually one line per adventure."],
    ["A choice", "Three ways in, and the GM picks one — or lets the table pick without knowing they are picking."],
    ["The students'", "The lantern. Marked so the GM does not accidentally describe the thing the table was going to invent."],
    ["Never", "Said out loud, shown, or hinted at yet. The few of these are the campaign's spine."],
  ], [2000, W - 2000]));

  c.push(spacer(140));
  c.push(box("The secret is always GM-only",
    "Every Door has one thing that is true and that the table does not know. It is written down " +
    "in the second chapter of the Door Book, and it is the one part of the book that must never " +
    "be shared with a student — which is why Door Books live in the teacher's folder and the " +
    "Player's Guide does not contain a Door's secret in any form.", CRIT, "FBEDEC"));
  return c;
}

function ch31() {
  const c = [];
  c.push(...chapterOpener("Chapter 31", "Choosing and Changing a Setting"));
  c.push(lead("Twenty minutes, once a semester, and almost always a five-minute answer."));

  c.push(h2("The semester conversation"));
  c.push(body(`${L.settingChange.when} ${L.settingChange.what}`));
  c.push(body(L.settingChange.itIsAConversation));

  c.push(h2("If they do want to change"));
  c.push(spacer(80));
  c.push(box("Approval voting, never one vote each", L.settingChange.voting, ACCENT));
  c.push(spacer(120));
  c.push(body(
    "The reason is simple arithmetic. With one vote each and four options, a setting can win " +
    "with two votes while two students spend six months in a world they did not want. With " +
    "approval voting the winner is the one the most people are happy with, which is a different " +
    "and better question."));

  c.push(h2("What travels with the student"));
  c.push(spacer(80));
  c.push(dataTable(["", ""], [
    ["Same setting", L.settingChange.whatTravels.split(". ")[0] + "."],
    ["Different setting", "The character is rebuilt at the same Growth Level — about ten minutes — and the old one becomes an NPC at the table they left."],
    ["Always", "Growth Level, Boons and the Growth Ledger. Nothing earned is lost by changing world."],
    ["Never affected", L.settingChange.whatNever],
  ], [2600, W - 2600]));

  c.push(spacer(140));
  c.push(box("The character never dies",
    "Not in a change of setting, not in a bad roll, not when a student leaves. Characters retire, " +
    "are left behind, become NPCs, are spoken about. A student who might come back in a year " +
    "should find somebody still standing there.", GOOD, "E8F4EE"));
  return c;
}

// ---------------------------------------------------------------------------
// PART VI — OPERATIONS
// ---------------------------------------------------------------------------
function ch32() {
  const c = [];
  c.push(...chapterOpener("Chapter 32", "The Tools"));
  c.push(lead("Six of them, and what each one is NOT is as important as what it is."));

  c.push(spacer(80));
  c.push(dataTable(["TOOL", "WHAT IT IS", "WHAT IT IS NOT"], [
    ["The Panel", "The teacher's sheet. Three fields typed per student; everything else calculated.", "Never shared with a student. Not a gradebook — the marks in it are a signal, not a record of worth."],
    ["The Class Board", "Read-only, visible to the whole class. Who is where, today's Focus, who presents, the reminder.", "Not editable by anyone, including the teacher. It is a mirror of the Panel's public half."],
    ["The character sheet", "One per student, theirs to edit. Character, resources, what they carry.", "Not a place the teacher writes. The blue block on it comes from the Board, and the rest is the student's."],
    [`${M.COURSEBOOK_PLATFORM}`, "The student's territory: homework, marks, progress.", "Not somewhere the teacher copies anything out of. If the platform knows it, the Panel does not need to."],
    [M.TEST_NAME, `Ours. ${M.TEST_TOOL}.`, "Not the coursebook's test, and not a gate. A signal."],
    ["The Codex", "The table's shared written memory, in the class, in English.", "Not a summary the teacher writes. It is what the students invented, in their words."],
  ], [2200, 3700, W - 5900]));

  c.push(pageBreak());
  c.push(h2("The chain, and the one thing that must not happen"));
  c.push(body(
    "The Panel feeds the Board. The Board feeds every student's sheet. Nothing feeds backwards, " +
    "and no student-editable file ever points at the Panel."));

  c.push(spacer(100));
  c.push(box("Why the Board exists at all",
    ["A spreadsheet link is authorised per FILE, not per range. If a student's own sheet were " +
     "allowed to read the Panel, that student could widen the range inside their own copy — it " +
     "is an ordinary text field, in a file they own — and read the whole thing: every mark, " +
     "every attempt, every private note about every classmate.",
     "The Board is the fix. It holds only what is already public, so the worst case is that a " +
     "student reads a board they could have opened anyway."], CRIT, "FBEDEC"));

  c.push(h2("The territory rule"));
  c.push(body(
    "The platform is the student's; the Panel is the teacher's. Neither copies the other. The " +
    "moment the same fact lives in two places, one of them starts being wrong and nobody can " +
    "tell which — which is the reason half the rules in this Part exist."));
  return c;
}

function ch33() {
  const c = [];
  c.push(...chapterOpener("Chapter 33", "The Panel, Field by Field"));
  c.push(lead("Ten fields you type, eleven that calculate. Nothing else."));

  c.push(h2("What you type"));
  c.push(spacer(80));
  c.push(dataTable(["FIELD", "WHEN", "WHAT IT IS"], [
    ["Student", "Once", "The name. It must match the name on that student's own sheet exactly — that is how the two find each other."],
    ["Level", "Before the session", `Which ${M.COURSEBOOK} level.`],
    ["Unit", "Before the session", "Which unit of it."],
    ["Lesson", "Before, and advance after", "A, B, C, D or X. Advance it once per hour of class."],
    ["Growth", "At a Growth Moment", "The character's level. Starts at 1 for everybody."],
    ["Homework done?", "At the debrief", "Yes or no. Worth a Language Point."],
    ["Used the Focus?", "At the debrief", "Yes or no. Paid for the attempt, never for the result."],
    ["Presented?", "At the debrief", "Yes or no. Only possible in a B or D lesson."],
    ["Attempts", "Once a week", `How many times they have sat this unit's ${M.TEST_NAME}.`],
    ["Quiz %", "Once a week", "From the form responses."],
  ], [2300, 2200, W - 4500]));

  c.push(pageBreak());
  c.push(h2("What calculates"));
  c.push(spacer(80));
  c.push(dataTable(["FIELD", "FROM"], [
    ["Unit title", "The trail table"],
    ["Lesson 1 topic and lesson 2 topic", "The trail table"],
    ["Today's Language Focus", "The lesson letter — A and B give lesson 1, C and D give lesson 2, X gives both"],
    ["The Actions in play", "The trail table"],
    ["Presents today?", "The lesson letter — B and D"],
    ["Next lesson", "The lesson letter"],
    ["The reminder sentence", "The next lesson, plus the topic it will be about"],
    ["Language Points", "The three debrief boxes, added up"],
    ["The alert", "The mark and the attempts"],
  ], [3400, W - 3400]));

  c.push(h2("The three columns that never leave the file"));
  c.push(body(
    "Attempts, the mark, and the alert. They are not in the public block, so the Board cannot " +
    "see them and therefore no student's sheet can reach them. That is not a setting somebody " +
    "has to remember to switch on — it is the shape of the file."));

  c.push(spacer(140));
  c.push(box("Ten minutes, and the reason it is ten",
    "Three cells per student, twelve for a table of four. Everything a student sees this week is " +
    "calculated from those twelve cells, which is also why you never type the same fact twice and " +
    "why two documents cannot disagree about it."));
  return c;
}

function ch34() {
  const c = [];
  c.push(...chapterOpener("Chapter 34", "Student Movement"));
  c.push(lead("Arrival, absence, departure and transfer — what to do, what to say in the " +
              "fiction, and what to write down."));

  c.push(h2("Arrival"));
  c.push(spacer(80));
  c.push(dataTable(["", "WHAT HAPPENS"], [
    ["On the trail", "Unit 1 of whatever level the placement test gave them. Growth Level 1, always, whatever their English."],
    ["In the fiction, mid-arc", "The Arrival — a ten-minute ritual in which the table finds them and decides to keep them."],
    ["In the fiction, at an arc boundary", "No ritual needed. They were always going to be there."],
    ["In the files", "A row in the Panel, a copy of the sheet, their name on both — spelled identically."],
  ], [3000, W - 3000]));

  c.push(h2("Absence"));
  c.push(spacer(80));
  c.push(dataTable(["", "WHAT HAPPENS"], [
    ["One or two sessions", "The character is off-screen. No penalty in the fiction, and on the trail they simply do not advance."],
    ["A long absence", "The character becomes a recurring NPC, still in the world, still theirs."],
    ["Coming back", "They resume at the exact unit and lesson they left. That is what the Panel is for."],
  ], [3000, W - 3000]));

  c.push(h2("Leaving"));
  c.push(body(
    "A student who leaves gets a farewell in the fiction. The character is retired, not killed — " +
    "no character in this system ever dies — and the row is archived rather than deleted. A " +
    "student who comes back in a year finds their unit, their lesson, their Growth Level and " +
    "somebody still standing where they left them."));

  c.push(pageBreak());
  c.push(h2("Transfer between groups"));
  c.push(body(
    "This is the promise that only the school can make, and it is worth making loudly: nothing " +
    "is lost by moving group."));
  c.push(spacer(100));
  c.push(dataTable(["", "WHAT HAPPENS"], [
    ["The trail", "Travels exactly. Copy the row into the new group's Panel — level, unit, lesson, Growth, all of it."],
    ["Same setting", "The character travels whole."],
    ["Different setting", "Rebuilt at the same Growth Level, about ten minutes. The old character becomes an NPC at the table they left."],
    ["Never", "The trail never depends on the setting. Only the fiction changes."],
  ], [2600, W - 2600]));

  c.push(h2("When a group gets too small"));
  c.push(body(
    "Below two students, merge at the turn of a semester. Between semesters, a pair runs with an " +
    "allied NPC at the table — which is not a compromise: an NPC who travels with them is a " +
    "second voice for the GM and a reliable person for a quiet student to talk to."));
  return c;
}

function ch35() {
  const c = [];
  c.push(...chapterOpener("Chapter 35", "Opening a New Class"));
  c.push(lead("From nothing to the first session, as a checklist."));

  c.push(spacer(80));
  c.push(dataTable(["", "WHAT TO DO"], [
    ["1 · The files", "Copy the Panel, the Board and the sheet template. Three files, from the library, never rebuilt by hand."],
    ["2 · Wire them", "Paste the Panel's link into the Board. Paste the Board's link into each sheet. Authorise each link once."],
    ["3 · The names", "Put the real names in the Panel, and the same name in cell B5 of each student's sheet. Identical spelling or nothing finds anything."],
    ["4 · The Classroom", "Topics: Start Here, Your Character, Quick Reference, and the Door. The timetable lives here and nowhere else."],
    ["5 · The reading", "Post the Player's Guide, the Quick Reference and How This Class Works. Post the Board as a material everyone can see."],
    ["6 · The sheets", "One copy per student, renamed, posted to that student only, with edit rights."],
    ["7 · The coursebook", `Each student buys ${M.COURSEBOOK} ${M.COURSEBOOK_EDITION} and activates the code against this class on ${M.COURSEBOOK_PLATFORM}. Tie this to enrolment — a student without the activation cannot do homework and cannot progress.`],
    ["8 · The placement", "Everybody has a level before the first session. Nobody arrives without one."],
    ["9 · Session Zero", "Chapter 22 for the concepts, Chapter 23 for the characters, and the crossing of the Door."],
  ], [2400, W - 2400]));

  c.push(spacer(140));
  c.push(box("The one that sinks a class if it slips",
    "Step 7. A student who has not activated the coursebook plays happily for a month and does " +
    "not advance one unit, and nobody notices until the Panel has four identical rows. Tie the " +
    "purchase to enrolment and check the activation before Session Zero, not after.", WARN, "FDF4E4"));
  return c;
}

function ch36() {
  const c = [];
  c.push(...chapterOpener("Chapter 36", "Bringing In a Partner Teacher"));
  c.push(lead("This method is not meant to stay with one person. This chapter is how it stops " +
              "being one person's."));

  c.push(h2("What they read, in this order"));
  c.push(spacer(80));
  c.push(dataTable(["", "WHY THIS ORDER"], [
    ["1 · The Player's Guide", "Because they must know what a student knows before they know more than a student."],
    ["2 · This book, Parts I and II", "The laws and the system. Everything behind every Door."],
    ["3 · This book, Parts III and IV", "The method and the table. This is the part they will use every week."],
    ["4 · The Master's Guide", "The craft: running a scene, the scene bank, what to do when a table freezes."],
    ["5 · The Door Book they are taking on", "Last, because it assumes all of the above."],
  ], [3000, W - 3000]));

  c.push(h2("What they get"));
  c.push(body(
    "A Panel, a Board, a Classroom and a Door, plus the library. And a table that belongs to the " +
    "school rather than to them: the characters stay when a teacher changes."));

  c.push(h2("What is asked of them before they run a table alone"));
  c.push(spacer(80));
  c.push(dataTable(["", "WHAT IT PROVES"], [
    ["Sit in on one session", "That they have seen the rhythm, not only read about it."],
    ["Run one scene, watched", "That they can pass the lantern and not take it back."],
    ["Run one debrief", "That they pay for the attempt and do not turn it into an assessment."],
    ["Prepare one Panel", "That ten minutes really is ten minutes for them too."],
  ], [3400, W - 3400]));

  c.push(spacer(140));
  c.push(box("The one thing to watch for in a new teacher",
    "Correcting inside the scene. It is the deepest instinct a language teacher has and it is the " +
    "one habit this method cannot survive. Everything else can be learned in a month.", WARN, "FDF4E4"));

  c.push(h2("And what they may change"));
  c.push(body(
    "Scenes, NPCs, pacing, tone, anything a Door Book marks as a choice. Not the laws, not the " +
    "cycle, not the economy — those change here, once, for everybody, or they do not change."));
  return c;
}

function chIndex() {
  const c = [];
  c.push(...chapterOpener("Chapter 38", "Index of Tables"));
  c.push(spacer(60));
  c.push(dataTable(["YOU WANT", "CHAPTER"], [
    ["The three outcome bands", "5"],
    ["The four Focuses", "6"],
    ["The six Moves, with all three bands each", "7"],
    ["Signature Moves and Cross-Training", "8"],
    ["Kit, Pack, Boons, the money ladder and starting money", "8"],
    ["Distance and price", "9"],
    ["What each Growth Level gives", "10"],
    ["Language Points and Spotlight Tokens", "11, and 25 for the counting"],
    ["The lesson cycle A·B·C·D·X", "14"],
    ["The two session formats, and the year's arithmetic", "14"],
    ["The thirteen Actions", "16"],
    ["★ All 72 units, tagged", "17"],
    ["The quiz: pass mark, attempts, what happens after", "18"],
    ["The shape of a two-hour session", "20"],
    ["What you type into the Panel, and what calculates", "21 and 33"],
    ["The nine concepts of Session Zero", "22"],
    ["The eight steps of character creation", "23"],
    ["The lantern: sizes, rules, scope", "27"],
    ["The four-arc skeleton", "29"],
    ["What a Door Book contains", "30"],
    ["Changing setting, and what travels", "31"],
    ["The six tools", "32"],
    ["Student movement: arrival, absence, leaving, transfer", "34"],
    ["Opening a new class", "35"],
    ["Every term defined", "37 — Glossary"],
  ], [W - 2800, 2800], { plainFirst: true }));
  return c;
}

function chDecisions() {
  const c = [];
  c.push(...chapterOpener("Chapter 39", "Decision Log"));
  c.push(lead("What was decided, when, and what it replaced."));

  c.push(body(
    "A decision revisited in six months should be revisited with its reasoning attached, not " +
    "re-argued from nothing. Only entries that changed something are here — a decision that " +
    "confirmed what everybody already thought is not worth a line."));
  c.push(spacer(120));
  c.push(dataTable(["WHEN", "WHAT", "AND WHY"],
    decisions, [1600, 2600, W - 4200]));

  c.push(spacer(160));
  c.push(box("How to add to this list",
    "A decision belongs here when it changed a rule, retired one, or corrected something that had " +
    "already reached a classroom. Write what it replaced, not only what it is — the replaced " +
    "version is the part that saves the next argument.", ACCENT));
  return c;
}

// ---------------------------------------------------------------------------
// PART VII — GLOSSARY
// ---------------------------------------------------------------------------
function chGlossary() {
  const c = [];
  c.push(...chapterOpener("Chapter 37", "Glossary"));
  c.push(lead("Every term this system uses, defined once. If two books explain the same term " +
              "differently, one of them is a defect."));

  const TAGS = { system: "SYSTEM", method: "★ TRAIL", table: "TABLE", world: "WORLD" };
  const rows = glossary
    .slice()
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([term, def, tag]) => [term, TAGS[tag] || "", def]);

  c.push(spacer(80));
  c.push(dataTable(["TERM", "", "MEANS"], rows, [2400, 1200, W - 3600]));
  return c;
}

// ---------------------------------------------------------------------------
// ASSEMBLY
// ---------------------------------------------------------------------------
function section(partLabel, chapterLabel, children, opts = {}) {
  return {
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
      },
    },
    headers: opts.noHeader ? undefined : { default: runningHeader(partLabel, chapterLabel) },
    footers: { default: footer },
    children,
  };
}

const sections = [
  section("", "", [...titlePage(), ...contents()], { noHeader: true }),

  section("Part 0", "This Book", [
    ...partOpener("Part 0", "This Book", "What is canon, and how to read the marks."),
    ...ch01(), ...ch02(),
  ]),

  section("Part I", "The Project", [
    ...partOpener("Part I", "The Project",
      "What Ludus is, the Laws it runs on, the whole thing on one page, and who does what."),
    ...ch1(), ...ch2(), ...ch3(), ...ch4(),
  ]),

  section("Part II", "The System", [
    ...partOpener("Part II", "The System",
      "The roll, the Focuses, the Moves, the Archetypes, what you carry, Growth, and the two " +
      "currencies the table spends."),
    ...ch5(), ...ch6(), ...ch7(), ...ch8(), ...ch9(), ...ch10(), ...ch11(), ...ch12(),
  ]),

  section("Part III", "The Method", [
    ...partOpener("Part III", "The Method \u2605",
      "Two clocks, the lesson cycle, the Language Focus, the thirteen Actions, the official " +
      "table of all 72 units, the quiz and the Growth Moment."),
    ...ch13(), ...ch14(), ...ch15(), ...ch16(), ...ch17(), ...ch18(), ...ch19(),
  ]),

  section("Part IV", "Running the Table", [
    ...partOpener("Part IV", "Running the Table",
      "The shape of a session, ten minutes of preparation, Session Zero, character creation, " +
      "the scene, the debrief and what to write down."),
    ...ch20(), ...ch21(), ...ch22(), ...ch23(), ...ch24(), ...ch25(), ...ch26(), ...ch27(),
  ]),

  section("Part V", "The Doors", [
    ...partOpener("Part V", "The Doors",
      "The hall, the ritual, the four-arc skeleton, what a Door Book contains, and how a table " +
      "changes world."),
    ...ch28(), ...ch29(), ...ch30(), ...ch31(),
  ]),

  section("Part VI", "Operations", [
    ...partOpener("Part VI", "Operations",
      "The tools, the Panel field by field, student movement, opening a class, and bringing in " +
      "a partner teacher."),
    ...ch32(), ...ch33(), ...ch34(), ...ch35(), ...ch36(),
  ]),

  section("Part VII", "Reference", [
    ...partOpener("Part VII", "Reference",
      "The Glossary, the index of tables and the decision log."),
    ...chGlossary(), ...chIndex(), ...chDecisions(),
  ]),
];

const doc = new Document({
  creator: HOUSE,
  title: `${GAME_NAME} — ${BOOK_NAME}`,
  description: BOOK_SUBTITLE,
  styles: {
    default: { document: { run: { font: "Calibri", size: 21, color: INK } } },
  },
  sections,
});

Packer.toBuffer(doc).then((buf) => {
  const out = path.join(__dirname, "..", "CoreBook.docx");
  writeFileSync(out, buf);
  console.log("written:", out);
});
