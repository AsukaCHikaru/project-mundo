import {
  FS_STATE,
  type FsContainer,
  type FsDrive,
  type FsFileExe,
  type FsFileTxt,
  type FsFolder,
  type FsNode,
  type FsRoot,
  type FsState,
} from "../lib/filesystem";

/**
 * In-world filesystem — the single source of truth for the predefined
 * drive/folder/file tree the Explorer browses. Nodes are never added or
 * removed at runtime; what changes is each node's *state* (see the filesystem
 * store), so a locked drive or an installed program's folder simply flips from
 * `forbidden`/`hidden` to `normal` once unlocked.
 *
 * Node ids are predefined here as const maps and referenced everywhere else
 * (program reveals, window payloads) so the ids never drift.
 */

/** Drive ids (root-level volumes). */
export const DRIVE_ID = {
  C: "c",
  FLOPPY: "floppy",
} as const;

/** Folder ids. */
export const FOLDER_ID = {
  MY_DOCUMENTS: "my-documents",
  PROGRAM_FILES: "program-files",
  MY_DOWNLOADS: "my-downloads",
  SYSTEM32: "system32",
  FLOPPY_DRIVER: "floppy-driver-folder",
} as const;

/** File ids (txt documents and exe entries). */
export const FILE_ID = {
  SHUT_DOWN: "shut-down",
  NETWORK_NOTE: "network",
  FLOPPY_SETUP: "floppy-setup",
  FLOPPY_README: "floppy-readme",
  PERMISSION_GENERATOR: "permission-generator",
  PERMISSION_DLL: "permission-dll",
} as const;

/** Small constructors keep the tree below readable. */
const txt = (
  id: string,
  name: string,
  path: string,
  docId: string,
  initialState: FsState = { state: FS_STATE.NORMAL },
): FsFileTxt => ({
  nodeClass: "file",
  fileKind: "txt",
  id,
  name,
  path,
  docId,
  initialState,
});

const exe = (
  id: string,
  name: string,
  path: string,
  program: string,
  initialState: FsState = { state: FS_STATE.NORMAL },
): FsFileExe => ({
  nodeClass: "file",
  fileKind: "exe",
  id,
  name,
  path,
  program,
  initialState,
});

/** Program Files > Floppy Driver — installed by the floppy driver setup. */
const FLOPPY_DRIVER_FOLDER: FsFolder = {
  nodeClass: "folder",
  id: FOLDER_ID.FLOPPY_DRIVER,
  name: "Floppy Driver",
  path: "C:\\Program Files\\Floppy Driver",
  initialState: { state: FS_STATE.HIDDEN },
  children: [
    txt(
      FILE_ID.FLOPPY_README,
      "Readme.txt",
      "C:\\Program Files\\Floppy Driver\\Readme.txt",
      "floppy-readme",
      { state: FS_STATE.HIDDEN },
    ),
  ],
};

const DRIVE_C: FsDrive = {
  nodeClass: "drive",
  id: DRIVE_ID.C,
  name: "(C:)",
  path: "C:\\",
  initialState: { state: FS_STATE.NORMAL },
  children: [
    {
      nodeClass: "folder",
      id: FOLDER_ID.MY_DOCUMENTS,
      name: "My Documents",
      path: "C:\\My Documents",
      initialState: { state: FS_STATE.NORMAL },
      children: [
        txt(
          FILE_ID.SHUT_DOWN,
          "SHUT DOWN THE PC.txt",
          "C:\\Program Files\\Floppy Driver\\SHUT DOWN THE PC.txt",
          "shut-down",
          { state: FS_STATE.NORMAL },
        ),
        txt(
          FILE_ID.NETWORK_NOTE,
          "network.txt",
          "C:\\My Documents\\network.txt",
          "network",
        ),
      ],
    },
    {
      nodeClass: "folder",
      id: FOLDER_ID.PROGRAM_FILES,
      name: "Program Files",
      path: "C:\\Program Files",
      initialState: { state: FS_STATE.NORMAL },
      children: [FLOPPY_DRIVER_FOLDER],
    },
    {
      nodeClass: "folder",
      id: FOLDER_ID.MY_DOWNLOADS,
      name: "My Downloads",
      path: "C:\\My Downloads",
      initialState: { state: FS_STATE.NORMAL },
      children: [
        exe(
          FILE_ID.FLOPPY_SETUP,
          "Floppy Driver Setup.exe",
          "C:\\My Downloads\\Floppy Driver Setup.exe",
          "floppy-driver-setup",
          // Hidden until fetched — the downloader reveals it on completion
          // (see content/downloads), so the file "lands" here without an append.
          { state: FS_STATE.HIDDEN },
        ),
      ],
    },
    {
      nodeClass: "folder",
      id: FOLDER_ID.SYSTEM32,
      name: "system32",
      path: "C:\\system32",
      initialState: {
        state: FS_STATE.FORBIDDEN,
        errorMessage:
          "C:\\system32 is not accessible. You do not have permission.",
      },
      children: [],
    },
    {
      // Hidden until the Permission DLL Generator writes it (its data lives in
      // the permission-dll store); the boot sequence reads it for the starting
      // permission level. Not openable — Explorer raises a "no program" error.
      nodeClass: "file",
      fileKind: "dll",
      id: FILE_ID.PERMISSION_DLL,
      name: "permission.dll",
      path: "C:\\permission.dll",
      initialState: { state: FS_STATE.HIDDEN },
    },
  ],
};

/** The floppy disk drive — locked until the floppy driver is installed. */
const DRIVE_FLOPPY: FsDrive = {
  nodeClass: "drive",
  id: DRIVE_ID.FLOPPY,
  name: "(F:)",
  path: "F:\\",
  initialState: {
    state: FS_STATE.FORBIDDEN,
    errorMessage:
      "F:\\ is not accessible. The required driver is not installed.",
  },
  children: [
    // Reachable only once the floppy driver install unlocks the drive.
    exe(
      FILE_ID.PERMISSION_GENERATOR,
      "Permission DLL Generator.exe",
      "F:\\Permission DLL Generator.exe",
      "permission-dll-generator",
    ),
  ],
};

export const FS_ROOT: FsRoot = {
  nodeClass: "root",
  id: "root",
  name: "My Computer",
  path: "My Computer",
  initialState: { state: FS_STATE.NORMAL },
  children: [DRIVE_C, DRIVE_FLOPPY],
};

/** The id Explorer starts at when its window has no seeded location. */
export const FS_ROOT_ID = FS_ROOT.id;

// Indexes, built once from the static tree. Containers cover navigation
// (history, address bar, Up); every node (incl. files) is collected for the
// filesystem store to seed initial states from.
const CONTAINER_BY_ID = new Map<string, FsContainer>();
const PARENT_BY_ID = new Map<string, string | null>();

/** Every predefined node, flattened — the filesystem store seeds states here. */
export const ALL_NODES: FsNode[] = [];

function index(node: FsNode, parentId: string | null) {
  ALL_NODES.push(node);
  PARENT_BY_ID.set(node.id, parentId);
  if (node.nodeClass === "file") return;
  CONTAINER_BY_ID.set(node.id, node);
  for (const child of node.children) index(child, node.id);
}

index(FS_ROOT, null);

/** Resolve a container by id. Files are never navigated into. */
export function getContainer(id: string): FsContainer | undefined {
  return CONTAINER_BY_ID.get(id);
}

/** The parent container's id, or null at the root. */
export function parentId(id: string): string | null {
  return PARENT_BY_ID.get(id) ?? null;
}
