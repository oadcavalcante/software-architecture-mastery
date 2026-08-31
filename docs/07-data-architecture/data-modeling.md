---
id: data-modeling
title: Modelagem de Dados
sidebar_position: 12
description: A decisão mais difícil de reverter — e por que ela deve partir do padrão de acesso, não do diagrama.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor modela a partir de como o dado será usado, e reconhece que
  o modelo carrega o histórico inteiro do sistema.
prerequisites: [data-architecture]
related: [normalization, denormalization, data-ownership]
canonical_for: [modelagem de dados, modelo conceitual, modelo lógico, modelo físico]
content_version: 1
last_reviewed: 2026-08-27
---

# Modelagem de Dados

## Visão Geral

Modelar dados é decidir quais entidades existem, quais atributos elas têm, como se
relacionam e onde ficam as fronteiras entre elas.

É a decisão mais cara de reverter em qualquer sistema, porque diferente do código
— que se reescreve — o modelo carrega todos os registros já gravados.

E é frequentemente tomada cedo, com pouca informação, por quem tem menos contexto
de negócio.

## Problema

A modelagem costuma acontecer de duas formas ruins.

**Do diagrama para fora.** Alguém desenha as entidades do domínio como aparecem no
vocabulário do negócio, normaliza tudo, e descobre depois que as consultas reais
exigem oito junções.

**Da tela para dentro.** Alguém modela exatamente o que a primeira tela precisa, e
descobre na segunda tela que o modelo não serve.

A abordagem que funciona é nem uma nem outra: modelar a partir do **padrão de
acesso** — como o dado nasce, como muda e como é lido — mantendo o vocabulário do
domínio.

## Conceitos Centrais

### Três níveis, e a confusão entre eles

**Conceitual.** Que entidades existem no negócio e como se relacionam. Sem
tecnologia, sem tipo de dado. É uma conversa com quem entende o domínio.

**Lógico.** Atributos, chaves, cardinalidade, normalização. Ainda independente do
banco.

**Físico.** Tipos, índices, particionamento, decisões de desempenho.

Pular direto para o físico é comum e produz modelos que refletem a limitação da
ferramenta em vez do negócio. Parar no conceitual produz modelos bonitos que não
funcionam.

### O padrão de acesso decide

As perguntas que precedem qualquer diagrama:

```text
como o dado é criado?        um por vez, em lote, por evento
como é lido?                 por chave, por filtro, por varredura
com que frequência?          leitura vs escrita, ordem de grandeza
o que muda?                  quais atributos, com que frequência
o que precisa ser atômico?   quais mudanças acontecem juntas
o que é histórico?           o que precisa ser preservado
```

A quinta pergunta é a que define fronteiras de agregado. A sexta é a mais
esquecida e a que mais causa arrependimento.

### Modelar o tempo é a decisão silenciosa

Quase todo modelo trata os dados como estado atual. E quase todo negócio, mais
cedo ou mais tarde, pergunta "como estava em março?".

Três abordagens, com custos crescentes:

**Só o estado atual.** Simples, e o passado se perde.

**Histórico de alterações.** Uma tabela de auditoria ao lado. Barato e cobre a
maioria das necessidades.

**Versionamento temporal.** Cada registro com período de validade. Permite
reconstruir qualquer momento, e complica toda consulta.

Decidir isso depois de dois anos de operação significa que o histórico daqueles
dois anos não existe. É irrecuperável — a única decisão desta seção que não admite
correção retroativa.

### Identidade: natural ou artificial

Usar um identificador do negócio — CPF, código de produto — como chave parece
econômico e cria acoplamento: quando o negócio muda a regra do código, o modelo
inteiro sente.

A prática robusta é chave artificial como identidade, e o identificador de negócio
como atributo com restrição de unicidade — que pode ser alterado sem quebrar
referências.

### Nomear é modelar

Um atributo chamado `status` com valores que o time interpreta de formas
diferentes é um defeito de modelagem, não de documentação.

O vocabulário do modelo deve ser o do domínio, e o mesmo termo deve significar a
mesma coisa em todo lugar. Ver
[linguagem ubíqua](/04-domain-driven-design/ubiquitous-language.md).

### O modelo evolui, e a migração é parte do desenho

Nenhum modelo sobrevive intacto. O que distingue um modelo sustentável não é estar
certo desde o início — é ser possível mudá-lo.

Isso significa: evitar tabelas tão largas que qualquer alteração é arriscada,
evitar chaves que impedem redistribuição, e manter uma trilha de migrações
versionada desde o primeiro dia.

## Modelo Mental

**Modele a partir de como o dado será usado, não de como ele é descrito.** E decida
sobre o tempo antes de precisar dele.

## Quando Usar

Modelagem explícita se paga sempre que:

- Os dados sobrevivem ao sistema atual — quase sempre.
- Mais de um time lê ou escreve.
- Há requisito de histórico ou auditoria.
- O volume vai crescer em ordens de grandeza.

## Quando Não Usar

**Modelagem elaborada para dado descartável.** Cache, telemetria de curta
retenção, rascunho.

**Normalizar por princípio.** Ver [normalização](/07-data-architecture/normalization.md) — é decisão,
não virtude.

**Modelar todas as entidades do domínio antes de construir.** O modelo completo
antecipado envelhece antes de ser usado.

**Modelo genérico** — tabelas de "entidade" e "atributo" que servem para tudo.
Elas eliminam esquema, índice e legibilidade de uma vez.

O último é um antipadrão persistente e vale nomeá-lo: um modelo que serve para
qualquer coisa não serve bem para nada.

## Alternativas

- **Modelagem dirigida por domínio** — agregados como fronteira. Ver
  [DDD](/04-domain-driven-design/index.md).
- **Modelagem dimensional** — para analítico. Ver
  [data warehouse](/07-data-architecture/data-warehouses.md).
- **Esquema por leitura** — guardar bruto e interpretar na leitura; adequado a
  ingestão exploratória, e ver [data lake](/07-data-architecture/data-lakes.md) para os riscos.

## Trade-offs

| Modelo estrito | Modelo flexível |
|---|---|
| Garantias no armazenamento | Validação na aplicação |
| Evolução planejada | Incremental |
| Consultas não previstas | Limitadas |
| Migração custosa | Barata |

| Com histórico | Só estado atual |
|---|---|
| Reconstrói o passado | Perde |
| Consultas mais complexas | Diretas |
| Volume maior | Menor |
| Auditoria nativa | Ausente |

## Modos de Falha

**Histórico inexistente quando alguém pergunta.** Irrecuperável.

**Fronteira de agregado errada.** Transações distribuídas viram rotina.

**Chave natural mudando.** O negócio altera a regra e as referências quebram.

**Tabela larga demais.** Qualquer alteração de esquema é operação de risco.

**Vocabulário ambíguo.** O mesmo campo significa coisas diferentes por serviço.

**Modelo genérico.** Sem esquema, sem índice útil, sem legibilidade.

## Erros Comuns

**Modelar a partir da tela.**

**Não decidir sobre o tempo.**

**Chave natural como identidade.**

**Normalizar ou desnormalizar por hábito** em vez de por padrão de acesso.

**Não versionar migrações desde o início.**

**Adiar a conversa com o negócio.** O modelo conceitual não é trabalho técnico.

## Exemplo Real

Um sistema de gestão de planos de saúde modelou beneficiários com estado atual:
nome, plano, categoria, dependentes.

Funcionou por três anos. Então a auditoria regulatória pediu: "qual era a categoria
deste beneficiário em cada mês dos últimos cinco anos?".

A resposta não existia. Cada mudança de categoria sobrescrevia a anterior.

A reconstrução parcial foi feita a partir de registros de aplicação e de arquivos
de faturamento, com esforço de quatro meses e resultado incompleto. Houve multa.

A correção mudou o modelo para versionamento temporal nos atributos que importam —
categoria, plano e valor — com período de validade. Os demais permaneceram como
estado atual.

Duas observações que a equipe registrou:

**Não era preciso versionar tudo.** A discussão inicial considerou temporalizar o
modelo inteiro, o que teria complicado todas as consultas. Apenas três atributos
tinham requisito real de histórico.

**Uma tabela de auditoria desde o início teria bastado.** Não era necessário
versionamento temporal completo em 2022 — bastava registrar as mudanças. O custo
teria sido de dias, e a informação existiria.

A pergunta "o que alguém pode querer saber sobre o passado disto?" não tinha sido
feita.

## Conceitos Relacionados

- [Normalização](/07-data-architecture/normalization.md) e [Desnormalização](/07-data-architecture/denormalization.md).
- [Propriedade do Dado](/07-data-architecture/data-ownership.md) — quem decide o modelo.
- [Ciclo de Vida do Dado](/07-data-architecture/data-lifecycle.md) — retenção e apagamento.
- [DDD](/04-domain-driven-design/index.md) — agregados como fronteira.

## Exercício Prático

Para as três entidades mais importantes do seu sistema, responda: se alguém
perguntar como este registro estava há um ano, você consegue responder?

Onde não conseguir, decida agora se isso é aceitável. Daqui a dois anos a decisão
não estará mais disponível.

## Perguntas de Entrevista

- Por que o padrão de acesso deve preceder o diagrama?
- Qual o risco de usar identificador de negócio como chave?
- Por que a decisão sobre histórico não admite correção retroativa?

## Para Aprofundar

- Fowler, Martin. *Patterns of Enterprise Application Architecture*.
  Addison-Wesley, 2002.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Hay, David. *Data Model Patterns*. Dorset House, 1996.
