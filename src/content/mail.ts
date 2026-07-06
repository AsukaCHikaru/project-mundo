import { type Mail, type MailFolder } from "../lib/mail";
import csvText from "./mail.csv" with { type: "text" };
import { parseCsv } from "./csv";

/**
 * Email content — game data, not UI. Mirrors the documents pattern: the mails
 * are hand-authored in `mail.csv` (columns mapped by header name, so order
 * doesn't matter; multi-line bodies use quoted fields) and parsed here into
 * the typed records that seed the mail store.
 *
 * The `location` column decides where a mail starts: `mailbox` rows are in
 * the player's mailbox at game start, `server` rows are waiting on the server
 * and delivered to the Inbox only after a successful (connected) Send/Receive.
 * `downloadId`/`downloadLabel` (optional) attach a download link, resolved
 * against the download registry (see `content/downloads`).
 */

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
    downloadId: columnOf("downloadId"),
    downloadLabel: columnOf("downloadLabel"),
    body: columnOf("body"),
  };

  return rows.slice(1).map((row) => {
    const cell = (col: number) => (row[col] ?? "").trim();
    const downloadId = cell(cols.downloadId);
    const downloadLabel = cell(cols.downloadLabel);
    return {
      mail: {
        id: cell(cols.id),
        folder: cell(cols.folder) as MailFolder,
        from: cell(cols.from),
        to: cell(cols.to),
        subject: cell(cols.subject),
        date: cell(cols.date),
        read: cell(cols.read).toLowerCase() === "true",
        body: row[cols.body] ?? "",
        download: downloadId
          ? { id: downloadId, label: downloadLabel || undefined }
          : undefined,
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
