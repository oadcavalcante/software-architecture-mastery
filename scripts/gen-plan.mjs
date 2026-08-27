#!/usr/bin/env node
/**
 * Gera specs/ e fix_plan.md a partir de scripts/curriculum.json e do estado real
 * dos documentos em docs/.
 *
 * O plano é derivado, não mantido à mão. Um fix_plan escrito manualmente diverge
 * do repositório em semanas e passa a listar trabalho já feito — que é pior que
 * não ter plano, porque parece confiável.
 */

import {readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadCanonical, ROOT} from './lib/docs.mjs';

const CURRICULUM = JSON.parse(
  readFileSync(fileURLToPath(new URL('./curriculum.json', import.meta.url)), 'utf8'),
);
const SPECS_DIR = join(ROOT, 'specs');
const FIX_PLAN = join(ROOT, 'fix_plan.md');

const LEVEL_NAME = {
  0: 'Transversal', 1: 'Nível 01 — Fundamentos', 2: 'Nível 02 — Design de Software',
  3: 'Nível 03 — Design de Sistemas', 4: 'Nível 04 — Sistemas Distribuídos',
  5: 'Nível 05 — Arquitetura', 6: 'Nível 06 — Arquitetura Corporativa',
  7: 'Nível 07 — Liderança em Arquitetura',
};

/** Estado atual: que documentos existem e com que status. */
function currentState() {
  const byId = new Map();
  for (const doc of loadCanonical()) {
    const id = doc.frontmatter.id;
    if (id) byId.set(id, doc.frontmatter.status ?? 'unknown');
  }
  return byId;
}

function sectionProgress(section, state) {
  const indexId = section.dir.replace(/^\d+-/, '');
  const done = section.topics.filter((t) => state.get(t) === 'complete');
  const partial = section.topics.filter((t) => state.get(t) && state.get(t) !== 'complete');
  const missing = section.topics.filter((t) => !state.has(t));
  return {
    indexId,
    indexDone: state.get(indexId) === 'complete',
    done, partial, missing,
    total: section.topics.length,
  };
}

/** Uma spec por seção: escopo, estado e critério de conclusão. */
function writeSpecs(state) {
  if (existsSync(SPECS_DIR)) {
    for (const f of readdirSync(SPECS_DIR)) rmSync(join(SPECS_DIR, f));
  }
  mkdirSync(SPECS_DIR, {recursive: true});

  for (const section of CURRICULUM.sections) {
    const p = sectionProgress(section, state);
    const pct = Math.round((p.done.length / p.total) * 100);
    // Pipe dentro de célula de tabela markdown precisa ser escapado, mesmo
    // dentro de crase — senão o parser corta a linha.
    const type = section.type ?? 'concept · pattern · foundation';

    const rows = section.topics.map((t) => {
      const st = state.get(t);
      const mark = st === 'complete' ? '🟩' : st ? '🟨' : '⬜';
      return `| ${mark} | \`${t}\` |`;
    });

    const body = `# Spec — ${section.title}

| | |
|---|---|
| Diretório | \`docs/${section.dir}/\` |
| Nível | ${LEVEL_NAME[section.level]} |
| \`doc_type\` previsto | \`${type}\` |
| Progresso | ${p.done.length} / ${p.total} (${pct}%) |
| Índice de seção | ${p.indexDone ? '🟩 escrito' : '⬜ pendente'} |

## Escopo

Esta seção está completa quando os ${p.total} tópicos abaixo existem com
\`status: complete\`, mais o \`index.md\` da seção.

| | Tópico |
|:-:|---|
${rows.join('\n')}

## Critério de conclusão

Além dos documentos existirem:

- \`npm run validate\` sem erro **e sem aviso** para esta seção.
- Cada \`concept\`, \`pattern\` e \`tradeoff\` com **Quando Não Usar** e
  **Trade-offs** substantivas — condições concretas, não hedge.
- Cada \`foundation\` com **Por Que Isso Importa** e **Erros Comuns**.
- Nenhum conceito duplicado: se já é canônico em outra seção, referencie
  (\`canonical_for\` validado pelo CI).
- \`prerequisites\` apontando para ids existentes, sem ciclo.
- Exemplo real com restrições e números plausíveis em cada documento.

## Referências

- Padrão de conteúdo e templates: [SPEC.md](../SPEC.md) §7
- Como escrever e validar: [AGENTS.md](../AGENTS.md)
- Cobertura prevista: [SPEC.md](../SPEC.md) Apêndice A

<sub>Gerado por \`npm run plan\`. Não edite à mão — altere \`scripts/curriculum.json\`.</sub>
`;
    writeFileSync(join(SPECS_DIR, `${section.dir}.md`), body);
  }
}

/** fix_plan.md: fila priorizada do que falta, na ordem dos níveis. */
function writeFixPlan(state) {
  const pending = [];
  let doneTotal = 0;
  let allTotal = 0;

  for (const section of CURRICULUM.sections) {
    const p = sectionProgress(section, state);
    doneTotal += p.done.length + (p.indexDone ? 1 : 0);
    allTotal += p.total + 1;
    if (p.missing.length || p.partial.length || !p.indexDone) {
      pending.push({section, p});
    }
  }

  const pct = Math.round((doneTotal / allTotal) * 100);
  const next = pending[0];

  const blocks = pending.map(({section, p}) => {
    const items = [];
    if (!p.indexDone) items.push(`- [ ] \`index.md\` — índice da seção`);
    for (const t of p.partial) items.push(`- [ ] \`${t}.md\` — **em progresso**, concluir`);
    for (const t of p.missing) items.push(`- [ ] \`${t}.md\``);
    return `### ${section.dir} — ${section.title}

${LEVEL_NAME[section.level]} · faltam ${items.length} de ${p.total + 1} · spec: [\`specs/${section.dir}.md\`](specs/${section.dir}.md)

${items.join('\n')}`;
  });

  const body = `# Fix Plan

Fila priorizada do que falta. **Gerado** por \`npm run plan\` a partir de
\`scripts/curriculum.json\` e do estado real de \`docs/\`.

Não edite à mão: o plano é derivado, e um plano mantido manualmente diverge do
repositório e passa a listar trabalho já feito.

| | |
|---|---|
| Escrito | ${doneTotal} de ${allTotal} (${pct}%) |
| Seções pendentes | ${pending.length} de ${CURRICULUM.sections.length} |
| Próxima tarefa | ${next ? `\`${next.section.dir}\` → \`${(!next.p.indexDone ? 'index' : next.p.partial[0] ?? next.p.missing[0])}.md\`` : '— nada pendente'} |

## Como usar

Uma iteração de loop = **uma tarefa desta lista**, de cima para baixo:

1. Leia [\`PROMPT.md\`](PROMPT.md) — a instrução do loop.
2. Pegue a primeira tarefa não marcada.
3. Leia a spec da seção e o padrão em [\`SPEC.md\`](SPEC.md) §7.
4. Escreva o documento.
5. Rode os portões de qualidade de [\`AGENTS.md\`](AGENTS.md).
6. Commit. Rode \`npm run plan\` — a tarefa sai da lista sozinha.

A ordem respeita o grafo de pré-requisitos: seções de nível mais baixo primeiro,
e dentro de cada seção a ordem pedagógica do currículo.

## Pendências

${blocks.join('\n\n')}

<sub>Gerado por \`npm run plan\`.</sub>
`;
  writeFileSync(FIX_PLAN, body);
  return {doneTotal, allTotal, pct, pending: pending.length, next};
}

const state = currentState();
writeSpecs(state);
const r = writeFixPlan(state);
console.log(`[plan] ok — ${CURRICULUM.sections.length} specs geradas`);
console.log(`[plan] fix_plan: ${r.doneTotal}/${r.allTotal} (${r.pct}%), ${r.pending} seção(ões) pendente(s)`);
if (r.next) {
  const t = !r.next.p.indexDone ? 'index' : (r.next.p.partial[0] ?? r.next.p.missing[0]);
  console.log(`[plan] próxima tarefa: ${r.next.section.dir}/${t}.md`);
}
