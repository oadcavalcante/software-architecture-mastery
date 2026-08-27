---
id: cloud-architecture
title: Arquitetura em Nuvem
sidebar_position: 0
description: Nuvem como modelo arquitetural — não como tutorial de provedor.
doc_type: index
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor decide entre serviço gerenciado e autogerido, projeta
  topologia multi-região a partir de RTO e RPO, e trata custo como restrição.
prerequisites: [distributed-systems]
related: [devops-and-platform, reliability, security]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-26
---

# Arquitetura em Nuvem

Esta seção trata de nuvem como modelo arquitetural. Não é um tutorial de AWS,
Azure ou GCP — exemplos usam os três, mas os princípios precedem qualquer um.

## O problema desta seção

A nuvem muda três coisas de forma fundamental: capacidade vira variável em vez
de constante, falha de infraestrutura vira evento rotineiro e previsto, e custo
vira consequência direta de decisão arquitetural.

O terceiro é o mais subestimado. Em datacenter próprio, o custo é decidido uma
vez, na compra, e a arquitetura opera dentro dele. Na nuvem, cada decisão de
design — quantas réplicas, qual região, síncrono ou assíncrono, quanto tráfego
atravessa zona — reaparece na fatura todo mês. Custo deixa de ser assunto de
finanças e vira atributo de qualidade, com o mesmo estatuto de disponibilidade.

A armadilha oposta também é real: tratar a nuvem como datacenter alugado.
Migrar máquinas virtuais sem mudar nada produz um sistema que herdou o custo da
nuvem e nenhuma das suas propriedades.

## O que você vai encontrar aqui

**Modelos de serviço.** IaaS, PaaS e SaaS. Menos como taxonomia e mais como
gradiente de quanto controle você troca por quanta operação deixa de fazer.

**Unidades de execução.** Containers, Kubernetes, serverless e serviços
gerenciados. Cada um com a faixa de carga e a maturidade de time em que se paga.

**Topologia física.** Regiões, zonas de disponibilidade e rede. É onde a
promessa de disponibilidade encontra a geografia, e onde a latência entre
componentes deixa de ser desprezível.

**Recursos.** Identidade, storage e compute como primitivas arquiteturais.

**Continuidade.** Multi-região e disaster recovery, derivados de RTO e RPO em
vez de escolhidos por ambição.

**Economia.** Arquitetura de custo — como estimar antes, medir depois e atribuir
gasto a decisão.

**Dependência.** Cloud-native e vendor lock-in, tratados como um trade-off
quantificável e não como questão ideológica.

## Ordem de leitura

Comece por **regiões e zonas de disponibilidade**. Sem isso, discussões sobre
alta disponibilidade ficam sem chão físico.

Leia **arquitetura de custo** antes de serverless e Kubernetes, não depois. As
duas decisões mais caras da nuvem — granularidade de serviço e volume de
tráfego entre zonas — são decisões de custo disfarçadas de decisões técnicas.

Deixe **multi-região** para o fim, e leia junto com
[Confiabilidade](../12-reliability/index.md). Multi-região é a solução mais
frequentemente adotada sem que ninguém tenha escrito o RTO exigido.

## Ao terminar

Você decide entre gerenciado e autogerido com um argumento que inclui custo
total, não só mensalidade. Projeta topologia derivando de RTO e RPO declarados.
Estima a fatura de um desenho antes de construí-lo.

E consegue dizer, sobre lock-in, quanto custaria sair — em meses e em dinheiro —
em vez de repetir que é ruim.

## Relacionado

[DevOps e Plataforma](../14-devops-and-platform/index.md) para operar isso, e
[Segurança](../10-security/index.md) para as fronteiras.
