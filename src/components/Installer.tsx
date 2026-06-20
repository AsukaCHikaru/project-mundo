import { useEffect, useState } from "react";
import { INSTALL_BY_PROGRAM_ID } from "../content/programs";
import { type InstallerPayload } from "../store/desktop";
import { useDesktop } from "../store/desktop";
import { useFilesystem } from "../store/filesystem";
import { useSystem } from "../store/system";
import { BevelButton } from "./BevelButton";

/** Progress bar cadence while installing — ~1.5s total. */
const TICK_MS = 150;
const PROGRESS_STEP = 10;

/** Wizard steps, in order. Commit happens on reaching COMPLETE. */
const STEP = {
  WELCOME: 1,
  LOCATION: 2,
  INSTALLING: 3,
  COMPLETE: 4,
} as const;

interface InstallerProps {
  windowId: string;
  payload: InstallerPayload | undefined;
}

/**
 * A win9x setup wizard: Welcome → Install location → Installing → Complete.
 *
 * The commit happens exactly once, on reaching the Complete step (see the
 * effect): it sets the system install flag and reveals the program's predefined
 * filesystem nodes. This is the single site that touches both, keeping the flag
 * and the files in sync without the stores coupling. Closing on any earlier
 * step commits nothing; there is no partial install to roll back.
 */
export function Installer({ windowId, payload }: InstallerProps) {
  const close = useDesktop((s) => s.close);
  const install = useSystem((s) => s.install);
  const reveal = useFilesystem((s) => s.reveal);

  const config = payload ? INSTALL_BY_PROGRAM_ID[payload.programId] : undefined;

  const [step, setStep] = useState<number>(STEP.WELCOME);
  const [progress, setProgress] = useState(0);

  // Fill the progress bar while on the Installing step.
  useEffect(() => {
    if (step !== STEP.INSTALLING) return;
    const timer = setInterval(() => {
      setProgress((p) => Math.min(100, p + PROGRESS_STEP));
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [step]);

  // Advance to Complete once the bar fills.
  useEffect(() => {
    if (step === STEP.INSTALLING && progress >= 100) setStep(STEP.COMPLETE);
  }, [step, progress]);

  // The single commit point: flag installed + reveal its nodes on reaching
  // Complete. Both are idempotent, so a re-run is harmless; step stays COMPLETE.
  useEffect(() => {
    if (step !== STEP.COMPLETE || !config) return;
    install(config.programId);
    for (const nodeId of config.reveals) reveal(nodeId);
  }, [step, config, install, reveal]);

  const closeWindow = () => close(windowId);

  if (!config) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <p>This setup program is unavailable.</p>
        <BevelButton onPress={closeWindow} className="px-4 py-1">
          Close
        </BevelButton>
      </div>
    );
  }

  const location = `C:\\Program Files\\${config.name}`;

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex-1">
        {step === STEP.WELCOME && (
          <div className="flex flex-col gap-2">
            <p className="font-bold">Welcome to {config.name} Setup</p>
            <p>
              This wizard will install {config.name} on your computer. By
              continuing you agree to install the software.
            </p>
            <p>Click Next to continue, or Close to quit.</p>
          </div>
        )}

        {step === STEP.LOCATION && (
          <div className="flex flex-col gap-2">
            <p className="font-bold">Choose install location</p>
            <p>{config.name} will be installed in the folder below.</p>
            <div className="bevel-in bg-white px-2 py-1 text-win-shadow select-none">
              {location}
            </div>
            <p>Click Next to begin installing.</p>
          </div>
        )}

        {step === STEP.INSTALLING && (
          <div className="flex flex-col gap-2">
            <p className="font-bold">Installing {config.name}…</p>
            <p>Copying files to {location}</p>
            <div className="bevel-in h-5 bg-white p-0.5">
              <div
                className="h-full bg-win-title"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {step === STEP.COMPLETE && (
          <div className="flex flex-col gap-2">
            <p className="font-bold">Setup complete</p>
            <p>{config.name} has been installed in {location}.</p>
            <p>Click Finish to exit setup.</p>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        {step === STEP.COMPLETE ? (
          // Both buttons simply close — Complete has nothing left to do.
          <>
            <BevelButton onPress={closeWindow} autoFocus className="px-4 py-1">
              Finish
            </BevelButton>
            <BevelButton onPress={closeWindow} className="px-4 py-1">
              Close
            </BevelButton>
          </>
        ) : (
          <>
            <BevelButton
              onPress={() => {
                if (step === STEP.WELCOME) setStep(STEP.LOCATION);
                else if (step === STEP.LOCATION) {
                  setProgress(0);
                  setStep(STEP.INSTALLING);
                }
              }}
              disabled={step === STEP.INSTALLING}
              className="px-4 py-1"
            >
              Next
            </BevelButton>
            <BevelButton onPress={closeWindow} className="px-4 py-1">
              Close
            </BevelButton>
          </>
        )}
      </div>
    </div>
  );
}
