import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import assert from 'node:assert/strict'

// Emits sanitized public data on stdout. The caller saves it using apply_patch.
// Usage: node scripts/prepare-case-data.mjs <local research directory>
const root = process.argv[2]
assert(root, 'Pass the local research directory')
const csv = (path) => {
  const lines = readFileSync(join(root, path), 'utf8').trim().split(/\r?\n/)
  return lines.slice(1).map((line) => line.split(',').map((cell) => cell.replace(/^"|"$/g, '')))
}
const archive = '三个软件最终工程_20260804'
const paper = csv('reference/paper_fig16_digitized.csv')
const curve = (rows, column = 1) => rows.map((row) => [Number(row[0]), Number(row[column])])
const curves = {
  measurement: curve(paper, 2),
  paperFEM: curve(paper),
  hfss: curve(csv(`${archive}/01_HFSS_FEM_ModalNetwork/exports/HFSS_S11_dB.csv`)),
  cst: curve(csv(`${archive}/03_CST_TD_WaveguidePort/exports/CST_S11_dB.csv`)),
  feko: curve(csv(`${archive}/02_FEKO_MoM_EdgePort/exports/FEKO_S11_dB.csv`)),
}
for (const [name, points] of Object.entries(curves)) {
  assert.equal(points.length, 1101, `${name}: expected 1101 samples`)
  points.forEach(([f, y], i) => {
    assert(Number.isFinite(f) && Number.isFinite(y), `${name}: non-finite sample`)
    assert(Math.abs(f - (2 + i * 0.005)) < 0.000002, `${name}: frequency grid mismatch`)
  })
}
const ids = { HFSS_FEM: 'hfss', CST_FIT: 'cst', FEKO_MoM: 'feko', paper_measurement: 'measurement', paper_simulation: 'paperFEM' }
const number = (value) => value === '' ? null : Number(value)
const interpolate = (points, f) => {
  let i = Math.max(0, Math.min(points.length - 2, Math.floor((f - 2) / 0.005)))
  while (i > 0 && points[i][0] > f) i--
  while (i < points.length - 2 && points[i + 1][0] < f) i++
  if (f <= points[0][0]) return points[0][1]
  if (f >= points.at(-1)[0]) return points.at(-1)[1]
  const [a, b] = [points[i], points[i + 1]]
  return a[1] + (b[1] - a[1]) * (f - a[0]) / (b[0] - a[0])
}
const metrics = Object.fromEntries(csv('tmp/course_paper/assets/curve_error_summary.csv').map((row) => {
  const id = ids[row[0]]
  const recomputed = Math.sqrt(curves.measurement.reduce((sum, [f, y]) => sum + (interpolate(curves[id], f) - y) ** 2, 0) / 1101)
  assert(Math.abs(recomputed - Number(row[1])) < 0.000001, `${id}: RMSE does not match course paper`)
  return [id, { rmse: Number(row[1]), windowRmse: Number(row[2]), validResonances: Number(row[4]), frequencyMAE: Number(row[5]) }]
}))
const bands = csv('tmp/course_paper/assets/paper_metrics.csv').map((row) => ({
  window: row[0], curve: ids[row[1]], frequency: Number(row[2]), minimum: Number(row[3]),
  interior: row[4] === 'True', bandwidth6: number(row[5]), bandwidth10: number(row[6]), shift: Number(row[7]),
}))
assert.equal(bands.length, 20)
for (const record of bands) {
  const [low, high] = record.window.split('–').map(Number)
  const windowPoints = curves[record.curve].filter(([f]) => f >= low - 1e-6 && f <= high + 1e-6)
  const minimum = windowPoints.reduce((best, point) => point[1] < best[1] ? point : best)
  assert(Math.abs(minimum[0] - record.frequency) < 1e-8, `${record.curve}: window frequency mismatch`)
  assert(Math.abs(minimum[1] - record.minimum) < 1e-8, `${record.curve}: window minimum mismatch`)
  assert.equal(record.interior, minimum !== windowPoints[0] && minimum !== windowPoints.at(-1))
}
for (const [id, metric] of Object.entries(metrics)) {
  const valid = bands.filter((record) => record.curve === id && record.interior)
  assert.equal(valid.length, metric.validResonances)
  const mae = valid.reduce((sum, record) => sum + Math.abs(record.shift), 0) / valid.length
  assert(Math.abs(mae - metric.frequencyMAE) < 1e-8, `${id}: frequency MAE mismatch`)
}
const config = JSON.parse(readFileSync(join(root, 'qr_patch_parameters.json'), 'utf8'))
const occupied = config.top_patch.matrix.join('').split('').filter((v) => v === '1').length
assert.equal(occupied, 72)
const bridges = []
const matrix = config.top_patch.matrix
for (let row = 0; row < 7; row++) for (let col = 0; col < 15; col++) {
  const a = matrix[row][col] === '1', b = matrix[row][col + 1] === '1'
  const c = matrix[row + 1][col] === '1', d = matrix[row + 1][col + 1] === '1'
  if (a && d && !b && !c || b && c && !a && !d) bridges.push({
    x: -24 + (col + 1) * 3, y: 14 + (row + 1) * 3, rotation: a ? 45 : -45,
  })
}
assert.equal(bridges.length, 16)
const data = {
  source: {
    title: config.paper.title, doi: config.paper.doi, url: 'https://ieeexplore.ieee.org/document/11217334',
    authors: 'X. Ma, Y. Zong, P. Zhang, J. Chen, Z. Ren, Z. Liu, and C. Li',
    journal: 'IEEE Transactions on Antennas and Propagation', year: 2026, volume: 74, issue: 1, pages: '38–50',
  },
  provenance: { simulation: '三软件最终工程归档 · 2026-08-04', reference: '原论文 Fig. 16 数字化；非原始仪器测量数据', geometry: '复现工程参数；矩阵首行靠近 y=0 馈电端' },
  geometry: { matrix, bridges, cell: 3, board: 60, lowerThickness: 2.5, upperThickness: 2.5, bondThickness: 0.1, patchOrigin: [-24, 14], bridgeSide: 0.1, materials: config.materials, slot: config.ground_slot, feed: config.bottom_feed },
  windows: config.comparison_windows_ghz,
  curves, metrics, bands,
}
process.stdout.write(JSON.stringify(data))
