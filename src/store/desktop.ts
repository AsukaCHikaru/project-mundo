import { create } from "zustand";

/** Identifier for a kind of program/document that can be opened in a window. */
export type AppType =
  | "explorer"
  | "notepad"
  | "recycle-bin"
  | "dialup"
  | "email"
  | "installer";

export type WindowStatus = "normal" | "minimized" | "maximized";

/** Payload for `appType: "notepad"` windows — which document it displays. */
export interface NotepadPayload {
  docId: string;
}

/** Payload for `appType: "explorer"` windows — the filesystem node to start at. */
export interface ExplorerPayload {
  /** Container id to open at; defaults to the root ("My Computer") when absent. */
  nodeId?: string;
}

/** Payload for `appType: "installer"` windows — which program to install. */
export interface InstallerPayload {
  /** Install flag id, resolved against the program registry's install configs. */
  programId: string;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WindowState {
  id: string;
  appType: AppType;
  title: string;
  rect: Rect;
  status: WindowStatus;
  /** App-specific data, e.g. which folder an explorer window shows. */
  payload?: unknown;
}

export interface OpenOptions {
  appType: AppType;
  title: string;
  rect?: Partial<Rect>;
  payload?: unknown;
}

interface DesktopState {
  windows: Record<string, WindowState>;
  /** Z-order, front to back is index 0..n; the last id renders on top. */
  order: string[];
  focusedId: string | null;

  open: (options: OpenOptions) => string;
  close: (id: string) => void;
  focus: (id: string) => void;
  move: (id: string, x: number, y: number) => void;
  resize: (id: string, w: number, h: number) => void;
  setStatus: (id: string, status: WindowStatus) => void;
}

const DEFAULT_RECT: Rect = { x: 80, y: 80, w: 480, h: 320 };

/** Per-app default size, used when `open` isn't given an explicit `rect`. */
const APP_DEFAULT_SIZE: Partial<Record<AppType, Pick<Rect, "w" | "h">>> = {
  email: { w: 680, h: 460 },
};

/** Cascades each new window slightly so they don't stack exactly. */
const CASCADE_STEP = 24;

/** App types that allow only one window — `open` focuses the existing one. */
const SINGLETON_APP_TYPES = new Set<AppType>(["dialup", "email"]);

let idCounter = 0;
const nextId = () => `win-${++idCounter}`;

export const useDesktop = create<DesktopState>((set, get) => ({
  windows: {},
  order: [],
  focusedId: null,

  open: ({ appType, title, rect, payload }) => {
    // Singleton apps: focus (and restore) the existing window instead of
    // opening a second one.
    if (SINGLETON_APP_TYPES.has(appType)) {
      const existingId = get().order.find(
        (winId) => get().windows[winId]?.appType === appType,
      );
      if (existingId) {
        if (get().windows[existingId]?.status === "minimized") {
          get().setStatus(existingId, "normal");
        }
        get().focus(existingId);
        return existingId;
      }
    }

    const id = nextId();
    const offset = get().order.length * CASCADE_STEP;
    const defaultSize = APP_DEFAULT_SIZE[appType];
    const windowState: WindowState = {
      id,
      appType,
      title,
      status: "normal",
      payload,
      rect: {
        x: (rect?.x ?? DEFAULT_RECT.x) + offset,
        y: (rect?.y ?? DEFAULT_RECT.y) + offset,
        w: rect?.w ?? defaultSize?.w ?? DEFAULT_RECT.w,
        h: rect?.h ?? defaultSize?.h ?? DEFAULT_RECT.h,
      },
    };

    set((state) => ({
      windows: { ...state.windows, [id]: windowState },
      order: [...state.order, id],
      focusedId: id,
    }));

    return id;
  },

  close: (id) =>
    set((state) => {
      const { [id]: _removed, ...windows } = state.windows;
      const order = state.order.filter((winId) => winId !== id);
      return {
        windows,
        order,
        focusedId:
          state.focusedId === id ? (order.at(-1) ?? null) : state.focusedId,
      };
    }),

  focus: (id) =>
    set((state) => {
      if (!state.windows[id]) return state;
      if (state.order.at(-1) === id && state.focusedId === id) return state;
      return {
        order: [...state.order.filter((winId) => winId !== id), id],
        focusedId: id,
      };
    }),

  move: (id, x, y) =>
    set((state) => {
      const win = state.windows[id];
      if (!win) return state;
      return {
        windows: { ...state.windows, [id]: { ...win, rect: { ...win.rect, x, y } } },
      };
    }),

  resize: (id, w, h) =>
    set((state) => {
      const win = state.windows[id];
      if (!win) return state;
      return {
        windows: { ...state.windows, [id]: { ...win, rect: { ...win.rect, w, h } } },
      };
    }),

  setStatus: (id, status) =>
    set((state) => {
      const win = state.windows[id];
      if (!win) return state;
      return {
        windows: { ...state.windows, [id]: { ...win, status } },
      };
    }),
}));
