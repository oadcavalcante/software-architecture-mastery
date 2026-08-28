---
id: ecommerce
title: "Case: E-commerce Omnicanal"
sidebar_position: 1
description: Varejista com 1.400 lojas migrando de uma suíte de comércio comprada para uma arquitetura própria, sem parar de vender.
doc_type: case-study
level: 0
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor conduz uma análise completa de evolução arquitetural, escolhendo a
  ordem de extração por taxa de mudança e acoplamento, não por facilidade.
prerequisites: [trade-offs]
related: [legacy-modernization-case, logistics, saas-platform]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-29
---

# Case: E-commerce Omnicanal

:::note Como usar este case

Leia contexto, requisitos e restrições. **Pare antes das opções de arquitetura** e esboce a
sua em vinte minutos. Só então continue.

O valor não está em concordar com a decisão do texto — está em descobrir qual restrição você
não tinha considerado.

:::

## Contexto de Negócio

A **Vertena** é uma varejista brasileira de artigos para casa e construção, com 1.400 lojas
físicas em 21 estados e um canal digital que representa 18% do faturamento.

Faturamento anual: R$ 4,2 bilhões, dos quais R$ 760 milhões no digital.

O canal digital roda sobre uma suíte de comércio comprada em 2016, customizada ao longo de
nove anos. A suíte cobre catálogo, carrinho, pedido, pagamento, promoções e um portal
administrativo.

Três pressões de negócio motivam a revisão da arquitetura:

**Omnicanalidade.** A empresa quer vender o estoque das lojas pelo site — "retire na loja",
"entrega a partir da loja mais próxima" e "compre online, troque na loja". Hoje, o estoque
digital é um centro de distribuição único, e as 1.400 lojas são invisíveis para o site.
Concorrentes já oferecem isso, e a área comercial estima entre 12% e 18% de aumento de
conversão.

**Velocidade de mudança.** Cada alteração no fluxo de compra passa pela integradora que
mantém a suíte. O prazo médio entre pedido de negócio e produção é de **14 semanas**. A área
de produto tem 40 itens em fila há mais de seis meses.

**Custo de licenciamento.** O contrato da suíte foi reajustado em 2025 para R$ 6,4 milhões
anuais, atrelado a faturamento — a conta cresce com o sucesso do canal.

Não há pressão de escala: a suíte aguenta o volume atual. O problema é de **evolução**, não
de capacidade — e essa distinção é o que orienta toda a análise.

## Requisitos Funcionais

Em ordem de prioridade declarada pela área de negócio:

```text
RF-1  Consultar disponibilidade agregada de um produto: centro de distribuição
      + todas as lojas, com prazo de entrega por origem
RF-2  Reservar estoque de loja para retirada, com prazo de expiração
RF-3  Roteirizar o pedido para a origem de menor custo total (frete + risco de ruptura)
RF-4  Carrinho unificado entre web, aplicativo e atendimento em loja
RF-5  Catálogo com atributos variáveis por categoria (tinta tem cor e rendimento;
      cimento tem peso e resistência)
RF-6  Promoções combináveis, com regras por região, canal e perfil
RF-7  Pagamento com cartão, Pix e crediário próprio da rede
RF-8  Devolução em qualquer loja, independentemente da origem
RF-9  Portal de operação de loja: separação, conferência e baixa de reserva
RF-10 Histórico de pedido unificado entre canais
```

RF-1 a RF-3 são novos e são a razão do projeto. RF-4 a RF-10 existem na suíte, com
comportamento que precisa ser preservado.

## Requisitos Não-Funcionais

```text
disponibilidade do fluxo de compra        99,95% (≈ 4,4 h/ano)
disponibilidade da consulta de catálogo   99,9%
p99 de carregamento de página de produto  < 800 ms
p99 de consulta de disponibilidade        < 400 ms
p99 de finalização de compra              < 2 s
janela de inconsistência do estoque
  de loja exibido na vitrine              < 3 min
janela de inconsistência da reserva       0 — reserva é forte
retenção de dados de pedido               5 anos (fiscal)
tempo até nova funcionalidade em produção < 2 semanas (contra 14 hoje)
```

O último é um requisito não funcional incomum e é o mais importante do conjunto: ele é a
razão do projeto, e é o que descarta a opção de manter tudo como está.

## Restrições

```text
prazo               a temporada de fim de ano é intocável: nenhuma mudança
                    estrutural entre 1º de outubro e 15 de janeiro
contrato            a suíte tem contrato até dezembro de 2028, com multa de
                    rescisão decrescente (R$ 9 mi em 2026, R$ 3 mi em 2028)
equipe              32 engenheiros, dos quais 9 conhecem a suíte;
                    nenhum com experiência em sistemas de alta escala
plataforma          existe esteira de implantação e observabilidade básica;
                    não há plataforma de autoatendimento
estoque de loja     o sistema de gestão das lojas é um ERP de terceiro,
                    com API de consulta e sem API de reserva
regulatório         emissão fiscal integrada ao ERP; não pode ser reescrita
dados               o catálogo tem 380 mil SKUs e 9 anos de histórico
                    de pedidos na base da suíte
```

A restrição do ERP sem API de reserva é a mais limitante e a que menos aparece nas
discussões iniciais — ela define o desenho de todo o RF-2.

## Estimativas de Capacidade

**Volume de pedidos.**

```text
pedidos digitais/mês, média            310 mil
pedidos/dia, média                      10,3 mil
pico diário (Black Friday)             142 mil
pico horário                            28 mil/h  →  ~7,8 pedidos/s
pico instantâneo observado (10 min
  após início de campanha)              ~34 pedidos/s
margem de projeto                       3×  →  100 pedidos/s
```

O volume de pedidos é **baixo**. Esse é um resultado importante: 100 pedidos/s não exige
nenhuma arquitetura exótica, e qualquer proposta que use escala como justificativa está
resolvendo um problema que não existe.

**Volume de leitura.**

```text
visitas/mês                             41 milhões
páginas de produto/visita, média        4,2
leituras de catálogo/mês                ~172 milhões
pico de leitura                         ~4 800/s
com margem                              ~12 000/s
```

A leitura é 1.500× a escrita. Isso desloca o desenho para cache e replicação de leitura, não
para particionamento de escrita.

**Volume de estoque.**

```text
SKUs no catálogo                        380 mil
SKUs ativos por loja, média             13 mil
combinações SKU × loja                  ~18,2 milhões
atualizações de estoque/dia (vendas
  em loja + recebimentos + ajustes)     ~4,1 milhões
pico de atualizações                    ~180/s
```

Dezoito milhões de combinações com 180 atualizações por segundo cabem confortavelmente em um
banco relacional bem indexado. Novamente, não há problema de escala.

**Armazenamento.**

```text
catálogo com atributos e mídia          ~140 GB
histórico de pedidos, 9 anos            ~2,1 TB
estoque (estado atual)                  ~3 GB
eventos de estoque, 90 dias             ~400 GB
```

## Opções de Arquitetura

Três opções genuinamente viáveis foram avaliadas. Cada uma foi levada até o nível de
estimativa de esforço e risco.

### Opção A — Evoluir a suíte no lugar

Manter a suíte como plataforma e implementar RF-1 a RF-3 dentro dela, com customização e
integração ao ERP.

```text
esforço estimado           7 a 9 meses, majoritariamente da integradora
custo de licença           mantido, com reajuste por faturamento
prazo de mudança futuro    permanece em ~14 semanas
risco técnico              baixo — a suíte já opera
risco de negócio           alto — a fila de 40 itens continua parada
```

A suíte suporta customização de disponibilidade, mas o modelo de estoque é de depósito
único. Estender para 1.400 origens exigiria alterar o núcleo, que é a parte com maior
restrição contratual de customização — e o fornecedor cotou o desenvolvimento como projeto
próprio.

### Opção B — Reconstrução completa com virada de chave

Construir uma plataforma própria completa e substituir a suíte de uma vez.

```text
esforço estimado           26 a 34 meses
equipe necessária          ~45 pessoas, contra 32
risco de virada            muito alto — o canal para se der errado
economia de licença        só a partir da virada
prazo de mudança futuro    < 2 semanas, depois de pronto
```

A reconstrução resolve tudo e resolve tarde. Durante os 30 meses, nada da fila de produto
anda, e a empresa continua pagando licença. E a virada de chave de um canal de R$ 760
milhões concentra risco num único evento.

### Opção C — Estrangulamento incremental

Manter a suíte operando e extrair capacidades uma a uma, com um roteador na frente
direcionando cada rota para a suíte ou para o serviço novo, até que a suíte fique vazia.

```text
esforço estimado           entrega contínua; primeira capacidade em 4 meses
risco por etapa            baixo — cada extração é reversível
economia de licença        gradual, conforme módulos saem do escopo contratual
prazo de mudança           cai por capacidade extraída
complexidade transitória   alta — dois sistemas coexistindo por ~3 anos
```

Ver [estrangulamento](../16-legacy-modernization/strangler-fig.md).

## Análise de Trade-offs

Critérios ponderados pela área de tecnologia e pela diretoria comercial, com os pesos
definidos **antes** da avaliação:

| Critério | Peso | A — Evoluir | B — Reconstruir | C — Estrangular |
|---|:-:|:-:|:-:|:-:|
| Tempo até RF-1..RF-3 em produção | 25% | 6 | 2 | 8 |
| Redução do prazo de mudança | 25% | 1 | 9 | 7 |
| Risco de interrupção do canal | 20% | 9 | 2 | 7 |
| Custo total em 4 anos | 15% | 3 | 6 | 7 |
| Capacidade da equipe atual | 10% | 8 | 3 | 6 |
| Reversibilidade | 5% | 7 | 1 | 9 |
| **Total ponderado** | | **5,0** | **4,4** | **7,3** |

Os pesos merecem explicação. Tempo até as funcionalidades novas e redução do prazo de
mudança somam 50% porque **são o projeto** — a empresa não está resolvendo um problema
técnico, está resolvendo uma fila de produto. Risco de interrupção pesa 20% porque o canal
digital é a única parte do negócio que cresce.

Custo pesa apenas 15%, o que foi contestado internamente. A justificativa registrada: a
economia de licença é real mas menor que o valor estimado da fila de produto parada
(R$ 40 a 70 milhões de receita não realizada, pela estimativa comercial).

**Análise de sensibilidade.** A matriz foi recalculada com pesos alternativos para verificar
se a conclusão dependia de uma escolha específica:

```text
cenário                                    A      B      C
pesos originais                           5,0    4,4    7,3
custo em 40%, prazo de mudança em 5%      4,6    5,3    7,2
risco de interrupção em 40%               6,1    3,4    7,4
capacidade da equipe em 30%               5,6    3,8    7,0
```

A Opção C vence em todos os cenários testados, o que aumenta a confiança na decisão. E a
análise revela algo sobre as outras duas: a Opção B só se aproxima quando o custo domina,
e a Opção A só se aproxima quando o risco domina — o que é coerente com a natureza de cada
uma, e serve como verificação de que a avaliação não foi enviesada para produzir o
resultado desejado.

Um critério considerado e **descartado** da matriz: "modernidade da arquitetura". Ele foi
proposto e recusado por não corresponder a nenhum resultado de negócio verificável — e por
ser exatamente o tipo de critério que favorece a reconstrução sem que ninguém precise
defender por quê.

## Decisão

**Estrangulamento incremental (Opção C)**, com a ordem de extração definida por dois
critérios combinados: **taxa de mudança** e **acoplamento com o restante da suíte**.

```text
capacidade          mudanças/ano   acoplamento   ordem
disponibilidade     alta (novo)    baixo         1
catálogo            alta           médio         2
promoções           muito alta     alto          4
carrinho e pedido   média          muito alto    5
pagamento           baixa          médio         3
portal admin        baixa          alto          6 (último)
```

A primeira extração é a que **não existe** — disponibilidade omnicanal é capacidade nova,
sem código legado a migrar e sem risco de regressão. Ela entrega RF-1 a RF-3, valida o
padrão de extração e produz um resultado de negócio em quatro meses.

Pagamento vem em terceiro apesar da baixa taxa de mudança, porque é o módulo com maior
economia de licença ao sair do escopo contratual.

Promoções, que tem a maior taxa de mudança, vem em quarto por ser o mais acoplado — extraí-lo
cedo exigiria manter uma ponte bidirecional complexa com o carrinho da suíte.

**Sob que condição cada opção descartada venceria:**

**Opção A venceria se** o requisito de prazo de mudança não existisse — se a fila de produto
fosse curta e a empresa só precisasse de omnicanalidade. Nesse cenário, 8 meses de
customização com risco baixo é a resposta certa, e a economia de licença não justificaria
sozinha o projeto.

**Opção B venceria se** o contrato da suíte terminasse em 2026 sem renovação possível, ou se
a suíte não suportasse o volume — casos em que a coexistência deixa de ser opção. Também
venceria com uma equipe de 45 pessoas com experiência prévia em plataformas de comércio, em
que 30 meses viraria 16.

## Componentes

A arquitetura alvo, ao fim do estrangulamento:

```text
Roteador de borda
  decide, por rota, se o pedido vai para a suíte ou para os serviços novos
  ponto único de virada e de reversão

Serviço de Disponibilidade
  agrega estoque do centro de distribuição e das 1.400 lojas
  responde "onde tem, com que prazo, a que custo"

Serviço de Reserva
  reserva com expiração; fonte de verdade das reservas
  compensa contra o ERP

Serviço de Catálogo
  produtos, atributos por categoria, mídia, precificação base

Serviço de Promoções
  regras combináveis por região, canal e perfil

Serviço de Carrinho e Pedido
  ciclo de vida do pedido, orquestração da compra

Serviço de Pagamento
  cartão, Pix e crediário; integração com adquirentes

Portal de Loja
  separação, conferência, baixa de reserva

Índice de Busca
  catálogo denormalizado para busca e navegação facetada

Adaptador de ERP
  anti-corruption layer sobre o ERP de lojas
```

O **adaptador de ERP** merece destaque: ele existe porque o ERP não tem API de reserva, e
concentra toda a tradução entre o modelo de estoque da Vertena e o do fornecedor. Ver
[anti-corruption layer](../08-integration-architecture/integration-anti-corruption.md).

A arquitetura é um **monólito modular** para catálogo, promoções, carrinho e pedido — os
quatro compartilham modelo de domínio e mudam juntos —, com disponibilidade, reserva e
pagamento como serviços separados por terem perfis de carga e de disponibilidade distintos.

Sete unidades implantáveis, não vinte. Ver
[monólito vs. microsserviços](../20-trade-offs/monolith-vs-microservices.md).

## Dados

**PostgreSQL como banco primário** de todos os serviços, com esquema por módulo e sem acesso
cruzado. A decisão foi tomada com a análise de
[SQL vs. NoSQL](../20-trade-offs/sql-vs-nosql.md): os padrões de acesso do catálogo são
conhecidos, mas a área comercial faz perguntas não previstas o tempo todo, e o volume está
muito abaixo do limiar em que o relacional exige trabalho.

Os atributos variáveis por categoria (RF-5) usam coluna `jsonb` com índices GIN — o que
elimina a necessidade de um segundo banco.

**Modelo de estoque.**

```text
estoque_posicao        (sku, origem, quantidade, atualizado_em)   18,2 M linhas
estoque_reserva        (id, sku, origem, quantidade, expira_em)   ~40 mil ativas
estoque_evento         (append-only, 90 dias)                     ~370 M linhas
```

A tabela de posição é atualizada por eventos vindos do ERP e por reservas próprias. Ela é a
fonte da vitrine, com janela de até 3 min. A tabela de reserva é a fonte forte: uma reserva
confirmada é consistência forte, sem exceção.

Essa separação é a resposta ao conflito entre RF-1 (vitrine, tolerante) e RF-2 (reserva,
intolerante) — dois requisitos sobre o mesmo dado com necessidades opostas de consistência.
Ver [consistência forte vs. eventual](../20-trade-offs/strong-vs-eventual-consistency.md).

**Índice de busca** alimentado a partir do catálogo por eventos, com janela de 2 minutos.
Ele existe porque busca facetada sobre 380 mil SKUs com atributos variáveis é o caso em que
o relacional trabalha mal.

**Histórico de pedidos.** Os 2,1 TB da suíte permanecem lá durante toda a migração e são
consultados por uma rota do roteador. A migração do histórico é a **última** etapa, e é
deliberadamente adiada: ela tem custo alto e nenhum valor de negócio até que a suíte seja
desligada.

## Integração

**Com o ERP de lojas.** O ponto mais delicado do desenho, porque o ERP não oferece reserva.

```text
consulta de posição      API do ERP, sondada a cada 90 s por lote de lojas
                         + arquivo de posição completa, 1×/dia, para conciliação
reserva                  não existe no ERP → a Vertena mantém a reserva
                         em base própria, e desconta da posição consultada
baixa efetiva            quando a loja separa e confirma no portal, o
                         adaptador emite a venda no ERP
conciliação              diária, comparando posição do ERP com posição
                         calculada; divergências geram alerta ao gerente da loja
```

A consequência aceita: durante até 90 segundos, a posição pode estar desatualizada. Isso é
absorvido por uma **margem de segurança por SKU** — SKUs de giro alto reservam contra uma
posição reduzida em uma unidade, e SKUs de giro baixo, contra a posição integral.

Essa margem é a decisão que torna o desenho viável apesar da limitação do ERP, e ela é
ajustável por categoria sem implantação.

O ciclo completo de uma reserva de loja, que é o fluxo mais delicado do sistema:

```text
1. cliente escolhe retirada na loja X
2. serviço consulta posição calculada (ERP - reservas ativas - margem)
3. reserva criada com expiração de 4 h, em transação local
4. loja recebe a separação no portal
5a. loja confirma  → adaptador emite venda no ERP → reserva encerrada
5b. loja informa ruptura → reserva cancelada → pedido roteado
    para a próxima origem, sem novo pagamento
5c. expira sem ação → reserva liberada → cliente notificado
    com opção de trocar a origem
```

O caminho 5b é o que exigiu mais desenho de produto: uma ruptura na loja não pode virar
cancelamento do pedido, porque o cliente já pagou e a mercadoria existe em outra origem. A
reroteirização automática, com aviso e novo prazo, foi construída junto com a operação de
loja — e é a razão de o índice de cancelamento por ruptura ter ficado em 0,7%, contra os 4%
projetados no desenho inicial que previa cancelamento simples.

**Com adquirentes de pagamento.** Assíncrona, com aceite síncrono. O pedido é aceito em menos
de 400 ms e a autorização ocorre em segundo plano, porque a disponibilidade composta com
três adquirentes externos não atinge o requisito de 99,95% no modo síncrono. Ver
[síncrono vs. assíncrono](../20-trade-offs/sync-vs-async.md).

**Entre serviços internos.** Eventos de domínio para propagação de estado — estoque
alterado, pedido criado, pagamento autorizado — sobre um mecanismo de mensageria gerenciado.
Consultas entre serviços são síncronas, por HTTP com contrato declarado.

**Com a suíte, durante a coexistência.** Bidirecional e explicitamente temporária: a suíte
publica eventos de pedido para os serviços novos, e os serviços novos escrevem no banco da
suíte por uma camada de compatibilidade. Cada ponte tem prazo de remoção registrado.

## Segurança

```text
identidade de cliente     provedor gerenciado, com federação para a base
                          existente de 8,4 milhões de contas
identidade de operador
  de loja                 integrada ao diretório corporativo, com perfil
                          por loja
autorização               por recurso e por loja — um operador só vê e
                          movimenta o estoque da sua unidade
dados de pagamento        nunca trafegam nem repousam nos sistemas da
                          Vertena; tokenização no adquirente
dado pessoal              classificação e mapeamento de fluxo completos,
                          com retenção declarada por ponto de repouso
comunicação interna       autenticação mútua imposta pela malha; um serviço
                          sem identidade válida não recebe tráfego
```

O ponto de maior atenção é a autorização por loja: 1.400 unidades com operadores que não
devem ver o estoque das outras. A regra é aplicada no serviço, não na interface, e é
verificada por teste automatizado a cada mudança. Ver
[modelos de autorização](../10-security/authz-models.md).

O mapeamento de fluxo de dado pessoal encontrou, durante o projeto, três pontos de repouso
não previstos: registros de aplicação com CPF, o ambiente de homologação com cópia de
produção, e uma exportação diária para uma ferramenta de análise. Ver
[diagramas de fluxo de dados](../17-architecture-documentation/data-flow-diagrams.md).

## Escalabilidade

Como as estimativas mostraram, o desafio não é volume — é **distribuição da leitura** e
**pico concentrado**.

```text
catálogo e vitrine        cache de borda com invalidação por evento;
                          taxa de acerto alvo > 92%
disponibilidade           cache local por serviço, 30 s, com invalidação
                          por evento de estoque
busca                     índice replicado, três réplicas de leitura
pedido                    escala horizontal simples; 100 pedidos/s é atendido
                          por 6 instâncias com folga
reserva                   ponto de contenção real — reservas do mesmo SKU
                          na mesma loja serializam
```

O único ponto que exigiu desenho específico foi a **reserva**: em campanha, o mesmo SKU de
giro alto na mesma loja recebe reservas concorrentes. A solução é contenção por linha no
banco com prazo curto, e não bloqueio distribuído — o volume não justifica.

**Black Friday.** O plano de capacidade prevê 3× o pico observado, com escala manual
antecipada em 48 horas — automática seria mais elegante e menos previsível, e a operação
prefere previsibilidade na data mais importante do ano.

## Confiabilidade

O requisito de 99,95% no fluxo de compra foi decomposto por componente, e não aplicado
uniformemente. Ver [custo vs. confiabilidade](../20-trade-offs/cost-vs-reliability.md).

```text
componente          alvo       degradação quando indisponível
catálogo            99,9%      serve do cache, com aviso de idade
disponibilidade     99,9%      cai para "somente centro de distribuição"
reserva             99,95%     bloqueia retirada em loja; entrega normal segue
carrinho e pedido   99,95%     sem degradação possível — é o fluxo
pagamento           99,9%      aceita o pedido e autoriza depois
busca               99%        cai para navegação por categoria
promoções           99,5%      preço cheio, com crédito posterior
```

A linha de promoções é a decisão mais interessante do conjunto: durante indisponibilidade,
o pedido é aceito com preço cheio e o desconto é aplicado como crédito depois. Isso foi
negociado com a área comercial e é preferível a recusar a venda.

**Modo degradado de estoque.** Se o adaptador de ERP ficar indisponível por mais de 5
minutos, o sistema deixa de oferecer retirada em loja e passa a operar apenas com o centro
de distribuição — uma degradação visível, comunicada na vitrine, em vez de reservas contra
posição desconhecida.

## Observabilidade

```text
rastreamento distribuído  em todo o fluxo de compra, com identificador de
                          pedido propagado até o ERP
métricas de negócio       conversão por etapa, taxa de reserva bem-sucedida,
                          divergência de estoque por loja
métricas técnicas         latência por serviço, taxa de erro, atraso de
                          replicação, idade do cache
alarmes por janela        estoque desatualizado > 3 min → alarme
                          reserva com falha > 1% → alarme
                          divergência de conciliação > 0,5% da loja → alerta
                          ao gerente, não ao plantão
```

A última linha é uma decisão de desenho de operação: divergência de estoque de uma loja é um
problema da loja, não da engenharia. O alerta vai para quem pode resolver.

Durante a coexistência, um painel único mostra qual porcentagem do tráfego está em cada
lado do roteador, por rota — é o instrumento principal de acompanhamento da migração.

## Implantação

```text
sete unidades implantáveis, cada uma com esteira própria
implantação canário para o fluxo de compra, com 5% → 25% → 100%
reversão automática por taxa de erro
congelamento de mudanças estruturais entre 1º/out e 15/jan
o roteador de borda é o único ponto de virada e de reversão
```

O roteador é o componente mais crítico da transição e o mais simples: ele decide por rota,
com configuração dinâmica, e permite reverter uma capacidade extraída em segundos sem
implantação.

Essa propriedade — **reversão em segundos, sem implantação** — foi o que tornou a diretoria
confortável com a abordagem incremental.

## Estratégia de Evolução

**Fase 1 (meses 1–4): disponibilidade omnicanal.** Serviço de Disponibilidade, Serviço de
Reserva, Adaptador de ERP e Portal de Loja. Nenhuma extração da suíte — apenas capacidade
nova, integrada por API. Entrega RF-1 a RF-3.

Resultado esperado e o que de fato ocorreu: aumento de conversão de 14%, dentro da faixa
estimada.

**Fase 2 (meses 5–11): catálogo e busca.** Primeira extração real. O catálogo passa a ser
próprio, a suíte consome dele por uma ponte, e a busca sai para índice dedicado.

Esta fase testou o padrão de extração e produziu o aprendizado mais caro do projeto: a
primeira tentativa manteve a suíte como fonte de verdade do catálogo, com sincronização
bidirecional. Três meses depois, divergências recorrentes forçaram a inversão — o catálogo
novo virou fonte de verdade e a suíte passou a ser somente leitura. **Sincronização
bidirecional entre duas fontes de verdade não funcionou**, e a lição foi registrada em ADR.

**Fase 3 (meses 12–17): pagamento.** Extração com maior efeito contratual: pagamento sai do
escopo de licenciamento e reduz a base de cálculo em 22%.

**Fase 4 (meses 18–26): promoções.** A mais complexa, por acoplamento com o carrinho da
suíte. Exigiu uma ponte temporária que aplica promoções calculadas externamente ao carrinho
interno.

**Fase 5 (meses 27–36): carrinho e pedido.** A última capacidade de negócio. A partir daqui
a suíte serve apenas o portal administrativo e o histórico.

**Fase 6 (meses 37–42): portal administrativo, histórico e desligamento.** Migração dos 2,1
TB de histórico e encerramento do contrato, sincronizado com o vencimento de dezembro de
2028 para evitar multa.

**Condições que mudariam o plano**, registradas em ADR:

```text
se o contrato da suíte for rescindido antecipadamente por decisão comercial
  → a Fase 5 antecipa e o histórico migra antes do portal

se o ERP de lojas ganhar API de reserva
  → o Serviço de Reserva simplifica drasticamente e a margem de
    segurança por SKU deixa de ser necessária

se o volume passar de 500 pedidos/s sustentados
  → a decisão de monólito modular para carrinho e pedido é reavaliada

se a taxa de acerto do cache de catálogo cair abaixo de 80%
  → a estratégia de invalidação precisa mudar antes de escalar leitura
```

## Resultados

Números medidos ao fim da Fase 3, 17 meses após o início:

```text
prazo médio entre pedido de negócio e produção   de 14 para 3 semanas
                                                 (capacidades extraídas)
                                                 14 semanas (o que ainda
                                                 está na suíte)
conversão do canal digital                       +14%
faturamento digital                              de R$ 760 mi para R$ 1,02 bi
                                                 (crescimento de mercado incluso)
custo de licença anual                           de R$ 6,4 mi para R$ 5,0 mi
itens da fila de produto entregues               31 dos 40
disponibilidade do fluxo de compra               99,96%
incidentes com causa na coexistência             7, todos na ponte de catálogo
                                                 da Fase 2
```

O item mais revelador é a **dupla métrica de prazo**: 3 semanas para o que saiu, 14 para o
que ficou. Ela tornou visível o benefício de cada extração e virou o argumento para manter o
investimento nas fases seguintes.

## O que este case ensina

**Escala não era o problema.** As estimativas de capacidade — 100 pedidos/s, 12 mil
leituras/s — descartam qualquer arquitetura justificada por volume. O projeto é sobre
velocidade de mudança, e confundir os dois é o erro mais comum em decisões de e-commerce.

**A ordem de extração é a decisão de arquitetura.** Escolher começar pela capacidade que não
existe, em vez da mais fácil ou da mais valiosa, é o que permitiu entregar resultado em
quatro meses sem risco de regressão.

**A limitação do fornecedor moldou o desenho.** A ausência de API de reserva no ERP produziu
o Serviço de Reserva, o adaptador, a margem de segurança por SKU e a conciliação diária —
cerca de 40% do esforço da Fase 1, por uma restrição que não aparece em nenhum diagrama de
alto nível.

**Duas fontes de verdade não convivem.** A lição da Fase 2 é a mais transferível: durante uma
migração, um dado tem uma fonte de verdade, e a outra ponta é somente leitura. Sincronização
bidirecional adia a decisão e cobra em divergência.

## Conceitos Relacionados

- [Estrangulamento](../16-legacy-modernization/strangler-fig.md) — o padrão da migração.
- [Anti-Corruption Layer](../08-integration-architecture/integration-anti-corruption.md).
- [Monólito vs. Microsserviços](../20-trade-offs/monolith-vs-microservices.md).
- [Consistência Forte vs. Eventual](../20-trade-offs/strong-vs-eventual-consistency.md).

## Exercício Prático

Refaça a matriz de decisão trocando um peso: coloque **custo total em 4 anos** em 40% e
reduza **redução do prazo de mudança** para 5%.

Recalcule. A opção vencedora muda? Esse exercício mostra que a decisão não estava na
análise — estava nos pesos, que são uma escolha de negócio.

## Perguntas de Entrevista

- Por que a primeira capacidade extraída foi a que não existia no sistema legado?
- Como dois requisitos sobre o mesmo dado — vitrine e reserva — podem ter necessidades
  opostas de consistência?
- Que restrição do fornecedor moldou 40% do esforço da primeira fase, e por que ela não
  apareceria num diagrama de contexto?

## Para Aprofundar

- Newman, Sam. *Monolith to Microservices*. O'Reilly, 2019.
- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*. Addison-Wesley, 2003.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
