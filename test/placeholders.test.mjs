import {test, describe} from 'node:test';
import assert from 'node:assert/strict';
import {check, frontmatter} from './helpers.mjs';

const ok = (r) => assert.equal(r.code, 0, `esperava sucesso, obteve:\n${r.output}`);
const fails = (r, needle) => {
  assert.equal(r.code, 1, `esperava falha, obteve:\n${r.output}`);
  assert.match(r.output, needle);
};

const doc = (body, fm = {}) => frontmatter({id: 'exemplo', ...fm}) + '\n' + body;

/** Corpo com as duas seções obrigatórias preenchidas acima do mínimo. */
function completeBody(extra = '') {
  const prosa = 'Cada decisão fecha uma porta e abre outra, e o custo dessa troca '
    + 'precisa ser declarado com clareza suficiente para que alguém discorde dele. ';
  return `# Exemplo\n\n${prosa}\n\n`
    + `## Quando Não Usar\n\n${prosa}${prosa}\n\n`
    + `## Trade-offs\n\n${prosa}${prosa}\n\n${extra}`;
}

describe('check-placeholders', () => {
  // Regressão: /TODO/i casava com a palavra portuguesa "todo".
  // Em pt-BR isso falharia praticamente todo documento do repositório.
  test('não confunde a palavra portuguesa "todo" com o marcador TODO', () => {
    for (const frase of [
      'Todo sistema tem restrições.',
      'Isso vale para todo mundo.',
      'De todo modo, a decisão permanece.',
      'Toda arquitetura evolui.',
      'Todos os componentes falham.',
    ]) {
      ok(check('check-placeholders.mjs', {
        'docs/exemplo.md': doc(
          completeBody(`${frase}\n`),
          {status: 'complete', doc_type: 'concept'},
        ),
      }));
    }
  });

  test('detecta o marcador TODO em caixa alta', () => {
    fails(
      check('check-placeholders.mjs', {
        'docs/exemplo.md': doc(
          completeBody('TODO: terminar esta parte.\n'),
          {status: 'complete', doc_type: 'concept'},
        ),
      }),
      /contém marcador de pendência: TODO/,
    );
  });

  test('detecta frases de pendência em português', () => {
    fails(
      check('check-placeholders.mjs', {
        'docs/exemplo.md': doc(
          completeBody('Esta seção está a escrever.\n'),
          {status: 'complete', doc_type: 'concept'},
        ),
      }),
      /pendência/,
    );
  });

  test('tolera pendência em documento ainda não completo, como aviso', () => {
    const r = check('check-placeholders.mjs', {
      'docs/exemplo.md': doc('# X\n\nTODO: escrever.\n', {status: 'in-progress'}),
    });
    assert.equal(r.code, 0);
    assert.match(r.output, /aviso/);
  });

  test('exige as seções obrigatórias em concept completo', () => {
    fails(
      check('check-placeholders.mjs', {
        'docs/exemplo.md': doc(
          '# X\n\n' + 'palavra '.repeat(300) + '\n\n## Trade-offs\n\n' + 'palavra '.repeat(50),
          {status: 'complete', doc_type: 'concept'},
        ),
      }),
      /exige a seção "Quando Não Usar"/,
    );
  });

  test('rejeita seção obrigatória preenchida com texto vazio', () => {
    fails(
      check('check-placeholders.mjs', {
        'docs/exemplo.md': doc(
          '# X\n\n' + 'palavra '.repeat(300)
          + '\n\n## Quando Não Usar\n\nDepende.\n\n## Trade-offs\n\n' + 'palavra '.repeat(50),
          {status: 'complete', doc_type: 'concept'},
        ),
      }),
      /"Quando Não Usar" tem menos de 25 palavras/,
    );
  });

  test('não exige seções obrigatórias em doc_type index', () => {
    ok(check('check-placeholders.mjs', {
      'docs/01-x/index.md': frontmatter({
        id: 'x', doc_type: 'index', status: 'complete',
      }) + '\n# X\n\n' + 'palavra '.repeat(500),
    }));
  });

  test('avisa quando a densidade fica fora da faixa do doc_type', () => {
    const r = check('check-placeholders.mjs', {
      'docs/01-x/index.md': frontmatter({
        id: 'x', doc_type: 'index', status: 'complete',
      }) + '\n# X\n\n' + 'palavra '.repeat(2000),
    });
    assert.equal(r.code, 0, 'densidade é aviso, não erro');
    assert.match(r.output, /acima da faixa de "index"/);
  });

  test('rejeita seção declarada e vazia em documento completo', () => {
    fails(
      check('check-placeholders.mjs', {
        'docs/exemplo.md': doc(
          completeBody('## Alternativas\n'),
          {status: 'complete', doc_type: 'concept'},
        ),
      }),
      /seção "Alternativas" está vazia/,
    );
  });

  test('ignora marcadores dentro de blocos de código', () => {
    ok(check('check-placeholders.mjs', {
      'docs/exemplo.md': doc(
        completeBody('```js\n// TODO: exemplo ilustrativo\n```\n'),
        {status: 'complete', doc_type: 'concept'},
      ),
    }));
  });
});

describe('check-placeholders — seções obrigatórias por doc_type', () => {
  const prosa = 'Cada decisão fecha uma porta e abre outra, e o custo dessa troca '
    + 'precisa ser declarado com clareza suficiente para que alguém discorde dele. ';

  const fnd = (secoes) =>
    frontmatter({id: 'exemplo', doc_type: 'foundation', status: 'complete'})
    + `\n# X\n\n${prosa.repeat(3)}\n\n`
    + secoes.map((s) => `## ${s}\n\n${prosa.repeat(2)}\n`).join('\n');

  // Um documento definicional não tem "quando não usar" — não há o que aplicar.
  // O que ele omite é por que a distinção importa.
  test('foundation exige "Por Que Isso Importa" e "Erros Comuns"', () => {
    const r = check('check-placeholders.mjs', {
      'docs/exemplo.md': fnd(['Por Que Isso Importa', 'Erros Comuns']),
    });
    assert.equal(r.code, 0, `esperava sucesso, obteve:\n${r.output}`);
  });

  test('foundation não exige "Quando Não Usar"', () => {
    const r = check('check-placeholders.mjs', {
      'docs/exemplo.md': fnd(['Por Que Isso Importa', 'Erros Comuns', 'Alternativas']),
    });
    assert.equal(r.code, 0, `esperava sucesso, obteve:\n${r.output}`);
    assert.doesNotMatch(r.output, /Quando Não Usar/);
  });

  test('foundation sem "Por Que Isso Importa" falha', () => {
    const r = check('check-placeholders.mjs', {
      'docs/exemplo.md': fnd(['Erros Comuns']),
    });
    assert.equal(r.code, 1);
    assert.match(r.output, /exige a seção "Por Que Isso Importa"/);
  });

  test('concept segue exigindo "Quando Não Usar", não as de foundation', () => {
    const r = check('check-placeholders.mjs', {
      'docs/exemplo.md':
        frontmatter({id: 'exemplo', doc_type: 'concept', status: 'complete'})
        + `\n# X\n\n${prosa.repeat(3)}\n\n`
        + `## Por Que Isso Importa\n\n${prosa.repeat(2)}\n\n`
        + `## Erros Comuns\n\n${prosa.repeat(2)}\n`,
    });
    assert.equal(r.code, 1);
    assert.match(r.output, /exige a seção "Quando Não Usar"/);
  });

  test('reference não exige seção nenhuma', () => {
    const r = check('check-placeholders.mjs', {
      'docs/exemplo.md':
        frontmatter({id: 'exemplo', doc_type: 'reference', status: 'complete'})
        + '\n# X\n\n' + prosa.repeat(40),
    });
    assert.equal(r.code, 0, `esperava sucesso, obteve:\n${r.output}`);
  });
});
