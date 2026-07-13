import { type GameDocument } from "../lib/documents";
import { FILE_ID } from "./filesystem";

/** A classic fake "555" phone number with a random 4-digit line. */
function randomDialUpNumber(): string {
  const line = Math.floor(1000 + Math.random() * 9000);
  return `555-${line}`;
}

/**
 * A dial-up account: the credentials that reach the ISP plus the connection
 * `speed` (KB/s) it grants once connected. Future puzzles can introduce faster
 * accounts; the connected speed is registered in the system store on logon.
 */
export interface NetworkAccount {
  phoneNumber: string;
  username: string;
  password: string;
  /** Connection throughput in KB/s, registered in the system on connect. */
  speed: number;
}

/**
 * The network config. Generated once per session — the network note (in
 * documents.csv) ships with placeholders that are filled from this same
 * `account` at seed time, so the in-world clue and the dial-up check can never
 * disagree. (Random number is a placeholder for now.)
 */
const SLOW_NUMBER = randomDialUpNumber();
const NETWORK_USERNAME = "d285251";
const NETWORK_PASSWORD = "a441po115";

/** A second random number, guaranteed to differ from the slow account's. */
function distinctFastNumber(): string {
  let number = randomDialUpNumber();
  while (number === SLOW_NUMBER) number = randomDialUpNumber();
  return number;
}

export const NETWORK: { account: NetworkAccount; fastAccount: NetworkAccount } =
  {
    account: {
      phoneNumber: SLOW_NUMBER,
      username: NETWORK_USERNAME,
      password: NETWORK_PASSWORD,
      speed: 1,
    },
    // 2 MB/s. Its number reaches mail via the {{fastPhone}} placeholder (see
    // content/mail). (Credentials are placeholders.)
    fastAccount: {
      phoneNumber: distinctFastNumber(),
      username: NETWORK_USERNAME,
      password: NETWORK_PASSWORD,
      speed: 2048,
    },
  };

/** Every dialable account. */
const ACCOUNTS: NetworkAccount[] = [NETWORK.account, NETWORK.fastAccount];

/**
 * The account reached by dialing `phoneNumber`, or undefined when nothing
 * answers (checked while dialing). Which account picks up decides the
 * credentials that are verified next and the speed granted on logon.
 */
export function accountForPhoneNumber(
  phoneNumber: string,
): NetworkAccount | undefined {
  return ACCOUNTS.find((account) => account.phoneNumber === phoneNumber.trim());
}

/** Whether `account` accepts the entered login (checked while verifying). */
export function validateLogin(
  account: NetworkAccount,
  username: string,
  password: string,
): boolean {
  return username.trim() === account.username && password === account.password;
}

/**
 * The network note (FILE_ID.NETWORK_NOTE) is authored in documents.csv with
 * `{{phone}}`/`{{user}}`/`{{password}}` placeholders so its static text lives
 * with the other content. This fills them from the live {@link NETWORK} config
 * at seed time, keeping the clue and the check reading from one source.
 */
export function withNetworkCredentials(docs: GameDocument[]): GameDocument[] {
  return docs.map((doc) =>
    doc.id === FILE_ID.NETWORK_NOTE
      ? { ...doc, body: fillCredentials(doc.body) }
      : doc,
  );
}

function fillCredentials(body: string): string {
  return body
    .replaceAll("{{phone}}", NETWORK.account.phoneNumber)
    .replaceAll("{{user}}", NETWORK.account.username)
    .replaceAll("{{password}}", NETWORK.account.password);
}
