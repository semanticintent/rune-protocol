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
      { text: 'Examples', link: '/examples/mere' },
      { text: 'Implementations', link: '/implementations/csharp/RuneCore' },
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
        ]
      },
      {
        text: 'Governance',
        items: [
          { text: 'AI & Declaration', link: '/AI' },
          { text: 'Cross-Layer Contracts', link: '/CONTRACTS' },
          { text: 'Industry Applications', link: '/INDUSTRY' },
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
          { text: 'C# — Core', link: '/implementations/csharp/RuneCore' },
          { text: 'C# — Host & Builder', link: '/implementations/csharp/RuneHost' },
          { text: 'C# — Examples', link: '/implementations/csharp/Example' },
          { text: 'React / TypeScript — Host', link: '/implementations/react/rune-host' },
          { text: 'React / TypeScript — Hooks', link: '/implementations/react/rune-react' },
          { text: 'React / TypeScript — Examples', link: '/implementations/react/example' },
          { text: 'SQL — Core', link: '/implementations/sql/rune_core' },
          { text: 'SQL — Task Workbook', link: '/implementations/sql/example_task_workbook' },
          { text: 'SQL — Risk Dashboard', link: '/implementations/sql/example_risk_dashboard' },
        ]
      },
    ],

    footer: {
      message: 'Rune Protocol — MIT License',
      copyright: 'Part of the <a href="https://cormorantforaging.dev">Cormorant Foraging</a> ecosystem · <a href="https://semanticintent.dev">Semantic Intent</a>'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/semanticintent/rune-protocol' }
    ]
  }
})
