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
   doors/
      tallow-coast.js     o cenário Fantasy (era door-fantasy/src/content.js)

players-guide/            O livro do ALUNO  (49 páginas)
   PlayersGuide.docx
   QuickReference.docx    a folha de mesa, frente e verso (2 páginas)
   HowThisClassWorks.docx a folha de boas-vindas — inglês e português (2 páginas)
   src/build.js · src/quickref.js · src/howitworks.js · src/assets/

masters-guide/            O guia do PROFESSOR, serve as seis Portas  (32 páginas)
   MastersGuide.docx · src/build.js

door-fantasy/             O livro da PORTA Fantasy — só do professor  (31 páginas)
   TallowCoast-DoorBook.docx · src/build.js · src/assets/

planilhas/                Painel, Quadro, ficha e catálogo
   src/build_{ficha,painel,catalogo,preparacao}.py
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
node players-guide/src/build.js
node players-guide/src/quickref.js
node players-guide/src/howitworks.js
node masters-guide/src/build.js
node door-fantasy/src/build.js
```

E as planilhas (precisa de Python e openpyxl):

```
python3 planilhas/src/build_catalogo.py     # roda primeiro: é a fonte
python3 planilhas/src/build_preparacao.py
python3 planilhas/src/build_painel.py
python3 planilhas/src/build_ficha.py
```

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
