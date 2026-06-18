import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { validateLogin, validatePhoneNumber } from "../content/connection";
import { useConnection } from "../store/connection";
import { useDialogs } from "../store/dialogs";
import { BevelButton } from "./BevelButton";

const STEP_MS = 900;

type DialStepKind = "number" | "login" | "logon";

interface DialStep {
  step: DialStepKind;
  message: string;
  order: number;
}

/** Named order of each dialing phase. Referenced when advancing steps. */
const DIAL_STEP = {
  NUMBER: 1,
  LOGIN: 2,
  LOGON: 3,
} as const;

/**
 * The dialing sequence. `{number}` is replaced with the entered phone number.
 * When a step's timer fires it validates (see the effect): "number" checks the
 * dial-up number, "login" the user/password, and the terminal "logon" step
 * connects. `order` identifies the step (see DIAL_STEP); not an array index.
 */
const DIAL_STEPS: DialStep[] = [
  { step: "number", message: "Dialing {number}...", order: DIAL_STEP.NUMBER },
  {
    step: "login",
    message: "Verifying user name and password...",
    order: DIAL_STEP.LOGIN,
  },
  {
    step: "logon",
    message: "Logging on to the network...",
    order: DIAL_STEP.LOGON,
  },
];

type DialUpState =
  | { type: "form" }
  | { type: "dialing"; step: number }
  | { type: "connected" };

/** Dial-Up Networking: connect form → dialing sequence → connected view. */
export function DialUp() {
  const { connect, disconnect } = useConnection(
    useShallow((s) => ({ connect: s.connect, disconnect: s.disconnect })),
  );
  const error = useDialogs((s) => s.error);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<DialUpState>(() =>
    useConnection.getState().status === "connected"
      ? { type: "connected" }
      : { type: "form" },
  );

  // Each step runs for STEP_MS, then validates when the timer fires: on failure
  // show an error and return to the form; on success advance to the next step
  // (which starts its own timer). The terminal "logon" step connects.
  useEffect(() => {
    if (state.type !== "dialing") return;
    const current = DIAL_STEPS.find((s) => s.order === state.step);
    if (!current) return;

    const timer = setTimeout(() => {
      switch (current.step) {
        case "number":
          if (validatePhoneNumber(phoneNumber)) {
            setState({ type: "dialing", step: DIAL_STEP.LOGIN });
          } else {
            error("No answer. Check the dial-up number and try again.");
            setState({ type: "form" });
          }
          break;
        case "login":
          if (validateLogin(username, password)) {
            setState({ type: "dialing", step: DIAL_STEP.LOGON });
          } else {
            error("The user name or password is incorrect.");
            setState({ type: "form" });
          }
          break;
        case "logon":
          connect();
          setState({ type: "connected" });
          break;
      }
    }, STEP_MS);

    return () => clearTimeout(timer);
  }, [state, connect, error, phoneNumber, username, password]);

  if (state.type === "connected") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <p>Connected to the internet.</p>
        <BevelButton
          onPress={() => {
            disconnect();
            setState({ type: "form" });
          }}
          className="px-4 py-1"
        >
          Disconnect
        </BevelButton>
      </div>
    );
  }

  if (state.type === "dialing") {
    const message = (
      DIAL_STEPS.find((s) => s.order === state.step)?.message ?? ""
    ).replace("{number}", phoneNumber);
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <p>{message}</p>
        <BevelButton
          onPress={() => setState({ type: "form" })}
          className="px-4 py-1"
        >
          Cancel
        </BevelButton>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setState({ type: "dialing", step: DIAL_STEP.NUMBER });
      }}
      className="flex h-full flex-col gap-2"
    >
      <Field
        label="Phone number"
        value={phoneNumber}
        onChange={setPhoneNumber}
      />
      <Field label="User name" value={username} onChange={setUsername} />
      <Field
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
      />
      <div className="mt-2 flex justify-end">
        <BevelButton type="submit" className="px-4 py-1">
          Connect
        </BevelButton>
      </div>
    </form>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "password";
}

function Field({ label, value, onChange, type = "text" }: FieldProps) {
  return (
    <label className="flex items-center gap-2">
      <span className="w-24">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bevel-in flex-1 bg-white px-1 py-0.5 text-black outline-none"
      />
    </label>
  );
}
