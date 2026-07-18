/**
 * Post-build: make VitePress cleanUrls work on default static hosts
 * (Forge/nginx try_files $uri $uri/, Apache DirectoryIndex) without
 * requiring per-server rewrite rules for `$uri.html`.
 *
 * For each page `foo/bar.html` (not index.html / 404.html), also write
 * `foo/bar/index.html` so `/foo/bar` resolves via directory index.
 */
import { copyFileSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const distDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs', '.vitepress', 'dist')

const SKIP_NAMES = new Set(['index.html', '404.html'])

/** @param {string} dir */
function* walkHtmlFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      yield* walkHtmlFiles(fullPath)
      continue
    }
    if (entry.isFile() && entry.name.endsWith('.html')) {
      yield fullPath
    }
  }
}

function main() {
  if (!statSync(distDir, { throwIfNoEntry: false })?.isDirectory()) {
    console.error(`Dist directory missing: ${distDir}`)
    process.exit(1)
  }

  let created = 0

  for (const htmlPath of walkHtmlFiles(distDir)) {
    const name = htmlPath.split(/[/\\]/).pop()
    if (!name || SKIP_NAMES.has(name)) {
      continue
    }

    const pageDir = htmlPath.slice(0, -'.html'.length)
    const indexPath = join(pageDir, 'index.html')

    mkdirSync(pageDir, { recursive: true })
    copyFileSync(htmlPath, indexPath)
    created += 1

    const rel = relative(distDir, indexPath).replace(/\\/g, '/')
    console.log(`clean-url: ${rel}`)
  }

  console.log(`clean-url: created ${created} directory index fallback(s)`)
}

main()
