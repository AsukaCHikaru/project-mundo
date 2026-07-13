import { permissionFromName } from "../lib/permission";
import { type GameDocument } from "../lib/documents";
import csvText from "./documents.csv" with { type: "text" };
import { parseCsv } from "./csv";

/** Icon used when the CSV has no `glyph` column (or leaves the cell empty). */
const DEFAULT_GLYPH = "📄";

/** Parses the documents CSV into typed records, mapping columns by header name. */
function parseDocuments(csv: string): GameDocument[] {
  const rows = parseCsv(csv.trim());
  if (rows.length === 0) return [];

  const header = rows[0]!.map((name) => name.trim());
  const columnOf = (name: string) => header.indexOf(name);
  const cols = {
    id: columnOf("id"),
    title: columnOf("title"),
    path: columnOf("path"),
    glyph: columnOf("glyph"),
    editPermission: columnOf("editPermission"),
    body: columnOf("body"),
  };

  return rows.slice(1).map((row) => {
    const path = (row[cols.path] ?? "").trim();
    return {
      id: (row[cols.id] ?? "").trim(),
      title: (row[cols.title] ?? "").trim(),
      path,
      fileName: path.split("\\").at(-1) ?? "",
      glyph: (row[cols.glyph] ?? "").trim() || DEFAULT_GLYPH,
      body: row[cols.body] ?? "",
      editPermission: permissionFromName(row[cols.editPermission] ?? ""),
    };
  });
}

export const DEFAULT_DOCUMENTS: GameDocument[] = parseDocuments(csvText);

const DOCUMENT_BY_ID = new Map(DEFAULT_DOCUMENTS.map((doc) => [doc.id, doc]));

/**
 * The authored document for `id` — the one place content files (filesystem
 * tree, desktop, Start menu) resolve a doc id to its name/path/glyph, so a
 * placement never re-types what the CSV already knows. Throws on an unknown id
 * so a typo in a content file fails at startup instead of rendering blanks.
 */
export function getDocument(id: string): GameDocument {
  const doc = DOCUMENT_BY_ID.get(id);
  if (!doc) throw new Error(`Unknown document id: "${id}" (see documents.csv)`);
  return doc;
}
