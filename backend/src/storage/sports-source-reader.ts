import { Pool, type PoolConfig, type QueryResultRow } from 'pg';

/** External sports data source only. Never pass this configuration to migrations. */
export class SportsSourceReader {
  private readonly pool:Pool;
  constructor(config:PoolConfig) {
    this.pool=new Pool({...config,max:3,connectionTimeoutMillis:10000,idleTimeoutMillis:30000,
      options:'-c default_transaction_read_only=on -c statement_timeout=10000 -c idle_in_transaction_session_timeout=15000'});
    this.pool.on('error',()=>console.error('Sports source read connection failed'));
  }
  /** Only server-owned SELECT statements, never expose SQL to HTTP callers. */
  async select<T extends QueryResultRow>(sql:string,values:unknown[]=[]):Promise<T[]> {
    if(!/^\s*SELECT\b/i.test(sql) || sql.includes(';'))throw new Error('Sports source accepts one SELECT statement only');
    const client=await this.pool.connect();let broken=false;
    try {
      await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
      const result=await client.query<T>(sql,values);
      await client.query('COMMIT');return result.rows;
    } catch(error) {
      try{await client.query('ROLLBACK');}catch{broken=true;}
      throw error;
    } finally {client.release(broken);}
  }
  async close(){await this.pool.end();}
}
