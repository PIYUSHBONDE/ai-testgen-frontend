import React, { createContext, useContext, useMemo, useState } from "react";

// Create the Context (no default to force provider usage)
const TestsContext = createContext(null);

// Provider: supplies { tests, setTests } to all descendants
export default function TestsProvider({ children, initialTests = [] }) {
  const [tests, setTests] = useState(initialTests);

  // Memoize to avoid unnecessary re-renders when identity isn't needed
  const value = useMemo(() => ({ tests, setTests }), [tests]);

  return (
    <TestsContext.Provider value={value}>
      {children}
    </TestsContext.Provider>
  );
}

// Custom hook for consuming the context
export function useTests() {
  const ctx = useContext(TestsContext);
  if (!ctx) {
    throw new Error("useTests must be used within a TestsProvider");
  }
  return ctx; // { tests, setTests }
}
