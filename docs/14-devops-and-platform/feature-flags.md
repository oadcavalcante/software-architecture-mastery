---
id: feature-flags
title: Feature Flags
sidebar_position: 8
description: Separar implantar de liberar — a técnica de maior impacto, e a que mais acumula dívida.
doc_type: pattern
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor usa flags com tipo e ciclo de vida definidos, e evita o
  acúmulo que torna o código incompreensível.
prerequisites: [ci-cd]
related: [ci-cd, canary, release-management]
canonical_for: [feature flag, alternância de funcionalidade, dívida de flag, liberação progressiva]
content_version: 1
last_reviewed: 2026-08-28
---

# Feature Flags

## Visão Geral

Uma feature flag é uma condição que decide, em tempo de execução, se um comportamento
está ativo.

Ela separa duas coisas que normalmente andam juntas: **implantar** o código e
**liberar** a funcionalidade.

Essa separação é a técnica de maior impacto desta seção — ela habilita integração
contínua com código incompleto, liberação progressiva, reversão sem implantação e
experimentos.

E é a que mais acumula dívida: cada flag é uma ramificação a mais no código, e elas não
se removem sozinhas.

## Problema

Sem flags, implantar é liberar. Isso força três coisas ruins:

**Ramos de longa duração**, porque código incompleto não pode ir para o ramo principal.
Ver [integração contínua](ci-cd.md).

**Reversão por implantação**, que leva minutos ou mais e desfaz tudo que veio junto.

**Liberação para todos de uma vez**, sem possibilidade de expor a uma fração primeiro.

Flags resolvem os três. E introduzem um custo permanente que precisa ser gerenciado.

## Conceitos Centrais

### Os tipos, com ciclos de vida diferentes

A distinção que evita a maior parte dos problemas:

```text
de liberação   esconde código incompleto até estar pronto
               vida: dias a semanas → remover
de operação    permite desligar uma funcionalidade em incidente
               vida: permanente → manter
de experimento compara variantes
               vida: semanas → remover após decidir
de permissão   habilita por cliente, plano ou segmento
               vida: permanente → é regra de negócio, não flag
```

As de liberação e de experimento **têm que ser removidas**. As de operação e de permissão
permanecem — e a última, na verdade, deveria ser modelada como regra de negócio, não como
flag.

Misturar os quatro tipos num mesmo mecanismo, sem distinção, é o que produz o acúmulo.

### Toda flag temporária precisa de prazo

Uma flag de liberação sem data de remoção nunca é removida. Isso não é falha de
disciplina — é o comportamento previsível de qualquer item sem dono e sem prazo.

O que funciona:

```text
data de expiração obrigatória na criação
alerta quando passa do prazo
falha na esteira quando passa muito
revisão periódica das ativas
```

A terceira é agressiva e é a que funciona: uma flag vencida há 90 dias quebra a
construção até alguém decidir removê-la ou renovar o prazo com justificativa.

### O custo é combinatório

Cada flag dobra os caminhos possíveis do código.

```text
1 flag    2 estados
5 flags   32 combinações
10 flags  1.024
```

Isso importa por três razões: não se testa todas as combinações; o comportamento em
produção depende de uma configuração que não está no código; e ler o código fica mais
difícil.

A consequência prática: flags devem ser **independentes**. Duas flags que interagem —
onde o comportamento de uma depende do estado da outra — são a origem dos defeitos mais
difíceis desta técnica.

### Avaliar exige contexto e não pode falhar aberto

```text
avaliação   depende de quem — usuário, organização, região, versão
consistência  o mesmo usuário deve ver o mesmo resultado
valor padrão  o que acontece se o serviço de flags não responder
desempenho    avaliação local, não uma chamada de rede por verificação
```

O terceiro item é o mais consequente: se o serviço de flags fica indisponível e o
padrão é "ativo", uma funcionalidade incompleta vai a produção. Ver
[modos de falha de segurança](../10-security/security-failure-modes.md).

O padrão seguro para flags de liberação é **desativado**; para flags de operação, é o
último estado conhecido.

E a avaliação precisa ser local — a configuração é distribuída e avaliada em memória, com
atualização periódica. Uma chamada de rede por verificação adiciona latência e uma
dependência crítica no caminho quente.

### Flag não substitui teste

Uma tentação comum: "vamos liberar e ver o que acontece".

Flags reduzem o **alcance** do erro, não a probabilidade dele. Uma funcionalidade
quebrada liberada para 1% dos usuários quebra para 1% dos usuários.

Elas são complementares à verificação, não alternativas. Ver
[canary](canary.md) — a diferença é que canary compara métricas automaticamente e
reverte, enquanto uma flag apenas expõe.

### Estado de flags é configuração de produção

Quem pode alterar uma flag pode alterar o comportamento do sistema em produção,
imediatamente, sem revisão de código.

Isso exige o mesmo cuidado que qualquer alteração de produção:

```text
auditoria      quem mudou o quê, quando
permissão      nem todo mundo altera todas
revisão        para flags críticas
propagação     quanto tempo até a mudança valer em todas as instâncias
```

A última é operacionalmente importante: durante um incidente, "desliguei a flag" e "a
flag está desligada em toda parte" podem estar a minutos de distância.

## Modelo Mental

**Flag separa implantar de liberar, e cobra um ramo no código.** As temporárias precisam
de prazo; as permanentes precisam de justificativa.

## Quando Usar

- Integrar código incompleto ao ramo principal.
- Liberar progressivamente para frações de usuários.
- Desligar funcionalidade durante incidente. Ver
  [degradação graciosa](../12-reliability/graceful-degradation.md).
- Experimentar variantes.
- Migrar entre implementações, com caminho de volta.

## Quando Não Usar

**Sem prazo**, para as temporárias.

**Para regra de negócio permanente.** Isso é modelagem, não flag.

**Com flags interdependentes.**

**Com padrão ativo** em caso de falha do serviço de flags.

**Como substituto de teste.**

**Com avaliação por chamada de rede** no caminho quente.

**Sem auditoria de alterações.**

## Alternativas

- **Ramos de curta duração** — para mudanças pequenas, integrar em um dia dispensa a
  flag.
- **[Canary](canary.md)** — expõe gradualmente com comparação automática de métricas.
- **Configuração por ambiente** — quando a diferença é entre ambientes, não entre
  usuários.
- **Regra de negócio modelada** — para o que é permanente e depende do plano ou do
  perfil.

## Trade-offs

| Com flags | Sem |
|---|---|
| Implantar sem liberar | Acoplados |
| Reversão em segundos | Por implantação |
| Liberação progressiva | Tudo de uma vez |
| Ramos no código | Caminho único |
| Dívida a gerenciar | Nenhuma |
| Configuração de produção a governar | Menos superfície |

| Avaliação local | Remota |
|---|---|
| Sem latência | Chamada por verificação |
| Atraso de propagação | Imediata |
| Sem dependência crítica | Com |

## Modos de Falha

**Acúmulo.** Centenas de flags, ninguém sabe o que fazem.

**Flags interdependentes.** Comportamento imprevisível em certas combinações.

**Padrão ativo na falha.** Funcionalidade incompleta exposta.

**Alteração sem auditoria.**

**Propagação lenta durante incidente.**

**Código morto atrás de flag desligada há anos.**

**Inconsistência.** O mesmo usuário vê comportamentos diferentes entre requisições.

## Erros Comuns

**Não definir tipo e prazo na criação.**

**Não remover as temporárias.**

**Usar flag para regra de negócio.**

**Não definir o comportamento padrão sob falha.**

**Deixar flags interagirem.**

**Não auditar alterações.**

## Exemplo Real

Uma plataforma de comércio adotou feature flags e, em três anos, acumulou **740 flags
ativas**.

Os efeitos:

**Código ilegível.** Alguns módulos tinham cinco ou seis condições aninhadas de flags. A
leitura exigia consultar a configuração de produção para saber qual caminho estava
ativo.

**Defeito por interação.** Duas flags criadas por times diferentes, que sozinhas
funcionavam, produziam um estado inválido quando ambas ativas — situação que ocorria
para 3% dos usuários. Levou seis semanas para ser diagnosticado.

**Código morto.** Uma auditoria encontrou 310 flags desligadas havia mais de um ano, com
o código de ambos os caminhos ainda presente.

**Sem auditoria.** Uma alteração de flag durante um incidente foi feita por alguém que
não lembrava tê-la feito, e o registro não existia.

A reformulação:

**Tipagem obrigatória.** Cada flag declara tipo e, para as temporárias, data de
expiração.

**Falha na construção** para flags de liberação vencidas há mais de 60 dias. Isso
removeu 280 flags nos primeiros quatro meses — a maioria por remoção efetiva do código,
não por renovação de prazo.

**Independência verificada.** Uma regra de revisão passou a exigir que flags novas não
dependam do estado de outras. Casos legítimos de dependência viraram uma flag só com
mais de dois estados.

**Padrão desativado** para liberação, último estado conhecido para operação.

**Auditoria de alterações**, com permissão por criticidade.

**Avaliação local** com propagação de até 30 segundos, substituindo a chamada de rede
que existia no caminho de checkout.

Em dezoito meses, as 740 flags viraram **94** — das quais 61 são de operação
permanentes, com justificativa registrada.

O que a equipe registra: a técnica nunca foi o problema, e ela continua sendo a mais
valiosa que adotaram. O que faltava era o ciclo de vida — criar era fácil e remover não
tinha dono.

## Conceitos Relacionados

- [Integração Contínua](ci-cd.md) — o que as flags habilitam.
- [Canary](canary.md) — a liberação com comparação automática.
- [Gestão de Releases](release-management.md).
- [Degradação Graciosa](../12-reliability/graceful-degradation.md) — as flags de
  operação.

## Exercício Prático

Conte as flags ativas no seu sistema e classifique-as por tipo.

Depois verifique quantas das temporárias passaram do prazo — ou, se não há prazo, há
quanto tempo a mais antiga existe.

## Perguntas de Entrevista

- Quais os quatro tipos de flag, e quais precisam ser removidos?
- Por que flags interdependentes são perigosas?
- Por que o comportamento padrão sob falha do serviço de flags importa?

## Para Aprofundar

- Hodgson, Pete. *Feature Toggles*. martinfowler.com, 2017.
- Humble, Jez; Farley, David. *Continuous Delivery*. Addison-Wesley, 2010.
- Forsgren, Nicole et al. *Accelerate*. IT Revolution, 2018.
