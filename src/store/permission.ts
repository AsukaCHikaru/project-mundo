import { create } from "zustand";
import { Permission, type PermissionLevel } from "../lib/permission";

interface PermissionState {
  /** The player's current permission level. Starts at USER, rises in-game. */
  level: PermissionLevel;
  /** Raise the player's permission. No-op if already at or above `level`. */
  grant: (level: PermissionLevel) => void;
}

export const usePermission = create<PermissionState>((set) => ({
  level: Permission.USER,
  grant: (level) => set((state) => (level > state.level ? { level } : state)),
}));
