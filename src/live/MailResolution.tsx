import { useState, type FormEvent } from "react";
import { command, type LiveEntity } from "./api";
import { Modal } from "../v2/ui";
import { mailFieldLabels, type MailActivityFields } from "../../shared/v2/mailActivityAdapter";
import type { MailActivityRecord } from "../../shared/v2/mailActivityPolicy";

const empty = (): MailActivityFields => ({title: "", description: "", startAt: "", endAt: "", location: "", host: "", conditions: ""});
export function MailResolution({source, mails, onSaved}: {source: LiveEntity; mails: LiveEntity[]; onSaved: () => Promise<void>}) {
  const [mode, setMode] = useState<"split" | "revise" | null>(null);
  const [original, setOriginal] = useState(source);
  const [target, setTarget] = useState<LiveEntity | null>(null);
  const [rows, setRows] = useState<MailActivityFields[]>([]);
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const record = source.data.record as unknown as MailActivityRecord;
  const open = (next: "split" | "revise") => {
    setOriginal(source); setMode(next); setRows(next === "split" ? [empty(), empty()] : []);
    setTarget(null); setReason(""); setConfirmed(false); setError("");
  };
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || !mode) return;
    setBusy(true); setError("");
    try {
      await command(`mail.${mode}`, {
        id: original.id, expectedVersion: original.version, confirmed, reason,
        ...(mode === "split" ? {activities: rows} : {...rows[0], targetMailId: target?.id, targetVersion: target?.version}),
      });
      setMode(null); await onSaved();
    } catch (failure) { setError(failure instanceof Error ? failure.message : "保存失败，请重试。"); }
    finally { setBusy(false); }
  }
  if (source.data.resolvedAs) return <p>已{source.data.resolvedAs === "split" ? "拆分为多场活动" : "关联更正原活动"}，原邮件保留。</p>;
  if (record.status !== "pending" || source.data.parentMailId) return null;
  return <>
    {source.data.purpose !== "revision" && <button className="v2-button v2-button-secondary" onClick={() => open("split")}>拆分多场活动</button>}
    <button className="v2-button v2-button-secondary" onClick={() => open("revise")}>关联更正原活动</button>
    {mode && <Modal title={mode === "split" ? "核对并拆分活动" : "核对更正邮件"} onClose={() => {if (!busy) setMode(null);}}>
      <form className="live-form" onSubmit={submit}>
        <details><summary>查看原邮件</summary><p style={{whiteSpace: "pre-wrap"}}>{(original.data.record as unknown as MailActivityRecord).source.body}</p></details>
        <fieldset disabled={busy}>
          {mode === "revise" && <label>选择原活动<select required value={target?.id ?? ""} onChange={event => {
            const selected = mails.find(item => item.id === event.target.value) ?? null;
            setTarget(selected); setRows(selected ? [{...(selected.data.record as unknown as MailActivityRecord).fields}] : []);
            setConfirmed(false);
          }}><option value="">请选择</option>{mails.filter(item => item.id !== source.id && !item.data.resolvedAs && (item.data.record as unknown as MailActivityRecord).status !== "pending").map(item => <option key={item.id} value={item.id}>{(item.data.record as unknown as MailActivityRecord).fields.title} · {(item.data.record as unknown as MailActivityRecord).fields.startAt}</option>)}</select></label>}
          <p>请填写完整活动信息，时间格式为 2027-01-01 10:00（北京时间）。</p>
          {rows.map((row, index) => <fieldset key={index}><legend>{mode === "split" ? `活动 ${index + 1}` : "更正后的活动"}</legend>
            {(Object.keys(mailFieldLabels) as (keyof MailActivityFields)[]).map(key => <label key={key}>{mailFieldLabels[key]}<input value={row[key]} required={key !== "host" && key !== "conditions"} maxLength={key === "description" ? 5000 : 500} onChange={event => {setRows(values => values.map((value, at) => at === index ? {...value, [key]: event.target.value} : value)); setConfirmed(false);}} /></label>)}
            {mode === "split" && rows.length > 2 && <button type="button" onClick={() => {setRows(values => values.filter((_, at) => at !== index)); setConfirmed(false);}}>移除此活动</button>}
          </fieldset>)}
          {mode === "split" && rows.length < 50 && <button type="button" onClick={() => {setRows(values => [...values, empty()]); setConfirmed(false);}}>再加一场活动</button>}
          <label>处理原因<textarea required maxLength={1000} value={reason} onChange={event => setReason(event.target.value)} /></label>
          <label><input type="checkbox" required checked={confirmed} onChange={event => setConfirmed(event.target.checked)} />我已核对原邮件和以上活动信息</label>
        </fieldset>
        {error && <p role="alert" className="live-error">{error}</p>}
        <button className="v2-button v2-button-primary" disabled={busy || !rows.length}>{busy ? "正在保存…" : "确认提交"}</button>
      </form>
    </Modal>}
  </>;
}
