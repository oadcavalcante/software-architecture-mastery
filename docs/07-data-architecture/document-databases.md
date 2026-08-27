---
id: document-databases
title: Bancos de Documentos
sidebar_position: 3
description: Agregados lidos inteiros — e por que "sem esquema" apenas move o esquema para a aplicação.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor identifica quando o agregado é a unidade natural de acesso
  e reconhece o custo de perder o esquema declarado.
prerequisites: [nosql]
related: [relational-databases, data-modeling, denormalization]
canonical_for: [banco de documentos, agregado de documento]
content_version: 1
last_reviewed: 2026-08-27
---

# Bancos de Documentos

## Visão Geral

Um banco de documentos guarda estruturas aninhadas — tipicamente JSON — como
unidade de armazenamento e de acesso.

O caso em que ele brilha é específico e reconhecível: **o dado é lido e escrito
como um todo**, tem estrutura que varia entre instâncias, e as consultas partem
quase sempre da raiz do documento.

Onde esse padrão vale, o modelo elimina junções e o objeto da aplicação
corresponde ao registro armazenado. Onde não vale, ele cobra caro.

## Problema

O modelo relacional espalha um objeto de negócio por várias tabelas. Montar um
pedido com itens, endereço e pagamento exige junções, e reconstruir o objeto na
aplicação é trabalho repetido.

Quando esse objeto é sempre lido inteiro, esse espalhamento é custo sem benefício.

O banco de documentos guarda o objeto como ele é. E ao fazer isso, abre mão de
coisas que só fazem falta depois.

## Conceitos Centrais

### O agregado define a fronteira

A decisão central da modelagem é: **o que entra num documento e o que fica fora**.

A regra que funciona: um documento é a unidade que se lê e se escreve junto, e
sobre a qual a consistência precisa valer.

Um pedido com seus itens é um documento — eles nascem, mudam e são lidos juntos.
Um cliente com todos os seus pedidos não é: os pedidos crescem sem limite e são
consultados independentemente.

Errar essa fronteira é o erro dominante do modelo, e é caro de corrigir depois.

### "Sem esquema" significa esquema não declarado

Não existe dado sem estrutura. Existe estrutura que o banco não conhece.

O efeito: a validação migra para a aplicação — e para **todas** as aplicações que
escrevem, inclusive scripts de correção e serviços legados.

Na prática, uma coleção com anos de uso acumula três ou quatro formatos
coexistindo, e o código de leitura vira uma sequência de verificações defensivas.

Isso não é argumento contra o modelo. É argumento para declarar o esquema em
algum lugar — validação no banco, quando disponível, ou um contrato verificado na
borda.

### A flexibilidade real é a evolução incremental

O ganho legítimo não é ausência de esquema. É poder adicionar um campo sem
alterar milhões de registros existentes.

Numa tabela grande, alterar o esquema exige planejamento. Num documento, o campo
novo aparece nos registros novos e o código lida com a ausência nos antigos.

Isso é valioso, e é uma vantagem operacional específica — não uma dispensa de
modelagem.

### Duplicação é escolha, não descuido

Como não há junção eficiente, dados referenciados costumam ser copiados para
dentro do documento. Ver [desnormalização](denormalization.md).

A pergunta que decide: quando o valor original muda, os documentos que o copiaram
precisam mudar?

Se o dado é uma fotografia do momento — o preço no instante da compra, o endereço
usado naquela entrega — a cópia é correta e permanente.

Se é uma referência viva — o nome atual do cliente — copiar cria um problema de
atualização em massa.

### Transação entre documentos existe, e o custo permanece

Vários bancos de documentos passaram a oferecer transações entre documentos, o
que remove a objeção clássica.

O custo continua: elas são mais caras que a atualização de um documento único, e
usá-las com frequência sinaliza que a fronteira do agregado está errada.

### Consulta fora do padrão previsto é o limite

Consultar por campo aninhado profundo, agregar entre coleções ou cruzar dados sem
índice preparado vai de difícil a inviável.

É o mesmo trade-off de sempre: o modelo é otimizado para o acesso previsto, e as
perguntas não previstas custam.

## Modelo Mental

**Documento é bom quando o agregado é a unidade de acesso.** Fora disso, o modelo
trabalha contra você.

## Quando Usar

- O objeto é lido e escrito inteiro.
- A estrutura varia legitimamente entre instâncias.
- As consultas partem da raiz do documento.
- A consistência necessária cabe dentro de um documento.
- A evolução incremental do esquema tem valor operacional.
- Catálogo, prontuário, configuração, conteúdo, histórico de eventos.

## Quando Não Usar

**Quando as consultas cruzam entidades.** Junção é o que falta, e reimplementá-la
na aplicação é pior.

**Quando o agregado cresce sem limite.** Uma lista que só cresce dentro de um
documento acaba estourando o limite de tamanho.

**Quando a integridade referencial importa.** Não há chave estrangeira.

**Como substituto genérico do relacional.** Ver
[bancos relacionais](relational-databases.md).

**Para acesso puro por chave com altíssima vazão.** Ver
[chave-valor](key-value-databases.md), mais simples e mais rápido.

**Sem nenhuma validação de estrutura.** O esquema implícito vai divergir.

## Alternativas

- **[Relacional](relational-databases.md)** — com coluna de documento, que combina
  esquema declarado e flexibilidade localizada.
- **[Chave-valor](key-value-databases.md)** — quando não há consulta por conteúdo.
- **Índice invertido** — quando a necessidade é busca com relevância.

A primeira merece destaque: bancos relacionais modernos indexam campos dentro de
documentos armazenados em coluna. Isso cobre boa parte dos casos sem abrir mão de
transações e restrições.

## Trade-offs

| Documento | Relacional |
|---|---|
| Objeto lido de uma vez | Junções |
| Estrutura variável | Esquema uniforme |
| Evolução incremental | Migração planejada |
| Validação na aplicação | No armazenamento |
| Sem integridade referencial | Chave estrangeira |
| Consultas previstas | Não previstas possíveis |
| Duplicação como norma | Normalização como norma |

## Modos de Falha

**Documento crescendo sem limite.** Atinge o teto de tamanho e a escrita passa a
falhar.

**Formatos divergentes.** Anos de gravações sem validação.

**Atualização em massa de dado duplicado.** Um campo copiado em milhões de
documentos precisa mudar.

**Junção na aplicação.** Buscar N documentos em laço, com uma consulta por item.

**Índice ausente em campo aninhado.** Varredura completa da coleção.

**Fronteira de agregado errada.** Transações entre documentos viram rotina.

## Erros Comuns

**Aninhar coleção que cresce sem limite.**

**Não declarar nenhuma validação.**

**Copiar dado vivo sem plano de atualização.**

**Modelar como se fossem tabelas** — um documento por entidade, com referências
entre eles, reproduzindo o relacional sem as garantias dele.

**Escolher por "sem esquema".**

## Exemplo Real

Uma plataforma de conteúdo modelou artigos como documentos: título, corpo, autor,
etiquetas e comentários aninhados.

Funcionou por dois anos. Depois:

**Documentos estourando.** Artigos populares acumulavam milhares de comentários.
Um chegou a 14 MB e passou a falhar na escrita — o limite do banco era 16 MB. Os
comentários foram movidos para coleção própria, com referência ao artigo.

**Nome do autor duplicado.** Cada artigo guardava o nome do autor. Quando um autor
mudou de nome, foi preciso atualizar 40 mil documentos. O nome virou referência, e
a interface passa a buscá-lo separadamente.

**Formatos coexistindo.** Sem validação, três formatos de etiqueta conviviam:
lista de textos, lista de objetos, e texto separado por vírgula. O código de
leitura tinha que tratar os três. A correção exigiu migração e validação
obrigatória.

O que permaneceu correto: o artigo em si continua sendo um documento, lido inteiro
por rota. O modelo é adequado para ele.

O que a equipe registra: as três correções tinham o mesmo diagnóstico. A fronteira
do agregado foi definida por conveniência de leitura inicial — "a tela mostra tudo
junto" — e não por como o dado muda.

## Conceitos Relacionados

- [NoSQL](nosql.md) — a categoria e seus problemas.
- [Bancos Relacionais](relational-databases.md) — a comparação principal.
- [Desnormalização](denormalization.md) — a duplicação como decisão.
- [Modelagem de Dados](data-modeling.md).

## Exercício Prático

Pegue o maior documento de uma coleção sua. Veja o tamanho e o que o faz crescer.

Se algo dentro dele cresce sem teto, essa é a fronteira de agregado errada — e o
problema aparece por escrita falhando, não por lentidão.

## Perguntas de Entrevista

- Como decidir a fronteira de um agregado de documento?
- O que "sem esquema" realmente significa na operação?
- Quando duplicar um dado dentro do documento é correto?

## Para Aprofundar

- Sadalage, Pramod; Fowler, Martin. *NoSQL Distilled*. Addison-Wesley, 2012.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 —
  capítulo 2.
- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003 — sobre agregados.
