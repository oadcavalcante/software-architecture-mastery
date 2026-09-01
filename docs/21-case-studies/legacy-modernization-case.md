---
id: legacy-modernization-case
title: "Case: Modernização de Legado"
sidebar_position: 13
description: Sistema previdenciário de 34 anos em mainframe, com 190 milhões de linhas de COBOL e nenhuma janela para parar.
doc_type: case-study
level: 0
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor conduz uma modernização de sistema crítico sem virada de chave, com
  equivalência comprovada e regras de negócio recuperadas do código.
prerequisites: [trade-offs]
related: [healthcare, banking, multi-tenant-enterprise]
canonical_for: []
content_version: 3
last_reviewed: 2026-08-29
---

# Case: Modernização de Legado

:::note Como usar este case

Leia contexto, requisitos e restrições. **Pare antes das opções de arquitetura** e esboce a sua
em vinte minutos.

Os números deste case são **ilustrativos** (SPEC.md §8.2): plausíveis e internamente
coerentes, não medidos num sistema nomeado. O que se aprende é o raciocínio que eles
sustentam, não as grandezas.

:::

## Contexto de Negócio

O **Instituto Previdencial** administra a previdência complementar de 41 entes públicos
estaduais e municipais — um fundo com 2,9 milhões de participantes e R$ 84 bilhões sob gestão.

O sistema de benefícios roda em mainframe desde 1991. Ele calcula, concede e paga 890 mil
benefícios mensais, e nunca falhou de forma catastrófica em 34 anos.

Isso precisa ser dito primeiro, porque define o tom da análise: **o sistema legado funciona**. A
modernização não é motivada por falha, e uma proposta que o trate como problema técnico a ser
eliminado vai fracassar.

As pressões são outras:

**Conhecimento.** Restam 9 pessoas capazes de alterar o sistema. A média de idade é 58 anos, e
seis se aposentam nos próximos quatro anos. Não há reposição no mercado, e a formação interna de
um profissional leva de 2 a 3 anos.

**Custo.** O licenciamento do mainframe e do software de base custa R$ 62 milhões por ano, com
reajustes acima da inflação.

**Velocidade.** Uma mudança de regra previdenciária — que ocorre por lei, com prazo — leva de 8
a 14 meses para entrar em produção. Duas mudanças legais dos últimos cinco anos entraram fora do
prazo, com consequência jurídica.

```text
linhas de COBOL                       ~190 milhões
programas                             ~41 000
tabelas e arquivos                    ~3 800
regras de cálculo identificadas       desconhecido — a estimativa
                                      varia entre 4 000 e 11 000
documentação                          desatualizada desde ~2004
testes automatizados                  nenhum
```

A linha "regras de cálculo identificadas: desconhecido" é o problema real do projeto.

Vale explicar por que a estimativa varia tanto. As regras não estão organizadas: uma condição de
elegibilidade pode estar espalhada por quatro programas, expressa como comparações sobre campos
com nomes de seis caracteres, e depender de um valor gravado em um arquivo por um processo
executado em 1997. Contar regras exigiria entender o código, e entender o código é o próprio
projeto.

Essa circularidade — para planejar é preciso saber o escopo, e para saber o escopo é preciso
executar — é a característica que define modernização de legado antigo. Qualquer método que
pressuponha escopo conhecido no início está resolvendo um problema diferente.

## Requisitos Funcionais

O sistema precisa continuar fazendo o que faz, sem exceção: cadastrar participantes e
dependentes; registrar contribuições e tempo de serviço; simular benefício; conceder benefício
conforme a regra vigente na data do requerimento; calcular e pagar a folha mensal de 890 mil
benefícios; processar reajustes, pensões, revisões judiciais e acertos retroativos; e reportar
aos órgãos de controle.

O requisito mais difícil está numa palavra: **"conforme a regra vigente na data do
requerimento"**. Trinta e quatro anos de mudanças legislativas significam que o sistema aplica
dezenas de conjuntos de regras diferentes conforme quando a pessoa entrou, quando pediu e a qual
regime pertence. Nenhum deles pode ser perdido.

## Requisitos Não-Funcionais

```text
disponibilidade do cálculo de folha     100% na janela mensal
                                        (a folha não pode atrasar)
disponibilidade da consulta             99,9%
equivalência com o legado               100% — nenhuma diferença de
                                        centavo em nenhum benefício
janela de processamento da folha        < 6 h (hoje: 4h20)
tempo de mudança de regra legal         < 8 semanas (hoje: 8-14 meses)
RPO                                     0
retenção                                permanente — benefício
                                        previdenciário não expira
auditabilidade                          todo cálculo reproduzível,
                                        com as regras aplicadas
```

O requisito de equivalência absoluta é o que domina o projeto. Uma diferença de um centavo em um
benefício é um erro que gera processo judicial, e 890 mil benefícios mensais significam que
qualquer taxa de erro produz volume.

Uma taxa de erro de 0,01% — que seria excelente em quase qualquer sistema — produziria 89
benefícios incorretos por mês, mais de mil por ano. Cada um é uma pessoa idosa recebendo menos
do que tem direito, ou mais do que deveria com cobrança posterior. Nenhuma das duas é aceitável.

Essa aritmética é o que justifica o critério de zero divergências por três meses, que parece
excessivo quando lido isoladamente. Ele não é conservadorismo — é a consequência direta do volume
multiplicado pela gravidade individual.

## Restrições

```text
sem janela        a folha roda todo mês; não há período em que
                  o sistema possa parar
conhecimento      9 pessoas, 6 se aposentando em 4 anos
regras            não existem escritas em lugar nenhum além do código
orçamento         público, anual, sujeito a contingenciamento
prazo político    a diretoria tem mandato de 4 anos; um projeto
                  de 8 anos atravessa duas gestões
jurídico          revisões judiciais alteram benefícios individuais
                  retroativamente, e o sistema precisa recalcular
auditoria         tribunal de contas acompanha; mudanças exigem
                  documentação e aprovação
equipe            32 engenheiros contratados para o projeto,
                  nenhum com experiência em mainframe
```

A restrição de prazo político é a que mais influencia a estratégia: um projeto que só entrega
valor no ano 7 não sobrevive a uma troca de gestão.

## Estimativas de Capacidade

```text
participantes                        2,9 milhões
benefícios ativos                    890 mil
folha mensal                         890 mil cálculos, em janela de 6 h
                                     →  ~41 cálculos/s
consultas/dia                        ~1,2 milhão  →  ~14/s, pico ~90/s
concessões/mês                       ~4 200
revisões judiciais/mês               ~380
```

O volume é pequeno em qualquer medida moderna. Quarenta e um cálculos por segundo, noventa
consultas por segundo no pico. **Nenhuma decisão deste projeto é motivada por escala** — e é
importante dizer isso, porque projetos de modernização frequentemente são vendidos com argumento
de escalabilidade que não se sustenta.

O que dimensiona é outra coisa:

```text
combinações de regras a preservar     estimadas entre 4 000 e 11 000
casos de teste necessários para
  comprovar equivalência              desconhecido no início
volume de dados históricos            ~14 TB
anos de contribuição por participante até 40
```

## Opções de Arquitetura

O eixo é **como as regras saem do COBOL sem se perderem**.

### Opção A — Reescrita completa a partir da especificação

Escrever a especificação funcional a partir de análise e entrevistas, e construir o sistema novo.

```text
prazo             estimado em 6 a 9 anos
risco             muito alto — a especificação será incompleta,
                  porque o conhecimento não existe fora do código
entrega de valor  apenas ao final
histórico         o setor tem registro consistente de fracasso
                  neste modelo, para sistemas desta natureza
```

### Opção B — Conversão automática de COBOL para linguagem moderna

Ferramentas que traduzem o código, preservando a lógica.

```text
prazo             18 a 30 meses
equivalência      alta — a lógica é preservada literalmente
resultado         código gerado, ilegível, com a mesma estrutura
                  do original; a manutenibilidade não melhora
custo             reduz licenciamento; não reduz dependência
                  de conhecimento
```

### Opção C — Estrangulamento por domínio, com equivalência comprovada

Extrair capacidades uma a uma, com o sistema novo rodando em paralelo e comparado com o legado
até que a equivalência seja comprovada, e só então assumindo o tráfego.

```text
prazo             entrega contínua; primeira capacidade em ~8 meses
                  desligamento completo em 6 a 8 anos
risco por etapa   baixo — cada extração é comparada e reversível
entrega de valor  contínua, o que atende à restrição política
custo             coexistência de dois sistemas por anos
recuperação de
  regra           a comparação em paralelo é o mecanismo que
                  descobre as regras
```

### Opção D — Encapsular e congelar

Manter o legado como está, envolvê-lo em interfaces modernas, e construir apenas o que é novo por
fora.

```text
prazo             12 a 18 meses para as interfaces
risco             baixo
custo             licenciamento mantido integralmente
conhecimento      o problema principal não é resolvido; quando
                  as 9 pessoas saírem, o sistema fica intocável
```

## Análise de Trade-offs

| Critério | Peso | A — Reescrita | B — Conversão | C — Estrangulamento | D — Encapsular |
|---|:-:|:-:|:-:|:-:|:-:|
| Risco de erro em benefício | 30% | 2 | 8 | 9 | 10 |
| Resolução do risco de conhecimento | 25% | 8 | 4 | 9 | 1 |
| Entrega de valor ao longo do tempo | 20% | 1 | 5 | 9 | 7 |
| Redução de custo | 15% | 8 | 8 | 7 | 1 |
| Velocidade de mudança futura | 10% | 9 | 3 | 9 | 2 |
| **Total ponderado** | | **4,6** | **6,2** | **8,7** | **5,1** |

**Análise de sensibilidade.** Com risco de erro em 50%, os totais viram 3,6 / 7,3 / 8,9 / 8,1 — a
Opção C mantém vantagem. Com custo em 40%, viram 5,9 / 7,3 / 8,0 / 3,0. Nenhum cenário inverte.

O peso de 30% em risco de erro reflete a natureza do domínio: um erro de cálculo em benefício
previdenciário afeta a renda de uma pessoa idosa e gera passivo judicial. É o critério que a
diretoria e o tribunal de contas colocaram acima de todos.

## Decisão

**Estrangulamento por domínio com equivalência comprovada (Opção C)**, com a comparação em
paralelo como o mecanismo central — não como etapa de validação, mas como a forma de **descobrir**
as regras que ninguém sabe.

Essa inversão é a ideia central do projeto: em vez de tentar documentar as regras e depois
implementá-las, o sistema novo é implementado com o melhor entendimento disponível, rodado em
paralelo sobre casos reais, e **cada divergência é uma regra descoberta**.

A consequência prática é que o projeto **começa errado de propósito**. A primeira versão do motor
de cálculo de uma capacidade diverge em milhares de casos, e isso é o resultado esperado — cada
divergência é informação que não existia. Uma equipe que trate as divergências iniciais como
fracasso vai abandonar o método na terceira semana.

Comunicar isso à diretoria e ao tribunal de contas antes de começar foi tão importante quanto o
desenho técnico. O indicador acompanhado não é "quantos erros temos", é "a taxa de divergência
está caindo" — e a curva descendente é o que demonstra progresso.

**Sob que condição cada opção descartada venceria:**

**Opção A venceria se** as regras estivessem documentadas e verificáveis — o que ocorre em
sistemas mais novos ou em domínios com especificação normativa completa e atualizada.

**Opção B venceria se** o objetivo fosse exclusivamente sair do mainframe por custo, com prazo
curto e sem expectativa de melhorar a manutenibilidade. É uma opção legítima como **etapa
intermediária** em situações de urgência contratual.

**Opção D venceria se** o risco de conhecimento não existisse — se houvesse mercado ou formação
interna para repor as 9 pessoas. Ela permanece parcialmente em uso: o legado é encapsulado
enquanto é estrangulado, o que é o que permite construir o novo por fora.

## Componentes

**Fachada de Serviços.** Expõe o legado por interfaces modernas, permitindo que o novo consuma o
antigo durante a transição.

**Roteador de Capacidade.** Decide, por operação, se ela vai para o legado ou para o novo. É o
ponto de virada e de reversão.

**Comparador de Equivalência.** Executa a mesma operação nos dois sistemas e compara os
resultados. É o componente mais importante do projeto.

**Motor de Cálculo.** O sistema novo de cálculo de benefício, com as regras expressas de forma
declarativa e versionada por vigência.

**Catálogo de Regras.** Repositório das regras descobertas, com vigência, fonte legal e casos de
teste associados.

**Serviço de Participante.** Cadastro, dependentes, vínculos.

**Serviço de Contribuição.** Histórico contributivo e tempo de serviço.

**Serviço de Benefício.** Concessão, manutenção, revisão.

**Processador de Folha.** Cálculo mensal.

**Extrator de Dados.** Sincronização do legado para o novo durante a coexistência.

O **Catálogo de Regras** é o artefato de maior valor produzido pelo projeto, e ele não existia
como objetivo inicial. Ele emergiu da necessidade de registrar cada regra descoberta pela
comparação, e é o que resolve o risco de conhecimento — muito mais que o código novo.

## Dados

**Estratégia de dados durante a coexistência.** O legado permanece fonte de verdade até que uma
capacidade seja virada. O Extrator sincroniza continuamente para o sistema novo, que opera em
modo somente leitura até assumir.

Essa direção única — legado para novo, nunca o inverso — é a lição do case de
[e-commerce](/21-case-studies/ecommerce.md) aplicada aqui, e foi decidida com base nela: sincronização
bidirecional entre duas fontes de verdade não funciona.

**Modelo de regras.**

```text
regra        (id, dominio, descricao, vigencia_inicio, vigencia_fim,
              fonte_legal, expressao, descoberta_em, confirmada_por)
caso_teste   (id, regra_id, entrada, saida_esperada, origem)
```

O campo `origem` do caso de teste distingue três procedências: caso construído a partir da
legislação, caso extraído do código legado, e **caso descoberto por divergência**. O terceiro é o
mais valioso.

**Dados históricos.** Os 14 TB permanecem no legado durante quase todo o projeto e migram por
último. Migrar cedo criaria a necessidade de manter os dois sincronizados por anos, sem
benefício.

**Cálculos.** Todo cálculo é armazenado com as regras aplicadas e a versão do motor, o que
atende à auditabilidade e permite reprocessar. Um recálculo por decisão judicial precisa saber
quais regras foram aplicadas originalmente.

## Integração

**A comparação em paralelo**, que é o núcleo do método.

```text
1. o Roteador envia a operação ao legado (que responde ao usuário)
2. envia também ao sistema novo, de forma assíncrona
3. o Comparador confronta os dois resultados
4. divergências são registradas com entrada, saídas e contexto
5. cada divergência é analisada: erro do novo, ou regra desconhecida?
6. regras descobertas entram no Catálogo, com caso de teste
7. quando a taxa de divergência zera por N períodos, a capacidade
   é considerada equivalente
```

O critério de saída por capacidade é rigoroso: **zero divergências em 100% das operações, por
três meses consecutivos**. Para a folha, isso significa três folhas mensais completas — 2,67
milhões de cálculos — sem uma diferença de centavo.

**O que a comparação encontrou.** Este é o resultado mais transferível do case.

```text
divergências analisadas, total                    ~31 000
erros do sistema novo                             ~24 000 (77%)
regras desconhecidas descobertas                  ~6 400 (21%)
erros do sistema legado                           ~600 (2%)
```

Os 600 erros do legado merecem atenção: em 34 anos, o sistema calculava alguns casos de forma
incorreta, e ninguém sabia. A maior parte era em combinações raras — regimes de transição
específicos, benefícios com múltiplas revisões judiciais. Cada um foi levado à área jurídica, e
17 resultaram em correção retroativa de benefícios.

**Extração de dados.** Contínua, do legado para o novo, com verificação de integridade diária. É
a única integração que permanece durante todo o projeto.

**Interfaces com órgãos de controle.** Mantidas pelo legado até a última fase, porque são
estáveis e não têm valor em migrar cedo.

## Segurança

```text
dados de participante   dado pessoal sensível; classificação,
                        mapeamento de fluxo e retenção declarada
acesso                  por perfil e por unidade, com trilha
alteração de benefício  exige dois aprovadores e registro de motivo
cálculo                 imutável após pagamento; recálculo é
                        registro novo
trilha                  permanente, imutável
comparação em paralelo  o Comparador tem acesso de leitura aos dois
                        sistemas; suas credenciais são as mais
                        sensíveis do projeto
ambiente de testes      dados sintéticos ou anonimizados; nunca
                        cópia de produção
```

A restrição de nunca usar cópia de produção em testes criou um problema real: comprovar
equivalência exige casos reais. A solução foi a comparação rodar **em produção**, com o sistema
novo em modo sombra, em vez de tentar reproduzir produção em outro ambiente.

Essa decisão — comparar em produção em vez de simular — é a que tornou o método viável, e ela é
segura porque o sistema novo não responde a ninguém durante a fase de sombra.

A aprovação dessa abordagem pelo tribunal de contas exigiu demonstrar três propriedades: o
sistema em sombra não escreve em nenhum sistema de produção, não expõe dado a nenhum usuário, e
tem seu acesso registrado e auditável como qualquer outro. Documentar isso formalmente levou dois
meses e foi um pré-requisito do projeto.

Organizações com auditoria externa forte frequentemente descartam a comparação em produção por
supor que ela não seria aprovada. Neste caso, ela foi — e o argumento decisivo foi que a
alternativa, virar sem comparação, apresentava risco muito maior aos beneficiários.

## Escalabilidade

Não há desafio de escala. O sistema novo é dimensionado com folga larga para 41 cálculos por
segundo, e a folha completa roda em cerca de 40 minutos contra as 4h20 do legado.

Essa redução não foi um objetivo e é um efeito colateral do hardware moderno. Ela tem um uso
prático: a janela folgada permite rodar a folha **duas vezes** durante a coexistência — uma no
legado, uma no novo — dentro da mesma madrugada, o que é o que viabiliza a comparação mensal.

## Confiabilidade

Durante toda a coexistência, o legado é a rede de segurança. Se o sistema novo falha em qualquer
capacidade já virada, o Roteador reverte para o legado em segundos, por configuração.

Essa reversão foi usada 14 vezes ao longo do projeto, todas nas primeiras semanas após uma
virada, e nenhuma resultou em erro de pagamento.

Após o desligamento do legado, a confiabilidade passa a depender inteiramente do novo, e o
desenho reflete isso: RPO zero com replicação síncrona, RTO de 10 minutos com promoção
automática, e recuperação de desastre em outra região com ensaio semestral.

A **folha mensal** tem tratamento especial: ela é o único processo cuja falha tem consequência
imediata e irreversível — 890 mil pessoas sem receber. O plano de contingência inclui um
procedimento de emergência que reprocessa a folha do mês anterior com reajuste, aprovado
juridicamente, e nunca precisou ser usado.

## Observabilidade

```text
taxa de divergência por capacidade e por tipo de operação
divergências por classe: erro do novo, regra nova, erro do legado
regras no catálogo, e cobertura por casos de teste
progresso: % de operações servidas pelo novo, por capacidade
tempo da folha, nos dois sistemas
reversões acionadas, com causa
capacidade restante no legado, medida em programas e em regras
```

A métrica de **capacidade restante no legado** é a que a diretoria acompanha, e ela foi escolhida
com cuidado: medir em linhas de COBOL restantes seria enganoso, porque grande parte do código é
inalcançável ou duplicado. Medir em programas efetivamente executados no último ano e em regras
catalogadas dá uma leitura honesta do progresso.

## Implantação

O sistema novo tem implantação contínua. O legado mantém seu ciclo original — mudanças ali são
raras e passam pelo processo de sempre.

A virada de uma capacidade é uma mudança de configuração no Roteador, feita em horário de baixa
atividade, com acompanhamento intensivo por duas semanas.

Nenhuma virada nos cinco dias que antecedem o processamento da folha.

## Estratégia de Evolução

A ordem das capacidades foi definida por três critérios combinados: risco baixo, valor visível, e
independência das demais.

**Fase 1 (meses 1–8): fachada e consultas.** O legado é encapsulado, e as consultas de
participante e de benefício passam a ser servidas pelo novo, a partir de dados extraídos.

Valor entregue cedo: o portal do participante, que não existia, foi construído sobre a fachada e
entrou no ar no mês 6. Foi o que sustentou o projeto politicamente no primeiro ano.

**Fase 2 (meses 7–20): simulação de benefício.** A primeira capacidade de cálculo. Escolhida
porque simulação não gera pagamento — um erro é visível e inofensivo.

Foi aqui que o método se provou: 11 mil divergências analisadas, 2 800 regras descobertas, e
nenhum efeito sobre nenhum participante.

**Fase 3 (meses 18–36): concessão.** Cálculo de benefício na concessão, com comparação por três
meses antes da virada.

**Fase 4 (meses 30–52): folha de pagamento.** A capacidade central. Comparada por seis meses —
o dobro do critério padrão — antes da virada.

**Fase 5 (meses 48–72): revisões, retroativos e casos especiais.** A cauda longa, que concentra a
maior parte das regras raras.

**Fase 6 (meses 66–84): migração histórica e desligamento.** Os 14 TB e o encerramento dos
contratos.

**Condições que mudariam o plano:**

```text
se a taxa de divergência de uma capacidade não zerar após
  12 meses de comparação
  → aquela capacidade é reavaliada; pode ser que o modelo
    de regras não a expresse

se mais de 3 das 9 pessoas com conhecimento do legado saírem
  antes da Fase 4
  → a prioridade muda para catalogar regras, mesmo sem
    implementá-las

se houver mudança legislativa estrutural durante o projeto
  → ela é implementada apenas no sistema novo, e a capacidade
    correspondente é antecipada

se o orçamento for contingenciado abaixo de um limiar
  → o projeto pausa em estado consistente; nenhuma fase
    pode terminar com uma capacidade parcialmente virada
```

A última condição orientou o desenho de cada fase: toda fase termina em um estado em que o
projeto pode parar por um ano sem dano. Isso foi exigido pela realidade orçamentária pública, e
produziu um plano melhor.

## Resultados

Números ao fim da Fase 4, 52 meses após o início:

```text
operações servidas pelo sistema novo     de 0% para 78%
regras catalogadas                       6 400, todas com caso de teste
divergências na folha, últimos 6 meses   0
tempo de mudança de regra legal          de 8-14 meses para 5 semanas
custo de licenciamento                   de R$ 62 mi/ano para R$ 31 mi/ano
pessoas capazes de manter o sistema      de 9 para 34
erros históricos do legado corrigidos    17 benefícios, retroativamente
tempo da folha                           de 4h20 para 38 min
```

O número que a diretoria destaca é o de pessoas: de 9 para 34, com formação de novos possível em
semanas em vez de anos. O risco que motivou o projeto foi resolvido.

E há um resultado que não estava em nenhuma meta: o Catálogo de Regras virou o documento de
referência do Instituto sobre a própria legislação previdenciária aplicada. Ele é consultado pela
área jurídica em contestações judiciais, porque descreve com precisão qual regra foi aplicada a
qual benefício, em qual vigência, com a fonte legal correspondente — informação que antes só
existia dentro do COBOL, e que nenhum parecer conseguia citar com segurança.

## O que este case ensina

**A comparação em paralelo não valida — ela descobre.** As 6.400 regras catalogadas não existiam
escritas em lugar nenhum. Tentar documentá-las antes de implementar era o caminho da Opção A, e é
onde projetos desta natureza fracassam.

**O sistema legado estava certo, quase sempre.** 77% das divergências eram erros do sistema novo.
Tratar o legado como referência, e não como suspeito, é o que torna o método confiável — e os 2%
em que ele errava foram encontrados justamente por levá-lo a sério.

**Entregar valor cedo é requisito, não virtude.** Um projeto de sete anos em organização pública
atravessa duas gestões. O portal do participante no mês 6 comprou a legitimidade que sustentou
os cinco anos seguintes.

**Toda fase precisa terminar em estado estável.** A restrição orçamentária forçou um desenho em
que o projeto pode parar a qualquer momento sem deixar nada pela metade. Isso melhorou o plano —
e é uma disciplina que projetos com orçamento estável raramente adotam.

## Conceitos Relacionados

- [Estrangulamento](/16-legacy-modernization/strangler-fig.md).
- [Case: E-commerce Omnicanal](/21-case-studies/ecommerce.md) — a lição de fonte única de verdade.
- [Case: Núcleo Bancário Digital](/21-case-studies/banking.md) — o mesmo método de sombra.
- [Anti-Corruption Layer](/08-integration-architecture/integration-anti-corruption.md).

## Exercício Prático

Escolha um sistema legado do seu contexto e responda: se você precisasse comprovar que um sistema
novo se comporta igual a ele, sobre quais casos você compararia?

Se a resposta for "não sei quais casos existem", você está na mesma situação deste case — e a
comparação em produção é o único método que produz a lista.

## Perguntas de Entrevista

- Por que a comparação em paralelo é o mecanismo de descoberta e não apenas de validação?
- Por que 77% das divergências serem erros do sistema novo é um bom sinal?
- Por que cada fase precisa terminar em estado em que o projeto pode parar?

## Para Aprofundar

- Feathers, Michael. *Working Effectively with Legacy Code*. Prentice Hall, 2004.
- Newman, Sam. *Monolith to Microservices*. O'Reilly, 2019.
- Fowler, Martin. *StranglerFigApplication*. martinfowler.com, 2004.
