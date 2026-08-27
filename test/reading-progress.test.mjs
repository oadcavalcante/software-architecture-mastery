/**
 * Progresso de leitura — SPEC.md §10.1.
 *
 * O módulo é importado com `globalThis.window` já montado, porque ele decide
 * uma vez se está no navegador. Cada teste roda num processo próprio via
 * `node --test`, então basta montar o duplo antes do `import` dinâmico.
 */

import {test, describe, beforeEach} from 'node:test';
import assert from 'node:assert/strict';

/** Duplo de `localStorage`, com modo de falha — navegação privada lança. */
function fakeStorage({throwOnGet = false, throwOnSet = false} = {}) {
  const map = new Map();
  return {
    map,
    getItem(k) {
      if (throwOnGet) throw new DOMExceptionLike('SecurityError');
      return map.has(k) ? map.get(k) : null;
    },
    setItem(k, v) {
      if (throwOnSet) throw new DOMExceptionLike('QuotaExceededError');
      map.set(k, String(v));
    },
    removeItem(k) {
      map.delete(k);
    },
  };
}

class DOMExceptionLike extends Error {}

const KEY = 'sam:reading-progress';

async function load(storage) {
  globalThis.window = {
    localStorage: storage,
    addEventListener() {},
    removeEventListener() {},
  };
  // Cache-buster: cada carga precisa reavaliar o módulo com o window atual.
  const mod = await import(`../src/lib/readingProgress.ts?t=${Math.random()}`);
  return mod;
}

describe('progresso de leitura — armazenamento', () => {
  let storage;

  beforeEach(() => {
    storage = fakeStorage();
  });

  test('marca e desmarca um documento', async () => {
    const p = await load(storage);
    assert.equal(p.isRead('distributed-systems/idempotency'), false);

    p.setRead('distributed-systems/idempotency', true);
    assert.equal(p.isRead('distributed-systems/idempotency'), true);

    p.setRead('distributed-systems/idempotency', false);
    assert.equal(p.isRead('distributed-systems/idempotency'), false);
  });

  test('toggleRead devolve o novo estado', async () => {
    const p = await load(storage);
    assert.equal(p.toggleRead('a'), true);
    assert.equal(p.toggleRead('a'), false);
  });

  test('conta apenas os ids pedidos', async () => {
    const p = await load(storage);
    p.setManyRead(['a', 'b', 'c'], true);
    assert.equal(p.countRead(['a', 'b']), 2);
    assert.equal(p.countRead(['a', 'x']), 1);
    assert.equal(p.countRead(['x', 'y']), 0);
  });

  test('setManyRead marca e desmarca em lote', async () => {
    const p = await load(storage);
    p.setManyRead(['a', 'b'], true);
    assert.equal(p.countRead(['a', 'b']), 2);
    p.setManyRead(['a', 'b'], false);
    assert.equal(p.countRead(['a', 'b']), 0);
  });

  test('grava o instante da marcação, não apenas um booleano', async () => {
    const p = await load(storage);
    const before = Date.now();
    p.setRead('a', true);
    const saved = JSON.parse(storage.map.get(KEY));
    assert.ok(saved.read.a >= before, 'esperava epoch ms da marcação');
  });

  test('persiste com versão de esquema', async () => {
    const p = await load(storage);
    p.setRead('a', true);
    assert.equal(JSON.parse(storage.map.get(KEY)).version, 1);
  });

  // Sem isto, uma mudança futura de formato apagaria o progresso do leitor em
  // vez de migrá-lo — e ele não teria como saber.
  test('descarta payload de versão desconhecida em vez de quebrar', async () => {
    storage.map.set(KEY, JSON.stringify({version: 99, read: {a: 1}}));
    const p = await load(storage);
    assert.equal(p.isRead('a'), false);
  });

  test('ignora conteúdo corrompido', async () => {
    storage.map.set(KEY, 'isto não é json');
    const p = await load(storage);
    assert.equal(p.isRead('a'), false);
    // E continua utilizável depois.
    p.setRead('a', true);
    assert.equal(p.isRead('a'), true);
  });

  test('descarta entradas de forma inválida dentro de um payload válido', async () => {
    storage.map.set(
      KEY,
      JSON.stringify({version: 1, read: {bom: 123, ruim: 'ontem', vazio: null}}),
    );
    const p = await load(storage);
    assert.equal(p.isRead('bom'), true);
    assert.equal(p.isRead('ruim'), false);
    assert.equal(p.isRead('vazio'), false);
  });

  // Navegação privada e bloqueio de dados de site fazem o acesso lançar. O pior
  // caso aceitável é tudo aparecer desmarcado — nunca uma tela quebrada.
  test('sobrevive a localStorage que lança na leitura', async () => {
    const p = await load(fakeStorage({throwOnGet: true}));
    assert.equal(p.isRead('a'), false);
    assert.equal(p.countRead(['a', 'b']), 0);
  });

  test('sobrevive a localStorage que lança na escrita', async () => {
    const p = await load(fakeStorage({throwOnSet: true}));
    assert.doesNotThrow(() => p.setRead('a', true));
  });

  test('clearAll zera o progresso', async () => {
    const p = await load(storage);
    p.setManyRead(['a', 'b'], true);
    p.clearAll();
    assert.equal(p.countRead(['a', 'b']), 0);
  });
});

describe('progresso de leitura — notificação', () => {
  test('notifica assinantes na marcação', async () => {
    const p = await load(fakeStorage());
    let calls = 0;
    const unsubscribe = p.subscribe(() => {
      calls += 1;
    });

    p.setRead('a', true);
    assert.equal(calls, 1);

    // Marcar o que já está marcado não deve notificar — evita render inútil.
    p.setRead('a', true);
    assert.equal(calls, 1);

    unsubscribe();
    p.setRead('b', true);
    assert.equal(calls, 1, 'não deve notificar depois de cancelar a assinatura');
  });

  test('setManyRead notifica uma vez, não uma por id', async () => {
    const p = await load(fakeStorage());
    let calls = 0;
    p.subscribe(() => {
      calls += 1;
    });
    p.setManyRead(['a', 'b', 'c'], true);
    assert.equal(calls, 1);
  });
});

describe('progresso de leitura — exportar e importar', () => {
  test('exporta o que foi lido', async () => {
    const p = await load(fakeStorage());
    p.setManyRead(['a', 'b'], true);
    const dump = JSON.parse(p.exportProgress());
    assert.equal(dump.version, 1);
    assert.deepEqual(Object.keys(dump.read).sort(), ['a', 'b']);
  });

  test('importar une ao existente, sem apagar', async () => {
    const p = await load(fakeStorage());
    p.setRead('a', true);

    const added = p.importProgress(JSON.stringify({version: 1, read: {b: 1, c: 2}}));
    assert.equal(added, 2);
    assert.equal(p.countRead(['a', 'b', 'c']), 3);
  });

  test('importar não conta o que já estava marcado', async () => {
    const p = await load(fakeStorage());
    p.setRead('a', true);
    assert.equal(p.importProgress(JSON.stringify({version: 1, read: {a: 1, b: 2}})), 1);
  });

  test('importar recusa conteúdo inválido', async () => {
    const p = await load(fakeStorage());
    assert.equal(p.importProgress('nada disso'), null);
    assert.equal(p.importProgress(JSON.stringify({version: 1, read: {}})), null);
    assert.equal(p.importProgress(JSON.stringify({version: 99, read: {a: 1}})), null);
  });
});

describe('progresso de leitura — fora do navegador', () => {
  // O Docusaurus pré-renderiza no build, onde não existe `window`. Nenhuma
  // função pode lançar ali, ou o build inteiro cai.
  test('não lança sem window e responde como vazio', async () => {
    delete globalThis.window;
    const p = await import(`../src/lib/readingProgress.ts?t=${Math.random()}`);

    assert.equal(p.isRead('a'), false);
    assert.equal(p.countRead(['a', 'b']), 0);
    assert.doesNotThrow(() => p.setRead('a', true));
    assert.doesNotThrow(() => p.clearAll());
    assert.equal(p.exportProgress(), JSON.stringify({version: 1, read: {}}, null, 2));
  });
});
