import { demand } from "./auth";
import type { Entity, Fields } from "./repository";

export function version(entity: Entity, input: Fields) {
  demand(input.version === entity.version, "记录已变化，请刷新后重试。", 409);
}
