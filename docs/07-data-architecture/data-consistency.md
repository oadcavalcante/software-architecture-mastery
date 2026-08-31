---
id: data-consistency
title: Consistência de Dados
sidebar_position: 18
description: A palavra que significa três coisas diferentes — e como saber de qual se está falando.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor distingue consistência de restrição, de isolamento e de
  replicação, e escolhe a garantia por operação.
prerequisites: [transactions]
related: [data-replication, transactions, data-ownership]
canonical_for: [consistência de dados, integridade referencial, reconciliação]
content_version: 1
last_reviewed: 2026-08-27
---

# Consistência de Dados

## Visão Geral

"Consistência" é usada para três coisas diferentes, e a maioria das discussões
confusas sobre o tema vem de duas pessoas usando sentidos distintos.

**Consistência como restrição.** As regras declaradas do modelo valem — o C de
ACID.

**Consistência como isolamento.** Transações concorrentes não se atrapalham.

**Consistência como replicação.** Todas as cópias mostram o mesmo valor.

São problemas independentes, com soluções independentes. Um sistema pode ter as
três, uma, ou nenhuma.

## Problema

A pergunta "esse sistema é consistente?" não tem resposta, porque não especifica
qual sentido.

Um banco relacional de instância única tem consistência de restrição e de
isolamento, e a de replicação não se aplica.

Um sistema replicado pode ter isolamento perfeito em cada nó e mostrar valores
diferentes conforme o nó consultado.

Uma arquitetura de microsserviços pode ter cada serviço internamente consistente e
nenhuma garantia entre eles.

Saber de qual se fala é o pré-requisito de qualquer decisão.

## Conceitos Centrais

### Restrição: a garantia que vale para todos

Chave estrangeira, unicidade, verificação, não-nulo. Declaradas no armazenamento,
valem para toda escrita — inclusive scripts de correção e integrações que ninguém
lembra.

O erro característico é implementar essas regras apenas na aplicação. Funciona
enquanto há um único caminho de escrita, e falha silenciosamente no dia em que
aparece o segundo.

Regra prática: se a regra é sobre o dado, ela pertence ao dado. Se é sobre o
processo, pertence à aplicação.

### Isolamento: dentro de um armazenamento

É o domínio de [transações](/07-data-architecture/transactions.md) e níveis de isolamento.

O ponto relevante aqui: isolamento é uma garantia **local ao armazenamento**. Ele
não diz nada sobre o que acontece entre dois bancos, entre dois serviços, ou entre
o banco e o índice de busca.

### Replicação: entre cópias

É onde [consistência eventual](/06-distributed-systems/eventual-consistency.md)
e [forte](/06-distributed-systems/strong-consistency.md) vivem.

A decisão prática é por operação, não por sistema: ler o saldo antes de debitar
exige consistência forte; listar o histórico tolera atraso.

Sistemas que escolhem uma garantia para tudo ou pagam demais ou arriscam demais.

### Consistência entre serviços não é dada por ninguém

O caso menos discutido e o mais comum na prática.

Quando o pedido está num serviço e o estoque em outro, nenhuma garantia de banco
cobre a relação entre eles. A coerência precisa ser construída — com
[sagas](/06-distributed-systems/sagas.md), com eventos, com reconciliação.

E precisa ser **verificada**, porque toda estratégia falha eventualmente.

### Reconciliação é infraestrutura, não remédio

O controle que quase nunca existe e que deveria: um processo periódico que compara
duas fontes que deveriam concordar e alerta na divergência.

Soma dos itens contra o total do pedido. Contagem no banco contra contagem no
índice de busca. Saldo contra a soma das movimentações.

Sem isso, a divergência é descoberta pelo cliente, por auditoria, ou por acaso —
tipicamente meses depois, quando corrigir é caro e a causa já foi esquecida.

Uma reconciliação custa horas para implementar e é a diferença entre detectar em
um dia e detectar em um ano.

### A garantia se escolhe por operação

O quadro que resume a decisão prática:

```text
operação                          garantia necessária
debitar saldo                     forte, com bloqueio ou operação relativa
reservar estoque                  forte, escopo da partição
listar pedidos do cliente         sessão — leia seus próprios escritos
relatório mensal                  eventual, atraso de horas aceitável
busca no catálogo                 eventual, atraso de minutos
painel executivo                  eventual, com data de atualização visível
```

Nenhuma linha é "consistência do sistema". Todas são decisões de operação.

## Modelo Mental

**"Consistente" é uma pergunta incompleta.** Consistente em qual sentido, para
qual operação, observado por quem?

## Quando Usar

Garantias fortes onde:

- O dado controla recurso finito.
- Uma decisão irreversível depende do valor.
- Há requisito regulatório.
- A invariante envolve mais de um registro.

Garantias fracas com reconciliação onde:

- O atraso é tolerável pelo negócio.
- A operação é reversível ou compensável.
- A escala exige.

## Quando Não Usar

**Consistência forte uniforme.** Paga em tudo para proteger pouco.

**Regras de integridade só na aplicação.**

**Consistência eventual sem reconciliação.** Divergência silenciosa e permanente.

**Consistência eventual sem confirmar com o negócio.** É decisão de produto.

**Presumir garantia entre serviços.** Não existe por padrão.

**Discutir "consistência" sem especificar o sentido.**

## Alternativas

- **[Transação](/07-data-architecture/transactions.md) local** — quando os dados cabem no mesmo
  armazenamento, a garantia sai de graça.
- **Reunir os dados** — a fronteira de serviço pode estar no lugar errado.
- **[Saga](/06-distributed-systems/sagas.md) com compensação.**
- **Reconciliação periódica** — para divergências raras e corrigíveis.
- **Garantias de sessão** — resolvem a percepção do usuário a custo baixo.

## Trade-offs

| Forte | Eventual com reconciliação |
|---|---|
| Sem divergência | Janela de divergência |
| Latência de coordenação | Escrita local |
| Escala limitada | Escala |
| Sem processo extra | Reconciliação a operar |
| Indisponível sob partição | Disponível |

| Restrição no banco | Na aplicação |
|---|---|
| Vale para todo escritor | Só para quem passa pelo código |
| Erro no momento da escrita | Descoberto na leitura |
| Migração precisa tratar | Flexível |

## Modos de Falha

**Divergência silenciosa entre serviços.**

**Referência órfã.** Sem chave estrangeira, apontando para registro apagado.

**Agregado divergente da origem.**

**Índice de busca fora de sincronia.** O registro existe e não aparece na busca.

**Regra de negócio violada por script.** A validação estava só na aplicação.

**Duas telas mostrando números diferentes.** Fontes diferentes, sem reconciliação.

## Erros Comuns

**Não declarar restrições no armazenamento.**

**Não ter reconciliação.**

**Tratar consistência como propriedade global do sistema.**

**Confundir os três sentidos numa mesma discussão.**

**Adotar consistência eventual sem decisão de negócio.**

## Exemplo Real

Uma plataforma de cursos tinha três fontes que deveriam concordar sobre matrículas:
o banco transacional, o índice de busca do catálogo e um agregado de contagem por
turma exibido na interface.

Cada uma era atualizada por um caminho diferente, e nenhuma comparação existia.

Ao longo de dois anos, as divergências se acumularam:

**Índice de busca.** 3.400 matrículas não apareciam na busca — eventos perdidos em
implantações. Alunos relatavam "não encontro meu curso", e o suporte reindexava
caso a caso, sem investigar a causa.

**Contagem por turma.** Divergia em 8% das turmas. Algumas apareciam com vagas
disponíveis estando cheias, gerando matrículas acima do limite.

**Referências órfãs.** 900 matrículas apontando para turmas apagadas — não havia
chave estrangeira, porque a tabela tinha sido criada por uma migração que a
omitiu.

Nenhum desses foi detectado por monitoramento. Todos vieram de reclamação.

As correções, por ordem de retorno:

**Reconciliação diária** comparando as três fontes, com alerta. Meio dia de
trabalho. Passou a detectar em 24 horas o que antes levava meses.

**Chave estrangeira** declarada, depois de limpar os órfãos.

**Contagem calculada sob demanda** para turmas próximas do limite, e o agregado
mantido apenas para exibição aproximada — decisão explícita de qual número é
autoritativo.

**Reindexação completa periódica**, aceitando que eventos se perdem.

O que se registrou depois: a discussão que destravou tudo foi separar os três
sentidos da palavra. Antes disso, as reuniões alternavam entre isolamento de
transação, integridade referencial e sincronia de índice como se fossem o mesmo
problema — e nenhuma decisão saía.

## Conceitos Relacionados

- [Transações](/07-data-architecture/transactions.md) — o sentido de isolamento.
- [Replicação de Dados](/07-data-architecture/data-replication.md) — o sentido de replicação.
- [Consistência](/06-distributed-systems/consistency.md) — o espectro completo.
- [Propriedade do Dado](/07-data-architecture/data-ownership.md) — quem é a fonte autoritativa.

## Exercício Prático

Liste os pares de fontes do seu sistema que deveriam concordar sobre o mesmo fato.
Para cada par, pergunte: existe algo que compara os dois?

Onde não existir, escreva a comparação e rode uma vez. O número que sair é a medida
real da sua consistência.

## Perguntas de Entrevista

- Quais são os três sentidos de "consistência" e por que confundi-los atrapalha?
- Por que restrições pertencem ao armazenamento?
- O que uma reconciliação detecta que o monitoramento não detecta?

## Para Aprofundar

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 —
  capítulos 5 e 7.
- Bailis, Peter et al. *Feral Concurrency Control*. SIGMOD, 2015.
- Helland, Pat. *Life Beyond Distributed Transactions*. CIDR, 2007.
