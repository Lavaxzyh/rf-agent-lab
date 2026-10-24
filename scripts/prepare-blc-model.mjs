import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs'
import { resolve, join } from 'node:path'

// Read-only inspection of the supplied research folder. Never imports/runs its scripts.
const source = process.argv[2]
if (!source) throw new Error('Provide the blc_pipeline_demo directory')
const sourceDirectory = resolve(source)
const sourceProject = join(sourceDirectory, 'results', 'blc_baseline.aedt')
const original = readFileSync(sourceProject)
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex')
const hash = sha256(original)
const text = original.toString('utf8')
assert(!/[A-Za-z]:[\\/]/.test(text), 'Project contains a local absolute path; inspect before publishing')

const root = { name: 'root', lines: [], children: [] }
const stack = [root]
for (const line of text.split(/\r?\n/)) {
  const begin = line.match(/^\s*\$begin '([^']+)'/)
  const end = line.match(/^\s*\$end '([^']+)'/)
  if (begin) {
    const node = { name: begin[1], lines: [], children: [] }
    stack.at(-1).children.push(node); stack.push(node)
  } else if (end) {
    assert.equal(stack.pop().name, end[1], 'Unbalanced AEDT project block')
  } else stack.at(-1).lines.push(line.trim())
}
assert.equal(stack.length, 1)
function findAll(node, predicate) {
  return [...(predicate(node) ? [node] : []), ...node.children.flatMap((child) => findAll(child, predicate))]
}
const values = (node) => Object.fromEntries(node.lines.flatMap((line) => {
  const pair = line.match(/^(\w+)=(.*)$/)
  return pair ? [[pair[1], pair[2].replace(/^'|'$/g, '')]] : []
}))
const parameters = Object.fromEntries([...text.matchAll(/VariableProp\('(\w+)', 'UD', '', '([^']+)'/g)].map((item) => [item[1], item[2]]))
const config = JSON.parse(readFileSync(join(sourceDirectory, 'config', 'cases.json'), 'utf8')).cases.find((item) => item.tag === 'baseline')
const summary = JSON.parse(readFileSync(join(sourceDirectory, 'results', 'summary.json'), 'utf8')).find((item) => item.tag === 'baseline')
const manifest = JSON.parse(readFileSync(join(sourceDirectory, 'results', 'baseline_manifest.json'), 'utf8'))
const names = { Lmain: 'lmain', Lbranch: 'lbranch', Wmain: 'wmain', Wbranch: 'wbranch', Wfeed: 'wfeed', Lfeed: 'lfeed', Hsub: 'hsub', BoardW: 'board_w', AirH: 'air_h', PortW: 'port_w', PortH: 'port_h' }
for (const [projectName, key] of Object.entries(names)) {
  assert.equal(parameters[projectName], `${config[key]}mm`, projectName)
  assert.equal(summary.params[key], config[key], `${key}: saved summary/config mismatch`)
}
const p = summary.params
const parts = findAll(root, (node) => node.name === 'ToplevelParts')[0].children.filter((node) => node.name === 'GeometryPart')
assert.equal(parts.length, 8)
const rectangles = findAll(root, (node) => node.name === 'RectangleParameters')
assert.equal(rectangles.length, 13)
assert.equal(rectangles.filter((node) => values(node).WhichAxis === 'Z').length, 9)
assert.equal(rectangles.filter((node) => values(node).WhichAxis === 'X').length, 4)
const ports = findAll(root, (node) => values(node).BoundType === 'Wave Port')
assert.deepEqual(ports.map((node) => node.name).sort(), ['P1', 'P2', 'P3', 'P4'])
for (const port of ports) {
  assert.equal(values(port).NumModes, '1')
  assert(findAll(port, (node) => values(node).RenormImp === '50ohm').length > 0)
}
assert(text.includes("Name='BLC_Pipeline_Demo'") && text.includes("SolutionType='HFSS Modal Network'"))
assert(text.includes("permittivity='6.4'") && text.includes("dielectric_loss_tangent='0.0038'"))
for (const line of ["RangeStart='7.25GHz'", "RangeEnd='8.4GHz'", "RangeStep='0.025GHz'"]) assert(text.includes(line))
const halfX = p.lmain / 2 + p.lfeed
function checkBox(actual, expected) {
  assert.equal(actual.length, 6)
  actual.forEach((value, i) => assert(Math.abs(value - expected[i]) < 1e-6))
}
checkBox(manifest.audit.substrate_bbox, [-halfX, -p.board_w / 2, 0, halfX, p.board_w / 2, p.hsub])
checkBox(manifest.audit.ground_bbox, [-halfX, -p.board_w / 2, 0, halfX, p.board_w / 2, 0])
checkBox(manifest.audit.signal_bbox, [-halfX, -(p.lbranch + p.wmain) / 2, p.hsub, halfX, (p.lbranch + p.wmain) / 2, p.hsub])
const portPositions = [[-halfX, p.lbranch / 2], [halfX, p.lbranch / 2], [halfX, -p.lbranch / 2], [-halfX, -p.lbranch / 2]]
portPositions.forEach(([x, y], i) => checkBox(manifest.audit.port_bboxes[`Port${i + 1}_Sheet`], [x, y - p.port_w / 2, 0, x, y + p.port_w / 2, p.port_h]))

function csv(filename) {
  const rows = readFileSync(join(sourceDirectory, 'results', filename), 'utf8').trim().split(/\r?\n/).map((line) => {
    let quoted = false; let field = ''; const result = []
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') {
        if (quoted && line[i + 1] === '"') { field += '"'; i++ } else quoted = !quoted
      } else if (line[i] === ',' && !quoted) { result.push(field); field = '' } else field += line[i]
    }
    return [...result, field]
  })
  const headers = rows.shift()
  return rows.map((row, i) => {
    assert.equal(row.length, headers.length)
    const sample = Object.fromEntries(headers.map((name, j) => [name, Number(row[j])]))
    assert(Object.values(sample).every(Number.isFinite))
    assert(Math.abs(sample['Freq [GHz]'] - (p.f_start + i * p.f_step)) < 1e-8)
    for (const name of Object.keys(names)) assert.equal(sample[`${name} [mm]`], p[names[name]])
    return sample
  })
}
const s = csv('baseline_S.csv'), phase = csv('baseline_Phase.csv'), zo = csv('baseline_PortZo.csv')
assert.equal(s.length, 47); assert.equal(phase.length, 47); assert.equal(zo.length, 47)
const center = s.findIndex((row) => Math.abs(row['Freq [GHz]'] - p.f_center) < 1e-8)
assert(center > 0)
const centerChecks = Object.entries({ s11_dB: 'dB(S(P1,P1)) []', s21_dB: 'dB(S(P2,P1)) []', s31_dB: 'dB(S(P3,P1)) []', s41_dB: 'dB(S(P4,P1)) []' }).map(([metric, column]) => ({ metric, reported: summary.metrics[metric], at8GHz: s[center][column], matches: Math.abs(summary.metrics[metric] - s[center][column]) < 1e-8 }))
const warnings = centerChecks.some((check) => !check.matches) ? ['The archived summary center-frequency values do not match the CSV row whose Freq [GHz] equals 8.0. No performance metrics are published in this model page.'] : []
const rects = [
  { name: 'Feed_P1', x: -halfX, y: p.lbranch / 2 - p.wfeed / 2, width: p.lfeed, height: p.wfeed },
  { name: 'Feed_P2', x: p.lmain / 2, y: p.lbranch / 2 - p.wfeed / 2, width: p.lfeed, height: p.wfeed },
  { name: 'Feed_P3', x: p.lmain / 2, y: -p.lbranch / 2 - p.wfeed / 2, width: p.lfeed, height: p.wfeed },
  { name: 'Feed_P4', x: -halfX, y: -p.lbranch / 2 - p.wfeed / 2, width: p.lfeed, height: p.wfeed },
  { name: 'Top_Main', x: -p.lmain / 2, y: (p.lbranch - p.wmain) / 2, width: p.lmain, height: p.wmain },
  { name: 'Bot_Main', x: -p.lmain / 2, y: -(p.lbranch + p.wmain) / 2, width: p.lmain, height: p.wmain },
  { name: 'Left_Branch', x: -(p.lmain + p.wbranch) / 2, y: -p.lbranch / 2, width: p.wbranch, height: p.lbranch },
  { name: 'Right_Branch', x: (p.lmain - p.wbranch) / 2, y: -p.lbranch / 2, width: p.wbranch, height: p.lbranch },
]
const model = {
  id: 'blc-baseline', title: '单节 3 dB 分支线耦合器', variant: 'baseline', author: 'Lavax', archived: '2026-10-10',
  software: 'Ansys HFSS / AEDT 2026 R1', design: 'BLC_Pipeline_Demo', units: 'mm',
  material: { name: 'RO4360G2', permittivity: 6.4, lossTangent: 0.0038 },
  parameters: p, board: { width: 2 * halfX, height: p.board_w, thickness: p.hsub }, rects,
  ports: portPositions.map(([x, y], i) => ({ name: `P${i + 1}`, x, y, role: ['输入', '直通', '耦合', '隔离'][i] })),
  download: { file: 'blc_baseline.aedt', bytes: original.length, sha256: hash, includesResults: false },
}
const outputDirectory = resolve('public/models/blc-baseline')
const jsonDirectory = resolve('src/data')
mkdirSync(outputDirectory, { recursive: true }); mkdirSync(jsonDirectory, { recursive: true }); mkdirSync('.local-preview', { recursive: true })
copyFileSync(sourceProject, join(outputDirectory, 'blc_baseline.aedt'))
writeFileSync(join(outputDirectory, 'parameters.json'), `${JSON.stringify(model, null, 2)}\n`)
writeFileSync(join(jsonDirectory, 'blc-baseline.json'), `${JSON.stringify(model, null, 2)}\n`)
assert.equal(sha256(readFileSync(sourceProject)), hash, 'Source was changed')
assert.equal(sha256(readFileSync(join(outputDirectory, 'blc_baseline.aedt'))), hash, 'Download differs from protected source')
writeFileSync('.local-preview/blc-validation.json', `${JSON.stringify({ scope: 'Static project/config/CSV/browser validation only; no AEDT connection or solve', sourceProject, sourceSha256: hash, sourceUnchanged: true, geometryParts: parts.length, wavePorts: ports.length, samples: s.length, frequencyColumn: 'Freq [GHz]', warnings, centerChecks, downloadIncludesResults: false }, null, 2)}\n`)
console.log(JSON.stringify({ pass: true, geometryParts: parts.length, ports: ports.length, samples: s.length, sha256: hash, warnings, sourceUnchanged: true }, null, 2))
