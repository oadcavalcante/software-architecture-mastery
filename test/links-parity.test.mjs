import {test, describe} from 'node:test';
import assert from 'node:assert/strict';
import {check, frontmatter} from './helpers.mjs';

const ok = (r) => assert.equal(r.code, 0, `esperava sucesso, obteve:\n${r.output}`);
const fails = (r, needle) => {
  assert.equal(r.code, 1, `esperava falha, obteve:\n${r.output}`);
  assert.match(r.output, needle);
};

const doc = (body, fm = {}) => frontmatter({id: 'exemplo', ...fm}) + '\n' + body;
const translated = (id, version, body) =>
  frontmatter({id, content_version: undefined, translated_from_version: version}) + '\n' + body;

describe('check-links', () => {
  test('aceita link relativo para arquivo existente', () => {
    ok(check('check-links.mjs', {
      'docs/a.md': frontmatter({id: 'a'}) + '\n# A\n\nVeja [B](./b.md).\n',
      'docs/b.md': frontmatter({id: 'b'}) + '\n# B\n',
    }));
  });

  test('rejeita link para arquivo inexistente', () => {
    fails(
      check('check-links.mjs', {'docs/a.md': frontmatter({id: 'a'}) + '\n# A\n\n[X](./x.md)\n'}),
      /link para arquivo inexistente: \.\/x\.md/,
    );
  });

  test('resolve âncora no próprio documento, com acento', () => {
    ok(check('check-links.mjs', {
      'docs/a.md': frontmatter({id: 'a'})
        + '\n# A\n\nVeja [isto](#decisão-de-exemplo).\n\n## Decisão de Exemplo\n\nTexto.\n',
    }));
  });

  test('rejeita âncora inexistente', () => {
    fails(
      check('check-links.mjs', {
        'docs/a.md': frontmatter({id: 'a'}) + '\n# A\n\n[x](#nao-existe)\n\n## Outra\n',
      }),
      /âncora inexistente no próprio documento/,
    );
  });

  test('valida âncora em outro documento', () => {
    fails(
      check('check-links.mjs', {
        'docs/a.md': frontmatter({id: 'a'}) + '\n# A\n\n[b](./b.md#fantasma)\n',
        'docs/b.md': frontmatter({id: 'b'}) + '\n# B\n\n## Real\n',
      }),
      /âncora inexistente em \.\/b\.md/,
    );
  });

  test('ignora links dentro de blocos de código', () => {
    ok(check('check-links.mjs', {
      'docs/a.md': frontmatter({id: 'a'}) + '\n# A\n\n```md\n[x](./inexistente.md)\n```\n',
    }));
  });

  test('aceita âncora explícita {#id}', () => {
    ok(check('check-links.mjs', {
      'docs/a.md': frontmatter({id: 'a'})
        + '\n# A\n\n[x](#custom)\n\n## Título Longo {#custom}\n\nTexto.\n',
    }));
  });

  // Autolink compila em Markdown puro e quebra em MDX, que é o que o Docusaurus
  // usa. Sem esta regra o erro só aparecia no build, com os gates já verdes.
  test('rejeita autolink de URL, que quebra a compilação MDX', () => {
    fails(
      check('check-links.mjs', {
        'docs/exemplo.md': doc('# X\n\nVeja <https://exemplo.com/guia> para detalhes.\n'),
      }),
      /autolink .* quebra a compilação MDX/,
    );
  });

  test('aceita a mesma URL como link markdown', () => {
    ok(check('check-links.mjs', {
      'docs/exemplo.md': doc('# X\n\nVeja [o guia](https://exemplo.com/guia) para detalhes.\n'),
    }));
  });

  test('ignora autolink dentro de bloco de código', () => {
    ok(check('check-links.mjs', {
      'docs/exemplo.md': doc('# X\n\n```text\n<https://exemplo.com>\n```\n'),
    }));
  });

  // Mesma classe do autolink: marcador de gabarito entre < e > compila como
  // abertura de tag JSX e derruba o build — "Expected a closing tag for <data>".
  test('rejeita marcador <data> sem fechamento, que quebra a compilação MDX', () => {
    fails(
      check('check-links.mjs', {
        'docs/exemplo.md': doc('# X\n\nUm bloco "revisado em <data>" informa que alguém olhou.\n'),
      }),
      /sem fechamento quebra a compilação MDX/,
    );
  });

  test('ignora o mesmo marcador dentro de bloco de código', () => {
    ok(check('check-links.mjs', {
      'docs/exemplo.md': doc('# X\n\n```text\nStatus: superado em <data>\n```\n'),
    }));
  });

  test('aceita tag JSX que fecha', () => {
    ok(check('check-links.mjs', {
      'docs/exemplo.md': doc('# X\n\n<details>\n\nConteúdo.\n\n</details>\n'),
    }));
  });

  test('rejeita diagrama mermaid com delimitadores desbalanceados', () => {
    fails(
      check('check-links.mjs', {
        'docs/a.md': frontmatter({id: 'a'}) + '\n# A\n\n```mermaid\ngraph TD\n  A[X --> B[Y\n```\n',
      }),
      /desbalanceados/,
    );
  });

  test('rejeita tipo de diagrama mermaid desconhecido', () => {
    fails(
      check('check-links.mjs', {
        'docs/a.md': frontmatter({id: 'a'}) + '\n# A\n\n```mermaid\ninventado XY\n  A --> B\n```\n',
      }),
      /tipo de diagrama desconhecido/,
    );
  });

  // O Docusaurus serve a versão pt-BR de uma página ainda não traduzida
  // (SPEC.md §5.3). Tratar esse link como quebrado obrigaria a traduzir o corpus
  // inteiro numa passagem, que é o oposto da política de tradução progressiva.
  test('aceita link de en-US para página ainda não traduzida', () => {
    ok(check('check-links.mjs', {
      'docs/a.md': frontmatter({id: 'a'}) + '\n# A\n',
      'docs/b.md': frontmatter({id: 'b'}) + '\n# B\n',
      'i18n/en-US/docusaurus-plugin-content-docs/current/a.md':
        frontmatter({id: 'a'}) + '\n# A\n\nSee [B](b.md).\n',
    }));
  });

  test('ainda rejeita link de en-US para página que não existe em locale nenhum', () => {
    fails(
      check('check-links.mjs', {
        'docs/a.md': frontmatter({id: 'a'}) + '\n# A\n',
        'i18n/en-US/docusaurus-plugin-content-docs/current/a.md':
          frontmatter({id: 'a'}) + '\n# A\n\nSee [ghost](ghost.md).\n',
      }),
      /link para arquivo inexistente/,
    );
  });

  test('em pt-BR não há fallback: link quebrado continua quebrado', () => {
    fails(
      check('check-links.mjs', {
        'docs/a.md': frontmatter({id: 'a'}) + '\n# A\n\nVeja [b](b.md).\n',
      }),
      /link para arquivo inexistente/,
    );
  });

  test('aceita diagrama mermaid válido', () => {
    ok(check('check-links.mjs', {
      'docs/a.md': frontmatter({id: 'a'})
        + '\n# A\n\n```mermaid\ngraph LR\n  A[Início] --> B[Fim]\n```\n',
    }));
  });
});

describe('check-parity', () => {
  test('aceita tradução na mesma versão do canônico', () => {
    ok(check('check-parity.mjs', {
      'docs/a.md': doc('# A\n', {id: 'a', content_version: 3}),
      'i18n/en-US/docusaurus-plugin-content-docs/current/a.md': translated('a', 3, '# A\n'),
    }));
  });

  test('aceita tradução defasada, que é estado válido', () => {
    const r = check('check-parity.mjs', {
      'docs/a.md': doc('# A\n', {id: 'a', content_version: 5}),
      'i18n/en-US/docusaurus-plugin-content-docs/current/a.md': translated('a', 2, '# A\n'),
    });
    assert.equal(r.code, 0);
    assert.match(r.output, /🟨1/);
  });

  test('aceita ausência de tradução, que é estado válido', () => {
    const r = check('check-parity.mjs', {
      'docs/a.md': doc('# A\n', {id: 'a', content_version: 1}),
      'i18n/en-US/docusaurus-plugin-content-docs/current/.keep': '',
    });
    assert.equal(r.code, 0);
    assert.match(r.output, /⬜1/);
  });

  test('rejeita tradução à frente do canônico', () => {
    fails(
      check('check-parity.mjs', {
        'docs/a.md': doc('# A\n', {id: 'a', content_version: 1}),
        'i18n/en-US/docusaurus-plugin-content-docs/current/a.md': translated('a', 9, '# A\n'),
      }),
      /inconsistente com content_version/,
    );
  });

  test('rejeita tradução órfã, sem canônico correspondente', () => {
    fails(
      check('check-parity.mjs', {
        'docs/a.md': doc('# A\n', {id: 'a', content_version: 1}),
        'i18n/en-US/docusaurus-plugin-content-docs/current/fantasma.md':
          translated('fantasma', 1, '# F\n'),
      }),
      /tradução sem documento canônico correspondente/,
    );
  });
});
