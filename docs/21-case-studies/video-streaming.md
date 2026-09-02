---
id: video-streaming
title: "Case: Streaming de Vídeo"
sidebar_position: 6
description: Catálogo de 42 mil títulos para 6,1 milhões de assinantes, onde 96% do custo está fora do datacenter.
doc_type: case-study
level: 0
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor dimensiona um sistema em que a entrega de bytes domina o custo e o
  plano de controle é pequeno, e sabe onde a arquitetura de fato decide.
prerequisites: [trade-offs]
related: [social-network, high-volume-events, saas-platform]
canonical_for: []
content_version: 5
last_reviewed: 2026-08-29
---

# Case: Streaming de Vídeo

:::note Como usar este case

Leia contexto, requisitos e restrições. **Pare antes das opções de arquitetura** e esboce a sua
em vinte minutos.

Os números deste case são **ilustrativos**: plausíveis e internamente
coerentes, não medidos num sistema nomeado. O que se aprende é o raciocínio que eles
sustentam, não as grandezas.

:::

## Contexto de Negócio

A **Mirante** é um serviço de streaming brasileiro com 6,1 milhões de assinantes e um catálogo
de 42 mil títulos, entre filmes, séries e produções próprias. Opera em nove países da América
Latina.

O negócio tem uma característica que distingue radicalmente sua arquitetura da de sistemas
transacionais: **a maior parte do custo e da complexidade está na entrega de bytes**, e não no
processamento de requisições. A empresa entrega 3,4 exabytes por ano, e o custo dessa entrega é
de R$ 187 milhões — contra R$ 8 milhões de toda a infraestrutura de aplicação.

Essa proporção — 96% do custo em entrega — é o que orienta toda a análise. Uma decisão que
melhora 10% da eficiência de entrega vale mais que qualquer otimização do plano de controle.

Duas pressões motivam a revisão:

**Custo de entrega.** O contrato com o provedor de rede de distribuição foi reajustado, e a
diretoria estabeleceu meta de redução de 25% no custo por hora assistida em 24 meses.

**Qualidade em conexões ruins.** A empresa mede que 22% das sessões ocorrem em conexões com
menos de 5 Mbps sustentados, concentradas em regiões e horários específicos. Nessas sessões, a
taxa de abandono nos primeiros 30 segundos é de 19%, contra 3% nas demais.

## Requisitos Funcionais

Para o **assinante**: navegar o catálogo com recomendações; buscar; assistir com qualidade
adaptada à conexão; retomar de onde parou, em qualquer dispositivo; baixar para assistir sem
conexão; e gerenciar perfis dentro da conta.

Para a **operação de conteúdo**: ingerir um título novo, com todas as faixas de áudio, legendas
e versões de codificação; publicar e despublicar por país e por janela de licenciamento; e
acompanhar desempenho de audiência por título.

Para a **plataforma**: aplicar proteção de conteúdo conforme exigência dos estúdios; medir
qualidade de experiência em tempo real; e reportar audiência aos detentores de direitos, com
precisão contratual.

O último requisito é subestimado e tem consequência arquitetural forte: os contratos de
licenciamento pagam por minuto assistido, e o relatório precisa ser auditável. Isso torna a
telemetria de reprodução um dado financeiro, não apenas operacional.

## Requisitos Não-Funcionais

```text
tempo até o primeiro quadro              < 1,5 s no p95
taxa de rebuffer                         < 0,4% do tempo assistido
disponibilidade da reprodução            99,99%
disponibilidade do catálogo              99,95%
p95 de carregamento da tela inicial      < 900 ms
precisão da telemetria de audiência      > 99,9% dos minutos assistidos
retenção de telemetria bruta             13 meses (auditoria contratual)
custo por hora assistida                 redução de 25%
janela de publicação por país            precisão de 1 minuto
```

A taxa de rebuffer é a métrica de qualidade que mais correlaciona com cancelamento de
assinatura, segundo os dados da própria empresa: assinantes que sofrem rebuffer em mais de 1%
do tempo assistido cancelam a uma taxa 2,4× maior.

## Restrições

```text
estúdios          exigem proteção de conteúdo com nível específico por
                  título; alguns exigem que a chave nunca resida em
                  infraestrutura própria da Mirante
licenciamento     janelas por país com data e hora exatas; publicar
                  antes ou despublicar depois tem consequência contratual
dispositivos      53 modelos de televisor suportados, muitos com
                  capacidade limitada e sem atualização de firmware
conectividade     22% das sessões abaixo de 5 Mbps
custo             a redução de 25% é meta de diretoria
equipe            94 engenheiros; 12 no domínio de entrega de vídeo
codificação       recodificar o catálogo inteiro leva ~7 meses de
                  capacidade de processamento contratada
```

A restrição dos televisores é a mais limitante para escolhas de tecnologia: um aparelho de 2018
sem atualização define o menor denominador comum de formato e de protocolo, e ele não pode ser
abandonado sem perder assinantes.

Esse tipo de restrição — parque instalado que não se atualiza — é comum em produtos de consumo e
raramente aparece em discussões de arquitetura, que tendem a assumir clientes atualizáveis. Aqui
ela determina quais formatos de codificação podem ser usados, qual protocolo de entrega, e até
quanto tempo uma versão de manifesto precisa continuar sendo servida. A empresa mantém uma
matriz de compatibilidade por modelo, e ela é consultada antes de qualquer decisão de formato.

## Estimativas de Capacidade

O que dimensiona este sistema não é requisição por segundo — é banda.

```text
assinantes                          6,1 milhões
sessões simultâneas, média          ~210 mil
pico (sábado, 21h)                  ~980 mil
taxa média por sessão               ~4,1 Mbps
banda no pico                       ~4,0 Tbps
horas assistidas/mês                ~151 milhões
volume entregue/ano                 ~3,4 exabytes
```

Quatro terabits por segundo no pico. Esse número é a arquitetura: nenhuma decisão de aplicação
altera materialmente o custo, e a escolha de como e de onde os bytes saem altera tudo.

O plano de controle, em comparação, é pequeno:

```text
requisições de catálogo/dia          ~180 milhões  →  ~2 100/s, pico ~7 000/s
inícios de reprodução/dia            ~19 milhões   →  ~220/s, pico ~1 100/s
eventos de telemetria/dia            ~14 bilhões   →  ~162 mil/s
```

A telemetria é o único subsistema do plano de controle com volume relevante — 162 mil eventos
por segundo — e é dela que sai o relatório de audiência que paga os estúdios.

```text
armazenamento
  catálogo, todas as versões de codificação   ~4,2 PB
  telemetria bruta, 13 meses                  ~1,9 PB
  metadados, catálogo e perfis                ~600 GB
```

O contraste é o resumo do case: 600 GB de dados sobre os quais o produto raciocina, e petabytes
de bytes que ele entrega.

## Opções de Arquitetura

O eixo de decisão é **como os bytes chegam ao assinante**.

### Opção A — Rede de distribuição de terceiro

Todo o tráfego sai por um provedor comercial, com presença global.

```text
custo             R$ 187 mi/ano, com desconto por volume já negociado
esforço           nenhum — é o modelo atual
qualidade         boa, e sem controle sobre política de cache
flexibilidade     nenhuma sobre localização de conteúdo
risco             concentração em um fornecedor
```

### Opção B — Rede própria com servidores em provedores de internet

Servidores de cache instalados dentro das redes dos provedores de acesso, entregando o conteúdo
popular localmente.

```text
custo             investimento inicial de ~R$ 42 mi em equipamento
                  + operação de ~R$ 28 mi/ano
                  custo marginal de entrega próximo de zero
esforço           24 a 30 meses até cobertura relevante
qualidade         melhor — o conteúdo sai a poucos saltos do assinante
negociação        exige acordo com dezenas de provedores de acesso
risco             alto — depende de terceiros que não são fornecedores
```

### Opção C — Híbrida com camada própria nas maiores redes

Servidores próprios nas redes que concentram a maior parte da audiência; terceiro para o resto.

```text
custo             investimento de ~R$ 14 mi + operação de ~R$ 9 mi/ano
                  + terceiro para o tráfego residual
cobertura         as 6 maiores redes concentram 71% da audiência
esforço           10 a 14 meses até cobertura de 71%
qualidade         melhor onde há servidor próprio; igual no resto
risco             médio — negociação com 6 parceiros, não dezenas
```

## Análise de Trade-offs

| Critério | Peso | A — Terceiro | B — Própria | C — Híbrida |
|---|:-:|:-:|:-:|:-:|
| Custo por hora assistida em 3 anos | 35% | 2 | 9 | 8 |
| Qualidade em conexões ruins | 25% | 5 | 9 | 8 |
| Prazo até resultado | 15% | 9 | 2 | 7 |
| Risco de execução | 15% | 9 | 3 | 6 |
| Capacidade da equipe | 10% | 9 | 3 | 6 |
| **Total ponderado** | | **5,6** | **6,5** | **7,4** |

**Análise de sensibilidade**, redistribuindo o peso restante proporcionalmente entre os demais critérios. Com risco em 40% e custo em 15%, os totais viram
7,1 / 5,1 / 6,9 — a Opção A vence, por 0,2. Esse é o único cenário testado em que a conclusão muda, e ele corresponde a uma
organização com apetite de risco muito baixo ou sem capacidade de negociar com provedores de
acesso.

O registro dessa inversão é deliberado: ele mostra que a decisão não é uma verdade universal
sobre streaming, e sim uma consequência do peso que a Mirante atribui a custo e qualidade.

## Decisão

**Híbrida (Opção C)**, com servidores próprios nas seis maiores redes de acesso e terceiro para o
tráfego residual, incluindo os países com menor base.

**Sob que condição cada opção descartada venceria:**

**Opção A venceria se** a empresa não tivesse escala para negociar com provedores de acesso —
abaixo de aproximadamente 1 milhão de assinantes, nenhum provedor tem interesse em hospedar
equipamento de terceiros. Também venceria com apetite de risco baixo, como mostra a análise de
sensibilidade.

**Opção B venceria se** a distribuição de audiência fosse mais uniforme entre provedores de
acesso. Com 71% concentrados em seis redes, a cauda de dezenas de provedores menores nunca paga
o custo de negociação e operação. A condição está registrada: se a concentração cair abaixo de
50% nas seis maiores, o alcance da rede própria é reavaliado.

## Componentes

O sistema se divide em dois planos com naturezas completamente diferentes.

O **plano de dados** entrega bytes: servidores de cache nas redes de acesso, a rede de terceiro,
e o mecanismo que decide, para cada sessão, de onde o conteúdo sai. É onde está 96% do custo e
quase nenhuma lógica de negócio.

O **plano de controle** é uma aplicação convencional: catálogo, perfis, autenticação,
recomendação, licenciamento por janela, telemetria e relatórios. Volume modesto, lógica rica.

Além dos dois, há um **pipeline de ingestão** que recebe um título e produz todas as versões
codificadas, faixas, legendas e artefatos de proteção — um sistema em lote, sem requisito de
latência, mas com volume de processamento grande.

Os componentes principais do plano de controle:

**Serviço de Catálogo**, com disponibilidade calculada por país e janela de licenciamento.
**Serviço de Reprodução**, que autoriza uma sessão, emite a licença de proteção e devolve o
manifesto com as URLs de entrega. **Roteador de Entrega**, que escolhe a origem por região,
provedor de acesso e disponibilidade do conteúdo em cache local. **Serviço de Progresso**, que
guarda onde cada perfil parou em cada título. **Coletor de Telemetria**, que ingere os 162 mil
eventos por segundo. **Serviço de Relatório de Audiência**, que produz os números contratuais.

A separação entre autorizar e entregar é o que mantém o plano de controle pequeno: ele emite
um manifesto e uma licença, e sai do caminho. Nenhum byte de vídeo passa por ele.

## Dados

**Catálogo.** PostgreSQL como fonte de verdade, com um índice de leitura replicado por região. O
volume é irrelevante — 42 mil títulos — e a complexidade está nas regras: cada título tem
janelas de disponibilidade por país, por plano e por tipo de dispositivo.

A regra de licenciamento é avaliada na montagem da resposta, e não materializada, porque as
janelas mudam com frequência e a precisão exigida é de um minuto. Materializar exigiria
invalidação com essa granularidade, o que é mais caro que avaliar.

**Progresso de reprodução.** Armazenamento chave-valor, com uma entrada por perfil e título.
Escrito a cada 30 segundos durante a reprodução — cerca de 7 mil gravações por segundo na média,
e 33 mil no pico
— e lido na abertura do aplicativo.

É um dado com tolerância a perda: perder os últimos 30 segundos de progresso é imperceptível.
Essa tolerância permite replicação assíncrona e nenhuma garantia transacional, o que reduz o
custo em uma ordem de grandeza.

**Telemetria.** Este é o subsistema de dados mais exigente, e a razão é contratual. Os eventos
de reprodução alimentam o relatório que paga os estúdios, e uma perda de 1% é uma divergência
financeira.

```text
ingestão      eventos em lote, do dispositivo, com identificador de sessão
              e sequência; o dispositivo acumula e reenvia em falha
armazenamento bruto, comprimido, particionado por dia e por título
agregação     diária, com reconciliação por sequência de eventos
retenção      13 meses, para auditoria contratual
```

A sequência por sessão é o que permite detectar perda: um relatório que recebe os eventos 1, 2,
4 e 5 sabe que falta o 3, e o dispositivo é consultado. Sem numeração, perda seria
indistinguível de menos audiência.

**Manifestos e segmentos.** Armazenamento de objetos, replicado por região, com os segmentos de
vídeo em múltiplas taxas de bits. É a maior parte dos 4,2 PB.

## Integração

**Codificação adaptativa.** Cada título é codificado em 8 a 12 taxas de bits diferentes, e o
reprodutor escolhe a faixa conforme a conexão medida. A escolha do conjunto de taxas é uma
decisão de arquitetura com efeito direto na restrição de 22% de conexões ruins.

A empresa passou de um conjunto fixo de taxas para **codificação por título**: um desenho animado
com pouca variação de cena atinge qualidade equivalente com metade da taxa de um filme de ação.
Recodificar o catálogo com taxas ajustadas por conteúdo reduziu o volume médio entregue em 21%
com qualidade percebida igual — e essa única mudança entregou a maior parte da meta de redução
de custo.

**Proteção de conteúdo.** Licenças emitidas por serviço externo especializado, porque parte dos
estúdios exige que a chave não resida em infraestrutura da Mirante. A emissão é síncrona e está
no caminho do primeiro quadro, com orçamento de 300 ms.

**Roteamento de entrega.** Para cada sessão, o Roteador decide a origem combinando: provedor de
acesso identificado pelo endereço de rede, disponibilidade daquele título no cache local, e
saúde dos servidores próprios naquela rede.

Títulos populares ficam nos caches locais; a cauda longa sai pelo terceiro. A regra de
popularidade é recalculada diariamente, e cobre 88% do tráfego com 6% do catálogo.

## Segurança

```text
proteção de conteúdo   nível por título, conforme exigência do estúdio;
                       chaves em serviço externo certificado
licença                vinculada a sessão, dispositivo e janela de tempo
compartilhamento       limite de fluxos simultâneos por plano, verificado
                       na autorização e revalidado periodicamente
dados de assinante     classificação e mapeamento de fluxo; retenção
                       declarada por ponto de repouso
telemetria             pseudonimizada para análise; identificável apenas
                       no subsistema de audiência, com acesso registrado
servidores em redes
  de terceiros         não confiáveis por premissa: conteúdo cifrado
                       em repouso, sem chaves, sem dados de assinante
```

A última linha é a decisão de segurança mais importante do desenho. Os servidores instalados
dentro das redes de provedores de acesso estão fisicamente fora do controle da Mirante, e são
tratados como infraestrutura hostil: eles armazenam segmentos cifrados que não podem ser
decifrados sem uma licença emitida pelo plano de controle.

Isso permite a Opção C sem violar as exigências dos estúdios — e foi a condição que os estúdios
impuseram para autorizar a arquitetura.

## Escalabilidade

O plano de controle escala trivialmente: 7.000 requisições por segundo de catálogo e 1.100
inícios de reprodução por segundo são atendidos com folga por escala horizontal simples.

O que exige desenho é a **telemetria**, com 162 mil eventos por segundo, e o pico concentrado.
A solução é ingestão em lote a partir do dispositivo — cada aparelho acumula eventos e envia a
cada 60 segundos — o que transforma 162 mil eventos por segundo em cerca de 16 mil requisições
por segundo, com carga distribuída pelo desalinhamento natural dos temporizadores.

O **pico de sábado à noite** é 3,2× a média e totalmente previsível. A capacidade dos caches é
dimensionada para ele, e o custo dessa ociosidade é aceito porque a alternativa — degradar no
horário de maior audiência — é o pior resultado possível para o produto.

**Estreias** são o outro pico, e são diferentes: uma estreia de produção própria concentra até
40% das sessões simultâneas em um único título nas primeiras horas. O conteúdo é pré-carregado
nos caches antes do lançamento, o que transforma um pico de origem em um pico local.

## Confiabilidade

Se um **cache local** falha, o Roteador direciona aquela rede para o terceiro. O assinante não
percebe; o custo daquele tráfego sobe. É a degradação mais frequente e a mais barata.

Se o **serviço de licença** fica indisponível, nenhuma reprodução nova começa. Sessões em
andamento continuam até a licença expirar. Não há degradação possível — reproduzir sem licença
viola contrato com estúdios.

Se o **Serviço de Progresso** falha, a reprodução funciona e a retomada não. O aplicativo guarda
o progresso localmente e sincroniza quando o serviço volta.

Se o **Catálogo** fica indisponível, a tela inicial é servida de cache, com até 15 minutos de
defasagem. Títulos cuja janela de licenciamento expirou nesse intervalo são bloqueados na
autorização de reprodução, que é o ponto de verificação real.

Essa última decisão é importante: a janela de licenciamento é aplicada na **autorização**, não na
navegação. Um título pode aparecer na tela por até 15 minutos após expirar, e não pode ser
reproduzido. A separação entre onde a regra é exibida e onde é imposta é o que permite que o
catálogo tenha cache agressivo.

## Observabilidade

```text
qualidade de experiência   tempo até o primeiro quadro, taxa de rebuffer,
                           taxa de bits média, todos por provedor de acesso,
                           região, dispositivo e título
entrega                    proporção do tráfego por origem (cache próprio
                           contra terceiro), taxa de acerto por cache
custo                      custo por hora assistida, calculado diariamente
                           e decomposto por origem
telemetria                 eventos recebidos contra eventos esperados por
                           sequência; lacunas por dispositivo
negócio                    horas assistidas por título, para relatório
                           contratual e para decisão de licenciamento
```

A segmentação da qualidade por provedor de acesso é o instrumento operacional central: ela
identifica que a degradação está numa rede específica, o que é acionável — falar com o provedor
ou instalar um cache — em vez de aparecer como uma piora difusa da média.

## Implantação

O plano de controle usa implantação canary convencional. O plano de dados é diferente: um
cache instalado na rede de um provedor não pode ser atualizado a qualquer momento, porque a
janela de manutenção é negociada com o parceiro.

A consequência é que o software dos caches precisa ser **compatível com versões anteriores por
mais tempo** do que o resto — o Roteador precisa funcionar com caches de duas versões atrás. A
regra adotada é de compatibilidade por 12 meses.

Recodificação do catálogo é feita em segundo plano, por lotes de popularidade: os títulos mais
assistidos primeiro, o que faz o benefício de custo aparecer nas primeiras semanas em vez de ao
fim dos 7 meses.

## Estratégia de Evolução

**Fase 1 (meses 1–6): codificação por título.** Recodificação do catálogo com taxas ajustadas por
conteúdo, por ordem de popularidade. Entrega a maior parte da meta de custo sem depender de
negociação com terceiros.

Resultado medido: volume médio por hora assistida caiu 21% em seis meses, com qualidade
percebida medida por painel de usuários mostrando diferença não significativa.

**Fase 2 (meses 4–14): caches nas duas maiores redes.** Piloto com dois provedores de acesso que
concentram 38% da audiência. Valida a operação, o modelo de segurança e a relação comercial.

**Fase 3 (meses 15–22): expansão para as seis maiores.** Cobertura de 71% da audiência com cache
próprio.

**Fase 4 (meses 20–26): roteamento por qualidade.** O Roteador passa a considerar qualidade
medida, e não apenas disponibilidade — desviando de um cache local que está degradado antes que
o assinante perceba.

**Fase 5 (meses 24–30): pré-carga preditiva.** Conteúdo pré-carregado nos caches por previsão de
demanda regional, não apenas por popularidade global.

**Condições que mudariam o plano:**

```text
se a concentração de audiência nas 6 maiores redes cair abaixo de 50%
  → a Opção B é reavaliada, ou a expansão é limitada e o terceiro
    volta a dominar

se um estúdio relevante exigir proteção incompatível com cache
  em rede de terceiro
  → aquele catálogo sai exclusivamente pelo terceiro

se a taxa de conexões abaixo de 5 Mbps cair para menos de 10%
  → o investimento em faixas de bits muito baixas deixa de se pagar

se o volume anual passar de ~8 exabytes
  → a economia justifica avaliar rede própria completa (Opção B)
```

## Resultados

Números ao fim da Fase 3, 22 meses após o início:

```text
custo por hora assistida               -31% (meta era -25%)
tráfego entregue por cache próprio     69%
tempo até o primeiro quadro, p95       de 2 100 ms para 1 240 ms
taxa de rebuffer                       de 0,9% para 0,31%
abandono nos primeiros 30 s, em
  conexões abaixo de 5 Mbps            de 19% para 8,4%
precisão da telemetria                 99,96%
cancelamento de assinatura             -1,8 p.p.
```

A redução de 31% no custo superou a meta, e 21 pontos vieram da Fase 1 — a recodificação, que
não dependeu de nenhuma negociação externa e foi a mais barata de executar.

A queda de 1,8 ponto percentual no cancelamento merece uma ressalva metodológica que a própria
empresa registrou: o período coincidiu com dois lançamentos de produção própria de grande
audiência, e não é possível atribuir integralmente a melhora à qualidade de entrega. A
correlação que sustenta a tese é mais estreita e mais confiável: entre assinantes cujas sessões
ocorrem majoritariamente em redes que ganharam cache próprio, a queda foi de 3,1 pontos; entre
os das redes ainda servidas por terceiro, de 0,4 ponto.

Essa comparação entre grupos que a arquitetura tratou de forma diferente foi possível apenas
porque a instrumentação segmentava qualidade por provedor de acesso desde o início — a mesma
decisão de observabilidade que servia à operação acabou servindo à avaliação do investimento.

## O que este case ensina

**Onde está o custo, está a arquitetura.** Com 96% do custo em entrega de bytes, otimizar o plano
de controle é irrelevante. A primeira pergunta de um sistema como este é onde o dinheiro sai, e
a resposta muda completamente o que merece atenção de engenharia.

**A mudança mais barata foi a de maior efeito.** A recodificação por título não exigiu
negociação, contrato nem infraestrutura nova — apenas capacidade de processamento e tempo. Ela
entregou dois terços da meta antes da primeira instalação de cache.

**Infraestrutura de terceiros é hostil por premissa.** Tratar os caches instalados em redes
alheias como não confiáveis, com conteúdo cifrado e sem chaves, é o que tornou a arquitetura
aceitável para os estúdios. A restrição virou desenho, e não obstáculo.

**Telemetria pode ser dado financeiro.** Numeração de sequência, reconciliação e retenção de 13
meses existem porque os eventos de reprodução pagam contratos. Tratá-los como métrica
operacional teria produzido um sistema com perda tolerada e uma divergência contratual anual.

## Conceitos Relacionados

- [CDN](/05-system-design/cdn.md).
- [Cache](/05-system-design/caching.md).
- [Case: Processamento de Eventos de Alto Volume](/21-case-studies/high-volume-events.md).
- [Custo vs. Confiabilidade](/20-trade-offs/cost-vs-reliability.md).

## Exercício Prático

Calcule quanto vale 1% de redução no volume médio entregue, para 3,4 exabytes anuais a R$ 55 por
terabyte.

Compare com o valor de 10% de redução na latência do serviço de catálogo. A diferença explica
por que a codificação foi a Fase 1.

## Perguntas de Entrevista

- Por que a janela de licenciamento é aplicada na autorização e não na navegação?
- Por que a numeração de sequência transforma telemetria em dado auditável?
- Por que os caches instalados em redes de terceiros são tratados como infraestrutura hostil?

## Para Aprofundar

- Netflix Technology Blog. *Per-Title Encode Optimization*, 2015.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Grigorik, Ilya. *High Performance Browser Networking*. O'Reilly, 2013.
