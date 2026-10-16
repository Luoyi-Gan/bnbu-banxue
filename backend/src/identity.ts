import { randomUUID } from "node:crypto";
import { demand, ServiceError, type Account } from "./auth";

/** Verification is an external assertion, never an instruction to grant roles. */
export async function checkSchoolIdentity(actor: Account) {
  demand(actor.status !== "banned", "账号已封禁。", 403);
  const endpoint = process.env.BNBU_IDENTITY_VERIFICATION_URL;
  demand(
    endpoint,
    "学校身份核验服务尚未配置；本地测试身份不代表学校核验。",
    503,
  );
  const requestId = randomUUID();
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      redirect: "error",
      signal: AbortSignal.timeout(10000),
      headers: {
        "Content-Type": "application/json",
        ...(process.env.BNBU_IDENTITY_VERIFICATION_TOKEN
          ? {
              Authorization: `Bearer ${process.env.BNBU_IDENTITY_VERIFICATION_TOKEN}`,
            }
          : {}),
      },
      body: JSON.stringify({
        requestId,
        accountId: actor.id,
        email: actor.email,
      }),
    });
  } catch {
    throw new ServiceError(
      502,
      "IDENTITY_UNAVAILABLE",
      "学校身份核验暂时不可用，请稍后重试。",
    );
  }
  const value = await response.json().catch(() => null);
  demand(
    response.ok &&
      value &&
      typeof value === "object" &&
      typeof value.verified === "boolean" &&
      value.requestId === requestId &&
      value.email === actor.email &&
      (!value.verified ||
        (typeof value.subject === "string" &&
          value.subject.length > 0 &&
          value.subject.length <= 200)),
    "核验服务未返回与当前账号匹配的有效结果。",
    502,
  );
  return {
    verified: value.verified as boolean,
    subject: value.verified ? (value.subject as string) : null,
    checkedAt: new Date().toISOString(),
    authorizationChanged: false,
  };
}

export interface SchoolStudentAssertion {
  verified: boolean;
  subject?: string;
  studentNumber?: string;
  schoolName?: string;
  email?: string;
  currentEnrollment?: boolean;
  requestId?: string;
}

/** Only a complete current-enrollment assertion can authorize student access. */
export async function verifyStudentAtSchool(actor: Account, candidate: {studentNumber:string;schoolName:string}): Promise<{verified:boolean;subject:string|null}> {
  const endpoint=process.env.BNBU_IDENTITY_VERIFICATION_URL;
  if (!endpoint) return {verified:false,subject:null};
  const requestId=randomUUID();
  let response:Response;
  try {
    response=await fetch(endpoint,{method:'POST',redirect:'error',signal:AbortSignal.timeout(10000),headers:{'Content-Type':'application/json',...(process.env.BNBU_IDENTITY_VERIFICATION_TOKEN?{Authorization:`Bearer ${process.env.BNBU_IDENTITY_VERIFICATION_TOKEN}`}:{})},body:JSON.stringify({requestId,accountId:actor.id,email:actor.email,studentNumber:candidate.studentNumber,schoolName:candidate.schoolName})});
  } catch { return {verified:false,subject:null}; }
  const value=await response.json().catch(()=>null) as SchoolStudentAssertion|null;
  if (!response.ok || !value || value.requestId!==requestId || value.email!==actor.email) return {verified:false,subject:null};
  return value.verified===true && value.currentEnrollment===true && value.studentNumber===candidate.studentNumber && value.schoolName===candidate.schoolName && typeof value.subject==='string' && value.subject.length>0 && value.subject.length<=200
    ? {verified:true,subject:value.subject} : {verified:false,subject:null};
}
