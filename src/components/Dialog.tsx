import {
  type DialogKind,
  type DialogState,
  useDialogs,
} from "../store/dialogs";
import { BevelButton } from "./BevelButton";

const ICON: Record<DialogKind, string> = {
  error: "❌",
  warning: "⚠️",
  info: "ℹ️",
};

interface DialogProps {
  dialog: DialogState;
}

/** A single win9x-style modal popup: title bar + icon + message + OK button. */
export function Dialog({ dialog }: DialogProps) {
  const close = useDialogs((s) => s.close);
  const dismiss = () => close(dialog.id);

  return (
    <div
      role="alertdialog"
      aria-label={dialog.title}
      onKeyDown={(e) => {
        if (e.key === "Escape") dismiss();
      }}
      className="bevel-out flex w-72 flex-col bg-win-face"
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-1 px-1 py-0.5 text-sm font-bold"
        style={{
          background: "var(--color-win-title)",
          color: "var(--color-win-title-text)",
        }}
      >
        <span className="flex-1 truncate">{dialog.title}</span>
        <BevelButton
          aria-label="Close"
          onPress={dismiss}
          className="grid h-4 w-4 place-items-center text-[10px] leading-none font-bold text-black"
        >
          ✕
        </BevelButton>
      </div>

      {/* Body */}
      <div className="flex items-center gap-3 px-4 py-4 text-sm text-black">
        <span className="text-2xl leading-none">{ICON[dialog.kind]}</span>
        <span className="flex-1">{dialog.message}</span>
      </div>

      {/* Buttons */}
      <div className="flex justify-center pb-3">
        <BevelButton
          autoFocus
          onPress={dismiss}
          className="min-w-20 px-4 py-1 text-sm text-black"
        >
          OK
        </BevelButton>
      </div>
    </div>
  );
}
