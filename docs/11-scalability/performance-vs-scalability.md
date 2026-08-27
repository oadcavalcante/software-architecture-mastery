---
id: performance-vs-scalability
title: Desempenho versus Escalabilidade
sidebar_position: 13
description: Duas propriedades diferentes, medidas de formas diferentes — e confundi-las direciona o esforço para o lugar errado.
doc_type: tradeoff
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor identifica se um problema é de desempenho ou de escala, e
  escolhe a medição que responde a essa pergunta.
prerequisites: [scalability]
related: [scaling-capacity-planning, hotspots, horizontal-scaling]
canonical_for: [desempenho versus escalabilidade, latência sob carga, lei de Little, lei de Amdahl]
content_version: 1
last_reviewed: 2026-08-28
---

# Desempenho versus Escalabilidade

## Visão Geral

São duas propriedades diferentes:

```text
desempenho      quão rápido uma unidade de trabalho é feita
escalabilidade  o que acontece com o custo por unidade quando o volume cresce
```

Um sistema pode ser rápido e não escalar. Pode ser lento e escalar perfeitamente. As
duas propriedades são independentes, e as intervenções que melhoram uma
frequentemente não melhoram a outra.

Confundi-las é a razão mais comum de um projeto de escala não resolver o problema que
motivou.

## Problema

O sintoma reportado é quase sempre o mesmo: "o sistema está lento".

A partir daí, duas interpretações levam a caminhos opostos:

**Problema de desempenho.** Uma operação é intrinsecamente lenta. Ela demora o mesmo
com um usuário ou com mil. A resposta é otimizar aquela operação.

**Problema de escala.** A operação é rápida sozinha e degrada com carga. A resposta é
remover contenção ou adicionar capacidade.

Aplicar a resposta errada é caro nos dois sentidos: otimizar código que já é rápido, ou
adicionar máquinas para uma consulta que demora igual em qualquer uma.

## Conceitos Centrais

### A medição que separa as duas

Uma única medição responde: **latência com carga baixa contra latência com carga
alta.**

```text
1 req/s: 800 ms | 1000 req/s: 850 ms  → desempenho. Escala bem, é lento.
1 req/s:  40 ms | 1000 req/s: 3000 ms → escala. É rápido, degrada sob carga.
1 req/s: 800 ms | 1000 req/s: 4000 ms → os dois.
```

Sem essa comparação, o diagnóstico é palpite. E ela é barata: um teste com um usuário
e um teste com carga.

O erro de instrumentação que impede isso: medir apenas a média em produção, sem separar
por nível de carga. A média mistura os dois regimes.

### Vazão e latência não são a mesma coisa

**Latência** é o tempo de uma operação.

**Vazão** é o número de operações por unidade de tempo.

Elas se relacionam e não são proporcionais: um sistema pode dobrar a vazão adicionando
paralelismo, sem que a latência de cada operação melhore em nada.

E a relação inverte sob saturação: acima de certo ponto, aumentar a carga **reduz** a
vazão, porque a contenção passa a consumir mais que o trabalho útil.

### A lei de Little organiza o raciocínio

```text
requisições em andamento = vazão × latência média
```

Simples e poderosa. Dela saem conclusões práticas:

**Se a latência dobra e a vazão se mantém, o número de requisições simultâneas dobra**
— o que significa o dobro de conexões, de memória, de descritores. É por isso que uma
lentidão em uma dependência esgota recursos que não têm relação aparente com ela.

**Para sustentar 1.000 req/s com 200 ms de latência**, o sistema precisa suportar 200
requisições simultâneas. Se o limite de conexões for 100, a vazão máxima é 500 req/s,
independentemente de CPU.

Essa última conta é a que revela gargalos que nenhum gráfico de CPU mostra.

### A lei de Amdahl define o teto

A parte de um processamento que **não** paraleliza limita o ganho, independentemente de
quantos recursos você adicione.

```text
fração serial   ganho máximo
       10%           10×
        5%           20×
        1%          100×
      0,1%        1.000×
```

Numa arquitetura distribuída, a "fração serial" é tudo o que coordena: um bloqueio, um
contador central, uma sequência única, uma partição quente.

A consequência prática muda o alvo: acima de certo ponto, **remover a fração serial vale
mais que adicionar capacidade**. Um contador global substituído por contadores parciais
somados na leitura pode render mais que dobrar as máquinas.

### Escala linear é a exceção

O ideal — dobrar recursos, dobrar capacidade — raramente acontece.

O que se observa na prática:

```text
2 nós  → 1,9× da capacidade
4 nós  → 3,6×
8 nós  → 6,5×
16 nós → 10×
32 nós → 11×   ← a coordenação passa a custar mais que o ganho
```

A degradação vem de coordenação e de contenção sobre recursos compartilhados. Existe um
ponto além do qual adicionar nós **piora** o resultado.

Conhecer esse ponto para o seu sistema — medindo, não estimando — é o que evita gastar
com capacidade que não entrega.

### O gargalo é sempre um só de cada vez

Um sistema tem um recurso limitante em cada momento. Otimizar qualquer outro não muda
nada.

```text
CPU alta, disco ocioso        → CPU é o gargalo
CPU baixa, latência alta      → espera: rede, disco, bloqueio, dependência
conexões esgotadas            → concorrência, não capacidade
uma partição a 100%, resto ocioso → ponto quente
```

A quarta linha é a que mais engana: a média de utilização parece confortável, e o
sistema está saturado. Ver [pontos quentes](hotspots.md).

Depois de remover um gargalo, o próximo aparece — em outro lugar. Isso não é falha do
trabalho; é como funciona.

## Modelo Mental

**Desempenho é o tempo de uma operação; escalabilidade é o que acontece com muitas.**
A medição que separa as duas custa uma tarde.

## Quando Usar

Fazer a distinção explícita é necessário sempre que:

- Alguém reporta lentidão.
- Há proposta de adicionar capacidade.
- O volume vai crescer em ordens de grandeza.
- O custo de infraestrutura cresce mais rápido que o negócio.

## Quando Não Usar

**Adicionar capacidade sem identificar o gargalo.**

**Otimizar sem medir sob carga.**

**Perseguir escala linear.** Ela não existe; conheça o seu ponto de saturação.

**Otimizar o que não é o gargalo.**

**Medir só a média.** Ela esconde a cauda e mistura regimes de carga.

**Escalar antes de precisar.** Complexidade permanente por um problema hipotético.

## Alternativas

Formas de resolver "está lento" sem adicionar capacidade:

- **Índice adequado** — a causa mais comum. Ver
  [indexação](../07-data-architecture/indexing.md).
- **Cache** — reduz trabalho repetido.
- **Assíncrono** — tira a operação do caminho crítico. Ver
  [processamento assíncrono](async-processing.md).
- **Remover a fração serial** — o de maior retorno quando o teto de Amdahl foi
  atingido.
- **Separar cargas** — analítico fora do transacional. Ver
  [OLTP](../07-data-architecture/oltp.md).

## Trade-offs

| Otimizar desempenho | Adicionar capacidade |
|---|---|
| Reduz custo por operação | Aumenta custo total |
| Exige tempo de engenharia | Imediato |
| Ganho limitado pela operação | Limitado pela contenção |
| Melhora com carga baixa também | Só sob carga |

| Escala vertical | Horizontal |
|---|---|
| Sem coordenação | Coordenação custa |
| Teto da máquina maior | Teto de contenção |
| Simples | Complexidade permanente |

## Modos de Falha

**Capacidade adicionada sem efeito.** O gargalo era outro.

**Otimização do caminho errado.** Semanas gastas em código que não era o limitante.

**Saturação por concorrência.** Conexões esgotadas com CPU ociosa.

**Ponto de saturação ultrapassado.** Mais nós, menos vazão.

**Média escondendo a cauda.** O percentil 99 está péssimo e a média parece boa.

**Teste de carga irreal.** Dados sintéticos sem a distribuição real produzem resultados
que não se confirmam.

## Erros Comuns

**Não medir latência em dois níveis de carga.**

**Adicionar máquinas como primeira resposta.**

**Ignorar a lei de Little** ao dimensionar conexões e concorrência.

**Não identificar a fração serial.**

**Otimizar antes de encontrar o gargalo.**

**Confiar em média.**

## Exemplo Real

Uma plataforma de reservas recebeu a diretriz de "resolver a escalabilidade" após
lentidões recorrentes em horário de pico.

O plano proposto: migrar para microsserviços e adicionar escalonamento automático.
Estimativa de nove meses.

Antes de aprovar, foi feita a medição em dois níveis de carga:

```text
operação                    1 usuário    pico
busca de disponibilidade      2.400 ms   2.600 ms
detalhe da reserva               45 ms   1.900 ms
confirmação                     120 ms   4.200 ms
```

Três diagnósticos diferentes, na mesma tela:

**Busca de disponibilidade: problema de desempenho.** Lenta sozinha, praticamente igual
sob carga. Nenhuma quantidade de máquinas ajudaria. A causa era uma consulta com
junções desnecessárias e sem índice adequado. Corrigida: 2.400 ms para 180 ms.

**Detalhe da reserva: problema de escala.** Rápida sozinha, degrada. A causa era o
esgotamento do pool de conexões — 50 conexões, com latência de 45 ms, limitando a vazão
a cerca de 1.100 req/s pela lei de Little. O pico pedia 1.800. Aumentar o pool e reduzir
o tempo de posse da conexão resolveu.

**Confirmação: os dois.** Lenta sozinha e pior sob carga. A lentidão vinha de uma
chamada síncrona a um serviço de pagamento; a degradação, de todas as confirmações
competirem por um bloqueio na tabela de inventário.

A confirmação recebeu duas correções independentes: a chamada de pagamento virou
assíncrona com estado explícito, e o bloqueio único foi substituído por bloqueio por
recurso, removendo a fração serial.

Resultado: as três operações ficaram dentro do alvo em seis semanas, sem microsserviços
e sem aumentar capacidade.

Seis meses depois, com o dobro do volume, o sistema continuou dentro do alvo — o que
não teria acontecido se o plano original tivesse sido executado, porque a busca de
disponibilidade seria igualmente lenta em qualquer arquitetura.

O que a equipe registra: a medição que direcionou tudo levou uma tarde. O plano de nove
meses tinha sido montado a partir do sintoma, sem nenhuma medição que distinguisse os
três casos.

## Conceitos Relacionados

- [Pontos Quentes](hotspots.md) — quando a média engana.
- [Escala Horizontal](horizontal-scaling.md) e [Vertical](vertical-scaling.md).
- [Planejamento de Capacidade](scaling-capacity-planning.md).
- [Análise de Gargalos](../05-system-design/bottleneck-analysis.md).

## Exercício Prático

Pegue a operação mais reclamada do seu sistema e meça a latência com um único usuário e
sob carga de pico.

A diferença entre os dois números diz qual problema você tem — e provavelmente
contradiz a hipótese em que o time está trabalhando.

## Perguntas de Entrevista

- Qual medição distingue problema de desempenho de problema de escala?
- Como a lei de Little revela gargalos que gráficos de CPU não mostram?
- Por que remover a fração serial pode render mais que adicionar capacidade?

## Para Aprofundar

- Amdahl, Gene. *Validity of the Single Processor Approach*, 1967.
- Gunther, Neil. *Guerrilla Capacity Planning*. Springer, 2007 — a lei da
  escalabilidade universal.
- Gregg, Brendan. *Systems Performance*. 2ª ed. Addison-Wesley, 2020.
