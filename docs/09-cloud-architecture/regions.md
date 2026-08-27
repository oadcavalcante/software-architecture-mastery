---
id: regions
title: Regiões
sidebar_position: 8
description: A unidade geográfica da nuvem — o que ela isola, o que ela custa e por que quase tudo é regional.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor escolhe região por latência, regulação e custo, e sabe o
  que é isolado entre regiões e o que não é.
prerequisites: [cloud-architecture]
related: [availability-zones, multi-region, cloud-networking]
canonical_for: [região de nuvem, serviço regional, serviço global]
content_version: 1
last_reviewed: 2026-08-27
---

# Regiões

## Visão Geral

Uma região é uma área geográfica onde o provedor opera datacenters. São Paulo,
Virgínia, Frankfurt.

Ela é a **unidade de isolamento de falha e de jurisdição**: uma falha regional não
deveria atravessar para outra região, e um dado gravado numa região fica sob a lei
daquele país.

A maior parte dos serviços de nuvem é regional. Entender o que isso implica — e
quais são as exceções globais — é a base de toda decisão de disponibilidade e de
conformidade.

## Problema

A escolha de região costuma ser feita uma vez, no início, sem critério explícito —
tipicamente "a mais perto" ou "a padrão do console".

Ela é difícil de reverter: migrar dados e infraestrutura entre regiões é projeto,
não configuração.

E ela determina quatro coisas de uma vez: latência para os usuários, jurisdição dos
dados, custo, e quais serviços estarão disponíveis.

## Conceitos Centrais

### O que a região isola

Uma região é projetada para falhar sozinha. Energia, rede, refrigeração e planos de
controle são separados.

Isso é o que torna [multi-região](multi-region.md) uma estratégia de continuidade:
se uma região inteira cai — o que acontece — a outra continua.

O que **não** é isolado: o plano de controle global do provedor, a autenticação, e
os serviços globais listados adiante. Uma falha nesses atravessa regiões, e é
exatamente o tipo de incidente que derruba clientes que se achavam protegidos.

### Regional ou global

```text
regionais     computação, banco de dados, armazenamento de objetos,
              fila, rede virtual
globais       DNS, rede de distribuição de conteúdo, identidade e
              gerenciamento de acesso, faturamento, plano de controle
```

Os serviços globais são o ponto de acoplamento entre regiões. Eles têm alta
disponibilidade e não são infalíveis — vários incidentes de grande alcance foram
falhas de serviço global, não de região.

Uma arquitetura multi-região que depende de um serviço global para funcionar tem
um ponto único que a geografia não protege.

### Latência é geografia, e ela não negocia

```text
mesma cidade                  1 a 3 ms
mesmo país, cidades distantes 10 a 30 ms
mesmo continente              20 a 60 ms
intercontinental              100 a 250 ms
```

Esses números vêm da velocidade da luz na fibra mais os saltos de roteamento.
Nenhuma otimização os reduz.

A consequência de projeto: uma operação que faz cinco chamadas entre regiões paga
cinco vezes esse valor. Ver [PACELC](../06-distributed-systems/pacelc.md) —
consistência forte entre regiões distantes é cara por física, não por
implementação.

### Transferência entre regiões é cobrada

Dentro da região, o tráfego é barato ou gratuito. Entre regiões, é cobrado por
gigabyte, e para a internet, mais ainda.

Isso vira decisão de arquitetura: um serviço numa região consultando um banco em
outra gera custo contínuo, proporcional ao tráfego. Ver
[arquitetura de custo](cost-architecture.md).

### Jurisdição não é detalhe jurídico

O dado gravado numa região está sujeito às leis daquele país. Para dado pessoal,
isso costuma ser requisito, não preferência.

E a residência precisa ser verificada, não presumida: cópias de segurança,
réplicas, registros de aplicação e serviços de apoio podem sair da região sem que
ninguém tenha decidido isso.

### Nem toda região tem tudo

Serviços novos chegam primeiro às regiões maiores. Regiões menores podem levar anos
para receber um serviço, ou nunca recebê-lo.

Isso morde tarde: a arquitetura foi desenhada com um serviço que não existe na
região exigida por regulação, e a descoberta acontece na implementação.

Verificar disponibilidade de serviço por região faz parte da escolha, e é o passo
mais pulado.

### Cota é por região

Limites de recursos são aplicados por região, e as cotas iniciais costumam ser
modestas.

Numa expansão para uma região nova, ou num plano de recuperação que promete subir
capacidade em outra região, a cota é o que impede — e ela só aparece na hora em
que se tenta.

## Modelo Mental

**A região é a unidade de falha e de lei.** Tudo o mais — latência, custo,
disponibilidade de serviço — decorre de escolhê-la.

## Quando Usar

A escolha de região deve ser deliberada quando:

- Há requisito de residência de dados.
- A latência para os usuários importa.
- O custo de transferência é significativo.
- Um serviço específico é necessário.
- Há plano de continuidade em outra região.

## Quando Não Usar

**Múltiplas regiões sem necessidade.** Ver [multi-região](multi-region.md) — o
custo é alto e a maioria dos sistemas não precisa.

**Escolher pela padrão do console.**

**Assumir que todos os serviços existem em todas as regiões.**

**Depender de serviço global sem plano para a falha dele.**

**Chamadas frequentes entre regiões** no caminho crítico.

**Presumir residência de dados** sem verificar cópias, réplicas e registros.

## Alternativas

- **Uma região com várias [zonas de disponibilidade](availability-zones.md)** — a
  configuração adequada para a maioria dos sistemas.
- **Rede de distribuição de conteúdo** — resolve latência de leitura sem
  multi-região.
- **Réplica de leitura em outra região** — proximidade de leitura com escrita
  centralizada.
- **[Recuperação de desastre](disaster-recovery.md) em outra região** — capacidade
  reduzida, ativada sob demanda.

## Trade-offs

| Região única | Múltiplas regiões |
|---|---|
| Operação simples | Complexa |
| Sem transferência entre regiões | Custo contínuo |
| Latência uniforme | Próxima do usuário |
| Falha regional derruba tudo | Continuidade |
| Consistência barata | Cara. Ver [PACELC](../06-distributed-systems/pacelc.md) |
| Uma jurisdição | Várias a gerenciar |

## Modos de Falha

**Falha regional completa.** Acontece, e é o cenário que multi-região atende.

**Falha de serviço global.** Atravessa regiões.

**Dado saindo da jurisdição sem ninguém saber.**

**Serviço indisponível na região exigida.**

**Cota impedindo expansão.** Descoberta durante o incidente.

**Custo de transferência inesperado.** Um serviço conversando entre regiões sem
que ninguém tenha notado.

## Erros Comuns

**Escolher sem critério.**

**Não verificar disponibilidade de serviço por região.**

**Não verificar onde ficam as cópias de segurança.**

**Assumir que multi-região elimina ponto único.**

**Não solicitar aumento de cota na região secundária** antes de precisar.

**Ignorar o custo de transferência no desenho.**

## Exemplo Real

Uma empresa brasileira de saúde operava em uma região dos Estados Unidos, escolhida
no início do projeto por ser a padrão e por ter todos os serviços.

Três problemas apareceram, em ordem de gravidade crescente:

**Latência.** Cada requisição pagava cerca de 130 ms de ida e volta. A aplicação
fazia várias chamadas por tela, e o tempo de carregamento chegava a 2 segundos com
o servidor respondendo em 40 ms. O diagnóstico demorou porque as métricas do
servidor pareciam ótimas.

**Custo de transferência.** Após uma migração parcial para uma região brasileira,
os dois lados passaram a conversar. A transferência entre regiões, não prevista,
adicionou uma despesa mensal significativa — e ela cresceu com o tráfego, sem que
ninguém a estivesse observando.

**Jurisdição.** Uma revisão de conformidade constatou que dados de saúde de
pacientes brasileiros estavam armazenados fora do país. A migração para a região de
São Paulo virou obrigação com prazo.

A migração revelou dois obstáculos que a equipe não tinha previsto:

**Dois serviços não existiam** na região brasileira. Um foi substituído por
alternativa; o outro exigiu implementação própria, com três meses de trabalho.

**Cotas.** A região nova tinha limites baixos por ser conta nova ali. O aumento
levou onze dias úteis entre solicitação e aprovação — no meio do cronograma de
migração.

E um detalhe que quase passou: as **cópias de segurança** estavam configuradas para
replicar para uma região americana, por uma escolha feita anos antes para
"redundância geográfica". Migrar o banco não teria resolvido a conformidade.

O que a equipe registra: a escolha original custou uma migração de oito meses.
Ela foi feita em uma tarde, sem que ninguém tivesse listado latência, jurisdição,
custo e disponibilidade de serviço como critérios — porque na época o sistema
tinha três usuários internos e a região parecia irrelevante.

## Conceitos Relacionados

- [Zonas de Disponibilidade](availability-zones.md) — a subdivisão.
- [Multi-Região](multi-region.md) — quando usar mais de uma.
- [Recuperação de Desastre](disaster-recovery.md).
- [Arquitetura de Custo](cost-architecture.md) — transferência.

## Exercício Prático

Liste onde estão, hoje: seu banco primário, suas réplicas, suas cópias de
segurança, seus registros de aplicação e seus arquivos de usuário.

Se algum estiver numa região diferente da que você acredita, você tem um problema
de jurisdição ou de custo que ninguém decidiu.

## Perguntas de Entrevista

- O que uma região isola, e o que ela não isola?
- Por que uma arquitetura multi-região ainda pode ter ponto único?
- Por que a disponibilidade de serviço por região precisa ser verificada antes?

## Para Aprofundar

- Documentação de infraestrutura global dos principais provedores.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
