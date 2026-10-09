import { describe, expect, it } from 'vitest'
import { initialV2State, studentName } from './model'
import { updateStudentProfile } from './profilePolicy'

describe('student display profile', () => {
  it('changes display data without changing ownership or certification', () => {
    const next = updateStudentProfile(initialV2State, '  小晴  ', 'data:image/webp;base64,test')
    expect(next.profile?.nickname).toBe('小晴')
    expect(next.rooms).toBe(initialV2State.rooms)
    expect(next.verifications).toBe(initialV2State.verifications)
    expect(next.rooms.some(room => room.owner === studentName)).toBe(true)
    expect(initialV2State.profile).toBeUndefined()
    expect(JSON.parse(JSON.stringify(next)).profile).toEqual(next.profile)
  })
  it('rejects empty and overly long nicknames', () => {
    for (const name of ['   ', 'a'.repeat(21)]) expect(() => updateStudentProfile(initialV2State, name, '')).toThrow()
  })
})
