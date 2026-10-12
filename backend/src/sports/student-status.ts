import type { Repository } from '../repository';

/** Membership status is independent of login and mailbox verification. */
export function studentMembershipStatus(repo:Pick<Repository,'all'>,studentId:string|null):'ACTIVE'|'PENDING' {
  const current=repo.all('sportsSemester').find(s=>s.data.status==='CURRENT');
  if(!current || !studentId)return 'PENDING';
  const courses=new Map(repo.all('sportsCourse').map(c=>[c.id,c]));
  return repo.all('sportsEnrollment').some(m=>m.ownerId===studentId && m.data.status==='ACTIVE' &&
    (m.data.semesterId===current.id || courses.get(String(m.data.courseId))?.data.semesterId===current.id)) ? 'ACTIVE' : 'PENDING';
}
