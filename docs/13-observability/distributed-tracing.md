---
id: distributed-tracing
title: Rastreamento Distribuído
sidebar_position: 4
description: Seguir uma requisição por dezenas de serviços — propagação, amostragem e o custo.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor implementa propagação completa e escolhe estratégia de
  amostragem que preserva o que importa.
prerequisites: [traces]
related: [traces, correlation-ids, telemetry]
canonical_for: [rastreamento distribuído, amostragem de trace, amostragem por cauda]
content_version: 2
last_reviewed: 2026-08-28
---

# Rastreamento Distribuído

## Visão Geral

Rastreamento distribuído é [traces](/13-observability/traces.md) atravessando processos: a requisição
entra num serviço, chama outros, passa por filas, e todo esse caminho forma uma única
árvore.

Dois problemas específicos aparecem quando se atravessa fronteiras: **propagar o
contexto** por todos os saltos, e **amostrar** — porque rastrear tudo é caro demais.

A escolha de amostragem é a decisão mais consequente, e a mais frequentemente feita mal.

## Problema

Numa arquitetura com dezenas de serviços, uma requisição pode gerar centenas de spans.
Com milhares de requisições por segundo, o volume de dados de rastreamento excede o de
qualquer outro sinal.

Rastrear 100% custa caro — coleta, rede, armazenamento, consulta.

Rastrear 1% ao acaso é barato e inútil no momento em que importa: a requisição que
falhou provavelmente não foi amostrada.

A resposta não é escolher entre os dois extremos.

## Conceitos Centrais

### Propagação: o contexto viaja

```text
identificador do trace   o mesmo para toda a operação
identificador do span    o span atual, que vira pai do próximo
decisão de amostragem    se este trace está sendo coletado
```

A terceira parte é essencial e frequentemente esquecida: a decisão precisa ser
**propagada**, não retomada. Se cada serviço decidir independentemente, o resultado são
traces fragmentados — alguns spans coletados, outros não, e a árvore incompleta.

O formato padronizado de propagação — um cabeçalho com estrutura definida — resolveu a
interoperabilidade entre bibliotecas e fornecedores. Usá-lo é a escolha certa.

### Os saltos que quebram

```text
HTTP              cabeçalho — simples, funciona
gRPC              metadados — simples
fila              atributos da mensagem — precisa ser explícito
banco de dados    não propaga — o span termina na chamada
processamento em lote  a relação com a origem se perde
navegador         precisa de instrumentação no cliente
sistema de terceiro    depende de ele suportar
```

A fila é onde a maioria das implementações quebra, e é onde a informação seria mais
valiosa — porque a operação assíncrona é a mais difícil de reconstruir manualmente.

Ver [identificadores de correlação](/13-observability/correlation-ids.md).

E há uma decisão de modelagem em filas: o consumo é um span filho do produtor — o que
produz traces de duração muito longa — ou um trace novo ligado por referência? A segunda
costuma ser mais útil operacionalmente.

### Amostragem: as três estratégias

**Por cabeça.** A decisão é tomada na entrada, antes de saber o que vai acontecer.
Barata, simples, e cega: não sabe se a requisição vai falhar ou ser lenta.

**Por cauda.** A decisão é tomada no fim, depois de conhecer o resultado. Permite manter
100% dos erros e das requisições lentas, e uma fração do resto.

**Adaptativa.** A taxa se ajusta ao volume — rotas raras são amostradas mais, rotas
frequentes menos, preservando cobertura de todas.

A amostragem por cauda é a que resolve o problema real, e ela custa: todos os spans
precisam ser coletados e mantidos temporariamente até a decisão, o que exige um coletor
com memória e a capacidade de reunir spans do mesmo trace vindos de serviços diferentes.

A combinação usual em sistemas maduros: por cabeça com taxa generosa para o volume
comum, mais uma regra que força a coleta de erros e de requisições marcadas.

### Força a coleta quando importa

Independentemente da estratégia, três casos deveriam sempre ser coletados:

```text
erros                    sempre
latência acima do limite sempre
requisição marcada       um cabeçalho que força a coleta
```

O terceiro é a ferramenta de investigação mais útil: permite ao suporte, ou a um teste,
gerar uma requisição rastreada integralmente, sem depender de sorte.

### O custo precisa ser dimensionado

```text
volume de spans = requisições/s × spans por requisição
1.000 req/s × 40 spans = 40.000 spans/s
```

Cada span carrega nome, tempos, atributos e status. Em volume alto, isso é o maior sinal
de telemetria do sistema.

Ver [telemetria](/13-observability/telemetry.md). As alavancas: taxa de amostragem, granularidade de spans,
número de atributos, retenção.

E a retenção pode ser escalonada: traces de erro e lentos por mais tempo, os normais por
menos.

### Sem cobertura completa, o valor cai

Um trace que atravessa oito serviços e para no terceiro — porque o quarto não propaga —
mostra menos do que aparenta: a árvore parece completa e está truncada.

Isso é pior que não ter trace, porque induz conclusões erradas: o tempo "desaparece" no
ponto onde a instrumentação acaba, e a suspeita recai no serviço errado.

A adoção precisa ser coordenada. Instrumentar metade dos serviços entrega bem menos que
metade do valor.

## Modelo Mental

**Propague sempre, amostre com critério.** A decisão de amostragem viaja com o contexto;
a coleta de erros não é opcional.

## Quando Usar

- Arquitetura com múltiplos serviços.
- Investigação de latência distribuída.
- Mapeamento de dependências reais.
- Sistemas herdados sem documentação de fluxo.
- Antes de decompor um monólito — para saber o que chama o quê.

## Quando Não Usar

**Sem propagar a decisão de amostragem.**

**Amostragem aleatória sem forçar erros.**

**Com cobertura parcial**, sem plano de completá-la.

**Em sistema de componente único.**

**Sem dimensionar o custo.**

**Sem instrumentar os saltos por fila**, quando eles existem.

## Alternativas

- **[Identificadores de correlação](/13-observability/correlation-ids.md)** — o subconjunto mínimo, muito
  mais barato, sem estrutura nem tempos.
- **[Logs](/13-observability/logs.md) com duração por etapa** — cobre parte do valor.
- **[Métricas](/13-observability/metrics.md) por par de serviços** — mostra tendência entre componentes,
  sem o individual.
- **Malha de serviço** — instrumenta as chamadas entre serviços sem tocar no código,
  cobrindo as fronteiras. Ver
  [malha de serviço](/08-integration-architecture/service-mesh.md).

A última é uma forma barata de obter cobertura de fronteiras rapidamente, com a
limitação de não enxergar dentro dos serviços.

## Trade-offs

| Amostragem por cauda | Por cabeça |
|---|---|
| Mantém o que importa | Decide às cegas |
| Coletor com memória e estado | Simples |
| Custo de coleta integral | Reduzido desde a origem |

| Taxa alta | Baixa |
|---|---|
| Mais cobertura | Menos custo |
| Encontra o raro | Perde o raro |

## Modos de Falha

**Trace truncado.** Um serviço não propaga.

**Decisão de amostragem retomada.** Traces fragmentados.

**Erro não amostrado.** O caso que importa não foi coletado.

**Custo excedendo o previsto.**

**Cardinalidade de atributos.** Os mesmos problemas de
[métricas](/13-observability/metrics.md), aplicados a spans.

**Coletor saturado.** Spans descartados silenciosamente.

**Relógios divergentes.** Spans de serviços diferentes com tempos inconsistentes. Ver
[relógio e tempo](/06-distributed-systems/clock-and-time.md).

## Erros Comuns

**Não propagar em filas.**

**Não forçar coleta de erros.**

**Instrumentar parcialmente e parar.**

**Não propagar a decisão de amostragem.**

**Não oferecer forma de forçar a coleta** de uma requisição específica.

**Não monitorar spans descartados** pelo coletor.

## Exemplo Real

Uma plataforma de mobilidade instrumentou rastreamento distribuído em 22 serviços, com
amostragem aleatória de 1%.

Durante seis meses, a ferramenta foi considerada inútil pelo time. O motivo apareceu
numa retrospectiva: sempre que alguém investigava um problema específico, o trace
correspondente não existia — porque 99% não eram coletados.

A reformulação:

**Amostragem por cauda**, com regras explícitas: 100% dos erros, 100% acima do percentil
99 de latência, 100% de rotas raras, e 2% do restante.

O custo total ficou próximo do anterior, e a utilidade mudou completamente — os traces
que existiam passaram a ser os que alguém queria ver.

**Cabeçalho de forçar coleta**, usado pelo suporte e pelos testes de integração. Um
cliente que reporta um problema pode ter a próxima tentativa rastreada integralmente.

**Propagação em filas**, que não existia. Três dos 22 serviços eram alcançados apenas
por mensagem, e apareciam desconectados. Com a propagação, a árvore ficou completa.

**Decisão de amostragem propagada.** Antes, cada serviço decidia sozinho — o que
produzia traces com buracos que pareciam problemas de instrumentação.

Dois achados imediatos após a mudança:

**Uma dependência circular.** O serviço de precificação chamava o de rotas, que em certas
condições chamava o de precificação. Existia havia dois anos e explicava picos de
latência que ninguém tinha diagnosticado.

**Relógios divergentes.** Spans de um serviço apareciam com início antes do fim do pai.
A investigação encontrou deriva de até 800 ms em duas instâncias. Ver
[relógio e tempo](/06-distributed-systems/clock-and-time.md).

A lição registrada: a ferramenta estava instalada e correta havia seis meses. A
escolha de amostragem — feita sem discussão, com o valor padrão — a tornava inútil.

## Conceitos Relacionados

- [Traces](/13-observability/traces.md) — os fundamentos.
- [Identificadores de Correlação](/13-observability/correlation-ids.md) — o subconjunto mínimo.
- [Telemetria](/13-observability/telemetry.md) — o custo.
- [Depurabilidade](/13-observability/debuggability.md).

## Exercício Prático

Se você usa rastreamento distribuído, verifique a estratégia de amostragem e pergunte:
os erros são sempre coletados?

Depois pegue uma operação que passe por uma fila e veja se o trace atravessa. Na maioria
das implementações, ele para ali.

## Perguntas de Entrevista

- Por que a decisão de amostragem precisa ser propagada?
- Qual a diferença entre amostragem por cabeça e por cauda, e o que cada uma custa?
- Por que cobertura parcial pode ser pior que nenhuma?

## Para Aprofundar

- Sigelman, Benjamin et al. *Dapper, a Large-Scale Distributed Systems Tracing
  Infrastructure*. Google, 2010.
- W3C Trace Context — o formato de propagação.
- Majors, Charity et al. *Observability Engineering*. O'Reilly, 2022.
