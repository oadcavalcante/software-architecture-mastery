---
id: secure-boundaries
title: Fronteiras Seguras
sidebar_position: 11
description: Onde a confiança muda — e por que validar na borda não dispensa validar dentro.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor identifica as fronteiras de confiança do seu sistema e
  define o que é verificado em cada uma.
prerequisites: [threat-modeling]
related: [threat-modeling, zero-trust, least-privilege]
canonical_for: [fronteira de confiança, defesa em profundidade, validação na borda]
content_version: 1
last_reviewed: 2026-08-28
---

# Fronteiras Seguras

## Visão Geral

Uma fronteira de confiança é o ponto onde o nível de confiança muda: dados ou
chamadas atravessam de um lugar menos confiável para um mais confiável.

Toda ameaça interessante atravessa uma fronteira. Identificá-las e definir o que é
verificado em cada uma é o que transforma segurança de intenção em desenho.

O erro estrutural mais comum: presumir que tudo depois da primeira fronteira é
confiável. É isso que faz um comprometimento pequeno virar total.

## Problema

O modelo mental herdado é o do castelo: um muro forte no perímetro, e dentro todo
mundo é amigo.

Ele falha porque a premissa é falsa. Atacantes entram — por credencial vazada, por
serviço comprometido, por dependência maliciosa. E funcionários legítimos já estão
dentro.

Uma vez lá, se nada mais verifica nada, o alcance é total. A diferença entre um
incidente contido e um catastrófico raramente é o muro — é o que existe atrás dele.

## Conceitos Centrais

### Onde as fronteiras estão

Elas não são só a borda da rede:

```text
internet → aplicação            entrada não confiável
aplicação → banco               credencial, escopo de acesso
serviço → serviço               autenticação entre serviços
usuário comum → administrativo  elevação de privilégio
inquilino A → inquilino B       isolamento entre clientes
sistema → integração externa    dados de terceiros
código → dependência de terceiro código que você não escreveu
esteira → produção              o que pode implantar
```

As quatro últimas são as menos consideradas, e três delas estão entre os vetores que
mais cresceram.

Marcá-las num diagrama é o produto principal de uma
[modelagem de ameaças](threat-modeling.md).

### Validar na borda não dispensa validar dentro

A validação na borda é necessária e insuficiente.

Ela pressupõe que **toda** entrada passa por ela. Basta um caminho alternativo — um
processo em lote, um script de correção, um endpoint interno, uma fila — para que o
pressuposto quebre.

Por isso a regra: cada componente valida o que recebe, dentro do seu próprio
contexto. Não é redundância desperdiçada — é o que faz o sistema resistir quando um
caminho escapa.

E há um ponto sutil: **a validação correta depende do contexto**. A borda valida
formato; o domínio valida regra de negócio; o banco impõe restrição. São validações
diferentes, não a mesma repetida.

### Defesa em profundidade é sobre o alcance do dano

O princípio não é "várias camadas melhoram a chance de bloquear". É: **quando uma
camada falhar — e uma vai falhar — o que a próxima impede?**

```text
sem profundidade   credencial da aplicação vazada → acesso a todos os dados
com profundidade   credencial vazada → acesso limitado ao escopo daquele serviço
                                     → auditoria registra
                                     → volume anômalo dispara alerta
                                     → dado sensível está cifrado com outra chave
```

Cada camada não impede o comprometimento. Ela reduz o que ele alcança e o tempo até
ser detectado.

Essa é a contribuição mais importante da arquitetura para a segurança, e ela é
estrutural — não se adiciona depois.

### Confiar no chamador é a falha silenciosa

Um serviço interno que aceita `usuario_id` do chamador sem verificar se o chamador
pode agir por aquele usuário está delegando autorização a quem chama.

Isso funciona enquanto todos os chamadores são corretos. Um chamador comprometido —
ou um novo, escrito por alguém que não sabia da premissa — passa qualquer
identificador.

A regra: **autorização é responsabilidade de quem detém o recurso**, não de quem
pede. Ver [modelos de autorização](authz-models.md).

### Isolamento entre inquilinos é fronteira, não filtro

Em sistemas que servem vários clientes, a separação por um campo na consulta é a
implementação mais comum e a mais frágil: basta uma consulta sem o filtro para vazar
dados entre clientes.

As fronteiras mais robustas, em ordem de força:

```text
filtro na consulta       frágil — depende de disciplina em todo lugar
filtro imposto na camada de acesso  melhor — um lugar para errar
esquema ou banco por cliente        forte — o erro não alcança
conta ou ambiente por cliente       mais forte, mais caro
```

A escolha depende do custo de um vazamento entre clientes, e ela é praticamente
irreversível depois de anos de dados.

### Fronteira sem observação não é fronteira

Uma verificação que rejeita e não registra impede aquela tentativa e não revela o
padrão.

Toda fronteira relevante deveria registrar as travessias negadas, e algumas as
aceitas. É o que permite detectar tentativa sistemática. Ver
[auditabilidade](auditability.md).

## Modelo Mental

**Fronteira é onde a confiança muda, e ela nunca é uma só.** O trabalho de
arquitetura é decidir o que é verificado em cada uma.

## Quando Usar

Fronteiras explícitas se pagam sempre. Prioridade quando:

- Há dados sensíveis ou regulados.
- O sistema serve vários clientes.
- Há integrações externas.
- Vários times escrevem código que roda no mesmo ambiente.
- O impacto de um vazamento é alto.

## Quando Não Usar

**Perímetro único como toda a defesa.**

**Validar só na borda.**

**Confiar em identificador enviado pelo chamador.**

**Isolamento por filtro de consulta** quando o custo de vazamento é alto.

**Camadas sem propósito claro.** Defesa em profundidade não é acumular verificações
iguais; cada camada precisa impedir algo diferente.

**Fronteiras sem registro.**

## Alternativas

- **[Confiança zero](zero-trust.md)** — a formulação que elimina o perímetro
  implícito.
- **Segmentação de rede** — fronteira na camada de rede. Ver
  [segurança de rede](network-security.md).
- **Isolamento por processo ou por conta** — mais forte que por configuração.
- **Cifragem por cliente** — a fronteira passa a ser a chave. Ver
  [gestão de chaves](key-management.md).

## Trade-offs

| Muitas fronteiras | Poucas |
|---|---|
| Dano contido | Alcance amplo |
| Mais verificações a manter | Menos código |
| Latência adicional | Menor |
| Diagnóstico mais complexo | Direto |

| Isolamento por conta | Por filtro |
|---|---|
| Erro não alcança | Um esquecimento vaza |
| Custo operacional alto | Baixo |
| Difícil de consultar entre clientes | Trivial |

## Modos de Falha

**Caminho alternativo sem validação.** Lote, script, endpoint interno.

**Autorização delegada ao chamador.**

**Filtro de cliente esquecido numa consulta.**

**Perímetro atravessado, nada mais verifica.**

**Fronteira interna presumida e inexistente.** Dois serviços que se acham isolados
compartilham a mesma credencial de banco.

**Registro ausente.** A tentativa acontece e ninguém sabe.

## Erros Comuns

**Presumir que o interno é confiável.**

**Validar apenas na borda.**

**Aceitar identidade do chamador sem verificar.**

**Isolar clientes só por filtro.**

**Não desenhar as fronteiras.** Se não estão num diagrama, elas não são decisão —
são acidente.

**Não registrar negações.**

## Exemplo Real

Uma plataforma que servia 400 empresas clientes teve um vazamento entre clientes: a
empresa A visualizou dados da empresa B por três semanas antes de reportar.

A causa foi uma consulta nova, escrita para um relatório, sem o filtro de cliente. O
autor não sabia que precisava — em nenhum outro lugar do código o filtro era
explícito, porque a camada de acesso o adicionava automaticamente. O relatório usava
uma consulta direta que contornava essa camada.

A investigação encontrou três fronteiras ausentes:

**Isolamento apenas por filtro.** Todos os clientes no mesmo esquema, separados por
uma coluna.

**Camada de acesso contornável.** Existia e não era obrigatória.

**Sem detecção.** Nenhum alerta para um usuário acessando volume anômalo, nem para
consultas sem filtro de cliente.

E uma quarta, encontrada durante a correção:

**Serviços internos confiando no chamador.** Quatro serviços aceitavam
`empresa_id` do chamador sem verificar. Um deles era alcançável por um endpoint que,
por um erro de configuração de rota, respondia a requisições externas — o que teria
permitido acessar qualquer empresa passando o identificador.

Isso não tinha sido explorado, e era o problema mais grave.

As correções, ao longo de oito meses:

**Isolamento por esquema.** Cada cliente passou a ter esquema próprio. A migração
foi cara e é o que garante que uma consulta esquecida não alcance outro cliente.

**Camada de acesso obrigatória**, com verificação automatizada que recusa consultas
diretas em revisão de código.

**Autorização no detentor do recurso.** Os quatro serviços passaram a derivar a
empresa do token, nunca do parâmetro.

**Detecção de volume anômalo** por usuário e por empresa.

**Registro de negações** em todas as fronteiras.

A lição registrada: a fronteira que falhou não era a que eles vigiavam. O
perímetro externo era sólido — autenticação forte, gateway, limite de taxa. O
vazamento aconteceu inteiramente **dentro** dele, entre dois clientes legítimos,
porque ali não havia fronteira nenhuma.

## Conceitos Relacionados

- [Modelagem de Ameaças](threat-modeling.md) — onde as fronteiras são desenhadas.
- [Confiança Zero](zero-trust.md).
- [Menor Privilégio](least-privilege.md).
- [Modelos de Autorização](authz-models.md).

## Exercício Prático

Desenhe as fronteiras de confiança do seu sistema. Para cada uma, responda: o que é
verificado ao atravessar, e o que acontece se essa verificação falhar?

Depois procure caminhos que contornam a borda — processos em lote, scripts, filas,
endpoints internos. Cada um é uma fronteira que você achava que tinha.

## Perguntas de Entrevista

- Por que validar na borda é necessário e insuficiente?
- O que defesa em profundidade de fato entrega?
- Por que autorização não pode depender do identificador enviado pelo chamador?

## Para Aprofundar

- Shostack, Adam. *Threat Modeling*. Wiley, 2014.
- Saltzer, Jerome; Schroeder, Michael. *The Protection of Information in Computer
  Systems*, 1975.
- OWASP. *Application Security Verification Standard*.
