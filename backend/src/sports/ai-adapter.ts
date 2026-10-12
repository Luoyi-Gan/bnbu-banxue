import { demand } from '../auth';
import type { Entity, Fields } from '../repository';
import type { AiConnection } from './review-worker';
export async function callSportsAi(connection:AiConnection,record:Entity,batch:Entity,task:Entity,materials:Fields[]):Promise<Fields> {
        const url = new URL(connection.url!);
        demand(
          url.protocol === "https:" ||
            (url.protocol === "http:" &&
              ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname)),
          "AI地址须为HTTPS或本地测试服务。",
        );
        const response = await fetch(url, {
          method: "POST",
          redirect: "error",
          signal: AbortSignal.timeout(20000),
          headers: {
            "Content-Type": "application/json",
            ...(connection.token
              ? { Authorization: `Bearer ${connection.token}` }
              : {}),
          },
          body: JSON.stringify({
            requestId: task.data.requestId,
            recordId: record.id,
            recordVersion: record.version,
            batchId: batch.id,
            batchVersion: batch.version,
            validationRef: connection.validationRef,
            description: record.data.description,
            category: record.data.category,
            activityType: record.data.activityType,
            ruleSnapshot: record.data.ruleSnapshot,
            materials,
          }),
        });
        demand(
          response.ok &&
            response.headers.get("content-type")?.includes("application/json"),
          "AI响应无效。",
        );
        // Stream-bound the response; never read an unbounded upstream body into memory.
        const reader = response.body?.getReader();
        demand(reader, "AI响应为空。");
        const chunks: Uint8Array[] = [];
        let size = 0;
        while (true) {
          const next = await reader.read();
          if (next.done) break;
          size += next.value.length;
          if (size > 65536) {
            await reader.cancel();
            throw new Error("AI response too large");
          }
          chunks.push(next.value);
        }
        const value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        demand(
          value &&
            typeof value === "object" &&
            value.requestId === task.data.requestId &&
            value.recordId === record.id &&
            value.recordVersion === record.version &&
            value.batchId === batch.id &&
            value.batchVersion === batch.version,
          "AI对象或版本不匹配。",
        );
        demand(
          value.checksCompleted === true &&
            ["NORMAL", "EXCEPTION"].includes(value.outcome) &&
            typeof value.modelVersion === "string" &&
            value.modelVersion.length > 0 &&
            value.modelVersion.length <= 100,
          "AI未完成必要检查。",
        );
        return {
          outcome: value.outcome,
          modelVersion: value.modelVersion,
          validationRef: connection.validationRef,
        };
}
