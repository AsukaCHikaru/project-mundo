import { useShallow } from "zustand/react/shallow";
import { useDesktop, type AppType } from "../store/desktop";
import { DesktopIcon } from "./DesktopIcon";
import { DialogLayer } from "./DialogLayer";
import { Taskbar } from "./Taskbar";
import { WindowLayer } from "./WindowLayer";

const SHORTCUTS: { appType: AppType; label: string; glyph: string }[] = [
  { appType: "explorer", label: "My Computer", glyph: "🖥️" },
  { appType: "notepad", label: "Notepad", glyph: "📝" },
  { appType: "dialup", label: "Dial-Up", glyph: "☎️" },
  { appType: "recycle-bin", label: "Recycle Bin", glyph: "🗑️" },
];

/** The full desktop: background + icons, the window layer, and the taskbar. */
export function Desktop() {
  const { windows, order } = useDesktop(
    useShallow((s) => ({ windows: s.windows, order: s.order })),
  );

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-win-desktop font-win">
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
  );
}
