import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Rune Protocol",
  description: "A four-sigil reactive binding protocol. @ read · ~ sync · ! act · ? intent",

  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap', rel: 'stylesheet' }]
  ],

  ignoreDeadLinks: true,

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'one-dark-pro'
    },
    lineNumbers: true
  },

  themeConfig: {
    siteTitle: 'Rune Protocol',

    search: {
      provider: 'local',
      options: {
        placeholder: 'Search docs...'
      }
    },

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Spec', link: '/SPEC' },
      { text: 'Tooling', link: '/tooling/schema' },
      { text: 'Examples', link: '/examples/mere' },
      { text: 'Implementations', link: '/implementations/csharp' },
      { text: 'GitHub', link: 'https://github.com/semanticintent/rune-protocol' },
      { text: '🐦 Cormorant Foraging', link: 'https://cormorantforaging.dev' },
    ],

    sidebar: [
      {
        text: 'The Protocol',
        items: [
          { text: 'Introduction', link: '/' },
          { text: 'Specification', link: '/SPEC' },
          { text: 'Philosophy', link: '/PHILOSOPHY' },
          { text: 'Origins', link: '/ORIGINS' },
        ]
      },
      {
        text: 'Governance',
        items: [
          { text: 'Universal Contract', link: '/UNIVERSAL' },
          { text: 'AI & Declaration', link: '/AI' },
          { text: 'Cross-Layer Contracts', link: '/CONTRACTS' },
          { text: 'Industry Applications', link: '/INDUSTRY' },
        ]
      },
      {
        text: 'Tooling',
        items: [
          { text: 'Schema Reference', link: '/tooling/schema' },
          { text: 'CLI — validate & extract', link: '/tooling/cli' },
          { text: 'LSP — Editor Integration', link: '/tooling/lsp' },
        ]
      },
      {
        text: 'Adoption',
        items: [
          { text: 'Adoption Guide', link: '/ADOPTION' },
          { text: 'Host Guide', link: '/HOSTS' },
          { text: 'Roadmap', link: '/ROADMAP' },
        ]
      },
      {
        text: 'Examples',
        items: [
          { text: 'Mere — Workbooks', link: '/examples/mere' },
          { text: 'Config Files', link: '/examples/config' },
          { text: 'Trading / Finance', link: '/examples/trading' },
          { text: 'Publishing (Recall)', link: '/examples/recall' },
          { text: 'Clinical / Healthcare', link: '/examples/clinical' },
          { text: 'Legal / Contracts', link: '/examples/legal' },
        ]
      },
      {
        text: 'Implementations',
        items: [
          { text: 'C#', link: '/implementations/csharp' },
          { text: 'React / TypeScript', link: '/implementations/react' },
          { text: 'SQL (PostgreSQL)', link: '/implementations/sql' },
        ]
      },
      {
        text: 'Legal',
        items: [
          { text: 'Terms & Conditions', link: '/terms' },
        ]
      },
    ],

    footer: {
      message: 'Released under the <a href="/terms">MIT License</a> · <a href="/terms">Terms & Conditions</a>',
      copyright: 'Part of the <a href="https://cormorantforaging.dev">Cormorant Foraging</a> ecosystem · <a href="https://semanticintent.dev">Semantic Intent</a>'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/semanticintent/rune-protocol' }
    ]
  }
})
