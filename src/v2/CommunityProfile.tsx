import {MessageCircle,Plus,Check,UsersRound} from 'lucide-react'
import {Link} from 'react-router-dom'
import {useState} from 'react'
import {DisplayAvatar} from './DisplayAvatar'
import {CommunityModal} from './CommunityModal'
import {profileCoverSource} from './profileCovers'
import type {CommunitySocialData} from './useCommunitySocial'
import {uiText,useUiLanguage} from './uiLanguage'

export function CommunityProfile({profile,busy,onFollow,onList,notesLink=false}:{notesLink?:boolean;profile:CommunitySocialData['profile'];busy:boolean;onFollow:()=>void;onList:(list:string)=>void}){
  const language=useUiLanguage(),[photo,setPhoto]=useState(false)
  return <>
    <div className="community-profile-cover"><img src={profileCoverSource(profile.cover)} alt={uiText('校园主页背景')}/><span>会同里 · CAMPUS LIFE</span></div>
    <div className="community-profile-card">
      <div className="community-profile-identity"><button className="community-avatar-open" aria-label={uiText('查看头像')} onClick={()=>setPhoto(true)}><DisplayAvatar className="community-profile-avatar" name={profile.name} avatar={profile.avatar}/></button><div><h1>{profile.name}</h1><span className="community-profile-caption"><UsersRound size={13}/>{uiText('会同里校园社区')}</span></div></div>
      <p className="community-profile-bio">{profile.bio||uiText('在校园里，记录与分享。')}</p>
      <div className="community-profile-statline"><div>{[{key:'following',count:profile.following,label:'关注'},{key:'followers',count:profile.followers,label:'粉丝'},{key:'appreciations',count:profile.appreciations,label:'获赞与收藏'}].map(item=><button key={item.key} onClick={()=>onList(item.key)}><strong>{item.count}</strong><span>{language==='en'&&item.key==='following'?'Following':uiText(item.label)}</span></button>)}</div></div>
      <div className="community-profile-actions">{profile.self?<><Link className="community-outline" to="/v2/me?tab=profile">{uiText('编辑资料')}</Link>{notesLink&&<Link className="community-outline" to="/v2/community?person=me">{uiText('我的笔记')}</Link>}</>:<><button className={profile.isFollowing?'community-outline':'community-primary'} disabled={busy||profile.blocked} onClick={onFollow}>{profile.isFollowing?<Check size={17}/>:<Plus size={17}/>}<span>{uiText(profile.blocked?'暂不可互动':profile.isFollowing?'已关注':'关注')}</span></button>{profile.blocked?<button className="community-outline" disabled>{uiText('暂不可私信')}</button>:<Link className="community-outline" to={`/v2/messages?person=${encodeURIComponent(profile.id)}`}><MessageCircle size={18}/>{uiText('私信')}</Link>}</>}</div>
    </div>
    {photo&&<CommunityModal title={uiText('头像')} onClose={()=>setPhoto(false)}>{profile.avatar?<img className="community-avatar-large" src={profile.avatar} alt={profile.name}/>:<div className="community-avatar-placeholder">{profile.name.slice(0,1)}</div>}</CommunityModal>}
  </>
}
