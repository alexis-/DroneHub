import mitt from 'mitt';
import type { IProject } from '@dhlib/models/core/interfaces/IProject';
import type { IRoute } from '@dhlib/models/core/interfaces/missions/IRoute';

type Events = {
  'project:selected': IProject;
  'project:created': IProject;
  'project:deleted': IProject;
  'route:selected': IRoute;
  'panel:collapsed': boolean;
  // Add other events as needed
}

const emitter = mitt<Events>();

export function useEventBus() {
  return {
    emit: emitter.emit,
    on: emitter.on,
    off: emitter.off
  };
}