import type { Database } from "./database";
import { snapshot } from "./commands";
import { authenticate } from "./auth";
import type { Entity } from "./repository";

/** Original community UI shape, with identity-based visibility and real counts. */
export function communityView(db: Database, token: string) {
  const workspace = snapshot(db, authenticate(db, token));
  const account = workspace.account;
  const content = workspace.entities.filter(
    (entity) => entity.kind === "post" || entity.kind === "comment",
  ) as Entity[];
  const name = (id: string | null) =>
    workspace.people.find((person) => person.id === id)?.name ?? "已注销用户";
  const visible = content.filter(
    (entity) =>
      entity.kind === "post" &&
      (entity.data.status === "visible" ||
        (entity.ownerId === account.id && entity.data.status === "pending")),
  );
  const posts = visible.map((post) => ({
    id: post.id,
    ownerId: post.ownerId,
    alumniId: typeof post.data.alumniId === "string" ? post.data.alumniId : undefined,
    title: String(post.data.title),
    body: String(post.data.body),
    board: String(post.data.board),
    images: Array.isArray(post.data.images) ? post.data.images : [],
    author: name(post.ownerId),
    date: post.createdAt,
    status: post.data.status,
    likes: Number(
      db
        .prepare(
          "SELECT count(*) AS n FROM relations WHERE entity_id=? AND kind='like'",
        )
        .get(post.id)?.n ?? 0,
    ),
    comments: content
      .filter(
        (comment) =>
          comment.kind === "comment" &&
          comment.data.postId === post.id &&
          (comment.data.status === "visible" ||
            (comment.ownerId === account.id &&
              comment.data.status === "pending")),
      )
      .map((comment) => ({
        id: comment.id,
        ownerId: comment.ownerId,
        author: name(comment.ownerId),
        body: String(comment.data.body),
        date: comment.createdAt,
        status: comment.data.status,
      })),
  }));
  const ids = new Set(posts.map((post) => post.id));
  const relations = workspace.relations as { entityId: string; kind: string }[];
  return {
    account: { id: account.id, name: account.name },
    posts,
    likedPosts: relations
      .filter((row) => row.kind === "like" && ids.has(row.entityId))
      .map((row) => row.entityId),
    savedPosts: relations
      .filter((row) => row.kind === "save" && ids.has(row.entityId))
      .map((row) => row.entityId),
  };
}
