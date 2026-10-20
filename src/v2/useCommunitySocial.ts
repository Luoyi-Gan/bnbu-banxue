import {useCallback,useEffect,useState} from 'react'
import {api,workspaceChangedEvent} from '../live/api'
export interface CommunityPerson {id:string;name:string;avatar:string;isFollowing:boolean;self?:boolean}
export interface CommunitySocialData {profile:CommunityPerson&{bio:string;cover?:string;following:number;followers:number;appreciations:number;posts:number;blocked:boolean;blockedByMe:boolean;self:boolean};messages?:{id:string;body:string;mine:boolean;createdAt:string}[];messagesHasMore?:boolean;conversations?:{id:string;name:string;avatar:string;body:string;createdAt:string}[];people:CommunityPerson[];hasMore:boolean;followingIds:string[];dismissed?:{id:string;title:string}[];reports?:{id:string;title:string;reason:string;status:string;resolution?:string;createdAt:string}[];drafts:{id:string;title:string;updatedAt:string}[];draftCount:number}
export function useCommunitySocial(person='',list='',page=1){
  const [stored,setData]=useState<{key:string;value:CommunitySocialData}|null>(null),[error,setError]=useState(''),[revision,setRevision]=useState(0)
  const key=`${person}|${list}|${page}`
  const refresh=useCallback(()=>setRevision(value=>value+1),[])
  useEffect(()=>{const controller=new AbortController();let live=true;void api<CommunitySocialData>(`/api/community/social?person=${encodeURIComponent(person)}&list=${list}&page=${page}`,undefined,controller.signal).then(value=>{if(live){setData({key:`${person}|${list}|${page}`,value});setError('')}}).catch(cause=>{if(live){setData(null);setError(cause instanceof Error?cause.message:'读取失败')}});return()=>{live=false;controller.abort()}},[person,list,page,revision])
  useEffect(()=>{window.addEventListener(workspaceChangedEvent,refresh);return()=>window.removeEventListener(workspaceChangedEvent,refresh)},[refresh])
  return {data:stored?.key===key?stored.value:stored?.key.split('|')[0]===person?{...stored.value,people:[],hasMore:false}:null,loading:stored?.key!==key,error,refresh}
}
