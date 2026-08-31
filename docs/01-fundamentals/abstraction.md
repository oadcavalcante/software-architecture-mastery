---
id: abstraction
title: Abstração
sidebar_position: 15
description: Expor o que importa e esconder o resto — e por que abstração ruim é pior que nenhuma.
doc_type: concept
level: 1
difficulty: iniciante
status: complete
objective: >
  Ao terminar, o leitor avalia se uma abstração reduz ou adiciona complexidade,
  e reconhece abstração prematura antes de pagá-la.
prerequisites: [separation-of-concerns]
related: [complexity, coupling, modularity]
canonical_for: [abstração, abstraction]
content_version: 1
last_reviewed: 2026-08-26
---

# Abstração

## Visão Geral

Abstração é a representação que expõe o que importa para um propósito e esconde
o resto.

O critério que separa abstração boa de ruim é único e verificável: **uma boa
abstração reduz o que é preciso saber.** Se para usar a abstração é necessário
entender o que ela esconde, ela adicionou uma camada sem remover nenhuma.

## Problema

Abstração é a ferramenta mais poderosa e a mais mal aplicada do design de
software, porque o custo dela é imediato e o benefício é hipotético.

O custo é uma indireção a mais: alguém vai precisar navegar por ela para entender
o fluxo. O benefício é a possibilidade de trocar a implementação — que só se
realiza se a troca acontecer.

Times aplicam abstração por reflexo, e o resultado é o padrão reconhecível de
interfaces com uma implementação, camadas que apenas repassam chamadas, e
configurações genéricas para variação que nunca ocorreu. Todo o custo, nenhum
benefício.

E existe o caso pior: a abstração errada. Uma abstração que não corresponde ao
domínio força quem a usa a lutar contra ela, e é mais cara de remover do que
teria sido não tê-la criado — porque agora há código dependendo dela.

## Conceitos Centrais

### O teste da abstração

Uma abstração se justifica quando quem a usa consegue trabalhar **sem saber** o
que está do outro lado.

Se o consumidor precisa saber que o repositório usa SQL para escrever a consulta
corretamente, ou que a fila é Kafka para tratar ordenação, a abstração não está
escondendo — está apenas interpondo.

### Abstração vaza

Toda abstração vaza em algum grau. A questão é quanto e onde.

Um repositório esconde a tecnologia de persistência até que desempenho importe —
aí a diferença entre uma consulta e cinco vira visível e o consumidor precisa
saber. Um sistema de arquivos abstrai o disco até que latência importe.

Isso não invalida a abstração. Significa que ela precisa ser escolhida sabendo
onde vai vazar, e que abstrações cuja vazamento ocorre no caso comum não valem a
pena.

### Abstração prematura é pior que duplicação

Uma abstração criada a partir de dois casos parecidos frequentemente captura a
coincidência em vez do conceito. Quando o terceiro caso chega e não encaixa, há
duas opções ruins: distorcer o terceiro para caber, ou parametrizar a abstração
até ela virar uma configuração ilegível.

O caminho mais seguro é esperar. Duplicar duas ou três vezes é barato e
reversível; a abstração errada é cara e sticky.

### O nível certo de abstração

Uma abstração deve estar num nível consistente. Uma interface que mistura
operações de alto nível (`processarPedido`) com detalhes de baixo nível
(`abrirConexao`) obriga o consumidor a raciocinar em dois níveis
simultaneamente — que é o oposto do que abstração faz.

## Modelo Mental

**Abstração é uma promessa de que você não precisa olhar do outro lado.**

Toda vez que alguém precisa olhar, a promessa foi quebrada. Contar quantas vezes
isso acontece é a medida prática da qualidade da abstração.

## Quando Usar

- Quando existem **múltiplas implementações reais**, agora ou com certeza
  razoável no futuro próximo.
- Quando o detalhe escondido é genuinamente irrelevante para o consumidor.
- Quando a abstração corresponde a um conceito do domínio, e não a uma
  conveniência técnica.
- Quando é necessária para testar — substituir uma dependência externa é uma
  razão legítima e frequentemente a única.
- Quando o conceito se repetiu três vezes ou mais e a forma se estabilizou.

## Quando Não Usar

**Quando há uma implementação e não há segunda no horizonte.** O caso mais comum.
Uma interface com um implementador é um arquivo a mais e zero flexibilidade.

**Quando a abstração exige que o consumidor conheça o outro lado.** Ver o teste
acima. Abstração que vaza no caso comum não é abstração.

**A partir de dois casos parecidos.** Espere o terceiro. A semelhança entre dois
casos é frequentemente coincidência.

**Quando o domínio ainda não está entendido.** Abstrair cedo congela um modelo
provisório, e desfazê-lo depois é mais caro que tê-lo evitado.

**Quando adiciona um nível sem remover nenhum.** Uma camada que apenas repassa
chamadas para outra é indireção pura. O teste: se removê-la não obriga nenhum
consumidor a saber nada novo, ela não estava escondendo nada.

## Alternativas

- **Duplicação temporária** — barata, reversível, e informativa: as diferenças
  entre as cópias revelam qual é o conceito real.
- **Função em vez de interface** — quando o que varia é comportamento simples,
  passar uma função é mais leve que uma hierarquia.
- **Parametrização** — quando a variação é de valor, não de comportamento.
- **Adiar** — a alternativa mais subestimada. Uma abstração não criada não custa
  nada e continua disponível.

## Trade-offs

O eixo é **flexibilidade futura versus complexidade presente**.

| Mais abstração | Menos abstração |
|---|---|
| Troca de implementação viável | Troca exige tocar consumidores |
| Consumidor não vê detalhe | Detalhe visível, e às vezes é bom |
| Testar isoladamente é possível | Teste carrega dependência real |
| Um nível a navegar | Fluxo direto |
| Risco de capturar o conceito errado | Sem risco de abstração errada |
| Custo pago agora, benefício talvez | Custo pago se e quando necessário |

A assimetria decisiva: o custo da abstração é certo e imediato; o benefício é
incerto e futuro. Isso desloca o ônus da prova para quem quer abstrair.

## Modos de Falha

**Abstração vazada.** O consumidor precisa saber o que está escondido para usar
corretamente. Comum em repositórios que escondem SQL até o momento em que
desempenho importa.

**Abstração de um.** Interface com uma implementação, criada por hábito. Custo
sem benefício.

**Abstração errada capturada cedo.** Cada novo caso precisa ser torcido para
caber. O sintoma é a proliferação de parâmetros booleanos e casos especiais.

**Camada anêmica.** Existe por simetria e apenas repassa. Aumenta o custo de
navegação e não esconde nada.

**Generalização especulativa.** Abstração construída para requisitos imaginados.
Normalmente adivinha errado o eixo de variação, e o requisito real quando chega
não encaixa.

## Exemplo Real

Um time criou `PaymentGateway` como interface, com `StripeGateway` como única
implementação, "para poder trocar de provedor".

Três anos depois, o provedor nunca foi trocado. Mas o custo foi maior que a
interface extra.

A interface expunha `charge(amount, token)`. Stripe suporta captura tardia,
parcelamento e chaves de idempotência — nada disso cabia na assinatura. Cada
recurso adicionado ao longo dos três anos exigiu uma decisão: alargar a interface
(o que a amarrou ao Stripe de todo jeito) ou contorná-la (o que a esvaziou).

O time fez as duas coisas em momentos diferentes. Ao final, a interface tinha
onze métodos, todos modelados sobre o Stripe, e dois pontos no código que
acessavam o cliente Stripe diretamente porque a interface não comportava.

A abstração não permitiria trocar de provedor — ela era o Stripe com outro nome.

O que teria funcionado: usar o cliente Stripe diretamente, e introduzir a
abstração no dia em que um segundo provedor entrasse, com o conhecimento dos dois
para modelá-la. O custo de fazer isso depois seria menor que o custo pago durante
três anos.

## Conceitos Relacionados

- [Complexidade](/01-fundamentals/complexity.md) — o que a abstração deveria reduzir.
- [Acoplamento](/01-fundamentals/coupling.md) — o que ela redistribui.
- [Modularidade](/01-fundamentals/modularity.md) — onde ela materializa fronteiras.

## Exercício Prático

Liste as interfaces do seu sistema que têm exatamente uma implementação.

Para cada uma, responda: existe uma segunda implementação prevista com data? Ela
é necessária para teste? Se a resposta for não para as duas, calcule quantos
arquivos e quanta navegação ela custa.

Depois escolha uma e remova-a. Observe se algo piorou de fato.

## Perguntas de Entrevista

- Como você sabe se uma abstração está valendo a pena?
- O que é abstração prematura e por que é pior que duplicação?
- Quando uma interface com uma única implementação se justifica?

## Para Aprofundar

- Ousterhout, John. *A Philosophy of Software Design*. Yaknyam Press, 2018 — o
  conceito de módulos profundos versus rasos.
- Spolsky, Joel. *The Law of Leaky Abstractions*, 2002.
- Hunt, Andrew; Thomas, David. *The Pragmatic Programmer*. 2ª ed., 2019 — sobre
  DRY como duplicação de conhecimento, não de texto.
