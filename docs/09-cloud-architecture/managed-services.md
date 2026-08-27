---
id: managed-services
title: Serviços Gerenciados
sidebar_position: 7
description: Comprar operação em vez de fazê-la — a decisão econômica central da nuvem, e o que ela cobra depois.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor decide entre gerenciado e autogerido comparando custo total
  de operação, não preço de lista.
prerequisites: [cloud-architecture]
related: [vendor-lock-in, cost-architecture, serverless]
canonical_for: [serviço gerenciado, autogerido, custo total de operação]
content_version: 1
last_reviewed: 2026-08-27
---

# Serviços Gerenciados

## Visão Geral

Um serviço gerenciado é aquele em que o provedor opera a infraestrutura por você:
instala, atualiza, replica, faz cópia de segurança, monitora e recupera.

Você paga mais por unidade de recurso e deixa de fazer o trabalho.

É a decisão econômica central da nuvem, e ela costuma ser tomada pelo critério
errado — comparando preço de lista com o custo de uma máquina, em vez de comparar
**custo total de operação**.

## Problema

A comparação intuitiva é enganosa:

```text
banco gerenciado    R$ 2.000/mês
máquina + banco     R$ 600/mês
```

Parece três vezes mais caro. O que a segunda linha não inclui: instalação,
configuração, ajuste, monitoramento, atualização de versão, correção de segurança,
configuração e teste de cópia de segurança, réplica, plano de recuperação,
sobreaviso e o tempo de alguém aprender a fazer tudo isso.

Uma fração de uma pessoa dedicada a isso custa mais que a diferença. E a
comparação honesta é essa — não preço contra preço.

## Conceitos Centrais

### O que muda de verdade

**Sobreaviso.** Alguém precisa acordar às 3h quando o banco cai. Com serviço
gerenciado, esse alguém é do provedor.

**Atualização e correção.** A esteira de segurança de um banco autogerido é
trabalho contínuo e obrigatório. Adiar acumula risco.

**Cópia de segurança testada.** Não a que existe — a que já foi restaurada. Ver
[replicação de dados](../07-data-architecture/data-replication.md).

**Conhecimento profundo.** Ajustar um banco sob carga exige experiência específica
que a maioria dos times não tem e não deveria precisar ter.

Nada disso aparece na fatura do autogerido, e tudo aparece no calendário das
pessoas.

### O que você perde

Sendo específico, porque a decisão precisa dos dois lados:

**Controle de versão e de configuração.** O provedor decide quando atualizar, e
algumas opções simplesmente não são expostas.

**Extensões e recursos.** Uma extensão de banco que você usa pode não estar
disponível.

**Janela de manutenção.** O provedor reinicia quando decide, dentro da janela — e
sua aplicação precisa tolerar isso.

**Diagnóstico profundo.** Sem acesso à máquina, certos problemas viram ticket de
suporte em vez de investigação.

**Portabilidade.** Ver [dependência de fornecedor](vendor-lock-in.md).

### A pergunta que decide

Não é "é mais caro?". É: **isto é diferencial competitivo nosso?**

Operar um banco relacional não diferencia quase nenhuma empresa. Operar o
mecanismo de recomendação, sim.

Trabalho que não diferencia deve ser comprado quando comprável. Isso libera as
pessoas para o que só elas podem fazer.

A exceção honesta: em escala muito grande, a diferença de preço passa a pagar um
time dedicado — e aí autogerir volta a fazer sentido, com números na mesa.

### Gerenciado não é infalível

Ele reduz o trabalho, não a responsabilidade:

**Cópia de segurança precisa ser configurada** e a restauração, testada. Vários
serviços têm retenção padrão curta.

**Multi-zona costuma ser opcional.** Ver
[zonas de disponibilidade](availability-zones.md).

**Limites e cotas existem** e param a aplicação quando atingidos.

**Modelagem e consulta continuam suas.** Serviço gerenciado não conserta índice
ausente. Ver [indexação](../07-data-architecture/indexing.md).

**O provedor tem incidentes.** E você não tem o que fazer além de esperar — o que
precisa estar no plano.

### Os graus

```text
autogerido em máquina    controle total, trabalho total
gerenciado               o provedor opera, você configura
sem servidor             o provedor opera e escala, você não vê capacidade
```

O terceiro grau leva a lógica ao extremo. Ver [serverless](serverless.md).

A escolha não precisa ser uniforme: um sistema pode ter banco gerenciado, cache
gerenciado e um componente especializado autogerido, porque só esse último tem
exigência que o gerenciado não atende.

## Modelo Mental

**Serviço gerenciado troca dinheiro e controle por tempo das pessoas.** Se o tempo
delas vale mais aplicado a outra coisa, a troca é boa.

## Quando Usar

- O componente não é diferencial competitivo.
- O time é pequeno, ou não tem experiência operacional específica.
- Sobreaviso 24 horas é caro ou inviável.
- Requisito de conformidade que o provedor já atende.
- A velocidade de entrega importa mais que o custo unitário.
- O padrão de uso cabe no que o serviço oferece.

## Quando Não Usar

**Quando o componente é o diferencial.**

**Quando o serviço não atende um requisito específico** — versão, extensão,
configuração.

**Em escala onde a diferença paga um time**, com os números verificados.

**Quando a dependência é inaceitável.** Ver
[dependência de fornecedor](vendor-lock-in.md).

**Sem verificar cópia de segurança, retenção e multi-zona.**

**Assumindo que gerenciado significa sem responsabilidade.**

## Alternativas

- **Autogerido** — controle total, trabalho total.
- **Gerenciado por terceiro** — não pelo provedor de nuvem; reduz a dependência de
  um único fornecedor mantendo o benefício operacional.
- **[Serverless](serverless.md)** — o grau seguinte.
- **Código aberto com operador** — no [Kubernetes](kubernetes.md), automatiza parte
  da operação sem sair do controle. Custo intermediário, e alguém ainda precisa
  operar o operador.

## Trade-offs

| Gerenciado | Autogerido |
|---|---|
| Menos trabalho operacional | Todo o trabalho |
| Preço por unidade maior | Menor |
| Versão e configuração limitadas | Controle total |
| Sem sobreaviso para isso | Sobreaviso necessário |
| Dependência do fornecedor | Portável |
| Diagnóstico via suporte | Acesso direto |
| Entrega mais rápida | Mais lenta |

## Modos de Falha

**Cópia de segurança com retenção padrão curta.** Descoberta ao precisar.

**Zona única por padrão.**

**Cota atingida.** A aplicação para.

**Manutenção reiniciando sem tolerância da aplicação.**

**Incidente do provedor.** Sem ação possível.

**Versão descontinuada.** Migração forçada com prazo do provedor.

**Custo crescendo silenciosamente.** Ver
[arquitetura de custo](cost-architecture.md).

## Erros Comuns

**Comparar preço de lista em vez de custo total.**

**Não verificar retenção de cópia nem testar restauração.**

**Não habilitar multi-zona.**

**Não tolerar reinício na aplicação.**

**Autogerir por reflexo de custo**, sem contabilizar o tempo das pessoas.

**Gerenciar tudo por reflexo**, sem verificar se o serviço atende o requisito.

## Exemplo Real

Uma empresa de tecnologia com 12 engenheiros autogeria banco relacional, cache,
fila e busca em máquinas virtuais. A justificativa era custo: a fatura de
infraestrutura era cerca de 40% do que seria com serviços gerenciados.

O levantamento do que isso consumia, feito ao longo de um trimestre:

**1,5 pessoa equivalente** dedicada a operação desses quatro componentes —
atualizações, ajuste, incidentes, cópias.

**14 incidentes** no ano, dos quais 9 relacionados a esses componentes.

**Uma versão de banco desatualizada** havia dois anos, com correções de segurança
pendentes, porque a atualização exigia janela que nunca era priorizada.

**Restauração nunca testada.** A primeira tentativa, feita durante o levantamento,
falhou — o procedimento documentado estava desatualizado.

A migração para gerenciado foi feita em três dos quatro componentes:

**Banco, cache e fila** migrados. A fatura de infraestrutura subiu, e a conta total
caiu: a 1,5 pessoa voltou para o produto, e os incidentes relacionados foram de 9
para 1 no ano seguinte.

**Busca permaneceu autogerida.** O serviço gerenciado disponível não suportava um
recurso de relevância que o produto usava, e que era diferencial real. Decisão
deliberada, registrada, com o custo operacional aceito.

Dois problemas na migração:

**Retenção de cópia.** O padrão do serviço gerenciado era 7 dias. O requisito
regulatório era 5 anos. Foi configurado — e só foi percebido porque alguém
perguntou; a suposição era "o gerenciado cuida disso".

**Janela de manutenção.** O provedor reiniciava a instância durante a janela, e a
aplicação não tolerava reconexão. Três incidentes até o tratamento de reconexão
ser implementado.

O que a equipe registra: a comparação que sustentava a decisão anterior — 40% do
preço — era verdadeira e irrelevante. Ninguém tinha colocado o custo das pessoas na
mesma planilha, porque ele já estava pago.

## Conceitos Relacionados

- [Dependência de Fornecedor](vendor-lock-in.md) — o outro lado.
- [Serverless](serverless.md) — o grau seguinte.
- [Arquitetura de Custo](cost-architecture.md).
- [Zonas de Disponibilidade](availability-zones.md) — o que verificar.

## Exercício Prático

Liste os componentes de infraestrutura que seu time opera. Para cada um, estime as
horas por mês gastas em manutenção, incidentes e atualizações.

Multiplique pelo custo da hora. Compare com a diferença de preço do serviço
gerenciado equivalente. Esse é o número da decisão.

## Perguntas de Entrevista

- Por que comparar preço de lista é enganoso?
- O que um serviço gerenciado continua exigindo de você?
- Qual a pergunta que decide entre gerenciar e comprar?

## Para Aprofundar

- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
- Kim, Gene et al. *The DevOps Handbook*. IT Revolution, 2016.
- Forsgren, Nicole et al. *Accelerate*. IT Revolution, 2018.
