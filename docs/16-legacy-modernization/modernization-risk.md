---
id: modernization-risk
title: Risco de Modernização
sidebar_position: 11
description: O que dá errado, e os controles que reduzem a probabilidade e o dano.
doc_type: concept
level: 6
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor identifica os riscos característicos de modernização e aplica os
  controles que os endereçam.
prerequisites: [migration-strategies]
related: [organizational-constraints, data-migration, incremental-modernization]
canonical_for: [risco de modernização, risco irreversível, controle de risco]
content_version: 1
last_reviewed: 2026-08-28
---

# Risco de Modernização

## Visão Geral

Modernização é uma das atividades de maior risco em engenharia de software: ela mexe em
sistemas que funcionam, sustentam receita, e que ninguém entende completamente.

Os riscos são conhecidos e recorrentes. E a maior parte deles tem controle — o que
distingue projetos que dão certo dos que não é frequentemente saber quais aplicar.

Este documento organiza os riscos por natureza, com o controle correspondente.

## Problema

O registro de riscos típico de um projeto de modernização lista o genérico:

```text
"atraso no cronograma"
"resistência à mudança"
"complexidade técnica maior que a estimada"
```

Nenhum aponta controle. E eles omitem os riscos específicos desta atividade, que são
diferentes dos de uma construção nova.

## Conceitos Centrais

### Riscos irreversíveis merecem tratamento separado

A distinção que organiza a priorização:

```text
reversível     o projeto atrasa, custa mais, entrega menos
irreversível   dados perdidos, conhecimento perdido, obrigação descumprida
```

Os irreversíveis são poucos e merecem controle desproporcional:

```text
perda de dados na migração        → ver migração de dados
perda de conhecimento             → transferência antes de começar
desligamento prematuro do antigo  → período de suspensão, monitoramento de acesso
regra de negócio perdida          → testes de caracterização
obrigação regulatória descumprida → mapeamento explícito de requisitos
```

Ver [migração de dados](data-migration.md) e
[sistemas legados](legacy-systems.md).

### Os riscos técnicos característicos

```text
risco                             controle
paridade não alcançada            testes de caracterização, comparação em produção
comportamento desconhecido        arqueologia antes de decidir
dados que não encaixam            perfilagem antes de planejar
dependência oculta                inventário por observação, não entrevista
desempenho diferente              teste com volume real, não sintético
integração quebrada               contrato verificado, consumidores mapeados
```

O terceiro e o quarto são os que mais frequentemente aparecem como surpresa, e ambos são
detectáveis antes por observação. Ver
[arquitetura do estado atual](../15-enterprise-architecture/current-state-architecture.md).

### Os riscos de execução

```text
escopo crescendo         paridade estrita como regra; melhorias depois
alvo em movimento        congelar o antigo, ou strangler fig
valor tardio             fatias defensáveis. Ver modernização incremental
coexistência permanente  critério de conclusão e data de desligamento
estimativa como promessa faixa, não ponto; reestimar por fatia
```

O primeiro é o mais previsível: toda modernização recebe pedidos de melhoria, e aceitá-los
é o caminho de menor resistência.

### Os riscos organizacionais

Ver [restrições organizacionais](organizational-constraints.md).

```text
apoio evaporando         valor cedo, múltiplos patrocinadores
conhecimento saindo      transferência como primeira etapa
resistência              identificar quem perde, endereçar
produto parado           proporção acordada
time errado              quem vai operar participa da construção
```

Estes são os que mais frequentemente determinam o resultado, e os que menos aparecem em
registros de risco de projetos técnicos.

### Controles que valem em qualquer modernização

Independentemente da estratégia:

```text
comparação em produção      o novo processa em paralelo, sem responder
reversibilidade por fatia   cada passo tem volta
monitoramento do antigo     saber quem ainda usa
verificação de dados        múltiplos níveis, não só contagem
ensaio                       a operação de corte é repetida antes
período de suspensão        desligado, recuperável, antes de descartar
```

A primeira é a de maior valor e a menos usada: fazer o novo processar o tráfego real, sem
efeito, e comparar. Ver
[estratégias de implantação](../14-devops-and-platform/deployment-strategies.md).

Ela transforma "acreditamos que está equivalente" em evidência.

### O risco de não fazer também precisa ser registrado

A comparação assimétrica: o risco de modernizar é visível e concentrado; o de não
modernizar é difuso e contínuo.

```text
não fazer   degradação, mantenedor que sai, obrigação não atendida,
            capacidade que não pode ser entregue
```

Ver [motivadores de modernização](modernization-drivers.md).

Registrar os dois lados é o que permite a decisão informada — e é o que falta quando a
proposta é rejeitada por parecer arriscada demais.

### Alguns riscos só aparecem no ciclo completo

Sistemas têm ciclos que não se manifestam em semanas:

```text
fechamento mensal
apuração trimestral
processos anuais — declaração fiscal, renovação de contratos
sazonalidade — pico de fim de ano, safra, período letivo
```

Um sistema novo validado por dois meses não exercitou nenhum deles.

O controle: manter o antigo capaz de assumir até que ao menos um ciclo completo tenha
passado — e planejar o desligamento em função disso, não do calendário do projeto.

### O registro de risco precisa ser revisado com o que se aprende

Modernização é trabalho de descoberta, e os riscos mudam conforme o sistema é
compreendido.

```text
início        riscos hipotéticos, baseados no que se supõe
após fatia 1  riscos reais, baseados no que se encontrou
```

A arqueologia e a primeira fatia produzem informação que altera substancialmente o
registro: riscos que pareciam graves se revelam pequenos, e riscos que ninguém previu
aparecem.

O padrão que falha: o registro é escrito na aprovação do projeto e não é tocado depois. Ele
descreve as preocupações de quem não conhecia o sistema.

O que funciona: revisão a cada fatia, com três perguntas:

```text
o que descobrimos que muda a avaliação de algum risco?
que risco novo apareceu?
que controle se mostrou desnecessário?
```

A terceira importa tanto quanto as outras: controles que custam e não pegam nada devem
sair, ou eles tornam o projeto mais lento sem reduzir risco — e o excesso de cerimônia
desacredita os controles que importam.

## Modelo Mental

**Separe o reversível do irreversível.** O primeiro custa; o segundo não tem volta, e
merece controle desproporcional.

## Quando Usar

- Antes de iniciar qualquer programa de modernização.
- Na revisão periódica do programa.
- Ao decidir sobre desligamento do sistema antigo.
- Ao avaliar se o programa deve continuar.

## Quando Não Usar

**Registro genérico**, sem controle associado.

**Sem separar reversível de irreversível.**

**Sem registrar o risco de não fazer.**

**Desligando o antigo antes de um ciclo completo.**

**Confiando em verificação por amostragem** para dados críticos.

**Ignorando os riscos organizacionais** por serem "fora do escopo técnico".

## Alternativas

Formas de reduzir risco antes de qualquer controle:

- **Escopo menor.** Modernizar a parte que causa o problema. Ver
  [estratégias de migração](migration-strategies.md).
- **Fatias menores.** Reduzem exposição por passo.
- **Contenção em vez de substituição** — isolar o legado, sem mexer nele.
- **Adiar** — quando as condições não estão dadas.

## Trade-offs

| Mais controles | Menos |
|---|---|
| Risco menor | Maior |
| Projeto mais lento | Rápido |
| Custo de verificação | Nenhum |
| Confiança verificada | Presumida |

| Desligar cedo | Manter em paralelo |
|---|---|
| Custo menor | Dobrado |
| Sem volta | Reversível |
| Ciclos não exercitados | Exercitados |

## Modos de Falha

**Dados perdidos.**

**Regra de negócio perdida.** Descoberta quando alguém reclama.

**Antigo desligado cedo.** Um caso de uso esquecido.

**Problema no fechamento mensal.** Fora da janela de reversão.

**Programa interrompido sem valor.**

**Conhecimento saindo durante o projeto.**

**Escopo crescendo até inviabilizar.**

## Erros Comuns

**Registro de risco genérico.**

**Não separar irreversível.**

**Não fazer comparação em produção.**

**Não exercitar um ciclo completo antes de desligar.**

**Não registrar o risco de não fazer.**

**Tratar risco organizacional como fora do escopo.**

## Exemplo Real

Uma empresa de energia substituiu o sistema de faturamento. O programa tinha registro de
risco, revisão mensal, e foi executado com competência técnica.

Ele produziu um incidente que custou caro, e que estava nos riscos previsíveis desta
atividade.

O sistema novo entrou em produção em março, com o antigo mantido em paralelo por 60 dias.
Em maio, com tudo estável, o antigo foi desligado.

Em dezembro, o processo de apuração anual falhou.

A causa: uma regra de rateio de encargos setoriais, aplicada uma vez por ano, no
fechamento de dezembro. Ela existia no sistema antigo, num módulo que rodava anualmente e
que nenhum teste tinha exercitado — porque o período de paralelo foi de março a maio.

O sistema antigo já estava desligado, e as máquinas, descomissionadas.

A recuperação levou sete semanas, com a regra reconstruída a partir de documentação
regulatória e de resultados de anos anteriores. Houve atraso na entrega da apuração ao
órgão regulador.

As mudanças de processo depois:

**Ciclo completo antes de desligar.** Nenhum sistema é desligado antes de o novo ter
exercitado todos os ciclos — mensal, trimestral, anual.

Isso significou, para o programa seguinte, manter o antigo por 14 meses em vez de 2. O
custo foi aceito.

**Inventário de processos periódicos.** Levantamento explícito de tudo que roda em
frequência maior que mensal, com data e responsável.

Esse levantamento, feito retroativamente, encontrou mais quatro processos anuais em
outros sistemas que ninguém tinha mapeado.

**Período de suspensão.** O sistema antigo passa por 90 dias desligado, mas recuperável,
antes do descomissionamento.

**Comparação em produção** durante todo o paralelo, com o antigo processando em sombra
depois do corte — o que teria detectado a divergência em dezembro, com o antigo ainda
disponível.

O detalhe que a equipe destaca: o risco de "processo periódico não exercitado" não estava no
registro. Ele é específico de modernização, e não aparece em listas genéricas de risco de
projeto — que era o modelo usado.

## Conceitos Relacionados

- [Migração de Dados](data-migration.md) — o risco irreversível principal.
- [Restrições Organizacionais](organizational-constraints.md).
- [Modernização Incremental](incremental-modernization.md) — o controle estrutural.
- [Confiabilidade](../12-reliability/index.md).

## Exercício Prático

Liste os processos periódicos do sistema que você pretende substituir — mensais,
trimestrais, anuais.

O período de paralelo precisa cobrir o mais longo deles. Se não cobrir, o desligamento é
uma aposta.

## Perguntas de Entrevista

- Como se separa risco reversível de irreversível?
- Por que comparação em produção é o controle de maior valor?
- Por que o ciclo completo precisa ser exercitado antes de desligar?

## Para Aprofundar

- Feathers, Michael. *Working Effectively with Legacy Code*. Prentice Hall, 2004.
- Newman, Sam. *Monolith to Microservices*. O'Reilly, 2019.
- Nygard, Michael. *Release It!*. 2ª ed. Pragmatic Bookshelf, 2018.
