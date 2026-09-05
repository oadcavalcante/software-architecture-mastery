---
id: data-replication
title: Replicação de Dados
sidebar_position: 16
description: Cópias do mesmo dado em lugares diferentes — visto pelo ângulo do armazenamento e da operação.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor configura replicação sabendo o que ela protege, o que ela
  não protege e qual atraso o negócio aceita.
prerequisites: [data-architecture]
related: [data-partitioning, data-consistency, olap]
canonical_for: [réplica de leitura, troca de primário, réplica atrasada]
content_version: 3
last_reviewed: 2026-08-27
---

# Replicação de Dados

## Visão Geral

Replicar é manter cópias do mesmo dado em nós diferentes.

Os fundamentos — síncrona e assíncrona, líder e seguidores — estão em
[replicação](/06-distributed-systems/replication.md). Este documento trata do
ângulo operacional: o que a replicação de fato protege, o que ela não protege, e
as decisões que aparecem quando ela está em produção.

A confusão mais cara desta seção é entre replicação e cópia de segurança.

## Problema

Replicação é adotada por três motivos diferentes, e cada um exige configuração
distinta:

**Disponibilidade.** Se o nó primário cai, outro assume.

**Escala de leitura.** Distribuir consultas entre réplicas.

**Proximidade geográfica.** Servir leituras perto do usuário.

Adotar por um motivo e assumir que os outros vêm junto é o erro estrutural. Uma
réplica configurada para escala de leitura pode não servir para assumir como
primário, e vice-versa.

## Conceitos Centrais

### Replicação não é cópia de segurança

A distinção mais importante deste documento.

Replicação copia **tudo**, inclusive o erro. Um `DELETE` sem cláusula de filtro é
replicado em segundos para todas as réplicas. Uma corrupção de dados também.

Cópia de segurança tem histórico: ela permite voltar ao estado de antes do erro.

```text
protege contra              replicação   cópia de segurança
falha de hardware           sim          sim (com tempo de restauração)
falha de datacenter         depende de onde estão as réplicas   depende de onde está
erro humano                 não, se em tempo real; sim, com réplica atrasada
                            e dentro da janela dela      sim
corrupção lógica            não          sim
ataque com apagamento       não          sim, se isolada
```

Times que confiam em replicação como proteção de dados descobrem a diferença no
pior momento possível.

### O atraso é a métrica operacional central

Toda replicação assíncrona tem atraso, e ele não é constante. Ver
[consistência eventual](/06-distributed-systems/eventual-consistency.md).

Três coisas que fazem o atraso disparar: carga de escrita alta, transação longa no
primário, e reconstrução de índice na réplica.

Monitorar o atraso é obrigatório, e a métrica precisa ser em segundos de
defasagem, não em bytes pendentes — bytes não dizem nada ao negócio.

### Ler da réplica exige decidir o que tolera atraso

O padrão que funciona é classificar as leituras:

```text
leitura crítica            primário  — saldo antes de debitar
leitura do próprio usuário primário por N segundos após escrever
leitura geral              réplica
relatório                  réplica, ou réplica dedicada
```

A segunda linha é a que elimina a maior parte das queixas. Ver
[consistência eventual](/06-distributed-systems/eventual-consistency.md).

E há um detalhe operacional que morde: relatórios pesados numa réplica compartilhada
aumentam o atraso dela para todo mundo. Réplica de relatório deve ser dedicada.

### Troca de primário é onde tudo dá errado

O momento mais arriscado da vida de um sistema replicado.

**Perda de escritas.** Com replicação assíncrona, o que o primário confirmou e não
replicou se perde ao promover outra réplica.

**Cérebro dividido.** O primário antigo volta e ainda se considera primário. Duas
fontes aceitando escrita. Ver
[eleição de líder](/06-distributed-systems/leader-election.md).

**Cache inconsistente.** A aplicação continua apontando para o endereço antigo.

**Sequências divergentes.** Contadores de identificador podem repetir valores.

A troca precisa ser testada. Uma troca nunca exercitada não é um plano — é uma
esperança.

### Replicação atrasada de propósito

Uma réplica configurada para ficar deliberadamente uma hora atrás do primário.

Ela não serve para leitura nem para assumir. Serve para uma coisa: quando alguém
executa um comando destrutivo, há uma hora para perceber e extrair os dados antes
que a exclusão chegue ali.

É barato e cobre exatamente o caso que replicação normal não cobre.

### Múltiplos primários exige plano de conflito

Aceitar escrita em mais de um nó traz
[conflitos](/06-distributed-systems/conflict-resolution.md), e a resolução
padrão descarta dados em silêncio.

A pergunta antes de adotar: cada dado pode ter um dono único por região? Se puder,
o particionamento resolve sem conflito.

## Modelo Mental

**Replicação em tempo real protege contra falha de máquina, não contra erro humano** — ela
propaga o comando destrutivo com a mesma fidelidade com que propaga o resto. A exceção é a
réplica atrasada, que é replicação usada como janela de arrependimento. As duas proteções são
necessárias e não se substituem.

## Quando Usar

- Alta disponibilidade do armazenamento.
- Escala de leitura.
- Separar carga analítica da transacional.
- Proximidade geográfica para leitura.
- Réplica atrasada como rede de segurança contra erro humano.

## Quando Não Usar

**Como substituto de cópia de segurança.**

**Para escalar escrita.** Replicação não ajuda; ver
[particionamento](/07-data-architecture/data-partitioning.md).

**Ler de réplica em operação crítica.**

**Réplica compartilhada para relatório pesado.**

**Múltiplos primários sem estratégia de conflito.**

**Sem monitorar o atraso.**

**Sem testar a troca de primário.**

## Alternativas

- **Cópia de segurança com restauração testada** — para erro humano e corrupção.
- **[Particionamento](/07-data-architecture/data-partitioning.md)** — para escala de escrita.
- **Cache** — para reduzir leitura sem replicar.
- **[CQRS distribuído](/06-distributed-systems/distributed-cqrs.md)** — projeção com modelo
  próprio em vez de cópia idêntica.

## Trade-offs

| Síncrona | Assíncrona |
|---|---|
| Sem perda na troca | Perde o não replicado |
| Latência de escrita maior | Menor |
| Réplica lenta trava a escrita | Não afeta |
| Réplica sempre atual | Atrasada |

| Mais réplicas | Menos |
|---|---|
| Mais capacidade de leitura | Menos |
| Mais tolerância a falha | Menos |
| Custo e operação | Simplicidade |
| Mais atraso a monitorar | Menos |

## Modos de Falha

**Erro humano replicado.** O apagamento chega a todas as cópias.

**Atraso crescendo sem alerta.**

**Perda de escritas na troca.**

**Cérebro dividido.**

**Réplica silenciosamente parada.** Continua respondendo leituras de dados
congelados.

**Restauração nunca testada.** A cópia existe e não se sabe se funciona.

O quinto é particularmente perigoso: uma réplica parada não erra — ela responde
dados velhos como se fossem atuais.

## Erros Comuns

**Tratar replicação como cópia de segurança.** A réplica reproduz fielmente o `DELETE` errado, em segundos. Ela protege contra perda de máquina, não contra erro humano nem corrupção lógica.

**Não monitorar atraso.** O atraso de replicação varia com a carga de escrita. Sem medi-lo, ninguém percebe quando a leitura de réplica passa a devolver dado de minutos atrás em vez de milissegundos.

**Não testar troca de primário.** É o procedimento que só é executado durante incidente. Um mecanismo nunca exercitado falha justamente na primeira vez em que é necessário.

**Não testar restauração de cópia.** Backup não verificado é hipótese. O que importa é o tempo de restauração medido e a integridade do que volta, não a existência do arquivo.

**Relatório em réplica compartilhada.** Uma consulta analítica pesada segura recursos e faz o atraso da réplica crescer, degradando as leituras operacionais que dependiam dela.

**Ler de réplica sem classificar as leituras.** Nem toda leitura tolera dado atrasado. Mandar tudo para a réplica faz o usuário salvar uma alteração e não vê-la ao recarregar — que ele reporta como perda de dado.

## Exemplo Real

Uma empresa de serviços financeiros tinha o banco replicado em três nós, com cópia
de segurança diária.

Numa manhã, uma migração com defeito apagou uma coluna de 2 milhões de registros —
não o dado inteiro, apenas um campo, substituído por nulo.

A replicação propagou em 4 segundos. As três réplicas ficaram idênticas ao
primário, todas erradas.

A cópia de segurança da noite anterior existia. E a restauração completa levava 6
horas e voltaria o sistema inteiro, descartando 9 horas de transações legítimas.

O que salvou foi algo criado por outro motivo: uma réplica atrasada de uma hora,
configurada meses antes para investigar um problema de desempenho e nunca
removida.

Ela ainda tinha a coluna intacta. Os dados foram extraídos e aplicados
seletivamente, sem tocar nas transações do dia. Tempo total: 40 minutos.

Depois do incidente, três mudanças:

**Réplica atrasada oficializada**, de uma hora, com propósito documentado.

**Restauração testada mensalmente**, em ambiente separado, com tempo medido. A
primeira execução revelou que o procedimento documentado estava desatualizado e
não funcionava como escrito.

**Migrações destrutivas** passaram a exigir cópia da tabela afetada antes, e
aprovação de segunda pessoa.

A leitura que a equipe faz: a proteção que funcionou existia por acidente. Ninguém
tinha desenhado defesa contra erro humano — a conversa sobre resiliência de dados
tinha se esgotado em "temos três réplicas".

## Conceitos Relacionados

- [Replicação](/06-distributed-systems/replication.md) — os fundamentos.
- [Particionamento de Dados](/07-data-architecture/data-partitioning.md) — para escala de escrita.
- [Consistência de Dados](/07-data-architecture/data-consistency.md).
- [Consistência Eventual](/06-distributed-systems/eventual-consistency.md).

## Exercício Prático

Responda três perguntas sobre o seu banco: quando a restauração de cópia foi
testada pela última vez; quando a troca de primário foi exercitada; e o que
acontece se alguém executar um comando destrutivo agora.

Se as duas primeiras forem "nunca", elas são o trabalho mais urgente desta seção.

## Perguntas de Entrevista

- Por que replicação não substitui cópia de segurança?
- O que pode dar errado numa troca de primário?
- Para que serve uma réplica deliberadamente atrasada?

## Para Aprofundar

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 —
  capítulo 5.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
- Botros, Silvia; Tinley, Jeremy. *High Performance MySQL*. 4ª ed. O'Reilly, 2021.
