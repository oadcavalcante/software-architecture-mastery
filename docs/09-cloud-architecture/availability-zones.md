---
id: availability-zones
title: Zonas de Disponibilidade
sidebar_position: 9
description: Datacenters isolados dentro de uma região — a defesa de melhor retorno da nuvem, e a mais mal usada.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor distribui recursos entre zonas conscientemente, e conhece
  o custo de transferência que essa distribuição gera.
prerequisites: [regions]
related: [regions, multi-region, cloud-networking]
canonical_for: [zona de disponibilidade, multi-zona, distribuição entre zonas]
content_version: 1
last_reviewed: 2026-08-27
---

# Zonas de Disponibilidade

## Visão Geral

Uma zona de disponibilidade é um datacenter — ou um conjunto deles — isolado dos
demais dentro da mesma [região](regions.md): energia, refrigeração e rede
independentes.

Zonas ficam próximas o suficiente para que a latência entre elas seja de poucos
milissegundos, e distantes o suficiente para que um incêndio, uma queda de energia
ou uma inundação não atinja duas.

Distribuir entre zonas é a **defesa de melhor relação entre custo e benefício** da
nuvem. E é rotineiramente confundida com multi-região, que resolve outro problema e
custa muito mais.

## Problema

Falhas de datacenter acontecem: energia, refrigeração, rede, incêndio, erro
humano em manutenção.

Um sistema inteiro numa zona cai junto com ela — e a maioria dos sistemas está
assim sem que ninguém tenha decidido, porque o padrão de criação de recursos é
"uma zona".

Distribuir entre zonas transforma um evento que derruba tudo em um que remove um
terço da capacidade.

## Conceitos Centrais

### Zona não é região

A confusão mais comum e a mais cara:

```text
                zona                     região
distância       quilômetros              centenas a milhares de km
latência        1 a 3 ms                 20 a 250 ms
falha isolada   energia, incêndio, rede  desastre, falha de região inteira
consistência    forte é barata           cara
custo           transferência modesta    alto
complexidade    configuração             projeto
```

A consequência prática: **replicação síncrona entre zonas é viável**; entre regiões,
raramente. Isso é o que faz multi-zona ser padrão e multi-região ser exceção.

Ver [PACELC](../06-distributed-systems/pacelc.md).

### Três zonas, não duas

Duas zonas parecem suficientes e não são, por causa de
[consenso](../06-distributed-systems/consensus.md): sistemas que precisam de
maioria — bancos com eleição de líder, coordenadores, orquestradores — não
conseguem formar maioria com metade fora.

```text
2 zonas, 1 cai → 50% dos nós → sem maioria → indisponível
3 zonas, 1 cai → 67% dos nós → maioria → continua
```

Por isso a recomendação de três zonas não é folga: é o mínimo para que a perda de
uma zona seja tolerável em sistemas que coordenam.

### Distribuir não basta — precisa haver capacidade

Erro frequente: três instâncias em três zonas, cada uma operando a 70%.

Uma zona cai. As duas restantes precisam absorver 150% da carga que tinham, e não
conseguem.

A regra: a capacidade das zonas restantes precisa suportar o pico. Com três zonas,
cada uma deve operar em torno de 60% ou menos — ou o escalonamento automático
precisa ser rápido o bastante, o que raramente é durante um evento correlacionado.

Ver [disponibilidade](../06-distributed-systems/availability.md).

### Tráfego entre zonas é cobrado

Este é o custo escondido do multi-zona, e ele surpreende.

Transferência entre zonas costuma ser cobrada nos dois sentidos. Numa arquitetura
com muitos serviços conversando entre si, e balanceamento que ignora a zona, a
maior parte do tráfego atravessa zonas sem necessidade.

Roteamento com preferência de zona — atender preferencialmente na mesma zona,
cruzando só quando necessário — reduz isso substancialmente, e é uma configuração,
não uma reescrita.

### Nem todo serviço é multi-zona por padrão

Serviços gerenciados variam: alguns replicam entre zonas automaticamente, outros
exigem configuração explícita, e outros são de zona única por natureza.

Volumes de disco, tipicamente, pertencem a uma zona. Uma instância com dados em
disco local não migra para outra zona — o dado fica onde está.

Verificar isso serviço a serviço faz parte do desenho. A suposição de que "está na
nuvem, então é resiliente" é a origem de indisponibilidades que ninguém esperava.

### Falhas de zona nem sempre são totais

Uma zona pode degradar sem cair: latência alta, taxa de erro elevada, rede
intermitente.

Verificações de saúde que apenas checam se o processo responde não detectam isso, e
o tráfego continua sendo enviado para uma zona doente. Ver
[detecção de falhas](../06-distributed-systems/failure-detection.md).

Balanceamento sensível a taxa de erro e latência — não só a presença — é o que
transforma degradação em remoção automática.

## Modelo Mental

**Zona é onde a redundância é barata.** Se você não está usando três, está pagando
nuvem e operando como datacenter único.

## Quando Usar

Distribuição entre zonas deveria ser o padrão. Especialmente quando:

- A indisponibilidade tem custo relevante.
- O sistema precisa de maioria para coordenar.
- Há requisito de disponibilidade acordado.
- O custo de transferência entre zonas é pequeno perto do custo de parar.

## Quando Não Usar

**Ambiente de desenvolvimento e teste.** A redundância custa e não serve ali.

**Cargas efêmeras e reprocessáveis.** Um processamento em lote que pode ser
reexecutado não precisa sobreviver à queda de zona.

**Duas zonas para sistemas que exigem maioria.** Pior que uma em alguns aspectos,
porque dá a impressão de redundância.

**Distribuir sem capacidade de absorção.** Redundância que não aguenta a falha não
é redundância.

**Quando o dado é de zona única de qualquer forma.** Distribuir a computação sem
distribuir o estado não resolve.

## Alternativas

- **[Multi-região](multi-region.md)** — para desastre regional; muito mais caro.
- **Cópia de segurança com restauração testada** — quando indisponibilidade
  temporária é aceitável.
- **Serviços gerenciados que já são multi-zona** — transferem o problema. Ver
  [serviços gerenciados](managed-services.md).
- **Zona única com recuperação rápida** — decisão legítima para sistemas de baixa
  criticidade, desde que explícita.

## Trade-offs

| Multi-zona | Zona única |
|---|---|
| Sobrevive à perda de datacenter | Cai junto |
| Transferência cobrada | Tráfego local barato |
| Latência de poucos ms | Mínima |
| Capacidade ociosa para absorção | Sem folga |
| Configuração adicional | Simples |

| Três zonas | Duas |
|---|---|
| Maioria preservada | Perdida |
| 33% de perda por falha | 50% |
| Custo maior | Menor |

## Modos de Falha

**Tudo numa zona sem ninguém saber.** O padrão de criação levou a isso.

**Duas zonas sem maioria.** A coordenação para.

**Capacidade insuficiente.** As zonas restantes saturam.

**Dado preso a uma zona.** A computação migra, o volume não.

**Zona degradada recebendo tráfego.** A verificação de saúde é rasa demais.

**Custo de transferência inesperado.** Tráfego cruzando zonas sem necessidade.

**Escalonamento automático concentrando numa zona.** Ao repor instâncias, o
provedor pode alocar onde há capacidade — que pode ser uma zona só.

## Erros Comuns

**Não distribuir, por omissão.**

**Usar duas zonas.**

**Não dimensionar para a perda de uma zona.**

**Assumir que o serviço gerenciado é multi-zona.**

**Não configurar preferência de zona no roteamento.**

**Não testar a perda de uma zona.**

## Exemplo Real

Uma plataforma de comércio eletrônico operava em três zonas e considerava-se
resiliente.

Numa falha real de zona — energia, com duração de 4 horas — o sistema ficou
indisponível por 50 minutos. A investigação encontrou quatro causas independentes:

**Capacidade.** As instâncias operavam a 75% em horário normal. Com uma zona fora,
as duas restantes precisariam absorver 112% do que suportavam. O escalonamento
automático começou a subir instâncias, e levou 9 minutos — durante os quais o
sistema estava saturado.

**Banco em duas zonas.** O banco primário e sua réplica síncrona estavam em duas
zonas, não três. A zona que caiu tinha a réplica; a promoção funcionou. Mas o
serviço de coordenação usado para eleição também estava em duas zonas, perdeu
maioria, e não conseguiu decidir por 6 minutos.

**Volumes presos.** Quatro serviços gravavam em disco local. As instâncias foram
recriadas em outras zonas, sem os dados. Dois deles eram cache e se recuperaram;
os outros dois precisaram de restauração.

**Preferência de zona invertida.** Uma configuração de balanceamento fazia o
tráfego cruzar zonas por padrão. Isso já custava caro, e durante o incidente
enviou parte das requisições para a zona degradada — que ainda respondia às
verificações de saúde, apenas com latência muito alta.

As correções:

**Alvo de 55% de utilização** por zona, para absorver a perda de uma sem depender
de escalonamento.

**Coordenação em três zonas**, e o banco também.

**Estado fora do disco local** nos dois serviços que precisavam dele.

**Verificação de saúde sensível a latência**, não só a resposta.

**Preferência de zona no roteamento** — que, como efeito colateral, reduziu a
conta de transferência em cerca de 40%.

**Teste periódico de perda de zona**, em produção, em janela controlada. O primeiro
teste encontrou dois problemas novos.

O que a equipe aprendeu: eles estavam em três zonas e acreditavam estar protegidos.
Estar distribuído e **sobreviver** à falha são coisas diferentes, e a diferença só
aparece no teste — ou no incidente.

## Conceitos Relacionados

- [Regiões](regions.md) — o nível acima.
- [Multi-Região](multi-region.md) — para desastre regional.
- [Disponibilidade](../06-distributed-systems/availability.md).
- [Consenso](../06-distributed-systems/consensus.md) — por que três, não duas.

## Exercício Prático

Descubra em quantas zonas seu sistema roda hoje — e faça a mesma pergunta para o
banco, o cache, os volumes e o serviço de coordenação, separadamente.

Depois calcule: se uma zona sumir agora, as restantes aguentam o pico?

## Perguntas de Entrevista

- Qual a diferença entre zona e região, e por que ela decide a estratégia?
- Por que três zonas e não duas?
- Por que distribuir entre zonas não garante sobreviver à perda de uma?

## Para Aprofundar

- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
- Documentação de zonas de disponibilidade dos principais provedores.
- Vogels, Werner. *10 Lessons from 10 Years of Amazon Web Services*, 2016.
