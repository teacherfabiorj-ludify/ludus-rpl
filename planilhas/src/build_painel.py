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
         Turma lê BOARD!A1:I5 por IMPORTRANGE. Nota, tentativa e alerta
         ficam no PAINEL e não aparecem aqui.
REFERENCIA  as 72 unidades do Evolve, vindas de core/units.json — o MESMO
            arquivo que o Core Book imprime.
"""

import os

from openpyxl import Workbook
from openpyxl.worksheet.datavalidation import DataValidation

from _common import (BORDER, FILL_CALC, FILL_NOTE, FILL_PRIV, FILL_TYPE, house_mark,
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
R0 = 6            # primeira linha de aluno na aba PAINEL
SET_ROW = 3       # a chave do formato: quantas lições nesta sessão
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
# O CICLO, EM FÓRMULA
#
# ⚠ 20/09/2026 — UMA HORA DE AULA = UMA LIÇÃO. Um grupo de um encontro de duas
# horas faz DUAS lições na mesma sessão; um grupo de dois encontros de uma hora
# faz uma por encontro. Até hoje o Painel só sabia de uma lição por sessão, e
# o grupo de sábado ficava com metade da sessão invisível para a ficha.
#
# A chave é UMA célula: C3, "lições nesta sessão", 1 ou 2. Não existem dois
# modelos — dois arquivos divergem no primeiro ajuste que só um deles recebe.
# ---------------------------------------------------------------------------
def nxt(letter):
    """A letra seguinte do ciclo. D e X caem no A da unidade seguinte."""
    return (f'IF({letter}="A","B",IF({letter}="B","C",IF({letter}="C","D",'
            f'IF(OR({letter}="D",{letter}="X"),"A",""))))')


def crosses_unit(letter):
    """Verdadeiro quando a hora seguinte já é de OUTRA unidade."""
    return f'OR({letter}="D",{letter}="X")'


def focus_for(letter, m, col_l, col_m):
    """O Language Focus de uma hora, dada a letra e o índice da unidade."""
    return (f'IF({m}=0,"—",IF({letter}="X",{col_l}&"   +   "&{col_m},'
            f'IF(OR({letter}="A",{letter}="B"),{col_l},{col_m})))')


# ---------------------------------------------------------------------------
def sheet_painel(wb):
    ws = wb.create_sheet("PAINEL")
    widths(ws, {"A": 16, "B": 8, "C": 9, "D": 8, "E": 8, "F": 11, "G": 11,
                "H": 11, "I": 10, "J": 8, "K": 22, "L": 30, "M": 30, "N": 38,
                "O": 22, "P": 18, "Q": 16, "R": 50, "S": 9, "T": 28, "U": 7,
                "V": 8, "W": 8, "X": 30})
    r = title(ws, 1, f"PAINEL DA TURMA · {GAME}",
              "Amarelo você digita. Azul se calcula. Vermelho é privado e nunca sai deste arquivo.")
    house_mark(ws, "F1", 48)

    # --- a chave do formato, uma por grupo ---------------------------------
    c = ws.cell(SET_ROW, 1, "LIÇÕES NESTA SESSÃO →")
    c.font = F_LABEL
    v = ws.cell(SET_ROW, 3, 2)
    v.fill, v.font, v.border = FILL_TYPE, F_BODY, BORDER
    dvf = DataValidation(type="list", formula1='"1,2"', allow_blank=False)
    ws.add_data_validation(dvf)
    dvf.add(v)
    ws.cell(SET_ROW, 4,
            "1 = grupo de DOIS encontros de 1h (uma lição por encontro).   "
            "2 = grupo de UM encontro de 2h (duas lições seguidas: a 1ª hora "
            "e a 2ª hora). Uma hora de aula é sempre uma lição do ciclo.").font = F_SMALL

    head = ["ALUNO", "EVOLVE", "UNIDADE", "LIÇÃO (1ª hora)", "GROWTH",
            "LIÇÃO DE CASA?", "USOU O FOCUS?", "APRESENTOU?", "TENT.", "QUIZ %",
            "TÍTULO DA UNIDADE", "LIÇÃO 1 (tópico)", "LIÇÃO 2 (tópico)",
            "LANGUAGE FOCUS DA SESSÃO", "AÇÕES", "APRESENTA?", "PRÓX. LIÇÃO",
            "LEMBRETE — PRÓXIMA AULA", "LP", "ALERTA — PRIVADO",
            "motor", "2ª hora", "motor 2", "focus 2ª h"]
    header_row(ws, SET_ROW + 2, head)

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

        m, m2 = f"$U{r}", f"$W{r}"
        L1, M1 = f"INDEX({ref('F')},{m})", f"INDEX({ref('G')},{m})"
        SET = f"$C${SET_ROW}"

        ws[f"U{r}"] = f'=IFERROR(MATCH("E"&$B{r}&"-U"&$C{r},{ref("A")},0),0)'

        # V — a letra da 2ª hora. Vazia quando o grupo faz uma lição por sessão.
        ws[f"V{r}"] = f'=IF({SET}=2,{nxt(f"$D{r}")},"")'

        # W — o índice da unidade SEGUINTE, para quando a 2ª hora atravessa a
        # virada de unidade (acontece quando a 1ª hora é D ou X). Se a unidade
        # seguinte não existe naquele nível, cai no U1 do nível de cima.
        ws[f"W{r}"] = (f'=IFERROR(MATCH("E"&$B{r}&"-U"&($C{r}+1),{ref("A")},0),'
                       f'IFERROR(MATCH("E"&($B{r}+1)&"-U1",{ref("A")},0),0))')

        ws[f"K{r}"] = f'=IF({m}=0,"⚠ unidade não encontrada",INDEX({ref("E")},{m}))'
        ws[f"L{r}"] = f'=IF({m}=0,"—",{L1})'
        ws[f"M{r}"] = f'=IF({m}=0,"—",{M1})'

        # X — o focus da 2ª hora. Se ela é de outra unidade, lê a lição 1 de lá.
        ws[f"X{r}"] = (
            f'=IF($V{r}="","",'
            f'IF({crosses_unit(f"$D{r}")},IF({m2}=0,"—",INDEX({ref("F")},{m2})),'
            f'{focus_for(f"$V{r}", m, f"$L{r}", f"$M{r}")}))')

        # N — o focus da SESSÃO. Uma hora, duas horas do mesmo tópico, ou dois.
        ws[f"N{r}"] = (
            f'=IF($V{r}="",{focus_for(f"$D{r}", m, f"$L{r}", f"$M{r}")},'
            f'IF($X{r}={focus_for(f"$D{r}", m, f"$L{r}", f"$M{r}")},$X{r},'
            f'{focus_for(f"$D{r}", m, f"$L{r}", f"$M{r}")}&"   →   "&$X{r}))')

        ws[f"O{r}"] = (f'=IF({m}=0,"—",IF(INDEX({ref("I")},{m})="—",INDEX({ref("H")},{m}),'
                       f'INDEX({ref("H")},{m})&" / "&INDEX({ref("I")},{m})))')

        # P — apresenta? Agora olha as DUAS horas.
        p1 = f'OR($D{r}="B",$D{r}="D")'
        p2 = f'OR($V{r}="B",$V{r}="D")'
        ws[f"P{r}"] = (f'=IF(AND(NOT({p1}),NOT({p2})),"não",'
                       f'IF(AND({p1},{p2}),"SIM — nas duas horas",'
                       f'IF({p1},"SIM — 1 min","SIM — 1 min (2ª hora)")))')

        # Q — a próxima lição é a que vem DEPOIS da última hora desta sessão.
        last = f'IF($V{r}="",$D{r},$V{r})'
        ws[f"Q{r}"] = (f'=IF(AND($V{r}<>"",{crosses_unit(f"$D{r}")}),"B (unidade nova)",'
                       f'IF({crosses_unit(last)},"A (unidade seguinte)",{nxt(last)}))')

        ws[f"R{r}"] = (
            f'=IF($Q{r}="A (unidade seguinte)","Próxima aula: unidade nova, lição A. '
            f'O teste desta unidade foi liberado.",'
            f'IF($Q{r}="B (unidade nova)","Próxima aula: lição B da unidade nova — '
            f'você apresenta ~1 min sobre o tópico que acabou de estrear.",'
            f'IF($Q{r}="B","Próxima aula do ciclo: B — você apresenta ~1 min sobre: "&$L{r},'
            f'IF($Q{r}="C","Próxima aula do ciclo: C — tópico novo: "&$M{r},'
            f'IF($Q{r}="D","Próxima aula do ciclo: D — você apresenta ~1 min sobre: "&$M{r},'
            f'"—")))))')

        ws[f"S{r}"] = (f'=IF($F{r}="sim",1,0)+IF($G{r}="sim",1,0)+IF($H{r}="sim",1,0)')
        ws[f"T{r}"] = (
            f'=IF($J{r}="","—",IF($J{r}>={PASS},"ok — avança e volta ao A",'
            f'IF($I{r}>={SOFTCAP},"⚠ {SOFTCAP} tentativas sem passar — converse antes da próxima",'
            f'"abaixo de {PASS} — pode refazer")))')

        paint(ws, r, list("ABCDEFGHIJ"), FILL_TYPE)
        paint(ws, r, list("KLMNOPQRS"), FILL_CALC)
        paint(ws, r, ["T"], FILL_PRIV)
        paint(ws, r, ["U", "V", "W", "X"], FILL_NOTE)
        ws.row_dimensions[r].height = 46

    n = R0 + ROWS + 1
    n = note(ws, n, "COMO USAR — dez minutos antes da sessão", F_LABEL)
    for line in [
        "Digite três coisas por aluno: EVOLVE, UNIDADE e LIÇÃO do ciclo (A, B, C, D ou X). Tudo de K a S se calcula.",
        "Depois da sessão, no debrief: marque sim/não em LIÇÃO DE CASA, USOU O FOCUS e APRESENTOU. A coluna LP é o que o aluno terá para gastar NA PRÓXIMA sessão — anuncie em voz alta, e é o aluno que anota na ficha dele.",
        f"O LP é pago pela TENTATIVA, nunca pelo acerto. {LP['lawOfTheAttempt']}",
        "Uma vez por semana, lance TENTATIVAS e NOTA lendo as respostas do " + QUIZ + " no Google Forms. A lição de casa fica no Cambridge One e a plataforma corrige sozinha — você não lança nada dela.",
        "",
        "UMA HORA DE AULA = UMA LIÇÃO DO CICLO, e é a célula C3 que diz quantas lições cabem numa sessão deste grupo.",
        "Ponha 2 no grupo de UM encontro de duas horas: a coluna LIÇÃO passa a ser a 1ª hora, o Painel calcula a 2ª sozinho, e depois da sessão você avança a LIÇÃO DUAS letras. Ponha 1 no grupo de DOIS encontros de uma hora: avança uma letra por encontro.",
        "Nos dois casos são duas lições por semana e uma unidade a cada duas semanas. Não existe formato mais rápido — muda só quantas lições cabem num encontro.",
        "A 2ª hora sabe virar a unidade sozinha: se a 1ª hora for D ou X, a segunda já é o A da unidade seguinte, e o Focus vem de lá. Depois da sessão, lembre de subir a UNIDADE.",
        "",
        "NADA das colunas I, J e T sai deste arquivo. O Quadro da Turma só enxerga a aba BOARD.",
    ]:
        n = note(ws, n, line, F_BODY if line else F_SMALL)
    freeze(ws, "B4")
    return ws


# ---------------------------------------------------------------------------
def sheet_quadro(wb):
    # ⚠ 19/09/2026 — renamed QUADRO -> BOARD and translated. This is the only
    # tab that leaves this file, and what it says ends up in front of a student
    # in an English lesson. The teacher's own tabs stay in Portuguese.
    ws = wb.create_sheet("BOARD")
    ws.sheet_view.showGridLines = False
    widths(ws, {"A": 16, "B": 9, "C": 34, "D": 8, "E": 32, "F": 13, "G": 24,
                "H": 9, "I": 48})
    header_row(ws, 1, ["STUDENT", "GROWTH", "WHERE YOU ARE", "TODAY'S LESSONS",
                       "LANGUAGE FOCUS TODAY", "PRESENTING TODAY?", "YOUR ACTIONS",
                       "LP FOR THIS SESSION", "REMINDER — NEXT LESSON"])
    for i in range(ROWS):
        q, p = 2 + i, R0 + i
        ws.cell(q, 1, f"=PAINEL!A{p}")
        ws.cell(q, 2, f"=PAINEL!E{p}")
        ws.cell(q, 3, f'="Evolve "&PAINEL!B{p}&" · Unit "&PAINEL!C{p}&" — "&PAINEL!K{p}')
        # Duas horas numa sessão de 2h: "A → B". Uma hora: "A".
        ws.cell(q, 4, f'=IF(PAINEL!V{p}="",PAINEL!D{p},PAINEL!D{p}&" → "&PAINEL!V{p})')
        ws.cell(q, 5, f"=PAINEL!N{p}")
        ws.cell(q, 6, f"=PAINEL!P{p}")
        ws.cell(q, 7, f"=PAINEL!O{p}")
        ws.cell(q, 8, f"=PAINEL!S{p}")
        ws.cell(q, 9, f"=PAINEL!R{p}")
        paint(ws, q, list("ABCDEFGHI"), FILL_CALC)
        ws.row_dimensions[q].height = 40

    n = ROWS + 4
    n = note(ws, n, "ESTA É A ÚNICA ABA QUE SAI DESTE ARQUIVO — E É A ÚNICA EM INGLÊS", F_LABEL)
    for line in [
        "O Class Board lê exatamente BOARD!A1:I5 por IMPORTRANGE. Nada fora deste retângulo é alcançável a partir de uma ficha de aluno.",
        "Está em inglês de propósito: estas nove colunas aparecem na ficha do aluno, e a ficha é um documento de aula de inglês.",
        "Não tem nota. Não tem tentativa. Não tem alerta. Por construção, não por disciplina.",
        "Não digite nada aqui: as nove colunas são espelho do PAINEL.",
        "A coluna LP é o que você anunciou no debrief passado. Quem controla o saldo durante a sessão é o aluno, na ficha dele — esta coluna é a conferência, não o placar.",
        "TODAY'S LESSONS mostra 'A' num grupo de dois encontros e 'A → B' num grupo de um encontro de duas horas. Quem decide isso é a célula C3 do PAINEL, uma vez por grupo.",
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
        "O painel do professor. Ele NUNCA é compartilhado com aluno nenhum, e não precisa ser: dele sai um bloco público (a aba BOARD) que alimenta o Quadro da Turma, e é o Quadro que as fichas leem.",
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
