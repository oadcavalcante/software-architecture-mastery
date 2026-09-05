---
id: schema-evolution
title: Evolução de Esquema
sidebar_position: 14
description: Mudar o contrato sem quebrar quem depende dele — e por que versionar é a última opção, não a primeira.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor classifica mudanças por compatibilidade e evolui esquemas
  sem coordenar implantações.
prerequisites: [integration-contracts]
related: [integration-contracts, event-driven-integration, rest]
canonical_for: [evolução de esquema, compatibilidade retroativa, compatibilidade futura, registro de esquema]
content_version: 2
last_reviewed: 2026-08-27
---

# Evolução de Esquema

## Visão Geral

Todo esquema muda. A questão é se a mudança quebra quem já depende dele.

A técnica central não é versionar — é fazer mudanças **compatíveis**, de forma
que produtor e consumidor possam ser implantados em qualquer ordem, sem
coordenação.

Versionar é o que se faz quando a mudança compatível não é possível. É o último
recurso, e é caro: versões convivem por anos.

## Problema

Numa integração, produtor e consumidor são implantados separadamente e em ordem
imprevisível. Um cliente móvel pode ficar meses sem atualizar. Um evento gravado
hoje pode ser lido daqui a três anos.

Isso significa que, em qualquer instante, existem versões diferentes do esquema
em circulação — nas duas direções.

Uma mudança que exige "implantar o produtor e o consumidor juntos" não é
executável na maioria dos sistemas reais. E tentar executá-la é a origem de
janelas de manutenção e implantações coordenadas que ninguém quer.

## Conceitos Centrais

### As duas direções de compatibilidade

Confundi-las é o erro conceitual mais comum desta área.

**Retroativa.** O código **novo** lê dados **antigos**. É a que importa quando você
atualiza um consumidor e ele precisa continuar processando mensagens gravadas
antes.

**Futura.** O código **antigo** lê dados **novos**. É a que importa quando você
atualiza o produtor primeiro e os consumidores ainda não mudaram.

```text
             dados antigos    dados novos
código novo   retroativa          —
código antigo      —           futura
```

A maioria das situações reais exige **as duas**, porque a ordem de implantação
não é controlada. Um esquema que só tem compatibilidade retroativa obriga a
atualizar todos os consumidores antes do produtor.

### As mudanças, classificadas

```text
sempre compatíveis
  adicionar campo opcional com valor padrão
  adicionar valor a um enumerado que o consumidor trata como aberto
  relaxar validação de entrada
  adicionar endpoint ou operação

quebram compatibilidade futura
  adicionar campo obrigatório
  tornar obrigatório um campo que era opcional

quebram compatibilidade retroativa
  remover campo
  renomear campo
  mudar tipo
  restringir validação

quebram silenciosamente — o pior caso
  mudar o significado de um campo mantendo nome e tipo
  mudar unidade, moeda, fuso ou escala
  mudar o critério de um booleano
```

A última categoria merece o destaque: nenhuma validação detecta. O esquema
continua válido, os testes passam, e o dado passa a significar outra coisa.
Mudança de semântica exige **campo novo**, sempre.

### Ignorar o desconhecido é pré-requisito

Compatibilidade futura só funciona se o consumidor ignorar campos que não
conhece.

Consumidores que falham ao encontrar campo desconhecido tornam **toda** adição
uma quebra — e a adição é justamente a mudança que deveria ser livre.

Isso precisa ser garantido desde o primeiro consumidor, e verificado. Vários
geradores de código produzem, por padrão, desserialização estrita.

### Renomear é remover mais adicionar

Não existe renomear compatível. Toda renomeação é uma remoção — que quebra
retroativa — mais uma adição.

O caminho compatível é a convivência:

```text
1. adicionar o campo novo; o produtor preenche os dois
2. consumidores migram para o novo, um a um, no ritmo deles
3. verificar que ninguém lê o antigo
4. parar de preencher o antigo
5. remover o antigo do esquema
```

Cinco passos, meses de duração, e é a forma que não gera incidente. Times que
pulam para o passo 5 aprendem a sequência do jeito difícil.

O passo 3 é o que exige saber quem consome. Ver
[contratos de integração](/08-integration-architecture/integration-contracts.md).

### Registro de esquema é o gate

Um registro central que armazena os esquemas e **valida a compatibilidade na
publicação** transforma a regra em automação: uma mudança incompatível é
recusada antes de chegar a produção.

Sem ele, a compatibilidade depende de disciplina e revisão — que funcionam até o
dia em que alguém tem pressa.

É o investimento de melhor retorno em qualquer sistema com integração por
eventos.

### Versionar, quando não há saída

Quando a mudança é genuinamente incompatível, resta conviver:

**Na URL** — explícito, fácil de rotear, e o consumidor precisa mudar o endereço.

**No cabeçalho** — o endereço permanece, e fica menos visível.

**No próprio conteúdo** — o esquema carrega sua versão; comum em eventos.

O custo real não é a escolha entre as três. É que **cada versão viva é código a
manter**, e a remoção depende de todos os consumidores migrarem — o que sempre
demora mais do que o planejado.

A pergunta antes de versionar: dá para fazer isso como adição compatível? Na
maioria das vezes dá, com um pouco mais de trabalho de modelagem.

### Evento gravado é permanente

Numa API, versões antigas morrem quando os clientes migram. Num log de eventos,
os dados antigos ficam para sempre.

Isso significa que o código de leitura precisa entender todas as versões já
gravadas, indefinidamente. Ver
[event sourcing](/06-distributed-systems/distributed-event-sourcing.md).

A técnica que sustenta isso é o conversor encadeado: cada versão sabe converter
para a seguinte, e a leitura só conhece a última.

## Modelo Mental

**Compatível é o que permite implantar em qualquer ordem.** Se a mudança exige
coordenação, ela é incompatível — independentemente de parecer pequena.

## Quando Usar

Evolução compatível é o padrão. Sempre que:

- Produtor e consumidor são implantados separadamente.
- Há consumidores que você não controla.
- Os dados persistem além do ciclo de implantação.
- A coordenação de implantações é cara ou impossível.

## Quando Não Usar

**Versionar antes de haver consumidor.** Enquanto a API é interna e tem um
consumidor, mudar direto é mais barato.

**Mudança de semântica disfarçada de compatível.** Trocar a unidade de um campo
passa em qualquer validação e quebra tudo.

**Convivência sem prazo.** Uma versão antiga sem data de remoção nunca sai.

**Compatibilidade eterna por princípio.** Manter campos mortos por anos tem
custo; a remoção planejada faz parte do processo.

**Registro de esquema sem regra de compatibilidade configurada.** Ele vira
catálogo, não gate.

## Alternativas

- **Campo novo em vez de mudança** — resolve a maioria dos casos.
- **Tradução na borda** — uma camada converte entre versões, isolando o núcleo.
  Ver [anti-corruption layer](/08-integration-architecture/integration-anti-corruption.md).
- **Duplo preenchimento** — período em que os dois campos são escritos.
- **Endpoint novo** — em vez de versionar toda a API, versionar a operação que
  mudou.

## Trade-offs

| Evolução compatível | Versionar |
|---|---|
| Implantação em qualquer ordem | Coordenação ou convivência |
| Campos acumulam | Esquema limpo por versão |
| Sem código duplicado | Cada versão é código vivo |
| Migração gradual | Migração explícita |
| Limitada ao que é expressável | Qualquer mudança |

| Registro com gate | Revisão humana |
|---|---|
| Incompatível é recusada | Depende de atenção |
| Regra uniforme | Varia por revisor |
| Infraestrutura a operar | Nenhuma |

## Modos de Falha

**Mudança de semântica.** Passa em tudo e corrompe dados.

**Consumidor estrito.** Falha ao encontrar campo desconhecido.

**Remoção prematura.** Antes de todos migrarem.

**Versão zumbi.** Nunca removida, com um consumidor esquecido.

**Campo obrigatório adicionado.** Quebra o produtor antigo.

**Conversor faltando.** Um evento antigo não pode mais ser lido.

## Erros Comuns

**Confundir retroativa com futura.**

**Renomear direto.**

**Não verificar que o consumidor ignora campos desconhecidos.**

**Mudar unidade ou significado sem campo novo.**

**Não ter registro de esquema em integração por eventos.**

**Versionar como primeira reação** em vez de procurar a forma compatível.

## Exemplo Real

Uma empresa de seguros publicava eventos de apólice consumidos por seis
sistemas.

Um campo `valor_cobertura` era gravado em reais. Numa expansão para outro país,
o time decidiu padronizar em centavos, para evitar arredondamento.

A mudança foi feita mantendo nome e tipo — inteiro. O esquema continuou válido.
O registro de esquema aprovou. Todos os testes passaram.

Durante **nove dias**, os seis consumidores processaram valores cem vezes
menores. Sinistros foram aprovados com limites errados. Relatórios financeiros
saíram inconsistentes. A conciliação identificou o problema, e a correção
envolveu reprocessar nove dias de eventos e revisar centenas de decisões
tomadas.

Nenhum mecanismo automatizado poderia ter pego isso: a mudança era compatível em
estrutura e incompatível em significado.

As mudanças de processo:

**Campo novo para semântica nova.** `valor_cobertura_centavos` foi adicionado, os
dois passaram a ser preenchidos, e o antigo foi removido oito meses depois,
quando os seis consumidores tinham migrado.

**Unidade no nome do campo.** Passou a ser regra: todo campo numérico com unidade
carrega a unidade no nome. Feio, e resolve uma classe inteira de defeito.

**Revisão obrigatória de semântica.** O registro de esquema valida estrutura;
mudanças de significado passaram a exigir aprovação de um segundo time, porque
não há como automatizar.

**Verificação de consumidor estrito.** A auditoria descobriu que dois dos seis
consumidores falhavam com campo desconhecido — ou seja, mesmo uma adição pura
teria quebrado. Foi corrigido antes de qualquer outra mudança.

O que a equipe registra: o registro de esquema deu falsa segurança. Ele garante
que o dado *cabe* no formato, não que *significa* a mesma coisa — e a equipe
tinha passado a confiar nele como se garantisse as duas.

## Conceitos Relacionados

- [Contratos de Integração](/08-integration-architecture/integration-contracts.md) — o contexto.
- [Anti-Corruption Layer](/08-integration-architecture/integration-anti-corruption.md) — tradução na borda.
- [Integração Orientada a Eventos](/08-integration-architecture/event-driven-integration.md).
- [Event Sourcing](/06-distributed-systems/distributed-event-sourcing.md).

## Exercício Prático

Pegue o último esquema que seu time mudou e classifique a mudança: compatível
retroativa, futura, as duas, ou nenhuma?

Depois verifique se um consumidor seu falha ao receber um campo que não conhece.
Se falhar, você não tem compatibilidade futura nenhuma — e toda adição é uma
quebra.

## Perguntas de Entrevista

- Qual a diferença entre compatibilidade retroativa e futura?
- Por que renomear um campo nunca é compatível?
- Que tipo de mudança nenhuma validação de esquema detecta?

## Para Aprofundar

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 —
  capítulo 4.
- Confluent. *Schema Evolution and Compatibility* — documentação do Schema Registry.
- Newman, Sam. *Building Microservices*. 2ª ed. O'Reilly, 2021 — capítulo 5.
