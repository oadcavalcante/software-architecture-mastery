---
id: graphql
title: GraphQL
sidebar_position: 2
description: O cliente escolhe o que recebe — e o custo que essa liberdade transfere para o servidor.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor avalia GraphQL pelo problema de consumo variável que ele
  resolve, e pelos problemas operacionais que ele cria.
prerequisites: [rest]
related: [rest, api-gateways, integration-contracts]
canonical_for: [GraphQL, resolver, sobrebusca, subbusca]
content_version: 1
last_reviewed: 2026-08-27
---

# GraphQL

## Visão Geral

Em GraphQL, o cliente descreve **exatamente** os campos que quer, e o servidor
devolve isso — nada a mais, nada a menos.

Isso resolve dois problemas reais de APIs de recurso fixo: trazer mais do que se
usa, e precisar de várias chamadas para montar uma tela.

E transfere um custo que a comparação usual omite: o servidor deixa de saber, de
antemão, o formato e o peso das consultas que vai receber.

## Problema

Uma API REST devolve o recurso inteiro. Um cliente móvel que precisa de nome e
foto recebe o perfil completo — **sobrebusca**.

E uma tela que mostra um pedido com itens, cliente e endereço faz quatro
chamadas — **subbusca**, resolvida com múltiplas idas à rede.

A saída comum em REST é criar endpoints sob medida para cada tela. Funciona, e
cada tela nova é trabalho no backend — o que torna o time de backend gargalo do
time de frontend.

GraphQL desloca essa decisão para o cliente.

## Conceitos Centrais

### Um esquema tipado, e uma única entrada

O servidor publica um grafo de tipos e como navegá-los. O cliente compõe:

```graphql
query {
  pedido(id: "123") {
    total
    itens { nome quantidade }
    cliente { nome }
  }
}
```

Uma requisição, exatamente os campos pedidos, sem endpoint específico para essa
tela.

O esquema é o contrato, e ele é executável — a validação acontece contra ele,
não contra um documento. Ver
[contratos de integração](integration-contracts.md).

### O problema de consulta em cascata

O mecanismo que resolve cada campo é um resolvedor. Ao resolver uma lista de N
itens e, para cada um, um campo que consulta o banco, saem N+1 consultas.

Em REST, o endpoint sabe o que vai buscar e otimiza. Em GraphQL, o resolvedor não
sabe em que contexto foi chamado.

A solução padrão é agrupar as buscas de um mesmo ciclo em lote, com carregadores
que acumulam ids e fazem uma consulta só. Isso funciona e **não é opcional**: um
GraphQL sem carregadores em lote degrada de forma não linear com o tamanho das
listas.

Esse é o custo operacional principal do estilo, e o mais subestimado na adoção.

### O custo da consulta é do cliente, a conta é do servidor

Uma consulta profunda ou muito ramificada pode ser arbitrariamente cara. Em
esquemas com relações cíclicas, ela pode ser exponencial.

As defesas — nenhuma opcional em API exposta:

**Limite de profundidade.** Recusar consultas acima de N níveis.

**Custo estimado.** Atribuir peso a cada campo e recusar acima de um teto.

**Consultas persistidas.** Só consultas previamente registradas são aceitas. É a
defesa mais forte, e ela remove a liberdade que motivou a adoção — o que é a
troca certa em API pública.

**Prazo de execução.**

### Cache é o que se perde

Em [REST](rest.md), cache de HTTP funciona: uma URL, um `GET`, um resultado
cacheável por qualquer intermediário.

Em GraphQL, tudo é `POST` numa única URL, com o conteúdo variando. Nenhum
intermediário consegue cachear.

O cache migra para dentro: cache por campo no servidor, cache normalizado no
cliente. Ambos funcionam e ambos são complexidade que o HTTP dava de graça.

Isso costuma ser o argumento decisivo quando a API é majoritariamente de leitura
pública.

### Erros parciais

Uma consulta pode ter sucesso em parte dos campos e falhar em outros. A resposta
traz dados e erros juntos, sempre com `200`.

Isso é coerente com o modelo e significa que a classificação de erro volta para a
aplicação — a mesma perda descrita em [REST](rest.md) quando tudo devolve `200`,
só que aqui é inerente ao estilo.

### Onde ele mais rende

O caso claro: **muitos clientes diferentes consumindo o mesmo domínio**, com
necessidades que mudam mais rápido que o backend consegue acompanhar.

Aplicativo móvel, web, parceiro, tela interna — cada um pedindo um recorte
diferente das mesmas entidades.

Onde há um único cliente, controlado pelo mesmo time, a liberdade não paga o
custo operacional. Um endpoint sob medida é mais simples em tudo.

## Modelo Mental

**GraphQL troca previsibilidade do servidor por flexibilidade do cliente.** Vale
quando há muitos clientes com necessidades divergentes; não vale quando há um.

## Quando Usar

- Muitos clientes com necessidades diferentes sobre o mesmo domínio.
- O time de frontend é bloqueado por mudanças de endpoint.
- Telas compõem dados de várias entidades relacionadas.
- Banda importa — clientes móveis em rede ruim.
- O domínio é naturalmente um grafo.

## Quando Não Usar

**Com um único cliente controlado pelo mesmo time.** O custo não se paga.

**Quando cache de HTTP é decisivo.** Conteúdo público de leitura intensa.

**Para operações que não são consulta de dados.** Comandos e fluxos de trabalho
cabem melhor em [REST](rest.md).

**Sem limite de custo de consulta.** Em API exposta, é uma negação de serviço à
espera.

**Sem carregadores em lote.** O problema N+1 é certo.

**Como camada sobre um banco.** Expor o esquema do banco como grafo transforma o
modelo interno em contrato público.

**Para transferência em massa.** Ver
[integração em lote](batch-integration.md).

## Alternativas

- **[REST](rest.md) com campos esparsos** — um parâmetro que seleciona campos
  cobre boa parte da sobrebusca, sem mudar de estilo.
- **Endpoint por tela** — o padrão "backend para frontend". Simples e explícito,
  ao custo de acoplar backend a telas.
- **[gRPC](grpc.md)** — quando o consumo é conhecido e a eficiência importa.
- **Consultas persistidas** — GraphQL sem a superfície de consulta aberta.

## Trade-offs

| GraphQL | REST |
|---|---|
| Cliente escolhe os campos | Recurso fixo |
| Uma chamada compõe a tela | Várias |
| Cache de HTTP não funciona | Funciona |
| Custo de consulta imprevisível | Previsível |
| Esquema tipado por definição | Contrato varia |
| N+1 exige carregadores | Endpoint otimiza |
| Erros parciais | Código de status |

## Modos de Falha

**N+1 sem carregador.** Degradação não linear.

**Consulta cara derrubando o servidor.**

**Consulta profunda em esquema cíclico.** Explosão combinatória.

**Modelo interno virando contrato.** Expor o banco como grafo.

**Campos sem uso permanecendo.** Ninguém sabe quem consome o quê.

**Autorização por campo esquecida.** Um campo sensível acessível por um caminho
do grafo que ninguém revisou.

O último merece atenção: em REST, a autorização fica no endpoint. Num grafo, o
mesmo tipo pode ser alcançado por vários caminhos, e a verificação precisa estar
no campo, não na rota.

## Erros Comuns

**Adotar por tendência, com um cliente só.**

**Não implementar carregadores em lote.**

**Não limitar profundidade e custo.**

**Gerar o esquema a partir do banco.**

**Não instrumentar por campo.** Sem isso, não há como saber o que é usado nem o
que está caro.

**Autorização na consulta em vez de no campo.**

## Exemplo Real

Uma plataforma de educação adotou GraphQL para servir aplicativo móvel, web e
uma área de parceiros. O motivo era legítimo: três clientes, necessidades
divergentes, e o backend virara gargalo — cada tela nova era uma semana de
espera.

O ganho apareceu: o time de frontend passou a construir telas sem pedir nada ao
backend. O tempo de entrega de uma tela caiu de semanas para dias.

Quatro problemas em produção:

**N+1 em lista de turmas.** A tela do professor listava 40 turmas e, para cada
uma, o total de alunos. Sem carregador em lote, eram 41 consultas por
carregamento. Sob pico, o banco saturava. Corrigido com carregadores, que a
equipe considerava "otimização para depois".

**Consulta cara de parceiro.** Um parceiro escreveu uma consulta que percorria
alunos → matrículas → turmas → professores → turmas, e retornava dezenas de
milhares de nós. Uma única requisição ocupava o servidor por 90 segundos.
Corrigido com limite de profundidade e custo estimado.

**Campo sensível exposto.** O tipo `Usuario` tinha `documento`, protegido no
caminho principal. Descobriu-se que ele era alcançável via
`turma → alunos → usuario`, onde a verificação não existia. A autorização foi
movida para o nível do campo.

**Cache perdido.** O catálogo público de cursos, antes servido de CDN com cache
de horas, passou a bater no servidor a cada requisição. A solução foi manter esse
recorte específico em REST — o catálogo voltou para `GET` cacheável, e o resto
permaneceu em GraphQL.

O ponto que a equipe sublinha: a decisão de adotar continua correta para os três
clientes autenticados. O erro foi tratá-la como escolha global e migrar também o
conteúdo público de leitura intensa, onde REST era estritamente melhor.

## Conceitos Relacionados

- [REST](rest.md) — a comparação principal.
- [gRPC](grpc.md) — a terceira opção síncrona.
- [API Gateways](api-gateways.md) — onde limites costumam ser aplicados.
- [Contratos de Integração](integration-contracts.md).

## Exercício Prático

Se você usa GraphQL, escreva a consulta mais profunda que seu esquema permite e
execute-a contra um ambiente de teste com volume realista.

O tempo que ela levar é o que um cliente mal-intencionado — ou distraído — pode
provocar hoje.

## Perguntas de Entrevista

- Que custo GraphQL transfere do cliente para o servidor?
- Por que o problema N+1 é estrutural neste estilo?
- Por que a autorização precisa ficar no campo, e não na operação?

## Para Aprofundar

- Byron, Lee. *GraphQL: A data query language*. Facebook Engineering, 2015.
- Especificação GraphQL — [spec.graphql.org](https://spec.graphql.org).
- Stemmler, Khalil. *Advanced GraphQL Patterns*, 2022.
