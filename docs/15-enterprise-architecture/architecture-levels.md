---
id: architecture-levels
title: Níveis de Arquitetura
sidebar_position: 20
description: Quais decisões pertencem a quem, e por que empurrá-las para cima é a causa mais comum de gargalo.
doc_type: concept
level: 6
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor aloca decisões ao nível adequado e reconhece quando uma
  decisão está no lugar errado.
prerequisites: [enterprise-architecture]
related: [enterprise-governance, architecture-review, enterprise-principles]
canonical_for: [níveis de arquitetura, arquitetura de solução, alcance de decisão]
content_version: 3
last_reviewed: 2026-08-28
---

# Níveis de Arquitetura

## Visão Geral

Decisões de arquitetura acontecem em alcances diferentes:

```text
corporativo   atravessa a organização — vale por anos, muitos sistemas
de solução    um problema de negócio, alguns sistemas — meses a anos
de sistema    um sistema, um time — semanas a meses
de componente dentro do sistema — dias a semanas
```

A pergunta que organiza esta seção: **qual decisão pertence a qual nível?**

Errar isso produz os dois problemas característicos: decisões locais tomadas em comitê
(gargalo) e decisões de alcance amplo tomadas por um time isolado (divergência).

## Problema

Numa organização em crescimento, a alocação de decisões costuma evoluir por reação a
incidentes.

Um time escolhe mal uma tecnologia; cria-se uma lista de tecnologias aprovadas. Duas
integrações divergem; cria-se um comitê de integração. Um sistema fica sem dono;
cria-se um processo de aprovação.

Cada resposta é razoável isoladamente. O agregado é uma organização em que decisões
triviais sobem, e o tempo entre decidir e construir se estende.

E o efeito colateral é pior: times que não decidem param de pensar arquiteturalmente,
e a qualidade das decisões locais cai, o que gera mais incidentes, que geram mais
centralização.

## Conceitos Centrais

### O critério: alcance e custo de reverter

Duas perguntas alocam a decisão:

```text
quantas partes ela afeta?      um time, alguns, toda a organização
quanto custa mudar de ideia?   dias, meses, anos
```

```text
alcance amplo + reversão cara     → corporativo
alcance amplo + reversão barata   → recomendação, não regra
alcance local + reversão cara     → do sistema, com revisão
alcance local + reversão barata   → do time, sem cerimônia
```

O quadrante inferior direito contém a **maioria** das decisões, e é onde a centralização
costuma se intrometer, com custo alto e benefício próximo de zero, porque o erro que o
comitê evitaria o time desfaz em dias.

E o quadrante superior direito merece atenção: uma decisão de alcance amplo mas
facilmente reversível não precisa de regra. Ela precisa de visibilidade e de um caminho
pavimentado. Ver
[engenharia de plataforma](/14-devops-and-platform/platform-engineering.md).

### O que pertence a cada nível

```text
corporativo   quem é dono de qual dado
              estilos de integração permitidos
              modelo de identidade e acesso
              o que é comprado e o que é construído
              onde a organização investe e o que aposenta

de solução    decomposição de um problema de negócio em sistemas
              contratos entre eles
              onde o estado mora
              estratégia de migração

de sistema    modelo de dados interno
              estilo arquitetural do sistema
              escolha de armazenamento, dentro do permitido
              estratégia de teste e de implantação

de componente estrutura de código, padrões, bibliotecas
```

A primeira linha do nível corporativo, propriedade do dado, é a decisão de maior
alcance e a menos tomada explicitamente. Ver
[propriedade do dado](/07-data-architecture/data-ownership.md).

### Reversibilidade como eixo de alocação

A distinção entre decisões de mão única e de mão dupla, e o rigor que cada uma merece,
estão em [decisão sob incerteza](/23-architecture-leadership/decision-making.md). O que
ela faz aqui é servir de segundo eixo do quadrante: dentro do mesmo alcance, o custo de
reverter separa o que passa por revisão do que segue sem cerimônia.

O sintoma de que a alocação ignora esse eixo: o tempo médio de decisão é o mesmo para
escolher uma biblioteca e para escolher um modelo de dados corporativo.

E a reversibilidade não é propriedade fixa da decisão: ela cai com o uso. Uma
biblioteca adotada por um serviço é de mão dupla; a mesma biblioteca espalhada por
quarenta serviços, com os tipos dela nos contratos entre eles, virou de mão única sem
que ninguém a tenha decidido de novo. A classificação feita quando a decisão nasce
precisa ser refeita quando o alcance cresce.

### O nível de solução é o que costuma faltar

Organizações costumam ter arquitetura corporativa e arquitetura de sistema, e nada entre
elas.

O resultado: uma iniciativa que envolve cinco sistemas não tem ninguém responsável pela
coerência do conjunto. Cada time faz a sua parte bem, e as fronteiras ficam mal
resolvidas: contratos improvisados, dados duplicados, responsabilidades sobrepostas.

Esse nível não exige um cargo. Exige que alguém seja responsável pela decomposição e
pelas fronteiras, com tempo alocado para isso.

### Empurrar para baixo é o padrão saudável

A direção correta do movimento: decisões descem sempre que possível.

```text
sobe   quando o alcance é genuinamente amplo e a reversão é cara
desce  em todo o resto
```

E o mecanismo que permite descer sem perder coerência não é aprovação, e sim **caminho
pavimentado**: o padrão embutido no que o time já usa, de forma que a escolha certa seja
a mais fácil. Ver
[engenharia de plataforma](/14-devops-and-platform/platform-engineering.md).

Quando a regra é técnica (formato de log, versão mínima de biblioteca, configuração de
rede), precisar de um comitê para verificá-la é sinal de que ela não foi
operacionalizada. Regras regulatórias e de propriedade de dado são a exceção: dependem de
julgamento e continuam no nível corporativo.

### Quem decide não é quem sabe mais

Um erro de desenho organizacional: alocar a decisão a quem tem mais senioridade, em vez
de a quem tem mais contexto.

O arquiteto corporativo sabe mais sobre o panorama; o time sabe mais sobre o problema
concreto. Decisões de sistema tomadas por quem não convive com o sistema tendem a
ignorar restrições que só aparecem na prática.

O modelo que funciona: o nível superior define **restrições e critérios**; o nível
inferior decide **dentro** deles.

## Modelo Mental

**Alcance e custo de reverter alocam a decisão.** A maioria delas pertence ao time, e a
tendência organizacional é puxá-las para cima.

## Quando Usar

- Ao desenhar processo de governança.
- Ao decidir o que exige revisão.
- Quando o tempo de decisão vira reclamação.
- Ao definir o papel de arquitetos na organização.

## Quando Não Usar

**Organização com um ou dois times.** Os níveis corporativo e de solução coincidem com o
de sistema: quem decide a fronteira é quem a implementa. Formalizar a alocação cria papéis
sem ninguém diferente para ocupá-los; a conversa entre os dois times resolve.

**Setor regulado, quando a norma exige aprovação prévia.** Se o regulador exige aprovação
documentada para mudança em sistema que trata dado de pagamento ou de saúde, a decisão
sobe mesmo sendo reversível. O quadrante continua valendo para o que a norma não cobre,
mas não anula a exigência: tratá-la como decisão local é risco de conformidade.

**Durante incidente grave ou migração com prazo fixo.** Centralizar por algumas semanas,
com um responsável decidindo rápido, é deliberado: o custo de coordenar decisões
distribuídas supera o do gargalo enquanto o evento dura. O erro é não desfazer a
centralização quando ele acaba.

**Antes de existir o caminho pavimentado.** Descer decisões pressupõe que o padrão esteja
embutido em algo que o time usa. Sem isso, descer tudo de uma vez produz a divergência
que a centralização continha. A ordem é construir o caminho e depois descer.

## Alternativas

- **Caminho pavimentado**: o padrão embutido, em vez de regra verificada.
- **Princípios**: orientam sem decidir. Ver
  [princípios corporativos](/15-enterprise-architecture/enterprise-principles.md).
- **Consulta em vez de aprovação**: o time decide, com opinião disponível.
- **Revisão após o fato**: para decisões reversíveis, revisar depois é mais barato que
  aprovar antes.

## Trade-offs

| Decisão centralizada | Distribuída |
|---|---|
| Coerência entre times | Divergência |
| Gargalo | Velocidade |
| Contexto amplo | Contexto profundo |
| Menos experimentação | Mais |

| Rigor uniforme | Calibrado por reversibilidade |
|---|---|
| Simples de operar | Exige julgamento |
| Lento para o trivial | Rápido onde pode |
| Sem classificação a auditar | Quem propõe tende a declarar local e reversível |

## Modos de Falha

**Comitê aprovando o trivial.**

**Decisão de alcance amplo tomada isoladamente.** Divergência descoberta tarde.

**Ausência do nível de solução.** Fronteiras mal resolvidas.

**Times que param de pensar.** A centralização remove a prática.

**Regra sem operacionalização.** Depende de alguém verificar.

**Aprovação como ritual.** Assinada sem avaliação.

## Erros Comuns

**Subir decisões reversíveis.** Exigir aprovação para toda biblioteca nova: a pauta do
comitê incha, a espera chega a semanas, e o time contorna com dependência transitiva não
declarada, que ninguém revisa.

**Não distinguir mão única de mão dupla.** Um fluxo único de aprovação para tudo: se ele
é leve, a escolha do banco corporativo passa sem alternativas escritas; se é pesado, a
escolha de ferramenta interna espera um mês.

**Não ter responsável pela coerência de iniciativas grandes.** Numa iniciativa de cinco
sistemas, cada par de times negocia seu contrato: o mesmo evento aparece em três formatos,
e a reconciliação vira projeto próprio depois do lançamento.

**Criar regra em vez de caminho pavimentado.** Publicar "todo serviço expõe métricas no
padrão X" sem biblioteca que o faça: parte dos serviços segue, a outra descobre a regra na
revisão, e o cumprimento passa a depender de alguém verificar.

**Decidir por senioridade.** O arquiteto corporativo escolhe o armazenamento de um sistema
que não opera: a escolha ignora o padrão de acesso real, e o time paga a reescrita depois.

**Não revisar a alocação** quando a organização muda de tamanho. O comitê desenhado para
40 engenheiros mantém o mesmo escopo com 200: a fila cresce com o número de times, e o
tempo de decisão acompanha.

## Exemplo Real

Uma empresa de serviços cresceu de 40 para 200 engenheiros em três anos. O processo de
arquitetura acompanhou por acumulação:

```text
comitê de arquitetura semanal, com 14 itens em média
lista de tecnologias aprovadas, com 60 entradas
aprovação obrigatória para qualquer serviço novo
revisão de arquitetura antes de qualquer implementação
```

O tempo médio entre propor e começar a construir era de **quatro semanas**.

A análise dos itens do comitê nos seis meses anteriores classificou 340 decisões:

```text
alcance local, reversão barata   71%   → não deveriam estar ali
alcance local, reversão cara     18%   → revisão sim, aprovação não
alcance amplo, reversão barata    7%   → visibilidade, não aprovação
alcance amplo, reversão cara      4%   → corretamente ali
```

Setenta e um por cento dos itens do comitê eram decisões que o time poderia ter
tomado: escolha de biblioteca, estrutura de código, ferramenta interna.

E o comitê aprovava quase tudo: a taxa de rejeição era de 3%. Ele funcionava como
carimbo com quatro semanas de espera.

A reformulação:

**Classificação na abertura.** Quem propõe declara alcance e reversibilidade. Decisões
de mão dupla e alcance local não passam pelo comitê: são registradas e seguem.

Como quem propõe tem incentivo para se declarar local e reversível, a classificação é
auditada: a revisão trimestral sorteia uma amostra das decisões registradas e as
reclassifica, e uma decisão cujo alcance cresceu desde o registro (a biblioteca que três
times adotaram depois) sobe para o comitê nesse momento.

**Caminho pavimentado** substituindo a lista de tecnologias. A plataforma passou a
oferecer as opções suportadas prontas; usar outra coisa é possível e o time assume a
operação. Ver
[engenharia de plataforma](/14-devops-and-platform/platform-engineering.md).

**Nível de solução criado.** Iniciativas com mais de dois sistemas passaram a ter um
responsável pela decomposição e pelos contratos, com tempo alocado, sem cargo novo, por
rotação entre engenheiros seniores.

**Revisão após o fato** para decisões reversíveis, trimestral, olhando padrões em vez de
casos.

**Comitê reduzido** a decisões de alcance amplo e reversão cara: duas a três por mês,
o mesmo volume que já estava corretamente ali.

Resultado em nove meses: tempo entre propor e construir de quatro semanas para dois
dias, e o comitê passou a discutir substância.

E um efeito que a equipe não esperava: a **qualidade das decisões locais melhorou**. Com
a responsabilidade devolvida, os times passaram a escrever registros de decisão e a
discutir alternativas, o que não faziam quando alguém decidia por eles.

O ponto que a equipe sublinha: cada item do processo tinha sido criado em resposta a um
problema real. Nenhum tinha sido revisado quando a organização mudou de tamanho.

## Conceitos Relacionados

- [Governança Corporativa](/15-enterprise-architecture/enterprise-governance.md).
- [Revisão de Arquitetura](/15-enterprise-architecture/architecture-review.md).
- [Princípios Corporativos](/15-enterprise-architecture/enterprise-principles.md).
- [Engenharia de Plataforma](/14-devops-and-platform/platform-engineering.md).

## Exercício Prático

Pegue as últimas vinte decisões que passaram pelo seu processo de arquitetura e
classifique cada uma por alcance e custo de reverter.

A proporção que cai em "local e reversível" é o desperdício do seu processo atual.

## Perguntas de Entrevista

- Que critérios alocam uma decisão a um nível?
- Qual a diferença entre decisão de mão única e de mão dupla?
- Por que caminho pavimentado é preferível a regra verificada?

## Para Aprofundar

- Bezos, Jeff. *Carta aos acionistas de 2015*. Decisões de mão única e de mão
  dupla.
- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
- Ford, Neal et al. *Software Architecture: The Hard Parts*. O'Reilly, 2021.
