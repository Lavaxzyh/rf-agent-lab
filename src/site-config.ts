// Publication switches: preserve unfinished sections in source.
// Enable a section here and rebuild once its content is ready.
export const panelVisibility = {
  hero: true,
  skills: true,
  mcp: true,
  demos: true,
  paper2hfss: false,
  cases: true,
  docs: false,
}

export type PanelId = keyof typeof panelVisibility
export const isPanelEnabled = (id: PanelId) => panelVisibility[id]
