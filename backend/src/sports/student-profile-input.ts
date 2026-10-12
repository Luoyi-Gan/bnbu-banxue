import {demand} from '../auth';
import {textField,integerField,enumField,type Fields} from '../repository';
import {studentColleges,studentRegions} from './student-profile-catalog';

export function studentProfileInput(input:Fields,now=Date.now()) {
  demand(Object.keys(input).every(k=>['joinEmailProof','fullName','studentNumber','gender','gradeYear','collegeName','majorName','dateOfBirth','regionCode','otherRegionName'].includes(k)),'入班资料参数无效。');
  const fullName=textField(input,'fullName',64),studentNumber=textField(input,'studentNumber',10);
  demand(/^2[0-9]{9}$/.test(studentNumber),'请填写十位数字学号。');
  const gender=enumField(input,'gender',['MALE','FEMALE'] as const);
  const year=Number(new Intl.DateTimeFormat('en',{timeZone:'Asia/Shanghai',year:'numeric'}).format(now));
  const gradeYear=integerField(input,'gradeYear',year-6,year+1);
  const collegeName=textField(input,'collegeName',20),majorName=textField(input,'majorName',200);
  const college=studentColleges.find(c=>c.code===collegeName);
  demand(college,'请选择有效学院。');
  const choices=collegeName==='SAI'?studentColleges.flatMap(c=>c.majors):college.majors;
  demand(majorName==='未分流' || (/^[A-Z]{1,200}$/.test(majorName) && (['SGE','GS'].includes(collegeName) || choices.includes(majorName))),'请选择对应学院的专业。');
  const dateOfBirth=textField(input,'dateOfBirth',10),birth=Date.parse(dateOfBirth+'T00:00:00Z');
  demand(/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth) && Number.isFinite(birth) && new Date(birth).toISOString().slice(0,10)===dateOfBirth && birth<=now,'出生日期无效。');
  const regionCode=textField(input,'regionCode',20);
  demand(studentRegions.includes(regionCode),'请选择有效地区。');
  const otherRegionName=regionCode==='OTHER'?textField(input,'otherRegionName',200):null;
  return {fullName,studentNumber,gender,gradeYear,collegeName,majorName,dateOfBirth,regionCode,otherRegionName};
}
