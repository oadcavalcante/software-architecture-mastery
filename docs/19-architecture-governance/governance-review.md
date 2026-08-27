---
id: governance-review
title: Revisão como Instrumento
sidebar_position: 2
description: Cedo e sem veto, ou tarde e sem efeito — a revisão só funciona num dos dois momentos.
doc_type: concept
level: 6
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor opera revisões que melhoram decisões em vez de aprová-las, com
  pauta, momento e produto definidos.
prerequisites: [governance-basics]
related: [governance-basics, governance-pathologies, exceptions]
canonical_for: [revisão antecipada, aconselhamento contra portão, pauta de revisão, produto da revisão]
content_version: 1
last_reviewed: 2026-08-29
---

# Revisão como Instrumento

## Visão Geral

Revisão de arquitetura é o mecanismo de governança mais usado e o mais frequentemente mal
desenhado. O defeito quase sempre está em **quando** ela acontece, não em quem participa
nem no que se discute.

```text
cedo, sem poder de veto     melhora a decisão
tarde, com poder de veto    aprova o inevitável
tarde, sem poder de veto    ritual
cedo, com poder de veto     ninguém traz nada cedo
```

Apenas a primeira combinação produz efeito. E ela é a menos escolhida, porque parece a mais
fraca — uma revisão sem autoridade formal soa como uma revisão sem consequência.

A prática mostra o contrário: a autoridade de vetar é o que empurra a revisão para o fim,
onde ela não tem mais o que melhorar.

Ver [revisão de arquitetura](../15-enterprise-architecture/architecture-review.md) para os
formatos; aqui o foco é a revisão como instrumento de governança.

## Problema

Uma revisão com poder de veto cria incentivos que a esvaziam:

```text
o time evita trazer cedo         desenho incompleto pode ser rejeitado
traz quando está pronto          quando mudar é caro
prepara para aprovação           apresenta a solução, não o problema
omite as dúvidas reais           dúvida vira munição
o revisor herda o custo do não   e por isso quase nunca diz não
```

O resultado é uma reunião em que todos sabem que a decisão já foi tomada, e cujo produto é
uma ata.

Há um segundo problema, oposto: a revisão sem pauta. Ela vira conversa aberta sobre o
desenho inteiro, consome duas horas, gera trinta comentários de peso desigual, e o time sai
sem saber o que é bloqueante e o que é preferência.

## Conceitos Centrais

### Cedo é antes de existir código

```text
tarde demais   o desenho está implementado
tarde          o desenho está detalhado e aprovado internamente
bom            existe uma direção e duas ou três dúvidas reais
melhor ainda   existe o problema e um esboço
```

A revisão de maior valor acontece quando o time ainda **tem dúvida**. Uma dúvida genuína é
o sinal de que há espaço para influência.

Isso exige que trazer algo incompleto seja seguro — o que é incompatível com veto.

### Aconselhamento, não portão

```text
portão          decide se pode seguir
aconselhamento  melhora a decisão de quem segue
```

No modelo de aconselhamento, a decisão permanece com o time, e o registro de que a
orientação foi dada permanece com a revisão. Se o time seguir caminho diferente, isso é
legítimo e fica registrado — no [ADR](../18-architecture-decisions/index.md), com a objeção
preservada.

Esse registro é o que substitui a autoridade formal: não há veto, e há memória.

E há uma consequência de responsabilidade: quem decide contra a orientação assume o
resultado, o que é um incentivo mais forte que a aprovação.

### Um portão pequeno ainda é necessário

Aconselhamento não cobre tudo. Um conjunto pequeno de decisões precisa de aprovação real:

```text
implicação regulatória
formato de dado consumido por outros times
compromisso financeiro irreversível acima de um limite
exposição de superfície pública nova
```

Quatro classes, não quatorze. Manter essa lista curta é o que faz o portão ser respeitado
quando ele aparece.

### Pauta em vez de conversa aberta

Uma revisão sem pauta gasta o tempo no que é fácil de comentar, não no que é importante.

```text
qual é o problema, com números
que decisão está sendo tomada
que alternativas foram consideradas
qual é a consequência mais cara
o que o time gostaria de discutir
```

A última linha é a mais produtiva e a mais esquecida: perguntar ao time onde ele tem dúvida
concentra a revisão no ponto de maior retorno.

Ver [alternativas](../18-architecture-decisions/adr-alternatives.md).

### O produto da revisão

Uma revisão precisa produzir algo além de conversa:

```text
o que é bloqueante          poucos itens, explícitos
o que é recomendação        a maior parte
o que é preferência         nomeado como tal, e descartável
o que ficou em aberto       com dono e prazo
```

Separar as três primeiras categorias resolve o problema mais comum das revisões: comentários
de peso desigual apresentados com a mesma ênfase, deixando o time sem critério de
priorização.

E o registro dessa separação é o que permite avaliar a revisão depois — ver
[medição](measuring-governance.md).

### Quem participa

```text
quem decide          o time, sempre
quem tem histórico   arquitetos, pessoas com cicatrizes relevantes
quem responde pelo risco  segurança, operação, dados — quando aplicável
quem consome         times afetados, quando há contrato entre eles
```

O grupo pequeno funciona melhor. Uma revisão com nove pessoas produz comentários de
educação, não de julgamento — cada participante sente necessidade de contribuir.

Três a cinco é o intervalo em que a discussão continua sendo discussão.

### Revisão assíncrona

Um formato subutilizado: o desenho é escrito, circulado, comentado por escrito, e a reunião
só acontece se houver desacordo.

```text
melhor para   organizações distribuídas, decisões com muito contexto
pior para     exploração aberta, discordância profunda
efeito        filtra: só o que precisa de conversa vira reunião
```

Escrever força clareza, e comentários escritos são citáveis depois. O custo é latência — e
para decisões arquiteturais, dois dias de latência raramente é o gargalo.

## Modelo Mental

**Cedo e sem veto.** A autoridade de dizer não é o que empurra a revisão para o momento em
que não há mais nada a melhorar.

## Quando Usar

- Cedo, enquanto o desenho é maleável e o time tem dúvidas.
- Com pauta, e com o time definindo parte dela.
- Como aconselhamento, com portão apenas para poucas classes de decisão.
- De forma assíncrona quando o contexto é extenso.

## Quando Não Usar

**Como portão para tudo.**

**Depois da implementação.**

**Sem pauta.**

**Com grupo grande.**

**Sem separar bloqueante de recomendação.**

**Como único mecanismo de governança** — revisão não escala, e é corretiva por natureza.

## Alternativas

- **[Funções de aptidão](fitness-functions-governance.md)** — para o que é verificável, mais
  barato e mais confiável.
- **Consulta voluntária** — sem agenda formal, sob demanda do time.
- **Revisão por pares entre times** — sem papel central, com efeito de disseminação.
- **Gabarito** — quando a decisão é recorrente, a revisão vira redundante.

A segunda tem uma propriedade útil: o volume de consultas voluntárias é um indicador direto
de que o mecanismo é percebido como útil.

## Trade-offs

| Aconselhamento | Portão |
|---|---|
| Trazido cedo | Trazido tarde |
| Melhora a decisão | Aprova o feito |
| Sem garantia | Com autoridade |
| Escala melhor | Vira fila |

| Síncrona | Assíncrona |
|---|---|
| Discussão viva | Escrita, citável |
| Cara em agenda | Latência maior |
| Boa para desacordo | Boa para contexto extenso |

## Modos de Falha

**Veto que empurra para tarde.**

**Taxa de aprovação altíssima.** Sinal de que só chega o inevitável.

**Comentários de peso desigual.** O time não sabe o que é obrigatório.

**Grupo grande.** Comentários de educação.

**Sem registro do desacordo.** Quando o risco se materializa, ninguém sabe que era previsto.

**Fila.** O mecanismo vira o gargalo que ele deveria evitar.

## Erros Comuns

**Pedir "o desenho pronto"** para revisar.

**Não perguntar ao time onde ele tem dúvida.**

**Misturar preferência com bloqueio.**

**Não registrar quando o time seguiu caminho diferente.**

**Medir a revisão pelo número de sessões**, e não pelo efeito nas decisões.

## Exemplo Real

Uma empresa de tecnologia em saúde tinha revisões de arquitetura obrigatórias antes do
início da implementação. Formato: apresentação de 45 minutos, oito participantes fixos,
decisão de aprovar ou pedir ajustes.

Uma medição de 14 meses:

```text
revisões realizadas                           96
aprovadas na primeira sessão                  81
tempo médio entre pedido e sessão         11 dias
comentários registrados por sessão            22 em média
comentários que geraram mudança                2,4 em média
casos em que o desenho já estava
  implementado ao chegar à revisão            37 (39%)
```

Os 37 casos foram investigados. O padrão nas entrevistas foi consistente: os times
implementavam antes porque **a revisão tinha poder de bloquear**, e chegar com algo
funcionando reduzia a chance de o bloqueio acontecer.

E os 22 comentários por sessão criavam outro problema: nenhum time sabia quais eram
obrigatórios. Três times relataram ter implementado todos os comentários por precaução,
incluindo preferências de estilo.

O redesenho:

**Revisão vira aconselhamento** para a maior parte das decisões. Sem aprovação, sem
bloqueio.

**Quatro classes com portão real**: implicação regulatória — relevante num contexto de dados
de saúde —, formato de dado entre times, compromisso financeiro acima de um limite, e
exposição pública nova.

**Sessão de 30 minutos com três participantes**, escolhidos por relevância e não por cargo.

**Pauta com item do time**: metade do tempo é dedicada às dúvidas que o time trouxe.

**Comentários classificados** em bloqueante, recomendação e preferência, com a preferência
explicitamente marcada como descartável.

**Registro de divergência**: quando o time segue caminho diferente do recomendado, isso vai
para o ADR, com a recomendação e a razão da divergência.

Dezesseis meses depois:

```text
consultas voluntárias                        188
revisões com portão                           29
tempo médio até a sessão                       2 dias
desenhos já implementados ao chegar            3 (10% das 29)
comentários bloqueantes por sessão            0,7 em média
casos de divergência registrada                14
casos em que a divergência se mostrou
  acertada, avaliados depois                    9
```

Os 9 casos em que o time acertou contra a recomendação foram usados internamente como
argumento para manter o modelo. A conclusão registrada: quem tem o contexto do problema
acerta mais que quem tem o contexto histórico — e o modelo de aconselhamento é o único que
permite descobrir isso.

Um efeito colateral: a taxa de comparecimento voluntário fez a área de arquitetura ganhar
informação que a revisão obrigatória não dava. Ao ser procurada cedo, ela passou a saber o
que estava sendo construído antes de estar construído.

## Conceitos Relacionados

- [Fundamentos de Governança](governance-basics.md) — o ponto de intervenção.
- [Revisão de Arquitetura](../15-enterprise-architecture/architecture-review.md) — formatos.
- [Patologias](governance-pathologies.md) — o comitê que aprova tudo.
- [Decisão](../18-architecture-decisions/adr-decision.md) — o registro da divergência.

## Exercício Prático

Meça a taxa de aprovação da revisão do seu contexto nos últimos 12 meses.

Acima de 90%, a revisão está recebendo apenas o inevitável — e o diagnóstico é sobre o
momento em que ela acontece, não sobre quem participa.

## Perguntas de Entrevista

- Por que poder de veto empurra a revisão para o fim do desenho?
- O que substitui a autoridade formal num modelo de aconselhamento?
- Por que separar bloqueante de preferência muda o comportamento dos times?

## Para Aprofundar

- Ford, Neal et al. *Building Evolutionary Architectures*. 2ª ed. O'Reilly, 2022.
- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
- Woods, Eoin. *Democratising Software Architecture*. IEEE Software, 2016.
