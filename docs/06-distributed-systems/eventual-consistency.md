---
id: eventual-consistency
title: Consistência Eventual
sidebar_position: 31
description: As réplicas convergem — e a garantia não diz quando, que é exatamente o que a aplicação precisa saber.
doc_type: concept
level: 4
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor projeta interfaces e processos que toleram dado velho, e
  negocia o atraso aceitável com o negócio.
prerequisites: [consistency]
related: [strong-consistency, conflict-resolution, replication]
canonical_for: [consistência eventual]
content_version: 1
last_reviewed: 2026-08-27
---

# Consistência Eventual

## Visão Geral

Consistência eventual garante que, **na ausência de novas escritas**, todas as
réplicas acabam convergindo para o mesmo valor.

As duas partes que o enunciado não cobre são as que importam na prática: ele não
diz **quando**, e a condição "ausência de novas escritas" nunca ocorre em sistemas
reais.

Isso não invalida a garantia. Significa que a aplicação precisa ser projetada para
observar dado velho — e essa é a parte que costuma ser esquecida.

## Problema

Consistência eventual é frequentemente adotada como consequência técnica —
replicação assíncrona, cache, projeção de leitura — sem que ninguém tenha decidido
que o negócio a aceita.

O resultado é previsível. O usuário altera algo e não vê. Um relatório mostra
número diferente da tela. Duas telas do mesmo sistema discordam.

Nenhum desses é defeito de código. São a semântica escolhida — só que ninguém
escolheu conscientemente, e o suporte descobre pelos chamados.

## Conceitos Centrais

### A garantia é fraca de propósito

Ela não promete prazo. Um sistema que converge em 100 ms e outro que converge em 6
horas ambos satisfazem "consistência eventual".

Por isso a métrica operacional relevante não é a garantia — é o **atraso de
convergência real**, medido e monitorado. Ver
[replicação](replication.md).

Um sistema eventualmente consistente sem monitoramento de atraso é um sistema em
que ninguém sabe quão velho o dado pode estar.

### O que a aplicação precisa fazer

Três responsabilidades que passam para a aplicação:

**Tolerar leitura desatualizada.** A interface não pode assumir que o que foi
escrito aparece imediatamente.

**Lidar com escritas concorrentes.** Duas réplicas podem receber escritas
conflitantes. Ver
[resolução de conflitos](conflict-resolution.md).

**Ser idempotente.** Convergência frequentemente envolve reaplicar operações.

### As garantias de sessão resolvem a maior parte da percepção

O ponto prático mais valioso deste documento: **o usuário nota a própria
inconsistência, e tolera a dos outros.**

Ver [consistência](consistency.md). Garantir "leia seus próprios escritos" —
direcionar leituras do autor para a primária por um curto período — elimina a
queixa dominante a custo baixíssimo, sem abrir mão da escala de leitura para todo
o resto.

Times que adotam consistência eventual e não implementam essa garantia gastam
muito mais tempo respondendo chamados do que teriam gasto implementando.

### Projetar a interface para o atraso

Quando o atraso é inevitável, a interface pode torná-lo compreensível em vez de
confuso:

**Atualização otimista.** Mostrar o resultado esperado imediatamente, e reconciliar
quando confirmar. É o que aplicativos de mensagem fazem.

**Estado explícito.** "Processando", "sincronizando" — em vez de mostrar o valor
antigo como se fosse atual.

**Marca de atualização.** "Dados de 3 minutos atrás" comunica honestamente.

A terceira é a mais barata e a menos usada. Um usuário que sabe que o dado tem
atraso não reporta defeito.

### Convergência precisa de mecanismo

"Eventualmente converge" pressupõe um mecanismo que faça convergir: reparo por
leitura, reparo em segundo plano, reconciliação periódica.

Sem ele, réplicas divergentes podem permanecer divergentes indefinidamente — o que
não é consistência eventual, é inconsistência permanente com nome bonito.

### O atraso não é constante

O erro de dimensionamento mais comum é medir o atraso de replicação em condições
normais, ver 200 ms e projetar o sistema para isso.

O atraso tem cauda longa e ela é dominada por eventos previsíveis:

**Carga de escrita alta.** A réplica não acompanha e o atraso cresce
cumulativamente.

**Reconstrução de índice ou de projeção.** Pode parar o consumo por completo.

**Troca de nó primário.** A nova réplica pode começar atrás.

**Manutenção e implantação.** O consumidor fica fora por minutos.

Nesses momentos, o atraso não vai de 200 ms para 400 ms — vai para minutos ou
horas. As decisões de produto sobre o que é aceitável precisam ser tomadas com o
percentil alto na mesa, não com a mediana.

## Modelo Mental

**Consistência eventual é uma promessa sem prazo.** O prazo é uma propriedade
operacional que você mede, não uma garantia que você recebe.

## Quando Usar

- O negócio tolera atraso, e isso foi confirmado explicitamente.
- A escala de leitura ou a disponibilidade exigem réplicas.
- Os dados são naturalmente convergentes — contadores, agregados, projeções.
- Entre bounded contexts, onde consistência forte os acoplaria.

## Quando Não Usar

**Onde o dado controla recurso finito.** Estoque, assento, saldo. Ver
[consistência forte](strong-consistency.md).

**Onde uma decisão irreversível depende do valor.** Autorizar, aprovar, liberar.

**Sem confirmar com o negócio.** É decisão de produto, não de engenharia.

**Sem monitorar o atraso.** Operar às cegas.

**Sem mecanismo de convergência.** Divergência permanente.

**Sem tratar conflito.** A resolução padrão — último a escrever vence — descarta
dados silenciosamente.

## Alternativas

- **[Consistência forte](strong-consistency.md)** — onde o custo se paga.
- **Garantias de sessão** — o meio-termo que resolve a percepção.
- **Consistência causal** — preserva a ordem entre operações relacionadas.
- **Ler da primária para operações críticas** — forte onde importa, eventual no
  resto.

## Trade-offs

| Eventual | Forte |
|---|---|
| Escrita e leitura rápidas | Latência de coordenação |
| Disponível sob partição | Indisponível |
| Escala de leitura | Limitada |
| Aplicação lida com dado velho | Modelo simples |
| Conflitos a resolver | Sem conflito |
| Interface precisa comunicar atraso | Direta |

## Modos de Falha

**Divergência permanente.** Sem mecanismo de convergência.

**Conflito resolvido por descarte silencioso.** Último a escrever vence, e a
escrita perdida era a importante.

**Decisão sobre dado velho.** Aprovar com saldo desatualizado.

**Atraso crescendo sem alerta.** A réplica fica cada vez mais atrás.

**Interface mentindo.** Mostra o valor antigo como se fosse atual.

## Erros Comuns

**Adotar sem decisão de negócio.**

**Não implementar garantias de sessão.**

**Não monitorar o atraso.**

**Aceitar a resolução de conflito padrão sem entendê-la.**

**Não comunicar o atraso na interface.**

## Exemplo Real

Uma rede social interna corporativa migrou o feed para leitura de réplicas, com
atraso típico de 2 segundos.

Três reclamações apareceram, e apenas uma era de fato consistência eventual.

**"Publiquei e não aparece."** Consistência eventual clássica. Resolvida com "leia
seus próprios escritos": após publicar, as leituras daquele usuário vão para a
primária por 30 segundos. A queixa desapareceu.

**"O contador de curtidas volta atrás."** Leituras alternando entre réplicas com
atrasos diferentes. Resolvida com leituras monotônicas — o usuário fica preso a
uma réplica durante a sessão.

**"Comentário aparece antes do post."** Não era atraso de replicação — era
[ordenação](ordering.md). Comentário e post iam para partições diferentes.
Resolvido pela chave de partição.

A terceira é instrutiva porque foi diagnosticada duas vezes como consistência
eventual antes de alguém perceber que a réplica estava em dia e o problema era
outro.

E a decisão que a equipe registrou como mais importante veio antes de tudo isso: a
conversa com o negócio sobre atraso aceitável. A resposta — "alguns segundos para
conteúdo de terceiros, zero para o próprio" — é exatamente a política de garantias
de sessão, e ela veio do produto, não da engenharia.

## Conceitos Relacionados

- [Consistência](consistency.md) — o espectro completo.
- [Consistência Forte](strong-consistency.md) — o outro extremo.
- [Resolução de Conflitos](conflict-resolution.md) — o que a convergência exige.
- [Replicação](replication.md) — de onde o atraso vem.

## Exercício Prático

Liste as telas do seu sistema que leem de réplica ou de projeção. Para cada uma,
responda: quanto atraso o negócio aceita, e a interface comunica isso?

Depois verifique se existe "leia seus próprios escritos". É a correção de melhor
retorno desta seção.

## Perguntas de Entrevista

- O que a garantia de consistência eventual não diz?
- Por que garantias de sessão resolvem a maior parte das queixas?
- O que é necessário para que a convergência de fato aconteça?

## Para Aprofundar

- Vogels, Werner. *Eventually Consistent*. ACM Queue, 2008.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Bailis, Peter; Ghodsi, Ali. *Eventual Consistency Today*. ACM Queue, 2013.
