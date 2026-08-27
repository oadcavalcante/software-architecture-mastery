---
id: maturity-model
title: Modelo de Maturidade
sidebar_position: 3
description: Os seis estágios de capacidade arquitetural, definidos por decisão tomada e não por conhecimento declarado.
doc_type: reference
level: 0
difficulty: iniciante
status: complete
objective: >
  Ao terminar, o leitor identifica seu estágio atual pela decisão que já toma
  sozinho e sabe qual capacidade falta para o próximo.
prerequisites: []
related: [architecture-leadership]
canonical_for: [maturidade arquitetural, modelo de maturidade]
content_version: 1
last_reviewed: 2026-08-26
---

# Modelo de Maturidade

Seis estágios de capacidade arquitetural. Cada um é definido pelo que a pessoa
**decide sozinha**, não pelo que ela sabe explicar.

A distinção importa. Conhecimento declarado e capacidade divergem muito nesta
profissão: é comum alguém explicar bem consistência eventual e nunca ter
decidido, sob pressão, se um caso concreto a tolera.

## Dois eixos diferentes

Este modelo mede **capacidade**. Os sete níveis do percurso organizam
**conteúdo**. Não são a mesma coisa e não avançam juntos.

Ler o Nível 04 não coloca ninguém no estágio 4. Conteúdo é insumo; capacidade
vem de decidir, errar, registrar o porquê e revisar. O percurso encurta o
caminho — não o substitui.

Na prática, alguém no estágio 3 costuma se beneficiar mais de reler o Nível 02
aplicando ao próprio sistema do que de avançar para o Nível 05.

## Os estágios

### Estágio 1 — Orientado a Código

**Decide:** como implementar dentro de um módulo já definido.
**Horizonte:** a tarefa atual.
**Negocia com:** ninguém — recebe o recorte pronto.

Escreve código correto e legível. Aplica padrões quando reconhece o problema.
Não decide onde as fronteiras ficam.

**Sinal de transição:** começa a perceber que a dificuldade da tarefa vem de uma
decisão estrutural anterior, e consegue nomeá-la.

### Estágio 2 — Orientado a Design

**Decide:** estrutura de módulos, interfaces e direção de dependência.
**Horizonte:** a feature, algumas semanas.
**Negocia com:** o próprio time.

Desenha fronteiras dentro de um sistema. Justifica por que uma dependência
aponta para um lado. Reconhece estrutura degradando antes que o custo apareça
no roadmap.

**Sinal de transição:** começa a esbarrar em limites que não são de código —
o banco, a fila, o processo de implantação.

### Estágio 3 — Orientado a Sistemas

**Decide:** componentes, contratos, armazenamento e topologia de um sistema.
**Horizonte:** o sistema, alguns trimestres.
**Negocia com:** produto e times vizinhos.

Vai de requisitos a arquitetura de alto nível com estimativa de capacidade.
Identifica gargalo antes de o sistema existir. Escolhe entre síncrono e
assíncrono com argumento.

**Sinal de transição:** começa a tomar decisões cujo custo aparece em outros
times, e percebe que o argumento técnico sozinho não basta.

### Estágio 4 — Orientado a Arquitetura

**Decide:** trade-offs entre atributos de qualidade, sob restrição de custo e prazo.
**Horizonte:** o sistema e sua evolução, um a dois anos.
**Negocia com:** liderança técnica e stakeholders de negócio.

Deriva arquitetura de números declarados — SLO, RTO, orçamento — em vez de
preferência. Registra decisões com o contexto que permite revê-las. Sabe dizer
não a complexidade que não se paga, inclusive à que ele mesmo propôs antes.

**Sinal de transição:** passa a enxergar duplicação e incoerência **entre**
sistemas, não dentro de um.

### Estágio 5 — Orientado ao Corporativo

**Decide:** portfólio, capacidades, padrões e caminho entre estado atual e alvo.
**Horizonte:** o conjunto de sistemas, dois a cinco anos.
**Negocia com:** quem controla orçamento e prioridade.

Lê um cenário de aplicações e identifica capacidade duplicada. Constrói
arquitetura de transição em etapas que entregam valor isoladamente. Estabelece
padrões com caminho de exceção.

**Sinal de transição:** percebe que a restrição dominante deixou de ser técnica
e passou a ser organizacional.

### Estágio 6 — Orientado a Estratégia

**Decide:** direção técnica, estrutura de times e onde a organização investe capacidade.
**Horizonte:** a organização, anos.
**Negocia com:** a direção da empresa.

Trata a lei de Conway como instrumento, não como observação: propõe mudança
organizacional para viabilizar arquitetura. Mede resultado arquitetural em vez de
argumentar por ele. Sustenta coerência sem centralizar decisão.

## Como usar isto

Localize-se pela pergunta: **qual foi a decisão mais consequente que você tomou
sozinho nos últimos seis meses, e de que tipo ela era?**

A resposta costuma ser um estágio abaixo do que a autoavaliação sugere, porque
tendemos a nos medir pelo que entendemos e não pelo que decidimos.

Duas advertências. Não há mérito em estar no estágio 6 — há adequação ao papel;
uma empresa de trinta pessoas raramente precisa dele. E os estágios não são
exclusivos: alguém no estágio 5 continua tomando decisões de estágio 2, e
continua precisando fazê-las bem.
