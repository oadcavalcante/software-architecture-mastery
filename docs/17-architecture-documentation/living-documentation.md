---
id: living-documentation
title: Documentação Viva
sidebar_position: 12
description: Derivar do que já é verdade — a única forma de documentação que não desatualiza.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor sabe distinguir o que pode ser derivado do que precisa ser escrito,
  e monta a derivação onde ela se paga.
prerequisites: [documentation-principles]
related: [documentation-principles, documentation-standards, component-diagrams]
canonical_for: [documentação viva, documentação derivada, fonte única de verdade documental, diagrama como código]
content_version: 1
last_reviewed: 2026-08-29
---

# Documentação Viva

## Visão Geral

Toda documentação escrita à mão desatualiza. O problema não é disciplina — é que a
informação existe em dois lugares e nada obriga os dois a concordarem.

Documentação viva ataca a causa: **derivar a documentação do artefato que já é verdade**,
de modo que divergir seja impossível, e não apenas indesejável.

E a decisão central deste tema não é qual ferramenta usar. É **o que pode ser derivado e o
que não pode** — porque a maior parte do valor arquitetural está justamente no que a
máquina não sabe.

## Problema

O ciclo é conhecido:

```text
alguém escreve a documentação
o sistema muda
a documentação não muda
alguém confia nela e erra
a confiança cai
ninguém consulta
ninguém atualiza
```

E o remédio habitual — processo, lembrete, revisão obrigatória — combate o sintoma. Ele
depende de alguém fazer, toda vez, um trabalho que não dá retorno imediato a quem faz.

Ver [princípios de documentação](documentation-principles.md), onde a meia-vida da
documentação é o conceito correspondente.

## Conceitos Centrais

### O que pode ser derivado

```text
diagrama de implantação      do código de infraestrutura
diagrama de contêiner        de um manifesto de serviços
estrutura de componentes     do código
contratos de API             da especificação ou do código
esquema de dados             do banco
dependências entre serviços  do rastreamento distribuído
inventário de sistemas       do cadastro
matriz de quem chama quem    do service mesh ou dos registros
```

O padrão é claro: **estrutura é derivável**. O que existe, como se conecta, o que roda
onde — tudo isso está declarado em algum lugar executável.

Ver [rastreamento distribuído](../13-observability/distributed-tracing.md) para a última
categoria, que é a mais confiável de todas: ela mostra o que acontece, não o que se
declarou.

### O que não pode ser derivado

```text
por que a decisão foi tomada
que alternativas foram descartadas
que restrição moldou a escolha
o que se pretende mudar
o que se sabe que está errado
o que a fronteira significa em termos de negócio
para quem o sistema existe
```

Nada disso está no código. É **intenção**, e intenção só existe escrita.

Essa divisão é a mais útil do tema: derive a estrutura, escreva a intenção, e não tente
inverter. Ver [decisões de arquitetura](../18-architecture-decisions/index.md).

### Diagrama como código

Descrever diagramas em texto e renderizá-los é o meio-termo prático:

```text
versiona junto com o código
entra na revisão de código
diferenças são legíveis
o texto é útil mesmo sem renderizar
```

Não é derivação — o texto ainda é escrito à mão, e ainda pode divergir. O ganho está no
processo: um diagrama em texto no repositório é revisado junto com a mudança que o afeta,
e o gatilho é natural.

O trade-off é layout: renderizadores automáticos produzem disposições aceitáveis e
raramente ótimas. Para diagramas de sequência isso quase não incomoda; para estruturais
grandes, incomoda. Ver
[qualidade de diagrama](diagram-quality.md).

### Verificação em vez de geração

Uma alternativa mais barata e frequentemente melhor: manter a documentação escrita e
**verificar automaticamente que ela concorda com a realidade**.

```text
os contêineres citados no diagrama existem no cadastro?
os serviços implantados aparecem no diagrama?
os endpoints documentados respondem?
o dono declarado existe?
os links resolvem?
```

Isso preserva a curadoria — layout, ênfase, agrupamento — e elimina a divergência
silenciosa. Quando a verificação falha, uma pessoa decide o que corrigir: o documento ou o
sistema.

E às vezes a resposta é o sistema. Uma verificação que aponta um serviço implantado e não
documentado pode ter encontrado algo que não deveria estar rodando.

### Testes como documentação

Testes de aceitação escritos em linguagem de domínio descrevem comportamento e não podem
divergir, porque falham quando divergem.

```text
o que o sistema faz             legível no teste
sob quais condições             idem
o que acontece quando falha     idem
```

A limitação: testes descrevem comportamento, não estrutura nem intenção. Eles cobrem uma
fatia real e não substituem o resto. Ver
[testes de contrato](../08-integration-architecture/integration-contracts.md).

### O custo inicial é real

Derivação não é grátis:

```text
construir a extração        semanas
manter a ferramenta         contínuo
lidar com casos irregulares constante
resultado às vezes feio     sempre
```

O cálculo: derivação se paga onde a informação **muda com frequência** e é **consultada
com frequência**. Onde algum dos dois é baixo, escrever à mão e verificar é mais barato.

Este é o caso do diagrama de contexto — ele quase não muda, e derivá-lo seria construir
maquinaria para um problema que não existe. Ver
[diagramas de contexto](context-diagrams.md).

## Modelo Mental

**Derive a estrutura, escreva a intenção, verifique o resto.** O que a máquina sabe, a
máquina documenta.

## Quando Usar

- Para diagramas de implantação, onde a topologia já é declarada.
- Para contratos de API e esquemas de dados.
- Para inventários e dependências entre serviços.
- Para o nível de componente, o de meia-vida mais curta.
- Como verificação, em qualquer documentação escrita.

## Quando Não Usar

**Para justificativa e decisões** — não é derivável.

**Onde a informação muda pouco** — o custo não se paga.

**Quando o layout importa muito** e o gerado é ilegível.

**Sem alguém responsável pela ferramenta** — a ferramenta vira a nova dívida.

**Como substituto de escrever** — o resultado é documentação completa e sem sentido.

O último merece ênfase: uma organização que gera tudo e escreve nada tem diagramas
corretos e nenhuma explicação de por que o sistema é assim.

## Alternativas

- **Escrita com gatilho** — atualizar quando o evento correspondente ocorre. Ver
  [padrões de documentação](documentation-standards.md).
- **Verificação automática** — mais barata que geração, preserva curadoria.
- **Diagrama como código** — meio-termo, ganho de processo.
- **Aceitar o envelhecimento** com data visível — legítimo para o que muda pouco.

## Trade-offs

| Gerado | Escrito |
|---|---|
| Não pode divergir | Pode |
| Mostra o que existe | Mostra a intenção |
| Layout automático | Curado |
| Custo inicial alto | Custo contínuo |

| Geração | Verificação |
|---|---|
| Elimina a divergência | Detecta |
| Perde curadoria | Preserva |
| Caro de construir | Barato |
| Sempre atual | Atual ou vermelho |

## Modos de Falha

**Gerar tudo, escrever nada.** Estrutura correta, nenhuma intenção.

**Ferramenta sem dono.** Quebra e ninguém percebe.

**Diagrama gerado ilegível.** Sem agrupamento, com dezenas de nós.

**Derivar o que não muda.** Maquinaria sem retorno.

**Verificação que sempre falha.** Vira ruído e é ignorada.

**Fonte de derivação errada.** Derivar do que se declarou, não do que roda.

## Erros Comuns

**Tentar derivar justificativa.**

**Não distinguir estrutura de intenção.**

**Escolher a ferramenta antes de decidir o que derivar.**

**Não medir se o resultado é lido.**

**Ignorar verificação como opção mais barata.**

## Exemplo Real

Uma empresa com 180 serviços mantinha um portal de arquitetura com diagramas desenhados à
mão. A taxa de acerto medida numa amostragem foi de 34%.

A primeira tentativa foi gerar tudo. Um extrator lia o orquestrador, o service mesh e
os repositórios, e produzia diagramas automaticamente.

O resultado técnico funcionou. O resultado prático foi ruim:

```text
diagramas com 180 nós e 900 arestas
sem agrupamento por domínio
sem distinção entre chamada crítica e ocasional
nenhuma indicação de propósito
```

Os diagramas eram corretos e ilegíveis. O uso do portal caiu ainda mais.

A segunda tentativa separou por natureza da informação:

**Derivado** — inventário de serviços, dependências reais a partir do rastreamento,
topologia de implantação, contratos de API, esquemas de dados. Tudo atualizado
continuamente, disponível como consulta e não como diagrama gigante.

**Escrito e verificado** — diagramas de contexto e de contêiner por domínio, desenhados à
mão, com agrupamento e ênfase curados. Uma verificação diária compara os contêineres
desenhados com os serviços implantados e abre um alerta ao dono quando divergem.

**Escrito, sem verificação possível** — justificativas, ADRs, riscos, intenções de
evolução.

**Agrupamento por domínio** aplicado aos dados derivados: em vez de um diagrama de 180
nós, uma consulta que responde "de quem este domínio depende" com cinco a doze nós.

Os números, um ano depois:

```text
taxa de acerto dos diagramas escritos      34% → 89%
divergências detectadas por mês            média de 11, corrigidas em dias
serviços não documentados encontrados      7 (três deles não deveriam existir)
uso do portal                              2,4× o anterior
```

Os sete serviços encontrados pela verificação foram um resultado não previsto: três eram
restos de experimentos que ainda rodavam, consumindo recursos e mantendo acesso a dados de
produção.

A geração completa falhou não por ser tecnicamente errada, mas por
ignorar que curadoria é conteúdo. O agrupamento por domínio e a ênfase em certas relações
são informação arquitetural — e são exatamente o que a extração automática não tem como
saber.

## Conceitos Relacionados

- [Princípios de Documentação](documentation-principles.md) — a meia-vida.
- [Padrões de Documentação](documentation-standards.md) — os gatilhos.
- [Diagramas de Componente](component-diagrams.md) — onde a geração mais se paga.
- [Rastreamento Distribuído](../13-observability/distributed-tracing.md) — a fonte mais
  confiável de dependências.

## Exercício Prático

Liste os artefatos de documentação do seu sistema em duas colunas: o que poderia ser
derivado de algo que já existe, e o que só existe porque alguém escreveu.

A segunda coluna é o que merece o esforço humano. A primeira é candidata a automação ou
verificação.

## Perguntas de Entrevista

- Que tipo de informação nunca pode ser derivada, e por quê?
- Por que verificação costuma ser melhor negócio que geração?
- Como uma documentação gerada pode ser 100% correta e inútil?

## Para Aprofundar

- Martraire, Cyrille. *Living Documentation*. Addison-Wesley, 2019.
- Adzic, Gojko. *Specification by Example*. Manning, 2011.
- Brown, Simon. *Software Architecture for Developers*. Leanpub, 2015.
