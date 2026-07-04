import { create } from "zustand";

export type DialogKind = "error" | "warning" | "info";

/** A dialog button. Pressing always closes the dialog, then runs `onPress`. */
export interface DialogButton {
  label: string;
  onPress?: () => void;
}

export interface DialogState {
  id: string;
  kind: DialogKind;
  title: string;
  message: string;
  /** Buttons, left to right. Absent means the default single OK. */
  buttons?: DialogButton[];
}

interface DialogsState {
  /** Currently-open dialogs, oldest first. Rendered stacked by DialogLayer. */
  dialogs: DialogState[];

  /** Open a dialog; returns its id. Title defaults to one based on `kind`. */
  open: (options: {
    kind?: DialogKind;
    title?: string;
    message: string;
    buttons?: DialogButton[];
  }) => string;
  /** Convenience for the most common case — an error popup. */
  error: (message: string, title?: string) => string;
  close: (id: string) => void;
  /** Dismiss every open dialog — used when the machine crashes/reboots. */
  closeAll: () => void;
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

  open: ({ kind = "info", title, message, buttons }) => {
    const id = nextId();
    set((state) => ({
      dialogs: [
        ...state.dialogs,
        { id, kind, title: title ?? DEFAULT_TITLE[kind], message, buttons },
      ],
    }));
    return id;
  },

  error: (message, title) => get().open({ kind: "error", title, message }),

  close: (id) =>
    set((state) => ({ dialogs: state.dialogs.filter((d) => d.id !== id) })),

  closeAll: () => set({ dialogs: [] }),
}));
