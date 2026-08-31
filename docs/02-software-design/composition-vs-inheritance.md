---
id: composition-vs-inheritance
title: Composição vs. Herança
sidebar_position: 10
description: Duas formas de reúso com custos opostos — e por que a herança cobra no lugar errado.
doc_type: concept
level: 2
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor escolhe entre composição e herança pelo tipo de relação
  entre os tipos, e reconhece hierarquias que quebram substituibilidade.
prerequisites: [encapsulation]
related: [solid, interfaces, code-smells]
canonical_for: [composição, herança, composição sobre herança]
content_version: 1
last_reviewed: 2026-08-26
---

# Composição vs. Herança

## Visão Geral

Herança e composição são duas formas de reusar comportamento. A orientação
clássica — *prefira composição a herança* — é boa e é frequentemente aplicada sem
o critério que a torna útil.

O critério: **herança declara que um tipo é substituível por outro. Composição
declara que um tipo usa outro.** Se a substituibilidade não é verdadeira, herança
está errada independentemente de quanto código ela economiza.

## Problema

Herança é atraente porque economiza digitação. Uma subclasse ganha tudo da
superclasse de graça, e a economia é imediata e visível.

O custo não é imediato nem visível, e vem em três formas.

**Acoplamento total.** A subclasse depende da implementação da superclasse, não
só da sua interface. Mudanças internas na superclasse quebram subclasses — o que
Gamma et al. chamam de quebra de encapsulamento entre classes.

**Rigidez de eixo.** Uma hierarquia comete-se a um eixo de variação. Se depois
aparece um segundo eixo, a hierarquia explode combinatoriamente ou vira
hierarquia paralela.

**Violação silenciosa de substituibilidade.** Uma subclasse que restringe o que a
superclasse permite compila, passa nos testes, e quebra em produção quando chega
por um caminho não previsto. É o **L** do [SOLID](/02-software-design/solid.md).

## Conceitos Centrais

### O teste da substituibilidade

Antes de herdar, responda: **em todo lugar onde a superclasse é aceita, a
subclasse funciona sem que o chamador saiba a diferença?**

Se a resposta tiver exceções, herança está errada. Não é uma questão de estilo.

O exemplo clássico: `Quadrado` herdando de `Retângulo`. Matematicamente um
quadrado é um retângulo. Em código, `retangulo.setLargura(5)` seguido de
`retangulo.setAltura(3)` produz área 15 para retângulo e comportamento
surpreendente para quadrado. A relação matemática não sobrevive à mutabilidade.

### Composição resolve o eixo múltiplo

Herança amarra a um eixo. Composição permite combinar.

```text
herança — 2 eixos, 6 classes            composição — 2 eixos, 5 peças
──────────────────────────              ────────────────────────────
NotificadorEmailUrgente                 Notificador(canal, prioridade)
NotificadorEmailNormal                    canais:      Email, SMS, Push
NotificadorSmsUrgente                     prioridades: Urgente, Normal
NotificadorSmsNormal
NotificadorPushUrgente
NotificadorPushNormal
```

Com três eixos, a hierarquia teria dezoito classes; a composição, oito peças. É a
diferença entre crescimento multiplicativo e aditivo.

### Onde herança ganha

Herança não é sempre errada. Ela é a escolha certa quando:

- A relação é genuinamente de subtipagem, verificada pelo teste acima.
- A hierarquia é rasa — um nível — e fechada.
- A superclasse é abstrata e existe para definir contrato, não para compartilhar
  implementação.

O último caso é o mais defensável: herdar de interface ou classe abstrata pura é
declaração de contrato, e não traz o acoplamento à implementação.

### Herança de implementação versus de interface

A distinção que dissolve boa parte do debate.

**Herança de interface** — implementar um contrato — é barata e segura.
**Herança de implementação** — herdar código — é onde os três custos aparecem.

A orientação "prefira composição" é, na prática, "prefira composição a herança de
implementação".

## Modelo Mental

**"É um" versus "usa um" é insuficiente.** A pergunta melhor é: *o chamador pode
me tratar como o tipo base sem nenhuma ressalva?* Se houver ressalva, componha.

## Quando Usar

**Herança** quando:
- A substituibilidade é verdadeira sem exceção.
- A hierarquia é rasa e o conjunto de subtipos é conhecido e fechado.
- A superclasse é abstrata e define contrato.
- O framework exige — muitos exigem, e resistir custa mais que aceitar.

**Composição** no restante, que é a maioria.

## Quando Não Usar

**Herança para reusar código sem relação de tipo.** O erro dominante. Se o único
motivo é aproveitar métodos, componha.

**Herança em hierarquia profunda.** Cada nível multiplica o acoplamento à
implementação e a dificuldade de rastrear de onde um comportamento vem.

**Herança com mais de um eixo de variação.** Explode combinatoriamente.

**Composição quando ela produz delegação cega.** Se a classe composta apenas
repassa vinte métodos ao objeto interno, ela não está compondo — está imitando
herança com mais código. Ali, ou a herança era adequada, ou a fronteira está
errada.

**Composição levada ao extremo.** Um sistema em que todo comportamento é um
objeto injetado pode ficar tão difícil de seguir quanto uma hierarquia profunda.

## Alternativas

- **Funções de primeira classe** — quando o que varia é um comportamento simples,
  passar uma função é mais leve que ambas.
- **Traits ou mixins** — em linguagens que os oferecem, ficam entre os dois.
- **Duplicação** — para dois casos com semelhança superficial, ver
  [DRY](/02-software-design/dry.md).

## Trade-offs

| Herança | Composição |
|---|---|
| Menos código para escrever | Mais código explícito |
| Reúso automático | Delegação manual |
| Acoplada à implementação da base | Acoplada só à interface |
| Um eixo de variação | Eixos combináveis |
| Relação fixa em tempo de compilação | Configurável em execução |
| Risco de quebrar substituibilidade | Sem esse risco |

## Modos de Falha

**Hierarquia explosiva.** Segundo eixo de variação aparece e o número de classes
multiplica.

**Subclasse que recusa.** Sobrescreve um método para lançar exceção — violação de
Liskov declarada.

**Problema da classe base frágil.** Mudança interna na superclasse quebra
subclasses que não foram tocadas.

**Herança por conveniência.** `UsuarioService extends BaseService` só para ganhar
um método de log.

**Delegação cega.** Composição que repassa tudo, sem acrescentar nada.

## Exemplo Real

Um sistema de relatórios tinha `RelatorioBase` com `buscarDados()`,
`formatar()` e `enviar()`, e onze subclasses.

Quando surgiu a necessidade de enviar o mesmo relatório por e-mail e por API, a
hierarquia não comportou: o envio estava amarrado ao tipo de relatório. A solução
adotada foi um parâmetro `tipoDeEnvio` em `enviar()`, com um `switch`.

Seis meses depois, formatos: PDF, CSV, XLSX. Segundo `switch`.

Ao final, `RelatorioBase` tinha 300 linhas, dois `switch`, e as onze subclasses
sobrescreviam entre um e cinco métodos cada, de formas que ninguém conseguia
prever sem ler todas.

A reformulação por composição:

```text
Relatorio(fonteDeDados, formatador, canalDeEnvio)

  fontes:      11 implementações — a variação real
  formatadores: 3
  canais:       2
```

Dezesseis peças em vez de onze classes com dois `switch` embutidos. E as
combinações novas passaram a ser configuração, não código.

O detalhe que importa: as onze fontes de dados continuaram sendo onze
implementações de uma interface. A herança de contrato permaneceu. O que saiu foi
a herança de implementação.

## Uma tabela de decisão

Diante de uma escolha concreta, quatro perguntas em ordem:

| Pergunta | Se sim | Se não |
|---|---|---|
| A substituibilidade vale sem exceção? | continue | **componha** |
| Existe mais de um eixo de variação? | **componha** | continue |
| Você quer herdar contrato ou implementação? | contrato: **herde** | implementação: continue |
| A hierarquia é rasa e fechada? | **herde** | **componha** |

A primeira pergunta elimina a maior parte dos casos. A terceira é a que mais
salva: herdar de interface ou classe abstrata pura é seguro; herdar código não é.

Um caso limite que vale nomear: **frameworks que exigem herança**. Estender uma
classe base de framework para obter o comportamento dele é herança de
implementação com todos os seus custos, e frequentemente não há alternativa.
A mitigação é manter essa classe fina — que ela seja um adaptador que delega
para código seu, e não o lugar onde a lógica mora.

## Conceitos Relacionados

- [SOLID](/02-software-design/solid.md) — o princípio de substituição de Liskov.
- [Encapsulamento](/02-software-design/encapsulation.md) — o que a herança de implementação quebra.
- [Interfaces](/02-software-design/interfaces.md) — herança de contrato.
- [Code Smells](/02-software-design/code-smells.md) — como reconhecer hierarquias problemáticas.

## Exercício Prático

Encontre a hierarquia mais profunda do seu sistema. Para cada subclasse, aplique
o teste de substituibilidade: existe algum lugar que aceita a base e quebraria
com esta subclasse?

Depois conte os eixos de variação que a hierarquia tenta acomodar. Mais de um é
sinal de que composição serviria melhor.

## Perguntas de Entrevista

- Quando herança é a escolha correta?
- O que é o problema da classe base frágil?
- Como uma violação de Liskov pode passar pelo compilador e pelos testes?

## Para Aprofundar

- Gamma, Erich et al. *Design Patterns*. Addison-Wesley, 1994 — a formulação
  original de "prefira composição a herança".
- Liskov, Barbara; Wing, Jeannette. *A Behavioral Notion of Subtyping*. TOPLAS,
  1994.
- Bloch, Joshua. *Effective Java*. 3ª ed., 2018 — "favoreça composição sobre
  herança".
