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

/**
 * Formas singulares plausíveis de um termo, para casar "sagas" com "saga".
 *
 * O casamento era por forma exata, e o plural passava batido — foi assim que
 * `[sagas](/06-distributed-systems/index.md)` e
 * `[circuit breakers](/12-reliability/index.md)` sobreviveram a uma passagem do
 * validador. Devolve variantes candidatas em vez de uma forma canônica: a
 * despluralização do português é ambígua, e testar várias só amplia a detecção
 * sem inventar um termo que não existe — o achado só vale se alguma variante
 * for `canonical_for` de um documento da própria seção.
 */
function singularForms(term) {
  const formas = new Set([term]);
  const ultima = term.split(' ').pop();
  if (!ultima || !ultima.endsWith('s')) return formas;

  const trocar = (sufixo, por) => {
    if (!ultima.endsWith(sufixo) || ultima.length <= sufixo.length) return;
    const raiz = term.slice(0, term.length - sufixo.length);
    formas.add(raiz + por);
  };

  trocar('s', '');
  trocar('es', '');
  trocar('oes', 'ao');   // padroes → padrao (o acento já caiu em normalize)
  trocar('aes', 'ao');   // paes → pao
  trocar('ais', 'al');   // sinais → sinal
  trocar('eis', 'el');   // niveis → nivel
  trocar('ois', 'ol');
  trocar('uis', 'ul');
  trocar('ns', 'm');     // armazens → armazem
  trocar('ses', 's');    // ingleses → ingles
  return formas;
}

const LINK_TO_SECTION_INDEX = /\[([^\]]+)\]\((\/[0-9]{2}-[a-z0-9-]+)\/index\.md\)/g;

/** Qualquer link interno, para a segunda regra. */
const LINK_INTERNO = /\[([^\]\n]+)\]\((\/[^)\s]+\.md)\)/g;

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

      let target;
      for (const forma of singularForms(text)) {
        const dono = owner.get(forma);
        if (dono && dono.startsWith(`${section.slice(1)}/`)) {
          target = dono;
          break;
        }
      }
      if (!target) continue;

      report.error(
        doc.repoPath,
        `"${match[1].replace(/\s+/g, ' ')}" aponta para ${section}/index.md, ` +
          `mas o documento canônico do termo é /${target}. Ver SPEC.md §7.4.`,
      );
    }
  }

  // Segunda regra: link cujo texto é termo canônico de um documento e aponta
  // para outro que sequer menciona o termo.
  //
  // A regra acima só olha links para índice de seção, e por isso deixou passar
  // `[cérebro dividido](/06-distributed-systems/network-failure.md)` — alvo
  // existente, termo canônico de `leader-election.md`, e um documento de destino
  // onde a expressão não aparece uma única vez. O leitor clica no conceito e
  // chega a um texto que não o trata.
  //
  // A condição "não menciona" é o que separa o erro do uso legítimo: o acervo
  // liga com frequência um termo ao documento que o aprofunda em vez do que o
  // declara, e isso é escrita boa, não violação. Sem essa condição a regra
  // acusaria 105 links, quase todos corretos; com ela, só os que quebram a
  // promessa feita ao leitor.
  const byPath = new Map(docs.map((doc) => [doc.docPath, doc]));

  for (const doc of docs) {
    const body = stripCode(doc.body);
    for (const match of body.matchAll(LINK_INTERNO)) {
      const text = normalize(match[1]);
      const targetPath = match[2].slice(1);
      if (targetPath.endsWith('/index.md')) continue; // já coberto acima

      let dono;
      for (const forma of singularForms(text)) {
        if (owner.has(forma)) {
          dono = owner.get(forma);
          break;
        }
      }
      if (!dono || dono === targetPath || dono === doc.docPath) continue;

      const destino = byPath.get(targetPath);
      if (!destino) continue;
      const corpo = normalize(destino.body);
      let mencionado = false;
      for (const forma of singularForms(text)) {
        if (corpo.includes(forma)) {
          mencionado = true;
          break;
        }
      }
      if (mencionado) continue;

      checked += 1;
      report.error(
        doc.repoPath,
        `"${match[1].replace(/\s+/g, ' ')}" aponta para /${targetPath}, que não menciona ` +
          `o termo; o documento canônico é /${dono}. Ver SPEC.md §7.4.`,
      );
    }
  }

  return {report, summary: `${checked} link(s) verificado(s) em ${docs.length} documento(s)`};
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const {report, summary} = run();
  process.exit(report.finish(summary));
}
