"""Gera TODAS as imagens do Core Rulebook.

Rodar de qualquer lugar — as imagens sempre saem ao lado deste arquivo:
    python3 assets/make_figures.py

Produz:
    assets/flow_diagram.png     — os tres passos de um turno (Cap. 2)
    assets/bands_chart.png      — as 36 combinacoes de 2d6 (Cap. 2)
    assets/focus_cards.png      — os quatro Focuses (Cap. 3)
    assets/sheet_annotated.png  — a ficha anotada, 10 marcadores (Cap. 3)

Mantido junto do build.js de proposito: se a pasta assets sumir, este arquivo
reconstroi tudo. Nao depende de nada alem de Pillow e das fontes DejaVu.
"""
from PIL import Image, ImageDraw, ImageFont
import os

# Sempre grava ao lado deste arquivo, nao na pasta de onde o comando foi rodado.
OUT_DIR = os.path.dirname(os.path.abspath(__file__))

D = "/usr/share/fonts/truetype/dejavu/"
fb = lambda s: ImageFont.truetype(D + "DejaVuSans-Bold.ttf", s)
fr = lambda s: ImageFont.truetype(D + "DejaVuSans.ttf", s)
fi = lambda s: ImageFont.truetype(D + "DejaVuSans-Oblique.ttf", s)

# paleta identica a do build.js
ACC   = (42, 120, 214)
GOOD  = (12, 163, 12)
WARN  = (250, 178, 25)
CRIT  = (208, 59, 59)
INK   = (11, 11, 11)
INK2  = (82, 81, 78)
MUTED = (137, 135, 129)
LINE  = (196, 194, 188)
WHITE = (255, 255, 255)
BRAND = (210, 105, 30)
LOCK  = (237, 236, 232)
OPEN  = (255, 249, 224)
BLACK = (20, 19, 15)


def wrap(d, text, font, max_w):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if d.textlength(t, font=font) <= max_w:
            cur = t
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


# ---------------------------------------------------------------- 1. FLOW
def flow_diagram():
    W, H = 1660, 380
    im = Image.new("RGB", (W, H), WHITE)
    d = ImageDraw.Draw(im)
    steps = [
        ("1", "TRIGGER", "The fiction puts you in a situation one of the six Moves covers. You describe what you do."),
        ("2", "ROLL", "Roll 2d6 and add the Focus that Move uses: Courage, Empathy, Wit or Instinct."),
        ("3", "OUTCOME", "Read the total against the three bands. 10+ Strong Hit, 7-9 Mixed Result, 6 or under a Miss."),
    ]
    bw, gap, x0, top, bh = 470, 100, 40, 70, 240
    for i, (n, title, body) in enumerate(steps):
        x = x0 + i * (bw + gap)
        d.rounded_rectangle([x, top, x + bw, top + bh], radius=14, outline=INK, width=3, fill=WHITE)
        d.ellipse([x + 22, top + 22, x + 66, top + 66], fill=ACC)
        tw = d.textlength(n, font=fb(24))
        d.text((x + 44 - tw / 2, top + 31), n, font=fb(24), fill=WHITE)
        d.text((x + 82, top + 33), title, font=fb(23), fill=INK)
        yy = top + 92
        for ln in wrap(d, body, fr(17), bw - 56):
            d.text((x + 28, yy), ln, font=fr(17), fill=INK2)
            yy += 26
        if i < 2:
            ax = x + bw + 26
            ay = top + bh // 2
            d.line([ax, ay, ax + gap - 52, ay], fill=MUTED, width=4)
            d.polygon([(ax + gap - 52, ay - 11), (ax + gap - 52, ay + 11), (ax + gap - 30, ay)], fill=MUTED)
    im.save(os.path.join(OUT_DIR, "flow_diagram.png"))


# ---------------------------------------------------------------- 2. BANDS
def bands_chart():
    W, H = 1660, 620
    im = Image.new("RGB", (W, H), WHITE)
    d = ImageDraw.Draw(im)
    counts = {2:1, 3:2, 4:3, 5:4, 6:5, 7:6, 8:5, 9:4, 10:3, 11:2, 12:1}

    def band(t):
        return CRIT if t <= 6 else (WARN if t <= 9 else GOOD)

    left, base, bw, gap = 90, 500, 96, 40
    unit = 62  # altura por combinacao
    for i, total in enumerate(range(2, 13)):
        c = counts[total]
        x = left + i * (bw + gap)
        h = c * unit
        d.rectangle([x, base - h, x + bw, base], fill=band(total))
        lbl = str(total)
        d.text((x + bw / 2 - d.textlength(lbl, font=fb(24)) / 2, base + 16), lbl, font=fb(24), fill=INK)
        cl = f"{c}/36"
        d.text((x + bw / 2 - d.textlength(cl, font=fr(16)) / 2, base - h - 28), cl, font=fr(16), fill=MUTED)
    d.line([left - 20, base, left + 11 * (bw + gap) - gap + 20, base], fill=INK, width=3)
    d.text((left - 20, base + 54), "TOTAL ON 2d6", font=fb(16), fill=MUTED)

    # legenda
    ly = 40
    for col, txt in [(CRIT, "6 or under  —  Miss  (15/36)"),
                     (WARN, "7 to 9  —  Mixed Result  (15/36)"),
                     (GOOD, "10 or more  —  Strong Hit  (6/36)")]:
        d.rectangle([left, ly, left + 30, ly + 22], fill=col)
        d.text((left + 44, ly + 1), txt, font=fb(18), fill=INK)
        ly += 36
    im.save(os.path.join(OUT_DIR, "bands_chart.png"))


# ---------------------------------------------------------------- 3. FOCUSES
def focus_cards():
    cards = [
        ("Courage", (193, 68, 14), "DIRECT ACTION, PHYSICAL, CONFRONTATION",
         "The Focus you roll when you step toward danger instead of away from it — facing a threat head-on, pushing through, taking the risk."),
        ("Empathy", (181, 41, 127), "SOCIAL CONNECTION, PERSUASION, READING PEOPLE",
         "The Focus you roll when you deal with another person directly — negotiating, asking for help, understanding what someone really wants."),
        ("Wit", (42, 120, 214), "PROBLEM-SOLVING, CLEVERNESS, INVESTIGATION",
         "The Focus you roll when you outthink a situation — working an angle, spotting a detail, finding the clever way through."),
        ("Instinct", (14, 140, 127), "PERCEPTION, REACTION, REFLEX",
         "The Focus you roll when you have to trust your gut, right now — reacting fast, noticing what's really going on before you can think it through."),
    ]
    W, H = 1660, 420
    im = Image.new("RGB", (W, H), WHITE)
    d = ImageDraw.Draw(im)
    cw, ch, gx, gy, x0, y0 = 800, 190, 60, 40, 0, 0
    for i, (name, col, sub, body) in enumerate(cards):
        x = x0 + (i % 2) * (cw + gx)
        y = y0 + (i // 2) * (ch + gy)
        d.rectangle([x, y, x + cw, y + ch], fill=(247, 247, 245), outline=LINE)
        d.rectangle([x, y, x + cw, y + 7], fill=col)
        d.text((x + 24, y + 26), name, font=fb(26), fill=INK)
        d.text((x + 24, y + 66), sub, font=fb(14), fill=col)
        yy = y + 96
        for ln in wrap(d, body, fr(17), cw - 52):
            d.text((x + 24, yy), ln, font=fr(17), fill=INK2)
            yy += 26
    im.save(os.path.join(OUT_DIR, "focus_cards.png"))


# ---------------------------------------------------------------- 4. SHEET
def sheet_annotated():
    W, H = 1700, 1244
    im = Image.new("RGB", (W, H), WHITE)
    d = ImageDraw.Draw(im)
    GREY = (110, 106, 97)
    GOLDBG = (251, 243, 220)

    def band(x, y, w, txt):
        d.rectangle([x, y, x + w, y + 30], fill=BLACK)
        d.text((x + 10, y + 8), txt, font=fb(15), fill=WHITE)
        return y + 30

    def row(x, y, w, label, value, locked=True, h=32, lw=210):
        d.rectangle([x, y, x + w, y + h], outline=LINE)
        d.rectangle([x + lw, y, x + w, y + h], fill=LOCK if locked else OPEN, outline=LINE)
        d.text((x + 10, y + h // 2 - 8), label, font=fb(14), fill=GREY)
        if value:
            d.text((x + lw + 10, y + h // 2 - 9), value, font=fr(15),
                   fill=INK if locked else (0, 0, 190))
        return y + h

    def marker(x, y, n):
        r = 17
        d.ellipse([x - r, y - r, x + r, y + r], fill=BRAND)
        t = str(n)
        bb = d.textbbox((0, 0), t, font=fb(18))
        d.text((x - (bb[2] - bb[0]) / 2, y - (bb[3] - bb[1]) / 2 - 3), t, font=fb(18), fill=WHITE)

    d.text((60, 26), "Ludify RPL", font=fb(30), fill=BRAND)
    d.text((285, 36), "·  CHARACTER SHEET", font=fb(20), fill=BLACK)
    LX, RX, CW = 90, 900, 700

    y = 90
    y = band(LX, y, CW, "WHO YOU ARE"); marker(LX - 32, y - 15, 1)
    y = row(LX, y, CW, "Player", "Ana")
    y = row(LX, y, CW, "Setting", "The Tallow Coast")
    y = row(LX, y, CW, "People", "Human")
    y = row(LX, y, CW, "Lineage / Gift", "Tidebound")
    y = row(LX, y, CW, "Archetype", "The Diplomat")
    y = row(LX, y, CW, "Growth Level", "1"); marker(LX - 32, y - 16, 2)
    y = row(LX, y, CW, "Character name", "Mira", locked=False)
    y += 22
    y = band(LX, y, CW, "FOCUSES  —  assign +2, +1, +0 and −1"); marker(LX - 32, y - 15, 3)
    for nm, v in [("Courage", "−1"), ("Empathy", "+1"), ("Wit", "+0"), ("Instinct", "+2")]:
        d.rectangle([LX, y, LX + CW, y + 30], outline=LINE)
        d.rectangle([LX + 210, y, LX + 280, y + 30], fill=OPEN, outline=LINE)
        d.text((LX + 10, y + 7), nm, font=fb(15), fill=ACC)
        d.text((LX + 236, y + 6), v, font=fb(16), fill=(0, 0, 190))
        y += 30
    y += 22
    y = band(LX, y, CW, "YOUR LANGUAGE FOCUS"); marker(LX - 32, y - 15, 4)
    y = row(LX, y, CW, "This week", "past simple — narrating what happened", lw=150)
    y = row(LX, y, CW, "Evolve unit", "Evolve 2 — U5", lw=150)
    y += 22
    y = band(LX, y, CW, "SIGNATURE MOVE"); marker(LX - 32, y - 15, 5)
    y = row(LX, y, CW, "Name / Tier", "Read the Room (Tier 1)", lw=150)

    y = 90
    y = band(RX, y, CW, "YOUR MOVES  —  roll 2d6 + Focus"); marker(RX - 32, y - 15, 6)
    for mv, fo in [("Face Danger", "Courage"), ("Parley", "Empathy"), ("Help or Interfere", "Empathy"),
                   ("Persuade or Manipulate", "Wit"), ("Act Under Pressure", "Instinct"),
                   ("Read the Scene", "Instinct")]:
        d.rectangle([RX, y, RX + CW, y + 27], outline=LINE)
        d.text((RX + 10, y + 6), mv, font=fb(14), fill=INK)
        d.text((RX + 330, y + 6), fo, font=fb(13), fill=ACC)
        y += 27
    y += 20
    y = band(RX, y, CW, "THIS SESSION  —  resets every session"); marker(RX - 32, y - 15, 7)
    for nm in ["Spotlight Tokens", "Language Points"]:
        d.rectangle([RX, y, RX + CW, y + 30], outline=LINE)
        d.text((RX + 10, y + 8), nm, font=fb(14), fill=GREY)
        for k in range(8):
            d.rectangle([RX + 210 + k * 58, y + 3, RX + 262 + k * 58, y + 27], fill=OPEN, outline=LINE)
        y += 30
    y += 20
    y = band(RX, y, CW, "KIT  /  PACK"); marker(RX - 32, y - 15, 8)
    y = row(RX, y, CW, "Kit", "a sealed letter · a silver ring · a warm cloak…", lw=110)
    y = row(RX, y, CW, "Pack", "six slots — empty", locked=False, lw=110)
    y += 20
    y = band(RX, y, CW, "BOONS"); marker(RX - 32, y - 15, 9)
    y = row(RX, y, CW, "Boon 1", "", lw=110)
    y += 20
    y = band(RX, y, CW, "MONEY  /  DISTANCE"); marker(RX - 32, y - 15, 10)
    for nm, n in [("Coins", 10), ("Handfuls", 10)]:
        d.rectangle([RX, y, RX + CW, y + 28], outline=LINE)
        d.text((RX + 10, y + 7), nm, font=fb(14), fill=GREY)
        for k in range(n):
            d.rectangle([RX + 120 + k * 56, y + 3, RX + 168 + k * 56, y + 25], fill=GOLDBG, outline=LINE)
        y += 28
    d.rectangle([RX, y, RX + CW, y + 28], outline=LINE)
    d.text((RX + 10, y + 7), "Within reach · Nearby · Far away · Out of sight", font=fb(14), fill=ACC)
    im.crop((0, 0, 1660, 745)).save(os.path.join(OUT_DIR, "sheet_annotated.png"))


if __name__ == "__main__":
    flow_diagram();    print(os.path.join(OUT_DIR, "flow_diagram.png"))
    bands_chart();     print(os.path.join(OUT_DIR, "bands_chart.png"))
    focus_cards();     print(os.path.join(OUT_DIR, "focus_cards.png"))
    sheet_annotated(); print(os.path.join(OUT_DIR, "sheet_annotated.png"))
