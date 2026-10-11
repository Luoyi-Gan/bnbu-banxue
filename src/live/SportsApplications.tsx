import { useRef, useState } from "react";
import { command, sportsChangedEvent, type LiveEntity } from "./api";
import type { OpenForm } from "./ConnectedApp";
const labels: Record<string, string> = {
  SUBMITTED: "待教师审核",
  SUPPLEMENT_REQUIRED: "待补充证明",
  APPROVED: "已批准",
  REJECTED: "已驳回",
  SCHOOL_TEAM: "校队",
  STUDENT_CLUB: "社团",
};
function ProofUpload({
  courseId,
  application,
  done,
}: {
  courseId: string;
  application?: LiveEntity;
  done: (ids: string[]) => Promise<void>;
}) {
  const [files, setFiles] = useState<File[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const prior =
    (application?.data.assetIds as string[] | undefined)?.length ?? 0;
  const uploaded = useRef<string[]>([]);
  async function submit() {
    setBusy(true);
    setError("");
    try {
      if (
        !files.length ||
        files.length > 3 ||
        files.some(
          (f) =>
            f.size > 10 * 1024 * 1024 ||
            !["image/jpeg", "image/png", "image/webp"].includes(f.type),
        )
      )
        throw Error(
          "每次上传最多3张JPEG/PNG/WebP，单张不超过10MB；补充上传单独计算。",
        );
      const ids = uploaded.current;
      for (const file of files.slice(ids.length)) {
        const res = await fetch(
          `/api/sports/application-assets/${courseId}${application ? `/${application.id}` : ""}`,
          {
            method: "POST",
            headers: { "Content-Type": file.type },
            body: file,
            credentials: "same-origin",
          },
        );
        const value = await res.json();
        if (!res.ok) throw Error(value.message ?? "证明上传失败");
        ids.push(value.id);
      }
      await done(ids);
      uploaded.current = [];
      setFiles([]);
      window.dispatchEvent(new Event(sportsChangedEvent));
    } catch (e) {
      setError(e instanceof Error ? e.message : "申请提交失败");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        disabled={busy}
        onChange={(e) => {
          uploaded.current = [];
          setFiles(Array.from(e.target.files ?? []));
        }}
      />
      <p>
        历史已有{prior}张证明，本次选择{files.length}
        张；每次最多3张，补充上传单独计算。
      </p>
      <button disabled={busy || !files.length} onClick={() => void submit()}>
        {busy ? "提交中…" : application ? "正式提交补充证明" : "正式提交申请"}
      </button>
      {error && <p role="alert">{error}</p>}
    </>
  );
}
export function SportsApplications({
  course,
  applications,
  history,
  creditHistory,
  credits,
  teacher,
  canApply,
  open,
  busy,
}: {
  course: LiveEntity;
  applications: LiveEntity[];
  history: LiveEntity[];
  creditHistory: LiveEntity[];
  credits: LiveEntity[];
  teacher: boolean;
  canApply: boolean;
  open: OpenForm;
  busy: boolean;
}) {
  const [type, setType] = useState("EXEMPTION"),
    [kind, setKind] = useState("SCHOOL_TEAM"),
    [name, setName] = useState(""),
    [from, setFrom] = useState(""),
    [to, setTo] = useState("");
  const minutes = [
    {
      key: "relatedMinutes",
      label: "课程相关认可分钟",
      type: "number" as const,
      value: 0,
    },
    {
      key: "otherMinutes",
      label: "其他运动认可分钟",
      type: "number" as const,
      value: 0,
    },
  ];
  return (
    <details>
      <summary>耐力跑免测与校队/社团认证</summary>
      <p>
        证明仅本人和责任教师可读。免测不增加运动分钟；组织认证按教师分配的两类分钟参与进度。
      </p>
      {!teacher &&
        canApply &&
        course.data.status === "PUBLISHED" &&
        course.data.settlementStatus !== "SETTLED" && (
          <section>
            <select
              aria-label="申请类型"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="EXEMPTION">耐力跑免测</option>
              <option value="CERTIFICATION">校队/社团认证</option>
            </select>
            {type === "CERTIFICATION" && (
              <>
                <select
                  aria-label="认证分类"
                  value={kind}
                  onChange={(e) => setKind(e.target.value)}
                >
                  <option value="SCHOOL_TEAM">校队</option>
                  <option value="STUDENT_CLUB">社团</option>
                </select>
                <input
                  placeholder="校队或社团名称"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <label>
                  有效期开始
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                  />
                </label>
                <label>
                  有效期结束
                  <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                  />
                </label>
              </>
            )}
            <ProofUpload
              courseId={course.id}
              done={async (ids) => {
                await command("sports.application.submit", {
                  courseId: course.id,
                  applicationType: type,
                  assetIds: ids,
                  ...(type === "CERTIFICATION"
                    ? {
                        certificationKind: kind,
                        organizationOrTeamName: name,
                        validFrom: from,
                        validTo: to,
                      }
                    : {}),
                });
              }}
            />
          </section>
        )}
      {applications
        .filter((a) => a.data.courseId === course.id)
        .map((a) => {
          const certification = a.data.certification as Record<
              string,
              unknown
            > | null,
            ownCredits = credits.filter((c) => c.data.applicationId === a.id);
          return (
            <section key={a.id}>
              <h4>
                {teacher && `${a.data.studentName ?? "学生"} · `}
                {a.data.applicationType === "EXEMPTION"
                  ? "耐力跑免测"
                  : `组织认证：${labels[String(certification?.certificationKind)] ?? ""} ${certification?.organizationOrTeamName ?? ""}`}
              </h4>
              <p>
                {labels[String(a.data.status)]} ·{" "}
                {String(a.data.publicReason ?? "")}
              </p>
              {certification && (
                <p>
                  {String(certification.validFrom)} 至{" "}
                  {String(certification.validTo)}
                </p>
              )}
              {(a.data.assetIds as string[]).map((id) => (
                <a
                  key={id}
                  href={`/api/sports/application-assets/${id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    src={`/api/sports/application-assets/${id}`}
                    alt="申请证明原图"
                    loading="lazy"
                    style={{
                      maxWidth: 160,
                      maxHeight: 160,
                      objectFit: "contain",
                    }}
                  />
                </a>
              ))}
              {ownCredits.map((c) => (
                <p key={c.id}>
                  {c.data.category === "RELATED" ? "课程相关" : "其他运动"}：
                  {String(c.data.minutes)}分钟（
                  {c.data.status === "VALID" ? "有效" : "已撤销"}）
                </p>
              ))}
              {!teacher && a.data.status === "SUPPLEMENT_REQUIRED" && (
                <ProofUpload
                  key={a.version}
                  courseId={course.id}
                  application={a}
                  done={async (ids) => {
                    await command("sports.application.supplement", {
                      id: a.id,
                      version: a.version,
                      assetIds: ids,
                    });
                  }}
                />
              )}
              {teacher &&
                a.data.status === "SUBMITTED" &&
                [
                  ["APPROVE", "批准"],
                  ["REJECT", "驳回"],
                  ["REQUEST_SUPPLEMENT", "要求补充"],
                ].map(([decision, label]) => (
                  <button
                    key={decision}
                    disabled={busy}
                    onClick={() =>
                      open(
                        label,
                        "sports.application.decide",
                        [
                          { key: "reason", label: "公开处理说明" },
                          ...(decision === "APPROVE" &&
                          a.data.applicationType === "CERTIFICATION"
                            ? minutes
                            : []),
                        ],
                        { id: a.id, version: a.version, decision },
                      )
                    }
                  >
                    {label}
                  </button>
                ))}
              {teacher &&
                a.data.status === "APPROVED" &&
                ownCredits.length > 0 &&
                ownCredits.every((c) => c.data.status === "VALID") && (
                  <>
                    <button
                      disabled={busy}
                      onClick={() =>
                        open(
                          "调整认证认可分钟",
                          "sports.certification.adjust",
                          [
                            ...minutes,
                            { key: "reason", label: "公开调整原因" },
                          ],
                          { id: a.id, version: a.version },
                        )
                      }
                    >
                      调整认可分钟
                    </button>
                    <button
                      disabled={busy}
                      onClick={() =>
                        open(
                          "撤销认证认可",
                          "sports.certification.revoke",
                          [{ key: "reason", label: "公开撤销原因" }],
                          { id: a.id, version: a.version },
                        )
                      }
                    >
                      撤销认可
                    </button>
                  </>
                )}
              <details>
                <summary>申请历史</summary>
                {creditHistory
                  .filter((h) => h.data.applicationId === a.id)
                  .map((h) => (
                    <p key={h.id}>
                      认可历史：
                      {h.data.category === "RELATED"
                        ? "课程相关"
                        : "其他运动"}{" "}
                      {String(h.data.minutes)}分钟 ·{" "}
                      {h.data.status === "VALID" ? "有效" : "撤销"} ·{" "}
                      {String(h.data.reason)}
                    </p>
                  ))}
                {history
                  .filter((h) => h.data.applicationId === a.id)
                  .map((h) => (
                    <p key={h.id}>
                      {String(h.data.action)} · {String(h.data.reason ?? "")} ·{" "}
                      {new Date(Number(h.data.at)).toLocaleString()}
                    </p>
                  ))}
              </details>
            </section>
          );
        })}
    </details>
  );
}
