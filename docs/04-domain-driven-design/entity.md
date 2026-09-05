---
id: entity
title: Entity
sidebar_position: 11
description: Objeto definido por identidade, não por atributos — e a decisão de qual identidade usar.
doc_type: pattern
level: 2
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor distingue entidade de objeto de valor e escolhe a
  estratégia de identidade com consciência do custo de reversão.
prerequisites: [ubiquitous-language]
related: [value-object, aggregate, repository]
canonical_for: [entity, entidade, identidade de domínio]
content_version: 2
last_reviewed: 2026-08-26
---

# Entity

## Visão Geral

Uma entidade é um objeto definido por sua **identidade**, não por seus atributos.
Dois pedidos com exatamente os mesmos dados são pedidos diferentes se têm
identificadores diferentes.

A distinção entre entidade e [objeto de valor](/04-domain-driven-design/value-object.md) é a primeira
decisão de modelagem tática, e ela vem do domínio — não de conveniência técnica.

## Problema

Nem tudo que se persiste é entidade. Tratar tudo como entidade produz três
problemas.

**Identidade onde não há.** Um endereço com identificador próprio, referenciado
por outros objetos, gera a pergunta "este endereço é o mesmo?" — que não tem
resposta útil no domínio.

**Mutabilidade indevida.** Entidades mudam ao longo do tempo; objetos de valor
não. Tornar mutável algo que deveria ser substituído abre uma classe de defeitos
de compartilhamento.

**Comparação errada.** Duas entidades se comparam por identidade; dois objetos de
valor, por atributos. Errar isso produz comportamento sutilmente incorreto em
coleções e caches.

O teste que resolve: **se dois objetos com os mesmos atributos podem ser
diferentes para o negócio, é entidade.**

## Conceitos Centrais

### A identidade é do domínio

A entidade tem identidade porque o domínio a distingue ao longo do tempo. Um
cliente continua sendo o mesmo cliente depois de mudar de endereço, de nome e de
telefone.

Isso significa que a identidade precisa ser **estável**: nunca muda enquanto a
entidade existir.

### A escolha do identificador é arquitetural

Uma das decisões de maior custo de reversão do sistema, e frequentemente tomada
por quem escreve a primeira migração. Ver
[o que é arquitetura](/01-fundamentals/what-is-software-architecture.md).

| Estratégia | Vantagem | Custo |
|---|---|---|
| Sequencial do banco | Compacto, ordenado, índice eficiente | Só existe após persistir; expõe volume; difícil em sistemas distribuídos |
| UUID gerado na aplicação | Existe antes de persistir; sem coordenação | Maior; pior localidade de índice |
| UUID ordenável por tempo | Sem coordenação e com boa localidade | Menos suportado |
| Natural do domínio | Significado próprio | Muda quando a realidade muda |

A quarta linha merece atenção: identificadores naturais — CPF, número de contrato,
código de produto — parecem ideais e falham quando o negócio muda a regra. Um
código de produto que "nunca muda" muda na primeira fusão de catálogo.

A recomendação prática: **use identificador artificial como identidade, e trate o
natural como atributo único**. Isso separa a identidade da regra de negócio que
pode mudar.

### Gerar a identidade cedo

Identificador gerado pelo banco só existe depois da persistência. Isso impede
construir um grafo de objetos em memória antes de gravar, e complica testes.

Gerar na aplicação — UUID ou equivalente — resolve: a identidade existe antes da gravação, o
grafo se monta em memória e o teste não precisa de banco.

### A entidade tem comportamento

Uma entidade com apenas campos e acessadores é o modelo anêmico. As regras que
protegem sua invariante pertencem a ela. Ver
[encapsulamento](/02-software-design/encapsulation.md).

## Quando Usar

- O domínio distingue o objeto ao longo do tempo, mesmo com atributos mudando.
- Há histórico ou ciclo de vida associado.
- Outros objetos precisam referenciá-lo de forma estável.
- Há regras que dependem de "este objeto específico".

## Quando Não Usar

**Quando o objeto é definido pelos seus valores.** Dinheiro, endereço, período,
coordenada. Ver [objeto de valor](/04-domain-driven-design/value-object.md).

**Quando a identidade não tem significado no domínio.** Se ninguém pergunta "qual
deles?", provavelmente não é entidade.

**Quando o domínio não distingue duas ocorrências idênticas.** É o mesmo eixo da condição
acima, pelo avesso: imutabilidade não decide nada aqui — dois pagamentos de mesmo valor, no
mesmo dia, pela mesma pessoa são pagamentos diferentes, e nenhum deles muda depois de
criado. Entidade imutável existe; o que não existe é entidade sem identidade.

**Em subdomínios de apoio ou genéricos.** A cerimônia de modelagem tática não se
paga fora do [core](/04-domain-driven-design/core-domain.md).

## Alternativas

- **[Objeto de valor](/04-domain-driven-design/value-object.md)** — quando os atributos definem.
- **Registro transparente** — para dados sem invariante nem identidade.
- **Identificador simples** — quando basta referenciar sem carregar o objeto.

## Trade-offs

| Entidade | Objeto de valor |
|---|---|
| Identidade estável ao longo do tempo | Definido pelos atributos |
| Mutável | Imutável |
| Comparação por identidade | Por valor |
| Ciclo de vida e histórico | Substituído, não alterado |
| Persistência com identificador | Pode ser embutido |
| Referenciada por identificador | Copiada onde é usada |

## Modos de Falha

**Identidade instável.** O identificador muda, e todas as referências quebram.

**Identificador natural que muda.** CPF corrigido, código de produto renumerado.

**Entidade anêmica.** Sem comportamento; a invariante fica espalhada.

**Comparação por atributos.** Duas instâncias da mesma entidade tratadas como
diferentes em uma coleção.

**Identidade exposta em contrato público.** Um identificador sequencial numa API
revela volume de negócio e permite enumeração.

## Erros Comuns

**Tratar tudo como entidade.** O erro mais comum e o que mais complica o modelo.

**Usar identificador natural como identidade.**

**Depender do banco para gerar identidade.**

**Deixar a entidade anêmica.**

**Expor o identificador interno em contratos externos.** Considere um
identificador público separado.

## Exemplo Real

Um sistema de locação de equipamentos modelava `Equipamento` como entidade — com
identificador — e `Contrato` também.

`Endereco` de entrega também era entidade, com tabela e identificador próprios.

O problema apareceu ao corrigir um endereço: alterar o registro mudava o endereço
de todos os contratos históricos que o referenciavam. Um contrato de dois anos
atrás passava a mostrar o endereço atual do cliente, não o de entrega original.

Isso é um defeito de auditoria em um domínio com implicação contratual.

A remodelagem tornou `Endereco` um objeto de valor, embutido em cada contrato.
Corrigir o endereço do cliente deixou de afetar contratos passados, porque cada um
carrega o endereço que valia na época.

O que revelou o erro foi a pergunta do teste: **dois endereços com os mesmos
dados são o mesmo endereço?** Para o domínio, sim — e isso significa que não é
entidade.

O contraexemplo no mesmo sistema: `Equipamento` continua entidade, porque duas
furadeiras do mesmo modelo são equipamentos diferentes, com histórico de
manutenção e de locação próprios.

## Conceitos Relacionados

- [Value Object](/04-domain-driven-design/value-object.md) — a outra metade da decisão.
- [Aggregate](/04-domain-driven-design/aggregate.md) — como entidades se agrupam.
- [Repository](/04-domain-driven-design/repository.md) — como são recuperadas.
- [Encapsulamento](/02-software-design/encapsulation.md).

## Exercício Prático

Liste as classes persistidas do seu domínio. Para cada uma, aplique o teste: dois
objetos com os mesmos atributos são o mesmo objeto para o negócio?

As que responderem "sim" são candidatas a virar objeto de valor.

Depois verifique, para as entidades, qual estratégia de identidade cada uma usa e
o que aconteceria se o identificador precisasse mudar.

## Perguntas de Entrevista

- Como distinguir entidade de objeto de valor?
- Quais são os riscos de usar um identificador natural?
- Por que gerar a identidade na aplicação em vez de no banco?

## Para Aprofundar

- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003.
- Vernon, Vaughn. *Implementing Domain-Driven Design*. Addison-Wesley, 2013 — o
  capítulo sobre identidade.
