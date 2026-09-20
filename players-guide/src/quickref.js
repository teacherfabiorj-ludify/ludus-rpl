// ============================================================================
// LUDIFY RPL — QUICK REFERENCE — one sheet, printed front and back
//
// The page a student keeps open next to the call. It is NOT a summary of the
// Player's Guide: it is only the things you need mid-scene, when the GM has
// just asked "what do you do?" and you have four seconds.
//
// Page 1 — AT THE TABLE:     the roll, the bands, the Focuses, the six Moves,
//                            and the English you need in order to take part.
// Page 2 — THE TALLOW COAST: the peoples, the ladders, the cities, the Six.
//
// Every rule on page 1 comes from ./system.js and every setting fact on page 2
// comes from ../../door-fantasy/src/content.js — the same files the book and
// the GM's Door Book read. This handout cannot contradict them.
//
// Build:  node quickref.js   →  ../QuickReference.docx
// ============================================================================

const {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  VerticalAlign,
} = require("docx");
const { writeFileSync } = require("fs");

const {
  moves, priceExamples, distanceLadder, focuses, outcomeBands,
  languagePoints, spotlightTokens, startingMoney,
  tableRules, lanternSizes,
} = require("../../core/system.js");
const {
  burnLadder, peopleQuickRef, humanLineages, theSix, archetypeKits,
  flames, flameSparks, flameTapers, flameQuickRef, burningRoll,
} = require("../../core/doors/tallow-coast.js");
const WORLD = require("../../core/doors/tallow-coast-world.js");

const { GAME_NAME, HOUSE, BOOK_SUBTITLE, VERSION } = require("../../core/brand.js");

// ---- Palette — identical to all three books --------------------------------
const ACCENT = "2A78D6";
const GOOD = "0CA30C";
const WARN = "FAB219";
const CRIT = "D03B3B";
const INK = "0B0B0B";
const INK_SECONDARY = "52514E";
const MUTED = "898781";
const BRAND = "D2691E";
const BOX_BG = "F2F2F0";
const ZEBRA = "F7F7F5";
const WHITE = "FFFFFF";
const KIND = { good: GOOD, warn: WARN, crit: CRIT };

// A handout is not a book: margins are tighter so everything fits on one sheet.
const PAGE_W = 12240, PAGE_H = 15840, MARGIN = 810;
const W = PAGE_W - 2 * MARGIN; // 10620

const nb = () => ({ style: BorderStyle.NONE, size: 0, color: "FFFFFF" });
const spacer = (h = 100) => new Paragraph({ spacing: { after: h }, children: [] });

function bandHead(text, color) {
  return new Paragraph({
    spacing: { before: 92, after: 44 },
    keepNext: true,
    border: { bottom: { style: BorderStyle.SINGLE, size: 10, color, space: 3 } },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, color: INK, size: 20, characterSpacing: 18 })],
  });
}

function line(text, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after ?? 70 },
    children: [new TextRun({ text, color: opts.color || INK_SECONDARY, size: opts.size || 18, italics: !!opts.italics })],
  });
}

function grid(headers, rows, widths, opts = {}) {
  const head = headers && new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      width: { size: widths[i], type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, color: "auto", fill: opts.headFill || ACCENT },
      margins: { top: 26, bottom: 26, left: 88, right: 88 },
      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: WHITE, size: 15 })] })],
    })),
  });
  const body = rows.map((r, idx) => new TableRow({
    cantSplit: true,
    children: r.map((cell, i) => new TableCell({
      width: { size: widths[i], type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, color: "auto", fill: idx % 2 ? ZEBRA : WHITE },
      margins: { top: 26, bottom: 26, left: 88, right: 88 },
      verticalAlign: VerticalAlign.TOP,
      children: [new Paragraph({
        children: [new TextRun({
          text: cell,
          size: 17,
          bold: i === 0,
          color: i === 0 ? INK : INK_SECONDARY,
        })],
      })],
    })),
  }));
  return new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: widths,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 3, color: MUTED },
      bottom: { style: BorderStyle.SINGLE, size: 3, color: MUTED },
      left: { style: BorderStyle.SINGLE, size: 3, color: MUTED },
      right: { style: BorderStyle.SINGLE, size: 3, color: MUTED },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "E1E0D9" },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "E1E0D9" },
    },
    rows: head ? [head, ...body] : body,
  });
}

// The three outcome bands, as a colour strip — the single most looked-at thing
// on the sheet, so it gets the boldest treatment.
function bandStrip() {
  return new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: [1250, W - 1250],
    borders: {
      top: nb(), bottom: nb(), left: nb(), right: nb(),
      insideHorizontal: { style: BorderStyle.SINGLE, size: 6, color: WHITE },
      insideVertical: nb(),
    },
    rows: outcomeBands.map(([num, kind, label, text]) => new TableRow({
      cantSplit: true,
      children: [
        new TableCell({
          width: { size: 1250, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, color: "auto", fill: KIND[kind] },
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 72, bottom: 72, left: 90, right: 90 },
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: num, bold: true, color: kind === "warn" ? INK : WHITE, size: 26 })],
          })],
        }),
        new TableCell({
          width: { size: W - 1250, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, color: "auto", fill: BOX_BG },
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 72, bottom: 72, left: 150, right: 120 },
          children: [new Paragraph({
            children: [
              new TextRun({ text: label + " — ", bold: true, color: INK, size: 19 }),
              new TextRun({ text, color: INK_SECONDARY, size: 19 }),
            ],
          })],
        }),
      ],
    })),
  });
}

// Four Focuses, two across.
function focusCards() {
  const cell = (f) => new TableCell({
    width: { size: W / 2 - 60, type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, color: "auto", fill: ZEBRA },
    margins: { top: 64, bottom: 64, left: 130, right: 130 },
    children: [
      new Paragraph({
        spacing: { after: 30 },
        children: [
          new TextRun({ text: f[0] + "   ", bold: true, color: INK, size: 22 }),
          new TextRun({ text: f[1].toUpperCase(), bold: true, color: ACCENT, size: 12, characterSpacing: 6 }),
        ],
      }),
      new Paragraph({ children: [new TextRun({ text: f[2], color: INK_SECONDARY, size: 17 })] }),
    ],
  });
  const gap = () => new TableCell({
    width: { size: 120, type: WidthType.DXA },
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    children: [new Paragraph({ children: [] })],
  });
  return new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: [W / 2 - 60, 120, W / 2 - 60],
    borders: {
      top: nb(), bottom: nb(), left: nb(), right: nb(),
      insideHorizontal: { style: BorderStyle.SINGLE, size: 6, color: WHITE },
      insideVertical: nb(),
    },
    rows: [
      new TableRow({ cantSplit: true, children: [cell(focuses[0]), gap(), cell(focuses[1])] }),
      new TableRow({ cantSplit: true, children: [cell(focuses[2]), gap(), cell(focuses[3])] }),
    ],
  });
}

// The block that makes this a LANGUAGE handout rather than an RPG one.
const PHRASES = [
  ["When you do not have the word", [
    "How do you say ___ in English?",
    "What does ___ mean?",
    "I don't know the word — it's like a ___.",
  ]],
  ["When it is your turn", [
    "My character is going to ___.",
    "I want to try something — is that allowed?",
    "Hold on, I need a second to think.",
  ]],
  ["When you need to know more", [
    "Wait — can I ask about the scene?",
    "What exactly did he say?",
    "Is there anyone else in the room?",
  ]],
];

function phraseBlock() {
  const cell = (title, items) => new TableCell({
    width: { size: Math.floor(W / 3) - 80, type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, color: "auto", fill: WHITE },
    margins: { top: 50, bottom: 50, left: 110, right: 110 },
    verticalAlign: VerticalAlign.TOP,
    children: [
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: title.toUpperCase(), bold: true, color: BRAND, size: 13, characterSpacing: 8 })],
      }),
      ...items.map((t, i) => new Paragraph({
        spacing: { after: i === items.length - 1 ? 0 : 70 },
        children: [new TextRun({ text: "“" + t + "”", color: INK, size: 17, italics: true })],
      })),
    ],
  });
  const gap = () => new TableCell({
    width: { size: 120, type: WidthType.DXA },
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    children: [new Paragraph({ children: [] })],
  });
  const c = Math.floor(W / 3) - 80;
  return new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: [c, 120, c, 120, c],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 10, color: BRAND },
      bottom: { style: BorderStyle.SINGLE, size: 10, color: BRAND },
      left: nb(), right: nb(),
      insideHorizontal: nb(), insideVertical: nb(),
    },
    rows: [new TableRow({
      cantSplit: true,
      children: [
        cell(PHRASES[0][0], PHRASES[0][1]), gap(),
        cell(PHRASES[1][0], PHRASES[1][1]), gap(),
        cell(PHRASES[2][0], PHRASES[2][1]),
      ],
    })],
  });
}

function masthead(title, subtitle, breakBefore = false) {
  return [
    new Paragraph({
      pageBreakBefore: breakBefore,
      spacing: { after: 20 },
      tabStops: [{ type: "right", position: W }],
      children: [
        new TextRun({ text: GAME_NAME.toUpperCase(), bold: true, color: BRAND, size: 17, characterSpacing: 26 }),
        new TextRun({ text: "\t" }),
        new TextRun({ text: "QUICK REFERENCE", bold: true, color: MUTED, size: 15, characterSpacing: 20 }),
        new TextRun({ text: "   " + VERSION, color: MUTED, size: 14 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 30 },
      children: [new TextRun({ text: title, bold: true, color: INK, size: 44 })],
    }),
    new Paragraph({
      spacing: { after: 130 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: ACCENT, space: 6 } },
      children: [new TextRun({ text: subtitle, italics: true, color: INK_SECONDARY, size: 19 })],
    }),
  ];
}

// ---------------------------------------------------------------------------
// PAGE 1 — AT THE TABLE
// ---------------------------------------------------------------------------
function pageOne() {
  const c = [];
  c.push(...masthead("At the Table",
    "Everything you need while a scene is running. Keep this open."));

  c.push(bandHead("The roll", ACCENT));
  c.push(line("Roll 2d6, add them together, then add the Focus the Move asks for. Compare the total:", { color: INK, after: 120 }));
  c.push(bandStrip());

  c.push(bandHead("Your four Focuses", ACCENT));
  c.push(line("You have +2, +1, +0 and −1, one in each. They never go up. Where you are good is your choice; how good you get is nobody's.", { after: 100 }));
  c.push(grid(
    ["FOCUS", "WHAT IT COVERS", "YOU ROLL IT WHEN"],
    focuses,
    [1500, 3500, W - 5000]));

  c.push(bandHead("The six Moves", ACCENT));
  c.push(grid(
    ["MOVE", "FOCUS", "YOU USE IT…"],
    moves.map((m) => [m.name, m.focus, m.trigger.replace(/^when /, "…when ")]),
    [2500, 1250, W - 3750]));
  c.push(spacer(70));
  c.push(line("Read the Scene — the four questions: What's really going on here? · What should I watch out for? · Who's really in control here? · What here isn't what it looks like?",
    { size: 16, italics: true, after: 0 }));

  c.push(bandHead("What you spend", WARN));
  c.push(grid(
    ["", "HOW IT WORKS"],
    [
      ["Spotlight Tokens",
       `${spotlightTokens.start} a session, ${spotlightTokens.maxPerScene} per scene: the scene is yours for a bigger beat. You may give one away — say in English why you want to hear from that person.`],
      ["Language Points",
       `Rerolls. Counted at the debrief — homework · Focus used · presentation — and spent the FOLLOWING session. Paid for the attempt, not for getting it right.`],
    ],
    [1900, W - 1900], { headFill: INK_SECONDARY }));

  c.push(bandHead("The five rules of the table", CRIT));
  tableRules.forEach((r, i) => c.push(line(
    r[0].toUpperCase() + " — " + r[1].split(". ")[0] + ".",
    { size: 17, after: i === tableRules.length - 1 ? 0 : 50 })));


  c.push(bandHead("Saying it in English", BRAND));
  c.push(line("Not knowing a word is part of the game, not a failure at it. Use these out loud — in character or not, it does not matter.", { after: 120 }));
  c.push(phraseBlock());

  // Os Seis saíram desta folha em 15/09/2026 para abrir espaço para "What you
  // spend". Raciocínio: as falas dos deuses são cor que se aprende uma vez e
  // ficam impressas no livro (Door Section); as regras de token e ponto são
  // consultadas toda semana. Se um dia a troca se mostrar errada, o que sai
  // no lugar é "Saying it in English" — nunca as duas ao mesmo tempo.

  return c;
}

// ---------------------------------------------------------------------------
// PAGE 2 — THE TALLOW COAST
// ---------------------------------------------------------------------------
function pageTwo() {
  const c = [];
  c.push(...masthead("The Tallow Coast",
    "Where your character lives. Everyone on this coast knows all of this.", true));

  // 20/09/2026 — a coluna do meio saiu daqui para abrir espaço para as flames.
  // O nome da característica ("The Old Sense") é cor que se aprende uma vez;
  // o que ela FAZ é o que se consulta no meio da cena. Os dois nomes continuam
  // impressos lado a lado no Player's Guide, Door Section.
  c.push(bandHead("The five peoples", ACCENT));
  c.push(line("What your people gives you is never a bonus on the dice. It is something to say.", { after: 110 }));
  c.push(grid(
    ["PEOPLE", "WHICH MEANS"],
    peopleQuickRef.map((r) => [r[0], r[2].split(". ")[0].replace(/\.$/, "") + "."]),
    [1500, W - 1500]));

  c.push(spacer(70));
  c.push(line("IF YOU ARE HUMAN, YOUR LINEAGE is one of five, chosen at creation — "
    + humanLineages.map((l) => l[0]).join(" · ")
    + " — and it is where your family came from, not what you look like. Your FLAME is separate from all of this: any people, any lineage, any colour.",
    { size: 16, italics: true, after: 0 }));

  c.push(bandHead("Your flame — what YOU can burn", WARN));
  c.push(line("You were born with one colour and it never changes. A SPARK is free, small and never rolled. Your TAPER rolls 2d6 + the Focus of your colour, once a scene — and on a miss the burn fails and the place is spent anyway.", { after: 110 }));
  c.push(grid(
    ["FLAME", "FOCUS", "YOUR SPARK", "YOUR TAPER"],
    flameQuickRef,
    [1300, 1100, W - 5400, 3000], { headFill: INK_SECONDARY }));

  c.push(bandHead("Burning — what it spends, and what the law says", WARN));
  c.push(line("A burn is paid for by the PLACE, never by the burner. What it spends is the kindling, and it comes back on its own — an hour of a room for a spark, a day of a street for a taper, a season of a district for a lantern. Nothing replaces a pyre.", { after: 110 }));
  c.push(grid(
    ["RUNG", "YOU NEED", "WHICH BUYS YOU"],
    burnLadder,
    [1300, 1900, W - 3200], { headFill: INK_SECONDARY }));
  c.push(spacer(70));
  c.push(line("It is not illegal to burn. It is illegal to burn with nobody answering for it — that is Burning Unanswered. Inside the walls the wardstone pays first, which is why a city can burn and a village cannot.", { size: 16, italics: true, after: 0 }));

  c.push(spacer(70));
  c.push(line("WHEN A PLACE RUNS OUT — SOUR: burns fail, milk turns, people tire early; back in a season. HOLLOW: years of that; back in a generation. A WOUND: ground that stopped coming back, and what stays near one goes out — the Unkindled.",
    { size: 16, italics: true, after: 0 }));

  c.push(bandHead("How far · how much", ACCENT));
  c.push(grid(
    ["DISTANCE", "MEANS", "MONEY", "BUYS"],
    distanceLadder.map((d, i) => [
      d[0], d[1].split(".")[0] + ".",
      ["a coin", "a handful", "a bag", "a chest"][i],
      [priceExamples[0][0], priceExamples[2][0], priceExamples[3][0], priceExamples[4][0]][i],
    ]),
    [1500, 3000, 1200, W - 5700]));

  c.push(bandHead("What you always carry", WARN));
  c.push(line(`Your Kit comes from your Archetype: it never runs out and is never counted. Your Pack is six slots for what you pick up — full is full, and to take something you say out loud what you are dropping. You start with ${startingMoney.amount}.`, { after: 100 }));
  // 20/09/2026 — a tabela dos quatro Kits saiu daqui. Motivo: a Character
  // Sheet de cada aluno JÁ mostra o Kit dele, puxado do Archetype por fórmula.
  // Imprimir os quatro numa folha comum era repetir, para os quatro, o que
  // cada um já tem personalizado — e o espaço foi para as flames, que são o
  // que se consulta no meio da cena. Os quatro Kits continuam impressos no
  // Player's Guide, Door Section.

  // As três cidades saíram desta folha: o aluno consulta isso uma vez, na
  // criação, e está na p. 36 do livro. O que se consulta NO MEIO da cena é o
  // que ele carrega — e essa é a vaga que o Kit ocupa agora.

  return c;
}

const doc = new Document({
  creator: GAME_NAME,
  title: `${GAME_NAME} — Quick Reference`,
  description: "One sheet, front and back, for players at the table.",
  styles: { default: { document: { run: { font: "Calibri" } } } },
  sections: [{
    properties: {
      page: {
        size: { width: PAGE_W, height: PAGE_H },
        margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
      },
    },
    children: [...pageOne(), ...pageTwo()],
  }],
});

Packer.toBuffer(doc).then((buf) => {
  writeFileSync(__dirname + "/../QuickReference.docx", buf);
  console.log("written");
});
