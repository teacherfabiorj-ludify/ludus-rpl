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

from openpyxl.utils import get_column_letter

from _common import (ACCENT, BORDER, BRAND, FILL_CALC, FILL_NOTE, FILL_TYPE,
                     F_BODY, F_LABEL, F_SMALL, F_TITLE, INK, OUT, WRAP, WRAP_C,
                     board_public, core, house_mark, leia_me, widths, REPO)

C = core()
S = C["system"]
GAME = C["brand"]["GAME_NAME"]
HOUSE = C["brand"]["HOUSE"]
VERSION = C["brand"]["VERSION"]
KITS = C["doors"]["tallowCoast"]["archetypeKits"]
FLAMES = C["doors"]["tallowCoast"]["flames"]
PEOPLES = C["doors"]["tallowCoast"]["peopleQuickRef"]
LINEAGES = C["doors"]["tallowCoast"]["humanLineages"]
BLOODLINES = C["doors"]["tallowCoast"]["bloodlines"]

FLAME_SPARKS = C["doors"]["tallowCoast"]["flameSparks"]
FLAME_TAPERS = C["doors"]["tallowCoast"]["flameTapers"]
BURNING = C["doors"]["tallowCoast"]["burningRoll"]
SLOTS = S["PACK_SLOTS"]
SPOT = S["spotlightTokens"]["start"]
SIG = S["signatureMoves"]
MOVES = S["moves"]
# Tier 1 at creation, then one step at each of the levels in `main`. Three
# named levels (3, 7, 12) means the ceiling is Tier 4. Nothing here decides
# that — core/system.js does, and this counts it.
SIG_TIERS = 1 + len([w for w in SIG["main"].replace(" and", ",").split("Levels ")[-1].split(",") if w.strip().rstrip(".").isdigit()])

# --- layout -----------------------------------------------------------------
# 23/09/2026 — SECOND PASS ON FÁBIO'S TWO-COLUMN LAYOUT, and the two notes he
# made on the first one are both right:
#
#   1. A hint cell that lists the options already in the dropdown is pure
#      noise. The student opens the list and sees them. So the rule now is:
#      A HINT EARNS ITS CELL ONLY IF IT SAYS SOMETHING ABOUT THE CONTENT OF
#      THAT FIELD. Anything about how the system works belongs on REFERENCE
#      or READ ME, which is what those tabs are for.
#   2. It has to fit on screen at 100%. Horizontal scrolling on a sheet the
#      student keeps open for two hours costs more than any hint gains.
#
# So: 177 characters wide, which is roughly 1290 pixels of grid — it fits on a
# 1440-wide screen with room, and comfortably on anything bigger.
#
# And one consequence worth stating, because it is what makes the narrow grid
# work: WHEN A FIELD HAS NO HINT, ITS VALUE CELL TAKES THE HINT'S SPACE. The
# Pack slots, the Notes and the Signature Move get a wide box to write in
# precisely because they had nothing worth explaining beside them.
#
#   A  margin
#   B  label     C  value    D  hint        <- LEFT   (value merges C:D if no hint)
#   E  gutter
#   F  label     G  value    H  tier   I  hint   <- RIGHT
#                            (value merges G:I if no hint, G:H if hint, G only if tier)
#   J  margin
MARGIN_W = 2
COL_LABEL, COL_VALUE, COL_HINT = 2, 3, 4            # B C D
R_LABEL, R_VALUE, R_TIER, R_HINT = 6, 7, 8, 9       # F G H I

FILL_BAND = PatternFill("solid", fgColor=ACCENT)
FILL_TITLE = PatternFill("solid", fgColor=INK)
F_BAND = Font(name="Calibri", size=10, bold=True, color="FFFFFF")
F_BAND_SUB = Font(name="Calibri", size=9, color="E8F0FB")
F_MASThead = Font(name="Calibri", size=20, bold=True, color="FFFFFF")
F_MASTSUB = Font(name="Calibri", size=10, color="E8E6E0")
F_VALUE = Font(name="Calibri", size=11, color=INK)
LEFT_TOP = Alignment(vertical="center", wrap_text=True)

# The engine row depends on how tall the sheet turned out, and the two
# portrait placements do not produce the same height. It is a parameter rather
# than a constant, and the assert further down still breaks the build if the
# content ever grows into it.
ENGINE_BY_LAYOUT = {"top": 60, "bottom": 74}

# The flame table on the REFERENCE tab sits at a FIXED block of rows so that
# the character sheet can point a VLOOKUP at it without having to know how long
# the tables above it happen to be this month.
FLAME_HEAD_ROW = 60
FLAME_ROWS = 4
FLAME_LOOK = f"REFERENCE!$B${FLAME_HEAD_ROW + 1}:$E${FLAME_HEAD_ROW + FLAME_ROWS}"
KIT_LOOK = "REFERENCE!$B$6:$C$9"

# ---------------------------------------------------------------------------
# NAMED RANGES. Every yellow cell gets a name, and the Apps Script sidebar
# addresses cells ONLY by name — never by A1.
#
# ⚠ Google Sheets keeps named ranges on import but NOT when a human moves rows
# around in the browser afterwards. Rearrange here and regenerate.
# ---------------------------------------------------------------------------
KEYS = {}


def key(name, row, col=None):
    KEYS[name] = f"'CHARACTER SHEET'!${get_column_letter(col or COL_VALUE)}${row}"


def no_grid(ws):
    ws.sheet_view.showGridLines = False


# 24/09/2026 — THE MASTHEAD IS NOW THREE ROWS AND STOPS SHORT OF THE RIGHT EDGE.
#
# Two of Fábio's notes, and both are right:
#   · the house mark belongs on the sheet, beside the black band, not nowhere;
#   · the yellow/blue colour key had a whole line of the sheet to itself and it
#     is not something anybody rereads. It is orientation, seen once.
#
# So the band runs B..F and the logo sits in G..I on white, and the colour key
# moved INTO the band as a third line of small light type. It is still there
# the moment a student looks for it and it costs nothing the rest of the time.
MAST_LAST = 6                    # the black band stops at F; G..I is the logo


def masthead(ws, r, title_text, sub, key_line="", last_col=MAST_LAST,
             logo_at=None, logo_px=56):
    for row in range(r, r + 3):
        for col in range(COL_LABEL, last_col + 1):
            ws.cell(row, col).fill = FILL_TITLE
    ws.cell(r, COL_LABEL, title_text).font = F_MASThead
    ws.cell(r + 1, COL_LABEL, sub).font = F_MASTSUB
    if key_line:
        c = ws.cell(r + 2, COL_LABEL, key_line)
        c.font = Font(name="Calibri", size=8, color="B9B6AF")
    ws.merge_cells(start_row=r + 2, start_column=COL_LABEL,
                   end_row=r + 2, end_column=last_col)
    ws.row_dimensions[r].height = 28
    ws.row_dimensions[r + 1].height = 15
    ws.row_dimensions[r + 2].height = 13
    if logo_at:
        house_mark(ws, logo_at, logo_px)
    return r + 4


def band(ws, r, left_title, right_title="", sub="", tier=False):
    for col in range(COL_LABEL, R_HINT + 1):
        ws.cell(r, col).fill = FILL_BAND
    c = ws.cell(r, COL_LABEL, left_title.upper())
    c.font, c.alignment = F_BAND, LEFT_TOP
    if sub:
        x = ws.cell(r, COL_VALUE, sub)
        x.font, x.alignment = F_BAND_SUB, LEFT_TOP
        ws.merge_cells(start_row=r, start_column=COL_VALUE, end_row=r, end_column=COL_HINT)
    if right_title:
        y = ws.cell(r, R_LABEL, right_title.upper())
        y.font, y.alignment = F_BAND, LEFT_TOP
    if tier:
        z = ws.cell(r, R_TIER, "TIER")
        z.font, z.alignment = F_BAND, LEFT_TOP
    ws.row_dimensions[r].height = 21
    return r + 1


def _field(ws, r, c_label, c_value, c_hint, label, value, fill, hint, value_end):
    if label:
        lab = ws.cell(r, c_label, label)
        lab.font, lab.alignment = F_LABEL, LEFT_TOP
    cell = ws.cell(r, c_value, value)
    cell.fill, cell.font, cell.border, cell.alignment = fill, F_VALUE, BORDER, LEFT_TOP
    if value_end > c_value:
        ws.merge_cells(start_row=r, start_column=c_value, end_row=r, end_column=value_end)
    if hint:
        h = ws.cell(r, c_hint, hint)
        h.font, h.alignment = F_SMALL, LEFT_TOP
    return cell


def left(ws, r, label, value="", fill=FILL_TYPE, hint="", k=None):
    if k:
        key(k, r, COL_VALUE)
    # No hint? The value takes the hint's column. That is the whole trick.
    _field(ws, r, COL_LABEL, COL_VALUE, COL_HINT, label, value, fill, hint,
           COL_VALUE if hint else COL_HINT)
    return r + 1


def right(ws, r, label, value="", fill=FILL_TYPE, hint="", k=None, tier=False):
    if k:
        key(k, r, R_VALUE)
    end = R_VALUE if tier else (R_TIER if hint else R_HINT)
    _field(ws, r, R_LABEL, R_VALUE, R_HINT, label, value, fill, hint, end)
    return r


def small(ws, r, text, font=None, col=COL_LABEL, span=None):
    c = ws.cell(r, col, text)
    c.font, c.alignment = font or F_SMALL, LEFT_TOP
    if span:
        ws.merge_cells(start_row=r, start_column=col, end_row=r, end_column=span)
    return r + 1


def portrait(ws, r1, c1, r2, c2, caption):
    """An empty bordered box for the student's own character art.

    Nothing is placed in it by the build — a student drops their own picture in
    with Insert ▸ Image ▸ Image over cells and drags it to fit. The box is
    merged so a dropped image has a single obvious target, and the caption sits
    OUTSIDE it so that a picture covering the box does not half-cover a hint.
    """
    for row in range(r1, r2 + 1):
        for col in range(c1, c2 + 1):
            cell = ws.cell(row, col)
            cell.fill = FILL_NOTE
            cell.border = BORDER
    ws.merge_cells(start_row=r1, start_column=c1, end_row=r2, end_column=c2)
    cap = ws.cell(r2 + 1, c1, caption)
    cap.font, cap.alignment = F_SMALL, LEFT_TOP
    ws.merge_cells(start_row=r2 + 1, start_column=c1, end_row=r2 + 1, end_column=c2)
    return r2 + 2


def dv(ws, options, *cells, blank=True):
    v = DataValidation(type="list", formula1='"' + ",".join(options) + '"',
                       allow_blank=blank)
    ws.add_data_validation(v)
    for cell in cells:
        v.add(cell)


# ---------------------------------------------------------------------------
def sheet_character(wb, portrait_at="top"):
    ENGINE = ENGINE_BY_LAYOUT[portrait_at]
    LOOK = f"$B${ENGINE}:$J${ENGINE + 4}"
    ws = wb.create_sheet("CHARACTER SHEET")
    no_grid(ws)
    ws.sheet_properties.tabColor = ACCENT.replace("#", "")
    widths(ws, {"A": MARGIN_W, "B": 24, "C": 32, "D": 26, "E": 2,
                "F": 24, "G": 32, "H": 7, "I": 26, "J": MARGIN_W})

    r = masthead(ws, 2, f"{GAME} · CHARACTER SHEET", f"{HOUSE}  ·  {VERSION}",
                 key_line="YELLOW is yours, type in it  ·  BLUE comes from the Class Board, "
                          "never type in it  ·  the rules are on the REFERENCE tab",
                 logo_at="G2", logo_px=56)

    # 1 ------------------------------------------------------------------
    # The identity block has two shapes, one per portrait placement, because a
    # version should be the best version of its own idea rather than a crippled
    # variant of the other. With the portrait at the top, the fields stack in
    # ONE column and the picture takes the other. With it at the bottom, they
    # split across both, the way they did before the picture existed.
    r = band(ws, r, "1 · Who you are")
    top = r
    ID = [("Your name in the class", "studentName", "Student 1", "Exactly as it is on the Class Board."),
          ("Character name", "charName", "", ""),
          ("Setting (the Door)", "setting", "The Tallow Coast", ""),
          ("People", "people", "", ""),
          ("Lineage", "lineage", "", "Humans only."),
          ("Bloodline", "bloodline", "", "Humans only. Optional."),
          ("Hybrid feature", "hybridFeature", "", "Hybrids only."),
          ("Archetype", "archetype", KITS[1][0], ""),
          ("Flame", "flame", FLAMES[0][0], "")]
    rows_of = {}

    if portrait_at == "top":
        id_col = COL_VALUE
        for label, k, default, hint in ID:
            rows_of[k] = r
            left(ws, r, label, default, FILL_TYPE, hint, k=k)
            r += 1
        portrait(ws, top, R_LABEL, r - 2, R_HINT,
                 "Insert ▸ Image ▸ Image over cells, then drag it to fit.")
    else:
        id_col = None                      # set per field below
        half = 3                           # three on the left, six on the right
        for i, (label, k, default, hint) in enumerate(ID):
            if i < half:
                rows_of[k] = (r + i, COL_VALUE)
                left(ws, r + i, label, default, FILL_TYPE, hint, k=k)
            else:
                rows_of[k] = (r + i - half, R_VALUE)
                right(ws, r + i - half, label, default, FILL_TYPE, hint, k=k)
        r += len(ID) - half
    r += 1

    def cell_of(k):
        v = rows_of[k]
        return (v, id_col) if id_col else v

    name_row, name_col = cell_of("studentName")
    arch_row, arch_col = cell_of("archetype")
    flame_row, flame_col = cell_of("flame")
    for k, opts, blank in [("people", [x[0] for x in PEOPLES], True),
                           ("lineage", [x[0] for x in LINEAGES], True),
                           ("bloodline", [x[0] for x in BLOODLINES], True),
                           ("archetype", [x[0] for x in KITS], False),
                           ("flame", [x[0] for x in FLAMES], False)]:
        row, col = cell_of(k)
        dv(ws, opts, ws.cell(row, col), blank=blank)

    # 2 · 3 ---------------------------------------------------------------
    r = band(ws, r, "2 · Your Focuses", "3 · Signature Moves",
             sub="+2, +1, +0 and −1 — one in each, placed once", tier=True)
    focus_rows, tier_row = [], None
    focus_row_of = {}          # Focus name -> the row its value cell landed on
    sig = [("Signature Move", "signatureMove"),
           (f"Cross-Training 1 (Growth {SIG['crossTrainingAt'][0]})", "crossTraining1"),
           (f"Cross-Training 2 (Growth {SIG['crossTrainingAt'][1]})", "crossTraining2")]
    for i, (name, _tag, when) in enumerate(S["focuses"]):
        focus_rows.append(r)
        focus_row_of[name] = r
        left(ws, r, name, "", FILL_TYPE, when, k="focus_" + name.lower())
        if i < len(sig):
            label, k = sig[i]
            if i == 0:
                right(ws, r, label, "", FILL_TYPE, k=k, tier=True)
                tier_row = r
                t = ws.cell(r, R_TIER, 1)
                t.fill, t.font, t.border, t.alignment = FILL_TYPE, F_VALUE, BORDER, WRAP_C
                key("tier", r, R_TIER)
                ws.cell(r, R_HINT, "Cross-Training stays at Tier 1 for life.").font = F_SMALL
                ws.cell(r, R_HINT).alignment = LEFT_TOP
            else:
                right(ws, r, label, "", FILL_TYPE, k=k)
        r += 1
    dv(ws, [str(n) for n in range(1, SIG_TIERS + 1)], ws.cell(tier_row, R_TIER), blank=False)
    dv(ws, ["+2", "+1", "+0", "-1"], *[ws.cell(x, COL_VALUE) for x in focus_rows], blank=False)
    r += 1

    # 4 · YOUR MOVES ------------------------------------------------------
    # 24/09/2026 — added after the pilot group's session. The question that
    # kept coming up mid-scene was not what a Move does — that is in the Quick
    # Reference — it was WHICH FOCUS IT USES: "read the room is wit? or
    # empathy?". If a table asks something every session, it belongs on the
    # sheet, so here it is with the answer already worked out: the Move, the
    # number to add, and the Focus it came from.
    #
    # The modifier is not typed and not looked up. Each cell points straight at
    # the Focus cell above, because this build script knows at build time which
    # Focus every Move uses — core/system.js says so. Change a Move's Focus in
    # core and this follows on the next build, with nothing to keep in step.
    r = band(ws, r, "4 · Your Moves", "", sub="the number is your Focus — you never type here")
    half = (len(MOVES) + 1) // 2
    for i in range(half):
        for j, (c_label, c_value, c_hint, wide) in enumerate([
                (COL_LABEL, COL_VALUE, COL_HINT, False),
                (R_LABEL, R_VALUE, R_HINT, True)]):
            k = i + j * half
            if k >= len(MOVES):
                continue
            mv = MOVES[k]
            src = focus_row_of[mv["focus"]]
            _field(ws, r, c_label, c_value, c_hint, mv["name"],
                   f'=IF($C${src}="","—",$C${src})', FILL_CALC, mv["focus"],
                   (R_TIER if wide else c_value))
        r += 1
    r += 1

    # 5 · 6 ---------------------------------------------------------------
    r = band(ws, r, "5 · This session", "6 · Your resources",
             sub="from the Class Board — do not edit")
    pulled = [("Growth Level", 2), ("Where you are", 3), ("Today's lesson(s)", 4),
              ("Language Focus today", 5), ("Are you presenting today?", 6),
              ("Your Actions", 7), ("Reminder — next lesson", 9)]
    res = [("Language Points", 0, "languagePoints"),
           ("Spotlight Tokens", SPOT, "spotlightTokens")]
    for i, (label, col_index) in enumerate(pulled):
        left(ws, r, label,
             f'=IFERROR(VLOOKUP(${get_column_letter(name_col)}${name_row},{LOOK},{col_index},FALSE),"—")', FILL_CALC)
        if i < len(res):
            lab, default, k = res[i]
            right(ws, r, lab, default, FILL_TYPE, k=k)
        r += 1
    r += 1

    # 6 · 7 ---------------------------------------------------------------
    r = band(ws, r, "7 · Your flame", "8 · What you carry",
             sub="read off your Flame above — you do not type these")
    # The spark and taper cells hold a FORMULA, so the height pass below cannot
    # measure them — it only sees "=IFERROR(...". Measure the text the formula
    # will actually pull, which is the longest entry in the flame table.
    flame_block = [("Focus you burn with", 2), ("Your spark", 3), ("Your taper", 4)]
    flame_len = {3: max(len(f"{x[1]} — {x[2]}") for x in FLAME_SPARKS),
                 4: max(len(f"{x[1]} — {x[2]}") for x in FLAME_TAPERS)}
    carry = [("Kit", None)] + [(f"Pack — slot {i + 1}", f"pack{i + 1}") for i in range(SLOTS)] \
        + [("Boons", "boons")]
    taper_row = None
    for i in range(max(len(flame_block) + 1, len(carry))):
        if i < len(flame_block):
            label, col_index = flame_block[i]
            left(ws, r, label,
                 f'=IFERROR(VLOOKUP(${get_column_letter(flame_col)}${flame_row},{FLAME_LOOK},{col_index},FALSE),"—")',
                 FILL_CALC)
            if col_index in flame_len:
                ws.row_dimensions[r].height = 13.2 * -(-flame_len[col_index] // 58) + 8
        elif i == len(flame_block):
            taper_row = r
            left(ws, r, "Taper charge", "ready", FILL_TYPE, k="taperCharge")
        if i < len(carry):
            lab, k = carry[i]
            if k is None:
                right(ws, r, lab,
                      f'=IFERROR(VLOOKUP(${get_column_letter(arch_col)}${arch_row},{KIT_LOOK},2,FALSE),"—")', FILL_CALC)
            else:
                right(ws, r, lab, "", FILL_TYPE, k=k)
        r += 1
    dv(ws, ["ready", "spent this scene"], ws.cell(taper_row, COL_VALUE), blank=False)
    r += 1

    # 8 · 9 ---------------------------------------------------------------
    r = band(ws, r, "9 · Money", "10 · Notes",
             sub="ten of one makes one of the next")
    money = list(S["moneyLadder"])
    for i in range(max(len(money) + 1, 5)):
        if i < len(money):
            rung, means = money[i]
            default = 3 if rung.lower().endswith("handful") else 0
            left(ws, r, rung, default, FILL_TYPE, means,
                 k="money_" + rung.split()[-1].lower())
        elif i == len(money):
            small(ws, r, f'You start with {S["startingMoney"]["amount"]}.', span=COL_HINT)
        if i < 5:
            right(ws, r, "names, promises, debts" if i == 0 else "", "", FILL_TYPE,
                  k=f"note{i + 1}")
        r += 1

    if portrait_at == "bottom":
        r += 1
        r = band(ws, r, "11 · Your character", sub="your own picture of them")
        r = portrait(ws, r, COL_LABEL, r + 7, R_HINT,
                     "Insert ▸ Image ▸ Image over cells, then drag it to fit.")

    # ---- row heights ----------------------------------------------------
    # openpyxl will not wrap-and-grow a merged cell on its own, so measure the
    # row and set it. Without this the long cells are silently clipped.
    WIDTHS = {COL_LABEL: 24, COL_VALUE: 32, COL_HINT: 26,
              R_LABEL: 24, R_VALUE: 32, R_HINT: 26}
    SPANS = {COL_VALUE: 58, R_VALUE: 65}      # when a value has swallowed its hint
    for row in range(4, ENGINE - 5):
        lines = 1
        for col, w in WIDTHS.items():
            v = ws.cell(row, col).value
            if not isinstance(v, str) or v.startswith("="):
                continue
            width = w
            if col in SPANS and not ws.cell(row, col + (1 if col == COL_VALUE else 2)).value:
                width = SPANS[col]
            lines = max(lines, -(-len(v) // width))
        h = ws.row_dimensions[row].height
        want = max(20, 13.2 * lines + 6)
        if h is None or (h < 21 and h < want):
            ws.row_dimensions[row].height = want

    # ---- the engine ----------------------------------------------------
    assert r <= ENGINE - 4, (
        f"the sheet now reaches row {r} and would collide with the engine at "
        f"row {ENGINE} — raise ENGINE")
    r = ENGINE - 4
    c = ws.cell(r, COL_LABEL, "PASTE THE CLASS BOARD LINK HERE →")
    c.font, c.alignment = F_LABEL, LEFT_TOP
    v = ws.cell(r, COL_VALUE, "paste the Class Board link here")
    v.fill, v.font, v.border, v.alignment = FILL_TYPE, F_VALUE, BORDER, LEFT_TOP
    ws.merge_cells(start_row=r, start_column=COL_VALUE, end_row=r, end_column=COL_HINT)
    board_cell = f"$C${r}"
    key("boardLink", r)

    small(ws, ENGINE - 2,
          "▼ ENGINE — the link to the Class Board. Do not edit it and do not delete it.",
          span=R_HINT)
    f = ws.cell(ENGINE, COL_LABEL,
                f'=IMPORTRANGE({board_cell},"{board_public()}")')
    f.font, f.border = F_BODY, BORDER

    n = ENGINE + 6
    n = small(ws, n, "THE FIRST TIME YOU OPEN THIS SHEET", F_LABEL, span=R_HINT)
    for line in [
        f"Scroll down to cell B{ENGINE}. It will show #REF! and an Allow access button. "
        "Click it. Once, and it never asks again.",
        "That is all — the blue block at the top fills itself in.",
        "",
        "Only YOUR row appears at the top. This block down here is the machinery of the "
        "link: it is not for reading, and it is not for deleting.",
    ]:
        n = small(ws, n, line, F_BODY if line else F_SMALL, span=R_HINT)

    # The masthead only. Freezing the identity block as well was tempting and
    # would have cost a third of the visible sheet — and the thing actually
    # worth having pinned is the colour key, which is in the band.
    ws.freeze_panes = "A5"
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

    # 23/09/2026 — these four moved HERE off the character sheet, where they
    # were sitting beside a field as a hint. A hint that explains how the
    # system works belongs on this tab; a hint beside a field should say
    # something about that field's content or not exist. See build_ficha's
    # layout header for the rule.
    table([
        ["Spotlight Tokens",
         f'{SPOT} at the start of every session, {S["spotlightTokens"]["maxPerScene"]} per scene. '
         f'You may give one to another player by saying, in English, why you want to hear from '
         f'them. Back to {SPOT} next session.'],
        ["Language Points",
         "Your GM tells you the number at the start of a session. Cross one off, out loud, each "
         "time you spend it. What you earn tonight is what you spend next week."],
        ["Your Pack", S["packFullRule"]],
        ["Boons", "One at every Growth Moment, without exception. It never takes a Pack slot and "
                  "it never adds a number to a roll."],
        ["Your Flame", "You were born with it and it never changes. It has nothing to do with "
                       "your people, your lineage or your Archetype, and it is invisible — only "
                       "a green flame can see one."],
        ["Taper charge", "One taper per SCENE, not per session. Set it to spent when you use it, "
                         "and back to ready when the GM says the scene has ended."],
    ], ["How it works", ""])

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
def build(portrait_at="top", suffix=""):
    wb = Workbook()
    wb.remove(wb.active)
    sheet_character(wb, portrait_at=portrait_at)
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

    out = os.path.join(OUT, f"Character-Sheet-LUDUS{suffix}.xlsx")
    wb.save(out)
    print("written:", out, "· tabs:", wb.sheetnames)
    return out


if __name__ == "__main__":
    # Two candidates for Fábio to choose between, from one source. Whichever
    # he picks, the loser is deleted and the argument goes away — this is a
    # choice, not a setting.
    build(portrait_at="top", suffix="-A-portrait-top")
    build(portrait_at="bottom", suffix="-B-portrait-bottom")
