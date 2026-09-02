---
id: cloud-native-vs-portable
title: Nativo de Nuvem vs. Portável
sidebar_position: 14
description: Portabilidade é um seguro pago todo mês contra um evento que quase nunca ocorre.
doc_type: tradeoff
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor decide quanto de portabilidade comprar com base na probabilidade real
  de migração e no custo de saída medido por componente.
prerequisites: [vendor-lock-in]
related: [managed-vs-self-hosted, build-vs-buy, simplicity-vs-flexibility]
canonical_for: [nativo contra portável, prêmio de portabilidade, superfície de dependência, migração hipotética]
content_version: 2
last_reviewed: 2026-08-29
---

# Nativo de Nuvem vs. Portável

## Visão Geral

Usar profundamente os serviços de um provedor entrega velocidade e capacidade que a camada
portável não tem. Manter portabilidade preserva a opção de mudar, ao custo de abrir mão de
parte disso — todos os dias.

```text
eixo real   qual a probabilidade real de migrar, e qual o custo de saída
            por componente, medido em vez de temido?
```

Portabilidade é um **seguro**: prêmio pago continuamente contra um evento raro. Como todo
seguro, ele se justifica quando o prêmio contínuo é baixo em relação à probabilidade de
migrar multiplicada pelo custo de saída — e não quando o medo é grande. Os três termos são
necessários: sinistro grande com probabilidade desprezível não justifica prêmio nenhum, que
é o erro que este documento trata.

E o prêmio, ao contrário do de um seguro real, não aparece em nenhuma fatura.

## Problema

A discussão costuma ser conduzida em abstrato:

```text
"não podemos ficar presos a um provedor"
```

A frase não é falsa e não decide nada. Faltam três números:

```text
qual a probabilidade de migrarmos nos próximos 5 anos?
quanto custaria migrar hoje, componente a componente?
quanto a portabilidade custa por mês, em velocidade e capacidade não usada?
```

Sem eles, a decisão é tomada por aversão, e o resultado típico é uma arquitetura que evita
tudo que o provedor oferece de melhor — filas, funções, bancos gerenciados, identidade — e
reimplementa versões piores das mesmas coisas, para preservar uma opção que nunca será
exercida.

O erro simétrico existe e é mais raro: dependência profunda e não avaliada de um serviço
proprietário que depois é descontinuado, tem o preço alterado, ou deixa de atender a um
requisito regulatório.

## Conceitos Centrais

### Portabilidade não é binária

Ela tem camadas, com custos muito diferentes:

```text
camada                     portabilidade   custo de evitar
contêineres                alta            baixo — padrão de fato
armazenamento de objetos   alta            baixo — protocolos convergiram
banco relacional           alta            baixo — motores padrão gerenciados
fila e mensageria          média           médio — protocolos variam
identidade e autorização   baixa           alto
funções sem servidor       baixa           alto
serviços de dados e IA
  proprietários            muito baixa     muito alto
```

Isso permite uma decisão **por componente** em vez de global — e a decisão por componente é
quase sempre superior, porque concentra o prêmio onde ele é barato.

Ver [aprisionamento](/09-cloud-architecture/vendor-lock-in.md).

### Meça o custo de saída, não o suponha

O custo de saída e a portabilidade seletiva são desenvolvidos em
[dependência de fornecedor](/09-cloud-architecture/vendor-lock-in.md), pré-requisito deste
documento. O que segue é o uso desse método numa decisão concreta; o recorte próprio daqui é o
prêmio como seguro, o que ele custa em velocidade, e a probabilidade por motivo de migração.

As estimativas abaixo são de **esforço de reescrita** e supõem volume de dados que cabe numa
janela de corte de um fim de semana. Acima disso, a parcela que domina não é reescrita: é
transferência de saída, e ela precisa entrar como linha própria — volume, preço de egresso e
janela.

```text
componente               esforço estimado de migração
banco (motor padrão)     2 semanas — exportar e importar
armazenamento de objetos 1 semana — protocolo compatível
fila                     4 semanas — reescrever cliente e semântica
identidade               3 meses — reescrever integração e migrar usuários
funções                  4 meses — reescrever e reconstruir orquestração
```

Com esses números, a conversa muda: a discussão deixa de ser sobre estar preso e passa a ser
sobre quanto custa sair, o que é respondível.

E o exercício frequentemente revela que a maior parte do sistema é portável, e o
aprisionamento está concentrado em dois ou três componentes.

### O prêmio é pago em velocidade

```text
usar fila gerenciada do provedor      configuração, pronto
manter portável                        operar um mecanismo próprio, ou
                                       abstrair atrás de uma camada

usar identidade do provedor            semanas
manter portável                        construir ou operar identidade
```

O prêmio não é só custo de infraestrutura — é tempo de engenharia desviado do produto, e
capacidade não usada. Ele é contínuo e invisível, que é a combinação que faz decisões ruins
sobreviverem.

### Abstração preventiva costuma falhar

O padrão comum: envolver os serviços do provedor numa camada própria, para poder trocar
depois.

```text
a camada é desenhada a partir do único provedor conhecido
ela acomoda o menor denominador comum
o segundo provedor tem semântica diferente
a camada não serve, e é reescrita na migração
enquanto isso, ela impediu o uso das capacidades melhores
```

É o mesmo mecanismo de [simplicidade vs. flexibilidade](/20-trade-offs/simplicity-vs-flexibility.md):
abstração construída a partir de um caso tem a forma daquele caso.

O que funciona melhor é **isolar** — concentrar o uso do serviço proprietário em um módulo
pequeno e identificável — sem generalizar. O custo é quase zero e o benefício na migração é
quase o mesmo.

### Portabilidade que vale quase sempre

Algumas escolhas dão portabilidade a custo desprezível e devem ser padrão:

```text
contêineres em vez de imagens de máquina proprietárias
banco com motor padrão, gerenciado pelo provedor
armazenamento com protocolo compatível
infraestrutura declarada em ferramenta multiprovedor
observabilidade com protocolo aberto
```

Todas reduzem a superfície de dependência, e o sacrifício de capacidade é pequeno o bastante
para valer o padrão — com duas exceções conhecidas: carga que depende de extensão ou motor
proprietário não cabe no motor padrão, e serviço recém-lançado costuma chegar à ferramenta
multiprovedor meses depois do provedor. Nos dois casos, a exceção é identificável antes de
decidir.

Ver [infraestrutura como código](/14-devops-and-platform/infrastructure-as-code.md).

### Motivos reais de migração

A probabilidade não é a mesma para todos os cenários, e distingui-los ajuda:

```text
motivo                          probabilidade   o que ele exige
mudança de preço                média           poder negociar, não migrar
aquisição ou fusão              baixa a média   consolidação, com prazo longo
requisito regulatório novo      baixa           região específica, não provedor
descontinuação de serviço       baixa           migração de um componente
insatisfação com confiabilidade muito baixa     raramente motiva migração completa
exigência de cliente            baixa           multiprovedor parcial
```

O primeiro é o mais comum e não exige migração — exige **credibilidade de que a migração é
possível**, que é diferente e mais barata de obter.

### Para qual lado a equipe errou

Os sintomas estão em Modos de Falha e em Erros Comuns. O que a equipe precisa antes deles é
saber a direção do erro, e um teste basta:

```text
pergunte por que o serviço proprietário X não é usado

"não conhecemos alternativa se ele acabar"   → nativo demais
"a política não permite"                     → portável demais
"medimos e não compensa"                     → nenhum dos dois; está certo
```

A terceira resposta é rara, e é o alvo. As duas primeiras têm em comum a ausência de número —
uma teme sem estimar, a outra proíbe sem comparar.

### Custo de mudar de ideia

```text
portável → nativo   barato: passar a usar o que já está disponível
nativo → portável   caro: extrair a dependência depois de espalhada
```

A assimetria favorece portabilidade — mas com uma correção importante: o custo de "nativo →
portável" cai muito se o uso proprietário estiver **isolado** desde o início.

Isso resolve o dilema na prática: isole sem abstrair, use o provedor a fundo, e mantenha o
custo de saída medido e conhecido.

## Modelo Mental

**Portabilidade é seguro com prêmio invisível.** Compre onde é barata, meça o custo de saída
onde não é, e não pague por um sinistro que quase nunca ocorre.

## Quando Usar

Prefira **portabilidade** quando:

- Ela custa pouco — contêineres, motores padrão, protocolos abertos.
- Há exigência contratual ou regulatória de multiprovedor.
- Há probabilidade concreta de migração, com prazo.
- O componente é crítico e a alternativa do provedor é proprietária.

Prefira **nativo** quando:

- O serviço entrega capacidade que você não construiria.
- O custo de saída daquele componente é conhecido e aceitável.
- A velocidade importa mais que a opção.
- A migração é hipotética, sem prazo nem motivo concreto.

## Quando Não Usar

**Como decisão global** — a resposta é por componente.

**Com abstração preventiva** construída a partir de um provedor.

**Sem estimar o custo de saída.**

**Recusando capacidade do provedor por política**, sem número que a justifique.

**Sem isolar** o uso proprietário quando ele é adotado.

## Alternativas

- **Isolar sem abstrair** — módulo identificável, sem camada genérica. Vence quando a
  probabilidade de migrar é baixa mas não nula e o serviço tem substituto de função
  equivalente: custa dias e corta a maior parte do esforço de extração.
- **Portabilidade seletiva** — nas camadas onde é barata, nativo no resto.
- **Multiprovedor real** — caro; justificável apenas com exigência concreta.
- **Nativo com custo de saída documentado** — usar a fundo, e manter a estimativa atualizada.

A última é subestimada: saber que sair custa quatro meses é diferente de temer que seja
impossível, e é suficiente para negociar.

## Trade-offs

| Nativo | Portável |
|---|---|
| Capacidade disponível: a do provedor | Menor denominador comum |
| Entrega rápida | Entrega mais lenta |
| Custo de saída maior | Prêmio contínuo |
| Menos código próprio | Mais |

| Isolar sem abstrair | Camada de abstração |
|---|---|
| Custo de construção quase zero | Camada a construir e manter |
| Usa o serviço a fundo | Menor denominador comum |
| Interface interna a cada uso | Interface interna uniforme |
| Substituição em teste caso a caso | Substituição em teste de graça |
| Migração exige trabalho, contido no módulo | Migração exige reescrita, mesmo assim |

## Modos de Falha

**Abstração preventiva.** Não serve na migração e limitou o uso até lá.

**Custo de saída nunca medido.** Decisão por medo.

**Dependência proprietária crítica.** Sem alternativa quando precisa.

**Portabilidade global por política.** Reimplementa o que existe pronto.

**Uso proprietário espalhado.** Extração cara depois.

**Multiprovedor sem exigência.** Custo alto para um cenário improvável.

## Erros Comuns

**Tratar como decisão global.**

**Construir camada de abstração com um provedor.**

**Não distinguir camadas** em que a portabilidade é barata.

**Não estimar o custo de saída por componente.**

**Confundir poder de negociação com necessidade de migrar.**

## Exemplo Real

Uma empresa de serviços financeiros adotou, em 2021, uma política de portabilidade total:
nenhum serviço proprietário do provedor de nuvem poderia ser usado. A motivação era uma
exigência do conselho, formulada como "não podemos depender de um único fornecedor".

O que foi construído para cumprir a política:

```text
mensageria própria sobre um mecanismo de código aberto, autogerido
identidade própria, em vez do serviço do provedor
orquestração de fluxos própria, em vez de funções gerenciadas
camada de abstração sobre armazenamento de objetos
```

Três anos depois:

```text
engenheiros dedicados a operar essa infraestrutura     4,5 em tempo integral
incidentes/ano nesses componentes                      27
custo de infraestrutura, comparado ao equivalente
  gerenciado                                           -18%
custo total incluindo pessoal                          +140%
tempo médio de entrega de funcionalidade nova          ~2,3× o de uma empresa
                                                       comparável do setor
migrações de provedor realizadas                       0
```

A revisão começou por um exercício que nunca tinha sido feito: estimar o custo de saída,
componente a componente. Primeiro o da arquitetura que existia, que era o que a política
comprava:

```text
contêineres                   1 semana
banco (motor padrão)          3 semanas
armazenamento de objetos      1 semana
observabilidade               2 semanas
                              ————————————————
saída da arquitetura de 2021  ~7 semanas
```

Sete semanas. Esse era o sinistro coberto pelo prêmio de 4,5 engenheiros permanentes e de uma
entrega 2,3× mais lenta — e o desproporcional entre os dois é o achado que abriu a discussão.

Depois o do cenário que a política existia para evitar: a mesma empresa tendo adotado
identidade e funções do provedor, sem isolamento.

```text
componente                    esforço de migração estimado
contêineres                   1 semana
banco (motor padrão)          3 semanas
armazenamento de objetos      1 semana
observabilidade               2 semanas
identidade (se fosse do
  provedor)                   3 meses
funções (se fossem do
  provedor)                   4 meses
                              ————————————————
migração completa hipotética  ~9 meses
```

Nove meses, para um evento que ninguém conseguia associar a um prazo ou a um gatilho
concreto.

E o exercício revelou o ponto que mudou a conversa com o conselho: **a preocupação real era
poder de negociação, não migração.** Uma estimativa de saída documentada e crível atende a
essa preocupação sem nenhum prêmio contínuo.

A política foi reformulada:

**Portabilidade obrigatória onde é barata**: contêineres, motor de banco padrão,
armazenamento com protocolo compatível, observabilidade com protocolo aberto, infraestrutura
declarada em ferramenta multiprovedor.

**Serviços proprietários permitidos**, com duas condições: uso isolado em módulo
identificável, e custo de saída estimado e registrado em ADR, revisado anualmente.

**Nenhuma camada de abstração preventiva.** Isolar, não generalizar.

**Estimativa de saída consolidada** apresentada ao conselho anualmente, como resposta formal
à preocupação original.

**Multiprovedor apenas onde exigido por contrato** — dois clientes tinham essa cláusula, e
apenas para o armazenamento de dados deles.

Resultados após 18 meses:

```text
engenheiros dedicados a infraestrutura própria     1,5
incidentes/ano nesses componentes                   7
custo total                                        -34%
tempo médio de entrega                             -45%
custo de saída consolidado, estimado               ~11 meses
```

O custo de saída **subiu**, e é preciso dizer de quanto para quanto: de sete semanas para onze
meses. A comparação com os nove meses do cenário hipotético não vale, porque aquele cenário
nunca existiu — comparar o real de hoje com um hipotético de ontem é o tipo de conta que faz
uma decisão parecer melhor do que foi.

Os onze meses se decompõem assim:

```text
contêineres, banco, armazenamento, observabilidade    7 semanas (inalterado)
identidade do provedor, isolada                       6 semanas
funções do provedor, isoladas                        10 semanas
fila gerenciada proprietária, isolada                 4 semanas
armazém de dados proprietário                        14 semanas
serviço gerenciado de aprendizado de máquina          6 semanas
                                                     ————————————————
total                                                ~47 semanas ≈ 11 meses
```

Duas leituras saem da tabela. A primeira é que o isolamento fez o que prometia: identidade e
funções, que sem isolamento somariam trinta semanas, somam dezesseis. A segunda é que isso não
impediu o total de subir, porque a reforma adotou três serviços proprietários que a política
antiga não deixava existir. Isolar não barateia a saída em termos absolutos — mantém o custo
**estimável e contido no módulo**, em vez de difuso pelo sistema. É uma promessa menor do que
"portabilidade", e é a que se cumpre.

Isso foi apresentado ao conselho junto com os demais números, e aceito: onze meses de saída,
contra 34% de custo e 45% de prazo, com a estimativa revisada todo ano.

A política de 2021 respondia a uma preocupação legítima com o
instrumento errado. O conselho queria não ficar refém; o que ele precisava era de uma
estimativa crível de saída, e não de uma arquitetura que evitasse a nuvem inteira.

## Conceitos Relacionados

- [Aprisionamento](/09-cloud-architecture/vendor-lock-in.md).
- [Gerenciado vs. Autogerido](/20-trade-offs/managed-vs-self-hosted.md).
- [Simplicidade vs. Flexibilidade](/20-trade-offs/simplicity-vs-flexibility.md) — o mesmo mecanismo de
  opcionalidade.
- [Infraestrutura como Código](/14-devops-and-platform/infrastructure-as-code.md).

## Exercício Prático

Estime, componente a componente, o esforço de migrar seu sistema para outro provedor.

Some. Compare com o custo anual da portabilidade que você mantém hoje. Um dos dois números
provavelmente nunca foi calculado.

## Perguntas de Entrevista

- Por que portabilidade é melhor entendida como seguro?
- Por que abstração preventiva sobre serviços de nuvem costuma falhar na migração?
- Por que poder de negociação e necessidade de migrar exigem respostas diferentes?

## Para Aprofundar

- Hohpe, Gregor. *Cloud Strategy*. Architect Elevator, 2020.
- Newman, Sam. *Building Microservices*. 2ª ed. O'Reilly, 2021.
- Morris, Kief. *Infrastructure as Code*. 2ª ed. O'Reilly, 2020.
