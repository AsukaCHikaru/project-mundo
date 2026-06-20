import { type OpenOptions } from "../store/desktop";
import { type ProgramId } from "../content/programs";

/**
 * Program registry types — what each runnable program (an `.exe` node in the
 * filesystem) declares and *does* when launched, and, for setup programs, what
 * they install.
 */

/** Opens a window — the slice of the desktop store a launcher is handed. */
export type LaunchOpen = (options: OpenOptions) => string;

/**
 * What an installable program declares. Files are predefined filesystem nodes
 * (never created at runtime); installing only flips the system's install flag
 * and reveals the program's nodes — so the flag and the files can't drift. The
 * installer is the single site that does both; the stores stay decoupled.
 */
export interface InstallConfig {
  /** The install flag set in the system store. */
  programId: ProgramId;
  /** Display name shown by the setup wizard / install location. */
  name: string;
  /** Filesystem node ids revealed (flipped to `normal`) on install. */
  reveals: string[];
}

export interface ProgramEntry {
  id: string;
  /** Present for setup programs — drives the installer. */
  install?: InstallConfig;
  /** What launching this program does. */
  launch: (open: LaunchOpen) => void;
}
