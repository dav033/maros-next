"use client";

import * as React from "react";
import type { SearchConfig } from "./types";
import type { SearchState } from "./utils";

export function useSearchState<T>(config: SearchConfig<T>) {
  const [state, setState] = React.useState<SearchState<T>>({
    query: "",
    field: "all",
  });

  function setQuery(query: string) {
    setState((prev) => ({ ...prev, query }));
  }

  function setField(field: SearchState<T>["field"]) {
    setState((prev) => ({ ...prev, field }));
  }

  return {
    state,
    setState,
    setQuery,
    setField,
    config,
  };
}
