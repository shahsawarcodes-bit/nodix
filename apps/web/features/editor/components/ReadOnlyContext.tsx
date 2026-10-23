"use client";

import { createContext, useContext, type ReactNode, type ReactElement } from "react";

const ReadOnlyContext = createContext<boolean>(false);

export const useReadOnly = (): boolean => useContext(ReadOnlyContext);

export interface ReadOnlyProviderProps {
  value: boolean;
  children: ReactNode;
}

export const ReadOnlyProvider = ({ value, children }: ReadOnlyProviderProps): ReactElement => {
  return <ReadOnlyContext.Provider value={value}>{children}</ReadOnlyContext.Provider>;
};
