export type MovementCourse={id:string;enrollmentId:string;name:string;classCode:string;teacher:string;semester:string;current:boolean;status:string;progress:MovementProgress|null}
export type MovementProgress={courseSeconds:number|null;generalSeconds:number|null;courseTargetSeconds:number|null;generalTargetSeconds:number|null;totalTargetSeconds:number|null;status:string}
export type MovementRecord={id:string;enrollmentId:string;sport:string;businessDate:string;actualSeconds:number|null;creditedSeconds:number|null;status:string;review:string;comment:string;category:string}
export type MovementRecords={items:MovementRecord[];nextCursor:string|null}
export type MovementDashboard={courses:MovementCourse[];records:MovementRecords;updatedAt:string;warnings:string[]}
