# RF Agent Lab · Lavax

AI × RF × Antenna Engineering — open-source tools, AI agents, interactive experiments and reproducible research.

[Visit RF Agent Lab](https://lavaxzyh.github.io/rf-agent-lab/)

## Explore

1. MCP — published engineering MCP servers, starting with [ads-mcp](https://github.com/Lavaxzyh/ads-mcp).
2. Case Studies — source-attributed antenna reproduction with interactive geometry and cross-solver comparisons.
3. Skills — [Codex Profile Switch](https://github.com/Lavaxzyh/codex-profile-switch).
4. Visual Lab — interactive antenna array-factor exploration.

The Paper2HFSS preview and technical notes remain in source but are hidden until ready for publication. Site visibility is controlled in `src/site-config.ts`; planned MCP entries stay unpublished.

## Local development

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 4173 --strictPort
npm run build
```

Push to `main` to build and deploy through GitHub Actions. Pages uses the GitHub Actions source. No custom domain is configured; `public/CNAME.example` is only an example, not a live domain setting.

## Research attribution

Case pages cite the original publication and distinguish its contributions from Lavax's AI-assisted reproduction. Only website assets, parameters and visualization data are published; original papers and simulation project files are not included for download.

See [LICENSE](LICENSE) for reuse terms and [LOCAL_PREVIEW.md](LOCAL_PREVIEW.md) for local verification and rollback notes.
