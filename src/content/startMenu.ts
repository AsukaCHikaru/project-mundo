import { FILE_ID } from "./filesystem";

/**
 * Start menu configuration — game content, not UI. Which documents appear
 * under Start → Documents, by doc id alone: each entry's label and glyph come
 * from the document itself (documents.csv), so the menu never drifts.
 */
export const START_MENU_DOCUMENT_IDS: string[] = [
  FILE_ID.SHUT_DOWN,
  FILE_ID.NETWORK_NOTE,
];
