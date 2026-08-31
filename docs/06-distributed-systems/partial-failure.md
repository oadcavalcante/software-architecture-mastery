---
id: partial-failure
title: Falha Parcial
sidebar_position: 3
description: Parte do sistema funciona, parte não — a diferença estrutural entre local e distribuído.
doc_type: concept
level: 4
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor projeta assumindo que qualquer subconjunto de componentes
  pode estar fora, e reconhece os estados intermediários que isso cria.
prerequisites: [network-failure]
related: [idempotency, sagas, circuit-breakers]
canonical_for: [falha parcial]
content_version: 1
last_reviewed: 2026-08-27
---

# Falha Parcial

## Visão Geral

Falha parcial é a situação em que parte do sistema funciona e parte não.

É **a** diferença entre sistemas locais e distribuídos. Num processo único, a
falha é total: se ele morre, morre inteiro, e o estado em memória vai junto — de
forma consistente. Distribuído, um componente cai enquanto os outros continuam, e
o sistema fica num estado que ninguém projetou.

## Problema

O caso concreto: uma operação de negócio envolve três passos em componentes
diferentes.

```text
1. reservar estoque    ✓ sucesso
2. cobrar cartão       ✓ sucesso
3. emitir nota fiscal  ✗ o serviço está fora
```

O sistema não está funcionando nem parado. Ele está num estado em que o cliente
foi cobrado, o estoque foi reservado, e não existe documento fiscal.

Esse estado não aparece em nenhum diagrama. Não é erro de programação — é
consequência inevitável de a operação atravessar fronteiras que falham
independentemente.

**Projetar sistemas distribuídos é, em grande medida, decidir o que fazer nesses
estados.**

## Conceitos Centrais

### O número de estados explode

Com N passos que podem falhar independentemente, os estados intermediários crescem
exponencialmente.

Três passos produzem oito combinações de sucesso e falha. Cinco produzem 32. Cada
uma precisa de uma resposta — ainda que a resposta seja "aceitamos e corrigimos
manualmente".

Esse é o argumento mais forte contra granularidade excessiva: **cada fronteira
adicional multiplica os estados a considerar.**

### As três respostas possíveis

**Compensar.** Desfazer o que já foi feito. Estornar a cobrança, liberar o
estoque. É o que [sagas](/06-distributed-systems/sagas.md) formalizam, e exige que cada passo tenha
inverso — o que nem sempre existe. Um e-mail enviado não se desenvia.

**Retomar.** Persistir o progresso e continuar depois. Exige estado intermediário
durável e passos [idempotentes](/06-distributed-systems/idempotency.md).

**Aceitar e reconciliar.** Deixar inconsistente e corrigir por um processo
separado, que compara os lados e resolve. É a resposta usual quando compensar é
impossível.

A escolha é de negócio, não técnica: qual inconsistência é tolerável, por quanto
tempo, e quem a resolve.

### O estado precisa ser durável

Uma operação de vários passos com o progresso em memória perde tudo se o processo
morrer no meio. O estado precisa ser persistido a cada passo, ou não há como
retomar nem reconciliar.

É o que transforma "uma função que chama três serviços" numa máquina de estados
persistida. Ver [State](/03-design-patterns/state.md).

### Falha parcial não exige microsserviços

Ela não depende da arquitetura. Um monolito que chama um serviço de pagamento
externo e um de e-mail já tem falha parcial — em duas fronteiras.

O que microsserviços fazem é multiplicar o número de fronteiras.

### A falha parcial silenciosa é a pior

Os casos discutidos até aqui envolvem algo que falha de forma visível. O modo mais
difícil é o componente que continua respondendo e responde errado.

**Degradado mas vivo.** Um nó com disco cheio aceita conexões, responde à
verificação de saúde e falha em toda escrita real.

**Lento sem falhar.** Responde em 30 segundos em vez de 30 milissegundos. Nenhum
erro é registrado, e a lentidão se propaga aos chamadores até esgotar suas
conexões.

**Correto mas desatualizado.** Uma réplica que parou de replicar continua servindo
leituras — de dados antigos, sem sinal de que algo está errado.

Nenhum desses aparece em contagem de erros. Detectá-los exige verificar
comportamento, não disponibilidade: a verificação de saúde precisa exercitar o
caminho real, e o monitoramento precisa observar latência e defasagem, não apenas
sucesso e falha.

## Modelo Mental

**Para cada passo: se falhar aqui, em que estado o sistema fica, e quem o
resolve?**

Se a resposta for "não sei", esse é um estado que vai acontecer e ninguém vai
saber tratar.

## Quando Usar

Não é técnica opcional. As decisões que ela informa:

- Escolher entre compensação, retomada e reconciliação, por operação.
- Decidir onde persistir o progresso.
- Definir o que é tolerável ficar inconsistente e por quanto tempo.
- Dimensionar o esforço de operação — reconciliação exige quem a acompanhe.

## Quando Não Usar

**Presumir que os passos sempre completam.** É a premissa que produz o estado
órfão.

**Compensar quando não há inverso real.** Um estorno é outra operação com suas
próprias falhas.

**Reconciliar sem alerta.** Um processo silencioso esconde a frequência do
problema.

**Multiplicar fronteiras sem necessidade.**

## Alternativas

- **Transação local** — quando os passos cabem no mesmo banco, a falha parcial
  desaparece. É a razão mais forte para manter coisas juntas.
- **Reduzir o número de passos** — juntar dois serviços elimina uma fronteira e
  metade dos estados.
- **Tornar passos opcionais** — se o e-mail pode falhar sem consequência, sai do
  fluxo crítico e vira evento.

## Trade-offs

| Compensar | Retomar | Reconciliar |
|---|---|---|
| Volta ao estado inicial | Chega ao estado final | Corrige depois |
| Exige inverso por passo | Exige idempotência e estado durável | Exige processo separado |
| Rápido | Pode demorar | Assíncrono |
| O inverso pode falhar | A retomada pode falhar | Pode acumular pendências |
| Visível ao usuário | Transparente | Invisível até o alerta |

## Modos de Falha

**Estado órfão.** Cobrado sem pedido, reservado sem cobrança.

**Compensação que falha.** O estorno não passa, e agora há duas coisas erradas.

**Reconciliação que não roda.** O processo para e ninguém percebe. Ver
[processamento em background](/05-system-design/background-processing.md).

**Retomada não idempotente.** Reexecuta um passo que já tinha completado.

**Progresso em memória.** O processo morre e não há como saber onde parou.

## Erros Comuns

**Tratar cada chamada isoladamente.** O estado do conjunto é o que importa.

**Não persistir o progresso.**

**Assumir que a compensação sempre funciona.**

**Não medir a frequência de inconsistência.**

**Não ter responsável pela reconciliação.** Um relatório de divergências que
ninguém lê é o mesmo que não ter.

## Exemplo Real

Um sistema de matrícula em cursos executava quatro passos: reservar vaga, cobrar,
liberar acesso à plataforma, enviar boas-vindas.

Não havia persistência de progresso — era uma função chamando quatro serviços em
sequência.

Ao longo de um ano, três estados órfãos apareceram com frequência.

**Cobrado sem acesso.** O serviço de plataforma falhava após a cobrança. O aluno
pagava e não conseguia entrar. Descoberto pelo suporte, corrigido à mão.

**Vaga reservada sem cobrança.** A cobrança falhava e a vaga ficava presa. Cursos
apareciam esgotados com vagas fantasma.

**Acesso sem cobrança.** A retentativa manual do operador reexecutava a partir do
início. O passo de liberar acesso — já concluído — rodava de novo, inofensivo. Em
três casos, porém, o operador retomou após falha na cobrança e o acesso foi
liberado sem pagamento.

A reformulação transformou a operação numa máquina de estados persistida.

Cada passo grava o resultado antes de avançar. A retomada continua do último passo
concluído, e todos são idempotentes — reservar a mesma vaga duas vezes é
inofensivo, cobrar com a mesma chave devolve o resultado original.

O envio de boas-vindas saiu do fluxo crítico e virou evento: pode falhar sem
deixar a matrícula inconsistente.

E foi adicionada reconciliação diária comparando matrículas, cobranças e acessos,
com alerta acima de cinco divergências.

Na primeira execução, ela encontrou 47 divergências acumuladas em meses. Ninguém
sabia que existiam, porque só as que geravam reclamação eram descobertas.

## Conceitos Relacionados

- [Falha de Rede](/06-distributed-systems/network-failure.md) — a origem.
- [Idempotência](/06-distributed-systems/idempotency.md) — o que torna a retomada segura.
- [Sagas](/06-distributed-systems/sagas.md) — a formalização da compensação.
- [Transações Distribuídas](/06-distributed-systems/distributed-transactions.md) — a alternativa e seu
  custo.

## Exercício Prático

Escolha uma operação que atravessa mais de uma fronteira. Liste os passos e, para
cada um, escreva em que estado o sistema fica se ele falhar.

Depois responda, para cada estado: alguém detecta? Como se resolve?

Os estados sem resposta são os que já estão acontecendo sem que ninguém saiba.

## Perguntas de Entrevista

- Por que falha parcial é a diferença estrutural entre local e distribuído?
- Quais são as três respostas possíveis, e como escolher?
- Por que persistir o progresso é necessário?

## Para Aprofundar

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Nygard, Michael. *Release It!* 2ª ed., 2018.
- Garcia-Molina, Hector; Salem, Kenneth. *Sagas*. SIGMOD, 1987.
