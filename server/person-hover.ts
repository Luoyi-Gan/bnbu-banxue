import type { Database } from "./database";
import { demand, type Account } from "./auth";
import { snapshot } from "./commands";
import { Repository, strings } from "./repository";
import { searchStudents } from "./student-search";

export function personHover(db: Database, viewer: Account, personId: string, studentNumber?: string) {
  const workspace = snapshot(db, viewer);
  const visible = workspace.people.find(person => person.id === personId);
  const searched = !visible && studentNumber
    ? searchStudents(db, viewer, studentNumber).students.find(person => person.id === personId)
    : undefined;
  const person = visible ?? searched;
  demand(person, "用户当前不可查看。", 404);
  const repo = new Repository(db);
  const own = viewer.id === personId;
  const prefs = repo.all("preferences").find(item => item.ownerId === personId)?.data;
  const preview = own || prefs?.profilePreview !== false || viewer.roles.some(role => ["teacher", "reviewer", "operator", "superadmin"].includes(role));
  const named = person.nickname || person.name;
  const identity = {id: personId, name: preview ? named : person.name, avatar: preview ? person.avatar ?? "" : ""};
  const visibleSections = {
    recentTeams: prefs?.hoverRecentTeams !== false,
    activeTeams: prefs?.hoverActiveTeams !== false,
    activities: prefs?.hoverActivities !== false,
  };
  if (!own && prefs?.profilePreview === false) return {...identity, visibleSections: {recentTeams:false, activeTeams:false, activities:false}, recentTeams: [], activeTeams: [], activities: []};

  const rooms = repo.all("room").filter(room =>
    room.data.visibility === "visible" &&
    (room.ownerId === personId || strings(room.data.members).includes(personId)));
  const summaries = (items: typeof rooms) => items.slice(0, 3).map(room => ({
    id: room.id, title: String(room.data.title ?? ""),
    path: `/v2/partners?item=${encodeURIComponent(room.id)}`,
  }));
  const recentTeams = visibleSections.recentTeams
    ? summaries(rooms.filter(room => room.data.status === "finished").sort((a,b) => b.updatedAt.localeCompare(a.updatedAt))) : [];
  const activeTeams = visibleSections.activeTeams
    ? summaries(rooms.filter(room => room.data.status === "open").sort((a,b) => b.createdAt.localeCompare(a.createdAt))) : [];
  const publicActivities = new Map(repo.all("activity").filter(item => item.data.status === "published").map(item => [item.id,item]));
  const activities = visibleSections.activities
    ? (db.prepare("SELECT entity_id AS id, created_at AS createdAt FROM relations WHERE account_id=? AND kind='participate' ORDER BY created_at DESC").all(personId) as {id:string;createdAt:string}[])
      .flatMap(mark => {
        const activity = publicActivities.get(mark.id);
        return activity ? [{id: activity.id, title: String(activity.data.title ?? ""), path: `/v2/activities/${encodeURIComponent(activity.id)}`}] : [];
      }).slice(0, 3) : [];
  return {...identity, visibleSections, recentTeams, activeTeams, activities};
}
