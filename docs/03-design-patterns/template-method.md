---
id: template-method
title: Template Method
sidebar_position: 21
description: A classe base define o esqueleto e a subclasse preenche as lacunas — herança onde composição costuma ser melhor.
doc_type: pattern
level: 2
difficulty: iniciante
status: complete
objective: >
  Ao terminar, o leitor reconhece quando Template Method é adequado e por que
  Strategy costuma ser preferível.
prerequisites: [design-patterns]
related: [strategy, factory-method, composition-vs-inheritance]
canonical_for: [template method]
content_version: 1
last_reviewed: 2026-08-26
---

# Template Method

## Visão Geral

Template Method define o esqueleto de um algoritmo numa classe base, deixando
etapas específicas para as subclasses.

É o padrão que mais depende de herança, e por isso o que mais frequentemente tem
uma alternativa melhor em [Strategy](strategy.md).

## Problema

Vários processos compartilham a mesma estrutura e diferem em algumas etapas.

Importar dados: abrir a fonte, validar o formato, transformar, gravar, fechar. A
sequência é sempre a mesma; validar e transformar dependem do formato.

Sem o padrão, cada importador repete a sequência inteira. Quando a sequência muda
— acrescentar registro de auditoria entre transformar e gravar — todos precisam
mudar, e alguém esquece.

## Conceitos Centrais

### A estrutura

```text
classe base:
  processar():                    ← template, final
    abrir()
    validar()                     ← abstrato
    transformar()                 ← abstrato
    gravar()
    fechar()
```

O método template é `final`: a subclasse não deve alterar a sequência, apenas
preencher as lacunas. Permitir sobrescrever o template destrói a garantia que o
padrão oferece.

### Inversão de controle

A classe base chama a subclasse, não o contrário. É o *princípio de Hollywood*:
"não nos chame, nós chamamos você".

Isso é a base de como frameworks funcionam, e é a razão pela qual o padrão aparece
tanto em código de framework e tão pouco em código de aplicação.

### Ganchos versus operações abstratas

**Operação abstrata** — a subclasse é obrigada a implementar.
**Gancho** — tem implementação padrão vazia ou trivial; a subclasse pode
sobrescrever.

Ganchos dão flexibilidade e criam um problema: quem lê a subclasse não sabe quais
existem sem ler a base. Quanto mais ganchos, menos previsível o comportamento.

### O custo da herança

Template Method herda todos os custos de
[herança de implementação](../02-software-design/composition-vs-inheritance.md):
um eixo de variação, acoplamento à implementação da base, e o problema da classe
base frágil — mudar a base quebra subclasses que ninguém tocou.

Strategy resolve o mesmo problema por composição, sem esses custos.

## Quando Usar

- A sequência é genuinamente fixa e deve ser garantida.
- Existe um único eixo de variação.
- A hierarquia é rasa e o conjunto de variantes é fechado.
- Você está escrevendo um framework em que o usuário estende a base.

## Quando Não Usar

**Quando há mais de um eixo de variação.** Explosão combinatória. Componha.

**Quando as etapas variam independentemente.** Se validar e transformar variam
sem correlação, são duas estratégias, não uma subclasse.

**Quando a variante precisa mudar em execução.** Herança é fixa em compilação.

**Quando há muitos ganchos.** Uma base com dez ganchos é um contrato implícito
que ninguém consegue reter.

**Quando Strategy resolve.** Que é a maioria dos casos em código de aplicação.

## Alternativas

- **[Strategy](strategy.md)** — composição no lugar da herança. A alternativa
  principal.
- **Funções passadas como parâmetro** — `processar(validar, transformar)`.
- **Método template que recebe as etapas** — sem hierarquia, o esqueleto vira uma
  função que aceita as variações.

## Trade-offs

| Template Method | Strategy |
|---|---|
| Sequência garantida na base | Sequência a cargo de quem compõe |
| Menos código na subclasse | Mais cabeamento |
| Um eixo de variação | Eixos combináveis |
| Fixo em compilação | Trocável em execução |
| Acoplado à implementação da base | Acoplado só à interface |
| Ganchos criam contrato implícito | Interface explícita |

## Modos de Falha

**Base frágil.** Mudança na base quebra subclasses não tocadas.

**Template sobrescrito.** A subclasse altera a sequência e a garantia se perde.

**Ganchos demais.** Contrato implícito ilegível.

**Hierarquia profunda.** Descobrir de onde vem um comportamento exige percorrer
vários níveis.

**Etapa que precisa de dado que a base não passa.** A subclasse recorre a estado
compartilhado, e o acoplamento se agrava.

## Erros Comuns

**Não tornar o template final.**

**Usar onde Strategy serve melhor.** O erro mais comum em código de aplicação.

**Acumular ganchos.**

**Compartilhar estado mutável entre base e subclasse.** Torna a ordem de execução
uma dependência oculta.

## Onde ele aparece na prática

**Frameworks de teste.** O ciclo — preparar, executar, verificar, limpar — é um
template; seus métodos preenchem as lacunas.

**Servlets e controladores.** A classe base trata o protocolo; você implementa o
tratamento da requisição.

**Classes abstratas de coleção.** `AbstractList` implementa quase tudo a partir de
duas operações que a subclasse fornece.

**Etapas de processamento em lote.** Frameworks de processamento definem o ciclo e
você preenche leitura, processamento e escrita.

Os quatro são código de framework. É onde o padrão pertence: quando **a base é
uma biblioteca e a subclasse é o código do usuário**, a inversão de controle é
exatamente o que se quer. Em código de aplicação, onde os dois lados são seus,
Strategy costuma vencer.

## Exemplo Real

Um sistema de importação tinha `ImportadorBase` com sete etapas e onze
subclasses, uma por formato de arquivo.

Funcionou por dois anos. O problema apareceu quando o destino passou a variar: o
mesmo formato podia ir para o banco principal, para um data warehouse ou para uma
fila. A hierarquia teria 33 classes.

A migração para composição foi parcial e deliberada. O esqueleto virou uma função
que recebe um leitor e um escritor:

```text
importar(leitor, escritor)
  abrir · validar · transformar · gravar · fechar
```

Onze leitores, três escritores. A sequência continuou garantida — está na função,
não numa base herdada.

O detalhe que vale reter: o padrão não estava errado enquanto havia um eixo. Ele
deixou de servir quando apareceu o segundo, que é exatamente a limitação
declarada em "quando não usar" — e a mesma que derrubou
[Factory Method](factory-method.md) num caso análogo.

## Como converter para Strategy

A conversão é mecânica quando o padrão deixa de servir, e vale conhecer os passos.

**Um.** Identifique as operações abstratas — as lacunas que as subclasses
preenchem. Cada conjunto que varia junto é uma estratégia.

**Dois.** Transforme cada conjunto numa interface. Se for uma operação só, uma
função basta.

**Três.** Converta o método template em uma função ou classe que recebe as
estratégias como parâmetros. A sequência permanece; o que muda é de onde vêm as
etapas.

**Quatro.** Cada subclasse antiga vira uma combinação de estratégias, montada onde
o objeto era instanciado.

```text
antes:   ImportadorCSV extends ImportadorBase
depois:  importar(leitorCSV, escritorBanco)
```

**Cinco.** Os ganchos com implementação padrão viram parâmetros opcionais com
valor padrão.

O passo que costuma travar é o quarto: se as subclasses compartilhavam estado com
a base por campos protegidos, esse estado precisa virar parâmetro explícito. É
trabalhoso e é justamente o acoplamento que a conversão elimina — o estado
compartilhado era uma dependência oculta entre base e subclasse.

## Conceitos Relacionados

- [Strategy](strategy.md) — a alternativa por composição.
- [Factory Method](factory-method.md) — frequentemente usado dentro de um
  template.
- [Composição vs. Herança](../02-software-design/composition-vs-inheritance.md).

## Exercício Prático

Procure classes abstratas do seu sistema com um método público não sobrescrevível
que chama métodos abstratos.

Para cada uma, conte os eixos de variação e os ganchos. Mais de um eixo, ou muitos
ganchos, indica que composição serviria melhor.

## Perguntas de Entrevista

- Por que o método template deve ser final?
- Qual a diferença entre gancho e operação abstrata?
- Quando Strategy é preferível a Template Method?

## Para Aprofundar

- Gamma, Erich et al. *Design Patterns*. Addison-Wesley, 1994.
- Bloch, Joshua. *Effective Java*. 3ª ed., 2018 — sobre projetar para herança.
