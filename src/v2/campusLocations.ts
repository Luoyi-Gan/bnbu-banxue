export type CampusBuilding = { id: string; name: string }

const teaching: Record<string, string> = {
  T1: 'way/664082910', T2: 'way/664082908', T3: 'way/664082909',
  T4: 'way/664093256', T5: 'way/664093257', T6: 'way/664093258',
  T7: 'way/664093260', T8: 'way/664093261', T29: 'way/664093294',
}

// Match only identifiable buildings. Generic outdoor names have no verified pin.
export function resolveCampusLocation(location: string): string | null {
  const code = location.toUpperCase().match(/\bT(29|[1-8])(?=$|[-\s\u4e00-\u9fff])/)
  if (code) return teaching[`T${code[1]}`]
  if (/sports? cent(?:er|re)|体育馆|体育中心/i.test(location)) return 'way/664082915'
  if (/library|图书馆/i.test(location)) return 'way/1215983507'
  if (/大学会堂|university hall/i.test(location)) return 'way/664082913'
  if (/演艺厅|performing arts/i.test(location)) return 'way/664082911'
  if (/东大门|east gate/i.test(location)) return 'way/1459105110'
  return null
}
