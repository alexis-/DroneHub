import { defineStore } from 'pinia';
import { ref, inject } from 'vue';
import { v4 as uuidv4 } from 'uuid';

import {
  DockPosition,
  PanelType,
  type IDropTarget,
  type IDragState,
  type IDropValidation
} from '#components/ui/dock/models/DockTypes';

import {
  type DockLayout,
  type DockAreaDef,
  type DockAreaPanelStack,
  type Panel,
  createDockLayout,
  createDockAreaPanelStack,
  createDockAreaContainerSplit,
  isPanelStack,
  isContainerSplit,
  addPanelToStack,
  closePanelInStack,
  type IRootArea
} from '#components/ui/dock/models/DockModels';

import {
  validatePosition,
  validateSplitDirection,
  getOppositePosition,
  getSplitDirection,
  getPanelType
} from '#components/ui/dock/DockUtils';

import { LoggerServiceKey } from '#models/injection-keys';
import { getCircularReplacer } from '#utils/json-utils';
import { AppError } from '#models/app-errors';

const CONTEXT = 'dockStore';

export const useDockStore = defineStore('dock', () => {
  const logger = inject(LoggerServiceKey);

  // Layouts
  const savedLayouts = ref<Map<string, DockLayout>>(new Map());

  // Current layout
  const currentLayout = ref<DockLayout>(createDockLayout({ name: 'Default Layout' }));

  // Keep track of each area node by ID
  const areaMap: Map<string, DockAreaDef> = new Map([
    // The center area always exists
    [currentLayout.value.areas.center.areaDef!.id, currentLayout.value.areas.center.areaDef!],
  ]);

  // Drag & Drop
  const dragState = ref<IDragState>({
    isDragging: false,
    panel: null,
    dropTarget: null,
  });


  //#region Area & Panel Utils

  /**
   * Finds a panel by ID in any known panel stack.
   */
  function findPanelById(panelId: string): Panel | null {
    for (const area of areaMap.values()) {
      if (!isPanelStack(area))
        continue;

      const found = area.panelStack.find(p => p.id === panelId);

      if (found)
        return found;
    }

    return null;
  }

  /**
   * Finds the first panel stack in the sub-tree. This is used
   * to attach content panels if an area is not explicitly provided.
   * @param direction 
   * @param area 
   * @returns 
   */
  function findFirstPanelStackFollowingDirection(
    direction: DockPosition,
    area: DockAreaDef | null
  ): DockAreaPanelStack | null {
    if (isPanelStack(area)) {
      return area;
    }

    if (isContainerSplit(area)) {
      let childArea: DockAreaDef;

      switch (direction) {
        case DockPosition.Left:
        case DockPosition.Top:
          childArea = area.leftOrTop;
          break;

        case DockPosition.Right:
        case DockPosition.Bottom:
          childArea = area.rightOrBottom;
          break;

        default:
          logger.error(CONTEXT, 'Invalid direction', direction);
          throw new AppError(CONTEXT, 'Invalid split direction');
      }

      return findFirstPanelStackFollowingDirection(direction, childArea);
    }

    return null;
  }

  /**
   * Ensures a valid center area is returned
   * @param area The area to validate, or undefined
   * @returns A valid center area
   */
  function getSafeCenterArea(area?: DockAreaPanelStack): DockAreaPanelStack {
    if (area && getPanelType(area.absolutePosition) !== PanelType.Content) {
      logger.error(CONTEXT, 'Invalid area type', area);
      throw new AppError(CONTEXT, 'Invalid area type');
    }

    if (area)
      return area;

    const centerRoot = currentLayout.value.areas.center.areaDef;

    return findFirstPanelStackFollowingDirection(DockPosition.Left, centerRoot);
  }

  /**
   * Ensures a valid toolbar area is returned, creating one if necessary.
   * @param area The area to validate, or undefined
   * @returns A valid toolbar area
   */
  function getSafeToolbarArea(area?: DockAreaPanelStack): DockAreaPanelStack {
    if (area && getPanelType(area.absolutePosition) !== PanelType.Toolbar) {
      logger.error(CONTEXT, 'Invalid area type', area);
      throw new AppError(CONTEXT, 'Invalid area type');
    }

    // If area is not provided, try to put it on the left area’s sub-tree
    if (!area) {
      let leftRoot = currentLayout.value.areas.left?.areaDef;

      area = findFirstPanelStackFollowingDirection(DockPosition.Top, leftRoot);

      // If we don’t have a left root yet, create it
      if (!area) {
        area = createDockAreaPanelStack({ absolutePosition: DockPosition.Left });

        currentLayout.value.areas.left = {
          absolutePosition: DockPosition.Left,
          areaDef: area,
          sizePx: 200,
        };
        
        areaMap.set(area.id, area);
      }
    }

    return area;
  }

  //#endregion


  //#region Area & Panel Management

  /**
   * Moves an existing panel to a new area or root position.
   */
  function movePanel(
    panel: Panel,
    relativePosition: DockPosition = DockPosition.Center,
    area?: DockAreaPanelStack | DockPosition,
    makeActive: boolean = true
  ): DockAreaPanelStack {
    if (!panel.parent) {
      logger.warn(CONTEXT, 'Panel is orphaned, use addPanel instead', area, panel);
      return addPanel(panel, relativePosition, area, makeActive);
    }

    try {
      area = _resolveAreaInternal(area, panel);
      
      // Remove and re-add panel to new area
      removePanel(panel);
      _addPanelInternal(panel, relativePosition, area, makeActive);

      return area;
    } catch (e) {
      // If area was a DockPosition, revert
      if (typeof area === 'string' && validatePosition(area)) {
        currentLayout.value.areas[area] = undefined;
      }
      throw e;
    }
  }

  /**
   * Adds a new panel (which has no parent yet) to a specified area or root position.
   */
  function addPanel(
    panel: Panel,
    relativePosition: DockPosition = DockPosition.Center,
    area?: DockAreaPanelStack | DockPosition,
    makeActive: boolean = true
  ): DockAreaPanelStack {
      // If the panel already has a parent, use movePanel instead
    if (panel.parent) {
      logger.warn(CONTEXT, 'Panel has parent, use movePanel instead', area, panel);
      return movePanel(panel, relativePosition, area, makeActive);
    }

    try {
      area = _resolveAreaInternal(area, panel);

      return _addPanelInternal(panel, relativePosition, area, makeActive);
    } catch (e) {
      // If area was a DockPosition, revert
      if (typeof area === 'string' && validatePosition(area)) {
        currentLayout.value.areas[area] = undefined;
      }
      throw e;
    }
  }

  /**
   * Internal helper: resolves the target area or creates a new root area if a DockPosition is given.
   */
  function _resolveAreaInternal(areaOrPosition: DockAreaPanelStack | DockPosition, panel: Panel): DockAreaPanelStack {
    // If areaOrPosition is DockPosition, create new root area
    if (typeof areaOrPosition === 'string') {
      const absolutePosition = areaOrPosition;
      
      if (validatePosition(absolutePosition) === false) {
        logger.error(CONTEXT, 'Invalid area position', absolutePosition);
        throw new AppError(CONTEXT, 'Invalid area position');
      }

      if (currentLayout.value.areas[absolutePosition]) {
        logger.error(CONTEXT, 'Root area already exists', absolutePosition);
        throw new AppError(CONTEXT, 'Root area already exists');
      }

      // Create a new panel stack as root
      const newArea = createDockAreaPanelStack({absolutePosition: absolutePosition});
      areaMap.set(newArea.id, newArea);
      
      // Insert a new IRootArea in the layout with a default size
      currentLayout.value.areas[absolutePosition] = {
        absolutePosition,
        areaDef: newArea,
        sizePx: 200
      };

      return newArea;
    }

    // Otherwise areaOrPosition is an existing area
    const area = areaOrPosition;

    if (!isPanelStack(area)) {
      // Must be a panel stack for adding or moving a panel
      logger.error(CONTEXT, 'Target area is not a panel stack', area, panel);
      throw new AppError(CONTEXT, 'Invalid area for panel');
    }

    // Check if the panel types are consistent
    if (getPanelType(area.absolutePosition) !== panel.panelType) {
      logger.error(CONTEXT, 'Mismatched panel type/area', area, panel);
      throw new AppError(CONTEXT, 'Invalid panel type for area');
    }

    return area;
  }

  /**
   * Internal helper: actually adds the panel to the stack or splits the area if needed.
   */
  function _addPanelInternal(
    panel: Panel,
    relativePosition: DockPosition = DockPosition.Center,
    targetStack?: DockAreaPanelStack,
    makeActive: boolean = true): DockAreaPanelStack {
    // For content panels, ensure we have a center area stack
    if (panel.panelType === PanelType.Content) {
      // TODO: Track and use currently focused content area if no area is provided
      targetStack = getSafeCenterArea(targetStack);
    }

    // For toolbars, ensure we have a valid toolbar area
    else {
      targetStack = getSafeToolbarArea(targetStack);
    }
    
    // If we are splitting (Left/Right/Top/Bottom relative to the target)
    if (relativePosition !== DockPosition.Center) {
      if (!validateSplitDirection(targetStack.absolutePosition, relativePosition)) {
        logger.error(CONTEXT, 'Invalid split direction', targetStack, relativePosition);
        throw new AppError(CONTEXT, 'Invalid split direction');
      }

      // Create container split
      const newContainer = createDockAreaContainerSplit({
        absolutePosition: targetStack.absolutePosition,
        relativePosition: targetStack.relativePosition,
        splitDirection: getSplitDirection(relativePosition),
        parent: targetStack.parent
      });
      areaMap.set(newContainer.id, newContainer);
      
      // Create new panel stack for the dropped panel
      const newPanelStack = createDockAreaPanelStack({
        absolutePosition: targetStack.absolutePosition,
        relativePosition: relativePosition,
      });
      areaMap.set(newPanelStack.id, newPanelStack);

      // Add panel to the new stack
      addPanelToStack(newPanelStack, panel, makeActive);

      // Set container as new parent for both areas
      targetStack.parent = newContainer;
      newPanelStack.parent = newContainer;

      // Organize areas based on relative position
      targetStack.relativePosition = getOppositePosition(relativePosition);

      if (relativePosition === DockPosition.Left || relativePosition === DockPosition.Top) {
        newContainer.leftOrTop = newPanelStack;
        newContainer.rightOrBottom = targetStack;
      } else {
        newContainer.leftOrTop = targetStack;
        newContainer.rightOrBottom = newPanelStack;
      }

      // Update the root reference if we replaced a root stack
      if (!newContainer.parent) {
        // This container is now at root. Find the matching root area in layout:
        const pos = newContainer.absolutePosition;

        if (!currentLayout.value.areas[pos]) {
          currentLayout.value.areas[pos] = {
            absolutePosition: pos,
            areaDef: newContainer,
            sizePx: 200,
          };
        }
        
        else {
          // Overwrite the areaDef with the container
          currentLayout.value.areas[pos].areaDef = newContainer;
        }
      }
      // Otherwise update the area's previous parent to point to the new container
      else if (isContainerSplit(newContainer.parent)) {
        if (newContainer.parent.leftOrTop === targetStack) {
          newContainer.parent.leftOrTop = newContainer;
        } else {
          newContainer.parent.rightOrBottom = newContainer;
        }
      }
      else {
        logger.error(CONTEXT, 'Invalid parent type', newContainer.parent);
        throw new AppError(CONTEXT, 'Invalid parent type');
      }

      return newPanelStack;
    }

    addPanelToStack(targetStack, panel, makeActive);

    return targetStack;
  }

  /**
   * Removes a panel from the layout. If the panel stack becomes empty,
   * we may remove that area from the layout.
   */
  function removePanel(panelOrId: string | Panel): boolean {
    const panel = typeof panelOrId === 'string' ? findPanelById(panelOrId) : panelOrId;

    // Sanity checks
    if (!panel) {
      logger.warn(CONTEXT, 'Panel not found', panel);
      return false;
    }

    if (!panel.parent) {
      logger.warn(CONTEXT, 'Panel is orphaned', panel);
      return false;
    }

    // Actually remove from the panelStack
    const oldArea = panel.parent;

    if (!closePanelInStack(oldArea, panel)) {
      logger.warn(CONTEXT, 'Close panelInStack returned false', panel);
      return false;
    }

    // Possibly remove the now-empty area from the layout
    collapseAreaIfEmpty(oldArea);

    return true;
  }

  /**
   * If a panel stack area is now empty, remove it from the layout.
   */
  function collapseAreaIfEmpty(area: DockAreaPanelStack) {
    // If it still has panels, skip
    if (area.panelStack.length > 0) {
      return;
    }

    const parent = area.parent;
    
    // If no parent, this is a root area in the layout - remove it
    if (!parent) {
      // Don't collapse the center area - it should always exist
      if (area.absolutePosition !== DockPosition.Center) {
        currentLayout.value.areas[area.absolutePosition] = undefined;
        areaMap.delete(area.id);
      }
      
      return;
    }

    // Otherwise, the parent must be a container split
    if (!isContainerSplit(parent)) {
      logger.error(CONTEXT, 'Invalid parent type', parent);
      throw new AppError(CONTEXT, 'Invalid parent type');
    }

    // Remove the parent from the map
    areaMap.delete(parent.id);

    // Get the sibling that will remain
    const siblingArea = parent.leftOrTop === area ? parent.rightOrBottom : parent.leftOrTop;
    
    if (!siblingArea) {
      logger.error(CONTEXT, 'Invalid dock structure - missing sibling area', parent);
      throw new AppError(CONTEXT, 'Invalid dock structure');
    }

    // Update the remaining area's parent to be the container's parent
    siblingArea.parent = parent.parent;
    
    // If container was a root area, update the layout reference
    if (!parent.parent) {
      const rootObj = currentLayout.value.areas[parent.absolutePosition];

      if (!rootObj) {
        logger.error(CONTEXT, 'Invalid dock structure - missing parent area', parent);
        throw new AppError(CONTEXT, 'Invalid dock structure');
      }
      
      rootObj.areaDef = siblingArea;
      
      return;
    }

    // Container has a parent, replace the container with the remaining area in its parent
    const grandParent = parent.parent;

    if (isContainerSplit(grandParent)) {
      if (grandParent.leftOrTop === parent) {
        grandParent.leftOrTop = siblingArea;
      } else {
        grandParent.rightOrBottom = siblingArea;
      }
    }
    else {
      logger.error(CONTEXT, 'Invalid grand-parent type while collapsing', grandParent);
      throw new AppError(CONTEXT, 'Invalid grand-parent type while collapsing');
    }
  }

  //#endregion


  //#region Drag & Drop

  function startDragging(event: DragEvent, panel: Panel) {
    // Ensure the event has a dataTransfer object
    if (!event.dataTransfer) {
      logger.warn(CONTEXT, 'Event has no data transfer', event);
      return;
    }
    
    // Set drag data for browsers that need it
    event.dataTransfer.setData('application/json', JSON.stringify(panel, getCircularReplacer()));
    event.dataTransfer.effectAllowed = 'move';
    
    // Create a drag image to improve the drag visual feedback
    const dragImage = event.target as HTMLElement;
    event.dataTransfer.setDragImage(dragImage, 0, 0);

    // DOM manipulation within a dragstart event handler triggers a native/browser-issued automatic dragabort.
    // We get around this by using a setTimeout to ensure the DOM update occurs after the dragstart event.
    setTimeout(() => {
      dragState.value.isDragging = true;
      dragState.value.panel = panel;
      dragState.value.dropTarget = null;
    }, 0)
  }

  function updateDropTarget(target: IDropTarget | null) {
    if (target && validateDrop(target).isValid == false) {
      dragState.value.dropTarget = null;
      return false;
    }

    dragState.value.dropTarget = target;

    return true;
  }

  function stopDragging() {
    dragState.value.isDragging = false;
    dragState.value.panel = null;
    dragState.value.dropTarget = null;
  }

  function handleDrop(target: IDropTarget): boolean {
    const validation = validateDrop(target)

    if (!validation.isValid || !dragState.value.panel) {
      logger.debug(CONTEXT, 'Invalid drop target: ', validation.message, target, dragState);
      return false;
    }

    const { areaId, absolutePosition, relativePosition } = target;

    const areaOrPosition = areaId
      ? areaMap.get(areaId)
      : absolutePosition;
    
    if (typeof areaOrPosition !== 'string' && !isPanelStack(areaOrPosition)) {
      logger.error(CONTEXT, 'Invalid drop target', null, areaOrPosition, target);
      throw new AppError(CONTEXT, 'Invalid drop target', null, areaOrPosition, target);
    }

    const panel = dragState.value.panel;

    if (panel.parent)
      //@ts-ignore - Typescript fails to evaluate areaOrPosition's true type
      movePanel(panel, relativePosition, areaOrPosition);
    else
      //@ts-ignore
      addPanel(panel, relativePosition, areaOrPosition);

    return true;
  }

  function validateDrop(target: IDropTarget): IDropValidation {
    if (!target) {
      return { isValid: false, message: 'No target specified' };
    }

    if (!dragState.value.panel) {
      return { isValid: false, message: 'No panel being dragged' };
    }

    // If areaId is not set but that root area already exists => invalid
    if (!target.areaId && currentLayout.value.areas[target.absolutePosition]) {
      return { isValid: false, message: 'No target area' };
    }

    const panel = dragState.value.panel;
    const isContentPanel = panel.panelType === PanelType.Content;

    // Content panels can only be dropped in center position
    if (isContentPanel && getPanelType(target.absolutePosition) !== PanelType.Content) {
      return { isValid: false, message: 'Content panels can only be dropped in center' };
    }

    // Side panels can't be dropped in center
    if (!isContentPanel && getPanelType(target.absolutePosition) === PanelType.Content) {
      return { isValid: false, message: 'Toolbars cannot be dropped in center' };
    }

    // Validate split directions based on position
    if (target.relativePosition !== DockPosition.Center) {
      const isValidSplit = validateSplitDirection(target.absolutePosition, target.relativePosition);

      if (!isValidSplit) {
        return { isValid: false, message: 'Invalid split direction for this position' };
      }
    }

    return { isValid: true };
  }

  //#endregion


  //#region Layout Management

  function saveLayout(name: string | null) {
    if (!name || currentLayout.value.name !== name) {
      currentLayout.value = {
        ...currentLayout.value,
        id: uuidv4(),
        name,
      };
    }
    savedLayouts.value.set(currentLayout.value.id, currentLayout.value);
  }

  function loadLayout(layoutId: string) {
    if (!savedLayouts.value.has(layoutId)) {
      throw new Error(`Layout ${layoutId} not found`);
    }
    currentLayout.value = savedLayouts.value.get(layoutId);
  }

  //#endregion


  return {
    layouts: savedLayouts,
    currentLayout,
    areaMap,
    dragState,

    addPanel,
    movePanel,
    removePanel,

    startDragging,
    stopDragging,
    updateDropTarget,
    handleDrop,
    validateDrop,

    saveLayout,
    loadLayout,
  };
});
