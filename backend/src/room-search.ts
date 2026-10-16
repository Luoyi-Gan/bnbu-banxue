import { demand, type Account } from './auth';
import type { Database } from './database';
import type { Fields } from './repository';
import type { PostgresDatabase } from './storage/postgres';
import { emptyPartnerFilters, filterPartnerRooms, type PartnerFilters, type PartnerRoom } from '../../shared/v2/partnerFilters';

type Row = { id: string; owner_id: string | null; data: string; created_at: string };
type ListedRoom = { room: PartnerRoom; createdAt: string };
const pageSize = 24;

function options(params: URLSearchParams) {
  const filters: PartnerFilters = { ...emptyPartnerFilters };
  const multiple = new Map<keyof PartnerFilters,string[]>();
  for (const key of Object.keys(filters) as (keyof PartnerFilters)[]) {
    const values = params.getAll(key);
    if (!values.length) continue;
    demand(values.length <= 10 && values.every(value=>value.length<=120), '筛选条件过长。');
    for (const value of values) validateFilter(key,value);
    if (values.length > 1) {
      multiple.set(key,[...new Set(values)]);
      filters[key] = (key === 'type' ? 'all' : '') as never;
    } else filters[key] = values[0] as never;
  }
  if (filters.gpaMin && filters.gpaMax) demand(Number(filters.gpaMin) <= Number(filters.gpaMax), '绩点区间无效。');
  let cursor: { createdAt: string; id: string } | null = null;
  const raw = params.get('cursor');
  if (raw) {
    demand(raw.length <= 250, '翻页标识无效。');
    try {
      const parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')) as {createdAt:unknown;id:unknown};
      demand(typeof parsed.createdAt === 'string' && Number.isFinite(Date.parse(parsed.createdAt)) && typeof parsed.id === 'string' && /^[a-zA-Z0-9-]{8,100}$/.test(parsed.id), '翻页标识无效。');
      cursor = { createdAt: parsed.createdAt, id: parsed.id };
    } catch { demand(false, '翻页标识无效。'); }
  }
  return { filters, multiple, cursor };
}

function validateFilter(key: keyof PartnerFilters, value: string) {
  const enums: Partial<Record<keyof PartnerFilters,string[]>> = {
    type:['all','study','entertainment','carpool','sport'],
    locationScope:['','campus','outside'],extraCost:['','yes','no'],genderPreference:['','any','male','female'],
  };
  if (enums[key]) demand(enums[key]!.includes(value), '筛选条件无效。');
  if ((key==='timeFrom' || key==='timeTo') && value) demand(Number.isFinite(Date.parse(value)), '时间筛选无效。');
  if ((key==='gpaMin' || key==='gpaMax') && value) demand(Number.isFinite(Number(value)) && Number(value)>=0, '绩点筛选无效。');
}

function roomMatches(room: PartnerRoom, filters: PartnerFilters, multiple: Map<keyof PartnerFilters,string[]>) {
  if (!filterPartnerRooms([room],filters).length) return false;
  for (const [key,values] of multiple) {
    if (!values.some(value=>filterPartnerRooms([room],{...emptyPartnerFilters,[key]:value}).length)) return false;
  }
  return true;
}

function project(row: Row, actor: Account): ListedRoom {
  const data = JSON.parse(row.data) as Fields;
  const members = Array.isArray(data.members) ? data.members.filter((id): id is string => typeof id === 'string') : [];
  const visibleMembers = row.owner_id === actor.id || members.includes(actor.id) ? members : [];
  return { createdAt: row.created_at, room: {
    id: row.id, owner: row.owner_id ?? '', type: data.type as PartnerRoom['type'],
    title: String(data.title ?? ''), body: String(data.body ?? ''), time: String(data.time ?? ''), place: String(data.place ?? ''),
    capacity: Number(data.capacity), memberCount: members.length, members: visibleMembers,
    status: data.status as PartnerRoom['status'], requests: [],
    details: data.details && typeof data.details === 'object' ? data.details as PartnerRoom['details'] : {},
  } };
}

function result(matches: ListedRoom[], limit = pageSize) {
  const shown = matches.slice(0, limit);
  const tail = shown.at(-1);
  return { items: shown.map(item => item.room), nextCursor: matches.length > limit && tail ? Buffer.from(JSON.stringify({createdAt:tail.createdAt,id:tail.room.id})).toString('base64url') : null };
}

export function searchRooms(db: Database, actor: Account, params: URLSearchParams) {
  const { filters, multiple, cursor } = options(params);
  let after = cursor, exhausted = false;
  const matches: ListedRoom[] = [];
  const sql = `SELECT id,owner_id,data,created_at FROM entities WHERE kind='room'
    AND json_extract(data,'$.visibility')='visible' AND json_extract(data,'$.status')='open'
    AND (? IS NULL OR created_at < ? OR (created_at = ? AND id < ?))
    ORDER BY created_at DESC,id DESC LIMIT 100`;
  while (matches.length <= pageSize && !exhausted) {
    const rows = db.prepare(sql).all(after?.createdAt ?? null,after?.createdAt ?? null,after?.createdAt ?? null,after?.id ?? null) as unknown as Row[];
    exhausted = rows.length < 100;
    for (const row of rows) {
      const item = project(row,actor);
      if (roomMatches(item.room,filters,multiple)) matches.push(item);
      if (matches.length > pageSize) break;
    }
    const last = rows.at(-1);
    if (last) after = {createdAt:last.created_at,id:last.id};
  }
  return result(matches);
}

export function roomDetail(db: Database, actor: Account, id: string) {
  const row = db.prepare("SELECT id,owner_id,data,created_at FROM entities WHERE id=? AND kind='room' AND json_extract(data,'$.visibility')='visible' AND json_extract(data,'$.status')='open'").get(id) as Row | undefined;
  demand(row, '队伍不存在或当前不可查看。', 404);
  return project(row,actor).room;
}

export async function searchPostgresRooms(db: PostgresDatabase, actor: Account, params: URLSearchParams) {
  const { filters, multiple, cursor } = options(params);
  let after = cursor, exhausted = false;
  const matches: ListedRoom[] = [];
  const sql = `SELECT id,owner_id,data,created_at FROM entities WHERE kind='room'
    AND data::jsonb->>'visibility'='visible' AND data::jsonb->>'status'='open'
    AND ($1::text IS NULL OR created_at < $1 OR (created_at = $1 AND id < $2))
    ORDER BY created_at DESC,id DESC LIMIT 100`;
  while (matches.length <= pageSize && !exhausted) {
    const rows = (await db.pool.query<Row>(sql,[after?.createdAt ?? null,after?.id ?? null])).rows;
    exhausted = rows.length < 100;
    for (const row of rows) {
      const item = project(row,actor);
      if (roomMatches(item.room,filters,multiple)) matches.push(item);
      if (matches.length > pageSize) break;
    }
    const last = rows.at(-1);
    if (last) after = {createdAt:last.created_at,id:last.id};
  }
  return result(matches);
}

export async function postgresRoomDetail(db: PostgresDatabase, actor: Account, id: string) {
  const {rows} = await db.pool.query<Row>("SELECT id,owner_id,data,created_at FROM entities WHERE id=$1 AND kind='room' AND data::jsonb->>'visibility'='visible' AND data::jsonb->>'status'='open'",[id]);
  demand(rows[0], '队伍不存在或当前不可查看。', 404);
  return project(rows[0],actor).room;
}
