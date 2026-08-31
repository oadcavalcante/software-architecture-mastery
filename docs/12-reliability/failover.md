---
id: failover
title: Failover
sidebar_position: 6
description: Trocar para a cópia reserva — o momento mais arriscado da vida de um sistema redundante.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor projeta failover exercitado, com critério de acionamento e
  tratamento de cérebro dividido.
prerequisites: [redundancy]
related: [redundancy, chaos-engineering, disaster-recovery-planning]
canonical_for: [failover, promoção de réplica, retorno ao primário, acionamento automático]
content_version: 1
last_reviewed: 2026-08-28
---

# Failover

## Visão Geral

Failover é a troca do componente principal para uma cópia reserva quando o principal
falha.

É o que transforma [redundância](/12-reliability/redundancy.md) de diagrama em disponibilidade real. E
é o momento mais arriscado da vida de um sistema redundante: um failover mal executado
causa mais dano que a falha original.

A frase que resume o problema desta área: **um failover que nunca foi exercitado não é
um plano, é uma esperança.**

## Problema

O caminho de failover é, por definição, raro. Ele é escrito uma vez, documentado, e
raramente executado.

Quando é acionado, descobre-se que:

A cota na região secundária não permite subir a capacidade. A configuração divergiu ao
longo do ano. Um certificado expirou porque ninguém monitorava o que não era usado. O
procedimento tem catorze passos e cinco estão desatualizados. A pessoa de sobreaviso
nunca o executou.

Nada disso é hipotético — é a lista recorrente dos post-mortems dessa categoria.

## Conceitos Centrais

### Automático ou manual

```text
automático  rápido, sem espera por decisão
            risco de acionar em falso positivo
manual      decisão humana, sem acionamento indevido
            minutos ou horas de latência, dependente de disponibilidade da pessoa
```

A escolha depende do custo relativo dos dois erros: acionar sem necessidade contra
demorar a acionar.

Para componentes sem estado, automático é claramente melhor — o custo de um
acionamento indevido é baixo.

Para bancos de dados com replicação assíncrona, o cálculo muda: um failover indevido
pode perder escritas e criar divergência. Muitos times mantêm manual por isso, e o
preço é o tempo de resposta humana.

O meio-termo comum: automático com histerese — exigir falha sustentada por um período,
não um pico instantâneo. Ver
[detecção de falhas](/06-distributed-systems/failure-detection.md).

### Cérebro dividido é o pior resultado

Duas cópias se consideram principais. Ambas aceitam escrita. Os dados divergem, e a
reconciliação é manual e imperfeita.

Isso é pior que indisponibilidade: indisponibilidade se resolve; divergência de dados
pode não se resolver.

Os mecanismos que impedem:

**Maioria.** Só assume quem tem o voto da maioria dos nós. Por isso três, não dois. Ver
[consenso](/06-distributed-systems/consensus.md).

**Isolamento do antigo.** O primário anterior é impedido de aceitar escrita — por
revogação de credencial, por regra de rede, ou por desligamento.

**Marca de geração.** Escritas carregam um número de geração; o armazenamento recusa as
de geração antiga.

Um failover sem nenhum desses mecanismos vai produzir cérebro dividido eventualmente.

### O que se perde na promoção

Com replicação assíncrona, o que o primário confirmou e não replicou se perde.

```text
atraso de replicação de 2s no momento da falha
  → até 2 segundos de escritas confirmadas ao usuário, perdidas
```

Isso precisa ser conhecido e aceito. Ver [RPO](/12-reliability/rpo.md).

E precisa ser comunicado: transações confirmadas ao usuário que deixaram de existir
geram um problema de negócio, não apenas técnico.

### Retornar ao primário é outro failover

Depois que o componente original volta, retornar a ele é uma operação de risco
equivalente.

O erro característico: tratar o retorno como "voltar ao normal" e executá-lo sem o
mesmo cuidado — durante o horário de pico, sem janela, sem verificar que o antigo
primário está de fato consistente.

Muitos incidentes de failover têm duas partes, e a segunda é o retorno.

Uma decisão que simplifica: **não retornar**. Se as cópias são equivalentes, a que
assumiu permanece como principal, e a antiga vira reserva. Isso elimina metade do
risco.

### Dependências precisam acompanhar

Promover o banco não basta se a aplicação continua apontando para o antigo.

O failover completo envolve: descoberta de serviço, cadeias de conexão, DNS com tempo
de vida curto, filas, agendadores, e sistemas externos que apontam para o endereço
antigo.

O item de DNS merece nota: um tempo de vida de uma hora significa que clientes
continuarão indo ao endereço antigo por até uma hora depois da troca.

Inventariar tudo que aponta para o componente é parte do desenho, e é o que costuma
faltar.

### Exercitar é a única verificação que vale

Ver [engenharia do caos](/12-reliability/chaos-engineering.md). O failover precisa ser executado
periodicamente, em produção, em janela controlada.

A primeira execução encontra problemas. A terceira ou quarta, geralmente não. E o tempo
de execução cai substancialmente com a prática — porque o procedimento fica correto e
as pessoas ficam confortáveis.

Um failover exercitado mensalmente é uma operação de rotina. Um exercitado nunca é um
incidente dentro de um incidente.

## Modelo Mental

**Failover é um procedimento, não uma configuração.** Ele funciona se for executado
regularmente, e falha se for só documentado.

## Quando Usar

- Existe redundância com cópia reserva.
- A indisponibilidade tem custo que justifica a complexidade.
- Há requisito de tempo de recuperação. Ver [RTO](/12-reliability/rto.md).
- Manutenção precisa acontecer sem parada.

## Quando Não Usar

**Sem exercitar.**

**Automático sem mecanismo contra cérebro dividido.**

**Automático para banco com replicação assíncrona**, sem aceitar a perda.

**Sem inventariar o que aponta para o componente.**

**Retornar ao primário sem o mesmo cuidado.**

**Quando recuperar o original é mais rápido** que trocar.

## Alternativas

- **Ativo-ativo** — sem troca a executar; o caminho de recuperação é o normal. Ver
  [redundância](/12-reliability/redundancy.md).
- **Recuperação rápida** — reiniciar ou recriar o componente, em vez de trocar.
- **[Degradação graciosa](/12-reliability/graceful-degradation.md)** — operar sem o componente.
- **Failover manual com procedimento ensaiado** — mais lento e mais previsível.

## Trade-offs

| Automático | Manual |
|---|---|
| Segundos | Minutos a horas |
| Risco de falso positivo | Sem acionamento indevido |
| Sem dependência humana | Depende de sobreaviso |
| Exige proteção contra cérebro dividido | Decisão humana filtra |

| Retornar | Permanecer |
|---|---|
| Volta à topologia planejada | Assimetria aceita |
| Segundo risco | Um risco a menos |
| Cópias podem ser desiguais | Exige equivalência |

## Modos de Falha

**Cérebro dividido.**

**Cota insuficiente na reserva.**

**Configuração divergente.**

**Certificado expirado na reserva.** Nunca usado, nunca monitorado.

**Perda de escritas na promoção.**

**Dependências apontando para o antigo.**

**Procedimento desatualizado.**

**Falso positivo.** Failover acionado por uma oscilação de rede.

## Erros Comuns

**Não exercitar.**

**Duas cópias em vez de três**, impedindo maioria.

**Não isolar o primário antigo.**

**Não monitorar a saúde da reserva.**

**DNS com tempo de vida longo.**

**Tratar o retorno como operação trivial.**

## Exemplo Real

Uma instituição financeira tinha failover automatizado de banco entre duas zonas,
documentado e nunca exercitado em três anos.

Numa falha real da zona primária, o failover foi acionado automaticamente e produziu o
pior resultado possível.

A sequência:

**Promoção bem-sucedida.** A réplica assumiu em 25 segundos.

**Aplicações não reconectaram.** As instâncias mantinham conexões para o endereço
antigo e não tinham lógica de reconexão. Foi preciso reiniciá-las manualmente: 12
minutos.

**Primário antigo voltou.** A zona se recuperou parcialmente, e o banco original
voltou a aceitar conexões — ainda se considerando primário. Não havia mecanismo de
isolamento.

**Cérebro dividido por 40 minutos.** Parte das aplicações, reiniciadas antes, apontava
para o novo primário; parte, para o antigo. Ambos aceitaram escrita.

**Divergência de dados.** 1.400 transações precisaram ser reconciliadas manualmente ao
longo de três dias. Dezenove não puderam ser resolvidas com certeza.

A reformulação:

**Três nós, com maioria.** A promoção passou a exigir quórum, impedindo que o antigo
primário se reconsidere principal.

**Isolamento por revogação.** A credencial do primário antigo é revogada na promoção,
antes de qualquer outra coisa.

**Reconexão automática** nas aplicações, com descoberta de serviço em vez de endereço
fixo.

**Exercício mensal**, em produção, em janela de baixo movimento. O primeiro levou 18
minutos e encontrou quatro problemas; o sexto levou 40 segundos e não encontrou
nenhum.

**Não retornar.** A cópia que assume permanece como primária. As três são equivalentes
e a assimetria deixou de existir.

O que a equipe registra: o mecanismo automático funcionou perfeitamente — promoveu em
25 segundos, como projetado. Tudo o mais em volta dele falhou, e nada disso era sobre
o banco.

## Conceitos Relacionados

- [Redundância](/12-reliability/redundancy.md) — o pré-requisito.
- [Engenharia do Caos](/12-reliability/chaos-engineering.md) — o exercício.
- [Eleição de Líder](/06-distributed-systems/leader-election.md) — o cérebro
  dividido.
- [RPO](/12-reliability/rpo.md) — o que se perde.

## Exercício Prático

Descubra quando o failover do seu componente mais crítico foi exercitado pela última
vez.

Se a resposta for "nunca", agende um — e reserve o dobro do tempo que você imagina que
vai levar.

## Perguntas de Entrevista

- Por que cérebro dividido é pior que indisponibilidade?
- Por que o retorno ao primário é um segundo risco?
- O que precisa acompanhar a promoção, além do componente em si?

## Para Aprofundar

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 —
  capítulo 5.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
- Nygard, Michael. *Release It!*. 2ª ed. Pragmatic Bookshelf, 2018.
