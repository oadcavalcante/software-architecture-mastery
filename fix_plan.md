# Fix Plan

Fila priorizada do que falta. **Gerado** por `npm run plan` a partir de
`scripts/curriculum.json` e do estado real de `docs/`.

Não edite à mão: o plano é derivado, e um plano mantido manualmente diverge do
repositório e passa a listar trabalho já feito.

| | |
|---|---|
| Escrito | 343 de 432 (79%) |
| Seções pendentes | 6 de 23 |
| Próxima tarefa | `18-architecture-decisions` → `what-is-an-adr.md` |

## Como usar

Uma iteração de loop = **uma tarefa desta lista**, de cima para baixo:

1. Leia [`PROMPT.md`](PROMPT.md) — a instrução do loop.
2. Pegue a primeira tarefa não marcada.
3. Leia a spec da seção e o padrão em [`SPEC.md`](SPEC.md) §7.
4. Escreva o documento.
5. Rode os portões de qualidade de [`AGENTS.md`](AGENTS.md).
6. Commit. Rode `npm run plan` — a tarefa sai da lista sozinha.

A ordem respeita o grafo de pré-requisitos: seções de nível mais baixo primeiro,
e dentro de cada seção a ordem pedagógica do currículo.

## Pendências

### 18-architecture-decisions — Decisões de Arquitetura

Nível 05 — Arquitetura · faltam 14 de 15 · spec: [`specs/18-architecture-decisions.md`](specs/18-architecture-decisions.md)

- [ ] `what-is-an-adr.md`
- [ ] `why-adrs-matter.md`
- [ ] `adr-structure.md`
- [ ] `adr-context.md`
- [ ] `adr-decision.md`
- [ ] `adr-alternatives.md`
- [ ] `adr-consequences.md`
- [ ] `adr-status.md`
- [ ] `superseding-decisions.md`
- [ ] `adr-001-modular-monolith.md`
- [ ] `adr-002-async-processing.md`
- [ ] `adr-003-postgresql.md`
- [ ] `adr-004-kafka.md`
- [ ] `adr-005-hexagonal.md`

### 19-architecture-governance — Governança de Arquitetura

Nível 06 — Arquitetura Corporativa · faltam 10 de 11 · spec: [`specs/19-architecture-governance.md`](specs/19-architecture-governance.md)

- [ ] `governance-basics.md`
- [ ] `governance-review.md`
- [ ] `governance-principles.md`
- [ ] `governance-standards.md`
- [ ] `compliance.md`
- [ ] `exceptions.md`
- [ ] `fitness-functions-governance.md`
- [ ] `federated-governance.md`
- [ ] `governance-pathologies.md`
- [ ] `measuring-governance.md`

### 20-trade-offs — Trade-offs

Nível 05 — Arquitetura · faltam 15 de 16 · spec: [`specs/20-trade-offs.md`](specs/20-trade-offs.md)

- [ ] `simplicity-vs-flexibility.md`
- [ ] `consistency-vs-availability.md`
- [ ] `performance-vs-maintainability.md`
- [ ] `cost-vs-reliability.md`
- [ ] `speed-vs-quality.md`
- [ ] `coupling-vs-duplication.md`
- [ ] `centralization-vs-decentralization.md`
- [ ] `monolith-vs-microservices.md`
- [ ] `sync-vs-async.md`
- [ ] `sql-vs-nosql.md`
- [ ] `build-vs-buy.md`
- [ ] `strong-vs-eventual-consistency.md`
- [ ] `managed-vs-self-hosted.md`
- [ ] `cloud-native-vs-portable.md`
- [ ] `abstraction-vs-complexity.md`

### 21-case-studies — Case Studies

Transversal · faltam 14 de 15 · spec: [`specs/21-case-studies.md`](specs/21-case-studies.md)

- [ ] `ecommerce.md`
- [ ] `banking.md`
- [ ] `payments.md`
- [ ] `food-delivery.md`
- [ ] `social-network.md`
- [ ] `video-streaming.md`
- [ ] `messaging-platform.md`
- [ ] `ride-sharing.md`
- [ ] `logistics.md`
- [ ] `healthcare.md`
- [ ] `saas-platform.md`
- [ ] `multi-tenant-enterprise.md`
- [ ] `legacy-modernization-case.md`
- [ ] `high-volume-events.md`

### 22-system-design-interviews — Entrevistas de System Design

Transversal · faltam 13 de 14 · spec: [`specs/22-system-design-interviews.md`](specs/22-system-design-interviews.md)

- [ ] `requirement-clarification.md`
- [ ] `functional-vs-nonfunctional.md`
- [ ] `capacity-estimation.md`
- [ ] `back-of-envelope.md`
- [ ] `interview-api-design.md`
- [ ] `interview-data-modeling.md`
- [ ] `high-level-architecture.md`
- [ ] `bottleneck-identification.md`
- [ ] `interview-scaling.md`
- [ ] `failure-handling.md`
- [ ] `communicating-tradeoffs.md`
- [ ] `interview-structure.md`
- [ ] `interview-common-mistakes.md`

### 23-architecture-leadership — Liderança em Arquitetura

Nível 07 — Liderança em Arquitetura · faltam 23 de 24 · spec: [`specs/23-architecture-leadership.md`](specs/23-architecture-leadership.md)

- [ ] `architecture-leadership-basics.md`
- [ ] `technical-strategy-leadership.md`
- [ ] `architecture-vision.md`
- [ ] `decision-making.md`
- [ ] `stakeholder-management.md`
- [ ] `communication.md`
- [ ] `architecture-presentations.md`
- [ ] `negotiating-tradeoffs.md`
- [ ] `technical-influence.md`
- [ ] `cross-team-architecture.md`
- [ ] `leadership-governance.md`
- [ ] `leadership-principles.md`
- [ ] `leadership-standards.md`
- [ ] `technical-roadmaps.md`
- [ ] `risk-management.md`
- [ ] `cost-management.md`
- [ ] `organizational-architecture.md`
- [ ] `conways-law.md`
- [ ] `team-topologies.md`
- [ ] `architecture-ownership.md`
- [ ] `evolutionary-architecture.md`
- [ ] `fitness-functions.md`
- [ ] `measuring-architecture-outcomes.md`

<sub>Gerado por `npm run plan`.</sub>
