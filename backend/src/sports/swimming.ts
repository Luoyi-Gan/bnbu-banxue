import { demand, type Account } from "../auth";
import { Repository, type Fields, type Entity } from "../repository";
import { sportsRole } from "./courses";
import { validateFiles, sportsAvailable } from "./materials";
/** A pre-session hash commitment prevents replacing a missing BEFORE photo after exercise. */
export function sportsSwimCommand(
  repo: Repository,
  actor: Account,
  action: string,
  input: Fields,
): Entity | undefined {
  if (action !== "sports.swim.before") return undefined;
  sportsRole(repo, actor, "student");
  sportsAvailable(repo);
  const course = repo.get(input.courseId, "sportsCourse");
  demand(
    course.data.status === "PUBLISHED" &&
      repo.get(course.data.semesterId, "sportsSemester").data.status ===
        "CURRENT",
    "当前课程不能准备新的游泳会话。",
    409,
  );
  demand(
    repo
      .all("sportsEnrollment")
      .some(
        (e) =>
          e.ownerId === actor.id &&
          e.data.courseId === course.id &&
          e.data.status === "ACTIVE",
      ),
    "须有本班有效成员关系。",
    403,
  );
  const file = validateFiles([input.file])[0];
  demand(file.mime !== "video/mp4", "游泳运动前凭证须为JPEG/PNG照片。");
  return repo.create("sportsSwimEvidence", actor.id, {
    ...file,
    courseId: course.id,
    phase: "BEFORE",
    committedAt: Date.now(),
    sessionId: null,
  });
}
export function beforeEvidence(
  repo: Repository,
  actor: Account,
  courseId: string,
  id: unknown,
) {
  const evidence = repo.get(id, "sportsSwimEvidence");
  demand(
    evidence.ownerId === actor.id &&
      evidence.data.courseId === courseId &&
      evidence.data.phase === "BEFORE" &&
      !evidence.data.sessionId,
    "须使用本人本课程尚未绑定的运动前照片；不能事后补造或跨会话复用。",
    409,
  );
  return evidence;
}
export function swimmingFiles(
  repo: Repository,
  session: Entity,
  files: ReturnType<typeof validateFiles>,
  raw: unknown,
) {
  const evidence = repo.get(
    session.data.beforeEvidenceId,
    "sportsSwimEvidence",
  );
  demand(
    evidence.data.sessionId === session.id,
    "运动前凭证未绑定本会话。",
    409,
  );
  const input = raw as Fields[];
  const result = files.map((file, index) => {
    const phase = input[index].phase ?? "AUXILIARY";
    demand(
      ["BEFORE", "AFTER", "AUXILIARY"].includes(String(phase)),
      "游泳凭证阶段无效。",
    );
    if (phase === "BEFORE")
      demand(
        file.sha256 === evidence.data.sha256 &&
          file.size === evidence.data.size &&
          file.mime === evidence.data.mime,
        "运动前照片须与开始前锁定原文件一致，不能事后替换。",
        409,
      );
    if (phase !== "AUXILIARY")
      demand(file.mime !== "video/mp4", "游泳前后凭证必须是照片。");
    return {
      ...file,
      phase,
      beforeEvidenceId: phase === "BEFORE" ? evidence.id : null,
    };
  });
  demand(
    result.filter((f) => f.phase === "BEFORE").length === 1 &&
      result.filter((f) => f.phase === "AFTER").length >= 1,
    "游泳须保留本会话运动前、运动后照片各一张。",
  );
  return result;
}
