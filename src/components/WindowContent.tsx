import {
  type AppType,
  type ExplorerPayload,
  type NotepadPayload,
} from "../store/desktop";
import { DialUp } from "./DialUp";
import { Email } from "./Email";
import { Explorer } from "./Explorer";
import { Notepad } from "./Notepad";

interface WindowContentProps {
  appType: AppType;
  payload: unknown;
}

/** Renders the body of a window based on its `appType`. */
export function WindowContent({ appType, payload }: WindowContentProps) {
  switch (appType) {
    case "explorer":
      return <Explorer payload={payload as ExplorerPayload | undefined} />;
    case "notepad":
      return <Notepad payload={payload as NotepadPayload | undefined} />;
    case "dialup":
      return <DialUp />;
    case "email":
      return <Email />;
    default:
      return <span>{appType} — not implemented yet</span>;
  }
}
