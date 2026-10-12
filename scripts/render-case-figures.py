"""Render a standalone scientific plot from the same public data as the UI."""
from pathlib import Path
import json
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

root = Path(__file__).resolve().parents[1]
data = json.loads((root / 'src/data/qr-grid-patch.json').read_text(encoding='utf-8'))
out = root / 'public/cases/qr-grid-patch'
out.mkdir(parents=True, exist_ok=True)
plt.rcParams.update({'font.family': 'DejaVu Sans', 'font.size': 10, 'svg.fonttype': 'none'})
fig, ax = plt.subplots(figsize=(12, 6.4), facecolor='#07131f')
ax.set_facecolor('#0b1b2a')
styles = {
    'measurement': ('Paper measured (digitized)', '#e7f1f1', '-'),
    'paperFEM': ('Paper FEM (digitized)', '#718a99', ':'),
    'hfss': ('HFSS / FEM', '#65e7d1', '-'),
    'cst': ('CST / FIT', '#e4c79a', '--'),
    'feko': ('FEKO / MoM', '#91a9cf', '-.'),
}
for key, (label, color, linestyle) in styles.items():
    points = data['curves'][key]
    ax.plot([p[0] for p in points], [p[1] for p in points], label=label,
            color=color, linestyle=linestyle, linewidth=1.5)
for low, high in data['windows']:
    ax.axvspan(low, high, color='#65e7d1', alpha=.035)
for db in [-6, -10]:
    ax.axhline(db, color='#54707b', linestyle=(0, (3, 5)), linewidth=.8)
    ax.text(7.43, db + .6, f'{db} dB', color='#8ea7aa', ha='right', fontsize=8)
ax.set_xlim(2, 7.5)
ax.set_ylim(-50, 5)
ax.set_xlabel('Frequency (GHz)', color='#b9cccc', labelpad=12)
ax.set_ylabel('S11 (dB)', color='#b9cccc', labelpad=12)
ax.tick_params(colors='#8ea7aa')
ax.grid(color='#36505e', alpha=.3, linewidth=.6)
for spine in ax.spines.values():
    spine.set_color('#36505e')
ax.set_title('QR-GRID PATCH ANTENNA / CROSS-SOLVER REPRODUCTION',
             loc='left', color='#e7f1f1', fontsize=13, pad=20)
legend = ax.legend(loc='lower left', ncol=2, facecolor='#0b1b2a',
                   edgecolor='#36505e', labelcolor='#b9cccc', fontsize=9)
fig.text(.085, .06, 'Reference: Ma et al., IEEE TAP 74(1), 38-50 (2026). DOI: 10.1109/TAP.2025.3623329',
         color='#8ea7aa', fontsize=8)
fig.text(.085, .032, 'Paper curves digitized from Fig. 16; simulations from archived exports. Redrawn by Lavax / Paper2HFSS.',
         color='#8ea7aa', fontsize=8)
fig.subplots_adjust(left=.085, right=.975, top=.9, bottom=.16)
fig.savefig(out / 's11-comparison.svg', metadata={'Creator': 'Lavax / Paper2HFSS'})
plt.close(fig)
print('Rendered public/cases/qr-grid-patch/s11-comparison.svg')
