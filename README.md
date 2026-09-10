# Ludify RPL — fonte dos livros

Três livros, uma pasta cada. Dentro de cada pasta: o `.docx` pronto para ler, e `src/`
com a fonte que o gera.

```
players-guide/            O livro do ALUNO  (46 páginas)
   PlayersGuide.docx
   src/build.js           ← a fonte. Todo o livro está aqui dentro.
   src/assets/            imagens + make_figures.py que as regera

masters-guide/            O guia do PROFESSOR, serve as seis Portas  (32 páginas)
   MastersGuide.docx
   src/build.js

door-fantasy/             O livro da PORTA Fantasy — só do professor  (31 páginas)
   TallowCoast-DoorBook.docx
   src/build.js
   src/content.js         ← FONTE ÚNICA das tabelas do cenário
   src/assets/
```

## As duas regras que mantêm isto organizado

**1. Um arquivo por livro.** Cada `build.js` contém o livro inteiro — todos os capítulos,
como dado e como layout. Nunca existe arquivo por capítulo, nunca existe `_v2` ou `_final`.
O histórico de commits deste arquivo **é** o histórico de versões do livro.

**2. `content.js` é a única fonte das tabelas do cenário.** Os cinco povos, as linhagens,
a escada de queima, os Six e as três cidades aparecem no livro do aluno *e* no livro do
professor. Os dois `build.js` importam do mesmo arquivo:

```js
// players-guide/src/build.js
require("../../door-fantasy/src/content.js")
```

Corrigir a descrição de um povo é corrigir em **um** lugar e reconstruir os dois livros.
Eles saem coerentes por construção, não por disciplina.

⚠ **Os nomes das pastas fazem parte do código.** Renomear `door-fantasy` quebra esse
`require`. Se um dia precisar renomear, o caminho dentro do `build.js` tem que mudar junto.

## Como reconstruir

Precisa de Node e da biblioteca `docx`:

```
npm install -g docx
node players-guide/src/build.js
node masters-guide/src/build.js
node door-fantasy/src/build.js
```

Cada comando regenera o `.docx` inteiro do zero, ao lado da pasta `src`.

Para regerar as imagens (só se elas mudarem — precisa de Python e Pillow):

```
python3 players-guide/src/assets/make_figures.py
python3 door-fantasy/src/assets/make_figures.py
```

## O que NÃO precisa subir toda semana

O `.docx` é gerado a partir do `build.js`. Se a fonte está no repositório, o livro é
reconstruível. Suba o `.docx` de vez em quando, quando quiser a versão legível à mão.
