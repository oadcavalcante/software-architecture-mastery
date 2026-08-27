#!/usr/bin/env node
/**
 * Regenera as tabelas do ROADMAP.md a partir do front matter dos documentos.
 *
 * O roadmap nunca é mantido à mão (SPEC.md §5.4). Este script substitui apenas
 * o trecho entre os marcadores; o texto ao redor é preservado.
 */

import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import {join} from 'node:path';
import {loadCanonical, translationLocales, ROOT} from './lib/docs.mjs';
import {buildParity, MARKERS} from './check-parity.mjs';

const ROADMAP = join(ROOT, 'ROADMAP.md');
const BEGIN = '<!-- BEGIN:GENERATED — não edite à mão; rode `npm run roadmap` -->';
const END = '<!-- END:GENERATED -->';

const STATUS_MARK = {
  'not-started': '⬜',
  'in-progress': '🟨',
  complete: '🟩',
};

/** SPEC.md §4.2 — mapeamento seção → nível. */
const SECTION_LEVEL = {
  '01-fundamentals': 1,
  '02-software-design': 2, '03-design-patterns': 2, '04-domain-driven-design': 2,
  '05-system-design': 3,
  '06-distributed-systems': 4,
  '07-data-architecture': 5, '08-integration-architecture': 5, '09-cloud-architecture': 5,
  '10-security': 5, '11-scalability': 5, '12-reliability': 5, '13-observability': 5,
  '14-devops-and-platform': 5, '17-architecture-documentation': 5,
  '18-architecture-decisions': 5, '20-trade-offs': 5,
  '15-enterprise-architecture': 6, '16-legacy-modernization': 6, '19-architecture-governance': 6,
  '23-architecture-leadership': 7,
  '21-case-studies': 0, '22-system-design-interviews': 0,
};

/**
 * Cobertura planejada por seção (SPEC.md §14), sem contar o index.md.
 *
 * Sem isto, o panorama mediria o progresso contra os arquivos que já existem e
 * anunciaria "96% completo" com 28 de ~440 documentos escritos. Progresso se
 * mede contra o escopo, não contra si mesmo.
 */
const PLANNED_TOPICS = {
  '01-fundamentals': 22, '02-software-design': 22,
  // 30, não 34: Layered, Hexagonal e Clean Architecture são canônicos em
  // 02-software-design e aqui são referenciados, não duplicados (SPEC §7.4).
  '03-design-patterns': 30,
  '04-domain-driven-design': 19, '05-system-design': 23, '06-distributed-systems': 35,
  '07-data-architecture': 20, '08-integration-architecture': 14, '09-cloud-architecture': 18,
  '10-security': 17, '11-scalability': 13, '12-reliability': 17, '13-observability': 11,
  '14-devops-and-platform': 13, '15-enterprise-architecture': 20, '16-legacy-modernization': 12,
  '17-architecture-documentation': 13, '18-architecture-decisions': 14,
  '19-architecture-governance': 10, '20-trade-offs': 15, '21-case-studies': 14,
  '22-system-design-interviews': 13, '23-architecture-leadership': 23,
};

/** Cada seção planeja seus tópicos mais o próprio índice. */
const plannedFor = (section) =>
  PLANNED_TOPICS[section] === undefined ? null : PLANNED_TOPICS[section] + 1;

const LEVEL_NAME = {
  0: 'Transversal',
  1: 'Nível 01 — Fundamentos',
  2: 'Nível 02 — Design de Software',
  3: 'Nível 03 — Design de Sistemas',
  4: 'Nível 04 — Sistemas Distribuídos',
  5: 'Nível 05 — Arquitetura',
  6: 'Nível 06 — Arquitetura Corporativa',
  7: 'Nível 07 — Liderança em Arquitetura',
};

function esc(s) {
  return String(s ?? '').replace(/\|/g, '\\|');
}

function overview(docs) {
  const bySection = new Map();
  for (const doc of docs) {
    const key = doc.section ?? '(raiz)';
    if (!bySection.has(key)) bySection.set(key, []);
    bySection.get(key).push(doc);
  }

  const rows = [];
  let doneTotal = 0;
  let plannedTotal = 0;

  for (const section of [...new Set([...Object.keys(PLANNED_TOPICS), ...bySection.keys()])].sort()) {
    const list = bySection.get(section) ?? [];
    const done = list.filter((d) => d.frontmatter.status === 'complete').length;
    const planned = plannedFor(section) ?? list.length;
    doneTotal += done;
    plannedTotal += planned;

    const level = SECTION_LEVEL[section];
    const levelLabel =
      level === undefined ? '—' : level === 0 ? 'Transv.' : String(level).padStart(2, '0');
    const pct = planned ? Math.round((done / planned) * 100) : 0;
    const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10));
    rows.push(`| \`${section}\` | ${levelLabel} | ${done} / ${planned} | \`${bar}\` ${pct}% |`);
  }

  const pct = plannedTotal ? Math.round((doneTotal / plannedTotal) * 100) : 0;

  return [
    '## Panorama',
    '',
    `**${doneTotal} de ${plannedTotal} documentos planejados escritos (${pct}%).**`,
    '',
    'O denominador é o escopo definido em [SPEC.md §14](SPEC.md), não a contagem',
    'de arquivos existentes. Uma seção em 0% ainda não teve seus tópicos escritos,',
    'mas já tem índice publicado explicando o que virá.',
    '',
    '| Seção | Nível | Escritos | Progresso |',
    '|---|---|---:|---|',
    ...rows,
    '',
  ].join('\n');
}

function detailTables(docs, locales, parityRows) {
  const parityByPath = new Map(parityRows.map((r) => [r.docPath, r]));
  const byLevel = new Map();

  for (const doc of docs) {
    const level = SECTION_LEVEL[doc.section] ?? doc.frontmatter.level ?? 0;
    if (!byLevel.has(level)) byLevel.set(level, []);
    byLevel.get(level).push(doc);
  }

  const out = ['## Detalhe por nível', ''];
  const order = [1, 2, 3, 4, 5, 6, 7, 0];

  for (const level of order) {
    const list = byLevel.get(level);
    if (!list?.length) continue;

    out.push(`### ${LEVEL_NAME[level]}`, '');
    const localeCols = locales.map((l) => ` ${l} |`).join('');
    const localeSep = locales.map(() => ':-:|').join('');
    out.push(
      `| Estado | Documento | Tipo | Dificuldade | Pré-requisitos |${localeCols}`,
      `|:-:|---|---|---|---|${localeSep}`,
    );

    for (const doc of list.sort((a, b) => a.docPath.localeCompare(b.docPath))) {
      const fm = doc.frontmatter;
      const mark = STATUS_MARK[fm.status] ?? '?';
      const link = `[${esc(fm.title)}](docs/${doc.docPath})`;
      const prereq = (fm.prerequisites ?? []).length
        ? (fm.prerequisites).map((p) => `\`${p}\``).join(', ')
        : '—';
      const parity = parityByPath.get(doc.docPath);
      const localeCells = locales
        .map((l) => ` ${MARKERS[parity?.states[l]?.state] ?? '⬜'} |`)
        .join('');
      out.push(`| ${mark} | ${link} | ${esc(fm.doc_type)} | ${esc(fm.difficulty)} | ${prereq} |${localeCells}`);
    }
    out.push('');
  }

  return out.join('\n');
}

function legend(locales) {
  return [
    '## Legenda',
    '',
    '**Estado do conteúdo:** ⬜ não iniciado · 🟨 em progresso · 🟩 completo',
    '',
    locales.length
      ? `**Tradução (${locales.join(', ')}):** ⬜ não traduzido · 🟨 defasado · 🟩 em dia · ❌ inconsistente`
      : '_Nenhuma locale de tradução presente._',
    '',
  ].join('\n');
}

function skeleton(body) {
  return `# Roadmap

Estado de cada documento do percurso e da sua tradução.
A especificação completa está em [SPEC.md](SPEC.md).

As tabelas abaixo são **geradas** a partir do front matter dos documentos.
Não edite à mão — rode \`npm run roadmap\`.

${BEGIN}
${body}
${END}

## Fases

Ver [SPEC.md §15](SPEC.md#15-plano-de-execução) para o plano completo.
`;
}

function main() {
  const docs = loadCanonical();
  const locales = translationLocales();
  const {rows} = buildParity();

  const body = [
    overview(docs),
    legend(locales),
    detailTables(docs, locales, rows),
  ].join('\n');

  let output;
  if (existsSync(ROADMAP)) {
    const current = readFileSync(ROADMAP, 'utf8');
    if (current.includes(BEGIN) && current.includes(END)) {
      const head = current.slice(0, current.indexOf(BEGIN) + BEGIN.length);
      const tail = current.slice(current.indexOf(END));
      output = `${head}\n${body}\n${tail}`;
    } else {
      console.error('ROADMAP.md existe mas não tem os marcadores BEGIN/END:GENERATED.');
      console.error('Adicione os marcadores ou apague o arquivo para regenerar do zero.');
      process.exit(1);
    }
  } else {
    output = skeleton(body);
  }

  writeFileSync(ROADMAP, output);
  const done = docs.filter((d) => d.frontmatter.status === 'complete').length;
  console.log(`[roadmap] ok — ${docs.length} documento(s), ${done} completo(s), locales: ${locales.join(', ') || 'nenhuma'}`);
}

main();
