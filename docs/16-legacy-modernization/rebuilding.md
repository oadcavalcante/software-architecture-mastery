---
id: rebuilding
title: Reconstrução
sidebar_position: 7
description: Escrever de novo — a estratégia mais cara, mais arriscada, e a escolhida por reflexo.
doc_type: concept
level: 6
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor reconhece as poucas condições que justificam reconstruir e as
  razões estruturais pelas quais reescritas falham.
prerequisites: [migration-strategies]
related: [migration-strategies, legacy-refactoring, strangler-fig]
canonical_for: [reconstrução, reescrita completa, segundo sistema, alvo em movimento]
content_version: 1
last_reviewed: 2026-08-28
---

# Reconstrução

## Visão Geral

Reconstruir é escrever o sistema de novo, com o mesmo escopo, em tecnologia nova ou com
modelo novo.

É a estratégia mais cara, mais arriscada, e a que demora mais para entregar valor. E é a
escolhida por reflexo, com frequência, sem que as alternativas sejam avaliadas.

Ela se justifica em condições específicas. Fora delas, ela produz o padrão conhecido:
anos de trabalho, um sistema novo que faz menos que o antigo, e um projeto que consumiu
o apoio que tinha.

## Problema

Reescritas falham por razões estruturais, não por incompetência:

**Alvo em movimento.** O sistema antigo continua evoluindo. O novo persegue algo que muda
— e cada funcionalidade adicionada ao antigo aumenta a distância.

**Conhecimento embutido.** O código antigo contém regras que ninguém documentou,
acumuladas em anos de operação. Ver
[sistemas legados](legacy-systems.md).

**Valor no fim.** Nada é entregue até a troca. Um projeto de dois anos consome apoio
durante 24 meses sem mostrar resultado.

**Escopo que cresce.** "Já que estamos reescrevendo, vamos aproveitar para..." — e o
escopo do novo passa o do antigo.

Nenhuma dessas é evitável por esforço. Elas são propriedades da abordagem.

## Conceitos Centrais

### Quando reconstruir se justifica

Sendo restritivo, porque a lista é curta:

```text
o modelo de domínio está errado       o negócio mudou; o modelo reflete o antigo
a tecnologia impede o requisito       e não há caminho de migração
o sistema é pequeno                   semanas, não anos
o comportamento precisa mudar         reproduzir o atual não é o objetivo
não há como interceptar               strangler fig inviável
```

A primeira é a mais legítima e a mais rara. Refatoração melhora a estrutura de um modelo;
ela não conserta um modelo que representa o negócio errado.

E a terceira merece atenção: um sistema que se reescreve em seis semanas não tem os
problemas descritos aqui. A discussão vale para sistemas grandes.

### O segundo sistema é o perigoso

Um efeito conhecido: quem reescreve tende a incluir tudo o que gostaria de ter feito na
primeira vez.

```text
o antigo tem 40 funcionalidades
o novo terá as 40, mais 15 melhorias, mais a arquitetura ideal
```

O resultado é um sistema com escopo maior que o original, construído sob a pressão de
substituir algo que funciona.

O controle: **paridade estrita como primeiro objetivo**. O novo faz o que o antigo faz, e
nada além. Melhorias vêm depois de o antigo estar desligado.

Isso é impopular e é o que torna o projeto executável.

### A paridade é mais difícil do que parece

Reproduzir o comportamento do antigo exige conhecê-lo — e ele não está documentado.

O caminho que funciona:

```text
testes de caracterização sobre o antigo    capturam o comportamento real
o novo é validado contra eles              não contra a especificação
comparação em produção                     os dois processam, compara-se o resultado
```

Ver [refatoração de legado](legacy-refactoring.md) e
[implantação sombra](../14-devops-and-platform/deployment-strategies.md).

A comparação em produção é o controle mais forte: o novo processa o mesmo tráfego, sem
responder ao usuário, e as divergências apontam onde ele diverge.

Sem isso, a paridade é uma suposição — verificada quando o novo entra em produção e
alguém reclama.

### Reconstruir não dispensa strangler fig

Um erro comum: assumir que reconstruir significa construir tudo e trocar de uma vez.

As duas coisas são independentes. É possível — e quase sempre melhor — reconstruir
**incrementalmente**, com o novo assumindo funcionalidades gradualmente. Ver
[strangler fig](strangler-fig.md).

Isso remove a propriedade mais danosa da reescrita: o valor concentrado no fim.

A reescrita com troca única se justifica apenas quando não há ponto de interceptação
possível.

### O sistema antigo precisa ser congelado

Se o antigo continua recebendo funcionalidades durante a reconstrução, o novo nunca
alcança.

```text
congelar o antigo   funcionalidade nova vai para o novo, ou espera
não congelar        o novo persegue um alvo que se move
```

Congelar tem custo de negócio, e ele precisa ser negociado antes — não descoberto no meio.

Onde congelar não é possível, estrangulamento é a resposta: funcionalidade nova é
construída no sistema novo desde o início.

### O prazo é o que mata

Reconstruções de sistemas grandes levam anos. E anos são mais tempo do que o apoio
organizacional costuma durar. Ver
[restrições organizacionais](organizational-constraints.md).

A verificação honesta antes de começar: **este projeto sobrevive à saída do patrocinador,
a uma mudança de prioridade, e a dois ciclos de orçamento?**

Se a resposta for não, a abordagem precisa ser outra — ou o projeto vai ser interrompido
pela metade.

## Modelo Mental

**Reconstruir é a última opção.** Ela se justifica quando o modelo está errado, e falha
por razões que não se resolvem com esforço.

## Quando Usar

- O modelo de domínio não representa mais o negócio.
- O sistema é pequeno o suficiente para semanas.
- O comportamento precisa mudar, não ser reproduzido.
- Não há ponto de interceptação para estrangular.
- As demais estratégias foram avaliadas e não resolvem.

## Quando Não Usar

**Por reflexo**, sem avaliar refatorar, replataformar e substituir.

**Com escopo maior que o do sistema antigo.**

**Sem congelar o antigo** ou usar estrangulamento.

**Sem testes de caracterização** para validar paridade.

**Em sistema grande, com troca única.**

**Quando o prazo excede a duração provável do apoio.**

## Alternativas

- **[Refatoração](legacy-refactoring.md)** — quando o modelo está certo.
- **[Strangler Fig](strangler-fig.md)** — reconstruir incrementalmente.
- **[Replataforma](replatforming.md)** — quando o problema é a infraestrutura.
- **[Substituição](replacing.md)** — quando existe produto de mercado.
- **Reconstruir apenas a parte com modelo errado** — frequentemente a resposta correta.

A última merece destaque: sistemas raramente têm o modelo inteiro errado. Ver
[estratégias de migração](migration-strategies.md).

## Trade-offs

| Reconstruir | Refatorar |
|---|---|
| Modelo novo | Mantido |
| Conhecimento embutido perdido | Preservado |
| Valor no fim | Contínuo |
| Custo alto | Incremental |
| Tecnologia nova | Mantida |

| Com strangler fig | Troca única |
|---|---|
| Valor cedo | No fim |
| Coexistência | Sem |
| Reversível por fatia | Evento único |

## Modos de Falha

**Alvo em movimento.** O antigo evolui mais rápido.

**Escopo crescido.** O novo faz mais que o antigo, e nunca termina.

**Paridade não alcançada.** O novo entra em produção fazendo menos.

**Conhecimento perdido.** Regras que ninguém sabia que existiam.

**Apoio esgotado.** Interrompido pela metade.

**Troca única falhando.** O evento de corte dá errado, e a volta é cara.

## Erros Comuns

**Não avaliar as alternativas.**

**Não impor paridade estrita.**

**Não congelar o antigo.**

**Não escrever testes de caracterização.**

**Reconstruir com troca única** em sistema grande.

**Reconstruir o sistema inteiro** quando o modelo errado é de uma parte.

## Exemplo Real

Uma empresa de serviços financeiros reescreveu o sistema de gestão de investimentos — 12
anos, 200 mil linhas.

O projeto foi aprovado com estimativa de 18 meses e escopo de paridade.

O que aconteceu:

**Escopo cresceu no mês 3.** A área de produto pediu melhorias que "seriam fáceis já que
estamos reescrevendo". Vinte e três funcionalidades novas entraram.

**O antigo não foi congelado.** Ele recebeu 14 mudanças regulatórias em dois anos —
obrigatórias, não negociáveis. Cada uma precisou ser feita duas vezes.

**Paridade não verificada.** Não havia testes de caracterização. A validação era contra
uma especificação escrita no início do projeto, que descrevia o que se acreditava que o
sistema fazia.

**Troca única no mês 31.** O corte foi feito num fim de semana, com reversão prevista.

Na segunda-feira, 40 problemas foram reportados. Vinte e oito eram comportamentos do
sistema antigo que não estavam na especificação — regras de cálculo de rentabilidade,
tratamento de eventos corporativos, arredondamentos específicos por tipo de fundo.

A reversão foi acionada no terceiro dia. O sistema antigo voltou, e o projeto ficou
suspenso por quatro meses.

A retomada mudou a abordagem:

**Testes de caracterização** escritos sobre o sistema antigo. Foram 1.100 casos, e eles
revelaram 60 comportamentos que a especificação não continha.

**Comparação em produção.** O sistema novo passou a processar o mesmo tráfego em paralelo,
sem responder, com comparação automática. Durante cinco meses, isso encontrou 130
divergências.

**Estrangulamento** substituindo a troca única. Funcionalidades migradas uma a uma, com
reversão por funcionalidade.

**Escopo devolvido à paridade.** As 23 melhorias foram adiadas para depois do
desligamento — e, quando ele veio, 15 delas já não eram desejadas.

O sistema antigo foi desligado no mês 47 — 29 meses além da estimativa original.

O que a equipe registra: a decisão de reconstruir era defensável; o modelo de dados
realmente não suportava os produtos que o negócio queria lançar. O que custou 29 meses
adicionais foram as três decisões de execução: escopo crescido, antigo não congelado, e
paridade não verificada.

## Conceitos Relacionados

- [Estratégias de Migração](migration-strategies.md) — as alternativas.
- [Strangler Fig](strangler-fig.md) — reconstruir incrementalmente.
- [Sistemas Legados](legacy-systems.md) — o conhecimento embutido.
- [Restrições Organizacionais](organizational-constraints.md).

## Exercício Prático

Se você considera reconstruir um sistema, escreva o que ele faz — completamente.

Depois compare com testes de caracterização sobre o comportamento real. A diferença entre
as duas listas é o que uma reescrita perderia.

## Perguntas de Entrevista

- Por que reescritas falham por razões estruturais?
- O que é o efeito do segundo sistema, e como se controla?
- Por que reconstruir não dispensa strangler fig?

## Para Aprofundar

- Brooks, Frederick. *The Mythical Man-Month*. Addison-Wesley, 1975 — o segundo sistema.
- Spolsky, Joel. *Things You Should Never Do*, 2000.
- Feathers, Michael. *Working Effectively with Legacy Code*. Prentice Hall, 2004.
