---
id: cross-team-architecture
title: Arquitetura entre Times
sidebar_position: 10
description: Decisões que atravessam fronteiras, onde nenhum time tem autoridade e a coordenação é o produto.
doc_type: concept
level: 7
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor conduz uma decisão que atravessa times até a adoção, com contrato
  explícito e divergência registrada.
prerequisites: [architecture-leadership-basics]
related: [conways-law, technical-influence, negotiating-tradeoffs]
canonical_for: [decisão que atravessa times, coordenação arquitetural, interface entre times]
content_version: 3
last_reviewed: 2026-08-29
---

# Arquitetura entre Times

## Visão Geral

A maior parte das decisões arquiteturais é local: um time decide, implementa, e responde pelo
resultado. Essas decisões não precisam de arquiteto.

O trabalho de liderança arquitetural começa nas decisões que **atravessam** fronteiras, onde
nenhum time tem autoridade sobre o outro, e onde a consequência de decidir mal é de todos.

```text
formato de evento publicado           afeta todos os consumidores
protocolo de integração               afeta quem integra
identidade e autenticação             afeta o conjunto
propriedade de um dado compartilhado  afeta quem escreve e quem lê
fronteira entre dois domínios         afeta os dois times
```

E há uma característica que define esse tipo de decisão: **ela não é tomada, ela é adotada**. Uma
decisão que atravessa times e não é seguida por todos não existe.

## Problema

Três padrões de fracasso, todos comuns.

**Ninguém decide.** A decisão fica pendente porque nenhum dos times tem autoridade e nenhum quer
assumir o custo de coordenar. Cada um segue com sua versão, e a divergência acumula até virar
problema de integração.

**Alguém decide e ninguém adota.** Um arquiteto ou um time decide unilateralmente, os demais não
participaram, e a decisão é ignorada em silêncio. Ver
[exceções](/19-architecture-governance/exceptions.md): o descumprimento invisível é a forma
usual.

**Decide-se por escalada.** A discordância sobe para um gestor comum, que decide sem contexto
técnico. A decisão pode até ser boa, e o custo é que os times aprendem que discordar é uma forma
de terceirizar a decisão, e passam a escalar mais.

```text
o padrão saudável   os times decidem, com o arquiteto ajudando
                    a estruturar a conversa
o padrão que
  degrada           o arquiteto ou o gestor decide, e os times
                    executam sem convicção
```

## Conceitos Centrais

### Só coordene o que precisa ser coordenado

O critério é a externalidade: quem arca com a consequência.

```text
consequência local          o time decide, e o arquiteto não entra
consequência compartilhada  precisa de coordenação
consequência organizacional precisa de decisão central
```

Ver [governança federada](/19-architecture-governance/federated-governance.md).

Coordenar decisões locais é o erro que transforma arquitetura em burocracia. Cada coordenação
desnecessária consome atenção e reduz a disposição dos times a coordenar quando importa.

### Interfaces, não implementações

```text
coordenado    o contrato entre os times: formato, protocolo,
              semântica, política de evolução
local         como cada um cumpre o contrato
```

Essa divisão é o que permite coordenação com pouco atrito. Discutir a implementação interna de
outro time consome tempo, gera resistência e não melhora o resultado: o contrato é o que importa
para quem está do outro lado.

Ver [contratos de integração](/08-integration-architecture/integration-contracts.md).

### Traga os times antes de propor

O erro de sequência mais comum:

```text
ruim   arquiteto analisa → propõe → apresenta aos times → resistência
bom    arquiteto estrutura o problema → times participam da análise
       → proposta conjunta → adoção
```

A segunda sequência é mais lenta e produz adoção. A primeira é mais rápida e produz uma decisão
que existe só no documento.

O papel do arquiteto na segunda sequência é diferente e mais difícil: ele estrutura a conversa,
traz o contexto que os times não têm (histórico, outros sistemas, restrições organizacionais) e
mantém a discussão em critérios em vez de preferências.

### Registre a divergência quando ela persistir

Nem toda discordância se resolve. Quando não se resolve:

```text
"o time A defende X, por causa de Y. O time B defende Z, por
 causa de W. A decisão foi X, aceitando o risco que B apontou,
 com revisão em 6 meses."
```

Isso faz três coisas. Preserva o argumento de quem discordou, que importa se o risco se
materializar. Torna a decisão revisável com base em evidência em vez de em nova discussão. E dá
ao time discordante o reconhecimento de que sua posição foi considerada. Isso remove
o motivo mais comum de descumprimento silencioso: não ter sido ouvido.

Ver [decisão em ADR](/18-architecture-decisions/adr-decision.md).

### A adoção precisa ser acompanhada

Uma decisão que atravessa times não termina quando é tomada:

```text
decidida        registrada
comunicada      os times sabem
adotada         sistemas novos seguem
convergida      sistemas antigos migraram
```

Acompanhar o progresso nessa escala é parte do trabalho, e é o que distingue uma decisão de uma
declaração. Ver
[padrões](/23-architecture-leadership/leadership-standards.md).

E o acompanhamento tem um efeito adicional: ele revela quando a decisão está errada. Baixa adoção
voluntária costuma ser informação sobre a decisão, não sobre a disciplina dos times.

### Migração precisa de quem pague

```text
"todos os times devem migrar para o novo formato"
```

Essa frase, sem responder quem paga o esforço, é aspiração. Times têm prioridades próprias, e
migrar por conformidade compete com entregar valor, e perde.

As saídas: financiar a migração centralmente, incluí-la no roteiro negociado de cada time, ou
fornecer ferramenta que a torne barata. Sem uma delas, a adoção
chega aos sistemas novos e a convergência estagna nos antigos, que só saem de cena quando alguém os
descontinua por outro motivo.

### Coordenação tem custo, e ele deve ser visível

```text
uma decisão que atravessa 3 times    algumas reuniões, semanas
que atravessa 8 times                meses, e o custo cresce
                                     mais que linearmente
```

Isso significa que reduzir a necessidade de coordenação é frequentemente melhor que coordenar
melhor. Uma fronteira arquitetural bem escolhida elimina a coordenação; um processo eficiente
apenas a torna mais barata.

Ver [lei de Conway](/23-architecture-leadership/conways-law.md): quando a coordenação é constante entre dois times, a
fronteira provavelmente está no lugar errado.

## Modelo Mental

**Coordene interfaces, não implementações; e traga os times antes de propor.** Uma decisão
transversal não é tomada, é adotada.

## Quando Usar

- Quando a consequência atravessa fronteiras de time.
- Em formatos, protocolos, identidade e propriedade de dado.
- Quando dois times têm posições incompatíveis sobre uma fronteira comum.

## Quando Não Usar

**Quando a consequência fica contida num time**, mesmo que outro consuma o resultado. Se o
consumidor só enxerga o contrato e o contrato não muda, coordenar a decisão interna custa reuniões e
disposição dos times sem proteger nada.

**Quando mover a fronteira custa menos que coordenar de forma recorrente.** Coordenação é custo pago
a cada decisão; mover a fronteira é pago uma vez. Se os mesmos dois times coordenam todo trimestre, o
sinal é redesenhar a fronteira, não aperfeiçoar a reunião.

**Quando o contrato já é verificado automaticamente** e a divergência interna não vaza. Um teste de
contrato que quebra o build diz mais, e mais cedo, que uma rodada de alinhamento, e não consome a
atenção de ninguém.

**Quando a decisão é reversível a custo baixo para quem está do outro lado.** Se errar significa
trocar um campo opcional numa versão compatível, deixar o time decidir e corrigir depois sai mais
barato que semanas de convergência prévia.

## Alternativas

- **Reduzir a necessidade de coordenação** movendo a fronteira: preferível quando a
  coordenação entre os mesmos times é recorrente e o custo de mover a fronteira é pago uma vez.
- **Autonomia com contrato verificado**: cada time decide dentro do escopo, e a compatibilidade
  é verificada automaticamente.
- **Um time absorve o escopo**: quando dois times coordenam constantemente, fundi-los pode ser a
  resposta.
- **Decisão central**: para o conjunto pequeno de itens em que a autonomia não faz sentido.

## Trade-offs

| Coordenar | Autonomia com contrato |
|---|---|
| Coerência | Velocidade |
| Custo cresce com o número de times | Divergência dentro do contrato |
| Adoção negociada | Verificação automática |

| Decidir com os times | Decidir e comunicar |
|---|---|
| Adoção real | Rápido |
| Mais lento | Descumprimento silencioso |

## Modos de Falha

**Ninguém decide.** Divergência acumula.

**Decisão sem adoção.** Existe só no documento.

**Escalada frequente.** Os times deixam de decidir.

**Coordenação de decisões locais.** Burocracia.

**Migração sem financiamento.** Convergência não ocorre.

**Divergência apagada.** Quem discordou não é reconhecido, e descumpre em silêncio.

## Erros Comuns

**Propor antes de envolver.** A proposta sai tecnicamente boa e é ignorada, como nas duas primeiras
tentativas do Exemplo Real, que ficaram abaixo de 20% de adoção.

**Discutir implementação** em vez de contrato. O time do outro lado resiste à interferência, a
conversa se alonga, e o contrato que importava sai igual ao que sairia sem ela.

**Não medir adoção.** A decisão parece valer porque ninguém reclama, e a divergência só aparece como
incidente de integração meses depois.

**Tratar baixa adoção** como indisciplina em vez de informação. A cobrança aumenta, a adesão vira
formal, e a restrição real que impedia a adoção (como as quatro do Exemplo Real) continua sem
resposta.

**Coordenar demais**, gastando a disposição dos times. Quando chega a decisão que de fato atravessa
fronteiras, os representantes já tratam a reunião como burocracia e mandam quem não decide.

**Escalar como primeiro recurso.** O gestor decide sem contexto técnico, e os times aprendem que
discordar é uma forma de terceirizar a decisão.

## Exemplo Real

Uma empresa de saúde digital com nove times de produto tinha um problema recorrente: cada time
publicava eventos de domínio com formato próprio. Existiam quatro representações diferentes do
conceito "paciente" e três de "atendimento".

O custo era mensurável:

```text
incidentes por incompatibilidade de formato, 12 meses    14
tempo médio de integração entre dois times               9 dias
adaptadores de tradução mantidos                         23
```

A área de arquitetura já tinha tentado resolver duas vezes, ambas pela sequência errada: análise,
proposta, apresentação. Nas duas, a proposta foi tecnicamente boa e a adoção ficou abaixo de 20%.

Na terceira tentativa, a sequência mudou:

**Fase de diagnóstico compartilhado.** Em vez de apresentar uma proposta, a área de arquitetura
apresentou os números (os 14 incidentes, os 23 adaptadores, os 9 dias) e pediu que cada time
descrevesse o próprio formato e por que ele era assim.

Isso revelou algo que nenhuma das duas propostas anteriores tinha capturado: quatro dos nove times
tinham restrições reais que os formatos propostos não atendiam (um por integração com sistema
externo, dois por requisito regulatório, um por volume).

**Grupo de trabalho com um representante por time.** Sete semanas, com a arquitetura estruturando
a conversa e trazendo o contexto que faltava.

**Decisão sobre interface, não implementação.** O acordo definiu o formato do evento publicado, a
semântica dos campos obrigatórios, e a política de evolução compatível. Como cada time produz e
consome internamente ficou fora do escopo.

**Divergência registrada.** Dois times defenderam incluir mais campos obrigatórios; a decisão foi
pelo conjunto mínimo, com a objeção registrada e revisão prevista em 12 meses.

**Migração financiada.** A liderança de engenharia alocou orçamento para a migração, e a área de
arquitetura construiu uma ferramenta de tradução que cobria 70% dos casos automaticamente.

**Adoção acompanhada publicamente.** Um painel mostrava, por time, quantos eventos já seguiam o
formato acordado. Sem cobrança, apenas visível.

Resultados após 14 meses:

```text
adoção em eventos novos                     100%
convergência de eventos existentes          87%
adaptadores de tradução                     4 (de 23)
tempo médio de integração                   2 dias
incidentes por incompatibilidade            0
```

A leitura que a equipe faz: o que mudou entre a segunda e a terceira tentativa não foi a proposta
técnica. O formato final é 90% igual ao da segunda tentativa, que foi ignorada. O que mudou foi
quem participou de chegar nele.

E a fase de diagnóstico compartilhado foi o passo mais valioso: apresentar o custo em números,
sem solução, fez com que os times chegassem sozinhos à conclusão de que algo precisava mudar. A
partir daí, a conversa deixou de ser sobre se devia haver um padrão e passou a ser sobre qual.

## Conceitos Relacionados

- [Influência Técnica](/23-architecture-leadership/technical-influence.md).
- [Negociação de Trade-offs](/23-architecture-leadership/negotiating-tradeoffs.md).
- [Lei de Conway](/23-architecture-leadership/conways-law.md).
- [Governança Federada](/19-architecture-governance/federated-governance.md).

## Exercício Prático

Identifique uma decisão que atravessa times na sua organização e que está pendente há meses.

Responda: quem tem autoridade para tomá-la? Se a resposta for "ninguém", você encontrou a causa,
e a saída é estruturar a conversa, não escalar.

## Perguntas de Entrevista

- Por que uma decisão transversal não é tomada, e sim adotada?
- Por que registrar a divergência reduz o descumprimento silencioso?
- Por que baixa adoção voluntária é informação sobre a decisão?

## Para Aprofundar

- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.
- Fisher, Roger; Ury, William. *Getting to Yes*. 3ª ed. Penguin, 2011.
