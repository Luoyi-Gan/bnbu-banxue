import {expect,it} from 'vitest';
import {studentProfileInput} from '../backend/src/sports/student-profile-input';
import {studentColleges,studentRegions} from '../backend/src/sports/student-profile-catalog';
// @ts-expect-error Existing browser catalog is JavaScript.
import {STUDENT_COLLEGES} from '../public/student/js/student-academics.js';
// @ts-expect-error Existing browser catalog is JavaScript.
import {regions} from '../public/student/js/region-catalog.js';
const profile={fullName:'学生',studentNumber:'2030123456',gender:'MALE',gradeYear:2026,collegeName:'FST',majorName:'CST',dateOfBirth:'2005-01-01',regionCode:'CN-44'};
const now=Date.parse('2026-10-12T00:00:00Z');
it('keeps backend enrollment catalogs identical to existing page choices',()=>{
  expect(studentColleges).toEqual(STUDENT_COLLEGES);
  expect(studentRegions).toEqual(regions.map((r:string[])=>r[0]));
});
it('validates independent student profile fields without using the email prefix',()=>{
  expect(studentProfileInput({...profile,joinEmailProof:'independent-proof'},now).studentNumber).toBe('2030123456');
  for(const patch of [{studentNumber:'y123456789'},{majorName:'FIN'},{dateOfBirth:'2005-02-31'},{regionCode:'invalid'},{regionCode:'OTHER'},{gradeYear:2028},{gender:'unknown'}])expect(()=>studentProfileInput({...profile,...patch},now)).toThrow();
  expect(studentProfileInput({...profile,collegeName:'GS',majorName:'CUSTOM',regionCode:'OTHER',otherRegionName:'Example'},now)).toMatchObject({majorName:'CUSTOM',otherRegionName:'Example'});
});
