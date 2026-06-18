import { Permission } from "../lib/permission";
import { type GameDocument } from "./documents";

/** A classic fake "555" phone number with a random 4-digit line. */
function randomDialUpNumber(): string {
  const line = Math.floor(1000 + Math.random() * 9000);
  return `555-${line}`;
}

/**
 * The credentials required to connect. Generated once per session — the ISP
 * Account document below reads from the same object, so the clue and the
 * check can never disagree. (Random number is a placeholder for now.)
 */
export const CONNECTION = {
  phoneNumber: randomDialUpNumber(),
  username: "admin",
  password: "password",
} as const;

/** Whether the entered dial-up number reaches the ISP (checked while dialing). */
export function validatePhoneNumber(phoneNumber: string): boolean {
  return phoneNumber.trim() === CONNECTION.phoneNumber;
}

/** Whether the entered login is accepted (checked while verifying). */
export function validateLogin(username: string, password: string): boolean {
  return (
    username.trim() === CONNECTION.username && password === CONNECTION.password
  );
}

export const CONNECTION_DOC_ID = "network";

/** The in-world note that reveals the dial-up credentials to the player. */
export const CONNECTION_DOC: GameDocument = {
  id: CONNECTION_DOC_ID,
  title: "network",
  path: "C:\\My Documents\\network.txt",
  editPermission: Permission.SYSTEM,
  body: `Dial-Up Networking - account details

Dial-up number:  ${CONNECTION.phoneNumber}
User name:       ${CONNECTION.username}
Password:        ${CONNECTION.password}

Required to connect to the internet. Do not share.`,
};
