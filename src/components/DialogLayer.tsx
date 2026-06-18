import { useDialogs } from "../store/dialogs";
import { Dialog } from "./Dialog";

/** Step (px) each stacked dialog is offset so multiple popups cascade. */
const CASCADE_STEP = 16;

/**
 * Renders every open dialog centered on screen, cascaded when several stack,
 * on top of all windows and the taskbar. The full-screen wrapper itself is
 * click-through (`pointer-events-none`); only the dialogs capture clicks.
 */
export function DialogLayer() {
  const dialogs = useDialogs((s) => s.dialogs);
  if (dialogs.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0">
      {dialogs.map((dialog, i) => (
        <div
          key={dialog.id}
          className="pointer-events-auto absolute top-1/2 left-1/2"
          style={{
            transform: `translate(calc(-50% + ${i * CASCADE_STEP}px), calc(-50% + ${i * CASCADE_STEP}px))`,
          }}
        >
          <Dialog dialog={dialog} />
        </div>
      ))}
    </div>
  );
}
