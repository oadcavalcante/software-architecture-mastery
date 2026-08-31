---
id: data-flow-diagrams
title: Diagramas de Fluxo de Dados
sidebar_position: 8
description: Por onde o dado passa, onde ele para, e onde ele atravessa fronteira.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor sabe mapear o caminho de um dado através de sistemas e usar isso
  para privacidade, segurança e propriedade.
prerequisites: [container-diagrams]
related: [sequence-diagrams, container-diagrams, c4-model]
canonical_for: [diagrama de fluxo de dados, ponto de repouso, travessia de fronteira de confiança]
content_version: 1
last_reviewed: 2026-08-29
---

# Diagramas de Fluxo de Dados

## Visão Geral

Um diagrama de fluxo de dados segue **um tipo de dado** através dos sistemas: onde ele
nasce, por onde passa, onde é armazenado, quem o lê, e onde ele sai.

Ele é organizado pelo dado, não pelo sistema — e é essa mudança de eixo que o torna útil
para perguntas que nenhum diagrama estrutural responde bem:

```text
onde este dado pessoal está armazenado?
quem tem acesso a ele?
ele sai da nossa fronteira?
quantas cópias existem?
o que acontece quando o cliente pede exclusão?
```

## Problema

Diagramas estruturais são organizados por sistema. Uma pergunta sobre dado atravessa
todos eles, e a resposta precisa ser montada juntando diagramas — o que na prática
significa que ninguém sabe.

E a pergunta aparece em contextos onde errar tem consequência:

```text
regulação de privacidade    onde está o dado pessoal, quem acessa
segurança                   onde ele atravessa fronteira de confiança
propriedade                 quem é a origem, quem tem cópia
custo                       quantas vezes ele é replicado
```

O caso concreto mais comum: um pedido de exclusão de dados pessoais chega, e a organização
não consegue enumerar onde o dado está.

## Conceitos Centrais

### Os elementos

```text
origem e destino externos   de onde vem, para onde vai
processos                   o que transforma o dado
armazenamentos              onde ele repousa
fluxos                      o movimento, rotulado com o que trafega
fronteiras de confiança     onde o dado muda de domínio de controle
```

A última é a que distingue este diagrama dos demais: a **fronteira de confiança** é uma
linha atravessando o desenho, e cada fluxo que a cruza é um ponto de atenção.

### Pontos de repouso importam mais que o trânsito

O reflexo é desenhar as setas. O conteúdo mais valioso são as caixas de armazenamento:

```text
banco operacional
réplica de leitura
cache
fila (retenção de N dias)
armazém analítico
arquivo de exportação
registro de aplicação
cópia de segurança
ambiente de homologação com dados reais
```

As quatro últimas são as esquecidas, e frequentemente as mais problemáticas. Registros de
aplicação com dado pessoal, backups com retenção de sete anos e homologação carregada com
cópia de produção aparecem em quase todo mapeamento sério.

Ver [proteção de dados](/10-security/data-protection.md).

### Fronteiras de confiança

```text
nossa rede → provedor de nuvem
nosso sistema → parceiro externo
produção → analítico
região A → região B
sistema interno → dispositivo do cliente
```

Cada travessia merece resposta a três perguntas: o que trafega, com qual proteção, e sob
qual base contratual ou legal.

Este diagrama é a entrada canônica para
[modelagem de ameaças](/10-security/threat-modeling.md) — a técnica STRIDE
é aplicada elemento a elemento sobre ele.

### Um diagrama por tipo de dado

Como o de sequência, o escopo é estreito por natureza:

```text
"dados de cliente"          um diagrama
"dados de pagamento"        outro
"telemetria"                outro
"todos os dados"            não é um diagrama
```

Na prática, os tipos que valem o esforço são poucos: os regulados, os sensíveis e os que
têm disputa de propriedade.

### Ele revela propriedade

Ao seguir o dado, a pergunta "quem é o dono disto" fica respondível: o dono é quem o
produz e tem autoridade sobre a definição.

O diagrama frequentemente mostra o contrário do organograma — o dado que o time A
"possui" nasce num sistema do time B e é modificado por um processo do time C.

Ver [propriedade do dado](/07-data-architecture/data-ownership.md) e
[ciclo de vida do dado](/07-data-architecture/data-lifecycle.md).

### Ele responde ao pedido de exclusão

Uma consequência prática: sem o mapeamento, atender a um pedido de exclusão é adivinhação.
Com ele, é uma lista.

E o mapeamento costuma mostrar que a exclusão completa é mais difícil do que se supunha —
backups imutáveis, agregados analíticos já calculados, e registros de aplicação com
retenção fixa são casos que exigem decisão, não código.

### Retenção pertence ao diagrama

Cada ponto de repouso tem um tempo de permanência, e anotá-lo no próprio desenho muda o
que ele responde:

```text
banco operacional     enquanto o cliente existir
cache                 15 minutos
fila                  7 dias
registro de aplicação 90 dias
armazém analítico     indefinido
cópia de segurança    7 anos
```

A coluna de retenção transforma o mapa num instrumento de decisão: ela mostra que o dado
excluído do banco operacional continua existindo em outros cinco lugares, por prazos que
ninguém escolheu deliberadamente. Ver
[ciclo de vida do dado](/07-data-architecture/data-lifecycle.md).

## Modelo Mental

**Siga o dado, não o sistema.** Onde ele para importa mais que por onde ele passa.

## Quando Usar

- Para dados pessoais ou regulados, sempre.
- Como entrada para modelagem de ameaças.
- Ao definir propriedade de dado entre times.
- Antes de responder a requisitos de privacidade.
- Ao avaliar custo de replicação.

## Quando Não Usar

**Para todos os dados.** Escolha os que importam.

**Como substituto de diagrama estrutural** — ele não descreve o sistema.

**Sem marcar fronteiras de confiança** — perde o principal.

**Sem os pontos de repouso secundários** — registros, backups, homologação.

**Uma vez só.** Um mapeamento de 2023 não descreve 2026.

## Alternativas

- **Catálogo de dados** — inventário estruturado, mais completo e menos visual. Ver
  [ciclo de vida do dado](/07-data-architecture/data-lifecycle.md).
- **Registro de tratamento** — a forma exigida por algumas regulações; textual.
- **Linhagem de dados** — automatizada, mostra derivação, não fronteira de confiança.
- **[Sequência](/17-architecture-documentation/sequence-diagrams.md)** — quando a pergunta é ordem, não localização.

A linhagem automatizada é complementar: ela cobre o que o mapeamento manual esquece, e não
distingue o que é sensível.

## Trade-offs

| Fluxo de dados | Estrutural |
|---|---|
| Eixo é o dado | O sistema |
| Atravessa fronteiras | Um escopo |
| Responde a privacidade | A mudanças |
| Um por tipo de dado | Um por sistema |

| Manual | Linhagem automatizada |
|---|---|
| Inclui intenção e fronteira | Só derivação observada |
| Desatualiza | Atual |
| Curado | Completo e ruidoso |

## Modos de Falha

**Só o trânsito.** Sem os pontos de repouso, o mapa não serve.

**Registros esquecidos.** Dado pessoal em log é o caso mais comum.

**Homologação com dado real** não mapeada.

**Backup fora do escopo.** E com a maior retenção.

**Sem fronteiras de confiança.** Vira um diagrama estrutural mal feito.

**Feito uma vez** para uma auditoria, e nunca mais.

## Erros Comuns

**Mapear só o caminho principal.**

**Ignorar cópias analíticas.**

**Não registrar retenção** em cada ponto de repouso.

**Confundir com diagrama de sequência.**

**Não usar o resultado** — o mapeamento vira artefato de auditoria em vez de insumo de
decisão.

## Exemplo Real

Uma empresa de saúde precisou mapear o fluxo de dados de paciente para atender a uma
exigência regulatória. A expectativa era confirmar o que já se sabia.

O mapeamento encontrou 23 pontos de repouso. A estimativa inicial da equipe tinha sido 8.

Os 15 não previstos:

```text
registros de aplicação, com identificador e diagnóstico    6 sistemas
ambiente de homologação com cópia de produção              2
exportações agendadas para um parceiro                     1
armazém analítico e três agregados derivados               4
cópias de segurança com retenção de sete anos              1
planilha em um compartilhamento de rede                    1
```

Três travessias de fronteira de confiança não estavam documentadas em lugar nenhum,
incluindo a exportação para o parceiro — feita por um processo agendado criado quatro anos
antes, cujo autor não trabalhava mais na empresa.

As decisões:

**Registros higienizados.** Identificadores mascarados e diagnóstico removido dos
registros de aplicação, com verificação automática na esteira.

**Homologação com dado sintético.** A cópia de produção foi eliminada — o que exigiu
construir geração de dados de teste, um trabalho de dois meses que ninguém tinha
priorizado antes.

**Exportação revista.** O contrato com o parceiro foi renegociado e o escopo dos campos
reduzido de 40 para 9.

**Retenção declarada** em cada ponto de repouso, e implementada onde não existia.

**Procedimento de exclusão** escrito com base no mapa, incluindo o que não pode ser
excluído e por quê — os backups imutáveis viraram uma exceção documentada, com prazo de
expiração natural.

**Mapa revisado semestralmente**, com dono nomeado.

O que a equipe registra: a planilha no compartilhamento de rede foi encontrada por acaso,
numa conversa, e não por nenhum método. Isso levou a uma segunda prática — varredura
automática por padrões de dado sensível em armazenamentos não catalogados.

## Conceitos Relacionados

- [Proteção de Dados](/10-security/data-protection.md).
- [Modelagem de Ameaças](/10-security/threat-modeling.md).
- [Propriedade do Dado](/07-data-architecture/data-ownership.md).
- [Diagramas de Sequência](/17-architecture-documentation/sequence-diagrams.md).

## Exercício Prático

Escolha um tipo de dado sensível do seu sistema e liste todos os pontos onde ele repousa —
incluindo registros, backups, homologação e cópias analíticas.

Compare o total com sua estimativa inicial. A diferença é a medida do que estava
invisível.

## Perguntas de Entrevista

- Por que os pontos de repouso importam mais que os fluxos?
- O que é uma fronteira de confiança e por que ela merece atenção?
- Por que este diagrama é a entrada para modelagem de ameaças?

## Para Aprofundar

- Shostack, Adam. *Threat Modeling*. Wiley, 2014.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Hoberman, Steve. *Data Modeling Made Simple*. 2ª ed. Technics, 2009.
