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
content_version: 1
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

Ver [padrões em operação](../19-architecture-governance/governance-standards.md) para o ciclo de
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

Essa inversão de leitura é a mudança de postura mais importante deste tema. Times não deixam de
adotar padrões por indisciplina — eles deixam quando o custo de adotar excede o benefício
percebido, ou quando não há caminho.

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

Ver [engenharia de plataforma](../14-devops-and-platform/platform-engineering.md).

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

```text
para adicionar um padrão, remova outro
```

Salvo risco regulatório. A regra existe porque a atenção da organização é finita: o sexagésimo
padrão não aumenta a coerência, ele dilui os cinquenta e nove anteriores.

Ela também força priorização real em quem publica — o que é raro quando publicar não tem custo.

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

Um padrão que referencia tecnologia descontinuada e continua sendo citado em revisões é o
resultado previsível de publicar sem prazo.

Vinte e quatro meses é um limite razoável. Ver
[governança](leadership-governance.md).

## Modelo Mental

**Publicar é assumir três compromissos: caminho, migração e aposentadoria.** E baixa adoção é
informação sobre o padrão.

## Quando Usar

- Para decisões recorrentes cujo resultado já é conhecido.
- Onde a divergência tem custo mensurável.
- Com caminho, financiamento e data de revisão definidos antes de publicar.

## Quando Não Usar

**Sem caminho de adoção.**

**Sem responder quem paga a migração.**

**Sem data de revisão.**

**Onde o contexto varia** — isso é princípio.

**Adicionando sem remover.**

**Cobrando adoção** em vez de investigar a causa.

## Alternativas

- **Gabarito sem padrão escrito** — a propriedade embutida, sem documento.
- **Recomendação permanente** — quando a obrigatoriedade não se justifica.
- **Aplicar só a sistemas novos** — convergência por renovação, sem migração.
- **Radar tecnológico** — sinaliza direção sem prescrever. Ver
  [radar tecnológico](../15-enterprise-architecture/technology-radar.md).

A primeira é a mais eficaz quando aplicável: um padrão que existe apenas como configuração padrão
do gabarito não precisa ser lembrado nem verificado.

## Trade-offs

| Padrão obrigatório | Recomendação |
|---|---|
| Coerência garantida | Adoção por convencimento |
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

**Não vincular ao ADR** que originou o padrão.

## Exemplo Real

Uma empresa de telecomunicações tinha 71 padrões arquiteturais publicados, mantidos por uma área
central de cinco pessoas.

Um levantamento de adoção, com verificação automática onde possível:

```text
padrões com adoção acima de 80%              14
entre 30% e 80%                              17
abaixo de 30%                                22
impossíveis de medir (formulação vaga)       18
com dono identificável                       23
com data de revisão                           6
com caminho de adoção fornecido               9
referenciando tecnologia descontinuada        9
```

Apenas 9 dos 71 tinham caminho. Isso, sozinho, explicava a maior parte da adoção baixa.

A reestruturação, ao longo de nove meses:

**De 71 para 19.** Os 18 não mensuráveis foram removidos ou reformulados até ficarem verificáveis;
os 22 com adoção abaixo de 30% foram examinados individualmente — 15 removidos, 7 mantidos com
plano de adoção financiado.

**Caminho obrigatório.** Nenhum padrão novo é publicado sem gabarito, exemplo funcional ou
ferramenta de migração. Os 7 mantidos receberam caminho antes de qualquer cobrança.

**Dono como papel**, sempre alguém de um time que aplica o padrão, não da área central.

**Data de revisão** obrigatória, máximo de 24 meses.

**Estágio de recomendação** de seis meses para padrões novos, com adoção voluntária medida.

**Regra de troca**: adicionar exige remover, salvo risco regulatório.

**Migração financiada** para os 7 mantidos, com orçamento da área de arquitetura.

Dois anos depois:

```text
padrões                                       23
com adoção acima de 80%                       19
com dono e data de revisão                    23
com caminho fornecido                         23
aposentados no período                         6
promovidos de recomendação a obrigatório       7
recomendações revisadas por baixa adoção       4
```

Os 4 revisados por baixa adoção voluntária são o dado que a área mais valoriza. Em três, o
problema era falta de caminho de migração — resolvido. No quarto, o padrão estava errado: ele
prescrevia uma abordagem que não funcionava em sistemas de alto volume, e nenhum dos autores tinha
operado um sistema assim.

Esse quarto caso é o argumento inteiro do estágio de recomendação. Sob obrigatoriedade direta, ele
teria sido imposto, contornado, e a organização teria concluído que os times eram indisciplinados.

O que a equipe aprendeu: o estágio de recomendação transformou baixa adoção de falha de disciplina
em informação sobre o padrão. Essa inversão de leitura foi a mudança de maior efeito, e ela custa
apenas seis meses de espera.

## Conceitos Relacionados

- [Padrões em Operação](../19-architecture-governance/governance-standards.md).
- [Padrões Corporativos](../15-enterprise-architecture/standards.md).
- [Princípios](leadership-principles.md).
- [Governança](leadership-governance.md).

## Exercício Prático

Escolha três padrões da sua organização e verifique se cada um tem caminho de adoção, dono, data
de revisão e resposta a quem paga a migração.

Os que não tiverem os quatro não são padrões — são documentos, e a adoção deles é acidente.

## Perguntas de Entrevista

- Por que baixa adoção voluntária é informação sobre o padrão?
- Por que aplicar um padrão só a sistemas novos é frequentemente a escolha certa?
- Por que quem escreve o padrão deveria ser quem o aplica?

## Para Aprofundar

- Ford, Neal et al. *Building Evolutionary Architectures*. 2ª ed. O'Reilly, 2022.
- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.
