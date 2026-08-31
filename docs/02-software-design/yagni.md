---
id: yagni
title: YAGNI
sidebar_position: 4
description: Não construa para requisito imaginado — e por que o custo não é só o esforço desperdiçado.
doc_type: concept
level: 2
difficulty: iniciante
status: complete
objective: >
  Ao terminar, o leitor reconhece construção especulativa e distingue os casos em
  que antecipar é correto dos em que é desperdício.
prerequisites: [fundamentals]
related: [kiss, dry, solid]
canonical_for: [YAGNI, generalização especulativa]
content_version: 1
last_reviewed: 2026-08-26
---

# YAGNI

## Visão Geral

YAGNI — *You Aren't Gonna Need It* — orienta a não construir funcionalidade nem
generalização para requisitos que ainda não existem.

A formulação de Martin Fowler é precisa: aplique YAGNI a capacidades
**presumidas**, não a capacidades **conhecidas com prazo**.

## Problema

Construir para o futuro parece prudência e frequentemente é desperdício com boa
reputação.

O argumento é sempre o mesmo: "vai ser mais barato fazer agora do que depois".
Isso presume duas coisas que raramente se confirmam — que o requisito vai chegar,
e que vai chegar na forma prevista.

Mas o custo do desperdício não é o principal. Fowler identifica quatro custos, e
os três últimos são os que doem:

**Custo de construção** — o esforço gasto no que não é usado.

**Custo de atraso** — o que deixou de ser feito enquanto isso.

**Custo de carregar** — o código especulativo precisa ser entendido, mantido,
migrado e testado por todo o tempo em que existir, por todo mundo que passar por
ali. Ele aparece nas buscas, nas revisões e nas migrações de versão.

**Custo de reparo** — quando o requisito real chega diferente do previsto, é
preciso desfazer a generalização antes de fazer o certo. E desfazer é mais caro
que ter partido do zero, porque outras coisas já dependem dela.

O quarto é o que inverte a conta. A generalização errada não é neutra; ela é
negativa.

## Conceitos Centrais

### Presumido versus conhecido

| Situação | Aplicar YAGNI? |
|---|---|
| "Talvez precisemos suportar outro provedor" | Sim — presumido |
| "Contrato assinado exige multi-tenant em julho" | Não — conhecido, com prazo |
| "Um dia vamos internacionalizar" | Sim |
| "Vamos entrar no mercado europeu em Q3, com GDPR" | Não |
| "Isso pode precisar escalar" | Sim |
| "O SLO contratado é 99,9%" | Não — é requisito |

A distinção é o prazo e o compromisso. Sem os dois, é presunção.

### YAGNI não é desculpa para código ruim

Não construir o que não é necessário é diferente de construir mal o que é.

YAGNI diz para não adicionar a interface de plugin que ninguém pediu. Não diz
para escrever a funcionalidade atual sem nomes claros, sem testes ou com
acoplamento desnecessário.

A confusão entre as duas coisas é usada para justificar pressa, o que inverte o
princípio: YAGNI existe para **preservar** capacidade de mudar, e código ruim a
destrói.

### O antídoto é reversibilidade

YAGNI funciona porque adicionar depois costuma ser barato — se o código for fácil
de mudar.

Isso significa que os dois princípios andam juntos: quanto mais fácil de mudar é
o sistema, mais agressivamente YAGNI pode ser aplicado. Num sistema rígido,
antecipar tem mais justificativa — o que é um sinal de que o problema real é a
rigidez.

## Modelo Mental

**Pergunte a data.** "Quando exatamente vamos precisar disso, e quem se
comprometeu com isso?" Sem resposta, é presumido.

## Quando Usar

- Diante de qualquer construção justificada por "vamos precisar".
- Ao ver parâmetros de configuração sem chamador que os use de forma diferente.
- Ao ver interface com uma implementação criada "para poder trocar".
- Em produto em fase de descoberta, quando a maior parte do que se constrói será
  descartado.

## Quando Não Usar

**Quando o requisito é conhecido, com prazo e compromisso.** Aí não é presunção.

**Quando adicionar depois é comprovadamente caro.** Alguns casos têm assimetria
real: modelo de dados, contrato público de API, identificador de entidade,
particionamento. Adicionar multi-tenancy a um esquema com três anos de dados não
é o mesmo que adicionar um endpoint.

**Quando a escolha é entre duas opções de custo igual.** Se a versão mais geral
não custa mais, YAGNI não se aplica — não há economia a fazer.

**Em decisões de alto custo de reversão.** Ver
[o que é arquitetura](/01-fundamentals/what-is-software-architecture.md). YAGNI
é mais seguro quanto mais barato for mudar de ideia.

**Quando a "generalização" é higiene básica.** Tratar erro, validar entrada e
registrar log não são requisitos futuros.

## Alternativas

- **Adiar com opção registrada** — não construir, mas registrar a condição que
  levaria a construir. Preserva a análise sem pagar o código.
- **Construir a versão específica bem** — de forma que generalizar depois seja
  barato.
- **Feature flag** — construir e não expor, quando o requisito é conhecido mas o
  momento não.

## Trade-offs

| Aplicar YAGNI | Antecipar |
|---|---|
| Menos código para manter | Requisito futuro já atendido |
| Menos partes a entender | Sem retrabalho se a previsão acertar |
| Mudança futura custa algo | Custo pago agora, mesmo sem uso |
| Risco de assimetria real | Risco de prever errado, e pagar reparo |

## Modos de Falha

**Generalização especulativa.** Abstração para variação que não ocorreu, e que
precisa ser desmontada quando a variação real chega diferente.

**Configuração órfã.** Parâmetros que todo chamador passa com o mesmo valor.

**YAGNI aplicado a fundação.** Modelo de dados sem multi-tenancy num produto que
vendia multi-tenancy. O caso em que YAGNI é a decisão errada.

**YAGNI como desculpa.** Código sem teste e sem nome claro justificado como
simplicidade.

## Erros Comuns

**Aplicar a requisito conhecido com prazo.** Ver a tabela acima.

**Aplicar a decisões de alto custo de reversão.** Onde a assimetria é real,
antecipar é prudência.

**Ignorar o custo de carregar.** Quem defende antecipação normalmente só compara
custo de construir agora com custo de construir depois, e ignora os anos de
manutenção do código não usado.

**Confundir com "não pense no futuro".** YAGNI é sobre não *construir*. Pensar,
registrar a condição e projetar para reversibilidade é o oposto de imprudência.

## Exemplo Real

Um time construiu um sistema de notificações com abstração para "qualquer canal":
e-mail, SMS, push, webhook, com registro dinâmico de canais e roteamento
configurável.

Requisito real na época: enviar e-mail.

Três anos depois, o sistema enviava e-mail e push. Dois canais, não cinco. E a
abstração não serviu para o push: ela modelava mensagem como texto com assunto, e
push precisava de payload estruturado com ação. O canal de push foi adicionado
**contornando** a abstração.

Contabilizando: dois meses de construção inicial, três anos de manutenção de um
mecanismo de roteamento que nunca roteou nada, e um contorno permanente que
qualquer pessoa que lê o código precisa entender.

O contraste no mesmo sistema: o identificador de destinatário foi definido como
opaco desde o início, em vez de "endereço de e-mail". Isso foi antecipação — e
foi correta, porque mudar o tipo de um identificador depois de três anos de dados
é caro de forma assimétrica.

A diferença entre os dois casos não é ter previsto o futuro. É que um era barato
de adicionar depois e o outro não.

## Conceitos Relacionados

- [KISS](/02-software-design/kiss.md) — o mesmo espírito aplicado a estrutura.
- [Abstração](/01-fundamentals/abstraction.md) — o custo da generalização
  prematura.
- [Complexidade](/01-fundamentals/complexity.md) — o que a especulação adiciona.

## Exercício Prático

Encontre no seu sistema três pontos de extensão — interface, configuração,
mecanismo de plugin.

Para cada um: quantas implementações ou valores distintos existem hoje? Se for
um, quando ele foi criado e qual requisito futuro o justificava? Esse requisito
chegou?

## Perguntas de Entrevista

- Quais são os custos de construir para um requisito que não chegou?
- Quando antecipar é a decisão correta?
- Como YAGNI se relaciona com decisões de alto custo de reversão?

## Para Aprofundar

- Fowler, Martin. *Yagni*, 2015 — os quatro custos.
- Beck, Kent. *Extreme Programming Explained*. 2ª ed., 2004.
- Fowler, Martin. *Refactoring*. 2ª ed., 2018 — o code smell de generalidade
  especulativa.
