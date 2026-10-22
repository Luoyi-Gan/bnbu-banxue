import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const raw=await readFile('public/campus-map/data/processed/campus-places.json','utf8'),value=JSON.parse(raw);
const entries=(value.places??value.features??[]).filter(p=>p.name&&!p.name.startsWith('未命名')).map(p=>({id:p.id,name:p.name,englishName:p.name_en??'',category:p.category??'',usage:[p.tags?.building,p.tags?.amenity,p.tags?.leisure,p.tags?.sport].filter(Boolean).join(' '),phase:p.phase??'',building:p.building_name??'',floor:p.floor??'',description:p.tags?.description??'',source:p.source_url??''}));
await writeFile('shared/v2/campusMapKnowledge.ts','// Generated from public campus map; rerun node scripts/build-ai-map-index.mjs after map changes.\nexport const campusMapKnowledgeVersion = '+JSON.stringify(createHash('sha256').update(raw).digest('hex'))+'\nexport const campusMapKnowledge = '+JSON.stringify(entries,null,2)+'\n');
console.log('Indexed public map entries:',entries.length);
