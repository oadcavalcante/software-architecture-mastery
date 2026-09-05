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
related: [distributed-cqrs, eventual-consistency, ordering, event-sourcing]
canonical_for: [event sourcing distribuído, reprocessamento de projeção, snapshot de agregado]
content_version: 3
last_reviewed: 2026-08-27
---

# Event Sourcing Distribuído

> Pré-requisito: [Event Sourcing](/03-design-patterns/event-sourcing.md) estabelece o que é
> o padrão, por que o esquema de eventos vira compromisso permanente e quando ele não se
> paga. Aqui o foco é uma pergunta só: **o que muda quando o log atravessa a fronteira do
> serviço.**

## Visão Geral

Dentro de um serviço, o log de eventos é detalhe de implementação: quem o lê é o próprio
código que o escreveu, e mudar a estrutura de um evento é refatoração.

Quando outro serviço lê esse log, ele deixa de ser detalhe e vira **contrato**. É a mesma
mudança de natureza que uma tabela sofre quando um segundo sistema passa a consultá-la — e
ela não é anunciada por nada: o log continua parecendo interno, e a primeira mudança de
esquema é que revela que não era.

## Problema

Event sourcing produz, de graça, uma coisa que parece uma boa interface de integração: uma
sequência ordenada e completa de tudo que aconteceu. Publicá-la é tentador e quase não custa
trabalho.

O custo aparece depois. O log interno reflete o modelo de domínio do serviço — inclusive as
partes que existem por conveniência de implementação, e que mudariam numa refatoração
qualquer. Quando ele é público, cada uma dessas partes vira compromisso com terceiros que o
dono do serviço não conhece.

## Conceitos Centrais

### O que o canônico já estabelece

Três pontos vêm de [event sourcing](/03-design-patterns/event-sourcing.md) e valem aqui sem
alteração: o log é imutável e permanente, o que faz do formato de evento um compromisso de
anos; snapshot é obrigatório na prática, porque reproduzir dez anos para uma consulta é
inviável; e a leitura acontece sobre projeções, o que traz
[CQRS distribuído](/06-distributed-systems/distributed-cqrs.md) e
[consistência eventual](/06-distributed-systems/eventual-consistency.md) junto.

Duas ressalvas que só aparecem quando há mais de um serviço:

**O snapshot é de quem reproduz, não do log.** Cada consumidor mantém o seu, na sua versão
de modelo. Um snapshot publicado junto com o log é mais um formato a versionar — e ele
carrega o modelo interno inteiro, não a parte que o outro precisa.

**Reprocessar não é operação local.** Reconstruir uma projeção que vive em outro serviço
significa relê-lo do começo enquanto ele continua atendendo, e a projeção precisa ser pura:
se a reprodução dispara efeito colateral — e-mail, chamada externa —, ela o dispara de novo,
agora em nome de eventos de anos atrás. O canônico trata a pureza; o que muda aqui é que
quem reprocessa e quem sofre o efeito podem ser times diferentes.

### Distribuído acrescenta acoplamento

Quando outros serviços consomem o log diretamente, o esquema de eventos vira
contrato público entre serviços.

Isso é acoplamento forte disfarçado: mudar a estrutura interna de eventos de um
serviço afeta todos os que os consomem.

A alternativa que preserva a autonomia: manter o log de eventos **interno** ao
serviço e publicar eventos de integração — uma tradução estável e versionada do que
o resto precisa saber.

O que a separação compra é concreto: com ela, renomear um campo, dividir um evento em dois
ou corrigir a modelagem de um agregado são mudanças internas, e o tradutor absorve. Sem ela,
cada uma dessas é uma negociação com todos os consumidores — e como eles não têm razão para
migrar no seu prazo, o esquema interno congela no formato que tinha quando o primeiro
consumidor apareceu.

O sinal de que a fronteira foi perdida não é um incidente: é uma conversa. Alguém propõe
mudar a estrutura de um evento e a resposta é "não dá, o serviço X depende disso".

### O custo de armazenamento e privacidade

O log só cresce. Isso é gerenciável em custo, e delicado em privacidade — mas a formulação
comum ("regulação manda apagar, log é imutável") é grosseira demais para decidir alguma
coisa, e vale separar dois tipos de dado.

O **fato de negócio** em geral não pode ser apagado: onde há obrigação legal de retenção, o
direito ao apagamento cede a ela — é o caso de lançamento contábil e de movimentação
financeira. Num núcleo de contas, apagar a transação não é só difícil, é proibido.

O **dado pessoal identificador** é que precisa sair. E para ele há mecanismo: criptografia
por titular com descarte da chave, ou manter o identificável fora do log, referenciado por
pseudônimo. Os dois funcionam, e os dois precisam ser projetados desde o início — acrescentar
depois exige reescrever o histórico, que é justamente o que o padrão não permite.

A conclusão prática, então, é mais estreita: o conflito reprova a adoção quando há dado
pessoal dentro do agregado, **sem** base legal de retenção e **sem** mecanismo de descarte
projetado. Fora dessas três condições juntas, é custo a planejar, não impedimento.

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

As condições para não adotar event sourcing **em si** estão no
[canônico](/03-design-patterns/event-sourcing.md). O que segue é sobre a decisão própria
deste documento: expor o log.

**Compartilhando o log interno entre serviços — em qualquer número.** Não há limiar
tolerável: o primeiro consumidor externo já congela o esquema, porque a partir dele mudar
a estrutura passa a exigir coordenação. Com dois ou três, a coordenação é uma reunião; com
dez, é um projeto; e o que quebra é sempre a mesma coisa — a mudança que parecia interna.

**Quando o consumidor precisa de um recorte, e não do fluxo.** Se o outro serviço quer
"o saldo atual" ou "os pedidos deste cliente", dar o log a ele é entregar o problema de
derivar estado junto com o dado. O que ele precisa é de uma consulta ou de uma projeção
mantida por quem é dono — não de reimplementar a redução dos eventos, com a chance de
divergir do original.

**Quando não há como versionar o que se publica.** Publicar sem versão explícita no evento
significa que a primeira mudança de forma quebra alguém em silêncio, e a descoberta é pelo
suporte.

## Alternativas

As alternativas a *usar event sourcing como forma de persistir* estão no
[canônico](/03-design-patterns/event-sourcing.md). Estas são as alternativas a **expor o
log**:

- **Log interno mais eventos de integração** — a resposta padrão. Uma tradução estável e
  versionada do que o resto precisa saber, mantida por quem é dono do domínio.
- **Publicação por caixa de saída transacional** — grava o evento de integração na mesma
  transação do fato, e um processo à parte o publica. Ver
  [transações distribuídas](/06-distributed-systems/distributed-transactions.md).
- **Projeção mantida pelo dono, exposta como consulta** — quando o consumidor quer estado, e
  não a sequência que produziu o estado.
- **Captura de mudanças na saída, não no log** — publicar o que mudou na projeção pública,
  deixando o log de domínio fora do alcance.

A primeira merece ênfase porque é a que preserva as duas coisas: o serviço mantém liberdade
de refatorar o interno, e o consumidor recebe um contrato que alguém se comprometeu a
manter.

## Trade-offs

| Event sourcing | Estado atual |
|---|---|
| Histórico completo | Só o presente |
| Novas projeções sobre o passado | Só o que foi previsto |
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

**Não separar evento interno de evento de integração.** É o erro próprio deste documento.
A decisão parece economia — um formato em vez de dois, sem tradutor a manter —, e a
consequência chega meses depois, na forma de uma refatoração que não pode ser feita. Para o
consumidor, aparece pior ainda: o evento muda de forma sem aviso, porque do outro lado
ninguém sabia que aquilo era contrato.

**Confundir com "publicar eventos".** Publicar eventos não é event sourcing; event
sourcing é derivar o estado deles.

A última confusão é frequente e leva times a acreditar que já fazem event sourcing
quando fazem [comunicação por eventos](/06-distributed-systems/event-driven-systems.md).

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

- [CQRS Distribuído](/06-distributed-systems/distributed-cqrs.md) — que vem junto.
- [Sistemas Orientados a Eventos](/06-distributed-systems/event-driven-systems.md) — não é a mesma coisa.
- [Consistência Eventual](/06-distributed-systems/eventual-consistency.md) — entre escrita e projeção.
- [Ordenação](/06-distributed-systems/ordering.md) — o log depende dela.

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
