---
id: prototype
title: Prototype
sidebar_position: 4
description: Criar por cópia em vez de por construção — e por que ele quase desapareceu.
doc_type: pattern
level: 2
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor reconhece os poucos casos em que criar por cópia é
  superior a construir, e os riscos de cópia rasa.
prerequisites: [design-patterns]
related: [factory-method, memento, flyweight]
canonical_for: [prototype, clonagem]
content_version: 1
last_reviewed: 2026-08-26
---

# Prototype

## Visão Geral

Prototype cria objetos novos **copiando** uma instância existente, em vez de
construí-los do zero.

É o padrão do GoF que menos aparece em código moderno, e vale entender por quê —
tanto quanto os casos em que ele ainda é a resposta certa.

## Problema

Construir um objeto é caro ou complicado, e já existe uma instância no estado
desejado.

Três situações originais:

Construção custosa — o objeto exige uma consulta ao banco, um cálculo pesado ou
uma leitura de arquivo, e já se tem um pronto.

Configuração complexa — o objeto tem trinta parâmetros ajustados, e criar uma
variante exige repetir os vinte e nove iguais.

Tipo desconhecido em tempo de compilação — precisa-se de outro objeto "como
este", sem saber qual é a classe concreta.

## Conceitos Centrais

### A operação de clonagem

O objeto sabe se copiar. `clonar()` devolve uma instância independente com o
mesmo estado.

A pergunta que decide a implementação: **cópia rasa ou profunda?**

Cópia rasa duplica as referências — o original e a cópia apontam para os mesmos
objetos internos. Alterar um subobjeto pela cópia altera o original.

Cópia profunda duplica recursivamente. É correta e cara, e precisa lidar com
ciclos de referência.

A maioria dos defeitos deste padrão vem de cópia rasa onde se esperava profunda.
E a escolha certa depende do objeto: partes imutáveis podem ser compartilhadas
com segurança; mutáveis não.

### Por que ele quase desapareceu

Três razões.

**Imutabilidade.** Objetos imutáveis não precisam ser clonados — podem ser
compartilhados. Onde se usaria clonagem, usa-se uma operação que devolve uma nova
instância com um campo alterado.

**Construção barata.** A premissa de que construir é caro raramente vale hoje.

**Serialização e cópia genérica.** Bibliotecas fazem cópia profunda sem exigir
que cada classe implemente clonagem.

### O risco de contrato

Uma operação de clonagem herdada é traiçoeira: uma subclasse que adiciona um campo
mutável e não sobrescreve a clonagem produz cópias que compartilham esse campo.
Nada avisa. É uma violação de
[Liskov](../02-software-design/solid.md) que o compilador não detecta.

## Quando Usar

- A construção é comprovadamente cara e há uma instância pronta.
- É preciso criar variantes de uma configuração extensa, mudando poucos campos.
- O tipo concreto não é conhecido, e só se tem uma instância de referência.
- Em editores gráficos e sistemas de modelagem, onde duplicar um elemento é uma
  operação do domínio.

## Quando Não Usar

**Quando o objeto é imutável.** Compartilhe. Não há o que copiar.

**Quando construir é barato.** O caso comum.

**Quando a cópia profunda é complexa ou ambígua.** Se o objeto tem referências a
recursos, conexões ou identidade externa, "copiar" não tem significado óbvio — e
uma cópia com o mesmo identificador é um defeito.

**Quando existe biblioteca de cópia.** Implementar clonagem à mão em cada classe
é manutenção que se desatualiza a cada campo novo.

**Para objetos com identidade.** Uma entidade de domínio com identificador não
deve ser clonada sem que o identificador seja tratado — e esquecer isso produz
duas entidades com a mesma identidade.

## Alternativas

- **Imutabilidade com operações de derivação** — `pedido.comDesconto(x)` devolve
  uma nova instância. Substitui o padrão na maioria dos casos.
- **[Builder](builder.md) a partir de um existente** — construir uma variante
  explicitamente.
- **Cópia por serialização** — genérica, mais lenta, sem código por classe.
- **Função de cópia explícita** — sem hierarquia, com o comportamento visível.

## Trade-offs

| Prototype | Construir do zero |
|---|---|
| Evita construção cara | Paga a construção |
| Variante com poucas linhas | Repetir a configuração |
| Independe do tipo concreto | Precisa conhecer o tipo |
| Risco de cópia rasa indevida | Sem esse risco |
| Clonagem a manter por classe | Nada a manter |
| Semântica ambígua com recursos | Explícita |

## Modos de Falha

**Cópia rasa onde se esperava profunda.** O defeito característico. Aparece longe
da clonagem e é difícil de rastrear.

**Subclasse que esquece de estender a clonagem.** Campo novo compartilhado
silenciosamente.

**Identidade duplicada.** Entidade clonada com o mesmo identificador.

**Ciclo de referência na cópia profunda.** Recursão infinita, ou uma
implementação que trata ciclos e ninguém revisa.

## Erros Comuns

**Clonar objeto com identidade.** Precisa de tratamento explícito.

**Assumir que a clonagem é profunda.** Verifique.

**Implementar à mão o que uma biblioteca faz.** Manutenção que se desatualiza.

**Usar clonagem onde imutabilidade resolveria.** É a alternativa que dispensa o
padrão.

## Exemplo Real

Um editor de diagramas precisava duplicar elementos. Um elemento tem geometria,
estilo, texto, conexões e metadados — e duplicar é uma operação do domínio, com
significado claro para o usuário.

A primeira implementação usou cópia rasa. O defeito apareceu duas semanas depois:
alterar o estilo de um elemento duplicado alterava o original, porque os dois
apontavam para o mesmo objeto de estilo.

A correção não foi tornar a cópia profunda em tudo. Foi separar o que é
compartilhável do que não é: estilo virou imutável e passou a ser compartilhado
deliberadamente — o que também reduziu memória, no espírito de
[Flyweight](flyweight.md). Geometria e texto passaram a ser copiados. Conexões
não são copiadas, porque um elemento duplicado começa desconectado — que é a
regra do domínio.

A lição está aí: "cópia profunda" não é a resposta certa por padrão. A resposta é
decidir campo a campo o que a duplicação significa no domínio.

## Onde ele aparece na prática

**JavaScript.** A linguagem é baseada em protótipos: objetos herdam diretamente
de outros objetos. É o exemplo mais literal do padrão, embutido na semântica.

**Editores gráficos e ferramentas de modelagem.** Duplicar um elemento é uma
operação do domínio, e o padrão modela isso diretamente.

**Objetos de configuração.** Partir de um perfil padrão e derivar variantes
mudando poucos campos.

**Frameworks de teste.** Um objeto de referência bem montado, do qual se derivam
variações por cenário — que é conceitualmente o mesmo que o builder de teste
resolve, por outro caminho.

Em linguagens com suporte a imutabilidade, o último caso migrou para operações de
derivação: `config.com(timeout: 30)` devolve uma instância nova sem clonagem
explícita. Isso é Prototype com outra sintaxe e sem o risco de cópia rasa — o que
explica por que o padrão nomeado desapareceu enquanto a ideia permaneceu.

## Conceitos Relacionados

- [Factory Method](factory-method.md) — criação por construção.
- [Memento](memento.md) — captura de estado, com propósito diferente.
- [Flyweight](flyweight.md) — compartilhamento deliberado em vez de cópia.

## Exercício Prático

Procure operações de clonagem ou cópia no seu sistema. Para cada uma, verifique
campo a campo: a cópia é rasa ou profunda? Isso está correto para aquele campo?

Depois pergunte, para cada objeto clonado: ele tem identidade? Se tiver, o que
acontece com o identificador na cópia?

## Perguntas de Entrevista

- Qual a diferença entre cópia rasa e profunda, e qual o risco de cada uma?
- Por que este padrão aparece pouco em código moderno?
- O que acontece ao clonar uma entidade com identificador?

## Para Aprofundar

- Gamma, Erich et al. *Design Patterns*. Addison-Wesley, 1994.
- Bloch, Joshua. *Effective Java*. 3ª ed., 2018 — sobre os problemas de clonagem
  herdada.
