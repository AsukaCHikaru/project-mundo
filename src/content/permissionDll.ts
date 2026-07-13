import { Permission, type PermissionLevel } from "../lib/permission";

/**
 * Permission DLL Generator config — the three list columns (titles, last
 * names, first names) and the one combination that yields an admin-level
 * `permission.dll`. The empty first row of each list is added by the UI, not
 * authored here.
 */

export interface DllSelection {
  title: string;
  lastName: string;
  firstName: string;
}

/** The only selection that generates an admin-level dll. */
const ADMIN_SELECTION: DllSelection = {
  title: "Chief Commitment Officer",
  lastName: "Donald",
  firstName: "Doyle",
};

/** Decoy list entries — stubs, author freely. */
const DUMMY_TITLES = [
  "Director",
  "Manager",
  "Tech Lead",
  "Supervisor",
  "Analyst",
];
const DUMMY_LAST_NAMES = [
  "Alan",
  "Robert",
  "James",
  "John",
  "Terry",
  "Wayne",
  "Larry",
  "Bruce",
  "William",
  "Michael",
];
const DUMMY_FIRST_NAMES = [
  "Marsh",
  "McAllister",
  "Aldrich",
  "O'Shea",
  "Corwin",
  "Vance",
  "Grisby",
  "Stennis",
  "Marchetti",
  "Crowley",
];

/** What the UI lists: the admin entry merged in with the decoys, A→Z. */
export const DLL_TITLES = [ADMIN_SELECTION.title, ...DUMMY_TITLES].sort();
export const DLL_LAST_NAMES = [
  ADMIN_SELECTION.lastName,
  ...DUMMY_LAST_NAMES,
].sort();
export const DLL_FIRST_NAMES = [
  ADMIN_SELECTION.firstName,
  ...DUMMY_FIRST_NAMES,
].sort();

const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

/** The permission level a dll generated from `selection` carries. */
export function dllPermissionFor(selection: DllSelection): PermissionLevel {
  const matches =
    same(selection.title, ADMIN_SELECTION.title) &&
    same(selection.lastName, ADMIN_SELECTION.lastName) &&
    same(selection.firstName, ADMIN_SELECTION.firstName);
  return matches ? Permission.ADMIN : Permission.USER;
}
