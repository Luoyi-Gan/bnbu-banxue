import {expect,it} from 'vitest';
import {SportsSourceReader} from '../backend/src/storage/sports-source-reader';

it.skipIf(!process.env.BNBU_TEST_POSTGRES_URL)('enforces a read-only transaction on the external sports connection',async()=>{
  const reader=new SportsSourceReader({connectionString:process.env.BNBU_TEST_POSTGRES_URL});
  try {
    expect(await reader.select("SELECT current_setting('transaction_read_only') AS mode, $1::text AS value",['fixture'])).toEqual([{mode:'on',value:'fixture'}]);
    await expect(reader.select('DELETE FROM accounts')).rejects.toThrow('one SELECT');
    await expect(reader.select('SELECT 1; DELETE FROM accounts')).rejects.toThrow('one SELECT');
    // A SELECT that calls a PostgreSQL write function must also fail at the DB boundary.
    await expect(reader.select("SELECT lo_create(0)")).rejects.toMatchObject({code:'25006'});
    expect(await reader.select('SELECT 1 AS value')).toEqual([{value:1}]);
  } finally {await reader.close();}
});
