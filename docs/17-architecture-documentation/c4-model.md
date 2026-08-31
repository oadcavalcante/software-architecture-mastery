---
id: c4-model
title: Modelo C4
sidebar_position: 2
description: Quatro níveis de zoom para diagramar software — e por que os dois primeiros bastam na maioria dos casos.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor escolhe o nível de zoom adequado ao leitor e evita misturar
  abstrações num mesmo diagrama.
prerequisites: [documentation-principles]
related: [context-diagrams, container-diagrams, component-diagrams]
canonical_for: [modelo C4, nível de abstração, zoom de diagrama]
content_version: 1
last_reviewed: 2026-08-29
---

# Modelo C4

## Visão Geral

O modelo C4 organiza diagramas de software em **quatro níveis de zoom**, cada um com um
público e uma pergunta:

```text
contexto    o sistema e o mundo em volta — para qualquer pessoa
contêiner   as peças executáveis e como se comunicam — para técnicos
componente  o interior de uma peça — para quem vai mexer nela
código      classes e relações — raramente vale desenhar
```

A contribuição do modelo não é a notação. É a disciplina de **um nível de abstração por
diagrama** — que é onde a maioria dos diagramas de arquitetura falha.

## Problema

O diagrama típico de arquitetura mistura abstrações:

```text
uma caixa é um sistema inteiro
outra é um serviço
outra é uma biblioteca
outra é uma tabela de banco
outra é um conceito de negócio
```

O resultado é ilegível para todo mundo: técnico demais para quem não é técnico, e
impreciso demais para quem é.

E ele não tem leitor definido — foi desenhado para "mostrar a arquitetura", não para
alguém com uma pergunta. Ver
[princípios de documentação](/17-architecture-documentation/documentation-principles.md).

## Conceitos Centrais

### Um nível por diagrama

A regra central: **todas as caixas de um diagrama são do mesmo tipo**.

```text
contexto    todas as caixas são sistemas ou pessoas
contêiner   todas são unidades executáveis ou de armazenamento
componente  todas são agrupamentos dentro de um contêiner
```

Isso força a escolha do público. E torna o diagrama legível, porque quem lê sabe o que
uma caixa significa sem precisar interpretar caso a caso.

### O que é um contêiner

O termo é o que mais causa confusão, porque ele não significa contêiner de virtualização.

Um contêiner, no modelo, é **algo que executa ou armazena**:

```text
sim   uma aplicação web, uma API, um aplicativo móvel, um banco de dados,
      um sistema de arquivos, uma fila, um processo em segundo plano
não   uma biblioteca, um módulo, uma classe, um conceito
```

O teste: **é uma unidade separadamente implantável ou um armazenamento?**

Ver [diagramas de contêiner](/17-architecture-documentation/container-diagrams.md).

### Os dois primeiros níveis cobrem a maior parte

```text
contexto    quase sempre vale — é o diagrama mais consultado
contêiner   quase sempre vale — responde "onde mexo"
componente  vale para sistemas grandes, e envelhece rápido
código      quase nunca vale desenhar — a ferramenta gera se preciso
```

Ver [princípios de documentação](/17-architecture-documentation/documentation-principles.md) — a meia-vida decresce com
o zoom.

A recomendação prática: produza contexto e contêiner para todo sistema relevante, e
componente apenas para as partes que justificam.

### O modelo é sobre estrutura, não sobre tudo

C4 descreve estrutura estática. Ele não descreve:

```text
comportamento em sequência   ver diagramas de sequência
fluxo de dados               ver fluxo de dados
implantação física           ver diagramas de implantação
decisões e razões            ver decisões de arquitetura
```

Tentar expressar sequência ou processo num diagrama estrutural produz um diagrama com
setas numeradas que não é nenhuma das duas coisas bem.

Os diagramas complementares existem e são usados quando a pergunta exige.

### A notação é livre, a semântica não

O modelo não prescreve formas, cores ou ferramentas. Ele prescreve o que uma caixa
significa em cada nível.

Isso é deliberado: qualquer notação funciona desde que consistente, e a legenda resolve o
resto. Ver
[qualidade de diagrama](/17-architecture-documentation/diagram-quality.md).

O que não é livre: misturar níveis, omitir a legenda, ou usar a mesma forma para coisas
diferentes.

### Diagramas como código

Descrever o diagrama em texto, versionado junto ao código, e gerar a imagem:

```text
versionado          muda no mesmo commit que a mudança
revisável           aparece no diff
gerado              a imagem não é editada à mão
consistente         a mesma notação em todos
```

Ver [documentação viva](/17-architecture-documentation/living-documentation.md).

Isso resolve o problema mais comum de diagramas: eles são desenhados uma vez, numa
ferramenta gráfica, e ninguém os atualiza porque atualizar exige abrir a ferramenta.

### Ele não substitui a conversa sobre comportamento

O C4 descreve estrutura estática. Comportamento — ordem, concorrência, tratamento de falha
— fica de fora por construção, e essa lacuna precisa ser preenchida por outro artefato.

Na prática, um conjunto útil combina os dois primeiros níveis do C4 com dois ou três
[diagramas de sequência](/17-architecture-documentation/sequence-diagrams.md) dos fluxos que atravessam mais peças. É
essa combinação que responde tanto a "o que existe" quanto a "o que acontece", e ela custa
pouco mais que a estrutura sozinha.

Tratar o C4 como documentação completa é o erro de escopo mais comum de quem o adota: o
modelo é deliberadamente parcial, e essa parcialidade é o que o mantém utilizável.

## Modelo Mental

**Um nível de abstração por diagrama, um público por nível.** Contexto e contêiner
resolvem a maior parte.

## Quando Usar

- Para comunicar a estrutura de um sistema.
- Ao integrar pessoas novas.
- Em revisões de arquitetura.
- Para discutir fronteiras e integrações.
- Como base de documentação de sistema.

## Quando Não Usar

**Misturando níveis.**

**Nível de código** — a ferramenta gera melhor.

**Para expressar sequência ou processo.**

**Componente para todo sistema** — ele envelhece rápido.

**Desenhado em ferramenta gráfica**, sem versionamento.

**Sem legenda**, assumindo que a notação é óbvia.

## Alternativas

- **arc42** — um modelo de documento mais amplo, que inclui diagramas e texto. Ver
  [descrições de arquitetura](/17-architecture-documentation/architecture-descriptions.md).
- **Modelo 4+1** — organiza por visões. Ver
  [visões de arquitetura](/17-architecture-documentation/architecture-views.md).
- **UML** — mais expressiva e mais pesada; útil quando a precisão importa.
- **Diagramas informais** — um esboço num quadro resolve muita conversa, e não precisa
  virar artefato.

A última merece nota: nem todo diagrama precisa ser documentado. Um desenho descartável
que esclarece uma conversa cumpriu a função dele.

## Trade-offs

| C4 | UML |
|---|---|
| Simples de aprender | Expressiva e complexa |
| Notação livre | Padronizada |
| Quatro níveis | Muitos tipos de diagrama |
| Foco em comunicação | Em precisão |

| Contexto e contêiner | Todos os níveis |
|---|---|
| Sustentável | Custo de manutenção alto |
| Cobre a maior parte | Cobertura completa |

## Modos de Falha

**Níveis misturados.** Ilegível para todos.

**Contêiner confundido com contêiner de virtualização.**

**Diagrama de componente desatualizado.**

**Sequência expressa em diagrama estrutural.**

**Desenho manual que ninguém atualiza.**

**Sem legenda.** Cada leitor interpreta as formas.

## Erros Comuns

**Misturar abstrações.**

**Produzir os quatro níveis para todo sistema.**

**Desenhar em ferramenta gráfica.**

**Numerar setas** para expressar sequência num diagrama estrutural.

**Omitir a legenda.**

**Não datar.**

## Exemplo Real

Uma empresa de saúde tinha um único diagrama de arquitetura por sistema — desenhado numa
ferramenta gráfica, com 40 a 60 caixas cada.

As caixas incluíam, no mesmo diagrama: sistemas externos, serviços internos, bibliotecas
compartilhadas, tabelas de banco e conceitos de negócio.

Duas consequências:

**Ninguém usava.** Os diagramas eram exibidos em apresentações e não consultados no
trabalho.

**Desatualizados.** A última atualização de metade deles tinha mais de dois anos.

A adoção de C4 mudou três coisas:

**Contexto por sistema.** Um diagrama com o sistema, as pessoas que o usam, e os sistemas
com que ele conversa. Entre 5 e 12 caixas.

Esse virou o diagrama mais consultado da organização — usado em integração de pessoas
novas, em conversas com o negócio, e em avaliação de impacto.

**Contêiner por sistema.** As unidades executáveis e os armazenamentos, com os protocolos
entre elas. Entre 6 e 15 caixas.

**Componente apenas para três sistemas** — os maiores, onde a navegação interna
justificava.

**Diagramas como código**, versionados no repositório de cada sistema e gerados na
esteira.

Isso resolveu a desatualização: um diagrama que não corresponde à estrutura aparece na
revisão do commit que a mudou.

Um problema durante a adoção:

**Confusão sobre contêiner.** A equipe de plataforma interpretou "contêiner" como
contêiner de virtualização, e os primeiros diagramas mostravam a topologia de execução em
vez da estrutura lógica.

A correção foi terminológica: o glossário interno passou a chamar o nível de "unidades
executáveis", com a nota de que corresponde ao contêiner do C4.

O ponto que a equipe sublinha: o ganho não veio da notação. Veio da disciplina de um nível por
diagrama — que tornou possível dizer, antes de desenhar, para quem o diagrama é.

## Conceitos Relacionados

- [Diagramas de Contexto](/17-architecture-documentation/context-diagrams.md) e
  [de Contêiner](/17-architecture-documentation/container-diagrams.md) — os dois que mais valem.
- [Diagramas de Componente](/17-architecture-documentation/component-diagrams.md).
- [Qualidade de Diagrama](/17-architecture-documentation/diagram-quality.md).
- [Documentação Viva](/17-architecture-documentation/living-documentation.md).

## Exercício Prático

Pegue um diagrama de arquitetura do seu time e classifique cada caixa: é um sistema, uma
unidade executável, um agrupamento interno, ou um conceito?

Se houver mais de um tipo, o diagrama mistura níveis — e é por isso que ele é difícil de
ler.

## Perguntas de Entrevista

- Por que um nível de abstração por diagrama?
- O que é um contêiner no modelo, e o que não é?
- Por que o nível de componente envelhece rápido?

## Para Aprofundar

- Brown, Simon. *The C4 model for visualising software architecture* — c4model.com.
- Brown, Simon. *Software Architecture for Developers*. Leanpub, 2015.
- Ford, Neal et al. *Software Architecture: The Hard Parts*. O'Reilly, 2021.
