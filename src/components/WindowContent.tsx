import { type AppType, type NotepadPayload } from "../store/desktop";
import { DialUp } from "./DialUp";
import { Notepad } from "./Notepad";

interface WindowContentProps {
  appType: AppType;
  payload: unknown;
}

/** Renders the body of a window based on its `appType`. */
export function WindowContent({ appType, payload }: WindowContentProps) {
  switch (appType) {
    case "notepad":
      return <Notepad payload={payload as NotepadPayload | undefined} />;
    case "dialup":
      return <DialUp />;
    default:
      return <span>{appType} — not implemented yet</span>;
  }
}
