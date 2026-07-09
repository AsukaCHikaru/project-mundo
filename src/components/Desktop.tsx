import { useShallow } from "zustand/react/shallow";
import { DESKTOP_ITEMS } from "../content/desktop";
import { type DesktopItem } from "../lib/desktop";
import { IS_DEV } from "../lib/env";
import { useDesktop } from "../store/desktop";
import { useDocuments } from "../store/documents";
import { DesktopIcon } from "./DesktopIcon";
import { DevToolbar } from "./DevToolbar";
import { DialogLayer } from "./DialogLayer";
import { Taskbar } from "./Taskbar";
import { WindowLayer } from "./WindowLayer";

/** The full desktop: background + icons, the window layer, and the taskbar. */
export function Desktop() {
  const { windows, order, open } = useDesktop(
    useShallow((s) => ({ windows: s.windows, order: s.order, open: s.open })),
  );
  const docs = useDocuments((s) => s.docs);

  /** The icon's label and what double-clicking it opens. */
  const iconFor = (item: DesktopItem) => {
    if (item.kind === "app") {
      return {
        key: `app-${item.appType}`,
        label: item.label,
        onOpen: () => open({ appType: item.appType, title: item.label }),
      };
    }
    const title = docs[item.docId]?.title ?? "Untitled";
    return {
      key: `doc-${item.docId}`,
      label: title,
      onOpen: () =>
        open({
          appType: "notepad",
          title: `${title} - Notepad`,
          payload: { docId: item.docId },
        }),
    };
  };

  return (
    <div className="flex min-h-screen w-screen flex-col items-center justify-center overflow-auto bg-black">
      {/* The desktop itself: a fixed 800x600 screen. */}
      <div className="relative flex h-[600px] w-[800px] flex-col overflow-hidden bg-win-desktop font-win">
        {/* Work area: icons + windows. */}
        <div className="relative flex-1 overflow-hidden">
          <div className="flex flex-col flex-wrap content-start gap-2 p-2">
            {DESKTOP_ITEMS.map((item) => {
              const icon = iconFor(item);
              return (
                <DesktopIcon
                  key={icon.key}
                  label={icon.label}
                  glyph={item.glyph}
                  onOpen={icon.onOpen}
                />
              );
            })}
          </div>

          <WindowLayer windows={windows} order={order} />
        </div>

        <Taskbar />

        <DialogLayer />
      </div>

      {/* Dev-only tooling, outside the desktop area. */}
      {IS_DEV && <DevToolbar />}
    </div>
  );
}
