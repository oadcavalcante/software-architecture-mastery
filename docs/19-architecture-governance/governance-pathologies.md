---
id: governance-pathologies
title: Patologias de Governança
sidebar_position: 9
description: Os modos de degeneração, os sinais de que já aconteceu, e por que cada um parece razoável no início.
doc_type: concept
level: 6
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor reconhece governança degenerada pelos sinais observáveis e sabe
  propor a remoção de um mecanismo.
prerequisites: [governance-basics]
related: [governance-basics, governance-review, measuring-governance]
canonical_for: [patologia de governança, conformidade teatral, ritual de processo, governança sem remoção]
content_version: 1
last_reviewed: 2026-08-29
---

# Patologias de Governança

## Visão Geral

Governança degenera de formas específicas e repetidas. Nenhuma delas começa como erro — cada
patologia é a resposta razoável a um problema real, aplicada por tempo demais ou no ponto
errado.

Isso importa para o diagnóstico: procurar má-fé ou incompetência não explica nada, porque as
pessoas que criaram o mecanismo tinham razão no momento em que o criaram.

O que muda é o contexto, e o que falta é o mecanismo de remoção. **Governança acumula porque
adicionar tem dono e remover não tem.**

Este documento cataloga os modos, os sinais observáveis de cada um, e a saída.

## Problema

O padrão de acumulação:

```text
incidente          → cria-se um controle
auditoria          → cria-se um relatório
divergência        → cria-se um padrão
atraso             → cria-se um ponto de verificação
```

Cada passo é defensável. Nenhum é revertido. Depois de alguns anos, a organização tem
dezenas de mecanismos, dos quais uma fração pequena ainda endereça um risco vivo — e o custo
agregado é invisível porque está distribuído em pequenos atrasos.

O sinal mais confiável de que isso aconteceu: **ninguém consegue nomear o último mecanismo
de governança que foi removido.**

## Conceitos Centrais

### Comitê que aprova tudo

```text
sintoma    taxa de aprovação acima de 90%
causa      intervém depois da decisão, quando dizer não é caro demais
efeito     custo de espera sem benefício; times trazem o já implementado
saída      mover para aconselhamento cedo; portão só para poucas classes
```

Ver [revisão](/19-architecture-governance/governance-review.md).

### Conformidade teatral

```text
sintoma    documentos impecáveis, sistemas divergentes
causa      verifica-se artefato, não efeito
efeito     confiança indevida; risco real desconhecido
saída      verificação contínua sobre estado real
```

Ver [conformidade](/19-architecture-governance/compliance.md).

### Padrão sem caminho

```text
sintoma    padrão publicado, adoção abaixo de 30%
causa      cumprir exige trabalho que ninguém financiou
efeito     divergência silenciosa; padrão citado em auditoria e ignorado
saída      gabarito, exemplo, migração — ou remoção do padrão
```

### Exceção permanente

```text
sintoma    exceções renovadas três ou mais vezes
causa      o padrão está errado, ou a migração nunca terá prioridade
efeito     esforço de renovação e métricas distorcidas
saída      corrigir o padrão, restringir escopo, ou aceitar como dívida
```

Ver [exceções](/19-architecture-governance/exceptions.md).

### Governança sem dono

```text
sintoma    ninguém sabe quem responde por um mecanismo
causa      quem criou saiu, ou a área foi reorganizada
efeito     nunca é ajustado nem removido; ninguém tem autoridade para tirá-lo
saída      dono como papel, com data de revisão
```

### Ritual

```text
sintoma    a reunião acontece, produz ata, e ninguém consegue citar
           uma decisão que ela mudou nos últimos 12 meses
causa      o problema que a originou foi resolvido de outro jeito
efeito     custo recorrente sem efeito
saída      suspender por um trimestre e observar o que quebra
```

A suspensão temporária é o teste mais eficiente disponível, e o mais difícil de conseguir
autorização para fazer.

### Arquitetura de torre de marfim

```text
sintoma    decisões tomadas por quem não opera nem constrói o sistema
causa      papel de arquitetura separado da execução
efeito     decisões que não sobrevivem ao contato com a implementação;
           perda de credibilidade
saída      arquitetos com responsabilidade operacional; decisão com quem constrói
```

O sinal precoce: propostas que não mencionam nenhum caso difícil.

### Verificação que ninguém lê

```text
sintoma    relatório de conformidade com centenas de itens, enviado
           semanalmente, sem correções correspondentes
causa      verifica-se tudo com o mesmo peso
efeito     ruído; os itens que importam ficam invisíveis
saída      classificar por risco; entregar ao time, não ao comitê
```

Ver [medição](/19-architecture-governance/measuring-governance.md).

### Governança como poder

```text
sintoma    discussões sobre quem decide, não sobre o que decidir
causa      o mecanismo virou instrumento de influência organizacional
efeito     decisões pioram; a área de arquitetura vira adversária
saída      difícil — exige mudança de incentivo, não de processo
```

Esta é a mais grave, porque as demais têm solução técnica e esta não. O sinal de alerta: o
mecanismo é defendido por argumentos de autoridade e não por evidência de risco evitado.

### Ausência de mecanismo de remoção

A patologia que produz todas as outras. Se não existe processo para **tirar** um mecanismo,
o conjunto só cresce.

```text
adicionar   tem dono, urgência e um incidente para justificar
remover     não tem dono, é arriscado politicamente, e o benefício é difuso
```

A saída é estrutural: prazo de validade em todo mecanismo novo, e revisão periódica em que a
pergunta padrão é "isto ainda se paga?".

### Mecanismo que resolve o problema de outra época

```text
sintoma    o mecanismo endereça um risco que a plataforma ou a esteira
           já cobre por outro caminho
causa      foi criado antes da capacidade existir, e ninguém revisitou
efeito     verificação duplicada, atrito sem risco correspondente
saída      mapear cada mecanismo contra os controles automáticos atuais
```

Este é o modo mais silencioso do catálogo, porque o mecanismo continua "funcionando" — ele
apenas verifica algo que já não pode dar errado. A aprovação manual de configuração de rede
sobrevive anos depois de a rede passar a ser declarada em código e verificada na esteira.

O diagnóstico é barato: para cada mecanismo humano, perguntar o que aconteceria se ele fosse
removido **hoje**, com os controles automáticos que existem hoje — e não com os que existiam
quando ele foi criado.

A dificuldade é que essa pergunta raramente é feita por quem opera o mecanismo, e quem
construiu o controle automático normalmente não sabe que a verificação manual existe. As
duas metades do diagnóstico costumam estar em áreas diferentes da organização, o que
explica por que a duplicação sobrevive tanto tempo.

## Modelo Mental

**Toda patologia começou como resposta certa a um problema real.** O defeito é a ausência de
data de validade.

## Quando Usar

Este catálogo serve como lista de verificação:

- Ao herdar uma estrutura de governança.
- Ao propor um mecanismo novo — para prever como ele degenera.
- Em revisão periódica do conjunto de mecanismos.
- Quando times reclamam de atrito sem conseguir apontar a causa.

## Quando Não Usar

**Como acusação.** As pessoas que criaram os mecanismos tinham razão.

**Para remover tudo** — a ausência de governança tem custo próprio, e ele é pior em
organizações grandes.

**Sem medir antes** — remover um mecanismo sem saber o que ele previne é aposta.

**Em organizações pequenas**, onde o diagnóstico costuma ser excesso de formalismo e não
patologia.

## Alternativas

- **Suspensão temporária** — em vez de remover, suspender por um trimestre e observar.
- **Redução de escopo** — manter o mecanismo apenas para a classe de risco que o justifica.
- **Mudança de ponto de intervenção** — quase sempre melhor que remover. Ver
  [fundamentos](/19-architecture-governance/governance-basics.md).
- **Substituição por automação** — o mecanismo humano vira verificação.

A primeira é a mais subutilizada e a mais informativa: ela produz evidência em vez de
argumento.

## Trade-offs

| Remover mecanismo | Manter |
|---|---|
| Menos atrito | Risco conhecido coberto |
| Risco de reincidência | Custo contínuo |
| Exige medir | Não exige nada |

| Suspender e observar | Decidir por análise |
|---|---|
| Evidência real | Sem risco |
| Exige tolerância a risco | Discussão sem fim |
| Conclusivo | Inconclusivo |

## Modos de Falha

**Diagnóstico como acusação.** Fecha a conversa.

**Remoção sem medição.** Reincidência do problema original.

**Remover tudo.** Troca uma patologia por outra.

**Tratar sintoma.** Ajustar o comitê sem mover o ponto de intervenção.

**Não olhar o conjunto.** Cada mecanismo parece razoável isoladamente.

## Erros Comuns

**Propor mecanismo novo** como resposta a um mecanismo que falhou.

**Não datar mecanismos** na criação.

**Não medir atrito.**

**Confundir ritual com cultura** — a reunião que "sempre existiu" raramente é cultura.

**Não perguntar qual foi o último mecanismo removido.**

## Exemplo Real

Uma empresa de serviços financeiros com 500 engenheiros conduziu um inventário de
mecanismos de governança de engenharia, motivado por uma pesquisa interna em que
"burocracia" apareceu como o principal obstáculo relatado.

O inventário encontrou **34 mecanismos** — comitês, aprovações, relatórios, verificações
obrigatórias, formulários. Nenhuma pessoa na organização conhecia todos.

Para cada um, quatro perguntas:

```text
                                                    respondidas
qual risco previne                                  34
quantas vezes pegou algo em 24 meses                11
quanto atraso adiciona                               6
quem é o dono                                       19
```

Os números revelam o padrão: todo mundo sabe justificar a existência de um mecanismo, e
quase ninguém sabe se ele funciona.

Dos 11 com dado de efetividade:

```text
pegaram algo relevante mais de 5 vezes    4
entre 1 e 5 vezes                          3
nunca pegaram nada                         4
```

Os 4 que nunca pegaram nada existiam havia em média 4,7 anos.

O programa de redução, ao longo de 12 meses:

**Suspensão de 9 mecanismos** por um trimestre, escolhidos entre os sem dono e os sem
efetividade demonstrada. Nada quebrou em 7 deles; foram removidos definitivamente. Dois
foram restabelecidos — um relatório de exposição de dados e uma verificação de dependências
— agora com dono e com escopo reduzido.

**11 mecanismos convertidos em verificação automática**, movendo o ponto de intervenção. Ver
[funções de aptidão](/19-architecture-governance/fitness-functions-governance.md).

**8 mecanismos com escopo reduzido** para a classe de risco que os justificava — o mais
significativo passou de "todo projeto" para "projetos com dado regulado ou compromisso
irreversível acima de um limite".

**6 mantidos sem mudança**, todos com efetividade demonstrada.

**Prazo de validade obrigatório** em todo mecanismo novo, com no máximo 24 meses e
renovação exigindo evidência de efeito.

**Revisão anual do conjunto**, com um objetivo declarado incomum: remover ao menos um
mecanismo por ano. A justificativa registrada foi que, sem uma meta explícita de remoção, o
conjunto volta a crescer.

Resultados após 12 meses:

```text
mecanismos                                    34 → 15
tempo médio de aprovação para projeto novo    de 26 para 4 dias
incidentes atribuíveis a mecanismo removido    1 — o de dependências,
                                              restabelecido
"burocracia" como principal obstáculo
  na pesquisa interna                         de 1º para 6º lugar
```

O ponto que a equipe sublinha: a suspensão temporária foi o instrumento decisivo. Discutir se um
mecanismo é necessário produz argumentos indefinidamente; suspendê-lo por três meses produz
evidência em três meses.

E a meta anual de remoção foi a mudança estrutural. Ela deu dono ao ato de remover, que era
exatamente o que faltava.

## Conceitos Relacionados

- [Fundamentos de Governança](/19-architecture-governance/governance-basics.md) — o ponto de intervenção.
- [Revisão](/19-architecture-governance/governance-review.md) — o comitê que aprova tudo.
- [Conformidade](/19-architecture-governance/compliance.md) — a conformidade teatral.
- [Medição](/19-architecture-governance/measuring-governance.md) — como saber se um mecanismo funciona.

## Exercício Prático

Pergunte, na sua organização: qual foi o último mecanismo de governança removido, e quando?

Se ninguém souber responder, o conjunto só cresceu — e o diagnóstico independe de qual
mecanismo você examine primeiro.

## Perguntas de Entrevista

- Por que procurar culpados não ajuda no diagnóstico de governança degenerada?
- Por que suspender temporariamente é melhor que discutir se um mecanismo é necessário?
- Qual patologia não tem solução técnica, e por quê?

## Para Aprofundar

- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.
- Forsgren, Nicole et al. *Accelerate*. IT Revolution, 2018.
- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
