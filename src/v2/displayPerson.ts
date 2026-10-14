import type {Workspace} from '../live/api'

export function displayPerson(workspace: Workspace | null, id: string | null | undefined, fallback = '用户') {
  const person = workspace?.people.find(item => item.id === id)
  return {name: person?.nickname || person?.name || fallback, avatar: person?.avatar || ''}
}
