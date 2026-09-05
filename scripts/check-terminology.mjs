#!/usr/bin/env node
/**
 * Aplica a política terminológica (SPEC.md §5.5).
 *
 * O linter é deliberadamente conservador: só sinaliza o que consegue afirmar
 * com confiança. Tradução técnica inconsistente destrói material de arquitetura,
 * mas um linter ruidoso é ignorado, e um linter ignorado não protege nada.
 *
 * Três regras:
 *   1. Mistura — o documento usa a forma PT e a forma EN do mesmo termo sem
 *      que seja glosa de primeira ocorrência. Alterna vocabulário no meio do texto.
 *   2. Não traduzido — documento pt-BR usa a forma EN de um termo da categoria A
 *      e nunca a forma PT. Está adotando o termo inglês como termo de trabalho.
 *   3. Traduzido indevidamente — documento pt-BR traduz um termo da categoria B.
 *
 * Escape hatch: front matter `terminology_exempt: [termo, ...]`.
 */

import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {loadAll, Report, proseOnly, CANONICAL_LOCALE} from './lib/docs.mjs';

// Resolvido relativo a este script, não à raiz de conteúdo: a política
// terminológica pertence à ferramenta, e SAM_ROOT move só a árvore de documentos.
const TERMS = JSON.parse(
  readFileSync(fileURLToPath(new URL('./terminology.json', import.meta.url)), 'utf8'),
);

/** Ocorrências de um termo em prosa, com limite de palavra e sem acento-sensibilidade. */
function termPattern(term) {
  // Markdown quebra linhas no meio de termos compostos: "anti-corruption\nlayer".
  // Um espaço literal não casa com a quebra, então qualquer espaço no termo
  // vira \s+ e o termo é reconhecido independentemente de onde a linha quebrou.
  return term
    .split(/\s+/)
    .map((word) => word.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&'))
    .join('\\s+');
}

/*
 * Sufixo opcional de plural na última palavra.
 *
 * O casamento era por forma exata, e "acoplamentos" não contava como ocorrência
 * de "acoplamento" — o mesmo falso negativo que `check-canonical-links` tinha e
 * que deixou vinte links passarem. Cobre o plural regular do português e do
 * inglês (-s, -es) e as terminações que mudam a raiz (-ão→-ões, -al→-ais,
 * -el→-eis, -m→-ns), que é o suficiente para os termos do glossário.
 */
function comPlural(pattern) {
  return `(?:${pattern})(?:s|es|ns)?`;
}

function occurrences(prose, term) {
  const re = new RegExp(
    `(?<![\\p{L}\\p{N}_])${comPlural(termPattern(term))}(?![\\p{L}\\p{N}_])`,
    'giu',
  );
  return [...prose.matchAll(re)].map((m) => m.index);
}

/**
 * Glosa legítima: "acoplamento (coupling)" ou "coupling (acoplamento)".
 * Aceita a forma EN colada à forma PT dentro de uma janela curta.
 */
function isGlossPair(prose, ptIndexes, enIndexes) {
  const WINDOW = 40;
  return enIndexes.every((en) =>
    ptIndexes.some((pt) => Math.abs(en - pt) <= WINDOW),
  );
}

/**
 * Termos compostos da categoria B contêm palavras da categoria A:
 * "anti-corruption layer" contém "layer". Sem mascarar, a regra
 * layer→camada dispara dentro de um termo que deve ficar em inglês.
 *
 * `homonyms` cobre o caso inverso: expressões fixas do português que contêm
 * uma má tradução sem serem uma. "em contrapartida" é conectivo corrente e
 * não tem relação com trade-off; mascará-lo evita punir prosa correta.
 * Mascaramos antes de checar, preservando o comprimento para que os
 * índices usados na detecção de glosa continuem válidos.
 */
function maskProtectedPhrases(prose) {
  const phrases = [
    ...TERMS.keep.map((k) => k.term),
    ...TERMS.keep.flatMap((k) => k.homonyms ?? []),
    ...TERMS.gloss.map((g) => g.term),
    ...TERMS.neverTranslate,
  ].sort((a, b) => b.length - a.length); // mais longos primeiro

  let masked = prose;
  for (const phrase of phrases) {
    const re = new RegExp(`(?<![\\p{L}\\p{N}_])${termPattern(phrase)}(?![\\p{L}\\p{N}_])`, 'giu');
    masked = masked.replace(re, (m) => '\u0000'.repeat(m.length));
  }
  return masked;
}

/**
 * Remove a seção de bibliografia antes de checar terminologia.
 *
 * "Site Reliability Engineering" e "Technical Debt Quadrant" são títulos de
 * obras — nomes próprios que não se traduzem. Sem esta exclusão, todo documento
 * com bibliografia acusa uso do termo em inglês, o que é praticamente todos.
 */
const BIBLIOGRAPHY_HEADINGS = /^##\s+(Para Aprofundar|Further Exploration|Refer[êe]ncias|References)\s*$/im;

function stripBibliography(body) {
  const match = BIBLIOGRAPHY_HEADINGS.exec(body);
  return match ? body.slice(0, match.index) : body;
}

function checkCanonicalDoc(doc, report) {
  const prose = maskProtectedPhrases(proseOnly(stripBibliography(doc.body)));
  const exempt = new Set((doc.frontmatter.terminology_exempt ?? []).map((t) => String(t).toLowerCase()));
  const at = doc.repoPath;

  // Regras 1 e 2 — categoria A.
  for (const {en, pt, enforced} of TERMS.translate) {
    if (!enforced || exempt.has(en.toLowerCase())) continue;
    const enHits = occurrences(prose, en);
    if (!enHits.length) continue;
    const ptHits = occurrences(prose, pt);

    if (!ptHits.length) {
      report.error(at, `usa "${en}" (${enHits.length}×) e nunca "${pt}" — categoria A exige o termo em português`);
    } else if (!isGlossPair(prose, ptHits, enHits)) {
      report.error(at, `alterna entre "${pt}" e "${en}" fora de glosa de primeira ocorrência — fixe um vocabulário`);
    }
  }

  // Regra 3 — categoria B.
  for (const {term, badPt, enforced} of TERMS.keep) {
    if (!enforced || exempt.has(term.toLowerCase())) continue;
    for (const bad of badPt) {
      if (occurrences(prose, bad).length) {
        report.error(at, `traduz "${term}" como "${bad}" — categoria B mantém o termo em inglês`);
      }
    }
  }
}

function checkTranslatedDoc(doc, report) {
  const prose = maskProtectedPhrases(proseOnly(stripBibliography(doc.body)));
  const exempt = new Set((doc.frontmatter.terminology_exempt ?? []).map((t) => String(t).toLowerCase()));
  const at = doc.repoPath;

  // Termo em português vazando para documento em inglês.
  for (const {en, pt, enforced} of TERMS.translate) {
    if (!enforced || exempt.has(en.toLowerCase())) continue;
    if (occurrences(prose, pt).length) {
      report.error(at, `documento ${doc.locale} contém o termo em português "${pt}" — use "${en}"`);
    }
  }
}

/**
 * Letra de outro alfabeto no meio de palavra latina.
 *
 * "Strangler" digitado com о cirílico é indistinguível de "Strangler" para o
 * leitor, passa por revisão humana e por corretor ortográfico, e quebra busca e
 * âncora. O risco é real num corpus bilíngue produzido em volume — este caso
 * apareceu numa tradução do glossário.
 *
 * A verificação é de escrita mista dentro da mesma palavra: um documento inteiro
 * em outro alfabeto seria legítimo; uma palavra latina com uma letra cirílica ou
 * grega no meio, não.
 */
const MIXED_SCRIPT_WORD = /[A-Za-zÀ-ÿ]+[\u0370-\u03ff\u0400-\u04ff]|[\u0370-\u03ff\u0400-\u04ff][A-Za-zÀ-ÿ]+/u;

function checkMixedScript(doc, report) {
  for (const word of doc.body.split(/\s+/)) {
    if (MIXED_SCRIPT_WORD.test(word)) {
      const clean = word.replace(/[^\p{L}]/gu, '');
      report.error(
        doc.repoPath,
        `letra de outro alfabeto dentro de palavra latina: "${clean}" — ` +
          'invisível ao leitor, quebra busca e âncora',
      );
      return;
    }
  }
}

const report = new Report('terminology');
const all = loadAll();

for (const doc of all) {
  checkMixedScript(doc, report);
  if (doc.locale === CANONICAL_LOCALE) checkCanonicalDoc(doc, report);
  else checkTranslatedDoc(doc, report);
}

const enforced = TERMS.translate.filter((t) => t.enforced).length
  + TERMS.keep.filter((t) => t.enforced).length;
process.exit(report.finish(`${all.length} documento(s), ${enforced} termo(s) aplicados`));
