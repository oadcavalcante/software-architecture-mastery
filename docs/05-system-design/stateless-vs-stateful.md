---
id: stateless-vs-stateful
title: Sem Estado vs. Com Estado
sidebar_position: 7
description: A propriedade que decide o que escala trivialmente — e por que o estado não desaparece, apenas se move.
doc_type: concept
level: 3
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor avalia se um componente é genuinamente sem estado e sabe
  para onde o estado foi quando ele parece ter sumido.
prerequisites: [state-management]
related: [load-balancing, scalability-basics, statelessness]
canonical_for: [sem estado, com estado, stateless, stateful]
content_version: 1
last_reviewed: 2026-08-26
---

# Sem Estado vs. Com Estado

## Visão Geral

Um componente **sem estado** não guarda nada entre requisições: qualquer instância
pode atender qualquer requisição, e o resultado é o mesmo.

Um componente **com estado** lembra. Qual instância atende passa a importar.

A distinção decide quase tudo sobre escala, implantação e recuperação de falha.

## Problema

"Torne o serviço sem estado" é o conselho mais repetido em design de sistemas, e
frequentemente é entendido como se o estado pudesse ser eliminado.

Ele não pode. **O estado não desaparece — ele se move.**

Tornar um serviço de aplicação sem estado significa empurrar o estado para o banco,
para o cache distribuído ou para o cliente. Isso é uma boa decisão, e ela concentra
dificuldade em outro lugar em vez de fazê-la sumir.

A pergunta útil não é "como eliminar estado?". É **"onde concentrar o estado, e
quanto do sistema pode ficar sem ele?"**.

## Conceitos Centrais

### O que muda entre os dois

| | Sem estado | Com estado |
|---|---|---|
| Escala horizontal | Adicionar instância e pronto | Exige particionar ou replicar |
| Balanceamento | Qualquer instância serve | Afinidade ou roteamento por chave |
| Reiniciar | Sem perda | Perda ou recuperação |
| Implantação | Substituir instâncias livremente | Coordenação, migração de estado |
| Falha de instância | Requisição é redirecionada | Estado precisa estar replicado |
| Recuperação | Subir outra | Restaurar ou reeleger |

A primeira linha é o motivo de todo o resto: um componente sem estado escala
adicionando cópias, e essa é a operação mais barata que existe em sistemas.

### Sem estado não é sem memória

Um componente sem estado pode ter cache local, contadores e conexões abertas. O
critério não é "não guarda nada" — é **"nada que ele guarda afeta a corretude da
próxima requisição"**.

Um cache local que, se perdido, apenas torna a requisição mais lenta, não quebra a
ausência de estado. Um contador de tentativas que decide se uma operação é
permitida, quebra.

### Os disfarces de estado

Estado costuma se esconder onde ninguém procura:

**Afinidade de sessão no balanceador.** Se o sistema exige que o usuário volte à
mesma instância, ele tem estado — mesmo que ninguém tenha declarado.

**Arquivo em disco local.** Em contêineres e funções, ele some.

**Agendamento em memória.** Um processo que dispara tarefas a cada minuto duplica
o trabalho quando há duas instâncias, ou perde quando a única cai.

**Conexão de longa duração.** Um WebSocket é estado: o cliente está ligado àquela
instância.

**Idempotência baseada em memória.** Guardar identificadores já processados
localmente falha com múltiplas instâncias.

### O estado precisa morar em algum lugar preparado

Componentes projetados para estado — bancos, caches distribuídos, filas — resolvem
replicação, recuperação e consistência como função principal.

Um serviço de aplicação improvisando isso resolve mal. É a razão de concentrar
estado neles em vez de espalhá-lo.

## Modelo Mental

**Se eu matar esta instância no meio da operação e a próxima requisição for para
outra, algo quebra?** Se sim, há estado — e ele precisa ser reconhecido.

## Quando Usar

Sem estado é preferível quando:

- O componente precisa escalar horizontalmente.
- A carga é variável e instâncias entram e saem.
- A implantação precisa ser frequente e sem coordenação.
- A falha de instância não pode causar perda.

Com estado é necessário quando:

- O dado precisa persistir — banco.
- A latência de acesso ao estado é crítica e a rede não cabe.
- O protocolo exige conexão contínua — streaming, WebSocket, jogos.
- Há coordenação que exige um líder — ver
  [eleição de líder](/06-distributed-systems/leader-election.md).

## Quando Não Usar

**Perseguir ausência de estado onde ele é essencial.** Um banco de dados é com
estado por natureza; tentar torná-lo sem estado não faz sentido.

**Empurrar tudo para o cliente.** Token que carrega demais viaja em cada
requisição e não pode ser revogado.

**Empurrar tudo para o banco.** Um serviço que consulta o banco a cada operação
trivial troca estado local por latência e carga.

**Tratar como binário.** Componentes reais têm gradação — a pergunta é quanto do
sistema pode ficar sem estado, não se tudo pode.

## Alternativas

- **Estado externo compartilhado** — cache distribuído ou banco.
- **Estado no cliente** — token, para sessão.
- **Particionamento por chave** — manter estado local, roteando cada chave sempre
  para a mesma instância. É o modelo de sistemas com estado que escalam.
- **Recalcular** — quando derivar é mais barato que guardar.

## Trade-offs

| Sem estado | Com estado |
|---|---|
| Escala adicionando instâncias | Escala particionando |
| Sem perda em falha | Requer replicação |
| Implantação trivial | Coordenada |
| Latência de acesso ao estado externo | Acesso local |
| Carga no armazenamento compartilhado | Distribuída |
| Simples de operar | Difícil |

A quarta e a quinta linhas são o custo real de ausência de estado, e o que impede
levá-la ao extremo: todo estado empurrado para fora vira uma chamada de rede e
carga num componente compartilhado.

## Modos de Falha

**Ausência de estado presumida e falsa.** O sistema funciona com uma instância e
quebra com duas.

**Afinidade escondendo o problema.** Funciona até uma instância cair.

**Agendador duplicado.** Duas instâncias disparando a mesma tarefa.

**Idempotência local.** Duplicação quando a retentativa cai em outra instância.

**Estado externo virando gargalo.** Todo o sistema sem estado, e o banco saturado.

## Erros Comuns

**Achar que estado desapareceu.** Ele se moveu.

**Não procurar os disfarces.** Afinidade, disco local, agendamento e conexão longa.

**Testar com uma instância.** O defeito só aparece com duas.

**Empurrar estado para o cliente sem pensar em revogação.**

**Ignorar a carga que ausência de estado cria no armazenamento compartilhado.**

## Exemplo Real

Um serviço de importação processava arquivos enviados por clientes. Declarado sem
estado, com quatro instâncias atrás de um balanceador.

Três defeitos apareceram em produção, todos do mesmo tipo.

**Upload em partes.** O cliente enviava o arquivo em pedaços; o serviço juntava em
disco local. Com quatro instâncias, os pedaços caíam em máquinas diferentes e a
junção falhava. Funcionava em homologação, que tinha uma instância.

**Limite de taxa por cliente.** Contado em memória. Cada instância contava
separado, e o limite efetivo era quatro vezes o configurado.

**Agendamento de reprocessamento.** Um laço em memória disparava a cada cinco
minutos. As quatro instâncias disparavam, e cada arquivo era reprocessado quatro
vezes.

Nenhum dos três estava documentado como estado. Todos eram.

As correções: upload em partes foi para armazenamento de objetos, com a junção
disparada por evento ao receber a última parte. O limite de taxa foi para o cache
distribuído. E o agendamento saiu do serviço para um agendador externo, que
dispara uma vez e entrega numa fila.

Depois disso o serviço ficou genuinamente sem estado — e a verificação foi
concreta: matar uma instância no meio de um processamento e confirmar que outra
continua.

## Sistemas com estado que escalam

Ausência de estado não é a única forma de escalar. Sistemas com estado escalam por
**particionamento**, e vale entender o mecanismo — bancos, caches distribuídos e
plataformas de streaming todos o usam.

A ideia: cada instância é dona de um subconjunto das chaves. Uma função de
roteamento decide qual instância atende cada chave, e o estado daquela chave vive
sempre no mesmo lugar.

```text
hash(chave) → instância
  usuário 8891 → instância 2
  usuário 1204 → instância 5
```

Isso preserva a localidade — o estado está onde é usado — e permite adicionar
capacidade adicionando instâncias.

O custo aparece em três lugares. **Operações que atravessam partições** ficam
caras: combinar dados de duas chaves em instâncias diferentes exige coordenação.
**Rebalanceamento** ao adicionar ou remover instância move estado, e é o momento
mais delicado da operação. E **desequilíbrio** acontece se uma chave for muito mais
ativa que as outras — o [hotspot](/11-scalability/index.md).

Hash consistente reduz o custo do rebalanceamento: adicionar uma instância move
apenas uma fração das chaves, não todas.

A conclusão prática: **ausência de estado é mais barata, particionamento é mais
poderoso.** Use o primeiro onde couber e o segundo onde o estado for essencial.

## Conceitos Relacionados

- [Gestão de Estado](/05-system-design/state-management.md) — os tipos e onde cada um mora.
- [Balanceamento de Carga](/05-system-design/load-balancing.md) — onde a afinidade aparece.
- [Escalabilidade](/11-scalability/index.md) — a consequência prática.
- [Processamento em Background](/05-system-design/background-processing.md) — o caso do agendador.

## Exercício Prático

Escolha um serviço que você considera sem estado e faça o teste concreto: suba
duas instâncias e mate uma no meio de uma operação.

Depois procure os cinco disfarces — afinidade, disco local, agendamento em
memória, conexão longa, idempotência local. Um deles costuma estar lá.

## Perguntas de Entrevista

- O que significa um componente ser sem estado?
- Para onde o estado vai quando um serviço se torna sem estado?
- Cite três lugares onde estado se esconde sem ser declarado.

## Para Aprofundar

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Burns, Brendan. *Designing Distributed Systems*. O'Reilly, 2018.
