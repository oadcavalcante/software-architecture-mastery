---
id: load-balancing
title: Balanceamento de Carga
sidebar_position: 8
description: Distribuir requisições entre instâncias — e por que a escolha do algoritmo importa menos que a verificação de saúde.
doc_type: concept
level: 3
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor configura balanceamento com verificação de saúde adequada
  e reconhece os modos de falha que o balanceador introduz.
prerequisites: [stateless-vs-stateful]
related: [caching, rate-limiting, scalability-basics]
canonical_for: [balanceamento de carga, load balancer, verificação de saúde]
content_version: 1
last_reviewed: 2026-08-26
---

# Balanceamento de Carga

## Visão Geral

Um balanceador distribui requisições entre várias instâncias de um serviço.

A discussão costuma girar em torno do algoritmo de distribuição. Na prática, **a
verificação de saúde importa mais** — um algoritmo perfeito distribuindo para uma
instância doente é pior que um algoritmo simples que a exclui.

## Problema

Uma instância só é limite de capacidade e ponto único de falha. Várias instâncias
resolvem os dois, e criam uma pergunta nova: qual atende cada requisição?

A resposta ingênua — distribuir igualmente — esconde três problemas.

**Instâncias não são iguais.** Uma que acabou de subir tem cache frio e responde
mais devagar. Uma com uma requisição pesada em andamento tem menos capacidade
disponível.

**Instâncias falham parcialmente.** Uma que responde ao teste de saúde mas não
consegue acessar o banco é pior que uma que está fora — ela absorve tráfego e
falha.

**A distribuição interage com o estado.** Se houver estado local, distribuir
uniformemente quebra o comportamento.

## Conceitos Centrais

### Os algoritmos e quando importam

| Algoritmo | Como distribui | Adequado quando |
|---|---|---|
| Round-robin | Em rodízio | Requisições homogêneas, instâncias iguais |
| Menos conexões | Para quem tem menos ativas | Requisições de duração variável |
| Menor latência | Para quem responde mais rápido | Instâncias heterogêneas |
| Hash consistente | Mesma chave, mesma instância | Há estado ou cache local por chave |
| Aleatório com duas escolhas | Sorteia duas, usa a menos ocupada | Bom equilíbrio com pouco custo |

Para requisições homogêneas, round-robin e menos conexões produzem resultados
praticamente idênticos. A escolha só passa a importar quando a duração das
requisições varia muito — aí menos conexões evita que uma instância acumule
requisições longas.

**Hash consistente** é a exceção conceitual: ele existe para preservar
localidade, não para equilibrar. É o que permite cache local por chave e sistemas
com estado particionado.

### Verificação de saúde é a decisão que importa

Um balanceador precisa saber quais instâncias podem receber tráfego. Como ele
sabe é o que decide se ele ajuda ou atrapalha.

**Verificação rasa** — o processo responde? Detecta processo morto e não detecta
instância que perdeu o banco.

**Verificação profunda** — as dependências estão acessíveis? Detecta mais e cria
risco: se o banco cair, todas as instâncias reprovam ao mesmo tempo e o
balanceador tira todas de serviço, transformando degradação em indisponibilidade
total.

A prática que resolve: **duas verificações separadas.** Uma rasa para o
balanceador — "posso receber tráfego?" — e uma profunda para alertas — "estou
saudável?".

E o balanceador precisa de um limite mínimo: se todas reprovam, é melhor mandar
tráfego para todas do que para nenhuma.

### Entrada e saída de instância

Uma instância nova não deve receber carga total imediatamente: cache frio, pools
não aquecidos, código não otimizado pela máquina virtual. Aumento gradual evita
que ela receba tráfego e falhe.

Uma instância saindo precisa terminar o que começou. Desligamento gracioso — parar
de aceitar novas, terminar as em curso, e só então encerrar — é o que evita erro
em toda implantação.

### O balanceador é um componente

Ele tem capacidade, modo de falha e precisa ser redundante. Um balanceador único
apenas moveu o ponto único de falha.

## Modelo Mental

**O balanceador responde a duas perguntas: quem pode receber, e quem recebe
agora.** A primeira é verificação de saúde e importa mais.

## Quando Usar

- Há mais de uma instância do mesmo serviço.
- É preciso escalar horizontalmente.
- A falha de uma instância não pode derrubar o serviço.
- Implantação sem interrupção é requisito.

## Quando Não Usar

**Com uma instância.** O balanceador adiciona um salto e não distribui nada.

**Como solução para lentidão.** Distribuir carga não torna nada mais rápido; se
todas as instâncias estão lentas pela mesma razão, adicionar mais não resolve.

**Com afinidade de sessão como padrão.** Ela é contorno para estado local. Ver
[sem estado vs. com estado](/05-system-design/stateless-vs-stateful.md).

**Sem verificação de saúde configurada.** É o pior dos mundos: tráfego enviado
para instâncias mortas.

## Alternativas

- **DNS com múltiplos registros** — distribuição grosseira, sem verificação de
  saúde, com cache do cliente atrapalhando.
- **Descoberta de serviço no cliente** — o cliente escolhe a instância. Comum em
  [service mesh](/08-integration-architecture/index.md).
- **Fila** — quando o trabalho pode ser assíncrono, a fila distribui sozinha e
  absorve pico.

## Trade-offs

| Com balanceador | Instância única |
|---|---|
| Escala horizontal | Limitada por uma máquina |
| Falha de instância tolerada | Ponto único |
| Implantação sem interrupção | Janela de indisponibilidade |
| Um salto a mais de rede | Direto |
| Mais um componente a operar | Nenhum |
| Exige ausência de estado | Estado local é possível |

## Modos de Falha

**Verificação de saúde rasa demais.** Tráfego para instância que não funciona.

**Verificação profunda derrubando tudo.** Dependência cai, todas reprovam,
balanceador tira todas de serviço.

**Instância nova recebendo carga total.** Falha logo após subir.

**Sem desligamento gracioso.** Erros em toda implantação.

**Balanceador não redundante.** O ponto único mudou de lugar.

**Afinidade desequilibrando.** Instâncias antigas sobrecarregadas.

## Erros Comuns

**Discutir algoritmo antes de verificação de saúde.**

**Uma verificação só, servindo a balanceador e a alerta.**

**Não configurar aumento gradual nem desligamento gracioso.**

**Usar afinidade em vez de remover estado local.**

**Esquecer que o balanceador tem limite de capacidade.**

## Exemplo Real

Um sistema com doze instâncias sofreu uma indisponibilidade total de 40 minutos
causada pela própria verificação de saúde.

O endpoint de saúde consultava o banco. Quando o banco teve uma degradação de 30
segundos, as doze instâncias reprovaram simultaneamente. O balanceador removeu
todas e passou a responder erro para todo tráfego.

O banco se recuperou em 30 segundos. O sistema não — as instâncias precisaram
passar por três verificações consecutivas bem-sucedidas para voltar, e o retorno
em massa gerou uma onda de reconexões que derrubou o banco de novo.

O ciclo se repetiu por 40 minutos.

Três correções.

A verificação do balanceador virou rasa — só confirma que o processo responde. A
profunda continua existindo, mas alimenta alertas, não decisão de roteamento.

Um limite mínimo foi configurado: se menos de 50% das instâncias passam, o
balanceador mantém todas em serviço. Degradar servindo é melhor que não servir.

E o retorno passou a ser escalonado, com aumento gradual, para não gerar onda.

O que causou o incidente não foi o banco — foram 30 segundos de degradação. Foi a
verificação de saúde transformando degradação parcial em indisponibilidade total.

## Camada 4 e camada 7

Balanceadores operam em dois níveis, e a escolha muda o que é possível.

**Camada 4** roteia por endereço e porta, sem abrir o conteúdo. Rápido, barato,
funciona para qualquer protocolo — e não sabe nada sobre a requisição.

**Camada 7** entende o protocolo. Pode rotear por caminho, por cabeçalho, por
método; pode reescrever, comprimir, terminar TLS e repetir uma requisição
falhada.

| | Camada 4 | Camada 7 |
|---|---|---|
| Roteia por | Endereço e porta | Conteúdo da requisição |
| Custo | Mínimo | Processamento por requisição |
| Termina TLS | Não | Sim |
| Repete requisição | Não | Sim |
| Protocolo | Qualquer | O que ele entende |

A capacidade de **repetir** é a diferença mais consequente. Um balanceador de
camada 7 que recebe erro de uma instância pode tentar outra antes de devolver
falha ao cliente — o que transforma uma instância defeituosa em latência extra em
vez de erro visível.

Isso só é seguro para requisições idempotentes. Repetir um `POST` que já foi
processado duplica o efeito, e a maioria dos balanceadores repete apenas métodos
considerados seguros por padrão — o que precisa ser conferido, não presumido.

Na prática, sistemas HTTP usam camada 7 na borda e frequentemente camada 4 mais
para dentro, onde o custo por requisição importa mais que a inteligência.

## Conceitos Relacionados

- [Sem Estado vs. Com Estado](/05-system-design/stateless-vs-stateful.md) — pré-requisito para
  distribuir livremente.
- [Rate Limiting](/05-system-design/rate-limiting.md) — outra função frequentemente no mesmo ponto.
- [Confiabilidade](/12-reliability/index.md) — verificação de saúde e degradação.
- [Escalabilidade](/11-scalability/index.md).

## Exercício Prático

Verifique o endpoint de saúde do seu sistema: ele consulta dependências externas?

Se sim, simule a indisponibilidade de uma delas e observe o que o balanceador faz.
Se ele remove todas as instâncias, você tem o mesmo incidente esperando.

## Perguntas de Entrevista

- Por que a verificação de saúde importa mais que o algoritmo?
- Qual o risco de uma verificação de saúde profunda?
- O que é hash consistente e quando ele é necessário?

## Para Aprofundar

- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 — capítulo
  sobre balanceamento e verificação de saúde.
- Nygard, Michael. *Release It!* 2ª ed., 2018.
