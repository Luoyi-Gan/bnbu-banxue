import {campusContacts,type CampusContact} from './campusContacts'
export const campusGuideCategories=['全部','住宿生活','教务学业','网络与账号','图书馆','校园服务','医疗与支持','成长与发展','学院与部门','学校概览'] as const
export type CampusGuideCategory=typeof campusGuideCategories[number]
export function searchCampusGuide(query:string,category:string='全部',items:CampusContact[]=campusContacts){
 const terms=query.normalize('NFKC').trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
 const common=['苑舍概况','宿舍调整','设施报修','校园卡补办','成绩单与学业证明','校历','校园网络、VPN与Eduroam','医疗及健康教育处','图书借阅、归还与续借','学生事务处','财务处','学校门户 Portal']
 const rank=(item:CampusContact)=>{const index=common.indexOf(item.name);return terms.length?terms.filter(term=>item.name.toLocaleLowerCase().includes(term)).length*100:index<0?0:common.length-index}
 return items.filter(item=>(category==='全部'||item.category===category)&&terms.every(term=>[item.name,item.category,item.keywords,item.description,item.email,item.phone,item.location,item.contactNote??''].join(' ').normalize('NFKC').toLocaleLowerCase().includes(term))).sort((a,b)=>rank(b)-rank(a))
}
