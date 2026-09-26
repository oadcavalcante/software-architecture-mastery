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
content_version: 2
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

Os quatro níveis descrevem estrutura estática. O modelo define também diagramas
suplementares — paisagem de sistemas, dinâmico e de implantação — que ficam fora da
hierarquia de zoom e respondem a outras perguntas; aqui eles são tratados em
[diagramas de sequência](/17-architecture-documentation/sequence-diagrams.md) e
[diagramas de implantação](/17-architecture-documentation/deployment-diagrams.md):

```text
comportamento em sequência   diagrama dinâmico — ver diagramas de sequência
implantação física           diagrama de implantação — ver diagramas de implantação
fluxo de dados               fora do C4 — ver fluxo de dados
decisões e razões            fora do C4 — ver decisões de arquitetura
```

Tentar expressar sequência ou processo num diagrama estrutural produz um diagrama com
setas numeradas que não é nenhuma das duas coisas bem.

Na prática, um conjunto útil combina os dois primeiros níveis com dois ou três diagramas
de sequência dos fluxos que atravessam mais peças. É essa combinação que responde tanto a
"o que existe" quanto a "o que acontece", e ela custa pouco mais que a estrutura sozinha.

Tratar os quatro níveis como documentação completa é um erro de escopo: eles são
deliberadamente parciais, e essa parcialidade é o que os mantém utilizáveis.

### A notação é livre, a semântica não

O modelo não prescreve formas, cores ou ferramentas. Ele prescreve o que uma caixa
significa em cada nível.

Isso é deliberado: qualquer notação funciona desde que consistente, e a legenda resolve o
resto. Ver
[qualidade de diagrama](/17-architecture-documentation/diagram-quality.md).

O que não é livre: misturar níveis, omitir a legenda, ou usar a mesma forma para coisas
diferentes.

### Diagramas como código

O diagrama descrito em texto, versionado com o sistema e com a imagem gerada, é tratado
em [documentação viva](/17-architecture-documentation/living-documentation.md). O que é
específico do C4: como o modelo fixa o tipo de elemento em cada nível, ferramentas como o
Structurizr descrevem o sistema uma vez, como modelo, e derivam dele as vistas de
contexto, contêiner e componente. Renomear um contêiner no modelo atualiza todas as vistas
em que ele aparece, em vez de exigir a mesma edição em três desenhos — e uma vista não
consegue contradizer a outra, porque as duas leem o mesmo modelo.

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

**Quando a pergunta é de comportamento.** Se o que precisa ser documentado é a ordem de
um fluxo, a concorrência ou o tratamento de falha, os quatro níveis não têm onde pôr isso.
Um diagrama de sequência responde direto; forçar o C4 produz as setas numeradas descritas
acima.

**Quando contrato ou norma exige notação padronizada.** Se o artefato precisa seguir UML,
SysML ou uma descrição conforme a ISO 42010, notação livre com legenda não atende, e a
liberdade do C4 vira passivo. UML ou um gabarito como o arc42 cumpre a exigência.

**Quando o sistema é um único implantável pequeno.** Com um contêiner só, o nível de
contêiner não acrescenta nada ao de contexto, e o que resta — o contexto e um parágrafo
sobre a organização interna — cabe num README ou num esboço.

**Quando a documentação precisa cobrir várias visões.** Se segurança, implantação,
desenvolvimento e operação têm interessados distintos, o 4+1 ou o arc42 organizam o
conjunto, e o C4 entra como a parte estrutural deles, não como o todo.

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
| Simples de aprender | Curva de aprendizado longa |
| Poucos elementos de notação | Vocabulário grande e expressivo |
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

**Misturar abstrações.** A decisão é fazer um diagrama só "com tudo", e sistema, serviço,
biblioteca e tabela acabam lado a lado. O diagrama perde o leitor: cada público passa a
precisar de alguém que o explique.

**Produzir os quatro níveis para todo sistema.** Parece completude. O custo chega meses
depois, quando os diagramas de componente e de código divergem do código e a equipe passa
a desconfiar também dos níveis que continuavam corretos.

**Manter em ferramenta gráfica um diagrama que precisa evoluir com o código.** O esboço de
quadro está bem onde está; o erro é tornar referência um arquivo fora do repositório que
poucos sabem editar. A primeira mudança estrutural sem atualização o torna falso, e nada
avisa.

**Numerar setas** para expressar sequência num diagrama estrutural. Economiza um diagrama
e produz um em que o leitor segue números pelo desenho para reconstruir o que um diagrama
de sequência mostraria de cima para baixo.

**Omitir a legenda.** Quem desenha acha a notação óbvia porque a inventou; cada leitor
atribui às formas e às setas um significado próprio, e duas pessoas saem do mesmo
diagrama com leituras diferentes de uma dependência.

**Não datar.** Sem data ou versão, o leitor não sabe se vê a estrutura de hoje ou a de
dois anos atrás — a situação do exemplo abaixo — e passa a tratar todos os diagramas como
suspeitos. Gerado na esteira, o diagrama herda a data do commit; desenhado à mão, precisa
trazê-la no próprio desenho.

## Exemplo Real

Uma empresa de saúde tinha um único diagrama de arquitetura por sistema — desenhado numa
ferramenta gráfica, com 40 a 60 caixas cada.

As caixas incluíam, no mesmo diagrama: sistemas externos, serviços internos, bibliotecas
compartilhadas, tabelas de banco e conceitos de negócio.

Duas consequências:

**Ninguém usava.** Os diagramas eram exibidos em apresentações e não consultados no
trabalho.

**Desatualizados.** A última atualização de metade deles tinha mais de dois anos.

A adoção de C4 mudou quatro coisas:

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

O texto versionado não detecta divergência sozinho — um commit que muda a estrutura sem
tocar o diagrama passa limpo pelo diff. O que ele fez foi baratear a atualização a ponto
de caber no mesmo commit, e isso permitiu que "o diagrama ainda corresponde?" virasse item
da revisão de código. Foi esse item que conteve a desatualização.

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
