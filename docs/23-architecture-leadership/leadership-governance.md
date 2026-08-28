---
id: leadership-governance
title: Governança sob a Ótica de Quem Estabelece
sidebar_position: 11
description: Desenhar mecanismos com dono, custo declarado e data de validade — e ter processo para removê-los.
doc_type: concept
level: 7
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor desenha um mecanismo de governança com dono, medida e prazo, e institui
  a prática de remover mecanismos.
prerequisites: [architecture-leadership-basics]
related: [leadership-principles, leadership-standards, fitness-functions]
canonical_for: [desenho de mecanismo de governança, validade de mecanismo, meta de remoção]
content_version: 1
last_reviewed: 2026-08-29
---

# Governança sob a Ótica de Quem Estabelece

## Visão Geral

O [nível anterior](../19-architecture-governance/index.md) descreve como a governança opera. Este
documento trata de quem a **cria** — e a diferença é grande, porque o criador tem uma
responsabilidade que o operador não tem:

```text
operar   fazer o mecanismo funcionar
criar    decidir se ele deve existir, e por quanto tempo
```

Toda organização tem processo para adicionar mecanismos: um incidente acontece, cria-se um
controle. Quase nenhuma tem processo para removê-los — e essa assimetria é a causa de toda
acumulação de burocracia.

```text
adicionar   tem dono, urgência e um incidente para justificar
remover     não tem dono, é politicamente arriscado, e o
            benefício é difuso
```

Quem estabelece governança precisa desenhar a segunda metade também.

## Problema

O mecanismo típico nasce assim:

```text
incidente     um serviço foi para produção sem revisão de segurança
resposta      toda entrega passa a exigir aprovação de segurança
resultado     três anos depois, 400 aprovações por ano, das quais
              duas encontraram algo
```

A resposta original era proporcional ao incidente. Ela deixou de ser proporcional quando a
organização construiu verificação automática de segurança e ninguém revisitou o mecanismo manual.

E há um segundo padrão: o mecanismo criado sem medida. Ele não pode ser avaliado, porque nunca se
definiu o que ele deveria produzir — e sem isso, a discussão sobre mantê-lo é sobre opinião.

## Conceitos Centrais

### Todo mecanismo nasce com quatro campos

```text
o risco que ele endereça       específico, não categoria
como o efeito será medido      quantas vezes ele pegou algo
o custo estimado               atraso médio × volume
o dono                         papel, não área
a data de validade             no máximo 24 meses
```

Os dois últimos são os que faltam em quase todo mecanismo existente. Sem dono, ele não é ajustado;
sem validade, ele é permanente por omissão.

Ver [medição de governança](../19-architecture-governance/measuring-governance.md).

### Escolha o ponto de intervenção mais cedo viável

Antes de criar um mecanismo humano, a pergunta:

```text
"isto pode ser impedido no ambiente ou no gabarito, em vez
 de verificado por alguém?"
```

```text
no ambiente     o caminho errado não existe
no gabarito     nasce correto
na esteira      falha automaticamente
em revisão      alguém percebe
em comitê       alguém percebe semanas depois
```

Um mecanismo humano criado quando um automático era viável custa para sempre. Ver
[fundamentos de governança](../19-architecture-governance/governance-basics.md).

### Meta de remoção anual

A intervenção estrutural que resolve a acumulação:

```text
"removemos ao menos um mecanismo por ano"
```

Isso dá dono ao ato de remover, que era o que faltava. E força a revisão do conjunto, porque
escolher qual remover exige olhar todos.

Uma organização que nunca removeu um mecanismo tem, com alta probabilidade, mais mecanismos do
que precisa — e o diagnóstico independe de qual deles se examine primeiro.

### Suspender é melhor que discutir

```text
discutir se um mecanismo é necessário   argumentos indefinidos
suspendê-lo por um trimestre            evidência em três meses
```

A suspensão temporária é o instrumento mais eficaz e o mais difícil de conseguir autorização para
usar. Ela produz evidência que nenhuma análise produz, e é aplicável a tudo exceto controles
regulatórios e de segurança crítica.

### Proporcionalidade ao risco, sempre

```text
sistema crítico regulado     mecanismo pesado se justifica
ferramenta interna de uso
  ocasional                  o mesmo mecanismo é desperdício
```

Aplicar governança uniforme é o erro que consome a paciência da organização em casos irrelevantes
— e a paciência acaba justamente quando um caso importante aparece.

Escalonar por criticidade exige uma classificação que já deveria existir por outros motivos:
recuperação de desastre, resposta a incidente, controle de acesso.

### Quem cria precisa operar por um tempo

Uma prática incomum e reveladora: quem propõe um mecanismo o opera pelos primeiros meses.

Isso produz duas coisas. O custo do mecanismo fica visível para quem o criou, e não apenas para
quem o sofre. E o desenho melhora rápido, porque quem sente o atrito tem incentivo e autoridade
para ajustá-lo.

A prática também corrige uma assimetria comum: mecanismos costumam ser propostos por quem responde
por um risco e operados por quem responde por entrega, o que separa quem decide o custo de quem
paga. Juntar os dois papéis por alguns meses é a intervenção mais barata contra propostas
desproporcionais, e ela não exige processo nenhum — apenas a regra.

### Governança boa é invisível

```text
mecanismo visível     alguém precisa fazer algo a mais
mecanismo invisível   o caminho fácil já é o correto
```

O objetivo de quem estabelece governança deveria ser tornar os mecanismos desnecessários — movendo
o que eles verificam para dentro da plataforma, do gabarito e da esteira.

Uma área de governança cujo sucesso é medido por número de mecanismos operados tem o incentivo
invertido. Ver
[engenharia de plataforma](../14-devops-and-platform/platform-engineering.md).

## Modelo Mental

**Todo mecanismo nasce com dono, medida e validade.** E a organização precisa de uma meta de
remoção, porque adicionar tem dono e remover não tem.

## Quando Usar

- Ao criar qualquer mecanismo de governança.
- Na revisão periódica do conjunto.
- Antes de responder a um incidente com um controle novo.

## Quando Não Usar

**Sem dono, medida e validade.**

**Quando o ponto de intervenção automático era viável.**

**Uniformemente**, sem escalonar por criticidade.

**Sem processo de remoção.**

**Criando mecanismo** como resposta reflexa a incidente.

## Alternativas

- **Plataforma** — mover a propriedade para o caminho pavimentado, eliminando o mecanismo.
- **Função de aptidão** — verificação automática em vez de humana. Ver
  [funções de aptidão](fitness-functions.md).
- **Registro sem aprovação** — para riscos baixos, visibilidade basta.
- **Nada** — aceitar o risco formalmente é uma resposta legítima. Ver
  [gestão de risco](risk-management.md).

## Trade-offs

| Mecanismo formal | Plataforma |
|---|---|
| Rápido de instituir | Caro de construir |
| Custo permanente de atrito | Custo único |
| Contornável | Invisível e efetivo |

| Validade curta | Longa |
|---|---|
| Revisão frequente | Menos overhead |
| Custo de renovar | Permanência por omissão |

## Modos de Falha

**Acumulação.** Adicionar tem dono, remover não.

**Mecanismo sem medida.** Impossível avaliar.

**Sem validade.** Permanente por omissão.

**Uniforme.** Consome paciência em casos irrelevantes.

**Humano onde automático era viável.** Custo perpétuo.

**Sucesso medido por número de mecanismos.** Incentivo invertido.

## Erros Comuns

**Responder a incidente** com controle sem avaliar o ponto de intervenção.

**Não definir** como o efeito será medido.

**Não atribuir dono** como papel.

**Nunca remover nada.**

**Não escalonar** por criticidade.

## Exemplo Real

Uma empresa de serviços financeiros com 500 engenheiros conduziu um inventário de mecanismos de
governança de engenharia — comitês, aprovações, relatórios, formulários, verificações
obrigatórias.

Foram encontrados **34**, e nenhuma pessoa na organização conhecia todos.

Para cada um, quatro perguntas:

```text
                                          respondidas
qual risco previne                        34
quantas vezes pegou algo em 24 meses      11
quanto atraso adiciona                     6
quem é o dono                             19
```

Todo mundo sabia justificar a existência de um mecanismo; quase ninguém sabia se ele funcionava.

Dos 11 com dado de efetividade:

```text
pegaram algo relevante mais de 5 vezes    4
entre 1 e 5 vezes                          3
nunca pegaram nada                         4
```

Os quatro que nunca pegaram nada existiam havia em média 4,7 anos.

O programa, ao longo de 12 meses:

**Suspensão de 9 mecanismos** por um trimestre, escolhidos entre os sem dono e os sem efetividade
demonstrada. Nada quebrou em 7; foram removidos. Dois foram restabelecidos — um relatório de
exposição de dados e uma verificação de dependências — com dono e escopo reduzido.

**11 convertidos em verificação automática**, movendo o ponto de intervenção.

**8 com escopo reduzido** para a classe de risco que os justificava. O mais significativo passou de
"todo projeto" para "projetos com dado regulado ou compromisso irreversível acima de um limite".

**6 mantidos**, todos com efetividade demonstrada.

**Prazo de validade obrigatório** em todo mecanismo novo, máximo de 24 meses, com renovação
exigindo evidência de efeito.

**Meta anual de remoção**: ao menos um mecanismo removido por ano, com a justificativa registrada
de que, sem meta explícita, o conjunto volta a crescer.

**Quem propõe, opera.** Todo mecanismo novo é operado pela pessoa ou área que o propôs, pelos
primeiros seis meses.

Resultados após 12 meses:

```text
mecanismos                                    34 → 15
tempo médio de aprovação de projeto novo      de 26 para 4 dias
incidentes atribuíveis a mecanismo removido    1 — o de dependências,
                                              restabelecido
"burocracia" como principal obstáculo na
  pesquisa interna                            de 1º para 6º lugar
mecanismos propostos no período                7
propostos e retirados pelo próprio autor
  após operá-los                               2
```

Os dois retirados pelo próprio autor são o resultado que a organização mais valoriza: a regra de
"quem propõe, opera" fez com que duas propostas fossem abandonadas por quem as tinha feito,
depois de sentir o custo.

A avaliação posterior aponta: a suspensão temporária foi o instrumento decisivo. Discutir se um
mecanismo é necessário produz argumentos indefinidamente; suspendê-lo por três meses produz
evidência em três meses.

## Conceitos Relacionados

- [Governança](../19-architecture-governance/index.md) — a operação.
- [Princípios](leadership-principles.md).
- [Padrões](leadership-standards.md).
- [Funções de Aptidão](fitness-functions.md).

## Exercício Prático

Pergunte, na sua organização: qual foi o último mecanismo de governança removido, e quando?

Se ninguém souber responder, o conjunto só cresceu — e o diagnóstico independe de qual mecanismo
você examine primeiro.

## Perguntas de Entrevista

- Por que adicionar mecanismos tem dono e remover não tem?
- Por que suspender temporariamente produz mais que discutir?
- Por que quem propõe um mecanismo deveria operá-lo?

## Para Aprofundar

- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.
- Forsgren, Nicole et al. *Accelerate*. IT Revolution, 2018.
- Ford, Neal et al. *Building Evolutionary Architectures*. 2ª ed. O'Reilly, 2022.
