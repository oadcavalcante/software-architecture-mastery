#!/usr/bin/env node
/**
 * Gera a Política Terminológica, nas duas locales, a partir de
 * scripts/terminology.json.
 *
 * A tabela publicada e a regra aplicada pelo linter saem da mesma fonte.
 * Mantê-las separadas garantiria divergência entre o que o documento promete
 * e o que o CI cobra.
 *
 * A versão en-US é gerada junto pelo mesmo motivo: as tabelas são idênticas nas
 * duas locales — são pares de termos, não texto localizável — e traduzi-las à
 * mão criaria uma cópia que envelhece sozinha a cada mudança em terminology.json.
 */

import {readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {ROOT} from './lib/docs.mjs';

const TERMS = JSON.parse(
  readFileSync(fileURLToPath(new URL('./terminology.json', import.meta.url)), 'utf8'),
);
const OUT_PT = join(ROOT, 'docs', 'i18n-terminology.md');
const OUT_EN = join(
  ROOT, 'i18n', 'en-US', 'docusaurus-plugin-content-docs', 'current', 'i18n-terminology.md',
);

const mark = {
  'pt-BR': (enforced) => (enforced ? '✅ aplicado' : '— orientação'),
  'en-US': (enforced) => (enforced ? '✅ enforced' : '— guidance'),
};

/**
 * Este documento cita, por definição, as duas formas de cada termo. Sem isenção
 * ele violaria a própria política que publica. A lista é derivada dos termos,
 * não mantida à mão, para não defasar.
 */
const exempt = [
  ...TERMS.translate.map((t) => t.en),
  ...TERMS.keep.map((t) => t.term),
].sort();

const frontmatterPt = `---
id: i18n-terminology
title: Política Terminológica
sidebar_position: 90
description: Como cada termo técnico é tratado entre português e inglês, e quais regras o CI aplica.
doc_type: reference
level: 0
difficulty: iniciante
status: complete
objective: >
  Ao terminar, quem escreve ou traduz sabe qual forma usar para cada termo e
  quais decisões o linter cobra automaticamente.
prerequisites: []
related: []
canonical_for: []
terminology_exempt: [${exempt.map((t) => JSON.stringify(t)).join(', ')}]
content_version: 1
last_reviewed: 2026-08-26
---`;

const bodyPt = `
# Política Terminológica

Tradução técnica inconsistente destrói material de arquitetura. Um documento que
alterna entre "acoplamento" e "coupling" obriga o leitor a decidir, a cada
ocorrência, se os dois termos significam a mesma coisa.

Esta página é **gerada** a partir de \`scripts/terminology.json\`, que é também a
fonte que o linter usa. O que está aqui é exatamente o que o CI cobra.

:::info Gerado automaticamente

Não edite esta página. Altere \`scripts/terminology.json\` e rode
\`npm run terminology\`.

:::

## Como ler as tabelas

A coluna **Regra** indica se o linter aplica a decisão automaticamente:

- **✅ aplicado** — violar falha o build.
- **— orientação** — documentado, não automatizado. São os casos em que a
  decisão depende de contexto e a automação produziria falso positivo.

Um documento pode declarar \`terminology_exempt: [termo]\` no front matter para
sair da regra num caso justificado — citação literal, por exemplo.

## Categoria A — Traduzir sempre

Termos com equivalente estabelecido em português técnico. O documento usa a
forma em português como termo de trabalho.

A forma em inglês é permitida **uma vez**, como glosa de primeira ocorrência:
*"acoplamento (coupling)"*. Depois disso, só a forma em português.

| Inglês | Português | Regra |
|---|---|---|
${TERMS.translate.map((t) => `| ${t.en} | ${t.pt} | ${mark['pt-BR'](t.enforced)} |`).join('\n')}

## Categoria B — Manter em inglês

Termos em que traduzir prejudica o reconhecimento ou não há equivalente aceito.
A coluna de traduções recusadas lista as formas que o linter rejeita.

| Termo | Traduções recusadas | Regra |
|---|---|---|
${TERMS.keep.map((t) => `| ${t.term} | ${t.badPt.length ? t.badPt.join(' · ') : '—'} | ${mark['pt-BR'](t.enforced)} |`).join('\n')}

## Categoria C — Inglês com glosa

Termos que permanecem em inglês, com a glosa em português na primeira ocorrência
de cada documento e apenas o termo em inglês depois.

| Termo | Glosa sugerida |
|---|---|
${TERMS.gloss.map((g) => `| ${g.term} | ${g.gloss} |`).join('\n')}

## Nomes próprios

Nunca traduzidos, em nenhum contexto:

${TERMS.neverTranslate.map((n) => `\`${n}\``).join(' · ')}

## A regra que não cabe em tabela

**Sem meio-termo dentro de um documento.** Escolhido um vocabulário, ele vale do
início ao fim. O linter detecta alternância entre a forma em português e a forma
em inglês fora da janela de glosa, e falha.

Isso vale também no sentido inverso: um documento em inglês que contenha o termo
em português é rejeitado.
`;

const frontmatterEn = `---
id: i18n-terminology
title: Terminology Policy
sidebar_position: 90
description: How each technical term is handled between Portuguese and English, and which rules CI enforces.
doc_type: reference
level: 0
difficulty: beginner
status: complete
objective: >
  By the end, whoever writes or translates knows which form to use for each term
  and which decisions the linter enforces automatically.
prerequisites: []
related: []
canonical_for: []
terminology_exempt: [${exempt.map((t) => JSON.stringify(t)).join(', ')}]
translated_from_version: 1
last_reviewed: 2026-08-26
---`;

const bodyEn = `
# Terminology Policy

Inconsistent technical translation destroys architecture material. A document
that alternates between "acoplamento" and "coupling" forces the reader to
decide, at each occurrence, whether the two terms mean the same thing.

This page is **generated** from \`scripts/terminology.json\`, which is also the
source the linter uses. What is here is exactly what CI enforces.

:::info Generated automatically

Do not edit this page. Change \`scripts/terminology.json\` and run
\`npm run terminology\`.

:::

## How to read the tables

The **Rule** column indicates whether the linter enforces the decision
automatically:

- **✅ enforced** — violating it fails the build.
- **— guidance** — documented, not automated. These are the cases where the
  decision depends on context and automation would produce false positives.

A document can declare \`terminology_exempt: [term]\` in its front matter to opt
out of the rule in a justified case — a literal quotation, for example.

## Category A — Always translate

Terms with an established equivalent in technical Portuguese. The document uses
the Portuguese form as the working term.

The English form is allowed **once**, as a first-occurrence gloss:
*"acoplamento (coupling)"*. After that, only the Portuguese form.

| English | Portuguese | Rule |
|---|---|---|
${TERMS.translate.map((t) => `| ${t.en} | ${t.pt} | ${mark['en-US'](t.enforced)} |`).join('\n')}

## Category B — Keep in English

Terms where translating harms recognition or where no accepted equivalent
exists. The refused-translations column lists the forms the linter rejects.

| Term | Refused translations | Rule |
|---|---|---|
${TERMS.keep.map((t) => `| ${t.term} | ${t.badPt.length ? t.badPt.join(' · ') : '—'} | ${mark['en-US'](t.enforced)} |`).join('\n')}

## Category C — English with a gloss

Terms that stay in English, with the Portuguese gloss on the first occurrence in
each document and only the English term afterward.

| Term | Suggested gloss |
|---|---|
${TERMS.gloss.map((g) => `| ${g.term} | ${g.gloss} |`).join('\n')}

## Proper names

Never translated, in any context:

${TERMS.neverTranslate.map((n) => `\`${n}\``).join(' · ')}

## The rule that does not fit in a table

**No middle ground inside a document.** Once a vocabulary is chosen, it holds
from beginning to end. The linter detects alternation between the Portuguese
form and the English form outside the gloss window, and fails.

That holds in the inverse direction too: a document in English containing the
Portuguese term is rejected.
`;

writeFileSync(OUT_PT, `${frontmatterPt}\n${bodyPt}`);
writeFileSync(OUT_EN, `${frontmatterEn}\n${bodyEn}`);
const total = TERMS.translate.length + TERMS.keep.length + TERMS.gloss.length;
const enforced = TERMS.translate.filter((t) => t.enforced).length
  + TERMS.keep.filter((t) => t.enforced).length;
console.log(`[terminology-doc] ok — ${total} termo(s), ${enforced} aplicados pelo linter, 2 locale(s)`);
