---
id: 07-modernize-legacy
title: "Exercício 07 — Modernizar um Legado"
sidebar_position: 1
description: Um sistema que funciona há dezenove anos, duas pessoas que sabem mexer nele, e nenhuma janela para parar.
doc_type: exercise
level: 6
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor propõe uma modernização incremental com ordem justificada, cada fase
  terminando em estado aproveitável.
prerequisites: [migration-strategies]
related: [strangler-fig, incremental-modernization, modernization-risk, organizational-constraints]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-29
---

# Exercício 07 — Modernizar um Legado

## Contexto

A **Cooperativa Agrícola do Vale** processa a compra de safra de 11 mil produtores rurais. O
sistema que faz isso entrou em produção em 2007.

```text
linhas de código                ~2,4 milhões, em Delphi
banco                           Firebird, esquema com 840 tabelas
integrações                     3 bancos, 2 órgãos reguladores,
                                um sistema fiscal
pessoas capazes de alterá-lo    2, com 19 e 14 anos de casa
documentação                    desatualizada desde 2011
testes automatizados            nenhum
disponibilidade em 2025         99,7%
```

O sistema **funciona**. Ele nunca perdeu um pagamento e nunca calculou uma safra errada. Isso
precisa ser dito primeiro, porque a proposta que o tratar como problema vai ser rejeitada por
quem o mantém há dezenove anos.

Três pressões motivam a discussão:

**Conhecimento.** As duas pessoas se aposentam em quatro e sete anos. Não há mercado para a
tecnologia, e formar alguém internamente levou, na última tentativa, dois anos e meio — a pessoa
saiu.

**Canal digital.** A cooperativa quer que o produtor consulte sua posição e agende entrega pelo
celular. O sistema não tem interface programável de espécie alguma.

**Regulatório.** Uma norma nova exige rastreabilidade de origem por lote, com prazo de 30 meses.
Implementá-la no sistema atual foi estimado pelas duas pessoas em 14 meses.

## Requisitos

O sistema precisa continuar fazendo tudo que faz. Além disso, no horizonte de 30 meses:

```text
interface programável para o canal digital
rastreabilidade de origem por lote
mais de duas pessoas capazes de manter o sistema
```

## Restrições

```text
sem janela         a safra tem picos em quatro meses do ano;
                   nesses períodos nada pode ser tocado
equipe             a cooperativa pode contratar até 8 engenheiros;
                   nenhum vai aprender Delphi
orçamento          aprovado por ano, com risco de contingenciamento
prazo regulatório  30 meses, com multa
as duas pessoas    precisam participar, e não podem ser tratadas
                   como obstáculo
regras de negócio  não estão escritas em lugar nenhum além do código
```

## Sua Tarefa

Produza, em até 90 minutos:

1. A **estratégia**: reescrever, converter, estrangular ou encapsular — com a razão.
2. A **ordem das fases**, e o que sobra se o trabalho parar ao fim de cada uma.
3. Como as **regras de negócio** saem do código sem se perderem.
4. O papel das **duas pessoas** no plano.
5. Como você atende ao **prazo regulatório de 30 meses** dentro da estratégia escolhida.

## Perguntas que Você Deveria Fazer

```text
quais funcionalidades mudam com frequência, e quais não mudam
  há anos?
onde estão as integrações, e quais são estáveis?
o esquema de 840 tabelas está todo em uso?
existe log de acesso que mostre o que é executado de fato?
a rastreabilidade regulatória toca qual parte do sistema?
o que o canal digital precisa ler, e o que ele precisa escrever?
```

A quarta é a mais valiosa e quase nunca é feita: em sistemas de dezenove anos, uma fração
grande do código é inalcançável.

## Critérios de Avaliação

Sua resposta está boa se:

- **Você não propôs reescrita completa.** Com regras não documentadas, duas pessoas e prazo
  regulatório, ela é a estratégia com maior taxa histórica de fracasso neste cenário.
- **A primeira fase entrega valor** e não é infraestrutura. Se o plano for cancelado no mês 8, o
  que sobra precisa servir para alguma coisa.
- **Você atende ao prazo regulatório sem depender da modernização inteira.** Trinta meses não
  cobrem 2,4 milhões de linhas.
- **A recuperação das regras é por comparação, não por leitura.** Ninguém vai ler 2,4 milhões de
  linhas de Delphi e extrair especificação correta.
- **As duas pessoas têm papel de autoridade**, não de fonte de consulta. Elas sabem o que
  ninguém sabe, e o plano depende disso.

Sua resposta é fraca se ela começa por "vamos construir a nova plataforma" e trata as duas
pessoas como risco a mitigar.

## Discussão

:::details Abra depois de tentar

**A estratégia é estrangulamento**, com o legado encapsulado desde cedo.

A razão não é preferência: reescrever exige a especificação que não existe, e converter
automaticamente preserva a lógica sem resolver o problema de conhecimento — o código gerado
continua ilegível para os oito engenheiros novos.

**A ordem, e o que sobra em cada parada:**

```text
fase 1 (4 meses)   fachada de leitura sobre o legado
                   → o canal digital entra no ar
                   se parar aqui: o produtor consulta pela primeira
                   vez, e a cooperativa tem um resultado visível

fase 2 (8 meses)   rastreabilidade de lote, construída FORA do
                   legado, alimentada por eventos que a fachada emite
                   → prazo regulatório atendido no mês 12, com
                   18 de folga
                   se parar aqui: conformidade garantida

fase 3 (12 meses)  extração das capacidades de maior taxa de
                   mudança, com comparação em paralelo
                   se parar aqui: parte migrada, parte no legado,
                   ambas funcionando

fase 4 (contínuo)  o resto, na ordem do risco
```

**A fase 2 é a decisão que resolve o exercício.** A rastreabilidade não precisa estar dentro do
legado — ela precisa dos dados que o legado produz. Construída fora, ela leva 8 meses em vez dos
14 estimados dentro, e não depende de nenhuma das duas pessoas.

Quem coloca a rastreabilidade dentro do legado consome 14 dos 30 meses, ocupa as duas pessoas
que são o recurso mais escasso, e chega ao mês 14 sem ter modernizado nada.

**As regras saem por comparação.** O sistema novo é implementado com o melhor entendimento
disponível, roda em paralelo sobre transações reais, e cada divergência é uma regra descoberta.
Ler o código não funciona: em dezenove anos, a lógica de cálculo de safra tem casos que ninguém
lembra de ter escrito.

Ver o [case de modernização](/21-case-studies/legacy-modernization-case.md).

**As duas pessoas** são a autoridade sobre a comparação, não a fonte da especificação. O papel
delas é decidir, diante de uma divergência, qual comportamento está correto — e esse julgamento é
o que nenhum documento substitui.

Tratá-las como obstáculo é o erro mais comum e o mais caro: elas podem inviabilizar o projeto
sem fazer nada, apenas não colaborando, e teriam razão.

**A pergunta sobre código inalcançável** costuma render: em sistemas dessa idade, entre 30% e
50% do código não é executado há anos. Descobrir isso reduz o escopo real antes de qualquer
linha ser escrita, e é o levantamento de melhor retorno do projeto.

**Os picos de safra** definem o calendário: oito meses do ano são úteis, quatro não. Um plano de
30 meses tem, na prática, 20 meses de janela — e isso precisa estar no cronograma desde o
início, não ser descoberto no primeiro pico.

:::

## Conceitos Relacionados

- [Estratégias de Migração](/16-legacy-modernization/migration-strategies.md).
- [Strangler Fig](/16-legacy-modernization/strangler-fig.md).
- [Case: Modernização de Legado](/21-case-studies/legacy-modernization-case.md).
- [Restrições Organizacionais](/16-legacy-modernization/organizational-constraints.md).
