import {test, describe} from 'node:test';
import assert from 'node:assert/strict';
import {check, frontmatter} from './helpers.mjs';

const ok = (r) => assert.equal(r.code, 0, `esperava sucesso, obteve:\n${r.output}`);
const fails = (r, needle) => {
  assert.equal(r.code, 1, `esperava falha, obteve:\n${r.output}`);
  assert.match(r.output, needle);
};

const doc = (body, fm = {}) => frontmatter({id: 'exemplo', ...fm}) + '\n' + body;

describe('check-terminology', () => {
  test('aceita texto que usa o termo em português', () => {
    ok(check('check-terminology.mjs', {
      'docs/exemplo.md': doc('# X\n\nO acoplamento entre os módulos é alto.\n'),
    }));
  });

  test('rejeita o termo inglês usado como termo de trabalho', () => {
    fails(
      check('check-terminology.mjs', {
        'docs/exemplo.md': doc('# X\n\nO coupling entre os módulos é alto.\n'),
      }),
      /usa "coupling".*e nunca "acoplamento"/,
    );
  });

  test('aceita glosa de primeira ocorrência', () => {
    ok(check('check-terminology.mjs', {
      'docs/exemplo.md': doc('# X\n\nO acoplamento (coupling) entre módulos é alto.\n'),
    }));
  });

  test('rejeita alternância entre as duas formas ao longo do texto', () => {
    const body = '# X\n\nO acoplamento importa.\n\n'
      + 'A'.repeat(200)
      + '\n\nMas o coupling também importa muito aqui.\n';
    fails(
      check('check-terminology.mjs', {'docs/exemplo.md': doc(body)}),
      /alterna entre "acoplamento" e "coupling"/,
    );
  });

  test('rejeita tradução de termo da categoria B', () => {
    fails(
      check('check-terminology.mjs', {
        'docs/exemplo.md': doc('# X\n\nUm contexto delimitado por domínio.\n'),
      }),
      /traduz "bounded context" como "contexto delimitado"/,
    );
  });

  // Regressão: "anti-corruption layer" contém "layer", que é categoria A.
  // Sem mascarar termos compostos, a regra layer→camada disparava dentro
  // de um termo que deve permanecer em inglês.
  test('não dispara regra de palavra contida em termo composto protegido', () => {
    ok(check('check-terminology.mjs', {
      'docs/exemplo.md': doc('# X\n\nUse um anti-corruption layer na fronteira.\n'),
    }));
  });

  // Regressão: markdown quebra linha no meio de termos compostos. Um espaço
  // literal no regex não casava com "\n", e a máscara falhava.
  test('reconhece termo composto quebrado por fim de linha', () => {
    ok(check('check-terminology.mjs', {
      'docs/exemplo.md': doc('# X\n\nUse um anti-corruption\nlayer na fronteira.\n'),
    }));
    ok(check('check-terminology.mjs', {
      'docs/exemplo.md': doc('# X\n\nAdote consistência\neventual aqui.\n'),
    }));
  });

  test('ignora ocorrências dentro de blocos de código', () => {
    ok(check('check-terminology.mjs', {
      'docs/exemplo.md': doc('# X\n\n```js\nconst coupling = 1;\n```\n'),
    }));
  });

  test('ignora ocorrências em código inline', () => {
    ok(check('check-terminology.mjs', {
      'docs/exemplo.md': doc('# X\n\nO campo `coupling` do payload.\n'),
    }));
  });

  test('respeita terminology_exempt', () => {
    ok(check('check-terminology.mjs', {
      'docs/exemplo.md': doc('# X\n\nO coupling aqui é citação literal.\n', {
        terminology_exempt: ['coupling'],
      }),
    }));
  });

  test('rejeita termo em português vazando para documento en-US', () => {
    fails(
      check('check-terminology.mjs', {
        'docs/exemplo.md': doc('# X\n\nO acoplamento importa.\n'),
        'i18n/en-US/docusaurus-plugin-content-docs/current/exemplo.md':
          frontmatter({id: 'exemplo', content_version: undefined, translated_from_version: 1})
          + '\n# X\n\nThe acoplamento matters here.\n',
      }),
      /contém o termo em português "acoplamento"/,
    );
  });
});
