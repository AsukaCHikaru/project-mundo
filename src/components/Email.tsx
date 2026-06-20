import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { type Mail, type MailFolder } from "../lib/mail";
import { useSystem } from "../store/system";
import { useDialogs } from "../store/dialogs";
import { useMail } from "../store/mail";
import { BevelButton } from "./BevelButton";

interface FolderInfo {
  folder: MailFolder;
  glyph: string;
  label: string;
}

const FOLDERS: FolderInfo[] = [
  { folder: "inbox", glyph: "📥", label: "Inbox" },
  { folder: "outbox", glyph: "📤", label: "Outbox" },
  { folder: "drafts", glyph: "📝", label: "Drafts" },
];

/**
 * Email client (Outlook-style): an action bar across the top, a folder list on
 * the left, and the selected folder's mail list above a reading pane on the
 * right. Send/Receive is the only network-aware action — offline raises an
 * error popup; connected downloads pending mail into the Inbox.
 */
export function Email() {
  const networkStatus = useSystem((s) => s.network);
  const error = useDialogs((s) => s.error);
  const {
    mails,
    incoming,
    selectedFolder,
    selectedMailId,
    selectFolder,
    selectMail,
    receive,
  } = useMail(
    useShallow((s) => ({
      mails: s.mails,
      incoming: s.incoming,
      selectedFolder: s.selectedFolder,
      selectedMailId: s.selectedMailId,
      selectFolder: s.selectFolder,
      selectMail: s.selectMail,
      receive: s.receive,
    })),
  );

  // Old-school "you've got mail" check: snapshot the connection once, when the
  // window opens. If you connect *after* it's already open, no badge appears —
  // you'd only learn of waiting mail the next time you launch Email.
  const [connectedOnOpen] = useState(
    () => useSystem.getState().network === "connected",
  );

  const folderMails = mails.filter((mail) => mail.folder === selectedFolder);
  const selectedMail = folderMails.find((mail) => mail.id === selectedMailId);

  const sendReceive = () => {
    if (networkStatus !== "connected") {
      error("Send/Receive failed. You are not connected to the internet.");
      return;
    }
    receive();
  };

  return (
    <div className="flex h-full flex-col text-sm text-black">
      {/* Action bar */}
      <div className="bevel-out flex gap-1 bg-win-face p-1">
        <ActionButton glyph="📝" label="Compose" />
        <ActionButton glyph="↩️" label="Reply" disabled={!selectedMail} />
        <ActionButton
          glyph="📡"
          label="Send/Receive"
          onPress={sendReceive}
          badge={connectedOnOpen && incoming.length > 0}
        />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Folder list */}
        <div className="bevel-in m-1 w-32 overflow-y-auto bg-white">
          {FOLDERS.map((info) => {
            const unread = mails.filter(
              (mail) => mail.folder === info.folder && !mail.read,
            ).length;
            const active = info.folder === selectedFolder;
            return (
              <button
                key={info.folder}
                type="button"
                onClick={() => selectFolder(info.folder)}
                className={`flex w-full items-center gap-2 px-2 py-1 text-left ${
                  active ? "bg-win-title text-win-title-text" : ""
                }`}
              >
                <span>{info.glyph}</span>
                <span className={`flex-1 ${unread > 0 ? "font-bold" : ""}`}>
                  {info.label}
                </span>
                {unread > 0 && <span className="text-xs">({unread})</span>}
              </button>
            );
          })}
        </div>

        {/* Mail list + reading pane */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="bevel-in mt-1 mr-1 h-1/2 overflow-y-auto bg-white">
            {folderMails.length === 0 ? (
              <p className="p-2 text-win-shadow">No items in this folder.</p>
            ) : (
              folderMails.map((mail) => (
                <MailRow
                  key={mail.id}
                  mail={mail}
                  active={mail.id === selectedMailId}
                  onClick={() => selectMail(mail.id)}
                />
              ))
            )}
          </div>

          <div className="bevel-in m-1 flex-1 overflow-y-auto bg-white p-2">
            {selectedMail ? (
              <article className="flex h-full flex-col">
                <header className="mb-2 border-b border-win-shadow pb-1">
                  <p className="font-bold">{selectedMail.subject}</p>
                  <p className="text-xs">From: {selectedMail.from}</p>
                  <p className="text-xs">To: {selectedMail.to}</p>
                  <p className="text-xs">{selectedMail.date}</p>
                </header>
                <p className="whitespace-pre-wrap">{selectedMail.body}</p>
              </article>
            ) : (
              <p className="text-win-shadow">Select a message to read it.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ActionButtonProps {
  glyph: string;
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  /** Show a notification dot — e.g. Send/Receive when mail is waiting. */
  badge?: boolean;
}

function ActionButton({
  glyph,
  label,
  onPress,
  disabled = false,
  badge = false,
}: ActionButtonProps) {
  return (
    <div className="relative">
      <BevelButton
        onPress={onPress}
        disabled={disabled}
        className="flex items-center gap-1 px-3 py-1"
      >
        <span>{glyph}</span>
        <span>{label}</span>
      </BevelButton>
      {badge && (
        <span className="pointer-events-none absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border border-white bg-red-600" />
      )}
    </div>
  );
}

interface MailRowProps {
  mail: Mail;
  active: boolean;
  onClick: () => void;
}

function MailRow({ mail, active, onClick }: MailRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-2 px-2 py-1 text-left ${
        active ? "bg-win-title text-win-title-text" : ""
      }`}
    >
      {/* Unread indicator — a dot for unread, blank (but reserved) once read. */}
      <span className="w-3 shrink-0 text-center leading-5">
        {mail.read ? "" : "●"}
      </span>
      <span className="flex flex-col overflow-hidden">
        <span className={`truncate ${mail.read ? "" : "font-bold"}`}>
          {mail.subject}
        </span>
        <span className="truncate text-xs">{mail.from}</span>
      </span>
    </button>
  );
}
