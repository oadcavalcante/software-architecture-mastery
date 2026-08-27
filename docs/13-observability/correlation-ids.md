---
id: correlation-ids
title: Identificadores de Correlação
sidebar_position: 5
description: A técnica mais barata da seção — e o pré-requisito de investigar qualquer coisa em sistema distribuído.
doc_type: pattern
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor propaga identificadores por todos os saltos, incluindo os
  assíncronos, e os inclui em todo sinal emitido.
prerequisites: [observability]
related: [distributed-tracing, logs, debuggability]
canonical_for: [identificador de correlação, propagação de contexto, identificador de requisição]
content_version: 1
last_reviewed: 2026-08-28
---

# Identificadores de Correlação

## Visão Geral

Um identificador de correlação é um valor único gerado na entrada de uma requisição e
**propagado** por todos os componentes que participam do atendimento dela.

Com ele, é possível reunir todos os registros, todas as mensagens e todos os eventos
que pertencem à mesma operação — mesmo que tenham passado por doze serviços e três
filas.

É a técnica de menor custo e maior retorno desta seção. E é o pré-requisito de quase
tudo: sem correlação, logs de sistemas distribuídos são coleções de fragmentos que
ninguém consegue montar.

## Problema

Um usuário reporta que o pedido dele falhou às 14h32.

Sem correlação, a investigação é assim: procurar nos registros do serviço de pedidos
por algo naquele horário; encontrar candidatos; procurar no serviço de pagamento por
registros próximos; tentar casar por horário e por identificador de usuário; repetir
para cada serviço da cadeia.

Isso leva horas, frequentemente não conclui, e piora com o volume — em horário de pico,
há centenas de operações por segundo e nada distingue uma da outra.

Com correlação, é uma consulta.

## Conceitos Centrais

### Gerar na borda, propagar em tudo

```text
1. o identificador é gerado na entrada — gateway, balanceador ou primeiro serviço
2. viaja em todas as chamadas subsequentes
3. aparece em todo registro, métrica de alta cardinalidade e evento emitido
4. volta ao cliente na resposta
```

O passo 4 é frequentemente esquecido e tem valor prático alto: o usuário que reporta um
problema pode informar o identificador, e a investigação começa direto no ponto certo.

Muitos produtos exibem esse valor em mensagens de erro por essa razão.

### Aceitar o identificador de quem chama

Se o chamador já tem um identificador — porque a chamada é parte de uma operação maior
—, ele deve ser reaproveitado, não substituído.

Isso permite correlacionar através de fronteiras organizacionais: um parceiro que envia
o identificador dele permite rastrear a operação nos dois lados.

A regra: aceitar se vier; gerar se não vier. E, por segurança, validar o formato — um
identificador vindo de fora entra em registros e consultas, e vale tratá-lo como
entrada não confiável.

### Os saltos assíncronos são onde a propagação quebra

Propagar em chamadas HTTP é simples: um cabeçalho. O problema aparece nos outros
caminhos:

```text
mensagem em fila       o identificador vai nos metadados da mensagem
tarefa agendada        não há requisição de origem — gera um novo, e registra a causa
processamento em lote  um identificador por execução, mais um por item
webhook recebido       o identificador do parceiro, se houver, mais o seu
trabalho em segundo plano  herda do que o disparou
```

O caso de fila é o mais importante e o mais frequentemente omitido: a cadeia de
investigação quebra exatamente no ponto em que ela ficaria mais difícil de reconstruir
manualmente. Ver
[integração por mensageria](../08-integration-architecture/messaging-integration.md).

### Um identificador não basta

A prática madura usa mais de um, com propósitos diferentes:

```text
identificador de requisição  único por requisição individual
identificador de correlação  o mesmo para toda a operação de negócio
identificador de sessão      agrupa a jornada do usuário
identificador de usuário     permite ver tudo de uma pessoa
```

A distinção entre os dois primeiros importa: uma operação de negócio pode envolver
várias requisições — uma retentativa, uma chamada assíncrona subsequente. O de
requisição as separa; o de correlação as reúne.

Ver [rastreamento distribuído](distributed-tracing.md), que formaliza isso com trace e
span.

### Precisa estar em tudo que é emitido

Um identificador propagado e não registrado não serve. Ele precisa aparecer:

```text
em todo registro de aplicação
em erros retornados ao cliente
em mensagens publicadas
em registros de acesso do gateway e do balanceador
em eventos de auditoria
```

Isso é mais fácil de garantir por infraestrutura que por disciplina: um contexto que
acompanha a execução e uma biblioteca de registro que o inclui automaticamente
eliminam o esquecimento.

Times que dependem de cada desenvolvedor lembrar de incluir têm cobertura parcial — e
a parte que falta é sempre a que faz falta.

### Não coloque dado sensível

O identificador circula amplamente: registros, sistemas de terceiros, mensagens de
erro exibidas ao usuário, tickets de suporte.

Usar o documento do cliente ou o e-mail como identificador espalha dado pessoal por
toda essa superfície. Ver
[proteção de dados](../10-security/data-protection.md).

O identificador deve ser opaco e sem significado.

## Modelo Mental

**O identificador é o fio que costura os fragmentos.** Sem ele, cada serviço conta uma
história separada.

## Quando Usar

- Qualquer sistema com mais de um componente.
- Comunicação assíncrona por fila ou evento.
- Integração com sistemas externos.
- Onde há investigação de incidentes.
- Onde há requisito de auditoria.

## Quando Não Usar

**Como identificador de negócio.** Ele é operacional, não é chave de domínio.

**Contendo dado pessoal.**

**Gerado em cada serviço.** Isso produz identificadores que não correlacionam nada.

**Propagado só em chamadas síncronas.** A cadeia quebra na primeira fila.

**Dependendo de disciplina** em vez de infraestrutura.

**Sem validar** o formato de identificadores recebidos de fora.

## Alternativas

- **[Rastreamento distribuído](distributed-tracing.md)** — a versão completa, com
  estrutura de chamadas e tempos. Correlação é o subconjunto mínimo dele.
- **Correlação por horário e usuário** — o que se faz sem identificador. Lento,
  impreciso e inviável em volume.
- **Identificador de negócio** — número do pedido, por exemplo. Funciona para
  investigar aquele domínio, e não cobre o que acontece antes de ele existir.

## Trade-offs

| Com correlação | Sem |
|---|---|
| Investigação em minutos | Horas ou impossível |
| Custo de propagação mínimo | Nenhum |
| Um campo em todo registro | Registros menores |
| Exige disciplina ou infraestrutura | Nada |

| Um identificador | Vários |
|---|---|
| Simples | Distingue requisição de operação |
| Não separa retentativas | Separa |

## Modos de Falha

**Quebra na fila.** O identificador não vai na mensagem.

**Gerado em vez de propagado.** Cada serviço cria o seu.

**Ausente em parte dos registros.** A cadeia tem buracos.

**Dado sensível no identificador.**

**Não retornado ao cliente.** O usuário não consegue informar qual operação falhou.

**Formato inconsistente.** Cada serviço usa um nome de cabeçalho diferente.

**Perdido em processamento assíncrono interno.** Um trabalho em segundo plano perde o
contexto.

## Erros Comuns

**Propagar só em HTTP.**

**Não incluir no registro automaticamente.**

**Usar dado de negócio como identificador.**

**Não padronizar o nome do cabeçalho** entre serviços.

**Não devolver ao cliente.**

**Não registrar a causa** de trabalhos disparados sem requisição de origem.

## Exemplo Real

Uma plataforma de seguros levava, em média, 4 horas para investigar um problema
reportado por cliente.

O fluxo de contratação passava por sete serviços e duas filas. Os registros existiam,
com bom nível de detalhe, e não se conectavam.

A investigação típica: pegar o horário aproximado informado pelo cliente, procurar em
cada serviço, tentar casar por horário e por documento do cliente — que aparecia em
alguns registros e em outros não.

A implementação de correlação levou três semanas:

**Geração no gateway**, com aceitação de identificador externo quando presente.

**Contexto propagado automaticamente** por uma biblioteca compartilhada, incluindo os
saltos por fila — o identificador passou a ir nos metadados da mensagem.

**Inclusão automática no registro**, sem depender de o desenvolvedor lembrar.

**Retorno ao cliente** em toda resposta, e exibição em mensagens de erro.

O tempo médio de investigação caiu de 4 horas para 12 minutos.

Três problemas apareceram durante a adoção:

**Nomes de cabeçalho divergentes.** Três serviços usavam nomes diferentes, herdados de
implementações independentes. A padronização exigiu um período de aceitar todos.

**Trabalhos em segundo plano sem contexto.** Processos disparados por agendador não
tinham requisição de origem. A solução foi gerar um identificador por execução e
registrar explicitamente o que a originou.

**Documento do cliente usado como correlação** em dois serviços — o que espalhava dado
pessoal por registros e por um sistema de terceiro. Substituído por identificador
opaco.

O que a equipe registra: três semanas de trabalho eliminaram, sozinhas, a maior fonte
de tempo gasto em investigação. Nenhuma ferramenta foi comprada.

## Conceitos Relacionados

- [Rastreamento Distribuído](distributed-tracing.md) — a versão completa.
- [Logs](logs.md) — onde o identificador precisa aparecer.
- [Depurabilidade](debuggability.md).
- [Auditabilidade](../10-security/auditability.md).

## Exercício Prático

Pegue um erro reportado por um usuário e tente reconstruir o caminho completo da
requisição pelos seus registros.

O tempo que levar — e o quanto você conseguir reconstruir — é a medida da sua
correlação atual.

## Perguntas de Entrevista

- Por que a propagação quebra com mais frequência nos saltos assíncronos?
- Qual a diferença entre identificador de requisição e de correlação?
- Por que o identificador não deve conter dado de negócio?

## Para Aprofundar

- Sigelman, Benjamin et al. *Dapper, a Large-Scale Distributed Systems Tracing
  Infrastructure*. Google, 2010.
- W3C Trace Context — especificação de propagação.
- Majors, Charity et al. *Observability Engineering*. O'Reilly, 2022.
