---
id: idempotency
title: Idempotência
sidebar_position: 8
description: Executar uma vez ou várias tem o mesmo efeito — a propriedade que torna a retentativa segura.
doc_type: concept
level: 4
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor projeta operações idempotentes com chave explícita e
  reconhece que idempotência natural raramente é suficiente.
prerequisites: [partial-failure]
related: [retries, timeouts, duplicate-messages]
canonical_for: [idempotência, chave de idempotência]
content_version: 2
last_reviewed: 2026-08-27
---

# Idempotência

## Visão Geral

Uma operação é idempotente quando executá-la uma vez ou várias produz o mesmo
efeito.

É a propriedade que torna [retentativa](/06-distributed-systems/retries.md) segura — e como a retentativa
é inevitável em sistemas distribuídos, idempotência não é otimização: é
requisito.

Ela é o conceito central deste nível. Praticamente todo mecanismo dos documentos
seguintes pressupõe que as operações a jusante são idempotentes.

## Problema

O [terceiro resultado](/06-distributed-systems/distributed-fundamentals.md) de uma chamada de rede é "não
sei". Quando o timeout estoura, a operação pode ter acontecido ou não.

Diante disso há duas opções, e ambas são ruins sem idempotência:

**Repetir.** Se a operação aconteceu, o efeito duplica. Uma cobrança vira duas.

**Não repetir.** Se não aconteceu, o efeito se perde. Um pedido pago fica sem
processamento.

Idempotência dissolve o dilema: se repetir é seguro, sempre repita.

Note a assimetria. Sem idempotência, você precisa **adivinhar** o que aconteceu do
outro lado. Com ela, não precisa saber.

## Conceitos Centrais

### Idempotente não é o mesmo que sem efeito colateral

Uma leitura não tem efeito e é trivialmente idempotente. O caso interessante é
uma **escrita** que pode ser repetida.

```text
saldo = 100                 ← idempotente: o resultado é o mesmo
saldo = saldo - 50          ← não é: repetir debita de novo
```

A primeira forma é idempotente por natureza. A segunda não, e é a forma como a
maioria das operações de negócio se expressa.

### Idempotência natural é rara e frágil

Algumas operações são naturalmente idempotentes: definir um valor absoluto,
marcar como cancelado, inserir com chave única.

O problema é que ela **quebra com o tempo**. Uma operação de "cancelar pedido" é
idempotente até alguém adicionar "registrar o motivo do cancelamento com data" —
e aí a segunda execução sobrescreve a data original.

Confiar em idempotência natural é confiar que ninguém vai adicionar um efeito
colateral. Alguém vai.

### A chave de idempotência

A técnica que funciona: o cliente gera um identificador único por **tentativa
lógica** e o envia com a requisição. O servidor registra a chave junto com o
resultado.

```text
1ª chamada:  chave abc-123 → não vista → processa, grava resultado
2ª chamada:  chave abc-123 → já vista  → devolve o resultado gravado
```

Três detalhes que decidem se funciona:

**A chave é do cliente, não do servidor.** Se o servidor a gerasse, cada
retentativa teria uma nova. A chave identifica a intenção, e a intenção é do
cliente.

**A chave e o resultado são gravados na mesma transação do efeito.** Se forem
separados, existe uma janela em que o efeito aconteceu e a chave não foi
registrada — e a retentativa duplica.

**A chave tem prazo.** Guardá-las indefinidamente é um vazamento. O prazo precisa
ser maior que a janela realista de retentativa — tipicamente horas ou dias.

**A chave tem restrição de unicidade.** É o detalhe que a mesma transação não
resolve sozinha: duas retentativas que chegam ao mesmo tempo abrem transações que
não enxergam a chave não confirmada uma da outra, e as duas processam. A unicidade
é o que faz a segunda falhar na gravação em vez de duplicar o efeito.

```text
sem unicidade   T1 lê "não existe" → processa → grava
                T2 lê "não existe" → processa → grava     duplicou
com unicidade   T1 lê "não existe" → processa → grava
                T2 lê "não existe" → processa → grava falha → desfaz
```

Sobra decidir o que a segunda chamada recebe enquanto a primeira ainda não
terminou. Esperar prende conexão e não tem prazo garantido; a resposta usual é
recusar a concorrente com um erro que diz "esta chave está em processamento",
deixando o cliente repetir depois. Devolver o resultado não é opção — ele ainda
não existe.

### O que fazer quando a chave repete com conteúdo diferente

Caso de borda que costuma ficar sem tratamento: a mesma chave chega com um corpo
diferente.

Isso indica erro do cliente — ele reusou a chave para outra operação. A resposta
correta é rejeitar com erro explícito, não processar nem devolver o resultado
antigo. Devolver o antigo esconde um bug do cliente.

### Idempotência e o resultado, não só o efeito

Uma implementação incompleta comum: a segunda chamada não duplica o efeito, mas
devolve um erro de "já processado".

Isso força o cliente a tratar dois casos e frequentemente ele trata mal. O
comportamento correto é **devolver o mesmo resultado da primeira chamada**, como
se ela tivesse acabado de acontecer.

## Modelo Mental

**Se eu executar isto duas vezes, o mundo fica igual?** Se a resposta depende de
sorte com o tempo entre as execuções, não é idempotente.

## Quando Usar

- Qualquer operação que possa ser repetida — o que inclui toda chamada de rede.
- Consumidores de [fila](/05-system-design/queues.md) cujo efeito é observável fora
  do sistema ou irreversível.
- Endpoints de API que alteram estado.
- Passos de uma [saga](/06-distributed-systems/sagas.md) ou de um processo retomável.
- Processamento em lote que pode ser reexecutado.

## Quando Não Usar

**Quando a repetição é o dado.** Medição por chamada, trilha de auditoria de
tentativas, contador de acessos: nesses casos cada ocorrência precisa contar, e
colapsar duas em uma perde a informação que o sistema existe para guardar. É o
único caso em que a idempotência não é apenas cara — é errada.

**Operações sem efeito colateral.** Já são idempotentes; a chave só acrescenta
escrita.

**Quando o efeito duplicado é inofensivo e barato.** Registrar um log duas vezes.
Vale reconhecer explicitamente, não presumir.

**Quando o volume de chaves seria proibitivo.** Milhões de operações por segundo
com chave persistida têm custo real — aí a estratégia muda para
[deduplicação por janela](/06-distributed-systems/duplicate-messages.md), que
troca garantia por custo.

**Quando o identificador natural já resolve.** Se a operação escreve num registro
cuja chave primária vem do domínio, a própria unicidade dela dá o efeito, e a
chave de idempotência é uma segunda mecânica para a mesma coisa.

O erro é decidir que "aqui não precisa" sem verificar se o efeito duplicado é de
fato inofensivo.

## Alternativas

- **Deduplicação por janela** — guardar chaves recentes em cache em vez de
  persistir. Mais barato e com garantia mais fraca.
- **Detecção de duplicata no consumidor** — verificar se o efeito já existe antes
  de aplicar. Funciona quando há um identificador natural.
- **Tornar a operação absoluta** — reformular de "some 50" para "defina 150". Nem
  sempre possível e é a solução mais limpa quando é.
- **Transação distribuída** — cara, e evita o problema em vez de tratá-lo. Ver
  [transações distribuídas](/06-distributed-systems/distributed-transactions.md).

## Trade-offs

| Com chave de idempotência | Sem |
|---|---|
| Retentativa sempre segura | Precisa adivinhar o que aconteceu |
| Efeito duplicado impossível | Possível |
| Armazenamento de chaves a manter | Nada a manter |
| Uma escrita a mais por operação | Não |
| Cliente precisa gerar e reusar a chave | Nada do cliente |

## Modos de Falha

**Chave gravada fora da transação do efeito.** Janela em que duplica.

**Chave gerada por retentativa.** Cada tentativa com chave nova; idempotência
inexistente.

**Chave sem prazo.** Vazamento no armazenamento.

**Segunda chamada devolvendo erro em vez do resultado.** Cliente trata mal.

**Idempotência natural que quebrou.** Um efeito colateral foi adicionado e ninguém
reavaliou.

**Chave por requisição HTTP em vez de por intenção.** Se o cliente gera uma chave
nova a cada tentativa de rede, não há deduplicação.

## Erros Comuns

**Presumir idempotência natural.**

**Servidor gerando a chave.**

**Gravar chave e efeito separadamente.**

**Não tratar a chave repetida com corpo diferente.**

**Não testar o caminho de duplicação.** É o caminho que só acontece sob falha, e
por isso o menos exercitado.

## Exemplo Real

Um sistema de transferências entre contas tinha o endpoint `POST /transferencias`
sem idempotência.

O cliente móvel repetia automaticamente após timeout de 15 segundos. Com uma
degradação de rede, 89 transferências foram executadas duas vezes num único dia.

O estorno exigiu conciliação manual e comunicação a cada cliente afetado.

A correção introduziu chave de idempotência, e três detalhes só apareceram na
implementação.

**A chave precisava ser da intenção, não da requisição.** A primeira versão gerava
a chave no interceptador HTTP, que a recriava a cada tentativa. A idempotência
existia no papel e não funcionava. A chave passou a ser gerada quando o usuário
confirma a transferência na tela, e reusada por todas as tentativas daquela
confirmação.

**A gravação precisava ser atômica com o efeito.** A primeira versão gravava a
chave depois de transferir, em outra transação. Um teste de falha injetada mostrou
a janela: matar o processo entre as duas produzia duplicação. Passou a ser uma
transação só.

**A segunda chamada precisava devolver o resultado, não erro.** A versão inicial
devolvia `409 Conflict`. O cliente tratava como falha e mostrava erro ao usuário —
para uma transferência que tinha sido concluída com sucesso. Passou a devolver
`200` com o resultado original.

Os três detalhes estão na documentação de qualquer provedor de pagamento maduro. O
que faltou não foi conhecimento — foi tratar idempotência como requisito desde o
início, em vez de correção depois do incidente.

## Conceitos Relacionados

- [Falha Parcial](/06-distributed-systems/partial-failure.md) — o problema que ela resolve.
- [Retries](/06-distributed-systems/retries.md) — o que ela torna seguro.
- [Mensagens Duplicadas](/06-distributed-systems/duplicate-messages.md) — o caso em filas.
- [Garantias de Entrega](/06-distributed-systems/delivery-guarantees.md) — por que ao menos uma vez é o
  padrão.

## Exercício Prático

Liste os endpoints do seu sistema que alteram estado. Para cada um, responda: o que
acontece se ele for chamado duas vezes com o mesmo corpo?

Depois verifique se algum cliente repete automaticamente. A combinação de "duplica"
com "repete" é um incidente aguardando latência.

## Perguntas de Entrevista

- Por que idempotência é requisito e não otimização em sistemas distribuídos?
- Por que a chave deve ser gerada pelo cliente?
- O que a segunda chamada deve devolver, e por quê?

## Para Aprofundar

- Helland, Pat. *Idempotence Is Not a Medical Condition*. ACM Queue, 2012.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Documentação de chaves de idempotência de provedores de pagamento — Stripe é a
  referência mais citada.
