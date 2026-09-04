---
id: api-gateways
title: API Gateways
sidebar_position: 9
description: Um ponto de entrada para muitas APIs — o que ele resolve de verdade e como vira gargalo.
doc_type: pattern
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor sabe o que pertence ao gateway e o que nunca deveria
  entrar nele.
prerequisites: [rest]
related: [service-mesh, rest, graphql]
canonical_for: [API gateway, backend para frontend, gateway de borda]
content_version: 2
last_reviewed: 2026-08-27
---

# API Gateways

## Visão Geral

Um API gateway é um ponto único de entrada que fica na frente de vários serviços e
concentra o que é comum a todas as chamadas: autenticação, limite de taxa,
roteamento, registro.

Ele resolve um problema concreto — evitar que cada serviço reimplemente as mesmas
preocupações de borda — e cria um risco igualmente concreto: virar o lugar onde
lógica de negócio se acumula até que ninguém possa mudá-lo.

A pergunta que organiza tudo: **isto é preocupação de borda ou de domínio?**

## Problema

Com vários serviços expostos, cada um precisa de autenticação, limite de taxa,
tratamento de origem cruzada, registro e métricas.

Implementar isso em cada serviço multiplica código e, pior, multiplica versões
divergentes: um serviço valida o token de um jeito, outro de outro, e uma correção
de segurança precisa ser aplicada em doze lugares.

O gateway centraliza. E, ao centralizar, torna-se caminho crítico de tudo.

## Conceitos Centrais

### O que pertence ao gateway

Preocupações que valem para toda requisição, independentemente do domínio:

```text
autenticação        validar o token, rejeitar o inválido
roteamento          qual serviço atende este caminho
limite de taxa      por cliente, por rota
TLS                 terminação e certificados
registro e métricas uniformes, no mesmo formato
tradução            REST na borda, gRPC dentro
compressão          e negociação de conteúdo
```

Todas têm em comum não depender de regra de negócio.

### O que não pertence

**Autorização de domínio.** O gateway pode verificar que o token é válido; ele não
deveria saber que "um gerente pode aprovar até 10 mil reais". Essa regra é do
domínio, muda com o negócio, e no gateway fica longe de quem a entende.

**Transformação de payload com regra.** Converter formato tudo bem; decidir o que
enviar com base em condição de negócio, não.

**Orquestração de vários serviços.** Um gateway que chama três serviços e combina
respostas virou aplicação. Se isso é necessário, é um serviço de composição — que
pode até ficar atrás do gateway, mas não *ser* o gateway.

**Estado.** Cache é aceitável; estado de sessão de negócio, não.

A fronteira é essa, e ela é violada aos poucos: cada exceção parece pequena.

### Backend para frontend

Uma variação: em vez de um gateway genérico, um por tipo de cliente.

```text
aplicativo móvel  → BFF móvel  → serviços
web               → BFF web    → serviços
parceiros         → BFF público → serviços
```

Cada um agrega e formata para as necessidades daquele cliente, e é mantido pelo
time que constrói aquele cliente.

Isso resolve o gargalo organizacional: o time de frontend deixa de esperar o time
de plataforma para mudar um formato.

O custo é duplicação entre os BFFs, e ela é frequentemente aceitável — a
alternativa é um gateway genérico que serve mal a todos.

### Ele é ponto único de falha por construção

Todo tráfego passa por ele. Isso exige o mesmo cuidado de qualquer componente
crítico: várias instâncias, sem estado, verificação de saúde, e capacidade
dimensionada para o pico agregado.

E exige atenção a um modo de falha específico: **uma configuração errada derruba
tudo**. Uma regra de roteamento mal escrita não afeta um serviço — afeta todos.

Por isso a configuração do gateway merece o mesmo processo que código: revisão,
versionamento, ambiente de teste e implantação gradual.

### Ele não resolve comunicação entre serviços

Confusão comum. O gateway cuida do tráfego que **entra** na malha. Comunicação
entre serviços internos passa por outro caminho.

Rotear chamadas internas pelo gateway adiciona um salto de rede, cria dependência
de um componente de borda para operação interna e concentra carga que não
precisava passar por ali.

Para o problema interno, ver [malha de serviço](/08-integration-architecture/service-mesh.md).

### Quando ele ainda não vale

Com dois ou três serviços e um cliente, um gateway é infraestrutura a operar sem
problema correspondente. O balanceador que você já tem faz roteamento, e a
autenticação numa biblioteca compartilhada cobre o resto.

O gateway se paga quando o número de serviços expostos e de clientes cresce a
ponto de a duplicação doer.

## Modelo Mental

**O gateway cuida de preocupações de borda, não de domínio.** Cada regra de
negócio que entra nele é uma que sai de onde deveria estar.

## Quando Usar

- Vários serviços expostos externamente.
- Autenticação e limite de taxa uniformes.
- Clientes diversos com necessidades de formato diferentes.
- Tradução entre protocolos — REST fora, gRPC dentro.
- Ponto único para observabilidade de borda.
- API pública com parceiros e cotas.

## Quando Não Usar

**Com poucos serviços e um cliente.**

**Para tráfego entre serviços internos.**

**Como camada de orquestração.**

**Com autorização de domínio dentro.**

**Sem alta disponibilidade.** Ponto único de falha real.

**Como lugar de "resolver rápido".** É assim que ele acumula o que não deveria.

## Alternativas

- **Balanceador com roteamento** — cobre o básico sem componente novo.
- **Biblioteca compartilhada** — autenticação e registro em cada serviço, sem
  salto extra. Exige atualizar todos a cada mudança.
- **[Malha de serviço](/08-integration-architecture/service-mesh.md)** — para o tráfego interno.
- **BFF** — em vez de um gateway genérico.

## Trade-offs

| Com gateway | Sem |
|---|---|
| Preocupações centralizadas | Duplicadas por serviço |
| Um lugar para mudar política | Muitos |
| Salto de rede adicional | Direto |
| Ponto único de falha | Falhas isoladas |
| Configuração central a governar | Autonomia por serviço |

| Gateway genérico | BFF por cliente |
|---|---|
| Um componente | Vários |
| Serve todos medianamente | Cada um bem |
| Time de plataforma é gargalo | Cada time é dono |
| Sem duplicação | Duplicação aceita |

## Modos de Falha

**Configuração errada derrubando tudo.**

**Lógica de negócio acumulada.** Ninguém sabe o que ele faz.

**Gargalo de vazão.** Subdimensionado para o pico agregado.

**Latência adicional.** Um salto a mais em toda chamada.

**Time de plataforma virando gargalo organizacional.** Toda mudança de API
depende dele.

**Tráfego interno passando por ele.** Acoplamento e carga desnecessários.

**Autorização inconsistente.** Parte no gateway, parte no serviço, e ninguém sabe
o conjunto.

## Erros Comuns

**Colocar regra de negócio.**

**Rotear tráfego interno.**

**Adotar cedo demais.**

**Configuração sem revisão nem versionamento.**

**Não dimensionar para o pico agregado.**

**Deixar o gateway ser o único lugar com autorização.** Ver
[segurança](/10-security/index.md) — defesa em profundidade exige que o serviço
também verifique.

## Exemplo Real

Uma empresa de seguros introduziu um gateway na frente de nove serviços expostos.

Os primeiros dois anos foram positivos: autenticação uniforme, limite de taxa por
corretor, métricas de borda consistentes. A duplicação que existia antes
desapareceu.

Depois, quatro problemas:

**Acúmulo de regra.** Pedidos de "resolver rápido no gateway" foram sendo
aceitos: um desconto aplicado por tipo de corretor, uma transformação que
escondia campos conforme o perfil, um roteamento que dependia do valor da apólice.
Em três anos, o gateway tinha 4.000 linhas de configuração com lógica, e ninguém
conseguia dizer o que acontecia com uma requisição sem executá-la.

**Configuração derrubando produção.** Uma regra de roteamento mal escrita —
publicada direto, sem teste — deixou **todos** os nove serviços inacessíveis por
22 minutos. Não havia ambiente de teste para a configuração nem implantação
gradual.

**Gargalo organizacional.** O gateway era mantido pelo time de plataforma. Qualquer
mudança de contrato exigia entrar na fila deles. Uma mudança de campo levava três
semanas, das quais duas eram espera.

**Autorização dividida.** Parte das regras estava no gateway, parte nos serviços.
Uma auditoria encontrou um endpoint em que a verificação existia só no gateway — e
que era alcançável internamente sem passar por ele.

As correções, ao longo de um ano:

**Regra de negócio devolvida aos serviços.** A configuração do gateway caiu de
4.000 para 600 linhas. A regra de desconto voltou para o serviço de apólices, onde
o time de negócio consegue lê-la.

**Configuração como código**, com revisão, ambiente de teste e implantação
gradual. Publicação direta deixou de ser possível.

**BFFs por cliente** — corretor, segurado e parceiro — cada um mantido pelo time
do respectivo cliente. As duas semanas de fila desapareceram; a mudança de campo passou a
levar cerca de uma semana, que é o trabalho em si.

**Autorização em profundidade, com a divisão nomeada.** O gateway verifica o que é de
borda — token válido, escopo, cota — e cada serviço verifica o que é de domínio: se *este*
corretor pode ver *esta* apólice. A redundância existe só na primeira camada, e foi aceita
conscientemente; o que acabou foi a regra de domínio morando no gateway.

O que a equipe registra: o gateway nunca foi um erro. O erro foi não ter uma regra
escrita sobre o que pode entrar nele — e, sem regra, cada exceção individual era
razoável.

## Conceitos Relacionados

- [Malha de Serviço](/08-integration-architecture/service-mesh.md) — o tráfego interno.
- [REST](/08-integration-architecture/rest.md) e [GraphQL](/08-integration-architecture/graphql.md) — o que ele expõe.
- [Contratos de Integração](/08-integration-architecture/integration-contracts.md).

## Exercício Prático

Abra a configuração do seu gateway e procure qualquer condição que dependa de um
valor de negócio — perfil, valor, tipo de cliente.

Cada uma dessas é regra de domínio morando na borda, longe de quem a entende.

## Perguntas de Entrevista

- O que pertence ao gateway e o que nunca deveria entrar nele?
- Por que rotear tráfego interno por ele é problemático?
- Que problema o BFF resolve que o gateway genérico não resolve?

## Para Aprofundar

- Richardson, Chris. *Microservices Patterns*. Manning, 2018 — capítulo 8.
- Newman, Sam. *Building Microservices*. 2ª ed. O'Reilly, 2021.
- Calçado, Phil. *The Back-end for Front-end Pattern*, 2015.
