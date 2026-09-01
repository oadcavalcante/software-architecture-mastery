---
id: component-diagrams
title: Diagramas de Componente
sidebar_position: 5
description: O interior de uma peça — o nível mais caro de manter e o menos frequentemente necessário.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor sabe quando descer ao nível de componente e por que ele é a
  exceção, não a regra.
prerequisites: [container-diagrams]
related: [c4-model, container-diagrams, living-documentation]
canonical_for: [diagrama de componente, agrupamento lógico, custo de manutenção de diagrama]
content_version: 1
last_reviewed: 2026-08-29
---

# Diagramas de Componente

## Visão Geral

Um diagrama de componente mostra o **interior de um contêiner**: os agrupamentos lógicos
de código e como eles se relacionam.

É o terceiro nível do [modelo C4](/17-architecture-documentation/c4-model.md), e o primeiro cuja necessidade precisa ser
justificada. Contexto e contêiner quase sempre valem a pena. Componente, raramente.

A razão é econômica: ele descreve o que muda mais rápido, e por isso desatualiza mais
rápido — e a informação que ele carrega já está no código, disponível para quem abrir o
projeto.

## Problema

Uma pessoa nova recebe a tarefa de mudar o cálculo de frete. Ela sabe, pelo diagrama de
contêiner, que isso vive na API de Pedidos. Abre o projeto e encontra 240 arquivos.

O diagrama de contêiner parou cedo demais para essa pergunta.

Mas a resposta óbvia — desenhar todos os componentes de todos os contêineres — produz um
custo que raramente se paga:

```text
um sistema com 8 contêineres
cada um com 10 a 20 componentes
= 8 diagramas que mudam a cada refatoração interna
```

Depois de três meses, eles descrevem uma estrutura que não existe mais, e a pessoa nova é
mandada para um mapa errado — o que é pior que não ter mapa.

## Conceitos Centrais

### O que é um componente aqui

Um agrupamento de código com responsabilidade coesa e interface identificável, dentro de
um contêiner:

```text
sim   Controlador de Pedidos, Calculadora de Frete, Repositório de Clientes,
      Cliente de Pagamento, Validador de Cupom
não   uma classe, um pacote qualquer, uma camada inteira
```

O componente não é implantável separadamente — se fosse, seria contêiner. Ele é uma
unidade de organização interna.

E o critério prático: **o componente é algo que você nomearia numa conversa sobre onde
mexer.**

### Ele custa mais do que parece

Este é o ponto central:

```text
contexto     muda quando o sistema muda de propósito       — anos
contêiner    muda quando uma peça é criada ou removida     — meses
componente   muda a cada refatoração interna               — semanas
```

O diagrama de componente tem a **meia-vida mais curta** dos três, e o mesmo custo de
manutenção manual. Ver
[princípios de documentação](/17-architecture-documentation/documentation-principles.md).

Um diagrama desatualizado neste nível é ativamente prejudicial: ele afirma uma estrutura
com precisão suficiente para ser seguida, e está errado.

### Quando ele se paga

Poucos casos, e todos específicos:

```text
contêiner grande e complexo, com mais de 15 componentes
domínio que precisa ser explicado, não só navegado
onboarding recorrente no mesmo contêiner
antes de uma refatoração estrutural, para discutir o alvo
para argumentar uma decisão de fronteira
```

O último é o mais legítimo: um diagrama desenhado para embasar uma decisão é descartável
por natureza — ele vive na
[ADR](/18-architecture-decisions/what-is-an-adr.md), datado, e não precisa ser
mantido.

### A alternativa é gerar

Quando o diagrama é realmente necessário e o contêiner é ativo, gerar a partir do código
resolve o problema de meia-vida:

```text
ferramenta lê o código, extrai a estrutura, produz o diagrama
o diagrama nunca está errado
o layout é automático e às vezes ruim
só mostra o que existe, não o que se pretende
```

Ver [documentação viva](/17-architecture-documentation/living-documentation.md). Este é o nível onde geração tem o maior
retorno, porque é o nível que mais desatualiza.

E há uma condição: gerar só funciona se o código tiver estrutura reconhecível. Um projeto
sem organização clara produz um diagrama gerado ilegível — o que, aliás, é um diagnóstico.

### O código é a documentação primária

No nível de componente, existe uma alternativa que quase sempre vence:

```text
estrutura de diretórios que reflita o domínio
nomes que digam o que a coisa faz
um README curto por contêiner com o mapa em texto
```

Uma estrutura de pastas bem nomeada responde "onde mexo" sem nenhum diagrama, e nunca
desatualiza, porque é o próprio código.

Ver [desenho modular](/02-software-design/modular-design.md).

### Um contêiner por vez

Como no nível anterior, o escopo é único: **um diagrama descreve um contêiner**. Os demais
aparecem, se aparecerem, como caixas na borda.

### Um diagrama que ninguém consegue desenhar é um achado

Há um resultado do exercício que vale independentemente do diagrama produzido: quando a
estrutura interna de um contêiner **não pode ser desenhada** de forma legível, isso não é
falha de documentação.

```text
componentes sem responsabilidade clara       nomes que não dizem nada
dependências em todas as direções            nenhuma camada discernível
um componente que aparece em tudo            provável classe-deus
```

Nesses casos o diagrama vira insumo de refatoração, e cumpre sua função melhor do que
cumpriria se ficasse bonito. Ver
[desenho modular](/02-software-design/modular-design.md).

## Modelo Mental

**O nível de menor retorno e maior custo.** Desenhe quando houver uma pergunta específica,
gere quando precisar de permanência, e prefira código bem organizado a ambos.

## Quando Usar

- Contêiner grande, com estrutura interna não óbvia.
- Onboarding recorrente no mesmo contêiner.
- Antes de uma refatoração estrutural, como alvo a discutir.
- Para embasar uma decisão de fronteira — descartável, dentro da ADR.
- Quando for gerado automaticamente.

## Quando Não Usar

**Para todo contêiner, por completude.** Este é o erro caro.

**Mantido à mão, em código que muda toda semana.**

**Quando a estrutura de pastas já responde.**

**Com classes como caixas** — o nível seria o quarto, e raramente vale.

**Sem alguém responsável por atualizá-lo.**

## Alternativas

- **Estrutura de diretórios bem nomeada** — resposta sem custo de manutenção.
- **README por contêiner** — o mapa em texto, mais fácil de manter.
- **Diagrama gerado** — sempre atual.
- **Nada** — para contêineres pequenos, ler o código é mais rápido.

A última é legítima com mais frequência do que se admite: um contêiner de 15 arquivos não
precisa de diagrama.

## Trade-offs

| Desenhado | Gerado |
|---|---|
| Expressa intenção | Mostra o que existe |
| Desatualiza | Sempre atual |
| Layout bom | Automático |
| Custo contínuo | Custo inicial |

| Diagrama | Estrutura de pastas |
|---|---|
| Mostra relações | Mostra organização |
| Custo de manutenção | Nenhum |
| Independente do código | É o código |

## Modos de Falha

**Desatualizado e seguido.** Pior que não existir.

**Produzido para todos os contêineres.** Custo que nunca se paga.

**Classes como caixas.** Nível errado.

**Gerado a partir de código sem estrutura.** Ilegível.

**Sem dono.** Nasce e apodrece.

## Erros Comuns

**Tratar o terceiro nível como obrigatório** porque o modelo tem quatro.

**Não considerar a estrutura de pastas como alternativa.**

**Manter à mão o que poderia ser gerado.**

**Não datar** — sem data, o leitor confia.

## Exemplo Real

Uma equipe de plataforma decidiu documentar completamente seus sistemas, incluindo o
nível de componente para os 22 contêineres existentes.

O esforço levou seis semanas. Os diagramas foram publicados no wiki.

Onze meses depois, uma auditoria de documentação mediu:

```text
diagramas de contexto      6 — 6 ainda corretos
diagramas de contêiner    22 — 19 corretos, 3 desatualizados
diagramas de componente   22 — 4 corretos, 18 desatualizados
```

E, mais grave, dois incidentes tinham sido agravados por diagramas de componente errados:
em ambos, alguém localizou onde mexer pelo diagrama, mexeu no lugar indicado, e o
comportamento estava em outro componente — movido numa refatoração meses antes.

A revisão da política:

**Nível de componente removido por padrão.** Os 22 diagramas foram arquivados.

**Quatro exceções mantidas**, todas em contêineres grandes com onboarding frequente — e
todas convertidas para geração automática a partir do código.

**README por contêiner** substituiu o resto: um mapa em texto de cinco a dez linhas,
mantido no repositório do próprio contêiner, revisado junto com mudanças estruturais.

**Diagramas de decisão** passaram a viver nas ADRs, datados e explicitamente não mantidos
— com uma frase no cabeçalho: "retrato da estrutura em 2026-03; não atualizado".

O resultado, medido no ano seguinte: a documentação estrutural encolheu de 50 para 32
artefatos, a taxa de itens corretos subiu de 58% para 91%, e nenhum incidente foi agravado
por documentação errada.

Um efeito não previsto: ao escrever os READMEs, três times descobriram que não conseguiam
descrever a organização interna em dez linhas — o que virou motivo para refatorar.

A avaliação posterior aponta: a lição não foi "componentes não importam", e sim que a
completude tem custo e o custo é contínuo. Documentar tudo produziu menos verdade que
documentar menos.

## Conceitos Relacionados

- [Modelo C4](/17-architecture-documentation/c4-model.md).
- [Diagramas de Contêiner](/17-architecture-documentation/container-diagrams.md) — o nível acima.
- [Documentação Viva](/17-architecture-documentation/living-documentation.md) — a saída para este nível.
- [Princípios de Documentação](/17-architecture-documentation/documentation-principles.md) — a meia-vida.

## Exercício Prático

Escolha um contêiner do seu time e escreva um README de dez linhas descrevendo sua
organização interna.

Se você não conseguir, o problema provavelmente não é de documentação.

## Perguntas de Entrevista

- Por que o nível de componente tem o pior retorno dos três?
- Quando um diagrama desatualizado é pior que nenhum diagrama?
- Que alternativa costuma vencer o diagrama de componente?

## Para Aprofundar

- Brown, Simon. *Software Architecture for Developers*. Leanpub, 2015.
- Martin, Robert C. *Clean Architecture*. Prentice Hall, 2017.
- Parnas, David. *On the Criteria To Be Used in Decomposing Systems*. CACM, 1972.
