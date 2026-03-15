import { createContext, ReactNode, useContext } from "react";

import { useAppBootstrap } from "./use-app-bootstrap";

const AppContext = createContext<ReturnType<typeof useAppBootstrap> | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const value = useAppBootstrap();
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used inside AppProvider");
  }
  return ctx;
}
