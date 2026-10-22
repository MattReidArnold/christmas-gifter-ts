/** The success side of a {@link Result}, carrying the produced `value`. */
export type Ok<T> = { readonly ok: true; readonly value: T };

/** The failure side of a {@link Result}, carrying the expected `error`. */
export type Err<E> = { readonly ok: false; readonly error: E };

/**
 * The outcome of an operation that can fail in an expected way, such as a
 * validation error or a missing record. Return it instead of throwing;
 * reserve exceptions for unexpected problems like a database outage.
 *
 * Check `ok` before reading the outcome. TypeScript then narrows the type,
 * so `value` is only available on success and `error` only on failure.
 * To pass a failure up to your caller, return the result unchanged.
 *
 * Nothing forces a caller to check a result, so always handle it.
 *
 * Usually paired with `Failure` (see `failure.ts`) as
 * `Result<T, Failure<SomeError>>`.
 * See `README.md` in this folder for more patterns.
 *
 * @example
 * const result = group.addParticipant({ id, name, exclusions });
 * if (!result.ok) {
 *   return result; // pass the failure up unchanged
 * }
 * const savedGroup = await groupRepository.update(result.value);
 */
export type Result<T, E> = Ok<T> | Err<E>;

/**
 * Builds a successful {@link Result}. Use `ok(undefined)` for an operation
 * that succeeds without producing a value.
 *
 * @example
 * return ok(new GiftExchangeGroup({ name, participants: [], members }));
 */
export const ok = <T>(value: T): Ok<T> => ({ ok: true, value });

/**
 * Builds a failed {@link Result} from an expected error, usually a
 * `Failure` created by a factory such as `groupNotFoundFailure()`.
 *
 * @example
 * return group ? ok(group) : err(groupNotFoundFailure());
 */
export const err = <E>(error: E): Err<E> => ({ ok: false, error });
