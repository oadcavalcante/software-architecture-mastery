---
id: memento
title: Memento
sidebar_position: 17
description: Capturar e restaurar estado sem violar encapsulamento — e o custo que ninguém orça.
doc_type: pattern
level: 2
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor aplica Memento sabendo o custo de memória e a diferença
  entre snapshot e inverso lógico.
prerequisites: [command]
related: [command, prototype, event-sourcing]
canonical_for: [memento]
content_version: 2
last_reviewed: 2026-08-26
---

# Memento

## Visão Geral

Memento captura o estado interno de um objeto e o externaliza, sem violar o
encapsulamento, de modo que o objeto possa ser restaurado a esse estado depois.

A cláusula "sem violar o encapsulamento" é o que distingue o padrão de
simplesmente expor os campos.

## Problema

É preciso restaurar um objeto a um estado anterior — desfazer, ponto de
verificação, transação, rascunho salvo.

A solução ingênua é expor os campos para que alguém os leia e depois os escreva
de volta. Isso destrói o
[encapsulamento](/02-software-design/encapsulation.md): quem restaura passa a
conhecer a estrutura interna, e mudá-la quebra o mecanismo de restauração.

Memento resolve com uma assimetria: o memento é **opaco para quem o guarda** e
**transparente para quem o criou**. O zelador armazena e devolve; só o originador
sabe interpretar.

## Conceitos Centrais

### Os três papéis

**Originador** — o objeto cujo estado é capturado. Cria e interpreta mementos.

**Memento** — o estado capturado. Interface pública mínima; conteúdo acessível
apenas ao originador.

**Zelador** — guarda os mementos e decide quando restaurar. Nunca examina o
conteúdo.

A separação entre zelador e originador é o ponto do padrão. Sem ela, é apenas
serialização.

### Memento versus inverso lógico

A mesma decisão que aparece em [Command](/03-design-patterns/command.md).

**Memento** guarda o estado antes. Simples de acertar, caro em memória, e
funciona para qualquer operação.

**Inverso lógico** sabe a operação contrária. Compacto, e precisa estar correto
inclusive nos casos de borda.

Memento é a escolha segura quando o estado é pequeno ou quando a correção do
inverso é difícil de garantir.

### Estado completo ou incremental

Guardar o objeto inteiro a cada operação é simples e cresce linearmente com o
número de operações.

Guardar apenas o que mudou é econômico e mais complexo — exige saber compor os
deltas na ordem certa.

A prática comum é híbrida: um estado completo a cada N operações e deltas entre
eles, que é a mesma estratégia de instantâneos usada em
[event sourcing](/03-design-patterns/event-sourcing.md).

### O custo que ninguém orça

A memória. Um documento de 5 MB com cem operações de desfazer são 500 MB se cada
memento for completo.

É o custo que faz implementações ingênuas de desfazer serem abandonadas em
produção, e precisa ser estimado antes.

## Quando Usar

- Desfazer e refazer.
- Pontos de verificação em processos longos.
- Rascunhos e versões de trabalho.
- Rollback de transação em memória.
- Testar se uma operação especulativa vale a pena, com a opção de reverter.

## Quando Não Usar

**Quando o estado é grande e as operações são muitas.** A memória não fecha.

**Quando inverso lógico é confiável e barato.** Ver [Command](/03-design-patterns/command.md).

**Quando o estado inclui recursos externos.** Uma conexão, um arquivo aberto ou um
efeito já enviado não são restauráveis por memento.

**Quando a persistência já mantém versões.** Tabela temporal, trilha de auditoria ou
armazenamento que só acrescenta já dão o histórico. Gravar a cada mudança, por si, não dá:
um `UPDATE` deixa só o estado atual, e não há a que voltar.

**Quando o objeto é imutável.** Não há o que capturar — a versão anterior ainda
existe.

## Alternativas

- **Objetos imutáveis** — cada operação produz uma nova versão; a anterior é o
  memento, sem mecanismo. É a alternativa que dispensa o padrão.
- **Inverso lógico** — mais econômico quando confiável.
- **[Event sourcing](/03-design-patterns/event-sourcing.md)** — guardar os eventos em vez do estado.
  Memento em escala de sistema.
- **Versionamento na persistência** — quando o histórico já é gravado.

## Trade-offs

| Memento | Inverso lógico |
|---|---|
| Funciona para qualquer operação | Precisa ser implementado por operação |
| Restauração garantidamente correta | Correção depende de cada inverso |
| Memória: estado × número de operações | Memória: registro pequeno × número de operações |
| Não precisa entender a operação | Precisa |
| Não sabe que o efeito externo existe | Pode declarar a compensação dele |

## Modos de Falha

**Consumo de memória crescente.** O modo dominante.

**Memento com referência compartilhada.** Cópia rasa: restaurar não desfaz, porque
o objeto interno é o mesmo. Ver [Prototype](/03-design-patterns/prototype.md).

**Estado externo não restaurado.** O objeto volta ao estado anterior e o mundo
não.

**Memento obsoleto.** A estrutura do originador mudou entre a captura e a
restauração — relevante quando mementos são persistidos.

**Zelador que examina o conteúdo.** O encapsulamento se perde, e o padrão vira
serialização.

## Erros Comuns

**Não estimar a memória.**

**Cópia rasa no memento.**

**Persistir memento sem versionamento.** Muda a estrutura, quebra a restauração.

**Deixar o zelador interpretar.** Anula a razão de ser do padrão.

## Onde ele aparece na prática

**Desfazer em editores.** O uso canônico, quase sempre híbrido com inverso
lógico.

**Transações em memória.** Estruturas de dados transacionais que capturam o
estado antes e restauram em caso de aborto.

**Serialização de sessão de trabalho.** Um rascunho salvo é um memento
persistido — e é onde o versionamento da estrutura passa a importar.

**Pontos de verificação em processamento longo.** Um trabalho em lote que salva
estado periodicamente para poder retomar.

O terceiro caso muda a natureza do padrão: um memento que sobrevive ao processo
precisa de formato estável e migração, o que o aproxima de um problema de
persistência com todas as suas questões de evolução de schema.

## Exemplo Real

Um formulário de proposta de seguro tinha 40 campos e um assistente de sete
etapas. O usuário podia voltar etapas e alterar respostas, e cada alteração
recalculava as etapas seguintes.

Restaurar o estado ao voltar era necessário: se o usuário mudasse a faixa etária
na etapa dois e voltasse, as coberturas selecionadas na etapa quatro precisavam
voltar ao que eram.

Memento por etapa resolveu. Sete mementos por proposta, com o estado completo.
O objeto tinha alguns kilobytes; a memória nunca foi problema.

O que quase quebrou foi outra coisa: as propostas ficavam salvas como rascunho por
até trinta dias, e os mementos eram persistidos junto.

Quando um campo foi adicionado ao formulário, os mementos antigos não o tinham. A
restauração de um rascunho de duas semanas produzia um objeto com o campo novo
nulo, e a validação falhava com mensagem incompreensível.

A correção foi versionar o memento e escrever migração — que é trabalho de
evolução de schema, e não estava previsto quando o padrão foi adotado como
mecanismo em memória.

A lição: **memento persistido deixa de ser um detalhe de implementação e vira um
formato público**, com todas as obrigações que isso implica.

## Conceitos Relacionados

- [Command](/03-design-patterns/command.md) — desfazer por inverso lógico.
- [Prototype](/03-design-patterns/prototype.md) — o risco de cópia rasa.
- [Event Sourcing](/03-design-patterns/event-sourcing.md) — a ideia em escala de sistema.

## Exercício Prático

Se seu sistema tem desfazer ou rascunho, estime: qual o tamanho do estado
capturado e quantas capturas ficam vivas simultaneamente?

Se algum desses estados é persistido, verifique: existe versionamento? O que
acontece ao restaurar um capturado antes da última mudança de estrutura?

## Perguntas de Entrevista

- O que Memento preserva que a exposição de campos destrói?
- Quando inverso lógico é preferível?
- O que muda quando um memento é persistido?

## Para Aprofundar

- Gamma, Erich et al. *Design Patterns*. Addison-Wesley, 1994.
