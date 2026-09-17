"""
LUDUS — Ficha de personagem  (UMA por aluno · ele edita)

    node core/export.js
    python3 planilhas/src/build_ficha.py

Abas: LEIA-ME · FICHA · REFERENCE

A FICHA segue exatamente as dez linhas do capítulo 3 do Player's Guide, na
mesma ordem, com os mesmos nomes. Quem leu o livro reconhece a ficha, e quem
olha a ficha acha o capítulo.

O bloco pedagógico (Growth, Language Focus, apresenta?, ações, Language
Points, lembrete) NÃO é digitado: vem do Quadro da Turma, e só a linha do
próprio aluno aparece. O resto da ficha é dele.
"""

import os

from openpyxl import Workbook
from openpyxl.worksheet.datavalidation import DataValidation

from _common import (BORDER, FILL_CALC, FILL_NOTE, FILL_TYPE, F_BODY, F_LABEL,
                     F_SMALL, F_TITLE, OUT, WRAP, core, header_row, leia_me,
                     note, paint, title, widths)

C = core()
S = C["system"]
GAME = C["brand"]["GAME_NAME"]
VERSION = C["brand"]["VERSION"]
KITS = C["doors"]["tallowCoast"]["archetypeKits"]
SLOTS = S["PACK_SLOTS"]
SPOT = S["spotlightTokens"]["start"]
SIG = S["signatureMoves"]

ENGINE = 70              # linha do IMPORTRANGE — espalha em A70:I74
LOOK = f"$A${ENGINE}:$I${ENGINE + 4}"


def block(ws, r, label):
    c = ws.cell(r, 1, label)
    c.font = F_LABEL
    c.fill = FILL_NOTE
    ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=3)
    return r + 1


def field(ws, r, label, value="", fill=FILL_TYPE, hint=""):
    ws.cell(r, 1, label).font = F_BODY
    c = ws.cell(r, 2, value)
    c.fill, c.font, c.border, c.alignment = fill, F_BODY, BORDER, WRAP
    if hint:
        h = ws.cell(r, 3, hint)
        h.font = F_SMALL
        h.alignment = WRAP
    return r + 1


def pulled(ws, r, label, col_index, hint=""):
    """Linha azul puxada do Quadro pela coluna col_index (1 = ALUNO)."""
    return field(
        ws, r, label,
        f'=IFERROR(VLOOKUP($B$5,{LOOK},{col_index},FALSE),"—")',
        FILL_CALC, hint)


def sheet_ficha(wb):
    ws = wb.create_sheet("FICHA")
    widths(ws, {"A": 26, "B": 46, "C": 52})
    ws.cell(1, 1, f"FICHA DE PERSONAGEM · {GAME}").font = F_TITLE
    ws.cell(2, 1, "Amarelo é seu: preencha à mão. Azul vem do Quadro da Turma — não edite.").font = F_SMALL

    r = 4
    r = block(ws, r, "1 — QUEM VOCÊ É")
    r = field(ws, r, "Seu nome na turma", "Aluno 1",
              hint="Escreva EXATAMENTE como está no painel. É por este nome que a ficha acha a sua linha.")
    r = field(ws, r, "Nome do personagem")
    r = field(ws, r, "Setting (a Porta)", "The Tallow Coast")
    r = field(ws, r, "People")
    r = field(ws, r, "Lineage ou Gift")
    arch_row = r
    r = field(ws, r, "Archetype", KITS[1][0],
              hint="Vanguard · Diplomat · Strategist · Scout")

    dv = DataValidation(type="list",
                        formula1='"' + ",".join(k[0] for k in KITS) + '"',
                        allow_blank=True)
    ws.add_data_validation(dv)
    dv.add(ws.cell(arch_row, 2))

    r += 1
    r = block(ws, r, "2 — ESTA SESSÃO   ·   vem do Quadro da Turma, não edite")
    r = pulled(ws, r, "Growth Level", 2)
    r = pulled(ws, r, "Onde você está", 3, hint="Seu nível e unidade do Evolve.")
    r = pulled(ws, r, "Lição do ciclo", 4, hint="A · B · C · D · X")
    r = pulled(ws, r, "Language Focus de hoje", 5)
    r = pulled(ws, r, "Você apresenta hoje?", 6)
    r = pulled(ws, r, "Suas ações", 7)
    r = pulled(ws, r, "Lembrete — próxima aula", 9)

    r += 1
    r = block(ws, r, "3 — SEUS RECURSOS   ·   você gerencia, você desconta")
    r = field(ws, r, "Language Points", 0, FILL_TYPE,
              hint="No fim de cada sessão o GM anuncia quantos você terá na próxima. Anote aqui e "
                   "risque um a cada vez que gastar. Zera no fim da sessão.")
    r = field(ws, r, "Spotlight Tokens", SPOT, FILL_TYPE,
              hint=f"{SPOT} no começo de toda sessão, {S['spotlightTokens']['maxPerScene']} por cena. "
                   "Dá para passar um a outro aluno, dizendo em inglês por quê. Volta a "
                   f"{SPOT} na sessão seguinte.")

    r += 1
    r = block(ws, r, "4 — SEUS FOCUSES   ·   +2, +1, +0 e −1, um em cada")
    header_row(ws, r, ["FOCUS", "SEU VALOR", "QUANDO ELE APARECE"])
    r += 1
    for name, _tag, when in S["focuses"]:
        r = field(ws, r, name, "", FILL_TYPE, when)

    r += 1
    r = block(ws, r, f"5 — SIGNATURE MOVES   ·   até {SIG['perCharacter']} ao longo da carreira")
    r = field(ws, r, "Signature Move", "", hint=SIG["main"])
    r = field(ws, r, f"Cross-Training 1  (Growth {SIG['crossTrainingAt'][0]})", "",
              hint="Tier 1 de OUTRO Archetype. Fica no Tier 1 para sempre.")
    r = field(ws, r, f"Cross-Training 2  (Growth {SIG['crossTrainingAt'][1]})", "",
              hint="O segundo, de um Archetype diferente do primeiro. Também fica no Tier 1.")

    r += 1
    r = block(ws, r, "6 — O QUE VOCÊ CARREGA")
    kit_row = r
    r = field(ws, r, "Kit",
              f'=IFERROR(VLOOKUP($B${arch_row},REFERENCE!$A$3:$B$6,2,FALSE),"—")',
              FILL_CALC,
              hint="Vem do Archetype e da Porta. Nunca é contado e nunca ocupa slot.")
    for i in range(SLOTS):
        r = field(ws, r, f"Pack — slot {i + 1}", "",
                  hint=S["packFullRule"] if i == 0 else "")
    r = field(ws, r, "Boons", "",
              hint="Só em Growth Moment. Não ocupam slot. Nunca somam no dado.")

    r += 1
    r = block(ws, r, "7 — DINHEIRO   ·   coin → handful → bag → chest, dez de um faz um do seguinte")
    for i, (rung, means) in enumerate(S["moneyLadder"]):
        default = 3 if rung == "A handful" else 0
        r = field(ws, r, rung, default, FILL_TYPE, means)
    r = note(ws, r, f'Você começa com {S["startingMoney"]["amount"]}. Pergunta de sessão zero: "{S["startingMoney"]["question"]}"', F_SMALL)

    r += 1
    r = block(ws, r, "8 — ANOTAÇÕES   ·   nomes, promessas, dívidas")
    for _ in range(4):
        r = field(ws, r, "", "")

    # ---- motor -----------------------------------------------------------
    r = ENGINE - 3
    ws.cell(r, 1, "COLE AQUI O LINK DO QUADRO DA TURMA →").font = F_LABEL
    v = ws.cell(r, 2, "cole o link do Quadro da Turma aqui")
    v.fill, v.font, v.border, v.alignment = FILL_TYPE, F_BODY, BORDER, WRAP
    quadro_cell = f"$B${r}"

    ws.cell(ENGINE - 1, 1,
            "▼ MOTOR — a ligação com o Quadro. Não edite e não apague.").font = F_SMALL
    f = ws.cell(ENGINE, 1, f'=IMPORTRANGE({quadro_cell},"QUADRO!A1:I5")')
    f.font, f.border = F_BODY, BORDER

    n = ENGINE + 6
    for line in [
        "PRIMEIRA VEZ QUE VOCÊ ABRIR ESTA FICHA",
        f"Desça até a célula A{ENGINE}. Ela vai estar com #REF! e um botão Permitir acesso. Clique no botão. Uma vez só, e nunca mais pede nada.",
        "Pronto — o bloco azul lá em cima se preenche sozinho.",
        "",
        "Só a SUA linha aparece lá em cima. Este bloco de baixo é o motor da ligação: não é para ler, e não é para apagar.",
    ]:
        n = note(ws, n, line, F_LABEL if line.isupper() else F_BODY)
    return ws


def sheet_reference(wb):
    ws = wb.create_sheet("REFERENCE")
    widths(ws, {"A": 22, "B": 62, "C": 46, "D": 30})

    ws.cell(1, 1, "REFERENCE — não edite nada aqui").font = F_LABEL
    header_row(ws, 2, ["ARCHETYPE", "YOUR KIT"])
    r = 3
    for name, kit in KITS:
        ws.cell(r, 1, name).font = F_BODY
        c = ws.cell(r, 2, kit)
        c.font, c.alignment, c.border = F_BODY, WRAP, BORDER
        r += 1

    r += 1
    header_row(ws, r, ["BAND", "MEANS"])
    r += 1
    for band, _kind, label, meaning in S["outcomeBands"]:
        ws.cell(r, 1, f"{band}  {label}").font = F_BODY
        c = ws.cell(r, 2, meaning)
        c.font, c.alignment = F_BODY, WRAP
        r += 1

    r += 1
    header_row(ws, r, ["MOVE", "FOCUS", "YOU USE IT…"])
    r += 1
    for m in S["moves"]:
        ws.cell(r, 1, m["name"]).font = F_BODY
        ws.cell(r, 2, m["focus"]).font = F_BODY
        c = ws.cell(r, 3, "…" + m["trigger"])
        c.font, c.alignment = F_BODY, WRAP
        r += 1

    r += 1
    header_row(ws, r, ["HOW FAR", "MEANS"])
    r += 1
    for d, means in S["distanceLadder"]:
        ws.cell(r, 1, d).font = F_BODY
        c = ws.cell(r, 2, means)
        c.font, c.alignment = F_BODY, WRAP
        r += 1

    r += 1
    header_row(ws, r, ["LANGUAGE POINTS", ""])
    r += 1
    for why, how in S["languagePoints"]["earn"]:
        ws.cell(r, 1, how).font = F_BODY
        ws.cell(r, 2, why).font = F_BODY
        r += 1
    c = ws.cell(r, 2, S["languagePoints"]["lawOfTheAttempt"])
    c.font, c.alignment = F_SMALL, WRAP
    r += 2

    header_row(ws, r, ["SIGNATURE MOVES", ""])
    r += 1
    for lab, txt in [("O seu", SIG["main"]),
                     ("Cross-Training", SIG["crossTrainingRule"]),
                     ("Por quê", SIG["why"])]:
        ws.cell(r, 1, lab).font = F_BODY
        c = ws.cell(r, 2, txt)
        c.font, c.alignment = F_BODY, WRAP
        r += 1
    return ws


def build():
    wb = Workbook()
    wb.remove(wb.active)
    sheet_ficha(wb)
    sheet_reference(wb)
    leia_me(wb, [
        f"{VERSION}  ·  gerado de core/core.json por planilhas/src/build_ficha.py",
        "",
        "## Uma ficha por aluno. Nunca uma planilha para a mesa inteira.",
        "Abas de aluno dentro de um arquivo só não são segurança: quem edita desesconde, quem lê extrai pelo código-fonte. Um arquivo por aluno resolve isso sem truque nenhum.",
        "",
        "## Montagem, por aluno",
        "1. Suba este arquivo no Drive e abra.",
        "2. Arquivo → Salvar como Planilhas Google.",
        "3. Guarde como MODELO na pasta Biblioteca. Para cada aluno, faça uma cópia e renomeie com o nome dele.",
        "4. Em cada cópia: escreva o nome do aluno na célula B5 da aba FICHA, exatamente como está no Painel, e cole o link do Quadro da Turma na célula amarela do motor, lá embaixo.",
        "5. Poste no Classroom como MATERIAL dirigido àquele aluno, com permissão de edição.",
        "",
        "## Amarelo e azul",
        "Amarelo o aluno preenche à mão: personagem, Focuses, Signature Moves, Pack, Boons, dinheiro, anotações — e os RECURSOS.",
        "Language Points e Spotlight Tokens são do aluno. O GM anuncia o total no debrief; o aluno anota e risca conforme gasta. Gerenciar o próprio recurso em voz alta, em inglês, faz parte do exercício — não é papel de planilha.",
        "Azul vem do Quadro da Turma e não se edita: Growth, onde ele está na trilha, a lição do ciclo, o Language Focus de hoje, se apresenta, as ações, os Language Points e o lembrete da próxima aula.",
        "",
        "## Por que só a linha dele aparece",
        "O motor no rodapé importa o quadro inteiro — é ele que mostra o botão Permitir acesso, e por isso fica visível. O bloco azul lá em cima usa VLOOKUP pelo nome em B5 e mostra só a linha do próprio aluno. Ver a linha dos colegas não seria problema de segurança; é só ruído que não ajuda ninguém.",
        "",
        "## A ficha segue o livro",
        "As sete seções são as dez linhas do capítulo 3 do Player's Guide, na mesma ordem e com os mesmos nomes. Se o livro mudar, este arquivo é regerado de core/core.json — não se edita à mão.",
    ], f"Ficha de personagem · {GAME}", "Uma por aluno. O aluno edita o que é dele.")

    out = os.path.join(OUT, "Ficha-Personagem-LUDUS.xlsx")
    wb.save(out)
    print("escrito:", out)


if __name__ == "__main__":
    build()
