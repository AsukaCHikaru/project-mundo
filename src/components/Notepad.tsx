import { useShallow } from "zustand/react/shallow";
import { hasPermission } from "../lib/permission";
import { type NotepadPayload } from "../store/desktop";
import { useDocuments } from "../store/documents";
import { usePermission } from "../store/permission";

interface NotepadProps {
  payload: NotepadPayload | undefined;
}

/**
 * Notepad content: edits the document named by `payload.docId`, writing changes
 * straight back to the documents store. Goes read-only when the player's
 * permission is below the document's `editPermission`.
 */
export function Notepad({ payload }: NotepadProps) {
  const docId = payload?.docId;
  const { doc, update } = useDocuments(
    useShallow((s) => ({
      doc: docId ? s.docs[docId] : undefined,
      update: s.update,
    })),
  );

  const level = usePermission((s) => s.level);

  if (!doc) return <span>Document not found.</span>;

  const canEdit = hasPermission(level, doc.editPermission);

  return (
    <textarea
      value={doc.body}
      readOnly={!canEdit}
      spellCheck={false}
      onChange={(e) => update(doc.id, { body: e.target.value })}
      className="h-full w-full resize-none bg-transparent font-win text-sm text-black outline-none"
    />
  );
}
