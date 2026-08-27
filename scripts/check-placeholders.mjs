#!/usr/bin/env node
/**
 * Detecta conteúdo incompleto que se apresenta como completo (SPEC.md §13.1, §16).
 *
 * Erros:
 *   - marcador de pendência em documento com status: complete
 *   - documento complete de tipo concept/pattern/tradeoff sem as seções obrigatórias
 *   - seção presente mas vazia
 * Avisos:
 *   - pendência em documento ainda não completo (rastreada, não bloqueia)
 *   - contagem de palavras fora da faixa do doc_type
 */

import {loadAll, Report, headings, wordCount, stripCode, CANONICAL_LOCALE} from './lib/docs.mjs';

/** SPEC.md §7.2 — faixas de densidade por tipo de documento. */
const WORD_RANGE = {
  concept: [1200, 2500],
  pattern: [1000, 2000],
  tradeoff: [1200, 2200],
  'case-study': [3000, 6000],
  exercise: [600, 1500],
  adr: [500, 1200],
  index: [400, 900],
};

/** SPEC.md §7.3 — nunca omitidas em concept, pattern e tradeoff. */
const REQUIRED_SECTIONS = {
  'pt-BR': ['Quando Não Usar', 'Trade-offs'],
  'en-US': ['When Not to Use', 'Trade-offs'],
};
const TYPES_WITH_REQUIRED_SECTIONS = new Set(['concept', 'pattern', 'tradeoff']);

const PENDING = /\b(TODO|FIXME|TBD|XXX|WIP)\b|\b(a escrever|em breve|preencher aqui|lorem ipsum)\b/gi;

function normalize(s) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function sectionBodies(body) {
  const out = new Map();
  const lines = body.split('\n');
  let current = null;
  let buffer = [];
  let inFence = false;

  const flush = () => {
    if (current !== null) out.set(current, buffer.join('\n').trim());
  };

  for (const line of lines) {
    if (/^\s*```/.test(line)) inFence = !inFence;
    const m = !inFence && /^##\s+(.+?)\s*$/.exec(line);
    if (m) {
      flush();
      current = m[1].replace(/\s*\{#[^}]+\}\s*$/, '');
      buffer = [];
    } else if (current !== null) {
      buffer.push(line);
    }
  }
  flush();
  return out;
}

function checkDoc(doc, report) {
  const at = doc.repoPath;
  const fm = doc.frontmatter;
  const complete = fm.status === 'complete';
  const prose = stripCode(doc.body);

  // Pendências.
  const pending = [...prose.matchAll(PENDING)].map((m) => m[0]);
  if (pending.length) {
    const unique = [...new Set(pending.map((p) => p.toUpperCase()))].join(', ');
    if (complete) {
      report.error(at, `status: complete mas contém marcador de pendência: ${unique}`);
    } else {
      report.warn(at, `pendência(s) em documento ${fm.status}: ${unique} — rastreie no ROADMAP`);
    }
  }

  const sections = sectionBodies(doc.body);

  // Seções obrigatórias.
  if (complete && TYPES_WITH_REQUIRED_SECTIONS.has(fm.doc_type)) {
    const required = REQUIRED_SECTIONS[doc.locale] ?? REQUIRED_SECTIONS[CANONICAL_LOCALE];
    const present = new Map([...sections.keys()].map((k) => [normalize(k), k]));
    for (const needed of required) {
      const key = present.get(normalize(needed));
      if (!key) {
        report.error(at, `doc_type "${fm.doc_type}" com status complete exige a seção "${needed}" (SPEC.md §7.3)`);
        continue;
      }
      const content = sections.get(key);
      if (wordCount(content) < 25) {
        report.error(at, `seção "${needed}" tem menos de 25 palavras — SPEC.md §7.3 proíbe preencher template com texto vazio`);
      }
    }
  }

  // Seção declarada e vazia.
  for (const [title, content] of sections) {
    if (!content.trim() && complete) {
      report.error(at, `seção "${title}" está vazia`);
    }
  }

  // Densidade.
  const range = WORD_RANGE[fm.doc_type];
  if (range && complete) {
    const words = wordCount(doc.body);
    const [lo, hi] = range;
    if (words < lo) {
      report.warn(at, `${words} palavras, abaixo da faixa de "${fm.doc_type}" (${lo}–${hi}) — provavelmente raso`);
    } else if (words > hi) {
      report.warn(at, `${words} palavras, acima da faixa de "${fm.doc_type}" (${lo}–${hi}) — inflado ou deveria ser dividido`);
    }
  }

  // Documento com título mas sem corpo.
  if (headings(doc.body).length && wordCount(doc.body) < 40 && complete) {
    report.error(at, 'status: complete mas o documento está essencialmente vazio');
  }
}

const report = new Report('placeholders');
const all = loadAll();
for (const doc of all) checkDoc(doc, report);

const completeCount = all.filter((d) => d.frontmatter.status === 'complete').length;
process.exit(report.finish(`${all.length} documento(s), ${completeCount} com status complete`));
