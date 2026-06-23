import { type ReactNode } from "react";
import { DOWNLOADS } from "../content/downloads";
import { useDesktop } from "../store/desktop";

interface DownloadLinkProps {
  /** Download id, resolved against the download registry (see content/downloads). */
  downloadId: string;
  /** Link text; defaults to the download's file name. */
  children?: ReactNode;
}

/**
 * A clickable download link — the reusable trigger that spawns a {@link
 * Downloader} for a registered file. Lives apart from any one host (email
 * today, a browser later) so anywhere that shows downloadable content can drop
 * one in, handing the downloader the file id.
 */
export function DownloadLink({ downloadId, children }: DownloadLinkProps) {
  const open = useDesktop((s) => s.open);
  const entry = DOWNLOADS[downloadId];
  if (!entry) return null;

  const handleClick = () =>
    open({
      appType: "downloader",
      title: `Downloading ${entry.name}`,
      payload: { downloadId },
    });

  return (
    <button
      type="button"
      onClick={handleClick}
      className="text-blue-800 underline hover:text-blue-600"
    >
      {children ?? entry.name}
    </button>
  );
}
