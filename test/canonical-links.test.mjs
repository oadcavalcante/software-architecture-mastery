import {test, describe} from 'node:test';
import assert from 'node:assert/strict';
import {check, frontmatter} from './helpers.mjs';

const ok = (r) => assert.equal(r.code, 0, `esperava sucesso, obteve:\n${r.output}`);
const fails = (r, needle) => {
  assert.equal(r.code, 1, `esperava falha, obteve:\n${r.output}`);
  assert.match(r.output, needle);
};

const doc = (body, fm = {}) => frontmatter(fm) + '\n' + body;

/**
 * Uma seção com índice e um documento canônico de um termo.
 * O índice se chama "Confiabilidade"; `circuit-breakers` responde por
 * "circuit breaker".
 */
const secao = {
  'docs/12-reliability/index.md': doc('# Confiabilidade\n\nÍndice.\n', {
    id: 'reliability-index',
    title: 'Confiabilidade',
    doc_type: 'index',
  }),
  'docs/12-reliability/circuit-breakers.md': doc('# Circuit Breakers\n\nTexto.\n', {
    id: 'circuit-breakers',
    title: 'Circuit Breakers',
    canonical_for: ['circuit breaker', 'disjuntor'],
  }),
};

describe('check-canonical-links', () => {
  test('rejeita link ao índice quando o texto é termo canônico da seção', () => {
    fails(
      check('check-canonical-links.mjs', {
        ...secao,
        'docs/exemplo.md': doc('# X\n\nUse um [circuit breaker](/12-reliability/index.md).\n'),
      }),
      /circuit breaker.*documento canônico do termo é \/12-reliability\/circuit-breakers\.md/s,
    );
  });

  test('aceita o link quando ele já aponta para o canônico', () => {
    ok(
      check('check-canonical-links.mjs', {
        ...secao,
        'docs/exemplo.md': doc(
          '# X\n\nUse um [circuit breaker](/12-reliability/circuit-breakers.md).\n',
        ),
      }),
    );
  });

  // O texto se refere à seção, não ao conceito: o índice é o destino certo,
  // mesmo que "confiabilidade" seja termo canônico de algum documento dela.
  test('aceita link ao índice cujo texto nomeia a própria seção', () => {
    ok(
      check('check-canonical-links.mjs', {
        ...secao,
        'docs/12-reliability/slo.md': doc('# SLO\n\nTexto.\n', {
          id: 'slo',
          title: 'SLO',
          canonical_for: ['confiabilidade'],
        }),
        'docs/exemplo.md': doc('# X\n\nVer [Confiabilidade](/12-reliability/index.md).\n'),
      }),
    );
  });

  test('ignora caixa, acento e pontuação ao casar o termo', () => {
    fails(
      check('check-canonical-links.mjs', {
        ...secao,
        'docs/exemplo.md': doc('# X\n\nO [Disjuntor](/12-reliability/index.md) abre.\n'),
      }),
      /documento canônico do termo é \/12-reliability\/circuit-breakers\.md/,
    );
  });

  // O termo pertence a outra seção; o índice linkado não o contém, então
  // apontar para lá não é a violação que esta regra descreve.
  test('não acusa quando o canônico está em outra seção', () => {
    ok(
      check('check-canonical-links.mjs', {
        ...secao,
        'docs/06-distributed-systems/index.md': doc('# Sistemas Distribuídos\n\nÍndice.\n', {
          id: 'distributed-index',
          title: 'Sistemas Distribuídos',
          doc_type: 'index',
        }),
        'docs/exemplo.md': doc('# X\n\nVer [circuit breaker](/06-distributed-systems/index.md).\n'),
      }),
    );
  });

  test('não olha dentro de bloco de código', () => {
    ok(
      check('check-canonical-links.mjs', {
        ...secao,
        'docs/exemplo.md': doc(
          '# X\n\n```text\n[circuit breaker](/12-reliability/index.md)\n```\n',
        ),
      }),
    );
  });

  // O casamento era por forma exata, e o plural passava batido: vinte links
  // do acervo sobreviveram a uma passagem do validador por estarem no plural.
  test('pega o plural simples do termo canônico', () => {
    fails(
      check('check-canonical-links.mjs', {
        ...secao,
        'docs/12-reliability/exemplo.md': doc(
          '# X\n\nUse [circuit breakers](/12-reliability/index.md).\n',
          {id: 'exemplo-plural'},
        ),
      }),
      /circuit breakers.*circuit-breakers\.md/s,
    );
  });

  test('pega plural em -ões do termo canônico', () => {
    fails(
      check('check-canonical-links.mjs', {
        'docs/03-design-patterns/index.md': doc('# Padrões\n\nÍndice.\n', {
          id: 'design-patterns-index',
          title: 'Padrões de Projeto',
          doc_type: 'index',
        }),
        'docs/03-design-patterns/padrao.md': doc('# Padrão\n\nTexto.\n', {
          id: 'padrao',
          title: 'Padrão',
          canonical_for: ['padrão'],
        }),
        'docs/03-design-patterns/exemplo.md': doc(
          '# X\n\nVer [padrões](/03-design-patterns/index.md).\n',
          {id: 'exemplo-oes'},
        ),
      }),
      /padrões.*padrao\.md/s,
    );
  });

  // Despluralizar não pode inventar um termo: se nenhuma variante é
  // `canonical_for` de um documento da seção, não há achado.
  test('não inventa termo ao despluralizar', () => {
    ok(
      check('check-canonical-links.mjs', {
        ...secao,
        'docs/12-reliability/exemplo.md': doc(
          '# X\n\nVer [as reliabilities](/12-reliability/index.md).\n',
          {id: 'exemplo-nao-existe'},
        ),
      }),
    );
  });

  // A tradução não declara `canonical_for`; a verificação é sobre o canônico,
  // que é de onde a estrutura de link é herdada.
  test('não avalia documentos traduzidos', () => {
    ok(
      check('check-canonical-links.mjs', {
        ...secao,
        'i18n/en-US/docusaurus-plugin-content-docs/current/exemplo.md': doc(
          '# X\n\nUse a [circuit breaker](/12-reliability/index.md).\n',
          {canonical_for: [], translated_from_version: 1, content_version: undefined},
        ),
      }),
    );
  });
});
