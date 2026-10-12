import { describe,it,expect } from 'vitest';
import { mkdtemp,rm,writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { LocalObjectStore } from '../backend/src/storage/object-store';

describe('private local object storage',()=>{
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
    } finally { await rm(root,{recursive:true,force:true}); }
  });
});
