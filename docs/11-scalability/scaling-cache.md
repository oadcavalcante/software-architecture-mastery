---
id: scaling-cache
title: Cache para Escala
sidebar_position: 4
description: Remover trabalho em vez de adicionar capacidade — e os modos de falha que aparecem só sob carga.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor dimensiona cache pela taxa de acerto e evita os colapsos que
  só acontecem em escala.
prerequisites: [scalability]
related: [database-scaling, hotspots, statelessness]
canonical_for: [taxa de acerto, estampida de cache, cache em camadas, aquecimento de cache]
content_version: 1
last_reviewed: 2026-08-28
---

# Cache para Escala

## Visão Geral

Cache é a técnica de melhor retorno em escala, porque ela **remove trabalho** em vez de
adicionar capacidade para executá-lo.

Os fundamentos — o que cachear, invalidação, tempo de vida — estão em
[caching](../05-system-design/caching.md). Aqui interessa o que muda sob carga alta:
os modos de falha que só aparecem em escala, e que transformam o cache de solução em
causa de indisponibilidade.

## Problema

Um cache com 90% de acerto reduz a carga na origem em 90%. Um com 99% reduz em 99% —
dez vezes mais.

Essa não linearidade tem um lado perigoso: a origem passa a ser dimensionada para a
carga **com** cache. Quando o cache falha, a carga que chega é dez ou cem vezes maior
do que a origem suporta.

O cache deixa de ser otimização e vira dependência crítica — sem que ninguém tenha
decidido isso.

## Conceitos Centrais

### A taxa de acerto governa tudo

```text
acerto   carga na origem   redução
  50%          50%           2×
  90%          10%          10×
  95%           5%          20×
  99%           1%         100×
  99,9%        0,1%      1.000×
```

Subir de 90% para 99% reduz a carga na origem por um fator de dez — mais do que
qualquer aumento realista de capacidade entregaria.

Por isso a taxa de acerto é a métrica principal de um cache, e por isso uma queda nela
é um alerta de primeira ordem: ela precede a saturação da origem.

E a recíproca: dimensionar a origem para a carga com cache significa que **a origem não
sobrevive à perda do cache**. Isso precisa ser uma decisão consciente, com plano.

### Estampida é o modo de falha característico

Uma chave popular expira. Mil requisições simultâneas encontram o cache vazio. Todas
vão à origem, simultaneamente, pela mesma coisa.

```text
sem proteção   1 expiração → 1.000 consultas idênticas à origem
com proteção   1 expiração → 1 consulta, 999 esperam o resultado
```

As defesas, combináveis:

**Bloqueio de recálculo.** Apenas a primeira requisição recalcula; as demais esperam
ou recebem o valor velho.

**Recálculo antecipado probabilístico.** Perto do vencimento, uma fração das
requisições recalcula antes de expirar, evitando o momento em que todas encontram
vazio.

**Expiração com variação.** Chaves criadas juntas expiram juntas. Adicionar variação
aleatória ao tempo de vida dessincroniza — é a mesma lógica de
[backoff](../06-distributed-systems/backoff.md).

**Servir o velho enquanto revalida.** A requisição recebe o valor expirado; o
recálculo acontece em segundo plano.

A última é a que dá melhor experiência, e exige que servir dado ligeiramente velho seja
aceitável — o que costuma ser.

### Cache em camadas

```text
local no processo   nanossegundos  — pequeno, por instância, divergente
compartilhado       ~1 ms          — consistente, uma ida à rede
borda               ~10 ms         — geograficamente distribuído
origem              ~50 ms+        — a fonte
```

Camadas se compõem: o local absorve o mais quente, o compartilhado absorve o resto, e a
origem vê pouco.

O cuidado é a **invalidação em camadas**: invalidar no compartilhado não invalida os
locais. Os caches locais precisam de tempo de vida curto, ou de um canal de
invalidação.

E o cache local reintroduz divergência entre instâncias — aceitável para dados que
toleram alguns segundos de atraso, inaceitável para o que precisa ser consistente. Ver
[ausência de estado](statelessness.md).

### Aquecimento importa na expansão

Uma instância nova sobe com cache local vazio. Ela faz consultas que as outras não
fazem — no momento em que o sistema está escalando, ou seja, sob pressão.

Ver [escala horizontal](horizontal-scaling.md). É um efeito de segunda ordem que
transforma o escalonamento em um pico adicional na origem.

As saídas: aquecer antes de entrar na rotação, entrar gradualmente recebendo fração do
tráfego, ou depender apenas do cache compartilhado, que já está quente.

### Chave quente no cache

Um cache distribuído particiona por chave. Uma chave muito acessada satura o nó que a
contém — o mesmo problema de [pontos quentes](hotspots.md), uma camada acima.

Isso surpreende porque o cache existe justamente para absorver o quente. A saída é
replicar a chave quente entre nós, ou colocá-la em cache local, onde a distribuição
deixa de importar.

### Cachear o que não deveria

Dois erros com consequência de segurança e de correção:

**Cachear resposta personalizada com chave genérica.** A resposta de um usuário é
servida a outro. Acontece quando a chave de cache não inclui a identidade.

**Cachear erro.** Uma falha transitória cacheada por dez minutos transforma um erro de
um segundo num de dez minutos.

O segundo é comum em caches de borda, e a correção é simples: tempo de vida muito curto
para respostas de erro, ou nenhum.

## Modelo Mental

**Cache remove trabalho; capacidade adiciona meios de executá-lo.** Remover é sempre
mais barato — e cria uma dependência que precisa ser tratada como tal.

## Quando Usar

- A mesma informação é lida repetidamente.
- O custo de produzir a resposta é alto.
- Dado ligeiramente velho é aceitável.
- A leitura domina a escrita.
- A origem está saturada.
- Há chave quente absorvível.

## Quando Não Usar

**Para dados que precisam ser do instante.** Saldo antes de debitar.

**Sem plano para a perda do cache.**

**Sem proteção contra estampida** em chaves populares.

**Cache local autoritativo.**

**Chave de cache sem identidade** em resposta personalizada.

**Cachear escrita.** Cache resolve leitura; escrita exige outra coisa.

**Quando a taxa de acerto é baixa.** Um cache com 30% de acerto adiciona latência e
complexidade por pouco ganho.

## Alternativas

- **Visão materializada** — pré-calcular no banco, sem camada extra.
- **Réplica de leitura** — distribui sem introduzir invalidação. Ver
  [replicação para escala](scaling-replication.md).
- **Otimizar a consulta** — se ela ficar barata, o cache deixa de ser necessário.
- **Cache de borda** — para conteúdo público, resolve latência e carga de uma vez.

## Trade-offs

| Com cache | Sem |
|---|---|
| Carga na origem reduzida | Integral |
| Dado pode estar velho | Sempre atual |
| Invalidação a gerenciar | Nenhuma |
| Dependência adicional | Menos componentes |
| Falha do cache é crítica | Irrelevante |

| Local | Compartilhado |
|---|---|
| Nanossegundos | ~1 ms |
| Divergente entre instâncias | Consistente |
| Frio na inicialização | Sempre quente |
| Sem custo de rede | Uma ida |

## Modos de Falha

**Estampida.** Expiração de chave popular derruba a origem.

**Perda do cache.** A origem recebe a carga integral e cai.

**Taxa de acerto caindo sem alerta.**

**Resposta personalizada servida a outro usuário.**

**Erro cacheado.**

**Cache local divergente.**

**Chave quente saturando um nó do cache.**

**Despejo silencioso.** A memória enche e o cache descarta o que era importante. Ver
[chave-valor](../07-data-architecture/key-value-databases.md).

## Erros Comuns

**Não monitorar a taxa de acerto.**

**Não proteger contra estampida.**

**Expiração sem variação.**

**Não ter plano para a perda do cache.**

**Chave sem identidade em resposta personalizada.**

**Não monitorar a taxa de despejo.**

## Exemplo Real

Uma plataforma de notícias usava cache compartilhado com 97% de taxa de acerto. O banco
era dimensionado para 3% da carga de leitura.

Três incidentes ao longo de um ano, todos relacionados ao cache:

**Perda total.** Uma manutenção reiniciou o cluster de cache. Os 100% da carga foram
para o banco, que saturou em segundos e ficou indisponível por 25 minutos — até o
cache reaquecer. Não havia plano para esse cenário.

**Estampida.** Uma matéria muito acessada tinha seu cache expirando a cada 60
segundos. A cada expiração, cerca de 4.000 requisições simultâneas iam ao banco pela
mesma consulta. Isso gerava picos regulares de latência que ninguém tinha ligado à
expiração.

**Expiração sincronizada.** As chaves de uma seção do portal eram criadas juntas, na
publicação, com o mesmo tempo de vida. Todas expiravam no mesmo segundo, produzindo um
pulso de carga a cada intervalo.

As correções:

**Servir o velho enquanto revalida**, para todo conteúdo editorial. Uma expiração
deixou de significar ausência: o valor antigo é servido e o recálculo acontece atrás.

**Bloqueio de recálculo** para as chaves mais quentes, garantindo uma única consulta por
expiração.

**Variação de 20% no tempo de vida**, dessincronizando as expirações.

**Cache local** de 5 segundos nas instâncias de aplicação, absorvendo o topo da
distribuição — o que reduziu a carga no cache compartilhado em 60% e resolveu a chave
quente que saturava um nó.

**Descarte de carga** no banco: acima de um limite de conexões, requisições de conteúdo
não essencial passam a receber uma resposta degradada em vez de enfileirar.

**Exercício de perda de cache**, trimestral, em janela controlada. O primeiro
confirmou que o banco ainda caía; após o descarte de carga e o cache local, o terceiro
exercício passou com degradação parcial e sem indisponibilidade.

O que a equipe registra: a taxa de acerto de 97% era vista como excelente e escondia
uma dependência crítica. O banco nunca tinha sido dimensionado para operar sem cache, e
ninguém tinha decidido isso — foi consequência de o cache ter sido adicionado depois.

## Conceitos Relacionados

- [Caching](../05-system-design/caching.md) — os fundamentos.
- [Pontos Quentes](hotspots.md) — a chave quente no cache.
- [Escala de Banco de Dados](database-scaling.md) — o degrau 3.
- [Backoff](../06-distributed-systems/backoff.md) — a variação.

## Exercício Prático

Descubra a taxa de acerto do seu cache e calcule a carga que a origem receberia se ele
sumisse agora.

Compare com a capacidade da origem. Se ela não aguentar, você tem uma dependência
crítica que provavelmente não está documentada como tal.

## Perguntas de Entrevista

- Por que subir de 90% para 99% de acerto importa tanto?
- O que é estampida e quais as defesas?
- Por que instâncias novas com cache frio pioram o momento de escalar?

## Para Aprofundar

- Nishtala, Rajesh et al. *Scaling Memcache at Facebook*. NSDI, 2013.
- Vattani, Andrea et al. *Optimal Probabilistic Cache Stampede Prevention*. VLDB, 2015.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
