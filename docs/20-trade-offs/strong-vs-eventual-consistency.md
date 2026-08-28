---
id: strong-vs-eventual-consistency
title: Consistência Forte vs. Eventual
sidebar_position: 12
description: A janela de inconsistência é um requisito de negócio — e ela precisa de número.
doc_type: tradeoff
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor define a janela de inconsistência tolerável por operação e desenha
  o que acontece dentro dela.
prerequisites: [eventual-consistency]
related: [consistency-vs-availability, sync-vs-async, sql-vs-nosql]
canonical_for: [consistência forte contra eventual, janela de inconsistência, leitura das próprias escritas, convergência observável]
content_version: 1
last_reviewed: 2026-08-29
---

# Consistência Forte vs. Eventual

## Visão Geral

O par é vizinho de [consistência vs. disponibilidade](consistency-vs-availability.md) e
diferente dele. Ali, a escolha aparece durante uma partição. Aqui, ela aparece **todos os
dias**, em operação normal:

```text
consistência forte    toda leitura vê a última escrita — ao custo de
                      coordenação, e portanto de latência
consistência eventual as réplicas convergem depois de um tempo — sem
                      coordenação no caminho de escrita
```

```text
eixo real   quanto tempo de divergência esta operação tolera, e o que
            acontece com quem lê dentro dessa janela?
```

A palavra "eventual" esconde o que decide: **eventual quando?** Uma janela de 50
milissegundos e uma de 6 horas são decisões completamente diferentes, e a mesma palavra
descreve as duas.

## Problema

"Somos eventualmente consistentes" é usado como se fosse desenho. Não é — é a ausência de
três decisões:

```text
qual é a janela aceitável, em unidade de tempo
o que o usuário vê dentro dela
o que acontece se a convergência não ocorrer
```

Sem a primeira, não há como monitorar nem alarmar. Sem a segunda, o usuário vê estados
incoerentes sem explicação. Sem a terceira, divergências permanentes passam despercebidas.

O erro simétrico é aplicar consistência forte a tudo, pagando coordenação em operações que
toleravam segundos de atraso — o que aparece como latência em toda leitura e como
indisponibilidade quando uma réplica cai.

## Conceitos Centrais

### A janela é um requisito, com número

```text
saldo bancário exibido ao correntista       < 1 s
contador de curtidas                        < 30 s
resultado de busca após publicação          < 5 min
relatório gerencial                         < 24 h
estoque em vitrine                          < 2 min
posição de entrega no mapa                  < 10 s
```

Com número, a janela vira alarme: divergência acima do limite é incidente, não é "assim
mesmo".

Sem número, não há como distinguir funcionamento normal de falha de replicação — que é
exatamente como divergências permanentes sobrevivem meses.

### Leitura das próprias escritas

A garantia mais importante na prática, e a mais barata de fornecer:

```text
o usuário atualiza o perfil e vê o valor antigo   → percebido como defeito
o usuário publica e não vê a publicação           → repete a ação
o usuário paga e o saldo não mudou                → chama o suporte
```

Consistência eventual entre usuários diferentes costuma ser invisível. Consistência eventual
para o **próprio** usuário é percebida imediatamente como erro.

A solução usual não exige consistência forte: rotear as leituras daquele usuário para a
réplica primária durante uma janela curta, ou servir o valor recém-escrito a partir da
sessão.

### Garantias intermediárias

Entre os dois extremos há um espectro que resolve a maior parte dos casos:

```text
leitura das próprias escritas   o autor vê o que escreveu
leitura monotônica              nunca se vê um estado anterior ao já visto
escritas em ordem               as escritas de uma sessão são aplicadas em ordem
consistência de prefixo         vê-se um estado consistente, possivelmente antigo
```

A segunda evita o efeito mais desconcertante da replicação: o valor "voltar no tempo" ao
alternar de réplica.

Ver [consistência](../06-distributed-systems/consistency.md).

### O custo da coordenação é diário

```text
consistência forte entre zonas       dezenas de milissegundos por operação
entre regiões                        centenas
quórum de escrita                    latência do nó mais lento do quórum
```

Isso é pago em **toda** operação, todos os dias — não apenas durante falhas. É a razão de
o PACELC ser mais relevante no dia a dia que o CAP. Ver
[PACELC](../06-distributed-systems/pacelc.md).

### Convergência precisa ser observável

```text
métrica de atraso de replicação, por réplica
alarme acima da janela declarada
detecção de divergência permanente, não só de atraso
processo de reconciliação, com registro
```

O terceiro item é o mais esquecido: atraso alto é detectável por métrica; divergência
permanente — uma escrita perdida — não aparece como atraso. Ela exige comparação periódica.

Ver [observabilidade](../13-observability/index.md).

### O produto precisa participar

Consistência eventual bem feita é visível para o usuário, de forma deliberada:

```text
"atualizado há 2 minutos"
"processando — atualiza em instantes"
valores marcados como aproximados
ação bloqueada até a confirmação, quando crítica
```

Esconder a inconsistência produz a pior experiência: o usuário vê números que não batem e
conclui que o sistema está errado — o que, do ponto de vista dele, está.

### Sinais de escolha errada

```text
eventual e não devia
  usuários relatando valores incoerentes
  suporte com chamados de "o número não bate"
  correções manuais de dados recorrentes
  divergência descoberta por cliente, não por monitoração
  janela não declarada

forte e não devia
  latência de escrita dominada por coordenação
  indisponibilidade de uma réplica derrubando escritas
  operações de baixo valor pagando o custo das críticas
  leituras lentas em dados que ninguém precisa ver atualizados
```

### Custo de mudar de ideia

```text
forte → eventual   moderado: exige desenhar janela, reconciliação e produto
eventual → forte   caro: o histórico acumulado pode estar divergente,
                   e a migração precisa reconciliá-lo antes
```

A assimetria favorece **começar forte nas operações de maior custo de erro**, e relaxar com
evidência. Relaxar é uma decisão de desenho; endurecer é uma decisão de desenho mais uma
migração de dados de qualidade desconhecida.

## Modelo Mental

**Eventual quando?** Sem número, não é desenho — é ausência de decisão.

## Quando Usar

Prefira **consistência forte** quando:

- O valor é dinheiro, saldo, estoque único ou limite.
- Uma decisão irreversível depende da leitura.
- Há requisito regulatório sobre o estado.
- A reconciliação seria manual.

Prefira **consistência eventual** quando:

- A janela tolerável é conhecida e maior que a latência de replicação.
- O dado é de leitura predominante e agregado.
- A escala ou a distribuição geográfica tornam a coordenação cara.
- O produto pode comunicar a atualização em curso.

## Quando Não Usar

**Sem declarar a janela** em unidade de tempo.

**Sem garantir leitura das próprias escritas.**

**Sem monitorar convergência** e detectar divergência permanente.

**Forte em tudo**, pagando coordenação onde ela não é necessária.

**Escondendo a inconsistência do usuário.**

## Alternativas

- **Garantias intermediárias** — leitura das próprias escritas e leitura monotônica resolvem
  a maior parte da percepção de erro.
- **Forte por operação** — coordenação apenas onde o custo do erro justifica.
- **Leitura da primária para casos críticos** — mantém a réplica para o resto.
- **Reserva com confirmação** — aceita rápido, confirma em seguida, expira se não confirmar.

A primeira é a mais eficiente em relação custo-benefício e a menos usada.

## Trade-offs

| Consistência forte | Eventual |
|---|---|
| Sem divergência | Latência de escrita menor |
| Coordenação em toda operação | Escala e distribuição |
| Indisponível se a réplica cai | Disponível |
| Sem desenho de janela | Exige janela, produto e monitoração |

| Forte em tudo | Forte por operação |
|---|---|
| Simples de raciocinar | Ajustado ao custo do erro |
| Caro em latência | Mais desenho |
| Um modo | Vários, cada um explícito |

## Modos de Falha

**Janela não declarada.** Impossível alarmar.

**Sem leitura das próprias escritas.** Percebido como defeito.

**Divergência permanente invisível.** Atraso é medido; escrita perdida não.

**Inconsistência escondida.** Usuário conclui que o sistema erra.

**Forte em operações de baixo valor.** Latência paga sem retorno.

**Reconciliação improvisada.** Custo operacional crescente.

## Erros Comuns

**Dizer "eventualmente consistente" sem número.**

**Não tratar o caso do próprio autor da escrita.**

**Monitorar atraso e não divergência.**

**Não comunicar o estado ao usuário.**

**Aplicar um modo único ao sistema inteiro.**

## Exemplo Real

Uma carteira digital com 4 milhões de usuários operava com réplicas de leitura em três
regiões e consistência eventual em todas as consultas, sem janela declarada.

Doze meses de operação:

```text
chamados de suporte "meu saldo está errado"       ~2 400/mês
correções manuais de dados                        ~40/mês
maior divergência detectada                       um registro, 11 dias
atraso médio de replicação                        180 ms
atraso p99                                        2,4 s
atraso máximo observado                           47 min (incidente)
```

A investigação separou os chamados por causa:

```text
leitura das próprias escritas (o usuário fez a
  operação e viu o valor antigo)                  ~1 900 (79%)
divergência entre telas do aplicativo             ~380 (16%)
divergência real, com escrita perdida             ~120 (5%)
```

Quatro quintos dos chamados não eram problema de consistência eventual em si — eram do caso
mais simples e mais barato de resolver.

O que foi desenhado:

**Janela declarada por tipo de dado:**

```text
saldo após operação do próprio usuário    imediato (leitura da primária)
saldo em consulta geral                   < 2 s
extrato                                   < 5 s
relatórios e agregados                    < 5 min
```

**Leitura das próprias escritas**, implementada com roteamento à primária por 10 segundos
após qualquer escrita da sessão. Resolveu 79% dos chamados com duas semanas de trabalho.

**Consistência forte** nas operações de débito e de verificação de limite — as que decidem
se uma transação pode ocorrer. Custo medido: +34 ms no p99 dessas operações, aceito.

**Leitura monotônica** entre telas, fixando a réplica por sessão. Resolveu os 16%.

**Detecção de divergência permanente**, com comparação diária entre a primária e as réplicas
sobre uma amostra e sobre todos os registros alterados nas últimas 24 h. Foi o que encontrou
os casos de escrita perdida, incluindo o de 11 dias.

**Comunicação no produto**: valores de consulta geral trazem indicação de horário de
atualização; durante atraso acima da janela, o aplicativo mostra aviso.

**Alarme por janela**: atraso acima do declarado por tipo de dado gera incidente.

Resultados após 9 meses:

```text
chamados "meu saldo está errado"                  ~190/mês
correções manuais                                 ~3/mês
divergências permanentes detectadas               11, todas em < 24 h
latência p99 de consulta de saldo                 inalterada
latência p99 de débito                            +34 ms
```

O que a equipe aprendeu: o problema descrito como "consistência eventual" era, em 79% dos
casos, a ausência de uma garantia intermediária que custa pouco. A discussão tinha sido
enquadrada como "forte contra eventual" por dois anos, e a resposta não estava em nenhum dos
dois extremos.

E o segundo achado foi a divergência de 11 dias: ela existia porque a monitoração media
**atraso**, e uma escrita perdida não produz atraso — produz silêncio.

## Conceitos Relacionados

- [Consistência Eventual](../06-distributed-systems/eventual-consistency.md) e
  [Consistência Forte](../06-distributed-systems/strong-consistency.md).
- [Consistência vs. Disponibilidade](consistency-vs-availability.md).
- [PACELC](../06-distributed-systems/pacelc.md).
- [Síncrono vs. Assíncrono](sync-vs-async.md).

## Exercício Prático

Liste os dados que seu sistema replica e escreva, para cada um, a janela de inconsistência
tolerável em segundos.

Os que você não conseguir preencher são os que não têm requisito — e portanto não têm como
ser monitorados.

## Perguntas de Entrevista

- Por que "eventualmente consistente" sem número não é desenho?
- Por que a leitura das próprias escritas resolve a maior parte da percepção de erro?
- Por que monitorar atraso de replicação não detecta divergência permanente?

## Para Aprofundar

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Vogels, Werner. *Eventually Consistent*. ACM Queue, 2008.
- Bailis, Peter; Ghodsi, Ali. *Eventual Consistency Today*. ACM Queue, 2013.
