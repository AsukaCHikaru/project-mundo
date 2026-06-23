/**
 * Email content — game data, not UI. Mirrors the documents pattern: a typed
 * record set that seeds the mail store. The player's own mailbox starts empty;
 * `INCOMING_MAILS` is what's waiting on the server, delivered to the Inbox only
 * after a successful (connected) Send/Receive.
 */

import { type Mail } from "../lib/mail";
import { DOWNLOAD_ID } from "./downloads";

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
  {
    id: "floppy-driver-download",
    folder: "inbox",
    from: "downloads@mundo.net",
    to: "you@mundo.net",
    subject: "Your Floppy Driver download is ready",
    date: "Tue 6/16/1998 2:13 PM",
    read: false,
    body: `The driver you requested is ready. Click the link below to download it:`,
    download: { id: DOWNLOAD_ID.FLOPPY_SETUP, label: "Download Floppy Driver Setup.exe" },
  },
];
