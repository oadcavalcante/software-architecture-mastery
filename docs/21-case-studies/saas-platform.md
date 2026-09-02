---
id: saas-platform
title: "Case: Plataforma SaaS"
sidebar_position: 11
description: Produto de gestão para 14 mil empresas, onde a decisão é quanto isolar cada cliente e quanto compartilhar.
doc_type: case-study
level: 0
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor escolhe o modelo de isolamento de inquilinos por custo, ruído e
  requisito de cliente, e sabe por que a resposta costuma ser mista.
prerequisites: [trade-offs]
related: [multi-tenant-enterprise, ecommerce, healthcare]
canonical_for: []
content_version: 5
last_reviewed: 2026-08-29
---

# Case: Plataforma SaaS

:::note Como usar este case

Leia contexto, requisitos e restrições. **Pare antes das opções de arquitetura** e esboce a sua
em vinte minutos.

Os números deste case são **ilustrativos**: plausíveis e internamente
coerentes, não medidos num sistema nomeado. O que se aprende é o raciocínio que eles
sustentam, não as grandezas.

:::

## Contexto de Negócio

A **Fluxa** é uma plataforma de gestão financeira e fiscal para pequenas e médias empresas
brasileiras. Tem 14.200 empresas clientes, distribuídas em três planos, e receita recorrente
anual de R$ 180 milhões.

A distribuição de clientes é fortemente desigual, e isso decide a arquitetura:

```text
plano       clientes   % da receita   volume médio de dados
Essencial     11 400        31%       ~40 MB
Avançado       2 600        44%       ~600 MB
Corporativo      200        25%       ~28 GB
```

Duzentos clientes respondem por um quarto da receita, e cada um deles tem 700 vezes mais dados
que a média do plano de entrada. Uma arquitetura única para os três é errada em pelo menos duas
das três faixas.

Três pressões motivam a revisão:

**Ruído entre inquilinos.** Um cliente do plano Corporativo executando um fechamento fiscal
degrada a latência de todos os demais que compartilham a mesma instância de banco. Isso ocorre
entre 6 e 11 vezes por mês, e é a principal causa de reclamação dos clientes menores.

**Exigências de isolamento.** Oito clientes Corporativos exigem, por política interna ou por
requisito de auditoria, que seus dados não compartilhem infraestrutura com outros clientes.
Hoje a Fluxa perde negócios por não atender.

**Custo por cliente.** O custo de infraestrutura por cliente do plano Essencial é de R$ 41 por
mês, contra uma mensalidade de R$ 149. A margem é apertada, e a diretoria quer reduzir esse
custo em 50%.

## Requisitos Funcionais

Para a **empresa cliente**: gerenciar lançamentos financeiros, contas a pagar e receber,
conciliação bancária e emissão de documentos fiscais; importar extratos e arquivos; e extrair
relatórios.

Para o **contador**, que atende várias empresas: alternar entre clientes sem sair da sessão;
executar rotinas em lote sobre vários clientes; e acompanhar pendências consolidadas.

Para a **Fluxa**: provisionar um cliente novo em minutos; migrar um cliente entre planos e entre
modelos de isolamento sem interrupção; medir consumo por cliente; e aplicar atualizações a todos
sem janela de indisponibilidade.

O requisito do contador é o mais restritivo do conjunto e o mais fácil de esquecer: ele exige
consulta que atravessa inquilinos, o que qualquer modelo de isolamento forte dificulta.

## Requisitos Não-Funcionais

```text
p95 de operação interativa               < 500 ms
p95 de relatório                         < 4 s
disponibilidade                          99,9%
ruído entre inquilinos                   nenhum cliente pode degradar outro
tempo de provisionamento de cliente novo < 5 min
tempo de migração entre modelos          < 4 h, com no máximo 15 min de
                                         indisponibilidade daquele cliente
isolamento de dados                      nenhum vazamento entre inquilinos,
                                         verificado automaticamente
custo por cliente Essencial              redução de 50%
retenção fiscal                          5 anos
RPO por cliente                          < 5 min
```

O requisito de "nenhum vazamento entre inquilinos, verificado automaticamente" é o mais
importante do sistema. Um vazamento de dado fiscal entre empresas é um incidente que encerra a
confiança no produto.

## Restrições

```text
regulatório     documentos fiscais com validade jurídica; retenção
                de 5 anos; integração obrigatória com órgãos fiscais
contadores      3 400 escritórios contábeis atendem múltiplos clientes
                e representam 61% das contas
picos fiscais   os dias 5, 15 e 20 de cada mês concentram 34% do
                volume mensal; o fechamento anual concentra mais
equipe          54 engenheiros; 9 na plataforma
migração        14 200 clientes em produção; qualquer mudança de
                modelo precisa ser feita cliente a cliente,
                sem interrupção percebida
custo           a meta de -50% no plano de entrada é de diretoria
```

A restrição dos contadores é a que mais tensiona o isolamento: 61% das contas são acessadas por
alguém que precisa de visão consolidada de vários inquilinos.

Essa tensão é estrutural e aparece em quase todo produto vendido para pequenas empresas no
Brasil: o comprador é a empresa, o usuário mais frequente é o contador dela, e o contador atende
dezenas de empresas. Um modelo de isolamento que trate cada empresa como uma ilha atende
perfeitamente ao requisito de segurança e destrói a experiência de quem mais usa o produto.

Ignorar esse requisito ao escolher o modelo de isolamento é o erro que produz uma arquitetura
tecnicamente correta e comercialmente inviável — e ele é fácil de cometer, porque o contador não
é o cliente pagante e raramente aparece na lista de interessados.

## Estimativas de Capacidade

```text
clientes                          14 200
usuários ativos diários           ~38 000
requisições/dia                   ~74 milhões
requisições/s, média              ~860
pico (dias 5, 15 e 20, 10h-12h)   ~5 400/s
com margem                        ~11 000/s

lançamentos financeiros/dia       ~9,1 milhões
documentos fiscais emitidos/dia   ~2,4 milhões
```

O volume agregado é modesto. O que não é modesto é a **variância entre inquilinos**:

```text
requisições/s de um cliente Essencial, pico    ~0,04
de um cliente Avançado, pico                   ~0,8
de um cliente Corporativo, pico                ~120
```

Um cliente Corporativo em fechamento gera três mil vezes a carga de um cliente Essencial. Essa
razão é o problema — não o total.

Vale explicitar por que a razão importa mais que a soma. Se o sistema fosse dimensionado pela
carga total, ele teria capacidade de sobra: 860 requisições por segundo em média são triviais. O
que quebra é a concentração — 120 requisições por segundo vindas de um único inquilino, contra
uma instância dimensionada para a média dos seus vizinhos, satura recursos compartilhados que
não têm como distinguir de quem é a carga.

Esse é o mecanismo do ruído entre inquilinos, e ele não é resolvido adicionando capacidade: a
capacidade adicional beneficia todos igualmente, e o inquilino ruidoso continua consumindo
desproporcionalmente. A solução é isolar recursos, não aumentá-los.

```text
armazenamento
  dados de clientes Essencial     ~460 GB
  Avançado                        ~1,6 TB
  Corporativo                     ~5,6 TB
  documentos fiscais, 5 anos      ~14 TB
```

## Opções de Arquitetura

O eixo é **quanto isolar cada inquilino**.

### Opção A — Compartilhado, um banco e um esquema

Todos os clientes na mesma estrutura, separados por uma coluna de inquilino.

```text
custo por cliente     mínimo — recursos totalmente compartilhados
provisionamento       instantâneo — uma linha
ruído                 máximo — é o problema atual
isolamento            depende inteiramente do código; um erro
                      de filtro vaza dados
migração de cliente   difícil — extrair um cliente exige varrer tudo
```

É a arquitetura atual.

### Opção B — Compartilhado com esquema por inquilino

Mesmo banco, um esquema por cliente.

```text
custo por cliente     baixo
isolamento            melhor — o esquema é a fronteira, e um erro
                      de conexão não vaza
ruído                 ainda existe — recursos do banco são compartilhados
migração              mais simples — exportar um esquema
limite prático        milhares de esquemas por instância degradam
                      o catálogo do banco
```

### Opção C — Isolado, um banco por inquilino

Cada cliente com sua própria instância ou seu próprio banco.

```text
custo por cliente     alto — inviável para 11 400 clientes de R$ 149
isolamento            máximo
ruído                 nenhum
migração              trivial
operação              14 200 bancos a manter, atualizar e monitorar
```

### Opção D — Híbrida por plano

Compartilhado com esquema por inquilino para Essencial e Avançado; banco dedicado para
Corporativo e para quem exigir isolamento.

```text
custo                 baixo onde a margem é apertada, alto onde há
                      receita que o justifica
ruído                 eliminado onde ele é causado
isolamento            atende às exigências dos 8 clientes
complexidade          duas topologias a manter
migração              o mecanismo de migração entre modelos vira
                      um recurso de produto, não um projeto
```

## Análise de Trade-offs

| Critério | Peso | A — Um esquema | B — Esquema/inquilino | C — Banco/inquilino | D — Híbrida |
|---|:-:|:-:|:-:|:-:|:-:|
| Isolamento e risco de vazamento | 25% | 3 | 7 | 10 | 9 |
| Eliminação de ruído | 25% | 1 | 4 | 10 | 9 |
| Custo por cliente | 20% | 10 | 9 | 2 | 8 |
| Complexidade operacional | 15% | 9 | 7 | 2 | 5 |
| Atendimento a exigência de cliente | 10% | 1 | 3 | 10 | 10 |
| Consulta entre inquilinos (contador) | 5% | 10 | 7 | 3 | 6 |
| **Total ponderado** | | **5,0** | **6,3** | **6,9** | **8,2** |

**Análise de sensibilidade**, redistribuindo o peso restante proporcionalmente entre os demais critérios. Com custo em 40%, os totais viram
6,2 / 6,9 / 5,6 / 8,1 — a Opção D mantém a vantagem. Com isolamento em 45%, viram
4,4 / 6,5 / 7,7 / 8,4. Nenhum cenário testado inverte, o que é esperado de uma opção construída para aplicar cada modelo onde ele é adequado.

## Decisão

**Híbrida por plano (Opção D)**, com o modelo de isolamento como atributo do cliente, e não como
propriedade da arquitetura.

```text
Essencial e Avançado    esquema por inquilino, em instâncias
                        compartilhadas com limite de recursos
Corporativo             banco dedicado
qualquer plano, sob
  exigência contratual  banco dedicado, com preço diferenciado
```

A decisão que torna isso sustentável é que **a aplicação não sabe qual modelo o cliente usa**.
Ela obtém uma conexão do serviço de roteamento de inquilino, e o roteamento decide se aquela
conexão aponta para um esquema compartilhado ou para um banco dedicado.

Isso transforma a migração entre modelos numa operação de infraestrutura, e não numa mudança de
aplicação — o que é o que permite oferecer isolamento como item de contrato.

**Sob que condição cada opção descartada venceria:**

**Opção A venceria se** a variância entre inquilinos fosse pequena. Em produtos onde todos os
clientes têm porte semelhante, o esquema único é mais simples e mais barato, e o ruído não
aparece.

**Opção B venceria se** não houvesse clientes com exigência contratual de isolamento nem
clientes com carga capaz de saturar uma instância. É o modelo correto para a faixa de baixo e
médio porte — e é exatamente o que a Opção D usa para eles.

**Opção C venceria se** o preço médio por cliente fosse alto o bastante para absorver o custo de
um banco dedicado. Acima de aproximadamente R$ 2.000 por mês por cliente, a conta fecha, e a
simplicidade de um modelo único compensa.

## Componentes

**Roteador de Inquilino.** Resolve, para cada requisição, qual conexão de banco usar. É o
componente central do desenho e o único que conhece a topologia.

**Aplicação.** Sem consciência de multi-inquilino além do contexto atual. Recebe a conexão e
opera.

**Provisionador.** Cria um inquilino novo: esquema ou banco, estrutura, dados iniciais,
credenciais.

**Migrador de Inquilino.** Move um cliente entre modelos, com corte curto.

**Aplicador de Migrações.** Aplica mudanças de esquema a todos os inquilinos, em ondas.

**Medidor de Consumo.** Mede uso por inquilino, para faturamento e para detectar quem está
saturando recursos.

**Serviço de Contador.** Consulta consolidada entre inquilinos, com autorização própria.

**Emissor Fiscal.** Integração com órgãos fiscais, compartilhado entre inquilinos.

O **Serviço de Contador** é o que resolve a tensão entre isolamento e consulta consolidada. Ele
não consulta os bancos dos inquilinos diretamente: consome um agregado publicado por cada
inquilino, contendo apenas o que o contador precisa ver — pendências, prazos, situação fiscal.

Isso mantém o isolamento intacto e resolve o requisito, ao custo de uma janela de defasagem de
poucos minutos, que a área de produto validou como aceitável.

A validação foi feita com contadores reais, e o resultado surpreendeu: a defasagem não incomodava,
mas a **ausência de indicação de defasagem** incomodava muito. Um contador que vê uma pendência
consolidada e entra na empresa para resolvê-la, descobrindo que já foi resolvida, perde confiança
no painel inteiro.

A solução foi exibir o horário da última consolidação junto ao agregado. É uma linha de interface
que custou minutos e resolveu a objeção que teria derrubado o desenho — e é um lembrete de que
consistência eventual é aceitável quando é comunicada, e irritante quando é escondida.

## Dados

**Roteamento de inquilino.**

```text
inquilino  (id, nome, plano, modelo_isolamento, cluster, esquema_ou_banco,
            estado, criado_em)
```

Essa tabela é a fonte de verdade da topologia, e é consultada com cache agressivo — a topologia
de um inquilino muda raramente, e uma mudança invalida a entrada.

**Estrutura por inquilino.** Idêntica em todos os modelos. É a propriedade que permite migrar
entre eles: um esquema compartilhado e um banco dedicado têm exatamente as mesmas tabelas.

Manter essa identidade exige disciplina — a tentação de otimizar a estrutura para clientes
grandes aparece, e cedê-la quebraria a migração. A regra é que otimizações para grandes volumes
são índices e particionamento, nunca diferenças de esquema.

**Particionamento por inquilino em clientes Corporativos.** Dentro do banco dedicado, as tabelas
de lançamento são particionadas por período, o que torna o fechamento anual — a operação que
saturava a instância compartilhada — uma varredura de partição.

**Documentos fiscais.** Armazenamento de objetos, com chave prefixada pelo inquilino e política
de acesso que impede leitura cruzada no nível do armazenamento, não apenas no da aplicação.

Essa é uma decisão de defesa em profundidade: mesmo que a aplicação tenha um defeito de filtro,
a credencial usada para um inquilino não consegue ler os objetos de outro.

## Integração

**Roteamento.** A cada requisição autenticada, o Roteador resolve o inquilino a partir do
contexto — subdomínio, token ou seleção explícita do contador — e obtém a conexão apropriada de
um conjunto por destino.

O conjunto de conexões é o ponto de atenção operacional: com esquema por inquilino, uma conexão
serve a qualquer esquema do mesmo banco, e o roteamento apenas ajusta o caminho de busca. Com
banco dedicado, cada destino tem seu próprio conjunto, e o número total de conexões cresce com o
número de clientes isolados.

**Aplicação de migrações de esquema.** O ponto mais delicado da operação com 14 mil inquilinos.
Uma mudança de estrutura precisa ser aplicada a todos, e aplicar 14 mil migrações de uma vez é
inviável.

```text
1. a migração precisa ser compatível com a versão anterior do código
2. é aplicada em ondas: 1%, 10%, 50%, 100%
3. a aplicação funciona com inquilinos migrados e não migrados
4. só depois de 100% o código passa a depender da mudança
```

Essa disciplina de três etapas — compatível, aplicar, depender — é o que permite migrar sem
janela. Ela é verificada automaticamente: uma migração que remove ou renomeia coluna na mesma
versão do código é rejeitada pela esteira.

**Migração entre modelos.** Um cliente do plano Avançado que vira Corporativo, ou que passa a
exigir isolamento, é migrado com o procedimento: cópia inicial, replicação incremental, corte
curto com o inquilino em modo somente leitura, verificação e virada do roteamento.

O corte medido é de 4 a 11 minutos, dentro do requisito de 15.

**Emissão fiscal.** Compartilhada, com fila por inquilino para impedir que um cliente emitindo em
volume atrase os demais — o mesmo problema de ruído, resolvido no nível da fila em vez do banco.

## Segurança

```text
isolamento de dados      credencial por inquilino no nível do banco
                         e do armazenamento de objetos
verificação automática   teste que tenta ler dado de outro inquilino
                         com a credencial de um; falha a esteira
                         se conseguir
acesso da Fluxa aos
  dados do cliente       proibido por padrão; suporte exige autorização
                         do cliente, com prazo e registro
credenciais              rotacionadas automaticamente, por inquilino
documentos fiscais       assinados, imutáveis, com trilha
contadores               autorização explícita por empresa, revogável
                         pelo cliente a qualquer momento
```

A **verificação automática de isolamento** é o controle mais valioso do sistema. Um teste da
esteira assume a credencial do inquilino A e tenta ler dados do inquilino B, por várias vias:
consulta direta, relatório, exportação, interface de programação. Se qualquer uma conseguir, a
construção falha.

Esse teste encontrou 4 defeitos reais nos primeiros 18 meses, dos quais 2 eram vazamentos que
teriam chegado à produção. Ver
[funções de aptidão](/19-architecture-governance/fitness-functions-governance.md).

## Escalabilidade

O sistema escala por **agrupamento de inquilinos**. Cada instância compartilhada hospeda um
número limitado de esquemas, com o limite definido pela degradação do catálogo do banco e pela
capacidade de recursos.

```text
esquemas por instância, limite operacional    ~1 200
instâncias compartilhadas                     14
bancos dedicados                              208
```

Novos clientes são alocados na instância com mais folga, medida por consumo real e não por
contagem. Um cliente que cresce e passa a consumir desproporcionalmente é movido — o Medidor de
Consumo dispara a recomendação, e a migração é o mesmo procedimento usado para mudança de plano.

Essa capacidade de **rebalancear inquilinos entre instâncias** é o que resolve o ruído sem
isolar todo mundo: quando um cliente incomoda os vizinhos, ele muda de vizinhança.

O pico dos dias 5, 15 e 20 é previsível e concentrado. A capacidade é elevada por agendamento.

## Confiabilidade

Se uma **instância compartilhada** falha, os clientes daquela instância ficam indisponíveis e os
demais não percebem. É a propriedade mais valiosa do particionamento por instância: a falha tem
raio conhecido e limitado.

Se um **banco dedicado** falha, um cliente fica indisponível. São os 208 clientes com maior
receita, e por isso eles têm réplica com promoção automática, o que os outros não têm.

Se o **Roteador de Inquilino** fica indisponível, nada funciona. É o componente com o alvo mais
alto, e ele é deliberadamente simples: uma consulta com cache e nenhuma lógica de negócio.

Se o **Emissor Fiscal** falha, a emissão fica pendente e o restante do produto funciona. O prazo
fiscal dá folga de horas.

Se o **Serviço de Contador** falha, os clientes individuais não são afetados; contadores perdem
a visão consolidada.

**RPO por cliente < 5 min** é atendido por cópia de segurança contínua com recuperação em ponto
no tempo, por instância e por banco dedicado. Restaurar um único inquilino de uma instância
compartilhada é o caso difícil, e o procedimento — restaurar para uma instância temporária e
extrair o esquema — é ensaiado trimestralmente.

## Observabilidade

```text
consumo por inquilino: requisições, tempo de CPU no banco,
  armazenamento, emissões fiscais
latência p95 por inquilino e por instância
inquilinos com consumo acima do percentil 95 da sua instância
ruído detectado: correlação entre pico de um inquilino e
  latência dos vizinhos
esquemas por instância, e distância do limite
progresso de aplicação de migrações, por onda
tentativas de acesso cruzado bloqueadas
```

A métrica de **ruído detectado** é a que fecha o ciclo do problema original: ela correlaciona
picos de um inquilino com degradação dos vizinhos, e dispara a recomendação de rebalanceamento
antes que a reclamação chegue.

A medição de consumo por inquilino tem duplo uso: operação e faturamento. Ela permitiu à Fluxa
introduzir um plano por consumo, que não existia porque a informação não existia.

## Implantação

Uma versão da aplicação serve todos os inquilinos, sempre. Não há versão por cliente — essa foi
uma decisão explícita e defendida contra pedidos comerciais, porque manter versões divergentes
multiplicaria o custo de manutenção pelo número de variantes.

Personalização é feita por configuração e por sinalizador de funcionalidade por inquilino, nunca
por código.

Essa regra foi testada quatro vezes em dois anos, sempre por pedido comercial de um cliente
Corporativo grande. Em todas, a resposta foi a mesma e o argumento registrado também: uma versão
divergente para um cliente significa que toda correção, toda atualização de segurança e toda
migração de esquema passam a ter duas variantes — e a segunda é sempre a que fica para trás.

Em dois dos quatro casos, a necessidade foi atendida por sinalizador de funcionalidade. Nos
outros dois, o pedido era de comportamento incompatível com o produto, e a resposta foi não. Um
dos dois clientes saiu; a decisão foi mantida, e está registrada em ADR com o custo estimado da
alternativa.

Implantação canary por instância: uma instância compartilhada recebe a versão nova, é observada
por 24 horas, e as demais seguem. Bancos dedicados de clientes Corporativos recebem por último.

## Estratégia de Evolução

**Fase 1 (meses 1–4): esquema por inquilino.** Migração do modelo de coluna de inquilino para
esquema por inquilino, cliente a cliente, sem interrupção.

Esta fase é a que reduz o risco de vazamento, e foi priorizada por isso — não pelo desempenho.

**Fase 2 (meses 3–7): roteador e provisionamento.** Roteador de Inquilino, provisionamento
automático e a estrutura que torna o modelo de isolamento um atributo do cliente.

**Fase 3 (meses 6–11): bancos dedicados para Corporativo.** Migração dos 200 maiores clientes,
que elimina a maior parte do ruído.

Resultado medido: incidentes de degradação por ruído caíram de 8,4 por mês para 0,6.

**Fase 4 (meses 10–15): rebalanceamento automático.** Detecção de inquilino ruidoso e
recomendação de movimentação.

**Fase 5 (meses 14–20): otimização de custo do plano Essencial.** Densidade maior por instância,
armazenamento hierárquico para dados antigos, e dimensionamento por consumo real.

**Condições que mudariam o plano:**

```text
se a proporção de clientes Corporativos passar de ~8%
  → o custo de bancos dedicados cresce e vale reavaliar
    instâncias compartilhadas de alta capacidade para eles

se algum cliente Essencial passar consistentemente do
  percentil 99 de consumo
  → ele é promovido a instância própria, independentemente
    do plano comercial

se a regulação exigir residência de dado por estado
  → o roteamento ganha uma dimensão geográfica

se o limite prático de esquemas por instância cair com
  uma versão nova do banco
  → a densidade precisa ser revista antes da atualização
```

## Resultados

Números ao fim da Fase 4, 15 meses após o início:

```text
incidentes de ruído entre inquilinos     de 8,4/mês para 0,4/mês
p95 de operação interativa               de 780 ms para 340 ms
clientes com isolamento contratual       de 0 para 23 (8 exigiam,
                                         15 contrataram como diferencial)
receita atribuível a isolamento          R$ 11,2 mi/ano
custo por cliente Essencial              de R$ 41 para R$ 23 (meta era R$ 20)
tempo de provisionamento                 de 3 dias para 4 min
tentativas de acesso cruzado detectadas
  em teste automatizado                  4 defeitos, 2 bloqueados antes
                                         da produção
```

O item mais interessante é comercial: 15 clientes contrataram isolamento como diferencial sem
que houvesse exigência de auditoria. A capacidade construída para atender 8 clientes virou um
produto.

Esse desfecho não estava previsto e vale registrar o mecanismo: uma vez que o isolamento passou a
ser um atributo configurável do cliente, oferecê-lo deixou de ter custo de projeto e passou a ter
apenas custo de infraestrutura. A área comercial pôde precificá-lo, e a demanda existia — ela
apenas nunca tinha sido consultada, porque a resposta anterior seria "não é possível".

## O que este case ensina

**A variância entre inquilinos decide o modelo.** Não é o número de clientes nem o volume total —
é a razão entre o maior e o menor. Três mil vezes de diferença torna qualquer modelo uniforme
errado.

**O isolamento deve ser atributo do cliente.** Quando a aplicação não sabe qual modelo o cliente
usa, migrar entre modelos vira operação de infraestrutura — e isolamento vira item de contrato,
com preço.

**Verificar isolamento automaticamente é o controle de maior valor.** Um teste que tenta vazar
dado e falha a esteira quando consegue encontrou dois vazamentos antes da produção. Nenhuma
revisão de código teria a mesma taxa de detecção.

**Migração de esquema em três etapas é o que permite operar sem janela.** Compatível, aplicar,
depender — nessa ordem, verificada na esteira. Com 14 mil inquilinos, qualquer outra abordagem
exige parada.

## Conceitos Relacionados

- [Case: Corporativo Multi-inquilino](/21-case-studies/multi-tenant-enterprise.md) — o mesmo problema em outra
  escala.
- [Funções de Aptidão](/19-architecture-governance/fitness-functions-governance.md).
- [SQL vs. NoSQL](/20-trade-offs/sql-vs-nosql.md).
- [Case: E-commerce Omnicanal](/21-case-studies/ecommerce.md).

## Exercício Prático

Calcule o custo mensal de infraestrutura para 11.400 clientes em três modelos: esquema único,
esquema por inquilino em instâncias de 1.200 esquemas, e banco dedicado.

Compare com a mensalidade de R$ 149. Um dos três é obviamente inviável, e o exercício mostra por
quê.

## Perguntas de Entrevista

- Por que a razão entre o maior e o menor inquilino importa mais que o total?
- Por que a aplicação não deve saber qual modelo de isolamento o cliente usa?
- Por que uma migração de esquema precisa ser compatível antes de ser aplicada?

## Para Aprofundar

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Fowler, Martin. *Multi-Tenancy Patterns*. martinfowler.com.
- Nygard, Michael. *Release It!*. 2ª ed. Pragmatic Bookshelf, 2018.
