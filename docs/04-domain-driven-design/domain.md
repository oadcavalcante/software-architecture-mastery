---
id: domain
title: Domínio
sidebar_position: 1
description: A esfera de conhecimento e atividade em torno da qual o software existe.
doc_type: foundation
level: 2
difficulty: iniciante
status: complete
objective: >
  Ao terminar, o leitor distingue domínio de modelo e reconhece por que o
  vocabulário do negócio precisa chegar ao código sem tradução.
prerequisites: [domain-driven-design]
related: [subdomain, ubiquitous-language, bounded-context]
canonical_for: [domínio, domain, modelo de domínio]
content_version: 1
last_reviewed: 2026-08-26
---

# Domínio

## Visão Geral

Domínio é a esfera de conhecimento e atividade em torno da qual o software
existe. Para uma seguradora, é seguro. Para um banco, é serviço financeiro. Para
uma transportadora, é logística.

O domínio existe independentemente do software. Ele tem especialistas,
vocabulário próprio, regras que vieram de décadas de prática e restrições que
ninguém programou.

## O Problema

Software de domínio complexo falha por uma razão específica e recorrente: a
**tradução**.

O especialista descreve uma regra. O analista converte em requisito. O
desenvolvedor converte em código. A cada conversão, nuance se perde — e ninguém
percebe, porque cada etapa parece fiel à anterior.

Meses depois, o comportamento do sistema diverge do entendimento de todos. Uma
conversa típica:

> — O sistema está calculando errado a carência.
> — Não está, ele faz exatamente o que foi especificado.
> — Mas não é isso que carência significa.

Ninguém errou em nenhuma etapa. O significado se degradou ao longo da cadeia.

DDD ataca isso eliminando as conversões: o código usa os termos do domínio, com o
significado exato que eles têm no domínio.

## Conceitos Centrais

### Domínio e modelo não são a mesma coisa

**Domínio** é a realidade: o negócio, com toda a sua complexidade.

**Modelo** é uma abstração seletiva do domínio, construída para resolver um
problema específico. Ele descarta deliberadamente o que não importa para aquele
problema.

Um modelo de "cliente" para cobrança guarda dados fiscais e histórico de
pagamento. Para logística, guarda endereços e restrições de entrega. Nenhum é
mais correto — cada um serve a um problema.

Essa observação leva diretamente a
[bounded context](/04-domain-driven-design/bounded-context.md): modelos diferentes, com fronteiras
explícitas, em vez de um modelo único que serve mal a todos.

### O especialista de domínio é fonte, não cliente

A mudança de postura que DDD exige: o especialista não é alguém que "pede
funcionalidades". É a fonte do conhecimento que o modelo precisa capturar.

Isso significa conversas frequentes e diretas entre quem escreve o código e quem
entende o negócio — não requisitos intermediados. É desconfortável em
organizações estruturadas por camadas de comunicação, e é o pré-requisito de
tudo o mais.

### Complexidade essencial versus técnica

DDD é uma resposta à complexidade **do domínio**, não à técnica.

Um sistema com regras de negócio triviais e desafios técnicos enormes — um
processador de vídeo, um serviço de cache — não se beneficia de DDD. A
complexidade está em outro lugar.

Ver [complexidade](/01-fundamentals/complexity.md). Aplicar DDD onde a
complexidade não é de domínio adiciona indireção sem endereçar o problema real.

### O modelo vive no código

Um modelo que existe em documentos e diagramas, e não no código, não é um modelo
— é documentação. Quando os dois divergem, o código vence, porque é ele que
executa.

Isso significa que o modelo é refinado continuamente, em código, conforme o
entendimento do domínio melhora. Não há fase de modelagem que termina.

## Por Que Isso Importa

**Porque a tradução é onde o significado se perde.** Eliminar as conversões é o
mecanismo central de DDD, e tudo o mais — [ubiquitous
language](/04-domain-driven-design/ubiquitous-language.md), [bounded context](/04-domain-driven-design/bounded-context.md), os
blocos táticos — serve a isso.

**Porque distingue onde DDD se aplica.** Se a complexidade do sistema não é de
domínio, DDD não é a ferramenta. Reconhecer isso evita aplicar um método caro ao
problema errado.

**Porque muda quem conversa com quem.** A prática que mais determina o sucesso de
DDD não é técnica: é a frequência e a qualidade das conversas entre desenvolvedores
e especialistas. Sem isso, os padrões táticos viram convenção de nomenclatura.

## Erros Comuns

**Confundir domínio com o banco de dados.** O esquema é uma representação de um
modelo, não o domínio. Modelar a partir das tabelas inverte a ordem.

**Buscar um modelo único e completo.** Um modelo que tenta representar todo o
domínio serve mal a todos os problemas. Ver
[bounded context](/04-domain-driven-design/bounded-context.md).

**Tratar o especialista como fonte de requisitos.** Ele é fonte de conhecimento;
a diferença aparece na profundidade das conversas.

**Aplicar DDD a complexidade técnica.** O método endereça complexidade de domínio.

**Modelar uma vez e parar.** O entendimento do domínio melhora com o uso do
sistema; o modelo precisa acompanhar.

## Exemplo Real

Uma equipe construía o sistema de uma corretora de resseguros. Depois de seis
meses, o modelo tinha `Contrato`, `Cliente`, `Valor` e `Status` — vocabulário
genérico de software.

Um especialista, ao revisar uma tela, comentou que estava faltando distinguir
"cessão" de "retrocessão", e que "prêmio" na tela não era prêmio, era comissão.

Ninguém da equipe sabia que eram coisas diferentes. Os quatro termos — cessão,
retrocessão, prêmio, comissão — eram usados diariamente pelo negócio e nenhum
existia no código.

A reescrita do modelo com o vocabulário do domínio levou dois meses. O que mudou
não foi só nomenclatura: ao nomear "retrocessão", ficou evidente que ela tinha
regras que o modelo genérico não comportava, e que estavam sendo implementadas
como casos especiais espalhados.

Três defeitos abertos foram fechados pela remodelagem, sem que ninguém os tivesse
como alvo. Eram consequências do modelo não representar uma distinção que o
domínio faz.

## Conceitos Relacionados

- [Subdomínio](/04-domain-driven-design/subdomain.md) — a divisão do domínio.
- [Ubiquitous Language](/04-domain-driven-design/ubiquitous-language.md) — o mecanismo que elimina a
  tradução.
- [Bounded Context](/04-domain-driven-design/bounded-context.md) — por que não há um modelo único.
- [Espaço do Problema](/01-fundamentals/problem-space.md) — o conceito
  correspondente no Nível 01.

## Exercício Prático

Liste dez termos que os especialistas do seu negócio usam diariamente.

Verifique quantos existem no código com o mesmo nome e o mesmo significado.

Os que não existem são distinções que o domínio faz e o modelo não — e cada uma
é uma fonte provável de defeito ou de caso especial espalhado.

## Perguntas de Entrevista

- Qual a diferença entre domínio e modelo?
- Por que a tradução entre especialista e código é problemática?
- Quando DDD não é a ferramenta adequada?

## Para Aprofundar

- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003.
- Vernon, Vaughn. *Domain-Driven Design Distilled*. Addison-Wesley, 2016.
