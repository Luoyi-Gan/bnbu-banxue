import type { Repository } from '../repository';

type Methods = Omit<Repository, 'db'>;
export type BusinessRepository = {
  [K in keyof Methods]: Methods[K] extends (...args: infer A) => infer R ? (...args: A) => R | Promise<R> : never;
};

/** One policy implementation, driven by either a synchronous or asynchronous store. */
export function* effect<T>(value: T | Promise<T>): Generator<unknown,T,unknown> {
  return (yield value) as T;
}
export function runSync<T>(policy: Generator<unknown,T,unknown>): T {
  let step = policy.next();
  while (!step.done) {
    if (step.value instanceof Promise) throw new Error('Async storage requires runAsync');
    step = policy.next(step.value);
  }
  return step.value;
}
export async function runAsync<T>(policy: Generator<unknown,T,unknown>): Promise<T> {
  let step = policy.next();
  while (!step.done) {
    let value: unknown;
    try { value = await step.value; }
    catch(error) { step = policy.throw(error); continue; }
    step = policy.next(value);
  }
  return step.value;
}
