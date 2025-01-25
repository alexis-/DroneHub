import { XmlElem, XmlChildElem } from 'xml-class-transformer';

const KML_Namespace = 'http://www.opengis.net/kml/2.2';
const WPMZ_Namespace = 'http://www.dji.com/wpmz/1.0.6';

const KML_Prefix = '';
const WPMZ_Prefix = 'wpml:';

// @XmlElem({ name: `${KML_Prefix}kml` })
@XmlElem({ name: 'kml' })
export class WpmlRoot {
  @XmlChildElem({ type: () => WpmlDocument, name: `${KML_Prefix}Document` })
  document?: WpmlDocument;

  constructor(data?: Partial<WpmlRoot>) {
    Object.assign(this, data || {});
  }
}

@XmlElem({ name: `${KML_Prefix}Document` })
export class WpmlDocument {
  @XmlChildElem({ type: () => WpmlMissionConfig, name: `${WPMZ_Prefix}missionConfig` })
  missionConfig?: WpmlMissionConfig;

  @XmlChildElem({ type: () => WpmlFolder, name: `${KML_Prefix}Folder` })
  folder?: WpmlFolder;

  constructor(data?: Partial<WpmlDocument>) {
    Object.assign(this, data || {});
  }
}

@XmlElem({ name: `${WPMZ_Prefix}missionConfig` })
export class WpmlMissionConfig {
  @XmlChildElem({ type: () => String, name: `${WPMZ_Prefix}flyToWaylineMode` })
  flyToWaylineMode?: string;

  @XmlChildElem({ type: () => String, name: `${WPMZ_Prefix}finishAction` })
  finishAction?: string;

  @XmlChildElem({ type: () => String, name: `${WPMZ_Prefix}exitOnRCLost` })
  exitOnRCLost?: string;

  @XmlChildElem({ type: () => String, name: `${WPMZ_Prefix}executeRCLostAction` })
  executeRCLostAction?: string;

  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}takeOffSecurityHeight` })
  takeOffSecurityHeight?: number;

  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}globalTransitionalSpeed` })
  globalTransitionalSpeed?: number;

  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}globalRTHHeight` })
  globalRTHHeight?: number;

  @XmlChildElem({ type: () => MissionConfigDroneInfo, name: `${WPMZ_Prefix}droneInfo` })
  droneInfo?: MissionConfigDroneInfo;

  @XmlChildElem({ type: () => MissionConfigPayloadInfo, name: `${WPMZ_Prefix}payloadInfo` })
  payloadInfo?: MissionConfigPayloadInfo;

  constructor(data?: Partial<WpmlMissionConfig>) {
    Object.assign(this, data || {});
  }
}

@XmlElem({ name: `${WPMZ_Prefix}droneInfo` })
export class MissionConfigDroneInfo {
  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}droneEnumValue` })
  droneEnumValue?: number;

  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}droneSubEnumValue` })
  droneSubEnumValue?: number;

  constructor(data?: Partial<MissionConfigDroneInfo>) {
    Object.assign(this, data || {});
  }
}

@XmlElem({ name: `${WPMZ_Prefix}payloadInfo` })
export class MissionConfigPayloadInfo {
  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}payloadEnumValue` })
  payloadEnumValue?: number;

  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}payloadSubEnumValue` })
  payloadSubEnumValue?: number;

  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}payloadPositionIndex` })
  payloadPositionIndex?: number;

  constructor(data?: Partial<MissionConfigPayloadInfo>) {
    Object.assign(this, data || {});
  }
}

@XmlElem({ name: `${KML_Prefix}Folder` })
export class WpmlFolder {
  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}templateId` })
  templateId?: number;

  @XmlChildElem({ type: () => String, name: `${WPMZ_Prefix}executeHeightMode` })
  executeHeightMode?: string;

  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}waylineId` })
  waylineId?: number;

  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}distance` })
  distance?: number;

  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}duration` })
  duration?: number;

  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}autoFlightSpeed` })
  autoFlightSpeed?: number;

  @XmlChildElem({ type: () => StartActionGroup, name: `${WPMZ_Prefix}startActionGroup` })
  startActionGroup?: StartActionGroup;

  @XmlChildElem({ type: () => Placemark, name: `${KML_Prefix}Placemark`, array: true })
  placemarks?: Placemark[];

  constructor(data?: Partial<WpmlFolder>) {
    Object.assign(this, data || {});
  }
}

@XmlElem({ name: `${WPMZ_Prefix}startActionGroup` })
export class StartActionGroup {
  @XmlChildElem({ type: () => ActionGroupAction, name: `${WPMZ_Prefix}action`, array: true })
  actions?: ActionGroupAction[];

  constructor(data?: Partial<StartActionGroup>) {
    Object.assign(this, data || {});
  }
}

@XmlElem({ name: `${KML_Prefix}Placemark` })
export class Placemark {
  private _coordinate?: Coordinate;

  @XmlChildElem({ type: () => PlacemarkPoint, name: `${KML_Prefix}Point` })
  point?: PlacemarkPoint;

  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}index` })
  index?: number;

  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}executeHeight` })
  executeHeight?: number;

  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}waypointSpeed` })
  waypointSpeed?: number;

  @XmlChildElem({ type: () => WaypointHeadingParam, name: `${WPMZ_Prefix}waypointHeadingParam` })
  waypointHeadingParam?: WaypointHeadingParam;

  @XmlChildElem({ type: () => WaypointTurnParam, name: `${WPMZ_Prefix}waypointTurnParam` })
  waypointTurnParam?: WaypointTurnParam;

  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}useStraightLine` })
  useStraightLine?: number;

  @XmlChildElem({ type: () => ActionGroup, name: `${WPMZ_Prefix}actionGroup`, array: true })
  actionGroups?: ActionGroup[];

  @XmlChildElem({ type: () => WaypointGimbalHeadingParam, name: `${WPMZ_Prefix}waypointGimbalHeadingParam` })
  waypointGimbalHeadingParam?: WaypointGimbalHeadingParam;

  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}isRisky` })
  isRisky?: number;

  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}waypointWorkType` })
  waypointWorkType?: number;

  constructor(data?: Partial<Placemark>) {
    Object.assign(this, data || {});
  }

  get coordinate(): Coordinate | undefined {
    if (this._coordinate) return this._coordinate;
    if (!this.point?.coordinates || !this.executeHeight) return undefined;

    const match = /\s*(\d+(\.\d+)?),\s*(\d+(\.\d+)?)\s*/.exec(this.point.coordinates);
    if (!match) return undefined;

    this._coordinate = {
      latitude: parseFloat(match[3]),
      longitude: parseFloat(match[1]),
      altitude: this.executeHeight
    };

    return this._coordinate;
  }
}

@XmlElem({ name: `${KML_Prefix}Point` })
export class PlacemarkPoint {
  @XmlChildElem({ type: () => String, name: `${KML_Prefix}coordinates` })
  coordinates?: string;

  constructor(data?: Partial<PlacemarkPoint>) {
    Object.assign(this, data || {});
  }
}

@XmlElem({ name: `${WPMZ_Prefix}waypointHeadingParam` })
export class WaypointHeadingParam {
  @XmlChildElem({ type: () => String, name: `${WPMZ_Prefix}waypointHeadingMode` })
  waypointHeadingMode?: string;

  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}waypointHeadingAngle` })
  waypointHeadingAngle?: number;

  @XmlChildElem({ type: () => String, name: `${WPMZ_Prefix}waypointPoiPoint` })
  waypointPoiPoint?: string;

  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}waypointHeadingAngleEnable` })
  waypointHeadingAngleEnable?: number;

  @XmlChildElem({ type: () => String, name: `${WPMZ_Prefix}waypointHeadingPathMode` })
  waypointHeadingPathMode?: string;

  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}waypointHeadingPoiIndex` })
  waypointHeadingPoiIndex?: number;

  constructor(data?: Partial<WaypointHeadingParam>) {
    Object.assign(this, data || {});
  }
}

@XmlElem({ name: `${WPMZ_Prefix}waypointTurnParam` })
export class WaypointTurnParam {
  @XmlChildElem({ type: () => String, name: `${WPMZ_Prefix}waypointTurnMode` })
  waypointTurnMode?: string;

  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}waypointTurnDampingDist` })
  waypointTurnDampingDist?: number;

  constructor(data?: Partial<WaypointTurnParam>) {
    Object.assign(this, data || {});
  }
}

@XmlElem({ name: `${WPMZ_Prefix}actionGroup` })
export class ActionGroup {
  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}actionGroupId` })
  actionGroupId?: number;

  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}actionGroupStartIndex` })
  actionGroupStartIndex?: number;

  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}actionGroupEndIndex` })
  actionGroupEndIndex?: number;

  @XmlChildElem({ type: () => String, name: `${WPMZ_Prefix}actionGroupMode` })
  actionGroupMode?: string;

  @XmlChildElem({ type: () => ActionGroupActionTrigger, name: `${WPMZ_Prefix}actionTrigger` })
  actionTrigger?: ActionGroupActionTrigger;

  @XmlChildElem({ type: () => ActionGroupAction, name: `${WPMZ_Prefix}action`, array: true })
  actions?: ActionGroupAction[];

  constructor(data?: Partial<ActionGroup>) {
    Object.assign(this, data || {});
  }
}

@XmlElem({ name: `${WPMZ_Prefix}actionTrigger` })
export class ActionGroupActionTrigger {
  @XmlChildElem({ type: () => String, name: `${WPMZ_Prefix}actionTriggerType` })
  actionTriggerType?: string;

  constructor(data?: Partial<ActionGroupActionTrigger>) {
    Object.assign(this, data || {});
  }
}

@XmlElem({ name: `${WPMZ_Prefix}action` })
export class ActionGroupAction {
  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}actionId` })
  actionId?: number;

  @XmlChildElem({ type: () => String, name: `${WPMZ_Prefix}actionActuatorFunc` })
  actionActuatorFunc?: string;

  @XmlChildElem({ type: () => ActionGroupActionActionActuatorFuncParam, name: `${WPMZ_Prefix}actionActuatorFuncParam` })
  actionActuatorFuncParam?: ActionGroupActionActionActuatorFuncParam;

  constructor(data?: Partial<ActionGroupAction>) {
    Object.assign(this, data || {});
  }
}

@XmlElem({ name: `${WPMZ_Prefix}actionActuatorFuncParam` })
export class ActionGroupActionActionActuatorFuncParam {
  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}focusX` })
  focusX?: number;

  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}focusY` })
  focusY?: number;

  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}focusRegionWidth` })
  focusRegionWidth?: number;

  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}focusRegionHeight` })
  focusRegionHeight?: number;

  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}isPointFocus` })
  isPointFocus?: number;

  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}isInfiniteFocus` })
  isInfiniteFocus?: number;

  @XmlChildElem({ type: () => String, name: `${WPMZ_Prefix}cameraFocusType` })
  cameraFocusType?: string;

  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}hoverTime` })
  hoverTime?: number;

  @XmlChildElem({ type: () => String, name: `${WPMZ_Prefix}gimbalHeadingYawBase` })
  gimbalHeadingYawBase?: string;

  @XmlChildElem({ type: () => String, name: `${WPMZ_Prefix}gimbalRotateMode` })
  gimbalRotateMode?: string;

  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}gimbalPitchRotateEnable` })
  gimbalPitchRotateEnable?: number;

  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}gimbalPitchRotateAngle` })
  gimbalPitchRotateAngle?: number;

  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}gimbalRollRotateEnable` })
  gimbalRollRotateEnable?: number;

  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}gimbalRollRotateAngle` })
  gimbalRollRotateAngle?: number;

  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}gimbalYawRotateEnable` })
  gimbalYawRotateEnable?: number;

  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}gimbalYawRotateAngle` })
  gimbalYawRotateAngle?: number;

  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}gimbalRotateTimeEnable` })
  gimbalRotateTimeEnable?: number;

  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}gimbalRotateTime` })
  gimbalRotateTime?: number;

  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}payloadPositionIndex` })
  payloadPositionIndex?: number;

  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}useGlobalPayloadLensIndex` })
  useGlobalPayloadLensIndex?: number;

  @XmlChildElem({ type: () => String, name: `${WPMZ_Prefix}payloadLensIndex` })
  payloadLensIndex?: string;

  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}minShootInterval` })
  minShootInterval?: number;

  constructor(data?: Partial<ActionGroupActionActionActuatorFuncParam>) {
    Object.assign(this, data || {});
  }
}

@XmlElem({ name: `${WPMZ_Prefix}waypointGimbalHeadingParam` })
export class WaypointGimbalHeadingParam {
  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}waypointGimbalPitchAngle` })
  waypointGimbalPitchAngle?: number;

  @XmlChildElem({ type: () => Number, name: `${WPMZ_Prefix}waypointGimbalYawAngle` })
  waypointGimbalYawAngle?: number;

  constructor(data?: Partial<WaypointGimbalHeadingParam>) {
    Object.assign(this, data || {});
  }
}

export interface Coordinate {
  latitude: number;
  longitude: number;
  altitude: number;
}
