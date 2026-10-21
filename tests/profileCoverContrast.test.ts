import {describe,it,expect} from 'vitest'
import {coverForeground} from '../src/v2/profileCoverContrast'

describe('profile cover foreground',()=>{
 it('uses white on dark covers and black on bright covers',()=>{
   expect(coverForeground([[0,0,0],[25,35,45]])).toBe('#ffffff')
   expect(coverForeground([[255,255,255],[220,230,245]])).toBe('#000000')
 })
 it('uses linear luminance rather than treating mid gray as a dark background',()=>{
   expect(coverForeground([[128,128,128]])).toBe('#000000')
   expect(coverForeground([[100,100,100]])).toBe('#ffffff')
 })
 it('weights colors by perceived brightness and handles an unavailable sample',()=>{
   expect(coverForeground([[0,255,0]])).toBe('#000000')
   expect(coverForeground([[0,0,255]])).toBe('#ffffff')
   expect(coverForeground([])).toBe('#000000')
 })
})
