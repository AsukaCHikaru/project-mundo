import { useState } from "react";

type Category = "programs" | "documents";

const PROGRAMS = [{ glyph: "🧮", label: "Calculator" }];
const DOCUMENTS = [{ glyph: "📄", label: "Read Me" }];

/**
 * The Start menu panel: a win95-style vertical banner on the left and a column
 * of items on the right. Programs/Documents reveal a single-item flyout on
 * hover. Items are presentational only — nothing is wired to actions yet.
 */
export function StartMenu() {
  const [openCategory, setOpenCategory] = useState<Category | null>(null);

  return (
    <div className="bevel-out absolute bottom-full left-0 mb-0.5 flex bg-win-face">
      <div className="flex w-7 items-end justify-center bg-win-title py-2">
        <span className="-rotate-90 text-sm font-bold whitespace-nowrap text-win-title-text">
          Mundo <span className="font-normal">95</span>
        </span>
      </div>

      <div className="w-48 py-0.5">
        <CategoryItem
          glyph="📁"
          label="Programs"
          items={PROGRAMS}
          open={openCategory === "programs"}
          onHover={() => setOpenCategory("programs")}
        />
        <CategoryItem
          glyph="🗂️"
          label="Documents"
          items={DOCUMENTS}
          open={openCategory === "documents"}
          onHover={() => setOpenCategory("documents")}
        />

        <div className="mx-1 my-1 h-px bg-win-shadow" />

        <MenuRow
          glyph="⏻"
          label="Shut Down..."
          onHover={() => setOpenCategory(null)}
        />
      </div>
    </div>
  );
}

interface MenuRowProps {
  glyph: string;
  label: string;
  hasFlyout?: boolean;
  onHover: () => void;
}

/** A single hoverable row inside the menu. */
function MenuRow({ glyph, label, hasFlyout = false, onHover }: MenuRowProps) {
  return (
    <div
      onMouseEnter={onHover}
      className="flex items-center gap-2 px-2 py-1 text-sm text-black hover:bg-win-title hover:text-win-title-text"
    >
      <span className="w-5 text-center text-base">{glyph}</span>
      <span className="flex-1">{label}</span>
      {hasFlyout && <span className="text-xs">▶</span>}
    </div>
  );
}

interface CategoryItemProps {
  glyph: string;
  label: string;
  items: { glyph: string; label: string }[];
  open: boolean;
  onHover: () => void;
}

/** A top-level row whose single child appears in a flyout panel on hover. */
function CategoryItem({
  glyph,
  label,
  items,
  open,
  onHover,
}: CategoryItemProps) {
  return (
    <div className="relative">
      <MenuRow glyph={glyph} label={label} hasFlyout onHover={onHover} />
      {open && (
        <div className="bevel-out absolute top-0 left-full ml-0.5 w-44 bg-win-face py-0.5">
          {items.map((item) => (
            <MenuRow
              key={item.label}
              glyph={item.glyph}
              label={item.label}
              onHover={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}
