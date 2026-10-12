import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { clearApiSession, currentApiUserId, hasApiSession, joinWithInvite, logoutApi, request, restoreCompanionSession, verifyStudentSignInCode } from '../public/student/js/api.js';

beforeEach(() => {
  clearApiSession();
  vi.stubGlobal('location',{href:'http://127.0.0.1:4188/student/index.html',origin:'http://127.0.0.1:4188'});
});
afterEach(() => { clearApiSession(); vi.unstubAllGlobals(); });
const identity={data:{user:{id:'student-one',role:'STUDENT'},studentProfile:{id:'student-one'}}};
it('uses the member invitation endpoint for a restored cookie session and preserves independent number input', async () => {
  const fetcher=vi.fn().mockResolvedValue(new Response(JSON.stringify(identity),{status:200}));
  vi.stubGlobal('fetch',fetcher);
  await restoreCompanionSession();
  fetcher.mockImplementation(async()=>new Response(JSON.stringify({code:'INVITE_CLOSED',message:'Closed'}),{status:409}));
  const profile={studentNumber:'2030123456',joinEmail:'y123456789@bnbu.edu.cn'};
  await expect(joinWithInvite('v1.test',profile)).rejects.toMatchObject({status:409});
  const [url,options]=fetcher.mock.calls.at(-1);
  expect(url).toContain('/course-invites/v1.test/join-capabilities/member');
  expect(JSON.parse(options.body)).toEqual(profile);
  expect(options.headers.Authorization).toBeUndefined();
  clearApiSession();
  await expect(joinWithInvite('v1.test',profile)).rejects.toMatchObject({status:409});
  expect(fetcher.mock.calls.at(-1)[0]).toMatch(/\/join-capabilities$/);
});
it('restores a real cookie identity without manufacturing browser tokens and revokes on logout', async () => {
  const fetcher=vi.fn().mockResolvedValue(new Response(JSON.stringify(identity),{status:200}));
  vi.stubGlobal('fetch',fetcher);
  expect(await restoreCompanionSession()).toBe(true);
  expect(hasApiSession()).toBe(true);
  expect(currentApiUserId()).toBe('student-one');
  expect(fetcher.mock.calls[0][1].headers.Authorization).toBeUndefined();
  fetcher.mockResolvedValue(new Response('{}',{status:200}));
  await logoutApi();
  expect(hasApiSession()).toBe(false);
  expect(fetcher.mock.calls.at(-1)[0]).toBe('/api/auth/logout');
});
it('keeps the existing cookie session after a successful member join',async()=>{
  const response=data=>new Response(JSON.stringify({data}),{status:200});
  const fetcher=vi.fn().mockImplementationOnce(async()=>response(identity.data))
    .mockImplementationOnce(async()=>response({joinCapability:'one-time'}))
    .mockImplementationOnce(async()=>response({authSession:{kind:'COMPANION',user:{id:'student-one'}},enrollment:{id:'member-one'}}));
  vi.stubGlobal('fetch',fetcher);
  await restoreCompanionSession();
  expect((await joinWithInvite('v1.test',{})).enrollment.id).toBe('member-one');
  expect(currentApiUserId()).toBe('student-one');
  expect(hasApiSession()).toBe(true);
  expect(fetcher.mock.calls.at(-1)[1].headers['X-Join-Capability']).toBe('one-time');
  expect(fetcher.mock.calls.at(-1)[1].headers['Content-Type']).toBe('application/json');
  expect(fetcher.mock.calls.at(-1)[1].body).toBe('{}');
});
it('restores server identity after email-code login without storing a fake bearer token',async()=>{
  const fetcher=vi.fn().mockImplementationOnce(async()=>new Response(JSON.stringify({data:{kind:'COMPANION',user:{id:'student-one'}}}),{status:200}))
    .mockImplementationOnce(async()=>new Response(JSON.stringify(identity),{status:200}));
  vi.stubGlobal('fetch',fetcher);
  await verifyStudentSignInCode('challenge','123456');
  expect(currentApiUserId()).toBe('student-one');
  expect(fetcher.mock.calls.at(-1)[0]).toContain('/me');
  expect(fetcher.mock.calls.at(-1)[1].headers.Authorization).toBeUndefined();
});
it('rejects nonstudents and ignores a restore response that arrives after logout', async () => {
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(JSON.stringify({data:{user:{role:'TEACHER'}}}),{status:200})));
  expect(await restoreCompanionSession()).toBe(false);
  let complete;
  vi.stubGlobal('fetch',()=>new Promise(resolve=>{complete=resolve;}));
  const pending=restoreCompanionSession();
  clearApiSession();
  complete(new Response(JSON.stringify(identity),{status:200}));
  expect(await pending).toBe(false);
  expect(hasApiSession()).toBe(false);
});
it('clears a cookie session when the server revokes it', async () => {
  const fetcher=vi.fn().mockResolvedValue(new Response(JSON.stringify(identity),{status:200}));
  vi.stubGlobal('fetch',fetcher);
  await restoreCompanionSession();
  fetcher.mockResolvedValue(new Response(JSON.stringify({code:'AUTH_REQUIRED',message:'Login required'}),{status:401}));
  await expect(request('/me')).rejects.toMatchObject({status:401});
  expect(hasApiSession()).toBe(false);
});
