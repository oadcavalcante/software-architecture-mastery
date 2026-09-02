---
id: payments
title: "Case: Plataforma de Pagamentos"
sidebar_position: 3
description: Orquestrador multiadquirente processando R$ 38 bilhões ao ano, onde toda decisão é sobre o que fazer quando algo falha no meio.
doc_type: case-study
level: 0
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor projeta um fluxo de pagamento com idempotência, compensação e
  conciliação, e entende por que o caminho de falha é o produto.
prerequisites: [trade-offs]
related: [banking, ecommerce, high-volume-events]
canonical_for: []
content_version: 4
last_reviewed: 2026-08-29
---

# Case: Plataforma de Pagamentos

:::note Como usar este case

Leia contexto, requisitos e restrições. **Pare antes das opções de arquitetura** e esboce a
sua em vinte minutos.

Os números deste case são **ilustrativos** (SPEC.md §8.2): plausíveis e internamente
coerentes, não medidos num sistema nomeado. O que se aprende é o raciocínio que eles
sustentam, não as grandezas.

:::

## Contexto de Negócio

A **Pagolo** é uma plataforma de pagamentos que processa transações para 41 mil lojistas —
comércio eletrônico, assinaturas e maquininhas. Volume anual de R$ 38 bilhões.

A empresa não é adquirente: ela orquestra. Cada transação é roteada para um de cinco
adquirentes parceiros, escolhido por custo, taxa de aprovação e disponibilidade no momento.
Esse roteamento é o produto — lojistas contratam a Pagolo porque uma transação recusada por
um adquirente pode ser aprovada por outro.

Três pressões motivam a revisão da arquitetura:

**Perda por indisponibilidade parcial.** Quando um adquirente degrada, a plataforma leva em
média 9 minutos para desviar o tráfego, porque a detecção é manual. A área comercial estima
R$ 14 milhões por ano em transações perdidas nesses intervalos.

**Conciliação manual.** A equipe de operações financeiras tem 22 pessoas, das quais 14 fazem
conciliação entre o que a Pagolo registrou, o que os adquirentes reportam e o que foi
efetivamente liquidado. O volume de divergências cresce com o negócio.

**Duplicidade.** Cerca de 900 cobranças duplicadas por mês chegam como reclamação. A causa é
conhecida: quando a plataforma não recebe resposta do adquirente e o lojista repete a
tentativa, não há garantia consistente de que a segunda tentativa não vira uma segunda
cobrança.

O terceiro item é o mais grave. Duplicidade em pagamento não é defeito técnico — é dinheiro
tirado de alguém que não autorizou, e é tratado pelo regulador e pelas bandeiras como falha
de controle.

Vale entender por que ele acontece, porque a causa não é descuido. Quando a Pagolo envia uma
autorização a um adquirente e o tempo se esgota sem resposta, existem dois cenários
indistinguíveis do lado de fora: a requisição não chegou, ou chegou, foi processada, e a
resposta se perdeu. O comportamento do sistema antigo era tratar os dois como o primeiro —
marcar a transação como falha e liberar nova tentativa. Nos casos em que o segundo cenário era
o verdadeiro, a nova tentativa cobrava de novo.

A escolha de assumir falha não foi arbitrária: ela otimiza a taxa de conversão, porque marcar
como pendente teria feito o lojista perder a venda enquanto esperava. A arquitetura antiga
trocou correção por conversão sem que ninguém tenha tomado essa decisão explicitamente — e é
esse tipo de troca implícita que um case existe para tornar visível.

## Requisitos Funcionais

```text
RF-1   Autorizar transação com cartão, roteando para o melhor adquirente
RF-2   Capturar autorização, total ou parcialmente
RF-3   Cancelar autorização não capturada
RF-4   Estornar transação capturada, total ou parcialmente
RF-5   Repetir a tentativa em outro adquirente quando o primeiro recusar
       por motivo transitório
RF-6   Processar Pix, com confirmação em tempo real
RF-7   Gerenciar assinaturas com cobrança recorrente e retentativa inteligente
RF-8   Conciliar automaticamente contra arquivos de todos os adquirentes
RF-9   Processar contestação de compra (chargeback) e sua defesa
RF-10  Repassar ao lojista conforme o cronograma contratado
RF-11  Expor a situação de qualquer transação, em qualquer momento do ciclo
```

RF-5 é o produto. RF-11 parece trivial e não é: uma transação em um orquestrador tem estado
distribuído entre a Pagolo, o adquirente, a bandeira e o emissor — e responder "o que
aconteceu com essa cobrança" exige que a plataforma saiba, sempre.

## Requisitos Não-Funcionais

```text
disponibilidade da autorização           99,99%
p99 de autorização (fim a fim)           < 3 s
p99 do tempo interno (sem adquirente)    < 120 ms
taxa de duplicidade                      < 0,001% das transações
tempo de detecção de degradação
  de adquirente                          < 30 s (contra 9 min hoje)
tempo de desvio automático               < 60 s
conciliação automática                   > 99,5% dos registros
retenção de transações                   10 anos
RPO                                      0 para transação autorizada
RTO                                      < 10 min
```

O p99 de 3 segundos fim a fim inclui o adquirente, que responde entre 400 ms e 2,5 s. O
orçamento interno de 120 ms é o que a Pagolo controla, e é o que é verificado na esteira.

## Restrições

```text
certificação PCI DSS    dados de cartão não podem repousar fora do
                        ambiente certificado; o escopo deve ser o menor possível
bandeiras               regras de retentativa, prazos de contestação e
                        formatos de arquivo são impostos e mudam por decisão
                        externa, com prazo curto
adquirentes             cinco parceiros, cinco APIs diferentes, cinco
                        semânticas de erro diferentes, três formatos de arquivo
                        de conciliação
regulatório             instituição de pagamento autorizada; requisitos
                        de continuidade, segregação e reporte
equipe                  46 engenheiros, 11 na plataforma de pagamento
migração                não há: o sistema atual continua operando durante
                        toda a evolução; não existe janela para parar
```

A restrição de PCI é a que mais molda a topologia: quanto menor o número de componentes que
tocam dados de cartão, menor o custo e o risco da certificação anual.

## Estimativas de Capacidade

```text
transações/ano                          412 milhões
transações/dia, média                   1,13 milhão
transações/s, média                     ~13
pico horário (Black Friday, 20h-21h)    ~310 mil/h  →  ~86/s
pico instantâneo observado              ~240/s
margem de projeto (3×)                  ~700/s
```

Novamente, um volume que não exige arquitetura exótica. 700 autorizações por segundo é
modesto. **O desafio deste sistema não é volume — é correção sob falha parcial.**

Cada transação envolve de 4 a 9 chamadas a sistemas externos, e qualquer uma pode falhar,
demorar ou responder de forma ambígua. Com 412 milhões de transações por ano, mesmo uma taxa
de ambiguidade de 0,1% produz 412 mil casos anuais que precisam ser resolvidos corretamente.

```text
chamadas externas/transação, média      5,2
taxa de resposta ambígua (tempo
  esgotado com resultado desconhecido)  ~0,08%
casos ambíguos/ano                      ~330 mil
casos ambíguos/dia                      ~900
```

Novecentos casos por dia em que a plataforma não sabe se a cobrança ocorreu. Esse é o
problema central do sistema, e é dele que decorre quase toda a arquitetura.

É útil comparar com o caso de [e-commerce](/21-case-studies/ecommerce.md), onde o volume de escrita também era
baixo e a conclusão foi que a arquitetura devia otimizar velocidade de mudança. Aqui o volume
é igualmente baixo e a conclusão é oposta: a arquitetura deve otimizar correção, e velocidade
de mudança é secundária. A diferença não está nos números de capacidade — está no custo do
erro. Um produto exibido com estoque errado gera um cancelamento; uma cobrança duplicada gera
uma reclamação regulatória.

Ler restrições é justamente isso: os mesmos números de volume sustentam decisões opostas
conforme o que está em jogo quando o sistema erra.

```text
armazenamento
  transações, 10 anos                   ~4,1 bilhões de linhas  →  ~3,2 TB
  eventos de transação (cada mudança
  de estado), 10 anos                   ~24 bilhões  →  ~9 TB
  arquivos de conciliação, 10 anos      ~46 TB
```

## Opções de Arquitetura

### Opção A — Orquestração síncrona com compensação

Cada transação é um fluxo síncrono do início ao fim: recebe, roteia, autoriza, registra,
responde. Falhas no meio disparam compensação imediata.

```text
latência             melhor — sem passos intermediários
correção sob falha   depende de a compensação executar; se o processo
                     morre no meio, o estado fica indefinido
complexidade         menor
casos ambíguos       resolvidos por consulta ao adquirente, sob demanda
```

### Opção B — Máquina de estados persistida

Cada transação é uma máquina de estados gravada antes de cada passo externo. Um processo de
recuperação retoma transações paradas.

```text
latência             +15 a 30 ms por gravação de estado
correção sob falha   alta — o estado sobrevive à morte do processo
complexidade         média — a máquina de estados precisa ser explícita
casos ambíguos       resolvidos por processo de reconciliação automático
                     que consulta o adquirente e conclui
```

### Opção C — Orquestração por eventos, sem estado central

Cada passo publica um evento; consumidores reagem. O estado da transação é derivado dos
eventos.

```text
latência             +40 a 80 ms por salto de mensageria
correção sob falha   alta, se a entrega for garantida
complexidade         alta — ordem, duplicação e correlação viram problema
                     em todo passo
consulta de estado   exige projeção; RF-11 fica mais caro
depuração            difícil
```

## Análise de Trade-offs

| Critério | Peso | A — Síncrono | B — Máquina de estados | C — Eventos |
|---|:-:|:-:|:-:|:-:|
| Correção sob falha parcial | 35% | 3 | 9 | 8 |
| Latência interna | 20% | 9 | 8 | 5 |
| Capacidade de responder RF-11 | 15% | 5 | 9 | 5 |
| Complexidade operacional | 15% | 8 | 7 | 3 |
| Capacidade da equipe | 10% | 8 | 7 | 4 |
| Custo de infraestrutura | 5% | 9 | 8 | 6 |
| **Total ponderado** | | **6,1** | **8,3** | **5,7** |

Correção sob falha pesa 35% porque é o problema declarado: 900 cobranças duplicadas por mês e
900 casos ambíguos por dia. Qualquer peso menor tornaria a análise incoerente com o
diagnóstico.

**Análise de sensibilidade**, redistribuindo o peso restante proporcionalmente entre os demais critérios. Com latência em 40% e correção em 20%, os totais
viram 7,0 / 8,1 / 5,3 — a Opção B ainda vence, o que indica que ela não depende do peso
escolhido. Com complexidade operacional em 35%, viram 6,5 / 8,0 / 5,1.

## Decisão

**Máquina de estados persistida (Opção B)**, com o estado de cada transação gravado antes de
toda interação externa e um reconciliador que resolve transações paradas.

**Sob que condição cada opção descartada venceria:**

**Opção A venceria se** o orçamento de latência interna fosse muito mais apertado — abaixo de
40 ms —, ou se a taxa de ambiguidade dos adquirentes fosse desprezível. Nenhuma das duas é o
caso; a primeira é uma restrição que este produto não tem, e a segunda depende de terceiros.

**Opção C venceria se** houvesse muitos consumidores independentes dos mesmos eventos de
transação, com necessidade de reprocessamento histórico. Hoje há três consumidores, todos
internos, e nenhum precisa reprocessar. A condição está registrada: se o número de
consumidores passar de seis, a arquitetura é reavaliada.

Vale notar que a Opção C **não foi descartada por completo**: eventos são usados para
notificação de lojistas e alimentação analítica, fora do caminho crítico da autorização. A
decisão diz respeito a onde vive o estado da transação, não à ausência de mensageria.

## Componentes

```text
Gateway de Pagamento (escopo PCI)
  recebe dados de cartão, tokeniza, e nunca os persiste
  o único componente no escopo de certificação

Orquestrador de Transação
  a máquina de estados; grava antes de cada passo externo

Roteador de Adquirente
  decide o destino por custo, aprovação histórica e saúde atual

Monitor de Saúde de Adquirente
  mede latência e taxa de aprovação em janela curta;
  abre e fecha o disjuntor por adquirente

Conectores de Adquirente (×5)
  traduzem a semântica de cada parceiro para o modelo interno

Reconciliador de Transação
  resolve transações paradas consultando o adquirente

Conciliador Financeiro
  compara arquivos de adquirente com o registro interno

Serviço de Assinaturas
  agenda cobranças recorrentes e retentativas

Serviço de Contestação
  ciclo de chargeback, prazos e defesa

Serviço de Repasse
  calcula e agenda o pagamento ao lojista

Consulta de Transação
  projeção de leitura para RF-11
```

O **Gateway** é o único componente dentro do escopo PCI. Ele recebe o cartão, obtém um token
do cofre e devolve apenas o token ao resto da plataforma. Nenhum outro componente vê o número
do cartão, o que reduz o escopo de certificação de onze componentes para um.

Os **Conectores de Adquirente** existem porque cinco parceiros produzem cinco semânticas de
erro incompatíveis. O mesmo cenário — "a transação pode ter sido autorizada, não sabemos" —
aparece como código HTTP 502 em um parceiro, como código de negócio `PENDING` em outro, e
como resposta 200 com campo vazio em um terceiro. Traduzir isso para um modelo único é o que
torna o Orquestrador tratável. Ver
[anti-corruption layer](/08-integration-architecture/integration-anti-corruption.md).

## Dados

**A máquina de estados.**

```text
transacao        (id, chave_idempotencia_lojista, valor, moeda, lojista,
                  estado, adquirente, criada_em, atualizada_em, versao)
transacao_evento (id, id_transacao, de_estado, para_estado, motivo,
                  payload_externo, criado_em)
tentativa        (id, id_transacao, adquirente, requisicao_id, estado,
                  resposta_bruta, iniciada_em, concluida_em)
```

Estados possíveis, e as transições permitidas entre eles, são declarados explicitamente. Uma
transição não declarada é rejeitada pelo próprio código, e a tentativa é registrada como
anomalia.

```text
recebida → roteada → em_autorizacao → autorizada → capturada → liquidada
                            ↓              ↓            ↓
                       ambigua        cancelada    estornada
                            ↓
                     (reconciliador)
                            ↓
                 autorizada | recusada
```

O estado **`ambigua`** é o coração do desenho. Ele é atingido quando a plataforma envia uma
requisição ao adquirente e não obtém resposta conclusiva. Nenhum outro sistema decide o que
aconteceu — a transação fica explicitamente marcada como desconhecida, e o Reconciliador é o
único componente autorizado a tirá-la desse estado.

Antes desse desenho, o comportamento era assumir recusa e permitir nova tentativa — que é a
origem exata das 900 duplicidades mensais.

A introdução de um estado explícito para "não sabemos" tem um efeito que vai além da correção:
ela torna o problema **mensurável**. Antes, casos ambíguos não existiam como categoria — eles
viravam falhas, e a taxa de falha misturava recusas legítimas com desconhecimento. Depois, a
plataforma passou a ter um número: quantas transações estão em estado desconhecido, e há
quanto tempo.

Esse número virou o principal indicador de saúde da integração com cada adquirente, e foi o
que permitiu renegociar contrato com dois parceiros cuja taxa de ambiguidade era três vezes a
dos demais. A informação existia o tempo todo e não tinha onde ser registrada.

**Idempotência em duas camadas.**

```text
externa   chave fornecida pelo lojista; uma segunda chamada com a mesma
          chave retorna o resultado da primeira, seja qual for
interna   identificador de requisição enviado ao adquirente; o mesmo
          identificador nunca é reusado para uma cobrança diferente,
          e é reusado para repetir a mesma
```

A segunda camada é a que resolve a ambiguidade: ao repetir uma requisição ambígua com o mesmo
identificador, adquirentes que suportam idempotência devolvem o resultado original em vez de
cobrar de novo. Três dos cinco parceiros suportam; para os outros dois, o Reconciliador
consulta a transação por identificador antes de qualquer nova tentativa.

Ver [idempotência](/06-distributed-systems/idempotency.md).

Há uma sutileza que só aparece na implementação: a chave de idempotência do lojista e o
identificador de requisição enviado ao adquirente **não podem ser o mesmo valor**. Uma
transação pode legitimamente gerar mais de uma requisição — quando a primeira é recusada por
motivo transitório e a plataforma tenta outro adquirente (RF-5). Se os dois identificadores
fossem um só, a segunda tentativa seria rejeitada como duplicata pela própria plataforma, e o
produto deixaria de funcionar.

A regra que emergiu: uma chave de lojista corresponde a **uma cobrança pretendida**; um
identificador de requisição corresponde a **uma tentativa junto a um adquirente específico**.
Repetir a mesma tentativa reusa o identificador; tentar outro parceiro cria um novo. Essa
distinção parece pedante e é exatamente o que separa um orquestrador correto de um que cobra
duas vezes.

**PostgreSQL** para o estado transacional, particionado por mês. Eventos e tentativas vão
para armazenamento frio após 90 dias, com consulta mais lenta.

## Integração

**Com adquirentes.** Cada conector implementa o mesmo contrato interno e traduz. O contrato
interno tem uma propriedade que o dos parceiros não tem: **todo resultado é conclusivo ou
explicitamente ambíguo**. Não existe resposta que o Orquestrador precise interpretar.

**Roteamento.** A decisão combina três sinais:

```text
custo por transação          tabela contratual, por bandeira e por faixa
aprovação histórica          taxa dos últimos 30 dias, por emissor e bandeira
saúde atual                  latência e taxa de erro dos últimos 60 s
```

O terceiro sinal é o que resolve a perda de R$ 14 milhões por ano. O Monitor de Saúde avalia
cada adquirente em janela deslizante de 60 segundos e abre o disjuntor quando a taxa de erro
passa de 5% ou a latência p95 dobra em relação à linha de base. O desvio é automático e leva
menos de 60 segundos. Ver
[disjuntores](/12-reliability/circuit-breakers.md).

**Retentativa em outro adquirente (RF-5).** Só ocorre para recusas classificadas como
transitórias — indisponibilidade, tempo esgotado, erro de comunicação. Recusa por saldo
insuficiente, cartão bloqueado ou suspeita de fraude **não** é reprocessada em outro
parceiro: repetir aumentaria a taxa de aprovação artificialmente e violaria regras de bandeira.

Classificar recusas em transitórias e definitivas foi mais difícil do que parecia. Os cinco
adquirentes usam códigos diferentes, e vários deles agrupam motivos distintos sob o mesmo
código — "recusado pelo emissor" pode significar saldo insuficiente, suspeita de fraude ou
indisponibilidade do emissor, todos como o mesmo valor. A tradução foi construída
empiricamente: cada código foi classificado, e a classificação é revisada trimestralmente com
base na taxa de sucesso das retentativas.

Códigos cuja retentativa em outro parceiro tem sucesso abaixo de 8% são reclassificados como
definitivos. Essa revisão trimestral moveu 14 códigos em dois anos, e é o que mantém a
plataforma dentro das regras de bandeira sem depender de interpretação estática de
documentação de terceiros.

**Conciliação (RF-8).** Arquivos diários de cinco adquirentes, em três formatos, processados
de forma idempotente. O conciliador casa registros por identificador de requisição e valor, e
classifica divergências em categorias tratáveis automaticamente e categorias que exigem
pessoa.

## Segurança

```text
escopo PCI            um componente, com rede segregada, acesso restrito
                      e auditoria própria
tokenização           dados de cartão substituídos por token na borda;
                      o cofre é serviço certificado de terceiro
credenciais de
  adquirente          em cofre gerenciado, com rotação e acesso por serviço
segregação            o Orquestrador não tem credencial de leitura do cofre
                      de cartões; o Gateway não escreve no banco de transações
detecção de fraude    serviço externo consultado antes da autorização, com
                      prazo curto e alternativa de aprovação em caso de
                      indisponibilidade
trilha de auditoria   toda mudança de estado, com autor, motivo e payload
                      externo bruto, imutável por 10 anos
acesso de operação    somente leitura; ações de correção exigem
                      dois aprovadores e ficam registradas
```

A decisão de aprovar quando o serviço de fraude está indisponível é um trade-off comercial
registrado: recusar todas as transações durante indisponibilidade custa mais que o risco de
fraude no intervalo, e o volume aprovado nesse modo é limitado por valor e por lojista.

O cálculo que sustenta essa decisão foi feito com números e revisado anualmente. Recusar todas
as transações durante uma hora de indisponibilidade do serviço de fraude custa cerca de
R$ 4,3 milhões em volume não processado — R$ 38 bilhões ao ano divididos por 8.760 horas —, com
efeito direto sobre lojistas. A perda esperada por fraude aprovada no mesmo intervalo, com os
limites de valor aplicados, é estimada em R$ 40 mil. A relação de mais de cem para um justifica
a escolha, e os limites de valor e de lojista existem
justamente para manter essa relação — sem eles, o modo degradado seria um convite conhecido.

Esse é um exemplo de decisão que parece de segurança e é comercial: quem responde por ela é a
diretoria de risco, não a engenharia, e o papel da arquitetura foi tornar o trade-off
mensurável e o modo degradado controlável.

## Escalabilidade

O volume de projeto — 700 autorizações por segundo — é modesto e atendido por escala
horizontal simples. O único ponto que exigiu atenção foi o banco de transações:

```text
escrita por transação          3 a 6 gravações (estado + eventos + tentativas)
gravações/s no pico            ~4 200
gargalo medido                 escrita sequencial de eventos
solução                        partição por mês, com a partição corrente
                               em armazenamento rápido dedicado
```

Assinaturas apresentam um perfil diferente e mais delicado: cobranças recorrentes concentram-se
nos dias 1, 5, 10, 15 e 20, com picos de até 40× a média. A solução foi **espalhar a cobrança
dentro de uma janela de 6 horas**, com ordem determinada por hash do identificador da
assinatura — o que elimina o pico sem alterar o dia contratado.

## Confiabilidade

```text
componente                alvo      degradação quando indisponível
Gateway                   99,99%    nenhuma — é a porta de entrada
Orquestrador              99,99%    nenhuma
Roteador                  99,95%    cai para roteamento estático por custo
Monitor de Saúde          99,9%     roteamento perde o sinal de saúde
Serviço de Fraude (ext.)  —         aprova com limite de valor
Reconciliador             99,5%     transações ambíguas acumulam e são
                                    resolvidas quando ele volta
Conciliação               99%       atrasa; prazo é diário
Repasse                   99,9%     atrasa dentro do prazo contratual
```

A linha do Reconciliador é a que merece nota: ele pode ficar fora por horas sem dano, desde
que o estado `ambigua` esteja gravado. Isso é consequência direta da decisão de arquitetura —
persistir o estado antes do passo externo transforma uma falha crítica em atraso.

**RPO zero para transação autorizada.** Réplica síncrona em zona distinta; a confirmação ao
lojista só ocorre após commit em duas zonas.

## Observabilidade

```text
métricas de negócio    taxa de aprovação por adquirente, bandeira e emissor
                       custo médio por transação
                       transações em estado ambíguo, por idade
                       duplicidades detectadas
métricas técnicas      latência interna p99 (orçamento de 120 ms)
                       latência por adquirente, p50/p95/p99
                       taxa de erro por conector
                       profundidade da fila de reconciliação
alarmes                transação ambígua com mais de 15 min → incidente
                       taxa de aprovação de um adquirente caindo > 10 p.p.
                       em 5 min → alerta e possível desvio
                       divergência de conciliação > 0,5% → incidente
                       duplicidade detectada → incidente, sempre
rastreamento           correlação fim a fim, do lojista ao adquirente,
                       com o identificador de requisição visível
```

O alarme de transação ambígua com mais de 15 minutos é o mais importante do conjunto: ele mede
diretamente se o Reconciliador está cumprindo sua função, e uma transação ambígua envelhecida
é dinheiro em estado desconhecido.

## Implantação

```text
Gateway (escopo PCI)      implantação com aprovação adicional e registro
                          para auditoria; mudanças acompanhadas por segurança
Orquestrador              canary 5% → 25% → 100%, com reversão automática
                          por taxa de erro ou de ambiguidade
Conectores                implantados independentemente, por parceiro;
                          um conector com defeito não afeta os outros
migração de esquema       compatível em três etapas; a máquina de estados
                          precisa aceitar estados antigos e novos durante a
                          transição
teste de contrato         contra ambientes de homologação dos cinco
                          adquirentes, a cada mudança de conector
```

A independência dos conectores é o que permite lidar com a restrição das bandeiras: quando uma
regra muda com prazo curto, apenas o conector afetado é alterado e implantado.

Essa foi a única parte da arquitetura em que a separação em serviços independentes se
justificou por prazo, e não por escala ou por time. As bandeiras publicam mudanças
obrigatórias com janelas de 30 a 60 dias, e a implantação de um conector isolado leva horas —
enquanto uma implantação do Orquestrador exige teste de regressão sobre toda a máquina de
estados.

O restante da plataforma poderia ser um monólito modular sem prejuízo, e a decisão de manter
Orquestrador, Roteador e Reconciliador separados foi revisitada duas vezes. Ela se sustentou
por um motivo operacional: o Reconciliador tem perfil de carga em lote e pode ficar fora por
horas, enquanto o Orquestrador não pode ficar fora por segundos. Perfis de disponibilidade
opostos justificam unidades implantáveis distintas. Ver
[monólito vs. microsserviços](/20-trade-offs/monolith-vs-microservices.md).

## Estratégia de Evolução

**Fase 1 (meses 1–5): máquina de estados e idempotência.** O Orquestrador passa a persistir
estado antes de cada passo externo, e a idempotência em duas camadas é implementada. O estado
`ambigua` é introduzido e o comportamento de "assumir recusa" é removido.

Resultado imediato e não previsto no plano: as duplicidades caíram de ~900/mês para ~60/mês
**antes** de o Reconciliador existir, apenas por deixar de assumir recusa. As 60 restantes
eram transações ambíguas resolvidas manualmente.

**Fase 2 (meses 6–8): reconciliador.** Resolução automática de transações ambíguas, por
consulta ao adquirente com o identificador de requisição original. Duplicidades caem para
~4/mês.

**Fase 3 (meses 9–12): monitor de saúde e desvio automático.** Detecção em 30 s e desvio em
60 s, contra os 9 minutos manuais.

**Fase 4 (meses 13–18): conciliação automática.** Casamento automático e classificação de
divergências. A equipe de conciliação é redirecionada, não reduzida — 9 das 14 pessoas passam
a tratar contestações, que era um gargalo.

**Fase 5 (meses 19–24): assinaturas e contestações.** Retentativa inteligente com base em
motivo de recusa e histórico do emissor; ciclo de contestação com prazos automatizados.

**Condições que mudariam o plano:**

```text
se o número de adquirentes passar de 10
  → o Roteador precisa de modelo de decisão, não de regras

se um adquirente representar mais de 60% do volume
  → a premissa de redundância do roteamento deixa de valer,
    e a negociação comercial vira assunto de arquitetura

se o número de consumidores de eventos de transação passar de 6
  → a Opção C é reavaliada

se a taxa de ambiguidade de algum parceiro passar de 0,5%
  → o conector daquele parceiro ganha reconciliação dedicada,
    e o contrato é renegociado com o número em mãos
```

## Resultados

Números ao fim da Fase 4, 18 meses após o início:

```text
duplicidades/mês                        de ~900 para 3
transações ambíguas não resolvidas
  em 15 min                             de "não medido" para 0,004%
tempo de detecção de degradação         de 9 min para 22 s
tempo de desvio                         de 9 min para 41 s
perda estimada por indisponibilidade
  parcial                               de R$ 14 mi/ano para ~R$ 1,1 mi/ano
conciliação automática                  99,7% dos registros
pessoas em conciliação manual           de 14 para 5
taxa de aprovação geral                 +2,3 p.p. (efeito do roteamento
                                        por saúde e da retentativa correta)
p99 interno                             94 ms (orçamento de 120 ms)
```

O ganho de 2,3 pontos percentuais na taxa de aprovação, sobre R$ 38 bilhões, é o maior efeito
financeiro do projeto — e não era o objetivo declarado. Ele veio de duas mudanças: desviar
tráfego de adquirentes degradados, e parar de repetir recusas definitivas em outros
parceiros, o que estava sendo penalizado pelas bandeiras.

## O que este case ensina

**O caminho de falha é o produto.** Um orquestrador de pagamentos é, quase inteiramente, um
sistema para lidar com o que acontece quando algo não responde. O caminho feliz é simples e
não distingue implementações.

**Não saber é um estado, e precisa ser gravado.** A mudança de maior efeito do projeto foi
introduzir `ambigua` e proibir que qualquer componente assumisse recusa. Ela custou pouco
código e resolveu 93% das duplicidades antes de qualquer automação.

**Idempotência precisa de duas camadas.** A chave do cliente protege contra repetição do
cliente; o identificador de requisição protege contra repetição da própria plataforma. Sem a
segunda, a primeira não resolve ambiguidade.

**A escala não era o problema, de novo.** Setecentas autorizações por segundo. Todo o esforço
foi em correção sob falha parcial, e nenhuma decisão foi motivada por volume.

## Conceitos Relacionados

- [Idempotência](/06-distributed-systems/idempotency.md).
- [Disjuntores](/12-reliability/circuit-breakers.md) — o desvio por saúde.
- [Anti-Corruption Layer](/08-integration-architecture/integration-anti-corruption.md).
- [Case: Núcleo Bancário Digital](/21-case-studies/banking.md).

## Exercício Prático

Desenhe o diagrama de sequência do caminho em que a plataforma envia a autorização e não
recebe resposta.

Responda: o que está gravado nesse instante, quem decide o que aconteceu, e o que o lojista vê
enquanto isso? Se alguma das três não tiver resposta, o desenho tem uma duplicidade esperando.

## Perguntas de Entrevista

- Por que "assumir recusa" quando não há resposta é a origem de cobranças duplicadas?
- Por que idempotência do lado do cliente não basta num orquestrador?
- Por que recusas definitivas não devem ser reprocessadas em outro adquirente?

## Para Aprofundar

- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*. Addison-Wesley, 2003.
- Nygard, Michael. *Release It!*. 2ª ed. Pragmatic Bookshelf, 2018.
- PCI Security Standards Council. *PCI DSS v4.0*.
