---
id: capacity-planning
title: Planejamento de Capacidade
sidebar_position: 21
description: Estimar antes de construir — e por que a ordem de grandeza importa mais que a precisão.
doc_type: concept
level: 3
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor produz estimativas de capacidade que eliminam
  arquiteturas inviáveis, sem confundir estimativa com previsão.
prerequisites: [components]
related: [bottleneck-analysis, scalability-basics, back-of-envelope]
canonical_for: [planejamento de capacidade, estimativa de capacidade]
content_version: 1
last_reviewed: 2026-08-27
---

# Planejamento de Capacidade

## Visão Geral

Planejamento de capacidade é estimar quanto o sistema precisa suportar — em
volume, dado e banda — antes de construí-lo.

O objetivo não é acertar o número. É **descobrir a ordem de grandeza**, porque é
ela que elimina arquiteturas inviáveis e revela onde o problema vai estar.

## Problema

Sem estimativa, toda decisão de arquitetura fica sem critério. "Precisamos de
cache?" não tem resposta se ninguém sabe quantas leituras por segundo existem.

O resultado é decidir por reputação — adotar o que sistemas grandes adotam — ou
por familiaridade. Nos dois casos, o sistema é dimensionado para uma escala que
alguém imaginou.

E a estimativa costuma ser evitada por um motivo específico: as pessoas acham que
precisa ser precisa. Não precisa. **Uma estimativa que erra por 3× e acerta a
ordem de grandeza já elimina as opções erradas.**

## Conceitos Centrais

### O que estimar, nesta ordem

**Volume de operações.** Quantas por dia, e qual o pico. A razão entre pico e média
importa mais que a média — sistemas caem no pico.

**Distribuição entre leitura e escrita.** Um sistema com razão de 100 para 1 tem
arquitetura diferente de um com 1 para 1.

**Volume de dados.** Quanto cresce por dia, quanto acumula em um ano, três anos.

**Tamanho médio do registro.** Multiplicado pelo volume, dá armazenamento.

**Banda.** Volume × tamanho da resposta. É o que frequentemente surpreende em
sistemas com mídia.

**Conexões simultâneas.** Relevante para conexões longas e para dimensionar pools.

### A aritmética de guardanapo

Números que vale ter na cabeça, porque tornam a estimativa rápida:

```text
1 dia            ≈ 86 400 s   ≈ 10⁵ s
1 milhão/dia     ≈ 12 /s
100 milhões/dia  ≈ 1 200 /s
1 bilhão/dia     ≈ 12 000 /s
```

Regra prática de pico: **o pico costuma ser 2× a 5× a média** em sistemas com uso
humano, e muito mais em sistemas com evento concentrado — venda de ingresso,
Black Friday, fechamento contábil.

Um exemplo completo:

```text
10 milhões de pedidos/mês
  → 333 mil/dia → ~4 /s de média
  → pico 3×     → ~12 /s

registro de 2 KB
  → 20 GB/ano de pedidos
  → cabe em uma instância, com folga

leituras 50× escritas
  → ~200 /s de leitura no pico
  → cache resolve; réplica não é necessária ainda
```

Esse cálculo leva cinco minutos e já responde três decisões de arquitetura.

### O que a estimativa elimina

O valor está em **descartar**, não em prever.

12 requisições por segundo elimina qualquer discussão sobre particionamento,
sistema distribuído ou arquitetura baseada em espaço. Um banco de dados numa
instância atende com folga de ordens de grandeza.

12 mil por segundo elimina a instância única e obriga a pensar em partição,
réplica e cache desde o início.

A diferença entre os dois é o que a estimativa revela — e ela não muda se o número
real for 15 ou 9.

### Estimativa não é previsão

Estimativa diz o que o sistema precisa suportar dado um cenário. Previsão diz o
que vai acontecer.

A primeira é útil e verificável. A segunda erra, sempre, e o erro típico é para
mais — todo produto espera crescer cem vezes.

A pergunta que evita superdimensionar: **qual o crescimento nos próximos doze
meses, e quanto custa adiar a decisão de escala até lá?** Frequentemente adiar é
barato, e a arquitetura para cem vezes nunca é exercida.

### Reestimar quando o real chegar

A estimativa inicial é substituída por medição assim que o sistema roda. Continuar
dimensionando por estimativa quando há dado real é escolher a fonte pior.

## Modelo Mental

**Ordem de grandeza, não número.** A pergunta é se são dezenas, milhares ou
milhões — porque cada faixa tem uma arquitetura diferente.

## Quando Usar

- Antes de decidir a arquitetura de um sistema novo.
- Ao avaliar se uma decisão de escala se justifica.
- Em entrevista de system design — ver
  [estimativa de capacidade](/22-system-design-interviews/index.md).
- Ao dimensionar infraestrutura e orçamento.
- Antes de adotar qualquer componente distribuído.

## Quando Não Usar

**Buscando precisão.** Estimativa com três casas decimais dá falsa confiança e
custa tempo.

**Quando há dado real.** Meça.

**Para justificar decisão já tomada.** Estimativa construída para confirmar uma
escolha não elimina nada.

**Projetando para escala imaginada.** Ver
[YAGNI](/02-software-design/yagni.md). Dimensione para o horizonte previsível,
com caminho para crescer.

## Alternativas

- **Medir** — quando o sistema existe.
- **Teste de carga** — para descobrir o limite real em vez de calcular.
- **Comparar com sistema similar** — quando há um interno com perfil parecido.

## Trade-offs

| Estimar antes | Descobrir depois |
|---|---|
| Elimina opções inviáveis cedo | Descoberto em produção |
| Dimensionamento com critério | Por reputação |
| Tempo gasto antes de construir | Zero |
| Pode superdimensionar | Pode subdimensionar |

## Modos de Falha

**Estimar só a média.** O sistema cai no pico.

**Esquecer o crescimento do dado.** O volume por segundo cabe, e o armazenamento
de três anos não.

**Ignorar a banda.** Resposta de 500 KB a 200 requisições por segundo são 100 MB/s
de saída — frequentemente o custo dominante.

**Superdimensionar por previsão otimista.**

**Estimar e nunca comparar com o real.** Sem essa comparação, ninguém melhora a
estimativa seguinte.

## Erros Comuns

**Pular a estimativa.** Sem ela, a decisão de arquitetura é tomada por intuição sobre volume — e intuição sobre volume erra por ordens de grandeza, nos dois sentidos.

**Buscar precisão em vez de ordem de grandeza.** A pergunta que a estimativa responde é se cabe numa máquina ou exige cem. Refinar de 8.200 para 8.350 requisições por segundo não muda decisão nenhuma.

**Não estimar o pico.** A média não dimensiona nada: o sistema precisa aguentar a Black Friday, não a terça-feira. A razão entre pico e média costuma ser de uma ordem de grandeza e é o número que decide.

**Não estimar crescimento acumulado.** Vazão se resolve adicionando máquina; volume armazenado, não. É o eixo que decide particionamento e retenção, e o que mais frequentemente fica de fora da conta.

**Usar a estimativa como previsão comprometida.** Ela existe para eliminar arquiteturas inviáveis, não para virar meta contratual. Tratada como promessa, produz superdimensionamento defensivo.

## Exemplo Real

Uma equipe ia construir uma plataforma de telemetria de veículos e propôs, de
partida: banco de série temporal distribuído, fila particionada e processamento em
fluxo.

A estimativa levou dez minutos.

```text
8 000 veículos
1 leitura a cada 30 s → 8 000/30 ≈ 267 /s
registro de 200 bytes → 53 KB/s → 4,6 GB/dia → 1,7 TB/ano

consultas: ~50 usuários, ~2 consultas/min → 1,7 /s
```

267 escritas por segundo e menos de 2 leituras. Um banco relacional com tabela
particionada por tempo atende com folga.

O volume acumulado — 1,7 TB/ano — era o único número que exigia decisão: retenção.
A conversa com o negócio definiu 90 dias em detalhe e agregação mensal depois, o
que reduziu o acervo ativo para 420 GB.

O sistema foi construído com uma instância de banco relacional e um processo de
ingestão. Rodou por três anos.

No terceiro ano, a frota chegou a 60 mil veículos — 2 000 escritas por segundo — e
o particionamento passou a ser necessário. A decisão foi tomada com dado real, não
com estimativa, e custou duas semanas.

O que a estimativa evitou: três anos operando um sistema distribuído para uma
carga que uma instância atendia, com o custo operacional correspondente.

E o que ela acertou não foi o número — a frota cresceu mais que o previsto. Foi a
**ordem de grandeza inicial**, que era centenas e não dezenas de milhares.

## Números de referência

Estimativa fica rápida quando algumas ordens de grandeza estão na memória. Estes
não precisam ser exatos — precisam ser a ordem certa.

**Latência**

| Operação | Ordem |
|---|---|
| Leitura de memória | ~100 ns |
| Leitura sequencial de 1 MB em memória | ~10 µs |
| Ida e volta na mesma zona | ~0,5 ms |
| Leitura aleatória em disco de estado sólido | ~100 µs |
| Ida e volta entre regiões do mesmo continente | ~30 ms |
| Ida e volta intercontinental | ~150 ms |

A última linha é a que mais decide arquitetura: nenhuma otimização de código
compensa a distância física, e é por isso que
[CDN](/05-system-design/cdn.md) e multi-região existem.

**Vazão típica de uma instância**

| Componente | Ordem |
|---|---|
| Aplicação sem estado, requisição simples | milhares/s |
| Banco relacional, escrita simples | milhares/s |
| Banco relacional, consulta com junção | centenas/s |
| Cache em memória | dezenas de milhares/s |

Esses números variam por uma ordem de grandeza conforme o caso. O valor deles é
outro: eles dizem que **uma instância de banco atende milhares por segundo**, o
que elimina discussões sobre particionamento em sistemas de dezenas por segundo.

Números atribuídos a sistemas reais devem ser medidos, não estimados. Estes servem
para descartar, não para dimensionar.

## Conceitos Relacionados

- [Análise de Gargalos](/05-system-design/bottleneck-analysis.md) — onde o limite aparece.
- [Escalabilidade Básica](/05-system-design/scalability-basics.md) — o que fazer com o resultado.
- [Cálculos de Guardanapo](/22-system-design-interviews/index.md) — a técnica em
  entrevista.
- [Arquitetura de Custo](/09-cloud-architecture/cost-architecture.md).

## Exercício Prático

Estime a capacidade do sistema em que você trabalha, sem consultar métricas:
operações por segundo no pico, crescimento de dado por dia, banda de saída.

Depois compare com o real. A distância entre os dois diz quão bem você conhece o
sistema — e o exercício melhora a próxima estimativa.

## Perguntas de Entrevista

- O que se estima, e em que ordem?
- Por que a ordem de grandeza importa mais que a precisão?
- Qual a diferença entre estimativa e previsão?

## Para Aprofundar

- Dean, Jeff. *Numbers Everyone Should Know* — a tabela de latências de referência.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 — capítulo
  sobre planejamento de capacidade.
