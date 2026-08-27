/**
 * Infraestrutura dos testes de validador.
 *
 * Cada teste monta uma árvore de documentos temporária e roda o script real
 * contra ela via SAM_ROOT. Testamos os scripts como são usados — processo,
 * código de saída e saída de texto — em vez de funções internas extraídas
 * só para o teste.
 */

import {mkdtempSync, mkdirSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, dirname} from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const SCRIPTS = fileURLToPath(new URL('../scripts/', import.meta.url));

/** Front matter mínimo válido de um documento canônico. */
export function frontmatter(overrides = {}) {
  const fm = {
    id: 'exemplo',
    title: 'Exemplo',
    description: 'Documento de teste.',
    doc_type: 'concept',
    level: 1,
    difficulty: 'iniciante',
    status: 'in-progress',
    objective: 'Testar.',
    content_version: 1,
    ...overrides,
  };
  const lines = Object.entries(fm)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? `[${v.join(', ')}]` : v}`);
  return `---\n${lines.join('\n')}\n---\n`;
}

/**
 * Monta uma árvore temporária.
 * `files` mapeia caminho relativo à raiz → conteúdo.
 */
export function fixture(files) {
  const root = mkdtempSync(join(tmpdir(), 'sam-test-'));
  for (const [rel, content] of Object.entries(files)) {
    const abs = join(root, rel);
    mkdirSync(dirname(abs), {recursive: true});
    writeFileSync(abs, content);
  }
  return {
    root,
    cleanup: () => rmSync(root, {recursive: true, force: true}),
  };
}

/** Roda um validador contra a árvore e devolve código de saída e saída. */
export function run(script, root) {
  const result = spawnSync(process.execPath, [join(SCRIPTS, script)], {
    env: {...process.env, SAM_ROOT: root, BASE_REF: '__inexistente__'},
    encoding: 'utf8',
  });
  return {
    code: result.status,
    output: `${result.stdout ?? ''}${result.stderr ?? ''}`,
  };
}

/** Roda um validador contra uma árvore descartável, garantindo limpeza. */
export function check(script, files) {
  const fx = fixture(files);
  try {
    return run(script, fx.root);
  } finally {
    fx.cleanup();
  }
}
