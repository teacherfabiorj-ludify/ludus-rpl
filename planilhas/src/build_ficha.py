"""
LUDUS — Character Sheet  (ONE per student · the student edits it)

    node core/export.js
    python3 planilhas/src/build_ficha.py

Tabs, in this order:  CHARACTER SHEET · REFERENCE · READ ME

⚠ 19/09/2026 — TWO DEFECTS FIXED HERE.

1. THE SHEET WAS IN PORTUGUESE. Every field label, every hint, every tab name.
   A document a student keeps open for two hours of an English lesson, in
   Portuguese. It broke the project's own language rule and nobody had noticed.
   Everything a student can see is now English. The teacher's Painel stays in
   Portuguese — it is Fábio's private tool and never leaves his Drive.

2. THE INSTRUCTIONS TAB OPENED FIRST. A student opened their own character and
   landed on a page of assembly steps. READ ME is now the third and last tab.

The SHEET follows the ten rows of chapter 3 of the Player's Guide, in the same
order, with the same names. Whoever read the book recognises the sheet, and
whoever looks at the sheet can find the chapter.

The blue block (Growth, Language Focus, presenting?, Actions, LP, reminder) is
never typed: it comes from the Class Board, and only that student's own row
appears. Everything else belongs to the student.
"""

import os

from openpyxl import Workbook
from openpyxl.workbook.defined_name import DefinedName
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.worksheet.datavalidation import DataValidation

from _common import (ACCENT, BORDER, BRAND, FILL_CALC, FILL_NOTE, FILL_TYPE,
                     F_BODY, F_LABEL, F_SMALL, F_TITLE, INK, OUT, WRAP,
                     board_public, core, leia_me, widths)

C = core()
S = C["system"]
GAME = C["brand"]["GAME_NAME"]
HOUSE = C["brand"]["HOUSE"]
VERSION = C["brand"]["VERSION"]
KITS = C["doors"]["tallowCoast"]["archetypeKits"]
FLAMES = C["doors"]["tallowCoast"]["flames"]
FLAME_SPARKS = C["doors"]["tallowCoast"]["flameSparks"]
FLAME_TAPERS = C["doors"]["tallowCoast"]["flameTapers"]
BURNING = C["doors"]["tallowCoast"]["burningRoll"]
SLOTS = S["PACK_SLOTS"]
SPOT = S["spotlightTokens"]["start"]
SIG = S["signatureMoves"]

# --- layout -----------------------------------------------------------------
# Column A is a two-character left margin. Gridlines are off on every tab, so
# the page reads as a designed document instead of a spreadsheet — which is
# most of the "make it beautiful" problem solved for free.
MARGIN_W = 2
COL_LABEL, COL_VALUE, COL_HINT = 2, 3, 4

FILL_BAND = PatternFill("solid", fgColor=ACCENT)
FILL_TITLE = PatternFill("solid", fgColor=INK)
FILL_BRAND = PatternFill("solid", fgColor=BRAND)
F_BAND = Font(name="Calibri", size=10, bold=True, color="FFFFFF")
F_MASThead = Font(name="Calibri", size=20, bold=True, color="FFFFFF")
F_MASTSUB = Font(name="Calibri", size=10, color="E8E6E0")
F_VALUE = Font(name="Calibri", size=11, color=INK)
LEFT_TOP = Alignment(vertical="center", wrap_text=True)

ENGINE = 86                      # IMPORTRANGE row — spreads over B86:J90
LOOK = f"$B${ENGINE}:$J${ENGINE + 4}"

# 20/09/2026 — the flame table on the REFERENCE tab. It sits at a FIXED block
# of rows so that the character sheet can point a VLOOKUP at it without having
# to know how long the tables above it happen to be this month. If you move it,
# move it here and nowhere else.
FLAME_HEAD_ROW = 60
FLAME_ROWS = 4
FLAME_LOOK = f"REFERENCE!$B${FLAME_HEAD_ROW + 1}:$E${FLAME_HEAD_ROW + FLAME_ROWS}"

NAME_ROW = 8                     # the student's name — the VLOOKUP key

# ---------------------------------------------------------------------------
# NAMED RANGES. Every yellow cell gets a name, and the Apps Script sidebar
# addresses cells ONLY by name — never by A1. That is what makes the sidebar
# survive a layout change here: move a field and the name moves with it.
# Google Sheets keeps named ranges when it imports an .xlsx, so they arrive
# intact in the master the teacher copies.
# ---------------------------------------------------------------------------
KEYS = {}


def key(name, row, col=None):
    KEYS[name] = f"'CHARACTER SHEET'!${chr(64 + (col or COL_VALUE))}${row}"


def no_grid(ws):
    ws.sheet_view.showGridLines = False


def masthead(ws, r, title_text, sub, last_col=COL_HINT):
    for col in range(COL_LABEL, last_col + 1):
        ws.cell(r, col).fill = FILL_TITLE
        ws.cell(r + 1, col).fill = FILL_TITLE
    ws.cell(r, COL_LABEL, title_text).font = F_MASThead
    ws.cell(r + 1, COL_LABEL, sub).font = F_MASTSUB
    ws.row_dimensions[r].height = 30
    ws.row_dimensions[r + 1].height = 17
    return r + 3


def band(ws, r, label, sub="", last_col=COL_HINT):
    for col in range(COL_LABEL, last_col + 1):
        ws.cell(r, col).fill = FILL_BAND
    c = ws.cell(r, COL_LABEL, label.upper())
    c.font, c.alignment = F_BAND, LEFT_TOP
    if sub:
        s = ws.cell(r, COL_VALUE, sub)
        s.font, s.alignment = Font(name="Calibri", size=9, color="E8F0FB"), LEFT_TOP
    ws.row_dimensions[r].height = 21
    return r + 1


def field(ws, r, label, value="", fill=FILL_TYPE, hint="", height=20, k=None):
    if k:
        key(k, r)
    lab = ws.cell(r, COL_LABEL, label)
    lab.font, lab.alignment = F_LABEL, LEFT_TOP
    c = ws.cell(r, COL_VALUE, value)
    c.fill, c.font, c.border, c.alignment = fill, F_VALUE, BORDER, LEFT_TOP
    if hint:
        h = ws.cell(r, COL_HINT, hint)
        h.font, h.alignment = F_SMALL, LEFT_TOP
    ws.row_dimensions[r].height = height
    return r + 1


def pulled(ws, r, label, col_index, hint=""):
    """A blue row, read from the Class Board by column col_index (1 = STUDENT)."""
    return field(ws, r, label,
                 f'=IFERROR(VLOOKUP($C${NAME_ROW},{LOOK},{col_index},FALSE),"—")',
                 FILL_CALC, hint)


def small(ws, r, text, font=None, col=COL_LABEL):
    c = ws.cell(r, col, text)
    c.font, c.alignment = font or F_SMALL, LEFT_TOP
    return r + 1


# ---------------------------------------------------------------------------
def sheet_character(wb):
    ws = wb.create_sheet("CHARACTER SHEET")
    no_grid(ws)
    ws.sheet_properties.tabColor = ACCENT.replace("#", "")
    widths(ws, {"A": MARGIN_W, "B": 27, "C": 44, "D": 56, "E": 2})

    r = masthead(ws, 2, f"{GAME} · CHARACTER SHEET",
                 f"{HOUSE}  ·  {VERSION}")
    r = small(ws, r, "Yellow is yours — type in it. Blue comes from the Class Board — never type in it.",
              F_SMALL)
    r += 1

    # 1 -----------------------------------------------------------------
    r = band(ws, r, "1 · Who you are")
    assert r == NAME_ROW, f"NAME_ROW is {NAME_ROW} but the name field landed on {r}"
    r = field(ws, r, "Your name in the class", "Student 1", k="studentName",
              hint="Type it EXACTLY as it appears on the Class Board. This is the name "
                   "your sheet uses to find your own row.")
    r = field(ws, r, "Character name", k="charName")
    r = field(ws, r, "Setting (the Door)", "The Tallow Coast", k="setting")
    r = field(ws, r, "People", k="people", hint="Human · Wickborn · Greenkept · Duskborn · Hybrid")
    r = field(ws, r, "Lineage or Gift", k="lineage",
              hint="If you are human: Emberkin · Tidebound · Roadborn · Stonewake · Fenfolk")
    arch_row = r
    r = field(ws, r, "Archetype", KITS[1][0], k="archetype",
              hint="Vanguard · Diplomat · Strategist · Scout")

    dv = DataValidation(type="list",
                        formula1='"' + ",".join(k[0] for k in KITS) + '"',
                        allow_blank=True)
    ws.add_data_validation(dv)
    dv.add(ws.cell(arch_row, COL_VALUE))

    flame_row = r
    r = field(ws, r, "Flame", FLAMES[0][0], k="flame", height=32,
              hint="You were BORN with it and it never changes. It is invisible — only a "
                   "green flame can see one. It has nothing to do with your people, your "
                   "lineage or your Archetype.")
    dvf = DataValidation(type="list",
                         formula1='"' + ",".join(f[0] for f in FLAMES) + '"',
                         allow_blank=True)
    ws.add_data_validation(dvf)
    dvf.add(ws.cell(flame_row, COL_VALUE))

    r += 1
    # 2 -----------------------------------------------------------------
    r = band(ws, r, "2 · This session", "comes from the Class Board — do not edit")
    r = pulled(ws, r, "Growth Level", 2)
    r = pulled(ws, r, "Where you are", 3, hint="Your level and unit in the coursebook.")
    r = pulled(ws, r, "Today's lesson(s)", 4,
               hint="A · B · C · D · X. Two letters means a two-hour session: "
                    "the first hour and the second.")
    r = pulled(ws, r, "Language Focus today", 5)
    r = pulled(ws, r, "Are you presenting today?", 6)
    r = pulled(ws, r, "Your Actions", 7)
    r = pulled(ws, r, "Reminder — next lesson", 9)

    r += 1
    # 3 -----------------------------------------------------------------
    r = band(ws, r, "3 · Your resources", "you keep the count, out loud, in English")
    r = field(ws, r, "Language Points", 0, FILL_TYPE, k="languagePoints",
              hint="At the end of every session your GM says how many you will have next "
                   "time. Write the number here and cross one off each time you spend it. "
                   "Say it out loud when you do.")
    r = field(ws, r, "Spotlight Tokens", SPOT, FILL_TYPE, k="spotlightTokens",
              hint=f"{SPOT} at the start of every session, "
                   f"{S['spotlightTokens']['maxPerScene']} per scene. You may give one to "
                   f"another player by saying in English why you want to hear from them. "
                   f"Back to {SPOT} next session.")

    r += 1
    # 4 -----------------------------------------------------------------
    r = band(ws, r, "4 · Your Focuses", "+2, +1, +0 and −1 — one in each, placed once")
    for name, _tag, when in S["focuses"]:
        r = field(ws, r, name, "", FILL_TYPE, when, k="focus_" + name.lower())

    r += 1
    # 5 -----------------------------------------------------------------
    # 20/09/2026 — burning became a thing a PLAYER does, so it needed a place on
    # the sheet. Spark and taper are not typed: they are read off the flame in
    # section 1, the same way the Kit is read off the Archetype. The only yellow
    # cell here is the charge, because that is the only part that changes during
    # a session.
    r = band(ws, r, "5 · Your flame", "read off your Flame above — you do not type these")
    r = field(ws, r, "Focus you burn with",
              f'=IFERROR(VLOOKUP($C${flame_row},{FLAME_LOOK},2,FALSE),"—")',
              FILL_CALC,
              hint="A taper is 2d6 + this Focus. A spark is never rolled.")
    r = field(ws, r, "Your spark",
              f'=IFERROR(VLOOKUP($C${flame_row},{FLAME_LOOK},3,FALSE),"—")',
              FILL_CALC, height=46,
              hint="Free, small, never rolled, and it cannot solve the scene. Say it in "
                   "English, in one sentence, and it happens.")
    r = field(ws, r, "Your taper",
              f'=IFERROR(VLOOKUP($C${flame_row},{FLAME_LOOK},4,FALSE),"—")',
              FILL_CALC, height=58,
              hint="Needs a Warrant, or somebody will ask who answers for it. On a MISS the "
                   "burn fails and the place is spent anyway.")
    r = field(ws, r, "Taper charge", "ready", FILL_TYPE, k="taperCharge", height=26,
              hint="One taper per SCENE, not per session. Set it to spent when you use it, "
                   "and back to ready when the GM says the scene has ended.")
    dvt = DataValidation(type="list", formula1='"ready,spent this scene"', allow_blank=True)
    ws.add_data_validation(dvt)
    dvt.add(ws.cell(r - 1, COL_VALUE))
    r = small(ws, r, BURNING["charge"])

    r += 1
    # 6 -----------------------------------------------------------------
    r = band(ws, r, "6 · Signature Moves",
             f"up to {SIG['perCharacter']} across a whole career")
    r = field(ws, r, "Signature Move", "", hint=SIG["main"], height=32, k="signatureMove")
    r = field(ws, r, f"Cross-Training 1 (Growth {SIG['crossTrainingAt'][0]})", "", k="crossTraining1",
              hint="Tier 1 of a DIFFERENT Archetype. It stays at Tier 1 forever.")
    r = field(ws, r, f"Cross-Training 2 (Growth {SIG['crossTrainingAt'][1]})", "", k="crossTraining2",
              hint="The second one, from an Archetype different from the first. Also Tier 1 forever.")

    r += 1
    # 7 -----------------------------------------------------------------
    r = band(ws, r, "7 · What you carry")
    r = field(ws, r, "Kit",
              f'=IFERROR(VLOOKUP($C${arch_row},REFERENCE!$B$6:$C$9,2,FALSE),"—")',
              FILL_CALC,
              hint="Comes with your Archetype and your Door. Never counted, never a slot.",
              height=40)
    for i in range(SLOTS):
        r = field(ws, r, f"Pack — slot {i + 1}", "", k=f"pack{i + 1}",
                  hint=S["packFullRule"] if i == 0 else "", height=28 if i == 0 else 20)
    r = field(ws, r, "Boons", "", k="boons",
              hint="One at every Growth Moment. No slot, and never a bonus on the dice.",
              height=32)

    r += 1
    # 8 -----------------------------------------------------------------
    r = band(ws, r, "8 · Money",
             "coin → handful → bag → chest · ten of one makes one of the next")
    for rung, means in S["moneyLadder"]:
        default = 3 if rung.lower().endswith("handful") else 0
        r = field(ws, r, rung, default, FILL_TYPE, means,
                  k="money_" + rung.split()[-1].lower())
    r = small(ws, r,
              f'You start with {S["startingMoney"]["amount"]}. '
              f'Session Zero question: "{S["startingMoney"]["question"]}"')

    r += 1
    # 9 -----------------------------------------------------------------
    r = band(ws, r, "9 · Notes", "names, promises, debts — the things nobody writes down")
    for i in range(5):
        r = field(ws, r, "", "", height=22, k=f"note{i + 1}")

    # ---- the engine ----------------------------------------------------
    r = ENGINE - 4
    c = ws.cell(r, COL_LABEL, "PASTE THE CLASS BOARD LINK HERE →")
    c.font, c.alignment = F_LABEL, LEFT_TOP
    v = ws.cell(r, COL_VALUE, "paste the Class Board link here")
    v.fill, v.font, v.border, v.alignment = FILL_TYPE, F_VALUE, BORDER, LEFT_TOP
    board_cell = f"$C${r}"
    key("boardLink", r)

    small(ws, ENGINE - 2,
          "▼ ENGINE — the link to the Class Board. Do not edit it and do not delete it.")
    # ⚠ board_public() é BOARD!B6:J10 — onde os dados REALMENTE caem no Class
    # Board. Pedir A1:I5 (o que este arquivo fazia) traz a tarja de título.
    f = ws.cell(ENGINE, COL_LABEL,
                f'=IMPORTRANGE({board_cell},"{board_public()}")')
    f.font, f.border = F_BODY, BORDER

    n = ENGINE + 6
    n = small(ws, n, "THE FIRST TIME YOU OPEN THIS SHEET", F_LABEL)
    for line in [
        f"Scroll down to cell B{ENGINE}. It will show #REF! and an Allow access button. "
        "Click it. Once, and it never asks again.",
        "That is all — the blue block at the top fills itself in.",
        "",
        "Only YOUR row appears at the top. This block down here is the machinery of the "
        "link: it is not for reading, and it is not for deleting.",
    ]:
        n = small(ws, n, line, F_BODY if line else F_SMALL)

    ws.freeze_panes = "A6"

    # Register the names on the workbook. The sidebar uses these and nothing else.
    for nm, ref in KEYS.items():
        wb.defined_names.add(DefinedName("LUD_" + nm, attr_text=ref))
    return ws


# ---------------------------------------------------------------------------
def sheet_reference(wb):
    ws = wb.create_sheet("REFERENCE")
    no_grid(ws)
    ws.sheet_properties.tabColor = BRAND
    widths(ws, {"A": MARGIN_W, "B": 24, "C": 62, "D": 62, "E": 62, "F": 2})

    r = masthead(ws, 2, "REFERENCE", "Everything here is read-only. Nothing to fill in.",
                 last_col=5)

    def table(rows, headers):
        nonlocal r
        for i, h in enumerate(headers):
            c = ws.cell(r, COL_LABEL + i, h.upper())
            c.fill, c.font, c.alignment = FILL_BAND, F_BAND, LEFT_TOP
        ws.row_dimensions[r].height = 20
        r += 1
        for row in rows:
            for i, val in enumerate(row):
                c = ws.cell(r, COL_LABEL + i, val)
                c.font = F_LABEL if i == 0 else F_BODY
                c.alignment = LEFT_TOP
            ws.row_dimensions[r].height = 30
            r += 1
        r += 1

    table([[n, k] for n, k in KITS], ["Archetype", "Your Kit"])
    table([[f"{b}  {label}", meaning]
           for b, _kind, label, meaning in S["outcomeBands"]], ["Band", "Means"])
    table([[m["name"], m["focus"], "…" + m["trigger"]] for m in S["moves"]],
          ["Move", "Focus", "You use it…"])
    table([[d, means] for d, means in S["distanceLadder"]], ["How far", "Means"])
    table([[how, why] for why, how in S["languagePoints"]["earn"]],
          ["Language Points", "You earn one for"])
    r = small(ws, r, S["languagePoints"]["lawOfTheAttempt"])
    r += 1
    table([["Yours", SIG["main"]],
           ["Cross-Training", SIG["crossTrainingRule"]],
           ["Why", SIG["why"]]], ["Signature Moves", ""])

    # --- THE FLAMES, at a fixed block of rows ------------------------------
    # This one is not laid out in sequence with the others: the character sheet
    # VLOOKUPs into it, so it must be at an address that does not move when a
    # table above it grows by a row. FLAME_HEAD_ROW is that address.
    assert r <= FLAME_HEAD_ROW, (
        f"the reference tables now reach row {r} and would collide with the flame "
        f"table at row {FLAME_HEAD_ROW} — raise FLAME_HEAD_ROW")
    fr = FLAME_HEAD_ROW
    for i, h in enumerate(["Flame", "Focus", "Your spark", "Your taper"]):
        c = ws.cell(fr, COL_LABEL + i, h.upper())
        c.fill, c.font, c.alignment = FILL_BAND, F_BAND, LEFT_TOP
    ws.row_dimensions[fr].height = 20
    for i, f in enumerate(FLAMES):
        row = fr + 1 + i
        vals = [f[0], f[1],
                f"{FLAME_SPARKS[i][1]} — {FLAME_SPARKS[i][2]}",
                f"{FLAME_TAPERS[i][1]} — {FLAME_TAPERS[i][2]}"]
        for j, val in enumerate(vals):
            c = ws.cell(row, COL_LABEL + j, val)
            c.font = F_LABEL if j == 0 else F_BODY
            c.alignment = LEFT_TOP
        ws.row_dimensions[row].height = 58
    small(ws, fr + 1 + FLAME_ROWS + 1, BURNING["taper"] + "  " + BURNING["missNote"])
    return ws


# ---------------------------------------------------------------------------
def build():
    wb = Workbook()
    wb.remove(wb.active)
    sheet_character(wb)
    sheet_reference(wb)

    # ⚠ pos=None — READ ME goes LAST. A student must open their own character,
    # not a page of assembly instructions written for the teacher.
    ws = leia_me(wb, [
        f"{VERSION}  ·  generated from core/core.json by planilhas/src/build_ficha.py",
        "",
        "## One sheet per student. Never one file for the whole table.",
        "Per-student tabs inside a single file are not security: anyone who can edit can unhide, and anyone who can read can pull the rest out of the source. One file per student solves it with no trick at all.",
        "",
        "## Setting one up, per student",
        "1. Upload this file to Drive and open it.",
        "2. File → Save as Google Sheets.",
        "3. PASTE THE CLASS BOARD LINK INTO THE MASTER FIRST, in cell C74, before you copy anything. Every copy then arrives with the link already in it and you only have one click left to do per student.",
        "4. Keep that as the MASTER in your Library folder. For each student, make a copy and rename it with their name.",
        "5. In each copy, two things: type the student's name in cell C8 of CHARACTER SHEET, exactly as it appears on the Class Board; then click cell B78 and press Allow access. You can do both yourself, before the student ever opens the file — then they never see an authorisation screen.",
        "6. Post it in Classroom as MATERIAL assigned to that one student, with edit permission.",
        "",
        "## Yellow and blue",
        "Yellow is filled in by the student: the character, the Focuses, the Signature Moves, the Pack, Boons, money, notes — and the RESOURCES.",
        "Language Points and Spotlight Tokens belong to the student. The GM announces the total at the debrief; the student writes it down and crosses it off as they spend. Managing your own resource out loud, in English, is part of the exercise — it is not a spreadsheet's job.",
        "Blue comes from the Class Board and is never edited: Growth, where they are on the trail, the lesson of the cycle, today's Language Focus, whether they present, their Actions, the Language Points and the reminder for the next lesson.",
        "",
        "## Why only their own row appears",
        "The engine at the bottom imports the whole board — it is what shows the Allow access button, which is why it stays visible. The blue block at the top uses VLOOKUP on the name in C8 and shows only that student's row. Seeing a classmate's row would not be a security problem; it is just noise that helps nobody.",
        "",
        "## Language",
        "Everything a student can see in this file is in English, including this tab. The teacher's Painel stays in Portuguese: it is the teacher's private tool and never leaves their Drive.",
        "",
        "## The sheet follows the book",
        "The eight sections are the ten rows of chapter 3 of the Player's Guide, in the same order and with the same names. If the book changes, this file is regenerated from core/core.json — it is never edited by hand.",
    ], f"Character Sheet · {GAME}",
        "One per student. The student edits what is theirs.",
        name="READ ME", pos=None)
    no_grid(ws)

    out = os.path.join(OUT, "Character-Sheet-LUDUS.xlsx")
    wb.save(out)
    print("written:", out, "· tabs:", wb.sheetnames)


if __name__ == "__main__":
    build()
