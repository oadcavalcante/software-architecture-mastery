---
id: services
title: Serviços
sidebar_position: 3
description: Componentes com processo próprio — o que muda quando a chamada atravessa a rede.
doc_type: concept
level: 3
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor reconhece o que um serviço adiciona em relação a um módulo
  e decide a granularidade a partir de razões, não de tamanho.
prerequisites: [components]
related: [apis, service-boundaries, microservices]
canonical_for: [serviço, granularidade de serviço]
content_version: 1
last_reviewed: 2026-08-26
---

# Serviços

## Visão Geral

Um serviço é um componente com processo próprio, acessado pela rede, com ciclo de
implantação independente.

A diferença entre um serviço e um módulo não é conceitual — é **física**, e é o
que determina todo o custo adicional.

## Problema

A palavra "serviço" é usada para coisas muito diferentes: uma classe chamada
`PedidoService`, um processo separado, um sistema inteiro de outra área.

A confusão importa porque o custo de cada um difere por ordens de grandeza.

Chamar um método de `PedidoService` no mesmo processo custa nanossegundos e não
pode falhar por rede. Chamar um serviço remoto custa milissegundos, pode expirar,
pode falhar parcialmente, e exige serialização, autenticação, retentativa e
observabilidade correlacionada.

Este documento trata do segundo caso. O primeiro é
[serviço de domínio](/04-domain-driven-design/domain-service.md) ou
[serviço de aplicação](/04-domain-driven-design/application-service.md).

## Conceitos Centrais

### O que um serviço adiciona

Sobre um módulo, um serviço traz:

**Ciclo de implantação próprio.** É o benefício principal e o que justifica a
maioria das separações.

**Isolamento de recurso.** Memória, CPU e conexões separadas. Um serviço não
derruba o outro por esgotamento.

**Escala independente.** Instâncias por serviço, conforme a carga de cada um.

E cobra:

**Latência.** Cada chamada é uma ida à rede.

**Falha parcial.** O terceiro resultado possível de uma chamada: não sei. Ver
[sistemas distribuídos](/06-distributed-systems/index.md).

**Contrato público.** Versionado, com compatibilidade a manter.

**Operação.** Pipeline, alertas, plantão, rastreamento distribuído.

### Granularidade vem de razão, não de tamanho

"Micro" não é um critério. Um serviço deve ser tão grande quanto a fronteira de
negócio que ele atende.

As razões que justificam separar são as mesmas de
[design de componentes](/02-software-design/component-design.md): ciclo de vida
independente, requisito de qualidade distinto, fronteira organizacional, ou
consumo externo.

Sem uma delas, o serviço adiciona custo e não compra nada.

### Serviços chamam serviços — e isso é o problema

Uma cadeia de chamadas síncronas entre serviços multiplica a probabilidade de
falha e soma as latências.

```text
5 serviços em cadeia, cada um com 99,9% de disponibilidade
  → disponibilidade da cadeia ≈ 99,5%
  → de 43 minutos de indisponibilidade por mês para 3,6 horas
```

E cada um adiciona sua latência ao total. A cadeia é tão lenta quanto a soma, e
tão disponível quanto o produto.

Isso é o argumento mais forte contra granularidade excessiva, e o que torna
comunicação assíncrona atraente quando a resposta não é necessária de imediato.

### Serviço é dono dos seus dados

A regra que não admite exceção: nenhum serviço acessa o banco de outro.

Compartilhar banco produz todo o acoplamento de um monolito, com todo o custo de
distribuição, e sem contrato. É a pior combinação possível, e é comum.

## Modelo Mental

**Um serviço é um módulo que ganhou o direito de ser implantado sozinho.** Esse
direito é conquistado por uma razão específica, não concedido por organização de
código.

## Quando Usar

- Ciclo de implantação independente é necessário.
- Requisito de escala, memória ou falha distinto do resto.
- Times diferentes precisam de autonomia de release.
- Consumidores externos precisam da capacidade isolada.
- A fronteira já se provou estável como módulo.

## Quando Não Usar

**Por tamanho ou por organização de código.** Módulos resolvem.

**Antes de a fronteira se provar.** Mover fronteira entre módulos é refatoração;
entre serviços, é migração de dados.

**Quando os dois lados são sempre implantados juntos.** A separação não é
exercida, e o custo é pago integralmente.

**Quando a indisponibilidade de um torna o outro inútil.** Não há isolamento de
falha real — há dois pontos de falha onde havia um.

**Quando o time não consegue operar mais um.** Cada serviço adiciona plantão,
alertas e tempo de diagnóstico.

## Alternativas

- **Módulo no mesmo processo** — a resposta na maioria dos casos.
- **[Monolito modular](/03-design-patterns/modular-monolith.md)** — isolamento
  lógico sem custo de rede.
- **Biblioteca publicada** — ciclo de release próprio sem processo separado.
- **Processo separado sem API** — um consumidor de fila, por exemplo, que isola
  recurso sem criar contrato síncrono.

## Trade-offs

| Serviço | Módulo |
|---|---|
| Implantação independente | Conjunta |
| Escala e falha isoladas | Compartilhadas |
| Chamada com latência e falha | Chamada de função |
| Contrato público versionado | Refatorável |
| Transação local impossível entre eles | Possível |
| Mais um item em operação | Nenhum |

## Modos de Falha

**Monolito distribuído.** Serviços sempre implantados juntos, com cadeia síncrona.

**Banco compartilhado.** Acoplamento sem contrato.

**Cadeia longa.** Latência somada, disponibilidade multiplicada.

**Serviço sem dono.** Ninguém responde pelo ciclo de vida.

**Contrato quebrado sem aviso.** Mudança que derruba consumidores que o time
desconhecia.

## Erros Comuns

**Chamar de serviço uma classe.** A distinção é física.

**Decidir granularidade por tamanho.**

**Compartilhar banco.**

**Encadear chamadas síncronas.** Cada elo multiplica o risco.

**Não medir se a separação é exercida.**

## Exemplo Real

Um sistema de seguros tinha sete serviços. Uma cotação atravessava cinco deles em
cadeia síncrona: portal → cotação → cadastro → risco → tabela de preços.

Latência média: 1,8 segundo. O requisito era 800 ms.

A análise mostrou que cada serviço respondia em torno de 200 ms — nenhum era
lento. O tempo era soma de rede, serialização e espera.

E a disponibilidade: cinco serviços a 99,9% produziam 99,5% na ponta, contra o
99,9% contratado com corretoras.

A correção teve duas partes.

`Cadastro` e `Risco` foram consolidados — eles sempre eram chamados juntos, sempre
implantados juntos, e o histórico mostrava 90% de alterações conjuntas.

E a consulta à tabela de preços virou cópia local em `Cotacao`, atualizada por
evento. A tabela mudava duas vezes por mês; consultá-la a cada cotação era ida à
rede para dado praticamente estático.

Resultado: cadeia de cinco para três, latência para 620 ms, disponibilidade para
99,7% — e o restante veio de retentativa com [circuit
breaker](/12-reliability/index.md).

Nenhum serviço ficou mais rápido. A arquitetura da chamada é que mudou.

## Descoberta e endereçamento

Um serviço que chama outro precisa saber onde ele está. A resposta muda conforme as
instâncias entram e saem.

**Endereço fixo em configuração.** Funciona quando as instâncias são estáveis, e
quebra com escala automática.

**DNS.** O nome resolve para as instâncias ativas. Simples e sujeito a cache do
cliente — uma instância removida continua recebendo tráfego até o cache expirar.

**Registro de serviços.** Instâncias se registram ao subir e se removem ao sair. O
cliente consulta. Resolve o cache, e adiciona um componente com estado que precisa
ser confiável.

**Plataforma.** Kubernetes e equivalentes fazem isso nativamente: um nome estável
que roteia para as instâncias saudáveis. É o caminho de menor atrito quando a
plataforma já existe.

O que decide entre eles é quanto as instâncias mudam. Num ambiente com número fixo
de máquinas, configuração basta e é a opção mais previsível. Com escala
automática, o endereço muda várias vezes por dia e só as duas últimas funcionam.

Vale notar que descoberta resolve **onde**, não **se está saudável**. As duas
perguntas são distintas, e responder à primeira sem a segunda envia tráfego para
instâncias que subiram e ainda não estão prontas.

## Conceitos Relacionados

- [Componentes](/05-system-design/components.md) — o conceito geral.
- [APIs](/05-system-design/apis.md) — o contrato entre serviços.
- [Fronteiras de Serviço](/05-system-design/service-boundaries.md) — onde separar.
- [Microsserviços](/03-design-patterns/microservices.md) — o estilo.

## Exercício Prático

Se seu sistema tem serviços, meça para o fluxo mais importante: quantos serviços
ele atravessa em cadeia síncrona?

Multiplique as disponibilidades individuais e some as latências. Compare com o
requisito.

## Perguntas de Entrevista

- O que um serviço adiciona sobre um módulo, e o que cobra?
- Por que uma cadeia de cinco serviços é menos disponível que cada um deles?
- O que significa dois serviços compartilharem banco?

## Para Aprofundar

- Newman, Sam. *Building Microservices*. 2ª ed., O'Reilly, 2021.
- Richardson, Chris. *Microservices Patterns*. Manning, 2018.
