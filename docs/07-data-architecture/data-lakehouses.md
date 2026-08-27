---
id: data-lakehouses
title: Data Lakehouses
sidebar_position: 11
description: Transações e esquema sobre arquivos em armazenamento barato — a convergência e seus limites.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor avalia o lakehouse pelo que a camada transacional de fato
  entrega, sem tratá-lo como substituto universal.
prerequisites: [data-lakes]
related: [data-warehouses, column-stores, data-partitioning]
canonical_for: [lakehouse, formato de tabela aberto, viagem no tempo]
content_version: 1
last_reviewed: 2026-08-27
---

# Data Lakehouses

## Visão Geral

Um lakehouse adiciona sobre os arquivos de um [data lake](data-lakes.md) uma
camada que traz transações, esquema declarado e evolução controlada.

O objetivo é ter as garantias de um [warehouse](data-warehouses.md) com o custo e
a abertura de armazenamento de objetos.

A arquitetura é real e resolve problemas concretos. Ela não é, porém, um
substituto universal — e o marketing em torno do termo obscurece limites que
importam na escolha.

## Problema

[Lake](data-lakes.md) e [warehouse](data-warehouses.md) cobrem necessidades
diferentes, e manter os dois significa duplicar dados, duplicar transformações e
conviver com números divergentes entre eles.

O lake tem custo baixo e nenhuma garantia. O warehouse tem garantias e custo alto,
com dados presos a um formato proprietário.

O lakehouse tenta ocupar o meio: arquivos abertos em armazenamento barato, com uma
camada de metadados que registra quais arquivos compõem a versão atual da tabela.

## Conceitos Centrais

### O mecanismo é um registro de versões

A camada transacional funciona mantendo um log: cada operação registra quais
arquivos foram adicionados e removidos.

```text
versão 1   arquivos [a, b, c]
versão 2   + [d]        → [a, b, c, d]
versão 3   - [b] + [e]  → [a, c, d, e]
```

Ler a tabela é ler o log para saber quais arquivos valem agora. Escrever é
adicionar uma entrada.

Disso decorrem as propriedades:

**Atomicidade.** A escrita só é visível quando a entrada é registrada. Um processo
que falha no meio não deixa dados parciais visíveis — o problema mais comum de
lakes puros.

**Leitura estável.** Uma consulta longa lê uma versão fixa e não vê escritas
concorrentes.

**Viagem no tempo.** Consultar como a tabela estava em qualquer versão anterior.

### Atualizar e apagar linhas

Em lake puro, alterar uma linha significa reescrever o arquivo inteiro. Isso torna
correções e apagamentos por regulação operacionalmente difíceis.

Formatos de lakehouse suportam alteração e exclusão de registros, reescrevendo
apenas os arquivos afetados.

Essa capacidade é a que resolve o conflito entre lake e proteção de dados pessoais,
e sozinha justifica a adoção em muitos casos.

### Evolução de esquema controlada

Adicionar coluna, renomear, mudar tipo — com o histórico permanecendo legível.

É a diferença entre esquema declarado e esquema implícito: o formato sabe que
aquela coluna existe desde a versão 12, e leitores antigos não quebram.

### Viagem no tempo tem custo de retenção

Manter versões anteriores permite auditar, comparar e reverter — e mantém os
arquivos antigos ocupando espaço.

Sem política de expiração de versões, o custo de armazenamento cresce indefinidamente.
E a limpeza é irreversível: expirar versões apaga a possibilidade de voltar a
elas.

Definir a janela de retenção de versões é decisão explícita, e frequentemente
esquecida até a conta chegar.

### Onde o warehouse ainda ganha

Sendo específico, porque a comparação costuma ser feita de forma superficial:

**Latência de consulta interativa.** Warehouses maduros continuam mais rápidos em
consultas pequenas e concorrentes, porque não pagam a leitura de metadados
distribuídos.

**Concorrência de escrita.** Muitos escritores simultâneos na mesma tabela geram
conflito no log e repetições.

**Ferramental e governança.** Controle de acesso em nível de coluna e linha,
auditoria e catálogo integrado são mais maduros em warehouses.

**Otimização automática.** Compactação e ordenação exigem processos explícitos no
lakehouse.

### A manutenção é explícita

Compactar arquivos pequenos, expirar versões, reordenar dados fisicamente,
atualizar estatísticas.

Nada disso acontece sozinho. Um lakehouse sem rotinas de manutenção degrada da
mesma forma que um lake — e o diagnóstico é o mesmo: consultas ficam lentas sem que
o volume tenha mudado.

## Modelo Mental

**Lakehouse é um lake com um log de transações.** Tudo o que ele entrega a mais
vem daí, e tudo o que falta é o que um log não resolve.

## Quando Usar

- Já existe um lake e faltam garantias transacionais.
- É preciso alterar ou apagar registros — regulação, correção.
- Manter lake e warehouse separados está custando duplicação.
- Volume alto com custo de armazenamento relevante.
- Formato aberto é requisito, por portabilidade.
- Cargas analíticas e de ciência de dados sobre os mesmos dados.

## Quando Não Usar

**Para carga transacional.** Não é um banco operacional.

**Para consulta interativa de latência muito baixa e alta concorrência.**

**Com muitos escritores simultâneos na mesma tabela.**

**Quando um warehouse existente atende bem.** Migrar por arquitetura é custo sem
retorno.

**Sem rotinas de manutenção.**

**Quando o volume é pequeno.** Um banco relacional resolve.

## Alternativas

- **[Warehouse](data-warehouses.md)** — quando o ferramental e a latência importam
  mais que o custo.
- **[Lake](data-lakes.md) com disciplina** — catálogo e formato colunar cobrem
  parte dos casos.
- **Warehouse com tabelas externas** — consulta arquivos do lake sem movê-los.
- **Manter os dois** — legítimo quando as cargas são genuinamente distintas.

## Trade-offs

| Lakehouse | Warehouse |
|---|---|
| Formato aberto | Frequentemente proprietário |
| Custo de armazenamento baixo | Maior |
| Manutenção explícita | Automática |
| Latência interativa maior | Menor |
| Concorrência de escrita limitada | Alta |
| Governança a construir | Madura |

| Lakehouse | Lake puro |
|---|---|
| Escrita atômica | Estado parcial visível |
| Alteração e exclusão | Reescrever arquivos |
| Esquema declarado | Implícito |
| Viagem no tempo | Sem versionamento |
| Metadados a manter | Nenhum |

## Modos de Falha

**Arquivos pequenos.** Sem compactação, degrada.

**Versões antigas acumulando.** Custo crescente.

**Conflito de escrita.** Escritores concorrentes falhando e repetindo.

**Metadados grandes.** O log cresce e a leitura fica lenta.

**Consulta sem filtro de partição.** Varre tudo.

**Expiração de versões apagando o que era necessário.** Irreversível.

## Erros Comuns

**Não agendar compactação.**

**Não definir retenção de versões.**

**Esperar desempenho de warehouse em consulta interativa.**

**Migrar tudo de uma vez.**

**Muitos escritores na mesma tabela.**

**Tratar como substituto de banco transacional.**

## Exemplo Real

Uma empresa de mídia mantinha um lake para dados brutos de audiência e um warehouse
para relatórios comerciais.

O custo da duplicação era visível: as mesmas transformações escritas duas vezes,
números divergindo entre as plataformas, e uma reclamação recorrente de que "o
relatório não bate com o painel".

A migração para lakehouse foi feita por domínio, ao longo de catorze meses.

Ganhos:

**Fonte única.** As divergências entre plataformas desapareceram, porque passou a
existir uma tabela só.

**Apagamento por regulação.** Solicitações de exclusão passaram a ser executáveis —
antes exigiam reescrever partições inteiras do lake, um processo manual que levava
dias.

**Custo de armazenamento** caiu 60% em relação ao warehouse.

**Viagem no tempo** permitiu auditar mudanças de número, resolvendo uma classe
inteira de disputas.

Problemas:

**Consultas interativas.** O painel comercial, com dezenas de usuários simultâneos
fazendo consultas pequenas, ficou 3 vezes mais lento. A solução foi manter uma
camada agregada de servida no warehouse — ou seja, os dois continuaram existindo,
com papéis mais claros.

**Manutenção não agendada.** Nos primeiros dois meses ninguém configurou
compactação. As consultas degradaram progressivamente e o diagnóstico levou
semanas, porque o volume de dados não tinha mudado.

**Custo de versões.** A viagem no tempo estava com retenção padrão de 30 dias sobre
tabelas de alta rotatividade. O armazenamento de versões antigas chegou a superar o
dos dados atuais antes de alguém revisar.

O que a equipe registra: a expectativa inicial era substituir o warehouse. O
resultado foi redividir responsabilidades — lakehouse como fonte única e camada de
processamento, warehouse como camada de servida para consulta interativa.

A tentativa de eliminar uma das plataformas era o objetivo errado.

## Conceitos Relacionados

- [Data Lake](data-lakes.md) — a base.
- [Data Warehouse](data-warehouses.md) — a comparação.
- [Colunar](column-stores.md) — o formato dos arquivos.
- [Particionamento de Dados](data-partitioning.md).

## Exercício Prático

Se você tem lake e warehouse, liste as transformações que existem nos dois. Cada
duplicata é uma fonte potencial de divergência.

Depois pergunte: quantas vezes no último ano alguém precisou explicar por que dois
números não batiam?

## Perguntas de Entrevista

- Como o log de transações produz atomicidade e viagem no tempo?
- O que um warehouse ainda faz melhor?
- Que manutenção um lakehouse exige e o que acontece sem ela?

## Para Aprofundar

- Armbrust, Michael et al. *Lakehouse: A New Generation of Open Platforms*. CIDR,
  2021.
- Armbrust, Michael et al. *Delta Lake: High-Performance ACID Table Storage*.
  VLDB, 2020.
- Dehghani, Zhamak. *Data Mesh*. O'Reilly, 2022.
