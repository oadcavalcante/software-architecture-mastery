---
id: olap
title: OLAP
sidebar_position: 8
description: Carga analítica — poucas consultas grandes que varrem muito e agregam, com latência tolerante.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor reconhece carga analítica e escolhe modelo e
  armazenamento adequados a ela em vez de forçá-la no transacional.
prerequisites: [oltp]
related: [data-warehouses, column-stores, denormalization]
canonical_for: [OLAP, carga analítica]
content_version: 1
last_reviewed: 2026-08-27
---

# OLAP

## Visão Geral

OLAP — processamento analítico em linha — descreve a carga oposta à
[transacional](/07-data-architecture/oltp.md): **poucas consultas, cada uma varrendo grandes volumes,
agregando, com tolerância a latência de segundos ou minutos**.

Faturamento por região e mês. Comportamento de coorte ao longo de um ano. Ranking
de produtos por margem.

Cada uma lê milhões de registros e devolve dezenas de linhas. Nenhuma escreve.

## Problema

Carga analítica executada em armazenamento transacional é ineficiente por
construção, não por falta de ajuste.

Um banco orientado a linha precisa ler a linha inteira para acessar duas colunas.
Um esquema normalizado exige junções que, sobre milhões de registros, dominam o
tempo. Índices desenhados para seletividade não ajudam quem varre tudo.

E, além da ineficiência, há a competição: a consulta analítica ocupa recursos que
a operação precisa. Ver [OLTP](/07-data-architecture/oltp.md).

## Conceitos Centrais

### A assinatura

```text
volume de consultas     baixo (dezenas/dia a centenas/hora)
registros por consulta  milhões
acesso                  varredura com filtro por período
proporção               leitura quase exclusiva
latência aceitável      segundos a minutos
dados                   histórico, frequentemente imutável
consistência            eventual é suficiente
```

A última linha é importante e frequentemente ignorada: relatório sobre o mês
passado não precisa dos dados de agora. Isso libera a arquitetura inteira.

### Armazenamento colunar muda a ordem de grandeza

Uma consulta analítica típica lê poucas colunas de muitas linhas. Armazenamento
[colunar](/07-data-architecture/column-stores.md) guarda cada coluna junta, então ler duas colunas de
uma tabela de cinquenta lê apenas o que é preciso.

O ganho não é marginal. Some-se a compressão — valores semelhantes adjacentes
comprimem muito bem — e a diferença costuma ser de uma a duas ordens de grandeza.

### Desnormalizar é a escolha certa aqui

O critério que vale em [OLTP](/07-data-architecture/oltp.md) se inverte. Como não há escrita
concorrente e as consultas varrem, [desnormalizar](/07-data-architecture/denormalization.md) elimina
junções sem custo de manutenção relevante.

É a razão de modelos dimensionais — fato no centro, dimensões ao redor —
dominarem o desenho analítico.

### Pré-agregação troca espaço por tempo

Se as mesmas agregações são consultadas repetidamente, calculá-las
antecipadamente transforma minutos em milissegundos.

O custo é espaço, atraso de atualização e o risco de divergência entre o agregado
e a fonte. A verificação periódica de que os dois batem é o controle que costuma
faltar.

### O dado analítico é histórico, e isso muda tudo

Registros analíticos não mudam depois de escritos. Isso permite particionar por
tempo, comprimir agressivamente, arquivar em armazenamento barato e reprocessar
sem coordenação.

Um sistema analítico que trata os dados como mutáveis está pagando um custo que
não precisa pagar.

### Auto-atendimento tem um custo que ninguém orça

Dar acesso analítico direto aos times de negócio é valioso e traz uma consequência
previsível: consultas mal escritas, varreduras completas sem filtro de período, e
custo que cresce sem teto.

Limite de tempo, cota por usuário e obrigatoriedade de filtro de partição não são
burocracia — são o que mantém a plataforma viável.

### Frescor é um requisito a ser perguntado, não presumido

A pergunta que mais economiza esforço numa plataforma analítica: com que idade
máxima o dado ainda serve para essa decisão?

A resposta quase nunca é "em tempo real", e quando é, geralmente vem de intuição e
não de necessidade. Um relatório de fechamento mensal não melhora com atualização
por minuto. Um painel de acompanhamento diário tampouco.

A diferença de custo entre as faixas é grande:

```text
diário          carga em lote noturna, barato e simples
horário         carga incremental, moderado
minutos         processamento contínuo, caro
segundos        arquitetura de fluxo dedicada, muito caro
```

Adotar a faixa de segundos para um requisito que era diário é a forma mais comum
de multiplicar o custo de uma plataforma analítica sem que ninguém perceba a
troca.

## Modelo Mental

**OLAP é sobre poucas consultas que leem muito.** Colunar, desnormalizado e
histórico — os três decorrem disso.

## Quando Usar

- Relatório, painel, análise exploratória.
- Agregação sobre grandes volumes históricos.
- Consultas ad hoc que não se sabe de antemão.
- Latência de segundos é aceitável.
- Dados de vários sistemas precisam ser cruzados.

## Quando Não Usar

**Para operação em tempo real.** Se um usuário espera resposta imediata para
seguir num fluxo, não é analítico.

**Para escrita frequente de registros individuais.** Armazenamento colunar é ruim
nisso.

**Como fonte da verdade operacional.** É derivado.

**Quando o volume não justifica.** Alguns milhões de linhas num banco relacional
bem indexado não precisam de plataforma analítica.

A última evita a maioria dos projetos de plataforma analítica prematuros: a
complexidade só se paga acima de certo volume.

## Alternativas

- **Réplica de leitura** — separa a carga sem mudar tecnologia. Suficiente para
  volumes moderados.
- **Visão materializada** — pré-agregação sem plataforma separada.
- **[Data warehouse](/07-data-architecture/data-warehouses.md)** — quando há múltiplas fontes.
- **Consulta direta sobre arquivos** — quando o volume é grande e a frequência
  baixa.

## Trade-offs

| Colunar | Orientado a linha |
|---|---|
| Varredura de poucas colunas eficiente | Lê a linha inteira |
| Compressão alta | Menor |
| Escrita individual cara | Barata |
| Atualização cara | Barata |
| Ideal para agregação | Para acesso por chave |

| Pré-agregado | Calculado na hora |
|---|---|
| Milissegundos | Segundos a minutos |
| Espaço adicional | Nenhum |
| Atraso de atualização | Sempre atual |
| Só as agregações previstas | Qualquer pergunta |
| Risco de divergir da fonte | Sem risco |

## Modos de Falha

**Consulta sem filtro de partição.** Varre o histórico inteiro e custa caro.

**Agregado divergente da fonte.** Ninguém compara.

**Custo crescendo sem teto.** Auto-atendimento sem cota.

**Atualização atrasada sem sinal.** O painel mostra dado de ontem como se fosse de
hoje.

**Duplicação na carga.** Uma reexecução insere os mesmos fatos duas vezes, e os
números dobram sem erro nenhum.

## Erros Comuns

**Rodar analítico no transacional.** Uma varredura de meses de histórico compete por memória e disco com as transações do horário comercial, e degrada justamente o que não pode degradar.

**Normalizar o modelo analítico.** Normalização otimiza escrita e integridade; consulta analítica quer junções poucas e largas. Um modelo normalizado transforma uma pergunta simples numa junção de oito tabelas.

**Montar plataforma analítica antes de o volume justificar.** Até certo tamanho, uma réplica de leitura com alguns índices responde tudo — sem carga, sem modelagem dimensional e sem mais um sistema para operar.

**Não expor a data da última atualização nos painéis.** Uma carga quebrada há três dias mostra exatamente a mesma tela de uma carga correta, e a decisão é tomada sobre dado velho sem que ninguém suspeite.

**Carga sem idempotência.** Ver
[idempotência](/06-distributed-systems/idempotency.md).

## Exemplo Real

Uma empresa de varejo montou um painel executivo sobre o banco transacional
replicado. Funcionou por um ano e degradou.

O problema não era o volume total — 200 milhões de linhas de venda. Era o formato:
cada consulta do painel fazia junção entre venda, produto, loja e calendário, e
agregava por mês.

Tempo de carregamento: 90 segundos. Os executivos pararam de usar.

A migração para um armazenamento colunar com modelo dimensional mudou os números:
o mesmo painel passou a carregar em 1,4 segundo.

Três problemas apareceram depois.

**Duplicação silenciosa.** A carga diária falhou no meio e foi reexecutada. Os
fatos daquele dia entraram duas vezes, e o faturamento apareceu inflado. Ninguém
notou por seis dias, até um gerente estranhar o número da sua loja. A correção foi
tornar a carga idempotente — apagar a partição do dia antes de recarregar.

**Custo de auto-atendimento.** Liberado o acesso direto, uma consulta sem filtro
de período varria cinco anos de dados. Em um mês, o custo de consulta superou o
de armazenamento em quatro vezes. Resolvido com filtro de partição obrigatório e
cota por usuário.

**Atualização atrasada.** O painel mostrava dados de dois dias antes, sem indicar
isso. Decisões foram tomadas com informação velha. A correção foi trivial e
deveria ter existido desde o início: um carimbo de "dados até" em cada painel.

A equipe registra a terceira como a mais constrangedora — custou uma linha de
interface e gerou a única consequência de negócio real das três.

## Conceitos Relacionados

- [OLTP](/07-data-architecture/oltp.md) — a carga oposta.
- [Armazenamento Colunar](/07-data-architecture/column-stores.md) — a tecnologia adequada.
- [Data Warehouse](/07-data-architecture/data-warehouses.md) — a plataforma.
- [Desnormalização](/07-data-architecture/denormalization.md) — o modelo.

## Exercício Prático

Pegue o painel mais consultado da sua empresa. Descubra de onde ele lê e quanto
tempo leva.

Se ele lê do banco transacional, calcule quanto recurso ele consome no horário de
pico. Esse número costuma ser o argumento que faltava.

## Perguntas de Entrevista

- Por que armazenamento colunar é melhor para agregação?
- Por que o critério de normalização se inverte em analítico?
- Como uma carga não idempotente corrompe números analíticos?

## Para Aprofundar

- Kimball, Ralph; Ross, Margy. *The Data Warehouse Toolkit*. 3ª ed. Wiley, 2013.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 —
  capítulo 3.
- Abadi, Daniel et al. *The Design and Implementation of Modern Column-Oriented
  Database Systems*, 2013.
