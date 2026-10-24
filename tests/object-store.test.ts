import { describe,it,expect,vi } from 'vitest';
import { mkdtemp,rm,writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { LocalObjectStore } from '../backend/src/storage/object-store';
import { CosObjectStore, configuredObjectStore } from '../backend/src/storage/cos-object-store';
import type COS from 'cos-nodejs-sdk-v5';

describe('private local object storage',()=>{
  it('uses private COS objects, validates downloads and propagates upload failures',async()=>{
    const bytes=Buffer.from([0,255,1]),putObject=vi.fn().mockResolvedValue({}),getObject=vi.fn().mockResolvedValue({Body:bytes}),deleteObject=vi.fn().mockResolvedValue({});
    const client={putObject,getObject,deleteObject} as unknown as Pick<COS,'putObject'|'getObject'|'deleteObject'>;
    const store=new CosObjectStore(client,'test-123','ap-guangzhou');
    const key=await store.put(bytes,'image/png');
    expect(putObject).toHaveBeenCalledWith({Bucket:'test-123',Region:'ap-guangzhou',Key:`bnbu/${key}`,Body:bytes,ContentType:'image/png',ACL:'private'});
    expect(await store.get(key)).toEqual(bytes);
    await store.delete(key);
    expect(deleteObject).toHaveBeenCalledWith({Bucket:'test-123',Region:'ap-guangzhou',Key:`bnbu/${key}`});
    await expect(store.delete('../other')).rejects.toThrow('Invalid object key');
    getObject.mockResolvedValueOnce({Body:Buffer.from('wrong')});
    await expect(store.get(key)).rejects.toThrow('checksum mismatch');
    putObject.mockRejectedValueOnce(new Error('unavailable'));
    await expect(store.put(bytes,'image/png')).rejects.toThrow('unavailable');
    await expect(store.get('../other')).rejects.toThrow('Invalid object key');
  });
  it('does not silently fall back to local storage when COS is incomplete',()=>{
    vi.stubEnv('BNBU_OBJECT_STORE','cos');vi.stubEnv('BNBU_COS_BUCKET','');
    try { expect(()=>configuredObjectStore()).toThrow('COS configuration is incomplete'); }
    finally { vi.unstubAllEnvs(); }
  });
  it('persists binary objects across instances and rejects traversal or corruption',async()=>{
    const root=await mkdtemp(join(tmpdir(),'bnbu-objects-'));
    try {
      const store=new LocalObjectStore(root),bytes=Buffer.from([0,255,128,10]);
      const keys=await Promise.all([store.put(bytes,'image/png'),store.put(bytes,'image/png')]);
      expect(keys[0]).toBe(keys[1]);
      expect(await new LocalObjectStore(root).get(keys[0])).toEqual(bytes);
      await expect(store.get('../outside')).rejects.toThrow('Invalid object key');
      await writeFile(join(root,keys[0]),'corrupted');
      await expect(store.get(keys[0])).rejects.toThrow('checksum mismatch');
      await store.delete(keys[0]);
      await store.delete(keys[0]);
      await expect(store.get(keys[0])).rejects.toThrow();
    } finally { await rm(root,{recursive:true,force:true}); }
  });
});
