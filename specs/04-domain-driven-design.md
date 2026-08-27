# Spec — Domain-Driven Design

| | |
|---|---|
| Diretório | `docs/04-domain-driven-design/` |
| Nível | Nível 02 — Design de Software |
| `doc_type` previsto | `concept · pattern · foundation` |
| Progresso | 19 / 19 (100%) |
| Índice de seção | 🟩 escrito |

## Escopo

Esta seção está completa quando os 19 tópicos abaixo existem com
`status: complete`, mais o `index.md` da seção.

| | Tópico |
|:-:|---|
| 🟩 | `domain` |
| 🟩 | `subdomain` |
| 🟩 | `core-domain` |
| 🟩 | `supporting-domain` |
| 🟩 | `generic-domain` |
| 🟩 | `bounded-context` |
| 🟩 | `ubiquitous-language` |
| 🟩 | `context-mapping` |
| 🟩 | `anti-corruption-layer` |
| 🟩 | `strategic-ddd` |
| 🟩 | `entity` |
| 🟩 | `value-object` |
| 🟩 | `aggregate` |
| 🟩 | `domain-service` |
| 🟩 | `application-service` |
| 🟩 | `domain-event` |
| 🟩 | `repository` |
| 🟩 | `factory` |
| 🟩 | `tactical-ddd` |

## Critério de conclusão

Além dos documentos existirem:

- `npm run validate` sem erro **e sem aviso** para esta seção.
- Cada `concept`, `pattern` e `tradeoff` com **Quando Não Usar** e
  **Trade-offs** substantivas — condições concretas, não hedge.
- Cada `foundation` com **Por Que Isso Importa** e **Erros Comuns**.
- Nenhum conceito duplicado: se já é canônico em outra seção, referencie
  (`canonical_for` validado pelo CI).
- `prerequisites` apontando para ids existentes, sem ciclo.
- Exemplo real com restrições e números plausíveis em cada documento.

## Referências

- Padrão de conteúdo e templates: [SPEC.md](../SPEC.md) §7
- Como escrever e validar: [AGENTS.md](../AGENTS.md)
- Cobertura prevista: [SPEC.md](../SPEC.md) Apêndice A

<sub>Gerado por `npm run plan`. Não edite à mão — altere `scripts/curriculum.json`.</sub>
