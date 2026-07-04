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
 * the drag handle. anime drives the gesture imperatively via a `translate`
 * transform (outside React's render cycle, so no per-frame re-renders). React
 * stays the sole owner of `left/top`. On settle we read the window's actually-
 * rendered position (`getBoundingClientRect`, transform baked in), `reset()`
 * anime completely so none of its internal coordinate/scroll state can re-apply
 * an offset, clear the transform, and commit the new `left/top`. Because the
 * transform is always 0 between drags, later re-renders can't desync the
 * position. Clicking anywhere brings the window to the front.
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
        const win = useDesktop.getState().windows[id];
        const parent = el.offsetParent as HTMLElement | null;
        if (!win || !parent) return;
        // Where anime actually rendered the window (transform included),
        // relative to the positioning parent — i.e. the new left/top. Reading
        // the DOM rather than anime's internal x/y sidesteps its transform vs.
        // scroll coordinate bookkeeping.
        const elRect = el.getBoundingClientRect();
        const parentRect = parent.getBoundingClientRect();
        const nextX = Math.round(elRect.left - parentRect.left);
        const nextY = Math.round(elRect.top - parentRect.top);
        // Fully clear anime's drag state (transform, coords, tickers) so nothing
        // re-applies an offset after we pin the position. Then drop the inline
        // transform/z-index anime left on the element.
        draggable.reset();
        el.style.transform = "";
        el.style.zIndex = "";
        if (nextX === win.rect.x && nextY === win.rect.y) return; // plain click
        // Pin the new position now; React renders the same left/top from rect.
        el.style.left = `${nextX}px`;
        el.style.top = `${nextY}px`;
        useDesktop.getState().move(id, nextX, nextY);
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

        {window.minimizable !== false && (
          <BevelButton
            aria-label="Minimize"
            stopPointerDown
            onPress={() => setStatus(id, "minimized")}
            className="grid h-4 w-4 place-items-end pb-0.5 text-black"
          >
            <span className="block h-0.5 w-2 bg-black" />
          </BevelButton>
        )}

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
        <WindowContent
          windowId={id}
          appType={window.appType}
          payload={window.payload}
        />
      </div>
    </div>
  );
}
