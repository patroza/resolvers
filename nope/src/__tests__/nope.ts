/* eslint-disable no-console, @typescript-eslint/ban-ts-comment */
import { nopeResolver } from '..';
import { schema, validData, fields, invalidData } from './__fixtures__/data';

describe('nopeResolver', () => {
  it('should return values from nopeResolver when validation pass', async () => {
    const schemaSpy = jest.spyOn(schema, 'validate');

    const result = await nopeResolver(schema)(validData, undefined, {
      fields,
    });

    expect(schemaSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ errors: {}, values: validData });
  });

  it('should return a single error from nopeResolver when validation fails', async () => {
    const result = await nopeResolver(schema)(invalidData, undefined, {
      fields,
    });

    expect(result).toMatchSnapshot();
  });
});
