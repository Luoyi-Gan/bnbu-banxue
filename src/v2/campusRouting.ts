export type Point=[number,number]
export type WalkingGraph={nodes:Record<string,Point>;edges:[string,string,number,string,string,string,('forward'|'backward'|'both')?][];buildings:Record<string,Point>;sourceTimestamp:string;attribution:string}
export type WalkingRoute={points:Point[];metres:number;startGap:number;endGap:number;steps:{name:string;metres:number;stairs:boolean}[]}
export type RouteResult={route:WalkingRoute;error?:never}|{route?:never;error:string}
const distance=(a:Point,b:Point)=>Math.hypot(a[0]-b[0],a[1]-b[1])
export function planCampusRoute(graph:WalkingGraph,from:string,to:string):RouteResult{
  if(from===to)return {error:'请选择不同的起点和终点。'}
  const start=graph.buildings[from],end=graph.buildings[to]
  if(!start||!end)return {error:'该楼栋缺少可用的路线资料。'}
  const nearest=(point:Point)=>Object.entries(graph.nodes).reduce<{id:string;gap:number}>((best,[id,p])=>{const gap=distance(point,p);return gap<best.gap?{id,gap}:best},{id:'',gap:Infinity})
  const a=nearest(start),b=nearest(end)
  if(a.gap>100||b.gap>100)return {error:'楼栋附近缺少已记录道路，暂时无法规划。'}
  const adjacency=new Map<string,{to:string;edge:WalkingGraph['edges'][number]}[]>()
  for(const edge of graph.edges){if(!graph.nodes[edge[0]]||!graph.nodes[edge[1]]||!Number.isFinite(edge[2])||edge[2]<=0)continue;const pairs=edge[6]==='forward'?[[edge[0],edge[1]]]:edge[6]==='backward'?[[edge[1],edge[0]]]:[[edge[0],edge[1]],[edge[1],edge[0]]];for(const [f,t]of pairs){const list=adjacency.get(f)??[];list.push({to:t,edge});adjacency.set(f,list)}}
  const pending=new Set(Object.keys(graph.nodes)),cost=new Map([[a.id,0]]),previous=new Map<string,{id:string;edge:WalkingGraph['edges'][number]}>()
  while(pending.size){let current='',best=Infinity;for(const id of pending){const d=cost.get(id)??Infinity;if(d<best){best=d;current=id}}if(!current)break;if(current===b.id)break;pending.delete(current);for(const next of adjacency.get(current)??[]){const value=best+next.edge[2];if(pending.has(next.to)&&value<(cost.get(next.to)??Infinity)){cost.set(next.to,value);previous.set(next.to,{id:current,edge:next.edge})}}}
  if(!cost.has(b.id))return {error:'现有道路记录未连通这两个地点，请更换起终点；不会用直线补齐。'}
  if(a.id===b.id)return {error:'两个楼栋对应同一处道路节点，尚无可单独规划的道路段。'}
  const ids=[b.id],edges:WalkingGraph['edges'][number][]=[]
  for(let id=b.id;id!==a.id;){const p=previous.get(id);if(!p)return {error:'道路资料不完整，无法生成路线。'};edges.unshift(p.edge);ids.unshift(p.id);id=p.id}
  const steps:WalkingRoute['steps']=[]
  for(const e of edges){const stairs=e[4]==='steps',name=e[3]||(stairs?'台阶':'校内道路');const last=steps.at(-1);if(last&&last.name===name&&last.stairs===stairs)last.metres+=e[2];else steps.push({name,metres:e[2],stairs})}
  return {route:{points:ids.map(id=>graph.nodes[id]),metres:cost.get(b.id)!,startGap:a.gap,endGap:b.gap,steps}}
}
