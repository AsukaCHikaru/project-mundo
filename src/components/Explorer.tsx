import { useState } from "react";
import { DRIVE_ID, FS_ROOT_ID, getContainer, parentId } from "../content/filesystem";
import { FS_STATE, type FsNode, type FsState } from "../lib/filesystem";
import { PROGRAMS } from "../content/programs";
import { type ExplorerPayload } from "../store/desktop";
import { useDesktop } from "../store/desktop";
import { useDialogs } from "../store/dialogs";
import { useDocuments } from "../store/documents";
import { useFilesystem } from "../store/filesystem";
import { BevelButton } from "./BevelButton";

interface ExplorerProps {
  payload: ExplorerPayload | undefined;
}

/** Icon shown for each node in the listing. */
function glyphFor(node: FsNode): string {
  switch (node.nodeClass) {
    case "root":
      return "🖥️";
    case "drive":
      return node.id === DRIVE_ID.FLOPPY ? "💾" : "🗄️";
    case "folder":
      return "📁";
    case "file":
      return node.fileKind === "exe" ? "⚙️" : "📄";
  }
}

/**
 * Explorer window body: a win9x file manager that browses the static
 * filesystem tree (see `content/filesystem`). Navigation happens in place,
 * web-browser style — Back/Forward/Up plus a read-only address bar — with
 * history kept per-window in local state. A node's live state (normal/hidden/
 * forbidden) comes from the filesystem store: hidden nodes aren't listed,
 * forbidden ones show dimmed and raise their error on open, and normal folders
 * navigate / text files open in Notepad / programs launch via the registry.
 */
export function Explorer({ payload }: ExplorerProps) {
  const open = useDesktop((s) => s.open);
  const docs = useDocuments((s) => s.docs);
  const states = useFilesystem((s) => s.states);
  const error = useDialogs((s) => s.error);

  // Per-window navigation history: a stack of container ids + a cursor.
  const [history, setHistory] = useState<string[]>(() => [
    payload?.nodeId && getContainer(payload.nodeId)
      ? payload.nodeId
      : FS_ROOT_ID,
  ]);
  const [cursor, setCursor] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const current =
    getContainer(history[cursor] ?? FS_ROOT_ID) ?? getContainer(FS_ROOT_ID)!;

  const stateOf = (node: FsNode): FsState =>
    states[node.id] ?? { state: FS_STATE.NORMAL };
  // Hidden nodes don't exist for the player; everything else is listed.
  const children = current.children.filter(
    (node) => stateOf(node).state !== FS_STATE.HIDDEN,
  );

  const canBack = cursor > 0;
  const canForward = cursor < history.length - 1;
  const upId = parentId(current.id);

  const go = (cursorIndex: number) => {
    setCursor(cursorIndex);
    setSelectedId(null);
  };

  /** Navigate into a container, replacing any forward history. */
  const navigate = (nodeId: string) => {
    setHistory((prev) => [...prev.slice(0, cursor + 1), nodeId]);
    setCursor((prev) => prev + 1);
    setSelectedId(null);
  };

  const openNode = (node: FsNode) => {
    const nodeState = stateOf(node);
    if (nodeState.state === FS_STATE.FORBIDDEN) {
      error(nodeState.errorMessage);
      return;
    }
    switch (node.nodeClass) {
      case "root":
      case "drive":
      case "folder":
        navigate(node.id);
        break;
      case "file":
        if (node.fileKind === "txt") {
          const title = docs[node.docId]?.title ?? node.name;
          open({
            appType: "notepad",
            title: `${title} - Notepad`,
            payload: { docId: node.docId },
          });
        } else {
          const program = PROGRAMS[node.program];
          if (program) program.launch(open);
          else error(`Cannot run ${node.name}.`);
        }
        break;
    }
  };

  return (
    <div className="flex h-full flex-col text-black">
      {/* Toolbar: Back / Forward / Up */}
      <div className="flex items-center gap-1 p-1">
        <BevelButton onPress={() => go(cursor - 1)} disabled={!canBack} className="px-2 py-0.5 text-sm">
          ◀ Back
        </BevelButton>
        <BevelButton onPress={() => go(cursor + 1)} disabled={!canForward} className="px-2 py-0.5 text-sm">
          Forward ▶
        </BevelButton>
        <BevelButton
          onPress={() => upId && navigate(upId)}
          disabled={!upId}
          className="px-2 py-0.5 text-sm"
        >
          Up
        </BevelButton>
      </div>

      {/* Read-only address bar */}
      <div className="flex items-center gap-2 px-1 pb-1 text-sm">
        <span className="text-win-shadow">Address</span>
        <div className="bevel-in flex-1 truncate bg-white px-1 py-0.5">
          {current.path}
        </div>
      </div>

      {/* Icon-grid listing of the current folder */}
      <div className="bevel-in flex-1 overflow-auto bg-white p-1">
        <div className="flex flex-wrap content-start gap-1">
          {children.map((node) => (
            <ExplorerIcon
              key={node.id}
              glyph={glyphFor(node)}
              label={node.name}
              selected={selectedId === node.id}
              dimmed={stateOf(node).state === FS_STATE.FORBIDDEN}
              onSelect={() => setSelectedId(node.id)}
              onOpen={() => openNode(node)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface ExplorerIconProps {
  glyph: string;
  label: string;
  selected: boolean;
  /** Shown translucent, like a hidden/unavailable item. */
  dimmed: boolean;
  onSelect: () => void;
  onOpen: () => void;
}

/** A single large-icon entry in the listing — select on click, open on double. */
function ExplorerIcon({ glyph, label, selected, dimmed, onSelect, onOpen }: ExplorerIconProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      onDoubleClick={onOpen}
      className={`flex w-16 flex-col items-center gap-0.5 p-1 text-center text-xs text-black ${dimmed ? "opacity-50" : ""}`}
    >
      <span
        className="grid h-9 w-9 place-items-center text-2xl"
        style={{ filter: selected ? "brightness(0.7)" : undefined }}
      >
        {glyph}
      </span>
      <span
        className="px-0.5 leading-tight break-all"
        style={{
          background: selected ? "var(--color-win-title)" : "transparent",
          color: selected ? "var(--color-win-title-text)" : undefined,
        }}
      >
        {label}
      </span>
    </button>
  );
}
