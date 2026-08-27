#!/usr/bin/env node
/**
 * Valida o front matter de todos os documentos contra o schema da SPEC.md §7.9.
 *
 * Erros: schema inválido, id duplicado, referência a id inexistente,
 *        ciclo no grafo de pré-requisitos, canonical_for reivindicado duas vezes.
 */

import {loadCanonical, loadAll, Report, CANONICAL_LOCALE} from './lib/docs.mjs';

const DOC_TYPES = new Set([
  'concept', 'pattern', 'tradeoff', 'case-study', 'exercise', 'adr', 'index',
  'reference',
]);
const DIFFICULTIES = new Set([
  'iniciante', 'intermediário', 'avançado',
  'beginner', 'intermediate', 'advanced',
]);
const STATUSES = new Set(['not-started', 'in-progress', 'complete']);

const REQUIRED = [
  'id', 'title', 'description', 'doc_type', 'level',
  'difficulty', 'status', 'objective',
];

function isIntInRange(v, lo, hi) {
  return Number.isInteger(v) && v >= lo && v <= hi;
}

function validateOne(doc, report) {
  const fm = doc.frontmatter;
  const at = doc.repoPath;

  for (const key of REQUIRED) {
    if (fm[key] === undefined || fm[key] === null || fm[key] === '') {
      report.error(at, `campo obrigatório ausente: ${key}`);
    }
  }

  if (fm.doc_type && !DOC_TYPES.has(fm.doc_type)) {
    report.error(at, `doc_type inválido: ${fm.doc_type} (esperado um de ${[...DOC_TYPES].join(', ')})`);
  }
  if (fm.difficulty && !DIFFICULTIES.has(fm.difficulty)) {
    report.error(at, `difficulty inválido: ${fm.difficulty}`);
  }
  if (fm.status && !STATUSES.has(fm.status)) {
    report.error(at, `status inválido: ${fm.status} (esperado um de ${[...STATUSES].join(', ')})`);
  }
  if (fm.level !== undefined && !isIntInRange(fm.level, 0, 7)) {
    report.error(at, `level deve ser inteiro de 0 a 7, recebido: ${fm.level}`);
  }

  for (const key of ['prerequisites', 'related', 'canonical_for']) {
    if (fm[key] !== undefined && !Array.isArray(fm[key])) {
      report.error(at, `${key} deve ser lista, recebido: ${typeof fm[key]}`);
    }
  }

  // O nome do arquivo é a fonte do id: divergência quebra os links entre locales.
  // Índices de seção são exceção — 23 arquivos chamados index.md colidiriam.
  // Para eles o id é o slug do diretório sem o prefixo numérico de ordenação:
  // docs/01-fundamentals/index.md → "fundamentals".
  const segments = doc.docPath.replace(/\.mdx?$/, '').split('/');
  const basename = segments.pop();
  const expectedId =
    basename === 'index' && segments.length
      ? segments[segments.length - 1].replace(/^\d+-/, '')
      : basename;
  if (fm.id && fm.id !== expectedId) {
    const why = basename === 'index' ? ' (índice de seção: use o slug do diretório sem o prefixo numérico)' : '';
    report.error(at, `id "${fm.id}" diverge do esperado "${expectedId}"${why}`);
  }

  // Controle de versão de tradução (SPEC.md §5.4).
  if (doc.locale === CANONICAL_LOCALE) {
    if (!isIntInRange(fm.content_version, 1, Number.MAX_SAFE_INTEGER)) {
      report.error(at, `content_version deve ser inteiro >= 1, recebido: ${fm.content_version}`);
    }
    if (fm.translated_from_version !== undefined) {
      report.error(at, 'documento canônico não deve ter translated_from_version');
    }
  } else {
    if (!isIntInRange(fm.translated_from_version, 1, Number.MAX_SAFE_INTEGER)) {
      report.error(at, `translated_from_version deve ser inteiro >= 1, recebido: ${fm.translated_from_version}`);
    }
    if (fm.content_version !== undefined) {
      report.error(at, 'tradução não deve ter content_version (use translated_from_version)');
    }
  }

  // YAML converte 2026-08-26 sem aspas em Date. Aceitamos as duas formas:
  // exigir aspas seria uma regra que autores esquecem e que o linter puniria.
  if (fm.last_reviewed !== undefined) {
    const v = fm.last_reviewed;
    const ok =
      v instanceof Date
        ? !Number.isNaN(v.getTime())
        : /^\d{4}-\d{2}-\d{2}$/.test(String(v)) && !Number.isNaN(Date.parse(String(v)));
    if (!ok) {
      report.error(at, `last_reviewed deve ser uma data AAAA-MM-DD válida, recebido: ${v}`);
    }
  }
}

function checkGraph(canonical, report) {
  const byId = new Map();
  for (const doc of canonical) {
    const id = doc.frontmatter.id;
    if (!id) continue;
    if (byId.has(id)) {
      report.error(doc.repoPath, `id duplicado "${id}" (também em ${byId.get(id).repoPath})`);
      continue;
    }
    byId.set(id, doc);
  }

  // canonical_for: um conceito, um documento (SPEC.md §7.4).
  const claims = new Map();
  for (const doc of canonical) {
    for (const term of doc.frontmatter.canonical_for ?? []) {
      const key = String(term).toLowerCase().trim();
      if (claims.has(key)) {
        report.error(doc.repoPath, `canonical_for "${term}" já reivindicado por ${claims.get(key)}`);
      } else {
        claims.set(key, doc.repoPath);
      }
    }
  }

  // Referências precisam existir.
  for (const doc of canonical) {
    for (const key of ['prerequisites', 'related']) {
      for (const ref of doc.frontmatter[key] ?? []) {
        if (!byId.has(ref)) {
          report.error(doc.repoPath, `${key} aponta para id inexistente: "${ref}"`);
        }
        if (ref === doc.frontmatter.id) {
          report.error(doc.repoPath, `${key} referencia o próprio documento`);
        }
      }
    }
  }

  // O grafo de pré-requisitos precisa ser um DAG (SPEC.md §4.4).
  const WHITE = 0, GREY = 1, BLACK = 2;
  const color = new Map([...byId.keys()].map((id) => [id, WHITE]));
  const stack = [];

  function visit(id) {
    color.set(id, GREY);
    stack.push(id);
    for (const next of byId.get(id)?.frontmatter.prerequisites ?? []) {
      if (!byId.has(next)) continue;
      if (color.get(next) === GREY) {
        const cycle = [...stack.slice(stack.indexOf(next)), next].join(' → ');
        report.error(byId.get(id).repoPath, `ciclo no grafo de pré-requisitos: ${cycle}`);
      } else if (color.get(next) === WHITE) {
        visit(next);
      }
    }
    stack.pop();
    color.set(id, BLACK);
  }

  for (const id of byId.keys()) {
    if (color.get(id) === WHITE) visit(id);
  }

  return byId.size;
}

const report = new Report('frontmatter');
const all = loadAll();
const canonical = loadCanonical();

for (const doc of all) validateOne(doc, report);
const idCount = checkGraph(canonical, report);

process.exit(report.finish(`${all.length} documento(s), ${idCount} id(s) únicos`));
