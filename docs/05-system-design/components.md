---
id: components
title: Componentes
sidebar_position: 2
description: As partes de um sistema, suas responsabilidades e o que precisa ser decidido sobre cada uma.
doc_type: concept
level: 3
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor descreve um componente pelo que ele decide sozinho e pelo
  que ele precisa dos outros.
prerequisites: [system-decomposition]
related: [services, apis, service-boundaries]
canonical_for: [componente de sistema]
content_version: 1
last_reviewed: 2026-08-26
---

# Componentes

## Visão Geral

Um componente é uma parte do sistema com responsabilidade definida, interface
explícita e ciclo de vida próprio.

Descrever um sistema por seus componentes é o vocabulário mais usado em design de
sistemas — e o mais frequentemente vago, porque "componente" é usado para coisas
de escalas muito diferentes.

## Problema

Diagramas de arquitetura mostram caixas com nomes. O que uma caixa significa varia
enormemente: um processo, uma biblioteca, um módulo, um serviço gerenciado, um
banco de dados.

Sem definir o que cada caixa é, o diagrama comunica menos do que parece — e
decisões importantes ficam invisíveis. Duas caixas ligadas por uma seta podem ser
uma chamada de função ou uma requisição de rede entre continentes, e a diferença é
tudo.

O que torna um componente descrito de forma útil são quatro perguntas:

**Do que ele é dono?** Que dados e que decisões pertencem a ele.
**O que ele expõe?** A interface, e o que fica escondido.
**De que ele depende?** E com que garantias.
**Como ele falha?** E o que acontece com o resto.

Um componente cujas quatro respostas não estão claras não está projetado.

## Conceitos Centrais

### Propriedade define o componente

O critério mais útil: **um componente é dono de um conjunto de dados e das
decisões sobre eles.**

Se dois componentes escrevem na mesma tabela, eles não são dois — são um, dividido
em dois lugares, com o acoplamento escondido no banco.

Essa é a regra que mais separa uma decomposição real de uma nominal. Ver
[design modular](../02-software-design/modular-design.md).

### O tipo do componente importa

Nem todo componente é do mesmo tipo, e o tipo determina o custo de interagir com
ele:

| Tipo | Interação | Custo |
|---|---|---|
| Módulo | Chamada de função | Nenhum |
| Biblioteca | Chamada de função | Versionamento |
| Processo local | Rede local | Serialização, falha parcial |
| Serviço remoto | Rede | Latência, falha, timeout |
| Serviço gerenciado | Rede | O anterior, mais dependência de fornecedor |
| Armazenamento | Protocolo próprio | Latência, consistência |

Um diagrama que não distingue esses tipos esconde a informação mais importante
sobre o sistema.

### Componente sem estado é mais simples em tudo

A distinção entre componentes com e sem estado atravessa todas as decisões
seguintes: escala, implantação, recuperação de falha, balanceamento.

Ver [sem estado versus com estado](stateless-vs-stateful.md). A recomendação
antecipada: concentre o estado em poucos componentes e mantenha o resto sem
estado.

### Componentes de infraestrutura são componentes

Bancos, caches, filas e gateways são componentes do sistema, com propriedade,
interface, dependência e modo de falha próprios.

Omiti-los do desenho — ou desenhá-los como caixas genéricas sem decisão associada
— esconde onde estão os gargalos e os pontos de falha.

## Modelo Mental

**Para cada caixa do diagrama, responda as quatro perguntas.** As caixas que não
sobrevivem ao exercício são rótulos, não componentes.

## Quando Usar

- Ao descrever um sistema para outra pessoa.
- Ao planejar a construção e dividir o trabalho.
- Ao analisar onde estão os gargalos e os pontos de falha.
- Ao decidir o que pode ser substituído.

## Quando Não Usar

**Como substituto da decomposição.** Nomear componentes não é decompor; a
decomposição vem antes e usa outro critério.

**Em nível de detalhe que envelhece rápido.** Um diagrama de componentes que
desce a classes precisa ser atualizado toda semana e não será.

**Sem declarar o tipo de cada um.** Um diagrama em que módulo e serviço remoto têm
a mesma aparência esconde o que importa.

## Alternativas

- **Modelo C4** — níveis de zoom com semântica definida por nível. Ver
  [documentação de arquitetura](../17-architecture-documentation/index.md).
- **Diagrama de sequência** — quando a pergunta é sobre comportamento no tempo,
  não sobre estrutura.
- **Diagrama de implantação** — quando a pergunta é onde as coisas rodam.

## Trade-offs

| Mais componentes | Menos componentes |
|---|---|
| Responsabilidades claras | Componentes que fazem muito |
| Substituição localizada | Toca o conjunto |
| Mais interfaces a manter | Menos contratos |
| Fluxo atravessa mais caixas | Direto |
| Diagrama mais informativo, mais denso | Mais legível, menos preciso |

## Modos de Falha

**Componente sem dono de dados.** Dois escrevem no mesmo lugar.

**Componente que faz tudo.** Alto acoplamento de entrada; toda mudança passa por
ele.

**Componente invisível no desenho.** Bancos e filas omitidos escondem os gargalos.

**Tipo não declarado.** Chamada de rede parecendo chamada local — o mesmo problema
que [Proxy](../03-design-patterns/proxy.md) introduz.

**Componente sem modo de falha definido.** Ninguém sabe o que acontece quando ele
cai.

## Erros Comuns

**Desenhar caixas sem definir o que são.**

**Omitir infraestrutura.**

**Não declarar propriedade de dados.**

**Descer a detalhe que envelhece.**

**Confundir componente com equipe.** Podem coincidir e não são a mesma coisa.

## Exemplo Real

Uma equipe apresentou o desenho de um sistema de reservas: cinco caixas ligadas
por setas, todas idênticas visualmente.

As quatro perguntas foram aplicadas a cada uma.

`Reservas` e `Disponibilidade` responderam mal à primeira: as duas escreviam na
tabela de ocupação. Não eram dois componentes.

`Notificacoes` não tinha resposta para a quarta: ninguém sabia o que acontecia se
ela caísse. Descobriu-se que a chamada era síncrona dentro da transação de
reserva — a indisponibilidade do serviço de e-mail impedia reservas.

E o banco não aparecia no desenho, embora fosse compartilhado por três das cinco
caixas — o que tornava a independência delas ficção.

O desenho refeito tinha quatro componentes, com o tipo de cada um declarado, o
banco explícito com suas fronteiras de propriedade, e a notificação movida para
fora do fluxo transacional.

Nada de código mudou nessa etapa. O que mudou foi que dois problemas estruturais
ficaram visíveis antes de custarem um incidente.

## Como documentar componentes sem que envelheça

Diagramas de componente envelhecem porque descem a detalhe que muda toda semana.
Três práticas que aumentam a vida útil.

**Documente no nível em que a mudança é rara.** Um diagrama que mostra quatro
serviços e o banco continua correto por anos. Um que mostra classes está errado no
mês seguinte. Os níveis de contêiner e componente do
[modelo C4](../17-architecture-documentation/index.md) existem exatamente para
essa separação.

**Declare o tipo de cada caixa.** Módulo, processo, serviço gerenciado,
armazenamento. Um diagrama em que uma chamada de função e uma requisição entre
regiões têm a mesma aparência esconde a informação mais importante.

**Anote o que atravessa cada seta.** Protocolo, síncrono ou assíncrono, e o que
acontece se falhar. Uma seta sem isso comunica que existe uma ligação e nada sobre
o custo dela.

O que mais estende a vida de um diagrama, porém, é decidir **qual pergunta ele
responde**. Um que tenta mostrar estrutura, fluxo e implantação ao mesmo tempo
fica desatualizado nos três aspectos e é ilegível em todos. Três diagramas com
propósitos distintos envelhecem mais devagar que um que faz tudo.

## Conceitos Relacionados

- [Decomposição](system-decomposition.md) — como as partes surgem.
- [Serviços](services.md) — componentes com processo próprio.
- [APIs](apis.md) — o contrato entre eles.
- [Design de Componentes](../02-software-design/component-design.md) — quando
  promover a implantável.

## Exercício Prático

Pegue o diagrama de arquitetura do seu sistema e, para cada caixa, responda as
quatro perguntas por escrito.

As caixas sem resposta clara para propriedade de dados ou para modo de falha são
onde a próxima surpresa vai aparecer.

## Perguntas de Entrevista

- O que define um componente?
- Por que declarar o tipo de cada componente no diagrama?
- O que significa dois componentes escreverem na mesma tabela?

## Para Aprofundar

- Brown, Simon. *Software Architecture for Developers* — o modelo C4.
- Bass, Len; Clements, Paul; Kazman, Rick. *Software Architecture in Practice*.
  4ª ed., 2021.
