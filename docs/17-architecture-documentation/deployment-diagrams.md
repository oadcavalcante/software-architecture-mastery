---
id: deployment-diagrams
title: Diagramas de Implantação
sidebar_position: 6
description: Onde o software realmente roda — o diagrama que responde perguntas de incidente.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor sabe mapear contêineres em infraestrutura e por que este diagrama
  é o mais consultado durante incidentes.
prerequisites: [container-diagrams]
related: [container-diagrams, c4-model, living-documentation]
canonical_for: [diagrama de implantação, nó de infraestrutura, mapeamento lógico-físico]
content_version: 1
last_reviewed: 2026-08-29
---

# Diagramas de Implantação

## Visão Geral

Um diagrama de implantação mostra **onde cada contêiner roda**: em quais nós de
infraestrutura, em quantas instâncias, em quais regiões, com quais fronteiras de rede.

Ele responde a uma classe de perguntas que os outros níveis não tocam — e que aparecem
justamente nos momentos em que o custo de não ter resposta é alto:

```text
o que cai se esta zona cair?
esses dois serviços estão na mesma máquina?
por onde o tráfego externo entra?
onde estão as réplicas do banco?
esse componente atravessa a fronteira da rede privada?
```

## Problema

O diagrama de [contêiner](container-diagrams.md) é lógico. Ele mostra que existe uma API
de Pedidos. Não mostra que ela roda em seis instâncias distribuídas em três zonas, atrás
de um balanceador, com o banco numa zona só.

Essa diferença importa em dois momentos:

**Durante um incidente**, quando a pergunta é "o que mais está nessa máquina" ou "essa
falha afeta que zonas".

**Ao avaliar disponibilidade**, quando a pergunta é se a redundância lógica corresponde a
redundância física. Ver
[disponibilidade](../06-distributed-systems/availability.md).

O caso clássico: três instâncias de um serviço, todas na mesma zona. O diagrama de
contêiner mostra redundância; o de implantação mostra que ela é ilusória.

## Conceitos Centrais

### Nós e mapeamento

Um nó é qualquer coisa que hospeda: máquina física, máquina virtual, contêiner de
execução, nó de orquestrador, região, zona, serviço gerenciado.

O diagrama expressa **contenção**:

```text
Região sa-east-1
  Zona a
    Nó de orquestração
      API de Pedidos    × 2 instâncias
      API de Catálogo   × 2
  Zona b
    Nó de orquestração
      API de Pedidos    × 2
  Serviço gerenciado
    Banco de Pedidos (primário, zona a; réplica, zona b)
```

O mesmo contêiner do nível anterior aparece aqui **quantas vezes ele existir de fato** —
esse é o mapeamento lógico-físico.

### Um diagrama por ambiente

Produção, homologação e desenvolvimento têm topologias diferentes, e um diagrama que tenta
cobrir os três não descreve nenhum.

```text
produção        redundância real, várias zonas
homologação     uma instância de cada, uma zona
desenvolvimento tudo numa máquina
```

Ver [gestão de ambientes](../14-devops-and-platform/environment-management.md).

Na prática, o de produção é o que se paga. Os outros raramente valem manutenção.

### Fronteiras de rede são o conteúdo mais valioso

O que o diagrama de implantação mostra e nenhum outro mostra:

```text
o que está exposto à internet
o que está em rede privada
onde ficam os pontos de entrada
que caminhos atravessam fronteiras
onde termina a criptografia em trânsito
```

Isso o torna o artefato de referência para conversas de segurança. Ver
[modelagem de ameaças](../10-security/threat-modeling.md) — o diagrama de
implantação é a entrada natural para o exercício.

### Ele expõe redundância falsa

O uso de maior retorno: comparar a redundância pretendida com a real.

```text
"temos três instâncias"     → todas na mesma zona
"temos réplica do banco"    → réplica na mesma zona do primário
"temos dois balanceadores"  → mesma região, sem plano regional
"o cache é redundante"      → uma instância, sem persistência
```

Cada uma dessas foi encontrada em um sistema real por alguém que desenhou o diagrama e
olhou. Ver
[planejamento de recuperação de desastre](../12-reliability/disaster-recovery-planning.md).

### Ele desatualiza — e a infraestrutura é declarada

A topologia muda com frequência, e há uma particularidade: em ambientes modernos, a
topologia **já está declarada** em código de infraestrutura.

Isso muda a equação de manutenção. Um diagrama desenhado à mão vai divergir do que o
código de infraestrutura declara; um diagrama derivado dele não pode divergir.

Ver [infraestrutura como código](../14-devops-and-platform/infrastructure-as-code.md) e
[documentação viva](living-documentation.md).

### Custo aparece aqui e em nenhum outro lugar

O diagrama de implantação é o único que expõe multiplicidade: seis instâncias, três
réplicas, dois ambientes espelhados. E multiplicidade é o que a fatura mede.

```text
diagrama lógico       uma caixa por serviço
diagrama físico       quantas instâncias, em quantas zonas, por quanto tempo
```

Isso o torna útil numa conversa que raramente tem artefato: a de custo de arquitetura.
Uma decisão de redundância entre três zonas é uma decisão de disponibilidade e uma decisão
de gasto, e o mesmo desenho sustenta as duas. Ver
[arquitetura de custo](../09-cloud-architecture/cost-architecture.md).

A conversa fica mais concreta quando o requisito de disponibilidade aparece ao lado da
topologia: pedir 99,99% é pedir uma topologia específica, com um custo específico. Sem o
desenho, o requisito é negociado como adjetivo — "precisa ser altamente disponível" — e a
topologia é decidida depois, por quem estiver implementando, sem que ninguém tenha
comparado as duas coisas.

## Modelo Mental

**Onde as coisas realmente rodam, e o que cai junto.** É o diagrama que se abre durante um
incidente.

## Quando Usar

- Para o ambiente de produção de qualquer sistema com requisito de disponibilidade.
- Ao avaliar se a redundância é real.
- Como entrada para modelagem de ameaças.
- Durante incidentes, para entender raio de impacto.
- Antes de mudanças de topologia.

## Quando Não Usar

**Misturando ambientes** num diagrama só.

**Para sistemas de uma instância** sem requisito de disponibilidade.

**Com detalhe volátil** — nomes de instância, endereços, versões mudam toda semana.

**Mantido à mão** quando a infraestrutura é declarada em código.

**Como substituto** do diagrama de contêiner: ele responde "onde roda", não "o que faz".

## Alternativas

- **Código de infraestrutura** — é a fonte de verdade; o diagrama é a visualização.
- **Painel do provedor** — sempre atual, e sem intenção nem agrupamento.
- **Diagrama gerado a partir do estado real** — a opção mais confiável.
- **Diagrama de contêiner** — quando a pergunta é lógica.

## Trade-offs

| Implantação | Contêiner |
|---|---|
| Onde roda | O que faz |
| Muda com frequência | Mais estável |
| Responde a incidentes | Responde a mudanças |
| Por ambiente | Um só |

| Desenhado | Derivado do estado |
|---|---|
| Mostra a intenção | Mostra o real |
| Diverge | Não pode divergir |
| Agrupamento legível | Automático |

## Modos de Falha

**Ambientes misturados.** Nenhum descrito corretamente.

**Redundância aparente.** Três instâncias na mesma zona.

**Detalhe volátil.** Desatualiza em dias.

**Divergente do código de infraestrutura.** Duas fontes de verdade.

**Só existe para produção antiga.** A migração não atualizou.

## Erros Comuns

**Não mostrar quantidade de instâncias.**

**Omitir zonas e regiões** — que é justamente o que responde ao raio de impacto.

**Não marcar fronteiras de rede.**

**Desenhar à mão o que a infraestrutura já declara.**

**Não datar.**

## Exemplo Real

Uma operadora de serviços financeiros conduziu uma revisão de disponibilidade em doze
sistemas classificados como críticos. O método foi simples: desenhar o diagrama de
implantação de produção de cada um e comparar com o requisito declarado.

Os achados:

```text
sistemas com redundância declarada        12
com redundância real entre zonas           7
com réplica de banco em outra zona         5
com plano de falha regional                2
com o cache como ponto único de falha      4
```

Dois casos concretos:

**Sistema de autorização.** Quatro instâncias, balanceador, requisito de 99,95%. As quatro
instâncias estavam na mesma zona — o grupo de escala tinha sido configurado com uma única
sub-rede três anos antes, e nunca revisado. Uma falha de zona derrubaria o serviço
inteiro.

**Sistema de conciliação.** Banco com réplica configurada, e a réplica na mesma zona do
primário. O procedimento de recuperação documentado pressupunha o contrário.

Nenhum dos dois tinha diagrama de implantação antes do exercício. Ambos tinham diagramas
de contêiner corretos, que mostravam redundância — porque redundância lógica era o que
eles descreviam.

O que foi decidido:

**Diagrama de implantação obrigatório** para sistemas críticos, gerado a partir do código
de infraestrutura, não desenhado.

**Verificação automática** de distribuição por zona, como parte da esteira: um grupo de
escala com sub-rede única em sistema crítico falha a verificação. Ver
[infraestrutura como código](../14-devops-and-platform/infrastructure-as-code.md).

**Revisão anual** de correspondência entre requisito de disponibilidade e topologia real.

Os dois sistemas foram corrigidos em três meses. E oito meses depois houve uma falha de
zona real, de quatro horas: os doze sistemas seguiram operando.

O aprendizado que ficou: a informação que faltava não era difícil nem cara. Ela estava
disponível no console do provedor o tempo todo. Faltava alguém olhar para ela **junto**,
num desenho, com o requisito ao lado.

## Conceitos Relacionados

- [Diagramas de Contêiner](container-diagrams.md) — o nível lógico.
- [Disponibilidade](../06-distributed-systems/availability.md).
- [Infraestrutura como Código](../14-devops-and-platform/infrastructure-as-code.md).
- [Modelagem de Ameaças](../10-security/threat-modeling.md).

## Exercício Prático

Desenhe o diagrama de implantação de produção de um sistema do seu time, marcando zonas e
contagem de instâncias.

Depois compare com o requisito de disponibilidade declarado. A pergunta: uma falha de zona
derruba o sistema?

## Perguntas de Entrevista

- Que pergunta o diagrama de implantação responde e o de contêiner não?
- Como um sistema pode ter redundância lógica sem redundância real?
- Por que derivar este diagrama do código de infraestrutura?

## Para Aprofundar

- Brown, Simon. *Software Architecture for Developers*. Leanpub, 2015.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
- Morris, Kief. *Infrastructure as Code*. 2ª ed. O'Reilly, 2020.
