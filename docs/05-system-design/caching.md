---
id: caching
title: Cache
sidebar_position: 9
description: Guardar resultado para não recalcular — e a invalidação, que é o problema real.
doc_type: concept
level: 3
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor escolhe estratégia de cache a partir do padrão de acesso e
  da tolerância a dado velho, e sabe por que a invalidação decide tudo.
prerequisites: [state-management]
related: [cdn, load-balancing, scaling-cache]
canonical_for: [cache, invalidação de cache, TTL]
content_version: 1
last_reviewed: 2026-08-26
---

# Cache

## Visão Geral

Cache guarda o resultado de uma operação cara para reusá-lo, trocando **memória e
frescor** por **latência e carga**.

É a otimização de maior retorno em sistemas de leitura intensa. E a decisão que
importa não é onde colocar o cache — é **quando o dado guardado deixa de valer**.

## Problema

Cache é fácil de adicionar e difícil de acertar. O padrão que aparece:

Alguém adiciona cache numa consulta lenta. Funciona — a latência cai, a carga do
banco cai.

Semanas depois, um usuário reclama que alterou um dado e a tela continua mostrando
o valor antigo. Alguém adiciona invalidação naquele ponto.

Depois outro ponto. Depois um terceiro que ninguém lembrou. Ao final, o sistema
tem cache invalidado em nove lugares, três deles inconsistentes entre si, e
ninguém sabe listar o que está em cache e por quanto tempo.

**A dificuldade do cache não é guardar. É saber quando descartar.**

## Conceitos Centrais

### As estratégias de leitura

| Estratégia | Como funciona | Custo |
|---|---|---|
| **Cache-aside** | A aplicação consulta o cache; se não achar, busca na origem e grava | A aplicação controla; primeira leitura é lenta |
| **Read-through** | O cache busca na origem sozinho | Menos código; menos controle |
| **Refresh-ahead** | O cache renova antes de expirar | Sem penalidade de primeira leitura; renova o que ninguém vai ler |

Cache-aside é o mais usado e o mais previsível. O código fica explícito sobre o
que está em cache.

### As estratégias de escrita

**Write-through** — grava no cache e na origem, sincronamente. Consistente e mais
lento na escrita.

**Write-behind** — grava no cache e persiste depois. Rápido e com janela de perda.

**Write-around** — grava só na origem, invalidando o cache. Simples, e a próxima
leitura paga.

A escolha depende de quanto se aceita perder numa falha. Write-behind num sistema
financeiro é decisão que precisa ser autorizada pelo negócio, não pela engenharia.

### Invalidação: as três abordagens

**Expiração por tempo (TTL).** O dado vale por N segundos. Simples, previsível, e
serve dado velho por até N segundos.

**Invalidação explícita.** Quem altera o dado remove do cache. Preciso, e exige
que todo caminho de escrita conheça o cache — o que é onde os erros moram.

**Invalidação por evento.** Quem altera publica; o cache reage. Desacopla os
caminhos de escrita do cache, ao custo de consistência eventual.

A recomendação prática: **comece com TTL curto.** Ele é o único que não tem
caminho esquecido, e a maior parte dos sistemas tolera segundos de dado velho.
Invalidação explícita só onde o TTL não basta.

### O que decide: tolerância a dado velho

A pergunta que precede todas as outras: **quanto tempo de dado desatualizado o
negócio aceita, para este dado específico?**

Um catálogo de produtos: minutos. Um saldo de conta: zero. Um contador de
visualizações: horas.

A resposta define o TTL e determina se invalidação explícita é necessária. Sem
ela, a decisão vira preferência.

### Cache não é fonte de verdade

Se perder o cache quebra o sistema, ele não era cache — era um banco de dados sem
durabilidade. Ver
[gestão de estado](/05-system-design/state-management.md).

O teste: limpe o cache em produção. Se o sistema sobrevive mais lento, é cache. Se
quebra, era estado.

## Modelo Mental

**Cache é uma aposta de que o dado não vai mudar antes de você usá-lo de novo.**
O TTL é o tamanho da aposta.

## Quando Usar

- A operação é cara e o resultado é reusado.
- A razão entre leitura e escrita é alta.
- O negócio tolera algum atraso no dado.
- A origem é o gargalo comprovado.

## Quando Não Usar

**Quando a leitura já é barata.** O cache adiciona um salto de rede e um
componente.

**Quando o dado muda a cada leitura.** Taxa de acerto próxima de zero, custo
integral.

**Quando o negócio não tolera dado velho e a invalidação seria frágil.** Melhor
não ter que ter um cache que ocasionalmente serve valor errado num contexto que
não aceita.

**Como correção para consulta ruim.** Um índice ausente resolvido com cache
esconde o problema — e ele volta quando a taxa de acerto cair.

**Sem medir antes.** Cache adicionado sem perfil frequentemente resolve o que não
era gargalo.

## Alternativas

- **Otimizar a origem** — índice, consulta, desnormalização. Frequentemente
  suficiente e sem componente novo.
- **Projeção de leitura** — um modelo mantido para consulta. Ver
  [CQRS](/03-design-patterns/cqrs.md) de nível 2.
- **[CDN](/05-system-design/cdn.md)** — cache na borda, para conteúdo público.
- **Cache no cliente** — cabeçalhos HTTP fazem o navegador guardar; é o cache mais
  barato que existe e o menos usado deliberadamente.

## Trade-offs

| Com cache | Sem cache |
|---|---|
| Latência menor | Sempre a da origem |
| Carga menor na origem | Toda leitura chega |
| Dado pode estar velho | Sempre atual |
| Invalidação a gerenciar | Nada a gerenciar |
| Mais um componente | Menos peças |
| Comportamento varia com acerto ou erro | Previsível |

A última linha é subestimada: um sistema com cache tem dois perfis de desempenho,
e o pior deles — cache frio — é o que aparece justamente após um reinício ou um
pico.

## Modos de Falha

**Cache velho servido além do aceitável.** Invalidação esquecida num caminho.

**Estouro de cache.** O cache expira ou é limpo, e toda a carga vai para a origem
de uma vez. Um pico que a origem não aguenta.

**Estampida.** Muitas requisições para a mesma chave expirada, todas recalculando
ao mesmo tempo. Mitigado por bloqueio ou por renovação antecipada.

**Cache virando fonte de verdade.** Descoberto quando ele é limpo.

**Taxa de acerto baixa.** Todo o custo, pouco benefício, e ninguém mede.

**Inconsistência entre instâncias.** Cache local em várias instâncias, cada uma com
sua versão.

## Erros Comuns

**Não medir a taxa de acerto.** É a métrica que diz se o cache está servindo.

**Não definir TTL.** Cache sem prazo é vazamento.

**Invalidação explícita como primeira opção.** TTL curto resolve mais e erra
menos.

**Cache local com múltiplas instâncias.** Divergência garantida.

**Não pensar no cache frio.** O desempenho após reinício é o que o usuário vê no
pior momento.

## Exemplo Real

Uma plataforma de cursos adicionou cache na consulta de catálogo — a mais lenta do
sistema, 900 ms.

Com TTL de uma hora, a latência caiu para 12 ms e a carga do banco caiu 70%.

Dois problemas apareceram nos meses seguintes.

**O primeiro:** instrutores alteravam a descrição de um curso e a mudança demorava
até uma hora para aparecer. Reclamação recorrente no suporte.

A correção inicial foi invalidação explícita ao salvar. Funcionou até alguém
descobrir que havia três caminhos de alteração — painel do instrutor, importação
em lote e correção administrativa — e só o primeiro invalidava.

**O segundo:** numa implantação, todas as instâncias subiram com cache frio
simultaneamente. As requisições de catálogo foram todas para o banco ao mesmo
tempo, e ele saturou por quatro minutos.

As correções finais.

O TTL caiu para 60 segundos — a conversa com o negócio revelou que um minuto era
perfeitamente aceitável, e ninguém tinha perguntado antes de escolher uma hora.
Isso sozinho resolveu a reclamação sem invalidação nenhuma.

A invalidação explícita foi mantida só onde importava, mas movida para um evento
publicado pelo domínio — assim os três caminhos passaram a invalidar sem precisar
conhecer o cache.

E foi adicionado bloqueio contra estampida: numa expiração, só uma requisição
recalcula; as demais esperam o resultado.

O que resolveu o problema principal não foi mecanismo. Foi perguntar ao negócio
qual atraso era aceitável — pergunta que a decisão original tinha pulado.

## Onde o cache pode ficar

Cache não é um lugar só. Cada camada tem custo e alcance diferentes, e a mais
barata é a que menos se usa deliberadamente.

**No navegador.** Cabeçalhos HTTP fazem o cliente guardar. Custo zero de
infraestrutura, e a requisição sequer sai da máquina. É o primeiro a configurar e
o mais esquecido.

**Na [CDN](/05-system-design/cdn.md).** Perto do usuário, compartilhado entre todos. Só para
conteúdo idêntico para muitos.

**No gateway.** Antes de chegar à aplicação. Útil para respostas públicas de API.

**Na aplicação, local.** Nanossegundos de acesso, e cada instância tem a sua —
divergência garantida com múltiplas instâncias.

**Distribuído.** Compartilhado entre instâncias, com uma chamada de rede. É onde a
maioria dos caches de aplicação vive.

**No banco.** O cache de páginas do próprio banco, que já existe e é bem
dimensionado. Frequentemente o problema atribuído à falta de cache é o banco não
ter memória suficiente para manter o índice quente.

A ordem de avaliação deveria ser de cima para baixo — a resposta mais barata
primeiro. A ordem de fato costuma ser começar pelo cache distribuído, que é a mais
visível.

## Conceitos Relacionados

- [Gestão de Estado](/05-system-design/state-management.md) — cache como estado descartável.
- [CDN](/05-system-design/cdn.md) — cache na borda.
- [Escalabilidade](/11-scalability/index.md) — cache como estratégia de escala.
- [CQRS](/03-design-patterns/cqrs.md) — projeção como alternativa.

## Exercício Prático

Liste o que está em cache no seu sistema. Para cada item: qual o TTL? Qual a taxa
de acerto? Quanto tempo de dado velho o negócio aceita?

Se você não sabe responder a terceira pergunta para algum item, o TTL dele foi
escolhido sem critério.

## Perguntas de Entrevista

- Qual é o problema difícil do cache, e por quê?
- Quando TTL é preferível a invalidação explícita?
- O que é estampida e como mitigar?

## Para Aprofundar

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Nygard, Michael. *Release It!* 2ª ed., 2018 — cache e estabilidade.
