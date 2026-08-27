---
id: partitioning
title: Particionamento
sidebar_position: 14
description: Dividir os dados entre nós — a única forma de escalar escrita, e a mais difícil de reverter.
doc_type: concept
level: 4
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor escolhe estratégia e chave de particionamento sabendo o
  que fica caro depois.
prerequisites: [replication]
related: [sharding, hotspots, replication]
canonical_for: [particionamento, chave de partição]
content_version: 1
last_reviewed: 2026-08-27
---

# Particionamento

## Visão Geral

Particionamento divide os dados em subconjuntos disjuntos, cada um vivendo num nó
diferente.

Ele existe por uma razão que [replicação](replication.md) não resolve: **escalar
escrita**. Réplicas multiplicam capacidade de leitura; para escrita, cada réplica
recebe tudo.

E ele é a decisão de dados mais difícil de reverter, porque a escolha da chave
determina o que fica barato e o que fica caro — permanentemente.

## Problema

Uma instância tem limite: de armazenamento, de memória, de taxa de escrita.
Quando ele é atingido, adicionar réplicas não ajuda — todas recebem as mesmas
escritas.

Particionar resolve: cada nó recebe uma fração das escritas e guarda uma fração dos
dados.

O custo aparece imediatamente: **operações que atravessam partições ficam caras**.
Uma consulta que precisa de dados de várias partições vira uma consulta por
partição mais uma agregação. Uma transação que toca duas partições vira uma
transação distribuída.

A escolha da chave decide quais operações atravessam — e é por isso que ela é a
decisão, não o mecanismo.

## Conceitos Centrais

### As estratégias

**Por faixa.** Chaves ordenadas divididas em intervalos: A–F numa partição, G–M em
outra.

Consulta por intervalo é eficiente — os dados vizinhos estão juntos. E a
distribuição fica desigual se os dados não forem uniformes: particionar por data
concentra toda a escrita na partição do período atual.

**Por hash.** A chave passa por uma função de hash e o resultado determina a
partição.

Distribuição uniforme, e consulta por intervalo perde: chaves vizinhas caem em
partições diferentes, e a consulta precisa varrer todas.

**Híbrida.** Hash num componente e faixa em outro — por exemplo, hash do
identificador do cliente e faixa por data dentro dele. Preserva consulta por
intervalo **dentro** de um cliente e distribui entre clientes.

A híbrida é frequentemente a resposta certa em sistemas de negócio, e a menos
considerada.

### A chave decide tudo

A escolha da chave de partição determina três coisas de uma vez:

**O que fica local.** Operações que envolvem apenas uma chave são rápidas.

**O que fica caro.** Operações que cruzam chaves exigem coordenação.

**Como a carga distribui.** Uma chave com muito mais atividade concentra carga —
o [hotspot](../11-scalability/index.md).

O critério: **particione pela dimensão que a maioria das operações usa para
filtrar**. Num sistema multi-inquilino, tipicamente o inquilino; num sistema de
usuário, o usuário.

### Repartitionar é caro

Mudar a chave de partição exige mover praticamente todos os dados. Num sistema em
produção com volume, isso é um projeto de meses com período de convivência.

Essa assimetria — barato de decidir, caro de mudar — recomenda duas coisas:
adiar o particionamento até que ele seja necessário, e quando for, gastar tempo
na escolha da chave.

### Hash consistente reduz o custo de crescer

Com hash simples — `hash(chave) mod N` — adicionar um nó muda o destino de quase
todas as chaves.

Hash consistente organiza as chaves e os nós num anel: adicionar um nó move apenas
as chaves entre ele e o vizinho — cerca de `1/N` do total.

É o que torna o crescimento operacionalmente viável, e é usado por praticamente
todo sistema particionado moderno.

### Particionamento e replicação são ortogonais

Confundi-los é comum. **Particionamento** divide os dados; **replicação** copia
cada partição.

Sistemas reais fazem os dois: cada partição tem suas réplicas, para que a perda de
um nó não signifique perda daquela fração dos dados.

## Modelo Mental

**Particionar é escolher o que fica junto.** Tudo o que precisa ser consultado ou
alterado junto deve compartilhar a chave.

## Quando Usar

- O volume de escrita excede a capacidade de um nó, comprovadamente.
- O volume de dados não cabe numa instância.
- Existe uma dimensão natural pela qual a maioria das operações filtra.
- As operações que cruzariam partições são raras.

## Quando Não Usar

**Antes de esgotar as alternativas.** Ver
[estratégias de escalabilidade](../05-system-design/scalability-basics.md):
otimizar, escalar vertical e cachear vêm antes.

**Quando não há dimensão natural.** Se as operações filtram por dimensões
diferentes conforme o caso, qualquer chave torna metade delas cara.

**Quando muitas operações cruzariam partições.** O custo de coordenação supera o
ganho.

**Quando a distribuição seria desigual.** Particionar por uma chave com hotspot
não distribui carga.

**Quando transações entre partições são requisito.** Elas viram
[transações distribuídas](distributed-transactions.md), com o custo
correspondente.

## Alternativas

- **Escala vertical** — mais alta do que se supõe, e sem custo estrutural.
- **[Replicação](replication.md)** — se o gargalo é leitura.
- **Arquivamento** — mover dados antigos para armazenamento mais barato reduz o
  volume ativo, frequentemente o suficiente.
- **Particionamento lógico no mesmo nó** — tabelas particionadas por faixa dentro
  de uma instância, o que melhora manutenção sem distribuir.

## Trade-offs

| Particionado | Instância única |
|---|---|
| Escrita escala | Limitada por um nó |
| Volume ilimitado na prática | Limitado |
| Operações entre partições caras | Todas locais |
| Transação entre partições é distribuída | Local |
| Rebalanceamento a operar | Nada |
| Chave difícil de mudar | Sem chave |

## Modos de Falha

**Hotspot.** Uma partição recebe carga desproporcional.

**Chave errada descoberta tarde.** Repartitionar é projeto de meses.

**Operação entre partições no caminho crítico.** Latência somada de várias
partições.

**Rebalanceamento durante pico.** Movimentação de dados competindo com tráfego.

**Consulta sem a chave.** Ela vira varredura de todas as partições — o modo de
falha de desempenho mais comum em sistemas particionados.

## Erros Comuns

**Particionar cedo demais.**

**Escolher a chave sem analisar as consultas.**

**Não considerar a distribuição real dos dados.** Uma chave uniforme em teoria pode
ser concentrada na prática.

**Usar hash simples em vez de consistente.**

**Não medir a distribuição depois.** A carga pode desequilibrar com o tempo.

## Exemplo Real

Uma plataforma multi-inquilino de gestão escolar particionou por
`id_do_aluno`, escolha feita porque aluno era a entidade mais numerosa.

Funcionou para consultas de aluno. Quebrou para tudo o mais.

A operação mais frequente do sistema era "listar alunos de uma turma" — e alunos
da mesma turma estavam espalhados por todas as partições. Cada listagem consultava
as 16 partições e agregava.

Relatórios por escola atravessavam tudo. Matrícula em lote virava transação
distribuída.

E havia um desequilíbrio que ninguém previu: três escolas grandes respondiam por
40% dos alunos, mas como a chave era o aluno, isso não concentrava — o que
mascarou o problema real, que era o número de operações cruzando partições, não a
distribuição.

A repartição para `id_da_escola` levou cinco meses, com período de escrita dupla e
migração incremental.

Depois: listagem de turma, relatórios e matrícula em lote passaram a ser locais a
uma partição. As operações que cruzam partições viraram raras — apenas
consolidações administrativas, executadas fora do horário.

O desequilíbrio das três escolas grandes passou a existir e foi tratado com
partições dedicadas para elas.

O que a equipe registrou: a chave certa não era a entidade mais numerosa. Era a
dimensão pela qual as operações filtravam — e essa informação estava no log de
consultas desde o primeiro dia.

## Conceitos Relacionados

- [Sharding](sharding.md) — o caso de partições em instâncias separadas.
- [Hotspots](../11-scalability/index.md) — o desequilíbrio da carga.
- [Replicação](replication.md) — ortogonal e complementar.
- [Escalabilidade](../11-scalability/index.md).

## Exercício Prático

Se seu sistema é particionado, meça a distribuição de carga entre partições. Se
não é, analise o log de consultas: por qual dimensão a maioria filtra?

Essa dimensão é a candidata a chave — e descobri-la antes de precisar é o que
torna a decisão barata.

## Perguntas de Entrevista

- Por que replicação não resolve escala de escrita?
- Como escolher a chave de particionamento?
- O que hash consistente resolve?

## Para Aprofundar

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 —
  capítulo 6.
- Karger, David et al. *Consistent Hashing and Random Trees*. STOC, 1997.
