/**
 * Carregamento e modelo comum dos documentos, usado por todos os validadores.
 *
 * Convenção de caminhos (SPEC.md §5.1):
 *   docs/<seção>/<slug>.md                                          → canônico (pt-BR)
 *   i18n/<locale>/docusaurus-plugin-content-docs/current/<mesmo>.md  → tradução
 */

import {readFileSync, readdirSync, statSync, existsSync} from 'node:fs';
import {join, relative, sep, extname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import matter from 'gray-matter';

/**
 * Raiz do repositório. SAM_ROOT permite apontar os validadores para uma árvore
 * alternativa — usado pelos testes, que rodam cada script contra fixtures em
 * vez de contra o conteúdo real.
 */
export const ROOT = process.env.SAM_ROOT
  ? resolve(process.env.SAM_ROOT)
  : fileURLToPath(new URL('../..', import.meta.url));
export const DOCS_DIR = join(ROOT, 'docs');
export const I18N_DIR = join(ROOT, 'i18n');
export const CANONICAL_LOCALE = 'pt-BR';

const MD_EXT = new Set(['.md', '.mdx']);

/** Caminho da árvore de documentos traduzidos de uma locale. */
export function translationDir(locale) {
  return join(I18N_DIR, locale, 'docusaurus-plugin-content-docs', 'current');
}

/** Locales de tradução presentes no disco (exclui a canônica). */
export function translationLocales() {
  if (!existsSync(I18N_DIR)) return [];
  return readdirSync(I18N_DIR)
    .filter((name) => name !== CANONICAL_LOCALE)
    .filter((name) => existsSync(translationDir(name)))
    .sort();
}

function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('.') || entry === 'node_modules') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, acc);
    else if (MD_EXT.has(extname(entry))) acc.push(full);
  }
  return acc;
}

function toDoc(absPath, baseDir, locale) {
  const raw = readFileSync(absPath, 'utf8');
  const {data, content} = matter(raw);
  const docPath = relative(baseDir, absPath).split(sep).join('/');
  return {
    absPath,
    repoPath: relative(ROOT, absPath).split(sep).join('/'),
    docPath, // caminho relativo à raiz de docs, idêntico entre locales
    section: docPath.includes('/') ? docPath.split('/')[0] : null,
    locale,
    frontmatter: data,
    body: content,
    raw,
  };
}

/** Documentos canônicos (pt-BR), em docs/. */
export function loadCanonical() {
  return walk(DOCS_DIR).map((f) => toDoc(f, DOCS_DIR, CANONICAL_LOCALE));
}

/** Documentos traduzidos de uma locale. */
export function loadTranslations(locale) {
  const base = translationDir(locale);
  return walk(base).map((f) => toDoc(f, base, locale));
}

/** Todos os documentos, canônicos e traduzidos. */
export function loadAll() {
  return [
    ...loadCanonical(),
    ...translationLocales().flatMap((l) => loadTranslations(l)),
  ];
}

/**
 * Coletor de diagnósticos. Erros falham o build; avisos são reportados
 * e não bloqueiam. Ver SPEC.md §13.1.
 */
export class Report {
  constructor(name) {
    this.name = name;
    this.errors = [];
    this.warnings = [];
  }

  error(file, message) {
    this.errors.push({file, message});
  }

  warn(file, message) {
    this.warnings.push({file, message});
  }

  /** Imprime o resultado e devolve o código de saída apropriado. */
  finish(summary = '') {
    const {name, errors, warnings} = this;
    for (const {file, message} of warnings) {
      console.log(`  aviso  ${file}\n         ${message}`);
    }
    for (const {file, message} of errors) {
      console.log(`  ERRO   ${file}\n         ${message}`);
    }
    const status = errors.length ? 'FALHOU' : 'ok';
    const counts = `${errors.length} erro(s), ${warnings.length} aviso(s)`;
    console.log(`[${name}] ${status} — ${counts}${summary ? ` — ${summary}` : ''}`);
    return errors.length ? 1 : 0;
  }
}

/** Extrai os títulos de seção (## …) do corpo de um documento. */
export function headings(body) {
  const out = [];
  let inFence = false;
  for (const line of body.split('\n')) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (m) out.push({level: m[1].length, text: m[2]});
  }
  return out;
}

/** Remove blocos de código e código inline. Links são preservados. */
export function stripCode(body) {
  return body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/~~~[\s\S]*?~~~/g, '')
    .replace(/`[^`\n]*`/g, '');
}

/**
 * Texto corrido para análise linguística: sem código e sem URLs.
 *
 * O texto de um link é prosa e deve ser analisado; a URL não. Os slugs deste
 * repositório são em inglês por decisão (ADR-R003), então um link para
 * `../12-reliability/index.md` contém "reliability" sem que o autor tenha
 * escrito o termo em inglês.
 *
 * Separado de stripCode de propósito: check-links precisa dos links intactos
 * para poder validá-los, e removê-los ali faria o validador não encontrar nada.
 */
export function proseOnly(body) {
  return stripCode(body)
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')   // link e imagem: preserva o texto
    .replace(/^\s*\[[^\]]+\]:\s*\S+.*$/gm, '')  // definição de link de referência
    .replace(/<https?:\/\/[^>]+>/g, '');           // autolink
}

/** Conta palavras da prosa, ignorando código e front matter. */
export function wordCount(body) {
  return stripCode(body)
    .replace(/[#>|\-*_[\]()]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
}
