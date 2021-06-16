import * as Either from '@effect-ts/core/Either';
import { pipe } from '@effect-ts/core/Function';

const arrayToPath = (paths: readonly Either.Either<string, number>[]): string =>
  paths.reduce(
    (previous, path, index) =>
      pipe(
        path,
        Either.fold(
          (key) => `${index > 0 ? '.' : ''}${key}`,
          (key) => `[${key}]`,
        ),
        (path) => `${previous}${path}`,
      ),
    '',
  );

export default arrayToPath;
