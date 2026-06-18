/**
 * Email content — game data, not UI. Mirrors the documents pattern: a typed
 * record set that seeds the mail store. The player's own mailbox starts empty;
 * `INCOMING_MAILS` is what's waiting on the server, delivered to the Inbox only
 * after a successful (connected) Send/Receive.
 */

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

/** Mail present in the mailbox at game start. Inbox/Outbox/Drafts all empty. */
export const INITIAL_MAILS: Mail[] = [];

/**
 * Mail waiting on the server. Downloaded into the Inbox only on a successful
 * (connected) Send/Receive — never on open and never while offline.
 */
export const INCOMING_MAILS: Mail[] = [
  {
    id: "hello-world",
    folder: "inbox",
    from: "postmaster@mundo.net",
    to: "you@mundo.net",
    subject: "Hello World",
    date: "Mon 6/15/1998 9:41 AM",
    read: false,
    body: `Welcome to Mundo Mail.

This is your first message. If you can read it, your connection is working.

- The Mundo Mail Team`,
  },
  {
    id: "getting-started",
    folder: "inbox",
    from: "newsletter@mundo.net",
    to: "you@mundo.net",
    subject: "Getting started with Mundo Mail",
    date: "Mon 6/15/1998 9:42 AM",
    read: false,
    body: `A few tips to get you going:

  * Click a message to read it.
  * Use Send/Receive to check for new mail.
  * Compose to write a new message.

Happy mailing!`,
  },
];
