// ============================================================================
// LUDIFY RPL — DOOR BOOK: THE TALLOW COAST — single-manuscript build script
//
// This file is the ONE source of truth for the whole Door Book. Every chapter
// lives here, as data + layout, in the order it appears in the book.
//
// To revise: edit this file, then run `node build.js`. It always regenerates
// the ENTIRE book from scratch into one docx. There is never a separate file
// per chapter and never a "v2"/"final" filename. Version history lives in
// GitHub commits on this one file.
//
// WHAT THIS BOOK IS NOT
// It is not a book about the Tallow Coast. The world is described in the
// students' own book (Player's Guide, Door Section). Describing it twice is how
// two books start disagreeing with each other. This book carries only what the
// students' book cannot: the secret, the schedule and the scenes.
//
// Shared reference TABLES come from ./content.js, which the
// Player's Guide imports as well. Never retype one of those tables here.
// ============================================================================

const {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, PageBreak,
  ImageRun, Header, Footer, PageNumber, VerticalAlign,
} = require("docx");
const { readFileSync, writeFileSync, existsSync } = require("fs");

// ---- Shared setting data: the ONE source of truth for the Tallow Coast ----
// The Player's Guide imports the very same file for its Door Section. These
// tables are never retyped in either build script.
const {
  coastPlaces, burnLadder, peopleQuickRef, humanLineages, lineageNote, theSix,
} = require("./content.js");

const sizeOf = (path) => {
  const buf = readFileSync(path);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
};

const GAME_NAME = "Ludify RPL";
const BOOK_NAME = "Door Book";
const DOOR_NAME = "The Tallow Coast";

// ---- Palette — IDENTICAL to the Player's Guide and the Master's Guide -------
// Do not add colours to this list. The three books are one product and a
// teacher who has read one must recognise the other two on sight.
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
const CONTENT_W = PAGE_W - 2 * MARGIN; // 10080

// ---- The three campaign markers --------------------------------------------
// These reuse the palette's existing meanings rather than inventing new ones:
//   LOCKED  is green because it is the safe road — the thing that works.
//   CHOICE  is amber because it is a decision the GM must actually make.
//   STUDENT is blue because blue is this product's structural colour, and a
//           blank left for a student is structure, not decoration.
//   NEVER   is red, and is used sparingly for the handful of things that break
//           the campaign if a teacher does them.
const MARKERS = {
  locked:  { glyph: "✓", color: GOOD,   label: "LOCKED" },
  choice:  { glyph: "◆", color: WARN,   label: "GM'S CHOICE" },
  student: { glyph: "○", color: ACCENT, label: "STUDENT SPACE" },
  never:   { glyph: "✕", color: CRIT,   label: "NEVER" },
};

// ---------------------------------------------------------------------------
// Shared layout helpers — same shapes as the other two books
// ---------------------------------------------------------------------------
function noBorder() { return { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }; }
function spacer(h = 120) { return new Paragraph({ spacing: { after: h }, children: [] }); }
function pageBreak() { return new Paragraph({ children: [new PageBreak()] }); }

function eyebrow(text, color = ACCENT) {
  return new Paragraph({
    spacing: { after: 40 },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, color, size: 20, characterSpacing: 20 })],
  });
}

function chapterTitle(text) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, bold: true, color: INK, size: 64 })],
  });
}

function sectionHeading(text) {
  return new Paragraph({
    spacing: { before: 280, after: 100 },
    keepNext: true,
    children: [new TextRun({ text, bold: true, color: INK, size: 26 })],
  });
}

function subHeading(text) {
  return new Paragraph({
    spacing: { before: 200, after: 70 },
    keepNext: true,
    children: [new TextRun({ text: text.toUpperCase(), bold: true, color: INK_SECONDARY, size: 18, characterSpacing: 14 })],
  });
}

// ---------------------------------------------------------------------------
// TERMS — picked out of running prose so a teacher can tell a defined thing
// from an ordinary word without guessing. System nouns inherited from the other
// two books, plus the Tallow Coast's own defined objects.
// City names, person names and the Concord are deliberately NOT marked: they
// appear on almost every page and marking them would turn the book into noise.
// ---------------------------------------------------------------------------
const GAME_TERMS = [
  // inherited system nouns
  "Act Under Pressure", "Persuade or Manipulate", "Help or Interfere",
  "Read the Scene", "Face Danger", "Parley",
  "Growth Moment", "Growth Level", "Growth Ledger", "Language Focus",
  "Spotlight Token", "Signature Move", "Session Zero", "Legacy Boon",
  "Vanguard", "Diplomat", "Strategist", "Scout",
  "Courage", "Empathy", "Instinct", "Wit",
  // this Door's defined objects
  "Passing the Lantern", "The Second Look", "Second Look",
  "the Second Silence", "Second Silence", "wardstone", "Warrant", "the Hush",
  "the Codex", "Codex", "the Spoken Flame",
  "One Line", "One Place", "One Story",
  // the peoples and their characteristics
  "Wickborn", "Greenkept", "Duskborn", "Hybrid",
  "Emberkin", "Tidebound", "Roadborn", "Stonewake", "Fenfolk",
  "Kinship Everywhere", "The Old Sense", "Green Memory", "Nightsight",
  "The Animal's Gift", "Elf-touched", "Orc-blooded",
];

const MARK_RE = new RegExp(
  "(Ludify RPL)|\\b(" + GAME_TERMS
    .slice().sort((a, b) => b.length - a.length)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|") + ")(s\\b|\\b)", "g"
);

function markTerms(text, base = {}) {
  if (!text) return [new TextRun({ text: text || "", ...base })];
  const runs = [];
  let last = 0, m;
  MARK_RE.lastIndex = 0;
  while ((m = MARK_RE.exec(text)) !== null) {
    if (m.index > last) runs.push(new TextRun({ text: text.slice(last, m.index), ...base }));
    const isBrand = !!m[1];
    runs.push(new TextRun({
      text: m[0], ...base, bold: true,
      color: isBrand ? BRAND : ACCENT,
    }));
    last = m.index + m[0].length;
  }
  if (last < text.length) runs.push(new TextRun({ text: text.slice(last), ...base }));
  return runs.length ? runs : [new TextRun({ text, ...base })];
}

function bodyPara(text, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after ?? 160 },
    children: markTerms(text, { color: INK, size: 22, italics: opts.italics || false }),
  });
}

function bullet(text) {
  return new Paragraph({
    spacing: { after: 70 },
    indent: { left: 300, hanging: 180 },
    children: [
      new TextRun({ text: "•  ", color: ACCENT, bold: true, size: 22 }),
      ...markTerms(text, { color: INK, size: 21 }),
    ],
  });
}

function flavorQuote(lines) {
  const arr = Array.isArray(lines) ? lines : [lines];
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [CONTENT_W],
    borders: {
      top: noBorder(), bottom: noBorder(), right: noBorder(),
      left: { style: BorderStyle.SINGLE, size: 18, color: ACCENT },
      insideHorizontal: noBorder(), insideVertical: noBorder(),
    },
    rows: [new TableRow({
      cantSplit: true,
      children: [new TableCell({
        width: { size: CONTENT_W, type: WidthType.DXA },
        margins: { top: 40, bottom: 40, left: 240, right: 120 },
        children: arr.map((text, i) => new Paragraph({
          spacing: { after: i === arr.length - 1 ? 0 : 100 },
          children: markTerms(text, { italics: true, color: INK_SECONDARY, size: 22 }),
        })),
      })],
    })],
  });
}

// Callout colour is decided by FUNCTION, never by taste — same law as the
// other two books:
//   example  (green)  — a concrete case showing the rule in motion
//   clarify  (blue)   — why a rule works this way, or a finer point
//   warn     (amber)  — a limit, a trap, or something easy to get wrong
//   stop     (red)    — this breaks the campaign; do not do it
const BOX_KINDS = { example: GOOD, clarify: ACCENT, warn: WARN, stop: CRIT };

function calloutBox(label, text, kind = "clarify") {
  const color = BOX_KINDS[kind] || kind;
  const paras = (Array.isArray(text) ? text : [text]);
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [CONTENT_W],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 6, color },
      bottom: { style: BorderStyle.SINGLE, size: 6, color },
      left: { style: BorderStyle.SINGLE, size: 6, color },
      right: { style: BorderStyle.SINGLE, size: 6, color },
      insideHorizontal: noBorder(), insideVertical: noBorder(),
    },
    rows: [new TableRow({
      cantSplit: true,
      children: [new TableCell({
        width: { size: CONTENT_W, type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, color: "auto", fill: BOX_BG },
        margins: { top: 140, bottom: 140, left: 200, right: 200 },
        children: [
          new Paragraph({
            spacing: { after: 60 },
            children: [new TextRun({ text: label.toUpperCase(), bold: true, color, size: 18, characterSpacing: 15 })],
          }),
          ...paras.map((p, i) => new Paragraph({
            spacing: { after: i === paras.length - 1 ? 0 : 100 },
            children: markTerms(p, { size: 20, color: INK }),
          })),
        ],
      })],
    })],
  });
}

// ---------------------------------------------------------------------------
// MARKER BLOCK — the ✓ / ◆ / ○ / ✕ convention, rendered identically everywhere
// so the teacher's eye learns the shape and stops reading the label.
// ---------------------------------------------------------------------------
function markerBlock(kind, heading, body) {
  const mk = MARKERS[kind];
  const paras = Array.isArray(body) ? body : [body];
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [CONTENT_W],
    borders: {
      top: noBorder(), bottom: noBorder(), right: noBorder(),
      left: { style: BorderStyle.SINGLE, size: 24, color: mk.color },
      insideHorizontal: noBorder(), insideVertical: noBorder(),
    },
    rows: [new TableRow({
      cantSplit: true,
      children: [new TableCell({
        width: { size: CONTENT_W, type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, color: "auto", fill: ZEBRA },
        margins: { top: 120, bottom: 120, left: 220, right: 180 },
        children: [
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: mk.glyph + "  ", bold: true, color: mk.color, size: 22 }),
              new TextRun({ text: mk.label, bold: true, color: mk.color, size: 17, characterSpacing: 15 }),
              ...(heading ? [new TextRun({ text: "   " + heading, bold: true, color: INK, size: 21 })] : []),
            ],
          }),
          ...paras.map((p, i) => new Paragraph({
            spacing: { after: i === paras.length - 1 ? 0 : 90 },
            children: markTerms(p, { size: 20, color: INK }),
          })),
        ],
      })],
    })],
  });
}

// ---------------------------------------------------------------------------
// READ-ALOUD BLOCK — the only text in this book meant to be spoken verbatim.
// Given its own unmistakable shape: dark rule top and bottom, generous margin,
// serif-weight italics. A teacher scanning a page must find it in one second.
// ---------------------------------------------------------------------------
function readAloud(lines) {
  const arr = Array.isArray(lines) ? lines : [lines];
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [CONTENT_W],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 12, color: INK },
      bottom: { style: BorderStyle.SINGLE, size: 12, color: INK },
      left: noBorder(), right: noBorder(),
      insideHorizontal: noBorder(), insideVertical: noBorder(),
    },
    rows: [new TableRow({
      cantSplit: true,
      children: [new TableCell({
        width: { size: CONTENT_W, type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, color: "auto", fill: WHITE },
        margins: { top: 160, bottom: 160, left: 260, right: 260 },
        children: [
          new Paragraph({
            spacing: { after: 90 },
            children: [new TextRun({ text: "READ ALOUD", bold: true, color: INK, size: 16, characterSpacing: 18 })],
          }),
          ...arr.map((t, i) => new Paragraph({
            spacing: { after: i === arr.length - 1 ? 0 : 110 },
            children: [new TextRun({ text: t, italics: true, color: INK, size: 23 })],
          })),
        ],
      })],
    })],
  });
}

// ---------------------------------------------------------------------------
// TABLES
// ---------------------------------------------------------------------------
function dataTable(headers, rows, widths, opts = {}) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      width: { size: widths[i], type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, color: "auto", fill: opts.headFill || ACCENT },
      margins: { top: 90, bottom: 90, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: WHITE, size: 18 })] })],
    })),
  });
  const bodyRows = rows.map((r, idx) => new TableRow({
    cantSplit: true,
    children: r.map((cell, i) => new TableCell({
      width: { size: widths[i], type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, color: "auto", fill: idx % 2 ? ZEBRA : WHITE },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      verticalAlign: VerticalAlign.TOP,
      children: [new Paragraph({
        children: i === 0
          ? [new TextRun({ text: cell, size: 19, color: INK, bold: true })]
          : markTerms(cell, { size: 19, color: INK_SECONDARY }),
      })],
    })),
  }));
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
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

// ---------------------------------------------------------------------------
// FIGURE
// ---------------------------------------------------------------------------
function figure(path, opts = {}) {
  if (!existsSync(path)) return [];
  const dxaWidth = opts.width ?? CONTENT_W;
  const pxWidth = Math.round(dxaWidth / 15);
  const { width: nativeW, height: nativeH } = sizeOf(path);
  const pxHeight = Math.round(pxWidth * (nativeH / nativeW));
  const parts = [new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 160, after: opts.caption ? 40 : 160 },
    children: [new ImageRun({
      type: "png", data: readFileSync(path),
      transformation: { width: pxWidth, height: pxHeight },
    })],
  })];
  if (opts.caption) {
    parts.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: opts.caption, italics: true, size: 18, color: MUTED })],
    }));
  }
  return parts;
}

// ---------------------------------------------------------------------------
// RUNNING HEADER — the single biggest navigation gain over the other two books.
// Every page says which Part it belongs to and which chapter you are inside, so
// a teacher thumbing through a 90-page book always knows where they landed.
// ---------------------------------------------------------------------------
function runningHeader(partLabel, chapterLabel) {
  return new Header({
    children: [new Paragraph({
      spacing: { after: 200 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 6 } },
      tabStops: [{ type: "right", position: CONTENT_W }],
      children: [
        // Tracking is kept low here on purpose: at this size, wide letter
        // spacing makes Word break words in odd places ("HO W T O U SE").
        new TextRun({ text: (partLabel || "").toUpperCase(), bold: true, color: ACCENT, size: 16, characterSpacing: 8 }),
        new TextRun({ text: "\t" }),
        new TextRun({ text: (chapterLabel || "").toUpperCase(), color: MUTED, size: 16 }),
      ],
    })],
  });
}

function pageFooter() {
  return new Footer({
    children: [new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 120 },
      children: [new TextRun({ children: [PageNumber.CURRENT], bold: true, color: ACCENT, size: 20 })],
    })],
  });
}

function blankHeader() { return new Header({ children: [new Paragraph({ children: [] })] }); }

// ---------------------------------------------------------------------------
// CHAPTER OPENER — identical on every chapter. Part label, number, title, then
// one line saying what the chapter is for and one saying when you open it.
// The "WHEN YOU OPEN THIS" line is the navigation promise of the whole book.
// ---------------------------------------------------------------------------
function chapterOpener(partLabel, number, title, forWhat, whenYouOpen) {
  const out = [];
  // No eyebrow here: the running header at the top of this very page already
  // says which Part we are in, and printing it twice on the opener looked like
  // a mistake rather than a hierarchy.
  out.push(new Paragraph({
    spacing: { after: 40 },
    children: [new TextRun({ text: number, bold: true, color: ACCENT, size: 96 })],
  }));
  out.push(chapterTitle(title));
  out.push(new Paragraph({
    spacing: { after: 60 },
    children: markTerms(forWhat, { color: INK_SECONDARY, size: 24, italics: true }),
  }));
  out.push(new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [CONTENT_W],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: MUTED },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: MUTED },
      left: noBorder(), right: noBorder(),
      insideHorizontal: noBorder(), insideVertical: noBorder(),
    },
    rows: [new TableRow({
      cantSplit: true,
      children: [new TableCell({
        width: { size: CONTENT_W, type: WidthType.DXA },
        margins: { top: 100, bottom: 100, left: 0, right: 0 },
        children: [new Paragraph({
          children: [
            new TextRun({ text: "WHEN YOU OPEN THIS   ", bold: true, color: MUTED, size: 15, characterSpacing: 16 }),
            ...markTerms(whenYouOpen, { color: INK, size: 20 }),
          ],
        })],
      })],
    })],
  }));
  out.push(spacer(220));
  return out;
}

// ---------------------------------------------------------------------------
// SECTION BUILDER — one docx section per chapter, so each chapter starts on a
// new page and carries its own running header.
// ---------------------------------------------------------------------------
function section(partLabel, chapterLabel, children, opts = {}) {
  return {
    properties: { page: { size: { width: PAGE_W, height: PAGE_H }, margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN } } },
    headers: { default: opts.noHeader ? blankHeader() : runningHeader(partLabel, chapterLabel) },
    footers: { default: pageFooter() },
    children,
  };
}

// ---------------------------------------------------------------------------
// ADVENTURE BLOCK — the twelve slots, in the same order, every single time.
// ---------------------------------------------------------------------------
function advHeader(n, sessions, title) {
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [CONTENT_W],
    borders: {
      top: noBorder(), bottom: noBorder(), left: noBorder(), right: noBorder(),
      insideHorizontal: noBorder(), insideVertical: noBorder(),
    },
    rows: [new TableRow({
      cantSplit: true,
      children: [new TableCell({
        width: { size: CONTENT_W, type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, color: "auto", fill: INK },
        margins: { top: 150, bottom: 150, left: 220, right: 220 },
        children: [
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({ text: `ADVENTURE ${n}`, bold: true, color: "F0A05A", size: 17, characterSpacing: 18 }),
              new TextRun({ text: `   ·   SESSIONS ${sessions}`, color: "A9A69E", size: 17, characterSpacing: 12 }),
            ],
          }),
          new Paragraph({ children: [new TextRun({ text: title, bold: true, color: WHITE, size: 34 })] }),
        ],
      })],
    })],
  });
}

// The left rail: a narrow column of uppercase slot labels that the eye can run
// down without reading. Identical width in all five adventures.
const RAIL_L = 2200, RAIL_R = CONTENT_W - RAIL_L;

function slotRail(rows) {
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [RAIL_L, RAIL_R],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: MUTED },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: MUTED },
      left: noBorder(), right: noBorder(),
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "E1E0D9" },
      insideVertical: noBorder(),
    },
    rows: rows.map(([label, content]) => {
      const arr = Array.isArray(content) ? content : [content];
      return new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: RAIL_L, type: WidthType.DXA },
            margins: { top: 110, bottom: 110, left: 0, right: 160 },
            verticalAlign: VerticalAlign.TOP,
            children: [new Paragraph({
              children: [new TextRun({ text: label.toUpperCase(), bold: true, color: MUTED, size: 15, characterSpacing: 14 })],
            })],
          }),
          new TableCell({
            width: { size: RAIL_R, type: WidthType.DXA },
            margins: { top: 110, bottom: 110, left: 0, right: 0 },
            verticalAlign: VerticalAlign.TOP,
            children: arr.map((t, i) => new Paragraph({
              spacing: { after: i === arr.length - 1 ? 0 : 80 },
              children: markTerms(t, { size: 20, color: INK }),
            })),
          }),
        ],
      });
    }),
  });
}

// Slot 7 — the section no published adventure has. Left: what the students will
// try. Right: one line telling the teacher how to answer it.
function tryTable(rows) {
  return dataTable(
    ["THEY WILL PROBABLY TRY", "HOW YOU ANSWER"],
    rows, [4200, CONTENT_W - 4200], { headFill: INK_SECONDARY }
  );
}

// Slot 8 — the language actions, in brand orange small caps, on one line.
function actionTags(tags, note) {
  const kids = [new TextRun({ text: "LANGUAGE ACTIONS   ", bold: true, color: MUTED, size: 15, characterSpacing: 14 })];
  tags.forEach((t, i) => {
    kids.push(new TextRun({ text: (i ? "   ·   " : ""), color: MUTED, size: 20 }));
    kids.push(new TextRun({ text: t.toUpperCase(), bold: true, color: BRAND, size: 20, characterSpacing: 10 }));
  });
  const out = [new Paragraph({ spacing: { before: 200, after: note ? 60 : 200 }, children: kids })];
  if (note) out.push(new Paragraph({ spacing: { after: 200 }, children: markTerms(note, { size: 19, color: INK_SECONDARY, italics: true }) }));
  return out;
}

// Slot 11 — the constraint no tabletop module has to deal with: the class ends
// at a fixed time whether the scene is finished or not.
function timeTable(short, long) {
  return dataTable(
    ["IF YOU ARE SHORT ON TIME", "IF YOU HAVE TIME TO SPARE"],
    [[short, long]], [CONTENT_W / 2, CONTENT_W / 2], { headFill: INK_SECONDARY }
  );
}

// ---------------------------------------------------------------------------
// NPC CARD — used six times in Chapter 3 and nowhere else.
// ---------------------------------------------------------------------------
function npcCard(npc) {
  const out = [];
  out.push(new Paragraph({
    spacing: { before: 320, after: 30 },
    keepNext: true,
    children: [
      new TextRun({ text: npc.name, bold: true, color: INK, size: 32 }),
      new TextRun({ text: "   " + npc.role, color: MUTED, size: 20 }),
    ],
  }));
  out.push(new Paragraph({
    spacing: { after: 120 },
    keepNext: true,
    children: [
      new TextRun({ text: "PILLAR   ", bold: true, color: MUTED, size: 14, characterSpacing: 14 }),
      new TextRun({ text: npc.pillar, bold: true, color: BRAND, size: 18, characterSpacing: 8 }),
    ],
  }));
  out.push(bodyPara(npc.who));
  out.push(new Paragraph({
    spacing: { before: 60, after: 50 },
    children: [new TextRun({ text: "HOW THEY SPEAK", bold: true, color: MUTED, size: 14, characterSpacing: 14 })],
  }));
  out.push(flavorQuote(npc.voice));
  out.push(spacer(140));
  out.push(dataTable(
    ["IF THE TABLE…", "THEY BECOME", "AND THEN"],
    npc.states, [3100, 2500, CONTENT_W - 5600], { headFill: INK_SECONDARY }
  ));
  return out;
}

// ===========================================================================
// TITLE PAGE
// ===========================================================================
function titlePage() {
  return [
    spacer(2400),
    new Paragraph({
      spacing: { after: 60 },
      children: [new TextRun({ text: GAME_NAME.toUpperCase(), bold: true, color: BRAND, size: 26, characterSpacing: 40 })],
    }),
    new Paragraph({
      spacing: { after: 40 },
      children: [new TextRun({ text: BOOK_NAME.toUpperCase(), bold: true, color: ACCENT, size: 22, characterSpacing: 40 })],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [new TextRun({ text: DOOR_NAME, bold: true, color: INK, size: 92 })],
    }),
    new Paragraph({
      spacing: { after: 900 },
      border: { top: { style: BorderStyle.SINGLE, size: 12, color: ACCENT, space: 10 } },
      children: [new TextRun({
        text: "A four-arc campaign for the Fantasy Door — the secret, the schedule and the scenes.",
        color: INK_SECONDARY, size: 24, italics: true,
      })],
    }),
    calloutBox("For the teacher only",
      ["This book is never shown to students. Everything in it is either something they have not learned yet, or something they are meant to discover by playing.",
       "The world itself is not secret. It is described in their own book, in the Door Section at the back of the Player's Guide. Read that first — this book assumes you have."],
      "stop"),
  ];
}

// ===========================================================================
// CONTENTS — page numbers are filled in from the real PDF on the second pass.
// Build once, read the page numbers, write them into PAGES, build again.
// ===========================================================================
const PAGES = {
  ch1: 3, ch2: 7, ch3: 10, arc1: 15, a1: 17, a2: 19, a3: 21, a4: 23, a5: 25,
  appA: 27, appB: 29,
};

const CONTENTS = [
  ["PART I", "Before You Run It", null],
  ["1", "How to Use This Book", "ch1"],
  ["2", "The Secret", "ch2"],
  ["3", "The Cast in Three States", "ch3"],
  ["PART II", "The Campaign", null],
  ["4", "Arc 1 · The Right to Burn", "arc1"],
  ["", "Adventure 1 · Papers", "a1"],
  ["", "Adventure 2 · The Empty Taper", "a2"],
  ["", "Adventure 3 · The Woman Who Would Not Stop", "a3"],
  ["", "Adventure 4 · What Marrow Remembers", "a4"],
  ["", "Adventure 5 · The Harvest Fair", "a5"],
  ["APPENDICES", "", null],
  ["A", "The Session Grid", "appA"],
  ["B", "Setting Quick Reference", "appB"],
];

function contentsPage() {
  const out = [eyebrow("Contents"), chapterTitle("What is in this book"), spacer(160)];
  CONTENTS.forEach(([num, title, key]) => {
    if (key === null && !title) {
      out.push(new Paragraph({
        spacing: { before: 260, after: 60 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: INK, space: 4 } },
        children: [new TextRun({ text: num, bold: true, color: INK, size: 20, characterSpacing: 24 })],
      }));
      return;
    }
    if (key === null) {
      out.push(new Paragraph({
        spacing: { before: 260, after: 60 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: INK, space: 4 } },
        children: [
          new TextRun({ text: num + "   ", bold: true, color: ACCENT, size: 20, characterSpacing: 24 }),
          new TextRun({ text: title.toUpperCase(), bold: true, color: INK, size: 20, characterSpacing: 20 }),
        ],
      }));
      return;
    }
    const isSub = num === "";
    out.push(new Paragraph({
      spacing: { after: 70 },
      tabStops: [{ type: "right", position: CONTENT_W }],
      indent: isSub ? { left: 460 } : undefined,
      children: [
        ...(isSub ? [] : [new TextRun({ text: num.padEnd(4, " "), bold: true, color: ACCENT, size: 22 })]),
        new TextRun({ text: title, bold: !isSub, color: isSub ? INK_SECONDARY : INK, size: isSub ? 20 : 23 }),
        new TextRun({ text: "\t" }),
        new TextRun({ text: String(PAGES[key]), bold: true, color: MUTED, size: 20 }),
      ],
    }));
  });
  return out;
}

// ===========================================================================
// CHAPTER 1 — HOW TO USE THIS BOOK
// ===========================================================================
function chapter1() {
  const c = [];
  c.push(...chapterOpener("Part I · Before You Run It", "1", "How to Use This Book",
    "What is here, what is deliberately not here, and how to find either one in ten seconds.",
    "Once, before your first session. Then again the week before you start a new arc."));

  c.push(bodyPara("You are about to run a story that lasts most of a year, in a language your students are still learning, for two hours at a time. This book exists so that you never have to invent that story from nothing on a Friday night."));

  c.push(sectionHeading("What this book is, and what it refuses to be"));
  c.push(bodyPara("This is not a book about the Tallow Coast. Your students already own that book. The peoples, the gods, the three cities, the licence system and the fact that a fourth city stopped eighty years ago are all printed in the Door Section at the back of their Player's Guide, because all of it is public knowledge to anyone who lives there."));
  c.push(bodyPara("If this book described the world a second time, the two descriptions would drift apart — a correction made in one and forgotten in the other — and within a year they would contradict each other. The person who finds that contradiction is always a student."));
  c.push(markerBlock("locked", "The line, in one sentence",
    "Your students read what a person living in that world would know. You read what is secret, what has not happened yet, and what we wrote."));
  c.push(bodyPara("So this book carries three things and nothing else: the secret behind the whole campaign, the schedule of what happens and when, and the scenes themselves, written to be run."));

  c.push(sectionHeading("The three books, and which one to open"));
  c.push(dataTable(
    ["BOOK", "WHO READS IT", "WHAT YOU GO THERE FOR"],
    [
      ["Player's Guide", "Students and you", "How the dice work, character creation, the four Archetypes, and the public description of this world."],
      ["Master's Guide", "You", "How to run any Ludify RPL table: correcting without breaking a scene, the two clocks, Passing the Lantern, the Ludus. Nothing in it is specific to this Door."],
      ["This book", "You only", "The secret, the schedule and the scenes of this Door. One of these exists per Door."],
    ], [2400, 2200, CONTENT_W - 4600]));
  c.push(spacer(160));
  c.push(calloutBox("Read these first",
    "The Master's Guide teaches you to run a table. This book assumes you have already read it and does not repeat a single line of it. If you have not read it, nothing here about lantern sizes, the two clocks or correcting in scene will make sense.",
    "warn"));

  c.push(sectionHeading("The four marks"));
  c.push(bodyPara("Every page of this book is marked so you can tell, without reading, how much freedom you have in front of you. There are only four marks and they never mean anything else."));
  c.push(spacer(60));
  c.push(markerBlock("locked", "The safe road",
    "This happens, or this is true. If you want to think about nothing at all, run only the locked material and the campaign works."));
  c.push(spacer(80));
  c.push(markerBlock("choice", "Two or three ways, all of them fine",
    "A decision only you can make, usually about your particular students. Every option listed supports all four arcs — none of them is a trap."));
  c.push(spacer(80));
  c.push(markerBlock("student", "Deliberately blank",
    "A hole we left for a student to fill by Passing the Lantern. Once a student fills it, it is true, and no later chapter of this book is allowed to contradict it."));
  c.push(spacer(80));
  c.push(markerBlock("never", "This breaks the campaign",
    "Rare, and always worth the ten seconds. There are fewer than a dozen of these in the whole book."));

  c.push(sectionHeading("How to find things fast"));
  c.push(bodyPara("Three habits, built into the layout, so you can open this book with the class already on the call."));
  c.push(bullet("The top of every page tells you which Part you are in and which chapter you are inside. You never have to flip backwards to work out where you landed."));
  c.push(bullet("Every chapter opens with a line marked WHEN YOU OPEN THIS. It is the answer to “do I need this right now?” and it is always true."));
  c.push(bullet("Every adventure in Part II is laid out in the same twelve slots, in the same order, with the labels running down the left edge. After the first one, your eye finds the slot you want without reading."));
  c.push(spacer(60));
  c.push(calloutBox("The one page to print",
    "Appendix A is the whole campaign on two pages — one line per session, with what must be true at the end, which language actions the session pulls, and which slow signal to plant. If you print nothing else from this book, print that.",
    "clarify"));

  c.push(sectionHeading("The twelve slots"));
  c.push(bodyPara("Every adventure in Part II answers the same twelve questions in the same order. You do not have to read them in order — that is the point of fixing them."));
  c.push(spacer(60));
  c.push(dataTable(
    ["SLOT", "WHAT IT ANSWERS"],
    [
      ["The pitch", "In one sentence, what this adventure is."],
      ["✓ What must be true at the end", "The only thing the next adventure is allowed to assume. Never more than two lines."],
      ["Read aloud", "The opening, written out so you can say it without preparing. The first thirty seconds are the hardest part of any session."],
      ["◆ Three ways in", "Your choice of how it starts. All three lead to the same lock."],
      ["Who is in it", "Which of the six recurring people appear, and the walk-on parts."],
      ["The pressure ladder", "Three rungs of escalation, for when your table solves it faster than you expected."],
      ["What the table will probably try", "The moves your students are likely to make, and one line each on how to answer."],
      ["Language actions", "Two or three of the thirteen actions this adventure naturally pulls. Never a grammar topic."],
      ["○ The lantern moment", "The exact question to hand to a student, already sized."],
      ["The omen", "Which slow signal to plant here, and the sentence to plant it with."],
      ["Short version / long version", "How to close it in twenty-five minutes, and how to stretch it across three sessions."],
      ["Codex line", "What to write down before you leave the call."],
    ], [3000, CONTENT_W - 3000]));

  c.push(sectionHeading("If you have never run a roleplaying game"));
  c.push(bodyPara("Most language teachers have not, and it matters much less than you would think. You already do the hard part of this job every working day: you keep a conversation alive between people of unequal ability, and you decide in real time who to bring in next."));
  c.push(bodyPara("Four things are worth knowing before your first session, and none of them are about dice."));
  c.push(bullet("You are not performing. You describe a situation, you ask “what do you do?”, and then you mostly listen. A session where you spoke for forty minutes is a session where your students spoke for eighty fewer."));
  c.push(bullet("You are allowed to not know. “Let me think about that for a second” is a complete sentence, and students find it reassuring rather than weak."));
  c.push(bullet("Saying yes is almost always right. If a student proposes something that is not in this book and it is not absurd, it is now true. That is not you losing control of the story — it is the student producing three sentences of English they would not otherwise have produced."));
  c.push(bullet("Nothing in this world is a puzzle with one solution. There is no correct answer you are waiting for them to find. If you catch yourself steering, stop and ask a question instead."));
  c.push(spacer(60));
  c.push(calloutBox("The only thing that actually goes wrong",
    "New teachers do not fail at plot. They fail at silence — a student stops talking and the teacher, uncomfortable, fills the gap. Count to five before you speak. Almost every time, the student speaks first.",
    "warn"));

  c.push(sectionHeading("Your first twenty minutes with this book"));
  c.push(bodyPara("In this order, once, before you run anything. It really does take about twenty minutes, and it is enough to start."));
  c.push(dataTable(["", "DO THIS", "WHY"], [
    ["1", "Read Chapter 2.", "It is short, and every other chapter assumes you know it."],
    ["2", "Choose your antagonist and write it somewhere only you will see.", "The choice has to exist before Session Zero. It never changes afterwards."],
    ["3", "Read the six people in Chapter 3 out loud.", "You will be speaking as all of them. Saying a voice once fixes it in your ear."],
    ["4", "Print Appendix A.", "It is the whole arc on one page and it lives beside your keyboard."],
    ["5", "Read Adventure 1.", "That is your first two sessions. You do not need anything else yet."],
  ], [420, 3800, CONTENT_W - 4220]));
  return c;
}

// ===========================================================================
// CHAPTER 2 — THE SECRET
// ===========================================================================
function chapter2() {
  const c = [];
  c.push(...chapterOpener("Part I · Before You Run It", "2", "The Secret",
    "What is actually happening on this coast, who is doing it, and why they believe they are right.",
    "Once, before anything else. Then again before Arc 3, when it stops being a secret."));

  c.push(calloutBox("Do not read this aloud, quote it, or paraphrase it to a student",
    "Not in Session Zero, not as a hint, not as a joke. Two of the four arcs work because the table does not know this yet. A student who suspects the shape of the answer stops asking questions, and questions are the entire point.",
    "stop"));

  c.push(sectionHeading("The spine, in six lines"));
  c.push(bodyPara("Somebody is preparing a second Hush on purpose, and believes they are doing the right thing."));
  c.push(bodyPara("In Arc 1 they destroy the first anchor of that plan without knowing what it was, and become heroes of Ashlight for it. In Arc 2 a place on the coast falls silent for real, and they go looking for the only thing that undoes a Hush: the true name of the city that stopped. In Arc 3 they come back to a broken coast, repair what they can, learn who is behind it, and say the name. In Arc 4 they live in what is left, for as long as they want to."));
  c.push(spacer(60));
  c.push(flavorQuote("The weapon against silence is a word. In a language school, that is the whole heart of the thing."));

  c.push(sectionHeading("The plan"));
  c.push(markerBlock("locked", "The Second Silence",
    ["Cause a second Hush — deliberately, in a chosen place. To do that you must empty wardstones, the stones that measure and hold burning near the cities, and gather everything they were holding into a single point.",
     "It takes years and it is almost invisible. Where an anchor is being prepared, burning fails, birds go quiet, and people get tired faster than the work explains."]));
  c.push(bodyPara("This is the part that never changes. Whichever of the three people below you choose, the plan is the same, the anchors are in the same places, and the four arcs run identically. Only the face at the end of Arc 3 is different."));

  c.push(sectionHeading("The three signs of an anchor"));
  c.push(bodyPara("These are the only things a table can observe before Arc 3, and they are how the whole campaign is foreshadowed. Use them; do not explain them."));
  c.push(spacer(60));
  c.push(dataTable(
    ["THE SIGN", "WHAT A CHARACTER NOTICES", "WHO NOTICES IT FIRST"],
    [
      ["Burning fails", "A licensed taper does not catch. The Warrant is in order, the burner is competent, and nothing happens.", "Anyone with a Warrant. A Wickborn feels it and cannot say why."],
      ["The birds go quiet", "Not absence — quiet. The gulls are still there and they are not calling.", "Anyone who lives outdoors. Roadborn and Fenfolk mention it unprompted."],
      ["Tiredness without a reason", "A day's work costs two days. People blame the season, the food, the weather.", "Everybody, and nobody connects it to anything."],
    ], [2200, CONTENT_W - 5000, 2800]));
  c.push(spacer(160));
  c.push(calloutBox("Why a Wickborn cannot solve the campaign",
    "The Old Sense tells a Wickborn that burning happened nearby and roughly how much. It never says who, why, or what it did. Near an anchor, the sense reports something drinking — and that is all. It is the strongest source of dread in Arc 1 precisely because it produces a feeling and no information.",
    "clarify"));

  c.push(sectionHeading("Why they are not wrong"));
  c.push(bodyPara("The person doing this does not think of themselves as a villain, and if you play them as one the ending of Arc 3 collapses into a fight scene. They have watched the Concord manage a problem for eighty years without ever curing it. People still burn without licences. People still die of it. Their conclusion is that management is the disease."));
  c.push(bodyPara("When they finally speak, in Arc 3, they should be the most reasonable person in the room. Your students should be able to summarise their argument correctly — and still refuse it."));

  c.push(sectionHeading("Choose the hand"));
  c.push(bodyPara("Pick one now, before Session Zero. Write it down. Do not change it later, and do not tell anyone."));
  c.push(spacer(60));
  c.push(dataTable(
    ["◆ WHO", "WHAT THEY TELL THEMSELVES", "WHAT IT CHANGES"],
    [
      ["The Archivist-General\n(inside the Concord)", "Spent a lifetime cataloguing illegal burns and burying the people they killed. Licensing is not enough: while there is anything left to burn, somebody will burn it. “Silence is safety.”", "The sharpest option thematically. Forces Warden Alder to choose between the institution and his own conscience. Recommended for a first campaign."],
      ["The heir of the city\n(granddaughter of someone who stayed)", "Wants the coast to feel what her family felt, and then to listen. She is hunting the true name too, for her own reasons.", "The most personal option. Makes Arc 2 a race rather than a search, if you want that."],
      ["The one who came back\n(walked into the Hush and returned)", "Inside is not death. It is rest. The coast has earned it.", "The most frightening, and it leans towards the horror Door. Best with an older table."],
    ], [2600, CONTENT_W - 5600, 3000]));

  c.push(sectionHeading("What the antagonist is, arc by arc"));
  c.push(bodyPara("The commonest way to ruin this campaign is to reveal the antagonist early because the table is enjoying themselves and you want to give them something. Resist it. Until Arc 3, the antagonist is not a person — they are a set of symptoms."));
  c.push(spacer(60));
  c.push(dataTable(
    ["ARC", "WHAT THE TABLE CAN SEE", "WHAT THEY MUST NOT SEE"],
    [
      ["Arc 1", "Three failed burns, a quiet morning, an unusual tiredness. And, at the end, a disaster that does not happen.", "That any of it was done on purpose. Not a hint, not a hooded figure, not a letter signed with an initial."],
      ["Arc 2", "That the Hush can grow, and that somebody in the Concord has been altering records about it.", "Who altered them. Bureaucratic cowardice explains everything they find in this arc, and should."],
      ["Arc 3", "Everything. The person, the plan, the argument.", "Nothing. This is the reveal."],
      ["Arc 4", "The consequences of what they decided.", "—"],
    ], [1300, CONTENT_W / 2 - 200, CONTENT_W / 2 - 1100]));
  c.push(spacer(160));
  c.push(markerBlock("never", "",
    "Do not let the antagonist appear, be named, be glimpsed, or send a message before Arc 3. Thirty sessions of a threat with no face is what makes the face matter when it arrives."));

  c.push(sectionHeading("The name"));
  c.push(bodyPara("The true name of the city that stopped is not written in this book, and that is deliberate. It is the last lantern of the campaign: at the climax of Arc 3, you hand it to a student and they say it, and whatever they say is what the city was called."));
  c.push(bodyPara("If your table is shy, or the moment arrives and nobody will take it, do not force a silence at eleven-fifty on a Saturday. Turn to the last page of this book, where three names are printed for exactly that reason, and use one."));
  return c;
}

// ===========================================================================
// CHAPTER 3 — THE CAST IN THREE STATES
// ===========================================================================
const CAST = [
  {
    name: "Oren", role: "Gatekeeper of Ashlight", pillar: "Present · IDENTIFY · REGULATE",
    who: "Tired and correct, and has been on that gate for nineteen years. He is not corrupt, he is not stupid, and he is not going to be talked into anything by a clever sentence. He is the first person your students will ever speak to in this world, and the first impression of the whole setting is his: this is a place where somebody asks you who you are and writes the answer down.",
    voice: ["“Names. All of you. Spell them.”",
            "“I'm not saying no. I'm saying not through this gate, not today, not without paper.”"],
    states: [
      ["…keeps him informed and does not embarrass him", "An ally inside the guard", "He warns them before inspections and tells them which names to avoid. Never breaks a rule for them — just tells them which rule is about to be enforced."],
      ["…uses his vouching and then causes trouble", "Demoted, and bitter about it", "Loses the gate. Turns up in Arc 2 doing worse work, and remembers exactly whose fault it was."],
      ["…impresses him without ever needing him", "Promoted to captain", "Now senior enough to be useful and senior enough to have to refuse them. The most interesting of the three."],
    ],
  },
  {
    name: "Factor Bram Locke", role: "Guild agent", pillar: "Future · PLAN",
    who: "Friendly, quick, and always timing something. He is where work comes from: commissions, deadlines, advances against delivery. He likes the characters genuinely and will still sell information about them if the arithmetic is bad enough, which he will explain to you afterwards as though you had asked for the weather.",
    voice: ["“I can have you paid by Thursday. I can't have you paid by Thursday and quiet about it — pick.”",
            "“You'll be back before the fair. I've written that down, so now it's true.”"],
    states: [
      ["…delivers on time and makes him money", "The one who funds Arc 2", "Pays for the journey without being asked. Expects, and says so, to be paid back in kind at the worst possible moment."],
      ["…costs him a contract", "Sells their location", "Not out of malice — out of a deadline. He will be perfectly friendly the next time they meet."],
      ["…drags him into something political", "Ruined, and useful", "Loses the guild seat. Reappears with nothing but roads in his head, which turns out to be exactly what Arc 2 needs."],
    ],
  },
  {
    name: "Keeper Marrow", role: "The roadside shrine", pillar: "Past · NARRATE · REPORT",
    who: "Old, unhurried, and the most important person in the campaign. She keeps the stone with the names of the fourth city carved into it, and she is the one living person who knows what that city was called. She will not say it. Not out of cruelty — because a name said by someone who does not understand it does nothing at all, and she has watched people try.",
    voice: ["“I saw the smoke. What came after, I was told. I'll keep those two separate, and so should you.”",
            "“You've asked me four times now. You haven't asked me the right way once.”"],
    states: [
      ["…earns the name properly in Arc 2", "She gives it, and comes with them", "Walks to the edge herself. The strongest version of Arc 3 has her standing there when the name is finally said."],
      ["…is careless with her, or too slow", "She dies before saying it", "The name must then be rebuilt from the three witnesses. Harder, longer, and arguably better drama."],
      ["…lets the wrong person hear it", "She tells someone else", "The antagonist now has the name. Arc 3 becomes a race instead of a trial — the hardest of the three shapes, and the most exciting."],
    ],
  },
  {
    name: "Warden Alder", role: "Concord inspector", pillar: "Modals · REGULATE · SPECULATE",
    who: "Polite, inflexible, and not a villain — which your students will refuse to believe for about ten sessions. He genuinely thinks the licence is the only thing standing between this coast and another dead city, and the frightening part is that the campaign never proves him wrong. He is the antagonist of Arc 1 and one of the two best allies available in Arc 3.",
    voice: ["“You may not. I understand why you want to. You may not.”",
            "“If it were only the one village, I would agree with you. It is never only the one village.”"],
    states: [
      ["…shows him a case the rules cannot handle", "He turns, in Arc 3", "The strongest redemption available in this campaign, because it costs him everything he has organised his life around."],
      ["…humiliates him publicly", "He hardens", "Becomes the face of the crackdown. Every later scene with the Concord gets colder."],
      ["…convinces him but too late", "He knows, and chooses the institution anyway", "The bleakest and the most true. He is not lying to himself; he has simply decided the institution matters more."],
    ],
  },
  {
    name: "Envoy Calla Wren", role: "Speaks for the coast cities", pillar: "Functional · REGISTER · ARGUE",
    who: "Never says no. Says that something would be difficult, or that she is not sure the timing serves anyone, or that she would hate to see them embarrassed. Every sentence she speaks has two readings and she means both. She is the single best teaching tool in this book for anything above B1, and beginners should be given something concrete to do while she is talking.",
    voice: ["“I'd hate for you to be in the room when that's read out. That's all I'm saying.”",
            "“Of course you may ask. Asking is free.”"],
    states: [
      ["…gives her something she can trade", "Opens Bellmoor to them", "Access to everything, priced in information. She never asks for money."],
      ["…threatens or exposes her", "She deals with the antagonist", "Not from conviction — from the arithmetic of the cities she represents."],
      ["…leaves the Concord weakened in Arc 3", "She takes it over", "The Arc 4 coast is run by her. Whether that is a good ending is genuinely not obvious."],
    ],
  },
  {
    name: "Hesper Vane", role: "Burns without a licence", pillar: "Present · ARGUE · REACT",
    who: "Keeps a village of about ninety people alive on unlicensed tapers — set bones, stopped fevers, one difficult birth a year. She knows precisely what she is risking and has done the arithmetic more carefully than anyone accusing her. She is the heart of Arc 1, and she may not survive it, which is why nothing later in the campaign depends on her being there.",
    voice: ["“Report me. I'll be in the third house from the well, doing it again.”",
            "“He'd have died in the night. Tell me which paper would have stopped that.”"],
    states: [
      ["…gets her licensed", "She trains others", "By Arc 4 there are four more like her on the coast, all legal. The quietest happy ending in the book."],
      ["…hands her over, or fails to protect her", "Dead or imprisoned in Arc 1", "She becomes a martyr, and her name is what people shout at the Concord for the next thirty sessions."],
      ["…hides her successfully", "Underground and radicalised", "Still burning, now angry. In Arc 3 she wants the Concord pulled down, and she is not entirely wrong."],
    ],
  },
];

function chapter3() {
  const c = [];
  c.push(...chapterOpener("Part I · Before You Run It", "3", "The Cast in Three States",
    "Six people the table will keep meeting, and what each of them becomes depending on how they are treated.",
    "Once before you begin. Then at the end of every arc, for two minutes, to update the Codex."));

  c.push(bodyPara("Six people recur across all four arcs. Your students will remember them far better than they remember the plot, because people are what tables remember."));
  c.push(bodyPara("Each of them has three possible states. You do not choose which one happens — the table does, by what it does. At the end of each arc you look at what actually took place, decide which state each person is now in, and write one line in the Codex. That is the whole system."));
  c.push(spacer(60));
  c.push(markerBlock("locked", "The rule that makes this work",
    "A state is a consequence, never a plan. If you decide in advance that Bram Locke will betray them, you will steer towards it and your students will feel the steering. Decide afterwards, from what they did."));
  c.push(...figure(ASSET + "npc_states.png"));

  c.push(sectionHeading("How to use a card"));
  c.push(bullet("The pillar line tells you what this person is for linguistically. Bring them into a scene when the table needs that kind of talk, not when the plot needs a body."));
  c.push(bullet("The two lines under HOW THEY SPEAK are there to be read out loud. They are not sample dialogue for you to paraphrase — they are the voice, and saying them once fixes it in your ear."));
  c.push(bullet("The three states table reads left to right: what the table did, what the person becomes, and what that means later."));
  c.push(spacer(60));
  c.push(calloutBox("If none of the three fits",
    "Then pick the closest and write your own line in the Codex. These are the three we could see from here; your table will find a fourth. The Codex is the record, not this book.",
    "clarify"));

  CAST.forEach((npc, i) => {
    if (i > 0) c.push(spacer(240));
    c.push(...npcCard(npc));
  });

  c.push(sectionHeading("The two-minute end-of-arc routine"));
  c.push(bodyPara("Do this alone, after the last session of each arc, before you plan the next one. It takes two minutes and it is the only bookkeeping this campaign asks of you."));
  c.push(bullet("Six names. One line each: which state, and one detail from what actually happened."));
  c.push(bullet("Any person a student invented and named — add them to the same list. They are cast now."));
  c.push(bullet("Any promise a character made and has not kept. Those are the hooks of Arc 4 and they cost nothing to record."));
  return c;
}

// ===========================================================================
// THE ADVENTURE RENDERER
// The twelve slots are rendered here, once, in a fixed order. Every adventure
// in the book is a data object passed through this function, which is what
// guarantees that slot 7 is always in the same place on the page — the layout
// cannot drift, because there is only one layout.
// ===========================================================================
function adventure(a) {
  const c = [];
  c.push(advHeader(a.n, a.sessions, a.title));
  c.push(spacer(150));
  c.push(bodyPara(a.pitch));                                        // 1
  c.push(markerBlock("locked", "What must be true at the end", a.lock)); // 2
  c.push(spacer(140));
  c.push(readAloud(a.readAloud));                                   // 3
  c.push(spacer(160));
  c.push(subHeading("◆ Three ways in"));                            // 4
  c.push(dataTable(["THE WAY IN", "WHAT IT GIVES YOU"], a.waysIn,
    [2900, CONTENT_W - 2900], { headFill: WARN }));
  c.push(spacer(160));
  c.push(slotRail([                                                 // 5, 6
    ["Who is in it", a.whoIsInIt],
    ["The pressure ladder", a.ladder],
  ]));
  c.push(spacer(170));
  c.push(subHeading("What the table will probably try"));           // 7
  c.push(tryTable(a.willTry));
  c.push(...actionTags(a.actions, a.actionsNote));                  // 8
  c.push(markerBlock("student", a.lanternSize, a.lantern));         // 9
  c.push(spacer(150));
  // Slots 10-12 close every adventure as ONE rail. Keeping them together
  // stops the last slot being orphaned onto a page of its own, and it means
  // the teacher's eye finds the end of an adventure as a single shape.
  c.push(slotRail([
    ["The omen", a.omen],                                           // 10
    ["If time is short", a.short],                                  // 11
    ["If time to spare", a.long],
    ["Codex line", a.codex],                                        // 12
  ]));
  return c;
}

// ===========================================================================
// ARC 1 — THE RIGHT TO BURN
// ===========================================================================
const ARC1 = [
{
  n: 1, sessions: "1–2", title: "Papers",
  pitch: "The characters arrive at the gate of Ashlight without documents, and the city will not let people in on their word alone. To get a provisional Warrant, somebody who already lives there has to put their name down as answerable for whatever these strangers do next.",
  lock: ["They are inside Ashlight, they hold a provisional Warrant, and one named person is legally answerable for them.",
         "That is all. Nothing about how they got in matters to Adventure 2."],
  readAloud: [
    "The gate of Ashlight is open, and that is the problem — it has been open all morning, and the queue has not moved. At the front of it a man in a grey coat is holding a ledger against his chest like a shield, and he has just told the woman ahead of you that a letter from her brother is not a document.",
    "He looks past her at the four of you. He does not look surprised, or annoyed, or interested. He looks like a man who has had this conversation nineteen thousand times.",
    "“Names,” he says. “All of you. Spell them.”",
  ],
  waysIn: [
    ["Bram Locke vouches", "A debt from session one. He will collect in Adventure 3, loudly, at the worst moment. Best for a table you want to push into work early."],
    ["A tavern keeper vouches", "Somebody with no power and everything to lose, which makes the stakes personal instead of professional. Best for a table that likes people more than plots."],
    ["Oren vouches himself", "The hardest to earn and the most interesting. He is putting his own gate at risk, and he will say so, once, and never mention it again."],
  ],
  whoIsInIt: [
    "Oren, on the gate. He is the whole adventure — everything else is texture.",
    "Factor Bram Locke, if the table takes the first way in. He appears halfway down the queue, already knowing their names.",
    "Walk-ons: the woman with her brother's letter (she is still there at the end of the session, and your students will notice); a bored guard who wants lunch; a clerk who cares about the ledger more than the people in it.",
  ],
  ladder: [
    "1. Oren asks a second question that the first answer contradicts.",
    "2. The queue behind them starts complaining, out loud, in the middle of their negotiation.",
    "3. Oren closes the gate for the day. Not to punish them — it is simply five o'clock.",
  ],
  willTry: [
    ["Lie about who they are", "Let it work. Write down the lie. It is now a fact about their characters, and it will be checked in Adventure 4."],
    ["Offer money", "Oren is not corrupt and is not offended either. “That's not what's missing.” The attempt costs them nothing but time — and time is the pressure here."],
    ["Ask what the rules actually are", "Best possible move. He explains the Warrant system in full, in plain language, and the whole table learns the setting from a person instead of a book."],
    ["Try to go around the wall", "There is another way in and it is genuinely a bad idea. Do not block it; let them find out that being inside without papers is worse than being outside with none."],
    ["Split up — some talk, some scout", "Say yes. Cut between them every few minutes. This is the single best structure for keeping four students talking."],
    ["Ask Oren about himself", "He answers briefly and truthfully, and is visibly surprised to have been asked. This is how the table gets an ally instead of an obstacle."],
  ],
  actions: ["Identify", "Regulate", "Register & Nuance"],
  actionsNote: "A gate that asks who you are and what you are permitted to do generates the first two by itself. The third is optional and depends on your table: with a B1+ student, let Oren respond badly to a rude phrasing once, and never explain why.",
  lanternSize: "One Line — for your least confident student, first",
  lantern: ["Oren asks where they are from. Whatever the student answers is now a real place on this coast, with that name, and it is in the campaign for good.",
            "Do not ask for more than the name. If they offer more, take it. If a stronger student later describes that town, they must build on what the first student said, and cannot contradict it — that is The Second Look, and it is worth more here than anywhere else in the arc."],
  omen: ["None. Plant nothing in the first two sessions.",
         "The slow signals only work if the table has first seen the coast behaving normally. A world that is strange from session one has nothing left to become."],
  short: "Cut the wall and the alternative way in. Play the queue, the negotiation, and the vouching. Twenty-five minutes, and the lock still happens.",
  long: "Give each character a separate reason to be refused, and make them solve each other's. Three sessions, and by the end the table knows the city better than you do.",
  codex: ["The name of the town your student invented. The name of whoever vouched. Any lie that was told and believed.",
          "One line on Oren."],
},
{
  n: 2, sessions: "3–4", title: "The Empty Taper",
  pitch: "A licensed taper did not catch. Then two more on the same street. The paperwork is perfect, the burners are competent, and nothing happened — and the guild wants somebody who is not a guild member to find out why before the Concord hears about it.",
  lock: ["The table has personally seen a legal burn fail, and has been paid to find out why.",
         "Whatever they conclude, they are wrong. The real cause is the first anchor, and they must not find it."],
  readAloud: [
    "The rope-maker's yard smells of tar and cold ash. Sella Frane has laid the Warrant flat on the bench between you, weighted down with a stone at each corner, as though the wind is the thing most likely to go wrong today.",
    "“Sealed, stamped, paid,” she says. “Third one this week on this street. I did everything the way I've done it for eleven years and the taper sat there like a wet stick.”",
    "Behind her, the vat that should be warm is not warm. Somebody has thrown a blanket over it, which will not help, and everybody knows it will not help.",
  ],
  waysIn: [
    ["Forged Warrants", "The obvious explanation, and false. Chasing it produces two sessions of excellent investigation and a dead end that feels earned."],
    ["Sabotage by a rival", "There is a real rival, he is genuinely unpleasant, and he did not do it. Best if your table enjoys accusing people."],
    ["Both, tangled", "Somebody did forge Warrants, for unrelated reasons, and is now terrified of being blamed for this as well. The richest option and the most work."],
  ],
  whoIsInIt: [
    "Factor Bram Locke, who is paying, and who wants this quiet more than he wants it solved.",
    "Sella Frane, rope-maker, licensed eleven years, currently losing money every day this continues.",
    "Walk-ons: two other burners with the same story and different explanations; a Concord clerk who has been told not to write certain failures down, and who does not know why.",
  ],
  ladder: [
    "1. A fourth failure, while they are standing there.",
    "2. The street starts blaming each other, and one accusation is close enough to true to be dangerous.",
    "3. Word reaches Warden Alder, and the inspection they were trying to avoid is now scheduled."
  ],
  willTry: [
    ["Test a burn themselves", "Yes, and it fails too — if they are on that street. Fifty metres away it works perfectly. Let them find that boundary; it is the best clue in the adventure and it explains nothing."],
    ["Examine the Warrants forensically", "The Warrants are real. Confirming that is progress, and it eliminates the option they were most confident about."],
    ["Ask a Wickborn character what they feel", "This is the moment. The Old Sense reports burning nearby and a great deal of it — except nothing has burned here for three days. Give the feeling. Refuse the explanation."],
    ["Look for who benefits", "Nobody does. Every business on the street is losing. This is true and it is the reason the table will not solve it."],
    ["Report it to the Concord properly", "Entirely reasonable and mildly disastrous — it brings Alder early. If they do this, run it; it makes Adventure 3 sharper."],
    ["Ask the clerk why he was told not to write it down", "He does not know. He is frightened, and he is frightened of the wrong thing. Do not resolve this."],
  ],
  actions: ["Describe", "Quantify", "Report"],
  actionsNote: "This is the REPORT adventure of the arc, and REPORT is the action the Cambridge material barely covers — only three units in seventy-two. Every witness here says what somebody else told them. Lean on it deliberately: ask “what did she say?” rather than “what happened?” every single time.",
  lanternSize: "One Place — for a middle or strong student",
  lantern: ["Ask a student to describe the street: what is made here, what it smells like, who has been here longest. Whatever they say is the street, permanently.",
            "Then ask a second, quieter student one question about the first student's street — a shop, a person, a smell — and take that answer as true too."],
  omen: ["The first one. Use the birds.",
         "Say it once, in the middle of something else, and do not return to it: “You notice, while she's talking, that the gulls are still on the roofline. All of them. None of them are making any noise.” Then continue. Do not let anyone investigate it successfully."],
  short: "One failed burn, one test of their own, one witness. Skip the rival entirely. The lock survives.",
  long: "Give each of the three failures a different owner with a different theory, and let the table run all three to the ground. Three sessions of pure investigation, and a table that badly wants an answer going into Adventure 3.",
  codex: ["The name of the street and whatever the student made of it. Which explanation the table committed to.",
          "One line on Bram Locke."],
},
{
  n: 3, sessions: "5–6", title: "The Woman Who Would Not Stop",
  pitch: "A village two days inland is alive because Hesper Vane burns tapers for it without a licence — bones, fevers, one difficult birth a year. The Concord has scheduled an inspection. Everyone involved is right, and somebody is going to lose.",
  lock: ["The village knows the characters' names and has an opinion about them. That opinion — good, bad, or split — is fixed and returns in Arc 2.",
         "Hesper's fate is whatever the table caused. She may be dead. Nothing later depends on her."],
  readAloud: [
    "There are about ninety people in Sedge Bottom and today most of them are pretending to work. Word came up the road yesterday that an inspector is coming, and nobody has said out loud what that means, which is how you know they have all worked it out.",
    "Hesper Vane is in the third house from the well, setting a boy's arm. She does not stop when you come in. She does not look up when you explain who you are. She finishes, ties the sling, tells the boy he can go, and only then turns around.",
    "“Right,” she says. “Say it, then. I'd like to hear how you'll put it.”",
  ],
  waysIn: [
    ["Hand her over", "Legal, defensible, and the village will never forget it. This is a real option and the book does not punish it — but write down every face that watched."],
    ["Hide her", "Requires the whole village to hold one story for two days. The most fun to play and the most likely to go wrong in an interesting way."],
    ["Get her licensed", "Nearly impossible in two days and the best possible outcome. Needs Alder persuaded, or Calla Wren owed, or both."],
  ],
  whoIsInIt: [
    "Hesper Vane, who will not help them protect her and will not apologise either.",
    "Warden Alder, arriving on schedule. This is his introduction and it should be a good one — he is polite, thorough, and completely immovable.",
    "Walk-ons: the boy with the arm, and his mother, who is the one person in the village willing to say out loud what everyone thinks; an elder who wants Hesper gone because the risk to the village is real.",
  ],
  ladder: [
    "1. Alder arrives a day early.",
    "2. Someone in the village talks — not out of malice, out of fear.",
    "3. Alder finds the taper stock itself, which removes every argument about whether it is happening.",
  ],
  willTry: [
    ["Argue that the law is wrong", "Alder agrees that the outcome is bad and does not agree that the law is wrong. He has heard this argument for twenty years and has better answers than they do."],
    ["Hide the evidence", "Workable, and Alder is good at his job. Make them choose what to hide — they cannot hide all of it."],
    ["Get the village to lie", "Yes — and roll for the elder, not the villagers. He thinks the truth is safer for ninety people."],
    ["Bribe or threaten Alder", "Neither works and both are remembered. He will note it in his report, by name, which matters in Arc 3."],
    ["Find a legal loophole", "One exists. It is thin, and needs a Bellmoor signature they cannot get in two days — unless somebody owes them."],
    ["Ask Hesper what she wants", "Almost nobody does this. She wants the village to still have somebody when she is gone, which is a different problem and a better one."],
  ],
  actions: ["Argue", "React", "Suppose"],
  actionsNote: "A disagreement in which nobody is stupid is the ideal condition for ARGUE. SUPPOSE arrives by itself the moment somebody says “if we had come a week earlier”.",
  lanternSize: "One Story — for your strongest student",
  lantern: ["Ask: what did Hesper do for your character's family, or for someone your character knows? Whatever they say happened, happened.",
            "If nobody at the table has a connection, ask instead for the story of how the village got its name. That answer becomes canon and is referred back to in Arc 4."],
  omen: ["A failed burn, and this time it is Hesper's.",
         "Late in the adventure, when she is doing something that matters: “It doesn't catch. She looks at the taper, and then at her own hands, and then does it again — and it works. She doesn't mention it.” Nothing more."],
  short: "Skip the village politics. Hesper, Alder, one decision. Twenty-five minutes of pure argument and the lock holds.",
  long: "Play the two days hour by hour. Give three villagers names and let the table hold one story across all of them. Three sessions, and the best social play in the arc.",
  codex: ["The village's opinion of the characters, in one sentence. Hesper's state. Whatever a student invented about her.",
          "One line on Warden Alder — this is where he becomes a person."],
},
{
  n: 4, sessions: "7–8", title: "What Marrow Remembers",
  pitch: "The roadside shrine, the stone with the names on it, and an old woman who remembers the day the fourth city stopped. Three people tell the table what happened, and the three accounts do not fit together — and one of them is the truth.",
  lock: ["The table knows there was a fourth city, that it stopped rather than fell, and that Keeper Marrow knows what it was called and will not say.",
         "They know why she will not say: nobody has asked the right way."],
  readAloud: [
    "The shrine is a roof on four posts, a stone the height of a child, and a woman who has been sitting beside it for longer than anyone can usefully estimate.",
    "The stone has names on it. Not carved by one hand — carved over years, by many, some of them badly. There is space left at the bottom. That space is not an accident and Keeper Marrow will not explain it either.",
    "“You'll want to know about the city,” she says, before anyone has asked. “Everyone does. Sit down. I'll tell you what I saw, and then I'll tell you what I was told, and you'll keep those two apart in your head or you'll be no use to anybody.”",
  ],
  waysIn: [
    ["Three witnesses, three accounts", "Marrow, a Concord record, and a Stonewake family story. The cleanest version and the easiest to run."],
    ["The stone itself", "The names are the puzzle. One of them belongs to somebody currently alive, and nobody can explain it. Eeriest option."],
    ["A pilgrim who came to add a name", "A stranger arrives to carve, and will not say who for. Best if your table prefers people to documents."],
  ],
  whoIsInIt: [
    "Keeper Marrow, who is patient, exact, and absolutely will not be hurried.",
    "Walk-ons: a Concord surveyor updating a map on which the fourth city is labelled Site Nine; a Stonewake trader whose grandmother walked out four days before it happened and who has told the story so often it has smoothed over.",
  ],
  ladder: [
    "1. The accounts contradict on a detail the table already believed.",
    "2. The Concord surveyor asks them, politely, to stop asking.",
    "3. Marrow answers a question with a question they cannot answer, and waits.",
  ],
  willTry: [
    ["Ask her the name directly", "She says no. Not coyly — she explains, once, that a name said by someone who does not understand it does nothing, and she has watched people try it."],
    ["Ask what “the right way” means", "The most important question in the campaign. She will not define it. She will say they will know when they can ask it, which is infuriating and true."],
    ["Cross-examine the three accounts", "Excellent. Two of them are honestly wrong. The Concord record is the one that has been altered, and it should be the one that looks most reliable."],
    ["Copy or steal the record", "Let them. The altered version is more useful to the campaign in their hands than in a drawer."],
    ["Ask Marrow about herself", "She was eleven. She was not there. She has spent seventy years with people who were, and that is a different kind of knowing, which she will explain if asked kindly."],
    ["Go and look at the Hush", "Not yet. The road inland is real and the table can start down it — but this is not the arc for it, and the Hush is two more days than they have."],
  ],
  actions: ["Narrate", "Report", "Speculate"],
  actionsNote: "Three contradictory accounts of one event is the purest REPORT exercise this campaign will ever produce, and it arrives without being forced. Insist on the distinction Marrow herself makes: what I saw against what I was told. Make your students mark it in every retelling.",
  lanternSize: "One Story — and take it slowly",
  lantern: ["Ask a student: your character has heard a version of this story before — who told it to them, and what did they get wrong?",
            "This gives you a fourth account, invented by a student, which is now as canonical as the other three. In Arc 2 it will turn out to contain one true detail. Decide which one later, based on what they said."],
  omen: ["A name on the stone.",
         "If a student looks closely: one of the names carved near the bottom belongs to someone who is alive right now, and known locally. Marrow does not know who carved it. Say it once and move on. Never explain it, in any arc."],
  short: "Marrow and one contradicting account. Forty minutes and the lock still holds.",
  long: "Run all three accounts as separate scenes in separate places, and let the table build a timeline on paper. Three sessions and your students will be doing past-perfect narration without ever being told that is what it is called.",
  codex: ["The student's fourth version of the story, in full. Which account the table trusts.",
          "One line on Keeper Marrow."],
},
{
  n: 5, sessions: "9–12", title: "The Harvest Fair",
  pitch: "Ashlight's wardstones are failing, and the fair is in four days. If they go while the city is full, there will be a small Hush in the middle of a crowd. The characters have four days, no authority, and nobody who believes them yet.",
  lock: ["The disaster does not happen. Whatever route the table took, the fair ends and the city is standing.",
         "They are known in Ashlight now — by the guard, the guild and the Concord.",
         "They destroyed the first anchor of the Second Silence and have no idea that they did."],
  readAloud: [
    "Four days before the fair, Ashlight is the best it ever looks. There are trestles going up along the length of the west wall, somebody is arguing cheerfully about where the musicians will stand, and the whole city smells of frying onions and wet paint.",
    "And on the north side, past the tannery, the wardstone is cold. It should be warm. It has been warm every day of every year that anyone has been paying attention to it, and nobody is paying attention to it, because the fair is in four days.",
  ],
  waysIn: [
    ["A social victory", "They convince the council to postpone or move the fair. Hardest, cleanest, and needs everything they earned in Adventures 1 to 4."],
    ["An investigative victory", "They find and break the thing draining the stones, without ever understanding what it was. Most satisfying mechanically."],
    ["A victory with a price", "They save the city and something is lost doing it — a person, a reputation, Hesper, the Warrant itself. The strongest ending for Arc 1 and the best set-up for Arc 2."],
  ],
  whoIsInIt: [
    "Every recurring person who is still available. This is the arc finale and it should feel populated.",
    "Oren, who can get them somewhere they should not be. Bram Locke, who has money in the fair. Warden Alder, who is the only person with the authority to stop it and the last person who will believe them.",
    "Walk-ons: a council of five, of whom two are persuadable, one is hostile, and two have already spent the money.",
  ],
  ladder: [
    "1. A second wardstone goes cold.",
    "2. Somebody important dismisses them publicly, and the city takes his side.",
    "3. The fair opens early, by a day, because the weather turned good.",
  ],
  willTry: [
    ["Warn everyone loudly", "It fails, and it should — they have no evidence and no standing. Let it fail early so the rest of the adventure has somewhere to go."],
    ["Go to Alder", "He listens properly, which surprises them. He then explains what he would need in order to act, and it is exactly one piece of evidence more than they have."],
    ["Find and break the drain", "Yes. It is buried, it is not obviously artificial, and destroying it works. Never let them learn what it was."],
    ["Evacuate quietly", "Clever and partially achievable. Every family they persuade is a scene, and every scene is a negotiation."],
    ["Sabotage the fair to force a cancellation", "Genuinely effective and genuinely costly. Run it. Arc 4 will remember it."],
    ["Ask a Wickborn to lead them to it", "The Old Sense narrows it to a district, never a spot. That is the correct amount of help: it saves a session and solves nothing."],
  ],
  actions: ["Plan", "Regulate", "Argue"],
  actionsNote: "Four days and a deadline is the best PLAN scene the arc offers — future forms arrive without being asked for. Make them tell you the plan before they execute it, in order, out loud. That is the exercise.",
  lanternSize: "One Place, then One Story",
  lantern: ["Before the fair: ask each student for one thing that happens at the Harvest Fair every year. Those are now traditions of Ashlight, permanently.",
            "After it: ask the student whose character did the most to save the city what people are saying about them a week later. Let them describe their own reputation. It is the last beat of Arc 1 and it belongs to a student."],
  omen: ["The last of the arc, and the largest.",
         "In the final session, when the anchor breaks: everybody on that side of the city feels rested, suddenly and for no reason. Nobody remarks on it, because feeling well is not the sort of thing people remark on. Say it as a description of the evening, not as a clue."],
  short: "Two days instead of four, three council members instead of five, one wardstone. Two sessions and the arc still lands.",
  long: "Play all four days with a clock on the wall. Give the council five names and five reasons. Four sessions, and it is the best thing in the arc.",
  codex: ["Every tradition your students invented for the fair. Which route they took. What it cost.",
          "One line on all six people. This is the end of an arc — do the full two-minute routine."],
},
];

function chapterArc1() {
  const c = [];
  c.push(...chapterOpener("Part II · The Campaign", "4", "Arc 1 · The Right to Burn",
    "Sessions 1 to 12, all of them in and around Ashlight. Five adventures that get larger.",
    "Every week, for your first three months. This is the only arc you need in order to start."));

  c.push(sectionHeading("What this arc assumes"));
  c.push(bodyPara("Nothing. It is the first."));
  c.push(bodyPara("That is the rule every arc follows: an arc may assume at most two things from the one before it. If a later chapter needs a third, the design is wrong and we rewrite it."));

  c.push(sectionHeading("What this arc locks"));
  c.push(markerBlock("locked", "",
    ["The characters are known in Ashlight, and hold a Warrant.",
     "The first anchor of the Second Silence has been destroyed, and nobody at the table knows that it existed."]));

  c.push(sectionHeading("The shape of a two-hour session"));
  c.push(bodyPara("This is the constraint no published adventure has to deal with. A tabletop group plays until the story reaches a stopping point; your class ends on the clock, finished or not, and the next one is seven days away."));
  c.push(...figure(ASSET + "session_shape.png"));
  c.push(calloutBox("The twenty-minute rule",
    "At twenty minutes to the end, stop opening things. No new locations, no new people, no new problems. Spend the last twenty minutes closing one thread and handing a lantern. A session that ends mid-negotiation is a session your students cannot remember by next Saturday.",
    "warn"));

  c.push(sectionHeading("The five adventures"));
  c.push(dataTable(
    ["#", "SESSIONS", "TITLE", "WHAT IT IS"],
    [
      ["1", "1–2", "Papers", "The gate. Getting in, and finding somebody to answer for them."],
      ["2", "3–4", "The Empty Taper", "Three legal burns fail on one street. They are hired to find out why, and they will not."],
      ["3", "5–6", "The Woman Who Would Not Stop", "An unlicensed healer, a village that needs her, and an inspection in two days."],
      ["4", "7–8", "What Marrow Remembers", "The shrine, the stone, and three accounts of the day a city stopped."],
      ["5", "9–12", "The Harvest Fair", "The wardstones are failing and the city is about to fill up."],
    ], [500, 1200, 3000, CONTENT_W - 4700]));

  c.push(sectionHeading("The slow signals"));
  c.push(bodyPara("Seven omens are available across this arc, and the correct dose is one every two sessions at the very most. They are not clues. Nothing can be deduced from them, and a table that investigates one should find nothing, because there is nothing there yet."));
  c.push(bodyPara("Their job is to make the world feel slightly wrong for thirty sessions, so that the explanation, when it arrives in Arc 3, lands on prepared ground."));
  c.push(markerBlock("never", "",
    "Do not let an omen be solved. If your table investigates the quiet birds and rolls brilliantly, they learn that the birds are quiet. That is the whole answer, and it is better than anything you could invent on the spot."));
  c.push(...figure(ASSET + "omen_dosage.png"));
  c.push(spacer(60));
  c.push(dataTable(
    ["THE SIGNAL", "HOW TO SAY IT"],
    [
      ["A burn that does not catch", "As an inconvenience, never as a mystery. Somebody is annoyed, not frightened."],
      ["Birds gone quiet", "In the middle of another sentence. Never as its own beat."],
      ["Tiredness without a reason", "Have an NPC mention it about themselves, and blame the season."],
      ["One more name on the stone", "Only if a student looks. Belongs to someone alive. Never explained, in any arc."],
      ["People arriving from inland", "A family, then two. They say the farming was bad. They are not lying."],
      ["A man who forgot his own name", "Second-hand, as gossip, by someone who thinks it is funny."],
      ["A letter about what not to record", "Found, never delivered to them. The clerk who got it does not understand it either."],
    ], [4100, CONTENT_W - 4100]));
  return c;
}

// ===========================================================================
// APPENDIX A — THE SESSION GRID
// The page this book expects to be printed and kept beside the keyboard.
// The DATE column is left blank on purpose: this book is used by more than one
// teacher, on more than one calendar, and a printed date would be wrong for
// everybody except whoever it was printed for.
// ===========================================================================
function appendixA() {
  const c = [];
  c.push(...chapterOpener("Appendices", "A", "The Session Grid",
    "Arc 1 on one page. One line per session — the lock, the language, the signal.",
    "Every week, before the call. Print it."));

  c.push(bodyPara("Fill in the date column yourself, in pencil, at the start of the arc. Twelve sessions is roughly three months of Saturdays, and a holiday in the middle will move everything after it — which matters, because Adventure 5 is an arc finale and should not land on a week when half the table is away."));
  c.push(spacer(120));

  const grid = [
    ["1", "1 · Papers", "They are at the gate, and somebody has been found who might vouch.", "IDENTIFY · REGULATE", "—"],
    ["2", "1 · Papers", "Inside, with a provisional Warrant and one named person answerable.", "IDENTIFY · REGISTER", "—"],
    ["3", "2 · The Empty Taper", "They have seen a legal burn fail with their own eyes.", "DESCRIBE · QUANTIFY", "Birds quiet"],
    ["4", "2 · The Empty Taper", "Hired to explain it, and committed to a theory that is wrong.", "REPORT", "—"],
    ["5", "3 · The Woman Who Would Not Stop", "They have met Hesper and understood what the village stands to lose.", "ARGUE · REACT", "—"],
    ["6", "3 · The Woman Who Would Not Stop", "The inspection has happened. The village has an opinion about them.", "ARGUE · SUPPOSE", "Hesper's burn fails"],
    ["7", "4 · What Marrow Remembers", "They know a fourth city existed and that it stopped rather than fell.", "NARRATE · REPORT", "—"],
    ["8", "4 · What Marrow Remembers", "They know Marrow has the name, and why she will not give it.", "REPORT · SPECULATE", "A name on the stone"],
    ["9", "5 · The Harvest Fair", "They know the wardstones are failing and nobody believes them.", "PLAN", "—"],
    ["10", "5 · The Harvest Fair", "They have a plan, and one piece of evidence short of authority.", "PLAN · ARGUE", "Inland arrivals"],
    ["11", "5 · The Harvest Fair", "The plan is in motion and something has gone wrong with it.", "ARGUE · REGULATE", "—"],
    ["12", "5 · The Harvest Fair", "The fair ends, the city stands, the anchor is destroyed unknowingly.", "NARRATE", "Sudden rest"],
  ];

  c.push(dataTable(
    ["S.", "DATE", "ADVENTURE", "TRUE BY THE END", "ACTIONS", "SIGNAL"],
    grid.map(r => [r[0], "", r[1], r[2], r[3], r[4]]),
    [420, 900, 2100, CONTENT_W - 8020, 1900, 1600]));

  c.push(spacer(200));
  c.push(calloutBox("Arcs 2 to 4",
    "They join this grid when they are written. Arc 2 is written to this depth after your pilot table has finished Arc 1 — deliberately, because by then your students will have invented villages, people and a home town each, and Arc 2 has to be built on top of what they made rather than around it.",
    "clarify"));
  return c;
}

// ===========================================================================
// APPENDIX B — SETTING QUICK REFERENCE
// Rendered from content.js. The students have the same tables in their own
// book. Never retype them here.
// ===========================================================================
function appendixB() {
  const c = [];
  c.push(...chapterOpener("Appendices", "B", "Setting Quick Reference",
    "The public tables, so you are not opening two books at once during a session.",
    "Mid-session, when somebody asks what a Greenkept can actually do."));

  c.push(calloutBox("These are the students' tables",
    "Everything on these pages is printed in the Door Section of the Player's Guide as well, and both books render it from the same file. If something here needs to change, change it in that file and rebuild both books — never edit one book's copy.",
    "clarify"));

  c.push(sectionHeading("The coast"));
  c.push(dataTable(["PLACE", "WHAT IT IS", "WHAT IT IS LIKE"], coastPlaces,
    [1700, 2600, CONTENT_W - 4300]));

  c.push(sectionHeading("The burn ladder"));
  c.push(bodyPara("Four rungs, the same shape as the money and distance ladders in the Player's Guide. It says what is possible and what is permitted — never what is likely. It is not a dice modifier and it never grants a bonus."));
  c.push(dataTable(["RUNG", "WHAT IT NEEDS", "WHAT IT DOES"], burnLadder,
    [1700, 2400, CONTENT_W - 4100]));

  c.push(sectionHeading("The five peoples"));
  c.push(bodyPara("No inner characteristic touches the dice. Every one of them grants perception or narrative permission — which is to say, it gives the student something to say."));
  c.push(dataTable(["PEOPLE", "CHARACTERISTIC", "WHAT IT DOES"], peopleQuickRef,
    [1500, 2300, CONTENT_W - 3800]));

  c.push(sectionHeading("Human lineages"));
  c.push(dataTable(["LINEAGE", "WHERE FROM", "WHAT THEY ARE KNOWN FOR"], humanLineages,
    [1500, 2600, CONTENT_W - 4100]));
  c.push(spacer(120));
  c.push(calloutBox("Printed beside the table in the students' book", lineageNote, "warn"));

  c.push(sectionHeading("The Six"));
  c.push(bodyPara("Six gods who made the world and left. They answer no prayers, send no signs, and have never quarrelled, so nobody has ever had to choose between them. What they generate is not miracle — it is idiom, repeated at your table every single week."));
  c.push(dataTable(["GOD", "DOMAIN", "HOW PEOPLE SAY IT"], theSix,
    [1700, 2700, CONTENT_W - 4400]));

  c.push(sectionHeading("Three names, if you need them"));
  c.push(bodyPara("The true name of the city that stopped belongs to a student, at the climax of Arc 3. If the moment arrives and nobody will take it, use one of these rather than letting the silence sit."));
  c.push(spacer(60));
  c.push(markerBlock("choice", "Fallback names",
    "Anneth Fell  ·  Lowharrow  ·  Sennemark"));
  return c;
}

// ===========================================================================
// DOCUMENT
// ===========================================================================
const ASSET = __dirname + "/assets/";

function main() {
  const doc = new Document({
    creator: GAME_NAME,
    title: `${GAME_NAME} — ${BOOK_NAME}: ${DOOR_NAME}`,
    description: "Teacher-only campaign book for the Fantasy Door.",
    styles: { default: { document: { run: { font: "Calibri" } } } },
    sections: [
      section("", "", titlePage(), { noHeader: true }),
      section("", "", contentsPage(), { noHeader: true }),
      section("Part I · Before You Run It", "1 · How to Use This Book", chapter1()),
      section("Part I · Before You Run It", "2 · The Secret", chapter2()),
      section("Part I · Before You Run It", "3 · The Cast in Three States", chapter3()),
      section("Part II · The Campaign", "4 · Arc 1 · The Right to Burn", chapterArc1()),
      ...ARC1.map((a) => section("Part II · Arc 1", `Adventure ${a.n} · ${a.title}`, adventure(a))),
      section("Appendices", "A · The Session Grid", appendixA()),
      section("Appendices", "B · Setting Quick Reference", appendixB()),
    ],
  });

  Packer.toBuffer(doc).then((buf) => {
    writeFileSync(__dirname + "/../TallowCoast-DoorBook.docx", buf);
    console.log("written");
  });
}

main();
