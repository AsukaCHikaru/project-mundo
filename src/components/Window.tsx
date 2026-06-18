import { createDraggable, type Draggable } from "animejs";
import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { useDesktop, type WindowState } from "../store/desktop";
import { BevelButton } from "./BevelButton";
import { WindowContent } from "./WindowContent";

interface WindowProps {
  window: WindowState;
}

/**
 * A single window shell: title bar with controls + a content area.
 *
 * Dragging is wired with anime.js's `createDraggable`, with the title bar as
 * the drag handle. The axes are mapped to `left`/`top` (not the default
 * `translate` transform), so anime and React write the *same* CSS properties —
 * `draggable.x/y` are absolute coordinates, and there's nothing to reconcile.
 * anime drives the gesture outside React (no per-frame re-renders); `rect`
 * doesn't change during the drag, so React never clobbers anime's writes, and
 * we touch the store just once, on settle. Clicking anywhere brings the window
 * to the front.
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

  const { id, status, title } = window;
  const { x, y, w, h } = window.rect;

  const windowRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLSpanElement>(null);
  const draggableRef = useRef<Draggable | null>(null);

  // Create the draggable on the window element, with the title bar as the
  // handle. Keyed on id + status so it rebinds to the fresh element when a
  // window is minimized (unmounted) and restored. anime reads/commits the
  // store via getState() to avoid stale closures.
  useEffect(() => {
    const el = windowRef.current;
    const handle = handleRef.current;
    if (!el || !handle) return;

    const draggable = createDraggable(el, {
      trigger: handle,
      // Drive left/top directly instead of a transform, so anime and React
      // write the same properties — no transform left over to double-count.
      x: { mapTo: "left" },
      y: { mapTo: "top" },
      // No release momentum — the window snaps to exactly where it's dropped
      // (Win9x windows have no inertia/throw).
      velocityMultiplier: 0,
      // Don't let anime paint grab/grabbing cursors on the handle; Win9x title
      // bars keep the default arrow.
      cursor: false,
      // anime binds native listeners, so the title-bar grab stops the event
      // before it bubbles to the window's onPointerDown — raise here instead.
      onGrab: () => useDesktop.getState().focus(id),
      onSettle: () => {
        const state = useDesktop.getState();
        const win = state.windows[id];
        if (!win) return;
        // draggable.x/y are absolute left/top; commit them (no-op for clicks).
        const nextX = Math.round(draggable.x);
        const nextY = Math.round(draggable.y);
        if (nextX === win.rect.x && nextY === win.rect.y) return;
        state.move(id, nextX, nextY);
        // anime sets an inline z-index on grab; clear it so stacking stays
        // purely paint-order driven (the onGrab focus already raised us).
        el.style.zIndex = "";
      },
    });
    draggableRef.current = draggable;

    return () => {
      draggable.revert();
      draggableRef.current = null;
    };
  }, [id, status]);

  if (status === "minimized") return null;

  const isFocused = focusedId === id;

  return (
    <div
      ref={windowRef}
      role="dialog"
      aria-label={title}
      onPointerDown={() => focus(id)}
      className="bevel-out absolute flex flex-col bg-win-face"
      style={{ left: x, top: y, width: w, height: h }}
    >
      {/* Title bar (drag handle) */}
      <div
        className="flex items-center gap-1 px-1 py-0.5 text-sm font-bold"
        style={{
          background: isFocused
            ? "var(--color-win-title)"
            : "var(--color-win-shadow)",
          color: "var(--color-win-title-text)",
        }}
      >
        <span ref={handleRef} className="flex-1 truncate select-none">
          {title}
        </span>

        <BevelButton
          aria-label="Minimize"
          stopPointerDown
          onPress={() => setStatus(id, "minimized")}
          className="grid h-4 w-4 place-items-end pb-0.5 text-black"
        >
          <span className="block h-0.5 w-2 bg-black" />
        </BevelButton>

        <BevelButton
          aria-label="Close"
          stopPointerDown
          onPress={() => close(id)}
          className="grid h-4 w-4 place-items-center text-[10px] leading-none font-bold text-black"
        >
          ✕
        </BevelButton>
      </div>

      {/* Content area */}
      <div className="bevel-in m-0.5 flex-1 overflow-auto bg-white p-2 text-sm text-black">
        <WindowContent appType={window.appType} payload={window.payload} />
      </div>
    </div>
  );
}
