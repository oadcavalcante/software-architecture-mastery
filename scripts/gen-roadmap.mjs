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
 * Desvios deliberados da contagem do currículo (SPEC.md §7.4).
 *
 * A cobertura planejada vem de scripts/curriculum.json — manter uma segunda
 * lista à mão dessincroniza, e foi exatamente o que aconteceu: a seção 07 ficou
 * com 20 aqui e 21 lá, e o panorama passou de 100%.
 */
const PLANNED_OVERRIDES = {
  // 30, não 34: Layered, Hexagonal e Clean Architecture são canônicos em
  // 02-software-design e aqui são referenciados, não duplicados.
  '03-design-patterns': 30,
};

/**
 * Cobertura planejada por seção (SPEC.md §14), sem contar o index.md.
 *
 * Sem isto, o panorama mediria o progresso contra os arquivos que já existem e
 * anunciaria "96% completo" com 28 de ~440 documentos escritos. Progresso se
 * mede contra o escopo, não contra si mesmo.
 */
const PLANNED_TOPICS = Object.fromEntries(
  JSON.parse(readFileSync(join(ROOT, 'scripts/curriculum.json'), 'utf8')).sections.map((s) => [
    s.dir,
    PLANNED_OVERRIDES[s.dir] ?? s.topics.length,
  ]),
);

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
    // Limitado a 10: se a contagem real passar da planejada, o excedente vira
    // barra cheia em vez de derrubar o gerador com repeat(-1).
    const filled = Math.min(10, Math.max(0, Math.round(pct / 10)));
    const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);
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

/** SPEC.md §4.2 — agrupamento de seções por nível, para a tabela do README. */
const README_GROUPS = [
  {level: '01', pt: 'Fundamentos', en: 'Foundation', sections: ['01-fundamentals']},
  {level: '02', pt: 'Design de Software', en: 'Software Design', sections: ['02-software-design']},
  {level: '02', pt: 'Design Patterns', en: 'Design Patterns', sections: ['03-design-patterns']},
  {level: '02', pt: 'Domain-Driven Design', en: 'Domain-Driven Design', sections: ['04-domain-driven-design']},
  {level: '03', pt: 'Design de Sistemas', en: 'System Design', sections: ['05-system-design']},
  {level: '04', pt: 'Sistemas Distribuídos', en: 'Distributed Systems', sections: ['06-distributed-systems']},
  {level: '05', pt: 'Arquitetura (11 seções)', en: 'Architecture (11 sections)', sections: [
    '07-data-architecture', '08-integration-architecture', '09-cloud-architecture',
    '10-security', '11-scalability', '12-reliability', '13-observability',
    '14-devops-and-platform', '17-architecture-documentation',
    '18-architecture-decisions', '20-trade-offs']},
  {level: '06', pt: 'Arquitetura Corporativa', en: 'Enterprise Architecture', sections: [
    '15-enterprise-architecture', '16-legacy-modernization', '19-architecture-governance']},
  {level: '07', pt: 'Liderança em Arquitetura', en: 'Architecture Leadership', sections: ['23-architecture-leadership']},
  {level: '—', pt: 'Case Studies · Entrevistas', en: 'Case Studies · Interviews', sections: [
    '21-case-studies', '22-system-design-interviews']},
];

const README_LABELS = {
  'pt-BR': {
    header: '| Nível | Seção | Estado |',
    sep: '|---|---|:-:|',
    topics: (n) => `🟩 ${n} tópicos`,
    partial: 'em progresso',
    progressBadge: 'progresso',
    docsBadge: 'documentos',
  },
  'en-US': {
    header: '| Level | Section | Status |',
    sep: '|---|---|:-:|',
    topics: (n) => `🟩 ${n} topics`,
    partial: 'in progress',
    progressBadge: 'progress',
    docsBadge: 'documents',
  },
};

/**
 * Texto do aviso de progresso das páginas de introdução.
 *
 * Ele já esteve escrito à mão dizendo "Fase F0 — o conteúdo ainda não foi
 * escrito", e continuou dizendo isso com sete seções prontas. Aviso de
 * progresso mantido à mão é aviso que envelhece em silêncio.
 */
const INTRO_TEXT = {
  'pt-BR': ({pct, writtenTotal, plannedTotal, doneSections, totalSections}) =>
    `Este site está sendo escrito. São **${writtenTotal} de ${plannedTotal} documentos** `
    + `(${pct}%), com **${doneSections} de ${totalSections} seções** completas.`,
  'en-US': ({pct, writtenTotal, plannedTotal, doneSections, totalSections}) =>
    `This site is being written. **${writtenTotal} of ${plannedTotal} documents** `
    + `(${pct}%) are done, across **${doneSections} of ${totalSections} complete sections**.`,
};

/** Caminho da introdução por locale — pt-BR é canônico em `docs/`. */
const INTRO_PATH = {
  'pt-BR': 'docs/intro.md',
  'en-US': 'i18n/en-US/docusaurus-plugin-content-docs/current/intro.md',
};

/**
 * Atualiza o aviso de progresso das duas introduções.
 *
 * Uma seção conta como completa quando todos os tópicos previstos existem —
 * o índice não entra na conta, porque ele é sumário e não tópico.
 */
function updateIntros(done, stats) {
  let doneSections = 0;
  for (const section of Object.keys(PLANNED_TOPICS)) {
    const topics = Math.max(0, (done.get(section) ?? 0) - 1); // desconta o índice
    if (topics >= PLANNED_TOPICS[section]) doneSections += 1;
  }
  const totalSections = Object.keys(PLANNED_TOPICS).length;
  const facts = {...stats, doneSections, totalSections};

  for (const [locale, rel] of Object.entries(INTRO_PATH)) {
    const path = join(ROOT, rel);
    if (!existsSync(path)) continue;
    const content = readFileSync(path, 'utf8');
    const next = replaceBetween(
      content, '<!-- PROGRESS:INTRO -->', '<!-- /PROGRESS:INTRO -->',
      INTRO_TEXT[locale](facts),
    );
    if (next !== content) writeFileSync(path, next);
  }

  return {doneSections, totalSections};
}

/**
 * Atualiza badges e tabela de progresso dos READMEs.
 *
 * Números escritos à mão num README envelhecem em silêncio e passam a mentir.
 * Aqui eles saem da mesma contagem que alimenta o ROADMAP.
 */
function updateReadmes(docs) {
  const done = new Map();
  for (const doc of docs) {
    if (!doc.section || doc.frontmatter.status !== 'complete') continue;
    done.set(doc.section, (done.get(doc.section) ?? 0) + 1);
  }

  let writtenTotal = 0;
  let plannedTotal = 0;
  for (const section of Object.keys(PLANNED_TOPICS)) {
    writtenTotal += done.get(section) ?? 0;
    plannedTotal += plannedFor(section);
  }
  const rootDone = docs.filter((d) => !d.section && d.frontmatter.status === 'complete').length;
  writtenTotal += rootDone;
  plannedTotal += 5; // documentos de raiz previstos
  const pct = Math.round((writtenTotal / plannedTotal) * 100);

  for (const [file, locale] of [['README.md', 'pt-BR'], ['README.en-US.md', 'en-US']]) {
    const path = join(ROOT, file);
    if (!existsSync(path)) continue;
    let content = readFileSync(path, 'utf8');
    const L = README_LABELS[locale];

    const badges = [
      `![${L.progressBadge}](https://img.shields.io/badge/${L.progressBadge}-${pct}%25-blue)`,
      `![${L.docsBadge}](https://img.shields.io/badge/${L.docsBadge}-${writtenTotal}%2F${plannedTotal}-informational)`,
    ].join('\n');

    const rows = README_GROUPS.map((g) => {
      const written = g.sections.reduce((a, s) => a + (done.get(s) ?? 0), 0);
      const planned = g.sections.reduce((a, s) => a + plannedFor(s), 0);
      // O índice de seção conta como documento e não como tópico.
      const topics = Math.max(0, written - g.sections.filter((s) => (done.get(s) ?? 0) > 0).length);
      const plannedTopics = planned - g.sections.length;
      const state =
        topics === 0 ? '⬜'
        : topics >= plannedTopics ? L.topics(topics)
        : `🟨 ${L.partial}`;
      const label = locale === 'en-US' ? g.en : g.pt;
      return `| ${g.level} | ${label} | ${state} |`;
    });

    content = replaceBetween(content, '<!-- BADGES:PROGRESS -->', '<!-- /BADGES:PROGRESS -->', badges);
    content = replaceBetween(
      content, '<!-- PROGRESS:TABLE -->', '<!-- /PROGRESS:TABLE -->',
      [L.header, L.sep, ...rows].join('\n'),
    );
    writeFileSync(path, content);
  }

  return {writtenTotal, plannedTotal, pct, done};
}

function replaceBetween(text, begin, end, body) {
  const i = text.indexOf(begin);
  const j = text.indexOf(end);
  if (i === -1 || j === -1) return text;
  return `${text.slice(0, i + begin.length)}\n${body}\n${text.slice(j)}`;
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

  const readme = updateReadmes(docs);
  const intro = updateIntros(readme.done, readme);

  const done = docs.filter((d) => d.frontmatter.status === 'complete').length;
  console.log(`[roadmap] ok — ${docs.length} documento(s), ${done} completo(s), locales: ${locales.join(', ') || 'nenhuma'}`);
  console.log(`[readme]  ok — ${readme.writtenTotal}/${readme.plannedTotal} (${readme.pct}%) nos badges e na tabela`);
  console.log(`[intro]   ok — ${intro.doneSections}/${intro.totalSections} seção(ões) completa(s) no aviso das introduções`);
}

main();
