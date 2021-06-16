import * as Either from '@effect-ts/core/Either';
import * as These from '@effect-ts/schema/These';
import { pipe } from 'fp-ts/function';
import { toNestError } from '@hookform/resolvers';
import errorsToRecord from './errorsToRecord';
import { Resolver } from './types';

export const schemaResolver: Resolver = (codec) => (values, _context, options) =>
  pipe(
    values,
    codec,
    These.mapError(errorsToRecord(options.criteriaMode === 'all')),
    These.mapError((errors) => toNestError(errors, options.fields)),
    These.result,
    Either.fold(
      (errors) => ({
        values: {},
        errors,
      }),
      (values) => ({
        values,
        errors: {},
      }),
    ),
  );
