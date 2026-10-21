import { uiTemplate, useUiLanguage, uiText } from './uiLanguage'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { discoveryColumns } from './discoveryLayout'
import './communityFeed.css'
import {useDevicePreferences} from './devicePreferences'
import {useStaggeredEntrance} from './useStaggeredEntrance'

export function DiscoveryMasonry<T extends { id: string }>({ items, renderItem, itemLabel = '活动', hasMore:serverHasMore=false,onLoadMore,busy=false,entranceScope }: { items: T[]; renderItem: (item: T) => ReactNode; itemLabel?: string;hasMore?:boolean;onLoadMore?:()=>void;busy?:boolean;entranceScope?:string }) { useUiLanguage();
  const {reducedMotion}=useDevicePreferences()
  const container = useRef<HTMLDivElement>(null)
  const sentinel = useRef<HTMLDivElement>(null)
  const lastAuto=useRef('')
  const [width, setWidth] = useState(360)
  const [limit, setLimit] = useState(6)
  const columns = Math.max(2, Math.min(4, Math.floor(width / 220)))
  const hasMore = limit < items.length
  useStaggeredEntrance(container,entranceScope,JSON.stringify(items.slice(0,limit).map(item=>item.id)),columns,reducedMotion)
  useEffect(() => {
    const element = container.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    const element = sentinel.current
    if(!element||!(hasMore||serverHasMore)||busy||!('IntersectionObserver' in window))return
    const observer = new IntersectionObserver(([entry]) => {
      if(entry.isIntersecting){const key=`${items.length}:${limit}`;if(lastAuto.current===key)return;lastAuto.current=key;if(hasMore)setLimit(value=>value+6);else onLoadMore?.()}
    }, { rootMargin: '100px' })
    observer.observe(element)
    return () => observer.disconnect()
  }, [limit,hasMore,serverHasMore,busy,onLoadMore,items.length])
  return <div ref={container} className="discovery-feed" data-staggered={entranceScope?true:undefined}>
    <div className="discovery-columns" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {discoveryColumns(items.slice(0, limit), columns, (width - (columns - 1) * 16) / columns).map((column, index) => <div className="discovery-column" key={index}>{column.map(item=><div key={item.id} className="discovery-entrance-item" data-entrance-id={entranceScope?item.id:undefined}>{renderItem(item)}</div>)}</div>)}
    </div>
    <div className="discovery-end" ref={sentinel}>{hasMore||serverHasMore?<button type="button" className="v2-text-button" disabled={busy} onClick={() => hasMore?setLimit(value => value + 6):onLoadMore?.()}>{uiText("加载更多")}</button>:uiTemplate(["已经看完当前",""],uiText(itemLabel))}</div>
  </div>
}
