import * as t from '@effect-ts/schema';
import * as P from '@effect-ts/schema/Parser';
import {
  FieldError,
  FieldValues,
  ResolverOptions,
  ResolverResult,
  UnpackNestedValue,
} from 'react-hook-form';

export type Resolver = <T, TFieldValues, TContext>(
  codec: P.Parser<FieldValues, t.AnyError, T>,
) => (
  values: UnpackNestedValue<TFieldValues>,
  _context: TContext | undefined,
  options: ResolverOptions<TFieldValues>,
) => ResolverResult<TFieldValues>;

export type ErrorObject = Record<string, FieldError>;
export type FieldErrorWithPath = FieldError & { path: string };
