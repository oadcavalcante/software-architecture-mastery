---
id: ride-sharing
title: "Case: Transporte por Aplicativo"
sidebar_position: 8
description: Casamento de oferta e demanda em tempo real, onde a decisão de arquitetura é o tamanho da janela de decisão.
doc_type: case-study
level: 0
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor projeta um sistema de casamento em tempo real e entende por que
  decidir em lote é melhor que decidir imediatamente.
prerequisites: [trade-offs]
related: [food-delivery, logistics, messaging-platform]
canonical_for: []
content_version: 3
last_reviewed: 2026-08-29
---

# Case: Transporte por Aplicativo

:::note Como usar este case

Leia contexto, requisitos e restrições. **Pare antes das opções de arquitetura** e esboce a sua
em vinte minutos.

Os números deste case são **ilustrativos** (SPEC.md §8.2): plausíveis e internamente
coerentes, não medidos num sistema nomeado. O que se aprende é o raciocínio que eles
sustentam, não as grandezas.

:::

## Contexto de Negócio

A **Levo** é uma plataforma de transporte por aplicativo que opera em 34 cidades brasileiras,
com 2,1 milhões de passageiros ativos mensais e 380 mil motoristas cadastrados, dos quais cerca
de 96 mil ficam online em um dia típico.

O produto tem uma diferença essencial em relação ao [delivery](/21-case-studies/food-delivery.md): aqui os dois
lados do casamento se movem, e o passageiro está esperando fisicamente na rua. Um erro de
atribuição não gera comida fria — gera alguém parado num ponto por vinte minutos.

Duas pressões motivam a revisão da arquitetura:

**Qualidade do casamento.** A atribuição atual é gulosa: cada solicitação é atribuída ao
motorista mais próximo disponível, no instante em que chega. A área de dados demonstrou, com
simulação sobre histórico real, que decidir em lotes de poucos segundos reduziria o tempo médio
de espera em 18% e a quilometragem ociosa dos motoristas em 12% — sem nenhum motorista a mais.

**Custo e latência do estado de posição.** O sistema mantém posição de 96 mil motoristas com
atualização a cada 3 segundos, num banco geoespacial que se tornou o gargalo de latência e o
maior item de custo de infraestrutura.

## Requisitos Funcionais

Para o **passageiro**: estimar preço e tempo antes de solicitar; solicitar corrida com origem e
destino; acompanhar o motorista se aproximando; alterar destino durante a corrida; pagar
automaticamente; e avaliar ao fim.

Para o **motorista**: ficar online e disponível; receber ofertas de corrida com informação
suficiente para decidir; aceitar ou recusar; navegar; e acompanhar ganhos.

Para a **plataforma**: casar solicitações e motoristas otimizando espera do passageiro e
ociosidade do motorista; precificar dinamicamente conforme oferta e demanda por região; detectar
e tratar cancelamentos e corridas problemáticas; e garantir segurança de ambos os lados, com
rastreamento e acionamento de emergência.

O casamento é o produto. A precificação dinâmica é o mecanismo que mantém oferta e demanda
equilibradas quando o casamento sozinho não dá conta.

## Requisitos Não-Funcionais

```text
p95 do tempo até atribuição              < 8 s
p99                                      < 20 s
p95 da estimativa de preço e tempo       < 700 ms
latência da posição do motorista
  exibida ao passageiro                  < 5 s
disponibilidade da solicitação           99,95%
disponibilidade da atribuição            99,9%
erro da estimativa de tempo de chegada   < 2 min em 85% dos casos
precisão do rastreamento para
  segurança                              posição a cada 10 s, retida 6 meses
custo por corrida                        redução de 30%
```

O requisito de 8 segundos para atribuição é confortável em comparação com a percepção comum de
que o casamento precisa ser instantâneo — e é essa folga que torna a decisão em lote possível.

## Restrições

```text
geografia          34 cidades com densidades muito diferentes; numa
                   capital há 9 mil motoristas online no pico, numa
                   cidade média há 90
dispositivos       aparelhos de baixo custo, com conectividade
                   instável; perda de sinal é rotina
regulatório        rastreamento obrigatório durante a corrida;
                   retenção de 6 meses; acionamento de emergência
                   com prazo de resposta
motoristas         sem vínculo empregatício; a plataforma oferece,
                   não designa; taxa de recusa média de 23%
segurança          identidade verificada dos dois lados; a plataforma
                   responde por incidentes ocorridos durante a corrida
equipe             140 engenheiros, 26 no domínio de casamento
custo              meta de -30% por corrida, de diretoria
```

A taxa de recusa de 23% é a restrição mais interessante: ela significa que a atribuição não é
uma decisão, é uma **proposta**. Um algoritmo que ignore a probabilidade de aceitação produz
casamentos ótimos no papel e ruins na prática.

O efeito é concreto e assimétrico. O motorista mais próximo de uma solicitação pode ser
justamente o que tem menor probabilidade de aceitá-la — porque a corrida vai para uma região de
onde é difícil sair, ou porque o valor é baixo para a distância de deslocamento. Atribuir a ele
e receber recusa custa um ciclo inteiro, e o passageiro espera mais do que esperaria se a
plataforma tivesse oferecido ao segundo mais próximo, que aceitaria.

Modelar isso exige aceitar que a plataforma não controla o outro lado. É uma restrição jurídica
— não há vínculo empregatício — que vira uma restrição de arquitetura, e nenhuma quantidade de
otimização de distância compensa ignorá-la.

## Estimativas de Capacidade

```text
corridas/dia                        1,4 milhão
corridas/s, média                   ~16
pico (sexta 18h-20h)                ~230 mil/h  →  ~64/s
pico instantâneo (chuva + horário)  ~180/s
margem de projeto                   ~500/s

motoristas online, pico             ~96 mil
posição a cada 3 s                  ~32 000 posições/s
posições/dia                        ~2,1 bilhões
```

Como nos casos anteriores, o volume transacional é modesto e o volume de posição é grande. Mas
há um número que este sistema tem e os outros não:

```text
solicitações simultâneas na mesma janela de 5 s,
  numa capital no pico                          ~90
motoristas disponíveis na mesma região          ~1 400
combinações possíveis a avaliar                 ~126 000
tempo disponível para avaliar                   < 5 s
```

Cento e vinte e seis mil combinações a cada cinco segundos, por cidade. Esse é o problema
computacional que a arquitetura precisa acomodar, e ele não existe no modelo guloso — porque o
modelo guloso avalia uma solicitação contra alguns candidatos e pronto.

Na prática a matriz é podada antes de ser resolvida: candidatos a mais de 12 minutos de
deslocamento são descartados, o que reduz as 126 mil combinações para cerca de 3 mil em regiões
densas. A poda é o que torna a resolução exata viável dentro do orçamento de tempo, e o limite
de 12 minutos é um parâmetro por região — em áreas esparsas ele sobe para 25 minutos, porque
descartar candidatos distantes ali significaria não atender ninguém.

Esse ajuste por densidade é um tema recorrente do sistema: quase todo parâmetro que funciona
numa capital está errado numa cidade de 90 motoristas online, e tratá-los com a mesma
configuração foi a causa de boa parte dos problemas do desenho anterior.

```text
armazenamento
  corridas, 5 anos                  ~2,5 bilhões  →  ~1,4 TB
  posições, 6 meses                 ~380 bilhões  →  ~28 TB comprimidas
  estado de motorista online        ~96 mil registros
```

## Opções de Arquitetura

O eixo é **quando e como a decisão de casamento é tomada**.

### Opção A — Guloso imediato

Cada solicitação é atribuída assim que chega, ao melhor candidato disponível naquele instante.

```text
latência          excelente — decisão imediata
qualidade         subótima; ignora solicitações que chegarão em 2 s
simplicidade      alta
custo             baixo
concorrência      dois casamentos simultâneos podem disputar o mesmo
                  motorista, exigindo bloqueio
```

É a arquitetura atual.

### Opção B — Lote com janela fixa

As solicitações são acumuladas numa janela de poucos segundos e resolvidas em conjunto, como um
problema de atribuição.

```text
latência          +2 a 5 s, dentro do orçamento de 8 s
qualidade         melhor — a simulação indica -18% de espera
custo             maior por decisão, menor por corrida (menos
                  quilometragem ociosa)
complexidade      média — resolver atribuição em lote, por região
concorrência      eliminada dentro do lote
```

### Opção C — Lote com janela adaptativa e previsão

Como a Opção B, com a janela ajustada pela densidade local e com previsão de solicitações que
chegarão no próximo intervalo.

```text
latência          variável — 1 s em região densa, 6 s em região esparsa
qualidade         melhor ainda, se a previsão for boa
complexidade      alta — previsão, janela dinâmica, mais parâmetros
risco             previsão ruim piora o resultado em vez de melhorar
```

## Análise de Trade-offs

| Critério | Peso | A — Guloso | B — Lote fixo | C — Lote adaptativo |
|---|:-:|:-:|:-:|:-:|
| Qualidade do casamento | 35% | 3 | 8 | 9 |
| Latência percebida | 20% | 9 | 7 | 8 |
| Complexidade e risco | 20% | 9 | 6 | 3 |
| Custo por corrida | 15% | 4 | 8 | 8 |
| Capacidade da equipe | 10% | 9 | 7 | 4 |
| **Total ponderado** | | **6,2** | **7,3** | **7,0** |

A disputa entre B e C é apertada, e a diferença está em risco: a Opção C depende de previsão, e
uma previsão ruim degrada o casamento em vez de melhorá-lo. A Opção B entrega a maior parte do
ganho sem essa dependência.

**Análise de sensibilidade**, redistribuindo o peso restante proporcionalmente entre os demais critérios. Com qualidade em 50% e complexidade em 10%, os
totais viram 5,3 / 7,5 / 7,6 — a Opção C passa à frente por 0,1, o que é empate numa escala
subjetiva. O cenário corresponde a uma organização com capacidade de ciência
de dados madura e apetite para operar um modelo em produção no caminho crítico.

## Decisão

**Lote com janela fixa (Opção B)**, com a janela configurável por cidade e a resolução do
problema de atribuição feita por região geográfica independente.

```text
janela padrão            4 s
janela em capitais       3 s
janela em cidades
  de baixa densidade     6 s
```

A resolução usa um algoritmo de atribuição clássico sobre a matriz de custo entre solicitações e
motoristas candidatos, com o custo incorporando distância, tempo estimado de chegada, direção
atual e **probabilidade de aceitação** estimada para aquele par.

A probabilidade de aceitação é o que transforma um casamento teórico em um casamento útil, dada
a taxa de recusa de 23%.

**Sob que condição cada opção descartada venceria:**

**Opção A venceria se** o requisito de latência fosse muito mais apertado — abaixo de 2 segundos
— ou em cidades com densidade tão baixa que raramente há mais de uma solicitação por janela. Na
prática, ela permanece em uso: cidades onde a média de solicitações por janela é menor que 1,3
operam no modo guloso, porque em lote de um elemento os dois algoritmos são idênticos e o
guloso é mais barato.

**Opção C venceria se** a previsão de demanda de curto prazo atingir precisão suficiente para
não degradar o resultado, o que é medido continuamente em ambiente de simulação. A condição está
registrada: quando o erro da previsão de solicitações no próximo intervalo cair abaixo de 15%, a
janela adaptativa é reavaliada.

## Componentes

**Serviço de Solicitação.** Recebe o pedido de corrida, estima preço e tempo, e entrega a
solicitação ao casamento.

**Grade de Disponibilidade.** Mantém, por região e célula geográfica, quais motoristas estão
online e disponíveis, com posição e direção.

**Motor de Casamento.** Acumula solicitações na janela, monta a matriz de custo, resolve a
atribuição e emite ofertas. Uma instância por região.

**Serviço de Oferta.** Envia a oferta ao motorista e coleta aceite ou recusa, com prazo.

**Serviço de Corrida.** Ciclo de vida da corrida: aceita, a caminho, em andamento, concluída.
Máquina de estados com consistência forte.

**Ingestão de Posição.** Recebe as 32 mil posições por segundo e atualiza a grade.

**Serviço de Precificação.** Preço base, estimativa e multiplicador dinâmico por região.

**Serviço de Segurança.** Rastreamento durante a corrida, detecção de anomalia de rota e
acionamento de emergência.

**Serviço de Pagamento.** Cobrança ao fim da corrida e repasse ao motorista.

A separação entre **Grade de Disponibilidade** e **Ingestão de Posição** é deliberada: a primeira
mantém apenas o estado necessário para o casamento, atualizado com a frequência necessária para
ele; a segunda registra a série completa para rastreamento e segurança. São dois requisitos
sobre o mesmo dado, com custos muito diferentes.

## Dados

**Grade de disponibilidade.** Armazenamento em memória, particionado por região.

```text
chave     regiao:celula:motorista
valor     lat, lon, direcao, velocidade, estado, ultima_oferta_em
TTL       30 s
```

O TTL trata perda de sinal como caso normal, como no case de delivery. Um motorista que some da
grade volta a aparecer na próxima posição recebida.

O campo `ultima_oferta_em` existe para evitar o problema mais frustrante do produto anterior:
um motorista que recusa uma oferta recebia outra imediatamente, às vezes a mesma, e relatava
assédio do aplicativo. A regra é de intervalo mínimo entre ofertas ao mesmo motorista.

**Posições para segurança.** Série temporal comprimida, particionada por dia e região,
armazenamento barato. Consultada raramente — cerca de 900 vezes por dia, quase todas por
investigação de incidente — sobre 2,1 bilhões de registros diários.

A retenção de 6 meses é regulatória, e o dado é sensível: ele permite reconstruir o deslocamento
de qualquer pessoa. O acesso exige justificativa registrada e é auditado.

O mapeamento de fluxo desse dado encontrou, na primeira revisão, quatro pontos de repouso não
previstos: um armazém analítico com posições completas e sem prazo de expurgo, exportações para
uma ferramenta de visualização, registros de aplicação com coordenadas, e um ambiente de
homologação carregado com cópia de produção. Os quatro foram tratados, e a lição foi registrada:
dado sensível vaza para onde ninguém procurou, e o mapeamento precisa ser exaustivo antes de
declarar retenção. Ver
[diagramas de fluxo de dados](/17-architecture-documentation/data-flow-diagrams.md).

**Corrida.** PostgreSQL, máquina de estados explícita, consistência forte. O volume é baixo — 16
por segundo em média — e a correção é crítica: uma corrida atribuída a dois motoristas é um
incidente com pessoas envolvidas.

**Matriz de custo.** Efêmera, construída em memória a cada janela e descartada. Não é persistida
— apenas o resultado da atribuição e as métricas agregadas são guardados, para avaliação do
algoritmo.

## Integração

**O ciclo de casamento**, que é o núcleo do sistema:

```text
t+0 s    solicitações chegam e são acumuladas por região
t+4 s    a janela fecha
         o motor lê a grade de disponibilidade da região
         monta a matriz solicitações × candidatos
         resolve a atribuição
t+4,3 s  ofertas são enviadas
t+4,3 a  motoristas aceitam ou recusam; prazo de 12 s
t+16 s
t+16 s   solicitações não atendidas voltam para a próxima janela,
         com prioridade elevada
```

A reentrada com prioridade elevada é o que impede que uma solicitação em região difícil fique
indefinidamente sem atribuição: a cada ciclo não atendido, seu peso na matriz de custo aumenta,
e o raio de busca por candidatos se amplia.

Após três ciclos sem atribuição — cerca de 50 segundos — o passageiro é avisado de que a espera
está acima do normal e recebe a opção de aguardar com preço dinâmico ou cancelar sem custo.

**Ofertas.** Enviadas por conexão persistente ao aplicativo do motorista, com notificação como
alternativa. Uma oferta é exclusiva por 12 segundos: dentro da janela, aquele motorista não
recebe outra.

**Precificação dinâmica.** Calculada por célula, com base na razão entre solicitações não
atendidas e motoristas disponíveis. É atualizada a cada ciclo de casamento, o que a mantém
sincronizada com o mecanismo que ela existe para influenciar.

**Segurança.** Durante a corrida, a posição é enviada a cada 10 segundos e comparada com a rota
esperada. Desvio significativo, parada prolongada em local incomum ou acionamento manual do
botão de emergência disparam o protocolo de segurança, com contato ativo e, se necessário,
acionamento de autoridades.

## Segurança

```text
identidade         verificada nos dois lados, com documento e biometria
rastreamento       obrigatório durante a corrida; visível ao passageiro
                   e a contatos compartilhados
posição histórica  dado sensível; retenção 6 meses; acesso com
                   justificativa registrada e auditoria
dados de contato   mascarados entre as partes; ligações e mensagens
                   passam por intermediação da plataforma
pagamento          tokenizado, fora do escopo da plataforma
emergência         canal com prioridade, independente do restante
                   do sistema, com alvo de disponibilidade próprio
avaliações         agregadas; nenhuma parte vê a avaliação individual
                   da outra em tempo real, para evitar retaliação
```

O canal de emergência com infraestrutura independente é a decisão de segurança mais importante:
ele não compartilha componentes com o fluxo de corrida, justamente porque precisa funcionar
quando o restante não estiver funcionando.

## Escalabilidade

O sistema escala por **região**, e essa é a decisão estrutural que torna tudo o mais tratável.
Cada região tem sua grade, seu motor de casamento e sua capacidade dimensionada pela densidade
local.

O problema de atribuição é resolvido por região, o que mantém a matriz num tamanho tratável: 90
solicitações × 1.400 candidatos numa capital, contra o absurdo que seria resolver nacionalmente.

Regiões são definidas por densidade, não por limite administrativo. Uma capital tem 12 regiões;
uma cidade média tem uma. A fronteira entre regiões é um problema real — uma solicitação na
borda pode ter o melhor candidato do outro lado — e é tratado incluindo candidatos das regiões
vizinhas na matriz, com penalidade de custo.

O pico de sexta à noite combinado com chuva é o cenário de dimensionamento. Ele é parcialmente
previsível: a plataforma consome previsão meteorológica e eleva capacidade preventivamente.

## Confiabilidade

Se o **Motor de Casamento** de uma região falha, aquela região cai para o modo guloso — que é o
código da Opção A, mantido em produção. A qualidade do casamento piora e o serviço continua.

Se a **Grade de Disponibilidade** fica indisponível, o casamento usa a última posição conhecida
do armazenamento de segurança, com raio ampliado. É pior e funciona.

Se o **Serviço de Corrida** falha, corridas em andamento continuam — o estado está no aplicativo
de ambos os lados — e novas atribuições param. É a degradação mais grave.

Se a **Precificação** falha, o preço volta ao base, sem multiplicador. Comercialmente ruim,
operacionalmente inofensivo.

Se o **Serviço de Segurança** falha, corridas em andamento não são interrompidas, e um alarme de
severidade máxima é disparado — este é o único componente cuja indisponibilidade é tratada como
incidente crítico mesmo sem efeito imediato no produto.

## Observabilidade

```text
tempo até atribuição, p50/p95/p99, por região e faixa de densidade
taxa de solicitações não atendidas em 3 ciclos
taxa de aceitação de oferta, por motorista, região e horário
quilometragem ociosa por corrida
razão entre solicitações e motoristas disponíveis, por célula
erro da estimativa de tempo de chegada
tempo de resolução da matriz, por região
posições recebidas/s e taxa de motoristas com TTL expirado
```

A **taxa de aceitação de oferta** é a métrica que valida a probabilidade de aceitação usada na
matriz de custo. Se a taxa observada divergir da estimada, o modelo de custo está errado e o
casamento é subótimo mesmo com o algoritmo correto.

Essa realimentação — comparar o previsto com o observado e ajustar — é o que permitiu à
qualidade do casamento continuar melhorando depois do lançamento, sem mudança de arquitetura.

## Implantação

Implantação por região, com o modo guloso sempre disponível como alternativa. Mudanças no
algoritmo de casamento são avaliadas por experimento controlado entre regiões comparáveis,
porque o efeito só aparece em métricas agregadas ao longo de dias.

Nenhuma mudança estrutural às sextas-feiras, nem em vésperas de feriado.

A implantação por região tem uma propriedade adicional que se mostrou valiosa: como o algoritmo
de casamento é o mesmo código operando com parâmetros diferentes por região, uma mudança pode ser
testada com parâmetros conservadores numa região e agressivos em outra, no mesmo período. Isso
separou, em várias ocasiões, o efeito da mudança de código do efeito do ajuste de parâmetro —
uma distinção que a equipe anterior não conseguia fazer e que produzia conclusões erradas sobre
o que tinha funcionado.

O motor de casamento tem um modo de **simulação sobre histórico** que permite avaliar uma
mudança de algoritmo contra semanas de dados reais antes de qualquer implantação. Foi esse modo
que produziu a estimativa de -18% que justificou o projeto, e ele continua sendo o primeiro
portão de qualquer alteração.

## Estratégia de Evolução

**Fase 1 (meses 1–4): grade em memória.** Migração do estado de disponibilidade do banco
geoespacial para armazenamento em memória por região. Entrega redução de custo e de latência,
sem mudar o algoritmo.

**Fase 2 (meses 5–9): casamento em lote.** Motor com janela fixa, ativado por região, começando
pelas cidades médias. O modo guloso permanece como alternativa.

Resultado medido nas primeiras cidades: tempo médio de espera -15%, quilometragem ociosa -9% —
abaixo dos -18% e -12% da simulação, e na direção certa.

**Fase 3 (meses 10–13): probabilidade de aceitação.** Incorporação da estimativa de aceitação na
matriz de custo. É o que fecha a lacuna com a simulação — o modelo simulado assumia aceitação
determinística.

**Fase 4 (meses 14–18): janela por densidade e regiões dinâmicas.** Ajuste da janela por cidade e
redefinição das fronteiras de região com base em fluxo observado, não em geografia
administrativa.

**Fase 5 (meses 19–24): previsão de curto prazo.** Reavaliação da Opção C, condicionada à
precisão da previsão.

**Condições que mudariam o plano:**

```text
se o erro da previsão de solicitações no próximo intervalo
  cair abaixo de 15%
  → a janela adaptativa (Opção C) é reavaliada

se a taxa de recusa cair abaixo de 5%
  → a probabilidade de aceitação deixa de ser relevante na
    matriz, e o modelo simplifica

se surgir regulação criando vínculo empregatício
  → o casamento vira escalonamento, e a oferta com recusa
    deixa de existir

se alguma região passar de ~400 solicitações por janela
  → a resolução exata da matriz fica cara, e é preciso
    aproximação ou subdivisão da região
```

## Resultados

Números ao fim da Fase 4, 18 meses após o início:

```text
tempo médio de espera do passageiro     -21%
p95 do tempo até atribuição             de 14 s para 6,2 s
quilometragem ociosa por corrida        -14%
taxa de aceitação de oferta             de 77% para 86%
custo de infraestrutura por corrida     -38% (meta era -30%)
solicitações não atendidas em 3 ciclos  de 2,8% para 0,7%
ganho médio por hora do motorista       +11%
cancelamento pelo passageiro            -19%
```

O aumento de 11% no ganho por hora do motorista é o resultado que a empresa considera mais
estratégico: ele vem da redução de quilometragem ociosa, e melhora a retenção de motoristas —
que é a restrição de oferta do negócio inteiro.

## O que este case ensina

**Decidir mais tarde pode decidir melhor.** O modelo guloso otimiza cada solicitação
isoladamente e produz um resultado agregado pior. Quatro segundos de espera compram uma visão
do conjunto, e o conjunto tem soluções que a decisão individual não enxerga.

**Uma atribuição sem aceitação é uma proposta.** Com 23% de recusa, o casamento ótimo no papel
não é o ótimo na prática. Incorporar a probabilidade de aceitação foi o que fechou a lacuna
entre a simulação e o resultado real.

**Dois requisitos sobre o mesmo dado, dois armazenamentos.** Posição para casamento precisa ser
rápida, atual e efêmera; posição para segurança precisa ser completa, retida e barata. Servir
os dois com a mesma estrutura custava caro e atendia mal aos dois.

**O modo simples continua em produção.** O modo guloso não foi removido: ele é a degradação do
motor de casamento e é o algoritmo usado em cidades de baixa densidade, onde os dois são
equivalentes. Manter a solução antiga como caminho vivo é mais barato que reconstruí-la sob
pressão.

## Conceitos Relacionados

- [Case: Delivery de Comida](/21-case-studies/food-delivery.md) — o mesmo problema, outras restrições.
- [Case: Logística](/21-case-studies/logistics.md).
- [Pontos Quentes](/11-scalability/hotspots.md).
- [Degradação Graciosa](/12-reliability/graceful-degradation.md).

## Exercício Prático

Simule, no papel, três solicitações e três motoristas com distâncias conhecidas. Resolva pelo
método guloso — atribuindo cada solicitação na ordem de chegada ao mais próximo disponível — e
depois pela atribuição ótima do conjunto.

Construa um exemplo em que o guloso produz uma soma de distâncias 40% pior. Não é difícil, e é o
argumento inteiro deste case.

## Perguntas de Entrevista

- Por que acumular solicitações por quatro segundos melhora o resultado agregado?
- Por que a probabilidade de aceitação precisa entrar na matriz de custo?
- Por que a grade de disponibilidade e o histórico de posição são armazenamentos diferentes?

## Para Aprofundar

- Kuhn, Harold. *The Hungarian Method for the Assignment Problem*. Naval Research, 1955.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Nygard, Michael. *Release It!*. 2ª ed. Pragmatic Bookshelf, 2018.
