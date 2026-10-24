import { useState } from 'react'
import downloads from '../data/qr-downloads.json'

export default function QRDownloads() {
  const [selected, setSelected] = useState(downloads[0].id)
  const current = downloads.find((item) => item.id === selected) ?? downloads[0]
  return <aside className="qr-downloads" aria-labelledby="qr-downloads-title">
    <div className="qr-downloads-intro">
      <span className="case-kicker">MODEL DOWNLOADS</span>
      <h2 id="qr-downloads-title">下载复现工程</h2>
      <p className="case-small">选择软件实现版本，获取对应的核心工程文件。</p>
      <p className="case-small">仅含核心文件，不含完整结果与缓存目录；查看已有结果或重新仿真需要对应软件。原论文与课程论文不提供下载。</p>
    </div>
    <div className="qr-downloads-controls">
      <label htmlFor="qr-download-version">工程版本</label>
      <select id="qr-download-version" value={selected} onChange={(event) => setSelected(event.target.value)} aria-describedby="qr-download-version-note">
        {downloads.map((item) => <option key={item.id} value={item.id}>{item.label} · {item.revision}</option>)}
      </select>
      <p id="qr-download-version-note" className="case-small">v1 / v3 为工程修订号，不是软件版本。</p>
      <div className="qr-download-info" aria-live="polite" aria-atomic="true">
        <p>{current.software} <span>· {(current.bytes / 1024).toFixed(1)} KB · ZIP</span></p>
        <p>归档 {current.archiveDate} · {current.files.map((file) => file.name.slice(file.name.lastIndexOf('.'))).join(' + ')}</p>
        <ul>{current.files.map((file) => <li key={file.name}>{file.name}</li>)}</ul>
      </div>
      <a className="button button-primary qr-download-button" href={`${import.meta.env.BASE_URL}models/qr-grid-patch/${current.filename}`} download={current.filename} aria-label={`下载 ${current.label} ${current.revision} 工程`}>下载 {current.label.split(' / ')[0]} 工程 <span aria-hidden="true">↓</span></a>
    </div>
  </aside>
}
