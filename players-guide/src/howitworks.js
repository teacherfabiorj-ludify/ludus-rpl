// ============================================================================
// LUDIFY RPL — HOW THIS CLASS WORKS — the one-page welcome sheet
//
// The first thing a student reads, before the Player's Guide and before
// Session Zero. It answers the practical questions — when, what do I bring,
// what happens if I miss a week — and nothing about rules or setting.
//
// BILINGUAL, ON PURPOSE. Page 1 is English, page 2 is the same page in
// Portuguese. Everything in this product is written in English, but this
// particular sheet is about attendance, homework and expectations: an A1
// student has to be able to understand it on day one, and so does a parent.
// The Player's Guide already sets this precedent with its Portuguese
// Appendix A.
//
// Build:  node howitworks.js   →  ../HowThisClassWorks.docx
// ============================================================================

const {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, VerticalAlign,
} = require("docx");
const { writeFileSync } = require("fs");

const { GAME_NAME, HOUSE, BOOK_SUBTITLE, VERSION } = require("../../core/brand.js");

// ---- Palette — identical to the books and the Quick Reference --------------
const ACCENT = "2A78D6";
const GOOD = "0CA30C";
const WARN = "FAB219";
const INK = "0B0B0B";
const INK_SECONDARY = "52514E";
const MUTED = "898781";
const BRAND = "D2691E";
const BOX_BG = "F2F2F0";
const ZEBRA = "F7F7F5";
const WHITE = "FFFFFF";

const PAGE_W = 12240, PAGE_H = 15840, MARGIN = 900;
const W = PAGE_W - 2 * MARGIN;

const nb = () => ({ style: BorderStyle.NONE, size: 0, color: "FFFFFF" });

function head(text, color = ACCENT) {
  return new Paragraph({
    spacing: { before: 118, after: 55 },
    keepNext: true,
    border: { bottom: { style: BorderStyle.SINGLE, size: 10, color, space: 3 } },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, color: INK, size: 20, characterSpacing: 18 })],
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after ?? 110 },
    children: [new TextRun({
      text, color: opts.color || INK_SECONDARY,
      size: opts.size || 19, italics: !!opts.italics, bold: !!opts.bold,
    })],
  });
}

function grid(headers, rows, widths, opts = {}) {
  const h = headers && new TableRow({
    tableHeader: true,
    children: headers.map((t, i) => new TableCell({
      width: { size: widths[i], type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, color: "auto", fill: opts.headFill || ACCENT },
      margins: { top: 50, bottom: 50, left: 100, right: 100 },
      children: [new Paragraph({ children: [new TextRun({ text: t, bold: true, color: WHITE, size: 15 })] })],
    })),
  });
  const body = rows.map((r, idx) => new TableRow({
    cantSplit: true,
    children: r.map((c, i) => new TableCell({
      width: { size: widths[i], type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, color: "auto", fill: idx % 2 ? ZEBRA : WHITE },
      margins: { top: 38, bottom: 38, left: 100, right: 100 },
      verticalAlign: VerticalAlign.TOP,
      children: [new Paragraph({
        children: [new TextRun({ text: c, size: 18, bold: i === 0, color: i === 0 ? INK : INK_SECONDARY })],
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
    rows: h ? [h, ...body] : body,
  });
}

function callout(label, text, color = ACCENT) {
  return new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: [W],
    borders: {
      top: nb(), bottom: nb(), right: nb(),
      left: { style: BorderStyle.SINGLE, size: 24, color },
      insideHorizontal: nb(), insideVertical: nb(),
    },
    rows: [new TableRow({
      cantSplit: true,
      children: [new TableCell({
        width: { size: W, type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, color: "auto", fill: BOX_BG },
        margins: { top: 84, bottom: 84, left: 200, right: 180 },
        children: [
          new Paragraph({
            spacing: { after: 50 },
            children: [new TextRun({ text: label.toUpperCase(), bold: true, color, size: 16, characterSpacing: 14 })],
          }),
          new Paragraph({ children: [new TextRun({ text, color: INK, size: 19 })] }),
        ],
      })],
    })],
  });
}

// Three numbered cards across — "the three things that make this work".
function three(items) {
  const cell = (n, title, body) => new TableCell({
    width: { size: Math.floor(W / 3) - 80, type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, color: "auto", fill: ZEBRA },
    margins: { top: 78, bottom: 78, left: 130, right: 130 },
    verticalAlign: VerticalAlign.TOP,
    children: [
      new Paragraph({
        spacing: { after: 30 },
        children: [
          new TextRun({ text: n + "  ", bold: true, color: BRAND, size: 24 }),
          new TextRun({ text: title, bold: true, color: INK, size: 19 }),
        ],
      }),
      new Paragraph({ children: [new TextRun({ text: body, color: INK_SECONDARY, size: 17 })] }),
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
      top: nb(), bottom: nb(), left: nb(), right: nb(),
      insideHorizontal: nb(), insideVertical: nb(),
    },
    rows: [new TableRow({
      cantSplit: true,
      children: [
        cell("1", items[0][0], items[0][1]), gap(),
        cell("2", items[1][0], items[1][1]), gap(),
        cell("3", items[2][0], items[2][1]),
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
        new TextRun({ text: "START HERE", bold: true, color: MUTED, size: 15, characterSpacing: 20 }),
        new TextRun({ text: "   " + VERSION, color: MUTED, size: 14 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 30 },
      children: [new TextRun({ text: title, bold: true, color: INK, size: 46 })],
    }),
    new Paragraph({
      spacing: { after: 110 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: ACCENT, space: 6 } },
      children: [new TextRun({ text: subtitle, italics: true, color: INK_SECONDARY, size: 19 })],
    }),
  ];
}

// ---------------------------------------------------------------------------
// PAGE 1 — ENGLISH
// ---------------------------------------------------------------------------
function english() {
  const c = [];
  c.push(...masthead("How This Class Works",
    "Read this once, before your first session. It takes four minutes."));

  c.push(para("This is an English course. The content is Cambridge's — you study Evolve on Cambridge One, and you take the Cambridge test at the end of every unit, exactly as you would in any other class. What is different is the shape of the lesson: you and up to three other students live a story in English, and each of you plays a character inside it.", { color: INK }));
  c.push(para("You will not repeat sentences you would never say. You speak because your character needs something and nobody else is going to get it."));

  c.push(head("Two things are being measured"));
  c.push(grid(
    ["", "WHAT IT MEASURES", "WHERE YOU SEE IT"],
    [
      ["Your course", "Units finished and test scores, marked by Cambridge, from A1 to C1.", "Cambridge One"],
      ["Your character", "Growth Levels, which go up as you finish real coursework — not as you win scenes.", "Your character sheet"],
    ], [1900, W - 4300, 2400]));
  c.push(para("They are connected on purpose. Your character grows because you studied, and for no other reason.", { italics: true, size: 17 }));

  c.push(head("Your rhythm"));
  c.push(grid(
    ["WHEN", "WHAT YOU DO"],
    [
      ["Before each session", "Your Evolve unit and whatever homework was set. Finishing it before you sit down is worth a Language Point — see below."],
      ["The session itself", "A few minutes to arrive and say what happened last time, then the story, then a close. Your group's day, time and length are in Classroom, under Start Here."],
      ["After the session", "Read the recap in Classroom and answer the question at the end of it. Two or three sentences is enough."],
    ], [2300, W - 2300]));

  c.push(head("Have these open every session"));
  c.push(callout("Your kit",
    "The Zoom link (always the same one, in Start Here)  ·  your own character sheet  ·  the Quick Reference  ·  something to write names and promises on.", WARN));

  c.push(head("The three things that actually make this work", BRAND));
  c.push(three([
    ["Turn up", "The story continues from where it stopped, with the same four people. Your group needs you there more than any teacher could."],
    ["Speak badly on purpose", "Nobody at this table is waiting for a perfect sentence. A wrong sentence that moves the scene is worth more than a right one you never said."],
    ["Build on each other", "When someone invents a place or a person, it is real. Use what they made instead of starting something new."],
  ]));

  c.push(head("A few practical things"));
  c.push(grid(null, [
    ["Homework, and what you spend", "Homework finished before the session is worth one Language Point — a reroll, counted at the end of that session and spent in the next. You also get three Spotlight Tokens every week, one per scene; give one to someone quieter if you like."],
    ["If you miss a week", "The story goes on and your character stays in it. Tell the group beforehand if you can, and read the recap before the next session."],
    ["Different levels", "On purpose. A beginner comes in with one sentence, an advanced student with a paragraph, and the scene needs both."],
    ["Portuguese", "Use it when you are genuinely stuck, then say the sentence again in English. Asking for a word is part of the class, not a failure at it."],
    ["Content", "Stories here are suitable for 13 and up: tension, danger and loss, never graphic violence."],
  ], [2400, W - 2400]));

  c.push(callout("If you only remember one thing",
    "You do not need to be good at English to start. You need to be willing to say the wrong thing out loud, in front of three people doing the same.", GOOD));
  return c;
}

// ---------------------------------------------------------------------------
// PAGE 2 — PORTUGUÊS
// ---------------------------------------------------------------------------
function portugues() {
  const c = [];
  c.push(...masthead("Como Funciona a Aula",
    "Leia uma vez, antes da primeira sessão. Leva quatro minutos.", true));

  c.push(para("Isto é um curso de inglês. O conteúdo é da Cambridge — você estuda o Evolve na plataforma Cambridge One e faz a prova da Cambridge ao fim de cada unidade, igual a qualquer outro curso. O que muda é o formato da aula: você e até mais três alunos vivem uma história em inglês, e cada um tem um personagem dentro dela.", { color: INK }));
  c.push(para("Você não vai repetir frases que nunca diria na vida. Você fala porque o seu personagem precisa de algo e ninguém vai conseguir por você."));

  c.push(head("Duas coisas estão sendo medidas"));
  c.push(grid(
    ["", "O QUE MEDE", "ONDE VOCÊ VÊ"],
    [
      ["Seu curso", "Unidades concluídas e notas das provas, corrigidas pela Cambridge, do A1 ao C1.", "Cambridge One"],
      ["Seu personagem", "Os Growth Levels, que sobem conforme você conclui matéria de verdade — não conforme você ganha cenas.", "Sua ficha"],
    ], [1900, W - 4300, 2400]));
  c.push(para("Elas são ligadas de propósito. Seu personagem evolui porque você estudou, e por nenhum outro motivo.", { italics: true, size: 17 }));

  c.push(head("Seu ritmo"));
  c.push(grid(
    ["QUANDO", "O QUE VOCÊ FAZ"],
    [
      ["Antes de cada sessão", "Sua unidade do Evolve e a lição que foi passada. Terminar antes de sentar vale um Language Point — veja abaixo."],
      ["A sessão", "Alguns minutos para chegar e contar o que aconteceu da última vez, a história, e o fechamento. O dia, o horário e a duração do seu grupo estão no Classroom, no Start Here."],
      ["Depois da sessão", "Leia o resumo no Classroom e responda a pergunta que vem no fim dele. Duas ou três frases bastam."],
    ], [2300, W - 2300]));

  c.push(head("Tenha isto aberto em toda sessão"));
  c.push(callout("Seu kit",
    "O link do Zoom (sempre o mesmo, no Start Here)  ·  a sua ficha de personagem  ·  o Quick Reference  ·  algo para anotar nomes e promessas.", WARN));

  c.push(head("As três coisas que realmente fazem isto funcionar", BRAND));
  c.push(three([
    ["Aparecer", "A história continua de onde parou, com as mesmas quatro pessoas. Seu grupo precisa de você ali mais do que qualquer professor conseguiria."],
    ["Falar errado de propósito", "Ninguém nesta mesa está esperando a frase perfeita. Uma frase errada que move a cena vale mais que uma certa que você nunca disse."],
    ["Construir em cima do outro", "Quando alguém inventa um lugar ou uma pessoa, aquilo é real. Use o que o outro criou em vez de começar outra coisa."],
  ]));

  c.push(head("Algumas coisas práticas"));
  c.push(grid(null, [
    ["Lição de casa, e o que você gasta", "Lição de casa feita antes da sessão vale um Language Point — uma rerrolagem, contada no fim daquela sessão e gasta na seguinte. Você também recebe três Spotlight Tokens por semana, um por cena; passe um a quem está mais quieto se quiser."],
    ["Se você faltar", "A história segue e o seu personagem continua nela. Avise o grupo antes, se der, e leia o resumo antes da sessão seguinte."],
    ["Níveis diferentes", "De propósito. Quem começa entra com uma frase, quem já fala entra com um parágrafo, e a cena precisa das duas."],
    ["Português", "Use quando travar de verdade, e depois diga a frase de novo em inglês. Pedir uma palavra faz parte da aula, não é falha nela."],
    ["Conteúdo", "As histórias aqui são adequadas a partir dos 13 anos: tensão, perigo e perda, nunca violência gráfica."],
  ], [2400, W - 2400]));

  c.push(callout("Se for para lembrar de uma coisa só",
    "Você não precisa ser bom em inglês para começar. Você precisa estar disposto a dizer a coisa errada em voz alta, na frente de três pessoas fazendo o mesmo.", GOOD));
  return c;
}

const doc = new Document({
  creator: GAME_NAME,
  title: `${GAME_NAME} — How This Class Works`,
  description: "Welcome sheet for students, English and Portuguese.",
  styles: { default: { document: { run: { font: "Calibri" } } } },
  sections: [{
    properties: {
      page: {
        size: { width: PAGE_W, height: PAGE_H },
        margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
      },
    },
    children: [...english(), ...portugues()],
  }],
});

Packer.toBuffer(doc).then((buf) => {
  writeFileSync(__dirname + "/../HowThisClassWorks.docx", buf);
  console.log("written");
});
