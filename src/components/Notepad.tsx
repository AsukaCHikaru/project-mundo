import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { hasPermission } from "../lib/permission";
import { type NotepadPayload } from "../store/desktop";
import { useDocuments } from "../store/documents";
import { useSystem } from "../store/system";

interface NotepadProps {
  payload: NotepadPayload | undefined;
}

/**
 * Notepad content: edits the document named by `payload.docId`, writing changes
 * straight back to the documents store. Goes read-only when the player's
 * permission is below the document's `editPermission`. When editable, it
 * auto-focuses with the caret at the end so the blinking cursor sits where
 * you'd resume typing.
 */
export function Notepad({ payload }: NotepadProps) {
  const docId = payload?.docId;
  const { doc, update } = useDocuments(
    useShallow((s) => ({
      doc: docId ? s.docs[docId] : undefined,
      update: s.update,
    })),
  );

  const level = useSystem((s) => s.permission);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canEdit = !!doc && hasPermission(level, doc.editPermission);

  useEffect(() => {
    if (!canEdit) return;
    const el = textareaRef.current;
    if (!el) return;
    el.focus();
    const end = el.value.length;
    el.setSelectionRange(end, end);
  }, [canEdit]);

  if (!doc) return <span>Document not found.</span>;

  return (
    <textarea
      ref={textareaRef}
      value={doc.body}
      readOnly={!canEdit}
      spellCheck={false}
      onChange={(e) => update(doc.id, { body: e.target.value })}
      className="h-full w-full resize-none bg-transparent font-win text-sm text-black caret-black outline-none"
    />
  );
}
