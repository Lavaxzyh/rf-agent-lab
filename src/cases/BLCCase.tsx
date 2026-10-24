import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import model from '../data/blc-baseline.json'
import './blc.css'

export function BLCArt() {
  const p = model.parameters
  return <svg viewBox="-7 -4.6 14 9.2" className="blc-art" role="img" aria-label="baseline 分支线耦合器导体俯视图，尺寸依据工程参数">
    <defs><pattern id="blc-layout-grid" width=".5" height=".5" patternUnits="userSpaceOnUse"><path d="M.5 0H0V.5" fill="none" stroke="currentColor" strokeOpacity=".08" strokeWidth=".015" /></pattern></defs>
    <rect x="-7" y="-4.6" width="14" height="9.2" fill="url(#blc-layout-grid)" />
    <rect x={-model.board.width / 2} y={-model.board.height / 2} width={model.board.width} height={model.board.height} fill="#65e7d1" fillOpacity=".035" stroke="#36535e" strokeWidth=".025" />
    <g transform="scale(1 -1)" fill="currentColor">{model.rects.map((rect) => <rect key={rect.name} x={rect.x} y={rect.y} width={rect.width} height={rect.height} />)}</g>
    {model.ports.map((port) => <g key={port.name}><circle cx={port.x} cy={-port.y} r=".105" fill="#e4c79a" /><text x={port.x + (port.x < 0 ? -.45 : .45)} y={-port.y + .16} textAnchor={port.x < 0 ? 'end' : 'start'} fill="#b9cccc" fontSize=".4" fontFamily="monospace">{port.name}</text></g>)}
    <text x="-5.4" y="-3.8" fill="#8ea7aa" fontSize=".28" fontFamily="monospace">BASELINE / CONDUCTOR LAYOUT</text>
    <text x="-5.4" y="4.1" fill="#8ea7aa" fontSize=".27" fontFamily="monospace">Lmain {p.lmain} · Lbranch {p.lbranch} mm</text>
  </svg>
}

type DisplayState = { substrate: boolean; ground: boolean; ports: boolean; separated: boolean; rotate: boolean }
const defaults: DisplayState = { substrate: true, ground: true, ports: true, separated: false, rotate: false }

function BLCViewer() {
  const host = useRef<HTMLDivElement>(null)
  const actions = useRef<{ update: (state: DisplayState) => void; view: (top: boolean) => void } | null>(null)
  const [display, setDisplay] = useState<DisplayState>(defaults)
  const [fallback, setFallback] = useState(false)
  useEffect(() => {
    const stage = host.current
    if (!stage) return
    let renderer: THREE.WebGLRenderer
    try { renderer = new THREE.WebGLRenderer({ antialias: true }) }
    catch { setFallback(true); return }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1
    renderer.domElement.setAttribute('aria-label', 'baseline 耦合器三维模型：拖动旋转，滚轮缩放，也可使用视角按钮')
    renderer.domElement.setAttribute('role', 'img')
    stage.appendChild(renderer.domElement)
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#081925')
    const camera = new THREE.PerspectiveCamera(38, 1, .05, 250)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true; controls.dampingFactor = .075
    controls.minDistance = 10; controls.maxDistance = 90
    controls.autoRotate = false; controls.autoRotateSpeed = .45
    const setView = (top: boolean) => {
      controls.enableDamping = false
      // update once to consume pending orbit/pan momentum, then restore exact defaults.
      controls.update()
      camera.up.set(0, top ? 0 : 1, top ? -1 : 0)
      camera.position.set(top ? 0 : 26, top ? 42 : 24, top ? .001 : 26)
      controls.target.set(0, .5, 0)
      controls.update(); controls.enableDamping = true
    }
    setView(false)
    scene.add(new THREE.HemisphereLight(0xd8fff1, 0x152c46, 2.5))
    const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(15, 30, 20); scene.add(key)
    const rim = new THREE.DirectionalLight(0x65e7d1, 1.3); rim.position.set(-20, 15, -10); scene.add(rim)
    const grid = new THREE.GridHelper(36, 36, 0x355c64, 0x16303c); grid.position.y = -.16; scene.add(grid)
    const p = model.parameters
    const substrate = new THREE.Group(), ground = new THREE.Group(), signal = new THREE.Group(), ports = new THREE.Group()
    scene.add(substrate, ground, signal, ports)
    const substrateGeometry = new THREE.BoxGeometry(model.board.width, p.hsub, model.board.height)
    const dielectric = new THREE.MeshStandardMaterial({ color: 0x367a7d, roughness: .65, transparent: true, opacity: .42, depthWrite: false })
    const substrateMesh = new THREE.Mesh(substrateGeometry, dielectric); substrateMesh.position.y = p.hsub / 2; substrate.add(substrateMesh)
    const substrateEdges = new THREE.LineSegments(new THREE.EdgesGeometry(substrateGeometry), new THREE.LineBasicMaterial({ color: 0x7db1b0, transparent: true, opacity: .5 }))
    substrateEdges.position.copy(substrateMesh.position); substrate.add(substrateEdges)
    const groundMesh = new THREE.Mesh(new THREE.PlaneGeometry(model.board.width, model.board.height), new THREE.MeshStandardMaterial({ color: 0x344952, metalness: .5, roughness: .55, side: THREE.DoubleSide }))
    groundMesh.rotation.x = -Math.PI / 2; groundMesh.position.y = -.003; ground.add(groundMesh)

    // Union the eight rectangles into disjoint cells; no overlapping surfaces or made-up dimensions.
    const xs = [...new Set(model.rects.flatMap((r) => [r.x, r.x + r.width]))].sort((a, b) => a - b)
    const ys = [...new Set(model.rects.flatMap((r) => [r.y, r.y + r.height]))].sort((a, b) => a - b)
    const occupied = (i: number, j: number) => {
      if (i < 0 || j < 0 || i >= xs.length - 1 || j >= ys.length - 1) return false
      const x = (xs[i] + xs[i + 1]) / 2, y = (ys[j] + ys[j + 1]) / 2
      return model.rects.some((r) => x > r.x && x < r.x + r.width && y > r.y && y < r.y + r.height)
    }
    const vertices: number[] = [], edges: number[] = []
    for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < ys.length - 1; j++) {
      if (!occupied(i, j)) continue
      const a = [xs[i], p.hsub, -ys[j]], b = [xs[i + 1], p.hsub, -ys[j]], c = [xs[i + 1], p.hsub, -ys[j + 1]], d = [xs[i], p.hsub, -ys[j + 1]]
      vertices.push(...a, ...b, ...c, ...a, ...c, ...d)
      if (!occupied(i, j - 1)) edges.push(...a, ...b)
      if (!occupied(i + 1, j)) edges.push(...b, ...c)
      if (!occupied(i, j + 1)) edges.push(...c, ...d)
      if (!occupied(i - 1, j)) edges.push(...d, ...a)
    }
    const signalGeometry = new THREE.BufferGeometry(); signalGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); signalGeometry.computeVertexNormals()
    signal.add(new THREE.Mesh(signalGeometry, new THREE.MeshStandardMaterial({ color: 0xe4c79a, metalness: .58, roughness: .4, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 })))
    const edgeGeometry = new THREE.BufferGeometry(); edgeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(edges, 3))
    signal.add(new THREE.LineSegments(edgeGeometry, new THREE.LineBasicMaterial({ color: 0xffdca3 })))
    for (const port of model.ports) {
      const portMesh = new THREE.Mesh(new THREE.PlaneGeometry(p.port_w, p.port_h), new THREE.MeshBasicMaterial({ color: 0x65e7d1, side: THREE.DoubleSide, transparent: true, opacity: .08, depthWrite: false }))
      portMesh.rotation.y = Math.PI / 2; portMesh.position.set(port.x, p.port_h / 2, -port.y); ports.add(portMesh)
      const outline = new THREE.LineSegments(new THREE.EdgesGeometry(portMesh.geometry), new THREE.LineBasicMaterial({ color: 0x65e7d1, transparent: true, opacity: .5 }))
      outline.rotation.copy(portMesh.rotation); outline.position.copy(portMesh.position); ports.add(outline)
    }
    const update = (state: DisplayState) => {
      substrate.visible = state.substrate; ground.visible = state.ground; ports.visible = state.ports
      substrate.position.y = state.separated ? 1.3 : 0
      signal.position.y = state.separated ? 3 : 0
      controls.autoRotate = state.rotate
    }
    actions.current = { update, view: setView }
    update(defaults)
    const resize = () => { const width = stage.clientWidth, height = stage.clientHeight; if (!width || !height) return; renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix() }
    const observer = new ResizeObserver(resize); observer.observe(stage); resize()
    let frame = 0
    const draw = () => {
      frame = requestAnimationFrame(draw); controls.update()
      renderer.render(scene, camera)
    }
    draw()
    return () => {
      cancelAnimationFrame(frame); observer.disconnect(); controls.dispose(); actions.current = null
      scene.traverse((object) => { const mesh = object as THREE.Mesh; mesh.geometry?.dispose(); if (mesh.material) for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) material.dispose() })
      renderer.dispose(); renderer.domElement.remove()
    }
  }, [])
  useEffect(() => { actions.current?.update(display) }, [display])
  const reset = () => { setDisplay({ ...defaults }); actions.current?.update(defaults); actions.current?.view(false) }
  return <figure className="model-card blc-model">
    <div className="model-status"><span>BASELINE / 3D MODEL</span><span>UNIT · mm</span></div>
    <div className="blc-stage" ref={host}>{fallback && <div className="blc-fallback"><BLCArt /><p>当前环境不支持 WebGL，已显示导体俯视图。HFSS 工程仍可下载。</p></div>}</div>
    <div className="blc-view-controls"><div className="model-actions"><button disabled={fallback} onClick={() => actions.current?.view(false)}>45° 视角</button><button disabled={fallback} onClick={() => actions.current?.view(true)}>俯视</button><button disabled={fallback} aria-pressed={display.rotate} onClick={() => setDisplay((current) => ({ ...current, rotate: !current.rotate }))}>Auto rotate · {display.rotate ? 'ON' : 'OFF'}</button><button disabled={fallback} onClick={reset}>重置视角与显示 ↺</button></div>
      <div className="blc-toggles">{([['substrate', '基板'], ['ground', '接地面'], ['ports', '端口面'], ['separated', '分层展示']] as const).map(([key, label]) => <label key={key}><input type="checkbox" disabled={fallback} checked={display[key]} onChange={(event) => setDisplay((current) => ({ ...current, [key]: event.target.checked }))} />{label}</label>)}</div>
    </div>
    <figcaption>按 baseline 工程参数重建 · 拖动旋转，滚轮缩放。{display.separated ? '当前为分层示意，层间距离不代表实际厚度。' : '金属为零厚度 PEC 面。'}</figcaption>
  </figure>
}

export default function BLCCase() {
  const downloadRoot = `${import.meta.env.BASE_URL}models/blc-baseline/`
  return <div className="panel-inner case-page blc-page">
    <a className="back-link" href="#cases">← Back to Case Studies</a>
    <header className="blc-header"><div><p className="eyebrow">MODEL / 002 · HFSS · BASELINE</p><h1>单节 3 dB <em>分支线耦合器。</em></h1><p>四端口、单节微带结构，用于等功率分配与正交相位输出。基于 RO4360G2 基板，展示 baseline 定稿参数。</p></div><span className="blc-header-stamp">BLC<br /><small>BRANCH-LINE COUPLER</small></span></header>
    <div className="blc-layout"><BLCViewer /><aside className="blc-details"><p className="case-kicker">MODEL AT A GLANCE</p><h2>baseline <em>/ HFSS</em></h2>
      <dl><div><dt>仿真频段</dt><dd>7.25–8.4 GHz</dd></div><div><dt>基板</dt><dd>RO4360G2 · 0.508 mm</dd></div><div><dt>材料参数</dt><dd>εr 6.4 · tanδ 0.0038</dd></div><div><dt>端口</dt><dd>4 × Wave Port · 50 Ω 归一化</dd></div></dl>
      <p className="blc-port-legend">P1 输入 · P2 直通<br />P3 耦合 · P4 隔离</p>
      <div className="blc-download"><a className="button button-primary" href={`${downloadRoot}${model.download.file}`} download="blc_baseline.aedt">下载 baseline 工程 <span>↓</span></a><p>.aedt · {(model.download.bytes / 1024).toFixed(1)} KB<br />HFSS / AEDT 2026 R1<br />仅工程文件，不含求解缓存。</p><a className="blc-parameters-link" href={`${downloadRoot}parameters.json`} download="blc-baseline-parameters.json">参数 JSON ↓</a></div>
    </aside></div>
    <footer className="blc-credit"><span>模型来源 / Lavax · BLC Pipeline Demo · baseline</span><span>工程归档 / {model.archived}</span></footer>
  </div>
}
