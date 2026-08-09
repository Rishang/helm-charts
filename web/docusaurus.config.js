// @ts-check

const {themes: prismThemes} = require('prism-react-renderer');
const lightCodeTheme = prismThemes.github;
const darkCodeTheme = prismThemes.dracula;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'helm-charts',
  tagline: 'Helm chart documentation',
  favicon: 'img/favicon.ico',

  url: 'https://rishang.github.io',
  baseUrl: '/helm-charts/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  organizationName: 'rishang',
  projectName: 'helm-charts',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: false,
        blog: false,
        pages: {},
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'component-chart',
        // Use the chart docs directly, so chart + docs stay together
        path: '../charts/component-chart/docs/pages',
        routeBasePath: 'component-chart',
        sidebarPath: require.resolve('./sidebars/component-chart.js'),
        showLastUpdateAuthor: false,
        showLastUpdateTime: false,
      },
    ],

    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'loki-stack',
        // Use the chart docs directly, so chart + docs stay together
        path: '../charts/loki-stack/docs/pages',
        routeBasePath: 'loki-stack',
        sidebarPath: require.resolve('./sidebars/loki-stack.js'),
        showLastUpdateAuthor: false,
        showLastUpdateTime: false,
      },
    ],
  ],

  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        docsRouteBasePath: ['component-chart', 'loki-stack'],
        docsPluginIdForPreferredVersion: 'component-chart',
        docsDir: [
          '../charts/component-chart/docs/pages',
          '../charts/loki-stack/docs/pages',
        ],
        hashed: true,
        indexBlog: false,
        indexPages: true,
        language: ['en'],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: true,
        respectPrefersColorScheme: false,
      },
      navbar: {
        title: 'helm-charts',
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'componentChartSidebar',
            docsPluginId: 'component-chart',
            position: 'left',
            label: 'component-chart',
          },
          {
            type: 'docSidebar',
            sidebarId: 'lokiStackSidebar',
            docsPluginId: 'loki-stack',
            position: 'left',
            label: 'loki-stack',
          },
          // {
          //   href: 'https://github.com/Rishang/helm-charts/stargazers',
          //   position: 'right',
          //   className: 'header-github-star',
          //   'aria-label': 'Star on GitHub',
          // },
          {
            href: 'https://github.com/Rishang/helm-charts',
            position: 'right',
            className: 'header-github-link',
            'aria-label': 'GitHub repository',
          },
        ],
      },
      footer: {
        style: 'dark',
        // copyright: ``,
        links: [
          {
            title: 'Community',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/Rishang/helm-charts',
              },
            ],
          },
        ],
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['yaml'],
      },
    }),
};

module.exports = config;
