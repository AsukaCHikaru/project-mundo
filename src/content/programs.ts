import {
  type InstallConfig,
  type ProgramEntry,
} from "../lib/programs";

/**
 * Program registry — the single source of truth for what each runnable program
 * (an `.exe` node in the filesystem) *does* when launched, and, for setup
 * programs, what they install.
 *
 * Nodes map to behavior by a stable `program` id rather than by name/path, so
 * renaming a file never breaks its launch. Adding a new program is a one-line
 * registry entry; Explorer's exe-runner dispatches through here.
 */

/** The floppy driver setup — installs a driver folder with only a readme. */
const FLOPPY_DRIVER_SETUP: ProgramEntry = {
  id: "floppy-driver-setup",
  install: {
    driverId: "floppy-driver",
    name: "Floppy Driver",
    shortcuts: {}, // a driver — no shortcuts, so the folder holds only txt(s).
    files: [
      {
        kind: "txt",
        name: "Readme.txt",
        body: `Floppy Disk Driver 1.0

This driver lets Mundo 95 read and write 3.5" floppy disks.

If a disk is not recognised, check that it is inserted the right way up
and that the write-protect tab is closed, then try again.`,
      },
    ],
  },
  launch: (open) =>
    open({
      appType: "installer",
      title: "Floppy Driver Setup",
      payload: { driverId: "floppy-driver" },
    }),
};

/** All known programs, keyed by program id. Add new programs here. */
export const PROGRAMS: Record<string, ProgramEntry> = {
  [FLOPPY_DRIVER_SETUP.id]: FLOPPY_DRIVER_SETUP,
};

/** Install configs reachable by driver id — used by the system store/installer. */
export const INSTALL_BY_DRIVER_ID: Record<string, InstallConfig> =
  Object.fromEntries(
    Object.values(PROGRAMS)
      .map((program) => program.install)
      .filter((install): install is InstallConfig => install !== undefined)
      .map((install) => [install.driverId, install]),
  );
