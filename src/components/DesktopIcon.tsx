import { useState } from "react";

interface DesktopIconProps {
  label: string;
  glyph: string;
  /** Fired on double-click — opens whatever the icon points at. */
  onOpen: () => void;
}

/** A double-clickable desktop shortcut that opens a window. */
export function DesktopIcon({ label, glyph, onOpen }: DesktopIconProps) {
  const [selected, setSelected] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setSelected(true)}
      onDoubleClick={onOpen}
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
