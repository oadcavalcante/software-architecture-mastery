---
id: sequence-diagrams
title: Diagramas de Sequência
sidebar_position: 7
description: A ordem no tempo — o diagrama que explica comportamento, não estrutura.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor usa diagramas de sequência para explicar fluxos que estruturas não
  explicam, sem tentar documentar o sistema inteiro com eles.
prerequisites: [container-diagrams]
related: [container-diagrams, data-flow-diagrams, diagram-quality]
canonical_for: [diagrama de sequência, linha de vida, ordem temporal, cenário documentado]
content_version: 1
last_reviewed: 2026-08-29
---

# Diagramas de Sequência

## Visão Geral

Diagramas estruturais mostram **o que existe**. Diagramas de sequência mostram **o que
acontece, em que ordem**.

Essa é a diferença essencial, e ela define o uso: um diagrama de sequência documenta um
**cenário** — um caminho específico através do sistema, do início ao fim.

Ele é o melhor artefato disponível para explicar comportamento distribuído, e o pior para
descrever um sistema inteiro.

## Problema

O diagrama de contêiner mostra que existem seis peças e vinte setas. Ele não responde:

```text
o que acontece quando um pedido é criado?
em que ordem essas chamadas ocorrem?
o que é síncrono e o que é assíncrono?
onde está a transação?
o que acontece se o pagamento falhar no meio?
```

Setas num diagrama estrutural são **relações possíveis**. Um fluxo real percorre um
subconjunto delas, numa ordem específica, com semântica que a seta não carrega.

Em sistemas distribuídos, essa lacuna é grande: a ordem, a sincronia e o tratamento de
falha parcial são exatamente o que torna o comportamento difícil.

## Conceitos Centrais

### Um diagrama, um cenário

```text
"criação de pedido com pagamento aprovado"    ← um cenário
"criação de pedido"                           ← ainda vago
"tudo que o sistema de pedidos faz"           ← não é cenário
```

O cenário precisa de um nome que descreva um caminho, incluindo o desfecho quando ele
importa.

Cenários de exceção merecem diagramas próprios: "pagamento recusado" e "pagamento
aprovado" seguem caminhos diferentes o suficiente para não caberem no mesmo desenho com
condicionais.

### Participantes são contêineres, não classes

O nível de abstração precisa ser explícito, e o mais útil costuma ser o de
[contêiner](/17-architecture-documentation/container-diagrams.md):

```text
Portal → API de Pedidos → Serviço de Pagamento → Fila → Serviço de Estoque
```

Um diagrama de sequência entre classes existe e serve a outro propósito — discutir código,
não arquitetura. Misturar os dois no mesmo desenho produz o mesmo problema de níveis
misturados descrito no [modelo C4](/17-architecture-documentation/c4-model.md).

### Síncrono, assíncrono e resposta

A notação carrega uma distinção que os diagramas estruturais perdem:

```text
seta cheia        chamada síncrona — quem chama espera
seta tracejada    resposta
seta aberta       mensagem assíncrona — quem envia segue
```

Isso importa porque a diferença define disponibilidade composta e latência acumulada. Ver
[mensageria](/06-distributed-systems/messaging.md).

Um fluxo com cinco chamadas síncronas encadeadas é visualmente óbvio num diagrama de
sequência, e invisível num estrutural.

### O que fazer com falha

Aqui está o maior valor deste diagrama em sistemas distribuídos: ele torna o **caminho
infeliz** desenhável.

```text
o que acontece se a terceira chamada falhar?
o que já foi efetivado até ali?
quem compensa?
o cliente recebe o quê?
```

Um diagrama de sequência do caminho de falha frequentemente revela que ninguém sabia a
resposta. Ver
[transações distribuídas](/06-distributed-systems/distributed-transactions.md) e
[sagas](/06-distributed-systems/sagas.md).

### Notação em texto

Diagramas de sequência são o caso em que descrever em texto e gerar funciona
particularmente bem:

```text
Portal ->> API: cria pedido
API ->> Pagamento: autoriza
Pagamento -->> API: aprovado
API -) Fila: pedido confirmado
API -->> Portal: 201
```

O texto é legível sozinho, versiona bem, e o layout automático de sequência é bom — ao
contrário do de diagramas estruturais. Ver
[documentação viva](/17-architecture-documentation/living-documentation.md).

### Eles envelhecem por cenário

A meia-vida de um diagrama de sequência é a do fluxo que ele descreve, e fluxos de negócio
mudam devagar comparados a estrutura de código.

Isso os torna surpreendentemente duráveis — desde que descrevam o fluxo em nível de
contêiner e não de implementação.

### Latência acumulada fica visível

Um efeito colateral útil: com os tempos anotados nas mensagens, o diagrama vira uma
estimativa de latência do fluxo.

```text
Portal → API            5 ms
API → Autorização      80 ms   síncrono
API → Antifraude      120 ms   síncrono
API → Banco            10 ms
                      ————————
                      215 ms antes da primeira resposta
```

Isso torna discutível o que antes era abstrato: as duas chamadas síncronas no meio somam
93% do tempo, e a pergunta "alguma delas pode ser assíncrona?" passa a ter um número ao
lado. Ver [latência](/06-distributed-systems/latency.md).

## Modelo Mental

**Um caminho, no tempo.** Estrutura diz o que existe; sequência diz o que acontece.

## Quando Usar

- Para fluxos que atravessam mais de dois contêineres.
- Para explicar comportamento assíncrono.
- Para documentar o caminho de falha e a compensação.
- Em revisões de desenho, para discutir ordem e sincronia.
- Ao integrar pessoas em fluxos de negócio complexos.

## Quando Não Usar

**Para descrever o sistema.** Ele descreve um caminho.

**Com dezenas de mensagens** — acima de doze, a leitura se perde.

**Com condicionais aninhadas.** Dois cenários, dois diagramas.

**Para fluxos triviais** de duas chamadas — uma frase resolve.

**No nível de classe**, quando a conversa é arquitetural.

## Alternativas

- **Descrição numerada em texto** — para fluxos simples, mais rápida de escrever e ler.
- **[Fluxo de dados](/17-architecture-documentation/data-flow-diagrams.md)** — quando a pergunta é sobre o dado, não a
  ordem.
- **Diagrama de estados** — quando o objeto tem ciclo de vida, e não um caminho.
- **Rastreamento distribuído** — mostra a sequência real, não a pretendida. Ver
  [rastreamento](/13-observability/distributed-tracing.md).

A última merece nota: uma amostra de rastreamento é um diagrama de sequência gerado a
partir do comportamento real, e frequentemente contradiz o desenhado.

## Trade-offs

| Sequência | Estrutural |
|---|---|
| Comportamento | Estrutura |
| Um cenário | O sistema |
| Mostra ordem e sincronia | Só relações |
| Vários diagramas | Um |

| Desenhado | Rastreamento real |
|---|---|
| Mostra a intenção | Mostra o que ocorre |
| Legível e curado | Ruidoso |
| Pode estar errado | Não pode |

## Modos de Falha

**Cenário vago.** "Criação de pedido" sem desfecho.

**Mensagens demais.** Ilegível.

**Condicionais aninhadas.** Dois cenários espremidos.

**Só o caminho feliz.** O caminho de falha é o que precisava de desenho.

**Nível misturado.** Contêineres e classes juntos.

## Erros Comuns

**Documentar apenas o sucesso.** O caminho feliz costuma ser óbvio; o valor do diagrama está em mostrar timeout, compensação e falha parcial.

**Não distinguir síncrono de assíncrono.** É a informação que muda o entendimento de acoplamento e de propagação de falha, e some quando todas as setas são iguais.

**Tentar cobrir o sistema com um diagrama de sequência gigante.** Ele serve para um fluxo específico. Ampliado para tudo, deixa de ser legível e de responder qualquer pergunta.

**Descer ao nível de método numa discussão de arquitetura.** O detalhe de implementação afoga a decisão estrutural que a conversa precisava tomar.

**Não comparar com o rastreamento real.** O diagrama descreve o fluxo pretendido; o rastro distribuído mostra o que acontece. A divergência entre os dois é o achado mais útil.

## Exemplo Real

Uma plataforma de pagamentos tinha um fluxo de checkout que atravessava sete serviços. A
documentação existente era um diagrama de contêiner e uma descrição em prosa.

Incidentes recorrentes: pedidos cobrados sem confirmação, e pedidos confirmados sem
cobrança. Cerca de 40 casos por mês, tratados manualmente.

A equipe desenhou o fluxo em sequência, primeiro o caminho feliz. Ele estava correto e não
revelou nada.

Depois desenharam os caminhos de falha — um diagrama para cada ponto em que uma chamada
podia falhar. Foram sete diagramas, e três deles não puderam ser completados, porque
ninguém sabia o que acontecia:

```text
falha após autorizar o pagamento, antes de gravar o pedido    → ninguém sabia
falha ao publicar na fila, depois de gravar o pedido          → ninguém sabia
tempo esgotado na autorização com resposta tardia             → ninguém sabia
```

Os três correspondiam exatamente aos padrões dos incidentes.

O que saiu do exercício:

**Compensação explícita** para o primeiro caso: autorização revertida quando a gravação
falha, com registro. Ver
[sagas](/06-distributed-systems/sagas.md).

**Publicação transacional** para o segundo — gravação e evento na mesma transação, com
publicação posterior a partir da tabela. Ver
[garantias de entrega](/06-distributed-systems/delivery-guarantees.md).

**Idempotência** na autorização para o terceiro, com chave por pedido. Ver
[idempotência](/06-distributed-systems/idempotency.md).

E uma prática que ficou: **todo fluxo crítico novo precisa de um diagrama de sequência do
caminho de falha antes de ser implementado.** A pergunta "desenhe o que acontece se esta
chamada falhar" passou a fazer parte da revisão de desenho.

Os incidentes caíram de ~40 para menos de 3 por mês em quatro meses.

Um detalhe que a equipe registra: o diagrama do caminho feliz, que já existia informalmente
na cabeça de todos, não tinha nenhum valor de descoberta. O valor inteiro veio dos
diagramas que não conseguiram ser terminados.

## Conceitos Relacionados

- [Diagramas de Contêiner](/17-architecture-documentation/container-diagrams.md) — o nível dos participantes.
- [Fluxo de Dados](/17-architecture-documentation/data-flow-diagrams.md) — a alternativa centrada no dado.
- [Rastreamento Distribuído](/13-observability/distributed-tracing.md) — a sequência
  real.
- [Sagas](/06-distributed-systems/sagas.md).

## Exercício Prático

Escolha um fluxo do seu sistema que atravesse três ou mais serviços e desenhe o caminho de
falha de cada chamada.

Se algum diagrama não puder ser terminado, você encontrou uma lacuna de desenho, não de
documentação.

## Perguntas de Entrevista

- O que um diagrama de sequência mostra que um estrutural não mostra?
- Por que o caminho de falha vale mais que o caminho feliz?
- Como o rastreamento distribuído se relaciona com este diagrama?

## Para Aprofundar

- Fowler, Martin. *UML Distilled*. 3ª ed. Addison-Wesley, 2003.
- Newman, Sam. *Building Microservices*. 2ª ed. O'Reilly, 2021.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
