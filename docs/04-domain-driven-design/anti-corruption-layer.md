---
id: anti-corruption-layer
title: Anti-Corruption Layer
sidebar_position: 9
description: A camada que impede o modelo alheio de vazar para dentro do seu.
doc_type: pattern
level: 2
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor decide onde uma anti-corruption layer se paga e reconhece
  quando ela virou um adaptador anêmico.
prerequisites: [context-mapping]
related: [adapter, bounded-context, legacy-modernization]
canonical_for: [anti-corruption layer, ACL]
content_version: 1
last_reviewed: 2026-08-26
---

# Anti-Corruption Layer

## Visão Geral

Uma anti-corruption layer é uma camada de tradução entre dois bounded contexts,
que impede que o modelo de um vaze para dentro do outro.

O nome é forte de propósito: sem ela, o modelo alheio **corrompe** o seu — os
conceitos dele passam a habitar o seu domínio, e as decisões dele passam a
restringir as suas.

## Problema

Você precisa integrar com um sistema cujo modelo você não controla: um legado, um
serviço de outra área, um fornecedor externo.

O caminho de menor resistência é consumir o modelo dele diretamente. Os tipos
chegam, e cada um é um caminho por onde as decisões daquele sistema entram no seu.

O sintoma aparece depois: o domínio ganha conceitos que não são dele — um campo
que existe porque o legado exige, um estado que só faz sentido no modelo do
fornecedor, uma regra que existe para contornar uma limitação alheia.

Quando o sistema externo muda, o seu domínio muda junto. E quando você quer
substituir o fornecedor, descobre que o modelo dele está espalhado.

## Conceitos Centrais

### É mais que tradução de formato

A distinção que separa uma anti-corruption layer de um
[Adapter](/03-design-patterns/adapter.md) simples.

Adapter converte interfaces. Anti-corruption layer converte **modelos**: os
conceitos do outro lado viram conceitos do seu, com semântica própria, e o que não
faz sentido no seu domínio não atravessa.

Se o legado tem sete status de pedido e o seu domínio reconhece três, a camada
mapeia sete para três. Ela decide o que importa — e essa decisão é de modelagem,
não de conversão.

### Ela protege a semântica, não só os tipos

O trabalho mais difícil está nos casos de borda semânticos.

O legado devolve prazo negativo quando há erro. Ele usa data zero para "sem
data". Ele considera um pedido "concluído" incluindo os cancelados.

Cada uma dessas é uma decisão do modelo alheio que não pertence ao seu. A camada
precisa traduzir isso para o seu vocabulário — ou rejeitar, se não houver
tradução válida.

Uma camada que apenas converte campos deixa passar essas armadilhas, e elas
aparecem como defeito de negócio meses depois.

### O custo é manutenção contínua

Quando o sistema externo evolui, a camada precisa acompanhar.

Esse é o preço, e é o que a torna uma decisão e não um default: você paga tradução
para não pagar acoplamento.

### Ela viabiliza modernização

Uma anti-corruption layer permite construir o novo modelo enquanto o legado
continua operando. Ela é o mecanismo que torna
[strangler fig](/16-legacy-modernization/strangler-fig.md) viável — o novo sistema fala
sua própria linguagem desde o primeiro dia, e a camada absorve o legado.

## Quando Usar

- Integração com sistema legado que não será alterado.
- Consumo de serviço de outra área com modelo incompatível.
- Fornecedor externo cujo modelo pode mudar sem aviso.
- Modernização incremental, com convivência entre antigo e novo.
- Sempre que o relacionamento seria conformista e a independência importa.

## Quando Não Usar

**Quando os dois lados são seus e podem convergir.** Alinhe os modelos em vez de
traduzir. A camada vira dívida.

**Quando o modelo externo é adequado ao seu domínio.** Se os conceitos coincidem
genuinamente, traduzir adiciona indireção sem proteger nada.

**Quando o custo de manutenção supera o do acoplamento.** Uma integração pontual
com um sistema estável, usada em um lugar, pode não justificar.

**Quando ela se reduz a mapeamento campo a campo.** Se a camada não toma nenhuma
decisão de modelagem — apenas renomeia campos — ela é um adaptador anêmico. Ou o
modelo externo já servia, ou a tradução real não está sendo feita.

**Quando não há quem a mantenha.** Uma camada desatualizada é pior que nenhuma:
ela dá a impressão de proteção que não existe.

## Alternativas

- **Conformista** — adotar o modelo externo deliberadamente, quando a
  independência não vale o custo. É uma decisão legítima, desde que declarada.
- **[Adapter](/03-design-patterns/adapter.md)** — quando a incompatibilidade é
  de interface e não de modelo.
- **Negociar o contrato** — quando há relacionamento cliente-fornecedor real, mudar
  o outro lado pode ser mais barato.
- **Caminhos separados** — não integrar.

## Trade-offs

| Anti-corruption layer | Consumo direto |
|---|---|
| Domínio protegido do modelo alheio | Modelo alheio entra |
| Substituir o fornecedor é local | Toca todo o sistema |
| Semântica traduzida e validada | Armadilhas passam |
| Manutenção contínua da tradução | Nenhuma |
| Uma camada a entender | Fluxo direto |
| Custo pago mesmo sem mudança externa | Custo pago quando muda |

## Modos de Falha

**Camada anêmica.** Mapeamento campo a campo, sem decisão de modelagem.

**Vazamento parcial.** A maior parte é traduzida e um tipo do outro lado escapa
numa assinatura. Basta um.

**Camada desatualizada.** O modelo externo evoluiu e a tradução não; erros
silenciosos.

**Tradução com perda não tratada.** Um estado do outro lado não tem
correspondente e é mapeado para o mais próximo, sem que ninguém decida se isso é
correto.

**Camada que acumula regra de negócio.** Ela é o ponto de encontro dos dois
modelos, e regra migra para lá — o mesmo mecanismo que degenera
[fachadas](/03-design-patterns/facade.md) e barramentos.

## Erros Comuns

**Tratar como conversão de formato.** É tradução de modelo.

**Não tratar os casos de borda semânticos.** É onde a corrupção real acontece.

**Deixar um tipo externo vazar.**

**Não manter.** A camada precisa de dono.

**Aplicar a integrações triviais.** Custo sem benefício.

## Exemplo Real

Uma empresa de crédito integrava com o sistema do bureau de crédito. O modelo do
bureau era rico e específico: 40 tipos de ocorrência, escalas de pontuação
próprias, códigos de restrição com semântica documentada em um manual de 200
páginas.

A primeira integração consumiu o modelo direto. Em dezoito meses, `OcorrenciaBureau`
aparecia em 34 arquivos do domínio, e a regra de decisão de crédito estava escrita
em termos dos códigos do bureau.

Dois problemas apareceram juntos.

O bureau alterou a escala de pontuação, e a mudança tocou os 34 arquivos.

E a empresa quis adicionar um segundo bureau, com modelo completamente diferente.
Não havia como: o domínio falava a língua do primeiro.

A anti-corruption layer construída depois traduzia para um modelo próprio:
`PerfilDeRisco` com faixas definidas pela empresa, `RestricaoAtiva` com quatro
tipos que importavam ao negócio, e `PontuacaoNormalizada` numa escala própria.

Os 40 tipos de ocorrência viraram quatro. A decisão de quais quatro foi tomada com
o time de risco — e é exatamente a decisão de modelagem que a camada existe para
concentrar.

O segundo bureau foi adicionado como uma segunda tradução, em três semanas, com
zero alteração no domínio.

O detalhe que mais rendeu: a camada rejeita respostas do bureau que não podem ser
traduzidas com segurança — em vez de mapear para o valor mais próximo. Isso
transformou uma classe de defeito silencioso em erro explícito de integração.

## Conceitos Relacionados

- [Context Mapping](/04-domain-driven-design/context-mapping.md) — onde este padrão se situa.
- [Adapter](/03-design-patterns/adapter.md) — a versão de interface.
- [Bounded Context](/04-domain-driven-design/bounded-context.md) — o que se protege.
- [Modernização de Legado](/16-legacy-modernization/index.md) — o uso mais
  frequente.

## Exercício Prático

Escolha uma integração externa do seu sistema e conte em quantos arquivos os tipos
do sistema externo aparecem.

Depois liste os casos de borda semânticos: valores especiais, estados sem
correspondente, códigos de erro embutidos em campos de dado. Verifique onde cada
um é tratado hoje.

## Perguntas de Entrevista

- Qual a diferença entre anti-corruption layer e Adapter?
- O que caracteriza uma camada anêmica?
- Como este padrão viabiliza modernização incremental?

## Para Aprofundar

- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003.
- Vernon, Vaughn. *Implementing Domain-Driven Design*. Addison-Wesley, 2013.
- Fowler, Martin. *StranglerFigApplication*, 2004.
