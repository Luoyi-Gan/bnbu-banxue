import { demand, issueCode, ServiceError, timestamp } from "./auth";
import type { Database } from "./database";

export async function sendVerification(
  db: Database,
  email: unknown,
  localOutbox: boolean,
  origin='local',
) {
  const endpoint = process.env.BNBU_EMAIL_DELIVERY_URL;
  demand(localOutbox || endpoint, "尚未配置验证码邮件服务。", 503);
  const local = issueCode(db, email, origin);
  if (!endpoint) return local;
  const message = db
    .prepare(
      "SELECT * FROM mail_outbox WHERE recipient=? ORDER BY created_at DESC LIMIT 1",
    )
    .get(String(email).trim().toLowerCase())!;
  return deliverOutbox(db, String(message.id), localOutbox);
}
export async function deliverOutbox(
  db: Database,
  id: string,
  localOutbox: boolean,
) {
  const endpoint = process.env.BNBU_EMAIL_DELIVERY_URL;
  demand(localOutbox || endpoint, "尚未配置验证码邮件服务。", 503);
  const message = db.prepare("SELECT * FROM mail_outbox WHERE id=?").get(id);
  demand(message, "邮件任务已失效。", 409);
  if (!endpoint)
    return {
      sent: true,
      delivery: "local-outbox",
      message: "验证码已写入本地开发收件箱，未发送至真实邮箱。",
    };
  await deliverMessage({id:message.id,recipient:message.recipient,subject:message.subject,body:message.body}, endpoint);
  db.prepare("UPDATE mail_outbox SET delivered_at=? WHERE id=?").run(
    timestamp(),
    message.id,
  );
  return {
    sent: true,
    delivery: "email",
    message: "验证码已发送，请查看邮箱。",
  };
}

export async function deliverMessage(message: {id: unknown; recipient: unknown; subject: unknown; body: unknown}, endpoint: string) {
  if (process.env.BNBU_EMAIL_PROVIDER === 'aoksend') {
    await deliverAokSend(message, endpoint);
    return;
  }
  const result = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.BNBU_EMAIL_DELIVERY_TOKEN
        ? { Authorization: `Bearer ${process.env.BNBU_EMAIL_DELIVERY_TOKEN}` }
        : {}),
    },
    body: JSON.stringify({
      to: message.recipient,
      subject: message.subject,
      text: message.body,
      idempotencyKey: message.id,
    }),
    signal: AbortSignal.timeout(15000),
  }).catch(() => {
    throw new ServiceError(
      502,
      "EMAIL_DELIVERY_UNCONFIRMED",
      "邮件服务未确认发送，请稍后重试。",
    );
  });
  const receipt = await result.json().catch(() => null);
  demand(
    result.ok && receipt?.sent === true,
    "邮件服务未确认发送，请稍后重试。",
    502,
  );
}

/** Existing production provider; credentials and approved template stay server-side. */
async function deliverAokSend(message: {recipient: unknown; subject: unknown; body: unknown}, endpoint: string) {
  demand(endpoint === 'https://apiv2.aoksend.com/index/api/send_email', '邮件服务地址配置无效。', 503);
  const key = process.env.BNBU_AOKSEND_APP_KEY;
  const deletion = message.subject==='会同里账号注销验证码';
  demand(!deletion || process.env.BNBU_AOKSEND_DELETION_TEMPLATE_ID,'请配置明确标注永久注销用途的邮件模板。',503);
  const template = deletion ? process.env.BNBU_AOKSEND_DELETION_TEMPLATE_ID : message.subject==='会同里登录验证码'&&process.env.BNBU_AOKSEND_LOGIN_TEMPLATE_ID
    ?process.env.BNBU_AOKSEND_LOGIN_TEMPLATE_ID:process.env.BNBU_AOKSEND_TEMPLATE_ID;
  const variable = process.env.BNBU_AOKSEND_CODE_VARIABLE;
  demand(key && template && variable && /^[A-Za-z_][A-Za-z0-9_]*$/.test(variable), '尚未完整配置验证码邮件服务。', 503);
  const codes = String(message.body).match(/(?<!\d)\d{6}(?!\d)/g);
  demand(codes?.length === 1, '验证码邮件内容无效。', 500);
  const data={...(deletion?{username:'会同里账号注销',userinfo:'此验证码用于永久删除账号及相关数据，10分钟内有效，请勿转发。'}:{}),...(message.subject==='会同里登录验证码'?{username:'会同里登录',userinfo:'验证码仅限本次登录使用，10分钟内有效。'}:{}),[variable!]:codes![0],minutes:'10'};
  const form = new URLSearchParams({ app_key: key!, template_id: template!, to: String(message.recipient), data: JSON.stringify(data) });
  const result = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
    signal: AbortSignal.timeout(15000),
  }).catch(() => { throw new ServiceError(502, 'EMAIL_DELIVERY_UNCONFIRMED', '邮件服务未确认发送，请稍后重试。'); });
  const receipt = await result.json().catch(() => null);
  demand(result.ok && receipt?.code === 200, '邮件服务未确认发送，请稍后重试。', 502);
}
