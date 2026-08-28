---
id: social-network
title: "Case: Rede Social"
sidebar_position: 5
description: Feed para 24 milhões de usuários, onde a decisão central é quando fazer o trabalho — na escrita ou na leitura.
doc_type: case-study
level: 0
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor escolhe entre distribuição na escrita e na leitura por perfil de
  usuário, e entende por que a resposta é híbrida.
prerequisites: [trade-offs]
related: [video-streaming, messaging-platform, high-volume-events]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-29
---

# Case: Rede Social

:::note Como usar este case

Leia contexto, requisitos e restrições. **Pare antes das opções de arquitetura** e esboce a
sua em vinte minutos.

:::

## Contexto de Negócio

A **Circulo** é uma rede social brasileira voltada a comunidades de interesse — grupos de
bairro, de profissão, de hobby. Tem 24 milhões de contas, das quais 7,8 milhões usam o produto
diariamente.

O modelo é diferente do de redes globais em um aspecto que muda a arquitetura: a maior parte
do conteúdo é consumida dentro de comunidades, não numa linha do tempo global de pessoas
seguidas. Um usuário médio participa de 11 comunidades e segue 84 pessoas.

Duas pressões motivam a revisão:

**Latência do feed.** O p95 de carregamento do feed é de 2,8 segundos, e a área de produto mede
que cada 500 ms acima de 1 segundo reduz o tempo de sessão em 4%. O feed é montado na leitura,
consultando publicações de 11 comunidades e 84 perfis a cada abertura.

**Custo de leitura.** O feed é aberto 340 milhões de vezes por dia. Cada abertura dispara em
média 96 consultas ao banco, mesmo com cache. A conta de banco de dados é de R$ 22 milhões por
ano e cresce mais rápido que a base de usuários.

Não há problema de escrita: a rede produz 9 milhões de publicações por dia, o que é modesto.

## Requisitos Funcionais

O produto tem quatro superfícies principais, e é útil separá-las porque elas têm requisitos
opostos.

O **feed principal** mistura publicações das comunidades e das pessoas que o usuário segue,
ordenadas por relevância e recência. É a superfície mais acessada e a mais cara.

O **feed de comunidade** mostra as publicações de uma comunidade específica, em ordem
cronológica. É simples e barato, e representa 38% das visualizações.

O **perfil** mostra as publicações de uma pessoa, cronologicamente.

E as **notificações** avisam sobre interações — comentários, menções, reações — com entrega em
tempo quase real.

Além disso: publicar texto, imagem e vídeo curto; reagir e comentar; seguir pessoas e entrar em
comunidades; e buscar conteúdo, pessoas e comunidades.

## Requisitos Não-Funcionais

```text
p95 do feed principal             < 800 ms  (contra 2 800 ms hoje)
p95 do feed de comunidade         < 400 ms
p99 de publicação                 < 1 s
disponibilidade de leitura        99,95%
disponibilidade de publicação     99,9%
janela até a publicação aparecer
  no feed de quem segue           < 30 s
janela até aparecer no feed
  de comunidade                   < 5 s
retenção de publicações           indefinida
custo por usuário ativo diário    redução de 40%
```

A assimetria entre as duas janelas é deliberada e vem do produto: numa comunidade, a conversa é
síncrona e 30 segundos de atraso quebra o fluxo; no feed de pessoas seguidas, ninguém percebe.

Essa distinção não é detalhe. Ela significa que o sistema tem dois requisitos de janela sobre o
mesmo mecanismo de propagação, com uma diferença de 6× entre eles — e que uma solução única
precisaria atender ao mais restritivo, pagando o custo em todos os casos. Reconhecer a
assimetria cedo é o que abriu espaço para uma estratégia diferenciada, e é o tipo de informação
que só aparece quando os requisitos são levantados por superfície de produto em vez de para o
sistema como um todo.

## Restrições

```text
distribuição de seguidores  extremamente desigual: a mediana é 84 seguidores,
                            e 0,02% das contas têm mais de 500 mil
comunidades                 idem: a mediana tem 340 membros, e as 50 maiores
                            têm mais de 2 milhões cada
equipe                      86 engenheiros, 22 no domínio de feed
custo                       redução de 40% por usuário ativo é meta
                            de diretoria, não aspiração
migração                    sem janela — o produto opera 24×7 e a
                            transição precisa ser invisível
mídia                       imagens e vídeos já estão em uma rede de
                            distribuição de conteúdo; fora do escopo
```

A distribuição desigual de seguidores e de membros de comunidade é a restrição que decide a
arquitetura. Qualquer solução uniforme falha em uma das pontas: o que funciona para uma conta
com 84 seguidores não funciona para uma com 2 milhões, e vice-versa.

Vale insistir nesse ponto porque ele é a lição transferível do case. Ao projetar um sistema
social, o instinto é raciocinar sobre "o usuário" — e não existe o usuário. Existe uma
distribuição, quase sempre de cauda longa, em que a mediana e o percentil 99,99 diferem por
quatro ordens de grandeza. Decisões tomadas sobre a média são erradas nas duas pontas: caras
demais para a maioria e insuficientes para os extremos.

O primeiro artefato produzido neste projeto não foi um diagrama. Foi um histograma da
distribuição de seguidores e de membros de comunidade, com os percentis explícitos — e ele
sozinho eliminou a Opção B da discussão em uma reunião.

## Estimativas de Capacidade

```text
usuários ativos diários            7,8 milhões
aberturas de feed/dia              340 milhões
aberturas/s, média                 ~3 900
pico (19h-22h)                     ~11 500/s
com margem (2×)                    ~23 000/s

publicações/dia                    9 milhões
publicações/s, média               ~104
pico                               ~380/s
reações e comentários/dia          142 milhões
                                   →  ~1 640/s, pico ~5 000/s
```

A razão entre leitura e escrita é de **38 para 1** considerando apenas publicações, e de 2,3
para 1 considerando todas as interações. O sistema é dominado pela leitura, e é por isso que a
decisão sobre onde fazer o trabalho — na escrita ou na leitura — é a decisão central.

O cálculo que torna isso concreto:

```text
distribuição na escrita
  publicação de conta mediana (84 seguidores)     84 gravações
  publicação de conta grande (2 milhões)          2 000 000 gravações
  publicação em comunidade grande (2,4 milhões)   2 400 000 gravações

  gravações/dia, se tudo fosse distribuído        ~11,4 bilhões
  gravações/s no pico                             ~410 000/s
```

Quatrocentas mil gravações por segundo, para servir 11.500 leituras por segundo. Distribuir
tudo na escrita é claramente absurdo neste perfil — e é exatamente a solução que a literatura
sobre redes sociais globais costuma sugerir, porque lá a razão entre leitura e escrita é outra.

```text
armazenamento
  publicações (9 M/dia × 5 anos)     ~16 bilhões  →  ~4 TB de texto e metadados
  grafo de seguidores                ~2 bilhões de arestas
  membros de comunidade              ~264 milhões de arestas
  feeds materializados (se houver)   depende da decisão
```

## Opções de Arquitetura

O eixo é **quando o feed é montado**.

### Opção A — Montagem na leitura

O feed é construído no momento da abertura, consultando as publicações recentes das fontes que
o usuário segue.

```text
custo de escrita       mínimo — uma gravação por publicação
custo de leitura       alto — dezenas de consultas por abertura
latência               ruim, e piora com o número de fontes seguidas
consistência           excelente — sempre o estado atual
armazenamento          mínimo
```

É a arquitetura atual, e é a origem dos dois problemas declarados.

### Opção B — Distribuição na escrita

Ao publicar, a publicação é gravada no feed materializado de cada seguidor. A leitura é uma
consulta a uma lista pronta.

```text
custo de escrita       proibitivo para contas e comunidades grandes
custo de leitura       mínimo — uma consulta
latência               excelente
armazenamento          alto — ~11,4 bilhões de entradas/dia
problema estrutural    uma publicação numa comunidade de 2,4 milhões
                       gera 2,4 milhões de gravações; a janela de 5 s
                       é impossível de cumprir
```

### Opção C — Híbrida por perfil de fonte

Fontes pequenas são distribuídas na escrita; fontes grandes são consultadas na leitura e
mescladas com o feed materializado.

```text
custo de escrita       controlado — só fontes abaixo de um limiar
custo de leitura       baixo — uma consulta ao feed materializado
                       + N consultas às fontes grandes, com N pequeno
latência               boa
complexidade           média — duas estratégias e uma mesclagem
armazenamento          moderado
```

## Análise de Trade-offs

| Critério | Peso | A — Leitura | B — Escrita | C — Híbrida |
|---|:-:|:-:|:-:|:-:|
| Latência do feed | 30% | 2 | 9 | 8 |
| Custo total | 25% | 3 | 3 | 8 |
| Viabilidade com a distribuição real | 20% | 8 | 1 | 9 |
| Complexidade | 15% | 9 | 7 | 5 |
| Capacidade da equipe | 10% | 9 | 7 | 7 |
| **Total ponderado** | | **5,0** | **5,4** | **7,7** |

O critério "viabilidade com a distribuição real" existe porque a Opção B não é apenas cara —
ela é **impossível** de cumprir dentro do requisito de 5 segundos para comunidades grandes.
Uma opção inviável recebe nota 1, não é excluída da matriz: mostrar por que ela perde é parte
do registro.

**Análise de sensibilidade.** Com latência em 50%, os totais viram 3,8 / 6,9 / 8,0. Com custo em
50%, viram 3,6 / 3,8 / 8,2. A Opção C vence em todos os cenários testados, o que é esperado
quando uma opção combina as vantagens das outras duas — e a checagem serve para confirmar que
a complexidade adicional não a derruba.

## Decisão

**Híbrida por perfil de fonte (Opção C)**, com o limiar de distribuição definido por número de
destinatários e ajustável sem implantação.

```text
fonte com < 15 000 destinatários     distribuída na escrita
fonte com ≥ 15 000 destinatários     consultada na leitura
```

O limiar de 15 mil foi derivado, não escolhido: é o ponto em que o custo de gravação de uma
publicação iguala o custo agregado de consultá-la nas leituras esperadas até que ela saia da
janela de relevância.

Sob o limiar, 99,4% das contas e 96,1% das comunidades são distribuídas na escrita. As
restantes — cerca de 4.800 contas e 1.900 comunidades — são consultadas na leitura, o que
significa que um feed típico faz uma consulta ao feed materializado e entre zero e cinco
consultas a fontes grandes.

**Sob que condição cada opção descartada venceria:**

**Opção A venceria se** o número médio de fontes seguidas fosse muito menor — abaixo de ~10 — ou
se a latência não fosse requisito. Também venceria em um produto de nicho com poucos usuários,
em que o custo de leitura é irrelevante.

**Opção B venceria se** não existissem fontes grandes, ou seja, se a distribuição de seguidores
fosse aproximadamente uniforme. É o caso de redes corporativas fechadas, em que ninguém tem
mais de alguns milhares de conexões — e ali ela é a resposta certa, mais simples que a híbrida.

## Componentes

**Serviço de Publicação.** Recebe, valida e persiste a publicação. É o único escritor da fonte
de verdade.

**Distribuidor.** Consome publicações e grava nos feeds materializados dos destinatários,
quando a fonte está sob o limiar. Trabalha de forma assíncrona.

**Serviço de Feed.** Monta o feed na leitura: lê o feed materializado, consulta as fontes
grandes que o usuário segue, mescla e ordena.

**Serviço de Grafo.** Mantém quem segue quem e quem participa de qual comunidade. Consultado
pelo Distribuidor e pelo Serviço de Feed.

**Serviço de Ranqueamento.** Ordena o feed montado por relevância, com sinais de engajamento e
recência.

**Serviço de Interação.** Reações e comentários, que têm volume próprio e não passam pelo feed.

**Serviço de Notificação.** Entrega em tempo quase real, por conexão persistente.

**Índice de Busca.** Conteúdo, pessoas e comunidades.

A separação entre Distribuidor e Serviço de Feed é o que torna a estratégia híbrida
gerenciável: cada um implementa uma metade, e a mudança de limiar afeta apenas o
comportamento do primeiro.

## Dados

**Publicação.** Fonte de verdade em PostgreSQL, particionada por mês. Volume modesto — 9
milhões por dia — e consistência forte, porque uma publicação que some ou apareça duplicada é
percebida imediatamente.

**Feed materializado.** Armazenamento chave-valor, com uma lista por usuário.

```text
chave     feed:usuario_id
valor     lista ordenada de (publicacao_id, fonte_id, timestamp, score_base)
limite    600 entradas mais recentes; o excedente é descartado
```

O limite de 600 é o que torna o custo de armazenamento previsível: 24 milhões de usuários × 600
entradas × ~40 bytes ≈ 576 GB, independentemente do volume de publicações.

E ele é justificado por dados de produto: 97% das sessões não passam de 120 publicações, e
nenhuma sessão medida passou de 480. Guardar mais seria armazenar o que ninguém lê.

**Grafo.** Duas tabelas em PostgreSQL — seguidores e membros de comunidade — com cache das
listas mais consultadas. O grafo é lido intensamente pelo Distribuidor, e a decisão de não usar
um banco de grafos foi tomada por não haver consulta de travessia: as perguntas são "quem segue
X" e "de que comunidades Y participa", ambas de um salto.

Ver [SQL vs. NoSQL](../20-trade-offs/sql-vs-nosql.md) — o padrão de acesso é conhecido e raso,
o que não justifica um segundo tipo de banco.

**Contagem de interações.** Contadores aproximados para publicações com alto volume, exatos
abaixo de um limiar. Uma publicação com 400 mil reações não precisa de contagem exata, e mantê-la
exata cria contenção severa. Ver
[pontos quentes](../11-scalability/hotspots.md).

O limiar entre contagem exata e aproximada foi fixado em 5 mil interações, e a escolha tem
justificativa de produto: acima desse número, nenhum usuário distingue 5 200 de 5 240, e a
publicação já está no regime em que o número comunica magnitude e não quantidade. Abaixo dele,
o autor de uma publicação com 40 reações percebe se uma desaparece.

Essa é uma decisão em que a resposta técnica correta depende inteiramente de percepção humana, e
ela foi validada com um teste simples: mostrar dois números a usuários e perguntar se notavam a
diferença. Nenhuma análise de contenção teria produzido o limiar certo.

## Integração

**Publicação até o feed.** O Serviço de Publicação persiste e emite um evento. O Distribuidor
consome, consulta o grafo, decide pela estratégia e — se for distribuir — grava nos feeds
materializados em lotes.

O tempo entre publicar e aparecer é dominado pelo tamanho da audiência: uma conta com 84
seguidores completa em menos de 200 ms; uma comunidade com 14 mil membros, em cerca de 4
segundos. É por isso que o limiar de 15 mil também satisfaz a janela de 5 segundos das
comunidades — ele foi verificado contra os dois requisitos, e o mais restritivo venceu.

**Fontes grandes na leitura.** Cada fonte acima do limiar mantém uma lista das suas publicações
recentes em cache, com TTL curto. O Serviço de Feed lê essas listas — no máximo algumas por
usuário — e as mescla com o feed materializado antes de ranquear.

**Ranqueamento.** Recebe o conjunto mesclado e ordena. Roda na leitura, com orçamento de 120 ms,
e degrada para ordenação cronológica se estourar o prazo.

## Segurança

```text
visibilidade         cada publicação carrega escopo (pública, comunidade,
                     seguidores); a checagem é feita na montagem do feed
                     e novamente na leitura da publicação
comunidade fechada   membros são verificados a cada leitura, não confiando
                     no feed materializado
remoção              publicação removida some do feed em até 30 s, por
                     evento de invalidação; e é filtrada na leitura
                     enquanto isso
bloqueio entre
  usuários            aplicado na montagem e na leitura
dados pessoais       grafo de seguidores é dado sensível; exportação
                     restrita e registrada
moderação            fila de revisão com acesso registrado; conteúdo
                     removido preserva registro para contestação
```

A checagem dupla — na montagem e na leitura — parece redundante e não é. Um feed materializado
é um retrato de um momento; permissões mudam depois. Sem a segunda checagem, alguém removido de
uma comunidade continuaria vendo publicações dela por até 600 entradas.

Esse é o custo de correção da distribuição na escrita, e ele é permanente: qualquer sistema que
materializa uma visão precisa revalidar autorização no momento da leitura.

## Escalabilidade

O sistema escala por leitura, e o feed materializado é o que torna isso barato: 11.500 aberturas
por segundo viram 11.500 leituras de chave-valor mais algumas consultas a fontes grandes.

```text
antes (Opção A)     ~96 consultas por abertura  →  ~1,1 milhão de consultas/s no pico
depois (Opção C)    ~4,2 consultas por abertura →  ~48 mil consultas/s no pico
```

A redução de 23× no número de consultas é a origem da economia de custo, e ela vem inteiramente
de mover trabalho da leitura para a escrita — onde ele é feito uma vez em vez de a cada
abertura.

O ponto de contenção que sobrou é o **Distribuidor** durante picos de publicação em comunidades
próximas do limiar. A solução é fila com prioridade: publicações de comunidades pequenas, que
têm requisito de 5 segundos, passam à frente de publicações de contas pessoais, cujo requisito é
de 30 segundos.

## Confiabilidade

Se o **Distribuidor** falha, publicações param de aparecer nos feeds materializados. O sistema
degrada acrescentando as fontes recentes na leitura — mais caro, mais lento, e correto. A fila
acumula e é processada quando ele volta.

Se o **feed materializado** fica indisponível, o Serviço de Feed cai integralmente para
montagem na leitura, que é a arquitetura antiga. É lento e funciona, e existe porque o código
da Opção A foi mantido deliberadamente como modo de degradação.

Se o **Ranqueamento** falha, o feed é ordenado cronologicamente. A qualidade cai e o produto
funciona.

Se a **Publicação** falha, não há degradação. É o componente com o alvo mais alto.

A decisão de manter o caminho de montagem na leitura como modo degradado tem custo — é código
que precisa continuar funcionando — e foi justificada por ser também o caminho usado pelas
fontes grandes. Ele não é código morto mantido por precaução; é código vivo com um segundo uso.

Essa propriedade — o modo de degradação sendo também um caminho usado em operação normal — é o
que torna a degradação confiável. Modos de emergência que só executam em emergência apodrecem
sem que ninguém perceba, e falham justamente quando são acionados. No desenho final, o caminho
de montagem na leitura processa continuamente as fontes grandes de todos os usuários, o que
significa que ele é exercitado milhares de vezes por segundo e não pode estar quebrado sem que
o sistema inteiro perceba.

Quando um modo degradado não puder ter uso normal, a alternativa é exercitá-lo
deliberadamente — acionando-o em uma fração pequena do tráfego, de forma programada.

## Observabilidade

```text
latência do feed, p50/p95/p99, separada por
  usuários com e sem fontes grandes
consultas por abertura de feed, distribuição
atraso de distribuição, p95, por faixa de audiência
taxa de degradação para montagem na leitura
tamanho do feed materializado, distribuição
custo por usuário ativo diário, decomposto por componente
publicações filtradas na leitura por permissão
```

A última métrica é de correção: um valor alto indica que a distribuição está gravando em feeds
de quem não deveria ver, o que é um defeito de autorização, não de desempenho.

A separação da latência entre usuários com e sem fontes grandes foi essencial: a média
escondia que 8% dos usuários — os que seguem muitas contas grandes — tinham latência três vezes
pior. O p95 agregado parecia bom e o produto era ruim para uma fatia identificável.

## Implantação

A transição foi feita com escrita dupla e leitura comparada, sem janela.

```text
etapa 1   o Distribuidor passa a gravar feeds materializados,
          e ninguém os lê
etapa 2   o Serviço de Feed monta pelos dois caminhos e compara,
          servindo o resultado antigo; divergências são registradas
etapa 3   leitura pelo caminho novo para 1% dos usuários, depois 10%, 50%
etapa 4   caminho antigo vira modo de degradação
```

A etapa 2 durou seis semanas e encontrou 9 classes de divergência, das quais 6 eram defeitos do
caminho novo e 3 eram comportamentos não documentados do antigo — o mesmo padrão observado no
case de [núcleo bancário](banking.md), em contexto completamente diferente.

A recorrência desse padrão em dois domínios sem nenhuma relação sugere que ele é uma propriedade
do método, e não dos sistemas: sempre que dois caminhos produzem o mesmo resultado e são
comparados sob tráfego real, uma parte das divergências encontradas descreve o comportamento
antigo, não defeitos do novo. Comparar em produção é, entre outras coisas, uma forma barata de
documentar o que ninguém escreveu.

## Estratégia de Evolução

**Fase 1 (meses 1–3): distribuição para fontes pequenas.** Distribuidor, feed materializado e
escrita dupla. Nenhuma leitura muda.

**Fase 2 (meses 4–6): leitura híbrida com comparação.** O Serviço de Feed monta pelos dois
caminhos, compara e serve o antigo.

**Fase 3 (meses 7–9): virada progressiva.** Leitura pelo caminho novo, por percentual de
usuários, com reversão por configuração.

**Fase 4 (meses 10–13): ranqueamento.** Substituição da ordenação cronológica por relevância,
com experimento controlado.

**Fase 5 (meses 14–18): limiar dinâmico.** O limiar de 15 mil passa a ser calculado por
comunidade e por conta, considerando a taxa real de leitura da audiência — uma comunidade com 20
mil membros dos quais 200 abrem o feed diariamente não merece a mesma estratégia de uma com 20
mil membros ativos.

**Condições que mudariam o plano:**

```text
se a distribuição de seguidores se aproximar da uniforme
  → a Opção B passa a ser viável e é mais simples

se o número médio de fontes seguidas passar de ~300
  → o feed materializado de 600 entradas fica dominado por
    poucas fontes, e a estratégia precisa de cota por fonte

se o ranqueamento passar a exigir sinais em tempo real
  → o orçamento de 120 ms na leitura é insuficiente, e parte
    do ranqueamento precisa migrar para a escrita

se comunidades acima de 5 milhões de membros surgirem
  → a leitura de fontes grandes precisa de replicação
    geográfica, não só de cache
```

## Resultados

Números ao fim da Fase 4, 13 meses após o início:

```text
p95 do feed principal              de 2 800 ms para 640 ms
p95 do feed de comunidade          de 1 400 ms para 310 ms
consultas por abertura             de ~96 para ~4,2
custo de banco de dados            de R$ 22 mi/ano para R$ 7,4 mi/ano
custo por usuário ativo diário     -58% (meta era -40%)
tempo médio de sessão              +19%
publicações filtradas na leitura
  por permissão                    0,03% — dentro do esperado
```

## O que este case ensina

**A pergunta é quando fazer o trabalho, não como.** Distribuir na escrita e montar na leitura são
o mesmo trabalho em momentos diferentes. A escolha depende da razão entre leitura e escrita, e
essa razão varia por fonte dentro do mesmo sistema.

**A distribuição estatística é uma restrição de arquitetura.** A desigualdade entre a mediana e o
extremo — 84 seguidores contra 2 milhões — é o que torna qualquer solução uniforme errada. Ler
essa distribuição antes de decidir teria evitado o desenho original.

**Materializar exige revalidar.** Todo sistema que grava uma visão precisa checar autorização de
novo na leitura, porque permissões mudam depois do retrato. É um custo permanente e é o preço da
distribuição na escrita.

**A média escondia o produto.** O p95 agregado do feed parecia aceitável, e 8% dos usuários
tinham experiência três vezes pior. Segmentar a métrica pelo que a arquitetura trata de forma
diferente é o que tornou o problema visível.

## Conceitos Relacionados

- [Pontos Quentes](../11-scalability/hotspots.md).
- [SQL vs. NoSQL](../20-trade-offs/sql-vs-nosql.md).
- [Case: Plataforma de Mensageria](messaging-platform.md).
- [Cache](../05-system-design/caching.md).

## Exercício Prático

Calcule o limiar de distribuição para um perfil diferente: 40 fontes seguidas em média, 900
milhões de aberturas de feed por dia, 2 milhões de publicações por dia.

O limiar sobe ou desce? A resposta mostra que o número não é uma constante da arquitetura — é
uma função do perfil de uso.

## Perguntas de Entrevista

- Por que distribuir tudo na escrita é impossível, e não apenas caro, neste sistema?
- Por que um feed materializado exige revalidar permissão na leitura?
- Por que o limiar de 15 mil satisfaz simultaneamente dois requisitos de janela diferentes?

## Para Aprofundar

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 — cap. 1.
- Silberstein, Adam et al. *Feeding Frenzy: Selectively Materializing Users' Event Feeds*.
  SIGMOD, 2010.
- Nygard, Michael. *Release It!*. 2ª ed. Pragmatic Bookshelf, 2018.
