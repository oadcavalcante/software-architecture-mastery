---
id: logistics
title: "Case: Logística e Malha de Entregas"
sidebar_position: 9
description: Rede de 41 centros e 9 mil veículos, onde o planejamento é diário e a realidade muda a cada hora.
doc_type: case-study
level: 0
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor projeta um sistema que combina planejamento em lote com replanejamento
  contínuo, e sabe onde cada um pertence.
prerequisites: [trade-offs]
related: [ride-sharing, food-delivery, ecommerce]
canonical_for: []
content_version: 3
last_reviewed: 2026-08-29
---

# Case: Logística e Malha de Entregas

:::note Como usar este case

Leia contexto, requisitos e restrições. **Pare antes das opções de arquitetura** e esboce a sua
em vinte minutos.

Os números deste case são **ilustrativos** (SPEC.md §8.2): plausíveis e internamente
coerentes, não medidos num sistema nomeado. O que se aprende é o raciocínio que eles
sustentam, não as grandezas.

:::

## Contexto de Negócio

A **Trilha** é uma operadora logística que faz a entrega da última milha para varejistas e
plataformas de comércio eletrônico. Opera 41 centros de distribuição, 3 hubs de triagem e uma
frota de cerca de 9 mil veículos, entre próprios e agregados.

Volume: 2,3 milhões de encomendas por dia, com prazos contratados que variam de mesmo dia a
cinco dias úteis.

A diferença essencial em relação aos casos de [transporte](/21-case-studies/ride-sharing.md) e
[delivery](/21-case-studies/food-delivery.md) é o horizonte: aqui o planejamento é feito de véspera, para o dia
seguinte, com informação completa — e depois a realidade o desmonta. Trânsito, ausência do
destinatário, veículo quebrado, encomenda extraviada e endereço errado desviam entre 12% e 18%
do plano diário.

Duas pressões motivam a revisão:

**Custo por entrega.** A malha opera com ocupação média de 68% da capacidade dos veículos, e a
diretoria estabeleceu meta de reduzir o custo por entrega em 20%.

**Prazo.** A taxa de entrega no prazo é de 91,4%, contra 96% contratado com os maiores clientes.
As multas contratuais somaram R$ 31 milhões no último ano.

## Requisitos Funcionais

Para a **operação de centro**: receber e conferir cargas; triar por rota; carregar veículos
conforme o plano; e registrar saída.

Para o **motorista**: receber a rota do dia, ordenada; navegar; registrar entrega, tentativa
frustrada ou recusa; coletar comprovação; e receber realocação quando a rota mudar.

Para o **cliente final**: acompanhar a encomenda; receber estimativa de janela de entrega;
reagendar; e escolher ponto alternativo de retirada.

Para o **cliente contratante** — o varejista: enviar as encomendas do dia com prazos; acompanhar
desempenho; e receber comprovação de entrega.

E para a **plataforma**: planejar as rotas do dia otimizando ocupação e prazo; replanejar
continuamente conforme os desvios ocorrem; prever risco de atraso antes de ele acontecer; e
equilibrar carga entre centros.

O par planejar/replanejar é o núcleo. São dois problemas com naturezas opostas — um em lote com
informação completa, outro contínuo com informação parcial — e a arquitetura precisa acomodar os
dois sem que um contamine o outro.

## Requisitos Não-Funcionais

```text
janela de planejamento diário            < 90 min (entre 22h e 23h30)
p95 do replanejamento de uma rota        < 30 s
p95 da consulta de rastreamento          < 500 ms
disponibilidade do aplicativo do
  motorista                              99,9%, com operação offline
disponibilidade do rastreamento          99,95%
precisão da janela de entrega estimada   ± 60 min em 85% dos casos
sincronização de registro de entrega     < 5 min após reconexão
retenção de comprovação de entrega       5 anos (contratual e fiscal)
custo por entrega                        redução de 20%
```

A janela de 90 minutos para o planejamento é a restrição de tempo mais dura do sistema: às 23h30
os centros começam a triagem, e um plano que não esteja pronto significa triagem manual, que é
mais lenta e mais cara.

## Restrições

```text
operação offline    o motorista perde sinal em zonas rurais e em
                    prédios; o aplicativo precisa funcionar sem
                    conexão por horas e sincronizar depois
frota mista         veículos próprios com telemetria e agregados
                    sem nenhuma; a informação disponível difere
janela de entrega   restrições de circulação em centros urbanos por
                    horário e por tipo de veículo
prazo contratual    multas por entrega fora do prazo, por cliente
capacidade física   cada veículo tem limite de volume, peso e
                    número de paradas
motoristas          jornada regulada, com limite de horas e
                    intervalos obrigatórios
equipe              98 engenheiros; 21 no domínio de planejamento
dados de entrada    o varejista envia a lista do dia às 21h;
                    atrasos e correções chegam até 23h
```

A restrição de operação offline é a que mais afeta o desenho do aplicativo do motorista: ele não
é um cliente de um sistema remoto, é um sistema local que sincroniza.

Essa distinção parece de vocabulário e é de arquitetura. Um cliente remoto assume que o servidor
está disponível e trata a ausência de conexão como erro; um sistema local assume o contrário e
trata a conexão como oportunidade de sincronizar. As duas premissas levam a estruturas de dados,
tratamento de conflito e experiência de uso completamente diferentes — e converter um no outro
depois é uma reescrita, não um ajuste.

O aplicativo anterior era um cliente remoto com cache. Ele funcionava enquanto havia sinal, e
degradava de formas imprevisíveis quando não havia — que é exatamente o comportamento que
produzia registros de entrega perdidos.

## Estimativas de Capacidade

```text
encomendas/dia                       2,3 milhões
veículos em rota/dia                 ~9 000
paradas por rota, média              ~140
paradas/dia                          ~1,26 milhão
                                     (uma parada pode ter várias encomendas)

eventos de rastreamento/dia          ~28 milhões
                                     (coleta, triagem, carregamento, saída,
                                      tentativa, entrega)
eventos/s, média                     ~324
pico (18h-21h, entregas concentradas) ~2 100/s

consultas de rastreamento/dia        ~41 milhões
pico                                 ~1 800/s
```

O volume transacional é modesto. O problema computacional está no planejamento:

```text
rotas a planejar por noite           ~9 000
paradas a distribuir                 ~1,26 milhão
tempo disponível                     90 min
restrições por rota                  capacidade, janela de circulação,
                                     jornada, prazo por encomenda,
                                     compatibilidade veículo-carga
```

Roteirizar 1,26 milhão de paradas em 9 mil veículos com cinco famílias de restrição, em 90
minutos, é o dimensionamento real deste sistema. Ele não se parece com nenhum dos casos
anteriores.

E ele tem uma propriedade que muda a abordagem: o problema é **decomponível**. As paradas de um
centro não competem com as de outro, porque cada centro tem sua própria frota e sua própria área
de cobertura. Isso transforma um problema de 1,26 milhão de paradas em 41 problemas de cerca de
31 mil, resolvíveis em paralelo.

Reconhecer a decomponibilidade cedo é o que torna a janela de 90 minutos alcançável. Sem ela, o
problema é intratável no tempo disponível com qualquer técnica — e a tentativa anterior de
resolver globalmente foi abandonada depois de produzir planos que não terminavam antes das 2h.

```text
armazenamento
  encomendas, 5 anos                 ~4,2 bilhões  →  ~2,6 TB
  eventos de rastreamento, 5 anos    ~51 bilhões   →  ~11 TB
  comprovações (foto e assinatura)   ~380 TB
  telemetria de veículos, 90 dias    ~4 TB
```

## Opções de Arquitetura

O eixo é **como planejamento e replanejamento se relacionam**.

### Opção A — Planejamento em lote, replanejamento manual

O plano é gerado à noite; durante o dia, desvios são tratados pela central de operação, por
pessoas.

```text
qualidade do plano   boa, com informação completa
resposta a desvio    lenta e inconsistente; depende da central
custo                alto em pessoal de operação (142 pessoas)
escala               a central é o gargalo em dias ruins
```

É a arquitetura atual.

### Opção B — Planejamento em lote, replanejamento automático local

O plano noturno permanece, e cada rota é replanejada automaticamente quando desvia, considerando
apenas as paradas restantes daquela rota.

```text
qualidade do plano   igual à Opção A
resposta a desvio    rápida e consistente
escopo               local — não realoca entre rotas
custo                menor em pessoal
complexidade         média
limitação            um veículo quebrado exige realocação entre rotas,
                     que o escopo local não faz
```

### Opção C — Planejamento contínuo

O plano é recalculado continuamente ao longo do dia, considerando todas as rotas de uma região
em conjunto.

```text
qualidade            melhor teoricamente — realoca entre rotas
resposta a desvio    ótima
complexidade         alta — o problema completo a cada ciclo
instabilidade        rotas mudando durante o dia confundem motoristas
                     e inviabilizam a triagem, que já foi feita
custo computacional  alto
```

A Opção C tem um problema que não é técnico: **a carga já está no veículo**. Realocar uma
encomenda entre rotas às 14h exige que dois veículos se encontrem, o que raramente compensa.

## Análise de Trade-offs

| Critério | Peso | A — Manual | B — Local | C — Contínuo |
|---|:-:|:-:|:-:|:-:|
| Taxa de entrega no prazo | 30% | 4 | 8 | 8 |
| Custo operacional | 25% | 3 | 8 | 7 |
| Viabilidade física | 20% | 8 | 9 | 3 |
| Complexidade e risco | 15% | 8 | 6 | 3 |
| Capacidade da equipe | 10% | 9 | 7 | 4 |
| **Total ponderado** | | **5,7** | **7,8** | **5,6** |

O critério de viabilidade física existe porque a Opção C esbarra numa restrição do mundo real,
não de software: a carga está fisicamente no veículo, e mover encomendas entre rotas durante o
dia é caro e lento. Uma arquitetura que otimiza ignorando isso produz planos que a operação não
executa.

**Análise de sensibilidade.** Com prazo em 50%, os totais viram 4,8 / 8,2 / 7,1 — a Opção B
mantém a vantagem. Nenhum cenário testado inverte o resultado, o que é consequência de a Opção C
ter uma limitação estrutural e não apenas um custo maior.

## Decisão

**Planejamento em lote com replanejamento automático local (Opção B)**, complementado por um
mecanismo restrito de realocação entre rotas para casos específicos — veículo quebrado, e
encomendas de prazo crítico que a rota atual não conseguirá cumprir.

A realocação entre rotas é acionada por exceção e passa por aprovação da central, que continua
existindo, mas com 44 pessoas em vez de 142 — tratando exceções em vez de operar o dia inteiro.

**Sob que condição cada opção descartada venceria:**

**Opção A venceria se** o volume fosse muito menor — abaixo de algumas centenas de rotas diárias,
uma central pequena responde bem e a automação não se paga.

**Opção C venceria se** a carga não estivesse fisicamente comprometida com um veículo. É o caso
de operações com hubs de transferência densos, em que realocar é barato — ou de entregas por
motocicleta a partir de pontos de retirada, em que cada encomenda é independente. A condição
está registrada: se a malha adotar hubs urbanos de transferência, a Opção C é reavaliada.

## Componentes

**Recepção de Pedidos.** Ingestão das listas dos varejistas, com validação de endereço e
classificação de prazo.

**Planejador Noturno.** O motor de roteirização em lote. Roda entre 22h e 23h30, por centro.

**Replanejador.** Recalcula a ordem das paradas restantes de uma rota quando ela desvia.

**Serviço de Rota.** Estado de cada rota e de cada parada; a fonte de verdade do plano.

**Aplicativo do Motorista.** Sistema local com sincronização; opera offline.

**Serviço de Rastreamento.** Eventos de encomenda e consulta pública.

**Preditor de Atraso.** Estima o risco de uma rota não cumprir os prazos, com antecedência.

**Serviço de Comprovação.** Fotos, assinaturas e documentos de entrega.

**Central de Exceções.** Ferramenta da equipe de operação para os casos que a automação escala.

**Serviço de Capacidade.** Equilíbrio de carga entre centros, no horizonte de dias.

A separação entre **Planejador Noturno** e **Replanejador** é a decisão estrutural do sistema.
São dois motores diferentes, com objetivos diferentes: o primeiro otimiza globalmente com tempo
de sobra; o segundo responde localmente em segundos. Tentar usar o mesmo motor para os dois foi a
tentativa inicial, e falhou pelos dois lados — lento demais para o replanejamento, e simples
demais para o plano noturno.

## Dados

**Encomenda e rota.** PostgreSQL, com o ciclo de vida da encomenda como máquina de estados. O
volume é baixo e a correção importa: uma encomenda em duas rotas é um problema operacional
direto.

**Plano do dia.** Materializado por rota, com a sequência de paradas e as janelas estimadas.
Escrito uma vez pelo Planejador Noturno e alterado pelo Replanejador ao longo do dia, com
versionamento — o aplicativo do motorista precisa saber se sua cópia está desatualizada.

**Eventos de rastreamento.** Append-only, particionado por dia. Cada evento carrega origem,
horário do dispositivo e horário do servidor, porque a diferença entre os dois é informação: um
evento registrado offline chega com atraso, e a ordem cronológica real é a do dispositivo.

**Comprovação.** Armazenamento de objetos, com os 380 TB dominados por fotos. É o maior item de
armazenamento e um dos maiores de custo, e foi otimizado por compressão e por redução de
resolução — as fotos existem para comprovar entrega, não para uso fotográfico.

**Estado local do aplicativo.** Banco embarcado no dispositivo, com a rota do dia completa e a
fila de eventos pendentes. É a fonte de verdade enquanto o motorista está offline, e sincroniza
por reconciliação quando reconecta.

## Integração

**Ingestão noturna.** As listas chegam às 21h, com correções até 23h. O sistema aceita a lista
inicial, começa a preparação — validação de endereço, geocodificação, agrupamento por região —
e incorpora as correções até o corte.

A geocodificação é o gargalo silencioso: cerca de 4% dos endereços não resolvem
automaticamente, e são 92 mil por noite. A solução foi um cache de endereços já resolvidos —
que cobre 89% dos casos, porque a maior parte das entregas vai para endereços já visitados — e
uma fila de resolução assistida para o resto.

O cache de endereços tem um efeito secundário relevante: ele guarda não a coordenada retornada
pelo geocodificador, mas a **coordenada corrigida pelo motorista**. Quando uma entrega é
registrada num ponto diferente do previsto por uma distância significativa, o sistema propõe a
correção, e endereços com histórico consistente de correção passam a usar a posição real.

Isso resolveu uma classe de problema que nenhum fornecedor de geocodificação resolve: condomínios
com portaria distante do endereço formal, entradas de serviço, e zonas rurais onde o endereço
postal aponta para o centro da localidade. Cerca de 340 mil endereços foram corrigidos dessa
forma no primeiro ano, e o tempo médio de parada nesses pontos caiu 4 minutos.

**Planejamento.** Executado por centro, em paralelo. Cada centro é um problema independente, o
que permite paralelizar completamente e cumprir a janela de 90 minutos.

O motor resolve por decomposição: primeiro agrupa paradas em clusters geográficos, depois
resolve a ordem dentro de cada cluster, depois atribui clusters a veículos respeitando
capacidade e jornada. É uma heurística, não uma solução ótima — e a diferença medida contra a
solução ótima, em instâncias pequenas onde ela é computável, fica entre 3% e 6%.

**Replanejamento.** Disparado por evento: tentativa frustrada, atraso acumulado acima de um
limiar, ou mudança de janela pelo destinatário. Recalcula apenas a ordem das paradas restantes,
o que é um problema pequeno e resolve em menos de 30 segundos.

**Sincronização do aplicativo.** O aplicativo baixa a rota completa antes da saída e opera
offline. Eventos são acumulados localmente com carimbo de tempo do dispositivo, e enviados em
lote quando há conexão.

Conflitos são raros e têm regra clara: o evento do dispositivo vence sobre o estado do servidor,
porque o motorista é quem estava lá. A exceção é cancelamento pelo cliente, que vence sempre.

## Segurança

```text
comprovação de entrega   foto e assinatura são dados pessoais;
                         acesso restrito, retenção 5 anos
endereços                dado sensível; o motorista vê apenas as
                         paradas do seu dia
rastreamento público     código de rastreio não revela endereço
                         completo nem nome do destinatário
telemetria de veículo    posição do motorista durante a jornada;
                         acesso restrito, uso declarado
agregados                motoristas agregados acessam apenas
                         a própria rota, com identidade verificada
integração com
  varejistas             autenticação mútua, contratos versionados
```

A decisão de o rastreamento público não revelar endereço completo veio de um incidente do setor:
códigos de rastreio sequenciais permitiam enumerar entregas e descobrir endereços. Os códigos da
Trilha são não sequenciais e a consulta pública mostra apenas cidade e estado até que o
destinatário se autentique.

## Escalabilidade

O sistema escala por **centro**. Cada um dos 41 centros é uma unidade de planejamento
independente, o que torna o problema noturno paralelizável e a operação diurna isolada.

O planejamento noturno é o pico de computação do sistema, e ele é concentrado: 90 minutos de uso
intenso, 22 horas e meia de ociosidade. A capacidade é provisionada sob demanda para a janela e
liberada depois, o que reduziu o custo dessa etapa em 74% em relação a capacidade fixa.

O rastreamento público — 41 milhões de consultas por dia — é servido por cache com invalidação
por evento, com taxa de acerto de 94%. Quase todas as consultas são repetidas: o destinatário
consulta várias vezes no mesmo dia.

## Confiabilidade

Se o **Planejador Noturno** falha, o plano do dia anterior é reaproveitado como base e ajustado
manualmente pela central. É o pior cenário do sistema, e o único com plano de contingência
ensaiado trimestralmente.

Se o **Replanejador** fica indisponível, as rotas seguem o plano original e a central trata os
desvios manualmente. É a degradação para o modo da Opção A.

Se o **Serviço de Rota** falha, os aplicativos continuam operando com a cópia local — que é a
propriedade mais valiosa do desenho offline. A entrega do dia não para.

Se o **Rastreamento** fica indisponível, a operação continua e o cliente final não consulta.

Se a **Comprovação** falha, as fotos ficam no dispositivo e sincronizam depois. A entrega é
registrada; a comprovação chega com atraso.

A propriedade que sustenta tudo isso é que **o aplicativo do motorista é autônomo**. Uma falha
central atrasa a informação, não a operação física.

## Observabilidade

```text
taxa de entrega no prazo, por centro, rota e cliente contratante
ocupação média dos veículos
paradas por rota, planejadas contra realizadas
desvio do plano: paradas fora da sequência planejada
tempo de execução do planejamento noturno, por centro
taxa de replanejamento acionado, por causa
risco de atraso previsto contra atraso ocorrido
eventos pendentes de sincronização, por dispositivo e idade
taxa de geocodificação automática
```

O **desvio do plano** é a métrica mais informativa e a menos óbvia: ela mede quanto da realidade
o plano não previu, e a análise das causas é o que alimenta a melhoria do planejador. Descobriu-se,
por exemplo, que 31% dos desvios vinham de janelas de circulação urbana modeladas incorretamente
— uma correção de dados, não de algoritmo.

O **risco de atraso previsto contra ocorrido** valida o Preditor. Ele existe para acionar a
central antes do atraso, e um preditor com baixa precisão gera alarmes que consomem a equipe sem
evitar nada.

## Implantação

O planejador noturno é implantado com validação em paralelo: a versão nova roda ao lado da atual
por duas semanas, e os planos são comparados por métricas de qualidade — ocupação, distância
total, risco de atraso — antes de qualquer troca.

Nenhuma implantação do planejador entre 20h e 2h. Uma falha ali não tem recuperação dentro da
janela.

A comparação em paralelo do planejador tem uma dificuldade específica que vale registrar: os dois
planos não podem ser executados, apenas um vai para a operação. A avaliação é feita sobre
métricas do plano — ocupação, distância, risco previsto — e não sobre resultado real, o que
significa que uma versão pode parecer melhor no papel e produzir pior resultado na rua.

A mitigação foi rodar a versão nova em três centros por duas semanas antes da adoção geral, com
resultado real medido. Duas das cinco versões avaliadas nesse processo foram rejeitadas apesar de
métricas de plano melhores — em ambos os casos porque produziam rotas geograficamente compactas
que ignoravam padrões de trânsito não modelados.

O aplicativo do motorista tem ciclo próprio, com compatibilidade retroativa de 6 meses — parte
da frota agregada usa aparelhos que raramente atualizam.

## Estratégia de Evolução

**Fase 1 (meses 1–5): planejador em lote.** Substituição do planejamento semiautomático por
roteirização completa, com validação em paralelo.

Resultado medido: ocupação média de 68% para 79%, distância total por entrega -11%.

**Fase 2 (meses 6–10): replanejamento automático local.** Redução da carga da central e resposta
consistente a desvios.

Resultado: taxa de entrega no prazo de 91,4% para 94,8%; central reduzida de 142 para 78 pessoas.

**Fase 3 (meses 9–14): aplicativo offline robusto.** Reescrita do aplicativo do motorista como
sistema local com sincronização, em vez de cliente remoto.

Esta fase resolveu uma classe inteira de problemas que não estava no diagnóstico inicial: 6% das
entregas tinham registro perdido ou duplicado por falha de conexão no momento do registro.

**Fase 4 (meses 15–19): predição de atraso.** Antecipação de risco, com acionamento da central
antes do atraso ocorrer.

**Fase 5 (meses 18–24): realocação entre rotas por exceção.** O mecanismo restrito para veículo
quebrado e prazo crítico.

**Condições que mudariam o plano:**

```text
se a malha adotar hubs urbanos de transferência
  → realocar entre rotas fica barato, e a Opção C é reavaliada

se o volume por centro passar de ~90 mil encomendas/dia
  → a janela de 90 min fica apertada e o centro precisa
    ser subdividido em unidades de planejamento

se a proporção de frota agregada sem telemetria passar de 60%
  → a predição de atraso perde sinal e precisa de outra
    fonte de informação

se os prazos contratados migrarem majoritariamente para
  entrega no mesmo dia
  → o planejamento noturno deixa de fazer sentido, e o
    modelo se aproxima do de delivery
```

A última condição é a mais provável e a mais transformadora: entrega no mesmo dia elimina a
premissa de informação completa na véspera, que é a base de toda a arquitetura.

## Resultados

Números ao fim da Fase 4, 19 meses após o início:

```text
taxa de entrega no prazo               de 91,4% para 96,3%
multas contratuais                     de R$ 31 mi/ano para R$ 6,8 mi/ano
ocupação média dos veículos            de 68% para 81%
distância total por entrega            -16%
custo por entrega                      -24% (meta era -20%)
pessoas na central de operação         de 142 para 44
registros de entrega perdidos          de 6% para 0,1%
tempo do planejamento noturno          62 min, p95 (janela de 90)
```

## O que este case ensina

**Dois horizontes, dois motores.** Planejamento com informação completa e tempo de sobra é um
problema; replanejamento com informação parcial em segundos é outro. Usar o mesmo motor para os
dois falha nos dois lados, e essa foi a primeira tentativa.

**A restrição física limita a otimização.** A Opção C é melhor no papel e inviável na prática,
porque a carga está dentro do veículo. Modelar o mundo físico corretamente eliminou uma opção
que uma análise puramente algorítmica teria escolhido.

**O cliente offline é um sistema, não uma tela.** Tratar o aplicativo do motorista como sistema
local com sincronização — e não como cliente de um servidor — resolveu 6% de registros perdidos
que nenhuma melhoria de conectividade resolveria.

**Os desvios são dados sobre o plano.** Medir quanto da realidade o plano não previu, e analisar
as causas, produziu a melhoria mais barata do projeto: 31% dos desvios vinham de dados de
circulação urbana errados, corrigíveis sem tocar no algoritmo.

## Conceitos Relacionados

- [Case: Transporte por Aplicativo](/21-case-studies/ride-sharing.md).
- [Case: Delivery de Comida](/21-case-studies/food-delivery.md).
- [Case: E-commerce Omnicanal](/21-case-studies/ecommerce.md) — o outro lado da mesma cadeia.
- [Degradação Graciosa](/12-reliability/graceful-degradation.md).

## Exercício Prático

Liste as restrições de um problema de roteirização do seu contexto — capacidade, janela, prazo,
jornada — e classifique cada uma como restrição rígida ou penalidade.

A diferença decide o algoritmo: restrições rígidas podem tornar o problema infactível, e
penalidades não. Confundi-las é a causa mais comum de planejadores que não produzem solução.

## Perguntas de Entrevista

- Por que o mesmo motor não serve para planejar e replanejar?
- Por que a carga estar fisicamente no veículo elimina uma opção de arquitetura?
- Por que o aplicativo do motorista precisa ser um sistema local, e não um cliente remoto?

## Para Aprofundar

- Toth, Paolo; Vigo, Daniele. *Vehicle Routing: Problems, Methods, and Applications*. SIAM, 2014.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Nygard, Michael. *Release It!*. 2ª ed. Pragmatic Bookshelf, 2018.
