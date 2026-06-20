import { DRIVE_ID, FILE_ID, FOLDER_ID } from "./filesystem";
import { type InstallConfig, type ProgramEntry } from "../lib/programs";

/**
 * Program registry — the single source of truth for what each runnable program
 * (an `.exe` node in the filesystem) *does* when launched, and, for setup
 * programs, what they install.
 *
 * Nodes map to behavior by a stable `program` id rather than by name/path, so
 * renaming a file never breaks its launch. Adding a new program is a one-line
 * registry entry; Explorer's exe-runner dispatches through here.
 */

/**
 * Installable programs, by install flag id. Predefined because the player can
 * never download or create arbitrary software — install status is just a flag
 * in the system store. Add future installables here.
 */
export const PROGRAM_ID = {
  FLOPPY_DRIVER: "floppy-driver",
} as const;

export type ProgramId = (typeof PROGRAM_ID)[keyof typeof PROGRAM_ID];

/** The floppy driver setup — reveals the F: drive and its Program Files folder. */
const FLOPPY_DRIVER_SETUP: ProgramEntry = {
  id: "floppy-driver-setup",
  install: {
    programId: PROGRAM_ID.FLOPPY_DRIVER,
    name: "Floppy Driver",
    reveals: [DRIVE_ID.FLOPPY, FOLDER_ID.FLOPPY_DRIVER, FILE_ID.FLOPPY_README],
  },
  launch: (open) =>
    open({
      appType: "installer",
      title: "Floppy Driver Setup",
      payload: { programId: PROGRAM_ID.FLOPPY_DRIVER },
    }),
};

/** All known programs, keyed by program id. Add new programs here. */
export const PROGRAMS: Record<string, ProgramEntry> = {
  [FLOPPY_DRIVER_SETUP.id]: FLOPPY_DRIVER_SETUP,
};

/** Install configs reachable by install flag id — used by the installer. */
export const INSTALL_BY_PROGRAM_ID: Record<string, InstallConfig> =
  Object.fromEntries(
    Object.values(PROGRAMS)
      .map((program) => program.install)
      .filter((install): install is InstallConfig => install !== undefined)
      .map((install) => [install.programId, install]),
  );
