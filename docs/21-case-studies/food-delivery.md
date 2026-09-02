---
id: food-delivery
title: "Case: Delivery de Comida"
sidebar_position: 4
description: Coordenação em tempo real entre clientes, restaurantes e entregadores, onde o dado mais importante envelhece em segundos.
doc_type: case-study
level: 0
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor projeta um sistema de coordenação em tempo real com estado
  geográfico, atribuição sob incerteza e degradação por região.
prerequisites: [trade-offs]
related: [ride-sharing, logistics, ecommerce]
canonical_for: []
content_version: 3
last_reviewed: 2026-08-29
---

# Case: Delivery de Comida

:::note Como usar este case

Leia contexto, requisitos e restrições. **Pare antes das opções de arquitetura** e esboce a
sua em vinte minutos.

Os números deste case são **ilustrativos** (SPEC.md §8.2): plausíveis e internamente
coerentes, não medidos num sistema nomeado. O que se aprende é o raciocínio que eles
sustentam, não as grandezas.

:::

## Contexto de Negócio

A **Rapidão** é uma plataforma de entrega de comida que opera em 62 cidades brasileiras, com
48 mil restaurantes cadastrados e uma base de 190 mil entregadores, dos quais cerca de 34 mil
ficam ativos em um dia típico.

O negócio tem uma característica que o diferencia de comércio eletrônico: **o produto é
perecível e o prazo é o produto**. Um pedido entregue 40 minutos atrasado não é um pedido
entregue com atraso — é comida fria, e o cliente não volta. A empresa mede que um atraso acima
de 15 minutos sobre a estimativa reduz a probabilidade de novo pedido em 31%.

Três pressões motivam a revisão da arquitetura:

**Precisão da estimativa de entrega.** O erro médio da estimativa exibida ao cliente é de 11
minutos, e a área de produto correlaciona isso diretamente com retenção. A estimativa atual é
calculada com uma fórmula estática por região, sem considerar o estado real da operação.

**Atribuição de entregadores.** A atribuição é feita por proximidade simples, o que produz
dois problemas conhecidos: entregadores recebem corridas que passam pela porta de outro
restaurante com pedido pronto, e em horário de pico há regiões com pedidos sem entregador
enquanto regiões vizinhas têm entregadores ociosos.

**Custo de infraestrutura.** A plataforma gasta R$ 31 milhões por ano em nuvem, e 44% disso é
consumido pelo rastreamento de posição dos entregadores — 34 mil dispositivos enviando
localização a cada 4 segundos.

## Requisitos Funcionais

O sistema tem três públicos com necessidades diferentes, e é útil separá-los.

Para o **cliente**: buscar restaurantes disponíveis considerando distância e tempo de
entrega; montar e enviar pedido; acompanhar o estado em tempo real, incluindo a posição do
entregador; e ser avisado de atrasos antes de perguntar.

Para o **restaurante**: receber pedidos; confirmar ou recusar em janela curta; informar o
tempo de preparo real; e sinalizar quando o pedido está pronto para retirada.

Para o **entregador**: receber ofertas de corrida compatíveis com sua posição e rota; aceitar
ou recusar; navegar até o restaurante e até o cliente; e registrar retirada e entrega.

E para a **plataforma**: atribuir entregadores a pedidos otimizando prazo e custo; estimar
tempo de entrega com precisão; detectar e reagir a atrasos; e equilibrar oferta e demanda por
região, com incentivos dinâmicos.

A atribuição é o núcleo do produto. Tudo o mais existe para viabilizá-la ou para comunicar
seu resultado.

## Requisitos Não-Funcionais

```text
disponibilidade da criação de pedido      99,95%
disponibilidade da atribuição             99,9%
p99 de busca de restaurantes              < 600 ms
p99 de criação de pedido                  < 1,5 s
tempo até atribuir entregador             < 20 s do momento em que o
                                          pedido é confirmado
latência da posição do entregador
  exibida ao cliente                      < 8 s
erro da estimativa de entrega             < 5 min em 80% dos pedidos
janela de inconsistência do cardápio      < 2 min
retenção de posição de entregador         90 dias
```

O requisito de 20 segundos para atribuição é o mais restritivo. Ele não é arbitrário: acima
disso, o restaurante começa a preparar sem saber se haverá quem retire, e o desperdício
aparece como comida pronta esperando.

## Restrições

```text
dispositivos       o aplicativo do entregador roda em aparelhos de baixo
                   custo, com conectividade instável; perda de sinal por
                   minutos é normal, não é exceção
geografia          62 cidades com densidades muito diferentes: de 4 mil
                   entregadores ativos numa capital a 40 numa cidade menor
regulatório        entregadores não têm vínculo empregatício; a plataforma
                   não pode impor rota nem jornada, apenas oferecer
custo              a diretoria estabeleceu teto de crescimento de custo
                   de infraestrutura em 50% do crescimento de pedidos
equipe             120 engenheiros, 18 no domínio de logística
tempo real         o cliente espera ver o entregador se movendo; parar
                   de mostrar é percebido como falha do aplicativo
```

A restrição de conectividade dos dispositivos é a que mais afeta o desenho: um sistema que
pressupõe conexão contínua com 34 mil entregadores não funciona no Brasil real.

## Estimativas de Capacidade

```text
pedidos/dia, média                     1,9 milhão
pedidos/s, média                       ~22
pico (sexta e sábado, 19h-21h)         ~340 mil/h  →  ~94/s
pico instantâneo observado             ~210/s
margem de projeto (3×)                 ~650/s
```

O volume de pedidos, mais uma vez, é modesto. O que não é modesto é o volume de **posição**:

```text
entregadores ativos simultâneos, pico   ~34 mil
frequência de envio de posição          1 a cada 4 s
posições/s no pico                      ~8 500/s
posições/dia                            ~420 milhões
volume bruto/dia                        ~34 GB
```

Oito mil e quinhentas escritas por segundo de dados que envelhecem em segundos e são
consultados por dois públicos com necessidades opostas: o cliente quer a posição do **seu**
entregador com latência baixa; o motor de atribuição quer as posições de **todos** os
entregadores de uma região, agregadas.

E as consultas de busca:

```text
buscas de restaurante/dia               ~14 milhões
pico de busca                           ~1 200/s
restaurantes por busca, após filtro
  geográfico                            ~180 em média
```

**A conclusão que orienta o desenho:** o sistema tem um núcleo transacional pequeno (pedidos)
e dois subsistemas de alto volume com características totalmente diferentes (posição e busca).
Tratá-los com a mesma arquitetura seria caro nos três.

## Opções de Arquitetura

O ponto de decisão principal é **onde vive o estado de posição e como a atribuição o consulta**.

### Opção A — Posição no banco transacional

Cada posição recebida atualiza uma linha no banco relacional principal. A atribuição consulta
esse banco com filtro geográfico.

```text
simplicidade         alta — um banco, um modelo
custo                8 500 escritas/s no banco principal, com replicação
                     e retenção: estimado em R$ 21 mi/ano
latência de consulta boa com índice geoespacial adequado
risco                a escrita de posição compete com a de pedido; um pico
                     de posição afeta a criação de pedidos
```

### Opção B — Posição em armazenamento em memória, com histórico assíncrono

A posição atual vive em um armazenamento chave-valor em memória, particionado por região. O
histórico é gravado de forma assíncrona em armazenamento barato, para análise e disputas.

```text
custo                estimado em R$ 6,4 mi/ano
latência             melhor — leitura de memória
isolamento           a posição não compete com o pedido
perda                posições podem ser perdidas em falha do armazenamento;
                     aceitável, pois a próxima chega em 4 s
consulta geográfica  exige indexação por célula geográfica na aplicação
```

### Opção C — Processamento de fluxo com estado

As posições entram num fluxo de eventos; um processador com estado mantém a visão por região e
publica agregados. A atribuição consome os agregados.

```text
custo                estimado em R$ 9,1 mi/ano
latência             +200 a 500 ms de janela de processamento
capacidade           melhor para lógica complexa sobre a série de posições
                     (velocidade, direção, previsão de chegada)
complexidade         alta — estado distribuído, reprocessamento, ordem
equipe               nenhuma pessoa com experiência na tecnologia
```

## Análise de Trade-offs

| Critério | Peso | A — Banco | B — Memória | C — Fluxo |
|---|:-:|:-:|:-:|:-:|
| Custo de infraestrutura | 30% | 2 | 9 | 7 |
| Latência de atribuição | 20% | 7 | 9 | 6 |
| Isolamento do fluxo de pedido | 20% | 2 | 9 | 8 |
| Capacidade da equipe | 15% | 9 | 8 | 3 |
| Suporte a lógica de previsão | 10% | 4 | 5 | 9 |
| Complexidade operacional | 5% | 9 | 7 | 3 |
| **Total ponderado** | | **4,6** | **8,4** | **6,4** |

O peso de 30% em custo reflete a restrição da diretoria — é uma restrição de negócio
declarada, e ignorá-la produziria uma proposta que não seria aprovada.

**Análise de sensibilidade**, redistribuindo o peso restante proporcionalmente entre os demais critérios. Com custo em 10% e capacidade de previsão em 30%,
os totais viram 5,0 / 7,6 / 6,8 — a Opção B ainda vence, com a vantagem sobre C caindo de 1,9
para 0,8. Com isolamento em 40%, viram 4,0 / 8,5 / 6,8. A conclusão é estável, e o cenário em
que C se aproxima é justamente aquele em que a previsão de chegada vira o produto.

## Decisão

**Posição em armazenamento em memória particionado por região (Opção B)**, com histórico
assíncrono em armazenamento barato e indexação por célula geográfica.

**Sob que condição cada opção descartada venceria:**

**Opção A venceria se** o número de entregadores ativos fosse uma ordem de grandeza menor —
abaixo de ~3 mil simultâneos, o custo deixa de ser relevante e a simplicidade de um banco só
domina. É o caso de uma plataforma operando em poucas cidades.

**Opção C venceria se** a previsão de chegada baseada em série temporal de posições virasse
diferencial de produto, ou se a plataforma precisasse de reprocessamento histórico para treinar
modelos continuamente. A condição está registrada: quando o erro da estimativa cair abaixo de
5 minutos por outros meios e a próxima melhoria depender de modelagem sobre trajetória, a
decisão é reavaliada.

## Componentes

O sistema é organizado em quatro domínios com fronteiras claras.

**Domínio de catálogo e busca.** Restaurantes, cardápios, disponibilidade e o índice de busca
geográfico. Predominantemente leitura, tolerante a alguns minutos de defasagem.

**Domínio de pedido.** Criação, confirmação pelo restaurante, ciclo de vida e pagamento. É o
núcleo transacional, com consistência forte e o menor volume dos quatro.

**Domínio de posição.** Ingestão de posições, estado atual por entregador, agregação por
região e histórico. Alto volume, dado efêmero, tolerância a perda.

**Domínio de atribuição.** O motor que casa pedidos e entregadores, o cálculo de estimativa de
entrega e a gestão de incentivos por região. Consome dos três anteriores.

Além disso, um **serviço de comunicação em tempo real** mantém conexões abertas com clientes,
restaurantes e entregadores, e é a única porta por onde atualizações são empurradas.

A separação entre posição e atribuição merece explicação: são dois problemas com perfis de
carga opostos. Posição é escrita massiva de dado simples; atribuição é leitura de agregados com
computação intensa. Mantê-los juntos faria o custo de escalar um contaminar o outro.

## Dados

**Posição.** O estado atual de cada entregador vive em memória, com chave composta pela célula
geográfica e pelo identificador do entregador.

```text
chave     regiao:celula_geo:entregador
valor     lat, lon, direcao, velocidade, bateria, estado, atualizado_em
TTL       45 s — um entregador sem posição por 45 s sai da grade
```

O TTL é uma decisão importante: em vez de gerenciar explicitamente entregadores que perderam
conexão, o sistema os deixa expirar. Isso torna a perda de sinal — que é comum — um caso normal
em vez de um erro a tratar.

**Célula geográfica.** O território é dividido em células hexagonais de tamanho fixo. Cada
posição é indexada pela célula em que cai, e uma consulta por proximidade lê a célula do
restaurante e suas vizinhas.

Isso substitui a consulta geoespacial por leitura de chaves conhecidas, que é ordens de
grandeza mais barata. O custo é precisão: entregadores na borda de uma célula distante podem
ser ignorados. A mitigação é usar dois anéis de vizinhança em regiões de baixa densidade.

**Histórico de posição.** Gravado de forma assíncrona, comprimido, em armazenamento de objetos
particionado por dia e região. É consultado apenas para disputas e para análise — cerca de 400
consultas por dia sobre 420 milhões de registros diários, o que justifica plenamente o
armazenamento lento e barato.

**Pedido.** PostgreSQL, com o ciclo de vida como máquina de estados explícita. O volume é baixo
e a consistência precisa ser forte: um pedido não pode ser atribuído a dois entregadores.

**Catálogo.** PostgreSQL como fonte de verdade, com índice de busca dedicado alimentado por
eventos. A disponibilidade de cada item — que muda ao longo do dia, quando ingredientes acabam
— é propagada com janela de até 2 minutos, o que é o requisito.

## Integração

**Ingestão de posição.** É o caminho de maior volume e o que precisa ser mais barato. As
posições chegam por conexão persistente, em lotes de até 5 pontos, comprimidos. O aplicativo
acumula localmente quando perde sinal e envia o lote quando reconecta, com carimbos de tempo
originais.

Essa decisão — acumular e enviar em lote — foi o que reduziu o custo de ingestão em 38%, e ela
existe por causa da restrição de conectividade. O sistema trata reconexão com lote atrasado
como caso normal.

**Atribuição.** Quando um pedido é confirmado pelo restaurante, o motor de atribuição consulta
a grade de entregadores das células relevantes, calcula um escore por candidato e envia ofertas.

O escore combina distância até o restaurante, direção atual do entregador, tempo estimado de
preparo restante, valor do pedido e histórico de aceitação. Ofertas são enviadas a até 3
candidatos simultaneamente, e a primeira aceitação vence — o que exige que a aceitação seja
uma operação atômica no domínio de pedido.

**Comunicação em tempo real.** Conexões persistentes com três públicos, com estratégias
distintas: cliente recebe posição do entregador a cada 5 segundos apenas enquanto a tela de
acompanhamento está aberta; restaurante recebe notificação de pedido; entregador recebe ofertas
e atualizações de rota.

A restrição de só enviar posição com a tela aberta parece óbvia e não era o comportamento
anterior — ela sozinha reduziu 22% do tráfego de saída.

## Segurança

```text
posição de entregador     dado pessoal sensível; retenção de 90 dias,
                          acesso restrito e registrado
posição exibida ao
  cliente                 apenas durante a entrega ativa, e apenas do
                          entregador do seu pedido
dados de pagamento        tokenizados, fora do escopo da plataforma
acesso de suporte         posição histórica exige justificativa e fica
                          registrada; consulta em massa é bloqueada
restaurante               vê o endereço do cliente apenas após confirmação
                          do pedido, e por tempo limitado
entregador                vê o endereço completo apenas após a retirada
```

As duas últimas linhas são decisões de privacidade que também são de produto: elas reduzem a
superfície de uso indevido de endereços de clientes, que é um risco real da categoria.

O mapeamento de fluxo de dado pessoal identificou que o histórico de posição, cruzado com
pedidos, permite reconstruir a rotina de um cliente. A retenção de 90 dias e a segregação do
histórico de posição do domínio de pedido são consequência direta desse mapeamento. Ver
[diagramas de fluxo de dados](/17-architecture-documentation/data-flow-diagrams.md).

## Escalabilidade

O sistema escala por **região**, não globalmente. Cada região tem sua própria grade de posição,
seu motor de atribuição e sua capacidade dimensionada pelo padrão local.

Isso tem três consequências positivas. O custo acompanha a densidade real: uma cidade com 40
entregadores não paga infraestrutura de capital. Uma falha fica contida numa região. E o pico —
que é sincronizado dentro de uma cidade mas não entre fusos e hábitos diferentes — é absorvido
com menos capacidade ociosa agregada.

O pico de sexta e sábado à noite é previsível e concentrado. A capacidade é elevada por
agendamento, não por reação — escalar reativamente com 20 segundos de requisito de atribuição
é apertado demais.

O ponto de contenção real é a **aceitação de oferta**: quando três entregadores recebem a mesma
oferta, a aceitação precisa ser atômica. A solução é contenção por linha do pedido, com prazo
curto — não bloqueio distribuído, porque o volume não justifica.

## Confiabilidade

O sistema degrada por camada, e cada degradação foi desenhada e comunicada.

Se a **grade de posição** de uma região fica indisponível, a atribuição cai para o modo por
raio fixo a partir da última posição conhecida no histórico, com janela ampliada. É pior, e
funciona.

Se o **motor de atribuição** falha, os pedidos entram numa fila e são atribuídos quando ele
volta. O restaurante é avisado para não iniciar o preparo — o que evita o desperdício que o
requisito de 20 segundos existe para prevenir.

Se a **comunicação em tempo real** cai, os aplicativos passam a consultar o estado
periodicamente, com intervalo maior. O cliente vê a posição atualizar mais devagar, com aviso.

Se o **catálogo** fica indisponível, a busca serve do índice, que é uma cópia. Pedidos novos
continuam sendo aceitos com o cardápio possivelmente defasado, e a confirmação do restaurante
resolve divergências.

Se o **pedido** fica indisponível, não há degradação: nada funciona. É o componente com o alvo
mais alto e o único sem alternativa.

## Observabilidade

As métricas mais importantes deste sistema são de negócio, não técnicas.

```text
tempo até atribuição, p50 e p95, por região
taxa de pedidos sem entregador em 60 s, por região
erro da estimativa de entrega, distribuição
taxa de aceitação de oferta, por entregador e por região
razão entre entregadores ativos e pedidos, por célula
posições recebidas/s, e taxa de lote atrasado
custo por pedido, calculado e acompanhado
```

A razão entre entregadores e pedidos por célula é o indicador operacional central: ela antecede
o problema. Quando cai abaixo de um limiar numa região, o sistema aciona incentivo dinâmico
antes que os pedidos comecem a atrasar.

O **custo por pedido** como métrica acompanhada continuamente foi consequência da restrição
orçamentária. Ele é decomposto por domínio, e cada equipe vê a sua parcela — o que produziu
otimizações que nenhuma diretriz teria produzido.

## Implantação

Implantação por região, em ondas: primeiro cidades pequenas, depois médias, depois capitais.
Uma mudança no motor de atribuição passa 48 horas em pelo menos três cidades pequenas antes de
chegar a São Paulo.

Mudanças no algoritmo de atribuição são avaliadas por experimento controlado, com regiões
comparáveis divididas entre versões — porque o efeito de uma mudança de atribuição só aparece
em métricas de negócio agregadas, e não em teste.

Nenhuma mudança estrutural entre quinta e domingo. O pico de fim de semana concentra 41% do
volume semanal.

A janela de implantação por ondas tem um efeito secundário que a equipe passou a valorizar mais
que o próprio controle de risco: ela produz um período em que duas versões do motor de
atribuição operam em regiões comparáveis, o que dá uma leitura natural do efeito da mudança
sobre métricas de negócio. Antes das ondas, uma alteração no algoritmo era avaliada por
comparação com a semana anterior — e o volume de delivery varia tanto por clima, feriado e
campanha que essa comparação raramente concluía algo.

## Estratégia de Evolução

**Fase 1 (meses 1–4): grade de posição.** Migração do rastreamento para o armazenamento em
memória, com histórico assíncrono. Entrega a redução de custo, que financia o resto do projeto.

**Fase 2 (meses 5–8): atribuição por escore.** Substituição da proximidade simples por escore
multifator, com experimento controlado por região.

Resultado medido: tempo até atribuição caiu de 34 s para 11 s no p95, e a taxa de pedidos sem
entregador em 60 s caiu de 4,1% para 0,9%.

**Fase 3 (meses 9–13): estimativa dinâmica.** A estimativa passa a considerar o tempo de preparo
real observado por restaurante e por horário, a densidade de entregadores na região e as
condições de trânsito.

O erro médio caiu de 11 min para 6,2 min. O requisito de 5 min em 80% dos pedidos foi atingido
para 74% — abaixo do alvo, e o gargalo identificado foi a variabilidade do tempo de preparo,
que é do restaurante e não da plataforma.

**Fase 4 (meses 14–18): equilíbrio de oferta.** Incentivos dinâmicos por célula, acionados pela
razão entre entregadores e pedidos, antes do atraso ocorrer.

**Fase 5 (meses 19–24): previsão.** Modelagem sobre trajetória para prever chegada, o que
reabre a avaliação da Opção C.

**Condições que mudariam o plano:**

```text
se a variabilidade do tempo de preparo dominar o erro da estimativa
  → o problema é do restaurante, e a solução é de produto (tablet com
    confirmação de início de preparo), não de arquitetura

se o número de entregadores simultâneos passar de 100 mil
  → a grade por célula precisa de hierarquia, não só de partição

se a previsão de chegada virar diferencial competitivo
  → a Opção C é reavaliada para o domínio de posição

se a regulação criar vínculo empregatício para entregadores
  → o modelo de oferta e aceitação muda completamente, e o motor
    de atribuição vira escalonamento, não leilão
```

A última condição é a mais relevante e a menos técnica: uma mudança regulatória transformaria o
problema de "oferecer e esperar aceitação" em "designar e garantir cobertura", que é uma
arquitetura diferente.

## Resultados

Números ao fim da Fase 4, 18 meses após o início:

```text
custo de infraestrutura                 de R$ 31 mi/ano para R$ 19 mi/ano,
                                        com crescimento de 34% em pedidos
custo por pedido                        -47%
tempo até atribuição, p95               de 34 s para 9 s
pedidos sem entregador em 60 s          de 4,1% para 0,6%
erro da estimativa, média               de 11 min para 6,2 min
pedidos com atraso > 15 min             de 8,4% para 3,1%
retenção de clientes em 90 dias         +6,8 p.p.
```

O ganho de retenção é o resultado que a empresa considera decisivo, e ele é consequência direta
da redução de atrasos — que era a tese do projeto.

Vale notar o que a redução de custo permitiu, além da economia em si: os R$ 12 milhões anuais
liberados financiaram integralmente as Fases 2 a 4, o que tornou o projeto autossustentado a
partir do quarto mês. Essa foi uma escolha deliberada de sequenciamento — começar pela fase que
paga as seguintes, em vez de pela que entrega mais valor de produto. É o mesmo raciocínio de
ordem de extração do case de [e-commerce](/21-case-studies/ecommerce.md), aplicado a um critério diferente.

## O que este case ensina

**Um sistema, três perfis de carga.** Pedido é transacional e pequeno; posição é escrita massiva
e efêmera; busca é leitura pesada e tolerante. Aplicar a mesma arquitetura aos três seria caro
em todos.

**Dado efêmero não merece durabilidade.** Posições que envelhecem em 4 segundos não precisam de
transação, replicação síncrona nem retenção quente. Tratá-las como dado transacional custava
R$ 21 milhões por ano para garantir uma propriedade que ninguém usava.

**A restrição de conectividade moldou o desenho.** Lote acumulado, carimbo de tempo original,
TTL em vez de gestão de desconexão — três decisões que só fazem sentido para quem opera com
aparelhos que perdem sinal, e que reduziram custo e complexidade ao mesmo tempo.

**O limite do sistema não era o sistema.** A Fase 3 atingiu 74% contra um alvo de 80%, e o
gargalo era a variabilidade do tempo de preparo dos restaurantes. Nenhuma decisão de arquitetura
resolveria — e reconhecer isso evitou meses de otimização no lugar errado.

## Conceitos Relacionados

- [Case: Ride-Sharing](/21-case-studies/ride-sharing.md) — o mesmo problema de coordenação, com outras
  restrições.
- [Case: Logística](/21-case-studies/logistics.md).
- [Pontos Quentes](/11-scalability/hotspots.md).
- [Degradação Graciosa](/12-reliability/graceful-degradation.md).

## Exercício Prático

Calcule o custo anual de armazenar 420 milhões de posições por dia em um banco relacional com
replicação síncrona e retenção de 90 dias, e compare com armazenamento em memória com TTL de 45
segundos mais objetos comprimidos.

A diferença é a razão de este case existir.

## Perguntas de Entrevista

- Por que o TTL de 45 segundos transforma perda de conexão em caso normal?
- Por que a indexação por célula geográfica substitui consulta geoespacial, e o que se perde?
- Por que a atribuição envia oferta a três candidatos, e o que isso exige do domínio de pedido?

## Para Aprofundar

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Uber Engineering. *H3: Hexagonal Hierarchical Spatial Index*, 2018.
- Nygard, Michael. *Release It!*. 2ª ed. Pragmatic Bookshelf, 2018.
