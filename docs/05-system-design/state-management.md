---
id: state-management
title: Gestão de Estado
sidebar_position: 6
description: Onde o estado mora e quem é dono dele — a decisão que determina quão fácil será escalar.
doc_type: concept
level: 3
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor identifica os tipos de estado de um sistema e decide onde
  cada um deve morar.
prerequisites: [components]
related: [stateless-vs-stateful, caching, data-architecture]
canonical_for: [gestão de estado, state management]
content_version: 1
last_reviewed: 2026-08-26
---

# Gestão de Estado

## Visão Geral

Estado é tudo que o sistema lembra entre uma operação e outra.

Decidir **onde** cada tipo de estado mora é uma das decisões mais consequentes do
design de sistemas — ela determina o que pode escalar, o que pode falhar sem
perda, e o que precisa de coordenação.

## Problema

Estado tende a se espalhar sem que ninguém decida.

Uma variável em memória guarda o contador de tentativas. Um campo na sessão guarda
o carrinho. Um arquivo local guarda o último processamento. Uma tabela guarda o
pedido.

Cada uma foi razoável isoladamente. O conjunto produz um sistema em que reiniciar
um processo perde informação, adicionar uma instância quebra o comportamento, e
ninguém sabe listar o que se perde numa falha.

A pergunta que organiza: **para cada coisa que o sistema lembra, o que acontece se
o processo morrer agora?**

## Conceitos Centrais

### Os tipos de estado

Nem todo estado tem o mesmo requisito. Confundi-los é a origem da maior parte dos
problemas.

| Tipo | Exemplo | Perda aceitável? | Onde mora |
|---|---|---|---|
| **Persistente de negócio** | Pedido, cliente, saldo | Nunca | Banco de dados |
| **Sessão** | Carrinho, autenticação | Depende do produto | Armazenamento compartilhado ou token |
| **Cache** | Resultado de consulta | Sempre | Memória ou cache distribuído |
| **Em processamento** | Item numa fila sendo tratado | Precisa ser reprocessável | Fila com confirmação |
| **Efêmero de requisição** | Variáveis de uma chamada | Sim, junto com a requisição | Memória local |

Cache é o único cuja perda é sempre aceitável — porque ele é derivável. Se
perder cache dói, não era cache: era estado com nome errado.

### O estado local é o que impede escalar

Uma instância que guarda estado em memória entre requisições cria três problemas.

Requisições do mesmo usuário precisam voltar para a mesma instância — o que exige
afinidade de sessão no balanceador e desequilibra a carga.

Reiniciar perde. Toda implantação vira perda de estado.

E adicionar instância não distribui carga uniformemente, porque o estado já está
em outro lugar.

Ver [sem estado versus com estado](/05-system-design/stateless-vs-stateful.md).

### Concentre o estado, mantenha o resto sem ele

A recomendação prática: **poucos componentes com estado, muitos sem.**

Os com estado — banco, cache distribuído, fila — são os difíceis de operar:
replicação, recuperação, consistência. Concentrá-los significa ter poucos lugares
difíceis, em vez de dificuldade espalhada.

Todo o resto trata requisições sem lembrar nada, e escala adicionando instâncias.

### Sessão é a decisão que mais gera dúvida

Três opções, com trade-offs distintos:

**No servidor, em memória local.** Simples e impede escalar horizontalmente.

**No servidor, em armazenamento compartilhado.** Escala e adiciona uma chamada de
rede por requisição, mais um componente a operar.

**No cliente, em token assinado.** Sem estado no servidor, escala perfeitamente. E
o token não pode ser revogado antes de expirar, e cresce com o que carrega.

A terceira é a mais usada em sistemas modernos, e a revogação é o problema que ela
não resolve — mitigado por expiração curta mais uma lista de revogação para casos
excepcionais.

## Modelo Mental

**Para cada coisa que o sistema lembra: se este processo morrer agora, o que se
perde e isso é aceitável?**

A resposta classifica o estado e determina onde ele deve morar.

## Quando Usar

Estado local em memória se justifica quando:

- É derivável e a perda é aceitável — cache.
- Vive dentro de uma requisição.
- Há uma instância só e continuará assim.

## Quando Não Usar

**Estado de negócio em memória.** Perda em qualquer reinício.

**Sessão em memória local com múltiplas instâncias.** Exige afinidade e quebra em
implantação.

**Estado de processamento sem confirmação.** Um item retirado da fila e perdido no
meio não é reprocessado.

**Cache tratado como fonte de verdade.** Se perder o cache quebra o sistema, ele
não era cache.

**Arquivo local em ambiente com instâncias efêmeras.** Contêineres e funções
perdem o disco.

## Alternativas

- **Banco de dados** — para estado que não pode ser perdido.
- **Cache distribuído** — para estado compartilhado e descartável.
- **Token assinado** — para sessão sem estado no servidor.
- **Fila com confirmação** — para estado em processamento.
- **Não guardar** — a alternativa mais subestimada: recalcular pode ser mais
  barato que gerenciar.

## Trade-offs

| Estado local | Estado externo |
|---|---|
| Acesso em nanossegundos | Chamada de rede |
| Sem componente adicional | Mais um a operar |
| Impede escala horizontal | Escala livremente |
| Perdido no reinício | Sobrevive |
| Sem consistência a gerenciar | Consistência entre réplicas |

## Modos de Falha

**Perda no reinício.** Implantação vira incidente.

**Divergência entre instâncias.** Cada uma com sua versão do estado.

**Afinidade de sessão desequilibrando carga.** Uma instância sobrecarregada e
outras ociosas.

**Cache virando fonte de verdade.** Descoberto quando o cache é limpo.

**Estado órfão.** Sessões que nunca expiram, ocupando memória.

## Erros Comuns

**Não classificar o estado.** Sem os tipos, todo estado recebe o mesmo tratamento.

**Guardar estado de negócio fora do banco.**

**Usar afinidade de sessão como solução.** É contorno, não decisão.

**Não definir expiração.** Todo estado de sessão e de cache precisa de prazo.

**Colocar estado demais no token.** Ele viaja em cada requisição.

## Exemplo Real

Um sistema de checkout guardava o carrinho em memória, com afinidade de sessão no
balanceador.

Funcionou com duas instâncias. Com oito, três problemas apareceram.

A carga ficou desigual: instâncias antigas acumulavam sessões ativas e as novas
ficavam ociosas.

Toda implantação derrubava carrinhos em andamento — e o time passou a implantar
só de madrugada, o que reduziu a frequência de entrega.

E um pico de Black Friday derrubou duas instâncias por memória, levando junto os
carrinhos que estavam nelas.

A reclassificação separou três coisas que estavam misturadas.

**Identidade e autenticação** viraram token assinado com 15 minutos de validade —
sem estado no servidor.

**Carrinho** foi para cache distribuído com expiração de 7 dias, porque é estado
que o negócio aceita perder eventualmente, mas não a cada implantação.

**Preferências de exibição** — filtro, ordenação — foram para o cliente. Não
precisavam do servidor.

A afinidade de sessão foi removida, a carga equilibrou, e a implantação deixou de
perder carrinho.

A parte instrutiva: nada disso exigiu tecnologia nova. O cache distribuído já
existia no sistema, usado para outra coisa. O que faltava era ter classificado o
estado.

## Comparando as opções de sessão

A decisão de onde guardar sessão aparece em quase todo sistema, e as três opções
têm perfis bem distintos.

| | Memória local | Armazenamento compartilhado | Token no cliente |
|---|---|---|---|
| Latência de leitura | Nanossegundos | Chamada de rede | Verificação local |
| Escala horizontal | Exige afinidade | Livre | Livre |
| Sobrevive a reinício | Não | Sim | Sim |
| Revogação | Imediata | Imediata | Só na expiração |
| Tamanho | Sem limite prático | Sem limite prático | Viaja em cada requisição |
| Componente adicional | Nenhum | Um | Nenhum |

A linha de revogação costuma decidir. Sistemas com requisito de bloqueio
imediato — financeiro, saúde, qualquer contexto com consequência regulatória — não
podem depender só de expiração.

A combinação que a maioria dos sistemas maduros adota resolve isso: token curto
para o acesso, com um estado revogável no servidor para a renovação. O caminho
frequente é sem estado; o raro consulta.

Uma armadilha do token: ele viaja em **toda** requisição, incluindo as de asset se
o cliente não separar. Um token de 4 KB numa página com 60 requisições são 240 KB
de cabeçalho por carregamento.

## Conceitos Relacionados

- [Sem Estado vs. Com Estado](/05-system-design/stateless-vs-stateful.md) — a consequência para
  escala.
- [Cache](/05-system-design/caching.md) — o estado descartável.
- [Balanceamento de Carga](/05-system-design/load-balancing.md) — onde a afinidade aparece.
- [Arquitetura de Dados](/07-data-architecture/index.md) — o estado persistente.

## Exercício Prático

Liste tudo que seu sistema lembra entre requisições.

Para cada item, responda: se o processo morrer agora, o que se perde? Isso é
aceitável? Onde ele mora hoje?

Os itens cuja perda não é aceitável e que moram em memória local são os que vão
causar o próximo incidente de implantação.

## Perguntas de Entrevista

- Quais são os tipos de estado e o que os distingue?
- Por que estado local impede escala horizontal?
- Quais são as opções para sessão e o que cada uma custa?

## Para Aprofundar

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Nygard, Michael. *Release It!* 2ª ed., 2018.
