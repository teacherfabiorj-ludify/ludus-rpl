"""
LUDUS — Painel da Turma  (o arquivo do professor · NUNCA compartilhado)

    python3 planilhas/src/export_units.py   ← 1º
    node core/export.js                    ← 2º
    python3 planilhas/src/build_painel.py

Abas:  LEIA-ME · PAINEL · QUADRO · REFERENCIA

PAINEL   dez colunas digitadas, onze calculadas. O professor digita nível,
         unidade e lição do ciclo, e o Language Focus, as ações, quem
         apresenta, a próxima lição e o lembrete saem sozinhos da REFERENCIA.
QUADRO   o bloco público. É a ÚNICA aba que sai deste arquivo: o Quadro da
         Turma lê QUADRO!A1:I5 por IMPORTRANGE. Nota, tentativa e alerta
         ficam no PAINEL e não aparecem aqui.
REFERENCIA  as 72 unidades do Evolve, vindas de core/units.json — o MESMO
            arquivo que o Core Book imprime.
"""

import os

from openpyxl import Workbook

from _common import (BORDER, FILL_CALC, FILL_NOTE, FILL_PRIV, FILL_TYPE,
                     F_BODY, F_LABEL, F_SMALL, HERE, OUT, WRAP, core,
                     freeze, header_row, leia_me, note, paint, title, widths)

C = core()
GAME = C["brand"]["GAME_NAME"]
VERSION = C["brand"]["VERSION"]
CYCLE = C["method"]["lessonCycle"]
PASS = C["method"]["PASS_MARK"]
SOFTCAP = C["method"]["testRule"]["softCap"]
QUIZ = C["method"]["TEST_NAME"]
LP = C["system"]["languagePoints"]

ROWS = 4          # quatro alunos
R0 = 4            # primeira linha de aluno na aba PAINEL
REF0 = 2          # primeira linha de dado na REFERENCIA


# ---------------------------------------------------------------------------
# REFERENCIA — as 72 unidades, vindas de core/units.json
#
# ⚠ Até 16/09 este script lia o Catalogo-Etiquetas-Evolve.xlsx direto, e o Core
# Book não tinha como imprimir a mesma tabela sem redigitá-la. Agora os dois
# leem o mesmo arquivo. Rode antes:  python3 planilhas/src/export_units.py
# ---------------------------------------------------------------------------
def read_units():
    U = C["units"]["units"]
    return [[u["key"], u["cefr"], u["level"], u["unit"], u["title"],
             u["lesson1"], u["lesson2"], u["action1"], u["action2"],
             "conferida" if u["checked"] == "inferred" else "⚠ CONFERIR"]
            for u in U]


CAT = read_units()
REF_LAST = REF0 + len(CAT) - 1


def ref(col):
    """Intervalo absoluto de uma coluna da REFERENCIA."""
    return f"REFERENCIA!${col}${REF0}:${col}${REF_LAST}"


# ---------------------------------------------------------------------------
def sheet_painel(wb):
    ws = wb.create_sheet("PAINEL")
    widths(ws, {"A": 16, "B": 8, "C": 9, "D": 8, "E": 8, "F": 11, "G": 11,
                "H": 11, "I": 10, "J": 8, "K": 22, "L": 30, "M": 30, "N": 30,
                "O": 22, "P": 13, "Q": 11, "R": 46, "S": 9, "T": 28, "U": 7})
    r = title(ws, 1, f"PAINEL DA TURMA · {GAME}",
              "Amarelo você digita. Azul se calcula. Vermelho é privado e nunca sai deste arquivo.")

    head = ["ALUNO", "EVOLVE", "UNIDADE", "LIÇÃO", "GROWTH",
            "LIÇÃO DE CASA?", "USOU O FOCUS?", "APRESENTOU?", "TENT.", "QUIZ %",
            "TÍTULO DA UNIDADE", "LIÇÃO 1 (tópico)", "LIÇÃO 2 (tópico)",
            "LANGUAGE FOCUS DE HOJE", "AÇÕES", "APRESENTA?", "PRÓX. LIÇÃO",
            "LEMBRETE — PRÓXIMA AULA", "LP", "ALERTA — PRIVADO", "motor"]
    header_row(ws, 3, head)

    for i in range(ROWS):
        r = R0 + i
        ws.cell(r, 1, f"Aluno {i + 1}")
        ws.cell(r, 2, 1)
        ws.cell(r, 3, 1)
        ws.cell(r, 4, "A")
        ws.cell(r, 5, 1)
        for col in ("F", "G", "H"):
            ws[f"{col}{r}"] = "não"
        ws.cell(r, 9, 0)

        m = f"$U{r}"
        ws[f"U{r}"] = f'=IFERROR(MATCH("E"&$B{r}&"-U"&$C{r},{ref("A")},0),0)'
        ws[f"K{r}"] = f'=IF({m}=0,"⚠ unidade não encontrada",INDEX({ref("E")},{m}))'
        ws[f"L{r}"] = f'=IF({m}=0,"—",INDEX({ref("F")},{m}))'
        ws[f"M{r}"] = f'=IF({m}=0,"—",INDEX({ref("G")},{m}))'
        ws[f"N{r}"] = (f'=IF($D{r}="X",$L{r}&"   +   "&$M{r},'
                       f'IF(OR($D{r}="A",$D{r}="B"),$L{r},$M{r}))')
        ws[f"O{r}"] = (f'=IF({m}=0,"—",IF(INDEX({ref("I")},{m})="—",INDEX({ref("H")},{m}),'
                       f'INDEX({ref("H")},{m})&" / "&INDEX({ref("I")},{m})))')
        ws[f"P{r}"] = f'=IF(OR($D{r}="B",$D{r}="D"),"SIM — 1 min","não")'
        ws[f"Q{r}"] = (f'=IF($D{r}="A","B",IF($D{r}="B","C",IF($D{r}="C","D",'
                       f'IF(OR($D{r}="D",$D{r}="X"),"A (unidade seguinte)","—"))))')
        ws[f"R{r}"] = (
            f'=IF($D{r}="A","Próxima aula do ciclo: B — você apresenta ~1 min sobre: "&$L{r},'
            f'IF($D{r}="B","Próxima aula do ciclo: C — tópico novo: "&$M{r},'
            f'IF($D{r}="C","Próxima aula do ciclo: D — você apresenta ~1 min sobre: "&$M{r},'
            f'IF($D{r}="D","Próxima aula: unidade nova, lição A. O teste desta unidade é liberado hoje.",'
            f'IF($D{r}="X","Aula extra: revisão dos dois tópicos desta unidade.","—")))))')
        ws[f"S{r}"] = (f'=IF($F{r}="sim",1,0)+IF($G{r}="sim",1,0)+IF($H{r}="sim",1,0)')
        ws[f"T{r}"] = (
            f'=IF($J{r}="","—",IF($J{r}>={PASS},"ok — avança e volta ao A",'
            f'IF($I{r}>={SOFTCAP},"⚠ {SOFTCAP} tentativas sem passar — converse antes da próxima",'
            f'"abaixo de {PASS} — pode refazer")))')

        paint(ws, r, list("ABCDEFGHIJ"), FILL_TYPE)
        paint(ws, r, list("KLMNOPQRS"), FILL_CALC)
        paint(ws, r, ["T"], FILL_PRIV)
        paint(ws, r, ["U"], FILL_NOTE)
        ws.row_dimensions[r].height = 46

    n = R0 + ROWS + 1
    n = note(ws, n, "COMO USAR — dez minutos antes da sessão", F_LABEL)
    for line in [
        "Digite três coisas por aluno: EVOLVE, UNIDADE e LIÇÃO do ciclo (A, B, C, D ou X). Tudo de K a S se calcula.",
        "Depois da sessão, no debrief: marque sim/não em LIÇÃO DE CASA, USOU O FOCUS e APRESENTOU. A coluna LP é o que o aluno terá para gastar NA PRÓXIMA sessão — anuncie em voz alta, e é o aluno que anota na ficha dele.",
        f"O LP é pago pela TENTATIVA, nunca pelo acerto. {LP['lawOfTheAttempt']}",
        "Uma vez por semana, lance TENTATIVAS e NOTA lendo as respostas do " + QUIZ + " no Google Forms. A lição de casa fica no Cambridge One e a plataforma corrige sozinha — você não lança nada dela.",
        "",
        "UMA HORA DE AULA = UMA LIÇÃO DO CICLO. Grupo de um encontro de 2h avança a coluna LIÇÃO duas vezes; grupo de dois encontros de 1h avança uma vez por encontro. Todo grupo faz duas lições por semana e uma unidade a cada duas semanas — não existe formato mais rápido.",
        "",
        "NADA das colunas I, J e T sai deste arquivo. O Quadro da Turma só enxerga a aba QUADRO.",
    ]:
        n = note(ws, n, line, F_BODY if line else F_SMALL)
    freeze(ws, "B4")
    return ws


# ---------------------------------------------------------------------------
def sheet_quadro(wb):
    ws = wb.create_sheet("QUADRO")
    widths(ws, {"A": 16, "B": 9, "C": 34, "D": 8, "E": 32, "F": 13, "G": 24,
                "H": 9, "I": 48})
    header_row(ws, 1, ["ALUNO", "GROWTH", "ONDE VOCÊ ESTÁ", "LIÇÃO",
                       "LANGUAGE FOCUS DE HOJE", "APRESENTA HOJE?", "AÇÕES",
                       "LP PARA ESTA SESSÃO", "LEMBRETE — PRÓXIMA AULA"])
    for i in range(ROWS):
        q, p = 2 + i, R0 + i
        ws.cell(q, 1, f"=PAINEL!A{p}")
        ws.cell(q, 2, f"=PAINEL!E{p}")
        ws.cell(q, 3, f'="Evolve "&PAINEL!B{p}&" · Unit "&PAINEL!C{p}&" — "&PAINEL!K{p}')
        ws.cell(q, 4, f"=PAINEL!D{p}")
        ws.cell(q, 5, f"=PAINEL!N{p}")
        ws.cell(q, 6, f"=PAINEL!P{p}")
        ws.cell(q, 7, f"=PAINEL!O{p}")
        ws.cell(q, 8, f"=PAINEL!S{p}")
        ws.cell(q, 9, f"=PAINEL!R{p}")
        paint(ws, q, list("ABCDEFGHI"), FILL_CALC)
        ws.row_dimensions[q].height = 40

    n = ROWS + 4
    n = note(ws, n, "ESTA É A ÚNICA ABA QUE SAI DESTE ARQUIVO", F_LABEL)
    for line in [
        "O Quadro da Turma lê exatamente QUADRO!A1:I5 por IMPORTRANGE. Nada fora deste retângulo é alcançável a partir de uma ficha de aluno.",
        "Não tem nota. Não tem tentativa. Não tem alerta. Por construção, não por disciplina.",
        "Não digite nada aqui: as nove colunas são espelho do PAINEL.",
        "A coluna LP é o que você anunciou no debrief passado. Quem controla o saldo durante a sessão é o aluno, na ficha dele — esta coluna é a conferência, não o placar.",
    ]:
        n = note(ws, n, line, F_BODY)
    return ws


# ---------------------------------------------------------------------------
def sheet_referencia(wb):
    ws = wb.create_sheet("REFERENCIA")
    widths(ws, {"A": 10, "B": 7, "C": 8, "D": 6, "E": 26, "F": 44, "G": 44,
                "H": 18, "I": 18, "J": 12})
    header_row(ws, 1, ["CHAVE", "NÍVEL", "EVOLVE", "UN.", "TÍTULO",
                       "LIÇÃO 1 (tópico)", "LIÇÃO 2 (tópico)", "AÇÃO 1",
                       "AÇÃO 2", "CONFERIDO?"])
    for i, row in enumerate(CAT):
        r = REF0 + i
        for j, v in enumerate(row):
            c = ws.cell(r, j + 1, v)
            c.font, c.alignment, c.border = F_BODY, WRAP, BORDER
    freeze(ws, "A2")
    return ws


# ---------------------------------------------------------------------------
def build():
    wb = Workbook()
    wb.remove(wb.active)
    sheet_painel(wb)
    sheet_quadro(wb)
    sheet_referencia(wb)

    leia_me(wb, [
        f"{VERSION}  ·  gerado de core/core.json por planilhas/src/build_painel.py",
        "",
        "## O que é este arquivo",
        "O painel do professor. Ele NUNCA é compartilhado com aluno nenhum, e não precisa ser: dele sai um bloco público (a aba QUADRO) que alimenta o Quadro da Turma, e é o Quadro que as fichas leem.",
        "",
        "## A corrente",
        "PAINEL  →  QUADRO (aba deste arquivo)  →  Quadro da Turma (arquivo separado, somente leitura)  →  ficha de cada aluno",
        "",
        "Nenhum arquivo que um aluno consiga editar aponta para este. É essa a trava: o IMPORTRANGE é autorizado por arquivo inteiro, então bastaria um aluno trocar o intervalo para ler tudo.",
        "",
        "## Montagem, uma vez só",
        "1. Suba este arquivo no Drive, na pasta do GM, e abra-o.",
        "2. Arquivo → Salvar como Planilhas Google. Sem isso não existe IMPORTRANGE.",
        "3. Troque Aluno 1–4 pelos nomes reais, na coluna A da aba PAINEL.",
        "4. Copie o link. É ele que vai na célula amarela do Quadro da Turma.",
        "",
        "## Toda semana",
        "Antes da sessão: EVOLVE, UNIDADE e LIÇÃO de cada aluno. Três células por aluno.",
        "No debrief: sim/não em lição de casa, uso do Focus e apresentação. Sai o LP da próxima sessão.",
        "Uma vez por semana: tentativas e nota, lendo o Cambridge One.",
        "",
        "## Formato do grupo",
        "O ciclo conta LIÇÕES, não dias. Um grupo de um encontro por semana cobre duas lições por encontro; um grupo de dois encontros cobre uma por encontro. Nos dois casos, uma unidade leva duas semanas.",
        "",
        "## ⚠ A divisão lição 1 / lição 2 é inferida",
        "O catálogo traz a gramática por unidade, não por lição. A REFERENCIA corta no primeiro ponto e vírgula. A coluna CONFERIDO? marca o que ainda não foi checado no livro. Corrigir é editar uma célula da REFERENCIA — o PAINEL passa a ler o valor certo sozinho.",
    ], f"Painel da Turma · {GAME}", "O arquivo do professor. Nunca compartilhado.")

    out = os.path.join(OUT, "Painel-Turma-LUDUS.xlsx")
    wb.save(out)
    print("escrito:", out, f"· {len(CAT)} unidades na REFERENCIA")


if __name__ == "__main__":
    build()
