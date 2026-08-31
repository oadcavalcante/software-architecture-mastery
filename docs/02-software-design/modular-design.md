---
id: modular-design
title: Design Modular
sidebar_position: 12
description: A aplicação prática de modularidade — como dividir um sistema real por capacidade.
doc_type: concept
level: 2
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor divide um sistema por capacidade de negócio e define o
  contrato interno entre módulos.
prerequisites: [layering]
related: [package-design, component-design, boundaries]
canonical_for: [design modular, módulo de capacidade]
content_version: 1
last_reviewed: 2026-08-26
---

# Design Modular

> Pré-requisito: [Modularidade](/01-fundamentals/modularity.md) estabelece por
> que dividir e qual é o critério. Aqui o foco é como executar a divisão num
> sistema real: o que vai dentro de cada módulo, o que atravessa, e como o
> contrato interno é definido.

## Visão Geral

Design modular é a prática de dividir um sistema em módulos de capacidade, cada
um com sua estrutura interna completa e um contrato explícito com os demais.

O resultado que se busca é específico: **uma mudança de negócio típica cabe dentro
de um módulo.**

## Problema

Modularidade como conceito é aceita sem controvérsia. Executá-la num sistema real
esbarra em três perguntas que o conceito não responde.

**Onde exatamente traçar as linhas?** O domínio não vem dividido.

**O que um módulo pode expor?** Se ele expõe suas entidades, o acoplamento é o
mesmo de antes com mais cerimônia.

**Como dois módulos cooperam sem se acoplar?** Toda funcionalidade real atravessa
capacidades: um pedido envolve catálogo, estoque, pagamento e entrega.

Sem respostas concretas, a divisão vira renomeação de diretórios.

## Conceitos Centrais

### A divisão vem da capacidade, não da entidade

O erro mais comum é dividir por substantivo do domínio: um módulo `Cliente`, um
`Pedido`, um `Produto`.

Isso reproduz o problema das camadas em outro eixo. Uma mudança em "cliente pode
ter limite de crédito" toca `Cliente`, `Pedido` e `Faturamento`, porque a
capacidade *concessão de crédito* está espalhada pelas três entidades.

A divisão que funciona é por **capacidade** — o que o negócio faz — e cada
capacidade tem sua própria visão das entidades de que precisa. É a mesma ideia
que o [DDD estratégico](/04-domain-driven-design/index.md) formaliza como
bounded context.

### Cada módulo tem estrutura interna completa

Um módulo de capacidade contém tudo o que precisa: sua API, sua aplicação, seu
domínio, sua persistência.

```text
cobranca/
  api/          ← o que outros módulos podem chamar
  aplicacao/
  dominio/
  infra/
```

Isso duplica estrutura — cada módulo tem seu `infra`. A duplicação é aceita
deliberadamente: ela é o preço de a mudança ficar contida.

### O contrato é estreito e não expõe o interior

O que um módulo publica não é sua entidade. É um tipo do contrato, projetado para
o consumidor.

```text
❌  cobranca.api  expõe  Fatura (entidade, com todos os campos e relações)
✅  cobranca.api  expõe  SituacaoDeCobranca { emDia: bool, valorEmAberto: Dinheiro }
```

À direita, `cobranca` pode reestruturar `Fatura` inteiramente sem afetar ninguém.

### Comunicação entre módulos

Três formas, em ordem crescente de desacoplamento:

| Forma | Acoplamento | Quando |
|---|---|---|
| Chamada direta à API do módulo | De contrato e de tempo | Consulta síncrona necessária |
| Evento de domínio interno | De contrato apenas | O consumidor reage; a origem não precisa saber |
| Cópia local de dados projetados | Mínimo, com consistência eventual | O consumidor precisa consultar com frequência |

A segunda é a que mais frequentemente resolve, e é a menos usada — times tendem a
alcançar a chamada direta por hábito.

## Modelo Mental

**Um módulo é um serviço que ainda não foi extraído.** Se você projetar cada um
como se fosse virar um serviço um dia, a divisão fica boa mesmo que nunca vire.

Isso dá um teste concreto: se extrair este módulo exigiria mudar muita coisa nos
outros, ele não está modular.

## Quando Usar

- Em qualquer sistema que passe de algumas dezenas de milhares de linhas.
- Quando mais de um time trabalha na mesma base.
- Quando partes evoluem em ritmos diferentes.
- Antes de considerar microsserviços — o monolito modular é o passo que informa
  onde as fronteiras de fato estão.

## Quando Não Usar

**Em sistemas pequenos.** Abaixo de alguns milhares de linhas, a estrutura de
módulos custa mais navegação do que economiza em contenção.

**Quando o domínio ainda não está entendido.** Fronteira errada é pior que
fronteira ausente. Comece plano e extraia módulos conforme os eixos aparecem no
histórico.

**Quando a divisão proposta não corresponde a capacidade real.** Módulos por
entidade ou por camada técnica adicionam cerimônia sem conter mudança.

**Quando o contrato interno acaba expondo tudo.** Um módulo que publica suas
entidades tem o custo da divisão e nenhum benefício.

## Alternativas

- **Pacote plano** — honesto em sistemas pequenos.
- **Camadas como divisão primária** — quando a variação real é técnica.
- **Vertical slice por caso de uso** — divisão ainda mais fina, útil em sistemas
  com muitos casos independentes.
- **Serviços separados** — quando há requisito de implantação ou escala
  independente. Custa muito mais; ver [fronteiras](/02-software-design/boundaries.md).

## Trade-offs

| Módulos por capacidade | Sem módulos |
|---|---|
| Mudança contida | Mudança se espalha |
| Times em paralelo | Conflito constante |
| Extração para serviço viável | Extração inviável |
| Estrutura interna duplicada por módulo | Uma estrutura só |
| Contratos internos a manter | Sem contratos |
| Cooperação entre módulos exige projeto | Chamada direta a qualquer coisa |

## Modos de Falha

**Módulo por entidade.** A capacidade fica espalhada por vários.

**Contrato que expõe entidades.** Acoplamento igual ao de antes.

**Módulo `shared` crescente.** O que não tem dono vai para lá, e ele vira
dependência universal.

**Dependência circular entre módulos.** Ver
[direção de dependência](/02-software-design/dependency-direction.md).

**Módulos que sempre mudam juntos.** A divisão está no eixo errado.

## Erros Comuns

**Dividir por substantivo.** O erro dominante.

**Não impor o contrato.** Sem mecanismo, o módulo vizinho importa a entidade
direto.

**Criar módulos antes de conhecer o domínio.** Ver "quando não usar".

**Achar que módulos exigem microsserviços.** Monolito modular entrega a maior
parte do benefício por uma fração do custo operacional.

## Exemplo Real

Um sistema de logística foi dividido em `Motorista`, `Veiculo`, `Rota` e
`Entrega` — por entidade.

A funcionalidade "reatribuir entrega quando o motorista fica indisponível" tocava
os quatro módulos, e essa era a operação mais frequente do negócio.

A redivisão por capacidade produziu: `planejamento` (quem faz o quê e quando),
`execucao` (o que está acontecendo agora), `cadastro` (dados de motoristas e
veículos) e `faturamento`.

A reatribuição passou a caber inteira em `planejamento`, que mantém sua própria
projeção de disponibilidade de motorista — uma cópia local, atualizada por evento
de `cadastro`.

A cópia local incomodou o time no início: era duplicação de dados. O que ela
comprou foi que `planejamento` deixou de depender de `cadastro` no caminho
crítico, e a operação mais frequente do sistema virou local.

## Como introduzir módulos num sistema existente

Reorganizar um sistema grande de uma vez é caro, arriscado e produz conflitos com
todo o trabalho em andamento. A sequência incremental que funciona:

**Descubra as fronteiras em vez de decidi-las.** Extraia do histórico quais
arquivos mudam juntos. Os agrupamentos que aparecem são candidatos a módulo, e
vêm com evidência.

**Comece pelo módulo mais periférico.** O que tem menos dependências de entrada.
Extraí-lo é mais barato e ensina o padrão ao time com risco baixo.

**Mova sem refatorar.** Primeiro reorganize arquivos e imponha a fronteira;
refatore o interior depois, num commit separado. Misturar as duas coisas produz
revisões impossíveis de avaliar.

**Imponha a fronteira no mesmo commit em que a cria.** Sem o teste de arquitetura,
a fronteira nova é atravessada antes do fim do trimestre.

**Aceite um módulo `legado` transitório.** O que ainda não foi classificado fica
lá, explicitamente, com a regra de que ele pode depender dos módulos novos mas
não o contrário. Isso torna o progresso mensurável — o tamanho de `legado` só
diminui.

## Conceitos Relacionados

- [Modularidade](/01-fundamentals/modularity.md) — o conceito e o critério.
- [Fronteiras](/02-software-design/boundaries.md) — o que separa os módulos.
- [Design de Pacotes](/02-software-design/package-design.md) — a organização dentro de cada um.
- [DDD estratégico](/04-domain-driven-design/index.md) — bounded context como
  formalização da capacidade.

## Exercício Prático

Liste as cinco operações mais frequentes do seu sistema — as que o negócio pede
mudança com mais frequência.

Para cada uma, conte quantos módulos de topo ela toca hoje.

Depois desenhe uma divisão em que cada uma caberia em um módulo. As diferenças
entre as duas divisões apontam onde as fronteiras estão erradas.

## Perguntas de Entrevista

- Por que dividir módulos por entidade costuma falhar?
- O que um módulo deve expor no seu contrato?
- Como dois módulos cooperam sem se acoplar?

## Para Aprofundar

- Parnas, David. *On the Criteria To Be Used in Decomposing Systems into
  Modules*. CACM, 1972.
- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003.
- Tornhill, Adam. *Software Design X-Rays*. Pragmatic Bookshelf, 2018 — medir
  fronteiras pelo histórico.
