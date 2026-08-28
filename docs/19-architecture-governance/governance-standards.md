---
id: governance-standards
title: Padrões em Operação
sidebar_position: 4
description: O ciclo de vida de um padrão — quem escreve, como se adota, e por que aposentar é a parte que falta.
doc_type: concept
level: 6
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor opera um conjunto de padrões com custo declarado, adoção medida e
  aposentadoria prevista.
prerequisites: [governance-principles]
related: [governance-principles, exceptions, compliance]
canonical_for: [ciclo de vida de padrão, aposentadoria de padrão, custo de adoção, autoria de padrão]
content_version: 1
last_reviewed: 2026-08-29
---

# Padrões em Operação

## Visão Geral

Um padrão prescreve uma escolha para uma situação recorrente. Ele economiza julgamento: em
vez de cada time decidir de novo, a organização decide uma vez.

Essa economia é real, e vem com uma conta que raramente é feita. Todo padrão tem **custo de
adoção**, **custo de manutenção** e **custo de saída** — e organizações acumulam padrões
como se os três fossem zero.

O resultado típico, depois de alguns anos:

```text
padrões publicados        60
seguidos consistentemente 12
contornados em silêncio   19
obsoletos, ainda vigentes 14
esquecidos                15
```

Ver [padrões corporativos](../15-enterprise-architecture/standards.md) para escopo e
operacionalização; aqui o foco é o ciclo de vida — nascer, ser adotado, e morrer.

## Problema

Padrões nascem por um motivo legítimo — um incidente, uma divergência cara, uma auditoria —
e quase nunca morrem.

```text
2020  incidente com biblioteca de serialização → padrão: use a biblioteca X
2022  a biblioteca X é descontinuada pelo mantenedor
2024  o padrão continua vigente
2026  times novos adotam X por conformidade
```

Nada nesse fluxo é irracional. Falta apenas um mecanismo: alguém responsável por perguntar
se o padrão ainda faz sentido, com prazo para perguntar.

E há uma segunda falha, mais comum: o padrão que é publicado e nunca adotado. Ele existe no
portal, é citado em auditorias, e a realidade dos sistemas diverge dele. Isso é pior que não
ter padrão, porque cria a ilusão de coerência.

## Conceitos Centrais

### Quem escreve importa

```text
escrito por quem não usa      genérico, ignora o caso difícil, contornado
escrito por quem usa          específico, adotável, com risco de viés local
escrito por quem usa,
  revisado por quem tem visão ampla   o arranjo que funciona
```

Um padrão escrito por uma área central sem participação de quem vai aplicá-lo tem uma
característica reconhecível: ele não menciona nenhum caso difícil, porque quem escreveu não
encontrou nenhum.

E a autoria distribuída tem um efeito adicional: quem escreveu o padrão é quem o defende
nas conversas, o que é mais eficaz que qualquer política.

### O padrão precisa vir com o caminho

Um padrão que exige trabalho para ser seguido compete com o caminho fácil, e perde.

```text
padrão sem apoio     "use a biblioteca de autenticação corporativa"
padrão com caminho   gabarito já configurado, exemplo funcional,
                     migração automatizada onde possível
```

Este é o mesmo argumento do [ponto de intervenção](governance-basics.md): o padrão embutido
no gabarito não precisa ser lembrado nem verificado.

Ver [engenharia de plataforma](../14-devops-and-platform/platform-engineering.md).

### Custo de adoção declarado

```text
esforço de migração por sistema, estimado
sistemas afetados
prazo realista
o que acontece com quem não migrar
quem paga o esforço
```

A última pergunta é a que trava a maior parte das adoções: um padrão que exige trabalho de
times cuja prioridade é outra não é adotado, por mais correto que seja.

Sem resposta a ela, o padrão é aspiração.

### Adoção medida, não declarada

```text
publicado     o documento existe
comunicado    os times sabem
adotado       os sistemas novos seguem
convergido    os antigos migraram
```

Medir onde cada padrão está nessa escala é o que separa política real de política nominal.

E o diagnóstico depende do estágio em que ele empaca:

```text
publicado mas não comunicado     problema de comunicação
comunicado mas não adotado       o padrão está errado, ou falta caminho
adotado mas não convergido       falta plano e patrocínio para a migração
```

Reforçar obrigatoriedade — a resposta institucional padrão — não resolve nenhum dos três.

### Aposentadoria é parte do ciclo

Todo padrão precisa nascer com:

```text
data de revisão
dono, como papel
condição que o tornaria obsoleto
o que acontece com quem já adotou, quando ele cair
```

O último item é o mais esquecido, e é o que evita que a aposentadoria vire abandono: um
padrão descontinuado sem plano deixa dezenas de sistemas com uma escolha que ninguém mais
sustenta.

Ver [superação de decisões](../18-architecture-decisions/superseding-decisions.md) — a
mecânica é a mesma.

### Rastreabilidade do porquê

```text
padrão sem razão registrada    obedecido por medo, mantido para sempre
padrão com ADR vinculado       revisável quando a razão cair
```

Vincular cada padrão ao [ADR](../18-architecture-decisions/index.md) que o originou é
barato e resolve o problema do padrão-folclore: aquele que todos seguem e ninguém sabe
explicar.

### O número de padrões tem teto prático

```text
até ~15    lembrados, aplicados
30 a 60    consultados quando alguém lembra
acima      referência de auditoria, não de decisão
```

Cada padrão consome atenção da organização, e a atenção é finita. Adicionar o sexagésimo
padrão não aumenta a coerência — ele dilui os cinquenta e nove anteriores.

Isso implica uma disciplina impopular: **para adicionar um padrão, remova outro**, a menos
que o novo endereço um risco de outra ordem.

## Modelo Mental

**Padrão é um ativo com custo de manutenção.** Se ninguém é dono e não há data de revisão,
ele já está apodrecendo.

## Quando Usar

- Para decisões recorrentes cujo resultado já é conhecido.
- Onde a divergência tem custo mensurável.
- Quando há risco regulatório ou de segurança.
- Acompanhado de caminho — gabarito, exemplo, migração.

## Quando Não Usar

**Sem dono e sem data de revisão.**

**Sem caminho de adoção.**

**Sem responder quem paga a migração.**

**Onde o contexto varia de verdade** — isso é princípio.

**Em número alto.**

**Sem medir adoção** — sem isso, não se sabe se existe.

## Alternativas

- **[Princípios](governance-principles.md)** — quando o contexto varia.
- **Gabarito** — o padrão embutido, sem documento.
- **Recomendação com prazo** — padrão informal, adotado por convencimento antes de virar
  obrigação.
- **Radar tecnológico** — sinaliza direção sem prescrever. Ver
  [radar tecnológico](../15-enterprise-architecture/technology-radar.md).

A terceira é subutilizada: publicar como recomendação por seis meses revela se o padrão é
adotável antes de torná-lo obrigatório.

## Trade-offs

| Padrão | Princípio |
|---|---|
| Decide o recorrente | Orienta o novo |
| Verificável | Interpretável |
| Trava no caso atípico | Não trava |
| Exige processo de exceção | Pondera-se |

| Poucos padrões | Muitos |
|---|---|
| Aplicados | Cobrem mais casos |
| Atenção concentrada | Diluição |
| Exige priorizar | Evita escolher |

## Modos de Falha

**Publicado e não adotado.** Ilusão de coerência.

**Sem caminho.** Compete com o fácil e perde.

**Obsoleto e vigente.** Times novos adotam algo morto.

**Sem dono.** Ninguém revisa nem aposenta.

**Sem financiamento da migração.** Aspiração.

**Acúmulo.** Sessenta padrões diluem os quinze que importam.

## Erros Comuns

**Publicar sem gabarito.**

**Não medir adoção**, e reforçar obrigatoriedade como resposta a tudo.

**Não vincular ao ADR** que originou o padrão.

**Não prever aposentadoria.**

**Adicionar sem remover.**

**Escrever longe de quem aplica.**

## Exemplo Real

Uma empresa de telecomunicações tinha 71 padrões arquiteturais publicados, mantidos por uma
área central de arquitetura de cinco pessoas.

Um levantamento de adoção, feito com verificação automática onde possível e amostragem onde
não:

```text
padrões com adoção acima de 80%              14
entre 30% e 80%                              17
abaixo de 30%                                22
impossível medir (formulação vaga)           18
com dono identificável                       23
com data de revisão                           6
com ADR ou justificativa vinculada           11
referenciando tecnologia descontinuada        9
```

Os 18 impossíveis de medir eram os mais reveladores: sua formulação — "os sistemas devem
adotar práticas adequadas de gestão de configuração" — não permitia dizer se algum sistema
os cumpria.

E os 9 que referenciavam tecnologia descontinuada continuavam sendo citados em revisões.

A reestruturação levou nove meses:

**De 71 para 19 padrões.** Os 18 não mensuráveis foram removidos ou reformulados até
ficarem verificáveis; os 22 com adoção abaixo de 30% foram examinados um a um — 15
removidos, 7 mantidos com plano de adoção financiado.

**Dono como papel** para cada padrão remanescente, com o dono sendo alguém de um time que
aplica o padrão, não da área central.

**Data de revisão** obrigatória, no máximo 24 meses.

**Caminho obrigatório**: nenhum padrão novo é publicado sem gabarito, exemplo funcional ou
ferramenta de migração.

**Regra de troca**: adicionar um padrão exige remover outro, salvo risco regulatório.

**Estágio de recomendação**: padrões novos entram como recomendação por seis meses, com
adoção medida. Se a adoção voluntária ficar abaixo de 40%, o padrão é revisado antes de
virar obrigatório — a premissa sendo que baixa adoção voluntária indica problema no padrão,
não nos times.

Dois anos depois:

```text
padrões                                       23
com adoção acima de 80%                       19
com dono e data de revisão                    23
aposentados no período                         6
promovidos de recomendação a obrigatório       7
recomendações revisadas por baixa adoção       4
```

Os 4 revisados por baixa adoção são o dado que a equipe mais valoriza. Em três deles o
problema era falta de caminho de migração; em um, o padrão estava simplesmente errado — ele
prescrevia uma abordagem que não funcionava para sistemas com alto volume, e nenhum dos
autores tinha operado um sistema assim.

O detalhe que a equipe destaca: o estágio de recomendação transformou baixa adoção de falha de
disciplina em informação sobre o padrão. Essa inversão de leitura foi a mudança de maior
efeito.

## Conceitos Relacionados

- [Padrões Corporativos](../15-enterprise-architecture/standards.md) — escopo e formulação.
- [Princípios](governance-principles.md) — quando não prescrever.
- [Exceções](exceptions.md) — o que fazer com quem não pode seguir.
- [Conformidade](compliance.md) — como verificar.

## Exercício Prático

Escolha três padrões da sua organização e responda, para cada um: quem é o dono, quando
será revisto, e qual a taxa de adoção medida.

Os que não tiverem as três respostas não são padrões — são documentos.

## Perguntas de Entrevista

- Por que baixa adoção voluntária é informação sobre o padrão, e não sobre os times?
- O que um padrão precisa ter para não virar folclore?
- Por que adicionar um padrão deveria exigir remover outro?

## Para Aprofundar

- Ford, Neal et al. *Building Evolutionary Architectures*. 2ª ed. O'Reilly, 2022.
- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.
