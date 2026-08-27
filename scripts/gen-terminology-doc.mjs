#!/usr/bin/env node
/**
 * Gera docs/i18n-terminology.md a partir de scripts/terminology.json.
 *
 * A tabela publicada e a regra aplicada pelo linter saem da mesma fonte.
 * Mantê-las separadas garantiria divergência entre o que o documento promete
 * e o que o CI cobra.
 */

import {readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {ROOT} from './lib/docs.mjs';

const TERMS = JSON.parse(
  readFileSync(fileURLToPath(new URL('./terminology.json', import.meta.url)), 'utf8'),
);
const OUT = join(ROOT, 'docs', 'i18n-terminology.md');

const mark = (enforced) => (enforced ? '✅ aplicado' : '— orientação');

/**
 * Este documento cita, por definição, as duas formas de cada termo. Sem isenção
 * ele violaria a própria política que publica. A lista é derivada dos termos,
 * não mantida à mão, para não defasar.
 */
const exempt = [
  ...TERMS.translate.map((t) => t.en),
  ...TERMS.keep.map((t) => t.term),
].sort();

const frontmatter = `---
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

const body = `
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
${TERMS.translate.map((t) => `| ${t.en} | ${t.pt} | ${mark(t.enforced)} |`).join('\n')}

## Categoria B — Manter em inglês

Termos em que traduzir prejudica o reconhecimento ou não há equivalente aceito.
A coluna de traduções recusadas lista as formas que o linter rejeita.

| Termo | Traduções recusadas | Regra |
|---|---|---|
${TERMS.keep.map((t) => `| ${t.term} | ${t.badPt.length ? t.badPt.join(' · ') : '—'} | ${mark(t.enforced)} |`).join('\n')}

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

writeFileSync(OUT, `${frontmatter}\n${body}`);
const total = TERMS.translate.length + TERMS.keep.length + TERMS.gloss.length;
const enforced = TERMS.translate.filter((t) => t.enforced).length
  + TERMS.keep.filter((t) => t.enforced).length;
console.log(`[terminology-doc] ok — ${total} termo(s), ${enforced} aplicados pelo linter`);
