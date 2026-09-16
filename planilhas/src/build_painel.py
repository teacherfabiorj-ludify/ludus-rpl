#!/usr/bin/env python3
"""
Ludify RPL — Painel da Turma  →  Painel-Turma-RPL.xlsx

O arquivo do PROFESSOR. Nunca é compartilhado com aluno nenhum.

Reconstruído em 11/09/2026 a partir da especificação da seção 7 de
`rpg-cronograma-operacao.md`, depois que a versão de 12/08 se perdeu do
workspace.

DIVISÃO DE TERRITÓRIO — a regra que evita duplicar dado:
  Cambridge One  → território do ALUNO: trilha, Unit Progress Test, notas
  Painel         → território do PROFESSOR: em que etapa do ciclo cada aluno
                   está. Essa informação só existe porque ele conduziu as
                   sessões, e não existe em lugar nenhum além daqui.

FONTE ÚNICA: a aba REFERENCIA é gerada a partir de Catalogo-Etiquetas-Evolve.xlsx.
As 72 unidades, os títulos, a gramática e as ações não são redigitados aqui.

Rodar de qualquer lugar:  python3 build_painel.py
"""
import os
from openpyxl import Workbook, load_workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.utils import get_column_letter

HERE = os.path.dirname(os.path.abspath(__file__))
CATALOGO = os.path.join(HERE, "..", "Catalogo-Etiquetas-Evolve.xlsx")
OUT = os.path.join(HERE, "..", "Painel-Turma-RPL.xlsx")

# ---- paleta, a mesma dos livros -------------------------------------------
ACCENT, GOOD, WARN, CRIT = "2A78D6", "0CA30C", "FAB219", "D03B3B"
INK, INK2, MUTED = "0B0B0B", "52514E", "898781"
YELLOW, GREY, BLUE, ZEBRA = "FFF6DA", "EDEDEA", "E8F1FD", "F7F7F5"

F_H1 = Font(name="Calibri", size=17, bold=True, color=INK)
F_SUB = Font(name="Calibri", size=10, italic=True, color=MUTED)
F_ACC = Font(name="Calibri", size=10, bold=True, color=ACCENT)
F_HEAD = Font(name="Calibri", size=9, bold=True, color="FFFFFF")
F_BODY = Font(name="Calibri", size=10, color=INK)
F_SMALL = Font(name="Calibri", size=9, color=INK2)
F_NAME = Font(name="Calibri", size=11, bold=True, color=INK)

THIN = Side(style="thin", color="D8D7D1")
BOX = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)

STAGES = ["A", "B", "C", "D", "X"]
NAMES = ["Aluno 1", "Aluno 2", "Aluno 3", "Aluno 4"]


def head_row(ws, row, labels, widths, fill=ACCENT):
    for i, (lab, w) in enumerate(zip(labels, widths), start=2):
        c = ws.cell(row=row, column=i, value=lab)
        c.font = F_HEAD
        c.fill = PatternFill("solid", fgColor=fill)
        c.alignment = Alignment(vertical="center", wrap_text=True)
        c.border = BOX
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.row_dimensions[row].height = 26


# ---------------------------------------------------------------- REFERENCIA
def load_units():
    """As 72 unidades, lidas do catálogo. Nada é redigitado."""
    wb = load_workbook(CATALOGO, data_only=True)
    ws = wb["MAPA"]
    header = None
    units = []
    for row in ws.iter_rows(values_only=True):
        vals = [v for v in row if v is not None]
        if not vals:
            continue
        if header is None:
            if "NÍVEL" in [str(v).upper() for v in vals]:
                header = True
            continue
        # NÍVEL | EVOLVE | UN. | TÍTULO | GRAMÁTICA | AÇÃO 1 | AÇÃO 2 | DOMÍNIO | VOCAB
        row = [v for v in row if v is not None or True]
        cells = list(row)
        cells = [c for c in cells if c is not None] if len(cells) < 9 else cells
        if len(cells) < 8:
            continue
        nivel, evolve, un, titulo, gram, a1, a2, dom = cells[:8]
        if not isinstance(evolve, int) or not isinstance(un, int):
            continue
        units.append(dict(nivel=nivel, evolve=evolve, un=un, titulo=titulo,
                          gram=gram or "", a1=a1 or "", a2=a2 or "", dom=dom or ""))
    return units


def split_topics(gram):
    """Divide a gramática da unidade entre a lição 1 e a lição 2.

    ⚠ INFERÊNCIA. O Evolve traz dois tópicos por unidade, geralmente separados
    por ponto e vírgula, mas a divisão exata só se confirma abrindo o livro.
    Regra usada: o primeiro segmento é a lição 1, o resto é a lição 2. A coluna
    CONFERIDO marca o que ainda não foi verificado — corrigir é editar a célula.
    """
    parts = [p.strip() for p in str(gram).split(";") if p.strip()]
    if not parts:
        return "", ""
    if len(parts) == 1:
        # O catálogo trouxe um tópico só para a unidade inteira. Duplicar nas duas
        # lições seria mentira silenciosa; melhor mandar o professor ao livro.
        return parts[0], "⚠ conferir no livro — o catálogo traz um tópico só"
    return parts[0], "; ".join(parts[1:])


# Únicas unidades conferidas contra o livro físico (registro de 12/08/2026).
CONFERIDAS = {(1, 8), (2, 8), (3, 2)}


def build_referencia(ws, units):
    ws.sheet_view.showGridLines = False
    ws["B2"] = "REFERENCIA — as 72 unidades do Evolve"
    ws["B2"].font = F_H1
    ws["B3"] = ("Gerada a partir de Catalogo-Etiquetas-Evolve.xlsx. A divisão entre lição 1 e lição 2 é "
                "INFERIDA — confira contra o livro na primeira vez que usar cada unidade e corrija a célula.")
    ws["B3"].font = F_SUB
    labels = ["CHAVE", "NÍVEL", "EVOLVE", "UN.", "TÍTULO", "TÓPICO — LIÇÃO 1", "TÓPICO — LIÇÃO 2",
              "AÇÃO 1", "AÇÃO 2", "CONFERIDO?"]
    widths = [9, 7, 8, 6, 26, 40, 40, 17, 17, 12]
    head_row(ws, 5, labels, widths)
    r = 6
    for u in units:
        l1, l2 = split_topics(u["gram"])
        conf = "conferida" if (u["evolve"], u["un"]) in CONFERIDAS else "inferida"
        vals = [f'{u["evolve"]}|{u["un"]}', u["nivel"], u["evolve"], u["un"], u["titulo"],
                l1, l2, u["a1"], u["a2"], conf]
        for i, v in enumerate(vals, start=2):
            c = ws.cell(row=r, column=i, value=v)
            c.font = F_SMALL
            c.alignment = Alignment(vertical="top", wrap_text=(i in (6, 7, 8)))
            c.border = BOX
            if r % 2 == 0:
                c.fill = PatternFill("solid", fgColor=ZEBRA)
            if i == 11 and conf == "conferida":
                c.font = Font(name="Calibri", size=9, bold=True, color=GOOD)
        r += 1
    ws.freeze_panes = "B6"
    ws.auto_filter.ref = f"B5:K{r-1}"
    return r - 1


# ---------------------------------------------------------------- PAINEL
def build_painel(ws, last_ref_row):
    ws.sheet_view.showGridLines = False
    ws["B2"] = "Painel da Turma — Ludify RPL"
    ws["B2"].font = F_H1
    ws["B3"] = ("Abra isto 10 minutos antes da sessão e leia as quatro linhas. "
                "Amarelo você preenche · azul se calcula sozinho · nada aqui é do aluno.")
    ws["B3"].font = F_SUB

    labels = ["ALUNO", "EV.", "UN.", "ETAPA", "TÍTULO DA UNIDADE", "O TÓPICO A PREPARAR HOJE",
              "APRESENTA?", "AÇÕES DA LÍNGUA", "TENT.", "NOTA %", "STATUS DO TESTE",
              "EXTRAS SEG.", "ALERTA", "GROWTH"]
    widths = [14, 6, 6, 8, 24, 42, 11, 22, 7, 8, 26, 11, 28, 8]
    head_row(ws, 5, labels, widths)

    R = f"REFERENCIA!$B$6:$K${last_ref_row}"
    first = 6
    for i, name in enumerate(NAMES):
        r = first + i
        key = f'$C{r}&"|"&$D{r}'
        ws.cell(row=r, column=2, value=name).font = F_NAME
        ws.cell(row=r, column=3, value=1)          # Evolve
        ws.cell(row=r, column=4, value=1)          # Unidade
        ws.cell(row=r, column=5, value="A")        # Etapa
        # 5 = título, 6 = tópico do dia, 7 = apresenta, 8 = ações
        ws.cell(row=r, column=6, value=f'=IFERROR(INDEX({R},MATCH({key},REFERENCIA!$B$6:$B${last_ref_row},0),5)&"","")')
        ws.cell(row=r, column=7, value=(
            f'=IFERROR(IF($E{r}="X",'
            f'INDEX({R},MATCH({key},REFERENCIA!$B$6:$B${last_ref_row},0),6)&"  +  "&INDEX({R},MATCH({key},REFERENCIA!$B$6:$B${last_ref_row},0),7),'
            f'IF(OR($E{r}="A",$E{r}="B"),'
            f'INDEX({R},MATCH({key},REFERENCIA!$B$6:$B${last_ref_row},0),6),'
            f'INDEX({R},MATCH({key},REFERENCIA!$B$6:$B${last_ref_row},0),7)))&"","")'))
        ws.cell(row=r, column=8, value=f'=IF(OR($E{r}="B",$E{r}="D"),"SIM — 1 min","—")')
        ws.cell(row=r, column=9, value=(
            f'=IFERROR(INDEX({R},MATCH({key},REFERENCIA!$B$6:$B${last_ref_row},0),8)&" · "&'
            f'INDEX({R},MATCH({key},REFERENCIA!$B$6:$B${last_ref_row},0),9),"")'))
        ws.cell(row=r, column=10, value=0)         # tentativas
        ws.cell(row=r, column=11, value=None)      # nota
        ws.cell(row=r, column=12, value=(
            f'=IF($K{r}="","—",IF($K{r}>=75,"Passou · avança e volta ao A",'
            f'IF($J{r}>=2,"Esgotou as 2 · você decide","Pode tentar de novo")))'))
        ws.cell(row=r, column=13, value=0)         # extras seguidos
        ws.cell(row=r, column=14, value=f'=IF($M{r}>=2,"⚠ Conversa individual de 15 min","")')
        ws.cell(row=r, column=15, value=1)         # growth

        for col in range(2, 16):
            c = ws.cell(row=r, column=col)
            c.border = BOX
            c.alignment = Alignment(vertical="center", wrap_text=(col in (6, 7, 9, 12, 14)))
            if col in (3, 4, 5, 10, 11, 13, 15):
                c.fill = PatternFill("solid", fgColor=YELLOW)
                if col != 11:
                    c.font = F_BODY
            elif col in (6, 7, 8, 9, 12):
                c.fill = PatternFill("solid", fgColor=BLUE)
                c.font = F_SMALL
            elif col == 14:
                c.font = Font(name="Calibri", size=10, bold=True, color=CRIT)
        ws.row_dimensions[r].height = 34

    last = first + len(NAMES) - 1
    dv = DataValidation(type="list", formula1='"A,B,C,D,X"', allow_blank=True)
    ws.add_data_validation(dv); dv.add(f"E{first}:E{last}")
    dv2 = DataValidation(type="list", formula1='"0,1,2"', allow_blank=True)
    ws.add_data_validation(dv2); dv2.add(f"J{first}:J{last}")

    # a rotina, impressa embaixo para não virar conhecimento tribal
    r = last + 3
    ws.cell(row=r, column=2, value="A ROTINA DA SEMANA").font = F_ACC; r += 1
    for t in [
        "10 min antes da sessão — abra este painel e leia as quatro linhas. É a preparação inteira.",
        "Logo depois da sessão — marque a etapa de cada um (A→B→C→D). Quem fechou D, libere o Unit Progress Test no Cambridge One.",
        "1×/semana — lance tentativas e notas lendo o relatório do Cambridge One. Decida os casos de quem esgotou as duas tentativas.",
        "O aluno não preenche nada aqui. Marcar A/B/C/D é registro de sessão que você conduziu — 30 segundos para quatro alunos, e mais confiável que memória de aluno.",
    ]:
        c = ws.cell(row=r, column=2, value="•  " + t)
        c.font = F_SMALL
        c.alignment = Alignment(vertical="top", wrap_text=True)
        ws.row_dimensions[r].height = max(14, 13 * (len(t) // 118 + 1))
        r += 1

    r += 1
    ws.cell(row=r, column=2, value="O CICLO DE UMA UNIDADE").font = F_ACC; r += 1
    for t in [
        "A — estreia o tópico da lição 1. O aluno usa em cena pela primeira vez.",
        "B — mesmo tópico, e o aluno abre a sessão com a apresentação de ~1 min.",
        "C — estreia o tópico da lição 2.",
        "D — mesmo tópico, com apresentação. No fim desta sessão você libera o teste.",
        "X — aula extra. Só quem não chegou a 75%. Revisa os dois tópicos.",
    ]:
        c = ws.cell(row=r, column=2, value="•  " + t)
        c.font = F_SMALL
        r += 1

    ws.freeze_panes = "C6"


# ---------------------------------------------------------------- aba do aluno
def build_student(ws, name):
    ws.sheet_view.showGridLines = False
    ws["B2"] = name
    ws["B2"].font = F_H1
    ws["B3"] = "Uma linha por sessão. É daqui que sai a conversa de semestre e a resposta quando alguém perguntar se isto é aula."
    ws["B3"].font = F_SUB
    head_row(ws, 5, ["DATA", "EV.", "UN.", "ETAPA", "APRESENTOU?", "USOU O TÓPICO EM CENA?",
                     "NOTA DO TESTE", "OBSERVAÇÃO DA SESSÃO"],
             [11, 6, 6, 8, 13, 24, 13, 56])
    for r in range(6, 50):
        for col in range(2, 10):
            c = ws.cell(row=r, column=col)
            c.border = BOX
            c.fill = PatternFill("solid", fgColor=YELLOW if r % 2 else "FFFCF2")
            c.font = F_SMALL
            c.alignment = Alignment(vertical="top", wrap_text=(col == 9))
    dv = DataValidation(type="list", formula1='"A,B,C,D,X"', allow_blank=True)
    ws.add_data_validation(dv); dv.add("E6:E49")
    dv2 = DataValidation(type="list", formula1='"sim,não,parcial"', allow_blank=True)
    ws.add_data_validation(dv2); dv2.add("F6:G49")
    ws.freeze_panes = "B6"


# ---------------------------------------------------------------- LEIA-ME
def build_readme(ws):
    ws.column_dimensions["A"].width = 3
    ws.column_dimensions["B"].width = 108
    ws.sheet_view.showGridLines = False
    r = 2
    ws.cell(row=r, column=2, value="Painel da Turma — Ludify RPL").font = F_H1; r += 1
    ws.cell(row=r, column=2, value="O arquivo do professor · v2.0 · 11/09/2026").font = F_SUB
    r += 2
    TXT = [
        ("P", "⚠ ESTE ARQUIVO NUNCA É COMPARTILHADO COM ALUNO"),
        ("t", "Nem por um minuto, nem \"só para ele ver a nota dele\". Esconder aba no Planilhas Google não é segurança: quem edita desesconde, e quem só lê extrai pelo código-fonte. Proteger controla quem edita, nunca quem lê. Por isso a ficha do aluno e este painel são arquivos separados — e é por isso que este mora na pasta Ludify RPL — GM, fora da turma."),
        ("", ""),
        ("P", "A DIVISÃO DE TERRITÓRIO"),
        ("t", "Cambridge One é território do aluno: a trilha de exercícios, o Unit Progress Test, as notas. O Painel é território do professor: em que etapa do ciclo cada aluno está. Essa informação só existe porque você conduziu as sessões, e não está em lugar nenhum além daqui. Nada é digitado duas vezes."),
        ("", ""),
        ("P", "AS ABAS"),
        ("t", "PAINEL — a única que você abre antes de jogar. Quatro linhas, e a preparação da sessão está feita."),
        ("t", "Aluno 1 a Aluno 4 — o histórico, uma linha por sessão. Renomeie com o nome real de cada um."),
        ("t", "MODELO — aba em branco, para quando entrar um quinto aluno. Copie e renomeie."),
        ("t", "REFERENCIA — as 72 unidades do Evolve. Consulta; as fórmulas do PAINEL leem daqui."),
        ("", ""),
        ("P", "AS DUAS CORES"),
        ("t", "Amarelo — você preenche.  Azul — calcula sozinho, não digite nada."),
        ("", ""),
        ("P", "⚠ A DIVISÃO LIÇÃO 1 / LIÇÃO 2 É INFERIDA"),
        ("t", "Cada unidade do Evolve tem duas lições com tópicos diferentes. A REFERENCIA separa os dois a partir da gramática do catálogo, cortando no primeiro ponto e vírgula — o que acerta na maioria e erra em algumas. A coluna CONFERIDO mostra o que já foi checado contra o livro (hoje: Evolve 1-U8, 2-U8 e 3-U2)."),
        ("t", "Na primeira vez que usar uma unidade, confira e corrija a célula. Leva dez segundos e a correção fica para sempre — o PAINEL passa a ler o valor certo sozinho."),
        ("", ""),
        ("P", "O QUE AS FÓRMULAS FAZEM"),
        ("t", "A partir do nível, da unidade e da etapa, o PAINEL devolve o título da unidade, o tópico exato a preparar naquele dia, se o aluno apresenta, e as ações da língua que aquela unidade puxa. Se a nota e as tentativas estiverem lançadas, o status do teste também. Nada de ARRAYFORMULA: roda em Planilhas Google, Excel e LibreOffice, na máquina de qualquer professor parceiro."),
        ("", ""),
        ("P", "ONDE ISTO FICA GUARDADO"),
        ("t", "Pasta Ludify RPL — GM no seu Drive, e no GitHub em planilhas/. A fonte é build_painel.py: para regerar o arquivo do zero, rode o script. O que é gerado na conversa não fica salvo em lugar nenhum permanente."),
    ]
    for kind, text in TXT:
        c = ws.cell(row=r, column=2, value=text)
        if kind == "P":
            c.font = F_ACC
        else:
            c.font = F_BODY
            c.alignment = Alignment(vertical="top", wrap_text=True)
            ws.row_dimensions[r].height = max(15, 14.5 * (len(text) // 104 + 1))
        r += 1


# ---------------------------------------------------------------- build
units = load_units()
assert len(units) == 72, f"esperava 72 unidades, li {len(units)}"

wb = Workbook()
build_readme(wb.active)
wb.active.title = "LEIA-ME"

painel = wb.create_sheet("PAINEL")
for n in NAMES:
    build_student(wb.create_sheet(n), n)
build_student(wb.create_sheet("MODELO"), "MODELO — copie esta aba para um aluno novo")
ref = wb.create_sheet("REFERENCIA")
last = build_referencia(ref, units)
build_painel(painel, last)

wb.save(OUT)
print("ok —", os.path.basename(OUT))
print("abas:", wb.sheetnames)
print("unidades na REFERENCIA:", len(units))
