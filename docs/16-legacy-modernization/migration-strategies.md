---
id: migration-strategies
title: Estratégias de Migração
sidebar_position: 9
description: Replataformar, refatorar, reconstruir, substituir — e o critério que escolhe entre elas.
doc_type: tradeoff
level: 6
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor escolhe a estratégia a partir do problema, e reconhece que a
  resposta frequentemente é uma combinação.
prerequisites: [modernization-drivers]
related: [replatforming, legacy-refactoring, rebuilding, replacing]
canonical_for: [estratégia de migração, critério de escolha, combinação de estratégias]
content_version: 1
last_reviewed: 2026-08-28
---

# Estratégias de Migração

## Visão Geral

Diante de um sistema que precisa mudar, há quatro caminhos:

```text
replataformar  mover para infraestrutura nova, sem mudar a aplicação
refatorar      melhorar a estrutura interna, mantendo o comportamento
reconstruir    escrever de novo, com o mesmo escopo
substituir     trocar por um produto de mercado
```

E um quinto, frequentemente correto e raramente considerado: **não fazer nada**.

A escolha vem do problema, não da preferência. Cada estratégia resolve um tipo de
limitação e é desperdício para os outros.

## Problema

A discussão sobre modernização costuma pular direto para uma estratégia — normalmente
reconstruir — sem passar pelo diagnóstico.

```text
"vamos reescrever"    quando o problema era a infraestrutura
"vamos para a nuvem"  quando o problema era o modelo de dados
"vamos comprar"       quando a capacidade é diferenciadora
```

Cada um desses gasta muito para não resolver o problema real. Ver
[motivadores de modernização](modernization-drivers.md).

## Conceitos Centrais

### O critério: onde está o problema

```text
problema                          →  estratégia
infraestrutura cara ou obsoleta      replataformar
código difícil de mudar               refatorar
modelo de domínio errado              reconstruir
capacidade não diferenciadora         substituir
nada limita de fato                   não fazer nada
```

Ver [replataforma](replatforming.md), [refatoração](legacy-refactoring.md),
[reconstrução](rebuilding.md) e [substituição](replacing.md).

A linha do meio é a que mais confunde: código difícil de mudar frequentemente é tratado
como caso de reconstrução, quando refatoração incremental resolve por uma fração do
custo.

O teste que separa os dois: **o modelo de domínio está certo?** Se as entidades e as
regras fazem sentido e o problema é a organização do código, refatore. Se o modelo em si
está errado — reflete um negócio que não existe mais —, reconstruir se justifica.

### Custo e risco crescem na ordem

```text
                 custo    risco    tempo    valor entregue
não fazer nada    zero     baixo    zero     zero
replataformar     baixo    baixo    meses    infraestrutura
refatorar         médio    baixo    contínuo velocidade
substituir        médio    médio    meses    capacidade pronta
reconstruir       alto     alto     anos     tudo, no fim
```

A última linha explica por que reconstruir é a escolha errada com tanta frequência: ela é
a mais cara, a mais arriscada, e a que demora mais para entregar.

Ela se justifica quando as outras não resolvem — e essa verificação raramente é feita.

### A resposta costuma ser uma combinação

Sistemas reais não são homogêneos. Partes diferentes têm problemas diferentes:

```text
o motor de cálculo        modelo errado          → reconstruir
o cadastro                funciona bem            → manter
a integração com parceiros infraestrutura antiga → replataformar
os relatórios             capacidade comum        → substituir
```

Ver [modernização incremental](incremental-modernization.md).

Decidir por sistema inteiro é o que produz projetos grandes demais. Decidir por parte
produz um plano com escopo proporcional ao problema.

### Replataformar primeiro é frequentemente inteligente

Mover para infraestrutura moderna, sem mexer na aplicação, é rápido e destrava coisas:

```text
esteira automatizada
ambientes reproduzíveis
observabilidade
implantação mais frequente
```

Isso reduz o custo de tudo o que vier depois — inclusive de reconstruir, se for o caso.

E entrega valor cedo, o que sustenta apoio para o trabalho mais longo. Ver
[restrições organizacionais](organizational-constraints.md).

### Substituir exige avaliar a fronteira

Um produto de mercado traz a fronteira do fornecedor, que raramente coincide com o
domínio da organização.

Ver [arquitetura de aplicação](../15-enterprise-architecture/application-architecture.md)
e [SaaS](../09-cloud-architecture/saas.md).

Isso produz duas situações que precisam ser avaliadas antes: o produto faz mais que o
necessário — e a duplicação precisa ser resolvida — ou faz menos, e o resto precisa ser
construído em volta.

E há o critério de diferenciação: substituir uma capacidade diferenciadora por um produto
que os concorrentes também usam elimina a diferenciação. Ver
[capacidades de negócio](../15-enterprise-architecture/business-capabilities.md).

### Não fazer nada precisa ser avaliado explicitamente

Ela é a única estratégia sem custo de execução, e raramente entra na comparação.

```text
faz sentido   o sistema atende, é estável, ninguém precisa mudá-lo
              o custo de qualquer estratégia supera o de conviver
              o sistema será descontinuado por outro motivo em breve
```

O que a torna uma decisão, e não omissão: registrá-la, com as razões e um prazo de
revisão. Ver
[motivadores de modernização](modernization-drivers.md).

### A estratégia pode mudar durante a execução

Uma decisão tomada no início, com a informação disponível então, pode se revelar errada
conforme o sistema é compreendido.

```text
começou refatorando        e descobriu que o modelo estava errado    → reconstruir
começou reconstruindo      e descobriu que o modelo estava certo     → refatorar
começou substituindo       e descobriu lacuna funcional grande       → construir
```

A segunda é a mais dolorosa e a mais comum: a reconstrução começa, e a arqueologia
revela que o modelo antigo estava correto — o problema era a organização do código.

Mudar de estratégia no meio é caro e frequentemente é a decisão certa. O que a impede é o
compromisso público com a abordagem inicial, que transforma a mudança em admissão de erro.

O que facilita: tratar a escolha como hipótese revisável desde o início, com pontos
definidos de reavaliação — tipicamente após a primeira fatia, quando o entendimento do
sistema é qualitativamente maior. Ver
[modernização incremental](incremental-modernization.md).

## Modelo Mental

**A estratégia vem do problema.** Reconstruir é a mais cara e a mais arriscada, e é a
escolha padrão por reflexo.

## Quando Usar

- **Replataformar:** infraestrutura obsoleta ou cara, aplicação aceitável.
- **Refatorar:** código difícil de mudar, modelo correto.
- **Reconstruir:** modelo de domínio errado, e as outras não resolvem.
- **Substituir:** capacidade não diferenciadora com produto maduro disponível.
- **Não fazer nada:** o sistema atende e nada o limita.

## Quando Não Usar

**Reconstruir por reflexo**, sem verificar as alternativas.

**Decidir por sistema inteiro** quando as partes têm problemas diferentes.

**Substituir capacidade diferenciadora.**

**Replataformar e parar aí**, quando o problema era outro.

**Refatorar quando o modelo está errado** — ela melhora a estrutura de algo que não
deveria existir daquela forma.

**Sem avaliar não fazer nada.**

## Alternativas

Além das cinco, três abordagens intermediárias:

- **Contenção** — isolar o legado com uma camada de tradução, para que ele não limite o
  entorno. Ver
  [anti-corruption layer](../08-integration-architecture/integration-anti-corruption.md).
- **Congelar** — o sistema para de evoluir; funcionalidade nova é construída fora.
- **Encapsular** — expor o legado por uma interface moderna, sem mudá-lo.

As três compram tempo a custo baixo, e são adequadas quando o motivo não justifica
investimento maior.

## Trade-offs

| Reconstruir | Refatorar |
|---|---|
| Modelo novo | Modelo mantido |
| Custo alto | Incremental |
| Valor no fim | Contínuo |
| Conhecimento embutido perdido | Preservado |
| Risco alto | Baixo |

| Substituir | Construir |
|---|---|
| Disponível rápido | Meses |
| Fronteira do fornecedor | Própria |
| Sem diferenciação | Possível |
| Dependência | Controle |

## Modos de Falha

**Reconstruir o que deveria ser refatorado.**

**Refatorar o que tem modelo errado.**

**Substituir capacidade diferenciadora.**

**Replataformar esperando que resolva problema de código.**

**Decidir por sistema inteiro.**

**Não considerar não fazer nada.**

## Erros Comuns

**Escolher a estratégia antes do diagnóstico.**

**Assumir que o sistema é homogêneo.**

**Não avaliar replataformar como primeiro passo.**

**Não verificar a fronteira do produto** ao substituir.

**Não registrar a decisão de não fazer.**

## Exemplo Real

Uma empresa de varejo tinha um sistema de gestão de estoque de 14 anos, com proposta de
reconstrução completa — estimada em 24 meses.

O diagnóstico por parte, feito antes de aprovar, decompôs o sistema:

```text
componente             problema                        estratégia
motor de reposição     algoritmo desatualizado,        reconstruir
                       modelo não suporta multicanal
cadastro de produtos   funciona bem, estável           manter
movimentação           código emaranhado, modelo ok    refatorar
relatórios             capacidade comum                substituir
integrações            infraestrutura antiga            replataformar
interface de operação  funciona, feia                  manter
```

Apenas um dos seis componentes justificava reconstrução — e era o que causava a limitação
de negócio: a empresa não conseguia operar estoque unificado entre loja e comércio
eletrônico.

O plano executado:

**Replataformar as integrações primeiro** — dois meses. Destravou esteira, observabilidade
e implantação frequente, o que reduziu o custo de tudo o mais.

**Substituir relatórios** por um produto de mercado — três meses, com o time liberado.

**Reconstruir o motor de reposição** — nove meses, com estrangulamento. A capacidade de
estoque unificado foi lançada no mês 11.

**Refatorar movimentação** incrementalmente, ao longo de dois anos, junto com as mudanças
de produto que a tocavam.

**Cadastro e interface mantidos.** Nenhum problema, nenhum investimento.

Custo total: cerca de 40% da estimativa original, com a capacidade de negócio entregue no
mês 11 em vez de no 24.

E uma decisão registrada: o cadastro de produtos foi avaliado e a decisão de não mexer
foi documentada, com revisão anual. Dois anos depois, ela continua válida.

O que a equipe aprendeu: a proposta original não estava errada tecnicamente — reconstruir
o sistema inteiro produziria um sistema melhor. Ela estava errada em escopo, porque
tratava como homogêneo um sistema cujas partes tinham problemas completamente diferentes.

## Conceitos Relacionados

- [Replataforma](replatforming.md), [Refatoração](legacy-refactoring.md),
  [Reconstrução](rebuilding.md), [Substituição](replacing.md).
- [Motivadores de Modernização](modernization-drivers.md) — o diagnóstico.
- [Modernização Incremental](incremental-modernization.md).

## Exercício Prático

Pegue um sistema candidato a modernização e decomponha-o em componentes, atribuindo uma
estratégia a cada um.

Se todos receberem a mesma estratégia, provavelmente a decomposição não foi feita com
rigor suficiente.

## Perguntas de Entrevista

- Que critério separa refatorar de reconstruir?
- Por que replataformar primeiro costuma ser inteligente?
- Por que decidir por sistema inteiro produz projetos grandes demais?

## Para Aprofundar

- Newman, Sam. *Monolith to Microservices*. O'Reilly, 2019.
- Feathers, Michael. *Working Effectively with Legacy Code*. Prentice Hall, 2004.
- Gartner. *Application Modernization Approaches* — as sete abordagens.
