import { ioTsResolver } from '..';
import { schema, validData, fields, invalidData } from './__fixtures__/data';

describe('ioTsResolver', () => {
  it('should return values from ioTsResolver when validation pass', async () => {
    const validateSpy = jest.spyOn(schema, 'decode');

    const result = ioTsResolver(schema)(validData, undefined, {
      fields,
    });

    expect(validateSpy).toHaveBeenCalled();
    expect(result).toEqual({ errors: {}, values: validData });
  });

  it('should return a single error from ioTsResolver when validation fails', () => {
    const result = ioTsResolver(schema)(invalidData, undefined, {
      fields,
    });

    expect(result).toMatchSnapshot();
  });

  it('should return all the errors from ioTsResolver when validation fails with `validateAllFieldCriteria` set to true', () => {
    const result = ioTsResolver(schema)(invalidData, undefined, {
      fields,
      criteriaMode: 'all',
    });

    expect(result).toMatchSnapshot();
  });
});
