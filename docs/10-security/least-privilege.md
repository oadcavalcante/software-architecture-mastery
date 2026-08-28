---
id: least-privilege
title: Menor Privilégio
sidebar_position: 12
description: Conceder apenas o necessário — o princípio que define o tamanho do dano quando algo dá errado.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor concede acesso a partir do uso real e reduz permissões
  acumuladas com base em dados.
prerequisites: [security]
related: [secure-boundaries, authz-models, cloud-identity]
canonical_for: [menor privilégio, escalonamento de privilégio, acumulação de privilégio]
content_version: 1
last_reviewed: 2026-08-28
---

# Menor Privilégio

## Visão Geral

Menor privilégio é conceder a cada identidade — pessoa, serviço, processo — apenas o
acesso necessário para sua função, e nada além.

É o princípio que **define o tamanho do dano** quando algo dá errado. O
comprometimento vai acontecer; o que ele alcança é exatamente o que aquela
identidade podia fazer.

Ele é universalmente aceito e raramente praticado, porque o caminho de menor
resistência vai na direção oposta.

## Problema

A dinâmica que produz permissão excessiva é sempre a mesma:

Alguém precisa de acesso para uma tarefa. Descobrir a permissão exata leva tempo. A
permissão ampla resolve em segundos e não gera erro.

Ninguém volta para restringir, porque restringir pode quebrar algo e não traz
benefício visível.

Isso se repete por anos. O resultado é um ambiente onde quase todas as identidades
podem fazer quase tudo, e ninguém sabe o que é usado de fato.

## Conceitos Centrais

### O princípio se operacionaliza com dados

"Conceda o mínimo" é conselho vago. O que funciona é um procedimento:

**Comece negando tudo.** A permissão é adicionada quando a necessidade real aparece,
não quando é imaginada.

**Use os registros de acesso.** Quase todo sistema moderno registra quais permissões
foram exercidas. Comparar o concedido com o usado transforma a redução em decisão
baseada em evidência, não em coragem.

**Restrinja por recurso, não só por ação.** Permitir leitura em um armazenamento
específico é muito diferente de permitir leitura em todos.

**Restrinja por condição.** Origem de rede, horário, presença de autenticação forte.

**Revise periodicamente.** Permissões para tarefas temporárias permanecem.

O segundo item é o que destrava a prática: reduzir permissões com base em uso real
de 90 dias é seguro e verificável, enquanto reduzir por intuição é arriscado e
ninguém faz.

### Acumulação de privilégio

O modo de falha específico de pessoas: alguém muda de função e recebe os acessos
novos, sem perder os antigos.

Depois de alguns anos e algumas mudanças, essa pessoa tem acesso a praticamente
tudo — sem que nenhuma concessão individual tenha sido errada.

O controle é revisão periódica por função, não por pessoa: **o que este papel
precisa?**, e não **o que esta pessoa tem?**.

### Elevação temporária em vez de permanente

O padrão que resolve a tensão entre segurança e operação:

```text
permanente   acesso administrativo o tempo todo
temporário   acesso concedido por 2 horas, com justificativa e registro
```

A elevação temporária permite que o acesso administrativo exista sem estar
exposto continuamente. Se a credencial de alguém vaza, ela não vem com poderes
elevados.

É a mudança de maior impacto para acesso humano, e ela é operacionalmente viável —
o atrito de pedir elevação é pequeno comparado ao de não ter acesso nenhum.

### Identidade de serviço merece mais rigor que a de pessoa

Uma pessoa exerce julgamento. Um serviço executa o que foi programado, sempre, e
suas credenciais estão em algum lugar acessível ao código.

Mesmo assim, identidades de serviço costumam receber permissões mais amplas, porque
"é só um serviço".

Elas deveriam ser as mais restritas: escopo mínimo, credenciais de curta duração,
sem permissão de alterar permissões. Ver
[identidade em nuvem](../09-cloud-architecture/cloud-identity.md).

### Escalonamento de privilégio é sutil

Certas permissões são, efetivamente, permissão para tudo:

```text
alterar políticas de acesso   pode se conceder qualquer coisa
criar identidades             pode criar uma com mais poder
anexar papéis a recursos      pode dar poder a algo que controla
alterar configuração de auditoria  pode apagar o rastro
implantar código em produção  o código roda com o privilégio do ambiente
```

A última é frequentemente esquecida: quem controla a esteira controla o que roda em
produção. Ver [confiança na cadeia de suprimentos](supply-chain-trust.md).

Essas permissões merecem tratamento separado, e quase nunca pertencem a uma
aplicação.

### O custo é real e precisa ser reconhecido

Menor privilégio custa: erros de permissão durante o desenvolvimento, tempo para
descobrir o escopo exato, atrito operacional.

Fingir que não custa é o que faz a prática ser abandonada na primeira urgência. O
que a torna sustentável é reduzir o atrito — elevação temporária fácil de pedir,
ferramentas que sugerem o escopo com base no uso, ambientes de desenvolvimento mais
permissivos que produção.

## Modelo Mental

**Permissão é alcance de dano.** Toda concessão é uma decisão sobre o que um
comprometimento futuro vai poder fazer.

## Quando Usar

Sempre. Prioridade especial quando:

- Há dados sensíveis ou regulados.
- Existem identidades de serviço com credenciais persistentes.
- O ambiente cresceu sem revisão.
- Vários times compartilham a infraestrutura.
- Há acesso de terceiros.

## Quando Não Usar

**Permissão ampla para destravar rápido.** Ela permanece.

**Sem medir o uso real** antes de reduzir. A redução por intuição quebra coisas e
desmoraliza a prática.

**Rigor extremo em ambiente de desenvolvimento**, ao ponto de as pessoas
contornarem. O contorno é pior que a permissão.

**Permissão de alterar políticas** em identidade de aplicação.

**Revisão por pessoa** em vez de por função.

## Alternativas

Formas de reduzir alcance sem reescrever toda a política:

- **Elevação temporária** — o de maior retorno para acesso humano.
- **Separação por conta ou ambiente** — fronteira mais robusta que política. Ver
  [fronteiras seguras](secure-boundaries.md).
- **Credenciais de curta duração** — reduz a janela de exploração.
- **Análise automatizada de permissões** — compara concedido com usado.
- **Aprovação de duas pessoas** para operações destrutivas.

## Trade-offs

| Menor privilégio | Permissão ampla |
|---|---|
| Dano contido | Alcance total |
| Configuração trabalhosa | Rápida |
| Erros durante desenvolvimento | Nenhum |
| Revisão periódica necessária | Nenhuma |
| Atrito operacional | Fluidez |

| Elevação temporária | Acesso permanente |
|---|---|
| Credencial vazada tem pouco poder | Poder total |
| Registro de cada elevação | Nenhum |
| Atrito ao precisar | Nenhum |

## Modos de Falha

**Permissão acumulada.** Ampliada, nunca reduzida.

**Acumulação por mudança de função.**

**Escalonamento de privilégio.** Uma permissão dá acesso a todas.

**Identidade de serviço com poder de administrador.**

**Credencial de longa duração com escopo amplo.** A combinação mais perigosa.

**Redução quebrando produção.** Feita sem dados de uso.

**Contorno.** Rigor excessivo faz as pessoas criarem caminhos paralelos.

## Erros Comuns

**Ampliar até o erro sumir.**

**Não usar registros de uso para reduzir.**

**Revisar por pessoa.**

**Tratar identidade de serviço com menos rigor.**

**Não separar as permissões de escalonamento.**

**Não medir o atrito.** Uma prática que as pessoas contornam não está funcionando.

## Exemplo Real

Uma empresa de logística fez uma revisão de acesso após um incidente em outra
empresa do setor.

O levantamento inicial:

**86% das identidades** tinham permissões nunca exercidas nos últimos 90 dias.

**14 pessoas** com acesso administrativo permanente à produção — de um time de 60.

**Todas as 23 identidades de serviço** com permissão de leitura em todos os
armazenamentos, porque o modelo de política tinha sido copiado da primeira.

**4 pessoas** que haviam mudado de função mantinham os acessos anteriores; uma delas
tinha passado por três áreas e acumulava acesso a finanças, operações e engenharia.

**A esteira de implantação** podia alterar políticas de acesso — o que significava
que qualquer pessoa capaz de aprovar uma mudança na esteira podia conceder-se
qualquer permissão.

A redução foi feita em três fases, com dados:

**Fase 1 — corte por uso.** Permissões não exercidas em 90 dias foram removidas,
com um período de duas semanas em modo de aviso: em vez de negar, registrar o que
seria negado. Isso revelou 11 permissões que eram usadas raramente — trimestralmente
— e teriam quebrado. Elas foram mantidas.

**Fase 2 — elevação temporária.** O acesso administrativo permanente foi removido
das 14 pessoas e substituído por elevação de 4 horas mediante justificativa. Nos
seis meses seguintes, a média foi de 3 elevações por semana no time inteiro — o
acesso permanente estava sendo mantido para um uso ocasional.

**Fase 3 — escopo por serviço.** Cada identidade de serviço recebeu política própria,
derivada dos registros de acesso. Duas quebraram, ambas por dependências não
documentadas que a análise não pegou.

Resultado após um ano: as permissões concedidas caíram cerca de 80%, e houve três
incidentes de "faltou permissão" — todos resolvidos em menos de uma hora pelo
processo de elevação.

O que se registrou depois: a fase 1 em modo de aviso foi o que tornou tudo viável. A
proposta original era cortar direto, e o time de operações tinha vetado — com razão.
Duas semanas registrando o que seria negado transformou uma discussão de risco numa
lista de exceções.

## Conceitos Relacionados

- [Fronteiras Seguras](secure-boundaries.md).
- [Modelos de Autorização](authz-models.md) — como expressar as permissões.
- [Identidade em Nuvem](../09-cloud-architecture/cloud-identity.md).
- [Auditabilidade](auditability.md).

## Exercício Prático

Pegue a identidade da sua aplicação principal e compare o que ela **pode** fazer com
o que ela **fez** nos últimos 90 dias.

Depois faça o mesmo com a sua própria conta. A diferença, nos dois casos, é o
alcance de um comprometimento que ainda não aconteceu.

## Perguntas de Entrevista

- Por que reduzir permissões deve partir de dados de uso?
- O que é acumulação de privilégio e como se controla?
- Quais permissões constituem escalonamento de privilégio?

## Para Aprofundar

- Saltzer, Jerome; Schroeder, Michael. *The Protection of Information in Computer
  Systems*, 1975 — a formulação original.
- NIST SP 800-53 — controles de acesso.
- Documentação de análise de acesso dos principais provedores de nuvem.
