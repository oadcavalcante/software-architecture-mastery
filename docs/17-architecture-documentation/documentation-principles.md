---
id: documentation-principles
title: Princípios de Documentação
sidebar_position: 1
description: O que decide se a documentação vai ser lida — leitor, propósito e o nível de detalhe que sobrevive.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor escreve documentação com leitor e pergunta definidos, e descarta
  o que não serve a nenhum dos dois.
prerequisites: [architecture-documentation]
related: [living-documentation, architecture-views, diagram-quality]
canonical_for: [leitor da documentação, meia-vida da documentação, documentação sob demanda]
content_version: 1
last_reviewed: 2026-08-29
---

# Princípios de Documentação

## Visão Geral

A pergunta que decide se um documento vai ser lido não é sobre conteúdo. É: **quem vai
ler, e que pergunta essa pessoa tem?**

Documentação escrita sem essa resposta é escrita para "documentar" — e produz artefatos
que ninguém procura, porque não foram feitos para responder a nada.

O segundo critério é temporal: o nível de detalhe determina quanto tempo o documento
sobrevive. Detalhe fino envelhece em semanas; estrutura e razão envelhecem em anos.

## Problema

O padrão de falha é reconhecível:

```text
documentação produzida no fim do projeto
descrevendo tudo, no mesmo nível de detalhe
armazenada num repositório de documentos
sem dono
consultada nunca
```

Seis meses depois ela está errada. Um ano depois, ela é perigosa — porque quem a
encontra assume que ela descreve o sistema.

E a reação típica ao perceber isso é produzir mais documentação, com mais rigor. O
problema não era volume.

## Conceitos Centrais

### Escreva para um leitor com uma pergunta

Cada documento serve a uma combinação de leitor e pergunta:

```text
leitor                     pergunta típica
alguém que chega ao time   como este sistema funciona, em linhas gerais
quem vai mudar o sistema   onde mexo, e o que quebro
quem opera                 o que faço quando algo dá errado
quem integra               qual o contrato, quais as garantias
quem decide investimento   o que isto faz, quanto custa, qual o risco
auditoria                  quem acessa o quê, como é protegido
```

Um documento que tenta servir a todos serve mal a cada um. E a maioria das necessidades é
coberta por poucos documentos, se cada um for escrito para um leitor.

O teste antes de escrever: **quem vai procurar isto, e o que essa pessoa quer saber?** Se
não houver resposta, não escreva.

### O detalhe determina a meia-vida

```text
nível                      envelhece em
razões e trade-offs        anos — o contexto da decisão não muda
fronteiras e estrutura     ano — mudam com refatorações grandes
componentes internos       meses
detalhe de implementação   semanas
```

Isso não significa nunca documentar detalhe. Significa saber que documentar detalhe cria
uma obrigação de manutenção — e decidir se ela vale.

A regra prática: **documente à mão o que envelhece devagar; derive o que envelhece
rápido.** Ver
[documentação viva](/17-architecture-documentation/living-documentation.md).

### O porquê é o que só a escrita humana captura

```text
o que existe        derivável do código e da infraestrutura
como se conecta     derivável do rastreamento e da configuração
por que é assim     não derivável de nada
```

A terceira linha é o conteúdo de maior valor e o mais frequentemente ausente. Um sistema
pode ser lido; as razões que o produziram, não.

```text
por que esta fronteira, e não outra
que alternativas foram consideradas
que restrição levou a esta escolha
o que foi tentado e não funcionou
```

Ver [decisões de arquitetura](/18-architecture-decisions/index.md).

Um comentário de três linhas explicando por que um trecho estranho existe vale mais que
uma página descrevendo o que ele faz — porque o que ele faz está ali, e o porquê não.

### Perto do código, não num repositório separado

Documentação que vive longe do código diverge dele.

```text
no repositório      versionada junto, revisada junto, encontrada por quem trabalha ali
em ferramenta separada  atualizada por alguém que lembra
```

O critério prático: **a documentação muda no mesmo commit que a mudança que a torna
desatualizada?** Se não, ela vai divergir.

Isso não impede publicá-la em outro lugar — a fonte fica no repositório, e a publicação é
derivada.

### Documentação sob demanda

Uma alternativa à documentação preventiva: documentar quando alguém pergunta.

```text
alguém pergunta        →  responda, e transforme a resposta em documento
a mesma pergunta duas vezes  →  o documento se justifica
ninguém pergunta       →  não havia necessidade
```

Isso garante leitor e pergunta reais, e evita o custo de documentar o que ninguém quer
saber.

O limite: ela falha para o conhecimento que só se descobre necessário quando é tarde — o
porquê de uma decisão, depois que quem a tomou saiu. Esse tipo precisa ser registrado no
momento, não sob demanda.

### Menos, e correto

Uma documentação pequena e confiável é mais útil que uma extensa e duvidosa.

```text
confiável       as pessoas agem sobre ela
duvidosa        as pessoas verificam no código — e o documento vira custo puro
```

E há um efeito de contaminação: um documento errado num conjunto reduz a confiança em
todos.

Isso favorece a estratégia de manter pouco e manter bem — com data de revisão visível, e
com o que não é mantido removido em vez de deixado para trás.

### O custo de manter é o custo real

A conta que quase nunca é feita: documentação tem custo de escrita, que é visível e único,
e custo de manutenção, que é invisível e recorrente.

```text
escrever      horas, uma vez
manter        minutos, muitas vezes, para sempre
não manter    custo transferido para quem lê e erra
```

A terceira linha é a que a maior parte das organizações escolhe sem perceber. Ela não
aparece em nenhum planejamento, e reaparece como incidente, retrabalho e desconfiança.

Isso dá um critério de decisão antes de escrever qualquer documento: **quem vai manter
isto, e com qual gatilho?** Sem resposta, o documento nasce com prazo de validade curto — e
o melhor a fazer costuma ser escrever menos.

## Modelo Mental

**Um leitor, uma pergunta.** O nível de detalhe define a meia-vida, e o porquê é o que
só a escrita humana captura.

## Quando Usar

- Antes de escrever qualquer documento de arquitetura.
- Ao revisar documentação existente, para decidir o que manter.
- Ao integrar pessoas novas.
- Quando a mesma pergunta se repete.

## Quando Não Usar

**Documentar sem leitor definido.**

**No mesmo nível de detalhe para tudo.**

**Longe do código.**

**Preventivamente, o que ninguém pergunta.**

**Descrevendo o que o código já diz**, em vez do porquê.

**Mantendo o que não é confiável** em vez de remover.

## Alternativas

- **Código legível** — nomes e estrutura que dispensam explicação do que faz.
- **Testes como especificação** — descrevem o comportamento de forma verificável. Ver
  [refatoração de legado](/16-legacy-modernization/legacy-refactoring.md).
- **Registros de decisão** — o porquê, no formato próprio.
- **Sessões de transferência** — quando o conhecimento é tácito e a escrita não captura.

A última é subestimada: alguns tipos de conhecimento se transferem melhor por
acompanhamento que por documento.

## Trade-offs

| Documentação extensa | Enxuta |
|---|---|
| Cobre mais casos | Só o essencial |
| Custo de manutenção alto | Baixo |
| Envelhece por inteiro | Sustentável |
| Difícil de encontrar o relevante | Direto |

| Preventiva | Sob demanda |
|---|---|
| Pronta quando precisar | Escrita quando alguém pergunta |
| Pode não ser necessária | Leitor garantido |
| Cobre o que se descobre tarde | Falha nesse caso |

## Modos de Falha

**Documento sem leitor.** Produzido e nunca consultado.

**Desatualizado e confiável.** Alguém age sobre informação errada.

**Detalhe demais.** Envelhece antes de ser útil.

**Longe do código.** Diverge inevitavelmente.

**Descreve o que, não o porquê.** O código já dizia o quê.

**Contaminação.** Um documento errado reduz a confiança no conjunto.

## Erros Comuns

**Escrever para "documentar".** Documento sem pergunta que ele responda e sem leitor identificado não é consultado por ninguém, e ainda assim exige manutenção.

**Documentar tudo no mesmo nível.** O que muda toda semana e o que não muda há três anos merecem tratamentos opostos: um vira verificação automatizada, o outro vira texto.

**Não datar nem indicar responsável.** Sem os dois, o leitor não sabe se pode confiar nem a quem perguntar — e assume que está atualizado.

**Manter documentação que ninguém confia.** Um documento sabidamente errado é pior que a ausência dele, porque induz decisão errada em quem não sabia que estava errado.

**Não registrar o porquê** das decisões. A estrutura pode ser lida no código; a razão não pode ser lida em lugar nenhum, e é ela que permite reavaliar depois.

**Não remover o que ficou obsoleto.** Documentação acumulada dilui o que ainda vale, e o leitor perde a capacidade de distinguir.

## Exemplo Real

Uma empresa de serviços financeiros tinha 340 documentos de arquitetura num repositório
corporativo.

Uma auditoria de uso mediu os acessos de doze meses:

```text
documentos acessados mais de 10 vezes    9
acessados entre 1 e 10 vezes             31
nunca acessados                          300
```

Os nove mais acessados tinham características comuns: eram curtos, respondiam a uma
pergunta específica, e quatro deles eram diagramas de contexto de sistemas críticos.

Os 300 não acessados eram, na maioria, especificações detalhadas produzidas ao fim de
projetos.

A reformulação:

**Os 300 foram removidos.** Não arquivados — removidos, com o histórico preservado no
sistema de versão. Manter reduzia a confiança no conjunto.

**Um documento por sistema**, no repositório do próprio sistema, com estrutura fixa:
contexto, contêineres, decisões relevantes, e o que operar precisa saber.

**Diagramas derivados** onde possível: dependências a partir do rastreamento, topologia a
partir da infraestrutura declarada. Ver
[documentação viva](/17-architecture-documentation/living-documentation.md).

**Registros de decisão** para o porquê, no repositório. Ver
[decisões de arquitetura](/18-architecture-decisions/index.md).

**Data de revisão visível** em cada documento, com alerta acima de doze meses.

**Documentação sob demanda** como regra: perguntas recorrentes viram documento; perguntas
únicas viram resposta.

Dezoito meses depois:

```text
documentos mantidos                       78
acessados mais de 10 vezes no ano         61
proporção considerada confiável (pesquisa) 84%, contra 22% antes
```

A remoção dos 300 foi a mudança mais controversa e a mais
eficaz. O argumento de que "pode ser útil um dia" tinha sustentado a manutenção de um
acervo que ninguém consultava e em que ninguém confiava.

## Conceitos Relacionados

- [Documentação Viva](/17-architecture-documentation/living-documentation.md) — como manter.
- [Visões de Arquitetura](/17-architecture-documentation/architecture-views.md) — organizar por leitor.
- [Qualidade de Diagrama](/17-architecture-documentation/diagram-quality.md).
- [Decisões de Arquitetura](/18-architecture-decisions/index.md) — o porquê.

## Exercício Prático

Pegue os documentos de arquitetura do seu time e verifique quantos foram acessados nos
últimos seis meses.

Depois pergunte, de cada um: quem é o leitor, e que pergunta ele responde? Os que não
tiverem resposta são candidatos a remoção.

## Perguntas de Entrevista

- Por que o nível de detalhe determina a meia-vida?
- Por que documentação desatualizada é pior que ausente?
- O que só a escrita humana captura?

## Para Aprofundar

- Brown, Simon. *Software Architecture for Developers*. Leanpub, 2015.
- Parnas, David; Clements, Paul. *A Rational Design Process*. IEEE TSE, 1986.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.
