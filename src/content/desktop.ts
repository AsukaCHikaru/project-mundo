import { type DesktopItem } from "../lib/desktop";
import { FILE_ID } from "./filesystem";

/**
 * Desktop configuration — game content, not UI. The icons on the desktop, in
 * order (icons flow top-down, then wrap to the next column). Mix program
 * shortcuts and documents freely; a document is placed by id alone — its
 * label and glyph come from the document itself (documents.csv), so they
 * never drift.
 */
export const DESKTOP_ITEMS: DesktopItem[] = [
  { kind: "app", appType: "explorer", label: "My Computer", glyph: "🖥️" },
  { kind: "app", appType: "dialup", label: "Dial-Up", glyph: "☎️" },
  { kind: "app", appType: "email", label: "Email", glyph: "✉️" },
  { kind: "document", docId: FILE_ID.SHUT_DOWN },
];
