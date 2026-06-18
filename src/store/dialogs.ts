import { create } from "zustand";

export type DialogKind = "error" | "warning" | "info";

export interface DialogState {
  id: string;
  kind: DialogKind;
  title: string;
  message: string;
}

interface DialogsState {
  /** Currently-open dialogs, oldest first. Rendered stacked by DialogLayer. */
  dialogs: DialogState[];

  /** Open a dialog; returns its id. Title defaults to one based on `kind`. */
  open: (options: { kind?: DialogKind; title?: string; message: string }) => string;
  /** Convenience for the most common case — an error popup. */
  error: (message: string, title?: string) => string;
  close: (id: string) => void;
}

const DEFAULT_TITLE: Record<DialogKind, string> = {
  error: "Error",
  warning: "Warning",
  info: "Information",
};

let idCounter = 0;
const nextId = () => `dialog-${++idCounter}`;

export const useDialogs = create<DialogsState>((set, get) => ({
  dialogs: [],

  open: ({ kind = "info", title, message }) => {
    const id = nextId();
    set((state) => ({
      dialogs: [
        ...state.dialogs,
        { id, kind, title: title ?? DEFAULT_TITLE[kind], message },
      ],
    }));
    return id;
  },

  error: (message, title) => get().open({ kind: "error", title, message }),

  close: (id) =>
    set((state) => ({ dialogs: state.dialogs.filter((d) => d.id !== id) })),
}));
