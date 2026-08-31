---
id: data-lakes
title: Data Lakes
sidebar_position: 10
description: Guardar bruto e interpretar depois — e a linha tênue entre lake e depósito.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor reconhece o que separa um data lake utilizável de um
  depósito de arquivos, e o que precisa existir desde o primeiro dia.
prerequisites: [data-warehouses]
related: [data-lakehouses, data-ownership, data-lifecycle]
canonical_for: [data lake, esquema na leitura, pântano de dados]
content_version: 1
last_reviewed: 2026-08-27
---

# Data Lakes

## Visão Geral

Um data lake guarda dados no formato bruto, em armazenamento barato, sem exigir
modelagem prévia.

A ideia é razoável: guardar agora e decidir depois como interpretar — porque nem
sempre se sabe, na ingestão, quais perguntas serão feitas.

A ideia falha de uma forma específica e bem documentada: sem catálogo, sem dono e
sem controle de qualidade, o lake vira um depósito onde ninguém acha nada e
ninguém confia no que acha.

## Problema

Um [data warehouse](/07-data-architecture/data-warehouses.md) exige decidir o modelo antes de ingerir.
Isso custa tempo e descarta o que não foi previsto.

Dados que não cabem em tabelas — registros de aplicação, imagens, documentos,
fluxos de eventos — ficam de fora.

O lake resolve isso invertendo: guarda tudo, e a estrutura é aplicada na leitura.

O custo dessa inversão é que a disciplina que o esquema impunha some, e precisa ser
reposta por outros meios. Quando não é, o resultado é conhecido.

## Conceitos Centrais

### Esquema na leitura move o trabalho, não o elimina

No warehouse, a estrutura é validada na escrita. No lake, cada leitor interpreta.

Isso dá flexibilidade e transfere um custo: se dez times leem o mesmo arquivo, dez
interpretações podem divergir. Uma mudança de formato na origem quebra os dez, em
momentos diferentes, sem aviso.

Não é argumento contra o modelo. É argumento para catálogo e contrato.

### As zonas

O desenho que funciona separa o lake em camadas com propósitos distintos:

```text
bruta        exatamente como chegou, imutável, sem transformação
tratada      limpa, deduplicada, tipada, em formato colunar
curada       modelada por domínio, pronta para consumo
```

A camada bruta é a razão de existir do lake — ela permite reprocessar quando a
transformação estiver errada.

O erro comum é consumir direto da bruta. Ela é matéria-prima, não produto.

### O catálogo não é opcional

Um lake sem catálogo é um sistema de arquivos.

O catálogo responde: o que existe, o que significa, de onde veio, quem é dono,
qual o formato, qual a frequência de atualização, qual a retenção.

Sem ele, cada nova pergunta começa com semanas de arqueologia — e frequentemente
termina com alguém ingerindo os mesmos dados de novo, porque não achou o que já
estava lá.

Esta é a diferença entre lake e pântano, e ela é praticamente a única.

### Formato de arquivo importa mais do que parece

Guardar em formato de texto — JSON, CSV — é conveniente e caro: sem compressão
eficiente, sem tipos, sem leitura seletiva de colunas.

Formatos colunares comprimem várias vezes melhor e permitem ler só as colunas
necessárias. Ver [colunar](/07-data-architecture/column-stores.md).

A camada bruta pode manter o formato original. As camadas tratada e curada não
deveriam.

### Arquivos pequenos degradam tudo

Ingestão contínua produz milhares de arquivos pequenos. Cada consulta precisa
abrir todos.

Um lake com milhões de arquivos pequenos fica lento de uma forma que não se resolve
com mais capacidade. Compactação periódica é manutenção obrigatória, não
otimização.

### Governança precisa vir antes, não depois

Dado pessoal em lake é o problema regulatório característico: arquivos imutáveis,
copiados, sem saber quem tem acesso a quê.

Classificação na ingestão, controle de acesso por zona e política de retenção
precisam existir desde o primeiro dia. Ver
[ciclo de vida do dado](/07-data-architecture/data-lifecycle.md).

Retroagir governança sobre um lake com anos de acúmulo é projeto de meses, e
raramente completo.

## Modelo Mental

**O lake troca disciplina na escrita por disciplina na leitura.** Se a segunda não
existir, não sobra nenhuma.

## Quando Usar

- Dados de formatos variados, incluindo não tabulares.
- As perguntas futuras não são conhecidas.
- Volume alto com custo de armazenamento relevante.
- Necessidade de guardar o bruto para reprocessar.
- Ciência de dados e exploração.
- Ingestão de muitas fontes com esquemas instáveis.

## Quando Não Usar

**Sem catálogo.** Vira depósito.

**Sem donos definidos por conjunto de dados.** Sem responsável nomeado, ninguém corrige a ingestão quebrada nem responde o que a coluna significa — e o conjunto apodrece em uso.

**Para consultas analíticas recorrentes com definições estáveis.** Ver
[warehouse](/07-data-architecture/data-warehouses.md).

**Como fonte da verdade operacional.** A latência de ingestão e a ausência de transação tornam o lake inadequado para decidir se há estoque agora.

**Sem classificação de dado pessoal.** Sem saber onde há dado pessoal, não há como atender pedido de exclusão nem limitar acesso — e a obrigação existe independentemente de a organização saber responder.

**Para substituir um warehouse que funciona.** São complementares.

## Alternativas

- **[Warehouse](/07-data-architecture/data-warehouses.md)** — quando as perguntas são conhecidas.
- **[Lakehouse](/07-data-architecture/data-lakehouses.md)** — a convergência.
- **Armazenamento de objetos com catálogo** — a versão mínima viável, que resolve
  boa parte dos casos sem plataforma.
- **Manter na origem** — se ninguém consome, ingerir é custo puro.

## Trade-offs

| Lake | Warehouse |
|---|---|
| Ingestão barata e rápida | Modelagem antes |
| Qualquer formato | Tabular |
| Perguntas não previstas | As previstas |
| Interpretação por leitor | Definição única |
| Qualidade não garantida | Validada |
| Governança a construir | Estruturada |

| Zona bruta | Curada |
|---|---|
| Fiel à origem | Modelada |
| Reprocessável | Derivada |
| Difícil de consumir | Pronta |
| Sem garantia de qualidade | Com garantia |

## Modos de Falha

**Pântano.** Ninguém sabe o que existe.

**Ingestão duplicada.** Os mesmos dados entram várias vezes por caminhos
diferentes.

**Arquivos pequenos.** Consultas degradam progressivamente.

**Formato quebrado na origem.** Consumidores falham em momentos diferentes.

**Custo crescendo sem controle.** Sem retenção, tudo fica para sempre.

**Dado pessoal sem rastreabilidade.** Ordem de apagamento sem como cumprir.

**Interpretações divergentes.** Dois times, dois números do mesmo arquivo.

## Erros Comuns

**Começar sem catálogo.** Sem saber o que existe, de onde veio e o que significa, o dado armazenado é indistinguível de dado inexistente — e o custo já foi pago.

**Consumir direto da zona bruta.** Cada consumidor reimplementa limpeza e interpretação à sua maneira, e dois relatórios sobre o mesmo fato passam a divergir sem que se saiba qual está certo.

**Guardar tudo em formato de texto.** JSON e CSV obrigam a ler o arquivo inteiro para responder sobre três colunas. Formato colunar reduz leitura e custo em uma ordem de grandeza, e a conversão é barata na ingestão.

**Não compactar arquivos pequenos.** Ingestão contínua gera milhares de arquivos por dia, e o custo de listar e abrir passa a superar o de ler os dados.

**Sem política de retenção.** "Guardar tudo, decidir depois" é uma decisão de custo crescente tomada por omissão — e, quando há dado pessoal, também uma exposição regulatória crescente.

**Ingerir dados que ninguém pediu**, por precaução. Cada fonte tem custo de ingestão, de armazenamento, de catalogação e de conformidade. Precaução sem consumidor identificado é custo garantido por benefício hipotético.

## Exemplo Real

Uma empresa de logística montou um lake para consolidar rastreamento, telemetria de
veículos, notas fiscais e registros de aplicação.

Em dezoito meses acumulou 400 TB. E gerava dois relatórios.

O diagnóstico:

**Sem catálogo.** 12 mil pastas sem documentação. Um analista levava semanas para
descobrir se um dado existia. Três equipes tinham ingerido a mesma fonte de notas
fiscais, em formatos diferentes, sem saber uma da outra.

**Tudo em JSON compactado.** Uma consulta sobre um mês de telemetria lia 8 TB para
usar três campos.

**14 milhões de arquivos pequenos.** A ingestão gravava um arquivo por minuto por
veículo. Consultas levavam horas abrindo arquivos.

**Sem retenção.** Registros de aplicação de dois anos, que ninguém consultava,
ocupavam 60% do volume.

**Dado pessoal disperso.** Nomes e documentos de motoristas espalhados em vários
conjuntos, sem inventário. Uma solicitação de apagamento não tinha como ser
atendida com confiança.

A recuperação levou oito meses:

**Catálogo** com dono obrigatório por conjunto — sem dono declarado, a ingestão é
bloqueada.

**Zonas** explícitas, com a camada tratada em formato colunar particionado por
data. A consulta de telemetria caiu de 8 TB para 40 GB lidos.

**Compactação diária**, reduzindo para 60 mil arquivos.

**Retenção por conjunto**, cortando 45% do volume no primeiro mês.

**Classificação de dado pessoal** na ingestão, com zona restrita.

O aprendizado que ficou: nenhuma dessas medidas é difícil ou cara — todas são
baratas se adotadas na ingestão do primeiro conjunto. Retroagir custou oito meses
porque cada decisão precisou ser aplicada a dados que já estavam lá, sem
documentação de origem.

## Conceitos Relacionados

- [Data Warehouse](/07-data-architecture/data-warehouses.md) — o complemento.
- [Lakehouse](/07-data-architecture/data-lakehouses.md) — a convergência.
- [Propriedade do Dado](/07-data-architecture/data-ownership.md) — o que impede o pântano.
- [Ciclo de Vida do Dado](/07-data-architecture/data-lifecycle.md) — retenção.

## Exercício Prático

Se você tem um lake, responda: quantos conjuntos de dados existem, quem é dono de
cada um, e quantos foram consultados nos últimos 90 dias?

A terceira resposta costuma ser a mais reveladora — e é o argumento para política
de retenção.

## Perguntas de Entrevista

- O que separa um data lake de um pântano?
- Por que consumir da zona bruta é um erro?
- Por que arquivos pequenos degradam o desempenho?

## Para Aprofundar

- Dixon, James. *Pentaho, Hadoop, and Data Lakes*, 2010 — a origem do termo.
- Gorelik, Alex. *The Enterprise Big Data Lake*. O'Reilly, 2019.
- Dehghani, Zhamak. *Data Mesh*. O'Reilly, 2022.
