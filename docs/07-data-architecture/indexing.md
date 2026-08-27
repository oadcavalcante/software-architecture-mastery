---
id: indexing
title: Indexação
sidebar_position: 15
description: A decisão de arquitetura mais barata e mais negligenciada — e por que índice a mais também custa.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor lê um plano de execução, escolhe índices pelo padrão de
  consulta e reconhece o custo de escrita que cada um impõe.
prerequisites: [data-architecture]
related: [oltp, relational-databases, denormalization]
canonical_for: [índice, índice composto, plano de execução, seletividade]
content_version: 1
last_reviewed: 2026-08-27
---

# Indexação

## Visão Geral

Um índice é uma estrutura auxiliar que permite encontrar registros sem varrer a
tabela inteira.

É a decisão de melhor retorno desta seção: um índice adequado transforma segundos
em milissegundos, custa uma linha de comando e não muda o modelo.

E é a mais negligenciada — a maioria dos problemas de desempenho atribuídos a
escala é, na verdade, índice ausente ou índice errado.

## Problema

Sem índice, encontrar registros exige ler todos. Isso é rápido em mil linhas e
inviável em cem milhões.

O sintoma característico: o sistema funciona bem no início e degrada
progressivamente conforme os dados crescem, sem nenhuma mudança de código.

A reação comum — aumentar a máquina — funciona por um tempo e não resolve, porque
o custo cresce com o volume, não com a capacidade.

## Conceitos Centrais

### A ordem das colunas num índice composto decide tudo

O ponto de maior impacto prático e o mais mal compreendido.

Um índice sobre `(cliente, data)` serve consultas que filtram por cliente, e
consultas que filtram por cliente e data. **Não serve** consultas que filtram só
por data.

A analogia da lista telefônica: ordenada por sobrenome e depois nome, ela encontra
"Silva, João" rapidamente. Encontrar todos os "João" exige ler tudo.

A regra: a coluna mais à esquerda precisa estar na condição. Criar
`(data, cliente)` quando as consultas filtram por cliente é criar um índice que
não será usado — e que continua custando na escrita.

### Seletividade determina o benefício

Um índice ajuda quando reduz muito o conjunto de candidatos.

Índice sobre CPF: cada valor identifica uma linha. Excelente.

Índice sobre um campo booleano de status ativo: se 95% dos registros estão ativos,
o índice aponta para quase tudo, e o banco vai preferir varrer.

Isso explica índices que existem e nunca são usados — e a solução para o caso de
baixa seletividade costuma ser índice parcial, cobrindo apenas a minoria
interessante.

### Todo índice é custo de escrita

Cada inserção, atualização e exclusão precisa manter todos os índices da tabela.

Uma tabela com dez índices paga dez atualizações por escrita. Em carga
transacional pesada, isso vira o gargalo.

A consequência prática: índices não usados são puro prejuízo. Bancos modernos
reportam estatísticas de uso — e uma auditoria dessas estatísticas costuma
encontrar índices criados anos antes, para consultas que não existem mais.

### Índice de cobertura evita a segunda leitura

Se o índice contém todas as colunas que a consulta pede, o banco responde sem
tocar a tabela.

```sql
-- índice em (cliente, data, valor)
SELECT valor FROM pedidos WHERE cliente = ? AND data > ?
```

Todas as colunas estão no índice. A tabela não é lida.

É uma otimização poderosa para consultas críticas, e cobrar colunas demais
transforma o índice numa cópia da tabela, com o custo de escrita correspondente.

### Ler o plano de execução é a habilidade central

Todo banco relacional mostra como pretende executar uma consulta. Aprender a ler
isso substitui adivinhação por diagnóstico.

O que procurar:

```text
varredura completa       o índice não foi usado — ou não existe, ou não serve
varredura de índice      o índice foi usado
estimativa vs. real      divergência grande indica estatísticas desatualizadas
ordenação em disco       memória insuficiente para ordenar
laço aninhado com muitas iterações   junção sem índice do outro lado
```

A divergência entre linhas estimadas e reais é o diagnóstico mais útil: o
otimizador decide a partir das estimativas, e estatísticas velhas produzem planos
ruins mesmo com índices corretos.

### Função na coluna anula o índice

```sql
WHERE UPPER(nome) = 'MARIA'        -- não usa índice em nome
WHERE ano(data) = 2025             -- não usa índice em data
WHERE data BETWEEN ? AND ?         -- usa
```

Aplicar função à coluna indexada impede o uso do índice. A solução é reescrever a
condição, ou criar índice sobre a expressão.

É a causa de uma fração grande das consultas lentas em sistemas que "têm todos os
índices necessários".

## Modelo Mental

**Índice troca custo de escrita e espaço por velocidade de leitura.** Ele acelera
o que combina com sua ordem de colunas, e nada mais.

## Quando Usar

- Colunas usadas em filtro com boa seletividade.
- Chaves estrangeiras — junções precisam de índice dos dois lados.
- Colunas usadas para ordenação frequente.
- Restrições de unicidade.
- Consultas críticas que se beneficiariam de cobertura.

## Quando Não Usar

**Em coluna de baixa seletividade.** Considere índice parcial.

**Em tabela pequena.** Varrer mil linhas é mais rápido que consultar índice.

**Em tabela com escrita muito intensa e leitura rara.** Registro de auditoria,
telemetria.

**Um índice por consulta lenta, sem avaliar o conjunto.** Índices se sobrepõem;
frequentemente um composto substitui três simples.

**Sem verificar o uso depois.** Índice não usado só custa.

## Alternativas

- **Reescrever a consulta.** Remover função da coluna indexada resolve sem criar
  nada.
- **Atualizar estatísticas.** Plano ruim com índice correto.
- **Visão materializada** — para agregações repetidas.
- **[Particionamento](data-partitioning.md)** — descarta partições inteiras antes
  de qualquer índice.
- **Índice invertido** — para busca textual com relevância.

## Trade-offs

| Mais índices | Menos |
|---|---|
| Leitura rápida | Varredura |
| Escrita mais cara | Barata |
| Espaço adicional | Menor |
| Otimizador com mais opções | Planos mais previsíveis |
| Manutenção e reconstrução | Menos operação |

| Índice de cobertura | Simples |
|---|---|
| Sem leitura da tabela | Segunda leitura |
| Maior e mais caro na escrita | Menor |
| Beneficia consultas específicas | Mais geral |

## Modos de Falha

**Ordem de colunas errada.** O índice existe e não é usado.

**Função na coluna.** Anula silenciosamente.

**Estatísticas desatualizadas.** Plano ruim apesar de índices corretos.

**Excesso de índices.** A escrita degrada.

**Índice não usado.** Custo sem retorno.

**Criação bloqueando a tabela.** Em tabela grande, criar índice sem a opção
concorrente causa indisponibilidade.

**Fragmentação.** Índices muito atualizados degradam e precisam de reconstrução.

## Erros Comuns

**Não olhar o plano de execução.**

**Criar índice para toda consulta lenta.**

**Não indexar chave estrangeira.** Junções e verificações de integridade ficam
lentas.

**Ignorar a ordem das colunas.**

**Não auditar índices não usados.**

**Criar índice em produção sem a opção concorrente.**

## Exemplo Real

Um sistema de atendimento tinha a tela de histórico levando 12 segundos. O time
concluiu que precisava de arquitetura nova — cache, réplica de leitura, talvez um
armazenamento analítico.

A investigação levou duas horas e encontrou três problemas.

**Índice na ordem errada.** Existia índice em `(status, cliente_id)`. A consulta
filtrava por `cliente_id` e ordenava por data. O índice era inútil para ela.
Substituído por `(cliente_id, data DESC)`, a consulta caiu para 200 ms.

**Função na coluna.** Outra consulta usava `WHERE DATE(criado_em) = ?`, anulando o
índice em `criado_em`. Reescrita como intervalo, caiu de 8 segundos para 40 ms.

**Chave estrangeira sem índice.** A junção com a tabela de atendentes fazia
varredura completa a cada linha. Um índice resolveu.

Resultado: a tela passou de 12 segundos para 350 ms, sem mudança de arquitetura.

A auditoria completa depois encontrou outra coisa: **de 47 índices na base, 19
nunca tinham sido usados** desde a última reinicialização, seis meses antes.
Removê-los reduziu o tempo de escrita em 22%.

O que a equipe registra: a proposta original de arquitetura teria custado cerca de
três meses e teria funcionado — mascarando o problema real e mantendo o custo de
escrita dos 19 índices inúteis.

A pergunta que faltou foi a mais simples disponível: "o que o plano de execução
diz?".

## Conceitos Relacionados

- [OLTP](oltp.md) — onde índice é decisivo.
- [Bancos Relacionais](relational-databases.md).
- [Desnormalização](denormalization.md) — verifique índice antes.
- [Particionamento de Dados](data-partitioning.md) — complementa.

## Exercício Prático

Pegue a consulta mais lenta do seu sistema e leia o plano de execução. Procure
varredura completa e divergência entre linhas estimadas e reais.

Depois liste os índices nunca usados. Cada um está cobrando em toda escrita sem
devolver nada.

## Perguntas de Entrevista

- Por que a ordem das colunas num índice composto importa?
- O que é seletividade e como ela afeta a decisão?
- Por que aplicar função à coluna anula o índice?

## Para Aprofundar

- Winand, Markus. *SQL Performance Explained*, 2012.
- Winand, Markus. [Use The Index, Luke!](https://use-the-index-luke.com)
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 —
  capítulo 3.
