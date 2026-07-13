import {
  type Mail,
  type MailBodyPart,
  type MailDownload,
  type MailFolder,
} from "../lib/mail";
import csvText from "./mail.csv" with { type: "text" };
import { parseCsv } from "./csv";
import { DOWNLOAD_ID } from "./downloads";
import { NETWORK } from "./network";

/**
 * Email content — game data, not UI. Mirrors the documents pattern: the mails
 * are hand-authored in `mail.csv` (columns mapped by header name, so order
 * doesn't matter; multi-line bodies use quoted fields) and parsed here into
 * the typed records that seed the mail store.
 *
 * The `location` column decides where a mail starts: `mailbox` rows are in
 * the player's mailbox at game start, `server` rows are waiting on the server
 * and delivered to the Inbox only after a successful (connected) Send/Receive.
 * Bodies may carry `{{link:<name>}}` placeholders to inject one of the
 * predefined download links ({@link MAIL_LINKS} below), and `{{fastPhone}}`
 * for the fast dial-up account's number — filled from the live `NETWORK`
 * config at parse time, like the network note's credentials, so the clue in
 * the mail and the account can never disagree.
 */

/**
 * The predefined download links a mail body can inject with a
 * `{{link:<name>}}` placeholder, keyed by that name. Links are definite
 * (never authored per-mail), so the CSV stays plain text while the ids stay
 * checked against the download registry here.
 */
export const MAIL_LINKS: Record<string, MailDownload> = {
  "floppy-driver": {
    id: DOWNLOAD_ID.FLOPPY_SETUP,
    label: "Download Floppy Driver Setup.exe",
  },
};

/** Fill a body's network placeholders from the live network config. */
function fillNetworkDetails(body: string): string {
  return body.replaceAll("{{fastPhone}}", NETWORK.fastAccount.phoneNumber);
}

const LINK_PLACEHOLDER = /\{\{link:([\w-]+)\}\}/g;

/**
 * Split a body into text and link parts for rendering, resolving placeholder
 * names against {@link MAIL_LINKS} — the same pattern as the network note's
 * credential filling (see `content/network`). Placeholders naming an unknown
 * link are left in the text verbatim — a visible authoring error rather than
 * a silent drop.
 */
export function splitMailBody(body: string): MailBodyPart[] {
  const parts: MailBodyPart[] = [];
  let cursor = 0;
  for (const match of body.matchAll(LINK_PLACEHOLDER)) {
    const download = MAIL_LINKS[match[1]!];
    if (!download) continue;
    if (match.index > cursor) {
      parts.push({ kind: "text", text: body.slice(cursor, match.index) });
    }
    parts.push({ kind: "link", download });
    cursor = match.index + match[0].length;
  }
  if (cursor < body.length) {
    parts.push({ kind: "text", text: body.slice(cursor) });
  }
  return parts;
}

interface ParsedMail {
  mail: Mail;
  onServer: boolean;
}

/** Parses the mail CSV into typed records, mapping columns by header name. */
function parseMails(csv: string): ParsedMail[] {
  const rows = parseCsv(csv.trim());
  if (rows.length === 0) return [];

  const header = rows[0]!.map((name) => name.trim());
  const columnOf = (name: string) => header.indexOf(name);
  const cols = {
    id: columnOf("id"),
    location: columnOf("location"),
    folder: columnOf("folder"),
    from: columnOf("from"),
    to: columnOf("to"),
    subject: columnOf("subject"),
    date: columnOf("date"),
    read: columnOf("read"),
    body: columnOf("body"),
  };

  return rows.slice(1).map((row) => {
    const cell = (col: number) => (row[col] ?? "").trim();
    return {
      mail: {
        id: cell(cols.id),
        folder: cell(cols.folder) as MailFolder,
        from: cell(cols.from),
        to: cell(cols.to),
        subject: cell(cols.subject),
        date: cell(cols.date),
        read: cell(cols.read).toLowerCase() === "true",
        body: fillNetworkDetails(row[cols.body] ?? ""),
      },
      onServer: cell(cols.location) === "server",
    };
  });
}

const PARSED = parseMails(csvText);

/** Mail present in the mailbox at game start. */
export const INITIAL_MAILS: Mail[] = PARSED.filter((p) => !p.onServer).map(
  (p) => p.mail,
);

/**
 * Mail waiting on the server. Downloaded into the Inbox only on a successful
 * (connected) Send/Receive — never on open and never while offline.
 */
export const INCOMING_MAILS: Mail[] = PARSED.filter((p) => p.onServer).map(
  (p) => p.mail,
);
