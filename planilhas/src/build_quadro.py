"""
LUDUS — Quadro da Turma  (a turma inteira vê · SOMENTE LEITURA)

    node core/export.js
    python3 planilhas/src/build_quadro.py

Um arquivo, duas abas. É o intermediário da corrente:

    Painel (do professor)  →  ESTE ARQUIVO  →  ficha de cada aluno

Ele existe por um motivo só: o IMPORTRANGE é autorizado por ARQUIVO INTEIRO,
não por intervalo. Se a ficha de um aluno apontasse direto para o Painel,
bastaria ele trocar o intervalo dentro da fórmula para ler notas, tentativas e
alertas da turma toda. Apontando para cá, o máximo que ele alcança é o que já
podia abrir.
"""

import os

from openpyxl import Workbook

from _common import (BORDER, FILL_CALC, FILL_TYPE, F_BODY, F_LABEL, F_SMALL,
                     OUT, WRAP, core, header_row, leia_me, note, paint, title,
                     widths)

C = core()
GAME = C["brand"]["GAME_NAME"]
VERSION = C["brand"]["VERSION"]

IMPORT_ROW = 5          # onde o IMPORTRANGE mora — espalha em A5:I9
ROWS = 4


def sheet_quadro(wb):
    ws = wb.create_sheet("QUADRO")
    widths(ws, {"A": 16, "B": 9, "C": 34, "D": 8, "E": 32, "F": 13, "G": 24,
                "H": 9, "I": 48})
    title(ws, 1, f"QUADRO DA TURMA · {GAME}",
          "Tudo aqui vem do Painel. Ninguém digita nada nesta planilha — nem o professor.")

    c = ws.cell(3, 1, "COLE AQUI O LINK DO PAINEL →")
    c.font = F_LABEL
    v = ws.cell(3, 2, "cole o link da planilha Painel-Turma aqui")
    v.fill, v.font, v.border, v.alignment = FILL_TYPE, F_BODY, BORDER, WRAP
    ws.merge_cells(start_row=3, start_column=2, end_row=3, end_column=6)

    f = ws.cell(IMPORT_ROW, 1, '=IMPORTRANGE($B$3,"QUADRO!A1:I5")')
    f.font, f.border = F_BODY, BORDER

    n = IMPORT_ROW + ROWS + 3
    n = note(ws, n, "PRIMEIRA VEZ: A CÉLULA A5 VAI MOSTRAR #REF!", F_LABEL)
    for line in [
        "Clique na célula A5 e aperte o botão Permitir acesso. É isso que autoriza o IMPORTRANGE. Acontece uma vez na vida, e depois nunca mais pede nada.",
        "Antes disso, cole o link do Painel na célula amarela B3.",
        "",
        "## O que este arquivo NÃO tem",
        "Não tem nota. Não tem tentativa. Não tem alerta. Não tem nada que o aluno não possa ver.",
        "É por isso que ele pode ser compartilhado com a turma inteira — e é ele, não o Painel, que as fichas leem.",
        "",
        "## Como compartilhar",
        "Compartilhar → Acesso geral → Qualquer pessoa com o link → papel LEITOR. Nunca Editor: ninguém precisa digitar aqui.",
        "No Classroom, poste como MATERIAL no tópico Quick Reference.",
    ]:
        if line.startswith("## "):
            n = note(ws, n, line[3:], F_LABEL)
        else:
            n = note(ws, n, line, F_BODY if line else F_SMALL)
    return ws


def build():
    wb = Workbook()
    wb.remove(wb.active)
    sheet_quadro(wb)
    leia_me(wb, [
        f"{VERSION}  ·  gerado de core/core.json por planilhas/src/build_quadro.py",
        "",
        "## Para que serve",
        "Este é o arquivo do meio. O Painel do professor tem tudo — nota, tentativa, alerta. A ficha do aluno tem o personagem. Entre os dois entra este, somente leitura, com só o que pode ser público.",
        "",
        "## Montagem, uma vez só",
        "1. Suba no Drive, na pasta da turma (não na pasta GM), e abra.",
        "2. Arquivo → Salvar como Planilhas Google.",
        "3. Cole o link do Painel na célula amarela B3 da aba QUADRO.",
        "4. Clique na célula A5 (vai estar com #REF!) e aperte Permitir acesso.",
        "5. Compartilhar → Qualquer pessoa com o link → Leitor. Copie o link: é ele que vai nas fichas e no Classroom.",
        "",
        "## Por que não ligar a ficha direto no Painel",
        "O IMPORTRANGE é autorizado por arquivo inteiro, não por intervalo. Autorizado uma vez na ficha de um aluno, ele troca A1:I5 por A1:Z200 — é um campo de texto, na planilha dele — e lê o Painel todo. Apontando para este arquivo, o máximo que ele alcança é o quadro que já podia abrir.",
        "",
        "## Atualização",
        "O IMPORTRANGE não é instantâneo: o Sheets recalcula a cada poucos minutos, ou na hora em que o arquivo é aberto. Para o uso real — você prepara antes, eles abrem na sessão — isso é invisível.",
    ], f"Quadro da Turma · {GAME}", "A turma inteira vê. Ninguém edita.")

    out = os.path.join(OUT, "Quadro-Turma-LUDUS.xlsx")
    wb.save(out)
    print("escrito:", out)


if __name__ == "__main__":
    build()
