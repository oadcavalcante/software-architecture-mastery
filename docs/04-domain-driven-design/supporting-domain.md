---
id: supporting-domain
title: Supporting Domain
sidebar_position: 4
description: Necessário e específico do negócio, mas não diferenciador — construa simples e resista à tentação.
doc_type: foundation
level: 2
difficulty: iniciante
status: complete
objective: >
  Ao terminar, o leitor reconhece subdomínios de apoio e escolhe a solução mais
  simples que atende, em vez da mais elaborada.
prerequisites: [subdomain]
related: [core-domain, generic-domain, tactical-ddd]
canonical_for: [supporting domain, subdomínio de apoio]
content_version: 1
last_reviewed: 2026-08-26
---

# Supporting Domain

## Visão Geral

Um supporting domain é necessário para o negócio funcionar, é específico o
bastante para não haver solução pronta, e não diferencia a empresa de ninguém.

A decisão que ele exige é a mais difícil das três: **construir, mas construir
simples** — e resistir à tentação de fazer bem feito demais.

## O Problema

Supporting domains são a maior parte do sistema na maioria das empresas, e o lugar
onde mais esforço é desperdiçado.

O mecanismo é previsível. Um engenheiro competente trabalha num subdomínio de
apoio. Ele vê oportunidades legítimas de melhoria: abstrair aqui, generalizar ali,
tornar configurável aquilo.

Cada melhoria é defensável isoladamente. O acúmulo produz um subsistema elaborado
que resolve muito bem um problema que não diferencia a empresa em nada — enquanto
o [core](core-domain.md) recebe menos atenção.

Não é falta de competência. É ausência de um critério que diga "aqui, bom o
bastante é o alvo".

## Conceitos Centrais

### Bom o bastante é o alvo, explicitamente

No core, a busca por qualidade se paga. Num supporting domain, ela tem retorno
decrescente rápido.

Isso precisa ser dito em voz alta, porque contraria o instinto profissional. Um
engenheiro que entrega uma solução simples num supporting domain fez o trabalho
certo, e sem o critério declarado pode parecer que fez menos.

### Não aplique DDD tático aqui

Agregados, objetos de valor, repositórios, eventos de domínio — a cerimônia
tática custa e só se paga onde a regra é genuinamente complexa e muda com
frequência.

Num supporting domain, um serviço direto com acesso a dados costuma ser a resposta
correta. Ver [DDD tático](tactical-ddd.md).

### Candidatos a se tornarem generic

Um supporting domain hoje pode virar [generic](generic-domain.md) amanhã, quando
alguém lançar um produto que o resolva.

Vale monitorar: gestão de contratos, aprovação de despesas, controle de acesso
por perfil — todos já foram supporting em muitas empresas e hoje têm soluções de
mercado maduras.

### Onde alocar pessoas

Supporting domains são bons lugares para pessoas em início de carreira: o
problema é real, a consequência de errar é contida, e o aprendizado é legítimo.

Alocar os engenheiros mais experientes ali é o sintoma do desalinhamento que a
classificação existe para corrigir.

## Por Que Isso Importa

**Porque é a maior parte do sistema.** O que se decide sobre supporting domains
determina onde a maior parte do esforço vai.

**Porque dá permissão para simplicidade.** Sem o rótulo, um engenheiro não tem
argumento para entregar a solução simples. Com ele, tem.

**Porque libera capacidade para o core.** Cada mês não gasto elaborando um
supporting domain é um mês disponível onde importa.

## Erros Comuns

**Aplicar DDD tático.** O erro mais comum e o mais caro em volume.

**Alocar os melhores engenheiros.**

**Generalizar preventivamente.** Ver
[YAGNI](../02-software-design/yagni.md). Um supporting domain raramente precisa
absorver variação futura.

**Não reavaliar se virou generic.**

**Tratar como core por apego.** Times que trabalharam anos num subdomínio tendem a
defendê-lo como estratégico.

## Exemplo Real

Uma fintech tinha um subdomínio de gestão de documentos: upload, categorização,
validação de vencimento, retenção conforme regra regulatória.

Necessário — sem isso não há conformidade. Específico — as regras de retenção
vêm da regulação do setor e nenhum produto de prateleira as implementava.
Diferenciador — nenhum cliente escolheu a fintech por causa da gestão de
documentos.

Supporting, portanto.

O que a equipe havia construído em dois anos: um motor de fluxo configurável, com
regras de retenção declaradas em uma linguagem própria, versionamento de
documento, e uma interface de administração para criar tipos de documento novos.

Quatro engenheiros, dezoito meses.

O uso real: onze tipos de documento, criados no primeiro mês e nunca alterados
desde então. O motor configurável nunca foi configurado depois da carga inicial.

A reescrita como código direto — onze tipos como constantes, regras de retenção
como código, sem interface de administração — levou seis semanas e removeu 80% do
código.

A equipe foi realocada para o core, que era análise de risco de crédito.

O erro não foi técnico. O motor configurável era bem construído. O erro foi
construí-lo num lugar onde flexibilidade não tinha valor — e ninguém tinha
declarado isso.

## O padrão de degeneração

Subdomínios de apoio degeneram de forma previsível, e reconhecer o padrão permite
interromper cedo.

**Fase um — a solução direta.** Alguém implementa o necessário, de forma simples.
Funciona.

**Fase dois — a primeira exceção.** Um caso não previsto aparece. Em vez de tratá-lo
como caso, alguém generaliza: adiciona um parâmetro, torna configurável.

**Fase três — a plataforma.** Mais exceções chegam. A generalização vira mecanismo:
uma pequena linguagem de configuração, um motor de regras, uma interface de
administração.

**Fase quatro — a manutenção permanente.** O mecanismo precisa de quem o entenda.
Ele tem defeitos próprios, documentação própria, e uma curva de aprendizado para
quem chega.

A intervenção mais eficaz é na fase dois: tratar a primeira exceção como exceção,
com um `if` explícito e um comentário, em vez de generalizar.

Isso parece menos elegante e é a decisão correta num supporting domain. A
elegância tem valor onde a flexibilidade tem valor — e ali ela não tem.

## Conceitos Relacionados

- [Subdomínio](subdomain.md) — a classificação.
- [Core Domain](core-domain.md) — onde investir.
- [Generic Domain](generic-domain.md) — o que comprar.
- [YAGNI](../02-software-design/yagni.md) — o princípio que se aplica aqui com
  força.

## Exercício Prático

Escolha um subdomínio de apoio do seu sistema e conte quantos pontos de
configuração ou extensão ele tem.

Para cada um, verifique quantos valores distintos foram usados desde que existe.
Os que só têm um são flexibilidade que nunca foi exercida.

## Perguntas de Entrevista

- O que caracteriza um supporting domain?
- Por que não aplicar DDD tático aqui?
- Como reconhecer que um supporting domain virou generic?

## Para Aprofundar

- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003.
- Vernon, Vaughn. *Domain-Driven Design Distilled*. Addison-Wesley, 2016.
