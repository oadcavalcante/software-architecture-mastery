---
id: interview-scaling
title: Escala na Entrevista
sidebar_position: 9
description: A ordem de escalada — o que se tenta primeiro, e por que "adiciono máquinas" raramente é a resposta completa.
doc_type: concept
level: 0
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor propõe escalada na ordem certa, do mais barato ao mais estrutural, com
  justificativa por etapa.
prerequisites: [bottleneck-identification]
related: [bottleneck-identification, failure-handling, high-level-architecture]
canonical_for: [escala em entrevista, ordem de escalada, escalada barata primeiro]
content_version: 1
last_reviewed: 2026-08-29
---

# Escala na Entrevista

## Visão Geral

Depois de identificar o gargalo, a pergunta é como removê-lo. E existe uma ordem, do mais barato
e reversível ao mais estrutural e caro:

```text
1. otimizar o que já existe        índice, consulta, formato
2. cache                           evitar o trabalho
3. escala vertical                 máquina maior
4. escala horizontal sem estado    mais instâncias
5. réplicas de leitura             distribuir leitura
6. particionamento                 distribuir escrita
7. mudança de arquitetura          assíncrono, materialização, CQRS
```

Propor o item 6 quando o item 2 resolveria é o erro mais comum de candidatos que estudaram
sistemas de grande escala. A ordem existe porque cada degrau custa mais complexidade permanente
que o anterior.

## Problema

Dois padrões de erro.

**Pular direto ao particionamento.** "Precisa escalar, então vou particionar por identificador de
usuário." Particionar é a resposta mais visível e uma das mais caras: ela introduz consultas
distribuídas, rebalanceamento, chaves quentes e transações que atravessam partições.

Se o gargalo é leitura, particionar não resolve nada — réplicas resolvem. Se o gargalo é conjunto
quente maior que a memória, particionar o cache resolve; particionar o banco não.

**Responder "adiciono máquinas" a tudo.** Funciona para componentes sem estado e falha para os
demais. E não distingue os casos em que a máquina adicional piora — mais instâncias disputando o
mesmo bloqueio aumentam a contenção.

## Conceitos Centrais

### Comece pelo que não muda a arquitetura

```text
"antes de particionar, vou verificar se há índice adequado.
 Uma consulta de 800 ms que vira 8 ms com o índice certo
 elimina o problema sem nenhuma mudança estrutural."
```

Essa frase é desproporcionalmente valiosa numa entrevista, porque candidatos raramente a dizem. A
maior parte dos problemas de desempenho em sistemas de informação é de acesso a dados, não de
arquitetura. Ver
[desempenho vs. manutenibilidade](../20-trade-offs/performance-vs-maintainability.md).

### Cache resolve leitura, não escrita

```text
gargalo de leitura    cache é a primeira resposta
gargalo de escrita    cache não ajuda; pode até piorar,
                      pela invalidação
```

E cache tem pré-condições que valem enunciar:

```text
o conjunto quente cabe em memória a custo aceitável
há tolerância a dado levemente desatualizado
a taxa de acerto esperada é alta o suficiente
existe uma estratégia de invalidação
```

Propor cache sem mencionar invalidação é o erro que quase sempre gera uma pergunta de
acompanhamento — e é melhor antecipá-la.

A resposta antecipada não precisa ser elaborada: "invalidação por evento na escrita, com tempo de
vida curto como rede de segurança" cobre a maior parte dos casos e demonstra que o problema foi
considerado. O que não funciona é propor cache e, quando perguntado, descobrir a questão da
invalidação ao vivo.

### Vertical antes de horizontal, às vezes

```text
"a máquina atual tem 16 GB. Antes de distribuir o cache,
 vale considerar uma de 256 GB — o conjunto quente de 30 GB
 caberia com folga, e eu evitaria a complexidade de
 particionamento."
```

Escala vertical tem má fama e um teto real, e dentro desse teto ela é a opção mais simples.
Máquinas modernas comportam centenas de gigabytes de memória e dezenas de núcleos, o que cobre
uma faixa de problemas muito maior do que a intuição sugere.

Reconhecer isso demonstra proporcionalidade. Ver
[escala vertical](../11-scalability/vertical-scaling.md). O limite dela é real e vale enunciar
junto: existe um teto de máquina, e ela não oferece tolerância a falha — uma instância maior
continua sendo uma instância.

### Horizontal exige ausência de estado

```text
"o serviço é sem estado, então escalo horizontalmente
 adicionando instâncias atrás do balanceador.

 Se houvesse sessão em memória, eu precisaria ou externalizar
 a sessão, ou usar afinidade de sessão — e a primeira é melhor,
 porque afinidade impede rebalanceamento e complica implantação."
```

Ver [statelessness](../11-scalability/statelessness.md).

### Réplicas de leitura, com a consequência declarada

```text
"adiciono réplicas para distribuir leitura. A consequência é
 atraso de replicação: uma leitura logo após uma escrita pode
 ver dado antigo.

 Para o caso do próprio autor, roteio para a primária por
 alguns segundos. Para os demais, o atraso é aceitável dado
 o requisito de 30 segundos que levantamos."
```

Propor réplicas sem mencionar o atraso é incompleto; mencioná-lo e resolver o caso do próprio
autor é a resposta forte. Ver
[consistência forte vs. eventual](../20-trade-offs/strong-vs-eventual-consistency.md).

### Particionamento: a chave é a decisão

Quando o particionamento se justifica, a escolha da chave é o conteúdo:

```text
"vou particionar por identificador de usuário, porque a consulta
 dominante filtra por usuário e a distribuição é razoavelmente
 uniforme.

 O risco é chave quente: usuários com atividade muito acima da
 média concentram carga numa partição. Se isso acontecer, trato
 essas contas separadamente."
```

Três elementos: a chave, a razão, e o risco. Ver
[particionamento](../11-scalability/scaling-partitioning.md) e
[pontos quentes](../11-scalability/hotspots.md).

### Mudança de arquitetura é o último degrau

```text
tornar assíncrono         quando a latência da dependência domina
materializar              quando a leitura domina e o cálculo é caro
separar leitura e escrita quando os dois têm perfis muito diferentes
```

Esses movimentos resolvem classes de problema que os degraus anteriores não resolvem, e custam
complexidade permanente — estado intermediário, consistência eventual, mais componentes a operar.

Propô-los é correto quando os degraus anteriores foram considerados em voz alta. Propô-los
primeiro é o erro.

### Diga onde você pararia

```text
"nesta escala eu pararia no cache. Réplicas e particionamento
 seriam prematuros, e eu os deixaria como próximos passos
 documentados, com o gatilho: réplicas quando a leitura no banco
 passar de 5 mil por segundo, particionamento quando a escrita
 passar de 10 mil."
```

Declarar o ponto de parada com gatilho numérico é a resposta mais madura possível a uma pergunta
de escala. Ela mostra que o candidato sabe escalar e sabe quando não.

Há uma razão para isso ser tão valorizado: em produção, a maior parte das decisões de escala é
sobre **quando**, não sobre **como**. Os mecanismos são conhecidos e documentados; o julgamento
difícil é decidir se o momento chegou. Um candidato que só sabe listar mecanismos demonstra
leitura; um que sabe dizer o gatilho demonstra que já esteve na posição de decidir.

E o gatilho tem um segundo uso: ele vira métrica. Dizer "réplicas quando a leitura passar de 5 mil
por segundo" é, na prática, definir um alarme — e conectar arquitetura a operação dessa forma é
exatamente o que se espera de uma posição sênior.

## Modelo Mental

**Suba a escada na ordem, e diga em que degrau você para.** Cada degrau custa mais complexidade
permanente que o anterior.

## Quando Usar

- Depois de identificar o gargalo, nunca antes.
- Na ordem, mencionando os degraus que você pulou e por quê.
- Com gatilho numérico para os degraus que ficaram de fora.

## Quando Não Usar

**Pulando ao particionamento.**

**Propondo cache para gargalo de escrita.**

**Escalando horizontalmente componente com estado**, sem tratar o estado.

**Sem declarar a consequência** de cada degrau — atraso de replicação, invalidação, chave quente.

**Sem dizer onde parar** — escalar indefinidamente numa entrevista sugere que não há critério.

## Alternativas

- **Reduzir a carga** em vez de aumentar a capacidade: limitar taxa, agregar, tornar aproximado.
- **Mudar o requisito** — questionar se a exatidão ou a latência exigidas são reais é legítimo e
  frequentemente produtivo.
- **Aceitar o limite** — declarar que a escala atual não exige ação.

A primeira é subestimada: limitar taxa por cliente, agregar eventos numa janela ou tornar um
contador aproximado resolvem problemas de escala sem nenhuma infraestrutura adicional.

## Trade-offs

| Escalar cedo | Escalar sob gatilho |
|---|---|
| Pronto para o crescimento | Complexidade proporcional |
| Custo antecipado | Trabalho quando precisar |

| Vertical | Horizontal |
|---|---|
| Simples, sem mudança de desenho | Sem teto |
| Teto real | Exige ausência de estado |
| Ponto único de falha | Tolerância a falha |

## Modos de Falha

**Particionamento prematuro.** Complexidade permanente sem necessidade.

**Cache para escrita.** Não resolve, e a invalidação piora.

**Horizontal com estado.** Comportamento inconsistente entre instâncias.

**Consequência não declarada.** Atraso de replicação surpreende.

**Escalar sem parar.** Nenhum critério visível.

## Erros Comuns

**Não considerar índice** antes de mudar a arquitetura.

**Descartar escala vertical** por reflexo.

**Propor cache sem estratégia de invalidação.**

**Escolher chave de partição** que não aparece na consulta dominante.

**Não mencionar chave quente.**

## Exemplo de Entrevista

**Contexto.** Feed de notícias. Gargalo identificado: a montagem do feed faz 96 consultas por
abertura, e são 15 mil aberturas por segundo — 1,4 milhão de consultas por segundo no banco.

**Pergunta.** "Como você escala isso?"

**Resposta, subindo os degraus:**

```text
"Primeiro, o barato: os índices estão adequados? Uma consulta
 de posts por autor com ordenação por data precisa de índice
 composto. Vou assumir que sim, mas verificaria — 1,4 milhão
 de consultas por segundo com índice ruim é um problema
 diferente.

 Segundo, cache: eu poderia cachear as consultas por autor.
 Ajuda, mas não resolve a estrutura — continuo fazendo 96
 consultas, mesmo que rápidas. O problema não é a latência
 de cada uma, é o número delas.

 Terceiro, réplicas: distribuiria a leitura, mas 1,4 milhão
 por segundo exigiria dezenas de réplicas. Resolve com dinheiro
 e não resolve bem.

 Aqui os degraus baratos se esgotam, e o problema é estrutural:
 estou fazendo trabalho na leitura que poderia ter sido feito
 na escrita.

 Quarto, mudança de arquitetura: materializar o feed. Na
 publicação, escrevo o post na lista de cada seguidor. A leitura
 vira uma consulta em vez de 96.

 A consequência: 500 milhões de posts por dia × seguidores
 médios. Para a maioria, isso é barato. Para contas com milhões
 de seguidores, é proibitivo — então uso estratégia híbrida:
 materializo para contas pequenas, consulto na leitura para as
 grandes, e mesclo."
```

**Onde parar:**

```text
"Eu pararia aqui. Particionar o armazenamento do feed
 materializado seria o próximo degrau, e o gatilho seria o
 volume de feeds não caber no armazenamento atual — algo em
 torno de 600 GB no meu cálculo, com folga larga.

 Não faria isso agora."
```

**Pergunta de acompanhamento provável:** "e se a materialização não fosse possível?"

A resposta correta reconhece o que isso implicaria — leitura com 96 consultas, exigindo réplicas
em escala e cache agressivo por autor — e enuncia o custo: dezenas de réplicas contra um
armazenamento de feed de algumas centenas de gigabytes. A comparação de custo é o argumento.

Ver o [case de rede social](../21-case-studies/social-network.md) para a versão completa.

## Conceitos Relacionados

- [Identificação de Gargalo](bottleneck-identification.md) — o passo anterior.
- [Escala Horizontal](../11-scalability/horizontal-scaling.md).
- [Particionamento](../11-scalability/scaling-partitioning.md).
- [Cache](../05-system-design/caching.md).

## Exercício Prático

Pegue um gargalo do seu sistema e escreva a escada completa: o que você tentaria em cada degrau, e
por que pararia onde parou.

Depois escreva o gatilho numérico de cada degrau que ficou de fora. Essa lista é uma resposta de
entrevista pronta e um plano de capacidade real.

## Perguntas de Entrevista

- Por que particionar não resolve gargalo de leitura?
- Por que escala vertical merece ser considerada antes de horizontal?
- Por que declarar onde você pararia é a resposta mais madura?

## Para Aprofundar

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Xu, Alex. *System Design Interview*. Byte Code, 2020.
- Nygard, Michael. *Release It!*. 2ª ed. Pragmatic Bookshelf, 2018.
