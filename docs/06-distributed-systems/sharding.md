---
id: sharding
title: Sharding
sidebar_position: 15
description: Particionamento em instâncias separadas — e o que muda quando a partição vira um servidor.
doc_type: concept
level: 4
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor distingue sharding de particionamento local e reconhece o
  custo operacional que a separação física adiciona.
prerequisites: [partitioning]
related: [partitioning, replication, database-scaling]
canonical_for: [sharding, shard]
content_version: 1
last_reviewed: 2026-08-27
---

# Sharding

## Visão Geral

Sharding é [particionamento](/06-distributed-systems/partitioning.md) em que cada partição vive numa
**instância separada** de banco, com seus próprios recursos.

A distinção parece sutil e não é: quando a partição vira um servidor, o custo sai
do domínio da modelagem e entra no da operação.

## Problema

Particionamento dentro de uma instância — tabelas particionadas por faixa, por
exemplo — melhora manutenção e alguns padrões de consulta. Não aumenta capacidade:
CPU, memória e disco continuam compartilhados.

Quando o limite de uma instância é atingido, a partição precisa ir para outra
máquina. Aí três coisas mudam.

**A consulta precisa saber onde ir.** Alguém — a aplicação, um roteador, o driver
— precisa mapear chave para instância.

**Junções e transações entre shards deixam de existir** como operação do banco.
O que era `JOIN` vira duas consultas e uma agregação na aplicação.

**Cada shard é um banco a operar.** Backup, monitoramento, atualização,
dimensionamento, failover — multiplicado pelo número de shards.

## Conceitos Centrais

### Onde mora o roteamento

Três lugares, com implicações diferentes:

**Na aplicação.** Ela calcula o shard e conecta ao banco certo. Simples de
começar, e espalha a lógica de mapeamento por todo código que acessa dados.

**Num roteador.** Um proxy que fala o protocolo do banco e encaminha. A aplicação
não sabe que há shards. Adiciona um salto e um componente no caminho crítico.

**No próprio banco.** Bancos distribuídos fazem o roteamento internamente. É o
caminho de menor atrito, e amarra a arquitetura àquele produto.

A primeira é a mais comum em sistemas que evoluíram para sharding, e a que mais
custa manter — porque a decisão de roteamento aparece em dezenas de lugares.

### O diretório de shards

O mapeamento chave-para-shard pode ser:

**Algorítmico.** `hash(chave) mod N`, ou hash consistente. Sem estado, e
rebalancear exige recalcular.

**Por diretório.** Uma tabela que diz onde cada faixa vive. Flexível — permite
mover uma chave específica, dar shard dedicado a um inquilino grande — e adiciona
uma consulta antes de cada acesso, mais um componente que precisa ser altamente
disponível.

O diretório é o que permite tratar desequilíbrio caso a caso, e é o que sistemas
multi-inquilino maduros costumam usar.

### Rebalanceamento é a operação difícil

Adicionar um shard exige mover dados. Durante a movimentação:

As escritas para as chaves em trânsito precisam ir para os dois lugares, ou ser
bloqueadas. As leituras precisam saber qual lado é autoritativo. E o processo
consome banda e recurso dos dois nós.

A técnica que reduz a dor é **shards lógicos**: criar muito mais partições lógicas
que instâncias físicas — 1024 partições em 8 instâncias, por exemplo. Adicionar
uma instância move partições inteiras, sem recalcular chaves.

É a abordagem que praticamente todo sistema particionado moderno adota.

### O shard desequilibrado

Num sistema multi-inquilino, o desequilíbrio é a regra, não a exceção: um cliente
grande pode ter mais dados que mil pequenos.

Isso quebra o particionamento por hash do inquilino — o shard daquele cliente
satura enquanto os outros ficam ociosos.

As saídas: shard dedicado para os grandes, ou particionar internamente os grandes
por uma segunda dimensão. Ambas exigem o diretório.

## Modelo Mental

**Sharding é particionamento que virou problema de operação.** A modelagem é a
mesma; o que muda é que cada partição passa a ter um custo operacional próprio.

## Quando Usar

- O volume de escrita ou de dados excede o que uma instância comporta, medido.
- As alternativas de escala foram esgotadas. Ver
  [estratégias de escalabilidade](/05-system-design/scalability-basics.md).
- Existe uma chave natural pela qual quase todas as operações filtram.
- A equipe consegue operar N bancos em vez de um.

## Quando Não Usar

**Antes de esgotar escala vertical.** Uma instância moderna comporta muito mais do
que a intuição sugere.

**Quando as operações cruzariam shards com frequência.** O custo de agregar na
aplicação supera o ganho.

**Quando transações entre shards são requisito.** Elas viram
[transações distribuídas](/06-distributed-systems/distributed-transactions.md).

**Sem shards lógicos.** Rebalancear com mapeamento direto para instâncias físicas
é significativamente mais doloroso.

**Quando um banco distribuído resolve.** Vários produtos fazem sharding
internamente, e adotar um deles evita construir o roteamento e a operação.

## Alternativas

- **Escala vertical** — o degrau anterior, quase sempre não esgotado.
- **[Replicação](/06-distributed-systems/replication.md)** — se o gargalo é leitura.
- **Arquivamento** — reduzir o volume ativo.
- **Banco distribuído** — delegar o sharding ao produto.
- **Particionamento lógico numa instância** — melhora manutenção sem distribuir.

## Trade-offs

| Com sharding | Instância única |
|---|---|
| Escrita e volume escalam | Limitados |
| Falha isolada por shard | Total |
| Operações entre shards na aplicação | `JOIN` e transação do banco |
| N bancos a operar | Um |
| Rebalanceamento como operação | Nenhuma |
| Roteamento a manter | Nenhum |

## Modos de Falha

**Shard desequilibrado.** Um satura, os outros ociosos.

**Consulta sem a chave.** Vira varredura de todos os shards.

**Rebalanceamento durante pico.** Compete com o tráfego.

**Diretório indisponível.** Sem ele, nenhuma consulta sabe onde ir — ele vira ponto
único de falha e precisa ser replicado.

**Transação entre shards não prevista.** Descoberta quando o requisito aparece.

**Roteamento espalhado.** A lógica de mapeamento em dezenas de lugares, divergindo.

## Erros Comuns

**Shardar antes de precisar.** Adiciona roteamento, impede junção e transação entre partições, e complica toda consulta — custo pago desde o primeiro dia por um limite que talvez nunca chegue.

**Não usar shards lógicos.** Mapear a chave direto para a máquina física amarra o número de partições ao número de servidores, e crescer passa a exigir remapear tudo. Muitas partições lógicas sobre poucas físicas tornam o crescimento uma mudança de tabela de roteamento.

**Ignorar o desequilíbrio de inquilinos.** Particionar por cliente parece natural até o maior cliente sozinho exceder a capacidade de uma partição — e ele não pode ser dividido pela chave escolhida.

**Espalhar o roteamento pela aplicação.** Cada ponto que calcula em qual partição está o dado é um lugar a mudar quando o esquema de partição mudar, e um lugar onde a regra pode divergir.

**Não planejar o rebalanceamento antes de precisar dele.** Quando uma partição satura, mover dados sob carga, sem parar escrita e sem perder consistência, é uma operação que precisa ter sido projetada. Improvisá-la no dia é como se perde dado.

## Exemplo Real

Uma plataforma de comunicação corporativa shardou por `id_da_empresa`, com hash
simples sobre 8 instâncias.

Dois problemas em dezoito meses.

**Desequilíbrio.** Três clientes corporativos grandes caíram no mesmo shard por
coincidência de hash. Esse shard tinha 60% dos dados e saturava enquanto os outros
sete operavam a 15% de utilização.

Com hash simples, a única saída seria mudar o número de shards — o que
redistribuiria todas as chaves.

**Rebalanceamento inviável.** Ao tentar passar de 8 para 16 shards, o cálculo
mostrou que praticamente todos os dados precisariam ser movidos — semanas de
migração com escrita dupla.

A reformulação adotou as duas técnicas que faltavam.

**1024 shards lógicos** mapeados para 8 instâncias por um diretório. Adicionar
instâncias passou a mover shards lógicos inteiros, sem recalcular chave nenhuma.

**Diretório em vez de hash puro.** Isso permitiu mover os três clientes grandes
para instâncias dedicadas, individualmente — algo impossível com mapeamento
algorítmico.

A migração para o novo esquema levou seis semanas. Depois dela, a passagem de 8
para 12 instâncias levou quatro horas.

O detalhe que a equipe destaca: shards lógicos e diretório são decisões que custam pouco
no início e são caras de retrofitar. Ambas estavam na documentação de referência
que ninguém leu antes de implementar.

## Conceitos Relacionados

- [Particionamento](/06-distributed-systems/partitioning.md) — o conceito e a escolha da chave.
- [Replicação](/06-distributed-systems/replication.md) — cada shard precisa das suas réplicas.
- [Hotspots](/11-scalability/index.md) — o desequilíbrio.
- [Escalabilidade de Banco](/11-scalability/index.md).

## Exercício Prático

Se seu sistema é shardado, meça a distribuição: tamanho e taxa de operações por
shard. Uma diferença maior que 3× entre o maior e o menor indica desequilíbrio que
vai piorar.

Se não é, verifique: existe uma chave natural? O que aconteceria com uma consulta
que não a inclui?

## Perguntas de Entrevista

- Qual a diferença entre particionamento e sharding?
- O que são shards lógicos e que problema resolvem?
- Quando um diretório é preferível a mapeamento algorítmico?

## Para Aprofundar

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 —
  capítulo 6.
- Relatos públicos de arquitetura de sharding de plataformas de grande escala —
  os de Slack, Notion e Figma são especialmente detalhados.
