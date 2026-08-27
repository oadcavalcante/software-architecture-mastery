---
id: devops-and-platform
title: DevOps e Plataforma
sidebar_position: 0
description: Como o software chega em produção, e como a plataforma vira produto interno.
doc_type: index
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor escolhe estratégia de implantação a partir do risco
  aceitável e reconhece quando uma plataforma interna se paga.
prerequisites: [system-design]
related: [cloud-architecture, observability, architecture-leadership]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-26
---

# DevOps e Plataforma

O caminho entre um commit e produção é decisão arquitetural. Determina com que
frequência se muda, com que risco, e quanto custa reverter.

## O problema desta seção

Arquitetura costuma ser discutida como se implantar fosse detalhe posterior. Não
é: a frequência com que se consegue implantar com segurança limita diretamente o
quanto a arquitetura pode evoluir.

Um sistema que só pode ser implantado uma vez por mês, com janela e plano de
retorno manual, é um sistema em que refatorar é caro demais para ser feito. A
arquitetura congela — não por decisão técnica, mas por consequência operacional.

O segundo tema é organizacional. Quando cada time resolve sozinho pipeline,
observabilidade, segredos e infraestrutura, o custo se multiplica pelo número de
times e as soluções divergem. Plataforma interna é a resposta a isso — e tem seu
próprio conjunto de formas de dar errado.

## O que você vai encontrar aqui

**Entrega.** CI/CD e gestão de ambientes. O pipeline como parte da arquitetura,
não como ferramenta.

**Infraestrutura.** Infrastructure as Code e containers. Reprodutibilidade como
propriedade, não como conveniência.

**Estratégias de implantação.** Blue/green, canary e rolling. Cada uma com o
perfil de risco que endereça e o que exige do sistema para funcionar — canary
sem observabilidade adequada é implantação normal com passos extras.

**Desacoplamento.** Feature flags, que separam implantar de liberar. Poderoso e
com custo de complexidade e limpeza que raramente é orçado.

**Plataforma.** Platform engineering e internal developer platforms. Quando se
paga, e o sinal de que virou um gargalo de aprovação com nome novo.

**Cadeia de suprimentos.** Supply chain security — dependências, artefatos e
proveniência.

## Ordem de leitura

Comece por **estratégias de implantação**, que é a parte mais diretamente
arquitetural: cada uma impõe requisitos ao sistema.

**Feature flags** logo depois, porque muda o que "implantar" significa.

Deixe **platform engineering** para o fim e leia junto com
[Liderança](../23-architecture-leadership/index.md). É tanto decisão
organizacional quanto técnica, e a lei de Conway opera fortemente aqui.

## Erros que esta seção previne

- Adotar canary sem a instrumentação que permitiria detectar a regressão, o que
  produz uma implantação normal com etapas extras e falsa sensação de cuidado.
- Acumular feature flags sem prazo de remoção, até que o número de caminhos
  possíveis no código exceda o que qualquer teste cobre.
- Construir plataforma interna antes de existirem times suficientes para
  amortizá-la, transferindo custo em vez de reduzi-lo.
- Tratar ambientes como cópias aproximadas de produção, e descobrir a diferença
  durante um incidente.

## Ao terminar

Você escolhe estratégia de implantação a partir do risco aceitável e do que o
sistema consegue observar. Reconhece quando a frequência de entrega está
limitando a evolução da arquitetura.

E consegue avaliar se uma plataforma interna reduz custo total ou apenas o
transfere para um time que virou fila.

## Relacionado

[Nuvem](../09-cloud-architecture/index.md) e
[Observabilidade](../13-observability/index.md).
