import { create } from "zustand";

interface DomainStoreProps {
  currentDomain: string;
  setDomain: (domain: string) => void;
}

export const useDomainStore = create<DomainStoreProps>((set) => ({
  currentDomain: "Toutes",
  setDomain: (domain: string) => set({ currentDomain: domain }),
}));
