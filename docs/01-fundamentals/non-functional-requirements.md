---
id: non-functional-requirements
title: Requisitos Não-Funcionais
sidebar_position: 8
description: Quão bem o sistema faz o que faz — e por que sem número não são requisitos.
doc_type: foundation
level: 1
difficulty: iniciante
status: complete
objective: >
  Ao terminar, o leitor converte desejos vagos em requisitos verificáveis com
  número, janela e consequência declarados.
prerequisites: [functional-requirements]
related: [quality-attributes, constraints]
canonical_for: [requisitos não-funcionais, non-functional requirements]
content_version: 1
last_reviewed: 2026-08-26
---

# Requisitos Não-Funcionais

## Visão Geral

Requisitos não-funcionais descrevem **quão bem** o sistema faz o que faz: com que
rapidez, com que confiabilidade, sob que volume, com que segurança, a que custo.

São eles que decidem a arquitetura. E são os que quase sempre chegam sem número.

## O Problema

"O sistema precisa ser rápido e confiável" aparece em praticamente todo
documento de requisitos. A frase não é um requisito — é um desejo, e um que
ninguém contestaria.

Um requisito precisa poder ser verificado. "Rápido" não pode: não há teste que o
confirme nem que o refute. Isso significa que ele não restringe nenhuma decisão
arquitetural, o que por sua vez significa que ele não faz o trabalho que
requisitos não-funcionais existem para fazer.

Sem número, três coisas quebram: não há critério para escolher entre
alternativas, não há como saber se o sistema está adequado, e não há base para
negociar quando o custo aparecer.

A conversão de desejo em número é a parte mais valiosa e a mais frequentemente
pulada do levantamento.

## Conceitos Centrais

### Um requisito não-funcional tem três partes

Falta qualquer uma e ele volta a ser desejo.

**Métrica** — o que é medido, sem ambiguidade.
**Número e janela** — o valor e o período em que vale.
**Consequência** — o que acontece se não for atendido.

```text
desejo:     "As buscas precisam ser rápidas."

requisito:  95% das buscas respondem em menos de 300 ms,
            medido no percentil da última hora,
            durante o horário comercial.
            Acima disso, a taxa de abandono do carrinho sobe.
```

A terceira parte é a que costuma faltar e a que mais importa. Sem consequência
declarada, o número é arbitrário — e um número arbitrário não sobrevive à
primeira conversa sobre custo.

### Sempre percentil, nunca média

Latência relatada como média esconde exatamente o que os usuários percebem.

Um sistema com média de 200 ms pode ter 5% das requisições acima de 3 segundos.
Esses 5% são reais, são de usuários reais, e a média nunca vai revelá-los. Em
sistemas com muitas chamadas por operação, a cauda vira o caso comum: uma página
que faz vinte chamadas independentes tem alta probabilidade de encontrar ao menos
uma do percentil 95.

Requisito de latência sem percentil declarado é requisito mal formado.

### O custo cresce de forma não linear

Cada nove adicional de disponibilidade custa desproporcionalmente mais.

| Disponibilidade | Indisponibilidade/ano | O que costuma exigir |
|---|---|---|
| 99% | ~3,6 dias | Instância única, retorno manual |
| 99,9% | ~8,8 horas | Redundância, retorno automatizado |
| 99,99% | ~53 minutos | Multi-zona, sem janela de manutenção |
| 99,999% | ~5 minutos | Multi-região ativo-ativo, operação dedicada |

Essa tabela é o instrumento mais útil de uma conversa de requisitos. Perguntar
"você quer 99,9% ou 99,99%?" sem ela produz sempre a resposta maior. Com ela,
produz uma decisão informada — e frequentemente a resposta vira "99,9% está
bom".

### Nem todo atributo se aplica igualmente

Um sistema não maximiza todos os atributos. Otimizar consistência custa
latência; otimizar custo custa redundância. Requisitos não-funcionais precisam
ser priorizados, e a priorização é decisão de negócio informada por engenharia.

Um documento que lista dez atributos como "alta prioridade" não priorizou nada.

## Modelo Mental

**Se você não consegue escrever o teste que verifica, não é requisito.**

O teste não precisa ser automatizado — pode ser uma consulta a um painel, uma
medição mensal. Precisa ser possível olhar para o sistema e dizer, sem
discussão, se atende ou não.

## Por Que Isso Importa

**Porque são eles que escolhem a arquitetura.** Requisitos funcionais dizem o que
construir; os não-funcionais dizem como. A diferença entre a mesma
funcionalidade a 100 e a 100.000 requisições por segundo é a arquitetura inteira.

**Porque sem número não há negociação.** Quando o custo de 99,99% aparece, a
conversa só é possível se houver um número na mesa e uma consequência associada.
Com "precisa ser confiável", a conversa vira opinião contra orçamento.

**Porque tornam a adequação verificável.** Um sistema pode ser declarado
adequado ou inadequado contra requisitos com número. Contra desejos, só se pode
ter impressões.

## Erros Comuns

**Aceitar adjetivos.** "Rápido", "escalável", "seguro", "confiável". Cada um
precisa virar métrica, número, janela e consequência antes de entrar no
documento.

**Pedir o máximo por precaução.** Stakeholders pedem 99,99% porque não custa
pedir. Custa — só que o custo aparece na engenharia. Apresentar a tabela de custo
antes da pergunta muda a resposta na maioria dos casos.

**Usar média em vez de percentil.** Ver acima. É o erro técnico mais comum da
área.

**Esquecer a janela.** "99,9% de disponibilidade" sem período é ambíguo: por
mês permite 43 minutos; por ano, 8,8 horas. A diferença é arquitetural.

**Tratar custo como não sendo requisito.** Custo operacional é atributo de
qualidade como qualquer outro, e frequentemente o mais restritivo. Uma
arquitetura que atende a todos os demais e não cabe no orçamento não atende aos
requisitos.

**Definir requisitos que ninguém mede.** Um requisito sem instrumentação
correspondente é uma intenção. Se o sistema não emite o dado que verificaria o
requisito, ninguém saberá quando ele for violado.

## Exemplo Real

Levantamento inicial de um sistema de emissão de notas fiscais:

> "Precisa ser altamente disponível e processar as notas rapidamente."

Conversão por perguntas de consequência:

*O que acontece se ficar fora por uma hora em horário comercial?* — As lojas não
conseguem faturar. Perda estimada de R$ 40 mil por hora.

*E fora do horário comercial?* — Nada.

*Quanto tempo a emissão pode levar?* — O cliente espera no caixa. Acima de
5 segundos, a fila trava.

*E se a Receita estiver fora?* — Emite-se em contingência e transmite depois.
Isso é permitido por até 24 horas.

Requisitos resultantes:

- 99,9% de disponibilidade **das 8h às 20h em dias úteis**. Fora dessa janela,
  99% basta.
- 99% das emissões abaixo de 5 s, percentil da última hora.
- Modo de contingência ativado automaticamente quando a Receita não responder,
  com transmissão em até 24 h.

O terceiro requisito não estava no pedido original e é o que mais afeta a
arquitetura — exige fila durável, reconciliação e máquina de estados.

Note também que a janela restrita no primeiro requisito reduz substancialmente o
custo, sem perder nada que o negócio precisasse.

## Conceitos Relacionados

- [Atributos de Qualidade](/01-fundamentals/quality-attributes.md) — a taxonomia por trás destes
  requisitos.
- [Restrições](/01-fundamentals/constraints.md) — o que não é negociável.
- [Confiabilidade](/12-reliability/index.md) — onde SLI, SLO e SLA formalizam
  isto.

## Exercício Prático

Pegue o documento de requisitos mais recente do seu time e marque todo adjetivo
de qualidade sem número.

Para cada um, escreva as três partes: métrica, número com janela, consequência.
Onde não souber a consequência, essa é a pergunta a levar ao stakeholder.

## Perguntas de Entrevista

- Como você transforma "o sistema precisa ser rápido" em requisito?
- Por que percentil e não média?
- Como conduz a conversa quando pedem 99,99% sem saber o custo?

## Para Aprofundar

- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 —
  capítulos sobre SLO e orçamento de erro.
- Bass, Len; Clements, Paul; Kazman, Rick. *Software Architecture in Practice*.
  4ª ed., 2021 — cenários de atributo de qualidade.
