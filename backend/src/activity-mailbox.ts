import { createHash } from 'node:crypto'
import { ImapFlow } from 'imapflow'
import { simpleParser } from 'mailparser'
import type { Fields } from './repository'

type MailboxConfig = { host: string; port: number; user: string; password: string; mailbox: string; allowedSenders: string[]; operatorId: string; intervalMs: number }

export function activityMailboxConfigured() {
  return Boolean(process.env.BNBU_ACTIVITY_MAIL_HOST && process.env.BNBU_ACTIVITY_MAIL_USER && process.env.BNBU_ACTIVITY_MAIL_PASSWORD && process.env.BNBU_ACTIVITY_MAIL_ALLOWED_SENDERS && process.env.BNBU_ACTIVITY_MAIL_OPERATOR_ID)
}

function config(): MailboxConfig | null {
  if (!activityMailboxConfigured()) return null
  const port = Number(process.env.BNBU_ACTIVITY_MAIL_PORT || 993)
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('BNBU_ACTIVITY_MAIL_PORT 无效')
  const allowedSenders = process.env.BNBU_ACTIVITY_MAIL_ALLOWED_SENDERS!.split(',').map(value => value.trim().toLowerCase()).filter(Boolean)
  if (!allowedSenders.length || allowedSenders.some(value => !/^(@[a-z0-9.-]+|[a-z0-9._%+-]+@[a-z0-9.-]+)$/.test(value))) throw new Error('BNBU_ACTIVITY_MAIL_ALLOWED_SENDERS 无效')
  return {
    host: process.env.BNBU_ACTIVITY_MAIL_HOST!, port, user: process.env.BNBU_ACTIVITY_MAIL_USER!, password: process.env.BNBU_ACTIVITY_MAIL_PASSWORD!,
    mailbox: process.env.BNBU_ACTIVITY_MAIL_MAILBOX || 'INBOX', allowedSenders, operatorId: process.env.BNBU_ACTIVITY_MAIL_OPERATOR_ID!,
    intervalMs: Math.max(15_000, Number(process.env.BNBU_ACTIVITY_MAIL_POLL_MS) || 60_000),
  }
}

export function allowedActivitySender(address: string, allowed: string[]) {
  const sender = address.trim().toLowerCase()
  return allowed.some(value => value.startsWith('@') ? sender.endsWith(value) : sender === value)
}

export function startActivityMailbox(importMail: (actorId: string, input: Fields, requestId: string) => Promise<unknown> | unknown) {
  const settings = config()
  if (!settings) return null
  let stopped = false
  let running = false
  const poll = async () => {
    if (stopped || running) return
    running = true
    const client = new ImapFlow({ host: settings.host, port: settings.port, secure: true, auth: { user: settings.user, pass: settings.password }, logger: false })
    try {
      await client.connect()
      const lock = await client.getMailboxLock(settings.mailbox)
      try {
        const unseen = await client.search({ seen: false }, { uid: true })
        let imported = 0
        for (const uid of (Array.isArray(unseen) ? unseen : [])) {
          if (stopped) break
          try {
            const message = await client.fetchOne(String(uid), { source: {start: 0, maxLength: 2 * 1024 * 1024 + 1}, size: true }, { uid: true })
            if (!message || !message.source || (message.size ?? message.source.length) > 2 * 1024 * 1024) continue
            const parsed = await simpleParser(message.source, { skipImageLinks: true, skipHtmlToText: false })
            const sender = parsed.from?.value[0]?.address?.toLowerCase() ?? ''
            if (!allowedActivitySender(sender, settings.allowedSenders)) continue
            const body = (parsed.text || '').trim().slice(0, 50_000)
            if (!body) continue
            const digest = createHash('sha256').update(message.source).digest('hex')
            const messageId = (parsed.messageId || `imap:${digest}`).trim().slice(0, 255)
            const input = { messageId, sender, subject: (parsed.subject || '学校活动通知').slice(0, 500), body }
            await importMail(settings.operatorId, input, `imap:${digest}`)
            await client.messageFlagsAdd(String(uid), ['\\Seen'], { uid: true })
            imported += 1
            if (imported >= 20) break
          } catch { console.error('活动邮件导入失败；邮件保留未读，稍后重试。') }
        }
      } finally { lock.release() }
    } catch { console.error('活动收件邮箱连接或读取失败，稍后重试。') }
    finally { try { await client.logout() } catch { /* connection may already be closed */ } running = false }
  }
  void poll()
  const timer = setInterval(() => void poll(), settings.intervalMs)
  return { stop() { stopped = true; clearInterval(timer) } }
}
