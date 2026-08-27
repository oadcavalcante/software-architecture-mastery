import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import {themes as prismThemes} from 'prism-react-renderer';

/**
 * AJUSTE ANTES DO PRIMEIRO DEPLOY.
 * GH_ORG precisa ser o usuário ou organização dono do repositório no GitHub.
 * A URL publicada será https://<GH_ORG>.github.io/<GH_REPO>/
 */
const GH_ORG = process.env.GH_ORG ?? 'oadcavalcante';
const GH_REPO = process.env.GH_REPO ?? 'software-architecture-mastery';

/**
 * O Docusaurus constrói uma locale por vez e expõe qual está sendo construída.
 * `announcementBar.content` não é extraída por `write-translations`, então este
 * é o mecanismo disponível para localizá-la.
 */
const LOCALE = process.env.DOCUSAURUS_CURRENT_LOCALE ?? 'pt-BR';

const ANNOUNCEMENT: Record<string, string> = {
  'pt-BR':
    'Conteúdo em construção. A tradução para inglês é progressiva — páginas ainda não traduzidas aparecem em português.',
  'en-US':
    'Work in progress. The English translation is progressive — untranslated pages appear in Portuguese.',
};

const config: Config = {
  title: 'Software Architecture Mastery',
  tagline: 'Pensar como arquiteto, não decorar padrões',
  favicon: 'img/favicon.svg',

  url: `https://${GH_ORG}.github.io`,
  baseUrl: `/${GH_REPO}/`,
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
        label: 'Português (Brasil)',
        direction: 'ltr',
        htmlLang: 'pt-BR',
        calendar: 'gregory',
        path: 'pt-BR',
      },
      'en-US': {
        label: 'English (US)',
        direction: 'ltr',
        htmlLang: 'en-US',
        calendar: 'gregory',
        path: 'en-US',
      },
    },
  },

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
          editUrl: `https://github.com/${GH_ORG}/${GH_REPO}/tree/main/`,
          editLocalizedFiles: true,
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

  themeConfig: {
    // image: 'img/social-card.png',  // F1: criar o card OG (1200×630 PNG)
    // Traduzido por locale em i18n/<locale>/docusaurus-theme-classic/.
    // A tradução en-US é progressiva: páginas sem tradução caem no conteúdo
    // em português, e o leitor precisa saber disso antes de estranhar.
    announcementBar: {
      id: 'traducao-progressiva',
      content: ANNOUNCEMENT[LOCALE] ?? ANNOUNCEMENT['pt-BR'],
      backgroundColor: '#1f4e79',
      textColor: '#ffffff',
      isCloseable: true,
    },
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Software Architecture Mastery',
      logo: {
        alt: 'Software Architecture Mastery',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'curriculum',
          position: 'left',
          label: 'Percurso',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          href: `https://github.com/${GH_ORG}/${GH_REPO}`,
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Percurso',
          items: [
            {label: 'Comece aqui', to: '/'},
            // Modelo de maturidade e Glossário entram aqui na F1,
            // quando os documentos existirem. onBrokenLinks: 'throw'
            // impede que um link aponte para o vazio enquanto isso.
          ],
        },
        {
          title: 'Projeto',
          items: [
            {
              label: 'Especificação',
              href: `https://github.com/${GH_ORG}/${GH_REPO}/blob/main/SPEC.md`,
            },
            {
              label: 'Roadmap',
              href: `https://github.com/${GH_ORG}/${GH_REPO}/blob/main/ROADMAP.md`,
            },
            {
              label: 'Como contribuir',
              href: `https://github.com/${GH_ORG}/${GH_REPO}/blob/main/CONTRIBUTING.md`,
            },
          ],
        },
        {
          title: 'Mais',
          items: [
            {label: 'GitHub', href: `https://github.com/${GH_ORG}/${GH_REPO}`},
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
