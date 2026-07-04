import { create } from "zustand";
import { type PermissionLevel } from "../lib/permission";

/**
 * The generated `permission.dll`'s contents. The file itself is a predefined
 * filesystem node (hidden until generated — see `content/filesystem`); this
 * store holds the data the dll "bears": whose credentials were baked in and
 * the resulting permission level. The boot sequence (see `Machine`) reads
 * `dll` to decide the permission level the desktop starts at.
 */
export interface GeneratedDll {
  title: string;
  lastName: string;
  firstName: string;
  level: PermissionLevel;
}

interface PermissionDllState {
  /** The dll on disk C, or null when none has been generated yet. */
  dll: GeneratedDll | null;
  /** Write (or overwrite) the dll's contents. */
  generate: (dll: GeneratedDll) => void;
}

export const usePermissionDll = create<PermissionDllState>((set) => ({
  dll: null,
  generate: (dll) => set({ dll }),
}));
