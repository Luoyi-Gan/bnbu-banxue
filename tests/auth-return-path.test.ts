import {expect, it} from 'vitest'
import {authReturnPath,roleLoginPath} from '../src/v2/authReturnPath'

it.each(['/v2/partners/teams', '/v2/messages?conversation=abc#latest', '/v2/teacher/coffee', '/v2/community?item=post-1'])('保留原版目标和参数 %s', path => {
  expect(authReturnPath(path)).toBe(path)
})
it.each([undefined, '//evil.example/v2', '/\\evil.example/v2', '/v2/../../outside', '/v2/login', '/v2/register?next=abc', 'https://evil.example/v2'])('拒绝外部地址及登录循环 %s', path => {
  expect(authReturnPath(path)).toBe('/workspace')
})

it('登录按真实身份进入原端，并拦截不匹配的返回路径',()=>{
 expect(roleLoginPath(undefined,['student'])).toBe('/v2')
 expect(roleLoginPath(undefined,['teacher'])).toBe('/v2/teacher/coffee')
 expect(roleLoginPath(undefined,['reviewer'])).toBe('/v2/admin')
 expect(roleLoginPath('/v2/admin/moderation',['student'])).toBe('/v2')
 expect(roleLoginPath('/v2/community',['reviewer'])).toBe('/v2/admin')
 expect(roleLoginPath('/v2/community',['student'])).toBe('/v2/community')
 expect(roleLoginPath('https://evil.example',[])).toBe('/workspace')
})
