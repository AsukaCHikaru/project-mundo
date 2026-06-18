/**
 * Start menu configuration — game content, not UI. Which documents appear
 * under Start → Documents (by doc id). Edit freely to curate the menu.
 */
export interface StartMenuDocument {
  glyph: string;
  label: string;
  docId: string;
}

export const START_MENU_DOCUMENTS: StartMenuDocument[] = [
  { glyph: "📄", label: "Read Me", docId: "readme" },
  { glyph: "📄", label: "My Notes", docId: "notes" },
];
