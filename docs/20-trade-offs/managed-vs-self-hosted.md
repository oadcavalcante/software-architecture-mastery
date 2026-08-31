---
id: managed-vs-self-hosted
title: Gerenciado vs. Autogerido
sidebar_position: 13
description: A conta muda quando o custo de plantão entra — e ele quase nunca entra.
doc_type: tradeoff
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor compara serviço gerenciado e operação própria com o custo de
  esforço operacional incluído, e sabe quando a diferença de preço se justifica.
prerequisites: [managed-services]
related: [build-vs-buy, cost-vs-reliability, cloud-native-vs-portable]
canonical_for: [gerenciado contra autogerido, esforço operacional, prêmio de gestão, competência operacional]
content_version: 1
last_reviewed: 2026-08-29
---

# Gerenciado vs. Autogerido

## Visão Geral

O par é a versão de infraestrutura de [construir vs. comprar](/20-trade-offs/build-vs-buy.md), e tem o
mesmo viés: o custo do trabalho próprio é sistematicamente omitido da comparação.

```text
eixo real   o prêmio cobrado pelo serviço gerenciado é maior ou menor
            que o custo real de operar aquilo com a nossa equipe?
```

O prêmio é visível — está na fatura. O custo de operar não é: ele está distribuído em
plantão, atualizações, incidentes, aprendizado e atenção desviada.

Um número de referência útil: serviços gerenciados costumam cobrar entre 2× e 4× o custo de
infraestrutura equivalente. A pergunta é se o esforço operacional evitado vale essa
diferença — e, para equipes pequenas, quase sempre vale.

## Problema

A comparação típica compara metades diferentes:

```text
gerenciado    R$ 4 200/mês, na fatura
autogerido    R$ 1 100/mês de máquinas
```

O que falta do lado direito:

```text
configuração inicial e ajuste fino
atualizações de versão e de segurança
cópia de segurança, e o teste de restauração
monitoração, alarme e painel
plantão, incluindo noites e fins de semana
resposta a incidente, com o tempo que ela consome no dia seguinte
aprendizado, e o custo de reaprender quando quem sabia sai
```

Convertido em esforço, isso costuma ficar entre 0,2 e 1 pessoa em tempo integral, dependendo
do componente — o que a preços de mercado supera o prêmio na maioria dos casos.

O erro simétrico é adotar gerenciado sem avaliar limites: cotas, ausência de configurações
necessárias, custo que cresce de forma não linear com o volume, e dificuldade de saída.

## Conceitos Centrais

### Esforço operacional, medido

A conta honesta precisa do número, não da impressão:

```text
horas por mês em manutenção de rotina
horas por incidente × frequência
horas em atualizações por ano
custo do plantão atribuível
tempo de aprendizado inicial, amortizado
```

Times que fazem essa medição pela primeira vez costumam se surpreender: componentes que
"não dão trabalho" consomem de 10 a 30 horas por mês quando o tempo é contabilizado.

Ver [custo vs. confiabilidade](/20-trade-offs/cost-vs-reliability.md).

### O prêmio compra confiabilidade que você não construiria

Serviços gerenciados maduros entregam, por padrão, coisas que uma equipe pequena não
constrói:

```text
recuperação automática de nó
cópia de segurança contínua com restauração pontual
atualização sem interrupção
replicação multizona configurada corretamente
monitoração e alarme prontos
equipe especializada 24×7 por trás
```

Reproduzir isso internamente é um projeto, não uma configuração. Comparar o preço sem
comparar o que é entregue distorce a decisão.

### Quando autogerir vence

```text
escala grande o suficiente para o prêmio superar uma equipe dedicada
requisito que o gerenciado não atende — versão, extensão, configuração
restrição regulatória sobre localização ou controle
a competência já existe e é usada para vários componentes
o componente é central ao produto e o controle é estratégico
```

O primeiro caso é real e tem limiar: acima de certo volume, o prêmio de 2× a 4× paga vários
engenheiros. Mas o limiar é mais alto do que a intuição sugere, e a maior parte das
organizações nunca chega lá.

### O custo de saída difere

```text
gerenciado proprietário   interfaces próprias; sair exige reescrever
gerenciado compatível     protocolo aberto; sair é migração de dados
autogerido                sem custo de saída, com custo permanente de operação
```

A distinção do meio é importante e frequentemente ignorada: um serviço gerenciado que fala
um protocolo padrão tem custo de saída muito menor que um com interface própria — mesmo
sendo do mesmo fornecedor.

Ver [aprisionamento](/09-cloud-architecture/vendor-lock-in.md) e
[nativo vs. portável](/20-trade-offs/cloud-native-vs-portable.md).

### Carga cognitiva é um recurso finito

```text
cada componente autogerido consome atenção da equipe
essa atenção não está disponível para o produto
o efeito é invisível e cumulativo
```

Uma equipe de 8 pessoas operando cinco componentes de infraestrutura tem uma fração
significativa da sua capacidade fora do produto — e é uma fração que ninguém orça.

Ver [engenharia de plataforma](/14-devops-and-platform/platform-engineering.md).

### Sinais de escolha errada

```text
autogeriu e não devia
  incidentes recorrentes com o componente
  atualizações adiadas por medo
  restauração nunca testada
  conhecimento em uma pessoa só
  plantão desgastado por algo que não é o produto
  custo de pessoal atribuível maior que o prêmio

gerenciou e não devia
  fatura crescendo mais rápido que o uso
  cotas ou limites bloqueando o produto
  configuração necessária indisponível
  custo por unidade muito acima do de operar, em escala alta
  dependência crítica sem plano de saída
```

O sinal "restauração nunca testada" é o mais grave do primeiro grupo: ele indica que a cópia
de segurança é uma suposição.

### Custo de mudar de ideia

```text
gerenciado → autogerido   moderado: os requisitos são conhecidos,
                          e a migração é de dados
autogerido → gerenciado   moderado e frequentemente mais fácil
```

A simetria aqui é maior que em outros pares, o que reduz o peso da reversibilidade na
decisão — **exceto** quando o serviço gerenciado é proprietário, caso em que a saída exige
reescrita e a assimetria volta.

Isso dá uma regra prática: prefira gerenciados com protocolo padrão quando existirem, e o
custo de mudar de ideia deixa de ser um fator relevante.

## Modelo Mental

**Some o esforço operacional em dinheiro.** O prêmio na fatura é visível; o custo de operar
é distribuído — e maior do que parece.

## Quando Usar

Prefira **gerenciado** quando:

- A equipe é pequena ou não tem a competência.
- O componente não é diferencial do produto.
- O esforço operacional medido supera o prêmio.
- A confiabilidade entregue é maior que a que você construiria.
- O protocolo é padrão, reduzindo o custo de saída.

Prefira **autogerido** quando:

- A escala torna o prêmio maior que uma equipe dedicada.
- Há requisito técnico ou regulatório que o gerenciado não atende.
- A competência já existe e é usada para vários componentes.
- O componente é central e o controle é estratégico.

## Quando Não Usar

**Comparando fatura com preço de máquinas.**

**Sem medir o esforço operacional.**

**Autogerindo sem testar restauração.**

**Adotando gerenciado proprietário** para dependência crítica, sem plano de saída.

**Sem verificar cotas e limites** antes de comprometer o produto.

## Alternativas

- **Gerenciado com protocolo padrão** — reduz o custo de saída quase a zero.
- **Autogerido sobre plataforma interna** — se a plataforma existe, o custo marginal do
  próximo componente é menor.
- **Híbrido** — gerenciado em produção, autogerido em ambientes de desenvolvimento.
- **Gerenciado por terceiro independente** — nem o provedor de nuvem, nem você.

A terceira reduz custo de forma significativa sem afetar a confiabilidade onde ela importa.

## Trade-offs

| Gerenciado | Autogerido |
|---|---|
| Sem esforço operacional | Sem prêmio |
| Confiabilidade pronta | Controle total |
| Limites do fornecedor | Sem limites |
| Custo previsível e crescente | Custo de pessoal |
| Possível aprisionamento | Portável |

| Protocolo padrão | Proprietário |
|---|---|
| Saída barata | Integração mais profunda |
| Menos recursos exclusivos | Mais capacidade |
| Reversível | Reescrita para sair |

## Modos de Falha

**Esforço operacional omitido.** A comparação favorece autogerir por construção.

**Restauração não testada.** A cópia de segurança é hipótese.

**Conhecimento em uma pessoa.** Sai, e o componente fica órfão.

**Cotas descobertas tarde.** O produto trava.

**Custo gerenciado não linear.** Cresce mais rápido que o uso.

**Gerenciado proprietário crítico.** Sem plano de saída.

## Erros Comuns

**Não medir horas gastas** com o componente.

**Comparar preços sem comparar o que é entregue.**

**Ignorar carga cognitiva** como custo.

**Não verificar se existe versão com protocolo padrão.**

**Não reavaliar quando a escala muda** — o limiar existe nos dois sentidos.

## Exemplo Real

Uma empresa de logística com 26 engenheiros operava internamente cinco componentes de
infraestrutura: banco relacional, cache, mensageria, mecanismo de busca e agrupamento de
contêineres.

A decisão original, de 2020, tinha sido tomada por custo: os serviços gerenciados
equivalentes custariam cerca de 3,1× o preço das máquinas.

Uma medição de esforço operacional, feita em 2024 durante três meses com registro de horas:

```text
componente        horas/mês   incidentes/ano   plantão noturno/ano
banco relacional        22           6                    9
mensageria              31          11                   14
busca                   18           4                    5
cache                    6           2                    2
contêineres             44           9                   12
                     ——————        ————                 ————
total                  121          32                   42
```

121 horas por mês equivalem a cerca de 0,75 engenheiro em tempo integral, permanente. Somado
ao custo de plantão e ao tempo de recuperação pós-incidente, a estimativa ficou em ~1,1
pessoa.

E a comparação refeita:

```text
custo de máquinas                       ~R$ 38 mil/mês
custo de pessoal atribuível             ~R$ 52 mil/mês
custo total autogerido                  ~R$ 90 mil/mês
custo dos gerenciados equivalentes      ~R$ 118 mil/mês
```

O gerenciado ainda era mais caro — mas por 1,3×, e não por 3,1×. E a conta não incluía o
custo dos incidentes nem a atenção desviada.

A decisão foi seletiva, não uniforme:

**Migrados para gerenciado**: mensageria e agrupamento de contêineres — os dois com maior
esforço operacional e nenhum requisito que o gerenciado não atendesse. Ambos com protocolo
padrão, o que manteve o custo de saída baixo.

**Mantidos autogeridos**: banco relacional e busca. O banco por escala — o volume tornava o
prêmio alto o suficiente para justificar as 22 horas —, e a busca por uma extensão
específica de idioma que os gerenciados disponíveis não ofereciam. Ambas as decisões
registradas em ADR com condição de reversão.

**Cache migrado** por ser barato dos dois lados e não valer a atenção.

**Restauração testada trimestralmente** nos dois componentes que ficaram, com procedimento
executado por alguém que não é o especialista — o que revelou, na primeira execução, que o
procedimento documentado estava desatualizado.

Resultados após 14 meses:

```text
horas/mês em operação de infraestrutura      121 → 34
incidentes/ano                               32 → 11
plantão noturno/ano                          42 → 13
custo total (máquinas + gerenciados + pessoal) +6%
rotatividade na equipe de plataforma          de 3 saídas/ano para 0
```

O custo total subiu 6%, e a decisão foi considerada acertada mesmo assim: 87 horas por mês
voltaram para o produto, e a redução de plantão noturno foi apontada pela equipe como a
mudança de maior efeito na qualidade de trabalho.

O ponto que a equipe sublinha: a comparação de 2020 não estava errada nos números que usou. Ela
estava incompleta — comparava fatura com fatura, e o trabalho de operar não aparece em
nenhuma das duas.

## Conceitos Relacionados

- [Serviços Gerenciados](/09-cloud-architecture/managed-services.md).
- [Build vs. Buy](/20-trade-offs/build-vs-buy.md) — o mesmo eixo, aplicado a software.
- [Nativo vs. Portável](/20-trade-offs/cloud-native-vs-portable.md).
- [Engenharia de Plataforma](/14-devops-and-platform/platform-engineering.md).

## Exercício Prático

Registre, por um mês, as horas que sua equipe gasta operando um componente de infraestrutura
— manutenção, incidentes, atualizações, plantão.

Converta em custo e some ao preço das máquinas. Compare com o gerenciado equivalente.

## Perguntas de Entrevista

- Por que a comparação usual entre gerenciado e autogerido é incompleta?
- Por que um serviço gerenciado com protocolo padrão muda a análise de reversibilidade?
- Em que condição autogerir volta a vencer?

## Para Aprofundar

- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
- Morris, Kief. *Infrastructure as Code*. 2ª ed. O'Reilly, 2020.
