import { defaultConversions } from '../sports/conversion-seed';
import type { PostgresDatabase } from './postgres';

/** Bootstrap only an empty rule set; imported or edited rules remain authoritative. */
export async function seedPostgresConversions(db:PostgresDatabase) {
  await db.transaction(async client=>{
    await client.query('SELECT pg_advisory_xact_lock(18422,2)');
    if((await client.query("SELECT 1 FROM entities WHERE id='bootstrap-conversions-v81' OR kind='sportsConversionTable' LIMIT 1")).rows.length) return;
    const now=new Date().toISOString();
    for(const table of defaultConversions()) await client.query("INSERT INTO entities(id,kind,owner_id,data,created_at,updated_at) VALUES($1,'sportsConversionTable',NULL,$2,$3,$3)",['conversion-'+table.key,JSON.stringify(table),now]);
    await client.query("INSERT INTO entities(id,kind,owner_id,data,created_at,updated_at) VALUES('bootstrap-conversions-v81','backendSeed',NULL,$1,$2,$2)",[JSON.stringify({source:'V8.1_CONFIRMED_DEFAULTS'}),now]);
  });
}
