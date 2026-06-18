import { useShallow } from "zustand/react/shallow";
import { useDesktop, type WindowState } from "../store/desktop";
import { WindowContent } from "./WindowContent";

interface WindowProps {
  window: WindowState;
}

/**
 * A single window shell: title bar with controls + a content area.
 * Dragging is intentionally not wired yet (anime.js comes next); for now
 * clicking anywhere brings the window to the front so we can verify z-order.
 */
export function Window({ window }: WindowProps) {
  const { focusedId, focus, close, setStatus } = useDesktop(
    useShallow((s) => ({
      focusedId: s.focusedId,
      focus: s.focus,
      close: s.close,
      setStatus: s.setStatus,
    })),
  );

  if (window.status === "minimized") return null;

  const isFocused = focusedId === window.id;
  const { x, y, w, h } = window.rect;

  return (
    <div
      role="dialog"
      aria-label={window.title}
      onPointerDown={() => focus(window.id)}
      className="bevel-out absolute flex flex-col bg-win-face"
      style={{ left: x, top: y, width: w, height: h }}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-1 px-1 py-0.5 text-sm font-bold"
        style={{
          background: isFocused ? "var(--color-win-title)" : "var(--color-win-shadow)",
          color: "var(--color-win-title-text)",
        }}
      >
        <span className="flex-1 truncate">{window.title}</span>

        <button
          type="button"
          aria-label="Minimize"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => setStatus(window.id, "minimized")}
          className="bevel-out grid h-4 w-4 place-items-end bg-win-face pb-0.5 text-black active:bevel-in"
        >
          <span className="block h-0.5 w-2 bg-black" />
        </button>

        <button
          type="button"
          aria-label="Close"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => close(window.id)}
          className="bevel-out grid h-4 w-4 place-items-center bg-win-face text-[10px] leading-none font-bold text-black active:bevel-in"
        >
          ✕
        </button>
      </div>

      {/* Content area */}
      <div className="bevel-in m-0.5 flex-1 overflow-auto bg-white p-2 text-sm text-black">
        <WindowContent appType={window.appType} payload={window.payload} />
      </div>
    </div>
  );
}
