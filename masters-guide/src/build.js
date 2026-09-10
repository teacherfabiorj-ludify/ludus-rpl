// ============================================================================
// LUDIFY RPL — MASTER'S GUIDE — single-manuscript build script
//
// This file is the ONE source of truth for the whole Player's Guide.
// Every chapter lives here, as data + layout, in the order it appears in
// the book (CH1, CH2, ... Appendix A).
//
// To add or revise a chapter: edit this file, then run `node build.js`.
// It always regenerates the ENTIRE book from scratch into one docx —
// there is never a separate file per chapter, and never a "v2"/"final"
// filename. Version history lives in GitHub commits on this one file.
//
// To rename the system once the final name is locked in: change GAME_NAME
// below. Every mention in every chapter updates automatically.
// ============================================================================

const {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, PageBreak,
  ImageRun, Footer, PageNumber,
} = require("docx");
const { readFileSync } = require("fs");
const sizeOf = (() => {
  // Minimal PNG dimension reader (avoids adding a new npm dependency)
  return (path) => {
    const buf = readFileSync(path);
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    return { width, height };
  };
})();

const GAME_NAME = "Ludify RPL"; // locked 12/08/2026 — Roleplaying Language

// ---- Palette (shared across Player's Guide AND Master's Guide for visual consistency) ----
const ACCENT = "2A78D6";
const GOOD = "0CA30C";
const WARN = "FAB219";
const CRIT = "D03B3B";
const INK = "0B0B0B";
const INK_SECONDARY = "52514E";
const MUTED = "898781";
const BRAND = "D2691E"; // laranja da marca — só para "Ludify RPL"
const BOX_BG = "F2F2F0";
const ZEBRA = "F7F7F5";
const WHITE = "FFFFFF";

const PAGE_W = 12240; // US Letter
const PAGE_H = 15840;
const MARGIN = 1080; // 0.75in

// ---------------------------------------------------------------------------
// Shared layout helpers
// ---------------------------------------------------------------------------

function noBorder() {
  return { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
}

function spacer(h = 120) {
  return new Paragraph({ spacing: { after: h }, children: [] });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function eyebrow(text) {
  return new Paragraph({
    spacing: { after: 40 },
    children: [
      new TextRun({ text: text.toUpperCase(), bold: true, color: ACCENT, size: 20, characterSpacing: 20 }),
    ],
  });
}

function chapterTitle(text) {
  return new Paragraph({
    spacing: { after: 200 },
    children: [ new TextRun({ text, bold: true, color: INK, size: 64 }) ],
  });
}

function sectionHeading(text) {
  return new Paragraph({
    spacing: { before: 280, after: 100 },
    keepNext: true,
    children: [ new TextRun({ text, bold: true, color: INK, size: 26 }) ],
  });
}


// ---------------------------------------------------------------------------
// GAME TERMS — every named Focus, Move, Signature Move, Boon and resource gets
// picked out of running prose in accent bold, so a reader can tell "you Parley"
// (a Move) from "you parley" (a verb) without having to guess from context.
// Matching is case-sensitive and word-bounded; longest terms first so that
// "Read the Room" wins over "Read the Scene" and neither is cut in half.
// ---------------------------------------------------------------------------
const GAME_TERMS = [
  // Signature Moves
  "Nothing Gets Past Me", "Everyone Has a Price", "Speak for the Table",
  "Angles and Openings", "Already Knew That", "I Planned for This",
  "Nothing Slips By", "One Step Ahead", "Shield the Line", "Hold the Door",
  "Read the Room", "Follow Me",
  // The six core Moves
  "Act Under Pressure", "Persuade or Manipulate", "Help or Interfere",
  "Read the Scene", "Face Danger", "Parley",
  // System nouns
  "Growth Moment", "Growth Level", "Growth Ledger", "Language Focus",
  "Language Point", "Spotlight Token", "Signature Move", "Homework Bonus",
  "Session Zero", "Cross-Training", "Focus Shift", "Legacy Boon",
  // The four Archetypes
  "Vanguard", "Diplomat", "Strategist", "Scout",
  // The four Focuses
  "Courage", "Empathy", "Instinct", "Wit",
  // What you carry, and how far away it is
  "Within reach", "Out of sight", "Far away", "Nearby", "Boon", "Kit", "Pack",
  // Master's Guide — the shared world
  "Hall of Doors", "Long Library", "Under-rooms", "Ludus", "Door", "Keeper",
  "study track", "Language Point", "Growth Ledger",
];

const TERM_RE = new RegExp(
  "\\b(" + GAME_TERMS
    .slice()
    .sort((a, b) => b.length - a.length)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|") + ")(s\\b|\\b)",
  "g"
);

// One pass finds both the brand name and every game term, so a term can never
// be swallowed by the brand match or vice versa.
const MARK_RE = new RegExp(
  "(Ludify RPL)|\\b(" + GAME_TERMS
    .slice()
    .sort((a, b) => b.length - a.length)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|") + ")(s\\b|\\b)",
  "g"
);

// Split a string into TextRuns: brand name in brand orange, game terms in
// accent blue, everything else untouched.
function markTerms(text, base = {}) {
  if (!text) return [new TextRun({ text: text || "", ...base })];
  const runs = [];
  let last = 0;
  let m;
  MARK_RE.lastIndex = 0;
  while ((m = MARK_RE.exec(text)) !== null) {
    if (m.index > last) {
      runs.push(new TextRun({ text: text.slice(last, m.index), ...base }));
    }
    const isBrand = m[1] !== undefined;
    runs.push(new TextRun({
      text: m[0], ...base, bold: true, color: isBrand ? BRAND : ACCENT,
    }));
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    runs.push(new TextRun({ text: text.slice(last), ...base }));
  }
  return runs.length ? runs : [new TextRun({ text, ...base })];
}

function bodyPara(text, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after ?? 160 },
    children: markTerms(text, { color: INK, size: 22, italics: opts.italics || false }),
  });
}

function flavorQuote(lines) {
  // Accepts a single string, or an array of strings rendered as separate lines.
  const arr = Array.isArray(lines) ? lines : [lines];
  return new Table({
    width: { size: 10080, type: WidthType.DXA },
    columnWidths: [10080],
    borders: {
      top: noBorder(), bottom: noBorder(), right: noBorder(),
      left: { style: BorderStyle.SINGLE, size: 18, color: ACCENT },
      insideHorizontal: noBorder(), insideVertical: noBorder(),
    },
    rows: [
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: 10080, type: WidthType.DXA },
            margins: { top: 40, bottom: 40, left: 240, right: 120 },
            children: arr.map((text, i) => new Paragraph({
              spacing: { after: i === arr.length - 1 ? 0 : 100 },
              children: markTerms(text, { italics: true, color: INK_SECONDARY, size: 22 }),
            })),
          }),
        ],
      }),
    ],
  });
}

// Callout colour is decided by FUNCTION, never by taste:
//   example  (green)  — a concrete case showing the rule in motion
//   clarify  (blue)   — why a rule works this way, or a finer point
//   warn     (amber)  — a limit, a trap, or something easy to get wrong
const BOX_KINDS = { example: GOOD, clarify: ACCENT, warn: WARN };

function calloutBox(label, text, kind = "clarify") {
  const color = BOX_KINDS[kind] || kind;
  return new Table({
    width: { size: 10080, type: WidthType.DXA },
    columnWidths: [10080],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 6, color },
      bottom: { style: BorderStyle.SINGLE, size: 6, color },
      left: { style: BorderStyle.SINGLE, size: 6, color },
      right: { style: BorderStyle.SINGLE, size: 6, color },
      insideHorizontal: noBorder(), insideVertical: noBorder(),
    },
    rows: [
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: 10080, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, color: "auto", fill: BOX_BG },
            margins: { top: 140, bottom: 140, left: 200, right: 200 },
            children: [
              new Paragraph({
                spacing: { after: 60 },
                children: [ new TextRun({ text: label.toUpperCase(), bold: true, color, size: 18, characterSpacing: 15 }) ],
              }),
              new Paragraph({ children: markTerms(text, { size: 20, color: INK }) }),
            ],
          }),
        ],
      }),
    ],
  });
}

// Embed a PNG at a given display width (DXA), auto-scaling height to match its
// real aspect ratio, with an optional small italic caption underneath.
function figure(path, opts = {}) {
  const dxaWidth = opts.width ?? 10080; // full content width by default
  const pxWidth = Math.round(dxaWidth / 15); // 1px ≈ 15 DXA at 96dpi/1440-per-inch
  const { width: nativeW, height: nativeH } = sizeOf(path);
  const pxHeight = Math.round(pxWidth * (nativeH / nativeW));

  const parts = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 160, after: opts.caption ? 40 : 160 },
      children: [
        new ImageRun({
          type: "png",
          data: readFileSync(path),
          transformation: { width: pxWidth, height: pxHeight },
        }),
      ],
    })
  ];
  if (opts.caption) {
    parts.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [ new TextRun({ text: opts.caption, italics: true, size: 18, color: MUTED }) ],
    }));
  }
  return parts;
}

// Generic 3-column reference table (used by the book roadmap and the Ch.4 quick reference)
function threeColTable(headers, rows, widths) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) =>
      new TableCell({
        width: { size: widths[i], type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, color: "auto", fill: ACCENT },
        margins: { top: 90, bottom: 90, left: 120, right: 120 },
        children: [ new Paragraph({ children: [ new TextRun({ text: h, bold: true, color: WHITE, size: 18 }) ] }) ],
      })
    ),
  });
  const bodyRows = rows.map((r, idx) => new TableRow({
    cantSplit: true,
    children: r.map((cell, i) => new TableCell({
      width: { size: widths[i], type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, color: "auto", fill: idx % 2 ? ZEBRA : WHITE },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [ new Paragraph({ children: i === 0
        ? [ new TextRun({ text: cell, size: 19, color: INK, bold: true }) ]
        : markTerms(cell, { size: 19, color: INK_SECONDARY }) }) ],
    })),
  }));
  return new Table({
    width: { size: 10080, type: WidthType.DXA },
    columnWidths: widths,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: MUTED },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: MUTED },
      left: { style: BorderStyle.SINGLE, size: 4, color: MUTED },
      right: { style: BorderStyle.SINGLE, size: 4, color: MUTED },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "E1E0D9" },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "E1E0D9" },
    },
    rows: [headerRow, ...bodyRows],
  });
}

// A thin accent rule across the foot of every page, with the page number in
// accent bold sitting just under its right-hand end.
function pageFooter() {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 120 },
        border: {
          top: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 6 },
        },
        children: [
          new TextRun({ children: [PageNumber.CURRENT], bold: true, color: ACCENT, size: 20 }),
        ],
      }),
    ],
  });
}

// ---------------------------------------------------------------------------
// TITLE PAGE
// ---------------------------------------------------------------------------

function titlePage() {
  const children = [];
  children.push(spacer(1400));
  children.push(new Paragraph({
    spacing: { after: 80 },
    children: [ new TextRun({ text: "Ludify RPL", bold: true, color: BRAND, size: 88 }) ],
  }));
  children.push(new Paragraph({
    spacing: { after: 220 },
    children: [ new TextRun({ text: "Roleplaying Language", color: INK_SECONDARY, size: 30 }) ],
  }));
  children.push(new Paragraph({
    spacing: { after: 40 },
    children: [ new TextRun({ text: "MASTER'S GUIDE", bold: true, color: ACCENT, size: 26, characterSpacing: 60 }) ],
  }));
  children.push(spacer(1600));
  children.push(new Paragraph({
    spacing: { after: 60 },
    children: [ new TextRun({ text: "For the teacher running the table.", italics: true, color: INK_SECONDARY, size: 22 }) ],
  }));
  children.push(new Paragraph({
    children: [ new TextRun({ text: "Ludify — Idiomas com diversão e propósito", color: MUTED, size: 20 }) ],
  }));
  children.push(pageBreak());
  return children;
}

// ---------------------------------------------------------------------------
// CONTENTS — page numbers are filled by a two-pass build (see PAGES)
// ---------------------------------------------------------------------------

const PAGES = {
  "Ch. 1": "3",
  "Ch. 2": "6",
  "Ch. 3": "9",
  "Ch. 4": "11",
  "Ch. 5": "14",
  "Ch. 6": "18",
  "Ch. 7": "22",
  "Ch. 8": "26",
  "Ch. 9": "30",
};

const contentsRows = [
  ["Ch. 1 — Before You Run This", "What you are actually running, what to read first, and what an RPG is if you have never played one."],
  ["Ch. 2 — Teaching Philosophy", "The seven principles the whole system is built on."],
  ["Ch. 3 — The Two Clocks", "How a study track drives the table without ever slowing it down."],
  ["Ch. 4 — Your Job at the Table", "The three things only you can do, and the habits that make them work."],
  ["Ch. 5 — Correcting Without Breaking the Scene", "Why the technique everyone uses is the weakest one, and what to do instead."],
  ["Ch. 6 — Passing the Lantern", "How a student becomes a co-author of the world, and why that is the same act as aiming at their grammar."],
  ["Ch. 7 — The Ludus", "The shared world that holds every setting, and the five people in it."],
  ["Ch. 8 — The Six Doors", "Choosing a Door: what each world feels like, and what language it produces."],
  ["Ch. 9 — Learning to Run It", "Training a teacher in five meetings, and how to do it alone if you have to."],
];

const bookContents = contentsRows.map(([title, blurb]) => {
  const key = title.split(" — ")[0];
  return [title, blurb, String(PAGES[key] ?? "—")];
});

// ---------------------------------------------------------------------------
// CHAPTER 1 — WHAT THIS GAME IS
// ---------------------------------------------------------------------------

function chapter1() {
  const children = [];
  children.push(eyebrow("Chapter 1"));
  children.push(chapterTitle("Before You Run This"));

  children.push(flavorQuote([
    `A student who has been silent for six weeks leans forward and says, badly and loudly, “I am telling him the truth is not the truth.”`,
    `Nobody corrects her. The scene moves. That is the whole job.`,
  ]));
  children.push(spacer(140));

  children.push(bodyPara(
    `Ludify RPL is an English course that happens to be a tabletop roleplaying game, and a tabletop roleplaying game that happens to be an English course. Both halves are real. If you run it as a game and forget the course, students have fun and stop progressing. If you run it as a course and forget the game, they progress for six weeks and then stop coming.`
  ));
  children.push(bodyPara(
    `This guide exists so you never have to choose. Every mechanic in the Player's Guide was built to make the pedagogically correct move also the most fun move at the table. Your job is not to balance the two. Your job is to run the game properly and let the design do the balancing.`
  ));

  children.push(calloutBox(
    "Read the Player's Guide first",
    `This guide does not explain the rules. It assumes you have read the Player's Guide — the same book your students get — and it will send you back to it by chapter whenever a rule matters. If you have not read it yet, stop here and read that instead. It takes about an hour, and nothing below will land properly without it.`,
    "warn"
  ));

  children.push(sectionHeading("If You Have Never Played a Tabletop RPG"));
  children.push(bodyPara(
    `Plenty of good teachers arrive here having never touched one, and plenty of good students will too. It is not a barrier. Here is the entire concept in one paragraph.`
  ));
  children.push(bodyPara(
    `A group of people tell a story together. Each player controls one character and decides what that character says and does. One person — you — plays everything else: every other person in the world, every place, every consequence. There is no board and no winner. When somebody tries something that might not work, dice decide whether it does, and the result is not pass or fail but a branch: it works, it works with a cost, or it goes wrong in a way that pushes the story somewhere new.`
  ));
  children.push(bodyPara(
    `That is the whole medium. Everything else — Archetypes, Moves, the twelve-level track — is this system's particular way of organising those three ideas.`
  ));
  children.push(calloutBox(
    "The one habit that transfers from a normal classroom, and the one that does not",
    `Transfers: asking a question and genuinely not knowing what the answer will be. Does not transfer: having a plan for what should happen next. In this medium you prepare situations, never outcomes — you decide what is at stake and who wants what, and the table decides the rest. A GM whose scene only works one way will spend the session steering, and steering is the fastest way to stop students talking.`,
    "clarify"
  ));

  children.push(sectionHeading("What You Are Optimising For"));
  children.push(bodyPara(
    `A session of Ludify RPL succeeds or fails on one number, and it is not how good your story was. It is how much English your students produced.`
  ));
  children.push(bodyPara(
    `This is worth sitting with, because it runs against every instinct a good storyteller has. You will have a beautiful description ready. You will have a villain speech you are proud of. Every minute you spend delivering those is a minute no student is speaking. The best sessions of this game are often the ones where you said the least.`
  ));
  children.push(calloutBox(
    "The measure",
    `At the end of a session, ask: did every student speak in at least three scenes? Did each one produce their own Language Focus at least once? If yes, that was a good session, even if the plot went nowhere. If no, it was a weak session, even if the story was the best you have ever run.`,
    "clarify"
  ));

  children.push(sectionHeading("How This Differs From a Normal Class"));
  children.push(bodyPara(
    `In a normal class, you decide what happens next. Here, you decide what is at stake and the students decide what happens next. That single change is what produces the language: a student who is choosing has to explain, negotiate, argue and describe. A student who is answering only has to answer.`
  ));
  children.push(bodyPara(
    `The other change is error. In a normal class, an error is something to fix. Here, an error is evidence that a student attempted something above their comfort level, which is exactly the behaviour the whole system is designed to reward. You never stop a scene to correct. You recast — Chapter 2, Principle 3 — and the scene keeps moving.`
  ));

  children.push(sectionHeading("How This Differs From a Normal RPG"));
  children.push(pageBreak());
  children.push(bodyPara(
    `Three things will feel unusual to anyone who has run a tabletop game before.`
  ));
  children.push(threeColTable(
    ["WHAT IS DIFFERENT", "WHY IT IS LIKE THAT"],
    [
      ["Nothing you own or earn changes the dice.", "There are no bonuses, no magic weapons with numbers, no equipment tables. A Level 12 character rolls exactly what a Level 1 character rolls. What grows is the number of interesting things a player can choose to do — never their odds. This protects the beginner sitting next to the advanced student."],
      ["Character growth comes from outside the fiction.", "Players do not earn levels by playing well. They earn them by finishing units of their own coursework. The table cannot make anyone level up, and neither can you."],
      ["The players are not the same level of fluent.", "Your table will hold a beginner and a near-fluent student at once, deliberately. The game handles this through the Language Focus — a personal target each student carries — not by simplifying the shared fiction."],
    ],
    [3400, 6680]
  ));

  children.push(spacer(220));
  children.push(sectionHeading("The Three Documents"));
  children.push(bodyPara(
    `You will be working from three things, and it helps to be clear on what each one is for.`,
    { after: 100 }
  ));
  children.push(threeColTable(
    ["DOCUMENT", "WHO READS IT", "WHAT IT HOLDS"],
    [
      ["The Player's Guide", "Your students.", "Every rule of play: the dice, the six Moves, Archetypes, the twelve-level track, what a character carries — and, at the back, a Door Section for each world that is open, holding the peoples, the gods and the plain public facts your players need in order to build a character. Written at roughly B2, with a Portuguese summary in the appendix."],
      ["This guide", "You.", "How to run it. Not the rules again — the judgement calls, the session shape, the world, and the things nobody tells you until you have run twenty sessions. It is the same guide behind every Door."],
      ["A Door Book", "You, and only you.", "One per Door. The campaign for that world: its arcs, its antagonist, what its people are hiding, and what happens if the players push. Never shown to students."],
      ["Your table's spreadsheet", "You and your students.", "Character sheets, and a permanent Growth Ledger for each student. Chapter 3 covers what lives where and why the two must never be the same file."],
    ],
    [2600, 2000, 5480]
  ));

  children.push(spacer(180));
  children.push(calloutBox(
    "Do not read this guide cover to cover before your first session",
    `Read Chapters 1 to 4 and skim Chapter 5. That is enough to run well. The rest is reference you will want in your second month, not your first week — and reading it now will mostly make you nervous about problems you do not have yet.`,
    "warn"
  ));

  return children;
}

// ---------------------------------------------------------------------------
// CHAPTER 2 — TEACHING PHILOSOPHY
// ---------------------------------------------------------------------------

function principleHeading(number, title) {
  return new Paragraph({
    spacing: { before: 280, after: 60 },
    keepNext: true,
    border: { bottom: { style: BorderStyle.SINGLE, size: 10, color: ACCENT, space: 4 } },
    children: [
      new TextRun({ text: `PRINCIPLE ${number} — `, bold: true, color: ACCENT, size: 22 }),
      new TextRun({ text: title.toUpperCase(), bold: true, color: INK, size: 22 }),
    ],
  });
}

const principles = [
  [1, "Low Teacher Talk, High Student Talk",
   `Your job at this table is not to be the best storyteller in the room. It is tempting, and it is fun, and it is not the win condition. Keep any single stretch of your own narration under thirty to forty-five seconds, then hand the scene back to a player.`,
   `Spotlight Tokens are this principle turned into a rule. Every player starts a session with a few, and taking an extended moment in a scene costs one. You do not have to police talk time yourself — the resource does it for you.`],
  [2, "Open Questions Before Closed Ones",
   `“Do you attack him?” gets a one-word answer. “What do you do?” forces real language production. This is already built into how every Move is worded — none of them ask for a yes or no — but name it explicitly so you carry the habit into your own improvised narration too.`,
   `Weak: “Are you scared?” Strong: “What is going through your head right now?” Weak: “Do you want to help her?” Strong: “What do you say to her?”`],
  [3, "Hand the Ball Back, Inside the Fiction",
   `Never stop a scene to correct. But do not simply feed the right answer back either — that is a recast, and the research is clear that it is the least noticed form of correction there is. Instead, make an NPC react in a way that forces the student to say it again themselves. Chapter 5 is entirely about how, and it is the most useful chapter in this book.`,
   `Student: “If you letting us in, we show the papers.” Weak: you narrate the correct version and move on. Strong: Quill looks up and says, “I'm sorry — say that again? I have to write it down exactly.” The student reformulates. Nobody was corrected out loud, and this time they noticed.`],
  [4, "One Communicative Task Per Scene",
   `Every scene you build should have one clear communicative task behind the plot: negotiate, describe, recount a past event, speculate. Design the task first, then dress it in story. Doing it the other way round produces scenes that look exciting and generate three sentences.`,
   `Before you write a scene, ask: what is the conversational task I want a player to practise here? Only then decide what is happening in the fiction that would require it.`],
  [5, "The GM Is Not the Centre of the Table",
   `It is natural to want to narrate. A good session here is not measured by how good your story was — it is measured by how much each student produced. Make that an explicit check at the end of every session, not a feeling you get sometimes.`,
   `After each session ask: who hit their own Language Focus? Who finished with unused Spotlight Tokens, meaning the scenes never came to them? Write the answer down. Patterns show up in a month that you would never notice week to week.`],
  [6, "Mistakes Are Data, Not Missteps",
   `A student who feels safe takes more linguistic risks, and more risk means more practice. Establish this in Session Zero as a table rule, out loud, not as an attitude you hope people absorb: mistakes are how we play this game, not something to avoid.`,
   `This is what Language Points are actually built on. A student earns one for correctly attempting their Language Focus, not for using it perfectly. It is also why nobody is ever told they were wrong out loud.`],
  [7, "Fair Play Is a Rule, Not a Mood",
   `Your most fluent student will speak more than your beginner. That is not a problem and you should not try to fix it — a table where everyone talks for the same number of seconds is a table where somebody is being held back and somebody else is being pushed past what they can do. What ruins a table is different and quieter: a student who is never asked. A beginner who reaches the end of the night without once being invited to speak has been taught, very efficiently, that they do not need to try.`
   + ` So the thing you distribute is the invitation, not the minutes. Everybody gets asked, everybody waits their turn, nobody finishes anybody else's sentence, and one person's error is treated exactly like everyone else's. This is your responsibility, not the group's, and it is enforced the minute it is broken — not raised gently three weeks later.`,
   `The four table rules in Chapter 10 of the Player's Guide already are this. One Scene, One Voice bans talking over. Yes, And bans knocking down someone's idea. Mistakes Are How We Play removes the social cost of being wrong. And one more that is yours to hold: nobody compares Growth Levels, and nobody comments on anybody else's English. The only score in this game is the story, and it belongs to everyone.`],
];

function chapter2() {
  const children = [];
  children.push(eyebrow("Chapter 2"));
  children.push(chapterTitle("Teaching Philosophy"));

  children.push(bodyPara(
    `This chapter is the foundation everything else builds on. None of it is theory you are expected to hold in your head at the table — every principle here is already wired into a mechanic you will be running anyway. Know these seven, and the system runs in the right direction on its own.`
  ));

  principles.forEach(([n, title, body, practice]) => {
    children.push(principleHeading(n, title));
    children.push(bodyPara(body));
    children.push(calloutBox("In Practice", practice, [2, 3, 6, 7].includes(n) ? "example" : "clarify"));
  });

  children.push(pageBreak());
  children.push(eyebrow("Chapter 2 — Quick Reference"));
  children.push(new Paragraph({
    spacing: { after: 200 },
    children: [ new TextRun({ text: "Seven Principles at a Glance", bold: true, color: INK, size: 36 }) ],
  }));
  children.push(threeColTable(
    ["PRINCIPLE", "IN ONE LINE"],
    [
      ["1 — Low teacher talk", "Under forty-five seconds of narration, then hand it back."],
      ["2 — Open questions", "Never ask anything answerable with yes or no."],
      ["3 — Hand the ball back", "Make an NPC react so the student says it again. See Chapter 5."],
      ["4 — One task per scene", "Decide the communicative task first, the plot second."],
      ["5 — Not the centre", "Count student output, not your own performance."],
      ["6 — Mistakes are data", "Reward the attempt, never the accuracy."],
      ["7 — Fair play", "Invitations are distributed, not minutes. Nobody ends a session unasked."],
    ],
    [3000, 7080]
  ));

  return children;
}

// ---------------------------------------------------------------------------
// CHAPTER 3 — THE TWO CLOCKS
// ---------------------------------------------------------------------------

function chapter3() {
  const children = [];
  children.push(eyebrow("Chapter 3"));
  children.push(chapterTitle("The Two Clocks"));

  children.push(flavorQuote(
    `The story runs on the table's clock. The learning runs on each student's own. Tie them together and both stop.`
  ));
  children.push(spacer(140));

  children.push(bodyPara(
    `Two things are moving at once in this course, at different speeds, and understanding that they are separate is the single most important structural idea in the whole system.`
  ));
  children.push(threeColTable(
    ["THE CLOCK", "WHOSE IT IS", "WHAT MOVES IT"],
    [
      ["The campaign", "The table's. Everyone shares it.", "Sessions. The story advances every week for everybody at once, whatever anyone's English level is."],
      ["The study track", "Each student's own. Nobody shares it.", "Units of coursework finished outside the session, at whatever pace that student works."],
    ],
    [2200, 3000, 4880]
  ));

  children.push(spacer(180));
  children.push(bodyPara(
    `The campaign never waits for anybody. A student who has not studied in a month still plays a full session this week, in the same story as everyone else. And the study track is never held back by the table: a student who is racing ahead is not slowed down because the group is not ready.`
  ));
  children.push(calloutBox(
    "Why this matters more than it looks",
    `Every mixed-level classroom problem you have ever had comes from tying these two together. If the story only advances when everyone has finished the same content, the fast students are bored and the slow ones are blamed. Separate the clocks and the problem disappears — not because you managed it well, but because you removed the thing that caused it.`,
    "clarify"
  ));

  children.push(sectionHeading("What a Study Track Has to Do"));
  children.push(bodyPara(
    `This system is not built around any one course book. It is built around a study track with four properties. Any material that has all four will run Ludify RPL correctly; any material missing one of them will need something built on top.`,
    { after: 100 }
  ));
  children.push(threeColTable(
    ["REQUIREMENT", "WHY THE GAME NEEDS IT"],
    [
      ["It is divided into units of roughly equal size.", "Growth Moments are counted in units. Six units, one level. If units vary wildly in length, students climb the ladder at unfair speeds through no fault of their own."],
      ["Each unit has one or two clear language targets.", "That target becomes the student's Language Focus for those weeks — the thing you build spotlight moments around. A unit with no identifiable target gives you nothing to aim at."],
      ["Each unit closes with something that can be passed or not passed.", "The game needs a signal that a target is now usable, not just seen. A quiz, a test, a task — the form does not matter. The existence of a threshold does."],
      ["The student can work through it without you.", "The whole design depends on study happening outside the session. If the track requires teaching time, the two clocks collapse back into one."],
    ],
    [3400, 6680]
  ));

  children.push(spacer(180));
  children.push(calloutBox(
    "The track we use, and why it is only an example",
    `Ludify currently runs on Evolve Digital, which has all four properties: twelve units per level, one or two language targets per unit, a unit test the student can take on their own, and a platform that tracks progress without teacher input. Every example in this guide uses it because that is what our tables actually use.`,
    "example"
  ));
  children.push(bodyPara(
    `None of the rules depend on it. If you replace the track — a different publisher, a track you build yourself, an exam syllabus — nothing in the game changes except the words in the Language Focus field. Six units is still one Growth Moment. The ladder still has twelve rungs. This chapter is written the way it is so that swapping the track is an afternoon of work rather than a redesign.`
  ));

  children.push(spacer(240));
  children.push(sectionHeading("The Growth Moment"));
  children.push(bodyPara(
    `When a student finishes their sixth unit, they hit a Growth Moment: their Growth Level goes up by one and they take whatever that rung of the ladder gives them. It is the only way anyone ever levels up.`
  ));
  children.push(bodyPara(
    `Running one costs you about two minutes, at the top of a session, and it is worth doing out loud in front of everyone. The student announces it. They take the reward. The table reacts. Then you start playing. The public part is not ceremony for its own sake — it is the only moment in the week where private study becomes visible to the group, and it does more for the other students' motivation than anything you could say to them directly.`
  ));
  children.push(calloutBox(
    "What it looks like",
    `“Before we start — Bruno finished his sixth unit this week.” Bruno says what he chose: his Signature Move goes from Tier 1 to Tier 2. He writes it on his sheet. Somebody says nice. You start the recap. Total elapsed time: under two minutes, and Ana is now thinking about how far she is from her own sixth unit.`,
    "example"
  ));

  children.push(sectionHeading("Growth Belongs to the Student, Not the Character"));
  children.push(bodyPara(
    `A Growth Level is earned by a person doing coursework. It is not earned by a character doing anything. This has one consequence you must build for from the first week: when a character is retired — a campaign ends, the table moves to a new world, a player wants someone new — the Growth Level does not go with them.`
  ));
  children.push(bodyPara(
    `That is why every student has a Growth Ledger, and why the Ledger is not on the character sheet. The sheet is temporary and gets replaced. The Ledger is permanent: Growth Level, units finished, every Archetype played, every character played, every Boon earned. You keep it, in one place, for the whole table.`
  ));
  children.push(calloutBox(
    "The mistake to avoid",
    `Do not let Growth Level live only on a character sheet. The first time your table retires its characters to start a new campaign, you will delete a year of somebody's progress and have no way to reconstruct it.`,
    "warn"
  ));
  children.push(calloutBox(
    "Example",
    `Ana has played for a year. Her table finishes its Fantasy campaign and votes to start in Cyberpunk. Mira the Diplomat is retired. Ana builds someone new — new name, new Kit, new Focus labels — and her sheet is blank. Her Ledger is not: Growth Level 3, two Boons, Archetypes played: Diplomat. She builds the new character at Level 3, with her Signature Move already at Tier 2, and the two Boons are reimagined for the new world. Nothing she earned was lost, and rebuilding took about ten minutes.`,
    "example"
  ));

  children.push(sectionHeading("A Student Who Stops Studying"));
  children.push(bodyPara(
    `They keep playing. They keep having a good time. They stop climbing. Their character is never weaker at the table — the dice do not know or care about anyone's level — but they stop receiving Boons, their Signature Move stays where it is, and eventually the students who arrived after them pass them on the ladder.`
  ));
  children.push(bodyPara(
    `That is the designed incentive, and it is a strong one, but do not rely on it alone. A student who has not moved in two months has a reason, and the reason is almost never laziness. Ask them, once, privately, outside the session.`
  ));

  return children;
}

// ---------------------------------------------------------------------------
// CONTENTS PAGE
// ---------------------------------------------------------------------------

function contentsPage() {
  const children = [];
  children.push(eyebrow("Master's Guide"));
  children.push(chapterTitle("Contents"));
  children.push(bodyPara(
    `This volume covers what the game is, how it is taught, how correction works without breaking the fiction, the world every campaign is built in, and how a new teacher is trained. The pocket-scene bank, the operational rituals, campaign building and Session Zero follow in the next volume.`,
    { after: 160 }
  ));
  children.push(threeColTable(
    ["CHAPTER", "WHAT'S INSIDE", "PAGE"],
    bookContents,
    [3600, 5280, 1200]
  ));
  children.push(pageBreak());
  return children;
}

// ---------------------------------------------------------------------------
// CHAPTER 4 — YOUR JOB AT THE TABLE
// ---------------------------------------------------------------------------

function chapter4() {
  const children = [];
  children.push(eyebrow("Chapter 4"));
  children.push(chapterTitle("Your Job at the Table"));

  children.push(flavorQuote(
    `Three people can describe the room. Only one person can decide that describing the room is what this moment is for.`
  ));
  children.push(spacer(140));

  children.push(bodyPara(
    `Most of what happens in a session could, in principle, be done by anyone. Description, voices, reacting to a roll — a confident student could do all of it. Three things could not, and those three are your actual job. Everything else you do is optional and should be the first thing you drop when a session runs short.`
  ));

  children.push(sectionHeading("One — You Decide What Each Moment Is For"));
  children.push(bodyPara(
    `Before a scene starts, you know which student is about to be in the spotlight and which structure you want out of them. That is invisible to the table and it is the difference between a session that produces language and one that produces excitement.`
  ));
  children.push(bodyPara(
    `The mechanism is simple. Each student is carrying a Language Focus — one grammar point or vocabulary set, from their own coursework, that week. You build the scene so that the natural thing to say uses it. Not the only thing. The natural thing.`
  ));
  children.push(calloutBox(
    "Example",
    `Leo's Language Focus is “is / are — affirmative and questions.” You do not announce a grammar exercise. You put him alone in a room with a nervous servant and have the servant ask, quietly, whether the people he arrived with are dangerous. Leo cannot answer that without using is and are half a dozen times, and he will never notice that he was aimed at.`,
    "example"
  ));
  children.push(bodyPara(
    `Do this for each student, once per session, and the session did its job. Trying to do it for every student in every scene will exhaust you by week three.`
  ));

  children.push(sectionHeading("Two — You Protect the Weakest Speaker"));
  children.push(bodyPara(
    `A mixed-level table has a gravity problem. The strongest speaker answers first, because they can. The weakest speaker learns, by about session four, that waiting three seconds means somebody else will handle it. Left alone, this hardens permanently, and it looks like shyness when it is actually a habit the table taught them.`
  ));
  children.push(bodyPara(
    `You break it with structure, not with encouragement. Address a question to a named player instead of to the group. Ask the beginner first, and the advanced student second — asking in the other order tells the beginner that everything worth saying has already been said. Where possible, give the beginner the closed choice and the advanced student the open one: “Do you go through the window or the door?” for one, “What do you do?” for the other. Both are playing the same scene. Only one of them was asked something they can answer under pressure.`
  ));
  children.push(calloutBox(
    "Watch for this",
    `A student who ends three sessions in a row with all their Spotlight Tokens unspent is not being modest. They are not getting in. That is your problem to fix, not theirs.`,
    "warn"
  ));

  children.push(sectionHeading("Three — You Correct Without Anybody Noticing"));
  children.push(bodyPara(
    `The single hardest habit to build, and the one that most separates this from a normal class. A student says something wrong. Every teaching instinct you have says correct it. You are not going to — not out loud, and not by stopping anything. Sometimes you fold the right form into your next line; more often you make a character react in a way that gets the student to say it again themselves.`
  ));
  children.push(bodyPara(
    `Which of those two you reach for, and when, is the whole of Chapter 5. It is the most useful chapter in this book and the one worth rereading after your first month. What follows here is only the simplest version — the one to use while everything else is still new.`
  ));
  children.push(threeColTable(
    ["THE STUDENT SAYS", "YOU SAY BACK"],
    [
      ["“I go and I asking him where is the money.”", "“You cross the room and ask him where the money is. He does not look up.”"],
      ["“Yesterday we was in the tower and we finded a door.”", "“So you were in the tower yesterday and you found a door. Tell me what was on the other side.”"],
      ["“If she will come, we can escaping.”", "“If she comes, you can escape. So — do you wait for her?”"],
    ],
    [5040, 5040]
  ));
  children.push(spacer(160));
  children.push(bodyPara(
    `Notice what all three have in common. The correct form is delivered, the scene never pauses, nobody is told they were wrong, and every one of them ends by handing the moment straight back to the student. A recast that ends with you still talking is a recast that turned into a lecture.`
  ));

  children.push(pageBreak());
  children.push(sectionHeading("When a Student Freezes"));
  children.push(bodyPara(
    `It will happen weekly, and it is not a discipline problem — it is a working-memory problem. A student who is holding a plan, a grammar target and a second language at the same time will occasionally drop all three. What you do in the next four seconds decides whether they try again next week.`
  ));
  children.push(threeColTable(
    ["DO", "DO NOT"],
    [
      ["Wait. Count four seconds silently before you fill the gap. Most freezes end on their own by three.", "Jump in at one second. You will be the reason the silence never gets a chance to resolve."],
      ["Narrow the question. “What is the first thing you say to him?” is easier than “What do you do?”", "Repeat the same question louder or slower. The problem was never that they did not hear it."],
      ["Offer two options and let them pick, then ask them to say the chosen one in their own words.", "Answer for them and move on. It rescues the scene and costs you the student."],
      ["Let them ask you, in English, how to say the word they are missing. That question is part of the game.", "Supply the Portuguese. The moment you do it once, it becomes the default for the rest of the year."],
    ],
    [5040, 5040]
  ));

  children.push(sectionHeading("When One Student Takes Everything"));
  children.push(bodyPara(
    `Usually the most fluent, usually not doing it on purpose, usually the person having the best time. Handle it structurally and you keep their enthusiasm; handle it personally and you lose it.`
  ));
  children.push(bodyPara(
    `Cut away mid-momentum. End their scene at its high point and move to somebody else — this is a standard television technique and it works because leaving is not the same as being stopped. Give them Moves that only pay off through other people: Help or Interfere is built for exactly this, and so is the Diplomat's Tier 4, which only earns Language Points when another player narrates too. And give them the hardest linguistic target in the room, because a bored advanced student is a loud advanced student.`
  ));

  children.push(sectionHeading("The Half of the Job That Happens Before the Session"));
  children.push(bodyPara(
    `Ten minutes, once a week. You need to know, for each student, which unit they are on, which Language Focus that gives them, and where they are in the four-session cycle. That is the whole preparation requirement, and if you have that written down in front of you, you can improvise everything else.`
  ));
  children.push(calloutBox(
    "What ten minutes buys you",
    `Ana on past simple, Tiago on indirect questions, Leo on is and are, Vitor revising his unit. That is four scene ideas, already. Somebody has to be asked to tell what happened, somebody has to ask a stranger a careful question, somebody has to describe what is in a room, and somebody needs the same ground twice. You have not written a plot yet and you already have a session.`,
    "example"
  ));

  return children;
}

// ---------------------------------------------------------------------------
// CHAPTER 5 — THE LUDUS
// ---------------------------------------------------------------------------
// CHAPTER 6 — PASSING THE LANTERN
// A mecânica de co-criação. Fonte: doc de design de 06/09, corrigido em 13/09
// (oportunidade, não tempo de fala) e o Second Look.
// ---------------------------------------------------------------------------

const lanternSizes = [
  ["One Line", "10–20 seconds · A1 and A2",
   "One or two sentences, answering a closed or either/or question. “Is the market crowded or empty?” “What are the stalls selling?” A student with fifty words can succeed at this, and succeeding is the point."],
  ["One Place", "30–60 seconds · A2 and B1",
   "A full description of a place, a person or an object. The student decides what is there and what it is like, and it stays that way."],
  ["One Story", "1–3 minutes · B1+ and above",
   "Narration, not just description. “Tell us what happened here before you arrived.” “Tell us about the day your village was attacked.”"],
];

const lanternRules = [
  ["Say who, in advance",
   "In the opening minutes of the session, name the students who will hold the lantern tonight. Nobody is ambushed. Being called on without warning to speak at length in a foreign language is the fastest way to produce silence, and a student who knows it is coming arrives with half a dozen words already prepared. That is rehearsal, not cheating."],
  ["Opportunity, not a stopwatch",
   "Every student holds the lantern at least once per session, and nobody holds it twice before everybody has held it once. What you distribute is the invitation, never the minutes. Your most fluent student will speak more than your beginner, and there is nothing wrong with that. The failure this rule exists to prevent is one thing only: a student reaching the end of the night without ever being asked."],
  ["What they say is true",
   "It cannot be contradicted afterwards — not by you, not by another player. If Ana's market is enormous, it is enormous for the rest of the campaign. This is the whole reason the mechanic works: students can tell the difference between being asked for a real contribution and being given a turn to fill."],
  ["You add. You never delete",
   "You have no veto. What you have is one complicating question on top of what was said: “And why does nobody buy from the stall at the back?” Complicating is accepting. Correcting is overruling, and the student will read it exactly that way."],
];

const lanternScope = [
  ["Sensory detail of any place", "smell, sound, weather, movement, the state of things"],
  ["Minor NPCs and their manner", "who runs the stall, how they talk, what they complain about"],
  ["Their own character's past", "home village, family, trade, what they lost"],
  ["Local custom", "food, festivals, superstition, how people greet each other here"],
];

const lanternLimits = [
  ["Contradict established lore, or what another player has already created"],
  ["Remove a threat, solve the scene's problem, or hand the group a resource that solves it"],
  ["Say what another player's character did, thought or felt"],
  ["Create — or change the wants of — an NPC the adventure already relies on"],
];

const lanternPrompts = [
  ["Describe", "“What does this place look like? What do you notice first?”"],
  ["Narrate", "“What happened here, before you arrived?”"],
  ["Report", "“What did the innkeeper tell you about the road? Tell the others.”"],
  ["Regulate", "“What's the rule here? What is nobody allowed to do?”"],
  ["Quantify", "“How many people are there? Is there enough food for everyone?”"],
  ["Plan", "“How are you going to get in? Walk us through the plan.”"],
  ["Speculate", "“What do you think is happening here? Why?”"],
  ["Identify", "“Who is this person? How do they introduce themselves?”"],
  ["React", "“Your character sees this. How do they feel? What do they do first?”"],
  ["Suppose", "“If you had arrived a day earlier, what would have been different?”"],
];

function chapterLantern() {
  const children = [];
  children.push(eyebrow("Chapter 6"));
  children.push(chapterTitle("Passing the Lantern"));

  children.push(flavorQuote([
    `Whoever holds the lantern decides what the rest of the table can see.`,
  ]));
  children.push(spacer(140));

  children.push(bodyPara(
    `There is a problem built into the shape of a roleplaying game, and it is worse in a language classroom than anywhere else: the person who does most of the talking is the one who already speaks the language best. That is you. You describe the room, you voice the innkeeper, you narrate the weather — and every minute you spend doing it is a minute your students spend listening.`
  ));
  children.push(bodyPara(
    `Listening is not nothing. But it is not what they are paying for, and it is not what moves a Language Focus. This chapter is the structural answer: a repeatable move that hands the describing to a student, several times a session, on purpose.`
  ));

  children.push(calloutBox(
    "This is not improvisation, and it is not a reward",
    `Passing the lantern is part of the session's shape, like the debrief. It happens whether or not the scene is going well, whether or not anybody has earned it. If you only do it when you remember to, you will do it for your confident students and forget your quiet ones, which is precisely backwards.`,
    "warn"
  ));

  children.push(sectionHeading("Why the Fiction Allows It"));
  children.push(bodyPara(
    `The world on the far side of a Door is only fully formed where a traveller has already looked. That is a fact about the Ludus, not a metaphor — it is why the Doors need people to walk through them at all. So when you ask a student what the market looks like, you are not asking them to invent something. You are asking them to look, and what they see is what is there.`
  ));
  children.push(bodyPara(
    `Say it that way at the table and the mechanic stops feeling like a classroom exercise, which is the entire difficulty with asking students to produce language on demand.`
  ));

  children.push(pageBreak());

  children.push(sectionHeading("The Three Sizes"));
  children.push(bodyPara(
    `The size is what stops this from humiliating a beginner. Choose it before the session, from the level of the student who is going to receive it — not from how important the moment is.`,
    { after: 100 }
  ));
  children.push(threeColTable(
    ["SIZE", "HOW LONG, AND FOR WHOM", "WHAT YOU ASK FOR"],
    lanternSizes,
    [1700, 2500, 5880]
  ));
  children.push(calloutBox(
    "The either/or version is a real option",
    `For a student who is frozen, or having a bad week, ask a question that can be answered with one word and still creates something: “Is it crowded or empty?” They answer “empty”, and the market is empty for good. That is a genuine contribution, it costs them almost nothing, and it is very hard to fail at.`,
    "example"
  ));

  children.push(sectionHeading("The Four Rules"));
  children.push(threeColTable(
    ["RULE", "HOW IT WORKS, AND WHY", ""],
    lanternRules.map(([a, b]) => [a, b, ""]),
    [2200, 7880, 1]
  ));

  children.push(pageBreak());

  children.push(sectionHeading("What the Lantern May and May Not Create"));
  children.push(bodyPara(
    `This is the limit that protects a written adventure. Without it, one well-meaning player resolves your entire arc in a sentence — and they will not have done anything wrong, because you asked them to.`,
    { after: 100 }
  ));
  children.push(threeColTable(
    ["THEY MAY CREATE", "WHICH MEANS", ""],
    lanternScope.map(([a, b]) => [a, b, ""]),
    [3400, 6680, 1]
  ));
  children.push(spacer(120));
  children.push(threeColTable(
    ["THEY MAY NOT", "", ""],
    lanternLimits.map(([a]) => [a, "", ""]),
    [10078, 1, 1]
  ));

  children.push(sectionHeading("The Second Look"));
  children.push(bodyPara(
    `This is the move that handles a mixed table inside a single scene, and it is the most useful thing in this chapter. You pass the lantern twice over the same object: first small, to the student with less language, then large, to the student with more.`
  ));
  children.push(bodyPara(
    `“There's a merchant behind the last stall. Lu, take the lantern — what does he look like?” Lu says: “He is old. He is very tired and his clothes are dirty.” Ten seconds. Then: “An old man, tired, dirty clothes. Diego, second look — what does he regret?” And Diego spends a minute on the man's lost shop and the debt he could not pay.`
  ));
  children.push(calloutBox(
    "Why this beats giving them separate turns",
    `Look at what happened to Lu's ten seconds: they became the foundation of Diego's minute. Diego could not invent any merchant he liked — he had to build on a man who was old, tired and badly dressed, because that was already true. The beginner's sentence became load-bearing. Giving an A1 student ten seconds in an isolated scene is kindness; making those ten seconds determine what a B2 student has to say next is structure, and the A1 student can feel the difference immediately.`,
    "example"
  ));
  children.push(calloutBox(
    "The second look never contradicts the first",
    `Deeper, longer, more history — never a correction. If Diego says “actually he's young”, cut it: “No — Lu already told us he's old. So why is an old man still working?” That is not a rebuke of Diego. It is the rule doing its job in front of everybody, which is how the table learns it.`,
    "warn"
  ));

  children.push(pageBreak());

  children.push(sectionHeading("Choosing Who Gets It, and What to Ask"));
  children.push(bodyPara(
    `Look at the Language Focus of each student before the session, exactly as Chapter 3 describes, and let it choose both the person and the question. A student working on description gets a One Place. A student working on past narration gets a One Story. A student working on obligation and permission gets asked what the rules of this place are, and who enforces them.`
  ));
  children.push(bodyPara(
    `This is the part worth understanding properly: the mechanic that makes a student a co-author of the world is the same mechanic that aims at their grammar. You are not doing two things. You are doing one thing, and choosing who it lands on.`,
    { after: 100 }
  ));
  children.push(threeColTable(
    ["WHAT THEY ARE STUDYING", "HOW YOU PASS THE LANTERN", ""],
    lanternPrompts.map(([a, b]) => [a, b, ""]),
    [2700, 7380, 1]
  ));
  children.push(calloutBox(
    "Say the question in English, always",
    `These are lines you say out loud at the table, in the target language, in character wherever you can manage it. A prompt translated into the students' first language stops being part of the fiction and becomes an instruction — and the whole design of this chapter is built to avoid exactly that.`,
    "warn"
  ));

  children.push(sectionHeading("The Codex"));
  children.push(bodyPara(
    `If what a student says becomes permanently true, somebody has to write it down. The cheapest version that works: a shared document, and one line per lantern, written by you immediately after the session. Four lines a week. Thirty seconds.`
  ));
  children.push(calloutBox(
    "The part nobody expects",
    `After a year the Codex holds roughly a hundred and fifty lines of world, written in English by your students, about a subject they are personally invested in, at exactly their level. That is a reading text no published material can produce. Open it on screen occasionally and read a few lines aloud before you begin — it takes two minutes and it is the best warm-up in this book.`,
    "example"
  ));

  children.push(sectionHeading("Where It Sits in the Session"));
  children.push(bodyPara(
    `Two to four passes per session, roughly one every twenty to twenty-five minutes, totalling three to five minutes of table time. It is cheap. One of them is fixed: the opening of Act I is always a lantern. The place where tonight begins is never described by you.`
  ));

  return children;
}

// ---------------------------------------------------------------------------

const ludusPlaces = [
  ["The Hall of Doors", "A long room with six doors in it, none of them matching. This is where every expedition starts and ends. The Doors are not decoration: they are the campaign structure made visible."],
  ["The Kitchen", "Enormous, always warm, always somebody in it. This is where the table actually talks — downtime scenes, arguments, planning, the conversation after something went wrong. If you only build one room properly, build this one."],
  ["The Long Library", "Books, films, recordings and objects from worlds whose Doors have already closed. The only place in the Ludus where the past can be studied. Anything a group needs to have found out is in here, somewhere, badly catalogued."],
  ["The Balcony", "It looks out on nothing — no landscape, no sky, just soft grey light. People come here to think and to say things they would not say in the Kitchen. Your quiet-scene location."],
  ["The Under-rooms", "Below the Ludus, unmapped, and getting larger. Nobody agrees on how many floors there are. This is where the long mystery lives, and you should not decide what is down there until your table has played for a year."],
];

const ludusCast = [
  ["Halden, the Keeper", "PRESENT",
   "Old, upright, unhurried; has run the Ludus longer than anyone can verify. Speaks in flat statements of fact and has no patience for speculation. Keeps a ledger of every person in the building and what they can do. He is the one who hands out the errands, and he hands them out as facts: there is a problem, we need a thing, you are going.",
   "Present simple and continuous, there is / there are, imperatives, adverbs of frequency, quantifiers in the present, description. He wants to know what is, never what it might mean."],
  ["Piro, at the Doors", "FUTURE",
   "Cheerful, restless, physically incapable of silence. Claims every Door has a mood and is right often enough to be annoying. Predicts everything with total confidence and is wrong about half the time. He is the last person the group speaks to before crossing and the first when they come back.",
   "will and going to, present continuous for arrangements, first conditional, time clauses with when / before / until, future perfect for the advanced. Plans, predictions, expectations, warnings."],
  ["Sable, the Cartographer", "PAST",
   "Quiet and slow. Draws maps of worlds that may no longer exist and refuses to state anything as certain. Carries a low, permanent grief for places she can no longer reach. The only person here for whom the past is work rather than memory.",
   "Past simple and continuous, used to and would, present perfect, past perfect, reported speech, quantifiers of what there was. Everything that happened, and everything that used to be."],
  ["Quill, the Archivist", "MODALS & CONDITIONALS",
   "The youngest person in the building and the most certain. Treats the Library catalogue as a moral matter. Knows exactly what everyone is and is not allowed to do, and says so. Not hostile — young, and still convinced that rules are what holds the world together.",
   "can and could, must, have to, need to, mustn't, should, may, might; all four conditionals; wish and if only. Permission, ability, obligation, prohibition, probability, regret."],
  ["The Tenant", "FUNCTIONAL LANGUAGE",
   "Came through a Door years ago and will not say which. Impeccably polite, never direct, somehow always already in the room. Has a name and will not confirm it — Halden wrote the tenant in the ledger and it stuck. Everyone likes him; nobody knows him.",
   "Reacting to news, agreeing and disagreeing politely, softening, hedging, interrupting, changing the subject; idiom, understatement and inference. The lesson your course book calls functional language."],
];

function chapterLudus() {
  const children = [];
  children.push(eyebrow("Chapter 7"));
  children.push(chapterTitle("The Ludus"));

  children.push(flavorQuote([
    `Nobody built the Ludus. It was found — by somebody who was looking for a way home and opened the wrong door.`,
    `There are six doors in the long hall now. There used to be more.`,
  ]));
  children.push(spacer(140));

  children.push(sectionHeading("Why There Is a Shared World at All"));
  children.push(bodyPara(
    `The Player's Guide offers six settings, and that creates a problem the moment you try to run it. Six settings means either six invented worlds with nothing connecting them, or a table that starts from nothing every time it changes worlds. Both are exhausting to prepare and neither accumulates: nothing that happened last year matters this year.`
  ));
  children.push(bodyPara(
    `The Ludus is the answer. It is one place, permanent, that all six settings hang off. Your table always has a home to return to, a cast they already know, and a history that keeps growing no matter how many worlds they visit.`
  ));
  children.push(calloutBox(
    "What this buys you, concretely",
    `Changing setting stops being a reset and becomes a journey. Retiring a character stops being an administrative event and becomes a scene. Recurring NPCs give your students the same people to talk to for years, which is the cheapest vocabulary reinforcement that exists. And you get a standing reason for any adventure to start: somebody at the Ludus needs something from the other side of a Door.`,
    "clarify"
  ));

  children.push(sectionHeading("What the Ludus Is"));
  children.push(bodyPara(
    `A building the size of a small town, standing at the point where every world touches. It is not in any of them. There is no outside — walk far enough in any direction and you find another corridor.`
  ));
  children.push(bodyPara(
    `Nobody knows who made it. Everybody living there arrived the same way: they went through a door somewhere, at some point, and came out here, and could not find the way back. The Ludus is not a prison. It is warm, there is food, there is work. It is simply very far from home, and nobody is sure in which direction.`
  ));
  children.push(threeColTable(
    ["PLACE", "WHAT IT IS FOR"],
    ludusPlaces,
    [2400, 7680]
  ));

  children.push(pageBreak());
  children.push(sectionHeading("The People Your Students Will Know for Years"));
  children.push(bodyPara(
    `Five recurring characters, and they are not decoration. Each one is built on one grammatical pillar — the five that any study track cycles through over and over, deeper each time. Learn these five people and you never have to invent a Ludus NPC again; more usefully, you always know exactly who to send a student to.`
  ));
  children.push(bodyPara(
    `This is the single most practical tool in the guide. A student is working on past narration this month, so they end up reporting to Sable. A student is on modals of obligation, so they end up arguing with Quill about what the Library will and will not allow. You are not inventing a scene. You are choosing a person.`,
    { after: 100 }
  ));
  children.push(threeColTable(
    ["WHO", "PILLAR", "WHO THEY ARE", "WHAT THEY PULL OUT"],
    ludusCast,
    [1700, 1900, 3240, 3240]
  ));
  children.push(spacer(180));
  children.push(calloutBox(
    "How the cast turns into a session plan",
    `Open your pre-session sheet. Ana is on past simple, Tiago on indirect questions, Leo on is and are, Vitor revising his unit. That means: Ana reports to Sable, Leo answers to Halden, and Tiago has to get something out of the Tenant, who will not answer anything directly. Three scenes, and you have not invented a plot yet.`,
    "example"
  ));
  children.push(spacer(140));
  children.push(calloutBox(
    "Quantifiers are not a sixth pillar",
    `How much and how many belong to whichever tense is in play. Halden asks how many people are in the Kitchen right now; Sable asks how many there used to be. A separate character for quantity would have given you two people asking nearly the same question, so it is folded into the tenses instead — which is also how course books teach it.`,
    "clarify"
  ));

  children.push(sectionHeading("The Doors, and What They Do to You"));
  children.push(bodyPara(
    `Six Doors, six worlds. A Door will not let you through as you are. It remakes you on the way, so that you arrive belonging to the place — the right body, the right clothes, the right past, a name that fits. You keep everything that is actually you. You lose your shape.`
  ));
  children.push(bodyPara(
    `This is not flavour. It is the Rebuilding at Level rule from the Player's Guide, told as a story. When your table moves to a new world, every player rebuilds at their current Growth Level, keeps their Boons in changed form, and may keep or change their Archetype. In the fiction, that is simply what walking through a Door does.`
  ));
  children.push(calloutBox(
    "Example",
    `Ana's Boon is a sealed letter that opens any door in the capital. The table goes through the Cyberpunk Door. Ana walks in as Mira, in a warm cloak, and walks out as somebody else entirely — a fixer with a cheap coat and an access token that no checkpoint has ever refused. Same Boon. Same Growth Level. Different shape. She did not lose a character; she watched one become another, on screen, in a scene the whole table saw.`,
    "example"
  ));

  children.push(sectionHeading("The Long Problem"));
  children.push(bodyPara(
    `There used to be more Doors. Piro remembers nine. Sable has maps for at least four that no longer open. Nobody knows what is closing them, and nobody knows what happens to a world once its Door has gone.`
  ));
  children.push(bodyPara(
    `This is the spine of the whole campaign, and it is deliberately slow. It gives you a reason for any expedition — go now, while the Door still opens — and it gives you an ending to build towards in three or four years, if a table lasts that long. It also means you never have to justify why the group is going somewhere: they are going because the Door is still there, and that is not guaranteed to be true next year.`
  ));
  children.push(calloutBox(
    "Do not solve this early",
    `Resist the urge to decide what is closing the Doors. As long as it is unanswered, it generates hooks for free. The week you answer it, you have to replace it with something else.`,
    "warn"
  ));

  children.push(pageBreak());
  children.push(sectionHeading("How a Campaign Actually Uses This"));
  children.push(threeColTable(
    ["MOMENT", "WHAT HAPPENS AT THE LUDUS"],
    [
      ["Session Zero", "The characters have all arrived here recently. They meet in the Kitchen. They have never been through a Door. Halden has an errand."],
      ["Start of an arc", "Somebody needs something from the far side of a Door. The group takes it. Piro tells them what mood the Door is in."],
      ["During an arc", "The Ludus is off screen. You are entirely in one world, playing that setting, for ten to twelve sessions."],
      ["End of an arc", "They come back. Downtime in the Kitchen. Consequences arrive. Whatever they brought back goes into the Library, and stays there for years."],
      ["Changing worlds", "A new Door. Everyone rebuilds at their Growth Level, on screen, as they walk through. Boons change shape. Nothing is lost."],
      ["A player leaves for good", "Their character stays at the Ludus. They are still in the Kitchen when the group gets back. If that student ever returns, so does their character."],
    ],
    [2400, 7680]
  ));

  children.push(spacer(180));
  children.push(calloutBox(
    "You are allowed to ignore all of this",
    `The Ludus is not optional, and it is not decoration. Logging into the call is walking into it; crossing the Door is when the players become their characters; leaving through the Door is how a session ends. A table that intends to stay behind one Door for years still arrives through the Ludus every week, because that arrival is what makes the change of world possible later without anything having to be explained.`,
    "clarify"
  ));

  return children;
}

// ---------------------------------------------------------------------------
// CHAPTER 6 — THE SIX DOORS
// ---------------------------------------------------------------------------

const doors = [
  {
    name: "The Iron Door",
    setting: "Fantasy",
    focuses: "Courage · Empathy · Wit · Instinct",
    look: "Black iron, too heavy for one person, warm to the touch. It smells of rain on stone.",
    world: "The Tallow Coast: three walled cities on one road, sea on one side and unmapped interior on the other. Magic did not fade here — it was licensed, and burning it without a Warrant is a crime. Eighty years ago a fourth city stopped, and nobody goes there.",
    feel: "The most forgiving setting to run and the easiest for a beginner to picture. Nothing here needs explaining to anybody.",
    language: "Permission and prohibition, because the whole world runs on paperwork. Requests and negotiation. Describing places and people. The default first world for a table with real beginners in it.",
    hooks: [
      "A merchant at the Ludus wants a debt collected in a city three days from the Door. The debtor is not hiding, which is the strange part.",
      "Something came back through the Iron Door last month and nobody saw what. Halden wants it found before it settles.",
      "A village will not say what it is afraid of, and pays the group not to ask.",
    ],
    cost: "If the Iron Door closes, the Ludus loses its easiest supply of food and its only reliable source of paper.",
  },
  {
    name: "The Salt Door",
    setting: "Cosmic Horror",
    focuses: "Nerve · Rapport · Lore · Dread",
    look: "Pale wood, swollen as though it has been underwater, crusted white around the frame. It is cold from two metres away.",
    world: "A coast, a century or so behind the modern world, where something very large is asleep offshore and the towns have quietly organised themselves around not waking it. Nobody says so out loud.",
    feel: "Slow and talky. Almost no combat. The tension comes from what people will not tell you, which makes it the best setting in the book for advanced students and a poor one for beginners.",
    language: "Hedging and uncertainty. Reported speech. Describing something you are not sure you saw. It might have been. She said she had not.",
    hooks: [
      "A letter arrives at the Ludus from someone who died two years ago, postmarked last week.",
      "The group is asked to bring back a specific book. Every copy in the town has the same forty pages removed.",
      "A town is holding a festival that no one under fifty has ever attended before.",
    ],
    cost: "The Salt Door is the only one that opens onto a world where the Ludus itself is written about. Close it and the Library loses its only outside account of what this place is.",
  },
  {
    name: "The Glass Door",
    setting: "Supernatural Investigation",
    focuses: "Grit · Rapport · Deduction · Hunch",
    look: "Frosted glass in a plain frame, like an office door. There is a light on behind it that never goes out.",
    world: "A city, roughly now, where the impossible happens often enough that a small number of people make a living dealing with it, and the rest of the population has agreed not to notice.",
    feel: "Structured and satisfying. Every arc is a case: a question at the start, an answer at the end. The easiest setting to prepare, because the shape is always the same.",
    language: "Question forms of every kind. Past tenses under pressure. Deduction — must have, cannot have, might have. Superb for intermediate tables.",
    hooks: [
      "Somebody at the Ludus is being investigated on the other side of the Glass Door, and does not know it.",
      "Four people in one building have reported the same dream. The building is nine years old.",
      "A client wants the group to prove that nothing happened.",
    ],
    cost: "The Glass Door is where the Ludus gets its medicine and most of its news about the modern world.",
  },
  {
    name: "The Red Door",
    setting: "Dystopian Superheroes",
    focuses: "Valor · Charisma · Ingenuity · Reflex",
    look: "Painted steel, municipal red, with a small window at head height that has been broken and replaced many times.",
    world: "A country where extraordinary people exist, are licensed, and are managed. Power is legal, regulated and expensive, and the people who have it mostly work for someone who does not.",
    feel: "Loud and argumentative. The conflicts are about legitimacy, not strength — who is allowed, who decides, who pays. Teenagers love it.",
    language: "Opinions and argument. Modals of obligation — must, should, have to. Persuading a crowd. The best setting for a table that likes to disagree.",
    hooks: [
      "The group is asked to appear at a public hearing on the other side of the Door and testify about something they did not do.",
      "A licence has been issued in one of the group's names. They have never been through this Door.",
      "Somebody is doing good work without a licence and the group is asked to stop them.",
    ],
    cost: "The Red Door is the Ludus's only route to a world with functioning industry. Close it and repairs become impossible.",
  },
  {
    name: "The Rust Door",
    setting: "Post-Apocalypse Survival",
    focuses: "Steel · Trust · Salvage · Survival",
    look: "Corrugated metal, orange with rust, held shut by a bar. Hot air comes under it.",
    world: "Eighty years after something that nobody living remembers properly. Small settlements, long distances, and water as the only currency that has never lost value.",
    feel: "Practical and tense. Decisions have weights and costs. This is the setting where the Pack rule earns its keep, because six slots matter when the walk is four days.",
    language: "Giving and following instructions. Conditionals. Stating needs plainly and quickly. Used to, for describing the world before.",
    hooks: [
      "A settlement will trade something the Ludus badly needs, but only for a person who can read.",
      "The group finds a working machine. Nobody within two hundred kilometres knows what it was for.",
      "Somebody at the Ludus came from this world and wants a message delivered to a place that may no longer exist.",
    ],
    cost: "The Rust Door is where the Ludus's water comes from. It is the one nobody is willing to lose.",
  },
  {
    name: "The Bright Door",
    setting: "Cyberpunk",
    focuses: "Edge · Face · Hacking · Street",
    look: "A seamless panel that lights up when you approach it and asks, in a pleasant voice, who you are.",
    world: "A city sixty or seventy years ahead, run by companies that provide everything and own everyone, where the difference between a citizen and a product is a contract most people have not read.",
    feel: "Fast, verbal and slippery. Almost every scene is a negotiation with somebody who is also negotiating. Superb for advanced students, punishing for beginners.",
    language: "Future forms. Technical description. Bargaining, and saying one thing while meaning another. The setting with the highest language ceiling in the book.",
    hooks: [
      "The Ludus appears, by name, in a corporate database. Somebody put it there deliberately.",
      "The group is hired to steal something that turns out to be a person's memory of an afternoon.",
      "A contract the group signed years ago, in another world, is enforceable here.",
    ],
    cost: "The Bright Door is the only place the Ludus can get anything repaired that has electronics in it — including whatever is under the Under-rooms.",
  },
];

function doorBlock(d) {
  const parts = [];
  parts.push(new Paragraph({
    spacing: { before: 300, after: 40 },
    keepNext: true,
    border: { bottom: { style: BorderStyle.SINGLE, size: 10, color: ACCENT, space: 4 } },
    children: [
      new TextRun({ text: d.name.toUpperCase(), bold: true, color: INK, size: 28 }),
      new TextRun({ text: `   ${d.setting}`, bold: true, color: ACCENT, size: 20 }),
    ],
  }));
  parts.push(new Paragraph({
    spacing: { after: 120 },
    children: [ new TextRun({ text: d.focuses, bold: true, color: BRAND, size: 19 }) ],
  }));
  parts.push(bodyPara(d.look, { italics: true, after: 120 }));
  parts.push(threeColTable(
    ["THE DOOR OPENS ONTO", "WHAT IS THERE"],
    [
      ["The world", d.world],
      ["How it plays", d.feel],
      ["The language it produces", d.language],
      ["If this Door closes", d.cost],
    ],
    [2400, 7680]
  ));
  parts.push(spacer(120));
  parts.push(new Paragraph({
    spacing: { after: 60 },
    keepNext: true,
    children: [ new TextRun({ text: "THREE WAYS IN", bold: true, color: ACCENT, size: 17, characterSpacing: 15 }) ],
  }));
  d.hooks.forEach((h) => {
    parts.push(new Paragraph({
      spacing: { after: 60 },
      indent: { left: 240 },
      children: markTerms("— " + h, { color: INK_SECONDARY, size: 20 }),
    }));
  });
  parts.push(spacer(160));
  return parts;
}

function chapterDoors() {
  const children = [];
  children.push(eyebrow("Chapter 8"));
  children.push(chapterTitle("The Six Doors"));

  children.push(bodyPara(
    `Six worlds, six Doors, one Hall. Each entry below gives you what the Door looks like, what is on the other side, how the setting actually plays at a table, and — the part that matters most for planning — what language the world produces without you having to force it.`
  ));
  children.push(bodyPara(
    `That last line is the one to read first when you are choosing. A setting is not a theme, it is a machine for generating certain kinds of sentence. Pick the world whose natural conversations match what your students are studying this semester, and half your scene preparation is done before you start.`
  ));
  children.push(calloutBox(
    "Choosing with a mixed table",
    `Look at every student's Language Focus for the coming months and find the middle. A table of beginners and low intermediates wants the Iron Door. A table that has been together two years and argues well wants the Bright Door or the Salt Door. When you are not sure, the Glass Door fits almost any group, because a case generates questions, past narration and speculation all at once.`,
    "clarify"
  ));
  children.push(spacer(140));
  children.push(calloutBox(
    "Only the four Focus names change",
    `Each world renames the four Focuses to fit — Courage becomes Nerve, becomes Grit, becomes Steel — but they are the same four positions in the same order, doing the same job. A Vanguard is a Vanguard behind every Door. Nothing else about a character sheet changes.`,
    "warn"
  ));

  doors.forEach((d, i) => {
    if (i > 0 && i % 2 === 0) children.push(pageBreak());
    children.push(...doorBlock(d));
  });

  return children;
}

// ---------------------------------------------------------------------------
// CHAPTER 5 — CORRECTING WITHOUT BREAKING THE SCENE
// The one chapter that changes how a session actually sounds. Built on Lyster
// and Ranta's six categories of oral corrective feedback, and on the finding
// that the technique most teachers reach for is the one learners least notice.
// ---------------------------------------------------------------------------

const feedbackTypes = [
  ["Clarification request", "~67%",
   "“Sorry? I don't follow.”",
   "Quill looks up from the ledger. “I'm sorry — say that again? I have to write it down exactly.”"],
  ["Repetition", "~69%",
   "Repeat the error back with a rising intonation.",
   "The Tenant raises an eyebrow and repeats the sentence back, politely, as though he is not quite sure he heard it."],
  ["Elicitation", "~60%",
   "Start the sentence and stop.",
   "Halden: “So yesterday you…” — and then nothing. He has never finished anybody's sentence and he is not going to start."],
  ["Recast", "~45%",
   "Say the correct version back inside your narration.",
   "Still your default for anything not worth stopping for. Cheap, invisible, weak."],
  ["Explicit correction", "—",
   "Name the error and give the right form.",
   "Never during a scene. It belongs in the debrief, when the fiction is already closed."],
  ["Metalinguistic clue", "—",
   "Name the rule the error broke.",
   "Never during a scene, for the same reason."],
];

const promptCast = [
  ["Halden", "Elicitation", "He is slow and he does not fill silences. Starting a sentence and waiting is simply how he talks."],
  ["Quill", "Clarification request", "He needs everything exact, for the form, for the catalogue, for the record. Asking again is his whole personality."],
  ["The Tenant", "Repetition", "Repeating your words back with mild surprise is the most Tenant thing that could possibly happen."],
  ["Piro", "Elicitation", "He interrupts constantly, then loses his thread and waits for you to finish the thought. Same effect, different reason."],
  ["Sable", "Clarification request", "She refuses to write down anything she is not certain of, so she asks again. And again."],
];

function chapter5() {
  const children = [];
  children.push(eyebrow("Chapter 5"));
  children.push(chapterTitle("Correcting Without Breaking the Scene"));

  children.push(flavorQuote([
    `A student says something wrong. You have about one second to decide what kind of teacher you are.`,
  ]));
  children.push(spacer(140));

  children.push(bodyPara(
    `This is the chapter that changes how your sessions actually sound, and it starts with an uncomfortable piece of research.`
  ));

  children.push(sectionHeading("The Technique Everyone Uses Is the Weakest One"));
  children.push(bodyPara(
    `There are six recognised ways to correct spoken language. One of them is the recast: you repeat what the student said, fixed, without ever announcing that you fixed it. It is fluent, it is kind, it does not interrupt anything — and it is by a wide margin the one teachers reach for most.`
  ));
  children.push(bodyPara(
    `It is also the one that works least. Study after study finds the same thing: learners frequently do not notice a recast at all. They assume you are responding to what they said, not how they said it — and in a game, where you are visibly responding to content all the time, that misreading is close to guaranteed.`
  ));
  children.push(calloutBox(
    "The numbers",
    `Around 55% of teacher corrections are recasts, and they produce learner repair roughly 45% of the time. The alternatives — which get grouped together as prompts, because they push the work back to the learner instead of handing over the answer — run considerably higher: about 69% for repetition, 67% for clarification requests, 60% for elicitation. The difference is not subtle, and it is not about kindness. It is about who does the reformulating.`,
    "warn"
  ));
  children.push(bodyPara(
    `So the obvious fix is to stop recasting and start prompting. Except that the obvious fix breaks the game: stopping a scene to say “careful, that is the wrong tense” costs exactly the immersion this whole system is built to protect.`
  ));

  children.push(sectionHeading("The Way Out: A Prompt Is Something a Person Can Do"));
  children.push(bodyPara(
    `Three of the strongest prompt types are not teaching behaviours at all. They are ordinary things a human being does in conversation — asking someone to repeat, saying a phrase back in surprise, trailing off and waiting. An NPC can do every one of them without a single word of English class entering the room.`
  ));
  children.push(bodyPara(
    `You never step outside the fiction. The character reacts, the student says it again, and the correction happened without anybody naming it.`,
    { after: 100 }
  ));
  children.push(pageBreak());
  children.push(threeColTable(
    ["TYPE", "REPAIR", "OUT OF THE FICTION", "INSIDE THE FICTION"],
    feedbackTypes,
    [2100, 1000, 2800, 4180]
  ));

  children.push(pageBreak());
  children.push(sectionHeading("The Three-Step Ladder"));
  children.push(bodyPara(
    `You cannot prompt every error — a session would collapse into repetition and the story would never move. So the rule is not “always prompt”. It is a ladder, and where an error lands on it depends entirely on whose error it is and what they are studying.`,
    { after: 100 }
  ));
  children.push(threeColTable(
    ["WHEN", "WHAT YOU DO"],
    [
      ["An error that does not block understanding and is not that student's Language Focus.",
       "Recast, and keep going. It is not worth the friction, and you will get another chance next week."],
      ["An error in the exact structure that student is working on this month.",
       "Prompt, in character. Ask them to say it again, repeat it back, or stop halfway and wait. They reformulate, and this time they notice."],
      ["A pattern you have watched the same student repeat for weeks.",
       "Name it explicitly — in the debrief at the end of the session, with the fiction already closed. This is the one place where saying “here is the rule” is the right move."],
    ],
    [4400, 5680]
  ));

  children.push(spacer(180));
  children.push(calloutBox(
    "Example — the same error, three ways",
    `Bruno says: “Yesterday we go to the tower and we finding a door.” If past simple is not what Bruno is working on, you recast: “So you went to the tower and found a door — what was inside?” If past simple IS his Language Focus, you prompt instead: Sable stops writing, looks up and says, “Wait. Yesterday you… ?” and waits. Bruno tries again. And if Bruno has been dropping past tense every week since March, you say nothing during play at all — you raise it in the last five minutes, out of character, once.`,
    "example"
  ));

  children.push(sectionHeading("Who Does Which Prompt Best"));
  children.push(bodyPara(
    `The Ludus cast was built around grammatical pillars, but it turns out each of them also has a personality-shaped excuse for one of the prompt types. That is not a coincidence you should waste.`,
    { after: 100 }
  ));
  children.push(threeColTable(
    ["NPC", "NATURAL PROMPT", "WHY IT IS IN CHARACTER"],
    promptCast,
    [1800, 2400, 5880]
  ));

  children.push(spacer(180));
  children.push(calloutBox(
    "If you are not at the Ludus",
    `Any NPC in any setting can do all three. A bored border guard asks you to repeat yourself. A suspicious merchant says your own words back to you. A nervous informant starts a sentence and cannot finish it. The technique does not need the Ludus — the Ludus just means you already know who is going to do it.`,
    "clarify"
  ));

  children.push(sectionHeading("The Debrief Is Where Explicit Teaching Lives"));
  children.push(bodyPara(
    `The last five minutes of a session are out of character by design, and that makes them the only safe place for direct correction. Keep it to one point per student, maximum, and tie it to something that actually happened in play — “twice tonight you said if she will come; the if half never takes will” lands because both of you remember the moment.`
  ));
  children.push(bodyPara(
    `Do not save up a list. A student who receives five corrections at the end of a session hears one message, and it is not about grammar.`
  ));

  children.push(sectionHeading("What Never Happens"));
  children.push(threeColTable(
    ["NEVER", "WHY"],
    [
      ["Stopping a scene to explain a rule.", "It converts a game back into a class, and the students feel the switch instantly. Whatever you were about to teach costs more than it is worth."],
      ["Correcting a student in front of the table by naming their error.", "Principle 6 and Principle 7 both die in that sentence. Everything after it is spoken more carefully and less often."],
      ["Prompting the same student twice in one scene.", "Once is a character reacting. Twice is an interrogation, and they will hear the difference."],
      ["Prompting an error the student cannot yet fix.", "If the structure is above where they are, they will reformulate it wrong twice and learn only that speaking is risky. Recast that one and move on."],
    ],
    [3400, 6680]
  ));

  return children;
}

// ---------------------------------------------------------------------------
// CHAPTER 8 — LEARNING TO RUN IT
// ---------------------------------------------------------------------------

const trainingPhases = [
  ["1", "Play, with no explanation at all",
   "The trainee is a player at a real short table, at their own English level, with you running it. Nothing is explained. The only goal is to feel it from the inside: the spotlight, the freeze, the moment somebody hands the scene back to you.",
   "They finish a session having produced English under mild pressure, and having been prompted several times without noticing."],
  ["2", "Play with the curtain up",
   "Same table. After each scene you stop for thirty seconds and say what you just did and why: “that was elicitation, aimed at Bruno; I stopped halfway on purpose.” They are still playing, but now they can see the machinery.",
   "They start predicting your moves before you make them. That is the signal they are ready for phase 3."],
  ["3", "Run one scene",
   "Ten minutes, one scene, at a real table, with you sitting beside them ready to take it back. Debrief immediately, against the written criteria below — never against your impression.",
   "One scene run start to finish without the trainer speaking."],
  ["4", "Run half a session",
   "You are present and silent. You take over only if the table genuinely stalls. Same criteria, same debrief.",
   "Half a session where every student spoke and the trainee never once explained a rule out loud."],
  ["5", "Run a full session",
   "Silent observation end to end, then a structured debrief. After this they are cleared to run their own table, with one follow-up visit a month for the first three months.",
   "All seven criteria met in a single session."],
];

const trainingCriteria = [
  ["No stretch of teacher narration ran past 45 seconds.", "Principle 1. The most common failure in phases 3 and 4, and the easiest to see."],
  ["Every student spoke in at least three scenes.", "Principle 7. Count it. Do not estimate it."],
  ["Each student's Language Focus was aimed at at least once.", "Principle 4. This is the difference between a fun session and a lesson."],
  ["At least three in-character prompts were used.", "Chapter 5. Clarification request, repetition or elicitation — not recasts."],
  ["No explicit correction happened during a scene.", "Chapter 5. One slip is a note; a habit is a retrain."],
  ["Nobody finished anybody's sentence, the trainee included.", "Principle 7, and the single hardest habit to break in an experienced teacher."],
  ["Every student held the lantern at least once.", "Chapter 6. The easiest of the seven to check and the easiest to forget under pressure."],
];

function chapter8() {
  const children = [];
  children.push(eyebrow("Chapter 9"));
  children.push(chapterTitle("Learning to Run It"));

  children.push(flavorQuote([
    `You cannot teach somebody to run this table by describing it, for the same reason you cannot teach somebody to swim in a classroom.`,
  ]));
  children.push(spacer(140));

  children.push(bodyPara(
    `A teacher who has read this guide cover to cover and never sat at a Ludify RPL table will run a bad first session. Not because they misunderstood anything, but because the skill is physical: waiting four seconds without filling the silence, cutting away from a scene at its high point, letting an error go past. None of that is knowledge. All of it is habit.`
  ));
  children.push(bodyPara(
    `So the training is built in three layers — feel it, see the machinery, run it with a net — across five meetings. Each step removes some of the support.`
  ));

  children.push(sectionHeading("Why the First Two Phases Are Spent Playing"));
  children.push(bodyPara(
    `A trainee who has only ever been the teacher has never experienced the thing the students experience every week. They have never been the person who knew the answer and could not assemble the sentence in time. Until they have, every judgement they make about pacing will be wrong in the same direction — too fast, too helpful, too full.`
  ));
  children.push(bodyPara(
    `There is a second reason, and it is quieter. Everything you do while running that table is a demonstration. The trainee is being prompted, recast and spotlighted for two whole sessions before anybody uses those words in front of them. By the time you name the techniques in phase 2, they have already felt all of them work.`
  ));
  children.push(calloutBox(
    "The limit of learning by playing",
    `Playing teaches you to play. On its own it produces a trainee who has good instincts and cannot say why — which is exactly the criticism most often made of teacher-training courses that are built around practice and reflection without explicit method. That is why phases 3 to 5 exist, and why every one of them ends against a written list instead of a conversation.`,
    "warn"
  ));

  children.push(pageBreak());
  children.push(sectionHeading("The Five Meetings"));
  children.push(threeColTable(
    ["#", "WHAT HAPPENS", "WHAT IT IS FOR", "DONE WHEN"],
    trainingPhases,
    [600, 2400, 4000, 3080]
  ));

  children.push(spacer(200));
  children.push(sectionHeading("The Six Criteria"));
  children.push(bodyPara(
    `The trainee receives this list before they run anything, not after. That single detail is what separates useful feedback from the kind that leaves somebody feeling judged without knowing what to change.`
  ));
  children.push(bodyPara(
    `Every criterion is observable and binary. The observer marks yes or no. There is no scale, no impression, and no discussion of talent.`,
    { after: 100 }
  ));
  children.push(threeColTable(
    ["THE CRITERION", "WHERE IT COMES FROM"],
    trainingCriteria,
    [5040, 5040]
  ));

  children.push(spacer(180));
  children.push(calloutBox(
    "How to run the debrief",
    `Trainee speaks first, for two minutes, on what they would change. Then you go through the six, in order, saying yes or no to each. Then you pick exactly one to work on next time. One. A trainee who leaves with six things to fix fixes none of them.`,
    "example"
  ));

  children.push(sectionHeading("If You Are Training Yourself"));
  children.push(bodyPara(
    `The first teacher of this system has no trainer, and neither will the second one in a school that only has one table. The five phases still work, with one substitution: record the session, and be your own observer a day later.`
  ));
  children.push(bodyPara(
    `You cannot self-assess in the moment — you are busy running the table, and your memory of a session is systematically kinder to you than the recording is. But watching yourself against seven binary criteria a day later is close to as good as an observer, and on two of them it is better, because the recording knows exactly how long you talked and your memory does not.`
  ));
  children.push(calloutBox(
    "The cheap version that actually works",
    `Record the audio on your phone. The next day, do one pass with a timer and a piece of paper: mark every stretch where you speak for more than 45 seconds, and tally which student spoke in which scene. That is two of the seven criteria measured properly, and it is fifteen minutes of work. Do it once a month, not every week.`,
    "example"
  ));

  children.push(sectionHeading("What Comes After the Fifth Session"));
  children.push(bodyPara(
    `The new teacher runs their own table. You visit once a month for three months, observe silently, and debrief against the same seven lines. After that they are on their own, with one standing rule: any time a table starts to feel flat, go back to the seven criteria before changing anything about the story. Nine times out of ten the story was never the problem.`
  ));

  return children;
}

// ---------------------------------------------------------------------------
// ASSEMBLE
// ---------------------------------------------------------------------------

const children = [];
children.push(...titlePage());
children.push(...contentsPage());
children.push(...chapter1());
children.push(pageBreak());
children.push(...chapter2());
children.push(pageBreak());
children.push(...chapter3());
children.push(pageBreak());
children.push(...chapter4());
children.push(pageBreak());
children.push(...chapter5());
children.push(pageBreak());
children.push(...chapterLantern());
children.push(pageBreak());
children.push(...chapterLudus());
children.push(pageBreak());
children.push(...chapterDoors());
children.push(pageBreak());
children.push(...chapter8());

const doc = new Document({
  sections: [{
    properties: {
      page: {
        size: { width: PAGE_W, height: PAGE_H },
        margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
      },
    },
    footers: { default: pageFooter() },
    children,
  }],
});

Packer.toBuffer(doc).then((buf) => {
  require("fs").writeFileSync(`${__dirname}/../MastersGuide.docx`, buf);
  console.log("written");
});
