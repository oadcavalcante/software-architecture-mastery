# Spec — Arquitetura de Segurança

| | |
|---|---|
| Diretório | `docs/10-security/` |
| Nível | Nível 05 — Arquitetura |
| `doc_type` previsto | `concept · pattern · foundation` |
| Progresso | 0 / 17 (0%) |
| Índice de seção | 🟩 escrito |

## Escopo

Esta seção está completa quando os 17 tópicos abaixo existem com
`status: complete`, mais o `index.md` da seção.

| | Tópico |
|:-:|---|
| ⬜ | `identity` |
| ⬜ | `oauth2` |
| ⬜ | `oidc` |
| ⬜ | `jwt` |
| ⬜ | `secrets` |
| ⬜ | `encryption` |
| ⬜ | `key-management` |
| ⬜ | `network-security` |
| ⬜ | `zero-trust` |
| ⬜ | `threat-modeling` |
| ⬜ | `secure-boundaries` |
| ⬜ | `least-privilege` |
| ⬜ | `auditability` |
| ⬜ | `data-protection` |
| ⬜ | `security-failure-modes` |
| ⬜ | `authz-models` |
| ⬜ | `supply-chain-trust` |

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
