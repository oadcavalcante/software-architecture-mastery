---
id: documentation-standards
title: Padrões de Documentação
sidebar_position: 11
description: A política que faz documentação existir sem virar burocracia.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor define uma política mínima de documentação com dono, gatilho e
  verificação, sem transformá-la em processo de conformidade.
prerequisites: [documentation-principles]
related: [documentation-principles, architecture-descriptions, living-documentation]
canonical_for: [padrão de documentação, gatilho de documentação, dono do documento, gabarito]
content_version: 1
last_reviewed: 2026-08-29
---

# Padrões de Documentação

## Visão Geral

Documentação boa não acontece por boa vontade. Ela acontece quando três coisas estão
definidas: **o que é obrigatório, quem é dono, e quando precisa ser atualizado**.

A dificuldade é que a política tende a um de dois extremos. Sem política, cada time
documenta de um jeito e a maioria não documenta. Com política pesada, produz-se volume que
ninguém lê — ver
[princípios de documentação](documentation-principles.md).

O ponto que funciona é estreito: **poucas obrigações, com dono e gatilho, verificadas
automaticamente onde possível.**

## Problema

Sem padrão, os sintomas são previsíveis:

```text
cada sistema documentado em lugar diferente
formatos incompatíveis, impossível comparar
nenhum jeito de saber se algo está atualizado
documentos sem dono, que ninguém pode corrigir
a mesma informação em três lugares, divergente
```

Com padrão pesado, os sintomas são outros e piores:

```text
gabaritos de 40 seções preenchidos com texto genérico
documentação produzida na véspera da aprovação
conformidade verificada por existência, não por conteúdo
times que documentam para o processo, não para leitores
```

O segundo conjunto é mais difícil de corrigir, porque o processo declara sucesso.

## Conceitos Centrais

### O conjunto mínimo

A pergunta certa não é "o que seria bom documentar", e sim **"o que dói quando falta"**:

```text
como subir e rodar o sistema           dói em toda entrada de pessoa
o que ele faz e para quem              dói em toda conversa entre times
quem é o dono e como acionar           dói durante incidente
decisões arquiteturais                 dói quando quem decidiu sai
o que fazer quando falha               dói às três da manhã
```

Cinco itens. Uma política que exige mais que isso por padrão precisa justificar cada
acréscimo.

### Dono nomeado, não coletivo

```text
"o time X é dono"          ninguém atualiza
"a pessoa Y é dona"        alguém atualiza
"o time X, papel Z"        funciona, sobrevive a saídas
```

A terceira forma é a que resiste: o dono é um papel dentro de um time, e o papel é ocupado
por alguém nomeado a cada momento.

Documento sem dono é documento que apodrece. Ver
[propriedade e responsabilidade](../19-architecture-governance/index.md).

### Gatilho, não cadência

Revisão por calendário produz revisão superficial: alguém abre, olha, marca como revisado.

Gatilhos por evento funcionam melhor:

```text
contêiner novo ou removido    → atualizar diagrama de contêiner
mudança de topologia          → atualizar implantação
decisão arquitetural          → nova ADR
incidente com causa estrutural → revisar a descrição
integração nova               → atualizar contexto
```

A cadência entra como rede de segurança — uma revisão anual para o que nenhum gatilho
pegou — e não como mecanismo principal.

### Gabaritos ajudam se puderem ser encurtados

Um gabarito reduz a barreira de começar e a variação entre sistemas. Ele vira problema
quando preenchê-lo integralmente é obrigatório.

```text
seções obrigatórias        poucas, e verificáveis por conteúdo
seções opcionais           declaráveis como não aplicáveis
tamanho sugerido           explícito, com limite superior
exemplo preenchido         vale mais que instruções
```

O terceiro item é incomum e eficaz: declarar que uma seção deve ter até 300 palavras
comunica a expectativa melhor que qualquer orientação.

### Documentação junto do código

Onde a documentação vive determina se ela é atualizada:

```text
no repositório do sistema     revisada junto com o código
em wiki separado              atualizada quando alguém lembra
em sistema de gestão          atualizada na véspera da auditoria
```

Documentação no repositório entra na revisão de código, é versionada com o sistema, e
pode ser verificada automaticamente. É a escolha padrão para tudo que é técnico.

O que precisa ficar fora do repositório: o que precisa ser lido por quem não tem acesso a
ele, e o que precisa sobreviver ao arquivamento do repositório.

### Verificação automática do que dá

Uma política sem verificação vira opcional. E verificação manual não escala.

```text
o documento existe?
tem dono declarado?
foi tocado nos últimos N meses?
os links apontam para algo que existe?
o diagrama referencia contêineres que ainda existem?
as seções obrigatórias têm conteúdo além do gabarito?
```

Nem tudo é verificável, e o que é deve ser. O último item é o mais valioso e o menos
implementado: detectar texto de gabarito não substituído pega a maior parte do
preenchimento por dever.

Ver [documentação viva](living-documentation.md).

### Exigência proporcional à criticidade

Uma política uniforme trata um serviço interno usado por três pessoas como um sistema de
pagamento. O resultado previsível é que ambos recebem o mesmo esforço — que é o mínimo
possível.

```text
criticidade alta    descrição consolidada, implantação, runbook, revisão anual
criticidade média   os cinco artefatos mínimos
criticidade baixa   README com propósito, dono e como rodar
```

O escalonamento faz mais que economizar esforço: ele comunica prioridade. Quando tudo é
obrigatório, nada é importante, e os times distribuem atenção uniformemente entre coisas
que não merecem atenção uniforme.

E ele exige uma classificação de criticidade que já deveria existir por outros motivos —
recuperação de desastre, resposta a incidente, controle de acesso.

## Modelo Mental

**Pouco, com dono e gatilho, verificado.** Cada obrigação a mais precisa pagar por si.

## Quando Usar

- Em organizações com mais de alguns times.
- Quando a rotatividade torna o conhecimento tácito arriscado.
- Em ambientes regulados.
- Quando incidentes já foram agravados por falta de documentação.

## Quando Não Usar

**Como gabarito longo obrigatório.**

**Verificando existência em vez de conteúdo.**

**Sem dono nomeado.**

**Com cadência fixa como mecanismo principal.**

**Uniforme para sistemas de criticidade diferente** — um sistema interno de uso ocasional e
um sistema crítico não merecem a mesma exigência.

**Em uma equipe pequena com um sistema** — a política é conversa.

## Alternativas

- **Convenção informal** — funciona até uns três times.
- **Exemplo de referência** — apontar um sistema bem documentado como padrão a imitar
  costuma funcionar melhor que uma norma escrita.
- **Geração automática** — elimina a política onde é aplicável. Ver
  [documentação viva](living-documentation.md).
- **Revisão por pares** — o padrão emerge da revisão em vez de ser prescrito.

A segunda é a mais subestimada: "documente como o sistema de pagamentos" comunica mais
rápido que doze páginas de norma.

## Trade-offs

| Padrão rígido | Flexível |
|---|---|
| Comparável | Ajustado ao contexto |
| Convida ao preenchimento por dever | Varia demais |
| Verificável | Difícil de auditar |

| No repositório | Central |
|---|---|
| Atualizado junto com o código | Encontrável por qualquer um |
| Verificável na esteira | Independente do repositório |
| Some com o repositório | Sobrevive |

## Modos de Falha

**Gabarito longo.** Texto genérico como resposta racional.

**Verificação por existência.** Documento vazio passa.

**Sem dono.** Nada é atualizado.

**Wiki separado.** Divergência silenciosa.

**Exigência uniforme.** Sistemas irrelevantes com a mesma carga dos críticos.

**Sem gatilho.** Documentação atualizada uma vez por ano, mal.

## Erros Comuns

**Começar pelo gabarito** em vez de pelas perguntas que doem.

**Confundir política com processo de aprovação.**

**Não permitir "não se aplica".**

**Colocar tudo em wiki.**

**Não verificar nada automaticamente.**

**Não medir uso** — sem isso, não se sabe o que cortar.

## Exemplo Real

Uma empresa com 40 times tinha documentação em três lugares: wiki corporativo,
repositórios e uma ferramenta de gestão de arquitetura. Nenhum era completo, os três
divergiam, e ninguém sabia qual consultar.

Um levantamento encontrou:

```text
sistemas com alguma documentação             38 de 52
com documentação em mais de um lugar         31
com versões divergentes entre os lugares     24
com dono identificável                       11
atualizada nos últimos 12 meses              16
```

A política nova foi deliberadamente curta — uma página:

**Cinco artefatos obrigatórios por sistema**, todos no repositório do próprio sistema:
README com propósito e como rodar, diagrama de contexto, diagrama de contêiner, ADRs, e
runbook de incidente.

**Dono como papel**, declarado em um arquivo de metadados no repositório, com integração ao
cadastro de times — o que tornou o dono verificável e resistente a saídas.

**Gatilhos declarados** e ligados à revisão de código: mudanças em código de
infraestrutura exigem revisão do diagrama de implantação; contêiner novo exige revisão do
de contêiner.

**Wiki descontinuado** para documentação técnica de sistema. Conteúdo migrado ou
arquivado, com um redirecionamento apontando para o repositório — o passo que mais gerou
resistência e o que mais resolveu divergência.

**Verificação na esteira**: os cinco artefatos existem, têm dono válido, os links resolvem,
e o texto do gabarito foi substituído. Falha em nenhum bloqueia entrega; todos aparecem em
um painel por time.

**Exigência escalonada por criticidade**: sistemas críticos acrescentam descrição
consolidada e diagrama de implantação derivado; sistemas de baixa criticidade ficam nos
cinco.

Nove meses depois:

```text
sistemas com os cinco artefatos              49 de 52
com dono válido                              52
atualizados nos últimos 6 meses              44
com divergência entre lugares                 0 (só existe um lugar)
```

O que a equipe registra: a decisão mais impopular — desligar o wiki — foi a mais efetiva.
Enquanto existiam dois lugares válidos, a divergência era inevitável, e nenhuma política
de qualidade resolvia isso.

E uma que não funcionou: a primeira versão da política tinha nove artefatos obrigatórios.
Os quatro cortados eram os que ninguém consultava, e sua remoção elevou a taxa de
conformidade dos cinco restantes.

## Conceitos Relacionados

- [Princípios de Documentação](documentation-principles.md).
- [Documentação Viva](living-documentation.md) — o que pode ser gerado.
- [Descrições de Arquitetura](architecture-descriptions.md).
- [Governança](../19-architecture-governance/index.md) — onde a política vive.

## Exercício Prático

Liste os artefatos de documentação obrigatórios na sua organização e, para cada um,
responda: quem consultou isso nos últimos seis meses?

Os que não tiverem resposta são candidatos a corte, e cortá-los melhora a conformidade dos
que ficam.

## Perguntas de Entrevista

- Por que gatilho por evento funciona melhor que cadência fixa?
- Por que permitir "não se aplica" aumenta a qualidade da documentação?
- Que problema dois lugares válidos de documentação criam inevitavelmente?

## Para Aprofundar

- Clements, Paul et al. *Documenting Software Architectures*. 2ª ed. Addison-Wesley, 2010.
- Bloch, Andrew et al. *Docs as Code* — write-the-docs.readthedocs.io.
- Forsgren, Nicole et al. *Accelerate*. IT Revolution, 2018.
