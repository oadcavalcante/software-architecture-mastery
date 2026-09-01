#!/usr/bin/env node
/**
 * Roda todos os validadores e agrega o resultado (SPEC.md §13.1).
 *
 * Executa todos mesmo quando um falha: um PR deve receber a lista completa
 * de problemas de uma vez, não um por execução.
 */

import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';

const HERE = fileURLToPath(new URL('.', import.meta.url));

const CHECKS = [
  ['frontmatter',  'check-frontmatter.mjs'],
  ['links',        'check-links.mjs'],
  ['parity',       'check-parity.mjs'],
  ['terminology',  'check-terminology.mjs'],
  ['placeholders', 'check-placeholders.mjs'],
  ['canonical-links', 'check-canonical-links.mjs'],
];

const results = [];

for (const [name, file] of CHECKS) {
  console.log(`\n── ${name} ${'─'.repeat(Math.max(0, 60 - name.length))}`);
  const run = spawnSync(process.execPath, [join(HERE, file)], {stdio: 'inherit'});
  results.push({name, code: run.status ?? 1});
}

const failed = results.filter((r) => r.code !== 0);

console.log(`\n${'═'.repeat(64)}`);
for (const {name, code} of results) {
  console.log(`  ${code === 0 ? '✓' : '✗'}  ${name}`);
}

if (failed.length) {
  console.log(`\nvalidate: FALHOU — ${failed.length} de ${results.length} verificação(ões): ${failed.map((f) => f.name).join(', ')}`);
  process.exit(1);
}

console.log(`\nvalidate: ok — ${results.length} verificações passaram`);
