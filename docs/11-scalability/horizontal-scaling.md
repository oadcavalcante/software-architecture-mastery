---
id: horizontal-scaling
title: Escala Horizontal
sidebar_position: 2
description: Mais máquinas — o que ela exige do sistema e por que o ganho nunca é linear.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor conhece os pré-requisitos da escala horizontal e mede o ponto
  em que adicionar nós deixa de compensar.
prerequisites: [vertical-scaling]
related: [vertical-scaling, statelessness, hotspots]
canonical_for: [escala horizontal, escala linear, coeficiente de contenção, ponto de saturação]
content_version: 1
last_reviewed: 2026-08-28
---

# Escala Horizontal

## Visão Geral

Escalar horizontalmente é adicionar máquinas em vez de aumentar uma.

A promessa é atraente: sem teto físico, tolerância a falha embutida, capacidade
proporcional ao investimento.

A realidade tem duas ressalvas que decidem o projeto. Primeira: ela exige que o sistema
seja **capaz** de rodar em várias máquinas — o que é uma propriedade do desenho, não
uma configuração. Segunda: o ganho **nunca é linear**, e existe um ponto além do qual
adicionar nós piora o resultado.

## Problema

Escala vertical tem teto — de tamanho, de custo, de disponibilidade. Ver
[escala vertical](/11-scalability/vertical-scaling.md).

Quando ele é atingido, distribuir é a saída. E distribuir muda a natureza do sistema:
o que era uma chamada de função vira chamada de rede, o que era uma transação vira
coordenação, o que era um estado em memória precisa sair.

Adotar escala horizontal sem preparar o sistema produz o pior dos dois mundos: a
complexidade da distribuição sem o ganho de capacidade.

## Conceitos Centrais

### Os pré-requisitos

Antes de adicionar a segunda máquina, três propriedades precisam existir:

**Ausência de estado no processo.** Sessão em memória, cache local considerado
autoritativo, arquivo em disco — qualquer um impede que a requisição vá para qualquer
nó. Ver [ausência de estado](/11-scalability/statelessness.md).

**Idempotência onde há repetição.** Balanceadores e clientes repetem. Ver
[idempotência](/06-distributed-systems/idempotency.md).

**Descoberta e balanceamento.** Como o tráfego encontra os nós, e como um nó que morre
sai da rotação.

Sem os três, adicionar máquinas cria comportamento inconsistente em vez de capacidade.

### O ganho não é linear

O que se observa medindo sistemas reais:

```text
nós    capacidade    eficiência
 1        1,0×          100%
 2        1,9×           95%
 4        3,6×           90%
 8        6,5×           81%
16       10,0×           63%
32       11,0×           34%   ← passou do ponto de saturação
```

Duas forças causam a degradação:

**Contenção.** Recursos compartilhados — banco, cache, fila — são disputados por mais
clientes.

**Coerência.** Manter os nós de acordo custa comunicação, e esse custo cresce mais
rápido que o número de nós.

A segunda é a que produz o ponto em que **mais nós entregam menos**. Ele existe em
todo sistema, e conhecê-lo — medindo — evita gastar com capacidade que não entrega.

### A fração serial é o teto real

Ver [desempenho versus escalabilidade](/11-scalability/performance-vs-scalability.md). Tudo o que não
paraleliza limita o ganho, independentemente do número de nós.

Numa arquitetura distribuída, a fração serial costuma ser:

```text
o banco de dados          escrita centralizada
um bloqueio distribuído   coordenação
uma sequência única       geração de identificadores
uma partição quente       ver pontos quentes
um serviço central        autorização, configuração
```

Acima de certo número de nós, **remover a fração serial rende mais que adicionar
nós**. Essa inversão é o insight prático mais útil desta seção.

### Escalar não é só multiplicar a aplicação

O erro estrutural: multiplicar a camada de aplicação e deixar tudo o mais igual.

```text
1 nó de aplicação  → 20 conexões ao banco
10 nós             → 200 conexões
50 nós             → 1000 conexões  ← o banco não suporta
```

A camada de aplicação escalou; o banco virou o gargalo, e a pressão sobre ele
aumentou proporcionalmente.

Escalar horizontalmente exige olhar **toda a cadeia**: conexões, cache, fila, serviços
externos, limites de terceiros. Cada um tem seu próprio limite, e o primeiro a ser
atingido define o teto do conjunto.

O intermediário de conexões — que multiplexa muitas conexões de aplicação em poucas de
banco — é o controle que resolve o caso mais comum.

### Elasticidade tem custo de inicialização

Adicionar nós automaticamente parece resolver picos, e o tempo importa: detecção,
provisionamento, inicialização e verificação de saúde somam minutos.

Ver [computação em nuvem](/09-cloud-architecture/cloud-compute.md). Muitos picos
duram menos que isso.

E há um efeito de segunda ordem: nós novos chegam com cache frio, o que aumenta
temporariamente a carga sobre as camadas de trás — exatamente quando elas já estão
pressionadas.

### Nós não são idênticos na prática

A premissa de que todos os nós são equivalentes quebra por razões concretas:

**Hardware heterogêneo.** O provedor entrega gerações diferentes de processador.

**Vizinhos ruidosos.** Uma instância compartilhada com carga alheia.

**Cache frio.** Nós recém-adicionados respondem pior.

**Distribuição desigual.** Conexões persistentes fixam clientes a nós. Ver
[balanceamento para escala](/11-scalability/scaling-load-balancing.md).

Por isso o balanceamento sensível a latência e a carga real supera o distribuído
uniformemente.

## Modelo Mental

**Horizontal remove o teto de tamanho e adiciona o teto de coordenação.** O segundo é
mais baixo do que se espera, e precisa ser medido.

## Quando Usar

- O limite da máquina única foi atingido ou está próximo.
- A disponibilidade exige mais de uma máquina.
- A carga varia muito e a elasticidade tem valor.
- O componente é naturalmente sem estado.
- O custo da instância grande já é desproporcional.

## Quando Não Usar

**Antes de esgotar a vertical.** Ver [escala vertical](/11-scalability/vertical-scaling.md).

**Sem remover o estado do processo.**

**Sem olhar a cadeia inteira.** A aplicação escala e o banco cai.

**Contando com elasticidade para picos curtos.**

**Sem conhecer o ponto de saturação.**

**Quando a fração serial domina.** Adicionar nós não vai ajudar.

## Alternativas

- **[Escala vertical](/11-scalability/vertical-scaling.md)** — sem coordenação.
- **[Cache](/11-scalability/scaling-cache.md)** — reduz a carga em vez de aumentar a capacidade.
- **[Fila](/11-scalability/queue-based-scaling.md)** — absorve pico sem capacidade proporcional.
- **Remover a fração serial** — quando o teto de coordenação foi atingido.
- **Particionamento** — em vez de replicar tudo, dividir o trabalho. Ver
  [particionamento para escala](/11-scalability/scaling-partitioning.md).

## Trade-offs

| Horizontal | Vertical |
|---|---|
| Sem teto físico | Teto da máquina |
| Tolerância a falha | Ponto único |
| Sem parada para crescer | Reinício |
| Coordenação em tudo | Nenhuma |
| Diagnóstico distribuído | Simples |
| Ganho decrescente | Proporcional até o teto |

## Modos de Falha

**Estado no processo.** Comportamento inconsistente entre nós.

**Conexões esgotadas no banco.**

**Ponto de saturação ultrapassado.** Mais nós, menos vazão.

**Cache frio na expansão.** O pico piora no momento de escalar.

**Distribuição desigual.** Alguns nós saturados, outros ociosos.

**Fração serial dominando.** Capacidade adicionada sem efeito.

**Efeito manada.** Todos os nós fazem a mesma coisa ao mesmo tempo — expiração de
cache sincronizada, reconexão simultânea.

## Erros Comuns

**Escalar sem remover estado.**

**Não dimensionar a cadeia inteira.**

**Não medir o ponto de saturação.**

**Assumir ganho linear.**

**Não usar intermediário de conexões.**

**Não considerar que a vertical resolveria.**

## Exemplo Real

Uma plataforma de conteúdo escalou a camada de aplicação de 6 para 60 instâncias para
suportar um lançamento.

A capacidade não aumentou proporcionalmente. Com 60 instâncias, a vazão era cerca de
2,3 vezes a de 6 — e a latência estava pior que com 20.

A investigação encontrou quatro limites, cada um atingido em um ponto diferente da
expansão:

**Conexões de banco.** Cada instância mantinha 20 conexões. Com 60, eram 1.200,
enquanto o banco suportava 500. As instâncias adicionais passavam o tempo esperando
conexão. Resolvido com intermediário de conexões: 60 instâncias passaram a usar 150
conexões reais.

**Sessão em memória.** Descoberto durante o incidente: o balanceador usava afinidade de
sessão porque a aplicação guardava carrinho em memória. Isso fazia a distribuição
seguir o padrão de sessões, não a carga — e as instâncias novas recebiam pouco tráfego
porque não tinham sessões estabelecidas.

**Cache frio.** As instâncias novas subiam sem cache local e faziam consultas que as
antigas não faziam, aumentando a carga sobre o banco no momento de maior pressão.

**Limite de terceiro.** O serviço de recomendação, externo, tinha limite de 300
requisições por segundo por cliente. Com 60 instâncias, o limite era atingido e as
requisições passavam a falhar — o que gerava retentativas, que consumiam mais do limite.

As correções, e o efeito de cada uma:

**Intermediário de conexões** — a mais impactante isoladamente.

**Sessão externalizada** para armazenamento compartilhado, removendo a afinidade. A
distribuição passou a seguir a carga.

**Aquecimento de cache** na inicialização, com o nó entrando na rotação só depois.

**Cache compartilhado** para as respostas do serviço de recomendação, reduzindo as
chamadas externas em 85%.

Após as correções, 40 instâncias entregavam 6,2 vezes a capacidade de 6 — e a medição
mostrou que acima de 45 o ganho ficava marginal.

Esse número virou o teto configurado do escalonamento automático, com alerta quando
ele é atingido.

A expansão para 60 instâncias foi feita durante o incidente,
na esperança de que capacidade resolvesse. Ela custou dinheiro, piorou a latência, e o
diagnóstico só começou depois que alguém perguntou por que não estava funcionando.

## Conceitos Relacionados

- [Escala Vertical](/11-scalability/vertical-scaling.md) — a alternativa.
- [Ausência de Estado](/11-scalability/statelessness.md) — o pré-requisito.
- [Pontos Quentes](/11-scalability/hotspots.md) — por que a distribuição desigual anula o ganho.
- [Escala de Banco de Dados](/11-scalability/database-scaling.md) — o limite da cadeia.

## Exercício Prático

Meça a capacidade do seu sistema com N e com 2N instâncias, sob a mesma carga
sintética.

Se a capacidade não crescer perto de 2×, você encontrou um limite na cadeia — e ele é
mais interessante que o número de instâncias.

## Perguntas de Entrevista

- Quais os três pré-requisitos da escala horizontal?
- Por que o ganho não é linear, e o que produz o ponto de saturação?
- Por que escalar a aplicação pode derrubar o banco?

## Para Aprofundar

- Gunther, Neil. *Guerrilla Capacity Planning*. Springer, 2007 — a lei da
  escalabilidade universal.
- Amdahl, Gene. *Validity of the Single Processor Approach*, 1967.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
