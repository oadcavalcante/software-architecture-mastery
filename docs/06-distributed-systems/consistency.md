---
id: consistency
title: Consistência
sidebar_position: 9
description: O que uma leitura pode observar — um espectro de garantias, não um interruptor.
doc_type: concept
level: 4
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor nomeia a garantia de consistência que cada operação exige
  em vez de tratar o assunto como binário.
prerequisites: [partial-failure]
related: [eventual-consistency, strong-consistency, cap]
canonical_for: [consistência, modelo de consistência, leia-seus-próprios-escritos]
content_version: 1
last_reviewed: 2026-08-27
---

# Consistência

## Visão Geral

Consistência, em sistemas distribuídos, é a garantia sobre **o que uma leitura
pode observar** em relação às escritas que a precederam.

A pergunta "este sistema é consistente?" não tem resposta, porque consistência não
é um interruptor. É um **espectro de garantias**, e cada operação de um sistema
pode exigir uma diferente.

## Problema

Com uma cópia dos dados, a questão não existe: a leitura vê a última escrita.

Com réplicas — e réplicas existem para disponibilidade e para escala — a escrita
chega a elas em momentos diferentes. Uma leitura pode cair numa réplica que ainda
não recebeu.

O usuário altera o próprio nome, a tela recarrega, e o nome antigo aparece. Isso
não é defeito de código: é a consequência de ler de uma réplica atrasada.

A discussão costuma degenerar em "queremos consistência forte" — sem que ninguém
tenha estabelecido **para quais operações**, e sem que o custo em latência e
disponibilidade tenha sido colocado na mesa.

## Conceitos Centrais

### O espectro, do mais forte ao mais fraco

**Linearizabilidade.** O sistema se comporta como se houvesse uma cópia única e
todas as operações acontecessem instantaneamente, numa ordem que respeita o tempo
real. É a garantia mais forte e a mais cara — exige coordenação a cada operação.

**Serializabilidade.** Transações concorrentes produzem o mesmo resultado de alguma
execução sequencial. É sobre transações; linearizabilidade é sobre operações
individuais. As duas juntas dão *strict serializability*.

**Consistência causal.** Operações relacionadas por causa e efeito são vistas na
ordem correta por todos; operações independentes podem ser vistas em ordens
diferentes. É o meio-termo mais útil e o menos conhecido.

**[Consistência eventual](eventual-consistency.md).** Na ausência de novas
escritas, todas as réplicas convergem. Não diz **quando**, e é essa omissão que
precisa ser tratada na aplicação.

### As garantias de sessão

Entre o forte e o eventual há garantias que resolvem a maior parte dos problemas
percebidos pelo usuário, a custo muito menor:

**Leia seus próprios escritos.** Quem escreveu vê o que escreveu. Resolve o caso
do nome que não atualiza — que é a queixa mais comum de consistência eventual.

**Leituras monotônicas.** Uma vez que você viu um valor, não verá um anterior.
Impede o efeito de "o dado apareceu e sumiu" ao alternar entre réplicas.

**Escritas monotônicas.** Suas escritas são aplicadas na ordem em que você as
fez.

Essas três raramente são discutidas e resolvem quase toda a percepção de
inconsistência — porque o usuário nota a própria inconsistência, e tolera a dos
outros.

### Por operação, não por sistema

A decisão correta é por operação:

| Operação | Garantia necessária |
|---|---|
| Débito em conta | Linearizável |
| Reserva de assento único | Linearizável |
| Perfil do usuário após edição | Leia seus próprios escritos |
| Contador de visualizações | Eventual |
| Catálogo de produtos | Eventual, segundos |
| Saldo exibido em extrato | Depende do que o negócio promete |

A última linha é a mais instrutiva: a resposta vem do negócio, não da engenharia.

### Consistência custa latência mesmo sem falha

O ponto que [PACELC](pacelc.md) formaliza e que
[CAP](cap.md) omite: garantir consistência forte exige coordenação entre réplicas,
e coordenação custa idas e voltas de rede.

Isso vale **o tempo todo**, não apenas durante partição. Numa configuração
multi-região, uma escrita linearizável paga a latência entre regiões — dezenas ou
centenas de milissegundos — em toda operação.

Partição é rara. Latência é permanente.

## Modelo Mental

**"Consistente em relação a quê, observado por quem, sob qual atraso aceitável?"**

A pergunta sem esses três complementos não tem resposta.

## Quando Usar

Consistência forte quando:

- O dado controla um recurso finito — estoque, assento, saldo.
- Uma decisão irreversível depende do valor lido.
- Há requisito regulatório de exatidão instantânea.
- O custo de estar errado supera o custo da latência.

## Quando Não Usar

**Como padrão para tudo.** Custa latência em toda operação, e a maior parte dos
dados não precisa.

**Sem perguntar ao negócio.** "Quanto tempo de atraso é aceitável para este dado?"
é pergunta de negócio, e a resposta costuma ser mais generosa do que a engenharia
supõe.

**Quando garantias de sessão resolvem.** "Leia seus próprios escritos" custa
uma fração e elimina a queixa principal.

**Entre bounded contexts.** Consistência forte entre contextos os acopla
transacionalmente e desfaz a fronteira. Ver
[bounded context](../04-domain-driven-design/bounded-context.md).

## Alternativas

- **Garantias de sessão** — o meio-termo subestimado.
- **Consistência causal** — quando a ordem entre operações relacionadas importa,
  mas a ordem global não.
- **Ler da primária para operações críticas** — consistência forte onde importa,
  réplica no resto.
- **Aceitar e reconciliar** — deixar divergir e corrigir por processo.

## Trade-offs

| Consistência forte | Eventual |
|---|---|
| Leitura sempre atual | Pode estar atrasada |
| Coordenação a cada operação | Nenhuma |
| Latência maior, sempre | Menor |
| Indisponível sob partição | Disponível |
| Modelo mental simples | Aplicação precisa tratar |
| Escala de escrita limitada | Escala melhor |

A quinta linha é um custo real e pouco citado: consistência eventual empurra
complexidade para a aplicação, que precisa lidar com dado velho, conflito e
convergência.

## Modos de Falha

**Leitura atrasada após escrita própria.** A queixa mais comum, e a mais fácil de
resolver.

**Dado que aparece e some.** Leituras alternando entre réplicas com atrasos
diferentes.

**Decisão tomada sobre dado velho.** Autorizar uma compra com saldo desatualizado.

**Consistência forte assumida e não fornecida.** O código presume que a leitura vê
a escrita, e o banco está configurado para ler de réplica.

**Atraso de replicação não monitorado.** Ninguém sabe quão velho o dado pode
estar.

## Erros Comuns

**Tratar como binário.**

**Não perguntar ao negócio o atraso aceitável.**

**Não conhecer as garantias que o banco de fato oferece.** O nível de isolamento
configurado raramente é o que o nome sugere.

**Ignorar garantias de sessão.**

**Não medir o atraso de replicação.**

## Exemplo Real

Um sistema de e-commerce migrou leituras para réplicas para aliviar a primária.

Duas classes de reclamação apareceram em uma semana.

**Pedido recém-criado não aparecia** na listagem. O usuário finalizava a compra, ia
para "meus pedidos", e via a lista sem o pedido. Recarregando, às vezes aparecia.

**Estoque vendido além do disponível.** A verificação de disponibilidade lia da
réplica; com atraso de replicação em horário de pico, produtos com uma unidade
foram vendidos até quatro vezes.

As duas causas são a mesma, e as correções foram diferentes.

Para o primeiro caso, a garantia necessária era **leia seus próprios escritos** —
não consistência forte global. A implementação: após uma escrita, as leituras
daquele usuário vão para a primária por um período. Custo baixo, queixa eliminada.

Para o segundo, a garantia necessária era **linearizabilidade**, porque estoque
controla um recurso finito e a decisão é irreversível. A verificação e a reserva
voltaram para a primária, numa transação.

O que a equipe registrou: a migração para réplicas não estava errada — 90% das
leituras continuaram nelas. O erro foi tratar todas as leituras como equivalentes.

E a conversa que mais rendeu foi com o negócio: perguntando o atraso aceitável por
tipo de dado, descobriu-se que catálogo tolerava minutos, avaliações toleravam
horas, e apenas estoque e pedido do próprio usuário precisavam de garantia.

## Conceitos Relacionados

- [Consistência Eventual](eventual-consistency.md) e
  [Forte](strong-consistency.md) — os extremos do espectro.
- [CAP](cap.md) e [PACELC](pacelc.md) — os limites teóricos.
- [Replicação](replication.md) — de onde a divergência vem.
- [Resolução de Conflitos](conflict-resolution.md).

## Exercício Prático

Liste as operações de leitura mais importantes do seu sistema e, para cada uma,
responda: quanto tempo de atraso é aceitável?

Depois verifique de onde cada uma lê hoje, e qual o atraso real de replicação no
pico. A interseção de "não tolera atraso" com "lê de réplica" é o próximo
incidente.

## Perguntas de Entrevista

- Por que "o sistema é consistente?" não tem resposta?
- O que são garantias de sessão e por que resolvem a maior parte das queixas?
- Por que consistência forte custa latência mesmo sem partição?

## Para Aprofundar

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 —
  capítulos 5 e 9.
- Bailis, Peter et al. *Highly Available Transactions*, 2013.
- Viotti, Paolo; Vukolić, Marko. *Consistency in Non-Transactional Distributed
  Storage Systems*. ACM Computing Surveys, 2016 — o mapa completo do espectro.
