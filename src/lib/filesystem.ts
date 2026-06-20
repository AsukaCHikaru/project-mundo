import { type PermissionLevel } from "./permission";

/**
 * In-world filesystem node types — the shape of the drive/folder tree the
 * Explorer browses. Containers (root/drive/folder) are static; `file-txt`
 * entries are derived from the documents store at render time, and `file-exe`
 * entries launch through the program registry.
 */
export type FsNode = FsContainer | FsFileTxt | FsFileExe;

export type FsContainer = FsRoot | FsDrive | FsFolder;

interface FsBase {
  id: string;
  /** Display name, e.g. "My Documents" or "Read Me.txt". */
  name: string;
  /** Full in-world path shown in the address bar, e.g. "C:\My Documents". */
  path: string;
  /**
   * If set, the node is inaccessible until this driver (by id) is installed:
   * it shows translucent and opening it raises a "no driver" error.
   */
  requiresDriver?: string;
}

/** The virtual top level ("My Computer") whose children are the drives. */
export interface FsRoot extends FsBase {
  kind: "root";
  requiredPermission: PermissionLevel;
  children: FsContainer[];
}

export interface FsDrive extends FsBase {
  kind: "drive";
  requiredPermission: PermissionLevel;
  children: FsContainer[];
}

export interface FsFolder extends FsBase {
  kind: "folder";
  /** Permission required to enter this folder. */
  requiredPermission: PermissionLevel;
  children: FsContainer[];
  /** Static program entries inside this folder (exes added by hand). */
  programs: FsFileExe[];
}

/** A text file; opens its referenced document in Notepad. */
export interface FsFileTxt extends FsBase {
  kind: "file-txt";
  docId: string;
}

/** A program entry. Launching dispatches through the program registry. */
export interface FsFileExe extends FsBase {
  kind: "file-exe";
  /** Registry key (see `content/programs`) that maps to launch behavior. */
  program: string;
}
