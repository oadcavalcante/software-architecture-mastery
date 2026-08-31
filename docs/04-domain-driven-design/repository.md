---
id: repository
title: Repository
sidebar_position: 17
description: Uma coleção de agregados com aparência de memória — e o que separa um repositório de um DAO.
doc_type: pattern
level: 2
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor projeta repositórios no vocabulário do domínio e reconhece
  quando o padrão degenerou em camada de acesso a dados.
prerequisites: [aggregate]
related: [aggregate, factory, dependency-inversion]
canonical_for: [repository, repositório]
content_version: 1
last_reviewed: 2026-08-26
---

# Repository

## Visão Geral

Um repositório oferece acesso a agregados com a aparência de uma coleção em
memória. O domínio pede um agregado e o recebe; como ele é persistido não faz
parte do contrato.

A diferença entre um repositório e uma camada de acesso a dados é sutil na
estrutura e enorme na consequência.

## Problema

O domínio precisa de agregados que estão persistidos. Se ele conhece SQL, ORM ou
o esquema, a regra de negócio fica amarrada à tecnologia de armazenamento — e
testá-la exige um banco.

O repositório resolve invertendo a dependência: a interface pertence ao domínio, a
implementação à infraestrutura. Ver
[inversão de dependência](/02-software-design/dependency-inversion.md).

## Conceitos Centrais

### Um repositório por agregado

A regra que mais reduz o número de repositórios: **só raízes de agregado têm
repositório.**

Objetos internos são acessados através da raiz. Um `ItemDePedidoRepository`
permite alterar um item sem passar pelo pedido — o que anula a proteção da
invariante que o [agregado](/04-domain-driven-design/aggregate.md) existe para dar.

### Repositório não é DAO

A distinção que decide se o padrão está sendo usado ou apenas nomeado.

| | Repositório | DAO |
|---|---|---|
| Vocabulário | Do domínio | Da persistência |
| Unidade | Agregado | Tabela ou linha |
| Interface pertence a | Domínio | Infraestrutura |
| Devolve | Agregado completo | Registro ou projeção |
| Métodos | Poucos, específicos | Genéricos: CRUD, busca por qualquer campo |

```text
❌  findByStatusAndDataBetweenOrderByValor(...)
✅  pedidosPendentesDe(cliente)
```

À esquerda, o método expõe a estrutura da consulta. À direita, expressa uma
pergunta do negócio.

Um repositório com trinta métodos genéricos é um DAO com outro nome — e o domínio
continua acoplado à forma de consultar.

### Repositório não serve à leitura de tela

Um erro caro e comum: usar o repositório para alimentar listagens e relatórios.

Repositórios devolvem agregados completos, com todas as invariantes carregadas. Uma
tela que mostra cinco campos de cem pedidos não precisa de cem agregados — precisa
de uma projeção.

Ver [CQRS](/03-design-patterns/cqrs.md) de nível 2: leitura vai direto ao banco,
com uma consulta que devolve exatamente o que a tela precisa.

Insistir em usar o repositório para leitura é a origem do agregado grande e do
problema N+1.

### A coleção é uma ilusão útil

A metáfora de coleção em memória orienta o desenho da interface: `adicionar`,
`remover`, `buscarPor`. Não `salvar`, `atualizar`, `inserir` — que são vocabulário
de banco.

A ilusão tem limites: paginação, consultas complexas e desempenho eventualmente
vazam. Reconhecer onde ela vaza é parte de usar o padrão bem.

## Quando Usar

- Há agregados que precisam ser persistidos e recuperados.
- O domínio deve ser testável sem infraestrutura.
- A tecnologia de persistência pode mudar.
- O core domain justifica a cerimônia.

## Quando Não Usar

**Para leitura de tela.** Use projeção direta.

**Em subdomínios de apoio ou genéricos.** Acesso direto ao banco costuma ser a
resposta correta ali. Ver [DDD tático](/04-domain-driven-design/tactical-ddd.md).

**Quando o ORM já oferece a abstração.** Alguns ORMs implementam o padrão de
unidade de trabalho e repositório; envolver isso em outro repositório adiciona
camada sem esconder nada.

**Quando ele vira DAO.** Se a interface só tem métodos genéricos, ela não está
comprando desacoplamento.

**Quando não há intenção de trocar nem de testar isoladamente.** O padrão custa
uma interface e um mapeamento; sem nenhum dos dois benefícios, é cerimônia.

## Alternativas

- **Projeção de leitura** — para consultas de tela.
- **Acesso direto ao ORM** — em subdomínios simples.
- **Unidade de trabalho** — quando o controle transacional é a necessidade
  principal.
- **Consulta especializada** — um objeto por consulta complexa, em vez de mais um
  método no repositório.

## Trade-offs

| Repositório | Acesso direto |
|---|---|
| Domínio testável sem banco | Teste carrega infraestrutura |
| Vocabulário do domínio | Da persistência |
| Tecnologia substituível | Troca toca o domínio |
| Interface e mapeamento a manter | Nada a mais |
| Ilusão que vaza em desempenho | Controle total da consulta |
| Um por agregado, poucos métodos | Consultas ad hoc livres |

## Modos de Falha

**Repositório que virou DAO.** Métodos genéricos, vocabulário de persistência.

**Repositório para objeto interno.** A invariante do agregado deixa de ser
protegida.

**Repositório usado para leitura de tela.** Carrega agregados completos
desnecessariamente; origem do N+1.

**Repositório que devolve o tipo do ORM.** O vazamento anula o desacoplamento.

**Repositório com regra de negócio.** Uma consulta que filtra por uma regra
implícita — "pedidos válidos" — esconde no acesso a dados algo que pertence ao
domínio.

## Erros Comuns

**Criar um repositório por entidade.** Só raízes de agregado.

**Métodos de consulta genéricos.**

**Usar para leitura.**

**Deixar a interface no pacote de infraestrutura.** Anula a inversão. Ver
[inversão de dependência](/02-software-design/dependency-inversion.md).

## Exemplo Real

Um sistema de gestão hospitalar tinha `PacienteRepository` com 47 métodos:
`findByNome`, `findByNomeAndDataNascimento`, `findAtivos`,
`findComInternacaoAberta`, `findParaRelatorioMensal`, e assim por diante.

Três problemas ao mesmo tempo.

A tela de busca de pacientes carregava agregados completos — com histórico de
internações e prescrições — para exibir nome, data de nascimento e número do
prontuário. Uma busca que retornava 200 pacientes carregava dezenas de milhares
de objetos.

`findParaRelatorioMensal` continha, na consulta, a regra de quais pacientes contam
para o relatório — uma decisão de negócio escondida numa cláusula SQL, que o time
de compliance não conseguia auditar.

E qualquer alteração no esquema tocava os 47 métodos.

A separação foi em três direções.

O repositório ficou com quatro métodos, no vocabulário do domínio:
`buscarPorId`, `buscarPorProntuario`, `adicionar`, `remover`. Só o que o domínio
precisa para operar sobre um paciente.

As consultas de tela viraram projeções: uma consulta por tela, devolvendo um tipo
com os campos exibidos. A busca caiu de 4 segundos para 60 milissegundos.

E a regra do relatório saiu do SQL para um serviço de domínio, onde pôde ser
testada e auditada.

O que o time registrou: o repositório tinha crescido para 47 métodos um a um, e
cada adição foi razoável. O problema não foi nenhuma delas — foi não ter um
critério dizendo o que pertence ao repositório e o que não.

## Conceitos Relacionados

- [Aggregate](/04-domain-driven-design/aggregate.md) — a unidade que o repositório acessa.
- [Factory](/04-domain-driven-design/factory.md) — a criação, em contraste com a recuperação.
- [Inversão de Dependência](/02-software-design/dependency-inversion.md).
- [CQRS](/03-design-patterns/cqrs.md) — a leitura por outro caminho.

## Exercício Prático

Conte os métodos dos repositórios do seu sistema. Para cada método, verifique:
ele é usado pelo domínio para operar, ou por uma tela para exibir?

Os do segundo tipo pertencem a projeções de leitura.

Depois verifique o vocabulário: os nomes descrevem perguntas do negócio ou
estruturas de consulta?

## Perguntas de Entrevista

- Qual a diferença entre repositório e DAO?
- Por que só raízes de agregado têm repositório?
- Por que usar repositório para leitura de tela é problema?

## Para Aprofundar

- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003.
- Vernon, Vaughn. *Implementing Domain-Driven Design*. Addison-Wesley, 2013.
- Fowler, Martin. *Patterns of Enterprise Application Architecture*, 2002.
