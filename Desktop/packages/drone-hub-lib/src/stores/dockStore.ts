import { defineStore } from 'pinia';
import { ref, inject } from 'vue';
import { v4 as uuidv4 } from 'uuid';

import {
  DockPosition,
  PanelType,
  type IDropTarget,
  type IDragState,
  type IDropValidation,
  DragSourceType,
  type IDragPayload,
  DropTargetType
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
  type IRootArea,
  type IIconToolbarItem,
  type DockAreaContainerSplit
} from '#components/ui/dock/models/DockModels';

import {
  validatePosition,
  validateSplitDirection,
  getOppositePosition,
  getSplitDirection,
  getPanelType,
  getDragSourceType,
  getPanelTypeFromDragState
} from '#components/ui/dock/DockUtils';

import { LoggerServiceKey } from '#models/injection-keys';
import { getCircularReplacer } from '#utils/json-utils';
import { AppError } from '#models/app-errors';

const CONTEXT = 'dockStore';

/**
 * useDockStore:
 * A Pinia store that centralizes all docking logic, 
 * including:
 *  - Layout and root areas
 *  - Icon toolbar management
 *  - Panel creation, removal
 *  - Drag & drop
 */
export const useDockStore = defineStore('dock', () => {
  const logger = inject(LoggerServiceKey);

  /**
   * Collection of saved layouts for demonstration (optional).
   * In production, you might store them in a local DB or server.
   */
  const savedLayouts = ref<Map<string, DockLayout>>(new Map());

  /**
   * The current docking layout.
   */
  const currentLayout = ref<DockLayout>(createDockLayout({ name: 'Default Layout' }));

  // Keep track of each area node by ID
  const areaMap: Map<string, DockAreaDef> = new Map([
    // The center area always exists
    [currentLayout.value.areas.center.areaDef!.id, currentLayout.value.areas.center.areaDef!],
  ]);

  /**
   * Toolbar items for the left vertical toolbar. 
   * Each references a sub-tree (panelStack or containerSplit).
   */
  const leftToolbarItems = ref<IIconToolbarItem[]>([]);

  /**
   * Unified drag state for all dock operations:
   *   - dragging panel?
   *   - dragging area hierarchy?
   *   - dragging toolbar item?
   */
  const dragState = ref<IDragState>({
    isDragging: false,
    dragSourceType: null,
    dragSource: null,
    dropTarget: null,
  });


  //#region Area & Panel Utils

  function isRootArea(area: DockAreaDef): boolean {
    return !area.parent
      && currentLayout.value.areas[area.absolutePosition]?.areaDef?.id === area.id;
  }

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
   * Internal: Recursively finds the *first* panel in a hierarchical sub-tree.
   * We define "first" as the first encountered panel stack’s first panel in traversal order.
   * 
   * This is used to get the default icon or label for an entire area.
   * 
   * @param area The top-level DockAreaDef (panel stack or container split).
   * @returns The first Panel found, or null if none exist.
   */
  function getFirstPanelInHierarchy(area: DockAreaDef | null): Panel | null {
    if (!area) return null;

    if (isPanelStack(area)) {
      // If there's at least one panel in the stack, return the first
      if (area.panelStack.length > 0) {
        return area.panelStack[0];
      }
      return null;
    }

    // If it’s a container split, search the leftOrTop child first, then rightOrBottom
    if (isContainerSplit(area)) {
      const leftResult = getFirstPanelInHierarchy(area.leftOrTop);
      if (leftResult) return leftResult;
      return getFirstPanelInHierarchy(area.rightOrBottom);
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
          visible: true
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
  function _resolveAreaInternal(
    areaOrPosition: DockAreaPanelStack | DockPosition | undefined,
    panel: Panel
  ): DockAreaPanelStack {
    if (!areaOrPosition) {
      // default: if content panel => center, else left toolbar
      if (panel.panelType === PanelType.Content) {
        areaOrPosition = DockPosition.Center;
      } else {
        areaOrPosition = DockPosition.Left;
      }
    }

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
      
      // Insert a new IRootArea in the layout with a default size, visible
      currentLayout.value.areas[absolutePosition] = {
        absolutePosition,
        areaDef: newArea,
        sizePx: 200,
        visible: true
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
    makeActive: boolean = true
  ): DockAreaPanelStack {
    // For content panels, ensure we have a center area stack
    if (panel.panelType === PanelType.Content) {
      // TODO: (low priority -- do later)Track and use currently focused content area if no area is provided
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
            visible: true
          };
        }
        
        else {
          // Overwrite the areaDef with the container
          currentLayout.value.areas[pos].areaDef = newContainer;
          currentLayout.value.areas[pos].visible = true;
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

    // Just add to the existing stack
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
   * If an area (panel stack or container split) is now empty, remove it from the layout.
   * For a panel stack, "empty" means no panels; for a container split, "empty" means one (or both)
   * child areas is missing.
   *
   * @param area The area to collapse.
   */
  function collapseAreaIfEmpty(area: DockAreaDef) {
    // For a panel stack, if there are still panels, nothing to collapse.
    if (isPanelStack(area) && area.panelStack.length > 0) {
      return;
    }
    // For a container split, if both children exist, consider it nonempty.
    if (isContainerSplit(area) && area.leftOrTop && area.rightOrBottom) {
      return;
    }
    
    // If no parent, this is a root area in the layout - remove it
    if (isRootArea(area)) {
      // Don't collapse the center area - it should always exist
      if (area.absolutePosition !== DockPosition.Center) {
        currentLayout.value.areas[area.absolutePosition] = undefined;
        areaMap.delete(area.id);
      }
      
      return;
    }

    const parent = area.parent;

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
    if (isRootArea(parent)) {
      const rootObj = currentLayout.value.areas[parent.absolutePosition];

      if (!rootObj) {
        logger.error(CONTEXT, 'Invalid dock structure - missing parent area', parent);
        throw new AppError(CONTEXT, 'Invalid dock structure');
      }
      
      rootObj.areaDef = siblingArea;
      rootObj.visible = true;
      
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

  function makeAreaOrphan(area: DockAreaDef, deleteFromMap: boolean = true) {
    if (isRootArea(area)) {
      if (area.absolutePosition !== DockPosition.Center) {
        currentLayout.value.areas[area.absolutePosition] = undefined;

        if (deleteFromMap) {
          areaMap.delete(area.id);
        }
      }

      return;
    }

    const parent = area.parent;
    
    if (isContainerSplit(parent)) {
      // Remove this area from its parent's children.
      if (parent.leftOrTop && parent.leftOrTop.id === area.id) {
        parent.leftOrTop = undefined;
      }
      
      else if (parent.rightOrBottom && parent.rightOrBottom.id === area.id) {
        parent.rightOrBottom = undefined;
      }

      // Collapse the parent if it is now orphaned.
      collapseAreaIfEmpty(parent);
    }
    
    else {
      logger.error(CONTEXT, 'Invalid parent type', parent);
      throw new AppError(CONTEXT, 'Invalid parent type');
    }

    area.parent = null;

    if (deleteFromMap) {
      areaMap.delete(area.id);
    }
  }


  /**
   * Moves an entire area sub-tree (container split or panel stack) to a new location.
   * Called when the user drags an area from the toolbar to the main layout (or vice versa).
   *
   * Steps:
   *   1. Detach the area from its current parent. If the old parent becomes orphaned,
   *      collapse it (using collapseAreaIfEmpty).
   *   2. If the drop target is the toolbar, leave the area detached.
   *   3. Otherwise, if dropping into the layout:
   *       a. If no root area exists at the target absolute position, assign the area as new root.
   *       b. Else, create a new container split that “merges” the existing root area with the
   *          dropped area, assigning children based on the target.relativePosition.
   *
   * @param area The area sub-tree being moved.
   * @param target The drop target details.
   * @throws AppError if the drop target is invalid.
   */
  function moveAreaHierarchy(area: DockAreaDef, target: IDropTarget): void {
    // Detach the area from its current parent, if any.
    makeAreaOrphan(area, false);
    
    // If dropping into the toolbar, leave the area detached.
    if (target.targetType === DropTargetType.IconToolbar) {
      return;
    }
    
    // Dropping into a layout area.
    if (target.targetType !== DropTargetType.Area) {
      logger.error(CONTEXT, 'Invalid drop target type', target);
      throw new AppError(CONTEXT, 'Invalid drop target type');
    }

    const { areaId, absolutePosition, relativePosition } = target;

    if (!absolutePosition) {
      logger.error(CONTEXT, 'Absolute position missing in drop target', target);
      throw new AppError(CONTEXT, 'Absolute position missing in drop target');
    }

    let rootObj = currentLayout.value.areas[absolutePosition];

    if (!rootObj) {
      // No root area exists: set the moved area as the new root area.
      currentLayout.value.areas[absolutePosition] = {
        absolutePosition: absolutePosition,
        areaDef: area,
        sizePx: 200,
        visible: true
      };

      return;
    }

    // A root area exists. Create a new container split to merge the existing area and the moved area.
    const targetArea = areaMap.get(areaId);
    const splitDir = getSplitDirection(target.relativePosition!);

    const newContainer = createDockAreaContainerSplit({
      absolutePosition: absolutePosition,
      relativePosition: targetArea.relativePosition,
      splitDirection: splitDir,
      parent: targetArea.parent
    });

    areaMap.set(newContainer.id, newContainer);
    
    // Arrange the children based on the target.relativePosition.
    if (relativePosition === DockPosition.Left || relativePosition === DockPosition.Top) {
      newContainer.leftOrTop = area;
      newContainer.rightOrBottom = targetArea;
    }

    else {
      newContainer.leftOrTop = targetArea;
      newContainer.rightOrBottom = area;
    }

    area.parent = newContainer;
    area.relativePosition = target.relativePosition;

    targetArea.parent = newContainer;
    targetArea.relativePosition = getOppositePosition(target.relativePosition);

    // Update the root area with the new container split.
    if (!newContainer.parent) {
      currentLayout.value.areas[absolutePosition].areaDef = newContainer;
      currentLayout.value.areas[absolutePosition].visible = true;
    }

    else {
      const grandParent = newContainer.parent as DockAreaContainerSplit;
      
      if (grandParent.leftOrTop === targetArea) {
        grandParent.leftOrTop = newContainer;
      } else {
        grandParent.rightOrBottom = newContainer;
      }
    }
  }

  //#endregion
  

  //#region Icon Toolbar Items

  /**
   * Adds a hierarchy in the icon toolbar.
   * This is typically done once when the area is created or revealed.
   * 
   * @param area A sub-tree area definition (panelStack or containerSplit)
   * @param toIndex Optional index to insert the new item at, otherwise it will be added to the end
   */
  function addIconToolbarItem(area: DockAreaDef, toIndex: number = -1) {
    let existingIdx = leftToolbarItems.value.findIndex(i => i.areaDef.id === area.id);

    if (existingIdx < 0) {
      existingIdx = leftToolbarItems.value.push({
        id: area.id,
        areaDef: area,
      }) - 1;
    }
    
    if (toIndex >= 0 && toIndex !== existingIdx) {
      reorderIconToolbarItems(existingIdx, toIndex);
    }
  }

  /**
   * Removes an item from the icon toolbar by area ID.
   */
  function removeIconToolbarItem(areaId: string, shouldDelete: boolean) {
    const idx = leftToolbarItems.value.findIndex(i => i.id === areaId);
    
    if (idx < 0) {
      logger.error(CONTEXT, 'Could not find icon toolbar item for removal', areaId);
      throw new AppError(CONTEXT, 'Could not find icon toolbar item for removal', null, areaId);
    }

    const item = leftToolbarItems.value.splice(idx, 1);
    const currentArea = currentLayout.value.areas.left.areaDef;
    
    // Detach the area from its current parent, if any.
    // @ts-ignore
    makeAreaOrphan(item.areaDef, shouldDelete);

    // The removed item was not active, so we don't need to do anything else
    // @ts-ignore
    if (item.areaDef.id !== currentArea.id) {
      return;
    }

    // The removed item was active, we need to activate the next item, if any
    if (leftToolbarItems.value.length <= 0) {
      currentLayout.value.areas.left = undefined;
      return;
    }

    const newIdx = Math.min(idx, leftToolbarItems.value.length - 1);
    toggleIconToolbarItem(leftToolbarItems.value[newIdx].id);
  }

  /**
   * Reorder toolbar items within the icon toolbar items.
   * @param fromIndex the item we’re moving
   * @param toIndex the new index
   */
  function reorderIconToolbarItems(fromIndex: number, toIndex: number) {
    if (fromIndex < 0 || toIndex < 0 ||
        fromIndex >= leftToolbarItems.value.length || toIndex >= leftToolbarItems.value.length) {
      return;
    }
    const item = leftToolbarItems.value.splice(fromIndex, 1)[0];
    leftToolbarItems.value.splice(toIndex, 0, item);
  }

  function toggleIconToolbarItem(itemId: string) {
    const itemIdx = leftToolbarItems.value.findIndex(i => i.id === itemId);

    if (itemIdx < 0) {
      logger.error(CONTEXT, 'Could not find icon toolbar item', itemId);
      return;
    }

    const newArea = leftToolbarItems.value[itemIdx].areaDef;
    const currentArea = currentLayout.value.areas.left?.areaDef;

    if (!currentArea) {
      currentLayout.value.areas.left = {
        absolutePosition: DockPosition.Left,
        areaDef: newArea,
        sizePx: 200,
        visible: true
      }
    }

    else if (newArea === currentArea) {
      currentLayout.value.areas.left.visible = !currentLayout.value.areas.left.visible;
    }

    else {
      currentLayout.value.areas.left.areaDef = newArea;
      currentLayout.value.areas.left.visible = true;
    }
  }

  //#endregion


  //#region Drag & Drop

  /**
   * Begins dragging a panel, or area.
   * @param event The originating DragEvent
   * @param dragSource Panel or area being dragged
   */
  function startDragging(event: DragEvent, dragSource: Panel | DockAreaDef) {
    // Ensure the event has a dataTransfer object
    if (!event.dataTransfer) {
      logger.warn(CONTEXT, 'Event has no data transfer', event);
      return;
    }

    let dragSourceType = getDragSourceType(dragSource);

    const dragPayload: IDragPayload = {
      sourceType: dragSourceType,
      sourceId: dragSource.id
    };
    
    // Set drag data for browsers that need it
    event.dataTransfer.setData('application/json', JSON.stringify(dragPayload, getCircularReplacer()));
    event.dataTransfer.effectAllowed = 'move';
    
    // Create a drag image to improve the drag visual feedback
    const dragImage = event.target as HTMLElement;
    event.dataTransfer.setDragImage(dragImage, 0, 0);

    // DOM manipulation within a dragstart event handler triggers a native/browser-issued automatic dragabort.
    // We get around this by using a setTimeout to ensure the DOM update occurs after the dragstart event.
    setTimeout(() => {
      dragState.value.isDragging = true;
      dragState.value.dragSourceType = dragSourceType;
      dragState.value.dragSource = dragSource;
      dragState.value.dropTarget = null;
    }, 0)
  }

  /**
   * Called to update the drop target (hover).
   */
  function updateDropTarget(target: IDropTarget | null) {
    // If the target is null, we do not validate.
    if (target && validateDrop(target).isValid == false) {
      dragState.value.dropTarget = null;
      return false;
    }

    dragState.value.dropTarget = target;

    return true;
  }

  /**
   * Finishes dragging (drop or cancel).
   */
  function stopDragging() {
    dragState.value.isDragging = false;
    dragState.value.dragSourceType = null;
    dragState.value.dragSource = null;
    dragState.value.dropTarget = null;
  }

  /**
   * Called when the user drops onto a target. We perform the final action
   * (move panel, reorder toolbar item, or move area).
   * TODO: Finish implementing to fully handle area hierarchy drag & drop and icon toolbar target
   */
  function handleDrop(target: IDropTarget): boolean {
    const validation = validateDrop(target)

    if (!validation.isValid) {
      logger.debug(CONTEXT, 'Invalid drop target: ', validation.message, target, dragState.value);
      return false;
    }

    // We are dropping on the vertical icon toolbar
    if (target.targetType === DropTargetType.IconToolbar) {
      _handleToolbarDrop(target);
    }

    else if (target.targetType === DropTargetType.Area) {
      _handleAreaDrop(target);
    }

    else {
      logger.error(CONTEXT, 'Unhandled drop target: ', target, dragState.value);
      throw new AppError(CONTEXT, 'Unhandled drop target');
    }

    return true;
  }

/**
 * Handles a drop event on the vertical icon toolbar.
 * This is used both for reordering toolbar items and for dragging an area or panel into the toolbar.
 * 
 * @param target The drop target details.
 */
  function _handleToolbarDrop(target: IDropTarget) {
    // We are dropping an existing area
    // Currently we can only move entire area sub-trees from the toolbar.
    // That means we are reordering or adding a new item to the toolbar
    if (dragState.value.dragSourceType === DragSourceType.Area) {
      const area = dragState.value.dragSource as DockAreaDef;
      const fromIndex = leftToolbarItems.value.findIndex(i => i.areaDef.id === area.id);

      // We are reordering existing toolbar item
      if (fromIndex >= 0) {
        reorderIconToolbarItems(fromIndex, target.toolbarIndex);
      }

    // Otherwise, if dragging an area from the layout into the toolbar...
      else {
        // 1) Detach the area from its parent and (if needed) merge any empty parents.
        moveAreaHierarchy(area, target);
    
        // 2) Create a new toolbar item referencing that area at the given index.
        addIconToolbarItem(area, target.toolbarIndex);
      }
    }

    // If a panel is being dragged into the toolbar...
    else if (dragState.value.dragSourceType === DragSourceType.Panel) {
      const panel = dragState.value.dragSource as Panel;

      // Remove the panel from its current parent (collapsing that area if needed).
      if (panel.parent) {
        removePanel(panel);
      }

      // Create a new panel stack (area) for the toolbar.
      const newArea = createDockAreaPanelStack({ absolutePosition: DockPosition.Left });

      areaMap.set(newArea.id, newArea);

      // Add the dragged panel into the new area.
      addPanelToStack(newArea, panel, true);

      // Add the new area as an icon toolbar item at the drop index.
      addIconToolbarItem(newArea, target.toolbarIndex);
    }

    else {
      console.error(CONTEXT, 'Invalid drag source type', dragState.value.dragSourceType, dragState.value.dragSource);
      throw new AppError(CONTEXT, 'Invalid drag source type', dragState.value.dragSourceType, dragState.value.dragSource);
    }
  }

  /**
   * Handles a drop event on a dock area.
   * This is used to drop a panel or an area into the main layout.
   * 
   * @param target The drop target details.
   */
  function _handleAreaDrop(target: IDropTarget) {
    const { areaId, absolutePosition, relativePosition } = target;

    const areaOrPosition = areaId
      ? areaMap.get(areaId)
      : absolutePosition;
    
    if (typeof areaOrPosition !== 'string' && !isPanelStack(areaOrPosition)) {
      logger.error(CONTEXT, 'Invalid drop target', null, areaOrPosition, target);
      throw new AppError(CONTEXT, 'Invalid drop target', null, areaOrPosition, target);
    }


    // If dragging an area, remove it from the toolbar and then move it.
    // Currently we can only move entire area sub-trees from the toolbar.
    if (dragState.value.dragSourceType === DragSourceType.Area) {
      const area = dragState.value.dragSource as DockAreaDef;
      const fromIndex = leftToolbarItems.value.findIndex(i => i.areaDef.id === area.id);

      // This shouldn't happen.
      if (fromIndex <= 0) {
        logger.warn(CONTEXT, 'Could not find icon toolbar item for dragged area', null, areaOrPosition, target);
      }

      // remove from local toolbar array
      else {
        removeIconToolbarItem(leftToolbarItems.value[fromIndex].id, false);
      }

      moveAreaHierarchy(area, target);
    }

  // If dragging a panel, move or add the panel to the target area.
    else if (dragState.value.dragSourceType === DragSourceType.Panel) {
      const panel = dragState.value.dragSource as Panel;

      if (panel.parent) {
        //@ts-ignore - Typescript fails to evaluate areaOrPosition's true type
        movePanel(panel, relativePosition, areaOrPosition);
      }

      else {
        //@ts-ignore
        addPanel(panel, relativePosition, areaOrPosition);
      }
    }

    else {
      logger.error(CONTEXT, 'Invalid drag source type', dragState.value.dragSourceType, dragState.value.dragSource);
      throw new AppError(CONTEXT, 'Invalid drag source type', dragState.value.dragSourceType, dragState.value.dragSource);
    }
  }

  /**
   * TODO: Description here
   * @param target 
   * @returns 
   */
  function validateDrop(target: IDropTarget): IDropValidation {
    if (!target) {
      return { isValid: false, message: 'No target specified' };
    }

    if (!dragState.value.dragSource) {
      return { isValid: false, message: 'No source panel or area being dragged' };
    }

    if (dragState.value.dragSourceType !== getDragSourceType(dragState.value.dragSource)) {
      return { isValid: false, message: 'Drag source type does not match actual type' };
    }

    if (dragState.value.dropTarget.targetType === DropTargetType.IconToolbar) {
      if (!dragState.value.dropTarget.toolbarIndex) {
        return { isValid: false, message: 'No target toolbar item index provided' };
      }
      
      return { isValid: true };
    }

    else if (dragState.value.dropTarget.targetType === DropTargetType.Area) {
      // If areaId is not set but that root area already exists => invalid
      if (!target.areaId && currentLayout.value.areas[target.absolutePosition]) {
        return { isValid: false, message: 'No target area' };
      }
  
      // Validate split directions based on position
      if (target.relativePosition !== DockPosition.Center) {
        const isValidSplit = validateSplitDirection(target.absolutePosition, target.relativePosition);
  
        if (!isValidSplit) {
          return { isValid: false, message: 'Invalid split direction for this position' };
        }
      }
      
      const isContentPanel = getPanelTypeFromDragState(dragState.value) === PanelType.Content;
    
      // Content panels can only be dropped in center position
      if (isContentPanel && getPanelType(target.absolutePosition) !== PanelType.Content) {
        return { isValid: false, message: 'Content panels can only be dropped in center' };
      }
  
      // Side panels can't be dropped in center
      if (!isContentPanel && getPanelType(target.absolutePosition) === PanelType.Content) {
        return { isValid: false, message: 'Toolbars cannot be dropped in center' };
      }
  
      return { isValid: true };
    }
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
    leftToolbarItems,
    dragState,

    // Panel ops
    addPanel,
    movePanel,
    removePanel,

    // Area ops
    moveAreaHierarchy,

    // Toolbar
    addIconToolbarItem,
    removeIconToolbarItem,
    reorderIconToolbarItems,
    toggleIconToolbarItem,

    // Drag ops
    startDragging,
    stopDragging,
    updateDropTarget,
    handleDrop,
    validateDrop,

    // Layout ops
    saveLayout,
    loadLayout,

    // Utility
    findFirstPanelStackFollowingDirection,
    getFirstPanelInHierarchy
  };
});
