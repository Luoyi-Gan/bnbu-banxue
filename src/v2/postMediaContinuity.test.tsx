import {describe,expect,it} from 'vitest'
import {renderToStaticMarkup} from 'react-dom/server'
import {MemoryRouter} from 'react-router-dom'
import type {Post} from '../../shared/v2/model'
import {CommunityDiscoveryFeed} from './CommunityDiscoveryFeed'
import {PostMedia} from './CommunityPostDetail'

const post:Post={id:'photo-continuity',title:'校园记录',body:'记录校园',board:'校园',author:'同学',date:'2026-10-22',likes:0,status:'visible',comments:[],images:['/first.jpg','/second.jpg']}
const noop=()=>{}
function feed(index:number,item=post){return renderToStaticMarkup(<MemoryRouter><CommunityDiscoveryFeed posts={[item]} photoIndices={{[item.id]:index}} liked={[]} saved={[]} viewerId="viewer" onOpen={noop} onLike={noop} onSave={noop}/></MemoryRouter>)}
function detail(index:number,item=post){return renderToStaticMarkup(<PostMedia post={item} index={index} onPhotoChange={noop}/>)}

describe('post photo continuity',()=>{
 it('renders the selected second photo in both the returned feed and reopened media',()=>{
  for(const html of [feed(1),detail(1)]){
   expect(html).toContain('src="/second.jpg"')
   expect(html).not.toContain('src="/first.jpg"')
  }
  expect(detail(1)).toContain('2 / 2')
 })
 it('keeps both surfaces on the remaining photo if an image was removed',()=>{
  const remaining={...post,images:['/first.jpg']}
  expect(feed(1,remaining)).toContain('src="/first.jpg"')
  expect(detail(1,remaining)).toContain('src="/first.jpg"')
 })
})
