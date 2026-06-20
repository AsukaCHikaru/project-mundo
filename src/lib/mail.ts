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
}
