import * as t from "@effect-ts/schema"
import * as TUP from "@effect-ts/core/Collections/Immutable/Tuple"
import { absurd, flow, identity, not, pipe } from '@effect-ts/core/Function';
import * as ReadonlyArray from '@effect-ts/core/Collections/Immutable/Array';
import * as Option from '@effect-ts/core/Option';
import * as Either from '@effect-ts/core/Either';
//import * as Assoc from '@effect-ts/core/Associative';
import arrayToPath from './arrayToPath';
import * as ReadonlyRecord from '@effect-ts/core/Collections/Immutable/Dictionary';
import { ErrorObject, FieldErrorWithPath } from './types';
import { makeClosure } from "@effect-ts/core/Closure";
import { AnyError } from "@effect-ts/schema";

const formatErrorPath = (context: t.Context): string =>
  pipe(
    context,
    ReadonlyArray.filterMapWithIndex((index, contextEntry) => {
      const previousIndex = index - 1;

      const shouldBeFiltered =
        context[previousIndex] === undefined ||
        context[previousIndex].type instanceof TaggedUnionType ||
        context[previousIndex].type instanceof UnionType ||
        context[previousIndex].type instanceof IntersectionType;

      return shouldBeFiltered ? Option.none : Option.some(contextEntry);
    }),
    ReadonlyArray.map(({ key }) => key),
    ReadonlyArray.map((key) =>
      pipe(
        key,
        (k) => parseInt(k, 10),
        Either.fromPredicate(not<number>(Number.isNaN), () => key),
      ),
    ),
    ReadonlyArray,
    arrayToPath,
  );

function formatErrors(e: t.AnyError) {
  // TODO
  return [formatError(e)]
}

const formatError = (e: t.AnyError): FieldErrorWithPath => {
  const path = formatErrorPath(e.context);

  const message = pipe(
    e.message,
    Either.fromNullable(e.context),
    Either.mapLeft(
      flow(
        ReadonlyArray.last,
        Option.map(
          (contextEntry) =>
            `expected ${contextEntry.type.name} but got ${JSON.stringify(
              contextEntry.actual,
            )}`,
        ),
        Option.getOrElseW(() =>
          absurd<string>('Error context is missing name' as never),
        ),
      ),
    ),
    Either.getOrElse(identity),
  );

  const type = pipe(
    e.context,
    ReadonlyArray.last,
    Option.map((contextEntry) => contextEntry.type.name),
    Option.getOrElse(() => 'unknown'),
  );

  return { message, type, path };
};

// Either.getValidationApplicative ?

// this is almost the same function like Semigroup.getObjectSemigroup but reversed
// in order to get the first error
// const getObjectSemigroup = <
//   A extends Record<string, unknown> = never,
// >(): SemiGroup.Semigroup<A> => ({
//   concat: (first, second) => Object.assign({}, second, first),
// });

const concatToSingleError = (
  errors: ReadonlyArray<FieldErrorWithPath>,
): ErrorObject =>
  errors.reduce((prev, error) => {
    // first only.
    if (!prev[error.path]) {
      prev[error.path] = {
        type: error.type,
        message: error.message,
      }
    }
    return prev
  }, {} as Record<string, { type: string, message: string | undefined}>)
// pipe(
//   errors,
//   ReadonlyArray.map((error) => ({
//     [error.path]: {
//       type: error.type,
//       message: error.message,
//     },
//   })),
//   (errors) => SemiGroup.fold(getObjectSemigroup<ErrorObject>())({}, errors),
// );

// const appendSeveralErrors: SemiGroup.Semigroup<FieldErrorWithPath> = {
//   concat: (a, b) => ({
//     ...b,
//     types: { ...a.types, [a.type]: a.message, [b.type]: b.message },
//   }),
// };

const concatToMultipleErrors = (
  errors: ReadonlyArray<FieldErrorWithPath>,
): ErrorObject =>
  pipe(
    errors,
    ReadonlyRecord.fromFoldableMap(makeClosure<FieldErrorWithPath>((a, b) => ({
      ...b,
      types: { ...a.types, [a.type]: a.message, [b.type]: b.message },
    })), ReadonlyArray.Foldable)(
      (error) => TUP.fromNative([error.path, error]),
    ),
    ReadonlyRecord.map((errorWithPath) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { path, ...error } = errorWithPath;

      return error;
    }),
  );

const errorsToRecord =
  (validateAllFieldCriteria: boolean) =>
    (validationErrors: AnyError): ErrorObject => {
      const concat = validateAllFieldCriteria
        ? concatToMultipleErrors
        : concatToSingleError;

      return pipe(formatErrors(validationErrors), concat);
    };

export default errorsToRecord;
