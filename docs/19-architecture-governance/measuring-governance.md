---
id: measuring-governance
title: Medição de Governança
sidebar_position: 10
description: Medir o efeito e o atrito — sem os dois números, todo mecanismo parece justificado.
doc_type: concept
level: 6
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor mede efeito e custo de cada mecanismo de governança, e usa os dois
  para decidir manter, ajustar ou remover.
prerequisites: [governance-basics]
related: [governance-pathologies, compliance, governance-basics]
canonical_for: [atrito medido, efeito de mecanismo, indicador de governança, risco evitado]
content_version: 1
last_reviewed: 2026-08-29
---

# Medição de Governança

## Visão Geral

Governança é a única área da engenharia em que mecanismos são criados sem nenhuma medição e
mantidos indefinidamente sem nenhuma evidência.

A razão é estrutural: o **efeito** de um mecanismo é um evento que não aconteceu, e o
**custo** está distribuído em pequenos atrasos que ninguém soma. Os dois lados da conta são
invisíveis, e uma conta invisível é sempre favorável ao que já existe.

Medir governança é tornar os dois lados visíveis:

```text
efeito   o que foi evitado, quantas vezes
atrito   quanto atraso e esforço custou, agregado
```

Sem os dois números, a discussão sobre manter ou remover é decidida por quem tem mais
autoridade — o que é a definição de uma das [patologias](governance-pathologies.md).

## Problema

O argumento típico a favor de um mecanismo é contrafactual:

```text
"sem essa revisão, teríamos problemas sérios"
```

A frase não é verificável nem refutável. E ela vence qualquer proposta de remoção, porque o
ônus da prova recai sobre quem quer remover.

Do outro lado, o custo:

```text
26 dias de espera média × 80 projetos por ano
= ~5,7 anos-pessoa de calendário
```

Esse número existe e quase nunca é calculado. Quando é, a discussão muda de natureza.

E há uma armadilha de medição própria da área: medir atividade em vez de efeito. Número de
revisões realizadas, padrões publicados, sessões de comitê — todos crescem com o esforço e
nenhum informa se algo melhorou.

## Conceitos Centrais

### Efeito: o que foi evitado

```text
quantas vezes o mecanismo mudou uma decisão em 12 meses
quantas vezes detectou algo que teria causado dano
incidentes na classe de risco que ele endereça, antes e depois
divergências evitadas, mensuráveis
```

O primeiro é o mais fácil e o mais revelador. Uma revisão que não mudou nenhuma decisão em
um ano não está produzindo efeito, independentemente de quantas sessões realizou.

E ele precisa ser registrado no momento — reconstruir depois é impossível. Ver
[revisão](governance-review.md), onde a separação entre bloqueante e recomendação já produz
esse dado.

### Atrito: o custo agregado

```text
tempo de espera médio × volume
esforço de preparação por ocorrência × volume
retrabalho causado por decisão tardia
decisões adiadas ou não tomadas por causa do custo do processo
```

O último item é o mais caro e o único não observável diretamente. Ele aparece em pesquisa
com os times, com uma pergunta específica: **você já deixou de propor algo por causa do
processo?**

### Meça a taxa, não o total

```text
número de revisões realizadas       cresce com o esforço, não informa
taxa de aprovação sem alteração     informa se o mecanismo pega algo
número de padrões publicados        atividade
taxa de adoção medida               efeito
sessões de comitê                   atividade
decisões alteradas por sessão       efeito
```

A coluna da esquerda é o que aparece em relatórios de governança. A da direita é o que
permite decidir.

### Indicadores que funcionam

```text
taxa de aprovação sem alteração      acima de 90% → intervém tarde demais
tempo de espera médio                 o custo direto
razão exceção/desvio silencioso       quanto do descumprimento é invisível
adoção medida por padrão              publicado contra seguido
consultas voluntárias                 percepção de utilidade
tempo entre desvio e correção         eficácia da detecção
mecanismos removidos por ano          existe processo de remoção?
```

O terceiro é o mais informativo e o menos usado: comparar exceções registradas com desvios
que uma verificação técnica encontraria mede diretamente a visibilidade da governança. Ver
[exceções](exceptions.md).

O último é um indicador sobre o sistema de governança, não sobre um mecanismo — e é o que
melhor prevê acumulação.

### O contrafactual pode ser testado

O argumento "sem isto teríamos problemas" é testável por suspensão:

```text
suspender por um trimestre
observar a classe de risco que o mecanismo endereça
comparar com o período anterior
```

Isso exige tolerância a risco e é aplicável apenas onde a consequência de uma falha é
recuperável — nunca em requisito regulatório ou controle de segurança crítico.

Onde é aplicável, produz evidência que nenhuma análise produz.

### Medir também o que a ausência custa

A simetria importa. Uma organização que só mede atrito conclui que toda governança deve ser
removida.

```text
incidentes com causa em divergência entre times
retrabalho de integração
tempo gasto redecidindo o já decidido
lições redescobertas por incidente
custo operacional de tecnologias duplicadas
```

Esses números justificam governança tanto quanto os anteriores a condenam, e uma decisão
honesta precisa dos dois conjuntos.

### Perguntar aos times, com pergunta específica

```text
ruim   "a governança atrapalha?"
bom    "nos últimos 6 meses, quantas vezes você esperou mais de uma semana
       por uma aprovação arquitetural?"
bom    "você já deixou de propor uma mudança por causa do processo?"
bom    "cite um mecanismo que você considera útil, e por quê"
```

A última é a mais informativa. Mecanismos que ninguém consegue defender espontaneamente são
candidatos a revisão, e mecanismos citados por vários times merecem ser preservados quando o
corte vier.

## Modelo Mental

**Efeito e atrito, os dois em número.** Com um só, a discussão é decidida por autoridade.

## Quando Usar

- Ao criar qualquer mecanismo — definir a medida antes.
- Em revisão periódica do conjunto.
- Quando há reclamação difusa de burocracia.
- Antes de propor remoção.

## Quando Não Usar

**Medindo atividade.**

**Só o atrito** — leva a remover tudo.

**Só o efeito** — leva a manter tudo.

**Com contrafactual não testado**, quando o teste seria viável.

**Sem perguntar aos times.**

**Suspendendo controle regulatório ou de segurança crítica** para testar.

## Alternativas

- **Suspensão temporária** — evidência em vez de medida.
- **Pesquisa qualitativa** — mais rápida, menos precisa, frequentemente suficiente.
- **Auditoria de amostra** — para estimar efeito onde a medição contínua é cara.
- **Indicadores de entrega** — tempo de ciclo e frequência de implantação capturam o atrito
  agregado sem atribuí-lo a um mecanismo. Ver
  [entrega contínua](../14-devops-and-platform/ci-cd.md).

A última é útil como sinal geral: se o tempo de ciclo cresce sem causa técnica, governança é
um suspeito.

## Trade-offs

| Medir | Não medir |
|---|---|
| Decisão com evidência | Nenhum custo de medição |
| Custo de instrumentação | Decisão por autoridade |
| Expõe o inútil | Preserva o status quo |

| Suspender e observar | Analisar |
|---|---|
| Conclusivo | Sem risco |
| Exige tolerância | Inconclusivo |
| Rápido | Indefinido |

## Modos de Falha

**Medir atividade.** Números que crescem com o esforço.

**Só um lado da conta.** Conclusão predeterminada.

**Contrafactual não testado.** Argumento irrefutável.

**Medição sem consequência.** Relatório que não muda nada.

**Perguntas vagas aos times.** Respostas vagas.

**Não medir o custo da ausência.** Remoção excessiva.

## Erros Comuns

**Criar mecanismo sem definir como medi-lo.**

**Não registrar quando uma revisão mudou uma decisão** — o dado que não se coleta na hora se
perde.

**Comparar organizações** em vez de comparar a mesma organização ao longo do tempo.

**Não somar o atrito** — cada espera parece pequena isoladamente.

**Não medir mecanismos removidos por ano.**

## Exemplo Real

Uma empresa de energia com 220 engenheiros instituiu medição de governança depois de uma
discussão que se repetia havia dois anos: a área de arquitetura defendia os mecanismos
existentes, os times de produto pediam sua remoção, e nenhum lado tinha número.

O que passou a ser medido, por mecanismo:

```text
efeito     decisões alteradas em 12 meses, registradas no momento
           itens detectados que teriam causado dano
atrito     tempo de espera médio × volume anual
           esforço de preparação estimado × volume
ausência   incidentes na classe de risco endereçada
```

Após 12 meses de coleta, sobre 14 mecanismos:

```text
mecanismo                     efeito/ano   atrito/ano      decisão
revisão de segurança             19 itens    ~40 dias       manter
revisão de dados compartilhados  11 dec.     ~55 dias       manter
comitê de arquitetura             3 dec.    ~410 dias       reformular
aprovação de nova tecnologia      7 dec.    ~120 dias       reduzir escopo
relatório mensal de aderência     0          ~90 dias       remover
formulário de impacto              1        ~180 dias       remover
verificação de licenças          14 itens     ~2 dias       manter
... (7 outros)
```

O contraste entre a terceira e a última linha foi o que mudou a conversa. A verificação
automática de licenças pegava 14 itens por ano com atrito quase nulo; o comitê de
arquitetura alterava 3 decisões por ano ao custo de mais de um ano-pessoa de espera.

Nenhum dos dois lados da discussão anterior tinha esses números.

As decisões:

**Dois mecanismos removidos** — o relatório mensal, que ninguém lia, e o formulário de
impacto, cujo único efeito registrado em 12 meses foi apontar um erro que a esteira também
teria pego.

**Comitê reformulado** para aconselhamento, com portão em três classes. Ver
[revisão](governance-review.md).

**Aprovação de nova tecnologia** restrita a tecnologias que entram no plantão compartilhado
— antes valia para qualquer biblioteca.

**Sete mecanismos convertidos em verificação automática**, escolhidos pela razão entre
atrito e efeito.

**Regra permanente**: nenhum mecanismo novo é criado sem definição prévia de como seu efeito
será medido, e nenhum sobrevive a dois anos sem evidência de efeito.

Dezoito meses depois:

```text
mecanismos                                  14 → 9
atrito agregado                             de ~900 para ~220 dias/ano
efeito agregado registrado                  de 55 para 71 itens/ano
incidentes nas classes de risco endereçadas  estável
tempo de ciclo de projetos arquiteturais     -38%
```

O efeito **subiu** enquanto o atrito caiu em 75%. A explicação registrada: os mecanismos
convertidos em verificação automática pegam mais que os equivalentes manuais, porque rodam
sempre.

O que a equipe registra: a discussão de dois anos terminou em uma reunião, quando a tabela
foi apresentada. Não houve argumento novo — houve número.

## Conceitos Relacionados

- [Patologias](governance-pathologies.md) — o que a medição diagnostica.
- [Fundamentos de Governança](governance-basics.md) — custo declarado por mecanismo.
- [Conformidade](compliance.md) — a medição do estado.
- [Exceções](exceptions.md) — a razão entre exceção e desvio silencioso.

## Exercício Prático

Escolha um mecanismo de governança do seu contexto e calcule o atrito anual: tempo de espera
médio multiplicado pelo volume.

Depois pergunte a quem o opera quantas vezes ele mudou uma decisão no último ano. Os dois
números levam menos de uma hora para obter, e quase nunca foram obtidos.

## Perguntas de Entrevista

- Por que o argumento "sem isto teríamos problemas" é difícil de refutar, e como testá-lo?
- Qual a diferença entre medir atividade e medir efeito em governança?
- Por que medir só o atrito leva a uma conclusão errada?

## Para Aprofundar

- Forsgren, Nicole et al. *Accelerate*. IT Revolution, 2018.
- Ford, Neal et al. *Building Evolutionary Architectures*. 2ª ed. O'Reilly, 2022.
- Hubbard, Douglas. *How to Measure Anything*. 3ª ed. Wiley, 2014.
