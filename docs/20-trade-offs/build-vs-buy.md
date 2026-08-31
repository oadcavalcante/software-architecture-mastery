---
id: build-vs-buy
title: Build vs. Buy
sidebar_position: 11
description: Construir custa o que ninguém orça — e a conta só fecha quando o custo de pessoal entra nela.
doc_type: tradeoff
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor compara construir e comprar com custo total, incluindo pessoal e
  manutenção, e decide por capacidade diferenciadora.
prerequisites: [saas]
related: [managed-vs-self-hosted, cost-vs-reliability, centralization-vs-decentralization]
canonical_for: [construir contra comprar, capacidade diferenciadora, custo total de propriedade, viés de construção]
content_version: 1
last_reviewed: 2026-08-29
---

# Build vs. Buy

## Visão Geral

A decisão parece financeira e é estratégica:

```text
eixo real   esta capacidade diferencia o negócio, e o custo total de
            construí-la e mantê-la é menor que o de comprá-la?
```

As duas metades erram em direções opostas. A primeira é superestimada — times consideram
diferenciadoras capacidades que o mercado resolve há anos. A segunda é subestimada — o custo
de construir omite sistematicamente o item mais caro: **pessoal, para sempre**.

O resultado agregado é um viés forte a favor de construir, que aparece de forma consistente
em revisões retrospectivas.

## Problema

A comparação típica:

```text
solução de mercado    R$ 14 mil/mês em licenças
construir             R$ 4 mil/mês de infraestrutura, "mais algum tempo
                      de engenharia"
```

"Algum tempo de engenharia" é onde a decisão se perde. Medido depois, ele costuma ser de
0,5 a 2 pessoas em tempo integral, permanentemente — o que a preços de mercado supera a
licença por uma margem larga.

E há custos que nem entram na conta:

```text
o que se deixa de construir enquanto se constrói isto
o tempo até estar pronto, e o que custa não ter durante ele
o conhecimento concentrado em quem construiu
o custo de manter quando essa pessoa sai
funcionalidades que a solução de mercado tem e a nossa nunca terá
```

O erro simétrico existe: comprar uma solução para a capacidade que **é** o produto, e passar
a competir com uma ferramenta que todos os concorrentes têm.

## Conceitos Centrais

### Capacidade diferenciadora

```text
diferenciadora   o cliente percebe, e é razão para escolher você
de apoio         necessária, e nenhum cliente escolhe por causa dela
de commodity     todo mundo tem, e ninguém nota
```

A regra: **construa o diferenciador, compre o resto**.

Aplicada honestamente, ela elimina a maior parte dos candidatos a construção:

```text
motor de precificação de uma seguradora      diferenciador
algoritmo de roteamento de uma logística     diferenciador
autenticação                                 commodity
envio de e-mail                              commodity
painel de métricas                           commodity
gestão de conteúdo                           quase sempre de apoio
```

E o teste é desconfortável: **um cliente já escolheu você por causa disso?**

Ver [domínio genérico](/04-domain-driven-design/generic-domain.md).

### Custo total, com pessoal

A comparação precisa incluir, dos dois lados:

```text
construir                     comprar
esforço inicial               licença
manutenção contínua           custo de integração
operação e plantão            configuração e customização
atualização e segurança       treinamento
conhecimento concentrado      dependência do fornecedor
custo de oportunidade         limites da ferramenta
```

Uma regra prática que muda muitas conclusões: **estime a manutenção em 15% a 25% do esforço
inicial, por ano, indefinidamente.**

E converta esforço em dinheiro. "0,5 engenheiro" é um número abstrato; o custo mensal
correspondente não é, e é ele que compara com a licença.

### O tempo até estar pronto tem custo

```text
comprar     disponível em semanas
construir   disponível em meses
```

O intervalo tem custo de oportunidade que raramente é somado: o que a organização deixa de
fazer, e o que custa não ter a capacidade durante o período.

Em mercados com janela — uma exigência regulatória com data, um concorrente avançando —, o
tempo pode ser o fator dominante e tornar a comparação de custo irrelevante.

### O viés de construção é previsível

Ele tem causas identificáveis:

```text
construir é mais interessante que integrar
o esforço de construir é visível; o de manter, não
subestimar escopo é sistemático
"a nossa necessidade é diferente" quase sempre é falso na margem
comprar exige processo de compra, que é chato
```

O último é subestimado como causa. Em organizações com processo de compra pesado, times
constroem para evitar seis meses de negociação — e a decisão técnica é decidida por atrito
administrativo.

### Comprar não é o fim da decisão

```text
integração                pode ser mais cara que a licença
customização              limites da ferramenta viram limites do produto
dados                     onde ficam, como saem
dependência               o que acontece se o fornecedor mudar de rumo
custo de saída            medido antes, não depois
```

Ver [aprisionamento](/09-cloud-architecture/vendor-lock-in.md).

E há um cuidado específico: comprar algo que o produto vai depender profundamente exige
avaliar o roteiro do fornecedor e a saúde da empresa, não apenas a funcionalidade atual.

### Sinais de escolha errada

```text
construiu e não devia
  equipe dedicada permanente a algo que não é o produto
  funcionalidades pedidas que nunca entram na fila
  comparação com soluções de mercado evitada
  quem construiu virou ponto único de conhecimento
  custo de manutenção crescente e não orçado

comprou e não devia
  customização excessiva, com código ao redor da ferramenta
  a ferramenta limitando o que o produto pode oferecer
  concorrentes com a mesma solução, sem diferenciação
  custo de licença crescendo com escala mais rápido que a receita
  dados essenciais fora do seu controle
```

### Custo de mudar de ideia

```text
comprar → construir   caro e demorado, e viável: os requisitos são conhecidos
construir → comprar   caro de outro jeito: migração de dados, resistência
                      de quem construiu, funcionalidades próprias a perder
```

A assimetria tem um componente humano relevante: abandonar algo construído internamente
encontra resistência que abandonar uma licença não encontra. Isso deveria pesar na decisão
inicial — e não pesa.

Favorece **comprar na dúvida**, com a decisão registrada e a condição de reversão explícita:
"construiremos se a ferramenta bloquear X".

## Modelo Mental

**Construa o que diferencia; compre o resto.** E some o custo de pessoal, sempre — é ele que
inverte a maior parte das conclusões.

## Quando Usar

Construa quando:

- A capacidade é razão pela qual clientes escolhem você.
- Nenhuma solução de mercado atende a um requisito central, verificado.
- O custo total, com pessoal, é menor — com o número calculado.
- O controle sobre a evolução é estratégico.

Compre quando:

- A capacidade é de apoio ou commodity.
- O tempo até estar pronto importa.
- O custo total favorece, com pessoal contado.
- A equipe não tem experiência no domínio da ferramenta.
- Não há apetite para manter indefinidamente.

## Quando Não Usar

**Sem incluir custo de pessoal** na comparação. Construir consome engenheiros durante anos, não só no primeiro ano — e esse é quase sempre o maior item da conta.

**Sem testar se a capacidade é mesmo diferenciadora.** O teste é direto: um cliente escolheria a empresa por causa disso? Se não, construir é gastar a capacidade que diferenciaria em algo que não diferencia.

**Construindo para evitar processo de compra.** A decisão passa a ser tomada pela burocracia, não pelo mérito — e o custo do atrito de compra é pago por anos de manutenção.

**Comprando o que é o produto.** Terceirizar o núcleo entrega ao fornecedor o ritmo de evolução daquilo que a empresa vende.

**Sem avaliar custo de saída** do fornecedor. É o que transforma uma decisão reversível em irreversível, e é a pergunta que precisa ser feita antes de assinar.

## Alternativas

- **Comprar e estender** — usar a base do mercado e construir só a parte diferenciadora
  sobre ela.
- **Código aberto operado por nós** — meio-termo entre construir e comprar, com custo
  operacional próprio. Ver [gerenciado vs. autogerido](/20-trade-offs/managed-vs-self-hosted.md).
- **Comprar agora, construir depois** — com a decisão registrada e a condição de reversão.
- **Construir o mínimo** — a versão de 10% que atende ao caso, sem generalizar.

A primeira é a resposta certa com mais frequência do que qualquer dos extremos, e a que mais
exige disciplina para não virar customização sem fim.

## Trade-offs

| Construir | Comprar |
|---|---|
| Ajustado ao caso | Disponível rápido |
| Controle da evolução | Manutenção terceirizada |
| Custo permanente de pessoal | Custo permanente de licença |
| Conhecimento interno | Dependência de fornecedor |
| Sem limites da ferramenta | Sem custo de manter |

| Comprar e estender | Construir do zero |
|---|---|
| Base pronta | Sem restrição |
| Limites do fornecedor | Tudo por conta |
| Menos código próprio | Mais controle |

## Modos de Falha

**Custo de pessoal omitido.** A comparação favorece construir por construção.

**Capacidade de apoio construída.** Equipe permanente fora do produto.

**Compra para evitar processo de compra.** Decisão técnica por atrito administrativo.

**Customização sem fim.** A ferramenta comprada vira projeto de desenvolvimento.

**Ponto único de conhecimento.** Quem construiu sai.

**Custo de saída não avaliado.** Descoberto na hora de sair.

## Erros Comuns

**Comparar licença com infraestrutura**, sem pessoal.

**Não aplicar o teste "um cliente já escolheu por causa disso?".**

**Subestimar manutenção** — use 15% a 25% ao ano.

**Não somar o custo de oportunidade** do tempo até estar pronto.

**Não registrar a condição de reversão.**

## Exemplo Real

Uma empresa de comércio eletrônico decidiu em 2022 construir sua própria plataforma de
comunicação com clientes — e-mail transacional, notificação e campanhas.

A comparação registrada na época:

```text
solução de mercado    ~R$ 22 mil/mês para o volume previsto
construir             ~R$ 6 mil/mês de infraestrutura
                      "2 engenheiros por 4 meses" de construção
```

O que aconteceu:

```text
construção                            9 meses, 3 engenheiros
equipe de manutenção depois           2 engenheiros em tempo integral
custo de pessoal correspondente       ~R$ 90 mil/mês
custo real de infraestrutura          ~R$ 9 mil/mês
funcionalidades da solução de mercado
  que nunca foram construídas         teste A/B, segmentação avançada,
                                      painel de entregabilidade, gestão de
                                      reputação de remetente
taxa de entrega de e-mail             de 94% para 87% em 18 meses,
                                      por gestão de reputação insuficiente
```

A taxa de entrega foi o dado que mudou a conversa. Sete pontos percentuais de e-mails não
entregues, sobre o volume da empresa, foram estimados em cerca de R$ 340 mil por mês de
receita não realizada.

A migração para a solução de mercado levou cinco meses e encontrou a resistência prevista —
a equipe que construiu defendeu a plataforma por três ciclos de priorização.

Resultados um ano depois:

```text
custo de licença                      ~R$ 31 mil/mês (volume maior que o previsto)
engenheiros liberados                 2, realocados para o motor de recomendação
taxa de entrega                       96%
funcionalidades disponíveis           todas as que nunca foram construídas
```

O que a organização mudou no processo de decisão:

**Custo de pessoal obrigatório** em toda comparação de construir contra comprar, com valor
monetário e não em "engenheiros".

**Manutenção estimada em 20% ao ano** do esforço inicial, por padrão, e registrada.

**Teste de diferenciação** explícito no ADR: a pergunta "um cliente já escolheu a empresa
por causa disso?" precisa ser respondida por escrito. Comunicação transacional falhava
claramente.

**Processo de compra simplificado** para ferramentas abaixo de um limite — a investigação
tinha revelado que dois dos quatro projetos de construção anteriores existiam para evitar o
processo de compra.

**Condição de reversão registrada** nas compras: o que faria a empresa construir.

Nos dois anos seguintes, sob as regras novas:

```text
avaliações de construir contra comprar        22
decisões de construir                          4
das 4, com teste de diferenciação positivo     4
casos em que a inclusão do custo de pessoal
  inverteu a conclusão inicial                 9
```

Os 9 casos invertidos são o dado que a equipe considera decisivo. Em todos, a intuição
inicial era construir, e o número mudou a decisão.

O que a equipe aprendeu: a construção de 2022 não foi mal executada. A plataforma funcionava.
Ela apenas custava seis vezes mais do que a alternativa, numa capacidade em que a empresa
nunca teria vantagem — e a conta que teria mostrado isso levava vinte minutos para ser
feita.

## Conceitos Relacionados

- [SaaS](/09-cloud-architecture/saas.md) e
  [Domínio Genérico](/04-domain-driven-design/generic-domain.md).
- [Gerenciado vs. Autogerido](/20-trade-offs/managed-vs-self-hosted.md).
- [Aprisionamento](/09-cloud-architecture/vendor-lock-in.md).
- [Custo vs. Confiabilidade](/20-trade-offs/cost-vs-reliability.md).

## Exercício Prático

Escolha um componente que seu time construiu e calcule o custo de pessoal dedicado a ele nos
últimos 12 meses.

Compare com o preço da alternativa de mercado hoje. A diferença é o que a decisão original
não incluiu.

## Perguntas de Entrevista

- Por que a comparação de custo favorece construir quando feita da forma usual?
- Que teste decide se uma capacidade é diferenciadora?
- Por que a assimetria de reversão favorece comprar na dúvida?

## Para Aprofundar

- Moore, Geoffrey. *Living on the Fault Line*. HarperBusiness, 2000 — núcleo e contexto.
- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.
