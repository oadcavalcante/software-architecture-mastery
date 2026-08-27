---
id: oauth2
title: OAuth 2.0
sidebar_position: 2
description: Delegação de acesso — e por que ele não é um protocolo de autenticação, apesar de ser usado como um.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor escolhe o fluxo correto para cada tipo de cliente e
  reconhece o que OAuth 2.0 não resolve.
prerequisites: [identity]
related: [oidc, jwt, identity]
canonical_for: [OAuth 2.0, delegação de acesso, fluxo de autorização, escopo]
content_version: 1
last_reviewed: 2026-08-28
---

# OAuth 2.0

## Visão Geral

OAuth 2.0 é um protocolo de **delegação de acesso**: ele permite que uma aplicação
obtenha permissão para agir em nome de um usuário, sem receber a senha dele.

O problema que ele resolve é específico e importante: antes dele, integrar duas
aplicações significava dar a senha de uma para a outra.

E ele **não é um protocolo de autenticação**, apesar de ser usado como tal na maior
parte das implementações. Essa confusão é a fonte de vulnerabilidades reais, e é o
motivo de [OpenID Connect](oidc.md) existir.

## Problema

Uma aplicação de contabilidade precisa ler suas faturas de um sistema de pagamentos.

Sem OAuth, as opções eram ruins: dar a senha do sistema de pagamentos à contabilidade
— que passa a poder tudo, para sempre — ou criar uma credencial secundária, com
gestão manual.

OAuth resolve com um token de escopo limitado, revogável, obtido sem que a senha
jamais toque a aplicação intermediária.

## Conceitos Centrais

### Os quatro papéis

```text
dono do recurso        o usuário, que autoriza
cliente                a aplicação que quer acesso
servidor de autorização quem autentica o dono e emite tokens
servidor de recurso    quem detém a API protegida
```

A separação entre os dois últimos é o que muitas implementações colapsam — e ela é
o que permite que um servidor de autorização sirva muitas APIs.

### O fluxo que importa hoje

Dos fluxos originais, apenas um é recomendado para clientes que agem por um usuário:

**Código de autorização com PKCE.**

```text
1. cliente redireciona o usuário ao servidor de autorização,
   enviando o desafio derivado de um segredo gerado na hora
2. usuário autentica e consente
3. servidor devolve um código curto ao cliente
4. cliente troca o código pelo token, provando conhecer o segredo original
```

O passo 4 é o ponto: o token nunca passa pelo navegador, e o código interceptado é
inútil sem o segredo.

**PKCE não é mais opcional nem exclusivo de aplicações móveis.** Ele é recomendado
para todos os clientes, inclusive os que têm segredo próprio.

Os demais fluxos originais foram desencorajados ou removidos: o implícito expunha o
token na URL; o de senha do usuário derrota o propósito do protocolo.

**Credenciais de cliente** permanece, e é o fluxo correto quando não há usuário —
serviço falando com serviço.

### Escopo é grosso, autorização é fina

Escopo diz **que tipo de acesso** foi delegado: `faturas:ler`.

Ele não diz **quais** faturas. Essa decisão é do servidor de recurso, que combina a
identidade do usuário com suas próprias regras.

Confundir os dois produz o erro estrutural mais comum: tratar a presença de um
escopo como autorização suficiente. Um token com `faturas:ler` não autoriza ler as
faturas de outro usuário. Ver
[modelos de autorização](authz-models.md).

Escopo é o teto do que a aplicação pode pedir; autorização é o que ela de fato pode
naquele recurso.

### Por que não é autenticação

Um token de acesso diz "o portador tem permissão para X". Não diz **quem** é o
portador, nem que ele acabou de se autenticar.

Usar a existência do token como prova de identidade permite ataques conhecidos:
um token obtido para uma aplicação sendo apresentado a outra, que o aceita como
"login bem-sucedido".

O que faltava era um token que afirmasse identidade, com destinatário declarado.
Isso é [OpenID Connect](oidc.md), construído sobre OAuth exatamente para isso.

### Token de acesso curto, token de renovação longo

```text
acesso     minutos a uma hora — apresentado a cada requisição
renovação  dias a meses — usado só para obter novos tokens de acesso
```

A duração curta do token de acesso limita a janela de um vazamento, já que revogar
tokens autocontidos é difícil. Ver [JWT](jwt.md).

O token de renovação precisa de cuidado próprio: para clientes públicos,
**rotação** — cada uso emite um novo e invalida o anterior — permite detectar
reuso, que indica roubo.

### Cliente público e confidencial

**Confidencial.** Consegue guardar um segredo — aplicação de servidor.

**Público.** Não consegue — aplicação móvel, aplicação de página única. Qualquer
segredo embutido pode ser extraído.

Clientes públicos exigem PKCE e rotação de token de renovação. Tratar um cliente
público como confidencial — embutindo um segredo no aplicativo — é um equívoco
recorrente.

### Redirecionamento é o ponto de ataque

O parâmetro que diz para onde devolver o código é a superfície mais explorada.

A defesa: **comparação exata** contra uma lista registrada. Nada de correspondência
por prefixo, nada de curinga — as duas permitem redirecionar para um destino
controlado pelo atacante em domínios que parecem legítimos.

## Modelo Mental

**OAuth delega acesso, não prova identidade.** Se você precisa saber quem é o
usuário, precisa de OpenID Connect.

## Quando Usar

- Uma aplicação precisa acessar dados em nome de um usuário.
- Integração com API de terceiro.
- Você expõe uma API para aplicações de parceiros.
- Comunicação entre serviços com escopo — fluxo de credenciais de cliente.
- Aplicações móveis e de página única acessando sua API.

## Quando Não Usar

**Para autenticação.** Use [OpenID Connect](oidc.md).

**Fluxo implícito.** Desencorajado.

**Fluxo de senha do usuário.** Derrota o propósito.

**Sem PKCE.**

**Redirecionamento com curinga ou prefixo.**

**Escopo como autorização final.**

**Quando uma chave de API resolve.** Integração servidor a servidor, sem usuário e
sem escopo variável, não precisa de OAuth — a complexidade não se paga.

## Alternativas

- **[OpenID Connect](oidc.md)** — quando a pergunta é identidade.
- **Chave de API** — integração simples, sem delegação.
- **TLS mútuo** — identidade de serviço por certificado, sem token.
- **Token de acesso de curta duração emitido internamente** — quando as duas pontas
  são suas e não há terceiro envolvido.

## Trade-offs

| OAuth 2.0 | Chave de API |
|---|---|
| Escopo limitado | Tudo ou nada |
| Revogável por concessão | Por chave |
| Sem compartilhar senha | Segredo compartilhado |
| Complexo de implementar | Trivial |
| Padrão interoperável | Próprio |

| Token curto | Token longo |
|---|---|
| Janela de vazamento pequena | Grande |
| Renovação frequente | Rara |
| Revogação menos crítica | Crítica e difícil |

## Modos de Falha

**Redirecionamento aberto.** Código entregue ao atacante.

**Token no histórico do navegador.** Fluxo implícito.

**Escopo tratado como autorização.**

**Token de renovação roubado sem rotação.** Acesso indefinido.

**Segredo embutido em cliente público.**

**Token aceito por destinatário errado.** Emitido para uma aplicação, aceito por
outra.

**Consentimento excessivo.** O usuário aprova escopos que não entende.

## Erros Comuns

**Usar OAuth como autenticação.**

**Não usar PKCE.**

**Correspondência frouxa de redirecionamento.**

**Não rotacionar token de renovação em cliente público.**

**Não verificar o destinatário do token.**

**Implementar o servidor de autorização** em vez de usar um pronto. É o tipo de
componente em que erros são sutis e caros.

## Exemplo Real

Uma plataforma de gestão financeira expunha uma API para aplicações parceiras
acessarem dados dos clientes, com OAuth 2.0.

Quatro problemas encontrados numa avaliação de segurança:

**Redirecionamento por prefixo.** A validação aceitava qualquer URL que começasse
com o domínio registrado. Um parceiro tinha registrado `https://parceiro.com/` — e
`https://parceiro.com.atacante.net/` passava na verificação. Um atacante conseguiria
receber códigos de autorização de usuários legítimos.

**Escopo como autorização.** O servidor de recurso verificava se o token tinha
`contas:ler` e devolvia a conta pedida na URL — sem verificar se aquela conta
pertencia ao usuário do token. Qualquer parceiro autorizado por qualquer cliente
podia ler qualquer conta, trocando o identificador.

Esse foi classificado como o mais grave, e existia havia dois anos.

**Sem verificação de destinatário.** Um serviço interno aceitava tokens sem
verificar para qual aplicação tinham sido emitidos. Um token obtido por uma aplicação
de menor privilégio era aceito por serviços de maior.

**Token de renovação sem rotação**, com validade de um ano, em aplicações móveis.

As correções:

**Comparação exata** de redirecionamento, contra lista registrada. Três parceiros
precisaram atualizar o cadastro.

**Autorização no servidor de recurso.** A conta passou a ser derivada da relação
entre o usuário do token e o recurso, nunca do parâmetro. Ver
[fronteiras seguras](secure-boundaries.md).

**Verificação de destinatário** obrigatória em todos os serviços.

**Rotação de token de renovação**, com detecção de reuso — que, no primeiro mês,
disparou três vezes e revelou dois casos de token extraído de dispositivo.

O que a equipe registra: o problema mais grave não era de OAuth. O protocolo estava
implementado corretamente naquele ponto — o erro foi presumir que ter um token com o
escopo certo significava poder acessar o recurso pedido.

## Conceitos Relacionados

- [OpenID Connect](oidc.md) — a camada de identidade.
- [JWT](jwt.md) — o formato usual do token.
- [Identidade](identity.md).
- [Modelos de Autorização](authz-models.md) — o que o escopo não resolve.

## Exercício Prático

Se você expõe uma API com OAuth, verifique duas coisas: como o redirecionamento é
validado, e se o servidor de recurso verifica a relação entre o usuário do token e o
recurso pedido.

A segunda é onde estão as falhas graves, e ela não é sobre OAuth.

## Perguntas de Entrevista

- Por que OAuth 2.0 não é um protocolo de autenticação?
- Qual a diferença entre escopo e autorização?
- Por que PKCE deixou de ser exclusivo de clientes públicos?

## Para Aprofundar

- RFC 6749 — OAuth 2.0 Authorization Framework.
- RFC 9700 — Best Current Practice for OAuth 2.0 Security.
- Richer, Justin; Sanso, Antonio. *OAuth 2 in Action*. Manning, 2017.
