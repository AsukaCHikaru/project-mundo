import {
  type AppType,
  type DownloaderPayload,
  type ExplorerPayload,
  type InstallerPayload,
  type NotepadPayload,
} from "../store/desktop";
import { DialUp } from "./DialUp";
import { DllGenerator } from "./DllGenerator";
import { Downloader } from "./Downloader";
import { Email } from "./Email";
import { Explorer } from "./Explorer";
import { Installer } from "./Installer";
import { Notepad } from "./Notepad";
import { Permissions } from "./Permissions";

interface WindowContentProps {
  windowId: string;
  appType: AppType;
  payload: unknown;
}

/** Renders the body of a window based on its `appType`. */
export function WindowContent({ windowId, appType, payload }: WindowContentProps) {
  switch (appType) {
    case "explorer":
      return <Explorer payload={payload as ExplorerPayload | undefined} />;
    case "notepad":
      return <Notepad payload={payload as NotepadPayload | undefined} />;
    case "dialup":
      return <DialUp />;
    case "permissions":
      return <Permissions />;
    case "email":
      return <Email />;
    case "installer":
      return (
        <Installer
          windowId={windowId}
          payload={payload as InstallerPayload | undefined}
        />
      );
    case "dll-generator":
      return <DllGenerator windowId={windowId} />;
    case "downloader":
      return (
        <Downloader
          windowId={windowId}
          payload={payload as DownloaderPayload | undefined}
        />
      );
    default:
      return <span>{appType} — not implemented yet</span>;
  }
}
