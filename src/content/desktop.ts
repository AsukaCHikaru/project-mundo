import { type DesktopItem } from "../lib/desktop";

/**
 * Desktop configuration — game content, not UI. The icons on the desktop, in
 * order (icons flow top-down, then wrap to the next column). Mix program
 * shortcuts and documents freely; documents open in Notepad and take their
 * label from the document's title.
 */
export const DESKTOP_ITEMS: DesktopItem[] = [
  { kind: "app", appType: "explorer", label: "My Computer", glyph: "🖥️" },
  { kind: "app", appType: "dialup", label: "Dial-Up", glyph: "☎️" },
  { kind: "app", appType: "email", label: "Email", glyph: "✉️" },
  { kind: "document", docId: "shut-down", glyph: "📄" },
];
