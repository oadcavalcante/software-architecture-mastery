---
id: redundancy
title: Redundância
sidebar_position: 5
description: Mais de um de tudo — e a correlação, que é o que anula a redundância.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor avalia redundância pela independência real das cópias, não
  pela quantidade delas.
prerequisites: [reliability]
related: [failover, fault-tolerance, availability-metrics]
canonical_for: [redundância, correlação de falhas, N+1, redundância ativa]
content_version: 1
last_reviewed: 2026-08-28
---

# Redundância

## Visão Geral

Redundância é ter mais de um: mais de uma instância, mais de um nó, mais de um caminho
de rede, mais de um provedor.

A matemática é atraente. Dois componentes com 99% de disponibilidade cada, se
**independentes**, dão 99,99% combinados.

A palavra que decide tudo é a destacada. Falhas correlacionadas — as que atingem todas
as cópias ao mesmo tempo — anulam a redundância, e elas são muito mais comuns do que a
matemática sugere.

## Problema

A conta de disponibilidade combinada pressupõe independência:

```text
P(ambos falharem) = P(A falha) × P(B falha) = 0,01 × 0,01 = 0,0001
```

Isso só vale se a falha de A não tem relação com a de B. Na prática, as cópias
compartilham quase tudo:

```text
mesmo código          um defeito derruba todas
mesma configuração    uma mudança errada derruba todas
mesma implantação     uma versão ruim derruba todas
mesma dependência     ela cai, todas param
mesma zona            energia, rede, refrigeração
mesmo certificado     expira para todas no mesmo instante
```

Com dependência compartilhada, três cópias não são melhores que uma para aquela classe
de falha.

## Conceitos Centrais

### Correlação é a variável que importa

A pergunta a fazer para qualquer redundância: **o que faria todas as cópias falharem
juntas?**

A lista costuma ser mais longa do que se espera, e ela é o mapa do que a redundância
não protege.

```text
protegido por N cópias      falha de hardware, de instância, de processo
não protegido               defeito de código, configuração errada,
                            certificado expirado, dependência comum,
                            esgotamento de cota, erro humano
```

A segunda coluna contém os incidentes mais comuns em sistemas modernos. Redundância
resolve a primeira e não toca a segunda.

### As formas de redundância

```text
ativo-ativo    todas as cópias servem; a perda de uma reduz capacidade
ativo-passivo  uma serve; a outra assume. Ver failover
N+1            capacidade para N, com uma cópia extra
N+M            tolera M falhas simultâneas
```

**Ativo-ativo** tem uma vantagem operacional decisiva: a cópia reserva está sendo
exercitada o tempo todo. Numa configuração passiva, a reserva pode estar quebrada há
meses sem que ninguém saiba.

Essa é a razão prática para preferir ativo-ativo quando possível — não a utilização de
recursos, mas o fato de que o caminho de recuperação é o caminho normal.

### N+1 exige capacidade de absorção

Ter uma cópia extra não basta se as restantes não aguentam a carga.

```text
3 nós a 80% de utilização
  um cai → os dois restantes precisam de 120% → não aguentam
3 nós a 60%
  um cai → os dois restantes ficam a 90% → aguentam
```

Ver [zonas de disponibilidade](/09-cloud-architecture/availability-zones.md) e
[planejamento de capacidade](/11-scalability/scaling-capacity-planning.md).

A folga é parte da redundância. Sem ela, a redundância existe no diagrama e não na
operação.

### Diversidade reduz correlação, e custa

Cópias diferentes falham por razões diferentes:

```text
zonas diferentes       protege contra falha de datacenter
regiões diferentes     contra desastre regional
provedores diferentes  contra falha de provedor
implementações diferentes contra defeito de software
```

A última é a mais eficaz contra defeito de código e a mais cara — manter duas
implementações do mesmo sistema raramente se justifica fora de contextos de segurança
crítica.

As três primeiras são praticáveis, com custo crescente. Ver
[multi-região](/09-cloud-architecture/multi-region.md).

### Implantação gradual é redundância no tempo

Contra defeito de código, a redundância espacial não ajuda. O que ajuda é não implantar
em tudo ao mesmo tempo:

```text
implantação em fases   uma fração recebe a versão nova; observa; avança
implantação canary     tráfego pequeno na versão nova
reversão rápida        voltar em minutos
```

Isso protege exatamente a classe de falha que mais causa incidentes em sistemas
maduros, e não aparece nas discussões sobre redundância — porque não é sobre ter mais
cópias.

### Redundância adiciona modos de falha

Vale a franqueza: mais cópias significam mais coisas para dar errado.

**Cérebro dividido.** Duas cópias se consideram principais. Ver
[eleição de líder](/06-distributed-systems/leader-election.md).

**Divergência de configuração.** As cópias deixam de ser idênticas.

**Falha no failover.** O mecanismo de troca não funciona quando acionado. Ver
[failover](/12-reliability/failover.md).

**Complexidade de diagnóstico.** Comportamento inconsistente entre cópias.

Redundância mal implementada pode ser menos disponível que uma cópia única bem operada.

## Modelo Mental

**Redundância protege contra o que é independente.** A lista do que é compartilhado é
a lista do que ela não resolve.

## Quando Usar

- Falha de hardware ou de instância é a ameaça principal.
- A indisponibilidade tem custo relevante.
- É preciso manter serviço durante manutenção.
- Há requisito de disponibilidade acordado.
- O componente é sem estado — a redundância é barata.

## Quando Não Usar

**Sem verificar a correlação.**

**Sem capacidade de absorção.**

**Ativo-passivo sem exercitar** a cópia reserva.

**Contra defeito de código.** Ali a resposta é implantação gradual.

**Quando o custo supera o da indisponibilidade.**

**Sem mecanismo de troca testado.**

## Alternativas

- **Recuperação rápida** — em vez de evitar a falha, encurtar o tempo de retomada.
  Frequentemente mais barato e suficiente.
- **[Degradação graciosa](/12-reliability/graceful-degradation.md)** — operar com menos.
- **Implantação gradual** — contra a classe de falha mais comum.
- **Simplificar** — menos componentes falham menos. É a alternativa menos citada e
  frequentemente a correta.

## Trade-offs

| Mais redundância | Menos |
|---|---|
| Tolera mais falhas | Menos |
| Custo maior | Menor |
| Mais complexidade | Menos |
| Mais modos de falha próprios | Menos |
| Capacidade ociosa | Utilização alta |

| Ativo-ativo | Ativo-passivo |
|---|---|
| Reserva exercitada | Pode estar quebrada |
| Toda capacidade em uso | Ociosa |
| Sem troca a executar | Failover a testar |
| Coordenação necessária | Mais simples |

## Modos de Falha

**Falha correlacionada.** Todas as cópias caem juntas.

**Capacidade insuficiente.** As restantes saturam.

**Reserva quebrada.** Nunca exercitada.

**Cérebro dividido.**

**Divergência de configuração.**

**Certificado ou credencial compartilhada expirando.**

**Cota compartilhada esgotada.** Todas as cópias competem pelo mesmo limite externo.

## Erros Comuns

**Contar cópias em vez de avaliar independência.** Três réplicas no mesmo rack, na mesma zona ou com a mesma dependência de configuração falham juntas. O que protege é a independência, não o número.

**Não dimensionar para a perda.** Redundância sem folga muda o modo de falha: em vez de cair na hora, o sistema sobrevive à perda e satura em seguida com a carga redistribuída.

**Não exercitar a reserva.** Componente passivo que nunca recebe tráfego acumula defeitos silenciosos — configuração divergente, certificado vencido, versão antiga.

**Ignorar dependências compartilhadas.** DNS, autenticação, plano de controle e sistema de configuração são comuns a todas as cópias, e derrubam todas ao mesmo tempo.

**Não usar implantação gradual.** A causa mais frequente de indisponibilidade é mudança, e redundância não protege contra código ruim propagado para todas as réplicas simultaneamente.

**Adicionar redundância sem testar o mecanismo de troca.** A cópia extra só vale se a passagem para ela funcionar. Sem exercício, paga-se pelo dobro da infraestrutura e mantém-se o mesmo risco.

## Exemplo Real

Uma plataforma de pagamentos tinha redundância em todas as camadas: três instâncias de
aplicação em três zonas, banco com réplica síncrona, dois provedores de gateway.

Em dezoito meses, três incidentes derrubaram o sistema inteiro. Nenhum foi falha de
hardware.

**Certificado expirado.** O certificado interno usado entre serviços expirou. Todas as
instâncias pararam simultaneamente, porque compartilhavam o mesmo certificado com a
mesma data. Duração: 90 minutos, até alguém identificar a causa.

**Configuração errada.** Uma mudança de configuração aplicada às três zonas ao mesmo
tempo continha um erro. As três instâncias falharam ao iniciar. A redundância não
protegeu, porque a mudança foi simultânea.

**Defeito de código.** Uma versão com vazamento de memória foi implantada em todas as
instâncias. Elas degradaram juntas, ao longo de 40 minutos.

As correções atacaram a correlação, não a quantidade:

**Certificados escalonados.** Datas de expiração diferentes por zona, com monitoramento
de proximidade. Um certificado expirando passou a degradar uma zona, não o sistema.

**Configuração em fases.** Mudanças de configuração passaram a ser aplicadas zona a
zona, com observação entre elas — o mesmo tratamento dado a implantação de código.

**Implantação canary.** 5% do tráfego na versão nova por 30 minutos, com métricas
comparadas automaticamente. O vazamento de memória seguinte foi detectado com 5% de
impacto, não 100%.

**Inventário de dependências compartilhadas.** Um levantamento explícito do que as três
zonas têm em comum. Ele encontrou mais quatro itens: uma cota de API externa
compartilhada, um bucket de configuração, um serviço de resolução de nomes interno e
uma credencial de banco única.

E uma decisão em sentido contrário: a proposta de adicionar uma quarta zona foi
recusada. A análise mostrou que nenhum dos três incidentes teria sido evitado por ela,
e o custo seria significativo.

O detalhe que a equipe destaca: eles tinham redundância de sobra e correlação em toda parte. A
pergunta "o que faria as três zonas caírem juntas?" nunca tinha sido feita — e a
resposta tinha sete itens.

## Conceitos Relacionados

- [Failover](/12-reliability/failover.md) — o mecanismo de troca.
- [Tolerância a Falhas](/12-reliability/fault-tolerance.md).
- [Zonas de Disponibilidade](/09-cloud-architecture/availability-zones.md).
- [Disponibilidade](/06-distributed-systems/availability.md) — a matemática.

## Exercício Prático

Escolha um componente redundante do seu sistema e liste tudo o que as cópias
compartilham — código, configuração, certificado, dependência, cota, credencial, zona.

Cada item da lista é uma falha que a redundância não cobre.

## Perguntas de Entrevista

- Por que a matemática de disponibilidade combinada frequentemente não vale?
- Por que ativo-ativo é preferível a ativo-passivo, além da utilização?
- Contra qual classe de falha a redundância espacial não ajuda?

## Para Aprofundar

- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
- Nygard, Michael. *Release It!*. 2ª ed. Pragmatic Bookshelf, 2018.
- Hamilton, James. *On Designing and Deploying Internet-Scale Services*. LISA, 2007.
