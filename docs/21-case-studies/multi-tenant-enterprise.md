---
id: multi-tenant-enterprise
title: "Case: Sistema Corporativo Multi-inquilino"
sidebar_position: 12
description: Plataforma para 40 grandes corporações, onde cada cliente quer o produto ajustado ao seu processo e nenhum aceita esperar pelos outros.
doc_type: case-study
level: 0
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor projeta extensibilidade por cliente sem versões divergentes de
  código, e sabe onde traçar o limite da customização.
prerequisites: [trade-offs]
related: [saas-platform, healthcare, legacy-modernization-case]
canonical_for: []
content_version: 2
last_reviewed: 2026-08-29
---

# Case: Sistema Corporativo Multi-inquilino

:::note Como usar este case

Leia contexto, requisitos e restrições. **Pare antes das opções de arquitetura** e esboce a sua
em vinte minutos.

Os números deste case são **ilustrativos** (SPEC.md §8.2): plausíveis e internamente
coerentes, não medidos num sistema nomeado. O que se aprende é o raciocínio que eles
sustentam, não as grandezas.

:::

## Contexto de Negócio

A **Alcance** vende uma plataforma de gestão de contratos e compliance para grandes corporações.
Tem 40 clientes — bancos, seguradoras, mineradoras, empresas de energia —, com contratos anuais
entre R$ 800 mil e R$ 9 milhões. Receita recorrente de R$ 118 milhões.

O perfil é oposto ao do case de [SaaS](/21-case-studies/saas-platform.md): poucos clientes, contratos grandes,
cada um com processo próprio e poder de negociação. E é isso que produz o problema central:

**A base de código tem 40 variantes.** Ao longo de nove anos, cada cliente grande obteve
customizações implementadas diretamente no produto, protegidas por condicionais. O código do
motor de aprovação tem 214 condicionais de cliente. Uma correção de defeito exige testar 40
combinações, e a equipe não consegue.

Os números que motivam a revisão:

```text
tempo médio entre correção pronta e produção     11 semanas
defeitos reintroduzidos por regressão            34% das correções
esforço em manutenção contra funcionalidade      73% / 27%
clientes em versões diferentes do produto        17
versão mais antiga em produção                   3 anos e 4 meses
```

Dezessete clientes em versões diferentes é o sintoma mais grave: a Alcance não tem um produto,
tem dezessete.

A degradação foi gradual e cada passo foi razoável. Um cliente grande pediu um comportamento
específico com prazo curto; implementar como condicional levou dois dias, e modelar como
configuração levaria seis semanas. A decisão de curto prazo foi correta isoladamente, e repetida
594 vezes ao longo de nove anos produziu um sistema que ninguém consegue mudar.

Esse é o mecanismo de erosão descrito em
[velocidade vs. qualidade](/20-trade-offs/speed-vs-quality.md), com uma variação: aqui o
atalho não era técnico, era comercial. Cada condicional tinha um contrato assinado atrás dela, o
que tornava a decisão de tomá-la ainda mais difícil de recusar — e a de removê-la, anos depois,
ainda mais cara.

## Requisitos Funcionais

Para o **cliente corporativo**: modelar seu próprio fluxo de aprovação de contratos, com etapas,
alçadas e prazos; definir campos adicionais nos formulários; configurar regras de compliance
específicas do seu setor; integrar com seus sistemas internos — ERP, diretório corporativo,
assinatura digital; e extrair relatórios com sua própria taxonomia.

Para a **Alcance**: entregar funcionalidade nova a todos os clientes ao mesmo tempo; corrigir um
defeito uma vez; e onboarding de cliente novo em semanas, não em meses.

Para o **usuário final**: operar contratos, aprovar, acompanhar prazos e auditar.

O conflito é evidente: os clientes querem o produto ajustado a eles, e a Alcance precisa de um
produto só. Toda a arquitetura é sobre resolver essa tensão sem escolher um dos lados.

## Requisitos Não-Funcionais

```text
tempo entre correção pronta e produção      < 1 semana (contra 11)
clientes em versão corrente                 100% (contra 57%)
tempo de onboarding de cliente novo         < 6 semanas (contra ~7 meses)
p95 de operação interativa                  < 700 ms
disponibilidade                             99,9%
isolamento de dados entre clientes          absoluto, verificado
customização sem implantação                fluxos, campos e regras
                                            configuráveis pelo cliente
retenção de contratos e trilha              10 anos
auditabilidade                              toda alteração em contrato
                                            registrada com autor e motivo
```

O requisito de 100% dos clientes na versão corrente é o mais difícil e o mais importante: ele é
o que transforma dezessete produtos em um.

## Restrições

```text
poder de negociação   cada cliente representa entre 0,7% e 7,6% da
                      receita; nenhum pode ser simplesmente contrariado
customizações
  existentes          214 condicionais de cliente no motor de aprovação,
                      e outras 380 espalhadas
integrações           cada cliente integra com sistemas próprios,
                      alguns antigos e sem API moderna
regulatório           setores regulados diferentes, com exigências
                      específicas por cliente
equipe                62 engenheiros; 73% do esforço em manutenção
migração              sem janela; todos os clientes operam
                      continuamente
contratos             mudanças que afetem funcionalidade contratada
                      exigem aceite formal do cliente
```

A restrição de poder de negociação é a que torna este case diferente: não é possível impor uma
padronização unilateral. Cada remoção de customização precisa ser negociada, e o argumento
precisa ser bom.

## Estimativas de Capacidade

```text
clientes                          40
usuários nomeados                 ~186 000
usuários ativos diários           ~41 000
contratos ativos                  ~2,4 milhões
requisições/dia                   ~28 milhões
requisições/s, média              ~325
pico                              ~1 900/s
aprovações processadas/dia        ~94 000
```

O volume é pequeno. Como em quase todos os cases deste conjunto, a arquitetura não é decidida
por escala — e aqui isso é ainda mais evidente: 1.900 requisições por segundo é atendido por uma
aplicação convencional em qualquer topologia.

O que dimensiona este sistema é a **variabilidade**:

```text
fluxos de aprovação distintos em uso         163
campos adicionais definidos por clientes     ~4 100
regras de compliance específicas             ~890
integrações distintas                        112
relatórios customizados                      ~2 300
```

Quatro mil e cem campos adicionais e 163 fluxos distintos são o problema. Nenhuma quantidade de
capacidade resolve; a questão é onde essa variabilidade vive.

Uma análise dos 163 fluxos revelou algo que mudou a estratégia: eles não eram 163 processos
diferentes. Agrupados por estrutura, reduziam-se a 9 padrões, com variações de alçada, prazo e
nomenclatura. Um mesmo padrão — aprovação sequencial com alçada por valor e escalonamento por
prazo — cobria 71 dos 163.

Essa descoberta foi o que tornou a Opção B viável. Se os 163 fossem realmente distintos, nenhum
modelo declarativo os expressaria; sendo 9 padrões parametrizados, um motor de fluxo com
definição declarativa cobre quase tudo. A análise levou três semanas e determinou o projeto
inteiro.

## Opções de Arquitetura

O eixo é **onde a customização por cliente é expressa**.

### Opção A — Condicionais no código

A situação atual: cada customização é código, protegido por verificação de cliente.

```text
flexibilidade      total — qualquer coisa é possível
custo              proibitivo — cada correção testa 40 combinações
versões            divergem inevitavelmente
onboarding         meses, com desenvolvimento
```

### Opção B — Configuração declarativa

A variabilidade é expressa em configuração interpretada pelo produto: fluxos como definição de
máquina de estados, campos como metadados, regras como expressões.

```text
flexibilidade      alta, dentro do que o modelo de configuração prevê
custo              baixo — um código, muitas configurações
versões            todos na mesma
onboarding         semanas, com configuração
limite             o que a configuração não expressa exige mudar
                   o produto — para todos
```

### Opção C — Extensibilidade por código do cliente

O produto expõe pontos de extensão em que código fornecido pelo cliente ou pela consultoria roda
em ambiente isolado.

```text
flexibilidade      quase total
custo              médio — o produto é um, as extensões são do cliente
versões            todos na mesma versão do produto
risco              código de terceiro em execução; isolamento,
                   desempenho e suporte ficam difíceis
suporte            "o problema é da sua extensão" é uma conversa ruim
```

### Opção D — Configuração declarativa com extensão limitada

Configuração para a maior parte, e pontos de extensão restritos e bem definidos — integrações e
cálculos — para o que a configuração não cobre.

```text
flexibilidade      alta
custo              baixo a médio
versões            todos na mesma
limite             explícito e negociável
```

## Análise de Trade-offs

| Critério | Peso | A — Código | B — Configuração | C — Extensão | D — Mista |
|---|:-:|:-:|:-:|:-:|:-:|
| Unificação de versão | 30% | 1 | 10 | 8 | 9 |
| Custo de manutenção | 25% | 1 | 9 | 6 | 8 |
| Capacidade de atender pedidos | 20% | 10 | 6 | 9 | 8 |
| Tempo de onboarding | 15% | 2 | 9 | 6 | 8 |
| Risco operacional | 10% | 5 | 9 | 3 | 7 |
| **Total ponderado** | | **3,4** | **8,7** | **6,9** | **8,2** |

A disputa entre B e D é apertada. A diferença está no critério de capacidade de atender pedidos:
a Opção B pura tem um limite duro, e quando um cliente de R$ 9 milhões pede algo que a
configuração não expressa, a resposta "não" é comercialmente cara.

**Análise de sensibilidade.** Com capacidade de atender pedidos em 35%, os totais viram 5,0 /
7,8 / 7,8 / 8,2 — a Opção D vence. Com risco em 30%, viram 3,8 / 9,0 / 5,7 / 8,3 — a Opção B
vence.

## Decisão

**Configuração declarativa com extensão limitada (Opção D)**, com a fronteira entre as duas
declarada explicitamente e revisada trimestralmente.

```text
configurável pelo cliente
  fluxo de aprovação, etapas, alçadas, prazos
  campos adicionais e sua validação
  regras de compliance por expressão declarativa
  taxonomia e relatórios
  aparência e terminologia

extensível por código, em ambiente isolado
  adaptadores de integração com sistemas do cliente
  cálculos específicos que a expressão não cobre

nunca customizável
  modelo de dados central de contrato
  motor de aprovação
  controle de acesso e trilha de auditoria
  qualquer coisa que afete isolamento entre clientes
```

A terceira lista é a mais importante e foi a mais difícil de negociar. Ela existe porque
customização nessas áreas é o que produziu as 214 condicionais — e porque são justamente as
áreas em que um erro afeta correção, segurança ou isolamento.

**Sob que condição cada opção descartada venceria:**

**Opção A venceria se** houvesse pouquíssimos clientes — dois ou três — e nenhuma expectativa de
crescimento. Com poucas variantes, condicionais são gerenciáveis, e a flexibilidade total tem
valor.

**Opção B pura venceria se** os clientes fossem menores e com menor poder de negociação, como no
case de [SaaS](/21-case-studies/saas-platform.md). Ali, "a configuração não cobre" é uma resposta aceitável; aqui,
custa contrato.

**Opção C venceria se** a Alcance operasse como plataforma para desenvolvedores, com um
ecossistema de parceiros construindo extensões — modelo diferente, com suporte e governança
próprios.

## Componentes

**Núcleo de Contratos.** Modelo de dados e ciclo de vida do contrato. Não customizável.

**Motor de Fluxo.** Interpreta a definição de fluxo do cliente e executa a aprovação. Um motor,
163 definições.

**Serviço de Metadados.** Campos adicionais, validações e taxonomia por cliente.

**Motor de Regras.** Avalia expressões declarativas de compliance.

**Ambiente de Extensão.** Executa código de adaptadores em isolamento, com limites de tempo,
memória e acesso.

**Serviço de Integração.** Conecta os adaptadores aos sistemas do cliente.

**Construtor de Relatórios.** Relatórios definidos pelo cliente sobre a taxonomia dele.

**Serviço de Configuração.** Fonte de verdade de toda a configuração por cliente, versionada.

**Trilha de Auditoria.** Imutável, não customizável.

O **Serviço de Configuração** ser versionado é uma decisão importante: a configuração de um
cliente é tratada como código — tem versão, tem histórico, tem revisão e tem reversão. Um cliente
que altera seu fluxo de aprovação e quebra um processo pode voltar em minutos.

## Dados

**Modelo central.** Fixo e idêntico para todos os clientes.

```text
contrato      (id, cliente_id, tipo, partes, valor, vigencia, estado, ...)
etapa         (id, contrato_id, definicao_etapa_id, estado, prazo, ...)
aprovacao     (id, etapa_id, aprovador_id, decisao, motivo, criada_em)
trilha        (append-only, imutável)
```

**Campos adicionais.** Armazenados em coluna JSON com esquema validado a partir dos metadados do
cliente. Indexados seletivamente: cada cliente declara quais dos seus campos precisam de busca, e
o sistema cria índices de expressão apenas para esses.

Essa seletividade importa: 4.100 campos indexados indiscriminadamente inviabilizariam a escrita.
Na prática, os clientes declaram em média 6 campos pesquisáveis cada.

Fazer o cliente declarar quais campos precisam de busca é uma decisão de desenho que transfere
uma escolha técnica para quem tem a informação. A alternativa — indexar tudo por precaução, ou
tentar inferir pelo uso — foi considerada e descartada: a primeira é cara, e a segunda produz
comportamento imprevisível, com uma busca que funciona hoje e fica lenta amanhã porque o padrão
de uso mudou.

A declaração explícita torna o custo visível e o comportamento estável. E ela vem com um limite,
o que transforma uma decisão técnica silenciosa num item negociável de contrato.

**Definição de fluxo.** Estrutura declarativa versionada, interpretada pelo Motor de Fluxo.

```text
etapas, com condição de entrada e de saída
alçadas por valor, tipo e unidade organizacional
prazos e escalonamento
paralelismo e junção
ações automáticas
```

Um contrato em andamento continua executando a versão de fluxo com que começou. Alterar a
definição não afeta contratos em curso — decisão que evitou uma classe inteira de problemas em
que uma mudança de configuração alterava o processo de aprovações já iniciadas.

**Isolamento.** Um esquema por cliente, com credencial por cliente. Com 40 inquilinos, o custo é
baixo e o isolamento é forte — a decisão que o case de [SaaS](/21-case-studies/saas-platform.md) precisou
graduar, aqui é simples porque são poucos.

## Integração

**Adaptadores de integração.** Cada cliente integra com seus sistemas. Os adaptadores rodam no
Ambiente de Extensão, com contrato bem definido: recebem um evento ou uma solicitação, devolvem
um resultado, dentro de um limite de tempo.

```text
limites do ambiente de extensão
  tempo de execução        5 s
  memória                  256 MB
  acesso de rede           lista de destinos declarada, apenas
  acesso a dados           somente o que é passado como entrada
  bibliotecas              conjunto aprovado
```

O acesso a dados restrito à entrada é a decisão que torna o ambiente seguro: uma extensão não
consulta o banco, não vê outros contratos e não pode acessar outro cliente por construção. Isso
elimina a classe de risco que torna extensões de terceiro perigosas, e o custo é que extensões
que precisariam de mais contexto não são possíveis — o que, na prática, se mostrou raro.

**Falha de adaptador.** Um adaptador que estoura o tempo ou falha não derruba a operação: a
integração é marcada como pendente e repetida, e o usuário é informado. Isso resolve a conversa
difícil de suporte — o produto continua funcionando, e a pendência aponta claramente para a
extensão.

**Diretório corporativo.** Cada cliente usa o seu, com federação de identidade. O produto não
mantém senhas de usuários corporativos.

## Segurança

```text
isolamento          esquema e credencial por cliente; verificação
                    automática de acesso cruzado na esteira
extensões           ambiente isolado, sem acesso a dados além da
                    entrada, com lista de destinos de rede
configuração        versionada, com revisão e trilha; alterações
                    em alçada exigem aprovação de dois usuários
                    do cliente
trilha de auditoria imutável, 10 anos, não customizável
acesso da Alcance   proibido por padrão; suporte requer autorização
                    do cliente, com prazo e escopo
assinatura          integração com o provedor de cada cliente
segregação de
  funções           quem configura o fluxo não aprova contratos
```

A **trilha ser não customizável** foi contestada por três clientes que queriam campos próprios
nela. A resposta registrada: uma trilha de auditoria com estrutura variável por cliente perde a
propriedade que a torna útil — ser comparável, verificável e independente da configuração que ela
audita.

A necessidade real por trás do pedido era outra, e foi atendida de forma diferente: os clientes
queriam correlacionar eventos da trilha com identificadores dos seus próprios sistemas. A solução
foi um campo de correlação opcional, com semântica fixa — um identificador externo — em vez de
campos livres com semântica por cliente.

Essa distinção entre atender ao pedido e atender à necessidade apareceu repetidamente durante o
projeto. Dos 594 pedidos de customização revisados, 118 tinham uma necessidade que uma capacidade
genérica atendia melhor que a customização pedida — e transformá-los em capacidade de produto foi
o que mais reduziu a lista.

## Escalabilidade

Com 1.900 requisições por segundo no pico, o sistema não tem desafio de escala. Ele tem desafio
de **variabilidade de custo de execução**: um fluxo com 3 etapas e um com 24 etapas paralelas têm
custos muito diferentes, e ambos são configuração do cliente.

A resposta é limite por cliente, declarado no contrato:

```text
etapas por fluxo                   máximo 40
profundidade de paralelismo        máximo 8
campos adicionais                  máximo 200
campos pesquisáveis                máximo 15
regras de compliance ativas        máximo 60
execuções de extensão/min          máximo 600
```

Esses limites não existiam antes, e a ausência deles permitia que um cliente configurasse algo
que degradava o sistema. Introduzi-los exigiu negociação — três clientes estavam acima de algum
limite — e produziu um efeito secundário positivo: a conversa sobre limites revelou fluxos com
etapas que ninguém usava havia anos.

## Confiabilidade

Se o **Motor de Fluxo** falha, nenhuma aprovação avança. É o componente com o alvo mais alto.

Se o **Ambiente de Extensão** fica indisponível, integrações ficam pendentes e o produto
continua. Foi projetado para que a falha de código de terceiro nunca seja falha do produto.

Se o **Serviço de Configuração** fica indisponível, o sistema opera com a configuração em cache —
que raramente muda. Alterações de configuração ficam bloqueadas.

Se a **Trilha de Auditoria** falha, as operações que exigem registro são bloqueadas. Falhar
fechado é a escolha correta: uma aprovação sem trilha é um problema de compliance.

Se um **esquema de cliente** falha, apenas aquele cliente é afetado. Com 40 clientes de contrato
alto, cada um tem réplica com promoção automática.

## Observabilidade

```text
por cliente: latência p95, taxa de erro, uso contra limites
execuções de extensão: duração, falhas, tempo esgotado, por cliente
fluxos em execução, por definição e por versão
contratos parados em etapa além do prazo
alterações de configuração, com autor e efeito
tentativas de acesso cruzado bloqueadas
distância de cada cliente até seus limites configurados
```

A métrica de **distância até os limites** é usada comercialmente: um cliente próximo do limite de
campos ou de regras é um candidato a upgrade de plano, e a conversa acontece antes de ele
esbarrar.

E o acompanhamento de **contratos parados além do prazo** é a métrica de produto que os clientes
mais valorizam — ela é a razão pela qual eles compraram a plataforma, e ela só existe porque o
fluxo é declarativo e o sistema sabe qual era o prazo esperado.

## Implantação

Uma versão para todos os clientes, sempre. Implantação contínua, com canary por cliente:
clientes menores primeiro, os três maiores por último, com 24 horas entre ondas.

Configuração é implantada separadamente do código, pelo próprio cliente, com validação prévia e
possibilidade de reversão.

A separação entre implantação de código e de configuração é o que muda a relação com o cliente:
71% das alterações passaram a ser feitas pelo próprio cliente, sem fila e sem a Alcance no
caminho. Isso reduziu a demanda sobre a equipe e, mais importante, reduziu o tempo entre a
necessidade do cliente e a mudança — que era a origem da pressão por customização em código.

Extensões têm ciclo próprio: o cliente ou a consultoria publica, a Alcance valida contra o
contrato do ambiente de extensão, e a publicação é registrada.

## Estratégia de Evolução

A migração de 40 clientes com 594 customizações em código foi o projeto, e a ordem foi definida
por um critério: **quantos clientes uma capacidade de configuração destrava**.

**Fase 1 (meses 1–7): motor de fluxo declarativo.** A capacidade que sozinha absorve 61% das
condicionais existentes. Os fluxos dos 40 clientes foram modelados como configuração e
comparados, em paralelo, com o comportamento do código — por três meses, sobre tráfego real.

A comparação encontrou 27 divergências, das quais 19 eram comportamentos não documentados do
código antigo e 8 eram erros de modelagem da configuração. Os 19 foram levados aos clientes, e
em 11 casos o cliente confirmou que o comportamento antigo estava errado e ninguém tinha notado.

**Fase 2 (meses 6–12): metadados e campos adicionais.** Absorve mais 18% das condicionais.

**Fase 3 (meses 11–17): motor de regras.** Compliance declarativo, mais 9%.

**Fase 4 (meses 15–22): ambiente de extensão.** Para o que sobrou — integrações e cálculos
específicos, cerca de 8% das condicionais.

**Fase 5 (meses 20–28): unificação de versão.** Com as customizações fora do código, os 17
clientes em versões antigas são atualizados. É a fase que entrega o objetivo do projeto.

**Os 4% restantes.** Vinte e quatro customizações não couberam em nenhum mecanismo. Cada uma foi
negociada individualmente: 14 foram abandonadas pelo cliente ao descobrir que ninguém usava, 7
foram atendidas por uma capacidade nova do produto — disponível para todos — e 3 permanecem como
condicionais, com prazo de remoção registrado e revisão anual.

**Condições que mudariam o plano:**

```text
se algum cliente recusar a remoção de customização crítica
  → negociação comercial; o custo de manter está estimado
    em R$ 340 mil/ano por condicional

se o número de clientes passar de ~150
  → o esquema por cliente precisa ser reavaliado, e o modelo
    se aproxima do case de SaaS

se extensões passarem a representar mais de 20% do tempo
  de execução
  → o ambiente de extensão precisa de isolamento mais forte
    e de cobrança por consumo

se um setor regulado exigir customização no núcleo
  → a lista de "nunca customizável" é reaberta, com análise
    de risco explícita
```

## Resultados

Números ao fim da Fase 5, 28 meses após o início:

```text
clientes na versão corrente             de 57% para 100%
tempo entre correção e produção         de 11 semanas para 4 dias
condicionais de cliente no código       de 594 para 3
esforço em manutenção                   de 73% para 34%
defeitos reintroduzidos por regressão   de 34% para 6%
tempo de onboarding de cliente novo     de ~7 meses para 5 semanas
fluxos configurados pelos próprios
  clientes, sem a Alcance                71% das alterações
receita de clientes novos no período    +R$ 26 mi (onboarding
                                        deixou de ser gargalo comercial)
```

O último número é o resultado que a diretoria considera decisivo: o onboarding de sete meses
limitava quantos clientes a Alcance conseguia adicionar por ano, independentemente da demanda.
Reduzi-lo a cinco semanas destravou o crescimento.

Vale registrar também o que não melhorou. A satisfação declarada dos três maiores clientes caiu
no primeiro ano do projeto, e a causa foi identificada: eles perderam a capacidade de pedir
qualquer coisa e receber. Passaram a ouvir "isso não é configurável, e vamos avaliar como
capacidade de produto para o próximo trimestre" — que é uma resposta melhor para a Alcance e pior
para eles.

A recuperação veio no segundo ano, quando o tempo entre pedido e entrega de capacidade nova caiu
de meses para semanas, e a percepção mudou de "perdemos privilégio" para "recebemos mais rápido".
O período intermediário foi desconfortável e era previsível — e ter previsto isso no plano, com
acompanhamento comercial dedicado aos três, foi o que evitou perder algum deles.

## O que este case ensina

**Customização precisa de um lugar que não seja o código.** Condicionais de cliente são a forma
mais cara possível de variabilidade: elas multiplicam o custo de toda correção pelo número de
variantes, e produzem versões divergentes inevitavelmente.

**A fronteira do que não se customiza é a decisão.** Modelo central, motor de aprovação, controle
de acesso e trilha ficaram fora, e essa lista curta é o que preservou a correção do produto.
Negociá-la foi mais difícil que implementar tudo o mais.

**Comparar configuração e código em paralelo documenta o passado.** As 27 divergências
encontradas incluíam 19 comportamentos que ninguém sabia que existiam, e 11 deles estavam
errados havia anos. O mesmo padrão dos cases de [banking](/21-case-studies/banking.md) e
[rede social](/21-case-studies/social-network.md).

**Limites explícitos são uma capacidade, não uma restrição.** Introduzir limites por cliente
tornou o custo previsível, virou instrumento comercial, e revelou configurações que ninguém
usava.

## Conceitos Relacionados

- [Case: Plataforma SaaS](/21-case-studies/saas-platform.md) — o mesmo problema com muitos clientes pequenos.
- [Case: Modernização de Legado](/21-case-studies/legacy-modernization-case.md).
- [Simplicidade vs. Flexibilidade](/20-trade-offs/simplicity-vs-flexibility.md).
- [Funções de Aptidão](/19-architecture-governance/fitness-functions-governance.md).

## Exercício Prático

Liste as customizações por cliente do seu produto e classifique cada uma em: expressável por
configuração, expressável por extensão isolada, ou exige mudar o núcleo.

A terceira lista é a que define o limite negociável. Se ela for grande, o produto não tem um
modelo de variabilidade — tem 40 produtos.

## Perguntas de Entrevista

- Por que condicionais de cliente produzem versões divergentes inevitavelmente?
- Por que a trilha de auditoria não deve ser customizável?
- Por que um contrato em andamento continua executando a versão antiga da definição de fluxo?

## Para Aprofundar

- Fowler, Martin. *Domain-Specific Languages*. Addison-Wesley, 2010.
- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.
