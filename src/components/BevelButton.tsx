import { type PointerEvent, type ReactNode, useState } from "react";

interface ButtonProps {
  /** Fired on press-up — i.e. only when a press both starts and ends on the button. */
  onPress?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  autoFocus?: boolean;
  "aria-label"?: string;
  /** Keep the pointerdown from bubbling (e.g. so it doesn't also focus a window). */
  stopPointerDown?: boolean;
  /** Force the depressed look even when not pressed — for toggled/selected buttons. */
  held?: boolean;
  /** Extra layout/typography classes — padding, flex, text size, colour, etc. */
  className?: string;
  children: ReactNode;
}

/**
 * The shared win9x 3D button. Sits raised (`bevel-out`) at rest and visibly
 * depresses (`bevel-in`) while held, returning when released. It fires on
 * press-up rather than on press-down: a press that starts on the button but is
 * released elsewhere does nothing. Firing rides on the native `onClick`, so
 * keyboard activation and `type="submit"` keep working; the pressed look is the
 * only thing driven by hand.
 */
export function BevelButton({
  onPress,
  type = "button",
  disabled = false,
  autoFocus = false,
  "aria-label": ariaLabel,
  stopPointerDown = false,
  held = false,
  className = "",
  children,
}: ButtonProps) {
  const [pressed, setPressed] = useState(false);

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (stopPointerDown) e.stopPropagation();
    if (!disabled) setPressed(true);
  };

  // Re-depress when the pointer is dragged back over while still held.
  const onPointerEnter = (e: PointerEvent<HTMLButtonElement>) => {
    if (!disabled && (e.buttons & 1) === 1) setPressed(true);
  };

  const release = () => setPressed(false);

  return (
    <button
      type={type}
      disabled={disabled}
      autoFocus={autoFocus}
      aria-label={ariaLabel}
      onClick={onPress}
      onPointerDown={onPointerDown}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      onPointerEnter={onPointerEnter}
      onBlur={release}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setPressed(true);
      }}
      onKeyUp={release}
      className={`${pressed || held ? "bevel-in" : "bevel-out"} bg-win-face disabled:text-win-shadow ${className}`}
    >
      {children}
    </button>
  );
}
