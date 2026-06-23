import { create } from "zustand";
import { PROGRAM_ID, type ProgramId } from "../content/programs";
import { Permission, type PermissionLevel } from "../lib/permission";

/**
 * The internet connection. When `connected` it carries the dial-up account's
 * `speed` (KB/s) — registered here on connect so anything that cares about
 * throughput (e.g. the downloader) reads it from one place.
 */
export type NetworkStatus =
  | { state: "offline" }
  | { state: "connected"; speed: number };

/**
 * The machine's status, in one place: the internet connection, the player's
 * permission level, and which programs are installed. These are unrelated
 * facets of "system state" that previously lived in separate stores; merging
 * them keeps the cross-cutting bits together without coupling the modules that
 * read them.
 *
 * Install is only a flag — the installed *files* are predefined filesystem
 * nodes revealed by the installer (see `content/programs`), so this store and
 * the filesystem never write each other yet can't fall out of sync.
 */
interface SystemState {
  /** Internet connection (dial-up). */
  network: NetworkStatus;
  /** The player's current permission level. Starts at USER, rises in-game. */
  permission: PermissionLevel;
  /** Install flags, keyed by program id. */
  installed: Record<ProgramId, boolean>;

  /** Go online at `speed` KB/s (the connecting account's throughput). */
  connect: (speed: number) => void;
  disconnect: () => void;
  /** Raise the player's permission. No-op if already at or above `level`. */
  grant: (level: PermissionLevel) => void;
  /** Flag a program installed. Idempotent. */
  install: (programId: ProgramId) => void;
}

const NONE_INSTALLED = Object.fromEntries(
  Object.values(PROGRAM_ID).map((id) => [id, false]),
) as Record<ProgramId, boolean>;

export const useSystem = create<SystemState>((set) => ({
  network: { state: "offline" },
  permission: Permission.USER,
  installed: { ...NONE_INSTALLED },

  connect: (speed) => set({ network: { state: "connected", speed } }),
  disconnect: () => set({ network: { state: "offline" } }),

  grant: (level) =>
    set((state) => (level > state.permission ? { permission: level } : state)),

  install: (programId) =>
    set((state) =>
      state.installed[programId]
        ? state
        : { installed: { ...state.installed, [programId]: true } },
    ),
}));
