---
id: application-portfolios
title: Portfólio de Aplicações
sidebar_position: 8
description: O inventário do que existe, com as dimensões que permitem decidir o que fazer com cada coisa.
doc_type: concept
level: 6
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor avalia aplicações por valor e saúde, e decide entre manter,
  investir, substituir ou aposentar.
prerequisites: [business-capabilities]
related: [business-capabilities, current-state-architecture, integration-landscapes]
canonical_for: [portfólio de aplicações, avaliação de aplicação, aposentadoria de sistema]
content_version: 1
last_reviewed: 2026-08-28
---

# Portfólio de Aplicações

## Visão Geral

O portfólio é o inventário das aplicações da organização, com as informações que
permitem decidir o que fazer com cada uma.

A pergunta que ele responde não é "o que existe?" — é **"o que fazemos com cada
coisa?"**.

E ela se resume a quatro respostas: manter, investir, substituir, aposentar.

## Problema

Sem portfólio, as decisões sobre sistemas acontecem por reação: o sistema que quebra
recebe investimento; o que não incomoda é esquecido.

O resultado previsível:

```text
sistemas críticos negligenciados porque funcionam
sistemas que ninguém usa consumindo licença e infraestrutura
investimento distribuído por urgência, não por valor
duplicação invisível — dois sistemas fazendo a mesma coisa
ninguém sabe o custo total de propriedade de nada
```

E a decisão mais difícil — aposentar — praticamente nunca acontece, porque exige alguém
afirmar que algo pode ser desligado, com o risco associado.

## Conceitos Centrais

### As duas dimensões que decidem

```text
valor para o negócio   quanto a organização depende disto
saúde técnica          quão sustentável é manter
```

Cruzando as duas:

```text
alto valor, boa saúde    → manter e investir
alto valor, saúde ruim   → prioridade de modernização — o quadrante de risco
baixo valor, boa saúde   → manter com custo mínimo
baixo valor, saúde ruim  → aposentar
```

O segundo quadrante é o que a avaliação existe para encontrar. Ele contém o risco que
ninguém nomeou: sistemas de que o negócio depende, mantidos por poucas pessoas, com
tecnologia obsoleta — e que não geram incidentes suficientes para chamar atenção.

### O que compõe cada dimensão

```text
valor        criticidade para a operação
             capacidade de negócio que suporta
             número de usuários e de processos dependentes
             receita ou custo associado

saúde        idade e obsolescência tecnológica
             quantidade de pessoas que sabem manter
             frequência de incidentes
             facilidade de mudar — cobertura, acoplamento
             custo de operação
             suporte do fornecedor, se comprado
```

A segunda linha de saúde é a que costuma dominar o risco real e a que menos aparece em
avaliações técnicas: um sistema moderno com um único mantenedor é mais frágil que um
sistema antigo com cinco.

Ver [capacidades de negócio](business-capabilities.md) — o mapeamento a capacidades é o
que dá a dimensão de valor.

### Custo total, não custo de infraestrutura

```text
infraestrutura   servidores, licenças, armazenamento
manutenção       pessoas que dedicam tempo
integração       o custo de manter as conexões com outros sistemas
oportunidade     o que não é feito porque este sistema consome atenção
```

A terceira linha é frequentemente maior que a primeira e quase nunca é contabilizada: um
sistema com 15 integrações custa manutenção em 15 lugares, não só no dele.

Ver [paisagens de integração](integration-landscapes.md).

E o custo é o que torna a decisão de aposentar defensável: sem número, "vamos desligar"
é uma proposta de risco sem ganho visível.

### Aposentar é a decisão mais difícil e mais rentável

Ela enfrenta três obstáculos:

**Ninguém sabe quem usa.** A resposta é observar, não perguntar. Ver
[arquitetura do estado atual](current-state-architecture.md).

**O risco é assimétrico.** Desligar e quebrar algo é visível; manter ligado é invisível.

**Ninguém é dono da decisão.** O sistema não tem dono, e por isso ninguém pode
desligá-lo.

O que destrava:

```text
monitorar acesso por período longo — 90 a 180 dias
desligar gradualmente — reduzir capacidade, restringir acesso
período de suspensão — desligado, recuperável, antes de descartar
comunicação ampla — quem depende tem chance de aparecer
```

O período de suspensão é o mecanismo que reduz o risco a um nível aceitável: desligado
por 60 dias, com a possibilidade de religar em minutos, resolve a assimetria.

### A avaliação precisa ser feita com o negócio

A dimensão de valor não é avaliável pela engenharia. Um sistema que parece marginal
tecnicamente pode ser o que sustenta o processo mais crítico.

E o inverso: um sistema que consome muita atenção da engenharia pode ser irrelevante
para o negócio — e essa constatação, feita conjuntamente, é o que autoriza reduzir o
investimento nele.

### O portfólio precisa ser derivado onde possível

```text
derivado      inventário, custo, versões, incidentes, uso
julgamento    valor, criticidade, saúde qualitativa, propriedade
```

Ver [arquitetura do estado atual](current-state-architecture.md). O que é derivado se
mantém; o que exige julgamento é revisado periodicamente, e muda devagar.

Um portfólio inteiramente preenchido à mão desatualiza em meses.

### A avaliação precisa acontecer periodicamente

Um portfólio avaliado uma vez descreve um momento. As duas dimensões mudam em ritmos
diferentes:

```text
valor       muda devagar — com estratégia de negócio, não com trimestre
saúde       muda continuamente — pessoas saem, tecnologia envelhece, dívida acumula
```

A saúde é a que degrada silenciosamente. Um sistema que estava no quadrante confortável
há dois anos pode ter perdido dois dos três mantenedores desde então, sem que nada tenha
gerado alerta.

A revisão anual das duas dimensões, com a de saúde revisitada semestralmente, é o que
mantém o portfólio informativo. E parte dela pode ser derivada — frequência de
incidentes, idade de dependências, número de pessoas que enviaram mudanças no último ano.

Essa última métrica é um indicador barato e surpreendentemente confiável de concentração
de conhecimento, e ela sai do histórico do repositório sem entrevistar ninguém.

## Modelo Mental

**Valor e saúde decidem o que fazer.** O quadrante de alto valor com saúde ruim é o
risco que ninguém nomeou.

## Quando Usar

- Priorização de investimento em tecnologia.
- Identificação de risco de obsolescência.
- Decisões de aposentadoria.
- Após aquisições, para consolidar.
- Discussões de orçamento com o negócio.

## Quando Não Usar

**Avaliando valor sem o negócio.**

**Considerando só custo de infraestrutura.**

**Preenchido inteiramente à mão.**

**Sem dimensão de pessoas** na avaliação de saúde.

**Como exercício único**, sem revisão.

**Desligando sem período de suspensão.**

## Alternativas

- **[Capacidades de negócio](business-capabilities.md)** — a lente de negócio, sem o
  detalhe por aplicação.
- **Catálogo de serviços** — derivado, técnico, sem avaliação. Ver
  [plataformas internas](../14-devops-and-platform/internal-developer-platforms.md).
- **Avaliação sob demanda** — avaliar apenas o que está em discussão, em vez de tudo.

A última é econômica: um portfólio completo de 200 aplicações custa caro para manter, e
a maior parte das decisões envolve poucas delas por vez.

## Trade-offs

| Portfólio completo | Avaliação sob demanda |
|---|---|
| Visão do conjunto | Foco |
| Custo de manter | Baixo |
| Encontra o não procurado | Só o que se olha |

| Derivado | Julgado |
|---|---|
| Sempre atual | Envelhece |
| Limitado ao mensurável | Captura valor e risco |

## Modos de Falha

**Sistema crítico invisível.** Funciona, ninguém olha, e o mantenedor sai.

**Aposentadoria que nunca acontece.**

**Avaliação sem o negócio.** Valor estimado pela engenharia.

**Custo subestimado.** Só infraestrutura contabilizada.

**Portfólio desatualizado.** Decisões sobre uma realidade antiga.

**Desligamento que quebra.** Consumidor desconhecido.

## Erros Comuns

**Não incluir pessoas na avaliação de saúde.**

**Não contabilizar custo de integração.**

**Avaliar sozinho.**

**Não observar o uso real antes de aposentar.**

**Não ter período de suspensão.**

**Preencher tudo à mão.**

## Exemplo Real

Uma empresa de serviços financeiros tinha 210 aplicações e nenhuma visão consolidada.

A avaliação levou dez semanas, com valor definido pelas áreas de negócio e saúde pela
engenharia.

O resultado por quadrante:

```text
alto valor, boa saúde     58 aplicações
alto valor, saúde ruim    31   ← o quadrante de risco
baixo valor, boa saúde    77
baixo valor, saúde ruim   44   ← candidatas a aposentadoria
```

Três achados:

**O quadrante de risco.** Das 31, oito tinham um único mantenedor, e três tinham
mantenedor com aposentadoria prevista em menos de dois anos. Nenhuma delas gerava
incidentes — elas funcionavam, e por isso eram invisíveis.

**Custo de integração.** As 210 aplicações tinham 1.400 integrações. Uma aplicação de
baixo valor no quadrante inferior tinha 38 integrações — o custo de mantê-la era muito
maior que o custo de infraestrutura dela.

**Aplicações sem uso.** O monitoramento de acesso por 120 dias mostrou que 23 das 44
candidatas não tinham nenhum acesso humano, e 9 não tinham nenhum acesso.

O processo de aposentadoria:

**Comunicação ampla** por 30 dias, com a lista publicada.

**Restrição gradual** de acesso, com alerta a quem tentasse.

**Suspensão** de 90 dias, desligado e recuperável.

**Descarte** após o período, com os dados arquivados conforme a retenção regulatória.

Das 44 candidatas, 31 foram aposentadas. Sete revelaram consumidores durante o período de
restrição — todos identificados sem incidente, porque o acesso restrito alertava em vez
de falhar. Seis foram mantidas por requisito regulatório de retenção.

Economia direta: licenças e infraestrutura das 31. Economia indireta, maior: 290
integrações a menos para manter.

E o quadrante de risco virou o plano de modernização de dois anos, com transferência de
conhecimento como primeira etapa nas oito de mantenedor único.

O que a equipe registra: as 31 aplicações do quadrante de risco eram conhecidas
individualmente por várias pessoas. Nenhuma tinha aparecido numa discussão de prioridade,
porque nenhuma estava quebrando.

## Conceitos Relacionados

- [Capacidades de Negócio](business-capabilities.md) — a dimensão de valor.
- [Arquitetura do Estado Atual](current-state-architecture.md).
- [Paisagens de Integração](integration-landscapes.md) — o custo escondido.
- [Modernização de Legado](../16-legacy-modernization/index.md).

## Exercício Prático

Escolha cinco sistemas da sua organização e responda, para cada um: quantas pessoas
sabem mantê-lo?

Cruze com a criticidade. Os críticos com uma ou duas pessoas são o seu quadrante de
risco.

## Perguntas de Entrevista

- Quais duas dimensões decidem o que fazer com uma aplicação?
- Por que o quadrante de alto valor com saúde ruim é invisível?
- O que destrava a decisão de aposentar?

## Para Aprofundar

- Ross, Jeanne et al. *Enterprise Architecture as Strategy*. HBS Press, 2006.
- Gartner. *TIME model* — tolerar, investir, migrar, eliminar.
- Open Group. *TOGAF Standard* — arquitetura de aplicação.
