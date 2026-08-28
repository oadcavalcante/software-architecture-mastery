---
id: failure-handling
title: Tratamento de Falhas na Entrevista
sidebar_position: 10
description: "Percorra cada componente e responda: o que acontece se ele cair, e o que o usuário vê."
doc_type: concept
level: 0
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor percorre um desenho enunciando o modo de falha de cada componente e a
  degradação escolhida para cada um.
prerequisites: [high-level-architecture]
related: [interview-scaling, bottleneck-identification, communicating-tradeoffs]
canonical_for: [tratamento de falha em entrevista, degradação proposta, percurso de falha]
content_version: 1
last_reviewed: 2026-08-29
---

# Tratamento de Falhas na Entrevista

## Visão Geral

"O que acontece se o banco cair?" é uma das perguntas mais frequentes de entrevistas de system
design, e uma das que mais separa candidatos.

A resposta fraca é "temos réplica". A resposta forte percorre o efeito:

```text
"o banco primário cai. A promoção da réplica leva ~30 segundos,
 durante os quais escritas falham e leituras continuam pelas
 réplicas.

 Nesse período, criação de link retorna erro explícito e
 redirecionamento continua funcionando pelo cache — que é a
 operação que importa.

 Se a queda passar de alguns minutos, o cache começa a expirar
 e os redirecionamentos degradam progressivamente."
```

A diferença não é conhecimento de mecanismo. É ter percorrido o efeito até o usuário.

## Problema

Três padrões de erro.

**Redundância como resposta única.** Todo componente tem réplica, e nenhum modo de falha é
descrito. Redundância reduz a probabilidade de falha, não elimina o efeito quando ela ocorre — e
a pergunta é sobre o efeito.

**Ignorar falha parcial.** O candidato considera apenas "está no ar" ou "está fora", e não os
estados intermediários: lento, respondendo com erro, respondendo errado, respondendo às vezes.
Em sistemas distribuídos, esses estados são mais comuns que a queda completa. Ver
[falha parcial](../06-distributed-systems/partial-failure.md).

**Degradação não desenhada.** "O sistema continua funcionando" — mas como, e com o quê? Um
sistema que degrada sem desenho não degrada: ele falha de formas imprevistas.

## Conceitos Centrais

### Percorra o desenho, componente a componente

O método é mecânico e eficaz:

```text
para cada caixa do desenho:
  se ela cair, o que para de funcionar?
  o que continua?
  o que o usuário vê?
  quanto tempo até se recuperar?
  há alternativa desenhada?
```

Percorrer cinco caixas leva dois minutos e cobre a maior parte do que a entrevista quer avaliar.
Fazer isso proativamente, sem esperar a pergunta, é um movimento forte.

### Falha parcial é o caso comum

```text
completo          o componente não responde
lento             responde além do prazo — pior que não responder,
                  porque consome recursos do chamador
intermitente      responde às vezes
degradado         responde com dado antigo ou incompleto
bizantino         responde errado, sem indicar erro
```

O caso "lento" merece destaque numa entrevista: uma dependência lenta esgota conexões e memória do
chamador, e derruba um sistema que sobreviveria a ela estando completamente fora. É o argumento
para prazo agressivo e disjuntor.

O mecanismo vale ser enunciado, porque ele é contraintuitivo. Quando uma dependência responde em
2 segundos em vez de 20 milissegundos, cada requisição em andamento ocupa uma conexão e um
segmento de execução por cem vezes mais tempo. Com carga constante, o número de requisições
simultâneas no chamador cresce até esgotar o conjunto — e a partir daí ele para de atender tudo,
inclusive o que não depende daquela chamada.

É assim que uma falha localizada vira uma falha total, e é a razão de "sem prazo" ser um defeito
de arquitetura e não um detalhe de configuração.

### Nomeie a degradação de cada componente

```text
componente         se cair, o sistema...
cache              vai ao banco; latência sobe, funciona
réplica de leitura lê da primária; latência sobe
primária           escritas falham; leituras continuam
fila               eventos acumulam; processamento atrasa
serviço externo    aciona o disjuntor; usa alternativa ou recusa
                   explicitamente
índice de busca    busca indisponível; navegação funciona
```

Uma tabela como essa, dita em voz alta em um minuto, cobre a fase de confiabilidade inteira e é
mais informativa que qualquer discussão de mecanismo.

### Distinga o que pode degradar do que não pode

```text
pode degradar     busca, recomendação, análise, notificação
não pode          a operação central do sistema
```

Reconhecer que existe um núcleo sem degradação possível é maduro. Num sistema de pagamento, não
existe modo degradado para autorizar: ou o razão registra, ou a operação é recusada. Ver o
[case de pagamentos](../21-case-studies/payments.md).

Dizer "aqui não há degradação; a operação falha explicitamente e o usuário é informado" é uma
resposta melhor que inventar um caminho alternativo que criaria inconsistência.

A tentação de sempre oferecer um caminho alternativo é forte, porque "o sistema continua
funcionando" soa melhor que "o sistema recusa". Mas aceitar uma operação que não pode ser
concluída corretamente troca uma indisponibilidade visível e curta por uma inconsistência
invisível e indefinida — e a segunda costuma ser muito mais cara de resolver, porque
ninguém sabe quando ela começou nem quantos registros afetou.

### Os mecanismos, com a condição de uso

```text
prazo (timeout)   sempre; sem prazo, uma dependência lenta derruba
                  o chamador
repetição         para falhas transitórias, com recuo exponencial
                  e limite; nunca para operação não idempotente
                  sem chave
disjuntor         quando a dependência tem falha sustentada; evita
                  desperdiçar recursos e dá tempo de recuperação
anteparo          isolar recursos por dependência, para que uma
                  não consuma tudo
alternativa       dado em cache, valor padrão, funcionalidade
                  reduzida
recusa explícita  quando não há alternativa correta
```

Citar o mecanismo é comum; citar a condição é o que demonstra entendimento. "Repetição com recuo
exponencial, mas só para operações idempotentes — para criação de recurso, preciso de chave de
idempotência antes de poder repetir" é uma resposta que poucos dão.

Ver [idempotência](../06-distributed-systems/idempotency.md) e
[repetições](../06-distributed-systems/retries.md).

### Cuidado com repetição que amplifica

```text
"vou repetir três vezes com recuo exponencial. Mas se a
 dependência estiver degradada por sobrecarga, repetir
 multiplica a carga por três justamente quando ela está
 pior — por isso o disjuntor: acima de uma taxa de erro,
 paro de tentar."
```

Reconhecer que repetição pode piorar o problema é um dos sinais mais confiáveis de experiência
operacional.

O mesmo raciocínio se aplica a repetições sincronizadas: se todos os clientes repetem exatamente
após o mesmo intervalo, eles produzem ondas de carga em vez de uma distribuição suave. Por isso o
recuo exponencial vem acompanhado de variação aleatória — sem ela, o mecanismo que deveria aliviar
a dependência a bombardeia em pulsos regulares.

### O que o usuário vê

A parte mais esquecida e a mais valorizada:

```text
"durante a indisponibilidade da fila, o pedido continua sendo
 aceito e o usuário vê 'processando'. Se passar de 10 minutos,
 ele recebe notificação com novo prazo.

 Sem isso, ele fica olhando uma tela que não muda e reenvia —
 o que gera duplicata."
```

Conectar a falha técnica ao que a pessoa do outro lado experimenta é o que distingue quem já
operou um sistema em produção.

E frequentemente essa conexão revela trabalho que não estava previsto. Um fluxo que passa a ter
estado intermediário precisa de tela, de texto, de notificação e de um caminho de suporte para
"e o meu pedido?" — nada disso é código de infraestrutura, e tudo isso é consequência direta da
decisão de arquitetura. Mencionar que essa consequência existe demonstra que o candidato entende
onde o sistema termina.

## Modelo Mental

**Percorra as caixas e conte o que o usuário vê.** Falha parcial é mais comum que queda, e nem
tudo pode degradar.

## Quando Usar

- Depois do desenho e da escala, proativamente.
- Percorrendo componente a componente.
- Enunciando a degradação e o que o usuário vê.

## Quando Não Usar

**Respondendo apenas "tem réplica".**

**Considerando só queda completa.**

**Inventando degradação** onde ela criaria inconsistência.

**Citando mecanismos** sem a condição de uso.

**Sem dizer o que o usuário vê.**

## Alternativas

- **Escolher os três componentes mais críticos** e detalhar apenas eles, quando o tempo aperta.
- **Partir de um cenário** — "e se a região inteira cair?" — em vez de percorrer componentes.
- **Perguntar qual falha interessa** ao entrevistador.

## Trade-offs

| Percorrer tudo | Detalhar os críticos |
|---|---|
| Cobertura completa | Profundidade onde importa |
| Consome tempo | Pode deixar lacuna |

| Degradar | Recusar explicitamente |
|---|---|
| Continua servindo | Sem risco de inconsistência |
| Risco de dado errado | Usuário bloqueado |

## Modos de Falha

**Redundância como resposta.** Não descreve efeito.

**Só queda completa.** Ignora o caso mais comum.

**Degradação inventada.** Cria inconsistência.

**Repetição sem limite.** Amplifica sobrecarga.

**Sem prazo.** Dependência lenta derruba o chamador.

**Sem contar o que o usuário vê.**

## Erros Comuns

**Não mencionar prazo** em nenhuma chamada.

**Repetir operação não idempotente** sem chave.

**Esquecer o caso "lento"**, que é o mais perigoso.

**Não identificar o núcleo** que não pode degradar.

**Propor alternativa que retorna dado errado** sem indicar isso ao usuário.

## Exemplo de Entrevista

**Contexto.** Encurtador de URL: balanceador, serviço, cache, banco, fila de análise.

**Percurso proativo, em dois minutos:**

```text
"Vou percorrer o desenho.

 Cache fora: os redirecionamentos vão ao banco. 12 mil por
 segundo em vez de 600 — o banco não aguenta. Então a queda
 total do cache é um incidente sério, não uma degradação
 suave. Mitigo com cache particionado, para que a perda seja
 parcial, e com limitação de taxa no banco para que ele não
 caia junto.

 Banco primário fora: escritas falham, leituras continuam
 pelas réplicas e pelo cache. Criação de link retorna erro
 explícito; redirecionamento funciona. Isso é aceitável,
 porque redirecionar é a operação crítica.

 Réplica fora: leituras vão à primária. Latência sobe,
 funciona.

 Fila de análise fora: eventos de clique se perdem ou
 acumulam, dependendo do desenho. Como a análise tolera
 atraso e perda pequena, acumular é suficiente — e o
 redirecionamento não é afetado, porque a emissão do evento
 é assíncrona e não bloqueia.

 Balanceador fora: nada funciona. É o ponto único; mitigo
 com redundância e roteamento por DNS."
```

**A pergunta que segue geralmente é sobre o caso lento:**

```text
"E se o cache ficar lento em vez de cair?"

"Esse é o caso pior. Uma resposta de cache em 2 segundos em
 vez de 1 milissegundo esgota o conjunto de conexões do
 serviço, e o serviço para de atender tudo — inclusive as
 requisições que nem dependem do cache.

 Trato com prazo agressivo: 50 ms para o cache. Estourou,
 vou ao banco. E com disjuntor: se a taxa de estouro passar
 de um limiar, paro de consultar o cache por alguns segundos,
 o que dá tempo de ele se recuperar em vez de continuar
 recebendo 12 mil requisições por segundo enquanto está mal."
```

**Pergunta de acompanhamento provável:** "e se uma região inteira cair?"

A resposta correta reconhece que isso é uma decisão de custo, não técnica: replicação
multirregional resolve, custa mais, e o requisito de disponibilidade é o que decide se vale.
Enunciar o trade-off em vez de propor a solução mais robusta é a resposta madura. Ver
[custo vs. confiabilidade](../20-trade-offs/cost-vs-reliability.md).

## Conceitos Relacionados

- [Falha Parcial](../06-distributed-systems/partial-failure.md).
- [Disjuntores](../12-reliability/circuit-breakers.md).
- [Degradação Graciosa](../12-reliability/graceful-degradation.md).
- [Comunicação de Trade-offs](communicating-tradeoffs.md).

## Exercício Prático

Pegue um desenho e escreva, para cada componente, uma linha: o que para, o que continua, e o que
o usuário vê.

Depois marque quais componentes não têm degradação possível. Se todos tiverem, provavelmente você
inventou alguma.

## Perguntas de Entrevista

- Por que o caso "lento" é mais perigoso que a queda completa?
- Por que repetição pode piorar uma sobrecarga?
- Como identificar o que num sistema não pode degradar?

## Para Aprofundar

- Nygard, Michael. *Release It!*. 2ª ed. Pragmatic Bookshelf, 2018.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
