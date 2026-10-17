import {expect,it} from 'vitest'
import {changeTimer,elapsedMs,initialTimer,proofError,timerLabel} from './demoSportsModel'
it('暂停不累计，继续后仅累加运动时间，结束后保持固定',()=>{let t=changeTimer(initialTimer,'start',1000);t=changeTimer(t,'pause',6000);expect(elapsedMs(t,12000)).toBe(5000);t=changeTimer(t,'resume',12000);t=changeTimer(t,'finish',15000);expect(elapsedMs(t,50000)).toBe(8000);expect(changeTimer(t,'resume',50000)).toEqual(t)})
it('拒绝非法状态跳转与重复开始',()=>{expect(changeTimer(initialTimer,'finish',100)).toEqual(initialTimer);const t=changeTimer(initialTimer,'start',100);expect(changeTimer(t,'start',200)).toEqual(t)})
it('校验凭证大小类型与空文件，格式化长计时',()=>{expect(proofError({type:'image/png',size:10})).toBe('');expect(proofError({type:'text/html',size:10})).not.toBe('');expect(proofError({type:'video/mp4',size:31*1024*1024})).not.toBe('');expect(proofError({type:'image/png',size:0})).not.toBe('');expect(timerLabel(3661000)).toBe('01:01:01')})
