---
id: blue-green
title: Blue-Green
sidebar_position: 5
description: Dois ambientes completos e uma troca instantânea — simplicidade ao custo de capacidade duplicada.
doc_type: pattern
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor aplica blue-green sabendo o que a troca instantânea não
  resolve e o que o estado compartilhado impõe.
prerequisites: [deployment-strategies]
related: [deployment-strategies, canary, rolling-deployments]
canonical_for: [blue-green, troca de ambiente, ambiente inativo, aquecimento de ambiente]
content_version: 1
last_reviewed: 2026-08-28
---

# Blue-Green

## Visão Geral

Em blue-green, existem dois ambientes completos. Um atende o tráfego; o outro está
ocioso.

A implantação acontece no ocioso. Verificado, o tráfego é **trocado** — de uma vez. Se
algo der errado, troca-se de volta.

A propriedade que a define: **reversão instantânea**. Não há implantação a desfazer, há
um roteamento a inverter.

## Problema

Reverter uma implantação convencional significa implantar a versão anterior — o que leva
o mesmo tempo da implantação original, sob pressão, com o sistema degradado.

Ver [estratégias de implantação](deployment-strategies.md). Para mudanças de alto risco,
ou onde a janela de degradação é cara, esse tempo é inaceitável.

Blue-green troca capacidade por tempo: mantendo o ambiente antigo intacto, a volta é
imediata.

## Conceitos Centrais

### A troca é de roteamento

```text
DNS                simples, e a propagação leva minutos — ruim para reversão
balanceador        troca de conjunto de destinos — segundos
malha de serviço   troca de rota — segundos, com granularidade
```

A primeira opção anula boa parte do valor: se a reversão depende de propagação de DNS,
ela não é instantânea. Ver
[regiões](../09-cloud-architecture/regions.md).

O tempo de vida do registro precisa ser curto, ou a troca deve acontecer numa camada
abaixo.

### O ambiente inativo precisa estar aquecido

Um ambiente que acabou de subir tem cache frio, conexões não estabelecidas e código
ainda não otimizado.

Trocar 100% do tráfego para ele produz um pico de latência e, frequentemente, uma queda
— que é lida como "a versão nova está ruim", quando o problema é o ambiente frio.

Ver [cache para escala](../11-scalability/scaling-cache.md).

O que resolve: aquecimento antes da troca — tráfego sintético, ou uma fração pequena de
tráfego real por alguns minutos.

Esse último caso, na prática, é um canary curto. Ver [canary](canary.md).

### O estado compartilhado é a restrição real

Os dois ambientes compartilham banco de dados, cache, filas e armazenamento. Isso impõe:

```text
esquema        precisa funcionar com as duas versões
mensagens      a versão antiga precisa ler o que a nova escreve
cache          formatos compatíveis, ou chaves versionadas
sessões        legíveis por ambas
```

Sem isso, a reversão não é segura: o ambiente antigo volta e encontra dados que não
entende.

Este é o ponto que mais frequentemente torna blue-green menos instantâneo do que
promete. A troca de roteamento é imediata; a compatibilidade do estado é trabalho de
modelagem.

Ver [evolução de esquema](../08-integration-architecture/schema-evolution.md).

### Requisições em andamento

No momento da troca, há requisições sendo processadas no ambiente antigo.

```text
corte abrupto    elas falham
drenagem         o ambiente antigo termina o que começou, sem receber novas
```

Drenagem é o comportamento correto, e ela precisa de tempo limite — uma requisição longa
não pode segurar a troca indefinidamente.

E o mesmo vale para trabalho assíncrono: consumidores de fila do ambiente antigo
precisam parar de consumir, terminar o que pegaram, e sair.

### O custo é capacidade duplicada

Manter dois ambientes completos custa. Há formas de reduzir:

```text
ambiente reduzido    o inativo com capacidade menor, expandido antes da troca
compartilhamento     apenas a camada de aplicação duplicada
efêmero              o ambiente novo criado a cada implantação, destruído depois
```

A terceira é a que a infraestrutura programável viabiliza, e é a mais econômica: nada
fica ocioso.

O custo dela é o tempo de criação, e a exigência de que a infraestrutura seja
completamente declarada. Ver
[infraestrutura como código](infrastructure-as-code.md).

### O que ele não faz

Vale ser explícito: **blue-green não detecta problemas**.

Ele torna a reversão barata. Alguém — ou algo — ainda precisa perceber que a versão nova
está errada.

Para mudanças cujo problema não é óbvio, ele precisa ser combinado com verificação. Ver
[canary](canary.md).

E há um risco associado: a facilidade de reverter pode reduzir o cuidado na verificação
prévia, com a lógica de "se der errado a gente volta". Isso funciona para o que é
detectável rapidamente, e não para o que é silencioso.

## Modelo Mental

**Blue-green troca capacidade por reversibilidade.** A troca é instantânea; a
compatibilidade do estado compartilhado é o que precisa ser projetado.

## Quando Usar

- A reversão precisa ser instantânea.
- Mudanças de infraestrutura — versão de tempo de execução, imagem base.
- Onde a janela de degradação é cara.
- Sistemas de baixo volume, onde canary não tem significância.
- Quando o ambiente pode ser criado sob demanda.

## Quando Não Usar

**Sem compatibilidade de estado compartilhado.**

**Com troca por DNS de tempo de vida longo.**

**Sem aquecimento do ambiente novo.**

**Sem drenagem** das requisições em andamento.

**Como substituto de verificação.**

**Quando duplicar o ambiente é inviável** por custo ou por licenciamento.

## Alternativas

- **[Canary](canary.md)** — detecta, expõe menos, exige volume.
- **[Implantação em ondas](rolling-deployments.md)** — sem capacidade extra, reversão
  gradual.
- **[Feature flags](feature-flags.md)** — reversão instantânea sem duplicar ambiente,
  para mudanças de comportamento.
- **Blue-green com canary na troca** — trocar gradualmente em vez de de uma vez,
  combinando os dois.

A última é o desenho mais robusto e o mais usado em sistemas maduros.

## Trade-offs

| Blue-green | Em ondas |
|---|---|
| Reversão instantânea | Gradual |
| Capacidade duplicada | Sem extra |
| Troca de uma vez | Substituição gradual |
| Ambiente novo verificável antes | Verificação em produção |

| Ambiente permanente | Efêmero |
|---|---|
| Pronto imediatamente | Tempo de criação |
| Custo contínuo | Só durante a implantação |
| Pode divergir | Sempre do código |

## Modos de Falha

**Ambiente frio recebendo 100%.** Pico de latência lido como versão ruim.

**Reversão insegura.** O estado mudou de forma incompatível.

**Propagação de DNS.** A reversão leva minutos.

**Requisições perdidas na troca.** Sem drenagem.

**Ambiente inativo divergindo.** Configuração aplicada só no ativo.

**Consumidores de fila duplicados.** Os dois ambientes consumindo ao mesmo tempo.

**Custo não previsto.** Capacidade duplicada permanentemente.

## Erros Comuns

**Não aquecer o ambiente novo.**

**Não verificar compatibilidade do estado.**

**Trocar por DNS.**

**Não drenar.**

**Deixar o ambiente inativo divergir.**

**Não desligar os consumidores assíncronos** do ambiente antigo.

## Exemplo Real

Uma plataforma de gestão financeira adotou blue-green para reduzir o risco de
implantações mensais, que eram eventos de duas horas com janela de manutenção.

Os primeiros meses foram bons: a janela desapareceu, e a implantação passou a levar
minutos.

Três problemas apareceram:

**Pico de latência na troca.** Toda troca produzia dois a três minutos de latência
elevada. Foi diagnosticado como "aquecimento normal" por meses, até alguém medir: o
ambiente novo subia com cache vazio e pool de conexões não estabelecido. A solução foi
enviar 5% do tráfego por dez minutos antes da troca completa — o que, na prática,
introduziu um canary.

**Reversão insegura.** Numa implantação, a versão nova gravou um campo novo em registros
de sessão. Ao reverter, o ambiente antigo não entendeu o formato e derrubou as sessões
de todos os usuários logados. Passou a haver verificação obrigatória de compatibilidade
de estado na revisão.

**Consumidores duplicados.** Os dois ambientes tinham consumidores de fila ativos. Após
uma implantação, ambos consumiam — e por 40 minutos, mensagens foram processadas por
versões diferentes, com resultados inconsistentes. A troca passou a desligar os
consumidores do ambiente antigo antes de qualquer coisa.

E uma mudança de custo: o ambiente inativo permanente custava o mesmo que o ativo.
Migrou-se para ambiente efêmero, criado por infraestrutura como código a cada
implantação e destruído após uma janela de reversão de 24 horas.

Isso reduziu o custo em cerca de 40% e teve um efeito colateral positivo: o ambiente
novo passou a ser sempre construído do zero a partir do código, eliminando a divergência
que se acumulava no ambiente permanente.

A avaliação posterior aponta: o problema dos consumidores de fila foi o mais grave e o menos
esperado. Blue-green é apresentado como troca de tráfego, e o tráfego assíncrono não
passa por roteamento.

## Conceitos Relacionados

- [Estratégias de Implantação](deployment-strategies.md).
- [Canary](canary.md) — a detecção que falta.
- [Infraestrutura como Código](infrastructure-as-code.md) — o ambiente efêmero.
- [Evolução de Esquema](../08-integration-architecture/schema-evolution.md).

## Exercício Prático

Se você usa blue-green, verifique o que acontece com os consumidores de fila durante a
troca — e se uma reversão seria segura dado o que a versão nova escreveu.

As duas perguntas costumam não ter resposta documentada.

## Perguntas de Entrevista

- Por que o ambiente novo precisa ser aquecido?
- Por que o estado compartilhado é a restrição real da reversão?
- O que blue-green não faz?

## Para Aprofundar

- Fowler, Martin. *BlueGreenDeployment*, 2010.
- Humble, Jez; Farley, David. *Continuous Delivery*. Addison-Wesley, 2010.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
