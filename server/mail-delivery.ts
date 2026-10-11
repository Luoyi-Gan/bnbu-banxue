import { demand, issueCode, ServiceError, timestamp } from "./auth";
import type { Database } from "./database";

export async function sendVerification(
  db: Database,
  email: unknown,
  localOutbox: boolean,
) {
  const endpoint = process.env.BNBU_EMAIL_DELIVERY_URL;
  demand(localOutbox || endpoint, "尚未配置验证码邮件服务。", 503);
  const local = issueCode(db, email);
  if (!endpoint) return local;
  const message = db
    .prepare(
      "SELECT * FROM mail_outbox WHERE recipient=? ORDER BY created_at DESC LIMIT 1",
    )
    .get(String(email).trim().toLowerCase())!;
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
