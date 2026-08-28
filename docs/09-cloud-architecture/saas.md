---
id: saas
title: SaaS
sidebar_position: 3
description: Comprar o software pronto — a decisão de "construir ou comprar" e o que ela transfere junto.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor decide entre construir e comprar por diferencial
  competitivo, e avalia o SaaS pelo que ele acopla.
prerequisites: [paas]
related: [paas, vendor-lock-in, managed-services]
canonical_for: [SaaS, software como serviço, construir ou comprar]
content_version: 1
last_reviewed: 2026-08-27
---

# SaaS

## Visão Geral

SaaS — software como serviço — é o software pronto, operado por um fornecedor,
consumido por assinatura.

Do ponto de vista de arquitetura, adotar um SaaS é a decisão de **comprar em vez de
construir**: o fornecedor cuida de tudo, inclusive da funcionalidade.

O que permanece seu, sempre: os dados que você coloca lá, e a integração com o
resto do seu sistema.

## Problema

Toda empresa tem funcionalidades que precisa ter e que não a diferenciam: folha de
pagamento, gestão de chamados, envio de e-mail, monitoramento, autenticação.

Construir cada uma consome capacidade de engenharia que poderia estar no que
diferencia. E o resultado costuma ser pior que o produto especializado, porque não
recebe investimento contínuo.

A dificuldade não é reconhecer isso em geral. É decidir, caso a caso, onde está a
linha — e não construir por reflexo o que já existe pronto.

## Conceitos Centrais

### A pergunta é sobre diferencial, não sobre custo

O critério que resolve a maioria dos casos:

**Isto é fonte de vantagem competitiva?** Se os clientes escolhem você por causa
disso, construa. Se não, compre.

Uma transportadora que constrói o próprio roteirizador pode estar certa — a
eficiência de rota é o negócio. A mesma empresa construindo um sistema de chamados
está gastando capacidade no que não a distingue.

O erro mais comum não é comprar o que deveria construir. É construir o que deveria
comprar, tipicamente porque "o nosso caso é diferente" — e ele quase nunca é
diferente o suficiente para justificar.

### O que você compra junto

**Roadmap alheio.** O fornecedor decide o que construir. Sua necessidade específica
pode nunca ser atendida.

**Modelo de dados dele.** Seus dados vão para a estrutura que ele define.

**Disponibilidade dele.** Se ele cai, você cai — sem ação possível. Isso precisa
entrar no seu cálculo de disponibilidade. Ver
[disponibilidade](../06-distributed-systems/availability.md).

**Risco de continuidade.** Fornecedores são adquiridos, mudam de estratégia,
encerram produtos.

**Modelo de preço dele.** Que muda, e você tem pouco poder sobre isso.

### A integração é onde o custo real aparece

O SaaS resolve a funcionalidade. Conectá-lo ao seu sistema é trabalho seu, e é
subestimado:

**Sincronização de dados** nos dois sentidos, com todos os problemas de
[consistência](../07-data-architecture/data-consistency.md) que isso traz.

**Identidade.** Provisionar e desprovisionar usuários.

**Contrato.** A API dele muda no ritmo dele. Ver
[contratos de integração](../08-integration-architecture/integration-contracts.md).

**Anticorrupção.** O modelo dele não deveria entrar no seu. Ver
[anti-corruption layer](../08-integration-architecture/integration-anti-corruption.md).

Com muitos SaaS integrados, o custo de manter as integrações passa a ser
significativo — e é uma despesa que ninguém orça na aquisição.

### Saída de dados é o que decide a reversibilidade

Antes de adotar, três perguntas:

**Como exporto meus dados?** Em qual formato, com qual completude, com qual esforço.

**O histórico vem junto?** Muitos exportam o estado atual e não o histórico.

**Quanto tempo levaria migrar?**

Um SaaS sem exportação decente é uma decisão quase irreversível. Ver
[dependência de fornecedor](vendor-lock-in.md).

### Os dados continuam sendo sua responsabilidade

Colocar dados pessoais num SaaS não transfere a responsabilidade legal. Você
continua respondendo por eles.

Isso significa avaliar onde o fornecedor armazena, o que ele faz com os dados, como
ele trata solicitações de exclusão, e o que acontece se o contrato terminar. Ver
[ciclo de vida do dado](../07-data-architecture/data-lifecycle.md).

E significa que "está no fornecedor" não é resposta para uma auditoria.

### Proliferação silenciosa

SaaS é fácil de comprar — cartão de crédito, sem envolver engenharia. O resultado
previsível é que times diferentes adotam ferramentas sobrepostas, com dados
espalhados e sem inventário.

Isso vira problema de segurança — contas sem desprovisionamento, dados em lugares
desconhecidos — antes de virar problema de custo.

## Modelo Mental

**Compre o que não te diferencia.** E antes de comprar, verifique como você sairia.

## Quando Usar

- A funcionalidade não é diferencial competitivo.
- Existe produto maduro que atende.
- O custo de construir e manter supera a assinatura.
- Conformidade que o fornecedor já atende.
- Velocidade importa mais que ajuste fino.

## Quando Não Usar

**Quando é o diferencial competitivo.**

**Quando a exportação de dados é ruim.**

**Quando a disponibilidade dele não cabe no seu requisito.**

**Quando a conformidade não pode ser terceirizada.**

**Sem avaliar o custo de integração.**

**Muitos SaaS sobrepostos** sem inventário nem governança.

## Alternativas

- **Construir** — quando diferencia.
- **Código aberto autogerido** — controle dos dados, com o trabalho operacional.
- **SaaS com opção de instalação própria** — meio-termo, quando existe.
- **Comprar e envolver** — usar o SaaS atrás de uma camada própria, preservando a
  possibilidade de trocar.

## Trade-offs

| Comprar | Construir |
|---|---|
| Disponível agora | Meses |
| Sem manutenção | Contínua |
| Funcionalidade do fornecedor | Exatamente o que precisa |
| Custo previsível por assinatura | Custo de engenharia |
| Dependência e risco de continuidade | Controle |
| Dados no fornecedor | Seus |

## Modos de Falha

**Indisponibilidade do fornecedor.** Sem ação possível.

**Mudança de preço.**

**Produto descontinuado.**

**Recurso necessário nunca priorizado.**

**Exportação incompleta.** Descoberta na tentativa de sair.

**Contas não desprovisionadas.** Ex-funcionários com acesso.

**Modelo do fornecedor vazando** para o seu domínio.

## Erros Comuns

**Construir o que não diferencia.**

**Não verificar a exportação antes de adotar.**

**Não contabilizar o custo de integração.**

**Não incluir a disponibilidade do fornecedor no cálculo.**

**Não manter inventário de SaaS.**

**Deixar o modelo dele entrar no seu código.**

## Exemplo Real

Uma empresa de logística com 30 engenheiros mantinha, internamente: sistema de
chamados, ferramenta de monitoramento, gestão de documentos e um sistema de
recursos humanos.

Todos tinham sido construídos anos antes, quando as alternativas eram piores ou
mais caras.

O levantamento mostrou **4 engenheiros equivalentes** mantendo esses quatro sistemas
— 13% da capacidade, em nada que a empresa vendia.

A substituição por SaaS foi feita em três dos quatro:

**Chamados, monitoramento e recursos humanos** substituídos. Os quatro engenheiros
voltaram para o roteirizador, que é o diferencial real do produto.

**Gestão de documentos permaneceu interna.** O fluxo de aprovação era específico do
setor regulado em que a empresa opera, e nenhum produto atendia sem customização
extensa. Decisão registrada, com o custo de manutenção aceito.

Três problemas na transição:

**Exportação do sistema de chamados antigo.** Trivial, porque era próprio. A
verificação da exportação do **novo** foi feita antes de assinar — e um dos
candidatos foi descartado justamente porque só exportava os últimos 12 meses.

**Custo de integração subestimado.** Sincronizar usuários e centros de custo entre
três SaaS e o sistema interno levou o dobro do estimado, e virou manutenção
recorrente.

**Indisponibilidade.** O SaaS de monitoramento ficou fora por 6 horas. A ironia não
passou despercebida: o sistema que deveria avisar sobre problemas estava com
problema, e não havia alternativa. Passou a existir um monitoramento mínimo
independente, apenas para o caminho crítico.

Na retrospectiva: a decisão de comprar foi claramente positiva. O que faltou
foi orçar a integração como projeto — ela foi tratada como detalhe da aquisição e
consumiu mais tempo que a avaliação dos fornecedores.

## Conceitos Relacionados

- [PaaS](paas.md) e [IaaS](iaas.md) — os modelos abaixo.
- [Dependência de Fornecedor](vendor-lock-in.md).
- [Contratos de Integração](../08-integration-architecture/integration-contracts.md).
- [Ciclo de Vida do Dado](../07-data-architecture/data-lifecycle.md).

## Exercício Prático

Liste o que seu time mantém internamente. Para cada item, pergunte: os clientes
escolhem a gente por causa disto?

Onde a resposta for não, verifique se existe produto pronto — e quanto tempo o seu
time gasta mantendo o que existe.

## Perguntas de Entrevista

- Qual o critério para decidir entre construir e comprar?
- O que se compra junto com um SaaS, além da funcionalidade?
- Por que verificar a exportação antes de adotar?

## Para Aprofundar

- Fowler, Martin. *Utility vs Strategic Dichotomy*, 2007.
- Moore, Geoffrey. *Dealing with Darwin*. Portfolio, 2005 — core versus context.
- Cagan, Marty. *Inspired*. 2ª ed. Wiley, 2017.
