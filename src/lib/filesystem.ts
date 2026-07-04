/**
 * In-world filesystem node types — the shape of the drive/folder/file tree the
 * Explorer browses.
 *
 * Every node is predefined (the player never creates or deletes files/folders),
 * carries a unique id, and declares an *initial* {@link FsState}. The live state
 * lives in the filesystem store, which seeds from these initials and flips nodes
 * to `normal` as the player unlocks them (see `store/filesystem`). "Adding" a
 * folder to the filesystem is therefore a state change, never an append.
 */

/**
 * A node's visibility/accessibility, as a discriminated union:
 *  - `normal`    — visible and accessible.
 *  - `hidden`    — not shown at all; effectively doesn't exist for the player.
 *  - `forbidden` — visible but inaccessible; opening raises `errorMessage`.
 */
/** The display-state discriminants, named so they read distinctly from content. */
export const FS_STATE = {
  NORMAL: "normal",
  HIDDEN: "hidden",
  FORBIDDEN: "forbidden",
} as const;

export type FsState =
  | { state: typeof FS_STATE.NORMAL }
  | { state: typeof FS_STATE.HIDDEN }
  | { state: typeof FS_STATE.FORBIDDEN; errorMessage: string };

export type FsNode = FsContainer | FsFile;

/** Containers hold children. `drive`/`folder` are identical but for glyph and
 *  the drive sitting at the root; `root` is the synthetic "My Computer" top. */
export type FsContainer = FsRoot | FsDrive | FsFolder;

export type FsFile = FsFileTxt | FsFileExe | FsFileDll;

interface FsNodeBase {
  /** Unique, stable id — referenced from the predefined ID maps. */
  id: string;
  /** Display name, e.g. "My Documents" or "Read Me.txt". */
  name: string;
  /** Full in-world path shown in the address bar, e.g. "C:\My Documents". */
  path: string;
  /** Authored starting state; the live state is owned by the filesystem store. */
  initialState: FsState;
}

/** The virtual top level ("My Computer") whose children are the drives. */
export interface FsRoot extends FsNodeBase {
  nodeClass: "root";
  children: FsContainer[];
}

/** A root-level volume (C:, F:). Same as a folder but for glyph and placement. */
export interface FsDrive extends FsNodeBase {
  nodeClass: "drive";
  children: FsNode[];
}

export interface FsFolder extends FsNodeBase {
  nodeClass: "folder";
  children: FsNode[];
}

/** A text file; opens its referenced document in Notepad. */
export interface FsFileTxt extends FsNodeBase {
  nodeClass: "file";
  fileKind: "txt";
  /** Document whose body this file shows (see the documents store). */
  docId: string;
}

/** A program entry; launching dispatches through the program registry. */
export interface FsFileExe extends FsNodeBase {
  nodeClass: "file";
  fileKind: "exe";
  /** Registry key (see `content/programs`) that maps to launch behavior. */
  program: string;
}

/** A library file. Not openable — double-clicking raises a "no program" error. */
export interface FsFileDll extends FsNodeBase {
  nodeClass: "file";
  fileKind: "dll";
}
