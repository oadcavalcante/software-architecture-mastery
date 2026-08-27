---
id: internal-developer-platforms
title: Plataformas Internas
sidebar_position: 11
description: A implementação do caminho pavimentado — autosserviço, com o que o desenvolvedor de fato precisa.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor define o escopo de uma plataforma interna e o modelo de
  interação que a torna usável.
prerequisites: [platform-engineering]
related: [platform-engineering, environment-management, ci-cd]
canonical_for: [plataforma interna de desenvolvimento, autosserviço, portal do desenvolvedor, catálogo de serviços]
content_version: 1
last_reviewed: 2026-08-28
---

# Plataformas Internas

## Visão Geral

Uma plataforma interna de desenvolvimento é a implementação concreta do caminho
pavimentado: um conjunto de capacidades que os times consomem por **autosserviço**, sem
depender de ninguém.

A palavra que define é *autosserviço*. Uma plataforma em que criar um ambiente exige
abrir um chamado não é plataforma — é uma equipe de infraestrutura com nome novo.

Ver [engenharia de plataforma](platform-engineering.md) para a disciplina; aqui, o que
ela entrega e como.

## Problema

Sem autosserviço, cada necessidade de infraestrutura vira uma fila:

```text
criar um serviço novo       chamado, dias
provisionar um banco        chamado, dias
adicionar uma credencial    chamado, horas
criar um ambiente de teste  chamado, disputa
publicar uma métrica        configuração manual
```

O tempo de espera não é o único custo. Ele muda o comportamento: as pessoas evitam criar
serviços, reutilizam o que não deveria ser reutilizado, e mantêm ambientes ocupados por
precaução.

## Conceitos Centrais

### O que uma plataforma entrega

```text
criação de serviço       modelo com esteira, telemetria e implantação prontos
ambientes                efêmeros, sob demanda
infraestrutura           banco, fila, cache — declarados pelo time, provisionados
                         pela plataforma
observabilidade          painéis e alertas padrão, sem configuração
segredos                 gerenciamento e injeção
implantação              estratégias prontas, com reversão
catálogo                 o que existe, quem é dono, como está
```

A primeira linha é o indicador de maturidade: **quanto tempo entre "quero um serviço
novo" e "ele está em produção com tudo configurado?"**

Em plataformas maduras, minutos. Sem plataforma, semanas.

### Autosserviço com limites

Autosserviço não significa ausência de controle. Significa que o controle está
**codificado**, não numa pessoa:

```text
política aplicada        limites de recurso, padrões de segurança, marcação obrigatória
aprovação onde necessário  para custo alto ou recurso sensível
padrões seguros           o caminho fácil já é o correto
auditoria                 quem criou o quê
```

A terceira linha é o mecanismo mais eficaz: se o modelo padrão já vem com limites,
telemetria, marcação e permissões mínimas, a conformidade acontece sem esforço.

Ver [menor privilégio](../10-security/least-privilege.md) e
[arquitetura de custo](../09-cloud-architecture/cost-architecture.md).

### O catálogo é o que torna a organização navegável

Um registro do que existe:

```text
serviços        nome, dono, repositório, documentação
dependências    o que chama o quê
estado          versão em produção, saúde, alvos de confiabilidade
infraestrutura  o que aquele serviço usa
```

Ele responde perguntas que, sem ele, exigem perguntar às pessoas: quem é dono disto?
quem depende deste serviço? o que quebra se eu mudar isto?

E ele só se mantém atualizado se for **derivado**, não preenchido à mão. Um catálogo que
depende de alguém atualizar está desatualizado em três meses.

Ver [propriedade do dado](../07-data-architecture/data-ownership.md) — é o mesmo
princípio aplicado a serviços.

### O modelo de interação decide a adoção

```text
portal web           descobrível, bom para ações ocasionais
interface de linha   rápida, boa para uso frequente
declaração no repositório  versionada, revisável, integrada ao fluxo
```

A terceira é a que sustenta o uso diário: o time declara o que precisa num arquivo, junto
com o código, e a plataforma converge. Ver
[infraestrutura como código](infrastructure-as-code.md).

O portal é complementar — para descobrir o que existe e para ações raras.

Plataformas que oferecem **apenas** portal produzem um comportamento previsível: as
pessoas automatizam por fora, com chamadas diretas à API, e a plataforma perde o
controle que o portal deveria dar.

### O que não colocar na plataforma

```text
regras de negócio       de cada time
decisões de arquitetura de cada serviço
abstração de tudo       o time precisa poder entender o que roda
casos únicos            que só um time precisa
```

O último merece atenção: uma plataforma que absorve toda exceção vira um produto com
centenas de parâmetros, impossível de manter.

A resposta correta para o caso único é a saída do caminho pavimentado — o time
implementa, e a plataforma continua simples.

### Depreciação precisa ser planejada

Uma plataforma evolui. Remover uma capacidade da qual doze times dependem exige o mesmo
cuidado de uma API pública:

```text
aviso com prazo longo
caminho de migração documentado, e de preferência automatizado
convivência das duas versões
acompanhamento de quem ainda usa
```

Ver [contratos de integração](../08-integration-architecture/integration-contracts.md).

Plataformas que quebram os times sem aviso perdem a confiança — e a recuperação leva
muito mais tempo que a quebra.

## Modelo Mental

**Autosserviço com padrões seguros.** O caminho fácil precisa ser o correto, e o
controle precisa estar no código, não numa pessoa.

## Quando Usar

- Muitos times criando e operando serviços.
- Filas de infraestrutura atrasando entregas.
- Necessidade de padronização por segurança ou conformidade.
- Onde o custo de aprender infraestrutura por time é alto.

## Quando Não Usar

**Sem autosserviço.** Chamado não é plataforma.

**Com poucos times.**

**Absorvendo toda exceção.**

**Apenas com portal**, sem interface programável.

**Com catálogo mantido à mão.**

**Sem plano de depreciação.**

## Alternativas

- **Repositórios modelo** — o mínimo viável: um exemplo com tudo configurado, copiado
  pelos times.
- **Bibliotecas e módulos compartilhados** — padrões em código, sem plataforma.
- **Plataforma comercial** — comprar. Ver
  [SaaS](../09-cloud-architecture/saas.md).
- **Time de habilitação** — capacitar em vez de abstrair.

A primeira é subestimada: um repositório modelo bem mantido, com esteira, telemetria e
implantação prontas, entrega boa parte do valor de uma plataforma com uma fração do
custo.

## Trade-offs

| Plataforma | Repositórios modelo |
|---|---|
| Atualização central | Cada cópia diverge |
| Time dedicado | Sem custo fixo |
| Abstração | Transparente |
| Governança embutida | Depende de disciplina |

| Declaração no repositório | Portal |
|---|---|
| Versionado e revisável | Ações pontuais |
| Integrado ao fluxo | Descobrível |
| Curva de aprendizado | Imediato |

## Modos de Falha

**Chamado disfarçado de plataforma.**

**Catálogo desatualizado.**

**Plataforma absorvendo exceções.** Complexidade crescente.

**Só portal.** Automação por fora.

**Depreciação sem aviso.** Times quebrados.

**Abstração impedindo diagnóstico.**

**Padrões inseguros no modelo.** O erro se multiplica por todos os serviços criados.

## Erros Comuns

**Não oferecer autosserviço real.**

**Catálogo preenchido à mão.**

**Não ter interface programável.**

**Aceitar todo caso especial.**

**Não planejar depreciação.**

**Não revisar os padrões do modelo** — eles se propagam a tudo que é criado.

## Exemplo Real

Uma empresa de tecnologia com 18 times tinha o seguinte tempo para colocar um serviço
novo em produção, com tudo configurado: **três semanas**.

O detalhamento:

```text
repositório e esteira      2 dias
infraestrutura             5 dias, via chamado
credenciais e segredos     3 dias, via chamado
telemetria e painéis       4 dias, configuração manual
alertas                    2 dias
revisão de segurança       5 dias
```

A consequência comportamental: os times evitavam criar serviços. Funcionalidades novas
eram enfiadas em serviços existentes, que cresceram além do que deveriam.

A plataforma foi construída em fases, priorizadas pelo tempo que cada etapa consumia:

**Fase 1 — criação de serviço.** Um modelo que gera repositório, esteira, implantação e
telemetria configurados. De 8 dias para 4 minutos.

**Fase 2 — infraestrutura por declaração.** O time declara num arquivo o que precisa —
banco, fila, cache — e a plataforma provisiona, com limites e marcação aplicados
automaticamente. De 5 dias para 10 minutos.

**Fase 3 — segredos por autosserviço**, com permissões derivadas do serviço.

**Fase 4 — padrões de segurança no modelo.** A revisão de 5 dias virou verificação
automatizada, porque o modelo já produzia o que a revisão exigia. Revisão humana passou a
ser exceção, para serviços que lidam com dado sensível.

**Catálogo derivado** da declaração e da esteira, sem preenchimento manual.

Tempo total: de três semanas para **cerca de 40 minutos**.

Dois problemas apareceram:

**Padrão inseguro propagado.** O modelo inicial tinha uma permissão ampla demais no papel
do serviço. Antes de ser corrigido, 30 serviços já tinham sido criados com ela. Passou a
haver revisão obrigatória de mudanças no modelo, com o mesmo rigor de mudança em
produção.

**Casos especiais.** Nos primeiros meses, a plataforma aceitou exceções de quatro times.
Cada uma virou um parâmetro. Ao chegar em 20 parâmetros, a manutenção ficou insustentável.
A política mudou: casos especiais saem do caminho pavimentado, com a plataforma
entregando a configuração gerada como ponto de partida.

O que a equipe registra: a mudança de comportamento foi maior que a de tempo. Com criação
de serviço em minutos, os times passaram a decompor adequadamente — e o problema de
serviços inchados, que era tratado como questão de arquitetura, era consequência do
atrito.

## Conceitos Relacionados

- [Engenharia de Plataforma](platform-engineering.md) — a disciplina.
- [Gestão de Ambientes](environment-management.md).
- [Infraestrutura como Código](infrastructure-as-code.md).
- [Menor Privilégio](../10-security/least-privilege.md) — os padrões do modelo.

## Exercício Prático

Cronometre quanto tempo leva, no seu contexto, colocar um serviço novo em produção com
esteira, telemetria, alertas e infraestrutura.

O número explica boa parte das decisões de arquitetura que o seu time toma.

## Perguntas de Entrevista

- Por que autosserviço é o que define uma plataforma?
- Por que o catálogo precisa ser derivado?
- Por que absorver casos especiais degrada a plataforma?

## Para Aprofundar

- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
- Bottcher, Evan. *What I Talk About When I Talk About Platforms*, 2018.
- Fowler, Martin. *Developer Effectiveness*, 2021.
