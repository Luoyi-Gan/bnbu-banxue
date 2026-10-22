export type AIKnowledgeCategory='guide'|'organization'|'activity'|'shop'|'partner'|'community'|'course'|'deadline'|'coffee'|'notification'|'sports'|'map'|'navigation'
export type AIKnowledgeSource={id:string;title:string;source:string;text:string;category?:AIKnowledgeCategory;updatedAt?:string}
export type AIKnowledgeCoverage={documents:number;chunks:number;selected:number;indexedAt:string;categories:Partial<Record<AIKnowledgeCategory,number>>;connections:{school:string;sports:string};partial:boolean;notes:string[]}
