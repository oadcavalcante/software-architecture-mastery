---
id: leadership-standards
title: Padrões sob a Ótica de Quem Estabelece
sidebar_position: 13
description: Publicar um padrão é assumir um compromisso — com o caminho, com a migração e com a aposentadoria.
doc_type: concept
level: 7
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor publica padrões com caminho de adoção, financiamento de migração e data
  de revisão, e lê baixa adoção como informação.
prerequisites: [leadership-principles]
related: [leadership-principles, leadership-governance, cross-team-architecture]
canonical_for: [publicação de padrão, patrocínio de padrão, adoção como sinal, estágio de recomendação]
content_version: 2
last_reviewed: 2026-08-29
---

# Padrões sob a Ótica de Quem Estabelece

## Visão Geral

Publicar um padrão parece um ato de escrita e é um ato de compromisso. Quem o publica assume três
obrigações que raramente são reconhecidas:

```text
fornecer o caminho          gabarito, exemplo, ferramenta
responder quem paga         a migração dos sistemas existentes
aposentá-lo                 quando ele deixar de fazer sentido
```

Um padrão publicado sem as três é uma aspiração com aparência de regra — e o resultado é
previsível: baixa adoção, contorno silencioso, e a área que o publicou reforçando obrigatoriedade
como resposta a tudo.

Ver [padrões em operação](/19-architecture-governance/governance-standards.md) para o ciclo de
vida; aqui o foco é o que quem estabelece precisa entregar junto.

## Problema

O padrão típico nasce assim:

```text
identifica-se divergência entre times
escreve-se o padrão
publica-se no portal
comunica-se por e-mail
```

Seis meses depois, a adoção está em 22%, e a reação institucional é reforçar a obrigatoriedade —
que não funciona, porque o problema nunca foi disciplina.

```text
publicado e não adotado por falta de caminho
publicado e não adotado por falta de financiamento da migração
publicado e não adotado porque está errado
```

Os três se parecem de fora e exigem respostas opostas. Distingui-los é a competência central de
quem publica.

## Conceitos Centrais

### Baixa adoção é informação sobre o padrão

```text
reação usual     "os times não estão seguindo"
leitura correta  "o padrão não é adotável, ou não vale a pena
                 para quem deveria adotá-lo"
```

Essa inversão de leitura é a mudança de postura mais importante deste tema. Indisciplina explica
um time que não adota; não explica dezenas de times, com gestores e prioridades diferentes, deixando
de adotar o mesmo padrão. Quando a baixa adoção é espalhada, a causa comum está no que eles têm em
comum — o padrão: o custo de adotar excede o benefício percebido, ou não há caminho.

Investigar por quê, em vez de cobrar, resolve o problema; cobrar apenas move o descumprimento
para o silêncio.

### Estágio de recomendação antes de obrigatório

```text
publicado como recomendação por 6 meses
adoção voluntária medida
acima de ~40%      promove a obrigatório
abaixo             revisa o padrão antes de promover
```

Esse estágio transforma adoção baixa em informação sobre o padrão em vez de falha dos times, e
custa apenas tempo. É o instrumento mais eficaz de quem publica, e o menos usado.

Um padrão que ninguém adota voluntariamente provavelmente não deveria ser obrigatório — ou
precisa de caminho antes de ser.

### Nenhum padrão sem caminho

```text
"use a biblioteca de autenticação corporativa"
  → compete com o caminho fácil, e perde

gabarito com autenticação já configurada
  → a adoção acontece sem nenhuma conversa
```

Publicar um padrão sem fornecer o caminho é transferir todo o custo de adoção para quem adota,
enquanto quem publica arca apenas com a escrita. Essa assimetria é a causa mais comum de baixa
adoção.

Ver [engenharia de plataforma](/14-devops-and-platform/platform-engineering.md).

### Quem paga a migração precisa ter nome

```text
"todos os sistemas devem migrar até dezembro"
```

Sem resposta a quem paga, isso é aspiração. Times têm prioridades próprias, e migrar por
conformidade compete com entregar valor — e perde.

```text
financiado centralmente          o mais efetivo, e o mais caro
negociado no roteiro de cada
  time                           efetivo, e lento
ferramenta que torne barato      o mais escalável
não migrar os existentes         legítimo: o padrão vale só
                                 para sistemas novos
```

A quarta opção é subutilizada e frequentemente a certa: aplicar o padrão apenas a sistemas novos
evita uma migração cara e faz a organização convergir por renovação natural.

Ela tem um custo próprio que precisa ser aceito conscientemente: a divergência entre sistemas
antigos e novos permanece por anos, e quem opera os dois convive com duas formas de fazer a mesma
coisa. Em compensação, ela não compete com nenhuma prioridade de produto, o que é a razão de a
adoção ser alta.

A escolha entre migrar e não migrar deveria ser explícita no momento da publicação, com o custo
de cada uma estimado — e não descoberta meses depois, quando a migração não acontece e ninguém
sabe se ela era esperada.

### Regra de troca

A [regra de troca](/19-architecture-governance/governance-standards.md) — para adicionar um
padrão, remova outro, salvo risco regulatório — é definida em padrões em operação. Para quem
publica, o efeito que interessa é outro: ela dá custo ao ato de publicar, e obriga quem propõe o
padrão novo a dizer qual existente vale menos que ele — o que é raro quando publicar não tem custo.

### Escrito por quem aplica

```text
escrito por área central sem participação de quem aplica
  → genérico, ignora o caso difícil, contornado
escrito por quem aplica, revisado por quem tem visão ampla
  → específico, adotável, defendido nas conversas
```

O segundo arranjo tem um efeito adicional: quem escreveu o padrão é quem o defende quando alguém
questiona. Isso vale mais que qualquer política de obrigatoriedade.

### Data de revisão, sempre

```text
sem data     o padrão sobrevive ao contexto que o produziu
com data     alguém precisa reafirmá-lo, o que é um filtro
```

O prazo e o ciclo de aposentadoria estão em
[padrões em operação](/19-architecture-governance/governance-standards.md). O que cabe a quem
publica é fixar a data no ato da publicação e vincular o padrão ao ADR que o originou: sem o ADR, a
revisão encontra uma regra sem contexto e não tem como saber se as premissas que a justificaram
ainda valem. Ver [governança](/23-architecture-leadership/leadership-governance.md).

## Modelo Mental

**Publicar é assumir três compromissos: caminho, migração e aposentadoria.** E baixa adoção é
informação sobre o padrão.

## Quando Usar

- Quando quem publica consegue entregar o caminho junto — gabarito, ferramenta ou exemplo
  funcional — e não apenas o texto.
- Quando existe resposta para a migração: verba nomeada, ou a decisão explícita de valer só para
  sistemas novos.
- Quando a área que publica tem patrocínio para sustentar o estágio de recomendação e ler a adoção
  como resultado, em vez de ser pressionada a declarar obrigatoriedade no primeiro dia.

## Quando Não Usar

**Quando a decisão ainda não se repetiu o bastante** para ter resultado conhecido — publicar
congela uma escolha que os times ainda estão aprendendo a fazer; o estágio certo é recomendação ou
nada.

**Quando os times afetados usam pilhas diferentes demais** para um gabarito único — o padrão vai
ser escrito para uma delas e errado para as outras, como no exemplo abaixo; isso é princípio.

**Quando não há verba para migrar e o risco está nos sistemas existentes** — a saída "só sistemas
novos" não resolve, e o padrão vira cobrança sem caminho; o que cabe é um projeto financiado, não
um padrão.

**Quando quem publica não tem como medir adoção** — sem a medida, o estágio de recomendação não
produz informação, e a baixa adoção só aparece como sintoma, anos depois.

## Alternativas

- **Gabarito sem padrão escrito** — a propriedade embutida, sem documento.
- **Recomendação permanente** — quando a obrigatoriedade não se justifica.
- **Aplicar só a sistemas novos** — convergência por renovação, sem migração.
- **Radar tecnológico** — sinaliza direção sem prescrever. Ver
  [radar tecnológico](/15-enterprise-architecture/technology-radar.md).

A primeira é a mais eficaz quando aplicável: um padrão que existe apenas como configuração padrão
do gabarito não precisa ser lembrado nem verificado.

## Trade-offs

| Padrão obrigatório | Recomendação |
|---|---|
| Coerência exigida, não garantida: sem caminho, vira contorno silencioso | Divergência visível e mensurável |
| Exige exceção e verificação | Divergência possível |
| Pode estar errado e ser imposto | A adoção é o teste |

| Migrar existentes | Só sistemas novos |
|---|---|
| Convergência completa | Sem custo de migração |
| Custa dinheiro e prioridade | Convergência lenta |

## Modos de Falha

**Sem caminho.** Compete com o fácil e perde.

**Sem financiamento.** Aspiração.

**Cobrança como resposta.** Move o descumprimento para o silêncio.

**Sem data de revisão.** Sobrevive ao contexto.

**Acúmulo.** Dilui os que importam.

**Escrito longe de quem aplica.** Ignora o caso difícil.

## Erros Comuns

**Publicar sem gabarito.**

**Reforçar obrigatoriedade** diante de baixa adoção.

**Não usar o estágio de recomendação.**

**Não considerar** aplicar só a sistemas novos.

**Não vincular ao ADR** que originou o padrão — a revisão perde o contexto que diria se ele ainda vale.

## Exemplo Real

Uma empresa de serviços financeiros publicou, ao longo de dois anos, quatro padrões
arquiteturais. Todos foram anunciados como obrigatórios desde o primeiro dia.

A adoção de cada um, medida 18 meses depois da própria publicação:

```text
padrão de observabilidade          89%
padrão de contrato de API          71%
padrão de tratamento de erro       34%
padrão de estrutura de projeto      9%
```

Os dois primeiros tinham gabarito pronto na publicação; os dois últimos, não. Os dois com
gabarito eram os dois com adoção alta, e ninguém tinha notado, porque a leitura institucional de baixa adoção era de
indisciplina — e a resposta em curso era um plano de cobrança por área.

A liderança de arquitetura propôs inverter a leitura antes de cobrar qualquer coisa: entrevistar
os times com baixa adoção e perguntar o que impedia.

```text
padrão de tratamento de erro   "cada linguagem trata erro de um jeito;
                               o padrão foi escrito pensando em Java
                               e não traduz para os outros três"
padrão de estrutura de projeto "não existe ferramenta que gere isso;
                               reestruturar um serviço existente leva
                               dois dias e não entrega nada ao usuário"
```

Nenhuma das duas causas era disciplina. A primeira era um padrão errado — escrito por quem
usava uma linguagem, para quatro. A segunda era um padrão sem caminho e sem financiamento.

O que a organização passou a exigir antes de publicar:

**Caminho pronto** — gabarito, ferramenta de migração ou exemplo funcional. Sem isso, não publica.

**Estágio de recomendação** de seis meses, com adoção voluntária medida antes de tornar
obrigatório.

**Resposta explícita a quem paga** a migração dos sistemas existentes — incluindo a opção de não
migrar, aplicando o padrão só a sistemas novos.

**Escrito por quem aplica**, revisado por quem tem visão ampla.

Os dois padrões problemáticos foram tratados de formas opostas: o de tratamento de erro foi
reescrito por um grupo com representantes das quatro linguagens, e a adoção subiu para 78% em oito
meses. O de estrutura de projeto foi rebaixado a recomendação e passou a valer apenas para
serviços novos — a adoção em serviços novos ficou em 94%, e os existentes não foram tocados.

Na retrospectiva: nenhum dos dois padrões precisou de cobrança. Um estava errado e foi corrigido;
o outro estava certo e faltava caminho. A cobrança planejada teria empurrado os dois para o
descumprimento silencioso, e a organização teria concluído que padrões não funcionam.

## Conceitos Relacionados

- [Padrões em Operação](/19-architecture-governance/governance-standards.md).
- [Padrões Corporativos](/15-enterprise-architecture/standards.md).
- [Princípios](/23-architecture-leadership/leadership-principles.md).
- [Governança](/23-architecture-leadership/leadership-governance.md).

## Exercício Prático

Escolha três padrões da sua organização e verifique se cada um tem caminho de adoção, dono, data
de revisão e resposta a quem paga a migração.

Para cada lacuna, anote qual das três causas de baixa adoção ela prevê. Onde falta algum dos
quatro e a adoção mesmo assim é alta, descubra de onde ela veio — um gabarito informal, um dono
dedicado — antes de contar com isso no próximo padrão.

## Perguntas de Entrevista

- Por que baixa adoção voluntária é informação sobre o padrão?
- Por que aplicar um padrão só a sistemas novos é frequentemente a escolha certa?
- Por que quem escreve o padrão deveria ser quem o aplica?

## Para Aprofundar

- Ford, Neal et al. *Building Evolutionary Architectures*. 2ª ed. O'Reilly, 2022.
- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.
