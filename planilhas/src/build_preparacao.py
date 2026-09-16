#!/usr/bin/env python3
"""
Ludify RPL — Módulo de Preparação de Sessão
Cruza a trilha de cada aluno com o catálogo de etiquetas e devolve as ações da mesa.

Fonte única de verdade: Catalogo-Etiquetas-Evolve.xlsx (aba MAPA).
Fórmulas compatíveis com Google Sheets, Excel e LibreOffice — sem ARRAYFORMULA.

Regenera com:  python3 build_preparacao.py
"""
import os
from openpyxl import Workbook, load_workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.utils import get_column_letter

# ---------------------------------------------------------------- paleta
INK, BRAND, SOFT = "14130F", "C25A12", "6E6A61"
OK_G, MISS_R = "1F7A4D", "B32E2E"
BAND, BRAND_BG, OK_BG, MISS_BG, INPUT_BG = "FAF9F7", "FBEFE4", "E9F5EE", "FBEDED", "FFFDF5"
LINE = "DDDCD7"

F_TITLE = Font(name="Calibri", size=15, bold=True, color=INK)
F_SUB   = Font(name="Calibri", size=10, color=SOFT)
F_HEAD  = Font(name="Calibri", size=9, bold=True, color="FFFFFF")
F_BODY  = Font(name="Calibri", size=10, color=INK)
F_BOLD  = Font(name="Calibri", size=10, bold=True, color=INK)
F_ACC   = Font(name="Calibri", size=10, bold=True, color=BRAND)
F_SEC   = Font(name="Calibri", size=11, bold=True, color=BRAND)
F_SMALL = Font(name="Calibri", size=9, color=SOFT)
F_BIG   = Font(name="Calibri", size=13, bold=True, color=BRAND)
F_MONO  = Font(name="Consolas", size=9, color=INK)

FILL_HEAD  = PatternFill("solid", fgColor=INK)
FILL_BAND  = PatternFill("solid", fgColor=BAND)
FILL_BRAND = PatternFill("solid", fgColor=BRAND_BG)
FILL_OK    = PatternFill("solid", fgColor=OK_BG)
FILL_MISS  = PatternFill("solid", fgColor=MISS_BG)
FILL_INPUT = PatternFill("solid", fgColor=INPUT_BG)

THIN = Side(style="thin", color=LINE)
BORDER = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)
TOP  = Alignment(vertical="center", wrap_text=True)
TOPC = Alignment(vertical="center", horizontal="center", wrap_text=True)
TOPL = Alignment(vertical="top", wrap_text=True)

# ---------------------------------------------------------------- dados
src = load_workbook(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "Catalogo-Etiquetas-Evolve.xlsx"))["MAPA"]
UNIDADES = []          # (nivel, evolve, unidade, titulo, gramatica, acao1, acao2, dominio)
for r in range(5, 77):
    v = [src.cell(row=r, column=c).value for c in range(1, 10)]
    if not v[3]:
        continue
    UNIDADES.append((v[0], int(v[1]), int(v[2]), v[3], v[4],
                     v[5], "" if v[6] == "—" else v[6], v[7]))
assert len(UNIDADES) == 72, f"esperava 72 unidades, li {len(UNIDADES)}"

ACOES = ["Identify", "Describe", "Quantify", "Ability & Progress", "Narrate", "Report",
         "Plan", "Regulate", "Speculate", "Suppose", "Argue", "React", "Register & Nuance"]

ALUNOS_DEMO = [("Ana", 3, 9), ("Mira", 1, 6), ("Diego", 4, 5), ("Lu", 2, 10)]
N_AL = 4
LIN0 = 6                       # primeira linha de aluno na aba MESA
LINF = LIN0 + N_AL - 1         # última
E_LIN0, E_LINF = 2, 73         # faixa de dados na aba ETIQUETAS

wb = Workbook()

# ================================================================ ETIQUETAS
ws = wb.create_sheet("ETIQUETAS")
ws.cell(row=1, column=1, value="CHAVE").font = F_HEAD
for i, h in enumerate(["CHAVE", "NÍVEL", "EVOLVE", "UN.", "TÍTULO", "GRAMÁTICA",
                       "AÇÃO 1", "AÇÃO 2", "DOMÍNIO"], start=1):
    c = ws.cell(row=1, column=i, value=h)
    c.font, c.fill, c.alignment, c.border = F_HEAD, FILL_HEAD, TOPC, BORDER
for w, col in zip([9, 8, 9, 6, 26, 50, 18, 18, 22], "ABCDEFGHI"):
    ws.column_dimensions[col].width = w
r = E_LIN0
for niv, ev, un, tit, gram, a1, a2, dom in UNIDADES:
    vals = [f"{ev}|{un}", niv, ev, un, tit, gram, a1, a2, dom]
    for i, v in enumerate(vals, start=1):
        c = ws.cell(row=r, column=i, value=v)
        c.font = F_BODY
        c.alignment = TOPC if i in (1, 2, 3, 4) else TOPL
        c.border = BORDER
        if ev % 2 == 1:
            c.fill = FILL_BAND
    r += 1
ws.freeze_panes = "A2"
ws.auto_filter.ref = f"A1:I{E_LINF}"

# ================================================================ MESA
ws = wb.create_sheet("MESA", 0)
for w, col in zip([16, 9, 7, 26, 20, 20, 20, 14], "ABCDEFGH"):
    ws.column_dimensions[col].width = w

ws.cell(row=1, column=1, value="Preparação da sessão — o que a mesa pede hoje").font = F_TITLE
ws.cell(row=2, column=1, value="Preencha só as três colunas amareladas. Todo o resto se calcula sozinho.").font = F_SUB

# ---- bloco 1: a mesa
ws.cell(row=4, column=1, value="1 · A MESA").font = F_SEC
for i, h in enumerate(["ALUNO", "EVOLVE", "UN.", "TÍTULO DA UNIDADE", "AÇÃO 1", "AÇÃO 2", "DOMÍNIO", "CONFERE?"], start=1):
    c = ws.cell(row=5, column=i, value=h)
    c.font, c.fill, c.alignment, c.border = F_HEAD, FILL_HEAD, TOPC, BORDER

KEY = f"ETIQUETAS!$A${E_LIN0}:$A${E_LINF}"
def lookup(col_letter, row):
    # &"" coage célula vazia a texto vazio — sem isso, INDEX sobre célula em branco
    # devolve 0 no Excel e no LibreOffice.
    return (f'=IFERROR(INDEX(ETIQUETAS!${col_letter}${E_LIN0}:${col_letter}${E_LINF},'
            f'MATCH($B{row}&"|"&$C{row},{KEY},0))&"","")')

for i, (nome, ev, un) in enumerate(ALUNOS_DEMO):
    r = LIN0 + i
    ws.cell(row=r, column=1, value=nome).font = F_BOLD
    ws.cell(row=r, column=2, value=ev)
    ws.cell(row=r, column=3, value=un)
    ws.cell(row=r, column=4, value=lookup("E", r))
    ws.cell(row=r, column=5, value=lookup("G", r))
    ws.cell(row=r, column=6, value=lookup("H", r))
    ws.cell(row=r, column=7, value=lookup("I", r))
    ws.cell(row=r, column=8, value=f'=IF($D{r}="","unidade não existe","ok")')
    for col in range(1, 9):
        c = ws.cell(row=r, column=col)
        c.border = BORDER
        c.alignment = TOPC if col in (2, 3, 8) else TOP
        if col in (2, 3):
            c.fill = FILL_INPUT
        if col == 1:
            c.fill = FILL_INPUT
        if col in (5, 6):
            c.font = F_ACC
        elif col != 1:
            c.font = F_BODY
    ws.row_dimensions[r].height = 20

dv_ev = DataValidation(type="list", formula1='"1,2,3,4,5,6"', allow_blank=True)
dv_un = DataValidation(type="list", formula1='"1,2,3,4,5,6,7,8,9,10,11,12"', allow_blank=True)
ws.add_data_validation(dv_ev); ws.add_data_validation(dv_un)
dv_ev.add(f"B{LIN0}:B{LINF}"); dv_un.add(f"C{LIN0}:C{LINF}")

RNG_ACOES = f"$E${LIN0}:$F${LINF}"   # as duas colunas de ação, todos os alunos

# ---- bloco 2: cobertura
r0 = LINF + 2
ws.cell(row=r0, column=1, value="2 · QUEM CADA AÇÃO ALCANÇA").font = F_SEC
ws.cell(row=r0, column=4, value="Linha cheia = cena com essa ação já mira esses alunos sem adaptação nenhuma.").font = F_SMALL
hdr = r0 + 1
for i, h in enumerate(["AÇÃO"] + [a[0] for a in ALUNOS_DEMO] + ["ALCANÇA"], start=1):
    c = ws.cell(row=hdr, column=i, value=h if i == 1 or i == N_AL + 2 else f"={{}}")
    c.font, c.fill, c.alignment, c.border = F_HEAD, FILL_HEAD, TOPC, BORDER
# cabeçalho dos alunos referencia o nome digitado, para acompanhar troca de aluno
for j in range(N_AL):
    c = ws.cell(row=hdr, column=2 + j, value=f"=$A${LIN0 + j}")
    c.font, c.fill, c.alignment, c.border = F_HEAD, FILL_HEAD, TOPC, BORDER
ws.cell(row=hdr, column=1, value="AÇÃO")
ws.cell(row=hdr, column=N_AL + 2, value="ALCANÇA")
for i in (1, N_AL + 2):
    c = ws.cell(row=hdr, column=i)
    c.font, c.fill, c.alignment, c.border = F_HEAD, FILL_HEAD, TOPC, BORDER

COB0 = hdr + 1
for i, acao in enumerate(ACOES):
    r = COB0 + i
    c = ws.cell(row=r, column=1, value=acao)
    c.font, c.border, c.alignment = F_BOLD, BORDER, TOP
    if i % 2 == 0:
        c.fill = FILL_BAND
    for j in range(N_AL):
        lin = LIN0 + j
        cell = ws.cell(row=r, column=2 + j,
                       value=f'=IF(COUNTIF($E{lin}:$F{lin},$A{r})>0,$A${lin},"")')
        cell.font, cell.border, cell.alignment = F_BODY, BORDER, TOPC
        if i % 2 == 0:
            cell.fill = FILL_BAND
    tot = ws.cell(row=r, column=N_AL + 2, value=f"=COUNTIF({RNG_ACOES},$A{r})")
    tot.font, tot.border, tot.alignment = F_BOLD, BORDER, TOPC
    if i % 2 == 0:
        tot.fill = FILL_BAND
COBF = COB0 + len(ACOES) - 1

# destaque: as duas ações que mais alcançam
r = COBF + 2
ws.cell(row=r, column=1, value="MELHOR HOJE").font = F_ACC
ws.cell(row=r, column=2,
        value=f'=IF(MAX($F${COB0}:$F${COBF})=0,"—",'
              f'INDEX($A${COB0}:$A${COBF},MATCH(MAX($F${COB0}:$F${COBF}),$F${COB0}:$F${COBF},0))'
              f'&"  ("&MAX($F${COB0}:$F${COBF})&" de {N_AL})")').font = F_BIG
ws.merge_cells(start_row=r, start_column=2, end_row=r, end_column=5)
for col in range(1, 6):
    ws.cell(row=r, column=col).fill = FILL_BRAND
    ws.cell(row=r, column=col).border = BORDER
ws.row_dimensions[r].height = 24

# ---- bloco 3: planejador de cena
r0 = r + 2
ws.cell(row=r0, column=1, value="3 · A CENA QUE VOCÊ PLANEJOU").font = F_SEC
ws.cell(row=r0, column=4, value="Escolha até três ações que a cena puxa. A tabela diz quem fica de fora e o que fazer.").font = F_SMALL
CEN0 = r0 + 1
for k in range(3):
    r = CEN0 + k
    c = ws.cell(row=r, column=1, value=f"Ação {k + 1} da cena")
    c.font, c.border, c.alignment = F_BODY, BORDER, TOP
    v = ws.cell(row=r, column=2, value=["Regulate", "Identify", ""][k])
    v.font, v.border, v.alignment, v.fill = F_ACC, BORDER, TOPC, FILL_INPUT
    ws.merge_cells(start_row=r, start_column=2, end_row=r, end_column=3)
dv_ac = DataValidation(type="list", formula1='"' + ",".join(ACOES) + '"', allow_blank=True)
ws.add_data_validation(dv_ac)
dv_ac.add(f"B{CEN0}:B{CEN0 + 2}")

DIAG = CEN0 + 4
for i, h in enumerate(["ALUNO", "SITUAÇÃO", "SE FICOU DE FORA, PEÇA ISTO NA CENA", "", "", "", "", ""], start=1):
    if not h:
        continue
    c = ws.cell(row=DIAG, column=i, value=h)
    c.font, c.fill, c.alignment, c.border = F_HEAD, FILL_HEAD, TOPC, BORDER
ws.merge_cells(start_row=DIAG, start_column=3, end_row=DIAG, end_column=6)

for j in range(N_AL):
    r = DIAG + 1 + j
    lin = LIN0 + j
    hit = (f'COUNTIF($E{lin}:$F{lin},$B${CEN0})'
           f'+COUNTIF($E{lin}:$F{lin},$B${CEN0 + 1})'
           f'+COUNTIF($E{lin}:$F{lin},$B${CEN0 + 2})')
    ws.cell(row=r, column=1, value=f"=$A${lin}").font = F_BOLD
    ws.cell(row=r, column=2, value=f'=IF({hit}>0,"coberto","FALTA")').font = F_BOLD
    ws.cell(row=r, column=3,
            value=f'=IF({hit}>0,"",'
                  f'"Inclua uma fala de NPC que peça "&$E{lin}&IF($F{lin}="",""," ou "&$F{lin})&" — "&$D{lin})')
    for col in range(1, 7):
        c = ws.cell(row=r, column=col)
        c.border = BORDER
        c.alignment = TOPC if col == 2 else TOP
        if col >= 3:
            c.font = F_BODY
    ws.merge_cells(start_row=r, start_column=3, end_row=r, end_column=6)
    ws.row_dimensions[r].height = 22

r = DIAG + N_AL + 2
c = ws.cell(row=r, column=1,
            value="A coluna da direita é o ajuste de trinta segundos: você não muda a cena, "
                  "só acrescenta uma fala de NPC que peça daquele aluno o que ele está estudando. "
                  "Quem faz cada ação naturalmente está na aba ACOES do catálogo — Halden, Piro, Sable, Quill ou The Tenant.")
c.font, c.alignment, c.fill = F_BODY, TOPL, FILL_BRAND
ws.merge_cells(start_row=r, start_column=1, end_row=r + 1, end_column=8)
for cc in range(1, 9):
    ws.cell(row=r, column=cc).fill = FILL_BRAND
ws.freeze_panes = "A6"

# ================================================================ INSTALAR
ws = wb.create_sheet("INSTALAR")
ws.column_dimensions["A"].width = 3
ws.column_dimensions["B"].width = 100
r = 2
ws.cell(row=r, column=2, value="Como plugar isto no seu Painel da Turma").font = F_TITLE
r += 1
ws.cell(row=r, column=2, value="Cinco minutos, uma vez só. Depois disso nunca mais.").font = F_SUB
r += 2

PASSOS = [
    ("P", "SE VOCÊ QUER O MAIS SIMPLES"),
    ("t", "Use esta planilha como está. Toda semana você abre a aba MESA, atualiza as colunas EVOLVE e UN. de cada aluno, e lê os blocos 2 e 3. Não precisa mexer no Painel."),
    ("", ""),
    ("P", "SE VOCÊ QUER DENTRO DO PAINEL (recomendado a médio prazo)"),
    ("t", "1. Abra o Painel-Turma-RPL no Google Sheets."),
    ("t", "2. Nesta planilha, clique com o botão direito na aba ETIQUETAS e escolha Copiar para → Planilha existente → Painel-Turma-RPL. Faça o mesmo com a aba MESA."),
    ("t", "3. Na aba MESA copiada, troque as colunas A, B e C para apontar para o PAINEL. Se o primeiro aluno estiver na linha 7 do PAINEL, com nível em B7 e unidade em C7, então na MESA escreva:"),
    ("f", "A6:  =PAINEL!A7        B6:  =PAINEL!B7        C6:  =PAINEL!C7"),
    ("t", "4. Arraste as três células para baixo, uma linha por aluno. Pronto — a partir daí a MESA se atualiza sozinha toda vez que você marcar a etapa de alguém."),
    ("", ""),
    ("P", "SE VOCÊ PREFERIR AS COLUNAS DIRETO NO PAINEL"),
    ("t", "Em vez de usar a aba MESA, cole a fórmula abaixo numa coluna nova do PAINEL, ao lado de cada aluno. Ela devolve a Ação 1. Troque $B7 pelo nível do Evolve e $C7 pela unidade:"),
    ("f", '=IFERROR(INDEX(ETIQUETAS!$G$2:$G$73;MATCH($B7&"|"&$C7;ETIQUETAS!$A$2:$A$73;0));"")'),
    ("t", "Para a Ação 2, troque G por H. Para o domínio, troque por I. Para o título da unidade, E."),
    ("t", "Atenção ao separador: o Google Sheets em português usa ponto e vírgula, como está acima. Se a sua planilha usa vírgula, troque todos os ; por ,"),
    ("", ""),
    ("P", "O QUE NÃO FAZER"),
    ("t", "Não apague nem reordene as colunas da aba ETIQUETAS. As fórmulas apontam para as letras das colunas, então mover uma coluna quebra tudo em silêncio."),
    ("t", "Não use ARRAYFORMULA para tentar preencher a coluna de uma vez. Funciona no Google Sheets e quebra no Excel e no LibreOffice — e o material precisa rodar na máquina de qualquer professor parceiro."),
    ("", ""),
    ("P", "QUANDO O CATÁLOGO MUDAR"),
    ("t", "Se as etiquetas de alguma unidade forem revistas, o que muda é só a aba ETIQUETAS. Nenhuma fórmula precisa ser tocada — troque os valores das colunas G, H e I e o resto acompanha."),
]
for kind, text in PASSOS:
    c = ws.cell(row=r, column=2, value=text)
    if kind == "P":
        c.font = F_ACC
    elif kind == "f":
        c.font = F_MONO
        c.fill = FILL_BAND
        c.alignment = Alignment(vertical="center", wrap_text=True)
    else:
        c.font = F_BODY
        c.alignment = Alignment(vertical="top", wrap_text=True)
        ws.row_dimensions[r].height = max(15, 14.5 * (len(text) // 96 + 1))
    r += 1

del wb["Sheet"]
wb.save(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "Preparacao-Sessao-RPL.xlsx"))
print("ok — Preparacao-Sessao-RPL.xlsx")
print(f"unidades no lookup: {len(UNIDADES)}")
print(f"MESA: alunos {LIN0}-{LINF} · cobertura {COB0}-{COBF} · cena {CEN0} · diagnóstico {DIAG+1}-{DIAG+N_AL}")
