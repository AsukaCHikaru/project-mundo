import { create } from "zustand";
import { ALL_NODES } from "../content/filesystem";
import { FS_STATE, type FsState } from "../lib/filesystem";

/**
 * Live filesystem state. Nodes themselves are predefined (see
 * `content/filesystem`); this store owns only their current {@link FsState},
 * seeded from each node's authored initial state. Unlocking a folder/drive/file
 * is a state flip here — never an append — so the tree's shape stays fixed.
 */
interface FilesystemState {
  /** Current state per node id. */
  states: Record<string, FsState>;
  /**
   * Reveal a node — flip it to `normal`. Idempotent: a node that's already
   * normal (or unknown) is left untouched, so re-revealing on re-install is a
   * no-op. Other modules (e.g. the installer) call this; the filesystem store
   * never reaches back into them.
   */
  reveal: (id: string) => void;
}

export const useFilesystem = create<FilesystemState>((set) => ({
  states: Object.fromEntries(ALL_NODES.map((node) => [node.id, node.initialState])),

  reveal: (id) =>
    set((store) => {
      const current = store.states[id];
      if (!current || current.state === FS_STATE.NORMAL) return store;
      return { states: { ...store.states, [id]: { state: FS_STATE.NORMAL } } };
    }),
}));
