import { create } from "zustand";
import {
  INCOMING_MAILS,
  INITIAL_MAILS,
  type Mail,
  type MailFolder,
} from "../content/mail";

interface MailState {
  /** Mail currently in the mailbox, across all folders. */
  mails: Mail[];
  /** Mail not yet downloaded; delivered to the Inbox on a connected Send/Receive. */
  incoming: Mail[];
  selectedFolder: MailFolder;
  /** Id of the mail shown in the reading pane, or null when none is selected. */
  selectedMailId: string | null;

  selectFolder: (folder: MailFolder) => void;
  selectMail: (id: string) => void;
  /** Download pending incoming mail into the Inbox and flush the Outbox. */
  receive: () => void;
}

export const useMail = create<MailState>((set) => ({
  mails: INITIAL_MAILS,
  incoming: INCOMING_MAILS,
  selectedFolder: "inbox",
  selectedMailId: null,

  selectFolder: (folder) => set({ selectedFolder: folder, selectedMailId: null }),

  selectMail: (id) =>
    set((state) => ({
      selectedMailId: id,
      // Opening a mail marks it read.
      mails: state.mails.map((mail) =>
        mail.id === id ? { ...mail, read: true } : mail,
      ),
    })),

  receive: () =>
    set((state) => ({
      // Download incoming into the Inbox; flush the Outbox (nothing to send yet).
      mails: [
        ...state.mails.filter((mail) => mail.folder !== "outbox"),
        ...state.incoming,
      ],
      incoming: [],
    })),
}));
