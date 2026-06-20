import { type StartMenuDocument } from "../lib/startMenu";
import { NETWORK_DOC_ID } from "./network";

/**
 * Start menu configuration — game content, not UI. Which documents appear
 * under Start → Documents (by doc id). The menu label follows each document's
 * own title (resolved from the documents store), so it never drifts.
 */
export const START_MENU_DOCUMENTS: StartMenuDocument[] = [
  { glyph: "📄", docId: "readme" },
  { glyph: "📄", docId: "notes" },
  { glyph: "📄", docId: NETWORK_DOC_ID },
];
