import { type PermissionLevel } from "./permission";

export interface GameDocument {
  id: string;
  title: string;
  /** In-world filesystem location, e.g. "C:\My Documents\Read Me.txt". */
  path: string;
  body: string;
  /** Permission required to modify this document. */
  editPermission: PermissionLevel;
}
