import {api,ApiError,workspaceChangedEvent} from '../live/api'
const pending=new Map<string,string>()
export async function learningCommand<T=Record<string,unknown>>(operation:string,input:Record<string,unknown>={}):Promise<T>{
  const writing=operation==='save'||operation==='delete',key=JSON.stringify({operation,input}),requestId=pending.get(key)??crypto.randomUUID()
  if(writing)pending.set(key,requestId)
  try{
    const result=await api<T>('/api/learning/command',{operation,input:{...input,...(writing?{requestId}:{})}})
    pending.delete(key)
    if(writing)window.dispatchEvent(new Event(workspaceChangedEvent))
    return result
  }catch(error){if(error instanceof ApiError&&error.status>=400&&error.status<500)pending.delete(key);throw error}
}
