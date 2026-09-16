#!/usr/bin/env python3
"""
Ludify RPL — Character Sheet
Reproduz em planilha a ficha especificada no Capítulo 3 do Player's Guide,
campo por campo, na mesma numeração de 1 a 10 que está impressa no livro.

Compatível com Google Sheets, Excel e LibreOffice — sem ARRAYFORMULA.
Regenera com:  python3 build_ficha.py
"""
import os
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.utils import get_column_letter

# ---------------------------------------------------------------- paleta
INK, BRAND, SOFT = "14130F", "C25A12", "6E6A61"
YOURS   = "FFF8E1"   # amarelo — o jogador preenche
GMS     = "ECECE8"   # cinza — o GM preenche
CALC    = "F3F7FC"   # azul claro — calculado, não digitar
LINE    = "D9D7D1"
BANDBG  = "FAF9F7"

F_H1   = Font(name="Calibri", size=17, bold=True, color=INK)
F_SUB  = Font(name="Calibri", size=9.5, color=SOFT)
F_SEC  = Font(name="Calibri", size=10, bold=True, color="FFFFFF")
F_LBL  = Font(name="Calibri", size=9.5, color=SOFT)
F_IN   = Font(name="Calibri", size=11, color=INK)
F_INB  = Font(name="Calibri", size=11, bold=True, color=INK)
F_BIG  = Font(name="Calibri", size=13, bold=True, color=BRAND)
F_NOTE = Font(name="Calibri", size=8.5, italic=True, color=SOFT)
F_HEAD = Font(name="Calibri", size=8.5, bold=True, color="FFFFFF")
F_BODY = Font(name="Calibri", size=10, color=INK)
F_ACC  = Font(name="Calibri", size=10, bold=True, color=BRAND)

FILL_SEC   = PatternFill("solid", fgColor=INK)
FILL_YOURS = PatternFill("solid", fgColor=YOURS)
FILL_GMS   = PatternFill("solid", fgColor=GMS)
FILL_CALC  = PatternFill("solid", fgColor=CALC)
FILL_BAND  = PatternFill("solid", fgColor=BANDBG)

THIN = Side(style="thin", color=LINE)
BOX  = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)
L    = Alignment(vertical="center", wrap_text=True)
C    = Alignment(vertical="center", horizontal="center", wrap_text=True)
TL   = Alignment(vertical="top", wrap_text=True)

# ---------------------------------------------------------------- dados do livro
PEOPLES    = ["Human", "Wickborn", "Greenkept", "Duskborn", "Hybrid"]
ARCHETYPES = ["The Vanguard", "The Diplomat", "The Strategist", "The Scout"]
SETTINGS   = ["The Tallow Coast"]
FOCUSES    = ["Courage", "Empathy", "Wit", "Instinct"]

MOVES = [
    ("Act Under Pressure", "Instinct", "when you have to act fast, with no time to think it through."),
    ("Face Danger",        "Courage",  "when you step into harm's way, on purpose, to get something done."),
    ("Read the Scene",     "Instinct", "when you stop and look closely before acting."),
    ("Persuade or Manipulate", "Wit",  "when you work an angle — flattery, logic, a clever half-truth."),
    ("Parley",             "Empathy",  "when you make a direct request, backed by something they want."),
    ("Help or Interfere",  "Empathy",  "when you support or block another player's Move, before the dice."),
]

MOVES_FULL = [
    ("Act Under Pressure", "Instinct",
     "You do exactly what you meant to do.",
     "You do it — but pick one: you hesitate, you're off-balance, or you reveal more than you wanted to.",
     "You freeze, panic, or act on the wrong instinct. The GM decides what happens next."),
    ("Face Danger", "Courage",
     "You handle it — clean, no cost.",
     "You handle it — but pick one: you get hurt, you lose something, or you make a hard choice now.",
     "The danger wins this round. The GM makes a move against you."),
    ("Read the Scene", "Instinct",
     "Ask the GM two questions from the list. They must answer honestly.",
     "Ask one question from the list.",
     "The GM asks you a question instead — and you answer it out loud, in English."),
    ("Persuade or Manipulate", "Wit",
     "They buy it. They do what you want.",
     "They're close — but they want something from you first.",
     "They catch on. Now they trust you less."),
    ("Parley", "Empathy",
     "They give you what you asked for — or a fair trade.",
     "They'll do it, but there's a catch: a smaller ask, a delay, a condition.",
     "No deal. And they remember you tried."),
    ("Help or Interfere", "Empathy",
     "They roll with +1. Nothing bad happens to you.",
     "They roll with +1 — but now you're caught up in it too.",
     "You get in the way instead. They roll with −1."),
]

SCENE_QUESTIONS = ("What's really going on here? · What should I watch out for? · "
                   "Who's really in control here? · What here isn't what it looks like?")

GROWTH = [
    ("Level 1", "the day you sit down", "Archetype, Focus array, Signature Move at Tier 1."),
    ("Level 2", "6 units", "A Boon."),
    ("Level 3", "12 units", "Signature Move steps up to Tier 2."),
    ("Level 4", "18 units", "A Boon."),
    ("Level 5", "24 units", "Cross-Training."),
    ("Level 6", "30 units", "A Boon."),
    ("Level 7", "36 units", "Signature Move steps up to Tier 3."),
    ("Level 8", "42 units", "A Boon."),
    ("Level 9", "48 units", "A Focus Shift."),
    ("Level 10", "54 units", "A Boon."),
    ("Level 11", "60 units", "Cross-Training."),
    ("Level 12", "66 units", "Signature Move steps up to Tier 4."),
    ("Capstone", "72 units", "A Legacy Boon — the story closes, or hands itself to someone new."),
]

MONEY = [
    ("a coin", "A hot meal, a bed for the night. A good rope, a lantern, a warm coat."),
    ("a handful", "Ten coins. A decent weapon, a week of lodging."),
    ("a bag", "Ten handfuls. A horse, a forged document, a bribe that works."),
    ("a chest", "Ten bags, and the top of the ladder. A house, a ship, a name that opens doors."),
]
DISTANCE = [
    ("Within reach", "Close enough to touch. You can hand something over, or grab it."),
    ("Nearby", "Same room, a few steps away. You can speak normally and be heard."),
    ("Far away", "Across the hall, the street, the clearing. You have to move to get there."),
    ("Out of sight", "Behind a door, around the corner, gone. You cannot act on it at all."),
]
BURN = [
    ("a spark", "Light it, warm it, find it. Anyone may, with no paper at all."),
    ("a taper", "Set a bone, lock a door properly. A plain Warrant."),
    ("a lantern", "Turn the weather, bring down a wall. A sealed Warrant, and someone answers for you."),
    ("a pyre", "Nobody is licensed for this. A pyre is what made the Hush."),
]

# ---------------------------------------------------------------- helpers
def sec(ws, row, n, title, span=6):
    ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=span)
    c = ws.cell(row=row, column=1, value=f"{n} · {title.upper()}")
    c.font, c.fill, c.alignment = F_SEC, FILL_SEC, Alignment(vertical="center", horizontal="left", indent=1)
    ws.row_dimensions[row].height = 19

def field(ws, row, label, kind="yours", span=(2, 6), note=None, value=None, bold=False):
    lc = ws.cell(row=row, column=1, value=label)
    lc.font, lc.alignment = F_LBL, Alignment(vertical="center", horizontal="right", indent=1)
    a, b = span
    if b > a:
        ws.merge_cells(start_row=row, start_column=a, end_row=row, end_column=b)
    fill = {"yours": FILL_YOURS, "gm": FILL_GMS, "calc": FILL_CALC}[kind]
    for col in range(a, b + 1):
        cc = ws.cell(row=row, column=col)
        cc.fill, cc.border = fill, BOX
    v = ws.cell(row=row, column=a, value=value)
    v.font = F_INB if bold else F_IN
    v.alignment = Alignment(vertical="center", indent=1)
    h = 20
    if note:
        # a nota vai SEMPRE na coluna 7, nunca em b+1 — senão campos curtos
        # jogam a nota no meio da ficha e ela colide com o campo seguinte.
        nc = ws.cell(row=row, column=7, value=note)
        nc.font, nc.alignment = F_NOTE, Alignment(vertical="center", wrap_text=True)
        # a nota mora numa coluna de ~38 caracteres: cresce a linha para caber
        h = max(20, 11.5 * ((len(note) - 1) // 38 + 1))
    ws.row_dimensions[row].height = h
    return v

def band(ws, row, cols, values, header=False, fills=None):
    for i, (col, val) in enumerate(zip(cols, values)):
        c = ws.cell(row=row, column=col, value=val)
        if header:
            c.font, c.fill, c.alignment = F_HEAD, FILL_SEC, C
        else:
            c.font = F_BODY
            c.alignment = TL
            if fills and fills[i]:
                c.fill = fills[i]
        c.border = BOX

# ---------------------------------------------------------------- a ficha
def build_sheet(ws, name_default=""):
    widths = [20, 15, 15, 15, 15, 15, 38]
    for i, w in enumerate(widths, start=1):
        ws.column_dimensions[get_column_letter(i)].width = w

    ws.merge_cells("A1:F1")
    ws["A1"] = "LUDIFY RPL — CHARACTER SHEET"
    ws["A1"].font = F_H1
    ws.row_dimensions[1].height = 24
    ws.merge_cells("A2:F2")
    ws["A2"] = ("Yellow fields are yours.  Grey fields are filled in by your GM.  "
                "Blue fields calculate themselves — do not type in them.")
    ws["A2"].font = F_SUB

    r = 4
    # ---- 1 WHO YOU ARE
    sec(ws, r, 1, "Who you are"); r += 1
    c_name = field(ws, r, "Character name", "yours", (2, 4), value=name_default, bold=True); r += 1
    field(ws, r, "Player", "yours", (2, 4)); r += 1
    c_setting = f"B{r}"
    field(ws, r, "Setting", "yours", (2, 4), note="From your Door Section."); r += 1
    c_people = f"B{r}"
    field(ws, r, "People", "yours", (2, 4), note="Human · Wickborn · Greenkept · Duskborn · Hybrid"); r += 1
    field(ws, r, "Lineage / Gift", "yours", (2, 6),
          note="If Human, your lineage and any bloodline. If Hybrid, your gift in one sentence — you write it."); r += 1
    c_arch = f"B{r}"
    field(ws, r, "Archetype", "yours", (2, 4), note="Chapter 5."); r += 1
    r += 1

    # ---- 2 GROWTH LEVEL
    sec(ws, r, 2, "Growth Level"); r += 1
    lvl_cell = f"B{r}"
    field(ws, r, "Growth Level", "gm", (2, 2),
          note="From your Growth Ledger. The GM keeps it, not you.", bold=True); r += 1
    field(ws, r, "Units completed", "gm", (2, 2), note="Six units is one Growth Moment."); r += 1
    r += 1

    # ---- 3 FOCUSES
    sec(ws, r, 3, "Focuses"); r += 1
    ws.cell(row=r, column=1, value="Assign").font = F_LBL
    ws.cell(row=r, column=1).alignment = Alignment(horizontal="right", indent=1, vertical="center")
    band(ws, r, [2, 3, 4, 5], FOCUSES, header=True)
    ws.cell(row=r, column=7, value="One each of +2, +1, +0 and −1.").font = F_NOTE
    r += 1
    foc_row = r
    for col, default in zip([2, 3, 4, 5], [2, 1, 0, -1]):
        cc = ws.cell(row=r, column=col, value=default)
        cc.font, cc.alignment, cc.border, cc.fill = F_BIG, C, BOX, FILL_YOURS
        cc.number_format = '+0;−0;+0'
    ws.cell(row=r, column=7,
            value=f'=IF(SUM(B{foc_row}:E{foc_row})=2,"ok — the four total +2",'
                  f'"⚠ the four must total +2")').font = F_NOTE
    ws.row_dimensions[r].height = 22
    r += 2

    # ---- 4 LANGUAGE FOCUS
    sec(ws, r, 4, "Language Focus"); r += 1
    field(ws, r, "Evolve unit", "gm", (2, 3), note="Level and unit — e.g. 3.9"); r += 1
    field(ws, r, "Working on now", "gm", (2, 6)); r += 1
    r += 1

    # ---- 5 SIGNATURE MOVE
    sec(ws, r, 5, "Signature Move"); r += 1
    field(ws, r, "Name", "gm", (2, 4), note="Comes with your Archetype.", bold=True); r += 1
    field(ws, r, "Tier", "gm", (2, 2), note="Tier 1 at Level 1 · Tier 2 at 3 · Tier 3 at 7 · Tier 4 at 12"); r += 1
    field(ws, r, "What it does", "gm", (2, 6)); r += 1
    ws.row_dimensions[r - 1].height = 34
    r += 1

    # ---- 6 YOUR MOVES
    sec(ws, r, 6, "Your Moves"); r += 1
    band(ws, r, [1, 2, 3, 4], ["Move", "Focus", "Your roll", "When you use it"], header=True)
    ws.merge_cells(start_row=r, start_column=4, end_row=r, end_column=6)
    r += 1
    for i, (mv, fo, trig) in enumerate(MOVES):
        ws.cell(row=r, column=1, value=mv).font = F_ACC
        ws.cell(row=r, column=1).alignment = L
        ws.cell(row=r, column=2, value=fo).font = F_BODY
        ws.cell(row=r, column=2).alignment = C
        f = ws.cell(row=r, column=3,
                    value=f'=IFERROR("2d6 "&TEXT(INDEX($B${foc_row}:$E${foc_row},'
                          f'MATCH($B{r},$B${foc_row-1}:$E${foc_row-1},0)),"+0;−0;+0"),"")')
        f.font, f.alignment, f.fill = F_INB, C, FILL_CALC
        ws.merge_cells(start_row=r, start_column=4, end_row=r, end_column=6)
        t = ws.cell(row=r, column=4, value=trig)
        t.font, t.alignment = F_BODY, TL
        for col in range(1, 7):
            ws.cell(row=r, column=col).border = BOX
            if i % 2 == 0 and col != 3:
                ws.cell(row=r, column=col).fill = FILL_BAND
        ws.row_dimensions[r].height = 26
        r += 1
    ws.cell(row=r, column=1, value="Read the Scene questions: " + SCENE_QUESTIONS).font = F_NOTE
    ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=6)
    r += 2

    # ---- 7 THIS SESSION
    sec(ws, r, 7, "This session"); r += 1
    ws.cell(row=r, column=1, value="Spotlight Tokens").font = F_LBL
    ws.cell(row=r, column=1).alignment = Alignment(horizontal="right", indent=1, vertical="center")
    for col in (2, 3, 4):
        cc = ws.cell(row=r, column=col, value="")
        cc.fill, cc.border, cc.alignment, cc.font = FILL_YOURS, BOX, C, F_BIG
    ws.cell(row=r, column=7, value="Three every session. They never carry over.").font = F_NOTE
    tok_row = r
    r += 1
    field(ws, r, "Language Points", "yours", (2, 2),
          note="Spend one to reroll a die."); r += 1
    hw_row = r
    field(ws, r, "Homework Bonus", "yours", (2, 2),
          note="+1 to one roll, once, if you did your coursework."); r += 1
    r += 1

    # ---- 8 KIT AND PACK
    sec(ws, r, 8, "Kit and Pack"); r += 1
    ws.cell(row=r, column=1, value="Kit").font = F_LBL
    ws.cell(row=r, column=1).alignment = Alignment(horizontal="right", indent=1, vertical="top")
    ws.merge_cells(start_row=r, start_column=2, end_row=r + 1, end_column=6)
    for rr in (r, r + 1):
        for col in range(2, 7):
            ws.cell(row=rr, column=col).fill = FILL_GMS
            ws.cell(row=rr, column=col).border = BOX
    ws.cell(row=r, column=2).alignment = TL
    ws.cell(row=r, column=7, value="Four or five things you always have. Never tracked, never counted.").font = F_NOTE
    r += 2
    ws.cell(row=r, column=1, value="Pack — 6 slots").font = F_LBL
    ws.cell(row=r, column=1).alignment = Alignment(horizontal="right", indent=1, vertical="center")
    ws.cell(row=r, column=7, value="One thing per slot, any size. Full means you drop something, out loud, in English.").font = F_NOTE
    r += 1
    for i in range(3):
        for col in (2, 4):
            ws.merge_cells(start_row=r, start_column=col, end_row=r, end_column=col + 1)
            for cc2 in range(col, col + 2):
                ws.cell(row=r, column=cc2).fill = FILL_YOURS
                ws.cell(row=r, column=cc2).border = BOX
            ws.cell(row=r, column=col).alignment = Alignment(vertical="center", indent=1)
            ws.cell(row=r, column=col).font = F_IN
        ws.row_dimensions[r].height = 19
        r += 1
    r += 1

    # ---- 9 BOONS
    sec(ws, r, 9, "Boons"); r += 1
    ws.cell(row=r, column=7, value="Your GM writes these. Never a number on a roll.").font = F_NOTE
    for i in range(4):
        ws.cell(row=r, column=1, value=f"Boon {i+1}").font = F_LBL
        ws.cell(row=r, column=1).alignment = Alignment(horizontal="right", indent=1, vertical="center")
        ws.merge_cells(start_row=r, start_column=2, end_row=r, end_column=6)
        for col in range(2, 7):
            ws.cell(row=r, column=col).fill = FILL_GMS
            ws.cell(row=r, column=col).border = BOX
        ws.cell(row=r, column=2).alignment = Alignment(vertical="center", indent=1)
        ws.row_dimensions[r].height = 19
        r += 1
    r += 1

    # ---- 10 MONEY AND DISTANCE
    sec(ws, r, 10, "Money and distance"); r += 1
    band(ws, r, [1, 2, 3, 4], ["", "coins", "handfuls", "bags"], header=True)
    ws.cell(row=r, column=5, value="chests").font = F_HEAD
    ws.cell(row=r, column=5).fill = FILL_SEC
    ws.cell(row=r, column=5).alignment = C
    ws.cell(row=r, column=5).border = BOX
    ws.cell(row=r, column=1, value="What you carry").font = F_HEAD
    r += 1
    for col in (2, 3, 4, 5):
        cc = ws.cell(row=r, column=col)
        cc.fill, cc.border, cc.alignment, cc.font = FILL_YOURS, BOX, C, F_INB
    ws.cell(row=r, column=7, value="Ten coins to a handful, ten handfuls to a bag, ten bags to a chest.").font = F_NOTE
    ws.row_dimensions[r].height = 20
    r += 2
    ws.cell(row=r, column=1, value="The four distances — these never change").font = F_ACC
    r += 1
    for lab, desc in DISTANCE:
        ws.cell(row=r, column=1, value=lab).font = F_BODY
        ws.cell(row=r, column=1).alignment = Alignment(horizontal="right", indent=1, vertical="center")
        ws.merge_cells(start_row=r, start_column=2, end_row=r, end_column=6)
        ws.cell(row=r, column=2, value=desc).font = F_BODY
        ws.cell(row=r, column=2).alignment = TL
        r += 1

    # ---- validações
    dv_p = DataValidation(type="list", formula1='"' + ",".join(PEOPLES) + '"', allow_blank=True)
    dv_a = DataValidation(type="list", formula1='"' + ",".join(ARCHETYPES) + '"', allow_blank=True)
    dv_s = DataValidation(type="list", formula1='"' + ",".join(SETTINGS) + '"', allow_blank=True)
    dv_t = DataValidation(type="list", formula1='"●,○"', allow_blank=True)
    dv_h = DataValidation(type="list", formula1='"yes,no"', allow_blank=True)
    for dv in (dv_p, dv_a, dv_s, dv_t, dv_h):
        ws.add_data_validation(dv)
    dv_p.add(c_people); dv_a.add(c_arch); dv_s.add(c_setting)
    dv_t.add(f"B{tok_row}:D{tok_row}")
    dv_h.add(f"B{hw_row}")

    ws.freeze_panes = "A4"
    ws.sheet_view.showGridLines = False


# ---------------------------------------------------------------- reference
def build_reference(ws):
    for col, w in zip("ABCDE", [22, 13, 34, 34, 34]):
        ws.column_dimensions[col].width = w
    ws.sheet_view.showGridLines = False
    ws["A1"] = "REFERENCE — the parts that never change"
    ws["A1"].font = F_H1
    ws["A2"] = "Straight from the Player's Guide. Nothing here is filled in; it is here so nobody has to look it up mid-scene."
    ws["A2"].font = F_SUB
    r = 4

    ws.cell(row=r, column=1, value="THE SIX MOVES").font = F_ACC; r += 1
    band(ws, r, [1, 2, 3, 4, 5], ["Move", "Focus", "10+ Strong Hit", "7–9 Mixed Result", "6− Miss"], header=True)
    r += 1
    for i, (mv, fo, s, m, ms) in enumerate(MOVES_FULL):
        band(ws, r, [1, 2, 3, 4, 5], [mv, fo, s, m, ms],
             fills=[FILL_BAND if i % 2 == 0 else None] * 5)
        ws.cell(row=r, column=1).font = F_ACC
        ws.cell(row=r, column=2).alignment = C
        ws.row_dimensions[r].height = 34
        r += 1
    ws.cell(row=r, column=1, value="Read the Scene questions: " + SCENE_QUESTIONS).font = F_NOTE
    ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=5)
    r += 2

    def block(title, rows, headers):
        nonlocal r
        ws.cell(row=r, column=1, value=title).font = F_ACC; r += 1
        band(ws, r, [1, 2], headers, header=True)
        ws.merge_cells(start_row=r, start_column=2, end_row=r, end_column=5)
        r += 1
        for i, row_ in enumerate(rows):
            ws.cell(row=r, column=1, value=row_[0]).font = F_BODY
            ws.cell(row=r, column=1).alignment = L
            ws.cell(row=r, column=1).border = BOX
            ws.merge_cells(start_row=r, start_column=2, end_row=r, end_column=5)
            ws.cell(row=r, column=2, value=row_[1]).font = F_BODY
            ws.cell(row=r, column=2).alignment = TL
            for col in range(1, 6):
                ws.cell(row=r, column=col).border = BOX
                if i % 2 == 0:
                    ws.cell(row=r, column=col).fill = FILL_BAND
            ws.row_dimensions[r].height = 20
            r += 1
        r += 1

    block("MONEY — four rungs, base ten", MONEY, ["Rung", "What it buys"])
    block("DISTANCE — four rungs, and no metres anywhere", DISTANCE, ["Rung", "What it means"])
    block("BURNING — the Tallow Coast only", BURN, ["Rung", "What it covers"])

    ws.cell(row=r, column=1, value="THE GROWTH TRACK").font = F_ACC; r += 1
    band(ws, r, [1, 2, 3], ["Level", "Units", "What you gain"], header=True)
    ws.merge_cells(start_row=r, start_column=3, end_row=r, end_column=5)
    r += 1
    for i, (lv, un, gain) in enumerate(GROWTH):
        ws.cell(row=r, column=1, value=lv).font = F_ACC
        ws.cell(row=r, column=2, value=un).font = F_BODY
        ws.cell(row=r, column=2).alignment = C
        ws.merge_cells(start_row=r, start_column=3, end_row=r, end_column=5)
        ws.cell(row=r, column=3, value=gain).font = F_BODY
        ws.cell(row=r, column=3).alignment = TL
        for col in range(1, 6):
            ws.cell(row=r, column=col).border = BOX
            if i % 2 == 0:
                ws.cell(row=r, column=col).fill = FILL_BAND
        r += 1
    r += 1
    ws.cell(row=r, column=1,
            value="Growth Level never touches the dice. 2d6 at Level 12 is 2d6 at Level 1 — "
                  "what changes is what your character can plausibly do, never what the numbers say.").font = F_NOTE
    ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=5)


# ---------------------------------------------------------------- leia-me
def build_readme(ws):
    ws.column_dimensions["A"].width = 3
    ws.column_dimensions["B"].width = 100
    ws.sheet_view.showGridLines = False
    r = 2
    ws.cell(row=r, column=2, value="Ficha de personagem — Ludify RPL").font = F_H1; r += 1
    ws.cell(row=r, column=2, value="Reproduzida a partir do Capítulo 3 do Player's Guide · v2.0 · 11/09/2026").font = F_SUB
    r += 2
    TXT = [
        ("P", "O QUE É ISTO"),
        ("t", "A ficha do Capítulo 3 do Player's Guide, campo por campo, na mesma numeração de 1 a 10 que está impressa no livro. O aluno lê \"3 — Focuses\" no livro e encontra \"3 · FOCUSES\" aqui, na mesma ordem."),
        ("t", "Inclui os dois campos novos que vieram com os povos da Tallow Coast: People e Lineage / Gift."),
        ("", ""),
        ("P", "AS TRÊS CORES"),
        ("t", "Amarelo — o jogador preenche.  Cinza — o GM preenche.  Azul — calcula sozinho, ninguém digita."),
        ("t", "É a mesma convenção da figura impressa no livro, para o aluno reconhecer sem explicação."),
        ("", ""),
        ("P", "COMO USAR"),
        ("t", "1. Suba este arquivo no seu Drive e abra com Planilhas Google. Depois use Arquivo → Salvar como Planilhas Google: o Classroom só oferece \"fazer uma cópia para cada aluno\" em arquivos nativos do Google."),
        ("t", "2. Guarde essa versão na pasta Ludify RPL — Biblioteca com o nome \"Ficha de personagem — MODELO\". É este arquivo que toda turma, atual e futura, vai usar."),
        ("t", "3. No Classroom, poste como ATIVIDADE (não como Material) no tópico Your Character, com a opção \"fazer uma cópia para cada aluno\"."),
        ("t", "4. Pronto. Cada aluno recebe a ficha dele, com o nome no título, e você abre todas de um lugar só. Ninguém vê a ficha de ninguém e não existe aba para proteger."),
        ("t", "5. A aba REFERENCE é consulta: os seis Moves completos, as três escadas e a trilha de Growth. Ninguém preenche nada ali."),
        ("", ""),
        ("P", "O QUE O ALUNO NUNCA PREENCHE"),
        ("t", "Growth Level e unidades concluídas — vêm do Growth Ledger que o professor mantém, nunca o contrário. Language Focus, Signature Move, Kit e Boons também são do professor. Isso está desenhado assim de propósito: a ficha é temporária, o Ledger é permanente."),
        ("", ""),
        ("P", "A COLUNA 'YOUR ROLL' NO BLOCO 6"),
        ("t", "Calcula sozinha a partir dos Focuses do bloco 3. Se você mudar um Focus, os seis Moves se atualizam na hora. Usa INDEX/MATCH simples — funciona no Planilhas Google, no Excel e no LibreOffice. Não há ARRAYFORMULA em lugar nenhum deste arquivo."),
        ("", ""),
        ("P", "UMA FICHA POR ARQUIVO — POR QUE MUDOU"),
        ("t", "A versão anterior tinha as abas Player 1 a Player 4 no mesmo arquivo, para a mesa inteira. Com a cópia por aluno do Classroom isso vira problema: cada aluno receberia as fichas dos outros junto, e esconder aba no Sheets não é segurança — quem edita desesconde e quem lê extrai. Agora é uma ficha por arquivo, e quem vê tudo é o professor, pelo Painel da Turma."),
        ("", ""),
        ("P", "ONDE ISTO FICA GUARDADO"),
        ("t", "No seu Drive (pasta Biblioteca) e no GitHub, em planilhas/. O que é gerado na conversa não fica salvo em lugar nenhum permanente — só o que você baixa ou sobe para algum lugar seu."),
    ]
    for kind, text in TXT:
        c = ws.cell(row=r, column=2, value=text)
        if kind == "P":
            c.font = F_ACC
        else:
            c.font = F_BODY
            c.alignment = Alignment(vertical="top", wrap_text=True)
            ws.row_dimensions[r].height = max(15, 14.5 * (len(text) // 96 + 1))
        r += 1


# ---------------------------------------------------------------- build
wb = Workbook()
build_readme(wb.active)
wb.active.title = "LEIA-ME"

# UMA ficha por arquivo. As abas Player 1..4 existiam para o modelo antigo de
# "um arquivo para a mesa inteira". Com o Classroom fazendo uma cópia por aluno,
# elas passam a ser lixo: cada aluno receberia as fichas dos outros junto.
build_sheet(wb.create_sheet("FICHA"))
build_reference(wb.create_sheet("REFERENCE"))

wb.save(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "Ludify-RPL-Character-Sheet.xlsx"))
print("ok — Ludify-RPL-Character-Sheet.xlsx")
print("abas:", wb.sheetnames)
