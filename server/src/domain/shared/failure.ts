/**
 * An expected failure, returned inside an `Err` result rather than thrown.
 *
 * Create failures with small factory functions next to the error enum they
 * belong to, so every failure of a given type has the same reason.
 *
 * @example
 * export const groupNameEmptyFailure =
 *   (): Failure<GiftExchangeGroupError.GroupNameEmpty> => ({
 *     type: GiftExchangeGroupError.GroupNameEmpty,
 *     reason: 'Group name cannot be empty',
 *   });
 */
export interface Failure<FailureType extends string> {
  /**
   * A string literal from an error enum, such as `GiftExchangeGroupError`.
   * Callers switch on it, and the HTTP layer maps it to a status code.
   */
  type: FailureType;
  /** A human-readable explanation that is safe to show to API clients. */
  reason: string;
}
