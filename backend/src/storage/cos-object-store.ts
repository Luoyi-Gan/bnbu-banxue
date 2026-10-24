import COS from 'cos-nodejs-sdk-v5';
import { LocalObjectStore, objectKey, validateObjectKey, type ObjectStore } from './object-store';

export class CosObjectStore implements ObjectStore {
  constructor(private readonly client:Pick<COS,'putObject'|'getObject'|'deleteObject'>,private readonly bucket:string,private readonly region:string) {}
  async put(bytes:Buffer,contentType:string) {
    const key=objectKey(bytes);
    await this.client.putObject({Bucket:this.bucket,Region:this.region,Key:`bnbu/${key}`,Body:bytes,ContentType:contentType,ACL:'private'});
    return key;
  }
  async delete(key:string) {
    await this.client.deleteObject({Bucket:this.bucket,Region:this.region,Key:`bnbu/${validateObjectKey(key)}`});
  }
  async get(key:string) {
    const response=await this.client.getObject({Bucket:this.bucket,Region:this.region,Key:`bnbu/${validateObjectKey(key)}`});
    if(!Buffer.isBuffer(response.Body) || objectKey(response.Body)!==key) throw new Error('Stored object checksum mismatch');
    return response.Body;
  }
}

export function configuredObjectStore():ObjectStore {
  const provider=process.env.BNBU_OBJECT_STORE ?? 'local';
  if(provider==='local') return new LocalObjectStore(process.env.BNBU_OBJECT_DIRECTORY ?? './data/objects');
  if(provider!=='cos') throw new Error('Unsupported BNBU_OBJECT_STORE');
  const bucket=process.env.BNBU_COS_BUCKET,region=process.env.BNBU_COS_REGION,secretId=process.env.BNBU_COS_SECRET_ID,secretKey=process.env.BNBU_COS_SECRET_KEY;
  if(!bucket || !region || !secretId || !secretKey) throw new Error('COS configuration is incomplete');
  return new CosObjectStore(new COS({SecretId:secretId,SecretKey:secretKey,SecurityToken:process.env.BNBU_COS_SESSION_TOKEN,Timeout:15000}),bucket,region);
}
