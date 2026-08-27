---
id: apis
title: APIs
sidebar_position: 4
description: O contrato entre partes — a decisão mais cara de reverter num sistema.
doc_type: concept
level: 3
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor projeta APIs pensando em evolução e reconhece o que torna
  um contrato caro de mudar.
prerequisites: [services]
related: [request-response, pagination, integration-architecture]
canonical_for: [API, contrato de API]
content_version: 1
last_reviewed: 2026-08-26
---

# APIs

## Visão Geral

Uma API é o contrato entre quem oferece uma capacidade e quem a consome.

É a parte do sistema mais cara de mudar, porque existe código do outro lado que
você não controla — e frequentemente nem conhece.

## Problema

APIs são projetadas olhando para dentro: a estrutura reflete o modelo de dados de
quem a expõe, os nomes vêm das tabelas, os campos são os que existem.

Isso funciona no primeiro dia e cobra depois.

Quando o modelo interno muda — e ele muda — a API muda junto, porque nunca foi
separada dele. Cada refatoração interna vira mudança de contrato.

E quando um requisito novo chega, a API não comporta: ela expressa a estrutura de
armazenamento, não as operações que o consumidor precisa.

**Uma API é uma decisão de produto, não uma projeção do banco.**

## Conceitos Centrais

### A API não é o modelo interno

A regra que evita a maior parte dos problemas: o tipo que atravessa a fronteira
é próprio da API, não a entidade do domínio.

Isso custa mapeamento e compra independência: o modelo interno pode ser
reestruturado sem tocar consumidores.

Ver [anti-corruption
layer](../04-domain-driven-design/anti-corruption-layer.md) — o mesmo princípio,
do lado de quem consome.

### Evolução é a decisão central

Toda API muda. O que se projeta é **como** ela muda.

| Mudança | Compatível? |
|---|---|
| Adicionar campo opcional na resposta | Sim, se consumidores toleram desconhecidos |
| Adicionar campo obrigatório na requisição | Não |
| Remover campo | Não |
| Renomear campo | Não |
| Alargar um enum | Não, se consumidores validam estritamente |
| Estreitar validação | Não |
| Tornar um campo opcional | Sim |

A primeira e a quinta linhas dependem do comportamento do consumidor — o que
significa que **compatibilidade é uma propriedade da dupla**, não da API sozinha.

Por isso a documentação precisa dizer explicitamente: *consumidores devem ignorar
campos desconhecidos e tolerar valores de enum não previstos.* Sem isso, adicionar
qualquer coisa vira mudança quebrada.

### Versionamento é a última linha, não a primeira

Versionar uma API é caro: duas implementações a manter, migração de consumidores a
coordenar, prazo de descontinuação a negociar.

A sequência que funciona: projetar para extensão, adicionar de forma compatível
enquanto der, e versionar só quando a mudança for genuinamente incompatível.

Times que versionam a cada mudança acabam com seis versões vivas e ninguém
migrando.

### Granularidade do recurso

Uma API muito fina obriga o consumidor a fazer várias chamadas para uma operação —
o que multiplica latência, especialmente em rede móvel.

Uma API muito grossa devolve mais do que qualquer consumidor precisa, e cada
mudança afeta todos.

O critério: **modele operações do consumidor, não entidades do produtor.** Se
todos os consumidores fazem as mesmas três chamadas em sequência, isso é uma
operação.

### Erros fazem parte do contrato

O que a API devolve em caso de falha é tão contrato quanto o caminho feliz: quais
códigos, com que corpo, quais são retentáveis, quais são permanentes.

Uma API que devolve o mesmo erro genérico para tudo obriga cada consumidor a
adivinhar se deve repetir — e a resposta errada produz tempestade de retentativa
ou perda silenciosa.

## Modelo Mental

**Projete a API como se você não pudesse mudá-la — e depois projete como ela vai
mudar.**

## Quando Usar

- Sempre que uma capacidade atravessa uma fronteira de time, processo ou
  organização.
- Quando o consumidor não deve conhecer o modelo interno.
- Quando há mais de um consumidor com necessidades diferentes.

## Quando Não Usar

**Dentro de um módulo.** Uma chamada de função é mais simples, mais rápida e
refatorável.

**Como espelho do banco.** Uma API gerada a partir do esquema não é contrato; é
acoplamento com HTTP no meio.

**Antes de conhecer o consumidor.** Uma API projetada sem consumidor real
adivinha as operações e erra.

**Versionando preventivamente.** `v1` numa API com um consumidor interno adiciona
cerimônia sem benefício.

## Alternativas

- **Chamada de função** — dentro do processo.
- **Evento** — quando o consumidor reage a um fato e não precisa de resposta. Ver
  [arquitetura orientada a eventos](../03-design-patterns/event-driven.md).
- **Arquivo ou lote** — quando o volume é grande e a latência tolerada é alta.
- **Consulta direta a uma projeção** — para leitura de alto volume dentro da mesma
  organização.

## Trade-offs

| Contrato próprio | Espelho do modelo interno |
|---|---|
| Modelo interno refatorável | Refatoração quebra consumidores |
| Vocabulário do consumidor | Do produtor |
| Mapeamento a manter | Nenhum |
| Mais trabalho inicial | Mais rápido de começar |

| API grossa | API fina |
|---|---|
| Menos chamadas por operação | Mais idas à rede |
| Devolve mais que o necessário | Consumidor pede o que precisa |
| Mudança afeta todos | Afeta quem usa aquele recurso |

## Modos de Falha

**Contrato quebrado sem aviso.** Consumidor desconhecido para de funcionar.

**Modelo interno vazando.** Refatoração vira mudança de contrato.

**Erro genérico.** Consumidor não sabe se deve repetir.

**N+1 do lado do consumidor.** API fina demais para o caso de uso real.

**Versões acumuladas.** Seis vivas, nenhuma descontinuada.

## Erros Comuns

**Gerar a API a partir do modelo de dados.**

**Não documentar a política de compatibilidade.** Ela é parte do contrato.

**Tratar erro como detalhe.**

**Versionar por reflexo.**

**Não saber quem consome.** Sem isso, nenhuma mudança pode ser avaliada.

## Exemplo Real

Uma API interna de catálogo devolvia a entidade `Produto` serializada — 42 campos,
incluindo identificadores internos, campos de controle e o histórico de preços.

Três consequências ao longo de dois anos.

Uma refatoração que renomeou dois campos internos quebrou quatro consumidores
simultaneamente. Ninguém sabia que eles existiam.

O aplicativo móvel baixava 42 campos para exibir três, em conexões ruins.

E um consumidor passou a depender de um campo de controle interno — `versaoRegistro` —
para implementar cache. Esse campo deixou de existir numa migração, e o cache do
consumidor parou de invalidar.

A reformulação criou um tipo próprio da API, com os campos que os consumidores de
fato usavam — identificados por análise de tráfego, não por suposição.

Foram 11 campos. Os outros 31 nunca haviam sido lidos por ninguém.

A documentação passou a declarar a política: campos desconhecidos devem ser
ignorados, valores de enum não previstos devem ser tolerados, e a descontinuação de
qualquer campo tem aviso de 90 dias.

Nos dois anos seguintes, sete campos foram adicionados sem quebrar nada, e o
modelo interno foi reestruturado duas vezes sem que nenhum consumidor soubesse.

## Como saber quem consome

Nenhuma mudança de API pode ser avaliada sem saber quem depende dela. Em sistemas
com consumidores internos, essa informação frequentemente não existe.

Quatro formas de obtê-la, em ordem de confiabilidade:

**Registro obrigatório.** Consumidores se cadastram para obter credencial. Dá a
lista exata e exige processo.

**Identificação na requisição.** Um cabeçalho com o nome do cliente, registrado em
log. Dá a lista real de quem de fato chama, incluindo quem nunca se cadastrou.

**Análise de tráfego.** Origem por rede. Funciona sem cooperação do consumidor e
identifica mal quando há proxy no caminho.

**Perguntar.** Funciona em organizações pequenas e falha em silêncio nas demais —
quem não sabe que consome não responde.

A segunda equilibra melhor custo e confiabilidade, e habilita uma prática
específica: **medir o uso por campo**. Instrumentar quais campos da resposta são
efetivamente lidos revela que a maior parte de uma API grande costuma ser
ignorada — e cada campo não lido é acoplamento que pode ser removido.

Sem essa informação, toda mudança de contrato é aposta, e a única política segura
vira nunca mudar nada.

## Conceitos Relacionados

- [Serviços](services.md) — quem expõe.
- [Request/Response](request-response.md) — a mecânica.
- [Paginação](pagination.md) — o caso que toda API de listagem enfrenta.
- [Integração](../08-integration-architecture/index.md) — estilos e evolução de
  schema.

## Exercício Prático

Escolha uma API do seu sistema e responda: quem são os consumidores? Como você
saberia se algum quebrasse?

Depois verifique quais campos da resposta são de fato lidos — por análise de
tráfego, se possível. A diferença entre o que a API devolve e o que alguém usa é o
acoplamento desnecessário.

## Perguntas de Entrevista

- Por que a API não deve espelhar o modelo interno?
- Que mudanças são compatíveis, e do que isso depende?
- Por que o comportamento de erro é parte do contrato?

## Para Aprofundar

- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*, 2003.
- Newman, Sam. *Building Microservices*. 2ª ed., 2021 — evolução de contrato.
- Documentação de *Semantic Versioning* e de práticas de compatibilidade de API.
