---
id: messaging-platform
title: "Case: Plataforma de Mensageria"
sidebar_position: 7
description: Mensagens instantâneas para 31 milhões de usuários, onde entregar exatamente uma vez é impossível e o produto exige que pareça que sim.
doc_type: case-study
level: 0
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor projeta entrega ordenada e sem duplicata percebida sobre um
  transporte que garante nenhuma das duas, com estado de conexão em escala.
prerequisites: [trade-offs]
related: [social-network, video-streaming, ride-sharing]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-29
---

# Case: Plataforma de Mensageria

:::note Como usar este case

Leia contexto, requisitos e restrições. **Pare antes das opções de arquitetura** e esboce a sua
em vinte minutos.

:::

## Contexto de Negócio

A **Falai** é uma plataforma de mensagens instantâneas usada por 31 milhões de pessoas no
Brasil, com foco em comunicação entre empresas e clientes: atendimento, notificação e vendas.
Cerca de 40% do volume é entre pessoas, e 60% envolve uma conta empresarial de um lado.

O produto tem uma exigência que o distingue de quase todos os outros deste conjunto: **a
percepção de tempo real é o produto**. Uma mensagem que demora 4 segundos para aparecer não é
uma mensagem atrasada — é um produto quebrado, e o usuário reenvia.

Duas pressões motivam a revisão da arquitetura:

**Duplicatas e mensagens fora de ordem.** A plataforma registra cerca de 0,4% de mensagens
exibidas em duplicidade e 0,9% exibidas fora de ordem em conversas ativas. Ambas geram
reclamação, e a segunda é pior: uma resposta que aparece antes da pergunta muda o sentido da
conversa.

**Custo de conexão.** Manter 4,2 milhões de conexões persistentes simultâneas consome R$ 26
milhões por ano, e a maior parte delas está ociosa a maior parte do tempo.

## Requisitos Funcionais

Para o **usuário**: enviar e receber mensagens de texto, imagem, áudio e documento; ver o estado
de cada mensagem enviada — enviada, entregue, lida; participar de conversas em grupo de até
2.000 membros; buscar no histórico; e receber notificação quando o aplicativo está fechado.

Para a **conta empresarial**: receber mensagens por interface de programação; responder por
atendente humano ou automação; distribuir conversas entre atendentes; e manter histórico
completo por cliente.

Para a **plataforma**: entregar cada mensagem exatamente uma vez do ponto de vista do usuário;
preservar a ordem dentro de uma conversa; e sincronizar o estado entre múltiplos dispositivos do
mesmo usuário.

O requisito de entrega "exatamente uma vez" é literalmente impossível de garantir num sistema
distribuído com falha de rede. O que se pode garantir é entrega **ao menos uma vez** com
deduplicação no destino — e é essa distinção que decide o desenho.

Vale explicitar por que é impossível, porque a formulação aparece em requisitos de produto o
tempo todo. Se o remetente envia e não recebe confirmação, ele não sabe se a mensagem chegou.
Reenviar arrisca duplicar; não reenviar arrisca perder. Não existe protocolo que resolva isso —
a informação que decidiria simplesmente não existe do lado do remetente. O que se faz é escolher
o erro tolerável (duplicar) e eliminá-lo no destino, onde a informação existe.

Escrever o requisito como "o usuário nunca vê uma mensagem duplicada nem fora de ordem" em vez
de "entrega exatamente uma vez" é a diferença entre um requisito atendível e uma promessa que
nenhum sistema cumpre.

## Requisitos Não-Funcionais

```text
p95 de entrega, ambos online              < 400 ms
p99 de entrega, ambos online              < 900 ms
duplicatas percebidas pelo usuário        < 0,001%
mensagens fora de ordem                   0 dentro de uma conversa
disponibilidade do envio                  99,99%
perda de mensagem                         0 — uma mensagem aceita
                                          precisa ser entregue
retenção de mensagens                     indefinida no dispositivo,
                                          90 dias no servidor
sincronização entre dispositivos          < 2 s
custo por usuário ativo                   redução de 35%
```

A combinação de "zero perda" com "zero fora de ordem" e latência de 400 ms é o que torna este
sistema difícil. Cada uma isoladamente é simples; as três juntas exigem que a ordem seja
estabelecida em um ponto e que o transporte seja capaz de repetir sem quebrar a sequência.

## Restrições

```text
dispositivos       aplicativos móveis com conectividade intermitente;
                   um usuário pode ficar dias offline e precisar
                   receber tudo ao voltar
múltiplos          um usuário tem em média 1,8 dispositivo ativo,
  dispositivos     e todos precisam ver o mesmo estado
grupos             até 2 000 membros; um grupo grande com atividade
                   alta é um problema de distribuição
notificação        depende de serviços de terceiros (Apple e Google),
                   com latência e confiabilidade fora do controle
regulatório        conteúdo de mensagem é dado sensível; retenção
                   e acesso rigorosamente controlados
equipe             74 engenheiros; 16 no domínio de mensageria
custo              a meta de -35% é de diretoria
```

A restrição de múltiplos dispositivos é a mais subestimada. Ela transforma "entregar uma mensagem
a um usuário" em "entregar a N dispositivos, cada um com estado próprio de sincronização", e é a
origem da maior parte da complexidade real do sistema.

E ela interage mal com a restrição de conectividade intermitente. Um usuário com celular e
desktop pode ter o desktop desligado por uma semana; ao ligá-lo, ele precisa receber tudo o que
aconteceu, na ordem, sem duplicar o que já foi lido no celular. Isso significa que o estado de
leitura é por dispositivo, mas o estado de "lida" que o remetente vê é por usuário — dois
conceitos que a interface apresenta como um só.

Grande parte dos defeitos históricos do produto vinha de tratar esses dois estados como a mesma
coisa: uma mensagem marcada como lida no celular desaparecia da lista de não lidas do desktop
antes de ter sido entregue a ele.

## Estimativas de Capacidade

```text
usuários ativos diários            18,4 milhões
mensagens/dia                      2,9 bilhões
mensagens/s, média                 ~33 500
pico (12h-13h e 19h-21h)           ~112 000/s
com margem (2×)                    ~225 000/s

conexões simultâneas, média        ~2,8 milhões
conexões simultâneas, pico         ~4,2 milhões
mensagens por conexão/min, mediana ~0,3
```

O último número é o que sustenta a crítica ao modelo atual: a mediana das conexões transporta
uma mensagem a cada três minutos. A plataforma paga por 4,2 milhões de conexões abertas para
mover um volume que, em média por conexão, é desprezível.

```text
distribuição de fanout
  conversa individual              1 destinatário
  grupo mediano                    18 membros
  grupo grande (p99,9)             ~800 membros
  grupo máximo                     2 000 membros

entregas/s no pico (mensagens × destinatários)   ~1,4 milhão/s
```

Um milhão e quatrocentas mil entregas por segundo é o número que dimensiona o sistema — e ele é
40× maior que o número de mensagens, por causa dos grupos.

```text
armazenamento
  mensagens no servidor, 90 dias    ~260 bilhões  →  ~31 TB
  metadados de conversa e estado    ~3 TB
  fila de entrega pendente          variável; ~400 GB em regime
```

## Opções de Arquitetura

O eixo de decisão é **onde a ordem é estabelecida e como a entrega é confirmada**.

### Opção A — Ordem no cliente, por carimbo de tempo

Cada mensagem carrega o horário do dispositivo emissor; o receptor ordena por esse valor.

```text
simplicidade      alta
ordem             não garantida — relógios de dispositivos divergem,
                  e a divergência observada chega a minutos
deduplicação      por identificador gerado no cliente
custo             mínimo
```

É a arquitetura atual, e é a origem dos 0,9% de mensagens fora de ordem.

### Opção B — Ordem no servidor, por sequência de conversa

Cada conversa tem um contador; o servidor atribui um número sequencial a cada mensagem no
momento em que a aceita. O cliente ordena por esse número e detecta lacunas.

```text
ordem             garantida dentro da conversa
deduplicação      trivial — número duplicado é descartado
detecção de perda o cliente vê a lacuna e pede o que falta
contenção         o contador de uma conversa é ponto de serialização
custo             moderado
```

### Opção C — Registro particionado por conversa

Cada conversa é uma partição de um registro ordenado; a entrega é a leitura desse registro pelo
cliente, que guarda sua posição.

```text
ordem             garantida por construção
deduplicação      trivial — a posição é a garantia
sincronização
  entre dispositivos  natural — cada dispositivo tem sua posição
retenção          o registro é o armazenamento
complexidade      alta — milhões de partições
custo             alto para conversas pouco ativas
```

## Análise de Trade-offs

| Critério | Peso | A — Cliente | B — Sequência | C — Registro |
|---|:-:|:-:|:-:|:-:|
| Garantia de ordem | 30% | 2 | 9 | 10 |
| Deduplicação e detecção de perda | 20% | 4 | 9 | 9 |
| Sincronização entre dispositivos | 15% | 3 | 7 | 10 |
| Custo | 15% | 9 | 8 | 3 |
| Complexidade operacional | 10% | 9 | 7 | 3 |
| Capacidade da equipe | 10% | 9 | 8 | 4 |
| **Total ponderado** | | **5,1** | **8,3** | **7,5** |

**Análise de sensibilidade.** Com sincronização entre dispositivos em 35%, os totais viram 4,5 /
7,9 / 8,4 — a Opção C passa a vencer. Esse é o cenário em que o produto se torna
multiplataforma pesado, com desktop, web e vários móveis por usuário.

Com custo em 40%, viram 6,9 / 8,4 / 4,6 — a Opção B amplia a vantagem.

## Decisão

**Ordem no servidor por sequência de conversa (Opção B)**, com o contador mantido em
armazenamento particionado por identificador de conversa e a entrega feita por conexão
persistente ou por notificação, conforme o estado do dispositivo.

**Sob que condição cada opção descartada venceria:**

**Opção A venceria se** a ordem não fosse requisito — em produtos de notificação unidirecional,
por exemplo, em que cada mensagem é independente. Não é o caso de conversa.

**Opção C venceria se** o número médio de dispositivos por usuário crescesse significativamente,
ou se a retenção no servidor passasse a ser indefinida — casos em que o registro deixa de ser
custo adicional e passa a ser o armazenamento principal. A condição está registrada: se a média
de dispositivos passar de 3, ou se a retenção server-side for estendida além de 2 anos, a
decisão é reavaliada.

## Componentes

**Serviço de Sessão.** Mantém quais dispositivos de quais usuários estão conectados, e a qual
nó. É o mapa que o roteamento consulta.

**Gateway de Conexão.** Termina as conexões persistentes. Sem lógica de negócio: recebe, valida
e encaminha; entrega o que o roteamento manda.

**Serviço de Mensagem.** Aceita a mensagem, atribui o número de sequência da conversa, persiste
e emite para entrega. É o único ponto onde a ordem é estabelecida.

**Roteador de Entrega.** Para cada destinatário e dispositivo, decide se entrega pela conexão
aberta ou enfileira para notificação.

**Fila de Pendências.** Guarda o que não pôde ser entregue, por dispositivo, até a confirmação.

**Serviço de Grupo.** Membros, permissões e a expansão de um envio em N destinatários.

**Serviço de Notificação.** Integração com Apple e Google para dispositivos sem conexão.

**Serviço de Histórico.** Consulta paginada e busca.

O **Gateway** ser burro é uma decisão importante: ele é o componente com mais instâncias e mais
conexões, e mantê-lo sem estado de negócio permite reiniciá-lo, escalá-lo e implantá-lo sem
coordenação com o resto.

## Dados

**Sequência de conversa.** O contador é a estrutura mais sensível do sistema.

```text
chave      conversa_id
valor      ultimo_numero
operação   incremento atômico, retornando o novo valor
```

Ele vive em armazenamento chave-valor particionado por identificador de conversa. Uma conversa é
serializada; conversas diferentes são independentes. Como conversas individuais dominam o
volume, a contenção é distribuída naturalmente.

Grupos muito ativos são a exceção: um grupo de 2.000 membros com 40 mensagens por segundo
serializa nesse contador. O limite medido é de cerca de 900 mensagens por segundo por conversa,
bem acima do observado em qualquer grupo real — e o número está registrado como condição de
revisão.

**Mensagem.**

```text
mensagem   (conversa_id, numero_sequencia, remetente_id, tipo,
            conteudo_cifrado, criada_em)
chave      (conversa_id, numero_sequencia) — primária e ordenada
```

A chave primária composta é o que torna a leitura de histórico e a detecção de lacuna baratas:
"me dê da sequência 4.120 em diante nesta conversa" é uma varredura de intervalo.

**Estado por dispositivo.**

```text
estado     (dispositivo_id, conversa_id, ultima_sequencia_confirmada)
```

Essa tabela é o que resolve múltiplos dispositivos: cada um tem sua própria posição em cada
conversa, e a sincronização é a diferença entre a posição do dispositivo e o último número da
conversa.

Ela também resolve a entrega confiável. Uma mensagem só é considerada entregue quando o
dispositivo confirma o recebimento avançando sua posição — e enquanto isso, ela permanece
disponível para reenvio. Isso implementa entrega ao menos uma vez com deduplicação por número
de sequência, que é a formulação honesta de "exatamente uma vez".

Ver [garantias de entrega](/06-distributed-systems/delivery-guarantees.md).

Uma consequência prática dessa tabela é que o custo de armazenamento da fila de pendências é
proporcional ao número de dispositivos inativos, não ao volume de mensagens. Um usuário com um
dispositivo desligado há trinta dias acumula pendências em todas as conversas ativas dele — e é
por isso que a retenção no servidor é de 90 dias, com um limite por dispositivo além do qual a
sincronização é truncada e o cliente recebe apenas o histórico recente.

O limite foi definido em 20 mil mensagens pendentes por dispositivo. Acima disso, a
sincronização completa levaria minutos e consumiria dados móveis de forma que os usuários
relataram como problema — a decisão foi truncar e oferecer carregamento sob demanda do
histórico anterior.

**Sessão.** Armazenamento em memória com TTL curto, mapeando dispositivo para nó de conexão.
Uma sessão expirada simplesmente significa que o dispositivo será tratado como offline, e a
mensagem irá por notificação — o que torna a perda de estado de sessão inofensiva.

## Integração

**Envio de mensagem.** O caminho crítico, com orçamento de 400 ms no p95.

```text
1. gateway recebe, valida e encaminha
2. serviço de mensagem obtém o próximo número da conversa
3. persiste a mensagem
4. confirma ao remetente (a mensagem está "enviada")
5. roteador expande destinatários e consulta sessões
6. entrega por conexão aberta ou enfileira para notificação
```

O passo 4 acontece antes do 5: o remetente recebe confirmação assim que a mensagem está
persistida e ordenada, sem esperar a entrega. Isso é o que mantém o p95 de envio baixo mesmo com
grupos grandes, e é o que separa "enviada" de "entregue" no produto.

**Grupos.** A expansão de um envio em N destinatários acontece no Roteador, de forma assíncrona.
Para grupos até 200 membros, a expansão é imediata; acima disso, é feita em lotes com prioridade
por atividade recente do destinatário — quem está com a conversa aberta recebe primeiro.

Essa priorização foi uma decisão de produto com efeito grande: em grupos de 2.000 membros, a
entrega completa leva até 8 segundos, e priorizar os ativos faz com que a conversa em andamento
não perceba atraso.

**Notificação.** Para dispositivos offline. É o único ponto do sistema com dependência externa no
caminho de entrega, e ele é assíncrono e com repetição — a mensagem permanece na fila de
pendências independentemente do resultado da notificação.

**Reconexão.** Quando um dispositivo reconecta, ele informa sua última sequência confirmada por
conversa, e o servidor envia o que falta. Um dispositivo que ficou dias offline recebe um lote,
paginado.

## Segurança

```text
cifragem em trânsito     obrigatória em todas as conexões
conteúdo                 cifrado em repouso; a plataforma não lê conteúdo
                         de conversas entre pessoas
contas empresariais      conteúdo acessível à empresa proprietária,
                         conforme contrato e ciência do usuário
metadados                quem falou com quem e quando é dado sensível;
                         retenção e acesso restritos
acesso de suporte        nunca ao conteúdo; apenas a metadados,
                         com justificativa registrada
retenção                 90 dias no servidor; o dispositivo é a
                         retenção de longo prazo do usuário
denúncia                 conteúdo denunciado é preservado com
                         acesso restrito, por prazo definido
```

A distinção entre conversas entre pessoas e conversas com contas empresariais é a decisão de
privacidade mais importante e a mais delicada: o modelo de negócio exige que a empresa veja o
histórico do seu cliente, e o usuário precisa saber disso. A solução foi tornar a distinção
visível na interface, não apenas nos termos de uso.

## Escalabilidade

O sistema escala em três dimensões independentes.

**Conexões** escalam por número de gateways. Como o gateway é sem estado de negócio, adicionar
capacidade é trivial. O custo por conexão é o que a Fase 2 do plano ataca.

**Mensagens** escalam por partição de conversa. O contador e o armazenamento são particionados
pelo mesmo identificador, o que mantém tudo de uma conversa junto.

**Entregas** — 1,4 milhão por segundo — escalam por número de roteadores, que são sem estado.

O ponto de contenção real não é nenhum dos três: é a **expansão de grupos grandes durante
picos**. Um evento que gere atividade simultânea em muitos grupos grandes — um jogo importante,
por exemplo — produz um pico de entregas desproporcional ao pico de mensagens.

A mitigação é a fila de expansão com prioridade e a aceitação explícita de que, nesses momentos,
a entrega a membros inativos de grupos grandes pode levar dezenas de segundos.

Essa aceitação foi negociada com a área de produto e registrada, e é o tipo de decisão que
frequentemente fica implícita. A alternativa seria dimensionar a capacidade de expansão para o
pico de eventos raros — o que significa capacidade ociosa a maior parte do ano — ou degradar
indistintamente, atrasando também quem está com a conversa aberta.

Priorizar por atividade recente é o que permite que a experiência percebida se mantenha
estável enquanto a fila cresce, e o número que o produto acompanha não é a profundidade da fila
e sim a latência de entrega **para destinatários ativos**, que é a única que alguém sente.

## Confiabilidade

Se o **Gateway** falha, as conexões daquele nó caem e os clientes reconectam em outro. Nenhuma
mensagem se perde, porque a fila de pendências e o estado por dispositivo estão fora dele. O
usuário percebe uma reconexão, que o aplicativo já trata como caso normal.

Se o **Serviço de Sessão** fica indisponível, todos os dispositivos são tratados como offline e
a entrega vai por notificação. É mais lento e mais caro, e funciona.

Se o **Serviço de Mensagem** falha, o envio para. Não há degradação — aceitar uma mensagem sem
atribuir sequência quebraria a garantia de ordem, que é o requisito central.

Se a **Notificação** externa falha, mensagens ficam na fila de pendências e são entregues quando
o dispositivo reconectar. O usuário não é avisado no momento, e recebe ao abrir o aplicativo.

Se o **Histórico** fica indisponível, conversas ativas funcionam e a busca não.

A propriedade que sustenta toda essa degradação é que **a mensagem persistida com sequência é a
fonte de verdade**, e tudo o mais é mecanismo de entrega. Perder um mecanismo de entrega atrasa;
não perde.

## Observabilidade

```text
latência de entrega, p50/p95/p99, separada por
  ambos online, destinatário offline, e grupo
taxa de duplicata detectada pelo cliente
lacunas de sequência detectadas e preenchidas
profundidade da fila de pendências, por faixa de idade
conexões simultâneas, e mensagens por conexão
taxa de sucesso de notificação, por provedor externo
tempo de reconexão e volume de sincronização por reconexão
```

A métrica de **lacunas detectadas** é a mais importante do conjunto para correção: ela mede
diretamente se o transporte está perdendo mensagens, e o número de lacunas preenchidas mostra que
o mecanismo de recuperação está funcionando.

Antes da Opção B, essa métrica não existia — sem numeração, não havia como saber que uma
mensagem tinha se perdido, e a perda aparecia como reclamação de usuário semanas depois.

## Implantação

O Gateway é implantado com drenagem de conexões: um nó para de aceitar novas conexões, aguarda a
migração natural dos clientes e é reiniciado. Uma implantação completa da frota leva cerca de 40
minutos, e é feita fora dos dois picos diários.

O Serviço de Mensagem exige mais cuidado, porque uma mudança no formato de mensagem precisa ser
compatível com clientes de versões antigas — parte da base roda versões de mais de um ano. A
regra é de compatibilidade por 18 meses.

## Estratégia de Evolução

**Fase 1 (meses 1–5): sequência de conversa.** Introdução do número de sequência e do estado por
dispositivo, com o cliente ainda ordenando por carimbo de tempo. A numeração é gravada e
comparada, sem ser usada.

O período de comparação mediu a real taxa de desordem: 0,9% relatados subestimavam o problema —
a medição encontrou 1,7% de mensagens que teriam sido exibidas fora de ordem, sendo que apenas
metade era percebida pelo usuário.

**Fase 2 (meses 6–9): ordenação e deduplicação pelo cliente.** O aplicativo passa a ordenar por
sequência e a detectar lacunas. Duplicatas e desordem caem para zero medido.

**Fase 3 (meses 8–14): otimização de conexão.** Redução do custo por conexão: multiplexação,
intervalo de sinal de vida adaptativo por padrão de uso, e migração de dispositivos com baixa
atividade para notificação em vez de conexão persistente.

Esta é a fase que entrega a meta de custo. A decisão central: um dispositivo que não envia nem
recebe há mais de 20 minutos tem a conexão encerrada, e volta a receber por notificação até
reabrir o aplicativo.

**Fase 4 (meses 15–20): entrega priorizada em grupos.** Expansão com prioridade por atividade.

**Fase 5 (meses 18–24): sincronização multiplataforma.** Melhoria da experiência com múltiplos
dispositivos, que é a condição de reavaliação da Opção C.

**Condições que mudariam o plano:**

```text
se a média de dispositivos por usuário passar de 3
  → a Opção C é reavaliada

se algum grupo passar de 900 mensagens/s sustentadas
  → o contador por conversa precisa de fragmentação, com
    reordenação no cliente

se a retenção no servidor for estendida além de 2 anos
  → o registro particionado deixa de ser custo adicional

se os provedores de notificação externos degradarem a
  confiabilidade abaixo de 95%
  → a política de encerrar conexões ociosas precisa ser revista
```

## Resultados

Números ao fim da Fase 3, 14 meses após o início:

```text
mensagens fora de ordem                   de 1,7% para 0
duplicatas percebidas                     de 0,4% para 0,0004%
mensagens perdidas detectadas por lacuna  1 100/dia, todas recuperadas
                                          automaticamente
p95 de entrega, ambos online              de 620 ms para 310 ms
conexões simultâneas no pico              de 4,2 mi para 2,1 mi
custo por usuário ativo                   -41% (meta era -35%)
reclamações sobre ordem de mensagens      -96%
```

As 1.100 mensagens por dia recuperadas por detecção de lacuna são o resultado mais revelador:
elas estavam sendo perdidas antes, e ninguém sabia. A numeração não apenas resolveu a ordem —
ela tornou a perda observável e recuperável.

## O que este case ensina

**"Exatamente uma vez" é entrega repetida com deduplicação no destino.** Não existe garantia de
entrega única sobre uma rede não confiável. O que existe é numerar, repetir até confirmar, e
descartar duplicata pelo número — e o usuário percebe isso como entrega única.

**A ordem precisa ser estabelecida em um ponto.** Relógios de dispositivos divergem em minutos.
Qualquer ordenação que dependa deles falha, e a falha é intermitente e difícil de reproduzir.

**Numerar torna a perda observável.** Antes da sequência, mensagens perdidas eram invisíveis e
apareciam como reclamação. Depois, viraram 1.100 lacunas diárias detectadas e preenchidas
automaticamente. A instrumentação veio de graça com a solução de ordem.

**A conexão persistente não é obrigatória.** Metade das conexões estava ociosa, e encerrá-las
não degradou a experiência — porque o mecanismo de notificação já existia para dispositivos
offline. Reconhecer que o dispositivo ocioso e o dispositivo offline podem ser tratados igual
foi o que entregou a meta de custo.

## Conceitos Relacionados

- [Garantias de Entrega](/06-distributed-systems/delivery-guarantees.md).
- [Ordenação](/06-distributed-systems/ordering.md).
- [Idempotência](/06-distributed-systems/idempotency.md).
- [Case: Rede Social](/21-case-studies/social-network.md).

## Exercício Prático

Descreva o que acontece quando um usuário envia uma mensagem, o cliente não recebe a confirmação
e reenvia — e o servidor tinha recebido a primeira.

Sem número de sequência atribuído pelo servidor, o que impede a duplicata? A resposta mostra por
que a deduplicação precisa de um identificador estável gerado no cliente **e** de ordem
atribuída no servidor.

## Perguntas de Entrevista

- Por que "exatamente uma vez" é impossível, e o que se implementa no lugar?
- Por que ordenar por carimbo de tempo do dispositivo falha de forma intermitente?
- Por que a confirmação ao remetente acontece antes da entrega aos destinatários?

## Para Aprofundar

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Lamport, Leslie. *Time, Clocks, and the Ordering of Events*. CACM, 1978.
- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*. Addison-Wesley, 2003.
