#!/usr/bin/env node
/**
 * Link que aponta para o índice da seção quando existe documento canônico.
 *
 * SPEC.md §7.4: um conceito tem um único documento canônico, e onde ele
 * reaparece é referenciado por link — não redefinido. O front matter declara
 * `canonical_for`, e `check-frontmatter` já impede que dois documentos
 * reivindiquem o mesmo termo.
 *
 * O que faltava é a outra ponta: nada verificava se o link **chega** ao
 * canônico. `check-links` aprova `[circuit breaker](/12-reliability/index.md)`
 * porque o alvo existe — o link é válido, só não leva o leitor ao documento
 * que responde pelo termo. É a forma de violar §7.4 que passa pelo CI.
 *
 * A regra: se o texto do link é termo `canonical_for` de um documento da mesma
 * seção para a qual o link aponta, o link deveria apontar para esse documento.
 *
 * O que NÃO é erro: link cujo texto nomeia a própria seção. `[Confiabilidade]
 * (/12-reliability/index.md)` está certo mesmo que "confiabilidade" seja termo
 * canônico de `reliability-basics.md` — ali o texto se refere à seção, e o
 * índice é o destino correto.
 *
 * Roda só sobre os canônicos: `canonical_for` é sempre `[]` nas traduções, que
 * herdam a estrutura de link do documento de origem.
 */

import {loadCanonical, Report, stripCode} from './lib/docs.mjs';

/** Casamento por forma, não por grafia: caixa, acento e pontuação não decidem. */
function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[.,;:()[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const LINK_TO_SECTION_INDEX = /\[([^\]]+)\]\((\/[0-9]{2}-[a-z0-9-]+)\/index\.md\)/g;

export function run() {
  const report = new Report('canonical-links');
  const docs = loadCanonical();

  // termo canônico → docPath de quem responde por ele
  const owner = new Map();
  // seção → título do seu índice, para reconhecer o link legítimo à seção
  const sectionTitle = new Map();

  for (const doc of docs) {
    const {doc_type: docType, canonical_for: terms, title} = doc.frontmatter;

    if (docType === 'index') {
      if (doc.section && title) sectionTitle.set(`/${doc.section}`, normalize(String(title)));
      continue;
    }
    if (!Array.isArray(terms)) continue;
    for (const term of terms) {
      if (typeof term === 'string' && term.trim()) owner.set(normalize(term), doc.docPath);
    }
  }

  let checked = 0;

  for (const doc of docs) {
    const body = stripCode(doc.body);
    for (const match of body.matchAll(LINK_TO_SECTION_INDEX)) {
      checked += 1;
      const text = normalize(match[1]);
      const section = match[2];

      if (sectionTitle.get(section) === text) continue;

      const target = owner.get(text);
      if (!target || !target.startsWith(`${section.slice(1)}/`)) continue;

      report.error(
        doc.repoPath,
        `"${match[1].replace(/\s+/g, ' ')}" aponta para ${section}/index.md, ` +
          `mas o documento canônico do termo é /${target}. Ver SPEC.md §7.4.`,
      );
    }
  }

  return {report, summary: `${checked} link(s) para índice de seção em ${docs.length} documento(s)`};
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const {report, summary} = run();
  process.exit(report.finish(summary));
}
