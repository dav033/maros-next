"use client";
import * as React from "react";
import type {
  ContextMenuOption,
  ContextMenuPosition,
  ContextMenuState,
  UseContextMenuResult,
} from "@/types/hooks/context-menu";
const INITIAL_STATE: ContextMenuState = {
  isVisible: false,
  position: { x: 0, y: 0 },
  options: [],
};
const MENU_WIDTH = 240;
const MENU_HEIGHT = 300;
export function useContextMenu(): UseContextMenuResult {
  const [state, setState] = React.useState<ContextMenuState>(INITIAL_STATE);
  const show = React.useCallback(
    (event: React.MouseEvent, options: ContextMenuOption[] = []) => {
      event.preventDefault();
      let x = event.clientX;
      let y = event.clientY;
      const OPTION_HEIGHT = 44; // Adjust based on your design
      const PADDING = 16;
      const menuHeight = Math.min(MENU_HEIGHT, options.length * OPTION_HEIGHT + PADDING * 2);
      if (typeof window !== "undefined") {
        const maxX = window.innerWidth - MENU_WIDTH - PADDING;
        const maxY = window.innerHeight - menuHeight - PADDING;
        if (x > maxX) {
          x = maxX;
        }
        if (y > maxY) {
          y = maxY;
        }
      }
      const position: ContextMenuPosition = { x, y };
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
