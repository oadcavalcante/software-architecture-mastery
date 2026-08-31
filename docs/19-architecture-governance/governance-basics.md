---
id: governance-basics
title: Fundamentos de Governança
sidebar_position: 1
description: Orientar a decisão no momento em que ela é tomada, em vez de inspecioná-la depois.
doc_type: concept
level: 6
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor escolhe o ponto de intervenção de um mecanismo de governança a
  partir do risco que ele endereça, e não do organograma.
prerequisites: [enterprise-governance]
related: [governance-review, fitness-functions-governance, governance-pathologies]
canonical_for: [mecanismo de governança, ponto de intervenção, custo de coordenação, governança preventiva]
content_version: 1
last_reviewed: 2026-08-29
---

# Fundamentos de Governança

## Visão Geral

Governança de arquitetura é o conjunto de mecanismos pelos quais uma organização mantém
coerência entre decisões tomadas por pessoas diferentes, em momentos diferentes, sem
coordenação direta.

A definição contém o problema inteiro: **as decisões são distribuídas, e a coerência é
desejada**. Centralizar as decisões resolve a coerência e destrói a velocidade.
Descentralizar sem mecanismo resolve a velocidade e destrói a coerência.

O que distingue governança que funciona é uma escolha estrutural: **onde ela intervém**.

```text
antes da decisão   orienta quem decide, no momento em que decide
durante            acompanha, com quem tem contexto
depois             inspeciona o que já foi feito
```

Quase toda governança ruim intervém no terceiro ponto. Quase toda governança boa
intervém no primeiro.

Ver [governança corporativa](/15-enterprise-architecture/enterprise-governance.md) para
o desenho do fluxo em escala organizacional; aqui o foco é o mecanismo em si.

## Problema

A degeneração é previsível e tem sempre a mesma forma. Alguém identifica um problema real —
seis formas de autenticação, quatro filas diferentes, uma decisão de segurança tomada sem
contexto. A resposta institucional é criar um ponto de verificação.

```text
mês 1    "desenhos passam pelo comitê antes de implementar"
mês 4    a fila do comitê tem três semanas
mês 8    times levam desenhos já implementados, para aprovação formal
mês 14   o comitê aprova 97% do que recebe
mês 20   ninguém consegue explicar o que o comitê evita
```

O comitê não falhou por incompetência. Ele falhou porque intervém **depois** que a decisão
foi tomada, e a única alavanca que sobra nesse ponto é dizer não a um trabalho já feito —
o que é caro demais para ser usado, e por isso não é usado.

E há um custo simétrico e menos visível: sem nenhum mecanismo, cada time redescobre as
mesmas lições, e as caras são redescobertas por incidente.

## Conceitos Centrais

### Governança é um problema de custo de coordenação

Toda organização enfrenta a mesma tensão:

```text
autonomia total     velocidade alta, divergência alta, retrabalho alto
coordenação total   coerência alta, velocidade baixa, decisão distante do contexto
```

Nenhum extremo funciona, e o ponto ótimo não é o meio — ele varia por **classe de
decisão**. Uma decisão que só afeta um time deve ser dele; uma que fixa um formato de dado
consumido por doze sistemas não pode ser.

O erro comum é aplicar o mesmo grau de coordenação a todas as decisões. Isso produz ou
gargalo em tudo, ou divergência em tudo.

Ver [níveis de arquitetura](/15-enterprise-architecture/architecture-levels.md).

### Ponto de intervenção

O mesmo objetivo pode ser perseguido em momentos muito diferentes, com custos muito
diferentes:

```text
objetivo: "todo serviço exposto exige autenticação"

no ambiente      a malha rejeita tráfego não autenticado — impossível errar
no gabarito      o serviço já nasce com autenticação configurada
na esteira       a verificação falha se faltar
na revisão       alguém percebe e comenta
no comitê        alguém percebe semanas depois
na auditoria     alguém percebe meses depois
```

As opções são ordenadas por custo crescente e eficácia decrescente. E a diferença não é
marginal — as duas primeiras tornam o erro **impossível**, e não apenas detectável.

Escolher o ponto mais cedo viável é a decisão de maior alavancagem em governança.

### Prevenir, detectar, corrigir

```text
prevenir   o caminho errado não existe        gabarito, plataforma, ambiente
detectar   o erro aparece rápido              verificação na esteira, função de aptidão
corrigir   o erro é encontrado e remediado    revisão, auditoria, incidente
```

Uma governança madura tem os três, em proporção: a maior parte prevenida, uma parte
detectada, uma fração pequena corrigida. Uma governança degenerada tem quase tudo no
terceiro nível — que é o mais caro e o mais tarde.

Ver [engenharia de plataforma](/14-devops-and-platform/platform-engineering.md): o
caminho pavimentado é governança preventiva com outro nome.

### Proporcionalidade ao risco

```text
decisão reversível numa tarde        nenhum mecanismo
decisão custosa de reverter          orientação disponível, registro
decisão irreversível na prática      revisão antes, com quem responde pelo risco
decisão com risco regulatório        verificação obrigatória
```

Aplicar o mecanismo mais pesado a decisões de baixo risco é o padrão que mata governança:
ele consome a paciência da organização em casos que não importam, e a paciência acaba
justamente quando um caso importante aparece.

### Governança precisa ter dono e custo declarado

Um mecanismo sem dono não é ajustado nem removido. E um mecanismo sem custo medido parece
gratuito, o que faz a organização acumular mecanismos indefinidamente.

```text
o que este mecanismo previne?
quantas vezes ele pegou algo nos últimos 12 meses?
quanto atraso ele adiciona, em média?
quem responde por ele?
o que aconteceria se ele fosse removido?
```

A quarta e a quinta perguntas são as que raramente têm resposta. Ver
[medição](/19-architecture-governance/measuring-governance.md).

### Orientar é diferente de aprovar

```text
aprovar   decide por outro, depois do trabalho, com menos contexto
orientar  ajuda quem decide, antes do trabalho, com mais experiência
```

A diferença aparece na assimetria de informação: quem aprova tem menos contexto sobre o
problema específico e mais sobre o histórico da organização. Usar essa segunda vantagem
como conselho é útil; usá-la como veto desperdiça a primeira.

Ver [revisão](/19-architecture-governance/governance-review.md).

### Governança se aplica também a si mesma

Um mecanismo é uma decisão arquitetural: tem contexto, alternativas, consequências e
validade.

Registrá-lo como [ADR](/18-architecture-decisions/index.md), com sinal de alerta e
revisão periódica, é o que impede que mecanismos criados para um problema de 2021
continuem cobrando pedágio em 2026 sobre um problema que não existe mais.

## Modelo Mental

**Mova a intervenção para o mais cedo possível.** No limite, a governança desaparece dentro
da plataforma — e um caminho errado que não existe não precisa ser inspecionado.

## Quando Usar

- Quando decisões independentes produzem divergência com custo mensurável.
- Quando há risco regulatório ou de segurança que não pode ser delegado.
- Quando lições caras estão sendo redescobertas por times diferentes.
- Quando a organização passa de um tamanho em que todos se conhecem.

## Quando Não Usar

**Uniformemente para todas as decisões.**

**Como comitê de aprovação de desenho.**

**Sem dono e sem custo medido.**

**Em organizações pequenas**, onde a conversa resolve — mecanismo formal é custo puro.

**Para problemas que a plataforma resolveria melhor.**

**Sem prazo de revisão** — mecanismos são permanentes por omissão.

## Alternativas

- **Plataforma e gabaritos** — governança embutida, sem processo.
- **[Funções de aptidão](/19-architecture-governance/fitness-functions-governance.md)** — verificação contínua e
  automática.
- **Comunidade de prática** — coerência por convergência voluntária, sem autoridade.
- **Nada, com registro** — só ADRs, deixando a coerência emergir.

A primeira é quase sempre superior quando aplicável, e a terceira funciona melhor do que se
espera em organizações com cultura técnica forte.

## Trade-offs

| Intervenção cedo | Tarde |
|---|---|
| Barata e eficaz | Cara e fraca |
| Exige investimento em plataforma | Só exige processo |
| Difícil de contornar | Contornável |

| Autonomia | Coordenação |
|---|---|
| Velocidade, contexto local | Coerência, reuso |
| Divergência | Gargalo |
| Retrabalho entre times | Decisão distante do problema |

## Modos de Falha

**Intervenção tardia.** A única alavanca é vetar trabalho pronto, e ela não é usada.

**Mecanismo uniforme.** Consome paciência em casos irrelevantes.

**Sem dono.** Nunca é ajustado nem removido.

**Sem custo medido.** A organização acumula mecanismos.

**Conformidade aparente.** Aprovação de decisões já implementadas.

**Governança sem validade.** Resolve um problema de cinco anos atrás.

## Erros Comuns

**Criar um comitê** como primeira resposta a um problema de coerência.

**Não perguntar qual seria o ponto de intervenção mais cedo.**

**Confundir governança com autoridade** — o mecanismo é o meio, não o poder.

**Não medir o atrito** que o mecanismo introduz.

**Não registrar o mecanismo como decisão**, com condição de revisão.

## Exemplo Real

Uma empresa de serviços financeiros com 340 engenheiros tinha um comitê de arquitetura que
revisava todo projeto acima de um limite de esforço. A fila era de 2 a 4 semanas.

Uma revisão do próprio mecanismo, feita a pedido da diretoria de engenharia, mediu 18 meses
de operação:

```text
projetos submetidos                          214
aprovados sem alteração                      186 (87%)
aprovados com alteração menor                 21
alterados de forma substantiva                 5
rejeitados                                     2
tempo médio de espera                     17 dias
tempo agregado de espera                ~10 anos-pessoa de calendário
```

Os cinco casos com alteração substantiva foram examinados um a um. Em quatro deles, o
problema apontado era de **segurança** ou de **formato de dado compartilhado**. Em nenhum
dos cinco a questão era de desenho interno do sistema.

E os dois rejeitados tinham sido implementados de qualquer forma, com exceção concedida
depois.

A reformulação foi feita pelo critério de ponto de intervenção:

**Segurança movida para o ambiente.** Autenticação entre serviços passou a ser imposta pela
malha; um serviço sem identidade válida não recebe tráfego. Deixou de ser assunto de
revisão. Ver [zero trust](/10-security/zero-trust.md).

**Formatos compartilhados movidos para a esteira.** Esquemas de evento e contratos de API
passaram a ser verificados automaticamente contra o registro central, com quebra de
compatibilidade falhando a construção. Ver
[evolução de esquema](/08-integration-architecture/schema-evolution.md).

**Comitê extinto**, substituído por dois mecanismos:

- **Consulta voluntária**, sem fila e sem aprovação — qualquer time pode pedir uma hora com
  dois arquitetos, cedo, enquanto o desenho é maleável.
- **Revisão obrigatória apenas para três classes**: decisões que fixam formato de dado
  consumido por outros, decisões com implicação regulatória, e decisões de custo
  irreversível acima de um limite.

**Gabaritos de serviço** com autenticação, monitoração, rastreamento e política de
repetição já configurados. Ver
[engenharia de plataforma](/14-devops-and-platform/platform-engineering.md).

Vinte meses depois:

```text
decisões sob revisão obrigatória          31 (contra 214)
tempo médio de espera                      3 dias
consultas voluntárias                     142
incidentes com causa em divergência
  de formato de dado                       0 (contra 7 no período anterior)
adoção de gabarito em serviços novos      94%
```

O dado que a equipe considera decisivo: as consultas voluntárias superaram em quatro vezes
o volume da revisão obrigatória. Times procuram orientação quando ela é barata, cedo e não
tem poder de veto.

A leitura que a equipe faz: o comitê nunca foi o problema. O problema era que ele intervinha no
único ponto em que a única ação disponível era cara demais para ser tomada.

## Conceitos Relacionados

- [Governança Corporativa](/15-enterprise-architecture/enterprise-governance.md) — o
  fluxo em escala.
- [Funções de Aptidão](/19-architecture-governance/fitness-functions-governance.md) — a intervenção automatizada.
- [Patologias](/19-architecture-governance/governance-pathologies.md) — os modos de degeneração.
- [Engenharia de Plataforma](/14-devops-and-platform/platform-engineering.md).

## Exercício Prático

Pegue um mecanismo de governança do seu contexto e pergunte: qual é o ponto de intervenção
mais cedo em que este objetivo poderia ser perseguido?

Se a resposta for "no ambiente" ou "no gabarito", o mecanismo atual está caro demais.

## Perguntas de Entrevista

- Por que um comitê que aprova 90% do que recebe não está funcionando?
- Qual a diferença entre governança preventiva, detectiva e corretiva?
- Por que aplicar o mesmo mecanismo a todas as decisões é o erro mais caro?

## Para Aprofundar

- Ford, Neal et al. *Building Evolutionary Architectures*. 2ª ed. O'Reilly, 2022.
- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
- Forsgren, Nicole et al. *Accelerate*. IT Revolution, 2018.
