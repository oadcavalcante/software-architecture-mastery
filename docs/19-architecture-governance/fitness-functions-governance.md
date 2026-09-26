---
id: fitness-functions-governance
title: Funções de Aptidão como Governança
sidebar_position: 7
description: "Governança executável: a propriedade que se quer preservar, verificada a cada mudança."
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
content_version: 4
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
primeira é verdadeira quando alguém lembra; a segunda, enquanto a verificação roda na
esteira. E deixa de ser quando alguém a desabilita ou a esvazia com exclusões, que é o
modo como ela erode.

Para propriedades mensuráveis, cobra menos atrito por efeito que a revisão manual, que
exige atenção a cada mudança — e exige mais investimento inicial que qualquer regra escrita.

A mecânica de construir e operar uma função (atômica e holística, mensagem, falso
positivo) está em [Funções de Aptidão](/23-architecture-leadership/fitness-functions.md).
Este documento trata do recorte de governança: a função como ponto de intervenção, sua
relação com exceções e revisão, e a fronteira entre o que ela verifica e o que fica para
julgamento.

## Problema

Regras arquiteturais escritas em documento têm um comportamento previsível:

```text
mês 1     a regra é publicada e conhecida
mês 6     a maior parte do código a segue
mês 18    metade das exceções não foi registrada
mês 36    ninguém sabe qual é o estado
```

A erosão não é indisciplina: cada violação individual é pequena, invisível e
justificável no momento, e nada as soma.

E a alternativa tradicional (inspecionar em revisão) tem dois defeitos: acontece tarde, e
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

### Contínua ou disparada

```text
contínua    executa a cada mudança, na esteira
disparada   executa periodicamente ou sob demanda — caro demais para toda mudança
```

Para a governança, a diferença é o momento da intervenção: a contínua barra a violação
antes de ela entrar; a disparada a encontra depois, e por isso precisa de um destino (um
alerta com dono ou um item de revisão), senão vira relatório que ninguém lê. A distinção
entre atômica e holística está no [documento canônico](/23-architecture-leadership/fitness-functions.md#atômica-e-holística);
várias funções holísticas são consultas sobre dados que
[observabilidade](/13-observability/index.md) já coleta.

### Falhar ou avisar

```text
falha a construção   para o que não pode acontecer
abre alerta          para o que precisa de atenção humana
gera relatório       para o que é tendência, não evento
```

Fazer tudo falhar produz duas reações ruins: a verificação é desabilitada, ou lista de
exclusões cresce até a regra não valer mais.

A escolha correta depende de uma pergunta: **se isto falhar, é sempre um erro?** Se a
resposta for "às vezes é legítimo", a verificação deveria avisar, não bloquear. E o caso
legítimo deveria virar [exceção registrada](/19-architecture-governance/exceptions.md).

### A mensagem é a porta do processo de exceção

A mensagem acionável (arquivo, linha, alternativa correta) é tratada no
[documento canônico](/23-architecture-leadership/fitness-functions.md#a-mensagem-é-parte-do-desenho).
O que cabe à governança é a última linha dela: o caminho para registrar exceção. Sem esse
caminho, quem tem um caso legítimo só tem duas saídas (pedir para desligar a verificação ou
acrescentar uma exclusão silenciosa), e as duas tiram a regra do alcance da governança.

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
[revisão](/19-architecture-governance/governance-review.md) e de julgamento humano. É por isso que funções de aptidão
substituem parte da governança, não toda.

A repartição útil: a verificação automática libera a atenção humana para as perguntas que só
ela responde.

### Adoção, dono e revisão

O protocolo de adoção (começar pela regra que já causou dano, avisar antes de bloquear) e
a operação de cada função (dono, revisão, taxa de falso positivo) estão no
[documento canônico](/23-architecture-leadership/fitness-functions.md#comece-pela-regra-que-já-causou-dano).
Do lado da governança, o que muda é onde isso é registrado: cada função aponta para a
[decisão](/19-architecture-governance/governance-standards.md) que a originou, e a revisão
periódica do padrão inclui a lista de exclusões da função. É ali que a regra perde validade
sem que ninguém decida isso.

## Modelo Mental

**Se dá para afirmar e medir, dá para verificar a cada mudança.** O que sobra para o humano
é o que exige julgamento.

## Quando Usar

- Para propriedades estruturais, de segurança e operacionais verificáveis.
- Onde a erosão silenciosa é o modo de falha.
- Depois de um incidente cuja causa é uma regra violada.
- Como substituição de itens de lista de verificação manual.

## Quando Não Usar

**Para julgamento**: adequação de fronteira, modelagem, trade-off. Não há medida contra a
qual comparar, e uma verificação que finge medir afasta a conversa da revisão, onde ela
precisa acontecer.

**Quando a regra ainda muda mais rápido do que a verificação se estabiliza.** Uma convenção
em disputa, revista a cada trimestre, gera falso positivo a cada revisão; enquanto ela não
assenta, a revisão humana custa menos.

**Quando a base é pequena ou de vida curta.** Um serviço que será desativado em meses, ou um
sistema em que três pessoas leem toda mudança: construir e manter a verificação custa mais do
que as violações que ela pegaria.

**Quando medir exige um ambiente que a esteira não tem.** Latência sob carga real ou
recuperação em teste de caos não se pagam como verificação contínua; viram função disparada
ou relatório.

**Quando ninguém pode ser dono dela.** Uma função sem dono quebra na primeira mudança de
plataforma e é desabilitada. E a desabilitação ensina que a regra é negociável, o que é pior
do que nunca tê-la criado.

## Alternativas

- **Controle preventivo**: impedir em vez de detectar; melhor quando o ambiente permite.
- **[Revisão](/19-architecture-governance/governance-review.md)**: para o que exige julgamento.
- **[Conformidade contínua](/19-architecture-governance/compliance.md)**: o mesmo mecanismo, com foco regulatório.
- **Relatório periódico**: quando a propriedade é tendência e não evento.

A primeira é preferível quando a plataforma consegue impor a propriedade sem caso legítimo
de exceção (onde há exceção legítima, o bloqueio embutido vira rigidez e o caso vai para
fora da plataforma): uma malha que rejeita tráfego não
autenticado torna a verificação correspondente desnecessária. Ver
[fundamentos de governança](/19-architecture-governance/governance-basics.md).

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
casos foram corrigidos voluntariamente, sem nenhuma cobrança, apenas por ficarem visíveis.
Os outros 2 viraram exceção com prazo e plano de migração.

**Depois, em ordem de dano histórico:** dependência cíclica entre módulos, segredo em
código, dependência com vulnerabilidade conhecida, serviço sem dono declarado, serviço sem
alarme de disponibilidade.

Cada uma seguiu o mesmo protocolo: aviso, correção do acervo, exceções para o que restar,
bloqueio.

**Mensagem acionável** em todas, com o arquivo, a linha, a alternativa correta e o caminho
para registrar exceção.

**Falso positivo monitorado.** Duas funções foram ajustadas por passarem de 5%; uma
("complexidade ciclomática acima do limite") foi rebaixada de bloqueio para relatório, por
não distinguir complexidade essencial de acidental.

**Quatro regras nunca automatizadas**, mantidas explicitamente como assunto de revisão:
adequação da fronteira do serviço, modelagem de domínio, justificativa de complexidade e
escolha de consistência.

Resultados após 11 meses:

```text
funções em operação                            9 (9 das 22 regras verificáveis)
violações nas 9 regras cobertas              26 (contra 187 no levantamento)
  das quais com exceção registrada e prazo    18
regras verificáveis ainda sem função          13 (seguem em revisão)
tempo médio entre introdução e detecção        minutos (antes: meses)
falso positivo médio                          1,8%
incidentes com causa em acesso direto a
  banco alheio                                 0 (contra 2 no ano anterior)
tempo de revisão de código gasto em
  verificação de regras                       reduzido em ~60%
```

As 8 violações sem exceção estão em correção, sob aviso. As 13 regras verificáveis sem função
não foram medidas de novo: os 26 não dizem nada sobre elas.

O último número da tabela é o que a equipe considera mais importante e o mais fácil de ignorar: a
automação não substituiu a revisão, ela liberou a revisão. As conversas passaram a ser sobre
fronteira e modelagem: as quatro regras que nenhuma função verifica.

A avaliação posterior aponta: as 4 correções voluntárias durante o modo de aviso, sem nenhuma
cobrança, foram o argumento que convenceu a organização a seguir. Tornar visível resolveu
dois terços do problema antes de qualquer bloqueio.

## Conceitos Relacionados

- [Fundamentos de Governança](/19-architecture-governance/governance-basics.md): o ponto de intervenção.
- [Conformidade](/19-architecture-governance/compliance.md): o mesmo mecanismo, foco regulatório.
- [Exceções](/19-architecture-governance/exceptions.md): o que fazer com o caso legítimo.
- [Evolução da Arquitetura](/01-fundamentals/architecture-evolution.md).

## Exercício Prático

Escolha uma função de aptidão que já roda no seu contexto ou, se não houver nenhuma, a regra
arquitetural mais antiga que ainda depende de revisão manual. Responda três perguntas sobre ela:
quem é dono da regra, qual é o caminho para registrar exceção quando o caso é legítimo, e
quantas exclusões silenciosas ela acumulou desde que foi criada.

Se o caminho de exceção não existe, ou se as exclusões silenciosas são mais numerosas que as
exceções registradas, a regra já saiu do alcance da governança. Isso precisa ser consertado
antes de qualquer verificação nova. Para escolher e construir a próxima, o roteiro está no
[documento canônico](/23-architecture-leadership/fitness-functions.md).

## Perguntas de Entrevista

- Que classes de regra arquitetural não podem virar função de aptidão?
- Por que rodar em modo de aviso antes de bloquear?
- O que acontece com uma regra cuja verificação não oferece caminho de exceção?

## Para Aprofundar

- Ford, Neal et al. *Building Evolutionary Architectures*. 2ª ed. O'Reilly, 2022.
- Ford, Neal et al. *Software Architecture: The Hard Parts*. O'Reilly, 2021.
- Kim, Gene et al. *The DevOps Handbook*. 2ª ed. IT Revolution, 2021.
