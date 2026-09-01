---
id: system-decomposition
title: Decomposição de Sistemas
sidebar_position: 1
description: Como ir de um enunciado a um conjunto de partes — o primeiro movimento do design de sistemas.
doc_type: concept
level: 3
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor decompõe um sistema a partir de capacidades e requisitos
  de qualidade, e reconhece as decomposições que criam mais problemas que resolvem.
prerequisites: [system-design]
related: [components, service-boundaries, modular-design]
canonical_for: [decomposição de sistemas, system decomposition]
content_version: 1
last_reviewed: 2026-08-26
---

# Decomposição de Sistemas

## Visão Geral

Decompor é dividir o sistema em partes que podem ser entendidas, construídas,
implantadas e operadas separadamente.

É o primeiro movimento do design de sistemas, e o que mais condiciona tudo o que
vem depois — porque as fronteiras escolhidas aqui determinam onde a mudança fica
contida e onde ela se espalha.

## Problema

Diante de "projete o sistema", a tentação é começar desenhando componentes. Isso
produz decomposições que refletem a familiaridade de quem desenha, não o problema.

Três padrões de decomposição ruim aparecem com regularidade.

**Por camada técnica.** API, serviço, dados. Reproduz no nível de sistema o
problema que [camadas](/02-software-design/layering.md) já tem no nível de
código: toda mudança de negócio atravessa tudo.

**Por entidade.** Um componente por substantivo do domínio. A capacidade de
negócio fica espalhada por vários.

**Por organograma sem análise.** A estrutura de times copiada para o sistema, sem
verificar se ela corresponde ao negócio. Às vezes corresponde; frequentemente a
organização é que está errada.

## Conceitos Centrais

### O critério é capacidade, com requisito de qualidade como segundo eixo

A divisão primária vem das **capacidades de negócio** — o que o sistema faz para
quem o usa. Cobrar, catalogar, entregar, atender.

O segundo eixo é o **requisito de qualidade**: partes com necessidades muito
diferentes de escala, disponibilidade ou latência são candidatas a separação,
mesmo dentro de uma capacidade.

Um processador de relatórios que consome muita memória e um atendimento de
requisição que precisa responder em 200 ms não convivem bem no mesmo processo,
ainda que pertençam à mesma capacidade.

### Decomposição lógica antes de física

Duas decisões, frequentemente confundidas:

**Lógica** — quais são as partes conceituais e o que cada uma faz. Barata de
mudar.

**Física** — quantos processos, quantos artefatos, o que roda onde. Cara de mudar.

A ordem importa. Decidir a decomposição física antes de a lógica se provar produz
fronteiras de alto custo no lugar errado. Ver
[fronteiras](/02-software-design/boundaries.md) e
[design de componentes](/02-software-design/component-design.md).

O caminho seguro: decomponha logicamente, imponha as fronteiras dentro de um
processo, e promova a componente separado o que tiver razão.

### A decomposição precisa passar no teste da mudança

Uma decomposição é boa quando as mudanças típicas cabem numa parte.

Isso é verificável antes de construir: liste as cinco alterações mais prováveis
nos próximos seis meses e verifique quantas partes cada uma toca. Se a maioria
toca três ou mais, a decomposição está errada.

Em sistema existente, o histórico responde melhor que a previsão.

### Nem tudo precisa ser decomposto

Um sistema pequeno com um time não ganha nada em ser dividido. A decomposição tem
custo — contratos, tradução, navegação — e ele só se paga acima de certa escala de
código e de pessoas.

## Modelo Mental

**Comece pelas capacidades, verifique pelos requisitos de qualidade, e só então
decida o que vira processo separado.**

## Quando Usar

- O sistema passou do tamanho que uma pessoa mantém na cabeça.
- Mais de um time trabalha nele.
- Partes têm requisitos de qualidade distintos.
- Partes evoluem em ritmos diferentes.

## Quando Não Usar

**Em sistemas pequenos.** Abaixo de alguns milhares de linhas e com um time, a
decomposição custa mais navegação do que economiza em contenção.

**Antes de entender o domínio.** Fronteira errada é pior que fronteira ausente.
Ver [bounded context](/04-domain-driven-design/bounded-context.md).

**Copiando o organograma sem verificar.** A [lei de
Conway](/23-architecture-leadership/conways-law.md) descreve o que acontece, não o
que deveria acontecer.

**Decompondo fisicamente por default.** Módulos primeiro.

## Alternativas

- **Monolito com módulos internos** — a resposta na maioria dos casos. Ver
  [monolito modular](/03-design-patterns/modular-monolith.md).
- **Sistema único sem divisão** — legítimo em sistemas pequenos.
- **Decomposição parcial** — separar apenas o que tem requisito distinto,
  mantendo o resto junto.

## Trade-offs

| Mais partes | Menos partes |
|---|---|
| Mudança contida | Espalha |
| Escala e falha isoláveis | Compartilhadas |
| Times em paralelo | Coordenação |
| Contratos a manter | Nenhum |
| Fluxo atravessa fronteiras | Direto |
| Operação mais complexa | Simples |

## Modos de Falha

**Decomposição por camada técnica.** Toda mudança atravessa tudo.

**Partes que sempre mudam juntas.** A fronteira está no eixo errado.

**Uma parte central da qual todas dependem.** Vira gargalo de desenvolvimento.

**Decomposição física prematura.** Fronteira cara no lugar errado.

**Contrato que expõe o interior.** As partes ficam acopladas com cerimônia extra.

## Erros Comuns

**Começar desenhando componentes.** Comece pelas capacidades.

**Decompor por entidade.**

**Confundir decomposição lógica com física.**

**Não verificar contra as mudanças prováveis.**

**Decompor demais.** Mais partes do que o time consegue operar.

## Exemplo Real

Um sistema de gestão de eventos foi decomposto em `API`, `Processamento`,
`Notificacoes` e `Relatorios` — divisão por natureza técnica.

Testado contra as cinco mudanças mais frequentes do último ano: adicionar um tipo
de ingresso, mudar a regra de reembolso, adicionar um campo ao cadastro de
participante, alterar a política de lotação e incluir um canal de notificação.

Quatro das cinco tocavam três ou mais partes.

A redecomposição por capacidade produziu `Ingressos`, `Participantes`, `Acesso` —
controle de entrada no evento — e `Financeiro`.

Nova medição das mesmas cinco mudanças: quatro tocavam uma parte só.

A quinta — incluir canal de notificação — continuou atravessando, porque
notificação é transversal. Ela virou um módulo consumido pelos quatro, com
contrato explícito, em vez de uma parte de topo.

Nenhuma dessas partes virou processo separado. A decomposição foi lógica, imposta
por teste de arquitetura, e o sistema continuou sendo um artefato.

Dois anos depois, `Acesso` foi extraído — porque a validação de entrada em eventos
grandes tem pico de carga de ordens de grandeza e precisa escalar sozinha. Uma
razão, registrada, e só ela.

## Como validar uma decomposição antes de construir

Três verificações que custam horas e evitam meses.

**O teste da mudança.** Liste as cinco alterações mais prováveis e conte quantas
partes cada uma toca. Se a maioria toca três ou mais, a decomposição está no eixo
errado. Em sistema existente, o histórico responde melhor que a previsão.

**O teste da propriedade.** Para cada parte, liste os dados de que ela é dona. Se
duas partes escrevem no mesmo lugar, elas são uma parte dividida em duas — e a
fronteira é ficção.

**O teste da explicação.** Peça a alguém que não participou do desenho que explique
o que cada parte faz, em uma frase, sem usar "e". Nomes que exigem conjunção
denunciam agrupamento sem conceito por trás.

O primeiro é o mais valioso e o menos feito, porque exige admitir que não se sabe
como o sistema vai mudar. A resposta honesta é que ninguém sabe — mas o histórico
de sistemas parecidos, ou do próprio produto, informa muito melhor que a intuição
de quem está desenhando naquele momento.

Uma decomposição que passa nos três não é garantidamente certa. Uma que falha em
qualquer um deles é comprovadamente errada, e isso já paga o exercício.

## Conceitos Relacionados

- [Componentes](/05-system-design/components.md) — as partes resultantes.
- [Fronteiras de Serviço](/05-system-design/service-boundaries.md) — onde separar processos.
- [Design Modular](/02-software-design/modular-design.md) — a execução em
  código.
- [Bounded Context](/04-domain-driven-design/bounded-context.md) — o critério de
  domínio.

## Exercício Prático

Liste as cinco alterações mais prováveis no seu sistema nos próximos seis meses.

Para cada uma, conte quantas partes de topo ela tocaria.

Se a maioria toca três ou mais, liste as partes que aparecem juntas com mais
frequência — elas são a decomposição que deveria existir.

## Perguntas de Entrevista

- Qual o critério primário de decomposição, e por quê?
- Por que decidir a decomposição física antes da lógica é arriscado?
- Como verificar se uma decomposição está correta antes de construir?

## Para Aprofundar

- Parnas, David. *On the Criteria To Be Used in Decomposing Systems into
  Modules*. CACM, 1972.
- Newman, Sam. *Building Microservices*. 2ª ed., O'Reilly, 2021.
- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003.
