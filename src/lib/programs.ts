import { type OpenOptions } from "../store/desktop";

/**
 * Program registry types — what each runnable program (an `.exe` node in the
 * filesystem) declares and *does* when launched, and, for setup programs, what
 * they install.
 */

/** Opens a window — the slice of the desktop store a launcher is handed. */
export type LaunchOpen = (options: OpenOptions) => string;

/** Which shortcuts an install creates. Program config, never a wizard step. */
export interface ShortcutConfig {
  desktop?: boolean;
  startMenuPrograms?: boolean;
}

/** A text file an installer ships — its body is added to the documents store. */
export interface ShippedTxt {
  kind: "txt";
  /** File name as it appears in the installed folder, e.g. "Readme.txt". */
  name: string;
  body: string;
}

/** An exe an installer ships — runs the named program when launched. */
export interface ShippedExe {
  kind: "exe";
  name: string;
  /** Program id this exe launches (must exist in the registry). */
  program: string;
}

export type ShippedFile = ShippedTxt | ShippedExe;

/**
 * What an installable program declares. Install location is always
 * `C:\Program Files\<name>` — fixed, never a prop. The shipped `files` follow
 * from `shortcuts`: shortcuts → runnable exe(s); no shortcuts → only txt(s).
 */
export interface InstallConfig {
  /** Key registered in the system store on install. */
  driverId: string;
  /** Display name; also the installed folder name under C:\Program Files. */
  name: string;
  shortcuts: ShortcutConfig;
  files: ShippedFile[];
}

export interface ProgramEntry {
  id: string;
  /** Present for setup programs — drives the installer. */
  install?: InstallConfig;
  /** What launching this program does. */
  launch: (open: LaunchOpen) => void;
}
