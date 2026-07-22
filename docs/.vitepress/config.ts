import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'

const configDir = fileURLToPath(new URL('.', import.meta.url))
const SITE_URL = 'https://docs.saleos.app'
const SITE_TITLE = 'SaleOS Docs'
const SITE_DESCRIPTION = 'Official documentation for the SaleOS SaaS Platform.'
const OG_IMAGE = `${SITE_URL}/og-image.svg`

function pageUrl(relativePath: string): string {
  const path = relativePath
    .replace(/(^|\/)index\.md$/, '$1')
    .replace(/\.md$/, '')

  if (!path || path === '/') {
    return `${SITE_URL}/`
  }

  return `${SITE_URL}/${path.replace(/^\//, '')}`
}

export default defineConfig({
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,

  // Root deployment at https://docs.saleos.app (not GitHub Pages)
  base: '/',

  cleanUrls: true,
  lastUpdated: true,
  appearance: true,
  ignoreDeadLinks: false,

  // Relative to docs/ — produces docs/.vitepress/dist
  outDir: '.vitepress/dist',

  vite: {
    publicDir: resolve(configDir, 'public'),
    // Docs site bundles grow with roadmap pages; silence Rollup's 500 kB hint so
    // the Quality Gate (which greps build logs for "warning") stays green.
    build: {
      chunkSizeWarningLimit: 1000,
    },
  },

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#0f766e' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: SITE_TITLE }],
    ['meta', { property: 'og:title', content: SITE_TITLE }],
    ['meta', { property: 'og:description', content: SITE_DESCRIPTION }],
    ['meta', { property: 'og:url', content: `${SITE_URL}/` }],
    ['meta', { property: 'og:image', content: OG_IMAGE }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: SITE_TITLE }],
    ['meta', { name: 'twitter:description', content: SITE_DESCRIPTION }],
    ['meta', { name: 'twitter:image', content: OG_IMAGE }],
  ],

  sitemap: {
    hostname: SITE_URL,
    transformItems: (items) =>
      items.filter((item) => !item.url.replace(/\/$/, '').endsWith('404')),
  },

  markdown: {
    languageAlias: {
      env: 'ini',
    },
  },

  transformPageData(pageData) {
    const title =
      pageData.frontmatter.layout === 'home'
        ? SITE_TITLE
        : pageData.title
          ? `${pageData.title} | ${SITE_TITLE}`
          : SITE_TITLE

    const description =
      pageData.description ||
      (typeof pageData.frontmatter.description === 'string'
        ? pageData.frontmatter.description
        : SITE_DESCRIPTION)

    const url = pageUrl(pageData.relativePath)

    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.push(
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: description }],
      ['meta', { property: 'og:url', content: url }],
      ['meta', { property: 'og:image', content: OG_IMAGE }],
      ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
      ['meta', { name: 'twitter:title', content: title }],
      ['meta', { name: 'twitter:description', content: description }],
      ['meta', { name: 'twitter:image', content: OG_IMAGE }],
      ['link', { rel: 'canonical', href: url }],
    )
  },

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: SITE_TITLE,

    nav: [
      { text: 'Getting Started', link: '/getting-started/' },
      { text: 'Architecture', link: '/architecture/' },
      { text: 'User Guide', link: '/user-guide/' },
      { text: 'Developer Guide', link: '/developer-guide/' },
      { text: 'API', link: '/api/' },
      { text: 'Deployment', link: '/deployment/' },
      { text: 'Changelog', link: '/changelog/' },
    ],

    sidebar: {
      '/getting-started/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Overview', link: '/getting-started/' },
            { text: 'Platform Freeze', link: '/getting-started/platform-freeze' },
            { text: 'Product Roadmap', link: '/getting-started/product-roadmap' },
            { text: 'Documentation Governance', link: '/developer-guide/documentation-governance' },
            { text: 'Local Demo Data', link: '/getting-started/local-demo-data' },
          ],
        },
      ],
      '/architecture/': [
        {
          text: 'Architecture',
          items: [
            { text: 'Overview', link: '/architecture/' },
            { text: 'Module Architecture', link: '/architecture/module-architecture' },
            { text: 'Module Dependencies', link: '/architecture/module-dependencies' },
            { text: 'Module Licensing', link: '/architecture/module-licensing' },
          ],
        },
      ],
      '/user-guide/': [
        {
          text: 'User Guide',
          items: [
            { text: 'Overview', link: '/user-guide/' },
            { text: 'Tenant Application', link: '/user-guide/tenant-application' },
            { text: 'Authentication', link: '/user-guide/authentication' },
            { text: 'Admin UI', link: '/user-guide/admin-ui' },
            { text: 'Shared Layout', link: '/user-guide/shared-layout' },
          ],
        },
        {
          text: 'Access & Settings',
          items: [
            { text: 'Tenant RBAC Overview', link: '/user-guide/tenant-rbac-overview' },
            { text: 'Tenant RBAC', link: '/user-guide/tenant-rbac' },
            { text: 'Central Settings Overview', link: '/user-guide/central-settings-overview' },
            { text: 'Central Settings', link: '/user-guide/central-settings' },
            { text: 'Tenant Settings Overview', link: '/user-guide/tenant-settings-overview' },
            { text: 'Tenant Settings', link: '/user-guide/tenant-settings' },
            { text: 'Payment Gateways', link: '/user-guide/payment-gateways' },
          ],
        },
        {
          text: 'Modules',
          items: [
            { text: 'Leads Overview', link: '/user-guide/leads-overview' },
            { text: 'Leads', link: '/user-guide/leads' },
            { text: 'Tasks Overview', link: '/user-guide/tasks-overview' },
            { text: 'Tasks', link: '/user-guide/tasks' },
            { text: 'Calendar Overview', link: '/user-guide/calendar-overview' },
            { text: 'Calendar', link: '/user-guide/calendar' },
            { text: 'Meetings Overview', link: '/user-guide/meetings-overview' },
            { text: 'Meetings', link: '/user-guide/meetings' },
            { text: 'Communication Templates', link: '/user-guide/communication-templates' },
          ],
        },
      ],
      '/developer-guide/': [
        {
          text: 'Developer Guide',
          items: [
            { text: 'Overview', link: '/developer-guide/' },
            { text: 'Documentation Governance', link: '/developer-guide/documentation-governance' },
            { text: 'Module Development', link: '/developer-guide/module-development' },
            { text: 'Module Development Guide', link: '/developer-guide/module-development-guide' },
            { text: 'Module Architecture', link: '/architecture/module-architecture' },
            { text: 'Module Dependencies', link: '/architecture/module-dependencies' },
            { text: 'Module Licensing', link: '/architecture/module-licensing' },
            { text: 'Entitlements', link: '/developer-guide/entitlements' },
            { text: 'Database', link: '/developer-guide/database' },
            { text: 'Object Storage', link: '/developer-guide/object-storage' },
            { text: 'Frontend Build Artifacts', link: '/developer-guide/frontend-build-artifacts' },
            { text: 'Playwright', link: '/developer-guide/playwright' },
            { text: 'Tenant Provisioning', link: '/developer-guide/tenant-provisioning' },
          ],
        },
        {
          text: 'Auth, RBAC & Settings',
          items: [
            { text: 'Authentication', link: '/developer-guide/authentication' },
            { text: 'Tenant RBAC', link: '/developer-guide/tenant-rbac' },
            { text: 'Central Settings', link: '/developer-guide/central-settings' },
            { text: 'Tenant Settings', link: '/developer-guide/tenant-settings' },
            { text: 'Multi-Provider Email', link: '/developer-guide/multi-provider-email' },
            { text: 'Email Webhooks', link: '/developer-guide/email-webhooks' },
          ],
        },
        {
          text: 'UI',
          items: [
            { text: 'Shared UI Architecture', link: '/developer-guide/shared-ui' },
            { text: 'Shared Layout', link: '/developer-guide/shared-layout' },
          ],
        },
        {
          text: 'Billing',
          items: [
            { text: 'Billing Engine', link: '/developer-guide/billing-engine' },
            { text: 'Payment Gateways Overview', link: '/developer-guide/payment-gateways-overview' },
            { text: 'Payment Gateways', link: '/developer-guide/payment-gateways' },
            { text: 'Webhooks', link: '/developer-guide/payment-gateways-webhooks' },
            { text: 'Stripe / Cashier', link: '/developer-guide/stripe-cashier' },
            { text: 'Creem', link: '/developer-guide/creem' },
          ],
        },
        {
          text: 'Modules',
          items: [
            { text: 'Leads', link: '/developer-guide/leads' },
            { text: 'Tasks', link: '/developer-guide/tasks' },
            { text: 'Calendar', link: '/developer-guide/calendar' },
            { text: 'Meetings', link: '/developer-guide/meetings' },
            { text: 'Communication Templates', link: '/developer-guide/communication-templates' },
          ],
        },
        {
          text: 'Future Integrations',
          items: [
            { text: 'Lead Source Driver Architecture', link: '/developer-guide/lead-source-driver-architecture' },
            { text: 'Meta Lead Ads', link: '/developer-guide/meta-lead-ads-integration' },
            { text: 'WhatsApp Cloud Integration', link: '/developer-guide/whatsapp-cloud-integration' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/' },
            { text: 'Central v1', link: '/api/central-v1' },
            { text: 'Tenant Dashboard', link: '/api/tenant-v1-dashboard' },
            { text: 'Tenant Leads', link: '/api/tenant-v1-leads' },
            { text: 'Tenant Tasks', link: '/api/tenant-v1-tasks' },
            { text: 'Tenant Calendar', link: '/api/tenant-v1-calendar' },
            { text: 'Tenant Meetings', link: '/api/tenant-v1-meetings' },
            { text: 'Tenant Communication Templates', link: '/api/tenant-v1-communication-templates' },
            { text: 'Tenant Notifications', link: '/api/tenant-v1-notifications' },
            { text: 'Tenant Users', link: '/api/tenant-v1-users' },
          ],
        },
      ],
      '/deployment/': [
        {
          text: 'Deployment',
          items: [
            { text: 'Overview', link: '/deployment/' },
            { text: 'Production Runbook', link: '/deployment/platform-production-runbook' },
            { text: 'Upgrade Guide', link: '/deployment/upgrade' },
            { text: 'Release Process', link: '/deployment/release-process' },
            { text: 'Notification System', link: '/deployment/notifications' },
            { text: 'RC1 Production Readiness', link: '/deployment/rc1-production-readiness' },
            { text: 'Go-Live Hardening', link: '/deployment/go-live-hardening-2026-07-15' },
            { text: 'Authentication', link: '/deployment/authentication' },
            { text: 'Tenant RBAC', link: '/deployment/tenant-rbac' },
            { text: 'Central Settings', link: '/deployment/central-settings' },
            { text: 'Tenant Settings', link: '/deployment/tenant-settings' },
            { text: 'Payment Gateways', link: '/deployment/payment-gateways' },
            { text: 'Module Development', link: '/deployment/module-development' },
            { text: 'Leads', link: '/deployment/leads' },
            { text: 'Tasks', link: '/deployment/tasks' },
            { text: 'Daily CRM Summary', link: '/deployment/daily-crm-summary' },
            { text: 'Calendar', link: '/deployment/calendar' },
            { text: 'Meetings', link: '/deployment/meetings' },
            { text: 'Communication Templates', link: '/deployment/communication-templates' },
          ],
        },
      ],
      '/changelog/': [
        {
          text: 'Changelog',
          items: [
            { text: 'Delivery Notes', link: '/changelog/' },
            { text: 'v1.1.0', link: '/changelog/v1.1.0' },
            { text: 'v1.1.0 (legacy alias)', link: '/changelog/v1.1.0-platform' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/DiligentCreators/SaaS-Docs' },
    ],

    notFound: {
      title: 'PAGE NOT FOUND',
      quote: 'This page does not exist, or the URL may have changed. Try Getting Started or search from the top navigation.',
      linkLabel: 'Go to home',
      linkText: 'Take me home',
    },

    editLink: {
      pattern: 'https://github.com/DiligentCreators/SaaS-Docs/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    footer: {
      message: SITE_DESCRIPTION,
      copyright: '© 2026 SaleOS. All rights reserved.',
    },

    search: {
      provider: 'local',
    },

    outline: {
      level: [2, 3],
    },

    lastUpdated: {
      text: 'Last updated',
      formatOptions: {
        dateStyle: 'medium',
        timeStyle: 'short',
      },
    },

    docFooter: {
      prev: 'Previous page',
      next: 'Next page',
    },
  },
})
