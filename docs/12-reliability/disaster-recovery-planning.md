---
id: disaster-recovery-planning
title: Planejamento de Recuperação
sidebar_position: 7
description: O plano que precisa funcionar no pior dia — e por que ele só existe se for exercitado.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor constrói um plano de recuperação com escopo além dos dados,
  autoridade definida e exercício regular.
prerequisites: [rto]
related: [rto, rpo, failover]
canonical_for: [recuperação de desastre, plano de continuidade, exercício de recuperação, autoridade de acionamento]
content_version: 2
last_reviewed: 2026-08-28
---

# Planejamento de Recuperação

## Visão Geral

O que é recuperação de desastre, e as estratégias técnicas que a sustentam, estão em
[recuperação de desastre](/09-cloud-architecture/disaster-recovery.md). Planejamento
de recuperação é a parte que não se compra do provedor: o **plano** que aciona essas
estratégias — o que ele precisa cobrir além dos dados, quem decide, e por que ele só
existe se for exercitado.

A frase que resume: um plano nunca executado é documentação, não capacidade.

## Problema

Quase toda organização tem um documento de recuperação de desastre. Ele costuma existir
por exigência de auditoria, e a auditoria verifica que ele existe — não que ele
funciona.

O resultado previsível: no dia em que é acionado, descobre-se que o procedimento está
desatualizado, que a pessoa que o escreveu saiu, que faltam permissões, e que ninguém
sabe quem tem autoridade para acionar.

## Conceitos Centrais

### O plano cobre muito mais que dados

A parte de restaurar o banco é a mais discutida e frequentemente a mais simples. O que
costuma faltar:

```text
configuração e segredos   onde estão, como recuperá-los
DNS                       quem altera, com qual tempo de propagação
certificados              válidos no ambiente de recuperação
permissões e cotas        suficientes na região secundária
dependências externas     o que acontece se o endereço de origem mudar
comunicação               quem avisa clientes, reguladores, imprensa
ordem de retomada         o que volta primeiro
critério de conclusão     como se sabe que terminou
```

O item de segredos merece destaque: se eles estão apenas no ambiente que caiu, a
recuperação não acontece. Ver [segredos](/10-security/secrets.md).

### Autoridade precisa estar definida antes

A primeira hora de um desastre costuma ser gasta decidindo se é um desastre.

Sem autoridade definida, a decisão de acionar — que é irreversível e cara — fica
paralisada entre pessoas que não querem tomá-la sozinhas.

O plano precisa nomear:

**Quem declara.** Duas ou três pessoas, com suplência.

**Com base em quê.** Critérios objetivos: indisponibilidade acima de N minutos sem
causa identificada, perda confirmada de região.

**Quem comunica** internamente e externamente.

**Quem decide encerrar** e retornar à operação normal.

Nomes, não papéis genéricos.

### Priorizar o que volta primeiro

Nem tudo precisa voltar junto. Ver [RTO](/12-reliability/rto.md) por função.

```text
essencial     aceitar pedidos, autorizar transações
importante    consultas, histórico
adiável       relatórios, integrações de baixa criticidade
```

Restaurar o essencial primeiro reduz o impacto, e essa priorização precisa estar
decidida antes — durante o incidente, ela vira negociação sob pressão.

Ver [degradação graciosa](/12-reliability/graceful-degradation.md): operar reduzido é um estado
legítimo, e frequentemente o correto.

### Os cenários não são intercambiáveis

Um plano genérico não funciona porque as respostas divergem:

```text
perda de região          failover regional
corrupção de dados       restauração para ponto anterior
apagamento acidental     restauração seletiva, ou réplica atrasada
ataque com criptografia  cópias isoladas, ambiente reconstruído
comprometimento          reconstruir do zero, rotacionar tudo
```

Os dois últimos são os que mais divergem: reconstruir num ambiente possivelmente
comprometido exige premissas diferentes — não se restaura para a mesma infraestrutura,
e as credenciais não são reutilizadas.

Ver [confiança na cadeia de suprimentos](/10-security/supply-chain-trust.md).

### O exercício é o plano

Um plano existe na medida em que foi executado.

```text
exercício de mesa        discussão do cenário — barato, encontra lacunas de procedimento
exercício parcial        restaurar um componente em ambiente separado
exercício completo       recuperação de ponta a ponta, cronometrada
```

A progressão importa: o de mesa custa uma reunião e costuma encontrar mais do que se
espera. O completo é o único que verifica o [RTO](/12-reliability/rto.md).

E a frequência importa mais que a profundidade: um exercício parcial trimestral vale
mais que um completo a cada três anos.

### O plano precisa estar acessível quando tudo está fora

Detalhe operacional que já inviabilizou recuperações: o plano armazenado no sistema que
caiu.

O mesmo vale para a lista de contatos, as credenciais de emergência e a documentação de
arquitetura.

Cópia offline, atualizada, com acesso definido. É trivial e frequentemente ausente.

## Modelo Mental

**O plano é o exercício.** O documento é o registro dele.

## Quando Usar

- Existe requisito regulatório de continuidade.
- A parada prolongada tem custo relevante.
- O sistema é crítico para a operação do negócio.
- Há dados cuja perda seria irrecuperável.

## Quando Não Usar

**Sistema sem estado próprio.** Se todo dado do sistema é derivado — um índice de
busca, um cache, uma projeção reconstruível a partir da fonte —, a recuperação é
reimplantar e reprocessar. O plano dele é uma linha no plano do sistema que guarda a
fonte, não um plano separado com autoridade e exercícios.

**Parada tolerável medida em dias.** Quando a operação aguenta dias em processo
manual e o sistema pode ser reconstruído a partir de fonte externa — parceiros,
registros fiscais, o próprio cliente —, um procedimento de restauração testado basta.
Autoridade nomeada e plano por cenário custam mais do que encurtam.

**Ciclo de exercícios mais caro que a parada.** Se as horas anuais de exercício de
mesa, parcial e completo, somadas, custam mais que o prejuízo esperado da parada —
custo por hora vezes duração vezes frequência —, o aparato completo não se paga, e
restauração testada com um exercício de mesa por ano é o teto útil.

**Equipe pequena demais para manter procedimento por cenário.** Com duas ou três
pessoas, cinco procedimentos distintos envelhecem mais rápido do que alguém os revisa.
Um exercício de mesa trimestral, cobrindo um cenário por vez, entrega mais que
documentos que ninguém atualiza.

## Alternativas

- **Alta disponibilidade** — evita chegar ao cenário. Ver
  [redundância](/12-reliability/redundancy.md). Não substitui: ela não cobre erro humano nem
  corrupção.
- **[Failover](/12-reliability/failover.md) automatizado** — para os cenários previstos.
- **Réplica atrasada** — proteção barata contra erro humano.
- **Exercícios de mesa** — o mínimo viável quando o exercício completo não é possível.

## Trade-offs

| Plano detalhado | Enxuto |
|---|---|
| Pouca decisão sob pressão: o procedimento decide | Muita: cada passo é julgado no incidente |
| Envelhece mais rápido | Envelhece menos, mas depende de quem está de plantão |
| Exige revisão frequente | Não sobrevive à saída de quem o escreveu |

| Exercício completo | Parcial |
|---|---|
| Verifica o RTO | Verifica componentes |
| Caro e arriscado | Barato |
| Anual | Trimestral |

## Modos de Falha

**Procedimento desatualizado.**

**Autor indisponível.** O conhecimento saiu com a pessoa.

**Segredos inacessíveis.**

**Cota insuficiente na secundária.**

**Plano inacessível.** Armazenado no que caiu.

**Autoridade indefinida.** A primeira hora se perde decidindo.

**Cenário errado.** O plano cobre perda de região; o incidente é corrupção.

## Erros Comuns

**Não exercitar.** O procedimento continua citando a ferramenta substituída, e a
restauração é descoberta durante o incidente, com o relógio do RTO correndo.

**Usar um plano genérico** para cenários que exigem respostas diferentes. O
procedimento de perda de região restaura para a mesma infraestrutura — que, num
comprometimento, é exatamente o que não se pode fazer.

**Cobrir só a restauração de dados.** O banco volta e o sistema não sobe: os segredos
ficaram no ambiente que caiu, e a recuperação para esperando por eles.

**Não nomear quem aciona.** A primeira hora se perde subindo a decisão na hierarquia,
e ela sai do RTO de qualquer forma.

**Não priorizar o que volta primeiro.** O essencial volta junto com o resto — no
exemplo abaixo, 5 horas em vez de 40 minutos.

**Guardar o plano só no ambiente que pode cair.** No dia do incidente, o
procedimento, a lista de contatos e as credenciais de emergência estão fora do ar
junto com o sistema.

**Escrever para a auditoria**, e não para o dia do incidente. O documento passa na
verificação anual e nunca é confrontado com a operação real.

## Exemplo Real

Uma empresa de logística tinha um plano de recuperação de 40 páginas, revisado
anualmente para a auditoria e nunca executado.

Um erro de migração apagou a tabela de rotas — 4 milhões de registros — às 10h de uma
terça-feira.

O que aconteceu:

**Primeira hora perdida em decisão.** Ninguém sabia quem tinha autoridade para restaurar
a partir de cópia, porque isso significaria descartar as operações da manhã. A decisão
subiu três níveis hierárquicos.

**Procedimento desatualizado.** O documento referenciava uma ferramenta substituída
havia dois anos. A restauração teve que ser descoberta durante o incidente.

**Segredos inacessíveis.** As credenciais do banco de recuperação estavam num
gerenciador que dependia do ambiente afetado. Foi preciso um procedimento de emergência
que ninguém havia testado.

**Restauração completa desnecessária.** Não havia procedimento de restauração seletiva.
Restaurou-se o banco inteiro para um ponto de 6 horas antes, descartando também dados
que não tinham problema.

**Sem priorização.** Tudo foi restaurado junto. As funções essenciais poderiam ter
voltado em 40 minutos; levaram 5 horas.

Duração total: 7 horas e 20 minutos, contra um RTO declarado de 2 horas.

A reformulação:

**Plano por cenário**, com procedimentos distintos para perda de região, corrupção,
apagamento acidental e comprometimento.

**Autoridade nomeada** — três pessoas, com critérios objetivos de acionamento.

**Priorização de funções**, com as três essenciais identificadas e procedimento de
restauração seletiva.

**Credenciais de emergência** em cofre físico e em conta separada.

**Réplica atrasada de 6 horas**, com a parada da replicação entre as ações que a
autoridade nomeada pode tomar sem consulta. Ela só protege se o apagamento for
detectado e a replicação interrompida dentro da janela de atraso; com a hora perdida
em decisão, uma janela de 1 hora já teria aplicado o apagamento.

**Cópia offline do plano**, atualizada a cada revisão.

**Exercícios trimestrais** — um de mesa, um parcial, alternados. O exercício completo
passou a ser anual.

Nos dois anos seguintes, os exercícios encontraram nove problemas, todos corrigidos em
janela controlada. Um incidente real de corrupção parcial foi resolvido em 35 minutos.

Na retrospectiva: o plano de 40 páginas cumpria a exigência de auditoria
perfeitamente. Ele nunca tinha sido escrito para ser usado — apenas para existir.

## Conceitos Relacionados

- [RTO](/12-reliability/rto.md) e [RPO](/12-reliability/rpo.md) — os alvos.
- [Failover](/12-reliability/failover.md) — o mecanismo.
- [Recuperação de Desastre](/09-cloud-architecture/disaster-recovery.md) — as
  estratégias.
- [Engenharia do Caos](/12-reliability/chaos-engineering.md) — a verificação.

## Exercício Prático

Reúna a equipe e execute um exercício de mesa: são 10h de uma terça, a tabela mais
importante foi apagada. Quem decide o quê, e em que ordem?

As perguntas sem resposta na sala são as lacunas do seu plano.

## Perguntas de Entrevista

- O que um plano precisa cobrir além da restauração de dados?
- Por que autoridade de acionamento precisa ser nomeada antes?
- Por que um plano genérico não funciona?

## Para Aprofundar

- ISO. *ISO 22301:2019 — Security and resilience — Business continuity management systems — Requirements*. 2019.
- Swanson, Marianne et al. *NIST SP 800-34 Rev. 1 — Contingency Planning Guide for Federal Information Systems*. NIST, 2010.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 — capítulo 17, "Testing for Reliability".
