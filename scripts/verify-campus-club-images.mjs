import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const {images}=JSON.parse(readFileSync(new URL('../data/campus-club-images.json',import.meta.url),'utf8'));
const names=new Set();
for(const item of images){
 if(names.has(item.name))throw Error('Repeated club: '+item.name);names.add(item.name);
 if(!/^\/clubs\/[a-f0-9]{16}\.(jpg|png|webp)$/.test(item.image))throw Error('Invalid asset path: '+item.image);
 for(const value of [item.imageSource.pageUrl,item.imageSource.url]){const u=new URL(value);if(u.protocol!=='https:'||!(u.hostname==='bnbu.edu.cn'||u.hostname.endsWith('.bnbu.edu.cn')))throw Error('Unverified source host: '+value);}
 const bytes=readFileSync(new URL('../public'+item.image,import.meta.url));
 if(createHash('sha256').update(bytes).digest('hex')!==item.imageSource.sha256)throw Error('Image changed: '+item.name);
 if(bytes.length!==item.imageSource.bytes||bytes.length<1000)throw Error('Invalid image bytes: '+item.name);
}
console.log(JSON.stringify({verifiedImages:images.length,source:'BNBU public reports',missingCovers:57-images.length}));
