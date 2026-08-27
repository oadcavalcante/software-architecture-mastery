---
id: boundaries
title: Fronteiras
sidebar_position: 7
description: Onde traçar as linhas que o código não atravessa — e o que torna uma linha real.
doc_type: concept
level: 2
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor escolhe onde traçar fronteiras a partir do eixo de mudança
  e do custo de atravessá-las, e sabe qual mecanismo torna cada uma efetiva.
prerequisites: [interfaces]
related: [layering, modular-design, dependency-direction]
canonical_for: [fronteira, fronteira arquitetural, boundary]
content_version: 1
last_reviewed: 2026-08-26
---

# Fronteiras

## Visão Geral

Uma fronteira é uma linha que separa duas partes do sistema, com uma regra sobre
o que pode atravessá-la e em que direção.

Fronteiras são o instrumento central do design estrutural. Elas determinam o que
pode ser mudado sem afetar o resto, o que pode ser testado isoladamente, e onde a
falha para de se propagar.

## Problema

Todo sistema tem fronteiras. A questão é se foram decididas ou se emergiram.

Fronteiras emergentes são as piores possíveis, porque acompanham o acidente
histórico: onde o primeiro desenvolvedor colocou o arquivo, qual módulo estava
aberto quando a funcionalidade foi pedida, qual pessoa tinha tempo naquela
semana.

Mas a decisão consciente também erra, e de duas formas simétricas.

**Fronteiras demais.** Cada uma tem custo: um contrato a manter, uma indireção a
navegar, uma tradução de tipos, um lugar a mais onde o fluxo se interrompe. Um
sistema com quinze fronteiras onde três bastariam paga esse custo quinze vezes.

**Fronteiras no eixo errado.** Pior que ausência. Uma fronteira que corta
perpendicularmente ao eixo de mudança faz com que toda alteração de negócio
precise atravessá-la — e atravessar custa coordenação, tradução e, quando envolve
times diferentes, negociação.

## Conceitos Centrais

### O critério é o eixo de mudança

Igual ao de [modularidade](../01-fundamentals/modularity.md) e
[coesão](../01-fundamentals/cohesion.md): coisas que mudam pela mesma razão ficam
do mesmo lado.

A verificação é empírica e barata. Olhe o histórico: se a maioria dos commits
atravessa a fronteira, ela está no lugar errado. Se poucos atravessam, ela está
capturando uma separação real.

### Fronteira tem direção

Uma fronteira não é simétrica. Além de separar, ela declara quem pode conhecer
quem.

A regra que vale quase sempre: **a dependência aponta na direção da
estabilidade.** O lado que muda menos é conhecido pelo que muda mais, e não o
contrário. É o assunto de
[direção de dependência](dependency-direction.md).

### Os níveis e seus custos

A mesma decisão de fronteira aparece em escalas diferentes, com custos que crescem
por ordens de grandeza:

| Nível | Mecanismo | Custo de atravessar |
|---|---|---|
| Função | Assinatura | Nenhum |
| Classe | Visibilidade | Nenhum |
| Módulo | Módulo de linguagem, teste de arquitetura | Compilação, disciplina |
| Pacote / biblioteca | Versionamento | Release, compatibilidade |
| Processo / serviço | Rede | Latência, falha parcial, serialização, operação |
| Sistema / organização | Contrato formal | Negociação entre times |

Subir de nível sem necessidade é a origem mais comum de complexidade acidental em
sistemas distribuídos. Uma fronteira de módulo mal desenhada custa refatoração;
a mesma fronteira mal desenhada entre serviços custa meses.

**Escolha o nível mais baixo que resolve o problema.** É quase sempre mais baixo
do que a proposta inicial sugere.

### O que atravessa importa

Uma fronteira que deixa passar o tipo interno de um lado não é fronteira. Se o
módulo de pedidos recebe a entidade de persistência do módulo de clientes, os dois
estão acoplados à mesma decisão de esquema.

O que atravessa deve ser o mínimo, e deve pertencer ao contrato — não à
implementação de nenhum dos lados. Frequentemente isso significa um tipo próprio
da fronteira, e a tradução em cada extremo. Parece cerimônia até a primeira vez
em que um lado muda sozinho.

### Nominal versus efetiva

Uma fronteira que depende de lembrança será atravessada. Ver
[arquitetura vs. implementação](../01-fundamentals/architecture-vs-implementation.md):
a lista de mecanismos, de convenção documentada até separação de processo, é uma
escala de força, e revisão de código está no meio dela — não no topo.

## Modelo Mental

**Uma fronteira é uma promessa sobre o que não vai mudar.** Se ela não pode ser
verificada, não é promessa — é intenção.

## Quando Usar

- Quando duas partes mudam por razões independentes e em ritmos diferentes.
- Quando pessoas ou times diferentes trabalham nos dois lados.
- Quando uma parte precisa ser substituída, testada ou implantada isoladamente.
- Quando uma parte tem requisito de qualidade distinto — precisa escalar ou
  falhar separadamente.
- Quando é preciso conter a propagação de uma falha.

## Quando Não Usar

**Quando os dois lados sempre mudam juntos.** A fronteira vira imposto sobre
toda alteração, sem nenhum benefício.

**Quando o domínio ainda não está entendido.** Fronteira errada é mais cara que
fronteira ausente, e um domínio novo não revela seus eixos de mudança em poucos
meses. Comece com separações fracas e endureça o que se provar estável.

**Num nível mais alto do que o necessário.** Separar em serviços o que poderia ser
módulos troca uma chamada de função por rede, serialização, falha parcial e mais
um pipeline de implantação — para obter, na maior parte dos casos, o mesmo
isolamento lógico.

**Quando o custo de tradução excede o benefício.** Se manter a fronteira exige
converter tipos em cada travessia e as travessias são frequentes, ou a fronteira
está no eixo errado ou não deveria existir.

**Por simetria estética.** Fronteiras criadas para que "cada camada tenha a sua"
adicionam custo sem capturar nenhuma separação real.

## Alternativas

- **Convenção sem imposição** — mais barata, adequada em times pequenos e
  estáveis; degrada com rotatividade.
- **Fronteira interna sem separação física** — módulos no mesmo processo, com
  contrato explícito. Resolve a maior parte dos casos pelo menor custo.
- **Acoplamento aceito e concentrado** — em vez de separar, reunir a dependência
  num ponto único, para que a mudança futura tenha um lugar só.

## Trade-offs

O eixo é **isolamento versus custo de travessia**.

| Mais fronteiras | Menos fronteiras |
|---|---|
| Mudança contida de um lado | Mudança se espalha |
| Partes substituíveis e testáveis | Substituição toca tudo |
| Times trabalham em paralelo | Conflito e coordenação |
| Falha contida | Falha propaga |
| Contratos a manter e versionar | Sem contrato |
| Tradução de tipos em cada travessia | Fluxo direto |
| Fluxo difícil de seguir inteiro | Legível de ponta a ponta |

## Modos de Falha

**Fronteira vazada.** O tipo interno de um lado atravessa. Os dois passam a
depender da mesma decisão de estrutura.

**Fronteira no eixo errado.** Toda mudança de negócio atravessa. O sintoma é o
pull request que sempre toca os dois lados.

**Fronteira nominal.** Existe no diagrama e nada a impõe.

**Fronteira no nível alto demais.** Dois serviços que sempre são implantados
juntos e cuja indisponibilidade de um torna o outro inútil. São um serviço com
custo de dois.

**Fronteira que ninguém consegue explicar.** Herdada, atravessada por exceções
acumuladas, mantida por medo.

## Erros Comuns

**Traçar fronteiras por camada técnica.** Controladores de um lado, repositórios
do outro. Corta perpendicular ao eixo de mudança.

**Confiar em diretório como fronteira.** Sem mecanismo, é organização visual.

**Escolher o nível pelo que soa moderno.** Serviço separado é uma decisão de
operação, não de organização de código.

**Deixar passar o tipo do ORM ou do framework.** O vazamento mais comum.

**Não medir travessias.** O histórico de commits diz se a fronteira está no lugar
certo, e quase ninguém consulta.

## Exemplo Real

Um sistema de reservas foi dividido em `Reserva`, `Pagamento` e `Notificacao`,
cada um um serviço, com APIs REST entre eles.

Depois de um ano, a medição mostrou: 87% das alterações em `Reserva` exigiam
alteração correspondente em `Pagamento`, no mesmo ciclo. Os dois eram implantados
juntos. A indisponibilidade de `Pagamento` tornava `Reserva` inútil.

A fronteira entre os dois estava no eixo errado **e** no nível alto demais. Custo
pago: dois pipelines, autenticação entre serviços, tratamento de falha parcial,
tradução de tipos em cada chamada — para separar duas coisas que eram uma.

`Notificacao` era diferente: 4% de alterações conjuntas, e sua indisponibilidade
degradava o sistema sem derrubá-lo.

A correção foi juntar `Reserva` e `Pagamento` num serviço, mantendo a fronteira
entre eles como módulos com teste de arquitetura. `Notificacao` continuou
separada e, um ano depois, virou assíncrona — o que só foi possível porque a
fronteira ali era real.

Duas fronteiras propostas juntas, com a mesma justificativa. Uma estava certa.

## Conceitos Relacionados

- [Modularidade](../01-fundamentals/modularity.md) — a estrutura resultante.
- [Direção de Dependência](dependency-direction.md) — o lado que a fronteira
  permite conhecer.
- [Camadas](layering.md) — um arranjo específico de fronteiras.
- [Arquitetura vs. Implementação](../01-fundamentals/architecture-vs-implementation.md)
  — como impor.

## Exercício Prático

Escolha duas fronteiras do seu sistema. Para cada uma, meça no histórico dos
últimos seis meses: que fração dos commits atravessa?

Depois responda: qual mecanismo impõe cada fronteira? Se a resposta for
"convenção", conte quantas violações existem hoje.

A combinação de alta travessia com imposição fraca é o pior quadrante, e é onde
a maioria dos sistemas está.

## Perguntas de Entrevista

- Como você decide onde traçar uma fronteira?
- Como escolhe o nível — módulo, pacote, serviço?
- O que torna uma fronteira efetiva em vez de nominal?

## Para Aprofundar

- Martin, Robert C. *Clean Architecture*. Prentice Hall, 2017 — a parte sobre
  fronteiras e seus custos.
- Parnas, David. *On the Criteria To Be Used in Decomposing Systems into
  Modules*. CACM, 1972.
- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003 — bounded context
  como fronteira de modelo.
