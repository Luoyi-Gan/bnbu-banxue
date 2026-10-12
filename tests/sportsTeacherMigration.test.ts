import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { expect, it } from 'vitest'
import manifest from '../docs/SPORTS_TEACHER_SOURCE.json'
import adaptations from '../docs/SPORTS_TEACHER_ADAPTATIONS.json'

it('preserves original portal sources and assets except explicitly recorded transport adaptations', () => {
  expect(adaptations.files.map(file => file.path).sort()).toEqual(['app/api-client.ts', 'app/portal-app.tsx'])
  for (const file of manifest.files) {
    const adaptation = adaptations.files.find(item => item.path === file.path)
    if (adaptation) expect(adaptation.originalSha256).toBe(file.sha256)
    const content = readFileSync(new URL(`../integrations/sports-teacher/${file.path}`, import.meta.url))
    expect(createHash('sha256').update(content).digest('hex').toUpperCase(), file.path).toBe(adaptation?.sha256 ?? file.sha256)
  }
})
