import {test, describe} from 'node:test';
import assert from 'node:assert/strict';
import {check, frontmatter} from './helpers.mjs';

const ok = (r) => assert.equal(r.code, 0, `esperava sucesso, obteve:\n${r.output}`);
const fails = (r, needle) => {
  assert.equal(r.code, 1, `esperava falha, obteve:\n${r.output}`);
  assert.match(r.output, needle);
};

describe('check-frontmatter', () => {
  test('aceita um documento válido', () => {
    ok(check('check-frontmatter.mjs', {
      'docs/exemplo.md': frontmatter() + '\n# Exemplo\n',
    }));
  });

  test('exige os campos obrigatórios', () => {
    const fm = frontmatter();
    fails(
      check('check-frontmatter.mjs', {
        'docs/exemplo.md': fm.replace(/^objective:.*$/m, '') + '\n# Exemplo\n',
      }),
      /campo obrigatório ausente: objective/,
    );
  });

  test('rejeita doc_type, difficulty, status e level fora do domínio', () => {
    for (const [campo, valor, padrao] of [
      ['doc_type', 'inventado', /doc_type inválido/],
      ['difficulty', 'medio', /difficulty inválido/],
      ['status', 'quase', /status inválido/],
      ['level', 42, /level deve ser inteiro de 0 a 7/],
    ]) {
      fails(
        check('check-frontmatter.mjs', {
          'docs/exemplo.md': frontmatter({[campo]: valor}) + '\n# X\n',
        }),
        padrao,
      );
    }
  });

  // Regressão: YAML converte 2026-08-26 sem aspas em Date, não em string.
  // A primeira versão do validador rejeitava toda data não citada.
  test('aceita last_reviewed como Date do YAML e como string', () => {
    ok(check('check-frontmatter.mjs', {
      'docs/exemplo.md': frontmatter({last_reviewed: '2026-08-26'}) + '\n# X\n',
    }));
    ok(check('check-frontmatter.mjs', {
      'docs/exemplo.md': frontmatter({last_reviewed: '"2026-08-26"'}) + '\n# X\n',
    }));
  });

  test('rejeita last_reviewed em formato não ISO', () => {
    fails(
      check('check-frontmatter.mjs', {
        'docs/exemplo.md': frontmatter({last_reviewed: '"26/08/2026"'}) + '\n# X\n',
      }),
      /last_reviewed deve ser uma data AAAA-MM-DD/,
    );
  });

  test('exige que o id case com o nome do arquivo', () => {
    fails(
      check('check-frontmatter.mjs', {
        'docs/exemplo.md': frontmatter({id: 'outro'}) + '\n# X\n',
      }),
      /id "outro" diverge do esperado "exemplo"/,
    );
  });

  // Regressão: 23 arquivos index.md colidiriam todos em id "index".
  // O id de um índice vem do diretório, sem o prefixo numérico.
  test('deriva o id de um índice do diretório, sem prefixo numérico', () => {
    ok(check('check-frontmatter.mjs', {
      'docs/01-fundamentals/index.md':
        frontmatter({id: 'fundamentals', doc_type: 'index'}) + '\n# X\n',
    }));
    fails(
      check('check-frontmatter.mjs', {
        'docs/01-fundamentals/index.md':
          frontmatter({id: 'index', doc_type: 'index'}) + '\n# X\n',
      }),
      /id "index" diverge do esperado "fundamentals"/,
    );
  });

  test('não permite dois índices com o mesmo id', () => {
    fails(
      check('check-frontmatter.mjs', {
        'docs/a.md': frontmatter({id: 'a'}) + '\n# A\n',
        'docs/sub/a.md': frontmatter({id: 'a'}) + '\n# A\n',
      }),
      /id duplicado "a"/,
    );
  });

  test('rejeita canonical_for reivindicado por dois documentos', () => {
    fails(
      check('check-frontmatter.mjs', {
        'docs/a.md': frontmatter({id: 'a', canonical_for: ['acoplamento']}) + '\n# A\n',
        'docs/b.md': frontmatter({id: 'b', canonical_for: ['Acoplamento']}) + '\n# B\n',
      }),
      /canonical_for "Acoplamento" já reivindicado/,
    );
  });

  test('rejeita referência a id inexistente', () => {
    fails(
      check('check-frontmatter.mjs', {
        'docs/a.md': frontmatter({id: 'a', prerequisites: ['fantasma']}) + '\n# A\n',
      }),
      /prerequisites aponta para id inexistente: "fantasma"/,
    );
  });

  test('detecta ciclo no grafo de pré-requisitos', () => {
    fails(
      check('check-frontmatter.mjs', {
        'docs/a.md': frontmatter({id: 'a', prerequisites: ['b']}) + '\n# A\n',
        'docs/b.md': frontmatter({id: 'b', prerequisites: ['c']}) + '\n# B\n',
        'docs/c.md': frontmatter({id: 'c', prerequisites: ['a']}) + '\n# C\n',
      }),
      /ciclo no grafo de pré-requisitos/,
    );
  });

  test('aceita um DAG com losango', () => {
    ok(check('check-frontmatter.mjs', {
      'docs/a.md': frontmatter({id: 'a', prerequisites: ['b', 'c']}) + '\n# A\n',
      'docs/b.md': frontmatter({id: 'b', prerequisites: ['d']}) + '\n# B\n',
      'docs/c.md': frontmatter({id: 'c', prerequisites: ['d']}) + '\n# C\n',
      'docs/d.md': frontmatter({id: 'd'}) + '\n# D\n',
    }));
  });

  test('separa content_version de translated_from_version por locale', () => {
    fails(
      check('check-frontmatter.mjs', {
        'docs/a.md': frontmatter({id: 'a', translated_from_version: 2}) + '\n# A\n',
      }),
      /documento canônico não deve ter translated_from_version/,
    );
  });
});

describe('check-frontmatter — prerequisites vs. related', () => {
  const ok = (r) => assert.equal(r.code, 0, `esperava sucesso, obteve:\n${r.output}`);
  const fails = (r, needle) => {
    assert.equal(r.code, 1, `esperava falha, obteve:\n${r.output}`);
    assert.match(r.output, needle);
  };

  // `related` é metadado, não vira link renderizado. Apontar para um tópico já
  // previsto no currículo registra a relação sem quebrar nada.
  test('related aceita tópico previsto no currículo, ainda não escrito', () => {
    ok(check('check-frontmatter.mjs', {
      'docs/a.md': frontmatter({id: 'a', related: ['idempotency', 'circuit-breakers']}) + '\n# A\n',
    }));
  });

  test('related rejeita id que não existe nem está previsto', () => {
    fails(
      check('check-frontmatter.mjs', {
        'docs/a.md': frontmatter({id: 'a', related: ['coisa-inventada']}) + '\n# A\n',
      }),
      /related aponta para id que não existe nem está previsto/,
    );
  });

  // `prerequisites` significa "leia isto antes" — o documento precisa existir,
  // mesmo que esteja previsto.
  test('prerequisites exige que o documento já exista, mesmo se previsto', () => {
    fails(
      check('check-frontmatter.mjs', {
        'docs/a.md': frontmatter({id: 'a', prerequisites: ['idempotency']}) + '\n# A\n',
      }),
      /previsto mas ainda não foi escrito/,
    );
  });

  test('prerequisites aceita documento existente', () => {
    ok(check('check-frontmatter.mjs', {
      'docs/a.md': frontmatter({id: 'a', prerequisites: ['b']}) + '\n# A\n',
      'docs/b.md': frontmatter({id: 'b'}) + '\n# B\n',
    }));
  });
});
