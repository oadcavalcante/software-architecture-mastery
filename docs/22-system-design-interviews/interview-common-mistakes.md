---
id: interview-common-mistakes
title: Erros Comuns
sidebar_position: 13
description: Os padrões que fazem entrevistas darem errado, com o que fazer em vez disso.
doc_type: concept
level: 0
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor reconhece os erros recorrentes de entrevistas de system design e sabe
  o comportamento que substitui cada um.
prerequisites: [interview-structure]
related: [interview-structure, communicating-tradeoffs, requirement-clarification]
canonical_for: [erro em entrevista de system design, arquitetura decorada, desenho prematuro]
content_version: 1
last_reviewed: 2026-08-29
---

# Erros Comuns

## Visão Geral

Entrevistas de system design dão errado por um conjunto pequeno de razões, e quase nenhuma delas é
falta de conhecimento técnico.

```text
começar a desenhar antes de entender o problema
recitar uma arquitetura decorada
não declarar premissas
propor complexidade sem justificativa
desenhar em silêncio
não fechar o desenho no tempo
```

Todos são corrigíveis com hábito, e é isso que vale a pena catalogar: o candidato que os conhece
consegue observar-se durante a entrevista.

Vale notar que a mesma lista descreve o que dá errado em discussões arquiteturais reais. Desenhar
antes de entender o problema, propor complexidade sem justificativa e não declarar premissas são
falhas de método que custam caro em produção, não apenas em entrevista — o que explica por que
o formato avalia o que avalia.

## Problema

O erro mais frequente é também o mais rápido de cometer: o candidato ouve o enunciado e começa a
falar de solução em menos de trinta segundos.

Ele acontece por uma razão compreensível — silêncio é desconfortável, e falar parece produtivo.
Mas o que se comunica é que o problema não foi considerado.

E há um segundo erro que a preparação convencional produz ativamente: decorar arquiteturas de
referência. Elas funcionam enquanto o enunciado coincide, e colapsam na primeira variação — que o
entrevistador vai introduzir justamente para testá-las.

## Conceitos Centrais

### Desenhar antes de entender

```text
sintoma      caixas no quadro antes de qualquer pergunta
causa        desconforto com o silêncio; ansiedade de produzir
efeito       arquitetura para um problema inventado
em vez disso perguntar por cinco minutos, e anunciar que
             vai perguntar
```

Dizer "vou fazer algumas perguntas antes de desenhar" resolve o desconforto: você está produzindo,
e está claro que é deliberado. Ver
[clarificação de requisitos](requirement-clarification.md).

### Arquitetura decorada

```text
sintoma      a mesma arquitetura para qualquer enunciado;
             componentes que não se ligam a nenhum requisito
causa        preparação por memorização
efeito       colapsa na primeira pergunta de acompanhamento
em vez disso derivar cada componente de um número ou requisito,
             em voz alta
```

O teste que expõe: "por que essa fila está aí?". Quem derivou responde com um requisito e um
número; quem decorou responde "para desacoplar", que não significa nada específico.

Há um segundo teste, mais duro: mudar o enunciado. "E se fossem cem usuários em vez de cem
milhões?" Quem derivou simplifica o desenho na hora, removendo o que a escala justificava. Quem
decorou mantém a mesma arquitetura, porque ela nunca esteve ligada a nenhum número — e essa
resposta é a mais reveladora que uma entrevista produz.

### Não declarar premissas

```text
sintoma      decisões que dependem de suposições não ditas
causa        supor que o óbvio é compartilhado
efeito       o entrevistador não sabe se você considerou ou
             esqueceu; erros só aparecem tarde
em vez disso "vou assumir X" antes de cada decisão que dependa disso
```

Uma premissa errada e declarada custa dez segundos de correção. A mesma premissa errada e
silenciosa derruba o desenho vinte minutos depois.

E há um efeito secundário: premissas declaradas viram um registro do que foi considerado. Ao fim
da entrevista, elas permitem dizer "sob as premissas que assumi, esta é a arquitetura; se alguma
delas estiver errada, a que muda é esta" — o que é uma posição muito mais forte que apresentar um
desenho como se ele fosse incondicional.

### Complexidade sem justificativa

```text
sintoma      microsserviços, fila, cache e índice de busca
             no primeiro desenho
causa        acreditar que complexidade demonstra competência
efeito       o oposto — sugere ausência de julgamento
em vez disso começar simples e acrescentar sob demanda,
             com razão declarada
```

Este é o erro mais mal calibrado entre candidatos de nível intermediário. A resposta forte é
frequentemente a mais simples, com a condição sob a qual ela deixaria de bastar. Ver
[arquitetura de alto nível](high-level-architecture.md).

A calibração errada vem de uma inferência razoável e falsa: a de que a entrevista busca a
arquitetura mais sofisticada que o candidato conhece. Ela busca a mais adequada ao problema
apresentado — e demonstrar que se conhece a sofisticada, sem aplicá-la, é feito em uma frase:
"se a escala fosse 50 vezes maior, eu dividiria assim".

### Desenhar em silêncio

```text
sintoma      minutos de desenho sem narração
causa        concentração; hábito de trabalho individual
efeito       o avaliador não tem o que avaliar
em vez disso narrar o raciocínio, inclusive as dúvidas
```

O que está sendo avaliado é o pensamento, e ele só existe para o avaliador se for verbalizado. Ver
[comunicação de trade-offs](communicating-tradeoffs.md).

### Não gerenciar o tempo

```text
sintoma      minuto 40 sem arquitetura desenhada
causa        ausência de estrutura e de orçamento por fase
efeito       entrevista sem conclusão
em vez disso anunciar as fases e marcar as transições
```

Ver [estrutura da entrevista](interview-structure.md).

### Ignorar ou ceder demais ao entrevistador

Dois erros opostos com a mesma raiz — não ter posição fundamentada.

```text
ignorar    o entrevistador sugere uma alternativa e o candidato
           segue no roteiro sem considerá-la
ceder      qualquer sugestão vira mudança imediata de desenho
em vez disso reconhecer o mérito, explicar a base da escolha, e
           pedir a informação que decidiria
```

Entrevistadores frequentemente sugerem alternativas piores de propósito. Aceitar todas é tão
revelador quanto rejeitar todas.

### Otimizar o que não é gargalo

```text
sintoma      dez minutos otimizando um componente que atende
             a carga com folga
causa        conforto com o assunto conhecido
efeito       o gargalo real não é discutido
em vez disso propagar os números pelo desenho antes de otimizar
```

Ver [identificação de gargalo](bottleneck-identification.md).

### Prometer o que não foi coberto

```text
sintoma      listar dez requisitos e cobrir quatro, sem mencionar
causa        clarificação generosa demais
efeito       o desenho parece incompleto
em vez disso anotar os requisitos, e no fechamento dizer
             explicitamente o que ficou de fora e por quê
```

Dizer "não cobri o painel de análise, que estava na prioridade mais baixa" transforma uma omissão
em escolha. A frase custa cinco segundos e muda o registro que o avaliador faz.

### Números sem consequência

```text
sintoma      cinco minutos de estimativa e nenhuma decisão
             ancorada nos números
causa        tratar a estimativa como ritual
efeito       o tempo é perdido
em vez disso enunciar a consequência logo após cada número
```

Ver [estimativa em entrevista](capacity-estimation.md).

### Discutir tecnologia em vez de arquitetura

```text
sintoma      cinco minutos comparando dois bancos específicos
causa        conforto com o assunto; expectativa de que seja isso
             o avaliado
efeito       a conversa sai do nível de arquitetura
em vez disso nomear por responsabilidade, e citar tecnologia
             como nota
```

## Modelo Mental

**Quase nenhum erro comum é técnico.** Eles são de método: não perguntar, não declarar, não
narrar, não fechar.

## Quando Usar

Este catálogo serve como lista de verificação:

- Antes de uma entrevista, como revisão.
- Depois de uma entrevista, para diagnosticar o que deu errado.
- Durante o treino, como critério de observação.

## Quando Não Usar

**Como fonte de ansiedade** durante a entrevista — monitorar dez erros ao vivo atrapalha mais que
ajuda. Escolha dois para observar.

**Como regra rígida** — há enunciados em que desenhar cedo é correto, porque o entrevistador
pediu.

**Sem praticar** — reconhecer um erro por leitura não o corrige; o hábito se forma em simulação.

## Alternativas

- **Simulação com gravação** — assistir a si mesmo expõe o desenho silencioso e a má gestão de
  tempo melhor que qualquer lista.
- **Entrevista simulada com um par** — o feedback externo pega o que a autoavaliação não pega.
- **Escrever ADRs** — a disciplina de contexto, alternativas e consequências é a mesma, sem
  pressão de tempo. Ver
  [alternativas em ADR](../18-architecture-decisions/adr-alternatives.md).

## Trade-offs

| Monitorar-se | Concentrar-se no problema |
|---|---|
| Corrige hábitos | Melhor raciocínio |
| Divide atenção | Repete os erros |

A resolução prática: escolher dois comportamentos por simulação, e não dez.

## Modos de Falha

**Desenho prematuro.** Problema inventado.

**Recitação.** Colapsa na variação.

**Premissas silenciosas.** Erros aparecem tarde.

**Complexidade injustificada.** Sugere falta de julgamento.

**Silêncio.** Nada a avaliar.

**Sem fechamento.** Entrevista sem conclusão.

## Erros Comuns

Os deste documento, e um meta-erro: **preparar-se decorando soluções em vez de treinando o
método**.

O método transfere para enunciados novos; a solução decorada não. E entrevistadores experientes
introduzem variações justamente porque sabem disso.

## Exemplo de Entrevista

**Um trecho com quatro erros, e a versão corrigida.**

Versão com erros:

```text
entrevistador  "projete um sistema de notificações"

candidato      "ok. Vou usar Kafka para a fila, com consumidores
               em Go, Redis para deduplicação, Cassandra para o
               histórico e um serviço de agendamento. Os
               consumidores escalam horizontalmente..."
```

Quatro erros em vinte segundos: desenhou antes de entender, recitou uma arquitetura, nomeou por
tecnologia, e não declarou nenhuma premissa.

Versão corrigida:

```text
candidato      "Antes de desenhar, algumas perguntas.

               Que tipos de notificação: aplicativo, e-mail, SMS,
               ou todos? Elas são disparadas por evento ou também
               agendadas? Há garantia de entrega, ou o melhor
               esforço basta?

               E sobre escala: proponho 50 milhões de notificações
               por dia, com pico de 10× em campanhas. Faz sentido?

               Por fim: existe requisito de ordem entre notificações
               do mesmo usuário?"
```

Quatro perguntas, cada uma mudando a arquitetura: os canais definem os adaptadores; agendamento
define um componente inteiro; garantia de entrega define persistência e confirmação; ordem define
particionamento.

**O desenho que vem depois, com justificativa:**

```text
"Com o que combinamos — três canais, disparo por evento e
 agendado, entrega ao menos uma vez, sem requisito de ordem —
 desenho assim:

 uma fila, porque a entrega depende de provedores externos com
 disponibilidade fora do nosso controle e não pode bloquear
 quem dispara;

 um armazenamento de deduplicação, porque entrega ao menos uma
 vez significa duplicatas, e o usuário não pode receber a mesma
 notificação duas vezes;

 um adaptador por canal, porque os três têm semânticas de erro
 e limites de taxa diferentes;

 um agendador separado, porque ele tem perfil de carga em lote
 e não pode competir com o disparo por evento."
```

Quatro componentes, quatro razões, nenhum nome de produto. A tecnologia entra como nota, se
perguntada.

A diferença entre as duas versões não é de conhecimento: o candidato da primeira sabia tudo o que
o da segunda sabe, e provavelmente mais. A diferença é que a segunda versão torna o raciocínio
visível e ancorado, e a primeira apresenta um resultado sem mostrar de onde ele veio.

É essa distinção que o formato de entrevista existe para medir — e é por isso que praticar o
método rende mais que estudar mais arquiteturas.

## Conceitos Relacionados

- [Estrutura da Entrevista](interview-structure.md).
- [Clarificação de Requisitos](requirement-clarification.md).
- [Comunicação de Trade-offs](communicating-tradeoffs.md).
- [Arquitetura de Alto Nível](high-level-architecture.md).

## Exercício Prático

Grave uma simulação de vinte minutos e assista.

Conte: quantos segundos até a primeira caixa; quantas premissas declaradas; quantos minutos de
silêncio; e se o fluxo foi fechado. Esses quatro números diagnosticam a maior parte dos problemas.

## Perguntas de Entrevista

- Por que quase nenhum erro comum de entrevista é técnico?
- Por que decorar arquiteturas de referência é uma preparação frágil?
- Por que ceder a toda sugestão do entrevistador é tão revelador quanto rejeitar todas?

## Para Aprofundar

- Xu, Alex. *System Design Interview*. Byte Code, 2020.
- Ford, Neal et al. *Fundamentals of Software Architecture*. O'Reilly, 2020.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.
