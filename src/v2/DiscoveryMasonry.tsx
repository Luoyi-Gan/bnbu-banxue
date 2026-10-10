import { useEffect, useRef, useState, type ReactNode } from 'react'
import { discoveryColumns } from './discoveryLayout'
import './communityFeed.css'

export function DiscoveryMasonry<T extends { id: string }>({ items, renderItem, itemLabel = '活动' }: { items: T[]; renderItem: (item: T) => ReactNode; itemLabel?: string }) {
  const container = useRef<HTMLDivElement>(null)
  const sentinel = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(360)
  const [limit, setLimit] = useState(6)
  const columns = Math.max(2, Math.min(4, Math.floor(width / 220)))
  const hasMore = limit < items.length
  useEffect(() => {
    const element = container.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    const element = sentinel.current
    if (!element || !hasMore || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setLimit(value => value + 6)
    }, { rootMargin: '100px' })
    observer.observe(element)
    return () => observer.disconnect()
  }, [limit, hasMore])
  return <div ref={container} className="discovery-feed">
    <div className="discovery-columns" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {discoveryColumns(items.slice(0, limit), columns, (width - (columns - 1) * 16) / columns).map((column, index) => <div className="discovery-column" key={index}>{column.map(renderItem)}</div>)}
    </div>
    <div className="discovery-end" ref={sentinel}>{hasMore ? <button type="button" className="v2-text-button" onClick={() => setLimit(value => value + 6)}>加载更多{itemLabel}</button> : `已经看完当前${itemLabel}`}</div>
  </div>
}
