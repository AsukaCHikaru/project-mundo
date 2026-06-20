import { Permission, type PermissionLevel } from "../lib/permission";
import { type GameDocument } from "./documents";

/**
 * In-world filesystem — the single source of truth for the drive/folder tree
 * the Explorer browses. Containers (root/drive/folder) are static and listed
 * here; `file-txt` entries are NOT stored statically but **derived** from the
 * documents store at render time (see `listChildren`), so a document placed in
 * a folder's path appears automatically and never drifts from its real title.
 */
export type FsNode =
  | FsContainer
  | FsFileTxt
  | FsFileExe;

export type FsContainer = FsRoot | FsDrive | FsFolder;

interface FsBase {
  id: string;
  /** Display name, e.g. "My Documents" or "Read Me.txt". */
  name: string;
  /** Full in-world path shown in the address bar, e.g. "C:\My Documents". */
  path: string;
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

/** A program entry. Double-click is a no-op until a runner is wired in. */
export interface FsFileExe extends FsBase {
  kind: "file-exe";
}

/** The default in-world tree. C: is the only drive. */
const DRIVE_C: FsDrive = {
  kind: "drive",
  id: "c",
  name: "(C:)",
  path: "C:\\",
  requiredPermission: Permission.USER,
  children: [
    {
      kind: "folder",
      id: "my-documents",
      name: "My Documents",
      path: "C:\\My Documents",
      requiredPermission: Permission.USER,
      children: [],
      programs: [],
    },
    {
      kind: "folder",
      id: "program-files",
      name: "Program Files",
      path: "C:\\Program Files",
      requiredPermission: Permission.USER,
      children: [],
      programs: [],
    },
    {
      kind: "folder",
      id: "my-downloads",
      name: "My Downloads",
      path: "C:\\My Downloads",
      requiredPermission: Permission.USER,
      children: [],
      programs: [],
    },
    {
      kind: "folder",
      id: "system32",
      name: "system32",
      path: "C:\\system32",
      requiredPermission: Permission.SYSTEM,
      children: [],
      programs: [],
    },
  ],
};

export const FS_ROOT: FsRoot = {
  kind: "root",
  id: "root",
  name: "My Computer",
  path: "My Computer",
  requiredPermission: Permission.USER,
  children: [DRIVE_C],
};

/** The id Explorer starts at when its window has no seeded location. */
export const FS_ROOT_ID = FS_ROOT.id;

// Static container index, built once. Files are never indexed — navigation
// only ever enters containers (files open Notepad), so this covers history,
// the address bar, and Up-navigation lookups.
const NODE_BY_ID = new Map<string, FsContainer>();
const PARENT_BY_ID = new Map<string, string | null>();

function indexContainer(node: FsContainer, parentId: string | null) {
  NODE_BY_ID.set(node.id, node);
  PARENT_BY_ID.set(node.id, parentId);
  for (const child of node.children) indexContainer(child, node.id);
}

indexContainer(FS_ROOT, null);

/** Resolve a container by id (drives/folders/root). */
export function getContainer(id: string): FsContainer | undefined {
  return NODE_BY_ID.get(id);
}

/** The parent container's id, or null at the root. */
export function parentId(id: string): string | null {
  return PARENT_BY_ID.get(id) ?? null;
}

/** The directory portion of an in-world path ("C:\A\b.txt" → "C:\A"). */
function dirOf(path: string): string {
  const i = path.lastIndexOf("\\");
  return i === -1 ? path : path.slice(0, i);
}

/** The final segment of a path ("C:\A\b.txt" → "b.txt"). */
function baseOf(path: string): string {
  const i = path.lastIndexOf("\\");
  return i === -1 ? path : path.slice(i + 1);
}

/**
 * The children to display inside a container: its static sub-containers and
 * program entries, plus the documents that live directly in this folder
 * (derived from the documents store so the listing stays in sync).
 */
export function listChildren(
  node: FsContainer,
  docs: Record<string, GameDocument>,
): FsNode[] {
  const containers: FsNode[] = node.children;
  if (node.kind !== "folder") return containers;

  const files: FsFileTxt[] = Object.values(docs)
    .filter((doc) => dirOf(doc.path) === node.path)
    .map((doc) => ({
      kind: "file-txt",
      id: `file-${doc.id}`,
      name: baseOf(doc.path),
      path: doc.path,
      docId: doc.id,
    }));

  return [...containers, ...node.programs, ...files];
}
