---
id: integration-contracts
title: Contratos de Integração
sidebar_position: 13
description: O que uma ponta promete à outra — e por que integrações morrem por contrato, não por protocolo.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor define contratos que permitem as duas pontas evoluírem
  sem coordenar implantações.
prerequisites: [integration-architecture]
related: [schema-evolution, integration-anti-corruption, rest]
canonical_for: [contrato de integração, contrato dirigido pelo consumidor, teste de contrato]
content_version: 1
last_reviewed: 2026-08-27
---

# Contratos de Integração

## Visão Geral

Um contrato de integração é o que uma ponta promete à outra: quais campos
existem, o que significam, o que é obrigatório, quais erros podem acontecer, e
como a promessa muda ao longo do tempo.

Ele existe em toda integração. A pergunta é se está **declarado** ou se é
implícito — descoberto por quem consome, lendo respostas reais e adivinhando.

Integrações morrem por contrato quebrado. Raramente por escolha de protocolo.

## Problema

O padrão comum: um serviço expõe uma API, outro consome. Nenhum documento diz o
que é garantido.

O consumidor observa o comportamento e passa a depender de coisas que ninguém
prometeu: a ordem dos itens de uma lista, um campo que sempre veio preenchido, o
formato de um identificador, o fato de que certo erro nunca acontece.

Do lado do provedor, ninguém sabe disso. Uma mudança que parece interna —
reordenar, tornar um campo opcional, mudar o formato de um id — quebra
consumidores que ele não sabe que existem.

O defeito aparece em produção, do lado errado, e a discussão vira sobre quem
tinha razão.

## Conceitos Centrais

### O contrato é maior que o esquema

Esquema é a parte fácil e a única que costuma existir. O contrato completo tem
mais:

```text
estrutura      campos, tipos, obrigatoriedade, cardinalidade
semântica      o que cada campo significa, unidade, fuso, moeda
garantias      unicidade, estabilidade de identificador, ordenação
erros          quais códigos, o que cada um significa, o que é retentável
comportamento  idempotência, efeito de repetir, limites de taxa
disponibilidade  latência esperada, janela de manutenção
evolução       como muda, com quanto aviso, por quanto tempo convivem versões
```

As linhas de semântica e de erro são as que mais faltam, e as que mais custam.
Um campo `valor: 1050` sem unidade declarada é uma integração esperando para dar
errado.

### Declarar o que **não** é garantido

Metade do valor de um contrato está em dizer o que a outra ponta não pode
assumir.

"A ordem dos itens não é garantida." "O identificador é opaco; não interprete o
formato." "Campos novos podem aparecer; ignore os desconhecidos."

Sem isso, o consumidor assume tudo que observa. E a assunção não declarada vira
contrato de fato, porque quebrá-la quebra alguém.

### Robustez tem um lado errado

O princípio clássico — seja liberal no que aceita, conservador no que envia —
tem um efeito colateral conhecido.

Um provedor liberal aceita entrada malformada, e os consumidores passam a
depender de ser aceitos assim. Corrigir depois quebra todos eles.

A prática que envelhece melhor: **rigor na entrada, tolerância na saída**.
Rejeite entrada inválida desde o primeiro dia; ignore campos desconhecidos na
resposta que você recebe.

### Contrato dirigido pelo consumidor

A inversão que resolve o problema de "não sei quem depende de quê".

Em vez de o provedor publicar um contrato e torcer, cada consumidor declara o
que usa — em forma executável. O provedor roda essas declarações na sua própria
integração contínua.

O efeito: o provedor sabe, antes de implantar, exatamente qual consumidor quebra.
E pode remover com segurança o que ninguém usa.

É a técnica de maior retorno desta seção, e a menos adotada. Ela exige que os
consumidores sejam conhecidos, o que a torna adequada dentro de uma organização e
inviável para uma API pública.

### Teste de contrato não é teste de integração

**Teste de integração** sobe as duas pontas e verifica o fluxo. Lento, frágil, e
não diz o que quebrou.

**Teste de contrato** verifica cada lado contra o contrato, isoladamente. Rápido,
e aponta a violação exata.

Confundir os dois leva a suítes lentas que continuam deixando quebras passarem.

### Contrato público não se remove

Uma API pública com consumidores desconhecidos não permite remoção. O que se pode
fazer é adicionar, depreciar com aviso longo, e conviver.

Isso muda o desenho: campos e endpoints públicos são compromisso quase permanente.
Expor menos é a decisão que preserva liberdade — e é exatamente o oposto do
instinto de "expor tudo, o consumidor usa o que quiser".

## Modelo Mental

**O contrato não é o que você documentou — é aquilo em que alguém já depende.**
Declarar o contrato é o que transforma dependência acidental em compromisso
conhecido.

## Quando Usar

Contrato explícito se paga sempre que:

- Duas pontas são implantadas independentemente.
- Times diferentes controlam cada lado.
- A integração precisa sobreviver à saída de quem a escreveu.
- Há mais de um consumidor.
- A API é pública.

## Quando Não Usar

**Formalizar contrato entre módulos de um mesmo processo, com um time só.**
Sobrecarga sem benefício — ali o compilador já é o contrato.

**Contrato sem processo de mudança.** Vira documentação desatualizada, o que é
pior que nada: dá falsa confiança.

**Versionar tudo desde o primeiro dia.** Antes de haver consumidor externo, a
liberdade de mudar vale mais.

**Contrato dirigido pelo consumidor em API pública.** Os consumidores não são
conhecidos.

**Documento estático como único contrato.** Ele diverge do código na primeira
semana; o contrato precisa ser verificável.

## Alternativas

- **Esquema executável** — definição de que servidor e cliente derivam código,
  eliminando divergência entre documento e implementação.
- **Registro de esquema** — o contrato central, com compatibilidade validada na
  publicação.
- **Teste de contrato dirigido pelo consumidor** — dentro da organização.
- **Versionamento explícito** — quando conviver é inevitável. Ver
  [evolução de esquema](/08-integration-architecture/schema-evolution.md).

## Trade-offs

| Contrato declarado | Implícito |
|---|---|
| Mudança previsível | Quebra sem aviso |
| Consumidores conhecidos | Desconhecidos |
| Processo a manter | Nenhum |
| Evolução independente | Coordenação a cada mudança |

| Dirigido pelo consumidor | Publicado pelo provedor |
|---|---|
| Sabe quem quebra antes de implantar | Descobre depois |
| Remove o que ninguém usa | Nunca remove |
| Exige consumidores conhecidos | Serve API pública |
| Custo em cada consumidor | Só no provedor |

## Modos de Falha

**Dependência não declarada.** O consumidor depende do que ninguém prometeu.

**Semântica ambígua.** Valor sem unidade, data sem fuso, texto sem codificação.

**Erro não documentado.** O consumidor não sabe o que é retentável.

**Documento divergente do código.** O contrato escrito não é o implementado.

**Remoção quebrando consumidor desconhecido.**

**Robustez virando compromisso.** O provedor aceitava entrada inválida e agora
não pode parar.

## Erros Comuns

**Tratar esquema como contrato completo.**

**Não declarar o que não é garantido.**

**Não documentar os erros.**

**Contrato como documento estático.**

**Expor mais do que o necessário.**

**Não saber quem consome.**

## Exemplo Real

Uma plataforma de pagamentos expunha uma API de consulta de transações,
consumida por sete sistemas internos e dois parceiros externos.

O contrato era um documento escrito uma vez, dois anos antes.

Quatro incidentes ao longo de dezoito meses, todos com a mesma raiz.

**Ordem da lista.** A resposta trazia as transações ordenadas por data, porque a
consulta usava um índice que produzia essa ordem. O contrato não prometia nada.
Uma otimização mudou o plano de execução e a ordem mudou. Um consumidor exibia a
primeira transação como "a mais recente" — passou a exibir qualquer uma.

**Formato do identificador.** Os ids começavam com `tx_`. Um parceiro validava
esse prefixo. A migração para identificadores aleatórios quebrou a integração
dele, em produção, num sábado.

**Campo tornado opcional.** Um campo de descrição sempre vinha preenchido.
Tornou-se opcional para um novo tipo de transação. Três consumidores quebraram —
nenhum tratava ausência.

**Erro novo.** Passou a existir um código de erro para transação em análise.
Consumidores que só tratavam os erros documentados o classificaram como falha
permanente e desistiram de transações que teriam sucedido.

As correções, em ordem de retorno:

**Contrato executável** derivado do código, publicado a cada implantação. O
documento estático deixou de existir.

**Declaração explícita do que não é garantido** — ordem, formato de id,
presença de campos opcionais. Isso foi conversado com cada consumidor conhecido,
e duas dependências indevidas foram descobertas na conversa, antes de quebrarem.

**Testes de contrato dirigidos pelo consumidor** para os sete sistemas internos.
O provedor passou a saber, na integração contínua, quem quebrava. Nos oito meses
seguintes, quatro mudanças foram barradas ali.

**Catálogo de erros** com a classificação de retentável ou não, por código.

Os dois parceiros externos continuaram sem teste de contrato — não há como
executá-lo do lado deles. Para eles, o processo virou aviso com noventa dias e
convivência de versões.

O ponto que a equipe sublinha: os quatro incidentes eram, tecnicamente, mudanças
válidas. O contrato não prometia nada do que foi quebrado. E isso não ajudou
ninguém — o que não está declarado como "não garantido" é assumido como
garantido.

## Conceitos Relacionados

- [Evolução de Esquema](/08-integration-architecture/schema-evolution.md) — como o contrato muda.
- [Anti-Corruption Layer](/08-integration-architecture/integration-anti-corruption.md) — proteção contra
  contrato alheio.
- [REST](/08-integration-architecture/rest.md), [GraphQL](/08-integration-architecture/graphql.md), [gRPC](/08-integration-architecture/grpc.md) — onde o contrato vive.
- [Propriedade do Dado](/07-data-architecture/data-ownership.md).

## Exercício Prático

Pegue uma API que seu time expõe. Liste o que ela **não** garante — ordem,
formato de identificador, presença de campos opcionais, estabilidade de erros.

Depois pergunte a um consumidor quais dessas coisas ele assume. A diferença entre
as duas listas é a sua próxima quebra.

## Perguntas de Entrevista

- O que um contrato precisa dizer além do esquema?
- Por que declarar o que não é garantido é metade do valor?
- Qual a diferença entre teste de contrato e teste de integração?

## Para Aprofundar

- Fowler, Martin. *Consumer-Driven Contracts*, 2006.
- Newman, Sam. *Building Microservices*. 2ª ed. O'Reilly, 2021 — capítulo 5.
- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*.
  Addison-Wesley, 2003.
