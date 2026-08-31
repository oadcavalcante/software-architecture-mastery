---
id: federated-governance
title: Governança Federada
sidebar_position: 8
description: A decisão fica no time, a coerência fica no contrato — e o que permanece central é pouco.
doc_type: concept
level: 6
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor divide decisões entre local e central por critério de externalidade,
  e não por hierarquia.
prerequisites: [governance-basics]
related: [governance-basics, governance-standards, governance-pathologies]
canonical_for: [governança federada, decisão local, externalidade de decisão, contrato entre times]
content_version: 1
last_reviewed: 2026-08-29
---

# Governança Federada

## Visão Geral

Governança federada distribui a autoridade de decisão para os times e mantém central apenas
o que atravessa fronteiras.

O critério que faz o modelo funcionar não é o nível hierárquico da decisão. É a
**externalidade**: quem arca com a consequência.

```text
a consequência fica no time        decisão local
a consequência atravessa fronteira decisão coordenada
a consequência é da organização    decisão central
```

Aplicado com honestidade, esse critério deixa surpreendentemente pouco no centro — e é
exatamente essa redução que faz o modelo entregar velocidade sem perder coerência.

## Problema

Os dois extremos falham de formas conhecidas.

**Centralização.** Uma área decide por todos, com menos contexto sobre cada caso e uma fila
que cresce com o número de times. A qualidade da decisão cai com a distância do problema, e
a velocidade cai com a escala.

**Autonomia sem contrato.** Cada time decide tudo. Seis formas de autenticação, quatro
sistemas de fila, quinze formatos de evento. O custo não aparece dentro dos times — aparece
entre eles, na integração, na operação compartilhada e no plantão.

```text
"cada time escolhe sua linguagem"
→ 9 linguagens, 9 conjuntos de bibliotecas internas, plantão impossível
→ ninguém decidiu isso; foi o somatório de nove decisões locais razoáveis
```

O problema da autonomia pura é que decisões locais têm efeitos que não são locais, e nada
no modelo obriga alguém a considerá-los.

## Conceitos Centrais

### Externalidade como critério

```text
escolha de biblioteca de teste       consequência local        → time
estrutura interna do serviço         local                     → time
formato de evento publicado          consumido por outros      → contrato
protocolo de integração              afeta quem integra        → contrato
tecnologia que entra no plantão
  compartilhado                      afeta quem opera          → central
requisito regulatório                afeta a organização       → central
```

A pergunta operacional: **se esta decisão der errado, quem paga?** Se a resposta for "o
time", a decisão é dele.

Isso é mais preciso que "decisões técnicas para times, decisões estratégicas para o centro",
porque decisões aparentemente pequenas — o formato de um evento — têm externalidade alta.

### O centro governa interfaces, não implementações

```text
central   o que atravessa: contratos, formatos, protocolos, identidade,
          requisitos de observabilidade, requisitos regulatórios
local     como cada time cumpre isso
```

Essa divisão é a mesma que separa a interface de um módulo da sua implementação, aplicada à
organização. Ela preserva a autonomia onde ela produz valor — no como — e a coerência onde
ela é necessária — no que atravessa.

Ver [contratos de integração](/08-integration-architecture/integration-contracts.md).

### Representação, não imposição

O modelo federado precisa de um fórum em que os times participam da definição do que é
central:

```text
composição   representantes dos times, mais quem responde por riscos
             transversais
autoridade   define o que é central; não decide o que é local
cadência     periódica, com pauta trazida pelos times
```

Quando o conjunto central é definido **por** quem o cumpre, ele é adotado. Quando é definido
para eles, é contornado. Ver
[exceções](/19-architecture-governance/exceptions.md).

### A plataforma é o que torna o modelo viável

Sem plataforma, federação vira duplicação: cada time constrói sua própria autenticação,
monitoração e esteira, e o custo agregado é maior que o da centralização.

```text
plataforma forte   o time escolhe usar, e usar é o caminho mais fácil
plataforma fraca   o time escolhe construir, e reconstrói o que já existe
```

A plataforma é o mecanismo pelo qual o centro exerce influência sem exercer autoridade. Ver
[engenharia de plataforma](/14-devops-and-platform/platform-engineering.md).

### A federação em dados

O caso mais discutido do modelo é o de arquitetura de dados: domínios produzem seus dados
como produto, com contratos e qualidade declarada, e a governança central define o que todo
produto de dado precisa ter — não o que ele contém.

```text
central   formato de descoberta, requisitos de qualidade, política de acesso,
          padrão de contrato
local     modelagem, semântica, evolução, prioridades
```

Ver [propriedade do dado](/07-data-architecture/data-ownership.md).

### Onde a federação falha

```text
times com maturidade muito desigual   os menos maduros produzem decisões caras
sem plataforma                        duplicação
sem representação                     vira centralização disfarçada
sem consequência                      contratos não cumpridos e nada acontece
organização pequena                   custo de coordenação maior que o benefício
```

O primeiro é o mais subestimado. Federação pressupõe que cada time consegue decidir bem
dentro do seu escopo, e essa premissa não é uniforme. A resposta usual — treinar e apoiar —
é lenta; a alternativa é modular o escopo local por maturidade, o que é desconfortável e
honesto.

### O conjunto central deve encolher com o tempo

Um sinal de saúde do modelo:

```text
ano 1   muitas regras centrais, times ainda calibrando
ano 3   parte das regras virou plataforma, e saiu do conjunto central
ano 5   o conjunto central é pequeno e estável
```

Regras que se tornam caminho pavimentado deixam de precisar ser regras. Se o conjunto
central só cresce, o modelo está regredindo para centralização.

## Modelo Mental

**Se der errado, quem paga?** Essa pergunta divide o local do central melhor que qualquer
organograma.

## Quando Usar

- Em organizações a partir de alguns times, com autonomia real.
- Onde há plataforma capaz de sustentar o caminho fácil.
- Quando a centralização já virou gargalo mensurável.
- Com representação dos times na definição do que é central.

## Quando Não Usar

**Sem plataforma.**

**Sem representação** — vira centralização com outro nome.

**Com maturidade muito desigual**, sem apoio diferenciado.

**Em organizações pequenas.**

**Sem consequência** para descumprimento de contrato.

**Com conjunto central crescente** — sinal de regressão.

## Alternativas

- **Centralizada** — mais simples, funciona até certo tamanho.
- **Comunidade de prática** — coerência voluntária, sem autoridade; funciona com cultura
  técnica forte.
- **Plataforma sem governança formal** — o caminho pavimentado como único mecanismo.
- **Federação parcial** — central em segurança e dados, local no resto.

A última é o arranjo mais comum na prática, e frequentemente o certo.

## Trade-offs

| Federada | Centralizada |
|---|---|
| Decisão perto do contexto | Coerência garantida |
| Escala com o número de times | Vira fila |
| Exige plataforma | Exige menos |
| Divergência no local | Uniformidade |

| Conjunto central pequeno | Grande |
|---|---|
| Autonomia real | Coerência maior |
| Exige confiança | Exige verificação |
| Rápido | Previsível |

## Modos de Falha

**Sem plataforma.** Duplicação cara.

**Sem representação.** Centralização disfarçada, contornada.

**Conjunto central crescente.** Regressão.

**Contrato sem consequência.** Ignorado.

**Maturidade desigual ignorada.** Decisões caras nos times menos preparados.

**Externalidade não avaliada.** Decisões locais com efeito global.

## Erros Comuns

**Dividir por hierarquia** em vez de por externalidade.

**Chamar de federado** um modelo em que o centro decide e os times executam.

**Não investir em plataforma** antes de distribuir a decisão.

**Não medir se o conjunto central está crescendo.**

**Não tratar formato de evento como decisão de alta externalidade** — é o erro mais comum e
o mais caro.

## Exemplo Real

Uma empresa de comércio eletrônico com 26 times migrou de governança centralizada para
federada, motivada por uma fila de decisão que chegava a cinco semanas.

A primeira tentativa falhou em oito meses. O desenho tinha sido: "times decidem tudo que é
técnico; o centro cuida de estratégia".

O que aconteceu:

```text
formatos de evento distintos para o mesmo conceito de pedido    5
implementações de autenticação entre serviços                   4
bibliotecas de cliente HTTP com política de repetição própria   7
incidentes com causa em incompatibilidade de contrato          11
tempo médio de integração entre dois times                  de 3 para 9 dias
```

Nenhuma dessas decisões foi errada localmente. Todas tinham externalidade que o modelo não
considerava, porque a divisão era "técnico contra estratégico" — e formato de evento é
técnico.

O redesenho, com critério de externalidade:

**Central, curto e explícito** — seis itens: formato e evolução de esquema de eventos,
protocolo de integração síncrona, identidade e autenticação entre serviços, requisitos
mínimos de observabilidade, política de retenção e classificação de dado, e requisitos
regulatórios.

**Local, tudo o mais**: linguagem, estrutura interna, banco de dados de uso exclusivo,
bibliotecas, processo de trabalho.

**Conselho de arquitetura com representação**: sete pessoas, cinco delas de times de
produto, com rotação anual. A autoridade do conselho é definir **o que é central**, e não
decidir o que é local.

**Plataforma construída antes**: gabaritos de serviço com identidade, observabilidade e
cliente HTTP padronizado já configurados; registro de esquemas com verificação de
compatibilidade na esteira. Ver
[evolução de esquema](/08-integration-architecture/schema-evolution.md).

**Contratos verificados**, não confiados: quebra de compatibilidade de esquema falha a
construção do produtor.

Dois anos depois:

```text
itens no conjunto central                     6 → 4
                                              (dois viraram plataforma
                                              e saíram do conjunto)
formatos de evento para o mesmo conceito      1
incidentes por incompatibilidade de contrato  0
tempo médio de integração entre times         2 dias
tempo médio de decisão arquitetural local     mesmo dia
adoção de gabarito em serviços novos          91%
```

A redução do conjunto central de 6 para 4 é o dado que a equipe destaca. Identidade e
observabilidade deixaram de ser regras porque viraram padrão embutido — nenhum time precisa
lembrar de algo que já vem configurado.

E um item foi adicionado no segundo ano: política de custo de infraestrutura, depois que
três times fizeram escolhas com efeito agregado significativo na fatura. A externalidade não
tinha sido percebida antes.

O que a equipe aprendeu: a primeira tentativa não falhou por federação demais. Falhou por
usar o critério errado para dividir — "técnico contra estratégico" põe do lado local
decisões cuja consequência é de todos.

## Conceitos Relacionados

- [Fundamentos de Governança](/19-architecture-governance/governance-basics.md).
- [Engenharia de Plataforma](/14-devops-and-platform/platform-engineering.md) — o que
  torna o modelo viável.
- [Contratos de Integração](/08-integration-architecture/integration-contracts.md).
- [Propriedade do Dado](/07-data-architecture/data-ownership.md).

## Exercício Prático

Liste cinco decisões que os times da sua organização tomam sozinhos e, para cada uma,
responda: se der errado, quem paga?

As que tiverem resposta fora do time são decisões com externalidade não reconhecida.

## Perguntas de Entrevista

- Por que "técnico contra estratégico" é um critério ruim para dividir decisões?
- Por que federação sem plataforma produz duplicação?
- O que significa um conjunto central que só cresce?

## Para Aprofundar

- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
- Dehghani, Zhamak. *Data Mesh*. O'Reilly, 2022.
- Ford, Neal et al. *Building Evolutionary Architectures*. 2ª ed. O'Reilly, 2022.
