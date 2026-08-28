---
id: chaos-engineering
title: Engenharia do Caos
sidebar_position: 17
description: Provocar falhas de propósito para descobrir o que não funciona — antes que ele descubra sozinho.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor conduz experimentos de falha com hipótese, escopo limitado e
  critério de interrupção.
prerequisites: [reliability]
related: [graceful-degradation, failover, redundancy]
canonical_for: [engenharia do caos, experimento de falha, hipótese de estado estável, raio de alcance]
content_version: 1
last_reviewed: 2026-08-28
---

# Engenharia do Caos

## Visão Geral

Engenharia do caos é provocar falhas deliberadamente, em ambiente controlado, para
verificar se o sistema se comporta como se espera.

Ela não é "quebrar coisas ao acaso". É um método com **hipótese**, **escopo limitado**
e **critério de interrupção** — mais próximo de um experimento científico que de
sabotagem.

A premissa que a justifica: mecanismos de tolerância a falha que nunca foram
exercitados provavelmente não funcionam. E o momento de descobrir isso não é durante o
incidente.

## Problema

Todo sistema tem mecanismos de proteção: circuit breaker, degradação, failover,
retentativa, redundância.

Eles são escritos uma vez, testados no caminho feliz, e nunca executados de verdade —
porque a condição que os aciona é rara.

Quando a condição chega, descobre-se que o comportamento de reserva tem formato errado,
que o failover não tem cota na região secundária, que a degradação nunca foi testada
com a interface atual.

O código existe. O comportamento, não.

## Conceitos Centrais

### O método

```text
1. defina o estado estável   uma métrica de negócio, não de recurso
2. formule a hipótese         "ao derrubar X, o estado estável se mantém"
3. limite o alcance           menor população que produz sinal
4. defina a interrupção       quando abortar
5. execute e observe
6. registre o que se aprendeu
```

O passo 1 é o que separa o método de brincadeira. O estado estável precisa ser uma
métrica que importa — pedidos por minuto, taxa de sucesso de checkout —, não CPU ou
número de instâncias.

O passo 2 é o que torna o resultado útil: uma hipótese refutada ensina algo específico.
Sem hipótese, o experimento produz "aconteceu isso" em vez de "descobrimos que".

### Comece pequeno e em ambiente seguro

A progressão que funciona:

```text
1. ambiente de teste, com carga sintética
2. produção, fora do horário de pico, alcance mínimo
3. produção, horário normal, alcance limitado
4. produção, com escala crescente
```

Pular direto para produção sem ter exercitado antes é como fazer o primeiro teste de
recuperação durante o incidente — só que voluntariamente.

E o ambiente de teste tem limite conhecido: ele não reproduz a carga, os dados nem as
dependências reais. Os achados mais valiosos aparecem em produção.

### Os experimentos que rendem mais

Em ordem de retorno observado na prática:

```text
matar uma instância            verifica ausência de estado e desligamento gracioso
adicionar latência             verifica timeout, circuit breaker, degradação
tornar uma dependência indisponível  verifica comportamento de reserva
esgotar um recurso             verifica bulkhead
derrubar uma zona              verifica capacidade de absorção
failover de banco              verifica o procedimento
expirar certificado            verifica monitoramento
```

**Adicionar latência é o mais revelador**, e o menos usado. Dependências raramente caem
— elas ficam lentas —, e é esse cenário que os mecanismos de proteção costumam não
cobrir. Ver [circuit breakers](circuit-breakers.md).

### Raio de alcance limitado não é opcional

Um experimento que pode afetar todos os usuários não é um experimento — é um incidente
provocado.

As formas de limitar:

```text
por fração de tráfego      1% das requisições
por instância              uma de vinte
por cliente                apenas contas internas
por região                 a de menor volume
por janela                 fora do pico
```

E o critério de interrupção precisa ser automático quando possível: se a métrica de
estado estável cair além de um limiar, o experimento para sozinho.

Um experimento que depende de alguém observar e reagir manualmente é um experimento que
vai causar dano no dia em que a pessoa se distrair.

### Pré-requisitos que precedem o primeiro experimento

Fazer caos sem eles é irresponsável:

**Observabilidade.** Se você não consegue ver o efeito, o experimento não ensina nada e
o dano pode passar despercebido. Ver
[observabilidade](../13-observability/index.md).

**Capacidade de reverter.** Desligar o experimento precisa ser imediato.

**Comunicação.** As pessoas de sobreaviso precisam saber que é experimento, ou vão
tratar como incidente.

**Um alvo de confiabilidade.** Sem [SLO](slo.md), não há critério para dizer se o
resultado foi aceitável.

### Não é só ferramenta

Existem ferramentas que injetam falha, e elas são a parte fácil.

A parte que dá resultado é o processo: definir hipóteses, priorizar experimentos,
registrar achados, transformar achados em correções, e repetir.

Times que compram a ferramenta e não estabelecem o processo rodam alguns experimentos
espetaculares e param.

E o formato mais barato de começar não usa ferramenta nenhuma: **exercícios de mesa**,
onde a equipe discute "o que aconteceria se X falhasse agora?". Eles encontram lacunas
de conhecimento e de procedimento antes de qualquer injeção de falha.

### Automatizar o que já foi verificado

Um experimento que passou uma vez não garante que continua passando — o sistema muda.

Experimentos que se mostraram valiosos devem virar rotina: execução periódica,
automática, com alerta se o resultado mudar.

É a diferença entre "verificamos uma vez" e "verificamos continuamente".

## Modelo Mental

**O que não é exercitado não funciona.** Engenharia do caos é a verificação de que os
mecanismos de proteção existem de fato.

## Quando Usar

- Existem mecanismos de tolerância a falha não exercitados.
- O sistema é distribuído, com muitas dependências.
- Há requisito de disponibilidade a sustentar.
- Após incidentes, para verificar as correções.
- Antes de eventos de alto volume.
- Periodicamente, para o que já foi verificado.

## Quando Não Usar

**Sem observabilidade.**

**Sem capacidade de interromper rapidamente.**

**Sem hipótese.** Vira quebra aleatória.

**Sem limitar o alcance.**

**Sem avisar quem está de sobreaviso.**

**Quando o sistema já é instável.** Corrija o que já falha sozinho antes de provocar
mais.

**Como substituto de corrigir problemas conhecidos.**

## Alternativas

- **Exercícios de mesa** — discutir cenários sem provocar. Barato, e encontra lacunas
  de procedimento.
- **Simulações de incidente** — ensaiar a resposta, com falha simulada.
- **Testes de recuperação agendados** — exercitar failover e restauração
  periodicamente. Ver [failover](failover.md).
- **Testes de carga com falha** — combinar sobrecarga e indisponibilidade.

A primeira é o ponto de partida certo para quem nunca fez: ela custa uma reunião e
costuma encontrar mais do que o esperado.

## Trade-offs

| Com engenharia do caos | Sem |
|---|---|
| Falhas descobertas em janela controlada | Durante o incidente |
| Risco deliberado | Risco desconhecido |
| Investimento em processo | Nenhum |
| Confiança verificada | Presumida |

| Em produção | Em teste |
|---|---|
| Achados reais | Ambiente artificial |
| Risco real | Sem risco |
| Exige maturidade | Ponto de partida |

## Modos de Falha

**Experimento vira incidente.** Alcance mal limitado.

**Sem sinal.** Observabilidade insuficiente para ver o efeito.

**Achado sem correção.** Descobre-se o problema e nada muda.

**Executado uma vez.** O sistema evolui e a verificação envelhece.

**Sobreaviso acionado desnecessariamente.** Falta de comunicação.

**Falsa confiança.** Experimentos superficiais que sempre passam.

**Caos em sistema já instável.** Ruído indistinguível dos problemas reais.

## Erros Comuns

**Começar por produção.**

**Não formular hipótese.**

**Não limitar o alcance.**

**Não injetar latência**, só indisponibilidade.

**Não transformar achados em tarefas.**

**Comprar ferramenta sem estabelecer processo.**

## Exemplo Real

Uma plataforma de saúde tinha investido dois anos em confiabilidade: circuit breakers,
degradação, redundância em três zonas, failover automatizado de banco.

O primeiro programa de engenharia do caos começou com exercícios de mesa. Três reuniões
de duas horas, discutindo cenários, já produziram achados:

**Ninguém sabia executar o failover de banco manualmente.** O procedimento era
automatizado; a versão manual estava desatualizada e a pessoa que a escrevera tinha
saído.

**Não havia clareza sobre o que degradar** durante sobrecarga. Cada pessoa na sala deu
uma resposta diferente.

Depois disso, os experimentos, em ordem:

**Matar instância, em teste.** Passou.

**Matar instância, em produção, uma de doze.** Falhou: requisições em andamento eram
perdidas. O desligamento gracioso não estava configurado. Ver
[ausência de estado](../11-scalability/statelessness.md).

**Injetar 3 segundos de latência no serviço de prontuários, 1% do tráfego.** Falhou de
forma reveladora: o circuit breaker não abriu, porque contava apenas erro — e o serviço
respondia com sucesso, devagar. As requisições se acumularam. Ver
[circuit breakers](circuit-breakers.md).

Esse foi o achado mais valioso do programa, e o cenário mais provável de acontecer
sozinho.

**Tornar o serviço de agendamento indisponível, 5% do tráfego.** A degradação
funcionou, e a mensagem exibida ao usuário estava em inglês — um texto padrão nunca
traduzido, porque nunca tinha sido exibido.

**Derrubar uma zona, fora do pico.** Falhou: as duas zonas restantes operavam a 75% e
não absorveram. Ver [redundância](redundancy.md).

**Failover de banco, em janela programada.** Funcionou em 40 segundos — e revelou que a
aplicação não reconectava automaticamente, exigindo reinício das instâncias.

Seis experimentos, cinco falhas. Todas em mecanismos que a equipe acreditava
funcionarem.

Depois das correções, os experimentos viraram rotina automatizada: matar instância
semanalmente, injetar latência quinzenalmente, derrubar zona mensalmente, failover de
banco trimestralmente.

Nos dez meses seguintes, dois incidentes reais ocorreram nas condições exercitadas.
Ambos foram absorvidos sem indisponibilidade.

O que a equipe aprendeu: os dois anos de investimento em confiabilidade tinham
produzido mecanismos que, na maioria, não funcionavam. Não por incompetência — por
nunca terem sido executados.

## Conceitos Relacionados

- [Degradação Graciosa](graceful-degradation.md) — o que se verifica.
- [Failover](failover.md) — o exercício mais valioso.
- [Redundância](redundancy.md) — a capacidade de absorção.
- [Observabilidade](../13-observability/index.md) — o pré-requisito.

## Exercício Prático

Reúna a equipe por uma hora e discuta: o que acontece se o serviço X ficar 5 segundos
mais lento agora?

Se houver mais de uma resposta na sala, você encontrou o primeiro experimento a
executar — e provavelmente o primeiro achado.

## Perguntas de Entrevista

- Por que hipótese e estado estável são o que separa o método de quebra aleatória?
- Por que injetar latência é mais revelador que injetar indisponibilidade?
- Quais pré-requisitos precedem o primeiro experimento?

## Para Aprofundar

- Rosenthal, Casey et al. *Chaos Engineering*. O'Reilly, 2020.
- Basiri, Ali et al. *Chaos Engineering*. IEEE Software, 2016.
- Principles of Chaos Engineering — principlesofchaos.org.
