#!/usr/bin/env node
/**
 * Verifica links internos, âncoras e estrutura de diagramas Mermaid.
 *
 * O build do Docusaurus já falha em link de rota quebrado, mas não valida
 * âncoras dentro de arquivos Markdown de forma exaustiva, e não valida
 * Mermaid — que é renderizado no cliente. Este script cobre essas lacunas.
 */

import {existsSync} from 'node:fs';
import {join, dirname, resolve, relative} from 'node:path';
import {loadAll, Report, ROOT, DOCS_DIR, translationDir, CANONICAL_LOCALE, stripCode} from './lib/docs.mjs';

const MERMAID_TYPES = [
  'graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram',
  'stateDiagram-v2', 'erDiagram', 'journey', 'gantt', 'pie', 'gitGraph',
  'mindmap', 'timeline', 'quadrantChart', 'C4Context', 'C4Container',
  'C4Component', 'C4Dynamic', 'sankey-beta', 'block-beta', 'architecture-beta',
];

/** GitHub/Docusaurus slug: minúsculas, sem pontuação, espaços viram hífen. */
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/`[^`]*`/g, (s) => s.replace(/`/g, ''))
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function anchorsOf(doc) {
  const set = new Set();
  let inFence = false;
  for (const line of doc.body.split('\n')) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^#{1,6}\s+(.+?)\s*$/.exec(line);
    if (!m) continue;
    // Docusaurus permite id explícito: ## Título {#id-custom}
    const explicit = /\{#([^}]+)\}\s*$/.exec(m[1]);
    set.add(explicit ? explicit[1] : slugify(m[1]));
  }
  return set;
}

/** Extrai links Markdown, ignorando os que estão dentro de código. */
function linksOf(body) {
  const out = [];
  const prose = stripCode(body);
  const re = /\[([^\]]*)\]\(\s*([^)\s]+)(?:\s+"[^"]*")?\s*\)/g;
  let m;
  while ((m = re.exec(prose)) !== null) out.push({text: m[1], target: m[2]});
  return out;
}

function baseDirFor(locale) {
  return locale === CANONICAL_LOCALE ? DOCS_DIR : translationDir(locale);
}

function checkLinks(doc, byLocale, report) {
  const base = baseDirFor(doc.locale);
  const here = dirname(doc.absPath);

  for (const {target} of linksOf(doc.body)) {
    if (/^(https?:|mailto:|tel:|#|<)/.test(target)) {
      // Âncora no próprio documento.
      if (target.startsWith('#')) {
        const anchor = decodeURIComponent(target.slice(1));
        if (!anchorsOf(doc).has(anchor)) {
          report.error(doc.repoPath, `âncora inexistente no próprio documento: #${anchor}`);
        }
      }
      continue;
    }

    const [pathPart, anchorPart] = target.split('#');
    if (!pathPart) continue;

    // Links absolutos de site (/algo) são resolvidos pelo Docusaurus, que já
    // falha o build com onBrokenLinks: 'throw'. Não duplicamos aqui.
    if (pathPart.startsWith('/')) continue;

    const abs = resolve(here, pathPart);

    // Arquivo de documentação: precisa existir e a âncora precisa bater.
    if (/\.mdx?$/.test(pathPart)) {
      if (!existsSync(abs)) {
        report.error(doc.repoPath, `link para arquivo inexistente: ${pathPart}`);
        continue;
      }
      if (anchorPart) {
        const docPath = relative(base, abs).split(/[\\/]/).join('/');
        const targetDoc = byLocale.get(doc.locale)?.get(docPath);
        if (targetDoc && !anchorsOf(targetDoc).has(decodeURIComponent(anchorPart))) {
          report.error(doc.repoPath, `âncora inexistente em ${pathPart}: #${anchorPart}`);
        }
      }
      continue;
    }

    // Outros arquivos relativos (imagens, anexos).
    if (!existsSync(abs) && !existsSync(join(ROOT, 'static', pathPart))) {
      report.error(doc.repoPath, `arquivo referenciado não encontrado: ${pathPart}`);
    }
  }
}

/**
 * Verificação estrutural de Mermaid — não é um parse completo.
 * Detecta os erros que de fato aparecem: bloco vazio, tipo de diagrama
 * desconhecido e delimitadores desbalanceados.
 */
function checkMermaid(doc, report) {
  const re = /```mermaid\r?\n([\s\S]*?)```/g;
  let m;
  let index = 0;
  while ((m = re.exec(doc.raw)) !== null) {
    index += 1;
    const code = m[1].trim();
    const label = `diagrama mermaid #${index}`;

    if (!code) {
      report.error(doc.repoPath, `${label}: bloco vazio`);
      continue;
    }

    const firstLine = code.split('\n').find((l) => l.trim() && !l.trim().startsWith('%%'));
    const type = firstLine?.trim().split(/[\s({]/)[0];
    if (!MERMAID_TYPES.includes(type)) {
      report.error(doc.repoPath, `${label}: tipo de diagrama desconhecido "${type}"`);
      continue;
    }

    for (const [open, close] of [['[', ']'], ['(', ')'], ['{', '}']]) {
      const a = (code.match(new RegExp(`\\${open}`, 'g')) ?? []).length;
      const b = (code.match(new RegExp(`\\${close}`, 'g')) ?? []).length;
      if (a !== b) {
        report.error(doc.repoPath, `${label}: "${open}" e "${close}" desbalanceados (${a} vs ${b})`);
      }
    }

    const nodes = new Set([...code.matchAll(/^\s*([A-Za-z][\w-]*)\s*[[({]/gm)].map((x) => x[1]));
    if (/^(graph|flowchart)/.test(type) && nodes.size > 12) {
      report.warn(doc.repoPath, `${label}: ${nodes.size} nós — SPEC.md §9 sugere no máximo ~12, decomponha`);
    }
  }
}

const report = new Report('links');
const all = loadAll();

const byLocale = new Map();
for (const doc of all) {
  if (!byLocale.has(doc.locale)) byLocale.set(doc.locale, new Map());
  byLocale.get(doc.locale).set(doc.docPath, doc);
}

for (const doc of all) {
  checkLinks(doc, byLocale, report);
  checkMermaid(doc, report);
}

process.exit(report.finish(`${all.length} documento(s)`));
