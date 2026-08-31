---
id: logs
title: Logs
sidebar_position: 1
description: O sinal mais flexível e o mais caro — estruturado, com contexto, e amostrado quando preciso.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor emite logs estruturados com contexto suficiente e controla o
  custo sem perder capacidade de investigação.
prerequisites: [observability]
related: [metrics, traces, correlation-ids]
canonical_for: [log estruturado, nível de log, amostragem de log, evento canônico]
content_version: 1
last_reviewed: 2026-08-28
---

# Logs

## Visão Geral

Logs são registros de eventos discretos: algo aconteceu, aqui está o contexto.

São o sinal mais **flexível** — cabem qualquer informação, e permitem responder
perguntas que ninguém antecipou. E o mais **caro** — o volume cresce com o tráfego, e o
custo de armazenamento e consulta acompanha.

A tensão entre essas duas propriedades organiza todas as decisões desta área.

## Problema

Duas falhas opostas, ambas comuns.

**Log demais.** Cada função registra entrada e saída. O volume torna a consulta lenta e
cara, e a informação relevante fica enterrada em ruído.

**Log de menos.** Durante o incidente, descobre-se que o registro tem a mensagem de erro
e nenhum contexto: qual usuário, qual pedido, qual valor, qual caminho de código.

A resposta não é um meio-termo de volume. É mudar a forma: menos linhas, cada uma com
muito mais contexto.

## Conceitos Centrais

### Estruturado, não texto

```text
texto        2026-08-28 14:32:11 ERROR Falha ao processar pedido 4471 do cliente 892
estruturado  {"nivel":"error","evento":"pedido_falhou","pedido_id":"4471",
              "cliente_id":"892","correlacao":"a3f...","motivo":"estoque_insuficiente",
              "duracao_ms":234}
```

A diferença não é estética. O estruturado permite consultar por campo — todos os erros
de estoque insuficiente do cliente 892 na última hora — sem depender de expressões
regulares sobre texto livre.

E ele sobrevive a mudanças: adicionar um campo não quebra consultas existentes;
reformular uma mensagem de texto quebra todas.

Logs estruturados são o pré-requisito de tudo o mais nesta página.

### Um evento canônico por requisição

A técnica que resolve a tensão entre volume e contexto:

Em vez de dezenas de linhas ao longo do processamento, **uma linha por unidade de
trabalho**, emitida no fim, com todo o contexto acumulado.

```text
disperso    12 linhas: "iniciando", "consultando cliente", "cliente ok",
            "verificando estoque", ... "concluído"
canônico    1 linha com: correlação, usuário, rota, resultado, duração total,
            duração por etapa, decisões tomadas, dependências chamadas,
            versão do código, instância
```

O volume cai por uma ordem de grandeza, e a capacidade de investigação **aumenta** —
porque cada linha responde sozinha à pergunta "o que aconteceu nesta requisição?", sem
precisar reunir fragmentos.

É a mudança de maior impacto que um time pode fazer nos seus logs.

### Contexto suficiente para investigar sem o código

O teste: alguém que não escreveu o código consegue entender o que aconteceu, apenas
lendo o registro?

O que precisa estar lá:

```text
identificador de correlação    ver correlation-ids
identificadores de negócio     pedido, cliente, conta — sem dado pessoal
resultado e motivo             não só "falhou"
duração                        total, e por etapa relevante
versão e instância             qual código, onde
entrada relevante              o que causou este caminho
```

O campo de **motivo** é o mais valioso e o mais ausente. "Falha ao processar pedido" não
diz nada; "estoque insuficiente para o item 88, disponível 2, solicitado 5" resolve a
investigação sozinho.

### Níveis: menos do que parece necessário

```text
error   algo falhou e alguém precisa saber
warn    algo inesperado, tratado, que pode indicar problema
info    eventos de negócio relevantes — o canônico vai aqui
debug   detalhe para investigação, desligado por padrão
```

Dois problemas recorrentes:

**Erro que não é erro.** Uma exceção tratada, esperada, registrada como erro. Isso
polui a métrica de erros e treina o time a ignorá-la.

**Debug ligado em produção.** Volume explode, custo explode, e o sinal se perde.

A prática que funciona: debug ligável **por requisição** ou por usuário, sem
reimplantação — o que permite investigar um caso específico sem pagar pelo volume
completo.

### Nunca registre dado sensível

Logs circulam amplamente: sistemas de terceiros, acesso amplo dentro da empresa,
retenção longa.

```text
nunca    senha, token, chave, número de cartão, documento completo
cuidado  nome, e-mail, endereço, dados de saúde
```

Ver [proteção de dados](/10-security/data-protection.md) e
[segredos](/10-security/secrets.md).

A filtragem precisa acontecer **na origem** — na biblioteca de registro, não no
processamento posterior. Um dado que saiu do processo já vazou.

E o caso mais comum: registrar o corpo completo de requisições com erro. É conveniente
para depurar e é onde os dados sensíveis aparecem.

### O custo exige decisão

O volume de logs cresce com o tráfego, e o custo é de coleta, transporte, indexação e
consulta.

As formas de controlar, em ordem de preferência:

**Evento canônico** em vez de linhas dispersas — reduz volume sem perder informação.

**Amostragem inteligente.** Registrar 100% dos erros e das requisições lentas, e uma
fração das bem-sucedidas rápidas. Preserva o que interessa.

**Retenção escalonada.** Sete dias em armazenamento consultável, noventa em frio.

**Cardinalidade sob controle.** Um campo com milhões de valores distintos encarece a
indexação.

A amostragem uniforme — registrar 10% de tudo — é a pior escolha: ela remove
proporcionalmente os erros, que são raros e é o que se quer investigar.

## Modelo Mental

**Menos linhas, mais contexto por linha.** Um evento canônico com trinta campos vale
mais que trinta linhas com um campo cada.

## Quando Usar

- Eventos discretos que precisam de contexto rico.
- Investigação de casos individuais.
- Auditoria e conformidade.
- Erros, com o contexto que os explica.
- Decisões de negócio relevantes.

## Quando Não Usar

**Para medir tendência.** Use [métricas](/13-observability/metrics.md) — contar linhas de log é caro e
impreciso.

**Para medir latência agregada.** Métricas fazem isso melhor.

**Texto não estruturado.**

**Registrando entrada e saída de toda função.**

**Com dado sensível.**

**Debug ligado por padrão em produção.**

**Amostragem uniforme.**

## Alternativas

- **[Métricas](/13-observability/metrics.md)** — para agregação e tendência, com custo constante.
- **[Traces](/13-observability/traces.md)** — para entender o caminho e o tempo de uma requisição.
- **Evento de auditoria** — quando o requisito é prova, não diagnóstico. Ver
  [auditabilidade](/10-security/auditability.md).
- **Amostragem por cauda** — decidir manter depois de saber o resultado, preservando os
  casos interessantes.

## Trade-offs

| Logs | Métricas |
|---|---|
| Contexto rico por evento | Agregado |
| Perguntas não antecipadas | Só as instrumentadas |
| Custo cresce com o tráfego | Custo constante |
| Consulta mais lenta | Rápida |
| Cardinalidade alta possível | Limitada |

| Evento canônico | Linhas dispersas |
|---|---|
| Uma linha responde tudo | Reunir fragmentos |
| Volume baixo | Alto |
| Perde o passo a passo | Preserva |

## Modos de Falha

**Volume tornando a consulta inviável.**

**Contexto insuficiente.** "Erro ao processar" sem o quê nem por quê.

**Dado sensível registrado.**

**Cardinalidade explodindo o custo de indexação.**

**Amostragem removendo os erros.**

**Retenção curta demais.** O incidente foi descoberto depois que os registros
expiraram.

**Registro síncrono bloqueando a aplicação.** Escrever log não pode ser caminho crítico.

## Erros Comuns

**Log em texto livre.**

**Não usar evento canônico.**

**Registrar sem motivo estruturado.**

**Não filtrar dado sensível na origem.**

**Amostrar uniformemente.**

**Usar logs para medir tendência.**

## Exemplo Real

Uma plataforma de comércio eletrônico gastava uma fração significativa do orçamento de
infraestrutura em logs — o segundo maior item da conta.

O volume era de bilhões de linhas por dia, e as consultas durante incidentes levavam
minutos.

A análise mostrou o padrão: cada requisição gerava entre 15 e 40 linhas, a maioria de
progresso — "iniciando", "etapa concluída", "chamando serviço X".

A reformulação:

**Evento canônico.** Uma linha por requisição, emitida no fim, com 34 campos: correlação,
usuário, rota, resultado, motivo, duração total e por dependência, versão, instância,
decisões relevantes.

O volume caiu **92%**. E as consultas de investigação ficaram mais simples, porque cada
linha respondia sozinha.

**Amostragem por resultado.** 100% dos erros, 100% das requisições acima do percentil
99 de latência, 5% das bem-sucedidas rápidas. Isso removeu mais 70% do que restava, sem
perder nenhum caso interessante.

**Debug por requisição.** Um cabeçalho na requisição ativa registro detalhado apenas
para ela. Permite investigar um caso específico sem ligar debug globalmente.

**Filtragem na origem.** A auditoria encontrou tokens de autenticação e documentos de
clientes em registros de erro, que gravavam o corpo completo da requisição. A filtragem
passou a acontecer na biblioteca, com lista de campos permitidos em vez de bloqueados.

**Retenção escalonada.** 14 dias consultáveis, 1 ano em armazenamento frio.

Resultado: custo de logs reduzido em cerca de 85%, e tempo médio de consulta durante
investigação de 4 minutos para 15 segundos.

Na retrospectiva: a expectativa era ter que escolher entre custo e capacidade de
investigação. O evento canônico melhorou os dois — porque o problema não era volume de
informação, era volume de linhas com pouca informação cada.

## Conceitos Relacionados

- [Métricas](/13-observability/metrics.md) — para tendência.
- [Traces](/13-observability/traces.md) — para o caminho.
- [Identificadores de Correlação](/13-observability/correlation-ids.md) — o que conecta.
- [Depurabilidade](/13-observability/debuggability.md).

## Exercício Prático

Conte quantas linhas de log uma requisição típica do seu sistema gera.

Depois pegue uma dessas linhas de erro e pergunte: alguém que não escreveu o código
consegue entender o que aconteceu?

## Perguntas de Entrevista

- Por que o evento canônico reduz volume e aumenta capacidade de investigação?
- Por que amostragem uniforme é a pior escolha?
- Por que a filtragem de dado sensível precisa acontecer na origem?

## Para Aprofundar

- Majors, Charity et al. *Observability Engineering*. O'Reilly, 2022 — eventos
  canônicos.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
- OpenTelemetry — especificação de logs.
