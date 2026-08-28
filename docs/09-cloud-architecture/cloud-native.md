---
id: cloud-native
title: Cloud Native
sidebar_position: 17
description: Um termo que designa algo útil e virou selo — o que ele significa de fato, e o que ele passou a esconder.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor identifica as propriedades concretas que o termo designa, e
  não confunde adotar ferramentas com tê-las.
prerequisites: [containers]
related: [containers, kubernetes, vendor-lock-in]
canonical_for: [cloud native, aplicação nativa de nuvem, migração como está]
content_version: 1
last_reviewed: 2026-08-27
---

# Cloud Native

## Visão Geral

"Cloud native" designa aplicações projetadas para as propriedades da nuvem —
elasticidade, falha rotineira, infraestrutura programável — em vez de aplicações
tradicionais transportadas para lá.

A ideia por trás é útil e concreta. O termo, porém, foi capturado: ele virou selo
para um conjunto de ferramentas, e "somos cloud native" passou a significar "usamos
contêineres e Kubernetes".

Este documento separa as duas coisas, porque adotar as ferramentas sem as
propriedades é comum e caro.

## Problema

Uma aplicação escrita para um servidor físico assume coisas que a nuvem não garante:
que o processo vive indefinidamente, que o disco local persiste, que o endereço IP
é estável, que a configuração está num arquivo.

Levá-la para a nuvem sem mudar essas suposições produz um sistema que roda e não
aproveita nada: não escala, não sobrevive à substituição de instância, e continua
exigindo a mesma operação manual.

É a migração "como está" — legítima como primeiro passo, problemática como destino.

## Conceitos Centrais

### As propriedades, sem as ferramentas

O que uma aplicação precisa **ser**, independentemente de qualquer tecnologia:

**Sem estado no processo.** Nada importante em memória entre requisições, nada em
disco local. Ver
[stateless](../05-system-design/stateless-vs-stateful.md).

**Descartável.** Inicia rápido, desliga graciosamente, tolera ser morta a qualquer
momento.

**Configurada pelo ambiente**, não por arquivo empacotado.

**Observável.** Registros na saída padrão, métricas expostas, rastreamento
propagado. Ver [observabilidade](../13-observability/index.md).

**Tolerante a falha de dependência.** Timeout, retentativa,
[backoff](../06-distributed-systems/backoff.md), degradação.

**Escalável horizontalmente.** Adicionar instâncias aumenta a capacidade.

**Idempotente** onde a repetição é possível. Ver
[idempotência](../06-distributed-systems/idempotency.md).

Uma aplicação com essas sete propriedades aproveita a nuvem, rodando em máquina
virtual, contêiner ou serverless. Uma aplicação sem elas não aproveita, mesmo em
Kubernetes.

### O que o termo passou a esconder

A confusão que custa caro: tratar a lista de ferramentas como se fosse a lista de
propriedades.

Contêiner, orquestração, malha de serviço e esteira automatizada são **meios**.
Adotá-los sem as propriedades produz o pior dos dois mundos — a complexidade da
plataforma nova, com as limitações da aplicação antiga.

O sintoma reconhecível: uma aplicação em Kubernetes que não pode ter mais de uma
réplica, porque guarda sessão em memória.

### Migração como está é uma etapa, não um destino

Mover sem mudar é frequentemente a decisão certa: sai-se do datacenter no prazo, o
risco é baixo, e o aprendizado vem depois.

O problema é parar aí. A modernização precisa de plano com prazo, ou ela não
acontece — e o ambiente acumula custo e risco. Ver [IaaS](iaas.md).

Uma sequência que funciona:

```text
1. mover como está          sai do datacenter
2. externalizar estado       sessão, arquivos, configuração
3. tornar descartável        inicialização, desligamento gracioso
4. observabilidade           registros, métricas, rastreamento
5. escalar horizontalmente
6. então, se fizer sentido, contêineres e orquestração
```

O passo 6 no fim é deliberado: ele é o mais visível e o menos importante.

### Nem tudo precisa ser

Um sistema interno usado por vinte pessoas, com carga previsível e sem exigência de
disponibilidade, não ganha nada com essas propriedades.

Aplicar a lista inteira por princípio é a mesma armadilha, do outro lado.

O critério: as propriedades se pagam quando há elasticidade a aproveitar, falha a
tolerar, ou frequência de implantação a sustentar.

## Modelo Mental

**Cloud native é um conjunto de propriedades da aplicação, não de ferramentas na
infraestrutura.** As ferramentas ajudam a exercê-las; elas não as criam.

## Quando Usar

- A carga varia e a elasticidade tem valor.
- A disponibilidade exige tolerar falha de instância.
- A frequência de implantação é alta.
- Vários times precisam evoluir independentemente.
- A aplicação vai viver por anos e crescer.

## Quando Não Usar

**Como selo.** "Somos cloud native" não é uma propriedade verificável.

**Para sistemas internos pequenos e estáveis.**

**Reescrevendo o que funciona** sem problema concreto.

**Adotando ferramentas antes das propriedades.**

**Como justificativa para microsserviços.** São decisões independentes; a primeira
não implica a segunda.

**Migração como está tratada como conclusão.**

## Alternativas

- **Migração como está** — primeiro passo legítimo.
- **Modernização incremental** — aplicar as propriedades por ordem de retorno.
- **Estrangulamento gradual** — substituir partes por versões novas, mantendo o
  legado funcionando. Ver
  [modernização de legado](../16-legacy-modernization/index.md).
- **Manter como está** — quando o sistema é estável e o custo de mudar não se paga.

## Trade-offs

| Com as propriedades | Sem |
|---|---|
| Escala horizontalmente | Verticalmente, com teto |
| Tolera perda de instância | Cai junto |
| Implantação sem interrupção | Com janela |
| Diagnóstico por observabilidade | Por acesso à máquina |
| Trabalho de adaptação | Nenhum |

## Modos de Falha

**Ferramentas sem propriedades.** Kubernetes com uma réplica só.

**Estado em memória impedindo escala.**

**Modernização adiada indefinidamente** após a migração como está.

**Reescrita por princípio**, sem problema a resolver.

**Complexidade adotada sem necessidade.**

**Termo usado como critério de decisão.** "Isso não é cloud native" não é
argumento.

## Erros Comuns

**Confundir ferramentas com propriedades.**

**Parar na migração como está.**

**Adotar orquestração antes de externalizar estado.**

**Aplicar a todos os sistemas indistintamente.**

**Usar o termo em vez de nomear a propriedade concreta.**

## Exemplo Real

Uma seguradora executou um programa de dois anos chamado internamente de
"modernização cloud native". O escopo: mover 40 aplicações para Kubernetes.

Ao fim do programa, as 40 estavam em contêineres, orquestradas, com esteiras
automatizadas. O programa foi declarado concluído.

A avaliação seis meses depois mostrou:

**17 aplicações rodavam com uma réplica só**, porque guardavam sessão em memória.
Escalar horizontalmente as derrubava.

**12 escreviam em disco local** — arquivos temporários, relatórios, uploads. Cada
reinício perdia dados, e a equipe tinha configurado volumes persistentes para
contornar, o que prendia cada pod a um nó.

**9 liam configuração de arquivo empacotado na imagem**, o que exigia reconstruir e
republicar a imagem para mudar um valor. A promoção entre ambientes gerava imagens
diferentes — quebrando a garantia de que o que foi testado é o que roda.

**Nenhuma tinha rastreamento distribuído.** Diagnosticar um problema entre
aplicações continuava sendo correlacionar registros manualmente.

**O tempo de implantação melhorou**, e a frequência não: as aplicações continuavam
sendo implantadas mensalmente, porque o gargalo era o processo de aprovação, não a
tecnologia.

O custo de infraestrutura tinha subido 25%, pela plataforma adicionada.

A segunda fase, reorientada, atacou as propriedades:

**Sessão externalizada** nas 17. Passaram a escalar de verdade.

**Arquivos para armazenamento de objetos** nas 12. Ver
[armazenamento em nuvem](cloud-storage.md).

**Configuração por ambiente** nas 9. A mesma imagem passou a rodar em todos os
ambientes.

**Observabilidade** com rastreamento propagado.

E uma decisão em sentido contrário: **6 aplicações voltaram para máquinas
virtuais**. Eram sistemas internos estáveis, com carga previsível e implantação
trimestral. A orquestração não entregava nada ali e custava operação.

O aprendizado que ficou: o programa media a coisa errada. O indicador era "aplicações
migradas para Kubernetes", e ele chegou a 100% sem que nenhuma propriedade tivesse
sido adquirida.

Se o indicador fosse "aplicações que escalam horizontalmente", o programa teria
terminado em 23 dos 40 — e teria atacado o problema certo desde o início.

## Conceitos Relacionados

- [Contêineres](containers.md) e [Kubernetes](kubernetes.md) — as ferramentas.
- [Dependência de Fornecedor](vendor-lock-in.md).
- [Stateless](../05-system-design/stateless-vs-stateful.md) — a propriedade central.
- [Modernização de Legado](../16-legacy-modernization/index.md).

## Exercício Prático

Pegue a aplicação mais importante do seu sistema e verifique as sete propriedades,
uma a uma.

O número que você obtiver diz mais sobre a maturidade dela na nuvem que qualquer
lista de ferramentas adotadas.

## Perguntas de Entrevista

- Quais propriedades concretas o termo designa?
- Por que adotar orquestração antes de externalizar estado é problemático?
- Por que "migração como está" é etapa legítima e destino ruim?

## Para Aprofundar

- Wiggins, Adam. *The Twelve-Factor App*, 2011.
- Burns, Brendan; Beda, Joe. *Designing Distributed Systems*. O'Reilly, 2018.
- Newman, Sam. *Monolith to Microservices*. O'Reilly, 2019.
