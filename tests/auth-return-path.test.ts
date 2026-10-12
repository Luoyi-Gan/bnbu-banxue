import {expect, it} from 'vitest'
import {authReturnPath} from '../src/v2/authReturnPath'

it.each(['/v2/partners/teams', '/v2/messages?conversation=abc#latest', '/v2/teacher/coffee', '/v2/community?item=post-1'])('保留原版目标和参数 %s', path => {
  expect(authReturnPath(path)).toBe(path)
})
it.each([undefined, '//evil.example/v2', '/\\evil.example/v2', '/v2/../../outside', '/v2/login', '/v2/register?next=abc', 'https://evil.example/v2'])('拒绝外部地址及登录循环 %s', path => {
  expect(authReturnPath(path)).toBe('/workspace')
})
