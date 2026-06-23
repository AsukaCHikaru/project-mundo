import { FILE_ID } from "./filesystem";

/**
 * Download registry — the single source of truth for what each downloadable
 * file *is*: its display name, predefined transfer `sizeKb`, and the filesystem
 * node(s) it reveals once the transfer completes.
 *
 * Like programs, downloads never *add* nodes — the target file is a predefined
 * filesystem node that starts `hidden`; finishing a download flips it to
 * `normal` (see the downloader), so a download "lands" a file in a folder
 * without the tree's shape ever changing. A download link references an entry
 * by `id`; the downloader resolves it here.
 */

/** Download ids — referenced by download links and the downloader payload. */
export const DOWNLOAD_ID = {
  FLOPPY_SETUP: "floppy-setup-download",
} as const;

export type DownloadId = (typeof DOWNLOAD_ID)[keyof typeof DOWNLOAD_ID];

export interface DownloadEntry {
  id: string;
  /** File name shown in the downloader and the default link label. */
  name: string;
  /** Predefined transfer size in KB. At the account speed, time = size / speed. */
  sizeKb: number;
  /** Filesystem node ids revealed (flipped to `normal`) when the download ends. */
  reveals: string[];
}

/** The floppy driver setup — lands in My Downloads once fetched. */
const FLOPPY_SETUP_DOWNLOAD: DownloadEntry = {
  id: DOWNLOAD_ID.FLOPPY_SETUP,
  name: "Floppy Driver Setup.exe",
  sizeKb: 30,
  reveals: [FILE_ID.FLOPPY_SETUP],
};

/** All known downloads, keyed by download id. Add new downloads here. */
export const DOWNLOADS: Record<string, DownloadEntry> = {
  [FLOPPY_SETUP_DOWNLOAD.id]: FLOPPY_SETUP_DOWNLOAD,
};
