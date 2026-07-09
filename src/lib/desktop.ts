import { type AppType } from "../store/desktop";

/**
 * One desktop icon, as authored in `content/desktop`: either a program
 * shortcut or a document that opens in Notepad. Document labels follow the
 * document's own title (resolved from the documents store), so they never
 * drift.
 */
export type DesktopItem =
  | { kind: "app"; appType: AppType; label: string; glyph: string }
  | { kind: "document"; docId: string; glyph: string };
