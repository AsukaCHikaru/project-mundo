import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { FILE_ID } from "../content/filesystem";
import {
  DLL_FIRST_NAMES,
  DLL_LAST_NAMES,
  DLL_TITLES,
  dllPermissionFor,
} from "../content/permissionDll";
import { useDesktop } from "../store/desktop";
import { useDialogs } from "../store/dialogs";
import { useFilesystem } from "../store/filesystem";
import { usePermissionDll } from "../store/permissionDll";
import { BevelButton } from "./BevelButton";
import { useMachine } from "./Machine";

/** Pause between a Retry and the follow-up error popping ("less than 1s"). */
const RETRY_DELAY_MS = 500;
/** Consecutive Retries of the all-empty error that crash the machine. */
const CRASH_RETRIES = 3;

/** The selectable empty first row of each list. */
const EMPTY = "";

interface DllGeneratorProps {
  windowId: string;
}

/**
 * `appType: "dll-generator"` window content — three single-select lists
 * (title / last name / first name, each with a selectable empty first row)
 * and Generate/Close. Generate writes `permission.dll` to disk C (a hidden
 * filesystem node revealed here; its data goes to the permission-dll store) —
 * admin-level only for the one combination in `content/permissionDll`.
 * Selecting some empty rows raises a plain error; selecting all three empty
 * raises a retryable one, and retrying it three times in a row crashes the
 * machine.
 */
export function DllGenerator({ windowId }: DllGeneratorProps) {
  const close = useDesktop((s) => s.close);
  const { openDialog, error } = useDialogs(
    useShallow((s) => ({ openDialog: s.open, error: s.error })),
  );
  const reveal = useFilesystem((s) => s.reveal);
  const writeDll = usePermissionDll((s) => s.generate);
  const { crash } = useMachine();

  const [title, setTitle] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);

  /**
   * All-rows-empty error: same Retry behavior, but the follow-up keeps the
   * Retry button, and the `retries`-th consecutive Retry crashes the machine.
   */
  const popAllEmptyError = (retries: number) => {
    openDialog({
      kind: "error",
      // Placeholder copy — real error text is authored by hand.
      message: "A fatal error occurred while generating permission.dll.",
      buttons: [
        {
          label: "Retry",
          onPress: () => {
            const next = retries + 1;
            if (next >= CRASH_RETRIES) crash();
            else setTimeout(() => popAllEmptyError(next), RETRY_DELAY_MS);
          },
        },
        { label: "Close" },
      ],
    });
  };

  const generate = () => {
    if (title === null || lastName === null || firstName === null) {
      error("Select one item from each list.");
      return;
    }
    const picks = [title, lastName, firstName];
    if (picks.every((pick) => pick === EMPTY)) {
      popAllEmptyError(0);
      return;
    }
    if (picks.some((pick) => pick === EMPTY)) {
      // Placeholder copy — real error text is authored by hand.
      error("Failed to generate permission.dll.");
      return;
    }

    writeDll({
      title,
      lastName,
      firstName,
      level: dllPermissionFor({ title, lastName, firstName }),
    });
    reveal(FILE_ID.PERMISSION_DLL);
    openDialog({ message: "permission.dll has been created in C:\\." });
  };

  return (
    <div className="flex h-full flex-col gap-2 p-2 text-black">
      <div className="flex flex-1 gap-2 overflow-hidden">
        <OptionList
          label="Title"
          options={DLL_TITLES}
          selected={title}
          onSelect={setTitle}
        />
        <OptionList
          label="Last Name"
          options={DLL_LAST_NAMES}
          selected={lastName}
          onSelect={setLastName}
        />
        <OptionList
          label="First Name"
          options={DLL_FIRST_NAMES}
          selected={firstName}
          onSelect={setFirstName}
        />
      </div>

      <div className="flex justify-end gap-2">
        <BevelButton onPress={generate} className="min-w-20 px-4 py-1 text-sm">
          Generate
        </BevelButton>
        <BevelButton
          onPress={() => close(windowId)}
          className="min-w-20 px-4 py-1 text-sm"
        >
          Close
        </BevelButton>
      </div>
    </div>
  );
}

interface OptionListProps {
  label: string;
  options: string[];
  /** The selected value; `""` is the empty row, `null` means none yet. */
  selected: string | null;
  onSelect: (value: string) => void;
}

/** One single-select column: label + sunken list with an empty first row. */
function OptionList({ label, options, selected, onSelect }: OptionListProps) {
  return (
    <div className="flex flex-1 flex-col gap-1">
      <div className="text-sm">{label}</div>
      <div className="bevel-in flex-1 overflow-auto bg-white">
        {[EMPTY, ...options].map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className="block w-full px-1 text-left text-sm"
            style={
              selected === option
                ? {
                    background: "var(--color-win-title)",
                    color: "var(--color-win-title-text)",
                  }
                : undefined
            }
          >
            {option === EMPTY ? " " : option}
          </button>
        ))}
      </div>
    </div>
  );
}
