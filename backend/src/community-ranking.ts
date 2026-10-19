export type CommunityCandidate={alumniId?:string;id:string;ownerId:string|null;title:string;body:string;board:string;author:string;createdAt:string;status:string};
export type CommunityMetrics={views:ReadonlyMap<string,number>;likes:ReadonlyMap<string,number>;comments:ReadonlyMap<string,number>};
export type CommunitySignals={board:ReadonlyMap<string,number>;viewed:ReadonlySet<string>};

const normal=(value:string)=>value.normalize('NFKC').toLocaleLowerCase('zh-CN');
export function recommendationScore(post:CommunityCandidate,signals:CommunitySignals,metrics:CommunityMetrics,now=Date.now()) {
  const ageDays=Math.max(0,(now-Date.parse(post.createdAt))/86_400_000);
  const fresh=14*Math.exp(-ageDays/7);
  const affinity=Math.min(40,(signals.board.get(post.board)??0)*4);
  const activity=Math.min(10,(metrics.views.get(post.id)??0)*0.2)+Math.min(20,(metrics.likes.get(post.id)??0)*2)+Math.min(24,(metrics.comments.get(post.id)??0)*3);
  return fresh+affinity+activity-(signals.viewed.has(post.id)?2:0);
}
export function searchRelevance(post:CommunityCandidate,query:string) {
  const words=normal(query).trim().split(/\s+/).filter(Boolean).slice(0,8);
  if(!words.length) return 0;
  const title=normal(post.title),body=normal(post.body),board=normal(post.board),author=normal(post.author);
  let score=0;
  for(const word of words) {
    if(title.includes(word)) score+=title===word?12:8;
    else if(board.includes(word)) score+=6;
    else if(author.includes(word)) score+=4;
    else if(body.includes(word)) score+=2;
    else return -1;
  }
  return score;
}
export function rankCommunity(candidates:CommunityCandidate[],options:{board?:string;query?:string;sort?:'recommended'|'newest'},signals:CommunitySignals,metrics:CommunityMetrics,now=Date.now()) {
  const query=(options.query??'').trim();
  return candidates.filter(item=>(!options.board||options.board==='全部'||item.board===options.board) && (item.status==='visible'||item.status==='pending'))
    .map(item=>({item,relevance:searchRelevance(item,query),recommendation:recommendationScore(item,signals,metrics,now)}))
    .filter(row=>row.relevance>=0)
    .sort((a,b)=> query ? b.relevance-a.relevance || b.recommendation-a.recommendation || b.item.createdAt.localeCompare(a.item.createdAt) || a.item.id.localeCompare(b.item.id)
      : options.sort==='newest' ? b.item.createdAt.localeCompare(a.item.createdAt) || a.item.id.localeCompare(b.item.id)
      : b.recommendation-a.recommendation || b.item.createdAt.localeCompare(a.item.createdAt) || a.item.id.localeCompare(b.item.id))
    .map(row=>row.item);
}
export function rankHotSummaries(candidates:CommunityCandidate[],metrics:CommunityMetrics) {
  const publicPosts=candidates.filter(item=>item.status==='visible');
  const eligiblePostCount=publicPosts.length,byBoard:Record<string,string[]>={};
  if(eligiblePostCount<=75) return {eligiblePostCount,overall:[],byBoard};
  const ranked=publicPosts.map(item=>{
    const views=metrics.views.get(item.id)??0,likes=metrics.likes.get(item.id)??0,comments=metrics.comments.get(item.id)??0;
    return {...item,views,likes,comments,score:views+5*likes+10*comments};
  }).filter(item=>item.score>0).sort((a,b)=>b.score-a.score||b.comments-a.comments||b.likes-a.likes||b.views-a.views||b.createdAt.localeCompare(a.createdAt)||a.id.localeCompare(b.id));
  for(const item of ranked) {const bucket=byBoard[item.board]??=[];if(bucket.length<10) bucket.push(item.id)}
  return {eligiblePostCount,overall:ranked.slice(0,10).map(item=>item.id),byBoard};
}
