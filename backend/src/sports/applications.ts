import { createHash } from "node:crypto";
import sharp from "sharp";
import { authenticate, demand, timestamp, type Account } from "../auth";
import { transaction } from "../database";
import {
  Repository,
  enumField,
  integerField,
  textField,
  strings,
  type Fields,
  type Entity,
} from "../repository";
import { ownedCourse, sportsRole, version } from "./courses";
import { businessWeek } from "./credit";
import { recalculateProgress } from "./progress";
import { sportsWriteGate } from "./system";

function mutable(repo: Repository, course: Entity) {
  demand(
    course.data.settlementStatus !== "SETTLED" &&
      repo.get(course.data.semesterId, "sportsSemester").data.status !==
        "ARCHIVED",
    "已结算或归档申请须通过历史报告更正流程。",
    409,
  );
}
function studentContext(
  repo: Repository,
  actor: Account,
  courseId: string,
  applicationId?: string,
) {
  sportsWriteGate(repo, "sports.application.submit");
  sportsRole(repo, actor, "student");
  const course = repo.get(courseId, "sportsCourse");
  mutable(repo, course);
  if (applicationId) {
    const app = repo.get(applicationId, "sportsApplication");
    demand(
      app.ownerId === actor.id && app.data.courseId === courseId,
      "只能补充本人原申请。",
      403,
    );
    demand(
      app.data.status === "SUPPLEMENT_REQUIRED",
      "当前申请未要求补充。",
      409,
    );
    return {
      course,
      member: repo.get(app.data.enrollmentId, "sportsEnrollment"),
    };
  }
  demand(course.data.status === "PUBLISHED", "课程已关闭，不接受新申请。", 409);
  const member = repo
    .all("sportsEnrollment")
    .find(
      (m) =>
        m.ownerId === actor.id &&
        m.data.courseId === courseId &&
        m.data.status === "ACTIVE",
    );
  demand(member, "须为本班有效成员。", 403);
  return { course, member };
}
export async function uploadApplicationAsset(
  repo: Repository,
  token: string,
  courseId: string,
  bytes: Buffer,
  mime: string,
  applicationId?: string,
) {
  studentContext(repo, authenticate(repo.db, token), courseId, applicationId);
  demand(
    bytes.length > 0 && bytes.length <= 10 * 1024 * 1024,
    "单张证明图片须为1字节至10MB。",
    413,
  );
  demand(
    ["image/jpeg", "image/png", "image/webp"].includes(mime),
    "证明只接受JPEG、PNG或WebP图片。",
    415,
  );
  const parser = sharp(bytes, { limitInputPixels: 40000000, failOn: "error" }),
    meta = await parser.metadata().catch(() => null);
  demand(
    meta &&
      (
        { jpeg: "image/jpeg", png: "image/png", webp: "image/webp" } as Record<
          string,
          string
        >
      )[meta.format ?? ""] === mime &&
      !(meta.pages && meta.pages > 1),
    "证明图片内容或格式无效。",
  );
  await parser.stats().catch(() => demand(false, "证明图片不能完整解码。"));
  return transaction(repo.db, () => {
    const actor = authenticate(repo.db, token);
    studentContext(repo, actor, courseId, applicationId);
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    repo.db
      .prepare(
        "INSERT OR IGNORE INTO sports_media_blobs(sha256,bytes,created_at) VALUES(?,?,?)",
      )
      .run(sha256, bytes, timestamp());
    return repo.create("sportsApplicationAsset", actor.id, {
      courseId,
      applicationId: applicationId ?? null,
      sha256,
      mime,
      size: bytes.length,
      boundId: null,
    });
  });
}
export function readApplicationAsset(
  repo: Repository,
  actor: Account,
  id: string,
) {
  sportsWriteGate(repo, "sports.application.read");
  const asset = repo.get(id, "sportsApplicationAsset");
  if (asset.ownerId === actor.id) sportsRole(repo, actor, "student");
  else {
    ownedCourse(repo, actor, asset.data.courseId);
    demand(asset.data.boundId, "教师只能读取已正式提交的证明。", 403);
  }
  return asset;
}
function bindEvidence(
  repo: Repository,
  actor: Account,
  courseId: string,
  input: Fields,
  app?: Entity,
) {
  const ids = strings(input.assetIds),
    old = app ? strings(app.data.assetIds) : [];
  demand(
    Array.isArray(input.assetIds) &&
      ids.length === input.assetIds.length &&
      ids.length > 0 &&
      new Set(ids).size === ids.length &&
      ids.length <= 3,
    "每次提交须为1–3张新证明，补充提交单独计算。",
  );
  const assets = ids.map((id) => repo.get(id, "sportsApplicationAsset"));
  for (const asset of assets)
    demand(
      asset.ownerId === actor.id &&
        asset.data.courseId === courseId &&
        !asset.data.boundId &&
        asset.data.applicationId === (app?.id ?? null),
      "证明须为本人本次上传且未绑定其他申请。",
      403,
    );
  return { assets, all: [...old, ...ids] };
}
export function sportsApplicationCommand(
  repo: Repository,
  actor: Account,
  action: string,
  input: Fields,
  historicalCorrection = false,
) {
  if (action === "sports.exemption.revoke") {
    const exemption = repo.get(input.id, "sportsExemption"),
      course = ownedCourse(repo, actor, exemption.data.courseId);
    if (!historicalCorrection) mutable(repo, course);
    version(exemption, input);
    demand(
      exemption.data.status === "APPROVED" &&
        approvedExemption(repo, exemption.ownerId, course.id)?.id ===
          exemption.id,
      "只能撤销当前有效免测。",
      409,
    );
    const reason = textField(input, "reason", 1000);
    const app = repo.get(exemption.data.applicationId, "sportsApplication");
    demand(
      app.data.applicationType === "EXEMPTION" &&
        app.ownerId === exemption.ownerId &&
        app.data.courseId === course.id,
      "免测原申请关联不一致。",
      409,
    );
    const saved = repo.save(exemption, {
      status: "REVOKED",
      reason,
      revokedBy: actor.id,
      revokedAt: Date.now(),
    });
    repo.save(app, { exemptionStatus: "REVOKED", publicReason: reason });
    repo.create("sportsApplicationHistory", actor.id, {
      applicationId: app.id,
      courseId: course.id,
      action: "REVOKE_EXEMPTION",
      exemptionId: exemption.id,
      previousVersion: exemption.version,
      resultVersion: saved.version,
      reason,
      at: Date.now(),
    });
    repo.notify(
      [exemption.ownerId!],
      app.id,
      action,
      "原免测已撤销；已有体测记录恢复展示，无原记录则显示未录入。" + reason,
    );
    return saved;
  }
  if (
    ![
      "sports.application.submit",
      "sports.application.supplement",
      "sports.application.decide",
      "sports.certification.adjust",
      "sports.certification.revoke",
    ].includes(action)
  )
    return undefined;
  if (
    action === "sports.application.submit" ||
    action === "sports.application.supplement"
  ) {
    const old = action.endsWith("supplement")
      ? repo.get(input.id, "sportsApplication")
      : undefined;
    const courseId = old
      ? String(old.data.courseId)
      : textField(input, "courseId", 100);
    const { member } = studentContext(repo, actor, courseId, old?.id);
    if (old) version(old, input);
    const type = old
      ? String(old.data.applicationType)
      : enumField(input, "applicationType", [
          "EXEMPTION",
          "CERTIFICATION",
        ] as const);
    let certification: Fields | null = old
      ? (old.data.certification as Fields | null)
      : null;
    if (!old && type === "CERTIFICATION") {
      const kind = enumField(input, "certificationKind", [
          "SCHOOL_TEAM",
          "STUDENT_CLUB",
        ] as const),
        validFrom = textField(input, "validFrom", 10),
        validTo = textField(input, "validTo", 10);
      businessWeek(validFrom);
      businessWeek(validTo);
      demand(validFrom <= validTo, "认证有效期结束不能早于开始。");
      certification = {
        certificationKind: kind,
        organizationOrTeamName: textField(input, "organizationOrTeamName", 200),
        validFrom,
        validTo,
      };
    }
    const { assets, all } = bindEvidence(repo, actor, courseId, input, old);
    const data = {
      courseId,
      enrollmentId: member.id,
      applicationType: type,
      certification,
      assetIds: all,
      status: "SUBMITTED",
      submittedAt: old?.data.submittedAt ?? Date.now(),
      lastSubmittedAt: Date.now(),
    };
    const saved = old
      ? repo.save(old, data)
      : repo.create("sportsApplication", actor.id, data);
    for (const asset of assets) repo.save(asset, { boundId: saved.id });
    repo.create("sportsApplicationHistory", actor.id, {
      applicationId: saved.id,
      courseId,
      action: old ? "SUPPLEMENT" : "SUBMIT",
      assetIds: assets.map((a) => a.id),
      at: Date.now(),
      version: saved.version,
    });
    repo.notify(
      [String(repo.get(courseId, "sportsCourse").ownerId)],
      saved.id,
      action,
      old ? "申请补充材料已提交，待核对。" : "收到新的免测/组织认证申请。",
    );
    return saved;
  }
  const app = repo.get(input.id, "sportsApplication"),
    course = ownedCourse(repo, actor, app.data.courseId);
  if (!historicalCorrection) mutable(repo, course);
  version(app, input);
  const reason = textField(input, "reason", 1000);
  if (action === "sports.application.decide") {
    demand(app.data.status === "SUBMITTED", "只能处理已提交待审核申请。", 409);
    const decision = enumField(input, "decision", [
      "APPROVE",
      "REJECT",
      "REQUEST_SUPPLEMENT",
    ] as const);
    const saved = repo.save(app, {
      status:
        decision === "APPROVE"
          ? "APPROVED"
          : decision === "REJECT"
            ? "REJECTED"
            : "SUPPLEMENT_REQUIRED",
      publicReason: reason,
    });
    if (decision === "APPROVE" && app.data.applicationType === "CERTIFICATION")
      saveCredit(repo, actor, saved, course, input, reason, false);
    if (decision === "APPROVE" && app.data.applicationType === "EXEMPTION") {
      const oldExemption = approvedExemption(repo, app.ownerId, course.id);
      const exemptionData = {
        courseId: course.id,
        enrollmentId: app.data.enrollmentId,
        applicationId: app.id,
        status: "APPROVED",
        reason,
        at: Date.now(),
      };
      if (oldExemption) repo.save(oldExemption, exemptionData);
      else repo.create("sportsExemption", app.ownerId, exemptionData);
    }
    repo.create("sportsApplicationHistory", actor.id, {
      applicationId: app.id,
      courseId: course.id,
      action: decision,
      fromStatus: app.data.status,
      toStatus: saved.data.status,
      reason,
      at: Date.now(),
      version: saved.version,
    });
    repo.notify(
      [app.ownerId!],
      app.id,
      action,
      `申请处理结果：${decision === "APPROVE" ? "批准" : decision === "REJECT" ? "驳回" : "要求补充材料"}；${reason}`,
    );
    return saved;
  }
  demand(
    app.data.applicationType === "CERTIFICATION" &&
      app.data.status === "APPROVED",
    "只能调整或撤销已批准认证。",
    409,
  );
  const revoked = action === "sports.certification.revoke";
  const oldCredits = repo
    .all("sportsCertification")
    .filter((c) => c.data.applicationId === app.id);
  demand(
    oldCredits.length === 2 &&
      oldCredits.every((c) => c.data.status === "VALID"),
    "认证认可已经撤销或不可调整。",
    409,
  );
  const saved = repo.save(app, {
    publicReason: reason,
    creditStatus: revoked ? "REVOKED" : "VALID",
  });
  saveCredit(repo, actor, saved, course, input, reason, revoked);
  repo.notify(
    [app.ownerId!],
    app.id,
    action,
    `认证认可分钟已${revoked ? "撤销" : "调整"}，请查看分类剩余目标；${reason}`,
  );
  return saved;
}
function saveCredit(
  repo: Repository,
  actor: Account,
  app: Entity,
  course: Entity,
  input: Fields,
  reason: string,
  revoked: boolean,
) {
  const values = revoked
    ? [0, 0]
    : [
        integerField(
          input,
          "relatedMinutes",
          0,
          Number(course.data.relatedTarget),
        ),
        integerField(input, "otherMinutes", 0, Number(course.data.otherTarget)),
      ];
  demand(values[0] + values[1] <= 1200, "两类认可合计不超过1200分钟。");
  const credits = repo
    .all("sportsCertification")
    .filter((c) => c.data.applicationId === app.id);
  for (const [i, category] of ["RELATED", "OTHER"].entries()) {
    const old = credits.find((c) => c.data.category === category);
    const data = {
      courseId: course.id,
      applicationId: app.id,
      enrollmentId: app.data.enrollmentId,
      category,
      minutes: revoked ? Number(old?.data.minutes ?? 0) : values[i],
      status: revoked ? "REVOKED" : "VALID",
      reason,
    };
    const credit = old
      ? repo.save(old, data)
      : repo.create("sportsCertification", app.ownerId, data);
    repo.create("sportsCertificationHistory", actor.id, {
      ...data,
      creditId: credit.id,
      creditVersion: credit.version,
      previousMinutes: old?.data.minutes ?? null,
      at: Date.now(),
    });
  }
  recalculateProgress(
    repo,
    app,
    revoked ? "CERTIFICATION_REVOKED" : "CERTIFICATION_CHANGED",
  );
}
export function approvedExemption(
  repo: Pick<Repository,"all">,
  ownerId: string | null,
  courseId: unknown,
) {
  return repo
    .all("sportsExemption")
    .find(
      (e) =>
        e.ownerId === ownerId &&
        e.data.courseId === courseId &&
        e.data.status === "APPROVED",
    );
}
export function applicationWorkspace(repo: Repository, actor: Account) {
  const roles = repo
    .all("sportsIdentity")
    .filter((i) => i.ownerId === actor.id && i.data.status === "verified")
    .map((i) => i.data.role);
  const courses = new Set(
    roles.includes("teacher")
      ? repo
          .all("sportsCourse")
          .filter((c) => c.ownerId === actor.id)
          .map((c) => c.id)
      : [],
  );
  const visible = (e: Entity) =>
    courses.has(String(e.data.courseId)) ||
    (roles.includes("student") && e.ownerId === actor.id);
  const applications = repo.all("sportsApplication").filter(visible),
    ids = new Set(applications.map((a) => a.id));
  return {
    applications: applications.map((a) =>
      courses.has(String(a.data.courseId))
        ? {
            ...a,
            data: {
              ...a.data,
              studentName:
                repo.db
                  .prepare("SELECT name FROM accounts WHERE id=?")
                  .get(a.ownerId ?? "")?.name ?? "已注销学生",
            },
          }
        : a,
    ),
    applicationHistory: repo
      .all("sportsApplicationHistory")
      .filter((e) => ids.has(String(e.data.applicationId))),
    applicationAssets: repo
      .all("sportsApplicationAsset")
      .filter((e) => ids.has(String(e.data.boundId)))
      .map((e) => ({
        ...e,
        data: {
          courseId: e.data.courseId,
          boundId: e.data.boundId,
          mime: e.data.mime,
          size: e.data.size,
        },
      })),
    certifications: repo.all("sportsCertification").filter(visible),
    certificationHistory: repo
      .all("sportsCertificationHistory")
      .filter((e) => ids.has(String(e.data.applicationId))),
    exemptions: repo.all("sportsExemption").filter(visible),
  };
}
