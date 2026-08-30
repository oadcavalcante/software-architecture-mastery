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
import GithubSlugger from 'github-slugger';
import {loadAll, Report, ROOT, DOCS_DIR, translationDir, CANONICAL_LOCALE, stripCode} from './lib/docs.mjs';

const MERMAID_TYPES = [
  'graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram',
  'stateDiagram-v2', 'erDiagram', 'journey', 'gantt', 'pie', 'gitGraph',
  'mindmap', 'timeline', 'quadrantChart', 'C4Context', 'C4Container',
  'C4Component', 'C4Dynamic', 'sankey-beta', 'block-beta', 'architecture-beta',
];

/**
 * Âncoras de um documento, calculadas com o MESMO slugger que o Docusaurus usa.
 *
 * Reimplementar a regra é um erro sutil e caro num site em português: a versão
 * anterior removia acentos, mas o Docusaurus os preserva — "Decisão de Exemplo"
 * vira "decisão-de-exemplo", não "decisao-de-exemplo". Delegar ao github-slugger
 * também nos dá de graça o sufixo -1, -2 de cabeçalhos repetidos.
 */
function anchorsOf(doc) {
  const slugger = new GithubSlugger();
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
    if (explicit) {
      set.add(explicit[1]);
      continue;
    }
    // Remove links e código do texto antes de gerar o slug, como o Docusaurus faz.
    const text = m[1]
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/`([^`]*)`/g, '$1');
    set.add(slugger.slug(text));
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

/**
 * Caminho equivalente no locale canônico.
 *
 * O Docusaurus serve o documento em pt-BR quando a tradução não existe
 * (SPEC.md §5.3: a tradução é progressiva e ⬜ é estado válido). Um link de um
 * documento em en-US para uma página ainda não traduzida resolve em tempo de
 * execução — tratá-lo como quebrado obrigaria a traduzir o corpus inteiro numa
 * única passagem, que é exatamente o que a política de tradução recusa.
 *
 * Só se aplica a locales não canônicos: em pt-BR não há para onde cair.
 */
function canonicalFallback(doc, base, abs) {
  if (doc.locale === CANONICAL_LOCALE) return abs;
  return join(DOCS_DIR, relative(base, abs));
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
      if (!existsSync(abs) && !existsSync(canonicalFallback(doc, base, abs))) {
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

/**
 * Docusaurus compila Markdown como MDX, e o parser de MDX interpreta `<` como
 * início de elemento. Um autolink `<https://exemplo.com>` quebra a compilação
 * com "Unexpected character `/`" — erro que só aparece no build, depois de os
 * validadores terem passado. Detectamos aqui para falhar no gate certo.
 */
function checkMdxHazards(doc, report) {
  const prose = stripCode(doc.body);

  for (const m of prose.matchAll(/<(https?:\/\/[^\s>]+)>/g)) {
    report.error(
      doc.repoPath,
      `autolink <${m[1]}> quebra a compilação MDX — use [texto](${m[1]})`,
    );
  }

  // Marcador entre sinais de menor e maior — "<data>", "<nome do serviço>" — é
  // hábito de quem escreve gabarito, e o MDX o lê como abertura de tag JSX:
  // "Expected a closing tag for <data>". Fora de bloco de código ele quebra a
  // compilação, e o erro aparece no build e não aqui, que é tarde demais.
  //
  // O teste é a ausência de fechamento: JSX legítimo neste corpus (`<Tabs>`,
  // `<details>`) sempre fecha, e tag vazia se escreve `<br />`, que não casa.
  for (const m of prose.matchAll(/<([a-zA-Z][\w-]*)\s*>/g)) {
    if (prose.includes(`</${m[1]}>`)) continue;
    report.error(
      doc.repoPath,
      `<${m[1]}> sem fechamento quebra a compilação MDX — ` +
        'use bloco de código ou outro delimitador para marcadores',
    );
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
  checkMdxHazards(doc, report);
}

process.exit(report.finish(`${all.length} documento(s)`));
