import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import data from '../data/qr-grid-patch.json'
import { isPanelEnabled, siteIdentity } from '../site-config'
import BLCCase, { BLCArt } from './BLCCase'
import QRDownloads from './QRDownloads'

type CurveId = keyof typeof data.curves
type SolverId = keyof typeof data.metrics
const slug = 'qr-grid-patch'
const curveStyles: Record<CurveId, { label: string; color: string; dash?: string }> = {
  measurement: { label: '论文实测 · 数字化', color: '#e7f1f1' },
  paperFEM: { label: '论文 FEM · 数字化', color: '#718a99', dash: '2 5' },
  hfss: { label: 'HFSS / FEM', color: '#65e7d1' },
  cst: { label: 'CST / FIT', color: '#e4c79a', dash: '8 4' },
  feko: { label: 'FEKO / MoM', color: '#91a9cf', dash: '8 3 2 3' },
}
const curveIds = Object.keys(curveStyles) as CurveId[]
const solverIds: SolverId[] = ['hfss', 'cst', 'feko']
const layers = ['底部馈线', '下基板', '开槽地板', '粘接层', '上基板', '像素贴片']
const fmt = (value: number | null, digits = 1) => value === null ? '未达到阈值' : value.toFixed(digits)
const oneDecimal = (value: number) => (Math.round((value + 1e-9) * 10) / 10).toFixed(1)

function PixelArt({ compact = false }: { compact?: boolean }) {
  return <svg viewBox="0 0 380 245" role="img" aria-label="依据复现参数绘制的 72 单元像素贴片俯视示意" className={`pixel-art ${compact ? 'compact' : ''}`}>
    <defs><pattern id="pixel-grid" width="19" height="19" patternUnits="userSpaceOnUse"><path d="M19 0H0V19" fill="none" stroke="currentColor" strokeOpacity=".09" /></pattern></defs>
    <rect width="380" height="245" fill="url(#pixel-grid)" />
    <rect x="34" y="31" width="312" height="184" rx="3" fill="#0b2130" stroke="#36535e" />
    {data.geometry.matrix.map((row, r) => [...row].map((value, c) => value === '1' && <rect key={`${r}-${c}`} x={38 + c * 19} y={39 + (7 - r) * 19} width="19" height="19" fill="currentColor" fillOpacity={.5 + r * .05} />))}
    <path d="M166 222H214M190 223V239" stroke="#e4c79a" strokeWidth="1" />
    <text x="37" y="21" fill="#8ea7aa" fontSize="10" fontFamily="monospace">48 × 24 mm / 16 × 8 GRID</text>
    <text x="228" y="234" fill="#8ea7aa" fontSize="10" fontFamily="monospace">y=0 / FEED SIDE</text>
  </svg>
}

function SourceBlock() {
  return <aside className="case-source" aria-label="原论文来源">
    <span className="case-kicker">ORIGINAL PAPER / 原论文来源</span>
    <h2>{data.source.title}</h2>
    <p>{data.source.authors}</p>
    <p><cite>{data.source.journal}</cite> · {data.source.year}, {data.source.volume}({data.source.issue}): {data.source.pages}</p>
    <div className="source-links"><a href={data.source.url} target="_blank" rel="noreferrer">IEEE Xplore 原文 ↗</a><a href={`https://doi.org/${data.source.doi}`} target="_blank" rel="noreferrer">DOI: {data.source.doi} ↗</a></div>
    <p className="source-credit">原天线设计与拓扑优化方法归原论文作者；本站展示 Lavax 的 AI 辅助跨软件复现与分析。复现沿用终态结构，未执行原论文的拓扑优化或尺寸调参。</p>
  </aside>
}

function AntennaModel() {
  const host = useRef<HTMLDivElement>(null)
  const api = useRef<{ update: (spread: number, visible: boolean[], rotate: boolean) => void; reset: () => void; view: (preset: 'top' | 'side') => void } | null>(null)
  const [spread, setSpread] = useState(0.65)
  const [visible, setVisible] = useState(layers.map(() => true))
  const [rotate, setRotate] = useState(false)
  const [fallback, setFallback] = useState(false)

  useEffect(() => {
    const stage = host.current
    if (!stage) return
    let renderer: THREE.WebGLRenderer
    try { renderer = new THREE.WebGLRenderer({ antialias: true }) } catch { setFallback(true); return }
    setFallback(false)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.9
    stage.appendChild(renderer.domElement)
    renderer.domElement.setAttribute('aria-label', '天线三维结构，拖动旋转，滚轮缩放；可用视角按钮操作')
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#081925')
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 800)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.07
    controls.minDistance = 70
    controls.maxDistance = 230
    controls.autoRotate = false
    controls.autoRotateSpeed = 0.45
    const resetCamera = () => {
      camera.position.set(90, 78, 90)
      controls.target.set(0, 12, 0)
      // Clear both pending damping and the old orbit state.
      const damping = controls.enableDamping
      controls.enableDamping = false
      controls.update()
      controls.enableDamping = damping
    }
    resetCamera()
    scene.add(new THREE.HemisphereLight(0xe2fff5, 0x152c46, 2.5))
    const light = new THREE.DirectionalLight(0xffffff, 2.4)
    light.position.set(40, 85, 35)
    scene.add(light)
    const rim = new THREE.DirectionalLight(0x65e7d1, 1.4)
    rim.position.set(-60, 35, -45)
    scene.add(rim)
    const grid = new THREE.GridHelper(100, 20, 0x355c64, 0x16303c)
    grid.position.y = -5
    scene.add(grid)
    const groups = layers.map(() => { const group = new THREE.Group(); scene.add(group); return group })
    const metal = new THREE.MeshStandardMaterial({ color: 0xe4c79a, metalness: 0.65, roughness: 0.36, side: THREE.DoubleSide })
    const dielectric = new THREE.MeshStandardMaterial({ color: 0x367a7d, roughness: 0.62, transparent: true, opacity: 0.45, depthWrite: false })
    const bond = new THREE.MeshStandardMaterial({ color: 0xadc9ca, roughness: 0.8, transparent: true, opacity: 0.65, depthWrite: false })
    const plane = (group: THREE.Group, x: number, y: number, width: number, height: number, z: number, angle = 0) => {
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), metal)
      mesh.rotation.set(-Math.PI / 2, 0, THREE.MathUtils.degToRad(angle))
      mesh.position.set(x + width / 2, z, 30 - y - height / 2)
      group.add(mesh)
    }
    const box = (group: THREE.Group, height: number, center: number, material: THREE.Material) => {
      const geometry = new THREE.BoxGeometry(60, height, 60)
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.y = center
      group.add(mesh)
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({ color: 0x7db1b0, transparent: true, opacity: 0.45 }))
      edges.position.copy(mesh.position)
      group.add(edges)
    }
    const feed = data.geometry.feed
    plane(groups[0], -feed.stem_width_x_mm / 2, 0, feed.stem_width_x_mm, feed.stem_length_y_mm, 0)
    plane(groups[0], -feed.crossbar_outer_width_x_mm / 2, 15, feed.crossbar_outer_width_x_mm, feed.crossbar_height_y_mm, 0)
    plane(groups[0], -7, 17, feed.arm_width_x_mm, feed.arm_length_y_mm, 0)
    plane(groups[0], 5.5, 17, feed.arm_width_x_mm, feed.arm_length_y_mm, 0)
    box(groups[1], 2.5, 1.25, dielectric)
    const ground = new THREE.Shape()
    ground.moveTo(-30, -30); ground.lineTo(30, -30); ground.lineTo(30, 30); ground.lineTo(-30, 30); ground.closePath()
    const hole = new THREE.Path()
    const slotPoints = [[-18.5, 23], [-14, 23], [-14, 24], [14, 24], [14, 23], [18.5, 23], [18.5, 26], [14, 26], [14, 25], [-14, 25], [-14, 26], [-18.5, 26]]
    slotPoints.forEach(([x, y], i) => i ? hole.lineTo(x, y - 30) : hole.moveTo(x, y - 30))
    hole.closePath(); ground.holes.push(hole)
    const groundMesh = new THREE.Mesh(new THREE.ShapeGeometry(ground), metal)
    groundMesh.rotation.x = -Math.PI / 2
    groundMesh.position.y = 2.5
    groups[2].add(groundMesh)
    box(groups[3], 0.1, 2.55, bond)
    box(groups[4], 2.5, 3.85, dielectric)
    data.geometry.matrix.forEach((row, r) => [...row].forEach((value, c) => {
      if (value === '1') plane(groups[5], -24 + c * 3, 14 + r * 3, 3, 3, 5.1)
    }))
    data.geometry.bridges.forEach((bridge) => plane(groups[5], bridge.x - .05, bridge.y - .05, .1, .1, 5.1, bridge.rotation))
    const resize = () => {
      const width = Math.max(1, stage.clientWidth), height = Math.max(1, stage.clientHeight)
      camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height, false)
    }
    const observer = new ResizeObserver(resize)
    observer.observe(stage); resize()
    api.current = {
      update: (value, visibility, auto) => { groups.forEach((group, i) => { group.position.y = i * value * 7; group.visible = visibility[i] }); controls.autoRotate = auto },
      reset: resetCamera,
      view: (preset) => {
        camera.position.set(...(preset === 'top' ? [0, 150, .01] : [110, 30, 110]) as [number, number, number])
        controls.target.set(0, 12, 0)
        const damping = controls.enableDamping; controls.enableDamping = false; controls.update(); controls.enableDamping = damping
      },
    }
    api.current.update(0.65, layers.map(() => true), false)
    let frame = 0, inView = true
    const intersection = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting })
    intersection.observe(stage)
    const tick = () => {
      frame = requestAnimationFrame(tick)
      if (inView && !document.hidden) { controls.update(); renderer.render(scene, camera) }
    }
    tick()
    const onLost = (event: Event) => { event.preventDefault(); setFallback(true) }
    renderer.domElement.addEventListener('webglcontextlost', onLost)
    return () => {
      cancelAnimationFrame(frame); observer.disconnect(); intersection.disconnect(); controls.dispose(); api.current = null
      const materials = new Set<THREE.Material>()
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
          object.geometry.dispose()
          const list = Array.isArray(object.material) ? object.material : [object.material]
          list.forEach((material) => materials.add(material))
        }
      })
      materials.forEach((material) => material.dispose())
      renderer.domElement.removeEventListener('webglcontextlost', onLost)
      renderer.dispose(); renderer.domElement.remove()
    }
  }, [])
  useEffect(() => { api.current?.update(spread, visible, rotate) }, [spread, visible, rotate])
  const reset = () => { setSpread(.65); setVisible(layers.map(() => true)); setRotate(false); api.current?.reset() }
  return <div className="structure-layout">
    <figure className="model-card">
      <div className="model-status"><span>PARAMETRIC STRUCTURE</span><span>mm / PEC</span></div>
      <div className="antenna-stage" ref={host} hidden={fallback} />
      {fallback && <div className="model-fallback"><PixelArt /><p>三维显示不可用 · 参数重绘俯视示意</p></div>}
      <div className="model-bottom"><span>拖动旋转 · 滚轮 / 双指缩放</span><span>72 CELLS / 16 BRIDGES</span></div>
      <figcaption>依据复现工程参数重绘；层间展开仅作结构示意。首行靠近 y=0 馈电端；不展示求解器端口夹具与空气域。</figcaption>
    </figure>
    <div className="model-controls">
      <span className="case-kicker">EXPLORE THE STACK / 层叠结构</span>
      <h3>从馈线到<br /><em>像素贴片。</em></h3>
      <label className="spread-control">层叠展开 <span>{spread === 0 ? '实际层间距' : `${Math.round(spread * 100)}% · 示意`}</span><input disabled={fallback} type="range" min="0" max="1" step=".01" value={spread} onChange={(event) => setSpread(Number(event.target.value))} /></label>
      <div className="layer-toggles">{layers.map((name, i) => <label key={name}><input disabled={fallback} type="checkbox" checked={visible[i]} onChange={() => setVisible((old) => old.map((v, j) => i === j ? !v : v))} /><span className="layer-number">0{i + 1}</span>{name}</label>)}</div>
      <div className="model-actions"><button disabled={fallback} aria-pressed={rotate} onClick={() => setRotate(!rotate)}>Auto rotate · {rotate ? 'ON' : 'OFF'}</button><button disabled={fallback} onClick={() => api.current?.view('top')}>俯视</button><button disabled={fallback} onClick={() => api.current?.view('side')}>侧视</button><button disabled={fallback} onClick={reset}>重置结构与视角 ↺</button></div>
      <p className="case-small">60 × 60 mm · 双层 F4BM220 / εr 2.2<br />F4-PP250 粘接层 0.1 mm / εr 2.5<br />导体为零厚度 PEC，未建模 SMA。</p>
    </div>
  </div>
}

function S11Chart() {
  const plotHost = useRef<HTMLDivElement>(null)
  const [plotWidth, setPlotWidth] = useState(910)
  const [shown, setShown] = useState<CurveId[]>(['measurement', 'hfss', 'cst', 'feko'])
  const [windowIndex, setWindowIndex] = useState(-1)
  const [cursor, setCursor] = useState(3.975)
  const range = windowIndex < 0 ? [2, 7.5] : data.windows[windowIndex]
  const [low, high] = range
  useEffect(() => {
    if (!plotHost.current) return
    const observer = new ResizeObserver(([entry]) => setPlotWidth(Math.max(280, entry.contentRect.width)))
    observer.observe(plotHost.current)
    return () => observer.disconnect()
  }, [])
  const right = plotWidth - 42
  const plotSpan = right - 68
  const tickCount = plotWidth < 500 ? 4 : 7
  const x = (f: number) => 68 + (f - low) / (high - low) * plotSpan
  const y = (db: number) => 30 + (5 - db) / 55 * 290
  const points = useMemo(() => Object.fromEntries(curveIds.map((id) => [id, data.curves[id].filter(([f]) => f >= low - 1e-6 && f <= high + 1e-6)])) as Record<CurveId, number[][]>, [low, high])
  const closest = (id: CurveId) => points[id].reduce((best, point) => Math.abs(point[0] - cursor) < Math.abs(best[0] - cursor) ? point : best)
  const chooseWindow = (index: number) => { setWindowIndex(index); const next = index < 0 ? [2, 7.5] : data.windows[index]; setCursor((next[0] + next[1]) / 2) }
  const toggle = (id: CurveId) => setShown((old) => old.includes(id) ? old.filter((v) => v !== id) : [...old, id])
  return <figure className="chart-card">
    <div className="chart-toolbar"><div><span className="case-kicker">REFLECTION COEFFICIENT</span><h3>同一结构，五条曲线。</h3></div><a className="chart-sampling" href={`${import.meta.env.BASE_URL}cases/qr-grid-patch/s11-comparison.svg`} target="_blank" rel="noreferrer">查看静态结果图 ↗</a></div>
    <div className="range-tabs" aria-label="查看频段"><button aria-pressed={windowIndex === -1} onClick={() => chooseWindow(-1)}>全频段</button>{data.windows.map(([a, b], i) => <button key={a} aria-pressed={windowIndex === i} onClick={() => chooseWindow(i)}>{a}–{b} GHz</button>)}</div>
    <div className="plot-wrap" ref={plotHost}><svg viewBox={`0 0 ${plotWidth} 365`} role="img" aria-label={`S11 对比图，频率 ${low} 至 ${high} GHz，纵轴 -50 至 5 dB`}>
      <defs><clipPath id="s11-clip"><rect x="68" y="30" width={plotSpan} height="290" /></clipPath></defs>
      {[-50, -40, -30, -20, -10, 0].map((db) => <g key={db}><line x1="68" x2={right} y1={y(db)} y2={y(db)} className="plot-grid" /><text x="54" y={y(db) + 4} textAnchor="end">{db}</text></g>)}
      {Array.from({ length: tickCount }, (_, i) => low + (high - low) * i / (tickCount - 1)).map((f) => <g key={f}><line x1={x(f)} x2={x(f)} y1="30" y2="320" className="plot-grid" /><text x={x(f)} y="342" textAnchor="middle">{f.toFixed(windowIndex < 0 ? 1 : 3)}</text></g>)}
      <text x="18" y="19">S11 (dB)</text><text x={right} y="362" textAnchor="end">Frequency (GHz)</text>
      <g clipPath="url(#s11-clip)">
        {windowIndex < 0 && data.windows.map(([a, b]) => <rect key={a} x={x(a)} y="30" width={x(b) - x(a)} height="290" fill="#65e7d1" opacity=".035" />)}
        {[-6, -10].map((db) => <g key={db}><line x1="68" x2={right} y1={y(db)} y2={y(db)} stroke="#54707b" strokeDasharray="3 5" /><text x={right - 5} y={y(db) - 5} textAnchor="end">{db} dB</text></g>)}
        {shown.map((id) => <path key={id} d={points[id].map(([f, db], i) => `${i ? 'L' : 'M'}${x(f).toFixed(3)},${y(db).toFixed(3)}`).join(' ')} fill="none" stroke={curveStyles[id].color} strokeWidth={id === 'measurement' ? 2.2 : 1.8} strokeDasharray={curveStyles[id].dash} />)}
        <line x1={x(cursor)} x2={x(cursor)} y1="30" y2="320" stroke="#8ea7aa" strokeDasharray="3 4" />
        {shown.map((id) => { const p = closest(id); return <circle key={id} cx={x(p[0])} cy={y(p[1])} r="3.5" fill={curveStyles[id].color} stroke="#081925" strokeWidth="1.5" /> })}
      </g>
      <rect x="68" y="30" width={plotSpan} height="290" fill="transparent" onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        setCursor(low + Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)) * (high - low))
      }} />
    </svg></div>
    <div className="curve-toggles" aria-label="曲线显示开关">{curveIds.map((id) => <button key={id} aria-pressed={shown.includes(id)} onClick={() => toggle(id)} style={{ '--curve-color': curveStyles[id].color } as React.CSSProperties}><span className="curve-dot" />{curveStyles[id].label}</button>)}</div>
    <label className="frequency-control">频率读数 <input aria-label="频率读数位置" type="range" min={low} max={high} step=".001" value={cursor} onChange={(event) => setCursor(Number(event.target.value))} /><output>{cursor.toFixed(3)} GHz</output></label>
    <div className="chart-readouts" aria-live="polite">{shown.map((id) => { const p = closest(id); return <div key={id}><span style={{ color: curveStyles[id].color }}>{curveStyles[id].label}</span><strong>{p[1].toFixed(2)} <small>dB</small></strong><small>采样频率 {p[0].toFixed(3)} GHz</small></div> })}</div>
    {shown.length === 0 && <p className="case-small empty-curves">曲线已全部隐藏，可点击图例重新显示。</p>}
    <figcaption>三软件曲线来自最终工程导出数据；论文实测与 FEM 曲线由原论文 Fig. 16 数字化。连线仅连接已有样本，读数取最近采样点。图表由本站重绘，非原论文截图。</figcaption>
  </figure>
}

const solverContent: Record<SolverId, { title: string; method: string; description: string; settings: [string, string][] }> = {
  hfss: { title: 'HFSS', method: 'Finite Element Method', description: '体网格刻画有限介质与开域，使用 Modal Network 完成自适应求解。当前模型的整体曲线误差最小。', settings: [['端口', '单模 Wave Port · 本征 Zpi · PEC 背板'], ['开域', 'CreateRegion + Radiation 边界'], ['离散', '86,041 四面体 · 11 次自适应'], ['求解', '7 GHz 自适应 · MaxDeltaS < 0.02'], ['网格', '贴片 1 mm · 馈线 / 地板 0.5 mm']] },
  cst: { title: 'CST', method: 'Finite Integration Technique', description: 'FIT 时域求解以一次宽带响应获取多个频段。论文将其归入 FDTD 类工程实现，本站保留 FIT 的准确名称。', settings: [['端口', 'ymin 边界 Waveguide Port · 无 HFSS 背板'], ['开域', '开放边界 / 时域计算域'], ['离散', '六面体 PBA · 20 lines / λ'], ['求解', '时域收敛 −40 dB'], ['网格', '贴片 1 mm · 馈线 / 槽 0.5 mm']] },
  feko: { title: 'FEKO', method: 'Method of Moments / SEP', description: '以金属和介质表面离散求解，高频宽带形态较接近；低频匹配对 Edge Port 局部接口更敏感。', settings: [['端口', '50 Ω Edge Port · 蝶形过渡'], ['接口', '仅下基板端部局部避让'], ['离散', '1,124 PEC + 2,512 介质表面三角形'], ['未知量', '10,374 MoM 未知量'], ['频率', '报告记录 56 个真实采样点 · 导出 1101 点']] },
}

function SolverComparison() {
  const [solver, setSolver] = useState<SolverId>('hfss')
  const [band, setBand] = useState(0)
  const current = solverContent[solver]
  return <>
    <div className="solver-layout"><div className="solver-card">
      <div className="solver-tabs" role="tablist" aria-label="求解器设置">{solverIds.map((id) => <button role="tab" aria-controls={`solver-${id}`} aria-selected={solver === id} key={id} onClick={() => setSolver(id)}>{solverContent[id].title}</button>)}</div>
      <div role="tabpanel" id={`solver-${solver}`}><span className="case-kicker">{current.method}</span><h3>{current.title} <em>/ {solver.toUpperCase() === 'CST' ? 'FIT' : solver === 'hfss' ? 'FEM' : 'MoM + SEP'}</em></h3><p>{current.description}</p><dl>{current.settings.map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl></div>
    </div><div className="metric-card"><span className="case-kicker">FULL-BAND ERROR / 全频段误差</span><h3>与论文实测曲线比较</h3><p className="case-small">2–7.5 GHz · S11 dB 域 RMSE · 越小越接近</p><div className="rmse-bars">{solverIds.map((id) => <div key={id}><div><span>{solverContent[id].title}</span><strong>{data.metrics[id].rmse.toFixed(2)} <small>dB</small></strong></div><span className="rmse-track"><span style={{ width: `${data.metrics[id].rmse / 6 * 100}%`, background: curveStyles[id].color }} /></span></div>)}</div><p className="case-small">当前模型比较同时受到端口参考与夹具差异影响，不能据此推断求解算法的一般优劣。</p></div></div>
    <div className="band-table-card"><div className="chart-toolbar"><h3>目标频段，逐一核对。</h3><label>目标窗口 <select aria-label="选择指标频段" value={band} onChange={(event) => setBand(Number(event.target.value))}>{data.windows.map(([a, b], i) => <option value={i} key={i}>{a}–{b} GHz</option>)}</select></label></div>
      <div className="table-scroll"><table><caption className="sr-only">目标窗口最低值、频移与阈值带宽</caption><thead><tr><th scope="col">来源</th><th scope="col">最低点 GHz</th><th scope="col">S11 dB</th><th scope="col">频移 MHz</th><th scope="col">−6 dB 带宽 MHz</th><th scope="col">−10 dB 带宽 MHz</th><th scope="col">判定</th></tr></thead><tbody>{data.bands.filter((row) => row.window === data.bands[band * 5].window).map((row) => <tr key={row.curve}><th scope="row">{curveStyles[row.curve as CurveId].label}</th><td>{row.frequency.toFixed(3)}</td><td>{row.minimum.toFixed(2)}</td><td>{row.interior ? fmt(row.shift) : '—'}</td><td>{fmt(row.bandwidth6)}</td><td>{fmt(row.bandwidth10)}</td><td><span className={`minimum-status ${row.interior ? '' : 'boundary'}`}>{row.interior ? '窗口内最低点' : '窗口边界最低值'}</span></td></tr>)}</tbody></table></div>
      <p className="case-small">边界最低值不认定为局部谐振，不计入谐振频差均值。带宽沿包含最低点的连续阈值区间计算，可能跨越目标窗口；未达到阈值时不提供带宽。</p>
    </div>
  </>
}

export default function CaseStudies({ selected }: { selected: string | null }) {
  const detail = selected === slug
  const goTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
  useEffect(() => { document.getElementById('cases')?.scrollTo({ top: 0, behavior: 'instant' }); document.title = selected === 'blc-baseline' ? `单节分支线耦合器 · baseline | ${siteIdentity.name}` : detail ? `二维码网格贴片天线复现 · Lavax | ${siteIdentity.name}` : `Case Studies · ${siteIdentity.name}`; return () => { document.title = siteIdentity.title } }, [detail, selected])
  if (selected === 'blc-baseline') return <BLCCase />
  if (selected && !detail) return <div className="panel-inner case-page"><h1>未找到这个案例</h1><a className="back-link" href="#cases">← Back to Case Studies</a></div>
  if (!detail) return <div className="panel-inner case-page case-gallery-page">
    <h1 className="case-gallery-title">Case Studies</h1>
    <div className="case-gallery-grid">
    <a className="case-feature" href={`#/cases/${slug}`}><div className="case-cover"><PixelArt /><span className="cover-number">CASE / 001</span><span className="cover-label">MULTIBAND PATCH ANTENNA</span></div><div className="case-feature-copy"><div className="case-badges"><span>论文复现</span><span>AI 辅助</span><span>可下载</span></div><h3>二维码网格贴片天线</h3></div></a>
    <a className="case-feature blc-gallery-card" href="#/cases/blc-baseline"><div className="case-cover"><BLCArt /><span className="cover-number">MODEL / 002</span><span className="cover-label">BRANCH-LINE COUPLER / BASELINE</span></div><div className="case-feature-copy"><div className="case-badges"><span>HFSS 模型</span><span>baseline</span><span>可下载</span></div><h3>单节 3 dB 分支线耦合器</h3></div></a>
    </div>
  </div>
  return <div className="panel-inner case-page case-detail">
    <a className="back-link" href="#cases">← Back to Case Studies</a>
    <header className="case-hero"><div><p className="eyebrow">CASE / 001 · AI-ASSISTED REPRODUCTION</p><h1>二维码网格贴片天线<span>跨三种求解器的<em>论文复现。</em></span></h1><p className="case-lede">同一份论文，同一个终态结构。用三种全波数值方法，核对模型与结果之间的距离。</p><div className="case-badges"><span>Lavax · 复现与分析</span><span>工程归档 2026-08-04</span><span>HFSS / CST / FEKO</span></div></div><div className="case-hero-art"><PixelArt compact /></div></header>
    <SourceBlock />
    <QRDownloads />
    <div className="case-overview-metrics"><div><span>COMPARISON RANGE</span><strong>2–7.5 <small>GHz</small></strong></div><div><span>HFSS FULL-BAND RMSE</span><strong>2.59 <small>dB</small></strong></div><div><span>HFSS RESONANCE MAE</span><strong>{oneDecimal(data.metrics.hfss.frequencyMAE)} <small>MHz</small></strong></div><div><span>SHARED GEOMETRY</span><strong>72 <small>pixels / 16 bridges</small></strong></div></div>
    <nav className="case-toc" aria-label="案例章节导航"><span>ON THIS PAGE</span>{[['case-structure', '01 结构'], ['case-results', '02 曲线'], ['case-solvers', '03 方法与指标'], ['case-discussion', '04 误差分析'], ['case-evidence', '05 工程依据']].map(([id, text]) => <button onClick={() => goTo(id)} key={id}>{text}</button>)}</nav>
    <section id="case-structure" className="case-section"><div className="case-section-heading"><span className="case-kicker">01 / SHARED GEOMETRY</span><h2>先建立共同的<em>工程对象。</em></h2><p>16 × 8 像素设计域保留 72 个单元，以 16 处旋转角点连接维持接触；层叠和材料沿用论文。</p></div><AntennaModel /></section>
    <section id="case-results" className="case-section"><div className="case-section-heading"><span className="case-kicker">02 / SIMULATION MEETS REFERENCE</span><h2>把差异放在<em>同一坐标里。</em></h2><p>切换目标窗口观察局部匹配，或隐藏曲线聚焦某一种求解方法。参考曲线来自原论文图像数字化。</p></div><S11Chart /></section>
    <section id="case-solvers" className="case-section"><div className="case-section-heading"><span className="case-kicker">03 / METHODS & METRICS</span><h2>比较结果，也比较<em>建模条件。</em></h2><p>相同几何并不意味着端口完全等价。每一种求解器的输入参考和离散方式，都影响曲线的解释。</p></div><SolverComparison /></section>
    <section id="case-discussion" className="case-section"><div className="case-section-heading"><span className="case-kicker">04 / UNDERSTANDING THE GAP</span><h2>偏差本身，<em>也是研究结果。</em></h2></div><div className="discussion-grid">{[
      ['01', '端口并不完全等价', 'HFSS 使用本征 Zpi 与 PEC 背板，FEKO 使用 50 Ω Edge Port，CST 使用计算域边界 Waveguide Port。不能将这些输入匹配差异全部归因于数值算法。'],
      ['02', '宽带里有多个局部模式', '5.42–6.36 GHz 窗口中多个相近谷值竞争。仅比较最深谷的位置，会夸大某些软件相对论文的频移；应结合完整曲线与连续带宽观察。'],
      ['03', '频率接近，深度仍可能不同', '6.49–6.95 GHz 内 HFSS 与 CST 的谷值较深。未建模的 SMA、理想 PEC 与网格处理均可能影响高 Q 谷值；本案例未进行几何调参。'],
      ['04', '参考数据也有读取误差', '论文曲线是从 Fig. 16 数字化的 1101 点。图像线宽、抗锯齿和分辨率带来读取误差；RMSE 衡量当前复现与图像参考之间的距离。'],
    ].map(([number, title, text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section id="case-evidence" className="case-section"><div className="case-section-heading"><span className="case-kicker">05 / ENGINEERING EVIDENCE</span><h2>从图形，回到<em>可追溯的工程。</em></h2></div><div className="evidence-list">{[
      ['HFSS / AEDT 2026 R1', 'QR_Patch_FEM_ModalRegion_20260728_v1.aedt', 'Modal Network · 最终导出 S11 与统计记录'],
      ['CST 2026.1', 'QR_Patch_CST_TD_WaveguidePort_20260728_v1.cst', 'FIT 时域 · 最终导出 S11'],
      ['FEKO 2026.0', 'QR_Patch_MoM_EdgePort_20260728_v3.cfx / .fek', 'MoM / SEP · 最终导出 S11'],
      ['课程论文 / Lavax', 'FDTD、MoM、FEM 二维码网格贴片天线课程论文', '方法、评价规则和结果分析依据'],
    ].map(([name, file, note]) => <div key={name}><strong>{name}</strong><span>{file}</span><small>{note}</small></div>)}</div><p className="case-small evidence-note">网页展示所需曲线与参数随静态页面公开，并提供三套软件的核心工程下载；完整结果与缓存目录、原论文及课程论文原文件不随下载包分发。AI 辅助复现属于研究实践，当前页面未声明 {siteIdentity.name} 已具备全流程自动化能力。</p></section>
    <footer className="case-end"><div><span className="case-kicker">FROM PAPER TO VERIFIED ENGINEERING</span><p>一次复现，是下一次自动化的依据。</p></div>{isPanelEnabled('paper2hfss') ? <a className="button button-quiet" href="#paper2hfss">了解 Paper2HFSS →</a> : <a className="button button-quiet" href="#cases">Back to Case Studies →</a>}</footer>
  </div>
}
