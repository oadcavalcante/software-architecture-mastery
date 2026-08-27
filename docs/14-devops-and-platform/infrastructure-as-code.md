---
id: infrastructure-as-code
title: Infraestrutura como Código
sidebar_position: 2
description: Declarar o ambiente em vez de configurá-lo — e o desvio que aparece quando alguém mexe à mão.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor declara infraestrutura de forma reprodutível e detecta desvio
  antes que ele vire incidente.
prerequisites: [devops-and-platform]
related: [environment-management, ci-cd, blue-green]
canonical_for: [infraestrutura como código, desvio de configuração, estado declarado, ambiente reprodutível]
content_version: 1
last_reviewed: 2026-08-28
---

# Infraestrutura como Código

## Visão Geral

Infraestrutura como código é declarar o ambiente desejado em arquivos versionados, e
deixar uma ferramenta convergir a realidade para essa declaração.

O ganho não é automação — é **reprodutibilidade**: o ambiente pode ser recriado do zero,
igual, quantas vezes for preciso.

E, com ela, vêm revisão, histórico, e a capacidade de responder "por que isto está
assim?" consultando o repositório em vez de perguntar a alguém.

## Problema

Infraestrutura criada pelo console é rápida e produz um ambiente que ninguém sabe
reconstruir.

O sintoma aparece tarde:

```text
"por que esta regra existe?"        ninguém sabe
"conseguimos recriar isto?"          talvez
"produção e homologação são iguais?" não
"o que mudou ontem?"                 não há registro
```

Ver [IaaS](../09-cloud-architecture/iaas.md). O problema não é a criação inicial — é
tudo o que vem depois.

## Conceitos Centrais

### Declarativo, não imperativo

```text
imperativo   "crie uma instância, depois configure a rede, depois..."
declarativo  "o ambiente deve ter isto; convirja para lá"
```

A diferença prática: o declarativo é **idempotente** — aplicar duas vezes produz o mesmo
resultado — e permite calcular a diferença entre o desejado e o real antes de agir.

Ver [Kubernetes](../09-cloud-architecture/kubernetes.md), que aplica o mesmo princípio a
contêineres.

Isso muda a operação: em vez de executar passos, altera-se a declaração e revisa-se o
plano de convergência antes de aplicá-lo.

### Desvio de configuração é o inimigo

Alguém altera algo pelo console — durante um incidente, para testar, por conveniência. A
realidade passa a divergir da declaração.

As consequências:

```text
a próxima aplicação desfaz a alteração    quebrando o que dependia dela
ou a ferramenta erra                       porque o estado real não é o esperado
o ambiente deixa de ser reproduzível
```

O que sustenta a ausência de desvio:

**Detecção contínua.** Comparar o real com o declarado periodicamente e alertar.

**Acesso restrito.** Alteração manual em produção exige permissão elevada e temporária.
Ver [menor privilégio](../10-security/least-privilege.md).

**Caminho fácil.** Se alterar pela declaração leva 40 minutos e pelo console leva 2, as
pessoas vão pelo console. O atrito é o que produz o desvio.

A terceira é a que decide. Times que tornam a declaração o caminho mais rápido não
precisam proibir o outro.

### O estado é um artefato crítico

A ferramenta mantém um registro do que ela criou — o estado. Perdê-lo significa que ela
não sabe mais o que gerencia.

```text
armazenamento remoto   nunca local, nunca no repositório
versionado             para recuperar de corrupção
bloqueado              duas aplicações simultâneas corrompem
cifrado                ele contém identificadores e, às vezes, segredos
```

O último ponto merece atenção: valores sensíveis que passam pela declaração acabam no
estado, em texto legível. Ver [segredos](../10-security/secrets.md).

### Modularizar, com moderação

A tentação de abstrair tudo em módulos genéricos produz camadas onde é difícil saber o
que é criado de fato.

```text
bom      módulo para o que se repete — um serviço padrão, uma rede padrão
ruim     módulo genérico com trinta parâmetros para servir a todos os casos
```

O critério: um módulo deve remover repetição real, não antecipar variação hipotética.

E módulos precisam ser versionados: um módulo compartilhado alterado sem versão muda o
comportamento de todos os ambientes que o usam, simultaneamente. Ver
[redundância](../12-reliability/redundancy.md) — é o mesmo problema de correlação.

### Aplicar em produção é implantação

A declaração de infraestrutura merece o mesmo tratamento que código de aplicação:

```text
revisão            outra pessoa olha
plano visível      o que vai mudar, antes de mudar
ambientes em ordem teste, homologação, produção
gradual            zona a zona, não tudo de uma vez
reversível         a declaração anterior está no histórico
```

A quarta linha é frequentemente ignorada, e é onde ocorrem os incidentes mais amplos:
uma mudança de infraestrutura aplicada simultaneamente a todas as zonas remove a
proteção que a redundância deveria dar.

### Nem tudo cabe

Alguns recursos não se declaram bem:

```text
dados                    migrações são outro problema
segredos                 gerenciador dedicado, referenciado
recursos de vida curta   criados e destruídos por aplicação
configuração de aplicação  variáveis e flags, não infraestrutura
```

Misturar dados ou segredos na declaração é a origem de vazamentos e de operações
destrutivas acidentais — uma remoção de recurso que apaga um banco junto.

Proteções contra exclusão em recursos com estado não são detalhe, são obrigatórias.

## Modelo Mental

**A declaração é a verdade; o ambiente é a consequência.** Desvio é a distância entre as
duas, e ela precisa ser medida.

## Quando Usar

- Praticamente sempre, para infraestrutura de nuvem.
- Onde ambientes precisam ser equivalentes.
- Onde a recriação precisa ser possível.
- Onde há auditoria sobre mudanças de infraestrutura.
- Para ambientes efêmeros. Ver
  [gestão de ambientes](environment-management.md).

## Quando Não Usar

**Misturando dados ou segredos na declaração.**

**Sem detecção de desvio.**

**Com módulos genéricos** que escondem o que é criado.

**Sem versionar módulos compartilhados.**

**Aplicando em todas as zonas de uma vez.**

**Sem proteção contra exclusão** em recursos com estado.

**Para um único servidor** que ninguém vai recriar — o custo não se paga.

## Alternativas

- **Ferramentas de configuração de servidor** — para o que roda dentro da máquina, em
  vez de os recursos de nuvem.
- **Imagens pré-construídas** — o ambiente vem pronto na imagem, e a infraestrutura só a
  instancia. Ver [contêineres na entrega](containers-in-delivery.md).
- **Interfaces de plataforma** — o desenvolvedor declara a intenção e a plataforma
  traduz. Ver
  [plataformas internas](internal-developer-platforms.md).

A última é a evolução natural em organizações grandes: nem todo time precisa escrever
infraestrutura.

## Trade-offs

| Declarado | Manual |
|---|---|
| Reproduzível | Não |
| Histórico e revisão | Nenhum |
| Mudança mais lenta | Imediata |
| Curva de aprendizado | Console familiar |
| Desvio detectável | Invisível |

| Módulos | Declaração direta |
|---|---|
| Sem repetição | Explícita |
| Abstração a entender | Direto |
| Mudança propaga | Isolada |

## Modos de Falha

**Desvio acumulado.** A declaração já não descreve a realidade.

**Estado perdido ou corrompido.**

**Aplicação simultânea.** Duas execuções corrompem o estado.

**Exclusão acidental.** Um recurso com dados removido pela convergência.

**Segredo no estado.**

**Módulo alterado sem versão.** Todos os ambientes mudam juntos.

**Aplicação em todas as zonas.** A redundância não protege.

## Erros Comuns

**Não detectar desvio.**

**Estado local ou no repositório.**

**Não bloquear execuções concorrentes.**

**Não proteger recursos com estado contra exclusão.**

**Módulos genéricos demais.**

**Tornar a declaração mais lenta que o console**, o que garante o desvio.

## Exemplo Real

Uma empresa de logística migrou a infraestrutura para declaração ao longo de um ano.
Ao fim, 90% dos recursos estavam declarados.

Um incidente revelou o que os outros 10% significavam.

Uma aplicação da declaração, em produção, removeu uma regra de rede que não estava
declarada — criada manualmente durante um incidente, oito meses antes, e nunca
incorporada.

A regra permitia o acesso de um parceiro. A integração parou por 5 horas, e o
diagnóstico foi lento porque ninguém sabia que a regra existia.

A investigação encontrou 34 recursos criados manualmente, nenhum documentado.

As mudanças:

**Detecção de desvio** diária, com relatório do que existe e não está declarado, e do que
está declarado e diverge. A primeira execução produziu a lista dos 34.

**Acesso ao console restrito** em produção, com elevação temporária e justificativa. Ver
[menor privilégio](../10-security/least-privilege.md).

**Caminho rápido.** A queixa das pessoas era legítima: aplicar uma mudança declarada
levava 25 minutos entre revisão, plano e aplicação. A esteira foi otimizada para 4
minutos, e o desvio praticamente parou — não por proibição, por conveniência.

**Proteção contra exclusão** em bancos, armazenamentos e recursos com estado. Uma
tentativa de removê-los pela convergência falha e exige remoção explícita da proteção.

**Aplicação por zona**, com observação entre elas. Uma mudança de rede aplicada a uma
zona não derruba as três.

**Módulos versionados**, encerrando a prática de alterar o módulo compartilhado e ver a
mudança propagar para todos os ambientes na próxima aplicação.

O que a equipe registra: a proibição de usar o console tinha sido tentada antes e
falhado. O que funcionou foi tornar o caminho declarado mais rápido — o desvio era
sintoma de atrito, não de indisciplina.

## Conceitos Relacionados

- [Gestão de Ambientes](environment-management.md).
- [Contêineres na Entrega](containers-in-delivery.md).
- [Blue-Green](blue-green.md) — o ambiente efêmero.
- [IaaS](../09-cloud-architecture/iaas.md).

## Exercício Prático

Compare o que existe na sua conta de nuvem com o que está declarado.

Os recursos que aparecem só na primeira lista são o seu desvio — e cada um é uma
surpresa esperando a próxima aplicação.

## Perguntas de Entrevista

- Por que declarativo permite calcular a diferença antes de agir?
- Por que desvio é sintoma de atrito e não de indisciplina?
- Por que aplicar a todas as zonas de uma vez anula a redundância?

## Para Aprofundar

- Morris, Kief. *Infrastructure as Code*. 2ª ed. O'Reilly, 2020.
- Humble, Jez; Farley, David. *Continuous Delivery*. Addison-Wesley, 2010.
- Burgess, Mark. *Promise Theory* — a base do modelo declarativo.
