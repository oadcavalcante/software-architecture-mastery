---
id: fitness-functions-governance
title: Funções de Aptidão como Governança
sidebar_position: 7
description: Governança executável — a propriedade que se quer preservar, verificada a cada mudança.
doc_type: concept
level: 6
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor converte uma regra de governança em verificação automática e sabe
  quais regras não podem ser convertidas.
prerequisites: [governance-basics]
related: [compliance, governance-standards, governance-basics]
canonical_for: [função de aptidão, governança executável, aptidão contínua, regra não automatizável]
content_version: 1
last_reviewed: 2026-08-29
---

# Funções de Aptidão como Governança

## Visão Geral

Uma **função de aptidão** é uma verificação automática de uma característica arquitetural
que se quer preservar. O termo vem de *Building Evolutionary Architectures*, e a ideia
central é simples: se você consegue afirmar a propriedade, e consegue medi-la, consegue
verificá-la a cada mudança.

```text
regra escrita     "serviços não devem depender ciclicamente"
função de aptidão o grafo de dependências é verificado na construção;
                  ciclo quebra a esteira
```

A diferença entre as duas linhas é a diferença entre uma intenção e um mecanismo. A
primeira é verdadeira quando alguém lembra; a segunda é verdadeira sempre.

É o instrumento de governança com a melhor relação entre efeito e atrito — e o que mais
exige investimento inicial.

## Problema

Regras arquiteturais escritas em documento têm um comportamento previsível:

```text
mês 1     a regra é publicada e conhecida
mês 6     a maior parte do código a segue
mês 18    metade das exceções não foi registrada
mês 36    ninguém sabe qual é o estado
```

A erosão não é indisciplina. É que cada violação individual é pequena, invisível e
justificável no momento, e nada as soma.

E a alternativa tradicional — inspecionar em revisão — tem dois defeitos: acontece tarde, e
depende de alguém notar. Uma dependência cíclica introduzida numa mudança de 400 linhas não
é notada por leitura.

## Conceitos Centrais

### O que pode virar função de aptidão

```text
estrutural     dependências entre módulos, camadas, direção de acoplamento
desempenho     latência de um caminho crítico, tempo de construção
segurança      ausência de segredo em código, dependência vulnerável,
               porta exposta sem autenticação
operacional    cobertura de monitoração, alarme definido, dono declarado
dados          esquema compatível, retenção declarada
custo          recursos provisionados dentro de limite
resiliência    tempo de recuperação medido em teste de caos
```

O critério é sempre o mesmo: **a propriedade é afirmável e mensurável?** Se sim, é
candidata.

### Atômica e holística, contínua e disparada

```text
atômica     verifica um componente isolado — um módulo, um serviço
holística   verifica uma propriedade do conjunto — latência ponta a ponta
contínua    executa a cada mudança, na esteira
disparada   executa periodicamente ou sob demanda — caro demais para toda mudança
```

A maior parte do valor está nas atômicas e contínuas, que são baratas. As holísticas e
disparadas cobrem propriedades que só existem no conjunto, e por isso são as que descobrem
os problemas mais caros.

Ver [observabilidade](../13-observability/index.md) — várias funções holísticas são
consultas sobre dados que já estão sendo coletados.

### Falhar ou avisar

```text
falha a construção   para o que não pode acontecer
abre alerta          para o que precisa de atenção humana
gera relatório       para o que é tendência, não evento
```

Fazer tudo falhar produz duas reações ruins: a verificação é desabilitada, ou lista de
exclusões cresce até a regra não valer mais.

A escolha correta depende de uma pergunta: **se isto falhar, é sempre um erro?** Se a
resposta for "às vezes é legítimo", a verificação deveria avisar, não bloquear — e o caso
legítimo deveria virar [exceção registrada](exceptions.md).

### A função precisa dizer o que fazer

```text
ruim   "violação de regra arquitetural ARCH-014"
bom    "o módulo de pedidos importa do módulo de faturamento diretamente
       (Pedido.java:82). Use a interface pública FaturamentoService.
       Se a dependência for legítima, registre exceção em <caminho>."
```

Uma verificação que falha sem explicar produz a reação de contornar em vez de corrigir. O
texto da mensagem é parte do desenho da função, não um detalhe.

### O que não pode ser automatizado

Delimitar isso evita a expectativa exagerada que faz a prática ser abandonada:

```text
a decisão foi adequada ao contexto?
a fronteira do serviço corresponde ao domínio?
o modelo faz sentido para o negócio?
o trade-off aceito era o certo?
a complexidade se justifica?
```

Nenhuma dessas é mensurável. Elas permanecem no território de
[revisão](governance-review.md) e de julgamento humano — e é por isso que funções de aptidão
substituem parte da governança, não toda.

A repartição útil: a verificação automática libera a atenção humana para as perguntas que só
ela responde.

### Começar por onde já dói

O erro de adoção mais comum é construir um conjunto abrangente antes de ter qualquer um em
produção.

```text
1. escolha uma regra que já foi violada e causou dano
2. implemente a verificação mais simples que a pegue
3. rode em modo de aviso por algumas semanas
4. corrija o acervo
5. só então faça falhar
```

O passo 3 é o que evita a rejeição: ligar uma verificação em modo bloqueante sobre uma base
de código que a viola em 40 lugares interrompe o trabalho de todos no mesmo dia.

### Elas também precisam de dono e revisão

Uma função de aptidão é código, com manutenção, falsos positivos e obsolescência.

```text
sem dono          quebra e é desabilitada
sem revisão       verifica uma regra que não vale mais
com falso positivo alto  é ignorada, depois removida
```

A taxa de falso positivo é a métrica de saúde mais importante. Acima de um patamar baixo, a
verificação perde credibilidade e passa a ser contornada por reflexo.

## Modelo Mental

**Se dá para afirmar e medir, dá para verificar a cada mudança.** O que sobra para o humano
é o que exige julgamento.

## Quando Usar

- Para propriedades estruturais, de segurança e operacionais verificáveis.
- Onde a erosão silenciosa é o modo de falha.
- Depois de um incidente cuja causa é uma regra violada.
- Como substituição de itens de lista de verificação manual.

## Quando Não Usar

**Para julgamento** — adequação, fronteira, trade-off.

**Bloqueando desde o primeiro dia**, sobre acervo que viola.

**Sem mensagem acionável.**

**Sem dono.**

**Com falso positivo alto.**

**Como substituto de toda a governança.**

## Alternativas

- **Controle preventivo** — impedir em vez de detectar; melhor quando o ambiente permite.
- **[Revisão](governance-review.md)** — para o que exige julgamento.
- **[Conformidade contínua](compliance.md)** — o mesmo mecanismo, com foco regulatório.
- **Relatório periódico** — quando a propriedade é tendência e não evento.

A primeira é sempre preferível quando aplicável: uma malha que rejeita tráfego não
autenticado torna a verificação correspondente desnecessária. Ver
[fundamentos de governança](governance-basics.md).

## Trade-offs

| Automatizado | Revisão humana |
|---|---|
| Sempre executa | Depende de atenção |
| Só o mensurável | Cobre julgamento |
| Investimento inicial | Custo recorrente |
| Sem ambiguidade | Com contexto |

| Bloquear | Avisar |
|---|---|
| Garante a propriedade | Não interrompe |
| Pressiona por contorno | Pode ser ignorado |
| Para o que é sempre erro | Para o que às vezes é legítimo |

## Modos de Falha

**Falso positivo alto.** Perde credibilidade e é removida.

**Sem mensagem útil.** Produz contorno em vez de correção.

**Bloqueio prematuro.** Rejeição organizacional.

**Sem dono.** Quebra e é desabilitada.

**Lista de exclusões crescente.** A regra deixa de valer sem que ninguém decida isso.

**Expectativa de cobrir julgamento.** Frustração e abandono.

## Erros Comuns

**Construir o conjunto completo** antes de ter um em produção.

**Não medir falso positivo.**

**Não revisar a regra** quando o contexto muda.

**Não vincular à decisão** que a originou.

**Não olhar a lista de exclusões**, que é onde a erosão se esconde.

## Exemplo Real

Uma empresa de logística com 84 serviços tinha regras arquiteturais documentadas em um guia
de 40 páginas, verificadas em revisão de código.

Um levantamento pontual sobre o código real encontrou:

```text
regras documentadas                            37
verificáveis automaticamente, em princípio     22
efetivamente verificadas                        3
violações encontradas nas 22 verificáveis     411
serviços sem nenhuma violação                   9 de 84
```

O caso mais caro: 6 serviços acessavam diretamente o banco de outro serviço, prática
proibida pelo guia desde 2021. Duas quebras de produção no ano anterior tinham essa causa.

A adoção foi deliberadamente incremental, ao longo de 11 meses:

**Primeira função: acesso direto a banco alheio.** A regra que já tinha causado dano. A
verificação lê a configuração de conexão de cada serviço e compara com o registro de
propriedade de dados.

Ela rodou em modo de aviso por seis semanas, com painel por time. Nesse período, 4 dos 6
casos foram corrigidos voluntariamente — sem nenhuma cobrança, apenas por ficarem visíveis.
Os outros 2 viraram exceção com prazo e plano de migração.

**Depois, em ordem de dano histórico:** dependência cíclica entre módulos, segredo em
código, dependência com vulnerabilidade conhecida, serviço sem dono declarado, serviço sem
alarme de disponibilidade.

Cada uma seguiu o mesmo protocolo: aviso, correção do acervo, exceções para o que restar,
bloqueio.

**Mensagem acionável** em todas, com o arquivo, a linha, a alternativa correta e o caminho
para registrar exceção.

**Falso positivo monitorado.** Duas funções foram ajustadas por passarem de 5%; uma —
"complexidade ciclomática acima do limite" — foi rebaixada de bloqueio para relatório, por
não distinguir complexidade essencial de acidental.

**Quatro regras nunca automatizadas**, mantidas explicitamente como assunto de revisão:
adequação da fronteira do serviço, modelagem de domínio, justificativa de complexidade e
escolha de consistência.

Resultados após 11 meses:

```text
funções em operação                            9
violações remanescentes                       26 (contra 411)
exceções registradas com prazo                18
tempo médio entre introdução e detecção        minutos (antes: meses)
falso positivo médio                          1,8%
incidentes com causa em acesso direto a
  banco alheio                                 0 (contra 2 no ano anterior)
tempo de revisão de código gasto em
  verificação de regras                       reduzido em ~60%
```

O último número é o que a equipe considera mais importante e o mais fácil de ignorar: a
automação não substituiu a revisão, ela liberou a revisão. As conversas passaram a ser sobre
fronteira e modelagem — as quatro regras que nenhuma função verifica.

A avaliação posterior aponta: as 4 correções voluntárias durante o modo de aviso, sem nenhuma
cobrança, foram o argumento que convenceu a organização a seguir. Tornar visível resolveu
dois terços do problema antes de qualquer bloqueio.

## Conceitos Relacionados

- [Fundamentos de Governança](governance-basics.md) — o ponto de intervenção.
- [Conformidade](compliance.md) — o mesmo mecanismo, foco regulatório.
- [Exceções](exceptions.md) — o que fazer com o caso legítimo.
- [Evolução da Arquitetura](../01-fundamentals/architecture-evolution.md).

## Exercício Prático

Liste as regras arquiteturais do seu contexto e marque quais são afirmáveis e mensuráveis.

Depois escolha a que já causou dano e implemente a verificação mais simples que a pegue, em
modo de aviso. O número de violações que aparecer é a medida da erosão acumulada.

## Perguntas de Entrevista

- Que classes de regra arquitetural não podem virar função de aptidão?
- Por que rodar em modo de aviso antes de bloquear?
- Por que a taxa de falso positivo é a métrica de saúde mais importante?

## Para Aprofundar

- Ford, Neal et al. *Building Evolutionary Architectures*. 2ª ed. O'Reilly, 2022.
- Ford, Neal et al. *Software Architecture: The Hard Parts*. O'Reilly, 2021.
- Kim, Gene et al. *The DevOps Handbook*. 2ª ed. IT Revolution, 2021.
