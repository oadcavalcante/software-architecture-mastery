---
id: cost-management
title: Gestão de Custo
sidebar_position: 16
description: Custo é atributo de qualidade arquitetural — e o único que quem decide orçamento entende sem tradução.
doc_type: concept
level: 7
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor trata custo como restrição de desenho, mede unidade econômica e
  atribui custo a quem pode reduzi-lo.
prerequisites: [risk-management]
related: [risk-management, technical-strategy-leadership, measuring-architecture-outcomes]
canonical_for: [custo como atributo arquitetural, unidade econômica, atribuição de custo, visibilidade de custo por time]
content_version: 1
last_reviewed: 2026-08-29
---

# Gestão de Custo

## Visão Geral

Custo é um atributo de qualidade arquitetural, no mesmo nível de latência e disponibilidade. Ele é
tratado como preocupação de outra área com frequência, e essa delegação é o que produz sistemas
que funcionam bem e custam mais do que a receita que geram.

```text
decisão arquitetural         efeito no custo
cache                        reduz leitura no banco, adiciona memória
réplica multirregional       multiplica infraestrutura
retenção de dados            cresce linearmente e para sempre
granularidade de serviço     cada serviço tem custo fixo de operação
formato de dado              volume × custo por byte, em toda a cadeia
```

Nenhuma dessas decisões é tomada pela área financeira. Todas afetam a conta, e a maior parte é
tomada sem que o efeito seja calculado.

## Problema

Dois padrões.

**Custo invisível na decisão.** A arquitetura é escolhida por critérios técnicos, e o custo
aparece na fatura meses depois — quando mudá-la é caro. É a mesma dinâmica do case de
[streaming](/21-case-studies/video-streaming.md), em que 96% do custo estava fora do
datacenter e o esforço de engenharia estava no lugar errado.

**Custo agregado sem atribuição.** A organização sabe que gasta R$ 30 milhões por ano em nuvem e
não sabe quanto cada sistema, cada time ou cada transação consome. Sem atribuição, ninguém pode
reduzir — porque a informação não chega a quem toma a decisão que gera o custo.

```text
custo agregado    ninguém age
custo por time    o time age
custo por
  transação       a decisão de produto muda
```

## Conceitos Centrais

### Unidade econômica é o número que importa

```text
custo total            cresce com o negócio; não informa
custo por unidade      custo por pedido, por usuário ativo,
                       por gigabyte entregue, por transação
```

A unidade econômica separa crescimento saudável de ineficiência. Um custo total que cresce 40%
com um volume que cresceu 60% é uma melhoria; o mesmo crescimento com volume estável é um
problema.

Escolher a unidade certa é a parte que exige julgamento: ela precisa ser algo que o negócio
reconhece e que a engenharia influencia.

### Atribua o custo a quem pode reduzi-lo

```text
fatura única           ninguém tem incentivo
por time               o time vê e age
por serviço            a decisão de arquitetura tem consequência
                       visível
```

Atribuição é a intervenção de maior retorno em gestão de custo, e ela é infraestrutural: exige
etiquetagem consistente de recursos, o que é chato de implementar e transformador de operar.

O efeito observado repetidamente: times que passam a ver o próprio custo reduzem entre 20% e 40%
nos primeiros meses, sem nenhuma diretriz — apenas removendo o que era desperdício invisível.

### Custo entra na decisão, não depois dela

```text
"a opção A custa cerca de R$ 40 mil/mês; a B, R$ 110 mil/mês.
 A B tem latência 30% melhor. O requisito é de 200 ms, e a A
 entrega 180 ms."
```

Isso é uma decisão de arquitetura com informação completa. Sem o número, ela é tomada por
preferência técnica e o custo aparece depois.

Incluir estimativa de custo em toda proposta arquitetural relevante é uma prática barata e rara.
Ver [ADRs](/18-architecture-decisions/index.md).

### O custo operacional humano é o maior e o menos contado

```text
infraestrutura   está na fatura, é visível
pessoas          é maior, e não aparece em nenhuma conta de sistema
```

Um componente que consome meio engenheiro em operação custa mais que a maior parte das linhas de
infraestrutura, e essa comparação quase nunca é feita. Ver
[gerenciado vs. autogerido](/20-trade-offs/managed-vs-self-hosted.md) e
[build vs. buy](/20-trade-offs/build-vs-buy.md).

Trazer o custo de pessoal para a mesma tabela da fatura muda conclusões com frequência.

### Custo tem curva, e ela raramente é linear

```text
armazenamento     cresce e não decresce; retenção é dívida perpétua
transferência     cresce com uso, e entre regiões custa mais
licença por
  unidade         cresce com o sucesso
capacidade ociosa custa igual, usada ou não
```

O primeiro item merece destaque: uma decisão de retenção tomada hoje gera custo todos os meses,
para sempre, e ninguém a revisita. Retenção é a linha de custo que mais cresce silenciosamente.

### Otimizar custo é como otimizar desempenho

O mesmo método se aplica, e o mesmo erro é cometido:

```text
sem medir      otimiza-se o que é conhecido, não o que pesa
com medição    a distribuição costuma ser muito desigual
```

Em quase toda organização, uma fração pequena dos componentes responde pela maior parte do custo.
Otimizar o resto é esforço desperdiçado com aparência de rigor. Ver
[desempenho vs. manutenibilidade](/20-trade-offs/performance-vs-maintainability.md).

### Nem todo custo deve ser reduzido

```text
custo que compra confiabilidade em sistema crítico   deve permanecer
custo de capacidade ociosa para pico previsível      deve permanecer
custo de serviço gerenciado que libera pessoas       frequentemente
                                                     deve permanecer
```

Uma redução de custo que aumenta risco ou consome capacidade de engenharia pode ser negativa no
saldo. Declarar o que **não** será otimizado é parte da gestão.

## Modelo Mental

**Custo é atributo de desenho, medido por unidade econômica e atribuído a quem decide.** Sem
atribuição, ninguém age.

## Quando Usar

- Como critério em toda decisão arquitetural relevante.
- Com atribuição por time e por serviço.
- Medido por unidade econômica, não em total.

## Quando Não Usar

**Como preocupação de outra área.**

**Em total agregado**, sem atribuição.

**Sem incluir custo de pessoal.**

**Otimizando sem medir** a distribuição.

**Reduzindo indiscriminadamente**, incluindo o que compra confiabilidade.

## Alternativas

- **Orçamento por time** — cada um recebe um teto e decide dentro dele; simples e eficaz.
- **Custo como função de aptidão** — verificação automática que alerta quando o custo por unidade
  ultrapassa um limite. Ver [funções de aptidão](/23-architecture-leadership/fitness-functions.md).
- **Revisão periódica de maiores linhas** — atacar os 20% que respondem por 80%.
- **Não gerir** — legítimo enquanto o custo for irrelevante frente à receita.

A última merece nota: gerir custo tem custo próprio, e em organizações onde a conta é pequena
frente à margem, o esforço de atribuição não se paga.

## Trade-offs

| Custo como restrição de desenho | Otimizar depois |
|---|---|
| Decisão informada | Sem atrito na decisão |
| Exige estimar | Mudança cara depois |

| Atribuição detalhada | Fatura agregada |
|---|---|
| Times agem | Sem custo de implementar |
| Exige etiquetagem consistente | Ninguém age |

## Modos de Falha

**Custo invisível na decisão.** Aparece quando mudar é caro.

**Sem atribuição.** Informação no lugar errado.

**Custo de pessoal ignorado.** Comparações erradas.

**Otimização sem medição.** Esforço no lugar errado.

**Retenção infinita.** Dívida perpétua tomada sem decisão.

**Redução que aumenta risco.** Saldo negativo.

## Erros Comuns

**Não estimar custo** em propostas arquiteturais. Proposta sem ordem de grandeza do custo operacional não pode ser comparada com as alternativas nem aprovada por quem paga.

**Comparar fatura com fatura**, sem pessoas. A opção mais barata em infraestrutura costuma ser a mais cara em plantão e manutenção, e a comparação que ignora isso escolhe errado.

**Não medir unidade econômica.** O custo total sobe quando a empresa cresce. Custo por pedido ou por usuário é o que distingue crescimento de desperdício.

**Não revisitar decisões de retenção.** "Guardar tudo para sempre" é uma decisão de custo crescente tomada uma vez e nunca reexaminada.

**Tratar toda redução como ganho.** Cortar custo às custas de confiabilidade ou de velocidade de entrega transfere a despesa para outra linha, onde ela não é medida.

## Exemplo Real

Uma empresa de tecnologia com 200 engenheiros gastava R$ 44 milhões por ano em nuvem, com
crescimento de 31% ao ano contra um crescimento de receita de 18%. A diretoria pediu redução de
25%.

O diagnóstico começou pela atribuição, que não existia: a fatura chegava agregada, e ninguém sabia
quanto cada sistema consumia.

**Etiquetagem consistente** de todos os recursos, por serviço e por time, implementada em sete
semanas. O resultado foi imediato e não previsto: a etiquetagem revelou que **19% dos recursos não
pertenciam a nenhum sistema conhecido** — remanescentes de experimentos, ambientes esquecidos,
réplicas de migrações concluídas.

Esses 19% foram desligados em duas ondas, com uma semana de observação. Duas reclamações
apareceram; o resto era desperdício puro.

**Painéis por time**, com o custo do mês e a tendência, sem nenhuma meta associada. Apenas
visível.

Nos três meses seguintes, sem nenhuma diretriz, os times reduziram 16% adicionais — dimensionando
instâncias corretamente, ajustando retenção de registros, desligando ambientes de teste fora de
horário.

**Unidade econômica definida**: custo por transação processada. Ela passou a ser acompanhada
mensalmente e decomposta por componente.

A decomposição revelou a distribuição desigual esperada:

```text
armazenamento de registros de aplicação    31% do custo
transferência entre regiões                 18%
capacidade ociosa fora de pico              14%
os 47 serviços restantes                    37%
```

Os registros de aplicação com 31% foram o achado que ninguém previa: retenção de 400 dias em
armazenamento rápido, definida em 2019 por precaução e nunca revista. A revisão, feita com
segurança e compliance, estabeleceu 30 dias em rápido e 400 em frio.

```text
economia dessa única mudança    R$ 9,8 milhões/ano
esforço                         3 semanas
```

**Estimativa de custo em ADRs** passou a ser obrigatória para propostas com efeito acima de
R$ 20 mil/mês.

**Verificação automática** de custo por unidade, com alerta quando ela cresce mais de 15% em um
mês sem crescimento de volume correspondente.

Resultados após 14 meses:

```text
custo total                     de R$ 44 mi para R$ 29 mi (-34%)
custo por transação             -47%
volume de transações            +22%
recursos sem dono               0
propostas arquiteturais com
  estimativa de custo           100% acima do limite
```

O detalhe que a equipe destaca: a intervenção de maior retorno não foi nenhuma otimização técnica —
foi tornar o custo visível por time. Os 16% que os times reduziram sozinhos, sem meta e sem
diretriz, foram obtidos apenas por mostrar o número a quem podia agir sobre ele.

E a linha dos registros de aplicação é o exemplo do padrão que se repete: uma decisão de retenção
tomada uma vez, por precaução, custando quase R$ 10 milhões por ano cinco anos depois, sem que
ninguém a tivesse revisitado.

## Conceitos Relacionados

- [Gestão de Risco](/23-architecture-leadership/risk-management.md).
- [Custo vs. Confiabilidade](/20-trade-offs/cost-vs-reliability.md).
- [Gerenciado vs. Autogerido](/20-trade-offs/managed-vs-self-hosted.md).
- [Arquitetura de Custo](/09-cloud-architecture/cost-architecture.md).

## Exercício Prático

Descubra quanto o seu sistema custa por mês e divida pelo número de transações que ele processa.

Depois pergunte quantas pessoas na organização conhecem esse número. A resposta costuma explicar
por que ele nunca melhora.

## Perguntas de Entrevista

- Por que unidade econômica informa mais que custo total?
- Por que atribuir custo por time reduz custo sem nenhuma diretriz?
- Por que decisões de retenção são a linha que mais cresce silenciosamente?

## Para Aprofundar

- Storment, J.R.; Fuller, Mike. *Cloud FinOps*. 2ª ed. O'Reilly, 2023.
- Hohpe, Gregor. *Cloud Strategy*. Architect Elevator, 2020.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
