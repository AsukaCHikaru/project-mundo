import { useEffect, useState } from "react";
import { DOWNLOADS } from "../content/downloads";
import { type DownloaderPayload } from "../store/desktop";
import { useDesktop } from "../store/desktop";
import { useFilesystem } from "../store/filesystem";
import { useSystem } from "../store/system";
import { BevelButton } from "./BevelButton";

/** Transfer cadence: progress advances once per second by the network speed. */
const TICK_MS = 1000;

interface DownloaderProps {
  windowId: string;
  payload: DownloaderPayload | undefined;
}

/**
 * A minimal download dialog: a progress bar that fills at the live network
 * speed (KB/s registered in the system store) until the file's predefined size
 * is reached. On completion it reveals the target filesystem node — so the file
 * "lands" in its folder. Closing before 100% commits nothing: the reveal only
 * fires on completion, so an early Close simply drops the in-progress transfer.
 */
export function Downloader({ windowId, payload }: DownloaderProps) {
  const close = useDesktop((s) => s.close);
  const reveal = useFilesystem((s) => s.reveal);
  const network = useSystem((s) => s.network);

  const entry = payload ? DOWNLOADS[payload.downloadId] : undefined;

  // Bytes transferred so far, in KB. Local — an unfinished download has no
  // persistent state; closing the window discards it.
  const [downloaded, setDownloaded] = useState(0);

  const closeWindow = () => close(windowId);

  const speed = network.state === "connected" ? network.speed : 0;
  const sizeKb = entry?.sizeKb ?? 0;
  const done = entry !== undefined && downloaded >= sizeKb;
  const percent = sizeKb > 0 ? Math.min(100, Math.round((downloaded / sizeKb) * 100)) : 0;

  // Append `speed` KB each second while connected and unfinished. Reads the
  // live speed via the effect deps, so reconnecting at a different speed
  // retunes the rate; disconnecting (speed 0) simply pauses the transfer.
  useEffect(() => {
    if (!entry || done || speed <= 0) return;
    const timer = setInterval(() => {
      setDownloaded((kb) => Math.min(sizeKb, kb + speed));
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [entry, done, speed, sizeKb]);

  // The single commit point: reveal the target node(s) when the bar fills.
  // Idempotent, so a re-run is harmless.
  useEffect(() => {
    if (!entry || !done) return;
    for (const nodeId of entry.reveals) reveal(nodeId);
  }, [entry, done, reveal]);

  if (!entry) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <p>This download is unavailable.</p>
        <BevelButton onPress={closeWindow} className="px-4 py-1">
          Close
        </BevelButton>
      </div>
    );
  }

  const status = done
    ? "Download complete."
    : speed > 0
      ? `Downloading at ${speed} KB/sec…`
      : "Not connected. Connect to the internet to download.";

  return (
    <div className="flex h-full flex-col gap-3 text-black">
      <div className="flex-1">
        <p className="font-bold">{entry.name}</p>
        <p className="text-sm">{status}</p>
        <div className="bevel-in mt-2 h-5 bg-white p-0.5">
          <div className="h-full bg-win-title" style={{ width: `${percent}%` }} />
        </div>
        <p className="mt-1 text-xs">
          {Math.min(downloaded, sizeKb)} of {sizeKb} KB ({percent}%)
        </p>
      </div>

      <div className="flex justify-end">
        <BevelButton onPress={closeWindow} autoFocus className="px-4 py-1">
          Close
        </BevelButton>
      </div>
    </div>
  );
}
