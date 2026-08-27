---
id: security-failure-modes
title: Modos de Falha de Segurança
sidebar_position: 15
description: Como um sistema falha quando falha — e por que falhar fechado precisa ser decisão consciente.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor decide explicitamente o comportamento de cada controle sob
  falha, em vez de descobri-lo no incidente.
prerequisites: [secure-boundaries]
related: [secure-boundaries, auditability, authz-models]
canonical_for: [falhar fechado, falhar aberto, degradação segura, controle contornável]
content_version: 1
last_reviewed: 2026-08-28
---

# Modos de Falha de Segurança

## Visão Geral

Todo controle de segurança pode falhar: o serviço de autorização fica indisponível, a
verificação de token expira sem conseguir buscar a chave, a política não carrega.

A pergunta que precisa ser respondida **antes** disso acontecer: quando o controle
falha, o acesso é negado ou concedido?

```text
falhar fechado   nega — segurança preservada, disponibilidade perdida
falhar aberto    concede — disponibilidade preservada, segurança perdida
```

A maioria dos sistemas nunca decide isso. Eles descobrem o comportamento durante o
incidente, e ele costuma ser o pior dos dois.

## Problema

O comportamento sob falha raramente é escrito. Ele emerge da implementação:

Um bloco de tratamento de exceção que devolve `true` para não quebrar. Um cache que
serve a última política conhecida indefinidamente. Um timeout que retorna vazio, e a
lógica que interpreta vazio como "sem restrições".

Nenhuma dessas foi decidida. Todas viram política de segurança no momento em que
algo falha.

E o padrão da linguagem costuma ser generoso: uma lista de permissões vazia, uma
verificação que não roda, uma exceção engolida — quase sempre resultam em permitir.

## Conceitos Centrais

### A escolha depende do que está protegido

Não existe resposta universal, e apresentá-la como "sempre falhe fechado" é
simplista.

```text
autorização de transação financeira   fechado — recusar é aceitável
leitura de catálogo público           aberto — indisponibilidade é o dano
trava de porta física                 depende: incêndio contra invasão
limite de taxa                        aberto — degradar não vale parar
verificação de token                  fechado — sem exceção
verificação de segundo fator          fechado
```

O critério: **qual dano é maior, negar acesso legítimo ou conceder acesso
indevido?**

Para a maioria dos controles de autorização, negar é o dano menor. Para controles de
proteção contra abuso, frequentemente não.

### Degradação segura em vez de binário

A escolha nem sempre precisa ser entre tudo e nada.

Quando o serviço de política fica indisponível, algumas respostas intermediárias:

**Servir a política em cache**, com prazo máximo. Preserva funcionamento com risco
limitado.

**Permitir operações de leitura, negar escrita.** O dano de leitura indevida costuma
ser menor.

**Permitir o que já estava autorizado, negar concessões novas.**

**Modo restrito** — apenas as operações essenciais, para todos.

Essas opções são melhores que qualquer extremo, e exigem ter sido projetadas.

### O cache precisa de prazo

Servir política em cache é razoável por minutos e perigoso por dias.

Um cache sem prazo máximo transforma "falhar fechado" em "falhar aberto com atraso":
a revogação de acesso de alguém não tem efeito enquanto o cache servir a política
antiga.

Todo cache de decisão de segurança precisa de tempo máximo de vida, e o
comportamento após ele precisa ser explícito.

### Controles contornáveis

Um controle que pode ser evitado por outro caminho não é um controle.

Os casos recorrentes:

**Validação só na interface.** A API aceita o que a tela impede.

**Verificação no gateway.** O serviço é alcançável por outra rota.

**Autorização na leitura, ausente na exportação.** O relatório traz o que a tela
oculta.

**Regra no código, ausente no banco.** Um script de correção contorna tudo.

Ver [fronteiras seguras](secure-boundaries.md). O teste é sempre: **existe outro
caminho para o mesmo efeito?**

### Falha silenciosa é a pior

Um controle que falha e não avisa é pior que um que falha ruidosamente.

```text
falha ruidosa   erro, alerta, alguém investiga
falha silenciosa  o sistema segue funcionando, sem a proteção
```

Exemplos reais: uma verificação de assinatura que retorna verdadeiro quando não
consegue buscar a chave; um filtro de dados sensíveis que não roda por erro de
configuração; uma regra de firewall que não foi aplicada.

Todo controle relevante precisa de sinal — métrica de quantas vezes rodou, alerta se
parar de rodar. Um controle sem métrica é um controle que você não sabe se existe.

### Mensagem de erro é superfície

Uma mensagem que distingue "usuário não existe" de "senha incorreta" permite
enumeração. Uma que devolve o rastreamento de pilha revela estrutura interna. Uma que
diz "acesso negado ao recurso 4711" confirma que o recurso existe.

A regra: erros de segurança devem ser **genéricos para fora e detalhados no
registro**. Ver [auditabilidade](auditability.md).

E o tempo de resposta também vaza: uma verificação que retorna mais rápido quando o
usuário não existe é enumerável mesmo com mensagem idêntica.

## Modelo Mental

**O comportamento sob falha é política de segurança.** Se você não o decidiu, ele foi
decidido por um bloco de tratamento de exceção.

## Quando Usar

Decidir explicitamente é necessário para todo controle. Prioridade quando:

- O controle depende de um serviço externo.
- Há cache de decisão.
- O sistema tem múltiplos caminhos para o mesmo efeito.
- A indisponibilidade tem custo alto — a tentação de falhar aberto é maior.

## Quando Não Usar

**Falhar aberto em autorização** sem decisão registrada.

**Cache de política sem prazo.**

**Controle sem métrica.**

**Mensagem de erro detalhada** para fora.

**"Sempre fechado" como regra cega.** Para limite de taxa e proteção contra abuso,
frequentemente é a escolha errada.

**Tratamento de exceção genérico** em torno de verificação de segurança.

## Alternativas

- **Degradação graduada** — em vez de binário.
- **Cache com prazo curto** — meio-termo entre disponibilidade e revogação.
- **Avaliação local de política** — remove a dependência de rede na decisão. Ver
  [modelos de autorização](authz-models.md).
- **Redundância do serviço de política** — trata a causa em vez do sintoma.

## Trade-offs

| Falhar fechado | Falhar aberto |
|---|---|
| Segurança preservada | Perdida |
| Indisponibilidade | Continuidade |
| Incidente visível | Silencioso |
| Pressão para contornar | Nenhuma |

| Cache longo | Curto |
|---|---|
| Resiste a indisponibilidade | Menos |
| Revogação atrasada | Rápida |

## Modos de Falha

**Exceção engolida devolvendo permitido.**

**Cache servindo política revogada.**

**Controle contornável por outro caminho.**

**Falha silenciosa.** A proteção sumiu e ninguém soube.

**Falhar fechado sem previsão.** O sistema para e ninguém entende por quê.

**Contorno criado sob pressão.** Falhar fechado sem plano leva alguém a desabilitar
o controle durante o incidente — e a não reabilitar.

**Mensagem de erro vazando informação.**

## Erros Comuns

**Não decidir o comportamento sob falha.**

**Tratamento de exceção genérico em torno de verificações.**

**Cache sem prazo.**

**Não instrumentar o controle.**

**Não testar o caminho de falha.**

**Não prever o procedimento** para quando o controle falhar fechado.

## Exemplo Real

Uma plataforma de saúde tinha um serviço central de autorização consultado por doze
aplicações.

Numa indisponibilidade de 25 minutos desse serviço, o comportamento observado foi
inconsistente — porque cada aplicação tinha implementado o tratamento por conta:

**Quatro aplicações falharam fechado.** Pararam completamente. Correto, e ninguém
tinha previsto: não havia comunicação nem procedimento, e o suporte recebeu chamados
sem saber o que responder.

**Cinco falharam abertas.** Continuaram operando sem verificar autorização. Durante
25 minutos, qualquer usuário autenticado acessou qualquer registro. A auditoria
posterior encontrou 340 acessos que teriam sido negados — a maioria de curiosidade,
dois de pessoas acessando prontuários de conhecidos.

**Três serviram cache.** Duas com prazo de 5 minutos — comportamento adequado. Uma
com cache indefinido, que estava servindo uma política de três semanas antes,
incluindo acessos já revogados.

O caso mais grave: uma das cinco que falhou aberta tinha o tratamento de exceção
assim — capturar qualquer erro e retornar permitido, com um comentário dizendo "não
bloquear o usuário se o serviço estiver instável". Escrito dois anos antes, por
alguém que já não estava na empresa.

As correções:

**Comportamento decidido por controle**, documentado, com o dano de cada lado
avaliado:

```text
autorização de acesso a prontuário     fechado
leitura de catálogo de exames          cache de 15 min, depois fechado
limite de taxa                          aberto
segundo fator                           fechado
```

**Biblioteca única** de verificação, com o comportamento implementado uma vez, em vez
de doze.

**Cache com prazo obrigatório**, máximo de 15 minutos.

**Métrica por controle** — quantas verificações por minuto, e alerta se cair a zero.
Isso teria detectado a falha silenciosa das cinco aplicações em dois minutos.

**Procedimento e comunicação** para o caso de falha fechada, incluindo mensagem ao
usuário.

**Teste do caminho de falha** nos exercícios periódicos.

O que a equipe registra: nenhuma das doze aplicações tinha decidido o comportamento.
Todas o herdaram de quem escreveu o tratamento de exceção — e nas cinco piores, essa
pessoa tinha priorizado disponibilidade sem saber que estava tomando uma decisão de
segurança.

## Conceitos Relacionados

- [Fronteiras Seguras](secure-boundaries.md) — os controles contornáveis.
- [Modelos de Autorização](authz-models.md) — negar por padrão.
- [Auditabilidade](auditability.md) — o registro que revela.
- [Confiabilidade](../12-reliability/index.md).

## Exercício Prático

Escolha o controle de autorização mais crítico do seu sistema e desligue a dependência
dele num ambiente de teste.

O que acontece é a sua política de falha atual — decidida ou não.

## Perguntas de Entrevista

- Qual o critério para escolher entre falhar fechado e aberto?
- Por que falha silenciosa é pior que falha ruidosa?
- Por que um cache de política precisa de prazo máximo?

## Para Aprofundar

- Saltzer, Jerome; Schroeder, Michael. *The Protection of Information in Computer
  Systems*, 1975 — o princípio dos padrões seguros.
- OWASP. *Error Handling Cheat Sheet*.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
