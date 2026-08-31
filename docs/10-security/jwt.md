---
id: jwt
title: JWT
sidebar_position: 4
description: Token autocontido e verificável — e o problema de revogação que a maioria das implementações ignora.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor usa JWT sabendo o que ele resolve, o que ele não esconde e
  como tratar revogação.
prerequisites: [oauth2]
related: [oauth2, oidc, secrets]
canonical_for: [JWT, token autocontido, revogação de token, token de portador]
content_version: 1
last_reviewed: 2026-08-28
---

# JWT

## Visão Geral

JWT é um formato de token **autocontido e assinado**: ele carrega afirmações sobre
o portador, e qualquer parte com a chave adequada pode verificá-las sem consultar
ninguém.

Isso resolve um problema real de escala — verificar identidade sem uma chamada a um
serviço central em cada requisição.

E cria um problema estrutural: **um token emitido não pode ser desfeito**. A maior
parte das implementações ignora isso até precisar revogar algo.

## Problema

Sessões tradicionais guardam estado no servidor: um identificador opaco, e os dados
consultados a cada requisição.

Isso é simples, permite revogação imediata, e exige um armazenamento compartilhado
consultado em toda requisição — que vira dependência crítica e ponto de contenção
com muitos serviços.

JWT inverte: o estado viaja no token, verificável localmente. A troca é revogação
por escalabilidade.

## Conceitos Centrais

### Assinado não é cifrado

O erro mais comum, e o mais consequente.

Um JWT assinado tem o conteúdo **codificado, não criptografado**. Qualquer pessoa
com o token lê tudo que há dentro, sem nenhuma chave.

```text
assinatura   garante que não foi alterado e quem emitiu
cifragem     esconde o conteúdo — exige JWE, que é outra coisa
```

Consequência prática: **nada sensível dentro do token**. Nem documento, nem dados
pessoais, nem informação interna que não deveria ser conhecida pelo cliente.

Isso aparece em avaliações de segurança com frequência desconfortável.

### Revogação é o problema estrutural

Um token válido continua válido até expirar. Não há como cancelá-lo — é essa a
natureza do modelo autocontido.

Isso importa quando: o usuário sai da empresa, a sessão é encerrada, a permissão
muda, ou o token vaza.

As saídas, com seus custos:

**Expiração curta.** Minutos, com renovação. Limita a janela sem consultar nada. É a
primeira linha, e é insuficiente sozinha para casos que exigem revogação imediata.

**Lista de revogação.** Consultada a cada requisição. Funciona, e reintroduz a
consulta que o JWT evitava — embora a uma estrutura muito menor que a de sessões.

**Versão de credencial.** O token carrega um número; o servidor compara com o valor
atual do usuário. Invalidar todos os tokens de alguém é incrementar o número. Custa
uma consulta leve e resolve o caso mais comum.

**Referência opaca.** O token não é um JWT — é um identificador consultado. Sessão
tradicional, com todos os benefícios de revogação.

A escolha honesta: se revogação imediata é requisito, JWT autocontido não é o
mecanismo certo — ou precisa de uma das mitigações, que reintroduzem estado.

### O algoritmo precisa ser fixado

Uma classe de vulnerabilidade histórica vem do campo que declara o algoritmo: um
atacante altera para `none` ou troca assinatura assimétrica por simétrica, usando a
chave pública como segredo.

A defesa: **o verificador fixa o algoritmo esperado** e ignora o que o token
declara. Bibliotecas modernas exigem isso, e as antigas não exigiam.

### O que verificar, sempre

```text
assinatura   com a chave correta e o algoritmo esperado
exp          expiração
iss          emissor esperado
aud          destinatário — o seu serviço
nbf          não usado antes do previsto
```

Verificar assinatura e esquecer expiração é comum, e transforma um token de uma hora
em permanente.

### Tamanho tem custo

O token viaja em cada requisição, tipicamente num cabeçalho.

Um JWT com muitas afirmações — lista de permissões, atributos, grupos — pode chegar
a vários kilobytes, e alguns servidores rejeitam cabeçalhos acima de um limite.

Além disso, permissões dentro do token ficam congeladas até a expiração: alterar
uma permissão não tem efeito imediato. Para autorização que muda, é melhor consultar.
Ver [modelos de autorização](/10-security/authz-models.md).

### Token de portador é como dinheiro

Quem tem o token, é o portador. Não há vínculo com dispositivo ou sessão.

Isso significa que o transporte e o armazenamento importam tanto quanto a
assinatura:

**Sempre sobre TLS.**

**No cliente web**, cookie com marcação de acesso restrito a HTTP é preferível ao
armazenamento local, que é acessível a qualquer script injetado.

**Nunca na URL.** Fica em registros de servidor, no histórico e no cabeçalho de
origem.

Existem mecanismos que vinculam o token a uma chave do cliente, tornando-o inútil se
roubado — pouco adotados, e a resposta certa para cenários de alto valor.

## Modelo Mental

**JWT troca revogação por não precisar consultar ninguém.** Se você precisa revogar
rápido, está pagando um preço sem receber o benefício.

## Quando Usar

- Muitos serviços precisam verificar identidade sem consulta central.
- Comunicação entre serviços com identidade propagada.
- Token de identidade em [OpenID Connect](/10-security/oidc.md).
- Tokens de curta duração com renovação.
- Escala em que a consulta de sessão seria gargalo.

## Quando Não Usar

**Quando revogação imediata é requisito**, sem mitigação.

**Para guardar dados sensíveis.**

**Com expiração longa.**

**Como sessão de aplicação web** quando um cookie de sessão resolve — o que é o caso
da maioria das aplicações de servidor único.

**Sem verificar todas as afirmações.**

**Com permissões dentro**, se elas mudam.

## Alternativas

- **Sessão com identificador opaco** — revogação imediata, estado no servidor.
  Frequentemente a escolha certa, e frequentemente descartada por moda.
- **Token de referência** — opaco para o cliente, consultado pela API.
- **JWT com versão de credencial** — meio-termo prático.
- **JWE** — quando o conteúdo precisa ser confidencial.

## Trade-offs

| JWT autocontido | Sessão com estado |
|---|---|
| Sem consulta a cada requisição | Consulta sempre |
| Revogação difícil | Imediata |
| Escala horizontalmente | Armazenamento compartilhado |
| Conteúdo legível pelo cliente | Opaco |
| Tamanho maior | Identificador pequeno |
| Permissões congeladas | Sempre atuais |

## Modos de Falha

**Token não revogável após demissão ou vazamento.**

**Dados sensíveis expostos.**

**Algoritmo manipulado.**

**Expiração não verificada.**

**Destinatário não verificado.** Ver [OpenID Connect](/10-security/oidc.md).

**Token roubado do armazenamento do navegador** por script injetado.

**Cabeçalho grande demais.** Requisições rejeitadas por limite.

**Chave de assinatura vazada.** Permite forjar qualquer token — o pior caso, e o
motivo de a chave merecer o tratamento de
[gestão de chaves](/10-security/key-management.md).

## Erros Comuns

**Colocar dados sensíveis dentro.** O conteúdo é apenas codificado em base64 — legível por qualquer um que tenha o token, inclusive o próprio usuário.

**Expiração longa.** O token não pode ser revogado sem infraestrutura adicional, então a expiração é a única defesa. Vinte e quatro horas de validade são vinte e quatro horas de acesso para quem o roubar.

**Não fixar o algoritmo.** Aceitar o algoritmo declarado no cabeçalho permite o ataque clássico de trocá-lo por `none` ou por um simétrico com a chave pública como segredo. O verificador precisa exigir o algoritmo esperado.

**Não verificar `aud`.** Sem verificar o destinatário, um token emitido para outro serviço da mesma organização é aceito aqui — e o escopo pretendido evapora.

**Guardar no armazenamento local do navegador.** Fica acessível a qualquer script da página, o que transforma uma falha de script entre sites em roubo de sessão. Cookie com marcação de acesso restrito não tem esse problema.

**Usar JWT onde sessão resolveria melhor.** Numa aplicação com um back-end só, sessão do lado do servidor é revogável na hora e mais simples. O token autocontido paga o preço da revogação difícil para resolver um problema de distribuição que ali não existe.

## Exemplo Real

Uma plataforma de recursos humanos usava JWT com validade de 24 horas para
autenticar usuários em oito serviços.

Quatro problemas, encontrados em momentos diferentes:

**Demissão sem revogação.** Um funcionário desligado manteve acesso por quase um dia
inteiro após a desativação da conta. O token na máquina dele continuou válido, e ele
acessou dados de folha depois do desligamento. O processo de saída presumia que
desativar a conta encerrava o acesso.

**Dados sensíveis no token.** O token carregava nome completo, CPF, cargo e salário
— porque era conveniente ter isso disponível sem consulta. Qualquer pessoa com
acesso ao navegador, ou a registros que capturavam cabeçalhos, lia tudo.

Os registros de um gateway estavam gravando cabeçalhos completos, incluindo os
tokens. Havia três meses de dados salariais em texto legível num sistema de registros
com acesso amplo.

**Permissões congeladas.** Revogar o acesso de alguém a um módulo não tinha efeito
até o token expirar. Isso foi descoberto durante uma investigação interna, quando o
acesso de uma pessoa foi removido e ela continuou operando.

**Armazenamento local.** Uma vulnerabilidade de injeção de script numa página
permitiu extrair tokens.

As correções:

**Expiração de 15 minutos**, com token de renovação de 8 horas e rotação.

**Versão de credencial** no token, comparada com o valor do usuário. Desativar uma
conta passou a incrementar a versão, invalidando tudo imediatamente. O custo foi uma
consulta leve a um cache.

**Token mínimo**: identificador, emissor, destinatário, expiração e versão. Todo o
resto passou a ser consultado.

**Cookie com acesso restrito a HTTP** em vez de armazenamento local.

**Registros com omissão** de cabeçalhos de autorização — e os três meses de registros
existentes foram expurgados.

A conclusão registrada: a escolha de JWT tinha sido feita por escala, e o sistema
tinha 400 usuários. Uma sessão tradicional teria atendido com folga, sem nenhum dos
quatro problemas.

## Conceitos Relacionados

- [OAuth 2.0](/10-security/oauth2.md) e [OpenID Connect](/10-security/oidc.md).
- [Segredos](/10-security/secrets.md) — a chave de assinatura.
- [Gestão de Chaves](/10-security/key-management.md).
- [Autenticação](/05-system-design/authentication.md).

## Exercício Prático

Decodifique um JWT do seu sistema — não precisa de chave nenhuma — e veja o que há
dentro. Depois pergunte: essa informação pode ser lida pelo cliente e por quem
capturar um registro?

E responda: como você revoga esse token agora, se precisar?

## Perguntas de Entrevista

- Por que assinado não é cifrado, e qual a consequência?
- Quais as opções para revogar, e o que cada uma custa?
- Quando uma sessão tradicional é melhor escolha?

## Para Aprofundar

- RFC 7519 — JSON Web Token.
- RFC 8725 — JSON Web Token Best Current Practices.
- OWASP. *JSON Web Token Cheat Sheet*.
