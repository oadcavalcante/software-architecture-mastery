---
id: risk-management
title: Gestão de Risco
sidebar_position: 15
description: Risco arquitetural como responsabilidade de primeira ordem — nomeado, quantificado e com dono.
doc_type: concept
level: 7
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor mantém um registro de riscos arquiteturais com probabilidade, impacto e
  dono, e sabe quando aceitar em vez de mitigar.
prerequisites: [decision-making]
related: [decision-making, cost-management, measuring-architecture-outcomes]
canonical_for: [risco arquitetural, registro de risco, apetite a risco, risco aceito formalmente]
content_version: 1
last_reviewed: 2026-08-29
---

# Gestão de Risco

## Visão Geral

Risco arquitetural é a probabilidade de a arquitetura falhar em atender a algo que importa —
disponibilidade, segurança, custo, capacidade de mudar, continuidade do conhecimento.

E ele tem uma característica que o distingue do risco de projeto: **ele se materializa devagar e
de uma vez**. Um sistema com dependência de duas pessoas funciona perfeitamente até o dia em que
elas saem.

```text
risco de projeto        o prazo escorrega, visivelmente
risco arquitetural      nada acontece, até acontecer tudo
```

Por isso ele precisa ser nomeado, quantificado e revisado — porque a ausência de sintoma é o
estado normal, e ela é confundida com ausência de risco.

## Problema

O risco arquitetural típico existe e não está registrado em lugar nenhum:

```text
"só duas pessoas sabem operar aquele sistema"
"aquele componente não tem cópia de segurança testada"
"o contrato do fornecedor vence em 2027 e não temos alternativa"
"o certificado é renovado manualmente por uma pessoa"
```

Todo mundo sabe. Ninguém é responsável. Nenhuma decisão foi tomada a respeito.

E há um segundo problema: o registro de riscos que existe e não é usado. Uma planilha com 60
riscos, todos em amarelo, atualizada uma vez por ano — que cumpre uma exigência de auditoria e
não informa nenhuma decisão.

```text
risco não registrado   materializa e surpreende
risco registrado sem
  dono nem ação        materializa e não surpreende, o que
                       é pior — alguém sabia
```

## Conceitos Centrais

### Nomeie com consequência, não com categoria

```text
fraco   "risco de continuidade de negócio"
forte   "se o Marcelo e a Paula saírem, ninguém consegue alterar
        o sistema de cálculo de comissões. Estimativa de tempo
        para formar substituto: 8 a 12 meses."
```

O segundo enunciado é acionável porque tem sujeito, consequência e magnitude. Categorias
abstratas produzem registros que ninguém lê.

### Quantifique probabilidade e impacto, ainda que grosseiramente

```text
probabilidade   alta, média, baixa — com a razão da estimativa
impacto         em dinheiro, tempo ou consequência regulatória
exposição       probabilidade × impacto, para ordenar
```

Precisão não é o ponto; ordenação é. Um registro em que todos os riscos parecem igualmente
graves não permite priorizar, e não priorizar é a forma de não tratar nenhum.

```text
"probabilidade alta: os dois estão há 9 e 11 anos, e a média
 de permanência na empresa é 4.
 impacto: o sistema movimenta R$ 40 mi/mês em comissões, e
 mudanças de regra são trimestrais.
 exposição: alta — este é o risco número um do registro."
```

### Todo risco tem dono, e o dono não é a arquitetura

```text
dono do risco   quem pode agir sobre ele
dono do registro quem garante que ele seja revisado
```

Um risco cujo dono é "a área de arquitetura" geralmente não tem dono, porque a arquitetura
raramente tem os recursos para agir. O dono é quem controla a capacidade: o gestor do time, o
diretor de engenharia, o responsável pelo contrato.

O papel da arquitetura é identificar, quantificar e garantir que a decisão seja tomada — não
tomá-la.

### Quatro respostas possíveis

```text
mitigar   reduzir probabilidade ou impacto
transferir seguro, contrato, terceirização
evitar    mudar a arquitetura para que o risco não exista
aceitar   formalmente, com quem tem autoridade
```

A quarta é legítima e subutilizada. Aceitar um risco explicitamente — com data, dono e revisão —
é muito melhor que mantê-lo aberto indefinidamente numa lista de "a tratar".

```text
"aceitamos o risco de indisponibilidade regional até 2028.
 Aceito por: diretoria de engenharia. Revisão: anual.
 Gatilho de reavaliação: se a receita do canal digital passar
 de R$ 1 bi/ano."
```

### Apetite a risco precisa ser declarado

Sem ele, cada decisão de risco é negociada do zero.

```text
"aceitamos até 4 horas de indisponibilidade anual em sistemas
 de suporte; zero em sistemas de pagamento"
"aceitamos dependência de fornecedor único onde o custo de
 saída for menor que seis meses"
"não aceitamos nenhum sistema com menos de três pessoas
 capazes de alterá-lo"
```

Um apetite declarado transforma discussões recorrentes em verificações. Ver
[custo vs. confiabilidade](../20-trade-offs/cost-vs-reliability.md).

### Riscos de conhecimento são os mais subestimados

```text
número de pessoas capazes de alterar um sistema
número capazes de operá-lo em incidente
tempo de formação de um substituto
idade média da equipe que o mantém
```

Esses números raramente são medidos, e são a origem de uma classe de crise que não tem solução
rápida: quando o risco se materializa, não há como comprar a competência de volta.

Ver o [case de modernização](../21-case-studies/legacy-modernization-case.md), em que o risco de
conhecimento — nove pessoas, seis se aposentando — foi o que motivou um projeto de sete anos.

### Revise em cadência, com o número

```text
trimestral   para os riscos de exposição alta
anual        para o registro completo
por evento   quando algo muda materialmente
```

A revisão precisa reavaliar a probabilidade e o impacto, não apenas confirmar que o risco existe.
Um risco cuja probabilidade caiu deve ser rebaixado ou fechado — e um registro que só cresce
perde utilidade.

## Modelo Mental

**Nomeado com consequência, quantificado, com dono que pode agir.** E aceitar formalmente é uma
resposta legítima, melhor que deixar aberto.

## Quando Usar

- Para riscos arquiteturais de exposição relevante.
- Com revisão trimestral dos altos e anual do conjunto.
- Com apetite a risco declarado, para evitar renegociação constante.

## Quando Não Usar

**Como categoria abstrata.**

**Sem dono que possa agir.**

**Sem quantificação**, ainda que grosseira.

**Como planilha de conformidade** que ninguém lê.

**Sem a opção de aceitar formalmente.**

**Registrando tudo** — um registro com 60 riscos não prioriza nada.

## Alternativas

- **Modelagem de ameaças** — para riscos de segurança, com método próprio. Ver
  [modelagem de ameaças](../10-security/threat-modeling.md).
- **Análise pré-mortem** — imaginar que o projeto falhou e listar as causas; barata e eficaz para
  descobrir riscos que a análise formal não encontra.
- **Orçamento de erro** — para risco de disponibilidade, mais operacional e mais acionável. Ver
  [confiabilidade](../12-reliability/reliability-basics.md).
- **Exercícios de falha** — descobrir riscos executando, não listando.

A segunda é subestimada: uma pré-mortem de uma hora com o time costuma produzir mais riscos reais
que um trimestre de registro formal.

## Trade-offs

| Registro extenso | Poucos riscos |
|---|---|
| Cobertura | Priorização real |
| Nada é tratado | Lacunas |

| Mitigar | Aceitar formalmente |
|---|---|
| Reduz exposição | Custo zero, decisão explícita |
| Consome capacidade | O risco permanece |

## Modos de Falha

**Risco conhecido e não registrado.** Materializa, e alguém sabia.

**Registro sem dono.** Ninguém age.

**Tudo em amarelo.** Nenhuma priorização possível.

**Sem quantificação.** Impossível ordenar.

**Aceito por omissão.** Sem decisão, sem revisão.

**Riscos de conhecimento ignorados.** Não têm solução rápida quando ocorrem.

## Erros Comuns

**Nomear categorias** em vez de consequências.

**Atribuir o risco à arquitetura**, que não pode agir.

**Não medir** quantas pessoas sabem operar cada sistema.

**Não declarar apetite**, renegociando cada caso.

**Registro que só cresce**, sem fechamento de riscos superados.

## Exemplo Real

Uma empresa de energia com 90 engenheiros mantinha um registro de riscos de TI com 74 itens,
atualizado anualmente para uma auditoria. Nenhum tinha número, e 68 estavam classificados como
médio.

Um incidente forçou a revisão: o sistema de faturamento ficou 31 horas indisponível após uma falha
de disco, porque a restauração nunca tinha sido testada e o procedimento documentado estava
desatualizado. Prejuízo estimado em R$ 4,2 milhões.

O risco constava do registro, com o texto: "risco de continuidade dos sistemas críticos". Médio.

A reformulação:

**Riscos reescritos com consequência e número.** Os 74 viraram 23 depois que os genéricos foram
eliminados ou fundidos, e cada um recebeu probabilidade justificada e impacto estimado.

**Ordenação por exposição.** Os 23 foram ordenados, e os seis primeiros concentravam cerca de 80%
da exposição total estimada.

**Dono nomeado**, sempre alguém com capacidade de agir — em 19 casos, gestores de área; em 4, a
diretoria.

**Apetite declarado**, em quatro afirmações:

```text
restauração testada trimestralmente em todo sistema crítico
mínimo de três pessoas capazes de operar cada sistema crítico
nenhuma dependência de fornecedor com custo de saída acima
  de 12 meses em sistema crítico
indisponibilidade anual aceita: 4 h em sistemas de suporte,
  30 min em faturamento e atendimento
```

**Aceitação formal** para cinco riscos, com dono, data e gatilho de revisão. Um deles: a
dependência de um fornecedor de leitura de medidores, aceita até 2029 por não haver alternativa
técnica no mercado, com revisão anual e monitoramento do mercado.

**Revisão trimestral dos seis maiores**, com a probabilidade e o impacto reavaliados.

Resultados após 18 meses:

```text
riscos no registro                        19 (23 iniciais, 7 fechados,
                                          3 novos)
riscos com dono ativo                     19
restaurações testadas                     100% dos críticos, trimestral
sistemas com menos de 3 operadores        de 11 para 2
riscos aceitos formalmente                5, todos revisados no prazo
incidentes de exposição alta              1 (contra 4 no período anterior)
```

Os dois sistemas que continuam com menos de três operadores estão registrados com plano de
formação em curso e data.

O que a diretoria registra: o item que mais mudou o comportamento foi o apetite declarado. Antes,
cada discussão sobre investimento em resiliência era negociada isoladamente; depois, ela virou
uma verificação contra um número já acordado — e as discussões passaram de negociação a
constatação.

E o exercício de reescrever os riscos com consequência e número revelou que 51 dos 74 originais
não descreviam nada verificável. Eles davam a impressão de cobertura e não informavam decisão
nenhuma.

## Conceitos Relacionados

- [Tomada de Decisão](decision-making.md).
- [Gestão de Custo](cost-management.md).
- [Custo vs. Confiabilidade](../20-trade-offs/cost-vs-reliability.md).
- [Modelagem de Ameaças](../10-security/threat-modeling.md).

## Exercício Prático

Liste os riscos arquiteturais do seu contexto que todo mundo conhece e que não estão registrados
em lugar nenhum.

Para cada um, escreva a consequência com número e o nome de quem poderia agir. Essa lista costuma
ser mais útil que qualquer registro formal existente.

## Perguntas de Entrevista

- Por que risco arquitetural se materializa de forma diferente do risco de projeto?
- Por que aceitar formalmente é melhor que deixar um risco aberto?
- Por que riscos de conhecimento não têm solução rápida?

## Para Aprofundar

- Hubbard, Douglas. *The Failure of Risk Management*. 2ª ed. Wiley, 2020.
- Taleb, Nassim. *Antifragile*. Random House, 2012.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
