---
id: 06-partial-failure
title: "Exercício 06 — Lidar com Falhas Parciais"
sidebar_position: 3
description: Noventa e seis vezes por dia o sistema não sabe se cobrou — e assumir uma resposta é como se criam cobranças duplicadas.
doc_type: exercise
level: 4
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor trata "não sabemos" como estado explícito e desenha a reconciliação que
  o resolve.
prerequisites: [05-async-processing]
related: [partial-failure, idempotency, retries, duplicate-messages]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-29
---

# Exercício 06 — Lidar com Falhas Parciais

:::info Continuação

Este exercício resolve o caso `5c` que ficou aberto no
[exercício 04](/06-distributed-systems/exercises/05-async-processing.md): a autorização é enviada e nenhuma resposta chega.

:::

## Contexto

O fluxo assíncrono está em produção há três meses. Ele resolveu a latência, a propagação de
indisponibilidade e o esgotamento de conexões.

E produziu um problema que não existia antes, ou que existia e era invisível:

```text
chamadas ao adquirente/dia                    ~48 000
sem resposta conclusiva (tempo esgotado)       ~96/dia (0,2%)
cobranças duplicadas relatadas por clientes    ~340/mês
estornos manuais feitos pelo financeiro        ~410/mês
tempo médio do financeiro por caso             22 minutos
```

A causa é conhecida internamente: quando o tempo se esgota sem resposta, o sistema marca o
pedido como recusado e libera a reserva. Se o adquirente tiver processado a cobrança — e não há
como saber —, o cliente foi cobrado por um pedido que não existe. E se ele repetir a compra, é
cobrado de novo.

## Requisitos

```text
nenhum cliente pode ser cobrado por um pedido que não existe
nenhum cliente pode ser cobrado duas vezes pela mesma intenção
de compra
todo caso ambíguo precisa ser resolvido em até 30 minutos
a resolução não pode depender de intervenção humana no
caso comum
```

## Restrições

```text
adquirente          três dos cinco endpoints suportam consulta
                    por identificador de requisição; o de
                    autorização suporta
                    a consulta tem limite de 20 chamadas/s
retentativa         o adquirente não garante idempotência;
                    reenviar a mesma requisição pode cobrar de novo
arquivo diário      o adquirente envia um arquivo de conciliação
                    às 4h, com todas as transações do dia anterior
reserva de estoque  30 minutos, do exercício 02
regulatório         cobrança indevida tem prazo de estorno e
                    reporte obrigatório
```

## Sua Tarefa

Produza, em até 90 minutos:

1. O **estado novo** do pedido, e por que ele não pode ser "recusado".
2. O **mecanismo de resolução**, do momento em que o tempo se esgota até o desfecho.
3. O que impede a **cobrança dupla** quando o cliente tenta de novo.
4. O que acontece nos casos que o mecanismo automático **não** resolve.
5. Como você **mede** se o mecanismo está funcionando.

## Perguntas que Você Deveria Fazer

```text
quando o tempo se esgota, o que de fato aconteceu do outro lado?
existe forma de perguntar ao adquirente o que aconteceu?
se eu reenviar, o que impede a segunda cobrança?
o que o cliente vê enquanto está ambíguo?
qual o pior desfecho: recusar uma compra válida, ou cobrar
  uma inválida?
quantos casos por dia o arquivo das 4h resolve, e quantos
  precisam ser resolvidos antes disso?
```

A quinta é a pergunta de arquitetura. As outras derivam dela.

## Critérios de Avaliação

Sua resposta está boa se:

- **Existe um estado explícito para "não sabemos".** Nem confirmado, nem recusado. Assumir
  qualquer um dos dois é como as 340 duplicidades mensais aparecem.
- **A resolução é por consulta, não por retentativa.** O adquirente suporta consulta por
  identificador; perguntar é seguro, reenviar não é.
- **A idempotência tem duas camadas.** A chave do cliente impede que a repetição dele vire
  segunda intenção de compra; o identificador de requisição permite consultar e reenviar com
  segurança.
- **O arquivo das 4h é rede de segurança, não mecanismo principal.** Trinta minutos de requisito
  contra um arquivo que chega no dia seguinte não fecham.
- **Você mediu.** Casos ambíguos abertos, idade do mais antigo, taxa de resolução automática.

Sua resposta é fraca se ela resolve por retentativa sem garantia de idempotência do outro lado —
isso troca uma duplicidade por outra.

## Discussão

:::details Abra depois de tentar

**O estado se chama ambíguo**, e ele é a resposta inteira do exercício.

Marcar como recusado é uma afirmação que o sistema não tem base para fazer. Marcar como
confirmado é pior. O único enunciado verdadeiro é "enviamos e não sabemos", e ele precisa
existir no modelo — porque tudo o que vem depois depende de a plataforma admitir que não sabe.

**O mecanismo:**

```text
1. tempo esgotado → pedido vai para "ambíguo", com o
   identificador de requisição gravado
2. um reconciliador consulta o adquirente por aquele
   identificador, com recuo exponencial
3. resposta "autorizado"  → pedido confirmado
   resposta "não existe"  → pedido recusado, reserva liberada
   sem resposta em 30 min → escalonamento humano
4. o arquivo das 4h reconcilia o que sobrou e detecta
   divergência entre o que registramos e o que o adquirente
   registrou
```

O limite de 20 consultas por segundo é folgado para 96 casos diários — mas não para um episódio
de degradação do adquirente, em que os casos ambíguos podem passar de mil em uma hora. O
reconciliador precisa de fila com limite de taxa, ou ele agrava a degradação que o produziu.

**A cobrança dupla** é impedida pela chave de idempotência do cliente: a segunda tentativa com a
mesma chave retorna o resultado da primeira, incluindo "ambíguo". O cliente vê "estamos
verificando", não uma cobrança nova.

Essa é a parte que a maioria erra ao projetar: permitir a retentativa do cliente enquanto o
estado é ambíguo. Ver
[idempotência](/06-distributed-systems/idempotency.md).

**O que o cliente vê** importa tanto quanto o mecanismo. "Estamos confirmando seu pagamento,
isso leva até 30 minutos" é honesto e tolerável. Silêncio produz reenvio, e reenvio é como as
duplicidades aparecem mesmo com o mecanismo correto.

**A pergunta 5 — qual desfecho é pior** — decide o comportamento nos casos que o automático não
resolve. Neste domínio, cobrar indevidamente é pior que recusar: a recusa custa uma venda, a
cobrança custa uma reclamação regulatória e a confiança. Então o escalonamento humano falha
para o lado de cancelar e estornar.

Num domínio diferente — reserva de assento de voo com a saída em duas horas — a resposta pode
ser oposta.

**A medição que importa:**

```text
casos ambíguos abertos, e idade do mais antigo
taxa de resolução automática (alvo: > 99%)
duplicidades detectadas — deveria ser zero
divergências no arquivo das 4h
```

O primeiro é o alarme: um caso ambíguo com mais de 30 minutos é dinheiro em estado desconhecido,
e é incidente, não métrica.

**O efeito não previsto**, que aparece em sistemas reais: introduzir o estado ambíguo torna o
problema **mensurável** pela primeira vez. Antes, os 96 casos diários viravam recusas e se
misturavam às recusas legítimas. Depois, eles são uma categoria com número — e esse número vira
o argumento para renegociar o contrato com o adquirente.

:::

## Conceitos Relacionados

- [Exercício 05](/06-distributed-systems/exercises/05-async-processing.md) e [Exercício 07](/12-reliability/exercises/07-multi-region.md).
- [Falha Parcial](/06-distributed-systems/partial-failure.md) e [Idempotência](/06-distributed-systems/idempotency.md).
- [Repetições](/06-distributed-systems/retries.md).
- [Case: Plataforma de Pagamentos](/21-case-studies/payments.md).
