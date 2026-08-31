---
id: coupling-vs-duplication
title: Acoplamento vs. Duplicação
sidebar_position: 6
description: Duplicação é mais barata que o acoplamento errado — e a maior parte da duplicação aparente não é duplicação.
doc_type: tradeoff
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor distingue duplicação real de coincidência e escolhe entre extrair e
  duplicar com base no eixo de mudança.
prerequisites: [coupling]
related: [simplicity-vs-flexibility, monolith-vs-microservices, abstraction-vs-complexity]
canonical_for: [acoplamento contra duplicação, duplicação aparente, eixo de mudança, regra de três]
content_version: 1
last_reviewed: 2026-08-29
---

# Acoplamento vs. Duplicação

## Visão Geral

O reflexo formado por anos de "não se repita" é remover duplicação sempre que ela aparece. O
reflexo é caro, porque ignora o que a extração cria: **acoplamento**.

```text
duplicação   custo linear, local, visível
acoplamento  custo não linear, distribuído, invisível até a primeira divergência
```

E ignora algo anterior: boa parte do que parece duplicação não é. Dois trechos idênticos
hoje que mudam por razões diferentes são **coincidência**, e uni-los cria um acoplamento
entre coisas que não têm relação.

```text
eixo real   estes dois trechos mudam pela mesma razão, ou por razões diferentes?
```

Essa pergunta — não a semelhança do código — decide.

## Problema

O ciclo é conhecido:

```text
dois trechos parecidos       extraídos para uma função compartilhada
um caso precisa variar       parâmetro booleano
outro caso precisa variar    segundo parâmetro
seis meses depois            função com 5 parâmetros de controle e 3 caminhos
                             que ninguém entende, usada por 4 módulos
```

Cada passo foi razoável. O resultado é pior que a duplicação original em todas as dimensões:
mais difícil de ler, mais difícil de mudar, e agora com risco de que uma mudança para
atender a um chamador quebre outro.

Ver [DRY](/02-software-design/dry.md).

O erro oposto existe e é menos comum em código, e mais comum entre serviços: a mesma regra
de negócio implementada em quatro lugares, divergindo silenciosamente, com quatro
comportamentos diferentes para a mesma pergunta.

## Conceitos Centrais

### O teste é o eixo de mudança

```text
duplicação real   os dois trechos mudarão juntos, sempre, pela mesma razão
coincidência      os dois são iguais hoje e mudarão por razões diferentes
```

Exemplos:

```text
cálculo de imposto usado em pedido e em nota fiscal
  → muda quando a lei muda, nos dois → duplicação real

validação de e-mail no cadastro e na importação em lote
  → o cadastro pode ganhar verificação; a importação não
  → provável coincidência

formato de resposta de dois endpoints diferentes
  → evoluem com seus próprios consumidores → coincidência
```

Este é o conteúdo do princípio original de DRY, frequentemente perdido: ele fala de
**conhecimento**, não de texto. Duas representações do mesmo conhecimento devem ser uma;
dois textos iguais que representam conhecimentos diferentes devem permanecer dois.

### Acoplamento custa de forma não linear

```text
duplicação   n cópias → n lugares para mudar, cada um independente
acoplamento  n dependentes → cada mudança precisa considerar n contextos,
             com risco de regressão em n-1 lugares não testados
```

E o custo do acoplamento é diferido: ele não aparece na extração, aparece na primeira vez em
que um dos usos precisa divergir. É por isso que a decisão parece boa por meses.

Ver [acoplamento](/01-fundamentals/coupling.md).

### Regra de três

```text
1ª ocorrência   escreva
2ª ocorrência   duplique, e observe
3ª ocorrência   agora há informação suficiente para extrair
```

A justificativa não é numerológica: com um caso, a estrutura é adivinhação; com dois, a
variação é uma hipótese; com três, o eixo real fica visível.

Extrair no segundo caso produz abstrações com a forma do primeiro. Ver
[simplicidade vs. flexibilidade](/20-trade-offs/simplicity-vs-flexibility.md).

### Entre serviços, o cálculo muda

Dentro de um módulo, extrair é barato e reversível. Entre serviços, não:

```text
biblioteca compartilhada entre serviços   acopla ciclos de implantação
serviço compartilhado                     acopla disponibilidade
banco compartilhado                       acopla esquema e evolução
```

Uma biblioteca comum a doze serviços significa que uma correção nela exige doze implantações
coordenadas — e que nenhum dos doze pode evoluí-la sozinho.

Por isso, **entre serviços, a tolerância a duplicação deve ser maior**. Duplicar um modelo de
dados entre dois serviços com contextos diferentes é frequentemente a decisão correta, e é
o que o desenho por contextos delimitados prescreve.

Ver [contextos delimitados](/04-domain-driven-design/bounded-context.md).

### Duplicação com sincronia declarada

Um meio-termo subutilizado: duplicar e registrar a relação.

```text
// Espelha a regra de cálculo em faturamento/ImpostoService.
// Divergiram deliberadamente em 2026-02 (ver ADR-031); manter
// separadas até que a regra fiscal unifique os dois casos.
```

Isso preserva a independência e resolve o problema real da duplicação, que não é o código
repetido — é a divergência silenciosa.

### Sinais de escolha errada

```text
acoplou demais
  parâmetros booleanos de controle em funções compartilhadas
  "não posso mudar isso, o outro time usa"
  mudança simples exigindo implantação coordenada
  biblioteca interna com versionamento e ciclo próprio de negociação
  condicionais que separam chamadores dentro do código comum

duplicou demais
  a mesma regra com comportamentos diferentes em lugares diferentes
  correção aplicada em três lugares e esquecida no quarto
  divergência descoberta por cliente
  esforço de mudança proporcional ao número de cópias, sempre
```

O primeiro sinal — parâmetro de controle — é o mais confiável: ele indica que o código
compartilhado está servindo a dois conhecimentos diferentes.

### Custo de mudar de ideia

```text
duplicado → extraído   barato: os casos existem, a forma é derivável
extraído → duplicado   caro: é preciso descobrir quem depende, e o medo trava
```

A assimetria é forte e quase sempre decisiva nos empates. Duplicar é reversível; acoplar é
reversível na teoria e travado na prática pelo receio de quebrar consumidores que ninguém
mapeou.

## Modelo Mental

**Mudam pela mesma razão?** Se sim, é conhecimento duplicado. Se não, é texto parecido — e
uni-los cria um problema que não existia.

## Quando Usar

Prefira **extrair** quando:

- Os trechos mudam pela mesma razão, comprovadamente.
- Já há três ocorrências.
- Estão no mesmo módulo ou serviço.
- A regra é de negócio e a divergência causaria erro.
- Há requisito regulatório sobre consistência do cálculo.

Prefira **duplicar** quando:

- As razões de mudança são diferentes ou desconhecidas.
- Há apenas duas ocorrências.
- Os trechos estão em serviços diferentes.
- Os contextos de domínio são distintos.
- A extração exigiria parâmetros de controle.

## Quando Não Usar

**Aplicando DRY a texto** em vez de a conhecimento.

**Extraindo no segundo caso.**

**Compartilhando entre serviços** sem contar o acoplamento de implantação.

**Duplicando regra regulada** sem mecanismo de sincronia.

**Duplicando sem registrar a relação** entre as cópias.

## Alternativas

- **Duplicação com nota de sincronia** — mantém independência, evita divergência silenciosa.
- **Extrair só o núcleo estável** — a parte que comprovadamente não varia; deixar o resto
  duplicado.
- **Contrato em vez de código** — compartilhar o esquema e não a implementação. Ver
  [contratos de integração](/08-integration-architecture/integration-contracts.md).
- **Verificação automática de divergência** — testes que comparam os comportamentos das
  cópias, sem uni-las.

A última é elegante para regras reguladas entre serviços: as implementações continuam
independentes e um teste garante que concordam.

## Trade-offs

| Extrair | Duplicar |
|---|---|
| Uma fonte de verdade | Independência |
| Acoplamento | Divergência possível |
| Mudança em um lugar | Mudança em n lugares |
| Difícil de desfazer | Fácil de unir depois |

| Compartilhar entre serviços | Duplicar entre serviços |
|---|---|
| Consistência garantida | Evolução independente |
| Implantação acoplada | Implantação livre |
| Uma equipe responde | Cada uma responde |

## Modos de Falha

**Parâmetro de controle.** Sinal de conhecimentos diferentes unidos.

**Biblioteca compartilhada entre muitos serviços.** Implantação coordenada.

**Extração no segundo caso.** Forma do primeiro.

**Divergência silenciosa.** Quatro comportamentos para a mesma pergunta.

**"Não posso mudar, o outro time usa."** O acoplamento cobrou.

**DRY aplicado a texto.** Une o que não tem relação.

## Erros Comuns

**Remover duplicação por reflexo**, sem perguntar o eixo de mudança.

**Não contar o custo de implantação coordenada** ao compartilhar entre serviços.

**Não registrar a relação** entre cópias deliberadas.

**Tratar duplicação entre contextos de domínio como erro.**

**Não olhar parâmetros booleanos** como sintoma.

## Exemplo Real

Uma empresa de logística tinha uma biblioteca interna de domínio compartilhada por 14
serviços. Ela nasceu com boa intenção: evitar que a mesma regra de cálculo de frete fosse
implementada muitas vezes.

Depois de três anos:

```text
serviços que dependem da biblioteca            14
versões em uso simultâneo                       6
tempo médio para propagar uma correção         11 semanas
mudanças bloqueadas por incompatibilidade
  com algum consumidor, no último ano          19
parâmetros de controle na função principal      7
caminhos condicionais separando chamadores     11
```

Os 7 parâmetros de controle eram o diagnóstico. Eles existiam porque os 14 serviços não
calculavam frete pela mesma razão:

```text
4 serviços   cotação para o cliente — precisa ser rápida e aproximada
3 serviços   faturamento — precisa ser exata e auditável
5 serviços   planejamento de rota — precisa considerar restrições de veículo
2 serviços   conciliação com transportadora — usa a tabela do parceiro
```

Quatro conhecimentos diferentes, unidos por semelhança superficial de fórmula.

A separação levou sete meses:

**Quatro implementações independentes**, uma por contexto, cada uma no serviço que a
possui.

**Duplicação deliberada e registrada.** Cada uma traz uma nota apontando as outras, com o
ADR que explica por que estão separadas.

**Núcleo comum extraído**, mas mínimo: apenas conversões de unidade e estruturas de dados
geográficas — a parte que comprovadamente não varia por contexto, e que não tinha nenhum
parâmetro de controle.

**Verificação de divergência para o caso regulado.** Faturamento e conciliação precisam
concordar por exigência fiscal; um teste diário compara as duas implementações sobre um
conjunto de casos e alerta quando divergem. Elas continuam sendo código independente.

Resultados após 12 meses:

```text
tempo médio para mudar uma regra de frete      de 11 semanas para 3 dias
mudanças bloqueadas por incompatibilidade       0
divergências detectadas pelo teste diário       2, ambas corrigidas em horas
linhas de código totais                         +18%
serviços dependendo da biblioteca comum         14 (só para o núcleo mínimo)
```

O aumento de 18% em código é o custo aceito e foi explicitamente registrado como tal.

A biblioteca não foi um erro de execução. Ela foi criada quando
havia dois consumidores com a mesma necessidade — e a decisão correta naquele momento
provavelmente era mesmo compartilhar. O erro foi não revisar quando o terceiro e o quarto
consumidor chegaram com razões de mudança diferentes. Cada parâmetro de controle adicionado
era um sinal, e nenhum foi lido como tal.

## Conceitos Relacionados

- [Acoplamento](/01-fundamentals/coupling.md) e [DRY](/02-software-design/dry.md).
- [Contextos Delimitados](/04-domain-driven-design/bounded-context.md).
- [Simplicidade vs. Flexibilidade](/20-trade-offs/simplicity-vs-flexibility.md).
- [Monólito vs. Microsserviços](/20-trade-offs/monolith-vs-microservices.md).

## Exercício Prático

Encontre a função compartilhada do seu sistema com mais parâmetros de controle e liste quem
a chama.

Depois, para cada chamador, escreva por que ele pediria uma mudança nela. Razões diferentes
indicam conhecimentos diferentes unidos por semelhança.

## Perguntas de Entrevista

- Por que o teste é o eixo de mudança e não a semelhança do código?
- Por que a tolerância a duplicação deve ser maior entre serviços?
- Como um parâmetro booleano de controle diagnostica uma extração indevida?

## Para Aprofundar

- Hunt, Andrew; Thomas, David. *The Pragmatic Programmer*. 2ª ed. Addison-Wesley, 2019.
- Ousterhout, John. *A Philosophy of Software Design*. 2ª ed. Yaknyam, 2021.
- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003.
