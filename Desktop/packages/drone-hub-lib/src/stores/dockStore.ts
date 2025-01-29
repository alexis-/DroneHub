import { defineStore } from 'pinia';
import { ref, inject } from 'vue';
import { getOppositePosition, getPanelType, validateSplitDirection } from '#components/ui/dock/DockUtils.ts';
import {
  type IDockAreaDef, 
  type Panel, 
  DockLayout,
  DockAreaPanelStackDef,
  DockAreaContainerSplitDef,
} from '#components/ui/dock/models/DockClasses.ts';
import { 
  type IDropTarget, 
  type IDropValidation,
  type IDragState,
  DockPosition,
  SplitDirection,
  PanelType
} from '#components/ui/dock/models/DockTypes.ts';
import { LoggerServiceKey } from '#models/injection-keys.ts';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '#models/app-errors.ts';

const CONTEXT = 'dockStore';

export const useDockStore = defineStore('dock', () => {
  const logger = inject(LoggerServiceKey);

  // Layouts
  const savedLayouts = ref<Map<string, DockLayout>>(new Map());
  const currentLayout = ref<DockLayout>(DockLayout.defaultLayout());

  // Areas
  const areaMap = ref<Map<string, IDockAreaDef>>(new Map([
    [currentLayout.value.areas.center.id, currentLayout.value.areas.center]
  ]));

  // Drag & Drop
  const dragState = ref<IDragState>({
    isDragging: false,
    panel: null,
    dropTarget: null
  });


  // #region Area Utils

  function findPanelById(panelId: string): Panel | null {
    const areaIterator = areaMap.value.values();
    
    for (const area of areaIterator) {
      if (area instanceof DockAreaPanelStackDef == false)
        return;

      const panelIdx = area.panelStack.findIndex(p => p.id === panelId);

      if (panelIdx !== -1)
        return area.panelStack[panelIdx];
    }

    return null;
  }

  /**
   * Finds the area with the specified ID.
   * @param areaId 
   * @returns 
   */
  function findAreaById(areaId: string): IDockAreaDef | undefined {
    return areaMap.value.get(areaId);
  }

  /**
   * Finds the first panel stack starting from the specified area and following the specified direction.
   * @param direction 
   * @param area 
   * @returns 
   */
  function findFirstPanelStackFollowingDirection(direction: DockPosition, area: IDockAreaDef | null): DockAreaPanelStackDef | null {
    if (area instanceof DockAreaPanelStackDef) {
      return area;
    }

    if (area instanceof DockAreaContainerSplitDef) {
      let childArea: IDockAreaDef;

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
  function getSafeCenterArea(area?: DockAreaPanelStackDef): DockAreaPanelStackDef {
    if (area && getPanelType(area.absolutePosition) !== PanelType.Content) {
      logger.error(CONTEXT, 'Invalid area type', area);
      throw new AppError(CONTEXT, 'Invalid area type');
    }

    area = area ?? findFirstPanelStackFollowingDirection(DockPosition.Left, currentLayout.value.areas.center);

    return area;
  }

  /**
   * Ensures a valid toolbar area is returned, creating one if necessary.
   * @param area The area to validate, or undefined
   * @returns A valid toolbar area
   */
  function getSafeToolbarArea(area?: DockAreaPanelStackDef): DockAreaPanelStackDef {
    if (area && getPanelType(area.absolutePosition) !== PanelType.Toolbar) {
      logger.error(CONTEXT, 'Invalid area type', area);
      throw new AppError(CONTEXT, 'Invalid area type');
    }

    area = area ?? findFirstPanelStackFollowingDirection(DockPosition.Top, currentLayout.value.areas.left);

    // Create left area if it doesn't exist
    if (!area) {
      area = new DockAreaPanelStackDef({absolutePosition: DockPosition.Left});
      currentLayout.value.areas.left = area;
    }

    return area;
  }

  //#endregion


  //#region Area & Panel Management

  function movePanel(
    panel: Panel,
    relativePosition: DockPosition = DockPosition.Center,
    newArea?: DockAreaPanelStackDef,
    makeActive: boolean = true): DockAreaPanelStackDef {
    // Sanity checks
    if (!panel.parent) {
      console.warn(CONTEXT, 'Panel is orphaned, use addPanel instead', newArea, panel);
      return addPanel(panel, relativePosition, newArea, makeActive);
    }

    if (newArea && getPanelType(newArea.absolutePosition) !== panel.type) {
      logger.error(CONTEXT, 'Invalid panel type for area', newArea, panel);
      throw new AppError(CONTEXT, 'Invalid panel type for area');
    }

    if (newArea && newArea instanceof DockAreaContainerSplitDef == false) {
      logger.error(CONTEXT, 'Invalid area type', newArea);
      throw new AppError(CONTEXT, 'Invalid area type');
    }
    
    removePanel(panel);
    _addPanelInternal(panel, relativePosition, newArea, makeActive);

    return newArea;
  }

  function addPanel(
    panel: Panel,
    relativePosition: DockPosition = DockPosition.Center,
    area?: DockAreaPanelStackDef,
    makeActive: boolean = true): DockAreaPanelStackDef {
    // Sanity checks
    if (panel.parent) {
      console.warn(CONTEXT, 'Panel has parent, use movePanel instead', area, panel);
      return movePanel(panel, relativePosition, area, makeActive);
    }

    if (area && getPanelType(area.absolutePosition) !== panel.type) {
      logger.error(CONTEXT, 'Invalid panel type for area', area, panel);
      throw new AppError(CONTEXT, 'Invalid panel type for area');
    }

    if (area && area instanceof DockAreaContainerSplitDef == false) {
      logger.error(CONTEXT, 'Invalid area type', area);
      throw new AppError(CONTEXT, 'Invalid area type');
    }

    return _addPanelInternal(panel, relativePosition, area, makeActive);
  }

  function _addPanelInternal(
    panel: Panel,
    relativePosition: DockPosition = DockPosition.Center,
    area?: DockAreaPanelStackDef,
    makeActive: boolean = true): DockAreaPanelStackDef {
    if (panel.type === PanelType.Content) {
      // TODO: Track and use currently focused content area if no area is provided
      area = getSafeCenterArea(area);
    }

    else // PanelType.Toolbar
      area = getSafeToolbarArea(area);
    
    // Handle split if relativePosition is not Center
    if (relativePosition !== DockPosition.Center) {
      // Determine split direction based on relative position
      const splitDirection = (relativePosition === DockPosition.Left || relativePosition === DockPosition.Right)
        ? SplitDirection.Vertical
        : SplitDirection.Horizontal;

      if (!validateSplitDirection(area.absolutePosition, splitDirection)) {
        logger.error(CONTEXT, 'Invalid split direction', area, splitDirection);
        throw new AppError(CONTEXT, 'Invalid split direction');
      }

      // Create container split
      const containerSplit = new DockAreaContainerSplitDef({
        absolutePosition: area.absolutePosition,
        relativePosition: area.relativePosition,
        splitDirection: splitDirection,
        parent: area.parent
      });
      
      // Create new panel stack for the dropped panel
      const newPanelStack = new DockAreaPanelStackDef({
        absolutePosition: area.absolutePosition,
        relativePosition: relativePosition,
      });

      // Set container as new parent for both areas
      area.parent = containerSplit;
      newPanelStack.parent = containerSplit;

      // Organize areas based on relative position
      area.relativePosition = getOppositePosition(relativePosition);

      if (relativePosition === DockPosition.Left || relativePosition === DockPosition.Top) {
        containerSplit.leftOrTop = newPanelStack;
        containerSplit.rightOrBottom = area;
      } else {
        containerSplit.leftOrTop = area;
        containerSplit.rightOrBottom = newPanelStack;
      }

      // Update layout reference if area was a root area
      if (containerSplit.parent === null) {
        currentLayout.value.areas[containerSplit.absolutePosition] = containerSplit;
      }
      // Otherwise update the area's previous parent to point to the new container
      else if (containerSplit.parent instanceof DockAreaContainerSplitDef) {
        if (containerSplit.parent.leftOrTop === area) {
          containerSplit.parent.leftOrTop = containerSplit;
        } else {
          containerSplit.parent.rightOrBottom = containerSplit;
        }
      }
      else {
        logger.error(CONTEXT, 'Invalid parent type', containerSplit.parent);
        throw new AppError(CONTEXT, 'Invalid parent type');
      }

      // Add panel to the new stack
      newPanelStack.addPanel(panel, makeActive);

      return newPanelStack;
    }

    area.addPanel(panel, makeActive);

    return area;
  }

  function removePanel(panelOrId: string | Panel): boolean {
    const panel = typeof panelOrId === 'string' ? findPanelById(panelOrId) : panelOrId;

    // Sanity checks
    if (!panel) {
      console.warn(CONTEXT, 'Panel not found', panel);
      return false;
    }

    if (!panel.parent) {
      console.warn(CONTEXT, 'Panel is orphaned', panel);
      return false;
    }

    _removePanelInternal(panel);

    return true;
  }

  function _removePanelInternal(panel: Panel) {
    const oldArea = panel.parent;

    if (!oldArea.closePanel(panel)) {
      console.warn(CONTEXT, 'Panel not found in area', panel);
      return;
    }

    collapseArea(oldArea);
  }

  function collapseArea(area: IDockAreaDef) {
    // Only panel stacks can be empty and trigger collapse
    if (!(area instanceof DockAreaPanelStackDef) || area.panelStack.length > 0) {
      return;
    }

    const parent = area.parent;
    
    // If no parent, this is a root area in the layout - remove it
    if (!parent) {
      // Don't collapse the center area - it should always exist
      if (area.absolutePosition !== DockPosition.Center) {
        currentLayout.value.areas[area.absolutePosition] = undefined;
      }
      
      return;
    }

    // Parent must be a container split since we have a parent
    if (!(parent instanceof DockAreaContainerSplitDef)) {
      logger.error(CONTEXT, 'Invalid parent type', parent);
      throw new AppError(CONTEXT, 'Invalid parent type');
    }

    // Get the sibling that will remain
    const remainingArea = parent.leftOrTop === area ? parent.rightOrBottom : parent.leftOrTop;
    
    if (!remainingArea) {
      logger.error(CONTEXT, 'Invalid dock structure - missing sibling area', parent);
      throw new AppError(CONTEXT, 'Invalid dock structure');
    }

    // Update the remaining area's parent to be the container's parent
    remainingArea.parent = parent.parent;
    
    // If container was a root area, update the layout reference
    if (!parent.parent) {
      currentLayout.value.areas[parent.absolutePosition] = remainingArea;
      return;
    }

    // Container has a parent, replace the container with the remaining area in its parent
    const grandParent = parent.parent;
    if (grandParent instanceof DockAreaContainerSplitDef) {
      if (grandParent.leftOrTop === parent) {
        grandParent.leftOrTop = remainingArea;
      } else {
        grandParent.rightOrBottom = remainingArea;
      }
    }
    else {
      console.error(CONTEXT, 'Invalid parent type', parent);
      throw new AppError(CONTEXT, 'Invalid parent type');
    }
  }

  //#endregion


  //#region Drag & Drop

  function startDragging(event: DragEvent, panel: Panel) {
    logger.debug(CONTEXT, "startDragging", event, panel);

    // Ensure the event has a dataTransfer object
    if (!event.dataTransfer) {
      logger.warn(CONTEXT, 'Event has no data transfer', event);
      return;
    }
    
    // Set drag data for browsers that need it
    event.dataTransfer.setData('application/json', JSON.stringify(panel));
    event.dataTransfer.effectAllowed = 'move';
    
    // Create a drag image to improve the drag visual feedback
    const dragImage = event.target as HTMLElement;
    event.dataTransfer.setDragImage(dragImage, 0, 0);

    // DOM manipulation within a dragstart event handler triggers a native/browser-issued automatic dragabort.
    // We get around this by using a setTimeout to ensure the DOM update occurs after the dragstart event.
    setTimeout(() => {
      // Replace entire state object to ensure reactivity
      dragState.value = {
        isDragging: true,
        panel: { ...panel }, // Create a new object reference
        dropTarget: null
      };
    }, 0)
  }

  function updateDropTarget(target: IDropTarget | null) {
    logger.debug(CONTEXT, "updateDropTarget with target:", target);

    if (target && validateDrop(target).isValid == false) {
      dragState.value.dropTarget = null;
      return false;
    }

    dragState.value.dropTarget = target;

    return true;
  }

  function stopDragging() {
    console.log("stopDragging");

    dragState.value.isDragging = false;
    dragState.value.panel = null;
    dragState.value.dropTarget = null;
  }

  function handleDrop(target: IDropTarget): boolean {
    const validation = validateDrop(target)
    console.log("handleDrop", validation);

    if (!validation.isValid || !dragState.value.panel) {
      logger.debug(CONTEXT, 'Invalid drop target: ' + validation.message, target, dragState);
      return false;
    }

    const area = findAreaById(target.areaId!);
    
    if (!area || area instanceof DockAreaPanelStackDef == false) {
      logger.error(CONTEXT, 'Invalid drop target ', null, target);
      throw new AppError(CONTEXT, 'Invalid drop target ', null, target);
    }

    const panel = dragState.value.panel;

    if (target.splitDirection)
      return splitArea(panel, area as DockAreaPanelStackDef, target);

    else
      return addPanelToStack(panel, area as DockAreaPanelStackDef);
  }

  function validateDrop(target: IDropTarget): IDropValidation {
    if (!target) {
      return { isValid: false, message: 'No target specified' };
    }

    if (!dragState.value.panel) {
      return { isValid: false, message: 'No panel being dragged' };
    }

    if (!target.areaId) {
      return { isValid: false, message: 'No target area' };
    }

    const panel = dragState.value.panel;
    const isContentPanel = panel.type === PanelType.Content;

    // Content panels can only be dropped in center position
    if (isContentPanel && target.type !== PanelType.Content) {
      return { isValid: false, message: 'Content panels can only be dropped in center' };
    }

    // Side panels can't be dropped in center
    if (!isContentPanel && target.type === PanelType.Content) {
      return { isValid: false, message: 'Toolbars cannot be dropped in center' };
    }

    // Validate split directions based on position
    if (target.splitDirection) {
      const isValidSplit = validateSplitDirection(target.position, target.splitDirection);

      if (!isValidSplit) {
        return { isValid: false, message: 'Invalid split direction for this position' };
      }
    }

    return { isValid: true };
  }

  //#endregion


  //#region Layout Management

  function saveLayout(name: string | null) {
    // Are we saving as a new layout?
    if (!name || currentLayout.value.name != name) {
      currentLayout.value = { id: uuidv4(), ...currentLayout.value, name }; // TODO: Check if deep clone needed
    }
    
    savedLayouts.value[currentLayout.value.id] = currentLayout.value;
  }

  function loadLayout(layoutId: string) {
    if (!savedLayouts.value.has(layoutId))
      throw new Error(`Layout ${layoutId} not found`);

    currentLayout.value = savedLayouts.value[layoutId];
  }

  //#endregion


  return {
    layouts: savedLayouts,
    currentLayout,
    dragState,
    startDragging,
    stopDragging,
    updateDropTarget,
    handleDrop,
    validateDrop,
    removePanel,
    saveLayout,
    loadLayout
  }
})
