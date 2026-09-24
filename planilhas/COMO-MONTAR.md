# Ludus — as três planilhas e o sidebar

**19/09/2026.** Ficha e Class Board em inglês, READ ME por último, e o painel lateral
que não funcionou da outra vez.

---

## O que mudou, e por que

**A ficha estava inteira em português.** Todos os rótulos, todas as dicas, os nomes das abas.
Um documento que o aluno deixa aberto por duas horas de aula de inglês, em português.
Agora tudo que o aluno enxerga está em inglês.

**O Quadro da Turma também.** Ele é lido pela turma toda, e alimenta a ficha — se ele estiver
em português, a ficha volta a ficar em português pela porta dos fundos. Virou `Class Board`,
com a aba chamada `BOARD`.

**O Painel continua em português.** É a sua ferramenta e nunca sai do seu Drive. Só a aba
pública dele foi traduzida e renomeada para `BOARD`, porque é ela que atravessa a corrente
até a ficha.

**A aba de instruções virou a última.** O aluno abre o arquivo dele e cai no personagem,
não numa página de montagem escrita para você.

---

## Os três arquivos, na ordem de montagem

| # | Arquivo | Quem vê | Aba pública |
|---|---|---|---|
| 1 | `Painel-Turma-LUDUS.xlsx` | só você | `BOARD` |
| 2 | `Class-Board-LUDUS.xlsx` | a turma, só leitura | `BOARD` |
| 3 | `Character-Sheet-LUDUS.xlsx` | um por aluno, ele edita | — |

A corrente é: **Painel → Class Board → ficha de cada aluno.** O elo do meio existe porque o
IMPORTRANGE é autorizado por arquivo inteiro, não por intervalo.

### Montagem

1. Suba os três no Drive e abra cada um. **Arquivo → Salvar como Planilhas Google.**
2. No **Class Board**, cole o link do Painel na célula amarela `C5` da aba BOARD,
   clique em `B6` e aperte **Permitir acesso**.
3. Compartilhe o Class Board: **Qualquer pessoa com o link → Leitor.** Copie esse link.
4. Guarde a **Character Sheet** como MODELO. Para cada aluno, faça uma cópia, renomeie,
   escreva o nome dele em `C8` exatamente como está no Painel, e cole o link do Class Board
   na célula amarela lá embaixo (`C56`). O aluno clica em **Permitir acesso** uma vez
   (célula `B60`).

> ⚠ **23/09/2026 — a ficha virou DUAS COLUNAS, layout do Fábio, v3.0.** O nome do aluno
> continua em **`C8`**; o link do Class Board é **`C56`** e o IMPORTRANGE é **`B60`**.
> Campos novos: **Bloodline**, **Hybrid feature** e **Tier** (ao lado do Signature Move).

> ⚠ **24/09/2026 — a seção `4 · Your Moves` entrou na ficha.** Os seis Moves com o
> modificador calculado automaticamente do Focus correspondente, e o nome do Focus ao lado.
> Motivo: na sessão piloto a pergunta que mais aparecia no meio da cena não era o que um
> Move faz — era **de qual Focus ele é** ("read the room is wit? or empathy?"). O aluno não
> digita nada ali; cada célula aponta direto para a célula do Focus, e qual Move usa qual
> Focus vem do `core/system.js`.
> As cópias antigas do G1SAT precisam ser refeitas a partir deste modelo.

> **Duas regras de layout que valem para sempre.** (1) A ficha tem **177 caracteres de
> largura**, ~1290 px — cabe na tela a 100% sem barra horizontal, e isso é um requisito, não
> um acaso: rolagem horizontal numa planilha que o aluno deixa aberta por duas horas custa
> mais do que qualquer dica ganha. (2) **Uma dica só ocupa célula se disser algo sobre o
> CONTEÚDO daquele campo.** Repetir as opções que já estão no menu suspenso é poluição.
> Explicação de funcionamento vai para a aba REFERENCE — foi para lá que mudaram Spotlight
> Tokens, Language Points, Pack, Boons, Flame e Taper charge.

> ⚠ **NUNCA reorganize a ficha dentro do Google Sheets.** Mover linha com intervalo nomeado
> em cima quebra os nomes sem avisar: na cópia que originou este layout, 19 dos 34 voltaram
> `#REF!` e outros 4 passaram a apontar para células erradas — `LUD_archetype` caiu em cima
> da nota de Wit. O sidebar teria escrito "Diplomat" no Wit de um aluno sem dar erro nenhum.
> Mudança de layout se faz no `build_ficha.py` e se regenera.

---

## O sidebar

Os arquivos estão em `planilhas/apps-script/`: **`Code.gs`** e **`Sidebar.html`**.

### Por que desta vez funciona

A tentativa anterior provavelmente endereçava células por `A1`, `B12` e assim por diante — e
qualquer mexida no layout quebrava tudo. Este endereça **só por intervalo nomeado**. A ficha
agora nasce com **32 células nomeadas** (`LUD_charName`, `LUD_pack1`, `LUD_money_handful`…),
criadas pelo `build_ficha.py`. O Google preserva intervalos nomeados na importação do .xlsx.
Se eu mudar o layout amanhã, o sidebar continua achando cada campo.

### Instalação — uma vez só, no MODELO, antes de copiar para os alunos

1. Abra o modelo da ficha no Google Sheets.
2. **Extensões → Apps Script.**
3. Apague o que estiver no `Code.gs` e cole o `Code.gs` daqui.
4. No `+` ao lado de "Arquivos", escolha **HTML**, nomeie **exatamente `Sidebar`**, e cole
   o `Sidebar.html`.
5. Salve. Recarregue a planilha. Aparece um menu **Ludus**.
6. **Ludus → Open character sheet.** Autorize uma vez.

Toda cópia que você fizer do modelo leva o script junto.

### O que o sidebar faz

Painel lateral com tema escuro e serifado. Em cima, o bloco azul do Class Board — Growth,
Language Focus, se apresenta, ações, próxima lição — só leitura. Embaixo, os campos amarelos
em seções, cada um salvando na célula certa assim que o aluno clica fora. Focuses e Archetype
viram menus. Language Points e Spotlight Tokens ganham um botão **Spend one**, que desconta
sem deixar passar de zero e devolve a frase *"say it out loud, in English"*.

### ⚠ O ponto honesto sobre o sidebar

**Cada aluno vai precisar autorizar o script na primeira vez**, e o Google mostra uma tela de
aviso de app não verificado — aquela do "Avançado → Ir para (não seguro)". Com trinta
adolescentes, isso é chamado de suporte.

Por isso eu fiz as duas coisas: **a ficha em si já ficou bonita sem script nenhum.** Grade
desligada, margem à esquerda, faixa preta de título, bandas azuis de seção, alturas de linha
generosas, aba colorida. Abre bonita em qualquer lugar, sem autorizar nada.

**Minha sugestão:** rode o sidebar primeiro só na sua cópia e na de um ou dois alunos mais
tranquilos com tecnologia. Se a tela de autorização não virar problema, espalhe. Se virar, a
ficha sozinha já resolve o "sem sal" que te incomodava.

---

## Detalhe técnico que vale saber

A ficha agora tem DUAS fórmulas de consulta: o **Kit** puxa `REFERENCE!$B$6:$C$9` pelo
Archetype, e a seção **Your flame** puxa `REFERENCE!$B$61:$E$64` pela cor da flame (Focus,
spark e taper — o aluno não digita nenhum dos três). A tabela das flames fica num bloco de
linhas FIXO na aba REFERENCE, justamente para não andar quando uma tabela acima dela cresce;
o `build_ficha.py` tem um `assert` que quebra o build se as duas colidirem. Testei
recalculando: *Red flame* traz Courage, *Steady* e *Reinforce*.

A fórmula de Kit puxa `REFERENCE!$B$6:$C$9` pelo Archetype. Ela estava
apontando para o intervalo errado nesta rodada e foi corrigida — testei recalculando: escolher
*Diplomat* traz "A sealed letter · a silver ring · a warm cloak · a small mirror". O bloco azul
mostra `—` até você ligar o Class Board, que é o comportamento certo.
