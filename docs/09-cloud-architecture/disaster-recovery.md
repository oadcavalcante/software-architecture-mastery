---
id: disaster-recovery
title: Recuperação de Desastre
sidebar_position: 16
description: Voltar a operar depois do que não deveria acontecer — e por que o plano que ninguém executou não é um plano.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor define objetivos de tempo e de perda com o negócio, e
  escolhe a estratégia que os atende ao menor custo.
prerequisites: [regions]
related: [multi-region, availability-zones, data-replication]
canonical_for: [estratégia de recuperação em nuvem, piloto aceso, espera quente]
content_version: 1
last_reviewed: 2026-08-27
---

# Recuperação de Desastre

## Visão Geral

Recuperação de desastre é o conjunto de decisões e procedimentos para voltar a
operar depois de um evento que a redundância normal não cobre: perda de região,
corrupção de dados, apagamento acidental, ataque com criptografia de dados.

Ela é diferente de alta disponibilidade. Alta disponibilidade evita que falhas
comuns virem indisponibilidade. Recuperação de desastre trata do que acontece
quando isso não bastou.

E ela se resume a dois números — que precisam vir do negócio, não da engenharia.

## Problema

Quase toda empresa tem cópias de segurança. Muito menos empresas conseguem
restaurá-las quando precisam.

Os motivos são sempre os mesmos: a restauração nunca foi testada, o procedimento
está desatualizado, a cópia não contém tudo, ou a restauração leva tempo demais para
ser útil.

O resultado é um plano que existe em documento e não em capacidade.

## Conceitos Centrais

### Os dois números

**RTO — objetivo de tempo de recuperação.** Quanto tempo até voltar a operar.

**RPO — objetivo de ponto de recuperação.** Quanto dado se pode perder.

```text
RPO ─────────────┤ desastre ├───────────── RTO
    dados perdidos            tempo parado
```

Eles são decisões de negócio, com custo associado, e precisam ser definidos por
quem paga a conta da parada — não estimados pela engenharia.

A conversa correta é: "recuperar em 4 horas custa X; em 15 minutos custa 10X.
Quanto vale cada hora parada?"

Sem esses dois números, qualquer estratégia é palpite.

### As estratégias, por preço

```text
                     RTO típico    RPO típico   custo
só cópias            dias          horas        muito baixo
cópias + automação   horas         minutos      baixo
piloto aceso         dezenas de min minutos     médio
espera quente        minutos       segundos     alto
ativo-ativo          segundos      ~zero        muito alto
```

**Piloto aceso** merece atenção: uma versão mínima do ambiente permanece ligada — o
banco replicando, a rede pronta — e a capacidade de computação é criada na
ativação. Custa uma fração da espera quente e entrega RTO de dezenas de minutos.

É o ponto de melhor relação entre custo e resultado para a maioria dos sistemas que
precisam de mais que cópias, e é subutilizado.

Ver [multi-região](multi-region.md) para os desenhos superiores.

### Cópia de segurança não é replicação

Ver [replicação de dados](../07-data-architecture/data-replication.md). A distinção
decide se você sobrevive a erro humano.

Replicação copia tudo, inclusive o comando destrutivo. Cópia de segurança tem
histórico — permite voltar a antes do erro.

Os cenários que **só** a cópia cobre: apagamento acidental, corrupção lógica,
migração com defeito, e ataque que cifra os dados.

Esse último merece nota: um ataque desses tipicamente busca as cópias primeiro. Por
isso cópias imutáveis, ou em conta separada com credenciais distintas, deixaram de
ser exagero.

### A restauração é o que importa, não a cópia

Uma cópia que existe e não restaura é pior que nenhuma, porque produz falsa
confiança.

O que precisa ser testado, periodicamente e de verdade:

**A restauração completa funciona** — não só a leitura do arquivo.

**Quanto tempo leva.** Restaurar vários terabytes pode levar mais que o RTO.

**O que está incluído.** Bancos, arquivos, configuração, segredos, filas em
trânsito. Costuma faltar algo.

**Quem sabe fazer.** Um procedimento que só uma pessoa conhece não é um plano.

### O plano precisa cobrir o que não é dado

A lista do que costuma faltar:

**Configuração e segredos.** Onde estão, e como recuperá-los.

**DNS.** Quem muda, com qual tempo de propagação.

**Certificados.**

**Dependências externas.** SaaS, gateways de pagamento — o que acontece se o
endereço de origem mudar.

**Comunicação.** Quem avisa clientes, quem fala com o regulador.

**Decisão.** Quem tem autoridade para declarar o desastre e acionar o plano. Sem
isso definido, perde-se a primeira hora decidindo se é hora de acionar.

### Degradar é uma estratégia legítima

Nem tudo precisa voltar junto. Definir quais funções são essenciais permite
restaurá-las primeiro e operar em modo reduzido.

Um comércio eletrônico que volta aceitando pedidos, sem recomendações nem histórico,
está operando. Esperar tudo para voltar é frequentemente a escolha errada.

Essa priorização precisa estar decidida antes — durante o incidente, ninguém tem
serenidade para negociá-la.

## Modelo Mental

**Plano de recuperação que ninguém executou é documentação, não capacidade.** O
teste é o plano.

## Quando Usar

Todo sistema precisa de alguma estratégia. O nível depende de:

- Custo por hora de parada.
- Requisito regulatório.
- Criticidade para a operação do negócio.
- Compromissos contratuais.

## Quando Não Usar

**Investir em RTO baixo sem o número do negócio.**

**Ativo-ativo quando piloto aceso atende.**

**Confiar em replicação como proteção contra erro humano.**

**Plano documentado sem exercício.**

**Cobrir só os dados.** Configuração, DNS e segredos ficam de fora.

**Cópias acessíveis com as mesmas credenciais da produção.**

## Alternativas

- **Três [zonas de disponibilidade](availability-zones.md)** — cobre a maior parte
  das falhas reais e não é recuperação de desastre.
- **Cópias com automação de restauração** — o mínimo viável, e suficiente para
  muitos sistemas.
- **Piloto aceso** — a melhor relação custo-benefício na faixa intermediária.
- **Réplica atrasada** — proteção barata contra erro humano. Ver
  [replicação de dados](../07-data-architecture/data-replication.md).

## Trade-offs

| RTO baixo | RTO alto |
|---|---|
| Capacidade em espera | Criada na hora |
| Custo contínuo | Baixo |
| Menos perda de receita | Mais |
| Mais complexidade | Menos |

| Cópias | Replicação |
|---|---|
| Cobre erro humano | Não |
| Restauração lenta | Promoção rápida |
| Custo baixo | Capacidade duplicada |
| RPO de horas | De segundos |

## Modos de Falha

**Restauração que falha.** Nunca testada.

**Restauração lenta demais** para o RTO.

**Cópia incompleta.** Falta configuração, segredo ou um banco secundário.

**Cópias cifradas por ataque.** Acessíveis com as mesmas credenciais.

**Retenção insuficiente.** A corrupção começou antes da cópia mais antiga.

**Ninguém sabe executar.**

**Autoridade indefinida.** A primeira hora se perde decidindo se aciona.

## Erros Comuns

**Não definir RTO e RPO com o negócio.**

**Não testar restauração.**

**Não cobrir configuração e segredos.**

**Confiar em replicação contra erro humano.**

**Não isolar as cópias.**

**Não priorizar o que volta primeiro.**

## Exemplo Real

Uma empresa de serviços tinha cópias diárias de todos os bancos, retenção de 30
dias, e um documento de recuperação de desastre exigido pela auditoria.

O documento nunca havia sido executado.

Um ataque com criptografia de dados atingiu o ambiente. O que se descobriu, na
ordem em que se descobriu:

**As cópias estavam na mesma conta**, acessíveis com as mesmas credenciais que o
atacante obteve. As dos últimos 30 dias foram cifradas junto.

**Existia uma cópia em outra conta**, feita mensalmente por um processo antigo que
ninguém lembrava. Ela tinha 26 dias.

**A restauração nunca fora testada.** A primeira tentativa falhou por incompatibilidade
de versão — a cópia era de uma versão anterior do banco, e o ambiente novo não a
aceitava diretamente.

**Faltava configuração.** Os segredos da aplicação não estavam em nenhuma cópia. Foi
preciso regenerar todos e reconfigurar as integrações.

**Ninguém sabia o procedimento.** A pessoa que escrevera o documento tinha saído da
empresa 8 meses antes.

Tempo total até operação parcial: **9 dias**. Perda de dados: 26 dias de
transações, reconstruídas parcialmente a partir de sistemas parceiros e registros
fiscais.

Depois:

**RTO e RPO definidos com a diretoria** — 4 horas e 15 minutos, respectivamente,
para as funções essenciais.

**Piloto aceso** em outra região, com replicação contínua.

**Cópias imutáveis** em conta separada, com credenciais que a produção não tem.

**Teste trimestral de restauração completa**, cronometrado. O primeiro levou 11
horas; o quarto, 3h20.

**Priorização de funções.** Três funções essenciais definidas para voltar primeiro.

**Autoridade de acionamento** definida em três nomes.

O que se registrou depois: eles cumpriam a exigência de auditoria — havia cópias e
havia documento. A auditoria nunca pediu um teste, e ninguém ofereceu.

## Conceitos Relacionados

- [Multi-Região](multi-region.md) — os desenhos de RTO baixo.
- [Zonas de Disponibilidade](availability-zones.md).
- [Replicação de Dados](../07-data-architecture/data-replication.md).
- [Confiabilidade](../12-reliability/index.md).

## Exercício Prático

Descubra quando foi o último teste de restauração completa do seu sistema — não a
verificação de que a cópia existe, a restauração de verdade.

Depois pergunte a alguém do negócio: quanto custa cada hora parada? Se os dois
números não conversarem, essa é a lacuna.

## Perguntas de Entrevista

- O que RTO e RPO significam, e quem os define?
- Por que replicação não protege contra erro humano nem contra ataque?
- Por que cópias precisam estar isoladas da produção?

## Para Aprofundar

- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
- ISO 22301 — gestão de continuidade de negócios.
- NIST SP 800-34 — guia de planejamento de contingência.
