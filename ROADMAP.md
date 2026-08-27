# Roadmap

Estado de cada documento do percurso e da sua tradução.
A especificação completa está em [SPEC.md](SPEC.md).

As tabelas abaixo são **geradas** a partir do front matter dos documentos.
Não edite à mão — rode `npm run roadmap`.

<!-- BEGIN:GENERATED — não edite à mão; rode `npm run roadmap` -->
## Panorama

**49 de 440 documentos planejados escritos (11%).**

O denominador é o escopo definido em [SPEC.md §14](SPEC.md), não a contagem
de arquivos existentes. Uma seção em 0% ainda não teve seus tópicos escritos,
mas já tem índice publicado explicando o que virá.

| Seção | Nível | Escritos | Progresso |
|---|---|---:|---|
| `(raiz)` | — | 4 / 5 | `████████░░` 80% |
| `01-fundamentals` | 01 | 23 / 23 | `██████████` 100% |
| `02-software-design` | 02 | 1 / 23 | `░░░░░░░░░░` 4% |
| `03-design-patterns` | 02 | 1 / 35 | `░░░░░░░░░░` 3% |
| `04-domain-driven-design` | 02 | 1 / 20 | `█░░░░░░░░░` 5% |
| `05-system-design` | 03 | 1 / 24 | `░░░░░░░░░░` 4% |
| `06-distributed-systems` | 04 | 1 / 36 | `░░░░░░░░░░` 3% |
| `07-data-architecture` | 05 | 1 / 21 | `█░░░░░░░░░` 5% |
| `08-integration-architecture` | 05 | 1 / 15 | `█░░░░░░░░░` 7% |
| `09-cloud-architecture` | 05 | 1 / 19 | `█░░░░░░░░░` 5% |
| `10-security` | 05 | 1 / 18 | `█░░░░░░░░░` 6% |
| `11-scalability` | 05 | 1 / 14 | `█░░░░░░░░░` 7% |
| `12-reliability` | 05 | 1 / 18 | `█░░░░░░░░░` 6% |
| `13-observability` | 05 | 1 / 12 | `█░░░░░░░░░` 8% |
| `14-devops-and-platform` | 05 | 1 / 14 | `█░░░░░░░░░` 7% |
| `15-enterprise-architecture` | 06 | 1 / 21 | `█░░░░░░░░░` 5% |
| `16-legacy-modernization` | 06 | 1 / 13 | `█░░░░░░░░░` 8% |
| `17-architecture-documentation` | 05 | 1 / 14 | `█░░░░░░░░░` 7% |
| `18-architecture-decisions` | 05 | 1 / 15 | `█░░░░░░░░░` 7% |
| `19-architecture-governance` | 06 | 1 / 11 | `█░░░░░░░░░` 9% |
| `20-trade-offs` | 05 | 1 / 16 | `█░░░░░░░░░` 6% |
| `21-case-studies` | Transv. | 1 / 15 | `█░░░░░░░░░` 7% |
| `22-system-design-interviews` | Transv. | 1 / 14 | `█░░░░░░░░░` 7% |
| `23-architecture-leadership` | 07 | 1 / 24 | `░░░░░░░░░░` 4% |

## Legenda

**Estado do conteúdo:** ⬜ não iniciado · 🟨 em progresso · 🟩 completo

**Tradução (en-US):** ⬜ não traduzido · 🟨 defasado · 🟩 em dia · ❌ inconsistente

## Detalhe por nível

### Nível 01 — Fundamentos

| Estado | Documento | Tipo | Dificuldade | Pré-requisitos | en-US |
|:-:|---|---|---|---|:-:|
| 🟩 | [Abstração](docs/01-fundamentals/abstraction.md) | concept | iniciante | `separation-of-concerns` | ⬜ |
| 🟩 | [Arquitetura como Conjunto de Decisões](docs/01-fundamentals/architecture-as-decisions.md) | foundation | intermediário | `architecture-principles` | ⬜ |
| 🟩 | [Características Arquiteturais](docs/01-fundamentals/architecture-characteristics.md) | foundation | intermediário | `quality-attributes` | ⬜ |
| 🟩 | [Evolução da Arquitetura](docs/01-fundamentals/architecture-evolution.md) | foundation | intermediário | `architecture-as-decisions` | ⬜ |
| 🟩 | [Princípios de Arquitetura](docs/01-fundamentals/architecture-principles.md) | concept | intermediário | `architecture-characteristics` | ⬜ |
| 🟩 | [Arquitetura vs. Design](docs/01-fundamentals/architecture-vs-design.md) | foundation | iniciante | `what-is-software-architecture` | ⬜ |
| 🟩 | [Arquitetura vs. Implementação](docs/01-fundamentals/architecture-vs-implementation.md) | foundation | iniciante | `architecture-vs-design` | ⬜ |
| 🟩 | [Contexto de Negócio](docs/01-fundamentals/business-context.md) | foundation | iniciante | `what-is-software-architecture` | ⬜ |
| 🟩 | [Coesão](docs/01-fundamentals/cohesion.md) | concept | iniciante | `coupling` | ⬜ |
| 🟩 | [Complexidade](docs/01-fundamentals/complexity.md) | concept | intermediário | `abstraction` | ⬜ |
| 🟩 | [Restrições](docs/01-fundamentals/constraints.md) | foundation | iniciante | `quality-attributes` | ⬜ |
| 🟩 | [Acoplamento](docs/01-fundamentals/coupling.md) | concept | iniciante | `modularity` | ⬜ |
| 🟩 | [Gestão de Dependências](docs/01-fundamentals/dependency-management.md) | concept | intermediário | `coupling` | ⬜ |
| 🟩 | [Requisitos Funcionais](docs/01-fundamentals/functional-requirements.md) | foundation | iniciante | `problem-space` | ⬜ |
| 🟩 | [Fundamentos](docs/01-fundamentals/index.md) | index | iniciante | — | ⬜ |
| 🟩 | [Modularidade](docs/01-fundamentals/modularity.md) | concept | iniciante | `architecture-vs-design` | ⬜ |
| 🟩 | [Requisitos Não-Funcionais](docs/01-fundamentals/non-functional-requirements.md) | foundation | iniciante | `functional-requirements` | ⬜ |
| 🟩 | [Espaço do Problema](docs/01-fundamentals/problem-space.md) | foundation | iniciante | `business-context` | ⬜ |
| 🟩 | [Atributos de Qualidade](docs/01-fundamentals/quality-attributes.md) | foundation | iniciante | `non-functional-requirements` | ⬜ |
| 🟩 | [Separação de Responsabilidades](docs/01-fundamentals/separation-of-concerns.md) | concept | iniciante | `modularity` | ⬜ |
| 🟩 | [Espaço da Solução](docs/01-fundamentals/solution-space.md) | foundation | iniciante | `problem-space` | ⬜ |
| 🟩 | [Dívida Técnica](docs/01-fundamentals/technical-debt.md) | concept | intermediário | `complexity` | ⬜ |
| 🟩 | [O que é Arquitetura de Software](docs/01-fundamentals/what-is-software-architecture.md) | foundation | iniciante | — | ⬜ |

### Nível 02 — Design de Software

| Estado | Documento | Tipo | Dificuldade | Pré-requisitos | en-US |
|:-:|---|---|---|---|:-:|
| 🟩 | [Design de Software](docs/02-software-design/index.md) | index | iniciante | `fundamentals` | ⬜ |
| 🟩 | [Design Patterns](docs/03-design-patterns/index.md) | index | intermediário | `software-design` | ⬜ |
| 🟩 | [Domain-Driven Design](docs/04-domain-driven-design/index.md) | index | intermediário | `software-design` | ⬜ |

### Nível 03 — Design de Sistemas

| Estado | Documento | Tipo | Dificuldade | Pré-requisitos | en-US |
|:-:|---|---|---|---|:-:|
| 🟩 | [Design de Sistemas](docs/05-system-design/index.md) | index | intermediário | `design-patterns`, `domain-driven-design` | ⬜ |

### Nível 04 — Sistemas Distribuídos

| Estado | Documento | Tipo | Dificuldade | Pré-requisitos | en-US |
|:-:|---|---|---|---|:-:|
| 🟩 | [Sistemas Distribuídos](docs/06-distributed-systems/index.md) | index | avançado | `system-design` | ⬜ |

### Nível 05 — Arquitetura

| Estado | Documento | Tipo | Dificuldade | Pré-requisitos | en-US |
|:-:|---|---|---|---|:-:|
| 🟩 | [Arquitetura de Dados](docs/07-data-architecture/index.md) | index | avançado | `distributed-systems` | ⬜ |
| 🟩 | [Arquitetura de Integração](docs/08-integration-architecture/index.md) | index | avançado | `distributed-systems` | ⬜ |
| 🟩 | [Arquitetura em Nuvem](docs/09-cloud-architecture/index.md) | index | avançado | `distributed-systems` | ⬜ |
| 🟩 | [Arquitetura de Segurança](docs/10-security/index.md) | index | avançado | `system-design` | ⬜ |
| 🟩 | [Escalabilidade](docs/11-scalability/index.md) | index | avançado | `system-design`, `distributed-systems` | ⬜ |
| 🟩 | [Confiabilidade](docs/12-reliability/index.md) | index | avançado | `distributed-systems` | ⬜ |
| 🟩 | [Observabilidade](docs/13-observability/index.md) | index | intermediário | `distributed-systems` | ⬜ |
| 🟩 | [DevOps e Plataforma](docs/14-devops-and-platform/index.md) | index | intermediário | `system-design` | ⬜ |
| 🟩 | [Documentação de Arquitetura](docs/17-architecture-documentation/index.md) | index | intermediário | `system-design` | ⬜ |
| 🟩 | [Decisões de Arquitetura](docs/18-architecture-decisions/index.md) | index | intermediário | `architecture-documentation` | ⬜ |
| 🟩 | [Trade-offs](docs/20-trade-offs/index.md) | index | avançado | `distributed-systems` | ⬜ |

### Nível 06 — Arquitetura Corporativa

| Estado | Documento | Tipo | Dificuldade | Pré-requisitos | en-US |
|:-:|---|---|---|---|:-:|
| 🟩 | [Arquitetura Corporativa](docs/15-enterprise-architecture/index.md) | index | avançado | `integration-architecture`, `data-architecture` | ⬜ |
| 🟩 | [Modernização de Legado](docs/16-legacy-modernization/index.md) | index | avançado | `enterprise-architecture` | ⬜ |
| 🟩 | [Governança de Arquitetura](docs/19-architecture-governance/index.md) | index | avançado | `enterprise-architecture` | ⬜ |

### Nível 07 — Liderança em Arquitetura

| Estado | Documento | Tipo | Dificuldade | Pré-requisitos | en-US |
|:-:|---|---|---|---|:-:|
| 🟩 | [Liderança em Arquitetura](docs/23-architecture-leadership/index.md) | index | avançado | `architecture-governance`, `enterprise-architecture` | ⬜ |

### Transversal

| Estado | Documento | Tipo | Dificuldade | Pré-requisitos | en-US |
|:-:|---|---|---|---|:-:|
| 🟩 | [Case Studies](docs/21-case-studies/index.md) | index | avançado | `system-design`, `distributed-systems` | ⬜ |
| 🟩 | [Entrevistas de System Design](docs/22-system-design-interviews/index.md) | index | intermediário | `system-design` | ⬜ |
| 🟩 | [Glossário](docs/glossary.md) | reference | iniciante | — | ⬜ |
| 🟩 | [Como Usar](docs/how-to-use.md) | index | iniciante | — | ⬜ |
| 🟩 | [Política Terminológica](docs/i18n-terminology.md) | reference | iniciante | — | ⬜ |
| 🟨 | [Comece aqui](docs/intro.md) | index | iniciante | — | 🟩 |
| 🟩 | [Modelo de Maturidade](docs/maturity-model.md) | reference | iniciante | — | ⬜ |

<!-- END:GENERATED -->

## Fases

Cada fase entrega um site publicável e útil por si só. Ver
[SPEC.md §15](SPEC.md) para o plano completo.

| Fase | Entrega | Estado |
|---|---|:-:|
| **F0** | Scaffold Docusaurus, i18n, Mermaid, busca, CI, validadores, deploy | 🟩 |
| **F1** | README, ROADMAP, CONTRIBUTING, glossário, modelo de maturidade, política terminológica, 23 índices de seção, sidebar por nível | 🟩 |
| **F2** | Níveis 01–02: fundamentos, design de software, padrões, DDD | 🟨 Nível 01 completo (22 tópicos); faltam seções 02, 03, 04 |
| **F3** | Níveis 03–04: design de sistemas, sistemas distribuídos | ⬜ |
| **F4** | Nível 05: as onze disciplinas de arquitetura + ADRs didáticos | ⬜ |
| **F5** | Níveis 06–07: corporativo, legado, governança, liderança | ⬜ |
| **F6** | Case studies, entrevistas, exercícios de revisão de arquitetura | ⬜ |
| **F7** | Tradução en-US na ordem de prioridade da spec | ⬜ |
| **F8** | Revisão cruzada: contradições, duplicações, densidade, verificação factual | ⬜ |

Dentro de cada fase, a ordem segue o grafo de pré-requisitos: um tópico não é
escrito antes dos seus pré-requisitos, porque escrever fora de ordem produz
redefinição e duplicação.

## Ferramentas

```bash
npm test          # 59 testes dos validadores
npm run validate  # os cinco validadores de conteúdo
npm run roadmap   # regenera as tabelas acima
npm run build     # build nas duas locales
```
