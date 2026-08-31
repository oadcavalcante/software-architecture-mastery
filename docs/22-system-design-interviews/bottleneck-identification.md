---
id: bottleneck-identification
title: Identificação de Gargalo
sidebar_position: 8
description: Qual recurso satura primeiro — a pergunta que separa quem desenhou de quem entendeu o desenho.
doc_type: concept
level: 0
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor identifica o recurso que satura primeiro num desenho e propõe a
  correção proporcional.
prerequisites: [high-level-architecture]
related: [high-level-architecture, interview-scaling, failure-handling]
canonical_for: [identificação de gargalo em entrevista, primeiro recurso a saturar, gargalo deslocado]
content_version: 1
last_reviewed: 2026-08-29
---

# Identificação de Gargalo

## Visão Geral

Depois do desenho, a entrevista entra na fase que mais diferencia candidatos. A pergunta,
explícita ou não, é sempre a mesma:

```text
"o que satura primeiro?"
```

Responder exige entender o próprio desenho — não apenas tê-lo produzido. Um candidato que
desenhou por memória trava aqui; um que derivou cada caixa de um número sabe exatamente onde a
carga se acumula.

E há uma segunda parte, igualmente avaliada: **o que satura depois**. Corrigir um gargalo desloca
a pressão para o próximo, e antecipar isso demonstra que você entende o sistema como um todo.

## Problema

Três padrões de erro.

**Não saber.** O desenho existe, e o candidato não consegue dizer qual componente atinge o limite
primeiro. Isso indica que os volumes não foram propagados pelo desenho.

**Escalar tudo.** A resposta a qualquer pressão é "adiciono mais instâncias", aplicada
uniformemente. Funciona para componentes sem estado e não funciona para banco, cache com estado,
ou qualquer ponto de coordenação.

**Corrigir o gargalo errado.** O candidato otimiza o componente que ele conhece melhor, não o que
satura. É o equivalente, em entrevista, do que
[desempenho vs. manutenibilidade](/20-trade-offs/performance-vs-maintainability.md) descreve:
otimizar sem medir.

## Conceitos Centrais

### Propague os números pelo desenho

O gargalo é encontrado seguindo a carga:

```text
cliente → serviço      12 000/s
serviço → cache        12 000/s      →  cabe? qual o limite?
cache → serviço        95% de acerto
serviço → banco        600/s leitura  →  cabe folgado
serviço → banco        120/s escrita  →  cabe folgado
```

Com os números anotados, a resposta aparece: o componente com a maior razão entre carga e
capacidade é o gargalo. Se nenhum estiver perto do limite, diga isso — "nesta escala, nada satura;
o primeiro a apertar seria o cache, por volta de 100 mil por segundo".

### Os quatro recursos que saturam

```text
CPU              computação intensa, serialização, criptografia
memória          conjunto quente maior que a capacidade
entrada e saída  disco e rede
coordenação      contenção em recurso compartilhado, bloqueio,
                 transação, contador
```

O quarto é o mais importante e o menos citado. CPU, memória e rede escalam adicionando máquinas;
coordenação não. Um contador único, um bloqueio distribuído ou uma transação sobre a mesma linha
são gargalos que mais capacidade não resolve.

A razão é estrutural: os três primeiros são recursos divisíveis, e o quarto é um ponto de
serialização. Dobrar as máquinas dobra a CPU disponível; dobrar as máquinas que disputam o mesmo
bloqueio não aumenta a vazão daquele bloqueio, e frequentemente a reduz, porque a contenção
aumenta.

Numa entrevista, mencionar essa distinção é um sinal forte. A pergunta que a revela é simples e
vale ser feita ao próprio desenho: **existe algum ponto por onde todas as operações de um tipo
precisam passar em ordem?** Se existe, ele é o teto do sistema.

Ver [pontos quentes](/11-scalability/hotspots.md).

### Distinga gargalo de capacidade

```text
capacidade    "precisamos de mais instâncias"     →  resolve com dinheiro
gargalo real  "todas as escritas passam por aqui" →  exige mudar o desenho
```

Um candidato que trata todo limite como problema de capacidade não distingue os dois. A pergunta
que separa: **se eu dobrar as máquinas, o problema some?** Se sim, é capacidade. Se não, é
estrutura.

### Antecipe o gargalo seguinte

```text
"o cache satura primeiro, por volta de 100 mil/s.
 Se eu particionar o cache, o próximo limite é a taxa de
 acerto: com o conjunto quente crescendo, o acerto cai e
 o banco começa a ver mais carga.
 Depois disso, o limite é a escrita no banco — e aí a
 correção deixa de ser capacidade e passa a ser
 particionamento por chave."
```

Três níveis de gargalo, em ordem. Isso demonstra que o candidato entende que o sistema tem uma
sequência de limites, e que cada correção move a pressão adiante.

Essa sequência também é o que permite decidir onde parar. Se o segundo gargalo aparece a uma
escala dez vezes maior que a atual, resolvê-lo agora é otimização prematura; se ele aparece a uma
escala 1,5 vez maior, ele é o próximo trabalho. Enunciar a distância até cada limite transforma
a análise em plano.

### Correção proporcional

```text
gargalo                        correção proporcional
CPU em serviço sem estado      mais instâncias
leitura em banco               réplicas, cache
escrita em banco               particionamento, ou reduzir escrita
contenção em contador          fragmentação, agregação, aproximação
latência de dependência
  externa                      assíncrono, cache, disjuntor
memória de cache               particionar, ou reduzir o conjunto quente
```

Propor a correção certa para o tipo certo de gargalo é o conteúdo da avaliação. Propor
particionamento para um gargalo de leitura, por exemplo, indica que a natureza do problema não
foi entendida.

### O gargalo pode estar fora do seu sistema

```text
"nosso serviço atende 12 mil por segundo com folga, mas ele
 chama o serviço de pagamento externo, que responde em 800 ms
 e tem limite de 500 chamadas por segundo. Esse é o gargalo,
 e ele não é nosso."
```

Reconhecer dependências externas como gargalo — e propor as correções disponíveis: cache,
assíncrono, disjuntor, negociação de limite — é uma resposta madura que muitos candidatos não
alcançam.

Ver [disjuntores](/12-reliability/circuit-breakers.md).

### Nem todo gargalo precisa ser resolvido

```text
"o índice de busca satura por volta de 3 mil consultas por
 segundo, e estamos em 400. Não vou resolver isso agora —
 vou anotar como o próximo ponto a monitorar."
```

Dizer que um limite existe e não precisa de ação demonstra proporcionalidade. Resolver todos os
gargalos hipotéticos produz uma arquitetura complexa para uma escala que não existe.

Essa é uma das diferenças mais visíveis entre candidatos de nível intermediário e sênior. O
primeiro tende a resolver tudo que identifica, porque identificar e resolver parecem a mesma
demonstração de competência. O segundo separa as duas coisas: identificar demonstra compreensão,
e escolher não resolver demonstra julgamento — e é o julgamento que a posição exige.

## Modelo Mental

**Propague os números e pergunte qual recurso satura.** Depois pergunte qual satura em seguida —
a segunda resposta vale mais que a primeira.

## Quando Usar

- Logo após o desenho de alto nível.
- Sempre que o entrevistador aumentar a escala do enunciado.
- Antes de propor qualquer otimização.

## Quando Não Usar

**Sem números propagados.** Sem levar a estimativa de carga até cada componente, a identificação do gargalo é palpite — e o entrevistador percebe.

**Escalando tudo uniformemente.** Dobrar todos os componentes gasta orçamento imaginário e não demonstra raciocínio; o valor está em apontar qual satura primeiro.

**Resolvendo gargalos que não existem** na escala dada. Propor particionamento para um volume que cabe numa instância mostra reflexo, não análise.

**Sem distinguir capacidade de estrutura.** Falta de capacidade se resolve com mais máquina; problema estrutural, não. Confundi-los leva a propor escala onde a resposta era mudar o modelo.

**Ignorando dependências externas.** Limite de taxa de terceiro e cota de provedor costumam saturar antes da sua própria infraestrutura, e não são elásticos.

E há um uso errado da própria técnica: buscar gargalo antes de o desenho estar completo. Analisar
saturação de um fluxo pela metade produz conclusões sobre um sistema que não existe, e consome o
tempo que faltará para fechar o caminho.

## Alternativas

- **Perguntar ao entrevistador** — "onde você acha que isso quebra primeiro?" é legítimo e às
  vezes produtivo.
- **Analisar por recurso** — percorrer CPU, memória, entrada e saída, coordenação em vez de por
  componente.
- **Simular um aumento** — "se a escala fosse 10×, o que quebraria?" costuma tornar o gargalo
  óbvio.

A última é uma técnica útil quando nada satura na escala atual: aumentar hipoteticamente revela a
ordem dos limites.

## Trade-offs

| Analisar por componente | Por recurso |
|---|---|
| Segue o desenho | Cobre o que o desenho esconde |
| Mais natural de explicar | Encontra contenção |

| Resolver o gargalo | Anotar e seguir |
|---|---|
| Demonstra profundidade | Demonstra proporcionalidade |
| Consome tempo | Pode parecer omissão |

## Modos de Falha

**Não saber onde o sistema quebra.**

**Escalar tudo.** Não distingue tipos de gargalo.

**Corrigir o componente errado.**

**Ignorar coordenação.** É o gargalo que capacidade não resolve.

**Resolver limite hipotético.** Complexidade sem escala que a justifique.

## Erros Comuns

**Não propagar os volumes** pelo desenho.

**Propor particionamento** para gargalo de leitura.

**Esquecer dependências externas.**

**Não antecipar o gargalo seguinte.**

**Tratar contenção como problema de capacidade.**

## Exemplo de Entrevista

**Contexto.** Encurtador de URL, desenho já feito: balanceador, serviço, cache, banco. 12 mil
redirecionamentos por segundo, 120 criações.

**Pergunta.** "O que satura primeiro?"

**Resposta:**

```text
"Vou seguir a carga.

 O serviço é sem estado e faz uma leitura de cache por
 requisição — CPU baixa. Uma instância atende alguns milhares
 por segundo, então preciso de umas 6 a 10. Não é gargalo:
 adiciono instâncias.

 O cache recebe 12 mil por segundo. Uma instância em memória
 atende centenas de milhares de operações simples por segundo,
 então há folga grande. O limite do cache não é vazão, é
 memória: 30 GB de conjunto quente. Se o conjunto crescer
 além da capacidade, o acerto cai.

 O banco vê 600 leituras e 120 escritas por segundo — folgado.

 Conclusão: nada satura nesta escala. O primeiro limite real
 é a memória do cache, e ele aparece quando o conjunto quente
 crescer, não quando o tráfego crescer."
```

**Segunda pergunta.** "E se fossem 500 mil redirecionamentos por segundo?"

```text
"Aí a ordem muda.

 Primeiro: uma instância de cache não atende 500 mil por
 segundo com folga confortável, e a memória certamente não
 comporta o conjunto quente correspondente. Preciso particionar
 o cache por código de link.

 Segundo: com o cache particionado, o próximo limite é o
 balanceador e a banda de rede. 500 mil respostas de
 redirecionamento a ~200 bytes dá ~100 MB/s — cabe, mas exige
 distribuição geográfica por latência, não por vazão.

 Terceiro: as escritas continuam em 5 mil por segundo, o que
 um banco relacional atende. Só passaria a ser problema acima
 de dezenas de milhares.

 O que eu não faria: particionar o banco. Nesta escala, a
 leitura está resolvida pelo cache e a escrita cabe."
```

**Terceira pergunta.** "E se cada redirecionamento precisasse incrementar um contador de cliques
de forma exata?"

```text
"Aí o gargalo muda de natureza. Deixa de ser capacidade e vira
 coordenação: 500 mil incrementos por segundo, concentrados em
 poucos links populares, produzem contenção severa numa mesma
 linha.

 Mais máquinas não resolvem. As saídas são: fragmentar o
 contador em N sublinhas e somar na leitura; agregar em janela
 e escrever em lote; ou aceitar contagem aproximada acima de
 um limiar.

 Eu escolheria agregar em janela, porque o requisito de
 exatidão em contador de cliques raramente sobrevive à
 pergunta 'exato para quê?'."
```

A terceira resposta é a que diferencia: ela identifica a mudança de natureza do gargalo, propõe
três correções apropriadas ao tipo, escolhe uma, e questiona o requisito — que é exatamente o que
um arquiteto faz.

## Conceitos Relacionados

- [Arquitetura de Alto Nível](/22-system-design-interviews/high-level-architecture.md).
- [Escala em Entrevista](/22-system-design-interviews/interview-scaling.md).
- [Pontos Quentes](/11-scalability/hotspots.md).
- [Análise de Gargalo](/05-system-design/bottleneck-analysis.md).

## Exercício Prático

Pegue um desenho seu e propague os volumes por todas as setas. Depois responda, em ordem: o que
satura primeiro, o que satura depois disso, e o que satura em terceiro.

Se você não conseguir listar três, o desenho ainda não foi entendido.

## Perguntas de Entrevista

- Qual pergunta separa um gargalo de capacidade de um gargalo estrutural?
- Por que coordenação é o tipo de gargalo que mais máquinas não resolvem?
- Por que antecipar o gargalo seguinte vale mais que identificar o primeiro?

## Para Aprofundar

- Gregg, Brendan. *Systems Performance*. 2ª ed. Addison-Wesley, 2020.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Xu, Alex. *System Design Interview*. Byte Code, 2020.
