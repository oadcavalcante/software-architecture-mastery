---
id: cloud-compute
title: Computação em Nuvem
sidebar_position: 13
description: Escolher e dimensionar capacidade — famílias, modelos de compra e o escalonamento que quase nunca é rápido o bastante.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor dimensiona com base em medição e escolhe modelo de compra
  pelo perfil de carga.
prerequisites: [iaas]
related: [iaas, cost-architecture, containers]
canonical_for: [família de instância, modelo de compra, capacidade interrompível, escalonamento automático]
content_version: 1
last_reviewed: 2026-08-27
---

# Computação em Nuvem

## Visão Geral

Computação é onde o código roda, e a escolha tem três dimensões independentes: qual
**família** de máquina, qual **tamanho**, e sob qual **modelo de compra**.

As três afetam custo e desempenho de formas diferentes, e errar em qualquer uma
custa mensalmente.

A quarta decisão — **escalonamento** — é a que separa um sistema que responde a
picos de um que cai neles.

## Problema

O dimensionamento típico é feito por precaução: escolhe-se um tamanho confortável,
com folga, e nunca se revisita.

O resultado é o padrão da indústria: instâncias com utilização entre 5% e 15%,
pagas integralmente.

Do outro lado, subdimensionar leva a saturação sob carga — e o escalonamento
automático, que deveria resolver, costuma ser mais lento que o pico.

Ambos vêm da mesma ausência: ninguém mediu.

## Conceitos Centrais

### Família antes de tamanho

Máquinas são otimizadas para perfis diferentes:

```text
propósito geral    equilíbrio entre CPU e memória
otimizada a CPU    mais processamento por unidade de memória
otimizada a memória mais memória — bancos, cache
otimizada a E/S    disco local rápido
com acelerador     processamento paralelo especializado
```

Escolher a família errada é mais caro que escolher o tamanho errado: uma aplicação
que precisa de memória, numa família de propósito geral, obriga a subir de tamanho
— pagando CPU que não usa — até ter memória suficiente.

A pergunta que orienta: **qual recurso satura primeiro?** Medir isso antes de
escolher resolve a maior parte do desperdício.

### Arquitetura de processador é dinheiro parado na mesa

Instâncias com processadores de arquitetura alternativa costumam entregar melhor
relação entre desempenho e preço para cargas comuns — serviços web, aplicações em
linguagens interpretadas ou com máquina virtual.

A barreira é a compatibilidade de binários e de imagens de contêiner, que hoje é
muito menor do que era.

É uma das mudanças de melhor retorno disponíveis, e ela costuma não ser testada
porque exige um ciclo de construção diferente.

### Os modelos de compra

```text
sob demanda      preço cheio, sem compromisso, disponível sempre
compromisso      desconto por reserva de 1 a 3 anos, para carga estável
interrompível    muito mais barato, pode ser retomado com aviso curto
```

A regra prática que funciona:

**Carga base estável** → compromisso. A parte que sempre roda merece desconto.

**Variação previsível** → sob demanda.

**Carga tolerante a interrupção** → interrompível: processamento em lote,
transcodificação, testes, treinamento de modelos.

A capacidade interrompível é subutilizada. Cargas genuinamente reprocessáveis podem
rodar a uma fração do preço, e o requisito — tolerar interrupção com aviso curto —
é o mesmo de qualquer sistema bem projetado para nuvem.

### Escalonar não é instantâneo

O tempo entre a métrica disparar e a capacidade estar servindo tráfego:

```text
detecção da métrica       30 a 120 s (janela de agregação)
provisionamento           30 a 90 s
inicialização da aplicação 10 s a vários minutos
verificação de saúde      15 a 60 s
```

Total: frequentemente de 2 a 5 minutos. Muitos picos duram menos que isso.

As formas de melhorar:

**Imagem pré-construída** com tudo instalado, em vez de configurar na
inicialização.

**Inicialização rápida da aplicação.**

**Escalonar por métrica antecedente** — profundidade de fila, conexões — em vez de
CPU, que reage tarde.

**Escalonamento programado** para picos previsíveis. É a técnica mais eficaz e a
menos usada: se o pico é toda segunda às 9h, não espere a métrica.

**Folga de capacidade** para absorver o intervalo.

### Dimensionar exige percentil, não média

Uma instância com 20% de CPU média pode estar em 95% nos picos. Redimensionar pela
média produz saturação.

O dimensionamento correto olha o percentil alto e a duração dos picos — e considera
se o escalonamento cobre o restante.

### Reiniciar precisa ser rotina

Instâncias somem: manutenção do provedor, falha de hardware, capacidade
interrompível retomada.

Isso exige desligamento gracioso — parar de aceitar novas requisições, terminar as
em andamento, sair do balanceamento — e nada de estado importante em disco local.

Aplicações que não fazem isso perdem requisições em todo evento de escalonamento,
não só em falhas.

## Modelo Mental

**Dimensione pelo recurso que satura, compre pelo perfil de carga, e escale antes
de precisar.** As três decisões são independentes.

## Quando Usar

- **Compromisso** para a carga base que sempre roda.
- **Sob demanda** para variação.
- **Interrompível** para processamento tolerante a interrupção.
- **Escalonamento programado** para picos previsíveis.
- **Escalonamento por métrica** para variação imprevisível.

## Quando Não Usar

**Dimensionar por precaução.**

**Compromisso antes de a carga estabilizar.**

**Interrompível para carga que não tolera interrupção.**

**Confiar no escalonamento para picos de segundos.**

**Escalar por CPU** quando existe métrica antecedente melhor.

**Sem teto de escalonamento.** Um defeito gera carga e a conta acompanha.

## Alternativas

- **[Contêineres](/09-cloud-architecture/containers.md)** — melhor densidade, escalonamento mais rápido.
- **[Serverless](/09-cloud-architecture/serverless.md)** — sem capacidade a gerenciar.
- **Escalonamento vertical** — instância maior em vez de mais instâncias; simples,
  com teto e reinício.
- **Fila com trabalhadores** — absorve o pico sem escalar, quando a operação é
  assíncrona. Ver
  [mensageria](/06-distributed-systems/messaging.md).

A última merece destaque: para muitos picos, a resposta certa não é mais capacidade
— é não precisar processar tudo naquele instante.

## Trade-offs

| Instância maior | Mais instâncias |
|---|---|
| Simples | Distribuição de falha |
| Teto do maior tamanho | Escala além |
| Reinício para mudar | Sem interrupção |
| Sem coordenação | Estado precisa sair |

| Compromisso | Sob demanda | Interrompível |
|---|---|---|
| Mais barato | Preço cheio | Muito barato |
| Compromisso longo | Nenhum | Pode ser retomada |
| Carga estável | Variável | Tolerante |

## Modos de Falha

**Escalonamento lento demais** para o pico.

**Oscilação.** Sobe e desce repetidamente por limiar mal configurado.

**Sem teto.** Custo dispara com defeito.

**Capacidade indisponível.** A região não tem o tipo pedido no momento.

**Interrompível retomada** em carga que não tolerava.

**Sem desligamento gracioso.** Requisições perdidas a cada evento.

**Compromisso desperdiçado.** A carga mudou e a reserva não serve mais.

## Erros Comuns

**Não medir antes de dimensionar.**

**Dimensionar pela média.**

**Não testar arquitetura de processador alternativa.**

**Escalar só por CPU.**

**Não usar escalonamento programado** para picos conhecidos.

**Não implementar desligamento gracioso.**

## Exemplo Real

Uma plataforma de ingressos tinha o problema clássico: vendas abrem num horário
marcado, e o tráfego multiplica por 200 em segundos.

O escalonamento automático por CPU era a estratégia, e ela falhava toda vez. O pico
chegava, a CPU subia, o escalonamento começava — e cinco minutos depois, quando a
capacidade estava pronta, a maior parte dos ingressos já tinha sido vendida ou os
usuários já tinham desistido.

As mudanças:

**Escalonamento programado.** As aberturas de venda são conhecidas com dias de
antecedência. A capacidade passa a ser provisionada 20 minutos antes. Isso sozinho
resolveu a maior parte do problema, e não exigiu nenhuma tecnologia nova.

**Fila para a compra.** A confirmação de compra virou assíncrona, com fila. O pico
passa a ser absorvido pela fila em vez de exigir capacidade proporcional. Ver
[mensageria](/06-distributed-systems/messaging.md).

**Métrica antecedente.** Para o tráfego não previsto, o escalonamento passou a olhar
a profundidade da fila e o número de conexões, que reagem antes da CPU.

**Imagem pré-construída.** O tempo de inicialização caiu de 3 minutos para 25
segundos.

**Família correta.** A medição mostrou que a aplicação saturava memória, não CPU.
A mudança para família otimizada a memória permitiu reduzir o tamanho pela metade
com o mesmo desempenho.

**Modelos de compra revistos.** Carga base em compromisso de um ano; o
processamento de relatórios e a geração de ingressos em PDF migraram para capacidade
interrompível.

Resultado combinado: o sistema passou a suportar as aberturas sem degradação, e o
custo mensal caiu 38% — apesar de a capacidade de pico ter aumentado.

A lição registrada: eles vinham tentando resolver com ajustes de limiar do
escalonamento havia mais de um ano. A resposta não estava no escalonamento — estava
em não depender dele para um evento agendado.

## Conceitos Relacionados

- [IaaS](/09-cloud-architecture/iaas.md) — o modelo.
- [Contêineres](/09-cloud-architecture/containers.md) — a alternativa de empacotamento.
- [Serverless](/09-cloud-architecture/serverless.md).
- [Arquitetura de Custo](/09-cloud-architecture/cost-architecture.md).

## Exercício Prático

Pegue suas instâncias de produção e compare, para cada uma: utilização de CPU e de
memória no percentil 95 dos últimos 30 dias.

O recurso mais alto é o que deveria guiar a família. Se os dois estiverem abaixo de
30%, você está pagando por capacidade que não usa.

## Perguntas de Entrevista

- Por que escolher a família errada custa mais que o tamanho errado?
- Por que escalonamento por CPU reage tarde?
- Quando escalonamento programado é melhor que automático?

## Para Aprofundar

- Documentação de tipos de instância dos principais provedores.
- Storment, J.R.; Fuller, Mike. *Cloud FinOps*. 2ª ed. O'Reilly, 2023.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
