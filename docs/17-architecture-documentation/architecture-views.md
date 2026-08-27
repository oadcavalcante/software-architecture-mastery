---
id: architecture-views
title: Visões de Arquitetura
sidebar_position: 9
description: Um sistema não cabe num desenho — cada visão responde às preocupações de um público.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor escolhe visões a partir das preocupações de quem lê, em vez de
  produzir um conjunto fixo por convenção.
prerequisites: [c4-model]
related: [c4-model, architecture-descriptions, documentation-principles]
canonical_for: [visão arquitetural, ponto de vista arquitetural, preocupação de interessado, modelo 4+1]
content_version: 1
last_reviewed: 2026-08-29
---

# Visões de Arquitetura

## Visão Geral

Um sistema tem propriedades demais para caber numa representação. Estrutura, execução,
implantação, dados, segurança, evolução — cada uma é uma dimensão diferente, e nenhuma
projeção mostra todas.

A resposta é organizar a documentação em **visões**: cada visão é uma representação do
sistema construída para responder às preocupações de um público específico.

E a decisão importante não é qual conjunto de visões usar. É **de quem são as preocupações
que precisam ser respondidas** — o que faz o conjunto variar por sistema.

## Problema

O reflexo é procurar o diagrama certo. Ele não existe:

```text
quem opera quer saber      onde roda, o que cai junto, como escala
quem desenvolve quer saber onde mexer, o que quebra
quem audita quer saber     onde está o dado, quem acessa
quem financia quer saber   o que custa, o que trava
quem integra quer saber    quais contratos existem
```

Um único diagrama tentando responder a todos vira ilegível para todos. É a mesma falha de
misturar níveis de abstração descrita no [modelo C4](c4-model.md), agora entre dimensões e
não entre níveis.

O erro oposto também é comum: adotar um conjunto canônico de visões e produzir todas,
independentemente de haver alguém interessado em cada uma. Isso gera documentos que ninguém
lê — ver [princípios de documentação](documentation-principles.md).

## Conceitos Centrais

### Ponto de vista e visão

A distinção vale o esforço:

```text
ponto de vista   as convenções para construir um tipo de representação —
                 o que ela mostra, para quem, com qual notação
visão            a aplicação de um ponto de vista a um sistema concreto
```

O ponto de vista é reutilizável entre sistemas; a visão é específica. Uma organização
define poucos pontos de vista e produz muitas visões.

Ver [descrições de arquitetura](architecture-descriptions.md), onde essa terminologia é
normativa.

### Interessados e preocupações

O ponto de partida é sempre a mesma pergunta: **quem precisa saber o quê, para decidir o
quê.**

```text
interessado    quem tem algo em jogo no sistema
preocupação    a pergunta que ele precisa responder
visão          a representação que responde
```

Uma visão sem interessado identificado não deveria ser produzida. Esse é o critério que
mantém o conjunto pequeno.

E vale explicitar: interessado não é só quem escreve código. Operação, segurança,
compliance, produto, financeiro e parceiros externos costumam ter preocupações
arquiteturais legítimas e nenhuma representação que as atenda.

### O conjunto 4+1

O conjunto mais conhecido, proposto por Kruchten em 1995, organiza quatro visões em torno
de cenários:

```text
lógica         funcionalidade, para quem desenvolve e para o usuário
processo       concorrência, desempenho, para quem integra
desenvolvimento organização do código, para quem constrói
física         mapeamento em hardware, para quem opera
+1: cenários   casos de uso que amarram as quatro
```

O valor duradouro não é a lista. É o "+1": os **cenários validam as visões** — se um
cenário concreto não pode ser percorrido através das visões, elas estão incompletas ou
inconsistentes.

Essa é a ideia reaproveitável, e a mais ignorada.

### Conjuntos são ponto de partida, não obrigação

```text
4+1               clássico, orientado a desenvolvimento
C4                níveis de abstração estrutural
arc42             doze seções, cobre além de diagramas
Viewpoints and Perspectives  catálogo amplo, com qualidades transversais
```

Nenhum é obrigatório. Um sistema pequeno pode precisar de duas visões; um sistema
regulado, de sete.

A prática que funciona: começar pelas preocupações reais registradas, e escolher o menor
conjunto que as cubra.

### Perspectivas transversais

Algumas preocupações não são uma visão — elas atravessam todas:

```text
segurança          afeta estrutura, implantação, dados, operação
desempenho         idem
disponibilidade    idem
custo              idem
evolutibilidade    idem
```

Tratá-las como visões separadas duplica informação. Tratá-las como **perspectivas** —
lentes aplicadas sobre as visões existentes — evita a duplicação e produz uma pergunta
útil: "o que cada visão diz sobre segurança?"

Ver [atributos de qualidade](../01-fundamentals/quality-attributes.md).

### Consistência entre visões

O custo real de múltiplas visões: elas precisam concordar.

```text
um contêiner na visão estrutural existe na de implantação?
um fluxo na visão de processo usa contêineres que existem?
a visão de dados menciona armazenamentos que aparecem na física?
```

Quanto mais visões, maior o custo de manter a consistência — e é por isso que o número
deve ser o mínimo necessário. Visões geradas a partir de uma fonte comum resolvem parte do
problema. Ver [documentação viva](living-documentation.md).

## Modelo Mental

**Uma visão por preocupação com dono.** O conjunto se justifica pelos leitores, não pelo
método.

## Quando Usar

- Em sistemas com públicos técnicos e não técnicos distintos.
- Em ambientes regulados, onde há preocupações formais a atender.
- Em sistemas grandes, onde uma representação não cabe.
- Ao herdar um sistema e precisar organizar o que documentar.

## Quando Não Usar

**Produzindo um conjunto completo por convenção**, sem interessados identificados.

**Em sistemas pequenos** — duas ou três representações bastam.

**Sem checar consistência** entre as visões.

**Com preocupações transversais viradas visões**, duplicando conteúdo.

**Como exercício de conformidade** — o pior uso, e o mais frequente em organizações
grandes.

## Alternativas

- **[Modelo C4](c4-model.md)** — quando a preocupação é só estrutural.
- **arc42** — quando se quer uma estrutura pronta que vai além de diagramas.
- **Documento único curto** — para sistemas pequenos, uma página com quatro seções.
- **Documentação por pergunta** — organizar por questão frequente em vez de por visão.

A última é subestimada e funciona bem: um índice de perguntas ("como isto escala?", "onde
está o dado do cliente?") com respostas curtas cobre a maior parte da necessidade real com
menos estrutura.

## Trade-offs

| Muitas visões | Poucas |
|---|---|
| Cada público atendido | Menos manutenção |
| Custo de consistência | Lacunas |
| Formal | Prático |

| Conjunto padrão | Conjunto derivado das preocupações |
|---|---|
| Rápido de adotar | Ajustado ao sistema |
| Produz o que ninguém lê | Exige levantar interessados |
| Comparável entre sistemas | Varia |

## Modos de Falha

**Visões sem leitor.** Custo sem retorno.

**Visões inconsistentes entre si.** Pior que uma só.

**Preocupações transversais duplicadas** em cada visão.

**Conjunto adotado por conformidade.**

**Cenários ausentes.** Sem eles, nada valida o conjunto.

## Erros Comuns

**Escolher o conjunto antes de levantar as preocupações.**

**Não nomear o interessado de cada visão.**

**Tratar segurança como uma visão.**

**Não verificar consistência.**

**Produzir todas as visões com o mesmo esforço**, sem priorizar.

## Exemplo Real

Uma seguradora adotou um conjunto formal de visões para todos os sistemas classificados
como relevantes — 34 sistemas, sete visões cada, 238 documentos.

O processo levou catorze meses. Dois anos depois, uma medição de uso:

```text
visão estrutural         consultada regularmente em 31 dos 34
visão de implantação     em 28
visão de dados           em 12, quase toda em auditoria
visão de processo        em 4
visão de desenvolvimento em 2
visão de integração      em 19
visão de evolução        em 0
```

Três das sete visões respondiam a preocupações que ninguém tinha. E o custo de manutenção
era igual para todas.

Pior: uma auditoria de consistência encontrou divergência entre a visão estrutural e a de
implantação em 22 dos 34 sistemas. As visões discordavam entre si — e quem consultava não
sabia qual estava certa.

A revisão:

**Conjunto reduzido a três visões obrigatórias** — estrutural, implantação e integração —
escolhidas por uso medido, não por método.

**Visão de dados sob demanda**, obrigatória apenas para sistemas que tratam dado pessoal
ou financeiro. Ver
[fluxo de dados](data-flow-diagrams.md).

**Visões de processo e desenvolvimento** eliminadas como obrigatórias, produzidas quando
alguém pedir.

**Segurança virou perspectiva**, não visão: uma lista de perguntas aplicada às três visões
obrigatórias durante a revisão.

**Consistência verificada automaticamente** onde possível — a visão de implantação passou
a ser derivada do código de infraestrutura, e um verificador compara os contêineres
declarados na visão estrutural com os implantados. Ver
[documentação viva](living-documentation.md).

**Cenários reintroduzidos.** Cada sistema mantém dois ou três cenários percorridos através
das visões, revisados anualmente. Foi o que passou a detectar lacunas.

O resultado: de 238 documentos para 119, com a taxa de consulta subindo e a divergência
entre visões caindo para 3 sistemas.

O que a equipe registra: a pergunta que faltou no início foi a mais simples — "quem vai
ler isto, e para decidir o quê?". Ela teria eliminado três visões antes de catorze meses
de trabalho.

## Conceitos Relacionados

- [Modelo C4](c4-model.md) — um conjunto de visões estruturais.
- [Descrições de Arquitetura](architecture-descriptions.md) — a formalização.
- [Princípios de Documentação](documentation-principles.md) — o leitor primeiro.
- [Atributos de Qualidade](../01-fundamentals/quality-attributes.md) — as perspectivas.

## Exercício Prático

Liste os interessados no seu sistema e, para cada um, a pergunta que ele precisa responder.

Depois compare com a documentação existente. Provavelmente há documentos sem interessado e
interessados sem documento — e os dois são problemas.

## Perguntas de Entrevista

- Qual a diferença entre ponto de vista e visão?
- Por que segurança costuma ser perspectiva e não visão?
- O que o "+1" do modelo 4+1 acrescenta às quatro visões?

## Para Aprofundar

- Kruchten, Philippe. *Architectural Blueprints — The 4+1 View Model*. IEEE Software, 1995.
- Rozanski, Nick; Woods, Eoin. *Software Systems Architecture*. 2ª ed. Addison-Wesley, 2011.
- Clements, Paul et al. *Documenting Software Architectures*. 2ª ed. Addison-Wesley, 2010.
