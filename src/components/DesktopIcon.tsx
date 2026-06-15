import { useState } from "react";
import { useDesktop, type AppType } from "../store/desktop";

interface DesktopIconProps {
  appType: AppType;
  label: string;
  glyph: string;
}

/** A double-clickable desktop shortcut that opens a window. */
export function DesktopIcon({ appType, label, glyph }: DesktopIconProps) {
  const open = useDesktop((s) => s.open);
  const [selected, setSelected] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setSelected(true)}
      onDoubleClick={() => open({ appType, title: label })}
      onBlur={() => setSelected(false)}
      className="flex w-20 flex-col items-center gap-1 p-1 text-center text-xs text-white"
    >
      <span
        className="grid h-10 w-10 place-items-center text-2xl"
        style={{ filter: selected ? "brightness(0.7)" : undefined }}
      >
        {glyph}
      </span>
      <span
        className="px-1 leading-tight"
        style={{
          background: selected ? "var(--color-win-title)" : "transparent",
          outline: selected ? "1px dotted #fff" : "none",
        }}
      >
        {label}
      </span>
    </button>
  );
}
