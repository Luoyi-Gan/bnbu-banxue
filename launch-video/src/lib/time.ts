import { useCurrentFrame } from 'remotion';

// The film is authored on a 1200-frame story timeline (src/timeline.ts) and played back
// STRETCH times slower; the score's tempo is divided by the same factor so every beat still lines up.
export const STRETCH = 1.4;
export const toOut = (storyFrame: number) => Math.round(storyFrame * STRETCH);
export const useFilmFrame = () => useCurrentFrame() / STRETCH;
