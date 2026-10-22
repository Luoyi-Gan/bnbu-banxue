import {describe,it,expect} from 'vitest'
import {aiBlocks,safeAIHref,nearAILatest} from '../src/v2/aiPresentation'
describe('AI answer presentation',()=>{
 it('separates headings, paragraphs, lists, quotations, code and tables',()=>{const blocks=aiBlocks('# 校园安排\n\n先看 **课程** [1]。\n\n- 上午\n- 下午\n\n> 以学校安排为准\n\n```ts\nconst x = 1\n```\n\n| 时间 | 地点 |\n| --- | --- |\n| 13:00 | T7 |');expect(blocks.map(b=>b.type)).toEqual(['heading','paragraph','list','quote','code','table']);expect(blocks[4]).toMatchObject({language:'ts',text:'const x = 1'});expect(blocks[5].rows?.[1]).toEqual(['13:00','T7'])})
 it('keeps HTML as literal text and tolerates partial code and empty tables',()=>{expect(aiBlocks('<script>alert(1)</script>')[0]).toEqual({type:'paragraph',text:'<script>alert(1)</script>'});expect(aiBlocks('```\na')).toEqual([{type:'code',language:'',text:'a'}]);expect(aiBlocks('| A | B |\n| --- | --- |')[0].rows).toHaveLength(1);expect(aiBlocks('')).toEqual([])})
 it('allows only platform routes and HTTPS references',()=>{for(const bad of ['javascript:alert(1)','data:text/html,x','//outside.test','/v2-evil/path','/v2/\\evil','/v2/\u0000','https://user:pass@example.test','http://example.test'])expect(safeAIHref(bad)).toBeNull();expect(safeAIHref('/v2/me?tab=timetable')).toBe('/v2/me?tab=timetable');expect(safeAIHref('https://sao.bnbu.edu.cn/a')).toBe('https://sao.bnbu.edu.cn/a')})
 it('does not follow new content when the reader has scrolled up',()=>{expect(nearAILatest(100,600,2000)).toBe(false);expect(nearAILatest(1330,600,2000)).toBe(true)})
})
