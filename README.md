<div align="center">

# Software Architecture Mastery

**Um percurso para Engenheiros de Software que querem pensar como Arquitetos.**

Não é um catálogo de padrões. É o raciocínio que decide quando *não* usá-los.

[![CI](https://github.com/oadcavalcante/software-architecture-mastery/actions/workflows/ci.yml/badge.svg)](https://github.com/oadcavalcante/software-architecture-mastery/actions/workflows/ci.yml)
[![Deploy](https://github.com/oadcavalcante/software-architecture-mastery/actions/workflows/deploy.yml/badge.svg)](https://github.com/oadcavalcante/software-architecture-mastery/actions/workflows/deploy.yml)
<!-- BADGES:PROGRESS -->
![progresso](https://img.shields.io/badge/progresso-28%25-blue)
![documentos](https://img.shields.io/badge/documentos-120%2F436-informational)
<!-- /BADGES:PROGRESS -->
![Licença](https://img.shields.io/badge/conteúdo-CC%20BY--SA%204.0-green)
![Código](https://img.shields.io/badge/código-MIT-green)

**Português (Brasil)** · [English](README.en-US.md)

</div>

---

## O problema que este material resolve

A maior parte do material sobre arquitetura ensina **formas**: camadas,
microsserviços, filas, CQRS. Isso produz profissionais que reconhecem estruturas e
não sabem escolher entre elas — porque nunca aprenderam a articular o que estão
tentando otimizar.

Aqui a pergunta nunca é *"qual é a arquitetura certa?"*. É *"certa para quê, sob
quais restrições?"*.

```text
Entender o problema  →  Identificar restrições  →  Avaliar alternativas
        →  Raciocinar sobre trade-offs  →  Decidir  →  Comunicar  →  Evoluir
```

## O que torna este material diferente

**Nenhum padrão é apresentado sem a discussão de quando NÃO usá-lo.** Não como
formalidade — como a parte mais útil de cada documento, com condições concretas.

Alguns exemplos do que essa regra produziu:

> **Singleton** acopla duas decisões independentes — unicidade e acesso global — e
> quase sempre você só precisa da primeira.

> **Visitor** escolhe um lado do dilema da expressão. Se os *tipos* é que crescem,
> ele é o erro mais caro do catálogo.

> **Event Sourcing** impõe versionamento de evento **para sempre**. A pergunta antes
> de adotar não é se resolve seu problema — é se você aceita esse compromisso
> permanente.

> **DDD tático** aplicado fora do core domain custa mais do que rende. Adotar dois
> dos oito blocos é frequentemente a decisão correta.

E toda decisão termina condicionada a restrições, não em recomendação.

## Os sete níveis

```text
NÍVEL 01 — Fundamentos              Por que arquitetura existe?
        ↓
NÍVEL 02 — Design de Software       Como estruturar código e domínio?
        ↓
NÍVEL 03 — Design de Sistemas       Como ir de requisitos a um sistema?
        ↓
NÍVEL 04 — Sistemas Distribuídos    Por que sistemas distribuídos são difíceis?
        ↓
NÍVEL 05 — Arquitetura              Como as disciplinas se combinam?
        ↓
NÍVEL 06 — Arquitetura Corporativa  Como arquitetar acima de um sistema?
        ↓
NÍVEL 07 — Liderança em Arquitetura Como decidir e influenciar?
```

A progressão de competência correspondente:

```text
código → design → sistemas → sistemas distribuídos → arquitetura → corporativo → estratégia
```

## Progresso

<!-- PROGRESS:TABLE -->
| Nível | Seção | Estado |
|---|---|:-:|
| 01 | Fundamentos | 🟩 22 tópicos |
| 02 | Design de Software | 🟩 22 tópicos |
| 02 | Design Patterns | 🟩 30 tópicos |
| 02 | Domain-Driven Design | 🟩 19 tópicos |
| 03 | Design de Sistemas | ⬜ |
| 04 | Sistemas Distribuídos | ⬜ |
| 05 | Arquitetura (11 seções) | ⬜ |
| 06 | Arquitetura Corporativa | ⬜ |
| 07 | Liderança em Arquitetura | ⬜ |
| — | Case Studies · Entrevistas | ⬜ |
<!-- /PROGRESS:TABLE -->

O estado documento a documento está em **[ROADMAP.md](ROADMAP.md)**, gerado
automaticamente a partir do front matter.

## Para quem é

Engenheiro de Software com 3+ anos, confortável com backend, banco relacional e
APIs HTTP, que já entregou em produção e agora precisa raciocinar sobre sistemas
maiores que o próprio serviço.

**Não é** material para quem está aprendendo a programar. Assume fluência em código.

## Por onde começar

| Se você… | Comece em |
|---|---|
| Entrega features e quer entender decisões de estrutura | Nível 01 |
| Estrutura código bem, nunca projetou um sistema inteiro | Nível 02 |
| Já projetou sistemas, mas só monolíticos | Nível 03 |
| Trabalha com distribuídos e quer fechar lacunas | Nível 04 |
| Vai fazer entrevistas de system design | Nível 03 → seção 22 |
| É arquiteto e quer atuar acima do sistema | Níveis 06 e 07 |

Detalhes em **[como usar](docs/how-to-use.md)**. Para se localizar por
**capacidade** em vez de conteúdo lido, veja o
**[modelo de maturidade](docs/maturity-model.md)** — seis estágios definidos pela
decisão que você toma sozinho.

## Idiomas

**pt-BR é canônico.** en-US é traduzido progressivamente e nunca bloqueia conteúdo
novo — páginas não traduzidas recaem no português com aviso. O estado por documento
está no [ROADMAP](ROADMAP.md).

## Rodando localmente

```bash
npm install
npm start                     # pt-BR em http://localhost:3000
npm start -- --locale en-US   # en-US
npm run build                 # produção, ambas as locales
```

## Qualidade não é promessa, é verificação

O conteúdo é validado automaticamente a cada PR. Não são lint de formatação — são
regras sobre o material:

```bash
npm test          # 59 testes dos próprios validadores
npm run validate  # os cinco validadores de conteúdo
```

| Validador | O que impede |
|---|---|
| **frontmatter** | Schema, `id` duplicado, ciclo no grafo de pré-requisitos, dois documentos reivindicando o mesmo conceito |
| **links** | Link ou âncora quebrada, diagrama Mermaid inválido |
| **parity** | Tradução à frente do canônico, tradução órfã |
| **terminology** | Alternar entre "acoplamento" e "coupling" no mesmo documento; traduzir o que deve ficar em inglês |
| **placeholders** | `status: complete` sem *Quando Não Usar*, seção vazia, conteúdo raso |

Os validadores têm testes próprios porque um linter com falso positivo trava
contribuição legítima, e um com falso negativo deixa passar o que deveria barrar.
Todo bug encontrado neles entrou como teste de regressão antes da correção.

## Contribuir

Veja **[CONTRIBUTING.md](CONTRIBUTING.md)** para padrão de escrita, schema de front
matter, política terminológica e fluxo de tradução.

A regra que governa tudo: **o material ensina raciocínio arquitetural, não
memorização.** Contribuição que apresenta solução sem o problema, ou padrão sem
discutir quando não usá-lo, é rejeitada.

## Documentos do projeto

| | |
|---|---|
| **[SPEC.md](SPEC.md)** | A especificação completa: padrão de qualidade, política de tradução, critérios de conclusão |
| **[AGENTS.md](AGENTS.md)** | Como construir, testar e validar — os portões de qualidade |
| **[PROMPT.md](PROMPT.md)** | A instrução de uma iteração de trabalho |
| **[fix_plan.md](fix_plan.md)** | Fila priorizada do que falta, gerada do currículo |
| **[ROADMAP.md](ROADMAP.md)** | Estado por documento, gerado do front matter |
| **[CONTRIBUTING.md](CONTRIBUTING.md)** | Como escrever, revisar e traduzir |
| **[Glossário](docs/glossary.md)** | Terminologia com definições operacionais |

## Licença

Conteúdo sob **[CC BY-SA 4.0](LICENSE)** · Código sob **[MIT](LICENSE-CODE)**
