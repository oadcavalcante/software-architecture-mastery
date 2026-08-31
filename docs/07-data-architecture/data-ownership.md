---
id: data-ownership
title: Propriedade do Dado
sidebar_position: 20
description: Quem decide sobre cada dado — a decisão menos técnica desta seção e a que mais determina a velocidade dos times.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor atribui propriedade de dados de forma que os times possam
  evoluir em paralelo, e reconhece o banco compartilhado como acoplamento.
prerequisites: [data-architecture]
related: [data-consistency, data-modeling, data-lifecycle]
canonical_for: [propriedade do dado, fonte da verdade, banco compartilhado, contrato de dados]
content_version: 1
last_reviewed: 2026-08-27
---

# Propriedade do Dado

## Visão Geral

Propriedade do dado responde: para cada conjunto de dados, **quem decide sobre
ele** — quem pode alterar o esquema, quem define o significado, quem é responsável
pela qualidade.

É o tópico menos técnico desta seção e o que mais determina se os times conseguem
trabalhar em paralelo ou vivem se bloqueando.

Quando ninguém é dono, todo mundo é responsável por nada, e o dado apodrece por
consenso.

## Problema

O padrão mais comum em sistemas que cresceram: um banco compartilhado, várias
aplicações lendo e escrevendo nas mesmas tabelas.

Isso parece eficiente — sem duplicação, sem integração, consultas diretas.

E produz um acoplamento que é pior que o de código, porque é invisível: nenhuma
ferramenta mostra quem depende daquela coluna. Descobre-se removendo e vendo o que
quebra.

O sintoma: nenhuma mudança de esquema é possível sem reunião com quatro times, e
por isso o esquema não muda mais.

## Conceitos Centrais

### O banco compartilhado é uma interface pública sem contrato

Quando vários serviços leem a mesma tabela, o esquema virou API — só que sem
versionamento, sem documentação e sem ninguém saber quem são os consumidores.

Cada coluna é um compromisso permanente. Renomear quebra consumidores
desconhecidos.

Isso não é argumento para dividir tudo em bancos separados — é argumento para saber
o que é interface e o que é interno.

### Um dono, muitos leitores

O modelo que funciona:

**Um serviço é dono** do conjunto de dados. Só ele escreve. Ele decide o esquema.

**Outros consomem** por interface explícita — API, evento, ou uma visão publicada
com contrato.

A distinção decisiva: o dono pode mudar o **modelo interno** livremente, e mudar a
**interface publicada** com processo de compatibilidade.

Sem essa separação, todo detalhe interno vira contrato acidental.

### Fonte da verdade precisa ser única e declarada

Para cada fato, exatamente um lugar é autoritativo.

Cópias podem existir — cache, projeção, warehouse — desde que fique claro que são
derivadas, e que a divergência se resolve sempre a favor da fonte.

Sistemas com duas fontes autoritativas do mesmo dado produzem a pergunta que não
tem resposta: "qual dos dois está certo?".

### Propriedade é organizacional, não técnica

Um dono precisa ser uma equipe com capacidade de decidir e de responder — não um
nome numa planilha.

Isso significa que a divisão de dados tende a seguir a divisão de times, e que uma
divisão que não corresponde à organização não se sustenta. Ver
[bounded contexts](/04-domain-driven-design/bounded-context.md).

Quando o time dono não tem autonomia ou capacidade, a propriedade é nominal e o
dado deteriora igual.

### Contrato de dados torna a dependência explícita

O que um contrato precisa dizer:

```text
esquema             campos, tipos, obrigatoriedade
significado         o que cada campo representa
garantias           frequência de atualização, atraso máximo
qualidade           o que o dono garante — unicidade, completude
compatibilidade     como mudanças são comunicadas e por quanto tempo convivem
```

Sem isso, o consumidor descobre a mudança quando quebra.

### Dado compartilhado precisa de decisão explícita

Alguns dados são genuinamente transversais — cadastro de cliente, tabela de
produtos, hierarquia organizacional.

As opções, em ordem de preferência prática:

**Um dono claro** que publica para os demais. Funciona quando existe um time
natural.

**Serviço dedicado** para o dado transversal. Custa um time.

**Replicação com dono único de escrita.** Cada consumidor tem sua cópia, atualizada
por eventos.

**Banco compartilhado com governança explícita.** Aceitável quando documentado, com
processo de mudança — e a pior opção quando acontece por omissão.

### Malha de dados leva o princípio ao analítico

A ideia central: dados analíticos também têm dono — o time que gera o dado é
responsável por publicá-lo com qualidade, como produto.

Isso desfaz o gargalo de uma equipe central de dados responsável por integrar
tudo, e transfere um custo real para os times de domínio.

Funciona onde há maturidade e plataforma que reduza o atrito. Adotado sem isso,
produz conjuntos de dados publicados sem qualidade e sem manutenção.

## Modelo Mental

**Sem dono declarado, o dado é de ninguém.** E dado de ninguém não evolui, não tem
qualidade e bloqueia todo mundo.

## Quando Usar

Propriedade explícita se paga sempre que:

- Mais de um time toca os mesmos dados.
- Mudanças de esquema estão bloqueadas por coordenação.
- Há dúvida sobre qual sistema tem o número certo.
- Ninguém sabe quem consome uma tabela.
- Problemas de qualidade não têm responsável.

## Quando Não Usar

**Formalizar contratos entre módulos de uma mesma aplicação, com um time só.**
Sobrecarga sem benefício.

**Separar bancos por princípio.** A separação resolve acoplamento organizacional;
sem ele, adiciona custo.

**Dono nominal sem autonomia.** Pior que não ter, porque cria a impressão de
governança.

**Malha de dados sem plataforma.** Transfere custo sem reduzir atrito.

**Contrato sem processo de mudança.** Vira documentação desatualizada.

## Alternativas

- **Banco compartilhado com governança** — documentado, com processo.
- **Visão publicada** — o dono expõe uma visão estável sobre o modelo interno; os
  consumidores leem só ela. Meio-termo barato e subestimado.
- **Replicação por eventos** — cada consumidor com sua cópia.
- **Equipe central de dados** — funciona em escala menor.

## Trade-offs

| Dono único | Compartilhado |
|---|---|
| Evolui sem coordenação | Toda mudança negociada |
| Interface explícita | Acoplamento invisível |
| Qualidade com responsável | Difusa |
| Integração a construir | Consulta direta |
| Duplicação controlada | Sem duplicação |

| Contrato formal | Acordo informal |
|---|---|
| Mudança previsível | Quebra sem aviso |
| Consumidores conhecidos | Desconhecidos |
| Processo a manter | Nenhum |

## Modos de Falha

**Esquema congelado.** Nenhuma mudança passa pela coordenação necessária.

**Consumidor desconhecido quebrado.**

**Duas fontes da verdade.** Ninguém sabe qual vale.

**Qualidade sem responsável.** Todos reclamam, ninguém corrige.

**Escrita por fora.** Um script altera dados de outro domínio.

**Dono nominal.** Existe no papel e não decide nada.

## Erros Comuns

**Não declarar donos.**

**Tratar o esquema do banco como detalhe interno** quando outros o leem.

**Permitir escrita de fora do dono.**

**Não inventariar consumidores.**

**Separar bancos sem separar responsabilidade.**

**Confundir "quem armazena" com "quem é dono".**

## Exemplo Real

Uma empresa de serviços financeiros tinha um banco central com 340 tabelas,
acessado por onze aplicações de sete times.

O sintoma que motivou a mudança: adicionar um campo na tabela de clientes levava em
média onze semanas — o tempo de coordenar com todos os times que poderiam ser
afetados, sem que ninguém soubesse ao certo quais eram.

O inventário revelou o quadro:

**23 tabelas sem nenhum dono identificável.** Criadas por projetos encerrados.

**Cadastro de clientes** escrito por quatro aplicações diferentes, cada uma com
validações próprias. Três formatos de telefone coexistiam.

**Nove tabelas sem consumidor.** Nada as lia havia mais de um ano.

**Dois lugares com endereço do cliente**, atualizados por caminhos diferentes,
divergindo em 6% dos registros.

A reorganização levou dois anos e não terminou em separação de bancos:

**Dono declarado** por tabela, com decisão registrada. Onde não havia dono natural,
a discussão foi escalada — e em quatro casos revelou que o dado pertencia a um
processo de negócio sem responsável definido, o que era o problema real.

**Escrita restrita ao dono**, por permissão de banco. Foi a mudança mais
impopular e a mais eficaz — ela tornou visíveis os caminhos de escrita
clandestinos, que eram quatorze.

**Visões publicadas** para consumidores externos ao dono, com contrato. O modelo
interno passou a poder mudar sem coordenação.

**Tabelas sem consumidor** removidas, depois de seis meses de monitoramento de
acesso.

**Cadastro de clientes** com um único serviço de escrita.

Resultado: adicionar um campo passou de onze semanas para dias, sem mover nenhum
banco de lugar.

A lição registrada: a proposta inicial era dividir em bancos separados por
domínio — um projeto estimado em dois anos e meio. A propriedade declarada com
visões publicadas entregou o mesmo desbloqueio sem a migração.

O problema era de responsabilidade, não de topologia.

## Conceitos Relacionados

- [Consistência de Dados](/07-data-architecture/data-consistency.md) — fonte da verdade.
- [Modelagem de Dados](/07-data-architecture/data-modeling.md).
- [Bounded Context](/04-domain-driven-design/bounded-context.md) — a fronteira
  correspondente.
- [Ciclo de Vida do Dado](/07-data-architecture/data-lifecycle.md).

## Exercício Prático

Escolha as cinco tabelas mais importantes do seu sistema e pergunte, para cada
uma: quem pode alterar o esquema sem pedir permissão, e quem consome?

Onde a segunda resposta for "não sei", você tem um contrato que ninguém pode
honrar.

## Perguntas de Entrevista

- Por que um banco compartilhado é uma interface pública sem contrato?
- Qual a diferença entre modelo interno e interface publicada?
- Por que propriedade de dado é decisão organizacional?

## Para Aprofundar

- Dehghani, Zhamak. *Data Mesh*. O'Reilly, 2022.
- Newman, Sam. *Building Microservices*. 2ª ed. O'Reilly, 2021 — capítulo 4.
- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003.
