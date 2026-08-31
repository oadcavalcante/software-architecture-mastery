#!/usr/bin/env node
/**
 * Verifica se os artefatos derivados estão em dia com o estado real dos docs.
 *
 * ROADMAP, READMEs, fix_plan e specs/ são gerados a partir de curriculum.json e
 * do que existe em disco (SPEC.md §12). Commitá-los defasados publica um número
 * errado — e a tradução progressiva muda esse número a cada lote, então a
 * defasagem não é um acidente raro, é o caso comum.
 *
 * Existia só como passo inline do CI, o que fazia a falha aparecer depois do
 * push em vez de antes. Aqui roda igual nos dois lugares.
 */

import {execFileSync} from 'node:child_process';
import {ROOT} from './lib/docs.mjs';

const GERADOS = ['ROADMAP.md', 'README.md', 'README.en-US.md', 'fix_plan.md', 'specs/'];

const git = (...args) =>
  execFileSync('git', args, {cwd: ROOT, encoding: 'utf8'});

for (const script of ['gen-roadmap.mjs', 'gen-plan.mjs']) {
  execFileSync(process.execPath, [`scripts/${script}`], {cwd: ROOT, stdio: 'pipe'});
}

// --porcelain em vez de diff porque uma spec NOVA é untracked, e `git diff`
// não a enxergaria — seção acrescentada ao curriculum ficaria fora do gate.
const sujos = git('status', '--porcelain', '--', ...GERADOS)
  .split('\n')
  .map((l) => l.slice(3).trim())
  .filter(Boolean);

if (sujos.length === 0) {
  console.log('[artifacts] ok — artefatos derivados em dia');
  process.exit(0);
}

console.error('[artifacts] FALHOU — artefatos derivados defasados:');
for (const arquivo of sujos) console.error(`  ${arquivo}`);
console.error('\nOs arquivos já foram regerados aqui. Confira o diff e faça commit.');
process.exit(1);
