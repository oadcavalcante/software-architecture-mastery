---
id: graceful-degradation
title: Degradação Graciosa
sidebar_position: 13
description: Funcionar pior em vez de parar — a técnica de maior retorno em confiabilidade, e a menos aplicada.
doc_type: pattern
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor classifica funcionalidades por criticidade e projeta o
  comportamento degradado de cada dependência.
prerequisites: [reliability]
related: [circuit-breakers, bulkheads, slo]
canonical_for: [degradação graciosa, funcionalidade essencial, resposta de reserva]
content_version: 1
last_reviewed: 2026-08-28
---

# Degradação Graciosa

## Visão Geral

Degradação graciosa é continuar funcionando com capacidade reduzida quando parte do
sistema falha, em vez de parar por completo.

É a técnica de **maior retorno em confiabilidade**, porque não exige redundância,
infraestrutura adicional nem coordenação. Exige uma decisão: **o que é essencial?**

E é a menos aplicada, porque essa decisão é de produto, e raramente alguém a pede.

## Problema

O comportamento padrão de uma aplicação é binário: a dependência falha, a requisição
falha, o usuário vê erro.

Isso significa que uma falha no serviço de recomendações — que enfeita a página —
impede a compra. Uma falha no serviço de avaliações impede ver o produto. Uma falha na
foto de perfil impede o login.

Nenhuma dessas dependências é essencial para a ação que o usuário quer executar. E
todas derrubam a ação inteira, porque ninguém escreveu o que fazer quando elas falham.

## Conceitos Centrais

### Classificar por criticidade é o trabalho

A classificação precisa vir do produto, e ela é simples:

```text
essencial       sem isso a ação não faz sentido — não degrada
importante      degrada com aviso ao usuário
opcional        omite silenciosamente
```

Numa página de produto de comércio eletrônico:

```text
preço e disponibilidade   essencial
descrição e fotos          essencial
avaliações                 importante — "avaliações indisponíveis"
recomendações              opcional — some
histórico de preço         opcional
```

Feita essa classificação, a implementação é direta. Sem ela, cada desenvolvedor decide
sozinho, e a decisão padrão é propagar o erro.

### As formas de degradar

**Omitir.** O bloco não aparece. Adequado para o opcional.

**Servir dado velho.** Cache expirado é melhor que nada, e frequentemente
imperceptível. Ver [cache para escala](/11-scalability/scaling-cache.md).

**Valor padrão.** Frete calculado por tabela fixa quando a transportadora não responde.

**Versão simplificada.** Busca sem ordenação por relevância, listagem sem filtros
avançados.

**Aceitar e processar depois.** A operação entra em fila. Ver
[processamento assíncrono](/11-scalability/async-processing.md).

**Somente leitura.** O sistema para de aceitar escrita e continua servindo consultas.
Frequentemente a degradação mais valiosa e a menos implementada.

### O usuário precisa saber

Degradar em silêncio quando o efeito é visível gera desconfiança: o usuário vê um
número errado e conclui que o sistema mente.

A regra:

```text
opcional     omitir sem avisar — o usuário não sente falta
importante   avisar — "avaliações temporariamente indisponíveis"
dado velho   informar a idade — "preços atualizados há 15 minutos"
```

O terceiro caso é o que mais evita chamado de suporte: um usuário que sabe que o dado
tem atraso não reporta defeito.

### Precisa ser exercitado

Um caminho degradado que nunca executa está quebrado. Ele é escrito uma vez, nunca
testado, e falha no momento em que é acionado — tipicamente porque a resposta padrão
tem formato que a interface não espera.

Duas práticas que resolvem:

**Testar o caminho degradado** como parte da suíte, não só o caminho feliz.

**Exercitar em produção**, desligando dependências não essenciais em janela controlada.
Ver [engenharia do caos](/12-reliability/chaos-engineering.md).

### Degradação também é proteção

Além de melhorar a experiência sob falha, degradar **preserva capacidade**.

Sob sobrecarga, desligar funcionalidades opcionais libera recursos para as essenciais.
Isso é descarte de carga seletivo, e é mais inteligente que rejeitar requisições
uniformemente. Ver
[backpressure](/06-distributed-systems/backpressure.md).

Ter um interruptor por funcionalidade — acionável sem implantação — é o que torna isso
operacional durante um incidente.

### Os limites da degradação

Nem tudo degrada. Vale ser explícito:

**Operações financeiras.** Não se cobra com valor aproximado.

**Verificações de segurança.** Uma autorização que falha não pode virar permissão. Ver
[modos de falha de segurança](/10-security/security-failure-modes.md).

**Dados que controlam recurso finito.** Estoque, assento, cota.

Para esses, a resposta correta é falhar — de forma clara, com mensagem útil.

## Modelo Mental

**Degradação é decidir o que sacrificar antes de precisar.** Sem essa decisão, o
sistema sacrifica tudo.

## Quando Usar

- Há dependências não essenciais no caminho de uma ação.
- A ação principal faz sentido sem parte dos dados.
- A indisponibilidade total tem custo alto.
- Existe cache ou valor padrão razoável.
- É preciso preservar capacidade sob sobrecarga.

## Quando Não Usar

**Para operações financeiras e verificações de segurança.**

**Sem classificar por criticidade.** A decisão cai no desenvolvedor.

**Degradando em silêncio** quando o usuário percebe a diferença.

**Sem exercitar o caminho degradado.**

**Quando o dado degradado leva a decisão errada.** Estoque aproximado que permite
vender o que não existe.

**Como substituto de corrigir a dependência instável.**

## Alternativas

- **Redundância** — evita a falha em vez de degradar. Mais caro.
- **[Circuit breaker](/12-reliability/circuit-breakers.md)** — para de tentar e degrada rápido.
- **[Bulkhead](/12-reliability/bulkheads.md)** — isola para que a falha não alcance.
- **Falhar rápido com mensagem clara** — quando degradar não é possível.

Circuit breaker e degradação são complementares: o primeiro detecta que a dependência
está fora; o segundo define o que fazer então.

## Trade-offs

| Com degradação | Sem |
|---|---|
| Ação continua possível | Falha completa |
| Experiência reduzida | Nenhuma |
| Caminhos alternativos a manter | Um caminho |
| Risco de dado errado | Sem risco |
| Precisa ser testado | Menos superfície |

| Omitir silenciosamente | Avisar |
|---|---|
| Interface limpa | Usuário informado |
| Risco de desconfiança | Transparência |

## Modos de Falha

**Caminho degradado quebrado.** Nunca exercitado.

**Degradação silenciosa com efeito visível.**

**Dado velho levando a decisão errada.**

**Degradação em cascata.** Cada camada degrada, e o resultado final é inútil.

**Interruptor inexistente.** Não há como desligar a funcionalidade durante o incidente.

**Degradação permanente.** A dependência voltou e ninguém religou.

## Erros Comuns

**Não classificar funcionalidades.** Sem decidir antes o que é essencial e o que é acessório, a degradação é improvisada durante o incidente — quando ninguém tem tempo de decidir bem.

**Deixar a decisão para o desenvolvedor.** O que pode ser desligado é decisão de produto, com consequência de negócio. Tomada no código, ela vira inconsistente entre partes do sistema.

**Não testar o caminho degradado.** Ele só executa em incidente, então costuma estar quebrado — e a descoberta acontece quando ele era a última defesa.

**Não avisar quando o usuário percebe.** Recomendação vazia sem explicação parece defeito. Uma linha dizendo que o recurso está temporariamente indisponível preserva a confiança.

**Não ter interruptor por funcionalidade.** Sem poder desligar uma parte sem implantar, a única resposta durante o incidente é reverter tudo ou aguentar.

**Degradar operações que não deveriam degradar.** Em fluxo financeiro e de segurança, responder com valor aproximado é pior que recusar. Ali a resposta correta é falhar de forma explícita.

## Exemplo Real

Uma plataforma de comércio eletrônico tinha a página de produto dependendo de sete
serviços. Qualquer um fora derrubava a página inteira — e com ela, a possibilidade de
comprar.

O incidente que motivou a mudança: o serviço de recomendações ficou fora por 40
minutos. A página de produto ficou indisponível o tempo todo, e as vendas pararam.

Recomendações contribuíam com cerca de 3% da receita.

A reformulação começou pela classificação, feita com o time de produto em duas horas:

```text
preço e estoque      essencial
descrição e imagens  essencial
avaliações           importante
recomendações        opcional
produtos vistos      opcional
frete estimado       importante
perguntas e respostas opcional
```

A implementação:

**Opcionais omitidos** quando indisponíveis, com timeout de 300 ms — se não respondeu,
não aparece.

**Avaliações** com aviso e cache de 24 horas como reserva.

**Frete estimado** com tabela fixa por região quando a transportadora não responde,
marcado como estimativa.

**Interruptor por funcionalidade**, acionável sem implantação, para desligar opcionais
sob sobrecarga.

**Modo somente leitura** para o catálogo inteiro, acionável quando o banco de escrita
está indisponível — o que permite continuar vendendo com o estoque em cache, aceitando
pedidos em fila.

Esse último foi o mais discutido, porque aceitar pedido sem confirmar estoque contraria
a regra de não degradar recurso finito. A decisão foi de negócio: aceitar pedidos com
aviso de "confirmação em até 2 horas", com cancelamento e reembolso automático se o
estoque não confirmar.

Nos dezoito meses seguintes:

**Cinco incidentes** que teriam derrubado a página de produto foram absorvidos com
degradação parcial.

**O modo somente leitura** foi acionado duas vezes, mantendo 70% da receita durante
indisponibilidades do banco primário.

**Um problema:** numa das ocasiões, o caminho degradado de frete estava quebrado — a
tabela fixa tinha sido escrita 8 meses antes e nunca executada, com um erro de formato.
A partir daí, os caminhos degradados entraram na suíte de testes e no exercício mensal.

O aprendizado que ficou: a classificação levou duas horas e nunca tinha sido feita em
seis anos de produto. A pergunta "o que é essencial nesta página?" não tinha dono — nem
produto nem engenharia a consideravam sua.

## Conceitos Relacionados

- [Circuit Breakers](/12-reliability/circuit-breakers.md) — detecta e aciona a degradação.
- [Bulkheads](/12-reliability/bulkheads.md) — impede a propagação.
- [SLO](/12-reliability/slo.md) — o alvo que a degradação ajuda a sustentar.
- [Backpressure](/06-distributed-systems/backpressure.md) — descarte seletivo.

## Exercício Prático

Pegue a tela mais importante do seu produto e liste as dependências dela. Classifique
cada uma como essencial, importante ou opcional — com alguém de produto na sala.

Depois verifique o que acontece hoje quando cada uma falha. A diferença entre a
classificação e o comportamento atual é o trabalho.

## Perguntas de Entrevista

- Por que degradação é a técnica de maior retorno em confiabilidade?
- Quando degradar silenciosamente e quando avisar?
- O que não deve degradar, e por quê?

## Para Aprofundar

- Nygard, Michael. *Release It!*. 2ª ed. Pragmatic Bookshelf, 2018.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 — capítulo 22.
- Fowler, Susan. *Production-Ready Microservices*. O'Reilly, 2016.
