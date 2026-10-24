import type {Entity} from './repository';

export const socialBlocked = (edges: Entity[], a: string, b: string | null) => edges.some(e =>
  e.data.kind === 'block' && e.data.enabled === true &&
  (e.ownerId === a && e.data.targetId === b || e.ownerId === b && e.data.targetId === a));

export const chatMessageVisible = (message: Entity, viewer: string, edges: Entity[]) =>
  message.data.status !== 'hidden' && (message.ownerId === viewer || !socialBlocked(edges, viewer, message.ownerId));
