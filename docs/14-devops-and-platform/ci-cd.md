---
id: ci-cd
title: Integração e Entrega Contínuas
sidebar_position: 1
description: Três termos frequentemente confundidos — e por que a maioria dos times não pratica o primeiro.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor distingue integração, entrega e implantação contínuas, e
  identifica o que impede cada uma no seu contexto.
prerequisites: [devops-and-platform]
related: [deployment-strategies, feature-flags, environment-management]
canonical_for: [integração contínua, entrega contínua, implantação contínua, esteira, lote pequeno]
content_version: 1
last_reviewed: 2026-08-28
---

# Integração e Entrega Contínuas

## Visão Geral

Três termos, três coisas diferentes:

```text
integração contínua   todo mundo integra ao ramo principal ao menos diariamente,
                      com verificação automatizada
entrega contínua      o ramo principal está sempre pronto para ir a produção
implantação contínua  cada mudança que passa vai a produção automaticamente
```

O primeiro é o mais difícil e o mais frequentemente reivindicado sem ser praticado: ter
uma esteira que roda testes num ramo de longa duração **não é** integração contínua.

## Problema

Ramos de longa duração acumulam divergência. Quanto mais tempo separados, mais difícil
a integração — e o conflito não é apenas textual: é semântico, entre mudanças que
assumiram estados diferentes do código.

A consequência prática:

```text
integração diária    conflitos pequenos, resolvidos em minutos
integração semanal   conflitos maiores, algumas horas
integração mensal    dias de trabalho, com defeitos introduzidos na resolução
```

O custo cresce de forma não linear com o tempo de separação. E ele é pago de uma vez, no
fim, quando já não há como estimá-lo.

## Conceitos Centrais

### Integração contínua exige lotes pequenos

A prática, sem meias palavras: **todo desenvolvedor integra ao ramo principal ao menos
uma vez por dia**.

Isso é incompatível com ramos de funcionalidade que vivem semanas. E a objeção imediata
— "mas a funcionalidade não está pronta" — tem resposta:

**Integrar não é liberar.** Código incompleto pode estar no ramo principal, desde que
não seja alcançável. Ver [feature flags](/14-devops-and-platform/feature-flags.md).

**Dividir a mudança.** A maioria das funcionalidades pode ser entregue em fatias que não
quebram nada — estrutura primeiro, comportamento depois.

**Padrão de expansão e contração.** Adicionar o novo, migrar, remover o antigo — em três
integrações, em vez de uma grande.

Times que não conseguem integrar diariamente costumam ter um problema de decomposição
de tarefas, não de ferramenta.

### A esteira é o mecanismo, não a prática

Uma esteira que roda testes é necessária e não suficiente. O que caracteriza a prática:

```text
integração frequente   diária, ao ramo principal
verificação rápida     minutos, não horas
ramo principal sempre verde  quebrou, conserta-se antes de qualquer outra coisa
sem ramo de longa duração
```

A terceira linha é a que distingue times que praticam dos que têm ferramenta: um ramo
principal quebrado por horas significa que ninguém pode integrar com confiança, e a
prática colapsa.

E a segunda importa mais do que parece: uma esteira de 40 minutos desencoraja integrar
com frequência. Abaixo de dez minutos, ela deixa de ser atrito.

### Entrega contínua é sobre estar pronto

O ramo principal está sempre em estado implantável. A implantação em si pode ser
manual, agendada, ou depender de decisão de negócio.

O que ela exige:

```text
verificação suficiente     confiança de que o que passou funciona
implantação automatizada   sem passos manuais
reversão testada           voltar em minutos
migrações compatíveis      esquema evolui sem quebrar a versão anterior
```

A última é a mais esquecida e a que mais impede: uma migração que exige que código e
banco mudem juntos torna a implantação um evento coordenado, e a reversão impossível.

Ver [evolução de esquema](/08-integration-architecture/schema-evolution.md).

### Implantação contínua é uma decisão, não o objetivo

Ir a produção automaticamente a cada mudança exige confiança alta na verificação
automatizada — e nem todo contexto comporta.

```text
faz sentido       produto web, mudanças pequenas, reversão rápida, boa cobertura
não faz sentido   software regulado com aprovação obrigatória
                  sistemas embarcados
                  onde a reversão é cara ou impossível
```

Entrega contínua é o objetivo universal: estar sempre pronto. Implantar automaticamente
é uma escolha sobre o que fazer com essa prontidão.

Times que perseguem implantação contínua sem ter entrega contínua estão automatizando um
caminho em que não confiam.

### Verificação em camadas

Uma esteira que roda tudo em toda mudança fica lenta e desencoraja a integração.

```text
antes do envio     verificação estática, testes unitários — segundos
na integração      testes de unidade e de contrato — minutos
antes de produção  integração e ponta a ponta, subconjunto crítico — minutos
em produção        testes de fumaça, canary, monitoramento
```

O princípio: falhe o mais cedo e o mais barato possível. E aceite que parte da
verificação acontece **em produção** — o que muda a postura sobre reversibilidade.

Ver [canary](/14-devops-and-platform/canary.md).

### Testes instáveis destroem a prática

Um teste que falha aleatoriamente treina o time a reexecutar em vez de investigar. Uma
vez estabelecido esse hábito, a esteira deixa de ser sinal.

O tratamento precisa ser agressivo: teste instável é removido ou corrigido, com prazo.
Mantê-lo "porque às vezes pega algo" custa mais do que rende.

E a instabilidade precisa ser medida — proporção de execuções que falham e passam na
reexecução — ou ela cresce sem que ninguém perceba.

## Modelo Mental

**Integrar frequentemente torna cada integração barata.** O resto — entrega, implantação
— é o que se faz com o ramo principal confiável.

## Quando Usar

- Praticamente sempre, para os dois primeiros.
- Implantação contínua onde a reversão é rápida e a verificação é confiável.
- Prioridade alta quando há vários times no mesmo código.

## Quando Não Usar

**Chamando de integração contínua** um ramo de longa duração com esteira.

**Implantação contínua** sem reversão testada.

**Esteira lenta.** Ela desencoraja a prática que deveria habilitar.

**Convivendo com testes instáveis.**

**Sem migrações compatíveis.** A implantação vira evento coordenado.

**Com aprovação manual em cada mudança**, que é o gargalo real na maioria dos casos.

## Alternativas

- **Entrega em cadência fixa** — semanal ou quinzenal, com lotes maiores. Legítimo em
  contextos regulados.
- **Ramos de curta duração** — um a dois dias, integrados rapidamente. Meio-termo
  praticável.
- **Desenvolvimento baseado em tronco com flags** — a forma que sustenta integração
  diária. Ver [feature flags](/14-devops-and-platform/feature-flags.md).

## Trade-offs

| Lotes pequenos | Lotes grandes |
|---|---|
| Conflitos triviais | Custosos |
| Fácil de diagnosticar | Difícil isolar a causa |
| Reversão precisa | Reverte tudo |
| Mais implantações | Menos eventos |

| Implantação contínua | Com decisão humana |
|---|---|
| Menor tempo até produção | Controle |
| Exige verificação confiável | Tolera lacunas |
| Reversão precisa ser rápida | Mais margem |

## Modos de Falha

**Ramo principal quebrado por horas.** Ninguém integra.

**Esteira lenta.** Integração desencorajada.

**Testes instáveis.** A esteira deixa de ser sinal.

**Ramos de longa duração.** Conflito semântico na integração.

**Migração acoplada ao código.** Implantação coordenada, reversão impossível.

**Aprovação como gargalo.** A automação está pronta e a fila humana não.

**Verificação insuficiente.** Implantação contínua propagando defeito.

## Erros Comuns

**Confundir esteira com integração contínua.** Ter build automatizado não é integrar continuamente. Integração contínua é todo mundo mesclando no tronco pelo menos uma vez por dia; sem isso, a esteira só automatiza a integração tardia.

**Ramos de funcionalidade de semanas.** O conflito de mesclagem cresce com o tempo e com o número de ramos abertos, e a integração vira um evento arriscado em vez de rotina.

**Tolerar testes instáveis.** Um teste que falha às vezes ensina o time a reexecutar sem olhar — e a partir daí a suíte inteira deixa de ser sinal.

**Não medir o tempo da esteira.** Acima de dez ou quinze minutos, as pessoas param de esperar o resultado e passam a agrupar mudanças, o que desfaz o benefício da integração frequente.

**Não tornar migrações compatíveis.** Migração que quebra a versão anterior impede reversão. Expandir o esquema, migrar e só depois contrair é o que preserva a saída de emergência.

**Automatizar a implantação sem automatizar a reversão.** Implantar rápido e reverter manualmente aumenta a exposição: encurta-se o caminho para o erro e mantém-se longo o caminho de volta.

## Exemplo Real

Uma empresa de serviços financeiros afirmava praticar integração contínua: havia esteira,
testes automatizados, e implantação com um clique.

A medição do fluxo real mostrou outra coisa:

```text
duração média de um ramo de funcionalidade   17 dias
tempo da esteira                              38 minutos
ramo principal quebrado                       cerca de 6 horas por semana
taxa de testes instáveis                      4% das execuções
tempo entre integração e produção             11 dias
```

Ramos de 17 dias não são integração contínua. E as consequências apareciam como
"problemas de qualidade":

**Conflitos semânticos.** Duas funcionalidades que assumiam estados diferentes do mesmo
módulo, integradas com duas semanas de diferença. O conflito textual foi resolvido; o
comportamental foi para produção.

**Diagnóstico difícil.** Uma implantação levava 11 dias de mudanças de cinco pessoas.
Quando algo quebrava, isolar a causa levava horas.

**Reversão de tudo.** Reverter significava desfazer o trabalho de todos.

As mudanças, em ordem:

**Esteira de 38 para 7 minutos.** Paralelização, cache de dependências, e movimentação
dos testes lentos para uma etapa posterior. Isso sozinho mudou o comportamento — as
pessoas passaram a integrar mais.

**Testes instáveis** medidos e tratados. Onze foram removidos, quatro corrigidos. A
regra passou a ser: falhou duas vezes sem mudança de código, sai da esteira em 48 horas.

**Ramo principal como prioridade absoluta.** Quebrou, quem quebrou conserta ou reverte,
antes de qualquer outra coisa. O tempo quebrado caiu para menos de 20 minutos por
semana.

**Fatias menores.** Treinamento sobre expansão e contração, e uso de
[feature flags](/14-devops-and-platform/feature-flags.md) para integrar código incompleto. A duração média dos
ramos caiu de 17 dias para 1,4.

**Migrações compatíveis** obrigatórias, verificadas em revisão.

Resultado em nove meses: tempo entre integração e produção de 11 dias para 4 horas,
implantações de 2 por semana para 31, e incidentes causados por implantação reduzidos
pela metade.

A conclusão registrada: a ferramenta estava correta desde o início. O que faltava era a
prática — e a mudança que mais destravou foi reduzir o tempo da esteira, que era vista
como detalhe de infraestrutura.

## Conceitos Relacionados

- [Estratégias de Implantação](/14-devops-and-platform/deployment-strategies.md).
- [Feature Flags](/14-devops-and-platform/feature-flags.md) — o que permite integrar sem liberar.
- [Gestão de Ambientes](/14-devops-and-platform/environment-management.md).
- [Evolução de Esquema](/08-integration-architecture/schema-evolution.md).

## Exercício Prático

Meça a duração média dos ramos do seu time e o tempo da sua esteira.

Se os ramos vivem mais de dois dias, você não pratica integração contínua — e se a
esteira leva mais de dez minutos, é provável que essa seja a causa.

## Perguntas de Entrevista

- Qual a diferença entre integração, entrega e implantação contínuas?
- Por que ter esteira não significa praticar integração contínua?
- Por que migrações compatíveis são pré-requisito de entrega contínua?

## Para Aprofundar

- Humble, Jez; Farley, David. *Continuous Delivery*. Addison-Wesley, 2010.
- Forsgren, Nicole et al. *Accelerate*. IT Revolution, 2018.
- Fowler, Martin. *Continuous Integration*, 2006.
