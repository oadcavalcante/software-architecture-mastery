---
id: bottleneck-analysis
title: Análise de Gargalos
sidebar_position: 22
description: Encontrar o recurso que satura primeiro — e por que otimizar qualquer outro não muda nada.
doc_type: concept
level: 3
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor identifica o gargalo real por medição e reconhece que
  otimizar fora dele não aumenta capacidade.
prerequisites: [capacity-planning]
related: [capacity-planning, scalability-basics, hotspots]
canonical_for: [análise de gargalos, gargalo]
content_version: 1
last_reviewed: 2026-08-27
---

# Análise de Gargalos

## Visão Geral

Gargalo é o recurso que satura primeiro e limita a capacidade do conjunto.

A consequência que organiza tudo: **otimizar qualquer recurso que não seja o
gargalo não aumenta a capacidade do sistema.** Ela apenas aumenta a folga de algo
que já tinha folga.

## Problema

Times otimizam o que é visível, familiar ou desconfortável — raramente o que
limita.

O padrão: alguém reescreve uma função lenta e ganha 40% naquele trecho. O tempo de
resposta do sistema não muda, porque a função representava 3% do total e o gargalo
era o banco.

Isso não é falta de competência. É ausência de medição antes de agir — e a
medição é rápida quando se sabe o que procurar.

## Conceitos Centrais

### Os candidatos, em ordem de frequência

Em sistemas de negócio, o gargalo costuma ser um destes:

**Banco de dados.** O mais comum. Consulta sem índice, bloqueio, conexões
esgotadas, ou simplesmente volume acima do que a instância comporta.

**Chamada externa síncrona.** Um serviço de terceiro na resposta, com latência
alta ou variável.

**Pool de conexões.** Esgotado, requisições esperam por um recurso que existe.

**CPU.** Serialização, criptografia, compressão, processamento de imagem.

**Rede.** Banda de saída, especialmente com mídia.

**Bloqueio.** Um recurso serializado por onde tudo passa — um contador, uma linha
quente, um lock.

Memória raramente é gargalo de vazão; ela é gargalo de estabilidade — o sistema
não fica lento, ele cai.

### Medir antes de agir

Três instrumentos, em ordem:

**Rastreamento distribuído.** Onde o tempo de uma requisição é gasto, por etapa. É
o que responde a pergunta mais rápido.

**Perfil de CPU e alocação.** Quando o tempo está dentro do processo.

**Métricas de recurso.** Utilização de CPU, conexões em uso, profundidade de fila,
tempo de espera por bloqueio.

A pergunta que orienta: **de onde vem o tempo, e qual recurso está mais próximo do
seu limite?**

### Utilização e enfileiramento

Um recurso não degrada linearmente. Ele funciona bem até cerca de 70% de
utilização e piora rápido depois — porque o tempo de espera na fila cresce de
forma não linear conforme a utilização se aproxima de 100%.

A consequência prática: **um recurso a 85% de utilização já está em degradação**,
mesmo que ainda não tenha caído. Esperar chegar a 100% para agir é esperar o
colapso.

### O gargalo se move

Corrigido um, outro aparece. Isso não é fracasso — é o resultado esperado.

O sistema tem sempre um gargalo; a pergunta é se ele está acima ou abaixo da
capacidade necessária. Otimizar até o gargalo atual sair do caminho e o próximo
estar confortavelmente acima do requisito é o critério de parada.

Sem esse critério, a otimização não termina.

### Lei de Amdahl aplicada

Se uma etapa representa 20% do tempo total, eliminá-la completamente melhora 20% —
nunca mais.

Isso dá a ordem de prioridade: **otimize o que representa maior fração do tempo**,
e nada mais. Uma melhoria de 10× em algo que custa 5% do total rende 4,5%.

## Modelo Mental

**Qual recurso está mais perto do limite?** Tudo o mais tem folga por definição, e
mexer nele não muda a capacidade.

## Quando Usar

- O sistema está lento ou instável e ninguém sabe por quê.
- Antes de qualquer esforço de otimização.
- Antes de decidir escalar — escalar o que não é gargalo é gastar sem ganho.
- Ao validar se uma mudança de arquitetura resolveria o problema real.

## Quando Não Usar

**Como substituto de medição.** Análise sem instrumento é palpite.

**Quando o sistema atende ao requisito.** Otimizar o que já basta é custo sem
retorno.

**Otimizando o que não é o gargalo.** Rende zero em capacidade.

**Sem critério de parada.** Sem saber qual requisito precisa ser atendido, a
otimização não termina.

## Alternativas

- **Teste de carga** — provocar a saturação em ambiente controlado, em vez de
  esperar produção.
- **Reduzir a carga** — a alternativa menos considerada: uma consulta que não
  precisa existir é o ganho mais barato.
- **Aceitar** — se o gargalo está acima do requisito, não é problema.

## Trade-offs

| Medir antes | Otimizar direto |
|---|---|
| Esforço no que rende | Frequentemente no que não rende |
| Precisa de instrumentação | Nenhuma |
| Tempo antes de agir | Ação imediata |
| Resultado verificável | Sensação de melhoria |

## Modos de Falha

**Otimizar fora do gargalo.** Esforço sem ganho de capacidade.

**Confundir sintoma com causa.** "O banco está sobrecarregado" é sintoma; a causa
pode ser uma consulta, um padrão de acesso ou uma funcionalidade desnecessária.

**Medir com carga irreal.** Um teste com dados de homologação não revela o
comportamento com o volume de produção.

**Corrigir um e não verificar o próximo.** O gargalo se moveu e ninguém olhou.

**Ignorar a cauda.** A média está boa e o percentil 99 está péssimo — e é ele que
o usuário percebe.

## Erros Comuns

**Otimizar sem medir.**

**Escalar antes de identificar o gargalo.** Adicionar instâncias quando o gargalo é
o banco piora — mais instâncias, mais conexões, mais pressão.

**Olhar só a média.**

**Não instrumentar antes de precisar.** No incidente, não há tempo de instrumentar.

**Parar sem critério.**

## Exemplo Real

Um sistema de reservas apresentava latência de 3 segundos no percentil 95, contra
requisito de 800 ms.

A primeira hipótese foi o banco, e a equipe começou a discutir réplica de leitura.

O rastreamento distribuído mostrou outra coisa. A distribuição do tempo de uma
requisição típica:

```text
banco (3 consultas)        180 ms
serviço de precificação  2 400 ms   ← 80% do tempo
serialização                40 ms
resto                      120 ms
```

O banco representava 6%. Réplica de leitura teria melhorado, no melhor caso, 6% —
para um problema que exigia 73%.

O serviço de precificação era o gargalo. Investigando: ele fazia uma chamada
síncrona a um serviço de câmbio a cada requisição, e a cotação mudava duas vezes
por dia.

A correção foi cache com TTL de 5 minutos na cotação. A latência caiu para 210 ms.

Depois disso o gargalo se moveu para o banco — as 3 consultas passaram a ser 85%
do tempo restante. Mas 210 ms está confortavelmente abaixo do requisito de 800 ms,
e a equipe parou.

Duas lições registradas. A hipótese inicial estava errada, e teria consumido
semanas construindo réplica para ganhar 6%. E a parada foi deliberada: o gargalo
novo existe, está medido, e não precisa ser corrigido enquanto o requisito for
atendido.

## Por onde começar a procurar

Quando não há rastreamento distribuído disponível, uma sequência de verificações
resolve a maioria dos casos em minutos.

**Um.** O tempo está dentro ou fora do processo? Compare o tempo total da
requisição com a soma do tempo gasto em chamadas externas — banco, serviços,
cache. Se a maior parte está fora, o problema não é o seu código.

**Dois.** Quantas consultas por requisição? Um número que cresce com a quantidade
de itens exibidos é o N+1 clássico. Ver
[Proxy](../03-design-patterns/proxy.md).

**Três.** Alguma consulta percorre a tabela? O plano de execução responde. Índice
ausente é a causa mais frequente e a mais barata de corrigir.

**Quatro.** O pool de conexões está saturado? Requisições esperando por conexão
aparecem como lentidão sem que nenhum componente esteja ocupado.

**Cinco.** Há bloqueio? Tempo de espera por lock no banco, ou contenção em um
recurso serializado na aplicação.

**Seis.** A CPU está saturada? Se sim, o perfil diz onde. Se não, o tempo está em
espera — e espera é rede, disco ou bloqueio.

A ordem importa: as três primeiras respondem a maior parte dos casos de sistema de
negócio, e as três custam minutos. Começar pelo perfil de CPU é começar pela
resposta menos provável.

## Conceitos Relacionados

- [Planejamento de Capacidade](capacity-planning.md) — a estimativa que antecede.
- [Escalabilidade Básica](scalability-basics.md) — o que fazer com o gargalo
  identificado.
- [Observabilidade](../13-observability/index.md) — os instrumentos.
- [Hotspots](../11-scalability/index.md) — quando o gargalo é uma chave, não um
  recurso.

## Exercício Prático

Pegue a operação mais importante do seu sistema e descubra onde o tempo é gasto,
por etapa.

Se você não consegue responder em minutos, falta instrumentação — e essa é a
descoberta mais valiosa do exercício.

## Perguntas de Entrevista

- Por que otimizar fora do gargalo não aumenta capacidade?
- Por que um recurso a 85% de utilização já é problema?
- Como decidir quando parar de otimizar?

## Para Aprofundar

- Gregg, Brendan. *Systems Performance*. 2ª ed., Addison-Wesley, 2020.
- Goldratt, Eliyahu. *The Goal*, 1984 — a teoria das restrições, de onde vem a
  ideia de gargalo.
