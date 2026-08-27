---
id: ubiquitous-language
title: Ubiquitous Language
sidebar_position: 7
description: O vocabulário compartilhado que elimina a tradução — o mecanismo do qual todo o resto do DDD depende.
doc_type: concept
level: 2
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor cultiva uma linguagem compartilhada entre especialistas e
  código, e reconhece quando ela é apenas nomenclatura.
prerequisites: [domain]
related: [bounded-context, domain, entity]
canonical_for: [ubiquitous language, linguagem ubíqua]
content_version: 1
last_reviewed: 2026-08-26
---

# Ubiquitous Language

## Visão Geral

Ubiquitous language é o vocabulário compartilhado entre especialistas de domínio
e desenvolvedores, usado sem tradução em conversas, documentos e **no código**.

É o mecanismo do qual todo o resto do DDD depende. Sem ele, os padrões táticos
viram convenção de nomenclatura e os bounded contexts viram diretórios.

## Problema

O problema que ela resolve é o mesmo de [domínio](domain.md): a tradução.

Quando o especialista diz "carência", o desenvolvedor escreve `waitingPeriod`, o
banco tem `dt_ini_cob`, e a tela mostra "prazo de espera", existem quatro
representações de um conceito. Cada conversa entre as pessoas envolvidas exige
uma tradução mental, e cada tradução é uma chance de divergência.

Pior: quando o significado do conceito muda — e conceitos de negócio mudam — a
mudança precisa atravessar quatro representações, e alguém esquece uma.

## Conceitos Centrais

### A linguagem está no código, não ao lado dele

O ponto que distingue ubiquitous language de um glossário.

Um glossário é um documento que define termos. Ubiquitous language é o
vocabulário **usado no código**: nomes de classes, métodos, variáveis, eventos e
tabelas.

Se o especialista lê o nome de um método e reconhece o conceito, a linguagem está
funcionando. Se precisa de tradução, não está.

O teste é literal e vale fazer: mostre uma classe do domínio a um especialista e
peça que ele explique o que ela faz.

### A linguagem é por contexto

Não existe uma linguagem para a empresa inteira. Existe uma por
[bounded context](bounded-context.md).

"Apólice" em subscrição e em cobrança são conceitos diferentes com o mesmo nome, e
está correto que sejam — desde que a fronteira entre os contextos seja explícita.

Buscar uma linguagem corporativa única reproduz o erro do modelo canônico.

### Ela é construída em conversa, não decretada

Ubiquitous language não é definida numa reunião e publicada. Ela emerge de
conversas frequentes entre desenvolvedores e especialistas, e é refinada conforme
o entendimento melhora.

Os momentos em que ela avança são reconhecíveis: alguém pergunta "isso é a mesma
coisa que aquilo?", e a resposta revela uma distinção que ninguém tinha nomeado.

*Event storming* e sessões de modelagem colaborativa existem para produzir esses
momentos deliberadamente.

### Mudar a linguagem é mudar o código

Quando o entendimento melhora e um termo muda, o código muda junto. Renomear é
parte do trabalho, não uma refatoração opcional adiada para depois.

Um sistema em que o código usa vocabulário de três anos atrás, enquanto o negócio
fala outro, perdeu a linguagem — e ninguém percebe até uma conversa dar errado.

## Modelo Mental

**Se você precisa traduzir para explicar o código a um especialista, a linguagem
não está funcionando.**

## Quando Usar

- Sempre, dentro de um bounded context com complexidade de domínio.
- Especialmente no [core domain](core-domain.md), onde a precisão importa mais.
- Quando há mais de uma pessoa envolvida, o que é sempre.

## Quando Não Usar

**Quando não há especialista de domínio disponível.** A linguagem se constrói em
conversa; sem interlocutor, o que se produz é vocabulário inventado pela
engenharia com aparência de domínio.

**Em subdomínios genéricos.** O vocabulário de autenticação ou de envio de e-mail
é técnico e já é compartilhado; não há tradução a eliminar.

**Quando o domínio não tem vocabulário próprio.** Alguns domínios são finos o
bastante para que os termos comuns sirvam.

**Forçando termos que os especialistas não usam.** O erro sutil: a equipe inventa
um vocabulário "mais preciso" e o impõe. A linguagem precisa ser a **deles**,
inclusive com as imprecisões que carrega.

## Alternativas

- **Glossário mantido separadamente** — melhor que nada, e degrada, porque não há
  mecanismo que force a sincronia com o código.
- **Vocabulário técnico consistente** — adequado onde não há domínio complexo.

## Trade-offs

| Ubiquitous language | Vocabulário técnico |
|---|---|
| Especialista lê o código | Precisa de tradução |
| Distinções do domínio explícitas | Perdidas na tradução |
| Renomear é trabalho contínuo | Nomes estáveis |
| Exige conversas frequentes | Requisitos intermediados bastam |
| Termos por contexto | Um vocabulário |

A terceira linha é o custo real: manter a linguagem viva exige renomear conforme o
entendimento evolui, e renomear atravessa código, banco e integrações.

## Modos de Falha

**Linguagem que envelhece.** O negócio evoluiu, o código não.

**Tradução na fronteira do time.** Desenvolvedores usam um vocabulário entre si e
outro com o negócio.

**Termos inventados pela engenharia.** `ProcessadorDeTransacaoGenerico` não é
linguagem de domínio.

**Glossário sem efeito no código.** Documento que ninguém consulta.

**Linguagem única para a empresa.** Ignora que contextos diferem.

## Erros Comuns

**Tratar como convenção de nomenclatura.** É mais que nomes: é o modelo
compartilhado que os nomes expressam.

**Não renomear quando o entendimento muda.**

**Impor precisão que o negócio não tem.** Se os especialistas usam um termo de
forma ambígua, isso é informação sobre o domínio — e frequentemente aponta uma
distinção que vale explorar, não corrigir unilateralmente.

**Buscar uma linguagem corporativa.**

**Manter o vocabulário só em português na conversa e em inglês no código.** É uma
tradução, com todos os seus custos. A escolha do idioma do código precisa ser
consciente: usar os termos do domínio no idioma em que o negócio fala costuma ser
mais valioso que a consistência com palavras-chave da linguagem.

## Exemplo Real

Uma equipe de crédito consignado tinha, no código, `Emprestimo`, `Parcela`,
`Cliente` e `Status`.

Numa sessão de modelagem, ao mapear o fluxo com dois especialistas, quatro
distinções apareceram que o código não fazia:

**Averbação** — o ato de o empregador reconhecer o desconto em folha. O código
tratava como um campo booleano em `Emprestimo`.

**Margem consignável** — o limite legal de comprometimento da renda. Estava
espalhado como cálculo em três lugares.

**Portabilidade** e **refinanciamento** — dois tipos de operação com regras
completamente diferentes, ambos representados como `Emprestimo` com um campo
`tipo`.

**Reserva de margem** — o bloqueio temporário do limite durante a análise, que
expira. Não existia; era inferido pelo status.

A remodelagem com esses quatro termos levou três meses e mudou a estrutura do
sistema, não só os nomes.

O achado que justificou o esforço: `ReservaDeMargem` não existia, e a lógica de
expiração estava implementada como uma consulta que filtrava por data de criação
em três telas diferentes — com dois dias de diferença entre elas. Havia um defeito
de negócio que ninguém tinha reportado porque ninguém tinha o vocabulário para
descrevê-lo.

Nomear o conceito tornou o defeito visível.

## Quando os especialistas discordam entre si

O caso que o material sobre DDD raramente trata e que aparece com frequência: dois
especialistas usam o mesmo termo de formas diferentes.

Isso não é um problema a resolver escolhendo um dos dois. É informação valiosa, e
há três explicações possíveis.

**Contextos diferentes.** Os dois estão certos dentro das suas áreas, e o termo
tem dois significados legítimos. Isso é uma fronteira de
[bounded context](bounded-context.md) sendo revelada, e é o caso mais comum.

**Distinção não nomeada.** Existe um conceito intermediário que nenhum dos dois
nomeou, e cada um está usando o termo para uma parte dele. A conversa que
descobre isso costuma ser a mais produtiva de uma sessão de modelagem.

**Divergência real de entendimento.** Os dois deveriam concordar e não concordam.
Isso é um problema de negócio que o software estava prestes a codificar, e
encontrá-lo antes vale mais que qualquer decisão técnica da sessão.

A postura correta diante da divergência é a mesma nas três: não resolver
unilateralmente. Trazer os dois para a mesma conversa e deixar que a distinção
apareça.

Times que "padronizam" o vocabulário por decisão da engenharia perdem exatamente a
informação que a divergência carregava.

## Conceitos Relacionados

- [Domínio](domain.md) — o problema da tradução.
- [Bounded Context](bounded-context.md) — a fronteira da linguagem.
- [Entity](entity.md) e [Value Object](value-object.md) — onde a linguagem se
  materializa.
- [Política Terminológica](../i18n-terminology.md) — a aplicação deste princípio
  a este próprio repositório.

## Exercício Prático

Pegue a classe mais central do seu domínio e mostre a um especialista de negócio.

Peça que ele leia os nomes dos métodos e explique o que cada um faz.

Onde ele hesitar, perguntar ou traduzir, a linguagem não está compartilhada — e
cada ponto desses é candidato a uma distinção que o modelo não faz.

## Perguntas de Entrevista

- O que distingue ubiquitous language de um glossário?
- Por que a linguagem é por contexto e não por empresa?
- O que acontece quando o entendimento do domínio muda?

## Para Aprofundar

- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003.
- Brandolini, Alberto. *EventStorming*, 2013.
- Vernon, Vaughn. *Implementing Domain-Driven Design*. Addison-Wesley, 2013.
