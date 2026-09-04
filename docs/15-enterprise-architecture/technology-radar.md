---
id: technology-radar
title: Radar Tecnológico
sidebar_position: 14
description: O mecanismo que substitui a lista de tecnologias aprovadas — com movimento e contexto.
doc_type: pattern
level: 6
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor mantém um radar que orienta escolhas e registra aprendizado, em
  vez de uma lista que congela.
prerequisites: [enterprise-architecture]
related: [standards, enterprise-principles, technical-strategy]
canonical_for: [radar tecnológico, anel de adoção, movimento de tecnologia]
content_version: 2
last_reviewed: 2026-08-28
---

# Radar Tecnológico

## Visão Geral

Um radar tecnológico posiciona tecnologias em anéis que expressam **quanto a organização
confia nelas**, e registra o movimento entre esses anéis ao longo do tempo.

```text
adotar       usamos, recomendamos, é o padrão
experimentar vale tentar em um projeto real, com escopo limitado
avaliar      vale entender, sem compromisso
evitar       não iniciamos nada novo com isso, e há razão registrada
```

Ele substitui a lista de tecnologias aprovadas — que é binária, sem contexto, e congela.

## Problema

A lista de aprovados tem três falhas.

**Binária.** Uma tecnologia está permitida ou proibida, sem espaço para "estamos
testando" ou "funciona para este caso e não para aquele".

**Sem contexto.** Ela diz o que, não por quê. Quem chega depois não sabe se a decisão
ainda faz sentido.

**Congelada.** Adicionar exige processo; remover, ninguém faz. A lista cresce e
envelhece.

O efeito prático: times contornam. Uma lista que não acompanha a realidade deixa de ser
consultada.

## Conceitos Centrais

### O movimento é a informação

Um radar estático é uma lista com quatro categorias. O que o torna útil é registrar
**mudanças**:

```text
entrou em avaliar        alguém achou interessante
moveu para experimentar  vale testar de verdade
moveu para adotar        funcionou, é o padrão agora
moveu para evitar        testamos, não funcionou aqui — e por quê
```

A última linha é a mais valiosa e a menos registrada: saber que a organização já tentou
algo e por que não deu certo economiza a próxima pessoa que teria a mesma ideia.

E o movimento comunica direção: uma tecnologia que ficou dois anos em "avaliar" sem sair
de lá diz algo — provavelmente que ninguém tem interesse real nela.

### Cada item precisa de justificativa e contexto

```text
ruim   "Kafka — adotar"
bom    "Kafka — adotar para fluxos de alto volume com retenção;
        para filas simples, preferimos a fila gerenciada da nuvem,
        que exige menos operação"
```

A justificativa é o que permite a quem lê decidir se o caso dele se aplica — e é o que
mantém a decisão revisável quando o contexto muda.

Sem ela, o radar vira lista com nomes bonitos.

### "Evitar" não é proibir

O anel de evitar diz: **não adotamos, e há razão**. Um time com necessidade genuína pode
propor, apresentando o que mudou.

Tratar como proibição produz o mesmo contorno da lista de aprovados.

E o registro de propostas que reverteram um "evitar" é informação de qualidade: se um
item é contestado repetidamente, a razão registrada pode ter envelhecido.

### O radar reflete a organização, não a indústria

Radares públicos são úteis como referência e não substituem o próprio: eles refletem o
contexto de quem os publica.

Uma tecnologia em "adotar" numa consultoria com centenas de projetos pode ser
inadequada numa organização com oito engenheiros — porque o custo operacional que a
justifica lá não existe aqui. Ver
[serviços gerenciados](/09-cloud-architecture/managed-services.md).

O radar próprio responde: **o que funciona aqui, com o nosso time, o nosso volume e as
nossas restrições?**

### Ele é construído com os times, não para eles

Um radar produzido por um grupo de arquitetos e publicado tem a mesma adoção da lista que
substituiu.

O que funciona: uma revisão periódica com participação dos times, em que quem usou uma
tecnologia relata a experiência.

Isso o torna um mecanismo de **compartilhamento de aprendizado** além de orientação — e é
o que o mantém vivo, porque as pessoas participam da construção.

### Frequência de revisão

```text
trimestral   o mais usado; acompanha sem virar burocracia
semestral    aceitável em organizações estáveis
anual        envelhece entre revisões
contínuo     entradas podem ser propostas a qualquer momento
```

A combinação que funciona: propostas contínuas, publicação trimestral.

## Modelo Mental

**O radar registra confiança e movimento, com contexto.** Uma lista de aprovados diz o
quê; o radar diz por quê e desde quando.

## Quando Usar

- Organizações com vários times fazendo escolhas de tecnologia.
- Onde a divergência tecnológica tem custo operacional.
- Para compartilhar aprendizado entre times.
- Para orientar sem proibir.

## Quando Não Usar

**Com um time só, ou com poucos.** O radar existe para propagar aprendizado entre times que
não se falam. Com oito engenheiros num time, o aprendizado circula na conversa, e a revisão
trimestral vira cerimônia sobre decisões que todos já conhecem.

**Quando a divergência tecnológica é baixa por outra razão.** Se o caminho pavimentado já
embute as escolhas — a esteira só constrói neste runtime, a plataforma só provisiona este
banco —, o radar descreve o que a ferramenta já decide. Foi o que aconteceu ao fim do
Exemplo Real, e é sinal de sucesso, não de falha.

**Quando ninguém vai manter a revisão.** Um radar que envelhece é pior que a ausência dele:
continua sendo citado como se descrevesse a realidade. Sem quem convoque a sessão e escreva
o que mudou, a lista de aprovados é mais honesta.

**Quando a decisão precisa ser verificável automaticamente.** Em contexto regulatório ou de
compra, o que se exige é resposta binária e auditável. O radar orienta e admite exceção, que
é o oposto do que esse caso pede.

**Sem revisão periódica.**

**Com granularidade errada** — dezenas de bibliotecas, quando o que importa são as
decisões estruturais.

## Alternativas

- **Caminho pavimentado** — em vez de recomendar, oferecer pronto. Ver
  [plataformas internas](/14-devops-and-platform/internal-developer-platforms.md).
- **[Padrões](/15-enterprise-architecture/standards.md)** — quando a escolha específica é obrigatória.
- **Registro de decisões** — o histórico do que foi escolhido e por quê.
- **Comunidade de prática** — o compartilhamento de aprendizado sem artefato formal.

O caminho pavimentado é mais forte que o radar: ele torna a recomendação a opção mais
fácil, em vez de depender de alguém consultar um documento.

## Trade-offs

A troca central é entre custo de manutenção e utilidade: o radar exige revisão
periódica, e é isso que o mantém descrevendo a realidade.

| Radar | Lista de aprovados |
|---|---|
| Gradação e contexto | Resposta binária |
| Registra movimento e aprendizado | Estático |
| Manutenção contínua | Manutenção baixa, e envelhece |
| Orienta, e a exceção é conversa | Controla, e a exceção é processo |
| Difícil de verificar na esteira | Verificável automaticamente |
| Construído com os times, e leva tempo | Decidido por poucos, e sai rápido |

E a frequência de revisão equilibra esforço e atualidade:

| Revisão frequente | Rara |
|---|---|
| Descreve a realidade | Diverge dela |
| Esforço recorrente | Menos |
| Aprendizado circula | Fica nos times |

## Modos de Falha

**Radar como proibição.** Contornado.

**Sem justificativa.** Ninguém sabe por quê.

**Publicado e esquecido.**

**Granularidade fina demais.** Bibliotecas em vez de decisões estruturais.

**Sem participação dos times.** Não reflete a experiência real.

**Nunca move.** Itens que ficam anos no mesmo anel.

## Erros Comuns

**Substituir uma lista por outra**, com quatro categorias.

**Não registrar por quê.**

**Não registrar o que foi tentado e descartado.**

**Copiar radar de terceiro.**

**Construir sem os times.**

**Não ter caminho para contestar** um "evitar".

## Exemplo Real

Uma empresa de tecnologia tinha uma lista de 60 tecnologias aprovadas, mantida por um
grupo de arquitetos.

Uma auditoria dos serviços em produção encontrou 69 tecnologias rodando, das quais 31 não
estavam na lista. E o descolamento valia nos dois sentidos: 22 das 60 aprovadas não eram
usadas por ninguém.

A lista não era consultada. Ela era citada apenas quando alguém queria bloquear uma
proposta.

A substituição por radar mudou três coisas:

**Justificativa obrigatória.** Cada item passou a ter contexto: para que serve, quando
não usar, o que se aprendeu.

A migração da lista para o radar exigiu escrever esse contexto — e 18 dos 60 itens não
tinham ninguém que soubesse por que estavam ali. Foram removidos.

**Anel de "evitar" com razão.** Sete tecnologias foram para "evitar" com relato do que
tinha sido tentado e por que não funcionou. Uma delas — um banco de grafo — tinha sido
tentado por três times diferentes em quatro anos, cada um sem saber dos anteriores.

**Construção com os times.** Revisão trimestral, com relatos de quem usou. A primeira
sessão levou três horas e produziu quatorze relatos de uso que não estavam escritos em
lugar nenhum — incluindo dois casos em que times diferentes tinham abandonado a mesma
tecnologia pelo mesmo motivo, sem saber um do outro.

**Movimento registrado.** Em dezoito meses, 23 movimentos — nove entradas em avaliar,
seis promoções a experimentar, cinco a adotar, três para evitar.

E uma mudança que veio depois: as tecnologias em "adotar" passaram a ser embutidas no
caminho pavimentado da plataforma. Isso reduziu a necessidade de consultar o radar —
usar a opção recomendada virou o caminho mais fácil. Ver
[plataformas internas](/14-devops-and-platform/internal-developer-platforms.md).

O radar continuou útil para o que não pode ser embutido: as decisões estruturais e o
registro do que foi tentado.

A avaliação posterior aponta: as 31 tecnologias fora da lista não eram indisciplina. Elas
eram a resposta a problemas reais, tomada por pessoas que consultaram a lista, não
encontraram resposta útil, e seguiram.

## Conceitos Relacionados

- [Padrões](/15-enterprise-architecture/standards.md) — a prescrição obrigatória.
- [Princípios Corporativos](/15-enterprise-architecture/enterprise-principles.md).
- [Estratégia Técnica](/15-enterprise-architecture/technical-strategy.md).
- [Plataformas Internas](/14-devops-and-platform/internal-developer-platforms.md).

## Exercício Prático

Liste as tecnologias efetivamente em uso nos seus serviços e compare com a lista
aprovada, se houver.

A diferença mede o quanto a lista descreve a realidade — e, se for grande, ela não está
orientando nada.

## Perguntas de Entrevista

- Por que o movimento é a informação mais valiosa de um radar?
- Por que "evitar" não deve ser proibição?
- Por que radar público não substitui o próprio?

## Para Aprofundar

- Thoughtworks. *Technology Radar*, vol. 29, 2023 — uma edição como âncora do formato; as
  demais estão publicadas e mostram o movimento dos itens entre anéis.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.
- Ford, Neal et al. *Building Evolutionary Architectures*. 2ª ed. O'Reilly, 2022.
