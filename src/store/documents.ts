import { create } from "zustand";
import { CONNECTION_DOC } from "../content/connection";
import { DEFAULT_DOCUMENTS, type GameDocument } from "../content/documents";

/** All documents present at game start: CSV defaults plus generated ones. */
const SEED_DOCUMENTS: GameDocument[] = [...DEFAULT_DOCUMENTS, CONNECTION_DOC];

interface DocumentsState {
  /** All documents, keyed by id (seeded from defaults, in-memory only). */
  docs: Record<string, GameDocument>;

  /** Patch a document's title/body. Permission is enforced at the UI layer. */
  update: (id: string, patch: Partial<Pick<GameDocument, "title" | "body">>) => void;
  /** Create a new player document; returns its generated id. */
  create: (doc: Omit<GameDocument, "id">) => string;
  remove: (id: string) => void;
}

let idCounter = 0;
const nextId = () => `doc-${++idCounter}`;

export const useDocuments = create<DocumentsState>((set) => ({
  docs: Object.fromEntries(SEED_DOCUMENTS.map((doc) => [doc.id, doc])),

  update: (id, patch) =>
    set((state) => {
      const doc = state.docs[id];
      if (!doc) return state;
      return { docs: { ...state.docs, [id]: { ...doc, ...patch } } };
    }),

  create: (doc) => {
    const id = nextId();
    set((state) => ({ docs: { ...state.docs, [id]: { ...doc, id } } }));
    return id;
  },

  remove: (id) =>
    set((state) => {
      const { [id]: _removed, ...docs } = state.docs;
      return { docs };
    }),
}));
