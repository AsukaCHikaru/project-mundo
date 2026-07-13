import { type PermissionLevel } from "./permission";

export interface GameDocument {
  id: string;
  title: string;
  /** In-world filesystem location, e.g. "C:\My Documents\Read Me.txt". */
  path: string;
  /** File name shown in Explorer — the last segment of `path`, derived at parse time. */
  fileName: string;
  /** Icon shown wherever the document is placed (desktop, Start menu). */
  glyph: string;
  body: string;
  /** Permission required to modify this document. */
  editPermission: PermissionLevel;
}
