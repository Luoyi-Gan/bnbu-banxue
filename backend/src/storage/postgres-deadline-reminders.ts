import type { Entity } from '../repository';
import { deadlineReminderPolicy } from '../sports/deadline-reminders';
import { buildCourseReportData } from '../sports/report';
import { runAsync } from './effects';
import type { PostgresDatabase } from './postgres';
import { postgresReportSources } from './postgres-course-report';
import { PostgresRepository } from './postgres-repository';

/** Must run in the business write transaction under advisory lock (18422, 2). */
export async function checkPostgresDeadlineReminders(repo:PostgresRepository,now=Date.now(),course?:Entity) {
  let sources:Awaited<ReturnType<typeof postgresReportSources>>|undefined;
  return runAsync(deadlineReminderPolicy(repo,async item=>{
    sources ??= await postgresReportSources(repo);
    return buildCourseReportData(sources.reader,item,id=>sources!.people.get(id));
  },now,course));
}
export async function processPostgresDeadlineReminders(db:PostgresDatabase,now=Date.now()) {
  return db.transaction(async client=>{
    await client.query('SELECT pg_advisory_xact_lock(18422, 2)');
    await checkPostgresDeadlineReminders(new PostgresRepository(client),now);
  });
}
