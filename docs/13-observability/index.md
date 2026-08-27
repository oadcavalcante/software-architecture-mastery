---
id: observability
title: Observabilidade
sidebar_position: 0
description: Conseguir responder perguntas novas sobre o sistema sem precisar alterá-lo.
doc_type: index
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor instrumenta um sistema para responder perguntas não
  previstas e desenha alertas que apontam sintoma percebido pelo usuário.
prerequisites: [distributed-systems]
related: [reliability, devops-and-platform]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-26
---

# Observabilidade

Monitoramento responde perguntas que você previu. Observabilidade é a capacidade
de responder perguntas que você não previu, sem alterar o sistema.

## O problema desta seção

Num sistema de processo único, depurar é anexar um debugger. Num sistema
distribuído, o comportamento que interessa acontece entre processos, em
requisições que atravessam sete serviços, das quais 0,3% falham por um motivo
que nenhum log isolado revela.

O incidente típico não é "o serviço caiu" — isso é fácil. É "algumas requisições
de alguns clientes estão lentas desde ontem". Responder a isso exige correlação
entre sinais que foram emitidos por componentes diferentes, e essa correlação
precisa ter sido projetada antes.

Observabilidade é, portanto, decisão arquitetural. Adicionada depois do
incidente, chega tarde para aquele incidente.

## O que você vai encontrar aqui

**Os três sinais.** Logs, métricas e traces — o que cada um responde bem, o que
responde mal, e o custo de armazenamento e cardinalidade de cada um.

**Correlação.** Tracing distribuído e correlation IDs. É o que transforma três
sinais desconexos numa narrativa por requisição, e é a parte que precisa
atravessar toda fronteira de serviço para funcionar.

**Coleta.** Telemetria e instrumentação — o que emitir, com que granularidade,
e por que instrumentar tudo é tão problemático quanto instrumentar pouco.

**Consumo.** Dashboards e alertas. Alerta que não corresponde a ação humana
necessária é ruído que treina o time a ignorar alertas.

**Prática de SRE.** Golden signals e a ligação com SLO. Alertar por sintoma
percebido pelo usuário em vez de por causa suposta.

**O objetivo final.** Depurabilidade: a propriedade de o sistema permitir
investigação, não apenas emitir dados.

## Ordem de leitura

Comece por **os três sinais** e **correlação**, nessa ordem. Correlation ID é a
decisão de menor custo e maior retorno desta seção, e precisa ser tomada cedo
porque atravessa todos os contratos.

Leia **golden signals** e **alertas** junto com
[Confiabilidade](../12-reliability/index.md). Alerta desconectado de SLO é
alerta sem critério de urgência.

## Ao terminar

Você instrumenta um sistema de forma que uma pergunta nova possa ser respondida
com os dados já emitidos. Desenha alertas que apontam para sintoma percebido
pelo usuário e correspondem a uma ação.

E consegue estimar o custo de observabilidade antes de ligá-la — que em sistemas
de alto volume rivaliza com o custo de computação.

## Relacionado

[DevOps e Plataforma](../14-devops-and-platform/index.md), onde essa
instrumentação vira responsabilidade de plataforma em vez de esforço por time.
