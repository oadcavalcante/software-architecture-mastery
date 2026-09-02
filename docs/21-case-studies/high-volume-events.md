---
id: high-volume-events
title: "Case: Processamento de Eventos de Alto Volume"
sidebar_position: 14
description: 4,2 milhões de eventos por segundo de telemetria industrial, onde a decisão é o que descartar e quando.
doc_type: case-study
level: 0
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor dimensiona um sistema de fluxo contínuo decidindo agregação, retenção
  e garantia de entrega por classe de evento, em vez de uniformemente.
prerequisites: [trade-offs]
related: [video-streaming, social-network, logistics]
canonical_for: []
content_version: 3
last_reviewed: 2026-08-29
---

# Case: Processamento de Eventos de Alto Volume

:::note Como usar este case

Leia contexto, requisitos e restrições. **Pare antes das opções de arquitetura** e esboce a sua
em vinte minutos.

Os números deste case são **ilustrativos** (SPEC.md §8.2): plausíveis e internamente
coerentes, não medidos num sistema nomeado. O que se aprende é o raciocínio que eles
sustentam, não as grandezas.

:::

## Contexto de Negócio

A **Sensia** opera uma plataforma de monitoramento industrial para 340 plantas — mineração,
papel e celulose, siderurgia e geração de energia. Cada planta tem entre 4 mil e 90 mil sensores
enviando telemetria continuamente: temperatura, vibração, pressão, corrente, vazão.

O produto entrega três coisas: painéis em tempo real para a sala de controle, alarmes quando uma
grandeza sai da faixa segura, e análise preditiva de falha de equipamento.

O terceiro é o que justifica o preço. Uma parada não programada de um forno de clínquer custa
entre R$ 400 mil e R$ 2 milhões por dia, e prever a falha com 48 horas de antecedência transforma
uma parada de emergência em manutenção programada.

Duas pressões motivam a revisão:

**Custo.** A plataforma gasta R$ 71 milhões por ano, dos quais 58% — R$ 41 milhões — em
armazenamento de telemetria
bruta que quase nunca é lida. A diretoria estabeleceu meta de redução de 40% no custo por sensor
monitorado.

**Latência de alarme.** O p99 do tempo entre a leitura do sensor e o alarme na sala de controle é
de 34 segundos. Para grandezas de segurança — pressão em vaso, temperatura em mancal — isso é
inaceitável, e dois clientes já apontaram o problema em auditoria de segurança operacional.

## Requisitos Funcionais

Para a **sala de controle**: ver o estado atual de qualquer sensor com atraso mínimo; receber
alarme quando uma grandeza cruza limite; e visualizar tendência recente.

Para a **engenharia de manutenção**: analisar histórico de um equipamento por meses ou anos;
correlacionar grandezas; e receber predição de falha com antecedência e nível de confiança.

Para a **gestão da planta**: acompanhar indicadores de eficiência e disponibilidade de
equipamento; e comparar entre turnos, linhas e plantas.

Para a **Sensia**: onboarding de planta nova sem desenvolvimento; e treinar modelos preditivos
sobre o histórico de todas as plantas.

Os três primeiros públicos têm requisitos incompatíveis sobre o mesmo dado: a sala de controle
quer latência mínima e não se importa com histórico; a engenharia quer histórico longo e tolera
segundos; a gestão quer agregados e tolera minutos.

## Requisitos Não-Funcionais

```text
p99 de latência para alarme de segurança     < 1 s
p99 para alarme operacional                  < 5 s
p99 para atualização de painel               < 3 s
disponibilidade da ingestão                  99,99%
disponibilidade do alarme                    99,99%
perda de evento de segurança                 0
perda de evento operacional                  < 0,1% aceitável
retenção de dados brutos                     30 dias
retenção de agregados                        5 anos
retenção para grandezas críticas             10 anos, brutas
                                             (exigência regulatória)
custo por sensor monitorado                  redução de 40%
```

A separação entre "perda zero" para eventos de segurança e "0,1% aceitável" para operacionais é a
decisão que abre toda a economia possível — e ela precisou ser negociada com clientes, porque
a plataforma anterior prometia perda zero para tudo.

## Restrições

```text
conectividade      plantas em áreas remotas, com enlace instável;
                   algumas por satélite, com latência de 600 ms
                   e cortes de horas
sensores           equipamentos de 5 a 25 anos, com protocolos
                   industriais antigos; nenhum será substituído
regulatório        grandezas ligadas a segurança de processo têm
                   retenção e integridade exigidas por norma
plantas            340 instalações, cada uma com autonomia
                   operacional e pouca tolerância a mudanças
equipe             68 engenheiros; 15 na plataforma de dados
custo              a meta de -40% é de diretoria
tempo real         a sala de controle não aceita degradação;
                   um painel que atrasa é motivo de reclamação
                   imediata do operador
```

A restrição de conectividade é a que estrutura o desenho: uma planta que perde enlace por 6 horas
não pode parar de monitorar, e não pode perder os eventos de segurança do período.

## Estimativas de Capacidade

```text
plantas                              340
sensores, total                      ~12,4 milhões
frequência média de leitura          1 a cada 3 s (varia de 100 ms a 60 s)
eventos/s, média                     ~4,2 milhões
eventos/s, pico                      ~6,1 milhões
eventos/dia                          ~363 bilhões
```

Quatro milhões e duzentos mil eventos por segundo. Este é o primeiro case deste conjunto em que a
escala **é** o problema — e a comparação com os anteriores é instrutiva: os cases de pagamentos e
banco tinham centenas de operações por segundo e arquiteturas complexas; este tem milhões e uma
arquitetura conceitualmente mais simples, porque o dado é pequeno, uniforme e descartável.

```text
tamanho médio do evento              ~48 bytes
volume bruto/dia                     ~17 TB
volume bruto/ano                     ~6,4 PB
```

E a distribuição de uso:

```text
eventos que disparam alarme                    ~0,003%
eventos lidos em painel de tempo real          ~2%
eventos lidos em análise histórica, brutos     ~0,4%
eventos usados apenas em agregados             ~97,6%
eventos nunca lidos de nenhuma forma           ~71%
```

Setenta e um por cento dos eventos nunca são lidos. O armazenamento bruto inteiro custa
R$ 41 milhões por ano, e como o evento tem tamanho fixo, esses 71% respondem por cerca de
R$ 29 milhões — e essa linha é a resposta ao problema de custo.

Obter essa distribuição foi um projeto em si. O sistema anterior não registrava quais eventos
eram lidos; a informação teve de ser reconstruída instrumentando as consultas por três meses e
correlacionando com os sensores acessados. Antes disso, a discussão sobre retenção era conduzida
com opiniões — "a engenharia pode precisar" — e nenhum número.

Esse padrão se repete em sistemas de dados: a decisão de quanto reter depende de saber o que é
lido, e quase nenhuma plataforma mede isso, porque medir acesso é trabalho e a resposta padrão
"guardar tudo" não exige justificativa.

## Opções de Arquitetura

O eixo é **onde o dado é reduzido e o que é preservado**.

### Opção A — Ingerir tudo, processar depois

Todos os eventos vão para o armazenamento; alarmes e agregados são calculados a partir de
consultas.

```text
latência de alarme    ruim — depende de consulta sobre volume alto
custo                 máximo — tudo armazenado bruto
flexibilidade         máxima — qualquer análise futura é possível
simplicidade          alta
```

É a arquitetura atual, e explica os 34 segundos de latência e os 58% de custo em armazenamento.

### Opção B — Processamento em fluxo, com agregação na ingestão

Os eventos passam por um processador contínuo que avalia alarmes, calcula agregados e decide o
que armazenar bruto.

```text
latência de alarme    excelente — avaliação na passagem
custo                 muito menor — só o necessário é armazenado bruto
flexibilidade         menor — uma análise futura sobre dado descartado
                      é impossível
complexidade          média a alta
```

### Opção C — Processamento na borda, dentro da planta

Um nó em cada planta avalia alarmes localmente e envia apenas agregados e eventos relevantes.

```text
latência de alarme    ótima — não depende do enlace
custo                 mínimo de banda e de armazenamento central
resiliência           a planta continua monitorada com enlace caído
complexidade          alta — 340 nós a operar e atualizar
flexibilidade         menor ainda
```

### Opção D — Borda com fluxo central

Nó na planta para alarmes e resiliência; processamento em fluxo no centro para agregação,
correlação entre plantas e treinamento de modelos.

```text
latência de alarme    ótima
custo                 baixo
resiliência           alta
complexidade          alta — dois níveis de processamento
capacidade preditiva  preservada — o centro vê todas as plantas
```

## Análise de Trade-offs

| Critério | Peso | A — Tudo central | B — Fluxo central | C — Só borda | D — Borda + fluxo |
|---|:-:|:-:|:-:|:-:|:-:|
| Latência de alarme | 30% | 2 | 7 | 10 | 10 |
| Custo | 25% | 1 | 8 | 9 | 8 |
| Resiliência a falha de enlace | 20% | 1 | 2 | 10 | 9 |
| Capacidade preditiva entre plantas | 15% | 9 | 9 | 2 | 9 |
| Complexidade operacional | 10% | 9 | 6 | 3 | 3 |
| **Total ponderado** | | **3,3** | **6,5** | **7,9** | **8,5** |

**Análise de sensibilidade**, redistribuindo o peso restante proporcionalmente entre os demais
critérios. Com complexidade em 30%, os totais viram 4,6 / 6,3 / 6,8 / 7,2. Com capacidade
preditiva em 35%, viram 4,6 / 7,1 / 6,5 / 8,6 — a Opção D mantém vantagem nos dois.

A Opção C não vence em nenhum cenário pelo mesmo motivo: sem visão central, o modelo preditivo é
treinado apenas com o histórico de uma planta, e a maior parte do valor do produto vem de
aprender com 340.

## Decisão

**Borda com fluxo central (Opção D)**, com a classificação de cada grandeza determinando seu
tratamento em ambos os níveis.

```text
classe de grandeza    tratamento na borda        tratamento central
segurança             alarme local, buffer com   armazenamento bruto,
                      persistência, entrega      10 anos, entrega garantida
                      garantida
operacional           alarme local, agregação    agregados 5 anos,
                      em janela de 10 s          brutos 30 dias
                                                 perda de 0,1% aceitável
tendência             agregação em janela        apenas agregados,
                      de 60 s                    5 anos
diagnóstico           armazenado localmente,     enviado sob demanda
                      enviado sob demanda
```

A classe **diagnóstico** é a decisão de maior efeito no custo: são grandezas de alta frequência
usadas apenas quando há investigação de falha. Elas ficam num buffer circular local de 7 dias e
só sobem quando alguém pede — o que ocorre para cerca de 0,2% dos sensores por mês.

A janela de 7 dias foi negociada com a engenharia de manutenção e é o compromisso central dessa
classe: investigações de falha começam, em 94% dos casos, dentro de 3 dias do evento. Os 6%
restantes são investigações tardias, e para elas o dado bruto não existe mais — resta o agregado.

Aceitar essa perda foi difícil e foi decidido com números: estender a janela para 30 dias custaria
R$ 9 milhões por ano para atender a 6% das investigações, das quais a maior parte chega a
conclusão com os agregados. A decisão está registrada com essa conta, e é revista anualmente.

Sozinha, essa classe representa 61% do volume bruto e passou a custar quase nada.

**Sob que condição cada opção descartada venceria:**

**Opção A venceria se** o volume fosse ordens de grandeza menor, ou se não houvesse restrição de
custo. Ela é a mais flexível, e essa flexibilidade tem valor quando o custo não é o problema.

**Opção B venceria se** as plantas tivessem conectividade confiável. Sem falha de enlace, o nó
local é complexidade desnecessária — e para as 84 plantas com enlace estável, a Sensia avalia
operá-las em modo B, sem nó local, o que está registrado como possível simplificação.

**Opção C venceria se** o produto fosse apenas monitoramento e alarme, sem predição. A predição
entre plantas é o que exige o centro.

## Componentes

**Nó de Borda.** Um por planta. Coleta dos sensores, avalia alarmes, agrega, decide o que enviar,
e mantém buffer local. É o componente mais replicado e o mais difícil de operar.

**Coletor de Protocolos.** Dentro do nó de borda, traduz os protocolos industriais antigos para o
modelo interno.

**Ingestão Central.** Recebe o que vem das 340 plantas.

**Processador de Fluxo.** Agregação, correlação entre plantas, detecção de padrão.

**Armazenamento Quente.** Dados brutos recentes e agregados, para consulta interativa.

**Armazenamento Frio.** Séries longas, para análise e treinamento.

**Serviço de Alarme.** Consolidação, deduplicação e roteamento de alarmes; o alarme é gerado na
borda e roteado pelo centro.

**Serviço de Painel.** Serve as visualizações de tempo real e histórico.

**Plataforma de Modelos.** Treina e serve os modelos preditivos.

**Catálogo de Sensores.** Metadados: qual sensor, em qual equipamento, de qual classe, com quais
limites.

O **Catálogo de Sensores** é o componente que parece administrativo e é central: a classificação
de cada um dos 12,4 milhões de sensores determina como ele é tratado nos dois níveis. Um sensor
mal classificado ou é caro demais, ou não gera alarme quando deveria.

## Dados

**Modelo de evento.** Deliberadamente mínimo.

```text
evento   (sensor_id, timestamp, valor, qualidade)
         ~48 bytes, com sensor_id como inteiro e
         qualidade como enumeração de 1 byte
```

Não há nome de sensor, unidade, planta nem equipamento no evento — tudo isso está no catálogo, e
incluí-lo multiplicaria o volume por quatro. É uma normalização agressiva justificada
exclusivamente por escala.

**Séries temporais.** Armazenamento especializado, particionado por planta e por período, com
compressão específica para séries.

A compressão é o que torna a economia viável: séries de sensores industriais são altamente
comprimíveis, porque valores consecutivos variam pouco. A taxa medida é de 11:1 para grandezas
operacionais e 22:1 para grandezas estáveis.

```text
volume bruto/dia                    ~17 TB
após classificação e descarte
  na borda                          ~2,9 TB
após compressão                     ~260 GB/dia
```

De 17 TB para 260 GB por dia. A classificação responde por 83% da redução, e a compressão pelo
restante.

**Agregados.** Pré-calculados em três janelas — 1 minuto, 15 minutos e 1 hora — com mínimo,
máximo, média, desvio e contagem. Cobrem 97,6% das consultas.

Calcular agregados na ingestão em vez de na consulta é o que permite responder a uma pergunta
sobre um ano de dados em menos de um segundo, sobre um volume que uma varredura levaria minutos
para percorrer.

**Buffer de borda.** Armazenamento local em cada planta, dimensionado para 7 dias de todos os
sensores. É o que garante zero perda de evento de segurança durante corte de enlace.

## Integração

**Coleta dos sensores.** O ponto mais irregular do sistema. São protocolos industriais de
gerações diferentes, alguns com limitações severas — um deles não permite mais de 200 leituras
por segundo por controlador, o que exige distribuir a coleta.

O Coletor de Protocolos isola essa irregularidade. Cada protocolo tem um adaptador, e o resto do
sistema vê apenas eventos no modelo interno.

**Borda para centro.** Envio em lote, comprimido, com confirmação. Eventos de segurança usam
entrega garantida com confirmação por lote; operacionais usam entrega otimista, com perda
tolerada.

Durante corte de enlace, o nó continua operando: alarmes locais funcionam, dados vão para o
buffer, e a sincronização ocorre na reconexão — com prioridade para eventos de segurança.

```text
comportamento durante corte de enlace
  alarmes de segurança      funcionam localmente, com sirene na planta
  alarmes operacionais      funcionam localmente
  painel central            mostra a planta como "sem comunicação",
                            com o último estado conhecido e sua idade
  buffer                    acumula; capacidade de 7 dias
  reconexão                 envia segurança primeiro, depois
                            operacional, depois agregados
```

O corte mais longo registrado foi de 41 horas, numa planta com enlace por satélite durante
tempestade. Nenhum evento de segurança foi perdido, e o painel central indicou corretamente a
ausência de comunicação durante todo o período.

**Alarmes.** Gerados na borda, roteados pelo centro. Essa divisão é deliberada: gerar no centro
adicionaria a latência do enlace ao caminho crítico de segurança; rotear na borda exigiria que
cada nó conhecesse a estrutura de escalonamento e os contatos de plantão.

**Predição.** Modelos treinados no centro, com dados de todas as plantas, e servidos tanto no
centro quanto — para os modelos leves — na borda. Um modelo que detecta anomalia de vibração roda
localmente e não depende do enlace.

## Segurança

```text
segregação de rede    a rede industrial da planta é separada da
                      corporativa; o nó de borda é o único ponto
                      de contato, com fluxo unidirecional por padrão
comandos              a plataforma é somente leitura: não escreve
                      em nenhum controlador industrial
autenticação          mútua entre nó de borda e centro, com
                      certificado por planta
dados                 telemetria industrial é informação
                      comercialmente sensível; isolamento por cliente
acesso                por planta e por perfil; um operador vê
                      apenas a sua unidade
integridade           eventos de grandezas críticas têm verificação
                      de integridade fim a fim, por exigência normativa
atualização do nó
  de borda            assinada, com reversão automática; uma planta
                      não pode ficar sem monitoramento por falha
                      de atualização
```

A decisão de a plataforma ser **somente leitura** — nunca enviar comando a um controlador — é a
mais importante do desenho de segurança. Ela elimina toda uma classe de risco: um comprometimento
da plataforma não pode alterar o processo industrial.

Foi contestada por clientes que queriam atuação automática — parar um equipamento ao detectar
anomalia — e mantida. O compromisso foi gerar o alarme com máxima prioridade e deixar a atuação
para os sistemas de segurança da própria planta, que são certificados para isso.

## Escalabilidade

O sistema escala em duas dimensões independentes, e essa separação é o que o torna tratável.

**Por planta.** Cada nó de borda é dimensionado para os sensores da sua planta. Uma planta de 90
mil sensores tem um nó maior; uma de 4 mil, um menor. Adicionar plantas não afeta as existentes.

**No centro.** A ingestão e o processamento de fluxo são particionados por planta, o que dá
paralelismo natural e limita o raio de qualquer problema.

O centro processa cerca de 340 mil eventos por segundo — não os 4,2 milhões —, porque a borda já
reduziu. Essa redução de 12× na entrada do centro é o que torna a arquitetura central
convencional.

```text
eventos/s gerados nos sensores       ~4 200 000
eventos/s enviados ao centro         ~340 000
eventos/s armazenados brutos         ~62 000
```

## Confiabilidade

Se um **nó de borda** falha, aquela planta perde monitoramento. É o cenário mais grave, e por isso
os nós têm redundância: dois equipamentos por planta, com o segundo assumindo automaticamente.
Plantas com grandezas de segurança críticas têm três.

Se o **enlace** cai, o nó opera sozinho. É o cenário para o qual todo o desenho de borda existe, e
ele ocorre em média 4 vezes por mês em alguma planta.

Se a **Ingestão Central** falha, os nós acumulam e retomam. Nenhum alarme é perdido, porque eles
são gerados localmente.

Se o **Processador de Fluxo** falha, agregados atrasam. Os painéis mostram dado com atraso
declarado, e alarmes não são afetados.

Se o **Armazenamento Frio** fica indisponível, a análise histórica não funciona e a operação
continua.

A propriedade que sustenta tudo: **nada no caminho crítico de segurança depende do centro**. O
alarme que protege um vaso de pressão é gerado a metros dele, por um equipamento local, e soa na
própria planta.

Essa propriedade é verificada, não assumida: um teste mensal corta a comunicação de uma planta
selecionada por rodízio e confirma que os alarmes locais continuam funcionando, com registro do
resultado. Em 24 meses, o teste foi executado 24 vezes e falhou uma — numa planta em que uma
atualização tinha deixado a configuração de sirene local inconsistente.

Essa única falha justifica o teste. Ela teria permanecido invisível até um corte real de enlace
coincidir com uma condição de alarme, que é exatamente o cenário para o qual o desenho existe.

## Observabilidade

```text
eventos/s por planta, ingeridos contra esperados
sensores sem leitura há mais de N intervalos
latência fim a fim: sensor → alarme, p50/p99, por classe
tempo de corte de enlace, por planta
ocupação do buffer de borda, por planta
taxa de compressão obtida
custo por sensor, calculado e decomposto
alarmes gerados, por classe e por planta
precisão da predição: alertas emitidos contra falhas ocorridas
```

A métrica de **sensores sem leitura** é a que detecta o modo de falha mais insidioso: um sensor
que para de enviar não gera alarme — ele simplesmente some. Sem essa verificação, um sensor de
segurança com defeito produz silêncio, que é indistinguível de "tudo bem".

Essa verificação foi acrescentada depois de um incidente em que um sensor de temperatura de
mancal ficou 11 dias sem enviar, e ninguém percebeu.

A **precisão da predição** é a métrica de produto: alertas emitidos contra falhas efetivamente
ocorridas, e falhas ocorridas sem alerta prévio. É acompanhada por cliente, porque é o número que
justifica o contrato.

## Implantação

O centro usa implantação contínua convencional.

Os nós de borda são o desafio: 340 equipamentos, em plantas com autonomia operacional, alguns
acessíveis apenas por enlace instável. A atualização é em ondas, assinada, com verificação de
integridade e reversão automática se o nó não reportar saudável em 10 minutos.

Nenhuma atualização de nó durante parada programada de manutenção da planta — o período em que
o monitoramento é mais necessário — nem durante partida de equipamento.

Uma planta pode recusar uma janela de atualização, e algumas recusam por meses. O sistema
suporta nós com até 4 versões de defasagem, e o protocolo entre borda e centro é
retrocompatível por 18 meses.

## Estratégia de Evolução

**Fase 1 (meses 1–6): classificação de sensores.** Catalogar e classificar os 12,4 milhões de
sensores por classe de grandeza. Trabalho de dados e de engenharia de processo, com pouca
codificação — e é o que destrava tudo o mais.

A classificação inicial foi automática por padrão de nome e tipo de equipamento, com revisão
humana das grandezas de segurança. 4,1% ficaram ambíguas e foram revisadas uma a uma com os
clientes.

**Fase 2 (meses 5–14): nó de borda.** Implantação nos 340 sites, começando pelas plantas com pior
enlace — que são as que mais se beneficiam.

Resultado medido nas primeiras 40 plantas: latência de alarme de segurança de 34 s para 0,4 s;
volume enviado ao centro reduzido em 91%.

**Fase 3 (meses 12–19): fluxo central e agregados.** Processamento contínuo, agregados
pré-calculados e armazenamento hierárquico.

**Fase 4 (meses 17–24): classe diagnóstico sob demanda.** A mudança de maior efeito no custo,
deixada para depois porque exige que o buffer de borda esteja maduro e confiável.

**Fase 5 (meses 22–30): predição na borda.** Modelos leves executando localmente, o que torna a
detecção de anomalia independente do enlace.

**Condições que mudariam o plano:**

```text
se uma classe de análise futura exigir dado bruto descartado
  → a decisão de classificação é revista para os sensores
    envolvidos; o dado perdido não volta

se a taxa de corte de enlace cair abaixo de 1 evento/mês
  em uma planta
  → aquela planta pode operar sem nó de borda (Opção B),
    reduzindo custo operacional

se o número de sensores por planta passar de ~200 mil
  → o nó de borda precisa ser distribuído dentro da planta

se a regulação estender a exigência de retenção bruta a
  grandezas operacionais
  → 41% da economia de armazenamento é perdida, e a
    conta precisa ser refeita
```

A primeira condição merece destaque: **descartar dado é irreversível**. A decisão de classificar
uma grandeza como diagnóstico e não armazená-la centralmente fecha a porta para análises futuras
sobre ela. Isso foi discutido explicitamente com a área de ciência de dados, que aceitou o
trade-off para 61% do volume e recusou para outras grandezas que pareciam candidatas.

## Resultados

Números ao fim da Fase 4, 24 meses após o início:

```text
p99 de latência para alarme de segurança  de 34 s para 0,6 s
p99 para alarme operacional               de 34 s para 2,1 s
volume enviado ao centro                  -92%
volume armazenado bruto                   -85%
custo por sensor monitorado               -54% (meta era -40%)
eventos de segurança perdidos             0 em 24 meses
plantas monitoradas durante corte
  de enlace                               100%
precisão da predição de falha             de 61% para 78%
falhas previstas com > 48 h                de 44% para 71%
```

O ganho de precisão preditiva não foi objetivo do projeto e veio de um efeito indireto: com
agregados consistentes e alta qualidade de dado — sem lacunas por perda de enlace — os modelos
passaram a treinar sobre séries completas. A qualidade do dado melhorou mais que os modelos.

## O que este case ensina

**Classificar o dado é a decisão de arquitetura.** Não há uma resposta para "quanto reter" — há
uma resposta por classe de grandeza, e descobrir as classes foi 6 meses de trabalho antes de
qualquer código. Foi o que destravou 54% de redução de custo.

**Nem toda garantia precisa ser uniforme.** Perda zero para eventos de segurança e 0,1% tolerado
para operacionais é o que viabiliza a economia. Prometer perda zero para tudo é caro e, na
maioria dos casos, sem valor.

**O caminho crítico não deve atravessar a rede.** O alarme que protege um equipamento é gerado a
metros dele. Colocar o enlace no caminho de segurança foi o defeito estrutural da arquitetura
anterior, e nenhuma otimização o resolveria.

**A ausência de dado é um evento.** Um sensor que para de enviar produz silêncio, não alarme. A
verificação de sensores sem leitura foi acrescentada depois de um incidente, e é o tipo de
requisito que só aparece quando alguém pergunta "o que acontece se este dado simplesmente parar
de chegar?".

## Conceitos Relacionados

- [Case: Streaming de Vídeo](/21-case-studies/video-streaming.md) — o outro case dominado por volume.
- [Mensageria](/06-distributed-systems/messaging.md).
- [Garantias de Entrega](/06-distributed-systems/delivery-guarantees.md).
- [Custo vs. Confiabilidade](/20-trade-offs/cost-vs-reliability.md).

## Exercício Prático

Classifique os eventos do seu sistema em quatro classes por valor e por tolerância a perda, e
estime o volume de cada uma.

Depois calcule o custo de armazenar tudo com a garantia da classe mais exigente. A diferença
entre esse número e o custo da classificação é o que este case economiza.

## Perguntas de Entrevista

- Por que este é o único case do conjunto em que a escala é de fato o problema?
- Por que o alarme de segurança é gerado na borda e não no centro?
- Por que a ausência de dado precisa ser tratada como evento?

## Para Aprofundar

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Akidau, Tyler et al. *Streaming Systems*. O'Reilly, 2018.
- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*. Addison-Wesley, 2003.
