import { Worker } from "node:worker_threads";
import { createRequire } from "node:module";
import { createHash, randomUUID } from "node:crypto";
import { authenticate, demand, ServiceError, timestamp } from "../auth";
import { Repository } from "../repository";
import { transaction } from "../database";
import { ownedCourse } from "./courses";
import { sportsWriteGate } from "./system";

export interface WorkbookSheet {
  index: number;
  name: string;
  csv: string;
  rowNumbers: number[];
  issues: number[];
  error?: string;
  imageIds?: string[];
  sourceIssues?: string[][];
}
export function parseWorkbook(
  bytes: Buffer,
  columns: 2 | 5 | "ROSTER_MAPPING" = 5,
): Promise<WorkbookSheet[]> {
  demand(
    bytes.length > 0 && bytes.length <= 100 * 1024 * 1024,
    "XLSX须为1字节至100MB。",
    413,
  );
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      `
      const {parentPort,workerData}=require('node:worker_threads');
      const Excel=require(workerData.modulePath);
      (async()=>{
        const book=new Excel.Workbook();await book.xlsx.load(Buffer.from(workerData.bytes));
        if(!book.worksheets.length||book.worksheets.length>32)throw Error('工作簿须有1–32张工作表');
        const aliases={'学号':'student_number','姓名':'name','项目':'event','用时':'time','测试日期':'test_date'};
        const results=book.worksheets.map((sheet,index)=>{
          const out={index,name:sheet.name,csv:'',rowNumbers:[],issues:[]};
          try {
            const columnCount=workerData.columns==='ROSTER_MAPPING'?sheet.columnCount:workerData.columns;
            if(workerData.columns==='ROSTER_MAPPING'&&(columnCount<2||columnCount>128))throw Error('名单工作表须有2–128列');
            const matrix=[];let rosterColumns;
            sheet.eachRow((row,n)=>{
              if(matrix.length>=501)throw Error('工作表超过500个人员行');
              if(workerData.columns===2&&!matrix.length){const candidates={student_number:[],name:[]};row.eachCell((cell,c)=>{const key=aliases[cell.text.trim()]||cell.text.trim();if(candidates[key])candidates[key].push(c);});if(candidates.student_number.length!==1||candidates.name.length!==1)throw Error('名单必须有唯一学号和姓名列');rosterColumns=[candidates.student_number[0],candidates.name[0]];}
              if(workerData.columns===5)row.eachCell((cell,c)=>{if(c>5&&cell.value!=null)throw Error('工作表存在要求列数之外的非空数据，请先核对列');});
              const values=[];let issue=false;
              for(let c=1;c<=columnCount;c++){
                const cell=row.getCell(rosterColumns?rosterColumns[c-1]:c),v=cell.value;let text='';
                if(cell.isMerged)issue=true;
                if(v instanceof Date){text=v.toISOString().slice(0,10);if(matrix.length&&matrix[0][c-1]!=='test_date')issue=true;}
                else if(typeof v==='string'||typeof v==='number') {text=String(v);if(typeof v==='number'&&(!Number.isFinite(v)||Math.abs(v)>Number.MAX_SAFE_INTEGER))issue=true;}
                else if(v&&typeof v==='object'&&v.richText)text=v.richText.map(x=>x.text).join('');
                else if(v!=null){text=cell.text;issue=true;}
                if(!matrix.length)text=workerData.columns==='ROSTER_MAPPING'?text.trim():(aliases[text.trim()]||text.trim());
                values.push(text);
              }
              if(matrix.length&&workerData.columns===2&&values.every(v=>!v.trim())){values[0]='[待核对：缺少学号与姓名]';issue=true;}
              if(!matrix.length&&issue)throw Error('表头含公式或合并单元格，须先明确字段');
              matrix.push(values);out.rowNumbers.push(n);if(issue)out.issues.push(matrix.length);
            });
            if(matrix.length<2)throw Error('工作表没有人员行');
            out.csv=matrix.map(r=>r.map(v=>'"'+v.replaceAll('"','""')+'"').join(',')).join('\\n');
            if(out.csv.length>200000)throw Error('提取文本超过200,000字符，请分批核对');
          }catch(e){out.error=e.message;out.csv='';}
          return out;
        });parentPort.postMessage({sheets:results});
      })().catch(e=>parentPort.postMessage({error:e.message}));
    `,
      {
        eval: true,
        workerData: {
          bytes,
          columns,
          modulePath: createRequire(import.meta.url).resolve("exceljs"),
        },
        resourceLimits: { maxOldGenerationSizeMb: 512 },
      },
    );
    const timer = setTimeout(() => {
      void worker.terminate();
      reject(
        new ServiceError(
          422,
          "WORKBOOK_TIMEOUT",
          "工作簿解析超时，请拆分后重试。",
        ),
      );
    }, 30000);
    const fail = () => {
      clearTimeout(timer);
      void worker.terminate();
      reject(
        new ServiceError(
          422,
          "WORKBOOK_INVALID",
          "无法解析XLSX，请检查文件格式、加密或文件大小。",
        ),
      );
    };
    worker.once("error", fail);
    worker.once(
      "message",
      (message: { sheets?: WorkbookSheet[]; error?: string }) => {
        clearTimeout(timer);
        void worker.terminate();
        if (message.sheets) resolve(message.sheets);
        else fail();
      },
    );
    worker.once("exit", (code) => {
      if (code !== 0) fail();
    });
  });
}
export function workbookAccess(
  repo: Repository,
  token: string,
  courseId: unknown,
) {
  const actor = authenticate(repo.db, token);
  sportsWriteGate(repo, "sports.endurance.import");
  const course = ownedCourse(repo, actor, courseId);
  demand(
    course.data.status === "PUBLISHED" &&
      course.data.settlementStatus !== "SETTLED" &&
      repo.get(course.data.semesterId, "sportsSemester").data.status !==
        "ARCHIVED",
    "当前课程不接受新体测导入。",
    409,
  );
  return actor;
}
export async function uploadWorkbook(
  repo: Repository,
  token: string,
  courseId: string,
  bytes: Buffer,
) {
  workbookAccess(repo, token, courseId);
  const hash = createHash("sha256").update(bytes).digest("hex");
  const sheets = await parseWorkbook(bytes);
  return transaction(repo.db, () => {
    const actor = workbookAccess(repo, token, courseId);
    const prior = repo
      .all("sportsEnduranceSource")
      .find(
        (s) =>
          s.ownerId === actor.id &&
          s.data.courseId === courseId &&
          s.data.sha256 === hash,
      );
    if (prior) return prior;
    repo.db
      .prepare(
        "INSERT OR IGNORE INTO sports_media_blobs(sha256,bytes,created_at) VALUES(?,?,?)",
      )
      .run(hash, bytes, timestamp());
    const source = repo.create("sportsEnduranceSource", actor.id, {
      courseId,
      sha256: hash,
      size: bytes.length,
      sheets,
      acceptedEnrollmentIds: repo
        .all("sportsEnrollment")
        .filter(
          (m) => m.data.courseId === courseId && m.data.status === "ACTIVE",
        )
        .map((m) => m.id),
    });
    repo.db
      .prepare(
        "INSERT INTO audit(id,actor_id,role,action,entity_id,reason,data,created_at) VALUES(?,?,?,?,?,?,?,?)",
      )
      .run(
        randomUUID(),
        actor.id,
        "teacher",
        "sports.endurance.upload",
        source.id,
        "XLSX原始成绩单已受理",
        JSON.stringify({ sha256: hash, size: bytes.length }),
        timestamp(),
      );
    return source;
  });
}
