# Project Overview
A web puzzle game: a minimal Windows 95/98 desktop built in React 19 + Tailwind v4 + Bun, with state in Zustand. Think room-escape flash game, but inside an old Windows desktop — the eventual goal is to shut down the PC past a series of obstacles/puzzles. The game-logic / puzzle layer is intentionally deferred; current work is the desktop shell.

## Architecture
- `src/store/desktop.ts` — Zustand store (`useDesktop`): `windows` (keyed by id), `order` (z-stack, last id = top), `focusedId`, and actions `open / close / focus / move / resize / setStatus`. `AppType` enumerates the kinds of programs/documents a window can hold. App types in `SINGLETON_APP_TYPES` (e.g. `dialup`) allow only one window — `open` focuses/restores the existing one instead of spawning a second.
- `src/components/Desktop.tsx` — composition root: desktop background + icons + `<WindowLayer>` + `<Taskbar>`. Reads store slices here and passes them down as props.
- `src/components/WindowLayer.tsx` — owns window **stacking**. Renders windows in `order` (back→front); DOM paint order alone decides what's on top, so there is no per-window z-index. Receives `windows` + `order` as props, does not touch the store.
- `src/components/Window.tsx` — a single window shell (title bar + minimize/close, click-to-focus). Positions itself via its `rect`. Body is delegated to `<WindowContent>`. Dragging/resizing not wired yet (anime.js planned).
- `src/components/WindowContent.tsx` — renders a window's body by switching on `appType` (e.g. `notepad` → `<Notepad>`); unimplemented apps fall through to a placeholder. Casts the untyped `payload` to the app's payload type here.
- `src/components/Notepad.tsx` — edits the document named by its `NotepadPayload` (`{ docId }`), writing changes back to the documents store via a `<textarea>`. Goes read-only when `doc.editPermission > PLAYER_PERMISSION`.

## Dialogs (popups)
- `src/store/dialogs.ts` — `useDialogs` store: a list of open dialogs + `open({ kind, title?, message })`, the `error(message, title?)` convenience, and `close(id)`. Call `error(...)` from anywhere to raise a popup — no prop-drilling. `kind` is `error | warning | info` (drives icon + default title).
- `src/components/Dialog.tsx` — one win9x popup (title bar + close, icon + message, OK; Enter via autofocused OK, Esc to dismiss).
- `src/components/DialogLayer.tsx` — mounted once in `Desktop`, renders all open dialogs centered/cascaded above everything. Wrapper is `pointer-events-none` (click-through); only the dialogs capture clicks (non-modal).
- Example caller: Start → Shut Down checks `hasPermission(level, Permission.ADMIN)` and raises an error popup when the player lacks permission.

## Internet / dial-up
- `src/content/connection.ts` — game config + single source of truth for credentials: `CONNECTION` (random `555-XXXX` number generated per session, `admin` / `password` placeholders), `validateCredentials(...)`, and `CONNECTION_DOC` (the in-world "ISP Account" note built from the same `CONNECTION` object, so clue and check never drift). `CONNECTION_DOC_ID` is reused by the documents seed and the Start menu.
- `src/store/connection.ts` — `useConnection`: `status` (`offline | connected`) + `connect`/`disconnect`. Taskbar shows a 🌐 tray icon (left of the clock) while connected; double-clicking it opens the Dial-Up window (restoring an existing one if open).
- `src/components/DialUp.tsx` — `appType: "dialup"` window content. Connect form (phone / user / password) → timed "Dialing… / Verifying… / Logging on…" sequence → connected view (with Disconnect). Wrong credentials raise an error popup; on success it flips `useConnection` to connected. Launched via the **Dial-Up** desktop icon.

## Permission
- `src/lib/permission.ts` — cross-cutting permission model (used by documents, and by programs later). `Permission` scale (`USER 0 / ADMIN 1 / SYSTEM 99`; SYSTEM is unreachable in-game, so SYSTEM-gated resources are effectively locked), `permissionFromName` (resolves a content-file name like `"system"` to a level), and `hasPermission(level, required)`.
- `src/store/permission.ts` — `usePermission` store: the player's current `level` (starts at `USER`) + `grant(level)` to raise it during play. UI gates on this (e.g. Notepad read-only).

## Documents
- `src/content/documents.csv` — the editable source of truth for default documents. Columns: `id,title,path,editPermission,body` (parsed by header name, so order doesn't matter). `editPermission` is a permission **name** (`user`/`admin`/`system`); multi-line bodies use quoted CSV fields. Edit this freely (incl. in a spreadsheet) — it's hand-authored game content.
- `src/content/csv.ts` — `parseCsv`, a small RFC-4180 parser (quoted commas/newlines, `""` escapes).
- `src/content/documents.ts` — `GameDocument` type and `DEFAULT_DOCUMENTS` (CSV parsed; permission names resolved via `permissionFromName`). Imports the CSV as text via `with { type: "text" }`; `src/csv.d.ts` types that import.
- `src/store/documents.ts` — Zustand store (`useDocuments`): `docs` keyed by id (seeded from defaults, **in-memory only — edits reset on reload**), actions `update / create / remove`. Notepad windows reference docs by id rather than carrying text. Permission is enforced at the UI layer (Notepad), not in `update`.
- `src/components/Taskbar.tsx` — bottom bar: Start button (toggles `<StartMenu>` via local state, closed by a click-away overlay) + one button per open window + `<Clock>` at the right edge.
- `src/components/Clock.tsx` — sunken (`bevel-in`) taskbar clock showing the current time (`h:mm AM/PM`), ticking on a 1s interval.
- `src/components/StartMenu.tsx` — the Start menu panel: vertical banner + Programs/Documents hover-flyouts + Shut Down. Takes `onClose` (taskbar dismisses the menu after a pick). Wired: Documents open the named document in a Notepad window; which docs appear is configured in `src/content/startMenu.ts` (`START_MENU_DOCUMENTS`, by doc id). Calculator + Shut Down still inert.
- `src/components/DesktopIcon.tsx` — double-clickable desktop shortcut that opens a window.
- `src/index.css` — win95 theme tokens (`--color-win-*`), `font-win`, and `.bevel-out` / `.bevel-in` utility classes for the raised/sunken 3D borders.

## Workflow
- Verify with `bunx tsc --noEmit` (ignore the pre-existing `baseUrl deprecated` tsconfig warning).
- Leave changes staged, not committed.
- Don't run `git add` after each edit. Make all the edits, then stage once at the end (or just leave it to me) — no incremental staging mid-task.

# Code Style
- No spread props. Pass every prop explicitly (e.g. `<Foo a={x.a} b={x.b} />`, never `<Foo {...x} />`). Explicit props read more clearly and make the data flow obvious.
- No real-world trademarks in user-facing text or assets. Evoke the win95/98 *look* (bevels, teal desktop, title bars) but use generic, original branding — e.g. "Mundo 95", never "Windows 95", the logo, etc. Avoiding trademark/legal risk.

# Zustand
- When a component reads more than one slice from a store, use a single selector wrapped in `useShallow` (`zustand/react/shallow`) that returns an object of the slices, rather than multiple separate `useStore((s) => s.x)` calls. The object selector returns a new reference every run, so `useShallow` is required to keep the default `Object.is` check from re-rendering on every store change.
- A single-slice read does not need `useShallow` — `const x = useStore((s) => s.x)` is fine.

# Bun
Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Use `bunx <package> <command>` instead of `npx <package> <command>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## Frontend

Use HTML imports with `Bun.serve()`. Don't use `vite`. HTML imports fully support React, CSS, Tailwind.

Server:

```ts#index.ts
import index from "./index.html"

Bun.serve({
  routes: {
    "/": index,
    "/api/users/:id": {
      GET: (req) => {
        return new Response(JSON.stringify({ id: req.params.id }));
      },
    },
  },
  // optional websocket support
  websocket: {
    open: (ws) => {
      ws.send("Hello, world!");
    },
    message: (ws, message) => {
      ws.send(message);
    },
    close: (ws) => {
      // handle close
    }
  },
  development: {
    hmr: true,
    console: true,
  }
})
```

HTML files can import .tsx, .jsx or .js files directly and Bun's bundler will transpile & bundle automatically. `<link>` tags can point to stylesheets and Bun's CSS bundler will bundle.

```html#index.html
<html>
  <body>
    <h1>Hello, world!</h1>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

With the following `frontend.tsx`:

```tsx#frontend.tsx
import React from "react";
import { createRoot } from "react-dom/client";

// import .css files directly and it works
import './index.css';

const root = createRoot(document.body);

export default function Frontend() {
  return <h1>Hello, world!</h1>;
}

root.render(<Frontend />);
```

Then, run index.ts

```sh
bun --hot ./index.ts
```

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.mdx`.
