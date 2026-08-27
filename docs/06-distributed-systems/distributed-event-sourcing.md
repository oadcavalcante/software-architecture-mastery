---
id: distributed-event-sourcing
title: Event Sourcing Distribuído
sidebar_position: 38
description: Guardar eventos em vez de estado — e o que muda quando o log é a fonte da verdade entre serviços.
doc_type: pattern
level: 4
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor avalia event sourcing pelo custo de manutenção do log, não
  pela elegância do modelo.
prerequisites: [event-driven-systems]
related: [distributed-cqrs, eventual-consistency, ordering]
canonical_for: [event sourcing distribuído, reprocessamento de projeção, snapshot de agregado]
content_version: 1
last_reviewed: 2026-08-27
---

# Event Sourcing Distribuído

## Visão Geral

Em event sourcing, o armazenamento não guarda o estado atual — guarda a **sequência
de eventos** que produziu esse estado. O estado é derivado reproduzindo os eventos.

Num contexto distribuído, isso significa que o log de eventos vira a fonte da
verdade compartilhada, e outros serviços constroem suas próprias visões a partir
dele.

O padrão dá auditoria completa, capacidade de reconstruir qualquer estado passado e
liberdade para criar novas visões retroativamente. Ele também torna o esquema de
eventos permanente — e é essa permanência que a maioria dos times subestima.

## Problema

Um armazenamento de estado atual responde "como está" e descarta "como chegou
aqui".

Isso é adequado na maioria dos casos e insuficiente em alguns: auditoria
regulatória, análise de comportamento, correção retroativa de defeitos de cálculo,
e a necessidade de responder perguntas que não existiam quando o dado foi gravado.

Event sourcing resolve isso guardando tudo. E introduz problemas que armazenamento
de estado não tem.

## Conceitos Centrais

### O log é imutável e permanente

Eventos não se alteram nem se apagam. Um erro é corrigido por um evento
compensatório, não por edição.

Consequência que domina todo o resto: **o formato de um evento gravado em 2020
precisa ser legível em 2030**. Não existe migração de esquema no sentido usual.

Toda mudança precisa ser aditiva, e o código de reprodução precisa lidar com todas
as versões já gravadas. Depois de alguns anos, isso significa código com ramos por
versão de evento.

Times que adotam event sourcing sem planejar versionamento descobrem, no segundo
ano, que não conseguem mudar um evento sem escrever conversor.

### Snapshot é obrigatório na prática

Reproduzir dez anos de eventos para responder uma consulta é inviável. Snapshots
periódicos guardam o estado em um ponto, e a reprodução parte dali.

O snapshot é derivado — pode ser descartado e recalculado. E ele reintroduz parte
do problema que event sourcing evitava: um snapshot gravado numa versão do modelo
pode não ser compatível com a próxima.

A prática que funciona: versionar os snapshots e descartá-los na mudança de modelo,
regerando a partir do log.

### Projeções e o CQRS que vem junto

Consultar reproduzindo eventos não escala. A leitura acontece sobre **projeções** —
visões materializadas construídas a partir do log.

Isso torna [CQRS](distributed-cqrs.md) praticamente obrigatório, e traz
[consistência eventual](eventual-consistency.md) entre escrita e leitura.

O ganho específico do event sourcing aqui: uma projeção nova pode ser construída
retroativamente, sobre todo o histórico. É a capacidade que justifica o padrão em
muitos casos.

### Distribuído acrescenta acoplamento

Quando outros serviços consomem o log diretamente, o esquema de eventos vira
contrato público entre serviços.

Isso é acoplamento forte disfarçado: mudar a estrutura interna de eventos de um
serviço afeta todos os que os consomem.

A alternativa que preserva a autonomia: manter o log de eventos **interno** ao
serviço e publicar eventos de integração — uma tradução estável e versionada do que
o resto precisa saber.

Essa separação entre evento interno e evento de integração é a decisão que mais
distingue implementações sustentáveis das que travam.

### Reprocessamento é o superpoder e a armadilha

Reconstruir uma projeção a partir do zero corrige defeitos de projeção
retroativamente — o que é genuinamente poderoso.

A armadilha: se a reprodução tiver efeito colateral — enviar e-mail, chamar API — o
reprocessamento dispara tudo de novo.

Projeções precisam ser puras. Efeitos colaterais pertencem a outro lugar, com
controle de idempotência.

### O custo de armazenamento e privacidade

O log só cresce. Isso é gerenciável em custo, e problemático em privacidade:
regulações de proteção de dados exigem apagar dados pessoais, e o log é imutável.

As soluções — criptografia por titular com descarte de chave, ou separação de dados
pessoais para fora do log — precisam ser projetadas desde o início. Adicionar
depois é muito caro.

Este ponto reprova a adoção de event sourcing em vários sistemas que lidam com dado
pessoal, e raramente é levantado nas discussões de adoção.

## Modelo Mental

**Event sourcing troca simplicidade do presente por acesso completo ao passado.**
E o passado, uma vez gravado, não muda de formato.

## Quando Usar

- Auditoria completa é requisito regulatório.
- O histórico de como se chegou ao estado tem valor de negócio.
- Novas perguntas sobre dados passados surgem com frequência.
- Correção retroativa de cálculo é necessária.
- O domínio é naturalmente uma sequência de fatos — contabilidade, movimentação,
  histórico clínico.

## Quando Não Usar

**Como padrão arquitetural.** É especializado, não geral.

**Quando só o estado atual importa.** A grande maioria dos casos.

**Sem estratégia de versionamento de evento.** Trava em dois anos.

**Com dados pessoais e sem plano de apagamento.** Conflito regulatório.

**Sem experiência prévia no time.** A curva é longa e os erros são caros de
reverter.

**Em CRUD.** Cadastro de cliente, catálogo, configuração — o log não agrega e o
custo é integral.

**Compartilhando o log interno entre serviços.** Acoplamento severo.

## Alternativas

- **Tabela de auditoria** — resolve a maior parte da necessidade de histórico com
  uma fração do custo.
- **Versionamento temporal** — guardar versões de registro com validade.
- **Log de mudanças do banco** — capturar alterações sem mudar o modelo da
  aplicação.
- **Event sourcing apenas em agregados selecionados** — o desenho mais comum entre
  implementações bem-sucedidas.

A primeira merece ênfase: quando o requisito é "quero saber quem mudou o quê e
quando", tabela de auditoria entrega isso sem nenhum dos custos.

## Trade-offs

| Event sourcing | Estado atual |
|---|---|
| Histórico completo | Só o presente |
| Projeções retroativas | Impossível |
| Auditoria nativa | Tabela separada |
| Esquema permanente | Migração normal |
| Snapshot necessário | Consulta direta |
| Apagamento difícil | Simples |
| Curva longa | Familiar |

## Modos de Falha

**Esquema travado.** Mudar um evento exige conversor para todas as versões.

**Reprodução lenta.** Sem snapshot, ou com snapshot desatualizado.

**Efeito colateral no reprocessamento.** E-mails reenviados.

**Projeção divergente.** Um defeito na projeção produz leitura errada até ser
reconstruída.

**Log como contrato entre serviços.** Mudança interna quebra terceiros.

**Conflito de privacidade.** Ordem de apagamento sem mecanismo.

**Crescimento sem limite.** Custo e tempo de reprodução.

## Erros Comuns

**Adotar como padrão geral.**

**Não separar evento interno de evento de integração.**

**Não planejar versionamento desde o primeiro evento.**

**Projeção com efeito colateral.**

**Ignorar o requisito de apagamento.**

**Confundir com "publicar eventos".** Publicar eventos não é event sourcing; event
sourcing é derivar o estado deles.

A última confusão é frequente e leva times a acreditar que já fazem event sourcing
quando fazem [comunicação por eventos](event-driven-systems.md).

## Exemplo Real

Uma fintech adotou event sourcing para o núcleo de contas — decisão adequada, dado
o requisito regulatório de auditoria e a natureza do domínio.

O que funcionou: reconstruir o saldo de qualquer conta em qualquer data passada
virou consulta trivial, e uma exigência do regulador que teria custado meses de
trabalho foi atendida em dias.

Quatro problemas apareceram ao longo de três anos.

**Esquema.** O evento de transferência ganhou campos ao longo do tempo. Na quinta
versão, o código de reprodução tinha cinco ramos. Foi resolvido com conversores
encadeados — cada versão converte para a seguinte, e a reprodução só conhece a
última. O custo foi reescrever a camada de reprodução inteira.

**Reprocessamento com efeito.** Uma projeção de notificação disparava alerta ao
cliente. Um reprocessamento de correção enviou 400 mil notificações duplicadas numa
madrugada. As projeções foram separadas de efeitos, e os efeitos ganharam controle
de idempotência com janela.

**Apagamento.** Uma solicitação de exclusão de dados pessoais chegou e não havia
mecanismo. A solução foi criptografia por titular: dados pessoais no log guardados
cifrados com chave por cliente, e o apagamento descarta a chave. Implementar
retroativamente exigiu reescrever o log — a operação mais arriscada que a equipe já
fez.

**Extensão indevida.** Outro time adotou event sourcing para o cadastro de
produtos, por consistência arquitetural. Dois anos depois, o módulo foi migrado de
volta para CRUD: o histórico nunca foi consultado, e o custo de manutenção era
integral.

O que a equipe registra: a decisão original foi correta e permanece; o erro foi
tratá-la como padrão do sistema em vez de escolha para um domínio específico.

## Conceitos Relacionados

- [CQRS Distribuído](distributed-cqrs.md) — que vem junto.
- [Sistemas Orientados a Eventos](event-driven-systems.md) — não é a mesma coisa.
- [Consistência Eventual](eventual-consistency.md) — entre escrita e projeção.
- [Ordenação](ordering.md) — o log depende dela.

## Exercício Prático

Se você está considerando event sourcing, responda três perguntas antes: quem vai
consultar o histórico e com que frequência; como um evento será versionado no ano
três; e o que acontece quando chegar uma ordem de apagamento de dados pessoais.

Se alguma não tiver resposta, tabela de auditoria provavelmente resolve o
requisito real.

## Perguntas de Entrevista

- Por que o esquema de eventos é permanente, e o que isso exige?
- Por que projeções precisam ser puras?
- Qual a diferença entre event sourcing e publicar eventos?

## Para Aprofundar

- Young, Greg. *Versioning in an Event Sourced System*, 2017.
- Vernon, Vaughn. *Implementing Domain-Driven Design*. Addison-Wesley, 2013 —
  apêndice A.
- Fowler, Martin. *Event Sourcing*, 2005.
