---
id: constraints
title: Restrições
sidebar_position: 10
description: O que não é negociável — e por que confundir restrição com preferência é caro nos dois sentidos.
doc_type: foundation
level: 1
difficulty: iniciante
status: complete
objective: >
  Ao terminar, o leitor distingue restrição real de preferência apresentada como
  tal, e sabe testar cada uma antes de descartar opções por causa dela.
prerequisites: [quality-attributes]
related: [business-context, solution-space]
canonical_for: [restrições, constraints]
content_version: 1
last_reviewed: 2026-08-26
---

# Restrições

## Visão Geral

Restrições são condições que a arquitetura precisa respeitar e que não estão sob
o controle de quem arquiteta. Elas não são otimizadas — são obedecidas.

A habilidade que importa aqui não é lidar com restrições. É distinguir as que são
reais das que só parecem ser.

## O Problema

Restrições chegam misturadas com preferências, e as duas usam a mesma linguagem.
"Não podemos usar serviço gerenciado", "tem que ser em Java", "os dados precisam
ficar no nosso datacenter" — cada uma dessas frases pode ser uma restrição
inegociável ou uma preferência de alguém que ninguém contestou.

Os dois erros correspondentes são caros e simétricos.

**Aceitar preferência como restrição** elimina opções que estavam disponíveis. O
espaço de solução encolhe sem motivo, e a arquitetura escolhida é pior do que
poderia ser — sem que ninguém saiba, porque a alternativa foi descartada antes
de ser avaliada.

**Tratar restrição como negociável** consome credibilidade e tempo em batalhas
perdidas, e às vezes produz arquiteturas que precisam ser refeitas quando a
restrição se impõe. Um requisito de residência de dados descoberto tarde pode
invalidar meses de trabalho.

## Conceitos Centrais

### As categorias

**Regulatórias e legais.** Onde o dado pode residir, quanto tempo é retido, o
que precisa ser auditável, quem pode acessar. São as mais rígidas e as que mais
frequentemente eliminam regiões inteiras do espaço de solução.

**Contratuais.** SLAs com clientes, compromissos com parceiros, cláusulas de
integração. Rígidas até a renegociação, que existe mas tem custo e prazo.

**Organizacionais.** Quantas pessoas, com que competências, com que estrutura de
times. Uma arquitetura que exige competência inexistente na empresa é inviável
mesmo sendo tecnicamente correta.

**Econômicas.** Orçamento, natureza do gasto, horizonte de retorno.

**Técnicas herdadas.** Sistemas legados que não podem ser desligados,
integrações existentes, formatos de dado com histórico.

**Temporais.** Prazo com consequência externa — evento de mercado, obrigação
regulatória, compromisso público.

### O teste de uma restrição

Uma pergunta separa restrição de preferência:

> **O que acontece, concretamente, se violarmos isso?**

Restrição real tem resposta específica e externa: multa, quebra de contrato,
processo, impossibilidade física, projeto cancelado por falta de verba.

Preferência tem resposta vaga ou interna: "não é o nosso padrão", "a gente
prefere assim", "sempre fizemos desse jeito". Nenhuma dessas é falsa nem
irrelevante — mas todas são negociáveis, e precisam ser tratadas como tal.

### Restrições têm prazo de validade

Uma restrição registrada há três anos pode não valer mais. A regulação mudou, o
contrato foi renegociado, o time cresceu, o sistema legado foi desligado.

Arquiteturas frequentemente carregam restrições fantasmas: limitações que
moldaram decisões e que já não existem, mas que ninguém reexaminou porque estão
na categoria de "não negociável".

### Restrições podem ser boas

Restrição reduz o espaço de solução, o que soa ruim e frequentemente não é. Um
espaço menor é mais fácil de percorrer inteiro, e uma restrição forte às vezes
elimina exatamente as opções que teriam sido tentadoras e erradas.

"Não podemos manter mais um banco de dados" é uma restrição que evita muita
complexidade acidental.

## Modelo Mental

**Restrição é o que você contorna. Requisito é o que você atende. Preferência é
o que você negocia.**

Classificar cada item de entrada numa dessas três categorias, explicitamente, é
trabalho de meia hora que muda o resultado do projeto.

## Por Que Isso Importa

**Porque restrições eliminam opções antes de qualquer análise.** Percorrer o
espaço de solução sem tê-las mapeadas produz avaliação cuidadosa de alternativas
que nunca foram viáveis.

**Porque o custo de descobrir tarde é assimétrico.** Uma restrição regulatória
descoberta no terceiro mês custa o terceiro mês. Descoberta na véspera do
lançamento, custa o projeto.

**Porque preferências disfarçadas empobrecem a arquitetura silenciosamente.**
Ninguém percebe a opção que não foi considerada. O sistema entregue funciona, e
o custo extra fica invisível.

## Erros Comuns

**Não perguntar "o que acontece se violarmos?".** É a pergunta de menor custo e
maior retorno de todo o levantamento, e quase nunca é feita.

**Aceitar restrição sem dono.** Toda restrição real tem alguém que responde por
ela — jurídico, compliance, financeiro, o cliente. Restrição cujo dono ninguém
sabe identificar merece verificação.

**Tratar restrição organizacional como menos real que técnica.** "Não temos
ninguém que saiba operar isso" é tão restritivo quanto um limite de
infraestrutura, e mais frequentemente ignorado por ser desconfortável.

**Nunca reexaminar.** Restrições registradas viram permanentes por inércia.
Revisá-las periodicamente é barato e às vezes libera opções valiosas.

**Confundir restrição com atributo de qualidade.** "O sistema precisa aguentar
10 mil requisições por segundo" é atributo de qualidade — negociável contra
custo. "O dado não pode sair do país" é restrição — não há negociação com o
volume.

## Exemplo Real

Um time projeta uma plataforma de dados e recebe como restrição: *"Tudo precisa
ficar on-premise."*

Aceita como está, a restrição elimina serviços gerenciados de armazenamento,
processamento e análise, e a arquitetura resultante exige três pessoas dedicadas
à operação — que o time não tem.

O teste aplicado: *o que acontece se violarmos?*

A resposta veio em três camadas. Primeira: "é política da empresa". Segunda,
perguntando ao dono da política: "porque dados de clientes não podem ir para
fora". Terceira, perguntando ao jurídico: a exigência real é que dados
**pessoais identificáveis** de clientes residam em território nacional, com
contrato de processamento adequado — e há provedores de nuvem que atendem
integralmente a isso em região local.

A restrição real era mais estreita que a declarada, e não era "on-premise".

A arquitetura final usa serviços gerenciados em região nacional para o volume
principal, com um subconjunto de dados sensíveis isolado sob controle mais
rígido. O time de operação continua com as pessoas que tinha.

O que interessa aqui não é que a restrição era falsa — ela era real, só que
diferente. Aceitar a formulação de segunda mão teria custado uma arquitetura
inteira.

## Conceitos Relacionados

- [Contexto de Negócio](business-context.md) — de onde as restrições vêm.
- [Espaço da Solução](solution-space.md) — o que elas reduzem.
- [Atributos de Qualidade](quality-attributes.md) — o que é negociável, em
  contraste.

## Exercício Prático

Liste tudo o que seu time trata como não negociável no sistema atual.

Para cada item, responda por escrito: o que acontece concretamente se violarmos?
Quem é o dono desta restrição? Quando ela foi estabelecida?

Os itens sem resposta específica para a primeira pergunta são preferências. Os
com dono desconhecido merecem verificação. Os antigos merecem reexame.

## Perguntas de Entrevista

- Como você distingue uma restrição real de uma preferência?
- Já descobriu que uma restrição não era real? O que mudou?
- Como lida com restrição organizacional que inviabiliza a melhor solução técnica?

## Para Aprofundar

- Ford, Neal; Richards, Mark. *Fundamentals of Software Architecture*. O'Reilly,
  2020 — restrições como driver arquitetural.
- Ford, Neal; Parsons, Rebecca; Kua, Patrick. *Building Evolutionary
  Architectures*. O'Reilly, 2017 — restrições que mudam com o tempo.
