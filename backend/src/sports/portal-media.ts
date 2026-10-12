import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { demand, type Account } from "../auth";
import { Repository, type Fields } from "../repository";
import { readApplicationAsset } from "./applications";

// Ephemeral links are bound to the signed-in account and expire after five
// minutes. Restarting the server invalidates links, not the stored evidence.
const secret = randomBytes(32);
const sign = (id: string, accountId: string, expires: number) =>
  createHmac("sha256", secret)
    .update(JSON.stringify([id, accountId, expires]))
    .digest("hex");
export function portalProofAccess(
  repo: Repository,
  actor: Account,
  id: string,
  input: Fields,
) {
  demand(
    Object.keys(input).length === 1 && input.purpose === "VIEW_ORIGINAL",
    "证明访问用途无效。",
  );
  readApplicationAsset(repo, actor, id);
  const expires = Date.now() + 5 * 60000;
  return {
    mediaId: id,
    expiresAt: new Date(expires).toISOString(),
    accessUrl: `/api/v1/media/${encodeURIComponent(id)}/content?expires=${expires}&signature=${sign(id, actor.id, expires)}`,
  };
}
export function portalProofRead(
  repo: Repository,
  actor: Account,
  id: string,
  input: Fields,
) {
  demand(
    Object.keys(input).every((key) => ["expires", "signature"].includes(key)),
    "证明访问参数无效。",
  );
  const expires = Number(input.expires),
    signature = String(input.signature ?? "");
  demand(
    Number.isSafeInteger(expires) &&
      expires > Date.now() &&
      /^[a-f0-9]{64}$/.test(signature),
    "证明链接已失效，请重新打开。",
    403,
  );
  demand(
    timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(sign(id, actor.id, expires), "hex"),
    ),
    "证明链接无效。",
    403,
  );
  return readApplicationAsset(repo, actor, id);
}
