---
id: failure-detection
title: Detecção de Falha
sidebar_position: 35
description: Decidir que um nó caiu — uma heurística, nunca uma certeza.
doc_type: concept
level: 4
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor calibra detecção de falha entendendo o compromisso entre
  detectar rápido e evitar falso positivo.
prerequisites: [network-failure]
related: [leader-election, timeouts, consensus]
canonical_for: [detecção de falha, batimento, suspeita de falha]
content_version: 1
last_reviewed: 2026-08-27
---

# Detecção de Falha

## Visão Geral

Detecção de falha é decidir que um nó parou de funcionar.

A propriedade que define o assunto: **não é possível ter certeza.** Um nó que não
responde pode estar morto, lento, ou do outro lado de uma partição — e essas três
situações são indistinguíveis de fora.

Por isso detectores de falha são heurísticas, e projetá-los é calibrar um
compromisso.

## Problema

Sistemas precisam saber quem está vivo: para rotear tráfego, para eleger líder,
para redistribuir trabalho, para decidir se uma réplica ainda conta.

A única evidência disponível é ausência de resposta dentro de um prazo. E ausência
de resposta é o [silêncio](network-failure.md) — que é compatível com tudo.

Isso produz dois erros possíveis, e eles são opostos:

**Falso positivo.** Declarar morto um nó saudável e lento. O trabalho dele é
redistribuído desnecessariamente, e ele pode continuar operando — o que produz
[cérebro dividido](leader-election.md).

**Falso negativo.** Continuar enviando tráfego para um nó morto. Requisições
falham até a detecção acontecer.

Não há calibração que elimine os dois. Reduzir um aumenta o outro.

## Conceitos Centrais

### O compromisso central

| Detecção | Falso positivo | Tempo de recuperação |
|---|---|---|
| Agressiva (segundos) | Frequente | Curto |
| Conservadora (dezenas de segundos) | Raro | Longo |

Detecção agressiva num sistema com pausas de coleta de lixo ou variabilidade de
rede produz instabilidade: nós sendo removidos e readmitidos repetidamente,
disparando rebalanceamento a cada vez.

Detecção conservadora significa que uma falha real leva mais tempo para ser
tratada — e durante esse tempo, requisições vão para um nó morto.

A calibração razoável para sistemas de negócio costuma ficar na ordem de segundos,
e depende de quão ruidoso é o ambiente.

### Batimento e suspeita

O mecanismo básico: cada nó envia um sinal periódico. A ausência de N sinais
consecutivos gera suspeita.

Duas melhorias que valem:

**Detecção adaptativa.** Em vez de prazo fixo, ajustar com base no histórico de
chegada dos batimentos. Um nó cuja rede é consistentemente mais lenta ganha mais
tolerância.

**Suspeita graduada.** Em vez de vivo ou morto, um nível de suspeita que cresce
com o tempo sem resposta. Quem consome a informação decide o limiar conforme a
criticidade da ação — remover de balanceamento pode usar limiar baixo; disparar
eleição, alto.

A segunda é a abordagem dos detectores acruais, e é mais robusta que o binário.

### Detecção indireta

Um nó pode não alcançar outro por problema no caminho, não no destino.

Detecção indireta pede a um terceiro que verifique: "eu não alcanço C — você
alcança?"

Isso distingue partição parcial de falha real, e reduz falsos positivos causados
por problemas de rede localizados. É o mecanismo central de protocolos de
disseminação como SWIM.

### Detecção não impede o dano

Mesmo com detecção perfeita, existe a janela entre a falha e a detecção. Durante
ela, requisições falham.

E mesmo depois de detectar, o nó suspeito pode voltar sem saber que foi removido —
razão pela qual [fencing](leader-election.md) é necessário e detecção não basta.

**Detecção reduz a janela; ela não elimina a necessidade de tolerar o erro.**

### Falha lenta é o caso difícil

Um nó que responde ao batimento e processa devagar passa em qualquer detector
baseado em vivacidade.

Detectar degradação exige medir **latência e taxa de erro**, não apenas presença.
Ver [falha de rede](network-failure.md).

Isso é o que torna verificação de saúde binária insuficiente, e por que
balanceadores modernos consideram latência ao distribuir.

## Modelo Mental

**Detecção de falha responde "provavelmente caiu", nunca "caiu".** Todo mecanismo
construído sobre ela precisa tolerar que a resposta esteja errada.

## Quando Usar

- Remover instâncias de balanceamento.
- Disparar failover de líder ou de réplica.
- Redistribuir trabalho de um nó.
- Alertar operação.

Cada uso admite um limiar diferente, e usar o mesmo para todos é o erro comum.

## Quando Não Usar

**Como verdade.** A resposta é probabilística.

**Detecção agressiva para ações caras.** Disparar eleição por uma lentidão de dois
segundos produz instabilidade.

**Detecção binária para degradação.** Não captura nó lento.

**Sem fencing, para proteger recurso.** A detecção pode errar, e o fencing é a
defesa que não depende dela.

**Prazo uniforme para nós com condições diferentes.** Um nó em outra região tem
latência maior por natureza.

## Alternativas

- **Detecção adaptativa** — prazo baseado no histórico observado.
- **Suspeita graduada** — nível em vez de binário.
- **Detecção indireta** — perguntar a terceiros.
- **Circuit breaker** — em vez de decidir se o nó está vivo, decidir se vale
  continuar chamando. Ver
  [confiabilidade](../12-reliability/index.md).

A última muda a pergunta de forma útil: em vez de "ele está vivo?", "as chamadas
estão funcionando?" — que é o que de fato importa e é diretamente observável.

## Trade-offs

O parâmetro que governa tudo é o intervalo até declarar um nó morto. Encurtá-lo
acelera a recuperação e aumenta os falsos positivos; alongá-lo faz o oposto. Não
existe valor universalmente correto — ele depende de quanto custa cada erro no seu
sistema.

| Detecção rápida | Detecção lenta |
|---|---|
| Recuperação rápida | Demorada |
| Falsos positivos frequentes | Raros |
| Rebalanceamento frequente | Estável |
| Risco de cérebro dividido maior | Menor |
| Sensível a oscilação de rede | Tolerante |
| Custo de sondagem maior | Menor |

A escolha depende do custo relativo dos dois erros. Onde declarar um nó vivo como
morto provoca perda de dados ou escrita dupla, a detecção lenta é a escolha
conservadora. Onde a indisponibilidade custa mais que um rebalanceamento
desnecessário, a rápida se paga.

| Sondagem ativa | Sinal de vida |
|---|---|
| O observador controla o ritmo | O observado controla |
| Detecta nó travado que ainda responde | Só detecta ausência |
| Custo proporcional ao número de observadores | Ao número de nós |
| Verificação pode exercitar dependências | Não exercita |

## Modos de Falha

**Instabilidade.** Nó removido e readmitido repetidamente, com rebalanceamento a
cada ciclo.

**Cérebro dividido.** Falso positivo em eleição de líder.

**Nó lento não detectado.** Continua recebendo tráfego e degradando o sistema.

**Detecção em cascata.** Uma lentidão generalizada faz todos os nós suspeitarem uns
dos outros.

**Verificação de saúde profunda derrubando tudo.** Quando ela depende de uma
dependência comum. Ver
[balanceamento de carga](../05-system-design/load-balancing.md).

## Erros Comuns

**Usar o mesmo limiar para todas as ações.**

**Detecção binária, sem medir latência.**

**Prazo curto demais em ambiente com pausas de coleta de lixo.**

**Confiar na detecção sem fencing.**

**Não medir a taxa de falsos positivos.** Se nós são removidos e voltam com
frequência, a calibração está errada e ninguém percebeu.

## Exemplo Real

Um cluster de processamento com 40 nós usava batimento a cada segundo, com
suspeita após 3 ausências — detecção em 3 segundos.

O trabalho era redistribuído ao detectar falha.

O sistema apresentava instabilidade recorrente: várias vezes ao dia, nós eram
removidos e readmitidos em segundos, disparando redistribuição do trabalho deles.

A causa: pausas de coleta de lixo de 3 a 5 segundos, normais para a carga de
memória daquele processo.

Cada falso positivo custava mais que a falha que ele deveria tratar — a
redistribuição movia estado, e o nó voltava logo depois, exigindo mover de novo.

Três correções.

**Limiar por ação.** Remover do balanceamento passou a usar 3 segundos —
barato de reverter. Redistribuir trabalho passou a usar 15 segundos — caro, exige
mais certeza.

**Detecção indireta.** Antes de declarar suspeito, o nó pergunta a três outros se
eles alcançam. Isso eliminou os falsos positivos causados por congestionamento
localizado.

**Ajuste da coleta de lixo** para reduzir as pausas longas — tratando a causa, não
só o sintoma.

A instabilidade desapareceu. E a detecção de falha real continuou acontecendo em
15 segundos, o que era perfeitamente aceitável para aquele sistema.

Na retrospectiva: o problema não era o detector estar errado — ele estava
detectando corretamente que o nó não respondia. O problema era **usar a mesma
resposta para uma pausa de 4 segundos e para uma máquina morta**.

## Conceitos Relacionados

- [Falha de Rede](network-failure.md) — por que o silêncio é ambíguo.
- [Eleição de Líder](leader-election.md) — o consumidor mais crítico da detecção.
- [Timeouts](timeouts.md) — o mecanismo básico.
- [Consenso](consensus.md).

## Exercício Prático

No seu sistema, descubra o prazo de detecção de falha e compare com a duração das
pausas de coleta de lixo do percentil 99.

Se o prazo for menor, você tem falsos positivos — e vale medir com que frequência
instâncias são removidas e readmitidas.

## Perguntas de Entrevista

- Por que detecção de falha é sempre heurística?
- Qual o compromisso entre detecção rápida e lenta?
- Por que usar o mesmo limiar para todas as ações é problemático?

## Para Aprofundar

- Chandra, Tushar; Toueg, Sam. *Unreliable Failure Detectors for Reliable
  Distributed Systems*. JACM, 1996.
- Das, Abhinandan et al. *SWIM: Scalable Weakly-consistent Infection-style Process
  Group Membership Protocol*, 2002.
- Hayashibara, Naohiro et al. *The φ Accrual Failure Detector*, 2004.
