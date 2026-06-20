import { create } from "zustand";
import { INSTALL_BY_DRIVER_ID } from "../content/programs";
import { type ShortcutConfig } from "../lib/programs";
import { Permission } from "../lib/permission";
import { useDocuments } from "./documents";

/** A runnable program inside an installed folder (resolves via the registry). */
export interface InstalledExe {
  name: string;
  /** Program id this exe launches. */
  program: string;
}

/** A program registered as installed on the machine. */
export interface InstalledProgram {
  driverId: string;
  /** Display name; also the installed folder name under C:\Program Files. */
  name: string;
  /** Runnable exes the program shipped (empty for driver-like installs). */
  exes: InstalledExe[];
  shortcuts: ShortcutConfig;
}

interface SystemState {
  /** Installed programs keyed by driver id (in-memory only). */
  installed: Record<string, InstalledProgram>;

  /**
   * Register a program as installed. Idempotent — installing again is a no-op,
   * so its bundled documents are never duplicated. On first install it:
   *   1. records the driver here,
   *   2. creates the program's bundled txt documents (under its Program Files
   *      folder path) so the derived folder lists them and Notepad opens them,
   *   3. records the program's shortcut config (a hook for shortcut UI).
   */
  install: (driverId: string) => void;
}

export const useSystem = create<SystemState>((set, get) => ({
  installed: {},

  install: (driverId) => {
    if (get().installed[driverId]) return; // already installed — no-op.

    const config = INSTALL_BY_DRIVER_ID[driverId];
    if (!config) return;

    const folderPath = `C:\\Program Files\\${config.name}`;

    // Bundled txt files become documents under the folder's path, so the
    // path-based listing derives them and Notepad can open them by id.
    for (const file of config.files) {
      if (file.kind !== "txt") continue;
      useDocuments.getState().create({
        title: file.name.replace(/\.txt$/i, ""),
        path: `${folderPath}\\${file.name}`,
        body: file.body,
        editPermission: Permission.USER,
      });
    }

    const exes: InstalledExe[] = config.files
      .filter((file) => file.kind === "exe")
      .map((file) => ({ name: file.name, program: file.program }));

    set((state) => ({
      installed: {
        ...state.installed,
        [driverId]: {
          driverId,
          name: config.name,
          exes,
          shortcuts: config.shortcuts,
        },
      },
    }));
  },
}));
