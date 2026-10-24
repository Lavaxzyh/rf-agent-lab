# RF Agent Lab · Lavax

AI × RF × Antenna Engineering — open-source tools, AI agents, interactive experiments and reproducible research.

[Visit RF Agent Lab](https://lavaxzyh.github.io/rf-agent-lab/)

## Explore

1. MCP — published engineering MCP servers, starting with [ads-mcp](https://github.com/Lavaxzyh/ads-mcp).
2. Case Studies — source-attributed antenna reproduction, plus a baseline branch-line coupler model with an editable HFSS project download.
3. Skills — [Codex Profile Switch](https://github.com/Lavaxzyh/codex-profile-switch).
4. Visual Lab — interactive antenna array-factor exploration.
5. Docs — the PyAEDT postprocessing manual, API snapshots and offline validation records.

The Paper2HFSS preview and legacy demonstration articles remain in source but are hidden. Docs currently displays only the `docs/pyaedt-postprocessing` collection. Site visibility is controlled in `src/site-config.ts`; planned MCP entries stay unpublished.

## Local development

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 4173 --strictPort
npm run build
```

Push to `main` to build and deploy through GitHub Actions. Pages uses the GitHub Actions source. No custom domain is configured; `public/CNAME.example` is only an example, not a live domain setting.

## Research attribution

Case pages cite the original publication and distinguish its contributions from Lavax's AI-assisted reproduction. QR-grid antenna downloads offer the final HFSS/FEM v1, CST/FIT v1 and FEKO/MoM v3 core projects; the coupler download offers only baseline. External results/cache directories, original papers and course reports are not distributed. Each QR download includes source attribution, software-release information and native-file hashes in its README.

See [LICENSE](LICENSE) for reuse terms and [LOCAL_PREVIEW.md](LOCAL_PREVIEW.md) for local verification and rollback notes.
