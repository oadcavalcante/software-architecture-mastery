---
id: 01-recuar-ate-o-problema
title: "Exercício 01 — Recuar até o Problema"
sidebar_position: 1
description: O primeiro exercício do percurso — separar problema de solução, converter desejo em número e enumerar o que ninguém enumerou.
doc_type: exercise
level: 1
difficulty: iniciante
status: complete
objective: >
  Ao terminar, o leitor recua um pedido embrulhado em solução até o problema,
  converte atributos vagos em requisitos verificáveis e enumera alternativas com
  a condição de vitória de cada uma.
prerequisites: [problem-space]
related: [solution-space, non-functional-requirements, constraints, business-context]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-30
---

# Exercício 01 — Recuar até o Problema

## Contexto

Você entrou há três semanas numa empresa de gestão de frotas. O produto acompanha
veículos de clientes corporativos — transportadoras, distribuidoras, locadoras — e hoje
atende 340 empresas, com cerca de 28 mil veículos rastreados.

Na quinta-feira, o diretor de produto chama você e diz:

> *"Precisamos de um dashboard em tempo real de todos os veículos. E precisa ser rápido e
> confiável, porque cliente grande não tolera lentidão. Consegue estimar?"*

O time tem seis engenheiros. Existe um sistema funcionando, que recebe posição por
telemetria a cada dois minutos e grava num banco relacional. O prazo mencionado é "antes
da feira do setor", em cinco meses.

Este é o primeiro exercício do percurso, e ele não é sobre desenhar arquitetura. É sobre o
que acontece **antes** de desenhar — e é a etapa que decide se o desenho vai resolver o
problema certo.

## Requisitos

O pedido, como foi recebido, contém três coisas de naturezas diferentes, embaralhadas:

- Uma **solução** já escolhida ("um dashboard em tempo real").
- Dois **atributos de qualidade** sem número ("rápido", "confiável").
- Uma **restrição temporal** com consequência externa ("antes da feira").

Seu trabalho é desembaraçar as três e descobrir o que falta.

## Restrições

```text
time                     6 engenheiros, nenhum dedicado a dados
sistema atual            telemetria a cada 2 min, banco relacional
                         único, sem histórico além de 90 dias
clientes                 340 empresas; a maior tem 4.100 veículos,
                         a mediana tem 26
prazo mencionado         5 meses, ancorado numa feira do setor
orçamento                não foi mencionado, e ninguém perguntou
```

A última linha é a mais importante do enunciado. Um custo não mencionado não é um custo
inexistente — é um custo que ninguém verificou, e ele costuma aparecer depois da decisão.

## Sua Tarefa

Produza, em até uma hora, um documento de uma página com quatro partes:

1. **O enunciado do problema**, recuado até não mencionar nenhum mecanismo. Ele precisa
   sobreviver à troca completa da stack.

2. **Dois requisitos não-funcionais** derivados de "rápido" e "confiável", cada um com
   métrica, número, janela e consequência. Onde você não souber o número, escreva a
   pergunta que o obteria e de quem.

3. **Quatro alternativas** de solução, incluindo "não fazer nada", cada uma com a condição
   sob a qual ela vence. Uma alternativa sem condição de vitória declarada não conta.

4. **A lista de restrições**, separando as reais das preferências. Para cada uma, o que
   acontece concretamente se for violada.

Não desenhe componentes. Não escolha tecnologia. Se você terminar com um diagrama, releia
o enunciado.

## Perguntas que Você Deveria Fazer

Antes de decidir qualquer coisa:

```text
quem olha esse dashboard, e com que frequência?
que decisão a pessoa toma ao olhar? e com que atraso
  essa decisão ainda é a mesma?
o que ela faz hoje, sem o dashboard?
"tempo real" significa segundos, minutos, ou "mais fresco
  que hoje"?
o que acontece, em dinheiro, se ficar fora do ar por uma hora?
a feira é prazo de lançamento ou de demonstração?
```

A segunda e a quarta decidem quase tudo. A segunda porque converte "tempo real" num
número, e a quarta porque revela que "tempo real" talvez nunca tenha sido o requisito.

A última é a que ninguém faz, e ela pode reduzir o escopo em 80%: demonstrar numa feira e
operar em produção são problemas diferentes, com custos que diferem em ordem de grandeza.

## Critérios de Avaliação

Sua resposta está boa se:

- **O enunciado do problema não contém a palavra "dashboard".** Se contiver, você
  documentou a solução do diretor, não o problema dele. O problema provavelmente é algo
  como *"operadores não sabem quais veículos exigem ação agora"* — e alerta, não painel, é
  uma resposta possível para isso.

- **Os requisitos têm consequência, não só número.** "P95 abaixo de 400 ms" é melhor que
  "rápido" e ainda assim insuficiente: sem a consequência, o número é arbitrário e não
  sobrevive à primeira conversa sobre custo.

- **"Não fazer nada" aparece com condição de vitória honesta.** Ela existe: se a decisão
  que o operador toma é a mesma com dado de dois minutos e com dado de dois segundos, o
  sistema atual já atende e o trabalho todo é desnecessário.

- **Alguma restrição declarada foi reclassificada como preferência.** No enunciado há pelo
  menos uma. Se as suas seis restrições continuam seis restrições, você não aplicou o
  teste.

- **A frequência de telemetria aparece na sua análise.** O sistema recebe posição a cada
  dois minutos. Nenhum dashboard sobre esse dado é mais "tempo real" que dois minutos, e
  isso limita o problema antes de qualquer decisão técnica. Quem não notou isso vai propor
  WebSocket para transmitir dado velho.

Sua resposta está fraca se ela contém uma arquitetura. Não porque arquitetura seja errada,
mas porque não era o pedido — e produzir desenho antes de ter problema declarado é
exatamente o hábito que este percurso existe para desfazer.

## Discussão

:::details Abra depois de tentar

**A pergunta que muda o projeto inteiro é a quarta.** "Tempo real" quase nunca significa
tempo real. Significa "mais fresco do que está hoje", e o que está hoje frequentemente é
um relatório diário. A distância entre "dois minutos" e "dois segundos" custa uma
arquitetura inteira; a distância entre "um dia" e "dois minutos" já está resolvida.

**A frequência da telemetria é um teto.** Dado que chega a cada dois minutos não fica mais
fresco por ser transmitido mais rápido. Quem propõe WebSocket aqui está otimizando o
trecho que não é o gargalo — e o gargalo, se existir, está no dispositivo embarcado e no
plano de dados dele, que custam ordens de grandeza mais para mudar.

**A restrição que era preferência é o prazo.** "Antes da feira" parece temporal e externo,
mas a pergunta *é prazo de lançamento ou de demonstração?* costuma revelar que a feira
precisa de uma tela funcionando para três clientes, não de um sistema operando para 340.
São projetos diferentes, e o segundo pode acontecer depois.

**A distribuição dos clientes importa mais que a média.** A mediana tem 26 veículos; a
maior tem 4.100. Uma solução dimensionada pela média serve mal a ambos: é sobra para 340
clientes e falta para um. Isso sugere que a pergunta certa não é "quantos veículos
suportar", e sim "o comportamento do cliente grande é o mesmo do pequeno?" — e
frequentemente não é: quem tem 4.100 veículos não olha um mapa, olha exceções.

**O que "confiável" provavelmente significa aqui.** Não é disponibilidade do dashboard. É
que a posição mostrada não esteja errada — um veículo exibido em lugar onde não está causa
uma decisão errada, o que é pior que nenhuma informação. Isso desloca o requisito de
disponibilidade para correção e frescor declarados, o que muda a arquitetura: passa a ser
necessário exibir a idade do dado, e não apenas o dado.

**Sobre o orçamento não mencionado.** Custo operacional é atributo de qualidade como
qualquer outro, e frequentemente o mais restritivo. Seis engenheiros sem ninguém dedicado
a dados é uma restrição organizacional dura: uma solução que exija operar um sistema de
streaming não vai existir, independentemente de estar tecnicamente certa.

**O desfecho mais comum deste exercício na prática.** O recuo produz um alerta — não um
dashboard — para uma lista curta de condições que exigem ação, com o painel existente
mantido para consulta. Custa uma fração, resolve o problema declarado, e sobra tempo para
descobrir se o dashboard era necessário.

Vale notar o que o recuo **não** faz: ele não rejeita o dashboard. Se as respostas
mostrarem que operadores de fato acompanham telas continuamente e que a decisão muda com
segundos de atraso, o dashboard vence — e vence agora por comparação, com requisitos
verificáveis, em vez de por ter sido a primeira coisa dita.

:::
