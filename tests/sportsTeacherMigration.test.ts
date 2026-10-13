import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { expect, it } from 'vitest'
import manifest from '../docs/SPORTS_TEACHER_SOURCE.json'

it('preserves every original sports portal source and asset byte for byte', () => {
  for (const file of manifest.files) {
    const content = readFileSync(new URL(`../integrations/sports-teacher/${file.path}`, import.meta.url))
    expect(createHash('sha256').update(content).digest('hex').toUpperCase(), file.path).toBe(file.sha256)
  }
})
