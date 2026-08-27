---
id: retry-storms
title: Tempestades de Retentativa
sidebar_position: 16
description: Quando a defesa amplifica o problema — e por que a recuperação é a parte mais difícil.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor dimensiona retentativas com orçamento e evita a amplificação
  que impede a recuperação.
prerequisites: [reliability]
related: [circuit-breakers, bulkheads, graceful-degradation]
canonical_for: [tempestade de retentativa, amplificação de retentativa, orçamento de retentativa, recuperação metaestável]
content_version: 1
last_reviewed: 2026-08-28
---

# Tempestades de Retentativa

## Visão Geral

Retentativa é a defesa mais básica contra falha transitória. Ver
[retentativas](../06-distributed-systems/retries.md).

Sob falha generalizada, ela vira o problema: todos os clientes repetem ao mesmo tempo,
a carga sobre o destino degradado multiplica, e o sistema não consegue se recuperar —
mesmo depois de a causa original ter passado.

Esse último ponto é o que torna o fenômeno perigoso: **o sistema fica preso num estado
ruim que se sustenta sozinho**, e sair dele exige intervenção.

## Problema

Um serviço fica lento. Os clientes fazem timeout e repetem três vezes.

```text
carga normal          1.000 req/s
serviço degrada, 3 tentativas cada
carga sobre ele       3.000 req/s   ← no momento em que ele menos suporta
```

Com cadeias de chamadas, a multiplicação é composta:

```text
A → B → C, cada um com 3 tentativas
1 requisição em A → 3 em B → 9 em C
```

Nove chamadas ao serviço mais profundo para uma requisição do usuário. Uma degradação
leve em C vira sobrecarga total.

## Conceitos Centrais

### Repita em um nível, não em todos

A regra que evita a multiplicação composta.

Cada camada que repete multiplica pelo fator dela. Numa cadeia de quatro serviços com
três tentativas cada, uma requisição pode gerar 81 chamadas ao mais profundo.

A decisão precisa ser explícita: **qual camada repete?** Tipicamente a mais próxima do
usuário, ou a que tem o contexto para decidir se vale a pena.

E as demais precisam **não** repetir — o que exige que alguém verifique, porque
bibliotecas de cliente frequentemente repetem por padrão sem que ninguém tenha
configurado.

Ver [malha de serviço](../08-integration-architecture/service-mesh.md) — o caso em que a
malha repete e a aplicação também.

### Orçamento de retentativa

Limitar o número de tentativas por requisição não impede a tempestade — mil clientes
com três tentativas cada continuam gerando três mil chamadas.

O controle que funciona é limitar a **proporção**:

```text
orçamento: retentativas ≤ 10% das requisições iniciais
  → sob falha generalizada, a carga extra é limitada a 10%
  → o destino recebe 1.100 req/s em vez de 3.000
```

Quando o orçamento se esgota, novas retentativas são recusadas imediatamente. Isso
preserva a capacidade de repetir para falhas isoladas — que é o caso legítimo — e
impede a amplificação quando a falha é generalizada.

É o controle mais eficaz desta seção, e o menos implementado.

### Variação não é opcional

Sem variação aleatória, clientes que falharam juntos repetem juntos:

```text
sem variação   falha em massa → todos repetem em 1s, 2s, 4s → três picos sincronizados
com variação   as tentativas se espalham no tempo
```

Ver [backoff](../06-distributed-systems/backoff.md). Espera crescente sem variação é
pior que não ter espera nenhuma, porque cria a ilusão de proteção enquanto mantém a
sincronização.

### Não repita o que não é retentável

Repetir uma requisição inválida gasta capacidade e não pode dar certo.

```text
retentável      timeout, erro de servidor, indisponibilidade, excesso de requisições
não retentável  requisição malformada, não autorizado, não encontrado, conflito
```

O caso de excesso de requisições merece nota: ele é retentável, e o destino
frequentemente informa quanto esperar. Ignorar essa informação e repetir imediatamente
é o que transforma limite de taxa em tempestade.

### Recuperação metaestável

O fenômeno que torna tudo isso grave.

Um sistema entra num estado em que a própria carga de retentativa mantém a degradação —
mesmo depois de a causa original ter desaparecido.

```text
1. causa original: banco lento por 30 segundos
2. clientes repetem, carga triplica
3. banco continua saturado pela carga de retentativa
4. causa original passou; o estado ruim persiste
5. sem intervenção, não sai sozinho
```

Sair exige **reduzir a carga**: rejeitar requisições, desligar clientes, esvaziar filas.
Aumentar capacidade frequentemente não resolve, porque a carga de retentativa cresce
para ocupá-la.

Reconhecer esse padrão durante um incidente é o que evita horas tentando escalar.

### Fila é amplificador silencioso

Quando a retentativa acontece numa fila, a amplificação não é visível como carga — é
visível como profundidade crescente.

Uma mensagem que falha e volta para a fila é processada de novo, falha de novo, e
consome capacidade indefinidamente. Ver
[poison messages](../06-distributed-systems/poison-messages.md) e
[dead-letter queues](../06-distributed-systems/dead-letter-queues.md).

Limite de tentativas com destino final não é detalhe — é o que impede uma mensagem
consumir a capacidade de toda a fila.

## Modelo Mental

**Retentativa ajuda contra falha isolada e amplifica falha generalizada.** O controle
não é o número de tentativas — é a proporção delas.

## Quando Usar

Retentativa é adequada quando:

- A falha é plausivelmente transitória.
- A operação é [idempotente](../06-distributed-systems/idempotency.md).
- Há orçamento definido.
- Existe espera com variação.
- Apenas uma camada repete.

## Quando Não Usar

**Em várias camadas.**

**Sem orçamento.**

**Sem variação.**

**Para erros permanentes.**

**Sem idempotência.**

**Como resposta a sobrecarga.** Se o destino está saturado, repetir piora. Ver
[circuit breaker](circuit-breakers.md).

## Alternativas

- **[Circuit breaker](circuit-breakers.md)** — parar de tentar quando a falha é
  persistente. Complementa a retentativa.
- **[Degradação graciosa](graceful-degradation.md)** — responder sem a dependência.
- **Fila com atraso** — deixar a infraestrutura cuidar da repetição, com controle.
- **Falhar rápido** — quando o orçamento de tempo do chamador não comporta espera.

## Trade-offs

| Com retentativa | Sem |
|---|---|
| Absorve falha transitória | Propaga |
| Amplifica falha generalizada | Não amplifica |
| Latência maior no caso ruim | Falha imediata |
| Exige idempotência | Dispensa |

| Com orçamento | Sem |
|---|---|
| Amplificação limitada | Multiplicação livre |
| Algumas retentativas recusadas | Todas tentadas |
| Recuperação possível | Estado metaestável |

## Modos de Falha

**Amplificação composta.** Cadeia com retentativa em cada nível.

**Estado metaestável.** A carga de retentativa sustenta a degradação.

**Picos sincronizados.** Sem variação.

**Retentativa de erro permanente.** Capacidade gasta sem chance de sucesso.

**Fila crescendo por reprocessamento.**

**Duplicação de efeito.** Sem idempotência.

**Retentativa contra limite de taxa.** Ignora o prazo informado e piora.

## Erros Comuns

**Não verificar se camadas intermediárias repetem.**

**Não definir orçamento.**

**Espera crescente sem variação.**

**Repetir tudo indistintamente.**

**Não limitar tentativas em fila.**

**Escalar capacidade** durante estado metaestável.

## Exemplo Real

Uma plataforma de mobilidade teve uma indisponibilidade de 3 horas que começou com uma
degradação de 40 segundos.

A sequência:

**Origem.** Uma consulta lenta deixou o banco de motoristas com latência elevada por 40
segundos.

**Amplificação.** O aplicativo repetia 3 vezes. O gateway repetia 2 vezes. O serviço
intermediário repetia 3 vezes. A carga sobre o banco passou de 800 para cerca de 14 mil
requisições por segundo.

**Metaestabilidade.** A degradação original passou em 40 segundos. A carga de
retentativa manteve o banco saturado por horas.

**Escalada ineficaz.** O time dobrou as instâncias de aplicação. Isso **piorou** — mais
instâncias significavam mais clientes repetindo contra o mesmo banco.

**Saída.** Após 3 horas, o time desligou o tráfego do aplicativo por 5 minutos. Sem
carga, o banco se recuperou em segundos. O tráfego foi religado gradualmente.

A investigação encontrou que ninguém sabia que havia três camadas repetindo — cada
configuração tinha sido feita por um time diferente, em momentos diferentes, todas
razoáveis isoladamente.

As correções:

**Retentativa em uma camada só.** Apenas o cliente móvel repete, com espera crescente e
variação. Gateway e serviços intermediários pararam de repetir — verificado por teste
automatizado que falha se uma biblioteca de cliente repetir por padrão.

**Orçamento de 10%** por serviço, com recusa imediata acima disso.

**Circuit breaker** no acesso ao banco de motoristas, com
[degradação graciosa](graceful-degradation.md): sem o serviço, o aplicativo mostra
motoristas do cache com aviso de atraso.

**Descarte de carga** no gateway: acima de um limite, requisições são recusadas com
prazo sugerido, em vez de enfileirar.

**Procedimento de recuperação** documentado, incluindo o passo que resolveu — reduzir a
carga a zero e religar gradualmente. Ele foi contraintuitivo na hora, e é o que
funciona em estado metaestável.

Nos dezoito meses seguintes, três degradações semelhantes se recuperaram sozinhas em
menos de dois minutos.

O que a equipe registra: a decisão que mais prolongou o incidente foi dobrar a
capacidade. Ela era a reação natural, e alimentava exatamente o mecanismo que mantinha
a degradação.

## Conceitos Relacionados

- [Retentativas](../06-distributed-systems/retries.md) — os fundamentos.
- [Backoff](../06-distributed-systems/backoff.md) — a variação.
- [Circuit Breakers](circuit-breakers.md) — parar de tentar.
- [Bulkheads](bulkheads.md) — conter a propagação.

## Exercício Prático

Trace uma requisição do seu sistema e conte quantas camadas repetem — incluindo
bibliotecas de cliente, gateway e malha de serviço.

Multiplique os fatores. Esse é o número de chamadas que uma requisição pode gerar no
serviço mais profundo durante uma degradação.

## Perguntas de Entrevista

- Por que orçamento de proporção funciona melhor que limite de tentativas?
- O que é estado metaestável e por que escalar não resolve?
- Por que espera crescente sem variação é pior que nenhuma espera?

## Para Aprofundar

- Bronson, Nathan et al. *Metastable Failures in Distributed Systems*. HotOS, 2021.
- Nygard, Michael. *Release It!*. 2ª ed. Pragmatic Bookshelf, 2018.
- Brooker, Marc. *Timeouts, retries and backoff with jitter*. AWS, 2015.
