#!/usr/bin/env python3
"""
Ludify RPL — Catálogo de Etiquetas Linguísticas
Mapeia as 72 unidades do Evolve (A1–C1) em dois eixos: AÇÃO e DOMÍNIO.
Regenera com:  python3 build_catalogo.py
"""
import os
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# ---------------------------------------------------------------- paleta
INK    = "14130F"
BRAND  = "C25A12"
SOFT   = "6E6A61"
HEAD_BG = "14130F"
BAND    = "FAF9F7"
BRAND_BG = "FBEFE4"
LINE   = "DDDCD7"

F_TITLE = Font(name="Calibri", size=16, bold=True, color=INK)
F_SUB   = Font(name="Calibri", size=10, color=SOFT)
F_HEAD  = Font(name="Calibri", size=9,  bold=True, color="FFFFFF")
F_BODY  = Font(name="Calibri", size=10, color=INK)
F_BOLD  = Font(name="Calibri", size=10, bold=True, color=INK)
F_SMALL = Font(name="Calibri", size=9,  color=SOFT)
F_ACC   = Font(name="Calibri", size=10, bold=True, color=BRAND)

FILL_HEAD  = PatternFill("solid", fgColor=HEAD_BG)
FILL_BAND  = PatternFill("solid", fgColor=BAND)
FILL_BRAND = PatternFill("solid", fgColor=BRAND_BG)

THIN = Side(style="thin", color=LINE)
BORDER = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)

TOP  = Alignment(vertical="top", wrap_text=True)
TOPC = Alignment(vertical="top", horizontal="center", wrap_text=True)

# ================================================================ AÇÕES
# codigo, nome, o que é, gramática que costuma aparecer, pilar/NPC do Ludus
ACOES = [
    ("IDENT", "Identify",
     "Dizer quem ou o que algo é. Apresentar-se, nomear, declarar origem, função e posse.",
     "verbo be · possessivos · artigos · question words · this/these · concordância",
     "Halden (Presente)"),
    ("DESCR", "Describe",
     "Atribuir qualidade. Dizer como as coisas são, como se parecem e como normalmente acontecem.",
     "adjetivos · comparativos e superlativos · advérbios de frequência · presente simples e contínuo · orações relativas · particípios",
     "Halden (Presente)"),
    ("QUANT", "Quantify",
     "Dizer quanto e quantos. Medir, estimar, comparar quantidade e disponibilidade.",
     "there is/are · contáveis e incontáveis · some/any/much/many · quantificadores · too/enough · nomes incontáveis contabilizados",
     "Halden (Presente)"),
    ("ABIL", "Ability & Progress",
     "Declarar o que se sabe fazer, com que competência, e o quanto se avançou desde antes.",
     "can/can't · well · present perfect continuous · advérbios de modo · adjetivos de desempenho",
     "Halden (Presente)"),
    ("NARR", "Narrate",
     "Contar o que aconteceu. Sequência, pano de fundo, o que já havia acontecido antes.",
     "passado simples e contínuo · present perfect · past perfect · used to / would · tempos narrativos",
     "Sable (Passado)"),
    ("REPOR", "Report",
     "Relatar o que outra pessoa disse. Testemunho, boato, notícia, registro de terceiros.",
     "discurso indireto · perguntas indiretas · reported speech com modais · pronomes indefinidos · referenciação",
     "Sable (Passado)"),
    ("PLAN", "Plan",
     "Combinar, prever, prometer, marcar. Tudo que projeta a cena para frente.",
     "be going to · will · presente contínuo de futuro · when/before/until/after · 1º condicional · future perfect e continuous",
     "Piro (Futuro)"),
    ("REGUL", "Regulate",
     "Permitir, proibir, obrigar, aconselhar. A língua da regra, da licença e da autoridade.",
     "can/must/have to/need to · mustn't · should · permissão e proibição no passado · verbos causativos · subjuntivo",
     "Quill (Modais)"),
    ("SPEC", "Speculate",
     "Dizer o quanto se tem certeza. Deduzir, supor, arriscar uma explicação.",
     "may/might/could · modais de especulação · modais de probabilidade no passado · condicionais reais · voz passiva com modais",
     "Quill (Modais)"),
    ("SUPP", "Suppose",
     "Falar do que não aconteceu. Hipótese irreal, arrependimento, o caminho não tomado.",
     "condicionais irreais (presente, futuro e passado) · I wish · was/were going to · was/were supposed to · passado simples para o irreal",
     "Quill (Modais)"),
    ("ARGUE", "Argue",
     "Opinar, avaliar, justificar, discordar. Defender uma posição diante de alguém.",
     "expressões de opinião · giving reasons com to/for · gerúndio e infinitivo · estruturas de avaliação · advérbios comentadores",
     "The Tenant (Funcional)"),
    ("REACT", "React",
     "Responder afetivamente. Emoção, empatia, surpresa, disposição e recusa.",
     "adjetivos de emoção · exclamativas · wishes and regrets · pronomes reflexivos · vocabulário de sentimento",
     "The Tenant (Funcional)"),
    ("REGIS", "Register & Nuance",
     "Escolher o tom. Polidez, indireção, ênfase, idiom — dizer a mesma coisa de outro jeito.",
     "perguntas indiretas · so…that / such…that · clefts · adverbiais negativas e de fronteamento · phrasal verbs e idiom · referenciação e substituição",
     "The Tenant (Funcional)"),
]

# ================================================================ DOMÍNIOS
DOMINIOS = [
    ("PEOPLE",  "People & Relationships", "Pessoas, família, vínculos, personalidade, caráter, vida pessoal."),
    ("PLACES",  "Places & Environment",   "Casa, cidade, natureza, clima, paisagem, lugares remotos."),
    ("OBJECTS", "Objects & Technology",   "Coisas, materiais, aparelhos, posses, como funcionam."),
    ("WORK",    "Work & Learning",        "Trabalho, estudo, ofício, carreira, competência profissional."),
    ("TRADE",   "Trade & Value",          "Dinheiro, compra e venda, preço, valor, produção."),
    ("JOURNEY", "Journeys & Movement",    "Viagem, transporte, deslocamento, chegada e partida."),
    ("BODY",    "Body, Food & Health",    "Comida, bebida, saúde, esporte, corpo, sono."),
    ("SOCIETY", "Society & Culture",      "Mídia, entretenimento, fama, costumes, ciência, questões coletivas."),
]

# ================================================================ MAPA
# (nível_rótulo, evolve_nº, unidade, título, gramática, vocabulário, ação1, ação2, domínio)
MAPA = [
    # ---------------- A1 · Evolve 1
    ("A1", 1,  1, "I am…", "I am, you are; What's…?; It's…", "Countries, nationalities, alphabet, personal information, jobs", "IDENT", "", "PEOPLE"),
    ("A1", 1,  2, "Great people", "is/are (afirm. e pergunta); is not/are not", "Family, numbers, describing people, dates", "IDENT", "DESCR", "PEOPLE"),
    ("A1", 1,  3, "Come in", "Possessive adjectives; possessive 's e s'; It is", "Rooms in home, furniture, drinks and snacks", "DESCR", "IDENT", "PLACES"),
    ("A1", 1,  4, "I love it!", "Simple present (I/you/we); pergunta sim/não", "Technology, using technology, adjectives before nouns", "DESCR", "ARGUE", "OBJECTS"),
    ("A1", 1,  5, "Mondays and fundays", "Simple present (he/she/they); questions", "Days and times, everyday activities, adverbs of frequency", "DESCR", "", "PEOPLE"),
    ("A1", 1,  6, "Zoom in, zoom out", "There's/There are; a lot of, some, no; count/non-count", "Nature, city places", "QUANT", "DESCR", "PLACES"),
    ("A1", 1,  7, "Now is good", "Present continuous (afirm. e pergunta)", "House activities, transportation", "DESCR", "", "PLACES"),
    ("A1", 1,  8, "You're good!", "can/can't (habilidade e possibilidade); well", "Skills verbs, work", "ABIL", "DESCR", "WORK"),
    ("A1", 1,  9, "Places to go", "this/these; like to, want to, need to, have to", "Travel, travel arrangements", "PLAN", "REGUL", "JOURNEY"),
    ("A1", 1, 10, "Get ready", "be going to (afirm. e pergunta)", "Going out, clothes, seasons", "PLAN", "", "SOCIETY"),
    ("A1", 1, 11, "Colorful memories", "was/were (afirm. e pergunta)", "Describing people, places and things; colors", "NARR", "DESCR", "PLACES"),
    ("A1", 1, 12, "Stop, eat, go", "Simple past (afirm. e pergunta); any", "Snacks, meals, food, drinks, desserts", "NARR", "QUANT", "BODY"),
    # ---------------- A2 · Evolve 2
    ("A2", 2,  1, "Connections", "be; possessive adjectives e pronouns; possessive 's", "People you know, everyday things", "IDENT", "", "PEOPLE"),
    ("A2", 2,  2, "Work and Study", "Simple present (hábitos); adverbs of frequency; demonstratives", "Expressions with do/have/make, work and study items", "DESCR", "", "WORK"),
    ("A2", 2,  3, "Let's Move", "Present continuous; contraste simple present x continuous", "Sports, exercising", "DESCR", "", "BODY"),
    ("A2", 2,  4, "Good Times", "Present continuous (planos futuros); object pronouns", "Pop culture descriptions, gift items", "PLAN", "DESCR", "SOCIETY"),
    ("A2", 2,  5, "Firsts and Lasts", "Simple past (afirm., neg. e pergunta)", "Describing opinions and feelings, life events", "NARR", "REACT", "PEOPLE"),
    ("A2", 2,  6, "Buy Now, Pay Later", "be going to; determiners (no/none, some, many, most, all)", "Money-related terms, shopping", "PLAN", "QUANT", "TRADE"),
    ("A2", 2,  7, "Eat, Drink, Be Happy", "Quantifiers; verb patterns", "Food naming, food descriptions", "QUANT", "DESCR", "BODY"),
    ("A2", 2,  8, "Trips", "if/when; giving reasons with to/for", "Traveling, transportation terms", "PLAN", "ARGUE", "JOURNEY"),
    ("A2", 2,  9, "Looking Good", "Comparative and superlative adjectives", "Accessories, appearance descriptions", "DESCR", "", "PEOPLE"),
    ("A2", 2, 10, "Risky Business", "have to; predictions com will/may/might", "Job names, health problems", "SPEC", "REGUL", "WORK"),
    ("A2", 2, 11, "Me, Online", "Present perfect (experiências); present perfect x simple past", "Internet phrases, online activity verbs", "NARR", "ABIL", "SOCIETY"),
    ("A2", 2, 12, "Outdoors", "be like; relative pronouns (who/which/that)", "Weather, landscapes and cityscapes", "DESCR", "", "PLACES"),
    # ---------------- B1 · Evolve 3
    ("B1", 3,  1, "Who we are", "Information questions; indirect questions", "Describing personality, personal information", "IDENT", "REGIS", "PEOPLE"),
    ("B1", 3,  2, "So much stuff", "Present perfect (ever/never/for/since; already/yet)", "Describing possessions, tech features", "NARR", "DESCR", "OBJECTS"),
    ("B1", 3,  3, "Smart moves", "Articles; modals for advice", "City features, public transportation", "REGUL", "DESCR", "PLACES"),
    ("B1", 3,  4, "Think first", "be going to/will; will (decisão súbita); present continuous (futuro)", "Describing opinions and reactions, decisions and plans", "PLAN", "SPEC", "PEOPLE"),
    ("B1", 3,  5, "And then…", "Simple past; past continuous x simple past", "Losing and finding things, needing and giving help", "NARR", "", "PEOPLE"),
    ("B1", 3,  6, "Impact", "Quantifiers; real conditionals (presente e futuro)", "Urban problems, adverbs of manner", "ARGUE", "QUANT", "PLACES"),
    ("B1", 3,  7, "Entertain us", "used to; comparisons (not) as…as", "Music, TV shows and movies", "NARR", "DESCR", "SOCIETY"),
    ("B1", 3,  8, "Getting there", "Present perfect continuous; contraste com present perfect", "Describing experiences, describing progress", "ABIL", "NARR", "WORK"),
    ("B1", 3,  9, "Make it work", "Modais de necessidade; modais de proibição e permissão", "College subjects, employment", "REGUL", "", "WORK"),
    ("B1", 3, 10, "Why we buy", "Simple present passive; simple past passive", "Describing materials, production and distribution", "DESCR", "NARR", "TRADE"),
    ("B1", 3, 11, "Pushing yourself", "Phrasal verbs; unreal conditionals (presente e futuro)", "Succeeding, opportunities and risks", "SUPP", "ABIL", "PEOPLE"),
    ("B1", 3, 12, "Life's little lessons", "Indefinite pronouns; reported speech", "Describing accidents, describing extremes", "REPOR", "NARR", "PEOPLE"),
    # ---------------- B1+ · Evolve 4
    ("B1+", 4,  1, "And we're off!", "Tense review (simple e continuous); dynamic and stative verbs", "Describing accomplishments, key qualities", "DESCR", "ABIL", "PEOPLE"),
    ("B1+", 4,  2, "The future of food", "Real conditionals; clauses com after/until/when", "Describing trends, preparing food", "PLAN", "SPEC", "BODY"),
    ("B1+", 4,  3, "What's it worth?", "too/enough; modifying comparisons", "Time and money, prices and value", "QUANT", "ARGUE", "TRADE"),
    ("B1+", 4,  4, "Going glocal", "Modals of speculation; subject and object relative clauses", "Advertising, people in media", "SPEC", "DESCR", "SOCIETY"),
    ("B1+", 4,  5, "True stories", "Past perfect; was/were going to; was/were supposed to", "Describing stories, making and breaking plans", "NARR", "SUPP", "SOCIETY"),
    ("B1+", 4,  6, "Community action", "Present and past passive; passive com modals", "Good works, good deeds", "DESCR", "ARGUE", "SOCIETY"),
    ("B1+", 4,  7, "Can we talk?", "Reported statements; reported questions", "Communication, online communication", "REPOR", "REGIS", "SOCIETY"),
    ("B1+", 4,  8, "Lifestyles", "Present unreal conditionals; I wish", "Jobs, work/life balance", "SUPP", "REACT", "WORK"),
    ("B1+", 4,  9, "Yes, you can!", "Prohibition, permission e obligation (presente e passado)", "Places, rules", "REGUL", "", "PLACES"),
    ("B1+", 4, 10, "What if…?", "Past unreal conditionals; modals of past probability", "Discoveries, right and wrong", "SUPP", "SPEC", "SOCIETY"),
    ("B1+", 4, 11, "Contrasts", "Gerund/infinitive após forget/remember/stop; causative help/let/make", "College education, science", "REGUL", "DESCR", "WORK"),
    ("B1+", 4, 12, "Looking back", "Adding emphasis; substitution and referencing", "Senses, memories", "NARR", "REGIS", "PEOPLE"),
    # ---------------- B2 · Evolve 5
    ("B2", 5,  1, "Step Forward", "Present habits; past habits", "Facing challenges, describing annoying things", "DESCR", "NARR", "PEOPLE"),
    ("B2", 5,  2, "Natural Limits", "Comparative e superlative structures; ungradable adjectives", "Space and ocean exploration, the natural world", "DESCR", "QUANT", "PLACES"),
    ("B2", 5,  3, "The Way I Am", "Relative pronouns; reduced relative clauses; present participles", "Describing personality, strong feelings", "DESCR", "REACT", "PEOPLE"),
    ("B2", 5,  4, "Combined Effort", "so…that, such…that, even, only; reflexive pronouns; \"other\"", "Professional relationships, assessing ideas", "REGIS", "ARGUE", "WORK"),
    ("B2", 5,  5, "The Human Factor", "Real conditionals; alternativas a \"if\"", "Dealing with emotions, willingness and unwillingness", "REACT", "SPEC", "PEOPLE"),
    ("B2", 5,  6, "Expect the Unexpected", "Narrative tenses; reported speech com modal verbs", "Talking about fame, reporting news", "NARR", "REPOR", "SOCIETY"),
    ("B2", 5,  7, "Priorities", "Gerunds e infinitives após adjectives, nouns e pronouns", "Positive experiences, making purchases", "ARGUE", "PLAN", "TRADE"),
    ("B2", 5,  8, "Small Things Matter", "Modal-like expressions com \"by\"; future forms", "Neatness and messiness, talking about progress", "PLAN", "ABIL", "OBJECTS"),
    ("B2", 5,  9, "Things Happen", "Unreal conditionals; wishes and regrets", "Luck and choice, commenting on mistakes", "SUPP", "REACT", "PEOPLE"),
    ("B2", 5, 10, "People, Profiles", "Gerunds após preposições; causative verbs", "Describing characteristics, describing research", "DESCR", "REGUL", "PEOPLE"),
    ("B2", 5, 11, "Really?", "Passives com modais e modal-like expressions; passive infinitives", "Goods, degrees of truth", "SPEC", "REGIS", "OBJECTS"),
    ("B2", 5, 12, "Get What It Takes", "Adverbs com adjectives e adverbs; non-count nouns contabilizados", "Skill and performance, describing emotional impact", "ABIL", "QUANT", "WORK"),
    # ---------------- C1 · Evolve 6
    ("C1", 6,  1, "Robot Revolution", "Commenting adverbs; future perfect e future continuous", "Talking about developments in technology", "PLAN", "REGIS", "OBJECTS"),
    ("C1", 6,  2, "The Labels We Live By", "Uses of \"all\"; uses of \"would\"", "Describing personality, three-word phrasal verbs", "DESCR", "NARR", "PEOPLE"),
    ("C1", 6,  3, "In Hindsight", "Variações de past unreal conditionals; commenting on the past", "Thought processes, describing emotional reactions", "SUPP", "REACT", "PEOPLE"),
    ("C1", 6,  4, "Close Up", "Quantifiers e prepositions em relative clauses; noun clauses", "Describing things, eye idioms and metaphors", "DESCR", "QUANT", "OBJECTS"),
    ("C1", 6,  5, "Remote", "Participle phrases em posição inicial; reduced relative clauses", "Describing remote places, talking about influences", "DESCR", "NARR", "PLACES"),
    ("C1", 6,  6, "Surprise, Surprise", "Clefts; question words com \"-ever\"", "Adverbs to add attitude, prefixes under- e over-", "REGIS", "REACT", "SOCIETY"),
    ("C1", 6,  7, "Roots", "Negative e limiting adverbials; fronting adverbials", "Talking about ancestry, customs and traditions", "REGIS", "NARR", "SOCIETY"),
    ("C1", 6,  8, "Short", "Phrases com \"get\"; phrases com \"go\"", "Attention and distraction, expressions com \"get\"", "REGIS", "", "SOCIETY"),
    ("C1", 6,  9, "Healthy Modern Life", "Referencing; continuous infinitives", "Discussing health issues, discussing lack of sleep", "REGIS", "DESCR", "BODY"),
    ("C1", 6, 10, "Reinvention", "Simple past for unreal situations; if-constructions", "Global food issues, global energy issues", "SUPP", "ARGUE", "SOCIETY"),
    ("C1", 6, 11, "True Colors", "Subject-verb agreement; articles", "Color associations, color expressions", "DESCR", "REGIS", "SOCIETY"),
    ("C1", 6, 12, "Things Change", "Present subjunctive; perfect infinitive", "Talking about change, describing change", "REGUL", "PLAN", "SOCIETY"),
]

NOMES_ACAO = {c: n for c, n, _, _, _ in ACOES}
NOMES_DOM  = {c: n for c, n, _ in DOMINIOS}
NIVEIS = ["A1", "A2", "B1", "B1+", "B2", "C1"]

# ---------------------------------------------------------------- helpers
def header(ws, row, cols, widths):
    for i, (c, w) in enumerate(zip(cols, widths), start=1):
        cell = ws.cell(row=row, column=i, value=c.upper())
        cell.font, cell.fill, cell.alignment, cell.border = F_HEAD, FILL_HEAD, TOPC, BORDER
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.freeze_panes = ws.cell(row=row + 1, column=1)

def put(ws, row, values, band=False, bolds=()):
    for i, v in enumerate(values, start=1):
        cell = ws.cell(row=row, column=i, value=v)
        cell.font = F_BOLD if i in bolds else F_BODY
        cell.alignment = TOP
        cell.border = BORDER
        if band:
            cell.fill = FILL_BAND

def title_block(ws, title, sub, span=6):
    ws.cell(row=1, column=1, value=title).font = F_TITLE
    ws.cell(row=2, column=1, value=sub).font = F_SUB
    ws.row_dimensions[1].height = 24

# ================================================================ workbook
wb = Workbook()

# ---------------------------------------------------------------- LEIA-ME
ws = wb.active
ws.title = "LEIA-ME"
ws.column_dimensions["A"].width = 3
ws.column_dimensions["B"].width = 96
r = 2
ws.cell(row=r, column=2, value="Ludify RPL — Catálogo de Etiquetas Linguísticas").font = F_TITLE
r += 1
ws.cell(row=r, column=2, value="72 unidades do Evolve (A1–C1) mapeadas em dois eixos · v1.0 · 27/08/2026").font = F_SUB
r += 2

LEIA = [
    ("P", "PARA QUE ISTO EXISTE"),
    ("t", "A trama e o enredo não devem ser escritos em função de um tópico gramatical. Um grupo tem alunos em unidades e níveis diferentes ao mesmo tempo, então amarrar uma cena a um tópico só é limitador e envelhece rápido."),
    ("t", "Este catálogo inverte a ordem. Primeiro se escreve a história. Depois, para cada momento-chave do arco, sugere-se um punhado de AÇÕES linguísticas que aquele momento puxa naturalmente. Cada ação abre para dezenas de unidades do Evolve, em todos os seis níveis — e é o professor, olhando o Painel da Turma, quem escolhe qual delas mirar em cada aluno."),
    ("", ""),
    ("P", "OS DOIS EIXOS"),
    ("t", "AÇÃO — o que se faz com a língua. São 13, e é o eixo que importa para desenhar cena. Uma cena de portão pede REGULATE e IDENTIFY; uma cena de arquivo pede NARRATE e REPORT."),
    ("t", "DOMÍNIO — sobre o que se fala. São 8, e servem para escolher vocabulário e cenário. Secundário: um mesmo domínio aceita quase qualquer ação."),
    ("t", "Cada unidade recebe uma Ação 1 (a que domina a unidade), uma Ação 2 quando há uma segunda evidente, e um Domínio."),
    ("", ""),
    ("P", "COMO ISTO SE ENCAIXA COM OS CINCO NPCs DO LUDUS"),
    ("t", "As 13 ações não substituem os cinco pilares gramaticais do Master's Guide — são uma subdivisão mais fina deles. Cada ação aponta para o NPC que a faz naturalmente (coluna na aba ACOES). Halden cobre quatro ações, Quill três, The Tenant três, Sable duas e Piro uma."),
    ("t", "Na prática: a AÇÃO diz o que a cena pede; o NPC diz quem entra na cena para pedir."),
    ("", ""),
    ("P", "COMO USAR NA SEMANA"),
    ("t", "1. Ao desenhar um momento do arco, escolha 2 ou 3 AÇÕES que ele puxa sem esforço. Não escolha tópico gramatical."),
    ("t", "2. Antes da sessão, abra o Painel e veja em que unidade cada aluno está."),
    ("t", "3. Na aba MATRIZ, cruze: aquela unidade tem alguma das ações da cena? Se tiver, o aluno está mirado sem que você tenha mudado nada na cena."),
    ("t", "4. Se não tiver, use a aba MAPA para ver que ação aquela unidade puxa, e inclua uma fala de NPC que peça essa ação. É um ajuste de trinta segundos, não uma cena nova."),
    ("", ""),
    ("P", "O QUE OS NÚMEROS MOSTRARAM"),
    ("t", "DESCRIBE e NARRATE dominam o Evolve inteiro: 29 das 72 unidades, quatro em cada dez. São o pão da mesa. Uma campanha que não descreve lugar e não conta o que aconteceu está desperdiçando o currículo que o aluno já pagou."),
    ("t", "REPORT aparece em apenas 3 unidades das 72 — e a mesa usa discurso indireto o tempo todo (testemunha, boato, o que o NPC disse). É a maior lacuna do livro e a maior vantagem natural do RPG. Vale explorar de propósito."),
    ("t", "ARGUE e REACT quase nunca são o título de uma unidade (2 e 1 vezes), mas aparecem como segunda ação seis vezes cada. São onipresentes e nunca ensinadas isoladamente — de novo, o tipo de coisa que a mesa treina melhor que o livro."),
    ("t", "IDENTIFY se esgota cedo: 3 unidades em A1, 1 em A2, 1 em B1 e nada depois. Cenas de apresentação servem turma iniciante; a partir do B1 elas não puxam mais nada novo."),
    ("t", "SUPPOSE e REGISTER quase não existem antes do B1, e REGISTER é praticamente um fenômeno de C1 (4 das 5 unidades primárias). Um arco construído sobre hipótese irreal e ironia não serve a uma turma de A1 e A2 — e um arco de C1 que não os usa está subaproveitando a turma."),
    ("", ""),
    ("P", "FONTE"),
    ("t", "Scope and sequence oficial do Evolve, registrado em claude/evolve-scope-sequence-A1-C1.md. Níveis 1–4 vieram do PDF oficial da Cambridge; níveis 5–6, do índice impresso do Student's Book. O Fábio confirmou a lista em 27/08/2026."),
]
for kind, text in LEIA:
    c = ws.cell(row=r, column=2, value=text)
    if kind == "P":
        c.font = F_ACC
    else:
        c.font = F_BODY
        c.alignment = Alignment(vertical="top", wrap_text=True)
        ws.row_dimensions[r].height = max(15, 14.5 * (len(text) // 92 + 1))
    r += 1

# ---------------------------------------------------------------- ACOES
ws = wb.create_sheet("ACOES")
title_block(ws, "AÇÕES", "")
ws.cell(row=1, column=1, value="As 13 ações linguísticas").font = F_TITLE
ws.cell(row=2, column=1, value="O eixo que importa para desenhar cena. Escolha 2 ou 3 por momento do arco.").font = F_SUB
cont = {}
for lvl, _, _, _, _, _, a1, a2, _ in MAPA:
    cont[a1] = cont.get(a1, [0, 0]); cont[a1][0] += 1
    if a2:
        cont[a2] = cont.get(a2, [0, 0]); cont[a2][1] += 1
header(ws, 4, ["Cód.", "Ação", "O que é", "Gramática que costuma aparecer", "NPC do Ludus", "Como Ação 1", "Como Ação 2"],
       [8, 20, 46, 60, 20, 11, 11])
r = 5
for i, (cod, nome, oque, gram, npc) in enumerate(ACOES):
    n1, n2 = cont.get(cod, [0, 0])
    put(ws, r, [cod, nome, oque, gram, npc, n1, n2], band=(i % 2 == 0), bolds=(1, 2))
    ws.cell(row=r, column=6).alignment = TOPC
    ws.cell(row=r, column=7).alignment = TOPC
    ws.row_dimensions[r].height = 46
    r += 1

# ---------------------------------------------------------------- DOMINIOS
ws = wb.create_sheet("DOMINIOS")
ws.cell(row=1, column=1, value="Os 8 domínios").font = F_TITLE
ws.cell(row=2, column=1, value="Sobre o que se fala. Serve para escolher vocabulário e cenário — nunca para limitar a cena.").font = F_SUB
contd = {}
for row_ in MAPA:
    contd[row_[8]] = contd.get(row_[8], 0) + 1
header(ws, 4, ["Cód.", "Domínio", "O que entra", "Unidades"], [11, 30, 78, 12])
r = 5
for i, (cod, nome, oque) in enumerate(DOMINIOS):
    put(ws, r, [cod, nome, oque, contd.get(cod, 0)], band=(i % 2 == 0), bolds=(1, 2))
    ws.cell(row=r, column=4).alignment = TOPC
    ws.row_dimensions[r].height = 30
    r += 1

# ---------------------------------------------------------------- MAPA
ws = wb.create_sheet("MAPA")
ws.cell(row=1, column=1, value="As 72 unidades do Evolve, etiquetadas").font = F_TITLE
ws.cell(row=2, column=1, value="Ação 1 é a que domina a unidade. Ação 2 aparece quando há uma segunda evidente. Filtre pelas colunas F, G ou H.").font = F_SUB
header(ws, 4, ["Nível", "Evolve", "Un.", "Título", "Gramática", "Ação 1", "Ação 2", "Domínio", "Vocabulário"],
       [8, 9, 6, 26, 54, 12, 12, 12, 50])
r = 5
prev = None
for lvl, ev, un, tit, gram, voc, a1, a2, dom in MAPA:
    band = (ev % 2 == 1)
    put(ws, r, [lvl, ev, un, tit, gram, NOMES_ACAO[a1], NOMES_ACAO[a2] if a2 else "—",
                NOMES_DOM[dom], voc], band=band, bolds=(4,))
    for col in (1, 2, 3, 6, 7, 8):
        ws.cell(row=r, column=col).alignment = TOPC
    ws.cell(row=r, column=6).font = Font(name="Calibri", size=10, bold=True, color=BRAND)
    ws.row_dimensions[r].height = 30
    r += 1
ws.auto_filter.ref = f"A4:I{r - 1}"

# ---------------------------------------------------------------- MATRIZ
ws = wb.create_sheet("MATRIZ")
ws.cell(row=1, column=1, value="Matriz ação × nível").font = F_TITLE
ws.cell(row=2, column=1, value="Em que unidades cada ação aparece. Ação 1 em negrito; Ação 2 entre parênteses. É a aba de consulta rápida antes da sessão.").font = F_SUB
header(ws, 4, ["Ação"] + NIVEIS + ["Total"], [24] + [22] * 6 + [9])
r = 5
for i, (cod, nome, _, _, _) in enumerate(ACOES):
    linha, total = [nome], 0
    for lvl in NIVEIS:
        p = [str(u) for l, e, u, t, g, v, a1, a2, d in MAPA if l == lvl and a1 == cod]
        s = [f"({u})" for l, e, u, t, g, v, a1, a2, d in MAPA if l == lvl and a2 == cod]
        total += len(p) + len(s)
        linha.append(" ".join(p + s) if (p or s) else "—")
    linha.append(total)
    put(ws, r, linha, band=(i % 2 == 0), bolds=(1,))
    for col in range(2, 9):
        ws.cell(row=r, column=col).alignment = TOPC
    ws.row_dimensions[r].height = 22
    r += 1

# ---------------------------------------------------------------- EXEMPLO
ws = wb.create_sheet("EXEMPLO-ARCO1")
ws.cell(row=1, column=1, value="Exemplo aplicado — Arco 1: The Permit").font = F_TITLE
ws.cell(row=2, column=1, value="Momentos-chave sugeridos, não obrigatórios. Sessões podem entrar antes, depois ou entre eles. Nenhum momento fixa tópico gramatical — só a ação que ele pede.").font = F_SUB
header(ws, 4, ["Momento do arco", "O que acontece", "Ações que ele puxa sozinho", "Onde isso vive no Evolve"],
       [26, 50, 30, 46])
EX = [
    ("A chegada ao portão",
     "Sem papéis diante de Oren. Precisam dizer quem são, de onde vêm e o que querem em Ashlight.",
     "IDENTIFY · REGULATE · REGISTER",
     "A1 U1, U2 · A2 U1 · B1 U1 · B1+ U9 · B1 U9"),
    ("Reconhecer a cidade",
     "Primeira volta por Ashlight: o mercado, a guilda, os muros, quem manda onde.",
     "DESCRIBE · QUANTIFY",
     "A1 U3, U6 · A2 U12 · B1 U3 · B2 U2 · C1 U5"),
    ("Quem responde por vocês",
     "Procurar alguém que atesta a identidade dos personagens. Negociar um favor com quem não deve nada a eles.",
     "REGISTER · ARGUE · PLAN",
     "B1 U1 · B1+ U7 · B2 U4 · B2 U7 · C1 U6"),
    ("Apresentar-se uns aos outros",
     "A mesa se conhece dentro da ficção: ofício, história, o que cada um sabe fazer.",
     "IDENTIFY · DESCRIBE · ABILITY",
     "A1 U2, U8 · A2 U9 · B1 U1, U8 · B1+ U1 · B2 U3, U12"),
    ("A aldeia que depende de Hesper",
     "Descobrir que alguém queima sem licença — e por quê. Ouvir versões diferentes da mesma história.",
     "NARRATE · REPORT · REACT",
     "A1 U11, U12 · A2 U5 · B1 U5, U12 · B1+ U7 · B2 U6"),
    ("Ler o Warrant",
     "O documento na mão: o que se pode queimar, quanto, onde e sob que condição.",
     "REGULATE · QUANTIFY · SPECULATE",
     "B1 U9 · B1+ U9, U11 · A2 U10 · A1 U6 · B1+ U3"),
    ("Antes da inspeção",
     "Combinar o que fazer quando Warden Alder chegar. Prever o que ele vai perguntar.",
     "PLAN · SPECULATE",
     "A1 U9, U10 · A2 U4, U6 · B1 U4 · B1+ U2 · B2 U8 · C1 U1"),
    ("A inspeção (clímax)",
     "Diante de Alder: defender uma posição, justificar, aceitar ou recusar a consequência.",
     "ARGUE · REGULATE · REACT",
     "B1 U6 · B2 U5, U7 · B1+ U6, U10 · C1 U10"),
    ("Depois, no escuro",
     "O grupo revisita o que fez. O que teria acontecido se tivessem escolhido diferente.",
     "SUPPOSE · REACT · NARRATE",
     "B1 U11 · B1+ U8, U10 · B2 U9 · C1 U3"),
]
r = 5
for i, row_ in enumerate(EX):
    put(ws, r, list(row_), band=(i % 2 == 0), bolds=(1,))
    ws.cell(row=r, column=3).font = Font(name="Calibri", size=10, bold=True, color=BRAND)
    ws.row_dimensions[r].height = 42
    r += 1
r += 1
c = ws.cell(row=r, column=1, value="Repare no que este quadro NÃO faz: não diz que a cena do portão \"é de modais\". Diz que ela pede REGULATE — e REGULATE mora em seis unidades espalhadas por quatro níveis. Um aluno de A1 na unidade 9 e um de B1+ na unidade 9 são mirados pela mesma cena, sem nenhuma adaptação.")
c.font = F_BODY
c.alignment = Alignment(vertical="top", wrap_text=True)
c.fill = FILL_BRAND
ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=4)
ws.row_dimensions[r].height = 46

wb.save(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "Catalogo-Etiquetas-Evolve.xlsx"))
print("ok — Catalogo-Etiquetas-Evolve.xlsx")
print(f"unidades mapeadas: {len(MAPA)}")
assert len(MAPA) == 72, "faltam unidades"
for lvl in NIVEIS:
    n = len([1 for m in MAPA if m[0] == lvl])
    assert n == 12, f"{lvl} tem {n} unidades"
codes = set(NOMES_ACAO)
for m in MAPA:
    assert m[6] in codes, m
    assert m[7] in codes or m[7] == "", m
    assert m[8] in NOMES_DOM, m
sem_primaria = [c for c in codes if not any(m[6] == c for m in MAPA)]
print("ações sem nenhuma unidade primária:", sem_primaria or "nenhuma")
