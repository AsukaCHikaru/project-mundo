import { useState } from "react";
import { START_MENU_DOCUMENT_IDS } from "../content/startMenu";
import { hasPermission, Permission } from "../lib/permission";
import { useDesktop } from "../store/desktop";
import { useDialogs } from "../store/dialogs";
import { useDocuments } from "../store/documents";
import { useSystem } from "../store/system";
import { useMachine } from "./Machine";

type Category = "programs" | "documents";

interface MenuItem {
  glyph: string;
  label: string;
  /** Action to run when the item is clicked; omit for not-yet-wired items. */
  onSelect?: () => void;
}

interface StartMenuProps {
  /** Called after an item is chosen so the taskbar can dismiss the menu. */
  onClose: () => void;
}

/**
 * The Start menu panel: a win95-style vertical banner on the left and a column
 * of items on the right. Programs/Documents reveal a flyout on hover. Wired so
 * far: Documents items open the named document in a Notepad window.
 */
export function StartMenu({ onClose }: StartMenuProps) {
  const open = useDesktop((s) => s.open);
  const docs = useDocuments((s) => s.docs);
  const level = useSystem((s) => s.permission);
  const error = useDialogs((s) => s.error);
  const machine = useMachine();
  const [openCategory, setOpenCategory] = useState<Category | null>(null);

  const openDocument = (docId: string) => {
    const title = docs[docId]?.title ?? "Untitled";
    open({
      appType: "notepad",
      title: `${title} - Notepad`,
      payload: { docId },
    });
    onClose();
  };

  const shutDown = () => {
    onClose();
    if (!hasPermission(level, Permission.ADMIN)) {
      error(
        "Access denied. You don't have permission to shut down this computer.",
      );
      return;
    }
    machine.shutDown();
  };

  const openProgram = (appType: "email", title: string) => {
    open({ appType, title });
    onClose();
  };

  const programs: MenuItem[] = [
    {
      glyph: "✉️",
      label: "Email",
      onSelect: () => openProgram("email", "Email"),
    },
  ];
  const documents: MenuItem[] = START_MENU_DOCUMENT_IDS.map((docId) => ({
    glyph: docs[docId]?.glyph ?? "📄",
    label: docs[docId]?.title ?? "Untitled",
    onSelect: () => openDocument(docId),
  }));

  return (
    <div className="bevel-out absolute bottom-full left-0 mb-0.5 flex bg-win-face">
      <div className="flex w-7 items-end justify-center bg-win-title py-2">
        <span className="-rotate-90 text-sm font-bold whitespace-nowrap text-win-title-text" />
      </div>

      <div className="w-48 py-0.5">
        <CategoryItem
          glyph="📁"
          label="Programs"
          items={programs}
          open={openCategory === "programs"}
          onHover={() => setOpenCategory("programs")}
        />
        <CategoryItem
          glyph="🗂️"
          label="Documents"
          items={documents}
          open={openCategory === "documents"}
          onHover={() => setOpenCategory("documents")}
        />

        <div className="mx-1 my-1 h-px bg-win-shadow" />

        <MenuRow
          glyph="⏻"
          label="Shut Down..."
          onHover={() => setOpenCategory(null)}
          onClick={shutDown}
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
  onClick?: () => void;
}

/** A single hoverable row inside the menu. */
function MenuRow({
  glyph,
  label,
  hasFlyout = false,
  onHover,
  onClick,
}: MenuRowProps) {
  return (
    <div
      role="menuitem"
      onMouseEnter={onHover}
      onClick={onClick}
      className="flex cursor-pointer items-center gap-2 px-2 py-1 text-sm text-black hover:bg-win-title hover:text-win-title-text"
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
  items: MenuItem[];
  open: boolean;
  onHover: () => void;
}

/** A top-level row whose child items appear in a flyout panel on hover. */
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
              onClick={item.onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
