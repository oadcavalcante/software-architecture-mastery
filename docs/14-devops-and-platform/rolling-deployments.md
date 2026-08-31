---
id: rolling-deployments
title: Implantação em Ondas
sidebar_position: 7
description: Substituir instâncias gradualmente — a estratégia padrão, e o que ela custa em capacidade.
doc_type: pattern
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor configura implantação em ondas com capacidade preservada e
  critério de parada.
prerequisites: [deployment-strategies]
related: [deployment-strategies, blue-green, canary]
canonical_for: [implantação em ondas, orçamento de indisponibilidade, tamanho de onda, parada automática]
content_version: 1
last_reviewed: 2026-08-28
---

# Implantação em Ondas

## Visão Geral

Numa implantação em ondas, as instâncias são substituídas gradualmente: algumas saem,
sobem com a versão nova, entram; repete-se até todas terem sido trocadas.

É a estratégia padrão da maioria dos orquestradores, e a mais usada — porque não exige
capacidade extra nem infraestrutura de comparação.

O que ela entrega: implantação sem parada. O que ela **não** entrega: detecção de
problema, e reversão instantânea.

## Problema

Substituir todas as instâncias de uma vez causa indisponibilidade. Substituir uma por
uma leva muito tempo em ambientes grandes.

A implantação em ondas resolve com um parâmetro: quantas instâncias são substituídas
simultaneamente.

E introduz duas questões que costumam não ser decididas: **quanta capacidade se perde
durante o processo**, e **quando parar se algo der errado**.

## Conceitos Centrais

### Capacidade durante a implantação

O ponto mais consequente e o mais negligenciado.

```text
10 instâncias, onda de 2, sem instâncias extras
  → durante a implantação, 8 atendem
  → se elas operavam a 80%, agora precisam de 100% → saturam
```

Duas configurações resolvem, e elas se combinam:

**Máximo indisponível.** Quantas podem estar fora ao mesmo tempo. Zero significa que
novas sobem antes de as antigas saírem.

**Máximo excedente.** Quantas a mais podem existir temporariamente. Permite subir a nova
antes de derrubar a antiga, preservando a capacidade total.

A configuração segura para serviços com pouca folga: excedente positivo, indisponível
zero. Isso custa capacidade temporária e não reduz a capacidade de atendimento.

Ver [planejamento de capacidade](/11-scalability/scaling-capacity-planning.md).

### A verificação de saúde decide o ritmo

A onda só avança quando as instâncias novas estão saudáveis. Isso torna a verificação
crítica:

```text
rasa demais    a instância entra na rotação antes de estar pronta
               → erros durante a implantação
profunda demais  depende de outros serviços
               → uma dependência lenta trava a implantação inteira
```

Ver [Kubernetes](/09-cloud-architecture/kubernetes.md) — a distinção entre verificar
que o processo vive e verificar que ele pode receber tráfego.

A verificação de prontidão precisa considerar o aquecimento: uma instância que subiu
mas ainda tem cache vazio pode responder e não estar pronta para a fatia completa de
tráfego.

### As duas versões coexistem durante todo o processo

Enquanto a onda avança, requisições são atendidas por ambas as versões.

```text
esquema         compatível nas duas direções
mensagens       a versão antiga precisa ler o que a nova escreve
sessão e cache  formatos compatíveis
contrato        sem mudança incompatível
```

Ver [evolução de esquema](/08-integration-architecture/schema-evolution.md).

Isso não é diferente das outras estratégias graduais, e aqui a coexistência dura mais —
o tempo total da implantação, que pode ser de dezenas de minutos em ambientes grandes.

### Parada automática é o que limita o dano

Sem critério de parada, a implantação continua até o fim, mesmo que as instâncias novas
estejam falhando.

O que uma configuração madura tem:

```text
parar se a verificação de saúde falhar em N instâncias consecutivas
parar se a taxa de erro do serviço subir além de um limiar
tempo limite total — se não concluir, para e alerta
```

A segunda é a que distingue: parar por saúde da instância pega falhas de inicialização;
parar por métrica do serviço pega a versão que sobe bem e responde errado.

Ainda assim, isso é detecção grosseira comparada a [canary](/14-devops-and-platform/canary.md).

### A reversão é outra implantação em ondas

Diferente de [blue-green](/14-devops-and-platform/blue-green.md), reverter não é trocar um roteamento — é
substituir as instâncias de novo, no mesmo ritmo.

```text
implantação de 12 minutos → reversão de 12 minutos
```

Isso importa na conta do tempo de recuperação. Ver
[RTO](/12-reliability/rto.md).

Onde a reversão precisa ser mais rápida, a estratégia é outra — ou a implantação em
ondas é combinada com [feature flags](/14-devops-and-platform/feature-flags.md), que revertem em segundos.

### O tamanho da onda é um trade-off simples

```text
onda grande   rápido, mais capacidade fora, mais exposição se estiver ruim
onda pequena  lento, capacidade preservada, menos exposição
```

Uma prática comum e boa: **começar pequeno e acelerar**. A primeira onda com uma
instância, observada por alguns minutos; se estiver tudo bem, ondas maiores.

Isso aproxima a implantação em ondas de um canary, sem a infraestrutura de comparação.

## Modelo Mental

**Ondas trocam tempo por capacidade preservada.** Ela não detecta e não reverte
rapidamente — protege contra indisponibilidade durante a troca.

## Quando Usar

- Mudanças rotineiras, de baixo risco.
- Onde não há capacidade para duplicar o ambiente.
- Serviços sem estado, com muitas instâncias.
- Como etapa final após um [canary](/14-devops-and-platform/canary.md) aprovado.

## Quando Não Usar

**Sem configurar excedente**, em serviços com pouca folga.

**Com verificação de saúde que depende de outros serviços.**

**Sem critério de parada.**

**Para mudanças que exigem reversão instantânea.**

**Sem compatibilidade entre versões.**

**Em serviços com estado** que não toleram instâncias sendo recriadas.

## Alternativas

- **[Blue-green](/14-devops-and-platform/blue-green.md)** — reversão instantânea, capacidade duplicada.
- **[Canary](/14-devops-and-platform/canary.md)** — detecção automática.
- **[Feature flags](/14-devops-and-platform/feature-flags.md)** — reversão em segundos, sem tocar na
  implantação.
- **Ondas com primeira instância observada** — o meio-termo barato entre ondas e canary.

## Trade-offs

| Em ondas | Blue-green |
|---|---|
| Sem capacidade extra permanente | Duplicada |
| Reversão leva o mesmo tempo | Instantânea |
| Coexistência prolongada | Só na troca |
| Configuração simples | Ambiente a gerenciar |

| Onda grande | Onda pequena |
|---|---|
| Rápido | Lento |
| Mais capacidade fora | Preservada |
| Mais exposição | Menos |

## Modos de Falha

**Capacidade insuficiente durante a implantação.** As instâncias restantes saturam.

**Instância entrando na rotação antes de estar pronta.**

**Implantação travada.** Verificação de saúde dependendo de serviço lento.

**Versão ruim indo para todas.** Sem critério de parada.

**Reversão lenta.**

**Estado incompatível** entre as versões coexistindo.

**Implantação parcial.** Parou no meio, e metade das instâncias tem cada versão — sem
plano para resolver.

## Erros Comuns

**Não configurar máximo excedente.**

**Verificação de prontidão consultando dependências.**

**Não definir critério de parada.**

**Onda grande demais** em serviços com pouca folga.

**Não considerar o tempo de reversão** no plano de recuperação.

**Não decidir o que fazer com uma implantação parada no meio.**

## Exemplo Real

Uma plataforma de mensageria implantava em ondas de 25% das instâncias, com máximo
indisponível de 25% e sem excedente.

O sistema operava a 70% de utilização em horário normal.

Durante as implantações — que aconteciam duas vezes por dia — a capacidade caía para
75%, e as instâncias restantes iam a 93%. A latência subia visivelmente por cerca de
oito minutos, duas vezes ao dia.

Isso era conhecido e tratado como inevitável: "é o custo de implantar".

Três mudanças resolveram:

**Máximo excedente de 25%, indisponível zero.** As instâncias novas sobem antes de as
antigas saírem. A capacidade total nunca cai abaixo de 100%. O custo é capacidade
temporária durante a implantação — alguns minutos de instâncias a mais.

O pico de latência desapareceu.

**Verificação de prontidão com aquecimento.** As instâncias novas entravam na rotação
imediatamente, com cache vazio. Passaram a aguardar o preenchimento inicial do cache
antes de se declararem prontas.

**Critério de parada.** Antes, a implantação seguia até o fim independentemente. Passou a
parar se a taxa de erro do serviço subisse 50% em relação à linha de base, ou se três
instâncias consecutivas falhassem na verificação.

No primeiro mês, a parada automática disparou duas vezes — ambas por versões com defeito
de configuração que teriam ido para todas as instâncias.

E uma quarta descoberta durante o trabalho:

**Implantação parada no meio** não tinha procedimento. A primeira vez que o critério
disparou, metade das instâncias estava numa versão e metade na outra, e ninguém sabia se
devia reverter ou seguir. Passou a haver reversão automática ao parar.

O que a equipe registra: o pico de latência duas vezes ao dia era tratado como custo
inevitável de implantar frequentemente. Ele era uma configuração de dois parâmetros que
ninguém tinha revisado desde a criação do serviço.

## Conceitos Relacionados

- [Estratégias de Implantação](/14-devops-and-platform/deployment-strategies.md).
- [Blue-Green](/14-devops-and-platform/blue-green.md) e [Canary](/14-devops-and-platform/canary.md).
- [Kubernetes](/09-cloud-architecture/kubernetes.md) — verificações de saúde.
- [Planejamento de Capacidade](/11-scalability/scaling-capacity-planning.md).

## Exercício Prático

Verifique a configuração de máximo indisponível e máximo excedente do seu serviço mais
crítico.

Depois calcule a capacidade disponível durante a implantação e compare com o pico de
tráfego. A conta costuma explicar picos de latência que ninguém tinha ligado a
implantações.

## Perguntas de Entrevista

- Por que máximo excedente importa mais que tamanho da onda?
- Por que verificação de prontidão não deve consultar dependências?
- Por que a reversão em ondas leva o mesmo tempo da implantação?

## Para Aprofundar

- Humble, Jez; Farley, David. *Continuous Delivery*. Addison-Wesley, 2010.
- Burns, Brendan et al. *Kubernetes: Up and Running*. 3ª ed. O'Reilly, 2022.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
