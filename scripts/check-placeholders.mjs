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
  foundation: [900, 2200],
  pattern: [1000, 2000],
  tradeoff: [1200, 2200],
  'case-study': [3000, 6000],
  exercise: [600, 1500],
  adr: [500, 1200],
  index: [400, 900],
  // Glossário e tabela terminológica: densidade governada pela cobertura
  // de termos, não por profundidade argumentativa.
  reference: [500, 12000],
};

/**
 * SPEC.md §7.3 — seções que nunca podem ser omitidas, por tipo de documento.
 *
 * A regra existe para forçar a parte que mais se omite em cada tipo. Para um
 * conceito acionável, é o limite de aplicação: "quando não reduzir acoplamento".
 * Para um documento definicional, exigir "Quando Não Usar" é incoerente — não há
 * o que aplicar — e produziria o filler que a spec proíbe. O que se omite num
 * documento definicional é outra coisa: por que a distinção importa na prática.
 */
const REQUIRED_SECTIONS = {
  concept: {
    'pt-BR': ['Quando Não Usar', 'Trade-offs'],
    'en-US': ['When Not to Use', 'Trade-offs'],
  },
  pattern: {
    'pt-BR': ['Quando Não Usar', 'Trade-offs'],
    'en-US': ['When Not to Use', 'Trade-offs'],
  },
  tradeoff: {
    'pt-BR': ['Quando Não Usar', 'Trade-offs'],
    'en-US': ['When Not to Use', 'Trade-offs'],
  },
  foundation: {
    'pt-BR': ['Por Que Isso Importa', 'Erros Comuns'],
    'en-US': ['Why This Matters', 'Common Mistakes'],
  },
};

// Dois padrões separados de propósito. Os marcadores em caixa alta são
// case-SENSITIVE: em português, /TODO/i casa com "todo", "todo mundo",
// "de todo" — e falharia praticamente todo documento do repositório.
const PENDING_MARKERS = /(?<![\p{L}\p{N}_])(TODO|FIXME|TBD|XXX|WIP)(?![\p{L}\p{N}_])/gu;
const PENDING_PHRASES = /(?<![\p{L}\p{N}_])(preencher aqui|lorem ipsum)(?![\p{L}\p{N}_])/giu;

// Estas frases só são marcadores quando aparecem isoladas — "(a escrever)",
// "_em breve_", ou sozinhas na linha. Em prosa corrida são português legítimo e
// frequente: "último a escrever vence", "vai afetar em breve", "escrever depois
// de construir, não antes". Ver check-terminology.mjs para o mesmo cuidado com
// "em contrapartida".
const PENDING_ISOLATED = /(?:^|[(\[_*])\s*(a escrever|a fazer|em breve|escrever depois)\s*(?:[)\]_*]|$)/gimu;

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
  const pending = [
    ...[...prose.matchAll(PENDING_MARKERS)].map((m) => m[0]),
    ...[...prose.matchAll(PENDING_PHRASES)].map((m) => m[0]),
    ...[...prose.matchAll(PENDING_ISOLATED)].map((m) => m[1]),
  ];
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
  const requiredByLocale = REQUIRED_SECTIONS[fm.doc_type];
  if (complete && requiredByLocale) {
    const required = requiredByLocale[doc.locale] ?? requiredByLocale[CANONICAL_LOCALE];
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
  //
  // A faixa mede profundidade argumentativa, que é propriedade do conteúdo — e o
  // conteúdo é decidido no canônico. Aplicá-la também à tradução mede duas vezes
  // a mesma coisa, com ruído: a razão observada entre tradução e canônico varia
  // de 0,95 a 1,07, então um canônico logo acima do piso produz uma tradução
  // logo abaixo dele, e o aviso não diz nada sobre o documento.
  //
  // A tradução responde por outra pergunta — perdeu conteúdo? — verificada em
  // `checkTranslationLength` contra o próprio canônico.
  const range = WORD_RANGE[fm.doc_type];
  if (range && complete && doc.locale === CANONICAL_LOCALE) {
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

/**
 * Tradução muito mais curta que o canônico perdeu conteúdo.
 *
 * Os limites saem da distribuição real dos 446 pares: a razão vai de 0,95 a 1,07,
 * com mediana 1,01. 0,85 e 1,25 ficam bem fora dessa faixa, de modo que o aviso
 * sinaliza seção esquecida ou bloco duplicado, não variação de idioma.
 */
const RATIO_MIN = 0.85;
const RATIO_MAX = 1.25;

function checkTranslationLength(all, report) {
  const canonical = new Map(
    all.filter((d) => d.locale === CANONICAL_LOCALE).map((d) => [d.docPath, wordCount(d.body)]),
  );
  for (const doc of all) {
    if (doc.locale === CANONICAL_LOCALE) continue;
    const base = canonical.get(doc.docPath);
    if (!base) continue; // tradução órfã: `check-parity` responde por ela
    const words = wordCount(doc.body);
    const ratio = words / base;
    if (ratio < RATIO_MIN) {
      report.warn(doc.repoPath, `${words} palavras contra ${base} do canônico (${(ratio * 100).toFixed(0)}%) — provável seção perdida na tradução`);
    } else if (ratio > RATIO_MAX) {
      report.warn(doc.repoPath, `${words} palavras contra ${base} do canônico (${(ratio * 100).toFixed(0)}%) — provável conteúdo duplicado`);
    }
  }
}

const report = new Report('placeholders');
const all = loadAll();
for (const doc of all) checkDoc(doc, report);
checkTranslationLength(all, report);

const completeCount = all.filter((d) => d.frontmatter.status === 'complete').length;
process.exit(report.finish(`${all.length} documento(s), ${completeCount} com status complete`));
