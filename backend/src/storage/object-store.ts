import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, link, unlink, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';

export interface ObjectStore {
  put(bytes:Buffer,contentType:string):Promise<string>;
  get(key:string):Promise<Buffer>;
}
export const objectKey=(bytes:Buffer)=>createHash('sha256').update(bytes).digest('hex');
export function validateObjectKey(key:string) {
  if(!/^[a-f0-9]{64}$/.test(key)) throw new Error('Invalid object key');
  return key;
}

/** Content-addressed private storage. Access control belongs to the API, never the filename. */
export class LocalObjectStore implements ObjectStore {
  private readonly root:string;
  constructor(directory:string) { this.root=resolve(directory); }
  async put(bytes:Buffer,contentType:string) {
    if(!contentType) throw new Error('Content type is required');
    const key=objectKey(bytes),path=join(this.root,key);
    await mkdir(this.root,{recursive:true});
    const temporary=join(this.root,`${key}.${randomUUID()}.tmp`);
    await writeFile(temporary,bytes,{flag:'wx',mode:0o600});
    try {
      try { await link(temporary,path); }
      catch(error) {
        if((error as NodeJS.ErrnoException).code!=='EEXIST') throw error;
        await this.get(key);
      }
    }
    finally { await unlink(temporary).catch(error=>{if(error.code!=='ENOENT') throw error;}); }
    return key;
  }
  async get(key:string) {
    const bytes=await readFile(join(this.root,validateObjectKey(key)));
    if(objectKey(bytes)!==key) throw new Error('Stored object checksum mismatch');
    return bytes;
  }
}
