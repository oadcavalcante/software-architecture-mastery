---
id: legacy-systems
title: Sistemas Legados
sidebar_position: 1
description: A definição útil — e por que o código antigo raramente é o problema real.
doc_type: foundation
level: 6
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor identifica o que de fato torna um sistema difícil de mudar, e
  distingue idade de problema.
prerequisites: [legacy-modernization]
related: [modernization-drivers, legacy-refactoring, organizational-constraints]
canonical_for: [sistema legado, conhecimento perdido, código sem testes, valor preso]
content_version: 1
last_reviewed: 2026-08-28
---

# Sistemas Legados

## Visão Geral

A definição mais útil de sistema legado não menciona idade nem tecnologia:

**Um sistema legado é um sistema que a organização tem medo de mudar.**

O medo tem causas concretas — falta de testes, conhecimento perdido, acoplamento,
ausência de ambiente para verificar — e cada uma tem tratamento diferente.

Um sistema de vinte anos com boa cobertura de testes e equipe que o domina não é legado
nesse sentido. Um sistema de dois anos, escrito por alguém que saiu, sem testes, é.

## Por Que Isso Importa

Tratar idade como o problema leva à intervenção errada.

```text
diagnóstico: "é antigo"          → substituir
diagnóstico: "não tem testes"    → adicionar testes de caracterização
diagnóstico: "ninguém entende"   → arqueologia e documentação
diagnóstico: "acoplado a tudo"   → isolar fronteiras
```

Os três últimos são muito mais baratos que o primeiro, e frequentemente resolvem o
problema real. Ver
[refatoração de legado](legacy-refactoring.md).

E há um custo de enquadramento: chamar um sistema de legado é um julgamento que afeta as
pessoas que o mantêm. Ele desvaloriza um trabalho que sustenta o negócio, e produz o
efeito previsível — ninguém quer trabalhar ali, o que agrava exatamente o problema de
conhecimento.

## Conceitos Centrais

### O que produz o medo de mudar

```text
sem testes             não há como saber se a mudança quebrou algo
conhecimento perdido   ninguém sabe por que o código faz o que faz
acoplamento            uma mudança propaga de formas imprevisíveis
sem ambiente           não há onde verificar antes de produção
implantação arriscada  cada release é um evento
dependências obsoletas atualizar é um projeto em si
```

Note que apenas a última tem relação com idade. As outras cinco podem existir em sistemas
recentes — e existem, com frequência desconfortável.

### O conhecimento embutido é o ativo mais subestimado

Um sistema em produção há anos acumulou regras que ninguém documentou:

```text
casos de borda descobertos em incidentes
exceções para clientes específicos
correções para comportamento de sistemas parceiros
regras de negócio que mudaram e deixaram rastro
```

Esse conhecimento não está em nenhum documento. Ele está no código — frequentemente na
forma de condicionais que parecem arbitrárias.

É a razão principal pela qual reescritas falham: o sistema novo é construído a partir do
que se acredita que o sistema faz, e não do que ele faz. Ver
[reconstrução](rebuilding.md).

Antes de descartar código antigo, vale perguntar de cada trecho estranho: **isto está
aqui por quê?** Frequentemente a resposta é um incidente de sete anos atrás.

### Testes de caracterização capturam o comportamento atual

A técnica que reduz o medo antes de qualquer mudança:

```text
teste convencional      verifica o comportamento desejado
teste de caracterização captura o comportamento atual, seja ele qual for
```

Ele não julga se o comportamento está certo. Ele congela o que existe, de forma que
qualquer alteração acidental apareça.

Isso permite refatorar com segurança sem entender completamente o sistema — que é a
situação real. Ver
[refatoração de legado](legacy-refactoring.md).

E os testes escritos assim documentam: eles são a descrição executável do que o sistema
faz, produzida a partir dele.

### O sistema legado sustenta o negócio

Uma constatação que a linguagem de "legado" esconde: esses sistemas funcionam. Eles
processam transações, atendem clientes, geram receita.

Isso tem duas implicações práticas:

**O risco de mexer é real.** Não é conservadorismo — é que o sistema faz algo importante,
e quebrá-lo tem consequência.

**O valor está preso ali.** Anos de refinamento, de correções, de aprendizado. Descartar
isso é descartar o investimento.

Ver [motivadores de modernização](modernization-drivers.md) — a decisão de mexer precisa
superar esse valor.

### Nem todo sistema legado precisa ser tratado

A pergunta é sempre a mesma: **precisamos mudá-lo?**

```text
sistema estável, que ninguém precisa mudar   → não é problema
sistema que precisa mudar e resiste          → é o problema
```

Um sistema legado que atende bem e não muda pode continuar assim indefinidamente. O que
ele precisa é de contenção — isolamento para que ele não limite o que está em volta — e
de plano para o risco de pessoas.

## Erros Comuns

**Diagnosticar por idade.** Leva à substituição quando outra coisa resolveria.

**Descartar o conhecimento embutido.** A causa mais comum de falha de reescrita.

**Não escrever testes de caracterização** antes de mexer.

**Tratar como problema um sistema que não precisa mudar.**

**Usar "legado" como julgamento.** Desvaloriza quem mantém e agrava o problema de
conhecimento.

**Assumir que o comportamento documentado é o real.** Depois de anos, eles divergiram.

## Exemplo Real

Uma seguradora tinha um sistema de cálculo de sinistros escrito em 1998, apontado
internamente como o exemplo de legado a substituir.

Antes de aprovar a substituição, uma equipe passou seis semanas em arqueologia — lendo o
código, entrevistando quem o mantinha, e escrevendo testes de caracterização.

O que encontraram:

**A tecnologia não era o problema.** O sistema era estável, rápido, e a linguagem tinha
suporte ativo.

**O conhecimento era o problema.** Duas pessoas o mantinham, ambas há mais de 15 anos na
empresa. Nada estava documentado.

**As regras eram muito mais complexas que o suposto.** Os testes de caracterização
capturaram 340 casos de comportamento. A especificação que existia — escrita para um
projeto de substituição anterior, abandonado — descrevia cerca de 90.

Os outros 250 eram acumulação de duas décadas: exceções regulatórias, acordos com
resseguradoras, correções para casos que apareceram em auditoria.

**Um deles era crítico e não estava em lugar nenhum.** Uma regra de arredondamento
específica para apólices anteriores a 2003, exigida por uma decisão judicial. Ela existia
como uma condicional de três linhas, sem comentário.

A decisão mudou:

**Substituição adiada.** O motivo original — "é legado" — não se sustentava.

**Testes de caracterização mantidos** como ativo permanente, integrados à esteira. Eles
viraram a documentação executável do sistema.

**Transferência de conhecimento** priorizada: de dois para cinco mantenedores, ao longo
de um ano, usando os testes como material.

**Refatoração incremental** onde a mudança era frequente, com os testes dando segurança.

Dois anos depois, o sistema continua em produção. Ele não é mais chamado de legado
internamente — não porque mudou de tecnologia, mas porque a organização deixou de ter
medo de mexer nele.

O que a equipe registra: as seis semanas de arqueologia custaram uma fração do projeto de
substituição, e revelaram que o projeto resolveria o problema errado. A regra de
arredondamento, sozinha, teria sido perdida numa reescrita — e teria produzido um passivo
jurídico.

## Conceitos Relacionados

- [Motivadores de Modernização](modernization-drivers.md) — quando mexer.
- [Refatoração de Legado](legacy-refactoring.md) — os testes de caracterização.
- [Reconstrução](rebuilding.md) — o risco do conhecimento perdido.
- [Restrições Organizacionais](organizational-constraints.md).

## Exercício Prático

Pegue um sistema que seu time chama de legado e liste as causas concretas do medo de
mudá-lo: falta de testes, conhecimento, acoplamento, ambiente.

Cada causa tem um tratamento diferente, e a maioria é mais barata que substituir.

## Perguntas de Entrevista

- Qual a definição útil de sistema legado?
- Por que o conhecimento embutido é o ativo mais subestimado?
- O que um teste de caracterização faz que um teste convencional não faz?

## Para Aprofundar

- Feathers, Michael. *Working Effectively with Legacy Code*. Prentice Hall, 2004.
- Birgitta Böckeler et al. *Legacy Modernization*. Thoughtworks.
- Newman, Sam. *Monolith to Microservices*. O'Reilly, 2019.
