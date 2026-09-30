import { resolveOptions } from '../resolveOptions';

describe(resolveOptions, () => {
  it(`defaults to development`, () => {
    expect(resolveOptions({})).toEqual({ mode: 'development' });
  });

  it(`uses development for --dev`, () => {
    expect(resolveOptions({ dev: true })).toEqual({ mode: 'development' });
  });

  it(`rejects --dev with --prod`, () => {
    expect(() => resolveOptions({ dev: true, prod: true })).toThrow(
      'Specify at most one of: --dev, --prod'
    );
  });

  it(`rejects --prod`, () => {
    expect(() => resolveOptions({ prod: true })).toThrow('--prod is not supported yet.');
  });
});
