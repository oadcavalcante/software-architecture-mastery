---
id: banking
title: "Case: Núcleo Bancário Digital"
sidebar_position: 2
description: Banco digital com 6,4 milhões de contas decidindo entre comprar um núcleo bancário e construir o próprio razão.
doc_type: case-study
level: 0
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor projeta um razão contábil com consistência forte, auditabilidade e
  recuperação, e sabe por que a escala aqui é menos exigente do que parece.
prerequisites: [trade-offs]
related: [payments, healthcare, high-volume-events]
canonical_for: []
content_version: 2
last_reviewed: 2026-08-29
---

# Case: Núcleo Bancário Digital

:::note Como usar este case

Leia contexto, requisitos e restrições. **Pare antes das opções de arquitetura** e esboce a
sua em vinte minutos.

Os números deste case são **ilustrativos** (SPEC.md §8.2): plausíveis e internamente
coerentes, não medidos num sistema nomeado. O que se aprende é o raciocínio que eles
sustentam, não as grandezas.

:::

## Contexto de Negócio

O **Banco Aurio** é um banco digital brasileiro com 6,4 milhões de contas abertas, das quais
3,1 milhões ativas mensalmente. Opera conta de pagamento, cartão pré-pago e crédito pessoal.

O núcleo bancário — o sistema que mantém saldos, lança transações e fecha o dia — é uma
solução de mercado contratada em 2019, cobrada por conta ativa.

Três pressões motivam a revisão:

**Custo por conta.** O contrato cobra R$ 1,42 por conta ativa por mês. Com 3,1 milhões de
contas ativas, são R$ 52,8 milhões anuais — a segunda maior linha de custo da empresa, atrás
apenas de pessoal. E ela cresce linearmente com o sucesso.

**Limites de produto.** O núcleo não suporta contas em múltiplas moedas, nem produtos de
investimento, nem conta conjunta. Os três estão no plano de negócio para os próximos 24
meses, e o fornecedor não tem data para nenhum.

**Janela de fechamento.** O fechamento diário leva 3h40 e ocorre entre 23h e 3h. Durante ele,
transações são aceitas mas não liquidadas, e o saldo exibido diverge. Com Pix operando 24×7,
essa janela virou fonte de reclamação e de risco operacional.

Não há problema de disponibilidade nem de escala: o núcleo atende o volume atual com folga.

## Requisitos Funcionais

```text
RF-1   Manter saldo de conta com partida dobrada, auditável e imutável
RF-2   Lançar transação com idempotência garantida por chave do cliente
RF-3   Bloquear e liberar valores (cauções, pré-autorizações de cartão)
RF-4   Consultar saldo e extrato com paginação, até 5 anos
RF-5   Liquidar Pix em tempo real, 24×7, sem janela de indisponibilidade
RF-6   Processar arquivos de liquidação de bandeira de cartão (lote diário)
RF-7   Calcular e lançar juros, tarifas e rendimento
RF-8   Suportar conta em mais de uma moeda
RF-9   Suportar conta conjunta com múltiplos titulares
RF-10  Gerar arquivos regulatórios (Bacen) nos prazos exigidos
RF-11  Reverter lançamento por estorno, sem apagar o original
```

RF-1, RF-2 e RF-11 são a fundação: um razão contábil correto. RF-5 é o que elimina a janela
de fechamento. RF-8 e RF-9 são o que o fornecedor não entrega.

Vale explicitar por que RF-1 é formulado com partida dobrada e não como "manter saldo". Um
sistema que guarda saldo como número e o altera a cada operação não tem como responder à
pergunta que auditoria, regulador e cliente fazem: **de onde veio essa diferença?** Partida
dobrada não é preferência contábil — é a estrutura de dados que torna o saldo uma consequência
verificável do histórico, em vez de uma afirmação.

E RF-11 é a razão de o razão ser imutável. Estorno é lançamento novo. Um sistema financeiro
que permite alterar um lançamento perde a propriedade que sustenta todas as outras.

## Requisitos Não-Funcionais

```text
disponibilidade do lançamento           99,99% (≈ 53 min/ano)
disponibilidade da consulta de saldo    99,95%
p99 de lançamento                       < 300 ms
p99 de consulta de saldo                < 150 ms
consistência do saldo                   forte, sem exceção
janela de indisponibilidade para
  fechamento                            0 — não pode existir
RPO (perda de dados aceitável)          0
RTO (tempo de recuperação)              < 15 min
retenção de lançamentos                 10 anos, imutável
rastreabilidade                         todo lançamento vinculado à origem,
                                        ao autor e ao horário, sem exceção
```

RPO zero é o requisito que mais restringe o desenho: nenhuma transação confirmada ao cliente
pode ser perdida, em nenhuma circunstância. Ele elimina qualquer replicação assíncrona no
caminho de confirmação.

## Restrições

```text
regulatório     autorização do Bacen como instituição de pagamento;
                requisitos de segregação, auditoria e continuidade
contrato        núcleo atual com aviso prévio de 12 meses para rescisão
equipe          58 engenheiros; 6 com experiência em sistemas financeiros
migração        6,4 milhões de contas com saldo e 5 anos de histórico
                precisam migrar sem divergência de um centavo
paralelo        o Bacen exige comprovação de equivalência antes da virada:
                os dois sistemas precisam produzir o mesmo resultado
                por um período mínimo
prazo           a janela de fechamento é reclamação recorrente; a diretoria
                quer solução em 18 meses
```

A exigência de operação em paralelo com comprovação de equivalência é a restrição que molda
todo o plano de migração — ela torna qualquer virada de chave impossível.

## Estimativas de Capacidade

```text
contas ativas                          3,1 milhões
lançamentos/dia                        14,2 milhões
lançamentos/s, média                   ~164
pico horário (18h-20h e dias 5 e 20)   ~1,4 milhão/h  →  ~390/s
pico instantâneo observado             ~840/s
margem de projeto (3×)                 ~2 500/s
consultas de saldo/dia                 ~48 milhões
pico de consulta                       ~2 100/s
com margem                             ~6 000/s
```

**Este é o número que muda a análise.** 2.500 lançamentos por segundo, com transações de
partida dobrada, é atendido por um único banco relacional bem dimensionado — com folga
grande. Não há necessidade de particionar a escrita, e particionar um razão contábil tem
custo de complexidade muito alto.

```text
armazenamento
  lançamentos, 10 anos                 ~52 bilhões de linhas  →  ~14 TB
  saldos (estado atual)                ~6,4 milhões de linhas  →  ~2 GB
  histórico consultável (5 anos)       ~26 bilhões de linhas
```

O volume de armazenamento é grande; o volume de escrita concorrente não é. Essa assimetria
orienta o desenho: **um núcleo transacional pequeno e quente, com histórico frio separado**.

A tabela de saldos tem 6,4 milhões de linhas e cabe inteira em memória. A de lançamentos tem
52 bilhões e nunca é lida por inteiro — cada consulta de extrato toca uma janela de tempo de
uma conta. São dois perfis de acesso opostos convivendo no mesmo domínio, e tratá-los como um
só produziria um banco lento nas duas pontas.

Há ainda um dado que a análise de capacidade revelou e que não estava na conversa inicial: o
pico de lançamentos não coincide com o pico de consultas. Consultas concentram-se pela manhã,
lançamentos ao fim do dia e nos dias 5 e 20. Isso significa que a capacidade de leitura e a
de escrita podem ser dimensionadas separadamente, e que réplicas de leitura resolvem a maior
parte do problema de pico.

## Opções de Arquitetura

### Opção A — Trocar de fornecedor

Substituir o núcleo atual por outro de mercado que suporte multimoeda, conta conjunta e
liquidação contínua.

```text
esforço                    14 a 20 meses de migração
custo                      cotações entre R$ 0,95 e R$ 1,30 por conta ativa
limites de produto         resolvidos hoje, e o problema se repete
                           no próximo produto não previsto
risco técnico              médio — migração completa, com paralelo
controle sobre evolução    nenhum
```

### Opção B — Razão próprio, monolítico e centralizado

Construir o razão com um banco relacional único, escrita centralizada, particionamento
apenas do histórico.

```text
esforço                    18 a 24 meses até paralelo, +6 de paralelo
custo operacional          ~R$ 4,2 milhões/ano (infraestrutura + equipe)
teto de escala             estimado em ~8 000 lançamentos/s no desenho
                           atual — 3× a margem de projeto
complexidade               baixa para o domínio; transações locais
risco                      alto na migração, baixo em operação
```

### Opção C — Razão próprio, particionado por conta

O mesmo, com contas distribuídas em partições independentes desde o início.

```text
esforço                    26 a 34 meses
teto de escala             praticamente ilimitado
complexidade               alta — transferência entre partições vira
                           transação distribuída
fechamento e regulatório   agregação entre partições em todo relatório
risco                      alto na migração e em operação
```

A Opção C resolve um problema de escala que as estimativas mostram não existir, e paga por
isso com transação distribuída em toda transferência entre contas — que é a operação mais
comum de um banco.

## Análise de Trade-offs

| Critério | Peso | A — Trocar | B — Próprio central | C — Próprio particionado |
|---|:-:|:-:|:-:|:-:|
| Custo total em 5 anos | 25% | 3 | 9 | 7 |
| Liberdade de produto | 25% | 4 | 9 | 9 |
| Risco de migração | 20% | 6 | 6 | 3 |
| Prazo até resolver o fechamento | 15% | 6 | 7 | 3 |
| Capacidade da equipe | 10% | 8 | 6 | 3 |
| Complexidade operacional | 5% | 9 | 7 | 3 |
| **Total ponderado** | | **5,1** | **7,6** | **5,7** |

**Análise de sensibilidade.** Com risco de migração em 40%, os totais viram 5,6 / 6,8 / 4,0 —
a Opção B continua vencendo. Com custo em 45%, viram 4,2 / 8,3 / 6,4. A conclusão é estável.

O critério que mais separa A de B é liberdade de produto, e ele foi deliberadamente
quantificado: multimoeda, conta conjunta e investimentos têm estimativa comercial de R$ 180
milhões em receita incremental em 4 anos. Nenhuma cotação de fornecedor cobria os três.

## Decisão

**Razão próprio, centralizado (Opção B)**, com histórico particionado por período e um
caminho de evolução explícito para particionamento por conta, caso o volume exija.

**Sob que condição cada opção descartada venceria:**

**Opção A venceria se** a liberdade de produto não fosse necessária — se o roadmap fosse de
produtos que o mercado já cobre. Também venceria se a equipe tivesse menos de 20 engenheiros:
construir um razão contábil correto exige uma massa crítica que times pequenos não têm.

**Opção C venceria se** o volume projetado passasse de ~6.000 lançamentos/s sustentados, ou
se houvesse requisito regulatório de segregação física por segmento de cliente. A condição
está registrada e é monitorada: a decisão de particionar é reavaliada quando o pico
sustentado passar de 3.000/s.

A decisão foi acompanhada de um compromisso explícito de desenho: **o razão centralizado é
construído de forma a não impedir o particionamento futuro**. Isso significa que o
identificador de conta carrega, desde o primeiro dia, o campo que serviria de chave de
partição; que nenhuma consulta interna varre a tabela inteira sem filtro de conta; e que
transferências entre contas já são modeladas como uma transação com duas pernas identificadas,
que é o formato que uma saga distribuída exigiria.

O custo dessas três restrições é próximo de zero hoje, e elas reduzem a Opção C de uma
reescrita para uma migração. É a diferença entre manter uma opção aberta e comprar
flexibilidade que talvez nunca se use. Ver
[simplicidade vs. flexibilidade](/20-trade-offs/simplicity-vs-flexibility.md).

## Componentes

```text
Razão (Ledger)
  partida dobrada, imutável, fonte de verdade de todo saldo
  única escrita transacional do sistema

Serviço de Contas
  ciclo de vida da conta, titulares, limites, status

Serviço de Lançamento
  recebe pedidos de lançamento, valida, aplica idempotência,
  grava no razão

Serviço de Saldo
  projeção de saldo para leitura; derivada do razão

Serviço de Bloqueios
  cauções e pré-autorizações, com expiração

Motor de Produtos
  juros, tarifas, rendimento — gera lançamentos, não altera saldo

Conector Pix
  integração com o SPI, liquidação em tempo real

Conector de Bandeiras
  processamento de arquivos de liquidação em lote

Serviço de Extrato
  consulta paginada sobre o histórico

Gerador Regulatório
  arquivos do Bacen, a partir do razão

Conciliador
  compara razão, projeções e fontes externas, diariamente
```

O **Razão** é deliberadamente pequeno e sem regra de negócio. Ele aceita lançamentos
balanceados e os grava; toda a lógica de produto vive fora dele e produz lançamentos. Essa
separação é o que permite acrescentar produtos novos sem tocar no núcleo — que é o problema
que o fornecedor não resolvia.

A tentação de colocar regra no razão é grande e reaparece a cada produto novo: seria mais
simples, para o time de crédito, que o razão soubesse recusar um lançamento que ultrapassa o
limite. A regra adotada é que o razão conhece exatamente três coisas — contas existem,
lançamentos somam zero, e uma chave de idempotência não se repete. Qualquer validação além
disso é de produto e fica fora.

Essa disciplina foi testada quatro vezes no primeiro ano, e cedida zero. O argumento que
sustentou a recusa em todas: cada regra dentro do razão vira uma razão para não poder mudar o
razão, e o objetivo do projeto inteiro era poder mudar.

## Dados

**Modelo do razão.**

```text
conta          (id, tipo, moeda, titular, status)
lancamento     (id, id_transacao, id_conta, valor, sinal, moeda,
                data_competencia, data_registro, origem, autor)
transacao      (id, chave_idempotencia, tipo, status, criada_em)
saldo          (id_conta, moeda, saldo, versao, atualizado_em)
bloqueio       (id, id_conta, valor, expira_em, status)
```

Três propriedades não negociáveis:

**Imutabilidade.** Nenhuma linha de `lancamento` é alterada ou removida, nunca. Um estorno é
um lançamento novo, de sinal oposto, referenciando o original (RF-11). Isso é o que torna a
auditoria possível e é exigência regulatória.

**Balanceamento.** Toda transação grava lançamentos cuja soma é zero. Uma restrição no banco
recusa transações desbalanceadas — a verificação é do armazenamento, não da aplicação.

**Idempotência por chave.** `chave_idempotencia` é única. Uma segunda tentativa com a mesma
chave retorna o resultado da primeira, sem duplicar. Ver
[idempotência](/06-distributed-systems/idempotency.md).

**Saldo como projeção com verificação.** A tabela `saldo` existe para leitura rápida e é
atualizada na **mesma transação** do lançamento, com controle de versão otimista. Ela não é
uma réplica eventual — seria uma janela de inconsistência sobre dinheiro, que o requisito
proíbe.

Um processo diário recalcula o saldo de uma amostra a partir dos lançamentos e compara. A
amostra é de 100% das contas com movimento nas últimas 24 h, e de 2% das demais.

A escolha da amostra merece explicação. Recalcular 6,4 milhões de saldos a partir de 52
bilhões de lançamentos é caro e demorado. Recalcular apenas as contas movimentadas cobre onde
o erro pode ter sido introduzido; a amostra de 2% das inativas cobre a hipótese de corrupção
silenciosa em dados que ninguém toca — que é rara e é justamente a que passaria despercebida
indefinidamente.

Em dois anos de operação, a verificação encontrou três divergências. Nenhuma era erro do
razão: duas vieram de um processo de correção manual mal executado, e uma de um teste que
escreveu em produção por configuração errada. Todas foram detectadas em menos de 24 horas —
que é exatamente o valor da verificação.

**Histórico particionado por mês.** As partições com mais de 90 dias vão para armazenamento
mais barato, com consulta mais lenta — aceitável para extrato antigo, que representa 3% das
consultas.

**PostgreSQL** como banco do razão, com réplica síncrona em outra zona (RPO zero) e réplica
assíncrona em outra região (recuperação de desastre).

## Integração

**Pix (RF-5).** Liquidação em tempo real, 24×7, com o SPI do Banco Central. É a integração
mais exigente: a resposta ao SPI tem prazo, e o lançamento precisa ser confirmado antes da
resposta.

```text
recebimento    SPI → conector → lançamento síncrono no razão → resposta
envio          cliente → lançamento com bloqueio → SPI → confirmação
               → bloqueio vira lançamento definitivo
timeout        se o SPI não responde, o bloqueio permanece e há
               reconciliação por arquivo — nunca liberação otimista
```

O caminho de envio é síncrono contra o razão e assíncrono contra o SPI, com o bloqueio
servindo de estado intermediário. Isso mantém o saldo do cliente correto mesmo com o SPI
indisponível.

**Bandeiras de cartão (RF-6).** Arquivos de liquidação em lote, processados de forma
idempotente por arquivo e por registro — reprocessar o mesmo arquivo não duplica lançamentos.

**Motor de produtos.** Publica lançamentos como qualquer outra origem. Juros e tarifas não
têm caminho privilegiado no razão.

**Conciliação.** Diária e obrigatória, comparando razão contra: extrato do banco liquidante,
arquivos de bandeira, e movimentação do SPI. Divergência acima de R$ 0,01 é incidente, não
alerta.

A distinção entre incidente e alerta não é semântica. Um alerta vai para um painel e é
observado; um incidente aciona plantão, tem prazo de resposta e gera análise posterior. A
escolha de tratar um centavo como incidente foi deliberada e contestada — a objeção era que
produziria ruído. Em dois anos, produziu 14 acionamentos, dos quais 11 eram problemas reais
de integração com terceiros e 3 eram defeitos de conciliação. Nenhum era ruído.

O motivo é estrutural: em um razão de partida dobrada com restrição de balanceamento, uma
divergência de um centavo não pode vir de arredondamento interno. Ela vem de fora, e o que
vem de fora e não bate é sempre algo que precisa ser entendido.

## Segurança

```text
segregação de funções     quem opera não lança; quem lança não aprova
                          lançamentos manuais exigem dois aprovadores
autoria                   todo lançamento carrega autor (sistema ou pessoa)
                          e origem; sem exceção
acesso ao razão           apenas o Serviço de Lançamento escreve;
                          nenhum outro componente tem credencial de escrita
dados de titular          classificação, mapeamento de fluxo, retenção
                          declarada por ponto de repouso
criptografia              em trânsito e em repouso; chaves em serviço
                          gerenciado com rotação
trilha de auditoria       imutável e separada, com retenção de 10 anos
acesso de suporte         somente leitura, com registro e justificativa
                          obrigatória por consulta
```

O controle mais importante é o de **credencial de escrita única**: nenhum caminho alternativo
grava no razão, e isso é verificado automaticamente — uma função de aptidão falha a esteira
se qualquer outro serviço declarar credencial de escrita naquele esquema. Ver
[funções de aptidão](/19-architecture-governance/fitness-functions-governance.md).

O acesso de suporte com justificativa obrigatória surgiu de uma exigência do regulador e teve
efeito colateral positivo: o volume de consultas de suporte caiu 40%, porque parte delas era
curiosidade.

## Escalabilidade

O gargalo é a **escrita no razão**, e ele é gerenciável no volume projetado:

```text
lançamentos/s de projeto            2 500
capacidade medida em teste de carga ~8 200/s com o desenho atual
gargalo do teste                    contenção na tabela de saldo, por conta
```

A contenção é por conta, não global. Contas comuns têm baixa concorrência; contas de
liquidação — a conta interna que recebe todas as tarifas, por exemplo — têm alta.

A solução é **fragmentação de saldo para contas quentes**: contas internas de alto volume têm
o saldo dividido em N sublinhas, e o saldo é a soma. A escrita escolhe uma sublinha ao acaso,
eliminando a contenção. Ver [pontos quentes](/11-scalability/hotspots.md).

Leitura escala por réplicas: o Serviço de Saldo lê da primária apenas nos 5 segundos
seguintes a uma escrita da mesma sessão, e de réplicas no resto do tempo. Ver
[consistência forte vs. eventual](/20-trade-offs/strong-vs-eventual-consistency.md).

## Confiabilidade

```text
RPO 0             réplica síncrona em zona distinta; confirmação ao cliente
                  só depois do commit em duas zonas
RTO < 15 min      promoção automática de réplica, testada mensalmente
recuperação
  regional        réplica assíncrona em outra região, RPO ~30 s,
                  usada apenas em desastre declarado
teste             restauração completa testada trimestralmente, por
                  alguém que não é o especialista
```

O RPO zero custa latência: a confirmação em duas zonas acrescenta ~12 ms ao p99 do
lançamento. É pago em toda transação e foi aceito explicitamente — dinheiro não tolera perda.

**Degradação desenhada.**

```text
razão indisponível        nenhum lançamento é aceito; a aplicação
                          informa indisponibilidade, e não aceita
                          "para processar depois"
réplica de leitura fora   consultas vão para a primária, com latência maior
motor de produtos fora    juros e tarifas atrasam; nada mais é afetado
conector Pix fora         Pix indisponível; conta segue operando
gerador regulatório fora  sem impacto imediato; prazo é diário
```

A primeira linha é a decisão mais importante: **não existe aceite otimista de transação
financeira**. Um sistema que aceita lançamento sem gravar no razão está criando dinheiro que
pode não existir.

Essa regra tem uma consequência desconfortável e aceita: durante indisponibilidade do razão, o
banco fica sem operar. Não há fila de lançamentos pendentes, não há aceite provisório, não há
"processamos assim que voltar". A alternativa — aceitar e liquidar depois — troca uma
indisponibilidade visível e curta por um risco de inconsistência invisível e indefinido, e é
a origem de boa parte dos episódios de saldo negativo inexplicado que aparecem no setor.

A disponibilidade de 99,99% do lançamento existe justamente porque não há degradação possível
ali. Onde não se pode degradar, paga-se em redundância.

## Observabilidade

```text
métricas de negócio     lançamentos/s por tipo, taxa de rejeição,
                        valor total movimentado, divergência de conciliação
métricas técnicas       latência de lançamento p50/p99, atraso de replicação,
                        contenção por conta, profundidade de fila de arquivos
alarmes críticos        divergência de conciliação > R$ 0,01 → incidente
                        atraso de réplica síncrona > 100 ms → alerta
                        lançamento desbalanceado → impossível, mas alarmado
                        saldo negativo sem limite → incidente
rastreamento            todo lançamento correlacionado à origem externa
                        (transação Pix, registro de arquivo, chamada de API)
```

A linha "lançamento desbalanceado → impossível, mas alarmado" é deliberada: a restrição do
banco impede, e o alarme existe porque um disparo indicaria que a restrição foi removida ou
contornada.

Esse padrão — alarmar o impossível — aparece três vezes no desenho, e a justificativa é a
mesma: garantias estruturais podem ser desfeitas por engano, e o momento de descobrir isso não
é durante uma auditoria. O custo de manter o alarme é desprezível; o custo de descobrir tarde
que a restrição foi removida numa migração de esquema não é.

A observabilidade do razão também serve a um público que costuma ser esquecido no desenho: a
área de controles internos e o próprio regulador. Os relatórios de conciliação, a trilha de
auditoria e o registro de acesso de suporte são construídos com esse público em mente, e
disponibilizados como consulta em vez de como arquivo enviado sob demanda — o que reduziu o
esforço de atendimento a demandas regulatórias de dias para horas.

## Implantação

```text
razão                     implantação com janela, fora do pico, com
                          verificação de esquema em três etapas
                          (compatível → migração → limpeza)
demais serviços           canary, 5% → 50% → 100%, com reversão automática
migração de esquema       nunca destrutiva na mesma implantação;
                          coluna removida no mínimo 2 versões depois
teste de carga            obrigatório antes de cada mudança no razão,
                          contra dados de volume real anonimizados
```

## Estratégia de Evolução

O plano é dominado pela exigência regulatória de paralelo.

**Fase 1 (meses 1–8): razão sombra.** O razão novo é construído e passa a receber **cópia**
de todos os lançamentos do núcleo atual, sem servir a ninguém. Diariamente, os saldos dos dois
são comparados, conta a conta.

O critério de saída da fase: **90 dias consecutivos com zero divergência em 6,4 milhões de
contas.** A primeira tentativa levou 5 meses até atingir o critério; foram encontradas 11
classes de divergência, das quais 7 eram comportamentos não documentados do núcleo atual — o
tipo de conhecimento que só aparece na comparação.

**Fase 2 (meses 9–12): leitura pelo razão novo.** Consultas de saldo e extrato passam a ser
servidas pelo razão novo, com o núcleo atual ainda como fonte de escrita. Risco baixo e
reversível por configuração.

**Fase 3 (meses 13–16): escrita por produto.** A escrita migra por produto, não por conta.
Começa por cartão pré-pago — o produto com menor volume e menor complexidade contábil — e
avança para conta de pagamento e crédito.

Cada produto migrado mantém sombra reversa: o núcleo antigo continua recebendo cópia, para
comparação, até que o produto seguinte migre.

**Fase 4 (meses 17–19): liquidação contínua.** Com o razão novo como fonte, a janela de
fechamento de 3h40 é eliminada. O fechamento vira um processo de agregação que roda sobre
dados já liquidados, sem bloquear escrita.

**Fase 5 (meses 20–26): produtos novos e desligamento.** Multimoeda, conta conjunta e
investimentos, seguidos do encerramento do contrato com aviso prévio de 12 meses — iniciado
na Fase 3, para não pagar contrato ocioso.

A escolha de iniciar o aviso prévio na Fase 3, e não na Fase 5, foi uma decisão de risco
consciente: ela cria um prazo irreversível de 12 meses para concluir a migração de escrita. A
justificativa registrada é que, sem esse prazo, a experiência da organização com projetos
longos indicava alta probabilidade de a Fase 4 ser adiada indefinidamente por prioridades
concorrentes — e o custo de manter os dois sistemas é de R$ 4,4 milhões por ano.

O risco foi mitigado com uma cláusula de extensão negociada previamente, a preço acordado, que
nunca precisou ser acionada.

**Condições que mudariam o plano:**

```text
se qualquer classe de divergência persistir após 6 meses de sombra
  → o projeto é reavaliado; equivalência não comprovada é impedimento
    regulatório, não um detalhe

se o pico sustentado passar de 3 000 lançamentos/s
  → a decisão de razão centralizado é reavaliada (Opção C)

se o Bacen alterar a exigência de paralelo
  → as Fases 1 e 3 encurtam significativamente

se a equipe perder mais de 3 das 6 pessoas com experiência financeira
  → o projeto pausa; esta é a dependência humana mais crítica
```

## Resultados

Números ao fim da Fase 4, 19 meses após o início:

```text
janela de fechamento                    de 3h40 para 0
divergência de conciliação diária       R$ 0,00 em 214 dias consecutivos
custo do núcleo                         de R$ 52,8 mi/ano para ~R$ 5,1 mi/ano
                                        (infraestrutura + equipe dedicada)
p99 de lançamento                       218 ms
p99 de consulta de saldo                74 ms
disponibilidade do lançamento           99,993%
tempo até um produto novo entrar
  no razão                              de "não é possível" para ~6 semanas
```

## O que este case ensina

**A escala de um banco de retalho é menor do que a reputação sugere.** 2.500 lançamentos por
segundo cabem em um banco relacional. Particionar o razão — que parece a resposta "séria" —
introduz transação distribuída na operação mais comum do domínio, para resolver um problema
que não existe.

**O núcleo deve ser burro.** Toda a liberdade de produto veio de manter o razão sem regra de
negócio. Produtos geram lançamentos; o razão apenas os aceita balanceados e os grava.

**A comparação em paralelo é o produto, não a burocracia.** As 11 classes de divergência
encontradas na fase de sombra eram comportamentos não documentados do sistema antigo.
Nenhuma teria sido descoberta por leitura de especificação.

**RPO zero tem preço em latência, e ele é pago sempre.** Doze milissegundos por transação, em
14 milhões de transações diárias. A decisão foi registrada com o número, não com o adjetivo.

## Conceitos Relacionados

- [Idempotência](/06-distributed-systems/idempotency.md).
- [Consistência Forte](/06-distributed-systems/strong-consistency.md).
- [Pontos Quentes](/11-scalability/hotspots.md) — a fragmentação de saldo.
- [Case: Plataforma de Pagamentos](/21-case-studies/payments.md).

## Exercício Prático

Projete a tabela de lançamentos garantindo as três propriedades: imutabilidade,
balanceamento e idempotência por chave.

Depois escreva a restrição de banco que torna um lançamento desbalanceado impossível. Se ela
estiver na aplicação e não no banco, ela não é garantia.

## Perguntas de Entrevista

- Por que particionar o razão por conta resolve um problema que este sistema não tem, e cria
  um que ele não tinha?
- Por que o saldo é atualizado na mesma transação do lançamento, e não como projeção
  eventual?
- Por que não pode existir aceite otimista de transação financeira?

## Para Aprofundar

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Fowler, Martin. *Accounting Patterns*. martinfowler.com, 1996.
- Bacen. *Manual de Regras do Pix* — regulamentação do SPI.
