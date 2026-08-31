---
id: layering
title: Camadas
sidebar_position: 11
description: O arranjo de fronteiras mais usado e mais mal aplicado — e o que ele custa quando o eixo está errado.
doc_type: concept
level: 2
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor avalia se uma divisão em camadas corresponde ao eixo de
  mudança do sistema e reconhece camadas que só repassam.
prerequisites: [boundaries]
related: [modular-design, package-design, clean-architecture]
canonical_for: [camadas, arquitetura em camadas, layered]
content_version: 1
last_reviewed: 2026-08-26
---

# Camadas

## Visão Geral

Camadas são um arranjo de fronteiras em que cada nível só conhece o de baixo. É
o padrão estrutural mais difundido e o mais frequentemente aplicado sem que
ninguém pergunte se ele serve àquele sistema.

## Problema

A divisão canônica — apresentação, aplicação, domínio, infraestrutura — organiza o
código por **tipo técnico**. Isso é ortogonal ao eixo em que os sistemas de fato
mudam, que é o de capacidade de negócio.

O sintoma é mensurável: numa arquitetura em camadas aplicada a um sistema que
muda por capacidade, quase todo commit toca todas as camadas. Adicionar um campo
ao cadastro passa pelo controlador, pelo serviço, pelo repositório e pela entidade.

A camada não conteve nada. Ela apenas distribuiu a mesma mudança por quatro
diretórios, e adicionou tradução entre eles.

Isso não torna camadas erradas. Torna-as **erradas como divisão primária** na
maior parte dos sistemas de negócio.

## Conceitos Centrais

### A regra da camada

Cada camada só depende da imediatamente inferior. Chamadas para cima são
proibidas; chamadas que pulam níveis são a variante *relaxada*, que é comum e
enfraquece a estrutura.

A regra existe para garantir que a mudança de uma camada não alcance as
superiores. Ela cumpre isso — para mudanças que de fato são de uma camada só.

### Camada como divisão secundária

O arranjo que funciona na maioria dos sistemas de negócio inverte a hierarquia:
**módulo por capacidade primeiro, camada dentro de cada módulo**.

```text
❌ camada primária              ✅ capacidade primária
   controllers/                   cobranca/
     PedidoController               api/  aplicacao/  dominio/  infra/
     ClienteController            catalogo/
   services/                        api/  aplicacao/  dominio/  infra/
     PedidoService                entrega/
     ClienteService                 api/  aplicacao/  dominio/  infra/
   repositories/
     ...
```

À direita, uma mudança em cobrança fica em cobrança. As camadas continuam
existindo e continuam impondo direção de dependência — mas dentro de uma
fronteira que corresponde ao eixo de mudança.

### Onde camadas funcionam bem como divisão primária

- **Sistemas com pouca lógica de domínio e muita variação técnica.** Um gateway,
  um adaptador de protocolo, um ETL.
- **Sistemas pequenos**, onde qualquer divisão serve e a mais convencional
  reduz atrito de onboarding.
- **Quando a variação real é por camada.** Uma aplicação com três interfaces de
  usuário — web, móvel, terminal — sobre o mesmo domínio tem variação genuína na
  camada de apresentação.

### Camada anêmica

Uma camada que apenas repassa chamadas para a seguinte não separa nada. Ela
adiciona um arquivo, uma tradução de tipos e um salto na navegação, sem esconder
nenhuma decisão.

O teste: se remover a camada não obriga ninguém a saber algo novo, ela não estava
escondendo nada.

## Modelo Mental

**Camada é uma fronteira horizontal. Módulo é vertical.** A pergunta é qual das
duas corresponde ao eixo em que seu sistema muda — e a resposta, em sistemas de
negócio, é quase sempre a vertical.

## Quando Usar

- Como divisão **dentro** de um módulo de capacidade — quase sempre útil.
- Como divisão primária quando a variação real é técnica, não de domínio.
- Em sistemas pequenos, pela convencionalidade.
- Quando é preciso impor direção de dependência entre política e detalhe.

## Quando Não Usar

**Como divisão primária num sistema de negócio de porte médio ou maior.** É o erro
dominante, e o custo aparece como "toda mudança toca tudo".

**Quando as camadas apenas repassam.** Se a camada de aplicação chama o serviço
que chama o repositório sem acrescentar nada, há uma camada a menos do que parece.

**Quando o número de camadas cresce por simetria.** Cinco, seis camadas porque
"faltava uma para DTOs". Cada uma cobra tradução.

**Quando a regra é relaxada até desaparecer.** Se pular camadas é permitido e
comum, a estrutura é decorativa e o custo permanece.

## Alternativas

- **Módulo por capacidade, camada interna** — o arranjo que funciona na maioria
  dos casos.
- **[Ports and Adapters](/02-software-design/ports-and-adapters.md)** — troca a metáfora de pilha
  pela de dentro e fora, com uma única regra de direção.
- **Vertical slice** — organizar por caso de uso, com tudo que ele precisa junto.
- **Sem camadas** — em sistemas pequenos, um pacote plano é honesto.

## Trade-offs

| Camadas como divisão primária | Módulo como divisão primária |
|---|---|
| Convencional, onboarding fácil | Exige explicação inicial |
| Direção de dependência clara | Direção dentro de cada módulo |
| Mudança de negócio toca tudo | Mudança fica contida |
| Variação técnica isolada | Variação técnica se repete por módulo |
| Um lugar para cada tipo de arquivo | Mesmo tipo em vários lugares |

## Modos de Falha

**Toda mudança atravessa todas as camadas.** O sintoma principal.

**Camada anêmica.** Repassa e não esconde.

**Vazamento vertical.** A entidade de persistência chega ao controlador. As
camadas existem e não separam.

**Regra relaxada.** Pular camadas vira norma; a direção deixa de valer.

**Camada de tradução dominante.** Mais código convertendo tipos entre camadas do
que implementando regra de negócio.

## Erros Comuns

**Adotar camadas por default, sem perguntar o eixo.** A raiz.

**Confundir camadas com [Clean Architecture](/02-software-design/clean-architecture.md).** A segunda
tem uma regra de direção específica que a primeira não tem.

**Criar uma camada para cada tipo de objeto.** DTOs, mapeadores, validadores em
camadas próprias produz travessia constante.

**Achar que camadas garantem baixo acoplamento.** Um sistema em camadas pode ter
acoplamento severo dentro de cada uma.

## Exemplo Real

Um sistema de gestão escolar com quatro camadas e 60 mil linhas. A medição de seis
meses de commits: 91% tocavam três ou mais camadas.

A reorganização manteve as quatro camadas, mas as colocou dentro de seis módulos
de capacidade: matrícula, notas, frequência, financeiro, comunicação, relatórios.

Depois: 74% dos commits tocavam um único módulo.

O que não mudou: a regra de direção continuou valendo, e continuou verificada por
teste de arquitetura. O domínio de cada módulo continua sem depender de
infraestrutura.

O que mudou: a fronteira que contém a mudança passou a ser a vertical. As camadas
seguem úteis — dentro de cada módulo, para separar política de detalhe.

O erro original não foi usar camadas. Foi usá-las como divisão de topo.

## Quantas camadas

O número tende a crescer por acúmulo, e cada camada adicional cobra tradução em
toda travessia.

Um critério para justificar cada uma: **ela esconde uma decisão que as vizinhas
não precisam conhecer?** Se remover a camada não obriga ninguém a saber algo
novo, ela não estava escondendo nada.

Na prática, três camadas cobrem a maioria dos casos dentro de um módulo:

| Camada | Esconde |
|---|---|
| Entrada | O protocolo — HTTP, fila, terminal |
| Aplicação e domínio | Nada de fora; é a política |
| Saída | A tecnologia de persistência e de integração |

A quarta camada aparece quando aplicação e domínio de fato divergem — quando há
regras que envolvem múltiplas entidades e não pertencem a nenhuma. Ver
[Onion](/02-software-design/onion-architecture.md).

A quinta em diante costuma ser tradução de tipos elevada a camada, e é onde
convém desconfiar.

## Conceitos Relacionados

- [Fronteiras](/02-software-design/boundaries.md) — o conceito geral do qual camadas são um arranjo.
- [Design Modular](/02-software-design/modular-design.md) — a divisão vertical.
- [Clean Architecture](/02-software-design/clean-architecture.md) — camadas com regra de direção
  explícita.
- [Ports and Adapters](/02-software-design/ports-and-adapters.md) — a alternativa por dentro e fora.

## Exercício Prático

Meça: nos últimos seis meses, que fração dos commits do seu sistema tocou mais de
uma camada de topo?

Se for alta, liste os diretórios que aparecem juntos com mais frequência. Eles são
o módulo de capacidade que deveria ser a divisão primária.

## Perguntas de Entrevista

- Quando camadas são a divisão primária correta?
- O que é uma camada anêmica e como reconhecê-la?
- Qual a diferença entre arquitetura em camadas e Clean Architecture?

## Para Aprofundar

- Fowler, Martin. *Patterns of Enterprise Application Architecture*.
  Addison-Wesley, 2002 — a formulação clássica de camadas.
- Richards, Mark. *Software Architecture Patterns*. O'Reilly, 2015.
- Martin, Robert C. *Clean Architecture*. Prentice Hall, 2017 — a regra de
  dependência.
