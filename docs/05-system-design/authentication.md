---
id: authentication
title: Autenticação
sidebar_position: 17
description: Provar quem está chamando — e onde essa prova é verificada em cada requisição.
doc_type: concept
level: 3
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor escolhe entre sessão e token a partir de requisitos de
  revogação e escala, e sabe onde a verificação deve acontecer.
prerequisites: [state-management]
related: [authorization, stateless-vs-stateful, identity]
canonical_for: [autenticação, sessão, token de acesso]
content_version: 1
last_reviewed: 2026-08-27
---

# Autenticação

## Visão Geral

Autenticação responde **quem está chamando**. É distinta de
[autorização](authorization.md), que responde o que essa pessoa pode fazer.

Este documento trata da decisão de sistema: onde a prova de identidade vive e onde
ela é verificada. Os protocolos e o modelo de ameaça são assunto de
[segurança](../10-security/index.md).

## Problema

HTTP não tem memória. Cada requisição chega sem saber quem a enviou, e provar
identidade a cada uma seria inviável — ninguém digita senha por requisição.

A saída é: autenticar uma vez e emitir uma **credencial de curta duração** que
comprova a autenticação anterior.

A decisão arquitetural é sobre essa credencial: ela referencia um estado no
servidor, ou carrega a informação consigo?

## Conceitos Centrais

### Sessão versus token

| | Sessão no servidor | Token autocontido |
|---|---|---|
| Onde o estado vive | Servidor | No próprio token |
| Verificar | Consulta ao armazenamento | Verificar assinatura |
| Revogar | Imediato | Só na expiração |
| Escala | Depende do armazenamento compartilhado | Sem estado |
| Tamanho | Identificador curto | Cresce com o conteúdo |
| Ler o conteúdo | Servidor consulta | Qualquer um decodifica |

A última linha é frequentemente mal entendida: um token assinado **não é
criptografado**. Ele é legível por quem o tiver — a assinatura garante que não foi
alterado, não que é secreto. Colocar dado sensível ali é vazamento.

### Revogação é o problema do token

Um token autocontido vale até expirar. Se um usuário é bloqueado, ou faz logout, ou
tem a credencial roubada, o token continua funcionando.

Três mitigações, com custos diferentes:

**Expiração curta.** Cinco a quinze minutos. A janela de exposição fica pequena, e
o custo é renovação frequente.

**Lista de revogação.** Verificar cada token contra uma lista de revogados —
o que reintroduz a consulta que o token existia para evitar. Vale se a lista for
pequena e consultada em cache.

**Token de renovação separado.** Um token de acesso curto mais um de renovação
longo, sendo o segundo revogável no servidor. É o arranjo mais comum, e concentra
o estado num único ponto consultado raramente.

### Onde verificar

Três lugares, e a escolha determina o que acontece quando algo falha:

**Na borda** — gateway ou proxy verifica antes de encaminhar. Centraliza, e os
serviços internos passam a confiar num cabeçalho. Se alguém alcançar o serviço
sem passar pela borda, não há verificação.

**Em cada serviço** — cada um verifica. Defesa em profundidade, ao custo de
repetição e de todos precisarem da chave de verificação.

**Ambos** — a borda rejeita o tráfego óbvio e cada serviço confirma. É a
recomendação para sistemas com fronteiras de confiança reais.

A escolha entre os dois primeiros é a mesma pergunta de
[Zero Trust](../10-security/index.md): a rede interna é confiável?

### Autenticação de serviço não é a mesma coisa

Serviço chamando serviço não tem usuário. As opções — credencial de cliente,
certificado mútuo, identidade de carga de trabalho fornecida pela plataforma —
têm requisitos diferentes de rotação e de escopo.

Reusar o token do usuário para chamadas internas é comum e problemático: ele
carrega as permissões do usuário para lugares que precisam de outras, e sua
expiração curta interrompe operações longas.

## Modelo Mental

**Sessão pergunta ao servidor quem é você. Token afirma quem é você, assinado.** A
diferença aparece quando você precisa desdizer.

## Quando Usar

**Sessão** quando:
- Revogação imediata é requisito.
- Há necessidade de invalidar todas as sessões de um usuário.
- O armazenamento compartilhado já existe e a latência extra é aceitável.

**Token autocontido** quando:
- Os serviços precisam ser sem estado.
- A verificação precisa funcionar sem chamada de rede.
- Há múltiplos serviços consumindo a mesma identidade.
- A expiração curta é aceitável operacionalmente.

## Quando Não Usar

**Token com expiração longa.** Uma credencial de 30 dias sem revogação é um risco
desproporcional.

**Token carregando dado sensível.** Ele é legível.

**Sessão em memória local com múltiplas instâncias.** Ver
[gestão de estado](state-management.md).

**Verificação só na borda, com rede interna acessível.** Um serviço alcançável
diretamente fica sem proteção.

**Implementar o mecanismo do zero.** Autenticação é
[generic domain](../04-domain-driven-design/generic-domain.md): a superfície de
erro é grande e o benefício de construir, nulo.

## Alternativas

- **Provedor de identidade externo** — delega o mecanismo. Ver
  [segurança](../10-security/index.md).
- **Chave de API** — para integração servidor a servidor, sem usuário.
- **Certificado mútuo** — entre serviços, quando a plataforma suporta.

## Trade-offs

| Sessão | Token |
|---|---|
| Revogação imediata | Só na expiração |
| Consulta por requisição | Verificação local |
| Estado a operar e escalar | Sem estado |
| Identificador pequeno | Cresce com o conteúdo |
| Difícil entre domínios | Trivial |

## Modos de Falha

**Token sem revogação em incidente.** Credencial vazada continua válida.

**Sessão sem expiração.** Acumula indefinidamente.

**Chave de assinatura sem rotação.** Comprometida uma vez, comprometida para
sempre.

**Relógio dessincronizado.** Token rejeitado por diferença de horário entre
serviços.

**Cabeçalho de identidade confiado sem verificação.** Se a borda injeta um
cabeçalho e um serviço confia nele cegamente, quem alcançar o serviço direto
forja identidade.

## Erros Comuns

**Colocar dado sensível no token.**

**Expiração longa sem mecanismo de revogação.**

**Confiar em cabeçalho injetado sem verificar a origem.**

**Reusar o token do usuário entre serviços internos.**

**Não planejar rotação de chave.**

## Exemplo Real

Um sistema com sete serviços usava token autocontido de 24 horas, verificado
apenas no gateway. Os serviços internos confiavam num cabeçalho `X-User-Id`
injetado por ele.

Dois problemas apareceram no mesmo trimestre.

**Revogação.** Um funcionário foi desligado e o acesso removido do provedor de
identidade. O token dele continuou funcionando por 19 horas — tempo em que ele
exportou dados. O incidente exigiu comunicação ao jurídico.

**Cabeçalho forjado.** Durante um teste de segurança, alguém alcançou um serviço
interno diretamente — a rede permitia — e enviou `X-User-Id` de um administrador.
O serviço aceitou.

As correções.

O token de acesso caiu para 10 minutos, com token de renovação de 8 horas,
revogável no servidor. A revogação passou a ter efeito em no máximo 10 minutos.

Cada serviço passou a verificar a assinatura do token, além do gateway. O
cabeçalho `X-User-Id` foi eliminado — a identidade vem do token verificado
localmente, não de algo que alguém injetou.

E as chamadas entre serviços passaram a usar credencial própria de serviço, com
escopo restrito ao que cada um precisa, em vez de repassar o token do usuário.

O que a equipe registrou: a decisão de verificar só na borda estava correta para
uma topologia em que os serviços eram inalcançáveis de fora. Ela deixou de valer
quando a rede mudou, e ninguém revisou.

## O ciclo de vida da credencial

A decisão entre sessão e token cobre o estado estacionário. O ciclo completo tem
quatro momentos, e três deles costumam ficar sem projeto.

**Emissão.** Após autenticar. A decisão aqui é a validade — e ela deveria variar
por contexto: uma sessão de aplicativo móvel e uma de terminal administrativo não
merecem o mesmo prazo.

**Renovação.** Quando a credencial curta expira. O ponto delicado é a **rotação do
token de renovação**: emitir um novo a cada uso e invalidar o anterior permite
detectar roubo — se um token de renovação já usado reaparece, alguém o copiou, e
toda a família de tokens daquele usuário deve ser invalidada.

**Revogação.** Logout, bloqueio, troca de senha, incidente. Precisa existir um
caminho que funcione em minutos, não em horas.

**Expiração.** O fim natural. Sem limpeza, sessões expiradas acumulam
indefinidamente no armazenamento.

O segundo momento é o menos projetado e o que mais rende: rotação com detecção de
reuso transforma um token roubado em um alarme, em vez de um acesso silencioso
válido até expirar.

## Conceitos Relacionados

- [Autorização](authorization.md) — o que vem depois.
- [Gestão de Estado](state-management.md) — onde a sessão mora.
- [Sem Estado vs. Com Estado](stateless-vs-stateful.md) — por que token escala.
- [Segurança](../10-security/index.md) — protocolos, ameaças e gestão de chaves.

## Exercício Prático

No seu sistema: qual a validade do token de acesso? Quanto tempo leva para uma
revogação ter efeito?

Depois teste: alcance um serviço interno diretamente, sem passar pela borda. Ele
verifica alguma coisa?

## Perguntas de Entrevista

- Qual a diferença entre sessão e token autocontido?
- Por que revogação é o problema do token, e quais as mitigações?
- Por que um token assinado não deve carregar dado sensível?

## Para Aprofundar

- OWASP — *Authentication Cheat Sheet*.
- RFC 6749 e RFC 9068 — OAuth 2.0 e o perfil de token de acesso.
