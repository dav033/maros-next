"use client";

import * as React from "react";
import type {
  ContextMenuOption,
  ContextMenuPosition,
  ContextMenuState,
  UseContextMenuResult,
} from "./types";

const INITIAL_STATE: ContextMenuState = {
  isVisible: false,
  position: { x: 0, y: 0, viewportWidth: 0, viewportHeight: 0 },
  options: [],
};

export function useContextMenu(): UseContextMenuResult {
  const [state, setState] = React.useState<ContextMenuState>(INITIAL_STATE);
  
  const show = React.useCallback(
    (event: React.MouseEvent, options: ContextMenuOption[] = []) => {
      event.preventDefault();
      // Capture click position AND viewport size at the moment of click
      const position: ContextMenuPosition = {
        x: event.clientX,
        y: event.clientY,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      };
      setState({
        isVisible: true,
        position,
        options,
      });
    },
    [],
  );
  
  const hide = React.useCallback(() => {
    setState(INITIAL_STATE);
  }, []);
  
  return React.useMemo(
    () => ({
      isVisible: state.isVisible,
      position: state.position,
      options: state.options,
      show,
      hide,
    }),
    [state.isVisible, state.position, state.options, show, hide],
  );
}

export default useContextMenu;
