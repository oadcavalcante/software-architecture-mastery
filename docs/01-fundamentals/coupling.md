---
id: coupling
title: Acoplamento
sidebar_position: 13
description: O grau em que mudar uma parte obriga a mudar outra — e por que zero não é a meta.
doc_type: concept
level: 1
difficulty: iniciante
status: complete
objective: >
  Ao terminar, o leitor identifica os tipos de acoplamento num sistema e
  argumenta quando acoplamento maior é a escolha correta.
prerequisites: [modularity]
related: [cohesion, dependency-management, separation-of-concerns]
canonical_for: [acoplamento, coupling]
content_version: 2
last_reviewed: 2026-08-26
---

# Acoplamento

## Visão Geral

Acoplamento é o grau em que uma mudança em uma parte do sistema obriga a mudança
em outra.

A afirmação que organiza este documento, e que contraria o que se ensina
normalmente: **acoplamento não é um defeito a eliminar. É uma quantidade a
alocar.** Partes que mudam juntas devem estar acopladas. O problema não é
acoplamento — é acoplamento no lugar errado.

## Problema

"Baixo acoplamento" é repetido como virtude universal, e a repetição esconde a
questão real.

Um sistema com acoplamento zero entre duas partes que sempre mudam juntas não
tem uma propriedade boa — tem duplicação, e duplicação de conhecimento é uma
forma de acoplamento pior, porque é invisível. Quando a regra muda, os dois
lugares precisam mudar, e nada avisa se um foi esquecido.

Inversamente, um sistema que reduziu acoplamento introduzindo camadas de
indireção entre partes que nunca mudam independentemente pagou complexidade por
uma flexibilidade que nunca será exercida.

A pergunta útil não é "como reduzir o acoplamento?". É **"estas duas coisas mudam
juntas?"** — e alocar acoplamento conforme a resposta.

## Conceitos Centrais

### Tipos de acoplamento, do mais forte ao mais fraco

A escala clássica, que continua útil como diagnóstico:

| Tipo | O que significa | Exemplo |
|---|---|---|
| De conteúdo | Uma parte altera o interior da outra | Modificar estado privado diretamente |
| Comum | Compartilham estado global mutável | Variável global, tabela compartilhada |
| Externo | Dependem do mesmo formato ou protocolo externo | Dois módulos parseando o mesmo arquivo |
| De controle | Uma dita o fluxo da outra | Passar uma flag que escolhe o comportamento |
| De marca | Passam mais dados do que o necessário | Receber o objeto inteiro para usar um campo |
| De dados | Trocam exatamente o necessário | Passar o identificador e a quantia |

Acoplamento de dados é o piso desejável. Não há como duas partes cooperarem com
menos que isso.

### Aferente e eferente

**Acoplamento aferente** (Ca): quantos módulos dependem deste. Alto Ca significa
que mudar aqui é caro — muita gente é afetada.

**Acoplamento eferente** (Ce): de quantos módulos este depende. Alto Ce significa
que este módulo é frágil — muita coisa pode quebrá-lo.

A distinção importa porque as consequências são opostas. Um módulo com Ca alto
deve ser estável e mudar pouco; um com Ce alto deve ser periférico e descartável.

Um módulo com **os dois altos** é o pior caso: muda com frequência porque depende
de muita coisa, e cada mudança afeta muita gente. É onde a maioria dos sistemas
degradados concentra o problema.

### Acoplamento temporal

Dois componentes acoplados no tempo precisam estar disponíveis simultaneamente.
Uma chamada síncrona acopla no tempo; uma mensagem em fila não.

Este é o eixo que domina arquitetura distribuída, e é o assunto de
[integração](/08-integration-architecture/index.md). Trocar acoplamento
temporal por acoplamento de formato — a mensagem tem contrato — é a decisão
central de sistemas orientados a eventos.

### Acoplamento é transitivo

Se A depende de B e B depende de C, mudanças em C podem alcançar A. Grafos de
dependência profundos criam caminhos de propagação que ninguém enxerga inteiros.

É por isso que a métrica útil não é o número de dependências diretas, e sim o
tamanho do fecho transitivo.

## Modelo Mental

**Acoplamento é a resposta a: se eu mudar isto, o que mais preciso mudar?**

A pergunta é respondível empiricamente. Um histórico de commits mostra quais
arquivos mudam juntos — que é o acoplamento real, independentemente do que a
estrutura sugere.

## Quando Usar

Acoplamento maior é a escolha correta quando:

- **As partes mudam juntas por natureza.** Um agregado e sua regra de
  consistência. Separá-los produz duplicação e inconsistência.
- **A alternativa é duplicar conhecimento de negócio.** Duplicar uma regra fiscal
  em três lugares é pior que acoplar os três a um módulo fiscal.
- **A indireção não compra flexibilidade real.** Uma interface com uma única
  implementação, que nunca terá outra, é acoplamento disfarçado com custo extra.
- **O custo de coordenação supera o de dependência.** Dois módulos com contrato
  formal entre times que se falam todo dia podem ser um módulo só.

## Quando Não Usar

Reduzir acoplamento é errado quando:

**A flexibilidade comprada nunca será usada.** Abstrair o acesso a dados para
poder trocar de banco, num sistema que nunca trocará, é custo puro.

**A redução produz duplicação de conhecimento.** Se desacoplar dois módulos exige
copiar a mesma regra nos dois, o acoplamento apenas ficou invisível.

**A abstração vaza.** Uma camada que reduz acoplamento nominal mas exige que o
consumidor conheça o outro lado não reduziu nada e adicionou indireção.

**O sistema é pequeno e estável.** Em código que cabe na cabeça e muda pouco, o
custo de navegação da indireção supera o benefício.

## Alternativas

- **Duplicação deliberada** — quando duas partes coincidem hoje mas devem evoluir
  separadamente. Ver [acoplamento vs. duplicação](/20-trade-offs/index.md).
- **Acoplamento por contrato explícito** — manter a dependência, tornando-a
  versionada e negociada em vez de implícita.
- **Inversão de dependência** — manter o acoplamento e inverter sua direção, o
  que é frequentemente mais barato que eliminá-lo.

## Trade-offs

O eixo real é **acoplamento versus duplicação** — mas ele só vale onde as duas
partes compartilham conhecimento. Aí a troca é direta: quem reduz o acoplamento
passa a manter duas cópias do que sabia uma vez, e a decisão é qual dos dois custa
menos neste caso.

Fora desse eixo há acoplamento que se reduz de graça. O acoplamento de marca e o de
controle, na escala acima, saem sem produzir duplicação: passar o identificador e a
quantia em vez do objeto inteiro não duplica nada. E há troca de um tipo por outro —
uma mensagem em fila troca acoplamento temporal por acoplamento de formato, sem
duplicar. O eixo abaixo é o do conhecimento compartilhado, não o de todo
acoplamento.

| Mais acoplamento | Menos acoplamento |
|---|---|
| Uma fonte de verdade | Cada parte evolui sozinha |
| Mudança consistente por construção | Mudança pode divergir sem aviso |
| Menos código | Mais código, possivelmente duplicado |
| Mudança se propaga | Mudança fica contida |
| Fluxo direto e legível | Indireção a navegar |

A regra prática: **acople o que muda junto; duplique o que coincide hoje e deve
divergir amanhã.**

## Modos de Falha

**Módulo pivô.** Um módulo com Ca e Ce altos, que toda mudança atravessa. Vira
gargalo de desenvolvimento e fonte de conflito de merge.

**Acoplamento por banco compartilhado.** Dois serviços lendo a mesma tabela têm
todo o acoplamento de um monolito e nenhum contrato. Mudança de esquema quebra o
outro serviço sem aviso.

**Cascata de falha por acoplamento temporal.** Um serviço lento derruba os que o
chamam de forma síncrona, que derrubam os seus chamadores. Ver
[circuit breakers](/12-reliability/index.md).

**Acoplamento oculto por convenção.** Duas partes que concordam sobre um formato
sem contrato explícito. Nada quebra na compilação; quebra em produção.

## Erros Comuns

**Perseguir acoplamento zero.** Produz duplicação, indireção e abstrações
prematuras.

**Medir acoplamento pela estrutura em vez do histórico.** O grafo de imports
mostra o acoplamento declarado; o histórico de commits mostra o real. Quando
divergem, o histórico está certo.

**Confundir baixo acoplamento com muitas interfaces.** Uma interface com uma
implementação não desacopla — só adiciona um arquivo.

**Ignorar acoplamento temporal.** É o mais caro em sistemas distribuídos e o que
menos aparece em diagramas.

**Tratar acoplamento entre times como acoplamento técnico.** Duas equipes que
precisam coordenar releases estão acopladas independentemente do que o código
mostre.

## Exemplo Real

Um sistema tinha `PedidoService` e `FaturamentoService` separados, comunicando-se
por interface, cada um com seu conjunto de testes. A estrutura parecia
desacoplada.

O histórico de commits contava outra coisa: em dezoito meses, 94% das alterações
em um vieram acompanhadas de alteração no outro, no mesmo commit.

Os dois módulos eram um só, distribuídos em dois lugares. O acoplamento não tinha
sido reduzido — tinha sido escondido atrás de uma interface, ao custo de indireção
e de dois conjuntos de testes que sempre mudavam juntos.

A decisão foi juntá-los, e a interface entre eles virou uma função interna.

O contraexemplo, no mesmo sistema: `PedidoService` e `NotificacaoService` mudavam
juntos em 6% dos commits. Ali a separação era real e valia o custo — e, mais
tarde, permitiu que a notificação virasse assíncrona sem tocar em pedido.

O mesmo instrumento — o histórico — respondeu às duas perguntas.

## Conceitos Relacionados

- [Coesão](/01-fundamentals/cohesion.md) — a outra face da mesma decisão.
- [Modularidade](/01-fundamentals/modularity.md) — onde traçar as fronteiras.
- [Gestão de Dependências](/01-fundamentals/dependency-management.md) — a direção do acoplamento.

## Exercício Prático

Extraia do seu repositório os pares de arquivos que aparecem juntos com mais
frequência nos commits dos últimos seis meses.

Compare com a estrutura de diretórios. Pares muito acoplados em módulos
diferentes são candidatos a juntar; arquivos no mesmo módulo que nunca mudam
juntos são candidatos a separar.

## Perguntas de Entrevista

- Acoplamento zero é desejável? Por quê?
- Qual a diferença entre acoplamento aferente e eferente, e por que importa?
- Como você mede o acoplamento real de um sistema?

## Para Aprofundar

- Martin, Robert C. *Clean Architecture*. Prentice Hall, 2017 — métricas de
  acoplamento de componentes.
- Tornhill, Adam. *Your Code as a Crime Scene*. Pragmatic Bookshelf, 2015 —
  acoplamento medido por histórico de versão.
