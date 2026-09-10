#!/usr/bin/env python3
"""
Ludify RPL — Door Book: The Tallow Coast — figures.

Same visual system as players-guide/src/assets/make_figures.py: the palette is
identical to the one in build.js, DejaVu for glyph coverage, 3x supersampling
so the PNGs stay crisp when Word scales them down.

Regenerate with:  python3 make_figures.py
"""
from PIL import Image, ImageDraw, ImageFont
import os

OUT = os.path.dirname(os.path.abspath(__file__))
D = "/usr/share/fonts/truetype/dejavu/"
fb = lambda s: ImageFont.truetype(D + "DejaVuSans-Bold.ttf", s)
fr = lambda s: ImageFont.truetype(D + "DejaVuSans.ttf", s)
fi = lambda s: ImageFont.truetype(D + "DejaVuSans-Oblique.ttf", s)

S = 3  # supersample factor

# ---- palette, identical to build.js ---------------------------------------
ACCENT = (0x2A, 0x78, 0xD6)
GOOD = (0x0C, 0xA3, 0x0C)
WARN = (0xFA, 0xB2, 0x19)
CRIT = (0xD0, 0x3B, 0x3B)
INK = (0x0B, 0x0B, 0x0B)
INK2 = (0x52, 0x51, 0x4E)
MUTED = (0x89, 0x87, 0x81)
BOXBG = (0xF2, 0xF2, 0xF0)
ZEBRA = (0xF7, 0xF7, 0xF5)
WHITE = (255, 255, 255)
LINE = (0xE1, 0xE0, 0xD9)


def canvas(w, h):
    im = Image.new("RGB", (w * S, h * S), WHITE)
    return im, ImageDraw.Draw(im)


def save(im, name, w):
    im = im.resize((w, int(im.height / S)), Image.LANCZOS)
    im.save(os.path.join(OUT, name))
    print("  ", name, im.size)


def text(d, xy, s, font, fill, anchor=None, spacing_px=0):
    """Draw text, optionally letter-spaced (PIL has no tracking)."""
    if not spacing_px:
        d.text((xy[0] * S, xy[1] * S), s, font=font, fill=fill, anchor=anchor)
        return
    x = xy[0] * S
    for ch in s:
        d.text((x, xy[1] * S), ch, font=font, fill=fill, anchor=anchor)
        x += d.textlength(ch, font=font) + spacing_px * S


def wrap(d, s, font, max_w):
    words, lines, cur = s.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if d.textlength(t, font=font) <= max_w * S:
            cur = t
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def rect(d, box, fill=None, outline=None, width=1, radius=None):
    b = [box[0] * S, box[1] * S, box[2] * S, box[3] * S]
    if radius:
        d.rounded_rectangle(b, radius=radius * S, fill=fill, outline=outline, width=width * S)
    else:
        d.rectangle(b, fill=fill, outline=outline, width=width * S)


# ===========================================================================
# 1. THE SESSION SHAPE — two hours, and where the English actually happens
# ===========================================================================
def session_shape():
    """Three blocks and what each is for.

    Deliberately NOT to scale: at true proportions the ten-minute arrival block
    is 67px wide and unreadable. The minutes are printed on each block instead,
    which is honest and legible. The twenty-minute rule is not drawn here — it
    is a callout in the book directly underneath, and printing it twice looked
    like a mistake.
    """
    W, H = 980, 200
    im, d = canvas(W, H)

    blocks = [
        ("ARRIVAL", "10 min", "Through the Door.\nWhat happened last week,\nin their words.", ACCENT, 214),
        ("THE SESSION", "90 min", "Scenes. You describe, you ask,\nyou listen.\nThis is the part that is the class.", INK, 444),
        ("THE LAST 20", "20 min", "Close one thread.\nHand a lantern.\nOut through the Door.", GOOD, 214),
    ]

    x = 40
    top, bh = 34, 128
    for label, mins, body, color, w in blocks:
        dark = color == INK
        rect(d, (x, top, x + w, top + bh), fill=INK if dark else BOXBG)
        rect(d, (x, top, x + 7, top + bh), fill=WARN if dark else color)
        text(d, (x + 24, top + 18), label, fb(15 * S), WARN if dark else color, spacing_px=1.2)
        text(d, (x + 24, top + 40), mins, fr(13 * S), MUTED)
        yy = top + 66
        for ln in body.split("\n"):
            text(d, (x + 24, yy), ln, fr(13 * S), (0xD9, 0xD7, 0xD2) if dark else INK)
            yy += 20
        x += w + 14

    text(d, (40, top + bh + 22),
         "Not to scale — the minutes are printed on each block. The middle block is the class; the other two protect it.",
         fi(12 * S), MUTED)

    save(im, "session_shape.png", W)


# ===========================================================================
# 2. OMEN DOSAGE — where each slow signal falls across sessions 1–12
# ===========================================================================
def omen_dosage():
    W, H = 980, 250
    im, d = canvas(W, H)

    text(d, (40, 30), "WHERE THE SLOW SIGNALS FALL", fb(17 * S), INK, spacing_px=2)
    text(d, (40, 56), "One every two sessions at the very most. Sessions 1 and 2 carry none — the world has to look normal first.",
         fi(13 * S), INK2)

    left, right = 60, W - 50
    lane = 128
    span = right - left

    # adventure bands behind the axis
    advs = [(1, 2, "1 · Papers"), (3, 4, "2 · The Empty Taper"), (5, 6, "3 · Hesper"),
            (7, 8, "4 · Marrow"), (9, 12, "5 · The Harvest Fair")]
    for i, (a, b, name) in enumerate(advs):
        x0 = left + (a - 1) / 12.0 * span
        x1 = left + b / 12.0 * span
        rect(d, (x0, lane - 34, x1 - 3, lane - 12), fill=ZEBRA if i % 2 else BOXBG)
        text(d, ((x0 + x1) / 2 - 1, lane - 29), name, fr(11 * S), INK2, anchor="ma")

    # axis
    d.line([(left * S, lane * S), (right * S, lane * S)], fill=INK, width=2 * S)

    omens = {
        3: ("Birds\nquiet", ACCENT),
        6: ("Hesper's\nburn fails", ACCENT),
        8: ("A name on\nthe stone", ACCENT),
        10: ("Arrivals\nfrom inland", ACCENT),
        12: ("Sudden\nrest", GOOD),
    }

    for s in range(1, 13):
        px = left + (s - 0.5) / 12.0 * span
        has = s in omens
        d.line([(px * S, (lane - 6) * S), (px * S, (lane + 6) * S)], fill=MUTED, width=2 * S)
        text(d, (px, lane + 12), str(s), fb(12 * S) if has else fr(12 * S),
             INK if has else MUTED, anchor="ma")
        if has:
            label, col = omens[s]
            d.ellipse([(px - 6) * S, (lane - 6) * S, (px + 6) * S, (lane + 6) * S], fill=col)
            yy = lane + 36
            for ln in label.split("\n"):
                text(d, (px, yy), ln, fb(11 * S), col, anchor="ma")
                yy += 15
        else:
            d.ellipse([(px - 3) * S, (lane - 3) * S, (px + 3) * S, (lane + 3) * S], fill=LINE)

    # The empty zone sits in the label lane, directly under sessions 1 and 2,
    # so it reads as "these two sessions carry no signal" rather than floating.
    x0 = left + 4
    x1 = left + 2 / 12.0 * span - 6
    rect(d, (x0, lane + 34, x1, lane + 58), fill=(0xFB, 0xED, 0xEC))
    text(d, ((x0 + x1) / 2, lane + 41), "NOTHING HERE", fb(10 * S), CRIT, anchor="ma")

    text(d, (40, H - 40), "None of these can be solved. A table that investigates the quiet birds learns that the birds are quiet.",
         fi(12 * S), MUTED)

    save(im, "omen_dosage.png", W)


# ===========================================================================
# 3. NPC STATES — six people, three outcomes each
# ===========================================================================
def npc_states():
    W = 980
    rows = [
        ("Oren", "Gatekeeper", "Ally in the guard", "Demoted, bitter", "Promoted — must refuse them"),
        ("Bram Locke", "Guild agent", "Funds Arc 2", "Sells their location", "Ruined, and useful"),
        ("Keeper Marrow", "The shrine", "Gives the name, walks with them", "Dies before saying it", "Tells the wrong person"),
        ("Warden Alder", "Concord inspector", "Turns ally in Arc 3", "Hardens into the crackdown", "Knows, chooses the institution"),
        ("Calla Wren", "Envoy", "Opens Bellmoor", "Deals with the antagonist", "Takes over the Concord"),
        ("Hesper Vane", "Unlicensed healer", "Legalised, trains others", "Dead or imprisoned", "Underground, radicalised"),
    ]
    rh = 52
    head = 118
    H = head + rh * len(rows) + 54
    im, d = canvas(W, H)

    text(d, (40, 30), "THE SIX, AND THE THREE WAYS EACH ARC CAN END FOR THEM", fb(17 * S), INK, spacing_px=2)
    text(d, (40, 56), "You do not choose the state. The table causes it, and you write it down afterwards.",
         fi(13 * S), INK2)

    c0, c1 = 40, 210
    colw = (W - 50 - c1) / 3.0
    heads = [("IF IT GOES WELL", GOOD), ("IF IT GOES BADLY", CRIT), ("THE THIRD ROAD", WARN)]
    for i, (h, col) in enumerate(heads):
        x = c1 + i * colw
        rect(d, (x, head - 26, x + colw - 8, head - 4), fill=col)
        text(d, (x + 10, head - 21), h, fb(11 * S), WHITE, spacing_px=1.2)

    y = head
    for i, (name, role, a, b, cc) in enumerate(rows):
        if i % 2:
            rect(d, (c0, y, W - 50, y + rh), fill=ZEBRA)
        text(d, (c0 + 4, y + 12), name, fb(13 * S), INK)
        text(d, (c0 + 4, y + 30), role, fr(11 * S), MUTED)
        for j, cell in enumerate([a, b, cc]):
            x = c1 + j * colw
            col = [GOOD, CRIT, WARN][j]
            d.line([(x * S, (y + 10) * S), (x * S, (y + rh - 10) * S)], fill=col, width=3 * S)
            lines = wrap(d, cell, fr(12 * S), colw - 26)
            yy = y + (rh - len(lines) * 17) / 2 + 2
            for ln in lines[:2]:
                text(d, (x + 12, yy), ln, fr(12 * S), INK)
                yy += 17
        d.line([(c0 * S, (y + rh) * S), ((W - 50) * S, (y + rh) * S)], fill=LINE, width=1 * S)
        y += rh

    text(d, (40, y + 16), "A state is a consequence, never a plan. Decide it after the arc, from what actually happened.",
         fi(12 * S), MUTED)

    save(im, "npc_states.png", W)


if __name__ == "__main__":
    print("figures ->", OUT)
    session_shape()
    omen_dosage()
    npc_states()
