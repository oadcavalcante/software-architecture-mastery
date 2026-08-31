---
id: healthcare
title: "Case: Plataforma de Saúde"
sidebar_position: 10
description: Prontuário eletrônico para 340 unidades, onde disponibilidade e privacidade são requisitos de vida e de lei.
doc_type: case-study
level: 0
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor projeta um sistema em que o dado é sensível por natureza, a
  interoperabilidade é imposta e a indisponibilidade tem consequência clínica.
prerequisites: [trade-offs]
related: [multi-tenant-enterprise, banking, legacy-modernization-case]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-29
---

# Case: Plataforma de Saúde

:::note Como usar este case

Leia contexto, requisitos e restrições. **Pare antes das opções de arquitetura** e esboce a sua
em vinte minutos.

:::

## Contexto de Negócio

A **Vitalis** é uma operadora de saúde com rede própria: 12 hospitais, 84 clínicas e 244 pontos
de atendimento — laboratórios, centros de imagem e unidades de pronto atendimento. Atende 2,8
milhões de beneficiários.

O prontuário eletrônico é um sistema construído internamente ao longo de 14 anos. Ele funciona,
e três características o tornam insustentável:

**Disponibilidade.** O sistema teve 41 horas de indisponibilidade no último ano. Durante uma
delas, um hospital operou 6 horas com prontuário em papel, e a reconciliação posterior levou
três semanas. Indisponibilidade em saúde não é inconveniente — é risco clínico, porque o médico
perde acesso a alergias, medicações em uso e histórico.

**Fragmentação.** Cada unidade adquirida ao longo dos anos trouxe seu sistema. Existem hoje 7
prontuários diferentes, e o histórico de um paciente que passou por três unidades está em três
lugares, sem consolidação. Médicos relatam pedir exames já realizados por não ter acesso ao
resultado.

**Regulação.** A LGPD e as normas do Conselho Federal de Medicina impõem requisitos de
consentimento, rastreabilidade de acesso, retenção mínima de 20 anos e assinatura digital de
documentos clínicos. O sistema atual atende parcialmente, e a operadora recebeu apontamento em
auditoria.

## Requisitos Funcionais

Para o **profissional de saúde**: consultar o prontuário consolidado de um paciente, com
histórico de todas as unidades; registrar evolução, prescrição e solicitação de exame; assinar
digitalmente documentos; e acessar resultados de exames com imagem.

Para o **paciente**: consultar seu próprio histórico e resultados; gerenciar consentimentos de
compartilhamento; e agendar atendimentos.

Para a **unidade**: gerenciar agenda e ocupação; registrar admissão, alta e transferência; e
faturar contra a operadora ou contra convênios externos.

Para a **operadora**: autorizar procedimentos conforme cobertura; auditar utilização; e reportar
aos órgãos reguladores.

E para a **plataforma**: interoperar com sistemas externos por padrões do setor; garantir que
todo acesso a dado clínico seja registrado e justificável; e manter o prontuário disponível
mesmo com falha de conectividade da unidade.

O último requisito é o que mais restringe: uma unidade sem conexão precisa continuar atendendo.

## Requisitos Não-Funcionais

```text
disponibilidade da consulta de prontuário   99,99%
disponibilidade do registro clínico         99,99%
operação sem conectividade da unidade       até 8 h, com sincronização
p95 de consulta ao prontuário consolidado   < 1,2 s
p95 de abertura de exame de imagem          < 4 s
RPO para registro clínico                   0
RTO                                         < 10 min
retenção de prontuário                      20 anos (mínimo legal)
retenção de trilha de acesso                20 anos
rastreabilidade                             todo acesso a dado clínico
                                            registrado com autor, motivo
                                            e paciente
integridade                                 registro clínico assinado e
                                            imutável após assinatura
```

O RPO zero combinado com operação offline de 8 horas é a tensão central do sistema: são
requisitos que puxam em direções opostas, e resolvê-los é o problema de arquitetura.

## Restrições

```text
regulatório       LGPD, resoluções do CFM, normas da ANS; assinatura
                  digital com certificado ICP-Brasil para documentos
                  clínicos; retenção de 20 anos
interoperabilidade padrões do setor obrigatórios para troca com
                  laboratórios, operadoras externas e o sistema
                  público de saúde
sistemas legados  7 prontuários diferentes, dos quais 3 sem
                  fornecedor ativo e 2 sem API
conectividade     unidades em regiões com enlace instável; três
                  delas com conexão via satélite
equipe            86 engenheiros; 14 com experiência em saúde
migração          14 anos de prontuário, ~3,2 bilhões de registros
                  clínicos, sem possibilidade de perda ou de
                  interpretação errada
prazo             apontamento de auditoria com prazo de 24 meses
                  para adequação regulatória
```

A restrição de migração é a mais delicada de todo este conjunto de cases: um registro clínico
migrado com interpretação errada — uma dosagem, uma alergia — pode causar dano.

Essa restrição mudou o método de trabalho, não apenas o cronograma. Migração de dado clínico não
é verificada por contagem de linhas nem por soma de verificação: ela é verificada clinicamente,
por amostragem, com profissionais de saúde lendo registros migrados ao lado dos originais. A
equipe reservou 4% do esforço total do projeto para essa validação, e o número foi tratado como
não negociável desde o primeiro plano.

Há uma consequência de arquitetura: campos cuja semântica não pode ser determinada com certeza
não são migrados como dado estruturado. Eles são preservados como texto original, marcados como
não interpretados, e exibidos ao profissional como tal. Perder estrutura é aceitável; inventar
estrutura errada não é.

## Estimativas de Capacidade

```text
beneficiários                       2,8 milhões
atendimentos/dia                    ~94 mil
profissionais ativos simultâneos    ~7 200 no pico
consultas a prontuário/dia          ~1,4 milhão
consultas/s, pico                   ~180
registros clínicos/dia              ~640 mil
registros/s, pico                   ~85
```

O volume transacional é baixo — 180 consultas por segundo. Como em quase todos os casos deste
conjunto, a arquitetura não é decidida por escala.

O que dimensiona é o **armazenamento** e a **imagem**:

```text
registros clínicos, 20 anos         ~4,6 bilhões  →  ~9 TB
trilha de acesso, 20 anos           ~11 bilhões   →  ~4 TB
exames de imagem                    ~340 TB, crescendo ~62 TB/ano
documentos assinados                ~28 TB
```

Exames de imagem dominam o armazenamento e têm um perfil de acesso particular: 78% deles nunca
são acessados após os primeiros 30 dias, e os 22% restantes são consultados esporadicamente ao
longo de anos.

```text
acessos a imagem, primeiros 30 dias    ~94% do total de acessos
acessos após 1 ano                     ~1,2%
```

Essa distribuição é o que justifica hierarquia de armazenamento, e ela sozinha responde por boa
parte da economia possível.

Vale notar como esse número foi obtido, porque ele não estava disponível. O sistema antigo não
registrava acesso a exames de imagem de forma consultável — a informação existia em registros de
aplicação, retidos por 15 dias. Reconstruir a distribuição exigiu três meses de coleta antes de
qualquer decisão de arquitetura poder ser tomada com fundamento.

Esse é um padrão que se repete em sistemas antigos: a decisão depende de um número que ninguém
mediu, e medir leva tempo. Começar a coleta cedo — antes de saber exatamente o que se vai decidir
— é o que evita escolher por intuição meses depois.

## Opções de Arquitetura

O eixo é **onde vive o prontuário e como a unidade opera sem conexão**.

### Opção A — Centralizado com cache de leitura

Prontuário único e central; unidades mantêm cache de leitura dos pacientes agendados.

```text
consolidação      trivial — um só lugar
operação offline  parcial: leitura sim, registro não
RPO               0, com replicação síncrona
complexidade      baixa
risco             uma unidade sem conexão não registra atendimento
```

### Opção B — Centralizado com registro local e sincronização

Prontuário central; a unidade registra localmente quando offline e sincroniza depois.

```text
consolidação      boa, com janela de sincronização
operação offline  completa
RPO               0 para o registro local; a sincronização pode
                  atrasar a visibilidade central
conflito          possível — dois registros no mesmo paciente
                  em unidades diferentes durante a partição
complexidade      média
```

### Opção C — Federado por unidade, com índice central

Cada unidade mantém seu prontuário; um índice central aponta onde está cada registro, e a
consolidação é feita na leitura.

```text
consolidação      cara — consulta N unidades a cada leitura
operação offline  completa e natural
disponibilidade   uma unidade fora torna parte do histórico invisível
regulatório       mais difícil — a trilha de acesso fica distribuída
complexidade      alta
```

## Análise de Trade-offs

| Critério | Peso | A — Central | B — Central + local | C — Federado |
|---|:-:|:-:|:-:|:-:|
| Continuidade do atendimento | 30% | 4 | 9 | 8 |
| Consolidação do histórico | 25% | 9 | 9 | 4 |
| Conformidade regulatória | 20% | 9 | 8 | 4 |
| Complexidade e risco | 15% | 8 | 6 | 3 |
| Capacidade da equipe | 10% | 8 | 7 | 4 |
| **Total ponderado** | | **7,3** | **8,2** | **5,3** |

**Análise de sensibilidade.** Com continuidade em 45%, os totais viram 6,3 / 8,6 / 6,1. Com
conformidade em 40%, viram 8,0 / 8,2 / 4,6 — a Opção B mantém vantagem estreita. A Opção C não
vence em nenhum cenário testado, e a razão é estrutural: ela dificulta simultaneamente
consolidação e trilha de acesso, que são os dois problemas declarados.

## Decisão

**Centralizado com registro local e sincronização (Opção B)**, com regras de conflito
explícitas e a sincronização tratada como parte do fluxo clínico, não como detalhe técnico.

**Sob que condição cada opção descartada venceria:**

**Opção A venceria se** todas as unidades tivessem conectividade confiável — o que é verdade
para 81% delas. Para essas, o modo local é uma capacidade que raramente é exercida, e o custo de
mantê-la é justificado apenas pelas 19% restantes e pelo risco de falha central.

**Opção C venceria se** as unidades fossem organizações independentes, com autonomia jurídica e
propriedade própria do dado — o modelo de uma rede credenciada, não de rede própria. A condição
está registrada: se a Vitalis passar a integrar prestadores externos com propriedade do
prontuário, o modelo federado volta à mesa para essa parcela.

## Componentes

**Prontuário Central.** Fonte de verdade do registro clínico consolidado.

**Nó de Unidade.** Instância local em cada unidade, com o prontuário dos pacientes relevantes e
capacidade de registrar offline.

**Serviço de Identificação de Paciente.** Resolve identidade entre sistemas — o problema mais
difícil da consolidação.

**Serviço de Consentimento.** Gerencia o que o paciente autorizou compartilhar, com quem e por
quanto tempo.

**Serviço de Trilha de Acesso.** Registra todo acesso a dado clínico, imutável.

**Serviço de Assinatura.** Assinatura digital de documentos clínicos com certificado.

**Repositório de Imagem.** Armazenamento hierárquico de exames.

**Gateway de Interoperabilidade.** Tradução entre o modelo interno e os padrões do setor.

**Serviço de Autorização de Procedimento.** Regras de cobertura da operadora.

**Sincronizador.** Reconciliação entre nós de unidade e o central.

O **Serviço de Identificação de Paciente** merece destaque: consolidar prontuários exige saber
que o "José Silva" de uma unidade é a mesma pessoa que o "J. Silva" de outra. Com 7 sistemas
legados e cadastros de qualidade variável, essa é a fonte de erro mais perigosa da migração.

## Dados

**Registro clínico.** Imutável após assinatura. Uma correção é um registro novo que referencia o
anterior, com o motivo — nunca uma alteração.

```text
registro   (id, paciente_id, unidade_id, profissional_id, tipo,
            conteudo, assinado_em, assinatura, referencia_id, motivo)
```

Essa imutabilidade é exigência regulatória e é também a propriedade que torna a sincronização
tratável: registros só são acrescentados, nunca alterados, o que elimina a classe mais difícil
de conflito.

**Identidade de paciente.** Um registro mestre com os identificadores de cada sistema de origem,
e um escore de confiança do vínculo.

```text
vinculo    (paciente_mestre_id, sistema_origem, id_origem,
            escore_confianca, confirmado_por, confirmado_em)
```

Vínculos com escore abaixo do limiar exigem confirmação humana. Durante a migração, 11% dos
registros caíram nessa categoria — cerca de 310 mil casos revisados por uma equipe de 22 pessoas
ao longo de 14 meses.

**Consentimento.** Versionado e datado. Um acesso é avaliado contra o consentimento vigente no
momento do acesso, e a trilha registra qual versão foi aplicada.

**Trilha de acesso.** Append-only, imutável, retida por 20 anos. Cada entrada registra quem
acessou, qual paciente, qual registro, quando e sob qual justificativa.

O volume — 11 bilhões de entradas — é grande e o padrão de acesso é raro: a trilha é consultada
em auditoria e em investigação, algumas centenas de vezes por mês. Armazenamento frio, com
consulta lenta e barata.

**Imagem.** Hierarquia por idade e acesso.

```text
0 a 30 dias        armazenamento rápido, na região da unidade
30 dias a 1 ano    armazenamento padrão
após 1 ano         armazenamento de arquivo, recuperação em minutos
```

A recuperação em minutos para exames antigos foi validada com a área médica: um exame de três
anos atrás não é consultado em emergência, e aguardar 3 minutos é aceitável. Essa validação
foi o que permitiu a hierarquia, e ela reduziu o custo de armazenamento de imagem em 61%.

## Integração

**Sincronização unidade–central.** O núcleo do desenho de continuidade.

Em operação normal, o nó de unidade escreve no central de forma síncrona e mantém cópia local.
Quando a conexão cai, ele passa a escrever apenas localmente, marcando os registros como
pendentes.

Na reconexão, os registros pendentes são enviados. Como registros são imutáveis e apenas
acrescentados, não há conflito de escrita — o conflito possível é **clínico**: dois profissionais
em unidades diferentes registrando decisões incompatíveis sobre o mesmo paciente durante a
partição.

Esse caso é raro e tem tratamento explícito: quando registros de unidades diferentes sobre o
mesmo paciente no mesmo intervalo são detectados na sincronização, ambos são preservados e um
alerta é gerado para o profissional responsável, que decide. O sistema **não** resolve conflito
clínico automaticamente.

**Quais pacientes ficam no nó local.** Não todos — seria inviável. O nó mantém os pacientes com
atendimento agendado nos próximos 7 dias, os internados, e os atendidos nos últimos 30 dias.
Cobre 97% dos atendimentos.

Para os 3% restantes — um paciente que chega sem agendamento numa unidade sem conexão — o
sistema opera com o que o paciente informar, registra a limitação, e sinaliza o registro como
produzido sem acesso ao histórico. É uma degradação com consequência clínica, e ela é
comunicada ao profissional.

A marcação desse registro como "produzido sem histórico" tem uso posterior: quando a unidade
reconecta e o histórico completo fica disponível, o sistema compara o que foi registrado com o
que consta no prontuário — alergias, medicações em uso, condições crônicas — e alerta o
profissional responsável se houver incompatibilidade.

Esse alerta posterior é uma rede de segurança que a operação valorizou mais do que a equipe
esperava. Em 14 meses, ele gerou 62 alertas, dos quais 9 resultaram em mudança de conduta
clínica. Nenhum deles teria sido detectado sem a marcação — o registro pareceria normal.

**Interoperabilidade.** O Gateway traduz entre o modelo interno e os padrões do setor, tanto
para receber resultados de laboratórios externos quanto para enviar informações a outras
operadoras e ao sistema público.

Adotar o padrão internamente foi considerado e descartado: os padrões do setor são desenhados
para troca, não para operação, e modelar o prontuário interno neles teria produzido um sistema
mais complexo e mais lento. O Gateway isola essa tradução. Ver
[anti-corruption layer](/08-integration-architecture/integration-anti-corruption.md).

## Segurança

```text
acesso a dado clínico   por vínculo assistencial: um profissional
                        acessa o prontuário de quem ele atende
quebra de vínculo       acesso em emergência é permitido com
                        justificativa obrigatória e revisão posterior
trilha                  imutável, 20 anos, com revisão por amostragem
consentimento           granular por tipo de dado e por destinatário
dados sensíveis
  especiais             saúde mental, HIV, genética têm proteção
                        adicional e acesso mais restrito
paciente                acessa o próprio histórico, com autenticação forte
imagem                  cifrada em repouso; acesso pelo mesmo controle
assinatura              certificado ICP-Brasil, com carimbo de tempo
anonimização            para pesquisa e análise, com processo aprovado
```

O **acesso em emergência com justificativa** — conhecido no setor como "quebra de vidro" — é a
decisão de segurança mais importante. Bloquear o acesso pode custar uma vida; permitir sem
controle viola a lei. A solução é permitir, exigir justificativa no momento, e revisar depois.

A revisão posterior é o que dá dente ao controle: 100% dos acessos por quebra de vínculo são
revisados em até 5 dias úteis. No primeiro ano, 340 acessos foram revisados e 11 resultaram em
processo interno.

## Escalabilidade

O sistema não tem problema de escala no sentido usual. O que ele tem é **distribuição
geográfica**: 340 unidades, algumas com conectividade ruim, precisando de latência baixa.

A resposta é o nó de unidade, que resolve latência e continuidade com o mesmo mecanismo. A
consulta ao prontuário de um paciente presente é local; a consulta a um histórico completo vai
ao central.

O armazenamento de imagem escala por hierarquia e por região: exames recentes ficam próximos da
unidade que os produziu, porque é lá que serão consultados.

## Confiabilidade

Se o **Prontuário Central** fica indisponível, todas as unidades passam ao modo local. O
atendimento continua para os 97% de pacientes com dado local. É a degradação mais importante do
sistema, e é ensaiada trimestralmente com corte real de conexão numa unidade por vez.

Se um **Nó de Unidade** falha, aquela unidade opera contra o central diretamente, com latência
maior. Se as duas coisas falharem juntas, a unidade recorre ao processo em papel — que continua
existindo, documentado e treinado.

Se o **Serviço de Consentimento** fica indisponível, o acesso é negado por padrão, exceto em
emergência com justificativa. Falhar fechado é a escolha correta para dado clínico.

Se o **Repositório de Imagem** falha, o prontuário textual continua acessível. Exames de imagem
ficam indisponíveis, o que é comunicado explicitamente.

Se a **Assinatura** falha, documentos podem ser produzidos e ficam pendentes de assinatura, com
prazo. É uma pendência regulatória, não clínica.

## Observabilidade

```text
disponibilidade por unidade, medida do ponto de vista da unidade
tempo em modo local, por unidade
registros pendentes de sincronização, por unidade e idade
conflitos clínicos detectados na sincronização
acessos por quebra de vínculo, e tempo até revisão
vínculos de identidade com baixa confiança pendentes de revisão
latência de consulta ao prontuário, local contra central
taxa de recuperação de imagem por camada de armazenamento
```

A medição de disponibilidade **do ponto de vista da unidade** é uma escolha deliberada: o número
que importa não é se o central está no ar, é se o profissional consegue atender. Uma unidade em
modo local com sincronização saudável está disponível, ainda que desconectada.

Essa definição mudou a percepção interna do problema: as 41 horas de indisponibilidade do sistema
antigo eram, na métrica antiga, indisponibilidade do central. Na métrica nova, o número relevante
passou a ser horas de unidade sem capacidade de atender — e ele é o alvo real.

## Implantação

Implantação por unidade, em ondas, começando pelas menores. O nó de unidade é atualizado em
janela negociada com a operação de cada uma, porque a atualização exige que a unidade esteja em
baixa atividade.

O Prontuário Central usa implantação sem interrupção, com esquema compatível em três etapas. A
imutabilidade do registro clínico ajuda: campos são acrescentados, nunca alterados
semanticamente.

Nenhuma implantação em unidade com pacientes internados em estado crítico, verificado
automaticamente antes da janela.

Essa verificação automática é um exemplo de restrição de domínio virando regra de esteira: o
sistema de implantação consulta a ocupação de leitos críticos da unidade antes de liberar a
janela, e bloqueia se houver paciente em estado que exija acesso contínuo ao prontuário. É uma
integração incomum entre plataforma de entrega e dado operacional, e ela existe porque a
alternativa — depender de alguém lembrar de verificar — falhou uma vez.

O incidente que a originou não teve consequência clínica, e foi tratado como se tivesse tido: a
análise posterior concluiu que o controle não podia depender de disciplina humana em um processo
executado dezenas de vezes por mês.

## Estratégia de Evolução

**Fase 1 (meses 1–6): identificação de paciente.** Construção do registro mestre e vinculação dos
7 sistemas. É a fundação de tudo, e é feita antes de qualquer migração de dado clínico.

Resultado: 89% dos vínculos resolvidos automaticamente; 11% — 310 mil casos — para revisão
humana, que se estendeu ao longo do projeto.

**Fase 2 (meses 5–12): prontuário central e consolidação de leitura.** O central passa a agregar
os registros dos sistemas legados, servindo consulta consolidada. Nenhuma escrita muda ainda.

Esta fase entregou o benefício clínico mais imediato: médicos passaram a ver o histórico
completo, e a taxa de exames repetidos desnecessariamente caiu 23%.

**Fase 3 (meses 11–18): registro no central e nós de unidade.** A escrita migra por unidade, com
o nó local desde o início. Ordem definida por criticidade e conectividade: unidades com conexão
pior primeiro, porque são as que mais se beneficiam do nó local.

**Fase 4 (meses 17–22): consentimento, trilha e assinatura.** Adequação regulatória completa,
dentro do prazo de 24 meses do apontamento.

**Fase 5 (meses 20–30): desligamento dos legados e migração histórica.** Os 3,2 bilhões de
registros históricos migram por último, com validação por amostragem revisada clinicamente.

**Condições que mudariam o plano:**

```text
se a taxa de vínculos de baixa confiança ficar acima de 5%
  após a revisão
  → a consolidação automática é suspensa; risco clínico
    supera o benefício

se a Vitalis passar a integrar prestadores externos com
  propriedade do prontuário
  → o modelo federado (Opção C) volta para essa parcela

se a regulação exigir residência do dado por estado
  → o central precisa ser regionalizado

se algum sistema legado sem fornecedor tornar-se
  inoperante antes da migração
  → a ordem das fases muda para priorizar a extração
    daquele acervo
```

A última condição não é hipotética: dois dos sete sistemas rodam em plataformas sem suporte, e a
extração dos seus dados foi antecipada por precaução.

## Resultados

Números ao fim da Fase 4, 22 meses após o início:

```text
horas de unidade sem capacidade de atender    de ~41 h/ano para 1,2 h/ano
disponibilidade do central                    99,97%
unidades operando em modo local, tempo médio  4,1 h/mês (concentrado
                                              nas 19% com conexão ruim)
exames repetidos desnecessariamente           -31%
tempo médio de consulta ao histórico completo de "não existia" para 0,9 s
acessos por quebra de vínculo revisados       100%, em média 2,3 dias
apontamento de auditoria                      encerrado
custo de armazenamento de imagem              -61%
```

O primeiro número é o resultado do projeto: as horas em que uma unidade não consegue atender
caíram de 41 para 1,2 por ano, e isso não veio de tornar o central mais disponível — veio de
tornar a unidade capaz de operar sem ele.

## O que este case ensina

**A métrica precisa medir o que importa.** Disponibilidade do sistema central e capacidade de
atender são coisas diferentes, e o projeto só ficou correto quando a segunda virou o alvo. A
arquitetura seguiu a métrica.

**Imutabilidade simplifica a sincronização.** Registros que só são acrescentados eliminam a
classe mais difícil de conflito. A exigência regulatória de imutabilidade, que parecia uma
restrição, virou a propriedade que tornou a operação offline tratável.

**Identidade é o problema mais difícil da consolidação.** Antes de qualquer dado clínico, foi
preciso resolver quem é quem entre sete sistemas. Errar ali não produz um bug — produz o
prontuário de uma pessoa misturado ao de outra.

**Falhar fechado, com exceção controlada.** Consentimento indisponível nega acesso; emergência
permite com justificativa e revisão posterior obrigatória. As duas regras juntas são o que
concilia segurança do dado e segurança do paciente.

## Conceitos Relacionados

- [Case: Corporativo Multi-inquilino](/21-case-studies/multi-tenant-enterprise.md).
- [Case: Modernização de Legado](/21-case-studies/legacy-modernization-case.md).
- [Proteção de Dados](/10-security/data-protection.md).
- [Diagramas de Fluxo de Dados](/17-architecture-documentation/data-flow-diagrams.md).

## Exercício Prático

Desenhe o fluxo de sincronização de uma unidade que ficou 6 horas offline e registrou 40
atendimentos.

Responda: o que acontece se, durante esse período, um desses pacientes foi atendido em outra
unidade? Qual conflito o sistema resolve sozinho e qual precisa de um humano?

## Perguntas de Entrevista

- Por que medir disponibilidade do sistema central era a métrica errada?
- Por que a imutabilidade exigida pela regulação facilita a operação offline?
- Por que o sistema não resolve conflito clínico automaticamente?

## Para Aprofundar

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- HL7 International. *FHIR — Fast Healthcare Interoperability Resources*.
- Conselho Federal de Medicina. *Resolução CFM sobre prontuário eletrônico*.
