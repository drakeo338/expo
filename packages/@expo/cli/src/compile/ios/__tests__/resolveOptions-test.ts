import { vol } from 'memfs';

import { resolveOptions } from '../resolveOptions';

describe(resolveOptions, () => {
  afterEach(() => vol.reset());

  it(`defaults to development`, () => {
    vol.fromJSON({ 'ios/App.xcodeproj': '' }, '/app');

    expect(resolveOptions('/app', {})).toEqual({
      mode: 'development',
      xcodeProject: { name: '/app/ios/App.xcodeproj', isWorkspace: false },
    });
  });

  it(`uses development for --dev`, () => {
    vol.fromJSON({ 'ios/App.xcodeproj': '' }, '/app');

    expect(resolveOptions('/app', { dev: true })).toEqual({
      mode: 'development',
      xcodeProject: { name: '/app/ios/App.xcodeproj', isWorkspace: false },
    });
  });

  it(`rejects --dev with --prod`, () => {
    expect(() => resolveOptions('/app', { dev: true, prod: true })).toThrow(
      'Specify at most one of: --dev, --prod'
    );
  });

  it(`rejects --prod`, () => {
    expect(() => resolveOptions('/app', { prod: true })).toThrow('--prod is not supported yet.');
  });
});
