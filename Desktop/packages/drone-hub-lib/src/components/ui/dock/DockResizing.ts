/**
 * DockResizing.ts
 *
 * Shared logic for handling dock-area resizing.
 * This file exports two composable-style helpers:
 *   - useRootResizing() for top/left/right/bottom (pixel-based) resizing
 *   - useSplitResizing() for container-split (ratio-based) resizing
 *
 * Each composable returns reactive state and methods:
 *   - startResize
 *   - handleMouseMove
 *   - stopResize
 *
 * The consuming component must wire up the mouse events:
 *   @mousedown  -> startResize
 *   on document -> mousemove -> handleMouseMove
 *                mouseup   -> stopResize
 */

import type { DockAreaContainerSplit, IRootArea } from './models/DockModels';
import { DockPosition, SplitDirection } from './models/DockTypes';


//#region Root Resizing (Pixel-based)


/**
 * State object for root-based resizing of a DockAreaPanelStack (top/left/right/bottom).
 */
export interface RootResizeState {
  
  /**
   * Whether a root-area resize operation is in progress.
   */
  isResizing: boolean;

  /**
   * The root area we are resizing (top, left, right, or bottom).
   */
  targetRoot: IRootArea | null;

  /**
   * Direction: 'horizontal' means resizing top or bottom,
   *            'vertical'   means resizing left or right
   */
  direction: 'horizontal' | 'vertical' | null;

  /**
   * The mouse X position at the start of resizing
   */
  startMouseX: number;

  /**
   * The mouse Y position at the start of resizing
   */
  startMouseY: number;

  /**
   * The original size of the area in pixels at the start of resizing
   */
  startSize: number;
}


/**
 * Provides a set of reactive properties and functions to handle root-area resizing.
 */
export function useRootResizing() {
  
  //#region State

  const state: RootResizeState = {
    isResizing: false,
    targetRoot: null,
    direction: null,
    startMouseX: 0,
    startMouseY: 0,
    startSize: 0,
  };

  //#endregion


  //#region Resizing Methods

  /**
   * Initiates resizing for a given root area, capturing mouse start position and the area’s sizePx.
   * Also disables text selection while dragging.
   *
   * @param direction 'horizontal' or 'vertical'
   * @param rootArea The IRootArea object (top/left/right/bottom)
   * @param event The mousedown event
   */
  function startResize(
    direction: 'horizontal' | 'vertical',
    rootArea: IRootArea,
    event: MouseEvent
  ) {
    if (!rootArea) return;

    state.isResizing = true;
    state.targetRoot = rootArea;
    state.direction = direction;
    state.startMouseX = event.clientX;
    state.startMouseY = event.clientY;

    // Use existing sizePx or pick a default if undefined
    state.startSize = rootArea.sizePx ?? 200;

    // Disable user text selection & set appropriate cursor during the resize
    document.body.style.userSelect = 'none';
    document.body.style.cursor = (direction === 'horizontal')
      ? 'row-resize'
      : 'col-resize';
  }

  /**
   * Handles mousemove during a root-area resize.
   * Updates the root area’s sizePx in real-time.
   * Inverts the delta as needed for right or bottom areas.
   *
   * @param event The mousemove event
   * @param containerSize The total dimension (width or height) of the parent container, used for clamping.
   */
  function handleMouseMove(event: MouseEvent, containerSize = Number.MAX_VALUE) {
    // If we're not resizing, exit
    if (!state.isResizing || !state.targetRoot) return;

    // Prevent text selection or dragging side effects
    event.preventDefault();

    // Calculate deltas
    const dx = event.clientX - state.startMouseX;
    const dy = event.clientY - state.startMouseY;

    let newSize = 0;

    // For horizontal resizing (top/bottom), use dy; for vertical (left/right), use dx.
    // Invert the delta for right/bottom so that dragging inward (negative) grows the area.
    switch (state.targetRoot.absolutePosition) {
      case DockPosition.Top:
        // Dragging down (positive dy) grows top
        newSize = state.startSize + dy;
        break;

      case DockPosition.Bottom:
        // Dragging up (negative dy) grows bottom -> so invert
        newSize = state.startSize - dy;
        break;

      case DockPosition.Left:
        // Dragging right (positive dx) grows left
        newSize = state.startSize + dx;
        break;

      case DockPosition.Right:
        // Dragging left (negative dx) grows right -> so invert
        newSize = state.startSize - dx;
        break;

      default:
        // Should never happen for root areas, but just in case:
        newSize = state.startSize;
        break;
    }

    // Apply a minimum size to avoid overly small panels
    newSize = Math.max(48, newSize);
    
    // Apply a maximum limit of 40% of the container size.
    // This ensures we never exceed 40% of the container dimension in code.
    const maxSize = containerSize * 0.4;
    newSize = Math.min(newSize, maxSize);

    // Update the target root area
    state.targetRoot.sizePx = newSize;
  }


  /**
   * Finalizes resizing, disabling the operation and re-enabling text selection.
   */
  function stopResize() {
    state.isResizing = false;
    state.targetRoot = null;
    state.direction = null;

    // Restore default user selection and cursor
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }

  //#endregion
  

  return {
    state,
    startResize,
    handleMouseMove,
    stopResize,
  };
}


//#endregion


//#region Split Resizing (Ratio-based)


/**
 * State object for resizing a DockAreaContainerSplit.
 */
export interface SplitResizeState {
  
  /**
   * Whether a split-area resize operation is in progress.
   */
  isResizing: boolean;

  /**
   * The container-split we are resizing.
   */
  targetContainer: DockAreaContainerSplit | null;

  /**
   * The mouse X position at the start of resizing
   */
  startMouseX: number;

  /**
   * The mouse Y position at the start of resizing
   */
  startMouseY: number;

  /**
   * The ratio in the container at the start
   */
  startRatio: number;
}


/**
 * Provides a set of reactive properties and functions to handle container-split resizing
 * (where the area uses a ratio in [0,1]).
 */
export function useSplitResizing() {

  //#region State

  const state: SplitResizeState = {
    isResizing: false,
    targetContainer: null,
    startMouseX: 0,
    startMouseY: 0,
    startRatio: 0.5,
  };

  //#endregion


  //#region Resizing Methods

  /**
   * Initiates resizing for a given container-split.
   * Also disables text selection while dragging.
   *
   * @param container The DockAreaContainerSplit
   * @param event The mousedown event
   */
  function startResize(container: DockAreaContainerSplit, event: MouseEvent) {
    if (!container) return;

    state.isResizing = true;
    state.targetContainer = container;
    state.startMouseX = event.clientX;
    state.startMouseY = event.clientY;
    state.startRatio = container.splitRatio;

    // Disable user text selection & set appropriate cursor
    if (container.splitDirection === SplitDirection.Horizontal) {
      document.body.style.cursor = 'row-resize';
    } else {
      document.body.style.cursor = 'col-resize';
    }
    document.body.style.userSelect = 'none';
  }


  /**
   * Handles mousemove, updating the container’s splitRatio.
   * @param containerSize The current container size (width or height) in px
   * @param event The mousemove event
   */
  function handleMouseMove(containerSize: number, event: MouseEvent) {
    if (!state.isResizing || !state.targetContainer) return;

    // Prevent text selection or dragging side effects
    event.preventDefault();

    // Determine delta in the correct axis
    const isHorizontal = (state.targetContainer.splitDirection === SplitDirection.Horizontal);
    const delta = isHorizontal
      ? (event.clientY - state.startMouseY)
      : (event.clientX - state.startMouseX);

    // We compute new ratio from the initial ratio + delta
    const newRatio = (state.startRatio * containerSize + delta) / containerSize;

    // clamp ratio between 0.05 and 0.95 so we never zero out a panel
    const clamped = Math.max(0.05, Math.min(0.95, newRatio));

    state.targetContainer.splitRatio = clamped;
  }


  /**
   * Stops the resize operation and clears state. Restores text selection.
   */
  function stopResize() {
    state.isResizing = false;
    state.targetContainer = null;

    // Restore default user selection and cursor
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }

  //#endregion


  return {
    state,
    startResize,
    handleMouseMove,
    stopResize,
  };
}


//#endregion
