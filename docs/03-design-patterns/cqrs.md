---
id: cqrs
title: CQRS
sidebar_position: 27
description: Separar o modelo de escrita do de leitura — e o custo de sincronizá-los.
doc_type: pattern
level: 2
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor distingue os níveis de CQRS e sabe quando a separação de
  modelos se paga.
prerequisites: [event-driven]
related: [event-sourcing, command, event-driven]
canonical_for: [CQRS, separação comando-consulta]
content_version: 1
last_reviewed: 2026-08-26
---

# CQRS

## Visão Geral

CQRS — *Command Query Responsibility Segregation* — separa o modelo usado para
alterar estado do modelo usado para consultá-lo.

O nome cobre um espectro, e tratá-lo como uma coisa só é a fonte da maior parte
do mau uso. Há três níveis, com custos que diferem por ordens de grandeza.

## Problema

Um mesmo modelo servindo escrita e leitura acaba servindo mal aos dois.

A escrita precisa de invariantes, de agregados pequenos e de normalização —
para garantir consistência. A leitura precisa de dados combinados,
desnormalizados e no formato da tela — para ser rápida.

Servir aos dois produz o compromisso conhecido: agregados grandes demais para
escrever com segurança, com junções demais para ler com desempenho, e telas que
disparam consultas encadeadas.

## Conceitos Centrais

### Os três níveis

**Nível 1 — separação de métodos.** Comandos alteram e não devolvem dados;
consultas devolvem e não alteram. É o princípio de separação comando-consulta de
Bertrand Meyer, custa quase nada e vale quase sempre.

**Nível 2 — modelos separados, mesmo banco.** O lado de escrita usa agregados; o
de leitura usa consultas diretas ou projeções, sem passar pelo domínio. Custo
moderado, benefício grande.

**Nível 3 — armazenamentos separados.** Escrita e leitura em bancos diferentes,
sincronizados de forma assíncrona. Custo alto: consistência eventual,
sincronização, reprocessamento.

Quando alguém diz "vamos usar CQRS", a primeira pergunta é **qual nível**. A
maior parte dos benefícios está no nível 2; a maior parte dos problemas, no 3.

### O nível 2 é subestimado

Separar os modelos sem separar o armazenamento resolve o conflito principal e não
introduz consistência eventual.

O lado de leitura consulta o banco diretamente, devolvendo exatamente o que a tela
precisa, sem carregar agregados. O lado de escrita mantém os agregados pequenos e
focados em invariantes.

Isso elimina o compromisso e mantém a transação. Para a maioria dos sistemas, é
onde parar.

### O nível 3 e a consistência eventual

Armazenamentos separados significam que o lado de leitura fica atrás do de
escrita por algum intervalo.

A consequência prática é específica e precisa ser decidida pelo negócio: **o
usuário que acabou de gravar pode não ver sua própria alteração.**

Existem mitigações — ler do lado de escrita logo após gravar, ou aguardar
confirmação de projeção — e todas adicionam complexidade.

### CQRS não exige event sourcing

Confusão frequente. Os dois aparecem juntos porque
[event sourcing](/03-design-patterns/event-sourcing.md) produz naturalmente um fluxo para atualizar
projeções, mas são independentes: CQRS funciona com estado tradicional, e event
sourcing pode existir sem CQRS.

## Quando Usar

- **Nível 1:** sempre. É higiene.
- **Nível 2:** quando as necessidades de leitura e escrita divergem de fato —
  telas que combinam dados de vários agregados, ou agregados que ficaram grandes
  para servir a consultas.
- **Nível 3:** quando a carga de leitura é ordens de grandeza maior que a de
  escrita e escalar junto é inviável, ou quando as leituras exigem um modelo de
  armazenamento diferente — busca textual, grafo, série temporal.

## Quando Não Usar

**Nível 3 sem requisito de escala comprovado.** É o erro dominante. Consistência
eventual introduzida por elegância arquitetural custa em suporte, em confusão de
usuário e em complexidade de reprocessamento.

**Em domínios CRUD.** Se leitura e escrita usam os mesmos dados da mesma forma,
não há divergência a resolver.

**Quando o negócio não aceita consistência eventual.** Precisa ser uma decisão
declarada, não uma consequência descoberta.

**Sem estratégia de reprocessamento.** Projeções corrompem, esquemas de leitura
mudam. Se não há como reconstruir do zero, o sistema fica travado no primeiro
erro.

**Como sinônimo de "arquitetura moderna".**

## Alternativas

- **Modelo único** — adequado na maioria dos sistemas.
- **Réplica de leitura** — resolve escala de leitura sem separar modelos.
- **Visões materializadas no próprio banco** — projeções sem infraestrutura
  adicional.
- **Nível 2 apenas** — o meio-termo que resolve a maior parte dos casos.

## Trade-offs

| Nível 3 | Nível 2 | Modelo único |
|---|---|---|
| Escala independente | Escala junto | Escala junto |
| Modelo de leitura otimizado livremente | Consultas otimizadas | Compromisso |
| Consistência eventual | Transacional | Transacional |
| Sincronização a construir e operar | Nenhuma | Nenhuma |
| Reprocessamento necessário | Não | Não |
| Custo operacional alto | Baixo | Nenhum |

## Modos de Falha

**Projeção defasada além do aceitável.** O usuário não vê o que acabou de gravar,
e o suporte recebe o chamado.

**Projeção corrompida sem reconstrução.** Um defeito no consumidor grava dados
errados e não há como refazer.

**Sincronização que falha em silêncio.** O lado de leitura para de atualizar e
ninguém percebe até alguém reclamar.

**Modelos que divergem semanticamente.** A leitura passa a representar coisa
diferente da escrita, e ninguém sabe qual está certa.

**Nível 3 adotado onde o 2 bastava.** Custo por benefício que já estava
disponível.

## Erros Comuns

**Não decidir o nível.**

**Adotar o nível 3 por padrão.**

**Assumir que CQRS exige event sourcing.**

**Não planejar reconstrução de projeção.**

**Não medir a defasagem.** Sem métrica de atraso da projeção, o problema aparece
pelo canal de suporte.

## Onde ele aparece na prática

**Comércio eletrônico de alto volume.** Catálogo lido milhões de vezes e
atualizado raramente — o caso em que o nível 3 se justifica claramente.

**Busca.** Um índice de busca é uma projeção de leitura; quase todo sistema com
busca textual pratica CQRS de nível 3 sem chamá-lo assim.

**Painéis e relatórios.** Modelos de leitura desnormalizados alimentados
assincronamente.

**Sistemas financeiros com extrato.** O saldo é escrito com rigor transacional; o
extrato é uma projeção otimizada para consulta por período.

O caso da busca é o mais instrutivo: ninguém questiona que um índice fique
segundos atrás do banco. A mesma defasagem numa tela de cadastro geraria
reclamação. **A tolerância à consistência eventual é uma propriedade da
funcionalidade**, não do sistema.

## Exemplo Real

Uma plataforma de cursos tinha a tela de listagem consumindo 4 segundos: cada
curso carregava instrutor, categoria, avaliações e número de matriculados, com
carregamento sob demanda produzindo o N+1 clássico.

A proposta inicial foi CQRS de nível 3, com um banco de leitura alimentado por
eventos.

A análise mudou o rumo. A carga de leitura era de 200 requisições por segundo — o
banco aguentava com folga. O problema não era escala; era o modelo de acesso.

A solução foi nível 2: uma consulta única, escrita à mão, devolvendo um tipo de
projeção com exatamente os campos da tela. Sem passar pelos agregados, sem carga
sob demanda.

Tempo caiu para 80 ms. Nenhuma infraestrutura nova, nenhuma consistência eventual,
nenhum reprocessamento a construir.

Dois anos depois, a busca por texto foi para um índice separado — nível 3, e ali
justificado, porque o requisito era de modelo de armazenamento, não de escala.

Os dois níveis coexistem no mesmo sistema, cada um onde se paga.

## Conceitos Relacionados

- [Command](/03-design-patterns/command.md) — a origem do vocabulário.
- [Event Sourcing](/03-design-patterns/event-sourcing.md) — frequentemente combinado, independente.
- [Arquitetura Orientada a Eventos](/03-design-patterns/event-driven.md) — o mecanismo de
  sincronização.
- [Arquitetura de Dados](/07-data-architecture/index.md).

## Exercício Prático

Escolha a tela mais lenta do seu sistema. Verifique se ela carrega agregados
completos para exibir poucos campos.

Se sim, escreva a consulta que devolve exatamente o que a tela precisa. Compare o
tempo. Esse é o ganho do nível 2, sem nenhum custo de consistência.

## Perguntas de Entrevista

- Quais são os níveis de CQRS e qual o custo de cada um?
- CQRS exige event sourcing?
- Que decisão de negócio o nível 3 obriga a tomar?

## Para Aprofundar

- Young, Greg. *CQRS Documents*, 2010.
- Fowler, Martin. *CQRS*, 2011.
- Meyer, Bertrand. *Object-Oriented Software Construction*, 1988 — a separação
  comando-consulta.
