# Ludify RPL — fontes dos manuscritos

Cada livro é gerado por **um único** `build.js`. Nunca existe arquivo por capítulo,
nunca existe `_v2` ou `_final`. O histórico de versões são os commits deste repositório.

```
core-rulebook/
  CoreRulebook.docx        <- gerado, para ler
  src/build.js             <- A FONTE
  src/assets/make_figures.py   <- gera TODAS as imagens do livro
  src/assets/*.png             <- imagens geradas
masters-guide/
  MastersGuide.docx
  src/build.js             <- A FONTE (não usa imagens)
```

## Regerar um livro

```bash
cd core-rulebook/src
npm install docx                  # só na primeira vez
python3 assets/make_figures.py    # só se as imagens sumirem
node build.js
```

O Master's Guide é igual, sem o passo das imagens.

## Renomear o sistema

Uma linha: a constante `GAME_NAME` no topo de cada `build.js`. Todas as menções
se atualizam sozinhas, inclusive o destaque em laranja.

## Números de página do sumário

Escritos à mão na constante `PAGES`. O processo é: gerar o livro, ver em que
página cada capítulo abre, escrever em `PAGES`, gerar de novo. Só refazer quando
a paginação mudar de verdade.

## Cores das caixas — sempre por função, nunca por gosto

`"example"` verde (caso concreto) · `"clarify"` azul (por que a regra é assim) ·
`"warn"` âmbar (limite, armadilha, coisa fácil de errar).
