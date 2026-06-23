export type MailFolder = "inbox" | "outbox" | "drafts";

export interface Mail {
  id: string;
  folder: MailFolder;
  from: string;
  to: string;
  subject: string;
  body: string;
  /** Display date, e.g. "Mon 6/15/1998 9:41 AM". */
  date: string;
  /** Read state — drives the unread indicator, bold list row, and folder count. */
  read: boolean;
  /** Optional download offer — renders a {@link DownloadLink} in the body. */
  download?: MailDownload;
}

/** A download link carried by a mail (see content/downloads for the id). */
export interface MailDownload {
  /** Download id, resolved against the download registry. */
  id: string;
  /** Link text; falls back to the download's file name when absent. */
  label?: string;
}
