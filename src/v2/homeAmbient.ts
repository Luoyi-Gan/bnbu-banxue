export function homeAmbient(hour:number):'morning'|'day'|'evening'|'night'{
 if(!Number.isFinite(hour)||hour<0||hour>=24)return 'day'
 return hour<6?'night':hour<11?'morning':hour<17?'day':hour<20?'evening':'night'
}
