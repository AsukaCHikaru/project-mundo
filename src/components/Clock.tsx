import { useEffect, useState } from "react";

/** Formats a Date as a win95-style "10:42 PM" (no leading-zero hour). */
function formatTime(date: Date): string {
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** The taskbar clock: a sunken box showing the current time, ticking each minute. */
export function Clock() {
  const [time, setTime] = useState(() => formatTime(new Date()));

  useEffect(() => {
    const id = setInterval(() => setTime(formatTime(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bevel-in flex h-7 items-center bg-win-face px-2 text-sm text-black">
      {time}
    </div>
  );
}
