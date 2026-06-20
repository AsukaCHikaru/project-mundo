import { type GameDocument } from "../lib/documents";

/** A classic fake "555" phone number with a random 4-digit line. */
function randomDialUpNumber(): string {
  const line = Math.floor(1000 + Math.random() * 9000);
  return `555-${line}`;
}

/**
 * The credentials required to connect. Generated once per session — the network
 * note (in documents.csv) ships with placeholders that are filled from this same
 * object at seed time, so the in-world clue and the dial-up check can never
 * disagree. (Random number is a placeholder for now.)
 */
export const NETWORK = {
  phoneNumber: randomDialUpNumber(),
  username: "admin",
  password: "password",
} as const;

/** Whether the entered dial-up number reaches the ISP (checked while dialing). */
export function validatePhoneNumber(phoneNumber: string): boolean {
  return phoneNumber.trim() === NETWORK.phoneNumber;
}

/** Whether the entered login is accepted (checked while verifying). */
export function validateLogin(username: string, password: string): boolean {
  return username.trim() === NETWORK.username && password === NETWORK.password;
}

/** The network note whose body carries the live credentials (see below). */
export const NETWORK_DOC_ID = "network";

/**
 * The network note is authored in documents.csv with `{{phone}}`/`{{user}}`/
 * `{{password}}` placeholders so its static text lives with the other content.
 * This fills them from the live {@link NETWORK} config at seed time, keeping the
 * clue and the check reading from one source.
 */
export function withNetworkCredentials(docs: GameDocument[]): GameDocument[] {
  return docs.map((doc) =>
    doc.id === NETWORK_DOC_ID ? { ...doc, body: fillCredentials(doc.body) } : doc,
  );
}

function fillCredentials(body: string): string {
  return body
    .replaceAll("{{phone}}", NETWORK.phoneNumber)
    .replaceAll("{{user}}", NETWORK.username)
    .replaceAll("{{password}}", NETWORK.password);
}
