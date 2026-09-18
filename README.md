# LUDUS — fonte dos livros

**Ludus** é o nome do sistema. **Ludify** é a marca da casa. **RPL** é o acrônimo interno do
método — ele vive aqui, em planilha e em anotação, e **nunca aparece numa capa**.

```
core/                     ← A CAMADA DA VERDADE
   brand.js               nomes e versão: Ludify · Ludus · RPL
   system.js              regras: rolagem, Focuses, Moves, escadas, dinheiro,
                          o que se carrega, Language Points, Spotlight Tokens, as Leis
   method.js         ★    o método: dois relógios, ciclo A·B·C·D·X, o teste, Growth,
                          anatomia da sessão — ÚNICO arquivo que sabe que o Evolve existe
   glossary.js            todo termo, uma definição
   ludus.js               o Ludus, o ritual, as relíquias, os 4 arcos, a anatomia
                          de um Door Book, a troca de setting
   decisions.js           o log de decisões — o que mudou, quando, e o que substituiu
   units.js / units.json ★ AS 72 UNIDADES — gerado por planilhas/src/export_units.py.
                          O ÚNICO arquivo que casa material didático com unidade
   doors/
      tallow-coast.js     o cenário Fantasy: as TABELAS (povos, linhagens, deuses,
                          escada de queima, kits, elenco público)
      tallow-coast-world.js  o cenário Fantasy: a PROSA — a kindling e o que ela
                          custa, as quatro fases de um lugar gasto, as feridas e
                          os Unkindled, o Concord, a lei, a Hush, as três cidades,
                          e o GLOSSÁRIO de 47 termos. O Door Book imprime tudo
                          como capítulo 2; o PG imprime os extratos `student`

core-book/                O CORE BOOK — a referência de tudo  (81 páginas · COMPLETO)
   CoreBook.docx          Partes 0 a VII: o livro, o projeto, o sistema, o método,
                          a mesa, as Portas, a operação e a referência
   src/build.js           imprime o que está em core/ — não define nada

players-guide/            O livro do ALUNO  (66 páginas)
   PlayersGuide.docx
   QuickReference.docx    a folha de mesa, frente e verso (2 páginas)
   HowThisClassWorks.docx a folha de boas-vindas — inglês e português (2 páginas)
   src/build.js · src/quickref.js · src/howitworks.js · src/assets/

masters-guide/            O guia do PROFESSOR, serve as seis Portas  (32 páginas)
   MastersGuide.docx · src/build.js

door-fantasy/             O livro da PORTA Fantasy — só do professor  (31 páginas)
   TallowCoast-DoorBook.docx · src/build.js · src/assets/

planilhas/                Painel, Quadro, ficha e catálogo
   Painel-Turma-LUDUS.xlsx      do PROFESSOR — nunca compartilhado
   Quadro-Turma-LUDUS.xlsx      a turma vê, somente leitura
   Ficha-Personagem-LUDUS.xlsx  MODELO — uma cópia por aluno
   Catalogo-Etiquetas-Evolve.xlsx   ★ fonte das 72 unidades
   src/_common.py · src/build_{painel,quadro,ficha,catalogo}.py
```

## A lei deste repositório

**Nenhum `build.js` pode definir uma regra, um termo ou um número.** Livro contém prosa,
exemplo, ilustração e diagramação. `core/` contém a verdade. Uma definição encontrada dentro
de um build script é **defeito**, não estilo.

```js
require("../../core/brand.js")            // Ludus, Ludify, a versão
require("../../core/system.js")           // as regras
require("../../core/method.js")           // ★ o método e a trilha
require("../../core/doors/tallow-coast.js") // o cenário
```

Corrigir a descrição de um povo, o número de slots ou o preço de um cavalo é corrigir em **um**
lugar e reconstruir. O livro do aluno, a folha de mesa e o livro do professor saem coerentes
**por construção, não por disciplina**.

## ★ A camada da trilha

Tudo que depende do **Evolve** mora em `core/method.js`, e só ali. Nos livros esse conteúdo é
impresso com a marca **★** e a tarja roxa `TRAIL LAYER`. Trocar de material didático um dia é
reescrever um arquivo e rodar os builds — nenhum capítulo de sistema precisa ser aberto.

⚠ **Os nomes das pastas fazem parte do código.** Renomear `core` ou `core/doors` quebra os
`require`. Se um dia precisar renomear, o caminho dentro dos builds tem que mudar junto.

## Como reconstruir

Precisa de Node e da biblioteca `docx`:

```
npm install -g docx
node core-book/src/build.js
node players-guide/src/build.js
node players-guide/src/quickref.js
node players-guide/src/howitworks.js
node masters-guide/src/build.js
node door-fantasy/src/build.js
```

E as planilhas (precisa de Python e openpyxl):

```
python3 planilhas/src/build_catalogo.py      # 1º: o catálogo é a fonte
python3 planilhas/src/export_units.py        # 2º: catálogo → core/units.json
node core/export.js                          # 3º: core/*.js → core/core.json
python3 planilhas/src/build_painel.py
python3 planilhas/src/build_quadro.py
python3 planilhas/src/build_ficha.py
```

⚠ **`core/core.json` é a ponte.** Os livros são JavaScript, as planilhas são Python, e Python
não dá `require` num `.js`. `node core/export.js` despeja `core/*.js` num JSON que os
`build_*.py` leem. Se o JSON estiver mais velho que os `.js`, as planilhas estão sendo geradas
de uma verdade vencida — rode o export antes. É por isso que a ficha não pode contradizer o
livro: os dois leem o mesmo arquivo.

Para regerar as imagens (só se elas mudarem — precisa de Python e Pillow):

```
python3 players-guide/src/assets/make_figures.py
python3 door-fantasy/src/assets/make_figures.py
```

## Como conferir antes de subir

O ciclo que pega defeito de diagramação, e que já pegou nove:

```
node -c src/build.js                                  # sintaxe
node src/build.js                                     # gera o .docx
soffice --headless --convert-to pdf Livro.docx        # vira PDF
pdfinfo Livro.pdf | grep Pages                        # o total mudou?
pdftotext -f N -l N Livro.pdf - | wc -w               # página com < 110 palavras é buraco
pdftoppm -jpeg -r 85 -f N -l N Livro.pdf /tmp/p       # e aí se olha
```

## O que NÃO precisa subir toda semana

O `.docx` é gerado a partir do `build.js`. Se a fonte está no repositório, o livro é
reconstruível. Suba o `.docx` de vez em quando, quando quiser a versão legível à mão.
