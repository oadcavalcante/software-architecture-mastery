---
id: context-diagrams
title: Diagramas de Contexto
sidebar_position: 3
description: O sistema e o mundo em volta — o diagrama mais útil e o mais barato de manter.
doc_type: concept
level: 5
difficulty: iniciante
status: complete
objective: >
  Ao terminar, o leitor produz um diagrama de contexto que qualquer pessoa entende e que
  envelhece devagar.
prerequisites: [c4-model]
related: [c4-model, container-diagrams, diagram-quality]
canonical_for: [diagrama de contexto, fronteira do sistema, ator externo]
content_version: 1
last_reviewed: 2026-08-29
---

# Diagramas de Contexto

## Visão Geral

Um diagrama de contexto mostra **o sistema, quem o usa, e com que outros sistemas ele
conversa** — e nada mais.

É o diagrama de maior retorno da documentação de arquitetura: ele é entendido por
qualquer pessoa, responde à pergunta mais frequente, e envelhece devagar.

E é o mais frequentemente ausente, porque parece simples demais para valer o esforço.

## Problema

A pergunta que ele responde aparece constantemente:

```text
o que este sistema faz?
quem depende dele?
de que ele depende?
o que quebra se ele sair do ar?
onde ele começa e termina?
```

Sem ele, cada resposta exige alguém que conheça o sistema — e essa pessoa responde de
memória, com omissões.

E a fronteira — onde o sistema começa e termina — é uma decisão de arquitetura que
frequentemente não foi tomada explicitamente. Desenhá-la força a decisão.

## Conceitos Centrais

### O que entra

```text
o sistema         uma caixa, no centro
pessoas           os tipos de usuário, não indivíduos
sistemas externos os que conversam com ele
relações          quem chama quem, e para quê
```

E o que **não** entra:

```text
componentes internos
tecnologias
infraestrutura
detalhes de protocolo
sistemas que não conversam diretamente
```

A última exclusão importa: um sistema que conversa com um sistema que conversa com o seu
não pertence ao contexto. Incluí-lo transforma o diagrama num mapa da organização.

### Poucas caixas

```text
alvo    5 a 12 caixas
acima disso  provavelmente a fronteira está errada, ou há detalhe demais
```

Se o contexto tem 30 caixas, ou o sistema tem responsabilidades demais — o que é uma
descoberta arquitetural — ou o diagrama inclui coisas que não conversam diretamente.

Ver [arquitetura de aplicação](../15-enterprise-architecture/application-architecture.md).

### As relações precisam dizer o quê e por quê

```text
ruim   Sistema A → Sistema B
bom    Sistema A → Sistema B: "consulta limite de crédito, HTTPS"
melhor Sistema A → Sistema B: "consulta limite de crédito antes de aprovar pedido"
```

O rótulo da relação é onde está a informação. Uma seta sem rótulo diz que existe
dependência e não diz o que se perde se ela falhar.

E o rótulo em termos de **propósito** — não de mecanismo — é o que o torna compreensível
para quem não é técnico.

### A fronteira é uma decisão

Desenhar o contexto força a pergunta: **o que está dentro deste sistema?**

Frequentemente a resposta não é óbvia, e o desacordo entre pessoas do mesmo time revela
que a fronteira nunca foi decidida.

Essa é uma descoberta valiosa, e ela aparece em minutos ao desenhar. Ver
[bounded context](../04-domain-driven-design/bounded-context.md).

### Ele serve a conversas com o negócio

O contexto é o único diagrama de arquitetura que pessoas não técnicas conseguem ler
completamente.

Isso o torna a ferramenta para:

```text
explicar o que o sistema faz
discutir impacto de indisponibilidade
avaliar dependências externas
justificar investimento
```

Ver [arquitetura de negócio](../15-enterprise-architecture/business-architecture.md).

E impõe uma restrição: nenhum jargão. Um rótulo que exige explicação técnica quebra o
propósito.

### Envelhece devagar, e não para sempre

Ele muda quando: uma integração nova aparece, um sistema é desativado, ou a fronteira
muda.

Isso é raro — algumas vezes por ano na maioria dos sistemas —, o que o torna barato de
manter.

O que não é barato é mantê-lo quando ele contém detalhe que não pertence ao nível. Essa
é a razão mais comum de contextos desatualizados.

### Ele é o único diagrama que todos leem

Entre todos os artefatos deste percurso, o de contexto é o de maior alcance: pessoas de
negócio, produto, operação, segurança e engenharia conseguem lê-lo sem preparação.

Isso muda o critério de qualidade. Um diagrama de contêiner ruim atrapalha engenheiros; um
diagrama de contexto ruim desalinha a organização inteira sobre o que o sistema é.

Por isso vale investir mais tempo aqui do que a simplicidade do artefato sugere — na
escolha do nome do sistema, na redação das relações, e sobretudo na decisão do que fica
dentro da fronteira.

## Modelo Mental

**O sistema, quem o usa, e com quem ele conversa.** Nada dentro, nada indireto.

## Quando Usar

- Para todo sistema relevante — é o mínimo de documentação.
- Ao integrar pessoas novas.
- Em conversas com o negócio.
- Para avaliar impacto de indisponibilidade.
- Ao discutir fronteiras.

## Quando Não Usar

**Com componentes internos.**

**Com sistemas que não conversam diretamente.**

**Com jargão técnico** nos rótulos.

**Com setas sem rótulo.**

**Com mais de uma dúzia de caixas** — revise a fronteira.

## Alternativas

- **Diagrama de contêiner** — quando a pergunta é sobre o interior. Ver
  [diagramas de contêiner](container-diagrams.md).
- **Mapa de dependências derivado** — automático, sem a lente de propósito.
- **Descrição textual** — para sistemas com poucas integrações, um parágrafo basta.

## Trade-offs

| Contexto | Contêiner |
|---|---|
| Compreensível por todos | Só por técnicos |
| Envelhece devagar | Mais rápido |
| Não diz onde mexer | Diz |
| Barato de manter | Mais caro |

| Poucos sistemas externos | Todos |
|---|---|
| Legível de relance | Completo |
| Exige escolher o que importa | Não exige julgamento |
| Omite integrações reais | Vira teia ilegível |

O segundo é a decisão difícil deste nível: um contexto honesto costuma ter mais caixas do
que se gostaria, e reduzi-las por estética esconde exatamente as dependências que o
diagrama existe para revelar.

## Modos de Falha

**Detalhe interno.** Vira um contêiner mal feito.

**Sistemas indiretos.** Vira mapa da organização.

**Setas sem rótulo.** Não diz o que se perde.

**Jargão.** O negócio não consegue ler.

**Fronteira ambígua.** O diagrama revela desacordo não resolvido.

**Desatualizado.** Uma integração nova não foi incluída.

## Erros Comuns

**Não produzir**, por parecer simples demais.

**Incluir tecnologias.**

**Rotular pelo mecanismo** em vez do propósito.

**Incluir tudo que existe na organização.**

**Não datar.**

**Não revisar quando uma integração nova aparece.**

## Exemplo Real

Uma empresa de logística passou por um incidente em que a desativação de um sistema
interno quebrou três processos que ninguém tinha antecipado.

A investigação revelou que não havia diagrama de contexto de nenhum sistema — a
documentação existente era de componentes internos.

A produção de contextos para os 40 sistemas levou seis semanas, e foi feita com uma
combinação de entrevistas e observação de tráfego. Ver
[arquitetura do estado atual](../15-enterprise-architecture/current-state-architecture.md).

Três achados durante o exercício:

**Consumidores desconhecidos.** Em 11 dos 40, apareceram consumidores que os times não
conheciam. Um sistema tinha sete consumidores; a equipe sabia de três.

**Fronteiras ambíguas.** Em quatro casos, pessoas do mesmo time discordaram sobre o que
pertencia ao sistema. Em dois deles, a discordância refletia uma responsabilidade que
tinha sido absorvida sem decisão.

**Dependências externas não mapeadas.** Cinco sistemas dependiam de serviços de terceiros
que não apareciam em nenhum inventário — incluindo um serviço de geocodificação usado por
três sistemas, com contrato vencido.

O uso posterior:

**Integração de pessoas novas.** O contexto virou o primeiro documento apresentado, e o
tempo até a primeira contribuição caiu perceptivelmente.

**Avaliação de impacto.** Antes de qualquer desativação ou mudança de contrato, o contexto
é consultado — e a lista de consumidores é verificada contra o tráfego real.

**Conversas com o negócio.** Os contextos passaram a ser usados em discussões de
prioridade, porque as áreas conseguiam lê-los.

Manutenção: os diagramas são descritos em texto no repositório de cada sistema, gerados na
esteira, e revisados quando uma integração muda. Em dezoito meses, a média foi de 1,4
alteração por sistema.

A lição registrada: os 11 consumidores desconhecidos foram a descoberta de maior
valor, e ela veio de um exercício que a organização tinha considerado simples demais para
priorizar durante anos.

## Conceitos Relacionados

- [Modelo C4](c4-model.md) — o nível acima.
- [Diagramas de Contêiner](container-diagrams.md) — o zoom seguinte.
- [Qualidade de Diagrama](diagram-quality.md).
- [Paisagens de Integração](../15-enterprise-architecture/integration-landscapes.md).

## Exercício Prático

Desenhe o contexto de um sistema do seu time, com no máximo 12 caixas e todas as setas
rotuladas por propósito.

Depois mostre a alguém do negócio. Se essa pessoa precisar de explicação, o diagrama
ainda tem jargão.

## Perguntas de Entrevista

- O que entra e o que não entra num diagrama de contexto?
- Por que o rótulo da relação é onde está a informação?
- Por que desenhar o contexto força uma decisão de fronteira?

## Para Aprofundar

- Brown, Simon. *The C4 model* — c4model.com.
- Brown, Simon. *Software Architecture for Developers*. Leanpub, 2015.
- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003.
