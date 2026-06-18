import { create } from "zustand";

export type ConnectionStatus = "offline" | "connected";

interface ConnectionState {
  status: ConnectionStatus;
  connect: () => void;
  disconnect: () => void;
}

export const useConnection = create<ConnectionState>((set) => ({
  status: "offline",
  connect: () => set({ status: "connected" }),
  disconnect: () => set({ status: "offline" }),
}));
