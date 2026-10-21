import {describe,it,expect} from 'vitest'
import {coverCrop} from '../src/v2/coverCrop'
describe('封面裁切',()=>{
  it('按展示比例裁切竖图，拖动到上下边缘不留空白',()=>{
    expect(coverCrop(800,1200,4,1,.5,0)).toEqual({sx:0,sy:0,sw:800,sh:200})
    expect(coverCrop(800,1200,4,1,.5,1)).toEqual({sx:0,sy:1000,sw:800,sh:200})
  })
  it('横图缩放后仍保留比例并限制越界位置',()=>{
    const crop=coverCrop(2400,600,3,2,-2,3)
    expect(crop).toEqual({sx:0,sy:300,sw:900,sh:300})
    expect(crop.sw/crop.sh).toBe(3)
  })
})
