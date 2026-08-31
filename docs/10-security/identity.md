---
id: identity
title: Identidade
sidebar_position: 1
description: Quem é o requisitante — e por que identidade, autenticação e autorização são três perguntas distintas.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor separa as três perguntas e escolhe onde a identidade vive
  no sistema.
prerequisites: [security]
related: [oauth2, oidc, authz-models]
canonical_for: [identidade digital, provedor de identidade, federação, ciclo de vida de identidade]
content_version: 1
last_reviewed: 2026-08-28
---

# Identidade

## Visão Geral

Identidade responde **quem é o requisitante**. É a base sobre a qual autenticação e
autorização são construídas, e é rotineiramente confundida com as duas.

```text
identidade      quem você é          um identificador estável
autenticação    prove que é você     credencial verificada
autorização     você pode fazer isso  permissão sobre um recurso
```

Separar as três é o que permite trocar o mecanismo de autenticação sem tocar em
autorização, e mudar regras de acesso sem mexer em login.

## Problema

Sistemas que confundem os três acoplam decisões que deveriam ser independentes.

O sintoma clássico: a regra de negócio verifica o **método de login** para decidir
permissão — "se entrou por senha corporativa, é funcionário; logo, pode aprovar".

Quando um caminho de autenticação novo aparece — login social, chave de API,
certificado — a regra quebra ou é contornada, e a permissão passa a depender de algo
que não deveria decidi-la.

## Conceitos Centrais

### O identificador precisa ser estável e opaco

A identidade interna de uma pessoa não deveria ser o e-mail, o CPF ou o nome de
usuário.

**Estável.** E-mails mudam. Nomes mudam. Se o identificador muda, todo o histórico
associado se perde ou precisa ser migrado.

**Opaco.** Um identificador que carrega significado — sequencial, derivado do
documento — vaza informação e permite enumeração.

O padrão robusto: um identificador interno opaco e imutável, com e-mail e documento
como atributos que podem mudar. Ver
[modelagem de dados](/07-data-architecture/data-modeling.md).

### Identidade de pessoa e de serviço são diferentes

```text
pessoa    autentica interativamente, tem sessão, pode ter segundo fator
          entra e sai, muda de função, sai da empresa
serviço   autentica sem interação, não tem sessão
          existe enquanto o serviço existe, escopo fixo
```

Tratar as duas com o mesmo mecanismo produz os dois problemas conhecidos: chaves de
longa duração para pessoas — que não expiram nem exigem segundo fator — e fluxos
interativos para serviços, que exigem credencial armazenada.

Cada uma tem seu mecanismo adequado, e misturá-los é a origem de boa parte das
credenciais que vazam.

### Federação resolve o desprovisionamento

Federar significa delegar a autenticação a um provedor de identidade central: as
aplicações não guardam senhas nem gerenciam contas.

O ganho mais importante não é conveniência de login único. É **desprovisionamento**:
quando alguém sai da organização, o acesso a tudo termina junto, porque não existem
contas locais espalhadas.

Sem federação, cada aplicação tem sua própria lista de usuários, e o
desprovisionamento depende de alguém lembrar de cada uma. Contas de ex-funcionários
ativas aparecem em toda auditoria de empresa que não federou.

### O ciclo de vida é a parte que ninguém projeta

Criar identidade é o passo fácil. O ciclo completo:

```text
criação        com qual verificação de que a pessoa é quem diz
alteração      mudança de função, de atributos, de credencial
suspensão      temporária — licença, investigação
desativação    saída
exclusão       remoção de dados pessoais, com o histórico preservado
recuperação    perdeu a credencial — e este é o passo mais atacado
```

A recuperação merece destaque: ela é, por definição, um caminho que **contorna** a
autenticação normal. Se ela for mais fraca que o login, ela é a autenticação real do
sistema.

Muitos comprometimentos entram por aí — recuperação por e-mail sem segundo fator,
perguntas de segurança respondíveis com dados públicos, atendimento humano que
redefine credencial sem verificação forte.

### Onde a identidade vive no sistema

Três padrões, com implicações diferentes:

**Propagada no token.** A identidade viaja com a requisição, verificável por cada
serviço. Ver [JWT](/10-security/jwt.md).

**Consultada num serviço central.** Cada serviço pergunta quem é. Sempre atual, com
custo de latência e uma dependência crítica.

**Resolvida na borda.** O gateway autentica e injeta a identidade. Simples, e cria a
premissa perigosa de que ninguém alcança os serviços sem passar por ele. Ver
[fronteiras seguras](/10-security/secure-boundaries.md).

A escolha mais comum e sólida é propagação com verificação em cada serviço — o
serviço não confia em quem chama, confia na assinatura.

### Identificar não é autorizar

Saber quem é o requisitante não diz o que ele pode fazer. Essa separação permite que
a mesma identidade tenha permissões diferentes em contextos diferentes — cliente numa
organização, administrador em outra.

Sistemas que amarram permissão à identidade, em vez de à relação entre identidade e
recurso, não conseguem expressar isso. Ver
[modelos de autorização](/10-security/authz-models.md).

## Modelo Mental

**Identidade é o identificador; autenticação é a prova; autorização é a
permissão.** Acoplar os três impede mudar qualquer um.

## Quando Usar

Decisões explícitas de identidade se pagam quando:

- Há mais de um mecanismo de autenticação.
- Pessoas e serviços acessam o mesmo sistema.
- Existe organização com funcionários a provisionar e desprovisionar.
- O sistema serve vários clientes.
- Há requisito de auditoria sobre quem fez o quê.

## Quando Não Usar

**Identificador que carrega significado.**

**E-mail como chave primária de identidade.**

**Mesmo mecanismo para pessoa e serviço.**

**Recuperação mais fraca que o login.**

**Permissão derivada do método de autenticação.**

**Contas locais por aplicação** numa organização com provedor de identidade
disponível.

## Alternativas

- **Provedor de identidade gerenciado** — em vez de construir. Autenticação é
  trabalho especializado e não diferencia quase nenhum produto. Ver
  [SaaS](/09-cloud-architecture/saas.md).
- **Federação corporativa** — para funcionários.
- **Login social** — para consumidores, com a ressalva de depender do provedor.
- **Certificados** — para identidade de serviço, sem segredo compartilhado.

## Trade-offs

| Provedor gerenciado | Construir |
|---|---|
| Segurança mantida por especialistas | Sua responsabilidade |
| Recursos prontos — segundo fator, federação | A implementar |
| Dependência do fornecedor | Controle |
| Custo por usuário | Custo de engenharia |

| Identidade propagada | Consultada centralmente |
|---|---|
| Sem chamada extra | Latência a cada verificação |
| Revogação difícil | Imediata |
| Serviços independentes | Dependência crítica |

## Modos de Falha

**Recuperação como caminho fraco.**

**Conta de ex-funcionário ativa.**

**Identificador reutilizado.** Um usuário novo herda o histórico de um antigo.

**Fusão de identidades.** Duas contas da mesma pessoa, com dados divididos.

**Enumeração.** A resposta de login revela se o usuário existe.

**Permissão amarrada ao método de login.**

**Provedor de identidade indisponível.** Ninguém entra — inclusive quem responderia
ao incidente.

## Erros Comuns

**Usar e-mail como identificador interno.**

**Não federar.**

**Não projetar o ciclo de vida além da criação.**

**Recuperação fraca.**

**Construir autenticação própria** sem razão específica.

**Não ter caminho de acesso de emergência** quando o provedor de identidade cai.

## Exemplo Real

Uma empresa de serviços tinha seis aplicações internas, cada uma com sua própria
lista de usuários e sua própria senha.

Três problemas, descobertos em momentos diferentes:

**Ex-funcionários ativos.** Uma auditoria encontrou 31 contas de pessoas que não
trabalhavam mais lá — espalhadas pelas seis aplicações. O processo de saída incluía
uma lista de sistemas a desativar, e a lista estava desatualizada em três deles.

**Recuperação explorada.** Uma das aplicações permitia redefinir senha respondendo
duas perguntas — nome da mãe e cidade natal. Ambas obteníveis publicamente. Uma
conta com acesso a dados financeiros foi comprometida assim.

**Identidade por e-mail.** Uma pessoa mudou de sobrenome após casamento, e o e-mail
corporativo mudou junto. Em quatro das seis aplicações, ela virou um usuário novo —
perdendo histórico, aprovações pendentes e permissões. Em uma delas, o e-mail antigo
foi posteriormente atribuído a outra pessoa, que herdou o acesso.

O terceiro caso foi o que mais assustou, porque não envolvia nenhum ataque.

A reformulação:

**Federação** com o provedor de identidade corporativo. As seis aplicações
passaram a delegar autenticação. O desprovisionamento virou automático — desativar
no diretório encerra tudo.

**Identificador interno opaco** em cada aplicação, com e-mail como atributo mutável.
A migração exigiu reconciliar as identidades duplicadas.

**Recuperação** unificada no provedor, com segundo fator obrigatório. As perguntas
de segurança foram eliminadas.

**Acesso de emergência**: duas contas locais, com credenciais em cofre físico, para
o caso de o provedor ficar indisponível — porque a federação criou uma dependência
crítica que não existia antes.

O que a equipe registra: a última decisão só apareceu porque alguém perguntou "e se
o provedor cair?". A federação resolveu cinco problemas e criou um ponto único que
ninguém tinha considerado.

## Conceitos Relacionados

- [OAuth 2.0](/10-security/oauth2.md) e [OpenID Connect](/10-security/oidc.md) — os protocolos.
- [JWT](/10-security/jwt.md) — o formato de propagação.
- [Modelos de Autorização](/10-security/authz-models.md) — a pergunta seguinte.
- [Autenticação](/05-system-design/authentication.md) — o nível de design de
  sistemas.

## Exercício Prático

Descubra qual é o identificador interno de usuário no seu sistema. Se for e-mail ou
documento, pergunte o que acontece quando ele muda.

Depois teste o fluxo de recuperação de credencial e compare a força dele com a do
login. Se for mais fraco, ele é a autenticação real.

## Perguntas de Entrevista

- Qual a diferença entre identidade, autenticação e autorização?
- Por que federação resolve desprovisionamento?
- Por que o fluxo de recuperação é o caminho mais atacado?

## Para Aprofundar

- NIST SP 800-63 — diretrizes de identidade digital.
- OWASP. *Authentication Cheat Sheet*.
- Wilson, Yvonne; Hingnikar, Abhishek. *Solving Identity Management in Modern
  Applications*. 2ª ed. Apress, 2022.
