// FIXME: remove when @apollo/client expose DeepPartial
import type { Primitive } from "@apollo/client/utilities/types/Primitive.js"

type DeepPartialPrimitive = Primitive | Date | RegExp
export type DeepPartial<T> = T extends DeepPartialPrimitive
  ? T
  : T extends Map<infer TKey, infer TValue>
    ? DeepPartialMap<TKey, TValue>
    : T extends ReadonlyMap<infer TKey, infer TValue>
      ? DeepPartialReadonlyMap<TKey, TValue>
      : T extends Set<infer TItem>
        ? DeepPartialSet<TItem>
        : T extends ReadonlySet<infer TItem>
          ? DeepPartialReadonlySet<TItem>
          : T extends (...args: unknown[]) => unknown
            ? T | undefined
            : T extends object
              ? T extends ReadonlyArray<infer TItem>
                ? TItem[] extends T
                  ? readonly TItem[] extends T
                    ? ReadonlyArray<DeepPartial<TItem | undefined>>
                    : Array<DeepPartial<TItem | undefined>>
                  : DeepPartialObject<T>
                : DeepPartialObject<T>
              : unknown
export type DeepPartialObject<T extends object> = {
  [K in keyof T]?: DeepPartial<T[K]>
}
