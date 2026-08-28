---
id: oidc
title: OpenID Connect
sidebar_position: 3
description: A camada de identidade sobre OAuth — o que o token de identidade afirma e o que precisa ser verificado.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor implementa autenticação delegada verificando todas as
  afirmações que importam.
prerequisites: [oauth2]
related: [oauth2, jwt, identity]
canonical_for: [OpenID Connect, token de identidade, login único]
content_version: 1
last_reviewed: 2026-08-28
---

# OpenID Connect

## Visão Geral

OpenID Connect é uma camada fina sobre [OAuth 2.0](oauth2.md) que acrescenta o que
faltava: **um token que afirma identidade**.

Onde OAuth entrega um token de acesso — "o portador pode fazer X" —, OpenID Connect
entrega também um **token de identidade**: "este usuário, com estes atributos,
autenticou-se neste momento, e este token é para você".

As três partes finais são o que impede os ataques que tornavam OAuth inadequado para
login.

## Problema

Usar OAuth para autenticação é comum e errado, e o erro tem consequência concreta.

O padrão problemático: a aplicação obtém um token de acesso, chama uma API de perfil,
recebe um identificador de usuário e considera a pessoa autenticada.

O que quebra: nada nesse fluxo garante que o token foi emitido **para essa
aplicação**. Um token obtido por outra aplicação — inclusive uma maliciosa, à qual o
usuário concedeu acesso — funciona igual.

OpenID Connect resolve com um token que declara o destinatário e é verificável.

## Conceitos Centrais

### O token de identidade e o de acesso são diferentes

```text
token de identidade  para o cliente — afirma quem autenticou
                     verificado pelo cliente, nunca enviado à API
token de acesso      para a API — afirma permissão
                     enviado à API, opaco para o cliente
```

Confundi-los é o erro mais comum de implementação. Enviar o token de identidade para
a API, ou tentar ler o token de acesso no cliente, indica que a distinção não foi
compreendida.

### As afirmações que precisam ser verificadas

Um token de identidade é um [JWT](jwt.md) assinado, e recebê-lo não basta — ele
precisa ser validado:

```text
assinatura   confere com a chave pública do emissor
iss          o emissor é quem você espera
aud          o destinatário é a sua aplicação — a verificação central
exp          não expirou
iat          emitido recentemente
nonce        corresponde ao valor que você enviou na requisição
```

**`aud` é a verificação que impede o ataque descrito acima.** Um token emitido para
outra aplicação tem outro destinatário e deve ser rejeitado.

**`nonce` impede reuso**: o cliente gera um valor aleatório, envia na requisição de
autenticação, e o token volta com ele. Um token capturado não serve numa sessão
nova.

Pular qualquer uma dessas transforma a autenticação em teatro.

### `sub` é o identificador, e ele é local ao emissor

O campo `sub` é o identificador estável do usuário — dentro daquele emissor.

Dois pontos que causam problema:

**Não use e-mail como identificador.** Ele pode mudar, e o campo `email_verified`
existe justamente porque nem sempre foi verificado. Aceitar um e-mail não verificado
como identidade permite que alguém se registre com o e-mail de outra pessoa e assuma
a conta dela.

**`sub` só é único dentro do emissor.** Com múltiplos provedores, a identidade
interna precisa ser a combinação de emissor e `sub`.

### Escopos e a origem dos atributos

Atributos do usuário vêm por escopos — `openid`, `profile`, `email` — e podem chegar
de dois lugares: dentro do token de identidade, ou de um endpoint de informações do
usuário.

Colocar muitos atributos no token o torna grande, e ele viaja em cada requisição de
autenticação. Buscar do endpoint mantém o token pequeno e adiciona uma chamada.

A prática usual: identificador e o mínimo no token; o restante consultado quando
necessário.

### Encerramento de sessão é a parte difícil

Login único funciona bem. **Logout único** é onde as implementações falham.

O usuário sai de uma aplicação — e continua autenticado nas outras, porque cada uma
tem sua própria sessão. Pior, um clique em "entrar" reautentica silenciosamente,
porque a sessão no provedor continua viva.

As especificações de encerramento existem e a adoção é irregular. O comportamento
precisa ser decidido explicitamente: sair de uma aplicação encerra a sessão do
provedor, ou apenas a local?

Para ambientes com dados sensíveis, encerrar tudo é o esperado — e frequentemente
não é o que acontece.

### Descoberta e rotação de chaves

O provedor publica sua configuração e suas chaves públicas em endereços conhecidos.

O cliente deve buscar as chaves e **armazená-las em cache com atualização periódica**
— porque os provedores rotacionam chaves. Uma implementação que fixa a chave quebra
na rotação, tipicamente numa madrugada.

E deve buscar por identificador de chave, não assumir que há uma só.

## Modelo Mental

**OpenID Connect é OAuth mais um token que diz quem você é e para quem ele foi
emitido.** As duas afirmações são o que torna a autenticação segura.

## Quando Usar

- Autenticação delegada a um provedor de identidade.
- Login único entre várias aplicações.
- Login social para consumidores.
- Federação corporativa.
- Você quer delegar autenticação em vez de gerenciar credenciais.

## Quando Não Usar

**Para autorização.** O token de identidade não é credencial de acesso a API.

**Sem verificar `aud`.** Anula a proteção principal.

**Sem `nonce`.** Permite reuso.

**Aceitando e-mail não verificado como identidade.**

**Token de identidade enviado à API.**

**Chave pública fixa no código.** Quebra na rotação.

**Quando não há usuário.** Serviço falando com serviço usa credenciais de cliente.

## Alternativas

- **[OAuth 2.0](oauth2.md) puro** — quando a necessidade é acesso delegado, não
  identidade.
- **SAML** — federação corporativa em ambientes que já o usam. Mais verboso, muito
  estabelecido.
- **TLS mútuo** — identidade de serviço.
- **Sessão própria com credencial local** — quando não há federação nem terceiros, e
  a simplicidade vale mais.

## Trade-offs

| OpenID Connect | Autenticação própria |
|---|---|
| Credenciais no provedor | Você as guarda |
| Segundo fator pronto | A implementar |
| Login único | Sessões separadas |
| Dependência do provedor | Autonomia |
| Verificações a acertar | Fluxo mais simples |

| Atributos no token | Endpoint de informações |
|---|---|
| Sem chamada extra | Uma chamada |
| Token grande | Pequeno |
| Dados podem envelhecer | Sempre atuais |

## Modos de Falha

**`aud` não verificado.** Token de outra aplicação aceito.

**`nonce` ausente.** Reuso de token.

**E-mail não verificado como chave.** Sequestro de conta.

**Chave rotacionada.** Validação quebra.

**Logout parcial.** Sessão persiste nas outras aplicações.

**Provedor indisponível.** Ninguém entra.

**`sub` colidindo entre provedores.**

## Erros Comuns

**Não verificar todas as afirmações.**

**Usar o token de identidade como token de acesso.**

**Identificar por e-mail.**

**Não tratar rotação de chaves.**

**Não decidir o comportamento de logout.**

**Implementar a validação à mão** em vez de usar biblioteca madura. Ela tem
detalhes que erram silenciosamente.

## Exemplo Real

Uma empresa de educação migrou seis aplicações para login único com OpenID Connect,
usando um provedor gerenciado.

A implementação foi feita por times diferentes, cada um na sua aplicação. Uma
revisão de segurança seis meses depois encontrou inconsistências:

**Duas aplicações não verificavam `aud`.** Um token emitido para a aplicação de
alunos era aceito pela aplicação administrativa. Como o provedor era o mesmo e os
usuários também, um aluno com conta legítima podia obter um token e apresentá-lo à
aplicação administrativa — que o aceitava e criava uma sessão. A autorização
subsequente barrava a maior parte das ações, mas não todas.

**Três não usavam `nonce`.**

**Uma identificava por e-mail.** Um aluno alterou o e-mail no cadastro para o de um
professor — que não tinha ainda acessado o sistema — e, no primeiro login, foi
reconhecido como o professor.

**Nenhuma tratava rotação de chaves.** Todas fixavam a chave pública em
configuração. Quando o provedor rotacionou, as seis pararam simultaneamente às 2h de
um domingo. O incidente durou 4 horas.

**Logout parcial.** Sair de uma aplicação não encerrava as demais. Em laboratórios
compartilhados da instituição, isso significava que o próximo usuário do computador
encontrava sessões abertas.

As correções:

**Biblioteca única** de validação, mantida centralmente, com todas as verificações.
Os seis times passaram a usá-la em vez de cada um implementar.

**Identificador interno** derivado de emissor mais `sub`.

**Cache de chaves** com atualização periódica e busca por identificador.

**Logout global** configurado, encerrando a sessão do provedor.

O aprendizado que ficou: seis implementações independentes do mesmo protocolo
produziram seis conjuntos diferentes de omissões. A decisão de deixar cada time
implementar — tomada para não criar dependência — custou mais que a dependência
teria custado.

## Conceitos Relacionados

- [OAuth 2.0](oauth2.md) — a base.
- [JWT](jwt.md) — o formato do token de identidade.
- [Identidade](identity.md).
- [Fronteiras Seguras](secure-boundaries.md).

## Exercício Prático

Pegue a validação de token de identidade do seu sistema e verifique se ela confere
assinatura, emissor, destinatário, expiração e `nonce`.

A ausência de qualquer uma é explorável, e a de destinatário é a mais grave.

## Perguntas de Entrevista

- Qual a diferença entre token de identidade e token de acesso?
- Por que verificar `aud` é a proteção central?
- Por que identificar por e-mail é perigoso?

## Para Aprofundar

- OpenID Connect Core 1.0 — a especificação.
- OpenID Connect Session Management e RP-Initiated Logout.
- Wilson, Yvonne; Hingnikar, Abhishek. *Solving Identity Management in Modern
  Applications*. 2ª ed. Apress, 2022.
