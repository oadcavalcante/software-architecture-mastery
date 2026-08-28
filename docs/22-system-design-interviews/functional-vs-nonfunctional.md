---
id: functional-vs-nonfunctional
title: Requisitos Funcionais vs. Não Funcionais
sidebar_position: 2
description: Os funcionais dizem o que construir; os não funcionais dizem como ele precisa ser — e são eles que decidem a arquitetura.
doc_type: concept
level: 0
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor separa os dois tipos em voz alta e reconhece que os não funcionais são
  os que produzem as decisões arquiteturais.
prerequisites: [requirement-clarification]
related: [requirement-clarification, capacity-estimation, communicating-tradeoffs]
canonical_for: [requisito funcional, requisito não funcional, requisito implícito de entrevista]
content_version: 1
last_reviewed: 2026-08-29
---

# Requisitos Funcionais vs. Não Funcionais

## Visão Geral

```text
funcional        o que o sistema faz
                 "encurtar uma URL", "redirecionar", "contar cliques"
não funcional    como ele precisa ser ao fazer isso
                 "redirecionar em menos de 100 ms, com 99,99%
                 de disponibilidade, para 10 bilhões de acessos/mês"
```

A distinção é elementar e a consequência não é: **os requisitos funcionais raramente decidem a
arquitetura; os não funcionais quase sempre decidem.**

Encurtar uma URL para mil usuários e para um bilhão são o mesmo requisito funcional e sistemas
completamente diferentes. É por isso que candidatos que listam apenas funcionalidades produzem
arquiteturas genéricas — eles não coletaram a informação que diferencia.

## Problema

O padrão típico dos primeiros minutos:

```text
candidato   "então precisamos de: criar link, redirecionar,
            ver estatísticas. Ok, vamos ao desenho."
```

Três requisitos funcionais e nenhum não funcional. A arquitetura que sai disso é a mesma para
qualquer escala, qualquer requisito de latência e qualquer necessidade de consistência — o que
significa que ela não foi decidida, foi lembrada.

O erro oposto, mais raro: listar não funcionais como adjetivos.

```text
"precisa ser escalável, seguro, confiável e de alta performance"
```

Isso não é requisito. Não há sistema que alguém queira construir inseguro e lento, e nenhuma
dessas palavras elimina uma opção de desenho.

## Conceitos Centrais

### Os funcionais definem o escopo; os não funcionais definem a solução

```text
funcional        entra na lista de "o que vou construir"
não funcional    entra na lista de "o que vai decidir como"
```

Um bom hábito visual: duas colunas no quadro. A da esquerda é curta e a da direita é onde a
entrevista de fato acontece.

### Não funcionais precisam de números

```text
ruim   "precisa ser rápido"
bom    "p99 do redirecionamento abaixo de 100 ms"

ruim   "precisa escalar"
bom    "10 bilhões de redirecionamentos/mês, com pico de 3× a média"

ruim   "precisa ser disponível"
bom    "99,99% no redirecionamento; 99,9% na criação é suficiente"

ruim   "precisa ser consistente"
bom    "um link criado precisa funcionar imediatamente para quem o
       criou; para os demais, alguns segundos de atraso são aceitáveis"
```

A coluna da direita elimina opções. A da esquerda não elimina nenhuma, e é por isso que ela não
serve.

Esse é o teste operacional para qualquer requisito não funcional enunciado numa entrevista:
**qual opção de arquitetura ele descarta?** "Precisa ser rápido" não descarta nenhuma. "p99
abaixo de 100 ms para leitura global" descarta consulta ao banco primário em outra região,
descarta cadeias síncronas longas e praticamente obriga cache distribuído — três decisões
tomadas por um único número.

Quando o entrevistador não fornece o número, propor um é melhor que omitir. Ele corrige se
estiver errado, e a análise seguinte fica ancorada em algo concreto em vez de flutuar.

### As seis categorias que cobrem quase tudo

Um roteiro mental para não esquecer nenhuma:

```text
escala          volume de leitura, de escrita, de armazenamento,
                crescimento previsto, padrão de pico
latência        por operação, em percentil, não em média
disponibilidade por operação; nem todas merecem o mesmo alvo
consistência    o que precisa ser forte, o que tolera atraso e quanto
durabilidade    o que não pode se perder, e qual perda é aceitável
custo           existe orçamento? há restrição de eficiência?
```

Percorrer as seis leva menos de um minuto e evita a lacuna mais comum: esquecer de perguntar
sobre consistência, que é justamente a que mais muda a arquitetura.

A omissão de consistência tem uma causa identificável: ela é a única das seis que não tem um
número óbvio associado. Escala tem volume, latência tem milissegundos, disponibilidade tem nonos,
custo tem reais — consistência tem uma pergunta qualitativa, "o que pode estar desatualizado e
por quanto tempo".

A forma de torná-la concreta é a mesma: exigir uma janela em unidade de tempo. "Eventualmente
consistente" não é requisito; "até 30 segundos de atraso, aceitável" é. Ver
[consistência forte vs. eventual](../20-trade-offs/strong-vs-eventual-consistency.md).

### Diferenciar por operação, não pelo sistema

Este é o hábito que mais impressiona e o menos comum:

```text
ruim   "o sistema precisa de 99,99% de disponibilidade"
bom    "o redirecionamento precisa de 99,99%; a criação de link
       tolera 99,9%; o painel de estatísticas tolera 99%"
```

Aplicar o requisito mais exigente ao sistema inteiro produz uma arquitetura cara. Separar por
operação demonstra que você entende que disponibilidade tem preço, e permite degradação
desenhada mais tarde.

O mesmo vale para consistência, latência e durabilidade. Ver
[custo vs. confiabilidade](../20-trade-offs/cost-vs-reliability.md) e
[consistência vs. disponibilidade](../20-trade-offs/consistency-vs-availability.md).

### Prioridade explícita

Quando os não funcionais conflitam — e eles conflitam —, declarar a prioridade antecipa metade
da discussão de trade-off:

```text
"entre disponibilidade e consistência no redirecionamento, escolho
disponibilidade: servir um link levemente desatualizado é melhor
que não servir"
```

Isso é o que o avaliador procura quando pergunta "e se...". Você já respondeu antes de ele
perguntar.

Declarar prioridade tem um segundo efeito, menos óbvio: ela protege a coerência do desenho. Um
candidato que declarou "disponibilidade acima de consistência" e depois propõe uma escrita
síncrona coordenada entre regiões está se contradizendo — e vai ser questionado. A prioridade
declarada funciona como uma restrição que mantém as decisões seguintes alinhadas entre si.

Arquiteturas incoerentes são um dos sinais mais fáceis de detectar numa entrevista: elas otimizam
para propriedades conflitantes em partes diferentes do mesmo sistema, sem que nada explique por
quê.

### Os implícitos que valem mencionar

```text
segurança      controle de acesso, dados sensíveis
operação       alguém vai operar, monitorar e depurar isso
custo          uma solução 10× mais cara precisa de justificativa
evolução       o que provavelmente vai mudar em um ano
```

Uma frase para cada, sem se alongar. Mencioná-los mostra que você projeta sistemas que vão para
produção, e não exercícios.

O de operação é o mais valorizado e o menos citado: dizer "vou incluir observabilidade porque
alguém vai precisar depurar isso às três da manhã" comunica experiência real em uma frase. O de
custo tem efeito parecido em posições sêniores, onde a expectativa não é apenas que a solução
funcione, mas que ela seja defensável diante de quem paga a conta.

## Modelo Mental

**Funcionais definem o escopo; não funcionais definem a arquitetura.** E não funcional sem número
é adjetivo.

## Quando Usar

- Logo após a clarificação, antes de qualquer desenho.
- Anotados visivelmente, em duas colunas.
- Com prioridade declarada quando houver conflito.

## Quando Não Usar

**Sem números.**

**Aplicando um requisito único ao sistema inteiro.**

**Listando apenas funcionais.**

**Como lista longa** — cinco funcionais e seis não funcionais bastam; mais que isso consome o
tempo do desenho.

**Sem revisitar** — quando o entrevistador muda o enunciado, os requisitos mudam.

## Alternativas

- **Uma frase de resumo** — "leitura pesada, tolerante a atraso, disponibilidade acima de
  consistência" — quando o tempo aperta.
- **Priorização explícita** — três requisitos ordenados em vez de dez em lista.
- **Deixar para o entrevistador** — perguntar "qual desses é o mais importante para você?" é
  legítimo e produtivo.

## Trade-offs

| Muitos requisitos | Poucos |
|---|---|
| Cobertura completa | Foco no que decide |
| Consome tempo | Risco de lacuna |
| Difícil priorizar | Prioridade clara |

| Por operação | Pelo sistema |
|---|---|
| Arquitetura proporcional | Mais simples de enunciar |
| Demonstra maturidade | Mais caro na prática |
| Permite degradação | Tudo no alvo mais alto |

## Modos de Falha

**Só funcionais.** Arquitetura genérica.

**Não funcionais como adjetivos.** Nada é eliminado.

**Requisito único para tudo.** Solução cara e indiferenciada.

**Sem prioridade.** A conversa de trade-off fica sem base.

**Esquecer consistência.** É a categoria que mais decide e a mais omitida.

## Erros Comuns

**Listar dez funcionalidades** e nenhum número.

**Dizer "escalável" sem dizer para quanto.**

**Não separar disponibilidade por operação.**

**Não declarar o que tolera atraso.**

**Ignorar custo** — em entrevistas para posições sêniores, é diferencial.

## Exemplo de Entrevista

**Problema.** "Projete um serviço de feed de notícias."

**Funcionais** — curtos, porque não decidem:

```text
publicar uma postagem
seguir e deixar de seguir pessoas
ver o feed com as postagens de quem se segue
reagir e comentar
```

**Não funcionais** — onde a entrevista acontece:

```text
escala           300 M de usuários ativos diários
                 500 M de postagens/dia
                 razão leitura/escrita ~100:1
                 pico 3× a média

latência         p95 do feed < 500 ms
                 p95 da publicação < 1 s

disponibilidade  leitura do feed 99,99%
                 publicação 99,9%

consistência     uma postagem pode levar até 30 s para aparecer
                 no feed de quem segue
                 o autor precisa vê-la imediatamente

durabilidade     postagem publicada não pode se perder
                 contagem de reações pode ser aproximada acima
                 de 10 mil

custo            leitura domina; a arquitetura deve otimizar
                 custo por leitura
```

**Prioridade declarada:**

```text
"entre latência de leitura e frescor do feed, escolho latência:
30 segundos de atraso é imperceptível, 2 segundos de espera não."
```

**O que cada não funcional decide:**

```text
razão 100:1              → mover trabalho para a escrita
30 s de janela           → distribuição assíncrona é viável
autor vê imediatamente   → leitura das próprias escritas
reações aproximadas      → contadores sem contenção
custo por leitura        → feed materializado, não montagem na leitura
```

Cinco decisões de arquitetura, todas derivadas de requisitos não funcionais. Nenhuma veio dos
funcionais.

Ver o [case de rede social](../21-case-studies/social-network.md) para a versão longa dessa
análise.

**Pergunta de acompanhamento provável:** "e se o requisito fosse de 2 segundos em vez de 30?"

A resposta correta reconhece que isso inviabiliza a distribuição assíncrona para audiências
grandes, e força ou montagem na leitura ou uma estratégia híbrida — que é exatamente a conversa
que o avaliador quer ter.

## Conceitos Relacionados

- [Clarificação de Requisitos](requirement-clarification.md).
- [Estimativa em Entrevista](capacity-estimation.md) — os números.
- [Comunicação de Trade-offs](communicating-tradeoffs.md) — a prioridade declarada.
- [Atributos de Qualidade](../01-fundamentals/quality-attributes.md).

## Exercício Prático

Pegue um sistema que você conhece e escreva seus não funcionais **por operação**, com números.

Depois marque quais decisões de arquitetura cada um produz. Os que não produzirem nenhuma
provavelmente são adjetivos disfarçados.

## Perguntas de Entrevista

- Por que os requisitos funcionais raramente decidem a arquitetura?
- Por que aplicar um alvo de disponibilidade único ao sistema inteiro é um erro?
- Qual categoria de requisito não funcional é mais esquecida, e por que ela importa tanto?

## Para Aprofundar

- Ford, Neal et al. *Fundamentals of Software Architecture*. O'Reilly, 2020.
- Bass, Len et al. *Software Architecture in Practice*. 4ª ed. Addison-Wesley, 2021.
- Xu, Alex. *System Design Interview*. Byte Code, 2020.
