import { create } from "zustand";

interface DomainStoreProps {
  currentDomain: string;
  setDomain: (domain: string) => void;
}

export const useDomainStore = create<DomainStoreProps>((set) => ({
  currentDomain: "Tous",
  setDomain: (domain: string) => set({ currentDomain: domain }),
}));
