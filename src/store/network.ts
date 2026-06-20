import { create } from "zustand";

export type NetworkStatus = "offline" | "connected";

interface NetworkState {
  status: NetworkStatus;
  connect: () => void;
  disconnect: () => void;
}

export const useNetwork = create<NetworkState>((set) => ({
  status: "offline",
  connect: () => set({ status: "connected" }),
  disconnect: () => set({ status: "offline" }),
}));
