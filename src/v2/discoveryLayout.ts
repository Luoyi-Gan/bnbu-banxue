export function coverRatio(id: string) {
  return [0.8, 1, 1.25, 0.75][Array.from(id).reduce((sum, char) => sum + char.charCodeAt(0), 0) % 4]
}

// A fixed estimate reserves cover space and keeps earlier items in place when appending.
export function discoveryColumns<T extends { id: string }>(items: T[], count: number, width: number): T[][] {
  const columns: T[][] = Array.from({ length: count }, () => [])
  const heights = Array<number>(count).fill(0)
  for (const item of items) {
    const index = heights.indexOf(Math.min(...heights))
    columns[index].push(item)
    heights[index] += width / coverRatio(item.id) + 140
  }
  return columns
}
