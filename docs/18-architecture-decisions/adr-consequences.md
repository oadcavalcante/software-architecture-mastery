---
id: adr-consequences
title: Consequências
sidebar_position: 7
description: O que passa a ser verdade depois da decisão — incluindo o que piora.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor registra consequências verificáveis, com o custo aceito nomeado e
  o sinal que indicaria que a decisão foi errada.
prerequisites: [adr-structure]
related: [adr-decision, adr-alternatives, superseding-decisions]
canonical_for: [consequência de decisão, custo aceito, sinal de alerta de decisão]
content_version: 1
last_reviewed: 2026-08-29
---

# Consequências

## Visão Geral

A seção de consequências registra **o que passa a ser verdade** depois da decisão. Não o
que se espera, não o que se pretende — o que muda.

E a propriedade que separa um ADR honesto de uma peça de convencimento cabe numa regra:
**toda decisão arquitetural tem consequências negativas, e um ADR que não as nomeia não
pensou nelas.**

Há ainda um conteúdo que quase nunca aparece e vale mais que o resto: **o sinal que
indicaria que a decisão foi errada.**

## Problema

A seção de consequências típica:

```text
"Com esta decisão, o sistema ganha escalabilidade, desacoplamento e
melhor manutenibilidade."
```

Três problemas de uma vez. Nada é verificável — não há número nem prazo. Nada é negativo —
como se a decisão fosse gratuita. E nada distingue esta decisão de qualquer outra.

O efeito prático aparece depois: quando o custo se materializa — a operação de uma fila,
a latência adicional, a complexidade de depuração — ninguém sabe se ele era previsto ou
se algo deu errado. Sem registro, custo previsto e falha se confundem.

## Conceitos Centrais

### Quatro categorias

```text
positivas   o que a decisão viabiliza
negativas   o custo aceito conscientemente
neutras     o que muda sem melhorar nem piorar
riscos      o que pode dar errado, com probabilidade e sinal
```

As neutras são subestimadas: "o time precisa aprender X", "a esteira ganha uma etapa", "o
ambiente local passa a exigir um contêiner a mais". Nenhuma é ruim; todas são reais e
mudam o dia a dia.

### Negativas são obrigatórias

Um ADR sem consequência negativa está numa de duas situações: a decisão é trivial e não
merecia ADR, ou o autor está vendendo.

```text
adotar fila            → latência maior, ordem não garantida, mais uma peça
                         para operar, depuração mais difícil
separar um serviço     → chamada de rede onde havia chamada local,
                         transação distribuída, mais um implantável
escolher banco novo    → time sem experiência, migração, ferramental a construir
manter o monólito      → limite de escala por componente, implantação acoplada
```

Note que a última linha registra as consequências de **não** mudar. Decisões de manter
também têm custo.

### Verificável, não adjetivo

```text
ruim   "melhora a escalabilidade"
bom    "permite processar picos de 400/s sem degradar a resposta síncrona,
       que hoje satura em 120/s"

ruim   "aumenta a complexidade"
bom    "acrescenta um componente a operar: fila com monitoração,
       alarme de acúmulo e política de mensagens não processáveis"
```

O critério: alguém consegue verificar, daqui a um ano, se isso aconteceu?

### O sinal de que a decisão foi errada

O conteúdo mais valioso e o mais raro:

```text
"Se o acúmulo na fila passar de 5 minutos de forma recorrente, a premissa
de que o processamento assíncrono absorve os picos estará errada."

"Se a equipe gastar mais de 20% do tempo operando o cluster, o custo
operacional excedeu o previsto."

"Se em 12 meses menos de três serviços tiverem adotado o padrão, a
premissa de reuso não se confirmou."
```

Isso transforma a decisão em algo com **teste**. Sem esse sinal, uma decisão errada
permanece indefinidamente, porque ninguém definiu o que contaria como evidência contrária.

E o sinal costuma ser diretamente instrumentável. Ver
[observabilidade](../13-observability/index.md).

### Consequências acontecem no tempo

Elas não são simultâneas, e distingui-las evita conclusões precipitadas:

```text
imediatas       o que muda ao implantar
de curto prazo  semanas — aprendizado, ajustes, primeiros incidentes
de longo prazo  meses ou anos — custo operacional acumulado, acoplamento
```

O padrão frequente: benefícios imediatos, custos de longo prazo. É o perfil de quase toda
decisão que parece boa e envelhece mal, e nomear o horizonte é o que permite avaliá-la no
momento certo.

### O que fica mais difícil de mudar

Uma consequência específica que merece registro próprio: o que a decisão **fecha**.

```text
"Depois desta migração, voltar ao modelo anterior exige reprocessar
o histórico — estimado em 3 semanas."

"O formato de evento publicado passa a ser consumido por sistemas
externos; alterá-lo passará a exigir versionamento e período de
coexistência."
```

Isso é a reversibilidade da decisão registrada como consequência, e é o que informa quem
vier depois sobre o custo real de mudar de ideia. Ver
[contexto](adr-context.md).

### Consequências não previstas, depois

Alguns times acrescentam, meses depois, uma subseção com o que efetivamente aconteceu.

Isso tensiona a imutabilidade do ADR e, feito com cuidado, é o registro mais valioso do
conjunto: a comparação entre o previsto e o observado é o que calibra o julgamento da
equipe.

A forma que preserva a imutabilidade: um bloco datado e claramente marcado como
posterior, sem alterar o texto original.

### Consequências para quem não está na sala

Um conjunto de consequências que autores técnicos sistematicamente omitem: as que recaem
sobre outras pessoas.

```text
produto        um fluxo que era síncrono passa a ter estado intermediário
suporte        uma categoria nova de chamado — "meu pedido está processando"
operação       mais um componente no plantão, com procedimento próprio
segurança      uma superfície nova, com revisão a fazer
finanças       um custo recorrente que não existia
```

Registrá-las tem dois efeitos. Elas viram trabalho previsto em vez de surpresa — a tela de
"em processamento" e o texto de suporte passam a ter dono e prazo. E elas expõem decisões
cujo custo total é maior que o avaliado, porque parte dele estava sendo empurrada para
fora da equipe que decidia.

## Modelo Mental

**O que piora, e o sinal de que erramos.** Uma seção só com benefícios é publicidade.

## Quando Usar

- Em todo ADR.
- Com ao menos uma consequência negativa nomeada.
- Com sinal de alerta quando a decisão tiver premissa quantificável.

## Quando Não Usar

**Só com positivas.**

**Com adjetivos** em vez de números.

**Genéricas** — "aumenta a complexidade" serve a qualquer decisão.

**Sem horizonte de tempo**, quando custo e benefício ocorrem em momentos diferentes.

**Sem o que fica mais difícil de mudar**, em decisões custosas de reverter.

## Alternativas

- **Tabela de prós e contras** — mais compacta, perde nuance de horizonte.
- **Lista de riscos com probabilidade e impacto** — quando o risco domina.
- **Métricas de acompanhamento** — em vez de prosa, declarar o que será medido.

A última é a mais forte quando aplicável: "vamos acompanhar o acúmulo da fila e o tempo de
operação mensal" é mais acionável que qualquer parágrafo.

## Trade-offs

| Consequências detalhadas | Resumidas |
|---|---|
| Verificáveis depois | Rápidas de escrever |
| Expõem o custo | Menos atrito na aprovação |
| Permitem avaliar a decisão | Só documentam |

| Com sinal de alerta | Sem |
|---|---|
| Decisão testável | Decisão permanente por omissão |
| Exige premissa explícita | Menos exposição |
| Instrumentável | Nada a medir |

## Modos de Falha

**Só positivas.** ADR de convencimento.

**Adjetivos.** Nada verificável.

**Custo previsto confundido com falha.** Sem registro, todo custo parece erro.

**Sem sinal de alerta.** A decisão nunca é avaliada.

**Sem horizonte.** Benefício imediato mascarando custo de longo prazo.

**Genéricas.** Serviriam a qualquer decisão.

## Erros Comuns

**Escrever consequências como argumentos** a favor da decisão.

**Omitir o custo operacional** — a consequência mais frequentemente esquecida.

**Não nomear o que fica mais difícil de mudar.**

**Não instrumentar o sinal de alerta**, deixando-o como texto.

**Editar as consequências depois** em vez de acrescentar bloco datado.

## Exemplo Real

Uma empresa de telecomunicações adotou, em 2022, um barramento de eventos corporativo. O
ADR registrava sete consequências, todas positivas: desacoplamento, escalabilidade,
rastreabilidade, reuso, resiliência, evolução independente e observabilidade.

Em 2024, o barramento era o componente com mais incidentes da organização, e uma revisão
levantou o que tinha efetivamente acontecido:

```text
previsto no ADR                      observado
desacoplamento                       parcial — esquemas viraram acoplamento
escalabilidade                       confirmado
rastreabilidade                      confirmado, após 8 meses de trabalho extra
reuso                                3 de 18 tipos de evento reusados
resiliência                          o barramento virou ponto único de falha
evolução independente                bloqueada por esquemas compartilhados
observabilidade                      pior que antes nos primeiros 12 meses
```

Nenhuma das consequências negativas reais estava registrada:

```text
uma equipe dedicada de 3 pessoas para operar
depuração de fluxos assíncronos exigindo ferramental novo
esquemas de evento viraram contratos públicos, difíceis de alterar
custo de infraestrutura 4× a estimativa inicial
```

O problema não foi a decisão — o barramento resolveu problemas reais. Foi que **nada tinha
sido registrado como custo aceito**, então cada custo apareceu como falha, gerando pressão
para reverter uma decisão que continuava correta.

O que mudou na prática de ADRs:

**Consequências negativas obrigatórias**, com no mínimo uma. ADR sem custo nomeado é
devolvido.

**Sinal de alerta obrigatório** para decisões com premissa quantificável, instrumentado
como painel ou alarme quando possível.

**Horizonte declarado** por consequência: imediata, curto ou longo prazo.

**Bloco de revisão datado**, acrescentado 12 meses depois, comparando previsto e observado
— sem alterar o texto original.

Esse último ponto produziu o efeito mais interessante. Depois de dois anos de revisões, um
padrão ficou visível nos ADRs da organização:

```text
benefícios previstos que se confirmaram        68%
custos previstos que se confirmaram            91%
custos não previstos que apareceram            1,8 por ADR em média
```

A equipe passou a usar esses números como calibração: benefícios previstos são otimistas,
custos previstos são conservadores, e sempre há custos não previstos.

Na retrospectiva: os blocos de revisão a 12 meses foram o artefato mais lido do
conjunto — mais que os próprios ADRs. Eles ensinam algo que nenhum ADR isolado ensina.

## Conceitos Relacionados

- [Decisão](adr-decision.md) — o que gera as consequências.
- [Alternativas](adr-alternatives.md) — as consequências não escolhidas.
- [Superação](superseding-decisions.md) — quando o sinal de alerta dispara.
- [Observabilidade](../13-observability/index.md) — como instrumentar o sinal.

## Exercício Prático

Pegue um ADR do seu time e escreva a frase: "saberemos que esta decisão foi errada se ___".

Depois verifique se esse sinal é medido hoje. Se não for, a decisão não pode ser avaliada.

## Perguntas de Entrevista

- Por que um ADR sem consequências negativas é suspeito?
- O que acontece quando um custo previsto não é registrado?
- Como um bloco de revisão posterior preserva a imutabilidade do ADR?

## Para Aprofundar

- Nygard, Michael. *Documenting Architecture Decisions*. 2011.
- Ford, Neal et al. *Software Architecture: The Hard Parts*. O'Reilly, 2021.
- Kahneman, Daniel. *Thinking, Fast and Slow*. Farrar, Straus and Giroux, 2011.
