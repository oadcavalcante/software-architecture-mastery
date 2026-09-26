---
id: architecture-vision
title: Visão de Arquitetura
sidebar_position: 3
description: Um destino que orienta decisão sem prescrever cada passo — e que precisa ser lembrável.
doc_type: concept
level: 7
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor enuncia uma visão arquitetural curta que orienta decisões
  independentes, com critério para saber se ela está funcionando.
prerequisites: [architecture-leadership-basics]
related: [technical-strategy-leadership, technical-roadmaps, communication]
canonical_for: [visão de arquitetura, destino arquitetural, visão lembrável, orientação sem prescrição]
content_version: 2
last_reviewed: 2026-08-29
---

# Visão de Arquitetura

## Visão Geral

Uma visão de arquitetura descreve **onde a arquitetura precisa chegar**, de forma que decisões
tomadas de forma independente convirjam para lá.

```text
não é   um diagrama do estado futuro completo
não é   um plano com etapas e datas
é       um destino enunciado de forma que alguém consiga
        usá-lo para decidir, sozinho, na terça-feira
```

O teste é esse último: uma visão que não pode ser usada para decidir uma questão concreta não é
visão — é declaração de intenção.

E há um segundo teste, mais duro: **ela é lembrável?** Uma visão que precisa ser consultada num
documento de vinte páginas não vai orientar nada, porque as decisões que ela deveria orientar
acontecem sem consulta.

## Problema

O documento de visão típico:

```text
"Nossa arquitetura será moderna, escalável, resiliente e
 orientada a eventos, permitindo entrega ágil de valor com
 alta qualidade e segurança."
```

Isso não elimina nenhuma opção. Diante de uma escolha real — um banco ou dois, síncrono ou
assíncrono, extrair ou manter —, ele não ajuda em nada.

E o erro oposto: a visão como diagrama detalhado do estado alvo, com quarenta componentes. Ela
prescreve demais, envelhece rápido, e transforma decisões locais em conformidade com um desenho
feito por quem não está no problema.

```text
vaga demais       não orienta
detalhada demais  não sobrevive, e não delega
```

## Conceitos Centrais

### Uma visão útil elimina opções

```text
fraco   "vamos ser orientados a eventos"
forte   "todo dado que atravessa domínio é publicado como evento;
        nenhum time lê o banco de outro"
```

A segunda frase decide dezenas de questões concretas sem prever nenhuma delas. É isso que uma
visão faz quando funciona.

O teste: pegue três decisões reais tomadas no último mês e verifique se a visão teria orientado
cada uma. Se não, ela não está operando.

Esse teste é aplicável em qualquer momento e quase nunca é feito. Ele tem a vantagem de ser
retrospectivo: não exige prever o que a visão vai orientar, apenas verificar o que ela teria
orientado — e a verificação retrospectiva é muito mais confiável que a projeção.

Quando o resultado é ruim, há dois diagnósticos possíveis: a visão está vaga demais, ou ela está
correta e não é conhecida. Os dois exigem ação diferente, e distingui-los é simples — basta
perguntar a quem decidiu se a visão teria mudado algo.

### Curta o bastante para ser lembrada

```text
alvo   três a cinco afirmações, cada uma em uma frase
```

Isso parece pouco e é o limite prático. Uma pessoa que está decidindo algo às quatro da tarde não
vai abrir um documento — ela vai decidir com o que lembra.

```text
"Todo domínio tem um dono e um banco próprio."
"Dado entre domínios trafega como evento, nunca por leitura direta."
"Serviços novos nascem do gabarito, ou justificam por que não."
"O que a plataforma oferece, os times não constroem."
```

Quatro frases. Elas orientam a maior parte das decisões de fronteira de uma organização, e cabem
na cabeça.

### Enuncie o porquê junto

Uma visão sem razão vira regra arbitrária, e regras arbitrárias são contornadas.

```text
"Dado entre domínios trafega como evento, nunca por leitura
 direta — porque leitura direta acopla esquemas e nos custou
 sete incidentes no último ano."
```

O número é o que sustenta a afirmação. Ver
[comunicação](/23-architecture-leadership/communication.md).

### Deixe o caminho aberto

```text
visão      onde precisamos chegar, e por quê
roadmap    em que ordem, e quando
decisão    como, em cada caso
```

Confundir os três é o erro estrutural mais comum. Uma visão que prescreve o caminho remove a
autonomia que a torna escalável — e o valor da visão está justamente em permitir que muitas
pessoas decidam bem sem coordenar.

Ver [roadmaps técnicos](/23-architecture-leadership/technical-roadmaps.md).

### Descreva também o que não é

```text
"Não vamos padronizar linguagem de programação."
"Não vamos ter um modelo canônico de dados corporativo."
"Não vamos exigir aprovação central para escolha de biblioteca."
```

Enunciar o que a visão **não** pretende é tão orientador quanto o que ela pretende, e evita a
interpretação expansiva — a leitura de que a visão justifica qualquer padronização.

### A visão precisa ter dono e revisão

```text
sem dono       ninguém a atualiza quando o contexto muda
sem revisão    orienta com premissas de outra época
```

Uma visão criada em 2021 para uma organização de seis times pode ser ativamente prejudicial numa
de trinta. Revisão anual, com a pergunta "as condições que produziram isto ainda valem?", basta.

Ver [princípios](/23-architecture-leadership/leadership-principles.md).

### Comunicada muitas vezes, em muitos lugares

Uma visão enunciada uma vez numa apresentação não existe. Ela precisa aparecer onde as decisões
acontecem:

```text
no início de revisões de desenho
como critério explícito em ADRs
no material de integração de pessoas novas
citada quando uma decisão a segue, e quando não segue
```

A última é a mais eficaz: dizer "essa decisão vai contra a visão, e aqui está por que estamos
abrindo exceção" ensina o conteúdo da visão melhor que qualquer apresentação.

A razão é que ela mostra a visão sendo **usada**, e não apenas enunciada. Uma pessoa que assiste a
uma decisão sendo justificada contra a visão aprende três coisas de uma vez: que a visão existe,
que ela tem consequência, e que ela não é dogma. As três juntas são o que produz adoção genuína.

O oposto — uma visão que nunca é citada porque nenhuma decisão a contraria — costuma indicar que
ela é vaga demais para ser contrariada.

## Modelo Mental

**Três a cinco frases, com o porquê, que eliminam opções.** Se não cabe na cabeça, não vai
orientar decisão nenhuma.

## Quando Usar

- Quando decisões independentes precisam convergir.
- Quando quem decide arquitetura não cabe mais numa mesma reunião, e o critério deixa de circular
  pela conversa.
- Antes de um roadmap, porque ele deriva dela.

## Quando Não Usar

**Quando todos os que decidem cabem numa reunião.** Com três ou quatro times e um punhado de pessoas decidindo arquitetura, o critério circula na conversa semanal e se corrige no mesmo dia. Uma visão escrita duplica o que todos já ouviram, e ainda cobra dono e revisão.

**Quando as premissas mudam mais rápido que o ciclo de revisão.** Numa organização em pivô, com produto ou modelo de negócio redefinido a cada trimestre, uma visão revista anualmente orienta com premissas já descartadas — e com a autoridade de documento oficial. Enquanto o contexto não estabiliza, decisões reversíveis registradas em ADRs curtos servem melhor.

**Quando ainda não há decisões de onde derivá-la.** A visão que funciona descreve critérios que a organização já usa (ver o Exemplo Real). Com meia dúzia de ADRs não existe critério recorrente para enunciar, e o que sair será aspiração — a declaração de adjetivos da seção Problema, com outra roupa.

## Alternativas

- **Princípios** — mais granulares, orientam julgamento em situações específicas. Ver
  [princípios](/23-architecture-leadership/leadership-principles.md).
- **Conjunto de ADRs** — precedentes concretos ensinam o critério da organização melhor que
  abstrações.
- **Arquitetura alvo** — o diagrama do estado futuro, útil como complemento e não como visão. Ver
  [arquitetura alvo](/15-enterprise-architecture/target-architecture.md).
- **Nada** — em organizações pequenas, a conversa resolve, e uma visão formal é cerimônia.

## Trade-offs

| Visão curta | Detalhada |
|---|---|
| Lembrada e usada | Cobre mais casos |
| Deixa lacunas | Não sobrevive à mudança |
| Delega decisão | Prescreve |

| Com o que não é | Só o que é |
|---|---|
| Evita interpretação expansiva | Mais curta |
| Exige decidir os limites | Ambígua nas bordas |

## Modos de Falha

**Adjetivos.** "Moderna, escalável e segura" não elimina nenhuma opção e não orienta nenhuma decisão.

**Detalhada demais.** Envelhece em meses, não delega, e vira plano — que é outra coisa, com outro ciclo
de revisão.

**Sem porquê.** Vira regra arbitrária e é contornada; sem o problema que resolve, não pode ser
reavaliada quando o contexto mudar.

**Sem fronteira.** Sem dizer o que não é, cada time lê a visão como autorização para o que já queria
fazer.

**Não lembrável.** Não orienta as decisões que importam.

**Sem dono e sem revisão.** Ninguém a atualiza, e a visão desatualizada orienta na direção errada com
a mesma autoridade.

**Comunicada uma vez.** Fica desconhecida de quem decide no dia a dia — na prática, não existe.

## Erros Comuns

**Confundir visão com roadmap** ou com diagrama alvo. A visão ganha datas, passa a ser revista a
cada trimestre junto com o plano e deixa de ser referência estável: quem decide hoje não sabe se o
critério ainda vale no mês que vem.

**Escrever em linguagem de apresentação corporativa.** Frases feitas para passar em comitê não
distinguem entre duas opções concretas, então nenhuma revisão de desenho consegue citá-las para
decidir — e a visão deixa de ser citada.

**Não testar** contra decisões reais recentes. A visão pode passar anos sem orientar nada sem que
ninguém perceba; o documento do Exemplo Real passou dois.

**Não dizer o que fica de fora.** A visão passa a justificar padronizações que nunca pretendeu, e
times que a leem de boa-fé perdem autonomia em decisões que ela deixava livres.

**Não citar a visão** quando uma decisão a contraria. A exceção vira precedente silencioso: a próxima
pessoa vê a decisão, não vê a razão, e conclui que a visão não tem consequência.

## Exemplo Real

Uma empresa de tecnologia com 26 times tinha um documento de visão arquitetural de 34 páginas,
publicado em 2022. Uma pesquisa em 2024 encontrou:

```text
engenheiros que sabiam que o documento existia    61%
que o tinham lido                                 18%
que conseguiam citar algum conteúdo               4%
decisões arquiteturais que o citavam (ADRs)       2 de 187
```

Quatro por cento de retenção. O documento era bem escrito e não estava operando.

A reformulação produziu quatro frases, derivadas do próprio acervo de ADRs — a área de arquitetura
leu os 187 registros e extraiu os critérios que de fato tinham sido usados:

```text
1. Todo domínio tem um time dono e armazenamento próprio.
   Porque acesso cruzado a banco nos custou 11 incidentes e
   bloqueou 4 migrações nos últimos dois anos.

2. Dado entre domínios trafega por contrato explícito — evento
   ou API —, nunca por leitura direta.
   Mesma razão.

3. O que a plataforma oferece, os times não reconstroem.
   Porque tínhamos 6 implementações de autenticação e 4 de
   observabilidade, com custo de manutenção de ~3 pessoas.

4. Serviços novos nascem do gabarito, ou registram por que não.
   Porque 71% dos incidentes de serviços novos em 2023 vinham
   de configuração ausente que o gabarito resolve.

O que esta visão NÃO define:
   linguagem de programação, escolhida pelo time
   estrutura interna dos serviços, escolhida pelo time
   escolha de biblioteca, escolhida pelo time
```

**Comunicação em três lugares:** citada no início de toda revisão de desenho; incluída como seção
obrigatória em ADRs — "esta decisão se relaciona com qual item da visão?"; e no material de
integração de pessoas novas.

**Revisão anual**, com o critério de que cada item precisa ainda eliminar opções em discussões
reais.

Doze meses depois:

```text
engenheiros que conseguiam citar ao menos 2 itens     78%
ADRs que citam a visão                                104 de 131
exceções registradas ao item 4                        9, todas com razão
acessos cruzados a banco introduzidos                 0
implementações duplicadas de capacidade de
  plataforma                                          0 novas
```

E na revisão anual, um item foi removido: o quarto, sobre gabarito, tinha virado consenso. As nove
exceções se concentraram nos primeiros cinco meses; no segundo semestre nenhum serviço novo cogitou
nascer fora do gabarito, e o item já não eliminava opção nenhuma em discussão. Ele foi promovido a padrão verificado
automaticamente — o que é a evolução correta de um item de visão que já não gera decisão.

A avaliação posterior aponta: derivar a visão do acervo de ADRs, em vez de escrevê-la do zero, foi a
decisão de método mais acertada. Os quatro itens não eram aspiração — eram a descrição dos
critérios que a organização já usava, enunciados de forma lembrável.

## Conceitos Relacionados

- [Estratégia Técnica](/23-architecture-leadership/technical-strategy-leadership.md).
- [Roadmaps Técnicos](/23-architecture-leadership/technical-roadmaps.md).
- [Princípios](/23-architecture-leadership/leadership-principles.md).
- [Arquitetura Alvo](/15-enterprise-architecture/target-architecture.md).

## Exercício Prático

Pegue as dez últimas decisões arquiteturais da sua organização e tente derivar delas três a cinco
afirmações que as expliquem.

Compare com a visão declarada, se houver. A diferença entre as duas é a distância entre o que a
organização diz e o que ela faz.

## Perguntas de Entrevista

- Por que uma visão precisa ser lembrável para funcionar?
- Por que dizer o que a visão não define é tão orientador quanto o que ela define?
- Por que um item de visão que virou consenso deveria ser removido?

## Para Aprofundar

- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.
- Rumelt, Richard. *Good Strategy Bad Strategy*. Crown Business, 2011.
- Ford, Neal et al. *Building Evolutionary Architectures*. 2ª ed. O'Reilly, 2022.
