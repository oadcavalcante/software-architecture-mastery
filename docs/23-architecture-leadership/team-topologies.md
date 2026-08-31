---
id: team-topologies
title: Topologias de Time
sidebar_position: 19
description: Quatro tipos de time e três modos de interação — o vocabulário que torna o desenho organizacional discutível.
doc_type: concept
level: 7
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor classifica times por tipo e interação, e reconhece quando uma
  estrutura organizacional está produzindo acoplamento evitável.
prerequisites: [conways-law]
related: [conways-law, organizational-architecture, architecture-ownership]
canonical_for: [topologias de time, modo de interação, time habilitador, time de fluxo]
content_version: 1
last_reviewed: 2026-08-29
---

# Topologias de Time

## Visão Geral

Se a arquitetura reproduz a estrutura de comunicação, então desenhar times é uma atividade
arquitetural — e ela precisa de vocabulário, ou vira improvisação.

*Team Topologies*, de Skelton e Pais, fornece esse vocabulário: quatro tipos de time e três modos
de interação entre eles.

```text
tipos de time
  de fluxo            entrega valor de ponta a ponta num domínio
  de plataforma       fornece capacidade de autoatendimento
  habilitador         transfere competência, temporariamente
  de subsistema
    complicado        cuida do que exige especialização rara

modos de interação
  colaboração         trabalho conjunto intenso, temporário
  serviço             um consome o que o outro oferece, com contrato
  facilitação         um ajuda o outro a adquirir capacidade
```

O valor do modelo não está na taxonomia. Está em tornar explícito algo que geralmente é implícito:
**qual é o modo de interação entre dois times, e ele é o certo para o momento?**

## Problema

Sem vocabulário, o desenho organizacional acontece por acúmulo:

```text
um time nasce para um projeto e permanece
outro nasce por especialidade e vira fila
um terceiro atende pedidos de todos e não entrega nada próprio
ninguém consegue dizer o que cada um faz em uma frase
```

E o sintoma mais comum é a **carga cognitiva excessiva**: um time responsável por mais coisas do
que consegue manter na cabeça. Ele não falha visivelmente — ele fica lento, propenso a erro, e
resistente a mudança. Ver
[engenharia de plataforma](/14-devops-and-platform/platform-engineering.md).

O segundo problema é o modo de interação errado: dois times em colaboração permanente, quando
deveriam ter um contrato; ou um time oferecendo serviço quando o consumidor ainda não sabe o que
pedir e precisaria de colaboração.

## Conceitos Centrais

### Time de fluxo é o padrão

```text
alinhado a um fluxo de valor: um domínio, um produto, um segmento
entrega de ponta a ponta, sem depender de outro time para concluir
propriedade completa do que constrói, incluindo operação
```

A maior parte dos times deveria ser deste tipo. Os outros três existem para **reduzir a carga
cognitiva dos times de fluxo**, e é essa a métrica que justifica cada um.

Um time de plataforma que não reduz a carga dos times de fluxo não está cumprindo sua função,
independentemente do que ele entregue.

### Time de plataforma, não de infraestrutura

A distinção decide o resultado:

```text
time de infraestrutura   recebe pedidos, executa, vira fila
time de plataforma       oferece capacidade de autoatendimento,
                         com produto, documentação e suporte
```

O modo de interação de uma plataforma é **serviço**: o time de fluxo consome quando quer, sem
pedir. Se ele precisa abrir um chamado e esperar, o modo real é colaboração assimétrica — e o
gargalo é inevitável.

Ver [centralização vs. descentralização](/20-trade-offs/centralization-vs-decentralization.md).

### Time habilitador é temporário por definição

```text
propósito     transferir competência que o time de fluxo não tem
duração       semanas a poucos meses, por engajamento
sucesso       o time de fluxo não precisa mais dele
falha         vira dependência permanente
```

O modo é **facilitação**, e a característica que o define é a data de saída. Um time habilitador
que atua indefinidamente com o mesmo time de fluxo deixou de habilitar e passou a executar.

Times de qualidade, de segurança e de dados frequentemente deveriam ser habilitadores e viram
executores — o que reproduz a fila que a estrutura existia para evitar.

### Subsistema complicado é a exceção

```text
justifica-se quando   a especialização é rara e profunda
                      — motor de risco, otimização numérica,
                      processamento de sinal
não se justifica      por conveniência, ou porque "é complexo"
```

Este é o tipo mais mal usado: qualquer componente pode ser chamado de complicado, e a
classificação vira desculpa para um time que não entrega valor de ponta a ponta.

O teste: **a especialização é tão rara que espalhá-la pelos times de fluxo é inviável?** Se não,
a competência deveria ser distribuída, possivelmente com um time habilitador temporário.

### Carga cognitiva é o limite de desenho

```text
intrínseca    a dificuldade essencial do domínio
extrínseca    o que a ferramenta e o processo acrescentam
              — é o que a plataforma deve eliminar
irrelevante   o que não deveria estar lá
```

O tamanho do escopo de um time é limitado pela carga cognitiva que ele suporta, não pela
capacidade de execução. Um time de oito pessoas responsável por doze serviços de domínios
distintos não está sobrecarregado de trabalho — está sobrecarregado de contexto.

O sintoma: as pessoas do time não conseguem explicar o que os outros componentes fazem.

### Modos de interação mudam com o tempo

```text
colaboração   quando a fronteira ainda não é conhecida
              → intenso, temporário, produz descoberta
serviço       quando a fronteira ficou clara
              → contrato, autonomia, escala
facilitação   quando falta competência, não capacidade
```

O erro mais comum é a **colaboração permanente**: dois times que trabalham juntos indefinidamente
porque a fronteira entre eles nunca foi estabelecida. Colaboração é cara — ela consome atenção dos
dois — e deve ser tratada como fase, não como estado.

A pergunta que resolve: "o que precisa ficar claro para que isto vire um contrato?"

### O modelo é ferramenta de diagnóstico

O uso mais valioso não é reorganizar tudo segundo a taxonomia. É usá-la para nomear o que está
errado:

```text
"esse time é de plataforma no nome e de infraestrutura na prática —
 ele recebe pedidos em vez de oferecer autoatendimento"

"esses dois times estão em colaboração há dois anos; ou a fronteira
 está errada, ou eles deveriam ser um só"

"o time de segurança está executando em vez de habilitar, e por isso
 é fila para dezoito times"
```

Cada uma dessas frases é acionável e não seria dita sem o vocabulário.

## Modelo Mental

**Times de fluxo entregam; os outros três existem para reduzir a carga deles.** E o modo de
interação é uma escolha que deve mudar quando a fronteira amadurece.

## Quando Usar

- Ao diagnosticar por que a entrega está lenta sem falta de pessoas.
- Ao propor reorganização junto com mudança arquitetural.
- Ao avaliar se um time central virou gargalo.
- Para nomear o modo de interação entre dois times em conflito.

## Quando Não Usar

**Como reorganização completa** por adoção de modelo — o custo de reorganizar é alto e o modelo é
melhor como diagnóstico.

**Classificando todo time** — a taxonomia serve onde esclarece.

**Criando times de plataforma** sem produto, documentação e capacidade de autoatendimento.

**Mantendo colaboração** como estado permanente.

**Chamando de complicado** o que é apenas desconhecido.

## Alternativas

- **Times por domínio, sem taxonomia formal** — funciona bem em organizações pequenas.
- **Comunidades de prática** — para disseminar competência sem criar time habilitador.
- **Rotação de pessoas** — transfere conhecimento sem estrutura nova, e é barata.

A terceira é subestimada: mover uma pessoa por três meses resolve muitos casos que se tentaria
resolver com um time habilitador.

## Trade-offs

| Times de fluxo autônomos | Times especializados |
|---|---|
| Entrega de ponta a ponta | Profundidade técnica |
| Duplicação de competência | Concentração |
| Menos coordenação | Fila |

| Plataforma como produto | Infraestrutura sob demanda |
|---|---|
| Autoatendimento, escala | Atende casos únicos |
| Investimento inicial | Vira gargalo |

## Modos de Falha

**Plataforma que é fila.** Recebe pedido em vez de oferecer.

**Habilitador permanente.** Virou executor.

**Colaboração indefinida.** Fronteira nunca estabelecida.

**Carga cognitiva excessiva.** Time lento sem falta de capacidade.

**Subsistema complicado por conveniência.**

**Times de fluxo que não conseguem entregar sozinhos.**

## Erros Comuns

**Renomear times sem mudar o modo de interação.**

**Criar time de plataforma** sem tratá-lo como produto.

**Não datar** o engajamento de um time habilitador.

**Medir carga por número de pessoas** em vez de por contexto.

**Adotar a taxonomia** como fim em si.

## Exemplo Real

Uma empresa de logística com 190 engenheiros tinha 22 times e uma queixa constante: tudo demorava,
e ninguém sabia dizer por quê. A capacidade de engenharia crescera 40% em dois anos e a entrega
não acompanhara.

Um mapeamento classificou os 22 times e os modos de interação reais — não os declarados:

```text
times de fluxo, entregando de ponta a ponta          6
times de fluxo que dependem de outro para concluir   9
times de plataforma na intenção, fila na prática     3
times habilitadores permanentes                      2
subsistema complicado, justificado                   1
subsistema complicado, injustificado                 1
```

E os modos de interação, medidos por frequência de dependência:

```text
pares de times em colaboração declarada           4
pares em colaboração de fato, não declarada      31
pares com contrato de serviço funcional           7
```

Trinta e um pares em colaboração de fato — cada um representando coordenação recorrente sem
fronteira estabelecida. Esse número explicava a lentidão melhor que qualquer análise técnica.

As mudanças, ao longo de 12 meses:

**Nove times de fluxo incompletos ganharam as competências que faltavam.** Em seis casos isso foi
feito movendo pessoas dos times centrais; em três, com times habilitadores temporários e data de
saída declarada.

**Os três times de plataforma foram reformulados como produto:** cada um passou a ter uma pessoa
de produto, documentação, e a métrica de "quantos times usam sem abrir chamado". Os pedidos que
não podiam ser atendidos por autoatendimento viraram itens de roteiro, não filas.

**Os dois habilitadores permanentes** — segurança e dados — passaram a operar por engajamento com
prazo. Segurança manteve uma função de verificação automática permanente, que é serviço, e
transferiu a revisão de desenho para os times, como facilitação com data.

**O subsistema complicado injustificado** — um time que mantinha o motor de precificação — foi
dissolvido, e a competência distribuída entre dois times de fluxo, com seis meses de habilitação.

**Colaborações não declaradas** foram tratadas caso a caso: 18 viraram contrato de serviço com
interface declarada; 7 foram resolvidas fundindo times; 6 permaneceram como colaboração
deliberada, com revisão trimestral.

Resultados após 12 meses:

```text
times de fluxo entregando de ponta a ponta           14 (de 6)
pares em colaboração de fato                         11 (de 31)
tempo médio de entrega                               -46%
uso de plataforma sem abrir chamado                  de 12% para 84%
carga cognitiva percebida (pesquisa interna)         de 3,1 para 4,2
                                                     em escala de 5
engenheiros                                          190 (inalterado)
```

O último número é o que a liderança destaca: a capacidade de entrega quase dobrou sem contratar
ninguém. O gargalo nunca tinha sido capacidade — era coordenação.

O detalhe que a equipe destaca: a medição de "colaborações de fato, não declaradas" foi o instrumento
decisivo. Ela é simples de obter — contar dependências recorrentes entre times ao longo de um
trimestre — e nenhuma organização a media.

## Conceitos Relacionados

- [Lei de Conway](/23-architecture-leadership/conways-law.md).
- [Arquitetura Organizacional](/23-architecture-leadership/organizational-architecture.md).
- [Propriedade de Arquitetura](/23-architecture-leadership/architecture-ownership.md).
- [Engenharia de Plataforma](/14-devops-and-platform/platform-engineering.md).

## Exercício Prático

Classifique os times da sua organização nos quatro tipos e liste, para cada par que interage com
frequência, qual é o modo real.

Conte quantos pares estão em colaboração sem que isso tenha sido decidido. Esse número costuma
explicar a lentidão que nenhuma análise técnica explica.

## Perguntas de Entrevista

- Por que os três tipos não-fluxo existem para reduzir carga cognitiva?
- Qual a diferença entre time de plataforma e time de infraestrutura?
- Por que colaboração permanente entre dois times é um sinal de problema?

## Para Aprofundar

- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
- Conway, Melvin. *How Do Committees Invent?*. Datamation, 1968.
- Forsgren, Nicole et al. *Accelerate*. IT Revolution, 2018.
