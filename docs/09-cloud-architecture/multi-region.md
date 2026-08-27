---
id: multi-region
title: Multi-Região
sidebar_position: 15
description: Operar em mais de uma região — o que isso resolve, e por que a maioria dos sistemas não precisa.
doc_type: pattern
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor distingue os três desenhos de multi-região e reconhece qual
  problema cada um resolve.
prerequisites: [regions]
related: [regions, availability-zones, disaster-recovery]
canonical_for: [multi-região, ativo-passivo, ativo-ativo]
content_version: 1
last_reviewed: 2026-08-27
---

# Multi-Região

## Visão Geral

Operar em mais de uma [região](regions.md) resolve três problemas diferentes, com
preços muito diferentes: sobreviver à perda de uma região, atender usuários
distantes com baixa latência, e cumprir exigências de residência de dados.

Confundir os três leva a desenhos caros que não atendem ao objetivo real.

E vale a franqueza: **a maioria dos sistemas não precisa disso**. Três
[zonas de disponibilidade](availability-zones.md) cobrem a esmagadora maioria das
falhas reais, com uma fração da complexidade.

## Problema

Regiões inteiras falham. É raro, e acontece — e quando acontece, dura horas.

Para um sistema em região única, isso é indisponibilidade total sem nada a fazer
além de esperar.

Para alguns negócios, horas de parada é inaceitável. Para a maioria, é.

Essa é a primeira pergunta, e ela é do negócio: **quanto custa cada hora parada?**
Se a resposta não justificar o custo de multi-região, a discussão acaba aí.

## Conceitos Centrais

### Os três desenhos

```text
                    ativo-passivo frio   ativo-passivo quente   ativo-ativo
capacidade ociosa   nenhuma              parcial ou total       nenhuma
tempo de retomada   horas                minutos                segundos
perda de dados      minutos a horas      segundos               próxima de zero
custo adicional     baixo                médio a alto           alto
complexidade        baixa                média                  muito alta
escrita             uma região           uma região             várias regiões
```

**Ativo-passivo frio.** Cópias replicadas para outra região; a infraestrutura é
criada quando necessário. É basicamente
[recuperação de desastre](disaster-recovery.md).

**Ativo-passivo quente.** A região secundária existe e recebe replicação contínua.
Promover é uma operação, não uma construção.

**Ativo-ativo.** As duas regiões atendem tráfego. É o único que dá continuidade
quase transparente, e o único que traz o problema difícil: escrita em mais de um
lugar.

### Ativo-ativo esbarra em consistência

Se as duas regiões aceitam escrita para o mesmo dado, você tem
[conflitos](../06-distributed-systems/conflict-resolution.md) — e a resolução padrão
descarta dados em silêncio.

Se você exige consistência forte entre regiões, paga latência de coordenação
intercontinental em toda escrita. Ver
[PACELC](../06-distributed-systems/pacelc.md).

Não há saída elegante. As que funcionam evitam o problema:

**Partição por região.** Cada dado tem uma região dona; usuários europeus escrevem
na Europa, americanos na América. Sem escrita concorrente para o mesmo dado, sem
conflito.

**Leitura ativo-ativo, escrita centralizada.** Leituras locais e rápidas; escritas
vão para a região primária. Cobre a maior parte dos casos de latência sem o problema
de conflito.

**Estruturas que convergem.** Para dados que admitem — contadores, conjuntos.

A segunda é o desenho mais comum entre implementações bem-sucedidas, e a menos
divulgada, porque é menos impressionante que ativo-ativo completo.

### O ponto único que a geografia não protege

Ver [regiões](regions.md): serviços globais — DNS, identidade, plano de controle —
atravessam regiões.

Uma arquitetura multi-região que depende de um deles para funcionar tem um ponto
único que a redundância geográfica não cobre. Vários incidentes de grande alcance
foram exatamente isso.

### Failover que ninguém testou não funciona

O modo de falha mais comum de multi-região não é a região cair — é o failover
falhar quando é acionado.

Motivos recorrentes: cota insuficiente na região secundária, configuração
divergente, dependência que só existe na primária, certificado ausente, ou
simplesmente ninguém sabendo executar o procedimento sob pressão.

**Exercitar o failover periodicamente, em produção**, é o que separa um plano de uma
esperança. Sistemas que fazem isso descobrem problemas em janela controlada, e não
durante o incidente.

### O custo é maior que o dobro

A intuição diz "duas regiões, o dobro do custo". Na prática é mais:

**Capacidade duplicada**, se quente ou ativo.

**Transferência entre regiões**, contínua, para replicação.

**Complexidade operacional.** Duas de tudo — implantação, monitoramento,
configuração — e a garantia de que não divergem.

**Tempo de engenharia.** O desenho, o failover, os testes.

E há um custo qualitativo: o sistema fica mais difícil de raciocinar, o que se paga
em todo incidente futuro, não só nos regionais.

## Modelo Mental

**Multi-região resolve falha de região inteira, que é rara.** Antes de pagar por
ela, verifique se três zonas não resolvem o que realmente acontece.

## Quando Usar

- Cada hora parada tem custo que justifica.
- Requisito regulatório de continuidade.
- Usuários em continentes distantes com exigência de latência.
- Residência de dados por jurisdição.
- Requisito contratual de disponibilidade que região única não alcança.

## Quando Não Usar

**Quando três zonas resolvem.** É o caso da maioria.

**Sem exercitar o failover.**

**Ativo-ativo sem resolver escrita.**

**Por precaução, sem número do custo de parada.**

**Antes de o sistema estar sólido em uma região.** Multiplicar um sistema frágil
gera dois sistemas frágeis.

**Sem verificar cotas e disponibilidade de serviço na região secundária.**

## Alternativas

- **Três [zonas de disponibilidade](availability-zones.md)** — cobre a maioria das
  falhas reais.
- **[Recuperação de desastre](disaster-recovery.md) em outra região** — capacidade
  reduzida, ativada sob demanda. Muito mais barato.
- **Réplica de leitura em outra região** — latência de leitura sem o problema de
  escrita.
- **Rede de distribuição de conteúdo** — resolve latência de conteúdo estático sem
  nada disso.
- **Degradação graciosa** — operar em modo reduzido durante a falha, em vez de
  duplicar tudo.

## Trade-offs

| Região única, três zonas | Multi-região |
|---|---|
| Simples de operar | Complexo |
| Custo base | Muito maior |
| Consistência barata | Cara |
| Falha de região derruba | Continuidade |
| Um conjunto de configuração | Dois, a manter iguais |

| Ativo-passivo | Ativo-ativo |
|---|---|
| Uma região escreve | Várias |
| Sem conflito | Conflito a resolver |
| Retomada em minutos | Segundos |
| Capacidade ociosa | Toda em uso |
| Complexidade média | Muito alta |

## Modos de Falha

**Failover falhando quando acionado.**

**Cota insuficiente na secundária.**

**Configuração divergente entre regiões.**

**Conflito de escrita descartando dados.**

**Falha de serviço global.** Atravessa as duas.

**Cérebro dividido.** As duas regiões se consideram primárias.

**Custo de replicação inesperado.**

**Perda de dados na promoção.** O que a replicação assíncrona não tinha enviado.

## Erros Comuns

**Adotar sem quantificar o custo de parada.**

**Não exercitar o failover.**

**Ativo-ativo sem estratégia de escrita.**

**Não verificar cotas na secundária.**

**Assumir que multi-região elimina ponto único.**

**Deixar as configurações divergirem.**

## Exemplo Real

Uma plataforma de pagamentos implementou ativo-passivo quente entre duas regiões,
motivada por exigência regulatória de continuidade.

O investimento foi grande: capacidade duplicada, replicação contínua, procedimento
de promoção documentado.

Na primeira falha real de região — 3 horas de indisponibilidade parcial do provedor
— o failover foi acionado e levou **2 horas e 40 minutos**, quando o alvo era 15
minutos.

As causas, todas encontradas durante o incidente:

**Cota.** A região secundária tinha limite de instâncias suficiente para a
capacidade em espera, não para a capacidade total. Subir o restante exigiu abrir
chamado emergencial com o provedor: 50 minutos.

**Configuração divergente.** Três variáveis de ambiente tinham sido alteradas na
primária ao longo do ano e nunca na secundária. A aplicação subiu e falhou.

**Dependência só na primária.** Um serviço interno de cálculo de taxas existia
apenas na região primária. A secundária apontava para ele — pela rede, entre
regiões. Com a primária degradada, ele não respondia.

**Certificado.** O certificado da secundária tinha expirado quatro meses antes.
Ninguém monitorava, porque ele não era usado.

**Procedimento.** O documento tinha 14 passos e estava desatualizado em 5 deles. A
pessoa de sobreaviso nunca o havia executado.

Depois do incidente:

**Exercício mensal de failover**, em produção, em janela de baixo movimento. O
primeiro exercício encontrou dois problemas novos; o terceiro, nenhum.

**Cota provisionada** para capacidade total nas duas regiões.

**Configuração como código**, única, aplicada às duas — divergência passou a ser
impossível.

**Inventário de dependências por região**, verificado automaticamente.

**Monitoramento de certificados** em ambas.

Após seis meses de exercícios, o tempo de failover caiu para 9 minutos.

O que a equipe registra: eles tinham multi-região havia dois anos e nunca a haviam
usado. Ter a infraestrutura e **conseguir usá-la** são coisas diferentes — e a
diferença só aparece no exercício ou no incidente.

## Conceitos Relacionados

- [Regiões](regions.md) e [Zonas de Disponibilidade](availability-zones.md).
- [Recuperação de Desastre](disaster-recovery.md) — a alternativa mais barata.
- [Resolução de Conflitos](../06-distributed-systems/conflict-resolution.md).
- [PACELC](../06-distributed-systems/pacelc.md).

## Exercício Prático

Se você tem uma região secundária, responda: quando foi a última vez que ela
atendeu tráfego de produção?

Se a resposta for "nunca", você tem infraestrutura, não continuidade.

## Perguntas de Entrevista

- Quais os três desenhos, e que problema cada um resolve?
- Por que ativo-ativo esbarra em consistência, e como se evita isso?
- Por que exercitar o failover é a parte que decide?

## Para Aprofundar

- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Documentação de arquiteturas multi-região dos principais provedores.
