import mitt from 'mitt';
import type { IProject } from '@shared/database/entities/IProject';
import type { IRoute } from '@shared/database/entities/IRoute';

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