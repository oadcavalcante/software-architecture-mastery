---
id: scaling-load-balancing
title: Balanceamento para Escala
sidebar_position: 7
description: Distribuir tráfego entre instâncias, e por que "uniforme" quase nunca é o que você quer.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor escolhe algoritmo de balanceamento pelo comportamento real das
  instâncias, não por uniformidade nominal.
prerequisites: [horizontal-scaling]
related: [horizontal-scaling, statelessness, hotspots]
canonical_for: [algoritmo de balanceamento, distribuição de conexões, drenagem de instância]
content_version: 3
last_reviewed: 2026-08-28
---

# Balanceamento para Escala

## Visão Geral

Balanceamento distribui requisições entre instâncias. Os fundamentos (camadas,
verificação de saúde, algoritmos) estão em
[balanceamento de carga](/05-system-design/load-balancing.md).

Aqui interessa o ângulo da escala: **distribuir uniformemente não é o objetivo**. O
objetivo é que nenhuma instância fique saturada enquanto outras estão ociosas, e
instâncias não são equivalentes na prática.

## Problema

O algoritmo mais comum, distribuir em rodízio, pressupõe que todas as instâncias são
iguais e que todas as requisições custam o mesmo.

As duas premissas são falsas:

**Instâncias diferem.** Gerações de hardware distintas, vizinhos ruidosos, cache frio
em nós recém-criados, coleta de lixo em momentos diferentes.

**Requisições diferem.** Uma busca simples e um relatório pesado consomem
ordens de grandeza diferentes.

O resultado é distribuição nominalmente uniforme e carga real desigual, com uma
instância saturada enquanto a média parece confortável. É o mesmo padrão de
[pontos quentes](/11-scalability/hotspots.md), na camada de balanceamento.

## Conceitos Centrais

### Os algoritmos, e o que cada um pressupõe

```text
rodízio                instâncias iguais, requisições iguais
rodízio ponderado      instâncias diferentes, requisições iguais
menos conexões         requisições de duração variável
menor latência         mede o comportamento real
duas escolhas aleatórias  sorteia duas, envia à menos carregada
```

O último merece destaque: escolher duas ao acaso e mandar para a menos carregada
entrega quase o resultado de conhecer todas as cargas, com uma fração do custo, e sem
o efeito de manada que "sempre a menos carregada" produz, quando vários balanceadores
convergem para a mesma instância.

Com requisições homogêneas, os algoritmos empatam na prática. Quando a duração varia
por ordens de grandeza (a busca de milissegundos ao lado do relatório de segundos),
**menos conexões** ou **duas escolhas aleatórias** superam o rodízio com folga, porque
enxergam a fila que o rodízio ignora.

### Conexões persistentes quebram o balanceamento

O problema mais comum em arquiteturas modernas, e o menos esperado.

Protocolos com conexão longa e multiplexada (HTTP/2, gRPC) abrem a conexão uma vez e
mandam tudo por ela. Um balanceador de camada 4 distribui **conexões**, não
requisições.

```text
10 clientes, 10 conexões, 3 instâncias
  → distribuição de conexões: 4, 3, 3
  → distribuição de requisições: o que os clientes mandarem
```

Se um cliente manda dez vezes mais que os outros, a instância dele satura. E, o que é
pior: instâncias novas adicionadas durante um pico não recebem tráfego nenhum, porque
não há conexões novas sendo abertas.

Ver [gRPC](/08-integration-architecture/grpc.md). As saídas são balanceamento de
camada 7, balanceamento no cliente,
[malha de serviço](/08-integration-architecture/service-mesh.md), ou reciclar conexões
no servidor: em gRPC, idade máxima de conexão com período de tolerância, que força os
clientes a reconectar e redistribui sem trocar o balanceador. A reciclagem corrige em
janelas, não requisição a requisição: entre uma reconexão e outra, o desequilíbrio
volta a se acumular.

### Verificação de saúde rasa mantém instância doente na rotação

Uma verificação que apenas confirma que o processo responde não detecta a instância
degradada: lenta, com dependência fora, com disco cheio.

Ver [detecção de falhas](/06-distributed-systems/failure-detection.md). O
balanceamento maduro considera taxa de erro e latência, não apenas presença.

O efeito inverso (verificação profunda que reprova todas as instâncias juntas quando
uma dependência fica lenta) está em
[balanceamento de carga](/05-system-design/load-balancing.md). O ângulo de escala é
outro: com a verificação restrita ao próprio processo, o balanceador **reduz o peso**
da instância cuja latência ou taxa de erro destoa das demais, em vez de removê-la. A
remoção é binária e devolve de uma vez a fatia inteira às vizinhas; a redução de peso
alivia a instância degradada sem empurrar as outras para a saturação.

### Descartar carga é melhor que enfileirar

Quando todas as instâncias estão saturadas, o balanceador tem duas opções:

**Enfileirar.** As requisições esperam. A latência cresce, os clientes fazem timeout e
repetem, e a carga aumenta.

**Recusar.** O cliente recebe erro imediato e pode reagir: repetir com
[backoff](/06-distributed-systems/backoff.md), degradar, avisar o usuário.

Sob saturação, recusar rápido preserva a capacidade para o que pode ser atendido. Ver
[backpressure](/06-distributed-systems/backpressure.md).

Um limite de fila no balanceador, com recusa acima dele, é o que impede o colapso por
enfileiramento.

### Drenar antes de remover

Remover uma instância abruptamente derruba as requisições em andamento.

A drenagem correta: parar de enviar novas, esperar as em andamento terminarem, e só
então remover.

Isso precisa funcionar em três momentos: implantação, redução de capacidade e falha de
verificação de saúde. Sem isso, cada evento de escalonamento, que deveria ser rotina,
perde requisições. Ver
[ausência de estado](/11-scalability/statelessness.md).

### Instância nova precisa entrar devagar

Uma instância recém-criada tem cache frio, conexões não estabelecidas e código ainda
não otimizado pelo tempo de execução.

Enviar-lhe a fatia completa de tráfego imediatamente produz latência alta e,
frequentemente, saída da rotação por falha de saúde. Isso gera um ciclo de instâncias
subindo e caindo.

A entrada gradual, fração crescente do tráfego ao longo de alguns minutos, resolve. É
uma configuração simples e frequentemente ausente.

## Modelo Mental

**O objetivo não é distribuir igual; é não saturar ninguém.** Instâncias e requisições
não são equivalentes.

## Quando Usar

- Mais de uma instância atendendo o mesmo serviço.
- Requisições de custo variável.
- Instâncias de capacidade ou desempenho heterogêneos.
- Escalonamento automático com instâncias entrando e saindo.
- Protocolos com conexão persistente.

## Quando Não Usar

**Rodízio quando a duração das requisições varia por ordens de grandeza.** Cada
instância recebe o mesmo número de requisições, e a que sorteou as caras acumula fila.
Com durações parecidas, o rodízio basta e é o mais previsível.

**Camada 4 quando poucos clientes concentram o volume em conexões longas.** Com
milhares de clientes de volume parecido, a distribuição de conexões aproxima a de
requisições; com dezenas, um único cliente pesado satura a instância que o recebeu.

**Remoção binária da rotação como única reação à degradação.** Quando a capacidade
sobrante é pequena, tirar uma instância lenta despeja a fatia dela nas vizinhas: o
gatilho do ciclo de subida e queda. Reduzir peso antes de remover.

**Afinidade de sessão como solução permanente.** Ver
[ausência de estado](/11-scalability/statelessness.md).

## Alternativas

- **Balanceamento no cliente**: o cliente conhece as instâncias e decide. Elimina um
  salto e resolve o problema de conexões persistentes.
- **[Malha de serviço](/08-integration-architecture/service-mesh.md)**: balanceamento
  por requisição, com política central.
- **Filas**: para trabalho assíncrono, a fila distribui melhor que qualquer
  balanceador. Ver [escala dirigida por fila](/11-scalability/queue-based-scaling.md).
- **Roteamento por partição**: quando o estado é particionado, o roteamento segue a
  chave, não a carga.

## Trade-offs

| Rodízio | Menos conexões |
|---|---|
| Trivial | Precisa de estado |
| Ignora duração | Considera |
| Previsível | Adaptativo |

| Camada 4 | Camada 7 |
|---|---|
| Rápido, barato | Mais processamento |
| Distribui conexões | Distribui requisições |
| Sem visibilidade | Roteia por conteúdo |

## Modos de Falha

**Distribuição desigual por conexões persistentes.**

**Instância nova sem tráfego.** Não há conexões novas.

**Instância degradada na rotação.** Verificação rasa.

**Todas fora da rotação.** Verificação profunda com dependência lenta.

**Colapso por enfileiramento.**

**Requisições perdidas na remoção.** Sem drenagem.

**Ciclo de subida e queda.** Instância nova saturada sai por falha de saúde.

## Erros Comuns

**Usar rodízio por padrão.** Ele pressupõe requisições de custo parecido. Quando algumas são muito mais caras, a distribuição igual de requisições produz distribuição desigual de carga.

**Camada 4 com HTTP/2 ou gRPC.** Esses protocolos multiplexam sobre conexões duradouras, então balancear por conexão fixa cada cliente numa instância e as novas não recebem tráfego.

**Tratar escala como só adicionar instâncias.** Sem entrada gradual, sem balanceamento por requisição e sem drenagem, a instância nova não recebe tráfego, recebe tudo de uma vez, ou derruba requisições ao sair, e a expansão no pico não tem efeito.

**Não limitar a fila.** Aceitar tudo sob sobrecarga aumenta a latência de todos até ninguém ser atendido a tempo. Recusar o excedente rápido preserva o que ainda cabe.

**Não drenar.** Remover a instância sem esperar as requisições em curso terminarem transforma cada implantação num punhado de erros para usuários reais.

**Não configurar entrada gradual.** A instância recém-subida recebe carga plena com cache frio e conexões não estabelecidas, e responde mal justamente enquanto aquece.

## Exemplo Real

Uma plataforma de serviços migrou a comunicação entre serviços internos para gRPC, com
o balanceador de camada 4 existente.

O desempenho melhorou (menos serialização, conexões persistentes) e a distribuição
quebrou.

Os sintomas, ao longo de semanas:

**Carga desigual persistente.** Três instâncias de dez com CPU acima de 80%, sete
abaixo de 20%. A distribuição de conexões era uniforme; a de requisições não.

**Instâncias novas ociosas.** Numa expansão de 10 para 20 instâncias durante um pico,
as dez novas ficaram praticamente sem tráfego: nenhuma conexão nova era aberta, porque
os clientes já tinham as suas.

Isso significava que escalar durante o pico não fazia nada, e o time só descobriu
comparando a distribuição de requisições com o número de instâncias.

**Ciclo de instabilidade.** Duas instâncias entravam e saíam da rotação repetidamente.
A verificação de saúde consultava o banco; quando o banco ficava lento, várias falhavam
ao mesmo tempo, o tráfego se concentrava nas restantes, que ficavam mais lentas e
saíam também.

As correções:

**Balanceamento no cliente**, com resolução de instâncias e distribuição por requisição.
A distribuição passou a acompanhar a carga real, e instâncias novas passaram a receber
tráfego imediatamente.

**Duas escolhas aleatórias** como algoritmo, superando o rodízio na variação de custo
das requisições.

**Verificação de saúde rasa** (apenas o próprio processo), com o balanceamento
observando latência e taxa de erro para reduzir o peso de uma instância degradada, em
vez de removê-la.

**Entrada gradual** de instâncias novas, com fração crescente ao longo de 3 minutos.

**Drenagem** de 30 segundos antes de remover.

Resultado: a diferença entre a instância mais e a menos carregada caiu de 4 vezes para
1,3 vezes, e a expansão durante picos passou a ter efeito.

A leitura que a equipe faz: a migração para gRPC tinha sido avaliada por desempenho e por
contrato, e o comportamento de balanceamento não estava na lista. Para eles, foi a
mudança operacional de maior efeito da migração, e não constava de nenhuma das
comparações de desempenho que haviam usado para decidir.

## Conceitos Relacionados

- [Escala Horizontal](/11-scalability/horizontal-scaling.md): o que ele viabiliza.
- [Ausência de Estado](/11-scalability/statelessness.md): a afinidade.
- [Balanceamento de Carga](/05-system-design/load-balancing.md): os fundamentos.
- [Malha de Serviço](/08-integration-architecture/service-mesh.md).

## Exercício Prático

Compare a utilização de CPU entre as instâncias do seu serviço mais carregado, no mesmo
instante.

Se a razão entre a maior e a menor passar de 2, o balanceamento não está distribuindo
carga. Está distribuindo alguma outra coisa.

## Perguntas de Entrevista

- Por que distribuir uniformemente não é o objetivo?
- Por que conexões persistentes quebram o balanceamento de camada 4?
- Por que verificação de saúde profunda pode causar indisponibilidade total?

## Para Aprofundar

- Mitzenmacher, Michael. *The Power of Two Choices in Randomized Load Balancing*, 2001.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016. Capítulos 19 e
  20.
- Nygard, Michael. *Release It!*. 2ª ed. Pragmatic Bookshelf, 2018.
