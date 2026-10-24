import { useEffect, useRef, useState, type ReactNode } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { siteIdentity } from '../site-config'
import './docs.css'

const slug = 'pyaedt-postprocessing'
const title = 'PyAEDT 结果提取与报告生成调用手册'
const fileSources = import.meta.glob('../../docs/pyaedt-postprocessing/*.{md,json,py}', { eager: true, query: '?public-doc', import: 'default' }) as Record<string, string>
const files = [
  ['README.md', '调用手册', 'Markdown'],
  ['api_snapshot.md', 'API 签名快照', 'Markdown'],
  ['VALIDATION.md', '验证记录', 'Markdown'],
  ['post_helpers.py', '后处理辅助函数', 'Python'],
  ['verify_offline.py', '离线验证脚本', 'Python'],
  ['refresh_api_snapshot.py', '快照更新脚本', 'Python'],
  ['compare_official_docs.py', '官方文档对照脚本', 'Python'],
  ['api_snapshot.json', '机器可读 API 快照', 'JSON'],
  ['official_doc_check.json', '官方参数对照记录', 'JSON'],
].map(([name, label, type]) => ({ name, label, type, content: fileSources[`../../docs/pyaedt-postprocessing/${name}`] }))
const snapshot = JSON.parse(files.find((file) => file.name === 'api_snapshot.json')!.content)
const checks = JSON.parse(files.find((file) => file.name === 'official_doc_check.json')!.content)

function headingId(text: string) {
  return text.toLowerCase().replace(/[^\p{L}\p{N}_\s-]/gu, '').replace(/\s/g, '-')
}
function plainText(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (Array.isArray(value)) return value.map(plainText).join('')
  if (value && typeof value === 'object' && 'props' in value) return plainText((value as { props: { children?: unknown } }).props.children)
  return ''
}
function headings(content: string) {
  let fenced = false
  return content.split('\n').flatMap((line) => {
    if (line.startsWith('```')) { fenced = !fenced; return [] }
    if (fenced) return []
    const match = line.match(/^## (.+)$/)
    return match ? [{ text: match[1].replace(/`/g, ''), id: headingId(match[1]) }] : []
  })
}
function readableMarkdown(content: string) {
  // CJK text adjacent to punctuation can leave strong delimiters literal.
  // Normalize presentation outside fenced examples, keeping source files intact.
  let fenced = false
  return content.split('\n').map((line) => {
    if (line.startsWith('```')) { fenced = !fenced; return line }
    return fenced ? line : line.replace(/\*\*([^\n]+?)\*\*/g, ' **$1** ')
  }).join('\n')
}
function fileUrl(name: string, section?: string) {
  const params = new URLSearchParams()
  if (name !== 'README.md') params.set('file', name)
  if (section) params.set('section', section)
  return `#/docs/${slug}${params.size ? `?${params}` : ''}`
}
function CodeBlock({ children }: { children?: ReactNode }) {
  const ref = useRef<HTMLPreElement>(null)
  const [status, setStatus] = useState('复制代码')
  return <div className="docs-code"><button aria-label="复制代码" onClick={async () => {
    try { await navigator.clipboard.writeText(ref.current?.textContent ?? ''); setStatus('已复制') }
    catch { setStatus('请手动选择复制') }
  }}>{status}</button><pre ref={ref}>{children}</pre></div>
}

export default function DocsPage({ selected }: { selected: string | null }) {
  const [query, setQuery] = useState('')
  const [articleSlug, search = ''] = (selected ?? '').split('?')
  const params = new URLSearchParams(search)
  const filename = params.get('file') || 'README.md'
  const section = params.get('section')
  const currentFile = files.find((file) => file.name === filename)
  const detail = articleSlug === slug && Boolean(currentFile)
  const currentContent = currentFile?.content ?? ''
  const toc = currentFile?.type === 'Markdown' ? headings(currentContent) : []

  useEffect(() => {
    document.title = detail ? `${title} · ${siteIdentity.name}` : `Docs · ${siteIdentity.name}`
    const frame = requestAnimationFrame(() => {
      if (section && detail) document.getElementById(`doc-${section}`)?.scrollIntoView({ block: 'start', behavior: 'instant' })
      else document.getElementById('docs')?.scrollTo({ top: 0, behavior: 'instant' })
    })
    return () => { cancelAnimationFrame(frame); document.title = siteIdentity.title }
  }, [detail, filename, section])

  function resolveLink(href: string) {
    if (href.startsWith('#')) return fileUrl(filename, headingId(decodeURIComponent(href.slice(1))))
    const target = href.replace(/^\.\//, '').split('#')[0]
    if (files.some((file) => file.name === target)) return fileUrl(target, href.includes('#') ? headingId(href.split('#')[1]) : undefined)
    return href
  }
  function download() {
    if (!currentFile) return
    const url = URL.createObjectURL(new Blob([currentContent], { type: 'text/plain;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url; anchor.download = currentFile.name; anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  const matches = `${title} HFSS PyAEDT S参数 Touchstone 远场 场分布 CSV API Python 后处理 报告`.toLowerCase().includes(query.trim().toLowerCase())

  return <div className="docs-page">
    {!selected ? <>
      <h1 className="visually-hidden">Docs</h1>
      <div className="docs-directory-bar"><span>01 DOCUMENT COLLECTION</span><label className="search-box"><span aria-hidden="true">⌕</span><input aria-label="搜索技术文档" placeholder="搜索文档、API 或主题…" value={query} onChange={(event) => setQuery(event.target.value)} /></label></div>
      {matches ? <div className="card-grid skills-grid docs-directory-grid"><a className="docs-project-card" href={`#/docs/${slug}`}>
        <div className="card-top"><span className="index-label">DOCS</span><span className="status-pill">v{snapshot.pyaedt_version}</span></div>
        <h3>{title}</h3>
        <div className="tag-row"><span>#PyAEDT</span><span>#API Reference</span></div>
        <span className="docs-open">阅读文档 <span>→</span></span>
      </a></div> : <p className="empty-state">暂无匹配文档。试试 PyAEDT、S 参数或 API。</p>}
    </> : !detail ? <div className="docs-not-found"><p className="eyebrow">DOCUMENT NOT FOUND</p><h2>这份文档暂未上线。</h2><a className="back-link" href="#docs">← Back to Docs</a></div> : <>
      <a className="back-link" href="#docs">← Back to Docs</a>
      <header className="docs-detail-header"><p className="eyebrow">HFSS / PYAEDT · {snapshot.pyaedt_version} · 2026-10-13</p><h1>{title}</h1><p>整理 / Lavax · API 参数对照与离线数据核对已完成；实际 AEDT 工程导出尚未验证。</p></header>
      <div className="docs-detail-facts"><span>{snapshot.members.length} 个 API 接口与属性</span><span>{checks.checks.length} 个核心接口参数对照</span><span>{files.length} 份手册与配套文件</span></div>
      <div className="docs-reader"><aside className="docs-sidebar"><p className="docs-kicker">COLLECTION FILES</p><nav aria-label="文档集合文件">{files.map((file) => <a key={file.name} href={fileUrl(file.name)} aria-current={filename === file.name ? 'page' : undefined}><span>{file.label}</span><small>{file.name}</small></a>)}</nav>{toc.length > 0 && <><p className="docs-kicker docs-toc-title">ON THIS PAGE</p><nav className="docs-toc" aria-label="当前文档目录">{toc.map((item) => <a key={item.id} href={fileUrl(filename, item.id)}>{item.text}</a>)}</nav></>}</aside>
        <div className="docs-content"><div className="docs-file-bar"><div><strong>{currentFile!.label}</strong><span>{currentFile!.name}</span></div><button className="button button-quiet" onClick={download}>下载当前文件 ↓</button></div>
          <div className="docs-markdown"><Markdown remarkPlugins={[remarkGfm]} skipHtml components={{
            h1: ({ children }) => <h2 className="docs-file-title">{children}</h2>,
            h2: ({ children }) => <h2 id={`doc-${headingId(plainText(children))}`}>{children}</h2>,
            h3: ({ children }) => <h3 id={`doc-${headingId(plainText(children))}`}>{children}</h3>,
            a: ({ href = '', children }) => { const target = resolveLink(href); return <a href={target} {...(/^https?:\/\//.test(target) ? { target: '_blank', rel: 'noreferrer' } : {})}>{children}</a> },
            table: ({ children }) => <div className="docs-table-scroll" role="region" aria-label="技术参考表格" tabIndex={0}><table>{children}</table></div>,
            pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
          }}>{currentFile!.type === 'Markdown' ? readableMarkdown(currentContent) : `\`\`\`${currentFile!.type.toLowerCase()}\n${currentContent}\n\`\`\``}</Markdown></div>
        </div>
      </div>
    </>}
    <footer className="docs-local-footer"><span>© 2026 Lavax · {siteIdentity.name}</span><a href="https://github.com/Lavaxzyh" target="_blank" rel="noreferrer">GitHub ↗</a></footer>
  </div>
}
