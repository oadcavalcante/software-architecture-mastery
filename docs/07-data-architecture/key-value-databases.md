---
id: key-value-databases
title: Bancos Chave-Valor
sidebar_position: 4
description: O modelo mais simples que existe — acesso por chave, vazão altíssima, e nenhuma consulta.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor reconhece as cargas que o modelo serve e evita usá-lo como
  fonte da verdade quando o acesso não é por chave.
prerequisites: [nosql]
related: [document-databases, data-lifecycle, relational-databases]
canonical_for: [chave-valor, armazenamento chave-valor]
content_version: 1
last_reviewed: 2026-08-27
---

# Bancos Chave-Valor

## Visão Geral

Um armazenamento chave-valor faz uma coisa: guarda um valor sob uma chave e o
devolve quando essa chave é pedida.

Não há consulta por conteúdo, não há junção, não há agregação. Essa limitação é o
que permite latência de microssegundos e vazão de milhões de operações por
segundo.

É o modelo mais fácil de escolher corretamente, porque a pergunta é objetiva: **o
acesso é sempre por chave conhecida?**

## Problema

Muita carga de sistema é exatamente isso — sessão de usuário, resultado de cálculo
caro, contador, item de catálogo por identificador, controle de limite de
requisições.

Servir essas cargas de um banco relacional funciona e desperdiça: você paga
otimizador, transação, esquema e junção para fazer uma busca por chave.

Pior, você ocupa a base transacional com carga de altíssima frequência que compete
com a operação real.

## Conceitos Centrais

### A limitação é a feature

Sem consulta por conteúdo, o armazenamento pode particionar por chave sem
coordenação. Sem junção, não há operação que cruze partições.

Isso é o que torna a escala horizontal trivial: dobrar a capacidade é adicionar
nós e redistribuir chaves. Ver
[particionamento](../06-distributed-systems/partitioning.md).

### O desenho da chave é a modelagem inteira

Como só se acessa por chave, a chave precisa carregar tudo que identifica o dado.

```text
sessao:{id_sessao}
usuario:{id_usuario}:preferencias
limite:{id_cliente}:{minuto}
carrinho:{id_usuario}
```

Convenção de prefixo, separador consistente e versionamento no prefixo quando o
formato do valor mudar. Não há renomeação em massa fácil — chaves mal desenhadas
ficam.

### Expiração nativa elimina trabalho

A maioria desses armazenamentos apaga chaves automaticamente ao vencer o prazo.

Isso é mais relevante do que parece: substitui processo de limpeza, tabela de
controle e o risco de crescimento indefinido. Sessões, cache e limites de
requisição ficam corretos sem código.

Ver [ciclo de vida do dado](data-lifecycle.md).

### Em memória ou persistente — decida com clareza

Muitos são primariamente em memória, com persistência opcional. Isso muda o que
você pode guardar ali.

**Se a perda é aceitável** — cache, sessão recuperável — em memória é adequado e
rápido.

**Se a perda não é aceitável**, verifique exatamente o que a configuração garante:
alguns confirmam a escrita antes de persistir, e uma queda perde os últimos
segundos.

Tratar um armazenamento em memória como fonte da verdade sem verificar isso é o
erro mais caro do modelo.

### Operações atômicas cobrem mais do que se espera

Incremento, adição a estrutura, definir-se-ausente. Essas primitivas resolvem
contagem, fila simples, limite de requisição e bloqueio leve sem transação.

Sobre bloqueio distribuído, porém, há uma armadilha conhecida — ver
[locks distribuídos](../06-distributed-systems/distributed-locks.md).

### O valor é opaco

O armazenamento não interpreta o conteúdo. Isso significa que mudar o formato do
valor exige que todo leitor saiba lidar com as versões antigas ainda gravadas.

Incluir a versão do formato dentro do valor, ou no prefixo da chave, custa nada no
início e evita uma migração desagradável.

## Modelo Mental

**Chave-valor troca toda capacidade de consulta por velocidade e escala.** Se você
precisa perguntar algo que não seja "me dê a chave X", é o modelo errado.

## Quando Usar

- O acesso é sempre por chave conhecida.
- Vazão muito alta ou latência muito baixa importam.
- Cache, sessão, limite de requisição, contador, resultado calculado.
- Expiração automática tem valor.
- O valor é lido inteiro.

## Quando Não Usar

**Quando é preciso consultar por conteúdo.** Não é o que ele faz.

**Como fonte da verdade sem verificar a durabilidade.**

**Para dados com relacionamentos.**

**Para agregação ou relatório.**

**Quando o valor é grande e só um pedaço é usado.** Ver
[documentos](document-databases.md).

**Para fila com garantias.** Funciona de forma aproximada e não oferece
reentrega, ordenação nem
[dead-letter](../06-distributed-systems/dead-letter-queues.md).

## Alternativas

- **[Documento](document-databases.md)** — quando há consulta por campo.
- **[Relacional](relational-databases.md)** — quando há relacionamento.
- **Cache local no processo** — quando o dado cabe e a consistência entre
  instâncias não importa; elimina uma ida à rede.
- **Mensageria** — quando a necessidade é fila.

## Trade-offs

| Chave-valor | Documento |
|---|---|
| Só por chave | Consulta por campo |
| Latência mínima | Maior |
| Escala horizontal trivial | Mais complexa |
| Modelagem só na chave | Modelagem de agregado |
| Valor opaco | Estrutura conhecida |

| Em memória | Persistente |
|---|---|
| Microssegundos | Milissegundos |
| Perda possível na queda | Durável |
| Limitado pela memória | Pelo disco |
| Custo por gigabyte alto | Baixo |

## Modos de Falha

**Perda de dados na queda.** A durabilidade não era o que se supunha.

**Chaves sem expiração acumulando.** A memória enche e o armazenamento passa a
despejar dados — inclusive os que importam.

**Chave quente.** Uma chave muito acessada concentra carga num nó.

**Formato de valor incompatível.** Uma implantação muda a serialização e os
valores gravados não são mais legíveis.

**Uso como fila sem garantias.** Mensagens perdidas em falha de consumidor.

**Chave mal desenhada.** Sem prefixo consistente, não há como inventariar nem
expirar por categoria.

## Erros Comuns

**Assumir durabilidade sem verificar a configuração.**

**Não definir expiração** em dados que deveriam expirar.

**Não versionar o formato do valor.**

**Guardar valores grandes** — mover megabytes por chave desperdiça rede e memória.

**Usar como fila.**

**Não monitorar a taxa de despejo.** É o sinal de que o armazenamento está
descartando dados por falta de memória.

## Exemplo Real

Uma plataforma de comércio usava um armazenamento chave-valor em memória para
sessão, cache e carrinho de compras.

Sessão e cache: uso correto — perda aceitável, expiração nativa, acesso por chave.

Carrinho: uso incorreto, e levou catorze meses para aparecer.

Numa reinicialização não planejada do nó, **todos os carrinhos ativos foram
perdidos**. A configuração persistia a cada segundo, mas o nó específico estava com
persistência desativada por uma mudança feita meses antes para reduzir latência —
sem que ninguém relacionasse a mudança ao carrinho.

Prejuízo estimado em uma tarde de vendas interrompidas.

Um segundo problema apareceu na investigação: a taxa de despejo estava alta havia
semanas. Chaves de cache sem expiração enchiam a memória, e o armazenamento
descartava as menos usadas — que às vezes eram carrinhos de clientes que
demoravam a fechar a compra.

Ou seja, carrinhos vinham sumindo em silêncio antes do incidente, e a queixa era
tratada como erro de usuário.

As correções:

**Carrinho migrado para armazenamento durável**, com o chave-valor mantido apenas
como cache de leitura.

**Expiração obrigatória** em toda chave de cache, validada na biblioteca de
acesso.

**Alerta de taxa de despejo**, que não existia.

**Convenção de chave** com prefixo por domínio, permitindo inventariar o que
estava ocupando memória — o que ninguém conseguia responder antes.

A leitura que a equipe faz: a pergunta "o que acontece se este nó reiniciar agora?"
nunca tinha sido feita para o carrinho. Ela teria custado cinco minutos.

## Conceitos Relacionados

- [Bancos de Documentos](document-databases.md) — quando há consulta.
- [Ciclo de Vida do Dado](data-lifecycle.md) — expiração e retenção.
- [Particionamento](../06-distributed-systems/partitioning.md) — como a escala
  funciona.
- [Locks Distribuídos](../06-distributed-systems/distributed-locks.md).

## Exercício Prático

Liste o que está no seu armazenamento chave-valor. Para cada categoria, responda:
o que acontece se esse dado sumir agora?

Onde a resposta for grave, verifique a configuração de durabilidade — não a
documentação do produto, a configuração daquele ambiente.

## Perguntas de Entrevista

- Por que a ausência de consulta é o que permite a escala?
- Como decidir se um dado pode viver em armazenamento em memória?
- O que a taxa de despejo indica?

## Para Aprofundar

- DeCandia, Giuseppe et al. *Dynamo: Amazon's Highly Available Key-value Store*.
  SOSP, 2007.
- Sadalage, Pramod; Fowler, Martin. *NoSQL Distilled*. Addison-Wesley, 2012.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
