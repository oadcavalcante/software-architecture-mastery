---
id: clock-and-time
title: Relógio e Tempo
sidebar_position: 34
description: Por que não existe "agora" compartilhado — e por que marcas de tempo não ordenam eventos.
doc_type: concept
level: 4
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor evita depender de relógio de parede para ordenação e
  correção, e conhece as alternativas.
prerequisites: [distributed-fundamentals]
related: [ordering, conflict-resolution, consensus]
canonical_for: [relógio, relógio lógico, deriva de relógio]
content_version: 1
last_reviewed: 2026-08-27
---

# Relógio e Tempo

## Visão Geral

Num sistema distribuído não existe **agora** compartilhado.

Cada máquina tem seu próprio relógio, e eles divergem. Isso significa que comparar
marcas de tempo de máquinas diferentes não estabelece ordem — e sistemas que
dependem disso falham de formas sutis e difíceis de reproduzir.

## Problema

O reflexo é usar marca de tempo para tudo: ordenar eventos, decidir qual escrita
prevalece, verificar expiração, medir duração.

Cada um desses usos tem um problema diferente, e todos vêm da mesma raiz: o
relógio de uma máquina não tem relação confiável com o de outra.

**Deriva.** Relógios de quartzo desviam — tipicamente alguns segundos por dia sem
sincronização.

**Sincronização imperfeita.** NTP corrige, com precisão de dezenas de
milissegundos numa rede boa, e muito pior sob congestionamento.

**Saltos.** A correção pode mover o relógio para trás. Um programa que mede
duração subtraindo dois instantes pode obter valor negativo.

**Suspensão.** Máquinas virtuais podem ser pausadas e retomadas, com o relógio
saltando.

## Conceitos Centrais

### Dois tipos de relógio, e usá-los errado é o erro comum

**Relógio de parede.** O horário do calendário. Sujeito a correção, salto e
retrocesso. Adequado para **registrar quando algo aconteceu**, para exibir, para
expiração de credencial de longa duração.

**Relógio monotônico.** Um contador que só cresce, sem relação com o calendário.
Não sofre correção. Adequado para **medir duração**, timeout e intervalo.

O erro clássico: medir a duração de uma operação subtraindo dois valores do relógio
de parede. Se o NTP corrigir no meio, o resultado pode ser negativo ou absurdo.

Toda medição de tempo decorrido deveria usar o monotônico.

### Marca de tempo não ordena eventos

Se o evento A tem marca de tempo posterior à de B, e eles vieram de máquinas
diferentes, **não se pode concluir que A aconteceu depois**.

A diferença entre os relógios pode ser maior que o intervalo real entre os
eventos. É exatamente o cenário de
[resolução de conflitos](conflict-resolution.md) por último a escrever vence.

Ordenação precisa vir de outro lugar: um contador da entidade, um número de
sequência atribuído por um único ponto, ou a
[partição](ordering.md).

### Relógios lógicos

Quando a ordem causal importa e o relógio físico não serve:

**Relógio de Lamport.** Um contador por nó, incrementado a cada evento e propagado
nas mensagens. Se A causou B, o contador de A é menor. A recíproca não vale —
contadores menores não implicam causalidade.

**Vetor de versões.** Um contador por nó, mantido como vetor. Permite distinguir
"A causou B" de "A e B foram concorrentes" — que é o que
[detecção de conflito](conflict-resolution.md) exige.

O vetor é mais caro em espaço e é o que de fato responde à pergunta útil.

### Relógios com incerteza limitada

Alguns sistemas usam hardware especializado — GPS e relógios atômicos — para
limitar a incerteza a poucos milissegundos, e então **esperam** essa incerteza
antes de confirmar uma transação.

É a abordagem do Spanner: em vez de fingir que os relógios concordam, quantificar
o quanto podem divergir e aguardar.

Funciona e depende de infraestrutura que a maioria dos sistemas não tem.

### Expiração é o caso perigoso

Verificar se uma credencial expirou compara o relógio local com uma marca de
tempo. Se os relógios divergirem:

Um servidor com relógio atrasado aceita credenciais já expiradas. Um adiantado
rejeita válidas.

Por isso protocolos de token costumam recomendar uma margem de tolerância — e por
isso relógio dessincronizado aparece como "erro de autenticação intermitente que
some ao tentar de novo".

## Modelo Mental

**Relógio de parede diz *quando*; relógio monotônico diz *quanto tempo*.** Usar um
no lugar do outro é a origem de quase todo defeito desta área.

## Quando Usar

**Relógio de parede** para: registrar o instante de um evento para exibição ou
auditoria; expiração de longo prazo; agendamento em horário de calendário.

**Relógio monotônico** para: medir duração; timeout; intervalo entre tentativas;
qualquer comparação de tempo decorrido.

**Relógio lógico** para: ordenar eventos causalmente; detectar concorrência.

## Quando Não Usar

**Marca de tempo para ordenar eventos de máquinas diferentes.**

**Relógio de parede para medir duração.**

**Marca de tempo para resolver conflito.** Ver
[resolução de conflitos](conflict-resolution.md).

**Assumir que os relógios estão sincronizados.** Verifique — a deriva acontece, e
frequentemente sem alerta.

**Expiração curta sem margem.** Uma credencial de 30 segundos com relógios
divergindo 100 ms é frágil.

## Alternativas

- **Contador de sequência** — atribuído por um único ponto, ordena sem depender de
  relógio.
- **Versão da entidade** — resolve ordenação e detecção de obsoleto.
- **Vetor de versões** — para causalidade e concorrência.
- **Relógio híbrido** — combina componente físico e lógico, capturando causalidade
  e mantendo relação com o horário real.

## Trade-offs

| Marca de tempo física | Relógio lógico |
|---|---|
| Legível e comparável com o calendário | Sem significado externo |
| Não confiável entre máquinas | Confiável para causalidade |
| Sem estado adicional | Contador ou vetor a propagar |
| Trivial | Exige propagação nas mensagens |

## Modos de Falha

**Duração negativa.** Relógio corrigido durante a medição.

**Ordem invertida.** Eventos ordenados por marca de tempo aparecem fora de ordem.

**Conflito resolvido pela máquina com relógio adiantado.**

**Credencial rejeitada por relógio dessincronizado.** Aparece como erro
intermitente.

**Agendamento duplicado ou pulado.** Uma tarefa agendada para um horário executa
duas vezes ou nenhuma, na correção do relógio.

**Deriva não monitorada.** Ninguém sabe que uma máquina está fora.

## Erros Comuns

**Medir duração com relógio de parede.**

**Ordenar por marca de tempo entre máquinas.**

**Não monitorar a deriva.** É uma métrica simples e raramente coletada.

**Expiração sem margem de tolerância.**

**Assumir que o NTP resolve.** Ele reduz a divergência; não a elimina.

## Exemplo Real

Um sistema de leilão registrava lances com a marca de tempo do servidor que
recebeu, e determinava o vencedor pelo lance mais recente.

Quatro servidores atrás de um balanceador, todos com NTP.

Uma disputa contratual expôs o problema: dois lances chegaram com 40 ms de
diferença real, em servidores diferentes. O servidor que recebeu o **primeiro**
tinha o relógio 120 ms adiantado.

Pela marca de tempo, o primeiro lance parecia posterior. Ele venceu o leilão.

A auditoria dos registros de rede mostrou a ordem real, e o resultado precisou ser
revertido — com consequência jurídica.

A investigação revelou que a deriva entre os quatro servidores variava entre 15 e
180 ms ao longo do dia, e ninguém monitorava.

As correções.

**Contador de sequência central.** Todo lance passa por um único componente que
atribui um número sequencial. A ordem vem dele, não de relógio.

**Marca de tempo mantida para exibição e auditoria**, explicitamente marcada como
aproximada.

**Monitoramento de deriva** com alerta acima de 50 ms.

**Medição de duração** migrada para relógio monotônico em todo o sistema — uma
auditoria de código encontrou onze lugares que subtraíam marcas de parede.

O que a equipe registrou: o sistema funcionou por três anos, e a ordem esteve
errada em uma fração dos leilões esse tempo todo. Só apareceu quando alguém
contestou — e a ausência de um contador central era conhecida por ninguém, porque
"usar a hora do servidor" parecia óbvio demais para ser questionado.

## Conceitos Relacionados

- [Ordenação](ordering.md) — onde relógio não serve.
- [Resolução de Conflitos](conflict-resolution.md) — o mesmo problema.
- [Timeouts](timeouts.md) — que precisam de relógio monotônico.
- [Consenso](consensus.md) — que estabelece ordem sem depender de relógio.

## Exercício Prático

Procure no seu código lugares que subtraem dois valores de horário para medir
duração. Verifique se usam relógio monotônico.

Depois verifique a deriva entre as máquinas do seu sistema. Se não houver métrica,
essa é a descoberta.

## Perguntas de Entrevista

- Qual a diferença entre relógio de parede e monotônico, e quando usar cada um?
- Por que marca de tempo não ordena eventos de máquinas diferentes?
- O que um vetor de versões responde que uma marca de tempo não responde?

## Para Aprofundar

- Lamport, Leslie. *Time, Clocks, and the Ordering of Events in a Distributed
  System*. CACM, 1978.
- Corbett, James et al. *Spanner: Google's Globally-Distributed Database*. OSDI,
  2012 — a abordagem de incerteza limitada.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 —
  capítulo 8.
