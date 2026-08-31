---
id: service-boundaries
title: Fronteiras de Serviço
sidebar_position: 20
description: Onde separar processos — a decisão mais cara de reverter no design de sistemas.
doc_type: concept
level: 3
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor decide fronteiras de serviço a partir de evidência do
  histórico e de requisitos de qualidade, não de intuição.
prerequisites: [services]
related: [system-decomposition, microservices, bounded-context]
canonical_for: [fronteira de serviço]
content_version: 1
last_reviewed: 2026-08-27
---

# Fronteiras de Serviço

## Visão Geral

Uma fronteira de serviço separa dois conjuntos de capacidades em processos
distintos, com contrato de rede entre eles.

É a decisão mais cara de reverter do design de sistemas. Mover uma fronteira entre
módulos é refatoração; mover uma fronteira entre serviços é migração de dados,
coordenação entre times e período de convivência.

## Problema

A pergunta "onde separar?" costuma ser respondida por intuição, por analogia com
outro sistema, ou pelo organograma atual.

Os três falham pela mesma razão: **a fronteira certa depende de como o sistema
muda**, e isso não é visível olhando a estrutura num instante.

O sintoma de fronteira errada é conhecido: dois serviços que sempre são
implantados juntos, cuja indisponibilidade mútua derruba ambos, e cujas alterações
aparecem no mesmo pull request. São um serviço com o custo de dois.

## Conceitos Centrais

### As quatro razões, e nenhuma é organização de código

Uma fronteira de serviço se justifica por:

**Ciclo de implantação independente.** Times diferentes precisam entregar sem
coordenar.

**Requisito de qualidade distinto.** Escala, memória, disponibilidade ou latência
muito diferentes do resto.

**Isolamento de falha.** Uma parte não pode derrubar a outra.

**Consumo externo.** Outra organização precisa da capacidade isolada.

Sem uma delas, um módulo entrega o mesmo isolamento lógico por uma fração do
custo. Ver
[design de componentes](/02-software-design/component-design.md).

### O histórico responde melhor que a intuição

A verificação mais confiável é empírica: **que fração dos commits atravessa a
fronteira proposta?**

```bash
# arquivos que mudam juntos, últimos 6 meses
git log --since=6.months --name-only --pretty=format:%H   | awk 'NF' | sort | uniq -c | sort -rn
```

Se dois grupos de arquivos aparecem juntos em 80% dos commits, separá-los em
serviços cria uma fronteira que toda mudança precisa atravessar — com coordenação,
versionamento e período de convivência a cada alteração.

Se aparecem juntos em 5%, a separação captura uma independência real.

Essa medição custa minutos e quase nunca é feita antes da decisão.

### Bounded context é o candidato natural

As fronteiras de [bounded
context](/04-domain-driven-design/bounded-context.md) são as melhores candidatas,
porque derivam de como o negócio se divide — e negócios se dividem de forma mais
estável que tecnologias.

Mas nem todo bounded context precisa virar serviço. A conclusão do
[monolito modular](/03-design-patterns/modular-monolith.md): a fronteira lógica
vale sempre; a física, só com uma das quatro razões.

### Dados definem a fronteira, não código

O critério que mais separa fronteira real de nominal: **cada serviço é dono
exclusivo dos seus dados.**

Se dois serviços leem a mesma tabela, a fronteira não existe — há acoplamento de
esquema sem contrato, que é pior que acoplamento de código.

Isso implica que decidir a fronteira é decidir a partição dos dados. E é a parte
mais difícil: separar código é refatoração; separar dados envolve migração,
consistência eventual e frequentemente [sagas](/06-distributed-systems/index.md).

### Extraia um de cada vez, com razão registrada

A estratégia que funciona: começar como módulos, deixar as fronteiras se provarem,
e extrair **um serviço por vez**, cada um com a razão documentada em
[ADR](/18-architecture-decisions/index.md).

Se não há razão específica, o módulo fica onde está.

## Modelo Mental

**A fronteira certa é aquela que a mudança raramente atravessa.** Isso é
mensurável antes de decidir.

## Quando Usar

- Uma das quatro razões se aplica, comprovadamente.
- O histórico mostra baixa taxa de travessia.
- Os dados podem ser particionados sem consistência forte entre os lados.
- A equipe consegue operar mais um serviço.

## Quando Não Usar

**Sem uma das quatro razões.** Módulo resolve.

**Antes de o domínio se estabilizar.** Fronteira errada entre serviços é a correção
mais cara que existe.

**Quando a consistência entre os lados precisa ser forte.** Separar exige
consistência eventual ou saga; ambas mudam a semântica do negócio e precisam ser
aceitas por ele.

**Quando a travessia é alta.** O histórico já disse que a fronteira está errada.

**Quando o time não tem capacidade operacional.** Cada serviço é mais um em
plantão.

## Alternativas

- **Módulo com fronteira imposta** — a resposta na maioria dos casos.
- **Extração parcial** — separar só o que tem razão, mantendo o resto junto.
- **Processo separado sem API síncrona** — um consumidor de fila isola recurso sem
  criar contrato de chamada.
- **Adiar** — manter como módulo até a razão aparecer.

## Trade-offs

| Fronteira de serviço | Fronteira de módulo |
|---|---|
| Implantação independente | Conjunta |
| Escala e falha isoladas | Compartilhadas |
| Fronteira imposta pela rede | Precisa de mecanismo |
| Mover a fronteira é migração | É refatoração |
| Transação entre os lados impossível | Possível |
| Contrato público versionado | Refatorável |
| Mais um item em operação | Nenhum |

A quarta linha é a assimetria que decide: **é barato promover módulo a serviço e
caro fazer o inverso.** Isso recomenda errar para o lado de menos serviços.

## Modos de Falha

**Monolito distribuído.** Serviços acoplados no release e na disponibilidade.

**Banco compartilhado.** Acoplamento de esquema sem contrato.

**Fronteira no eixo errado.** Toda mudança de negócio atravessa.

**Cadeia síncrona longa.** Disponibilidade multiplicada, latência somada. Ver
[serviços](/05-system-design/services.md).

**Extração sem migração de dados.** O serviço novo continua lendo o banco antigo.

## Erros Comuns

**Decidir por intuição sem medir o histórico.**

**Extrair vários serviços de uma vez.**

**Não separar os dados junto.**

**Copiar a fronteira de outro sistema.** O contexto é o que decide.

**Não registrar a razão.** Sem ela, ninguém sabe se a fronteira ainda faz sentido.

## Exemplo Real

Uma plataforma de educação decidiu extrair quatro serviços de um monolito:
`Cursos`, `Matriculas`, `Pagamentos` e `Certificados`.

Antes de começar, mediram a travessia no histórico de 12 meses.

| Par | Commits conjuntos |
|---|---|
| Cursos ↔ Matriculas | 71% |
| Matriculas ↔ Pagamentos | 34% |
| Pagamentos ↔ Certificados | 3% |
| Cursos ↔ Certificados | 2% |

O primeiro par praticamente não se separava: mudanças em estrutura de curso quase
sempre implicavam mudança em matrícula. Separá-los criaria uma fronteira que 71%
das mudanças atravessariam.

A decisão revisada: `Cursos` e `Matriculas` permaneceram juntos, como módulos com
fronteira imposta. `Certificados` foi extraído — travessia baixa, e tinha
requisito próprio: geração de PDF consumia memória e já tinha derrubado o processo
principal duas vezes.

`Pagamentos` não foi extraído de imediato. A travessia de 34% era ambígua, e não
havia razão de qualidade — o requisito veio um ano depois, quando um segundo
provedor entrou e o time de pagamentos ganhou autonomia.

Resultado após dois anos: dois serviços em vez de quatro, e nenhuma reversão.

O ponto que a equipe sublinha: a medição levou uma tarde e mudou metade das decisões. A
proposta original teria criado duas fronteiras erradas, e desfazê-las custaria
migração de dados nos dois casos.

## Conceitos Relacionados

- [Serviços](/05-system-design/services.md) — o que uma fronteira cria.
- [Decomposição](/05-system-design/system-decomposition.md) — a divisão lógica que precede.
- [Bounded Context](/04-domain-driven-design/bounded-context.md) — o candidato
  natural.
- [Microsserviços](/03-design-patterns/microservices.md) — o estilo.
- [Monolito Modular](/03-design-patterns/modular-monolith.md) — a alternativa
  padrão.

## Exercício Prático

Se você está considerando extrair um serviço, meça antes: que fração dos commits
dos últimos seis meses toca os dois lados da fronteira proposta?

Depois responda qual das quatro razões se aplica. Se nenhuma, a fronteira deveria
ser um módulo.

## Perguntas de Entrevista

- Quais razões justificam uma fronteira de serviço?
- Como verificar empiricamente se uma fronteira está no lugar certo?
- Por que separar dados é mais difícil que separar código?

## Para Aprofundar

- Newman, Sam. *Monolith to Microservices*. O'Reilly, 2019.
- Tornhill, Adam. *Software Design X-Rays*. Pragmatic Bookshelf, 2018 — acoplamento
  medido por histórico.
- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003.
