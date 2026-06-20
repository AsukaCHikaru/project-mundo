import { Permission } from "../lib/permission";
import {
  type FsContainer,
  type FsDrive,
  type FsFileExe,
  type FsFileTxt,
  type FsFolder,
  type FsNode,
  type FsRoot,
} from "../lib/filesystem";
import { type GameDocument } from "../lib/documents";
import { type InstalledProgram } from "../store/system";

/**
 * In-world filesystem — the single source of truth for the drive/folder tree
 * the Explorer browses. Containers (root/drive/folder) are static and listed
 * here; `file-txt` entries are NOT stored statically but **derived** from the
 * documents store at render time (see `listChildren`), so a document placed in
 * a folder's path appears automatically and never drifts from its real title.
 */

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
      programs: [
        {
          kind: "file-exe",
          id: "exe-floppy-driver-setup",
          name: "Floppy Driver Setup.exe",
          path: "C:\\My Downloads\\Floppy Driver Setup.exe",
          program: "floppy-driver-setup",
        },
      ],
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

/** The floppy disk drive — locked until the floppy driver is installed. */
const FLOPPY_DRIVE: FsDrive = {
  kind: "drive",
  id: "f",
  name: "(F:)",
  path: "F:\\",
  requiredPermission: Permission.USER,
  requiresDriver: "floppy-driver",
  children: [],
};

export const FS_ROOT: FsRoot = {
  kind: "root",
  id: "root",
  name: "My Computer",
  path: "My Computer",
  requiredPermission: Permission.USER,
  children: [DRIVE_C, FLOPPY_DRIVE],
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

/** The container id under which installed program folders live. */
const PROGRAM_FILES_ID = "program-files";

/** A program-files prefix that marks a dynamically-installed folder's id. */
const INSTALLED_PREFIX = "installed-";

const installedFolderId = (driverId: string) => `${INSTALLED_PREFIX}${driverId}`;

/**
 * Build the (runtime) folder for an installed program. Its `programs` are the
 * shipped exes; its txt children derive from the documents store by path, just
 * like any static folder (see `listChildren`).
 */
function installedFolder(program: InstalledProgram): FsFolder {
  const path = `C:\\Program Files\\${program.name}`;
  return {
    kind: "folder",
    id: installedFolderId(program.driverId),
    name: program.name,
    path,
    requiredPermission: Permission.USER,
    children: [],
    programs: program.exes.map((exe) => ({
      kind: "file-exe",
      id: `exe-${program.driverId}-${exe.name}`,
      name: exe.name,
      path: `${path}\\${exe.name}`,
      program: exe.program,
    })),
  };
}

/**
 * Resolve a container by id. The static tree is the source of truth for the
 * fixed skeleton; ids prefixed `installed-` resolve against the system store's
 * installed programs, so runtime-created Program Files folders are navigable.
 */
export function getContainer(
  id: string,
  installed: Record<string, InstalledProgram>,
): FsContainer | undefined {
  const staticNode = NODE_BY_ID.get(id);
  if (staticNode) return staticNode;

  const program = Object.values(installed).find(
    (p) => installedFolderId(p.driverId) === id,
  );
  return program ? installedFolder(program) : undefined;
}

/** The parent container's id, or null at the root. */
export function parentId(id: string): string | null {
  if (PARENT_BY_ID.has(id)) return PARENT_BY_ID.get(id) ?? null;
  // Installed folders are children of Program Files (not in the static index).
  if (id.startsWith(INSTALLED_PREFIX)) return PROGRAM_FILES_ID;
  return null;
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
  installed: Record<string, InstalledProgram>,
): FsNode[] {
  const containers: FsNode[] = [...node.children];
  // Program Files also lists one derived folder per installed program.
  if (node.id === PROGRAM_FILES_ID) {
    for (const program of Object.values(installed)) {
      containers.push(installedFolder(program));
    }
  }
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
