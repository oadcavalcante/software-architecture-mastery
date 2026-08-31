---
id: architecture-levels
title: Níveis de Arquitetura
sidebar_position: 20
description: Quais decisões pertencem a quem — e por que empurrá-las para cima é a causa mais comum de gargalo.
doc_type: concept
level: 6
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor aloca decisões ao nível adequado e reconhece quando uma
  decisão está no lugar errado.
prerequisites: [enterprise-architecture]
related: [enterprise-governance, architecture-review, enterprise-principles]
canonical_for: [níveis de arquitetura, arquitetura de solução, alcance de decisão, decisão reversível]
content_version: 1
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

Errar isso produz os dois problemas característicos: decisões locais tomadas em comitê —
gargalo — e decisões de alcance amplo tomadas por um time isolado — divergência.

## Problema

Numa organização em crescimento, a alocação de decisões costuma evoluir por reação a
incidentes.

Um time escolhe mal uma tecnologia; cria-se uma lista de tecnologias aprovadas. Duas
integrações divergem; cria-se um comitê de integração. Um sistema fica sem dono;
cria-se um processo de aprovação.

Cada resposta é razoável isoladamente. O agregado é uma organização em que decisões
triviais sobem, e o tempo entre decidir e construir se estende.

E o efeito colateral é pior: times que não decidem param de pensar arquiteturalmente,
e a qualidade das decisões locais cai — o que gera mais incidentes, que geram mais
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
costuma se intrometer — com custo alto e benefício nulo.

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

A primeira linha do nível corporativo — propriedade do dado — é a decisão de maior
alcance e a menos tomada explicitamente. Ver
[propriedade do dado](/07-data-architecture/data-ownership.md).

### Decisões de porta única e de porta dupla

A distinção que calibra o rigor:

```text
porta única  difícil ou impossível de reverter
             escolha de banco com anos de dados, contrato público, fronteira de serviço
porta dupla  reversível com custo baixo
             biblioteca, estrutura de código, ferramenta interna
```

Aplicar o mesmo processo às duas é o erro. Decisões de porta dupla devem ser tomadas
rápido, por quem está mais próximo, e revistas se der errado.

Decisões de porta única merecem tempo, alternativas escritas e mais de uma cabeça.

O sintoma de que o processo está calibrado errado: o tempo médio de decisão é o mesmo
para escolher uma biblioteca e para escolher um modelo de dados corporativo.

### O nível de solução é o que costuma faltar

Organizações costumam ter arquitetura corporativa e arquitetura de sistema, e nada entre
elas.

O resultado: uma iniciativa que envolve cinco sistemas não tem ninguém responsável pela
coerência do conjunto. Cada time faz a sua parte bem, e as fronteiras ficam mal
resolvidas — contratos improvisados, dados duplicados, responsabilidades sobrepostas.

Esse nível não exige um cargo. Exige que alguém seja responsável pela decomposição e
pelas fronteiras, com tempo alocado para isso.

### Empurrar para baixo é o padrão saudável

A direção correta do movimento: decisões descem sempre que possível.

```text
sobe   quando o alcance é genuinamente amplo e a reversão é cara
desce  em todo o resto
```

E o mecanismo que permite descer sem perder coerência não é aprovação — é **caminho
pavimentado**: o padrão embutido no que o time já usa, de forma que a escolha certa seja
a mais fácil. Ver
[plataformas internas](/14-devops-and-platform/internal-developer-platforms.md).

Uma regra que precisa ser verificada por um comitê é uma regra que não foi
operacionalizada.

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

**Aplicando o mesmo rigor a todas as decisões.**

**Centralizando decisões de porta dupla.**

**Sem nível de solução**, em iniciativas que atravessam sistemas.

**Alocando por senioridade** em vez de por contexto.

**Criando regra** onde um caminho pavimentado resolveria.

## Alternativas

- **Caminho pavimentado** — o padrão embutido, em vez de regra verificada.
- **Princípios** — orientam sem decidir. Ver
  [princípios corporativos](/15-enterprise-architecture/enterprise-principles.md).
- **Consulta em vez de aprovação** — o time decide, com opinião disponível.
- **Revisão após o fato** — para decisões reversíveis, revisar depois é mais barato que
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

## Modos de Falha

**Comitê aprovando o trivial.**

**Decisão de alcance amplo tomada isoladamente.** Divergência descoberta tarde.

**Ausência do nível de solução.** Fronteiras mal resolvidas.

**Times que param de pensar.** A centralização remove a prática.

**Regra sem operacionalização.** Depende de alguém verificar.

**Aprovação como ritual.** Assinada sem avaliação.

## Erros Comuns

**Subir decisões reversíveis.**

**Não distinguir porta única de porta dupla.**

**Não ter responsável pela coerência de iniciativas grandes.**

**Criar regra em vez de caminho pavimentado.**

**Decidir por senioridade.**

**Não revisar a alocação** quando a organização muda de tamanho.

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

Setenta e um por cento do tempo do comitê era gasto em decisões que o time poderia ter
tomado — escolha de biblioteca, estrutura de código, ferramenta interna.

E o comitê aprovava quase tudo: a taxa de rejeição era de 3%. Ele funcionava como
carimbo com quatro semanas de espera.

A reformulação:

**Classificação na abertura.** Quem propõe declara alcance e reversibilidade. Decisões
de porta dupla e alcance local não passam pelo comitê — são registradas e seguem.

**Caminho pavimentado** substituindo a lista de tecnologias. A plataforma passou a
oferecer as opções suportadas prontas; usar outra coisa é possível e o time assume a
operação. Ver
[plataformas internas](/14-devops-and-platform/internal-developer-platforms.md).

**Nível de solução criado.** Iniciativas com mais de dois sistemas passaram a ter um
responsável pela decomposição e pelos contratos, com tempo alocado — sem cargo novo, por
rotação entre engenheiros seniores.

**Revisão após o fato** para decisões reversíveis, trimestral, olhando padrões em vez de
casos.

**Comitê reduzido** a decisões de alcance amplo e reversão cara — cerca de uma por mês.

Resultado em nove meses: tempo entre propor e construir de quatro semanas para dois
dias, e o comitê passou a discutir substância.

E um efeito que a equipe não esperava: a **qualidade das decisões locais melhorou**. Com
a responsabilidade devolvida, os times passaram a escrever registros de decisão e a
discutir alternativas — o que não faziam quando alguém decidia por eles.

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
- Qual a diferença entre decisão de porta única e de porta dupla?
- Por que caminho pavimentado é preferível a regra verificada?

## Para Aprofundar

- Bezos, Jeff. *Carta aos acionistas*, 2015 — decisões de porta única e dupla.
- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
- Ford, Neal et al. *Software Architecture: The Hard Parts*. O'Reilly, 2021.
