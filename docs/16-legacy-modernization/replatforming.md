---
id: replatforming
title: Replataforma
sidebar_position: 5
description: Mudar a infraestrutura sem mudar a aplicação — o primeiro passo que destrava os demais.
doc_type: concept
level: 6
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor usa replataforma para destravar entrega e observabilidade, sem
  esperar que ela resolva problemas de código.
prerequisites: [migration-strategies]
related: [migration-strategies, incremental-modernization, cloud-native]
canonical_for: [replataforma, destravamento operacional, adaptação mínima]
content_version: 1
last_reviewed: 2026-08-28
---

# Replataforma

## Visão Geral

Replataformar é mover a aplicação para infraestrutura nova, com alterações mínimas ao
código.

É a estratégia mais barata, mais rápida e de menor risco — e a mais subestimada, porque
não resolve problemas de código e por isso parece insuficiente.

O que ela entrega é **destravamento**: esteira automatizada, ambientes reproduzíveis,
observabilidade, implantação frequente. E isso reduz o custo de todo o trabalho posterior
— inclusive de reconstruir, se for o caso.

## Problema

Sistemas antigos frequentemente rodam em infraestrutura que impede as práticas que
tornariam a modernização viável:

```text
servidor configurado à mão, que ninguém sabe recriar
implantação manual, com janela de manutenção
sem ambiente de teste equivalente
sem telemetria além de arquivos de log no disco
release trimestral porque cada uma é um evento
```

Nesse contexto, qualquer mudança é cara — inclusive as mudanças da própria modernização.

Replataformar primeiro remove essas restrições, e o trabalho seguinte fica mais barato.

## Conceitos Centrais

### O que ela entrega

```text
infraestrutura declarada    o ambiente pode ser recriado
esteira automatizada        implantação sem procedimento manual
ambientes equivalentes      verificação antes de produção
observabilidade             saber o que acontece
implantação frequente       lotes menores, reversão viável
custo menor                 frequentemente, ao sair de infraestrutura própria
```

Ver [infraestrutura como código](/14-devops-and-platform/infrastructure-as-code.md) e
[gestão de ambientes](/14-devops-and-platform/environment-management.md).

Cada um desses reduz o custo de mudanças futuras. É por isso que ela costuma ser o
primeiro passo correto, mesmo quando não é o objetivo final.

### O que ela não entrega

Sendo explícito, porque a expectativa costuma ser maior:

```text
código continua o mesmo
modelo de dados continua o mesmo
acoplamento continua o mesmo
velocidade de desenvolvimento não muda por si
```

Uma aplicação difícil de mudar continua difícil de mudar depois de replataformada. Ver
[refatoração de legado](/16-legacy-modernization/legacy-refactoring.md).

Times que esperam que a mudança de infraestrutura resolva problemas de código ficam
frustrados — e a frustração desacredita uma estratégia que fez exatamente o que deveria.

### Migração como está é etapa, não destino

Mover sem mudar é a decisão correta para sair de um datacenter no prazo, ou para reduzir
custo rapidamente.

E ela precisa de continuação. Ver
[cloud native](/09-cloud-architecture/cloud-native.md).

Uma aplicação movida para nuvem sem adquirir as propriedades que a nuvem pressupõe —
ausência de estado, descartabilidade, configuração externa — roda lá e não aproveita
nada, com custo frequentemente maior.

O plano precisa incluir a segunda fase, com prazo. Sem isso, ela não acontece.

### As adaptações mínimas que valem a pena

Replataformar "sem mudar o código" é uma simplificação. Algumas adaptações têm retorno
alto e custo baixo:

```text
configuração externalizada    permite promover o mesmo artefato
registros na saída padrão     permite coleta centralizada
desligamento gracioso         permite implantação sem perder requisições
estado fora do disco local    permite mais de uma instância
verificação de saúde          permite balanceamento e recuperação
```

Ver [ausência de estado](/11-scalability/statelessness.md).

As cinco são pequenas e destravam desproporcionalmente. Fazer a replataforma sem elas
produz um sistema na nuvem que ainda precisa ser tratado como servidor único.

### O risco é baixo, e não é zero

```text
diferenças de ambiente        versões, bibliotecas do sistema, comportamento de rede
desempenho diferente          hardware, latência de disco, latência de rede
dependências ocultas          um arquivo, uma máquina, um processo agendado
integrações por endereço fixo apontando para o ambiente antigo
```

A terceira é a que mais surpreende: sistemas antigos acumulam dependências não
documentadas — um diretório compartilhado, um processo que roda numa máquina esquecida,
uma tarefa agendada que ninguém sabia que existia.

Ver [arquitetura do estado atual](/15-enterprise-architecture/current-state-architecture.md).

O controle: operar em paralelo por um período, com o antigo ainda disponível, antes de
desligar.

### Custo pode subir

Uma expectativa comum e frequentemente frustrada: replataformar para nuvem reduz custo.

Ela reduz quando o dimensionamento é revisto. Movida como está — com a mesma capacidade
provisionada de um datacenter, onde o hardware já estava pago —, ela costuma custar mais.

Ver [arquitetura de custo](/09-cloud-architecture/cost-architecture.md).

O redimensionamento com base em utilização real é parte da replataforma, não uma
otimização posterior.

### O sistema antigo revela o que a infraestrutura escondia

Um efeito colateral frequente: ao mover a aplicação, comportamentos que a infraestrutura
antiga acomodava passam a aparecer.

```text
dependência de ordem de inicialização    o servidor antigo sempre subia na mesma sequência
vazamento de memória                     o reinício semanal mascarava
dependência de horário do servidor       o fuso era o mesmo há anos
escrita em caminho absoluto              o diretório existia por convenção
conexão que nunca era fechada            o pool era grande o bastante
```

Nenhum desses é causado pela replataforma. Eles existiam e eram compensados por
características do ambiente antigo que ninguém tinha documentado.

Isso tem duas implicações práticas: a estimativa precisa incluir tempo para tratá-los, e o
período de operação em paralelo precisa ser longo o suficiente para que apareçam — alguns
só se manifestam depois de dias de operação contínua.

E há um lado positivo: cada um desses é um defeito latente que a replataforma expõe.
Corrigi-los melhora o sistema, independentemente da mudança de infraestrutura.

## Modelo Mental

**Replataformar destrava; ela não conserta.** É o primeiro passo que barateia todos os
seguintes.

## Quando Usar

- Infraestrutura obsoleta, cara, ou com fim de contrato.
- Como primeiro passo de um programa de modernização maior.
- Quando a entrega é limitada pela infraestrutura, não pelo código.
- Para destravar observabilidade e implantação frequente.
- Saída de datacenter com prazo.

## Quando Não Usar

**Esperando que resolva problemas de código.**

**Como destino final**, sem plano de continuação.

**Sem as adaptações mínimas.**

**Sem revisar o dimensionamento.**

**Sem período de operação em paralelo.**

**Quando o sistema será substituído em breve** por outro motivo.

## Alternativas

- **[Refatoração](/16-legacy-modernization/legacy-refactoring.md)** — quando o problema é o código.
- **[Reconstrução](/16-legacy-modernization/rebuilding.md)** — quando o modelo está errado.
- **[Substituição](/16-legacy-modernization/replacing.md)** — quando há produto de mercado.
- **Manter onde está** — quando a infraestrutura atende e não há prazo.

## Trade-offs

| Replataformar | Reconstruir |
|---|---|
| Semanas a meses | Anos |
| Risco baixo | Alto |
| Destrava operação | Resolve o modelo |
| Código intocado | Novo |
| Barato | Caro |

| Como está | Com adaptações mínimas |
|---|---|
| Mais rápido | Semanas a mais |
| Não aproveita a plataforma | Destrava escala e implantação |

## Modos de Falha

**Expectativa frustrada.** Esperava-se que resolvesse o código.

**Migração como está permanente.** A segunda fase nunca acontece.

**Custo maior.** Dimensionamento não revisto.

**Dependência oculta quebrada.** Um processo esquecido para de funcionar.

**Desempenho diferente.** O sistema estava afinado para o hardware antigo.

**Sem paralelo.** O antigo foi desligado antes de o novo ser validado.

## Erros Comuns

**Prometer que resolve problemas de manutenção.**

**Não fazer as adaptações mínimas.**

**Não revisar dimensionamento.**

**Não inventariar dependências ocultas.**

**Não planejar a segunda fase.**

**Desligar o antigo cedo demais.**

## Exemplo Real

Uma empresa de seguros precisava sair do datacenter em 14 meses, por fim de contrato.
Sessenta aplicações, várias com mais de dez anos.

A decisão foi replataformar como está — a única viável no prazo.

A execução, em ondas de complexidade crescente:

**Onda 1 — aplicações simples.** 22 aplicações, sem estado, com dependências claras. Três
meses.

**Onda 2 — aplicações com estado.** 26 aplicações. As adaptações mínimas foram feitas
aqui: configuração externalizada, registros na saída padrão, estado fora do disco,
desligamento gracioso.

Isso adicionou cerca de seis semanas ao total, e foi o que permitiu que essas aplicações
rodassem com mais de uma instância — o que várias nunca tinham conseguido.

**Onda 3 — as difíceis.** 12 aplicações com dependências obscuras. O inventário encontrou:
quatro processos agendados em máquinas sem dono, três integrações por diretório
compartilhado, e uma aplicação que dependia de um arquivo gerado manualmente uma vez por
mês.

Essa última só foi descoberta porque o mês virou durante o período de operação em
paralelo — e o processo falhou no ambiente novo.

**Redimensionamento.** A primeira estimativa de custo, com a capacidade replicada, era 40%
maior que o datacenter. A revisão com utilização real reduziu para 25% menor.

**Período em paralelo** de 60 dias por aplicação, com o antigo disponível.

Resultado: saída no prazo, com custo 25% menor e uma capacidade operacional que não
existia — esteira automatizada, ambientes reproduzíveis, telemetria centralizada.

E a segunda fase, planejada desde o início, começou no mês 16: refatoração e substituição
das aplicações que a análise de portfólio indicava. Ver
[portfólio de aplicações](/15-enterprise-architecture/application-portfolios.md).

A lição registrada: a replataforma não melhorou nenhuma aplicação. Ela tornou
possível melhorá-las — o que, antes, exigia uma janela de manutenção e um procedimento
manual para cada mudança.

## Conceitos Relacionados

- [Estratégias de Migração](/16-legacy-modernization/migration-strategies.md).
- [Cloud Native](/09-cloud-architecture/cloud-native.md) — a segunda fase.
- [Infraestrutura como Código](/14-devops-and-platform/infrastructure-as-code.md).
- [Ausência de Estado](/11-scalability/statelessness.md).

## Exercício Prático

Para um sistema legado do seu contexto, liste o que a infraestrutura atual impede: esteira,
ambientes, telemetria, implantação frequente.

Cada item é um custo que a replataforma removeria — e que encarece todo o resto.

## Perguntas de Entrevista

- O que replataformar entrega, e o que ela não entrega?
- Quais adaptações mínimas valem a pena, e por quê?
- Por que o custo frequentemente sobe?

## Para Aprofundar

- Morris, Kief. *Infrastructure as Code*. 2ª ed. O'Reilly, 2020.
- Newman, Sam. *Monolith to Microservices*. O'Reilly, 2019.
- Wiggins, Adam. *The Twelve-Factor App*, 2011.
