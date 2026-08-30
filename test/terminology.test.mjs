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

  test('rejeita má tradução de termo da categoria B', () => {
    fails(
      check('check-terminology.mjs', {
        'docs/exemplo.md': doc('# X\n\nCada escolha tem sua contrapartida clara.\n'),
      }),
      /traduz "trade-off" como "contrapartida"/,
    );
  });

  // "em contrapartida" é conectivo corrente do português e não tem relação com
  // trade-off. Sem o mascaramento de homônimos, prosa correta era reprovada.
  test('não confunde o conectivo "em contrapartida" com má tradução', () => {
    ok(check('check-terminology.mjs', {
      'docs/exemplo.md': doc(
        '# X\n\nA orquestração é explícita. Em contrapartida, concentra o acoplamento.\n',
      ),
    }));
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

describe('check-terminology — falsos positivos sistêmicos', () => {
  // Regressão: os slugs deste repositório são em inglês por decisão (ADR-R003).
  // Um link para ../12-reliability/index.md contém "reliability" sem que o autor
  // tenha escrito o termo em inglês. Sem descartar a URL, todo link interno
  // vira falso positivo.
  test('ignora o termo dentro da URL de um link, mas checa o texto', () => {
    ok(check('check-terminology.mjs', {
      'docs/exemplo.md': doc('# X\n\nVeja [confiabilidade](../12-reliability/index.md).\n'),
    }));
    fails(
      check('check-terminology.mjs', {
        'docs/exemplo.md': doc('# X\n\nVeja [reliability](../12-reliability/index.md).\n'),
      }),
      /usa "reliability"/,
    );
  });

  // Regressão: "Site Reliability Engineering" e "Technical Debt Quadrant" são
  // títulos de obras — nomes próprios. Sem excluir a bibliografia, todo
  // documento que cita fontes acusa uso do termo em inglês.
  test('ignora títulos de obras na seção de bibliografia', () => {
    for (const heading of ['Para Aprofundar', 'Further Exploration', 'Referências']) {
      ok(check('check-terminology.mjs', {
        'docs/exemplo.md': doc(
          `# X\n\nA confiabilidade do sistema importa.\n\n## ${heading}\n\n`
          + '- Beyer, Betsy et al. *Site Reliability Engineering*. O\'Reilly, 2016.\n'
          + '- Fowler, Martin. *Technical Debt Quadrant*, 2009.\n',
        ),
      }));
    }
  });

  test('continua checando o corpo mesmo havendo bibliografia depois', () => {
    fails(
      check('check-terminology.mjs', {
        'docs/exemplo.md': doc(
          '# X\n\nO reliability do sistema importa.\n\n## Para Aprofundar\n\n- Fonte.\n',
        ),
      }),
      /usa "reliability"/,
    );
  });

  // Regressão: "fragmentação" é palavra portuguesa comum, usada fora de
  // qualquer contexto de sharding. Era enforced e acusava texto legítimo.
  test('não trata "fragmentação" como má tradução de sharding', () => {
    ok(check('check-terminology.mjs', {
      'docs/exemplo.md': doc(
        '# X\n\nHá risco de fragmentação ao dividir um módulo coeso em três.\n',
      ),
    }));
  });

  test('ainda rejeita "estilhaçamento" como tradução de sharding', () => {
    fails(
      check('check-terminology.mjs', {
        'docs/exemplo.md': doc('# X\n\nO estilhaçamento distribui a carga.\n'),
      }),
      /traduz "sharding" como "estilhaçamento"/,
    );
  });

  // Homóglifo: "Strangler" com о cirílico passa por leitura humana e por
  // corretor, e quebra busca e âncora. Apareceu numa tradução do glossário.
  test('rejeita letra de outro alfabeto dentro de palavra latina', () => {
    fails(
      check('check-terminology.mjs', {
        'docs/exemplo.md': doc('# X\n\nO padrão Str\u0430ngler Fig substitui aos poucos.\n'),
      }),
      /outro alfabeto/,
    );
  });

  test('aceita a mesma palavra escrita só com letras latinas', () => {
    ok(check('check-terminology.mjs', {
      'docs/exemplo.md': doc('# X\n\nO padrão Strangler Fig substitui aos poucos.\n'),
    }));
  });
});
