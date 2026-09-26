---
id: conways-law
title: Lei de Conway
sidebar_position: 18
description: A arquitetura reproduz a estrutura de comunicação da organização — e, quando as duas divergem, é a arquitetura que tende a ceder.
doc_type: concept
level: 7
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor lê a arquitetura a partir do organograma e propõe mudança
  organizacional como parte da mudança arquitetural.
prerequisites: [architecture-leadership-basics]
related: [team-topologies, organizational-architecture, cross-team-architecture]
canonical_for: [lei de Conway, manobra inversa de Conway, estrutura de comunicação, homomorfismo organizacional]
content_version: 2
last_reviewed: 2026-08-29
---

# Lei de Conway

## Visão Geral

Melvin Conway, em 1968:

> Organizações que desenham sistemas estão restritas a produzir desenhos que são cópias das
> estruturas de comunicação dessas organizações.

A formulação é de sessenta anos e continua sendo uma das regularidades mais consistentemente
observadas em arquitetura de software: MacCormack et al. (2011), comparando produtos equivalentes
feitos por organizações fortemente e fracamente acopladas, encontraram a mesma correspondência
entre acoplamento da organização e acoplamento do código. Ela não descreve uma tendência — descreve uma restrição:

```text
duas equipes que não conversam        produzem dois sistemas com
                                      integração pobre entre eles
quatro equipes num componente         produzem quatro subcomponentes
                                      com fronteiras internas
uma equipe que faz tudo               produz um sistema sem fronteiras
                                      internas
```

E a consequência para quem lidera arquitetura é direta: **desenhar times é desenhar arquitetura**.
Ignorar isso é projetar contra a corrente: sem esforço contínuo para sustentar as fronteiras, a
corrente vence.

## Problema

O padrão que a lei explica, e que quase todo arquiteto já viveu:

```text
a arquitetura alvo é desenhada com quatro serviços
os times são organizados por camada — front-end, back-end, dados
dezoito meses depois, existem quatro serviços no papel
e um sistema acoplado por camadas na prática
```

Nada nesse resultado é falha de execução. Cada decisão individual foi tomada por pessoas
competentes seguindo o caminho de menor atrito — e o caminho de menor atrito é aquele em que a
comunicação já existe.

Um time de back-end que precisa de uma mudança no front-end negocia, espera e coordena. O mesmo
time, mudando algo dentro do próprio escopo, apenas faz. Ao longo de dezoito meses, essa
diferença de atrito reorganiza o sistema.

O erro simétrico: reorganizar times sem entender a arquitetura existente, e produzir uma
estrutura em que cada mudança de produto exige três times.

## Conceitos Centrais

### É sobre comunicação, não sobre organograma

A lei fala de **estrutura de comunicação**, e ela nem sempre corresponde ao organograma:

```text
duas equipes no mesmo andar, que almoçam juntas
  → comunicam-se bem, ainda que em áreas diferentes
duas equipes na mesma área, em fusos distantes
  → comunicam-se mal, ainda que no mesmo organograma
```

Isso importa para o diagnóstico: a fronteira arquitetural real vai aparecer onde a comunicação é
cara, e não onde o organograma diz que há separação.

Em organizações distribuídas, fuso horário é frequentemente uma restrição arquitetural mais forte
que hierarquia.

### A manobra inversa

A aplicação prática mais valiosa: se a arquitetura reproduz a organização, então **organize os
times na forma da arquitetura desejada**.

```text
quer serviços independentes por domínio
  → organize times por domínio, com propriedade completa

quer um monólito modular coeso
  → um time, ou times com fronteiras internas explícitas
    e forte comunicação entre eles

quer uma plataforma reusável
  → um time de plataforma com produto próprio, não um
    time de infraestrutura sob demanda
```

Isso é conhecido como manobra inversa de Conway. Ela é a alavanca de maior alcance que um
arquiteto sênior tem sobre a forma do sistema, porque muda a estrutura que produz as decisões em
vez de corrigir uma decisão de cada vez — e é a que ele mais raramente pode acionar sozinho, porque exige a liderança de
engenharia.

Por isso a proposta arquitetural e a proposta organizacional precisam andar juntas. Ver
[arquitetura organizacional](/23-architecture-leadership/organizational-architecture.md).

### Times por camada produzem sistemas por camada

Um caso específico e frequente:

```text
organização   time de front-end, time de back-end, time de dados
resultado     toda funcionalidade atravessa três times
              nenhum time entrega valor sozinho
              o gargalo é coordenação, não capacidade
```

A arquitetura resultante é acoplada horizontalmente: mudar uma regra de negócio exige tocar três
camadas mantidas por três times, com três filas de priorização.

A alternativa — times por domínio, com todas as camadas dentro — produz sistemas acoplados
verticalmente, que é o acoplamento que se quer, porque ele segue as unidades de mudança do
negócio.

### Tamanho de time é restrição arquitetural

```text
time de 5 a 9 pessoas   comunica-se internamente sem estrutura formal
acima disso             a comunicação precisa de mecanismo, e o
                        componente tende a se subdividir
```

Isso significa que o tamanho máximo de um componente coeso é limitado pelo tamanho de time que
consegue mantê-lo. Um componente que exige quinze pessoas vai se dividir — a única questão é se
a divisão será desenhada ou emergente.

Ver [topologias de time](/23-architecture-leadership/team-topologies.md).

### A lei prevê o futuro, não só explica o passado

O uso mais valioso é preditivo:

```text
"vocês querem três serviços independentes, e vão ser mantidos
 pelo mesmo time de seis pessoas. Em um ano, eles vão estar
 acoplados — porque não há atrito nenhum entre eles."

"vocês querem um monólito modular, e o time está dividido entre
 São Paulo e Lisboa, com duas horas de sobreposição. As
 fronteiras vão aparecer nessa divisão, quer você as desenhe
 ou não."
```

Fazer essa previsão numa revisão de desenho é uma das contribuições mais úteis que um arquiteto
pode dar, e ela custa uma frase.

### Nem toda divergência é ruim

```text
alinhado      a arquitetura corresponde aos times; mudanças
              são locais
divergente    a arquitetura não corresponde; toda mudança
              exige coordenação
deliberado    a divergência é temporária e conhecida, com
              plano de convergência
```

A terceira linha é legítima: durante uma transição, a arquitetura alvo e a organização atual
podem não corresponder, e forçar a reorganização antes de a arquitetura existir seria pior.

O que não é legítimo é a divergência não reconhecida — a organização que espera microsserviços
independentes de times organizados por camada e não entende por que não funciona.

### A lei também opera sobre fornecedores e contratos

```text
sistema construído por três fornecedores diferentes
  → três subsistemas com integração contratual entre eles
sistema construído com uma consultoria por módulo
  → módulos que refletem o escopo de cada contrato
```

A fronteira de contrato é uma fronteira de comunicação, e ela aparece na arquitetura tão
claramente quanto a fronteira de time.

## Modelo Mental

**A arquitetura tende a se parecer com a estrutura de comunicação, e contrariar essa tendência
custa esforço contínuo.** A escolha é entre desenhar essa correspondência, pagar para sustentar a
divergência ou descobri-la depois.

## Quando Usar

- Ao propor qualquer mudança arquitetural significativa.
- Ao diagnosticar por que uma arquitetura não se materializou.
- Ao avaliar uma reorganização de times.
- Ao prever o resultado de uma divisão de trabalho.

## Quando Não Usar

**Como desculpa** — "a lei de Conway explica" não resolve; ela orienta a intervenção.

**Como determinismo** — a lei descreve uma restrição forte, não uma impossibilidade; equipes
disciplinadas mantêm fronteiras contra a corrente, a custo de esforço contínuo.

**Reorganizando times por moda arquitetural**, sem entender o domínio.

**Ignorando o custo de reorganizar** — mudança de time custa produtividade por meses; no exemplo
abaixo, 30% de velocidade de entrega durante quatro meses.

**Sozinho** — a manobra inversa exige a liderança de engenharia; propô-la sem esse alinhamento é
desperdício de capital.

A manobra inversa, em particular, não compensa em três condições:

- **Um único time** — não há estrutura de comunicação entre times para redesenhar; a fronteira
  interna depende de disciplina de módulo, não de organograma.
- **Domínio instável** — o produto ainda está descobrindo o próprio recorte, e times por domínio
  fixariam fronteiras que a próxima mudança de rumo desfaz.
- **Horizonte curto** — a arquitetura alvo vai durar menos que o tempo necessário para pagar a
  queda de produtividade da reorganização.

## Alternativas

- **Manter a divergência com disciplina** — fronteiras preservadas por verificação automática, a
  custo de esforço contínuo. Ver
  [funções de aptidão](/23-architecture-leadership/fitness-functions.md).
- **Adaptar a arquitetura à organização** — desenhar o que a estrutura atual suporta, em vez do
  ideal.
- **Mudar a comunicação sem mudar o organograma** — sobreposição de fuso, rituais compartilhados,
  rotação de pessoas.

A terceira é subestimada e frequentemente viável quando a reorganização não é: a estrutura de
comunicação pode ser alterada sem mexer em hierarquia.

## Trade-offs

| Eixo | Alinhar times à arquitetura | Adaptar arquitetura aos times |
|---|---|---|
| Custo inicial | Alto: reorganização e meses de produtividade menor | Nenhum |
| Arquitetura alcançável | A desejada | A que a estrutura atual suporta |
| Quem decide | Exige patrocínio da liderança | Ao alcance do arquiteto |

| Eixo | Divergência com disciplina | Convergência |
|---|---|---|
| Custo inicial | Nenhum: sem reorganização | Pontual: a mudança de times |
| Custo contínuo | Permanente: vigilância e verificação de fronteiras | Baixo: fronteiras seguem a comunicação |

## Modos de Falha

**Arquitetura desenhada contra a estrutura.** Não se materializa.

**Reorganização sem entender o domínio.** Fronteiras erradas, fixadas.

**Divergência não reconhecida.** A organização espera um resultado que a estrutura impede.

**Times por camada** com expectativa de entrega independente.

**Componente maior que o time** que o mantém.

**Manobra inversa sem patrocínio.** Proposta que não pode ser executada.

## Erros Comuns

**Tratar a lei como curiosidade histórica.** Ela aparece na retrospectiva, não na proposta, e o
acoplamento por camada é descoberto dezoito meses depois, como no exemplo abaixo.

**Propor arquitetura sem olhar o organograma.** A proposta desenha cinco serviços para três
times, e o serviço sem dono único acumula as mudanças de quem estiver mais perto dele.

**Reorganizar times sem plano de convergência arquitetural.** Os times mudam, os serviços não, e
a nova estrutura passa a atravessar fronteiras que a antiga respeitava — a divergência só troca de
lugar.

**Ignorar fuso horário** como fronteira de comunicação. A fronteira surge na divisão geográfica,
não na desenhada: uma alteração que cruza os dois lados espera até um dia por revisão, e as
pessoas passam a evitar o código do outro lado.

**Não usar a lei preditivamente** em revisões de desenho. A revisão aprova três serviços para um
time de seis, e o acoplamento entre eles só aparece quando desfazê-lo já custa uma migração.

## Exemplo Real

Uma empresa de comércio eletrônico com 103 engenheiros e 37 pessoas de produto decidiu migrar de um monólito para
microsserviços por domínio: catálogo, carrinho, pedido, pagamento, entrega.

A organização, na época, era por camada:

```text
time de aplicações web        22 pessoas
time de serviços de back-end  48 pessoas
time de dados                 19 pessoas
time de infraestrutura        14 pessoas
times de produto              37 pessoas, sem engenheiros próprios
```

Dezoito meses depois, existiam cinco serviços implantados separadamente — e a medição mostrava:

```text
mudanças de funcionalidade tocando 3+ serviços     68%
mudanças tocando 2+ times                          81%
tempo médio de entrega                             de 9 para 21 dias
implantações independentes por serviço/mês         1,4 (o monólito
                                                   fazia 12)
```

Cinco serviços com implantação acoplada por coordenação humana — o pior dos dois mundos: o custo
operacional da distribuição sem a autonomia.

O diagnóstico foi direto: as fronteiras dos serviços eram por domínio, e as fronteiras de
comunicação eram por camada. Toda mudança de domínio atravessava três equipes com filas de
priorização independentes.

A reorganização levou nove meses e foi conduzida pela liderança de engenharia com a área de
arquitetura:

**Cinco times por domínio**, cada um com front-end, back-end e dados dentro: 18 engenheiros por
domínio, 90 ao todo. Dezoito pessoas passam do limite de comunicação informal, então a divisão foi
desenhada em vez de deixada emergir — cada domínio em dois grupos de até 9 por subdomínio (pedido em
checkout e pós-venda, por exemplo), com um módulo interno por grupo e um único time dono do serviço.
As pessoas de produto foram distribuídas entre os domínios.

**Um time de plataforma** de oito pessoas, vindas do antigo time de infraestrutura — as outras seis
foram para os domínios —, com produto próprio — esteira, observabilidade, provisionamento — em
vez de um time de infraestrutura atendendo pedidos.

**Um time habilitador** de dados, com cinco pessoas e temporário, para transferir competência de modelagem e
qualidade aos times de domínio em vez de executar para eles.

**Propriedade completa** declarada: cada serviço tem um time dono, com plantão próprio.

Foi uma reorganização cara. Nos primeiros quatro meses, a velocidade de entrega caiu 30% — as
pessoas estavam aprendendo camadas que não dominavam, e a produtividade individual despencou.

Resultados após 14 meses da reorganização:

```text
mudanças tocando 3+ serviços                       19%
mudanças tocando 2+ times                          23%
tempo médio de entrega                             6 dias
implantações independentes por serviço/mês         18
incidentes por mudança                             -44%
```

Na retrospectiva: os cinco serviços eram os mesmos antes e depois, e nenhuma fronteira de serviço
foi redesenhada. A queda nas mudanças que tocavam três ou mais serviços veio do que os times por
camada tinham deixado dentro dessas fronteiras: o time de back-end implementava cada regra no
serviço em que já estava mexendo, e o time de dados mantinha tabelas lidas por vários serviços.
Com um dono por serviço, a regra voltou para o domínio a que pertencia, e a tabela compartilhada
ganhou dono e interface. Plataforma e plantão próprio explicam parte do ganho em tempo de entrega
e incidentes; o que tornou os serviços independentes foi a mudança de quem conversava com quem.

E a lição que ficou para o processo de decisão: propostas de arquitetura passaram a exigir uma
seção sobre estrutura organizacional. A pergunta padronizada foi "quais times mantêm cada
fronteira desenhada aqui, e eles conseguem mudá-la sem coordenar com outros?".

## Conceitos Relacionados

- [Topologias de Time](/23-architecture-leadership/team-topologies.md).
- [Arquitetura Organizacional](/23-architecture-leadership/organizational-architecture.md).
- [Arquitetura entre Times](/23-architecture-leadership/cross-team-architecture.md).
- [Monólito vs. Microsserviços](/20-trade-offs/monolith-vs-microservices.md).

## Exercício Prático

Desenhe o organograma de engenharia da sua organização ao lado do diagrama de contêiner do
sistema principal.

Procure as correspondências. Onde elas divergem, você provavelmente encontra as fronteiras que
mais custam para manter — e as que mais geram coordenação.

## Perguntas de Entrevista

- Por que a lei de Conway fala de comunicação e não de organograma?
- O que é a manobra inversa, e por que ela exige patrocínio da liderança?
- Por que times organizados por camada produzem sistemas acoplados horizontalmente?

## Para Aprofundar

- Conway, Melvin. *How Do Committees Invent?*. Datamation, 1968.
- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
- MacCormack, Alan et al. *Exploring the Duality Between Product and Organizational
  Architectures*. Harvard, 2011.
