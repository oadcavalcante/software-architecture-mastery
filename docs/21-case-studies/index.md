---
id: case-studies
title: Case Studies
sidebar_position: 0
description: Arquiteturas completas, com o raciocínio que leva até elas e as opções descartadas.
doc_type: index
level: 0
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor conduz uma análise arquitetural completa, do contexto de
  negócio à estratégia de evolução, defendendo as opções descartadas.
prerequisites: [system-design, distributed-systems]
related: [trade-offs, system-design-interviews]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-26
---

# Case Studies

Quatorze arquiteturas completas, cada uma percorrida do contexto de negócio até
a estratégia de evolução.

## O problema desta seção

Conceitos aprendidos isoladamente não se combinam sozinhos. Alguém pode entender
consistência eventual, particionamento, idempotência e circuito de contenção
como tópicos, e ainda assim não conseguir projetar um sistema em que os quatro
precisam coexistir sob restrição de custo e prazo.

Case study é onde a combinação acontece — e onde os conflitos aparecem. A decisão
que melhora disponibilidade piora a consistência. A que reduz latência aumenta o
custo. A que simplifica a operação acopla dois domínios que deveriam evoluir
separados.

Nenhum tópico isolado ensina a resolver isso, porque isoladamente esses conflitos
não existem.

## O que você vai encontrar aqui

Quatorze domínios com perfis de restrição deliberadamente diferentes:

**Transacionais e de alta consistência.** Sistema bancário · plataforma de
pagamentos.

**De alto volume e latência baixa.** Rede social · streaming de vídeo ·
mensageria · processamento de eventos de alto volume.

**De coordenação em tempo real.** Ride-sharing · delivery de comida · logística.

**De domínio complexo e regulação.** Saúde · sistema corporativo multi-tenant.

**De evolução.** E-commerce · SaaS · modernização de legado.

A diversidade é proposital: o mesmo conceito aparece com peso diferente em cada
perfil, e é comparando que se aprende a ler restrições.

## A estrutura de cada case

```text
Contexto de Negócio → Requisitos Funcionais → Requisitos Não-Funcionais
→ Restrições → Estimativas de Capacidade → Opções de Arquitetura
→ Análise de Trade-offs → Decisão → Componentes → Dados → Integração
→ Segurança → Escalabilidade → Confiabilidade → Observabilidade
→ Implantação → Estratégia de Evolução
```

## A regra desta seção

**Nenhum case apresenta uma arquitetura como a resposta.**

Cada um expõe no mínimo três opções genuinamente viáveis, com uma matriz de
decisão de critérios ponderados. E toda opção descartada declara **sob qual
mudança de restrição ela passaria a vencer** — se não houver essa condição, não
era opção real, era espantalho.

Essa exigência é o que impede o case de virar justificativa retroativa de uma
escolha já feita.

## Ordem de leitura

Comece por **e-commerce**. É o domínio mais familiar e o que exige menos contexto
de negócio, o que deixa a atenção livre para o método.

Depois escolha por interesse ou por proximidade com o que você constrói. Não há
progressão obrigatória entre eles.

Leia **plataforma de pagamentos** e **processamento de eventos de alto volume**
em algum momento, mesmo que fora do seu domínio: são os que mais exercitam o
[Nível 04](../06-distributed-systems/index.md).

## Como usar

Leia contexto, requisitos e restrições. **Pare antes das opções.** Esboce sua
arquitetura em vinte minutos. Só então continue.

O valor não está em concordar com a decisão do texto — está em descobrir qual
restrição você não tinha considerado.

## Ao terminar

Você conduz uma análise completa em cima de um domínio novo, e defende as opções
que descartou tão bem quanto a que escolheu.

## Relacionado

[Entrevistas de System Design](../22-system-design-interviews/index.md), que é o
mesmo raciocínio sob pressão de tempo.
