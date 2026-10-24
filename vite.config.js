import { defineConfig } from 'vite'
import { readFileSync } from 'node:fs'
import { basename, dirname, resolve } from 'node:path'

// Build a publication copy without changing the user's research documents.
function publicDocument() {
  const directory = resolve('docs/pyaedt-postprocessing')
  const files = new Set(['README.md', 'VALIDATION.md', 'api_snapshot.md', 'api_snapshot.json', 'official_doc_check.json', 'post_helpers.py', 'verify_offline.py', 'refresh_api_snapshot.py', 'compare_official_docs.py'])
  return {
    name: 'public-research-document',
    enforce: 'pre',
    load(id) {
      if (!id.endsWith('?public-doc')) return
      const file = resolve(id.slice(0, -'?public-doc'.length))
      if (dirname(file) !== directory || !files.has(basename(file))) throw new Error('Unexpected documentation file')
      let content = readFileSync(file, 'utf8').replace(/\r\n/g, '\n')
      if (file.endsWith('.json')) {
        const data = JSON.parse(content)
        for (const key of ['python_executable', 'package_entry']) if (key in data) data[key] = '[local environment path omitted]'
        content = JSON.stringify(data, null, 2)
      } else {
        content = content.replace(/^(- (?:解释器|PyAEDT 包入口|加载包入口)：).*$/gm, '$1`[本机环境路径已隐藏]`。')
      }
      return `export default ${JSON.stringify(content)}`
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [publicDocument()],
})
