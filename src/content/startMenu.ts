import { CONNECTION_DOC_ID } from "./connection";

/**
 * Start menu configuration — game content, not UI. Which documents appear
 * under Start → Documents (by doc id). The menu label follows each document's
 * own title (resolved from the documents store), so it never drifts.
 */
export interface StartMenuDocument {
  glyph: string;
  docId: string;
}

export const START_MENU_DOCUMENTS: StartMenuDocument[] = [
  { glyph: "📄", docId: "readme" },
  { glyph: "📄", docId: "notes" },
  { glyph: "📄", docId: CONNECTION_DOC_ID },
];
