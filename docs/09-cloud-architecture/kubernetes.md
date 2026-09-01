---
id: kubernetes
title: Kubernetes
sidebar_position: 5
description: Orquestração declarativa de contêineres — o que ela resolve e a pergunta que precede a adoção.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor avalia Kubernetes pelo problema concreto que tem hoje, e
  conhece o custo operacional que a adoção traz.
prerequisites: [containers]
related: [containers, serverless, managed-services]
canonical_for: [Kubernetes, orquestração de contêineres, reconciliação declarativa]
content_version: 2
last_reviewed: 2026-08-27
---

# Kubernetes

## Visão Geral

Kubernetes orquestra contêineres num conjunto de máquinas: decide onde cada um
roda, reinicia o que morre, substitui nós que somem, distribui tráfego e conduz
implantações.

O modelo é **declarativo**: você descreve o estado desejado, e um laço de
reconciliação trabalha continuamente para que a realidade corresponda.

É uma tecnologia poderosa e cara em conhecimento. A pergunta que precede a adoção
não é "é bom?", e sim **"qual problema concreto eu tenho hoje que ele resolve?"**.

## Problema

Com dezenas de serviços em contêiner e várias máquinas, aparecem perguntas que
alguém precisa responder continuamente:

Em qual máquina cada contêiner roda? O que acontece quando um morre? E quando a
máquina inteira some? Como implantar uma versão nova sem derrubar o serviço? Como
outros serviços encontram este? Como distribuir carga?

Responder isso com scripts funciona até certo ponto e vira, aos poucos, um
orquestrador caseiro pior.

## Conceitos Centrais

### Reconciliação é o que explica tudo

O funcionamento não é "execute este comando". É "este é o estado desejado".

```text
declarado: 3 réplicas deste serviço
realidade: 2 réplicas (uma morreu)
ação:      criar 1
```

Esse laço roda continuamente, para tudo. É por isso que o sistema se recupera
sozinho de falhas de nó, e por isso alterações manuais são desfeitas — o
reconciliador as vê como desvio.

Entender isso muda o modelo mental: você não opera o sistema, você declara o que
quer e o sistema persegue.

### As abstrações que importam

```text
pod          a menor unidade — um ou mais contêineres que compartilham rede
deployment   gerencia réplicas de pods e conduz atualizações graduais
service      um endereço estável para um conjunto de pods
ingress      entrada de tráfego externo
configmap    configuração
secret       segredo — cifrado em repouso apenas se configurado
namespace    separação lógica
```

O ponto sobre segredos merece destaque: eles são codificados, não cifrados, por
padrão. Tratá-los como seguros sem configurar cifragem em repouso é um equívoco
comum.

### Requisições e limites decidem estabilidade

Cada contêiner declara quanto pede e quanto pode consumir.

**Requisição** é o que o agendador reserva ao escolher o nó. Subestimar leva a nós
superlotados; superestimar desperdiça.

**Limite** é o teto. Ultrapassar memória mata o contêiner; ultrapassar CPU o
estrangula.

Sem requisições, o agendador decide às cegas e a distribuição fica ruim. Sem
limites, um contêiner consome o nó. É a configuração que mais afeta estabilidade e
a mais negligenciada.

### Verificações de saúde são três, com papéis distintos

```text
liveness   está travado? se falhar, reinicia
readiness  pode receber tráfego agora? se falhar, sai do balanceamento
startup    ainda está iniciando? suspende as outras duas
```

O erro clássico é apontar a de liveness para uma verificação que depende de outros
serviços: o banco fica lento, a verificação falha, o pod é reiniciado — e reiniciar
não conserta o banco, só piora. Ver
[detecção de falhas](/06-distributed-systems/failure-detection.md).

Regra: liveness verifica apenas o próprio processo; readiness verifica se **esta
instância** pode atender — inicialização concluída, aquecimento feito, pool de
conexões estabelecido.

A parte que a regra curta esconde: readiness **não** deve depender de recurso
compartilhado por todas as réplicas. Se as dez consultam o mesmo banco, uma
oscilação dele tira as dez da rotação ao mesmo tempo, e o serviço fica sem nenhum
destino — degradação parcial virou queda total. Ver
[degradação graciosa](/12-reliability/graceful-degradation.md).

### O custo é conhecimento, não licença

Sendo específico:

**Superfície conceitual.** Dezenas de tipos de recurso, e o modelo mental de
reconciliação.

**Rede.** É a parte mais difícil de diagnosticar. Um problema de política de rede ou
de resolução de nomes exige entender várias camadas.

**Atualizações.** O ciclo de versões é rápido, e ficar para trás não é opção por
segurança.

**Diagnóstico em camadas.** Aplicação, contêiner, pod, nó, rede, plano de controle.
Todo incidente começa descobrindo em qual camada está.

**Ecossistema.** A adoção quase sempre traz junto entrada de tráfego, certificados,
métricas, registros, política, segredos — cada um com sua própria curva.

Times pequenos costumam subestimar isso porque a instalação inicial é fácil. A
operação sustentada é que custa.

### Gerenciado reduz metade

Um Kubernetes gerenciado remove a operação do plano de controle — que é a parte
mais difícil e crítica.

O que continua sendo seu: nós, rede, política, escalonamento, atualização das
aplicações, e todo o ecossistema.

A recomendação prática: se for adotar, adote gerenciado. Operar o plano de controle
próprio exige um time dedicado, e quase nenhuma organização precisa disso.

### Quando ele não se justifica

Com poucos serviços, uma equipe pequena e carga previsível, uma plataforma de
contêineres mais simples entrega quase o mesmo com uma fração do conhecimento
necessário.

O ponto em que ele passa a render: muitos serviços, muitos times, necessidade de
padronizar implantação e recursos, ou requisitos que só ele atende.

## Modelo Mental

**Kubernetes é um laço que persegue o estado que você declarou.** Ele resolve
orquestração em escala, e cobra em conhecimento continuamente.

## Quando Usar

- Muitos serviços em contêiner, em várias máquinas.
- Vários times precisando de implantação padronizada.
- Escalonamento automático por métrica.
- Recuperação automática de falha de nó.
- Portabilidade entre provedores tem valor concreto.
- Já existe quem opere, ou há investimento planejado.

## Quando Não Usar

**Com poucos serviços.** Plataformas mais simples resolvem.

**Sem quem opere.** A instalação é fácil; a operação, não.

**Para uma aplicação única.**

**Como sinônimo de modernização.**

**Autogerido, sem time dedicado.** Use gerenciado.

**Para resolver problema de arquitetura.** Ele não conserta fronteiras de serviço
erradas — só as distribui melhor.

## Alternativas

- **Plataformas de contêiner gerenciadas** — rodam contêineres sem expor o modelo
  de orquestração. Cobrem a maioria dos casos com muito menos conhecimento.
- **[Serverless](/09-cloud-architecture/serverless.md)** — sem capacidade nem orquestração.
- **Máquinas com escalonamento automático** — para poucos serviços estáveis.
- **Plataforma como serviço** — ver [PaaS](/09-cloud-architecture/paas.md).

## Trade-offs

| Kubernetes | Plataforma simples |
|---|---|
| Controle fino | Opinativo |
| Portável entre provedores | Acoplado |
| Ecossistema amplo | Limitado |
| Conhecimento alto | Baixo |
| Diagnóstico em camadas | Direto |
| Escala para centenas de serviços | Dezenas |

| Gerenciado | Autogerido |
|---|---|
| Plano de controle do provedor | Seu |
| Menos operação crítica | Toda |
| Custo do serviço | Custo do time |
| Versões conforme o provedor | Sua escolha |

## Modos de Falha

**Sem requisições nem limites.** Agendamento ruim e nós saturados.

**Liveness verificando dependência.** Reinícios em cascata durante degradação de
outro serviço.

**Segredo tratado como cifrado** quando não está.

**Interrupção sem orçamento definido.** Uma manutenção de nós remove todas as
réplicas ao mesmo tempo.

**Escalonamento sem teto.** Custo dispara com um defeito.

**Rede difícil de diagnosticar.** Política ou resolução de nomes.

**Versão desatualizada.** Atualização adiada acumula risco e dificuldade.

**Autoescalonamento de pods brigando com o de nós.** Configurações inconsistentes
produzem oscilação.

## Erros Comuns

**Adotar sem problema concreto.** Ele resolve empacotamento e escala de muitos serviços. Para três serviços de carga estável, cobra a complexidade toda e não entrega nada que uma máquina com um gerenciador de processos não entregue.

**Não definir requisições e limites.** Sem requisição, o agendador não sabe onde cabe e empilha cargas no mesmo nó; sem limite, um vazamento de memória derruba os vizinhos junto.

**Liveness dependente de outros serviços.** Se a sonda de vida consulta o banco, uma lentidão do banco reinicia todos os pods ao mesmo tempo — a sonda converte degradação de dependência em queda total.

**Autogerir o plano de controle.** Manter etcd, certificados e atualizações é um trabalho de time dedicado. Os provedores fazem isso por um custo que quase sempre é menor que uma pessoa.

**Não configurar orçamento de interrupção.** Sem ele, uma manutenção de nós pode remover simultaneamente todas as réplicas de um serviço — o cluster obedece porque ninguém disse quantas precisam permanecer.

**Não planejar atualizações desde o início.** As versões saem de suporte em ritmo rápido, e a API muda entre elas. Um cluster que fica dois anos sem atualizar acumula mudanças incompatíveis que precisam ser feitas de uma vez.

## Exemplo Real

Uma empresa com 40 engenheiros e 9 serviços adotou Kubernetes autogerido, com a
justificativa de "preparar para escalar" e evitar dependência de provedor.

Dezoito meses depois, o balanço:

**Dois engenheiros em tempo integral** operando a plataforma — 5% da capacidade de
engenharia, para 9 serviços.

**Onze incidentes** causados pela própria plataforma: rede, certificado expirado,
atualização mal sucedida, disco de nó cheio.

**Atualização de versão adiada** por catorze meses, acumulando três versões de
atraso. A atualização quando finalmente feita levou seis semanas.

**Requisições e limites ausentes** em 7 dos 9 serviços. Um vazamento de memória em
um deles derrubou dois nós.

**Liveness verificando o banco** em quatro serviços. Numa lentidão do banco, todos
os pods desses serviços entraram em ciclo de reinício — transformando degradação em
indisponibilidade completa.

A reavaliação levou a duas decisões:

**Migração para Kubernetes gerenciado.** Os dois engenheiros voltaram
majoritariamente ao produto; um permanece parcialmente alocado. Os incidentes de
plataforma caíram para dois no ano seguinte, ambos de configuração da aplicação.

**Correções de configuração** — requisições, limites, verificações de saúde
corrigidas, orçamentos de interrupção — que resolveram a maior parte dos incidentes
restantes.

E uma observação que a equipe registrou honestamente: com 9 serviços, uma
plataforma de contêineres mais simples teria atendido, e a discussão nunca foi
feita. A escolha foi por Kubernetes contra máquinas virtuais, sem considerar o meio
do caminho.

O argumento de evitar dependência de provedor, que motivou o autogerenciamento, não
se sustentou: a portabilidade nunca foi exercida, e o custo de operá-lo foi maior
que o de qualquer migração hipotética. Ver
[dependência de fornecedor](/09-cloud-architecture/vendor-lock-in.md).

## Conceitos Relacionados

- [Contêineres](/09-cloud-architecture/containers.md) — o que ele orquestra.
- [Serverless](/09-cloud-architecture/serverless.md) — a alternativa sem orquestração.
- [Serviços Gerenciados](/09-cloud-architecture/managed-services.md).
- [Malha de Serviço](/08-integration-architecture/service-mesh.md).

## Exercício Prático

Se você usa Kubernetes, verifique quantos dos seus serviços têm requisições,
limites e verificações de saúde corretamente configurados.

Depois olhe as verificações de liveness: alguma consulta um banco ou outro serviço?
Cada uma dessas transforma lentidão alheia em reinício próprio.

## Perguntas de Entrevista

- O que reconciliação declarativa explica sobre o comportamento do sistema?
- Por que liveness não deve verificar dependências?
- Qual a diferença entre requisição e limite, e o que cada uma afeta?

## Para Aprofundar

- Burns, Brendan et al. *Kubernetes: Up and Running*. 3ª ed. O'Reilly, 2022.
- Burns, Brendan. *Designing Distributed Systems*. O'Reilly, 2018.
- Documentação oficial do Kubernetes — conceitos e boas práticas.
