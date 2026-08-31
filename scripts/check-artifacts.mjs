#!/usr/bin/env node
/**
 * Verifica se os artefatos derivados estão em dia com o estado real dos docs.
 *
 * ROADMAP, READMEs, fix_plan e specs/ são gerados a partir de curriculum.json e
 * do que existe em disco (SPEC.md §12). Commitá-los defasados publica um número
 * errado — e a tradução progressiva muda esse número a cada lote, então a
 * defasagem não é um acidente raro, é o caso comum.
 *
 * A Política Terminológica entra pela mesma razão, e por um motivo pior: ela é
 * gerada de terminology.json, que é a fonte que o linter usa. Defasada, ela
 * publica uma regra que o CI não cobra — foi o que aconteceu com "fragmentação",
 * removida da fonte e mantida na tabela publicada por não haver esta checagem.
 *
 * A pergunta é "rodar os geradores muda alguma coisa?", e não "o working tree
 * está limpo?". A diferença importa porque os READMEs são metade gerados
 * (dentro dos marcadores) e metade escritos à mão: comparar contra o git
 * acusaria toda edição manual não commitada como defasagem. Por isso o conteúdo
 * é lido antes, os geradores rodam, e a comparação é antes/depois.
 */

import {execFileSync} from 'node:child_process';
import {readFileSync, existsSync, readdirSync} from 'node:fs';
import {join} from 'node:path';
import {ROOT} from './lib/docs.mjs';

const ARQUIVOS = [
  'ROADMAP.md',
  'README.md',
  'README.en-US.md',
  'fix_plan.md',
  'docs/i18n-terminology.md',
  'i18n/en-US/docusaurus-plugin-content-docs/current/i18n-terminology.md',
];
const DIRS = ['specs'];

/** Mapa caminho → conteúdo, com `null` para o que ainda não existe. */
function instantaneo() {
  const mapa = new Map();
  const ler = (rel) => {
    const abs = join(ROOT, rel);
    mapa.set(rel, existsSync(abs) ? readFileSync(abs, 'utf8') : null);
  };
  for (const arquivo of ARQUIVOS) ler(arquivo);
  for (const dir of DIRS) {
    const abs = join(ROOT, dir);
    if (!existsSync(abs)) continue;
    for (const nome of readdirSync(abs)) ler(`${dir}/${nome}`);
  }
  return mapa;
}

const antes = instantaneo();

for (const script of ['gen-roadmap.mjs', 'gen-plan.mjs', 'gen-terminology-doc.mjs']) {
  execFileSync(process.execPath, [`scripts/${script}`], {cwd: ROOT, stdio: 'pipe'});
}

const depois = instantaneo();

const mudados = [...new Set([...antes.keys(), ...depois.keys()])]
  .filter((rel) => (antes.get(rel) ?? null) !== (depois.get(rel) ?? null))
  .sort();

if (mudados.length === 0) {
  console.log('[artifacts] ok — artefatos derivados em dia');
  process.exit(0);
}

console.error('[artifacts] FALHOU — os geradores mudaram estes arquivos:');
for (const rel of mudados) {
  console.error(`  ${antes.get(rel) === null ? 'novo' : 'defasado'}  ${rel}`);
}
console.error('\nJá foram regerados aqui. Confira o diff e faça commit.');
process.exit(1);
