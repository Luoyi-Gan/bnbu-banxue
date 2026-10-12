import { effect, runSync, type BusinessRepository } from "../storage/effects";
import { demand, type Account } from "../auth";
import { Repository, enumField, textField, type Fields } from "../repository";
import { administratorAccess, requireSportsPermission } from "./permissions";
import { sportsAccountGate } from "./account-gate";
import { sportsAvailable } from "./materials";
import { sportsRole, version } from "./courses";
export const helpCategories = [
  "LOGIN",
  "ENROLLMENT",
  "EXERCISE",
  "EVIDENCE",
  "COURSES",
  "EXEMPTION",
  "CERTIFICATION",
  "NOTIFICATIONS",
  "MAINTENANCE",
  "FEEDBACK",
] as const;
function publication(data: Fields) {
  demand(
    String(data.bodyZh ?? "").trim() &&
      String(data.bodyEn ?? "").trim() &&
      Array.isArray(data.keywords) &&
      data.keywords.length > 0,
    "发布须有完整中英文正文和至少一个关键词。",
  );
}
export function sportsHelpCommand(repo: Repository, actor: Account, action: string, input: Fields) {
  return runSync(sportsHelpPolicy(repo, actor, action, input));
}
export function* sportsHelpPolicy(
  repo: BusinessRepository,
  actor: Account,
  action: string,
  input: Fields,
) {
  if (action !== "sports.help.save" && action !== "sports.help.state")
    return undefined;
  const identities = yield* effect(repo.all("sportsIdentity"));
  requireSportsPermission({all: () => identities}, actor, "HELP");
  const old = input.id ? yield* effect(repo.get(input.id, "sportsHelp")) : null;
  if (old) {
    version(old, input);
    demand(input.updatedAt === old.updatedAt, "文章已更新，请重新打开。", 409);
  }
  let data: Fields;
  if (action === "sports.help.state") {
    demand(old, "文章不存在。", 404);
    const status = enumField(input, "status", [
      "published",
      "archived",
    ] as const);
    demand(
      old.data.status !== status &&
        (status === "published" || old.data.status === "published"),
      "文章状态转换不允许。",
      409,
    );
    data = { ...old.data, status };
  } else {
    demand(
      typeof input.weight === "number" && Number.isFinite(input.weight),
      "排序权重须为有限数值。",
    );
    const status = old
      ? input.publish === true
        ? "published"
        : old.data.status
      : input.publish === true
        ? "published"
        : "draft";
    data = {
      titleZh: textField(input, "titleZh", 200),
      titleEn: textField(input, "titleEn", 200),
      bodyZh: textField(input, "bodyZh", 30000, true),
      bodyEn: textField(input, "bodyEn", 30000, true),
      category: enumField(input, "category", helpCategories),
      weight: input.weight,
      keywords: [
        ...new Set(
          textField(input, "keywords", 2000, true)
            .split(/[,，]/)
            .map((s) => s.trim())
            .filter(Boolean),
        ),
      ],
      status,
    };
  }
  if (data.status === "published") publication(data);
  if (data.status === "published" && !old?.data.firstPublishedAt)
    data.firstPublishedAt = Date.now();
  const saved = old
    ? yield* effect(repo.save(old, data))
    : yield* effect(repo.create("sportsHelp", actor.id, data));
  yield* effect(repo.create("sportsHelpHistory", actor.id, {
    articleId: saved.id,
    action,
    at: Date.now(),
    before: old?.data ?? null,
    after: saved.data,
    result: "SUCCESS",
  }));
  return saved;
}
export function helpRead(repo: Pick<Repository, "all">, actor: Account, lang: unknown) {
  sportsAccountGate(repo, actor);
  sportsAvailable(repo);
  demand(lang === "zh" || lang === "en", "帮助语言只能为zh或en。");
  const manage = administratorAccess(repo, actor).permissions.includes("HELP");
  if (!manage) sportsRole(repo, actor, "student");
  const articles = repo
    .all("sportsHelp")
    .filter((a) => manage || a.data.status === "published")
    .sort(
      (a, b) =>
        Number(b.data.weight) - Number(a.data.weight) ||
        b.updatedAt.localeCompare(a.updatedAt) ||
        a.id.localeCompare(b.id),
    );
  return {
    manage,
    lang,
    articles: manage
      ? articles
      : articles.map((a) => ({
          id: a.id,
          kind: a.kind,
          ownerId: null,
          version: a.version,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
          data: {
            title: lang === "zh" ? a.data.titleZh : a.data.titleEn,
            body: lang === "zh" ? a.data.bodyZh : a.data.bodyEn,
            category: a.data.category,
          },
        })),
  };
}
