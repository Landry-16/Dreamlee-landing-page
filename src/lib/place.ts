/**
 * Style of an object placed on a section's 1440-unit canvas (wide screens):
 * position, width and rotation, as in the Figma frame.
 */
export function place(x: number, y: number, width: number, rotation = 0): string {
  return `--x:${x};--y:${y};--w:${width};--r:${rotation}`;
}
