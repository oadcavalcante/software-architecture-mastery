import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import {themes as prismThemes} from 'prism-react-renderer';

/** Repositório no GitHub — usado nos links de edição e de código-fonte. */
const GH_ORG = process.env.GH_ORG ?? 'oadcavalcante';
const GH_REPO = process.env.GH_REPO ?? 'software-architecture-mastery';

/**
 * URL canônica do site publicado.
 *
 * O site é hospedado na Vercel, servido na raiz do domínio — daí baseUrl '/'.
 * A URL canônica alimenta hreflang, Open Graph e sitemap, e por isso precisa
 * apontar para o domínio de produção mesmo quando o build roda num preview.
 *
 * Ordem de resolução:
 *   SITE_URL                        — override explícito, tem precedência
 *   VERCEL_PROJECT_PRODUCTION_URL   — domínio de produção, fornecido pela Vercel
 *   localhost                       — desenvolvimento
 *
 * Note que VERCEL_URL NÃO é usada: ela é o domínio efêmero do deploy específico,
 * e usá-la faria cada preview publicar hreflang e canônicas apontando para si
 * mesmo, o que confunde indexação.
 */
/**
 * O Docusaurus constrói uma locale por vez e expõe qual está sendo construída.
 *
 * `themeConfig.image` não é extraída por `write-translations` e não tem
 * variante por locale, então esta variável é o mecanismo disponível para
 * escolher o card social do idioma certo.
 */
const LOCALE = process.env.DOCUSAURUS_CURRENT_LOCALE ?? 'pt-BR';

/** Card Open Graph, 1200×630. Gerado a partir de `static/img/social-card.svg`. */
const SOCIAL_CARD: Record<string, string> = {
  'pt-BR': 'img/social-card.png',
  'en-US': 'img/social-card.en-US.png',
};

const SITE_URL =
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000');

/**
 * Título do site, por locale.
 *
 * `siteConfig.title` alimenta a aba do navegador e o sufixo de toda `<title>`,
 * e não é extraído por `write-translations` — daí a variável de locale, o mesmo
 * mecanismo usado no card social. O nome do projeto em português é o que o
 * leitor de pt-BR vê; em en-US ele permanece em inglês.
 */
const TITULO: Record<string, string> = {
  'pt-BR': 'Maestria em Arquitetura de Software',
  'en-US': 'Software Architecture Mastery',
};

const TAGLINE: Record<string, string> = {
  'pt-BR': 'Pensar como arquiteto, não decorar padrões',
  'en-US': 'Think like an architect, not memorize patterns',
};

const config: Config = {
  title: TITULO[LOCALE] ?? TITULO['pt-BR'],
  tagline: TAGLINE[LOCALE] ?? TAGLINE['pt-BR'],
  favicon: 'img/favicon.svg',

  url: SITE_URL,
  baseUrl: '/',
  organizationName: GH_ORG,
  projectName: GH_REPO,
  trailingSlash: false,

  // Link interno quebrado é erro de build, não aviso. Ver SPEC.md §13.1.
  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  onDuplicateRoutes: 'throw',

  // pt-BR é a locale canônica; en-US é tradução progressiva. Ver SPEC.md §5.
  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR', 'en-US'],
    localeConfigs: {
      'pt-BR': {
        label: 'Português',
        direction: 'ltr',
        htmlLang: 'pt-BR',
        calendar: 'gregory',
        path: 'pt-BR',
      },
      'en-US': {
        label: 'English',
        direction: 'ltr',
        htmlLang: 'en-US',
        calendar: 'gregory',
        path: 'en-US',
      },
    },
  },

  /**
   * Fontes do tema. O material é para leitura prolongada — 446 documentos de
   * prosa densa —, e a fonte do sistema muda de máquina para máquina.
   *
   * Source Serif 4 na prosa: serifa desenhada para tela, com eixo óptico, que
   * é o que sustenta parágrafo longo sem cansar. IBM Plex Mono nas figuras:
   * os 2002 blocos de texto puro são o elemento visual dominante do site, e
   * ela tem altura de x alta o bastante para continuar legível a 0,8rem no
   * celular.
   *
   * `display: swap` para o texto aparecer na fonte do sistema enquanto a
   * família carrega, em vez de a página ficar em branco.
   */
  headTags: [
    {
      tagName: 'link',
      attributes: {rel: 'preconnect', href: 'https://fonts.googleapis.com'},
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: 'anonymous',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'stylesheet',
        href:
          'https://fonts.googleapis.com/css2' +
          '?family=Source+Serif+4:ital,opsz,wght@0,8..60,400..700;1,8..60,400..600' +
          '&family=IBM+Plex+Mono:wght@400;500;600' +
          '&display=swap',
      },
    },
  ],

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  themes: [
    '@docusaurus/theme-mermaid',
    [
      // Busca offline, indexada por locale no build. Escolhida em vez do
      // Algolia DocSearch porque não depende de aprovação externa nem de
      // serviço de terceiros para funcionar. Ver SPEC.md §10.
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: ['pt', 'en'],
        indexDocs: true,
        indexBlog: false,
        docsRouteBasePath: '/',
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          // Modo docs-only: o guia É o site. Não há landing page separada.
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          // Sem `editUrl`: o repositório é privado, e o "Editar esta página"
          // levava todo visitante a um 404 do GitHub. Voltar a ligá-lo é uma
          // linha, no dia em que o repositório for publicado.
          showLastUpdateTime: true,
          breadcrumbs: true,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  /**
   * Atalhos de teclado da busca. Ver o módulo para a razão de duplicar o
   * atalho que o plugin já registra.
   */
  clientModules: ['./src/clientModules/searchShortcut.ts'],

  themeConfig: {
    docs: {
      sidebar: {
        // Botão de recolher a barra lateral. Com 24 seções e sete níveis, ela é
        // alta; quem está lendo um documento longo quer a coluna inteira.
        hideable: true,
        // Abrir um nível fecha os outros: a barra tem 446 documentos, e todos
        // os níveis abertos ao mesmo tempo deixam de ser navegáveis.
        autoCollapseCategories: true,
      },
    },

    image: SOCIAL_CARD[LOCALE] ?? SOCIAL_CARD['pt-BR'],

    // Não há barra de anúncio. A que existia avisava que a tradução en-US era
    // progressiva e que páginas sem tradução apareciam em português — o que
    // deixou de ser verdade quando os 446 documentos foram traduzidos. Um
    // aviso permanente que não é mais verdadeiro custa quatro linhas no topo
    // de toda página em tela estreita e não informa nada.
    colorMode: {
      defaultMode: 'light',
      // `true` acrescenta um terceiro estado ("sistema") ao botão, e o leitor
      // passa a precisar de dois cliques para chegar ao que quer sem saber
      // qual dos três está ativo. Duas opções, alternância previsível.
      respectPrefersColorScheme: false,
    },
    navbar: {
      // O título do site é localizado por `TITULO`; o da barra estava fixo em
      // inglês, o que deixava o cabeçalho em pt-BR com o nome em inglês.
      title: TITULO[LOCALE] ?? TITULO['pt-BR'],
      logo: {
        alt: TITULO[LOCALE] ?? TITULO['pt-BR'],
        src: 'img/logo.svg',
        // Sem `srcDark`, o tema esconde a imagem clara no modo escuro e não
        // coloca nada no lugar — o logo simplesmente sumia. A variante escura
        // usa a mesma forma com a terracota clareada, que o fundo #1c1a17
        // apagaria na tonalidade original.
        srcDark: 'img/logo-dark.svg',
      },
      // Sem item de conteúdo à esquerda: num site em modo docs-only a barra
      // lateral **é** o percurso, e um link para ela na barra superior duplica
      // a navegação e afasta o rótulo da marca.
      items: [
        {
          type: 'localeDropdown',
          position: 'right',
        },
      ],
    },
    footer: {
      // Claro, não escuro: o tema é papel, e uma faixa preta no fim da página
      // corta a leitura em vez de fechá-la. A separação vem de um fio.
      style: 'light',
      // Uma coluna só: sobraram cinco links depois que os do repositório saíram,
      // e duas colunas com dois e três itens leem como categoria sem conteúdo.
      links: [
        {
          title: 'Percurso',
          items: [
            {label: 'Comece aqui', to: '/'},
            {label: 'Como usar', to: '/how-to-use'},
            {label: 'Modelo de maturidade', to: '/maturity-model'},
            {label: 'Glossário', to: '/glossary'},
            {label: 'Progresso de leitura', to: '/progress'},
          ],
        },
      ],
      copyright: `Conteúdo sob CC BY-SA 4.0. Código sob MIT. © ${new Date().getFullYear()}.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['java', 'go', 'sql', 'bash', 'yaml', 'json', 'hcl'],
    },
    mermaid: {
      theme: {light: 'neutral', dark: 'dark'},
    },
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 3,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
