---
id: canary
title: Canary
sidebar_position: 6
description: Expor uma fração e comparar — a única estratégia que detecta o problema em vez de esperar alguém perceber.
doc_type: pattern
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor projeta canary com métricas comparáveis, critério automático e
  tempo suficiente para significância.
prerequisites: [deployment-strategies]
related: [deployment-strategies, blue-green, feature-flags]
canonical_for: [canary, análise de canary, expansão gradual, comparação de coorte]
content_version: 1
last_reviewed: 2026-08-28
---

# Canary

## Visão Geral

Numa implantação canary, a versão nova recebe uma fração pequena do tráfego. As métricas
dessa fração são **comparadas** com as da versão antiga, e a decisão de expandir ou
reverter é tomada a partir dessa comparação.

O que distingue essa estratégia das outras: ela **detecta** o problema. Blue-green e
implantação em ondas substituem a versão com segurança; nenhuma das duas diz se a versão
nova está pior.

E a detecção pode ser automática — o que transforma reversão de decisão humana sob
pressão em consequência de um critério.

## Problema

Uma versão nova pode estar errada de formas que os testes não pegam: comportamento que
depende de dados reais, de volume real, de combinações que só produção tem.

Ver [estratégias de implantação](deployment-strategies.md). O caso mais perigoso é a
mudança que não gera erro nem lentidão — apenas resultado diferente.

Sem comparação, esse tipo de problema é descoberto por alguém que percebe, o que pode
levar horas ou dias.

## Conceitos Centrais

### Comparar coortes, não com o histórico

O erro que invalida a análise: comparar a versão nova com o comportamento de ontem.

Tráfego varia por horário, dia da semana, sazonalidade e eventos. Uma métrica pior que
ontem pode ser variação normal.

A comparação correta é **simultânea**: a fração canary e a fração de controle, no mesmo
período, com tráfego equivalente.

```text
correto    canary 5% × controle 5%, mesmo instante
errado     canary agora × versão antiga na semana passada
```

E o controle não deve ser "todo o resto": comparar 5% com 95% introduz diferenças de
escala — cache mais quente, comportamento de conexão diferente. Uma fração de controle
do mesmo tamanho é o desenho correto.

### O que comparar

```text
técnicas    latência em percentis, taxa de erro, uso de recursos
negócio     conversão, valor médio, taxa de conclusão
distribuição  formato dos resultados, contagens, tamanhos de resposta
```

As duas últimas linhas são as que pegam o problema silencioso. Uma mudança que retorna
menos resultados, ou resultados diferentes, não altera latência nem taxa de erro — e
altera a distribuição.

Ver [depurabilidade](../13-observability/debuggability.md). Comparar distribuições exige
que o sistema emita os dados que as compõem.

### Tempo e volume: a significância

Uma fração pequena por pouco tempo produz poucos eventos, e a comparação vira ruído.

```text
5% do tráfego, 1.000 req/s, 10 minutos → 30.000 eventos por lado — suficiente
5% do tráfego, 5 req/s, 10 minutos     → 150 eventos — insuficiente
```

Sistemas de baixo volume precisam de fração maior ou de tempo maior — e, abaixo de certo
volume, canary simplesmente não funciona como mecanismo estatístico.

E o tempo precisa cobrir os ciclos relevantes: um vazamento de memória não aparece em 10
minutos; uma tarefa que roda de hora em hora não é exercitada em 20.

### Roteamento: quem vai para o canary

```text
aleatório       por requisição — simples, e o mesmo usuário alterna entre versões
por usuário     consistente — o mesmo usuário sempre na mesma versão
por segmento    internos primeiro, depois região, depois geral
por instância   uma máquina roda a versão nova
```

A escolha por usuário é geralmente melhor: ela evita comportamento inconsistente e
permite comparar métricas de jornada — que exigem que o usuário permaneça na mesma
versão.

E começar por usuários internos é uma prática barata que pega problemas grosseiros antes
de qualquer cliente ver.

### Critério automático, não julgamento

Um canary observado por uma pessoa que decide "parece bom" não é muito melhor que
nenhum.

O que torna a técnica confiável:

```text
métricas definidas antes
limiares de reversão explícitos
janela mínima de observação
decisão automática — promover, esperar ou reverter
```

E os limiares precisam distinguir degradação real de variação normal. Um limiar apertado
demais reverte por ruído; frouxo demais não pega nada.

A calibração vem de dados históricos: qual a variação natural dessas métricas entre duas
frações equivalentes rodando a **mesma** versão? Esse é o piso do ruído.

### Expansão gradual

Aprovado o canary, a expansão não é imediata:

```text
5% → 25% → 50% → 100%
```

Cada degrau com nova janela de observação. Problemas dependentes de escala — contenção,
esgotamento de conexões, saturação de dependência — só aparecem com volume.

Ver [escala horizontal](../11-scalability/horizontal-scaling.md).

### Nem toda mudança comporta canary

```text
comporta        mudanças de comportamento, algoritmo, desempenho
não comporta    migração de esquema incompatível
                mudança que exige estado global consistente
                sistemas de baixo volume
                mudanças que só se manifestam depois de dias
```

Para as que não comportam, blue-green ou implantação em ondas com observação atenta.

## Modelo Mental

**Canary é um experimento com reversão automática.** Ele exige coorte de controle,
métricas comparáveis e volume suficiente.

## Quando Usar

- Mudanças de comportamento com risco.
- Onde métricas de negócio são comparáveis.
- Volume suficiente para significância.
- Mudanças de algoritmo ou de desempenho.
- Antes de expandir mudanças de infraestrutura.

## Quando Não Usar

**Comparando com o histórico** em vez de coorte simultânea.

**Sem volume suficiente.**

**Com julgamento humano** em vez de critério.

**Para mudanças incompatíveis** entre versões.

**Sem métricas de negócio**, quando o risco é de comportamento.

**Com janela curta demais** para os ciclos relevantes.

## Alternativas

- **[Blue-green](blue-green.md)** — reversão instantânea, sem detecção.
- **[Implantação em ondas](rolling-deployments.md)** — substituição gradual, sem
  comparação.
- **[Feature flags](feature-flags.md)** — expõe gradualmente sem implantar; complementa.
- **Implantação sombra** — a versão nova processa cópia do tráfego sem responder. Risco
  zero, custo de dobrar o processamento.

A última é a escolha certa quando o comportamento pode ser comparado sem afetar
usuários.

## Trade-offs

| Canary | Blue-green |
|---|---|
| Detecta o problema | Não detecta |
| Exposição mínima | 0% ou 100% |
| Exige métricas e volume | Funciona sempre |
| Complexo | Simples |
| Duas versões por mais tempo | Só na troca |

| Roteamento por usuário | Por requisição |
|---|---|
| Consistente | Alterna |
| Métricas de jornada | Só por requisição |
| Amostra menos aleatória | Mais |

## Modos de Falha

**Comparação com histórico.** Variação normal lida como degradação.

**Volume insuficiente.** A comparação é ruído.

**Métricas de negócio ausentes.** O problema silencioso passa.

**Limiar mal calibrado.** Reverte por ruído, ou não reverte nunca.

**Janela curta.** Problemas dependentes de tempo passam.

**Canary esquecido.** A versão nova fica em 5% indefinidamente.

**Controle desequilibrado.** Comparar 5% com 95% introduz diferença de escala.

## Erros Comuns

**Não usar coorte de controle.**

**Decidir por observação humana.**

**Não comparar métricas de negócio.**

**Não calibrar limiares com o ruído histórico.**

**Não expandir gradualmente.**

**Não ter prazo máximo** para o canary concluir.

## Exemplo Real

Uma plataforma de busca de voos implementou canary comparando latência, taxa de erro e
uso de CPU. Durante um ano, ele nunca reverteu nada — e três incidentes de comportamento
passaram por ele.

O caso mais claro: uma mudança no ranqueamento passou a excluir voos com escalas longas
por um erro de limite. Latência, erros e CPU ficaram idênticos. A conversão caiu 8%, e
ninguém percebeu por quatro dias.

A reformulação:

**Métricas de negócio** adicionadas à comparação: conversão, número médio de resultados
por busca, distribuição de preços dos resultados, taxa de busca sem resultado.

A segunda teria pego o problema em minutos: o canary retornava, em média, 22% menos
resultados.

**Coorte de controle** do mesmo tamanho, roteada por usuário. Antes, a comparação era
canary contra todo o restante.

**Limiares calibrados** com um experimento prévio: duas coortes de 5% rodando a **mesma**
versão, por duas semanas, para medir a variação natural de cada métrica. Os limiares
foram definidos acima desse ruído.

Esse passo foi o que mais melhorou a confiabilidade da análise — antes, os limiares
tinham sido escolhidos por intuição, e eram frouxos o suficiente para não pegar nada.

**Expansão em degraus** — 5%, 25%, 50%, 100% — com janela de 20 minutos em cada. Um
problema de contenção de conexões apareceu no degrau de 50%, e não teria aparecido em
5%.

**Prazo máximo.** Um canary que não conclui em 2 horas é revertido automaticamente. Isso
foi adicionado depois de encontrarem duas versões em canary havia semanas, esquecidas.

Nos dez meses seguintes, o canary reverteu automaticamente nove implantações. Cinco eram
degradações de métrica de negócio, invisíveis nas técnicas.

O que a equipe registra: o canary existia e dava a sensação de proteção, medindo
exatamente o que não estava em risco. A calibração com ruído histórico foi o passo que
tornou a comparação confiável, e é o mais frequentemente pulado.

## Conceitos Relacionados

- [Estratégias de Implantação](deployment-strategies.md).
- [Blue-Green](blue-green.md) e
  [Implantação em Ondas](rolling-deployments.md).
- [Feature Flags](feature-flags.md).
- [Depurabilidade](../13-observability/debuggability.md).

## Exercício Prático

Se você usa canary, verifique quais métricas ele compara — e se alguma delas mudaria se
o sistema passasse a retornar resultados errados com latência normal.

Se nenhuma mudaria, o canary não protege contra o caso mais perigoso.

## Perguntas de Entrevista

- Por que comparar com coorte simultânea e não com o histórico?
- Por que métricas técnicas não bastam?
- Como calibrar os limiares de reversão?

## Para Aprofundar

- Humble, Jez; Farley, David. *Continuous Delivery*. Addison-Wesley, 2010.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 — capítulo 27.
- Sato, Danilo. *Canary Release*. martinfowler.com, 2014.
