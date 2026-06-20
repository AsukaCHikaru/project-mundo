import { permissionFromName } from "../lib/permission";
import { type GameDocument } from "../lib/documents";
import csvText from "./documents.csv" with { type: "text" };
import { parseCsv } from "./csv";

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
    editPermission: columnOf("editPermission"),
    body: columnOf("body"),
  };

  return rows.slice(1).map((row) => ({
    id: (row[cols.id] ?? "").trim(),
    title: (row[cols.title] ?? "").trim(),
    path: (row[cols.path] ?? "").trim(),
    body: row[cols.body] ?? "",
    editPermission: permissionFromName(row[cols.editPermission] ?? ""),
  }));
}

export const DEFAULT_DOCUMENTS: GameDocument[] = parseDocuments(csvText);
