---
id: data-migration
title: Migração de Dados
sidebar_position: 10
description: A parte mais arriscada e a mais subestimada — onde os erros são irreversíveis.
doc_type: concept
level: 6
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor planeja migração com verificação, reversibilidade e tratamento
  explícito dos dados que não se encaixam.
prerequisites: [legacy-modernization]
related: [strangler-fig, migration-strategies, modernization-risk]
canonical_for: [migração de dados, conciliação de migração, dado que não encaixa, corte de migração]
content_version: 1
last_reviewed: 2026-08-28
---

# Migração de Dados

## Visão Geral

Migrar dados é a parte mais arriscada de qualquer modernização, e a mais subestimada nas
estimativas.

A razão é assimétrica: código com defeito se corrige e reimplanta; dado corrompido ou
perdido frequentemente não se recupera.

E ela expõe algo que nenhuma outra parte do projeto expõe: **a qualidade real dos dados
existentes** — que costuma ser pior do que qualquer pessoa da organização acredita.

## Problema

O plano típico trata a migração como uma etapa de execução: extrair, transformar,
carregar.

O que ele não prevê:

```text
dados que não se encaixam no modelo novo
registros inconsistentes acumulados em anos
regras que nunca foram aplicadas retroativamente
duplicatas que ninguém sabia que existiam
campos usados para propósitos diferentes do documentado
histórico que ninguém sabe se ainda importa
```

Cada um desses vira uma decisão de negócio no meio de uma janela técnica — e é assim que
migrações de um fim de semana viram projetos de três meses.

## Conceitos Centrais

### O perfil dos dados vem primeiro

Antes de projetar a migração, medir o que existe:

```text
volume por entidade
distribuição de valores por campo
campos nulos, e em que proporção
valores fora do domínio esperado
duplicatas por critério de negócio
registros órfãos
datas impossíveis, valores negativos onde não deveriam
```

Esse levantamento — perfilagem — costuma ser feito depois que a migração falha. Feito
antes, ele transforma surpresas em decisões planejadas.

E o resultado dele é sempre desconfortável: sistemas antigos acumulam dados que violam as
regras que o sistema supostamente impunha, porque as regras foram adicionadas depois.

### Os dados que não encaixam precisam de decisão de negócio

Um registro que não cabe no modelo novo tem quatro destinos possíveis:

```text
transformar    aplicar uma regra que o torne válido
corrigir       ajustar manualmente, caso a caso
descartar      não migrar, com registro do que ficou de fora
migrar como está o modelo novo acomoda o caso, com flag
```

Nenhuma dessas é decisão técnica. Descartar 4.000 registros inconsistentes é uma decisão
de negócio, com implicações — e ela precisa ser tomada por quem responde pelos dados,
com antecedência.

Ver [propriedade do dado](/07-data-architecture/data-ownership.md).

O erro característico: a equipe técnica decide sozinha, durante a janela, sob pressão de
tempo.

### Verificação em três níveis

```text
contagem       o número de registros bate
soma           os totais financeiros e agregados batem
amostragem     registros individuais comparados campo a campo
```

Os três são necessários e insuficientes isoladamente:

**Contagem** não detecta transformação errada — os registros estão lá, com valores
errados.

**Soma** detecta erro agregado e não detecta compensação — dois erros que se anulam.

**Amostragem** detecta erro de transformação e não cobre casos raros, que são
justamente os que quebram.

E há uma quarta verificação, mais forte: **executar o mesmo processamento nos dois lados
e comparar o resultado**. Se o cálculo de saldo produz o mesmo número nos dois sistemas,
a migração está correta no que importa.

### A migração precisa ser repetível

Uma migração que roda uma vez, num fim de semana, é uma aposta.

```text
repetível     executada quantas vezes for preciso, com o mesmo resultado
idempotente   reexecutar não duplica
incremental   migra só o que mudou desde a última execução
```

Ver [idempotência](/06-distributed-systems/idempotency.md).

A repetibilidade permite ensaiar: rodar a migração completa em ambiente de teste,
verificar, corrigir, repetir — até que a execução real seja rotina, não evento.

Times que ensaiam a migração cinco vezes antes da real têm uma taxa de sucesso
qualitativamente diferente dos que a executam uma vez.

### O corte precisa ser reversível

O momento em que o sistema novo passa a ser a fonte da verdade:

```text
antes do corte   o antigo é a fonte; o novo é validado em paralelo
o corte          a fonte muda
depois           o antigo permanece consistente por um período, para reversão
```

Manter o antigo atualizado depois do corte — por replicação reversa — é o que torna a
volta possível. Sem isso, o corte é irreversível a partir da primeira escrita nova.

E o período de reversibilidade precisa ser suficiente para que problemas apareçam:
alguns só se manifestam no fechamento do mês.

### Histórico exige decisão explícita

```text
migrar tudo         caro, e mantém o acesso
migrar recente      barato, e o histórico fica no antigo
arquivar            o antigo vira arquivo somente leitura
descartar           com verificação de requisito de retenção
```

Ver [ciclo de vida do dado](/07-data-architecture/data-lifecycle.md).

A opção de manter o sistema antigo como arquivo somente leitura é frequentemente a mais
barata — e ela colide com o objetivo de desligar o antigo, o que precisa ser reconhecido.

### A migração revela a qualidade real

Uma constatação recorrente: a migração é a primeira vez que alguém olha os dados no
conjunto.

Ela encontra problemas que existiam há anos e não tinham sido detectados porque nenhum
processo os exercitava — clientes duplicados, registros órfãos, valores impossíveis.

Isso tem duas consequências: a estimativa precisa incluir tempo para tratá-los, e a
descoberta tem valor próprio, independentemente da migração.

## Modelo Mental

**Dado corrompido não se recupera.** Perfile antes, ensaie muitas vezes, verifique em
níveis, e mantenha a volta possível.

## Quando Usar

Migração de dados aparece em qualquer substituição de sistema. As práticas aqui são
necessárias sempre que:

- O volume é grande o suficiente para impedir verificação manual.
- Os dados sustentam operação ou obrigação regulatória.
- O modelo de destino difere do de origem.
- A janela de corte é limitada.

## Quando Não Usar

**Sem perfilagem prévia.**

**Decidindo o destino dos dados inconsistentes durante a janela.**

**Sem ensaiar.**

**Com verificação apenas por contagem.**

**Sem plano de reversão.**

**Sem decisão explícita sobre histórico.**

## Alternativas

- **Coexistência sem migração** — o novo começa vazio, e o antigo permanece como fonte
  do histórico. Ver [strangler fig](/16-legacy-modernization/strangler-fig.md).
- **Migração sob demanda** — o registro é migrado quando acessado pela primeira vez.
- **Manter o antigo como arquivo** — somente leitura, sem migrar histórico.
- **Migração incremental por fatia** — por cliente, por região, por período.

A segunda é elegante e adequada quando o acesso é esparso: a maior parte dos dados
antigos nunca é acessada, e migrá-los é trabalho desperdiçado.

## Trade-offs

| Migrar tudo | Migrar recente |
|---|---|
| Acesso uniforme | Histórico no antigo |
| Custo alto | Baixo |
| Antigo pode ser desligado | Precisa permanecer |

| Corte único | Incremental |
|---|---|
| Simples de raciocinar | Coexistência prolongada |
| Janela de risco concentrada | Distribuída |
| Reversão de tudo | Por fatia |

## Modos de Falha

**Dados perdidos.** Sem verificação que detectasse.

**Transformação errada.** Contagem bate, valores não.

**Duplicação por reexecução.** Migração não idempotente.

**Janela estourada.** O volume era maior que o estimado.

**Decisão de negócio na madrugada.** Registros descartados sem autoridade.

**Corte irreversível.** O antigo deixou de ser atualizável.

**Problema no fechamento do mês.** Descoberto depois do período de reversão.

## Erros Comuns

**Não perfilar antes.**

**Subestimar os dados que não encaixam.**

**Não ensaiar a migração completa.**

**Verificar apenas contagem.**

**Não manter o antigo atualizado após o corte.**

**Não decidir sobre histórico.**

## Exemplo Real

Uma operadora de saúde migrou o cadastro de beneficiários — 4,2 milhões de registros, 19
anos — para um sistema novo.

O plano original: migração num fim de semana, com janela de 36 horas.

A perfilagem, feita três meses antes, encontrou:

```text
registros sem CPF válido                     34.000
beneficiários duplicados por CPF             11.200
datas de nascimento impossíveis               2.800
dependentes sem titular                       6.400
registros com campo de observação usado
para armazenar dados estruturados            180.000
endereços em formato livre, sem padrão      1.100.000
```

O último era o mais grave: o sistema novo exigia endereço estruturado, e 26% dos
registros não tinham.

As decisões, tomadas com o negócio ao longo de dois meses:

**Duplicados.** Regra de consolidação definida pela área de cadastro, com 400 casos
ambíguos revisados manualmente.

**Sem CPF válido.** Migrados com marcação, com campanha de atualização junto aos
beneficiários. Não descartados — muitos eram beneficiários ativos.

**Dependentes órfãos.** Investigados: 5.900 eram de titulares cancelados havia anos;
migrados como inativos. Os outros 500 eram erro de dados e foram corrigidos.

**Campo de observação.** Um analista descobriu que ele continha, em cerca de 40.000
casos, informação sobre carência e restrições contratuais — dado com valor jurídico. Um
extrator foi escrito para estruturá-lo.

**Endereços.** Serviço de normalização, com 3% que não normalizaram indo para revisão
manual.

A execução:

**Sete ensaios completos** em ambiente de teste, cronometrados. O primeiro levou 41
horas — acima da janela. Os ajustes de paralelização levaram ao sétimo, em 9 horas.

**Verificação em quatro níveis**, incluindo a execução do cálculo de mensalidade nos dois
sistemas, com comparação registro a registro.

**Replicação reversa** por 60 dias após o corte, mantendo o antigo consistente.

**Fechamento de mês** exercitado no ambiente de teste, com os dados migrados — o que
encontrou dois problemas de transformação que nenhuma verificação anterior tinha pego.

A migração real levou 8 horas e 40 minutos. Nenhum registro perdido, e a reversão nunca
foi necessária.

A conclusão registrada: os três meses de perfilagem e preparação foram o projeto. A
execução foi a parte fácil — e teria sido um desastre sem eles.

O campo de observação com informação jurídica, sozinho, teria produzido um passivo
significativo se tivesse sido descartado como texto livre.

## Conceitos Relacionados

- [Strangler Fig](/16-legacy-modernization/strangler-fig.md) — a coexistência.
- [Estratégias de Migração](/16-legacy-modernization/migration-strategies.md).
- [Risco de Modernização](/16-legacy-modernization/modernization-risk.md).
- [Consistência de Dados](/07-data-architecture/data-consistency.md).

## Exercício Prático

Escolha uma entidade central do seu sistema e faça uma perfilagem simples: quantos
registros violam as regras que o sistema supostamente impõe?

O número costuma ser maior que qualquer estimativa — e ele é o trabalho que uma migração
futura vai enfrentar.

## Perguntas de Entrevista

- Por que verificação por contagem é insuficiente?
- Por que os dados que não encaixam exigem decisão de negócio?
- O que torna um corte reversível?

## Para Aprofundar

- Ambler, Scott; Sadalage, Pramod. *Refactoring Databases*. Addison-Wesley, 2006.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Newman, Sam. *Monolith to Microservices*. O'Reilly, 2019.
