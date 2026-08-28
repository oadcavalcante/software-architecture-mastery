---
id: scaling-partitioning
title: Particionamento para Escala
sidebar_position: 5
description: Dividir a escrita em vez de multiplicá-la — a última opção, e a mais difícil de reverter.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor escolhe chave de partição pelo padrão de acesso e reconhece o
  que se perde ao dividir.
prerequisites: [scaling-replication]
related: [scaling-replication, hotspots, database-scaling]
canonical_for: [partição para escala, rebalanceamento, consulta entre partições]
content_version: 1
last_reviewed: 2026-08-28
---

# Particionamento para Escala

## Visão Geral

Particionar é dividir os dados entre nós, de forma que cada um seja responsável por
uma parte.

É a única técnica que **escala escrita**: em vez de replicar toda escrita para todos os
nós, cada escrita vai para um nó só. Ver
[replicação para escala](scaling-replication.md).

E é a mais cara e a mais difícil de reverter. É o último degrau da escada em
[escala de banco de dados](database-scaling.md), e há razões para ele estar no fim.

## Problema

Quando a escrita satura, as opções acabam. Réplicas multiplicam o trabalho de escrita.
Cache não ajuda. Uma máquina maior compra tempo até o teto físico.

Particionar resolve, e muda três coisas de forma permanente:

**A chave de partição vira parte do modelo.** Toda consulta precisa dela, ou vai a
todos os nós.

**Consultas que cruzam partições ficam caras.** O que era uma consulta vira N mais
agregação.

**Transações entre partições deixam de existir** — ou viram coordenação distribuída.
Ver [transações distribuídas](../06-distributed-systems/distributed-transactions.md).

## Conceitos Centrais

### A chave decide tudo, e ela é quase irreversível

A escolha da chave de partição determina o desempenho de todas as consultas futuras. Os
critérios, em ordem:

**A maioria das consultas filtra por ela?** Se não, elas vão a todos os nós.

**Ela distribui uniformemente?** Se não, há [ponto quente](hotspots.md).

**As operações que precisam ser atômicas caem na mesma partição?** Se não, transação
distribuída.

**A cardinalidade é alta o suficiente?** Poucos valores distintos concentram.

Atender aos quatro é raro, e a escolha é um compromisso. O que não é aceitável é
escolher sem analisá-los — porque mudar a chave depois exige reescrever todos os dados.

### As estratégias

**Por intervalo.** Valores próximos ficam juntos. Permite consulta por intervalo, e
concentra escrita quando a chave é crescente — o problema mais comum.

**Por resumo criptográfico.** Distribuição uniforme, e elimina consulta por intervalo.

**Por lista.** Valores discretos — região, tipo de cliente. Simples, e o desequilíbrio
é o que a distribuição natural determinar.

**Composta.** Combina duas dimensões — cliente e período. Costuma ser a resposta quando
nenhuma isolada serve.

Ver [particionamento](../06-distributed-systems/partitioning.md) para os fundamentos.

### Consulta entre partições é o custo escondido

Uma consulta que filtra pela chave vai a um nó. Uma que não filtra vai a todos.

```text
com a chave     1 nó, latência de 1 consulta
sem a chave     N nós, latência da mais lenta, mais agregação
```

E o segundo caso não é apenas mais lento: ele consome capacidade de todos os nós para
uma única requisição, o que anula parte do ganho de escala.

A consequência de projeto: consultas frequentes que não usam a chave precisam de um
**índice secundário global** — que é um armazenamento adicional, particionado por outra
chave, com a consistência entre os dois virando problema.

### Rebalanceamento precisa ser possível

Adicionar nós exige mover dados. A estratégia importa:

**Divisão por número de nós.** Mudar o número de nós remapeia quase tudo. Inviável em
produção.

**Partições fixas em número maior que os nós.** Cada nó detém várias partições; adicionar
um nó move partições inteiras, não registros. É a abordagem que funciona.

**Divisão dinâmica.** Partições que crescem demais se dividem automaticamente.

A primeira parece a mais simples e é a que impede crescer depois. Escolhê-la é um erro
que só aparece quando é caro corrigir.

### O que se perde

Vale enumerar, porque a decisão precisa dos dois lados:

**Transação entre partições.** Operações que tocam duas partições precisam de
[saga](../06-distributed-systems/sagas.md) ou coordenação.

**Junção entre partições.** Deixa de existir no banco; vira código.

**Unicidade global.** Uma restrição de unicidade que não inclui a chave de partição não
pode ser imposta.

**Ordenação global.** Sequências e ordenação total exigem coordenação.

**Simplicidade operacional.** Cópia, restauração, migração de esquema e monitoramento
passam a ser por partição.

O item de unicidade global costuma aparecer tarde: descobre-se que o documento do
cliente precisa ser único, e a partição é por região.

### Particionar a aplicação antes do banco

Uma alternativa frequentemente melhor: separar por domínio, em bancos independentes,
antes de particionar horizontalmente.

Ver [escala de banco de dados](database-scaling.md), degrau 9. A fronteira já existe no
negócio, as consultas que cruzam já são raras, e cada banco escala sozinho.

Muitos casos levados ao particionamento seriam resolvidos assim, com menos custo
permanente.

## Modelo Mental

**Particionar divide a escrita e divide o modelo junto.** É a decisão menos reversível
desta seção.

## Quando Usar

- A escrita saturou e os degraus anteriores foram esgotados.
- O volume de dados excede o que uma máquina comporta.
- Existe uma chave natural pela qual a maioria das consultas filtra.
- As operações atômicas cabem dentro de uma partição.
- O crescimento projetado justifica o custo permanente.

## Quando Não Usar

**Antes de esgotar a escada.**

**Sem chave natural.** Particionar por algo artificial produz consultas entre partições
em tudo.

**Quando dividir por domínio resolve.**

**Com chave de baixa cardinalidade ou sequencial.**

**Sem estratégia de rebalanceamento.**

**Quando transações entre partições seriam frequentes.**

## Alternativas

- **Dividir por domínio** — a alternativa mais frequentemente adequada.
- **[Replicação](scaling-replication.md)** — se o limite é leitura.
- **Arquivar dados frios** — reduz o volume sem dividir.
- **Reduzir a escrita** — agrupar, tornar assíncrona, eliminar a desnecessária.
- **Banco relacional distribuído** — mantém o modelo e distribui, ao custo de latência
  de coordenação.

## Trade-offs

| Particionado | Nó único |
|---|---|
| Escala escrita | Teto do nó |
| Volume ilimitado | Limitado |
| Consulta sem a chave é cara | Uniforme |
| Sem transação entre partições | Transação simples |
| Operação por partição | Uma |
| Irreversível na prática | Flexível |

| Por resumo | Por intervalo |
|---|---|
| Distribuição uniforme | Risco de concentração |
| Sem consulta por intervalo | Possível |
| Sem localidade | Preservada |

## Modos de Falha

**Chave errada.** Consultas em todas as partições.

**Ponto quente.** Uma partição saturada. Ver [pontos quentes](hotspots.md).

**Rebalanceamento inviável.** A estratégia escolhida exige remapear tudo.

**Unicidade impossível.** A restrição precisaria cruzar partições.

**Transação entre partições frequente.** O que deveria ser raro virou rotina.

**Consulta sem a chave em caminho crítico.**

**Operação multiplicada.** Manutenção, cópia e migração agora são N vezes.

## Erros Comuns

**Particionar cedo demais.**

**Escolher a chave sem analisar o padrão de consulta.**

**Chave sequencial.**

**Não planejar rebalanceamento.**

**Não considerar dividir por domínio.**

**Não verificar as restrições de unicidade** antes de decidir a chave.

## Exemplo Real

Uma plataforma de mensageria corporativa particionou o banco de mensagens por
identificador de conversa, com resumo criptográfico.

A escolha foi acertada para o padrão dominante: abrir uma conversa e ler as mensagens
dela — uma partição, uma consulta.

Três problemas apareceram, todos previsíveis:

**Busca global.** A busca por texto em todas as conversas de um usuário precisava
consultar todas as partições. Com 64 partições, cada busca gerava 64 consultas. Era 3%
das requisições e consumia 40% da capacidade.

Resolvido com um índice invertido separado, particionado por usuário — o índice
secundário global que a decisão original não tinha previsto.

**Unicidade de anexo.** Um requisito novo exigia que o mesmo arquivo não fosse
armazenado duas vezes, com deduplicação por resumo do conteúdo. Isso é uma restrição de
unicidade global, impossível de impor com a partição por conversa. Resolvido com uma
tabela de deduplicação separada, particionada por resumo do arquivo.

**Rebalanceamento.** A implementação original mapeava conversa para nó por módulo do
número de nós. Passar de 8 para 12 nós remapearia 75% dos dados. A migração para
partições fixas — 1.024 partições distribuídas entre os nós — levou quatro meses e foi
feita com o sistema no ar.

Esse último foi o mais caro, e era o mais evitável: a estratégia de mapeamento tinha
sido escolhida na primeira semana do projeto, sem discussão.

O que se registrou depois: a chave de partição estava certa e continua certa. O que
faltou foi antecipar as consultas que **não** usam a chave — busca e deduplicação — que
existiam no roteiro de produto e não entraram na análise.

## Conceitos Relacionados

- [Replicação para Escala](scaling-replication.md) — o passo anterior.
- [Pontos Quentes](hotspots.md) — o risco da chave.
- [Escala de Banco de Dados](database-scaling.md) — a escada.
- [Particionamento](../06-distributed-systems/partitioning.md) — os fundamentos.

## Exercício Prático

Se você fosse particionar seu banco hoje, qual seria a chave? Liste as dez consultas
mais frequentes e verifique quantas a usam.

Depois liste as restrições de unicidade e as operações que precisam ser atômicas. As
que não couberem numa partição são o custo da decisão.

## Perguntas de Entrevista

- Por que particionamento é a única técnica que escala escrita?
- Por que a estratégia de rebalanceamento precisa ser decidida no início?
- O que se perde ao particionar, além do custo de implementação?

## Para Aprofundar

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 —
  capítulo 6.
- DeCandia, Giuseppe et al. *Dynamo: Amazon's Highly Available Key-value Store*, 2007.
- Corbett, James et al. *Spanner: Google's Globally-Distributed Database*, 2012.
