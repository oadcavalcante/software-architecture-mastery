---
id: back-of-envelope
title: Cálculo de Guardanapo
sidebar_position: 4
description: Os números de referência que permitem estimar sem consultar nada, e a aritmética que cabe de cabeça.
doc_type: concept
level: 0
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor faz cálculos de ordem de magnitude de cabeça, com referências
  memorizadas de latência, tamanho e capacidade.
prerequisites: [capacity-estimation]
related: [capacity-estimation, interview-scaling, bottleneck-identification]
canonical_for: [cálculo de guardanapo, ordem de magnitude, número de referência, aritmética de entrevista]
content_version: 1
last_reviewed: 2026-08-29
---

# Cálculo de Guardanapo

## Visão Geral

Cálculo de guardanapo é a habilidade de chegar à ordem de grandeza correta usando apenas números
memorizados e aritmética simples.

Ele importa porque a maior parte das decisões de arquitetura não depende de precisão — depende de
saber se algo é milissegundos ou segundos, gigabytes ou terabytes, uma máquina ou mil.

```text
"cabe em memória?"           GB contra TB
"precisa de particionamento?"  milhares contra milhões por segundo
"vale fazer cache?"          latência de rede contra de disco
"dá para varrer isso?"       segundos contra horas
```

Errar por um fator de dois é irrelevante. Errar por um fator de mil muda tudo, e é isso que as
referências evitam.

## Problema

Sem referências memorizadas, o candidato trava. A conversa fica assim:

```text
entrevistador   "isso cabe em memória?"
candidato       "hmm... depende do tamanho"
entrevistador   "estime"
candidato       (silêncio)
```

O travamento não é falta de inteligência — é falta de âncoras. Quem não sabe que uma leitura de
disco leva cerca de um milissegundo e uma de memória cerca de cem nanossegundos não tem como
comparar as duas de cabeça.

E há o erro oposto: fazer contas complicadas. Multiplicar 86.400 por 347 mentalmente durante uma
entrevista é desperdício de atenção — arredondar para 100.000 × 350 dá o mesmo resultado útil com
uma fração do esforço.

## Conceitos Centrais

### Latências de referência

Os números que mais decidem, em ordem de grandeza:

```text
referência a cache de CPU            ~1 ns
acesso a memória principal           ~100 ns
compressão de 1 KB                   ~10 µs
leitura de 1 MB da memória           ~50 µs
ida e volta na mesma rede local      ~0,5 ms
leitura aleatória em SSD             ~0,1 ms
leitura de 1 MB de SSD               ~1 ms
leitura aleatória em disco rotativo  ~10 ms
ida e volta entre continentes        ~150 ms
```

O que se extrai deles é a hierarquia, e ela é o que importa:

```text
memória é ~1 000× mais rápida que SSD
SSD é ~100× mais rápido que disco rotativo
rede local é ~300× mais rápida que rede intercontinental
```

Isso responde à maior parte das perguntas de latência sem nenhuma conta.

Vale entender por que essa hierarquia decide tanto. Um sistema que faz uma ida e volta
intercontinental no caminho de uma requisição não consegue ficar abaixo de 150 ms, por melhor que
seja tudo o mais — a física impõe o piso. Um sistema que lê de memória em vez de disco melhora
por três ordens de grandeza, o que nenhuma otimização de código alcança.

Reconhecer que a latência é dominada pelo elo mais lento da cadeia é o que permite responder
rapidamente a "como reduzir a latência disso?" — a resposta é sempre remover ou paralelizar o
elo dominante, e as referências são o que permite identificá-lo sem medir.

### Tamanhos de referência

```text
caractere ASCII                1 byte
identificador (UUID)           16 bytes
timestamp                      8 bytes
linha típica de banco          ~100 a 1 000 bytes
post de texto curto            ~300 bytes a 1 KB
imagem comprimida              ~200 KB a 2 MB
minuto de vídeo em alta
  definição                    ~50 MB
```

Para tamanhos que você não sabe, decompor funciona: um registro de pedido tem identificador,
cliente, itens, valores e carimbos — algo entre 500 bytes e 2 KB. Declarar a premissa e seguir é
a resposta certa.

Um erro de fator dois no tamanho do registro raramente muda uma decisão de arquitetura; travar
por não saber o valor exato custa tempo e transmite insegurança. A postura correta é decompor,
propor um número, dizer que é premissa, e continuar.

### Capacidades de referência

```text
uma máquina moderna comum
  memória                      64 a 512 GB
  requisições HTTP simples/s   alguns milhares a dezenas de milhares
  conexões simultâneas         dezenas de milhares
  vazão de rede                10 Gbps  ≈  1 GB/s

um banco relacional bem afinado
  leituras simples/s           dezenas de milhares
  escritas/s                   milhares a dezenas de milhares
  linhas antes de exigir
    particionamento            centenas de milhões a bilhões
```

O último item é o mais útil e o mais mal calibrado nas entrevistas: candidatos propõem
particionamento para volumes que um banco relacional atende sem esforço.

A calibração errada tem origem identificável: a literatura de entrevistas descreve sistemas de
escala global, e a intuição formada por ela superestima o que exige distribuição. Um banco
relacional em máquina moderna atende dezenas de milhares de leituras por segundo e bilhões de
linhas — o que cobre a maior parte dos sistemas que existem, e boa parte dos enunciados de
entrevista.

Propor a solução distribuída quando a simples basta é interpretado como falta de julgamento, não
como ambição. A resposta forte é o oposto: "esse volume cabe num banco só; se crescer 20×,
aí sim particionamos, e a chave seria esta".

### Aritmética que cabe de cabeça

```text
1 dia            ≈ 10⁵ segundos   (86 400 → 100 000)
1 mês            ≈ 2,5 × 10⁶ s
1 ano            ≈ 3 × 10⁷ s

1 milhão/dia     ≈ 10/s
1 bilhão/dia     ≈ 10 000/s
1 milhão/s       = 86 bilhões/dia
```

E as potências de dez para armazenamento:

```text
10⁹ registros × 1 KB  = 1 TB
10⁶ registros × 1 MB  = 1 TB
10¹² bytes            = 1 TB
10¹⁵ bytes            = 1 PB
```

Memorizar que **um bilhão de registros de um kilobyte é um terabyte** resolve a maior parte das
estimativas de armazenamento em uma multiplicação.

### Arredonde antes de multiplicar

```text
ruim   347 milhões × 1 437 bytes ÷ 86 400
bom    350 M × 1,5 KB  →  ~500 GB/dia
       ÷ 100 000 s  →  ~5 MB/s
```

A segunda forma é feita falando, em cinco segundos, e chega ao mesmo lugar. Precisão além da
ordem de grandeza é ruído num contexto em que as premissas de entrada são estimativas.

### Verifique a plausibilidade do resultado

Um hábito que evita erros grosseiros: comparar o resultado com algo conhecido.

```text
"cheguei a 40 PB por dia — isso é mais que o tráfego de
 uma rede social global inteira. Devo ter errado uma
 ordem de grandeza."

"cheguei a 3 requisições por segundo — isso é menos que um
 blog pessoal. Provavelmente subestimei o número de usuários."
```

Fazer essa verificação em voz alta demonstra calibração, que é exatamente o que o exercício mede.

A verificação de plausibilidade é também a defesa contra o erro mais caro deste tipo de cálculo:
uma ordem de grandeza perdida numa conversão. Trocar milhões por bilhões, ou megabytes por
gigabytes, muda o resultado por mil — e o número resultante costuma ser absurdo de uma forma
detectável, se alguém olhar para ele com uma referência em mente.

Ter duas ou três âncoras de comparação memorizadas resolve isso: o tráfego aproximado de um
grande serviço, o armazenamento de uma organização de porte médio, a capacidade de uma máquina.
Qualquer resultado muito distante dessas âncoras merece um segundo olhar antes de virar
argumento.

## Modelo Mental

**Hierarquia, não precisão.** Memorize as ordens de grandeza, arredonde antes de multiplicar, e
confira se o resultado é plausível.

## Quando Usar

- Em qualquer estimativa durante a entrevista.
- Para responder rapidamente a "isso cabe em memória?" ou "isso escala?".
- Para verificar a plausibilidade de uma proposta, própria ou do entrevistador.

## Quando Não Usar

**Buscando precisão** — o exercício não é esse.

**Com contas complicadas** — arredonde.

**Sem verificar plausibilidade.**

**Como substituto de medição** em contexto real; aqui é entrevista, lá é perfilamento.

**Recitando números** sem usá-los para decidir.

## Alternativas

- **Declarar a ordem de grandeza direto** — "estamos na casa de terabytes" — quando a conta não
  acrescenta.
- **Comparar com um sistema conhecido** — "isso é da ordem do volume de uma rede social média".
- **Perguntar** — se o entrevistador tem o número, usá-lo é mais rápido.

## Trade-offs

| Calcular | Declarar ordem de grandeza |
|---|---|
| Demonstra método | Mais rápido |
| Ancora as premissas | Menos verificável |
| Consome tempo | Pode parecer chute |

| Mais referências memorizadas | Menos |
|---|---|
| Respostas imediatas | Menos a decorar |
| Risco de recitar sem usar | Risco de travar |

## Modos de Falha

**Travar por falta de âncora.**

**Conta complicada** que consome atenção.

**Erro de ordem de grandeza** não percebido.

**Recitar números** sem conectar a uma decisão.

**Subestimar a capacidade de uma máquina** — e propor distribuição desnecessária.

## Erros Comuns

**Propor particionamento** para volumes que um banco atende.

**Confundir bits e bytes** em cálculos de banda.

**Esquecer replicação e índices** no armazenamento.

**Não verificar se o resultado é plausível.**

**Usar 86 400 em vez de 100 000** e perder tempo.

## Exemplo de Entrevista

**Pergunta.** "Um sistema armazena 500 milhões de fotos por dia, com 2 MB em média. Quanto isso
dá por ano, e cabe em quê?"

**Raciocínio em voz alta:**

```text
"500 milhões × 2 MB = 1 petabyte por dia.
 Arredondando o ano para 400 dias — para facilitar e ficar
 conservador —, dá 400 PB por ano.

 Verificando a plausibilidade: isso é da ordem do que uma
 rede social global armazena, o que é coerente com 500 milhões
 de fotos diárias.

 Com replicação de 3×, chego a 1,2 exabyte por ano de
 armazenamento bruto. Isso descarta qualquer solução que não
 seja armazenamento de objetos distribuído, e torna a
 hierarquia por idade obrigatória — não por escolha, por custo."
```

**Segunda pergunta.** "E os metadados dessas fotos, cabem em memória?"

```text
"Metadados de uma foto: identificador, autor, carimbo,
 dimensões, localização, referência ao objeto — vou assumir
 200 bytes.

 500 milhões por dia × 400 dias = 200 bilhões de registros por ano.
 × 200 bytes = 40 TB por ano.

 Não cabe em memória para o histórico completo. Mas o conjunto
 quente cabe: se as fotos dos últimos 7 dias respondem pela maior
 parte dos acessos, são 3,5 bilhões de registros, ou 700 GB —
 viável em memória distribuída."
```

A segunda resposta é a que diferencia: ela não para em "não cabe", identifica o subconjunto que
cabe, e conecta isso à decisão de cache. Responder apenas "não cabe" encerra a linha de
raciocínio; identificar o recorte que cabe abre a solução.

**Terceira pergunta.** "Quantas máquinas para servir 200 mil requisições por segundo de
metadados?"

```text
"Uma máquina serve alguns milhares a dezenas de milhares de
 requisições simples por segundo. Vou assumir 10 mil, que é
 conservador para leitura de cache.

 200 mil ÷ 10 mil = 20 máquinas para a carga.
 Com margem para pico e para falha, algo entre 40 e 60.

 Verificando: 60 máquinas para servir metadados de uma rede
 social grande parece razoável — não é absurdamente baixo
 nem alto."
```

## Conceitos Relacionados

- [Estimativa em Entrevista](/22-system-design-interviews/capacity-estimation.md).
- [Escala em Entrevista](/22-system-design-interviews/interview-scaling.md).
- [Latência](/06-distributed-systems/latency.md).
- [Cache](/05-system-design/caching.md).

## Exercício Prático

Sem consultar nada, escreva de memória: a latência de acesso a memória, a SSD e a rede
intercontinental; quantos segundos tem um dia, arredondado; e quantos terabytes são um bilhão de
registros de 1 KB.

Se você travou em algum, essa é a âncora que está faltando.

## Perguntas de Entrevista

- Quantas ordens de grandeza separam memória de SSD, e SSD de disco rotativo?
- Por que arredondar 86.400 para 100.000 é a escolha certa?
- Como verificar se um resultado de estimativa é plausível?

## Para Aprofundar

- Dean, Jeff. *Numbers Everyone Should Know*. Google, 2009.
- Bentley, Jon. *Programming Pearls*. 2ª ed. Addison-Wesley, 1999 — cap. 7.
- Xu, Alex. *System Design Interview*. Byte Code, 2020.
