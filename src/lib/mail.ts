export type MailFolder = "inbox" | "outbox" | "drafts";

export interface Mail {
  id: string;
  folder: MailFolder;
  from: string;
  to: string;
  subject: string;
  /** Body text; may carry `{{link:<name>}}` placeholders (see `MAIL_LINKS`
   *  in `content/mail`). */
  body: string;
  /** Display date, e.g. "Mon 6/15/1998 9:41 AM". */
  date: string;
  /** Read state — drives the unread indicator, bold list row, and folder count. */
  read: boolean;
}

/** A download link carried by a mail body (see content/downloads for the id). */
export interface MailDownload {
  /** Download id, resolved against the download registry. */
  id: string;
  /** Link text; falls back to the download's file name when absent. */
  label?: string;
}

/** A rendered slice of a mail body: plain text or an injected download link. */
export type MailBodyPart =
  | { kind: "text"; text: string }
  | { kind: "link"; download: MailDownload };
