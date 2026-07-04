/**
 * Permission model — a cross-cutting capability, not specific to documents.
 * Programs, documents, and other resources declare the permission required to
 * access/modify them; the player holds a current level (see the permission
 * store) that can rise during the game.
 *
 * Higher = more privileged. `SYSTEM` is intentionally unreachable in-game, so
 * SYSTEM-gated resources are effectively locked.
 */
export const Permission = {
  USER: 0,
  ADMIN: 1,
  SYSTEM: 99,
} as const;

export type PermissionLevel = number;

const BY_NAME: Record<string, PermissionLevel> = {
  user: Permission.USER,
  admin: Permission.ADMIN,
  system: Permission.SYSTEM,
};

/** Resolve a permission name from a content file (e.g. "system") to a level. */
export function permissionFromName(name: string): PermissionLevel {
  return BY_NAME[name.trim().toLowerCase()] ?? Permission.USER;
}

/** Display name for a permission level (reverse of `permissionFromName`). */
export function permissionName(level: PermissionLevel): string {
  switch (level) {
    case Permission.USER:
      return "User";
    case Permission.ADMIN:
      return "Administrator";
    case Permission.SYSTEM:
      return "System";
    default:
      return "Unknown";
  }
}

/** Whether `level` is sufficient to meet a `required` permission. */
export function hasPermission(
  level: PermissionLevel,
  required: PermissionLevel,
): boolean {
  return level >= required;
}
