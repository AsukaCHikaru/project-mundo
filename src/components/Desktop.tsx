import { useShallow } from "zustand/react/shallow";
import { IS_DEV } from "../lib/env";
import { useDesktop, type AppType } from "../store/desktop";
import { DesktopIcon } from "./DesktopIcon";
import { DevToolbar } from "./DevToolbar";
import { DialogLayer } from "./DialogLayer";
import { Taskbar } from "./Taskbar";
import { WindowLayer } from "./WindowLayer";

const SHORTCUTS: { appType: AppType; label: string; glyph: string }[] = [
  { appType: "explorer", label: "My Computer", glyph: "🖥️" },
  { appType: "notepad", label: "Notepad", glyph: "📝" },
  { appType: "dialup", label: "Dial-Up", glyph: "☎️" },
  { appType: "email", label: "Email", glyph: "✉️" },
  { appType: "recycle-bin", label: "Recycle Bin", glyph: "🗑️" },
];

/** The full desktop: background + icons, the window layer, and the taskbar. */
export function Desktop() {
  const { windows, order } = useDesktop(
    useShallow((s) => ({ windows: s.windows, order: s.order })),
  );

  return (
    <div className="flex min-h-screen w-screen flex-col items-center justify-center overflow-auto bg-black">
      {/* The desktop itself: a fixed 800x600 screen. */}
      <div className="relative flex h-[600px] w-[800px] flex-col overflow-hidden bg-win-desktop font-win">
        {/* Work area: icons + windows. */}
        <div className="relative flex-1 overflow-hidden">
          <div className="flex flex-col flex-wrap content-start gap-2 p-2">
            {SHORTCUTS.map((shortcut) => (
              <DesktopIcon
                key={shortcut.appType}
                appType={shortcut.appType}
                label={shortcut.label}
                glyph={shortcut.glyph}
              />
            ))}
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
