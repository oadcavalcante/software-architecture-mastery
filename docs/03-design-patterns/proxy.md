---
id: proxy
title: Proxy
sidebar_position: 12
description: Um substituto que controla acesso ao objeto real — e as quatro variantes com custos diferentes.
doc_type: pattern
level: 2
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor distingue as variantes de Proxy e reconhece quando a
  transparência do padrão esconde custo demais.
prerequisites: [decorator]
related: [decorator, adapter, facade]
canonical_for: [proxy, procurador]
content_version: 1
last_reviewed: 2026-08-26
---

# Proxy

## Visão Geral

Proxy fornece um substituto que controla o acesso a outro objeto, implementando a
mesma interface.

O que distingue Proxy de [Decorator](/03-design-patterns/decorator.md) — estruturalmente idênticos —
é a intenção: Decorator adiciona comportamento que o cliente quer; Proxy controla
acesso, e o cliente frequentemente não sabe que ele existe.

Essa transparência é a força e o risco do padrão.

## Problema

O acesso direto ao objeto real é indesejável por alguma razão: ele é caro de
criar, está em outra máquina, exige verificação de permissão, ou seu ciclo de
vida precisa ser gerenciado.

O cliente não deveria precisar lidar com isso. O proxy assume, mantendo a mesma
interface.

## Conceitos Centrais

### As quatro variantes

O GoF distingue quatro, com perfis de custo bem diferentes.

**Virtual** — adia a criação do objeto real até o primeiro uso. Usado para
objetos caros: uma imagem de alta resolução, um agregado com muitas relações.

**Remoto** — representa localmente um objeto em outro processo ou máquina. É o
que torna uma chamada de rede parecer uma chamada de método — e é a variante mais
perigosa, pelo motivo abaixo.

**De proteção** — verifica permissão antes de delegar.

**Inteligente** — adiciona gerenciamento: contagem de referências, carga sob
demanda de campos, registro de acesso.

### A transparência esconde custo

O proxy remoto é o exemplo canônico do problema, e é uma das lições mais
importantes de sistemas distribuídos.

Uma chamada que parece local pode ser uma requisição de rede com latência,
timeout e possibilidade de falha parcial. O código não distingue, e o
desenvolvedor raciocina como se fosse local — chamando em laço, sem tratamento de
falha, sem considerar latência.

É a origem das *falácias da computação distribuída*: a rede é confiável, a
latência é zero, a banda é infinita. Um proxy remoto convida ativamente a
acreditar nelas.

Ver [sistemas distribuídos](/06-distributed-systems/index.md).

### O proxy virtual e o problema N+1

O proxy virtual em mapeadores objeto-relacional produz o defeito de desempenho
mais comum em aplicações de negócio: um laço sobre cem pedidos, acessando
`pedido.getCliente()`, dispara cem consultas — porque cada acesso ao proxy
carrega sob demanda.

O código parece percorrer uma lista em memória. Ele está fazendo cem viagens ao
banco.

## Quando Usar

- **Virtual:** o objeto é comprovadamente caro e frequentemente não é usado.
- **De proteção:** o controle de acesso é uniforme e pode ser aplicado na
  fronteira.
- **Inteligente:** é necessário instrumentar ou gerenciar acesso de forma
  transversal.
- **Remoto:** quando o framework já o oferece e a equipe entende os custos.

## Quando Não Usar

**Proxy remoto sem que o custo seja explícito.** A recomendação forte deste
documento: em código novo, prefira que a chamada remota **pareça** remota. Um
cliente que devolve um resultado assíncrono ou um tipo que representa
possibilidade de falha comunica o que está acontecendo.

**Proxy virtual em caminho quente.** É onde o N+1 nasce.

**Proteção que deveria ser explícita.** Autorização escondida num proxy é difícil
de auditar. Quando alguém pergunta "quem pode fazer isso?", a resposta precisa
estar visível.

**Quando o objeto real é barato.** A indireção custa mais que a criação.

**Quando a variante inteligente acumula responsabilidade.** Um proxy que registra,
mede, cacheia e valida virou uma pilha de decoradores mal nomeada.

## Alternativas

- **Carga explícita** — `repositorio.buscarComCliente(id)` em vez de proxy
  virtual. Mais verboso e sem surpresa.
- **[Decorator](/03-design-patterns/decorator.md)** — quando o comportamento é escolha do cliente.
- **Cliente assíncrono explícito** — para chamadas remotas.
- **Verificação de permissão no ponto de entrada** — visível e auditável.

## Trade-offs

| Proxy | Acesso direto |
|---|---|
| Cliente não muda | Cliente lida com o custo |
| Controle transversal num lugar | Replicado |
| Custo real invisível | Custo explícito |
| Depuração indireta | Direta |
| Convite a raciocínio errado | Sem essa armadilha |

A terceira linha é a decisiva e vale nos dois sentidos: invisibilidade é
conveniência quando o custo é irrelevante, e armadilha quando não é.

## Modos de Falha

**N+1 por carga sob demanda.** O modo de falha mais caro e mais comum.

**Chamada remota tratada como local.** Laços sobre proxies remotos, sem
tratamento de falha nem consideração de latência.

**Proxy que muda a semântica.** Devolve nulo ou lança onde o objeto real não
faria.

**Identidade quebrada.** Comparações e verificações de tipo falham porque o
objeto visível é o proxy.

**Inicialização preguiçosa fora de contexto.** O proxy tenta carregar quando a
sessão ou a transação já fechou.

## Erros Comuns

**Confundir com Decorator.** Intenção diferente.

**Usar proxy virtual sem entender o N+1.** Carregar sob demanda dentro de um laço transforma uma consulta em uma por elemento, e o custo só aparece com volume — em desenvolvimento, com dez registros, o padrão parece funcionar.

**Esconder chamada remota atrás de interface local.** Quem chama não vê latência nem possibilidade de falha, e escreve o código como se fosse memória: sem timeout, sem retentativa, dentro de laço. É a primeira falácia da computação distribuída embalada num padrão.

**Colocar autorização em proxy sem torná-la auditável.** A decisão de permitir ou negar fica num ponto que não registra quem pediu o quê, e a pergunta "quem acessou isso?" passa a não ter resposta.

## Onde ele aparece na prática

**Mapeadores objeto-relacional.** Relações carregadas sob demanda são proxies
virtuais. É o uso mais difundido e o que mais causa problemas de desempenho.

**Chamada remota em frameworks antigos.** RMI, CORBA e alguns clientes de RPC
geram proxies que fazem a rede parecer local. A tendência moderna é o oposto —
clientes que devolvem tipos assíncronos.

**Contêineres de injeção de dependência.** Muitos envolvem os objetos em proxies
para aplicar transação, segurança e cache — que é a variante inteligente,
frequentemente invisível para quem escreve o código.

**Malhas de serviço.** O *sidecar* é um proxy de rede: intercepta o tráfego para
aplicar política, telemetria e repetição. Ver
[service mesh](/08-integration-architecture/index.md).

O último é o caso em que a transparência funciona bem, e vale entender por quê: o
proxy opera na camada de rede, onde o desenvolvedor **já sabe** que está fazendo
uma chamada remota. A ilusão problemática não existe.

## Exemplo Real

Uma tela de listagem de pedidos ficou dez vezes mais lenta depois de uma mudança
que parecia inofensiva: adicionar o nome do cliente na listagem.

O código percorria os pedidos e acessava `pedido.getCliente().getNome()`. Com
proxy virtual, cada acesso disparava uma consulta. Cinquenta pedidos por página
viraram cinquenta e uma consultas.

A correção imediata foi carregar explicitamente na consulta original.

A correção estrutural veio depois e é a que interessa: o time passou a usar
projeções explícitas para telas de listagem — um tipo que contém exatamente os
campos que a tela mostra, obtido numa consulta.

Isso eliminou a categoria inteira de defeito, porque não há proxy para disparar.
O custo passou a ser visível na consulta, que é onde ele deve estar.

## Conceitos Relacionados

- [Decorator](/03-design-patterns/decorator.md) — mesma estrutura, intenção diferente.
- [Adapter](/03-design-patterns/adapter.md) — muda a interface.
- [Facade](/03-design-patterns/facade.md) — simplifica um subsistema.
- [Sistemas Distribuídos](/06-distributed-systems/index.md) — por que a
  transparência remota é perigosa.

## Exercício Prático

Se seu sistema usa mapeador objeto-relacional, escolha a tela mais lenta e conte
quantas consultas ela dispara.

Se o número cresce com a quantidade de itens exibidos, você encontrou um N+1
causado por proxy virtual.

## Perguntas de Entrevista

- Quais são as variantes de Proxy e o que cada uma resolve?
- Por que fazer uma chamada remota parecer local é problemático?
- Como o proxy virtual causa o problema N+1?

## Para Aprofundar

- Gamma, Erich et al. *Design Patterns*. Addison-Wesley, 1994.
- Deutsch, Peter; Gosling, James. *The Fallacies of Distributed Computing*,
  1994–1997.
