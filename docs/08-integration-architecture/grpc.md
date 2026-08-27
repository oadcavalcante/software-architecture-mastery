---
id: grpc
title: gRPC
sidebar_position: 3
description: Contrato forte e transporte binário para comunicação interna — e por que ele raramente serve na borda.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor reconhece as cargas internas em que gRPC se paga e as
  fronteiras onde ele custa mais do que rende.
prerequisites: [rest]
related: [rest, service-mesh, schema-evolution]
canonical_for: [gRPC, chamada de procedimento remoto, fluxo bidirecional]
content_version: 1
last_reviewed: 2026-08-27
---

# gRPC

## Visão Geral

gRPC é chamada de procedimento remoto com **contrato declarado**, serialização
binária e transporte multiplexado.

O contrato é a definição do serviço: métodos, mensagens e tipos. Dela se gera
código dos dois lados, o que elimina a divergência entre o que o servidor
implementa e o que o cliente espera.

O ganho é real e é específico: comunicação **interna** de alta frequência entre
serviços. Na borda pública, o custo de ferramental costuma superar o benefício.

## Problema

Entre serviços internos, uma API HTTP com JSON paga por coisas que ali não têm
valor.

Serializar e desserializar texto custa CPU. O contrato frouxo permite divergência
entre o que uma ponta envia e a outra espera — descoberta em produção. Uma
conexão por requisição não aproveita nada.

Numa malha com dezenas de serviços e milhões de chamadas internas por minuto,
esses custos deixam de ser detalhe.

## Conceitos Centrais

### O contrato gera o código

A definição do serviço é a fonte da verdade, e os dois lados derivam dela.

```protobuf
service Pedidos {
  rpc Obter(ObterPedidoRequest) returns (Pedido);
  rpc Listar(ListarPedidosRequest) returns (stream Pedido);
}
```

Isso muda a classe de erro possível: campo com nome errado, tipo trocado ou
método inexistente viram erro de compilação, não incidente.

É a diferença mais importante em relação a [REST](rest.md), onde o contrato
tipicamente não é executável. Ver
[contratos de integração](integration-contracts.md).

### Evolução por número de campo

Cada campo tem um número, e é ele — não o nome — que identifica o dado no
formato binário.

```protobuf
message Pedido {
  string id = 1;
  int64 valor_centavos = 2;
  reserved 3;              // campo removido; o número nunca volta
}
```

Consequências práticas: renomear um campo é compatível, porque o número não muda.
Reusar um número removido é catastrófico, porque dados antigos serão
interpretados com o tipo novo.

Por isso `reserved` existe e por isso ele não é opcional. Ver
[evolução de esquema](schema-evolution.md).

### Os quatro modos de chamada

```text
unário            uma requisição, uma resposta
fluxo do servidor uma requisição, muitas respostas
fluxo do cliente  muitas requisições, uma resposta
bidirecional      ambos os lados enviam continuamente
```

Os três modos de fluxo são a capacidade que REST não tem sem recorrer a outro
protocolo. Sincronização contínua, telemetria e feeds ao vivo cabem
naturalmente.

### O custo é ferramental, e ele é sério

Sendo específico, porque é o que decide a adoção:

**Navegador.** Não fala gRPC diretamente. É preciso uma camada de tradução, com
limitações reais em modos de fluxo.

**Depuração.** Não dá para inspecionar uma chamada com as ferramentas de rede do
navegador nem com um cliente HTTP comum. Existem ferramentas próprias, e a curva
é outra.

**Intermediários.** Balanceadores e gateways precisam entender o protocolo. Um
balanceador de camada 4 vai distribuir *conexões*, não *chamadas* — e como as
conexões são longas e multiplexadas, a carga fica desbalanceada de forma
persistente.

Esse último ponto surpreende times que adotam gRPC sem malha de serviço: o
balanceamento simplesmente não funciona como esperado.

**Parceiros externos.** Uma API pública em gRPC exclui consumidores que não têm
suporte.

### Prazo propagado

O cliente declara quanto tempo tem, e o prazo viaja com a chamada. Um serviço
intermediário sabe quanto do orçamento sobrou e pode desistir cedo em vez de
trabalhar por um resultado que ninguém vai receber.

É uma propriedade de disciplina que APIs HTTP raramente implementam, e que reduz
trabalho desperdiçado em cascatas de chamadas. Ver
[timeouts](../06-distributed-systems/timeouts.md).

### Códigos de status próprios

gRPC tem seu conjunto de códigos, com semântica clara sobre o que é retentável.
A separação entre erro do cliente e do servidor está lá, como em
[REST](rest.md) — e as bibliotecas costumam expô-la de forma mais direta.

## Modelo Mental

**gRPC troca alcance por eficiência e rigor.** Onde as duas pontas são suas, o
rigor é lucro; onde não são, o alcance é o que importa.

## Quando Usar

- Comunicação interna entre serviços.
- Alta frequência de chamadas, onde serialização e conexão pesam.
- Contrato forte com geração de código tem valor.
- Fluxo contínuo em uma ou nas duas direções.
- Poliglota — vários times, várias linguagens, um contrato.
- Já existe [malha de serviço](service-mesh.md) que entende o protocolo.

## Quando Não Usar

**Na borda pública.** O custo de ferramental recai sobre quem consome.

**Para navegadores, sem camada de tradução.**

**Quando cache de HTTP importa.** Ver [REST](rest.md).

**Quando a consequência é assíncrona.** Ver
[mensageria](messaging-integration.md).

**Com balanceador de camada 4 e sem malha.** As conexões longas concentram carga.

**Quando o volume não justifica.** Dezenas de chamadas por segundo entre dois
serviços não pagam a mudança de ferramental.

## Alternativas

- **[REST](rest.md)** — alcance e simplicidade operacional.
- **[GraphQL](graphql.md)** — consumo variável.
- **[Mensageria](messaging-integration.md)** — assíncrono e desacoplado.
- **gRPC internamente, REST na borda** — o desenho mais comum entre adoções
  bem-sucedidas, com o gateway traduzindo.

A última merece destaque: as duas escolhas não competem quando ocupam camadas
diferentes.

## Trade-offs

| gRPC | REST |
|---|---|
| Binário e compacto | Texto, legível |
| Contrato forte gerado | Frequentemente frouxo |
| Fluxo nativo | Precisa de outro protocolo |
| Ferramental especializado | Universal |
| Sem cache de HTTP | Com cache |
| Prazo propagado | Manual |
| Difícil de inspecionar | Trivial |

## Modos de Falha

**Número de campo reusado.** Dados antigos lidos com tipo errado.

**Balanceamento desigual.** Conexões longas fixam clientes a instâncias.

**Mensagem acima do limite.** O tamanho máximo padrão é modesto e a falha é
abrupta.

**Prazo não propagado.** Um serviço continua processando o que ninguém espera.

**Camada de tradução limitando fluxos.** O que funciona entre serviços não
funciona no navegador.

**Versão de contrato divergente.** Um lado regenerou o código, o outro não.

## Erros Comuns

**Adotar na borda pública.**

**Não declarar `reserved` ao remover campo.**

**Não configurar balanceamento por chamada.**

**Assumir que o limite de tamanho padrão basta.**

**Não propagar prazo.**

**Tratar como substituto universal de REST.**

## Exemplo Real

Uma plataforma de mobilidade migrou a comunicação entre catorze serviços internos
de HTTP com JSON para gRPC.

Os números medidos após a migração:

**Latência entre serviços** caiu de 12 ms para 4 ms na mediana — a maior parte do
ganho veio de conexão persistente multiplexada, não de serialização.

**Uso de CPU** dos serviços caiu cerca de 18%, majoritariamente em serialização.

**Incidentes de contrato** foram a zero. Antes havia alguns por trimestre, do tipo
"o campo mudou de nome e o consumidor não soube".

Dois problemas sérios:

**Balanceamento.** O balanceador era de camada 4. Como gRPC mantém conexões
longas, cada cliente ficava preso a uma instância. Após uma expansão, as
instâncias novas ficaram praticamente ociosas enquanto as antigas saturavam. O
diagnóstico levou duas semanas, porque as métricas agregadas pareciam normais.
Resolvido com balanceamento no cliente e, depois, com malha de serviço.

**Número de campo reusado.** Um desenvolvedor removeu um campo `int32 status = 4`
e, meses depois, outro adicionou `string categoria = 4`. Serviços com a versão
antiga do contrato leram a categoria como inteiro. Os dados corrompidos entraram
no banco. A revisão passou porque o contrato antigo já não estava no repositório
para comparação. `reserved` passou a ser exigido por verificação automatizada.

E uma decisão deliberada: **a API pública permaneceu em REST**, com o gateway
traduzindo. A proposta de expor gRPC a parceiros foi recusada depois de dois
deles informarem que não tinham suporte.

O que a equipe registra: o balanceamento é o risco que ninguém antecipa. gRPC é
apresentado como substituto direto de HTTP, e a diferença no comportamento de
conexão muda a operação de forma que não aparece em nenhuma comparação de
desempenho.

## Conceitos Relacionados

- [REST](rest.md) — a comparação principal.
- [Malha de Serviço](service-mesh.md) — onde o balanceamento se resolve.
- [Evolução de Esquema](schema-evolution.md) — números de campo.
- [Timeouts](../06-distributed-systems/timeouts.md) — prazo propagado.

## Exercício Prático

Se você usa gRPC, verifique como o balanceamento acontece: por conexão ou por
chamada?

Depois olhe a distribuição de requisições entre instâncias. Se ela for desigual e
estável ao longo do tempo, você encontrou o problema antes que uma expansão o
revele.

## Perguntas de Entrevista

- Por que renomear um campo é compatível e reusar um número não é?
- Por que balanceamento de camada 4 falha com gRPC?
- Em que fronteira gRPC costuma custar mais do que rende?

## Para Aprofundar

- Documentação do gRPC — [grpc.io/docs](https://grpc.io/docs).
- Google. *Protocol Buffers Language Guide*.
- Indrasiri, Kasun; Kuruppu, Danesh. *gRPC: Up and Running*. O'Reilly, 2020.
