import type { Database } from "./database";
import { authenticate, demand } from "./auth";
import type { Entity } from "./repository";
import {Repository} from './repository';
import {projectDisplayPeople} from './display-people';
import {readAlumni} from './alumni';
import { hotLists, emptyEngagement, type Engagement } from './community-hot';

/** Original community UI shape, with identity-based visibility and real counts. */
export function communityView(db: Database, token: string) {
  const actor=authenticate(db, token);
  demand(actor.roles.length>0 && actor.status!=='banned','请先完成校园身份核验。',403);
  const repo=new Repository(db);
  const posts=repo.all('post').filter(item=>item.data.status==='visible'||item.ownerId===actor.id);
  const postIds=new Set(posts.map(item=>item.id));
  const comments=repo.all('comment').filter(item=>postIds.has(String(item.data.postId)) && (item.data.status==='visible'||item.ownerId===actor.id));
  const entities=[...posts,...comments];
  const ids=new Set([actor.id,...entities.map(item=>item.ownerId).filter((id):id is string=>!!id)]);
  const workspace={account:actor,entities,people:projectDisplayPeople(actor,repo.people(),ids,repo.all('preferences'),repo.all('profile')),relations:db.prepare('SELECT entity_id AS entityId,kind FROM relations WHERE account_id=?').all(actor.id) as {entityId:string;kind:string}[],alumni:{profiles:readAlumni(repo).profiles}};
  const likes = db.prepare("SELECT entity_id AS id,count(*) AS count FROM relations WHERE kind='like' GROUP BY entity_id").all();
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const countMap = (sql: string, ...params: string[]) => new Map<string,number>(db.prepare(sql).all(...params).map(row=>[String(row.id),Number(row.count)]));
  const engagement: Engagement = {
    allViews: countMap('SELECT post_id AS id,count(*) AS count FROM post_views GROUP BY post_id'),
    recentViews: countMap('SELECT post_id AS id,count(*) AS count FROM post_views WHERE viewed_at>=? GROUP BY post_id',cutoff),
    recentLikes: countMap("SELECT entity_id AS id,count(*) AS count FROM relations WHERE kind='like' AND created_at>=? GROUP BY entity_id",cutoff),
  };
  return projectCommunity({...workspace, relations: workspace.relations as {entityId:string;kind:string}[]}, new Map(likes.map(row=>[String(row.id),Number(row.count)])),engagement);
}

export function projectCommunity(workspace: {account:{id:string;name:string};entities:Entity[];people:{id:string;name:string;nickname?:string;avatar?:string}[];relations:{entityId:string;kind:string}[];alumni:{profiles:{id:string;name:string;status:string}[]}}, likes: ReadonlyMap<string,number>, engagement: Engagement = emptyEngagement) {
  const account = workspace.account;
  const content = workspace.entities.filter(
    (entity) => entity.kind === "post" || entity.kind === "comment",
  ) as Entity[];
  const person = (id: string | null) => workspace.people.find((item) => item.id === id);
  const name = (id: string | null) => {
    const author = person(id);
    return author?.nickname || author?.name || "已注销用户";
  };
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
    authorAvatar: person(post.ownerId)?.avatar ?? "",
    date: post.createdAt,
    status: post.data.status,
    likes: likes.get(post.id) ?? 0,
    ...(post.ownerId === account.id ? { viewCount: engagement.allViews.get(post.id) ?? 0 } : {}),
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
        authorAvatar: person(comment.ownerId)?.avatar ?? "",
        body: String(comment.data.body),
        date: comment.createdAt,
        status: comment.data.status,
      })),
  }));
  const ids = new Set(posts.map((post) => post.id));
  const relations = workspace.relations as { entityId: string; kind: string }[];
  return {
    account: { id: account.id, name: account.name, nickname: person(account.id)?.nickname, avatar: person(account.id)?.avatar },
    alumniProfiles: workspace.alumni.profiles.filter(p => p.status === "approved").map(p => ({id:p.id,name:p.name})),
    posts,
    likedPosts: relations
      .filter((row) => row.kind === "like" && ids.has(row.entityId))
      .map((row) => row.entityId),
    savedPosts: relations
      .filter((row) => row.kind === "save" && ids.has(row.entityId))
      .map((row) => row.entityId),
    hotLists: hotLists(content.filter(entity => entity.kind === 'post'),content.filter(entity => entity.kind === 'comment'),engagement),
    features: { postViews: true },
  };
}
