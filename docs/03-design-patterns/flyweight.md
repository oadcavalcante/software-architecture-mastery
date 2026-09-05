---
id: flyweight
title: Flyweight
sidebar_position: 11
description: Compartilhar estado comum entre muitos objetos — uma otimização de memória, com tudo que isso implica.
doc_type: pattern
level: 2
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor reconhece quando Flyweight se paga e por que ele é uma
  otimização que precisa de medição antes.
prerequisites: [design-patterns]
related: [prototype, proxy, singleton]
canonical_for: [flyweight, estado intrínseco, estado extrínseco]
content_version: 2
last_reviewed: 2026-08-26
---

# Flyweight

## Visão Geral

Flyweight reduz o consumo de memória compartilhando o estado comum entre muitos
objetos semelhantes.

É explicitamente uma **otimização** — e o único padrão do catálogo cujo ganho declarado é
só consumo de memória, o que o torna o único que não se justifica sem medir antes. Isso muda
como ele deve ser tratado: aplicar sem medição antes é o erro por definição.

## Problema

O sistema precisa de um número muito grande de objetos, e a memória não comporta.

O exemplo original é um editor de texto que representa cada caractere como
objeto. Um documento com um milhão de caracteres teria um milhão de objetos, cada
um com fonte, tamanho, cor e posição.

A observação que resolve: **a maior parte do estado é repetida.** Milhares de
caracteres compartilham a mesma fonte e o mesmo tamanho; o que difere é a posição
e o próprio caractere.

## Conceitos Centrais

### Estado intrínseco e extrínseco

A separação que define o padrão.

**Intrínseco** — independente do contexto, compartilhável. A fonte, o tamanho, a
cor. Vive dentro do flyweight.

**Extrínseco** — depende do contexto, não compartilhável. A posição, o índice.
Fica fora e é passado como parâmetro nas operações.

```text
antes:   1.000.000 objetos × (fonte + tamanho + cor + posição)
depois:  50 flyweights × (fonte + tamanho + cor)
       + 1.000.000 posições
```

O ganho existe quando o intrínseco é grande e o número de combinações distintas é
pequeno.

### Flyweights precisam ser imutáveis

Se um flyweight é compartilhado por milhares de contextos, alterá-lo afeta todos.
Imutabilidade não é recomendação aqui — é requisito.

### O custo escondido

Três custos que a discussão do padrão costuma omitir.

**Indireção.** O estado extrínseco vira parâmetro em toda operação, o que polui
as assinaturas.

**Custo de busca.** A fábrica que devolve flyweights mantém um mapa. Para
objetos muito baratos de criar, a busca pode custar mais que a criação.

**Complexidade de raciocínio.** Um objeto que só faz sentido com contexto externo
é mais difícil de entender e de depurar.

## Quando Usar

- O número de objetos é muito grande — ordem de centenas de milhares ou mais.
- A memória foi **medida** e é um gargalo real.
- A maior parte do estado é repetida e pode ser separada.
- Os flyweights podem ser imutáveis.

## Quando Não Usar

**Sem medição.** O erro central. Aplicar por antecipação é
[otimização prematura](/02-software-design/yagni.md) com custo estrutural.

**Quando contagem × tamanho do intrínseco não chega a nada.** O eixo não é o número de
objetos: é quanto de memória o compartilhamento devolve. Mil objetos carregando uma textura
de megabytes justificam o padrão; um milhão carregando dois inteiros não. Meça o intrínseco
primeiro, e só considere se a economia estiver na casa das centenas de megabytes.

**Quando o estado compartilhável é pequeno.** Se o intrínseco é um campo e o
extrínseco são dez, não há o que economizar.

**Quando os objetos precisam ser mutáveis.** O compartilhamento vira defeito.

**Quando a linguagem ou a plataforma já faz isso.** Muitas plataformas fazem
internamento de cadeias de caracteres e cache de números pequenos
automaticamente. Reimplementar é trabalho duplicado.

## Alternativas

- **Estruturas de dados orientadas a valor** — arrays de primitivos em vez de
  objetos, quando a plataforma permite.
- **Internamento** — reutilizar instâncias imutáveis idênticas, que é Flyweight
  simplificado e frequentemente suficiente.
- **Carga sob demanda** — não manter tudo em memória.
- **Não fazer nada** — se a medição não apontou memória como gargalo.

## Trade-offs

| Flyweight | Objetos independentes |
|---|---|
| Memória muito menor | Memória proporcional ao número |
| Estado imutável e seguro para compartilhar | Cada objeto é seu |
| Assinaturas poluídas por estado extrínseco | Assinaturas limpas |
| Custo de busca na fábrica | Criação direta |
| Raciocínio mais difícil | Objeto autocontido |

## Modos de Falha

**Flyweight mutável.** Alterar um afeta milhares de contextos, e o defeito aparece
longe.

**Fábrica que cresce sem limite.** O mapa de flyweights vira ele próprio um
vazamento de memória, se as combinações não forem realmente poucas.

**Estado extrínseco esquecido.** Uma operação usa o contexto errado, e o resultado
é sutilmente incorreto.

**Ganho que não se materializa.** O intrínseco era menor do que se supunha.

## Erros Comuns

**Aplicar sem medir.** O erro que define o padrão.

**Compartilhar objeto mutável.**

**Reimplementar o que a plataforma já faz.**

**Separar mal intrínseco e extrínseco.** Colocar no intrínseco algo que depende do
contexto produz defeitos difíceis de rastrear.

## Onde ele aparece na prática

**Internamento de cadeias de caracteres.** A JVM mantém um conjunto de literais;
cadeias idênticas compartilham a mesma instância. É Flyweight embutido na
plataforma.

**Cache de números pequenos.** Java e Python mantêm instâncias únicas para
inteiros de faixa pequena, pela mesma razão.

**Motores de renderização de texto.** Glifos e informações de fonte compartilhados
entre milhões de caracteres — o caso original.

**Motores de jogos.** Texturas, malhas e materiais compartilhados entre milhares
de instâncias; apenas transformação e estado são por instância.

Nos dois primeiros, o padrão é da plataforma e o programador se beneficia sem
saber. Nos dois últimos, ele é aplicado deliberadamente e sempre depois de um
perfil de memória — que é a ordem correta.

## Exemplo Real

Um sistema de mapas renderizava até 400 mil pontos de interesse simultaneamente.
Cada ponto era um objeto com ícone, cor, tamanho, rótulo e coordenada.

O perfil de memória mostrou 1,2 GB só nesses objetos, com pausas de coleta de lixo
de mais de um segundo.

A análise dos dados revelou que existiam **37 combinações distintas** de ícone,
cor e tamanho, entre os 400 mil pontos.

Separando o estilo — intrínseco, 37 instâncias — da coordenada e do rótulo —
extrínsecos — a memória caiu para 180 MB e as pausas para dezenas de
milissegundos.

Dois pontos que valem mais que o ganho. Primeiro: a decisão só foi possível
porque alguém **contou as combinações distintas** antes de implementar. Se fossem
40 mil, o padrão não teria ganho.

Segundo: as assinaturas ficaram piores. `desenhar(estilo, coordenada, rotulo)` é
menos legível que `ponto.desenhar()`, e o time aceitou isso conscientemente,
registrando a razão. É o trade-off do padrão, e ele foi pago.

## Conceitos Relacionados

- [Prototype](/03-design-patterns/prototype.md) — cópia em vez de compartilhamento.
- [Singleton](/03-design-patterns/singleton.md) — instância única, propósito diferente.
- [Proxy](/03-design-patterns/proxy.md) — frequentemente usado para carga sob demanda, uma
  alternativa a este padrão.

## Exercício Prático

Se seu sistema mantém muitos objetos semelhantes em memória, conte quantas
combinações distintas de atributos existem de fato.

A razão entre o número de objetos e o número de combinações limita o compartilhamento da
**parcela intrínseca**, não da memória total — é por isso que 400 mil pontos para 37
combinações, uma razão de 10.800 para 1, renderam 6,7× no caso acima e não 10.800×. Meça
antes que fração do objeto é intrínseca: é ela que o padrão devolve.

## Perguntas de Entrevista

- Qual a diferença entre estado intrínseco e extrínseco?
- Por que flyweights precisam ser imutáveis?
- O que precisa ser verdade antes de aplicar este padrão?

## Para Aprofundar

- Gamma, Erich et al. *Design Patterns*. Addison-Wesley, 1994.
