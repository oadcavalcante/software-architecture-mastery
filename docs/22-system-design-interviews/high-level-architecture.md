---
id: high-level-architecture
title: Arquitetura de Alto Nível
sidebar_position: 7
description: Poucas caixas, um fluxo completo, e cada componente justificado por um requisito.
doc_type: concept
level: 0
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor desenha uma arquitetura inicial simples e completa, com cada caixa
  ligada a um requisito, e a expande sob demanda.
prerequisites: [interview-data-modeling]
related: [bottleneck-identification, interview-scaling, interview-structure]
canonical_for: [arquitetura de alto nível em entrevista, fluxo principal desenhado, caixa justificada]
content_version: 1
last_reviewed: 2026-08-29
---

# Arquitetura de Alto Nível

## Visão Geral

O desenho de alto nível é o meio da entrevista, e ele tem uma regra que a intuição contraria:
**comece simples demais**.

```text
primeira versão   4 a 6 caixas, o fluxo completo funcionando
depois            expandir onde o entrevistador apontar, ou onde
                  a estimativa disser que há gargalo
```

Um desenho inicial com quinze componentes é difícil de explicar, difícil de criticar e sugere que
o candidato aplicou um modelo em vez de derivar um. Um desenho com cinco caixas que atende ao
fluxo inteiro é uma base sobre a qual a conversa acontece.

## Problema

Dois padrões.

**Complexidade prematura.** O candidato desenha balanceador, gateway, seis microsserviços, fila,
cache, réplicas, índice de busca e armazenamento de objetos — em três minutos, antes de qualquer
gargalo ter sido identificado.

O problema não é que os componentes estejam errados. É que nenhum foi justificado, e o
entrevistador não tem como distinguir julgamento de memorização. A pergunta que vem é "por que
essa fila?", e a resposta precisa ser melhor que "para desacoplar".

**Desenho incompleto.** O candidato detalha profundamente uma parte — o modelo de cache, por
exemplo — e nunca fecha o fluxo. Ao fim da entrevista, não existe um caminho completo da
requisição do usuário até a resposta.

```text
avaliado   existe um fluxo completo que funciona?
           cada componente tem uma razão?
           o candidato sabe o que fazer quando ele não escalar?
```

## Conceitos Centrais

### Desenhe o caminho, não a topologia

Comece pelo fluxo da operação principal, seguindo a requisição:

```text
cliente → balanceador → serviço de aplicação → banco
                                ↓
                              cache
```

Cinco caixas. Elas atendem ao requisito funcional inteiro. A partir daqui, cada acréscimo tem uma
razão declarada.

Desenhar o caminho tem uma vantagem sobre desenhar a topologia: ele mantém o foco em como uma
requisição é atendida, e é isso que revela onde ela pode falhar ou ficar lenta.

### Uma caixa, uma razão

```text
"balanceador porque há mais de uma instância de aplicação"
"cache porque a razão leitura/escrita é 100 para 1 e o conjunto
 quente cabe em memória"
"fila porque a confirmação de pedido depende de um parceiro
 externo com 98,7% de disponibilidade, e nosso requisito é 99,9%"
```

A terceira frase é o modelo: ela liga um componente a um número que veio da estimativa e a um
requisito que veio da clarificação. Essa cadeia — requisito, número, componente — é o que
distingue arquitetura de recitação.

Se você não consegue enunciar a razão de uma caixa, ela não deveria estar no desenho ainda.

Vale notar que essa regra também protege contra a pergunta mais desconfortável da entrevista: "o
que acontece se eu tirar esse componente?". Um candidato que colocou cada caixa por uma razão
responde imediatamente — "sem o cache, o banco vê 12 mil leituras por segundo em vez de 600, o
que exigiria muitas réplicas e custaria mais". Um candidato que copiou um modelo não tem resposta,
e a ausência dela é mais informativa que qualquer desenho.

### Comece monolítico e divida sob pressão

Uma escolha que causa desconforto e é a correta:

```text
primeira versão   "serviço de aplicação" — uma caixa
depois            dividir onde houver razão: perfil de carga
                  diferente, requisito de disponibilidade diferente,
                  ou time diferente
```

Desenhar seis microsserviços desde o início é o erro mais comum em entrevistas de nível
intermediário. Ele sinaliza que a divisão veio de um modelo mental e não do problema. Ver
[monólito vs. microsserviços](/20-trade-offs/monolith-vs-microservices.md).

A resposta forte quando o entrevistador pergunta "e microsserviços?": "dividiria se tivéssemos
times independentes precisando implantar separado, ou se algum componente tivesse perfil de
escala muito diferente. Aqui, o componente X tem — então eu o separaria, e manteria o resto
junto".

### Marque o volume nas setas

```text
cliente → aplicação        12 mil/s
aplicação → cache          12 mil/s, 95% de acerto
aplicação → banco          600/s de leitura, 120/s de escrita
```

Anotar os números transforma o desenho num instrumento de análise: fica visível onde a carga se
concentra, e a próxima pergunta — "o que satura primeiro?" — tem resposta imediata. Ver
[identificação de gargalo](/22-system-design-interviews/bottleneck-identification.md).

### Complete o fluxo antes de aprofundar

```text
ruim   detalhar o cache por oito minutos com o fluxo pela metade
bom    fechar o caminho inteiro em cinco minutos, e então
       perguntar "onde você quer que eu aprofunde?"
```

A pergunta ao final do desenho inicial é um movimento forte: ela devolve o controle ao
entrevistador, que vai apontar onde ele quer avaliar, e evita que você aprofunde numa parte que
ele não considera interessante.

Ela também tem um efeito de ritmo. Entrevistas frequentemente derivam para o assunto que o
candidato conhece melhor, e o avaliador percebe isso. Convidar explicitamente a escolha do tema
sinaliza confiança em cobrir qualquer um deles — e, na prática, o entrevistador costuma escolher
justamente onde ele tem uma pergunta preparada, o que é a parte da conversa que mais rende.

### Separe caminho de leitura e de escrita

Quando os dois têm perfis diferentes — e quase sempre têm —, desenhá-los separados esclarece:

```text
escrita   cliente → aplicação → banco → (evento) → processamento
leitura   cliente → cache → aplicação → réplica
```

Essa separação torna óbvio por que o cache está do lado da leitura, por que a réplica existe, e
onde a consistência eventual aparece. É um desenho mais informativo com o mesmo número de caixas.

### Nomeie por responsabilidade, não por tecnologia

```text
ruim   "Redis", "Kafka", "PostgreSQL"
bom    "cache de sessão", "fila de eventos de pedido",
       "banco de pedidos"
```

Nomear por responsabilidade mantém a conversa no nível de arquitetura e evita que ela derive para
comparação de produtos. A tecnologia entra como uma nota — "seria um cache em memória, tipo
Redis" — sem ocupar o centro.

## Modelo Mental

**Cinco caixas, fluxo completo, cada uma justificada.** Expanda sob demanda, não por antecipação.

## Quando Usar

- Após requisitos, estimativas, API e modelo.
- Começando pelo caminho da operação principal.
- Com volumes anotados nas setas.

## Quando Não Usar

**Com quinze caixas de saída.**

**Aprofundando antes de fechar o fluxo.**

**Com componentes não justificados.**

**Dividindo em serviços sem razão declarada.**

**Nomeando por produto** em vez de por responsabilidade.

## Alternativas

- **Descrever o fluxo em texto** — quando não há quadro; menos eficaz e viável.
- **Desenhar dois fluxos** — leitura e escrita separados; melhor quando os perfis divergem.
- **Começar pelo gargalo** — se a estimativa já apontou um, desenhar em torno dele é legítimo.

## Trade-offs

| Desenho simples | Desenho completo |
|---|---|
| Fácil de explicar e criticar | Cobre mais |
| Expande sob demanda | Consome tempo |
| Cada caixa justificada | Sugere memorização |

| Monolítico primeiro | Dividido desde o início |
|---|---|
| Divisão justificada depois | Parece mais moderno |
| Menos caixas para explicar | Mais superfície a defender |

## Modos de Falha

**Complexidade prematura.** Componentes sem razão.

**Fluxo incompleto.** Nenhum caminho completo ao fim da entrevista.

**Divisão em serviços sem critério.**

**Setas sem volume.** O desenho não sustenta a análise seguinte.

**Nomes de produto.** A conversa vira comparação de tecnologias.

## Erros Comuns

**Desenhar a arquitetura de referência** decorada, independente do enunciado.

**Não fechar o fluxo** antes de aprofundar.

**Colocar fila sem dizer o que ela resolve.**

**Não perguntar onde o entrevistador quer aprofundar.**

**Ignorar o caminho de leitura** quando ele domina o volume.

## Exemplo de Entrevista

**Problema.** "Projete um encurtador de URL." Requisitos e estimativas já feitos: 12 mil
redirecionamentos por segundo, 120 criações por segundo, conjunto quente de 30 GB.

**Primeiro desenho, em quatro minutos:**

```text
                    ┌──────────┐
cliente ──────────► │ balancea-│
                    │   dor    │
                    └────┬─────┘
                         │
                    ┌────▼─────┐      ┌───────┐
                    │ serviço  │ ───► │ cache │
                    │ de links │ ◄─── │       │
                    └────┬─────┘      └───────┘
                         │
                    ┌────▼─────┐
                    │  banco   │
                    │ de links │
                    └──────────┘
```

**A justificativa de cada caixa, em voz alta:**

```text
"balanceador porque 12 mil por segundo exige várias instâncias

 serviço de links é uma caixa só: criar e redirecionar são
 operações do mesmo domínio, com o mesmo modelo, e não vejo
 razão para separá-las agora

 cache porque a leitura é 100× a escrita e o conjunto quente
 de 30 GB cabe em memória. Com 95% de acerto, o banco vê
 600 leituras por segundo em vez de 12 mil

 banco relacional porque 10 TB e 120 escritas por segundo
 cabem com folga, e podemos ter consultas não previstas"
```

**Volumes nas setas:**

```text
cliente → serviço      12 120/s
serviço → cache        12 000/s, 95% acerto
serviço → banco        600/s leitura + 120/s escrita
```

**A pergunta ao entrevistador:**

```text
"Esse fluxo atende aos requisitos que levantamos. Onde você
 quer que eu aprofunde: geração do código curto, estratégia
 de cache, disponibilidade, ou análise de cliques?"
```

**Se ele pedir análise de cliques**, o desenho ganha uma caixa — e a justificativa vem junto:

```text
"cliques são 12 mil eventos por segundo, e a análise tolera
 minutos de atraso. Colocar isso no caminho síncrono do
 redirecionamento adicionaria latência ao que é mais crítico.

 Vou emitir um evento assíncrono e agregar fora do caminho:
 serviço → fila → agregador → armazenamento de métricas.

 Isso mantém o redirecionamento com uma leitura de cache e
 nada mais."
```

Note que a caixa nova entrou com um requisito, um número e uma consequência — e que ela só
apareceu quando foi pedida.

## Conceitos Relacionados

- [Identificação de Gargalo](/22-system-design-interviews/bottleneck-identification.md) — o passo seguinte.
- [Escala em Entrevista](/22-system-design-interviews/interview-scaling.md).
- [Monólito vs. Microsserviços](/20-trade-offs/monolith-vs-microservices.md).
- [Componentes](/05-system-design/components.md).

## Exercício Prático

Desenhe, em cinco minutos, a arquitetura de um sistema de agendamento — e escreva ao lado de cada
caixa a razão dela em uma frase.

As caixas sem frase são as que você colocou por hábito. Remova-as e veja se o fluxo ainda
funciona.

## Perguntas de Entrevista

- Por que começar com poucas caixas é melhor que começar completo?
- Por que perguntar ao entrevistador onde aprofundar é um movimento forte?
- Por que nomear componentes por responsabilidade e não por produto?

## Para Aprofundar

- Xu, Alex. *System Design Interview*. Byte Code, 2020.
- Brown, Simon. *Software Architecture for Developers*. Leanpub, 2015.
- Newman, Sam. *Building Microservices*. 2ª ed. O'Reilly, 2021.
