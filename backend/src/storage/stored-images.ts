import { configuredObjectStore } from './cos-object-store';
import type { ObjectStore } from './object-store';
import { demand } from '../auth';

const marker='$bnbuStoredImage';
/** Internal references never cross the API boundary; clients keep the existing data URL contract. */
export async function storeImages(value:unknown,store:ObjectStore=configuredObjectStore()):Promise<unknown> {
  if(typeof value==='string') {
    const match=/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=\s]+)$/.exec(value);
    if(!match) return value;
    const bytes=Buffer.from(match[2],'base64');
    return {[marker]:await store.put(bytes,match[1]),contentType:match[1]};
  }
  if(Array.isArray(value)) return Promise.all(value.map(v=>storeImages(v,store)));
  if(value && typeof value==='object') {
    demand(!Object.hasOwn(value,marker),'请求包含内部存储标识。');
    return Object.fromEntries(await Promise.all(Object.entries(value).map(async([k,v])=>[k,await storeImages(v,store)])));
  }
  return value;
}
export async function restoreImages(value:unknown,store:ObjectStore=configuredObjectStore()):Promise<unknown> {
  if(Array.isArray(value)) return Promise.all(value.map(v=>restoreImages(v,store)));
  if(value && typeof value==='object') {
    const object=value as Record<string,unknown>;
    if(Object.hasOwn(object,marker)) {
      demand(typeof object[marker]==='string' && /^image\/(png|jpeg|webp)$/.test(String(object.contentType)),'图片存储记录无效。',500);
      return `data:${object.contentType};base64,${(await store.get(object[marker])).toString('base64')}`;
    }
    return Object.fromEntries(await Promise.all(Object.entries(object).map(async([k,v])=>[k,await restoreImages(v,store)])));
  }
  return value;
}
